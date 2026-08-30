---
tipo: conceito
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 23:55
relacionado: [Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre, Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Sistema de Atributos de Item na API do Mercado Livre

> [!important] Qual é exatamente o assunto desta nota — sem ambiguidade
> **Endpoint principal**: `GET /categories/{category_id}/attributes` — devolve o **schema** de todos os atributos possíveis pra uma categoria (quais existem, que tipo de valor aceitam, que valores conhecidos existem, e que regras/comportamentos cada um tem).
> **Endpoints irmãos, cobertos nesta mesma nota**: `GET /categories/{category_id}/technical_specs/input` (quais atributos são recomendados por categoria, organizados por grupo de exibição), `GET /categories/{category_id}/technical_specs/output` (como esses atributos são exibidos no site), `POST /categories/{category_id}/attributes/conditional` (verifica se algum atributo extra vira obrigatório dependendo da combinação de valores já escolhidos), `POST /catalog_domains/{domain_id}/attributes/{attribute_id}/top_values` (valores mais usados de um atributo, por domínio).
> **O que esta nota NÃO é**: não é sobre ler os atributos já preenchidos de 1 anúncio específico (isso é o array `attributes` dentro da resposta de `GET /items?ids=...`, já coberto em [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]). Esta nota é sobre o **schema/regra por trás** desses valores — o que cada atributo significa, que tipo de dado ele carrega, e que comportamento especial ele tem. As 2 notas se complementam: uma explica a regra, a outra mostra o dado real que a gente já lê.

## Por que esta nota existe, e por que é tratada com tanto peso

**O quê**: nota da camada de endpoint dedicada inteiramente ao sistema de atributos — schema, tipos, comportamentos, obrigatoriedade, valores especiais (N/A), e como modificar.

**Por quê o peso extra**: por decisão explícita do usuário (26/08/2026), atributo é o ponto onde o projeto extrai o **máximo de dado possível** sobre um anúncio — por isso esta nota cobre a doc quase inteira, mesmo as partes que só fazem sentido pra quem publica (POST/PUT), e não só pra quem lê (GET). O motivo: entender a regra completa de como um atributo pode ser **escrito** também ensina como ele deve ser **lido e interpretado** — o formato de um valor não muda dependendo da direção da chamada. Esse princípio ("o que é aceito num POST tende a valer também pro GET") vai ser formalizado como conceito próprio numa conversa futura — aqui ele só é aplicado na prática.

**Fonte**: documentação oficial do Mercado Livre para desenvolvedores, página "Atributos" — última atualização em 08/06/2026.

## O que é 1 atributo, no nível mais básico

Um atributo é 1 característica nomeada de um item — cor, marca, modelo, voltagem, EAN, e por aí vai. Cada atributo tem, no mínimo, estes campos:

| Campo | O que é |
|---|---|
| `id` | Código fixo do atributo (ex: `BRAND`, `COLOR`, `EAN`) — igual em qualquer categoria que o use. |
| `name` | Nome legível, em português/espanhol conforme o site (ex: "Marca"). |
| `value_id` | Código do valor escolhido, quando o valor vem de uma lista fechada conhecida (ex: `"15438"` pra Shure). Pode ser `null` se o valor for livre/novo. |
| `value_name` | Texto do valor (ex: `"Shure"`, `"6 cm"`, `"355 mL"`). |
| `value_type` | O tipo de dado que esse atributo aceita — ver seção própria abaixo. |
| `attribute_group_id` / `attribute_group_name` | Agrupamento visual do atributo — `MAIN` (atributos principais, os mais importantes da categoria) é o único nome fixo visto nas docs; os demais grupos variam por categoria (`DFLT`/`Otros` aparece bastante como "grupo padrão"). |

## Os 5 tipos de valor (`value_type`)

| `value_type` | O que aceita | Consideração importante |
|---|---|---|
| `string` | Texto livre, letras e números misturados. | A API sugere uma lista de valores conhecidos, mas aceita valor novo — nesse caso, manda só `value_name` (sem `value_id`). Pra valor conhecido, pode mandar os 2. |
| `number` | Só valor numérico. | Mesma lógica do `string`: lista de sugestões existe, mas aceita novo, mesma regra de quando mandar `value_id`. |
| `number_unit` | Valor numérico + unidade (ex: `"6 cm"`, `"355 mL"`, `"4.8 kg"`). | A API valida esse formato no momento de publicar/modificar. `value_max_length` limita o tamanho máximo do texto do valor. **Achado prático**: como o valor sempre vem como texto único (número + unidade colados), qualquer leitura que precise do número puro (pra somar, ordenar, comparar) precisa parsear a string primeiro — não vem separado em 2 campos. |
| `boolean` | Só 2 valores possíveis (sim/não). | Precisa mandar o `value_id` do valor (não dá pra inferir só pelo texto) — consultável na API de atributos da categoria. |
| `list` | Lista fechada de valores possíveis, sempre pelo menos 1. | Só precisa do `value_name` de 1 dos valores possíveis pra carregar. |

## Comportamentos especiais do atributo (as `tags` do schema) — 17 flags catalogadas

> [!warning] Cuidado com colisão de nome: isso NÃO é a mesma coisa que "tags do item"
> Essas `tags` vivem dentro da resposta de `GET /categories/{category_id}/attributes` — são flags de comportamento do **atributo em si** (regra da categoria). É um conceito **completamente diferente** de "tags do item" (`good_quality_picture`, `mandatory_free_shipping`, etc.), que é uma lista de status/qualidade de 1 anúncio específico, já catalogada em [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]. Mesma palavra, 2 conceitos diferentes, em 2 endpoints diferentes — nunca confundir os dois no vault.

| Tag | O que significa |
|---|---|
| `allow_variations` | O atributo pode virar combinação de variação (ex: Cor). Variação não é criada automaticamente — o atributo só fica disponível na seção certa do PUT/POST. |
| `defines_picture` | O atributo define qual foto é mostrada pra cada variação (ex: Cor em sapato) — só faz sentido em atributo que também suporta variação. |
| `fixed` | Valor já é fixo pra aquela categoria (ex: Marca, quando a árvore de categoria já implica a marca) — o Mercado Livre preenche sozinho, não precisa enviar. |
| `hidden` | Não aparece no fluxo de venda do site (front-end), mas pode ser lido/escrito via API. |
| `used_hidden` | Oculto e usado em contexto de produto usado/recondicionado. |
| `new_hidden` | Oculto e usado em contexto de produto novo. |
| `inferred` | Valor é inferido automaticamente e não pode ser mudado (ex: `LINE` do iPhone infere `BRAND = Apple`). |
| `multivalued` | Aceita mais de 1 valor ao mesmo tempo, separados por vírgula (ex: identificadores de produto como `EAN`, `GTIN`, `UPC`, `MPN` são todos `multivalued`). |
| `others` | Uso interno do Mercado Livre — sem efeito prático pra quem integra. |
| `product_pk` | O atributo faz parte da chave que identifica 1 produto dentro do catálogo (usado pra achar `catalog_product_id`). |
| `read_only` | Uso interno — vendedor não pode carregar nem modificar esse atributo (ex: `PACKAGE_HEIGHT`/`PACKAGE_WIDTH`/`PACKAGE_LENGTH`/`PACKAGE_WEIGHT`, que são as versões somente-leitura, diferentes das `SELLER_PACKAGE_*`, que são as que o vendedor de fato preenche). |
| `required` | Obrigatório pra publicar um item tradicional — sem ele, a publicação falha. |
| `restricted_values` | Uso interno. |
| `variation_attribute` | Se o item tem variação, esse atributo pode ter valor diferente por variação (mesmo em item sem variação, ainda aceita 1 valor único). |
| `new_required` | Obrigatório só quando a condição do item é "novo". |
| `conditional_required` | Pode virar obrigatório dependendo da combinação de outros valores já escolhidos — só descobre chamando `POST /categories/{category_id}/attributes/conditional` (ver seção própria abaixo). |
| `catalog_listing_required` | Obrigatório especificamente pra enviar uma publicação tradicional ao catálogo (optin/envio ao catálogo). |

### Matriz de exclusão — quais comportamentos nunca coexistem no mesmo atributo

| | Required | Fixed | Allow_variations | Variation_attribute | Defines_Picture | Hidden |
|---|---|---|---|---|---|---|
| **Required** | | | | | | X |
| **Fixed** | | | X | X | X | |
| **Allow_variations** | | X | | X | | |
| **Variation_attribute** | | X | X | | X | |
| **Defines_Picture** | | X | | X | | |
| **Hidden** | X | | | | | |

Leitura da tabela: um atributo `Required` nunca é `Hidden` (e vice-versa); um atributo `Fixed` nunca tem `Allow_variations`, `Variation_attribute` nem `Defines_Picture` (fixo não varia, faz sentido).

### Matriz de implicação — quando 1 comportamento força outro

| | Required | Fixed | Allow_variations | Variation_attribute | Defines_Picture | Hidden |
|---|---|---|---|---|---|---|
| **Defines_Picture** | | | X | | | |

Única implicação documentada: se um atributo tem `defines_picture`, ele **precisa** também ter `allow_variations` (faz sentido — só dá pra definir foto por variação se o atributo realmente permitir variação).

## Atributo obrigatório — 2 fontes diferentes, com consequência diferente

| Fonte | O que significa não ter o atributo |
|---|---|
| `GET /categories/{category_id}/attributes`, atributo com tag `required` | **Bloqueia a publicação** — sem ele, a API recusa o POST/PUT com erro. |
| `GET /categories/{category_id}/technical_specs/input`, atributo marcado como obrigatório mas que **não** tem `required` no recurso acima | **Não bloqueia** — só prejudica o posicionamento do anúncio nas listagens (fica com a tag de item `incomplete_technical_specs`, já catalogada em [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]). |

`GET /categories/{category_id}/technical_specs/output` é o espelho "de exibição" do `input` — mostra como o Mercado Livre organiza esses mesmos atributos numa ficha técnica visível no site (por grupo, com um `component` de UI tipo `TEXT_OUTPUT`/`BOOLEAN_OUTPUT`/`NUMBER_UNIT_OUTPUT`). Ambos os recursos retornam um campo `unified_units` dentro de cada grupo, sem explicação no texto da doc — **registrado como ponto em aberto, sem entendimento claro do que ele carrega**.

## Atributo condicionalmente obrigatório (`conditional_required`) — como descobrir na prática

> [!important] Só disponível pra Argentina, Brasil e México
> Fora desses 3 países, esse mecanismo não existe.

Mecânica: você manda um `POST /categories/{category_id}/attributes/conditional` com o JSON **completo** do item que pretende publicar (título, preço, atributos já escolhidos, etc.) — a resposta devolve só os atributos que **ainda faltam**, dado o que você já escolheu.

Exemplo real da doc (categoria de cerveja, `MLA403656`): mandando um item com `BEER_STYLE = Pale Ale`, a resposta veio `{"required_attributes": [{"id": "GTIN", "name": "Código universal de producto"}]}` — ou seja, cerveja Pale Ale exige informar o GTIN. Já mandando um item **artesanal** (`IS_CRAFT_BEER = Sim`), a resposta veio `{"required_attributes": []}` — nenhum atributo extra exigido, porque cerveja artesanal está dentro de uma exceção. O mesmo atributo (`GTIN`, com tag `conditional_required`) muda de obrigatório pra opcional dependendo só da combinação de valores escolhidos — não dá pra saber isso só olhando o schema estático da categoria, só chamando esse endpoint com o item inteiro.

## Atributos de dimensão de pacote (`SELLER_PACKAGE_*`) — a fonte que nosso código já usa

> [!success] Achado real, cruzado com o código: explica por que existem 2 conjuntos de campo de dimensão
> Detalhe completo do cruzamento com `buscar_detalhes.py` (quais campos do nosso banco vêm de qual fonte, e o achado sobre o valor vir como texto com unidade embutida) está registrado em [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]], pra não duplicar. Aqui fica só a regra oficial completa.

