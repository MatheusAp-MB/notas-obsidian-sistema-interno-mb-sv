---
tipo: descoberta
dominio: python
status: confirmada
criado: 17/09/2026
atualizado_em: 17/09/2026 21:16
relacionado: [Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]
---

# Mascaramento de Endereço no Shipment do ML Não Impede Confirmar se a Devolução Chegou de Fato na MB ou na SV (Pedido 2000018113512820)

**Resumo**: investigando um incidente real (pacote grande — cadeira de transferência, 30kg+ — com evento de "entregue" registrado às 20h, impossível já que a equipe só trabalha até as 17h), foi testado se a API do Mercado Livre expõe o endereço exato de cada ponta da rota (venda: NÓS→CLIENTE; devolução: CLIENTE→NÓS). O recurso completo `/shipments/{id}` (nunca chamado pela produção até aqui) traz `sender_address`/`receiver_address` detalhados, mas com campos como rua/número/CEP/nome/telefone às vezes mascarados ("XXXXXXX") — não pelo tipo do endereço, como se pensou inicialmente, e sim pela perna do envio (ida/volta) e pelo papel de quem aparece ali (quem envia vem sempre mascarado; na ida quem recebe não vem, na volta vem). Mesmo mascarado, dois IDs nunca somem (`user_id` e `address_id`) e permitem confirmar com certeza absoluta — testado e confirmado tanto pra MB quanto pra SV — que um endereço é o cadastro oficial da empresa, sem depender de nenhum campo mascarado. Isso responde a pergunta real por trás do incidente: não interessa a rua exata, interessa saber se o ML diz que o pacote chegou fisicamente na empresa ou em um ponto intermediário (agência/transportadora).

> [!success] Confirmada
> Testado com dado real em 2 pedidos, um por conta (MB: `2000018113512820`; SV: `2000017960227630`), via os scripts `investigar_enderecos_shipment.py` (novo) e `consultar_linha_tempo_devolucao.py` (melhorado). `address_id` e `user_id` de cada empresa aparecem idênticos em múltiplas respostas da API e batem exatamente com `MB_USER_ID`/`SV_USER_ID` do `.env` — confirmação direta, não inferência. O teste da SV também corrigiu a hipótese inicial sobre o que determina o mascaramento (é perna do envio + papel, não o campo `types`).

## Contexto

Durante um caso real, um pacote grande (cadeira de transferência, 30kg+) mostrou um evento de "entregue para nós" registrado às 20h — horário impossível, já que a equipe só trabalha até as 17h. A hipótese levantada foi que o pacote tinha sido coletado/entregue numa transportadora naquele horário, não literalmente na MB. A tela do próprio Mercado Livre não deixou isso claro, e não foi possível identificar qual pedido era esse na hora. Isso levantou a pergunta: a API do ML expõe o endereço exato de cada ponta da rota — tanto no sentido NÓS→CLIENTE (venda) quanto CLIENTE→NÓS (devolução)?

## O problema

Duas perguntas em uma: (1) é possível obter o endereço completo de origem/destino de cada shipment via API? (2) Se não (endereço mascarado), ainda é possível confirmar que um envio realmente chegou/saiu do endereço oficial da MB ou da SV, e não de um ponto intermediário?

## O que levou à resposta

Foi construído `investigar_enderecos_shipment.py` (novo script, `scripts_exploracao_ML/`) pra fazer um dump bruto de `/shipments/{id}` (ida e volta), `/post-purchase/v1/claims/search`, `/post-purchase/v2/claims/{id}/returns` e `/shipments/{id}/history`, testado primeiro contra o pedido real `2000018113512820` (conta MB) e depois contra `2000017960227630` (conta SV), pra confirmar se o padrão se repetia nas duas contas.

Achados, em ordem:

