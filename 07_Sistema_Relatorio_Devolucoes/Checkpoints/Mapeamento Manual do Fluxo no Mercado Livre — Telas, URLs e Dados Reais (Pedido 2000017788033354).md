---
tipo: checkpoint
dominio:
status: em_andamento
criado: 15/09/2026
atualizado_em: 15/09/2026 23:39
relacionado: [Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta, Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354), Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções, Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]
resumo: Mapeamento manual, tela a tela, do caminho real percorrido na Central de Vendedores do Mercado Livre pra localizar os dados de uma devolução/mediação (pedido de teste `2000017788033354`), antes de aplicar as 3 telas idealizadas em [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]; mapeamento das 5 telas concluído (15/09/2026), próxima fase é comparar cada campo contra o retorno real da API.
---

# Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)

**Resumo do estado atual**: antes de aplicar as 3 telas idealizadas em [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]], o usuário está mapeando manualmente, tela por tela, o caminho real que a responsável pela devolução percorre dentro da Central de Vendedores do Mercado Livre pra achar essas informações — usando o mesmo pedido já validado como caso de teste, `2000017788033354` (ver [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]). Pra cada tela: print, HTML salvo da página e a URL real. Objetivo: comparar contra o que a API devolve, item por item, antes de mexer em qualquer tela do sistema. **Atualização (15/09/2026 22:31)**: o mapeamento tela por tela está concluído — Matheus confirmou que não há mais telas além das 5 registradas aqui (Tela 01 a Tela 05). Próxima fase: comparar cada campo contra o retorno real da API. **Atualização (15/09/2026 23:39)**: comparação campo a campo concluída via API real — script `consultar_linha_tempo_devolucao.py` (já migrado pro repo de Devoluções, ajustado pra receber `--empresa`/`--candidato`) rodado contra esse mesmo pedido. Quase todo campo bateu exato; 1 divergência aparente (data de postagem da devolução) foi investigada e explicada em [[Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]].

> [!warning] 5 telas mapeadas — falta comparar contra a API
> As 5 telas do fluxo (Tela 01 a Tela 05) foram registradas e confirmadas por Matheus (15/09/2026) — não há mais telas nesse caminho. Falta comparar cada campo mapeado aqui contra o retorno real da API do Mercado Livre, antes de aplicar o que foi confirmado nas 3 telas idealizadas do Hub de Consulta.

*Nota de estrutura*: este checkpoint não tem uma seção "## Linha do tempo" separada — as seções "## Tela 0X" abaixo fazem esse papel aqui, documentando o mapeamento na ordem real em que cada tela foi percorrida e registrada.

## Tela 01 — Busca do pedido dentro de Vendas

**URL real**: `https://vendedores.mercadolivre.com.br/vendas/omni/lista?filters=&subFilters=&search={pedido}&limit=50&offset=0`

Ponto de entrada do fluxo: abre o Mercado Livre, pesquisa o número do pedido dentro da seção "Vendas", e essa é a tela de resultado.

### Campos confirmados nesta tela

- **Número do pedido** — aparece na página como `pack_id` (classe `left-column__pack-id`), não como "order_id". Terminologia real do ML: o que chamamos de "número do pedido" é o pack id.
- **Data/hora da venda** — "6 ago 11:21 hs" (classe `left-column__order-date`).
- **Local de despacho** — "POMPÉIA AVENIDA DOS EXPEDICION" (pill de agência/ponto de expedição — dado logístico, não é dado da devolução em si).
- **Indicador de reputação** — "Não afeta sua reputação" (classe `left-column__reputation-container`).
- **Cliente** — nome "Edgar Augusto" (classe `buyer-name`) + nickname/usuário "AUED9564022" (classe `buyer-nickName`) — o nickname não é um código de pedido, é o usuário do comprador no ML.
- **Produto** — nome completo "Cadeira De Transferência Elevação Hidráulica Idoso Acamados" (mais longo que o nome já registrado antes).
- **Item do Mercado Livre (item_id)** — a foto do produto linka pra `produto.mercadolivre.com.br/MLB-6428928550-...` → item id real **MLB6428928550**.
- **Quantidade** — "1 unidade" (classe `sc-product-data__qty`).
- **Preço unitário** — "R$ 1.399" (bruto — bate com o valor líquido de cancelamento R$ 1.184,07 já documentado, descontada a taxa).
- **SKU** — `F7908598902054.001` (classe `sc-product-data__sku-value`).
- **Nota fiscal** — ícone confirma "Nota fiscal emitida".
- **Anotação manual do vendedor** — "Reembolsado - ana" (campo de texto livre, editável ali mesmo na tela — `row-notes`/`read-text`). Provavelmente **não é dado estruturado exposto pela API pública** (é uma nota manual da equipe, não um campo da venda) — confirmar isso quando testarmos a API. Confirmado por Matheus (15/09/2026): quem escreve essa nota é a responsável pelo setor de devolução (a usuária final do sistema), direto na tela do ML. Detalhado na Tela 02 abaixo: lá aparecem mais 2 notas na mesma seção "Observações" e o modelo de autoria completo da conta.
- **Status resumido** — "Devolução finalizada com reembolso para o comprador", com a descrição "Entendemos que você recebeu o produto conforme o esperado. Chegou terça-feira, 8 de setembro." (confirma a data de devolução física: 08/09).

