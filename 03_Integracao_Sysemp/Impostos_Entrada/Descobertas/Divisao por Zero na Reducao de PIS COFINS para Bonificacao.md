---
tipo: bug_conhecido
dominio: fiscal
status: corrigido
criado: 15/08/2026
atualizado_em: 15/08/2026 15:05
relacionado: [Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total, Lista de CFOP Relevantes para Precificacao, Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]
---

# Divisão por Zero na Redução de PIS/COFINS (Notas de Bonificação)

## O bug

`_calcular_percentual_de_reducao(base_calculo, custo_total)`, em `dados_xml_nf.py`, dividia `base_calculo / custo_total` sem checar se `custo_total` era zero. CFOP de bonificação (1.910/2.910) tem `custo_total = 0` por definição — o produto é recebido de graça, não tem custo de aquisição real (ver [[Lista de CFOP Relevantes para Precificacao]]). Toda vez que uma nota de bonificação chegava até essa função, o cálculo estourava `ZeroDivisionError`.

## Por que isso não era pego antes

`persistir_selecionados_no_banco` (`orquestrador.py`) só captura `(KeyError, ValueError, TypeError)` por registro — `ZeroDivisionError` não está nessa lista. Então, em vez de virar 1 pendência isolada (como os outros erros de registro), o erro subia sem tratamento e derrubava a sincronização inteira.

## A correção

Usuário confirmou (15/08/2026): "pode ser 0 ne, parece mais correto" — quando `custo_total == 0`, a função devolve `reducao = 0.0` direto, sem tentar a divisão.

## Como isso se conecta com a bonificação sair do filtro

No mesmo dia, decidiu-se remover bonificação do filtro de CFOP por completo (ver [[Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]]) — depois dessa mudança, notas de bonificação nem chegam mais em `dados_xml_nf.py` na prática. Esta correção continua válida mesmo assim, como defesa em profundidade: se algum dia bonificação voltar a ser lida por outro motivo (fora do escopo de precificação), o cálculo não quebra.

## Relacionado

- [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]
- [[Lista de CFOP Relevantes para Precificacao]]
- [[Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]]
