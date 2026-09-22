---
tipo: descoberta
dominio: python
status: resolvido
criado: 21/09/2026
atualizado_em: 22/09/2026 14:17
relacionado: [Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML, Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT), Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]
---

# Descoberta - Receita Validada para Reproduzir o Frete Real do ML via Simulação Sem Item Publicado (Confirmada em Toda a Faixa de Preço)

**Resumo**: Continuação da investigação sobre substituir o cálculo interno de frete (tabela peso×preço) pelo valor real da API do Mercado Livre. Depois da descoberta inicial (nota original, agora superada), foram feitos testes sistemáticos — cenários isolados, matriz de 16 combinações e, por fim, validação completa contra a tabela real de frete (30 faixas de peso × 8 faixas de valor) usando o item MLB5838465508 (FULL, conta MB). Resultado original: existe uma receita de parâmetros que reproduz o frete real EXATAMENTE, via simulação sem `item_id`, mas só funcionava no regime de preço ≥ R$79. Em 22/09 a causa raiz da falha abaixo de R$79 foi identificada (`free_shipping` precisa ser `"false"`) e confirmada com revalidação completa das 3 partes originais — ver seção "Resolução (22/09, 12:32)" e "Confirmação Final (22/09, 14:17)" abaixo. A revalidação também revelou e corrigiu uma segunda regra (teto de metade do preço pra item_price < R$19), fechando a receita em 44/44 casos testados.

## Receita validada (funciona pra qualquer item_price)

Endpoint: `GET /users/{user_id}/shipping_options/free`

Parâmetros, sem passar `item_id`:

- `dimensions`: usar as medidas da **"Embalagem de envio"** (não da "Embalagem de fábrica") — formato `LxAxCx,PESOg` com peso em **gramas, inteiro** (não kg)
- `item_price`: preço do produto
- `verbose`: true
- `condition`: igual ao do anúncio real
- `category_id`: igual ao do anúncio real
- `listing_type_id`: igual ao do anúncio real
- `mode`: me2
- `free_shipping`: **sempre `"false"`** — dentro do regime ≥R$79 não faz diferença numérica (testado), mas abaixo de R$79 é obrigatório ser `"false"`, senão a API cota o frete rápido opcional em vez do frete padrão (ver Resolução abaixo).
- **NÃO passar `logistic_type`** — mesmo o item sendo FULL de verdade
- Pro **cálculo do valor esperado** (não é parâmetro da chamada, é regra de negócio pra comparar o resultado): item_price < R$19 → o custo real é `min(valor_da_tabela, item_price / 2)` — ver "teto de metade do preço" na Confirmação Final abaixo.

Com esses parâmetros, `list_cost`, `billable_weight` e o bloco `discount` (rate/type/promoted_amount) batem exatamente com o Resumo de Custos real do anúncio publicado.

### Por que cada peça importa (histórico do teste)

- **Embalagem de envio vs. fábrica**: são dimensões diferentes no mesmo anúncio (ex.: fábrica 56x42x25cm/6,82kg vs. envio 56x41x23cm/6,84kg) — só a de envio reproduz o valor certo.
- **Omitir `logistic_type`**: testado explicitamente na matriz de 16 combinações. Passar `logistic_type=fulfillment` infla o `billable_weight` pra 14823g, **independente** de qual dimensão é usada (fábrica ou envio deram o mesmo valor inflado). Omitir o parâmetro resolve. (A doc oficial de "Custos de envio" lista `logistic_type` como parâmetro aceito — a doc não desaconselha usá-lo. Esse é um comportamento real do endpoint que contraria o que a doc sugeriria como uso "correto", não um erro nosso de uso.)
- **`billable_weight` = MAX(peso declarado, peso cúbico)**: peso cúbico = (L×A×C em cm) ÷ 6000. Confirmado tanto no Cenário C1 original quanto de novo em 22/09 com o Chinelo (peso declarado 601g, cúbico 2366g → billable retornado 2366g).
- **Peso em gramas, não kg**: confirmado via FAQ oficial do ML.
- **`item_price` não muda o valor numérico** dentro do mesmo regime de desconto (≥R$79) — testado e confirmado na matriz de 16 combinações.
- **`free_shipping`**: sem efeito dentro do regime ≥R$79 — mas isso é específico desse regime, ver Resolução abaixo.

