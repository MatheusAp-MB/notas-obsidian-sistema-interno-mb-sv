---
tipo: decisao
dominio: 
status: ativa
criado: 10/10/2026
atualizado_em: 10/10/2026 20:04
relacionado: [Endpoint de Operacoes do Full Falha com 429 e 404 de Scroll Mesmo com 1 SKU, Checkpoint - Historico de Vendas e Calendario de Vendas, Campo stock node_id do Pedido Separa Venda do Full de Venda Fora do Full, Niveis de Granularidade do Full e Como os Dados se Ligam]
resumo: "Decisão de Matheus em 10/10/2026 de não usar mais o endpoint de operações do Full (GET /stock/fulfillment/operations/search) para o histórico de vendas: falha com 429 já com 1 SKU e a necessidade é rodar para mais de mil SKUs; o caminho passa a ser o /orders/search, e o código antigo fica preservado e comentado."
---

# Abandonar o Endpoint de Operações do Full para o Histórico de Vendas

## Resumo

Em 10/10/2026, depois de ver as 3 rodadas reais do coletor, Matheus decidiu **não usar mais** o endpoint `GET /stock/fulfillment/operations/search` como fonte do histórico de vendas. Motivo dito por ele: ele já dá problema com **1 SKU** e a necessidade é rodar para **mais de mil** — "sem condições de usar esse endpoint". O histórico de vendas (e o calendário de vendas) passa a ser pensado em cima do `/orders/search`. **Nada do código antigo foi apagado**: ele fica no projeto, com comentário explícito dos problemas, para não perder o que foi aprendido.

> [!success] Status: ativa (decisão do usuário, 10/10/2026)
> Valendo. Os fatos que embasam a decisão estão em [[Endpoint de Operacoes do Full Falha com 429 e 404 de Scroll Mesmo com 1 SKU]]. O que falta para o caminho novo está em [[Checkpoint - Historico de Vendas e Calendario de Vendas]].

## Contexto

O objetivo da frente (aberta em 10/10/2026) é acompanhar o ritmo de vendas de cada produto (1 SKU = 1 produto, somando todos os seus MLBs e Códigos ML), para depois prever ruptura de estoque e pedidos de compra. O primeiro caminho tentado foi o endpoint de **operações de estoque do Full**, porque ele entrega muitas operações por chamada e separa Full de fora do Full sem chamar `/shipments` por pedido. Foram feitos 3 passos em cima dele: investigação (Passo 2), tabelas no banco (Passo 3, migração `0035`) e coletor API → banco (Passo 4, com o comando manual `coletar_operacoes_full`).

## A decisão a tomar

Com o endpoint respondendo 429 em 34 de 51 tentativas nas rodadas reais (e em 8 de 25 na sondagem) — **com apenas 3 Códigos ML** —, continuar com ele serve para um SKU, mas e para mais de mil?

## O que levou à decisão

| Caminho | O que seria | Por que foi descartado ou escolhido |
|---|---|---|
| **A. Continuar e melhorar o coletor** | Contagem regressiva na espera de 60 s; pular a releitura dos 7 dias recentes; dividir a janela por data para evitar scroll; salvar por chamada; testar mais Códigos por chamada e omitir `type` | **Descartado.** Nenhuma dessas melhorias ataca o 429, que vem do lado do ML e não mudou com peso da chamada nem com espaçamento. Nenhuma delas foi aplicada; nenhuma tem prova de reduzir o erro. E em mais de mil SKUs o problema só cresce |
| **B. Pedir aumento de cota ao Mercado Livre** | A página oficial indica a "equipe de integrações comerciais", com evidência de uso | **Descartado por ora.** Matheus não consegue falar com o Mercado Livre agora: tudo precisa ficar "dentro do que a API permite". Se um dia houver contato, a nota de descoberta serve de evidência |
| **C. Usar o `/orders/search`** | Buscar os pedidos da conta por janela de datas (50 por página), cada pedido já com MLB, `seller_sku`, quantidade e data | **Escolhido.** O número de chamadas depende do número de pedidos, não de SKUs; pela página oficial, o limite é por endpoint (cota própria); as 10 chamadas a ele feitas em 10/10/2026 não deram nenhum 429 |

**Ilustração de escala (conta aproximada, não é medição):** 1 SKU com 3 Códigos e 90 dias custou 14 páginas pedidas, 37 tentativas e 1 min 40 s. Repetir isso, em fila, para 1000 SKUs seriam cerca de 28 horas **se nada falhasse** — e a taxa de 429 observada indica que falharia. Ficam fora da conta, por nunca terem sido medidos, o máximo de Códigos por chamada e o efeito de omitir `type`.

## Decisão

1. **Não usar** `/stock/fulfillment/operations/search` para o histórico de vendas.
2. **Usar o `/orders/search`** como fonte, primeiro medindo com um script de exploração só de leitura (volume de pedidos, páginas, 429, campos disponíveis).
3. **Preservar** o código do endpoint antigo, com bloco de comentário explícito sobre os problemas, sem apagar nada (pedido do Matheus: "não quero perder essas informações").
4. **Não apagar nem alterar** as tabelas do Passo 3 (`OperacaoFullMercadoLivre`, `CoberturaOperacaoFullMercadoLivre`, migração `0035`) agora. O destino delas é decidido depois que o teste do `/orders/search` responder as perguntas abertas.

## O que muda e o que fica

- **Fica no projeto:** `api_mercado_livre/full_ml.py`, o coletor, o comando `coletar_operacoes_full`, os modelos e os scripts de exploração (lista completa na nota de descoberta).
- **Não é afetado por esta decisão:** o uso do mesmo endpoint para descobrir, no recebimento de um envio, se o `inbound_id` da operação `INBOUND_RECEPTION` é o número do envio (pendência da nota [[Niveis de Granularidade do Full e Como os Dados se Ligam]]). Só vale lembrar que o endpoint mostrou instabilidade, então essa conferência pode esbarrar nos mesmos 429.
- **O que se perde:** o pareamento pronto da venda com o cancelamento por `shipment_id` + Código (61 de 62 pareados) e a separação Full × fora do Full que a operação já trazia. Isso precisa ser recuperado de outro jeito — ver [[Campo stock node_id do Pedido Separa Venda do Full de Venda Fora do Full]].

## Próximo passo

Montar o script de exploração do `/orders/search` (somente leitura, GET). Chamadas planejadas na conta MB: (1) pedidos de ontem, página 1, para ver campos e `paging.total`; (2) só a página 1 de 7, 30, 90, 180 e 360 dias, para ler o `paging.total`; (3) as demais páginas de ontem, para medir ritmo e 429; (4) `/shipments/{id}` de cerca de 20 pedidos de ontem, para comparar `logistic.type` com `stock.node_id`; (5) uma busca de ontem com `order.status=cancelled`. Sem dados de comprador nem seller_id nas saídas.

## Relacionado

- [[Endpoint de Operacoes do Full Falha com 429 e 404 de Scroll Mesmo com 1 SKU]] — os fatos medidos.
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]] — onde está o trabalho agora.
- [[Campo stock node_id do Pedido Separa Venda do Full de Venda Fora do Full]] — dúvida que decide a separação Full × fora do Full.
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]] — níveis do Full.
