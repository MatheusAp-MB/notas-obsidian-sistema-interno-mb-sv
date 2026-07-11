---
tipo: descoberta
dominio: python
status: ativa
criado: 11/07/2026
relacionado: []
---

# Nível "Básica" Nunca Observado em Performance

Em 2.804 respostas válidas de `/user-product/{MLBU}/performance` (coleta
completa, 6.489 MLBs), nenhum score ficou abaixo de 53, e o nível
`level_wording` nunca apareceu como "Básica" — só `Profissional` (2.712,
97%) e `Satisfatória` (92, 3%).

## Dado real
Score — n=2804 | min=53.0 | max=100.0 | média=85.6
Níveis: {'Profissional': 2712, 'Satisfatória': 92}

## O que isso pode significar (não confirmado)

- A operação mantém um padrão de qualidade de anúncio consistentemente
  alto, tornando "Básica" genuinamente raro/inexistente nesta conta.
- Ou existe algum filtro no próprio conjunto de MLBs testados (só os que
  retornaram HTTP 200 entraram nesse cálculo) que exclui exatamente os
  anúncios mais fracos — por exemplo, se anúncios com performance muito
  ruim tendem a ser justamente os que falham na chamada (404) por outro
  motivo relacionado.

## Como resolver quando for retomado

Cruzar a lista de MLBs que retornaram erro (404) na chamada de
performance com seus outros indicadores de qualidade, para verificar se
existe correlação entre "erro na chamada" e "possível baixa qualidade" —
isso ajudaria a decidir entre as duas explicações acima.

## Relacionado

- [[Regras Gerais]]