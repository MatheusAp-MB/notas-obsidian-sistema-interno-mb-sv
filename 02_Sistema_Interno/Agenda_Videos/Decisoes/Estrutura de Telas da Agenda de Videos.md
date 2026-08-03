---
tipo: decisao
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 03/08/2026 17:10
relacionado: [Modelo de Status e Entrada na Agenda, Pausa Para Replanejar UX de Filtros e Telas, Fluxo Manual Antes do Automatizado, Checkpoint Testes Automatizados Agenda Videos, Mapa de Execucao das 5 Telas da Agenda de Videos, Cache de Indicadores Nao e Populado Automaticamente]
---

# Estrutura de Telas da Agenda de Vídeos

Resultado do replanejamento de UX (ver [[Pausa Para Replanejar UX de Filtros e Telas]]) — define as 5 telas e o critério exato de quem aparece em cada uma. Passa a ser a referência pros filtros de `listar_produtos_com_historico`, `listar_produtos_agenda_filtrados` e `listar_a_fazer_hoje`.

## As 5 telas

1. **Não Agendado** — fila estreita: fase Simples com `etapa_atual() == 'concluido'` (já replicado, só falta clicar "Agendar"). Sem filtro de etapa — é um estado único.
2. **Simples** — listagem completa da fase Simples, EXCETO os já `concluido` (que moram em Não Agendado). Filtro de etapa: Base / Roteiro / Completo / Postar / Aguardando aprovação / Replicar / Recusado.
3. **Mensal** — listagem completa da fase Vídeo Mensal, mesmo padrão de filtro de etapa do item 2.
4. **Trimestral** — listagem completa da fase Vídeo Trimestral, mesmo padrão de filtro de etapa do item 2.
5. **A Fazer Hoje** — cruza Mensal + Trimestral (nunca Simples, que não tem prazo). Entra quem tem urgência real (Postar devido hoje, Atrasado, Risco) OU ação pendente em aberto que não depende de prazo (Aguardando aprovação do ML, Aprovado aguardando replicar, Recusado) — essas 3 últimas contam sempre, independente da distância do prazo do ciclo, porque são ação pendente em aberto ("se não foi replicado ainda é porque tem ação pendente a ser feita").

## Padrão de UI: chip de filtro vira contador clicável

Toda opção de filtro por etapa (telas 2-4) e por motivo de urgência (tela 5) é exibida como chip com contagem (ex: "Completo (3)") — clicar no chip aplica o filtro. Mesmo padrão nas 5 telas: serve de filtro E de resumo visual rápido ao mesmo tempo, sem precisar abrir o painel de filtro pra saber "quantos estão em tal etapa agora".

## Motivo

2 bugs reais encontrados testando manualmente motivaram o replanejamento:

- "Não Agendado" (antes) só pegava produto com 0 ciclos — some do balde assim que Base é clicado pela 1ª vez, mesmo o produto continuando 100% dentro de Simples.
- "A Fazer Hoje" (antes) mostrava qualquer produto ativo, mesmo sem nenhuma urgência de data — Base/Roteiro/Completo não têm trava de data nenhuma na reestruturação de 30/07, então quase tudo aparecia ali sem diferenciação real de prioridade.

A estrutura de 5 telas acima corrige os 2 problemas e dá simetria (Simples/Mensal/Trimestral tratadas exatamente do mesmo jeito, já que seguem a mesma sequência de 5 passos).

## Atualização 03/08/2026 17:10 — validado e aprovado

As 5 telas foram implementadas (ver [[Mapa de Execucao das 5 Telas da Agenda de Videos]]), testadas via pytest (suíte nova cobrindo escopo/motivos/ordenação) e validadas manualmente por 2 pessoas — o usuário e o Vinicius (time) — que aprovaram o fluxo e o design atuais. A pergunta sobre precisar de uma tela "ver tudo, cruzando todas as fases" (capacidade que existia implicitamente no sistema antigo, quando nenhuma caixinha de estágio era marcada) foi levantada e fechada: não é necessária, o fluxo por tela já atende. Também se descobriu, na validação, que o cache `IndicadoresAgendaProduto` precisa estar sincronizado pra qualquer produto aparecer nas 5 telas (ver [[Cache de Indicadores Nao e Populado Automaticamente]]) — não é falha deste desenho, é um cuidado operacional novo que o desenho expôs.

## Relacionado

- [[Modelo de Status e Entrada na Agenda]]
- [[Pausa Para Replanejar UX de Filtros e Telas]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Mapa de Execucao das 5 Telas da Agenda de Videos]]
- [[Cache de Indicadores Nao e Populado Automaticamente]]
