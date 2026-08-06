---
tipo: checkpoint
dominio: testes
status: em_andamento
criado: 02/08/2026
atualizado_em: 06/08/2026 01:00
relacionado: [Disciplina de Testes Automatizados, Modelo Padrao de Arquivo de Teste, Fluxo Manual Antes do Automatizado, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Modelo de Status e Entrada na Agenda, Pausa Para Replanejar UX de Filtros e Telas, Regua de Fases Precisa Ser Semeada em Todo Ambiente Novo, Estrutura de Telas da Agenda de Videos, Mapa de Execucao das 5 Telas da Agenda de Videos, Cache de Indicadores Nao e Populado Automaticamente, Contexto Geral - Retomada em Outro Computador (Agenda de Videos), Validacao de Configuracoes Nao Abre Excecao Para Simples, Status Manual Atual Ignora Historico Quando Participacao Nao Existe, Percentual de Replicacao por Produto e Geral, Convencao de Nomenclatura de Arquivos no Drive, Badge de Aviso Para Arquivos Inconsistentes no Drive, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), LOGIN_REQUIRED no .env Causa Falso Positivo de 71 Falhas em Testes de View, obter_fase Levantava AttributeError Cru Para Chave Invalida, Botao de Verificar Drive Individual Tinha 3 Bugs Reais]
---

# Checkpoint — Testes Automatizados Agenda_Videos

Nota viva — atualizada em cada sessão relevante, nunca substituída por nota nova. Serve pra retomar o trabalho mesmo se o contexto da conversa for perdido (compactação já causou esquecimento real, ex: acesso ao GitHub).

## Mapa de Execução — Rodada 6 (trabalho remoto, sem ML e sem Drive via navegador)

**Objetivo geral do projeto:** o fluxo completo da Agenda de Vídeos rodando ponta a ponta — cadastro → produção (Base/Roteiro/Completo) → postagem no ML → aprovação → replicação nos demais MLBs → reinício do ciclo — com as duas automações (Postagem e Replicação) operando sem intervenção manual.

**Onde estamos:** as 6 telas e o fluxo manual completo estão testados (260+ testes, 3 bugs reais corrigidos). As APIs que o agente local consome (`api/postagem_automatica`, `api/replicacao_automatica`) existem em produção mas nunca foram testadas.

**Restrição desta rodada:** usuário em casa, sem acesso ao ML e sem Drive via navegador — mas com acesso à API do Drive. Postagem física no ML (`agente_local/postagem_ml.py`, pywinauto/keyboard) só é validável na máquina do escritório — fora de alcance por definição, não é pendência.

**Frentes abertas:**
1. Testes de `api/replicacao_automatica` — puro banco, zero Drive.
2. Testes das funções puras do orquestrador (`listar_produtos_elegiveis`, `obter_mlb_do_produto`) — puro ORM.
3. Testes de `api/postagem_automatica` — as 4 rotas sem Drive primeiro.
4. Testes com Drive real (API, sem mock) — `resolver_arquivo_da_ocorrencia`, `view_baixar_video`, `view_marcar_concluido` da postagem.
5. Feature nova: percentual de replicação por produto e geral — ver [[Percentual de Replicacao por Produto e Geral]] — inclui gap de schema (novo campo em `ItemExecucaoReplicacao`, precisa de migration).
6. Fora de alcance nesta rodada: validação física end-to-end com o ML, só no escritório.

**Ordem de execução:** 1 → 2 → 3 → 4 → 5, do menor problema pro maior — cada item só avança depois do anterior confirmado passando.

**Pausa/pivô (05/08, tarde):** usuário pediu pra não testar nada que dependa do ML por agora, e priorizar validar o Drive de ponta a ponta primeiro — a ordem acima (itens 1-5) fica pausada, ver detalhe da validação de Drive na entrada de atualização mais recente abaixo.

**Pausa levantada (06/08/2026, 01:00):** validação do Drive concluída por completo (reescrita + Nível 5 + 3 bugs do botão individual, tudo commitado — `d0a4be2`). A ordem 1→5 acima volta a valer — próximo item real é o 1 (`api/replicacao_automatica`, puro banco).

## Última atualização

06/08/2026 (RODADA 6 ENCERRADA — commit confirmado no GitHub, análise retroativa completa, 01:00) — Clone fresco do GitHub (`dev`) confirmou: commit `d0a4be2` ("agenda_videos: corrige verificacao individual do Drive (3 bugs reais)") está lá, e o diff de cada arquivo bate exatamente com o planejado na conversa (`_avancar_etapas_com_estrutura` com o bootstrap do 1º ciclo, `verificar_produto_no_drive` gravando o snapshot nos 2 desfechos, botão fora do `{% if ciclo_atual %}`, os 5 testes novos/atualizados, `resultados_testes.txt` confirmando 42 passed/100% cover). **Isso encerra por completo a rodada 6 (validação do Drive).** Nota "Contexto Geral — Retomada em Outro Computador" reescrita com o estado atual + nova seção "Notas que deve ler a seguir", pra retomada em outro PC sem depender desta conversa. Vault também commitado (2 commits — o de hoje + um retroativo de ~7 notas de sessões anteriores nunca commitadas). Próximo passo real, sem mais pendência de Drive: iniciar testes de `api/postagem_automatica`/`api/replicacao_automatica` (ver "Mapa de Execução — Rodada 6" no topo desta nota pra ordem já definida).

