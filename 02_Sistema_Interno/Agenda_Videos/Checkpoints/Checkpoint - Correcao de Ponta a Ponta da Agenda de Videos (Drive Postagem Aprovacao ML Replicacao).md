---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 18/08/2026
atualizado_em: 27/08/2026 16:58
relacionado: [Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao), Contexto Geral - Retomada em Outro Computador (Agenda de Videos), Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra, Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre, Flag Temporaria de Confirmacao em Replicar Video no ML, MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma, Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos, Padrao de Robustez para Clientes de API Externa, Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural, Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]
---

> [!warning] Pausado em 22/08/2026, 14h35 — retomar as Etapas 2/4 só de volta no escritório
> Sessão de hoje (22/08, de casa) fechou de vez a frente paralela do Portal do Drive (testes + destaque de etapa atual, ver [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]) e corrigiu o bug do "já postou hoje" (fora desta frente, ver [[Checagem de Ja Postou Hoje Usa Ultimo Dia Util e Pode Nao Reconhecer Postagem Feita em Fim de Semana]]). As Etapas 2-4 desta nota (Postagem correta, Aprovação no ML, Replicação) **continuam exatamente como estavam em 18/08** — nenhum código novo foi escrito hoje pra elas. Motivo de não avançar: de casa, o acesso de hoje era só API do Mercado Livre (sem o site) e API+acesso ao Drive — as Etapas 2-4 dependem de automação real no SITE do ML (`agente_local`, Selenium/Tkinter contra a tela de verdade), que não roda sem esse acesso. **Decisão do usuário**: retomar esta frente (começando pelo "Achado central" — identificação de empresa no agente local) quando estiver de volta no escritório, com acesso ao site.

> [!success] Retomado em 25/08/2026, 09h47 — Achado central implementado e testado; Etapas 2 e 4 avançaram, mas ainda dependem de validação real no ML
> De volta ao escritório, com acesso ao site do ML. O "Achado central" (seção abaixo) foi implementado nas 4 partes já desenhadas, mais um refactor extra de testabilidade em `agente_local/servidor_agente.py` (guarda `if __name__ == '__main__':`, sem mudar nenhum comportamento em produção) e uma rodada completa de testes: 45 testes existentes corrigidos + 4 arquivos novos + `pyproject.toml` com escopo de cobertura ampliado. **Confirmado de verdade na máquina real do usuário: 760 passed, 3 failed (pré-existentes e sem relação — 2 por pasta real do Drive da Samvale vazia hoje, 1 em `impostos`, domínio pausado), 19 xfailed.** `core/middleware.py` e `core/empresa.py` fecharam em 100% de cobertura. **Por segurança, nenhum clique real foi feito no ML** — nesta sessão, tanto `postar_video_no_ml()` quanto `replicar_video_no_ml()` foram chamados com `confirmar_de_verdade=False` temporário (marcado `[TEMPORÁRIO — 25/08]` no código) — ou seja, além da Replicação (já era `False` desde 13/08), a Postagem também está temporariamente com a trava ligada, mesmo já tendo virado 100% autônoma antes (ver [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]). Reverter os 2 pra `True` só depois que o usuário validar 1 execução real completa por empresa, nos 2 fluxos. Detalhe completo de tudo isso na seção "Achado central" e no checklist de execução, ambos abaixo, já atualizados.

> [!warning] Pausado de novo em 25/08/2026, 10h50 — bloqueado, não é mais "só falta validar"
> Validação real no navegador foi iniciada na mesma sessão de hoje: 1 produto Magazine testado com IP correto do `.exe` reempacotado, automação chegou até o Checkpoint 2 de `postar_video_no_ml()` (upload do vídeo confirmado na tela do ML). Dois achados no caminho, nenhum deles bug de código: (1) o Mercado Livre atualizou o layout da tela de criar vídeo — `postagem_ml.py` vai precisar de ajuste nos textos/controles esperados (`NOMES_BOTAO_UPLOAD`/`NOMES_BOTAO_ENVIAR`), ainda não diagnosticado com precisão (log da execução real ainda não analisado); (2) **achado maior, motivo real desta pausa**: pra seguir testando Postagem/Replicação de ponta a ponta, o sistema precisa do MLB e de outros dados de produto vindos DE VERDADE da API do Mercado Livre — hoje esse dado ainda vem de JSON importado manualmente de um projeto separado (fluxo antigo), porque a integração oficial da API do ML pra dentro do `Projeto_Sistema_Interno_V2` (decisão já tomada, ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]) nunca foi terminada — ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]], retomada agora nesta mesma data/hora. **Etapas 2 e 4 desta nota ficam bloqueadas** até essa integração avançar o suficiente pra fornecer dado real de produto/MLB — não é mais só "falta 1 execução real", é uma dependência de outra frente inteira. Continuação do trabalho a partir de agora vive na nota linkada acima, domínio `04_Integracao_Mercado_Livre`.

