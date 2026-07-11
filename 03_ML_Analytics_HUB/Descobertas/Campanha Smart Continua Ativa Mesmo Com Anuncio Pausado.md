03_ML_Analytics_HUB\Descobertas\Campanha Smart Continua Ativa Mesmo Com Anuncio Pausado.md
markdown---
tipo: descoberta
dominio: python
status: ativa
criado: 11/07/2026
relacionado: [Mapa Completo Do Endpoint Promocoes Por Item]
---

# Campanha SMART Continua Ativa Mesmo com Anúncio Pausado

Diferente do que a documentação sugere ("para participar de promoções, o
item deve ter status ativo"), uma campanha do tipo `SMART` pode continuar
com `status: started` (participação real, com desconto de fato
acontecendo) mesmo depois que o anúncio foi pausado — não é
automaticamente encerrada.

## Contexto que levou ao teste

Ao verificar por que 36 de 37 MLBs pausados mostravam alguma promoção na
resposta do endpoint `GET /seller-promotions/items/{MLB}`, a suspeita
inicial era de que fossem só candidaturas teóricas (`status: candidate`),
sem participação de fato — o que bateria com a documentação.

## Evidência real

Quebrando por status de participação, em pausados:
Status geral: {'candidate': 143, 'started': 4}
Por tipo de campanha:
PRICE_DISCOUNT: {'candidate': 34}          <- nunca started
DEAL:           {'candidate': 106}          <- nunca started
SMART:          {'started': 4, 'candidate': 3}  <- TEM started!

**`PRICE_DISCOUNT` e `DEAL` nunca apareceram como `started` em nenhum
anúncio pausado** — consistente com a documentação. **Mas `SMART`
apareceu como `started` em 4 casos reais**, com desconto de fato ativo:

```json
{
  "id": "P-MLB17625058",
  "type": "SMART",
  "status": "started",
  "price": 136.71,
  "original_price": 158.65,
  "meli_percentage": 1.7,
  "seller_percentage": 12.2,
  "name": "Impulsione suas vendas"
}
```

## Interpretação

Provavelmente essas campanhas `SMART` já estavam ativas **antes** do
anúncio ser pausado, e o Mercado Livre não as encerra automaticamente
quando o vendedor pausa o anúncio — diferente do que parece acontecer
com `PRICE_DISCOUNT`, que talvez exija status ativo no momento de
entrar/permanecer na promoção.

## Limite desta descoberta

Só 4 casos observados, todos do tipo `SMART`, vindos de apenas 2
campanhas distintas (`P-MLB17625058` e `P-MLB17625056`). Não testado se
o mesmo vale para outros tipos de campanha cofinanciada (`BANK`,
`PRICE_MATCHING`) em situação de pausa.

## Relacionado

- [[Mapa Completo Do Endpoint Promocoes Por Item]]