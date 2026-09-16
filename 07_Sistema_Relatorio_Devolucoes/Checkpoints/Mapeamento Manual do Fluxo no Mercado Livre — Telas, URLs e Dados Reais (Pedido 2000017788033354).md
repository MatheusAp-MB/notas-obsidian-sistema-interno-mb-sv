---
tipo: checkpoint
dominio:
status: em_andamento
criado: 15/09/2026
atualizado_em: 15/09/2026 21:57
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
- **Anotação manual do vendedor** — "Reembolsado - ana" (campo de texto livre, editável ali mesmo na tela — `row-notes`/`read-text`). Provavelmente **não é dado estruturado exposto pela API pública** (é uma nota manual da equipe, não um campo da venda) — confirmar isso quando testarmos a API. Confirmado por Matheus (15/09/2026): quem escreve essa nota é a responsável pelo setor de devolução (a usuária final do sistema), direto na tela do ML.
- **Status resumido** — "Devolução finalizada com reembolso para o comprador", com a descrição "Entendemos que você recebeu o produto conforme o esperado. Chegou terça-feira, 8 de setembro." (confirma a data de devolução física: 08/09).

### Padrões de URL (deep link) confirmados nesta tela

Relevantes pros atalhos "Abrir no Mercado Livre" do Hub de Consulta idealizado:

- **Pedido (detalhe da venda)**: `https://www.mercadolivre.com.br/vendas/{pedido}/detalhe`
- **Mensagens com o comprador**: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}` — 4º atalho possível, não cogitado antes.

Ainda faltam confirmar os padrões de URL de reclamação e mediação — devem aparecer nas próximas telas do fluxo.

## Em aberto

- [ ] Continuar registrando tela por tela (Tela 02 em diante) conforme o usuário for enviando
- [ ] Confirmar se a anotação manual do vendedor ("Reembolsado - ana") é acessível via API ou é exclusiva da interface
- [ ] Achar o padrão de deep link real de reclamação e de mediação
- [ ] Depois de mapeado o fluxo inteiro, comparar cada campo contra o retorno real da API via terminal

## Relacionado

- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
- [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]
- [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]
