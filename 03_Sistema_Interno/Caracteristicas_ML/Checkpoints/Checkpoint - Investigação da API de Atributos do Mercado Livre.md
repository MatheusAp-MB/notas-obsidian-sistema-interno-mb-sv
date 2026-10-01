---
tipo: checkpoint
status: em andamento (fase Idealizar)
criado: 01/10/2026
atualizado_em: 01/10/2026 12:04
dominio: Sistema Interno V2 - Características/Atributos ML (novo)
relacionado: []
---

# Checkpoint - Investigação da API de Atributos do Mercado Livre

## Objetivo

Novo objetivo dentro do Sistema Interno V2 (mesma repo): ler e organizar — e futuramente corrigir — as "Características principais" (atributos) dos anúncios do Mercado Livre via API. Se funcionar, vira uma nova função do sistema, com tela própria.

Disparado a partir de uma necessidade real: anúncios com o campo "Características principais" do editor do ML desatualizado/incorreto (ex.: anúncio "Bota Ortopédica Imobilizadora Curta Bilateral Takecare", com Marca="Take Care", Modelo="Bota, Curta, Média, Ortopédica, Imobilizad...").

## Escopo confirmado

- **Fase 1 (atual):** só ler e organizar os dados via API. Nenhuma escrita ainda.
- **Fase 2 (futuro, já confirmado como objetivo, não implementado):** corrigir via API.
- **Escala:** mais de 4.000 anúncios — mesma classe de volume dos outros domínios ML já otimizados no sistema (mlbs ~5.500, sku completo ~3.400+).

Regra seguida nesta investigação: trabalhar com calma, sem pressa — Idealizar → Planejar → Executar, confirmação explícita antes de cada etapa. Nenhum código foi gerado ainda.

## Achados confirmados na documentação oficial

Fonte: `Atributos.html` (developers.mercadolivre.com.br/pt_br/atributos). Todos os pontos abaixo vêm do texto da doc, não de conhecimento geral — seguindo a regra de sempre pedir o HTML oficial quando não se tem a doc daquele recurso específico.

**Mapeamento da tela:** o bloco "Características principais" do editor do anúncio corresponde ao grupo de atributos com `attribute_group_id = "MAIN"`. Confirmado porque o recurso `/categories/$CATEGORY_ID/technical_specs/input` retorna esse grupo com `"id": "MAIN"` e `"label": "Características principales"` — é a mesma tela.

**Ler o que já está preenchido num anúncio:**
`GET https://api.mercadolibre.com/items/$ITEM_ID` → resposta traz array `"attributes"`, um objeto por atributo já preenchido: `id`, `name`, `value_id`, `value_name`, `value_struct`, `attribute_group_id`, `attribute_group_name`. Confirmado na seção "Modificar e/ou adicionar atributos" da doc, com exemplo real de resposta.

**Catálogo de atributos válidos de uma categoria:**
`GET /categories/$CATEGORY_ID/attributes` → todos os atributos que a categoria aceita (id, name, tags, value_type, values permitidos, value_max_length).

**Quais são obrigatórios:**
`GET /categories/$CATEGORY_ID/technical_specs/input` → grupos (MAIN = Características principais) e, dentro de cada grupo, os atributos com a tag `"required"`. Dois níveis de obrigatoriedade confirmados na doc:
- atributo `required` em `/categories/$CATEGORY_ID/attributes` → bloqueia a publicação se ausente;
- atributo obrigatório só em `technical_specs/input` e ausente em `/attributes` → não bloqueia, mas penaliza o posicionamento nas listagens (item ganha a tag `incomplete_technical_specs`).

**Obrigatoriedade condicional:**
`POST /categories/$CATEGORY_ID/attributes/conditional` → manda os dados do item, a resposta diz se os atributos com tag `"conditional_required"` são obrigatórios pro caso. Disponível só para Argentina, Brasil e México.

**Comportamento do PUT (relevante pra Fase 2 futura):**
`PUT /items/$ITEM_ID` NÃO faz merge automático. Doc explícita: "Você terá que carregar esse atributo novamente quando fizer o PUT a fim de não perder as informações." Ou seja, toda correção futura vai precisar reenviar o atributo corrigido E os que já estavam certos, senão eles somem do anúncio.

**Remover um valor de atributo:**
Enviar `value_id` e `value_name` como `null` no PUT. Se o atributo for obrigatório, a API recusa com o erro `item.attributes.deleted_required`.

## Primeiro teste real — MLB2616936722 (01/10/2026)

Objeto de teste escolhido: SKU F7908050719121.001 / MLB2616936722 (Pulverizador Bomba Costal, conta MB/Magazine, categoria MLB209017, domain_id MLB-GARDEN_SPRAYERS).

**Scripts de exploração criados** (`scripts_exploracao_ML/`, mesmo padrão dos outros scripts da pasta — sincronizados e commitados por Matheus):
- `investigar_atributos_item.py` — `GET /items/$ITEM_ID` com `include_internal_attributes=true`, dump bruto sem filtro.
- `comparar_atributos_item_vs_grupo_main.py` — lê o JSON salvo pelo script acima, busca ao vivo `GET /categories/$CATEGORY_ID/technical_specs/input` da categoria do item, e cruza os ids do grupo MAIN contra os atributos preenchidos no item (tabela rich: label, obrigatório, preenchido, valor atual).

