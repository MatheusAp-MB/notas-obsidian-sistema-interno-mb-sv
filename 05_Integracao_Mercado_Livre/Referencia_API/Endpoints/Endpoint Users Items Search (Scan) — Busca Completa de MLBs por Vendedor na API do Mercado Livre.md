---
tipo: conceito
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 23:55
relacionado: [Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre, Sistema de Atributos de Item na API do Mercado Livre, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Endpoint `GET /users/{user_id}/items/search` (modo `scan`) — Busca Completa de MLBs por Vendedor na API do Mercado Livre

> [!important] Qual é exatamente o endpoint desta nota — sem ambiguidade
> **Método e caminho exatos**: `GET /users/{user_id}/items/search`
> **Modo de uso coberto aqui**: com o parâmetro `search_type=scan` (paginação por `scroll_id`, sem limite de 1000 resultados).
> **É este, e só este, o endpoint que `integracao_mercado_livre/servicos/buscar_mlbs.py` chama de verdade** — a chamada real está na função `buscar_mlbs_varrida()`: `chamar_api("GET", f"/users/{user_id}/items/search", ..., params={"search_type": "scan", "status": ..., "logistic_type": ..., "listing_type_id": ..., "catalog_listing": ..., "scroll_id": ...})`.
>
> A doc de origem ("Busca de itens", última atualização 07/04/2025) fala de **vários** endpoints parecidos na mesma página — pra não haver confusão nenhuma, aqui está a lista completa de "vizinhos" que existem na doc, e por que **nenhum deles** é o assunto desta nota:
> - `GET /sites/{site_id}/search?seller_id=...` — busca pública nas listagens do site (só itens ativos). **Não é este.** Diferente do nosso, que busca a partir da própria conta.
> - `GET /items?ids=...` (multiget de itens, com ou sem `attributes=`) — **não é este**. Esse é o endpoint que `buscar_detalhes.py` usa; já tem nota própria, [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]].
> - `GET /users?ids=...` (multiget de usuários) — **não é este**, e não é usado por nenhum script do projeto hoje.
> - `GET /users/{user_id}/items/search/restrictions` — **não é este**, é um endpoint irmão, mencionado mais abaixo nesta nota só como conhecimento (não usado hoje).
> - `GET /users/{user_id}/items/search` **sem** `search_type=scan` (paginação normal, `limit`/`offset`, teto de 1000 resultados) — é o **mesmo caminho**, mas **modo diferente** do que está documentado aqui. Esta nota cobre só o modo `scan`, que é o modo que o projeto usa de verdade.

## O quê é esta nota, e por que ela fecha o par com a nota do `buscar_detalhes.py`

**O quê**: 2ª nota da camada de endpoint do estudo da API do Mercado Livre. Junto com [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]] (a 1ª, sobre `GET /items?ids=`), fecha o par de endpoints que sustenta os 2 primeiros scripts do pipeline de coleta: `buscar_mlbs.py` descobre **quais** MLBs existem (este endpoint), `buscar_detalhes.py` busca o **detalhe** de cada um (o outro endpoint).

**Fonte**: documentação oficial do Mercado Livre para desenvolvedores, página "Busca de itens" — última atualização em 07/04/2025.

## Por que `/users/{user_id}/items/search`, e não `/sites/{site_id}/search`

A doc explica que existem 2 formas de buscar item por vendedor, com uma diferença importante:

| Forma | O que devolve | Usada pelo projeto? |
|---|---|---|
| `GET /sites/{site_id}/search?seller_id=...` | Busca nas **listagens públicas** do site — segue a regra da plataforma, **sempre só itens ativos**. | Não. |
| `GET /users/{user_id}/items/search` | Busca **a partir da conta** do vendedor — traz item de **qualquer status**, não só ativo. | **Sim — é este o endpoint da nota.** |

