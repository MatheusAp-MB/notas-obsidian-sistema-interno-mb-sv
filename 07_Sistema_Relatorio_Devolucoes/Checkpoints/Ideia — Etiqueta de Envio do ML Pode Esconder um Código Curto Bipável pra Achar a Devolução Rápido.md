---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_andamento
criado: 16/09/2026
atualizado_em: 17/09/2026 16:46
relacionado: [[De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]], [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]], [[Consultar Pedido Passa a Aceitar NF, Nome e Endereço Além do Número — Escopo Fechado e Validado Contra a Prioridade da Ana]], [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]
resumo: Conclusão importante (17/09/2026): o código bipável da etiqueta (QR/código de barras de 11 dígitos, Ref. ID, ID do triage Item) é provavelmente controle interno Mercado Livre↔transportadora (romaneio de coleta), não exposto pela API pública. Decisão: focar nos campos já visíveis na etiqueta (Número do pedido, Nota Fiscal, Nome do cliente, Endereço, e Pack ID = carrinho, drop_off = Correios, ambos confirmados). NOVO (17/09, tarde): diferente dos códigos acima, o código `#443851581` ao lado do nome do cliente FOI confirmado como o `buyer.id` do comprador — testado via API e cruzado digit-a-digit com Relatórios de Devolução reais. Só aparece em etiquetas de venda comum (Full não tem esse código, continua dependendo só da etiqueta amarela). Abre um caminho novo: buyer.id -> lista todos os pedidos do cliente -> classifica por tipo (idealização inicial, ainda não planejada). NOVO (17/09, noite): fluxo validado em console contra 14 casos reais de devolução (13/14 bateram direto, 1 exceção era Pack ID e não Pedido, resolvida via GET /packs/{id}, revelando o pedido real e o buyer.id direto) -- 14/14 explicados, reforça o valor da ideia ao resolver a ambiguidade pacote-vs-pedido. Planejar da tela real do Django ainda não iniciado. CONFIRMADO na prática (17/09, noite): pedido real da Claudia (`2000018056884044`) rodado e batendo como "Com devolução" -- 14/14 casos totalmente validados ponta a ponta. Achado extra: o pack_id apareceu no lugar do pedido até numa venda Full, mostrando que a ambiguidade pacote-vs-pedido não é exclusiva de venda comum. NOVO (17/09, noite): essa validação virou uma decisão própria sobre o futuro da tela Consultar Pedido, ver [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]].
---

# Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido

## Origem

Incômodo pessoal de Matheus desde a época em que trabalhava na devolução: a etiqueta de envio do Mercado Livre traz vários códigos, QR code e código de barras, mas nenhum deles é útil hoje pra achar a devolução no sistema de forma prática (a forma convencional é digitar o número completo do pedido, tipo "2000...").

## Hipótese

Etiqueta de expedição normalmente não é gerada à toa — esses códigos costumam servir a sistemas de logística (leitura em esteira, ponto de coleta, rastreio de transportadora), então é provável que exista ali um identificador estruturado e mais curto que o número do pedido. A dúvida em aberto é qual desses códigos é esse, e como ele se relaciona com o pedido/devolução dentro do sistema.

## Plano combinado (16/09/2026, à noite)

- Hoje à noite: focar em aprender se é possível decifrar isso — nenhuma implementação ainda, só investigação/aprendizado.
- Caminhos possíveis discutidos: usar a documentação oficial da API de Envios (`shipments`) do Mercado Livre quando disponível, e/ou comparar uma etiqueta física real com os dados já obtidos via API pra um pedido conhecido (ex: o caso já mapeado em [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]]).
- Amanhã (17/09/2026, feriado, dia livre): mudar o foco pra polir o sistema com calma, atacando os pontos que a Ana levantou (ver [[De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]]).

## Achados da Etapa 1 (formato confirmado com 3 fotos reais, 16/09/2026)

Matheus tirou fotos de 3 etiquetas reais de devolução (comprador devolvendo pro CD da Magazine Brasileiro em Pompéia-SP) e comparamos o formato:

- **O QR code não é redundante à toa** — decodificado (leitura real do arquivo de imagem, não só visual) nas 3 etiquetas, o conteúdo é um JSON: `{"id":"<11 dígitos>","t":"lm"}`. O valor de `id` bate exatamente com o número impresso embaixo do código de barras em cada etiqueta. Ou seja: código de barras e QR carregam o mesmo dado, em 2 formatos de leitura — confirma que existe sim um identificador curto (11 dígitos) pensado especificamente pra ser bipado, bem mais curto que o número do pedido (16-17 dígitos, formato "2000...").
- **O campo `"t":"lm"`** marca um tipo — ainda hipótese, não confirmado: pode ser "last mile", o que bateria com a rota impressa na própria etiqueta (`FPR01 > XSP17 > SSP13 > 18`).
- **O identificador "grande" (tipo pedido) muda de nome e formato conforme o tipo de etiqueta** — achado importante:
  - Etiqueta via rede própria do ML ("AGÊNCIA MERCADO LIVRE" marcada): "**Pack ID**: 20000 14703695937" (agrupa possivelmente mais de 1 pedido/item)
  - Outra etiqueta via rede própria do ML: "**Venda**: 20000179398871998" — parece ser literalmente o número do pedido, no mesmo formato "2000..." já usado no sistema
  - Etiqueta via Correios (marca dos Correios visível, sem a caixa "Agência Mercado Livre" preenchida): "**Ref. ID**: 1228356601-1" — formato totalmente diferente, mais curto, com sufixo "-1"
- **Confirmado como ruído**: `14SSP13  03:00` e a rota `FPR01 > XSP17 > SSP13 > 18` são idênticos nas 3 etiquetas, mesmo com datas de despacho diferentes (10/09, 05/09, 02/09) — é código de logística da rota/turno, compartilhado por vários pacotes do mesmo trajeto, não identifica o pedido individual.

