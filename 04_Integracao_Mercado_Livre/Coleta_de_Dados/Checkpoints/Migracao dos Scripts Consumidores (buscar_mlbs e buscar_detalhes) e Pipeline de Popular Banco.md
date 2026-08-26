---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 13/08/2026
atualizado_em: 26/08/2026 11:11
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

## Problemas conhecidos, não resolvidos, nesses 2 scripts

- **Profundidade de `sys.path`** — hoje fazem `sys.path.insert(0, str(Path(__file__).resolve().parent.parent))` (só 2 níveis acima). Na nova localização dentro do repo (mais aninhada que a pasta antiga), esse caminho vai precisar de ajuste — quantos níveis exatamente ainda não foi decidido, depende de onde esses 2 arquivos forem colocados dentro do repo. *(Confirmado no código real de `buscar_detalhes.py` em 25/08/2026, 11:58 — exatamente como descrito aqui. Resolvido pra `buscar_mlbs.py` em 26/08/2026: `RAIZ_APP = Path(__file__).resolve().parent.parent` dentro de `integracao_mercado_livre/servicos/buscar_mlbs.py`. Segue em aberto pra `buscar_detalhes.py`, ainda não migrado.)*
- **Nome do módulo de import ambíguo** — os scripts fazem `from core.estrutura_api.chamadas_safe_api import chamar_api`, mas o cliente HTTP já migrado ficou em `api_mercado_livre.core.estrutura_api.cliente_api` (nome de arquivo diferente: `chamadas_safe_api` vs `cliente_api`). *(Resolvido em 25/08/2026, 11:58 — ver seção "Os 4 arquivos do projeto antigo": são a mesma lógica, nome de arquivo diferente, não 2 implementações. Import de fato corrigido pra `buscar_mlbs.py` em 26/08/2026 — usa `api_mercado_livre.core.estrutura_api.cliente_api` diretamente. Segue em aberto pra `buscar_detalhes.py`.)*
- **`conta` faltando nas chamadas** — desde que `gerenciador_token.py` passou a exigir `conta` explícito (sem padrão), toda chamada a `chamar_api(...)` dentro desses 2 scripts também precisa passar esse argumento — hoje não passa, vai quebrar direto. *(Confirmado no código real de `buscar_detalhes.py`, e nos 3 outros arquivos por descrição — ver tabela acima. Resolvido pra `buscar_mlbs.py` em 26/08/2026 — `chamar_api(..., conta=conta)` recebe a conta certa via `PREFIXO_ENV_POR_EMPRESA`. Segue em aberto pra `buscar_detalhes.py`.)*
- **Descompasso de pasta de saída, confirmado lendo o código real:** `buscar_detalhes.py` salva em `APP_performance/dados_brutos/detalhes_mlbs.json`, mas `core/management/commands/popular_banco.py` espera o arquivo em `Arquivos_API/detalhes_mlbs.json` (constante `CAMINHO_DETALHES_MLBS`). Enquanto esses 2 scripts não forem migrados/ajustados, o pipeline de popular banco não tem como ler o resultado deles direto. *(Ver seção "Caminhos reais confirmados" acima — o mesmo problema também existe em `buscar_dados_sku_completo.py`. Pra `buscar_mlbs.py`, resolvido de forma diferente do esperado em 26/08/2026: em vez de apontar pra `Arquivos_API/lista_mlbs.json` na raiz, entrou uma convenção nova de pasta isolada por empresa — ver pendência "caminho de saída aninhado por empresa" na seção "Ponto 02 concluído..." acima. Segue sem solução pra `buscar_detalhes.py`/`dados_completos_por_sku.json`, que ainda esperam caminho de raiz.)*

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

1. Colar, nesta sessão, o conteúdo real de `chamadas_safe_api.py`, `buscar_mlbs.py`, `buscar_dados_sku_completo.py` e `classificar_por_sku.py` — até agora só temos a descrição deles (verificada, mas não é o código real).
2. Decidir sobre a persistência de `mlbu` (ver seção "Achado novo: o campo de MLBU existiu no banco e foi removido") antes de escrever o diff de `buscar_dados_sku_completo.py`.
3. Escrever o diff de migração de cada um dos 5 arquivos (os 4 acima + `buscar_detalhes.py`, já em mãos), aplicando em cada: troca do import pro `cliente_api.py` novo, parâmetro `conta` adicionado em toda chamada a `chamar_api`/`obter_token_valido`, e caminho de saída corrigido pra dentro de `Arquivos_API/`.
4. Só depois de tudo isso, descomentar as 5 linhas dentro da lista `etapas` em `core/management/commands/popular_banco.py` e rodar `popular_banco` de ponta a ponta usando dado vindo da API migrada.

## Nota à parte, não relacionada à migração

Nesta mesma sessão, o usuário perguntou (pergunta geral, informativa, sem ação de código) como gerar um dump completo do banco de dados SQL pra transferir de uma máquina pra outra (`mysqldump`/`manage.py dumpdata`) — relevante agora que uma troca de PC está acontecendo de verdade, vale lembrar de usar isso pra não perder o banco local.

## Relacionado

- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
