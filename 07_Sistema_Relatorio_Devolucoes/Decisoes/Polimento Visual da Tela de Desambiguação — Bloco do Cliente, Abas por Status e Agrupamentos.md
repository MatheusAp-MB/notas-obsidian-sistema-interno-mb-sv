---
tipo: decisao
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluida
criado: 17/09/2026
atualizado_em: 17/09/2026 19:42
relacionado: [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]
resumo: Polimento visual da tela de desambiguação (Consultar Pedido, busca por ID do Cliente) — do print real (cliente 443851581, Rafael Ramos Machado) até implementação e validação. Bloco "ESSE CLIENTE" com nome real (1 chamada extra em /orders/{id}), rótulo explícito "Data da compra", abas por status (Sem problema/Com reclamação/Com devolução), chip Encerrada/Em andamento (dado já existente, sem custo extra de API), agrupamento por Pack em árvore explícita (dentro de cada aba de status) e ordenação clicável (reordena só o DOM, sem nova chamada à API). Descartados por decisão do usuário agrupamento por motivo da reclamação/devolução e por situação financeira. Implementado em views.py, _item_pedido_desambiguacao.html, consultar_pedido.html e layout_consultar_pedido.css. Validado contra o cliente real 443851581/Rafael Ramos Machado — os 2 pedidos aparecem como "Encerrado" (dado real). Idealizar, Executar e Validação concluídos.
---

# Polimento Visual da Tela de Desambiguação — Bloco do Cliente, Abas por Status e Agrupamentos

## Contexto

Depois de fechar a implementação e validação da tela "Consultar Pedido vira o centro do sistema" (ver [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]), Matheus trouxe um print real da tela em produção (cliente 443851581, Rafael Ramos Machado, 2 pedidos de "Pulverizador Costal Elétrico Kawashima Pet 200") pra iniciar uma rodada de polimento visual — explicitamente pedindo pra só idealizar, sem gerar código ainda.

## Idealizar — Frentes de melhoria identificadas na 1ª análise

A partir do print real, antes de qualquer decisão de conteúdo:

- Diferenciação visual entre os itens da lista — hoje o título do produto (irrelevante pra decisão quando os pedidos são do mesmo item) tem mais peso visual que a data e o número do pedido (o dado real de matching contra a etiqueta física)
- Comunicação de "isso é clicável" — hoje depende só do hover, sem pista visual no estado normal
- Badge "Com devolução" sem ícone — só texto na pílula
- Aproveitamento de espaço em telas largas
- Conexão visual fraca entre o card de busca e o card de resultado
- Consistência da iconografia geral (Font Awesome)

## Idealizar — Decisões de conteúdo

1. **Rótulo "Data da compra" explícito** — hoje a data aparece sem indicar o que é. Confirmado que é o campo `date_created` do pedido (mesmo campo já rotulado como `data_compra` na tela de detalhe de 1 pedido).

2. **Bloco "ESSE CLIENTE" no topo da lista**, antes de "TEM ESSES PEDIDOS" — Matheus autorizou adicionar chamadas extras à API se necessário, por considerar o bloco importante. (Na versão final, os rótulos "Esse cliente" e "Tem esses pedidos" foram removidos — eram só explicativos pra fase de idealização, não texto de UI real.)

3. **Abas por status**: Sem problema | Com reclamação | Com devolução — dado já existente hoje (`classificacao.codigo`, calculado por `_classificar_pedido_leve`), é só reorganização visual, zero dado novo.

4. **Agrupamentos aprovados** (Matheus): Encerrada vs Em andamento, Por Pack, Por data.

5. **Agrupamentos descartados** (Matheus, explicitamente): por motivo da reclamação/devolução e por situação financeira — "não precisa e nem é segurança o suficiente".

## Idealizar — Investigação técnica: de onde vêm os dados de cada agrupamento

- **Encerrada vs Em andamento**: de graça — `_classificar_pedido_leve()` já chama `/post-purchase/v2/claims/{id}/returns` pra decidir se tem devolução, mas descartava a resposta inteira depois de só checar truthiness. Essa mesma resposta já traz `date_closed` (usado na tela de detalhe pra `esta_encerrado`) — extraído sem nenhuma chamada nova.
- **Por Pack**: já é `pack_id`, hoje só usado pra agrupar visualmente (grupo-pack).
- **Por data**: já é `data_ordenacao` — na prática, é a ordenação (mais recente primeiro) que `_agrupar_e_ordenar_pedidos` já fazia, não uma estrutura de agrupamento visual separada.
- **Bloco do cliente — tentativa 1 (`/users/{id}`)**: testado via `investigar_usuario_por_id.py` contra o cliente real 443851581 — devolveu só `nickname` ("RAPHA048"), `id`, `country_id`, e `address.city`/`state` nulos. Sem nome completo.
- **Bloco do cliente — tentativa 2 (`/orders/search`)**: testado via `investigar_orders_search_por_data.py` — todos os `buyer` embutidos em cada resultado (~50 pedidos reais conferidos) só têm `id` e `nickname`, nunca `first_name`/`last_name`.
- **Bloco do cliente — solução confirmada (`/orders/{id}`)**: o print real da tela de detalhe mostrou "Rafael Ramos Machado · RAPHA048" — confirmando que a busca por 1 pedido específico (diferente da busca em lista) traz o nome completo do comprador.

## Idealizar — Solução validada: 1 chamada extra pra tela inteira, não por pedido

