---
tipo: decisao
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_andamento
criado: 17/09/2026
atualizado_em: 17/09/2026 15:11
relacionado: [[De "Tela que Funciona" para "Tela que Entrega Valor" — Feedback da Ana Redireciona as Prioridades do Projeto]], [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]], [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]]
resumo: Escopo fechado (Idealizar) pra expandir a tela "Consultar Pedido" pra aceitar também Nota Fiscal, nome do cliente ou endereço, além do número. Validado sem conflito contra a decisão da Ana. Planejar (17/09) descartou a API do Mercado Livre como fonte pra esses 3 campos (nome vem vazio no /orders/search, sem busca por endereço, sem busca reversa de NF, custo alto de chamadas) — a busca por NF/nome/endereço fica bloqueada até existir uma API de consulta do ERP, que já tem os dados prontos e sincronizados pra todos os canais de venda. Número do pedido não é afetado.
---

# Consultar Pedido Passa a Aceitar NF, Nome e Endereço Além do Número — Escopo Fechado e Validado Contra a Prioridade da Ana

## Contexto

Toda a investigação anterior sobre os códigos da etiqueta de envio (QR/código de barras, Ref. ID, ID do triage Item — ver [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]]) partiu de um problema real, nunca explicitado até agora: "como encontrar de maneira eficiente o pedido referente ao pacote que tenho em mãos agora". Isso é ainda mais crítico nas devoluções do Full, cujo pacote real fotografado trouxe confirmação física: a etiqueta branca não traz nenhuma informação útil (Ref. ID, código de barras, rota — sem NF, sem nome), só a etiqueta amarela do triage carrega o número do pedido.

Hoje, quando falta um jeito fácil de identificar o pedido, a colega responsável pela devolução precisa sair do sistema, abrir o site do Mercado Livre (Central de Vendedores) e, às vezes, o ERP, pra achar o pedido fora do sistema — só depois voltando pra "Consultar Pedido" e digitando o número. A tela de entrada do fluxo real ("chegou o pacote → acha o pedido → vê o resumo completo organizado") já existe e já é usada todo dia — falta fechar essa lacuna.

## Escopo fechado

A tela **Consultar Pedido** (hoje aceita **somente** o número do pedido) passa a aceitar também:

1. **Número do pedido** (2000...) — melhor forma, mantém como está.
2. **Nota Fiscal** — confiável quando presente, mas nem sempre vem no pacote.
3. **Nome do cliente** — ajuda a achar o cliente e, a partir dele, localizar as devoluções associadas.
4. **Endereço do cliente** — pior opção, usada só como último recurso.

Qualquer uma dessas formas deve resolver internamente pro pedido correspondente e mostrar o mesmo resumo completo e organizado que a tela já mostra hoje pra busca direta por número — sem telas ou fluxos paralelos.

## Fora de escopo

- **ERP**: não entra nessa frente — hoje não existe conexão via API com ele, e isso não muda. Continua sendo consulta manual externa, exatamente como é hoje.

## Relacionado, mas não incluído aqui

- Código ao lado do nome do cliente na etiqueta (ex: `#443851581`), hipótese não testada de ser o `buyer.id` do pedido — fica registrado como frente separada em [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]], não faz parte deste escopo.

## Validação contra a decisão da Ana

Antes de fechar esse escopo, foi feita uma checagem explícita contra [[De "Tela que Funciona" para "Tela que Entrega Valor" — Feedback da Ana Redireciona as Prioridades do Projeto]] (decisão de 16/09/2026 que redirecionou a prioridade do projeto pra fechar lacunas reais em telas existentes, em vez de investir em funcionalidade nova sem valor comprovado). Conclusão: **sem conflito, e reforça a decisão**.

