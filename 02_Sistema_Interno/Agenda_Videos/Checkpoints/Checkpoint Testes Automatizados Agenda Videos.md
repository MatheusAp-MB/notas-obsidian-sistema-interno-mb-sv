---
tipo: checkpoint
dominio: testes
status: em_andamento
criado: 02/08/2026
atualizado_em: 03/08/2026 17:10
relacionado: [Disciplina de Testes Automatizados, Modelo Padrao de Arquivo de Teste, Fluxo Manual Antes do Automatizado, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Modelo de Status e Entrada na Agenda, Pausa Para Replanejar UX de Filtros e Telas, Regua de Fases Precisa Ser Semeada em Todo Ambiente Novo, Estrutura de Telas da Agenda de Videos, Mapa de Execucao das 5 Telas da Agenda de Videos, Cache de Indicadores Nao e Populado Automaticamente, Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]
---

# Checkpoint — Testes Automatizados Agenda_Videos

Nota viva — atualizada em cada sessão relevante, nunca substituída por nota nova. Serve pra retomar o trabalho mesmo se o contexto da conversa for perdido (compactação já causou esquecimento real, ex: acesso ao GitHub).

## Última atualização

03/08/2026 (5 telas concluídas e aprovadas, 17:10) — As 7 fases do [[Mapa de Execucao das 5 Telas da Agenda de Videos]] foram todas concluídas e aplicadas pelo usuário: vocabulário/condições (`Tela`, `condicao_tela`, os 6 motivos de A Fazer Hoje), listagem unificada (`listar_produtos_agenda_filtrados(tela=...)`, `listar_a_fazer_hoje()` aposentada), contexto (`tela` + `contadores_chips`), views/orquestrador (replicação automática migrada; postagem automática reescrita à parte, preservando Simples+atrasado), templates (navegação por link + chip-contador sempre visível), testes (`test_nivel_3__listar_produtos_agenda_filtrados.py` novo, ~27 cenários). Suíte inteira validada (só a suíte antiga quebrou a coleta, esperado — resto passou). Achado real: cache `IndicadoresAgendaProduto` não populava sozinho pra produto nunca tocado, resolvido rodando `popular_banco` (ver [[Cache de Indicadores Nao e Populado Automaticamente]]). Validação manual dupla: usuário + Vinicius (time) aprovaram fluxo e design — pergunta de precisar tela "ver tudo cruzando fases" fechada, não é necessária. Nota de contexto auto-contido criada pra retomada em outro computador: [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]. Próximo passo: só refinamento (nenhum item específico levantado ainda).

03/08/2026 (mapa de execução fechado, 12:40) — [[Mapa de Execucao das 5 Telas da Agenda de Videos]] define as 7 fases de implementação, em ordem de dependência (vocabulário compartilhado → listagem/contagem → contexto → view/URL → template → testes → validação manual), mais 3 decisões de arquitetura (1 view com parâmetro `tela`; chip "Base" soma produto-nunca-tocado + produto-em-Base; `listar_produtos_com_historico()` é independente, roda em paralelo). Commit da 2ª rodada de testes já feito e sincronizado (`a5d3c9d`). Próximo passo real: começar a Fase 1 (`filtros_agenda_videos.py`).

03/08/2026 (UX mapeado, 12:20) — Mapeamento de telas concluído: [[Estrutura de Telas da Agenda de Videos]] define as 5 telas (Não Agendado, Simples, Mensal, Trimestral, A Fazer Hoje) com critério exato de cada uma + padrão de chip-contador clicável pra filtro de etapa/urgência. Próximo passo combinado: usuário faz commit do estado atual → desenhamos o fluxo de execução (ordem de implementação) → só então volta a codar. Testes de `listar_produtos_com_historico()` continuam pausados até lá.

03/08/2026 (pausa, 11:30) — Rodada de `listar_produtos_com_historico()` PAUSADA (ver [[Pausa Para Replanejar UX de Filtros e Telas]]) — motivo: testando manualmente pela 1ª vez com dado real (depois da régua de fases populada), o usuário encontrou que os filtros das telas não refletem o modelo novo. Antes da pausa, 3 mudanças de produção reais foram feitas e aplicadas (ver seção "Mudanças de produção — 03/08" abaixo): fix de `agendado_em` (nunca era escrito), nova ação de Pausar/Retomar agenda (`HistoricoStatusManualAgenda` nunca era criado), e o seed novo da régua de fases (ver [[Regua de Fases Precisa Ser Semeada em Todo Ambiente Novo]]). Modelo de status/entrada na agenda esclarecido em [[Modelo de Status e Entrada na Agenda]]. Próximo passo: aguardar o mapeamento de UX (telas + filtros) antes de retomar testes.

