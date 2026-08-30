---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 13/08/2026
atualizado_em: 27/08/2026 07:31
relacionado: [Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Padrao de Qualidade e Clareza Estrutural do Repositorio, Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]
---

# Migração dos Scripts Consumidores (`buscar_mlbs`/`buscar_detalhes`) e Pipeline de Popular Banco

> Nota criada pra fechar uma pausa (13/08/2026, 15:20) — usuário vai trocar de PC e não vai ter acesso à conversa que gerou isso. Captura o estado real de onde a migração da API do Mercado Livre parou, depois da base de autenticação já estar migrada e validada (ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]).
>
> **Retomada em 15/08/2026, 01:39** — o usuário decidiu, de forma independente (sem lembrar desta nota), que quer trazer a API do Mercado Livre pra dentro do projeto de vez, no mesmo padrão de robustez do Sysemp. Achado confirmado do zero, lendo o código real de novo hoje: **o script que gera `dados_completos_por_sku.json` continua sem ser encontrado** — a mesma pendência registrada abaixo em 13/08 segue exatamente igual, 2 dias depois. Nada foi migrado ainda. O plano "Próximo passo, quando retomar" (mais abaixo) continua sendo o caminho certo — é aqui que a próxima sessão de trabalho nesta frente deve começar.
>
> **Retomada de novo em 25/08/2026, 10:50** — motivo desta vez é concreto e vem de outra frente: a correção de ponta a ponta da Agenda de Vídeos (Postagem/Replicação Automática, ver [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]) chegou ao ponto de precisar de MLB e dado de produto DE VERDADE vindo da API — e hoje isso só existe via JSON importado manualmente do projeto separado antigo. Mesma pendência de 13-15/08 confirmada de novo, ainda sem nenhuma mudança: os 4 problemas de `buscar_mlbs.py`/`buscar_detalhes.py` continuam os mesmos, e a origem de `dados_completos_por_sku.json` ainda não foi localizada. Passo 1 do plano abaixo ("Próximo passo, quando retomar") só pode começar depois que o usuário disser onde estão, no computador dele, os 3 arquivos da pasta separada antiga (`buscar_mlbs.py`, `buscar_detalhes.py`, `chamadas_safe_api.py`) — ainda não compartilhados nesta sessão.
>
> **Retomada de novo em 25/08/2026, 11:58** — nas ~1h desde a retomada anterior (10:50), avançamos mais do que em qualquer retomada anterior. O usuário está discutindo os detalhes técnicos da migração em paralelo, numa segunda conversa de IA que tem acesso direto ao conteúdo real dos arquivos do projeto antigo (num outro computador). O papel desta sessão foi validar cada afirmação vinda de lá contra o código real deste repositório (`Projeto_Sistema_Interno_V2`) — nunca aceitar descrição sem checar, mesma disciplina de sempre. Resultado: os 4 arquivos que faltavam foram identificados, a lógica de cada um foi comparada com o código novo, e descobrimos que o trabalho de migração restante é **bem menor** do que esta nota fazia parecer até agora — ver a seção nova "Achado que reduz o tamanho do trabalho" abaixo. Todo o conteúdo a partir daquela seção foi escrito nesta atualização; o que já existia acima e abaixo foi mantido sem apagar nada, só com pequenos avisos apontando pro que mudou.
>
> **Retomada de novo em 26/08/2026, 11:11** — ponto 02 do plano por etapas (validado com o usuário nesta mesma retomada: "01 tokens ✓ / 02 buscar_mlbs.py / 03 buscar_detalhes.py / 04 classificar_por_sku.py / 05 buscar_dados_sku_completo.py") está **concluído e validado nas 2 empresas**. O conteúdo real de `buscar_mlbs.py` — que o passo 1 do plano mais abaixo ainda listava como pendente de colar — foi colado, comparado e migrado de verdade nesta sessão, não é mais descrição de segunda mão. Decisão de arquitetura tomada: em vez de reaproveitar `mercado_livre/` (app madura, mas confirmado por grep que nunca chama a API ao vivo) ou tratar como `scripts_dev/` descartável, foi criado um app novo, `integracao_mercado_livre/`, espelhando a separação já validada no Sysemp (`api_sysemp/` × `integracao_sysemp/`). Ver seção nova "Ponto 02 concluído e validado (26/08/2026, 11:11)" abaixo pra todos os detalhes técnicos — o que falta agora vale só pra `buscar_detalhes.py`, `chamadas_safe_api.py`, `classificar_por_sku.py` e `buscar_dados_sku_completo.py` (pontos 03 a 05).
>
> **Retomada de novo em 26/08/2026, 11:40** — ponto 03 (`buscar_detalhes.py`) também concluído, na mesma sessão de foco, sem pausa real entre um ponto e outro. Desta vez o conteúdo real do script já veio colado direto nesta sessão (não só descrito de segunda mão), comparado linha por linha contra o `cliente_api.py` atual antes de qualquer diff — e confirmou uma boa notícia: o formato de `lista_mlbs.json` que `buscar_mlbs.py` já produz bate exatamente com o que `buscar_detalhes.py` espera ler, sem precisar de nenhum adaptador entre os 2 pontos. Reaproveitado o mesmo padrão de exibição em console do ponto 02 (blocos `rich.Progress` fechados um de cada vez) — usuário pediu explicitamente pra usar essa solução como referência pros próximos arquivos também, adaptada aqui pra agrupamento sequencial (não existe uma dimensão tipo "status" nesse script). Resolvida também a pendência que ficava em aberto desde 25/08: o caminho de `detalhes_mlbs.json` nos importadores (`importar_dimensoes_declaradas_ml.py`) deixou de ser uma constante fixa de raiz e virou função resolvida pela empresa ativa, já na convenção nova (`integracao_mercado_livre/Arquivos_API/<Empresa>/`). Console real confirmado logo em seguida: Magazine, 5906 registros (5640 MLBs, 100%, 0 erros), 165,3s, sem gargalo (5 lotes mais lentos todos abaixo de 1s). Ver seção "Ponto 03 concluído..." abaixo pra todos os detalhes técnicos.
>
> **Retomada de novo em 26/08/2026, 11:50** — Samvale também rodado com `buscar_detalhes.py`, mesmo resultado limpo do Magazine: 3280/3280 MLBs (100%), 3545 registros, 86,8s, 0 erros, sem gargalo. Ponto 03 fechado e confirmado nas 2 empresas, sem ressalva.
>
> **Retomada de novo em 26/08/2026, 15:42** — ponto 04 (`classificar_por_sku.py`) fechado, mas de um jeito diferente do esperado: virou uma correção de organização, não uma migração nova (ver seção "Ponto 04 concluído..." abaixo pro porquê). Mais importante: o usuário questionou a ordem do plano — em vez de esperar o ponto 05 pra só então popular o banco, religou agora as 2 etapas de ML em `popular_banco.py` que já tinham tudo pronto (`ANUNCIOS ML` e `DIMENSÕES DECLARADAS ML`), validado com execução real nas 2 empresas, sem erros. Essa é uma revisão real do plano documentado — ver seção nova pra todos os detalhes e o motivo técnico de por que só 2 das 5 etapas podiam ser religadas agora, não mais.
>
> **Retomada de novo em 26/08/2026, 16:35 — ÚLTIMA ATUALIZAÇÃO ANTES DE TROCA DE COMPUTADOR.** Ponto 05 (`buscar_dados_sku_completo.py`) fechado e validado — o **plano de 5 pontos está 100% migrado e testado**. Só `encontrar_fecho_transitivo()` precisou ser migrada de verdade (não o arquivo inteiro), pro mesmo local canônico do ponto 04. `QUALIDADE`/`COMPETICAO` religadas em `popular_banco.py` (`CAMINHO_QUALIDADE`, pendência desde 13/08, finalmente resolvida). Testado com 1 SKU em cada empresa, com validação visual real no site (não só o dado chegando — o usuário viu o gauge de qualidade e o status de competição aparecerem na tela). **Atenção crítica pra quem retomar**: esse diff foi aplicado e testado no computador do usuário, mas **ainda não foi commitado nem enviado pro GitHub** (confirmado por `git fetch` nesta sessão — remoto segue no commit do ponto 04). Ver seção nova "Ponto 05 concluído..." abaixo pra todos os detalhes técnicos, e a seção "Próximo passo" (reescrita nesta atualização) pro que falta fazer — só 2 ações, nenhuma delas é mais migração.
>
> **Retomada de novo em 27/08/2026, 07:31 — commit confirmado, base inteira rodada na Magazine.** Sessão retomou depois da troca de computador (outra sessão, de estudo de documentação da API, rodou entre uma coisa e outra — sem tocar em código, sem conflito). O risco crítico da atualização anterior está resolvido: `git fetch` confirmou o commit `602d288` já em `origin/dev`, batendo exatamente com o diff testado — nada foi perdido na troca de máquina. Depois disso, o usuário rodou `buscar_dados_sku_completo --empresa magazine` (sem `--skus`) na base inteira: **1676 SKUs, 100% processados, 0 erros, 3280,5s (~54,7min)**. Rodou `popular_banco --empresa MAGAZINE` de novo em seguida — banco populado com sucesso, `QUALIDADE`/`COMPETICAO` agora refletem a base real, não só o SKU de teste. **Magazine está com o pipeline dos 5 pontos 100% fechado, ponta a ponta.** Samvale segue só com o teste de 1 SKU — usuário decidiu deixar a base inteira de lá pra rodar depois, sem urgência (código já commitado e validado, é só rodar quando houver tempo). Ver seções atualizadas abaixo.

## Por que isso importa pra quem está lendo agora (explicação simples)

Pensa assim: existem 2 "andares" na integração com o Mercado Livre.

