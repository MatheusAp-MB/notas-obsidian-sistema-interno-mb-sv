---
tipo: checkpoint
dominio: 
status: ativo
criado: 03/08/2026
atualizado_em: 03/08/2026 17:10
relacionado: [Estrutura e Convenções do Vault, Estrutura de Telas da Agenda de Videos, Mapa de Execucao das 5 Telas da Agenda de Videos, Pausa Para Replanejar UX de Filtros e Telas, Cache de Indicadores Nao e Populado Automaticamente, Checkpoint Testes Automatizados Agenda Videos, Fluxo Manual Antes do Automatizado, Modelo de Status e Entrada na Agenda, Disciplina de Testes Automatizados, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Perguntas Sempre em Texto Corrido, Perguntar Data e Hora Antes de Escrever no Vault]
---

# Contexto Geral — Retomada em Outro Computador (Agenda de Vídeos)

> Nota auto-contida, gerada em 03/08/2026 porque o desenvolvimento vai continuar em outro computador e a conversa atual não migra junto. Serve como ponto de partida único — lê esta nota primeiro, depois segue os links pra detalhe quando precisar. Se algo aqui parecer desatualizado, o vault é a fonte da verdade — os links levam ao original.

## Onde isso vive

- Projeto: `Projeto_Sistema_Interno_V2` (Django). Repo GitHub `MatheusAp-MB/Projeto_Sistema_Interno_V2`, branch `dev`.
- App em foco: `agenda_videos` — agendamento/produção de vídeos de produto (Simples → Vídeo Mensal → Vídeo Trimestral, cada um com sequência Base→Roteiro→Completo→Postar→Replicar).
- Vault Obsidian: `notas-obsidian-sistema-interno-mb-sv` — fonte da verdade sempre que houver dúvida. Ver [[Estrutura e Convenções do Vault]] antes de criar/editar qualquer nota (schema de frontmatter, estrutura de pastas).

## Regras de colaboração (resumo — ver notas linkadas pra nuance completa)

1. Só sincronizar (fetch) com o GitHub quando o usuário pedir explicitamente.
2. Só editar/escrever/remover arquivo da pasta atual do usuário com permissão explícita dele.
3. Nunca criar tarefa/subagente sem autorização — sempre planejar antes de executar, e só agir com permissão.
4. O vault é fonte da verdade; se ele não responder a uma dúvida, perguntar ao usuário (nunca assumir).
5. `Legado/` é arquivo morto, nunca fonte de verdade, só consulta pontual.
6. Nunca usar caixinha de múltipla escolha (tipo AskUserQuestion) — perguntas sempre em texto corrido na conversa. Ver [[Perguntas Sempre em Texto Corrido]].
7. Explicar em tópicos simples e didáticos ANTES de gerar qualquer código, sempre por etapas (nunca despejar tudo de uma vez sem planejar junto).
8. Cobertura de teste exaustiva (máximo possível, ponta a ponta); nunca contornar bug real no teste — conserta-se o código de verdade, retroativamente se preciso. Ver [[Disciplina de Testes Automatizados]].
9. **Claude nunca roda scripts/pytest/comandos sozinho contra o repo real do usuário.** Só entrega código (arquivo completo ou bloco Localize/Substitua nomeado) pro usuário aplicar e rodar localmente, reportando o resultado de volta em texto real (nunca assumir que passou). Fetch/log/reset são aceitáveis SÓ no clone-sandbox próprio do Claude (nunca no repo real do usuário), e só depois que o usuário autorizar sincronizar.
10. Antes de escrever/editar QUALQUER nota do vault, perguntar data e hora ao usuário (1x por bloco de edições, não por arquivo — não precisa ser o timestamp exato, só uma referência clara). Toda escrita/edição de nota atualiza o campo `atualizado_em` (`DD/MM/YYYY HH:mm`) no frontmatter. Ver [[Perguntar Data e Hora Antes de Escrever no Vault]].
11. Código sempre limpo, POO com dataclass/decorators/type hints, comentários explicando o PORQUÊ (nunca o quê óbvio), padrões de eficiência/encapsulamento/responsabilidade única.
12. Decisão/dúvida/bug conhecido preservam histórico — nunca são editados "por cima"; ganham nova seção ("Atualização DD/MM HH:mm") ou nota nova. Checkpoint é a exceção: é "nota viva", atualizada no próprio corpo, nunca substituída.

## O que é a Agenda de Vídeos (modelo de domínio, pós-reestruturação de 30/07)

- `Fase`: SIMPLES (1x) → VIDEO_MENSAL (4x, a cada 30 dias corridos) → VIDEO_TRIMESTRAL (a cada 90 dias, pra sempre — nunca conclui).
- Cada ocorrência de `CicloVideo` passa por 5 passos travados: Base → Roteiro → Completo → Postar → Replicar. `etapa_atual()` devolve 1 de 7 valores reais + `'nao_agendado'` sintético (só no cache, quando não existe nenhum `CicloVideo`).
- `ParticipacaoAgenda.agendado_em` = momento exato da transição Simples→Mensal (setado dentro do botão "Agendar" já existente).
- Status do PRODUTO (Ativo/Inativo, vindo do ERP) é diferente de status DA AGENDA (Ativo/Pausado/Descontinuado, controlado pelo time). Sem ação de "excluir da agenda" — se precisar, o ajuste é no filtro de entrada, nunca uma ação manual por produto.
- `IndicadoresAgendaProduto` é cache DERIVADO (nunca fonte real) — precisa ser re-sincronizado (`sincronizar_indicadores_agenda_produto()`) depois de qualquer escrita em CicloVideo/ConfiguracaoFase/ParticipacaoAgenda/HistoricoStatusManualAgenda. Ver seção de achados abaixo — isso mordeu a gente de verdade.