06/08/2026 (teste de regressão dos 3 bugs do botão de Drive individual — concluído, 42 passed, 100% cover, 00:35) — Os 4 cenários confirmados com o usuário foram escritos: 2 substituem o teste antigo `test_nivel_3__avancar_etapas_produto_sem_ciclo_nao_faz_nada` (que encodava o comportamento ANTIGO/errado — esperava `diagnostico is None`) por 2 testes novos (sem Base no Drive → não cria nada, com diagnóstico; com Base pronta → cria o 1º ciclo e avança); 2 novos cobrem o snapshot gravado nos 2 desfechos de `verificar_produto_no_drive`; 1 novo em `test_nivel_4__view_agenda_videos.py` confirma o botão aparece mesmo sem `ciclo_atual` (via tela Todos). Achado no processo: `..._avanca_ponta_a_ponta` (teste já existente) precisou de mock extra pra `listar_arquivos_usados` — sem isso bateria no Drive real, já que o fix do Bug 3 passou a chamar esse método. Confirmado: **42 passed, 100% cover, 0 Miss, 0 BrPart** em `parser.py` (69 stmts/12 branch) e `verificador.py` (88 stmts/22 branch). Detalhe em [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]]. Falta só commitar.

06/08/2026 (validação manual do botão de Drive individual — 3 bugs reais em cadeia, todos corrigidos e confirmados no navegador, 00:21) — Usuário testando no navegador reparou que não existia botão pra verificar o Drive de 1 produto isolado (só "Verificar Todos"). Investigar isso, seguindo Idealizar→Planejar→Executar→Analisar (ver [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]), expôs 3 bugs reais em cadeia, cada um só visível depois do anterior corrigido: (1) o botão já existia no template desde `f227e5b`, mas ficava escondido dentro do mesmo `{% if ciclo_atual %}` que libera o bloco de meta — produto sem nenhum `CicloVideo` ainda (Simples pré-criação) nunca via o botão, mesmo a view não depender de ciclo pra funcionar; (2) com o botão visível, clicar nele em produto sem ciclo não fazia nada — `_avancar_etapas_com_estrutura()` saía do loop na hora se `ciclo` viesse `None`, mesmo com o arquivo Base já pronto no Drive (só o clique manual de "Base" no roadmap criava o 1º ciclo); (3) depois do 2º fix confirmado, o badge "última verificação" (`snapshot_drive.atualizado_em`) só atualizava depois do "Verificar Todos", nunca do botão individual — `verificar_produto_no_drive()` nunca gravava `SnapshotArquivosDrive`, só a varredura completa gravava, contrariando o próprio comentário do model. Os 3 fixes confirmados em ambiente real (EAN QUIMIVIDA `0789888395162`): botão aparece sem ciclo, cria o ciclo e avança Base/Roteiro/Completo sozinho (parando em Postar, correto), badge atualiza pelos 2 caminhos. Detalhe completo dos 3 bugs em [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]]. Pendente: escrever teste de regressão pros 4 cenários (visibilidade sem ciclo; bootstrap com/sem Base pronto; snapshot gravado no caminho individual) — cenários já propostos ao usuário, aguardando confirmação antes de escrever o código.

05/08/2026 (testes novos de parser.py/verificador.py — Nível 0/2/3 fechados, bug real corrigido, 22:52) — Depois do susto de config resolvido (entrada anterior), seguimos o plano de testes dos 3 arquivos reescritos de Drive. `test_nivel_0__parser.py` (15 testes, 100% cover/0 Miss/0 BrPart) achou 1 bug real: `ArquivosProdutoDrive.obter_fase()` usava `getattr` sem guard, levantando `AttributeError` cru pra chave inválida — corrigido pra `ValueError` com mensagem clara, reaproveitando `PREFIXO_ARQUIVO_POR_FASE` como fonte única (ver [[obter_fase Levantava AttributeError Cru Para Chave Invalida]]). `test_nivel_2__verificador.py` (8 testes, puro/em memória) cobre `_montar_nome_esperado` e `avaliar_etapa_no_drive`. `test_nivel_3__verificador.py` (8 testes, banco real) cobre `_avancar_etapas_com_estrutura` e as versões SIMULADAS (mock só na borda de rede, via `monkeypatch`) de `verificar_produto_no_drive`/`verificar_todos_no_drive` — nasceu aqui o padrão "Real + Simulado" pra qualquer integração externa de verdade, formalizado em [[Disciplina de Testes Automatizados]]. Falta só 1 arquivo: `test_nivel_4__verificador_drive_real.py` (as mesmas 2 funções, mas contra o Drive de verdade, EAN QUIMIVIDA) — em andamento, pausado pra decidir o commit. Plano de commit desenhado (2 commits: scripts_dev/ separado da reescrita+testes), ainda não executado pelo usuário.