## Achados da Etapa 1 — Etiqueta Amarela de Triagem (Full)

Matheus trouxe uma 4ª etiqueta, de um tipo diferente das 3 de transporte: uma etiqueta amarela específica pra itens vendidos e devolvidos via **Full** (fulfillment do próprio Mercado Livre).

- Essa etiqueta nomeia os campos sem ambiguidade, ao contrário das 3 anteriores:
  - **"ID do pedido": `2000017749492036`** — mesmo formato "2000..." já usado no sistema
  - **"ID do triage Item": `1000054562573`** — formato bem diferente (13 dígitos, prefixo "100005"), específico do processo interno de triagem/conferência do centro de fulfillment
- O QR dessa etiqueta também segue um formato diferente do das 3 etiquetas de transporte: lá era um JSON `{"id":...,"t":"lm"}`; aqui o QR traz só o número puro do "ID do triage item", sem estrutura.
- **Confirmação do "ID do triage Item" por 2 fontes independentes**: a foto saiu borrada demais pra eu decodificar o QR com as ferramentas testadas (OpenCV, pyzbar, zxing-cpp), mas Matheus rodou o QR num app externo (`1000054562573`) e depois leu o texto impresso a olho, ampliado (`100005456257` + dúvida entre 3 ou 8 no último dígito) — os 12 primeiros dígitos bateram exatamente entre as 2 leituras, e o QR resolveu a dúvida do último dígito a favor do 3. Uma tentativa de OCR via GPT sobre a mesma foto deu um valor bem diferente e incorreto (`100000058602951`) — reforço de que leitura de QR (quando bem-sucedida) é mais confiável que OCR de texto impresso borrado, por causa da correção de erro embutida no formato QR.

## Achados da Etapa 2 — Cruzamento com Relatórios Reais de Devolução

Matheus cruzou as etiquetas físicas com relatórios de devolução reais gerados pelo próprio sistema, para o mesmo cliente (Rafael Ramos Machado), que devolveu mais de 1 unidade do mesmo produto (Pulverizador Costal Elétrico Kawashima PET-200 20L com Dosador).

- **Confirmado com prova digit-a-digit: "Venda" (etiqueta) = "Pedido" (relatório) — é o mesmo valor, literalmente.** A etiqueta com "Venda: 2000017939871998" (dispachada 05/09/2026) corresponde exatamente ao relatório de devolução com "Pedido 2000017939871998" (destino "Venda como usado"). Os 2 números batem dígito por dígito (conferido com recorte e zoom, não só leitura corrida). Isso fecha a pergunta que estava em aberto sobre o que "Venda" representa: não é "parecido" com o pedido, É o pedido.
- **O mesmo cliente teve pelo menos 2 devoluções distintas do mesmo produto**, cada uma com seu próprio Pedido:
  - Pedido `2000017939871998` — destino "Venda como usado"
  - Pedido `2000018113512820` — destino "Troca", venda 25/08/2026, recebido (nós) 03/09/2026
- **Ainda não confirmado**: o Ref. ID `1228356601-1` (etiqueta via Correios) foi trazido junto desse segundo grupo de fotos, o que sugere que pode ser a etiqueta da devolução "Troca" (Pedido `2000018113512820`) — mas os formatos são incompatíveis pra confirmar visualmente (um é "2000..." de 16 dígitos, o outro é "1228356601-1"), e Matheus ainda não confirmou com certeza física que essa etiqueta específica acompanhou essa devolução específica.
- **Segue sem confirmação**: o Pack ID `2000014703695937` da primeira etiqueta (10/09/2026) continua sem nenhum pedido conhecido batendo com ele.

## Achados da Etapa 2 (continuação) — "ID do pedido" da Etiqueta Full Confirmado, Lição sobre Tinta Fraca

Último grupo de fotos comparado: a etiqueta amarela de triagem (Full) e um 3º relatório de devolução real, de outro cliente (Dionifer Neuenfeld).

- **Discrepância inicial**: a leitura visual (recorte e zoom) da etiqueta amarela mostrava "ID do pedido: 2000017749492**0**36", enquanto o relatório de devolução mostrava "Pedido 2000017749492**8**36" — 1 dígito de diferença (0 vs 8), no mesmo ponto onde a tinta térmica sai mais fraca.
- **Matheus confirmou sua leitura da etiqueta** ("ID do pedido: 2000017749492036"), mas deixou claro que não era uma afirmação de certeza — só descrevendo o que via na imagem.
- **Resolução real, não por inferência visual**: o pedido correspondente a essa etiqueta amarela foi **buscado na plataforma do Mercado Livre usando os dígitos legíveis dessa mesma etiqueta, antes do relatório de devolução ser gerado**. Ou seja, o próprio Mercado Livre já tinha resolvido a ambiguidade — o pedido certo termina em "2836", e o dígito correto é **8**, não 0. A etiqueta realmente tem tinta fraca degradando esse ponto, como já era hipótese.
- **Fecha o achado sem ressalva**: "ID do pedido" (etiqueta amarela Full) = "Pedido" (relatório do sistema) — confirmado, mesmo padrão já visto com "Venda" = "Pedido" nas etiquetas de transporte.
- **Lição prática registrada**: essas etiquetas térmicas têm problema real e recorrente de tinta fraca, já confundindo "3 ou 8" (ID do triage Item, achado anterior) e agora "0 ou 8" (ID do pedido). Quando sobrar dúvida de leitura visual, o caminho mais confiável não é insistir na leitura a olho (nem confiar cegamente em OCR automático) — é buscar o pedido direto na plataforma (Central de Vendedores/ML) pelos dígitos legíveis, e deixar o próprio sistema resolver a ambiguidade.

