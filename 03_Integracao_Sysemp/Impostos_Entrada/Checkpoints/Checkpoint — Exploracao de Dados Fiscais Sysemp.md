---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 07/08/2026
atualizado_em: 07/08/2026 11:26
relacionado: [Paginacao do Endpoint Manifesto Nota Entrada, Lista de CFOP Relevantes para Precificacao, Custo Medio Ponderado ou Custo Atual para Precificacao, API Sysemp So Retorna a Ultima Nota Fiscal por Produto, Custo Atual Escolhido para Precificacao dos Produtos Sysemp]
---

# Checkpoint — Exploração de Dados Fiscais Sysemp

## Última atualização (07/08/2026 11:26)

Reunião com o superior aconteceu (item 7 da atualização anterior). 2 resultados: **custo atual** escolhido (não médio ponderado) — ver [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]], que resolve [[Custo Medio Ponderado ou Custo Atual para Precificacao]]; e a lista de CFOP válidos ampliada de 4 pra 6 códigos, com **1.403/2.403** entrando como compra/bonificação válida — ver atualização em [[Lista de CFOP Relevantes para Precificacao]]. Sub-questão de alíquota não tratada, continua em aberto. Novo ponto em aberto, adiado de propósito pelo usuário: como tratar bonificação (custo zero) quando ela é a nota mais recente de um produto sob a lógica de "custo atual" — decisão explícita de não resolver agora, só "conforme formos seguindo".

Fora do domínio fiscal: a pasta vazia `03_ERP_Analytics_HUB/` (criada antes deste mundo ganhar nome definitivo) foi removida — `03_Integracao_Sysemp/` confirmado como nome definitivo do mundo.

**Próximo passo real:** começar a implementar a lógica de custo atual em código (ainda não escrita — só as decisões de negócio estavam prontas até aqui).

## Última atualização (07/08/2026 01:32) — histórico

Resumo do dia, na ordem em que aconteceu — pensado pra servir de roteiro de apresentação.

**1. CFOP identificados.** Pesquisado o significado de CFOP 1949 (genérico/coringa), 1916 (retorno de conserto), 1101 (compra pra industrialização) e 1910 (bonificação/doação/brinde), pra completar o que o usuário já sabia (1556 uso/consumo, 2102/1102 revenda, 1653 combustível).

**2. Primeira versão da lista de CFOP pra revenda.** Definida em 3 categorias: revenda (1.102/2.102), bonificação (1.910/2.910), retorno de conserto (1.916/2.916). Script `filtrar_dados_por_cfop.py` criado e validado contra amostra real (49 de 100 registros mantidos).

**3. Investigação da "última nota por produto".** Usuário desconfiou que um produto (7908050719121) que ele sabia ter comprado várias vezes só aparecia 1 vez na API. Descoberta inicial (errada): pensava-se que a API deduplicava pra só a última nota — ver [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]].

**4. Causa real: paginação não tratada.** Toda chamada usava `offset='0'`. Confirmado com testes manuais (offset=0 e offset=100 trazendo NFs diferentes) que o endpoint pagina em blocos de ~100 registros, sem qualquer campo no envelope de resposta (`qtde`) que informe o total real do período.

**5. Correção implementada e validada.** `ImpostosEntradaXML.listar_periodo_completo()` — loop de paginação que para só em página vazia. Validado contra a API real: 100 → 578 registros no período maio–agosto; o produto teste foi de 4 para 21 ocorrências reais, recuperando as notas de 1000 e 8 unidades que o usuário sabia ter dado entrada. Ver [[Paginacao do Endpoint Manifesto Nota Entrada]].

**6. CFOP revalidado com histórico completo.** As 21 ocorrências do produto teste confirmaram a leitura teórica: 15x CFOP 1.102 (compras reais, 30–1344 unidades), 5x CFOP 1.916 (retorno de conserto, sempre poucas unidades: 1, 6, 4, 6, 2), 1x CFOP 1.910 (bonificação). Decisão fechada: custo de aquisição confiável só em 1.102/2.102 — ver [[Lista de CFOP Relevantes para Precificacao]]. A paginação corrigida também eliminou o "risco de perda de histórico" que motivou a descoberta do item 3: as compras reais continuam presentes independente de quantas notas de bonificação/conserto existirem no meio.

**7. Em aberto pra amanhã.** Custo médio ponderado vs. custo atual pra precificação, e se faz sentido tirar média de alíquota — ver [[Custo Medio Ponderado ou Custo Atual para Precificacao]]. Também em aberto: se vale pedir ao suporte Sysemp um endpoint de histórico por produto mais direto, e se o loop de paginação precisa de um limite de segurança contra loop infinito.

## Próximos passos

- ~~Reunião com o superior (07/08/2026): decidir custo médio vs. custo atual.~~ — feito, custo atual escolhido.
- Implementar a lógica de custo atual em código.
- Rodar `listar_periodo_completo` contra o histórico completo (desde a fundação da empresa), não só maio–agosto.
- Revisitar a lista de CFOP com o histórico completo (pode aparecer CFOP não visto ainda) — agora com 6 códigos, não 4.
- Decidir se precisa de limite de segurança no loop de paginação.
- Em algum momento (adiado de propósito): decidir como "custo atual" trata bonificação sendo a nota mais recente.

## Relacionado

- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Lista de CFOP Relevantes para Precificacao]]
- [[Custo Medio Ponderado ou Custo Atual para Precificacao]]
- [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]]
- [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]