**1. `/shipments/{id}` nunca tinha sido chamado pela produção — e traz endereço completo, com alguns campos às vezes mascarados.** O recurso completo do shipment (diferente do `/shipments/{id}/history`, já usado) tem `sender_address` e `receiver_address` ricos — mas `street_name`, `street_number`, `zip_code`, `address_line`, `comment`, `receiver_name` e `receiver_phone` podem vir como `"XXXXXXX"`. Cidade, bairro e estado continuam sempre visíveis, mascarado ou não. (A regra de quando isso acontece está no achado 6, abaixo — não é o que se pensou inicialmente.)

**2. `/shipments/{id}/history` confirmado sem nenhum dado de local.** Só tem `date`/`status`/`substatus` por evento — não dá pra saber onde fisicamente o pacote passou em pontos intermediários da rota, só a data/status. Confirma que só as pontas (origem/destino) têm endereço, nunca o meio do caminho.

**3. Mesmo mascarado, dois IDs nunca somem — e provam quem é o endereço.** `sender_id`/`receiver_id` (o `user_id` do ML de cada parte) e `id`/`location_id` do endereço (`address_id`) aparecem sempre, mesmo com o resto mascarado. No pedido MB testado (`2000018113512820`): `address_id 1582450605` aparece idêntico em 3 respostas diferentes — `sender_address` da ida, `receiver_address` da volta, e `destination.shipping_address` do endpoint de devoluções (que, nesse último, vem sem máscara nenhuma — mas só porque o destino do retorno é sempre o vendedor). E `sender_id` (ida) = `receiver_id` (volta) = `82537282`.

**4. Confirmação definitiva via `.env` — MB.** `MB_USER_ID` no `.env` do sistema é `82537282` — bate exatamente. Não é mais suposição: aquele endereço mascarado é, comprovadamente, o cadastro oficial da MB no Mercado Livre.

**5. Repetindo o teste com um pedido da SV, o padrão se confirma e o endereço oficial da SV é descoberto.** No pedido `2000017960227630` (conta SV): `address_id 1582499927` aparece idêntico nas mesmas 3 respostas (ida, volta, endpoint de devoluções), e `sender_id` (ida) = `receiver_id` (volta) = `161534973` — que bate exatamente com `SV_USER_ID` do `.env`. **SV confirmada, igual à MB.**

**6. Esse segundo teste também corrigiu a explicação inicial sobre o mascaramento.** A hipótese da primeira rodada era que `types: []` (endereço "normal") sempre vinha mascarado, e só agência (`agency_address`) vinha completo. O pedido da SV derruba isso: o endereço da cliente Cristina (`address_id 1435733978`, `types: []` nas duas vezes que aparece) veio **completo** como `receiver_address` na ida, e **totalmente mascarado** como `sender_address` na volta — mesmíssimo endereço, resultado diferente conforme a perna/papel. A regra real: **na ida (venda), quem envia (vocês) vem sempre mascarado e quem recebe (cliente) não; na volta (devolução), os dois lados vêm mascarados.**

**7. A exceção de agência ainda não foi isolada como regra independente.** O único caso de agência visto até agora (Armazém Alpino, pedido MB) estava do lado que já seria aberto por padrão (receiver da ida) — então não dá pra saber se "ser agência" realmente muda o resultado numa posição que normalmente vem fechada. Fica em aberto.

## Resposta

Duas perguntas diferentes, que é importante não misturar:

- **"O endereço está mascarado ou não?"** depende da perna do envio e do papel de quem aparece ali (achado 6) — não do `types`. Mas essa pergunta não importa pro que você realmente precisa saber.
- **"O ML diz que isso chegou fisicamente aqui, ou em outro ponto?"** — essa é a pergunta que interessa, e ela é respondida comparando `address_id` e `user_id` (nunca mascarados, em nenhum dos endereços vistos até agora) contra os valores oficiais já confirmados: MB (`user_id 82537282` / `address_id 1582450605`) e SV (`user_id 161534973` / `address_id 1582499927`). Se bater, é o cadastro oficial. Se não bater — ou se vier com `types: ["agency_address"]` e um objeto `agency` preenchido — é um ponto intermediário (agência/transportadora), não a empresa.

