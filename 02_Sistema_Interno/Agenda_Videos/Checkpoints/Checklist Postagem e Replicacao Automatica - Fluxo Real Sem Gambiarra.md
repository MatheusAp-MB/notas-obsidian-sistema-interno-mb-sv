---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 13/08/2026
atualizado_em: 13/08/2026 01:00
relacionado: [Flag Temporaria de Confirmacao em Replicar Video no ML, Fluxo Manual Antes do Automatizado, Percentual de Replicacao por Produto e Geral, Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser, Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual, Contexto Geral - Retomada em Outro Computador (Agenda de Videos), Checkpoint Testes Automatizados Agenda Videos]
---

# Checklist Postagem e Replicação Automática — Fluxo Real Sem Gambiarra

> Pedido do usuário (12-13/08/2026): "gerar um checklist completo e coeso de tudo que falta para terminar a postagem automática e replicar automaticamente, sem 'gambiarras', usando o botão direto do HTML, a integração com o Drive, e todo o sistema corretamente" — com intenção de terminar isso em 13/08/2026.
>
> Diferente das notas anteriores sobre este tema (que registravam decisões pontuais), esta nota nasce como **checkpoint** — o estado corrente de "o que falta pra fechar a automação ponta a ponta", pra ser atualizada NO LUGAR a cada sessão até `status` virar `concluido`.
>
> Base: leitura direta do código real do repositório (clone sincronizado em 13/08/2026, branch `dev`, commit mais recente `643db79`), não suposição a partir do vault. Cada afirmação abaixo foi confirmada lendo o arquivo real na hora.

## Resumo do que já é real (não é gambiarra)

O caminho do botão no HTML até a automação no Mercado Livre já é 100% real, sem atalho, sem mock, sem placeholder — confirmado lendo os 5 elos da cadeia:

1. **Botão HTML** (`estrutura_agenda_videos.html`, tela "Aguardando Postar/Replicar") — `hx-get` pras rotas `agenda_videos_confirmar_postagem_automatica`/`agenda_videos_confirmar_replicacao_automatica`, condicionado à sub-aba certa (Postar/Replicar), lado a lado com "Verificar Todos no Drive" (redesenho de 12-13/08).
2. **Fluxo Django real** (`agenda_videos/views.py`) — `confirmar_*` → modal → `iniciar_*` cria `ExecucaoPostagemAutomatica`/`ExecucaoReplicacaoAutomatica` + os itens de verdade no banco (via `listar_produtos_elegiveis()`/`listar_produtos_agenda_filtrados()`, já usando o modelo Período×Etapa atual, sem resíduo do modelo antigo) → redireciona pra tela de progresso.
3. **Ponte HTML → agente local** — a própria tela de progresso (`estrutura_progresso_postagem_automatica.html`/`..._replicacao_automatica.html`) tem um `fetch('http://127.0.0.1:5678/executar[-replicacao]/<id>', {method: 'POST'})` que chama direto o agente local rodando na bandeja do Windows. Nenhum passo manual de copiar ID ou rodar script à parte.
4. **API que o agente consome** (`api/postagem_automatica/`, `api/replicacao_automatica/`) — token real (`api/autenticacao.py`), reaproveita 100% a lógica de negócio já validada (`resolver_arquivo_da_ocorrencia()`, `ArquivadorDrive`, `_obter_outros_mlbs()` via `VariacaoAnuncioMercadoLivre`) — não duplica regra nova.
5. **Automação de verdade no Mercado Livre** (`agente_local/postagem_ml.py`, `replicacao_ml.py`) — via `pywinauto`, clique real (`click_input()`, `isTrusted=True`), 3 checkpoints de confirmação, F8/F9 pra iniciar/cancelar, heartbeat a cada 10s.

Isso é o que faz esse checklist ser "terminar", não "construir do zero" — a arquitetura está pronta. O que falta são pontas específicas, listadas nos blocos abaixo.

## Bloco 1 — Aplicar a trava de segurança que falta na Replicação (bloqueia o resto)

**Estado real confirmado em `agente_local/replicacao_ml.py` (linha 161):** `botao_escolher.click_input()` roda incondicionalmente, sem nenhuma flag — clique real em "Escolher anúncios", decisão antiga de 30/07 ("a Replicação vai até o fim sozinha", comentário ainda no topo do arquivo). A Postagem (`postagem_ml.py`) já para antes do clique final (3 checkpoints + `posicionar_mouse_com_seguranca`); a Replicação, não.

A decisão mais nova do usuário (05/08, capturada por completo em [[Flag Temporaria de Confirmacao em Replicar Video no ML]]) pede o mesmo padrão de segurança pra Replicação. O diff dos 4 blocos já está pronto nessa nota — falta só aplicar:

- [ ] `agente_local/replicacao_ml.py` — atualizar comentário do topo + import de `posicionar_mouse_com_seguranca`; adicionar `confirmar_de_verdade=False` na assinatura de `replicar_video_no_ml(mlb, outros_mlbs, janela_handle, confirmar_de_verdade=False)`; trocar o clique final por: clica de verdade só se `confirmar_de_verdade` for `True`, senão chama `posicionar_mouse_com_seguranca(botao_escolher, _log)` (mesma função já usada em `postagem_ml.py`).
- [ ] `agente_local/servidor_agente.py` — no call site dentro de `_processar_execucao_replicacao` (linha ~310, chamada a `replicar_video_no_ml(...)`), passar `confirmar_de_verdade=True` explicitamente — sem isso, a Replicação em produção pararia de clicar de verdade sem ninguém decidir isso de propósito.
- [ ] Criar `scripts_dev/testar_fluxo_real_replicacao_sem_clicar.py` — script espelho de `scripts_dev/testar_fluxo_real_ml_sem_clicar.py`, conteúdo completo já escrito na nota da flag, chamando `replicar_video_no_ml(..., confirmar_de_verdade=False)`.

