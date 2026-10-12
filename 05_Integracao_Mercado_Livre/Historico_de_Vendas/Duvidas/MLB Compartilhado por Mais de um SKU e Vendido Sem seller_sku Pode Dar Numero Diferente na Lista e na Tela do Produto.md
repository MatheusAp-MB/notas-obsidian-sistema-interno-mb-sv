---
tipo: duvida
dominio: python
status: em_aberto
criado: 12/10/2026
atualizado_em: 12/10/2026 04:14
relacionado: [Substituir a Tela Sem SKU de Vendas por uma Lista por Produto Anuncio e Codigo ML, Tutorial - Como Testar a Lista de Vendas e Conferir Contra a Tela do Produto, Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios, Niveis de Granularidade do Full e Como os Dados se Ligam, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Pelo código: um pedido SEM seller_sku, de um MLB que serve a mais de um SKU e sem variação que o separe, é contado nos DOIS SKUs pela tela do produto e vai para a linha 'Sem cadastro' na lista. Se isso existir no banco real, a lista e a tela do produto mostram unidades diferentes para esses SKUs. Não se sabe se acontece (160 de 160 itens medidos traziam seller_sku). O script de conferência mostra."
---

# MLB Compartilhado por Mais de um SKU e Vendido Sem seller_sku Pode Dar Número Diferente na Lista e na Tela do Produto

## Resumo

Ao escrever a lista nova de vendas ([[Substituir a Tela Sem SKU de Vendas por uma Lista por Produto Anuncio e Codigo ML]]) comparei a regra dela com a da tela do produto e achei **um caso em que as duas podem dar números diferentes**. É uma conclusão tirada **do código**; **ainda não foi visto no banco real**.

> [!question] Status: em aberto
> Falta saber **se o caso existe** nos dados reais e, se existir, **qual das duas telas deve mudar**. Hoje as duas regras não são iguais **só neste caso**. Nenhuma das duas foi alterada.

## Contexto: como cada tela liga uma venda a um SKU

O pedido do Mercado Livre normalmente traz o `seller_sku` (o SKU que o vendedor colocou no anúncio). Nos **160 itens medidos antes**, **160** traziam. Quando **não** traz, é preciso adivinhar o SKU pelo MLB.

| Tela | Regra para pedido **sem** `seller_sku` (arquivo e função) |
|---|---|
| **Tela do produto** (`vendas_ml.py`, `_carregar_linhas` e `_anotar`) | Entra no SKU **todo** pedido sem `seller_sku` cujo MLB esteja no cadastro **daquele SKU**; se o pedido traz variação e ela **não é** do SKU, fica de fora |
| **Lista** (`lista_vendas_ml.py`, `_atribuir`) | Entra num SKU **só** se o MLB (e a variação, se o pedido trouxe) aponta para **um único SKU** no cadastro; com **mais de um candidato**, vai para a linha **"Sem cadastro"** |

## A pergunta

Num MLB que serve a **mais de um SKU** (anúncio com variações ligadas a produtos diferentes), um pedido **sem `seller_sku` e sem variação** deve ser contado onde?

| Tela | O que acontece com esse pedido |
|---|---|
| Tela do produto | Conta **nos dois SKUs** (cada tela de produto acha o MLB no cadastro dele) |
| Lista | Conta **em nenhum SKU**: vai para "Sem cadastro" |

Consequência se o caso existir: o **total da lista por SKU** e o **total de cada tela de produto** diferem nessas unidades, e a soma das telas de produto passa a conta toda (conta em dobro). A soma da **própria lista** continua fechando (SKU = MLB = Código ML), porque cada pedido entra uma vez só.

## O que já se sabe

- O comportamento acima **está no código** (arquivos e funções da tabela).
- A lista **avisa** na tela quando há unidades na linha "Sem cadastro" (aviso do tipo "unidades vendidas sem SKU no pedido e sem um SKU único no cadastro").
- O script `conferir_lista_de_vendas_contra_a_tela_do_produto.py` foi escrito para esse caso: ele mostra **"DIFERE"** para o SKU cujo número não bate e imprime a dica de que é "um MLB que serve a mais de um SKU e vendeu sem `seller_sku` no pedido".

## O que NÃO sabemos

> [!warning] Lacunas
> - Se **existe** MLB compartilhado por mais de um SKU com venda **sem** `seller_sku` na conta MB (e na SV).
> - **Quantas unidades** isso representa. Se for zero ou quase, o assunto se encerra sem mudar código.
> - Qual regra Matheus quer, se o caso existir: (a) a lista **adivinha** como a tela do produto (conta nos dois, o que soma em dobro na conta toda), (b) a tela do produto **passa a seguir a lista** (nenhum SKU recebe o pedido, que fica em "Sem cadastro"), ou (c) outra (por exemplo, ratear).

## Como resolver

1. Rodar o script de conferência no banco real (passo a passo em [[Tutorial - Como Testar a Lista de Vendas e Conferir Contra a Tela do Produto]]). Se **nenhum SKU** der "DIFERE" e a linha "Sem cadastro" tiver 0 unidades (ou só o que já se explica pelos 3 MLBs de [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]), **fechar esta dúvida como "não ocorre"**.
2. Se der "DIFERE", abrir o JSON que o script grava (`exploracao_conferencia_da_lista_de_vendas_MB.json`) e ver quais SKUs e MLBs são.
3. Contar, **só no banco (zero chamada à API)**, quantos itens de venda têm `seller_sku` vazio no período, antes de decidir.
4. Decidir com Matheus a regra (a, b ou c) e só então mexer em código.

## Relacionado

- [[Substituir a Tela Sem SKU de Vendas por uma Lista por Produto Anuncio e Codigo ML]]
- [[Tutorial - Como Testar a Lista de Vendas e Conferir Contra a Tela do Produto]]
- [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
