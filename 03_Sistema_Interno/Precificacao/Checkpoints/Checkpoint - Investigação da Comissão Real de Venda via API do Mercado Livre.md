---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 23/09/2026
atualizado_em: 23/09/2026 15:59
relacionado: [Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]
---

# Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre

**Resumo**: Depois de encerrar a fase de pesquisa da Frente A (frete — ver [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]]), Matheus abriu uma investigação em paralelo: é possível descobrir a comissão real de um produto específico através da API do Mercado Livre? Hoje o sistema usa um valor fixo manual (`ConfiguracaoTipoAnuncioMercadoLivre.comissao`), sem nenhuma integração com API. Esta investigação está em fase de pesquisa pura — nenhum código de produção foi tocado, nenhuma decisão de arquitetura foi tomada.

## 1. Motivação e ponto de partida

Pergunta original de Matheus: **"é possível descobrir a comissão daquele produto em específico através da API?"**

Estado confirmado do sistema hoje, por leitura direta do código:

- `ConfiguracaoTipoAnuncioMercadoLivre` (`mercado_livre/models/configuracao_mercado_livre.py`) guarda um `comissao` FLAT, manual, só por `tipo_anuncio` (Clássico/Premium — 2 linhas no total). Não é por categoria, não vem de API.
- Comentário no próprio model confirma decisão deliberada de 27/07: "logística (FULL/Coleta) e classificação (Simples/Base/Catálogo) NÃO afetam comissão nem margem — só o tipo de anúncio importa pra precificação."
- Busca no repo inteiro: **zero ocorrências** de `sale_fee` ou `listing_prices` em qualquer lugar do código — não existe hoje nenhuma integração de comissão via API, nem estimada nem realizada.

## 2. Três camadas de "verdade" sobre comissão — hipótese inicial via GPT

Antes de qualquer doc oficial, foi pedida uma pesquisa ao GPT sobre a documentação do endpoint de comissão. A resposta dele propôs uma estrutura de 3 camadas distintas:

1. **`listing_prices`** — estimativa pré-venda (calculador, sem venda associada).
2. **`order_items[].sale_fee`** — comissão da venda realizada (dentro de `GET /orders/{order_id}`).
3. **`billing.sale_fee.{gross,net,rebate,discount}`** — camada de reconciliação/faturamento (API de Billing/Provisões).

Essa estrutura foi tratada desde o início como **hipótese de trabalho da GPT, não fato confirmado** — cada camada só é aceita como válida depois de checada contra a doc oficial (HTML real), célula por célula. É o mesmo padrão de rigor já usado na Frente A.

## 3. Doc oficial confirmada #1 — `listing_prices` (estimativa pré-venda)

Fonte: página oficial "Custos por vender" (`developers.mercadolivre.com.br`), HTML completo obtido e lido — endpoint `GET /sites/{SITE_ID}/listing_prices`.

**Parâmetros**: `price` (obrigatório), `currency_id`, `category_id`, `listing_type_id`, `logistic_type` (9 valores), `shipping_mode` (4 valores), `billable_weight` (só Argentina), `tags`.

**Campos de resposta confirmados**:

- `sale_fee_amount` — valor TOTAL da comissão, **já inclui o `fixed_fee`**. A própria doc avisa explicitamente: "Esse valor já está incluído em sale_fee_amount; não o adicione novamente."
- `sale_fee_details.percentage_fee` — percentual aplicado.
- `sale_fee_details.fixed_fee` — custo fixo por operação (existe separado dentro do details, só não soma de novo no total).
- `sale_fee_details.gross_amount` — base de cálculo.
- `sale_fee_details.financing_add_on_fee`.
- `sale_fee_details.meli_percentage_fee` — só MLA (Argentina).
- `listing_fee_amount` / `listing_fee_details` — custo de **publicar** o anúncio, campo diferente do custo de vender, não confundir.
- `listing_type_id`, `listing_type_name`, `requires_picture`, `currency_id`, `listing_exposure`, `stop_time`.

**Achado crítico pra MLB, direto da doc oficial**: `percentage_fee` varia não só por categoria/tipo de anúncio, mas por outros fatores comerciais não divulgados; a doc afirma que categorias específicas em faixas de preço específicas podem ter redução de comissão, e que **o mesmo produto pode ter comissões diferentes em momentos distintos**. Ou seja: não deve ser tratado como valor permanente/cacheável — mesmo que se busque a comissão de um produto hoje via API, não há garantia de que o valor continua válido amanhã.

**De passagem, sem ser o foco desta investigação**: a doc também revela a lógica de frete pra Brasil/Colômbia/Chile/México — só `self_service` (Flex) cobra taxa fixa quando `price < TH` (limite de frete grátis do site); ME1/custom/not_specified sempre cobram taxa fixa nesse caso; se `price >= TH`, nenhuma taxa fixa é cobrada; `billable_weight` não se aplica a esses 4 países (só Argentina). Fica registrado como contexto, não como achado desta frente.

## 4. Doc oficial confirmada #2 — Orders (`order_items[].sale_fee`, venda realizada)