### Padrões de URL (deep link) confirmados nesta tela

Relevantes pros atalhos "Abrir no Mercado Livre" do Hub de Consulta idealizado:

- **Pedido (detalhe da venda)**: `https://www.mercadolivre.com.br/vendas/{pedido}/detalhe`
- **Mensagens com o comprador**: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}` — 4º atalho possível, não cogitado antes.

Ainda faltam confirmar os padrões de URL de reclamação e mediação — devem aparecer nas próximas telas do fluxo.

## Tela 02 — Detalhe da venda

**URL real**: `https://www.mercadolivre.com.br/vendas/{pedido}/detalhe` — mesmo padrão de deep link "Pedido (detalhe da venda)" já registrado na Tela 01, confirmado batendo 100%.

Chegada ao clicar em "Ir para detalhe" a partir da Tela 01.

### Campos confirmados nesta tela

- **CPF do comprador** — "22794569821", exposto ao lado do nickname na Central de Vendedores.
- **Tag da venda** — "Venda por publicidade" (não aparecia na Tela 01).
- **Linha do tempo da devolução (direção Cliente → Nós)** — card expansível ("Ver mais"/"Veja menos"), 4 eventos confirmados com data e hora:
  - "No endereço do comprador" — 24 ago 17:13 — "O comprador está preparando o pacote."
  - "A caminho" — 27 ago 17:53 — "Estamos levando o pacote ao Centro de distribuição."
  - "A caminho" — 8 set. 11:05 — "O pacote está a caminho do seu endereço."
  - "Devolvido no seu endereço" (estado atual) — 8 set. 11:59 — "O pacote foi entregue."
- **Financeiro completo da devolução** (rótulo "Recebimento devolvido #171447691787 | 6 de agosto" — esse `#171447691787` é só rótulo de exibição que expande a lista de 5 linhas abaixo, não é ID de navegação):
  - Preço do produto: R$ 1.399,00
  - Tarifa de venda total: -R$ 167,88
  - Envios: -R$ 107,05
  - Estorno: R$ 60,00
  - Cancelamentos: -R$ 1.184,07 (bate com o valor líquido já documentado em [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]])
  - Total: R$ 0,00
  - Nota: os R$ 60,00 de estorno vêm de uma redução na tarifa de venda por participação em campanha comercial
- **Dados do depósito** — endereço completo "Pompéia Avenida dos Expedicion - Avenida dos Expedicionários de Pompeia 145" (confirma o nome truncado da Tela 01; Matheus confirmou que esse dado não vai ser usado no sistema, não aprofundar)
- **Nota fiscal completa** — NF-e #17344/20, emissão 06/08/2026 11:34, chave de acesso `3526080722663600010355020000017344136767416`, além de um `invoice_id` interno (`6685836444`, usado nos links de DANFE) diferente do número exibido e da chave de acesso
- **Observações (3 notas, não 1 — a Tela 01 sozinha só mostrava a primeira)**:
  1. "Reembolsado - ana" — 14 de setembro, 18:07
  2. "Recebido - Ana 10/09 - Produto retorna com marcas - riscado e sujo" — 10 de setembro, 11:48
  3. "motivo devolução: não deu certo" — 24 de agosto, 15:19

  Todas aparecem como "Adicionada de Vendas por Alessandro Domingos". **Modelo de autoria confirmado por Matheus (15/09/2026)**: a conta usada no painel é compartilhada, cadastrada em nome de Alessandro Domingos, mas quem escreve de fato é a responsável pelo setor de devolução (a Ana) — ocasionalmente outra pessoa (ex.: SAC), mas em ~99% dos casos é ela, sempre se identificando pelo próprio nome dentro do texto da nota. Ou seja: o campo de autoria que o sistema/API deve expor não identifica quem realmente escreveu — só a conta compartilhada.
- **"Ver histórico da venda"** — não é link de página, abre um modal (`/sales/action/modal_problems_affectations`)

### Padrões de URL (deep link) confirmados nesta tela

