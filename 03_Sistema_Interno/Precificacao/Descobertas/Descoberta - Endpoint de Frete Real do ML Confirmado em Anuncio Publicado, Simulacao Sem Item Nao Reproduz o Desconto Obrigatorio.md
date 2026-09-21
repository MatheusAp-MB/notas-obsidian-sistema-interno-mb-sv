---
tipo: descoberta
dominio: python
status: em_andamento
criado: 21/09/2026
atualizado_em: 21/09/2026 16:01
relacionado: [Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]
---

# Descoberta - Receita Validada para Reproduzir o Frete Real do ML via Simulação Sem Item Publicado (Funciona 100% Acima de R$79, Limitação Confirmada Abaixo Disso)

**Resumo**: Continuação da investigação sobre substituir o cálculo interno de frete (tabela peso×preço) pelo valor real da API do Mercado Livre. Depois da descoberta inicial (nota original, agora superada), foram feitos testes sistemáticos — cenários isolados, matriz de 16 combinações e, por fim, validação completa contra a tabela real de frete (30 faixas de peso × 8 faixas de preço) usando o item MLB5838465508 (FULL, conta MB). Resultado: existe uma receita de parâmetros que reproduz o frete real EXATAMENTE, via simulação sem `item_id`, mas só funciona no regime de preço ≥ R$79. Abaixo disso a simulação não bate com a tabela — e a empresa TEM produtos nessa faixa de preço, então isso é uma limitação real pro plano, não teórica.

## Receita validada (funciona para item_price ≥ R$79)

Endpoint: `GET /users/{user_id}/shipping_options/free`

Parâmetros, sem passar `item_id`:

- `dimensions`: usar as medidas da **"Embalagem de envio"** (não da "Embalagem de fábrica") — formato `LxAxCx,PESOg` com peso em **gramas, inteiro** (não kg)
- `item_price`: preço do produto
- `verbose`: true
- `condition`: igual ao do anúncio real
- `category_id`: igual ao do anúncio real
- `listing_type_id`: igual ao do anúncio real
- `mode`: me2
- `free_shipping`: true ou false — **sem efeito numérico** dentro do mesmo regime de desconto
- **NÃO passar `logistic_type`** — mesmo o item sendo FULL de verdade

Com esses parâmetros, `list_cost`, `billable_weight` e o bloco `discount` (rate/type/promoted_amount) batem exatamente com o Resumo de Custos real do anúncio publicado.

### Por que cada peça importa (histórico do teste)

- **Embalagem de envio vs. fábrica**: são dimensões diferentes no mesmo anúncio (ex.: fábrica 56x42x25cm/6,82kg vs. envio 56x41x23cm/6,84kg) — só a de envio reproduz o valor certo.
- **Omitir `logistic_type`**: testado explicitamente na matriz de 16 combinações. Passar `logistic_type=fulfillment` infla o `billable_weight` pra 14823g, **independente** de qual dimensão é usada (fábrica ou envio deram o mesmo valor inflado) — ou seja, a dimensão informada é ignorada/sobrescrita por outro cálculo interno do ML quando esse parâmetro é declarado numa chamada sem item_id. Omitir o parâmetro resolve.
- **`billable_weight` = MAX(peso declarado, peso cúbico)**: peso cúbico = (L×A×C em cm) ÷ 6000. Confirmado no Cenário C1 (peso declarado 5000g > cúbico 4000g → billable ficou 5000g).
- **Peso em gramas, não kg**: confirmado via FAQ oficial do ML ("Mercado Envios — Custos e cotações"): "O peso em dimensions deve ser passado em gramas como inteiro". Um bug de unidade anterior (peso lido como ~5g em vez de 5000g) tinha causado uma falsa anomalia investigada e descartada.
- **`item_price` e `free_shipping` não mudam o valor numérico** dentro do mesmo regime de desconto — testado e confirmado na matriz de 16 combinações (preços 447 e 378,90, ambos "mandatory", deram resultado idêntico).

## Documentação oficial que confirma o comportamento

