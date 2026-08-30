---
tipo: decisao
dominio: python
status: ativa
criado: 06/08/2026
atualizado_em: 06/08/2026 23:11
relacionado: [Padrao de Robustez para Clientes de API Externa, Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]
---

# Padrão de Proteção do Cliente Sysemp (Throttle + Backoff, Sem Circuit Breaker)

## Contexto

O `cliente_sysemp.py` original (fase de exploração) fazia só o transporte HTTP básico — 1 método `_post`, erro genérico (`RuntimeError`) pra qualquer status ruim, nenhuma proteção contra chamada excessiva. Suficiente pra confirmar que a conexão funcionava, insuficiente pra uso real — API fiscal, 1 endpoint só documentado até agora, comportamento sob erro/limite de requisição desconhecido (nunca vimos o Sysemp retornar um erro de verdade).

## Decisão

Reestruturar em pacote `api_sysemp/core` (dentro de `scripts_exploracao_ERP/`), seguindo [[Padrao de Robustez para Clientes de API Externa]]:

- `excecoes.py` — hierarquia própria: `ErroAPISysemp` (base), `ErroRedeSysemp`, `ErroLimiteRequisicoesSysemp`, `ErroServidorSysemp` (esses 3 passageiros, permitem retry), `ErroAutenticacaoSysemp`, `ErroNegocioSysemp` (esses 2 falham na hora, sem retry).
- `protecao.py` — `EspacadorDeChamadas` com intervalo mínimo fixo de **1 segundo** entre chamadas (proativo, `sleep` bloqueante) + `calcular_espera_backoff` reativo (usa tempo sugerido pela API se ela informar; senão exponencial com jitter, teto de 30s).
- `cliente.py` — `ClienteApiSysemp` com **`max_tentativas=4`** pra erro passageiro (rede/429/5xx); autenticação e negócio (400) sobem a exceção na primeira ocorrência, sem retry. Único método público: `chamar(metodo, corpo)` — genérico, sem saber nada de nenhum endpoint específico (ver [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]] pra onde a validação de parâmetro foi parar).
- **Sem circuit breaker.** Decisão explícita de deixar de fora por enquanto — não há dado real de quantas falhas em sequência aconteceriam nem qual reset faria sentido, e calibrar isso no escuro é pior do que não ter.

## Sobre o 1 segundo fixo

Mantido como proativo/conservador porque ainda não sabemos se a API do Sysemp sinaliza o tempo de espera certo em caso de erro (nunca vimos ela retornar erro). Se algum dia isso for confirmado na prática, o fixo pode ser removido e a proteção passa a ser só reativa — mesma evolução que aconteceu numa integração parecida (Mercado Livre, outro projeto): começou com espera fixa, foi removida depois de confirmar empiricamente que a própria API avisava o tempo certo.

## Status de implementação

Implementado e testado — `chamar()` cobre sucesso, os 5 tipos de erro, recuperação após erro passageiro e leitura de `Retry-After`. 100% cover, 0 Miss, 0 BrPart em `core/cliente.py`, `core/excecoes.py` e `core/protecao.py` (validado rodando de verdade, 06/08/2026 23:11). Validado também contra a API real via script de exploração (resposta `{status, qtde, retorno}` recebida com sucesso).

## Relacionado

- [[Padrao de Robustez para Clientes de API Externa]]
- [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]
