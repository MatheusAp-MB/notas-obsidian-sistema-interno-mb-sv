---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 18/08/2026
atualizado_em: 25/08/2026 10:50
relacionado: [Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao), Contexto Geral - Retomada em Outro Computador (Agenda de Videos), Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra, Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre, Flag Temporaria de Confirmacao em Replicar Video no ML, MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma, Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos, Padrao de Robustez para Clientes de API Externa, Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural, Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]
---

> [!warning] Pausado em 22/08/2026, 14h35 — retomar as Etapas 2/4 só de volta no escritório
> Sessão de hoje (22/08, de casa) fechou de vez a frente paralela do Portal do Drive (testes + destaque de etapa atual, ver [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]) e corrigiu o bug do "já postou hoje" (fora desta frente, ver [[Checagem de Ja Postou Hoje Usa Ultimo Dia Util e Pode Nao Reconhecer Postagem Feita em Fim de Semana]]). As Etapas 2-4 desta nota (Postagem correta, Aprovação no ML, Replicação) **continuam exatamente como estavam em 18/08** — nenhum código novo foi escrito hoje pra elas. Motivo de não avançar: de casa, o acesso de hoje era só API do Mercado Livre (sem o site) e API+acesso ao Drive — as Etapas 2-4 dependem de automação real no SITE do ML (`agente_local`, Selenium/Tkinter contra a tela de verdade), que não roda sem esse acesso. **Decisão do usuário**: retomar esta frente (começando pelo "Achado central" — identificação de empresa no agente local) quando estiver de volta no escritório, com acesso ao site.

> [!success] Retomado em 25/08/2026, 09h47 — Achado central implementado e testado; Etapas 2 e 4 avançaram, mas ainda dependem de validação real no ML
> De volta ao escritório, com acesso ao site do ML. O "Achado central" (seção abaixo) foi implementado nas 4 partes já desenhadas, mais um refactor extra de testabilidade em `agente_local/servidor_agente.py` (guarda `if __name__ == '__main__':`, sem mudar nenhum comportamento em produção) e uma rodada completa de testes: 45 testes existentes corrigidos + 4 arquivos novos + `pyproject.toml` com escopo de cobertura ampliado. **Confirmado de verdade na máquina real do usuário: 760 passed, 3 failed (pré-existentes e sem relação — 2 por pasta real do Drive da Samvale vazia hoje, 1 em `impostos`, domínio pausado), 19 xfailed.** `core/middleware.py` e `core/empresa.py` fecharam em 100% de cobertura. **Por segurança, nenhum clique real foi feito no ML** — nesta sessão, tanto `postar_video_no_ml()` quanto `replicar_video_no_ml()` foram chamados com `confirmar_de_verdade=False` temporário (marcado `[TEMPORÁRIO — 25/08]` no código) — ou seja, além da Replicação (já era `False` desde 13/08), a Postagem também está temporariamente com a trava ligada, mesmo já tendo virado 100% autônoma antes (ver [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]). Reverter os 2 pra `True` só depois que o usuário validar 1 execução real completa por empresa, nos 2 fluxos. Detalhe completo de tudo isso na seção "Achado central" e no checklist de execução, ambos abaixo, já atualizados.

> [!warning] Pausado de novo em 25/08/2026, 10h50 — bloqueado, não é mais "só falta validar"
> Validação real no navegador foi iniciada na mesma sessão de hoje: 1 produto Magazine testado com IP correto do `.exe` reempacotado, automação chegou até o Checkpoint 2 de `postar_video_no_ml()` (upload do vídeo confirmado na tela do ML). Dois achados no caminho, nenhum deles bug de código: (1) o Mercado Livre atualizou o layout da tela de criar vídeo — `postagem_ml.py` vai precisar de ajuste nos textos/controles esperados (`NOMES_BOTAO_UPLOAD`/`NOMES_BOTAO_ENVIAR`), ainda não diagnosticado com precisão (log da execução real ainda não analisado); (2) **achado maior, motivo real desta pausa**: pra seguir testando Postagem/Replicação de ponta a ponta, o sistema precisa do MLB e de outros dados de produto vindos DE VERDADE da API do Mercado Livre — hoje esse dado ainda vem de JSON importado manualmente de um projeto separado (fluxo antigo), porque a integração oficial da API do ML pra dentro do `Projeto_Sistema_Interno_V2` (decisão já tomada, ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]) nunca foi terminada — ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]], retomada agora nesta mesma data/hora. **Etapas 2 e 4 desta nota ficam bloqueadas** até essa integração avançar o suficiente pra fornecer dado real de produto/MLB — não é mais só "falta 1 execução real", é uma dependência de outra frente inteira. Continuação do trabalho a partir de agora vive na nota linkada acima, domínio `04_Integracao_Mercado_Livre`.

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

## Etapa 3 — Análise da tela do Mercado Livre pra saber se o vídeo foi aprovado

**O quê**: hoje isso é só uma ideia registrada, ainda sem decisão de design — ver [[Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre]]. Os 4 estados reais já foram confirmados manualmente na tela "Meus Vídeos" do Mercado Livre: **EM REVISÃO**, **PUBLICADO**, **RECUSADO**, **PAUSADO**.

**Por quê**: hoje não existe nenhum jeito automático de saber se um vídeo postado foi aprovado ou recusado pelo Mercado Livre — alguém precisa checar manualmente na tela do ML. Isso importa especialmente porque a Replicação Automática (Etapa 4) só deve replicar vídeo que já foi aprovado — replicar um vídeo recusado espalharia o mesmo problema pra todos os outros MLBs do produto.

**Como** (ainda em aberto, decisão de design pendente antes de codar):
- Decidir o modelo de interação: botão manual ("Verificar aprovação") ou checagem automática periódica (rodando junto do agente local ou de outro jeito).
- Decidir o seletor real de automação na tela "Meus Vídeos" do ML (ainda não mapeado) — mesmo tipo de trabalho já feito pra `postar_video_no_ml`/`replicar_video_no_ml` em `agente_local/`.
- Essa etapa PRECISA já nascer com a empresa correta em mente (usar o mesmo padrão de token por conta — `MB_`/`SV_` — que o Mercado Livre já usa em `gerenciador_token.py`, nunca hardcoded pra 1 conta só).

**Critério de pronto**: o sistema sabe dizer, pra qualquer vídeo postado de qualquer 1 das 2 empresas, em qual dos 4 estados ele está agora, sem precisar abrir o ML manualmente pra descobrir.

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
| **3 — Aprovação/Recusa no ML** | Modelo de interação + seletor de automação ainda não decididos | ⏳ Decisão de design pendente — nada codado ainda |
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
