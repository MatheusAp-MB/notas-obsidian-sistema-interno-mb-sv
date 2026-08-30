---
tipo: decisao
dominio: 
status: ativa
criado: 15/08/2026
atualizado_em: 15/08/2026 15:05
relacionado: [Lista de CFOP Relevantes para Precificacao, Custo Atual Escolhido para Precificacao dos Produtos Sysemp, Contencao de Erro por Registro no Filtro e Selecao de Impostos de Entrada]
---

# Bonificação Removida do Filtro de CFOP de Impostos de Entrada

## Contexto — as 3 etapas do pipeline

O pipeline que lê impostos de entrada do Sysemp (`sincronizar_impostos_entrada_xml`, em `integracao_sysemp/servicos/orquestrador.py`) processa os dados em 3 etapas, em sequência:

1. **Dados Brutos** — literalmente tudo que a API do Sysemp devolve pro período pedido, sem filtro nenhum.
2. **Dados Filtrados** (código em `filtro_cfop.py`, lista `CFOPS_PARA_MANTER`) — só fica o que for CFOP relevante pra precificação. Até 15/08/2026, essa lista tinha 6 códigos.
3. **Dados Recentes** (código em `selecao_nota_recente.py`) — de tudo que sobrou no filtro, pega só a nota mais recente de cada produto. É essa nota que vira o "custo atual" usado na precificação (ver [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]).

## O que mudou

Até hoje, "Dados Filtrados" misturava 2 grupos de CFOP bem diferentes na mesma lista:

- **CFOP de compra real** (1.102/2.102, 1.403/2.403) — tem custo de aquisição confiável, é o que a empresa realmente pagou pelo produto.
- **CFOP de bonificação** (1.910/2.910) — produto recebido de graça (bonificação/doação/brinde). Existe fisicamente, mas custo de aquisição é R$ 0 por definição.

Bonificação tinha sido incluída nessa lista em 07/08/2026, validada em reunião com o superior do usuário — na época, a lógica era "o produto entrou de verdade, então vale rastrear a entrada, mesmo sem custo" (ver a seção "Atualização" em [[Lista de CFOP Relevantes para Precificacao]]).

**Decisão de hoje (15/08/2026, 13:28):** bonificação sai completamente de "Dados Filtrados". Essa etapa passa a representar só "CFOP de compra" — coisa que a empresa pagou pra ter. `CFOPS_PARA_MANTER` fica só com 1.102/2.102/1.403/2.403 (4 códigos, não mais 6). Retorno de conserto (1.916/2.916) já estava fora e continua fora — nenhuma mudança aí.

## Por que isso importa — resolve uma dúvida que estava em aberto

A nota [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]] registrava uma pergunta deixada em aberto de propósito em 07/08/2026: se a nota mais recente de um produto (etapa 3, "Dados Recentes") fosse uma bonificação, o sistema deveria pular ela e procurar a última nota de COMPRA de verdade, ou deixar o custo zero da bonificação prevalecer naquele momento?

Com bonificação fora de "Dados Filtrados", essa pergunta deixa de fazer sentido — a etapa 3 nunca mais vê uma nota de bonificação, porque ela nem chega até ali. A dúvida fica resolvida por eliminação, não por uma regra nova de desempate entre tipos de nota.

## O que isso NÃO muda

Bonificação continua existindo na API do Sysemp e aparece normalmente nos Dados Brutos (etapa 1) — ela só deixa de passar pelo filtro de precificação. Se no futuro for preciso rastrear entrada de bonificação por outro motivo (não relacionado a custo/precificação), isso é escopo de um pipeline ou comando separado — não faz parte deste domínio.

## Implementado e validado (15/08/2026, 15:05)

`'1.910', '2.910'` removidos de `CFOPS_PARA_MANTER`, comentário do filtro atualizado. Junto com essa mudança, `filtrar_por_cfop()` e `selecionar_nota_mais_recente_por_produto()` ganharam contenção de erro por registro (ver [[Contencao de Erro por Registro no Filtro e Selecao de Impostos de Entrada]]) — 1 registro malformado não derruba mais o lote inteiro. `filtro_cfop.py`, `orquestrador.py` e `selecao_nota_recente.py` validados em 100% cover, 0 Miss, 0 BrPart, suíte completa rodada sem falha nova.

## Relacionado

- [[Lista de CFOP Relevantes para Precificacao]]
- [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]
- [[Contencao de Erro por Registro no Filtro e Selecao de Impostos de Entrada]]
