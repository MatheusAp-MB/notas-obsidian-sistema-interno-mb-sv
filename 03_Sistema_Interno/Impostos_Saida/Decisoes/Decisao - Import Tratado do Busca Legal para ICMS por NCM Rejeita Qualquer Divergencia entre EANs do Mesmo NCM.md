---
tipo: decisao
dominio: python
status: ativa
criado: 12/09/2026
atualizado_em: 12/09/2026 14:40
relacionado: [Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF, Estrutura da Planilha Busca Legal de Impostos de Saida, Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]
---

# Decisão: Import Tratado do Busca Legal para ICMS por NCM — Rejeita Qualquer Divergência entre EANs do Mesmo NCM

**Resumo**: o import de `IcmsNcmUf` (ver [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]]) não lê a Busca Legal direto — passa por um tratamento antes de gravar. Usa só a coluna `NCM` e as 27 colunas de UF de destino da planilha (ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]), ignorando `ICMS` e `ICMS MÉDIA` (redundantes/substituídos). Agrupa as linhas (EANs) por NCM e exige que todos os EANs de um mesmo NCM concordem 100% nas 27 UFs — mesmo valor preenchido, ou todos em branco. Qualquer diferença, incluindo 1 EAN preenchido e outro em branco na mesma UF, já é divergência: o NCM inteiro é rejeitado e informado, nada é gravado dele. Só um NCM 100% consistente entre seus EANs é aceito, e é gravado com as UFs que tiver — não precisa das 27 completas.

> [!success] Ativa — 12/09/2026
> Confirmado com exemplos concretos (ver abaixo) que divergência inclui "preenchido vs em branco", não só "valor diferente vs valor diferente". A rejeição é sempre do NCM inteiro, nunca parcial por UF.

> [!warning] Atualização (13/09/2026, 06:11) — Chave de agrupamento revisada
> Esta decisão fica **parcialmente substituída** por [[Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria]]: agrupar só por `NCM` (como descrito abaixo) mistura produtos que legitimamente têm alíquotas diferentes por CST ou Origem da Mercadoria — não é sempre divergência de cadastro. A regra de persistência (nunca comparar com o que já está gravado, sempre sobrescrever, nunca apagar o que não veio na rodada) continua valendo sem mudança; só a chave de agrupamento muda, de `NCM` para `NCM + CST + Origem`.

## Contexto

Com a fonte de dados definida (Busca Legal é a fonte real — ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]) e o modelo de armazenamento decidido (`IcmsNcmUf` normalizado), faltava decidir como tratar o dado entre a leitura da planilha (por EAN) e a gravação no banco (por NCM). A planilha reduzida `TABELA SAIDA POR UF - REDUZIDA.xlsx` (raiz do vault) foi analisada como amostra real do que será importado — confirma coluna a coluna a estrutura já documentada (`NCM` na coluna C, `ICMS` = alíquota de SP duplicada, `ICMS MÉDIA` = média simples das outras 26, 27 UFs em ordem alfabética de AC a TO) e mostrou, nos 3 grupos de NCM repetido da amostra (3, 4 e 2 produtos), 100% de consistência entre os EANs — nenhuma divergência real na amostra, mas a regra de tratamento precisa cobrir o caso em que ela existir.

## Decisão tomada

**O que o import usa da planilha**: só `NCM` (coluna C) + as 27 colunas de UF de destino (I:AI). As colunas `ICMS` (duplica o valor de SP, já dentro das 27) e `ICMS MÉDIA` (média simples antiga) são ignoradas — a Média Ponderada usada pelo sistema é sempre calculada em tempo real (ver [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]), nunca lida da planilha.

**Regra de consistência por NCM**: agrupando todas as linhas (EANs) da planilha por NCM, cada uma das 27 UFs precisa ser idêntica entre todos os EANs daquele NCM — o mesmo valor preenchido, ou todos em branco. Isso vale tanto pra valor-diferente-de-valor quanto pra preenchido-diferente-de-em-branco:

- NCM com EAN A tendo `RJ = 0.22` e EAN B tendo `RJ = 0.20` → diverge, rejeitado.
- NCM com EAN A tendo `RJ = 0.22` e EAN B tendo `RJ` em branco → **também diverge**, rejeitado (mesmo sem 2 valores numéricos conflitantes).

