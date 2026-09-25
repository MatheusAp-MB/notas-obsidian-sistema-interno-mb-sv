---
tipo: checkpoint
dominio: python
status: pausado
criado: 23/09/2026
atualizado_em: 25/09/2026 12:27
relacionado: [Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]
---

# Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre

**Resumo**: Depois de encerrar a fase de pesquisa da Frente A (frete — ver [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]]), Matheus abriu uma investigação em paralelo: é possível descobrir a comissão real de um produto específico através da API do Mercado Livre? Hoje o sistema usa um valor fixo manual (`ConfiguracaoTipoAnuncioMercadoLivre.comissao`), sem nenhuma integração com API. Esta investigação começou como pesquisa pura; a partir da validação da seção 8 virou implementação real — comando de busca em produção (`buscar_comissao_real_ml`, seção 9) e decisões de arquitetura de exibição também tomadas na seção 9. A integração desse dado na fórmula de cálculo de preço (`GradePrecificacaoML.comissao_calculada`/`origem_comissao`), porém, segue em aberto — mesmo status do Frete Real. Seção 13 mapeia 3 caminhos técnicos possíveis e o motivo de nenhum ter sido aplicado ainda (conflito com o cache de assinatura de dimensão): decisão de Matheus, não técnica. **Pausado por Matheus em 25/09, 12:27 — ver "Pausa" logo abaixo pra retomar.**

## Pausa (25/09, 12:27)

Matheus pausou o projeto neste ponto. Pra retomar sem precisar reconstruir contexto:

- **Toda a investigação está fechada e validada** (seções 1–12) — dado da API confirmado correto 6/6 contra o Simulador de Custos real (seção 8), rodado em escala real (3.440/3.447 variações, seção 10), e as 3 camadas de exibição (MLB real / média Produto / média Categoria) já estão implementadas e validadas em tela (seções 11–12).
- **A única coisa genuinamente em aberto é a seção 13**: qual dos 3 caminhos usar pra fazer a Comissão Real efetivamente entrar no cálculo do preço (hoje só `config_tipo.comissao`, o valor fixo, entra na fórmula). Expliquei os 3 caminhos em texto corrido pro Matheus (não ficou registrado em detalhe didático aqui no vault, só o resumo técnico da seção 13) — se for retomar numa sessão nova, vale reexplicar antes de assumir que ele lembra os 3 de cabeça.
- **Nenhum diff foi montado nem aplicado** — a decisão de qual caminho seguir não foi tomada antes da pausa.
- Resto das pendências (7 MLBs órfãos, `categoria_id` não persistido no pipeline regular, ampliar amostra/testar SV, etc.) seguem exatamente como estavam — ver "Pendências / próximos passos" no fim desta nota.

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

## 8. Validação Final — Confronto Dígito a Dígito com o Simulador de Custos Real, 6/6 Bateram (24/09, 09:00)

Objetivo desta etapa, definido explicitamente por Matheus: **"terminar de validar se os dados de comissão vindo da API estão de fato corretos"** — antes de qualquer decisão de arquitetura, garantir que a divergência de 50% encontrada na seção 7 é achado real e não erro de script/chamada.

**Script atualizado**: `comparar_comissao_real_vs_flat_via_api.py` ganhou um modo `--mlbs` (lista direcionada de MLBs, sem passar pela amostragem do banco), uma função `buscar_category_id_e_tipo()` que busca `category_id`, `listing_type_id` e `price` direto de `/items/{mlb}` (elimina qualquer chance de descompasso entre o que foi enviado pro `listing_prices` e o que o anúncio realmente é), e dois mecanismos de validação: `FAIXA_DOCUMENTADA_POR_TIPO` (compara contra Clássico 10–14%/Premium 15–19%, os percentuais confirmados na Frente A seção 9) e `GABARITO_CONHECIDO` (compara contra um valor real, tirado do próprio Simulador de Custos do Mercado Livre — fonte 100% independente da API).

**Conjunto testado (6 MLBs)**: os 5 candidatos Premium da bateria da seção 7 que ficaram fora da faixa documentada (13,5%–14%, abaixo do 15–19% esperado pra Premium — o que levantou suspeita de erro de `listing_type_id`), mais 1 gabarito já conhecido (MLB3519337227, Clássico, 11%, validado antes contra print real do simulador).

