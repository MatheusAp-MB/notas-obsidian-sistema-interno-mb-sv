---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 20/09/2026
atualizado_em: 20/09/2026 17:41
relacionado: [[Auditoria do Painel de Mediações — Funções, Fluxo UX e Lacunas Encontradas no Código Atual]], [[Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API]], [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]], [[Refinamento de UX do Painel de Mediações — 5 Correções de Usabilidade e Layout Fixo Estilo WhatsApp Web]]
resumo: Matheus reportou (com screenshots) que uma mediação avulsa cadastrada manualmente pro pedido 2000017939871998 ficava exibida como "Mediação Aberta", com todos os campos em branco, mesmo o pedido já estando encerrado de verdade no Mercado Livre (confirmado via Consultar Pedido). Diagnóstico: status_fluxo de MediacaoAvulsa depende só de data_finalizacao_mediacao, que nada nunca preenchia pra avulsa; só claim_id era resolvido automaticamente, e só na primeira abertura da tela (resolver_claim_por_numero_pedido). Matheus definiu a direção correta: como o próprio motivo de escolher "mediação avulsa" em vez de criar uma "Devolução" completa é não precisar editar nada à mão, o cadastro deve buscar tudo da API automaticamente — e na criação (síncrono, antes do redirect), não só na primeira abertura. Implementada completar_avulsa_automaticamente(), que reaproveita exclusivamente endpoints/padrões já validados no projeto (GET /orders pro nome/produto/preço, resolver_claim_por_numero_pedido pro claim_id, /post-purchase/v2/claims/{id}/returns->date_closed pro status real, mensagens da claim em stage=dispute pra data de abertura) de forma best-effort — falha isolada em qualquer busca só deixa aquele campo em branco, nunca quebra o cadastro. Campo motivo_reclamacao foi tentado e removido depois de aparecer como dict bruto na tela (categorizar_motivo não devolve string pronta) — decisão de Matheus: "é ruído". Confirmado funcionando em produção em 20/09/2026.
---

# Auto-completar Mediação Avulsa na Criação — Bug do Status e dos Dados em Branco Resolvido com Busca Automática na API do ML

## O bug reportado

Matheus mostrou (com screenshots) uma mediação avulsa cadastrada manualmente pro pedido `2000017939871998`: aparecia como "Mediação Aberta", com nome do cliente, produto, preço e datas todos em branco — mesmo o pedido já estando encerrado de verdade (confirmado abrindo o mesmo pedido em "Consultar Pedido", que mostrava "Encerrado — Item trocado").

## Diagnóstico

- `MediacaoAvulsa.status_fluxo` (property) depende só de `data_finalizacao_mediacao` — `STATUS_MEDIACAO_ENCERRADA` se tiver data, `STATUS_MEDIACAO_ABERTA` se não. Nada em nenhum lugar do código escrevia esse campo pra uma avulsa.
- `adicionar_mediacao_avulsa` só gravava `numero_pedido` na criação (`MediacaoAvulsa.objects.create(numero_pedido=numero_pedido)`).
- O único preenchimento automático existente rodava na `view` de `mediacoes_ml`, e só quando `claim_id` ainda estava vazio: resolvia `claim_id` via `resolver_claim_por_numero_pedido`, sem tocar em nenhum outro campo.
- O `ClaimMercadoLivre` cacheado por essa resolução leve também não tinha `nome_cliente`/`nome_produto` — esses só são populados pela varredura completa em segundo plano (`GET /orders/{numero_pedido}`), um caminho totalmente diferente.
- Não existe (nem existia) nenhuma tela de edição manual pra `MediacaoAvulsa`.

## Decisão de design (Matheus)

Matheus: se a Ana escolhe cadastrar como "mediação avulsa" em vez de criar uma "Devolução" completa, é justamente porque ela quer que o sistema complete a informação sozinho — se ela quisesse editar campo por campo, teria usado "Devolução" (que já tem formulário completo pra isso). O próprio docstring do model já sinalizava essa intenção original: `MediacaoAvulsa` existe como model "enxuto" justamente pra não exigir os campos obrigatórios demais de `Devolucao`.