**Achado — divergência real vs. doc:** a resposta real de `GET /items/$ITEM_ID` NÃO traz `attribute_group_id`/`attribute_group_name` em nenhum atributo (a doc mostra esses campos no exemplo, mas não vieram na prática). Cada atributo real também trouxe um array `"values"` (plural, com id/name/struct) que não aparece no exemplo da doc, e não tem campo `"value_struct"` no nível do atributo (só dentro de `values[0].struct` pra tipos number_unit). Consequência prática: não dá pra saber quais atributos são "Características principais" só pela resposta do item — precisa cruzar com `technical_specs/input` da categoria, pelo `id`.

**Resultado do cruzamento:** categoria MLB209017, grupo MAIN = 8 atributos (BRAND, LINE, MODEL, GARDEN_SPRAYER_TYPE, BATTERY_TYPE, POWER_SUPPLY_TYPE, COLOR, TOTAL_CAPACITY), 3 marcados `required` (BRAND, MODEL, POWER_SUPPLY_TYPE). Os 8 estavam preenchidos no item de teste, nenhum obrigatório faltando.

**Validação com o HTML real da tela** (anúncio aberto em modo de edição): 7 dos 8 atributos do grupo MAIN batem exatamente com o card "Características principais" — mesmo label, mesmo valor, mesma marcação "(obrigatório)" nos 3 que são obrigatórios (Marca, Modelo, Tipo de alimentação). Confirmado também: o checkbox "Não se aplica" (N/A) só aparece nos 4 campos não-obrigatórios do card, nunca nos obrigatórios.

**Achado importante — COLOR fica fora do escopo:** o 8º atributo do grupo MAIN (COLOR) NÃO aparece no card "Características principais" da tela — está numa seção separada, "Características da variação", desabilitada nesse anúncio por já ter vendas. `attribute_group_id == MAIN` sozinho NÃO é critério suficiente pra definir o escopo.

**Decisão de escopo (confirmada por Matheus, com capturas de tela):** o domínio da feature é EXCLUSIVAMENTE o que aparece no card "Características principais" da tela — nesse exemplo, os 7 campos: Marca (BRAND), Modelo (MODEL), Tipo de alimentação (POWER_SUPPLY_TYPE), Linha (LINE), Tipo de pulverizador (GARDEN_SPRAYER_TYPE), Tipo de bateria (BATTERY_TYPE), Capacidade total (TOTAL_CAPACITY). "Características da variação" é assunto completamente separado — não entra no escopo, e não vamos nos preocupar se um anúncio tem ou não variação.

## Consolidação de características por SKU — script 3 (01/10/2026)

Novo ponto dentro do mesmo objetivo: como TODOS os MLBs de 1 produto são o MESMO produto, eles deveriam ter as mesmas Características principais. Matheus pediu uma visão consolidada por SKU — tabela com 1 linha por grupo de MLBs com os mesmos valores, linha própria só pra quem diverge — ignorando todo MLB classificado como catálogo.

**Decisões de Matheus antes de gerar código:**
- Agrupamento de MLBs por SKU: via **banco** (`carregar_variacoes_por_sku`), não via fecho transitivo sobre JSON bruto — os comandos de integração ML já foram otimizados com paralelismo e estão rápidos, então o fluxo é rodar a sincronização primeiro (banco atualizado e correto) e depois consumir os dados do banco.
- Motivo confirmado de ignorar catálogo: o Mercado Livre não permite alterar características de anúncios classificados como catálogo — não é só simplificação de escopo, é limitação real da API/plataforma.

**Investigação da infra existente (análise antes de gerar qualquer código):**
- `classificacao_catalogo` é campo de banco (`TipoDeAnuncioMercadoLivre`), calculado 1x na importação por `classificar_catalogo()` — reaproveitável direto via `anuncio.tipo_de_anuncio.classificacao_catalogo`, sem chamada nova de API.
- `carregar_variacoes_por_sku()` (`mercado_livre/funcoes_auxiliares/classificacao_catalogo.py`) já agrupa variações por SKU com fallback de 3 níveis, com `select_related` de anúncio/tipo_de_anuncio/produto prontos.
- Existe também `encontrar_fecho_transitivo()` (sobre JSON bruto, não banco) — mais completo pra casos de SKU divergente em catálogo, mas Matheus decidiu não usar por ora (ver decisão acima).
- **Nenhuma característica principal (BRAND/MODEL/etc.) está salva no banco** — o único campo parecido (`VariacaoAnuncioMercadoLivre.atributos`) vem de `attribute_combinations` da API, que é exatamente a Característica da variação (fora do escopo), não a principal. Confirma que o script precisa buscar ao vivo por MLB, igual os scripts anteriores.
- `category_id` por MLB já está no banco (`Variação.categoria`), mas o script não precisou usar — o `GET /items/{MLB}` já traz o `category_id` no mesmo corpo, sem precisar de lookup separado.