## Achados da Documentação Oficial do Mercado Livre (16/09/2026)

Matheus conseguiu (via busca e download manual) 4 páginas reais da documentação oficial de developers.mercadolivre.com.br: "Gestão Mercado Envios" (atualizada 09/06/2026), "Mercado Envios 2" (atualizada 06/07/2026), "Envios Fulfillment" (atualizada 10/06/2026) e "Devoluções" (atualizada 22/12/2025).

- **Pack ID confirmado oficialmente**: a doc de Mercado Envios 2 declara que "o campo 'pack_id' mostra o número do carrinho ao qual o pedido pertence" — é campo do **pedido**, não do envio, e representa o carrinho de compra (por isso agrupa mais de 1 pedido). Fecha, sem ressalva, o que já suspeitávamos na prática com o caso do Rafael Ramos Machado.
- **Vocabulário oficial de `logistic_type`** (doc Gestão Mercado Envios): `drop_off` (transporte por commercial-carrier, ex: Correios), `cross_docking` e `xd_drop_off` (transporte pela própria rede Meli), `fulfillment` (Full, estoque de origem Meli), `self_service` (Flex, transporte pelo remetente).
  - **Hipótese nova**: nossa etiqueta com "Ref. ID" (`1228356601-1`, via Correios) provavelmente é `logistic_type: drop_off` — o formato diferente do ID (não é "2000...") bateria com ser uma referência do próprio Correios, não um identificador nativo da Meli. Ainda não confirmado via API.
- **Fluxo de devolução com 2 pernas de envio** (doc Devoluções, `GET /post-purchase/v2/claims/$CLAIM_ID/returns`): uma devolução pode ter mais de 1 `shipment_id`, com `type`:
  - `"return"`: destino `seller_address` ou `warehouse` (comprador devolvendo)
  - `"return_from_triage"`: do `warehouse` (depósito Meli) de volta pro vendedor, depois de uma revisão
  - Isso pode explicar por que a etiqueta amarela de Full carrega 2 IDs diferentes ("ID do pedido" e "ID do triage Item") — possivelmente ligados a pernas diferentes desse fluxo. Ainda não confirmado via API.
  - Também documentado: campo `method` da review de devolução — `"none"` (revisão pelo vendedor) vs `"triage"` (revisão pela própria Meli) — "triagem" é processo genérico da Meli revisando no lugar do vendedor, não exclusivo do Full.
- **O que a doc pública NÃO cobre** (continua sem confirmação oficial): QR code, código de barras, o nome literal do campo "Ref. ID", "ID do triage Item" como campo de API, e o tag `"t":"lm"` do QR das etiquetas de transporte. Essas estruturas físicas da etiqueta parecem ser implementação interna da Meli, não exposta na API pública — só um teste real contra a API (ou mais casos empíricos) resolve.

## Achados via API Real — Pedido 2000017788033354 (16/09/2026)

Testado com os scripts `scripts_exploracao_ML/investigar_dados_da_venda.py`, `investigar_detalhe_devolucao.py` e `investigar_shipment.py` (conta SV, repo `Projeto-Sistema-Devolucao`), contra o pedido já mapeado em [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]] (claim `5564889989`) — não é caso Full (`fulfilled: false`).

- **`pack_id: null`** nesse pedido — consistente com a doc (não fazia parte de carrinho); não confirma nem derruba a hipótese, só bate com o esperado.
- **Envio de ida (forward)** — `shipping.id: 47700447430`: `logistic.mode: "me2"`, `logistic.type: "xd_drop_off"`, `direction: "forward"`, `tracking_number: "ULDSM6HFZRNTBEUC2LEV3TFJ6Q"` (formato alfanumérico da rede própria Meli).
- **Devolução** (`/post-purchase/v2/claims/$CLAIM_ID/returns`): só **1** `shipment`, `type: "return"`, `destination: seller_address` — foi **direto pro vendedor**, sem passar por `warehouse`. Confirma o modelo da doc: sem triagem, `"return"` vai direto, sem existir um `"return_from_triage"`. `shipment_id` da devolução: `47846576718`.
- **Envio de volta (return)** — consultando esse `shipment_id`: `direction: "return"` (confirma a perna certa), **`logistic.type: "melinet"`** — valor **novo, não documentado** em nenhuma das 4 páginas oficiais lidas (lá a lista de tipos `me2` era só `drop_off`/`xd_drop_off`/`self_service`/`cross_docking`/`fulfillment`). `tracking_number` é o mesmo UUID (`92f2f739-1ab9-4632-93db-c49638865b31`) — formato ainda não visto em nenhuma etiqueta física fotografada. `tracking_method: "MEL Distribution H&B"`, `shipping_method.name: "Devolución Estándar"`.
- **Conclusão prática**: devolução direta pro vendedor (sem triagem) usa `logistic.type: "melinet"` — rede própria de devolução da Meli, diferente do `drop_off` hipotetizado pro Ref. ID/Correios. Esse pedido específico não testou a hipótese do Ref. ID (não foi via Correios) nem o par `return`/`return_from_triage` (não teve triagem) — pra fechar essas 2 pontas, precisa de um caso real conhecido como via Correios, ou um caso vendido via Full.

## Achados via API Real — Pack ID, Correios/drop_off e Triagem Confirmados (17/09/2026)

Testado com os mesmos scripts (agora já com `--empresa`/`--pedido`/`--claim-id`/`--shipping-id` via argparse), contra os 2 pedidos reais das fotos: `2000018113512820` (Rafael Ramos Machado, "Troca") e `2000017749492836` (Dionifer Neuenfeld, etiqueta amarela Full).

