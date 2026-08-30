---
tipo: decisao
dominio: 
status: ativa
criado: 28/08/2026
atualizado_em: 28/08/2026 17:06
relacionado: [Contexto Geral - Retomada em Outro Computador (Integracao Sysemp), Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp, Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica, Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]
---

# Preenchimento de CEST na Planilha Samvale via Referência EAN-NCM-CEST do JSON

## Contexto

A API do Sysemp foi atualizada e passou a trazer o campo **CEST**, salvo até agora só no JSON de retorno (nunca persistido em banco/planilha). Em paralelo, um terceiro passou pro usuário uma **planilha pré-existente da Samvale** que precisa ter 1 coluna preenchida com o CEST, cruzando os dados já existentes na própria planilha (NCM e EAN/GTIN) contra o que existe no JSON.

**Escopo explícito, restrito pelo usuário**: só Samvale por enquanto — "Confirmando: Sim é especificamente da samvale, e somente da samvale por enquanto." Não expandir pra outras empresas/marcas sem pedido novo.

Layout da planilha real (dada pelo usuário):
- Coluna A → NCM
- Coluna C → EAN/GTIN
- Coluna K → CEST (coluna a ser preenchida)
- Header na linha 9, dados a partir da linha 10.

## Fonte de dado (JSON)

Arquivo: `integracao_sysemp/retorno_api/dados_impostos_xml_entrada/samvale/XML_Manifesto_NF_notas_mais_recentes_por_produto.json` — 3597 registros. O próprio nome do arquivo ("notas mais recentes por produto") confirma o que o usuário depois validou explicitamente: **o JSON já vem filtrado, nunca repete EAN** — 1 registro por produto, sempre a nota mais recente. Isso elimina qualquer ambiguidade de múltiplos CEST candidatos pro mesmo EAN (ver Etapa 3 abaixo).

**Chaves reais confirmadas** (rodando contra o dado real, nunca suposição — 1ª tentativa com chaves `snake_case` chutadas, tipo `codigo_barras`/`ncm_cadastro`, quebrou 100% do preenchimento na 1ª rodada real):
- EAN: `'Código Barras'`
- NCM: `'NCM Cadastro'` (prioridade) / `'NCM XML'` (fallback)
- CEST: `'CEST'`
- Nota fiscal: `'NR NF'`

Achado relacionado: cerca de metade dos registros (1834 de 3597) tem CEST nulo — confirmado como realidade de negócio (nem todo produto/NCM tem CEST), não bug. O diagnóstico do script trata "chave ausente" e "chave presente com valor `None`" como coisas diferentes, pra nunca confundir os dois casos.

## Processo em 3 etapas

### Etapa 1 — aba plana de referência (`EAN_NCM_CEST`)

1 linha por registro do JSON: EAN | NCM | CEST. Sem dedupe, só a base bruta usada pelas outras abas/scripts.

### Etapa 2 — árvore hierárquica (`Arvore_NCM_CEST_EAN`)

Regra confirmada com o usuário, sem ambiguidade: **cada NCM tem 0 ou N CEST; cada CEST tem 0 ou N EAN.**

- **1ª versão (REJEITADA)**: indentação + outline nativo do Excel. Usuário rejeitou depois de ver rodar com dado real, em escala: *"ta tudo muito confuso... Precisa ser CLARO... Agrupadores claros e bem definidos."*
- **2ª versão (APROVADA, é a atual)**: células **realmente mescladas** via `openpyxl.merge_cells()` — o NCM ocupa 1 célula mesclada cobrindo todas as linhas de todos os CESTs dele; o CEST ocupa 1 célula mesclada cobrindo só as linhas dos EANs dele, dentro do bloco do NCM; o EAN nunca é mesclado (1 linha própria, a folha da árvore). Borda grossa marca troca de NCM, borda fina marca troca de CEST dentro do mesmo NCM.
- **Coluna "NF(s)"**: lista os números reais de `NR NF` daquele EAN, não uma contagem — exigência explícita do usuário: *"não basta dizer '1 nota' ou 'em 2 notas' você deve dizer a nota específica, por os números das NFs."*
- **Bug real achado e corrigido rodando com dado real**: CEST vindo como string vazia (`""` ou só espaço) no JSON não é igual a `None` pro Python — isso criava um 2º grupo "sem CEST" espúrio (sem rótulo, ao lado do `"(sem CEST)"` rotulado), pro mesmo NCM. Corrigido normalizando todo valor bruto do JSON na extração (`normalizar_valor()`: string tem espaço removido; string vazia vira `None`) — aplicado a EAN/NCM/CEST/NR NF, não só a CEST, pra não deixar a mesma armadilha acontecer em outro campo.

