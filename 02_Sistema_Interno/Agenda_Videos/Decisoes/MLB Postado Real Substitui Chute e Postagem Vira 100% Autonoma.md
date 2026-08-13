---
tipo: decisao
dominio: 
status: ativa
criado: 13/08/2026
atualizado_em: 13/08/2026 12:00
relacionado: [Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra, Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar, Flag Temporaria de Confirmacao em Replicar Video no ML]
---

# MLB Postado Real Substitui Chute — Postagem Vira 100% Autônoma

## Bug relacionado, encontrado antes deste: elegibilidade da Replicação usava tela errada

Antes de chegar no problema do MLB, testando "Iniciar Replicação Automática de Hoje" apareceu um produto errado na lista (Tesoura Poda Árvores, em vez do Botão Regulador que a tela "Aguardando Postar/Replicar" já mostrava como pendente). Causa, confirmada lendo o código real: `view_confirmar_replicacao_automatica`/`view_iniciar_replicacao_automatica` (`agenda_videos/views.py`) ainda usavam `listar_produtos_agenda_filtrados(tela=Tela.A_FAZER_HOJE, filtros={'motivo_a_fazer_hoje': ['replicar']})` — resíduo de antes da reestruturação de 12/08 (o próprio `motivo_a_fazer_hoje` já tinha sido retirado do motor de filtros nessa reestruturação, virou um filtro morto que não faz nada). `Tela.A_FAZER_HOJE` tem escopo fixo pra produção real (base/roteiro/completo/recusado) — nunca inclui postar/replicar.

**Resolução:** as 2 views passaram a usar `listar_produtos_agenda_filtrados(tela=Tela.AGUARDANDO_POSTAR_REPLICAR, filtros={'aba': 'replicar'})`, igual ao resto do motor de filtros. Confirmado pelo usuário que passou a trazer o produto certo.

## O problema real (achado testando Replicação, 13/08)

Testando a Replicação Automática num produto (Botão Regulador de Pressão), o sistema tentou replicar a partir do MLB 3295488400 — mas nenhum vídeo tinha sido postado lá. O vídeo real tinha sido postado **manualmente por um humano da equipe**, fora do sistema, no MLB 37302667. Investigando o código (`obter_mlb_do_produto()`, usado tanto pela Postagem quanto pela Replicação), a causa raiz: essa função nunca soube "qual MLB recebeu o vídeo de fato" — sempre pegava o `.first()` de `VariacaoAnuncioMercadoLivre.objects.filter(produto=produto)`, sem ordenação nem critério nenhum. Funciona por acaso quando a Postagem automática é quem posta (ela mesma escolhe o MLB e posta lá, autoconsistente) — quebra sempre que um humano posta manualmente num MLB diferente do "primeiro" da tabela.

## Solução decidida: campo novo `CicloVideo.mlb_postado`

Proposta do usuário: "no momento que a pessoa ou o sistema clicar em 'confirmar postagem' deve aparecer um popup com o campo 'Digite o MLB que foi postado'". Implementado como:

1. **`CicloVideo.mlb_postado`** (campo novo, migração `0023_ciclovideo_mlb_postado`) — guarda o MLB real que recebeu o vídeo, nesse ciclo.
2. **Clique manual de "Postar"** (`_acao_postar`, `agenda_videos/views.py`) — modal ganhou campo obrigatório "MLB que foi postado"; sem preencher, a confirmação é rejeitada (`HttpResponseBadRequest`).
3. **Postagem automática** — já sabe o MLB com certeza (é ela mesma que escolhe e posta) — passa esse valor direto pra `marcar_ciclo_atual_aguardando_aprovacao(produto, mlb_postado=mlb)`, sem popup nenhum.
4. **Replicação** (`api/replicacao_automatica/views.py::view_listar_itens`) — passa a usar `ciclo_atual.mlb_postado` como origem, caindo no `.first()` antigo só se o campo estiver vazio (ciclos criados antes dessa mudança).
5. **Card do produto** — badge novo "Postado no MLB: X", ao lado de "Já postado hoje", visível só entre "postou" e "replicou de verdade" (`CicloVideo.mlb_postado_para_exibir`, propriedade no model — nunca lógica de campo cru no template, mesmo padrão de `etapa_atual()`). Some sozinho depois de replicar (ciclo novo nasce sem `mlb_postado`) e também não aparece se a postagem foi recusada e voltou pra "Completo" (checa `status`, não só a presença do campo).

**Status: aplicado e commitado.** Migração rodou sem erro. Badge confirmado visualmente funcionando (print real do card).

## Decisão derivada: Postagem vira 100% autônoma

Depois de entender o problema acima, o usuário decidiu ir mais longe: **"eu quero tirar essa flag e literalmente deixar o sistema postar autônomo... ai eu garanto que ele mesmo postou, ele mesmo marcou o MLB."**

Antes, `postagem_ml.py` sempre parava antes do clique final em "Enviar vídeo" (decisão anterior, sem flag nenhuma — hardcoded). Agora ganhou `confirmar_de_verdade=False` (mesmo padrão de `replicacao_ml.py`), e o call site real (`servidor_agente.py::_processar_execucao`) passa `confirmar_de_verdade=True` explícito — a Postagem em produção clica de verdade, sem intervenção manual. Isso fecha o problema de origem pela raiz: o mesmo processo que posta é sempre o mesmo que grava o `mlb_postado`, nunca mais 2 fontes divergentes.

`confirmar_de_verdade=False` continua sendo o padrão da função — só existe pra manter os scripts de dry-run (nunca usados em produção) seguros, caso alguém precise testar de novo sem clicar.

**Status: aplicado no código, migração rodou — mas ainda sem 1 execução real de teste depois dessa mudança.** Próximo teste de Postagem precisa confirmar o clique de verdade funcionando + o MLB certo sendo gravado.

## Pendências conhecidas (não resolvidas nesta sessão)

- CSS do badge `badge-postado-mlb` sem estilo próprio (herda `badge-tabela`).
- `orquestrador.py` (código morto em produção, usado só pelo script standalone `scripts_dev/testar_fluxo_real_ml_sem_clicar.py`) recebeu o mesmo ajuste de repasse de `mlb_postado`, por consistência — mas não foi tocado além disso.
- Caso raro: se uma postagem for recusada e o usuário clicar "nova tentativa", `mlb_postado` do ciclo antigo não é limpo (fica no registro, mas não é mais mostrado — `mlb_postado_para_exibir` já filtra por `status`).

## Relacionado

- [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]]
- [[Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]]
- [[Flag Temporaria de Confirmacao em Replicar Video no ML]]
