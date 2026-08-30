---
tipo: decisao
dominio: 
status: ativa
criado: 12/08/2026
atualizado_em: 12/08/2026 23:51
relacionado: [Estrutura de Telas da Agenda de Videos, Mapa de Execucao das 5 Telas da Agenda de Videos, Checkpoint Testes Automatizados Agenda Videos, Contexto Geral - Retomada em Outro Computador (Agenda de Videos), Disciplina de Testes Automatizados, Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]
---

# Reestruturação da Navegação da Agenda de Vídeos em 6 Telas de Nível Igual

Substitui por completo o modelo de [[Estrutura de Telas da Agenda de Videos]] (marcada `descartada` a partir desta nota). O modelo antigo misturava 3 perguntas diferentes numa lista plana de 6 telas mutuamente exclusivas (Todos, Não Agendado, Simples, Vídeo Mensal, Vídeo Trimestral, A Fazer Hoje) — cada tela respondia "onde no tempo" e "o que falta fazer" ao mesmo tempo, sem separar as duas coisas. O modelo novo separa: **Período** (onde no tempo — Todos/Simples/Vídeo Mensal/Vídeo Trimestral) e **Etapa** (o que falta fazer — 8 valores reais do fluxo). Commit real: `c369488` ("Reestrutura navegação da Agenda de Vídeos em 6 telas de nível igual (Período × Etapa)").

## As 6 telas novas

1. **Geral** — navegação livre: cruza Período × Etapa, escolhidos pelo usuário. Única tela com ordenação livre (as outras 4 telas de baixo, exceto A Fazer Hoje, têm ordenação fixa por prioridade→fase→prazo). Tem os 8 chips de Etapa.
2. **A Fazer Hoje** — só produção real (Base/Roteiro/Completo/Recusado). Ver regra de escopo abaixo — é a tela que mudou de critério nesta sessão.
3. **Aguardando Postar/Replicar** — ação mecânica, sem prazo — 2 sub-abas (Postar, Replicar).
4. **Aguardando Aprovação** — espera de terceiro (ML), sem ação minha — ordenação fixa por tempo de espera, ignora a escolha do usuário.
5. **Prontos pra Agendar Mensal** — Simples já replicado (`etapa_atual='concluido'`), renomeada de "Não Agendado" (o nome antigo dizia o oposto do que significava).
6. **Pausados na Agenda** — única tela onde produto Pausado/Descontinuado aparece — todas as outras 5 excluem sempre esse status.

## Etapa — 8 valores reais, na ordem real do fluxo (fix desta sessão)

`OPCOES_ETAPA` estava fora de ordem e faltava 1 valor. Ordem corrigida, batendo com `BADGES_ETAPA` (já existente): **base → roteiro → completo → postar → aguardando_aprovação → recusado → replicar → concluído**. O chip "Prontos pra agendar mensal" (`concluido`) faltava inteiramente na tela Geral antes desta sessão — Geral não deixava ver esse grupo sem trocar de tela.

`ETAPAS_FABRICA` (o chip PRÓPRIO da tela A Fazer Hoje, diferente do de Geral) continua com só 4 valores, ordem original, sem mudança: base/roteiro/completo/recusado — Postar/Aguardando Aprovação/Replicar/Concluído têm tela própria agora e saem do filtro de Etapa de A Fazer Hoje.

## A Fazer Hoje — escopo restrito ao que é urgência real (fix desta sessão)

Antes desta sessão, qualquer produto Simples ativo entrava em A Fazer Hoje, mesmo sem nenhuma urgência real — a tela perdia sentido (quase tudo aparecia ali). Regra nova, confirmada com o usuário ("faz sentido?"):

- **Vídeo Mensal / Vídeo Trimestral**: entram em QUALQUER etapa de produção (Base/Roteiro/Completo/Recusado) — têm prazo real (`data_devida`), mesmo parado em Base.
- **Simples**: só entra se a Base já estiver feita (Roteiro/Completo/Recusado) — Simples nunca tem prazo; estar em Base (ou nunca tocado) é só backlog, não é urgência do dia. Estar além de Base é sinal de "processo em andamento que falta terminar", isso sim é urgência real.

Implementado em `_condicao_a_fazer_hoje()` — 2 condições separadas (Mensal/Trimestral vs. Simples), unidas por `|`.

## Aguardando Postar/Replicar — botões de automação específicos por sub-aba