05/08/2026 (susto de 71 falhas em outro PC — causa era config de máquina, não código, 22:12) — Logo depois de aplicar os 3 arquivos reescritos de Drive (`constantes.py`/`parser.py`/`verificador.py`) num outro computador, a suíte inteira devolveu **192 passed, 71 failed** — todas as falhas em Nível 4 (views HTTP), nenhuma tocando Drive. Hipótese do usuário ("dado sujo no banco") e hipótese inicial de regressão do Drive foram descartadas por evidência (nenhum teste que falhou exercita código de Drive; cobertura de `verificador.py`/`parser.py` baixa demais pra terem causado isso). Causa raiz real: `.env` desse PC estava com `LOGIN_REQUIRED=True` — a `AutenticacaoMiddleware` (`core/middleware.py`) passou a exigir login em toda rota comum, e nenhum teste da suíte faz `client.force_login(...)`, então toda requisição de Nível 4 caía num redirect 302 pro `/login/` antes de tocar a view (inclusive os testes de "produto inexistente → 404"). Corrigido trocando pra `LOGIN_REQUIRED=False` nesse PC. Confirmado: **264 passed, 0 failed** — os 3 arquivos de Drive não têm nenhuma regressão. Detalhe completo, incluindo o passo a passo do diagnóstico, em [[LOGIN_REQUIRED no .env Causa Falso Positivo de 71 Falhas em Testes de View]].

05/08/2026 (validação de Drive de ponta a ponta — 3 achados reais + pasta de referência corrigida) — Usuário pediu pra pausar os testes de API (dependem indiretamente do modelo de dados do ML) e priorizar validar o Drive primeiro, usando o EAN `0789888395162` (QUIMIVIDA) como objeto de teste. Processo seguiu o ciclo Idealizar→Planejar→Executar→Analisar→Corrigir (ver [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]], criado nesta sessão depois de um incidente de ritmo). 3 achados reais: (1) `constantes.py`/`parser.py` nunca foram atualizados pro modelo novo de fases — ainda reconhecem só `diaria/semanal/mensal`, 1 arquivo `Simples`/`Base` único por produto, sem trio Base/Roteiro/Completo por ocorrência; precisam de reescrita completa, ainda não feita. (2) `escaneador.py` (`montar_arvore_por_ean`) compara o nome da subpasta "Videos" de forma case-sensitive — 4 das 5 pastas de EAN dentro de QUIMIVIDA tinham "videos" minúsculo e foram descartadas silenciosamente da varredura original (é provavelmente a causa do gap "989 itens vs. 23 EANs reconhecidos"); bug real, ainda não corrigido. (3) A pasta do EAN de referência tinha 2 arquivos com nome errado (`Simples_Roteiros.txt` plural; par `Trimestral_01_Completo`/`Trimestral_01_Roteiro` com nomes literalmente invertidos em relação ao `mimeType` real, confirmado via checagem de conteúdo) — corrigidos via rename pela API (`files().update`), confirmado depois com script de coerência: **18/18 arquivos OK**. Convenção de nomenclatura formalizada em [[Convencao de Nomenclatura de Arquivos no Drive]]. Ideia nova registrada (ainda não planejada): badge de aviso quando nome do arquivo não bater com o `mimeType` real — ver [[Badge de Aviso Para Arquivos Inconsistentes no Drive]]. Próximo passo real: planejar a reescrita de `constantes.py`/`parser.py` pro modelo novo, usando esse EAN como caso de referência.

05/08/2026 (Rodada 6 planejada — testes de automação remota + feature de % de replicação, 19:40) — Usuário em casa, sem ML e sem Drive via navegador, com Drive via API. Mapeado que `api/postagem_automatica` e `api/replicacao_automatica` (as APIs que o agente local consome) nunca tiveram nenhum teste, e a maior parte é puro banco (zero dependência externa) — só 2 rotas de postagem tocam Drive de verdade. Ordem de execução definida no mapa acima. Nova feature desenhada: percentual de MLBs replicados com sucesso vs. falha, por produto e geral, com assert de soma 100% pra pegar incoerência — ver [[Percentual de Replicacao por Produto e Geral]]. Achado gap de schema: falta um campo pra guardar a quantidade de MLBs do produto capturada na listagem (hoje só existe `mlbs_replicados`/`mlbs_nao_encontrados` por ciclo, sobrescritos a cada replicação). Próximo passo real: começar pelo item 1 (`api/replicacao_automatica`).