## Bloco 2 — Validar os 2 fluxos parando antes do clique real (depende do Bloco 1)

- [ ] Rodar `scripts_dev/testar_fluxo_real_ml_sem_clicar.py` (Postagem) — existe e está commitado desde 06/08, mas **nunca foi executado nem 1 vez**.
- [ ] Rodar o script novo de Replicação criado no Bloco 1 — 1ª execução só é possível depois da flag aplicada.
- [ ] Só decidir se o clique real da Replicação continua ligado por padrão (ou se passa a exigir confirmação manual, como a Postagem) depois de ver as 2 telas reais funcionando sem clicar.

## Bloco 3 — Rodar o fluxo real ponta a ponta pelo botão do HTML (depende do Bloco 2 pra Replicação; Postagem pode rodar já)

- [ ] Confirmar que `agente_local/servidor_agente.py` está rodando na máquina certa (ícone verde na bandeja), com `agente_config.env` válido (`SERVIDOR=...` + `TOKEN=...`) — **não existe template desse arquivo no repositório**; a configuração hoje é manual/tribal. Se for reinstalar ou trocar de máquina, documentar esse arquivo antes.
- [ ] Clicar "Iniciar Postagem Autônoma de Hoje" (aba Postar) de ponta a ponta: modal de confirmação → criação da execução → tela de progresso → F8 → acompanhar download real do Drive + automação real no ML até o Checkpoint 3 → confirmar manualmente o clique final (comportamento já é este de propósito).
- [ ] Clicar "Iniciar Replicação Automática de Hoje" (aba Replicar) de ponta a ponta — só depois do Bloco 1 aplicado e do Bloco 2 validado.

## Bloco 4 — Conferir o que o sistema faz depois de cada execução

- [ ] Confirmar que o produto avança pra "Aguardando Aprovação" depois da Postagem (`marcar_ciclo_atual_aguardando_aprovacao()` + `sincronizar_indicadores_agenda_produto()`, ambos já chamados em `api/postagem_automatica/views.py::view_marcar_concluido`).
- [ ] Confirmar que o vídeo baixado é movido de verdade pra pasta "usados" no Drive (`ArquivadorDrive.mover_para_usados()`).
- [ ] Confirmar no `replicacoes_realizadas.txt` (log manual, vive na pasta do agente, nunca no servidor) que os MLBs certos foram marcados na Replicação — único jeito de auditar hoje, não existe tela de histórico pra isso ainda.

## Bloco 5 — Fica registrado, mas não bloqueia terminar em 13/08

- [ ] **Percentual de Replicação** — falta campo novo (provável `quantidade_mlbs_produto` em `ItemExecucaoReplicacao`) + migração. Decisão pausada até rodar os 2 dry-runs do Bloco 2 — ver [[Percentual de Replicacao por Produto e Geral]].
- [ ] **Zero teste automatizado em `agente_local/`** (`postagem_ml.py`, `replicacao_ml.py`, `servidor_agente.py`, `cliente_api.py`, `posicionar_mouse_com_seguranca.py`, `controle_teclado.py`, `aviso_execucao.py`) — esperado, depende de UI real do Windows/Mercado Livre, não dá pra unit-testar. A única validação possível é o dry-run supervisionado do Bloco 2, por isso ele vem antes de rodar de verdade.
- [ ] **Empacotamento do agente (`.exe` via PyInstaller)** — não achei script de build nem `.spec` no repositório. Se o agente já está instalado e rodando em algum lugar, não bloqueia; se precisar reinstalar/atualizar numa máquina nova, precisa documentar esse processo (hoje é tribal).

## O que NÃO precisa ser feito (verificado, não é gap real)

- `resolver_arquivo_da_ocorrencia()` já usa o formato novo do parser (`.obter_fase()`/`.obter_ocorrencia()`/`.completo`) — bug antigo já corrigido, ver [[Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser]]. Confirmado lendo o código real de novo nesta sessão.
- `listar_produtos_elegiveis()` (Postagem) já usa o modelo atual (`indicadores_agenda__etapa_atual='postar'`) — não ficou desatualizado depois da reestruturação de 12/08 em 6 telas.
- `_obter_outros_mlbs()` (Replicação) já resolve os MLBs irmãos corretamente via `VariacaoAnuncioMercadoLivre`, excluindo o MLB de origem.
- Os botões do HTML já aparecem só na sub-aba certa (Postar/Replicar) da tela "Aguardando Postar/Replicar" — não é preciso nenhum ajuste de visibilidade.

## Próximo passo imediato

Bloco 1 primeiro — é o único item que bloqueia todo o resto. Depois disso, Blocos 2, 3 e 4 em sequência no mesmo dia são realistas (nenhum deles precisa de código novo, só execução real supervisionada).

## Relacionado

- [[Flag Temporaria de Confirmacao em Replicar Video no ML]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Percentual de Replicacao por Produto e Geral]]
- [[Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser]]
- [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