Fonte: página oficial "Gerenciar orders" (`developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas`), última atualização 21/09/2026 — HTML completo obtido e lido.

**Confirmado literalmente na doc**: `sale_fee: comissão de vendas.` — campo dentro de `order_items[]`, numérico, na moeda da order.

**Confirmado literalmente (bate com a hipótese da GPT)**: "Lembre-se de que as comissões são calculadas no momento da acreditação do pagamento, ou seja, quando o pedido fica visível para o vendedor e não quando o pedido é criado." — ou seja, `sale_fee` em `order_items` já é comissão **realizada**, não estimativa.

**NÃO confirmado (a GPT afirmou, a doc não sustenta)**: a GPT alegou que `sale_fee` é "tarifa por unidade" e que seria preciso multiplicar por `quantity` pra chegar na comissão total da order. Essa afirmação **não existe em nenhum trecho da doc oficial** — os dois exemplos de resposta que trazem `sale_fee` têm `quantity: 1`, então nem confirmam nem refutam por si só. Tratado como não confirmado — se for relevante, precisa de teste empírico com order real de `quantity > 1` antes de assumir a fórmula `sale_fee × quantity`.

**Achado novo, não mencionado pela GPT**: dentro de `payments[]`, existe o campo `marketplace_fee`. No único exemplo oficial disponível, ele aparece com o mesmo valor de `order_items[].sale_fee` (14.29 vs 14.290000000000001 — diferença é só precisão de ponto flutuante). A doc não explica a relação entre os dois campos, mas no exemplo disponível eles batem exatamente — possível campo de validação cruzada dentro da própria resposta de `/orders/{order_id}`, sem precisar de chamada adicional.

**Achado novo secundário, não mencionado pela GPT**: o endpoint `/orders/$ORDER_ID/discounts` documenta um `funding_mode` que pode assumir o valor `"sale_fee"` — ou seja, existe um mecanismo onde a própria comissão pode ser objeto de desconto promocional (financiado por campanha), separado do mecanismo de desconto por reputação já mapeado na Frente A (seção 17 daquele checkpoint). Não avaliado se isso se aplica ao catálogo MB/SV — só registrado como possibilidade adicional de variação da comissão.

## 5. O que falta

A doc de Billing/Provisões (`billing.sale_fee.{gross,net,rebate,discount}`) ainda **não foi obtida oficialmente**. A GPT apontou duas URLs candidatas (`boas-praticas-para-o-consumo-das-apis-de-relatorios-de-faturamento` e `pt_ar/provisoes` — esta última suspeita, por estar em locale argentino) mas nenhuma delas foi confirmada com HTML real ainda. Sem essa 3ª camada, a comparação completa (estimado via `listing_prices` × realizado via `order_items` × reconciliado via `billing`) não pode ser fechada.

## 6. Escopo Reduzido — Só Interessa a Estimativa Pré-Venda (23/09, 15:45)

Matheus esclareceu o objetivo real da investigação: **"eu não preciso saber a comissão pós venda... O que importa é somente a pré venda, a estimativa para precificar."**

Isso muda diretamente o que as seções 4 e 5 significam pra esta frente:

- **Seção 4 (Orders / `order_items[].sale_fee`, venda realizada) sai do escopo prático.** Continua registrada porque já foi pesquisada e tem achados reais (a confirmação do timing, o `marketplace_fee`, o `funding_mode == "sale_fee"`), mas nenhum deles é necessário pro objetivo de precificação — são sobre comissão depois que a venda já aconteceu.
- **Seção 5 (Billing/Provisões, reconciliação) sai do escopo prático.** Não precisa mais ser perseguida — era a 3ª camada da hipótese de 3 níveis (seção 2), mas essa hipótese inteira só fazia sentido se as 3 camadas fossem necessárias. Com o objetivo restrito a precificação, só a 1ª camada (`listing_prices`) importa.
- **O que fica como o único alvo real da investigação**: a seção 3 (`listing_prices`) — é exatamente o calculador pré-venda, pensado pra estimar custo antes de publicar/vender.

**Conexão com a Frente A, registrada aqui por ser relevante pra uma eventual implementação futura**: `listing_prices` precisa de `category_id` como parâmetro. Esse é o mesmo dado que a Opção 2 do frete (API ao vivo, ver Frente A seção 6) já precisa levantar de um MLB publicado pra fazer a simulação de frete. Se a Opção 2 do frete um dia for implementada, o mesmo `category_id`/`listing_type_id` já levantado ali serviria pra essa chamada de comissão também — não seria uma dependência nova, seria reaproveitamento do mesmo contexto já necessário por outro motivo.

## 7. Primeira Bateria Real — Comissão API x Flat, 15/30 (50%) Divergiram (23/09, 15:59)

