---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_andamento
criado: 20/09/2026
atualizado_em: 20/09/2026 11:12
relacionado: [[Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API]], [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]]
resumo: Auditoria completa do código real da tela "Mediações ML" (views.py, varredura_mediacoes.py, urls.py, template, JS, CSS, models — tudo lido direto de origin/main, commit 5937d09), pedida por Matheus pra entender exatamente quais funções a tela cumpre hoje, o fluxo de uso da Ana e as dores/objetivos que cada uma resolve. Achado principal: 1 bug funcional real (busca por texto e filtro por chip de categoria não se combinam — cada um sobrescreve o display dos itens sem saber do outro). Resto dos achados é lacuna de produto (indicador de "mensagem nova" — campos já gravados, UI ainda não construída) e documentação desatualizada (3 lugares dizendo "ainda não implementado"/"próximo passo" pra coisas que já estão em produção). Mobile funciona (empilha em 1 coluna abaixo de 980px) mas é básico, sem rolagem automática até o detalhe.
---

# Auditoria do Painel de Mediações — Funções, Fluxo UX e Lacunas Encontradas no Código Atual

Pedido de Matheus: auditar o código atual da tela "Mediações ML" (não a idealização, não os diffs entregues — o que está de fato em `origin/main`), listando exatamente quais funções a tela cumpre, pensando no fluxo de UX e nas dores/objetivos da Ana, e separando o que já foi feito do que falta. Lido direto do repositório (`origin/main`, commit `5937d09` — já incluindo o fix do `{% else %}` confirmado em [[Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API]]).

## O que a tela resolve

A dor original da Ana: cada mediação aberta no Mercado Livre virava uma aba fixada do Chrome, acompanhada 1 por 1, manualmente. A tela junta 3 fontes numa lista só: `Devolucao` em mediação, `MediacaoAvulsa` (mediação sem devolução física registrada) e `ClaimMercadoLivre` (cache bruta de tudo que uma varredura já encontrou na API, independente de virar um dos outros 2).

## Anatomia da tela

**Coluna esquerda (lista, 420px fixos)**: busca por texto, 2 botões de varredura em segundo plano, abas Abertas/Encerradas, e dentro de "Abertas" 2 grupos — "Encontrados pelo sistema" (recolhido por padrão) e "Em acompanhamento" — cada um com 4 chips de filtro por categoria (Reclamação/+Mediação/+Devolução/+Mediação+Devolução).

**Coluna direita (detalhe)**: 3 estados mutuamente exclusivos — item de "Em Acompanhamento" selecionado (card completo: dados da mediação, motivo, conversa, ações), item de "Encontrados" selecionado (card de pré-visualização, mais enxuto, sem custo de API) ou nada selecionado ("Painel Geral", só 2 números + dica).

## Funções que a tela cumpre hoje, ligadas à dor que resolve

- **Tudo num lugar só, sem aba fixada** — lista unificada, com links diretos "Ver pedido no ML"/"Ver reclamação no ML"/"Ver mediação no ML" quando aplicável.
- **Achar rápido sem digitar o número inteiro** — busca por pedido, nome do cliente OU nome do produto, atravessando os 2 grupos e as 2 abas, com aviso "também encontrado em: Encerradas (2)" quando o termo bate fora da aba atual.
- **Ver o que ainda não decidi acompanhar, sem sujar o banco** — "Encontrados pelo Sistema" é 100% derivado da cache, nunca precisa virar registro permanente até ela decidir.
- **Decidir acompanhar sem perder o que já foi buscado** — clicar na estrela ou em "Acompanhar" nunca refaz a busca da API do zero; "Deixar de acompanhar" nunca apaga nada (reversível a qualquer momento).
- **Ver a conversa sem pagar de novo** — abrir um item de "Encontrados" mostra as mensagens já cacheadas, de graça; só o botão "Atualizar" busca de novo.
- **Rodar uma varredura de 6 meses sem travar a tela** — thread em segundo plano, banner de progresso com poll a cada 3s, sobrevive a F5/sair-e-voltar, e os 2 botões ficam desabilitados enquanto uma varredura roda.
- **Erro não pode parecer que travou** — banner de erro com texto 100% amigável (nunca mostra o erro técnico cru), fica na tela até ela fechar ou uma nova varredura começar.
- **Adicionar mediação que o sistema ainda não achou** — modal simples, só número do pedido.

