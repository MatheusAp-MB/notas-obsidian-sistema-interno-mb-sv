---
tipo: descoberta
dominio: python
status: confirmada
criado: 15/09/2026
atualizado_em: 15/09/2026 13:28
relacionado: [Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent, Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica, Mensagens Da Reclamacao Confirmam sender_role Mediator E Revelam Gap De 17 Dias Na Resposta Do Vendedor]
---

# Mediador de uma Reclamação Não Aparece na Lista de Players — Só em resolution.closed_by

**Resumo**: em nenhuma reclamação fechada testada (`mediations`, `returns`, `cancel_purchase`, `change`), o array `players` trouxe um player com `role: "mediator"` — mesmo em disputa real (`stage: dispute`). O sinal de que um mediador interveio é o campo `resolution.closed_by` (valores documentados: `mediator`, `buyer`, `seller`), nunca a lista de `players`.

> [!success] Confirmada
> Validado de forma independente em mais de 20 reclamações reais, de 4 tipos diferentes (`mediations`, `returns`, `cancel_purchase`, `change`) — sempre o mesmo padrão: só `complainant` e `respondent` no array `players`, nunca um terceiro player.

## Contexto

Durante uma investigação nas reclamações/devoluções da conta MB (endpoint `GET /post-purchase/v1/claims/search`), buscávamos um caso "sem mediador" pra contrastar com os casos que claramente tiveram mediação — a ideia inicial era escanear reclamações até achar uma cujo array `players` não tivesse nenhum player com `role: "mediator"`.

## O problema

A doc oficial ("Gerenciar Reclamações") lista `mediator` como um dos 3 valores possíveis de `players[].role` ("pessoa que intervém para ajudar a resolver o problema"), ao lado de `complainant` e `respondent`. Isso sugeria que bastava escanear o array `players` de várias reclamações até achar uma sem esse papel.

## O que levou à resposta

Escaneamos mais de 20 reclamações fechadas reais, incluindo várias com `stage: "dispute"` (a etapa que a própria doc define como "onde intervém um representante do Mercado Livre") e `resolution.closed_by: "mediator"` — ou seja, casos que o próprio resultado da resolução confirma terem tido mediador. Mesmo assim, o array `players` desses casos sempre trouxe só 2 entradas: `complainant` e `respondent`. Nunca um terceiro player com `role: "mediator"`.

Isso bate com o único exemplo de resposta que a própria doc mostra — tanto pro detalhe de 1 claim quanto pra busca — onde mesmo uma reclamação `type: mediations`, `stage: dispute`, encerrada com `resolution` preenchido, só lista 2 players.

## Resposta

O array `players` de `/post-purchase/v1/claims/search` nunca lista o mediador como um player à parte — ele intervém "por trás", sem virar uma entrada nesse array. Quem quer saber se um mediador interveio de verdade precisa olhar `resolution.closed_by`, não a lista de `players`. Os valores documentados pra esse campo são `mediator`, `buyer` e `seller` — mas em toda a amostra testada até agora (20+ reclamações, 4 tipos), só `mediator` apareceu. Ainda não achamos nenhum exemplo real de `closed_by: "buyer"` ou `closed_by: "seller"`.

## Exemplo

Reclamação real (`id 5576280335`, pedido `2000018337202558`), `type: mediations`, `stage: dispute` — claramente uma disputa mediada:

```json
"players": [
  {"role": "complainant", "user_id": 1222612595},
  {"role": "respondent", "user_id": "SEU_USER_ID_OCULTO"}
],
"resolution": {
  "reason": "no_bpp",
  "benefited": ["respondent"],
  "closed_by": "mediator",
  "applied_coverage": false
}
```

Só 2 players, nenhum com `role: "mediator"` — mesmo com `closed_by: "mediator"` na resolução.

## Relacionado

- [[Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent]]
- [[Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]]
- [[Mensagens Da Reclamacao Confirmam sender_role Mediator E Revelam Gap De 17 Dias Na Resposta Do Vendedor]] — atenção: esse achado (`players` nunca lista mediador) é só sobre o array `players`; o endpoint `claims/{id}/messages` é diferente e lá o mediador aparece sim, como `sender_role`.