**Andar 1 — login/autenticação.** Já está pronto, migrado e testado de verdade (nas 2 contas da empresa, MB e SV) — ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]. Ninguém precisa mexer nisso agora.

**Andar 2 — os scripts que usam esse login pra buscar produto de verdade** (`buscar_mlbs.py`, `buscar_detalhes.py`). Esses ainda moram numa pasta separada do computador, fora deste repositório, e têm 4 problemas conhecidos (listados abaixo) que impedem eles de rodar aqui dentro sem ajuste. Enquanto esse andar não for migrado, o comando `popular_banco` do sistema principal não tem como ler dado fresco da API — ele fica dependendo de arquivos `.json` antigos, gerados manualmente em outro lugar.

> [!info] Atualização de 25/08/2026, 11:58 — o Andar 2 tem 2 metades, e só 1 ainda falta migrar
> O Andar 2 descrito acima, na prática, se divide em 2 metades bem diferentes: **metade A — busca e geração dos `.json`** (fala com a API do ML, escreve arquivo) e **metade B — leitura e gravação no banco** (lê o `.json`, grava nos modelos do Django). A metade B **já existe, já está pronta, e não precisa de migração nenhuma** — ver a seção "Achado que reduz o tamanho do trabalho" mais abaixo, escrita nesta mesma atualização. Só a metade A (os scripts que ainda moram fora deste repositório) precisa ser trazida pra dentro.

## Achado que reduz o tamanho do trabalho: o app `mercado_livre/` já existe e está maduro

**O quê:** dentro do repositório `Projeto_Sistema_Interno_V2`, já existe um app Django completo chamado `mercado_livre/` — um "app Django" é uma pasta com um conjunto de funcionalidades relacionadas, dentro do framework usado por todo o Sistema Interno (Django): tem seus próprios modelos de banco de dados (pasta `models/`), suas próprias telas (`views.py` + `templates/`), e seus próprios comandos executáveis (`management/commands/`). Confirmamos isso lendo os arquivos reais nesta sessão, não por descrição de terceiros.

**Por quê isso muda o entendimento anterior:** até 25/08/2026 10:50, esta nota dava a entender que faltava migrar, em bloco só, "os scripts que consomem a base de autenticação pra buscar produto de verdade". Na prática, esse bloco sempre teve 2 metades — e a metade B (ler o `.json` e gravar no banco) **já estava pronta desde antes desta investigação sequer começar**. Ela só está desligada porque `core/management/commands/popular_banco.py` tem as 5 chamadas a esses importadores comentadas desde 15/08/2026, com este comentário explícito, dentro do próprio código: *"Etapas do Mercado Livre desativadas (15/08): os 3 arquivos JSON de que elas dependiam deixaram de ser lidos por este comando — a origem desse dado (API do ML) ainda está sendo integrada de forma organizada, com comando próprio, em vez de arquivo solto."*

**Pra quê isso importa:** o trabalho de migração real, a partir de agora, é **só a metade A** — trazer pro repositório os scripts que buscam dado na API do ML e escrevem os `.json`, ajustados pro cliente HTTP novo (`api_mercado_livre/core/estrutura_api/cliente_api.py`). Depois disso, é só descomentar as 5 linhas dentro da lista `etapas`, no arquivo `core/management/commands/popular_banco.py` — não precisa escrever nenhum consumidor novo, porque ele já existe e já funciona.

**Como confirmamos (evidência real, não suposição):** lendo direto os arquivos abaixo, todos dentro deste repositório:

| O que já existe | Onde (arquivo real) |
|---|---|
| 11 modelos de banco de dados, com 22 migrations já aplicadas (uma "migration" é um arquivo que descreve 1 mudança na estrutura do banco — 22 delas confirma que este app já evoluiu bastante, não é recente) | `mercado_livre/models/anuncio.py`, `qualidade_anuncio.py`, `criterio_qualidade.py`, `qualidade_anuncio_criterio.py`, `competicao_catalogo.py`, `recomendacao_precificacao.py`, `promocao_mercado_livre.py`, `frete_ml.py`, `variacao.py`, `configuracao_mercado_livre.py`, `tipo_de_anuncio.py` |
| 5 scripts de importação, já escritos, reescritos em Programação Orientada a Objetos (POO — cada um organizado como 1 ou mais classes com métodos, em vez de código solto em sequência) em 16/07/2026, usando `bulk_create`/`bulk_update` (grava várias linhas no banco de uma vez só, muito mais rápido que 1 linha por vez) | `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py`, `importar_dimensoes_declaradas_ml.py`, `importar_qualidade_anuncio.py`, `importar_competicao_catalogo.py`, `importar_promocoes_ml.py` |
| Telas próprias já funcionando, com CSS e JS dedicados | `mercado_livre/views.py`, `mercado_livre/templates/mercado_livre/`, `mercado_livre/static/mercado_livre/` |
| Um comando de investigação, só leitura, que já varre os 3 arquivos `.json` esperados e mede o preenchimento de cada campo | `mercado_livre/management/commands/investigar_campos_api.py` |

## Os 4 arquivos do projeto antigo, identificados e comparados com o código novo

Nesta sessão, com ajuda de uma segunda conversa de IA que tem acesso ao conteúdo real dos arquivos (numa pasta separada, fora deste repositório, em outro computador), identificamos os 4 arquivos que faltavam pra fechar a metade A (busca na API + geração dos `.json`), e comparamos a lógica de cada um contra o `api_mercado_livre/core/` já migrado (ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]).

> [!warning] O que foi verificado direto no código real desta sessão × o que veio só por descrição
> `buscar_detalhes.py` teve o conteúdo completo colado nesta conversa e foi comparado, linha por linha, contra o código real deste repositório — é verificação de verdade, com o mesmo nível de confiança de qualquer outro achado desta nota. Os outros 3 (`chamadas_safe_api.py`, `buscar_mlbs.py`, `buscar_dados_sku_completo.py`, `classificar_por_sku.py`) foram descritos pela segunda conversa de IA — as descrições são internamente consistentes e batem com evidência independente que já tínhamos (ver seção de schemas, abaixo), mas o conteúdo literal desses 3 ainda não foi colado nesta sessão. **Antes de escrever o diff de migração de verdade desses 3, o conteúdo real de cada um ainda precisa ser lido aqui.**

| Arquivo | O que faz | Precisa adicionar `conta`? | Onde exatamente |
|---|---|---|---|
| `buscar_detalhes.py` (conteúdo real já verificado) | Busca o detalhe completo de cada MLB (o identificador de 1 anúncio no Mercado Livre, ex: `MLB123456789`) via `/items?ids=...`, gera `detalhes_mlbs.json` | Sim | 1 chamada a `chamar_api`, dentro do loop de lotes de 20 registros |
| `chamadas_safe_api.py` | Equivalente antigo do `cliente_api.py` novo — mesma função `chamar_api`, mesmo backoff (`Retry-After` do cabeçalho HTTP, senão exponencial+jitter com teto de 30s), mesmo tratamento de HTTP 206 (parcial, com 1 retry), mesma exceção dedicada pra HTTP 401. Confirmamos (comparando com o `cliente_api.py` real, já lido nesta mesma sessão) que a lógica é idêntica — não são 2 implementações concorrentes, é a mesma coisa com nome de arquivo diferente | Sim | Assinatura de `chamar_api(...)` **+ as 2 chamadas internas a `obter_token_valido()`** — uma no início do loop de tentativas, outra dentro do bloco que trata o HTTP 206 (fácil de esquecer essa segunda, por estar num bloco secundário) |
| `buscar_mlbs.py` | Varre as 168 combinações possíveis de característica de anúncio (6 status × 7 tipos de logística × 2 tipos de anúncio × 2 classificações de catálogo, geradas via `itertools.product` — função do Python que gera todas as combinações possíveis entre listas) e gera `lista_mlbs.json`, com 1 registro por MLB no formato `{mlb, status, logistica, tipo, catalogo}` | Sim | 1 chamada a `chamar_api`, dentro da função `buscar_mlbs_varrida` |
| `buscar_dados_sku_completo.py` | **Confirmado: é a origem de `dados_completos_por_sku.json`** — o arquivo cuja origem esta mesma nota registrava como "não localizada" desde 13/08/2026 (ver blockquotes acima). Busca, por SKU, o bloco de qualidade/performance e o bloco de competição de catálogo (price_to_win) | Sim | 2 chamadas a `chamar_api` (função `chamar_performance` e função `chamar_price_to_win`) |
| `classificar_por_sku.py` | Lógica pura de classificação (função `classificar_tipo`, mais montagem de árvore de relações entre MLBs via `encontrar_fecho_transitivo`) — **não faz nenhuma chamada de API** | Não se aplica | — pode ser trazido pro repositório sem alteração nenhuma |

## Schemas reais confirmados dos 3 arquivos `.json`

Os 3 arquivos abaixo são os únicos que o pipeline `popular_banco` (ver seção "Achados sobre o pipeline de popular banco", mais abaixo) espera. Os schemas foram confirmados lendo o código real dos importadores (que já leem esses campos hoje) e, no caso de `detalhes_mlbs.json`, também confirmado contra o `buscar_detalhes.py` real.

**`lista_mlbs.json`** (gerado por `buscar_mlbs.py`) — 1 registro por MLB: `{mlb, status, logistica, tipo, catalogo}`. Confirmado indiretamente: o próprio `buscar_detalhes.py` lê esse arquivo e usa `meta.get("status")`/`meta.get("logistica")`/`meta.get("tipo")`/`meta.get("catalogo")` pra preencher os campos `ga_status`/`ga_logistica`/`ga_tipo`/`ga_catalogo` de cada registro que ele mesmo gera.

