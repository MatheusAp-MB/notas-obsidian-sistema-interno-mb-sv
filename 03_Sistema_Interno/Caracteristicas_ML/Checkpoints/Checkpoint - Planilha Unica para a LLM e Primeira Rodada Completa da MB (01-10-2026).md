---
tipo: checkpoint
status: em_andamento
criado: 01/10/2026
atualizado_em: 01/10/2026 18:06
dominio: 
relacionado: [Checkpoint - Consolidação por SKU e Cobertura do ERP (01-10-2026), Checkpoint - Investigação da API de Atributos do Mercado Livre, Gerencie seu Aplicativo na API do Mercado Livre, Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale), Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre, Sistema de Atributos de Item na API do Mercado Livre, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]
---

# Checkpoint - Planilha Unica para a LLM e Primeira Rodada Completa da MB (01-10-2026)

## Última atualização

**01/10/2026, 18:06.** Fase atual do Ciclo de Trabalho: **Analisar**. O gerador da planilha foi escrito, testado e rodado em amostra e no inventário completo da conta MB; a análise das linhas da planilha completa e as decisões de regra por campo ficaram pendentes (Matheus pausou o trabalho neste ponto). Os números de ERP desta nota são **provisórios** (ver a seção "Contexto das rodadas").

## O que é esta nota

**O quê:** continuação direta de [[Checkpoint - Consolidação por SKU e Cobertura do ERP (01-10-2026)]] (registrado às 16:20 do mesmo dia). Aquele checkpoint terminava com o script que gerava um arquivo JSON por SKU. Este registra o que veio depois: a mudança de rumo para uma planilha única, o gerador dessa planilha, as duas rodadas executadas, o que elas mostraram, as decisões tomadas e o que ainda está em aberto.

**Por quê:** a conversa onde o trabalho aconteceu é volátil (pode ser compactada). Este checkpoint é a memória persistente do progresso.

**Pra quê:** quem abrir esta nota depois de dias deve conseguir retomar sem reler a conversa: saber o que existe, como rodar, o que os números querem dizer e quais decisões faltam.

### Vocabulário usado nesta nota

| Termo | Significado |
|---|---|
| **MLB** | Código de um anúncio no Mercado Livre (ex.: `MLB4756046417`). |
| **SKU** | Código interno do produto. Um SKU pode ter vários MLBs (anúncios do mesmo produto). |
| **Card "Características principais"** | O bloco de atributos do editor do anúncio no ML. Na API é o grupo `attribute_group_id = "MAIN"` de `GET /categories/{id}/technical_specs/input`. |
| **Lista fechada** | Atributo cujo valor precisa ser uma das opções que a categoria oferece. O oposto é o texto livre. |
| **N/A** | Valor que o vendedor marcou explicitamente como "não se aplica". Na API vem como `value_id = -1` e `value_name = null`. A planilha mostra como `[sem nome; id=-1]`. |
| **ERP** | Sistema de gestão da empresa. A tabela `Produto` do banco é carregada a partir do arquivo de referência dele. |
| **Fase 1 / Fase 2** | Fase 1 = só ler dados via API (a fase atual). Fase 2 = corrigir os atributos via `PUT /items/{id}` (futuro, nada implementado). |

## Mudança de rumo

- **O fluxo por JSON foi abandonado.** Matheus decidiu parar de gerar e colar um arquivo `contexto_llm_{SKU}.json` por SKU (script `montar_contexto_llm_por_sku.py`).
- **A entrega passa a ser uma planilha Excel única da empresa**, organizada por linhas, que a LLM preenche em massa. Um mockup validado por Matheus (`Mockup_Planilha_Caracteristicas_LLM.xlsx`) fixou o desenho antes do gerador.
- **A LLM preenche a partir de quatro fontes:** títulos dos MLBs, descrição, dados do ERP e os **valores atuais que já estão no ML**. Matheus quer os valores atuais na planilha porque muita coisa foi preenchida à mão e é informação útil.
- **Do ERP ficam no contexto:** as medidas do produto "sem embalar" (altura, largura, comprimento, peso) e a Marca.
- **Princípio de desenho (mantido do checkpoint anterior):** a ficha é por SKU. A planilha traz a união dos campos pedidos pelas categorias de todos os MLBs do SKU, com **um valor por campo**. Multi-categoria por SKU é o estado normal. Cada tamanho (P, M, G) é um SKU próprio.

