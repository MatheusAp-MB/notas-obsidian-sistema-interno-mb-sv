---
tipo: checkpoint
dominio: 
status: ativo
criado: 03/08/2026
atualizado_em: 20/08/2026 22:30
relacionado: [Estrutura e Convenções do Vault, Estrutura de Telas da Agenda de Videos, Mapa de Execucao das 5 Telas da Agenda de Videos, Pausa Para Replanejar UX de Filtros e Telas, Cache de Indicadores Nao e Populado Automaticamente, Checkpoint Testes Automatizados Agenda Videos, Fluxo Manual Antes do Automatizado, Modelo de Status e Entrada na Agenda, Disciplina de Testes Automatizados, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Perguntas Sempre em Texto Corrido, Perguntar Data e Hora Antes de Escrever no Vault, Validacao de Configuracoes Nao Abre Excecao Para Simples, Status Manual Atual Ignora Historico Quando Participacao Nao Existe, Botao de Verificar Drive Individual Tinha 3 Bugs Reais, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Listar Produtos Elegiveis Ignorava Simples Por Comparacao Com Null, Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser, Flag Temporaria de Confirmacao em Replicar Video no ML, Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual, Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra, Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos, Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao), Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural, Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive, Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug, Filtros de 5 Dimensoes no Portal do Drive - Marca, Progresso, Fase, Urgente e Sincronizacao, Bug Real - Sincronizacao em Massa Confundia Nunca Sincronizado com Nao Encontrado no Drive, Cache de Detalhes de Arquivo no Snapshot e Cache de Sessao no Front-End Encerram o Piscar ao Reabrir Produto]
---

# Contexto Geral — Retomada em Outro Computador (Agenda de Vídeos)

