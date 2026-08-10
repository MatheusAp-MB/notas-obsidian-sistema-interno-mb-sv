---
tipo: regra
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 10/08/2026 15:30
relacionado: [Estrutura e Convenções do Vault, Padrao de Robustez para Clientes de API Externa]
---

# Índice — Integração Sysemp (ERP)

Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por contexto/área. Atualizado junto da autorização de escrita de cada nota (ver [[Estrutura e Convenções do Vault]]).

Mundo criado em 06/08/2026, isolado do Sistema Interno por decisão explícita: a API do ERP Sysemp lida com dado fiscal sensível e é grande o suficiente pra ser testada e documentada de forma independente — mesmo o código morando no mesmo repositório (`scripts_exploracao_ERP/`).

O padrão de segurança/estrutura de cliente de API (throttle, backoff, hierarquia de exceção, nome de pacote) é cross-cutting e mora em [[Padrao de Robustez para Clientes de API Externa]], dentro de `02_Sistema_Interno/Regras_de_Comportamento/` — não duplicado aqui. As decisões específicas de como o Sysemp aplica esse padrão ficam abaixo.

## Geral

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]] | regra | ativa | 09/08/2026 | Cross-cutting, vale pra qualquer projeto com o Sysemp: só leitura, nunca escrita via API; acesso restrito ao que já foi pedido/desenvolvido (não é livre); toda API nova tem custo de desenvolvimento + prazo + validação. |
| [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]] | regra | ativa | 09/08/2026 | Quando o dado existir no XML da nota de entrada e divergir do banco/planilha, o XML vale. Resolveu 2 divergências fiscais em aberto (custo do EAN 7908050700174, PIS/COFINS do SB-630). Só vale se o dado existir no XML — não cobre Frete CIF/FOB, cadastro, dimensões. |

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
| [[Plano em Etapas do Duble de Precificacao ML]] | decisao | ativa | 08/08/2026 | Script isolado que reproduz a FormulaPrecificacao real do ML com dados fiscais do DadosXmlNF em vez do Produto do banco. **Plano de 9 etapas concluído fim a fim** (09/08, 03:27). **Validado em lote com 3 produtos reais** (09/08, 16:40) contra a planilha do superior — ICMS entrada e IPI exatos nos 3; achado e corrigido 1 bug de ICMS ST fantasma (ver [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]); fechada a dúvida sobre "Redução" (ver [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]]). |
| [[Credito Fiscal Nao Cumulativo (ICMS PIS COFINS)]] | conceito | ativa | 09/08/2026 | Mecanismo não-cumulativo de ICMS/PIS/COFINS — crédito de entrada abate débito de saída. Exemplo real validado (EAN 7908050700174): R$ 81,16/unidade de crédito real que o sistema hoje ignora por campos zerados no banco, inflando o preço final sem necessidade. |
| [[Achados de Imposto Sempre Aguardam Validacao do Tributario]] | regra | ativa | 08/08/2026 | Toda descoberta/correção de imposto neste domínio leva o rótulo "aguardando validação do tributário/superior" — usuário não tem formação tributária formal, só aprendizado prático do projeto; bater com a API confirma consistência do dado, não confirma correção fiscal. |
| [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]] | decisao | ativa | 09/08/2026 | Levantamento completo de cobertura: custo/impostos de entrada (ICMS, ICMS ST, IPI, PIS, COFINS) passam a vir do XML. **Atualizado 17:05** — quadro completo do que ainda depende de planilha: ICMS/PIS-COFINS de saída (caminho manual = planilha "Busca Legal"), Frete CIF/FOB (falta investigar origem/lógica), e Cadastro de Produto + dimensões físicas (API confirmada possível pela Sysemp, sem prazo). Armazenagem já não é planilha (faixa dinâmica, correção própria). Custo com bonificação abandonado. |
| [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]] | decisao | ativa | 09/08/2026 | Hipótese (não confirmada): produtos com ICMS ST na nota devem ter o crédito de ICMS entrada zerado no FIXO (diferimento) — validada pela planilha real do superior (nota explícita + ST Valor batendo com o cálculo líquido do dublê). Dado "é ST?" vem do XML (`IcmsSt.valor > 0`), não da planilha. **Fechado (16:40):** testado com produto "Redução" real — não precisa do mesmo tratamento, só "ST". |
| [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]] | decisao | ativa | 09/08/2026 | Como manter os dados de entrada atualizados sem reler período gigantesco: watermark (2 campos, `data_inicial_cobertura`/`data_final_cobertura`) + margem de 7 dias + merge por produto reaproveitando lógica existente. **Implementado e validado (20:50)**: model `SincronizacaoXmlManifestoNotaEntrada` no app `integracao_sysemp`, migração aplicada, teste pytest Nível 3 com 100% cover/0 Miss/0 BrPart. Comando final `manage.py iniciar_servidor` (renomeado, ainda não implementado) substituirá `runserver`. |
| [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]] | descoberta | corrigida | 09/08/2026 | Cálculo de ICMS ST do dublê gerava valor negativo fantasma pra produtos sem substituição tributária, reduzindo o Custo Final indevidamente. Corrigido e revalidado com 3 produtos reais — Custo Final bate quase exato com a planilha do superior. |
| [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]] | descoberta | aberta | 09/08/2026 | 2 achados de dado (não de imposto/fórmula): `frete_cif_fob` zerado no banco em 3 produtos testados (planilha tem valor real); dimensões físicas zeradas no cadastro do SB-630, quebrando Coleta/Armazenagem/Frete pra esse produto. |
| [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]] | duvida | resolvida | 09/08/2026 | SB-630 tem PIS/COFINS entrada = 0% na planilha, XML calcula R$ 98,33/unidade. **Resolvida (17:17)**: XML é a fonte válida (ver regra de fonte única). Segue aguardando validação do tributário só quanto à fórmula. |
| [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]] | decisao | ativa | 09/08/2026 | Guarda-chuva `ImpostosECustosXMLEntradaProduto` (1 linha/produto, sem histórico) + 6 tabelas-filhas (ICMS, ICMS ST, ICMS Ret, IPI, PIS, COFINS), cada uma só com os campos reais do XML. **Implementado (23:10)**: app `impostos`, migração aplicada, pipeline `sincronizar_a_partir_de` com 100% cover/0 Miss/0 BrPart. Bug real de precisão float→Decimal achado e corrigido no caminho. **Atualizado (10/08, 15:30)**: 3 campos novos (`quantidade_nota`, `custo_unitario`, `emissao`) + método `obter_detalhes_para_exibicao()`, motivados pelo modal de produto. |
| [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]] | decisao | ativa | 10/08/2026 | Serviço que liga watermark + `api_sysemp` + `impostos`: busca API, filtra CFOP, seleciona nota mais recente por produto, persiste, registra erro individual (pendência) ou falha total. **1ª rodada real (02:00, banco de casa)**: 320 produtos com campo de imposto `null` na origem. **Decidido (12:05):** `null` vira `0`. **Validado com carga real (12:30, banco do escritório — bancos são locais e independentes por PC):** 1736 sincronizados, 0 erro. Reprocessamento dos 320 do banco de casa segue sem desenho. |
| [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]] | decisao | ativa | 10/08/2026 | `dados_xml_nf.py` (usado pelo orquestrador de produção e por teste oficial de `impostos`) morava em `scripts_exploracao_ERP/`, que precisa poder ser apagada a qualquer momento. Movido pra `integracao_sysemp/servicos/`, 6 consumidores corrigidos, 0 regressão (87 passed + 11 xfailed). |
| [[Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]] | descoberta | corrigida | 10/08/2026 | 2 bugs ambientais no PC do escritório: scripts sem `_adicionar_raiz_do_projeto_ao_path()` (quebram ao rodar direto, desde a oficialização do `api_sysemp`) e resíduo local de pasta `api_sysemp` antiga mascarando o erro real como pacote de namespace. Ambos corrigidos. |
| [[Modal de Produto — Aba Impostos (Entrada e Saida)]] | decisao | ativa | 10/08/2026 | Modal de produto ganhou abas ("Visão Geral"/"Impostos"); card legado "Fiscal (cadastro manual)" removido (ruído); aba nova com resumo da última nota + detalhamento de impostos de entrada (real) e saída (placeholder). 3 rodadas de mockup antes do código. 3 campos novos no guarda-chuva (`quantidade_nota`, `custo_unitario`, `emissao`) + novo management command `reprocessar_impostos_entrada_de_json`. Ainda faltam 4 das 5 etapas do plano maior (Visão Geral reduzida, plataformas, precificação). |
| [[Modal Mostrava Impostos Por Nota Em Vez de Por Unidade]] | descoberta | corrigida | 10/08/2026 | Comparação com o dublê expôs que a API entrega Base Cálculo/Valor por NOTA, não por unidade — modal exibia bruto. Corrigido persistindo `quantidade_nota`/`custo_unitario`, já parseados mas nunca gravados. |
| [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]] | checkpoint | ativo | 10/08/2026 | Nota auto-contida — ponto de partida único pra retomar este domínio em outro computador. Lê antes de qualquer outra coisa ao voltar. Atualizada 15:30: modal de produto (aba Impostos) construído, app `produtos` agora faz parte do domínio, 3 campos novos no guarda-chuva, 4 etapas do plano maior da tela de Produtos ainda em aberto. |

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Padrao de Robustez para Clientes de API Externa]]