## O gerador `gerar_planilha_llm_inventario.py`

Fica em `scripts_exploracao_ML/` do repositório do Sistema Interno V2. Foi entregue como bloco de código na conversa, e Matheus criou o arquivo. Só lê: consulta o banco e faz `GET` na API do ML. Não grava nada no banco, não chama LLM e não escreve no ML. Arquivos `*.xlsx` e os caches `*.json` dessa pasta são ignorados pelo git.

### Como rodar

```
python -u "scripts_exploracao_ML\gerar_planilha_llm_inventario.py"
```

O console mostra 6 etapas (ler o banco, ler os anúncios na API, ler as categorias na API, ler ficha técnica e nomes de categoria no banco, montar as linhas, gravar o Excel). No fim imprime o bloco RESUMO, que também vira a aba RESUMO.

### Configuração (topo do script)

| Variável | Valor da rodada completa | Função |
|---|---|---|
| `CONTA` | `"MB"` | `"MB"` (Magazine) ou `"SV"` (Samvale). Uma conta por execução. |
| `LIMITE_SKUS` | `None` | `None` = inventário inteiro; um número = amostra espalhada por categoria. |
| `STATUS_ACEITOS` | `{"active", "paused"}` | Status que entram na planilha. |
| `TAMANHO_LOTE` | `25` | SKUs por lote (coluna Lote), agrupados por categoria. |
| `THREADS` | `40` | Chamadas simultâneas à API (o pool do projeto aguenta 50). |
| `USAR_CACHE` | `True` | `False` baixa tudo de novo. |
| `VINCULAR_PELO_EAN` | `True` | SKU sem Produto no formato `F` + EAN13 + `.NNN` tenta achar o Produto pelo EAN (marcado "Sim (EAN inferido)"). |
| `LIMITE_OPCOES_NA_CELULA` | `40` | Lista com mais opções que isso vai para a aba LISTAS. |

**Caches em disco** (na mesma pasta do script): `cache_planilha_llm_itens_{CONTA}.json` e `cache_planilha_llm_categorias.json`. **O cache não tem prazo de validade.** Quem quiser valores atuais de verdade precisa apagar os arquivos (ou usar `USAR_CACHE = False`) antes de rodar.

**Arquivo de saída:** `planilha_llm_{CONTA}_{amostraN|completa}_{AAAAMMDD_HHMM}.xlsx`, na mesma pasta.

### As abas da planilha

| Aba | O que tem |
|---|---|
| **LEIA-ME** | Como usar a planilha. |
| **INSTRUCOES_LLM** | 18 linhas de instrução para a LLM. |
| **SKUS** | 1 linha por SKU, 21 colunas: SKU, Lote, Produto (ERP), Marca (ERP), Cód. Fabricante, Categoria (ERP), Categoria ML (caminho), NCM, EAN, Altura/Largura/Comprimento/Peso sem embalar, Descrição (ERP), Títulos dos MLBs, Imagem 1 (URL, opcional), Produto no ERP?, Ativo no ERP?, Qtd. de MLBs (ativos/pausados), Categorias ML, Ficha técnica ML. |
| **CAMPOS** | A fila da LLM: 1 linha por SKU e campo, 20 colunas (A a T): ID, Lote, SKU, Produto, Campo, Campo na API, Obrigatório, Tipo, Limite de caracteres, Opções válidas, Valores atuais nos MLBs, Avisos, **PREENCHER**, Confiança, Observação da LLM, Checagem automática, Revisão humana, Categorias que pedem o campo, Nº de MLBs que pedem, Lista (apoio). |
| **LISTAS** | Listas fechadas longas em formato "uma opção por linha": Lista, Campo na API, ID da opção, Nome da opção. |
| **MLBS** | 1 linha por MLB, 9 colunas, com coluna Alertas e Link do anúncio. |
| **RESUMO** | Os números da execução. |

