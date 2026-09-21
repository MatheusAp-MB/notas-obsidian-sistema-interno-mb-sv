---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 20/09/2026
atualizado_em: 20/09/2026 20:03
relacionado: [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]], [[Código de Cores Unificado do Chat de Mediação — Mesma Paleta e Anexos nas Telas Mediações ML e Consultar Pedido]], [[Varredura Completa Travada na Samvale — Linha Singleton de StatusVarreduraMediacoes Nunca Semeada e Fix Autossuficiente]], [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
resumo: Matheus perguntou se a API do Mercado Livre expõe em algum lugar o prazo/tempo restante pra responder uma mensagem de mediação. Investigação empírica (não documentação, testado direto): o endpoint de listagem de claims (dados_brutos do cache) não tem nenhum campo de prazo; o endpoint de detalhe de 1 claim (GET .../claims/{claim_id}) tem, dentro de cada players[], um array available_actions com objetos {action, mandatory, due_date} — a estrutura que uma resposta do Gemini (colada por Matheus, tratada como hipótese não confiável até confirmar) descrevia corretamente — mas due_date veio null em 100% de 16 claims reais testados nas 2 contas (MB e SV). Conclusão: o campo existe na estrutura mas nunca é populado na prática, inviabilizando a API como fonte confiável. Matheus então propôs a própria solução: já que o Mercado Livre sempre informa o prazo em texto dentro da própria mensagem do chat ("você tem até o dia X pra responder"), um campo editável na tela registra isso manualmente, e o sistema constrói badges/filtro/alerta em cima dele. Implementado no mesmo dia (autorização explícita "tudo hoje temos tempo hoje ainda"): campo prazo_resposta (DateField) idêntico em Devolucao e MediacaoAvulsa (migração 0022), 4 properties calculadas (dias_ate_prazo_resposta, status_prazo_resposta com 4 estados vencido/hoje/proximo/ok, dias_desde_vencimento_prazo, prazo_urgente) e endpoint definir_prazo_resposta seguindo o padrão POST+redirect já usado em acompanhar_claim. Na tela Mediações ML: campo editável com badge de urgência no detalhe (reaproveitando .vd-badge/.vd-badge-prazo/--verde/--ambar/--vermelho, já existentes em layout_visualizar_devolucao.css pro badge de prazo da reclamação), badge equivalente na sidebar só pros 3 estados urgentes (reaproveitando a paleta de .dp-badge), alerta "N com prazo urgente" no cabeçalho do grupo "Em acompanhamento" e um 3º card no Painel Geral, e um filtro "Só prazo vencendo" que compõe (E lógico) com os chips de categoria já existentes — JS refatorado numa função compartilhada (aplicarFiltrosDoGrupo) pra isso. Testando a feature, achado e corrigido um problema relacionado mas separado: o banner de mensagens do Django (aviso-global, componente global usado em toda tela do sistema) nunca desaparecia sozinho — ganhou fechamento automático (sucesso/info, depois de 4s) e botão X manual (todos os tipos). Tudo confirmado funcionando por Matheus, testando os 4 estados de urgência com prints (vencido/hoje/próximo/ok trocando de cor certinho, alerta aparecendo e sumindo conforme o estado).
---

# Prazo de Resposta Manual na Mediação ML — Campo Editável, Badges de Urgência e Filtro, Já que o due_date da API Nunca Vem Preenchido

## O pedido — dá pra saber pela API o prazo de resposta?

Depois de fechar o código de cores unificado (ver [[Código de Cores Unificado do Chat de Mediação — Mesma Paleta e Anexos nas Telas Mediações ML e Consultar Pedido]]), Matheus levantou uma pergunta nova: "em algum lugar da API mostra o tempo que temos para responder a msg do mercado livre?". Pediu pra reunir tudo que desse pra saber num texto único, pra ele também procurar na documentação oficial e perguntar a outra IA (GPT) em paralelo.

## Investigação — empírica, não só documentação

Primeiro teste: o `dados_brutos` já salvo em `ClaimMercadoLivre` (resposta crua do endpoint de listagem, `GET /post-purchase/v1/claims/search`) — nenhum campo de prazo em lugar nenhum dessa estrutura.

Matheus colou uma resposta do Gemini afirmando que o prazo mora dentro de `players[].available_actions[].due_date`, no endpoint de **detalhe** de 1 claim (`GET /post-purchase/v1/claims/{claim_id}`), com um JSON de exemplo. Tratada como hipótese não confiável até confirmar — mesmo princípio de nunca aceitar afirmação de IA sobre a API do ML sem testar contra dado real.

Teste real, via shell do Django, buscando o detalhe de 16 claims abertas de verdade (as 2 contas, MB e SV): a estrutura que o Gemini descreveu **existia mesmo** — cada `players[]` tem `role` (`complainant`/`respondent`/`mediator`), `type` (`buyer`/`seller`/`internal`), `user_id` e `available_actions[]`, cada uma com `{action, mandatory, due_date}`. Ações reais observadas: `send_message_to_complainant`, `send_message_to_mediator`, `refund`, `open_dispute`, `return_review_fail`, `return_review_ok`, `return_review_unified_fail`, `return_review_unified_ok`.

**`due_date` veio `null` nas 16 amostras, sem exceção**, nas 2 contas. O campo existe na estrutura da API, mas nunca é populado na prática — inutilizável como fonte de dado pra essa feature.

## Decisão de Matheus — não depender da API

Matheus lembrou que o Mercado Livre sempre informa o prazo em **texto livre**, dentro da própria mensagem do chat ("você tem até o dia X para responder"), e propôs a solução ele mesmo: um campo editável na tela pra ela registrar essa data lendo a mensagem, e o sistema construir badges/filtros/alertas em cima desse campo. Confirmou pra construir o pacote inteiro no mesmo dia: "tudo hoje temos tempo hoje ainda".

## Implementação — model e migração

Campo `prazo_resposta` (DateField, `null=True, blank=True`) adicionado com o mesmo nome/comportamento em `Devolucao` e `MediacaoAvulsa` (migração `0022_devolucao_mediacaoavulsa_prazo_resposta`), seguindo o padrão já usado pra `mediacao_visualizada_em`/`claim_id` (migrações 0018/0019) — mesmo campo nos 2 models, pra tela tratar devolução-com-mediação e mediação avulsa igual, sem caso especial.

4 properties calculadas, idênticas nos 2 models:

```python
@property
def status_prazo_resposta(self):
    dias = self.dias_ate_prazo_resposta
    if dias is None:
        return None
    if dias < 0:
        return 'vencido'
    if dias == 0:
        return 'hoje'
    if dias <= 2:  # janela de "próximo" -- ajustável
        return 'proximo'
    return 'ok'
```

(`dias_ate_prazo_resposta`, `dias_desde_vencimento_prazo` e `prazo_urgente` — booleano `True` pros 3 estados urgentes — completam o conjunto.)

Endpoint `definir_prazo_resposta` (URLs `definir_prazo_resposta_devolucao`/`_avulsa`, 1 view só, igual ao padrão de `mediacoes_ml`) segue o mesmo estilo simples de `acompanhar_claim`: POST + redirect de volta pra mesma mediação, sem AJAX. Salvar com o campo em branco limpa o `prazo_resposta` (`= None`).

## UI — reaproveitando paleta já existente, sem inventar cor nova

No detalhe da mediação, o campo editável (input de data + botão salvar) ganhou um badge de urgência reaproveitando `.vd-badge`/`.vd-badge-prazo`/`--verde`/`--ambar`/`--vermelho` — classes que já existiam em `layout_visualizar_devolucao.css`, criadas pro badge "Dentro/Fora dos 7 dias" da tela Visualizar Devolução. Zero CSS novo nesse arquivo.

Na sidebar, badge equivalente reaproveitando a paleta de `.dp-badge` (mesmas cores de `dp-badge--mediacao-aberta`/`--aguardando`), mas só aparece pros 3 estados urgentes (vencido/hoje/próximo) — "ok" fica sem badge ali, pra não poluir a lista.

Alerta "N com prazo urgente" no cabeçalho do grupo "Em acompanhamento" e um 3º card (some quando não tem nada urgente) no Painel Geral — esse card veio de bônus: o texto da home já dizia "Indicadores de mensagem nova e prazo entram numa próxima etapa", então o texto foi ajustado pra não prometer algo que acabou de ser entregue.

Filtro "Só prazo vencendo" — chip avulso, fora do grupo de seleção única das categorias — compõe (E lógico) com o chip de categoria ativo. O JS de filtro foi refatorado numa função compartilhada (`aplicarFiltrosDoGrupo`) pra não duplicar a lógica de combinação entre o clique no chip e o clique no toggle; estado do toggle não é persistido no `sessionStorage` (decisão de escopo).

## Fix relacionado — aviso global preso na tela

Testando o "Salvar prazo" repetidas vezes (mesma tela, sem navegar pra outro lugar), Matheus notou que o banner de sucesso ("Prazo de resposta salvo.") nunca desaparecia — incômodo real. Investigação confirmou: `.aviso-global` (componente global, `estrutura_base_global.html`/`layout_global.css`/`script_global.js`, usado em toda tela do sistema) nunca teve fechamento nenhum, automático ou manual — só não incomodava antes porque as outras ações que usam esse banner redirecionam pra uma lista, não mantêm a pessoa na mesma tela.

Corrigido de forma global (vale pra qualquer mensagem do sistema, não só essa tela): sucesso/info somem sozinhos depois de 4s com fade; warning/error ficam até serem fechados manualmente (não deveriam sumir sozinhos); todos ganharam um botão X.

## Resultado confirmado

Matheus testou os 4 estados de `status_prazo_resposta` trocando a data no campo (vencido há 2 dias → vence hoje → vence em 1 dia → vence em 9 dias) e mandou prints de cada um: cor certa em cada transição (vermelho/vermelho/âmbar/verde), badge da sidebar aparecendo/sumindo conforme o estado, alerta do grupo "1 COM PRAZO URGENTE" aparecendo e sumindo junto, e confirmou também que salvar com o campo vazio remove o prazo ("Prazo de resposta removido."). Feature e fix do aviso global fechados e testados ponta a ponta no mesmo dia.