05/08/2026 (Bloco D fechado + garantia de integração config→roadmap + decisão sobre Drive, 09:30) — `view_configuracoes_agenda_videos` testada via HTTP real: 10 cenários (GET com/sem config salva, validação por fase — incluindo trava de regressão explícita do bug do Simples —, `periodo_continuo`, update_or_create sem duplicar, 1 fase inválida não travar as outras, nenhuma fase válida não salva nada). Nenhum bug novo. Confirmado: **258 passed, 0 failed**. Isso fecha as 10 views do fluxo manual (Blocos A-D). Em seguida, 2 testes de integração novos (`test_nivel_4__integracao_config_afeta_roadmap.py`) provaram ponta a ponta que mudar uma `ConfiguracaoFase` pela tela real reflete IMEDIATAMENTE no próximo `CicloVideo` criado por `criar_proximo()` — tanto pra distância quanto pra transição de fase — confirmando por execução (não só leitura de código) que `ConfiguracaoFase` não é cache de nada. Confirmado: **260 passed, 0 failed**. **A rodada de testes de views/Nível 4 está encerrada.** Decisão do usuário sobre a pergunta em aberto (views de Drive): a próxima rodada real vai testar a sincronia com o Drive usando o **Drive real, sempre que possível** (não mock) — plano ainda sendo desenhado, ver "Próximo passo imediato" abaixo.

04/08/2026 (Bloco C fechado — testes de views, achado + corrigido erro próprio, pausa do usuário, 11:40) — As 2 views de flag do produto (`view_alternar_urgente`, `view_alternar_pausado_agenda`) estão testadas via HTTP real. No meio do caminho, 5 dos 6 testes novos de `view_alternar_pausado_agenda` falharam com `NameError: name 'status_manual_atual_do_produto' is not defined` em `views.py:433` — **erro do próprio Claude, não do banco nem da view**: ao entregar o fix do bug de status manual (10:12), a instrução de adicionar essa função ao bloco de import de `views.py` foi descrita em prosa ("adicione X à lista de import"), nunca como diff exato — e nunca chegou a ser aplicada de verdade. Ficou escondida a sessão inteira porque `view_alternar_pausado_agenda` é o único lugar de `views.py` que usa essa função, e nenhum teste tinha exercitado essa view até agora. Corrigido com diff exato (Localize/Substitua) pro import. Confirmado: **248 passed, 0 failed**. Detalhe do achado em nova seção de [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]. **Usuário decidiu pausar o trabalho aqui** — Bloco D (Configurações) fica como próximo passo pra quando retomar. Ver [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]] pra retomada sem contexto de conversa.

04/08/2026 (Bloco B fechado — testes de views, 11:24) — As 3 views que escrevem no roadmap do ciclo (`view_marcar_ponto_roadmap`, `view_agendar_produto`, `view_executar_acao_ciclica` com as 6 sub-ações) estão testadas via HTTP real. Nenhum bug novo encontrado nesta leva — só confirmou o comportamento já esperado, incluindo guards de estado (2 abas abertas, ações fora de ordem) e a régua de fases sendo exigida pelo card renderizado no final de toda escrita. Confirmado: **238 passed, 0 failed**. Próximo: Bloco C (`view_alternar_urgente`, `view_alternar_pausado_agenda`).

04/08/2026 (Bloco A fechado — testes de views, 11:10) — As 4 views de leitura (`view_historico_produto`, `view_confirmar_ponto_roadmap`, `view_agenda_videos`, `view_historico_agenda_videos`) estão testadas via HTTP real (client do pytest-django). Achado extra no meio do caminho: renderizar qualquer produto na grade principal exige a régua de `ConfiguracaoFase` existir no banco de teste (mesma régua real, não é bug) — corrigido no próprio teste com a fixture `regua_de_fases`. Confirmado: **209 passed, 0 failed**. Próximo: Bloco B (`view_marcar_ponto_roadmap`, `view_agendar_produto`, `view_executar_acao_ciclica`).

04/08/2026 (rodada de views iniciada + bug real de status manual, 10:12) — Começamos a testar `views.py` (Nível 4 — 21 views, nenhuma tinha teste ainda). Bloco A (leitura, sem escrita): `view_historico_produto` fechado, achou e corrigiu bug real GRAVE — `status_manual_atual` ignorava o histórico de Pausado/Descontinuado sempre que `ParticipacaoAgenda` não existia, e isso deixava o próprio botão "Pausar" TRAVADO (nunca voltava pra Ativo) pra qualquer produto nessa situação. Corrigido extraindo `status_manual_atual_do_produto()` como fonte única. Confirmado: 190 passed, 0 failed. Detalhe completo em [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]].

