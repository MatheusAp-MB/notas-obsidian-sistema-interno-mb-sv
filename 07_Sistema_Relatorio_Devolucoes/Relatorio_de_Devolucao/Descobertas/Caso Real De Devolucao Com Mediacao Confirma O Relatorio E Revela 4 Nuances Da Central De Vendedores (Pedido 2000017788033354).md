---
tipo: descoberta
dominio: python
status: confirmada
criado: 15/09/2026
atualizado_em: 15/09/2026 13:28
relacionado: [Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador, Processo de Devolução de Produtos e os 3 Caminhos Possíveis, Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica, Mensagens Da Reclamacao Confirmam sender_role Mediator E Revelam Gap De 17 Dias Na Resposta Do Vendedor]
---

# Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)

**Resumo**: o pedido `2000017788033354` (venda SV, Cadeira De Transferência Elevação Hidráulica) — devolução completa, com mediação, reembolso e nota humana registrada — foi usado como caso de teste real pra conferir o Relatório de Devolução do sistema contra a Central de Vendedores do Mercado Livre, e depois cruzado com a API do Mercado Livre direto. Quase todos os campos do relatório bateram nas 3 fontes; a exceção é a data de "Mediação Aberta em", que no relatório reflete quando a equipe começou a tratar o caso internamente, não a data real do lado do ML (achado 5, abaixo). A conferência revelou 4 nuances de como a Central de Vendedores apresenta a informação, mais 4 achados adicionais confirmados via API.

> [!success] Confirmada
> Caso mapeado por 3 fontes independentes (Central de Vendedores, relatório do sistema, API do Mercado Livre). 4 nuances de leitura da UI e mais 4 achados via API documentados abaixo — incluindo a correção de 1 campo do relatório ("Mediação Aberta em") cujo significado real não era o que parecia.

## Contexto

O Sistema de Relatório de Devoluções gera um PDF por devolução (ver [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]), reunindo dados de venda, reclamação, mediação e estado das peças devolvidas. Pra confirmar que esses dados realmente batem com o que aconteceu de verdade, o pedido `2000017788033354` (conta SV, cliente Edgar Augusto Batista) foi usado como caso de teste — comparando o PDF gerado pelo sistema, lado a lado, com a tela "Histórico da venda" e a aba financeira da Central de Vendedores.

## O problema

Os dados do relatório (datas de venda/recebimento/reclamação/devolução, motivo, valores de mediação e reembolso) batem com o que a Central de Vendedores mostra pra essa venda?

## O que levou à resposta

Comparando campo a campo o PDF (`Relatório de Devolução — Pedido 2000017788033354`) com o modal "Histórico da venda" e a aba financeira do ML:

| Dado | Relatório (sistema) | Central de Vendedores (real) | Bateu? |
|---|---|---|---|
| Venda | 06/08/2026 | 6 ago 11:21 hs | Sim |
| Recebido pelo cliente | 08/08/2026 | "Entregue" #47700447430, 8 de agosto (dentro do modal) | Sim |
| Reclamação aberta | 23/08/2026 | 23 de agosto, #5564889989 | Sim |
| Devolução recebida por vocês | 08/09/2026 | "Devolvido no seu endereço — 8 set. 11:59" (fora do modal) | Sim |
| Mediação finalizada | 14/09/2026 | Anotação interna "Reembolsado - ana", 14 de setembro 18:07 | Sim |
| Peças com defeito na volta | Assentos riscado; peça inferior riscada e suja; kit parafusos sem manual | Anotação interna "Recebido - Ana 10/09 - Produto retornou com marcas - riscado e sujo" | Sim (mesma natureza do dano) |

Todos os dados bateram — mas só depois de resolver 4 pontos onde a Central de Vendedores, sozinha, é enganosa ou ambígua de ler:

