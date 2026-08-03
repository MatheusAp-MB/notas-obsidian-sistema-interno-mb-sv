---
tipo: duvida
dominio: 
status: ativa
criado: 11/07/2026
relacionado: [Preco Alvo E Rebate Disponiveis Antes De Ativar Promocao, Classificacao De Promocoes Com Rebate Vs Sem Rebate, Boosted Offer Nunca Confirmado Na Pratica]
---

# Mecanismo Contábil do Rebate Clássico Não É Garantido pela Documentação

A fórmula de precificação usada na prática (validada pelo dono do
negócio) trata o rebate clássico (`meli_percentage`) como um valor que
**abate diretamente da comissão paga ao Mercado Livre**:
(preço_de_venda × taxa_comissão) − (original_price × meli_percentage/100) = valor pago ao ML

Essa fórmula bate matematicamente com os valores finais já confirmados
(ex: `MLB4959724082`, resultado líquido de R$ 123,00 nos dois modos de
cálculo). **Mas a documentação oficial não afirma explicitamente esse
mecanismo contábil para o rebate clássico.**

## O que a documentação realmente diz, para cada mecanismo

**Mecanismo clássico** (`meli_percentage`/`seller_percentage` —
usado em `SMART`, o único com dado real confirmado nesta conta):

> "A principal característica desse tipo de campanha é que o Mercado
> Livre paga um percentual do desconto oferecido."

Texto genérico — diz que o ML "paga um percentual do desconto", mas não
especifica que isso acontece via redução da comissão/taxa.

**Mecanismo novo (`boosted_offer`, 2026)** — este sim tem texto
explícito sobre custo/comissão:

> "O valor do desconto é compensado como uma redução equivalente nos
> custos por venda."

## O ponto central da dúvida

A garantia textual explícita de "isso abate do custo/comissão" existe
**para o mecanismo `boosted_offer`, que nunca foi observado na prática
nesta conta** (ver [[Boosted Offer Nunca Confirmado Na Pratica]]) — não
para o mecanismo clássico, que é o único com uso real confirmado (82
casos).

## Por que isso não invalida a fórmula em uso

A fórmula é validada por conhecimento prático de negócio (o dono da
operação já vê o resultado financeiro real caindo na conta) — é uma
fonte de certeza diferente e válida, só não é a mesma coisa que "a
documentação da API garante isso por escrito". Vale manter os dois
registros separados: o que a prática confirma vs o que o texto oficial
afirma.

## Como resolver quando for retomado

Se algum dia for possível acessar um relatório financeiro/de vendas real
com detalhamento de comissão por venda, comparar o valor de comissão
efetivamente cobrado numa venda com rebate contra o calculado pela
fórmula — isso confirmaria (ou refutaria) o mecanismo contábil exato com
prova documental própria, não só o texto da API.

## Relacionado

- [[Preco Alvo E Rebate Disponiveis Antes De Ativar Promocao]]
- [[Classificacao De Promocoes Com Rebate Vs Sem Rebate]]
- [[Boosted Offer Nunca Confirmado Na Pratica]]