Consequência: ao cadastrar uma mediação avulsa, **tudo** que a API do ML já responde sozinha deve ser buscado automaticamente, pra ficar o mais completo possível — incluindo o status real (`data_finalizacao_mediacao`), não só nome/produto/preço.

Segunda decisão, sobre o gatilho: buscar **na criação** (síncrono, dentro do POST de `adicionar_mediacao_avulsa`, antes do redirect) em vez de na primeira abertura da tela (que reaproveitaria o gancho já existente, com menor custo perceptível mas dado incompleto até o primeiro clique).

## Implementação: `completar_avulsa_automaticamente()`

Nova função em `devolucoes/varredura_mediacoes.py`, chamada por `adicionar_mediacao_avulsa` logo após criar o registro. Só roda se a empresa ativa tiver conta mapeada; cada busca é best-effort (falha isolada não quebra o cadastro, só deixa aquele campo em branco — mesmo espírito de `buscar_nome_cliente_e_produto`/`resolver_claim_por_numero_pedido`, já validados em produção):

- **nome_cliente, nome_produto, preco_produto** — `GET /orders/{numero_pedido}`, mesma extração já validada em `view_consultar_pedido` (`buyer.first_name/last_name`, `order_items[0].item.title`, `order_items[0].unit_price` — este último irmão de `item`, não aninhado nele).
- **claim_id** — reaproveita `resolver_claim_por_numero_pedido` sem alteração nenhuma.
- **data_finalizacao_mediacao** — `date_closed` de `GET /post-purchase/v2/claims/{claim_id}/returns`, mesmo campo já usado como `esta_encerrado` em `_classificar_pedido_leve` e em `view_consultar_pedido`. É o que resolve o bug: o badge de status passa a refletir a realidade sem tocar em mais nada do resto da tela.
- **data_abertura_mediacao** — menor `date_created` entre as mensagens da claim com `stage == "dispute"`, mesma lógica de `_data_abertura_disputa` (portada pra dentro do arquivo em vez de importada, pra reaproveitar `_buscar_mensagens_da_reclamacao` que já existe neste mesmo módulo).
- Datas convertidas pro fuso `America/Sao_Paulo` antes de virar `date()` (`_para_date_local`, nova função auxiliar) — sem isso, um evento perto da meia-noite podia gravar no dia errado.

**Não reaproveitada de propósito**: `buscar_nome_cliente_e_produto` (usada pela varredura) não devolve preço, e `ClaimMercadoLivre` (o model que ela alimenta) não tem esse campo — por isso `completar_avulsa_automaticamente` faz sua própria chamada a `/orders/`, em vez de estender uma função já validada e arriscar a varredura em produção.

**Campos deixados de fora**: `reembolsado` e `valor_reembolsado` não têm extração comprovada em nenhum lugar já validado do projeto (dependeria de interpretar `status_money`, o que seria supor comportamento da API sem confirmação) — continuam manuais. `observacao` continua manual sempre, por natureza (é o espaço livre da Ana).

## Ajuste: `motivo_reclamacao` removido

Tentativa inicial incluía `motivo_reclamacao` via `categorizar_motivo(claim.get('reason_id'))` (mesma função usada em `view_consultar_pedido`). Ao testar, apareceu na tela como o dict bruto (`{'texto': 'Produto defeituoso', 'confirmado': True}`) em vez de um texto — `categorizar_motivo` devolve um dict estruturado, não uma string pronta, e isso não foi tratado ao reaproveitar a função fora do contexto original. Matheus decidiu remover o campo inteiro ("é ruído") em vez de consertar a formatação — `motivo_reclamacao` segue sempre manual.

## Validação

Confirmado por Matheus funcionando em produção (20/09/2026, ~17:41) pro pedido `2000017939871998`: nome do cliente (Rafael Ramos Machado), preço (R$ 409,90), data de abertura (24/08/2026), data de encerramento (28/08/2026) e badge "Mediação Encerrada" — todos corretos.

## Arquivos alterados

`devolucoes/varredura_mediacoes.py` (nova função `completar_avulsa_automaticamente` + `_para_date_local`, import de `Decimal`/`InvalidOperation`), `devolucoes/views.py` (`adicionar_mediacao_avulsa` chamando a função nova). Diffs entregues como texto puro (Localize/Substitua) na conversa; Matheus aplicou e testou do lado dele.