> Nota auto-contida, gerada em 03/08/2026 porque o desenvolvimento vai continuar em outro computador e a conversa atual não migra junto. Serve como ponto de partida único — lê esta nota primeiro, depois segue os links pra detalhe quando precisar. Se algo aqui parecer desatualizado, o vault é a fonte da verdade — os links levam ao original.
>
> Atualizada em 04/08/2026 08:48 (retomada pós-compactação de contexto) — ver "Status real agora" abaixo pro estado mais recente.
>
> Atualizada de novo em 04/08/2026 11:40 — usuário pausou o trabalho de propósito ("vou precisar dar uma pausa... quero que atualize o vault com tudo que for importante, para eu retornar depois"). Esta é a atualização mais recente; leia "Status real agora" e "O que ainda está em aberto" abaixo antes de qualquer outra coisa.
>
> Atualizada de novo em 05/08/2026 09:30 — usuário retomou, confirmou que os commits anteriores foram aplicados, e fechamos o Bloco D + os testes de integração. Rodada de views/Nível 4 encerrada por completo (260 passed). Próximo passo real: testar a sincronia do Drive usando o Drive real, decisão do usuário — ver "Status real agora" abaixo.
>
> Atualizada de novo em 06/08/2026 01:00 — a rodada de validação do Drive (decisão de 05/08 acima) está **encerrada**: reescrita completa de `parser.py`/`verificador.py`, Nível 5 criado, 5 bugs reais corrigidos (2 na reescrita + 3 achados validando manualmente no navegador o botão de Drive individual), tudo com teste de regressão e commitado no GitHub (`d0a4be2`). Esta é a atualização mais recente — leia "Notas que deve ler a seguir" abaixo antes de qualquer outra coisa, depois "Status real agora" pro estado completo.
>
> Atualizada de novo em 06/08/2026 10:15 — Rodada 6 (testes de `api/replicacao_automatica` e `api/postagem_automatica`, itens 1-4 do mapa) **concluída**: 357 passed, 100% cover no pacote `api/`, 2 bugs reais novos encontrados e corrigidos. Restrição original desta rodada (usuário sem ML/Drive via navegador) não existe mais — usuário agora está no escritório com acesso real aos 2. Script manual de validação física com o ML (item 5) foi entregue e salvo, mas ainda não executado. Item 6 (feature de percentual de replicação) foi pausado a pedido do usuário antes de qualquer código, pra commitar e atualizar o vault primeiro — esta é a atualização mais recente, leia "Status real agora" abaixo pro estado completo.
>
> Atualizada de novo em 06/08/2026 16:10 — **PAUSA LONGA: um projeto novo, complexo e SEM RELAÇÃO com Agenda de Vídeos vai começar em paralelo.** Este bloco de atualização existe só pra garantir que nada se perca antes disso. Código real confirmado no GitHub em `2388b1f` (branch `dev`, itens 1-4 da Rodada 6). Desenhada (mas ainda NÃO aplicada) a flag temporária `confirmar_de_verdade=False` em `replicar_video_no_ml()` + o script gêmeo de dry-run pra Replicação — o código completo dos 4 blocos está guardado em [[Flag Temporaria de Confirmacao em Replicar Video no ML]], não só na conversa. Vault comitado localmente (commit pendente de push pelo usuário). Esta é a atualização mais recente — leia "Status real agora" abaixo antes de qualquer outra coisa.
>
> Atualizada de novo em 12/08/2026 23:51 — **a pausa de 06/08 terminou: o trabalho voltou pra Agenda de Vídeos**, numa frente diferente da Rodada 6 (não é ML/Drive — é a navegação por tela). Reestruturação completa: modelo de telas baseado em Fase (Todos/Não Agendado/Simples/Mensal/Trimestral/A Fazer Hoje) substituído por modelo baseado em Período×Etapa (Geral/A Fazer Hoje/Aguardando Postar-Replicar/Aguardando Aprovação/Prontos pra Agendar Mensal/Pausados) — commit `c369488`. 3 arquivos de teste fechados no mesmo bloco (100% cover em `filtros_agenda_videos.py` e `contexto_tela_agenda_videos.py`), suíte inteira em **520 passed, 0 failed, 12 xfailed**. Os itens da Rodada 6 (ML/Drive, pausados em 06/08) continuam exatamente onde estavam — ver "Status anterior (06/08/2026, 16:10)" mais abaixo.
>
> Atualizada de novo em 13/08/2026 01:00 — usuário pediu um checklist completo pra terminar a automação de Postagem/Replicação de ponta a ponta (botão HTML real, sem gambiarra), com intenção de terminar no mesmo dia. Levantamento feito lendo o código real (não o vault) confirmou: a cadeia botão→Django→agente local→ML já é 100% real; o único bloqueio de verdade é a Replicação ainda clicar sem trava de segurança (a flag de [[Flag Temporaria de Confirmacao em Replicar Video no ML]] segue não aplicada). Checklist completo, em 5 blocos, agora vive em nota própria — [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]] — que substitui os itens 5-6 da Rodada 6 abaixo como fonte da verdade sobre esse tema. Esta é a atualização mais recente — leia essa nota nova antes de qualquer outra coisa relacionada a automação.
>
> Atualizada de novo em 18/08/2026 08:53 — **RETOMADA como foco EXCLUSIVO do momento.** No intervalo entre 13/08 e agora, uma frente inteiramente diferente (Impostos de Entrada / Multi-Empresa / Sysemp) tomou todo o dia 17/08/2026 — ver [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]] se precisar do detalhe. Essa frente está agora **completamente pausada em segundo plano**: o acesso à API Sysemp da Samvale foi confirmado funcionando corretamente e a arquitetura de 2 empresas foi validada com dado real — nada pendente do lado técnico; o que falta (o relatório final entregue ao superior) depende de retorno de terceiros, fora do controle do usuário neste momento. Detalhe completo da decisão de pausa em [[Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos]]. **A partir de agora, Agenda de Vídeos é o único foco de trabalho** — qualquer sessão retomando trabalho no projeto continua exatamente daqui, pelo estado descrito em "Status real agora" e nos itens da lista abaixo, exatamente como estavam em 13/08/2026.
>
> Atualizada de novo em 18/08/2026 10:11 — decisão do usuário: corrigir a Agenda de Vídeos **de ponta a ponta** (Drive → Postagem → Aprovação no ML → Replicação), com a regra "tudo que a Magazine faz, a Samvale também faz". Plano completo, em 4 etapas claras, agora vive em [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]] — que é agora o PLANO ATIVO desta frente, e engloba (sem duplicar) o que já estava em [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]]. Achado importante nessa rodada: o agente local (Postagem/Replicação) não tem hoje nenhuma noção de "qual empresa" — como os ids de execução não são únicos entre os 2 bancos, isso pode misturar dado das 2 empresas, não só "sempre virar Magazine". Leia o checkpoint novo antes de continuar qualquer trabalho de Drive, Postagem ou Replicação a partir de agora.
>
> Atualizada de novo em 18/08/2026 11:00 — **Etapa 1 (Drive) do checkpoint acima CONCLUÍDA.** Magazine (QUIMIVIDA, EAN `0789888395162`) e Samvale (Ortho Pauher, EAN `7899947306688`) validados com dado real do Drive, cada 1 achando só a própria pasta raiz — 37 passed, 0 failed, `parser.py` em 100% cover. Achado corrigido no caminho: a equipe salva o arquivo de Roteiro no plural (`Simples_Roteiros.txt`), não no singular da convenção original de 05/08 — `parser.py` agora aceita as 2 formas (ver [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]]). Próximo passo real: Etapa 2 (Postagem correta — a correção do "Achado central" do agente local sem noção de empresa), ainda não iniciada.
>
> Atualizada de novo em 20/08/2026 19:05 — **frente paralela do Portal do Drive (ver [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]) chegou a um estado considerado suficiente e encerrado no quesito visual.** No mesmo dia 20/08, a tela passou por 2 mudanças de arquitetura (leitura ao vivo do Drive substituída por cache de snapshot persistido; identidade falsa fixa substituída por raiz de teste dedicada por empresa — commit `09f30c2`, ver [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]) e por uma passada final de acabamento visual (4 correções: avisos de "pasta de teste" removidos, header duplicado corrigido, badges "vazando" da borda corrigidos, visual "cinza chapado" resolvido com cor de vida da paleta já existente — ver [[Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug]]). **Decisão de política do usuário nesta mesma data**: a partir de agora, mudança de aparência no Portal do Drive só acontece por bug/erro real, nunca mais por estética. Isso é uma frente PARALELA e SEM RELAÇÃO com a Etapa 2 (Postagem correta) mencionada na atualização anterior — a Etapa 2 continua exatamente como estava, ainda não iniciada. Motivo desta atualização: usuário vai migrar de computador, pediu atualização geral do vault (Portal do Drive + Impostos de Entrada, ver [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]] pro lado de Impostos).
>
> Atualizada de novo em 20/08/2026 22:30 — **mesma frente paralela do Portal do Drive, mesmo dia: o item pendente de filtros foi resolvido, 1 bug real de sincronização foi achado e corrigido, e o "piscar" de carregamento ao reabrir produto foi eliminado com cache em 2 camadas — depois disso, o usuário decidiu pausar a frente visual/funcional por completo.** Filtros de 5 dimensões (Marca, Progresso de envio, Fase atual, Urgente, Sincronização com o Drive), desenhados depois do usuário rejeitar uma 1ª versão simples demais e validados por mockup antes do código real — ver [[Filtros de 5 Dimensoes no Portal do Drive - Marca, Progresso, Fase, Urgente e Sincronizacao]]. Usando a tela com os filtros, achado um bug real: a sincronização em massa nunca gravava snapshot pra produto sem pasta no Drive, fazendo a tela confundir "nunca sincronizado" com "não encontrado" — corrigido invertendo a direção do laço de "o que o Drive revelou" pra "todo produto ativo do catálogo" — ver [[Bug Real - Sincronizacao em Massa Confundia Nunca Sincronizado com Nao Encontrado no Drive]]. Por fim, cache em 2 camadas (detalhes de arquivo cacheados dentro do próprio snapshot; front-end para de apagar/recarregar o mesmo produto sem necessidade) eliminou o delay perceptível ao reabrir um produto já visto — ver [[Cache de Detalhes de Arquivo no Snapshot e Cache de Sessao no Front-End Encerram o Piscar ao Reabrir Produto]]. **Decisão do usuário ao final desta sessão, nas próprias palavras**: *"agora neste momento de parte visual não consigo pensar em mais nada.. agr é esperar o uso e o feedback."* Nada disso foi confirmado como commitado/pushado ainda — só aplicado localmente e testado no navegador. Esta é a atualização mais recente desta nota.

## Notas que deve ler a seguir (nesta ordem)

1. **Pasta `Regras_de_Comportamento/` inteira** (~14 notas) — sempre primeiro, sem exceção. Define como se comportar neste projeto (git, testes, vault, comunicação). Reread completo confirmado em 05/08/2026, sem drift.
2. **Esta nota** (você já está aqui) — snapshot geral + "Status real agora" logo abaixo.
3. [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]] — checklist mais recente (13/08), o que falta pra terminar Postagem/Replicação automática ponta a ponta pelo botão real do HTML.
4. [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]] — achado/decisão de 12/08, modelo de telas atual, substitui [[Estrutura de Telas da Agenda de Videos]] (descartada).
5. [[Checkpoint Testes Automatizados Agenda Videos]] — histórico completo, nível por nível, de todos os testes e bugs já corrigidos no domínio Agenda de Vídeos.
6. [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]] — achado da rodada de validação do Drive (06/08), pausada desde então.
7. [[Fluxo Manual Antes do Automatizado]] — por que o automatizado (postagem/replicação) foi deliberadamente adiado.
8. `api/postagem_automatica`/`api/replicacao_automatica` (itens 1-4 do mapa) — **concluído** (357 passed, 100% cover). Estado atual completo do que falta (itens 5-6) agora vive em [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]].

## Onde isso vive

