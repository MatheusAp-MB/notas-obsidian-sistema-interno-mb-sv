---
tipo: decisao
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# Filtrar Fósseis de Migração na Camada de Consumo, Nunca na Coleta

MLBs marcados com a tag `variations_migration_source` (resíduo de uma
migração antiga de variações do Mercado Livre) devem ser excluídos da
árvore/contagem apresentada ao usuário — mas essa exclusão acontece na
camada de consumo (Django), nunca dentro dos scripts de coleta bruta
(`buscar_mlbs.py` / `buscar_detalhes.py`).

## Contexto que levou à decisão

Foi reportado, do lado do projeto Django, um caso real de MLB "fóssil"
(`MLB2751408939`, "Chinelo Slide Feminino") aparecendo com 48 variações
vinculadas, todas `status: closed`, todas com a tag
`variations_migration_source` — inflando artificialmente contagens
agregadas (1 MLB fechado contando como 48 "anúncios" na árvore).

A pergunta original era se esse filtro deveria acontecer já na varredura
(`buscar_mlbs.py`, que já itera por combinação de status) ou depois, em
pós-processamento.

## Alternativas descartadas

- **Filtrar `status=closed` inteiro na coleta** — descartado porque
  `closed` não é sinônimo de "lixo a descartar" neste projeto; já existem
  casos de MLBs `closed` com valor de negócio real (ex: um catálogo
  encerrado que ajudou a confirmar o comportamento do MLBU compartilhado
  entre pares). Excluir todo `closed` na fonte destruiria dado que já foi
  usado em investigações reais.
- **Filtrar por status na origem, de forma geral** — descartado pelo
  mesmo motivo: o critério certo não é status, é a tag específica
  `variations_migration_source`.

## Decisão tomada

- `buscar_mlbs.py` e `buscar_detalhes.py` continuam coletando **tudo**,
  sem filtro de status ou de tag — preserva a filosofia de completude
  ("melhor ter e não usar") que o projeto já segue desde o início.
- O filtro acontece na camada que monta a árvore/contagem do lado Django:
  um campo booleano (`eh_fossil_migracao`) é calculado na importação a
  partir da tag, e usado para excluir esses MLBs da contagem — sempre,
  sem opção de desligar.

## Resultado observado após aplicar

107 MLBs identificados e excluídos do lado Django — resolveu sozinho uma
divergência de contagem que já vinha sendo rastreada (5.831 → 5.724
anúncios, exatamente -107).

## Relacionado

- [[Regras Gerais]]