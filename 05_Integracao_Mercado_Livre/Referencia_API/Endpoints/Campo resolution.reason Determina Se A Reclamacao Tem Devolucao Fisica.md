---
tipo: descoberta
dominio: python
status: ativa
criado: 15/09/2026
atualizado_em: 15/09/2026 13:15
relacionado: [Mediador Nao Aparece Na Lista De Players De Uma Reclamacao, Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent, Reclamacao Fecha Antes Da Devolucao Fisica Terminar (Ordem Invertida), Campo resource_id De cancel_purchase Nao Bate Com O Numero Do Pedido, Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]
---

# Campo resolution.reason Determina Se a Reclamação Tem Devolução Física

**Resumo**: o valor de `resolution.reason` de uma reclamação fechada tende a prever se existe um objeto de devolução física associado (`GET /post-purchase/v2/claims/{id}/returns`) ou se esse endpoint responde 404 — `item_returned`, `warehouse_decision` e `item_changed` sempre tiveram (8/8); `coverage_decision` e `no_bpp` quase sempre não têm, mas `coverage_decision` já teve 1 exceção real (pedido `2000017788033354`, conta SV) com devolução física de verdade. Não é mais uma regra sem exceção.

> [!warning] Ativa — 1 exceção conhecida
> 9 casos reais, 5 motivos de resolução diferentes, 1 exceção confirmada (`coverage_decision` com devolução física, conta SV). Deixou de ser `confirmada` (0 exceção) por causa desse caso — ver seção "Exceção confirmada" abaixo.

## Contexto

Rodando `scripts_exploracao_ML/consultar_linha_tempo_devolucao.py --candidato=<resource_id>` nos 12 candidatos reais coletados por `buscar_candidatos_agrupados_por_tipo.py` (3 de cada tipo: `mediations`, `cancel_purchase`, `returns`, mais `cancel_sale` e `change` incompletos), o script tenta sempre buscar `claims/{id}/returns` pra montar a linha do tempo física (postagem, chegada). Em vários candidatos esse endpoint devolveu HTTP 404 ("There is no associated return for claim").

## O problema

Não dava pra saber de antemão, sem chamar o endpoint e tratar o erro, se uma reclamação fechada teria ou não um objeto de devolução física — o que interessa tanto pra decidir se vale a pena chamar `/returns` quanto pra entender, ao ler só `claims/{id}`, se aquele caso envolveu produto físico voltando ou não.

## O que levou à resposta

Dos 12 candidatos, 8 vieram com `resolution` preenchida (os outros 4: 2 de `cancel_sale` com `resolution: null` — caso à parte, coberto por [[Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent]] — e 2 de `cancel_purchase`/1 de `cancel_sale` que o script nem encontrou, coberto pela dúvida [[Campo resource_id De cancel_purchase Nao Bate Com O Numero Do Pedido]]). Cruzando o `resolution.reason` desses 8 com o resultado real de `/returns`:

| `resolution.reason` | Tem devolução física (`/returns` não dá 404)? |
|---|---|
| `coverage_decision` | Não |
| `no_bpp` | Não |
| `item_returned` | Sim |
| `warehouse_decision` | Sim |
| `item_changed` | Sim |

Padrão consistente nos 8 casos, sem nenhuma exceção: os 2 motivos que descrevem uma decisão de cobertura/desfavorável sem devolução (`coverage_decision`, `no_bpp`) nunca tiveram devolução física; os 3 motivos que descrevem algum retorno de mercadoria (`item_returned`, `warehouse_decision`, `item_changed`) sempre tiveram.

## Exceção confirmada (15/09/2026, 13:15)

Rodando o mesmo script (`consultar_linha_tempo_devolucao.py --candidato=`) num caso real da **conta SV** (pedido `2000017788033354`, já documentado em [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]]), a resolução veio `{'reason': 'coverage_decision', 'benefited': ['complainant'], 'closed_by': 'mediator', 'applied_coverage': True}` — exatamente o motivo que, nos 8 casos MB, nunca teve devolução física. Mas esse caso **teve devolução física de verdade**: produto postado de volta em 02/09/2026, entregue em 08/09/2026 (`destino: seller_address`), `claims/{id}/returns` com `status: delivered` (não deu 404). Primeira exceção real ao padrão, em 9 casos totais.

## Resposta

`resolution.reason` **tende a prever**, mas não garante com certeza, se uma reclamação fechada tem devolução física associada. Nos 8 primeiros casos (todos conta MB) a previsão bateu 100%; no 9º caso (conta SV) ela falhou — `coverage_decision` também pode vir acompanhado de devolução física real. Implicação prática: `resolution.reason` ainda é um bom primeiro sinal pra decidir se vale a pena chamar `/returns`, mas não substitui a chamada real quando a certeza importa — o 404 (ou a ausência dele) continua sendo a única fonte 100% confiável.

## Exemplo

Os 9 casos reais, pedido → motivo → devolução física → conta:

| Pedido | `resolution.reason` | `/returns` | Conta |
|---|---|---|---|
| 2000018433573690 | `coverage_decision` | 404 | MB |
| 2000018337202558 | `no_bpp` | 404 | MB |
| 2000018341680948 | `item_returned` | OK | MB |
| 2000018305033186 | `item_returned` | OK | MB |
| 2000018193298852 | `item_returned` | OK | MB |
| 2000018355246824 | `warehouse_decision` | OK | MB |
| 2000018185722028 | `item_changed` | OK | MB |
| **2000017788033354** | **`coverage_decision`** | **OK (exceção)** | **SV** |

(o 7º caso da rodada original de 12 candidatos, antes desta bateria, foi `2000018341680948` — já contava nesta lista, não duplicado.)

## Relacionado

- [[Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]]
- [[Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent]]
- [[Reclamacao Fecha Antes Da Devolucao Fisica Terminar (Ordem Invertida)]]
- [[Campo resource_id De cancel_purchase Nao Bate Com O Numero Do Pedido]]
- [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]]