- **Pack ID confirmado com pedido real**: o pedido `2000018113512820` (Rafael) veio com `"pack_id": 2000014703695937` — exatamente o mesmo Pack ID fotografado na 1ª etiqueta. Fecha, com prova real (não só a explicação genérica da doc), que esse Pack ID agrupa (pelo menos) esse pedido. A API também marca esse pedido com as tags `"pack_order"`.
- **Rafael/Troca não corresponde à etiqueta "Ref. ID"**: a devolução desse pedido foi direto pro vendedor (`destination: seller_address`), com `tracking_number: "35BGRMMOYJPT3BUFQJN4VLLAHA"` e `logistic.type: "xd_drop_off"` — não bate em nada com o formato "Ref. ID" (`1228356601-1`) nem com Correios. A suspeita antiga (de que essa etiqueta acompanhava essa devolução) não se sustenta nos dados reais.
- **Dionifer foi pra um centro de triagem de verdade, via Correios — confirma a hipótese do `drop_off`**: a devolução foi pro `warehouse` em Araucária-PR, com `tracking_number: "AP344808275BR"` (formato oficial de rastreio dos Correios) e `tracking_method: "PAC"`. O `logistic.type` veio **`drop_off`** — confirma com dado real a hipótese tirada da doc oficial (drop_off = transportadora externa/Correios). Além disso, o endereço de destino tem literalmente `"triage"` na lista de `types` (`["logistic_center_BRPR01", "warehouse", "triage"]`) — a confirmação mais direta até agora de que esse centro de triagem existe.
- **Mesmo assim, a etiqueta "Ref. ID" específica (`1228356601-1`) continua sem pedido conhecido batendo com ela** — nem Rafael, nem Dionifer usam esse tracking number. O `drop_off`/Correios como categoria está confirmado; só falta achar qual pedido gerou essa etiqueta específica.
- **Novo mistério**: mesmo no caso do Dionifer, que sabemos ter ido pra um centro de triagem, o endpoint de devolução só trouxe **1** `shipment` (`type: "return"`) — o `"return_from_triage"` nunca apareceu, nem aqui nem no caso do Edgar. Ou essa 2ª perna é criada depois (fora da janela em que consultamos) ou não é exposta por esse mesmo endpoint.
- **2 valores diferentes pra devolução direta ao vendedor, sem triagem**: Edgar usou `logistic.type: "melinet"`; Rafael usou `logistic.type: "xd_drop_off"`. Ainda não sabemos o que decide qual dos dois é usado em cada caso.

## Achados via API Real — Reteste Após 1 Mês e Mecanismo do Fechamento Automático (17/09/2026)

Testada a hipótese de que existiria uma 2ª reclamação (criada depois da triagem decidir o destino do item) carregando o `return_from_triage` — usando o novo script `investigar_claims_do_pedido.py --empresa MB --pedido 2000017749492836` (Dionifer).

- **Hipótese do "claim escondido" descartada**: `paging.total: 1` — só existe a mesma reclamação `5558190573` já conhecida, nenhuma 2ª reclamação depois da triagem.
- **Novo valor de `resolution.reason` documentado**: esse mesmo resultado trouxe `resolution.reason: "warehouse_decision"` (diferente do `coverage_decision` já visto em casos anteriores do vault), junto com `benefited: ["complainant"]`, `closed_by: "mediator"`, `applied_coverage: true`, `date_created: "2026-08-21T01:00:18.000-04:00"`.
- **Reteste do mesmo caso ~1 mês depois (17/09/2026) não mudou nada**: `investigar_review_devolucao.py` e `investigar_detalhe_devolucao.py` rodados de novo sobre o mesmo `return_id`/`claim_id` do Dionifer devolveram exatamente o mesmo estado do snapshot de 21/08 — mesmo `last_updated` na review (`seller_status: "pending"` intacto) e a devolução continua com só 1 `shipment`. Confirma que esse estado está parado, não é uma demora transitória.
- **Campos novos revelados no endpoint de devolução** (o script anterior filtrava esses campos): `refund_at: "delivered"`, `date_closed`, `status_money: "refunded"`, `subtype: "return_total"`, `intermediate_check: false`.
- **Achado principal — tudo acontece automaticamente, em ~2 segundos**: cruzando os horários dos 3 registros já obtidos (histórico do envio de devolução, review e devolução), a review foi criada, a devolução foi fechada (`date_closed`) e a reclamação foi resolvida num intervalo de ~2 segundos entre si (21/08/2026, por volta de 01:00:16–01:00:18), várias horas depois da entrega física na triagem (20/08 11:09:03). Isso indica um processo automático (provavelmente um job em lote noturno) resolvendo tudo de uma vez com base no `reason_id` que o comprador já tinha declarado na reclamação (`"damaged"`) — não uma inspeção humana demorada.
- **Hipótese revisada pro `return_from_triage`**: o campo `refund_at: "delivered"` mostra que o reembolso é liberado no instante da entrega, sem esperar a revisão do vendedor (`seller_review_pending`) ser concluída — essa revisão parece não bloquear nada, podendo ficar pendente pra sempre sem consequência prática. Isso levanta a possibilidade de que o `"return_from_triage"` simplesmente **não exista** pra casos como esse (`product_condition: "unsaleable"`, resolvido automaticamente): o item pode ficar retido/descartado no CD do Mercado Livre, com `product_destination: "seller"` funcionando como uma classificação/direito no papel, não uma promessa logística real de reenvio físico.

## Achados via API Real — Escaneamento em Lote Descarta a Hipótese da Condição do Produto (17/09/2026)

Testado com o novo script `scripts_exploracao_ML/escanear_candidatos_triagem.py` (conta MB), que busca um lote de reclamações fechadas e encadeia sozinho `GET /post-purchase/v2/claims/$CLAIM_ID/returns` + `GET /post-purchase/v1/returns/$RETURN_ID/reviews` pra cada uma — 15 reclamações testadas, janela de 19/06 a 18/08/2026.