**`detalhes_mlbs.json`** (gerado por `buscar_detalhes.py`, esperado em `Arquivos_API/detalhes_mlbs.json`) — chave de topo `"registros"`, uma lista simples (não agrupada por SKU), 1 registro por variação (ou 1 registro só, se o anúncio não tiver variação). Campos confirmados como consumidos por `importar_anuncios_ml.py` (arquivo `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py`) **e** confirmados como gerados por `buscar_detalhes.py` — os nomes batem exatamente dos 2 lados, sem precisar de nenhum "tradutor" de campo: `sku`, `status`, `listing_type_id`, `logistic_type`, `flex`, `tags`, `title`, `permalink`, `date_created`, `last_updated`, `item_relations`, `available_quantity`, `sold_quantity`, `variacao_atributos`, `variacao_num_fotos`, `thumbnail`, `imagem_principal`, `price`, `original_price`, `catalog_listing`, `catalog_product_id`.

**`dados_completos_por_sku.json`** (gerado por `buscar_dados_sku_completo.py`) — chave de topo `"skus"`, uma lista de blocos, 1 bloco por SKU: `{sku, total_mlbs, mlbs: [{mlb, mlbu, classificacao, performance: {chamado, dados, http, erro}, price_to_win: {chamado, dados, http, erro}}]}`. `mlbu` (também chamado de `user_product_id` na API do ML) é um identificador que **2 anúncios diferentes compartilham** quando um é a versão "Base" e o outro é a versão "Catálogo" do mesmo produto — usado pra não repetir a mesma chamada de performance 2 vezes pro mesmo par. `performance` vem de `importar_qualidade_anuncio.py` (contém `score`, `level_wording`, `calculated_at`, `buckets`); `price_to_win` vem de `importar_competicao_catalogo.py` (contém `status`, `current_price`, `price_to_win`, `visit_share`, entre outros).

> [!success] `classificacao` não é cálculo duplicado — é a mesma função, reusada
> O campo `classificacao` dentro de `dados_completos_por_sku.json` (usado por `importar_competicao_catalogo.py` como `== 'catalogo'` pra decidir se chama o price_to_win) **não é um cálculo separado** do que `importar_anuncios_ml.py` recalcula a partir de `detalhes_mlbs.json` (via `catalog_listing`/`catalog_product_id`, função `classificar_catalogo()`). É o resultado da mesma função `classificar_tipo()` (definida em `classificar_por_sku.py`), chamada por `buscar_dados_sku_completo.py` no momento de gerar o `.json` e só **guardada em cache** ali, pra não precisar recalcular depois. Confirmado pela segunda conversa de IA, que tem acesso ao código real do projeto antigo — não são 2 fontes de verdade, é 1 função só, chamada de 2 lugares.

## Caminhos reais confirmados — e o mesmo problema de pasta se repete

O 4º problema conhecido (ver seção "Problemas conhecidos", abaixo) já registrava que `buscar_detalhes.py` salva em pasta diferente da esperada. Confirmamos agora que **o mesmo tipo de erro se repete no outro arquivo**:

| Arquivo gerado | Onde o script antigo salva hoje | Onde o sistema novo espera encontrar | Constante no código novo |
|---|---|---|---|
| `detalhes_mlbs.json` | `APP_performance/dados_brutos/detalhes_mlbs.json` (dentro de `buscar_detalhes.py`) | `Arquivos_API/detalhes_mlbs.json` | `CAMINHO_DETALHES_MLBS`, definida em `core/management/commands/popular_banco_suporte/importar_dimensoes_declaradas_ml.py` (linha 20) |
| `dados_completos_por_sku.json` | `cache/dados_completos_por_sku.json` (constante `OUTPUT`, dentro de `buscar_dados_sku_completo.py`) | `Arquivos_API/dados_completos_por_sku.json` | **Não existe hoje como constante nomeada** — o nome `CAMINHO_QUALIDADE`, usado dentro do comentário de `popular_banco.py`, nunca foi de fato declarado em nenhum arquivo. O caminho real foi confirmado lendo `mercado_livre/management/commands/investigar_campos_api.py` (linha 19), que já lista os 3 arquivos esperados |

Os 2 caminhos esperados (`Arquivos_API/detalhes_mlbs.json` e `Arquivos_API/dados_completos_por_sku.json`) são caminhos relativos — resolvidos a partir de onde o comando `manage.py` é executado, nunca caminho absoluto de disco.

## Achado novo: o campo de MLBU existiu no banco e foi removido

**O quê:** `mlbu` (o identificador compartilhado entre a versão "Base" e a versão "Catálogo" do mesmo produto, explicado na seção de schemas acima) já foi um campo do modelo `AnuncioMercadoLivre` — criado na migration `mercado_livre/migrations/0002_anunciomercadolivre.py`, e **removido** na migration seguinte, `0003_remove_anunciomercadolivre_estoque_and_more.py` (05/07/2026), junto com outros campos (`estoque`, `produto`, `qtd_vendas`, `sku_ml`) que foram realocados pro novo modelo `VariacaoAnuncioMercadoLivre` — mas `mlbu` não foi realocado pra lugar nenhum, só saiu do banco.

**Por quê isso importa:** a otimização de `buscar_dados_sku_completo.py` (usar 2 dicionários em memória, `_cache_performance` por `mlbu` e `_cache_price_to_win` por `mlb`, pra nunca chamar a API de performance 2 vezes pro mesmo par Base/Catálogo) continua funcionando sem problema nenhum — é só memória temporária durante a execução do script, não depende do banco. O que não existe hoje é uma forma de, depois de rodado, consultar direto no Django "quais MLBs compartilham o mesmo MLBU" — porque o valor não é salvo em lugar nenhum.

**Pra quê isso importa agora:** é uma decisão pendente, não um bloqueio. Antes de escrever o diff de migração de `buscar_dados_sku_completo.py`/`importar_anuncios_ml.py`, alguém precisa decidir: o campo `mlbu` volta pro modelo (em `AnuncioMercadoLivre` ou em `VariacaoAnuncioMercadoLivre`, que é quem hoje concentra os campos por variação), ou o dado continua existindo só durante a execução do script, sem nunca ser persistido?

## Onde a migração está agora

A base (`api_mercado_livre/core/` — auth OAuth2+PKCE, gerenciador de token multi-conta, cliente HTTP) já está migrada, commitada e validada com chamada real nas 2 contas (MB/SV). O próximo passo — migrar os scripts que **consomem** essa base pra buscar dados de verdade — foi identificado, mas **nada foi migrado ainda**: o usuário colou `buscar_mlbs.py` e `buscar_detalhes.py` (ainda na pasta separada antiga do computador) como os 2 próximos a mover, e a sessão mudou de foco antes de qualquer diff ser gerado ou aplicado.

> [!info] Atualização de 25/08/2026, 11:58
> Esta seção descreve o estado até 15/08/2026 — hoje sabemos mais: são 4 arquivos, não 2 (ver seção "Os 4 arquivos do projeto antigo" acima), e o `buscar_detalhes.py` já teve o conteúdo real comparado com sucesso. Nenhum diff foi aplicado ainda, mas o caminho até lá está bem mais claro agora.

> [!info] Atualização de 26/08/2026, 11:11
> Esta seção segue descrevendo o estado até 25/08/2026. Ponto 02 (`buscar_mlbs.py`) saiu de "identificado, nada migrado" pra migrado, testado e rodando em produção nas 2 empresas — ver seção nova "Ponto 02 concluído e validado (26/08/2026, 11:11)", logo abaixo.

## Ponto 02 concluído e validado (26/08/2026, 11:11): `buscar_mlbs.py` migrado e rodando nas 2 empresas

Trabalho fechado numa sessão de foco 100% em Integração ML, tocado em ritmo "ponto a ponto, validando ponto a ponto". Plano de 5 pontos confirmado com o usuário nesta retomada: 01 tokens (✓, 26/08 09:17 — ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]) → **02 buscar_mlbs.py (✓, esta seção)** → 03 buscar_detalhes.py → 04 classificar_por_sku.py → 05 buscar_dados_sku_completo.py. Promoções (o 3º `.json`, `promocoes_completo.json`) segue como assunto explicitamente pausado pelo usuário, fora deste plano de 5 pontos.

### Estrutura final: app novo `integracao_mercado_livre/`

Decisão tomada e confirmada com o usuário: **não** reaproveitar `mercado_livre/` pra esse código novo (confirmado por grep que esse app nunca chama a API ao vivo — nenhuma ocorrência de `requests`/`chamar_api`/`obter_token_valido` em todo `mercado_livre/`, é só consumo de `.json` + banco) e **não** tratar como `scripts_dev/` descartável — palavras do usuário: *"Ja quero tratar ela como algo realmente que vai rodar em produção"*. Em vez disso, criado um 3º app, espelhando a separação já validada no Sysemp (`api_sysemp/` × `integracao_sysemp/`):

```
api_mercado_livre/         → já existia (12/08) — cliente HTTP, auth, token
integracao_mercado_livre/  → NOVO (26/08) — lógica de negócio, comandos, futuros models de estado
mercado_livre/             → já existia, maduro — models de catálogo/preço + importadores .json → banco
```

`integracao_mercado_livre/` registrado em `INSTALLED_APPS` (`settings.py`), sem `models.py`/`migrations/` por enquanto (nenhum estado precisa ser persistido ainda pra este ponto). Estrutura:

```
integracao_mercado_livre/
  apps.py
  management/commands/buscar_mlbs.py    → comando fino, só resolve empresa(s) e chama o serviço
  servicos/buscar_mlbs.py               → lógica real (migrada/reescrita)
  Arquivos_API/Magazine/lista_mlbs.json → saída, isolada por empresa
  Arquivos_API/Samvale/lista_mlbs.json
  logs/Magazine/buscar_mlbs.log
  logs/Samvale/buscar_mlbs.log
```

### 2 correções reais em `api_mercado_livre/core/estrutura_api/cliente_api.py`, feitas durante a migração