Os scripts `investigar_enderecos_shipment.py` (novo) e `consultar_linha_tempo_devolucao.py` (melhorado, já mostra as pontas de origem/destino de cada perna) trazem os campos certos pra essa leitura; falta só formalizar a comparação contra os 2 pares de valores oficiais (hoje é leitura manual).

## Exemplo

Cadeia de identidade confirmada nos dois pedidos de teste:

| Empresa | Campo | Onde aparece | Valor |
|---|---|---|---|
| MB | `sender_id` (ida) | `/shipments/47853998818` | `82537282` |
| MB | `receiver_id` (volta) | `/shipments/47915040792` | `82537282` |
| MB | `address_id` (ida, volta e devoluções) | — | `1582450605` |
| MB | `MB_USER_ID` (`.env`) | configuração local | `82537282` ✅ bate |
| SV | `sender_id` (ida) | `/shipments/47781411941` | `161534973` |
| SV | `receiver_id` (volta) | `/shipments/47876009251` | `161534973` |
| SV | `address_id` (ida, volta e devoluções) | — | `1582499927` |
| SV | `SV_USER_ID` (`.env`) | configuração local | `161534973` ✅ bate |

O caso que corrigiu a hipótese do `types` (mesmo endereço da cliente Cristina, pedido SV `2000017960227630`):

| Papel | Perna | `types` | Mascarado? |
|---|---|---|---|
| receiver (Cristina) | Ida | `[]` | Não |
| sender (Cristina, mesmo `address_id 1435733978`) | Volta | `[]` | Sim |

## Implementação

Levada para a tela de produção real (`view_consultar_pedido`, Blocos 1 e 3 de `consultar_pedido.html`) via nova função `_buscar_shipment_completo` (chama `/shipments/{id}` sem `x-format-new` — esse header é só do `/history`, confundir os dois faz o endereço sumir em silêncio, sem erro nenhum). Confirmado com pedido real em produção em 17/09/2026: o badge de destino aparece no cabeçalho de cada bloco (📍 agência com nome, ou ✅ confirmação contra o endereço oficial), e a coluna de endereço aparece nas linhas de coleta física e entrega, mascarada ou não, exatamente como previsto no achado 6. No Bloco 3 (devolução), os dois lados vieram mascarados e mesmo assim o alerta confirmou o endereço oficial batendo por `address_id`/`user_id`. No Bloco 1 (ida), o mesmo pedido reproduziu o caso de agência do achado 7 (Armazém Alpino) — reforça o achado, mas não resolve a dúvida do "Em aberto" nº 1 abaixo, porque de novo é do lado que já viria aberto por padrão (receiver da ida).

## Em aberto

> [!question] Pontos ainda não fechados
> 1. A exceção de agência não foi isolada como regra independente da perna/papel — falta um caso de agência do lado que normalmente vem fechado (ex: agência aparecendo como sender da ida, ou como qualquer lado da volta). Reconfirmado no pedido usado pra validar a implementação em produção (17/09/2026): mesmo caso (Armazém Alpino, receiver da ida), nenhum lado novo.
> 2. O pedido exato do incidente que motivou essa investigação (cadeira de transferência, evento às 20h) ainda não foi identificado. Curiosidade: o pedido de teste usado pra descobrir o endereço oficial da SV (`2000017960227630`) é, por acaso, também uma "Cadeira De Transferência Elevação Hidráulica" de ~36kg — mesmo tipo/peso do incidente — mas os horários desse pedido específico não mostram nada anômalo (devolução chegou às 11:12), então provavelmente não é o mesmo caso, só a mesma linha de produto.

## Relacionado

- [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]] — mesma metodologia (validar contra pedido real via API), mesmo tipo de produto (cadeira de transferência) por coincidência.
