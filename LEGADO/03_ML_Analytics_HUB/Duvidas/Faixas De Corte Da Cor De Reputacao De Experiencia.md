---
tipo: duvida
dominio: 
status: ativa
criado: 11/07/2026
relacionado: [Migracao Parcial Da Experiencia De Compra Para User Product]
---

# Faixas de Corte da Cor de Reputação de Experiência

Hipótese (ainda não confirmada oficialmente) sobre as faixas de valor que
definem a cor de `reputation.color` no endpoint de Experiência de Compra:

| Faixa | Cor |
|---|---|
| -1 | Cinza (ainda não calculado — sem vendas suficientes) |
| 0 a 30 | Vermelho |
| 31 a 65 | Laranja |
| 66 a 100 | Verde |

## O que sustenta a hipótese

Todos os valores reais já observados batem com essa régua, sem nenhuma
contradição:

- Nossa conta: `-1` → cinza, `30` → vermelho, `65` → laranja, `100` →
  verde (72 amostras reais testadas, só esses 4 valores apareceram).
- Documentação oficial: exemplo com `75` → verde — consistente com o
  corte estar em algum ponto entre 65 (laranja, nosso dado) e 75 (verde,
  doc), o que bate com "66 a 100 = verde".

## Por que ainda é dúvida, não descoberta confirmada

A documentação **nunca declara os números exatos dos cortes** — só
fornece exemplos pontuais que, até agora, sempre coincidiram com essa
régua. Não temos nenhum valor real testado nas faixas intermediárias
(31-64 ou 67-99) que prove que o corte é exatamente 30/65, e não, por
exemplo, 35/60 ou qualquer outra combinação parecida.

## Como resolver quando for retomado

Só será possível confirmar com certeza se aparecer, em alguma amostra
futura (nossa conta ou documentação), um valor real dentro dessas faixas
intermediárias não testadas — por exemplo, um score de 45 ou 80 com a cor
correspondente exposta.

## Relacionado

- [[Migracao Parcial Da Experiencia De Compra Para User Product]]