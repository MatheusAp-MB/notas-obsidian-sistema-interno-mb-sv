---
tipo: bug_conhecido
dominio: python
status: em_aberto
criado: 10/09/2026
atualizado_em: 10/09/2026 13:55
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]
---

# Bug Conhecido: FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90

**Resumo**: depois de preencher os 4 campos fiscais de saída e recalcular as grades, as fórmulas de Raia e Magalu passaram a levantar 8 erros de assert (2 produtos × 4 margens cada), sempre com a mesma mensagem: "margem obtida ficou ABAIXO da margem-alvo". A causa mecânica foi confirmada logo de início por leitura de código: o "FIXO" dessas 2 fórmulas fica negativo quando o crédito fiscal de entrada (ICMS+PIS+COFINS) é maior que custo+coleta+armazenagem — e quando isso acontece, o arredondamento RoundUp90 (que deveria só aumentar a margem) na verdade diminui, quebrando a garantia que o assert cobra. **O que faltava era o "porquê" do crédito ficar desproporcional — isso já está confirmado (ver atualização de 10/09, 13:55 abaixo), com dado real da nota fiscal.**

> [!success] Causa raiz CONFIRMADA com dado real (10/09/2026, 13:55) — falta decidir e aplicar a correção
> Não é a hipótese de diferimento de ICMS ST que estava sendo cogitada — os 2 produtos não estão em regime ST. A causa real: `produto.custo` e `produto.custo_com_boni` estão os dois zerados/vazios pros 2 SKUs problemáticos, o que faz o `custo_final` da fórmula colapsar pra só o crédito de IPI por unidade, enquanto os créditos de ICMS/PIS/COFINS continuam em tamanho real (vindos da nota fiscal de verdade). Detalhe completo na seção "Causa Raiz Confirmada com Dado Real" abaixo. Falta: (1) decidir a correção (nível de dado vs. nível de fórmula); (2) levantar se outros produtos ativos têm o mesmo problema de cadastro.

## Contexto

Depois da Camada 1 de [[Checkpoint - Inicio da Estrutura de Impostos de Saida|Impostos de Saída]] (os 4 campos fiscais de saída preenchidos com dado real da planilha Busca Legal), o usuário rodou `calcular_todas_as_grades_precificacao` nas 2 empresas, recalculando as 6 grades de precificação. As grades de RAIA e MAGALU vieram com 8 erros de assert no terminal — as outras 4 (ML, TikTok, Amazon, Shopee) vieram limpas (usam outro caminho de goal-seek, que não faz o mesmo assert nesse formato — ver seção "O que levou à resposta").

## O problema

Os 8 erros aparecem sempre nos mesmos 2 produtos, nas 4 margens, nos 2 marketplaces:

```
7909436926904 — CONJUNTO REP. MOTOR 1.0 CV 127V | minima | Margem obtida (9.45%) ficou ABAIXO da margem-alvo (10.0%) com frete real fixo — RoundUp90 deveria garantir margem sempre >= meta.
7891988014072 — PARTE APARELHO MECANICO/KIT DA BARRA... | competicao | Margem obtida (-2.53%) ficou ABAIXO da margem-alvo (5.00%) com frete real fixo — RoundUp90 deveria garantir margem sempre >= meta.
(+ 6 combinações iguais, mesma dupla de produtos, nas outras margens/marketplace)
```

`RoundUp90` (`goal_seek.py`) foi desenhado pra nunca deixar isso acontecer — o preço final sempre arredonda pra CIMA, nunca pra baixo, o que deveria garantir margem final ≥ meta sempre. Por que a garantia falhou justo nesses 2 produtos?

## O que levou à resposta

