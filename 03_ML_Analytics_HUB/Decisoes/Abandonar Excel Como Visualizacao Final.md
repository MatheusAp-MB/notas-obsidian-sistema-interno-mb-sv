---
tipo: decisao
dominio: banco_de_dados
status: ativa
criado: 10/07/2026
relacionado: []
---

# Abandonar Excel Como Visualização Final

Decisão de não usar Excel como a tela final de consulta dos dados do ML
Analytics HUB — o destino correto é um banco de dados relacional,
consumido pelo Sistema Interno (Django).

## Contexto que levou à decisão

O sistema descobriu que a estrutura real dos dados é uma árvore de
profundidade variável:

```
1 SKU                 → N Anúncios (de qualquer tipo)
1 Página de Catálogo  → N Anúncios Base
1 Anúncio Base        → N Anúncios de Catálogo
```

Uma Página de Catálogo pode ter 1 ou várias Bases; uma Base pode ter 0, 1
ou N Catálogos vinculados. Antes dessa descoberta, o Excel de performance
(`gerar_excel_performance_v3.py`) já vinha funcionando bem para uma lista
plana de anúncios — mas representar essa hierarquia de profundidade
variável em linhas de planilha sempre resultaria na "bagunça visual" que
o projeto vinha tentando evitar desde suas primeiras versões.

## Alternativas descartadas

- **Continuar forçando a árvore em Excel**, usando agrupamento de linhas
  (outline) ou mesclagem de células — descartado porque Excel é
  fundamentalmente tabular; qualquer simulação de hierarquia nele é frágil
  e difícil de filtrar/consultar.
- **Manter dois sistemas em paralelo** (Excel para relatório, banco para o
  resto) — descartado por gerar duas fontes de verdade divergentes.

## Decisão tomada

- O ML Analytics HUB continua sendo a camada de **extração e coleta** via
  API do Mercado Livre — gera JSON/Excel como artefatos intermediários.
- O Sistema Interno (Django) passa a ser a camada de **modelagem e
  apresentação** — consome os JSONs gerados pelo HUB e representa a árvore
  de forma nativa (tabelas relacionais com FK, não linhas de planilha).
- Excel continua existindo como ferramenta de *exploração pontual* durante
  o desenvolvimento (ex: amostras de teste), mas não é mais o destino do
  usuário final.

## Relacionado

- [[Regras Gerais]]
