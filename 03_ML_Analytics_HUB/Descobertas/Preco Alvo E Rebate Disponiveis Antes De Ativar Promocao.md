Caminho:
03_ML_Analytics_HUB\Descobertas\Preco Alvo E Rebate Disponiveis Antes De Ativar Promocao.md
markdown---
tipo: descoberta
dominio: python
status: ativa
criado: 11/07/2026
relacionado: [Classificacao De Promocoes Com Rebate Vs Sem Rebate, Mapa Completo Do Endpoint Promocoes Por Item]
---

# Preço-Alvo e Rebate Disponíveis Antes de Ativar a Promoção

Para promoções que têm rebate do ML (`meli_percentage` presente), o
preço-alvo (`price`) e os percentuais de rebate já vêm **100%
preenchidos mesmo em `status: candidate`** — ou seja, antes do vendedor
sequer ativar a participação. Isso significa que é possível saber de
antemão "venda a R$ X e ganhe Y% de rebate do ML" sem nenhum compromisso.

## Motivação de negócio

Essa informação é essencial para uma fórmula de precificação já validada
e em uso, que calcula margem de lucro real a partir do preço (e
vice-versa). O rebate do ML precisa entrar nesse cálculo — mas só é útil
se puder ser consultado **antes** de decidir participar da promoção, não
só depois.

## Evidência real (confirmação em escala, não só 1 exemplo)

Testado contra as 82 promoções com rebate presentes na amostra:
Em status 'candidate' (ainda não ativado):
Com preço-alvo + rebate completos: 45
Sem price válido: 0
Sem meli_percentage: 0
Em status 'started' (já ativado):
Com preço-alvo + rebate completos: 37

**100% dos 82 casos (45 candidate + 37 started) têm o dado completo —
zero exceções.**

## Exemplo real
MLB4841993227 | status: candidate
Preço original: R$ 37.90
Preço-alvo (se ativar): R$ 36.76
Rebate do ML: 0.3% | Seu: 2.7%

## Como calcular o rebate em valor absoluto (R$)
rebate_em_reais = preco_original * (meli_percentage / 100)

Exemplo real conferido: `MLB4959724082`, original R$158,65,
`meli_percentage=1.7` → rebate = R$ 2,70 (bate com o desconto total
observado: `price` R$136,71 = original − (meli% + seller%) do original).

## Nuance importante: múltiplas ofertas concorrentes para o mesmo item

Observado no MLB `MLB6896573984`: o mesmo item aparece **duas vezes**
como candidato à campanha SMART, com o **mesmo preço-alvo** (R$ 47), mas
com divisão de rebate ligeiramente diferente entre as duas ofertas:

| Oferta | ML paga | Você paga |
|---|---|---|
| 1 | 3.6% | 32.9% |
| 2 | 3.8% | 32.7% |

A soma total do desconto é quase idêntica nas duas (~36,5%), mudando só
a proporção de quem banca. Isso sugere que pode haver mais de uma
oferta/campanha candidata simultânea para o mesmo item, cada uma com uma
divisão diferente — a fórmula de precificação, ao consultar rebate
disponível, precisa considerar que pode haver **mais de uma opção** para
o mesmo item e escolher a que maximiza `meli_percentage` (minimizando a
parte do vendedor), não assumir que existe só 1 oferta por item.

## Relacionado

- [[Classificacao De Promocoes Com Rebate Vs Sem Rebate]]
- [[Mapa Completo Do Endpoint Promocoes Por Item]]