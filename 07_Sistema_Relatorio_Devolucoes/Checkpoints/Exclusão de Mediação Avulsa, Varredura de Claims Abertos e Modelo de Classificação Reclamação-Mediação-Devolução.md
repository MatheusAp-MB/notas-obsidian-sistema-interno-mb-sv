---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_andamento
criado: 20/09/2026
atualizado_em: 20/09/2026 06:44
relacionado: [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]], [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]], [[Stage Recontact É Documentado E Mediador Também Atua Em Dispute Ou Recontact]]
resumo: Exclusão de mediação avulsa implementada; varredura exploratória de claims abertos sem pedido conhecido criada e validada com dados reais (141 claims); modelo de classificação não-exclusiva (Reclamação/Mediação/Devolução) decidido e testado no console; bug de mascaramento de erro corrigido em 2 camadas, aplicado e verificado; cronometragem estendida às 5 etapas do fluxo completo (busca, devolução, classificação do claim, busca de mensagens, classificação das mensagens) — 192,05s pra 141 claims, busca de mensagens é a etapa mais cara (59% do tempo); related_entities e Agentes de Mensageria verificados contra doc oficial.
---

# Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução

Continuação de [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]]. Depois do Hub de Consulta validado, o trabalho seguiu em duas frentes: uma pequena (excluir mediações avulsas da tela) e uma exploratória maior (varrer a API do ML em busca de mediações que a Ana ainda não conhece).

## Exclusão de mediação avulsa — concluído

Adicionado botão de exclusão na tela Mediações ML, mas só pra `MediacaoAvulsa` — nunca `Devolucao` real, que tem peças/fotos/conferência associadas. Reaproveitou 100% do padrão visual já existente (`dp-btn`, `dp-btn--perigo`, `dp-form-inline`), com confirmação via `window.confirm()` antes de excluir. Precisou de um handler novo em `script_mediacoes_ml.js` porque o handler de confirmação existente (`dp-form-excluir`) só estava carregado em `script_devolucoes_pendentes.js`, de outra tela. Confirmado funcionando por Matheus.

## 3 decisões técnicas confirmadas (antes da varredura)

- Cache das mensagens de mediação buscadas na API: `JSONField`, no mesmo modelo (`Devolucao`/`MediacaoAvulsa`).
- Critério de "é mediação" corrigido: só `stage == "dispute"` faz trabalho de verdade — a metade "ou tem mediador nos players" do critério original é código morto, confirmado em [[Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]].
- Escopo do botão "Atualizar tudo": reclamações já encerradas não atualizam.

Nenhuma dessas 3 decisões foi implementada em produção ainda — a exploração da varredura entrou na frente antes do Passo 1.

## Varredura exploratória — script buscar_mediacoes_abertas_recentes.py

Matheus perguntou se dava pra escanear o Mercado Livre em busca de mediações em aberto que a Ana ainda nem sabe que existem, sem precisar de um pedido conhecido de antemão. Testado e confirmado que sim, usando o mesmo `chamar_api()` já validado no projeto (sem cliente HTTP novo, sem endpoint novo).

**O que o script faz**: busca `GET /post-purchase/v1/claims/search` sem `order_id`, usando `players.user_id` + `players.role` (testando `respondent` e `complainant`, porque `cancel_sale` fecha com os papéis invertidos — ver [[Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent]]), com `status=opened` e filtro de data `range=date_created:after:...,before:...` cobrindo só os últimos 6 meses (pedido explícito do Matheus, "pra não ficar pesado"). Contas MB e SV, paginado, deduplicado. Pra cada claim encontrado, chama `GET /post-purchase/v2/claims/{id}/returns` e trata 404 como "sem devolução física".

**Segurança/rate limit**: nenhuma chamada nova fora do `chamar_api()` existente — o espaçamento proativo (`EspacadorChamadas`, 0.4s por conta) e o backoff reativo em 429 (até 5 tentativas, respeitando `Retry-After`) já cobrem a varredura. Rodou de verdade com vários 429 reais no meio, todos absorvidos automaticamente sem falha.

**Resultado real (6 meses, MB+SV)**: 141 claims abertos no total — 79 MB, 62 SV. Tempo da fase de checagem de devolução: 1:11.

## Modelo de classificação — decidido e testado

Matheus decidiu que as categorias não são mutuamente exclusivas — um claim pode estar em mais de uma ao mesmo tempo. 4 combinações possíveis, a partir de 2 critérios independentes (`stage == "dispute"` pra mediação, `/returns` pra devolução física):

- Reclamação
- Reclamação + Mediação
- Reclamação + Devolução
- Reclamação + Mediação + Devolução

Por enquanto só console, sem tela — decisão explícita do Matheus pra não misturar exploração de dados com trabalho de UI.

**Contagem real obtida**: Reclamação=37, Reclamação+Mediação=13, Reclamação+Devolução=39, Reclamação+Mediação+Devolução=52 (Total=141). Ou seja, 91/141 (65%) dos claims em aberto têm devolução física associada.