- **6 claims `cancel_purchase`** (cancelamento antes do envio) e **1 claim `mediations` sem devolução associada** — corretamente sem `return_id` (404 esperado), confirma que nem toda reclamação fechada tem devolução física.
- **8 casos reais de triagem** (`method: "triage"`) — 3 com `product_condition: "unsaleable"`, 5 com `product_condition: "saleable"`. **Nos 8, sem exceção, só apareceu 1 `shipment` (`type: "return"`)** — nenhum gerou um 2º shipment `"return_from_triage"`, nem os saleable nem os unsaleable.
- **Hipótese "condição do produto decide o 2º shipment" DESCARTADA**: amostra de 8 casos reais (não só 1) é grande o suficiente pra derrubar essa hipótese — `product_condition` não é o que determina se o `return_from_triage` aparece.
- **Achado novo no lugar**: o que muda entre os 2 grupos não é o shipment, é o campo `seller_status` da review — só existe (e vem `"pending"`) quando `product_condition: "unsaleable"`; nos 5 casos `saleable`, esse campo simplesmente não aparece. Hipótese: `seller_status: pending` é uma ação de CONTESTAÇÃO disponível só quando o item vem danificado (bate com `available_actions: [{"action": "return_review_fail"}]` já visto no claim do Dionifer) — não uma etapa que todo caso passa.
- **Confirma uma inconsistência da doc, agora com um caso real**: o claim `5561774655` veio com `"type": "returns"` (plural) — diferente de `"mediations"` visto nos outros 7. Bate com o que o comentário do `investigar_claims_recentes.py` já suspeitava (a doc mostrava "return" e "returns" em páginas diferentes).
- **Novo valor de `resolution.reason` documentado**: `"no_bpp"` (2 casos, ambos com `applied_coverage: false`) — 3º valor conhecido, ao lado de `coverage_decision` e `warehouse_decision`.
- **`resolution.reason` parece correlacionar com o TIPO do claim, não com o resultado**: todo `cancel_purchase` veio com `coverage_decision`; todo caso de triagem (saleable ou unsaleable) veio com `warehouse_decision`.

## Achados via API Real — Teste do Candidato Saleable Mais Antigo Descarta a Hipótese de Continuação do Mesmo Shipment (17/09/2026)

Escolhido o candidato `saleable` mais antigo do lote acima (claim `5561573870`, pedido `2000017932329400`, `return_id: 162379059`) pra testar uma 2ª hipótese: será que o `"return_from_triage"` não é um `shipment_id` novo, e sim a MESMA devolução ganhando um status/substatus a mais, tempo depois da entrega.

- **Mesmo padrão de fechamento automático confirmado de novo**: `date_closed: 2026-08-19T22:48:40.274-04:00` bate quase ao segundo com o `last_updated` da devolução (`2026-08-20T02:48:38.892+00:00` UTC = mesma hora em -04:00) — reforça o achado anterior (caso Dionifer) de que review + fechamento + reembolso acontecem juntos, automaticamente.
- **`shipment_id` da devolução**: `47790497902`, destino `warehouse` em Cajamar-SP (centro logístico do Mercado Livre) — mas SEM a tag `"triage"` explícita nos `types` do endereço (diferente do caso Dionifer, que tinha `["logistic_center_BRPR01", "warehouse", "triage"]`) — pode ser só uma diferença de como esse centro específico nomeia o endereço, ainda não confirmado.
- **Histórico desse shipment (`investigar_shipment_history.py`) termina liso em `"delivered"`** (19/08/2026, 11:41:26) — nenhum evento novo apesar de já ter quase 1 mês. **Hipótese de "mesmo shipment ganha status novo depois" DESCARTADA** — mesmo padrão do caso Dionifer (unsaleable), que também parou em `delivered` sem nenhuma atualização posterior.
- **3 hipóteses já testadas e descartadas pro `return_from_triage`**: claim escondido, condição do produto, continuação do mesmo shipment. **Hipótese nova, ainda não testada**: talvez só exista pra devolução de venda Full de verdade (`fulfilled: true` no pedido) — nenhum dos 8 candidatos de triagem testados até agora teve esse campo checado. O script `escanear_candidatos_triagem.py` foi atualizado pra checar `fulfilled` automaticamente em cada candidato; ainda não rodado.

## Conclusão — O Código Bipável Provavelmente é Controle Interno Mercado Livre ↔ Transportadora (17/09/2026)

Depois de testar o código de 11 dígitos do QR/código de barras (tag `"t":"lm"`) contra toda superfície de API acessível ao vendedor — pedido, envio, histórico de envio, reclamação, devolução, review de devolução — sem nunca encontrar esse valor em lugar nenhum, Matheus trouxe um argumento operacional que fecha a explicação mais provável.

- **Relato de Matheus sobre o fluxo real de expedição**: depois de imprimir a etiqueta e preparar o pacote, o motorista/responsável da agência bipa as etiquetas pacote a pacote pra gerar o romaneio de coleta, e ainda precisa escanear um QR code que aparece no app e inserir um código pra confirmar a quantidade de pacotes enviados — só depois disso a tela de vendas do ML atualiza pra "pedido enviado". No recebimento de uma devolução, o mesmo tipo de confirmação (escanear QR + inserir código + confirmar quantidade) acontece de novo.
- **Ele nunca viu ninguém bipar o pacote além de quem faz a coleta** — reforça que esse código serve só pro processo de coleta/reconciliação entre o Mercado Livre e a transportadora (ou o motorista), não pro vendedor.
- **Conclusão adotada**: o código de 11 dígitos (QR/código de barras), o "Ref. ID" (formato `1228356601-1`, etiqueta via Correios) e o "ID do triage Item" (etiqueta amarela Full) são, com alta probabilidade, identificadores de controle interno do sistema de coleta/romaneio da Meli (e/ou da transportadora) — gerados e consumidos inteiramente fora da API pública de vendedor, e por isso não encontrados em nenhuma chamada testada. Não é uma certeza 100% provada (não temos acesso a esse sistema interno pra confirmar de fato), mas é a explicação mais consistente com toda a evidência levantada: ausência sistemática em toda superfície testada + relato operacional real de quem já trabalhou na devolução.
- **Decisão**: encerrar a investigação desses 3 códigos via API. A linha de investigação do `return_from_triage` (motivada por tentar decifrar o "ID do triage Item") também é encerrada aqui, sem solução final — ver as hipóteses já testadas e descartadas/inconclusivas nas seções anteriores.