04/08/2026 (3 bugs de validação manual fechados, 09:00) — Fix da validação de Configurações aplicado pelo usuário e confirmado: Simples agora salva normalmente com "Distância entre ocorrências" em branco. Usuário optou por não adicionar indicação visual no campo pra Simples. **Os 3 bugs achados na validação manual paralela (modal de Histórico, tela Configurações quebrada, validação de Simples) estão todos RESOLVIDOS e confirmados.** Ver [[Validacao de Configuracoes Nao Abre Excecao Para Simples]], seção "Resolução".

04/08/2026 (retomada pós-compactação + bugs de validação manual, 08:48) — Sessão retomada depois de perda de contexto por compactação de conversa. 3 itens novos desde o fechamento de 03/08 17:10: (1) 6ª tela **Todos** adicionada (sem filtro, 1ª aba) — usuário reabriu a questão "ver tudo" que tinha sido fechada como desnecessária; (2) `listar_produtos_com_historico()` retomado e concluído (185 passed, 100% cover); (3) 3 bugs reais achados testando manualmente em paralelo — modal de Histórico não fechava no ícone X (RESOLVIDO, confirmado pelo usuário), tela Configurações quebrada por template obsoleto (RESOLVIDO, confirmado), validação de Configurações rejeita a fase Simples (ABERTO, fix identificado, não aplicado). Detalhe completo na seção "Quarta rodada" abaixo.

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

### Pergunta em aberto — RESOLVIDA em 05/08/2026, 09:30

`view_verificar_produto_drive`/`view_verificar_todos_drive` (views que tocam Drive) — testar agora com mock, junto do fluxo manual, ou deixar pra fase automatizada? **Decisão do usuário: testar a sincronia do Drive usando o Drive real, sempre que possível (não mock).** Vira a próxima rodada de trabalho — plano de exploração/implementação ainda por fazer, ver "Próximo passo imediato" abaixo.

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

## Quarta rodada — tela Todos, histórico concluído, bugs de validação manual (a partir de 04/08/2026)

### Tela "Todos" adicionada (6ª tela)

Usuário reabriu a pergunta fechada em 03/08 ("ver tudo, cruzando fases" não seria necessário) — na prática, sentiu falta mesmo depois de aprovar o fluxo de 5 telas. Adicionada `Tela.TODOS` como 1ª opção de `OPCOES_TELA`: sem filtro nenhum (`_condicao_todos()` devolve `Q()` vazio), sem chip-contador (não faz sentido pra ela), ordenação livre (como as outras telas, exceto A Fazer Hoje) — e é a ÚNICA tela que mostra produto sem `IndicadoresAgendaProduto` sincronizado (as outras 5 dependem do cache via INNER JOIN). 1 teste retroativo precisou ser corrigido: `test_produto_sem_indicadores_nenhum_nao_aparece_em_nenhuma_tela` → renomeado `test_produto_sem_indicadores_nenhum_so_aparece_em_todos`, já que a suposição antiga ficou falsa por desenho. Suíte confirmada: **185 passed, 0 failed**.

Aproveitando, usuário perguntou se a ordenação de prioridade antiga (7 níveis, incluindo "risco" isolado) ainda existia — conferido em `prioridade_agenda_videos.py` (nunca editado nesta sessão): são 6 níveis reais, sem fator de risco isolado (urgente+reprovado, urgente, atrasado+reprovado, atrasado, reprovado, default). Usuário confirmou que os 6 reais atendem — dúvida fechada.

### `listar_produtos_com_historico()` — concluído

Rodada retomada (estava pausada desde 03/08, ver [[Pausa Para Replanejar UX de Filtros e Telas]]). Arquivo novo `test_nivel_3__listar_produtos_com_historico.py`, 11 blocos, ~24 cenários. 2 comportamentos sutis confirmados contra o código real:

1. Filtro de `fase` + `status` combinados precisam bater no MESMO `CicloVideo` (filtragem sequencial na mesma queryset de ciclos) — não basta o produto ter QUALQUER ciclo pra cada condição separadamente.
2. Filtro de `status_manual` depende do cache `IndicadoresAgendaProduto` existir (mesmo padrão de INNER JOIN das telas) — produto sem cache é excluído por esse filtro especificamente, mesmo aparecendo normalmente sem ele.

**Confirmado: 185 passed, 0 failed, 100% cover em `historico_roadmap.py` (106 stmts, 0 Miss, 42 branch, 0 BrPart)** — arquivo fechado por completo (as 3 funções: `montar_linha_do_tempo_produto`, `montar_historico_produto`, `listar_produtos_com_historico`).

### Bugs reais encontrados testando manualmente em paralelo (04/08)