Não foram cosméticas — corrigidas na raiz, não com workaround:

1. **Nome de log fixo em `"api.log"`** — `chamar_api()` sempre escrevia no mesmo arquivo, sem separar por script chamador. Primeira ideia (aninhar pasta de log por script) foi rejeitada pelo usuário como gambiarra (*"não é muito mais correto arrumar o Client_api.py? sem fazer gambiarra"*) — corrigido de verdade: `chamar_api()` e `_configurar_logger()` ganharam parâmetro `nome_log: str = "api"`. Confirmado risco zero antes de aplicar: `chamar_api()` não tinha nenhum outro chamador real em todo o repositório até este momento.
2. **Log duplicado e mais feio que o original, ao tentar silenciar o console** — story completa na próxima seção.

### Lição aprendida (reaproveitável no ponto 03+): UX de console em lote de chamadas de API

Problema real, não cosmético: a primeira execução funcionou (5640 MLBs encontrados) mas o console ficou uma parede de texto ilegível, ao ponto do usuário achar que o sistema tinha travado em loop infinito. Causa raiz: `RichHandler` (logging de cada chamada HTTP) e `rich.Progress` (barra ao vivo) escrevendo na mesma região de redraw do terminal ao mesmo tempo — os 2 não convivem.

Primeira tentativa de correção (`handler_console.setLevel(logging.WARNING)`, deixando só o arquivo de log em INFO) piorou o resultado: o `logging` do Python propaga registro por padrão pra todos os loggers ancestrais, e o handler do logger raiz do Django (`'terminal'`, definido em `settings.py`, sem filtro de nível) continuou imprimindo tudo, agora duplicado. Corrigido com `logger.propagate = False` no logger de `cliente_api.py`.

A correção definitiva não foi só esse bugfix — foi um redesenho combinado com o usuário (regra do projeto: nunca gerar código sem idealizar e confirmar antes; usuário chegou a pausar explicitamente com *"Não gere codigo vamos idealizar"* até o mockup visual ser aprovado):

- As 168 varreduras (combinações de status × logística × tipo × catálogo) se dividem naturalmente em 6 grupos de 28, por `status`.
- Cada grupo abre seu próprio bloco `rich.Progress` (context manager) — todas as 28 linhas aparecem de uma vez, em "⏳ na fila", nada fica invisível/"às cegas" enquanto roda.
- Ao fechar o `with Progress(...)`, o Rich congela aquele bloco no histórico do terminal e o próximo grupo abre um bloco novo, limpo.
- **Não muda o ritmo real das chamadas** — confirmado explicitamente com o usuário: continua 1 chamada de cada vez, em sequência estrita. Só reorganiza o que é exibido.
- Acrescentado tempo por linha (`TimeElapsedColumn`) e, no fim, ranking das 5 varreduras mais lentas — pedido explícito do usuário, pra viabilizar achar gargalo/erro depois.

Única mudança funcional real dentro desse redesenho (não só visual, sinalizada explicitamente ao usuário antes de aplicar): `try/except (ErroAPI, ErroAutenticacaoAPI)` em volta de cada varrida individual, pra 1 erro isolado não abortar o lote inteiro de 168 e pra existir de fato uma linha "✗ ERRO" possível de aparecer.

Esse padrão (agrupar por dimensão natural, 1 bloco `Progress` por grupo, try/except por item) é candidato natural a se repetir em `buscar_detalhes.py` (ponto 03) — que também roda em lote, só que por página de 20 registros em vez de por combinação.

### Resultado real, validado pelo usuário nas 2 empresas

- **Magazine**: `python manage.py buscar_mlbs --empresa magazine` → **5640 MLBs**, 35/168 varreduras com resultado, 0 com erro, 132,9s no total. Varrida mais lenta: `paused | cross_docking | gold_special | cat:false`, 15,52s / 1631 MLBs. JSON salvo em `integracao_mercado_livre/Arquivos_API/Magazine/lista_mlbs.json`. Palavras do usuário: *"FUNCIONOU PERFEITAMENTE."*
- **Samvale**: `python manage.py buscar_mlbs --empresa samvale` rodado pelo usuário com a mesma versão final — confirmado funcionando (*"ja rodei com a samvale, funcionou"*), sem números detalhados compartilhados nesta sessão.

### Pendência nova, aberta por decisão explícita: caminho de saída aninhado por empresa diverge da convenção antiga

Decisão explícita do usuário pra este ponto: `lista_mlbs.json` fica isolado por empresa dentro de `integracao_mercado_livre/Arquivos_API/<Empresa>/` (não na raiz do repo). Isso cria uma inconsistência real com os outros 2 `.json` que a migração ainda não tocou — `detalhes_mlbs.json` e `dados_completos_por_sku.json` continuam, no código hoje, esperados na raiz (`Arquivos_API/`), sem isolamento por empresa nenhum (ver seção "Caminhos reais confirmados" acima). **Decisão de unificar (ou não) essas 2 convenções fica pro ponto 03** (`buscar_detalhes.py`), por instrução explícita do usuário — não resolvida nesta sessão.

### Pendência nova, adiada de propósito: testes automatizados

O checklist combinado com o usuário pra este ponto incluía um bloco de testes automatizados (nível 0, lógica pura — ex: geração das 168 combinações/`GRUPOS`/`TOTAL_VARRIDAS`). Adiado de propósito, palavras do usuário: *"Não tenho tempo para focar em testes automatizados (Deixar pendencia para depois)"*. `buscar_mlbs` está em produção sem cobertura de teste automatizada — só validação manual real (Magazine + Samvale, resultado acima).

## Ponto 03 concluído e validado (26/08/2026, 11:40): `buscar_detalhes.py` migrado

Segundo ponto do plano de 5 fechado na mesma sessão de foco, sem pausa real entre ponto 02 e ponto 03. Plano: 01 tokens (✓) → 02 buscar_mlbs.py (✓) → **03 buscar_detalhes.py (✓, esta seção)** → 04 classificar_por_sku.py → 05 buscar_dados_sku_completo.py.

### Código real, colado nesta sessão (não descrição de segunda mão)

Diferente do que a nota registrava até aqui (conteúdo de `buscar_detalhes.py` só comparado em 25/08, numa retomada anterior), desta vez o usuário colou o conteúdo real do script direto nesta sessão de foco. Comparado linha por linha contra o `cliente_api.py` atual antes de qualquer diff ser escrito — mesma disciplina do ponto 02.

**Achado bom, confirmado por leitura real dos 2 lados:** o `meta_map = {m["mlb"]: m for m in mlbs_lista}` que `buscar_detalhes.py` monta a partir de `lista_mlbs.json` espera exatamente o formato que `buscar_mlbs.py` (ponto 02) já produz — `{"mlb": "MLB123...", "status":..., "logistica":..., "tipo":..., "catalogo":...}`. A costura entre os 2 pontos já existia pronta, sem precisar de nenhum adaptador.

### Estrutura, espelhando o ponto 02

```
integracao_mercado_livre/
  servicos/buscar_detalhes.py               → NOVO — lógica real
  management/commands/buscar_detalhes.py    → NOVO — comando fino (--empresa magazine|samvale)
  Arquivos_API/Magazine/detalhes_mlbs.json  → saída, isolada por empresa
  Arquivos_API/Samvale/detalhes_mlbs.json
  Arquivos_API/<Empresa>/detalhes_progresso.json  → arquivo de retomada (ver abaixo)
  logs/<Empresa>/buscar_detalhes.log
```

Depende de `lista_mlbs.json` já existir pra aquela empresa (saída do ponto 02) — se não existir, `buscar_detalhes()` levanta `RuntimeError` claro pedindo pra rodar `buscar_mlbs` primeiro, em vez do `console.print` + `return` silencioso que o script original tinha.

### As 4 decisões confirmadas com o usuário antes do código

1. **CSV removido.** O script original gerava `detalhes_mlbs.csv` via pandas, além do JSON. Decisão do usuário: *"Não vamos usar o csv para nada. pode excluir essa parte. So precisamos do json"* — mesma linha do ponto 02 (só JSON, banco depois).
2. **Progresso/retomada mantido e melhorado.** O script original já salvava `detalhes_progresso.json` a cada lote de 20 MLBs (retomada se cair no meio) — mantido, agora isolado por empresa. Melhoria real pedida pelo usuário (*"Vamos manter e se possivel melhorar"*): o original **sempre apagava** esse arquivo no final, mesmo com erro sobrando; agora só apaga se a execução terminou sem nenhum erro (nem de lote, nem de item individual dentro de um lote) — se sobrou erro, o arquivo fica, e a próxima execução retoma automaticamente só o que falta, sem intervenção manual.
3. **Caminho de `detalhes_mlbs.json` nos importadores, corrigido agora** — ver seção própria abaixo. Palavras do usuário: *"Ja podemos corrigir agora é algo simples"*.
4. **Estrutura confirmada** — espelhar `buscar_mlbs.py` exatamente (`servicos/` + `management/commands/`, comando `--empresa magazine|samvale`).

### Console: mesma solução do ponto 02, generalizada pra sem "status"

Usuário pediu explicitamente pra reaproveitar a solução visual do ponto 02 em outros arquivos: *"eu achei EXCELENTE a solução que obtivemos para a exibição e quero usa-la para outros arquivos tbm"*. Mesma receita (blocos `rich.Progress` fechados um de cada vez, nada fica "às cegas", `TimeElapsedColumn` por linha, ranking dos mais lentos no resumo final) — mas aqui não existe uma dimensão de negócio natural tipo "status" (como em `buscar_mlbs.py`) pra agrupar. Adaptação: agrupamento por posição sequencial, blocos fixos de 20 lotes cada (`TAMANHO_GRUPO_EXIBICAO`). O ritmo real das chamadas não muda — 1 lote de cada vez, em sequência — só a exibição.

