---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 11/08/2026
atualizado_em: 11/08/2026 15:05
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Contexto Geral - Retomada em Outro Computador (Integracao Sysemp), Modal de Produto — Aba Impostos (Entrada e Saida), Orquestracao da Sincronizacao de Impostos de Entrada via XML]
---

# Melhoria Contínua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada

## Contexto

Registrado em 11/08/2026, 15:05 — o usuário precisou trocar de frente de trabalho e não vai conseguir seguir com estes pontos por enquanto. Não é um item abandonado nem um bloqueio real: é um backlog de melhoria contínua, sem prazo, pra retomar quando houver disponibilidade. Consolida os pontos que já estavam em aberto no [[Checkpoint — Exploracao de Dados Fiscais Sysemp]] e no [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]] no momento da pausa.

## Frente 1 — Modal de produto (tela de Produtos)

Do plano original de 5 etapas (ver [[Modal de Produto — Aba Impostos (Entrada e Saida)]]), a etapa 1 (aba Impostos) está feita e validada. A etapa 2 (Visão Geral reduzida + NCM migrado pra Impostos) foi idealizada e aprovada por mockup, e o código já foi entregue ao usuário nesta mesma sessão (11/08/2026) — mas **ainda não aplicado nem testado**, portanto continua em aberto até confirmação real. Faltam:

- **Confirmar a etapa 2** (Visão Geral reduzida: remove card Financeiro, Controle com só 3 campos, Dimensões embaladas dividida em 2 cards; + campo `ncm` novo no guarda-chuva, exibido no card de resumo da última nota) — aplicar o diff, rodar `makemigrations`/`migrate` do app `impostos`, rodar `reprocessar_impostos_entrada_de_json` de novo (backfill do `ncm` nos produtos já sincronizados) e testar visualmente.
- **Nova aba "Dados do produto nas plataformas"** — tabela por marketplace (Códigos Associados, Publicado? — já existe via `ProdutoAnuncioMarketplace.anunciado` —, e "Permitido Publicar?" — não existe em lugar nenhum ainda, precisa decisão de modelagem antes de idealizar a tela).
- **Nova aba "Resumo de Precificação"** — mostrar a precificação do produto por marketplace. A mais complexa das etapas restantes; precisa investigar o app `precificacao` (já tem 6 grades por marketplace + `resumo_marketplaces.py`) antes de qualquer mockup.
- **Sem prazo, decisão futura:** migrar as 6 fórmulas de precificação do marketplace pra ler das tabelas de `impostos` em vez dos campos genéricos e soltos do `Produto`.

## Frente 2 — Backend / pipeline de sincronização

Mais antiga, independente do modal:

- **Desenhar o reprocessamento do histórico antigo** (320 produtos que erraram por campo de imposto `null` na 1ª rodada real, banco de casa) — decisão do `null→0` já tomada e validada em carga real; falta só o desenho de como reprocessar sem rechamar a API inteira de novo.
- **Investigar os 2055 produtos** (54% dos selecionados no manifesto) sem `Produto` correspondente no banco pelo EAN — descontinuado de verdade, ou divergência de formato de EAN entre Sysemp e o cadastro?
- **Implementar `manage.py iniciar_servidor`** — hoje o disparo da sincronização é manual (`sincronizar_impostos_entrada`); o comando que substituiria o boot direto do `runserver` nunca foi escrito.
- **Definir cooldown entre tentativas de falha consecutivas** — o campo `data_ultima_chamada` do watermark já sustenta isso, falta a regra de negócio.
- **Decidir onde/como aparece o aviso visual de "dados desatualizados"** na tela, e o formato do botão manual de sincronizar.

## Relacionado

- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]
- [[Modal de Produto — Aba Impostos (Entrada e Saida)]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