- 4 atributos: `SELLER_PACKAGE_HEIGHT`, `SELLER_PACKAGE_LENGTH`, `SELLER_PACKAGE_WIDTH` (todos em **centímetros**), `SELLER_PACKAGE_WEIGHT` (em **gramas**) — só esses 2 tipos de unidade são aceitos.
- **Obrigatórios pra vendedor com ME2 nas modalidades `cross_docking` e `xd_drop_off`** — 2 dos 7 valores do nosso próprio `LOGISTICA_LIST`. Se não informados, a API recusa (erro), mesmo a tag `required` ainda não aparecendo formalmente nas respostas de schema por domínio hoje (a doc avisa que essa obrigatoriedade "será estendida progressivamente pra mais categorias e modalidades").
- **Vendedor com ME1 usa outro campo**: `shipping.dimensions` (não esses atributos) — 2 fontes de dado paralelas, uma por modalidade de logística.
- O vendedor declara "largura × altura × comprimento", mas o front-end reordena as 3 dimensões (maior pra menor) só pra exibição — isso não muda o cálculo de frete, porque o volume total do pacote é o mesmo independente da ordem.
- Existe também um par de atributos **somente leitura** com nome parecido (`PACKAGE_HEIGHT`, `PACKAGE_WIDTH`, `PACKAGE_LENGTH`, `PACKAGE_WEIGHT`, sem o prefixo `SELLER_`, tag `read_only`) — são internos do Mercado Livre, o vendedor não escreve neles.