### Regras embutidas

- **Chave de agrupamento do SKU:** `produto.sku`; se não houver, `sku_ml`; se também não houver, o próprio MLB.
- **Fusão entre as categorias de um SKU:** obrigatório se qualquer categoria exigir; lista fechada = interseção por id; texto livre = menor tamanho máximo; unidades = interseção. Toda divergência vira aviso, nada é resolvido em silêncio.
- **Vínculo com o ERP:** o vínculo oficial é pelo SKU. Pelo EAN contido no SKU o vínculo é inferido, só quando o oficial não existe, e fica marcado como "inferido".
- **Valores atuais** vêm de `GET /items/{id}?include_internal_attributes=true` (um item por chamada). O parâmetro é o que faz os atributos marcados como N/A aparecerem.
- **Avisos automáticos por linha:** diferença entre categorias; N valores diferentes entre MLBs; vazio em parte dos MLBs; vazio em todos; valor atual fora da lista; valor sem nome (N/A).

### Fórmula da coluna "Checagem automática" (coluna P de CAMPOS)

Avalia o que a LLM (ou a pessoa) escreveu em PREENCHER (coluna M). Lê o limite de caracteres (I), o tipo (H), as opções válidas inline (J) e a lista de apoio (T). Para listas longas confere contra a aba LISTAS com `SUMPRODUCT`; para as curtas usa `FIND`, que **diferencia maiúsculas de minúsculas**.

```
=IF(M{r}="","",IF(AND(ISNUMBER(I{r}),LEN(M{r})>I{r}),"Excede o limite ("&LEN(M{r})&"/"&I{r}&")",IF(H{r}="Lista fechada",IF(T{r}<>"",IF(SUMPRODUCT((LISTAS!$A$2:$A${n}=T{r})*(LISTAS!$D$2:$D${n}=M{r}))>0,"OK","Fora da lista"),IF(ISNUMBER(FIND("; "&M{r}&"; ","; "&J{r}&"; ")),"OK","Fora da lista")),"OK")))
```

(`{r}` é a linha e `{n}` é a última linha da aba LISTAS; o script substitui os dois ao gravar.)

## Contexto das rodadas

> [!warning] Os números de ERP desta nota são provisórios
> As rodadas foram feitas no PC de casa de Matheus. O banco foi sincronizado com o ML (`buscar_mlbs`, `buscar_detalhes`, `buscar_dados_sku_completo` e `popular_banco`, nas duas empresas), mas o **arquivo de referência do ERP tem cerca de 1 mês de defasagem**. Cobertura do ERP, vínculos e dados do ERP (marca, medidas, NCM, descrição, código de fabricante) vão mudar com o ERP atual, que Matheus tem no escritório. Os dados do ML (valores atuais dos atributos) são lidos da API na hora e não sofrem esse problema.

## Rodadas executadas

| Item | Amostra (17:54 e 18:00) | Completa (18:01) |
|---|---|---|
| SKUs na planilha | 30 | 1.577 |
| MLBs lidos na API / falhas | 81 / 0 | 3.964 / 0 |
| Categorias lidas / falhas | 33 / 0 | 302 / 0 |
| Threads | 30 | 40 |
| Duração | 5 s (a rodada de 18:00 usou cache: 1 s) | 24 s |
| Lotes (até 25 SKUs) | 2 | 64 |
| Linhas em CAMPOS | 166 | 7.964 |
| Linhas em MLBS | 81 | 3.964 |
| Listas longas em LISTAS (nº / maior) | 1 / 51 opções | 6 / 55 opções |
| SKUs com mais de 1 categoria ML | 4 (13%) | 139 (9%) |
| Conjuntos de campos distintos entre os SKUs | 24 | 180 |
| MLBs com alerta de identidade | 0 | 10 |
| MLBs em mais de 1 SKU / com mais de 1 variação | 0 / 0 | 0 / 0 |

**Lição sobre a amostra:** ela previu mal. Para o inventário inteiro estimei 8 a 9 mil linhas (deu 7.964), a fração de SKUs multi-categoria caiu de 13% para 9%, e os conjuntos de campos distintos pareciam "quase um por SKU" (24 de 30) mas são apenas 180 entre 1.577 SKUs. Há muita repetição, o que favorece tratar em bloco.