- Projeto: `Projeto_Sistema_Interno_V2` (Django). Repo GitHub `MatheusAp-MB/Projeto_Sistema_Interno_V2`, branch `dev`.
- App em foco: `agenda_videos` — agendamento/produção de vídeos de produto (Simples → Vídeo Mensal → Vídeo Trimestral, cada um com sequência Base→Roteiro→Completo→Postar→Replicar).
- Vault Obsidian: `notas-obsidian-sistema-interno-mb-sv` — fonte da verdade sempre que houver dúvida. Ver [[Estrutura e Convenções do Vault]] antes de criar/editar qualquer nota (schema de frontmatter, estrutura de pastas).

## Regras de colaboração (resumo — ver notas linkadas pra nuance completa)

1. Só sincronizar (fetch) com o GitHub quando o usuário pedir explicitamente.
2. Só editar/escrever/remover arquivo da pasta atual do usuário com permissão explícita dele.
3. Nunca criar tarefa/subagente sem autorização — sempre planejar antes de executar, e só agir com permissão.
4. O vault é fonte da verdade; se ele não responder a uma dúvida, perguntar ao usuário (nunca assumir).
5. `Legado/` é arquivo morto, nunca fonte de verdade, só consulta pontual.
6. Nunca usar caixinha de múltipla escolha (tipo AskUserQuestion) — perguntas sempre em texto corrido na conversa. Ver [[Perguntas Sempre em Texto Corrido]].
7. Explicar em tópicos simples e didáticos ANTES de gerar qualquer código, sempre por etapas (nunca despejar tudo de uma vez sem planejar junto).
8. Cobertura de teste exaustiva (máximo possível, ponta a ponta); nunca contornar bug real no teste — conserta-se o código de verdade, retroativamente se preciso. Ver [[Disciplina de Testes Automatizados]].
9. **Claude nunca roda scripts/pytest/comandos sozinho contra o repo real do usuário.** Só entrega código (arquivo completo ou bloco Localize/Substitua nomeado) pro usuário aplicar e rodar localmente, reportando o resultado de volta em texto real (nunca assumir que passou). Fetch/log/reset são aceitáveis SÓ no clone-sandbox próprio do Claude (nunca no repo real do usuário), e só depois que o usuário autorizar sincronizar.
10. Antes de escrever/editar QUALQUER nota do vault, perguntar data e hora ao usuário (1x por bloco de edições, não por arquivo — não precisa ser o timestamp exato, só uma referência clara). Toda escrita/edição de nota atualiza o campo `atualizado_em` (`DD/MM/YYYY HH:mm`) no frontmatter. Ver [[Perguntar Data e Hora Antes de Escrever no Vault]].
11. Código sempre limpo, POO com dataclass/decorators/type hints, comentários explicando o PORQUÊ (nunca o quê óbvio), padrões de eficiência/encapsulamento/responsabilidade única.
12. Decisão/dúvida/bug conhecido preservam histórico — nunca são editados "por cima"; ganham nova seção ("Atualização DD/MM HH:mm") ou nota nova. Checkpoint é a exceção: é "nota viva", atualizada no próprio corpo, nunca substituída.

## O que é a Agenda de Vídeos (modelo de domínio, pós-reestruturação de 30/07)

- `Fase`: SIMPLES (1x) → VIDEO_MENSAL (4x, a cada 30 dias corridos) → VIDEO_TRIMESTRAL (a cada 90 dias, pra sempre — nunca conclui).
- Cada ocorrência de `CicloVideo` passa por 5 passos travados: Base → Roteiro → Completo → Postar → Replicar. `etapa_atual()` devolve 1 de 7 valores reais + `'nao_agendado'` sintético (só no cache, quando não existe nenhum `CicloVideo`).
- `ParticipacaoAgenda.agendado_em` = momento exato da transição Simples→Mensal (setado dentro do botão "Agendar" já existente).
- Status do PRODUTO (Ativo/Inativo, vindo do ERP) é diferente de status DA AGENDA (Ativo/Pausado/Descontinuado, controlado pelo time). Sem ação de "excluir da agenda" — se precisar, o ajuste é no filtro de entrada, nunca uma ação manual por produto.
- `IndicadoresAgendaProduto` é cache DERIVADO (nunca fonte real) — precisa ser re-sincronizado (`sincronizar_indicadores_agenda_produto()`) depois de qualquer escrita em CicloVideo/ConfiguracaoFase/ParticipacaoAgenda/HistoricoStatusManualAgenda. Ver seção de achados abaixo — isso mordeu a gente de verdade.

## O que foi feito nesta sessão: redesenho das 5 telas

Motivo: testando manualmente com dado real pela 1ª vez, apareceram 2 bugs no filtro antigo — "Não Agendado" sumia assim que o produto tinha o 1º clique em Base (mesmo continuando 100% dentro de Simples), e "A Fazer Hoje" mostrava qualquer produto ativo, sem noção real de urgência. Isso motivou parar os testes de `listar_produtos_com_historico()` (ver [[Pausa Para Replanejar UX de Filtros e Telas]]) e replanejar a UX do zero.

Resultado do desenho — [[Estrutura de Telas da Agenda de Videos]]: 6 telas (5 originais + "Todos", adicionada depois — ver "Status real agora" abaixo), cada uma com critério de entrada explícito:

0. **Todos** — sem filtro nenhum (1ª aba). Única tela que mostra produto sem `IndicadoresAgendaProduto` sincronizado — todas as outras dependem desse cache via INNER JOIN. Sem chip-contador (não faz sentido pra ela). Adicionada depois que o usuário sentiu falta de "ver tudo", revertendo o fechamento de 03/08 que tinha dado essa necessidade como não existente.
1. **Não Agendado** — fase Simples com `etapa_atual()=='concluido'` (já replicado, só falta clicar "Agendar"). Sem filtro de etapa — estado único.
2. **Simples** — toda a fase Simples EXCETO `concluido`. "Base" soma 2 situações: produto nunca tocado (0 ciclos, cache sintético `nao_agendado`) + produto com ciclo mas ainda em `base` — decisão de arquitetura deliberada, são a mesma ação pendente pro usuário.
3. **Vídeo Mensal** / 4. **Vídeo Trimestral** — listagem completa da fase, qualquer etapa.
5. **A Fazer Hoje** — cruza SÓ Mensal+Trimestral (nunca Simples, que não tem prazo). Entra por 6 motivos: atrasado, risco (etapa em produção + prazo ≤1 dia útil), postar hoje (com proteção contra cache `postou_hoje` desatualizado), aguardando aprovação, aprovado-aguardando-replicar, recusado — as 3 últimas contam sempre, sem checar prazo ("se não foi replicado ainda é porque tem ação pendente a ser feita"). Pausado/Descontinuado excluído incondicionalmente aqui (só aqui — as outras 4 telas mostram tudo por padrão, pausado incluso, a menos que o usuário filtre `status_manual` de propósito).