## Decisão — Foco nos Campos de Fácil Identificação Já Visíveis na Etiqueta (17/09/2026)

Em vez de depender de decifrar um código proprietário, o caminho prático adotado é usar os campos que já aparecem de forma legível na etiqueta, na ordem de confiabilidade que a responsável pela devolução já usa/vai usar pra pesquisar no sistema:

1. **Número do pedido** (formato "2000...") — o melhor de todos, já confirmado (2x) como campo idêntico ao "Pedido" do relatório.
2. **Número da Nota Fiscal** — confiável quando presente, mas nem sempre vem impresso na etiqueta.
3. **Nome do cliente** — já ajuda a localizar o cliente e depois filtrar as devoluções dele.
4. **Endereço do cliente** — pior opção, só como último recurso.

- **Novo candidato encontrado (ainda não confirmado)**: numa nova foto da etiqueta do Rafael Ramos Machado, aparece um código curto ao lado do nome do cliente — `#443851581` — que pode ser o ID do comprador no Mercado Livre (`buyer.id`, campo que já sabemos existir na resposta de `GET /orders/$ORDER_ID`). Se confirmado, seria um campo curto e útil pra busca — ainda não testado contra a API.

## Confirmado — Código do Lado do Nome é o buyer.id do Cliente, Só em Etiquetas de Venda Comum (17/09/2026, tarde)

Testado o candidato que estava em aberto desde a etapa anterior: o código `#443851581`, visto ao lado do nome do cliente na etiqueta do Rafael Ramos Machado.

- **Teste 1 — `GET /users/443851581`** (endpoint público de perfil): voltou um perfil real e ativo — `nickname: "RAPHA048"`, `user_type: "normal"`, `seller_reputation.transactions.total: 0` (nunca vendeu, é comprador comum), `status.site_status: "active"`. Confirma que é um `user_id` real existente, e o apelido lembra "Rafael" — indício, mas não prova.
- **Teste 2 — `GET /orders/search?seller=<próprio>&buyer=443851581`**: o filtro `buyer` funcionou de verdade e devolveu exatamente **2 pedidos** desse comprador pra conta MB: `2000018113512820` e `2000017939871998`.
- **Confirmação definitiva — correspondência exata com os Relatórios de Devolução reais do próprio sistema**: os 2 números batem, dígito a dígito, com os 2 Relatórios de Devolução já emitidos pelo sistema pra Rafael Ramos Machado (NF 41.220, pedido `2000018113512820`, destino "Troca"; NF 40.812, pedido `2000017939871998`, destino "Venda como usado"). Pedido é chave única — essa correspondência fecha a confirmação, sem depender de nenhum outro dado.
- **Ressalva sobre endereço, corrigida em conversa**: os endereços de entrega desses 2 pedidos (São Bento do Sul-SC) NÃO batem com o endereço da etiqueta original (Araucária-PR) — isso não invalida a identificação, porque endereço de entrega é dado da transação (pode mudar pedido a pedido), não da conta do comprador. O dado que prova identidade é o pedido, não o endereço.
- **Escopo confirmado — só etiquetas de venda comum**: esse código NÃO aparece nas etiquetas Full (nem a branca, nem a amarela de triagem). Pra Full, nada muda — continua 100% dependente de achar a etiqueta amarela com o número do pedido, sem esse atalho.

### Ideia nova, ainda em Idealizar (não planejada)

Com o `buyer.id` confirmado como utilizável, Matheus propôs um fluxo novo pra etiquetas de venda comum: **buyer.id → lista todos os pedidos do cliente (já funciona, testado) → ordena por data → classifica cada pedido por tipo (sem problema / com reclamação / com devolução)**. A classificação por tipo reaproveitaria a mesma lógica que `view_consultar_pedido` já usa hoje pra 1 pedido conhecido (`claims/search?order_id=`) — só rodando em loop pra cada pedido da lista, em vez de 1 só. Ainda não entrou em Planejar.

## Validado em Console — Fluxo dos 3 Passos Testado e Batido Contra 14 Casos Reais de Devolução (17/09/2026, noite)

Com o `buyer.id` confirmado como utilizável, o fluxo dos 3 passos proposto na seção anterior foi implementado de fato em script e testado contra casos reais, ainda só no console (decisão explícita: "não vamos pensar em tela ainda").