Mockups (Claude Design canvas, aprovados pelo usuário em ordem):
- 1ª versão (indentação, depois substituída): https://claude.ai/code/artifact/75125efc-b5c7-4e54-8199-f49c31d03d13
- 2ª versão (células mescladas + NF(s), é a versão final aprovada): https://claude.ai/code/artifact/bf75b7ad-9cce-4d83-9cb5-684793b29f6e

Script (utilitário pontual, entregue como texto na conversa — nunca como arquivo criado por Claude no repo real, mesma regra de colaboração já registrada neste domínio): `gerar_referencia_cest_samvale.py`.

### Etapa 3 — cruzamento e preenchimento da Coluna K

Regra de preenchimento, com 3 casos que cobrem 100% das linhas (confirmada com o usuário depois de 1 rodada de dúvida sobre o "qualquer outro caso"):

1. **EAN da planilha existe no JSON E o NCM bate** → fundo **verde claro**, CEST preenchido.
2. **EAN da planilha existe no JSON mas o NCM é diferente** → fundo **amarelo claro**, CEST preenchido mesmo assim (sinaliza divergência a revisar, não impede o preenchimento).
3. **EAN da planilha NÃO existe no JSON** → fundo **cinza claro**, CEST em branco.

A dúvida original (o que fazer se o mesmo EAN tivesse mais de 1 CEST candidato) foi resolvida pelo próprio usuário: como o JSON nunca repete EAN, a busca é 1:1 direta — sem necessidade de tie-break ou de listar múltiplos candidatos (diferente da coluna NF(s) da Etapa 2, que lista vários NR NF por natureza).

Script (mesmo padrão de utilitário pontual, texto na conversa): `preencher_cest_planilha_samvale.py`. Edita a planilha real em-lugar (`openpyxl.load_workbook()` + `.value`/`.fill` direto na célula, salva no mesmo arquivo — preserva toda a formatação existente, nunca usa `pandas.to_excel()`, mesma lição já registrada em [[Correcao de CST PIS e COFINS por NCM Fecha a Frente da Hidrolight e Outras Marcas]]). Ao final, imprime no console a contagem de linhas verde/amarelo/cinza.

**Limitação conhecida, documentada no próprio script**: a normalização de EAN/NCM lidos da planilha real trata número-como-float do Excel (remove `.0` residual), mas **não faz padding de zero à esquerda** — se um EAN perder o zero à esquerda por estar como número (não texto) na célula, ele vai cair em "não encontrado" (cinza) em vez de dar match. Decisão deliberada: reportar como não-encontrado pro usuário conferir manualmente, em vez do script adivinhar um EAN corrigido e arriscar um match errado.

## Convenção de entrega (reafirmada, já vale pra todo o domínio)

Claude nunca lê, escreve ou executa nada contra o JSON real ou a planilha real do usuário — todo código é entregue como texto na conversa, e o usuário aplica/roda localmente e reporta o resultado real de volta (ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]). Toda validação de lógica feita por Claude nesta frente (mesclagem de célula, normalização de CEST vazio, regra das 3 cores) foi feita só com dado **sintético, fabricado no sandbox de Claude** — nunca com o JSON ou a planilha reais da Samvale.

## Status atual (28/08/2026, 17:06)

- **Etapas 1 e 2**: validadas com dado real, rodadas pelo próprio usuário — árvore mesclada + NF(s) conferida e aprovada ("OK agora sim. Com isso toda a regra de pensamento já é válida.").
- **Etapa 3**: script `preencher_cest_planilha_samvale.py` entregue como texto, testado só com dado sintético no sandbox de Claude (4 cenários: match exato, EAN batendo com NCM diferente, EAN ausente — resultado bateu 100% com o esperado). **Ainda não rodado pelo usuário contra a planilha real da Samvale.**

## Próximo passo real, pra quem retomar

1. Usuário ajusta `CAMINHO_PLANILHA_ALVO` (e `NOME_ABA_ALVO`, se a aba não for a ativa) pro caminho real da planilha Samvale.
2. Roda `preencher_cest_planilha_samvale.py` localmente.
3. Reporta os números finais do console (contagem verde/amarelo/cinza) — se o cinza vier muito alto, investigar se é por EAN perdendo zero à esquerda na planilha (ver limitação conhecida acima), antes de assumir que os produtos realmente não existem no JSON.
4. Confirmar se o resultado final (cores + CEST na Coluna K) bate com a expectativa visual do usuário antes de considerar esta frente fechada.

## Relacionado

- [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
- [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Correcao de CST PIS e COFINS por NCM Fecha a Frente da Hidrolight e Outras Marcas]]
