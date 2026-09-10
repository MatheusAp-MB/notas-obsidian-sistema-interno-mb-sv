---
tipo: descoberta
dominio: python
status: confirmada
criado: 10/09/2026
atualizado_em: 10/09/2026 10:03
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Estrutura da Planilha Busca Legal de Impostos de Saida, Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]
---

# Descoberta: Campos Fiscais de Saída no Código — 4 Já Existem (Vazios), CST e Tabela por UF Não Existem

**Resumo**: análise do repositório `Projeto_Sistema_Interno_V2` (branch `dev`, sincronizado 10/09/2026) confirma que o model `Produto` já tem 4 campos fiscais de saída (`icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`) — todos sempre zerados, sem nenhum código que os preencha, mas já lidos de verdade pelas 6 fórmulas de precificação de marketplace e pelo cálculo de margem do Hub de Promoções. CST de saída e a tabela de ICMS por UF de destino (27 colunas da planilha Busca Legal) não existem em nenhum lugar do sistema.

> [!success] Confirmada — 10/09/2026
> Achado via leitura direta do código (`produtos/models/produto.py`, as 6 fórmulas de precificação em `precificacao/funcoes_auxiliares/`, `mercado_livre/funcoes_auxiliares/calculo_margem.py`, `produtos/admin.py`, `produtos/views.py`) — busca por escrita (`grep`) no repositório inteiro confirmou zero pontos de gravação pros 4 campos existentes, só leitura.

## Contexto

Depois da decisão de que a planilha We Stack é referência e a planilha Busca Legal é a fonte real de dado de impostos de saída (ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]] e [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]), a pergunta natural era: o que já existe no Projeto Interno V2 pra receber esse dado, e o que falta criar?

## O que os dados mostraram

**Já existem, e são lidos de verdade — só estão vazios:**

- `Produto.icms_saida_sp` (`DecimalField`, `default=0`) — mapeia com a coluna `ICMS` (alíquota de origem/SP) da planilha Busca Legal.
- `Produto.icms_saida_media` (`DecimalField`, `default=0`) — mapeia com `ICMS MÉDIA` (média das 26 UFs), a mesma lógica já validada matematicamente na planilha.
- `Produto.pis_percentual` (`DecimalField`, `default=0`) — mapeia com `PIS` do bloco SAÍDA da planilha. Comentário no próprio código já registra "sempre de saída".
- `Produto.cofins_percentual` (`DecimalField`, `default=0`) — mapeia com `COFINS` do bloco SAÍDA.

Esses 4 campos são lidos pelas 6 fórmulas de precificação (Mercado Livre, Magalu, Raia, Shopee, TikTok, Amazon — todas em `precificacao/funcoes_auxiliares/<marketplace>/formula_precificacao_<marketplace>.py`) e por `calcular_margem()` em `mercado_livre/funcoes_auxiliares/calculo_margem.py` (o cálculo reverso do Hub de Promoções). Busca por escrita (`grep` por `.icms_saida_sp =`, `.icms_saida_media =`, `.pis_percentual =`, `.cofins_percentual =`) no repositório inteiro não achou nenhum ponto de gravação fora de teste — confirma que são exatamente os "campos placeholder aguardando dado" mencionados no início desta frente.

Hoje a única forma de editar é 1 produto por vez, no Django admin (`produtos/admin.py` expõe os 4 num fieldset "Custo & Impostos") — a tela própria de Produtos (`produtos/views.py`) é só leitura, sem formulário de edição nem importação em lote.

**Detalhe prático pra quando for preencher**: o campo guarda percentual "cheio" (ex: `19,42`), não fração — confirmado porque toda fórmula de precificação divide o campo por 100 antes de usar (`icms_saida_media / 100`). A planilha Busca Legal guarda como fração (ex: `0,19423...`). Preencher direto da planilha sem multiplicar por 100 geraria dado 100x menor que o real.

**Não existem em lugar nenhum:**

- **CST de saída** — a planilha tem essa coluna no bloco SAÍDA (fixo por produto). O sistema só tem CST de entrada (`IcmsEntradaProduto.cst_xml`/`cst_cadastro`, mesma coisa pra PIS/COFINS/IPI entrada, todos em `impostos/models.py`) — nenhum campo de CST de saída existe hoje.
- **ICMS de saída por UF de destino** (27 colunas, 1 por estado) — o sistema só tem os 2 campos agregados (`icms_saida_sp`/`icms_saida_media`). Nenhum campo guarda a alíquota por UF individual — bate com a decisão já registrada de que, por enquanto, o cálculo usa a média, e a UF real de destino é trabalho futuro (ver [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]).

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]
