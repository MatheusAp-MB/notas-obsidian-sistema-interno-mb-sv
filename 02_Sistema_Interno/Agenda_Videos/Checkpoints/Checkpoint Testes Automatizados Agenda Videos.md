---
tipo: checkpoint
dominio: testes
status: concluido
criado: 02/08/2026
relacionado: [Disciplina de Testes Automatizados, Modelo Padrao de Arquivo de Teste]
---

# Checkpoint — Testes Automatizados Agenda_Videos

Nota viva — atualizada em cada sessão relevante, nunca substituída por nota nova. Serve pra retomar o trabalho mesmo se o contexto da conversa for perdido (compactação já causou esquecimento real, ex: acesso ao GitHub).

## Última atualização

02/08/2026 — Nível 4 fechado (100% cover, 0 Miss, 0 BrPart em `a_fazer_hoje.py`). Cobertura completa do roadmap Nível 0→4 pra `CicloVideo` + dashboard "A Fazer Hoje": 82 testes passando, 0 falhas. Checkpoint concluído — próxima expansão de teste (outras partes de `agenda_videos`, ex. postagem/replicação automática) é decisão nova, fora do escopo original deste checkpoint.

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

## Infra de teste (estado atual dos arquivos compartilhados)

- `conftest.py` (raiz): classe `RegistradorDeResultados` (tabela Rich com `show_lines=True` + lista de linhas pro log), fixture `_resetar_log_de_testes` (autouse, `scope='session'`, zera `resultados_testes.txt`), fixture `tabela_resultados` (`scope='module'`), hook `pytest_collection_modifyitems` (ordem garantida por `nodeid`), hook `pytest_terminal_summary` (resumo de sessão + tracebacks de falha real, filtrando `report.when == 'call'`).
- `testes_apoio/apoio_visual.py`: só a função `registrar_resultado(...)`, delega pra `registrador.adicionar(...)`.
- `pyproject.toml`: `pytest-cov` adicionado, `[tool.coverage.run] branch = true`.
- Comando padrão de validação: `pytest -s --cov=<módulo> --cov-report=term-missing --cov-report=html --cov-report=json`.

## Próximo passo imediato

Nenhum pendente dentro do escopo original (CicloVideo + dashboard A Fazer Hoje). Se o usuário quiser continuar testando `agenda_videos`, as áreas ainda não tocadas são: postagem automática, replicação automática, histórico, e a listagem paginada (`listar_produtos_agenda_filtrados`) — cada uma precisaria do mesmo processo de confirmação de regra de negócio antes do primeiro teste.

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Modelo Padrao de Arquivo de Teste]]