**Script criado:** `consolidar_caracteristicas_por_sku.py` (3º script do objetivo, depois de `investigar_atributos_item.py` e `comparar_atributos_item_vs_grupo_main.py`). Fluxo: `carregar_variacoes_por_sku` → descarta catálogo → `GET /items/{MLB}` por MLB restante → `GET /categories/{id}/technical_specs/input` por categoria (cacheado) → filtra o grupo MAIN excluindo quem tem a tag `allow_variations` (generalização da regra COLOR confirmada no teste anterior, agora pela tag em vez de validação visual manual) → monta vetor de valores por MLB → agrupa MLBs com vetor idêntico em 1 linha, separa quem diverge.

**Achado técnico novo:** o projeto tem um router de banco por empresa (`core/empresa.py`) — todo script avulso que usa o ORM precisa chamar `definir_empresa_ativa(EMPRESA_MAGAZINE ou EMPRESA_SAMVALE)` logo após `django.setup()`, antes de qualquer leitura, senão a query falha (decisão de Matheus de 27/09: nunca cair em silêncio no banco errado). Os 2 scripts anteriores desse objetivo não precisaram disso por só usarem a API, nunca o ORM — esse é o primeiro do objetivo que toca banco.

**Resultado do primeiro teste real (SKU F7908050719121.001, conta MB):** 20 MLBs no banco, 7 ignorados por catálogo, 13 processados — todos na mesma categoria MLB209017.
- Card final da categoria (MAIN menos allow_variations) = exatamente os mesmos 7 atributos já validados por HTML no teste anterior (BRAND, LINE, MODEL, GARDEN_SPRAYER_TYPE, BATTERY_TYPE, POWER_SUPPLY_TYPE, TOTAL_CAPACITY) — 2º sinal (além do HTML) de que a generalização pela tag `allow_variations` está correta.
- **9 grupos diferentes entre os 13 MLBs** — divergência real, não ruído isolado. Capacidade total 100% consistente (20 L, único campo sem problema). Marca ("Bruden" vs "Brudden") e Modelo (11x "SS20B" vs 2x "Manual") parecem erro de preenchimento, não variação legítima. Linha, Tipo de pulverizador, Tipo de bateria e Tipo de alimentação concentram a divergência real. Mesmo o maior grupo (4 MLBs, "consenso") está com Linha vazia — maioria não implica correto.

## Pendências de leitura (doc ainda não lida em detalhe)

- "Especificar atributos que não aplicam" (N/A) — como marcar/ler atributos N/A, incluindo o parâmetro `include_internal_attributes=true` necessário pra enxergá-los via GET.
- Regras especiais de atributos de dimensão de pacote (seller_package_height/length/width/weight) e os 3 erros de validação mais comuns.
- Vocabulário completo da propriedade `tags` além dos já confirmados (fixed, hidden, required, conditional_required, allow_variations, defines_picture, multivalued, variation_attribute, new_required, catalog_listing_required, read_only, product_pk, inferred, used_hidden, new_hidden).

## Próximos passos (em aberto, não decidido)

- Como identificar a categoria de cada um dos 4.000+ anúncios, pra poder chamar `technical_specs/input` por categoria.
- Já que `attribute_group_id` não vem na resposta do item, decidir o fluxo definitivo de leitura em escala: pra cada anúncio, buscar `GET /items/$ITEM_ID` + `GET /categories/$CATEGORY_ID/technical_specs/input` (cacheável por categoria, não por item) e cruzar pelo `id`, igual ao script de teste — ainda não decidido se o cache de categoria entra nessa fase ou só na implementação real.
- Validar a regra `allow_variations` (exclusão de atributo de variação dentro do grupo MAIN) numa categoria DIFERENTE de MLB209017 — os 2 testes reais até agora (HTML + technical_specs/input) foram na mesma categoria. Ainda é só 1 amostra de categoria.
- Desenho da tela nova do Sistema Interno V2 pra essa função — ainda não discutido.
- Decidir o que fazer com os MLBs "sem tipo_de_anuncio" que o script 3 não ignora automaticamente (não apareceu nenhum no teste real, mas o script foi escrito pra avisar, não pra assumir).
- Continuar Idealizar → Planejar com Matheus antes de qualquer código novo.

Resolvido nesta rodada (01/10, 11:40): escopo do domínio definido (seção acima) — não depende mais de entender N/A ou dimensão de pacote em detalhe pra avançar, já que nenhum desses 7 campos é afetado por isso.

Resolvido nesta rodada (01/10, 12:04): agrupamento de MLBs por SKU decidido (via banco, não fecho transitivo) — ver seção "Consolidação de características por SKU" acima. Script 3 criado e rodado contra SKU real; achado técnico do router de banco por empresa documentado. Confirmada divergência real de características entre MLBs do mesmo SKU (9 grupos em 13 MLBs) — validação prática de que o objetivo da feature (Fase 2, correção) tem mérito real.