Ordenação de prioridade real (`prioridade_agenda_videos.py`, conferida em 04/08 direto no código): 6 níveis — urgente+reprovado, urgente, atrasado+reprovado, atrasado, reprovado, default — sem fator de risco isolado. Não são 7 níveis com "risco" à parte, como se chegou a supor de memória numa sessão anterior.

Toda etapa/motivo é um **chip-contador clicável** (ex: "Completo (3)") — filtro E resumo visual ao mesmo tempo, sempre visível (não escondido em "Mais filtros"), 1 query agregada pra todos os contadores de uma vez (nunca 1 query por chip).

Execução seguiu [[Mapa de Execucao das 5 Telas da Agenda de Videos]], 7 fases, TODAS CONCLUÍDAS e aplicadas pelo usuário:

1. **Vocabulário/condições** (`agenda_videos/funcoes_auxiliares/filtros_agenda_videos.py`) — `Tela` (TextChoices), `condicao_tela()`, `condicao_pendencia_agora()` reescrita (match/case), `condicao_motivo_a_fazer_hoje()` (os 6 motivos), `contar_por_condicoes()`.
2. **Listagem unificada** — `listar_produtos_agenda_filtrados(tela=...)` substitui a dupla antiga; `listar_a_fazer_hoje()` aposentada (`a_fazer_hoje.py` reduzido só a `calcular_indicadores_ciclo`, usado por produto único); `construir_queryset_tela()` isola a base compartilhada entre listagem e contagem de chips.
3. **Contexto** (`contexto_tela_agenda_videos.py`) — `ParametrosBuscaAgendaVideos` com campo único `tela` (substitui os antigos `a_fazer_hoje`/`estagio`); `contadores_chips` no contexto montado.
4. **Views/URLs** — `views.py`: rotas de replicação automática migradas pra nova função; `urls.py` sem mudança nenhuma. `orquestrador.py` (postagem automática): `listar_produtos_elegiveis()` reescrita À PARTE, preservando a regra real do bot — posta tudo com etapa 'postar' e vencimento hoje-ou-atrasado, EM QUALQUER FASE (Simples incluso) — não reaproveita o escopo Mensal/Trimestral da tela A Fazer Hoje, que é só recorte de UI.
5. **Templates** — navegação por link entre as 5 telas (substitui os checkboxes de estágio + JS de exclusão mútua, que foi removido); chip-contador sempre visível.
6. **Testes** — `agenda_videos/tests/test_nivel_3__listar_produtos_agenda_filtrados.py` (novo) substitui `test_nivel_3__listar_a_fazer_hoje.py` (removido) — cobre escopo das 5 telas, os 6 motivos, a assimetria de `status_manual`, ordenação (fixa em A Fazer Hoje x escolhida nas outras 4), smoke test dos filtros que não mudaram de lógica.
7. **Validação manual** — aprovado pelo usuário E pelo Vinicius (colega de time), fluxo e design confirmados. A pergunta sobre precisar de uma tela "ver tudo, cruzando todas as fases" (que existia implicitamente no sistema antigo) foi levantada e fechada: não é necessária.

## Achado real importante (não é bug de código)

`IndicadoresAgendaProduto` (cache que TODAS as 5 telas dependem, via `indicadores_agenda__X`, join INNER) só é populado por ação manual (clique no roadmap) ou pelo comando `popular_banco` (passo `sincronizar_indicadores_agenda_em_lote`). Produto nunca tocado manualmente fica sem essa linha de cache — e portanto invisível em TODAS as 5 telas ao mesmo tempo, não só numa. Isso já causou confusão real (usuário só via 1 produto depois de aplicar o redesenho). Resolvido rodando `python manage.py popular_banco`. Detalhe completo em [[Cache de Indicadores Nao e Populado Automaticamente]]. Cuidado permanente: depois de qualquer import novo de produtos, rodar `popular_banco` antes de confiar na Agenda de Vídeos pro catálogo novo.

## Status real agora (12/08/2026, 23:51)

- **Motivo desta atualização: a pausa longa de 06/08 terminou — trabalho voltou pra Agenda de Vídeos**, numa frente diferente da Rodada 6 (ver "Status anterior" abaixo, que segue exatamente como estava). Esta frente é sobre navegação por tela, não ML/Drive.
- **Reestruturação completa da navegação, commit `c369488` no GitHub, branch `dev`.** O modelo de telas baseado em Fase (Todos/Não Agendado/Simples/Vídeo Mensal/Vídeo Trimestral/A Fazer Hoje — ver [[Estrutura de Telas da Agenda de Videos]], agora `descartada`) foi substituído por um modelo baseado em Período × Etapa: 6 telas de nível igual — Geral, A Fazer Hoje, Aguardando Postar/Replicar, Aguardando Aprovação, Prontos pra Agendar Mensal, Pausados na Agenda. Detalhe completo em [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]] (nota nova).
- **2 ajustes de design fechados nesta sessão:** faltava o chip "Prontos pra agendar mensal" (`concluido`) na tela Geral — adicionado, na ordem real do fluxo (base→roteiro→completo→postar→aguardando_aprovação→recusado→replicar→concluído). A Fazer Hoje foi restrita: Vídeo Mensal/Trimestral entram em qualquer etapa de produção (têm prazo real); Simples só entra com a Base já feita (Roteiro/Completo/Recusado) — Simples em Base é backlog, não urgência do dia.
- **Botões de automação da tela Aguardando Postar/Replicar redesenhados:** "Iniciar Postagem Autônoma de Hoje" só aparece na sub-aba Postar, "Iniciar Replicação Autônoma de Hoje" só na sub-aba Replicar, ambos ao lado de "Verificar Todos no Drive" (fix de alinhamento via `display: contents` no form + wrapper flex novo).
- **Suíte de teste fechada pro modelo novo, 100% cover nos 2 arquivos centrais:** `test_nivel_3__listar_produtos_agenda_filtrados.py` reescrito por completo (100% cover/0 Miss/0 BrPart em `filtros_agenda_videos.py`); 4 testes corrigidos em `test_nivel_4__view_agenda_videos.py`; arquivo novo `test_nivel_4__contexto_tela_agenda_videos.py` (100% cover em `contexto_tela_agenda_videos.py`, 83%→100%, introduzindo `RequestFactory` no projeto). **Confirmado: 520 passed, 0 failed, 12 xfailed** — suíte inteira, sem regressão.
- **1 bug de teste corrigido fora do domínio Agenda de Vídeos, achado no mesmo bloco de validação:** fixture de teste da `api_sysemp` usava o nome errado de variável de ambiente (`SYSEMP_API_TOKEN` em vez de `MB_SYSEMP_API_TOKEN`) — resíduo do commit `fe032ac`. Corrigido; ver [[Teste de ApiSysemp Monkeypatchava Variavel de Ambiente com Nome Errado]] no mundo `03_Integracao_Sysemp` (sem relação de domínio com esta nota, registrado aqui só por ter sido achado na mesma sessão).
- **Commit gerado (título + descrição)** pro usuário aplicar, cobrindo os 4 arquivos de teste + o fix do Sysemp — ainda não confirmado como commitado/pushado pelo usuário.
- **Itens 5-6 da Rodada 6 (ML/Drive, percentual de replicação) seguem exatamente como estavam em 06/08** — ver "Status anterior (06/08/2026, 16:10)" abaixo, nada mudou neles nesta sessão.