### Erros específicos de dimensão de pacote (formato write, catalogado aqui como referência)

| Situação | `code` | `department` | Mensagem |
|---|---|---|---|
| Falta pelo menos 1 dos 4 atributos | `item.attribute.missing.seller.package.dimensions` | `pymes` | "The attributes seller_package_height, seller_package_length, seller_package_width, seller_package_weight are all required" |
| Formato inválido (ex: usou decimal) | `item.attribute.invalid.format.seller.package.dimensions` | `pymes` | "...only integers are accepted for dimensions and weight, with 'cm' as the unit for dimensions and 'g' as the unit for weight" |
| Valor fora do realista/aceito | `item.attribute.invalid.seller.package.dimensions` | `pymes` | "...have invalid values" |

> [!info] Mesmo formato de erro já visto antes, campo `department` novo
> Esses 3 erros seguem o mesmo formato estruturado (`department`/`cause_id`/`type`/`code`/`references`/`message`) já registrado como "erro de validação de criação" na nota de Items — aqui aparece um `department: "pymes"` específico, valor novo que ainda não tínhamos catalogado. Como o projeto não publica hoje, esses erros nunca vão aparecer nas nossas chamadas reais — ficam só como referência, não entram na Regra 1 de [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]] (que é sobre erro das nossas chamadas de verdade).