### Mudanças funcionais reais, não só estruturais (sinalizadas ao usuário antes de aplicar)

- `try/except` do lote estreitado de `except Exception` (genérico, escondia até bug de programação) pra `except (ErroAPI, ErroAutenticacaoAPI)` — mesma correção de rigor do ponto 02.
- Arquivo de progresso não é mais apagado incondicionalmente no final — só se a execução terminou 100% sem erro (ver decisão 2 acima).
- Falta de `lista_mlbs.json` agora é `RuntimeError` claro, não retorno silencioso.
- Tempo por lote + ranking dos 5 lotes mais lentos no resumo final — novo, não existia no script original, mesmo padrão de diagnóstico do ponto 02.

### Correção do caminho de `detalhes_mlbs.json` nos importadores (decisão 3)

`CAMINHO_DETALHES_MLBS = Path('Arquivos_API/detalhes_mlbs.json')`, em `core/management/commands/popular_banco_suporte/importar_dimensoes_declaradas_ml.py`, era uma constante fixa de raiz, sem isolamento por empresa — a mesma inconsistência que ficou registrada como pendência aberta na seção "Ponto 02 concluído..." acima. Corrigida nesta sessão: virou uma função, `caminho_detalhes_mlbs()`, que resolve o caminho em tempo de chamada via `obter_empresa_ativa()`, já apontando pra `integracao_mercado_livre/Arquivos_API/<Empresa>/detalhes_mlbs.json`.

**Por que precisou virar função, não só trocar o valor:** `CAMINHO_DETALHES_MLBS` era usado como valor padrão de parâmetro (`caminho_json=CAMINHO_DETALHES_MLBS`) — um valor fixo calculado na importação do módulo ficaria travado em "nenhuma empresa ativa", porque `ComandoComEmpresa.execute()` só seta a empresa ativa depois que os imports já rodaram. Levanta `RuntimeError` claro se chamada fora de um comando com `--empresa`.

As 2 referências a `CAMINHO_DETALHES_MLBS` dentro de `core/management/commands/popular_banco.py` (linhas comentadas desde 15/08, ver seção "Achados sobre o pipeline de popular banco" abaixo) também foram atualizadas pra `caminho_detalhes_mlbs()` — só por correção/consistência, sem efeito nenhum hoje, já que essas linhas continuam comentadas (reativar `popular_banco` é um passo bem mais à frente no plano, não deste ponto).

### Resultado real, validado pelo usuário (Magazine)

Console real colado depois da atualização de 11:40 do vault — números confirmados nas 2 empresas:

**Magazine**: `python manage.py buscar_detalhes --empresa magazine` → **5906 registros** (inclui variações) a partir de **5640 MLBs processados/5640 na lista (100%, 0 erros de lote, 0 erros de item)**. 282 lotes, 15 blocos visuais (14 de 20 lotes + 1 final de 2), tempo total **165,3s**. Diferença de 266 entre registros e MLBs bate com o esperado — são os MLBs com variação, cada variação virando 1 registro a mais (visível no próprio console: os últimos lotes, com mais catálogo/variação, saltam de 20 pra 39/118/73/40/48 registros por lote). 5 lotes mais lentos, todos abaixo de 1s (0,79s a 0,72s) — nenhum gargalo real, tempo dominado pelo volume de chamadas (282), não por lentidão individual. JSON salvo em `integracao_mercado_livre/Arquivos_API/Magazine/detalhes_mlbs.json`. Palavras do usuário: *"Funcionou"*.

**Samvale** (validado em 26/08/2026, 11:50): `python manage.py buscar_detalhes --empresa samvale` → **3545 registros** a partir de **3280 MLBs processados/3280 na lista (100%, 0 erros)**. Tempo total **86,8s**. 265 registros a mais que MLBs — mesma proporção de variação do Magazine (~4,7%). 5 lotes mais lentos, de novo todos abaixo de 1s (0,81s a 0,74s). JSON salvo em `integracao_mercado_livre/Arquivos_API/Samvale/detalhes_mlbs.json`.

Ponto 03 confirmado nas 2 empresas, sem exceção — mesmo comportamento limpo (0 erros, sem gargalo) dos 2 lados. Retomada/progresso não foi exercitada em nenhuma das 2 execuções (ambas rodaram limpas, sem interrupção) — `detalhes_progresso.json` foi apagado ao final dos 2 lados, como esperado quando não sobra erro.

## Ponto 04 concluído e validado (26/08/2026, 15:42): `classificar_catalogo()` unificado, banco populado com os pontos 02-04

### Achado que muda o formato do ponto 04: não foi migração, foi eliminação de duplicação

O usuário colou o conteúdo real de `classificar_por_sku.py` — mas, ao validar contra o repositório real (mesma disciplina de sempre), apareceu um achado maior que o esperado: a regra de classificação de 2 campos (`catalog_product_id` vazio → Simples, `catalog_listing=True` → Catálogo, senão → Base) **já existia, reimplementada de forma independente**, dentro de `classificar_catalogo(registro)` em `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py` — mesmo resultado, só devolvendo `TipoDeAnuncioMercadoLivre.ClassificacaoCatalogo.SIMPLES/BASE/CATALOGO` (choices do Django) em vez de string pura.

Achado mais profundo ainda: `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py` já tem `montar_estrutura_de_sku()`, que monta a **mesma árvore hierárquica** (SKU → Página de Catálogo → Base → Catálogos + Simples) que `montar_estrutura()`/`encontrar_fecho_transitivo()` fariam em `classificar_por_sku.py` — só que essa versão já em produção lê do **banco** (depois do import), com filtros, folhas, badges e score, alimentando a tela viva do app `mercado_livre/`. A versão que o usuário colou lê do **JSON bruto da API**, antes de qualquer import.

**Decisão tomada com o usuário:** não reinventar o que já está em produção. `classificar_por_sku.py` **não foi migrado como arquivo novo** — nem a regra (já existe), nem a árvore (já existe, versão melhor, com banco). Em vez disso:

- A regra de 2 campos foi migrada pra `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py` como `classificar_catalogo(registro)` — a versão canônica agora, mesma assinatura de antes.
- `importar_anuncios_ml.py` parou de ter cópia própria — importa de lá.
- `montar_estrutura`/`encontrar_fecho_transitivo`/`imprimir_arvore` (a parte de árvore de `classificar_por_sku.py`) ficaram de fora — nenhum ponto do plano os consome, e quem precisar da árvore de verdade já tem `montar_estrutura_de_sku()`.
- Local certo confirmado por convenção real do repositório: **todo app aqui tem seu `<app>/funcoes_auxiliares/`** (conferido: `mercado_livre`, `core`, `precificacao`, `produtos`, `tiktok`, `shopee`, `agenda_videos`, `impostos` — todos têm a pasta). Não é invenção da sessão, é o padrão já estabelecido — importar de dentro de um `management/commands/` como biblioteca (que era o plano inicial) foi corretamente apontado pelo usuário como ponta solta.

### Testado de verdade, não só `manage.py check`

Achado à parte, relevante pra validação: `manage.py check` **não exercitava** a linha nova em `importar_anuncios_ml.py`, porque nada importa esse arquivo hoje (a única linha que faria isso está comentada em `popular_banco.py` desde 15/08) — `check` passa sem nunca ter carregado esse módulo. Teste real feito no shell do Django:

1. Import direto de `importar_anuncios_ml` e de `classificacao_catalogo` — os 2 funcionam.
2. `importador.classificar_catalogo is classificar_catalogo` → `True` — confirma 1 função só compartilhada, não 2 cópias.
3. `classificar_catalogo(r)` chamada em cima de registros reais de `detalhes_mlbs.json` (Magazine, ponto 03) — 3 exemplos conferidos na mão batem exatamente com a regra: `catalogo` (catalog_product_id preenchido + catalog_listing=True), `simples` (catalog_product_id vazio), `base` (catalog_product_id preenchido + catalog_listing=False).

### Decisão de sequência revisada: banco populado agora, não só no final do plano de 5 pontos

O plano registrado nesta nota (seção "Próximo passo", abaixo) dizia "só depois de tudo isso [os 5 pontos]... rodar `popular_banco` de ponta a ponta". O usuário questionou isso — palavras dele: *"no momento eu só preciso do banco populado, justamente para ter dados válidos para ver o que está errado no restante do sistema"*, considerando também que o ponto 05 sozinho demora mais de 1h pra rodar. Investigado com evidência real antes de decidir: das 5 etapas de ML em `popular_banco.py` (todas comentadas desde 15/08), só 2 dependem exclusivamente de `detalhes_mlbs.json` (pronto desde o ponto 03) — `ANUNCIOS ML` e `DIMENSÕES DECLARADAS ML`. As outras 3 (`QUALIDADE`, `COMPETICAO`, `PROMOÇÕES ML`) dependem de `dados_completos_por_sku.json` (ponto 05, ainda não migrado) ou do assunto pausado de promoções.

**Achado que limitou o escopo pra 2, não 4:** `QUALIDADE`/`COMPETICAO` referenciam `CAMINHO_QUALIDADE`, uma constante **nunca declarada em lugar nenhum do código** (achado original desde 13/08, confirmado de novo agora). Religar essas 2 linhas sem o ponto 05 pronto não ia só falhar essas etapas — ia quebrar o comando `popular_banco` inteiro com `NameError`, antes mesmo de `PRODUTOS ERP` rodar (a lista `etapas` é 1 literal só, avaliada de uma vez, sem `try/except` por etapa). Por isso só `ANUNCIOS ML` e `DIMENSÕES DECLARADAS ML` foram religadas.

