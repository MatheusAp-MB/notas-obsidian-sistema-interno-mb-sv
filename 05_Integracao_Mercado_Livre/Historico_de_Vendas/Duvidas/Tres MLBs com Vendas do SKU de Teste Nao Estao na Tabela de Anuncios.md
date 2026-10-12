---
tipo: duvida
dominio: 
status: em_aberto
criado: 12/10/2026
atualizado_em: 12/10/2026 01:15
relacionado: [Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Historico de Vendas, Niveis de Granularidade do Full e Como os Dados se Ligam, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "121 pedidos (127 unidades) do SKU de teste estão em 3 MLBs (MLB3925238352, MLB5397573678, MLB4479267725) que não estão na tabela de anúncios, então não entram nos totais do produto na tela. Última venda deles: junho/2026 e março/2026. Falta saber se são anúncios encerrados ou nunca importados, e como a tela deve tratá-los."
---

# Três MLBs com Vendas do SKU de Teste Não Estão na Tabela de Anúncios

## Resumo

Na conferência entre os dois caminhos de coleta ([[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]), a coleta da **conta toda** encontrou **121 pedidos (127 unidades)** cujo `seller_sku` é o do produto de teste (`F7908050719121.001`), mas em **3 MLBs que não estão na tabela de anúncios** (`AnuncioMercadoLivre`). A tela de vendas liga venda a produto pelo **MLB** (cadastro: variação do anúncio → produto), então essas vendas **ficam de fora dos totais do produto**. A coleta por produto nunca as vê.

> [!question] Status: em aberto
> Falta descobrir **o que são** esses 3 MLBs (anúncios encerrados? nunca importados? apagados?) e decidir **como a tela deve tratá-los**. Impacto hoje: cerca de 0,7% das unidades do produto de teste.

## Contexto

O nível "Produto" da tela soma as vendas de **todos os MLBs ligados ao SKU**; a ligação vem de `VariacaoAnuncioMercadoLivre` (produto) → `AnuncioMercadoLivre` (`mlb`). Um MLB que não está nessa tabela **não tem ligação**, mesmo que o pedido traga o SKU do produto.

## A pergunta

Esses 3 MLBs são do produto de teste? Se são, a tela deve somá-los (ligando pelo `seller_sku` do pedido, ou importando os anúncios para a tabela)? Se são anúncios antigos encerrados, as vendas deles devem aparecer no histórico do produto?

## O que já se sabe

| MLB | Pedidos | Primeira venda | Última venda | Na tabela de anúncios? |
|---|---|---|---|---|
| `MLB3925238352` | 104 | 14/11/2025 | 15/06/2026 | **Não** |
| `MLB5397573678` | 16 | 15/10/2025 | 20/06/2026 | **Não** |
| `MLB4479267725` | 1 | 10/03/2026 | 10/03/2026 | **Não** |

- Total: **121 pedidos, 127 unidades**, todos com `seller_sku = F7908050719121.001`.
- Todas as **últimas vendas são de março a junho de 2026**, enquanto os 20 MLBs ligados ao produto continuam vendendo: combina com anúncios **encerrados ou substituídos**, mas **não está provado**.
- A comparação com a Magiic ([[Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Historico de Vendas]]) usou 11/07 a 11/10/2026, depois da última venda desses MLBs; por isso ela **não** viu a diferença.
- O script que achou isso: `conferir_coleta_da_conta_toda_contra_coleta_por_produto.py` (e a seção 6 de `investigar_diferencas_entre_coletas_so_no_banco.py`).

## O que NÃO sabemos

> [!warning] Lacunas
> - O **status atual** desses 3 MLBs no Mercado Livre (encerrado, pausado, ativo).
> - Se existem outros MLBs fora do cadastro em **outros SKUs** (só o SKU de teste foi conferido), e se na conta SV ocorre o mesmo.
> - O que o Matheus quer na tela: somar essas vendas no produto ou mostrá-las à parte.

## Como resolver

1. Ler os 3 MLBs no Mercado Livre em **1 chamada de itens em lote** (os 3 ids juntos; lembrar que `/items?ids=` deve migrar para `/items/bulk?ids=` antes de 25/10/2026) e ver o status e o título.
2. Contar, **só no banco (zero chamada à API)**, quantos MLBs da conta têm pedidos e não estão na tabela de anúncios, para saber o tamanho do problema na conta inteira antes de massificar.
3. Decidir com o Matheus: ligar a venda ao produto pelo `seller_sku` do pedido, ou importar os anúncios faltantes, ou mostrar "vendas sem anúncio ligado" à parte.

## Relacionado

- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Historico de Vendas]]
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
