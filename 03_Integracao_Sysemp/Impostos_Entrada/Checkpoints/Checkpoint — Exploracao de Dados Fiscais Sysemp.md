---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 07/08/2026
atualizado_em: 07/08/2026 01:32
relacionado: [Paginacao do Endpoint Manifesto Nota Entrada, Lista de CFOP Relevantes para Precificacao, Custo Medio Ponderado ou Custo Atual para Precificacao, API Sysemp So Retorna a Ultima Nota Fiscal por Produto]
---

# Checkpoint — Exploração de Dados Fiscais Sysemp

## Última atualização (07/08/2026 01:32)

Resumo do dia, na ordem em que aconteceu — pensado pra servir de roteiro de apresentação.

**1. CFOP identificados.** Pesquisado o significado de CFOP 1949 (genérico/coringa), 1916 (retorno de conserto), 1101 (compra pra industrialização) e 1910 (bonificação/doação/brinde), pra completar o que o usuário já sabia (1556 uso/consumo, 2102/1102 revenda, 1653 combustível).

**2. Primeira versão da lista de CFOP pra revenda.** Definida em 3 categorias: revenda (1.102/2.102), bonificação (1.910/2.910), retorno de conserto (1.916/2.916). Script `filtrar_dados_por_cfop.py` criado e validado contra amostra real (49 de 100 registros mantidos).

**3. Investigação da "última nota por produto".** Usuário desconfiou que um produto (7908050719121) que ele sabia ter comprado várias vezes só aparecia 1 vez na API. Descoberta inicial (errada): pensava-se que a API deduplicava pra só a última nota — ver [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]].

**4. Causa real: paginação não tratada.** Toda chamada usava `offset='0'`. Confirmado com testes manuais (offset=0 e offset=100 trazendo NFs diferentes) que o endpoint pagina em blocos de ~100 registros, sem qualquer campo no envelope de resposta (`qtde`) que informe o total real do período.

**5. Correção implementada e validada.** `ImpostosEntradaXML.listar_periodo_completo()` — loop de paginação que para só em página vazia. Validado contra a API real: 100 → 578 registros no período maio–agosto; o produto teste foi de 4 para 21 ocorrências reais, recuperando as notas de 1000 e 8 unidades que o usuário sabia ter dado entrada. Ver [[Paginacao do Endpoint Manifesto Nota Entrada]].

**6. CFOP revalidado com histórico completo.** As 21 ocorrências do produto teste confirmaram a leitura teórica: 15x CFOP 1.102 (compras reais, 30–1344 unidades), 5x CFOP 1.916 (retorno de conserto, sempre poucas unidades: 1, 6, 4, 6, 2), 1x CFOP 1.910 (bonificação). Decisão fechada: custo de aquisição confiável só em 1.102/2.102 — ver [[Lista de CFOP Relevantes para Precificacao]]. A paginação corrigida também eliminou o "risco de perda de histórico" que motivou a descoberta do item 3: as compras reais continuam presentes independente de quantas notas de bonificação/conserto existirem no meio.

**7. Em aberto pra amanhã.** Custo médio ponderado vs. custo atual pra precificação, e se faz sentido tirar média de alíquota — ver [[Custo Medio Ponderado ou Custo Atual para Precificacao]]. Também em aberto: se vale pedir ao suporte Sysemp um endpoint de histórico por produto mais direto, e se o loop de paginação precisa de um limite de segurança contra loop infinito.

## Próximos passos

- Reunião com o superior (07/08/2026): decidir custo médio vs. custo atual.
- Rodar `listar_periodo_completo` contra o histórico completo (desde a fundação da empresa), não só maio–agosto.
- Revisitar a lista de CFOP com o histórico completo (pode aparecer CFOP não visto ainda).
- Decidir se precisa de limite de segurança no loop de paginação.

## Relacionado

- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Lista de CFOP Relevantes para Precificacao]]
- [[Custo Medio Ponderado ou Custo Atual para Precificacao]]
- [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]]
