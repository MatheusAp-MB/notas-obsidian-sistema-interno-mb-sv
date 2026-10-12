---
tipo: descoberta
dominio: 
status: ativa
criado: 11/10/2026
atualizado_em: 11/10/2026 22:00
relacionado: [Origem do Acrescimo no Faturamento da Magiic Sobre o Preco do Item, Envios Reais Confirmam o node_id do Pedido Como Origem da Venda do Full e do Fora do Full, Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Tela de vendas (conta MB, SKU de teste, 11/07 a 11/10/2026) comparada com o Radar de Vendas e o Relatório de Elasticidade da Magiic: unidades e pedidos batem, com no máximo 1 pedido de diferença por anúncio e janela (fronteira entre janelas); nosso faturamento (preço do item × quantidade) é igual ao 'Preço médio × unidades' da própria Magiic; só o 'Vendas R$' dela passa disso, cerca de R$ 4.076 (0,36%). Full × fora do Full não dá para validar na Magiic."
---

# Radar e Elasticidade da Magiic Confirmam as Unidades e os Pedidos do Histórico de Vendas

## Resumo

Em 11/10/2026 a tela de histórico de vendas foi comparada com duas telas da Magiic (o **Radar de Vendas** e o **Relatório de Elasticidade**) para o mesmo produto da conta MB (SKU `F7908050719121.001`, período 11/07 a 11/10/2026). **Unidades e pedidos batem**: das 22 combinações anúncio × janela de 30 dias do relatório, 16 batem em tudo (unidades, pedidos e R$ ao centavo) e as outras 6 diferem em **no máximo 1 pedido**. No dinheiro, o **nosso faturamento é igual ao "Preço médio × unidades" que a própria Magiic mostra**; só o "Vendas R$" dela vem maior, cerca de **R$ 4.076 (0,36%)**, e a causa ainda não foi confirmada ([[Origem do Acrescimo no Faturamento da Magiic Sobre o Preco do Item]]).

> [!info] Status: ativa
> Vale para 1 produto da conta MB. A conta SV não foi comparada. **A Magiic não permite validar a separação Full × fora do Full** (ver "Os achados", item 8); essa separação continua validada pelos 60 envios de [[Envios Reais Confirmam o node_id do Pedido Como Origem da Venda do Full e do Fora do Full]].

## Contexto

A tela de histórico de vendas precisava de uma conferência **independente** dos números. A Magiic (sistema que a empresa já usa) tem duas telas que mostram vendas por anúncio:

| Tela da Magiic | O que mostra | Como conta |
|---|---|---|
| Radar de Vendas | Faturamento, "Qtd", preço médio e ticket médio por anúncio, num período escolhido | Só pedidos `paid`; fuso `America/Sao_Paulo`; variações somadas no anúncio pai; filho de catálogo somado no anúncio de origem |
| Relatório de Elasticidade | Vendas R$, unidades, pedidos e preço médio por anúncio em 4 janelas de 30 dias (`30/0`, `60/30`, `90/60`, `120/90`) | Blocos de 30 dias contados para trás a partir do momento em que a tela foi aberta |

Termos: **janela 30/0** = os últimos 30 dias; **60/30** = os 30 dias antes disso; **90/60** = os 30 dias antes desses. **Fronteira** = o instante em que uma janela termina e a vizinha começa. **PM** = preço médio que a Magiic mostra.

## Como foi feito

1. Os dois relatórios da Magiic foram salvos em HTML e lidos; os números por anúncio ficaram escritos como constantes dentro do script.
2. Script `scripts_exploracao_ML/comparar_vendas_com_relatorio_de_elasticidade_da_magiic.py`: **somente leitura** (SELECT no banco, **nenhuma chamada à API**). Lê as vendas do banco, testa cortes de horário de 15 em 15 minutos para achar onde a Magiic cortou as janelas, compara anúncio por anúncio e mostra, em reais, onde estão as diferenças. Rodado às 21:56 de 11/10/2026.
3. A leitura do script foi conferida com a tela antes de tudo: **3.182 un, 3.175 pedidos, R$ 1.181.994,27**, idêntico (118 linhas canceladas ficaram fora; 32 de 3.175 linhas fecharam em dia diferente do dia da criação).

## O que foi medido

### Unidades e pedidos (relatório de Elasticidade, corte 11/10 às 20:30)

| Janela | Unidades Magiic | Unidades nosso | Pedidos Magiic | Pedidos nosso |
|---|---|---|---|---|
| 30/0 | 934 | 935 | 931 | 932 |
| 60/30 | 1.163 | 1.163 | 1.162 | 1.162 |
| 90/60 | 968 | 968 | 965 | 965 |

As 6 combinações que não batem em tudo; as 3 que diferem em unidades e pedidos:

| Anúncio | Janela | Un Magiic | Un nosso | Pedidos Magiic | Pedidos nosso |
|---|---|---|---|---|---|
| MLB1942167064 | 60/30 | 980 | 981 | 980 | 981 |
| MLB7574006382 | 30/0 | 76 | 77 | 76 | 77 |
| MLB7574006382 | 60/30 | 143 | 142 | 143 | 142 |

### Dinheiro (soma dos anúncios do relatório)

| Janela | Magiic: Vendas R$ | Magiic: PM × un | Nosso banco | Nosso − Vendas | Nosso − PM × un |
|---|---|---|---|---|---|
| 30/0 | R$ 353.263,91 | R$ 352.436,92 | R$ 352.803,87 | R$ -460,04 | +R$ 366,95 |
| 60/30 | R$ 431.956,03 | R$ 430.181,24 | R$ 430.171,34 | R$ -1.784,69 | R$ -9,90 |
| 90/60 | R$ 357.776,45 | R$ 356.302,53 | R$ 356.305,06 | R$ -1.471,39 | +R$ 2,53 |
| **Total** | **R$ 1.142.996,39** | **R$ 1.138.920,69** | **R$ 1.139.280,27** | **R$ -3.716,12** | **+R$ 359,58** |

O PM da Magiic vem com 2 casas decimais, então "PM × un" pode errar uns poucos reais por anúncio.

### Onde o "Vendas R$" da Magiic passa do "PM × un" dela (acréscimo)

| Anúncio | Janela | Vendas R$ Magiic | Un | PM | Acréscimo | Por unidade |
|---|---|---|---|---|---|---|
| MLB1683028746 | 60/30 | R$ 1.302,69 | 3 | R$ 419,90 | +R$ 42,99 | +R$ 14,33 |
| MLB1942167064 | 30/0 | R$ 299.385,31 | 796 | R$ 375,21 | +R$ 718,15 | +R$ 0,90 |
| MLB1942167064 | 60/30 | R$ 361.247,30 | 980 | R$ 367,06 | +R$ 1.528,50 | +R$ 1,56 |
| MLB1942167064 | 90/60 | R$ 342.940,15 | 932 | R$ 366,38 | +R$ 1.473,99 | +R$ 1,58 |
| MLB7574006382 | 30/0 | R$ 29.258,67 | 76 | R$ 383,55 | +R$ 108,87 | +R$ 1,43 |
| MLB7574006382 | 60/30 | R$ 54.454,74 | 143 | R$ 379,38 | +R$ 203,40 | +R$ 1,42 |

### Radar de Vendas (90 dias, 11/07 a 11/10/2026)

| Anúncio (com catálogo filho) | O que a Magiic mostra | O nosso banco |
|---|---|---|
| 6 de 9 famílias de anúncio | R$ igual | R$ igual, ao centavo |
| MLB1942167064 | R$ 4.298,78 a mais, +1 un, +50 pedidos | referência |
| MLB1683028746 | R$ 5.000,19 (Radar e Elasticidade); 14 pedidos no Radar | R$ 4.957,20; 12 un e 12 pedidos |
| MLB7574006382 | R$ 83.713,41 (Radar e Elasticidade); 223 pedidos no Radar | R$ 83.400,54; 219 un e 219 pedidos |
| MLB4242628323 | R$ 4.181,10; 8 pedidos no Radar (7 no Elasticidade) | R$ 4.181,10; 10 un e 7 pedidos |

## Os achados

1. **O script leu o mesmo que a tela**: unidades, pedidos e R$ idênticos. A comparação parte de dados certos.
2. **Unidades e pedidos batem com a Magiic**, com diferença de no máximo 1 pedido. O par +1 / −1 do MLB7574006382 (a venda cai na janela 30/0 aqui e na 60/30 lá) é o jeito típico de **1 pedido na fronteira entre janelas**. No MLB1942167064 (60/30) sobrou 1 un do nosso lado, 1 em 981 (0,1%), sem par na janela vizinha: **causa não identificada**.
3. **As diferenças de dinheiro dessas combinações são o preço de 1 unidade.** Em "Nosso − PM × un": +R$ 369,64 (R$ 366,00 de 1 un mais o arredondamento), +R$ 378,84 (1 un a R$ 378,90) e −R$ 379,44 (1 un a R$ 378,90). Não é diferença de preço.
4. **Corte de horário**: o melhor encaixe foi "criação do pedido, sem cancelados" cortando em 11/10 às 20:30 (diferença de 2 no total das 3 janelas). **Nenhum corte reproduziu as 3 janelas por inteiro.** Isso é compatível com a fronteira, mas não prova o horário exato em que a Magiic montou o relatório.
5. **A Magiic discorda dela mesma no dinheiro**: o "Vendas R$" é maior que o "PM × unidades" dela em 6 das 22 combinações (soma de cerca de **R$ 4.076**, 0,36% de R$ 1,14 milhão). Em 18 das 22 o **nosso faturamento é igual ao "PM × un" dela** (diferença só de arredondamento). Ou seja, o extra está só no "Vendas R$" da Magiic, não em preço faltando no nosso banco.
6. **MLB1683028746 (60/30)**: 3 pedidos (`2000018007200598`, `2000018039438120`, `2000018183964544`), todos de R$ 419,90 com tag de desconto, 2 de catálogo, **nenhum em carrinho (pack)**. O acréscimo de R$ 42,99 dá **exatamente R$ 14,33 por pedido** se os 3 forem iguais (R$ 434,23 por unidade em vez de R$ 419,90). Carrinho não explica.
7. **Sobra pequena e sem explicação**: no MLB1942167064 (30/0) o nosso valor fica R$ 11,86 abaixo do "PM × un" da Magiic (0,004%), acima do que o arredondamento explicaria.
8. **O Radar mostra "pedidos" na coluna "Qtd"** (unidades = Vendas ÷ Preço Médio) e traz **pedidos a mais** que o nosso banco e que o Elasticidade (+50 no MLB1942167064; +4 no MLB7574006382; +2 no MLB1683028746; +1 no MLB4242628323). Em 3 famílias o Radar mostra mais pedidos que unidades, o que é impossível: o Radar é menos confiável que o Elasticidade para pedidos. O Elasticidade nunca mostra pedidos maiores que unidades.
9. **Full × fora do Full não dá para validar na Magiic**: nenhuma das duas telas separa a origem. A tela "Operações Full" dela vê o Full, mas usa o endpoint `/stock/fulfillment/operations`, o mesmo que abandonamos (429 / `ml_api_error`); só serve para conferir pontualmente Códigos com poucas operações (`OPXW24140`, `RWBD51502`).

## O que isso não prova

> [!warning] Lacunas
> - **1 produto, conta MB.** A conta SV não foi comparada.
> - **O horário exato** em que a Magiic montou o Elasticidade não é conhecido; por isso as diferenças de 1 pedido não podem ser atribuídas, uma a uma, à fronteira (só o par +1 / −1 do MLB7574006382 tem cara de fronteira).
> - **O que é o acréscimo do "Vendas R$"** não foi medido. O banco guarda `unit_price` e `sale_fee`, **não** `total_amount`, `paid_amount` nem frete. Hipótese (não confirmada): valor pago pelo comprador além do preço do item (juros de parcelamento ou frete). Ver [[Origem do Acrescimo no Faturamento da Magiic Sobre o Preco do Item]].
> - **Os pedidos a mais do Radar** não foram explicados.
> - Nada aqui valida **Full × fora do Full**; isso depende dos 60 envios.

## Como repetir

Somente banco, nenhuma chamada à API (começo do script: `CONTA`, `SKU`, `DATA_INICIAL`, `DATA_FINAL`, `CORTE_DE`, `CORTE_ATE`):

```bash
python -u "scripts_exploracao_ML/comparar_vendas_com_relatorio_de_elasticidade_da_magiic.py"
```

Os números da Magiic estão escritos dentro do script (`MAGIIC_TOTAIS` e `MAGIIC_ANUNCIOS`); para outro produto ou outra data é preciso salvar os relatórios de novo e trocar essas constantes.

| Arquivo (pasta `scripts_exploracao_ML/`) | O que é |
|---|---|
| `comparar_vendas_com_relatorio_de_elasticidade_da_magiic.py` | O script da comparação |
| `exploracao_comparacao_com_elasticidade_da_magiic_MB.json` | O resultado (sem dado de comprador; no máximo 300 linhas por janela) |

## Relacionado

- [[Origem do Acrescimo no Faturamento da Magiic Sobre o Preco do Item]] — a pergunta que sobrou do "Vendas R$" da Magiic.
- [[Envios Reais Confirmam o node_id do Pedido Como Origem da Venda do Full e do Fora do Full]] — a validação de Full × fora do Full, que a Magiic não permite.
- [[Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos]] — a regra de origem usada na tela.
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]] — o trabalho da frente de histórico de vendas.
