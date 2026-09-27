---
tipo: decisao
dominio: python
status: concluida
criado: 27/09/2026
atualizado_em: 27/09/2026 20:28
relacionado: [Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada, Padrao de Robustez para Clientes de API Externa, Modelagem de Objeto e Encapsulamento, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]
---

# Camadas do Cliente Mercado Livre — Transporte, Contexto e Ponto de Entrada

## Contexto

Cumpre a promessa registrada em [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]] ("Consequência pra próxima API (Mercado Livre): esse mesmo modelo de 3 camadas vale de novo") e resolve o achado de 26/08/2026 em [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]] ("falta um Facade pro ML... hoje a escolha MB/SV pro lado do ML ainda é manual, passada por quem chama").

Reforma estrutural do `api_mercado_livre`/`integracao_mercado_livre`, feita por partes a partir de 27/09/2026 (Peça 1: hierarquia de exceção em `excecoes.py`; Peça 2: proteção/backoff extraídos pra `protecao.py`; Peça 3: as 3 camadas abaixo, primeiro domínio migrado = frete real; Peça 4: os outros 5 domínios). Regra máxima do próprio Matheus pra toda essa reforma: mudar só a estrutura do que já existe (POO, dataclasses, decorators) sem mudar comportamento nem reinventar o que já funciona — os call sites que ainda usam `chamar_api()` direto fora deste app continuam intactos até sua própria vez.

Visão do usuário que motivou a Peça 3 (verbatim): "o correto seria ter um objeto instanciado, com uma conta... e ele ser feito uma vez só no código... aí todo mundo usa ele... tipo um objeto 'conexaoAPI' e todo mundo usa ele 'conexaoAPI.buscar_frete'... tem que ter um lugar que seja único... a conexão com a API nasce aqui e só existe aqui."

## Peça 3 aplicada e validada — as 3 camadas (domínio: frete real)

- **Transporte** (`api_mercado_livre/core/estrutura_api/cliente_api.py`, `ClienteApiMercadoLivre`) — prende a `conta` na construção; método público `.chamar(...)`.
- **Contexto** (`api_mercado_livre/frete_real_ml.py`, `FreteRealML`) — sabe o endpoint (`GET /users/{user_id}/shipping_options/free`) e o formato da resposta (`coverage.all_country.list_cost`).
- **Ponto de entrada / Facade** (`api_mercado_livre/__init__.py`, `ApiMercadoLivre`) — resolve empresa/conta/user_id sozinho (mesmo mecanismo `obter_empresa_ativa()` do `ApiSysemp`), constrói 1 `ClienteApiMercadoLivre`, expõe cada contexto por `@property` cacheada. Método direto: `.buscar_frete(mlb)`.

Validado de ponta a ponta em 27/09/2026 via `manage.py shell`, com dado real: `{'mlb': 'MLB2090605781', 'sucesso': True, 'valor': Decimal('6.85'), 'discount_type': 'mandatory'}`.

## Peça 4 aplicada e validada — os outros 5 domínios (27/09/2026)

Mesmo padrão da Peça 3, repetido pros 5 domínios restantes — 1 Contexto novo por domínio (composição sobre o mesmo `ClienteApiMercadoLivre`, nunca herança), Facade ganha `@property` + método passthrough, e o Orquestrador correspondente perde a chamada HTTP crua (e, quando existia, a extração de campos da resposta) e passa a usar `ApiMercadoLivre` — console, progresso/retomada e gravação em banco continuam 100% do Orquestrador, sem mudar de comportamento:

- **`MlbsML`** (`api_mercado_livre/mlbs_ml.py`) — `.varrer(varrida, user_id, pasta_logs)`, absorve a paginação por `scroll_id` de `GET /users/{user_id}/items/search`. Orquestrador: `buscar_mlbs.py`.
- **`DetalhesML`** (`api_mercado_livre/detalhes_ml.py`) — `.buscar_lote(ids_str, meta_map, pasta_logs)`, absorve o multiget `GET /items?ids=` inteiro, inclusive toda a extração de campos (`_extrair_sku`, `_extrair_atributo`, `_extrair_sku_variacao`, `_extrair_dimensoes`, `_extrair_campos_pai`, `_processar_item`). Orquestrador: `buscar_detalhes.py`.
- **`DadosSkuCompletoML`** (`api_mercado_livre/dados_sku_completo_ml.py`) — `.buscar_performance(mlbu, pasta_logs)` / `.buscar_price_to_win(mlb, pasta_logs)`, cada um capturando `(ErroAPI, ErroAutenticacaoAPI)` internamente e devolvendo o mesmo pacote `{"chamado","http","erro","dados"}` que o Orquestrador original já montava (`"http": None` no caminho de erro é o comportamento original, não regressão). Orquestrador: `buscar_dados_sku_completo.py`.
- **`ComissaoRealML`** (`api_mercado_livre/comissao_real_ml.py`) — `.buscar_item_info(mlb, pasta_logs)` / `.buscar_listing_prices(price, category_id, listing_type_id, pasta_logs)`; a segunda ainda levanta `ErroAPI` puro em caso de resposta inválida, sem capturar internamente — igual ao original, onde só o loop do Orquestrador tinha o `try/except`. Orquestrador: `buscar_comissao_real_ml.py`.
- **`CategoriasML`** (`api_mercado_livre/categorias_ml.py`) — `.baixar_dump(pasta_logs)`, devolve `{"dados", "md5", "gerado_em"}` de `GET /sites/MLB/categories/all` + os 2 headers de versão. Orquestrador: `sincronizar_categorias_ml.py`.

