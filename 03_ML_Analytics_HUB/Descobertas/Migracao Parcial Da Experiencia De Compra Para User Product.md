---
tipo: descoberta
dominio: python
status: ativa
criado: 11/07/2026
relacionado: []
---

# Migração Parcial da Experiência de Compra para User Product

A conta está em migração parcial: o endpoint "por item"
(`/reputation/items/{MLB}/purchase_experience/integrators`) é
silenciosamente redirecionado (HTTP 302) para a estrutura nova de User
Product em anúncios `active`/`paused` — mas **não** em anúncios `closed`,
que continuam respondendo na estrutura antiga.

## Contexto

A documentação já avisava: "a partir da ativação do novo recurso por UP,
todas as requisições realizadas sobre itens migrados para a nova
estrutura de User Products responderão com HTTP 302". Como o
`requests` segue redirecionamento automaticamente, isso passaria
despercebido sem comparação explícita.

## Evidência real

Comparado, para os mesmos 72 MLBs, o corpo retornado por
`experiencia_item` (endpoint "por item") contra `experiencia_up`
(endpoint "por user_product"):

- **53 de 72 (74%) idênticos** — confirma que o "item" foi redirecionado
  e entregou o mesmo corpo do UP.
- **19 de 72 (26%) diferentes** — retornaram a estrutura antiga
  (`item_id`, `metrics_details`, `problems`, sem `up_id`/`reasoning`/IA).

**Os 19 "não migrados" são 100% `status = closed`, sem exceção** — 9
Simples e 10 Base, todos encerrados. Nenhum ativo ou pausado ficou na
estrutura antiga.

## Exemplo real da estrutura antiga (legada)

```json
{
  "item_id": "MLB2077124293",
  "title": {"text": "Ainda não é possível medir sua experiência de compra"},
  "subtitles": [{"order": 0, "text": "Ela ainda não foi calculada porque seu anúncio não teve vendas nos últimos 180 dias."}],
  "reputation": {"color": "gray", "value": -1},
  "metrics_details": {
    "empty_state_title": "Você não teve vendas com problemas nos últimos 180 dias.",
    "distribution": {}
  }
}
```

Bate exatamente com o caso "Item sem experiência de compra" documentado
oficialmente — só que sem os campos novos (`reasoning`, `recommendations`,
`ai_generated`) que só existem na estrutura por UP.

## Conclusão prática

- Para anúncios **ativos e pausados**, não faz sentido chamar os dois
  endpoints (item + user_product) — o resultado é idêntico, é chamada
  duplicada e desperdiçada.
- Para anúncios **encerrados**, só o endpoint "por item" retorna dado
  (na estrutura antiga) — o endpoint "por user_product" pode não
  funcionar da mesma forma para esses casos (não testado especificamente
  neste momento).
- Se o sistema precisar de dado de Experiência de Compra só para
  anúncios ativos/pausados, chamar apenas `experiencia_up` já é
  suficiente — economiza metade das chamadas.

## Relacionado

- [[Regras Gerais]]