**Etapa 1 — hipótese de `listing_type_id` errado: descartada.** Nos 6 casos, `listing_type_id_bate: true` — a API confirmou que usou exatamente o tipo enviado (5× `gold_pro`, 1× `gold_special`). Não é erro de chamada.

**Etapa 2 — faixa documentada: os 5 outliers continuam fora dela mesmo com o tipo confirmado certo.** `dentro_da_faixa_documentada: false` nos 5 Premium (13,5%–14%, contra 15–19% esperado); `true` no gabarito (11%, dentro do 10–14% de Clássico).

**Etapa 3 — confronto contra o Simulador de Custos real (print tirado por Matheus pra cada um dos 6 MLBs, mesmo dia)**:

| MLB | Tipo | Preço (API) | Preço (Simulador) | % API | % Simulador | Tarifa API | Tarifa Simulador | Resultado |
|---|---|---|---|---|---|---|---|---|
| MLB4264152189 | Premium | R$ 159,00 | R$ 159,00 | 14% | 14% | R$ 22,26 | R$ 22,26 | ✅ Exato |
| MLB6295584044 | Premium | R$ 189,31 | R$ 189,31 | 13,5% | 13,5% | R$ 25,56 | R$ 25,56 | ✅ Exato |
| MLB4860026971 | Premium | R$ 335,01 | R$ 335,01 | 14% | 14% | R$ 46,90 | R$ 46,90 | ✅ Exato |
| MLB6253059364 | Premium | R$ 608,81 | R$ 608,81 | 14% | 14% | R$ 85,23 | R$ 85,23 | ✅ Exato |
| MLB3519337227 (gabarito) | Clássico | R$ 358,35 | R$ 358,35 | 11% | 11% | R$ 39,42 | R$ 39,42 | ✅ Exato |
| MLB6228114400 | Premium | R$ 410,29 | R$ 397,98 (1º print) | 14% | 13,85% (1º print) | R$ 57,44 | R$ 55,12 (1º print) | ⚠️ ver abaixo |

**O caso MLB6228114400 — divergência explicada, não contradita**: no 1º print, o preço simulado (R$397,98) era diferente do preço que a API usou na chamada (R$410,29) — o anúncio teve o preço alterado entre a chamada e o print. Cada lado é internamente consistente com seu próprio preço (R$410,29 × 14% = R$57,44; R$397,98 × 13,85% = R$55,12), só que são dois momentos/preços diferentes. Matheus resimulou o mesmo MLB **com o preço R$410,29** (2º print, mesmo dia) e o resultado bateu exato: 14%, R$57,44 — **6/6 fechado**. Esse caso vira evidência concreta e numerada de que a comissão real muda quando o preço do anúncio muda (o aviso da doc, seção 3, deixa de ser só teórico).

**Conclusão da validação**: dados de comissão da API confirmados corretos com o nível de confiança mais alto que esta investigação conseguiu alcançar — 6/6 batendo exato, centavo a centavo, contra fonte real e independente da API (o próprio Simulador de Custos do Mercado Livre). A divergência de 50% encontrada na seção 7 é achado real, não erro de script/chamada/tipo. A "faixa documentada" (Clássico 10–14%/Premium 15–19%, doc "Costos de Venta") está confirmada como não-universal — reduções de comissão por categoria/preço, já avisadas pela doc do `listing_prices` (seção 3), são reais e acontecem na prática. Com isso, a pergunta de correção dos dados está fechada; o que resta em aberto é só arquitetura (como usar) e escopo de amostra (ver Pendências).

## 9. Comando em Produção Corrigido + Decisão de UX/Arquitetura de Exibição (25/09, 08:45)

**Bug de console corrigido**: `buscar_comissao_real_ml` (management command novo, entrou no repo no commit `52cda87` do dia 25/09) nasceu com o mesmo padrão de `rich.progress.Progress` (`SpinnerColumn`/`BarColumn`/`TextColumn`/`TimeElapsedColumn`, live redraw) que `buscar_frete_real_ml` usava antes de ser corrigido nesse mesmo commit. No terminal de trabalho de Matheus (Git Bash/MINGW64, Windows), esse padrão não redesenha a mesma linha — cada refresh do `rich` imprime uma linha nova, duplicando cada MLB na tela (estado "⏳ na fila", depois spinner, depois resultado, tudo empilhado). Corrigido removendo o `Progress` e trocando por `console.print()` simples, 1 linha por MLB, impressa só quando o item termina — mesmo padrão já aplicado em `buscar_frete_real_ml.py`. Testado por Matheus com `--mlb` e `--produto`: saída limpa confirmada, valores consistentes entre as duas formas de busca (MLB4597084561: 18%, R$3,28 nos dois casos).