## Atributos "N/A" (não aplicável) — por que isso pode nos afetar na leitura

Quando o vendedor marca explicitamente que 1 especificação não se aplica ao produto, ele manda `value_id: "-1"` e `value_name: null`. Isso é diferente de simplesmente não preencher o atributo.

> [!warning] Achado real: hoje não conseguimos ver esses valores
> A doc é explícita: pra um `GET /items/$ITEM_ID` (ou multiget) devolver os atributos marcados como N/A, é preciso mandar o parâmetro `include_internal_attributes=true`. **`buscar_detalhes.py` não manda esse parâmetro hoje** — então, na prática, "atributo nunca preenchido" e "atributo marcado explicitamente como não aplicável" ficam **indistinguíveis** no nosso dado: os 2 casos aparecem como o atributo simplesmente ausente do array `attributes`, e `extrair_atributo()` devolve `None` pros 2. Sem ação decidida agora — só registrado como limitação real e conhecida.

Outras regras sobre N/A, direto da doc:
- Atributo com tag `required: true` **não pode** ser marcado N/A.
- Se mandar `value_id: "-1"` mas `value_name` vier com algo diferente de `null`, a API **ignora** o envio inteiro (como se não tivesse sido mandado) — os 2 campos precisam estar alinhados.
- Uma vez resolvido (preenchido de verdade), não dá pra voltar a deixar `null` de novo só com PUT — só substituindo por um valor real.

## Valores mais usados (`top_values`) — ferramenta de descoberta, não usada hoje

`POST /catalog_domains/{domain_id}/attributes/{attribute_id}/top_values` devolve os valores mais usados de 1 atributo, dentro de 1 domínio, ordenados por popularidade (métrica `NOL_90` — novas publicações nos últimos 90 dias, único critério disponível hoje). Aceita `limit` (até 1000) e, opcionalmente, `known_attributes` — uma lista de outros atributos já conhecidos, pra filtrar o resultado por combinação (ex: perguntar "quais os modelos mais comuns pra marca Samsung", em vez de "quais os modelos mais comuns" sem filtro nenhum).

> [!info] Ideia de uso futuro, sem decisão
> Apesar do nome sugerir escrita, essa chamada não cria nem altera nada — é só consulta (usa `POST` só porque o corpo carrega o filtro `known_attributes`). Poderia servir, no futuro, pra validar/enriquecer dado de catálogo (ex: sinalizar quando um `MODEL` cadastrado foge muito dos valores mais comuns do domínio) — não implementado, sem prioridade.

## Modificar e remover atributo (write, registrado como referência completa)

- **Modificar/adicionar via PUT**: o PUT de atributos é **parcial**, não substitui a lista inteira — só os atributos citados no corpo do PUT são alterados; os que já existiam e não foram citados continuam com o valor anterior.
- **Remover valor de um atributo**: manda `value_id: null` e `value_name: null` pro atributo específico. Só funciona pra atributo que não seja `required` — tentar remover um atributo obrigatório dá erro `item.attributes.deleted_required` (HTTP "bad request").
- Atributo pode ser adicionado a qualquer momento do ciclo de vida do item, não só na criação.
- Atributo tipo `list` só aceita valor dentro da lista fechada — pra valor novo, ainda assim é preciso mandar o `value_id` do mais parecido, mais o valor novo no `value_name`.

## Relacionado

- [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]
- [[Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
