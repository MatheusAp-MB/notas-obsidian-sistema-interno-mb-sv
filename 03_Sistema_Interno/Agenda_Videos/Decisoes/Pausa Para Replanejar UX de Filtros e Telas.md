---
tipo: decisao
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 03/08/2026 12:20
relacionado: [Fluxo Manual Antes do Automatizado, Checkpoint Testes Automatizados Agenda Videos, Estrutura de Telas da Agenda de Videos]
---

# Pausa Para Replanejar UX de Filtros e Telas

A rodada de testes de `listar_produtos_com_historico()` foi pausada — decisão tomada depois que a régua de fases (`ConfiguracaoFase`) foi populada no banco real e o usuário testou manualmente pela primeira vez com dado de verdade.

## Motivo

Os filtros das telas da Agenda de Vídeos (Agenda principal, Histórico/relatório) não refletem o que a equipe realmente precisa ver na versão nova do modelo (pós-reestruturação de 30/07). Continuar testando/corrigindo filtro por filtro sem esse mapeamento arriscava consolidar comportamento errado.

## Próximo passo

Mapear o UX de ponta a ponta antes de voltar a codar: tela por tela (Agenda principal, Histórico/relatório geral, Modal de histórico do produto, Configurações), definindo pra cada uma — pra que serve, quais filtros fazem sentido, o que aparece por padrão sem filtro nenhum. Só depois disso a suíte de testes de `listar_produtos_com_historico()` (e o resto do fluxo manual) volta a andar.

**Atualização 03/08 12:20** — mapeamento concluído, ver [[Estrutura de Telas da Agenda de Videos]] (as 5 telas + critério de cada uma + padrão de chip-contador clicável). Próximo passo real agora: usuário faz um commit do estado atual, depois desenhamos o fluxo de execução (ordem de implementação), só então voltamos a codar.

## Relacionado

- [[Fluxo Manual Antes do Automatizado]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
