---
tipo: descoberta
dominio: 
status: ativa
criado: 12/10/2026
atualizado_em: 12/10/2026 01:15
relacionado: [Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search, O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Com sort=date_desc o /orders/search ordena pelo date_closed (fechamento), não pela data de criação: em 20 pedidos do dia 24/11/2025, 0 pares fora de ordem em date_closed e expiration_date, contra 5 em date_created e 9 em date_last_updated. A doc de Orders já dizia 'Sellers por date_closed'. Medido em 1 chamada, 20 pedidos."
---

# O `sort=date_desc` do Orders Search Ordena por `date_closed` e Não por Data de Criação

## Resumo

Em 12/10/2026, uma chamada de 20 pedidos mostrou que o `/orders/search` com `sort=date_desc` ordena a lista pela **data de fechamento do pedido (`date_closed`)**, e **não** pela data de criação (`date_created`) nem pela data de última atualização. Isso combina com a doc de Orders (`Fontes/Orders.txt`), que diz: "Sellers por date_closed" (para vendedores) e "Buyers por date_created". O filtro de data da busca, porém, usa `date_created` (ver [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]): **a busca filtra por uma data e ordena por outra**.

> [!info] Status: ativa
> Medido com 1 chamada e 20 pedidos, em 1 dia (24/11/2025, conta MB). A doc e a medição concordam. Consequência prática: dois pedidos fechados no mesmo segundo ficam **empatados** na ordem, e o ML pode trocá-los de lugar entre uma chamada e outra ([[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]).

## Contexto

O coletor lê cada janela em páginas de 50 pedidos, com `sort=date_desc` e `offset` crescente. Esse tipo de paginação só é seguro se a ordem da lista **não muda** entre uma chamada e a seguinte. Surgiu a dúvida quando o 1º pedido da lista de um dia (24/11/2025) tinha sido **criado às 12:44:32**, embora existissem pedidos criados às 23:57 do mesmo dia: a lista **não** estava em ordem de criação.

Termos:

| Campo do pedido | O que é |
|---|---|
| `date_created` | Quando o pedido foi **criado** (é o que o filtro de data usa e o que o sistema usa como dia da venda). |
| `date_closed` | Quando o pedido foi **fechado/confirmado** (normalmente quando o pagamento é aprovado). Pode ser horas ou dias **depois** da criação. Precisão de **1 segundo**. |
| `expiration_date` | Prazo do pedido; é `date_closed` + 28 dias, por isso ordena igual a `date_closed`. |
| `date_last_updated` | Última atualização do pedido. |

## A pergunta

Pelo que o `sort=date_desc` ordena de verdade? Foi proposto um script de 1 chamada para responder (`conferir_ordem_do_sort_do_orders_search.py`).

## O que levou à resposta

A chamada: dia 24/11/2025, `to = 23:00` (a janela exata do dia), `limit=20`, 1 requisição HTTP, nada gravado. O ML anunciou 465 pedidos; vieram 20. Para cada campo de data foi contado quantos **pares vizinhos** estão fora da ordem decrescente:

| Campo | Pares fora da ordem decrescente | Veredito |
|---|---|---|
| `date_closed` | **0** de 19 | ordena por ele |
| `expiration_date` | **0** de 19 | igual (é `date_closed` + 28 dias) |
| `date_created` | 5 de 19 | não ordena por ele |
| `date_last_updated` / `last_updated` | 9 de 19 | não ordena por ele |

A hipótese inicial, ao escrever o script, era `date_last_updated`; o resultado real a **refutou**. A doc de Orders (`Fontes/Orders.txt`) já continha a resposta, e foi lida só depois da medição.

## Resposta

`sort=date_desc` = **ordem decrescente de `date_closed`** (segundo a doc, para vendedores; confirmado em 20 pedidos). `date_asc` é o padrão da API quando não se manda `sort`.

## Exemplo

O pedido que abria a lista do dia 24/11/2025 foi **criado** em 24/11 às 12:44:32, mas **fechado** só em 27/11 às 19:06:31, por isso aparece **antes** de pedidos criados às 23:57 do dia 24 e fechados às 23:57:30 do mesmo dia:

| Posição | Criado em | Fechado em |
|---|---|---|
| 1 | 24/11/2025 12:44:32 | 27/11/2025 19:06:31 |
| 2 | 24/11/2025 23:57:28 | 24/11/2025 23:57:30 |
| 3 | 24/11/2025 23:33:53 | 24/11/2025 23:33:55 |

## Limites

- **1 dia e 20 pedidos** só; o padrão ficou claro (0 pares fora de ordem), mas não foi medido em outros dias.
- Pedido **sem** `date_closed` (por exemplo, ainda não pago) não tem posição estável nessa ordem: possível segunda causa de pedido trocando de página; **não medido**.

## Relacionado

- [[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]
- [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
