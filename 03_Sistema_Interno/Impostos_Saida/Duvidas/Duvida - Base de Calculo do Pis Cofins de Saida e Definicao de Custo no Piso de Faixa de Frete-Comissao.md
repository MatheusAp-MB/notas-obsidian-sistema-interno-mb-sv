---
tipo: duvida
dominio: 
status: resolvida
criado: 12/09/2026
atualizado_em: 12/09/2026 13:02
relacionado: [Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes), Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo, Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]
---

# Dúvida: Base de Cálculo do PIS/COFINS de Saída e Definição de "Custo" no Piso de Faixa de Frete/Comissão

**Resumo**: 2 divergências reais entre a planilha do superior e o código, encontradas em [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]] — as 2 resolvidas. (1) A base do PIS/COFINS de saída passa a ser `Preço − (Preço × ICMS_MÉDIA ponderada)`, igual à planilha We Stack corrigida — ver [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]. (2) A definição de "custo" no piso de faixa de frete/comissão deixou de ser um problema — `custo_com_boni` fica sempre `None` a partir de agora, então ML/Shopee/TikTok convergem pra `custo` puro na prática — ver [[Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo]].

> [!success] Resolvida — 12/09/2026
> Matheus confirmou as 2 respostas em mensagens separadas. Detalhe de cada resposta nas decisões ligadas.

## Contexto

Durante a comparação entre a planilha de precificação do superior e o código real do Sistema Interno V2 (ver [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]]), 2 pontos apareceram como divergência real de valor calculado — diferente das outras divergências encontradas, que eram claramente evolução de arquitetura (dado fixo de planilha → dado real de nota fiscal). Esses 2 pontos não tinham uma explicação óbvia no código que justificasse a diferença, por isso viraram dúvida em vez de entrar como "achado normal" na descoberta.

## A pergunta (respondida)

1. ~~PIS/COFINS de saída deveria ser calculado sobre `(Preço − Custo)`, como a planilha do superior faz, ou sobre o `Preço` cheio, como o sistema faz hoje?~~ **Respondido**: nenhum dos 2 — a base correta é `Preço − (Preço × ICMS_MÉDIA ponderada)`, igual à planilha We Stack corrigida. Ver [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]].
2. ~~No piso que descarta faixa de frete/comissão abaixo do custo, qual definição de custo é a correta — `custo_com_boni` ou `custo` puro?~~ **Respondido**: deixou de precisar de escolha — `custo_com_boni` fica sempre `None`, os 3 marketplaces resolvem pra `custo` puro na prática, sem precisar refatorar código. Ver [[Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo]].

## O que já se sabia (histórico, mantido pra registro)

- Confirmado com `grep` direto: `pis_saida_valor = preco_final * pis_saida_percentual / 100` e `cofins_saida_valor = preco_final * cofins_saida_percentual / 100`, idêntico em ML (`formula_precificacao.py:358-359`), Raia (`formula_precificacao_raia.py:219-220`) e Shopee (`formula_precificacao_shopee.py:297-298`) — nunca `(preco_final - custo)` em nenhum dos pontos verificados. Essa fórmula está incorreta pela decisão tomada e precisa de correção — ver a decisão ligada.
- Confirmado com `grep` direto: `custo_produto=custo_produto` (onde `custo_produto = produto.custo_com_boni or produto.custo`) em `mercado_livre/formula_precificacao.py:311-318`, contra `custo_produto=produto.custo` em `shopee/formula_precificacao_shopee.py:205` e `tiktok/formula_precificacao_tiktok.py:222`.
- Raia, Magalu e Amazon não têm esse parâmetro — usam `resolver_preco_com_frete_fixo` (frete fixo, sem faixas candidatas) ou loop próprio (Amazon).
- A divergência do item 2 só afetava qual faixa de frete/comissão era descartada de saída como "sempre abaixo do custo" — não afetava o preço final calculado dentro de uma faixa que já passasse no filtro.

## Relacionado

- [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]]
- [[Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo]]
- [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]
