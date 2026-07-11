---
tipo: bug_conhecido
dominio: python
status: ativa
criado: 11/07/2026
relacionado: [MLBU Compartilhado Entre Base E Catalogo Pareado]
---

# Cache Não Distingue Erro de Rede de Erro Real da API

O cache de performance (`_cache_performance`) em `buscar_dados_sku_completo.py`
guarda qualquer falha de chamada — inclusive falhas momentâneas de rede
(DNS, conexão interrompida) — como se fosse um resultado definitivo,
igual a um erro real da API (ex: 404). Isso significa que uma
instabilidade pontual de internet pode "contaminar" permanentemente o
resultado de um MLBU pelo resto da execução, mesmo que a rede volte a
funcionar segundos depois.

## Evidência real

Na coleta completa de 6.489 MLBs, apareceram 15 registros com
`performance.http = None` (erro sem código HTTP claro, ou seja, exceção
de conexão, não resposta da API). Investigando a fundo, eram só **2
incidentes reais**:

1. `MLB6415724142`: `RemoteDisconnected` (conexão interrompida), 1
   ocorrência.
2. `MLBU3832964446`: `NameResolutionError` (DNS falhou ao resolver
   `api.mercadolibre.com`) — apareceu **7 vezes**, alternando entre
   `MLB6416048610` (catálogo) e `MLB6419391928` (base), que são
   exatamente o par Base↔Catálogo pareado desse MLBU.

O motivo de 1 falha de DNS aparecer 7 vezes é o cache: a primeira falha
foi armazenada, e toda vez que esse MLBU reapareceu (via fechos
transitivos de diferentes SKUs que o compartilham), o cache devolveu o
erro guardado em vez de tentar de novo.

## Por que isso importa

Para erro real e documentado da API (ex: 404 de anúncio pausado/encerrado
— já confirmado como comportamento esperado e reproduzível), cachear faz
sentido: economiza chamada repetida para um resultado que não vai mudar.

Para erro de **rede/conexão** (sem código HTTP definido, ou seja, a
chamada nem chegou a ser respondida pela API), cachear é incorreto — a
falha é do ambiente local, não do dado em si, e o valor real (se a
chamada tivesse funcionado) nunca é obtido, mesmo com retomada.

## O que falta fazer

Ajustar a lógica de cache em `chamar_performance()`/`chamar_price_to_win()`
para só armazenar no cache quando `http` for um código HTTP real (a
chamada de fato chegou e foi respondida pela API) — erros sem `http`
definido (exceção de conexão) não deveriam ser cacheados, permitindo nova
tentativa na próxima vez que o mesmo MLBU/MLB aparecer.

## Relacionado

- [[MLBU Compartilhado Entre Base E Catalogo Pareado]]