---
tipo: checkpoint
dominio:
status: em_andamento
criado: 15/09/2026
atualizado_em: 15/09/2026 22:07
relacionado: [Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta, Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354), Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]
---

# Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)

**Resumo do estado atual**: antes de aplicar as 3 telas idealizadas em [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]], o usuário está mapeando manualmente, tela por tela, o caminho real que a responsável pela devolução percorre dentro da Central de Vendedores do Mercado Livre pra achar essas informações — usando o mesmo pedido já validado como caso de teste, `2000017788033354` (ver [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]). Pra cada tela: print, HTML salvo da página e a URL real. Objetivo: comparar contra o que a API devolve, item por item, antes de mexer em qualquer tela do sistema.

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
- **Linha do tempo da devolução** — "No endereço do comprador" → "A caminho" → "Devolvido no seu endereço" (estado atual, 8 set. 11:59 — "O pacote foi entregue").
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

## Em aberto

- [ ] Continuar registrando tela por tela (Tela 03 em diante) conforme o usuário for enviando
- [ ] Confirmar se as anotações manuais ("Observações") são acessíveis via API ou são exclusivas da interface
- [x] Achar o padrão de deep link real de mediação — confirmado na Tela 02: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/mediacao/{id_mediacao}`
- [ ] Achar o padrão de deep link real de reclamação (claims)
- [ ] Depois de mapeado o fluxo inteiro, comparar cada campo contra o retorno real da API via terminal

## Relacionado

- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
- [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]
- [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]