Script criado: `scripts_exploracao_ML/comparar_comissao_real_vs_flat_via_api.py` — reaproveita a mesma infra de autenticação/`chamar_api` dos scripts de frete. Busca MLBs reais ativos com `preco_atual` preenchido, espalhados por preço (do mais barato ao mais caro, não só os primeiros) e balanceados entre Clássico/Premium — sem filtrar por categoria, porque o ERP não guarda `category_id` do ML (achado já confirmado na Frente A). Pra cada candidato: 1 chamada a `/items/{mlb}` (category_id, cacheado por MLB) + 1 chamada a `GET /sites/MLB/listing_prices` com `price`/`category_id`/`listing_type_id`. Uma sub-amostra (5 de 30) recebe uma 2ª chamada idêntica, só pra checar estabilidade do valor dentro da mesma sessão.

**Incerteza resolvida**: a resposta de `listing_prices` veio como objeto único (não lista) nas 30 chamadas — a defesa pro formato de lista, escrita por precaução no código, não foi necessária.

**Resultado (conta MB, 30 candidatos testados)**:

- **15/30 (50%) com percentual DIFERENTE do flat configurado** — divergência bem maior do que o esperado pra uma amostra inicial.
- **Estabilidade: 0/5 instáveis** — as 5 chamadas repetidas (mesmos parâmetros exatos) devolveram o mesmo percentual na 2ª tentativa. Prova só estabilidade *dentro da mesma sessão* (poucos segundos entre chamadas) — não derruba o aviso da doc (seção 3) sobre o valor mudar "em momentos distintos" ao longo de dias/semanas.
- **Assimetria observada**: das 15 divergências, 12 são API MENOR que o flat (ex: MLB6253059364, R$608,80 Premium: API 14% x flat 17%, diferença de R$18,27 — a maior da amostra) e só 3 são API MAIOR que o flat (MLB6312269810 R$73,90: 14% x 12%; MLB4486381497 R$79,92: 19% x 17%; MLB5758860166 R$119,98: 14% x 12%).
- **Implicação da assimetria**: quando a API é menor que o flat, o sistema hoje precifica com comissão mais alta que a real (conservador, mas pode inflar preço/prejudicar competitividade). Quando a API é maior que o flat (os 3 casos), é o oposto — a margem real fica menor que a margem-alvo calculada, porque o custo de comissão foi subestimado. Essa é a direção que preocupa mais.
- **Padrão NÃO é um corte limpo por faixa de preço** — candidatos Clássico bateram exato em R$63,90 e R$151,49 mas divergiram em R$73,90 e R$119,98 (faixas de preço parecidas). É mais consistente com o que a doc já avisava (seção 3): variação por categoria + outros fatores comerciais não divulgados, não só por preço. Tratado como observação, não como regra confirmada — não há dado suficiente ainda pra cravar isso.

**Conclusão**: primeira evidência quantificada de que o flat atual não é uma boa aproximação pra boa parte do catálogo real — 50% de divergência, com diferenças que passam de R$18 num único produto. Isso é achado, não decisão: ainda não foi decidido se/como a API deveria substituir ou complementar o flat na fórmula de precificação.

## Pendências / próximos passos

- **Decisão de arquitetura ainda não tomada** — a bateria da seção 7 dá evidência de que vale considerar usar a API pra precificação (50% de divergência, diferenças relevantes), mas não decide COMO: ao vivo dentro do cálculo (como a Opção 2 do frete), só pra parte do catálogo, ou outro desenho. Decisão de Matheus, não técnica.
- **Ampliar a amostra e/ou testar a conta SV** — 30 candidatos foi só a 1ª bateria (conta MB). Uma amostra maior, e testar SV também, daria mais confiança no tamanho real do gap antes de qualquer decisão.
- **Investigar se a divergência é mesmo por categoria** — a seção 7 observou que não é um corte limpo por faixa de preço, mas não isolou `category_id` como causa confirmada (o script não expõe isso na tabela hoje). Se for relevante, precisaria logar `category_id` por candidato e agrupar os resultados por ele.
- **Como lidar com o valor não sendo cacheável com confiança** — a doc (seção 3) avisa que o mesmo produto pode ter comissão diferente em momentos distintos; a bateria da seção 7 só testou estabilidade em segundos, não em dias/semanas. Segue em aberto.
- ~~Obter doc oficial de Billing/Provisões~~ — **fora de escopo desde 23/09, 15:45** (seção 6): não é mais necessário, o objetivo é só a estimativa pré-venda.
- ~~Confirmar se `sale_fee` (Orders) é "por unidade"~~ — **fora de escopo desde 23/09, 15:45** (seção 6): campo de comissão pós-venda, não usado pra precificação.
- ~~Avaliar `marketplace_fee` como validação cruzada~~ — **fora de escopo desde 23/09, 15:45** (seção 6): mesmo motivo, é campo de Orders (pós-venda).
- ~~Mapear gatilho de `funding_mode == "sale_fee"`~~ — **fora de escopo desde 23/09, 15:45** (seção 6): mesmo motivo.

## Relacionado

- [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]] (seção 9 confirma os percentuais de comissão Clássico 10–14% / Premium 15–19%, via doc oficial "Costos de Venta" — contexto direto pra esta investigação)