> [!success] Retomado em 27/08/2026 — foco 100% nas 3 automações (Postagem/Verificação/Replicação), usuário já tinha o dado de MLB que faltava
> O motivo do desvio de 25/08 10h50 (falta de MLB real vindo da API do ML) deixou de bloquear — usuário já tinha os dados que precisava. Escopo retomado e travado nestas palavras: *"Foco agora será 100%: Deixar a Agenda de vídeos correta e funcional, e liberar o uso dela para a equipe. Precisamos finalizar: Postagem autônoma. Verificação de aprovação autônoma. Replicação autônoma."* **Decisão permanente confirmada pro usuário durante toda a validação**: pasta de testes do Drive (`GOOGLE_DRIVE_PASTA_TESTE_MAGAZINE`/`_SAMVALE`) e `confirmar_de_verdade=False` continuam ativos nos 3 fluxos até o usuário decidir encerrar a validação — nenhum dos 2 deve ser revertido sozinho. Detalhe completo desta sessão (bug real de OAuth do Drive corrigido, Etapa 3 desenhada/construída/validada em Fase 1) nas seções de Etapa 2 e Etapa 3 abaixo, já atualizadas.

# Checkpoint — Correção de Ponta a Ponta da Agenda de Vídeos (Drive → Postagem → Aprovação ML → Replicação)

> [!important] Objetivo desta frente (decisão do usuário, 18/08/2026 10h11)
> Corrigir a Agenda de Vídeos de ponta a ponta — desde a integração com o Google Drive até a replicação correta dos vídeos — com 1 regra fixa acima de qualquer detalhe técnico: **"TUDO que uma empresa faz, a outra também faz. Samvale e Magazine devem ter o fluxo completo."** Nenhuma etapa abaixo é "só Magazine por enquanto" — todas precisam funcionar pras 2 empresas antes de serem consideradas prontas.

## Por que esta frente existe (o que já sabíamos antes de hoje)

A arquitetura de 2 empresas — banco de dados separado por empresa, escolhido por sessão de navegador ou `--empresa` em comando de terminal — foi implementada e validada com dado real na noite de 17/08/2026 (ver [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]). Só que essa migração **não tocou em nenhum arquivo da Agenda de Vídeos** — confirmado lendo o `git diff` real entre o commit anterior e o commit da migração: zero linha alterada dentro de `agenda_videos/`, `agente_local/` ou `api/postagem_automatica/`. Ou seja: o Drive, a Postagem Automática, a Replicação Automática e o agente local continuam, hoje, exatamente como estavam antes de existir uma 2ª empresa — pensados só pra Magazine, sem nenhuma noção de "qual empresa é isso".

## Achado central — leia isto antes de qualquer etapa abaixo