- `mandatory_free_shipping` (tag em `GET /items/{item_id}` → `shipping.tags`): "Se indicar 'mandatory_free_shipping' significa que o item superou o limite de preço estabelecido pelo Mercado Livre [...] Em contraste, para produtos com preço abaixo desse limite, o envio gratuito é opcional." Exclusivo de ME2.
- Estrutura de faixas de preço (vendedores.mercadolivre.com.br — "Como os envios do Mercado Livre funcionam"): abaixo de R$19 (ou usado) é opcional, vendedor paga tudo se oferecer; de R$19 a R$78,99 o comprador recebe grátis e o ML paga o custo todo; a partir de R$79 o vendedor oferece grátis e paga com desconto de até 70% OFF.
- Página específica do Full ("O que é o Full e quais vantagens oferece"): "cobrimos 50% do frete grátis dos seus produtos a partir de R$79" — bate exatamente com todos os testes `mandatory` feitos, que sempre deram `rate: 0.5` a partir de R$79, independente do valor exato acima disso.
- `POST/GET /shipments/{shipment_id}/costs` (doc "Gerenciamento de envios", atualizada 18/09/2026): endpoint de custo real PÓS-VENDA (diferente da simulação pré-venda usada aqui). Requer header `x-format-new: true`. Resposta: `{gross_amount, receiver:{user_id,cost,compensation,save,discounts[]}, senders:[{...}]}`. Não precisa de `pack_id` (diferente de `/payments`). Exemplo oficial também mostra `discounts[].type: "mandatory"`. **Ainda não testado com dado real** — precisa de um `shipping_id` de venda real que ainda não foi informado.

## Validação final contra a tabela real de frete

Planilha real da empresa (`Tabela_Frete_Mercado_Livre.xlsx`, 30 faixas de peso × 8 faixas de preço) usada como fonte de verdade. Script rodou 3 partes, todas usando a receita acima, contra o item MLB5838465508:

### Parte 1 — preço fixo (R$378,90, faixa "A partir de R$200"), percorrendo as 30 faixas de peso
**30/30 bateram.** Confirma 100% que a receita reproduz a tabela real da empresa em toda a faixa de peso, quando o preço está no regime "mandatory" (≥R$79).

### Parte 2 — peso fixo (8,5kg), percorrendo as 8 faixas de preço
**5/8 bateram.** As 3 falhas foram exatamente nos preços R$15, R$35 e R$65 — todos abaixo de R$79.

### Parte 3 — 6 combinações aleatórias do meio da tabela
**4/6 bateram.** As 2 falhas também caíram em preços abaixo de R$79 (R$65 e R$15, em faixas de peso diferentes).

## Limitação confirmada: preço abaixo de R$79

Em **todas as 5 falhas**, sem exceção:
- `discount.type` veio `"fs_optional"` em vez de `"mandatory"`
- `list_cost` retornado não bate com o valor da tabela pra aquela combinação peso×preço

Detalhe que ainda não foi explicado: na Parte 2, os três testes abaixo de R$79 (R$15, R$35 e R$65) retornaram **o mesmo valor exato** — `list_cost: 30.25` e `promoted_amount: 60.5` — idêntico ao resultado do teste de R$90 (que passou, no regime mandatory). Não parece ser um "sem desconto, frete cheio" — parece algum piso/valor default aplicado pela API abaixo do limiar de R$79, ainda não diagnosticado.

**Confirmado com Matheus (21/09, 16:01): a empresa TEM produtos precificados abaixo de R$79 no ML** — então essa não é uma limitação teórica, afeta parte real do catálogo e precisa ser resolvida antes de qualquer substituição ampla do cálculo interno.

## Impacto no plano

- **Para item_price ≥ R$79**: receita validada e pronta — reproduz a tabela interna da empresa com exatidão total (30/30). Pode ser usada com confiança pra substituir o cálculo interno de frete nessa faixa, uma vez que Matheus confirme a implementação.
- **Para item_price < R$79**: a simulação sem item_id, com a receita atual, **não** reproduz o valor real — usar como está nessa faixa geraria custo de frete errado. Precisa de investigação adicional antes de entrar em produção pra esses produtos.
- A ideia original de "calculadora de frete" (produto ainda não publicado) segue tecnicamente viável pra ≥R$79, mas incompleta pra <R$79 até resolver a limitação acima.

## Próximos passos (pendentes, não iniciados)

- Investigar o regime abaixo de R$79 especificamente — entender por que `discount.type` cai pra `"fs_optional"` e de onde vem o valor fixo/repetido observado na Parte 2, testando outras combinações de parâmetros pra tentar reproduzir as faixas "R$19 a R$48,99", "R$49 a R$78,99" e "R$0 a R$18,99" da tabela real
- Só depois disso, com confirmação explícita de Matheus: planejar como (e se) a receita substitui o cálculo interno de frete usado em `calcular_grade_precificacao_*.py`/`formula_precificacao_*.py`/`goal_seek.py`, cobrindo toda a faixa de preço do catálogo real (incluindo os itens abaixo de R$79)
- Testar o endpoint pós-venda `/shipments/{id}/costs` com um `shipping_id` real, quando Matheus tiver um caso concreto pra passar

## Relacionado

- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
