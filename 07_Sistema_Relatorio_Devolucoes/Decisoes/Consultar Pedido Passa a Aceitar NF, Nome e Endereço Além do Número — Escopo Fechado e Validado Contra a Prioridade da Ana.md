---
tipo: decisao
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_andamento
criado: 17/09/2026
atualizado_em: 17/09/2026 02:21
relacionado: [[De "Tela que Funciona" para "Tela que Entrega Valor" — Feedback da Ana Redireciona as Prioridades do Projeto]], [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]], [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]]
resumo: Escopo fechado (Idealizar) pra expandir a tela "Consultar Pedido" — hoje só aceita número do pedido — pra também aceitar Nota Fiscal, nome do cliente ou endereço, resolvendo o problema real de identificar o pedido de um pacote em mãos (principalmente devoluções do Full, cuja etiqueta branca não traz nenhuma informação útil). ERP fica fora do escopo. Validado sem conflito contra a decisão da Ana — reforça, não contraria, a prioridade de fechar lacunas reais em telas existentes.
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

## Em aberto / Próximo passo

- [ ] Planejar: entender como a tela "Consultar Pedido" busca hoje pelo número do pedido (endpoint/lógica interna já usada) antes de desenhar o caminho novo pra NF/nome/endereço — só depois de confirmação explícita de Matheus pra sair do Idealizar.