> [!danger] O agente local não sabe, hoje, qual empresa está processando — e isso pode misturar dado das 2 empresas, não só "sempre virar Magazine"
> O fluxo real é: você clica "Postar" no navegador (aí a `ExecucaoPostagemAutomatica` nasce no banco certo, porque a sessão do navegador já sabe a empresa) → a página chama, via JavaScript, o agente local rodando na sua máquina (`http://127.0.0.1:5678/executar/<id>`) → o agente liga de volta pra API do Django (`api/postagem_automatica/...`) usando só um token fixo, **sem sessão nenhuma**.
>
> O problema: `core/middleware.py`, no `EmpresaMiddleware`, faz isto pra **toda** requisição, inclusive as da API:
> ```python
> empresa = request.session.get('empresa_ativa', EMPRESA_PADRAO)
> ```
> Sem sessão, isso sempre cai no valor padrão (Magazine) — sem erro, sem aviso. E como cada empresa tem seu próprio banco, os "ids" de execução **não são únicos entre as 2 empresas** (a execução #3 da Samvale e a execução #3 da Magazine podem ser 2 coisas completamente diferentes). Resultado possível: o agente local pensa que está processando a Samvale, mas a API sempre olha pro banco da Magazine — podendo devolver o vídeo/produto errado, de outra empresa, sem nenhum erro visível.
>
> Esse achado atravessa as Etapas 1, 2 e 4 abaixo — a correção dele é o mesmo bloco de trabalho pras 3, não 3 correções separadas.

### A correção deste achado central, em 4 partes (mesmo bloco, serve pras Etapas 1/2/4)

| Parte | Arquivo | O que muda |
|---|---|---|
| 1 | `agenda_videos/templates/agenda_videos/estrutura_progresso_postagem_automatica.html` e a versão de replicação | O `fetch('http://127.0.0.1:5678/executar/...')` passa a mandar a empresa ativa junto — usando `{{ empresa_ativa }}`, que **já existe** em todo template via `core/context_processors.py` (é o mesmo dado que alimenta o selo fixo da tela). |
| 2 | `agente_local/servidor_agente.py` | As rotas `/executar/<id>` e `/executar-replicacao/<id>` passam a receber essa empresa e repassar pra `_processar_execucao`/`_processar_execucao_replicacao`. |
| 3 | `agente_local/cliente_api.py` | As ~10 funções que chamam a API do Django (listar itens, baixar vídeo, marcar concluído/falhou, heartbeat, finalizar — pros 2 fluxos, Postagem e Replicação) passam a mandar essa empresa num cabeçalho novo (`X-Empresa`), mesmo padrão que já existe aqui pra `X-Drive-File-Id`. |
| 4 | `core/middleware.py` | Pra rotas que começam com `/api/`, o `EmpresaMiddleware` para de confiar em `request.session` (que nunca existe nessas chamadas) e passa a EXIGIR o cabeçalho `X-Empresa` — recusando a chamada com erro claro se não vier, nunca um valor padrão silencioso. Mesmo espírito do `--empresa` obrigatório já usado nos comandos de terminal (`core/management/commands/_base_empresa.py`). |

> [!success] Implementado e testado — 25/08/2026, 09h47
> As 4 partes acima foram aplicadas exatamente como desenhado. Junto, `agente_local/servidor_agente.py` ganhou uma guarda `if __name__ == '__main__':` (nada em produção muda — só o que corre ao importar o módulo, que antes abria log real, lia config do disco e travava num loop do `pystray` só de ser importado, tornando o arquivo impossível de testar). Testes: 45 arquivos/testes existentes corrigidos pra mandar `X-Empresa`; 4 arquivos novos (`core/tests/test_nivel_2__empresa_middleware.py`, `core/tests/test_nivel_2__autenticacao_middleware.py`, `core/tests/test_nivel_0__empresa.py`, `agente_local/tests/test_nivel_4__servidor_agente_rotas.py`); `pyproject.toml` com o `source` do coverage ampliado pra incluir `core`/`api`/`agente_local` (antes só media `agenda_videos`). **Confirmado na máquina real do usuário: 760 passed, 3 failed pré-existentes/sem relação, 19 xfailed** — `core/middleware.py` e `core/empresa.py` em 100% cover. Falta só a validação real (clique de verdade no ML) — ver Etapas 2 e 4 abaixo.

> [!info] Por que isso também resolve o Drive "de graça" dentro da automação
> O download/arquivamento de vídeo (`ArquivadorDrive`, `LocalizadorArquivosProduto`) roda DENTRO do Django (no servidor), não na sua máquina — só a interface (Tkinter, teclado, clique no ML) roda no agente local. Corrigindo o middleware acima, `obter_empresa_ativa()` passa a responder certo também pras chamadas vindas do agente — então a separação de pasta do Drive (Etapa 1) já funciona automaticamente dentro da Postagem/Replicação Automática, sem precisar de nenhuma correção extra ali.

## Etapa 1 — Integração da Agenda com o Google Drive

**O quê**: hoje existe 1 credencial e 1 pasta raiz só (`GOOGLE_DRIVE_CREDENCIAIS_JSON`, `GOOGLE_DRIVE_PASTA_RAIZ_ID`, lidas direto em `projeto_sistema_interno_mb_sv/settings.py`), usadas identicamente pras 2 empresas. Confirmado com o usuário: a credencial/conta do Google é a MESMA pras 2 empresas (mesmo e-mail, mesma API) — a única diferença real são 2 pastas raiz diferentes já existentes no Drive, "Magazine Estruturada" e "Samvale Estruturada".

**Por quê**: sem isso, os vídeos das 2 empresas ficam misturados na visão do sistema — o mesmo EAN de produtos diferentes (1 da Magazine, 1 da Samvale) poderia colidir, e o `montar_arvore_por_ean()` (`agenda_videos/funcoes_auxiliares/drive/escaneador.py`) nunca saberia de qual das 2 árvores um arquivo realmente é.

**Como**: só 2 arquivos leem a pasta raiz hoje — `agenda_videos/funcoes_auxiliares/drive/localizador.py` (`_obter_pasta_marca`) e `agenda_videos/funcoes_auxiliares/drive/escaneador.py` (`sincronizar_snapshots_drive`). O `arquivador.py` (baixa/arquiva arquivo) nunca lê a pasta raiz direto — recebe o ID já resolvido de quem chama, não precisa de nenhuma mudança. Plano:
1. Trocar a variável única `GOOGLE_DRIVE_PASTA_RAIZ_ID` por 2 — nomes reais usados (o usuário já tinha atualizado o `.env` com esse padrão antes de eu escrever o código): `GOOGLE_DRIVE_PASTA_RAIZ_MAGAZINE` (Magazine Estruturada) e `GOOGLE_DRIVE_PASTA_RAIZ_SAMVALE` (Samvale Estruturada).
2. Criar 1 função de resolução em `agenda_videos/funcoes_auxiliares/drive/cliente.py` (`obter_pasta_raiz_id_ativa()`), usando `core.empresa.obter_empresa_ativa()` — mesma lógica que `api_sysemp/__init__.py` já usa pra resolver token/URL por empresa (ver [[Padrao de Robustez para Clientes de API Externa]]). Levanta erro explícito se chamada sem nenhuma empresa ativa definida — nunca devolve pasta arbitrária por engano.
3. Trocar as 2 leituras de `settings.GOOGLE_DRIVE_PASTA_RAIZ_ID` (em `localizador.py` e `escaneador.py`) por essa função nova.

**Critério de pronto**: `LocalizadorArquivosProduto`/`sincronizar_snapshots_drive` (usado por "Verificar Todos") devolvem árvores diferentes e corretas quando testados com a Magazine ativa e com a Samvale ativa, cada 1 só vendo sua própria pasta.

> [!success] Concluído — 18/08/2026 11h00
> Validado com dado real dos 2 lados: QUIMIVIDA (Magazine, EAN `0789888395162`) e Ortho Pauher (Samvale, EAN `7899947306688`) — cada 1 achando só a própria pasta raiz, isoladas uma da outra. Suíte: **37 passed, 0 failed**; `parser.py` em 100% cover. Achado corrigido no caminho: a equipe salva o arquivo de Roteiro no plural (`Simples_Roteiros.txt`), não no singular da convenção original — `parser.py` agora aceita as 2 formas sem perder rigidez no resto do formato (detalhe em [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]]). Os gaps de cobertura que sobraram no pacote `drive` (`arquivador.py`, e os ramos de "pasta não encontrada"/mimeType errado em `localizador.py`/`escaneador.py`) são código de escrita ou de borda que pertence à Etapa 2, não dívida desta etapa.

