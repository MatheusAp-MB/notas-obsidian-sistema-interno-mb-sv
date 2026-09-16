---
tipo: descoberta
dominio: python
status: ativa
criado: 16/09/2026
atualizado_em: 16/09/2026 03:35
relacionado: [Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]
resumo: CORRIGIDO em 16/09 — a versão anterior desta nota atribuiu o achado ao script/dicionário errado. O real é `consultar_linha_tempo_devolucao.py` (`python scripts_exploracao_ML/consultar_linha_tempo_devolucao.py --candidato=2000017788033354 --empresa=SV`), dicionário `TRADUCAO_EVENTO_ENVIO` (chave é o par `(status, substatus)`, função `traduzir_evento_envio`). Rodando contra a linha do tempo do envio de ida (Etapa 1 — Compra), apareceram 4 combinações ainda não catalogadas: `invoice_pending`, `in_packing_list`, `dropped_off` e `waiting_for_carrier_authorization` (todas sob o status `ready_to_ship`, conforme a doc oficial `/shipment_statuses`) — nenhuma delas estava no dicionário, e todas caíram certinho no fallback "(sem tradução confirmada ainda)", sem o script inventar texto. Diferente do outro script exploratório (`consultar_fluxo_devolucao.py`), este NÃO tem fallback pro nome oficial em inglês via `/shipment_statuses` — só mostra o código bruto com o aviso. Confirmei via doc oficial (`Envios.html`) que `waiting_for_carrier_authorization` é um código real e documentado, mas só com nome oficial em inglês, sem explicação operacional. Decisão: manter as 4 combinações fora do `TRADUCAO_EVENTO_ENVIO` por enquanto — mesmo critério já usado em [[Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]] — até confirmação mais explícita.
---

# Substatus `waiting_for_carrier_authorization` É Real e Documentado, Mas Ainda Sem Tradução Confirmada

> [!info] Correção — 16/09/2026, 03:35
> A versão original desta nota (16/09, 00:08) tinha o script e o dicionário errados — atribuí o achado ao `consultar_fluxo_devolucao.py`/`SUBSTATUS_CONHECIDOS` por engano. O script real usado nesse teste foi `consultar_linha_tempo_devolucao.py`, e o dicionário certo é `TRADUCAO_EVENTO_ENVIO`. Esta versão já está corrigida.

**Resumo**: rodando `consultar_linha_tempo_devolucao.py` contra o pedido `2000017788033354`/SV —

```
python scripts_exploracao_ML/consultar_linha_tempo_devolucao.py --candidato=2000017788033354 --empresa=SV
```

— a linha do tempo do envio de ida (impressa na Etapa 1 — Compra, via `imprimir_linha_do_tempo_envio(historico_ida, ...)`) trouxe 4 combinações `(status, substatus)` que não estavam no dicionário `TRADUCAO_EVENTO_ENVIO`: `invoice_pending`, `in_packing_list`, `dropped_off` e `waiting_for_carrier_authorization` — todas sob o status `ready_to_ship`. O fallback do script (`traduzir_evento_envio`) funcionou exatamente como deveria: mostrou o código bruto (`ready_to_ship/<substatus>`) com o aviso "(sem tradução confirmada ainda)" pras 4, em vez de inventar texto.

> [!warning] Em aberto — 16/09/2026, 03:35
> Nenhuma das 4 combinações está no `TRADUCAO_EVENTO_ENVIO` ainda. `waiting_for_carrier_authorization` tem o nome oficial em inglês confirmado na doc do Mercado Livre (`GET /shipment_statuses`), mas sem explicação operacional (o que exatamente está sendo autorizado, e por quem). As outras 3 (`invoice_pending`, `in_packing_list`, `dropped_off`) têm nomes oficiais autoexplicativos, mas ainda não foram adicionadas — decisão de quando/se traduzir cada uma fica pra quando isso for revisitado com calma, uma combinação de cada vez.

## Contexto

`consultar_linha_tempo_devolucao.py` (diferente do `consultar_fluxo_devolucao.py`) traduz cada evento da linha do tempo de um envio (`GET /shipments/{id}/history`, via `buscar_historico_envio`) usando o dicionário `TRADUCAO_EVENTO_ENVIO`, cuja chave é o PAR `(status, substatus)` — não só o substatus isoladamente. A função `traduzir_evento_envio(status, substatus)` monta o rótulo bruto (`status` ou `status/substatus`) e, se a combinação não estiver no dicionário, devolve `"{rótulo bruto} (sem tradução confirmada ainda)"`. Diferente do `consultar_fluxo_devolucao.py`, este script NÃO chama `/shipment_statuses` como bônus — não existe fallback pro nome oficial em inglês aqui, só o aviso de não confirmado.

Dicionário atual (sem nenhuma das 4 combinações abaixo):

```python
TRADUCAO_EVENTO_ENVIO = {
    ("handling", None): "Registrado, aguardando próxima etapa",
    ("ready_to_ship", "ready_to_print"): "Etiqueta de envio liberada",
    ("ready_to_ship", "printed"): "Etiqueta de envio impressa",
    ("ready_to_ship", "on_route_to_pickup"): "Transportadora a caminho pra coleta",
    ("ready_to_ship", "soon_to_pickup"): "Coleta prestes a acontecer",
    ("ready_to_ship", "picking_up"): "Coletando o pacote",
    ("ready_to_ship", "picked_up"): "Pacote coletado fisicamente",
    ("ready_to_ship", "in_hub"): "Chegou no centro de distribuição",
    ("shipped", None): "Despachado pro trajeto principal",
    ("shipped", "first_visit"): "Primeira tentativa de entrega",
    ("delivered", None): "Entregue",
}
```

## O que a doc oficial confirma sobre `waiting_for_carrier_authorization`

O arquivo `Envios.html` (doc oficial do Mercado Livre, capturado do Developers) documenta `GET /shipment_statuses` e confirma o código dentro do status `ready_to_ship`:

```json
{ "id": "waiting_for_carrier_authorization", "name": "Waiting for carrier authorization" }
```

na mesma lista de sub-status de `ready_to_ship`, ao lado do irmão `authorized_by_carrier` ("Authorized by carrier MELI"). A doc só lista `id`/`name` — não explica o que essa autorização representa operacionalmente (autorização pra quê, dada por qual transportadora).

## Decisão

Manter as 4 combinações fora do `TRADUCAO_EVENTO_ENVIO` por enquanto — nenhuma tradução em português confirmada o suficiente pra entrar no dicionário ainda, mesmo critério já usado em [[Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]]. Se/quando revisitar, uma combinação de cada vez, com calma.

## Relacionado

- [[Coleta Física da Devolução Acontece Dentro de ready_to_ship, Não Quando o Status Vira shipped]]