Antes: os 3 botões ("Verificar Todos no Drive", "Iniciar Postagem Autônoma de Hoje", "Iniciar Replicação Autônoma de Hoje") apareciam juntos, sem relação com a sub-aba ativa. Fix: "Iniciar Postagem Autônoma de Hoje" só aparece na sub-aba Postar, "Iniciar Replicação Autônoma de Hoje" só na sub-aba Replicar — ambos ao lado de "Verificar Todos no Drive" (nunca embaixo). Achado no meio do caminho: o `<form>` que envolvia "Verificar Todos no Drive" criava sua própria caixa de bloco, desalinhando os botões mesmo com o HTML lado a lado — corrigido com `display: contents` no form (`.agenda-verificar-todos-form`) + um wrapper flex novo (`.agenda-acoes-automacao`) envolvendo os 2/3 botões.

## Arquivos de produção tocados (commit `c369488`)

- `agenda_videos/funcoes_auxiliares/filtros_agenda_videos.py` — reescrito.
- `agenda_videos/funcoes_auxiliares/contexto_tela_agenda_videos.py` — reescrito.
- `agenda_videos/templates/agenda_videos/estrutura_agenda_videos.html` — navegação de 6 abas + sub-abas Postar/Replicar + botões condicionados.
- `agenda_videos/static/agenda_videos/css/layout_agenda_videos.css` — classes novas + fix de alinhamento.
- `agenda_videos/management/commands/resetar_agenda_videos.py` — novo comando, limpa histórico de agenda sem tocar Produto/ConfiguracaoFase, pra testar a reestruturação com base limpa.

## Suíte de teste fechada pro modelo novo

- `agenda_videos/tests/test_nivel_3__listar_produtos_agenda_filtrados.py` — reescrito por completo (9 blocos). Fecha `filtros_agenda_videos.py` em **100% cover, 0 Miss, 0 BrPart** (144 stmts, 72 branches). Achou e corrigiu 1 bug real de teste (não de produção): o cenário de Aguardando Postar/Replicar chamava `listar_produtos_agenda_filtrados()` (que sempre estreita pra 1 aba, default `'postar'`) esperando ver a união bruta de postar+replicar — só visível via `construir_queryset_tela()` direto, antes do estreitamento por aba. Fechou também 3 lacunas de branch coverage nos filtros "sim"+"não" marcados ao mesmo tempo (atrasado/risco/sincronizado_drive) — nenhum dos dois filtra, comportamento intencional, mas nunca tinha teste dedicado.
- `agenda_videos/tests/test_nivel_4__view_agenda_videos.py` — 4 testes desatualizados corrigidos (referenciavam `Tela.TODOS`/`Tela.SIMPLES`, enum antigo). Achado semântico importante: `Tela.GERAL` **calcula** contadores de chip (dict de 8 chaves zeradas pra produto sem cache), diferente da antiga `Tela.TODOS` (que não tinha chip nenhum, `== {}`) — a asserção precisou mudar, não só o nome do enum.
- `agenda_videos/tests/test_nivel_4__contexto_tela_agenda_videos.py` — **novo**. Fecha `contexto_tela_agenda_videos.py` de 83% pra **100% cover**. Introduz `RequestFactory` no projeto pela 1ª vez, pra testar `ContextoTelaAgendaVideos` isolado, sem precisar de client HTTP nem template. Cobre: os 5 métodos privados de querystring de link (base/sem página/sem tela/sem período/sem aba), os 4 fallbacks de valor inválido na querystring (`por_pagina`/`ordenar`/`periodo`/`aba`), o bloco `simular_data` (só ativo com `DEBUG=True`, nos 3 ramos — ausente/válido/inválido), os 3 rótulos do chip de faixa, e os 3 ramos de `_montar_contadores_chips()` (Geral/A Fazer Hoje/Aguardando Postar-Replicar) mais o `{}` das 3 telas sem chip — incluindo a prova de que o chip clicado não zera a própria contagem (`filtros_sem_chip`).

**Confirmado (12/08/2026): 520 passed, 0 failed, 12 xfailed** — suíte inteira, sem regressão.

## Relacionado

- [[Estrutura de Telas da Agenda de Videos]]
- [[Mapa de Execucao das 5 Telas da Agenda de Videos]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
- [[Disciplina de Testes Automatizados]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