## O que foi feito nesta sessão: redesenho das 5 telas

Motivo: testando manualmente com dado real pela 1ª vez, apareceram 2 bugs no filtro antigo — "Não Agendado" sumia assim que o produto tinha o 1º clique em Base (mesmo continuando 100% dentro de Simples), e "A Fazer Hoje" mostrava qualquer produto ativo, sem noção real de urgência. Isso motivou parar os testes de `listar_produtos_com_historico()` (ver [[Pausa Para Replanejar UX de Filtros e Telas]]) e replanejar a UX do zero.

Resultado do desenho — [[Estrutura de Telas da Agenda de Videos]]: 5 telas, cada uma com critério de entrada explícito:

1. **Não Agendado** — fase Simples com `etapa_atual()=='concluido'` (já replicado, só falta clicar "Agendar"). Sem filtro de etapa — estado único.
2. **Simples** — toda a fase Simples EXCETO `concluido`. "Base" soma 2 situações: produto nunca tocado (0 ciclos, cache sintético `nao_agendado`) + produto com ciclo mas ainda em `base` — decisão de arquitetura deliberada, são a mesma ação pendente pro usuário.
3. **Vídeo Mensal** / 4. **Vídeo Trimestral** — listagem completa da fase, qualquer etapa.
5. **A Fazer Hoje** — cruza SÓ Mensal+Trimestral (nunca Simples, que não tem prazo). Entra por 6 motivos: atrasado, risco (etapa em produção + prazo ≤1 dia útil), postar hoje (com proteção contra cache `postou_hoje` desatualizado), aguardando aprovação, aprovado-aguardando-replicar, recusado — as 3 últimas contam sempre, sem checar prazo ("se não foi replicado ainda é porque tem ação pendente a ser feita"). Pausado/Descontinuado excluído incondicionalmente aqui (só aqui — as outras 4 telas mostram tudo por padrão, pausado incluso, a menos que o usuário filtre `status_manual` de propósito).

Toda etapa/motivo é um **chip-contador clicável** (ex: "Completo (3)") — filtro E resumo visual ao mesmo tempo, sempre visível (não escondido em "Mais filtros"), 1 query agregada pra todos os contadores de uma vez (nunca 1 query por chip).

Execução seguiu [[Mapa de Execucao das 5 Telas da Agenda de Videos]], 7 fases, TODAS CONCLUÍDAS e aplicadas pelo usuário:

1. **Vocabulário/condições** (`agenda_videos/funcoes_auxiliares/filtros_agenda_videos.py`) — `Tela` (TextChoices), `condicao_tela()`, `condicao_pendencia_agora()` reescrita (match/case), `condicao_motivo_a_fazer_hoje()` (os 6 motivos), `contar_por_condicoes()`.
2. **Listagem unificada** — `listar_produtos_agenda_filtrados(tela=...)` substitui a dupla antiga; `listar_a_fazer_hoje()` aposentada (`a_fazer_hoje.py` reduzido só a `calcular_indicadores_ciclo`, usado por produto único); `construir_queryset_tela()` isola a base compartilhada entre listagem e contagem de chips.
3. **Contexto** (`contexto_tela_agenda_videos.py`) — `ParametrosBuscaAgendaVideos` com campo único `tela` (substitui os antigos `a_fazer_hoje`/`estagio`); `contadores_chips` no contexto montado.
4. **Views/URLs** — `views.py`: rotas de replicação automática migradas pra nova função; `urls.py` sem mudança nenhuma. `orquestrador.py` (postagem automática): `listar_produtos_elegiveis()` reescrita À PARTE, preservando a regra real do bot — posta tudo com etapa 'postar' e vencimento hoje-ou-atrasado, EM QUALQUER FASE (Simples incluso) — não reaproveita o escopo Mensal/Trimestral da tela A Fazer Hoje, que é só recorte de UI.
5. **Templates** — navegação por link entre as 5 telas (substitui os checkboxes de estágio + JS de exclusão mútua, que foi removido); chip-contador sempre visível.
6. **Testes** — `agenda_videos/tests/test_nivel_3__listar_produtos_agenda_filtrados.py` (novo) substitui `test_nivel_3__listar_a_fazer_hoje.py` (removido) — cobre escopo das 5 telas, os 6 motivos, a assimetria de `status_manual`, ordenação (fixa em A Fazer Hoje x escolhida nas outras 4), smoke test dos filtros que não mudaram de lógica.
7. **Validação manual** — aprovado pelo usuário E pelo Vinicius (colega de time), fluxo e design confirmados. A pergunta sobre precisar de uma tela "ver tudo, cruzando todas as fases" (que existia implicitamente no sistema antigo) foi levantada e fechada: não é necessária.

