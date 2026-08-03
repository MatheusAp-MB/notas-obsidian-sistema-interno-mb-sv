---
tipo: descoberta
dominio: python
status: ativa
criado: 11/07/2026
relacionado: []
---

# Mapa Completo do Endpoint Price to Win em Escala

Revisão do endpoint `/items/{MLB}/price_to_win`, agora com 1.711 chamadas
reais (todos os MLBs classificados como Catálogo na coleta completa),
confirmando e ampliando o que já sabíamos de amostras pequenas.

## Status confirmados, agora com volume real
{'not_listed': 1203, 'competing': 216, 'winning': 279,
'sharing_first_place': 11, 'listed': 2}

- **`sharing_first_place` confirmado como valor real da API** (11 casos)
  — antes só sabíamos disso pela documentação, nunca tínhamos visto de
  fato.
- **`listed` confirmado literalmente como valor da API** (2 casos) — até
  aqui só tínhamos inferido esse comportamento pela tela visual do
  painel do ML ("Com problemas"), nunca tinha aparecido explicitamente
  no JSON bruto.

## Valores de `reason` não cobertos pela documentação
{'item_not_opted_in': 1203, 'no_improvement_price': 1,
'reputation_limit_reached': 2}

`item_not_opted_in` bate com a lista documentada. **Mas
`no_improvement_price` e `reputation_limit_reached` não estão em nenhuma
lista oficial de motivos que já vimos** (a documentação lista, entre
outros, `reputation_below_threshold` — parecido, mas não idêntico a
`reputation_limit_reached`). Isso sugere que a API tem valores reais em
uso que a documentação não cobre completamente, ou que os nomes mudaram
em alguma atualização não refletida no texto oficial.

## Consistência cruzada confirmada (mesmo conjunto visto de 3 ângulos)

Três números diferentes, de três partes diferentes da API, bateram
**exatamente**:

| Métrica | Endpoint | Valor |
|---|---|---|
| Critério `UP_CATALOG_OPTIN` (performance) | `/user-product/.../performance` | 1.203 |
| Status `not_listed` (price to win) | `/items/.../price_to_win` | 1.203 |
| Motivo `item_not_opted_in` (price to win) | `/items/.../price_to_win` | 1.203 |

Essa coincidência exata (não é aproximação) é uma forte evidência de que
os três indicadores descrevem o mesmo grupo de itens: catálogos que não
optaram (`opt-in`) por competir — confirmando que os três dados são
internamente consistentes entre si.

## Outros achados de volume

- `winner` preenchido em 507 dos casos — o restante provavelmente é
  quando o próprio consultado é o vencedor, ou quando `not_listed`
  impede ter um vencedor definido (não totalmente confirmado).
- `boosts.status`: `opportunity` (1.073), `boosted` (1.466), `not_apply`
  (1) — **`not_boosted` nunca apareceu**, apesar de ser um dos 4 valores
  documentados.

## Relacionado

- [[Regras Gerais]]