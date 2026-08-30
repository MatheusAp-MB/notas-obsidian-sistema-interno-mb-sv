---
tipo: decisao
dominio: 
status: ativa
criado: 07/08/2026
atualizado_em: 15/08/2026 14:05
relacionado: [Paginacao do Endpoint Manifesto Nota Entrada, API Sysemp So Retorna a Ultima Nota Fiscal por Produto, Custo Atual Escolhido para Precificacao dos Produtos Sysemp, Bonificacao Removida do Filtro de CFOP de Impostos de Entrada, Por Que o Filtro de CFOP Usa Cadastro e Nao XML]
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

## Atualização (07/08/2026, 11:26) — lista definitiva ampliada pelo superior

Reunião do usuário com seu superior fechou a lista definitiva de CFOPs válidos como entrada de compra/bonificação — **6 códigos**, não 4:

- **1.102 / 2.102** — compra pra revenda (já documentado acima).
- **1.403 / 2.403** — novo nesta atualização. Significado exato não verificado por pesquisa externa (2 tentativas de busca não retornaram nada útil), mas o usuário confirmou que os códigos estão corretos e não precisa de confirmação de significado — entendimento do Claude, não confirmado formalmente: compra pra revenda sob regime de substituição tributária (ICMS-ST), mesma natureza de 1.102/2.102 só que noutro regime fiscal.
- **1.910 / 2.910** — bonificação (já documentado acima, continua sem custo real).

**1.916/2.916 (retorno de conserto) continua FORA da lista** — nenhuma mudança aí, consistente com o motivo original (não é compra nem bonificação).

Isso não contradiz a decisão de custo original (só 1.102/2.102 tinham custo confiável) — 1.403/2.403 é a mesma natureza de compra, só que faltava na lista. Bonificação continua sendo "válida" como entrada real de produto, mas sem custo de aquisição — ver a pergunta ainda aberta sobre isso em [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]].

## Atualização (15/08/2026, 13:28) — bonificação removida da lista

Decisão nova do usuário: bonificação (1.910/2.910) sai de `CFOPS_PARA_MANTER`. A partir de agora esta lista representa só CFOP de compra real (1.102/2.102, 1.403/2.403) — 4 códigos, não mais 6. Motivo completo, contexto e efeito colateral (resolve por eliminação a dúvida de bonificação como "nota mais recente") documentados em [[Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]].

Isso reverte parcialmente a atualização de 07/08/2026 logo acima — a parte de retorno de conserto (1.916/2.916 fora da lista) continua valendo sem mudança.

## Relacionado

- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]]
- [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]
