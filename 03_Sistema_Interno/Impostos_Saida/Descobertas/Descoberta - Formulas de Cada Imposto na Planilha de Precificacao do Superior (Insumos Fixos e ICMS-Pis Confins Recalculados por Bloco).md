---
tipo: descoberta
dominio: 
status: confirmada
criado: 11/09/2026
atualizado_em: 11/09/2026 21:47
relacionado: [Estrutura da Planilha Busca Legal de Impostos de Saida, Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem, Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda, Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema, Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo)]
---

# Descoberta: Fórmulas de Cada Imposto na Planilha de Precificação do Superior (Insumos Fixos e ICMS/Pis Confins Recalculados por Bloco)

**Resumo**: análise completa da `Planilha_REFERENCIA_PRECIFICAÇÃO_Reduzida.xlsx` focada 100% em como cada imposto é calculado. Existem 2 camadas: insumos fiscais fixos por produto (ICMS ENTRADA, IPI, PIS COFINS, ST Valor — cada um populado exclusivamente conforme o regime em `Tributação`: REDUÇÃO, TRIBUTADO ou ST, nunca 2 regimes ao mesmo tempo) e ICMS + Pis Confins recalculados de forma independente em cada um dos 9 blocos de marketplace, sempre sobre o `Preço` próprio daquele bloco — mesma lógica de [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]. Achado extra relevante pro contexto de Impostos de Saída: `ICMS SAÍDA MÉDIA` é a única das duas colunas de ICMS de saída realmente usada em qualquer fórmula da planilha — `ICMS SAÍDA SP` existe em toda linha mas não é referenciada por nenhuma fórmula do arquivo inteiro, o que reforça na prática o mesmo raciocínio já fechado em [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]].

> [!success] Confirmada — 11/09/2026, leitura direta das fórmulas
> Levantamento feito com `openpyxl` em 2 passagens (fórmula crua e valor já calculado), cobrindo as 138 colunas × 29 linhas da planilha. Cada header foi conferido caractere a caractere (`repr()`) contra a linha 1 real. Confirmado por busca em todas as fórmulas do arquivo que nenhuma delas referencia a coluna `ICMS SAÍDA SP`.

## Contexto

Depois de fechar o levantamento de campos sem cobertura (ver [[Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo)]]), Matheus pediu uma análise focada 100% em impostos: como cada um é calculado, identificado sempre pelo nome real do header da linha 1 — nunca por coordenada tipo "AW-AX". Mesma planilha `Planilha_REFERENCIA_PRECIFICAÇÃO_Reduzida.xlsx` (aba única "Feuil1", 138 colunas de `A` a `EH`, 29 linhas — 9 pares Não Afiliado/Afiliado por produto).

## Metodologia

Leitura via `openpyxl` em 2 passagens (`data_only=False` pra fórmula, `data_only=True` pra valor já calculado) em todas as 138 colunas × 29 linhas. Headers extraídos com `repr()` pra capturar até diferença de espaçamento. Feita também uma busca em todas as fórmulas do arquivo inteiro procurando qualquer referência à coluna `ICMS SAÍDA SP`.

## Resposta

### Insumos fiscais fixos (1 vez por produto, compartilhados por todos os marketplaces)

| Header (linha 1) | Como é preenchido |
|---|---|
| Tributação | Texto literal — só 3 valores no arquivo: "REDUÇÃO", "TRIBUTADO" ou "ST". Funciona como rótulo do regime da linha e determina quais colunas abaixo vêm zeradas |
| MVA | Vazia em 100% das linhas — nenhum dado no arquivo |
| ST Valor | Só populado (R$) quando Tributação = "ST" — vazio nos outros 2 regimes |
| ICMS ENTRADA | Só populado (18%) quando Tributação = "TRIBUTADO" — 0 nos outros 2 regimes |
| IPI | Só populado (5,2%) quando Tributação = "ST" — 0 nos outros 2 regimes |
| PIS COFINS | Só populado (9,25%) quando Tributação = "ST" — 0 nos outros 2 regimes |
| ICMS SAÍDA SP | Preenchido (%) em toda linha, mas nenhuma fórmula do arquivo inteiro a referencia |
| ICMS SAÍDA MÉDIA | É a que de fato entra em toda fórmula de ICMS de saída, nos 9 blocos |
| Custo Final | `= 'CUSTO C/ BONI' + ('CUSTO C/ BONI' × IPI) + ('CUSTO C/ BONI' × 'Frete CIF/FOB') + 'ST Valor'` |

Confirma com dado real a mesma regra de exclusividade ICMS ENTRADA × ST Valor que já existe no código (`impostos/funcoes_auxiliares/creditos_fiscais_para_precificacao.py`) — nunca os 2 populados na mesma linha, sempre conforme o regime em `Tributação`.

### ICMS e Pis Confins — recalculados em cada um dos 9 blocos, sobre o Preço do próprio bloco

Mesma fórmula em todos os 9 blocos, mudando só qual "Preço" entra:

- `ICMS (do bloco)` = `(Preço do bloco × ICMS SAÍDA MÉDIA) − (CUSTO × ICMS ENTRADA)`
- `Pis Confins (do bloco)` = `(Preço do bloco − CUSTO) × PIS COFINS`

| Bloco (identificado pelo header de comissão) | "Preço" usado na fórmula | Observação |
|---|---|---|
| Comissão 12% CLÁSSICO MELI | Preço | — |
| Comissão 17% PREMIUM MELI | Preço (8,0%) | header de Pis Confins vem com espaço duplo ("Pis  Confins") |
| Comissão 16% | Preço | — |
| Comissão 8% | Preço | — |
| Comissão 14,8% | Preço | — |
| COMISSÃO (genérico) | Preço | header de Pis Confins vem com espaço duplo |
| AFILIADO (8%) / Comissão | PREÇO POR | bloco TikTok |
| Anúncio 22% | Preço | bloco inteiro vazio — nenhuma fórmula, nenhum valor, em nenhuma linha |
| Afiliado 8% / Comissão 6% | Preço Por | bloco Shopee |

O header "Pis Confins" aparece com 2 grafias diferentes na mesma planilha (espaço simples e espaço duplo), representando exatamente o mesmo cálculo nos dois casos.

### Achado extra relevante pro contexto de Impostos de Saída

`ICMS SAÍDA SP` e `ICMS SAÍDA MÉDIA` nesta planilha espelham a mesma dupla `ICMS` / `ICMS MÉDIA` já mapeada em [[Estrutura da Planilha Busca Legal de Impostos de Saida]] (alíquota de origem × média das UFs de destino) — e são os mesmos 2 campos que já existem, sempre vazios, no `Produto` (ver [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]). O fato de a planilha do superior nunca consumir a coluna de origem (SP) em nenhuma fórmula, só a média, é mais uma confirmação prática — vinda de uma planilha diferente, com outro propósito (precificação, não Busca Legal) — de que "usar a média" é um atalho de planilha, reforçando o raciocínio já fechado em [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]: o ideal, quando o sistema calcular isso de verdade, é usar a alíquota da UF real de destino de cada venda, não a média.

## Relacionado

- [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]
- [[Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo)]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
- [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]
