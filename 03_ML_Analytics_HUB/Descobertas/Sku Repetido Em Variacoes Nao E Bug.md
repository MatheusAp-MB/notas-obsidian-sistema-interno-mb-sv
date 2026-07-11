---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# SKU Repetido em Variações Não é Bug — é Ausência Real de Dado

O "bug" reportado pelo projeto Django — todas as variações de um mesmo
MLB compartilhando o mesmo SKU no `detalhes_mlbs.json` — foi investigado
e **refutado como bug de código**. O código de extração já estava
correto; o problema é que o dado simplesmente não existe na origem para
a maioria dos casos.

## Relatório de bug original

Reportado com o exemplo `MLB3321138767` ("Pantufa Adulto", 20 variações):
todas as 20 retornavam `sku: F7899947318445.001`, idêntico. A causa
apontada era que o código só checava `seller_custom_field` na variação,
nunca `attributes[SELLER_SKU]` (que seria, supostamente, onde o SKU de
variação realmente vive).

## Investigação contra dado bruto real

Buscado o JSON bruto e completo (`GET /items`) do MLB citado. Estrutura
real de uma variação (`variations[]`):

```
['id', 'price', 'attribute_combinations', 'available_quantity',
 'sold_quantity', 'sale_terms', 'picture_ids', 'seller_custom_field',
 'catalog_product_id', 'inventory_id', 'item_relations', 'user_product_id']
```

**O campo `attributes` não existe dentro do objeto de variação** — só
existe no item pai. A correção sugerida pelo relatório de bug
(`var.get("attributes", [])` procurando `SELLER_SKU`) nunca encontraria
nada, porque esse caminho não existe na estrutura real da API.

## Teste em amostra maior (para não concluir de 1 caso só)

Testado com 11 MLBs de variação real (46 variações no total):

| MLB | Variações | Com SKU próprio |
|---|---|---|
| MLB3321138767 (Pantufa) | 20 | 0 |
| MLB2771993830 (Bico Ponta Leque) | 4 | 4 |
| Outros 9 MLBs testados | 22 | 0 |

**43 de 46 variações (93%) não têm `seller_custom_field` preenchido** —
não é erro de leitura, é ausência real do dado na origem. Quando o campo
existe (caso do Bico Ponta Leque), o código original já o lê
corretamente.

## Conclusão

- O código do `buscar_detalhes.py` já lê o campo certo
  (`seller_custom_field`) — não havia bug de extração a corrigir.
- A ausência de SKU por variação é majoritariamente um dado ausente na
  origem, não um erro de leitura.
- Impacto prático baixo: afeta apenas anúncios já encerrados, de um
  modelo de anúncio (variação nativa do ML) que a operação não usa mais
  (ver nota relacionada sobre variações só existirem em `closed`).

## Relacionado

- [[Variacoes Nativas So Existem Em Anuncios Encerrados]]