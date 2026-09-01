---
tipo: checkpoint
dominio: 
status: concluido
criado: 31/08/2026
atualizado_em: 01/09/2026 17:27
relacionado: [Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao), Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra, Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre, Flag Temporaria de Confirmacao em Replicar Video no ML, MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma, Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar, Revisao com Calma das Notas da Agenda de Videos - Pendencia Pos-Urgencia de Postagem]
---

# Checkpoint — Postagem, Verificação e Replicação Autônomas da Agenda de Vídeos

> [!important] Objetivo desta nota (criada 31/08/2026, 09h07)
> Reconfirmar, ponto a ponto e junto com o usuário, o estado real de 3 frentes: Postagem Automática, Verificação de Aprovação e Replicação Automática. Motivo: o checkpoint anterior (ver "Relacionado") tinha informação válida, mas com pelo menos 1 inconsistência confirmada (tabela de status desatualizada em relação ao texto da própria nota) — em vez de editar por cima, a decisão foi reconstruir do zero, só com fatos reconfirmados a partir de hoje. O checkpoint anterior fica preservado, sem edição de conteúdo, até esta nota estar completa e validada — depois disso será excluído.
>
> Regra desta nota: nada entra aqui sem confirmação explícita do usuário no momento da escrita — nenhum status é herdado por suposição do checkpoint anterior, mesmo quando parecer óbvio.

> [!success] Resultado final (01/09/2026, 17h27)
> Nas palavras do usuário: "Funcionou corretamente em 95%, não vi nenhuma falha crítica, apenas pontos de polimento e melhoria/reforço. No geral funcionou muito bem e atendeu ao que eu precisava a curto prazo, agora é com o tempo ir testando e melhorando." As 3 frentes (Postagem, Verificação, Replicação) foram fechadas nesta data — os detalhes de cada uma, incluindo os bugs reais encontrados e corrigidos no caminho, estão nas 3 seções abaixo.

## Postagem Automática

**O que é**: a etapa em que o sistema pega o vídeo de um produto (já aprovado no fluxo interno) e posta ele de verdade como um Clip no Mercado Livre, vinculado a 1 anúncio específico daquele produto — identificado pelo **MLB** (o código único que o Mercado Livre dá a cada anúncio, por exemplo `MLB1234567890`).

**Regra nova aplicada nesta sessão — postar só em MLB Ativo do tipo Simples**: o usuário identificado que o sistema podia escolher, pra postar o vídeo, qualquer anúncio vinculado ao produto — incluindo um que estivesse pausado, ou um que fosse do tipo **Catálogo** (o modelo do Mercado Livre em que vários vendedores competem numa mesma "folha" de produto — postar ali não tem o mesmo efeito de postar no anúncio "de verdade" da loja) ou **Base** (um anúncio que está tecnicamente vinculado a um catálogo, mas não é a folha vencedora — pro efeito desta regra, conta como Catálogo também). Isso foi corrigido na função `obter_mlb_do_produto` (arquivo `agenda_videos/funcoes_auxiliares/postagem_automatica/orquestrador.py`): agora ela só aceita um anúncio cujo status seja **Ativo** e cuja classificação seja **Simples** — nunca Base, nunca Catálogo. Quando o produto não tem nenhum MLB elegível, a função devolve `None`, e o agente local (`agente_local/servidor_agente.py`, função `_processar_execucao`) já checa isso **antes de baixar o vídeo** — evitando gastar um download inteiro (e um espaço da pausa anti-bot) num item que nunca ia conseguir postar mesmo. Correção commitada em `0c0f2da` ("Modo teste seguro na Replicação + regra MLB Ativo/Simples na Postagem").

**Estado de produção**: a Postagem Automática já roda com clique real de verdade (não é modo teste) — a própria automação (`postar_video_no_ml`, chamada em `agente_local/servidor_agente.py`) já está com `confirmar_de_verdade=True` fixo, decisão de 31/08 já tomada em sessão anterior. O usuário confirmou nesta conversa que já rodou a Postagem Automática de ponta a ponta em produção ("já postei tudo"), sem reportar nenhuma falha crítica.

## Verificação de Aprovação

**O que é**: depois de o vídeo ser postado, o Mercado Livre analisa e aprova (ou recusa) o Clip. A Verificação de Aprovação é a etapa em que o agente local abre a tela de cada anúncio e lê, na prática, qual desses 2 estados está aparecendo — pra então atualizar o ciclo do produto no sistema.