- **Mediação**: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/mediacao/{id_mediacao}` — nesse caso, mediação `5564889989`. **Resolve um dos pontos em aberto do checkpoint.**
- **Mercado Pago** (botão "Ir para o Mercado Pago"): `https://www.mercadopago.com.br/activities/detail/order-{hash}` — id em formato hash, sem relação direta óbvia com o número do pedido
- **Faturamento** (botão "Ir para o detalhe de tarifas"): `https://myaccount.mercadolivre.com.br/billing/cnc/detail/charges?searchText={pedido}&fromSales=true`
- **DANFE da nota fiscal**: `https://myaccount.mercadolivre.com.br/invoices/api/invoices/{invoice_id}/danfe/{chave_acesso}` (e versão simplificada em `/emissor/documentos/danfe-simplificada/{invoice_id}/download`)

Ainda falta confirmar o padrão de deep link de reclamação (claims) — deve aparecer em telas futuras.

## Tela 03 — Modal "Histórico da venda"

Não é uma tela separada — é um modal que abre por cima da Tela 02 (mesma URL) ao clicar em "Ver histórico da venda". `contentUri`: `/sales/action/modal_problems_affectations`. **Direção Nós → Cliente** (envio original da venda até o comprador, mais a reclamação/mediação que nasceu dali) — não confundir com a linha do tempo da devolução (Cliente → Nós) registrada na Tela 02.

### Campos confirmados

- **Bloco de dados por trás do modal** (nomes de campo próximos da API real):
  - `packId: 2000017788033354` / `orderId: 2000017788033354` (coincidem aqui — pack com 1 pedido só)
  - `problems`: lista de eventos, cada um com `type`, `entityId`, `date` (ISO) e `status`:
    - `{ type: "DELIVERED", entityId: 47700447430, date: "2026-08-08T15:25:48Z" }` — **entrega original ao comprador** (não é a devolução)
    - `{ type: "CLAIMS_DISPUTES", entityId: 5564889989, date: "2026-08-23T17:04:07Z", status: "CLOSED" }` — mesmo `entityId` já visto como mediação na Tela 02; reclamação e mediação compartilham o mesmo id, só o `type` muda
  - `messagingBlockedReason: "blocked_by_cancelled_order"` — mensageria fica bloqueada quando o pedido está cancelado
- **Linha do tempo exibida**: "6 de agosto — Você vendeu" → "23 de agosto #5564889989 — Reclamação: 'O comprador disse que chegou em boas condições, mas o comprador não quer mais o produto.'" + "Mediação: 'Fomos informados que o produto chegou avariado.'" → "8 de agosto #47700447430 — Entregue"
  - **Correção**: no print a data da reclamação aparecia como "25 de agosto"; o HTML e o timestamp ISO confirmam **23 de agosto**.
  - Essa é a 3ª versão do motivo de devolução vista pra esse pedido (bate com a nuance "motivo em 3 versões" já documentada em [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]).

### Padrões de URL (deep link) confirmados nesta tela

- **Reclamação**: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/reclamacao/{id_reclamacao}` — **resolve o último ponto em aberto de URL do checkpoint.**

Com isso, os padrões de deep link mapeados até aqui: pedido, mensagens, mediação, reclamação, Mercado Pago, Faturamento, DANFE.

## Tela 04 — Ver reclamação encerrada (mensagens da reclamação)

**URL real** (copiada da barra de endereço, confirmado por Matheus 15/09/2026 que todas as URLs desse mapeamento são copiadas e coladas direto do Mercado Livre, não digitadas de memória): `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/reclamação/{id_reclamacao}` — com acento.

**Nuance confirmada**: o `href` real do link "Ver reclamação encerrada" gravado no HTML (tanto na Tela 03 quanto nesta) usa a forma sem acento — `.../reclamacao/{id_reclamacao}`. As duas formas levam pra mesma página; provavelmente o Mercado Livre reescreve a URL na barra de endereço (client-side, tipo React) depois de navegar. Registrar as 2 formas até confirmarmos se é sempre assim.

Chegada ao clicar em "Ver reclamação encerrada" a partir do modal da Tela 03.

### Campos confirmados

- **Seller ID real da conta**: `161534973` (aparece como `sellerId`/`callerId` no JSON da página) — primeiro identificador de conta que achamos, útil pra qualquer chamada de API.
- **2 abas**: "Mensagens com o comprador" (`/packs/{pack_id}/sellers/{seller_id}`) vs "Mensagens com o Mercado Livre" (`/packs/{pack_id}/sellers/{seller_id}/claims/{claim_id}`) — a própria estrutura de path já separa mensagem direta do comprador de mensagem dentro do escopo da reclamação/mediação.
- **Motivo real da devolução, nas palavras do comprador** (mensagem dele, 23 de agosto 14:04): "Motivo da devolução a cama nao é compatível com a cama da minha vó (ela tem uma cama Cama Articulada Motorizada) abertura do apartamento nao cabe" + follow-up 14:05: "Ops Abertura do aparelho nao cabe" — **4ª versão do motivo** vista pra esse pedido (soma com a nuance "motivo em 3 versões" já documentada em [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]).
- **2 anexos de imagem** (`.heic`) enviados pelo comprador junto da mensagem, com URL de download: `https://vendedores.mercadolivre.com.br/api/messages/packs/{pack_id}/sellers/{seller_id}/messages/attachments/{attachment_id}.heic?siteId=MLB&tag=claim&claimId={claim_id}&dispute=false`
- **Message id real**: cada mensagem tem id próprio no DOM (ex.: `01a02f95b8dc7cf19792824eb05e548d`), classe `message--counterpart` marca mensagem vinda do comprador.
- **Banner de encerramento**: "Reclamação encerrada com mediação do Mercado Livre n.º 5564889989" + link "Ver mediação" — mesmo id de sempre; não achei data absoluta no HTML, só "Ontem" (relativo ao momento da captura).
- **Aviso final**: "A venda não foi concluída e não é possível entrar em contato. Seu comprador poderá te escrever, se necessário, e você poderá responder quando isso acontecer." — relacionado à nuance `messagingBlockedReason` já vista na Tela 03.

