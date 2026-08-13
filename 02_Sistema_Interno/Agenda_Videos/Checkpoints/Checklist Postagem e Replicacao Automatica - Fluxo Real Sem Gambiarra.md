---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 13/08/2026
atualizado_em: 13/08/2026 12:00
relacionado: [Flag Temporaria de Confirmacao em Replicar Video no ML, Fluxo Manual Antes do Automatizado, Percentual de Replicacao por Produto e Geral, Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser, Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual, Contexto Geral - Retomada em Outro Computador (Agenda de Videos), Checkpoint Testes Automatizados Agenda Videos, Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar, MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma, Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre]
---

# Checklist Postagem e Replicação Automática — Fluxo Real Sem Gambiarra

> Pedido do usuário (12-13/08/2026): "gerar um checklist completo e coeso de tudo que falta para terminar a postagem automática e replicar automaticamente, sem 'gambiarras', usando o botão direto do HTML, a integração com o Drive, e todo o sistema corretamente" — com intenção de terminar isso em 13/08/2026.
>
> Diferente das notas anteriores sobre este tema (que registravam decisões pontuais), esta nota nasce como **checkpoint** — o estado corrente de "o que falta pra fechar a automação ponta a ponta", pra ser atualizada NO LUGAR a cada sessão até `status` virar `concluido`.
>
> **Atualização (13/08/2026 12:00):** sessão longa de testes reais + descobertas + 2 decisões novas. Resumo rápido pra quem retomar: **Postagem está validada ponta a ponta e virou 100% autônoma** (não para mais antes do clique final — ver [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]). **Replicação segue sem validação real completa** — o bug de elegibilidade foi corrigido, mas a sessão mudou de foco antes de rodar 1 replicação de ponta a ponta com sucesso, e pode ter deixado 1 execução travada em "Rodando" (ver seção de pendências abaixo). `status` continua `em_andamento`.

## Resumo do que já é real (não é gambiarra)

O caminho do botão no HTML até a automação no Mercado Livre já é 100% real, sem atalho, sem mock, sem placeholder — confirmado lendo os 5 elos da cadeia:

1. **Botão HTML** (`estrutura_agenda_videos.html`, tela "Aguardando Postar/Replicar") — `hx-get` pras rotas `agenda_videos_confirmar_postagem_automatica`/`agenda_videos_confirmar_replicacao_automatica`, condicionado à sub-aba certa (Postar/Replicar), lado a lado com "Verificar Todos no Drive" (redesenho de 12-13/08).
2. **Fluxo Django real** (`agenda_videos/views.py`) — `confirmar_*` → modal → `iniciar_*` cria `ExecucaoPostagemAutomatica`/`ExecucaoReplicacaoAutomatica` + os itens de verdade no banco → redireciona pra tela de progresso.
3. **Ponte HTML → agente local** — a própria tela de progresso tem um `fetch('http://127.0.0.1:5678/executar[-replicacao]/<id>', {method: 'POST'})` que chama direto o agente local rodando na bandeja do Windows. Nenhum passo manual de copiar ID ou rodar script à parte.
4. **API que o agente consome** (`api/postagem_automatica/`, `api/replicacao_automatica/`) — token real (`api/autenticacao.py`), reaproveita a lógica de negócio já validada.
5. **Automação de verdade no Mercado Livre** (`agente_local/postagem_ml.py`, `replicacao_ml.py`) — via `pywinauto`, clique real (`click_input()`, `isTrusted=True`), checkpoints de confirmação, F8/F9 pra iniciar/cancelar, heartbeat a cada 10s.

## Bloco 1 — Trava de segurança na Replicação ✅ CONCLUÍDO

`replicacao_ml.py` ganhou `confirmar_de_verdade=False` (mesmo padrão de `postagem_ml.py`) — clica de verdade em "Escolher anúncios" só se `True`, senão só posiciona o mouse. `servidor_agente.py` passa `confirmar_de_verdade=False` no call site de produção **de propósito, temporariamente**, pra permitir os testes reais de hoje — comentário no código: `[TEMPORÁRIO — TESTE 13/08]... REVERTER pra True antes de usar de verdade em produção`. **Isso ainda não foi revertido — ver pendência no fim desta nota.**

O script gêmeo standalone (`scripts_dev/testar_fluxo_real_replicacao_sem_clicar.py`) nunca foi criado — não fez falta, porque a validação real acabou sendo feita direto pelo botão do HTML (ver Bloco 3), não pelos scripts standalone.

## Bloco 2 — Validar os 2 fluxos parando antes do clique real

**Postagem:** validada com sucesso, mas não pelo script standalone (`scripts_dev/testar_fluxo_real_ml_sem_clicar.py` continua nunca executado) — pelo fluxo real completo (Bloco 3). 3 bugs reais foram encontrados e corrigidos nesse processo (empacotamento `.exe` + automação) — ver [[Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]].

**Replicação:** **não validada.** `confirmar_de_verdade=False` está ativo e confirmado seguro (não clica de verdade), mas nenhuma execução de Replicação rodou até o fim com sucesso nesta sessão — ver pendência no fim desta nota.

Decisão sobre clique real da Replicação continuar padrão ou exigir confirmação manual: **ainda não tomada** — segue pendente, só que agora paralela a uma decisão relacionada: a Postagem deixou de exigir confirmação manual (ver Bloco 3).

## Bloco 3 — Rodar o fluxo real ponta a ponta pelo botão do HTML

