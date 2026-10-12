---
tipo: duvida
dominio: 
status: aberta
criado: 11/10/2026
atualizado_em: 11/10/2026 22:00
relacionado: [Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Historico de Vendas, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "O 'Vendas R$' da Magiic passa do 'Preço médio × unidades' dela em cerca de R$ 4.076 (0,36%) em 6 de 22 combinações; o nosso faturamento (preço do item × quantidade) bate com o preço médio dela. Hipótese não confirmada: valor pago pelo comprador (juros de parcelamento ou frete). Não afeta unidades nem pedidos da tela; resolver com 1 pedido lido no Mercado Livre, sem pressa."
---

# O que é o acréscimo do "Vendas R$" da Magiic sobre o preço do item?

## Resumo

Na comparação com a Magiic ([[Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Historico de Vendas]]), o faturamento da tela (preço do item × quantidade) bate com o **"Preço médio × unidades"** que a própria Magiic mostra. Só o **"Vendas R$"** dela vem maior, em 6 das 22 combinações anúncio × janela: cerca de **R$ 4.076 (0,36%)** no total. Ainda não sabemos **o que** é esse valor a mais. Hipótese: **dinheiro pago pelo comprador além do preço do item** (juros de parcelamento ou frete). Hoje isso **não afeta** as unidades nem os pedidos da tela.

> [!warning] Status: aberta
> Falta ver **1 pedido real** no Mercado Livre. Não é urgente: a tela de vendas está coerente com o preço do item.

## Contexto

A tela guarda e soma `preco_unitario × quantidade` (o preço do item, vindo de `unit_price` do pedido). O banco **não** guarda `total_amount`, `paid_amount` nem frete. A Magiic mostra, no mesmo relatório, dois números que não concordam entre si: o "Vendas R$" e o "Preço médio" (o "Preço médio × unidades" reproduz o **nosso** faturamento). Termo: **acréscimo** = "Vendas R$" − (preço médio × unidades), os dois da própria Magiic.

## A pergunta

O "Vendas R$" da Magiic soma **o quê** além do preço do item, e isso deveria entrar (ou não) no faturamento da nossa tela?

## O que já se sabe

| Fato | Fonte |
|---|---|
| Em 18 de 22 combinações, nosso R$ = "PM × un" da Magiic (diferença só de arredondamento) | [[Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Historico de Vendas]] |
| O acréscimo está em 6 combinações: MLB1683028746 (+R$ 42,99), MLB1942167064 (+R$ 718,15, +R$ 1.528,50, +R$ 1.473,99) e MLB7574006382 (+R$ 108,87, +R$ 203,40) | idem |
| Por unidade: R$ 0,90 a R$ 1,58 no MLB1942167064 (preço R$ 366,00), cerca de R$ 1,42 no MLB7574006382 (preço R$ 378,90 a R$ 379,98), R$ 14,33 no MLB1683028746 (preço R$ 419,90) | idem |
| Os 3 pedidos do MLB1683028746 (`2000018007200598`, `2000018039438120`, `2000018183964544`) não estão em carrinho (pack); todos têm tag de desconto | idem |
| A Magiic mostra o mesmo acréscimo no Radar e no Elasticidade (por exemplo, MLB1683028746: R$ 5.000,19 contra R$ 4.957,20 nosso) | idem |
| A doc de Orders (`Fontes/Orders.txt`) traz nos exemplos `total_amount`, `paid_amount` e `payments[]` com `installments`, `transaction_amount`, `shipping_cost`, `overpaid_amount` e `total_paid_amount`, mas o texto não explica o que cada um inclui | `Fontes/Orders.txt` |

## O que NÃO sabemos

> [!warning] Lacunas
> - **Qual campo a Magiic soma** no "Vendas R$": `total_amount`, `paid_amount`, `total_paid_amount` ou outro.
> - **O que o acréscimo representa**: juros de parcelamento, frete pago pelo comprador, ou outra coisa. As duas hipóteses são compatíveis com R$ 14,33 igual nos 3 pedidos do MLB1683028746 (mesmo preço, mesmo acréscimo).
> - Em quantos pedidos de cada janela ele aparece: nos anúncios de milhares de unidades o valor por unidade (R$ 0,90 a R$ 1,58) é média; não sabemos se vem de poucos pedidos com valor alto ou de muitos com valor pequeno.
> - Se o acréscimo é **receita do vendedor** ou dinheiro que não é dele (juros e frete costumam não ser do item).

## Como resolver

1. Escolher **1 pedido** simples, por exemplo `2000018039438120` (1 un, R$ 419,90, sem carrinho, MLB1683028746), e ler `GET /orders/{id}`: comparar `total_amount`, `paid_amount` e `payments[]` com R$ 419,90. **1 chamada, 1 pedido** — não é preciso rodar para todos os pedidos nem para todos os SKUs.
2. Se o texto da doc de Orders não bastar para dizer o que cada campo inclui, pedir ao Matheus o HTML da página da doc oficial que explica os campos de pagamento do pedido antes de concluir.
3. Se for juros ou frete pagos pelo comprador: **nosso faturamento do item está certo**; registrar a explicação e fechar a dúvida. Se for outra coisa (por exemplo, ajuste de preço depois do pedido), reabrir a conversa sobre o que a tela deve mostrar.
4. Só decidir mostrar "valor pago pelo comprador" na tela se o Matheus quiser esse número; hoje a tela mostra o preço do item vezes a quantidade, que é o que o preço médio da Magiic reproduz.

## Relacionado

- [[Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Historico de Vendas]] — a comparação que originou a pergunta.
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]] — o trabalho da frente de histórico de vendas.
