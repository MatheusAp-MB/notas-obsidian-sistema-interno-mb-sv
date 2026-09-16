---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_andamento
criado: 16/09/2026
atualizado_em: 16/09/2026 01:03
relacionado: [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]], [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
resumo: Mockup da tela "Consultar Pedido" (Hub de Consulta) comparado campo a campo contra os dados já confirmados via API e via o mapeamento das 5 telas do ML; atalhos "Abrir no Mercado Livre" resolvidos sem precisar de dado novo; marca/foto do produto e texto literal do motivo (via claims/messages) adiados por decisão de escopo (16/09/2026).
---

# Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca/Foto e Motivo Literal Adiados

Mockup recebido da tela "Consultar Pedido" (`Main.dc.html`, Hub de Consulta) e comparado campo a campo contra o que já temos confirmado: o retorno real da API (via `consultar_linha_tempo_devolucao.py`) e o mapeamento das 5 telas do Mercado Livre em [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]].

## Atalhos "Abrir no Mercado Livre" — resolvidos sem dado novo

Os 3 links usam os padrões de URL já mapeados nas Telas 01-03, aplicados diretamente com `ORDER_ID` e o `claim.get("id")` que o script já busca:

- **Ver pedido**: `https://www.mercadolivre.com.br/vendas/{pedido}/detalhe`
- **Ver reclamação**: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/reclamacao/{id_reclamacao}`
- **Ver mediação**: `https://www.mercadolivre.com.br/vendas/novo/mensagens/{pedido}/mediacao/{id_mediacao}`

`{id_reclamacao}` e `{id_mediacao}` são o mesmo valor — reclamação e mediação compartilham o mesmo `claim_id`/`entityId` (já confirmado no mapeamento das 5 telas). Nenhuma chamada de API nova é necessária.

## Decisões de escopo (16/09/2026)

- **Marca e foto do produto**: adiadas — não fazem parte da versão atual da tela. Se algum dia forem necessárias, exigem chamar `GET /items/{item_id}` separadamente (não é dado presente em `order_items`).
- **Motivo da devolução — texto literal do cliente**: adiado. A tela hoje usaria só a categoria (`reason_id` → "Produto defeituoso"/"Pago e não recebido"), não a frase literal do comprador. O texto literal existe dentro de `claims/messages` (mesmo endpoint já usado pra achar a data de abertura da mediação), mas o campo de conteúdo da mensagem ainda não foi investigado/confirmado — fica pra depois.

## Status resultante

Com essas 2 decisões, a tela "Consultar Pedido" está pronta pra ser montada com dado real em quase tudo: resumo do pedido (nome, nickname, data da compra, badge de mediação), os 3 atalhos pro Mercado Livre, produto (nome + quantidade) e a linha do tempo completa (Compra → Entrega → Reclamação aberta → Mediação aberta → Devolução física recebida → Mediação fechada). O único bloco pendente é o motivo literal, que fica condicionado à investigação futura de `claims/messages`.

## Em aberto

- [ ] Investigar o campo de conteúdo das mensagens em `claims/messages` pra extrair o texto literal do motivo da devolução
- [ ] Se algum dia for necessário: investigar `GET /items/{item_id}` pra marca e foto do produto

## Relacionado

- [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]]
- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
