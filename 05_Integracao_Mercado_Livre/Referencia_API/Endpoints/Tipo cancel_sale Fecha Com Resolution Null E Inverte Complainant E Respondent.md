---
tipo: descoberta
dominio: python
status: confirmada
criado: 15/09/2026
atualizado_em: 15/09/2026 01:19
relacionado: [Mediador Nao Aparece Na Lista De Players De Uma Reclamacao, Campo resource_id De cancel_purchase Nao Bate Com O Numero Do Pedido, Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]
---

# Reclamação do tipo cancel_sale Fecha com resolution: null e Inverte os Papéis de Complainant/Respondent

**Resumo**: reclamações `type: cancel_sale` (cancelamento da venda pelo vendedor) fecham sem nenhum objeto `resolution` — vem `null`, mesmo com `status: closed`. E, diferente de todos os outros tipos testados, quem aparece como `complainant` é o próprio vendedor (você), não o comprador — o comprador aparece como `respondent`.

> [!success] Confirmada
> Os 2 exemplos reais encontrados (conta MB) concordam nos 2 pontos: `resolution: null` e o vendedor como `complainant`.

## Contexto

Mesma investigação de reclamações/devoluções da conta MB — buscando candidatos de cada `type` de reclamação pra mapear o campo `resolution`, agrupando por tipo (3 exemplos de cada) em vez de só pegar os mais recentes (que vinham dominados por `cancel_purchase`).

## O problema

Nos outros tipos testados (`mediations`, `returns`, `cancel_purchase`, `change`), toda reclamação fechada trouxe um objeto `resolution` preenchido, com `reason`/`benefited`/`closed_by`/`applied_coverage`. A pergunta era se isso valia pra todo tipo, sem exceção.

## O que levou à resposta

Os 2 exemplos reais de `cancel_sale` encontrados vieram assim:

```json
{
  "type": "cancel_sale",
  "stage": "none",
  "status": "closed",
  "reason_id": "CS9532",
  "players": [
    {"role": "complainant", "user_id": "SEU_USER_ID_OCULTO"},
    {"role": "respondent", "user_id": 774683368}
  ],
  "resolution": null
}
```

`resolution: null` nos 2 casos — nenhum `reason`, nenhum `closed_by`, nada. E o papel do vendedor é `complainant`, não `respondent` — o oposto do que vimos em `mediations`/`returns`/`cancel_purchase`/`change`, onde o comprador é sempre `complainant` e o vendedor sempre `respondent`.

## Resposta

Os 2 achados se explicam juntos: `cancel_sale` é "cancelamento da compra por parte do vendedor" (doc oficial) — quem inicia a reclamação é você, então é você quem aparece como `complainant` (o papel de quem reclama, não de quem é reclamado). E, como não existe litígio real pra decidir (você mesmo cancelou, não tem 2 lados discordando), não existe objeto de resolução — o claim simplesmente fecha, sem `reason`/`closed_by`/`applied_coverage`.

Implicação prática: qualquer código que espera `resolution` sempre preenchido numa reclamação `closed` (pra ler `resolution.applied_coverage`, por exemplo) precisa tratar `resolution: null` como caso válido, não como erro — pelo menos pra `cancel_sale`.

## Exemplo

Os 2 casos reais vistos, ambos conta MB:

- Claim `5574130235` (pedido `2000018234699180`, `reason_id: CS9532`) — `resolution: null`.
- Claim `5570259011` (pedido `47905856173`, `reason_id: CS9532`) — `resolution: null`.

## Relacionado

- [[Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]]
- [[Campo resource_id De cancel_purchase Nao Bate Com O Numero Do Pedido]]
- [[Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]]
