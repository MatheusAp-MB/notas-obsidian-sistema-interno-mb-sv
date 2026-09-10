---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 10/09/2026
atualizado_em: 10/09/2026 16:58
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido), Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve, Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]
---

# Bug Conhecido: FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90

**Resumo**: depois de preencher os 4 campos fiscais de saída e recalcular as grades, as fórmulas de Raia e Magalu passaram a levantar 8 erros de assert (2 produtos × 4 margens cada), sempre com a mesma mensagem: "margem obtida ficou ABAIXO da margem-alvo". A causa mecânica foi confirmada logo de início por leitura de código: o "FIXO" dessas 2 fórmulas fica negativo quando o crédito fiscal de entrada (ICMS+PIS+COFINS) é maior que custo+coleta+armazenagem — e quando isso acontece, o arredondamento RoundUp90 (que deveria só aumentar a margem) na verdade diminui, quebrando a garantia que o assert cobra.

> [!success] CORRIGIDO — 10/09/2026, 16:44 — guarda aplicada, testada em produção, 0 erros de assert
> Causa raiz confirmada com dado real (13:55). Correção de fórmula aplicada e rodada nos 2 bancos (MAGAZINE + SAMVALE, 6 marketplaces cada) — ver "Correção Aplicada" abaixo. O problema de DADO por trás (produtos com custo zerado) continua existindo e agora gera "SEM CÁLCULO" em vez de crash — alcance real medido em [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]. Corrigir esse dado é tarefa operacional separada, não mais um bug de código.

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

## Nota sobre `custo_com_boni`

Confirmado pelo usuário (10/09/2026): `custo_com_boni` é um campo **"pausado" por decisão de negócio** no momento — não é bug nem falha de sincronização estar vazio na maioria dos produtos, é esperado hoje. Isso significa que, na prática, o problema real por trás do FIXO negativo (e do SEM CÁLCULO em geral) está quase sempre em `custo` (o campo sincronizado do ERP) vir zerado, não em `custo_com_boni` — que já era esperado estar vazio pra quase todo o catálogo. Relevante pra interpretar os números de [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]: o filtro "custo E custo_com_boni zerados" usado lá é, na prática, dominado pela condição `custo=0` — `custo_com_boni` vazio raramente é o fator diferenciador, porque já está vazio na maioria dos produtos, pausado ou não.

## Correção Aplicada (10/09/2026, 16:44)

**Decisão**: mesmo sendo problema de dado, era preciso um guard de fórmula — sem ele, qualquer produto com o mesmo cadastro incompleto (não só esses 2) derruba `calcular_todas_as_grades_precificacao` inteiro com `AssertionError`, travando o recálculo de TODOS os produtos, não só do problemático.

**O que foi feito**: guarda matemática adicionada nas 3 funções de `precificacao/funcoes_auxiliares/goal_seek.py` (`resolver_preco_por_margem`, `resolver_preco_com_frete_fixo`, `resolver_preco_por_faixa_comissao`). A garantia do RoundUp90 (arredondar pra cima só AUMENTA a margem) só vale matematicamente quando `(frete + fixo − rebate)` é positivo — quando esse total fica negativo, a relação margem×preço se inverte, e arredondar pra cima DIMINUI a margem. Agora, nesse caso, as 3 funções devolvem "sem solução" (`None`/pula a faixa) em vez de estourar o assert — o mesmo sinal que já usavam pra outros casos de "não resolveu" (ex: `denominador <= 0`). Isso alinha o comportamento de Raia/Magalu com o que ML/Shopee/TikTok/Amazon já faziam de fato (absorver silenciosamente, sem crash) — só que agora **visível**, porque a linha correspondente passa a ser gravada como `resolvida=False` (ver [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]], corrigido na mesma sessão).

**Testado em produção**: `calcular_todas_as_grades_precificacao` rodado nas 2 empresas (MAGAZINE + SAMVALE), 6 marketplaces cada — **0 erros de assert** nas 12 execuções, contra os 8 originais que abriram essa investigação.

## O que ainda fica em aberto (não é mais bug de código — é dado)

1. **Corrigir o cadastro**: os SKUs com `custo`/`custo_com_boni` zerados continuam sem gerar preço (`SEM CÁLCULO`, corretamente — não dá pra precificar sem custo real). Corrigir de verdade é preencher esses campos na origem (ERP/Admin).
2. **Alcance real medido**: não são só os 2 SKUs originais — são **287 produtos no MAGAZINE e 158 no SAMVALE** com alguma margem/variação em SEM CÁLCULO no ML. Boa parte (200 no MAGAZINE, todos os 158 no SAMVALE) já é explicada por custo ou dimensão zerados. Detalhe completo, com a metodologia e os números por empresa, em [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]].
3. **Investigar a causa da falha de sincronização**: por que esses produtos específicos ficaram sem custo importado do ERP — é caso isolado ou sintoma de falha maior no `importar_produtos_erp.py`? Não investigado ainda.

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
- [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]]
- [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]
