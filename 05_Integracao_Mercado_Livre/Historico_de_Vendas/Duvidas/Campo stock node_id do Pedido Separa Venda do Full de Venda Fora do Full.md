---
tipo: duvida
dominio: 
status: resolvida
criado: 10/10/2026
atualizado_em: 11/10/2026 21:18
relacionado: [Abandonar o Endpoint de Operacoes do Full para o Historico de Vendas, Checkpoint - Historico de Vendas e Calendario de Vendas, Niveis de Granularidade do Full e Como os Dados se Ligam, Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos, Envios Reais Confirmam o node_id do Pedido Como Origem da Venda do Full e do Fora do Full]
resumo: "O pedido do /orders/search traz order_items[].stock.node_id; no único pedido do Full que temos salvo ele é igual à origem do envio (BRSP11). Se esse campo separar venda do Full de venda fora do Full, não precisamos chamar /shipments por pedido — falta testar com pedidos de logísticas diferentes. RESOLVIDA em 11/10/2026: separa, com 1 ajuste (o nó próprio é BRP + código do vendedor; BRPE01 e BRPR01 são centros do Full) — ver a decisão."
---

# O Campo stock.node_id do Pedido Separa Venda do Full de Venda Fora do Full?

## Resumo

Cada item de um pedido do Mercado Livre traz um bloco `stock` com um campo `node_id`. No único pedido do Full que já temos salvo, esse `node_id` é igual ao `node_id` de **origem do envio**. Se isso valer sempre — Full com um código de centro de distribuição, fora do Full com outro valor —, dá para separar **venda do Full × venda fora do Full** só olhando o pedido, **sem** 1 chamada a `/shipments` por pedido. Hoje é **uma amostra só**: não dá para afirmar nada ainda.

> [!success] Status: resolvida (11/10/2026)
> Sim: o `node_id` do pedido separa venda do Full de venda fora do Full, com **1 ajuste** — o que identifica "fora do Full" não é o prefixo `BRP`, e sim o **nó próprio** (`BRP` + código do vendedor); `BRPE01` e `BRPR01` são centros do Full. Conferido com 80 envios reais (20 de 10/10/2026 e 60 de 11/10/2026): a regra acertou o tipo de logística em todos os 60 da última rodada. A resposta e o raciocínio completos estão em [[Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos]]; os fatos medidos, em [[Envios Reais Confirmam o node_id do Pedido Como Origem da Venda do Full e do Fora do Full]]. **O restante desta nota é o registro de como a pergunta estava antes de ser resolvida e não foi alterado.**

## Contexto

O calendário de vendas precisa de 5 níveis: Produto, Produto no Full, Produto fora do Full, por MLB e por Código ML (ver [[Checkpoint - Historico de Vendas e Calendario de Vendas]]). Os níveis **Produto no Full** e **Produto fora do Full** exigem saber, para cada venda, se ela saiu do Full.

O pedido (`/orders/search`) só traz o `shipping.id` — o número do envio. A **logística** (Full, Coleta, Agência, Flex) mora no próprio envio (`GET /shipments/{id}`, campo `logistic.type`). Chamar `/shipments` uma vez por pedido "ia explodir a quantidade de chamadas" (preocupação do Matheus), por isso procuramos um sinal **dentro do pedido**.

Termo: **nó** (*node*) é o "lugar" de onde o item sai — um centro de distribuição do Full ou um depósito do vendedor, identificado por um código.

## A pergunta

O valor de `order_items[].stock.node_id` do pedido identifica de forma confiável se a venda saiu do Full?

## O que já se sabe

| Fato | Fonte |
|---|---|
| Pedido `2000018341680948` (MB, 08/09/2026): `order_items[0].stock = {"store_id": null, "node_id": "BRSP11"}` | `scripts_exploracao_ML/investigacao_venda_2000018341680948.json` |
| O envio desse pedido (`47959728530`) tem `logistic = {mode: "me2", type: "fulfillment", direction: "forward"}` — ou seja, foi uma venda do **Full** | `scripts_exploracao_ML/investigacao_shipment_47959728530.json` |
| O mesmo envio tem `origin.node.node_id = "BRSP11"` — **igual** ao `node_id` do pedido | idem |
| A doc de Packs lista `order_items.stock.store_id` e `order_items.stock.network_node_id` (nó do vendedor ou local físico de onde o item vem), como atributos novos de Estoque Distribuído e Multi-origem | `Fontes/Packs.txt` |
| No dado real o campo se chama `node_id`, **não** `network_node_id` como na doc | pedido salvo acima |

## O que NÃO sabemos

> [!warning] Lacunas
> - Só temos **1 pedido** do Full; **nenhum** pedido de Coleta, Agência ou Flex para comparar.
> - Não sabemos se o campo existe em **todos** os pedidos, nem se vem `null` quando a venda não é do Full.
> - Não sabemos se vendas fora do Full trazem um `node_id` **diferente** (depósito do vendedor) ou o mesmo tipo de código.
> - "`BRSP11` é um centro de distribuição do Full" é **inferência** (o envio é `fulfillment` e a origem é a mesma). A doc não diz.
> - Um MLB com estoque em mais de um lugar (convivência Full e Flex) pode vender de nós diferentes, então a regra pode não ser por MLB.

## Como resolver

1. No script de exploração, pegar cerca de 20 pedidos de ontem (de preferência com logísticas variadas) e chamar `/shipments/{id}` de cada um.
2. Montar a tabela: `node_id` do pedido × `logistic.type` do envio.
3. Se todo pedido Full tiver o `node_id` de centro de distribuição e nenhum outro tiver, a regra vale: o coletor classifica pelo pedido, sem chamar `/shipments`.
4. Se falhar, as alternativas são: chamar `/shipments` só para os pedidos ambíguos; ou classificar pela tag de logística do MLB no Hub de Anúncios (aproximação, errada nos MLBs mistos).

## Relacionado

- [[Abandonar o Endpoint de Operacoes do Full para o Historico de Vendas]] — por que precisamos recuperar essa separação por outro caminho.
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]] — os 5 níveis do calendário.
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]] — os níveis de dado do Full.