## Documentação oficial que confirma o comportamento

- `mandatory_free_shipping` (tag em `GET /items/{item_id}` → `shipping.tags`): "Se indicar 'mandatory_free_shipping' significa que o item superou o limite de preço estabelecido pelo Mercado Livre [...] Em contraste, para produtos com preço abaixo desse limite, o envio gratuito é opcional." Exclusivo de ME2.
- Estrutura de faixas de preço (vendedores.mercadolivre.com.br — "Como os envios do Mercado Livre funcionam"): abaixo de R$19 (ou usado) é opcional, vendedor paga tudo se oferecer; de R$19 a R$78,99 o comprador recebe grátis e o ML paga o custo todo; a partir de R$79 o vendedor oferece grátis e paga com desconto de até 70% OFF.
- **"Custos dos Envios no Mercado Livre para MercadoLíder, reputação verde ou sem reputação"** (Central de Ajuda do vendedor — página HTML colada por Matheus em 22/09): confirma TUDO isso com números. Ver seção Resolução abaixo — é a peça que faltava.
- `POST/GET /shipments/{shipment_id}/costs` (doc "Gerenciamento de envios"): endpoint de custo real PÓS-VENDA (diferente da simulação pré-venda usada aqui). Ainda não testado com dado real.

## Validação final contra a tabela real de frete (com `free_shipping="true"`, receita original)

Planilha real da empresa (`Tabela_Frete_Mercado_Livre.xlsx`, 30 faixas de peso × 8 faixas de preço) usada como fonte de verdade. Script rodou 3 partes contra o item MLB5838465508:

### Parte 1 — preço fixo (R$378,90, faixa "A partir de R$200"), percorrendo as 30 faixas de peso
**30/30 bateram.**

### Parte 2 — peso fixo (8,5kg), percorrendo as 8 faixas de preço
**5/8 bateram.** As 3 falhas: R$15, R$35 e R$65 — todas abaixo de R$79.

### Parte 3 — 6 combinações aleatórias do meio da tabela
**4/6 bateram.** As 2 falhas também abaixo de R$79.

Em todas as falhas: `discount.type` vinha `"fs_optional"` em vez de `"mandatory"`, e `list_cost` não batia com a tabela.

## Continuação (22/09, manhã) — Pesquisa Externa GPT + Confirmação Oficial dos Parâmetros do Endpoint

O GPT apontou que `GET /users/{user_id}/shipping_options/free` documenta parâmetros não usados na receita original: `seller_status`, `seller_type`, `reputation` (entre outros irrelevantes pro caso: `currency_id`, `variation_id`, `tags`, `state_id`, `city_id`, `zip_code`). Confirmado oficialmente via doc "Custos de envio" (HTML colado por Matheus) — tabela real "Parâmetros de consulta aceitáveis" lista os 3 com descrição e exemplo. Formato do `GET /users/{user_id}` → `seller_reputation.level_id` (`"5_green"`) e `power_seller_status` (`"platinum"`/`"gold"`/`"silver"`/null) também confirmado oficialmente (docs "Reputação de vendedores" e "Consulta de usuários"). `reputation` do endpoint de frete espera só a cor (`green`), não o `level_id` inteiro.

## Resolução (22/09, 12:32) — Eliminação de reputation/seller_status/seller_type e causa raiz encontrada: `free_shipping`

### Achado 1: a conta MB é Loja Oficial

Confirmado via `GET /users/{user_id}/brands` (retornou `status: LINKED`, `official_store_id: 5481`, marca "Magazine Brasileiro"). Não achamos documentação do valor de `seller_type` pra esse caso (a doc só documenta o exemplo `"normal"`, que é o caso não-oficial) — script rodou sem enviar esse parâmetro nas rodadas de teste com valores reais, e depois com um valor especulativo não documentado (`"eshop"`, achado como tag da conta) só pra teste isolado.

### Achado 2: reputation, seller_status e seller_type(especulativo) — ZERO efeito, eliminados com evidência forte