## Status anterior (06/08/2026, 16:10 — histórico, ver "Status real agora" acima pro estado atual)

- **Motivo desta atualização: pausa longa.** Um projeto novo, complexo, e sem nenhuma relação com Agenda de Vídeos vai começar em paralelo a partir daqui — o usuário quer garantir que TODO o contexto de Agenda de Vídeos esteja no vault antes de trocar de assunto, sem depender da memória da conversa atual (que pode ser perdida/compactada).
- **Linha de base de código, confirmada:** commit `2388b1f` no GitHub, branch `dev` — inclui os itens 1-4 da Rodada 6 completos (357 passed, 100% cover em `api/`). Ver seção "Status real agora (06/08/2026, 10:15)" abaixo pro detalhe completo desses itens.
- **Item 5 (validação física com o ML): parcialmente pronto.** Script de Postagem (`scripts_dev/testar_fluxo_real_ml_sem_clicar.py`) já existe, já está commitado, ainda não foi executado. Script de Replicação (gêmeo) + a flag `confirmar_de_verdade=False` que ele precisa (porque `replicar_video_no_ml()` clicava de verdade, decisão de 30/07) foram desenhados e entregues em texto — **NADA disso foi aplicado ainda**. O código completo (4 blocos de diff + arquivo novo inteiro) está guardado em [[Flag Temporaria de Confirmacao em Replicar Video no ML]] — nota criada exatamente pra não depender da conversa.
- **Item 6 (percentual de replicação) permanece pausado.** O usuário decidiu que, antes de desenhar onde exibir o percentual, precisa rodar os 2 scripts de dry-run (Postagem, depois Replicação) pra ver de novo como as telas reais estão hoje — "faz tempo que não uso". Plano completo em [[Percentual de Replicacao por Produto e Geral]].
- **Vault comitado localmente** (mesma sessão) — falta o `git push` do usuário.

## Status anterior (06/08/2026, 10:15 — histórico, ver "Status real agora" acima pro estado atual)

- **Rodada 6 (testes das APIs do agente local), itens 1-4 concluídos.** `api/replicacao_automatica` (Nível 4, 100% cover) → funções puras do orquestrador (`listar_produtos_elegiveis`, `obter_mlb_do_produto`) → `resolver_arquivo_da_ocorrencia()` corrigida + 4 rotas sem Drive de `api/postagem_automatica` → `view_baixar_video`/`view_marcar_concluido` versão Simulada (mock só na borda de rede, parser/banco reais). **Confirmado: 357 passed, 0 failed, pacote `api/` inteiro 100% cover (253 stmts, 0 Miss).**
- **2 bugs reais novos encontrados e corrigidos:** `listar_produtos_elegiveis()` nunca incluía Simples na fila (comparação `NULL <= hoje`, sempre falsa em SQL — ver [[Listar Produtos Elegiveis Ignorava Simples Por Comparacao Com Null]]); `resolver_arquivo_da_ocorrencia()` ainda usava o formato ANTIGO do parser do Drive (`.fases`/`.completos`), nunca atualizado depois da reescrita de 05/08, ia estourar `AttributeError` no 1º uso real — achado por leitura de código, não por teste falho (ver [[Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser]]).
- **Restrição original desta rodada não existe mais.** Usuário estava em casa sem ML/Drive via navegador no início — agora está no escritório com acesso real aos 2.
- **Item 5 (validação física com o ML real) esclarecido e redirecionado.** Não é testável por pytest (sucesso é visual — mouse parado sobre o botão, sem clique). Script manual `scripts_dev/testar_fluxo_real_ml_sem_clicar.py` entregue e salvo pelo usuário — baixa vídeo real do Drive (só leitura), abre o navegador real, sobe o arquivo, chama a `postar_video_no_ml()` real (que já para antes do clique final por decisão de 30/07). **Ainda não executado** — corre em paralelo ao pytest, não bloqueia o resto.
- **Item 6 (percentual de replicação) pausado a pedido do usuário antes de qualquer código** — "isso vai afetar muita coisa nova", primeiro commit + vault. Plano de implementação (migration + 3 campos em `ItemExecucaoReplicacao` + `_obter_outros_mlbs()` compartilhada + captura em 2 momentos + assert de soma 100%) já desenhado, ver [[Percentual de Replicacao por Produto e Geral]].
- **Ainda não commitado no GitHub** — só foi entregue o título/descrição do commit em texto; falta confirmação do usuário de que aplicou e sincronizou.
- Escopo esclarecido durante a rodada: `testar_fluxo_real_ml_sem_clicar.py` é diferente de um teste pytest de `view_marcar_concluido` — o 1º é dry-run manual no navegador real, o 2º é teste automatizado da API Django. Confusão identificada e corrigida na hora, sem impacto em código.

## Status anterior (06/08/2026, 01:00 — histórico, ver "Status real agora" acima pro estado atual)

- **Reescrita completa do Drive concluída e testada.** `constantes.py`/`parser.py`/`verificador.py` reescritos pro modelo Base/Roteiro/Completo por ocorrência. Nível 0 (parser, 15 testes), Nível 2 (verificador puro, 8 testes), Nível 3 (verificador com banco, 8 + mais 4 hoje), Nível 5 — **novo** (integração externa real, contra o Drive de verdade, 2 testes). Padrão novo formalizado: qualquer função que toca API externa ganha par Real+Simulado. Ver [[Disciplina de Testes Automatizados]].
- **2 bugs reais corrigidos na reescrita:** `obter_fase()` levantava `AttributeError` cru pra chave inválida (agora `ValueError` claro); `montar_arvore_por_ean()` comparava nome de subpasta case-sensitive, mas o Drive é case-insensitive — 4 de 5 pastas de EAN dentro de QUIMIVIDA usavam "videos" minúsculo e eram descartadas silenciosamente da varredura.
- O susto de "71 falhas em outro PC" era só `.env` local com `LOGIN_REQUIRED=True` forçando redirect de login — zero regressão real. Ver [[LOGIN_REQUIRED no .env Causa Falso Positivo de 71 Falhas em Testes de View]].
- **Validação manual no navegador (06/08) achou +3 bugs reais em cadeia** no botão de verificar Drive individual — só existia "Verificar Todos" antes, e o usuário sentiu falta do botão por produto: (1) botão já existia no template mas ficava escondido atrás de `ciclo_atual`; (2) `_avancar_etapas_com_estrutura` não criava o 1º `CicloVideo` mesmo com o arquivo Base já pronto no Drive — sincronização não fazia nada em produto novo; (3) verificação individual nunca gravava `SnapshotArquivosDrive` — o badge de "última verificação" só atualizava pelo "Verificar Todos". **Os 3 corrigidos**, com teste de regressão: **42 passed, 100% cover, 0 Miss, 0 BrPart** em `parser.py`/`verificador.py`. Detalhe completo em [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]].
- **Commitado e sincronizado no GitHub:** commit `d0a4be2` (branch `dev`) — confirmado via clone fresco, log e diff linha a linha batendo exatamente com o que foi planejado na conversa.
- **Vault também commitado** — 2 commits: um cobrindo o trabalho desta sessão, e um retroativo pra ~7 notas de sessões anteriores que nunca tinham sido commitadas (Ciclo de Trabalho Calmo, Nível 5, Convenção de Nomenclatura de Arquivos no Drive, Percentual de Replicação, Badge de Aviso, LOGIN_REQUIRED, obter_fase).
- **A rodada de validação do Drive está encerrada.** Próximo passo real: retomar o fluxo automatizado (`postagem_automatica`, `replicacao_automatica`) — pausado desde 05/08, nenhuma das 2 APIs tem teste ainda.