> [!success] Confirmado: a escolha do endpoint bate com a necessidade real
> `buscar_mlbs.py` monta `STATUS_LIST = ["active", "paused", "closed", "under_review", "payment_required", "not_yet_active"]` — 6 status diferentes, incluindo vários que não são "ativo". Isso só é possível porque o projeto usa `/users/{user_id}/items/search` (que aceita qualquer status), não `/sites/{site_id}/search` (que só devolveria os ativos). A escolha do endpoint está certa pra esse objetivo.

## Achado grande — `TIPO_LIST` cobre só 2 dos 7 tipos de anúncio documentados

A doc mostra o filtro `listing_type_id` com **7 valores possíveis**: `gold_pro`, `gold_special`, `gold_premium`, `gold`, `silver`, `bronze`, `free`.

`buscar_mlbs.py` define `TIPO_LIST = ["gold_pro", "gold_special"]` — usado dentro da construção de `GRUPOS` (o produto cartesiano de `STATUS_LIST × LOGISTICA_LIST × TIPO_LIST × CATALOGO_LIST`, hoje 6 × 7 × 2 × 2 = 168 varridas). Como cada varrida manda `listing_type_id` como parâmetro explícito da busca, **só MLBs com `listing_type_id` igual a `gold_pro` ou `gold_special` podem ser encontrados** — qualquer MLB com `gold_premium`, `gold`, `silver`, `bronze` ou `free` nunca vai aparecer em nenhuma das 168 varridas, porque nenhuma delas pede por esses 5 valores.

> [!warning] Pendência de decisão — adiada pro próximo dia útil (confirmado com o usuário, 26/08/2026, 23:33)
> Ainda não sabemos se a Magazine ou a Samvale têm algum anúncio com esses 5 tipos "faltando". Se tiverem, esses MLBs estão sendo perdidos silenciosamente por todo o pipeline (`buscar_mlbs` → `buscar_detalhes` → `popular_banco`), sem gerar erro nenhum — simplesmente nunca são buscados. **Decisão de expandir `TIPO_LIST` pros 7 valores (o que levaria as 168 varridas pra 588) fica pra ser tomada depois — só registrado como conhecimento e risco real por enquanto, sem ação nem prazo.**

## Achado a testar — 2 valores de `STATUS_LIST` não aparecem no exemplo da doc

`buscar_mlbs.py` define `STATUS_LIST = ["active", "paused", "closed", "under_review", "payment_required", "not_yet_active"]`. Um exemplo de filtro `status` mostrado na doc (dentro de `available_filters`, tirado de 1 conta de teste bem pequena) lista: `pending`, `not_yet_active`, `programmed`, `active`, `paused`, `closed`. Batem 4 valores; `under_review` e `payment_required` (que usamos) não aparecem nesse exemplo, e `pending`/`programmed` (do exemplo) não estão na nossa lista.

> [!info] Registrado como teste a ser feito — sem conclusão ainda (confirmado com o usuário, 26/08/2026, 23:33)
> Não dá pra afirmar que isso é um erro: o exemplo da doc vem de 1 conta de teste com só 1 item cadastrado, então pode não ser uma lista exaustiva de todos os status válidos — só o que apareceu de fato pra aquela conta específica. **Pendência: testar ao vivo** (de forma parecida com os testes já feitos de `max_requests_per_hour` e consumo de app) se `under_review` e `payment_required` são valores reais que a Magazine/Samvale já usaram, ou se são nomes que nunca vão encontrar nada porque não existem de verdade — o que faria essas 2 fatias de `GRUPOS` (2 de 6 grupos de status, 56 das 168 varridas) sempre voltarem vazias.

## `scroll_id` — confirmado que o código já rotaciona certo, e o prazo de 5 minutos agora é oficial

A doc tem uma instrução um pouco confusa (provável artefato de tradução): diz "você deve atualizar o parâmetro a cada chamada" e, logo depois, "use o mesmo `scroll_id` para todas as chamadas" — as 2 frases parecem se contradizer.

> [!success] O código real já faz a coisa certa, independente da ambiguidade do texto
> Em `buscar_mlbs_varrida()`: a cada volta do laço, `scroll_id = dados.get("scroll_id")` pega o `scroll_id` mais recente devolvido pela API e usa exatamente esse na próxima chamada — nunca fica preso a um valor fixo do início ao fim. Essa é a interpretação que faz sentido pro padrão de paginação por scroll (o mesmo usado por Elasticsearch, por exemplo) — a ambiguidade é só do texto da doc, não do nosso código.

