---
tipo: duvida
dominio: 
status: em_aberto
criado: 12/09/2026
atualizado_em: 12/09/2026 01:02
relacionado: [Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]
---

# Dúvida: Base de Cálculo do PIS/COFINS de Saída e Definição de "Custo" no Piso de Faixa de Frete/Comissão

**Resumo**: 2 divergências reais entre a planilha do superior e o código, encontradas em [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]], que mudam valor calculado mas não são claramente erro nem claramente intencional — precisam de confirmação de Matheus/seu superior. (1) A planilha calcula PIS/COFINS de saída sobre `(Preço − Custo)`; o sistema, nos 6 marketplaces, calcula sobre o `Preço` cheio (igual à base do ICMS de saída). (2) No piso que descarta faixa de frete/comissão abaixo do custo, ML usa `custo_com_boni` e Shopee/TikTok usam `custo` puro — 2 definições diferentes de "custo" pro mesmo propósito, sem explicação encontrada no código pra essa diferença.

> [!question] Em aberto
> Ambas as divergências foram confirmadas com leitura direta do código (models, 6 arquivos de fórmula, `grep` de verificação), mas falta a palavra de Matheus (ou do superior) sobre se são intencionais/corretas como estão ou se precisam de ajuste.

## Contexto

Durante a comparação entre a planilha de precificação do superior e o código real do Sistema Interno V2 (ver [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]]), 2 pontos apareceram como divergência real de valor calculado — diferente das outras divergências encontradas, que eram claramente evolução de arquitetura (dado fixo de planilha → dado real de nota fiscal). Esses 2 pontos não têm uma explicação óbvia no código que justifique a diferença, por isso viram dúvida em vez de entrar como "achado normal" na descoberta.

## A pergunta

1. PIS/COFINS de saída deveria ser calculado sobre `(Preço − Custo)`, como a planilha do superior faz, ou sobre o `Preço` cheio, como o sistema faz hoje (idêntico nos 6 marketplaces)?
2. No piso que descarta faixa de frete/comissão abaixo do custo (só afeta qual faixa é testada, não o preço final resolvido dentro de uma faixa válida), qual definição de custo é a correta — `custo_com_boni` (usado só pelo ML) ou `custo` puro (usado por Shopee e TikTok)? Deveria ser padronizado entre os 3?

## O que já se sabe

- Confirmado com `grep` direto: `pis_saida_valor = preco_final * pis_saida_percentual / 100` e `cofins_saida_valor = preco_final * cofins_saida_percentual / 100`, idêntico em ML (`formula_precificacao.py:358-359`), Raia (`formula_precificacao_raia.py:219-220`) e Shopee (`formula_precificacao_shopee.py:297-298`) — nunca `(preco_final - custo)` em nenhum dos pontos verificados.
- Confirmado com `grep` direto: `custo_produto=custo_produto` (onde `custo_produto = produto.custo_com_boni or produto.custo`) em `mercado_livre/formula_precificacao.py:311-318`, contra `custo_produto=produto.custo` em `shopee/formula_precificacao_shopee.py:205` e `tiktok/formula_precificacao_tiktok.py:222`.
- Raia, Magalu e Amazon não têm esse parâmetro — usam `resolver_preco_com_frete_fixo` (frete fixo, sem faixas candidatas) ou loop próprio (Amazon), então a pergunta 2 só vale para ML/Shopee/TikTok.
- A divergência do item 2 só afeta qual faixa de frete/comissão é descartada de saída como "sempre abaixo do custo" — não afeta o preço final calculado dentro de uma faixa que já passou no filtro.

## Relacionado

- [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]]
