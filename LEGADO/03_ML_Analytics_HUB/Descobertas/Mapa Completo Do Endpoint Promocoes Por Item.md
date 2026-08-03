---
tipo: descoberta
dominio: python
status: ativa
criado: 11/07/2026
relacionado: [Endpoint Promocoes Rejeita Anuncio Encerrado Com Http 400, Boosted Offer Nunca Confirmado Na Pratica]
---

# Mapa Completo do Endpoint Promoções por Item

Exploração campo a campo de `GET /seller-promotions/items/{MLB}`, contra
395 promoções reais coletadas em 76 MLBs (de uma amostra de 106).

## Tipos de campanha confirmados com dado real

{'DEAL': 239, 'SMART': 79, 'PRICE_DISCOUNT': 72,
'PRICE_MATCHING': 3, 'LIGHTNING': 2}

`sub_type` nunca apareceu (dicionário vazio) — consistente com a conta
não participar de campanhas do tipo `VOLUME`, `SELLER_CAMPAIGN` ou
cupons do vendedor (os únicos tipos documentados que usam esse campo).

## Padrão de negócio importante: candidato domina sobre ativo
Status de participação: {'started': 41, 'candidate': 354}

**89% das promoções elegíveis são apenas "candidatas"** — o item é
elegível mas o vendedor ainda não ativou participação. Só 11% estão de
fato `started` (ativas). Isso indica um volume grande de oportunidade de
desconto/exposição ainda não aproveitada pela operação.

## Frequência de cada campo (todos já observados)

| Campo | Frequência |
|---|---|
| `type`, `status`, `price`, `original_price` | 100% |
| `name` | 99,5% |
| `id` | 81,8% |
| `min/max/suggested_discounted_price` | 78,2% |
| `start_date`/`finish_date` | 61,3% |
| `ref_id` | 21,3% |
| `meli_percentage`/`seller_percentage` | 20,8% |
| `stock` | 0,5% |

## Valores reais do mecanismo de rebate clássico
meli_percentage    — min=0.3%  max=4%    média=1.70%
seller_percentage  — min=1.6%  max=33.1%

## Confirmação do erro 400 em escala

Erro 400 (`Item status is not allowed (closed)`) ocorreu exatamente 30
vezes na amostra — batendo com os 30 MLBs `closed` presentes (10 em cada
um dos 3 grupos `closed` testados). Confirma, agora com mais volume, o
padrão já registrado em [[Endpoint Promocoes Rejeita Anuncio Encerrado Com Http 400]].

## Caso extremo real

`MLB2690742181` participa de **11 promoções simultâneas** (candidatas +
1 ativa) — bom exemplo de referência para entender o volume máximo de
elegibilidade que um único anúncio pode acumular ao mesmo tempo.

## Nota sobre o mecanismo boosted_offer

Ver [[Boosted Offer Nunca Confirmado Na Pratica]] — o mecanismo novo de
2026 não apareceu nenhuma vez nesta amostra, apesar de documentado.

## Relacionado

- [[Endpoint Promocoes Rejeita Anuncio Encerrado Com Http 400]]
- [[Boosted Offer Nunca Confirmado Na Pratica]]