- A própria nota da Ana já cita "Consultar Pedido" no item de "Em aberto" sobre mapear a integração/navegação entre as telas do sistema — a tela já estava no radar da virada de prioridade.
- Essa mudança tem a mesma natureza dos 4 pontos que a Ana levantou (fotos, filtro de mediações, peças, cadastro): não é tela nova nem conceito novo, é fechar uma lacuna no meio de um fluxo que já existe e já roda todo dia.
- Diferença honesta: essa demanda não veio de um dos 4 pontos que a Ana relatou — veio da vivência operacional do próprio Matheus, que também tem experiência direta com devolução e ajuda a colega com frequência na prática. Mesma categoria de dor real, origem diferente.

## Planejar — Investigação Fecha a Via da API do ML pra NF/Nome/Endereço (17/09/2026)

- View atual (`integracao_mercado_livre/views.py`, `view_consultar_pedido`) revisada (só leitura): é 100% baseada em ID — recebe `numero_pedido` e faz só 2 chamadas que já dependem de ter esse número (`GET /post-purchase/v1/claims/search?order_id=`, `GET /orders/{id}`). Não existe hoje nenhuma etapa de resolução de NF/nome/endereço pro `order_id` — precisaria ser criada do zero.
- Testado `GET /orders/search` na prática (janela real de 7 dias, conta MB): respondeu rápido — 0,38s pro `/orders/search`, 0,75s no total com o `/users/me` — velocidade não é o problema.
- MAS o nome do comprador (`first_name`/`last_name`) veio **vazio em todos os 50 pedidos** retornados. O "buyer" resumido desse endpoint de busca em lote só traz `nickname`/`id` — o nome completo só existe no `GET /orders/{id}` individual (o mesmo endpoint que a view já usa hoje, mas só pra 1 pedido já conhecido). Endereço também não vem nesse endpoint (só via shipment, outra chamada por pedido).
- Volume real medido: **1.249 pedidos em 7 dias, só na conta MB** (~178/dia). Montar um índice de nomes a partir da API do ML exigiria 1 chamada `/orders/{id}` por pedido, pra esse volume inteiro (SV somaria mais) — caro e pesado só pra CONSTRUIR, antes de qualquer manutenção.
- Documentação oficial (consultada via 2 IAs em paralelo, com citação de trecho) confirmou, de forma independente do teste prático: `/orders/search` não pesquisa por nome real (o parâmetro `q` explicitamente ignora `first_name`/`last_name`/`email`) nem por endereço; e a API de Notas Fiscais do ML só resolve nota↔pedido quando já se sabe um dos dois lados — nunca existe busca reversa a partir do número impresso da NF.
- Matheus pretende pedir, no futuro, acesso via API à tabela de notas fiscais do próprio ERP — que já vem pronta e sincronizada, e cobre TODAS as vendas (6 marketplaces, não só os ~70% do volume que vêm do Mercado Livre), ao contrário de qualquer índice que a gente monte só com dados do ML.

## Conclusão — Precisamos da API do ERP pra Essa Busca (17/09/2026)

**A busca por Nota Fiscal, nome do cliente ou endereço não é viável via API do Mercado Livre** — nem em tempo real (a documentação não permite esses filtros), nem via índice próprio sincronizado (o custo de chamadas pra obter nome/endereço, mais a cobertura parcial de só 1 entre 6 canais de venda, tornam inviável). **O único caminho viável pra esses 3 campos é uma futura API de consulta oferecida pelo próprio ERP.** Até essa API existir, esse pedaço do escopo fica bloqueado — não cancelado, só sem caminho técnico disponível ainda.

Número do pedido continua funcionando exatamente como hoje, sem nenhuma dependência disso.

## Em aberto / Próximo passo

- [x] Planejar: entender como a tela busca hoje pelo número — concluído (é 100% baseada em `order_id`, ver seção acima).
- [ ] **Bloqueado**: busca por NF, nome ou endereço — aguardando Matheus conseguir acesso à API de notas fiscais do ERP. Sem essa API, não há caminho técnico viável identificado.
- [ ] Quando a API do ERP existir: retomar o Planejar pra essa frente, desenhando a integração a partir da tabela do ERP (não da API do ML).
