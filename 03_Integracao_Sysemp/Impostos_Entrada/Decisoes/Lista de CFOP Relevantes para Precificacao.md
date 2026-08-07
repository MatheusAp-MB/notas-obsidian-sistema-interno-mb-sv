---
tipo: decisao
dominio: 
status: ativa
criado: 07/08/2026
atualizado_em: 07/08/2026 01:32
relacionado: [Paginacao do Endpoint Manifesto Nota Entrada, API Sysemp So Retorna a Ultima Nota Fiscal por Produto]
---

# Lista de CFOP Relevantes para Precificação

## Contexto

Objetivo: ler os impostos de cada nota de entrada e associar ao produto certo, pra precificar corretamente. Nem toda entrada é uma compra de mercadoria pra revenda — precisa filtrar por CFOP antes de usar o dado como custo de aquisição.

## Categorias identificadas (amostra real, maio–agosto/2026, após corrigir a paginação)

- **Revenda (custo confiável)**: 1.102 / 2.102 — compra de mercadoria pra revenda. Única categoria com valor de aquisição real e volume compatível com reposição de estoque (produto teste teve 15 ocorrências, quantidades de 30 a 1344 unidades).
- **Bonificação (sem custo real)**: 1.910 / 2.910 — mercadoria recebida de graça (bonificação/doação/brinde). Produto existe fisicamente, mas não tem custo de aquisição real associado.
- **Retorno de conserto (não é compra)**: 1.916 / 2.916 — retorno de mercadoria/bem enviado pra conserto ou reparo. Confirmado empiricamente que as quantidades são pequenas (1, 6, 4, 6, 2 unidades no produto teste) comparado às compras reais — consistente com devolução pontual de garantia, não reposição de estoque.

Fora do filtro (confirmado pelo usuário): 1.556 (uso e consumo), 1.653 (combustível), 1.101/2.101 (compra pra industrialização, não pra revenda).

## Decisão

Pra fins de **custo de aquisição** (precificação), usar só 1.102/2.102. Bonificação (1.910/2.910) e retorno de conserto (1.916/2.916) ficam de fora do cálculo de custo — não porque o produto seja irrelevante, mas porque essas notas não carregam custo de aquisição real.

Isso só é seguro depois da correção de paginação (ver [[Paginacao do Endpoint Manifesto Nota Entrada]]): antes, excluir 1.916 podia parecer arriscado (medo de perder o único registro do produto). Com o histórico completo, as compras reais (1.102/2.102) continuam presentes independente de quantas notas de bonificação/conserto existirem no meio — não tem perda de dado ao excluir essas categorias.

## Em aberto

Lista baseada numa amostra de ~3 meses (maio–agosto/2026), não no histórico completo desde a fundação da empresa. Revisar quando rodar a importação histórica completa — pode aparecer CFOP não visto ainda (ex: devolução de compra, consignação, transferência entre filiais).

## Relacionado

- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]]
