---
tipo: descoberta
dominio: 
status: ativa
criado: 04/08/2026
atualizado_em: 04/08/2026 11:40
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Modelo de Status e Entrada na Agenda, Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]
---

# Status Manual Atual Ignora Histórico Quando ParticipacaoAgenda Não Existe

Achado testando `view_alternar_pausado_agenda` via HTTP (Nível 4, rodada de testes de views iniciada em 04/08 — ver [[Checkpoint Testes Automatizados Agenda Videos]]). Bug real, não só de teste — e o mais grave achado até agora nesta rodada.

## O que aconteceu

Um teste novo criava um produto com histórico de status manual (`HistoricoStatusManualAgenda(status=PAUSADO)`) mas SEM nunca ter marcado Urgente nem sido Agendado — ou seja, sem `ParticipacaoAgenda`. O modal de histórico devolvia "Ativo" mesmo assim, ignorando o histórico real.

## Causa

3 lugares repetiam o mesmo padrão quebrado:

```python
participacao = getattr(produto, 'participacao_agenda', None)
status_manual = participacao.status_manual_atual() if participacao else StatusManualAgenda.ATIVO
```

`HistoricoStatusManualAgenda` tem FK direta pro Produto — nunca precisou de `ParticipacaoAgenda` existir. Mas o guard acima cai no `else` sempre que `ParticipacaoAgenda` não existe, e joga fora o histórico real, mesmo que ele exista.

## Impacto (3 lugares afetados)

1. `historico_roadmap.py` (`montar_historico_produto`) — modal mostra "Ativo" errado.
2. `sincronizar_roadmap_agenda.py` (`calcular_indicadores`) — alimenta o cache `IndicadoresAgendaProduto.status_manual`, usado pelo filtro de `status_manual` nas 6 telas. Fica errado permanentemente pra esses produtos.
3. **`views.py`, `view_alternar_pausado_agenda` — o mais grave.** Essa view lê o status atual do mesmo jeito quebrado ANTES de decidir se vai pausar ou despausar. Pro produto sem `ParticipacaoAgenda`, o botão "Pausar" sempre acha que o status atual é Ativo — todo clique cria outro registro de Pausado, e o botão nunca volta pra Ativo. Fica travado.

## Por que o teste antigo nunca pegou isso

`test_nivel_3__calcular_indicadores.py` já tinha um teste pra "sem participação" — mas SEM histórico também, então dava Ativo nos 2 casos (antes e depois do fix) e nunca distinguia o bug. Faltava exatamente a combinação "sem participação, MAS com histórico".

## Resolução

Extraída função única `status_manual_atual_do_produto(produto)` (`agenda_videos/models/participacao_agenda.py`) — lê o histórico direto do produto, nunca depende de `ParticipacaoAgenda` existir. `ParticipacaoAgenda.status_manual_atual()` passou a delegar 100% pra ela (nunca duplica a regra). 3 call sites corrigidos: `sincronizar_roadmap_agenda.py`, `historico_roadmap.py`, `views.py` (`view_alternar_pausado_agenda`). Teste novo adicionado em `test_nivel_3__calcular_indicadores.py` fechando o gap (`test_calcular_indicadores_sem_participacao_mas_com_historico`). Confirmado pelo usuário: **190 passed, 0 failed**, sem regressão.

## Atualização 04/08/2026 11:40 — follow-up: NameError escondido pela mesma correção

Ao testar `view_alternar_pausado_agenda` via HTTP (Bloco C da rodada de views, ver [[Checkpoint Testes Automatizados Agenda Videos]]), 5 dos 6 testes novos falharam com `NameError: name 'status_manual_atual_do_produto' is not defined` em `views.py:433` — a própria função criada na resolução acima.

**Causa raiz:** quando o fix de 10:12 foi entregue, a instrução de adicionar `status_manual_atual_do_produto` ao bloco de import de `agenda_videos/models` dentro de `views.py` foi passada em PROSA ("adicione a função X à lista de import"), e não como diff exato (Localize/Substitua). Essa instrução nunca chegou a ser aplicada de fato no arquivo do usuário — diferente dos outros 2 call sites (`historico_roadmap.py`, `sincronizar_roadmap_agenda.py`), que foram corrigidos com diff exato e passaram sem problema.

**Por que ficou escondido a sessão inteira:** `view_alternar_pausado_agenda` é o ÚNICO lugar de `views.py` que usa essa função — e nenhum teste exercitava essa view até o Bloco C, várias rodadas de teste depois do fix original. O `NameError` só existe em tempo de execução (Python não valida import não usado em outro lugar do arquivo até a linha ser executada), então nenhum outro teste passando escondia ou revelava o problema.

**Resolução:** diff exato entregue pro bloco de import de `views.py`, acrescentando `status_manual_atual_do_produto` à lista de nomes importados de `agenda_videos.models`. Confirmado pelo usuário: **248 passed, 0 failed**.

**Lição travada:** correção de código em qualquer arquivo do usuário precisa SEMPRE ser entregue como diff exato (Localize/Substitua) ou arquivo completo — nunca descrita em prosa, mesmo pra uma mudança de 1 linha em import. Ver reforço em [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]].

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Modelo de Status e Entrada na Agenda]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