## Bug corrigido — mascaramento de erro na classificação (2 camadas)

**Camada 1 — `classificar()`**: fazia `bool(tem_devolucao)`, o que tratava um erro de verificação (`None`, ex: um 429 que esgotou as 5 tentativas) exatamente igual a "confirmado sem devolução" (`False`) — mascarando silenciosamente uma falha de API como se fosse uma reclamação de verdade sem devolução. Identificado numa 2ª rodada de revisão (GPT + verificação cruzada contra doc oficial). Corrigido: quando `tem_devolucao is None`, a combinação recebe o sufixo "(devolução não verificada)" em vez de cair automaticamente no "sem devolução".

**Camada 2 — tabela-resumo do `main()`**: descoberta ao sincronizar o repositório (Matheus já tinha commitado o arquivo com a camada 1 aplicada certinha) — a tabela-resumo usava uma lista fixa (`ordem`) com só as 4 combinações originais, então as combinações novas "(devolução não verificada)" entravam no `contagem` (dict) mas nunca eram impressas — ficavam contadas no `TOTAL`, só que sumiam da tabela sem explicação, voltando a mascarar o problema por outro caminho. Corrigido com um loop de "extras" que imprime qualquer combinação fora das 4 esperadas — nenhuma combinação futura consegue mais desaparecer silenciosamente.

Ambas as camadas confirmadas aplicadas no repositório (commit `559b55f`, 20/09/2026 05:44) — texto batido linha por linha contra o que foi entregue, sem diferença.

## Cronometragem por item, por conta e no geral — instrumentação adicionada

Pedido de Matheus antes de rodar de novo: saber quanto tempo é gasto por reclamação, por conta e no total. Adicionado com `time.monotonic()` em 3 pontos do script: (1) coluna "Tempo (s)" na tabela detalhada, com o tempo da checagem de devolução de cada reclamação; (2) tabela nova "Tempo gasto por conta", separando tempo de busca (`claims/search`) e tempo de verificação de devolução, por MB e SV; (3) linha final com o tempo total do script inteiro.

**Resultado real (rodada de 20/09/2026 05:49)**: 64,08s pra 141 claims, sem nenhum 429 dessa vez (só 404 limpo, esperado). Por conta: MB 35,19s (1,36s busca + 33,83s verificação, 79 claims), SV 28,81s (1,25s busca + 27,56s verificação, 62 claims). Achado: o tempo por item é quase idêntico entre as 2 contas (~0,43s MB, ~0,44s SV) — o tempo total não depende da conta em si, só de quantas reclamações ela tem abertas. O valor de ~0,4s por item bate com o piso imposto pelo espaçador proativo (`EspacadorChamadas`, 0,4s por conta), não com lentidão da API. A contagem final bateu exatamente igual à rodada anterior (37/13/39/52/141), confirmando estabilidade dos dados no mesmo dia.

## Cronometragem estendida — busca e classificação de mensagens (quem é quem)

Pedido de Matheus: além de busca/devolução/classificação do claim, cronometrar também as 2 etapas que a tela precisaria fazer pra montar o chat — buscar as mensagens de cada reclamação (`GET /post-purchase/v1/claims/{id}/messages`) e classificar cada mensagem em ML / Você / Cliente. A classificação reaproveita 100% a lógica já validada em produção (`views.py::_construir_mensagens_mediacao`) e no rascunho `varredura_respostas_mediacao.py` — `sender_role == "mediator"` é ML, `sender_role` igual ao papel da conta nesse claim é Você, qualquer outro é Cliente. O papel da conta em cada claim (`respondent`/`complainant`) já é conhecido desde a busca inicial (foi filtrado por `players.role`), então não precisou de nenhuma chamada extra a `/claims/$ID` só pra descobrir isso.

**Resultado real (rodada de 20/09/2026, mesmas 141 claims)**: tempo total do script subiu de 64,08s pra **192,05s** com as 2 etapas novas. Por fase, somando as 2 contas: busca de reclamações 2,60s, verificação de devolução 75,97s, busca de mensagens **113,27s (59% do tempo total — a etapa mais cara)**, classificação de mensagens ~0,00s (é só processamento em memória, sem chamada de API). Por conta: MB 100,02s (62,22s só de busca de mensagens, 79 claims), SV 91,81s (51,05s de busca de mensagens, 62 claims).

**Achado**: o tempo por chamada de mensagens (~0,79s MB, ~0,82s SV) é bem maior que o piso de ~0,4-0,6s visto na verificação de devolução — e é consistente entre as 2 contas, então não é uma conta específica lenta, é a própria API de mensagens que demora mais que `/returns` (payload maior: histórico completo, texto HTML de cada mensagem, contra um 404 vazio).

**Classificação**: 354 mensagens no total — 145 do Mercado Livre (mediador), 108 suas (vendedor), 101 do cliente. Rodou limpa, sem nenhum erro — as 141 reclamações tiveram mensagens buscadas e classificadas com sucesso (zero "não confirmado").

