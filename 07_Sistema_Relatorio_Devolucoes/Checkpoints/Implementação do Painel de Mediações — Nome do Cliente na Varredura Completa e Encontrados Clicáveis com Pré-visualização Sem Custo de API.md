---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: implementado
criado: 20/09/2026
atualizado_em: 20/09/2026 11:12
relacionado: [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]], [[Auditoria do Painel de Mediações — Funções, Fluxo UX e Lacunas Encontradas no Código Atual]]
resumo: Implementação real (não mais idealização) de 2 pedaços do Painel de Mediações — nome do cliente/produto passa a ser buscado pra todo item da varredura completa (decisão que supera a idealização anterior, +1 chamada de API por item, ~3min a mais pra 6 meses de dados), validado contra uma rodada real em produção (~3min7s/79 itens, incluindo 1 timeout de API absorvido sem quebrar o loop); e cards de "Encontrados pelo Sistema" tornados clicáveis, com pré-visualização sem custo de API por padrão (refactor de atualizar_e_formatar_mensagens em 3 funções, nova rota mediacoes_ml_encontrado, ?atualizar=1 como único jeito de forçar busca nova), mesmo padrão visual de "Em Acompanhamento". Mockup v4 aprovado antes do código. Ajuste de largura da coluna (360px→420px) e fix de busca no JS que não alcançava "Encontrados". Bug de bloco duplicado no template encontrado e corrigido na verificação pós-deploy, mas a correção acabou removendo por engano o else do "Painel Geral" — 2ª correção proposta e confirmada aplicada (commit 5937d09). Auditoria completa do código atual feita em seguida, ver nota própria.
---

# Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API

Continuação de [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]], que tinha fechado a idealização sem nada implementado. Esta conversa cobriu a implementação real de 2 pedaços da feature — nome do cliente/produto pra todo item da varredura, e "Encontrados pelo Sistema" clicável com pré-visualização — mais a validação contra uma rodada real em produção e a correção de um bug encontrado na verificação pós-deploy.

## Mockup v4 — pré-visualização de "Encontrados" sem precisar "Acompanhar" primeiro

