---
tipo: descoberta
dominio: python
status: ativa
criado: 15/09/2026
atualizado_em: 15/09/2026 23:39
relacionado: [Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354), Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]
resumo: Rodando consultar_linha_tempo_devolucao.py (já migrado pro Devoluções, com --empresa/--candidato por parâmetro) contra o pedido 2000017788033354/SV, a data de postagem que a API aponta (status=shipped, 02/09/2026) parecia contradizer o evento já mapeado na Tela 02 (pacote "a caminho" em 27/08/2026). O histórico bruto do envio mostrou que a coleta física (substatus picked_up) aconteceu mesmo em 27/08 — bate com a Tela 02 — e só ~6 dias depois, em 02/09, o status vira shipped de verdade, provavelmente por consolidação de carga (produto de ~40kg via transportadora). ready_to_ship já inclui a coleta; shipped é o despacho pro trajeto principal.
---

# Coleta Física da Devolução Acontece Dentro de `ready_to_ship`, Não Quando o Status Vira `shipped`

**Resumo**: rodando `consultar_linha_tempo_devolucao.py` (já migrado pro Devoluções, com `--empresa`/`--candidato` por parâmetro) contra o pedido `2000017788033354`/SV, a data de postagem que a API aponta (`status=shipped`, 02/09/2026) parecia contradizer o evento já mapeado na Tela 02 (pacote "a caminho" em 27/08/2026). O histórico bruto do envio mostrou que a coleta física (substatus `picked_up`) aconteceu mesmo em 27/08 — bate com a Tela 02 — e só ~6 dias depois, em 02/09, o status vira `shipped` de verdade, provavelmente por consolidação de carga (produto de ~40kg via transportadora). `ready_to_ship` já inclui a coleta; `shipped` é o despacho pro trajeto principal.

> [!warning] Em investigação — 15/09/2026, 23:39
> Só 1 caso testado até agora (pedido `2000017788033354`, conta SV, produto de ~40kg via transportadora dedicada). O padrão (gap `ready_to_ship` → `shipped` por consolidação de frete pesado) ainda não foi confirmado num 2º caso independente — pode não se repetir em itens mais leves, que costumam ir por Correios/transportadora comum.

## Contexto

O checkpoint [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]] tinha um item em aberto: comparar cada campo mapeado manualmente (Tela 01 a Tela 05, pedido `2000017788033354`, conta SV) contra o retorno real da API. Pra isso, o script `consultar_linha_tempo_devolucao.py` (recém migrado do repositório `Projeto_Sistema_Interno_V2` pro `Projeto-Sistema-Devolucao`, ver [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]) foi ajustado pra receber `--empresa` e `--candidato` por parâmetro em vez de conta fixa no código, e rodado contra esse mesmo pedido.

## O problema

Quase todo campo bateu exatamente com o que já tinha sido mapeado na mão — inclusive a data de entrega original, a abertura da reclamação e o fechamento da mediação, com o mesmo horário até o minuto. Só 1 campo destoou: a API apontou a "data de postagem pelo cliente" (primeiro evento com `status=shipped` no histórico de envio, `/shipments/{id}/history`) em `02/09/2026`, mas a Tela 02 já tinha registrado um evento de `27/08/2026` com o texto "Estamos levando o pacote ao Centro de distribuição" — que soa como o pacote já estar em trânsito bem antes de 02/09. Era um erro no mapeamento manual, ou os 2 dados realmente descrevem coisas diferentes?

## O que levou à resposta

A 1ª hipótese (podia haver 2 envios de volta diferentes, e a Tela 02 só ter capturado o histórico de 1 deles) foi descartada rápido: `devolucao["shipments"]` só tinha 1 item, o shipment `47846576718`.

Em vez de supor o nome de um campo novo só por conhecimento geral (ex.: um "substatus" hipotético sem confirmar que existe), o script ganhou um print temporário do histórico bruto e completo desse envio — todos os eventos, sem filtrar só por `status="shipped"`/`"delivered"` como o script já fazia por padrão. O resultado mostrou uma progressão bem mais detalhada do que os 2 status simples usados até então (ver "Exemplo" abaixo pro dado bruto real): a coleta física passa por uma sequência de `substatus` dentro do status `ready_to_ship` (`ready_to_print` → `printed` → `on_route_to_pickup` → `soon_to_pickup` → `picking_up` → `picked_up` → `in_hub`), e só depois disso o `status` muda pra `shipped`.

O evento que a Tela 02 mostrou como "a caminho" às 17:53 do dia 27/08 é exatamente o substatus `picked_up` (27/08, 17:53:54 no fuso de exibição) — a coleta física de verdade já tinha acontecido naquele dia. O status só passa a ser `shipped` (sem substatus) quase 6 dias depois, em 02/09.

## Resposta

`ready_to_ship` e `shipped` não são sinônimos de "já foi buscado" — `ready_to_ship` já cobre toda a etapa de coleta, da alocação da transportadora até o produto chegar no hub (substatus `on_route_to_pickup` → `soon_to_pickup` → `picking_up` → `picked_up` → `in_hub`), e só depois disso o envio realmente "sai de viagem" e o status vira `shipped`. Pra um item de frete pesado (esse produto pesa cerca de 40kg, vai por transportadora dedicada, não Correios comum), o gargalo de ~6 dias fica entre `in_hub` (27/08) e `shipped` (02/09) — provavelmente o tempo de consolidar carga suficiente pra fechar uma rota de frete pesado, não o tempo de alocar a coleta em si (isso foi resolvido em poucas horas, no mesmo dia 27/08).

**Achado colateral**: o substatus `first_visit` (08/09, "primeira tentativa de entrega") e o evento `delivered` vieram gravados no mesmíssimo timestamp, e não existe nenhum evento correspondente ao "a caminho do seu endereço" que a Tela 02 mostrava às 8 set 11:05 — esse aviso de "saiu pra entrega hoje" não vem desse endpoint (`/shipments/{id}/history`); deve vir de outra fonte (rastreio em tempo real da transportadora) ainda não identificada.

## Exemplo

Comando real:

```
python scripts_exploracao_ML/consultar_linha_tempo_devolucao.py --candidato=2000017788033354 --empresa=SV
```

Histórico bruto real do shipment `47846576718` (horários no fuso de origem da API, `-04:00`):

```
{"date": "2026-08-24T16:13:09.742-04:00", "substatus": null, "status": "handling"}
{"date": "2026-08-24T16:13:09.742-04:00", "substatus": "ready_to_print", "status": "ready_to_ship"}
{"date": "2026-08-24T16:13:09.742-04:00", "substatus": "printed", "status": "ready_to_ship"}
{"date": "2026-08-27T10:47:26.089-04:00", "substatus": "on_route_to_pickup", "status": "ready_to_ship"}
{"date": "2026-08-27T15:11:34.341-04:00", "substatus": "soon_to_pickup", "status": "ready_to_ship"}
{"date": "2026-08-27T16:46:15.215-04:00", "substatus": "picking_up", "status": "ready_to_ship"}
{"date": "2026-08-27T16:53:54.765-04:00", "substatus": "picked_up", "status": "ready_to_ship"}
{"date": "2026-08-27T17:53:01.507-04:00", "substatus": "in_hub", "status": "ready_to_ship"}
{"date": "2026-09-02T07:35:48.291-04:00", "substatus": null, "status": "shipped"}
{"date": "2026-09-08T10:59:48.404-04:00", "substatus": "first_visit", "status": "shipped"}
{"date": "2026-09-08T10:59:48.404-04:00", "substatus": null, "status": "delivered"}
```

## Relacionado

- [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]]
- [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]]
- [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]
