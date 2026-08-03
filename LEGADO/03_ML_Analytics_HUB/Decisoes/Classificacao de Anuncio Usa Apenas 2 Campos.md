---
tipo: decisao
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# Classificação de Anúncio Usa Apenas 2 Campos

A classificação de um anúncio em Base / Catálogo / Simples é derivada
usando somente dois campos da API do Mercado Livre — `catalog_listing` e
`catalog_product_id` — sem depender de `item_relations`.

## Regra de classificação

```
SE catalog_product_id está vazio/nulo:
    → Anúncio Simples

SENÃO SE catalog_listing = True:
    → Anúncio de Catálogo

SENÃO (catalog_listing = False):
    → Anúncio Base
```

## Contexto que levou à decisão

Durante a investigação da árvore SKU → Página de Catálogo → Base →
Catálogo, havia dúvida sobre qual combinação de campos deveria definir o
*tipo* de um anúncio. `item_relations` parecia candidato natural, já que é
o campo que liga um anúncio ao seu par.

Testado contra caso real (SKU `F7908050719121.001`, 21 MLBs, 7 pares
confirmados): a classificação por `catalog_listing` +
`catalog_product_id` bateu perfeitamente com o que o painel do Mercado
Livre mostra, inclusive nos casos em que o par não tinha `item_relations`
declarado (catálogo órfão por encerramento) — o item continuava
corretamente classificado como Catálogo mesmo sem par.

## Alternativas descartadas

- **Usar `item_relations` como critério de classificação** — descartado
  porque esse campo só existe quando há um par declarado; um catálogo
  órfão (sem par, por exemplo por estar encerrado) ficaria sem
  classificação se dependesse dele.

## Papel de cada campo (para não confundir depois)

| Campo | Função |
|---|---|
| `catalog_product_id` | Diz **se** existe Página de Catálogo, e qual é |
| `catalog_listing` | Diz **qual tipo** dentro dela (Base ou Catálogo) |
| `item_relations` | Diz **quem é o par**, dentro do grupo — não decide o tipo |
| `sku` | Validação cruzada — todos do mesmo grupo deveriam compartilhar (raramente diverge) |

## Relacionado

- [[Regras Gerais]]