## Status anterior (05/08/2026, 09:30 — histórico, ver "Status real agora" acima pro estado atual)

- As 6 telas (5 originais + Todos) estão aplicadas, testadas via pytest e validadas manualmente.
- `listar_produtos_com_historico()` (relatório de Histórico) fechado — 100% cover em `historico_roadmap.py`.
- Os 3 bugs de validação manual achados em 04/08 (modal de Histórico não fechava no X, tela Configurações quebrada, validação de Configurações rejeitava Simples) estão **todos RESOLVIDOS e confirmados** — ver [[Validacao de Configuracoes Nao Abre Excecao Para Simples]].
- **Rodada de testes de views/Nível 4 CONCLUÍDA por completo (04-05/08).** `agenda_videos/views.py` tinha 21 funções `view_*` sem teste algum. Ferramenta usada: `client` do pytest-django (`client.get`/`client.post` + `reverse()`) — HTTP real simulado em memória, valida roteamento, travas de método (`@require_POST`) e mensagens (`messages.warning`/`success`). As 10 views do fluxo manual, nos 4 blocos: leitura (Bloco A), escrita no roadmap do ciclo (Bloco B), flags do produto (Bloco C), Configurações (Bloco D) — todas completas.
- **Confirmado: 258 passed, 0 failed** ao fechar o Bloco D — este é o número real mais atual pro Nível 4 puro.
- **Depois disso, 2 testes de integração novos** (`test_nivel_4__integracao_config_afeta_roadmap.py`), motivados por uma pergunta direta do usuário ("as configs realmente refletem na realidade?"): provaram por execução (não só leitura de código) que mudar uma `ConfiguracaoFase` pela tela real reflete IMEDIATAMENTE no próximo `CicloVideo` criado por `criar_proximo()` — tanto pra distância quanto pra transição de fase. Confirmado que `ConfiguracaoFase` não é cache de nada (diferente do `IndicadoresAgendaProduto`, que precisa de resync manual). **Confirmado: 260 passed, 0 failed** — este é o número mais atual da suíte inteira.
- **1 bug real GRAVE encontrado e corrigido no Bloco A:** `status_manual_atual` ignorava o histórico de Pausado/Descontinuado sempre que `ParticipacaoAgenda` não existia — deixava o próprio botão "Pausar" TRAVADO (nunca voltava pra Ativo) pra qualquer produto nessa situação. Ver [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]].
- **Lição importante do Bloco C, sobre a colaboração em si (não sobre o domínio):** ao aplicar o fix do bug acima, uma instrução de import foi passada em PROSA em vez de diff exato — nunca foi de fato aplicada, e isso gerou um `NameError` real que ficou escondido por várias rodadas de teste, só aparecendo quando `view_alternar_pausado_agenda` (o único ponto que usava a função) finalmente foi exercitada. Já corrigido. Detalhe completo na nota de descoberta [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]], seção "Atualização 04/08/2026 11:40".
- **Decisão nova (05/08, 09:30): a próxima rodada testa a sincronia com o Google Drive usando o Drive real, sempre que possível — não mock.** Isso resolve a pergunta que ficava em aberto desde 03/08 sobre `view_verificar_produto_drive`/`view_verificar_todos_drive`. Plano de teste ainda sendo desenhado (exploração do código de Drive é o próximo passo).
- O commit dos 9 arquivos de teste do Bloco A/B/C + fix de import de `views.py` foi confirmado como aplicado pelo usuário e sincronizado (commit `b70f8a1`). O arquivo de Bloco D + o de integração **ainda NÃO foram commitados/pushados** — decidir título/descrição do commit quando o usuário estiver pronto.

## O que ainda está em aberto

- ~~Reestruturar a navegação por tela (Período×Etapa) + fechar os 3 arquivos de teste~~ — **concluído em 12/08/2026, 23:51**, ver [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]] e "Status real agora" acima.
- **Confirmar que o usuário aplicou/commitou/pushou o commit desta sessão** (4 arquivos de teste + fix do nome de variável na `api_sysemp`) — gerado em texto, ainda sem confirmação de aplicação.
- ~~Testar a sincronia com o Drive real~~ — **concluído em 06/08/2026**, ver "Status anterior (06/08/2026, 16:10)" abaixo.
- ~~Testar `api/replicacao_automatica`/`api/postagem_automatica` (itens 1-4)~~ — **concluído em 06/08/2026, 10:15** (357 passed, 100% cover), ver "Status anterior (06/08/2026, 16:10)" abaixo.
- ~~Item 5 (validação física com o ML) + Item 6 (percentual de replicação)~~ — **substituídos em 13/08/2026 por um checklist único e mais completo**, feito lendo o código real (não só o vault): [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]]. Achado principal: a Replicação ainda clica de verdade sem trava de segurança (Bloco 1 do checklist) — isso bloqueia os dry-runs (Bloco 2) e a execução real ponta a ponta pelo botão do HTML (Bloco 3). Percentual de replicação continua pausado até os dry-runs (Bloco 5 do checklist).
- **Um projeto novo, complexo e sem relação com Agenda de Vídeos** vai começar em paralelo a partir de 06/08, 16:10 — os itens acima ficam pausados até o usuário retomar Agenda de Vídeos especificamente.
- `script_agenda_videos.js` ficou vazio (lógica de exclusão mútua não existe mais) — pode apagar quando o usuário autorizar (regra 2 acima). Ainda não apagado.
- CSS antigo (`.agenda-estagio-*` em `layout_agenda_videos.css`) ficou morto no arquivo — ainda não limpo, não é urgente.
- **CRLF vs LF no repo do vault** (achado em 06/08): ~10 notas + os 4 `.obsidian/*.json` aparecem como "modificado" no git só por diferença de quebra de linha, sem mudança de conteúdo real. Deixado de lado por ora — decisão de normalizar tudo de vez (commit só de formatação) fica pro usuário decidir quando quiser.

