---
tipo: descoberta
dominio: fiscal
status: corrigida
criado: 09/08/2026
atualizado_em: 09/08/2026 16:40
relacionado: [Plano em Etapas do Duble de Precificacao ML, Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST, Achados de Imposto Sempre Aguardam Validacao do Tributario]
---

# Bug ICMS ST Fantasma Quando Não Há Substituição Tributária

## Contexto

Testando o dublê com 3 produtos reais (1 de cada tributação — Tributado, Redução, ST — escolhidos pra fechar a dúvida sobre se "Redução" precisa do mesmo tratamento de diferimento que "ST"), comparando Custo Final contra a planilha real do superior linha a linha.

## O bug

`_exibir_calculo_didatico_icms_st` calculava a fórmula de substituição tributária (`valor_líquido = (base × alíquota) − valor_icms_normal`) incondicionalmente, mesmo quando a nota não tem ICMS ST nenhum (`Base de Cálculo ICMS ST = 0`, produto não é substituição tributária). Sem ICMS ST de verdade, `valor_bruto = 0`, e a subtração ainda rodava: `0 − valor_icms_normal`, virando um número NEGATIVO — um "crédito" de ICMS ST que não existe, sendo somado ao Custo Final (Etapa 5) e reduzindo ele indevidamente.

Isso não é uma questão de interpretação tributária — é erro de lógica puro: produto sem ICMS ST não deveria gerar valor de ICMS ST nenhum (nem positivo, nem negativo), só R$ 0,00. Por isso, diferente da maioria das notas deste domínio, esta correção não precisa de "aguardando validação do tributário/superior" — a checagem é a mesma condição que já define "é ST?" na Etapa 8 (`IcmsSt.valor > 0` ou `IcmsSt.base_calculo > 0`), já usada e aceita no dublê.

## Impacto encontrado (antes da correção)

| Produto | Custo Final com bug | Custo Final corrigido |
|---|---|---|
| SB-630 (Tributado, EAN 7908050734971) | R$ 1.063,01 | R$ 1.296,35 |
| Guarany S4 20L (Redução, EAN 7891988035770) | R$ 825,11 | R$ 901,99 |
| K-430 (ST, EAN 7908050700174) | R$ 614,04 | R$ 614,04 (sem alteração — produto tem ICMS ST de verdade) |

## Correção aplicada

Guarda no início de `_exibir_calculo_didatico_icms_st`: se `icms_st.valor <= 0` e `icms_st.base_calculo <= 0`, imprime uma mensagem simples ("Nota sem ICMS ST...") e retorna `0.0` direto, sem rodar a fórmula de substituição tributária.

## Validação contra a planilha real (09/08/2026)

Depois da correção, Custo Final do dublê bate quase exato com a planilha nos 3 produtos — a diferença que resta é sempre a mesma e já tem causa conhecida (campo `frete_cif_fob` zerado no banco, ver [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]]):

| Produto | Custo Final planilha | Custo Final dublê (corrigido) | Diferença | Diferença = Frete CIF/FOB da planilha? |
|---|---|---|---|---|
| SB-630 (Tributado) | R$ 1.309,3135 | R$ 1.296,35 | R$ 12,96 | Sim — 1% de R$ 1.296,35 |
| Guarany S4 (Redução) | R$ 936,936 | R$ 901,99 | R$ 34,95 | Sim — 4% de R$ 873,60 |
| K-430 (ST) | R$ 619,69874 | R$ 614,04 | R$ 5,66 | Sim — 1% de R$ 566,27 |

ICMS entrada e IPI batem exatos nos 3 (validação já esperada, confirmada de novo aqui). ICMS ST líquido do K-430 continua batendo com o `ST Valor` da planilha (achado já registrado em [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]]).

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]]
- [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]]
- [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]