1. **Descartado como problema dos 4 campos de saída em si**: `resolver_preco_com_frete_fixo()` (usada por Raia e Magalu) calcula `margem% = (1 − taxa) − FIXO_total/preço`, onde `taxa` inclui os campos recém-preenchidos (comissão + ICMS saída + PIS + COFINS) e `FIXO_total = fixo + frete`. Essa função é crescente em relação ao preço **sempre que `FIXO_total` é positivo** — não importa o valor de `taxa`, desde que o denominador `(1 − taxa − margem-alvo)` continue positivo (já checado antes, senão a função devolve `None`). Ou seja, o valor da taxa sozinho não devia derrubar a garantia.
2. **Isolado o `fixo` como suspeito**: tanto `formula_precificacao_raia.py` quanto `formula_precificacao_magalu.py` calculam `fixo = coleta + armazenagem + custo_final − (crédito ICMS entrada + crédito PIS + crédito COFINS)`. Se o crédito de entrada desses 2 produtos for maior que `coleta + armazenagem + custo_final`, `fixo` fica **negativo**.
3. **Confirmada a consequência matemática**: com `FIXO_total = fixo + frete` negativo, a fórmula `margem% = (1 − taxa) − FIXO_total/preço` deixa de ser crescente e passa a ser **decrescente** em relação ao preço — nesse caso, arredondar pra CIMA (RoundUp90) reduz a margem em vez de aumentar, exatamente o oposto do que o assert espera.
4. **Confirmado por que os mesmos 2 produtos falham nos 2 marketplaces ao mesmo tempo**: Raia e Magalu usam a mesma fórmula de `fixo` (coleta+armazenagem+custo_final−créditos) e o mesmo motor `resolver_preco_com_frete_fixo()` — os créditos de entrada vêm de `produto.impostos_entrada`, o mesmo dado pras 2 empresas/marketplaces, então um crédito desproporcional nesses 2 produtos afeta os 2 caminhos igual. `fixo` é calculado do mesmo jeito nos 6 marketplaces (é código compartilhado), mas ML, TikTok, Amazon e Shopee usam outro motor de goal-seek (faixa de frete ou faixa de comissão), que absorve um `fixo` negativo sem estourar esse assert específico — por isso não aparecem na lista de erros, mesmo com o mesmo desequilíbrio por trás.

## Causa Raiz Confirmada com Dado Real (10/09/2026, 13:55)

Validação feita com o novo Duble de Precificação (Excel de 8 abas, busca todos os campos de auditoria — inclusive o XML de entrada da nota fiscal — direto do banco, sem precisar abrir o Django Admin).

**Hipótese de diferimento de ICMS ST descartada**: a aba "Impostos Entrada (XML)" mostra que nenhum dos 2 produtos problemáticos está em regime ST (`regime_st = Não` pros 2). O produto de referência (sem erro) usa CST 51 (diferimento estadual, ICMS = 0 na nota) — mecanismo diferente, sem relação com ICMS ST. A lógica de crédito líquido pra produtos ST (`creditos_fiscais_para_precificacao.py`) nem chega a ser acionada nesses 2 casos.

**Causa real confirmada**: `produto.custo` **e** `produto.custo_com_boni` estão os dois zerados/vazios pros 2 SKUs problemáticos. `calcular_custo_final()` faz `custo_com_boni = produto.custo_com_boni or produto.custo` e depois `custo_final = custo_com_boni + ipi_valor + frete_cif_fob_valor`. Com os 2 campos de custo zerados e `frete_cif_fob_valor` proporcional a `custo_com_boni` (então também zero), `custo_final` vira **só o crédito de IPI por unidade** — não sobra nenhum "custo" de verdade na conta.

Prova numérica (bate exato, sem sobra, direto da aba "Impostos Entrada (XML)" vs. "Créditos Fiscais" do Excel):

| Produto | IPI da nota ÷ qtde | = Custo Final usado na fórmula |
|---|---|---|
| 7909436926904 | R$ 17,08 ÷ 1 unidade | R$ 17,08 |
| 7891988014072 | R$ 53,66 ÷ 12 unidades | R$ 4,4716... |

Enquanto isso, o crédito de ICMS de entrada é calculado certo, a partir da base real da nota — que reflete o custo de verdade do produto (R$ 262,82 e R$ 412,80 por unidade, não os R$ 17,08 e R$ 4,47 usados como custo_final): R$ 47,31/unid e R$ 24,77/unid respectivamente. Somado a PIS+COFINS de entrada, o crédito total (R$ 67,25 e R$ 35,21) fica muito maior que o "custo" artificial (R$ 17,29 e R$ 4,68 com coleta+armazenagem), dando FIXO -49,96 e -30,52 — os mesmos valores já observados.

**Conclusão**: não é bug de fórmula. `fixo = coleta + armazenagem + custo_final − créditos` calcula certo em cima de um `custo_final` que, pra esses 2 produtos, é artificial (só o pedaço de IPI) por falta de cadastro de custo. É um problema de **dado** (cadastro de custo incompleto pra esses SKUs), não de lógica de precificação.

## O que ainda falta pra fechar

A causa raiz já está confirmada — o que falta agora:

1. **Decidir a correção**: nível de dado (preencher `custo`/`custo_com_boni` desses produtos na origem, ou impedir que o sistema gere preço pra produto sem custo cadastrado) vs. nível de fórmula (guard no `goal_seek.py` pra `FIXO` negativo, como segurança extra mesmo que o dado nunca devesse chegar zerado).
2. **Levantar o alcance real**: a amostra validada é só 3 produtos (`EANS_TESTE`), 2 deles com esse problema. Falta checar quantos produtos ativos no sistema têm `custo` e `custo_com_boni` zerados/nulos ao mesmo tempo — pra saber se é caso isolado desses 2 SKUs ou sintoma de uma falha maior de sincronização do ERP.

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
