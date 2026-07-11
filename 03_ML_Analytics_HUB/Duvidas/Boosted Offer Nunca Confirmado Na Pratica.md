---
tipo: duvida
dominio: python
status: ativa
criado: 11/07/2026
relacionado: [Rebate E Boost]
---

# boosted_offer Nunca Confirmado na Prática

O mecanismo novo de desconto automático de 2026 (`boosted_offer` e seus
campos associados) foi documentado pela API, mas **nunca foi observado
de fato** em nenhuma promoção real desta conta.

## Contexto

A nota [[Rebate E Boost]] documenta dois mecanismos de ajuda financeira
do Mercado Livre em promoções: o clássico (`benefits.type=REBATE`,
`meli_percentage`/`seller_percentage`) e o novo (`boosted_offer`,
`discount_meli_boosted_percentage`, `discount_meli_boost_amount`,
`total_price_for_boosted_offer`). Até este ponto, os dois eram tratados
com o mesmo nível de confiança.

## Evidência que muda esse quadro

Analisadas **395 promoções reais** (endpoint
`GET /seller-promotions/items/{MLB}`, 76 MLBs com resposta válida):

- `boosted_offer` nunca apareceu como `true` — 0 de 395.
- Os campos `discount_meli_boosted_percentage`,
  `discount_meli_boost_amount` e `total_price_for_boosted_offer` **nem
  chegaram a aparecer** na lista de campos observados (ver mapa completo
  de campos na nota relacionada).
- Já o mecanismo clássico (`meli_percentage`/`seller_percentage`) **foi
  confirmado com fartura**: presente em 82 das 395 promoções (~21%),
  com valores reais (`meli_percentage` de 0,3% a 4%, `seller_percentage`
  de 1,6% a 33,1%).

## Conclusão

O mecanismo `boosted_offer` continua sendo só documentação para esta
conta — não há como afirmar como ele se comporta na prática (formato
exato, frequência de uso, faixa de valores) até que apareça em uma
coleta real.

## Como resolver quando for retomado

Rodar nova amostra de promoções periodicamente — se a conta passar a
participar de campanhas `DEAL`, `PRICE_DISCOUNT`, `PRE_NEGOTIATED`,
`SMART`, `PRICE_MATCHING` ou `LIGHTNING` com desconto automático
aplicado, o campo deve aparecer como `true` nessas.

## Relacionado

- [[Rebate E Boost]]