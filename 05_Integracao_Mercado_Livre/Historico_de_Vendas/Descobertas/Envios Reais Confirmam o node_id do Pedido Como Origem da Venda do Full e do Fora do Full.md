---
tipo: descoberta
dominio: 
status: ativa
criado: 11/10/2026
atualizado_em: 11/10/2026 21:18
relacionado: [Campo stock node_id do Pedido Separa Venda do Full de Venda Fora do Full, Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "60 envios reais (conta MB, 11/10/2026): os 30 que a regra mandou para o Full eram fulfillment e os 30 que mandou para fora do Full eram cross_docking, sem exceção. BRPE01 e BRPR01 são centros do Full; a Coleta sem origem de antes de 26/03/2026 veio sem stock no pedido. Flex não apareceu."
---

# Envios Reais Confirmam o node_id do Pedido Como Origem da Venda do Full e do Fora do Full

## Resumo

Em 11/10/2026 foram consultados 60 envios reais da conta MB (`GET /shipments/{id}`) e o `logistic.type` de cada um foi comparado com o que a regra de origem tinha dito sobre a venda. **Acertou 60 de 60.** Isso mostra que o `node_id` do pedido identifica a origem da venda, com um ajuste: os nós `BRPE01` e `BRPR01` são centros do Full, e o nó próprio do vendedor é `BRP` + código do vendedor.

> [!info] Status: ativa
> Vale para o produto de teste da conta MB (SKU `F7908050719121.001`). A conta SV não foi medida e **nenhum envio de Flex apareceu** na amostra. A escolha da regra a partir destes fatos está em [[Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos]].

## Contexto

A tela de vendas precisa saber, para cada venda, se saiu do Full ou de fora dele. O pedido (`/orders/search`) traz o `node_id` (o "lugar" de onde o item saiu) e o `store_id` (depósito do vendedor), mas a **resposta oficial** é o `logistic.type` do envio, que só se descobre com 1 chamada a `/shipments` por pedido. Como o Matheus não pode fazer chamadas por pedido (quase 1 mil SKUs), a pergunta era: o `node_id` do pedido é um sinal confiável? (a dúvida original está em [[Campo stock node_id do Pedido Separa Venda do Full de Venda Fora do Full]]).

Matheus também duvidou de que o produto vendesse só ~855 unidades por ano fora do Full, então pediu uma conferência com **60 envios: 30 de vendas classificadas como "fora do Full" e 30 como "Full"**.

## Como foi feito

Script `scripts_exploracao_ML/confirmar_origem_das_vendas_pelos_envios.py` (somente leitura: SELECT no banco e GET na API). Ele escolhe, de forma repetível (itens igualmente espaçados no tempo, do mais antigo ao mais novo), pedidos que têm **1 linha só no banco** e `shipping.id`, para o envio responder por aquela venda e mais nenhuma. Foram 60 chamadas, 1 por segundo, todas com HTTP 200 (nenhum 429), das 20:59 às 21:00.

| Grupo | A regra disse | Pedidos elegíveis | Consultados | Datas |
|---|---|---|---|---|
| Nó próprio ou loja | Fora do Full | 504 | 15 | 07/01/2026 a 09/10/2026 |
| Sem origem, mandado para fora pela regra 4 | Fora do Full | 323 | 15 | 16/10/2025 a 25/03/2026 |
| Nós `BRP` que a tela antiga chamava de fora (`BRPE01`, `BRPR01`) | Full | 1.824 | 10 | 11/10/2025 a 10/10/2026 |
| Demais nós (centros do Full) | Full | 13.593 | 20 | 11/10/2025 a 11/10/2026 |

## O que foi medido

| Grupo | Esperado no envio | Confere | Não confere | `logistic.type` encontrado |
|---|---|---|---|---|
| Fora · nó próprio ou loja | diferente de `fulfillment` | 15 de 15 | 0 | `cross_docking` ×15 |
| Fora · sem origem | diferente de `fulfillment` | 15 de 15 | 0 | `cross_docking` ×15 |
| Full · nós `BRP` (`BRPE01`, `BRPR01`) | `fulfillment` | 10 de 10 | 0 | `fulfillment` ×10 |
| Full · demais nós | `fulfillment` | 20 de 20 | 0 | `fulfillment` ×20 |
| **Total** | | **60 de 60** | **0** | |

## Os achados

1. **`BRPE01` e `BRPR01` são centros do Full.** Começam com `BRP`, mas o envio é `fulfillment` em 10 de 10. Por isso a regra antiga ("começa com `BRP` = fora") errava **1.824 un** (`BRPE01` 1.335 + `BRPR01` 489) em todos os meses.
2. **O nó próprio é `BRP` + código do vendedor + `1`** (escrito `BRP***1`). Nos 15 envios desse grupo, o nó de origem do envio é igual ao nó do pedido e o tipo é `cross_docking`. A consulta de depósitos (`GET /users/{id}/stores/search?tags=stock_location`) devolveu **1 depósito só**, com os serviços `cross_docking` e `self_service`.
3. **A Coleta de antes de 26/03/2026 veio sem `stock` no pedido.** Nos 15 envios "sem origem", o tipo é `cross_docking` e o próprio envio **não tem** `origin.node`. Ou seja, o Mercado Livre não tinha nó de origem para informar; a falta não é do coletor. O `store_id` passou a vir preenchido a partir de ~25/03/2026.
4. **O nó do pedido é a origem do envio.** Nos 45 envios que informam `origin.node` (15 do nó próprio, 10 de `BRPE01`/`BRPR01`, 20 dos demais centros), o nó do envio é **igual** ao nó do pedido.

## O que isso não prova

> [!warning] Lacunas
> - **Flex não apareceu**: nenhum dos 80 envios conferidos (20 de 10/10/2026 e 60 de 11/10/2026) foi `self_service`, nem entre os 15 do nó próprio (que são Coleta pura).
> - **0 divergências em 30 envios Full** só garante, com 95% de confiança, que no máximo ~10% das vendas Full poderiam divergir (regra de três: 300 ÷ 30). Sozinho, isso não exclui um Flex escondido atrás de um centro do Full.
> - O argumento mais forte é o achado 4: um envio de Flex ou Coleta sai do endereço do vendedor, não de um centro do Full (a doc `Fontes/Convivência Full e Flex.txt` separa os locais `meli_facility`, do Full, e `selling_address`, do vendedor). Isto é **dedução** a partir da doc e do achado 4, **não foi medido** com um envio Flex.
> - Só **1 produto, conta MB**. A conta SV não foi medida.

## Como repetir

Medir de novo, com a API (60 chamadas, ~1 a 2 minutos; precisa de `MB_USER_ID` no `.env`):

```bash
python -u "scripts_exploracao_ML/confirmar_origem_das_vendas_pelos_envios.py"
```

Medir só com o banco (nenhuma chamada à API), antes e depois da regra, mês a mês:

```bash
python -u "scripts_exploracao_ML/medir_origem_pela_logistica_do_anuncio.py"
```

Para a conta SV, trocar `CONTA = "MB"` por `CONTA = "SV"` no começo de cada script.

| Arquivo (pasta `scripts_exploracao_ML/`) | O que é |
|---|---|
| `confirmar_origem_das_vendas_pelos_envios.py` | O script dos 60 envios |
| `exploracao_confirmacao_da_origem_por_envios_MB.json` | O resultado (sem seller_id, sem token, sem dado de comprador) |
| `medir_origem_pela_logistica_do_anuncio.py` | Mede a regra com dados do banco, sem API |
| `exploracao_origem_pela_logistica_do_anuncio_MB.json` | O resultado dessa medição |
| `investigar_vendas_sem_origem_informada.py` e `exploracao_vendas_sem_origem_MB.json` | A investigação das vendas sem origem e a consulta de depósitos |

## Relacionado

- [[Campo stock node_id do Pedido Separa Venda do Full de Venda Fora do Full]] — a pergunta que estes fatos respondem.
- [[Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos]] — a regra escolhida com base nestes fatos.
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]] — o trabalho da frente de histórico de vendas.
