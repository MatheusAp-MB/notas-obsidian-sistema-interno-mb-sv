---
tipo: decisao
dominio: python
status: ativa
criado: 07/08/2026
atualizado_em: 07/08/2026 01:32
relacionado: [API Sysemp So Retorna a Ultima Nota Fiscal por Produto, Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada, Padrao de Robustez para Clientes de API Externa, Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]
---

# Paginação do Endpoint Manifesto Nota Entrada

## Achado

O endpoint `listarManifestoNotaEntrada` pagina os resultados — cada chamada devolve no máximo ~100 registros (observado 2x seguidas, sempre exatos 100). O campo `qtde` do envelope de resposta só ecoa `len(retorno)` daquela página específica — não é um total do período, não dá pra saber de antemão quantas páginas existem.

Descoberto investigando por que um produto (7908050719121) parecia ter só 1 ocorrência de entrada no período, quando o usuário sabia ter dado entrada em várias notas dele, incluindo uma de 1000 unidades e outra de 8 unidades que nunca apareciam no resultado. Toda chamada anterior usava `offset='0'` — ou seja, sempre só a primeira página.

## Decisão

Adicionado `ImpostosEntradaXML.listar_periodo_completo(data_inicial, data_final)` — chama `listar_por_periodo()` (já existente) em loop, começando em `offset=0`, incrementando o offset pelo tamanho real da última página recebida (nunca por um tamanho fixo assumido), parando só quando uma página vier vazia. Retorna `{'retorno': [...]}` com todos os registros já unificados, mesmo formato que os outros scripts de exploração já esperam.

Por que parar só em página vazia, e não em "página menor que 100": nunca foi confirmado empiricamente que uma página parcial garante que não tem mais nada depois, pra essa API especificamente. Custa 1 chamada extra no fim (barata, protegida pelo espaçador de 1s), prefere-se isso a assumir um comportamento não verificado.

`data_referencia` é resolvido 1 vez só no início do método e repassado igual pra cada página, evitando inconsistência se a captura atravessar a virada do dia.

## Validação contra a API real

Período `2026-05-01` a `2026-08-07`: antes (offset=0 único) → 100 registros. Depois (`listar_periodo_completo`) → 578 registros. Produto 7908050719121: 4 ocorrências → 21 ocorrências, recuperando as notas de 1000 e 8 unidades que estavam faltando.

## Em aberto

Sem limite de segurança (máximo de páginas/registros) contra loop infinito caso a API tenha algum bug e nunca devolva página vazia — mesma lógica da decisão de não ter circuit breaker por padrão (ver [[Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]]): só adicionar quando houver dado real que justifique.

## Relacionado

- [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]]
- [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]]
