---
tipo: duvida
dominio: python
status: em_aberto
criado: 15/09/2026
atualizado_em: 15/09/2026 01:19
relacionado: [Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent, Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]
---

# Campo resource_id de cancel_purchase Não Bate com o Número do Pedido

**Resumo**: os 3 candidatos reais de `type: cancel_purchase` e 1 dos 2 candidatos de `type: cancel_sale` — todos com `resource_id` de 11 dígitos, formato diferente do id de pedido (16 dígitos, prefixo `2000...`) — não foram encontrados pelo script `consultar_linha_tempo_devolucao.py --candidato=<resource_id>`, mesmo tendo reclamação real e confirmada via `claims.search`. Ainda não sabemos a que recurso esse `resource_id` de 11 dígitos se refere de fato.

> [!question] Em aberto
> Levantada em 15/09/2026, na mesma rodada de teste dos 12 candidatos agrupados por tipo. Nenhuma investigação adicional feita ainda além de reparar no formato do `resource_id`.

## Contexto

O script `scripts_exploracao_ML/consultar_linha_tempo_devolucao.py` recebe `--candidato=<valor>` e trata esse valor sempre como número de pedido (chama a API de pedidos com ele). Isso funcionou pra todos os candidatos de `mediations`, `returns`, `change` e 1 dos 2 de `cancel_sale` — todos com `resource_id` de 16 dígitos, no formato usual de pedido do Mercado Livre (`2000018341680948`, por exemplo).

## A pergunta

Rodando o mesmo comando para os candidatos de `cancel_purchase` (`48012678972`, `48004298144`, `48000640930`) e para o 2º candidato de `cancel_sale` (`47905856173`) — todos com 11 dígitos, sem o prefixo `2000...` —, o script respondeu "Nenhuma reclamação encontrada pra esse pedido" pros 4, mesmo esses `resource_id` vindo direto de reclamações reais e confirmadas no `claims.search` (ids `5576872298`, `5576303768`, `5576303282` e `5570259011`, respectivamente). A que recurso esse `resource_id` de 11 dígitos se refere, já que claramente não é o número do pedido? É um `shipment_id`, um `pack_id`, ou outra coisa? E existe algum campo irmão na própria resposta do `claims.search` (algo como um campo `resource`, que não apareceu nos JSONs coletados até agora) que já diga isso, sem precisar adivinhar pelo formato do número?

## O que já se sabe até agora

- Padrão observado em 4 dos 12 candidatos reais testados: 3/3 de `cancel_purchase` e 1/2 de `cancel_sale`.
- Nos 4 casos, o `resource_id` tem 11 dígitos — visivelmente mais curto que o formato de pedido usado nos outros 8 candidatos (16 dígitos, sempre começando com `2000`).
- Sem a documentação oficial da página de `claims.search` (ou de `claims/{id}`) que descreva o campo `resource_id` — e um eventual campo `resource` companheiro — não dá pra confirmar a hipótese, só observar a correlação de formato. Se a doc HTML dessa página estiver disponível, vale colar aqui pra fechar essa dúvida.

## Relacionado

- [[Tipo cancel_sale Fecha Com Resolution Null E Inverte Complainant E Respondent]]
- [[Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]]