A doc também confirma, agora com número oficial: **o `scroll_id` expira em 5 minutos**. Cruzando com o dado real já registrado (Magazine inteira, 168 varridas, 132,9 segundos no total — ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]): nenhuma varrida individual chega perto de 5 minutos hoje, no ritmo atual. Risco baixo na prática — mas existe em teoria, se alguma varrida específica um dia enfrentar muitos 429/retry em sequência (cada um consumindo segundos de espera) e isso empurrar 1 única varrida pra perto do limite de 5 minutos.

## 2 pontos da doc que **não** se aplicam a este endpoint (registrados só pra evitar confusão futura)

- **`attributes=` (seleção de campos)**: existe só pro multiget `/items?ids=...`, não para `/users/{user_id}/items/search`. Esse endpoint (o desta nota) só devolve uma lista de strings de MLB em `results` — não tem "campos" pra selecionar. O tópico `attributes=` já está registrado corretamente na nota do outro endpoint, [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]].
- **`available_quantity` em faixa (dado "borrado")**: a doc avisa que isso acontece em "recursos públicos de Itens e Buscas" — mas `results` deste endpoint é só uma lista de IDs (`["MLB1", "MLB2", ...]`), sem nenhum campo de item dentro, então `available_quantity` nem aparece aqui. Esse risco só pode existir no outro endpoint (multiget), não neste.

## Achado adicional — filtro `tags=` no mesmo endpoint desta nota, descoberto numa doc diferente

A doc "Atributos" (ver [[Sistema de Atributos de Item na API do Mercado Livre]]) mostra um uso deste mesmo endpoint (`GET /users/{user_id}/items/search`) que a doc "Busca de itens" não tinha mencionado: filtrar por tag de item, via `?tags=incomplete_technical_specs`. Exemplo real da doc: `GET /users/465432224/items/search?tags=incomplete_technical_specs` devolve só os MLBs que estão com ficha técnica incompleta (a mesma tag `incomplete_technical_specs` já catalogada na tabela de tags de [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]). Não usado hoje pelo `buscar_mlbs.py` (que filtra só por `status`/`logistic_type`/`listing_type_id`/`catalog_listing`) — registrado como capacidade adicional do endpoint, útil se um dia quisermos buscar direto só os anúncios com algum problema de qualidade, sem varrer tudo.

## Endpoint irmão conhecido, mas não usado — `GET /users/{user_id}/items/search/restrictions`

Devolve 3 campos: `aggregations_allowed`, `query_allowed`, `sort_allowed`. Serve pra saber se a conta tem alguma restrição de busca por ter mais de 200.000 itens cadastrados (nesse caso, `aggregations_allowed: false`, e pedir `include_filters=true` devolveria HTTP 206 em vez de 200). Não é o nosso caso — Magazine tem ~5640 MLBs, Samvale ~3280, bem abaixo do teto. Registrado só como conhecimento, sem teste nem uso previsto.

## Outras formas de busca documentadas, não usadas hoje (ideias pra futuro, sem decisão)

- Busca direta por SKU no próprio endpoint de busca: `?sku=$SELLER_CUSTOM_FIELD` ou `?seller_sku=$SELLER_SKU` — hoje o projeto busca **todos** os MLBs e só depois cruza SKU no `buscar_detalhes.py`; essa forma poderia, no futuro, permitir buscar 1 SKU específico direto, sem varrer tudo.
- `missing_product_identifiers=true/false` — identifica publicação sem identificador de produto (ex: EAN/GTIN) carregado — poderia virar um indicador de qualidade de anúncio.
- `reputation_health_gauge=unhealthy|warning|healthy` — mede "saúde de exposição" do anúncio (perda de exposição por reclamação/cancelamento). Disponível só pra México, Chile e Brasil — o Brasil (nosso caso) está coberto.

## Relacionado

- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