Qualquer divergência (em qualquer 1 das 27 UFs) rejeita o **NCM inteiro** — não só a UF que divergiu — e o NCM é reportado no fim do import (quais EANs, qual UF, quais valores). Um NCM só é aceito quando todos os seus EANs batem 100%; nesse caso ele é gravado com o que tiver preenchido, sem exigir as 27 completas (ex: um NCM com um único EAN tipo "GASOLINA COMUM", só com SP preenchido, é aceito e gravado só com aquela 1 linha NCM+SP).

## Exemplo

NCM fictício `99999999`, 3 EANs na planilha:

| EAN | SP | RJ | MG | PR |
|---|---|---|---|---|
| 111 | 0.18 | 0.22 | — | — |
| 222 | 0.18 | — | 0.20 | — |
| 333 | 0.18 | 0.22 | — | 0.19 |

`RJ` tem `0.22` no EAN 111 e em branco no EAN 222 → diverge → NCM `99999999` inteiro rejeitado e informado (nem chega a avaliar `MG`/`PR`).

NCM fictício `88888888`, 2 EANs:

| EAN | SP | RJ |
|---|---|---|
| 444 | 0.18 | 0.22 |
| 555 | 0.18 | 0.20 |

`RJ` tem `0.22` e `0.20` → diverge → rejeitado e informado.

## Regra de persistência — nunca compara com o que já existe (decisão de 12/09/2026 14:40)

Um NCM aceito nessa rodada (passou na validação acima) tem seu valor tratado como verdade — o import **nunca compara com o que já está gravado em `IcmsNcmUf`**, só sobrescreve (cria se o NCM+UF é novo, atualiza se já existia). Não existe conceito de "o valor mudou desde a última importação, isso é suspeito" — se passou na validação interna dessa rodada, é gravado, sem olhar pra trás.

Um NCM+UF que já estava gravado de uma importação anterior e **não aparece** na rodada atual (nem foi rejeitado — simplesmente não veio) continua gravado do jeito que estava. A planilha só cria/atualiza o que ela possui — nunca apaga o que já existe no banco. Confirmado por Matheus: "o que existe no banco anteriormente continua existindo... a planilha só atualiza/cria o que ela possui... se algum valor já estava no banco e não foi tocado pela planilha, ele se mantém normalmente."

## Implementado e testado (12/09/2026)

Pipeline completo já implementado e validado:

- **Model** `IcmsNcmUf` (`impostos/models.py`) — normalizado, 1 linha por NCM+UF, `aliquota` em percentual (igual a `Produto.icms_saida_sp`).
- **Leitura + agrupamento + validação** (`impostos/funcoes_auxiliares/importacao_icms_ncm.py`, `agrupar_icms_por_ncm()` / `AgrupadorIcmsPorNcm`) — aplica a regra de divergência acima.
- **Persistência** (mesmo arquivo, `PersistidorIcmsNcm`) — aplica a regra de "nunca compara" acima, via `bulk_create`/`bulk_update`.
- **Management command** `importar_icms_por_ncm` (`impostos/management/commands/importar_icms_por_ncm.py`, aceita `--empresa` e `--caminho` opcional pra teste).

Testado contra a planilha reduzida (`TABELA SAIDA POR UF - REDUZIDA.xlsx`, raiz do vault): 5 NCMs distintos, todos aceitos, 0 rejeitados, 109 combinações NCM+UF criadas (108 = 4 NCMs × 27 UFs + 1 da gasolina, só SP) — bateu exato com o esperado.

**Formato do relatório de NCMs rejeitados**, resolvido por implementação: saída do próprio management command no terminal (`style.WARNING` por NCM rejeitado, listando a UF que divergiu e os EANs envolvidos) — sem log em arquivo nem tela própria por enquanto.

## O que ainda falta decidir

- Rodar o import contra os arquivos oficiais das 2 empresas (`--empresa=MAGAZINE`/`--empresa=SAMVALE`, sem `--caminho`) — ainda não rodado pra valer, só testado com a amostra reduzida.
- Como o NCM se vincula ao Produto na prática (`ncm_xml`/`ncm_cadastro` em `ImpostosECustosXMLEntradaProduto`) — mencionado antes, ainda não finalizado.
- A tela em si (mockup v1 construído, feedback do Matheus pendente; view/template real ainda não construído).

## Relacionado

- [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]
