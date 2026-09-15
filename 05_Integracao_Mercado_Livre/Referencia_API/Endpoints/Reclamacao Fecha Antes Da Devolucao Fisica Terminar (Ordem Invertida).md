---
tipo: descoberta
dominio: python
status: confirmada
criado: 15/09/2026
atualizado_em: 15/09/2026 01:19
relacionado: [Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]
---

# Reclamação Fecha Antes da Devolução Física Terminar (Ordem Invertida)

**Resumo**: quando a resolução de uma reclamação exige devolução física (`resolution.reason` em `item_returned`/`warehouse_decision`/`item_changed`), o encerramento da reclamação — com efeito no dinheiro já aplicado — pode acontecer antes do produto sequer ser despachado de volta, ou antes de chegar fisicamente. Confirmado em 4 casos reais, 3 tipos diferentes (`mediations`, `returns`, `change`).

> [!success] Confirmada
> 4 casos reais de "ordem invertida" (2 "mais forte" — fechado sem nem o despacho ter acontecido — e 2 fechado antes da chegada), em 3 tipos de reclamação diferentes, além de 1 quinto caso onde a inversão é provável mas não comprovável (ver ressalva no fim de "O que levou à resposta").

## Contexto

Mesma rodada de teste dos 12 candidatos (`consultar_linha_tempo_devolucao.py --candidato=<resource_id>`) usada em [[Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]]. Dos 12, 8 tinham `resolution.reason` de um dos 3 tipos que exigem devolução física — nesses casos, o script também traz o histórico de envio de volta (`shipments/{id}/history`: `status=shipped`/`status=delivered`), permitindo comparar a data de encerramento da reclamação (`claims/{id}/returns.date_closed`) com o andamento físico real da devolução.

## O problema

A expectativa natural é que a reclamação só feche — e o dinheiro só mude de mão — depois que o produto devolvido tiver realmente chegado de volta (ou pelo menos depois de ter sido despachado). Isso é o que de fato acontece?

## O que levou à resposta

Comparando `date_closed` com o histórico físico dos 8 casos com devolução física esperada:

| Pedido | `date_closed` | Despachado (`shipped`) | Chegou (`delivered`) | Ordem |
|---|---|---|---|---|
| 2000018341680948 | 14/09 14:23 | ainda não despachado | ainda não chegou | **Invertida (mais forte)** — fechou sem nem o cliente ter postado |
| 2000018185722028 | 14/09 10:56 | ainda não despachado | ainda não chegou | **Invertida (mais forte)** — mesmo padrão |
| 2000018305033186 | 10/09 13:53 | 11/09 01:22 | 11/09 15:09 | **Invertida** — fechou ~1 dia antes de chegar (e antes até de ser despachado) |
| 2000018355246824 | 09/09 17:45 | 11/09 11:09 | 12/09 01:37 | **Invertida** — fechou ~2 dias antes de chegar (e antes de ser despachado) |
| 2000018193298852 | 11/09 10:03 | 11/09 08:51 | ainda não chegou | Provável, não comprovável — ver ressalva abaixo |

**Ressalva sobre o 5º caso** (`2000018193298852`): o script não emitiu o aviso "Ordem invertida" pra ele, mas os dados brutos mostram fechamento (11/09 10:03) depois do despacho (11/09 08:51) e ainda sem chegada registrada — ou seja, tecnicamente também fechou antes do processo físico terminar. A explicação mais provável é uma lacuna do próprio script de exploração: o aviso só dispara quando dá pra calcular "quantos dias antes da chegada" (precisa de uma data de chegada real) ou quando o despacho nem começou — um caso "já despachado, mas ainda sem chegar, e já fechado" fica sem cobertura na lógica atual. Isso é um gap do script de análise, não da API do Mercado Livre — mas significa que a contagem real de "ordem invertida" pode ser maior que os 4 confirmados aqui.

## Resposta

O encerramento de uma reclamação (e o efeito no dinheiro — reembolso ou retenção) é desacoplado do andamento físico real da devolução: em pelo menos 4 dos 8 casos testados que deveriam ter devolução física (metade da amostra), a reclamação fechou antes do produto ter sido despachado ou entregue de volta. Isso confirma, com o dobro de casos e mais 2 tipos de reclamação (`returns` e `change`, além de `mediations`), o padrão que já havia aparecido nos 2 primeiros exemplos investigados antes desta rodada.

## Exemplo

Caso mais forte: pedido `2000018341680948`, mediação fechada em 14/09/2026 14:23, com `resolution.reason: item_returned` e dinheiro em `status_money: retained` — mas o histórico de envio de volta, na mesma consulta, ainda mostrava "ainda não despachado". O mediador decide, o dinheiro já muda de status, e o rastreio físico da devolução é uma trilha totalmente separada que só é resolvida (ou nem é) depois.

## Relacionado

- [[Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]]