**Decisão de UX/arquitetura pra exibição** — sessão de "pensar antes de codar" pedida explicitamente por Matheus, sem nenhum código gerado nessa etapa. Fecha parte da pendência "decisão de arquitetura ainda não tomada" (só a parte de EXIBIÇÃO — a integração na fórmula de cálculo continua em aberto, ver Pendências):

- **Comissão Real por MLB** (já implementada, seção 8) é o único dado com uso em cálculo previsto. Reforçado por Matheus: o que importa é sempre a ALÍQUOTA (%), nunca o valor em R$ — R$ é derivado (`% × preço`), e é o % que permite comparar/agregar produtos de preços diferentes.
- **Comissão Média do Produto** (nova, informativa — NÃO usada em cálculo): 2 números por produto — Clássico e Premium, cada um a média de todos os MLBs daquele tipo pertencentes ao produto, **atravessando categorias diferentes** se o produto tiver MLBs publicados em categorias distintas. Responde à pergunta de Matheus: **"quanto que me custa esse produto HOJE da forma que ele está, separado por Clássico e Premium"**.
- **Comissão Média da Categoria** (nova, informativa — NÃO usada em cálculo): mesma lógica de separação Clássico/Premium, mas agrupando por categoria e **atravessando produtos diferentes**. Serve diretamente a pendência já registrada nesta nota ("investigar se a divergência é mesmo por categoria") — vira dado vivo em vez de exigir um script pontual.
- As duas médias são **snapshot**: consideram todo dado existente no banco no momento do cálculo, mesmo antigo, sem filtro de frescor ("entra tudo que tiver dado mesmo que antigo" — decisão explícita de Matheus).
- **Mecanismo de recálculo**: Matheus levantou receio explícito, por experiência prévia real, de repetir problema já vivido com triggers automáticos "bugando em loop". Decisão: nenhum signal do Django. O comando de busca (`buscar_comissao_real_ml`) guarda em memória quais produtos/categorias foram tocados durante a execução, e recalcula as médias 1 vez só, ao final do comando, só pra esses — nunca a cada `.save()` individual de variação. Um botão manual aciona essa mesma rotina de recálculo, com escopo escolhido por Matheus (1 produto, 1 categoria, ou tudo). Estruturalmente sem risco de ciclo: a escrita só vai numa direção (MLB → médias), o passo que grava a média nunca escreve de volta em `VariacaoAnuncioMercadoLivre` (que é o único gatilho de busca de comissão real).

**Ainda em aberto, fica registrado como próximo passo**: onde exatamente essas médias/comparações aparecem na tela — fase de Planejar (desenho de modelo/tela) ainda não iniciada, só o dado e o mecanismo de recálculo foram fechados nesta sessão. O mesmo exercício de "pensar o dado + objetivo do usuário" ainda não foi feito pro Frete Real, que segue incompleto (só aparece como comparação no modal de auditoria da grade, nunca chegou a entrar de fato na fórmula — `origem_frete` nunca é atribuído em nenhum lugar do código, mesma situação que `origem_comissao` vai ter quando implementado).

## 10. Categoria Não Persistida no Pipeline Regular — Bug Corrigido via Backfill, Mecanismo de Recálculo Validado e Rodado em Escala (25/09, 11:31)

**Bug encontrado**: apesar da decisão da seção 12-B do [[Checkpoint - Idealização de Cache de Comissão e Frete + Tabela de Categorias do Mercado Livre]] (campo `categoria` mora em `VariacaoAnuncioMercadoLivre`, 1:1 por MLB), nenhum lugar do pipeline regular de importação grava esse campo — confirmado por leitura direta do código: `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py` monta `dados_variacao` com `sku_ml`, `mlbu`, `produto`, `estoque`, `qtd_vendas`, `atributos`, `num_fotos`, `thumbnail_url`, `imagem_principal_url`, `preco_atual`, `preco_original` — sem `categoria`. Busca no repo inteiro por qualquer atribuição a `.categoria`/`categoria_id` numa `VariacaoAnuncioMercadoLivre` não encontrou nenhuma. Consequência prática: quase nenhuma variação tinha categoria preenchida, o que travava silenciosamente o mecanismo de recálculo da Comissão Média (seção 9) — `categorias_tocadas` em `buscar_comissao_real_ml.py` só recebe algo `if variacao.categoria_id`, então o recálculo por categoria nunca disparava (sempre 0 categorias atualizadas).

