---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 02:11
relacionado: [Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes), Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco), Estrutura da Planilha Busca Legal de Impostos de Saida, Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda, Dois Sistemas Paralelos - Projeto Interno V2 e We Stack, Decisao - Campo Frete do Fornecedor Sera Renomeado de frete_cif_fob para Frete Fornecedor e Vira Editavel na Tela]
---

# Descoberta: Planilha We Stack "Refeita" Confirma Pontos do Sistema Interno e Revela Bug no Cálculo de Cofins

**Resumo**: nova versão da planilha "Cálculo final We Stack" ("Doc refeita"), com dados de exemplo reais preenchidos (não mais zerados) e anotações novas na linha 7 cruzando cada campo direto com o Sistema Interno V2. Confirma, nas palavras da própria planilha: FRETE do ML calculado por dimensão do produto (bate com o código), Preço de Venda é o objetivo do cálculo (bate com "Margem Gera Preço"), Comissão é configurável (bate), Rebate só entra em promoção, nunca no cálculo normal de preço (bate com a decisão já registrada). O bloco SAÍDA (PIS/COFINS/CST/ICMS/ICMS MÉDIA) é importado pelo Sistema Interno via a MESMA fonte "Busca Legal" — Matheus confirmou que "Tabela Saída por UF Magazine/Samvale" é só o nome que ele deu ao arquivo, não uma fonte diferente. Achado de bug: a fórmula de "Cofins" (coluna AI) usa só campos de ENTRADA (Custo Final, ICMS entrada líquido, COFINS entrada líquido) e nunca toca a coluna COFINS de saída (X) — quebra o espelhamento com "Pis" (AH), que está correto (usa Preço, ICMS MÉDIA de saída e PIS de saída). Achado menor: a fórmula de "ICMS MÉDIA" pondera Tocantins em dobro (soma as 27 UFs, soma TO de novo, divide por 28 em vez de 27). A fórmula de "ICMS (Saída-Entrada)" continua usando o ICMS único (Z) em vez da média (AA), diferente da versão que embasou a decisão já registrada sobre UF real.

> [!success] Confirmada — 12/09/2026, leitura direta com dados reais + confirmação de Matheus
> Arquivo lido com `openpyxl` em 2 passagens (fórmula + valor calculado). Todos os valores de exemplo (percentuais de ICMS/IPI/PIS/COFINS, alíquotas por UF) foram conferidos manualmente célula a célula contra a fórmula, batendo exatamente. A equivalência "Tabela Saída por UF" = "Busca Legal" foi confirmada diretamente por Matheus, não inferida.

## Contexto

Depois de identificar que o arquivo "Cálculo final We Stack Doc 1 2.xlsx" enviado por Matheus batia com uma versão antiga (10/09, mais cedo naquele dia) e não com a versão que embasou a decisão já registrada no vault (10/09, mais tarde naquele dia) — e que a versão mais nova ("Versão B") se perdeu na troca de PC de Matheus — Matheus enviou uma 3ª cópia, "Cálculo final We Stack Doc refeita.xlsx", pedindo análise calma. Essa versão trouxe dados de exemplo reais e anotações novas cruzando campo a campo com o Sistema Interno V2.

## Metodologia

Leitura via `openpyxl` em 2 passagens (fórmula crua e valor calculado), incluindo a linha 1-7 (headers e anotações) e a única linha de dado real (linha 5, produto "ANDADOR PARA IDOSO..."). Cada fórmula foi recalculada manualmente em Python e comparada com o valor em cache do Excel, batendo em todos os casos. Comparado também, célula a célula, contra as 4 cópias anteriores do mesmo arquivo já presentes no ambiente (enviadas em 10/09), pra identificar o que mudou entre versões.

## Resposta

### Confirmações diretas (vindas da própria anotação da planilha, linha 7)

| Campo | Anotação da planilha | Situação no Sistema Interno V2 |
|---|---|---|
| FRETE (ML) | "calculado através das dimensões do produto, olhando na tabela de frete" | Bate — confirmado no código (`filtrar_faixas_frete`, lookup por peso/dimensão) |
| Preço de Venda | "é nosso objetivo de cálculo" | Bate — é o output do Goal Seek, mesmo conceito de "Margem Gera Preço" (ver [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]) |
| Comissão | "no Sistema Interno é configurável esse campo" | Bate — confirmado (`ConfiguracaoMercadoLivre`, faixas de comissão) |
| Rebait (rebate) | "não usamos para calcular preço (apenas quando envolve promoções)" | Bate — confirma a decisão já registrada de que o rebate só entra no fluxo de promoção |
| PIS/COFINS/CST/ICMS/ICMS MÉDIA (bloco SAÍDA) | "estão sendo importados pelo Sistema Interno também, via planilha 'TABELA SAIDA POR UF MAGAZINE (ou samvale).xlsx'" | Confirmado por Matheus: é a MESMA fonte já documentada como "Busca Legal" (ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]) — nome de arquivo escolhido pelo próprio Matheus, não uma 2ª fonte |

