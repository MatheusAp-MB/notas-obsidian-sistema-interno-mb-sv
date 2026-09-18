---
tipo: descoberta
dominio: python
status: confirmada
criado: 17/09/2026
atualizado_em: 17/09/2026 21:38
relacionado: [Mascaramento De Endereco No Shipment Do ML Nao Impede Confirmar Se A Devolucao Chegou De Fato Na MB Ou Na SV (Pedido 2000018113512820)]
---

# Devolução de Item Grande Feita por Transportadora Contratada em Vez do Mercado Envios Fica sem Confirmação de Chegada no Sistema (Pedido 2000017697078004)

**Resumo**: testando pedidos da mesma linha de produto do incidente original (cadeira de transferência elevação hidráulica), um pedido da SV mostrou o shipment de devolução parado em "etiqueta impressa" pra sempre — nunca teve coleta nem entrega registrada — e cancelado manualmente 15 dias depois. Isso confirma que, pra itens grandes/volumosos dessa categoria, a devolução física às vezes é combinada por fora do Mercado Envios (transportadora contratada direto pela empresa ou pelo cliente), e nesses casos a API do ML não tem absolutamente nenhum dado de endereço ou data de chegada — não porque a busca falhou, mas porque a informação não existe do lado do ML. O sistema mostrar "sem confirmação" nesse cenário é o comportamento correto, dentro do limite real dos dados disponíveis. Não é uma regra fixa da categoria do produto: outros pedidos da mesma linha já vistos foram confirmados normalmente pelo Mercado Envios — varia por pedido.

> [!success] Confirmada
> Testado com pedido real (SV `2000017697078004`), mesma linha de produto ("Cadeira De Transferência Elevação Hidráulica Idoso Acamados") do incidente que motivou toda essa investigação. O shipment de volta (`47759895980`) tem `substatus_history` com um único evento (`printed`, 13/08) e `status_history` sem nenhuma data de coleta ou entrega — só `date_cancelled` preenchida, 15 dias depois (28/08, `cancelled_manually`). O endpoint de devoluções também já mostra esse shipment como `"status": "cancelled"`.

## Contexto

Depois de implementar e confirmar em produção a feature de confirmação de endereço (ver [[Mascaramento De Endereco No Shipment Do ML Nao Impede Confirmar Se A Devolucao Chegou De Fato Na MB Ou Na SV (Pedido 2000018113512820)]]), foi testado um novo pedido real da mesma categoria de produto do incidente original que abriu essa investigação (cadeira de transferência, item grande/volumoso) pra ver se a tela continuava se comportando bem em mais um caso real.

## O problema

O pedido testado (SV `2000017697078004`) mostrou, na tela, o Bloco 3 (devolução) sem nenhuma confirmação e sem coluna de endereço — só "ainda não despachado → ainda não chegou". Era preciso confirmar se isso era uma falha do sistema (busca errada, API não respondendo) ou um reflexo fiel de que a devolução física, nesse pedido específico, não tinha passado pelo fluxo normal do Mercado Envios.

## O que levou à resposta

Rodando `investigar_enderecos_shipment.py --empresa SV --numero-pedido 2000017697078004`, o shipment de volta (`47759895980`) veio assim:

- `substatus_history`: só 1 evento — `printed` / `ready_to_ship`, em 13/08/2026 10:05.
- `status_history`: `date_handling` e `date_ready_to_ship` preenchidos (mesma data), mas `date_shipped`, `date_delivered` e `date_returned` são todos `null`. Só `date_cancelled` aparece, em 28/08/2026 09:35.
- `substatus` final: `cancelled_manually`.
- O item era `bulky_large` (88x61x34cm, ~36kg), `tracking_method: "MEL Distribution H&B"` — mesmo perfil de item grande do incidente original.
- O endpoint `/post-purchase/v2/claims/{id}/returns` também já mostra esse mesmo shipment com `"status": "cancelled"`.

Ou seja: a etiqueta de devolução chegou a ser gerada dentro do Mercado Envios, mas o pacote nunca foi coletado por esse fluxo — 15 dias depois alguém cancelou manualmente o shipment, provavelmente porque a devolução física já tinha sido resolvida por fora (transportadora contratada direto, comum pra itens grandes que não cabem bem no fluxo padrão de coleta do Mercado Envios).

## Resposta

Quando o shipment de devolução nunca sai de `printed`/`ready_to_ship` e é cancelado manualmente sem nenhum evento de `picked_up` ou `delivered`, isso indica que a devolução física foi resolvida por fora do Mercado Envios — por uma transportadora contratada direto. Nesse cenário a API do Mercado Livre não tem nenhum dado de endereço, data de coleta ou data de chegada pra oferecer, porque a informação nunca existiu do lado do ML. A tela mostrando "sem confirmação" e nenhuma coluna de endereço nesses casos está correta — é o limite real dos dados disponíveis, não uma falha da implementação.

Importante: isso **não é uma regra fixa da categoria do produto**. Outros pedidos dessa mesma linha (cadeira de transferência) já testados foram confirmados normalmente pelo Mercado Envios, com endereço e badge de confirmação aparecendo certinho. A diferença está no pedido/devolução específica — às vezes vai por transportadora contratada, às vezes vai pelo Mercado Envios — e o sistema reflete fielmente qual dos dois aconteceu, dentro do que a API expõe.

## Exemplo

Progresso do shipment de volta `47759895980` (SV, pedido `2000017697078004`):

| Campo | Valor |
|---|---|
| `substatus_history` | só `printed` (13/08 10:05) |
| `date_handling` / `date_ready_to_ship` | 13/08 10:05 |
| `date_shipped` | `null` |
| `date_delivered` | `null` |
| `date_returned` | `null` |
| `date_cancelled` | 28/08 09:35 |
| `substatus` final | `cancelled_manually` |
| `/returns` → `status` do shipment | `cancelled` |

Nenhum evento de coleta ou entrega existe pra esse shipment — por isso a linha do tempo não tem onde pendurar um endereço, e a tela corretamente não mostra nenhuma confirmação.

## Em aberto

> [!question] Pontos ainda não fechados
> 1. Não existe, até agora, um jeito de saber ANTES (só olhando o pedido) se uma devolução vai ser resolvida via transportadora contratada ou via Mercado Envios — só dá pra perceber depois, observando se o shipment trava em `printed`/`handling` sem nunca progredir.
> 2. O pedido exato do incidente original (entrega às 20h, horário impossível) continua não identificado — mas esse achado reforça que itens dessa categoria (grandes/volumosos) realmente fogem do Mercado Envios com alguma frequência, o que é consistente com a hipótese original.

## Relacionado

- [[Mascaramento De Endereco No Shipment Do ML Nao Impede Confirmar Se A Devolucao Chegou De Fato Na MB Ou Na SV (Pedido 2000018113512820)]] — mesma feature de confirmação de endereço; esse achado aqui documenta um limite diferente dela (ausência total de dado quando a devolução foge do Mercado Envios, não mascaramento de campos).