- [x] `agente_local/servidor_agente.py` empacotado como `.exe` via PyInstaller — processo documentado (ver Bloco 5, fecha o gap tribal).
- [x] **Postagem** — "Iniciar Postagem Autônoma de Hoje" testado de ponta a ponta várias vezes, com sucesso, incluindo o Drive real (download + mover pra "usados/") e a Agenda avançando pra "Aguardando Aprovação".
  - **Mudança de comportamento decidida no meio do caminho:** a Postagem não para mais antes do clique final — agora clica de verdade em "Enviar vídeo" (decisão do usuário, ver [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]). **Essa nova versão autônoma foi aplicada no código (migração rodou sem erro), mas ainda não foi testada com uma execução real** — o próximo teste de Postagem precisa confirmar que o clique de verdade funciona e que o `mlb_postado` é gravado certo.
- [ ] **Replicação** — não concluído. Chegou a rodar (bug de elegibilidade encontrado e corrigido no meio do teste — ver [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]), mas a sessão mudou de foco antes de qualquer execução de Replicação terminar com sucesso.

## Bloco 4 — Conferir o que o sistema faz depois de cada execução

- [x] Confirmado — produto avança pra "Aguardando Aprovação" depois da Postagem (visto na tela real, Agenda atualizou).
- [x] Confirmado — vídeo baixado é movido de verdade pra pasta "usados" no Drive (usuário confirmou olhando o Drive real).
- [ ] `replicacoes_realizadas.txt` — não confirmado, nenhuma Replicação real concluiu ainda.

## Bloco 5 — Fica registrado

- [ ] **Percentual de Replicação** — ainda não iniciado.
- [ ] **Zero teste automatizado em `agente_local/`** — esperado, aceito (depende de UI real).
- [x] **Empacotamento do agente (`.exe` via PyInstaller)** — ✅ resolvido. Comando de build confirmado funcionando (rodado várias vezes com sucesso nesta sessão):
  ```
  pyinstaller --onefile --noconsole --name AgenteLocalAgendaVideos --paths . --hidden-import=win32timezone --hidden-import=pystray._win32 agente_local/servidor_agente.py
  ```
  Precisa rodar de novo depois de qualquer mudança em `agente_local/*.py`. Saída: `dist/AgenteLocalAgendaVideos.exe`.

## Novidade fora do escopo original — rastreamento do MLB postado

Durante os testes de Replicação, descobriu-se que o sistema não tinha nenhuma forma confiável de saber qual MLB de fato recebeu um vídeo postado manualmente (fora do sistema) — `obter_mlb_do_produto()` só chutava o `.first()` de `VariacaoAnuncioMercadoLivre`. Isso gerou 2 decisões novas, não previstas neste checklist original — ver [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]:

1. Campo novo `CicloVideo.mlb_postado`, capturado no clique manual (popup pedindo o MLB) e automaticamente na Postagem automática — usado pela Replicação como origem real, com badge novo no card ("Postado no MLB: X").
2. Postagem virou 100% autônoma (ver Bloco 3) — decisão do usuário, motivada exatamente por eliminar essa ambiguidade na origem.

Também surgiu, e ficou só explorada (não implementada), a ideia de checar automaticamente na tela do Mercado Livre se um vídeo foi aprovado/recusado — ver [[Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre]].

## Pendências reais deixadas em aberto (13/08, fim da sessão)

- **Possível execução de Replicação travada.** Durante os testes, apareceu 1 execução com status "Rodando" desde ~10:19 (produto "Tesoura Poda Árvores", 1 item cancelado), bloqueando novas tentativas ("Já existe uma execução em andamento"). Perguntei ao usuário se o ícone do agente estava verde (repouso) ou azul (ocupado), e pedi o log dessa execução — **essa pergunta nunca foi respondida**, a conversa seguiu direto pro bug de elegibilidade. **Precisa verificar isso antes de tentar rodar Replicação de novo** — se a execução ainda estiver "Rodando" no banco, vai bloquear tudo.
- **`confirmar_de_verdade=False` temporário em `servidor_agente.py` (Replicação) continua ativo.** Comentário no código já avisa: reverter pra `True` antes de considerar Replicação pronta pra produção de verdade — só depois de validar o fluxo real (Bloco 3).
- **Postagem autônoma (clique de verdade) ainda não testada com execução real** — código aplicado, migração rodou, mas nenhum teste de ponta a ponta rodou depois dessa mudança.
- **CSS do badge novo "Postado no MLB"** (`badge-postado-mlb`, no card do produto) está sem estilo próprio — herda o genérico `badge-tabela`.

## O que NÃO precisa ser feito (verificado, não é gap real)

- `resolver_arquivo_da_ocorrencia()` já usa o formato novo do parser — bug antigo já corrigido, ver [[Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser]].
- `listar_produtos_elegiveis()` (Postagem) já usa o modelo atual — não ficou desatualizado depois da reestruturação de 12/08 em 6 telas.
- `_obter_outros_mlbs()` (Replicação) já resolve os MLBs irmãos corretamente via `VariacaoAnuncioMercadoLivre`, excluindo o MLB de origem.
- Os botões do HTML já aparecem só na sub-aba certa (Postar/Replicar) da tela "Aguardando Postar/Replicar".

## Próximo passo imediato

1. Verificar/destravar a execução de Replicação travada em "Rodando" desde ~10:19.
2. Rodar Replicação de ponta a ponta com sucesso pelo menos 1 vez (fecha Bloco 3/4 pra Replicação).
3. Rodar Postagem de ponta a ponta pra validar o clique real autônomo + gravação correta do `mlb_postado`.
4. Decidir e reverter `confirmar_de_verdade` da Replicação pra `True` quando estiver pronta pra produção.

## Relacionado

- [[Flag Temporaria de Confirmacao em Replicar Video no ML]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Percentual de Replicacao por Produto e Geral]]
- [[Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser]]
- [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]]
- [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]
- [[Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre]]