> [!info] Nota lateral (18/08, tarde) — trabalho novo em `arquivador.py`, mas de uma frente PARALELA, não desta Etapa 1
> Na mesma tarde, `arquivador.py` ganhou uma função nova de escrita real (`enviar_arquivo()`, upload manual de vídeo) — isso **não é parte desta Etapa 1** (que tratava só da leitura/resolução da pasta raiz por empresa) nem das Etapas 2-4 (que tratam do fluxo automático de Postagem/Replicação). É uma feature nova e independente, o "Portal do Drive" — ver [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]] pro detalhe completo, incluindo um bug de cota de armazenamento real encontrado e corrigido no caminho (ver [[Service Account Nao Tem Cota Propria no Drive - Upload Real Exige OAuth Como Usuario Real]]).

## Etapa 2 — Postagem correta dos vídeos

**O quê**: aplicar a correção do "Achado central" (tabela acima) na Postagem Automática especificamente, e validar o fluxo de ponta a ponta pras 2 empresas depois disso.

**Por quê**: sem a correção do achado central, a Postagem Automática da Samvale rodaria sobre dado da Magazine (ou falharia de forma imprevisível) — e mesmo o comportamento de "produção real" já decidido (`postar_video_no_ml(..., confirmar_de_verdade=True)`, ver [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]) nunca foi testado de ponta a ponta depois de virar autônomo — ver [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]].