## Fluxo de uso da Ana

Abre a tela → vê "Painel Geral" → digita um nome ou pedido na busca (ou navega pelos chips) → se o item está em "Encontrados", clica e vê a conversa sem custo, decide se vale acompanhar → clica "Acompanhar" (ou a estrela) → item migra pra "Em Acompanhamento" → abre de novo mais tarde, mensagens atualizam sozinhas (síncrono, ~0,6s) → quando resolve, o item sai da lista quando o relatório é marcado como impresso (Devolucao) ou quando ela apaga a mediação avulsa.

## Pontos fortes já resolvidos

- Nenhuma chamada de API "escondida" — cada custo é decisão explícita (varredura, "Atualizar", ou o refresh automático de 1 chat, já cronometrado e validado como barato).
- Nada destrutivo por engano — "Deixar de acompanhar" e a estrela nunca apagam registro; só "Excluir mediação avulsa" apaga de vez, e só essa tem confirmação (`window.confirm`) antes.
- Validado contra API real (log de produção revisado, timeout real absorvido sem quebrar o loop — ver nota de implementação).
- Responsiva — abaixo de 980px a tela empilha em 1 coluna (com ressalva, ver "Em aberto").

## Em aberto — gaps encontrados na auditoria

**Bug funcional real: busca de texto × chip de categoria se anulam.** Os 2 mecanismos escrevem no mesmo `item.style.display` sem saber um do outro: filtrar por um chip ("+ Mediação") e depois digitar um termo de busca faz a busca reaparecer itens de outra categoria que o chip tinha escondido — e vice-versa. Deveriam se combinar (E lógico), mas hoje quem rodou por último "ganha". `script_mediacoes_ml.js`, funções `atualizarTudo` (busca) e o listener de `[data-chips]` (categoria).

**Indicador de mensagem nova — dado pronto, UI pendente.** `mediacao_visualizada_em` e `mediacao_atualizada_em` já são gravados certinho a cada abertura/atualização (`devolucoes/views.py::mediacoes_ml`), mas nada no template/CSS compara os dois pra mostrar um badge/bolinha "tem novidade" na lista — o próprio texto do "Painel Geral" já avisa isso ("Indicadores de mensagem nova e prazo entram numa próxima etapa").

**Textos e `help_text` desatualizados (documentação, não bug):**
- No detalhe de "Em Acompanhamento" sem `claim_id`, o texto diz "...roda pela 1ª vez (próximo passo)" — mas essa busca (`resolver_claim_por_numero_pedido`) já está implementada.
- `help_text` do campo `claim_id`, em `Devolucao` E `MediacaoAvulsa`, ainda diz "preenchido automaticamente quando a busca de mensagens roda pela 1ª vez (ainda não implementada)" — idem, já implementado.
- `help_text` de `mediacao_atualizada_em` diz que só atualiza "no clique do botão Atualizar" — na prática, hoje atualiza toda vez que a Ana abre o item (não precisa clicar em nada).

**Mobile — funciona, mas é básico.** Abaixo de 980px a lista e o detalhe empilham na mesma página (`@media (max-width: 980px) { .med-shell { grid-template-columns: 1fr; } }`, única regra da media query), mas clicar num item recarrega a página do zero e a rolagem volta pro topo — no celular, ela precisaria descer manualmente passando a lista inteira pra ver a conversa que acabou de abrir. Não tem rolagem automática nem colapso pra "só detalhe".

**2 inconsistências visuais menores, a confirmar com Matheus (podem ser propositais):**
- O link "Ver mediação no ML" só aparece no card de "Em Acompanhamento" — o card de pré-visualização de "Encontrados" nunca mostra esse link, só "Ver pedido"/"Ver reclamação".
- Em "Em Acompanhamento", um item sem categoria resolvida (`None`, ainda não casado por nenhuma varredura) e um item genuinamente "Só reclamação" mostram o mesmo badge genérico "Aberta" — em "Encontrados" os 2 casos são distintos (sempre mostra "Só reclamação" quando aplicável).

## Relacionado

- [[Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API]]
- [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]]