**Fix aplicado — backfill retroativo**: rodado fora do pipeline regular (não é um comando novo commitado no repo). Resultado: **5.793 de 5.893 variações (98,3%) passaram a ter categoria preenchida**. Os ~100 restantes (1,7%) ficaram sem — hipótese não investigada a fundo: MLBs fechados/pausados há muito tempo, ou categorias que saíram do dump local (`CategoriaMercadoLivre`) desde a última sincronização do dump de categorias (seção 7 do outro checkpoint). Não bloqueante.

**Validação end-to-end com dado real**: rodado `buscar_comissao_real_ml --empresa magazine --produto F7898026081454.001` — produto com 4 variações, todas na mesma categoria (`MLB269721`, "Inseticidas"). 4/4 com sucesso na busca de comissão real via API (`MLB6599437466` e `MLB4597084561`: 18%/R$3,28; `MLB6599423922` e `MLB4597161489`: 13%/R$2,19). Conferido em seguida via shell: `categoria_id = MLB269721`, e a categoria ficou com `comissao_media_classico = 13.00` (amostra 2) e `comissao_media_premium = 18.00` (amostra 2) — batendo exatamente com os 2 pares de percentuais retornados pela API. Primeira confirmação prática, com dado real, de que o mecanismo desenhado na seção 9 (comando toca produto/categoria → recalcula só quem foi tocado) funciona de ponta a ponta agora que a categoria está populada.

**Pendência nova identificada**: o backfill resolveu os dados já existentes, mas é pontual — `importar_anuncios_ml.py` continua sem persistir `categoria_id` pra anúncios novos. Sem correção permanente ali, todo MLB importado a partir de agora nasce sem categoria de novo, e o backfill precisaria ser repetido manualmente. Ainda não corrigido nem decidido quando corrigir.

**Rodado em escala — modo universal, conta MAGAZINE (25/09, 11:31)**: `buscar_comissao_real_ml --empresa magazine`, sem `--produto`/`--mlb` (todas as variações relevantes pra precificação hoje, mesmo filtro do frete real) — **3.447 variações processadas**, **3.440 com sucesso (99,8%)**, 7 com erro, em 2.544,5s (~42,4 min); cache economizou 109 chamadas a `/items` (MLBs com 2+ variações). Recálculo automático ao final: **903 produtos e 218 categorias** tiveram a Comissão Média atualizada — confirma o mecanismo da seção 9 funcionando em escala real, não só no teste de 1 produto (seção 10 acima).

**Achado novo — 7 MLBs órfãos na Grade de Precificação**: os 7 erros foram todos HTTP 404 em `/items/{mlb}` (`"Item with id ... not found"`) — diferente de anúncio pausado/encerrado, que responde normalmente com outro `status`; 404 significa que o MLB não existe mais na API do Mercado Livre. Mesmo assim, essas 7 variações estão na `GradePrecificacaoML` (o filtro que define "relevante pra precificação hoje" no modo universal) — ou seja, são registros órfãos: a Grade aponta pra anúncios que já não existem mais do lado do ML. Comissão real anterior (se existia) foi mantida sem alteração nesses 7, por decisão já existente no comando (erro nunca apaga dado bom). MLBs: `MLB6311264476`, `MLB3807429869`, `MLB5936160538`, `MLB5302943576`, `MLB6610544062`, `MLB5517075890`, `MLB3429870359`. Não investigado se é limpeza de Grade necessária ou só uma sujeira pontual — registrado como achado, decisão de como tratar fica em aberto (ver Pendências).

## 11. Primeira Tela Implementada — Comissão Média da Categoria na Árvore de Categorias (25/09, 11:40)

**Contexto**: seção 9 deixou em aberto onde as médias apareceriam na tela — nenhuma fase de Planejar tinha começado. Achado ao investigar: a Tela de Árvore de Categorias (`mercado_livre/templates/mercado_livre/parciais/estrutura_parcial_detalhe_categoria.html`, ficha da categoria-folha) já tinha um bloco stub esperando exatamente esse dado — título "COMISSÃO APLICADA", texto "Ainda não coletada. Depende da integração com o cache de comissão real por categoria." e selo "Em breve". Não foi preciso desenhar nada do zero.