Esse número (192,05s pra buscar tudo do zero) é exatamente o custo que a decisão de cache em `JSONField` (ver "3 decisões técnicas confirmadas" acima) evita pagar toda vez — a varredura de mensagens continua útil como ferramenta de diagnóstico/exploração sob demanda, mas a tela em produção não vai refazer essa busca inteira a cada carregamento.

## related_entities — verificado contra doc oficial, decisão: manter /returns direto

A doc de Devoluções (`.com.br`, atualizada 22/12/2025) recomenda: 1) ouvir o feed/webhook de reclamações; 2) consultar `/claims/$CLAIM_ID` e checar o campo `related_entities` — se contiver `"return"`, aí sim consultar `/returns`. O campo existe e a recomendação é real, mas dois pontos tiram o proveito dela pro nosso caso específico:

- Essa recomendação é pensada pra um fluxo reativo a webhook (decidir, claim por claim, se vale chamar `/returns`) — não pra uma varredura em lote que já vai iterar todos os claims de qualquer forma.
- `related_entities` só aparece no detalhe (`/claims/$CLAIM_ID`), não no `/claims/search` que a varredura já usa — trocar exigiria uma chamada nova (detalhe) por claim, além da chamada condicional ao `/returns`.

Com os números reais da varredura (91/141 = 65% dos claims têm devolução), o fluxo recomendado geraria 141 chamadas de detalhe + 91 de `/returns` = 232 chamadas, mais que as 141 atuais. **Decisão: manter `/returns` direto** nessa varredura — não é uma questão de estar "errado", só é um fluxo pensado pra outro cenário de uso.

## Agentes de Mensageria — verificado contra doc oficial, não afeta o que já está validado

Confirmado com data e mecanismo exatos (doc `.com.br`, atualizada 27/04/2026): a partir de 02/02/2026, uma nova camada de intermediação (IA) passou a gerenciar as mensagens entre comprador e vendedor pra MLB (Brasil) e MLC (Chile), começando pela logística Full, de forma progressiva. No endpoint geral de pós-venda (`/packs/{pack_id}/sellers/{seller_id}/conversations/{type}`), os campos `to`/`from` passam a trazer o ID de um "Agente" em vez do ID real do comprador.

Esse endpoint é diferente do que o projeto já usa pro chat de mediação (`/claims/{id}/messages`, usado por `varredura_respostas_mediacao.py` e pelo Hub de Consulta) — nada na doc indica que esse endpoint de mensagens de claim seja afetado pela mudança. Achado complementar: existe também um "Assistente inteligente de pós-venda" real (Central de Aprendizagem do ML), que analisa reclamações e resolve sozinho ou pede intervenção do vendedor — familiar à experiência operacional que Matheus já descreveu.

Confirmação adicional, lida em outras 4 páginas da mesma seção da doc (`O que é mensageria`, `Motivos para comunicar`, `Mensagens pendentes`, `Mensagens bloqueadas`): nenhuma delas cita ou referencia o recurso de claims — são todas sobre o canal geral (`/messages`, `/messages/action_guide/...`). E a doc de "Mensagens bloqueadas" (atualizada 10/07/2026) traz um substatus que reforça a separação dos dois sistemas:

> **blocked_by_mediation**: "Existe uma mediação em andamento entre o comprador e o vendedor."
> **blocked_by_mediation_fbm**: "O vendedor não pode se comunicar porque existe uma mediação em andamento em uma venda Fulfillment."

Ou seja: a própria doc trata mediação e mensageria geral como dois canais que se revezam (quando entra mediação, o canal geral bloqueia) — não dois sistemas que coexistem sobre a mesma conversa. Reforça a conclusão de que o endpoint de mensagens de claim/mediação não é tocado pela mudança dos Agentes de Mensageria. Confirmado também, nessas mesmas páginas, mais 4 substatus ligados ao "assistente de IA" (`blocked_by_ai_assistant`, `blocked_by_ai_assistant_expired`, `blocked_by_ai_assistant_contact_closed`, `block_by_ai_assistant_initiated_by_seller_expired`), todos amarrados a vendas Fulfillment — bate com "começando pela logística Full".

## Em aberto

- [ ] Decidir se `recontact` conta como "mediação" no relatório, quando (se) essa ação for liberada de verdade — ver [[Stage Recontact É Documentado E Mediador Também Atua Em Dispute Ou Recontact]]
- [ ] Passo 1 original (implementar `JSONField`, critério de mediação corrigido, escopo do "Atualizar tudo" em produção) segue não retomado — mas o desenho da tela nova já avançou bastante, ver [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]]
- [ ] Feature maior de comparar a varredura contra o banco interno (achar mediações que a Ana não sabe que existem) segue não escopada — validada como valiosa pelos 141 claims/65 em mediação, mas ainda é ideia solta

## Relacionado

- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
- [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]]
- [[Stage Recontact É Documentado E Mediador Também Atua Em Dispute Ou Recontact]]
- [[Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent]]
- [[Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]]
- [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]]