## Achado real importante (não é bug de código)

`IndicadoresAgendaProduto` (cache que TODAS as 5 telas dependem, via `indicadores_agenda__X`, join INNER) só é populado por ação manual (clique no roadmap) ou pelo comando `popular_banco` (passo `sincronizar_indicadores_agenda_em_lote`). Produto nunca tocado manualmente fica sem essa linha de cache — e portanto invisível em TODAS as 5 telas ao mesmo tempo, não só numa. Isso já causou confusão real (usuário só via 1 produto depois de aplicar o redesenho). Resolvido rodando `python manage.py popular_banco`. Detalhe completo em [[Cache de Indicadores Nao e Populado Automaticamente]]. Cuidado permanente: depois de qualquer import novo de produtos, rodar `popular_banco` antes de confiar na Agenda de Vídeos pro catálogo novo.

## Status real agora (03/08/2026, 17:10)

- Código aplicado, testado via pytest (só a suíte antiga de `listar_a_fazer_hoje` quebrou a coleta, esperado — resto passou) e validado manualmente por 2 pessoas.
- Commit do código (título + descrição) foi gerado nesta conversa — **CONFIRMAR se já foi de fato commitado/pushado** antes de considerar essa etapa fechada (não presumir).
- Usuário classificou a fase atual como "testar e validar, e refinar apenas" — ou seja, sem redesenho pendente, só ajuste fino. **Nenhum item específico de refino foi levantado ainda** — perguntar antes de assumir o que precisa de polimento.

## O que ainda está em aberto

- **Refino das 5 telas** — sem itens concretos levantados ainda.
- `listar_produtos_com_historico()` (relatório de Histórico, 7 filtros) — pausado desde antes do redesenho, é trabalho PARALELO/independente, pode retomar a qualquer momento. O filtro de `urgente` (NULL não entra em `IN()`) já foi corrigido pelo usuário antes da pausa.
- `view_verificar_produto_drive`/`view_verificar_todos_drive` — pergunta antiga nunca respondida: testar agora com mock, ou esperar a fase de fluxo automatizado? Ver [[Fluxo Manual Antes do Automatizado]].
- `script_agenda_videos.js` ficou vazio (lógica de exclusão mútua não existe mais) — pode apagar quando o usuário autorizar (regra 2 acima).
- CSS antigo (`.agenda-estagio-*` em `layout_agenda_videos.css`) ficou morto no arquivo, marcado como "pode limpar depois" — não é urgente.
- Depois de tudo isso: iniciar o fluxo AUTOMATIZADO (postagem_automatica, replicacao_automatica, Drive real) — deliberadamente adiado até o fluxo manual estar 100% validado (ver [[Fluxo Manual Antes do Automatizado]]).

## Arquivos tocados nesta sessão (referência rápida)

- `agenda_videos/funcoes_auxiliares/filtros_agenda_videos.py` — reescrito por completo.
- `agenda_videos/funcoes_auxiliares/a_fazer_hoje.py` — reduzido a `calcular_indicadores_ciclo`.
- `agenda_videos/funcoes_auxiliares/contexto_tela_agenda_videos.py` — reescrito (tela + contadores_chips).
- `agenda_videos/views.py` — imports + 2 call sites de replicação automática.
- `agenda_videos/funcoes_auxiliares/postagem_automatica/orquestrador.py` — `listar_produtos_elegiveis()` reescrita.
- `agenda_videos/templates/agenda_videos/estrutura_agenda_videos.html` — navegação + chip-contador.
- `agenda_videos/static/agenda_videos/js/script_agenda_videos.js` — esvaziado.
- `agenda_videos/static/agenda_videos/css/layout_agenda_videos.css` — classes novas (`.agenda-tela-*`, `.agenda-chip-contador-*`).
- `agenda_videos/tests/test_nivel_3__listar_produtos_agenda_filtrados.py` (novo) — `test_nivel_3__listar_a_fazer_hoje.py` (removido).

## Convenção de entrega de código (lembrar de imediato)

Claude nunca escreve direto no repo do usuário nem roda pytest/scripts. Todo código é entregue como bloco "Localize: / Substitua por:" (diff nomeado, texto exato do arquivo real) ou arquivo completo, sempre depois de explicar em tópicos simples o que vai mudar e por quê, pro usuário aplicar e rodar localmente — reportando o resultado real de volta (saída de terminal, screenshot, ou descrição precisa do comportamento).

## Relacionado

- [[Estrutura de Telas da Agenda de Videos]]
- [[Mapa de Execucao das 5 Telas da Agenda de Videos]]
- [[Pausa Para Replanejar UX de Filtros e Telas]]
- [[Cache de Indicadores Nao e Populado Automaticamente]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Modelo de Status e Entrada na Agenda]]
- [[Disciplina de Testes Automatizados]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Perguntas Sempre em Texto Corrido]]
- [[Perguntar Data e Hora Antes de Escrever no Vault]]