### Bug real na fórmula de "Cofins" (coluna AI), confirmado agora com números reais

Com os percentuais de exemplo preenchidos: `Pis` (AH) = `(Preço − Preço×ICMS_MÉDIA) × PIS_saída%` = `(169 − 169×0,06125) × 0,13` = **20,62** — base e fórmula corretas, usando campos de saída.

`Cofins` (AI) = `(Custo_Final − Custo_Final×ICMS_ENTRADA_líquido) × COFINS_ENTRADA_líquido%` = `(88,7565 − 88,7565×0,05) × 0,075` = **6,32** — nunca usa a coluna `COFINS` de saída (`X = 12%`), que fica sem nenhuma referência em qualquer fórmula do arquivo. "Cofins" deveria espelhar "Pis" (só trocando PIS→COFINS), mas usa Custo Final e campos de entrada em vez de Preço e campos de saída. Confirmado comparando com uma cópia mais antiga do mesmo arquivo (10/09, período da tarde): naquela versão a fórmula era `=(AC5-(AC5*AA5))*X5` — o espelho correto de "Pis". Essa correção não veio junto na "refeita".

### Achado menor: viés na média de ICMS por UF

`ICMS MÉDIA` (AA) = `(SOMA das 27 UFs + TO de novo) ÷ 28`, não `÷ 27` — Tocantins entra 2 vezes na conta. Confirmado com valor real: soma das 27 UFs = 1,655; +TO (0,06) = 1,715; ÷28 = 0,06125 (bate com o valor em cache). Viés pequeno, mas sistemático — provavelmente não intencional.

### Ainda de pé: ICMS (Saída-Entrada) usa UF única, não a média

`AG = (Preço × Z) − (Custo_Final × ICMS_ENTRADA_líquido)`, usando `Z` (ICMS único/SP, = 8% no exemplo) em vez de `AA` (ICMS MÉDIA, = 6,125% no exemplo) — continua diferente da versão que embasou [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]. A decisão em si não muda (vale independente de qual versão do arquivo existe), só o arquivo atual não reflete o raciocínio que já foi fechado.

### Correção que gerou decisão nova

A anotação da coluna de frete pago ao fornecedor dizia que seria preciso "criar um campo novo no sistema (WE STACK e SISTEMA INTERNO V2)". Não é bem assim — o campo já existe no Sistema Interno V2 (`Produto.frete_cif_fob`), já usado em `calcular_custo_final()` nos 6 marketplaces. O que realmente falta é edição via tela (hoje não é editável pelo usuário no HTML). Matheus decidiu, a partir disso, renomear o campo e adicionar a edição — ver [[Decisao - Campo Frete do Fornecedor Sera Renomeado de frete_cif_fob para Frete Fornecedor e Vira Editavel na Tela]].

## Atualização — as 3 correções confirmadas (12/09/2026)

Matheus colocou uma nova cópia do arquivo ("Cálculo final We Stack (Doc refeita).xlsx") na raiz do vault, com ajustes. Comparação célula a célula contra a versão anterior mostrou só 4 células diferentes — e resolvem exatamente os 3 pontos levantados acima:

- **Cofins (AI) corrigido**: virou `=(AC5-(AC5*AA5))*X5` — o espelho exato de "Pis" (troca só PIS→COFINS). Resultado no exemplo: 18,71 (antes: 6,32).
- **ICMS MÉDIA (AA) redesenhado**, não só corrigido: virou uma média ponderada de verdade — `SP × 50% + (média das outras 26 UFs) × 50%` — com `IFERROR` mostrando "ERRO" em vez de quebrar silenciosamente. Header renomeado para "ICMS MÉDIA (ponderada)". Resultado: 7,75% (antes: 6,125%, com Tocantins entrando em dobro na conta).
- **ICMS (Saída-Entrada) (AG) corrigido**: passou a usar `AA` (a nova média ponderada) em vez de `Z` (ICMS único/SP) — alinhado de novo com o raciocínio de [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]. Resultado: 8,66 (antes: 9,08, com Z).

Consequência: a Margem % do produto de exemplo (mesmos dados de entrada, só as fórmulas corrigidas) caiu de -2,16% para -9,02% — esperado, já que a Cofins estava sendo subtraída a menos do que deveria antes da correção.

Confirmado recalculando cada fórmula manualmente e batendo com o valor em cache do Excel nas 4 células alteradas. Nenhuma outra célula do arquivo mudou (anotações da linha 6/7, bloco de entrada, Pis, Custo Final — tudo idêntico à versão anterior).

## Relacionado

- [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]]
- [[Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco)]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]
- [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]
- [[Decisao - Campo Frete do Fornecedor Sera Renomeado de frete_cif_fob para Frete Fornecedor e Vira Editavel na Tela]]