Como todo pedido retornado por uma busca `buyer=id_cliente` pertence ao mesmo comprador, a solução é: buscar a lista normal (`/orders/search`, como já é feito hoje), pegar qualquer 1 pedido dela, chamar `/orders/{id}` só nesse 1 pedido, e extrair os dados do comprador dali. Isso só é necessário no caminho que tem mais de 1 pedido (lista de desambiguação) — quando há só 1 pedido, o fluxo já cai direto no detalhe completo, que já busca esse dado de graça.

Validado com o script `scripts_exploracao_ML/testar_fluxo_bloco_cliente.py` (criado nesta investigação), rodado contra o cliente real 443851581/conta MB:

```
ESSE CLIENTE:
  Nome: Rafael Ramos Machado
  Nickname: RAPHA048
  ID: 443851581

TEM ESSES PEDIDOS:
  2000017939871998 | 14/08/2026 | Pulverizador Costal Elétrico Kawashima... | Pack —
  2000018113512820 | 25/08/2026 | Pulverizador Costal Elétrico Kawashima... | Pack 2000014703695937
```

Confirma exatamente o que a tela de produção já mostrava (mesmos 2 pedidos, mesmas datas, mesmo pack_id só no 2º pedido) mais o nome real do cliente, com 1 única chamada adicional.

## Idealizar — Mockup e ajuste do agrupamento por Pack

Depois da investigação técnica, um mockup HTML fiel ao visual real do sistema foi montado com todas as peças (bloco do cliente, abas, rótulo "Data da compra", chips Encerrada/Em andamento). Matheus aprovou tudo, exceto o tratamento do agrupamento por Pack — a versão inicial era só uma tag inline pequena, e ele pediu que virasse uma árvore explícita: uma caixa com cabeçalho "PACK <id>" e os pedidos daquele pack recuados/conectados visualmente por baixo. Redesenhado com uma caixa de cabeçalho sólido + linha de conexão (tronco + galho) por pedido, reaproveitando os nomes de classe já usados no CSS real (`grupo-pack`/`grupo-pack-cabecalho`). Como os 2 pedidos reais da Rafael não compartilham pack entre si (só 1 deles tem pack_id, sem par na lista dela), o mockup incluiu também um exemplo ilustrativo com dado fictício (Pack 1233243242, sugerido pelo próprio Matheus) só pra demonstrar a árvore funcionando, claramente rotulado como fictício.

## Executar — o que foi implementado

- **Bloco do cliente**: só no fluxo de busca por ID do Cliente (não no fluxo por Pack). Ao montar a lista de desambiguação (2+ pedidos), 1 chamada extra em `/orders/{id}` usando qualquer pedido da lista, extraindo `buyer.first_name`/`last_name`/`nickname`/`id`. Se a chamada falhar, a tela não quebra — mostra "Cliente {ID}" no lugar do nome, sem travar a lista de pedidos.
- **Abas por status**: Sem problema / Com reclamação / Com devolução, usando o `classificacao.codigo` que já existia. A aba ativa por padrão segue a prioridade: Com devolução → Com reclamação → Sem problema (a primeira que tiver pelo menos 1 pedido).
- **Chip Encerrada / Em andamento**: `_classificar_pedido_leve` passou a extrair `date_closed` da resposta de `/post-purchase/v2/claims/{id}/returns` que já buscava — zero chamada nova.
- **Agrupamento por Pack em árvore explícita**: caixa com cabeçalho "PACK {id}" e os pedidos daquele pack recuados dentro, conectados por uma linha (tronco + galho), substituindo a caixa tracejada antiga. Decisão técnica: o agrupamento acontece DENTRO de cada aba de status, não atravessa abas (só agrupa quem tem mesmo pack E mesmo status).
- **Ordenação clicável**: o indicador "Ordenar por: mais recentes primeiro" virou botão. Cada clique reordena só os elementos que já estão na tela (inverte a ordem no DOM, dentro de cada aba e dentro de cada bloco de Pack) — sem recarregar a página nem bater na API do ML de novo. Adicionado depois da 1ª rodada de validação, a partir de feedback do Matheus de que o indicador original não era clicável.
- Rótulo "Data da compra" explícito em cada item da lista.

Arquivos alterados: `integracao_mercado_livre/views.py`, `integracao_mercado_livre/templates/integracao_mercado_livre/_item_pedido_desambiguacao.html`, `integracao_mercado_livre/templates/integracao_mercado_livre/consultar_pedido.html`, `integracao_mercado_livre/static/integracao_mercado_livre/css/layout_consultar_pedido.css`.

## Validado contra tela real

Testado contra o cliente real 443851581 (Rafael Ramos Machado): bloco do cliente mostrou nome e nickname corretos, aba "Com devolução" veio ativa por padrão com contagem 2, os 2 pedidos vieram com "Data da compra" explícita, o pedido com pack_id mostrou a tag solta (correto — não tem outro pedido dele com esse pack nessa lista), e os dois pedidos apareceram como "Encerrado" — dado real, diferente do "Em andamento" que tinha sido chutado ilustrativamente no mockup pro 2º pedido. Botão de ordenação testado e funcionando.

## Em aberto

- [x] Planejar: layout definitivo do bloco "ESSE CLIENTE" e das abas por status
- [x] Planejar: onde entram os filtros de Pack/data (dentro de cada aba de status, não atravessa — ver Executar)
- [x] Executar
- [x] Validar contra tela real
