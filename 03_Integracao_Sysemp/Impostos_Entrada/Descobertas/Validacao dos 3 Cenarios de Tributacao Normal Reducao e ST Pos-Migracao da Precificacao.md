---
tipo: descoberta
dominio: fiscal
status: confirmada
criado: 16/08/2026
atualizado_em: 16/08/2026 21:59
relacionado: [Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08), Migracao da Precificacao Real para Usar Impostos de Entrada Validados, Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria, Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST, Plano em Etapas do Duble de Precificacao ML]
---

# Validação dos 3 Cenários de Tributação (Normal, Redução e ST) Pós-Migração da Precificação

## Contexto

Fechamento da Etapa 4 do checklist de migração — depois de confirmar regressão limpa em `impostos` e os 6 comandos reais rodando sem erro de assert, faltava confirmar que o crédito fiscal calculado pela `FormulaPrecificacao` bate certo nos 3 cenários de tributação possíveis (mesma categorização usada desde a validação do dublê, 09/08): **Tributado** (crédito = valor cheio), **Redução** (base/alíquota já reduzidas antes da API devolver o valor) e **Substituição Tributária** (crédito líquido = ST − normal, com diferimento).

Método: script standalone (`python arquivo.py` — `manage.py shell` quebra com stdin redirecionado neste ambiente) usando Rich pra montar 1 tabela por produto, comparando o crédito esperado (calculado a mão a partir de `produto.impostos_entrada`) contra o `credito_icms_entrada`/`credito_pis`/`credito_cofins` real, gravado em `GradePrecificacaoML.detalhamento['intermediarios']` pela fórmula de produção (fallback ML, tipo Clássico, margem Padrão).

## Os 3 produtos de referência

| Cenário | Produto | EAN | SKU | Cód. Fabricante | Marca |
|---|---|---|---|---|---|
| Tributado | Soprador de Folhas Costal a Gasolina 26cc Motor 2 Tempos 1HP | `7896692199367` | F7896692199367.001 | EB-260F | BRUDDEN |
| Redução | Pulverizador Bomba Costal Anti-Incêndio Guarany S4 20L | `7891988035770` | F7891988035770.001 | 0431.30.00 | Guarany |
| ST | Roçadeira a Gasolina Lateral Motor 2 Tempos 42,7cc 1,7HP 1,26kW Tubo 28mm | `7908050700174` | F79080507000174.001 | K-430 | BRUDDEN |

**Achado lateral**: o produto usado como referência de "Tributado" na validação original do dublê (09/08) — SB-630, EAN `7908050734971` — não está mais confirmado como produto real: conferido no Excel usado pra popular o banco, ele não aparece cadastrado, e o usuário não consegue garantir hoje que ele já foi de fato comprado/comercializado. Substituído aqui pelo Soprador EB-260F, que cobre o mesmo cenário (Tributado, sem redução, sem ST) com dado confirmado no banco atual.

## Resultado — os 3 batem exato

| Cenário | Redução ICMS | Crédito ICMS/un. (esperado → obtido) | Crédito PIS/un. | Crédito COFINS/un. | Preço final | Margem obtida |
|---|---|---|---|---|---|---|
| Tributado | 0% | 111,0433 → 111,0433... | 8,3467 → 8,3467... | 38,4467 → 38,4467... | R$ 657,90 | 15,01% |
| Redução | 51,11% | 74,342 → 74,342 | 12,712 → 12,712 | 58,554 → 58,554 | R$ 1.075,90 | 15,03% |
| ST | — (diferimento) | −13,382 → −13,382 | 8,82 → 8,82 | 40,626 → 40,626 | R$ 991,90 | 15,00% |

Todos os 9 pares (3 créditos × 3 produtos) bateram dentro da tolerância — na prática, exatos (a diferença de casas decimais entre "esperado" e "obtido" é só notação do `Decimal`, não divergência de valor real).

## Conclusão

Os 2 cálculos que a migração precisava garantir — **redução já embutida no `valor` que vem da API** (não recalculada, nem ignorada, dentro da precificação) e **diferimento do crédito de ICMS ST** (líquido, sem duplicar) — estão corretos nos 3 cenários possíveis, com dado real e produtos que já tinham sido validados manualmente antes (Redução e ST desde o dublê). Isso fecha, com confiança de ponta a ponta, a migração da precificação pra consumir `impostos_entrada`.

## Relacionado

- [[Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08)]]
- [[Migracao da Precificacao Real para Usar Impostos de Entrada Validados]]
- [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]
- [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]]
- [[Plano em Etapas do Duble de Precificacao ML]]