Não trouxe padrão de URL novo além da nuance do acento acima — só reforça reclamação/mediação já mapeados.

## Tela 05 — Ver mediação encerrada (mensagens com o Mercado Livre)

**URL real** (copiada da barra de endereço): `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/mediação/{id_mediacao}` — com acento. **Confirmado no HTML**: o `href` real por trás é sem acento, `.../mediacao/{id_mediacao}` — mesma nuance da Tela 04 (reclamação/reclamacao), agora reconfirmada pro link de mediação.

Chegada ao clicar em "Ver mediação encerrada" (link já visto nas Telas 03 e 04). Essa página não carrega o mesmo bloco de estado JSON que a Tela 04 tinha (`sellerId`, `sender_role` etc.) — os campos abaixo vêm do texto renderizado no HTML.

### Campos confirmados

- **Razão social do vendedor exposta ao mediador/comprador**: "FARMACIA SAMVALE" / "FARMACIA SAMVALE LTDA ME".
- **Mediadores do Mercado Livre identificados por nome** (atendimento rotativo — pelo menos 3 pessoas diferentes no mesmo caso): Brenda, Bemylli, Gabriela.
- **Linha do tempo completa da negociação de reembolso**:
  - 24 ago 16:02 (Brenda) — produto excede limites/dimensões dos Correios; comprador vai agendar retirada direto no endereço dele.
  - 10 set — sistema registra: "Você recebeu a devolução e nos informou que chegou em boas condições, mas o comprador não quer mais o produto." + vendedor anexa "Produto retornou com riscos e sujo" com **7 fotos confirmadas no HTML** (`536bb2ef1ecd422eb963f760d5c3c5de.jpg`, `57cfa0687add45cdaf9e5f7edf41227c.jpg`, `2049c699c48d4c99b4677cede78f4738.jpg`, `a9debbb528784b919ee57884e0ad4476.jpg`, `e58cef3caae34834a34a04ef0509b695.jpg`, `bb74a28c7ef04f2bafc875cb2e7a3e3b.jpg`, `bebbec84a313483b837d468c3d2633ba.jpg`) — 11:49
  - 10 set (Bemylli) — pede preço aproximado do item até 11/09
  - 11 set 16:01 — vendedor: "Valor total do produto: 1.399,00"
  - 11 set 16:08 (Bemylli) — pede valor correspondente só aos danos, não ao produto inteiro
  - "Ontem" (relativo à captura) 11:34 — vendedor: "R$ 500,00"
  - "Ontem" 13:48 (Gabriela) — confirma reembolso de R$ 500,00 no Mercado Pago, mesmo número de operação já registrado na Tela 02 (`171447691787`)

### Sem novo padrão de URL
Só reforça o link de mediação já mapeado, com a nuance do acento reconfirmada.

## Em aberto

- [x] Continuar registrando tela por tela — concluído: 5 telas ao todo (Tela 01 a Tela 05), confirmado por Matheus (15/09/2026) que não há mais telas nesse fluxo
- [ ] Confirmar se as anotações manuais ("Observações") são acessíveis via API ou são exclusivas da interface
- [x] Achar o padrão de deep link real de mediação — confirmado na Tela 02: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/mediacao/{id_mediacao}`
- [x] Achar o padrão de deep link real de reclamação (claims) — confirmado na Tela 03: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/reclamacao/{id_reclamacao}`
- [x] Depois de mapeado o fluxo inteiro, comparar cada campo contra o retorno real da API via terminal — concluído (15/09/2026): quase tudo bateu exato; a única divergência (data de postagem da devolução) foi explicada em [[Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]]

## Relacionado

- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
- [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]
- [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]
- [[Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]]