**1. A "Mediação" no modal não tem data própria.** No modal "Histórico da venda", o bloco "Mediação" aparece embaixo do bloco "Reclamação", agrupado sob o mesmo cabeçalho de data — nesse caso, `23 de agosto`. Mas pelo relatório (e batendo com a anotação interna), a mediação de verdade só **abriu em 10/09/2026 e fechou em 14/09/2026**, quase 3 semanas depois. O modal não trás timestamp próprio pro bloco de Mediação — quem só olha o modal, sem abrir "Ver mediação encerrada" ou sem ter o relatório, lê a data errada.

**2. O motivo do caso muda de texto em 3 lugares.** Resumo da Reclamação no modal: "O comprador disse que chegou em boas condições, mas o comprador não quer mais o produto" (soa como arrependimento). Resumo da Mediação no modal: "Fomos informados que o produto chegou avariado" (já é avaria). Texto literal do cliente, capturado pelo relatório: "a cama não é compatível com a cama da minha vó... abertura do aparelho não cabe" (incompatibilidade de uso). Nenhum resumo condensado do ML sozinho conta a história real — só o texto literal do cliente bate com o motivo de fato.

**3. Dois valores de reembolso, direções opostas.** A aba financeira mostra `Cancelamentos: -R$ 1.184,07`, que zera o saldo da venda — é o estorno da venda em si (produto + tarifas), porque o cliente devolveu: vocês deixam de receber. O relatório mostra `Valor reembolsado (mediação): R$ 500,00` — uma compensação **separada**, do ML **pra vocês**, pelo produto ter voltado danificado (o selo "Venda como Usado" no topo do relatório confirma o motivo: o produto não pode mais ser revendido como novo). Não é a mesma coisa contada 2 vezes — são 2 fluxos de dinheiro, em direções opostas, que só coincidem por estarem na mesma venda.

**4. O modal mistura 2 entregas diferentes sob o mesmo rótulo "Entregue".** Dentro do modal, "Entregue #47700447430, 8 de agosto" é a entrega **original** ao cliente. "Devolvido no seu endereço — 8 set. 11:59" — a devolução física chegando de volta a vocês — aparece em **outro lugar da página**, fora do modal. Sem saber que são 2 shipments diferentes, com o mesmo verbo "entregue"/"devolvido", dá pra confundir as 2 datas.

## Confirmação via API (15/09/2026)

Rodando `consultar_linha_tempo_devolucao.py --candidato=2000017788033354` (conta SV, primeira vez que o script foi testado fora da conta MB — funcionou, com renovação automática de token), a API confirmou de novo as 5 datas principais (compra, entrega ao cliente, reclamação, devolução física chegando, mediação finalizada) exatas, até o minuto — mas trouxe 4 achados novos:

**5. "Mediação Aberta em 10/09" no relatório não é a data real da disputa no ML — é quando a equipe começou a tratar internamente.** A API, via `claims/{id}/messages`, achou a 1ª mensagem com `stage=dispute` em **24/08/2026 16:02** — quase 3 semanas antes do "10/09/2026" que o relatório mostra como "Mediação Aberta em". O "10/09" bate, quase ao minuto, com a anotação interna "Recebido - Ana 10/09 - Produto retornou com marcas" — ou seja, o campo do relatório provavelmente reflete a data em que alguém da equipe recebeu/registrou o produto danificado e começou a tratar o caso, não a data em que a disputa de fato começou do lado do Mercado Livre. A "Mediação Finalizada em 14/09" continua batendo certo com a API (`claims/{id}/returns → date_closed`: 14/09/2026 13:48).

**6. 1ª exceção real ao padrão "resolution.reason determina devolução física".** A resolução desse claim veio `{'reason': 'coverage_decision', 'benefited': ['complainant'], 'closed_by': 'mediator', 'applied_coverage': True}` — mas o caso **tem** devolução física real (postado 02/09, entregue 08/09, `claims/{id}/returns` com `status: delivered`). Isso quebra o padrão "sem exceção" que tínhamos com 8 casos da conta MB — ver [[Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]], atualizada com essa exceção.