## Arquivos tocados (referência rápida)

### Sessão 12/08 — ainda NÃO commitado/pushado (texto do commit já gerado)

- `agenda_videos/funcoes_auxiliares/filtros_agenda_videos.py` — chip "concluído" adicionado a `OPCOES_ETAPA` (ordem corrigida pra bater com `BADGES_ETAPA`); escopo de `_condicao_a_fazer_hoje()` restrito (Simples só com Base feita). *(commit `c369488`, já sincronizado — as mudanças de código deste bloco já estão no GitHub; o que falta commitar é só a suíte de teste abaixo.)*
- `agenda_videos/funcoes_auxiliares/contexto_tela_agenda_videos.py`, `agenda_videos/templates/agenda_videos/estrutura_agenda_videos.html`, `agenda_videos/static/agenda_videos/css/layout_agenda_videos.css`, `agenda_videos/management/commands/resetar_agenda_videos.py` — reestruturação completa pras 6 telas de nível igual, botões de automação condicionados por sub-aba, fix de alinhamento CSS. *(também já no commit `c369488`.)*
- `agenda_videos/tests/test_nivel_3__listar_produtos_agenda_filtrados.py` — reescrito por completo. 100% cover em `filtros_agenda_videos.py`.
- `agenda_videos/tests/test_nivel_4__view_agenda_videos.py` — 4 testes corrigidos pro modelo novo.
- `agenda_videos/tests/test_nivel_4__contexto_tela_agenda_videos.py` (novo) — 100% cover em `contexto_tela_agenda_videos.py`, introduz `RequestFactory`.
- `api_sysemp/tests/test_nivel_0__api_sysemp.py` — 3 pontos corrigidos (comentário + 2 `monkeypatch`), nome de variável de ambiente errado (`SYSEMP_API_TOKEN`→`MB_SYSEMP_API_TOKEN`). Domínio Sysemp, não Agenda de Vídeos — ver [[Teste de ApiSysemp Monkeypatchava Variavel de Ambiente com Nome Errado]].

**Confirmado localmente: 520 passed, 0 failed, 12 xfailed.** Commit (título+descrição) gerado pro usuário aplicar — cobre os 3 arquivos de teste da Agenda de Vídeos + o fix da `api_sysemp`.

### Sessão 03/08

- `agenda_videos/funcoes_auxiliares/filtros_agenda_videos.py` — reescrito por completo.
- `agenda_videos/funcoes_auxiliares/a_fazer_hoje.py` — reduzido a `calcular_indicadores_ciclo`.
- `agenda_videos/funcoes_auxiliares/contexto_tela_agenda_videos.py` — reescrito (tela + contadores_chips).
- `agenda_videos/views.py` — imports + 2 call sites de replicação automática.
- `agenda_videos/funcoes_auxiliares/postagem_automatica/orquestrador.py` — `listar_produtos_elegiveis()` reescrita.
- `agenda_videos/templates/agenda_videos/estrutura_agenda_videos.html` — navegação + chip-contador.
- `agenda_videos/static/agenda_videos/js/script_agenda_videos.js` — esvaziado.
- `agenda_videos/static/agenda_videos/css/layout_agenda_videos.css` — classes novas (`.agenda-tela-*`, `.agenda-chip-contador-*`).
- `agenda_videos/tests/test_nivel_3__listar_produtos_agenda_filtrados.py` (novo) — `test_nivel_3__listar_a_fazer_hoje.py` (removido).

### Sessão 04/08

- `agenda_videos/funcoes_auxiliares/filtros_agenda_videos.py` — `Tela.TODOS` + `_condicao_todos()` adicionados.
- `agenda_videos/tests/test_nivel_3__listar_produtos_agenda_filtrados.py` — 1 teste retroativo corrigido pra refletir a tela Todos.
- `agenda_videos/tests/test_nivel_3__listar_produtos_com_historico.py` (novo) — fecha `historico_roadmap.py`.
- `agenda_videos/templates/agenda_videos/estrutura_configuracoes_agenda_videos.html` — reescrito por completo.
- `agenda_videos/static/agenda_videos/css/layout_configuracoes_agenda_videos.css` — classes novas pra checkbox/dica de cabeçalho.
- `agenda_videos/static/agenda_videos/css/layout_historico_agenda_videos.css` — fix do ícone de fechar do modal.
- `agenda_videos/models/participacao_agenda.py` — nova função `status_manual_atual_do_produto(produto)`, fonte única do status manual.
- `agenda_videos/models/__init__.py` — re-export de `status_manual_atual_do_produto`.
- `agenda_videos/funcoes_auxiliares/historico_roadmap.py` — call site corrigido pra usar `status_manual_atual_do_produto`.
- `agenda_videos/funcoes_auxiliares/sincronizar_roadmap_agenda.py` — idem.
- `agenda_videos/views.py` — call site em `view_alternar_pausado_agenda` corrigido; bloco de import corrigido depois (ver NameError abaixo).
- `agenda_videos/tests/test_nivel_3__calcular_indicadores.py` — teste novo fechando o gap que deixou o bug de status manual passar despercebido.
- `agenda_videos/tests/test_nivel_4__view_historico_produto.py` (novo, 4 testes).
- `agenda_videos/tests/test_nivel_4__view_confirmar_ponto_roadmap.py` (novo, 9 testes).
- `agenda_videos/tests/test_nivel_4__view_agenda_videos.py` (novo, 5 testes; ganhou fixture `regua_de_fases`).
- `agenda_videos/tests/test_nivel_4__view_historico_agenda_videos.py` (novo, 5 testes).
- `agenda_videos/tests/test_nivel_4__view_marcar_ponto_roadmap.py` (novo, 7 testes).
- `agenda_videos/tests/test_nivel_4__view_agendar_produto.py` (novo, 6 testes).
- `agenda_videos/tests/test_nivel_4__view_executar_acao_ciclica.py` (novo, 16 testes).
- `agenda_videos/tests/test_nivel_4__view_alternar_urgente.py` (novo, 4 testes).
- `agenda_videos/tests/test_nivel_4__view_alternar_pausado_agenda.py` (novo, 6 testes — inclui regressão explícita do bug de status manual).
- `agenda_videos/views.py` — 2º fix, este de import: bloco `from agenda_videos.models import (...)` corrigido pra incluir `status_manual_atual_do_produto` (fix que corrigiu o `NameError` do Bloco C — ver [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]).

**Os 9 arquivos de teste acima + o fix de import já foram commitados e sincronizados** (commit `b70f8a1`, confirmado em 05/08).

### Sessão 05/08 (continuação)

