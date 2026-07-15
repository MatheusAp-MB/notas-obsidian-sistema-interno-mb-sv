---
tipo: descoberta
dominio: python
status: ativa
criado: 14/07/2026
relacionado: [Roster De Campanha Usa Searchafter Dentro De Paging, Roster De Campanha Sem Paginacao Implementada]
---

# Roster de Campanhas SMART Tem Duplicatas Reais Durante a Paginação

Ao implementar a paginação completa (corrigindo o bug anterior de trazer
só a primeira página), surgiu um novo comportamento: **itens duplicados
entre páginas diferentes da mesma campanha**, quase exclusivamente em
campanhas do tipo `SMART`.

## Contexto

Rodada a coleta completa do catálogo (5.615 MLBs na Fase 2, 39 campanhas
na Fase 3, com paginação via `searchAfter` já implementada). Comparando
o total declarado pela própria API (`paging.total`) contra o total
efetivamente coletado após percorrer todas as páginas: 31 de 39
campanhas vieram com **mais** itens coletados que o declarado — em
alguns casos quase o dobro (`P-MLB17781036`: 233 declarado → 420
coletado).

## Confirmação da causa: duplicata real, não erro de contagem

Testado removendo duplicatas por `id` de cada roster: em **todas as 31
campanhas** com "coletado > declarado", o número de itens **únicos**
bateu **exatamente** com o total declarado pela API. Isso confirma que
o excesso é 100% duplicata de item repetido entre páginas — não é erro
de paginação nem inconsistência de contagem da API.

Exemplos reais (bruto → único, batendo com declarado):

P-MLB17795002 (DEAL): 167 únicos vs 196 declarado — faltam 29
P-MLB17795004 (DEAL): 1812 únicos vs 1994 declarado — faltam 182

Isso não é resolvido por dedup — são itens que realmente não vieram na
coleta. Hipóteses não confirmadas: a paginação pode ter parado antes de
esgotar (cursor retornou vazio prematuramente), ou o `total` da campanha
mudou durante a coleta (itens sendo adicionados à campanha `DEAL`
enquanto a paginação corria). Não investigado a fundo — fica como
limitação conhecida.

## Impacto prático

Para a Fase 2 (promoções por item, que alimenta a fórmula de
precificação), **este problema não se aplica** — é específico da Fase 3
(roster de campanha completa), que serve para auditoria/visão panorâmica,
não para o cálculo de preço em si.

## Relacionado

- [[Roster De Campanha Usa Searchafter Dentro De Paging]]
- [[Roster De Campanha Sem Paginacao Implementada]]