**Implementação — só template, sem view nem model**: `view_categorias_selecionar` já passava `categoria_atual` pro template como o objeto `CategoriaMercadoLivre` inteiro — os 4 campos de comissão média (seção 9) já chegavam prontos, só não eram lidos. Trocado o bloco stub por Clássico e Premium separados (cada um com % e tamanho da amostra), com estado "sem dado ainda" individual por tipo e um estado geral (reaproveitando o `.aviso-comissao`/`.selo-amarelo` que já existia) pra categoria sem nenhum dado. Título renomeado pra "COMISSÃO MÉDIA (API DO MERCADO LIVRE)" — o antigo "COMISSÃO APLICADA" dava a entender que é o valor usado no cálculo de preço, e não é (continua sendo só informativo, mesma decisão da seção 9).

**Validado com screenshot real por Matheus**: categoria Inseticidas (`MLB269721`) — Clássico 13,00% (21 anúncios), Premium 17,24% (21 anúncios). Amostra maior que o 2/2 do teste isolado da seção 10, porque agora reflete o snapshot da rodada universal inteira (218 categorias tocadas, seção 10) — o Premium inclusive mudou de 18,00% (só o produto de teste) pra 17,24% (todos os MLBs Premium da categoria), confirmando que a tela está lendo o dado certo, recalculado de verdade. Categoria não-folha (ex: "Casa, Móveis e Decoração", nível 1) seguiu o fluxo normal sem tentar mostrar o bloco — sem regressão.

**Segue em aberto**: o modal de Auditoria ML (Comissão Real por MLB + Comissão Média do Produto) — próxima tela a implementar, ainda não iniciada.

## 12. Segunda Tela Implementada — Comissão Real por MLB + Comissão Média do Produto no Modal de Auditoria ML (25/09, 12:00)

**Contexto**: seguindo a seção 11 (Comissão Média da Categoria, tela de Árvore de Categorias), faltava mostrar a Comissão Real por MLB (seção 8) e a Comissão Média do Produto (seção 9) — o outro lado registrado como pendência.

**Achado que facilitou**: `Produto.obter_dados_comissao()` já existia no model (`produtos/models/produto.py`), retornando `DadosComissaoProduto` (Clássico/Premium + amostra) — pronto, mas nunca chamado em lugar nenhum. Mesma situação da tela de Categoria (seção 11): plumbing pronta, só faltava ligar na tela.

**Implementação**: `DetalheFormulaExibida` (classe própria do ML em `precificacao/views/grade_mercado_livre.py`, não compartilhada com os outros 5 marketplaces) ganhou 4 campos novos (`comissao_real_percentual`, `comissao_real_atualizado_em`, `comissao_media_produto_percentual`, `comissao_media_produto_amostra`). No `montar()`, `variacao.comissao_real_percentual`/`.comissao_real_atualizado_em` são lidos da mesma `variacao` que já alimentava o `frete_real` (mesmo padrão, mesma fonte); a Comissão Média do Produto escolhe Clássico ou Premium de `obter_dados_comissao()` de acordo com `tipo_label` da linha auditada. No template (`estrutura_parcial_grade_detalhe.html`), o Passo 5 (Taxa) ganhou um bloco de comparação — reaproveitando as classes CSS `.frete-secao--real`/`.audit-frete-diferenca` que já existiam pro Frete Real (estilo genérico, só o nome vem de lá) — mostrando Comissão Real, quando buscada, Comissão Média do Produto e uma nota de "API real acima/abaixo da Comissão Aproximada". Só esse 1 arquivo de view + 1 de template — `DetalheFormulaExibida`/`montar_tabela_itens_agrupada` já eram exclusivos do ML, e o template funciona por acesso solto de atributo (`det.comissao_real_percentual` simplesmente não existe nos `det` dos outros 5 marketplaces, sem quebrar nada).

**Validado com screenshot real por Matheus, produto `F7898026081454.001`, os 2 tipos**:
- `MLB4597161489` (Clássico): Config 12,00% · API real 13,00% · Comissão Média do Produto (Clássico) 13,00% (2 anúncios) · "API real acima da Comissão Aproximada". Bate exato com os valores já confirmados na seção 10.
- `MLB4597084561` (Premium): Config 17,00% · API real 18,00% · Comissão Média do Produto (Premium) 18,00% (2 anúncios) · "API real acima da Comissão Aproximada". Também bate exato com a seção 10.