**7. `claims/{id}/messages` funciona pra achar a data real de abertura da disputa — 1ª confirmação positiva.** Nos 12 candidatos MB testados antes, esse campo sempre vinha "não encontrada nas mensagens (mapeamento não confirmado)". Aqui veio certo (24/08/2026 16:02, achado 5). Ainda não sabemos por que falhava nos casos MB.

**8. Esse caso não teve "ordem invertida".** A mediação fechou (14/09 13:48) **6 dias depois** da devolução física já ter chegado (08/09 11:59) — ordem normal, dando tempo pra inspeção (bate com a anotação "Recebido - Ana 10/09"). Contrasta com os 4 casos MB de ordem invertida já documentados em [[Reclamacao Fecha Antes Da Devolucao Fisica Terminar (Ordem Invertida)]] — confirma que não é sempre invertida.

> [!question] Ponto em aberto
> `claims/{id}/returns → status_money` veio `retained`, não `refunded` — mas os R$500 da mediação foram reembolsados pra vocês (não pro comprador), segundo confirmado com o usuário. Ainda não sabemos se `retained` aqui significa "retido com o comprador" ou outra coisa — esse campo nunca foi documentado no vault, só observado. Sem doc oficial ou mais exemplos, fica em aberto.

## Resposta

O Relatório de Devolução do sistema acerta praticamente todos os campos testados (5 datas principais, motivo, 2 valores de mediação/reembolso, estado das peças) — com 1 exceção real: o campo "Mediação Aberta em" não reflete a data em que a disputa de fato começou do lado do Mercado Livre (24/08, via API), e sim a data em que a equipe começou a tratar o caso internamente, ao receber o produto danificado (10/09). Vale renomear esse campo no sistema (algo como "Início do tratamento interno") ou trocar sua fonte de dado pra puxar da API (`claims/{id}/messages`, 1ª mensagem `stage=dispute`), se o objetivo for mostrar a data real da disputa. A Central de Vendedores do Mercado Livre sozinha, por sua vez, não é confiável de ler nesse tipo de caso complexo: omite a data real da mediação no modal, resume o motivo de formas diferentes em cada etapa, mistura 2 entregas físicas diferentes num único rótulo, e não deixa claro que o valor "cancelado" da venda e o valor "reembolsado" da mediação são 2 coisas separadas.

## Exemplo

Linha do tempo completa do caso, já com as 2 entregas separadas corretamente e a mediação com as 2 datas (interna vs. real via API):

| Evento | Data |
|---|---|
| Compra | 06/08/2026 |
| Cliente recebeu (entrega original) | 08/08/2026 |
| Reclamação aberta (`#5564889989`) | 23/08/2026 |
| Disputa/mediação aberta de verdade (API, `claims/{id}/messages`) | 24/08/2026 16:02 |
| Devolução física postada pelo cliente | 02/09/2026 |
| Devolução chega de volta a vocês | 08/09/2026 |
| "Mediação Aberta em" no relatório (= equipe recebeu/registrou o dano) | 10/09/2026 |
| Mediação finalizada + reembolso | 14/09/2026 |

Fluxo financeiro da venda, em 2 partes separadas:

| Linha | Valor | Direção |
|---|---|---|
| Cancelamentos (estorno da venda: produto + tarifas líquidas) | R$ 1.184,07 | Sai de vocês (venda desfeita) |
| Mediação — compensação por produto avariado | R$ 500,00 | Entra pra vocês (do ML) |

## Relacionado

- [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
- [[Campo resolution.reason Determina Se A Reclamacao Tem Devolucao Fisica]]
- [[Reclamacao Fecha Antes Da Devolucao Fisica Terminar (Ordem Invertida)]]
- [[Mensagens Da Reclamacao Confirmam sender_role Mediator E Revelam Gap De 17 Dias Na Resposta Do Vendedor]] — mesmo claim (`5564889989`), agora com a sequência completa de mensagens ML×vendedor
