---
tipo: decisao
dominio: 
status: resolvida
criado: 22/08/2026 14:20
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Cache de Detalhes de Arquivo no Snapshot e Cache de Sessao no Front-End Encerram o Piscar ao Reabrir Produto, Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo]
---

# Destaque e Abertura Automática da Etapa Atual no Portal do Drive

## O quê

Cada produto no Portal do Drive mostra 7 seções (Simples, Mensal 01-04, Trimestral 01-02), uma pra cada fase/ocorrência possível. Até 22/08/2026, as 7 apareciam todas do mesmo jeito, fechadas por padrão — a pessoa precisava saber de antemão (ou ir conferir na Agenda de Vídeos) qual delas era a etapa atual daquele produto antes de subir um vídeo. Esta mudança faz a seção da etapa atual vir **aberta automaticamente** e com uma **borda azul de destaque**, sem exigir nenhuma ação manual.

## Por quê

O sistema já sabe qual é a etapa atual de cada produto — é o mesmo dado (`CicloVideo.fase`/`numero_ocorrencia`) que a Agenda de Vídeos já usa. Não fazia sentido a pessoa "caçar" a seção certa entre 7 toda vez que fosse subir um vídeo, quando essa informação já existe pronta no banco.

## Decisões de design tomadas com o usuário

1. **Visual do destaque**: as outras 6 seções continuam todas visíveis (fechadas) — só a atual vem com borda diferente e já aberta. Rejeitada a opção de esconder as outras 6 atrás de um botão "ver todas".
2. **Dinamismo**: o destaque deve se atualizar sozinho, sem precisar reabrir o produto ou dar F5, sempre que uma ação na própria tela (upload ou exclusão de arquivo) fizer a etapa avançar.

## Como foi implementado

`_montar_contexto_card()` (`agenda_videos/views.py`) busca o `CicloVideo` atual do produto e marca, em cada uma das 7 linhas, `linha['atual'] = True` só na que bate com a fase/ocorrência do ciclo. O template (`estrutura_parcial_portal_drive_linha.html`) usa isso pra abrir o `<details>` daquela linha (`open`) e aplicar a classe `portal-drive-linha-fase--atual` (borda esquerda azul, `layout_portal_drive.css`).

O dinamismo saiu de graça: toda ação de upload/exclusão no Portal do Drive já reverifica o Drive (`verificar_produto_no_drive`) e re-renderiza o card inteiro via HTMX — bastou fazer esse re-render já calcular a etapa atual de novo, sem nenhuma peça nova de infraestrutura.

**Limitação assumida conscientemente**: o destaque só se atualiza sozinho por ações feitas NA PRÓPRIA tela do Portal do Drive. Se a etapa avançar por outro caminho (ex: ação na tela da Agenda de Vídeos em outra aba, ou sincronização em massa rodando em paralelo), o destaque só reflete isso na próxima ação feita aqui ou ao reabrir o produto do zero — fazer isso reagir a mudanças de fora exigiria polling (checagem periódica do servidor), custo considerado desproporcional ao ganho pro caso de uso real.

## 2 bugs reais encontrados e corrigidos ao validar com dado real

Nenhum dos 2 foi pego na 1ª entrega — só apareceram testando manualmente com produtos reais (Higienizador Líquido/QUIMIVIDA e Pulverizador SS20/BRUDDEN).

### 1. `numero_ocorrencia` do Simples nunca é `None` no banco — comparação direta sempre falhava

A 1ª versão comparava `ciclo_atual.numero_ocorrencia == numero`, onde `numero` vem de `FASES_E_NUMEROS` e é `None` pra Simples (convenção só da camada visual, pra não numerar Simples na tela). Só que no banco, `CicloVideo.numero_ocorrencia` é `PositiveIntegerField` — o ciclo de Simples é criado com `numero_ocorrencia=1` de verdade (`CicloVideo.iniciar_agenda()`), nunca `None`. Resultado: a comparação virava `1 == None`, sempre falso — a seção "Simples" nunca era marcada como atual, mesmo quando era. Corrigido comparando contra `numero or 1` em vez de `numero` cru.

### 2. Produto sem nenhum `CicloVideo` ainda (nunca postou nada) não destacava nenhuma seção

Um produto que nunca teve nenhum arquivo confirmado no Drive não tem `CicloVideo` nenhum no banco — esse registro só nasce quando o Drive confirma o 1º Base pronto. Com `ciclo_atual = None`, a lógica original não marcava seção nenhuma como atual, mesmo sendo óbvio que "Simples" é o ponto de partida de qualquer produto novo. Corrigido tratando a ausência de ciclo como equivalente a "Simples, ocorrência 1" só pra fins de destaque (nunca cria um `CicloVideo` de verdade por causa disso — é só uma leitura, sem efeito colateral no banco).

### 3. (achado de UX, não bug de lógica) Reabrir o MESMO produto sem fechar/abrir outro no meio não atualizava o destaque

O Portal do Drive já tinha uma otimização de cache no navegador (ver [[Cache de Detalhes de Arquivo no Snapshot e Cache de Sessao no Front-End Encerram o Piscar ao Reabrir Produto]]): fechar e reabrir o MESMO produto (sem abrir outro no meio) reaproveita o HTML já carregado, sem nova requisição ao servidor — então, se a pessoa tivesse fechado manualmente a seção da etapa atual antes, ela continuava fechada na reabertura, porque nenhum re-render aconteceu pra corrigir isso. Corrigido em `script_portal_drive.js`: a seção com a classe `portal-drive-linha-fase--atual` é forçada a abrir (`.open = true`) tanto depois de uma carga real (`htmx:afterSwap`) quanto ao reabrir o mesmo produto reaproveitando o HTML em cache — sem gastar nenhuma chamada nova ao Drive ou ao banco nos 2 casos.

## Estado

Confirmado funcionando pelo usuário com 2 produtos reais em cenários opostos: um já com Simples completo (3/3 arquivos, `CicloVideo` existente) e outro nunca sincronizado (sem `CicloVideo`, pasta não encontrada no Drive). Ainda não commitado.

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Cache de Detalhes de Arquivo no Snapshot e Cache de Sessao no Front-End Encerram o Piscar ao Reabrir Produto]]
- [[Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo]]
