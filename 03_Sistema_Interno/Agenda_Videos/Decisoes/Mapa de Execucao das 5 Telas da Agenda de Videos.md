---
tipo: decisao
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 03/08/2026 12:40
relacionado: [Estrutura de Telas da Agenda de Videos, Pausa Para Replanejar UX de Filtros e Telas, Fluxo Manual Antes do Automatizado, Checkpoint Testes Automatizados Agenda Videos]
---

# Mapa de Execução das 5 Telas da Agenda de Vídeos

Ordem de implementação de [[Estrutura de Telas da Agenda de Videos]], pensada por dependência — cada fase só começa depois da anterior estar de pé, pra nunca precisar voltar num arquivo já fechado.

## 3 decisões de arquitetura (fecham antes do código)

1. **1 view só, parâmetro `tela` na querystring** (5 valores: não_agendado/simples/mensal/trimestral/a_fazer_hoje) — generaliza o mesmo mecanismo que hoje já existe pro boolean `a_fazer_hoje`, em vez de criar 5 views/URLs novas.
2. **Chip "Base" soma as 2 situações** — produto sem nenhum `CicloVideo` (etapa sintética `'nao_agendado'`, sem ciclo pra perguntar) E produto com ciclo mas `etapa_atual()=='base'` ainda não concluído. Motivo: pra quem usa a tela, as duas são a mesma ação pendente ("precisa gravar o Base") — a distinção é só interna/técnica, não deve virar 2 chips.
3. **`listar_produtos_com_historico()` (relatório de Histórico) é independente** — bug de Não Agendado/A Fazer Hoje mora em `filtros_agenda_videos.py`/`a_fazer_hoje.py` (tela principal), nunca em `historico_roadmap.py`. Pode ser retomado em paralelo, sem esperar as 5 telas.

## Fases (em ordem, cada uma depende só da anterior)

1. **Vocabulário e condições compartilhadas** — `filtros_agenda_videos.py`: condições nomeadas e reutilizáveis (ex: `condicao_nao_agendado()`, `condicao_simples_em_andamento()`, incluindo a regra da decisão 2 acima). Fundação — se nascer errada, todo o resto herda o erro.
2. **Funções de listagem + contagem por tela** — `filtros_agenda_videos.py` / `a_fazer_hoje.py`: 1 função de listagem por tela em cima das condições da Fase 1; nova função de contagem agrupada (1 query com `.values().annotate(Count())`, nunca 7 queries separadas) pros chips-contador; `listar_a_fazer_hoje()` reescrito pra regra nova (só risco/atrasado/postar-hoje + as 3 etapas sempre-pendentes: aguardando aprovação, replicar, recusado).
3. **Contexto** — `contexto_tela_agenda_videos.py`: `ParametrosBuscaAgendaVideos`/`ContextoTelaAgendaVideos` entendem `tela` (5 valores) em vez do boolean `a_fazer_hoje`; montam os chips com contagem.
4. **View/URL** — `views.py` valida o parâmetro `tela`; `urls.py` sem mudança (decisão 1 acima).
5. **Template** — `estrutura_agenda_videos.html` e parciais: navegação entre as 5 telas + chips virando botões clicáveis com contador.
6. **Testes automatizados** — Nível 0/2/3 pras funções novas de filtro/contagem, Nível 4 pras views. Só depois de tudo estruturalmente parado.
7. **Validação manual no navegador** — último passo.

`listar_produtos_com_historico()` (decisão 3) roda à parte, sem bloquear nem ser bloqueado por nenhuma fase acima.

## Relacionado

- [[Estrutura de Telas da Agenda de Videos]]
- [[Pausa Para Replanejar UX de Filtros e Telas]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
