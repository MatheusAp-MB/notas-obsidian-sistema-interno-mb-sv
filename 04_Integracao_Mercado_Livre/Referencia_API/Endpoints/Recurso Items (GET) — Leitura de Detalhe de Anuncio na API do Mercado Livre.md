---
tipo: conceito
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 23:55
relacionado: [Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre, Sistema de Atributos de Item na API do Mercado Livre, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre, Consideracoes de Design da API do Mercado Livre, Erro 403 (Forbidden) da API do Mercado Livre, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Recurso Items (GET, multiget) — Leitura de Detalhe de Anúncio na API do Mercado Livre

> [!important] Qual é exatamente o endpoint desta nota — sem ambiguidade
> **Método e caminho exatos**: `GET /items?ids=$ITEM_ID1,$ITEM_ID2,...` (formato **multiget**, vários IDs de uma vez, via querystring).
> **É este, e só este, o endpoint que `integracao_mercado_livre/servicos/buscar_detalhes.py` chama de verdade** — a chamada real está direto em `buscar_detalhes()`: `chamar_api("GET", "/items", ..., params={"ids": ids_str})`, com `ids_str` sendo até 20 MLBs separados por vírgula (`TAMANHO_LOTE = 20`).
> **Formato da resposta**: não é um objeto único — é uma **lista**, 1 entrada por ID pedido, cada uma no formato `{"code": 200, "body": {...dado do item...}}` ("formato verbose", nas palavras da própria doc do Mercado Livre).
>
> Pra não haver confusão nenhuma, aqui estão os 2 "vizinhos" que existem nas docs estudadas, e por que **nenhum dos 2** é o assunto desta nota:
> - `GET /items/$ITEM_ID` (1 item só, por caminho, sem `?ids=`) — **não é este**. É a forma que a doc "Publicar produtos" usou no exemplo dela (resposta é o objeto do item direto, sem o wrapper `{code, body}`) — mas não é a forma que o nosso código chama. Mesmo recurso "Items", chamada e formato de resposta diferentes.
> - `GET /users/{user_id}/items/search` (com `search_type=scan`) — **não é este**, é o endpoint que `buscar_mlbs.py` usa pra descobrir **quais** MLBs existem; já tem nota própria, [[Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]]. Este aqui (`/items?ids=`) é o próximo passo, que busca o **detalhe** de cada MLB já descoberto.

## O quê é esta nota, e por que ela é diferente das 5 anteriores

**O quê**: 1ª nota da **camada de endpoint** do estudo da API do Mercado Livre — diferente das 5 notas anteriores (Boas Práticas, Considerações de Design, Erro 403, Autenticação e Autorização, Gerencie seu Aplicativo), que eram regras gerais, válidas pra qualquer chamada. Esta é sobre **1 recurso específico**: `GET /items?ids=...` em modo multiget, o mesmo que `integracao_mercado_livre/servicos/buscar_detalhes.py` já chama de verdade, em lotes de 20 (`TAMANHO_LOTE = 20` no código) — ver o callout acima pra identificação completa e sem ambiguidade do endpoint.

**De onde veio, e por que só metade dela foi registrada**: a doc de origem se chama "Publicar produtos" (última atualização 09/01/2026) — o nome é enganoso pro nosso caso, porque a doc é, na maior parte, sobre **criar/publicar** um anúncio (regra de título, categoria, garantia, gênero, loja oficial, Mercado Pago obrigatório). O projeto hoje **só lê** dado do Mercado Livre — não publica nada. Por decisão do usuário (26/08/2026, 23:20), esta nota registra **só a parte relevante pra leitura**; toda a parte de criação foi descartada de propósito, pelo mesmo critério já usado antes pra descartar a doc inteira de "Validador de Publicações" (100% sobre criar anúncio). A lista completa do que foi descartado está na última seção desta nota, pra ficar claro que foi omissão consciente, não esquecimento.

**Fonte**: documentação oficial do Mercado Livre para desenvolvedores, página "Publicar produtos" — última atualização em 09/01/2026.

## Achado 1 — `condition` está sendo substituído por `item_condition`, e é exatamente o campo que lemos hoje

A doc avisa: o atributo `condition` (no nível raiz do item) **será descontinuado**, substituído por `item_condition` (que fica dentro do array `attributes`, não no nível raiz). Duas informações importantes junto desse aviso:

- `condition` **continuará disponível por motivos de retrocompatibilidade** — ou seja, não é uma quebra imediata, é uma migração gradual, sem data de corte informada.
- Pra novas implementações, a recomendação é usar `item_condition` dentro de `attributes`.

> [!warning] Achado real: nosso código lê exatamente o campo que está sendo substituído
> Em `buscar_detalhes.py`, função `extrair_campos_pai()`: `"condition": body.get("condition")` — lemos o campo antigo, direto do nível raiz. Não existe hoje nenhuma leitura de `item_condition` (nem pelo helper genérico `extrair_atributo(body, attr_id)`, que já existe no mesmo arquivo e serve exatamente pra puxar atributo de dentro de `attributes`). **Sem ação necessária agora** — a doc confirma retrocompatibilidade ativa, sem prazo. Mas fica registrado como risco real e silencioso: se o Mercado Livre um dia cortar `condition` de vez, esse campo do nosso banco vira `None` sem gerar nenhum erro — ninguém percebe até reparar que o dado sumiu.

## Achado 2 — `tags` já é coletado, mas nunca decodificado — a doc traz o dicionário completo

Em `buscar_detalhes.py`: `"tags": json.dumps(body.get("tags", []), ensure_ascii=False)` — guardamos o array de tags do item como uma string JSON crua, sem decodificar o significado de cada uma. A doc trouxe uma tabela oficial explicando o que cada tag conhecida significa — útil como dicionário de referência pra quando alguém for interpretar esse campo depois (hoje ele só é armazenado, não analisado):

| Recurso | Tag | Descrição |
|---|---|---|
| Atributos | `incomplete_technical_specs` | A ficha técnica do item (atributos) está incompleta — itens que estão perdendo exposição. |
| Atributos | `extended_warranty_eligible` | Pode-se aplicar uma garantia estendida na compra do item. |
| Catálogo | `catalog_listing_eligible` | Publicações elegíveis para catálogo. |
| Catálogo | `catalog_boost` | Publicações otimizadas automaticamente pelo Mercado Livre. |
| Catálogo | `catalog_forewarning` | Publicações de marketplace que devem ser publicadas em catálogo antes de moderação. |
| Catálogo | `catalog_only_restricted` | Domínios exclusivos. |
| Catálogo | `opt_obey` | Domínios obrigatórios. |
| Preço por variação | `user_product_listing` | Item no novo modelo de User Products. |
| Preço por variação | `variations_migration_source` | Item antigo que passou pela migração do UPTIN e foi finalizado. |
| Preço por variação | `variations_migration_pending` | Item em processo de migração pro novo modelo de produtos de usuário. |
| Preço por variação | `variations_migration_uptin` | Item criado através da migração UPTIN. |
| Multiorigem | `warehouse_management` | Item sob o modelo de Multiorigem. |
| Imagens | `poor_quality_picture` / `poor_quality_thumbnail` | Imagens de má qualidade. |
| Imagens | `good_quality_thumbnail` / `good_quality_picture` | Imagens de boa qualidade. |
| Imagens | `unknown_quality_picture` | Não se sabe a qualidade das imagens. |
| Preço | `not_market_price` | Publicação com preço pouco competitivo. |
| Promoção | `loyalty_discount_eligible` | Pode-se aplicar desconto de fidelidade. |
| Promoção | `today_promotion` | Item se aplica a oferta promocional de curta duração. |
| Publicar | `non_buyable_as_standalone` | Não pode ser comprado sozinho — só faz parte de kit. |
| Republicar | `dragged_visits` | Item republicado, visitas do item pai contabilizadas. |
| Republicar | `dragged_bids_and_visits` | Item republicado, vendas e visitas do item pai contabilizadas. |
| Republicar | `relist` | Item já foi republicado (não pode ser republicado de novo). |
| Republicar | `free_relist` | Item foi republicado gratuitamente. |
| Pedidos | `cart_eligible` | Item pode ser adicionado ao carrinho. |
| Pagamento | `immediate_payment` | Item aceita só Mercado Pago como meio de pagamento. |
| Envio | `fbm_in_process` | Envio programado pra full (inbound) — item pausado até chegar. |
| Envio | `optional_me1_chosen` | Conta permite ME1 e ME2; item tem ME1 como opcional. |
| Envio | `lost_me2_by_dimensions` | Restrição de ME2 por dimensão do pacote passar do limite. |
| Envio | `adoption_required` | Item ainda não adotou ME2 (o recomendado). |
| Envio | `mandatory_free_shipping` | Preço acima do mínimo pra frete grátis obrigatório — junto de `free_shipping=true`. |
| Envio | `me2_available` | Item pode ser oferecido como ME2. |
| Envio | `self_service_in` | Item tem Flex ativado. |
| Envio | `self_service_out` | Item não tem Flex ativado. |
| Envio | `self_service_available` | Item é elegível pra Flex, mas não está ativado. |
| Moderações | `moderation_penalty` | Item com restrição (status `paused` se for só marketplace, senão `active`). |
| Brand | `brand_verified` | Item de loja oficial validado. |
| CPG | `supermarket_eligible` | Item de supermercado. |
| VIS | `hirable` | Item é um serviço (classificado) — pode-se "contratar". |
| CBT | `cbt_item` | Item de CBT (cross-border trade). |
| Teste | `test_item` | Item de teste. |

> [!info] Achado colateral: `flex` já é derivado de uma dessas tags
> `extrair_campos_pai()` já calcula `"flex": "self_service_in" in shipping_tags` — ou seja, o código já usa 1 das tags da tabela acima (`self_service_in`, de `shipping.tags`, não de `tags` do item) pra derivar um campo próprio. Confirma que decodificar tag por significado já é um padrão que o código usa, só que parcial — só essa 1, das dezenas que existem.

## Achado 3 — confirmado: nosso código já segue a boa prática de SKU

A doc recomenda: a informação de SKU "é carregada em atributos `SELLER_SKU`, e não em `seller_custom_field`". Conferindo `extrair_sku()` em `buscar_detalhes.py`:

```python
def extrair_sku(body: dict) -> str | None:
    for attr in body.get("attributes", []):
        if attr.get("id") == "SELLER_SKU":
            return attr.get("value_name")
    return body.get("seller_custom_field")
```

> [!success] Sem gap aqui — já implementado certo
> O código já prioriza `SELLER_SKU` (dentro de `attributes`) e só cai pra `seller_custom_field` como último recurso, se o atributo não existir. Bate exatamente com a recomendação da doc — achado positivo, não uma pendência.

## Achado 4 — 206 (Partial Content) explicado pela doc, e por que não nos afeta hoje

A doc explica: o recurso `/items` pode devolver HTTP **206** (em vez de 200) quando algum dado não pôde ser obtido — e lista, no header `X-Content-Missing`, quais campos especificamente podem faltar: **`location`**, **`geolocation`** e/ou **`seller_address`**. A resposta continua vindo (por isso "parcial", não erro), só com esses campos vazios/incompletos.

Cruzando com o que já existe no projeto:

> [!success] Cliente HTTP já trata 206 — e os 3 campos que podem faltar não são usados por nós
> `api_mercado_livre/core/estrutura_api/cliente_api.py`, dentro de `chamar_api()`: ao receber 206, o código já espera 2 segundos e tenta a mesma chamada de novo; se vier 200 na 2ª tentativa, usa essa; se continuar 206, aceita a resposta parcial mesmo assim (com aviso no log). Isso já existia antes desta nota — mas não lê o header `X-Content-Missing` pra saber exatamente o que faltou.
> Isso importa pouco pro nosso caso hoje: conferindo `extrair_campos_pai()` em `buscar_detalhes.py`, **nenhum dos 3 campos que a doc associa a 206** (`location`, `geolocation`, `seller_address`) é capturado ou salvo pelo nosso pipeline. Ou seja, mesmo numa resposta 206 de verdade, o dado que potencialmente falta não é um dado que usamos — o risco concreto pra nossos registros é baixo, mesmo sem tratamento específico do header.

## Achado 5 — por que existem 2 conjuntos de campo de dimensão em `buscar_detalhes.py`

`extrair_campos_pai()` calcula **2 grupos separados** de dimensão física do item:

- `shipping_dim_width` / `shipping_dim_height` / `shipping_dim_length` / `shipping_dim_weight` — vêm de `shipping.dimensions` (função `extrair_dimensoes(shipping)`).
- `attr_seller_package_height` / `attr_seller_package_width` / `attr_seller_package_length` / `attr_seller_package_weight` — vêm dos atributos `SELLER_PACKAGE_HEIGHT`/`WIDTH`/`LENGTH`/`WEIGHT` (via `extrair_atributo()`), mais `attr_dimensions` (atributo `DIMENSIONS`) e `attr_weight` (atributo `WEIGHT`).

> [!success] Achado real: não é redundância — são 2 fontes pra 2 modalidades de logística diferentes
> Cruzando com a doc "Atributos" (ver [[Sistema de Atributos de Item na API do Mercado Livre]]): vendedor no modo **ME1** usa `shipping.dimensions`; vendedor no modo **ME2, modalidades `cross_docking` e `xd_drop_off`**, usa os 4 atributos `SELLER_PACKAGE_*` — 2 dos 7 valores do nosso próprio `LOGISTICA_LIST` (`buscar_mlbs.py`). Ou seja: pra saber a dimensão certa de 1 MLB, é preciso olhar o campo certo **de acordo com o `logistic_type` daquele MLB específico** — os 2 conjuntos de campo não são alternativas equivalentes, são preenchidos em cenários diferentes. Isso explica uma escolha de design do código que, até agora, não tinha explicação documentada.

> [!warning] Achado a confirmar: os 4 campos `attr_seller_package_*` provavelmente vêm como texto com unidade embutida
> A doc mostra o valor desses atributos sempre como string com unidade junto (ex: `"value_name": "6 cm"`, `"214 g"`) — mesmo padrão já visto em outros atributos `number_unit` (`"4.8 kg"`, `"355 mL"`). Como `extrair_atributo()` só devolve `attr.get("value_name")` sem parsear, a leitura mais provável é que `attr_seller_package_height` no nosso banco fica salvo como texto (`"6 cm"`), não como número puro (`6`) — o que impediria somar/ordenar/comparar essas dimensões sem antes extrair o número da string. **Não confirmado com dado real do nosso banco ainda** — registrado como achado provável, não certeza.

## Fora de escopo, por decisão do usuário (26/08/2026, 23:20)

Tudo abaixo existe na doc original, mas foi **conscientemente excluído** desta nota por ser 100% sobre criar/publicar anúncio — o projeto hoje só lê:

- Regras de construção de título (estrutura recomendada, palavras proibidas, menção a marca de terceiros).
- `description` via `POST /items/$ITEM_ID/description` (criação de descrição).
- Regras de categoria, preço, moeda, forma de pagamento, frete no momento da publicação.
- Identificadores de produto e variações do ponto de vista de **criação** (o ponto de vista de **leitura** de variações já está coberto no código de `buscar_detalhes.py`, função `processar_item()`, fora do escopo desta doc específica).
- Tipos de publicação (`listing_type_id`) do ponto de vista de escolha na hora de publicar.
- Garantia (`sale_terms`, `WARRANTY_TYPE`/`WARRANTY_TIME`) do ponto de vista de configuração.
- Atributo `GENDER` e sua validação de título.
- Publicação em Loja Oficial (`official_store_id`) e marcas de publicação limitada.
- Mercado Pago obrigatório (`immediate_payment`) do ponto de vista de configuração no momento da publicação.
- Aviso sobre "User Products" (novo modelo de publicação) — só relevante no dia em que o projeto vier a publicar algo; hoje é 100% leitura.
- Formato de erro específico de validação de criação (`department`/`cause_id`/`type`/`code`/`references`/`message`, visto no exemplo do erro de `GENDER`) — não incorporado à Regra 1 de [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]] porque essa regra cobre erro das nossas chamadas reais, e hoje nenhuma delas é de criação/validação desse tipo. Fica só como nota, pra quando (se) existir fluxo de escrita.

## Relacionado

- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
- [[Consideracoes de Design da API do Mercado Livre]]
- [[Erro 403 (Forbidden) da API do Mercado Livre]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