**Como**: as 4 partes da tabela do "Achado central" + rodar 1 execução real completa (clicar Postar → agente local processa → vídeo sai postado no Mercado Livre certo) pra cada empresa, cada 1 no seu próprio ambiente/banco.

**Critério de pronto**: 1 execução de Postagem Automática real, completa, confirmada pra Magazine E 1 pra Samvale, cada uma postando no MLB certo, sem nenhuma mistura de dado entre as 2.

> [!info] Parcial — 25/08/2026, 09h47
> Achado central aplicado e testado de verdade (ver seção acima) — a parte de código está feita. Falta exatamente o critério de pronto: a execução real por empresa. Por segurança, `postar_video_no_ml()` está com `confirmar_de_verdade=False` temporário nesta sessão, então mesmo depois de aplicar o código o clique final continua NÃO acontecendo até essa flag ser revertida — a validação real (com clique de verdade) só deve rodar depois de reverter pra `True`.

> [!bug] Bug real encontrado e corrigido — 27/08/2026: OAuth do Drive expirado bloqueava a Postagem ANTES de chegar no ML
> Reteste real (log fresco, `agente_log_20260827_074425.txt`) revelou `RefreshError: invalid_grant — Token has been expired or revoked` dentro de `ArquivadorDrive.__init__()` → `obter_credenciais_drive_escrita()` — o refresh token OAuth de escrita do Drive (usado só pra baixar/mover vídeo, e-mail `financeiromagazinebrasileiro@gmail.com`) tinha expirado, derrubando a Postagem antes mesmo de abrir o navegador/ML. Não tem relação com o "Achado central" nem com o suspeito layout novo do ML — é 100% Drive/OAuth. **Corrigido rodando `autorizar_drive_oauth.py` de novo** (re-login manual, gera novo refresh token). Hipótese não confirmada da causa raiz (WebSearch fora do ar na sessão, não foi possível verificar): o OAuth Client no Google Cloud Console provavelmente segue em status "Testing", que expira todo refresh token em 7 dias — mudar pra "Production" resolveria de vez. **Usuário decidiu adiar essa decisão** ("depois eu vejo"). Depois do fix, o teste real não pôde continuar por **instabilidade do próprio Mercado Livre** (externo, sem relação com código) — **a suspeita de layout novo do ML (`NOMES_BOTAO_UPLOAD`/`NOMES_BOTAO_ENVIAR`) segue 100% não testada**, a automação nunca chegou a alcançar a tela de upload nesta rodada.

## Etapa 3 — Análise da tela do Mercado Livre pra saber se o vídeo foi aprovado

**O quê**: checar automaticamente, na tela "Meus Vídeos" do Mercado Livre, se o vídeo postado num MLB foi aprovado ou recusado. Os 4 estados reais confirmados na tela: **EM REVISÃO**, **PUBLICADO**, **RECUSADO**, **PAUSADO** — só os 2 primeiros são decisivos (Publicado→Aprovado, Recusado→Recusado); Em Revisão/Pausado são transitórios, sem ação nenhuma enquanto durarem (decisão confirmada com o usuário, 27/08).

**Por quê**: hoje não existe nenhum jeito automático de saber se um vídeo postado foi aprovado ou recusado pelo Mercado Livre — alguém precisa checar manualmente na tela do ML. Isso importa especialmente porque a Replicação Automática (Etapa 4) só deve replicar vídeo que já foi aprovado — replicar um vídeo recusado espalharia o mesmo problema pra todos os outros MLBs do produto.

**Como** (decisão de design fechada em 27/08/2026 — ver [[Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre]] pra ideia/dúvidas originais, 13/08):
- Modelo de interação: botão manual único **"Verificar Aprovação de Todos"**, no topo da tela "Aguardando Aprovação" — mesmo padrão de "Verificar Todos no Drive"/"Iniciar Postagem/Replicação de Hoje" (dispara todos os ciclos naquele status de uma vez, não 1 por 1).
- Seletor real mapeado com dado real do usuário (2 MLBs conhecidos, 1 Recusado/1 Aprovado): `https://vendedores.mercadolivre.com.br/video/creator/listing?page=1&item_id={mlb}` filtra pelo MLB, mas às vezes mostra 1 linha extra (possível MLBU/catálogo — usuário não tem 100% de certeza dessa causa). **Regra validada**: olhar SÓ a 1ª linha da lista (a mais recente), nunca casar pelo texto do MLB — mesmo princípio que `replicacao_ml.py` já usa pro "1º vertical_dots = vídeo mais recente".
- Sem API oficial do ML pra isso, confirmado — segue automação de tela (`pywinauto`), mesmo caminho de `postagem_ml.py`/`replicacao_ml.py`.
- Empresa correta: reaproveita o mesmo `?empresa=` na query string do fetch pro agente local, e a mesma trava de execução única (F8/F9) — nenhuma peça nova de infraestrutura, só a rota nova.