**Ponto de atenção sinalizado antes de aplicar:** a etapa seguinte, `DIMENSÃO DE ENVIO — ORGANIZAR E COMPARAR`, tinha um comentário do próprio código avisando que rodava "só com o lado Produto" enquanto Dimensões Declaradas ML estava desativada, com comportamento "a confirmar quando a etapa do ML voltar" — ou seja, religar essas 2 etapas também muda o comportamento de uma etapa posterior (e das Grades de Precificação que vêm depois dela). Não bloqueou a decisão, só precisava ser observado com atenção na execução real.

### Correção aplicada em `popular_banco.py`

`caminho_detalhes_mlbs()` (a função criada no ponto 03) importada de `importar_dimensoes_declaradas_ml.py` e chamada 1x no início de `_executar()`, reaproveitada nas 2 etapas religadas (`ANUNCIOS ML` e `DIMENSÕES DECLARADAS ML` leem o mesmo arquivo). Import de `importar_anuncios_ml`/`importar_dimensoes_declaradas_ml` descomentado; import de `importar_qualidade_anuncio`/`importar_competicao_catalogo` continua comentado, agora com aviso explícito no código sobre o risco de `NameError`.

### Resultado real, validado nas 2 empresas

**Magazine**: `python manage.py popular_banco --empresa MAGAZINE` → concluído em 54,7s, sem nenhum erro/exceção nas 15 etapas. Números que confirmam a cadeia 02→03→04 consistente de ponta a ponta: **5640 anúncios criados** (bate exato com os 5640 MLBs do ponto 03), **5906 variações criadas** (bate exato com os 5906 registros), 73 Tipos de Anúncio novos. `DIMENSÕES DECLARADAS ML`: 5325 variações atualizadas, **0 sem anúncio correspondente, 0 sem variação correspondente** — zero órfãos, a costura entre as 2 etapas religadas funcionou. `DIMENSÃO DE ENVIO — ORGANIZAR E COMPARAR` rodou sem quebrar e trocou de fato o comportamento avisado: agora compara os 2 lados de verdade (2676 divergências ERP×ML, 2533 sem produto vinculado no ERP, 197 não refletidas no ML — dado real, não mais modo degradado "só Produto").

**Samvale**: `python manage.py popular_banco --empresa SAMVALE` também concluído sem erros. Palavras do usuário: *"O banco foi populado na Samvale sem erros, dentro do que eu realizei de testes básicos na Samvale e Magazine essa etapa está concluída corretamente."*

### Achados de qualidade de dado expostos agora — não são bugs da migração, são pendências separadas

Com dado real de ML fluindo pro banco pela primeira vez, apareceram sinais que valem investigação própria, fora do escopo deste plano de 5 pontos: **2376 anúncios sem produto correspondente no ERP** (`ANUNCIOS ML`); **2533 sem produto vinculado no ERP** e **2676 divergências de dimensão** entre ERP e ML (`DIMENSÃO DE ENVIO`); **4 erros de assert de margem** em `GRADE MAGALU`/`GRADE RAIA`, mesmo SKU (`CONJUNTO REP. MOTOR 1.0 CV 127V`) nos 2, aparentando bug de fórmula de frete pré-existente sem relação com dado do ML (a etapa de Grade não lê `detalhes_mlbs.json`). Registrado aqui como observação — não bloqueia nem faz parte do plano ML.

## Ponto 05 concluído e validado (26/08/2026, 16:35): `buscar_dados_sku_completo.py` migrado, plano de 5 pontos fechado

Último ponto do plano de 5. Mesma sessão de foco, sem pausa real entre os pontos 04 e 05. Plano completo: 01 tokens (✓) → 02 buscar_mlbs.py (✓) → 03 buscar_detalhes.py (✓) → 04 classificar_por_sku.py/unificação (✓) → **05 buscar_dados_sku_completo.py (✓, esta seção)**.

### O que esse script faz

Pra cada SKU, encontra todos os MLBs relacionados (Base, Catálogo(s), Simples — mesma hierarquia dos pontos anteriores) e busca 2 blocos de dado por MLB direto na API: `/user-product/{MLBU}/performance` (score de qualidade, chamado pra todo MLB que tiver `mlbu`) e `/items/{MLB}/price_to_win` (competição de catálogo, chamado só pros MLBs classificados como "catálogo" — Base e Simples não têm esse dado, a API nem aceita a chamada pra eles). Gera `dados_completos_por_sku.json`, isolado por empresa — o 3º e último dos `.json` que faltavam migrar.

### Achado que mudou o formato deste ponto de novo: só 1 função precisava ser migrada, não o arquivo inteiro

O usuário colou o conteúdo real de `classificar_por_sku.py` (a mesma peça usada no ponto 04, aqui usada por outro motivo: `buscar_dados_sku_completo.py` importa `encontrar_fecho_transitivo()`, `carregar_registros()`, `classificar_tipo()` e `DET_PATH` de lá). Comparado contra o repositório real: só `encontrar_fecho_transitivo()` era de fato necessária — `classificar_tipo()` já tinha virado `classificar_catalogo()` no ponto 04 (mesma regra, reaproveitada direto), `carregar_registros()`/`DET_PATH` eram só leitura de arquivo, resolvidas localmente no serviço novo (mesmo padrão que `buscar_detalhes.py` já usa), e `montar_estrutura()`/`imprimir_arvore()` (visualização em árvore, ferramenta de debug do script original) não são consumidas por nenhum ponto do plano.

`encontrar_fecho_transitivo()` foi migrada, sem alteração de lógica, pra `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py` — mesmo local canônico do ponto 04, ao lado de `classificar_catalogo()`. Reaproveita o `parsear_item_relations()` que já existia nesse arquivo (conferido: lógica idêntica à versão de `classificar_por_sku.py`, evitou duplicar de novo).

### Por que não foi reaproveitado o agrupamento do banco (mesmo já populado com os pontos 02-04)

Pergunta central deste ponto, levantada antes de qualquer diff: já que o banco tem `ANUNCIOS ML`/`DIMENSÕES DECLARADAS ML` populados (ponto 04), dava pra achar "quais MLBs pertencem a esse SKU" direto no banco (`montar_estrutura_de_sku()`/`carregar_variacoes_por_sku()`, que já existem), em vez de migrar o fecho transitivo do JSON bruto?

Achado real que decidiu isso, encontrado no próprio código antes de perguntar ao usuário: `mercado_livre/models/variacao.py`, campo `sku_ml`, tem um comentário explícito avisando de um **bug já documentado, sem relação com esta migração**: *"O JSON atual (detalhes_mlbs) tem um bug conhecido na extração — todas as variações aparecem com o mesmo SKU do pai."* E o `produto` (FK pro ERP) em `importar_anuncios_ml.py` é casado exatamente por esse mesmo campo (`produtos_por_sku.get(sku_ml)`), sem seguir `item_relations` pra achar MLB de Catálogo com SKU divergente ou ausente — exatamente o cenário que `encontrar_fecho_transitivo()` foi desenhada pra cobrir. Reaproveitar o agrupamento do banco corria risco real de deixar MLB de fora silenciosamente. Decisão: migrar só essa função do JSON bruto, não reaproveitar o banco pra este propósito específico.

### 2 modos de execução — e uma correção sobre o script original

Igual ao script colado, o comando novo (`manage.py buscar_dados_sku_completo`) tem 2 modos: **produção** (`--empresa magazine|samvale`, sem `--skus`) roda todos os SKUs distintos da base, com checkpoint/retomada em `dados_completos_progresso.json` (só apaga se terminar sem erro nenhum, mesmo critério melhorado do ponto 03) — usuário avisou que sozinho pode levar mais de 1h30 na base inteira; **teste pontual** (`--skus SKU1,SKU2,...`) roda só os SKUs informados, sem checkpoint.

Achado trazido pelo usuário, vindo de outra conversa de IA com acesso ao projeto antigo: o script original tinha um risco real no modo de teste — os 2 modos escrevem no mesmo arquivo final, e o teste **sobrescrevia esse arquivo inteiro, silenciosamente**, mesmo com um resultado de produção completo já salvo ali. Corrigido na migração (não existia no script original): o modo de teste agora faz **merge** com o que já existe no arquivo — lê o `dados_completos_por_sku.json` atual, atualiza só os SKUs testados, grava de volta preservando o resto. Produção nunca é apagada por um teste pontual.

### Estrutura, espelhando os pontos 02/03

```
integracao_mercado_livre/
  servicos/buscar_dados_sku_completo.py               → NOVO — lógica real
  management/commands/buscar_dados_sku_completo.py    → NOVO — comando fino (--empresa, --skus)
  Arquivos_API/Magazine/dados_completos_por_sku.json  → saída, isolada por empresa
  Arquivos_API/Samvale/dados_completos_por_sku.json
  Arquivos_API/<Empresa>/dados_completos_progresso.json  → arquivo de retomada (só no modo produção)
  logs/<Empresa>/buscar_dados_sku_completo.log
```

Depende de `detalhes_mlbs.json` já existir pra aquela empresa (saída do ponto 03) — mesmo `RuntimeError` claro se não existir, mesmo padrão de `buscar_detalhes.py`.

### Console: mesma solução dos pontos 02/03, agrupado por SKU

Mesmo padrão de sempre (blocos `rich.Progress` fechados um de cada vez, `TimeElapsedColumn`, ranking dos mais lentos no resumo final) — aqui agrupado por SKU (dimensão natural, como `status` foi no ponto 02), blocos fixos de 20 SKUs por vez. Cache em memória por execução (por `mlbu` pra performance, por `mlb` pra price_to_win) — nunca repete a mesma chamada pro mesmo par, mesmo que o MLB apareça no fecho de mais de 1 SKU.

### `mlbu` (achado antigo, registrado desde 13/08) — confirmado que NÃO bloqueava nada