**Bug real encontrado e corrigido nesta sessão**: o usuário testou de outro computador e percebeu que, mesmo depois de uma análise ser concluída, a tela da Agenda de Vídeos continuava mostrando o produto como "aguardando aprovação" — o status parecia não estar sendo atualizado. Causa raiz confirmada: todas as telas da Agenda de Vídeos filtram os produtos por um campo de cache chamado `IndicadoresAgendaProduto.etapa_atual` — **nunca** direto pelo status real do ciclo (`CicloVideo.status`). Esse campo de cache só é recalculado quando alguém chama explicitamente a função `sincronizar_indicadores_agenda_produto` (arquivo `agenda_videos/funcoes_auxiliares/sincronizar_roadmap_agenda.py`) — e a view que processa o resultado da Verificação (`view_marcar_concluido`, arquivo `api/verificacao_aprovacao/views.py`) não estava chamando essa função depois de aplicar o novo estado. Ou seja: o banco de dados estava certo (`CicloVideo` avançava normalmente), mas a tela ficava presa no valor antigo do cache, sem ninguém perceber — o mesmo tipo de "desatualização silenciosa" que o próprio comentário do modelo `IndicadoresAgendaProduto` já alertava. Corrigido adicionando a chamada faltante logo depois de `aplicar_estado_lido`, só quando o resultado for `'atualizado'`. Commit `758e4f0` ("fix(verificacao_aprovacao): sincroniza indicadores da Agenda após aplicar estado lido").

**Estado de produção**: a Verificação de Aprovação já rodou de ponta a ponta para 1 das 2 empresas do sistema — o usuário confirmou que ela "finalizou para uma das empresas", resultando em 30 vídeos com status **Aprovado**, prontos pra entrar na Replicação Automática.

## Replicação Automática

**O que é**: depois de um vídeo ser aprovado no MLB onde foi postado originalmente, a Replicação Automática usa o recurso "Mostrar em outros anúncios" do Mercado Livre pra copiar esse mesmo Clip pros outros MLBs do mesmo produto (variações de cor, tamanho, etc. — os "MLBs irmãos"). Essa automação vive em `agente_local/replicacao_ml.py`, função `replicar_video_no_ml`.

### Bug de segurança crítico — modo teste gravava no banco mesmo sem clicar

Antes de qualquer teste com produto real, foi encontrado (e corrigido antes de causar dano) um problema sério: o modo teste da Replicação (parâmetro `confirmar_de_verdade=False`, que existe pra fazer todo o caminho na automação e só posicionar o mouse sobre o botão final "Escolher anúncios", sem clicar de verdade) sempre devolvia `sucesso=True` mesmo sem clicar em nada. O agente local (`agente_local/servidor_agente.py`) não conferia esse detalhe — via só o `sucesso=True` e chamava `marcar_concluido_replicacao`, que por sua vez chama `CicloVideo.marcar_replicado()` e grava, de verdade, no banco: `status=REPLICADO`, data de replicação, e avança o produto pro próximo ciclo. Ou seja: **um teste "seguro" ia enganar o banco de dados**, marcando os 30 produtos aprovados como replicados de verdade, sem nenhum clique real ter acontecido no Mercado Livre.

**Correção aplicada** (commit `0c0f2da`): uma única constante nova, `CONFIRMAR_REPLICACAO_DE_VERDADE`, foi criada no topo de `agente_local/servidor_agente.py` — enquanto ela for `False`, o fluxo **nunca** chama `marcar_concluido_replicacao`; em vez disso, chama uma rota nova (`marcar_testado_sem_confirmar_replicacao`) que marca o item com um status novo, `TESTADO_SEM_CONFIRMAR` (armazenado no banco como `testado_sem_click` — precisou ser um nome curto porque o campo `status` do modelo `ItemExecucaoReplicacao` aceita no máximo 20 caracteres), sem tocar em `CicloVideo`. Esse item aparece na tela de progresso com um ícone de 🧪 (tubo de ensaio), deixando claro visualmente que aquilo foi só um teste.

### 2 bugs reais encontrados durante o teste supervisionado (modo seguro)

Com o modo seguro em funcionamento, o usuário testou a Replicação de verdade (navegador real, sem clicar no fim) e encontrou 2 problemas:

