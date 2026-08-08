---
tipo: regra
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 08/08/2026 03:40
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
| [[Lista de CFOP Relevantes para Precificacao]] | decisao | ativa | 07/08/2026 | Custo de aquisição confiável em 1.102/2.102/1.403/2.403; bonificação (1.910/2.910) válida mas sem custo real; retorno de conserto fora. Ampliada de 4 pra 6 códigos em 11:26 (reunião com o superior). |
| [[Custo Medio Ponderado ou Custo Atual para Precificacao]] | duvida | resolvida | 07/08/2026 | Custo médio ponderado vs. custo atual — decidido custo atual em reunião com o superior. Ver [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]. |
| [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]] | decisao | ativa | 07/08/2026 | Custo atual (não médio ponderado) escolhido pelo superior do usuário. Em aberto: sub-questão de alíquota, e como tratar bonificação sendo a nota mais recente (adiado de propósito). |
| [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]] | descoberta | ativa | 07/08/2026 | Comparação com a tela real do ERP mostrou `Entrada` divergente da API pra mesma nota (Emissão bate, Entrada não) — resolvido em 21:12: Sysemp remodelou a API, campo novo `Data Entrada da Nota` validado 2/2 contra a entrada física real. |
| [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]] | decisao | ativa | 08/08/2026 | API não devolve redução de PIS/COFINS direto (só ICMS/ICMS ST) — derivado de Base de Cálculo e Custo Total. Implementado como campo `reducao` nas dataclasses `Pis`/`Cofins` (`dados_xml_nf.py`), calculado 1x na fábrica. |
| [[Plano em Etapas do Duble de Precificacao ML]] | decisao | ativa | 08/08/2026 | Script isolado que reproduz a FormulaPrecificacao real do ML com dados fiscais do DadosXmlNF em vez do Produto do banco. **Implementado e validado fim a fim** (10 etapas, `scripts_exploracao_ERP/duble_precificacao_ml.py`) pro EAN 7908050719121 — matemática conferida, preço final R$ 408,90. Em aberto: validar redução de ICMS/ICMS ST com produto de alíquota ≠ 0; confirmar se dados de saída zerados são reais; testar mais produtos. |

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Padrao de Robustez para Clientes de API Externa]]
