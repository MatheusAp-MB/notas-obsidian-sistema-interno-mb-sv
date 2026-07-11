---
tipo: conceito
dominio: 
status: ativa
criado: 10/07/2026
relacionado: []
---

# Rebate / Boost (Ajuda Financeira do Mercado Livre em Promoções)

Existem dois mecanismos distintos pelos quais o Mercado Livre banca parte
do desconto oferecido numa promoção, em vez do custo cair inteiro sobre o
vendedor.

## Mecanismo 1 — REBATE (clássico)

Usado em campanhas mais antigas, como `MARKETPLACE_CAMPAIGN` e
`PRE_NEGOTIATED`. Aparece no nível da campanha, dentro de `benefits`:

```json
"benefits": {
    "type": "REBATE",
    "meli_percent": 5,
    "seller_percent": 25
}
```

`meli_percent` é a porcentagem de desconto que o Mercado Livre banca;
`seller_percent` é a parte do vendedor.

## Mecanismo 2 — boosted_offer (novo, 2026)

Introduzido em 2026, aplica-se a campanhas `DEAL`, `PRICE_DISCOUNT`,
`PRE_NEGOTIATED`, `SMART`, `PRICE_MATCHING` e `LIGHTNING` (só a nível de
item). Aparece direto no item, quando `boosted_offer: true`:

```json
{
  "boosted_offer": true,
  "discount_meli_boosted_percentage": 3.5,
  "discount_meli_boost_amount": 6000,
  "total_price_for_boosted_offer": 157000
}
```

O desconto extra é compensado como redução equivalente nos custos por
venda do vendedor (não é só desconto de preço — afeta a taxa cobrada).

## Como identificar "tem rebate/boost" num item, na prática

Heurística usada no script de coleta (`coletar_promocoes.py`): um item tem
ajuda do ML se qualquer uma de suas promoções tiver `meli_percentage`
presente (co-financiamento clássico, campo direto no item — não confundir
com `benefits.type`, que é campo de nível de campanha) OU
`boosted_offer: true`.

## Confirmado com dado real

Testado numa amostra estratificada de 106 MLBs: **37,7%** tinham indício
de rebate/boost. Padrão claro por status: presente consistentemente em
anúncios **ativos**, quase ausente em **pausados** — consistente com o
requisito de "status ativo" que a documentação de promoções já exige para
a maioria das campanhas.

## Relacionado

- [[Regras Gerais]]