**Critério de pronto**: o sistema sabe dizer, pra qualquer vídeo postado de qualquer 1 das 2 empresas, em qual dos 4 estados ele está agora, sem precisar abrir o ML manualmente — E escreve essa decisão automaticamente no banco (Fase 2, ver abaixo).

> [!success] Fase 1 (leitura + console, sem escrita no banco) construída e validada com dado real — 27/08/2026
> Construída em 2 fases deliberadas, mesma disciplina de [[Fluxo Manual Antes do Automatizado]]: **Fase 1** = botão → agente local → console, **nenhuma escrita em `CicloVideo` ainda**. Arquivos novos: `agenda_videos/funcoes_auxiliares/verificacao_aprovacao.py` (lista ciclos Aguardando Aprovação com MLB conhecido), `agente_local/verificacao_ml.py` (`ler_estado_aprovacao`, a regra de "1ª linha" acima), rota `/verificar-aprovacao` em `agente_local/servidor_agente.py` (reaproveita `AvisoExecucao`/`ControleTeclado`/trava de execução única). Commit `668be77`, branch `dev`.
>
> Lógica de leitura validada 2x antes de virar rota de produção: 1ª vez via `scripts_dev/diagnosticar_tela_aprovacao.py` (revelou o achado da linha extra) e `scripts_dev/testar_leitura_estado_video_ml.py` (confirmou a regra corrigida, 2/2 casos reais OK). 2ª vez dentro do fluxo real: clicando o botão de verdade (não script solto) no `.exe` do agente, `MLB7508392688` (caso "Aprovado" conhecido) leu `PUBLICADO` corretamente.
>
> **2 bugs reais encontrados e corrigidos no caminho, valem registro pra qualquer sessão futura:**
> 1. CORS — a 1ª versão do botão mandava os MLBs em corpo JSON com `Content-Type` customizado, disparando checagem prévia (preflight) do navegador nunca exercitada antes por nenhuma rota do agente (Postagem/Replicação só usam POST simples, sem corpo). Corrigido voltando pro mesmo formato já validado: MLBs na própria query string, sem corpo, sem cabeçalho — igual `/executar`/`/executar-replicacao`.
> 2. **O agente local roda como `.exe` compilado (PyInstaller), não como `python servidor_agente.py` direto** — editar/commitar o `.py` não muda nada no `.exe` já aberto, precisa recompilar. Já registrado em 13/08 (ver [[Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]], que guarda o comando de build: `pyinstaller --onefile --noconsole --name AgenteLocalAgendaVideos --paths . --hidden-import=win32timezone --hidden-import=pystray._win32 agente_local/servidor_agente.py`), mas gerou confusão de novo — reforçar sempre: toda mudança em `agente_local/*.py` exige recompilar antes de valer, mesmo em teste.
>
> **Em andamento, não concluído**: validar a leitura com VÁRIOS MLBs em sequência numa única execução, incluindo o caso "Recusado" — usuário forneceu 3 MLBs reais com resultado conhecido (Aprovados: `MLB4857160797`, `MLB7508392688`; Recusado: `MLB5130142457`). Passo imediato: forçar os 3 ciclos correspondentes pra `status=AGUARDANDO_APROVACAO` via shell do Django (comando entregue em texto na conversa, ainda não confirmado como executado pelo usuário), depois clicar o botão 1 vez só e conferir as 3 linhas no console. Só depois disso avança pra **Fase 2** (escrever `marcar_aprovado`/`marcar_recusado` de verdade em `CicloVideo`, avançar o ciclo aprovado pra "Aguardando Replicar" — método novo espelhando `marcar_aguardando_aprovacao`/`marcar_replicado` já existentes). Falta também cobertura de teste automatizado pra rota nova e pro contexto novo (`itens_verificar_aprovacao`) — as rotas irmãs (`/executar`, `/executar-replicacao`) já têm suíte Nível 4 completa (`agente_local/tests/test_nivel_4__servidor_agente_rotas.py`), esta ainda não.