Com isso, as 3 camadas de exibição decididas na seção 9 (MLB real / média Produto / média Categoria) estão todas implementadas e validadas com dado real.

## 13. Por Que "Só Popular os Campos" Não É Trivial — Conflito com o Cache de Assinatura (25/09, 14:30)

**Contexto**: retomando a única pendência real que sobrou (seção 12 fechou a exibição; falta só a integração na fórmula) — fui direto no código pra montar as opções de diff, antes de levar decisão pro Matheus, mesmo padrão de rigor já usado nas seções anteriores.

**Confirmado por leitura direta — comissão hoje entra na fórmula em 1 lugar só**: `FormulaPrecificacao.montar_taxa_e_denominador()` (`precificacao/funcoes_auxiliares/mercado_livre/formula_precificacao.py`, linha 289) lê `self._comissao_percentual = self.config_tipo.comissao` — sempre o flat da config, nunca a Comissão Real. Esse valor vira parte de `taxa_percentual`, que define `denominador`, que resolve o preço inteiro dentro do goal-seek (`resolver_preco_por_margem`) — não é um ajuste cosmético isolado, é a taxa que entra na busca de preço.

**Confirmado que `comissao_calculada`/`origem_comissao` não são gravados em nenhum lugar**: `_registrar_linhas` (`calcular_grade_precificacao_ml.py`) só grava `preco, margem_percentual_obtida, frete_usado, origem_dimensao, detalhamento` — os 2 campos de comissão não estão no dict nem na lista `campos_atualizaveis` do `bulk_update`. Mesmo diagnóstico do Frete Real (`frete_calculado`/`origem_frete` também nunca são gravados, apesar do comentário do model descrever a intenção — achado já registrado na seção 9).

**Achado novo, não estava mapeado antes**: o comentário do próprio model deixa claro que `comissao_calculada` deve representar "o valor que a fórmula **de fato usou**" — não é um campo de comparação passiva (isso já existe e já está implementado: `comissao_real_percentual` no modal de Auditoria, seção 12). Preencher `comissao_calculada`/`origem_comissao` de forma honesta exige que a Comissão Real **efetivamente entre no cálculo do preço** — não dá pra popular os campos sem resolver a pergunta de fundo primeiro.

**O problema de arquitetura que isso expõe**: `_calcular_ou_reaproveitar()` (`calcular_grade_precificacao_ml.py`) cacheia 1 `FormulaPrecificacao` por **assinatura de dimensão** (altura/largura/comprimento/peso/origem) e reaproveita o mesmo resultado pra **qualquer** variação (MLB) que caia na mesma assinatura — hoje isso é seguro porque comissão é só função de `tipo_anuncio` (2 valores fixos, iguais pra todo mundo com a mesma dimensão). Se a Comissão Real entrar no cálculo, 2 MLBs com a mesma caixa/peso mas comissão real diferente — a seção 7 já provou que isso acontece em 50% da amostra — receberiam hoje o **mesmo preço calculado**, incorretamente, porque o cache nunca olha qual MLB está sendo processado, só a dimensão.

**3 caminhos possíveis, mapeados mas nenhum escolhido**:

1. **Comissão entra na chave do cache** (assinatura passa a incluir o percentual de comissão usado). Correto, mas reduz a taxa de reaproveitamento do cache — quanto, não foi medido; depende de quantos MLBs distintos hoje compartilham a mesma dimensão física.
2. **Cache só pra quem usa fallback de config**; variação com `comissao_real_percentual` preenchido sempre recalcula fresco, nunca entra no cache. Equilíbrio entre correção e performance, mas a lógica de cache passa a ter 2 caminhos diferentes.
3. **Cache continua como está** (goal-seek roda só com a comissão de config, sem mudar), e a Comissão Real entra como uma **correção aplicada em cima do preço já resolvido**, fora do goal-seek. Mais barato de rodar, mas muda o que `resolvida`/`denominador` significam de fato, e precisa provar que não quebra a garantia de margem do RoundUp90 (mesma classe de risco já registrada em "Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90").