### Cobertura do ERP (provisória)

| Item | Amostra | Completa |
|---|---|---|
| Com Produto no ERP | 14 (47%) | 865 (55%) |
| Vínculo pelo SKU / inferido pelo EAN | 14 / 0 | 864 / 1 |
| Sem Produto no ERP | 16 (53%) | 712 (45%) |
| Produto inativo no ERP (dentre os com ERP) | 0 | 0 |
| Marca preenchida | 100% | 100% |
| Cód. fabricante preenchido | 79% | 90% |
| Descrição preenchida | 86% | 84% |
| NCM preenchido | 93% | 98% |
| Imagem 1 preenchida | 100% | 100% |
| Medidas: as 4 preenchidas | 100% | 99% (857; 7 parciais; 1 sem nenhuma) |

A inferência pelo EAN achou só 1 SKU. Os 712 sem Produto são, portanto, em sua maioria ausências reais no arquivo de ERP usado. O número é parecido com os 701 SKUs sem Produto do checkpoint de 16:20.

### Avisos nos campos (rodada completa, 7.964 linhas)

Um aviso pode se repetir na mesma linha, então os números não somam o total de linhas com problema.

| Aviso | Linhas |
|---|---|
| Valor atual fora da lista | 1.024 |
| Vazio em todos os MLBs | 1.000 |
| Valores diferentes entre MLBs | 830 |
| Valor sem nome (N/A) | 455 |
| Vazio em parte dos MLBs | 421 |
| Diferença entre categorias | 71 |

### Campos mais frequentes (rodada completa)

BRAND (Marca) 1.577; MODEL (Modelo) 1.577; LINE (Linha) 478; MAIN_COLOR (Cor principal) 404; UNITS_PER_PACK (Quantidade de embalagens) 338; GENDER (Gênero) 330; SALE_FORMAT (Formato de venda) 329; AGE_GROUP (Idade) 272; SIZE_GRID_ROW_ID (ID da linha da guia de tamanhos) 257; POWER_SUPPLY_TYPE (Tipo de alimentação) 201; GARDEN_SPRAYER_TYPE, BATTERY_TYPE e TOTAL_CAPACITY 153 cada; APGID 130; ALPHANUMERIC_MODEL (Modelo alfanumérico) 117.

- **Marca e Modelo somam 3.154 das 7.964 linhas, quase 40%.**
- **Cluster de pulverizadores:** os campos Tipo de pulverizador, Tipo de bateria e Capacidade total têm todos 153 linhas. Parece uma única categoria grande, com cerca de 10% dos SKUs, onde uma tabela de mapeamento única resolveria o bloco.
- **Candidatos a ficar fora da LLM:** SIZE_GRID_ROW_ID (257) e APGID (130) parecem identificadores (guia de tamanhos e sistema interno), não atributos descritivos. **Ainda não confirmado**: falta a doc oficial. Na amostra, o APGID estava vazio em todos os MLBs onde apareceu.

## Limites da API do ML (o que foi observado)