| Bug relatado | Causa raiz confirmada | Correção |
|---|---|---|
| F8 (pausar/retomar) e F9 (cancelar a execução) pareciam não responder | Postagem Automática (pausa de 30s) e Verificação de Aprovação (pausa de 10s) já tinham uma espera anti-bot entre 1 item e o próximo — e é justamente durante essa espera que o sistema confere, a cada 1 segundo, se o usuário pediu cancelamento. A Replicação Automática nunca teve essa pausa — então o único instante em que o F9 era conferido era o intervalo bem curto entre 1 item terminar e o próximo começar, o que dava a impressão de tecla "sem efeito" | Ver linha abaixo — a mesma correção resolveu os 2 bugs |
| Faltava a pausa anti-bot entre uma replicação e outra (o usuário pediu 15 segundos) | Nunca foi implementada pra esse fluxo — só existia pra Postagem e Verificação | Nova constante `DELAY_ENTRE_REPLICACOES_SEGUNDOS = 15` e nova função `_aguardar_entre_replicacoes`, em `agente_local/servidor_agente.py`, seguindo exatamente o mesmo padrão de `_aguardar_entre_postagens` e `_aguardar_entre_leituras_verificacao` — contagem regressiva visível na janela de aviso, conferindo F9 a cada segundo. Commit `056b4b1` |

**Limitação que ficou, por decisão consciente**: F8/F9 continuam sem efeito enquanto a automação de 1 item específico está rodando (procurando e marcando os MLBs irmãos na tela) — só são conferidos entre 1 item e o próximo (topo do laço) e durante a pausa de 15 segundos. É o mesmo comportamento já aceito há mais tempo na Postagem Automática (`postar_video_no_ml` também não é interrompível no meio). O usuário, ao ser perguntado, confirmou que esse nível de checkpoint é suficiente — não pediu a mudança maior (que exigiria alterar a automação compartilhada pra checar cancelamento MLB a MLB).

### Primeira execução real (clique de verdade no Mercado Livre)

Com os 2 bugs acima corrigidos e testados, o usuário decidiu ativar a produção de verdade: a constante `CONFIRMAR_REPLICACAO_DE_VERDADE` foi alterada de `False` pra `True` em `agente_local/servidor_agente.py` — o único lugar do sistema que precisa mudar pra isso acontecer, por desenho.

Resultado da primeira execução real, rodando os 30 produtos aprovados de uma vez só (decisão do usuário, mesmo tendo sido oferecida a opção de testar um lote pequeno primeiro): **25 concluídos, 5 falharam, 0 cancelados.**

> [!warning] As 5 falhas — investigação em aberto, decisão do usuário: tentar de novo sem mudar nada
>
> | Produto (marca) | Mensagem de erro | Horário |
> |---|---|---|
> | KIT COM 3 ALGICIDA CHOQUE 1 LITRO DUPLO ATIVO PARA PISCINAS (QUIMIVIDA) | Nenhum dos 1 MLB(s) foi encontrado na busca | 11:52:10 |
> | KIT COM 3 ALGICIDA DE MANUTENCAO 1 LITRO DUPLO ATIVO PARA PISCINAS (QUIMIVIDA) | Nenhum dos 1 MLB(s) foi encontrado na busca | 11:52:38 |
> | KIT COM 3 LIMPA BORDAS PARA PISCINA 1 LITRO REMOVE GORDURA (QUIMIVIDA) | Nenhum dos 1 MLB(s) foi encontrado na busca | 11:54:10 |
> | MANGUEIRA 10M REGISTRO ENGATE RÁPIDO BICO CURTO SNOW FOAM (MAGAZINE BRASILEIRO) | Campo de busca não encontrado na tela de escolher anúncios | 12:02:56 |
> | PULVERIZADOR MANUAL COSTAL AGRÍCOLA JACTO XP12 12L (JACTO) | Nenhum dos 10 MLB(s) foi encontrado na busca | 12:03:51 |
>
> Ponto de atenção pra próxima sessão: as 2 últimas falhas (MANGUEIRA e PULVERIZADOR) aconteceram em sequência direta (12:02:56 e 12:03:51) — vale investigar se a primeira falha (campo de busca não encontrado) deixou o navegador num estado que prejudicou a tentativa seguinte (10 MLBs, nenhum encontrado, é um número alto pra dar zero de acerto). O usuário decidiu, nesta sessão, rodar esses 5 itens de novo sem alterar nenhum código antes — pra descartar acaso pontual do Mercado Livre antes de investigar mais a fundo.

## Relacionado

- [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]] (nota anterior, sendo substituída)
- [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]] (nota anterior, sendo substituída)
- [[Verificar Aprovacao ou Recusa Automaticamente na Tela do Mercado Livre]]
- [[Flag Temporaria de Confirmacao em Replicar Video no ML]] (desatualizada — descreve um plano de 06/08 que não reflete mais o código atual; ver observação abaixo)
- [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]
- [[Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]]