03/08/2026 (fechamento) — `historico_roadmap.py` fechado: 151 passed, 0 failed. `montar_linha_do_tempo_produto()` e `montar_historico_produto()` 100% cobertas (as únicas linhas fora de cobertura, 181-210, são `listar_produtos_com_historico()`, fora do escopo desta rodada de propósito). Encontrado bug adicional no processo: o fix de desempate (`order_by('-criado_em', '-id')`) que eu havia descrito como "aplicado" na sessão anterior, na verdade nunca chegou a ser aplicado na consulta própria de `montar_historico_produto()` — só na de `montar_linha_do_tempo_produto()`. Só ficou evidente porque o teste de empate proposital (`test_historico_produto_ordenacao_timestamps_empatados_desempate_por_id`) falhou de verdade contra o código real, provando que a alegação de "fix já feito" precisa sempre ser conferida contra o arquivo real do usuário, nunca assumida a partir de resumo/memória de conversa. Corrigido via Localize/Substitua, confirmado passando.

03/08/2026 (início) — Nova rodada iniciada: decisão de validar 100% o fluxo MANUAL da Agenda de Vídeos antes do automatizado (ver [[Fluxo Manual Antes do Automatizado]]). `badges_agenda.py` e `roadmap_produto.py` fechados (100% cover). 3 bugs reais de produção encontrados e corrigidos nesta rodada (ver seção própria abaixo). Checkpoint reaberto (`status: em_andamento`) — o "concluído" de 02/08 valia só para `CicloVideo` + dashboard "A Fazer Hoje", que seguem intactos e completos.

02/08/2026 — Nível 4 fechado (100% cover, 0 Miss, 0 BrPart em `a_fazer_hoje.py`). Cobertura completa do roadmap Nível 0→4 pra `CicloVideo` + dashboard "A Fazer Hoje": 82 testes passando, 0 falhas.

## Onde está o código real

- Repositório: `https://github.com/MatheusAp-MB/Projeto_Sistema_Interno_V2` (clonável via git, só leitura — nunca executar pytest contra ele).
- App testado: `agenda_videos/`. Testes em `agenda_videos/tests/`. Infra compartilhada: `conftest.py` (raiz do projeto) + `testes_apoio/apoio_visual.py`.

## Estado por nível

### Nível 0 — `agenda_videos/funcoes_auxiliares/calculo_datas_fase.py`

- Status: **completo**. Arquivo: `test_nivel_0__calculo_datas_fase.py`.
- 3 funções: `ultimo_dia_util_ou_hoje`, `adicionar_dias_uteis`, `proximo_dia_util`.
- 11 testes, 100% de cobertura de branch.

### Nível 2 — `agenda_videos/models/ciclo_video.py` (`CicloVideo`, em memória)

- `esta_atrasado()`: **completo**. Arquivo: `test_nivel_2__esta_atrasado.py`. 5 casos.
  - Ganhou parâmetro opcional `data_referencia` (antes usava `timezone.localdate()` cru) — consistente com o padrão já usado em `calcular_indicadores_ciclo`/`listar_a_fazer_hoje` (`agenda_videos/funcoes_auxiliares/a_fazer_hoje.py`).
  - `a_fazer_hoje.py` corrigido: `calcular_indicadores_ciclo` agora propaga `data_referencia` pra `ciclo.esta_atrasado(data_referencia)` — antes havia inconsistência real (risco calculado com data de teste, atraso com data real do sistema).
- `etapa_atual()`: **completo**. Arquivo: `test_nivel_2__etapa_atual.py`. 8 casos (cobre os 8 caminhos de retorno, incluindo "recusado volta pra completo").
- `__str__()`: **completo**. Arquivo: `test_nivel_2__str.py`. 1 caso (sem branch — texto sempre no mesmo formato). Produto passado em memória, sem `.save()` — não precisa de banco porque `self.produto.sku` não dispara query quando o objeto já foi atribuído direto.

