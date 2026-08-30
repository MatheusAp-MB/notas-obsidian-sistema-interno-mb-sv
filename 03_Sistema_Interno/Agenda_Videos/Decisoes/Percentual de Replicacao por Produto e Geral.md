---
tipo: decisao
dominio: 
status: ativa
criado: 05/08/2026
atualizado_em: 05/08/2026 19:40
relacionado: [Checkpoint Testes Automatizados Agenda Videos]
---

# Percentual de Replicação por Produto e Geral

## Objetivo

Mostrar, ao final de cada execução de Replicação Automática, quão bem-sucedida ela foi de verdade. O ciclo é sempre marcado como replicado/aprovado independente do resultado — esse número é o único jeito de saber se algo precisa ser investigado. Meta mínima: 90% (100% é o ideal, mas o ML tem comportamento inconsistente reconhecido).

## Fórmula por produto

- `quantidade_mlbs_produto`: total de MLBs daquele produto, capturado na LISTAGEM da execução (antes de qualquer tentativa de replicar) — nunca recalculado no fim.
- `% sucesso` = mlbs replicados com sucesso ÷ `quantidade_mlbs_produto`
- `% falha` = mlbs que falharam ÷ `quantidade_mlbs_produto`
- Assert: `% sucesso + % falha == 100%` — se não bater, há incoerência real (ex.: 1 MLB que não foi nem replicado nem reportado como falha).

## Fórmula geral (execução toda)

Soma simples dos totais brutos de todos os produtos da execução — nunca média das porcentagens individuais (evitaria distorção entre produtos com quantidades diferentes de MLB).

- `total_geral` = soma de `quantidade_mlbs_produto` de todos os produtos da execução
- `total_sucesso` = soma dos replicados com sucesso de todos
- `total_falha` = soma dos que falharam de todos
- `% geral sucesso` = total_sucesso ÷ total_geral
- `% geral falha` = total_falha ÷ total_geral
- Mesmo assert: soma == 100%

## Por que o denominador precisa ser independente

Se `quantidade_mlbs_produto` fosse calculado como `replicados + falharam` (em vez de medido antes, na listagem), o assert de 100% nunca poderia falhar — seria uma tautologia, não uma checagem de integridade real. O valor precisa vir de uma medição separada, feita no momento da listagem (mesma função que já existe, `_obter_outros_mlbs`), pra que uma divergência real (MLB esquecido, agente que não reportou) apareça no assert.

## Lacuna de schema encontrada

Hoje `CicloVideo.mlbs_replicados` / `mlbs_nao_encontrados` (JSONField) guardam o resultado por CICLO, não por execução, e são sobrescritos a cada replicação. Não existe nenhum campo guardando `quantidade_mlbs_produto` de forma independente. Vai ser necessário um campo novo, provavelmente em `ItemExecucaoReplicacao` (registro por produto dentro de 1 execução específica), capturado na criação do item (listagem) — o que exige uma migration.

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