A pendência registrada há semanas (seção "Achado novo: o campo de MLBU existiu no banco e foi removido", mais abaixo nesta nota) levantava a dúvida: seria preciso decidir se `mlbu` volta como campo no banco antes de migrar este ponto? Resposta, confirmada lendo o código real de `buscar_detalhes.py` (ponto 03) antes de decidir: **não bloqueava** — `user_product_id` (o mlbu) já é extraído e salvo em `detalhes_mlbs.json` desde a migração do ponto 03 (`extrair_campos_pai()`, campo `"user_product_id": body.get("user_product_id")`). `buscar_dados_sku_completo.py` lê esse campo direto do JSON, sem depender do banco. A decisão de reintroduzir `mlbu` como campo no model Django segue em aberto, mas é só conveniência futura — não trava mais nada deste plano.

### `CAMINHO_QUALIDADE`, resolvido de vez

A constante nunca declarada, achado original desde 13/08/2026, foi finalmente resolvida: `caminho_dados_completos_por_sku()`, nova em `core/management/commands/popular_banco_suporte/importar_qualidade_anuncio.py`, resolve o caminho pela empresa ativa (mesmo padrão de `caminho_detalhes_mlbs()`, ponto 03). `popular_banco.py` religou `QUALIDADE`/`COMPETICAO` na lista `etapas` usando essa função — 4 das 5 etapas de ML do pipeline original agora rodam (só `PROMOÇÕES ML` segue comentada, assunto pausado à parte).

### Testado de verdade — dado real, e confirmado na tela do site

Diferente do ponto 04 (onde `manage.py check` dava falsa confiança), aqui o teste desde o início foi execução real, ponta a ponta:

**Magazine**, SKU `F7908050719121.001` (teste pontual, `--skus`): **19 MLBs** encontrados pelo fecho transitivo — 7 base, 6 simples, 6 catálogo. `performance` chamado com sucesso (http 200) nos 19. `price_to_win` chamado só nos 6 "catalogo" (os outros 13 ficaram `chamado: False`, como esperado). Conferido na mão: os 6 pares Base↔Catálogo batem exatamente pelo `mlbu` compartilhado (ex: `MLB1683028746` base e `MLB5593532940` catálogo, os 2 com `MLBU1092265387`) — confirma que o fecho transitivo achou os pares certos, não só contou MLB solto. 1 base (`MLB4479436313`) ficou sem par de catálogo nesse SKU — normal, não é erro.

Depois de religar `QUALIDADE`/`COMPETICAO` em `popular_banco.py` e rodar `popular_banco --empresa MAGAZINE` de novo: usuário confirmou visualmente, na tela real do site (`mercado_livre/`), que o gauge/score de qualidade e o status de competição passaram a aparecer pra esse SKU. Essa foi a validação funcional pedida explicitamente pelo usuário — *"preciso validar que está tudo funcional, e não somente que o dado veio"*.

**Samvale**: testado com 1 SKU também (comando análogo), confirmado funcionando pelo usuário — sem números detalhados compartilhados nesta sessão.

### Esclarecimento sobre origem do dado (pergunta do usuário, registrada aqui pra não se perder)

Dúvida levantada: o que está em `dados_completos_por_sku.json` é o dado 100% bruto da API, ou tem filtro? Resposta, com base no código real:

- `performance`/`price_to_win` (o dado novo deste ponto) — **100% bruto**, sem filtro. `pacote["dados"] = r.json()` guarda o retorno inteiro do endpoint, sem escolher campo.
- Os campos "de identificação" ao redor de cada MLB (`title`, `status`, `catalog_product_id`, etc.) — **não** vêm de uma chamada nova aqui, vêm copiados de `detalhes_mlbs.json` (ponto 03), que por sua vez já é um recorte de ~40 campos escolhidos do endpoint `/items` (não o retorno bruto completo — fica de fora, por exemplo, dado de vendedor, atributos completos, localização). `buscar_dados_sku_completo.py` recorta esse conjunto de novo, guardando só 12 desses ~40 campos por MLB — mesma lista de campos do script original, não foi alterado nesta migração.

### Estado real do commit — RESOLVIDO em 27/08/2026, 07:31

Confirmado por `git fetch origin dev` na sessão de 26/08/2026, 16:35: o repositório remoto seguia parado no commit `6707cbf` (ponto 04), com o diff do ponto 05 aplicado e testado só localmente. **Resolvido**: confirmado por `git fetch`/`git pull origin dev` em 27/08/2026, 07:31 — o commit `602d288` ("Migra buscar_dados_sku_completo.py: fecho transitivo unificado, religa QUALIDADE/COMPETICAO no popular_banco") já está em `origin/dev`, com o diff exato (5 arquivos: `popular_banco.py`, `importar_qualidade_anuncio.py`, os 2 arquivos novos de `buscar_dados_sku_completo.py`, `classificacao_catalogo.py`). Nada foi perdido na troca de computador.

### Base inteira rodada na Magazine (27/08/2026, 07:31) — pipeline dos 5 pontos 100% fechado lá

Depois do commit confirmado, o usuário rodou `python manage.py buscar_dados_sku_completo --empresa magazine` (sem `--skus`, modo produção) na base inteira: **1676 SKUs no arquivo final, 1676/1676 processados nesta execução (sem precisar de retomada), 0 erros, 3280,5s (~54,7min)** — 5 SKUs mais lentos todos abaixo de 14s, sem gargalo real. Em seguida rodou `python manage.py popular_banco --empresa MAGAZINE` de novo — concluído com sucesso, `QUALIDADE`/`COMPETICAO` agora gravam no banco pra esses 1676 SKUs reais, não só o SKU de teste (`F7908050719121.001`) usado pra validar o ponto 05.

**Magazine tem hoje o pipeline dos 5 pontos rodando ponta a ponta com dado de produção real** — busca na API (pontos 02/03/05) → classificação (ponto 04) → banco populado (`ANUNCIOS ML`, `DIMENSÕES DECLARADAS ML`, `QUALIDADE`, `COMPETICAO`) → tela do site refletindo o dado real.

**Samvale**: decisão explícita do usuário — deixar a base inteira pra rodar depois, sem urgência (*"Deixarei rodando depois pois demora muito tempo"*). Nenhum risco técnico nisso: o código já está testado (1 SKU validado, mesmo padrão da Magazine) e commitado — quando o usuário rodar, é só os mesmos 2 comandos (`buscar_dados_sku_completo --empresa samvale`, depois `popular_banco --empresa SAMVALE`).

## Problemas conhecidos, não resolvidos, nesses 2 scripts

> [!success] Atualização de 26/08/2026, 11:40 — os 4 problemas abaixo estão resolvidos pros 2 scripts (buscar_mlbs.py E buscar_detalhes.py)
> Título da seção mantido como estava ("não resolvidos") por fidelidade ao histórico — na prática, com o ponto 03 concluído, as 4 notas de rodapé abaixo já cobrem os 2 scripts, não só `buscar_mlbs.py`. Seguem sem solução só pros outros 2 arquivos do plano de 5 pontos (`buscar_dados_sku_completo.py`, ponto 05, e `chamadas_safe_api.py`, que nem é mais um arquivo à parte — ver seção "Os 4 arquivos do projeto antigo" — é a mesma lógica de `cliente_api.py`, já migrada).

> [!success] Atualização de 26/08/2026, 16:35 — os 4 problemas resolvidos agora nos 3 scripts migrados (buscar_mlbs.py, buscar_detalhes.py E buscar_dados_sku_completo.py)
> Com o ponto 05 concluído, os 4 problemas de rodapé abaixo cobrem os 3 scripts do plano — não sobra nenhum arquivo com esses problemas em aberto (`chamadas_safe_api.py` nunca foi arquivo à parte, é a mesma lógica de `cliente_api.py`, já migrada desde a base). Plano de 5 pontos 100% migrado.