1. **Modal de Histórico não fechava no ícone X — RESOLVIDO, confirmado pelo usuário.** Causa: `script_roadmap_produto.js` usa `evento.target.matches('[data-fechar-modal-roadmap]')`, que só checa o elemento exato clicado — o ícone `<i>` dentro do botão intercepta o clique e não carrega o atributo. `.closest()` foi cogitado e REJEITADO (o backdrop do modal tem o mesmo atributo, quebraria "clicar dentro da caixa não fecha"). Fix aplicado: CSS `pointer-events: none` em `.modal-historico-fechar i` (`layout_historico_agenda_videos.css`).
2. **Tela "Configurações" quebrada — RESOLVIDO, confirmado pelo usuário.** Causa: template (`estrutura_configuracoes_agenda_videos.html`) ainda era da era Diária/Semanal/Mensal (extinta em 30/07) — nomes de campo e valores de fase não batiam com a view, que já estava correta (tinha até comentário `[PENDENTE] → Formulário real (HTML) também pendente`). Template reescrito do zero com os 4 campos reais (`periodo_continuo`, `periodo`, `distancia_dias_corridos`, `distancia_dias_ao_entrar_na_fase`) pras 3 fases reais, reaproveitando as classes CSS existentes (`config-agenda-*`). Usuário optou por não adicionar configurações novas nem tornar `proxima_fase` editável aqui. Testado — Mensal e Trimestral salvaram certo.
3. **Validação da view de Configurações rejeita Simples — RESOLVIDO, confirmado pelo usuário.** Ao testar o fix do item 2, apareceu bug novo (pré-existente, só exposto agora que o template ficou correto): `view_configuracoes_agenda_videos` exigia `distancia_dias_corridos` preenchido em QUALQUER fase, mas o modelo documenta que Simples não usa esse campo (só 1 ocorrência, campo é `null=True` no banco). Fix: exceção de validação pra Simples (`distancia_obrigatoria = fase_valor != Fase.SIMPLES`). Usuário optou por não adicionar indicação visual no campo pra Simples. Detalhe completo em [[Validacao de Configuracoes Nao Abre Excecao Para Simples]].

## Quinta rodada — Testes de views/Nível 4 (a partir de 04/08/2026)

Motivo: `views.py` tem 21 funções `view_*` e nenhuma tinha teste ainda — sempre ficou mapeado como pendente. Escopo desta rodada: as 10 views do fluxo MANUAL (sem Drive, sem postagem/replicação automática — ambos adiados, ver [[Fluxo Manual Antes do Automatizado]] e a pergunta ainda aberta sobre Drive). Ferramenta nova: `client` do pytest-django (`client.get`/`client.post` + `reverse()`) — requisição HTTP real, simulada em memória (sem servidor/rede), primeira vez que este projeto testa a camada de view (antes só função). Motivo de usar isso em vez de chamar a view direto: confirma o roteamento real (`urls.py`), as travas de método (`@require_POST`) e o sistema de mensagens (`messages.warning`/`success`) — nenhum desses 3 é exercitado chamando a função Python isolada.

Divisão em 4 blocos:

- **Bloco A — leitura, sem escrita:** `view_agenda_videos`, `view_confirmar_ponto_roadmap`, `view_historico_produto`, `view_historico_agenda_videos`. **Completo.**
- **Bloco B — ações que escrevem no roadmap do ciclo:** `view_marcar_ponto_roadmap`, `view_agendar_produto`, `view_executar_acao_ciclica` (6 sub-ações). **Completo.**
- **Bloco C — flags do produto:** `view_alternar_urgente`, `view_alternar_pausado_agenda`. **Completo.**
- **Bloco D — Configurações:** `view_configuracoes_agenda_videos` (trava a correção do Simples contra regressão). **Completo.**

**Rodada encerrada — as 10 views do fluxo manual estão todas testadas.**

### Bloco A — concluído

- `view_historico_produto`: 4 cenários (sem ciclo, com ciclo em Base, produto pausado, produto inexistente → 404). Achou e corrigiu 1 bug real grave — ver [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]. Teste retroativo adicionado em `test_nivel_3__calcular_indicadores.py` fechando o gap que deixou o bug passar despercebido até agora.
- `view_confirmar_ponto_roadmap`: 9 cenários (sem ciclo + base/outra chave, cada etapa real batendo com a chave pedida, recusado→nova_tentativa, estado divergente/2 abas abertas, concluído sem ação, produto inexistente).
- `view_agenda_videos`: 5 cenários (tela padrão, tela Todos mostrando produto sem cache — regressão do bug de 03/08, tela inválida cai no padrão, contador de chip chegando no contexto, paginação). Achado no meio do caminho: renderizar qualquer produto na grade principal exige a régua de `ConfiguracaoFase` existir no banco de teste (mesma régua real de produção, não bug) — corrigido com a fixture `regua_de_fases` no próprio arquivo de teste.
- `view_historico_agenda_videos`: 5 cenários (sem filtro, busca via querystring, marcas_disponiveis exclui vazia/nula, paginação, por_pagina inválido cai no padrão 25).
- Confirmado: **209 passed, 0 failed** (suíte inteira, sem regressão).