Rodado um script de teste (`scripts_exploracao_ML/investigar_reputacao_seller_status_abaixo_79.py`) nos 3 casos que falham (R$15/R$35/R$65), em 5 variantes cada (baseline / +reputation / +reputation+seller_status / +seller_type especulativo isolado / tudo junto), em **2 faixas de peso diferentes** (caixa sintética 5x5x5cm/8500g, e dimensões reais do Chinelo F7899947307029.001 — 13x28x39cm/601g declarado, 2366g cúbico) — 30 chamadas no total. Resultado: **discount.type, list_cost, promoted_amount e billable_weight idênticos em TODAS as variantes**, dentro de cada faixa de peso — reputation `green` e seller_status `platinum` (os melhores valores possíveis da conta) não mudaram nada. `seller_type="eshop"` (especulativo) também não mudou nada, isolado ou combinado.

Isso também descartou a hipótese de que a **caixa sintética 5x5x5cm** (usada nos scripts pra testar qualquer peso sem precisar de 30 produtos reais) estivesse distorcendo o teste — o mesmo padrão apareceu idêntico com as dimensões reais do Chinelo.

### Achado 3: o padrão do valor "piso" — bate exato com a coluna R$79-99,99 da mesma faixa de peso

Os `list_cost` retornados abaixo de R$79 não eram aleatórios: batiam exatamente com a coluna "R$79 a R$99,99" da `TABELA_FRETE`, na MESMA faixa de peso testada — `De 8 a 9 kg` → R$30,25 (= `TABELA_FRETE["De 8 a 9 kg"].precos[3]`); `De 2 a 3 kg` → R$16,45 (= `TABELA_FRETE["De 2 a 3 kg"].precos[3]`). Confirmado nas 2 faixas de peso testadas.

### Achado 4: a causa raiz — doc oficial de custos pro vendedor tem 2 tabelas diferentes abaixo de R$79

Matheus colou o HTML da página "Custos dos Envios no Mercado Livre para MercadoLíder, reputação verde ou sem reputação" (Central de Ajuda do vendedor). Ela tem **2 tabelas**:

1. **"Custos dos Envios no Mercado Livre"** (8 colunas de preço, R$0-18,99 até "a partir de R$200") — conferida célula por célula: é **exatamente** a `TABELA_FRETE` já usada no sistema. Confirma que a tabela local sempre esteve certa.
2. **"Custos por oferecer frete grátis rápido para produtos abaixo de R$79 (opcional)"** — 1 coluna só (R$0-78,99). Pro vendedor que OPTA por oferecer frete rápido (tipo Full) mesmo abaixo de R$79 (opcional — o padrão nessa faixa já é grátis pro comprador, pago pelo ML). **Os valores dessa tabela batem exatamente com o "piso" do Achado 3** (`De 8 a 9 kg` = R$30,25, `De 2 a 3 kg` = R$16,45 — idênticos).

Ou seja: o endpoint sem `item_id`, abaixo de R$79, não estava devolvendo um valor genérico — estava devolvendo o custo real do **frete rápido opcional**, uma modalidade comercial diferente da que o item realmente usaria por padrão.

### Achado 5 (o fix): `free_shipping="false"` resolve — 6/6 bateram exato

Hipótese: `free_shipping="true"` (fixo na receita original) fazia a API assumir que o vendedor tinha optado pelo modo rápido. Testado `free_shipping="false"` nos mesmos 3 preços × 2 faixas de peso (6 chamadas): **100% bateram, exato, sem precisar nem da tolerância de R$0,02**:

| Faixa de peso | R$15 | R$35 | R$65 |
|---|---|---|---|
| De 8 a 9 kg (caixa sintética) | 6.95 ✓ | 9.35 ✓ | 10.65 ✓ |
| De 2 a 3 kg (Chinelo) | 6.35 ✓ | 8.65 ✓ | 9.15 ✓ |

`discount.type` também mudou de `"fs_optional"` pra `"none"` (sem desconto — faz sentido, é o ML que paga integralmente o frete padrão nessa faixa).

## Confirmação Final (22/09, 14:17) — Revalidação Completa 44/44 e Descoberta do Teto de Metade do Preço

### Revalidação completa com `free_shipping="false"` como parâmetro universal

Rodado `investigar_frete_validacao_tabela_completa.py` (as 3 partes originais, 44 casos) com `free_shipping` trocado de `"true"` pra `"false"` em `montar_params()`. Primeira rodada: **43/44** — a única falha foi "De 40 a 50 kg x R$0-18,99" (peso 45.000g, item_price R$15,00): tabela esperava R$7,95, API retornou R$7,50.