- **Profundidade de `sys.path`** — hoje fazem `sys.path.insert(0, str(Path(__file__).resolve().parent.parent))` (só 2 níveis acima). Na nova localização dentro do repo (mais aninhada que a pasta antiga), esse caminho vai precisar de ajuste — quantos níveis exatamente ainda não foi decidido, depende de onde esses 2 arquivos forem colocados dentro do repo. *(Confirmado no código real de `buscar_detalhes.py` em 25/08/2026, 11:58 — exatamente como descrito aqui. Resolvido pra `buscar_mlbs.py` em 26/08/2026: `RAIZ_APP = Path(__file__).resolve().parent.parent` dentro de `integracao_mercado_livre/servicos/buscar_mlbs.py`. Resolvido também pra `buscar_detalhes.py` em 26/08/2026, 11:40, mesma solução — o `sys.path.insert` do script original simplesmente não existe mais na versão migrada, o Django já resolve os imports sozinho. Resolvido também pra `buscar_dados_sku_completo.py` em 26/08/2026, 16:35, mesma solução.)*
- **Nome do módulo de import ambíguo** — os scripts fazem `from core.estrutura_api.chamadas_safe_api import chamar_api`, mas o cliente HTTP já migrado ficou em `api_mercado_livre.core.estrutura_api.cliente_api` (nome de arquivo diferente: `chamadas_safe_api` vs `cliente_api`). *(Resolvido em 25/08/2026, 11:58 — ver seção "Os 4 arquivos do projeto antigo": são a mesma lógica, nome de arquivo diferente, não 2 implementações. Import de fato corrigido pra `buscar_mlbs.py` em 26/08/2026 — usa `api_mercado_livre.core.estrutura_api.cliente_api` diretamente. Resolvido também pra `buscar_detalhes.py` em 26/08/2026, 11:40, mesmo import. Resolvido também pra `buscar_dados_sku_completo.py` em 26/08/2026, 16:35, mesmo import (`api_mercado_livre.core.estrutura_api.cliente_api`).)*
- **`conta` faltando nas chamadas** — desde que `gerenciador_token.py` passou a exigir `conta` explícito (sem padrão), toda chamada a `chamar_api(...)` dentro desses 2 scripts também precisa passar esse argumento — hoje não passa, vai quebrar direto. *(Confirmado no código real de `buscar_detalhes.py`, e nos 3 outros arquivos por descrição — ver tabela acima. Resolvido pra `buscar_mlbs.py` em 26/08/2026 — `chamar_api(..., conta=conta)` recebe a conta certa via `PREFIXO_ENV_POR_EMPRESA`. Resolvido também pra `buscar_detalhes.py` em 26/08/2026, 11:40, mesma correção. Resolvido também pra `buscar_dados_sku_completo.py` em 26/08/2026, 16:35, mesma correção (`conta=conta` nas 2 chamadas, performance e price_to_win).)*
- **Descompasso de pasta de saída, confirmado lendo o código real:** `buscar_detalhes.py` salva em `APP_performance/dados_brutos/detalhes_mlbs.json`, mas `core/management/commands/popular_banco.py` espera o arquivo em `Arquivos_API/detalhes_mlbs.json` (constante `CAMINHO_DETALHES_MLBS`). Enquanto esses 2 scripts não forem migrados/ajustados, o pipeline de popular banco não tem como ler o resultado deles direto. *(Ver seção "Caminhos reais confirmados" acima — o mesmo problema também existe em `buscar_dados_sku_completo.py`, ponto 05, ainda não migrado. Pra `buscar_mlbs.py`, resolvido em 26/08/2026 com uma convenção nova de pasta isolada por empresa (`integracao_mercado_livre/Arquivos_API/<Empresa>/`), em vez do caminho de raiz esperado antes. `buscar_detalhes.py` resolvido do mesmo jeito em 26/08/2026, 11:40 — e desta vez o lado consumidor também foi corrigido: `CAMINHO_DETALHES_MLBS` virou a função `caminho_detalhes_mlbs()` em `importar_dimensoes_declaradas_ml.py`, já resolvendo pra convenção nova por empresa — ver seção "Ponto 03 concluído..." acima. `dados_completos_por_sku.json` (ponto 05) resolvido também em 26/08/2026, 16:35 — mesma convenção nova por empresa (`integracao_mercado_livre/Arquivos_API/<Empresa>/dados_completos_por_sku.json`), e o lado consumidor também corrigido: `CAMINHO_QUALIDADE` (que nunca existiu) virou a função `caminho_dados_completos_por_sku()` em `importar_qualidade_anuncio.py`. Não sobra nenhuma pendência de caminho no plano de 5 pontos.)*

## Achados sobre o pipeline de popular banco (investigação só de leitura, via sync)

Perguntado "quais arquivos preciso pra popular o banco?" — respondido lendo `core/management/commands/iniciar_banco.py` e `popular_banco.py` direto (sem modificar nada):

- **`manage.py iniciar_banco`** — roda 8 funções `popular_*` de `iniciar_banco_suporte/`, todas autocontidas (sem depender de nenhum arquivo externo).
- **`manage.py popular_banco`** — roda ~19 passos (`importar_*`/`calcular_*` de `popular_banco_suporte/` + `precificacao/funcoes_auxiliares/*/calcular_grade_precificacao_*`), e esses SIM dependem de 2 arquivos externos: `Arquivos_API/detalhes_mlbs.json` (constante `CAMINHO_DETALHES_MLBS`) e `Arquivos_API/dados_completos_por_sku.json` (referenciado no comentário como `CAMINHO_QUALIDADE`, mas nunca declarado — ver seção "Caminhos reais confirmados").
- ~~**Em aberto:** não foi encontrado, até agora, nenhum script (migrado ou não) que produza `dados_completos_por_sku.json`~~ — **resolvido em 25/08/2026, 11:58:** é `buscar_dados_sku_completo.py`, ver seção "Os 4 arquivos do projeto antigo".
- **Achado novo (25/08/2026, 11:58):** as 5 chamadas de importação de ML dentro de `popular_banco.py` (`importar_anuncios_ml`, `importar_dimensoes_declaradas_ml`, `importar_qualidade_anuncio`, `importar_competicao_catalogo`, `importar_promocoes_ml`) estão **comentadas desde 15/08/2026** — não é "arquivo faltando", é desligamento proposital, documentado no próprio código, enquanto a integração da API não fica pronta "de forma organizada".

## Próximo passo, quando retomar

> [!info] Plano atualizado em 25/08/2026, 11:58 — substitui o plano de 4 passos anterior
> Os passos 1 e 3 do plano antigo (esclarecer se `chamadas_safe_api` e `cliente_api` são a mesma coisa; localizar o script que gera `dados_completos_por_sku.json`) **já foram resolvidos** nesta sessão — ver seções acima. O plano abaixo reflete o que falta de verdade agora.

> [!info] Atualização de 26/08/2026, 11:11 — passo 1 e parte do passo 3, avançados pra `buscar_mlbs.py`
> Do passo 1: o conteúdo real de `buscar_mlbs.py` foi colado, comparado e migrado nesta sessão (ver seção "Ponto 02 concluído..." acima); `buscar_detalhes.py` já tinha sido colado e comparado linha por linha em 25/08 (mas ainda não migrado/testado). Restam `chamadas_safe_api.py`, `buscar_dados_sku_completo.py` e `classificar_por_sku.py`, ainda só descritos, não colados de verdade nesta sessão. Do passo 3 (diff de cada um dos 5 arquivos): `buscar_mlbs.py` está completo — não só diff no papel, migrado e validado com chamada real nas 2 empresas (MB e SV). Faltam 4 dos 5.

> [!info] Atualização de 26/08/2026, 11:40 — passo 1 e 3 avançam de novo, agora pra `buscar_detalhes.py`
> Do passo 1: o conteúdo real de `buscar_detalhes.py` foi colado de novo, desta vez direto nesta sessão de foco (não só em 25/08). Restam só `chamadas_safe_api.py` (que já sabemos ser a mesma lógica de `cliente_api.py`, ver seção "Os 4 arquivos do projeto antigo" — não deve exigir diff próprio) e, de verdade ainda pendentes, `buscar_dados_sku_completo.py` e `classificar_por_sku.py`. Do passo 3: `buscar_detalhes.py` está completo — migrado, com o caminho do lado consumidor (`importar_dimensoes_declaradas_ml.py`) também corrigido, e confirmado funcionando pelo usuário ("Funcionou"). 2 dos 5 arquivos do plano prontos (`buscar_mlbs.py` + `buscar_detalhes.py`). Próximo: ponto 04, `classificar_por_sku.py` — lógica pura de classificação, sem chamada de API, deve ser o ponto mais simples dos 3 que restam.

> [!success] Atualização de 27/08/2026, 07:31 — plano de 5 pontos FECHADO. Só falta a base inteira da Samvale, sem urgência
> Os 5 pontos estão migrados, testados, commitados/sincronizados com o GitHub (`602d288`), e rodando com dado de produção real na Magazine (1676 SKUs, banco populado, tela do site refletindo o dado real — ver seção "Base inteira rodada na Magazine" acima). Não sobra nenhuma ação de migração, código ou commit pendente.
>
> **Único item em aberto**: rodar a base inteira na Samvale (`buscar_dados_sku_completo --empresa samvale`, sem `--skus`, depois `popular_banco --empresa SAMVALE`) — decisão explícita do usuário foi deixar pra depois, por causa do tempo de execução (~1h na Magazine). Sem risco técnico: mesmo código já commitado e validado com 1 SKU na Samvale também.
>
> Único assunto relacionado que segue fora deste plano de 5 pontos, pausado à parte: `promocoes_completo.json`/`PROMOÇÕES ML`.

1. ~~Colar, nesta sessão, o conteúdo real de `chamadas_safe_api.py`, `buscar_mlbs.py`, `buscar_dados_sku_completo.py` e `classificar_por_sku.py`...~~ — **concluído em 26/08/2026, 16:35**: os 4 arquivos foram colados e comparados nesta sessão (`chamadas_safe_api.py` confirmado ser a mesma lógica de `cliente_api.py`, sem diff próprio necessário).
2. ~~Decidir sobre a persistência de `mlbu`...~~ — **resolvido por evidência real em 26/08/2026, 16:35**: não bloqueava nada. `user_product_id` (mlbu) já é extraído e salvo em `detalhes_mlbs.json` desde o ponto 03, e `buscar_dados_sku_completo.py` lê ele direto do JSON, sem precisar de campo nenhum no banco. A decisão de reintroduzir `mlbu` como campo no model Django (conveniência futura, não pendência do pipeline) continua em aberto.
3. ~~Escrever o diff de migração de cada um dos 5 arquivos...~~ — **concluído em 26/08/2026, 16:35, commitado (`602d288`) e sincronizado com o GitHub em 27/08/2026, 07:31.**
4. ~~Só depois de tudo isso, descomentar as 5 linhas dentro da lista `etapas`...~~ — **completado em 26/08/2026, 16:35**: 4 das 5 linhas (`ANUNCIOS ML`, `DIMENSÕES DECLARADAS ML`, `QUALIDADE`, `COMPETICAO`) religadas — só `PROMOÇÕES ML` segue comentada (assunto pausado à parte). Rodado com dado real e `popular_banco` executado de novo na Magazine em 27/08/2026, 07:31 (1676 SKUs). Falta só repetir esses 2 comandos pra Samvale, quando o usuário quiser — sem urgência.

## Nota à parte, não relacionada à migração

Nesta mesma sessão, o usuário perguntou (pergunta geral, informativa, sem ação de código) como gerar um dump completo do banco de dados SQL pra transferir de uma máquina pra outra (`mysqldump`/`manage.py dumpdata`) — relevante agora que uma troca de PC está acontecendo de verdade, vale lembrar de usar isso pra não perder o banco local.

## Relacionado

- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