- **Script principal criado**: `consultar_pedidos_por_cliente.py` — recebe `buyer_id`, busca todos os pedidos do cliente via `/orders/search?buyer=`, ordena por data e classifica cada um reaproveitando a mesma lógica de classificação que `view_consultar_pedido` já usa hoje (existência de claim + devolução) — sem problema / com reclamação / com devolução.
- **Script auxiliar criado**: `descobrir_buyer_id_do_pedido.py` — descobre o `buyer.id` a partir de um número de pedido já conhecido (via `GET /orders/{id}`), útil quando não se tem a etiqueta/código, só o número do pedido.
- **Validado isoladamente em 3 clientes antes do lote**: Rafael Ramos Machado (buyer_id `443851581`, 2 pedidos), Tancredo Gonçalves Pereira e Cristina Felipe de Sousa (buyer_id de ambos descoberto a partir de pedidos já conhecidos) — todos os pedidos batendo corretamente como "Com devolução".
- **Validação em lote** (`validar_lote_devolucoes_conhecidas.py`) rodada contra os 14 relatórios de devolução reais que Matheus tinha em mãos (Nº, Nome, Pedido, Empresa): **13 de 14 bateram direto**, 100% classificados corretamente como "Com devolução".
- **Mismatch de nome no meio do lote (cliente "Antonio", item 10) não é falha da lógica**: Matheus explicou que pode ser compra feita na conta de um familiar, ou o recurso "Colar do ERP" trazendo um nome cadastrado diferente do nome real no ML — reforça que o dado que importa pra essa validação é o número do pedido bater com o produto, não o nome do comprador.
- **1 exceção real (Claudia, pedido informado `2000014649100973`)**: `GET /orders/{id}` retornou 404 (`order_not_found`) mesmo com o número certo — confirmado contra a foto do relatório físico dela (venda Full, NF 1009135).
- **Hipótese testada e confirmada — o número era um Pack ID, não um Pedido**: testado o endpoint `GET /packs/{id}` (nunca usado antes nesta investigação) contra esse mesmo número — respondeu com sucesso, revelando o pedido real dentro do pack (`2000018056884044`) e o `buyer.id` da Claudia direto (`660401682`), sem precisar de mais nenhuma chamada.
- **Esse achado é a prova prática mais forte do valor da ideia**: é exatamente a ambiguidade "número do pacote vs número do pedido" (a mesma preocupação levantada antes de rodar o lote, sobre o risco de a ideia virar algo redundante) que motivou criar esse caminho via buyer.id — e ele não sofre dessa ambiguidade, porque sempre resolve pra pedidos individuais reais.
- **Detalhe lateral, não bloqueante**: o pack da Claudia voltou com `status: "cancelled"` e `status_detail: "mediation"` — primeira vez vendo status nesse nível (do pack, não do pedido); registrado só como observação, sem necessidade de investigar agora.
- **Resultado consolidado: 14 de 14 casos reais explicados** (13 diretos + 1 via pack). A ideia dos 3 passos está validada em console; a integração na tela real do Django ainda não entrou em Planejar.

## Confirmado na Prática — Pedido da Claudia Roda e Bate, Pack ID Aparece Mesmo em Venda Full (17/09/2026, noite)

- Rodado `consultar_pedidos_por_cliente.py --empresa MB --buyer-id 660401682` (buyer.id da Claudia, descoberto via `/packs/{id}` na etapa anterior) — confirmou na prática, e não só por inferência, que o pedido real `2000018056884044` existe, está corretamente classificado como "Com devolução", e o item retornado (Pulverizador Elétrico Costal Brudden SS20B 20L) bate com o relatório físico da Claudia (venda Full, NF 1009135).
- **Achado extra, não previsto**: a própria tabela de resultado trouxe a coluna `Pack ID` desse pedido = `2000014649100973` — exatamente o número que estava impresso como "Pedido" no relatório da Claudia, e que tinha dado 404 ao ser consultado como pedido.
- **Nuance nova pro entendimento de etiqueta Full**: até aqui (caso Dionifer), "ID do pedido" numa etiqueta amarela de Full sempre bateu, sem ambiguidade, com o número do pedido real. O caso da Claudia mostra que isso não é garantido sempre — nessa instância real, o número que foi pro relatório de uma venda Full acabou sendo o `pack_id`, não o `order_id`. Ainda não se sabe se a causa foi etiqueta impressa errada, leitura equivocada na hora de gerar o relatório, ou o "Colar do ERP" trazendo o campo errado.
- **Reforça o valor prático da ideia**: mesmo em um caso Full, onde a etiqueta amarela deveria bastar, o caminho buyer.id → pack → pedido real foi o que resolveu a devolução da Claudia — a ambiguidade pacote-vs-pedido não é exclusiva de venda comum.
- **Resultado final, confirmado ponta a ponta**: 14 de 14 casos reais de devolução explicados e validados na prática (13 diretos + 1 via pack, agora com o pedido real também testado e batendo).

## Em aberto