### Bloco B — concluído

- `view_marcar_ponto_roadmap`: 7 cenários (cria o Simples no 1º clique, chave inválida sem ciclo, marcação normal, estado divergente, etapa fora de base/roteiro/completo, produto inexistente, sincronização do cache confirmada).
- `view_agendar_produto`: 6 cenários (sucesso, Simples não concluído, sem ciclo nenhum, ciclo concluído mas fora da fase Simples — prova que a trava checa fase E etapa, idempotência de `agendado_em`, produto inexistente).
- `view_executar_acao_ciclica`: 16 cenários — as 6 sub-ações (postar, aprovado, recusado, nova_tentativa, seguir, replicar), cada uma com sucesso + guard de estado próprio (aprovado/recusado compartilham a mesma função de guard, testada 1 vez só), mais os 2 guards compartilhados (produto sem ciclo, ação desconhecida) e o 404.
- Nenhum bug novo encontrado — só confirmação de comportamento já esperado.
- Confirmado: **238 passed, 0 failed** (suíte inteira, sem regressão).

### Bloco C — concluído

- `view_alternar_urgente`: 4 cenários (sem participação, o toggle cria e marca urgente; com participação urgente=True, o toggle vira False; 2 toggles seguidos voltam ao estado original; produto inexistente → 404).
- `view_alternar_pausado_agenda`: 6 cenários (sem participação, 1º toggle pausa; sem participação, 2º toggle volta pra Ativo — **teste de regressão explícito pro bug de status manual achado em 10:12**; com participação Ativo, toggle pausa; produto pausado, toggle volta pra Ativo; toggle sincroniza o cache de indicadores; produto inexistente → 404).
- **Achado no meio do caminho — erro do próprio Claude, não bug de produção pré-existente:** 5 dos 6 testes de `view_alternar_pausado_agenda` falharam com `NameError: name 'status_manual_atual_do_produto' is not defined` em `views.py:433`. Causa raiz: ao entregar o fix do bug de status manual (ver entrada de 10:12 acima), a instrução de adicionar essa função ao import de `views.py` foi passada em prosa, nunca em diff exato — nunca foi de fato aplicada. Ficou invisível a sessão inteira porque essa view era o único ponto de `views.py` que usa a função, e nenhum teste a exercitava ainda. Corrigido com diff exato (Localize/Substitua) no bloco de import de `agenda_videos/models` dentro de `views.py`, acrescentando `status_manual_atual_do_produto` à lista. Lição registrada em [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]] e detalhada em nova seção de [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]].
- Confirmado: **248 passed, 0 failed** (suíte inteira, sem regressão).

### Bloco D — concluído

- `view_configuracoes_agenda_videos`: 10 cenários — GET sem nenhuma config (padrão em branco) e com config já salva (reflete valores reais); POST salvando Simples com distância em branco (trava de regressão explícita do bug já corrigido em [[Validacao de Configuracoes Nao Abre Excecao Para Simples]]); POST sem distância pra Vídeo Mensal (obrigatória pra ela, não salva); POST com `periodo_continuo` marcado (período fica None, nunca é lido); POST sem período e sem `periodo_continuo` (não salva); distância-de-entrada em branco vira 0; `update_or_create` atualiza sem duplicar; 1 fase inválida não trava as outras na mesma submissão; nenhuma fase válida não salva nada (ainda assim redireciona, nunca 400).
- Nenhum bug novo — a correção do Simples aguenta a régua de regressão.
- Confirmado: **258 passed, 0 failed** (suíte inteira, sem regressão).

### Testes de integração — config afeta o roadmap real — concluído

Motivado por uma pergunta direta do usuário: "as configs realmente refletem na realidade?". Resposta em 2 partes — (1) confirmado por leitura de código que `ConfiguracaoFase` não é cache de nada (diferente do `IndicadoresAgendaProduto`, que precisa de resync manual): tanto `CicloVideo.criar_proximo()` quanto o roadmap (`_montar_caminho_completo_fases`) leem `ConfiguracaoFase.objects.get(...)` direto do banco, toda vez; (2) mesmo assim, nenhum teste provava a cadeia inteira ponta a ponta — só a view isolada (salva certo) e só `criar_proximo()` isolado (lê certo), em rodadas diferentes. Arquivo novo `test_nivel_4__integracao_config_afeta_roadmap.py`, 2 cenários: POST muda a distância do Vídeo Mensal (30→45d) e `criar_proximo()` já usa o valor novo num ciclo que já existia antes da mudança; POST muda o período do Vídeo Mensal (4→2) e `criar_proximo()` já transiciona pra Vídeo Trimestral mais cedo, mesmo o ciclo tendo sido criado com o período antigo. Confirmado: **260 passed, 0 failed**.