**Por que nenhum diff foi aplicado ainda**: isso muda o preço calculado de fato pro catálogo inteiro (não é só exibição, diferente das seções 11/12) — e o formato de decisão já estabelecido nesta frente (seção 9: "pensar antes de codar, sem gerar código nessa etapa") se aplica aqui com ainda mais peso. Decisão de Matheus antes de qualquer diff ser efetivamente escrito ou aplicado no repo.

## Pendências / próximos passos

- **Decisão de arquitetura — a única pendência real que falta (achado 25/09, seção 13).** 3 caminhos técnicos mapeados (chave de cache / bypass seletivo de cache / correção pós-goal-seek), nenhum escolhido — depende de decisão de Matheus, não é uma questão técnica. Ver seção 13 pro detalhe de cada opção e o porquê do conflito com o cache de assinatura.
- **7 MLBs órfãos na `GradePrecificacaoML` (achado 25/09, seção 10)** — existem na Grade local mas devolvem 404 na API do ML (não pausados/encerrados, removidos de verdade). Lista completa na seção 10. Não decidido se precisa de limpeza automática da Grade ou é caso pontual.
- **Persistir `categoria_id` no pipeline regular de importação (achado 25/09, seção 10).** `importar_anuncios_ml.py` não grava esse campo — o backfill que levou 98,3% da base a ter categoria foi pontual, fora do pipeline. Sem correção permanente ali, todo MLB novo importado nasce sem categoria de novo, exigindo repetir o backfill manualmente.
- ~~Onde as médias aparecem na tela~~ — **feito (25/09, seções 11 e 12).** Comissão Média da Categoria na tela de Árvore de Categorias, Comissão Real por MLB + Comissão Média do Produto no modal de Auditoria ML. As 3 camadas de exibição (seção 9) implementadas e validadas com dado real.
- **Mesmo exercício conceitual ainda não feito pro Frete Real** — "o que é o dado + o que o usuário quer fazer com ele", que gerou a seção 9 desta nota pra Comissão, ainda não foi repetido pro Frete Real (registrado em 25/09, junto com a seção 9).
- **Ampliar a amostra e/ou testar a conta SV** — 30 candidatos foi só a 1ª bateria (conta MB). Uma amostra maior, e testar SV também, daria mais confiança no tamanho real do gap antes de qualquer decisão.
- **Investigar se a divergência é mesmo por categoria** — a seção 7 observou que não é um corte limpo por faixa de preço, mas não isolou `category_id` como causa confirmada. A Comissão Média da Categoria (seção 9), quando implementada, passa a servir esse propósito continuamente — mas a investigação ad-hoc em si (logar `category_id` por candidato num script) não foi feita.
- **Como lidar com o valor não sendo cacheável com confiança** — a doc (seção 3) avisa que o mesmo produto pode ter comissão diferente em momentos distintos; a bateria da seção 7 só testou estabilidade em segundos, não em dias/semanas. Evidência concreta e numerada (seção 8, caso MLB6228114400): a comissão mudou de 14% pra 13,85% só porque o preço do anúncio mudou entre a chamada da API e o print do simulador. O mecanismo de recálculo decidido na seção 9 resolve a frescor das MÉDIAS (produto/categoria), mas não resolve a frescor do dado-folha (comissão real de 1 MLB específico) — a ideia do botão de atualização que Matheus trouxe separadamente (forçar rebusca antes de calcular preço) continua distinta e ainda não investigada nem decidida.
- ~~Obter doc oficial de Billing/Provisões~~ — **fora de escopo desde 23/09, 15:45** (seção 6): não é mais necessário, o objetivo é só a estimativa pré-venda.
- ~~Confirmar se `sale_fee` (Orders) é "por unidade"~~ — **fora de escopo desde 23/09, 15:45** (seção 6): campo de comissão pós-venda, não usado pra precificação.
- ~~Avaliar `marketplace_fee` como validação cruzada~~ — **fora de escopo desde 23/09, 15:45** (seção 6): mesmo motivo, é campo de Orders (pós-venda).
- ~~Mapear gatilho de `funding_mode == "sale_fee"`~~ — **fora de escopo desde 23/09, 15:45** (seção 6): mesmo motivo.

## Relacionado

- [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]] (seção 9 confirma os percentuais de comissão Clássico 10–14% / Premium 15–19%, via doc oficial "Costos de Venta" — contexto direto pra esta investigação)