- **Teto do aplicativo:** 18.000 chamadas por hora, em cada um dos dois apps (MB e SV têm orçamentos separados). Fonte: [[Gerencie seu Aplicativo na API do Mercado Livre]] e [[Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale)]]. "300 por minuto e 5 por segundo" é só a divisão do teto por hora; o vault não registra janela de rajada.
- **40 threads funcionaram:** cerca de 4.150 chamadas (3.883 itens e 269 categorias baixados) em cerca de 20 s, sem nenhuma falha visível. Isso equivale a uns 23% do orçamento horário da MB.
- **Ressalva importante:** o `chamar_api` só tem backoff reativo (usa `Retry-After`, senão espera exponencial com variação aleatória, teto de 30 s). Um 429 que foi recuperado depois de esperar **não aparece no console**. O relatório de erros por execução (Regra 2 de [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]) continua sem implementação. Zero falhas quer dizer que nenhuma chamada esgotou as tentativas.
- **Otimização possível (não feita):** `GET /items?ids=` (multiget) aceita até 20 IDs por chamada, como o `buscar_detalhes` já usa ([[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]). Reduziria cerca de 4.000 chamadas para cerca de 200. A doc diz que `include_internal_attributes=true` vale também no multiget ([[Sistema de Atributos de Item na API do Mercado Livre]]), mas o projeto **nunca testou isso**, e a planilha depende desse parâmetro. Testar antes de trocar.
- **Lição de processo:** a recomendação inicial de número de threads foi dada antes de consultar essas notas do vault. Antes de dimensionar concorrência numa API, ler primeiro as notas de limite.

## Achados da amostra de 30 SKUs (lidos na planilha)

### Os 18 avisos "fora da lista" são reais

Não são falso positivo (a comparação ignora só maiúsculas e minúsculas).

| Grupo | Linhas | Exemplos |
|---|---|---|
| Marca fora da lista fechada da categoria | 8 | JactoClean (a lista só tem "Jacto"), Avant (a lista só tem "Generic"), Ortho Pauher (2), Scaleno (2), Importado, Magazine Brasileiro |
| Mesmo sentido, grafia diferente da opção | 7 | "LUZ BRANCA FRIA" no lugar de "Branco-frio"; "Manual" no lugar de "Operação manual" (2); "Umidificador de ar" no lugar de "Umidificador"; "Almofadado" no lugar de "Almofada"; "Costal Manual" (provavelmente "Mochila de pressão"); "Pulverizador manual" (ambíguo) |
| Valor no campo errado | 2 | "37" em Altura (a lista é Curta/Longa); "Neoprene" em Tipo de joelheira (a lista é Imobilizador/Estabilizadora) |
| Sem opção equivalente | 1 | "Pele" no campo Órgão (a lista tem Coração e Cérebro) |

### Modelo mistura três usos

- código de fabricante (ex.: `OR1038_3`, `AC019`, `J6000 M16`);
- palavras soltas separadas por vírgula, estilo SEO, às vezes uma por palavra, inclusive palavras vazias (ex.: "Protetor, Para, Apoio, De, Bengala…");
- nome genérico (ex.: "Faixa", "Antiaderente", "500 Peças").

O mesmo SKU alterna estilos entre MLBs. O campo Modelo alfanumérico (ALPHANUMERIC_MODEL) é quase sempre vazio, e num caso guarda o próprio SKU.

### Outros achados

- **Só 7 dos 30 SKUs têm algum MLB ativo** (14 dos 81 MLBs). Os outros 23 só têm MLBs pausados. O inventário todo é cerca de 78% pausado (checkpoint de 16:20: 893 ativos de 3.993).
- **SKU sem código no ML:** o `MLB4756046417` não tem SKU gravado no anúncio. O agrupamento pelo próprio MLB funcionou.
- **SKU em 5 categorias:** `F7899296599403.001` tem MLBs em 5 categorias. A Marca é lista fechada em uma (`MLB120294`) e texto livre nas outras quatro; a planilha avisa que "a lista vale só como restrição nas categorias que têm lista".
- **N/A:** 6 linhas na amostra e 455 na rodada completa. São marcações feitas à mão e coexistem com valores preenchidos nos outros MLBs do mesmo SKU.
- **Valores inconsistentes entre MLBs** do mesmo SKU (ex.: "Tipo de joelheira" com N/A, "Neoprene" e vazio) mostram o trabalho manual sem padrão.
- **Marca do ERP em SKUs vinculados** inclui valores como JACTOCLEAN, Magazine Brasileiro e Importados… Ver a decisão abaixo.

## Decisões

1. **Abandonar o JSON por SKU em favor da planilha única** (Matheus).
2. **Marca do ERP é 100% confiável e é a fonte da verdade** para o atributo BRAND dos SKUs vinculados ao ERP (Matheus garantiu). Consequências:
   - nos SKUs com ERP (55% na rodada provisória), o BRAND vem direto do ERP e a LLM não decide;
   - nos SKUs sem ERP, a LLM propõe a marca a partir dos títulos e dos valores atuais do ML, e a marca é conferida na revisão;
   - se o ML já tem o mesmo valor do ERP, não é correção, mesmo que a lista fechada da categoria não conheça a marca (3 das 8 linhas de Marca fora da lista na amostra);
   - se o ML tem valor diferente do ERP, a linha é uma correção (ex.: "Importado" no ML contra "Importados…" no ERP).
3. **Medidas "sem embalar" e Marca do ERP ficam no contexto da LLM** (Matheus).

## Em aberto

**Decisões de Matheus:**

- **Grafia da Marca:** copiar exatamente a grafia do ERP, ou padronizar? O ML tem "MAGAZINE BRASILEIRO" e "Magazine Brasileiro" no mesmo SKU, e o próprio ERP mistura maiúsculas e capitalizado entre SKUs.
- **Modelo e Modelo alfanumérico:** proposta de Claude, ainda sem resposta: código de fabricante em ALPHANUMERIC_MODEL e palavras-chave SEO em MODEL (a regra de negócio de Modelo já existe).
- **Valor em campo errado ou sem opção equivalente:** proposta de Claude, ainda sem resposta: a LLM sugere a opção certa; se não houver, deixa o campo vazio com observação.
- **Escopo da correção:** ativos primeiro e pausados depois, ou tudo junto? Proposta de Claude: coluna de prioridade (ativo/pausado) na aba SKUS.
- **Regra de Marca fora da lista na Fase 2:** depende da doc oficial (abaixo).

**Análises e trabalho técnico:**

- **Analisar a planilha completa** (`planilha_llm_MB_completa_20261001_1801.xlsx`, na pasta `scripts_exploracao_ML`): os 10 MLBs com alerta de identidade (como não há variações, devem ser SKU gravado no ML diferente do SKU do grupo ou status diferente entre banco e ML); os pares campo e valor mais frequentes entre os 1.024 "fora da lista" (provável tabela de mapeamento); quantos SKUs têm cada um dos 180 conjuntos de campos.
- **Confirmar** se SIZE_GRID_ROW_ID e APGID ficam fora da LLM.
- **Fonte da descrição do ML** para os SKUs sem ERP: não implementada (a descrição do ERP está preenchida em 84% dos vinculados).
- **Caso do pai com variações `MLB6296165596`** (pendência do checkpoint de 16:20): a rodada completa não encontrou nenhum MLB com mais de uma variação.
- **Diff pendente de OK de Matheus:** (a) reescrever a aba INSTRUCOES_LLM com as regras decididas; (b) gerador preencher o BRAND dos SKUs vinculados direto do ERP, com Confiança "ERP"; (c) coluna de prioridade (ativo/pausado).
- **Refazer a rodada no escritório** com o ERP atual: importar o arquivo atual, apagar os dois caches, rodar a MB e depois a SV (`CONTA = "SV"`), e colar os RESUMOs para comparar.
- **Antes de qualquer escrita (Fase 2):** pedir o HTML da doc oficial sobre validação de atributos e erros: valores fora da lista (inclusive Marca), N/A, dimensões de pacote, vocabulário de `tags` e produtos de catálogo. Hoje não se sabe se o ML aceita num `PUT` um valor que a lista fechada não tem. Anúncios de catálogo não podem ser editados, e `PUT /items` não faz merge.

## Exemplo de ponta a ponta

1. Matheus sincroniza o banco e roda o gerador com `LIMITE_SKUS = None`.
2. Abre a aba CAMPOS e filtra por um lote. Cada linha é um SKU e um campo, por exemplo `F7895572102428.001` e "Tipo de alimentação".
3. Lê a coluna "Valores atuais nos MLBs" (ex.: `Manual` em dois MLBs) e a coluna "Opções válidas" (`Bateria; Operação manual; Bateria/Operação manual`).
4. A LLM escreve `Operação manual` em PREENCHER. A fórmula da coluna P devolve `OK`, porque o valor está na lista; se a LLM tivesse escrito `Manual`, devolveria `Fora da lista`.
5. Uma pessoa revisa a linha (coluna "Revisão humana") antes de qualquer escrita futura no ML.