## Infra de teste (estado atual dos arquivos compartilhados)

- `conftest.py` (raiz): classe `RegistradorDeResultados` (tabela Rich com `show_lines=True` + lista de linhas pro log), fixture `_resetar_log_de_testes` (autouse, `scope='session'`, zera `resultados_testes.txt`), fixture `tabela_resultados` (`scope='module'`), hook `pytest_collection_modifyitems` (ordem garantida por `nodeid`), hook `pytest_terminal_summary` (resumo de sessão + tracebacks de falha real, filtrando `report.when == 'call'`).
- `testes_apoio/apoio_visual.py`: só a função `registrar_resultado(...)`, delega pra `registrador.adicionar(...)`.
- `pyproject.toml`: `pytest-cov` adicionado, `[tool.coverage.run] branch = true`.
- Comando padrão de validação: `pytest -s --cov=<módulo> --cov-report=term-missing --cov-report=html --cov-report=json`.

## Próximo passo imediato

**3 de 4 arquivos de teste dos 3 arquivos reescritos de Drive concluídos (05/08/2026, 22:52)** — `test_nivel_0__parser.py` (15 testes, 100% cover), `test_nivel_2__verificador.py` (8 testes), `test_nivel_3__verificador.py` (8 testes, padrão Real+Simulado nascido aqui). 1 bug real corrigido no processo (ver [[obter_fase Levantava AttributeError Cru Para Chave Invalida]]).

**Commit feito e sincronizado (05/08/2026 22:56)** — `f294b1b` (drive: reescreve constantes/parser/verificador + testes níveis 0/2/3) e `b4193ee` (scripts_dev), ambos confirmados no GitHub via `git fetch`.

**Nível 5 criado e `test_nivel_5__verificador_drive.py` concluído (05/08/2026 23:20)** — ao sincronizar, achei que já existia `test_integracao_real__drive_leitura.py` (categoria "fora da numeração Nível", decisão antiga, antes desta sessão). Usuário pediu pra nunca ter arquivo "sem nível" — criado Nível 5 (integração externa real, rede/API de terceiro), formalizado em [[Disciplina de Testes Automatizados]]; arquivo antigo renomeado pra `test_nivel_5__drive_leitura.py`. Ao escrever `test_nivel_5__verificador_drive.py` (`verificar_produto_no_drive`/`verificar_todos_no_drive` contra o Drive real, EAN QUIMIVIDA), o teste de `verificar_todos_no_drive` falhou contra dado real — investigação (`manage.py shell`, passo a passo) confirmou o bug de case-sensitivity em `montar_arvore_por_ean()` (já documentado, deferido) estava ativo até no próprio EAN de referência. Corrigido de vez (ver [[Convencao de Nomenclatura de Arquivos no Drive]], seção Resolução) — comparação de nome de pasta virou case-insensitive. Confirmado: **2 passed** contra o Drive de verdade.

**Os 4 arquivos de teste da reescrita de Drive estão completos: Nível 0 (`parser.py`, 15 testes), Nível 2 (8 testes), Nível 3 (8 testes), Nível 5 (2 testes) — 33 testes novos no total, 2 bugs reais corrigidos no processo** (`obter_fase` AttributeError cru; case-sensitivity em `montar_arvore_por_ean`).

**Validação manual no navegador (06/08/2026) achou + corrigiu 3 bugs reais a mais** no botão de verificar Drive individual (visibilidade escondida por `ciclo_atual`; loop não criava o 1º `CicloVideo`; snapshot nunca gravado nesse caminho) — ver [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]]. Todos confirmados corrigidos em ambiente real, e agora com teste de regressão: **42 passed, 100% cover, 0 Miss, 0 BrPart** em `parser.py`/`verificador.py` (00:35).

1. ~~Commitar os 3 fixes do botão individual...~~ — **concluído e confirmado no GitHub em 06/08/2026 (commit `d0a4be2`).**
2. **Próximo passo real: iniciar o fluxo automatizado (`api/postagem_automatica`, `api/replicacao_automatica`)** — pausado desde 05/08, nenhuma das 2 APIs tem teste ainda. Ordem definida no "Mapa de Execução — Rodada 6" no topo desta nota: 1. replicacao_automatica (puro banco) → 2. funções puras do orquestrador → 3. postagem_automatica sem Drive → 4. com Drive real → 5. feature de % de replicação.

Ver mapa completo em [[Fluxo Manual Antes do Automatizado]] e [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]] (nota auto-contida, pra quando o contexto de conversa não estiver disponível).

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Modelo Padrao de Arquivo de Teste]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Cache de Indicadores Nao e Populado Automaticamente]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
- [[Validacao de Configuracoes Nao Abre Excecao Para Simples]]
- [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]