- [x] Confirmar quais códigos aparecem numa etiqueta real (foto) e o que cada um representa — feito em 16/09/2026, ver seção "Achados da Etapa 1" abaixo
- [x] Achar/ler a documentação oficial do Mercado Livre sobre Envios/Etiquetas — feito em 16/09/2026, ver "Achados da Documentação Oficial do Mercado Livre"
- [x] Cruzar os códigos da etiqueta com os campos já retornados pela API pra um pedido conhecido — feito em 16/09/2026 com o pedido 2000017788033354, ver "Achados via API Real" (revelou o `logistic.type "melinet"`, não documentado, mas não testou Ref. ID nem triagem porque esse caso não foi via Correios nem Full)
- [ ] Descobrir o que o `id` de 11 dígitos (tipo `lm`) representa de fato pra API do Mercado Livre — **investigação encerrada em 17/09/2026** sem solução via API: ausência sistemática desse valor em toda superfície testada, combinada com o relato operacional de Matheus (só quem coleta o pacote bipa), aponta pra ser controle interno Mercado Livre↔transportadora, fora do alcance da API de vendedor — ver "Conclusão — O Código Bipável Provavelmente é Controle Interno"
- [x] Confirmar se "Venda" é o mesmo campo que "Pedido" — confirmado com prova digit-a-digit em 16/09/2026, ver "Achados da Etapa 2"
- [x] Confirmar se "ID do pedido" da etiqueta amarela (Full) é o mesmo campo que "Pedido" — confirmado em 16/09/2026 via busca real na plataforma (não só leitura visual), ver "Achados da Etapa 2 (continuação)"
- [ ] Confirmar a qual pedido o Ref. ID (Correios, `1228356601-1`) corresponde de fato — a categoria `logistic_type: drop_off` = Correios já está CONFIRMADA via API (17/09/2026, caso Dionifer), mas essa etiqueta específica ainda não bateu com nenhum pedido conhecido (nem Rafael nem Dionifer usam esse tracking); **investigação encerrada em 17/09/2026** pelo mesmo motivo do código de 11 dígitos — provável controle interno de coleta, fora da API de vendedor
- [x] Confirmar a quais pedidos o Pack ID (`2000014703695937`) agrupa — confirmado em 17/09/2026: agrupa (pelo menos) o pedido `2000018113512820` (Rafael/Troca), com prova real via API (`pack_id` retornado + tag `pack_order`), ver "Achados via API Real — Pack ID, Correios/drop_off e Triagem Confirmados"
- [ ] Descobrir o que o "ID do triage Item" representa de fato pra API do Mercado Livre — **investigação encerrada em 17/09/2026** sem solução: toda a linha de investigação do `return_from_triage` (motivada por tentar decifrar esse campo) foi testada a fundo sem nunca encontrar esse identificador em nenhuma chamada de API; mesma conclusão do código de 11 dígitos — provável controle interno de triagem/coleta, fora do alcance da API de vendedor
- [ ] Confirmar se essa etiqueta amarela é o único formato usado em devoluções de itens vendidos via Full, ou se existem variações
- [ ] Descobrir o que decide qual `logistic.type` uma devolução direta ao vendedor (sem triagem) recebe — já vimos 2 valores diferentes pro mesmo cenário (`melinet` no caso do Edgar, `xd_drop_off` no caso do Rafael), nenhum documentado oficialmente pra devolução
- [ ] Descobrir por que o `"return_from_triage"` nunca apareceu no endpoint de devolução, mesmo no caso do Dionifer (confirmado como indo pra um centro de triagem via a tag `"triage"` no endereço) — 3 hipóteses já testadas e descartadas: "claim escondido" (17/09, só existe 1 claim), reteste do mesmo caso 1 mês depois sem mudança nenhuma, e "condição do produto decide" (17/09, escaneamento em lote de 8 casos reais — ver "Achados via API Real — Escaneamento em Lote"); **linha de investigação encerrada em 17/09/2026** — a motivação original (decifrar o "ID do triage Item") foi abandonada, ver "Conclusão — O Código Bipável Provavelmente é Controle Interno"
- [x] Testar a hipótese revisada do `return_from_triage` contra um caso cuja review tenha `product_condition` diferente de `unsaleable` — testado em 17/09/2026 com um escaneamento de 8 casos reais (3 unsaleable, 5 saleable): hipótese DESCARTADA, nenhum dos 8 gerou 2º shipment, `product_condition` não é o que decide — ver "Achados via API Real — Escaneamento em Lote Descarta a Hipótese da Condição do Produto"
- [ ] Descobrir se o `"return_from_triage"` é exclusivo de devoluções de venda Full de verdade (`fulfilled: true` no nível do pedido) — rodagem de 17/09/2026 achou só 2 casos Full no lote testado, nenhum com devolução associada; **deprioritizado em 17/09/2026** junto com o resto da linha do `return_from_triage`, sem solução
- [ ] Confirmar se a "revisão do vendedor" (`seller_status: pending`, só aparece quando `product_condition: unsaleable`) é de fato uma ação de contestação (`return_review_fail`) e não uma etapa que bloqueia algum processo — hipótese ainda não testada diretamente; **deprioritizado em 17/09/2026** junto com o resto da linha do `return_from_triage`
- [x] Confirmar se o código ao lado do nome do cliente na etiqueta (ex: `#443851581`, foto do Rafael Ramos Machado) corresponde ao `buyer.id` do pedido via API — **confirmado em 17/09/2026 à tarde**, via `GET /users/{id}` + `GET /orders/search?buyer=` cruzado digit-a-digit com Relatórios de Devolução reais, ver "Confirmado — Código do Lado do Nome é o buyer.id do Cliente". Só vale pra etiquetas de venda comum, Full não tem esse código.
- [x] Idealizar o fluxo novo: buyer.id → lista pedidos do cliente → ordena por data → classifica por tipo (sem problema / reclamação / devolução) — proposto em 17/09/2026, **validado em console no mesmo dia** com script real (`consultar_pedidos_por_cliente.py`) contra 14 casos reais de devolução (13 direto + 1 via Pack ID), ver "Validado em Console". Falta Planejar a integração na tela real do Django.
- [x] Descobrir por que um número de "Pedido" registrado num relatório pode dar 404 em `GET /orders/{id}` mesmo estando certo — confirmado em 17/09/2026: pode ser um Pack ID (agrupador de carrinho) em vez de um pedido individual; resolvido testando `GET /packs/{id}`, que revela o(s) pedido(s) real(is) dentro do pack. Caso real: Claudia, pack `2000014649100973` → pedido real `2000018056884044`, buyer.id `660401682`.
- [ ] Planejar a integração do fluxo buyer.id → lista pedidos → classifica por tipo na tela real do Django (Consultar Pedido ou tela nova) — bloqueado por decisão explícita de Matheus (17/09/2026): seguir só no console por enquanto, sem pensar em tela ainda.
- [ ] Investigar a causa de o número impresso como "Pedido" no relatório da Claudia ser, na verdade, o Pack ID (etiqueta impressa errada, leitura equivocada na hora de gerar o relatório, ou "Colar do ERP" trazendo o campo errado) — observado em 17/09/2026, caso isolado até agora, sem prioridade definida.

## Relacionado

- [[De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]]
- [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]]