## Etapa 4 — Replicação correta dos vídeos

**O quê**: aplicar a correção do "Achado central" na Replicação Automática, resolver os 2 pontos que já estavam em aberto desde 13/08, e só depois validar de ponta a ponta pras 2 empresas.

**Por quê / o que já está pendente, de antes de hoje**:
- `agente_local/servidor_agente.py`, dentro de `_processar_execucao_replicacao`, ainda chama `replicar_video_no_ml(..., confirmar_de_verdade=False)` — flag de segurança **temporária**, criada em 13/08 pra evitar clique real durante teste (ver [[Flag Temporaria de Confirmacao em Replicar Video no ML]]). Precisa voltar pra `True` antes de qualquer uso real em produção.
- [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]] registra que o bug de elegibilidade da Replicação já foi corrigido, mas a validação ponta a ponta NUNCA foi confirmada — havia uma execução possivelmente travada em "Rodando" desde ~10:19 de 13/08, nunca confirmada como resolvida.

**Como**: as 4 partes do "Achado central" (a Replicação usa a mesma cadeia agente local → API) + resolver a execução travada de 13/08 (ou confirmar que ela não existe mais) + reverter `confirmar_de_verdade` pra `True` só quando o restante estiver validado.

**Critério de pronto**: 1 execução de Replicação Automática real, completa, confirmada pra Magazine E 1 pra Samvale, com `confirmar_de_verdade=True`, sem execução travada.

> [!info] Parcial — 25/08/2026, 09h47
> Achado central aplicado e testado de verdade (ver seção acima) — mesma cadeia agente local → API da Postagem. Ainda pendentes, sem mudança hoje: confirmar se a execução travada em "Rodando" desde ~10:19 de 13/08 ainda existe ou já se resolveu sozinha, e reverter `confirmar_de_verdade` pra `True` (nesta sessão ele continua `False`, por segurança, junto com o da Postagem) — só depois da validação real por empresa.

## Checklist de execução — status atual (atualizado em 25/08/2026, 09h47)

| Etapa | O que envolve | Status |
|---|---|---|
| **Achado central** (base das etapas 1/2/4) | 4 partes: template → `servidor_agente.py` → `cliente_api.py` → `core/middleware.py` | ✅ Implementado e testado — 760 passed, `core/middleware.py`/`core/empresa.py` 100% cover (falta validação com clique real no ML) |
| **1 — Drive** | `GOOGLE_DRIVE_PASTA_RAIZ_MAGAZINE`/`_SAMVALE` + função de resolução em `drive/cliente.py` + 2 pontos de leitura trocados | ✅ Concluído — 37 passed, Magazine e Samvale validados com dado real, isolados um do outro |
| **2 — Postagem** | Achado central aplicado + 1 execução real validada por empresa | 🔴 Bloqueada em 25/08, 10h50 — depende da integração real da API do ML ([[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]) pra ter MLB/dado de produto de verdade; também precisa de ajuste em `postagem_ml.py` pro layout novo do ML |
| **3 — Aprovação/Recusa no ML** | Fase 1 (botão→agente→console, só leitura) construída e validada com dado real; falta testar vários MLBs em sequência + Fase 2 (escrever no banco) | 🟡 Fase 1 concluída — commit `668be77` (falta cobertura de teste e Fase 2) |
| **4 — Replicação** | Achado central aplicado + execução travada de 13/08 resolvida + flag revertida pra `True` + validação por empresa | 🔴 Bloqueada em 25/08, 10h50 — mesma dependência da API do ML da Etapa 2; execução travada de 13/08 e reversão da flag continuam pendentes |

> [!info] Frente paralela, fora desta tabela — Portal do Drive
> O upload manual de vídeo pela tela do sistema (`enviar_arquivo()`, motor pronto e validado com dado real nesta mesma tarde de 18/08) é uma feature independente das 4 etapas acima — não conta nem pra Etapa 1 nem pra Etapa 2. Acompanhamento próprio em [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]].

## Relacionado

- [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
- [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]]
- [[Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre]]
- [[Flag Temporaria de Confirmacao em Replicar Video no ML]]
- [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]
- [[Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]]
- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