### Achado 6: teto de metade do preço pra item_price < R$19

R$15,00 ÷ 2 = **R$7,50** — exatamente o valor retornado pela API. É a regra do rodapé da tabela principal do doc "Custos dos Envios no Mercado Livre para MercadoLíder...", já citado no Achado 4: *"Os produtos de menos de R$19 pagam no máximo metade do preço do produto."* Como o valor nominal da tabela (R$7,95) era maior que a metade do preço (R$7,50), o teto entrou em ação. Em todos os outros casos testados com preço <R$19, o valor nominal já era menor que a metade do preço, então o teto nunca precisou agir — por isso passou despercebido até esse caso específico (peso pesado + preço muito baixo).

O script de validação foi ajustado (`aplicar_teto_produtos_baratos()`, usado dentro de `avaliar_resposta()`) pra calcular o valor esperado como `min(valor_nominal_tabela, item_price / 2)` quando `item_price < 19`, em vez do valor bruto da tabela. Rodando de novo: **44/44 — 100%** nas 3 partes (30/30 peso, 8/8 preço, 6/6 combinações mistas), sem nenhuma regressão nos casos que já bateram antes (incluindo todos os preços ≥R$79 em pesos nunca testados antes na etapa amostral).

### Gap encontrado no código de produção (NÃO implementado, decisão pendente)

O teto de metade do preço **não existe hoje** na lógica de produção que consulta `FreteML`:

- `precificacao/funcoes_auxiliares/mercado_livre/formula_precificacao.py` → `filtrar_faixas_frete()`: filtra só por peso.
- `precificacao/funcoes_auxiliares/goal_seek.py` (linha ~80): usa `faixa.valor` bruto, sem `min(frete, item_price/2)`.
- `mercado_livre/funcoes_auxiliares/calculo_margem.py` → `buscar_frete()`: mesmo lookup direto, sem ajuste.
- Model `FreteML`: puramente tabela de lookup (`peso_min/max`, `preco_min/max`, `valor`), nenhum campo depende de `item_price` além de escolher a coluna.

Risco real: se algum produto do catálogo for pesado E vendido por menos de R$19, o goal-seek (Opção 1) calcularia um frete mais caro do que o ML realmente cobra. Ainda sem confirmação se isso é cenário plausível no catálogo de MB/SV — pendente de resposta do Matheus.

### Conclusão

A receita (`free_shipping="false"` + o teto de metade do preço na comparação) está validada 100% em toda a tabela de frete, sem exceção. A limitação original ("Opção 2 só funciona ≥R$79") deixou de existir. Isso muda a base da decisão de arquitetura registrada em [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]] — ver pendências lá.

## Impacto no plano (atualizado 22/09, 14:17 — confirmado, revalidação completa)

- **Para qualquer item_price**: receita validada 44/44 (30 faixas de peso, 8 faixas de preço, 6 combinações mistas), incluindo o teto de metade do preço pra item_price < R$19.
- A limitação que motivava manter a Opção 1 (tabela local) como único caminho confiável abaixo de R$79 **deixou de existir** — a Opção 2 (API) cobre a faixa de preço inteira, com `free_shipping="false"`.
- Novo ponto de atenção: a Opção 1 (tabela local) tem um gap que a Opção 2 (API) não tem — não aplica o teto de metade do preço pra item_price < R$19 (ver Achado 6 acima). Isso é um argumento a favor de dar mais peso à Opção 2, mas depende de confirmar se é cenário real no catálogo.

## Próximos passos (pendentes)

- Rediscutir com Matheus se a confirmação completa muda a decisão "Opção 1 + Opção 2 em paralelo" da Frente A pra "só Opção 2, com o parâmetro certo" (ou se as 2 continuam em paralelo por outro motivo) — ver [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]].
- Confirmar com Matheus se o gap do teto de metade do preço (Achado 6) é risco real pro catálogo de MB/SV (produto pesado + preço <R$19) — se sim, decidir se vale corrigir `FreteML`/`goal_seek.py`/`calculo_margem.py` pra aplicar o mesmo teto.
- Testar o endpoint pós-venda `/shipments/{id}/costs` com um `shipping_id` real, quando Matheus tiver um caso concreto pra passar.

## Relacionado

- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
- [[Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT)]]
- [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]]