### Nível 3 — banco de dados (`@pytest.mark.django_db`)

- `criar_proximo()`: **completo**. Arquivo: `test_nivel_3__criar_proximo.py`. Régua completa de transição de fase (Simples→Mensal#1 sem espera, Mensal#1-4 a cada 30 dias, Mensal#4→Trimestral#1 esperando 90 dias, Trimestral N→N+1 a cada 90 dias) + 1 caso de ajuste de dia útil — assert com data exata hardcoded (30/10), não mais checagem genérica de "é dia útil".
- `marcar_aguardando_aprovacao()` e `marcar_replicado()`: **completo**. Arquivo: `test_nivel_3__marcar_aguardando_aprovacao_e_replicado.py`. 3 casos — inclui a regra "Simples nunca dispara o próximo ciclo sozinho".
- `iniciar_agenda()` e `agendar_apos_simples()`: **completo**. Arquivo: `test_nivel_3__iniciar_agenda_e_agendar_apos_simples.py`. 4 casos (1 `iniciar_agenda`, 1 sucesso de `agendar_apos_simples`, 2 erros de uso fora de hora). `agendar_apos_simples()` ganhou `data_referencia` opcional, mesmo padrão de `esta_atrasado()`.
- Arquivo antigo `test_camada3_criar_proximo_dia_util.py` foi apagado (substituído).
- **Nível 3 fechado.** Total de testes: 12 (5 `criar_proximo` + 3 `marcar_*` + 4 `iniciar_agenda`/`agendar_apos_simples`).
- **Cobertura final de `ciclo_video.py`: 100%, 0 Miss, 24 branch, 0 BrPart.** Confirmado via `.txt` de 02/08 — bate com a régua de "pronto" da Disciplina de Testes.
- Suíte inteira (Nível 0+2+3): **37 passed**, 0 failed, 0 xfailed.

### Nível 4 — view/ingestão (`agenda_videos/funcoes_auxiliares/a_fazer_hoje.py` e dependências)

Maior e mais complexo do que o esperado — o dashboard lê de uma tabela CACHE (`IndicadoresAgendaProduto`), não direto do `CicloVideo`. Dividido em 3 camadas:

- **Camada A — `calcular_indicadores_ciclo()`: completo.** Arquivo: `test_nivel_2__calcular_indicadores_ciclo.py` (na prática ficou Nível 2 — não toca banco). 7 testes: 6 cenários do indicador `risco` (condição AND de 3 partes, cada motivo de falha testado isolado) + 1 provando que `data_referencia` é realmente propagado pro DOC `esta_atrasado()`. 100% de `calcular_indicadores_ciclo` coberto (linhas 28-42 de `a_fazer_hoje.py`).
- **Camada B — `sincronizar_roadmap_agenda.py` (motor que enche o cache `IndicadoresAgendaProduto`): completo.** 3 arquivos:
  - `test_nivel_3__status_manual_atual.py` (DOC de `ParticipacaoAgenda`, achado novo — 2 testes: sem histórico=Ativo, com histórico=o mais recente).
  - `test_nivel_3__calcular_indicadores.py` (6 testes: sem ciclo→`'nao_agendado'`, passthrough com ciclo, sem/com participação, vídeo reprovado False de graça / True com a cadeia real de 6 modelos do `mercado_livre` — `AnuncioMercadoLivre`→`VariacaoAnuncioMercadoLivre`→`QualidadeAnuncio`→`QualidadeAnuncioCriterio`+`CriterioQualidade`, DOC real sem dublê).
  - `test_nivel_3__sincronizar_indicadores_agenda_produto.py` (2 testes: cria registro novo, atualiza existente sem duplicar).
  - **100% de `sincronizar_roadmap_agenda.py` coberto (0 Miss, 0 BrPart).**
- **Camada C — `listar_a_fazer_hoje()` (o dashboard em si): completo.** Arquivo: `test_nivel_3__listar_a_fazer_hoje.py`, 26 testes cobrindo esqueleto de inclusão/exclusão (8), busca por termo (4), filtros simples marcas/status_manual/urgente/sem_video (4), atrasado/risco sim-não-ambíguo (6), pendente_agora com os 2 casos especiais (3), faixas numéricas/data (2), ordenação de 3 níveis (1).
- **100% de `a_fazer_hoje.py` coberto (0 Miss, 0 BrPart) — Nível 4 fechado por completo.**
- **3 bugs reais de produção encontrados e corrigidos nessa camada** (não eram erro de teste):
  1. `listar_a_fazer_hoje()` nunca anotava `numero_ocorrencia_ciclo_atual`, mas usava esse campo via `CAMPOS_FAIXA`/`aplicar_filtro_faixa` — filtrar por faixa de ocorrência quebrava com `FieldError` no dashboard real. Corrigido adicionando a annotation que faltava.
  2. `condicao_pendencia_agora('completo')` usava `~Q(status_ciclo_atual=RECUSADO)` — como o caso mais comum de "Completo" tem `status_ciclo_atual=None`, e `NOT (NULL = valor)` em SQL dá NULL (não True), o filtro "Completo" nunca mostrava nada no dashboard real. Corrigido tratando NULL explicitamente como "não recusado".
  3. `HistoricoStatusManualAgenda.Meta.ordering = ['-alterado_em']` sem desempate — 2 registros criados muito próximos empatam no timestamp (comum no Windows), e `status_manual_atual()` podia devolver o status errado. Corrigido acrescentando `'-id'` como desempate. Ver [[Disciplina de Testes Automatizados]], seção "Ordenação por timestamp sempre precisa de desempate".
- Achado de infra (02/08): Rich Table não aceita bool/int/None cru — corrigido em `conftest.py` (`RegistradorDeResultados.adicionar()` agora converte com `str(...)`). Ver [[Disciplina de Testes Automatizados]].
- Suíte inteira (Nível 0+2+3+4, agenda_videos): **82 passed**, 0 failed.

## Segunda rodada — badges_agenda.py, roadmap_produto.py, historico_roadmap.py (a partir de 03/08/2026)

Sequenciamento definido em [[Fluxo Manual Antes do Automatizado]]. Trabalho feito em sandbox (clone local do repo, branch `dev`) e entregue ao usuário em blocos completos/Localize-Substitua — nunca executado por Claude (ver [[Disciplina de Testes Automatizados]], seção "Acesso ao repositório real", e [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]).

### `agenda_videos/funcoes_auxiliares/badges_agenda.py` — completo

Arquivo: `test_nivel_0__badges_agenda.py`. 20 cenários (`buscar_badge_de` com todas as chaves de `BADGES_STATUS_MANUAL`/`BADGES_STATUS_POSTAGEM`/`BADGES_ETAPA` + fallback de valor desconhecido/`None`; `montar_opcoes_com_badge` com cada dict real + dict vazio). **100% cover, 0 Miss, 0 BrPart.** Confirmado: 102 passed.

### `agenda_videos/funcoes_auxiliares/roadmap_produto.py` — completo (Nível 0+2+3)

- Nível 0: `montar_rotulo_rodada` (5 casos) e `_traduzir_status_em_estado_visual` (6 casos). Arquivo `test_nivel_0__roadmap_produto.py`.
- Nível 2: `_localizar_indice_atual` (5 casos) e `_montar_etapas_rodada_atual` (8 casos). Arquivo `test_nivel_2__roadmap_produto.py`.
- Nível 3: `calcular_roadmap_produto`. Arquivo `test_nivel_3__roadmap_produto.py`, com fixture `regua_de_fases` compartilhada com `test_nivel_3__criar_proximo.py`.
- **100% cover, 0 Miss, 0 BrPart. Confirmado: 136 passed** (inclui os 2 testes retroativos de desempate, ver bugs abaixo).

### `agenda_videos/funcoes_auxiliares/historico_roadmap.py` — completo (as 2 funções no escopo desta rodada)

- `montar_linha_do_tempo_produto` (9 cenários) e `montar_historico_produto` (6 cenários). Arquivo `test_nivel_3__historico_roadmap.py`, 15 testes.
- `listar_produtos_com_historico()` (7 filtros) fica fora desta rodada — rodada própria, ver [[Fluxo Manual Antes do Automatizado]]. É por isso que a cobertura do arquivo aparece como 70% (97 stmts, 22 Miss, linhas 181-210) — as 2 funções testadas estão 100% cobertas; a lacuna é só a função ainda não tocada, de propósito.
- **Confirmado: 151 passed, 0 failed.**

### Bugs reais de produção encontrados e corrigidos nesta rodada

1. `calcular_roadmap_produto()`: `order_by('criado_em')` sem desempate — corrigido pra `order_by('criado_em', 'id')`. Teste retroativo criado provando o empate de timestamp (comum no Windows) sob a condição exata antes evitada.
2. `montar_historico_produto()`: mesmo padrão em `order_by('-criado_em')` — corrigido pra `order_by('-criado_em', '-id')`. Precisou de 2 tentativas: a 1ª descrição do fix (sessão anterior) nunca chegou a ser aplicada de verdade no arquivo do usuário — só ficou evidente porque o teste de empate falhou contra o código real (ver "Última atualização" acima).
3. `montar_linha_do_tempo_produto()`: risco de ordem não-determinística entre eventos de ciclos diferentes com timestamp idêntico — corrigido tornando a iteração de `ciclos_video` determinística (`order_by('criado_em', 'id')`), apoiado no sort estável do Python.

Ver [[Disciplina de Testes Automatizados]], seções "Ordenação por timestamp sempre precisa de desempate" e "Teste nunca contorna bug real" (esta última criada a partir do achado nº 1 acima).

### Pergunta em aberto

`view_verificar_produto_drive`/`view_verificar_todos_drive` (views que tocam Drive) — testar agora com mock, junto do fluxo manual, ou deixar pra fase automatizada? Ainda sem resposta do usuário.

## Terceira rodada — Redesenho das 5 Telas (a partir de 03/08/2026)

Motivado por 2 bugs reais achados testando manualmente ([[Estrutura de Telas da Agenda de Videos]]): "Não Agendado" ambíguo (sumia assim que Base era clicado) e "A Fazer Hoje" abrangente demais (sem noção real de urgência). Mapeado em [[Mapa de Execucao das 5 Telas da Agenda de Videos]], executado em 7 fases, todas concluídas:

1. **Vocabulário/condições** (`filtros_agenda_videos.py`) — `Tela` (TextChoices), `condicao_tela()`, `condicao_pendencia_agora()` reescrita, os 6 motivos de A Fazer Hoje (`condicao_motivo_a_fazer_hoje`, com proteção contra cache `postou_hoje` desatualizado), `contar_por_condicoes()` (1 query pros chips).
2. **Listagem unificada** — `listar_produtos_agenda_filtrados(tela=...)` substitui a dupla antiga; `listar_a_fazer_hoje()` aposentada (`a_fazer_hoje.py` reduzido a `calcular_indicadores_ciclo`); `construir_queryset_tela()` isola a base compartilhada entre listagem e contagem.
3. **Contexto** (`contexto_tela_agenda_videos.py`) — `ParametrosBuscaAgendaVideos` com campo único `tela`; `contadores_chips`.
4. **Views/URLs** — `views.py` (replicação automática migrada pra nova função); `urls.py` sem mudança; `orquestrador.py` (postagem automática) reescrito à parte — preserva a regra real do bot (posta 'postar' com vencimento hoje-ou-atrasado, qualquer fase, Simples incluso), não reaproveita o escopo Mensal/Trimestral da tela A Fazer Hoje (que é só UI).
5. **Templates** — navegação por link entre as 5 telas + chip-contador sempre visível (saiu de dentro de "Mais filtros"); JS de exclusão mútua removido (`script_agenda_videos.js` esvaziado).
6. **Testes** — `test_nivel_3__listar_produtos_agenda_filtrados.py` (novo, ~27 cenários) substitui `test_nivel_3__listar_a_fazer_hoje.py`: escopo das 5 telas, os 6 motivos, assimetria de `status_manual` (A Fazer Hoje exclui Pausado/Descontinuado sempre; as outras 4 mostram por padrão), ordenação (fixa x escolhida), smoke test dos filtros que não mudaram de lógica.
7. **Validação manual** — aprovado pelo usuário e pelo Vinicius (time); fluxo e design confirmados.

### Achado real (não é bug de código)

`IndicadoresAgendaProduto` (cache usado por TODAS as 5 telas) só é populado por ação manual ou pelo comando `popular_banco`. Produto nunca sincronizado ficava invisível nas 5 telas ao mesmo tempo — não é bug do redesenho: o sistema antigo tolerava a ausência desse cache, o novo tornou ele obrigatório. Ver [[Cache de Indicadores Nao e Populado Automaticamente]].

### Status

Suíte inteira validada via pytest (só a suíte antiga de `listar_a_fazer_hoje` quebrou a coleta, como esperado — todo o resto passou). Validação manual dupla (usuário + Vinicius) aprovada. Sem itens de refinamento específicos levantados ainda.

### Mudanças de produção — 03/08 (sem teste automatizado ainda, feitas durante validação manual)

1. **`agendado_em` nunca era escrito** — só lido. Corrigido dentro de `view_agendar_produto` (já existente, botão Simples→Mensal do roadmap): agora seta `ParticipacaoAgenda.agendado_em = timezone.now()` de forma idempotente. Rótulo do evento na linha do tempo corrigido de "Entrou na Agenda de Vídeos" pra "Agendado — Vídeo Mensal Iniciado" (ver [[Modelo de Status e Entrada na Agenda]]).
2. **`HistoricoStatusManualAgenda` nunca era criado** — Pausado/Descontinuado existiam só como opção de filtro, nenhuma ação gerava o registro. Nova view `view_alternar_pausado_agenda` (+ rota `agenda_videos_alternar_pausado`) cria o registro pra alternar Ativo⇄Pausado, exposta no modal de histórico do produto (badge + botão). Descontinuado continua sem ação, de propósito (ver [[Modelo de Status e Entrada na Agenda]]).
3. **`ConfiguracaoFase` nunca populada no banco real** — não era bug de código (é dado de admin, decisão de 30/07), mas travava a tela principal com `DoesNotExist`. Seed novo criado e encadeado em `python manage.py iniciar_banco` (ver [[Regua de Fases Precisa Ser Semeada em Todo Ambiente Novo]]).
4. `HistoricoProduto` (dataclass, `historico_roadmap.py`) ganhou campo `status_manual_atual: Badge` — `montar_historico_produto()` agora sempre calcula e devolve isso. Teste retroativo do rótulo do evento (`test_linha_do_tempo_com_participacao_e_agendado_em`) corrigido e confirmado passando.
5. Nenhuma das mudanças 1-2 acima tem teste pytest ainda — são Nível 4 (views), reservado pro round de `views.py` já mapeado. Validação visual no navegador (CSS/HTML do badge e botão novo) também pendente.

## Infra de teste (estado atual dos arquivos compartilhados)

- `conftest.py` (raiz): classe `RegistradorDeResultados` (tabela Rich com `show_lines=True` + lista de linhas pro log), fixture `_resetar_log_de_testes` (autouse, `scope='session'`, zera `resultados_testes.txt`), fixture `tabela_resultados` (`scope='module'`), hook `pytest_collection_modifyitems` (ordem garantida por `nodeid`), hook `pytest_terminal_summary` (resumo de sessão + tracebacks de falha real, filtrando `report.when == 'call'`).
- `testes_apoio/apoio_visual.py`: só a função `registrar_resultado(...)`, delega pra `registrador.adicionar(...)`.
- `pyproject.toml`: `pytest-cov` adicionado, `[tool.coverage.run] branch = true`.
- Comando padrão de validação: `pytest -s --cov=<módulo> --cov-report=term-missing --cov-report=html --cov-report=json`.

## Próximo passo imediato

1. **Refinar as 5 telas** — usuário confirmou que agora é só ajuste fino, mas nenhum item específico foi levantado ainda. Perguntar o que precisa de polimento antes de assumir qualquer coisa.
2. `listar_produtos_com_historico()` (7 filtros: fase, status, data_de, data_ate, urgente, marcas, status_manual, + busca multi-termo) — pausado desde 03/08, é trabalho paralelo/independente, pode retomar a qualquer momento.
3. `view_verificar_produto_drive`/`view_verificar_todos_drive` — pergunta ainda aberta (testar agora com mock ou na fase automatizada).
4. Só depois de tudo isso: iniciar o fluxo automatizado (postagem_automatica, replicacao_automatica, Drive real).

Ver mapa completo em [[Fluxo Manual Antes do Automatizado]] e [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]] (nota auto-contida, pra quando o contexto de conversa não estiver disponível).

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Modelo Padrao de Arquivo de Teste]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Cache de Indicadores Nao e Populado Automaticamente]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
