---
tipo: conceito
dominio: 
status: ativa
criado: 11/07/2026
relacionado: [Rebate E Boost, Mapa Completo Do Endpoint Promocoes Por Item, Boosted Offer Nunca Confirmado Na Pratica]
---

# Classificação de Promoções: Com Rebate vs Sem Rebate

Separação de todos os tipos de campanha de promoção do Mercado Livre em
dois grupos — quais têm cofinanciamento do ML (rebate) e quais são
desconto 100% bancado pelo vendedor — marcando claramente o que já foi
**confirmado com dado real** desta conta versus o que é **só
documentação**, ainda sem exemplo real observado.

## 🟢 COM REBATE (cofinanciadas pelo Mercado Livre)

| Tipo | Campo do rebate | Status de confirmação |
|---|---|---|
| `SMART` | `meli_percentage` / `seller_percentage` | ✅ **Confirmado** — 82 casos reais, ML de 0,3% a 4% |
| `PRICE_MATCHING` | `meli_percentage` / `seller_percentage` | ⚠️ Campanha existe na conta (3 casos vistos), mas nenhum item com rebate populado ainda |
| `MARKETPLACE_CAMPAIGN` | `meli_percentage` / `seller_percentage` | ⚠️ Só documentação — nunca visto na conta |
| `PRICE_MATCHING_MELI_ALL` | Sem percentual — 100% bancado pelo ML | ⚠️ Só documentação — nunca visto |
| `VOLUME` (desconto por quantidade) | `meli_percentage` / `seller_percentage` | ⚠️ Só documentação — conta não tem essa campanha ativa |
| `PRE_NEGOTIATED` (desconto pré-acordado) | `benefits.meli_percent` / `benefits.seller_percent` | ⚠️ Só documentação — nunca visto |
| `UNHEALTHY_STOCK` (liquidação Full) | `meli_percentage` / `seller_percentage` | ⚠️ Campanha existe na conta (1 ativa, Fase 1), mas roster veio com 0 itens — nenhum item real testado |
| `BANK` (cofinanciamento PIX) | `meli_percentage` / `seller_percentage` | ⚠️ Campanha existe na conta (Fase 1), nunca visto num item específico |

## 🔴 SEM REBATE (nunca cofinanciadas — 100% do vendedor)

| Tipo | Status de confirmação |
|---|---|
| `DEAL` (campanha tradicional) | ✅ **Confirmado** — 239 ocorrências, nunca com rebate |
| `PRICE_DISCOUNT` (desconto individual) | ✅ **Confirmado** — 72 ocorrências, nunca com rebate |
| `LIGHTNING` (oferta relâmpago) | ✅ **Confirmado** — 2 ocorrências, nunca com rebate |
| `DOD` (oferta do dia) | ⚠️ Nunca visto na conta — documentado como sem bonificação |
| `SELLER_CAMPAIGN` (campanha do vendedor) | ⚠️ Nunca visto — por definição é o vendedor quem cria, sem ML |
| `SELLER_COUPON_CAMPAIGN` (cupom do vendedor) | ⚠️ Nunca visto — orçamento (`budget`) é definido e pago 100% pelo vendedor |

## Situação real da conta hoje (resumo prático)

Dos 7 tipos de campanha que a conta realmente tem ativos (confirmado na
Fase 1 de `GET /seller-promotions/users/{USER_ID}`): `LIGHTNING`, `DOD`,
`UNHEALTHY_STOCK`, `SMART`, `DEAL`, `BANK`, `PRICE_MATCHING`.

**Só `SMART` tem rebate confirmado em uso de verdade.** `UNHEALTHY_STOCK`,
`BANK` e `PRICE_MATCHING` existem como campanha na conta, mas nenhum item
específico foi visto participando delas com rebate populado — pode ser
que nenhum item ainda esteja de fato inscrito nelas.

## Pendências a resolver quando a base de amostra aumentar

- [ ] Confirmar se `PRICE_MATCHING` chega a ter rebate real quando mais
      itens forem testados (hoje só vimos 3 casos, nenhum com o campo
      preenchido).
- [ ] Encontrar ao menos 1 item real participando de `UNHEALTHY_STOCK`
      (roster testado veio vazio — 0 itens).
- [ ] Encontrar ao menos 1 item real participando de `BANK`.
- [ ] Confirmar se `boosted_offer` (mecanismo novo de 2026) aparece em
      alguma dessas campanhas quando a amostra crescer — ver
      [[Boosted Offer Nunca Confirmado Na Pratica]].
- [ ] Verificar se a conta algum dia participa de `MARKETPLACE_CAMPAIGN`,
      `VOLUME`, `PRE_NEGOTIATED`, `DOD`, `SELLER_CAMPAIGN` ou
      `SELLER_COUPON_CAMPAIGN` — nenhum desses 6 tipos apareceu na Fase 1
      até agora, então não há como confirmar nem a presença nem a
      ausência de rebate neles com dado real.

## Relacionado

- [[Rebate E Boost]]
- [[Mapa Completo Do Endpoint Promocoes Por Item]]
- [[Boosted Offer Nunca Confirmado Na Pratica]]