Validado via `manage.py shell`, com dado real, em 27/09/2026:
- **Categorias**: `md5`/`gerado_em` preenchidos, 12233 categorias baixadas.
- **MLBs**: 1 varrida real (`status=active`, `logistic_type=fulfillment`, `listing_type_id=gold_pro`, `catalog_listing=false`) trouxe 38 MLBs, formato de saída íntegro.
- **Detalhes**: 2 MLBs reais (`MLB1200196103`, `MLB1201009142`), 0 erros — amostra trouxe todos os campos da extração antiga (`title`, `pictures`, `sku`, `user_product_id`, `category_id`, `attr_seller_package_*`, etc.).
- **Performance**: `http: 200`, `dados` completo (score 85, buckets de qualidade).
- **Price to win + Comissão Real**: `item_info` → `listing_prices` encadeados com dado real (`MLB1968407268`), `sale_fee_amount`/`percentage_fee` corretos.

Com isso, os 6 domínios (frete, mlbs, detalhes, sku completo, comissão real, categorias) estão migrados pro padrão Transporte/Contexto/Facade e validados no nível Contexto/Facade — a promessa da Peça 3 ("esse mesmo modelo... vale de novo pros outros domínios") está cumprida.

**Fora do escopo desta decisão, ainda pendente**: rodar cada Orquestrador por inteiro (management command normal, não só o shell isolado) pra confirmar que console, arquivo de progresso/retomada e gravação em banco continuam se comportando exatamente como antes — não testável fora do estado real de produção (SKUs pendentes, queryset de variações, etc.), fica como último passo de QA a critério de Matheus.

## Diferenças reais em relação ao modelo Sysemp (assimetrias conscientes, não erro)

- `ClienteApiMercadoLivre` é um **adaptador fino**, não um transporte completo: só prende `conta` e delega pra `chamar_api()` (função solta, já existente, retry/backoff/exceções continuam morando nela). Diferente de `ClienteApiSysemp`, que tem o laço de retry inteiro dentro do próprio método `.chamar()`. Decisão consciente — não duplicar/reescrever lógica que já funciona.
- `user_id` e `pasta_logs` são resolvidos 1 vez só no Facade, mas ainda viajam como parâmetro em cada método de Contexto (ex: `FreteRealML.buscar(mlb, user_id, pasta_logs)`), em vez de ficarem guardados internamente no Contexto ou no Cliente — assimetria real vs. `ImpostosEntradaXML`, que não precisa repassar nada parecido a cada chamada.
- `pasta_logs` deliberadamente NÃO é resolvido dentro do Facade (diferente de empresa/conta/user_id) — continua vindo de fora, resolvido por cada Orquestrador, mesmo princípio "0 integração com o resto do sistema" que já vale pro `api_sysemp`.

## Pendência técnica registrada (decidida, ainda não implementada)

1. Avaliar se algum dia vale internalizar a lógica de `chamar_api()` dentro de `ClienteApiMercadoLivre`, pra ele virar dono de verdade da robustez de transporte — hoje só delega/empresta o nome do método.
2. Encapsular `user_id`/`pasta_logs` dentro do Contexto ou do Cliente, em vez de repassar como parâmetro solto em toda chamada.
3. Trocar os dicts soltos de retorno (de todos os Orquestradores — `buscar_frete_real_variacao()`, `buscar_frete_real_ml()`, e equivalentes nos outros 5 domínios) por `@dataclass` — é literalmente o "objeto de processo/domínio" descrito em [[Modelagem de Objeto e Encapsulamento]] ("dataclass, nunca salvo no banco, representa um cálculo ou transformação em andamento"), mesmo padrão que `api_sysemp`/`integracao_sysemp` já usa (`RelatorioDeSincronizacao`).

Os 3 pontos valem pros 6 domínios agora migrados (frete, mlbs, detalhes, sku completo, comissão real, categorias) — decisão explícita: tratar como 1 fase futura transversal a todos eles, não corrigir domínio por domínio.

## Relacionado

- [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Modelagem de Objeto e Encapsulamento]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
