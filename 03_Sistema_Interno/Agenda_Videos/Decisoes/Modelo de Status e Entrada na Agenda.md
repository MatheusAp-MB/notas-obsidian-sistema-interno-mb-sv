---
tipo: decisao
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 03/08/2026 11:30
relacionado: [Fluxo Manual Antes do Automatizado, Checkpoint Testes Automatizados Agenda Videos]
---

# Modelo de Status e Entrada na Agenda

Esclarecimento de 3 conceitos que estavam implícitos e geraram confusão real durante os testes de `historico_roadmap.py`.

## Entrada na agenda é automática, não manual

Todo produto que existe já faz parte da Agenda de Vídeos por padrão — não existe (nem deveria existir) uma ação de "entrar na agenda". Um produto sem nenhum `CicloVideo` ainda já aparece como pendente no dashboard "A Fazer Hoje".

## `agendado_em` representa a transição Simples → Mensal, não a entrada

`ParticipacaoAgenda.agendado_em` é setado no clique do botão "Agendar" que já existe no roadmap (`view_agendar_produto`, entre Simples replicado e Vídeo Mensal #1) — nunca um evento separado de "entrar na agenda". O rótulo do evento na linha do tempo (`historico_roadmap.py`) foi corrigido de "Entrou na Agenda de Vídeos" para "Agendado — Vídeo Mensal Iniciado" pra refletir isso.

## Status do produto ≠ status da agenda

- **Status do produto** (Ativo/Inativo): vem do ERP, escopo do app `produtos`, fora da Agenda de Vídeos por enquanto — na prática só produtos ativos são puxados do ERP, então isso nem chega a ser filtro aqui.
- **Status da agenda** (`StatusManualAgenda`): Ativo = fluxo normal; Pausado = a equipe decidiu pausar o fluxo desse produto na agenda por algum motivo.

## Sem exclusão manual de produto da agenda

Não existe (nem deve existir) uma ação de "excluir produto da agenda". Se no futuro aparecerem produtos que não deveriam estar na agenda, o ajuste é no FILTRO de entrada da agenda — nunca uma ação manual por produto. `StatusManualAgenda.DESCONTINUADO` continua existindo no model/enum (já tem badge, já tem teste), mas nenhuma ação do sistema o gera, de propósito — é reservado, não morto.

## Relacionado

- [[Fluxo Manual Antes do Automatizado]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