- `agenda_videos/tests/test_nivel_4__view_configuracoes_agenda_videos.py` (novo, 10 testes — Bloco D, fecha a rodada de views/Nível 4).
- `agenda_videos/tests/test_nivel_4__integracao_config_afeta_roadmap.py` (novo, 2 testes — prova ponta a ponta que mudar `ConfiguracaoFase` pela tela reflete em `criar_proximo()`).

**Estes 2 arquivos ainda NÃO foram commitados/pushados** — confirmado 260 passed, 0 failed localmente, mas sem commit ainda. *(Atualização 06/08: confirmado commitado no commit `e2028ca` ("update", 05/08 18:03) — junto com a 1ª versão do arquivo de Drive Nível 5, antes de ser renomeado.)*

### Sessão 05-06/08 (reescrita do Drive + botão individual) — TUDO commitado e confirmado no GitHub

- `agenda_videos/funcoes_auxiliares/drive/constantes.py`, `parser.py`, `verificador.py` — reescritos por completo pro modelo Base/Roteiro/Completo por ocorrência. `agenda_videos/tests/test_nivel_0__parser.py`, `test_nivel_2__verificador.py`, `test_nivel_3__verificador.py` (versão inicial) — novos. Commit `f294b1b`.
- `scripts_dev/` — diagnóstico e correção manual da pasta de referência do Drive (QUIMIVIDA). Commit `b4193ee`.
- `agenda_videos/funcoes_auxiliares/drive/escaneador.py` — fix de case-sensitivity em `montar_arvore_por_ean`. `agenda_videos/tests/test_nivel_5__drive_leitura.py` (renomeado de `test_integracao_real__drive_leitura.py`) e `test_nivel_5__verificador_drive.py` (novo) — Nível 5 criado. Commit `78dbf07`.
- `agenda_videos/funcoes_auxiliares/drive/verificador.py` — 2 fixes reais (bootstrap do 1º ciclo quando Base está pronta no Drive; grava `SnapshotArquivosDrive` também no caminho individual). `agenda_videos/templates/agenda_videos/parciais/estrutura_parcial_card_produto.html` — botão de verificar Drive movido pra fora do `{% if ciclo_atual %}`. `test_nivel_3__verificador.py` (4 cenários novos/atualizados) e `test_nivel_4__view_agenda_videos.py` (1 teste novo). Commit `d0a4be2`.

**Confirmado em 06/08/2026 via clone fresco do GitHub:** os 4 commits acima existem no branch `dev`, e o diff de cada um bate exatamente com o que foi planejado/pedido na conversa (sem discrepância).

### Sessão 06/08 (Rodada 6 — testes das APIs do agente local) — ainda NÃO commitado

- `api/tests/__init__.py` (novo, vazio) + `api/tests/test_nivel_4__replicacao_automatica_views.py` (novo, 20 testes — 5 rotas de `api/replicacao_automatica`, 100% cover).
- `agenda_videos/tests/test_nivel_3__orquestrador_postagem_automatica.py` (novo, 12 testes — `listar_produtos_elegiveis`/`obter_mlb_do_produto`, achou o bug do Simples).
- `agenda_videos/funcoes_auxiliares/postagem_automatica/orquestrador.py` — 2 fixes reais: `listar_produtos_elegiveis()` (`Q(...) | Q(...isnull=True)` pro Simples) e `resolver_arquivo_da_ocorrencia()` (formato novo do parser — `.obter_fase()`/`.obter_ocorrencia()`/`.completo`).
- `api/tests/test_nivel_4__postagem_automatica_views_sem_drive.py` (novo, 14 testes — as 4 rotas sem Drive de `api/postagem_automatica`).
- `api/tests/test_nivel_4__postagem_automatica_views_drive_simulado.py` (novo, 11 testes — `view_baixar_video`/`view_marcar_concluido`, mock só na borda de rede via `monkeypatch`).
- `scripts_dev/testar_fluxo_real_ml_sem_clicar.py` (novo, script manual — não pytest — pra dry-run real contra o ML, salvo pelo usuário, ainda não executado).

**Confirmado localmente: 357 passed, 0 failed, pacote `api/` inteiro 100% cover.** Estes arquivos JÁ FORAM commitados e sincronizados pelo usuário — commit `2388b1f`, confirmado no GitHub via `git fetch` no clone-sandbox.

### Pendente (entregue em texto, NÃO aplicado) — flag de dry-run da Replicação

- `agente_local/replicacao_ml.py` — 3 mudanças: comentário do topo + import de `posicionar_mouse_com_seguranca`; parâmetro novo `confirmar_de_verdade=False` na assinatura de `replicar_video_no_ml()`; bloco do clique final passa a parar antes do clique quando a flag for `False` (mesmo padrão de `postagem_ml.py`).
- `agente_local/servidor_agente.py` — 1 mudança: a chamada real (fluxo automático de produção) passa `confirmar_de_verdade=True` explícito, pra não mudar nada em produção.
- `scripts_dev/testar_fluxo_real_replicacao_sem_clicar.py` (novo) — gêmeo do script de Postagem, pra Replicação.

**Código completo dos 4 blocos guardado em** [[Flag Temporaria de Confirmacao em Replicar Video no ML]] — nota criada especificamente pra isso não depender da memória desta conversa.

## Convenção de entrega de código (lembrar de imediato)

Claude nunca escreve direto no repo do usuário nem roda pytest/scripts. Todo código é entregue como bloco "Localize: / Substitua por:" (diff nomeado, texto exato do arquivo real) ou arquivo completo, sempre depois de explicar em tópicos simples o que vai mudar e por quê, pro usuário aplicar e rodar localmente — reportando o resultado real de volta (saída de terminal, screenshot, ou descrição precisa do comportamento).

**Reforço crítico, confirmado por incidente real em 04/08 (Bloco C):** isso vale SEM EXCEÇÃO, mesmo pra mudança de 1 linha — como adicionar 1 nome a uma lista de import. Descrever a mudança em prosa ("adicione X à lista de import") em vez de dar o diff exato já causou um `NameError` real de produção, que ficou escondido por várias rodadas de teste até a view específica afetada ser finalmente exercitada. Ver detalhe em [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]] e reforço formal em [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]].

## Relacionado

- [[Estrutura de Telas da Agenda de Videos]]
- [[Mapa de Execucao das 5 Telas da Agenda de Videos]]
- [[Pausa Para Replanejar UX de Filtros e Telas]]
- [[Cache de Indicadores Nao e Populado Automaticamente]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Modelo de Status e Entrada na Agenda]]
- [[Disciplina de Testes Automatizados]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Perguntas Sempre em Texto Corrido]]
- [[Perguntar Data e Hora Antes de Escrever no Vault]]
- [[Validacao de Configuracoes Nao Abre Excecao Para Simples]]
- [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]
- [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
- [[Listar Produtos Elegiveis Ignorava Simples Por Comparacao Com Null]]
- [[Resolver Arquivo Da Ocorrencia Usava Formato Antigo Do Parser]]
- [[Flag Temporaria de Confirmacao em Replicar Video no ML]]
- [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]]
- [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]]