Extensão do mockup interativo já aprovado (ver nota de idealização), demonstrando a nova interação: clicar num card de "Encontrados pelo Sistema" abre um painel de detalhe ao lado, mostrando a conversa já cacheada, sem nenhum custo de API — só quando Ana decide "Acompanhar" de verdade é que o item vira `Devolucao`/`MediacaoAvulsa`. Reaproveitou as cores/classes reais do projeto e o mesmo esquema de bolha de chat (ml=vermelho/você=azul/cliente=neutro) da tela de produção. Republicado como Artifact na mesma URL (https://claude.ai/artifact/DhkLeh4DBWqfSbJShvQ5aS), virando "Version 4". Aprovado por Matheus antes de qualquer código real.

## Decisão que supera a idealização: nome do cliente/produto pra todo item da varredura

A nota de idealização tinha fechado que nome do cliente/produto só seriam buscados quando um item virasse "Em Acompanhamento" (ver seção correspondente lá, agora marcada como superada). Matheus revisitou essa decisão nesta conversa: perguntou se seria "muito pesado" já puxar nome do cliente e todos os outros dados durante a varredura completa, e depois de ver os números decidiu que sim, vale puxar tudo de uma vez — facilita a vida da Ana (nome real em vez de "Claim X · cliente ainda não identificado") e permite busca por nome também em "Encontrados". Custo aceito: mais 1 chamada de API por item (~0,5–0,7s), estendendo a varredura de ~1min40s pra ~2min30-40s numa amostra de ~79 itens — "são só 3min pra 6 meses de dados, é uma troca justa".

## Implementação — parte 1: nome do cliente/produto na varredura completa

- Campos novos `nome_cliente`/`nome_produto` (`CharField`, `blank=True`) no model `ClaimMercadoLivre`, mesmo padrão de `MediacaoAvulsa` — migration `0021_claimmercadolivre_nome_cliente_and_more` aplicada nas 2 bases.
- `executar_varredura_completa` passou a chamar `buscar_nome_cliente_e_produto` (já existia, antes só usada em `acompanhar_claim`) pra cada item do loop — best-effort (nunca levanta exceção, devolve `('', '')` em qualquer falha) e **não conta** em `itens_nao_confirmados`, mesmo espírito de quem já usa essa função.
- **Validado contra uma rodada real em produção**: log de varredura completa (10:08–10:11, ~3min7s pra 79 itens) revisado em busca de qualquer coisa fora do esperado. Achou 1 timeout real (`Timeout em GET /orders/...`) — confirmado como não-problema: o retry de `chamar_api` (até 5 tentativas) e o fallback silencioso de `buscar_nome_cliente_e_produto` absorveram o erro sem quebrar o loop, a varredura seguiu pro próximo item normalmente. Resto do log (vários 404 em `/returns`, alguns backoffs de 429) é ruído esperado, já documentado.

## Implementação — parte 2: "Encontrados" clicáveis e pré-visualização sem custo de API

Depois da varredura já trazendo nomes reais, Matheus pediu pra tornar os cards de "Encontrados" clicáveis, no mesmo padrão já usado em "Em Acompanhamento" (`div` + link interno cobrindo foto/corpo + form separado só pra estrela, já que botão/form não aninha dentro de `<a>`).

- **Refactor de `atualizar_e_formatar_mensagens`** em 3 funções: `_formatar_mensagens` (pura, só formatação, sem chamada de API), `atualizar_e_formatar_mensagens` (comportamento original inalterado — busca fresca + formata), e `formatar_mensagens_em_cache` (nova — formata só o que já está salvo em `cache.mensagens`, zero chamadas de API). Esse split é o que permite a pré-visualização abrir sem custo nenhum por padrão.
- **Rota nova** `mediacoes/encontrado/<str:claim_id>/` → `mediacoes_ml_encontrado`, reaproveitando a mesma view `mediacoes_ml` com um 3º kwarg opcional (`claim_id=None`), mesmo padrão de `devolucao_id`/`avulsa_id`. Monta um dict próprio `claim_previsualizado` (não reaproveita `mediacao_selecionada`, porque `ClaimMercadoLivre` não tem os campos específicos de Devolucao/MediacaoAvulsa que o resto do template grande depende).
- **Pré-visualização sem custo por padrão**: abrir um item de "Encontrados" chama `formatar_mensagens_em_cache` (0 chamadas de API) — só quando Ana clica em "Atualizar" (`?atualizar=1` na URL) é que roda `atualizar_e_formatar_mensagens` (1 chamada nova), mesmo princípio "ela já pagou por essas mensagens, reabrir não deveria custar de novo" decidido pro refresh de chat de "Em Acompanhamento".
- **Template**: novo painel de detalhe (`vd-cartao`) pro `claim_previsualizado` — produto, pedido, cliente, badges de categoria, links "Ver pedido no ML"/"Ver reclamação no ML", botão "Acompanhar este item" (reaproveitando `vd-btn dp-btn--principal`, já que `.vd-btn` e `.dp-btn` têm o mesmo box model mas só `.dp-btn--principal` existia), aviso explicando que é pré-visualização sem custo, e a mesma conversa de chat já usada em "Em Acompanhamento".

## Ajuste visual e fix de busca

- `.med-shell` (`grid-template-columns`) de `360px 1fr` pra `420px 1fr` — coluna da lista mais larga, resolvendo o corte agressivo de nomes de produto longos.
- `.med-item-rodape` ganhou `flex-wrap: wrap` — corrigia a barra de rolagem horizontal que aparecia quando pedido + cliente + 2 badges não cabiam numa linha só.
- **Bug de busca descoberto nesta conversa**: `script_mediacoes_ml.js` só buscava em `.med-item` (dentro de `.dp-tab-panel`), nunca alcançava `.med-enc-item` (os itens de "Encontrados", que vivem dentro de um `.med-grupo` recolhido). Corrigido nos 2 `querySelectorAll` (`itensQueBatem` e `atualizarTudo`) pra incluir `.med-enc-item`, mais lógica de auto-expandir o grupo "Encontrados" quando a busca acha algo lá dentro (mesmo princípio do auto-troca de aba já existente).

## Bug na verificação pós-deploy — bloco duplicado no template

Na aplicação manual do diff acima, o bloco `{% elif claim_previsualizado %}` (o card de pré-visualização inteiro) acabou colado 2x seguidas no template, antes do `{% else %}` do "Painel Geral" — sintaticamente válido (Django aceita múltiplos `elif`), mas a 2ª cópia virava código morto (a 1ª sempre "ganhava"). Encontrado na verificação linha a linha do diff aplicado ("sincronize e verifique").

**Ao corrigir, surgiu um 2º bug**: Matheus removeu a cópia duplicada, mas junto foi embora por engano o `{% else %}` que ligava esse bloco ao card "Painel Geral" — quebrando 2 cenários (Painel Geral em branco quando nada está selecionado; Painel Geral empilhado junto do card de pré-visualização quando um item de "Encontrados" está selecionado). Correção proposta (reinserir só o `{% else %}`) — **confirmada aplicada (20/09 11:12)**, verificado via `sincronize`: commit `5937d09` bate exatamente com a correção proposta.

## Em aberto

Nenhum item pendente desta implementação — o `{% else %}` foi confirmado aplicado corretamente (20/09 11:12, commit `5937d09`). Auditoria completa do estado atual do código (funções, fluxo UX, lacunas) feita em seguida — ver [[Auditoria do Painel de Mediações — Funções, Fluxo UX e Lacunas Encontradas no Código Atual]].

## Relacionado

- [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]]
