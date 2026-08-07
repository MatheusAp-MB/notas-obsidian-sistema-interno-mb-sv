---
tipo: regra
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 07/08/2026 01:32
relacionado: [Estrutura e Convenções do Vault, Padrao de Robustez para Clientes de API Externa]
---

# Índice — Integração Sysemp (ERP)

Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por contexto/área. Atualizado junto da autorização de escrita de cada nota (ver [[Estrutura e Convenções do Vault]]).

Mundo criado em 06/08/2026, isolado do Sistema Interno por decisão explícita: a API do ERP Sysemp lida com dado fiscal sensível e é grande o suficiente pra ser testada e documentada de forma independente — mesmo o código morando no mesmo repositório (`scripts_exploracao_ERP/`).

O padrão de segurança/estrutura de cliente de API (throttle, backoff, hierarquia de exceção, nome de pacote) é cross-cutting e mora em [[Padrao de Robustez para Clientes de API Externa]], dentro de `02_Sistema_Interno/Regras_de_Comportamento/` — não duplicado aqui. As decisões específicas de como o Sysemp aplica esse padrão ficam abaixo.

## Cliente_HTTP

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]] | decisao | ativa | 06/08/2026 | Pacote `api_sysemp/core`; throttle fixo de 1s + backoff reativo (teto 30s); max_tentativas=4; sem circuit breaker (sem dado real pra calibrar). Implementado e testado — 100% cover, 0 Miss, 0 BrPart; validado contra a API real. |
| [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]] | decisao | ativa | 06/08/2026 | 3 camadas: `ClienteApiSysemp` (transporte puro, `chamar()`), `ImpostosEntradaXML` (contexto por endpoint, validação própria, composição), `ApiSysemp` (Facade, autenticação resolvida sozinha, contextos por propriedade cacheada). Corrige erro real de ter colocado validação no transporte. |
| [[Checagem de Data Inicial no Futuro Era Codigo Morto]] | descoberta | ativa | 06/08/2026 | Validação de `data_inicial` além do limite futuro era matematicamente inalcançável (já implícita na checagem de `data_final`, dado `data_inicial < data_final`). Achado pela cobertura, removido. |

## Impostos_Entrada

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]] | descoberta | ativa | 07/08/2026 | Teoria inicial errada — corrigida: causa real era paginação não tratada (offset sempre 0), não comportamento da API. |
| [[Paginacao do Endpoint Manifesto Nota Entrada]] | decisao | ativa | 07/08/2026 | Endpoint pagina (~100/página); `listar_periodo_completo()` loopa até página vazia. Validado: 100→578 registros no período real. |
| [[Lista de CFOP Relevantes para Precificacao]] | decisao | ativa | 07/08/2026 | Custo de aquisição confiável só em 1.102/2.102; bonificação e retorno de conserto ficam fora do cálculo de custo. |
| [[Custo Medio Ponderado ou Custo Atual para Precificacao]] | duvida | ativa | 07/08/2026 | Custo médio ponderado vs. custo atual, e se alíquota deve ser mediada — aguardando decisão do superior. |

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Padrao de Robustez para Clientes de API Externa]]
