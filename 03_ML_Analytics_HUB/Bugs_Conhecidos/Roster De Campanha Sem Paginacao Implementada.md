---
tipo: bug_conhecido
dominio: python
status: ativa
criado: 10/07/2026
relacionado: [Roster De Campanha Usa Searchafter Dentro De Paging]
---

# Roster de Campanha Sem Paginação Implementada

O script de coleta de rosters de campanha (`coletar_promocoes.py`, Fase 3)
faz apenas 1 chamada por campanha e não segue o cursor `searchAfter` —
como consequência, o dado coletado para campanhas grandes vem **truncado**,
sem representar o total real de itens.

## O que já se sabe (ver descoberta relacionada para detalhe técnico)

- O cursor de paginação chama-se `searchAfter` e fica **dentro** do objeto
  `paging` da resposta, não solto na raiz.
- `paging.total` declara o total real de itens da campanha — e já foi
  confirmado, em mais de uma campanha real, que esse total é maior que o
  que uma única chamada retorna (ex: `P-MLB17647056`: 72 itens retornados,
  `total=463` declarado).
- Existe também uma inconsistência ainda não explicada onde `paging.total`
  apareceu **menor** que a quantidade já coletada numa única chamada
  (`P-MLB17801002`: total=53, mas vieram 95 itens) — não investigada a
  fundo, pode ser relevante entender antes de confiar cegamente no
  `total` como validação de completude.

## O que falta fazer

Implementar o loop de paginação em `coletar_promocoes.py` (Fase 3):
buscar a primeira página, checar se `paging.searchAfter` existe, e se
existir, repetir a chamada passando esse valor como parâmetro
`search_after`, acumulando os resultados até o cursor não vir mais (ou até
bater com `paging.total`).

## Impacto enquanto não corrigido

Qualquer análise feita hoje sobre "quantos itens tem uma campanha" ou
"quais itens são candidatos a uma campanha X" usando os dados já
coletados está incompleta para campanhas com mais itens do que uma única
chamada retorna. Não afeta os dados de promoção **por MLB** (Fase 2,
`GET /seller-promotions/items/{MLB}`), que não usa paginação e não tem
esse problema.

## Relacionado

- [[Roster De Campanha Usa Searchafter Dentro De Paging]]