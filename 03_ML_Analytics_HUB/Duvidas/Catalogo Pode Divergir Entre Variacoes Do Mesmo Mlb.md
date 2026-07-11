---
tipo: duvida
dominio: python
status: ativa
criado: 10/07/2026
relacionado: [Classificacao de Anuncio Usa Apenas 2 Campos, Variacoes Nativas So Existem Em Anuncios Encerrados]
---

# Catálogo Pode Divergir Entre Variações do Mesmo MLB?

Pergunta em aberto: quando um MLB tem variações nativas (`variations[]`),
é possível que variações diferentes do mesmo MLB tenham valores diferentes
de `catalog_product_id` / `catalog_listing` entre si? Ou esses campos são
sempre uma propriedade do MLB inteiro, nunca divergindo entre suas
variações?

## Origem da pergunta

Levantada pela conversa do projeto Django, ao notar esta linha de código
em `buscar_detalhes.py`:

```python
reg["catalog_product_id"] = var.get("catalog_product_id") or campos_pai["catalog_product_id"]
```

O código sugere que cada variação *poderia* ter seu próprio
`catalog_product_id`, potencialmente diferente do item-pai — mas não fica
claro se isso é um fallback defensivo que na prática nunca é acionado, ou
se reflete um caso real que já aconteceu.

## Por que ainda não foi possível responder

O teste mais direto disponível (`MLB3321138767`, "Pantufa", 20 variações
reais) não serviu para confirmar nem refutar — nenhuma das 20 variações
estava em catálogo (`catalog_product_id: None` e `catalog_listing: False`
em todas). Sem nenhuma variação em catálogo no caso testado, não havia o
que divergir.

## Pista indireta (não é confirmação)

Variações nativas do ML nesta conta existem quase exclusivamente em
anúncios `status = closed` (ver nota relacionada) — a combinação
"variação + catálogo simultaneamente" provavelmente é rara ou inexistente
na base atual, o que reduziria bastante o impacto prático da dúvida. Mas
isso é uma indicação indireta, não uma confirmação.

## Como resolver quando for retomado

Procurar deliberadamente, no `detalhes_mlbs.json`, por um MLB que tenha
**ao mesmo tempo** `catalog_listing = True` E `variacao_id` preenchido. Se
nenhum existir na base atual, a dúvida permanece em aberto até aparecer um
caso real — não deve ser assumida como resolvida por ausência de teste.

## Relacionado

- [[Classificacao de Anuncio Usa Apenas 2 Campos]]
- [[Variacoes Nativas So Existem Em Anuncios Encerrados]]