---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 07/08/2026
atualizado_em: 10/08/2026 12:05
relacionado: [Paginacao do Endpoint Manifesto Nota Entrada, Lista de CFOP Relevantes para Precificacao, Custo Medio Ponderado ou Custo Atual para Precificacao, API Sysemp So Retorna a Ultima Nota Fiscal por Produto, Custo Atual Escolhido para Precificacao dos Produtos Sysemp, Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real, Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total, Plano em Etapas do Duble de Precificacao ML, Achados de Imposto Sempre Aguardam Validacao do Tributario, Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Credito Fiscal Nao Cumulativo (ICMS PIS COFINS), Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST, Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria, Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal, Divergencia de Credito PIS COFINS Entrada no Soprador SB-630, Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir, Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Orquestracao da Sincronizacao de Impostos de Entrada via XML, Contexto Geral - Retomada em Outro Computador (Integracao Sysemp), Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP, Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]
---

# Checkpoint — Exploração de Dados Fiscais Sysemp

## Última atualização (10/08/2026 12:05) — retomada em outro PC (escritório), dublê validado pelo superior, decisão do `null` implementada

Retomada em outro computador (PC do escritório), sem migrar a conversa anterior — leitura do vault confirmou o estado real (checkpoint e commits batendo, nada perdido). Sequência real desta sessão:

1. **Dublê quebrado ao reabrir, 2 causas ambientais reais (não bug de lógica):** `FileNotFoundError` no json local de entrada (pasta `scripts_exploracao_ERP/saidas/` é gitignored, nunca existiu nesse PC) — resolvido rodando de novo a pipeline manual (`explorar_manifesto_nota_entrada.py` → `filtrar_dados_por_cfop.py` → `selecionar_nota_mais_recente_por_produto.py`). No caminho, 2 bugs reais achados e corrigidos em scripts de exploração que nunca foram atualizados depois da oficialização do `api_sysemp` (relocação, commit `8343dba`) — ver [[Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]].

2. **Dublê rodou e foi mostrado ao superior.** Usuário reportou: "boa parte está correta e válida" — validação parcial real, primeira vez que o dublê foi usado como material de apresentação de verdade (não só validação técnica interna).

3. **Usuário pediu pra seguir com a integração real + modelagem do banco** — descoberta: **já estava feita**, de uma sessão anterior sem memória direta desta conversa (orquestrador + app `impostos`, 1ª rodada real já tinha rodado). Reconciliado contra o GitHub (`git fetch`, `dev` em `575f865`) antes de prosseguir — nada realmente pendente de commit, só a nota de Contexto Geral estava com aviso desatualizado (corrigido nesta mesma rodada, ver "Status real agora" na nota).

4. **Decisão de negócio tomada: campo de imposto `null` vira `0`, explícito.** Resolve o achado dos 320 casos com erro da 1ª rodada real. Ver seção própria em [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]] — implementado com 2 funções puras (`_float_ou_zero`/`_int_ou_zero`), testado (Nível 0, 8 cenários + 1 xfail, 100% cover).

5. **Achado maior, motivado pelo usuário:** `dados_xml_nf.py` (usado pelo orquestrador de produção E por um teste oficial do app `impostos`) morava em `scripts_exploracao_ERP/` — pasta que precisa poder ser apagada a qualquer momento sem afetar o sistema real. Relocado pra `integracao_sysemp/servicos/dados_xml_nf.py`, 6 consumidores corrigidos, validado sem regressão (87 passed + 11 xfailed em `impostos`/`integracao_sysemp`/`api_sysemp`). Ver [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]].

6. **Reprocessamento dos 320 erros antigos e resync completo: NÃO feitos ainda.** Usuário considerou "puxar tudo de novo" mas decidiu não rodar agora — segue em aberto, agora desbloqueado (a decisão do `null` que faltava já foi tomada) mas sem desenho de como reprocessar sem rechamar a API.

## Última atualização (10/08/2026 02:00) — pausa, sessão encerrada por hoje

Depois da orquestração fechada (00:55), foi feita a 1ª rodada real contra a API do Sysemp — primeira vez que qualquer código deste domínio toca a API de verdade (tudo antes disso era mock/dado fabricado). Sequência completa desta rodada:

1. **Cronômetro granular + relatório estruturado.** `sincronizar_impostos_entrada_xml()` passou a devolver `RelatorioDeSincronizacao` — dataclass, não dict cru (o usuário perguntou "por que dict?" e a resposta foi corrigir na hora, é inconsistente com o resto do projeto) — com o tempo de cada fase e as contagens de produto. Motivo: decidir se vale otimizar a gravação em lote **medindo primeiro**, sem adivinhar.

2. **Bug real #1, achado só ao rodar contra a API real:** `calcular_janela_da_proxima_busca()` devolve `date` (correto pro model), mas `ApiSysemp().impostos_entrada.listar_periodo_completo()` exige string ISO — o orquestrador passava o `date` direto, gerando `TypeError`. Corrigido com `.isoformat()` na fronteira exata entre os 2 domínios. **O mock dos testes não pegou isso** (aceitava qualquer tipo sem checar) — reforçado com `assert isinstance(..., str)` dentro do mock, pra nunca mais passar batido.

3. **Problema real de observabilidade.** Rodando contra a API de verdade, o comando ficou mais de 1 minuto em silêncio total (paginação com throttle de 1s/página, zero feedback) — o usuário achou que travou e encerrou o terminal. Corrigido com callback opcional `informar_fase(mensagem: str)` no orquestrador (nunca imprime nada sozinho) + repasse do `ao_avancar_pagina` já existente no `api_sysemp` — o comando agora mostra um spinner vivo com a fase atual e o progresso página a página.

4. **1ª rodada real completa (carga histórica desde 2020-05-01):** `busca_api` = 299,5s (93% do tempo), `persistencia_no_banco` = 20,6s (6,4%), total = 5m21s. **Resposta real, medida, pra pergunta original ("vale otimizar a gravação em lote?"): não — o gargalo é o throttle da API, não o banco.** Também é custo de carga histórica única; sincronizações futuras (janela de 7 dias) devem ser bem mais rápidas na busca.

5. **2 achados de dado nos números da rodada:** 3791 produtos selecionados; 1416 sincronizados (37%); **2055 sem `Produto` correspondente no banco (54%)**; 320 com erro (8,4%).

6. **Bug/achado real #2 — os 320 erros, investigado com dado real (não suposição).** Todos com a mesma mensagem genérica (`float() argument ... not 'NoneType'`). Pedido e conferido o registro real do EAN `7909436946186` (NF 188419, CFOP 1.403): **todos** os campos de imposto vêm `null`, e até o `NCM` (teoricamente obrigatório em qualquer NF-e) também vem `null` — não parece "imposto zero de verdade", parece dado incompleto do lado da Sysemp pra essa nota específica. **Decisão de negócio em aberto, não resolvida** — 3 opções na seção "Em aberto" de [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]].

7. **Achado sobre re-execução.** Rodar o comando de novo agora é um no-op puro (watermark já em dia, dentro da margem) — confirmado na prática (`total: 0.008s`). Mais importante: **sincronizações futuras nunca voltam a reler o histórico antigo** (só a janela nova) — os 320 erros dessas notas antigas não se resolvem sozinhos com o tempo. Qualquer fix pro `null` vai precisar também de um jeito de reprocessar esse histórico antigo.

**Sessão pausada aqui, por decisão do usuário (fim do horário disponível).** Ver [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]] pro ponto de partida único ao retomar em outro computador.

## Última atualização (10/08/2026 00:55)

Fechada a frente de orquestração (idealizada ao longo da madrugada, sem incidente de processo desta vez): serviço completo que liga watermark + `api_sysemp` + `impostos` de ponta a ponta. Idealizado por diálogo — usuário rejeitou a proposta inicial de processar tudo em memória, preferindo manter os 3 jsons intermediários (bruto/filtrado/selecionado) em disco, sempre sobrescritos (sem 1 arquivo por execução), com 1 4º json de pendências de erro por produto (não é log — some quando o produto sincroniza bem numa rodada futura). Ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]] pro desenho completo.

Implementado: `integracao_sysemp/servicos/` (`arquivos_retorno_api.py`, `filtro_cfop.py`, `selecao_nota_recente.py`, `erros_sincronizacao.py`, `orquestrador.py`) + comando `manage.py sincronizar_impostos_entrada` + método novo `calcular_janela_da_proxima_busca()` no model do watermark. Testado (Nível 0 pras funções puras e arquivo, Nível 3 pro orquestrador com `ApiSysemp` mockada como caixa-preta) — **21 testes reais + 5 xfail, 100% cover / 0 Miss / 0 BrPart** em todo o pacote novo e no model do watermark.

Código commitado e sincronizado com o GitHub (`dev`, commit `8343dba`) — relocação oficial do `api_sysemp` + criação dos apps `impostos`/`integracao_sysemp` foram todos no mesmo commit.

## Última atualização (09/08/2026 23:10)

Fase Executar concluída pra modelagem de impostos/custos de entrada (idealizada às 22:25): app novo `impostos` criado, com o guarda-chuva `ImpostosECustosXMLEntradaProduto` + 6 tabelas-filhas (`IcmsEntradaProduto`, `IcmsStEntradaProduto`, `IcmsRetEntradaProduto`, `IpiEntradaProduto`, `PisEntradaProduto`, `CofinsEntradaProduto`), migração aplicada, pipeline único de escrita (`sincronizar_a_partir_de`) testado com **100% cover / 0 Miss / 0 BrPart** (13 testes + 1 xfail). No caminho, achado e corrigido um bug real de precisão (float passado direto pra `DecimalField` capturava o valor binário exato, não o decimal correto — corrigido com `_converter_para_decimal`). Ver seção "Implementado e validado" em [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]] pro detalhe completo.

**3º incidente de processo nesta sessão (registrado por completo em [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]):** durante a análise de cobertura, Claude tentou criar um arquivo no próprio sandbox só pra contar linha de um código que o usuário já tinha colado na conversa — violação da mesma regra dos 2 incidentes anteriores ("código é sempre texto"), mesmo sendo só verificação interna, sem entrega nem execução envolvida. Identificado pelo usuário na hora; regra reforçada explicitamente no vault pra cobrir esse caso.

## Última atualização (09/08/2026 22:25)

Idealizada (Ciclo de Trabalho Calmo, fase Idealizar concluída) a modelagem de banco pra receber impostos/custos de entrada de forma completa — hoje o `Produto` só tem campos genéricos e soltos, da era da planilha. Desenho fechado por diálogo (incluindo mockup visual validado pelo usuário): guarda-chuva `ImpostosECustosXMLEntradaProduto` (1 linha por produto, sem histórico, sempre sobrescrita) carregando identificação da nota + `custo_total`, com 6 tabelas-filhas (ICMS, ICMS ST, ICMS Ret, IPI, PIS, COFINS) — cada uma só com os campos que realmente tem no XML (IPI sem redução, ICMS Ret sem alíquota/redução), sempre as 6 criadas mesmo com valor zero. Campos monetários em `Decimal`, não `float` (diferente das dataclasses de processo). Decisão explícita do usuário de fazer isso como reforma, não remendo — não presa a manter compatibilidade com os campos genéricos atuais do Produto. Ver [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]] pro desenho completo. Próximo passo: fase Planejar (app, nomes finais das 6 tabelas, pipeline de gravação).

## Última atualização (09/08/2026 20:50)

Modelo da sincronização incremental (planejada na entrada de 19:10) foi implementado, migrado e testado. App novo dedicado `integracao_sysemp`, model `SincronizacaoXmlManifestoNotaEntrada` — nomes finais diferentes dos provisórios do desenho original (watermark virou 2 campos, `data_inicial_cobertura`/`data_final_cobertura`, não 1; comando `manage.py iniciar` virou `manage.py iniciar_servidor` pra não colidir com `iniciar_banco` já existente; status persistido simplificado pra 2 valores, "desatualizado" ficou como método calculado). Migração `0001_initial` aplicada com sucesso no banco real.

Teste pytest Nível 3 escrito, rodado pelo usuário e validado: 10 testes + 1 xfail proposital, **100% cover / 0 Miss / 0 BrPart** em `integracao_sysemp/models.py` (checado com `pytest-cov`, conforme [[Disciplina de Testes Automatizados]]). Ver seção "Implementado e validado" em [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]] pro detalhe completo dos campos e cenários cobertos.

Segue em aberto: o serviço/cliente que de fato chama a API e aciona os métodos de escrita, a implementação do comando `iniciar_servidor`, onde o aviso visual de "desatualizado" aparece na tela, e o botão manual de sincronizar.

## Última atualização (09/08/2026 19:10)

Planejada (sem código escrito ainda) a sincronização incremental dos dados de entrada — motivada pela pergunta de como manter tudo atualizado sem reler anos de histórico a cada vez. Desenho fechado: watermark `cobertura_ate` + margem de segurança de 7 dias (rodadas diárias) + merge por produto reaproveitando o critério já existente (Data Entrada da Nota + NR NF) — ver [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]] pro desenho completo.

Peça chave do desenho: como o sistema roda local (`runserver`, sem processo sempre ativo), a sincronização é acionada por um comando customizado `manage.py iniciar` (substitui o boot direto) em vez de agendamento real — ele confere se está desatualizado, sincroniza só se precisar, e só depois sobe o servidor. Falha nunca bloqueia o boot. Tabela nova dedicada "Sincronização com o ERP", só pra essa função (sem generalizar pra futuras integrações, pela Regra dos Três).

**Incidente de processo nesta sessão (registrado por completo em [[Disciplina de Testes Automatizados]] e [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]):** durante o planejamento dessa sincronização, Claude executou uma simulação de código por conta própria (violando "Claude nunca executa código sozinho"), criou o arquivo dessa simulação em vez de colar como texto na conversa, e criou 18 tarefas + acionou subagentes sem pedir permissão antes. Identificado pelo usuário, que pediu pra reler as regras corretas (não as de `LEGADO/`, que não é fonte de verdade). Corrigido: as 18 tarefas foram apagadas.

## Última atualização (09/08/2026 17:17)

Usuário perguntou se já dá pra oficializar o dublê no sistema real. Resposta: ainda não — checklist reunido (validação formal do tributário/superior ainda não feita, amostra pequena de produtos testados, 2 problemas de dado sem correção, 2 divergências fiscais sem explicação até então, decisão de "como" escrever no banco nunca tomada, só 1 de 6 fórmulas de marketplace testada).

Em resposta a isso, o usuário fechou uma **regra nova, cross-cutting neste domínio**: [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]] — quando o dado existir no XML e divergir do banco/planilha, o XML vale. Isso resolveu, de uma vez, as 2 divergências fiscais que estavam em aberto: a divergência de custo antiga (banco R$ 619,70 vs XML R$ 566,27, EAN 7908050700174) e a divergência de PIS/COFINS do SB-630 (planilha 0% vs XML R$ 98,33/unidade) — as duas passam a ter o valor do XML como válido. Continua de pé, à parte, a validação formal do tributário sobre a fórmula em si (a regra resolve "qual fonte", não "se o cálculo está certo").

## Última atualização (09/08/2026 17:05)

Fechando um resumo básico pedido pelo usuário ("o que ainda depende de planilha?"), o quadro ficou mais completo que só a parte fiscal:

**Ainda depende de planilha hoje:** Cadastro de Produto (ativo/inativo, códigos, fotos, nome) e dimensões físicas — nenhuma API pra isso ainda, embora a Sysemp já tenha confirmado que **pode** desenvolver (é a tela "Cadastro de Produtos" deles). Paliativo atual: baixar de novo a planilha de produtos ativos e reimportar. ICMS/PIS-COFINS de saída — API em desenvolvimento paralelo, sem prazo; caminho manual atual é a planilha **"Busca Legal"**, que o usuário está desenvolvendo com o superior/financeiro. Frete CIF/FOB — aqui falta investigação mesmo, ainda não sabemos de onde vem o dado nem a lógica de CIF vs. FOB.

**Nova regra cross-cutting registrada:** [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]] — o usuário deixou explícito que não haverá escrita via API no Sysemp em nenhuma hipótese, e que acesso de leitura não é livre: só temos o que já foi pedido e desenvolvido (hoje, impostos de entrada). Cada API nova (cadastro, saída) tem custo real de desenvolvimento e prazo — vale pra qualquer projeto futuro com o Sysemp, não só este.

Ver [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]] pra tabela de cobertura atualizada com esse quadro completo.

## Última atualização (09/08/2026 16:40)

Depois de reunir a planilha completa do superior (entrada anterior, 14:50), o usuário escolheu 3 produtos reais — 1 de cada categoria de `Tributação` (Tributado: SB-630, Redução: Guarany S4 20L, ST: K-430) — pra rodar o dublê e comparar linha a linha com a planilha, e responder de vez se "Redução" precisa do mesmo tratamento de diferimento que "ST".

**Bug real encontrado e corrigido:** o cálculo de ICMS ST no dublê gerava um valor negativo fantasma pra produtos sem substituição tributária (subtraía o ICMS normal mesmo quando não havia ICMS ST nenhum), reduzindo o Custo Final indevidamente. Corrigido com uma guarda simples (mesma condição de "é ST?" já usada na Etapa 8). Revalidado nos 3 produtos — Custo Final do dublê bate quase exato com a planilha em todos, restando só uma diferença já explicada (campo `frete_cif_fob` zerado no banco). Ver [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]].

**Pergunta da "Redução" respondida:** confirmado com o Guarany que Redução de base de ICMS não envolve substituição tributária (Base ICMS ST = 0) — não precisa de nenhum ajuste especial de crédito, o crédito normal já resolve. Ver seção "Resolvido" em [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]].

**2 achados de dado, fora do escopo fiscal:** `frete_cif_fob` zerado no banco nos 3 produtos testados (planilha tem 1%/1%/4%, banco tem 0% nos 3); e o cadastro do SB-630 (EAN 7908050734971) está com altura/largura/comprimento/peso zerados, quebrando Coleta, Armazenagem e a faixa de frete usada — preço desse produto específico não é confiável até o cadastro ser corrigido. Ver [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]].

**1 divergência fiscal nova, em aberto:** SB-630 tem PIS/COFINS entrada = 0% na planilha, mas o XML calcula um crédito real de R$ 98,33/unidade pra esse produto — pode ser omissão da planilha ou regra fiscal legítima, precisa do tributário/superior pra saber qual. Ver [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]].

ICMS entrada e IPI seguem validados exatos nos 3 produtos, sem exceção nenhuma — a lógica de imposto da Etapa 4 do dublê está confirmada de novo, com mais dados reais.

## Última atualização (09/08/2026 14:50)

Usuário trouxe a planilha real completa do superior (múltiplos produtos) — validou fortemente o dublê pro EAN 7908050700174: CUSTO (566,27), IPI (5,20%) e PIS/COFINS (9,25%) bateram exatos com o XML. Achado importante: `ICMS ENTRADA = 0,00%` na planilha pra esse produto não é dado faltando — é uma nota explícita do superior ("produtos ST... valor de crédito é zero diferimento"). `ST Valor` da planilha (18,32) bate quase exato com o ICMS ST líquido que o dublê já calculava (18,33), confirmando que o crédito de ICMS normal já está embutido *por dentro* do cálculo do ST — dar um crédito separado além disso seria creditar 2x.

Nova decisão registrada: [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]] — hipótese (não confirmada formalmente) de que produtos com ICMS ST aplicado na nota (`IcmsSt.valor > 0`, dado que já vem do XML, sem precisar da coluna manual "Tributação" da planilha) devem ter o crédito de ICMS entrada zerado no FIXO. Usuário lembra vagamente de já ter ouvido o superior falar algo parecido, sem certeza.

**Combinado com o usuário:** seguir implementando o dublê conforme entendemos correto, manter o vault atualizado com todo raciocínio/decisão, e só depois montar a explicação completa pra validação formal do superior numa conversa.

## Última atualização (09/08/2026 03:27)

Dublê concluído fim a fim (Etapas 1-9, `duble_precificacao_ml.py`) — PIS/COFINS definitivamente separados, Etapa 4 único ponto de cálculo de imposto, Etapas 5-9 só consomem (Custo Final, Coleta, Armazenagem por faixa dinâmica, FIXO, Taxa/Denominador/Preço Final), reaproveitando código real. Rodado pro EAN 7908050700174: preço R$ 913,90 (dublê) vs R$ 1.031,90 (tela real do sistema hoje, mesma margem 15%). Diferença explicada: R$ 81,16/unidade de crédito fiscal de ICMS/PIS/COFINS que o sistema real ignora hoje (campos zerados no banco) — nova nota de conceito [[Credito Fiscal Nao Cumulativo (ICMS PIS COFINS)]] registrada, com o exemplo completo. Resto da diferença (~R$ 37) é uma divergência de custo ainda não investigada (banco R$ 619,70 vs XML R$ 566,27). Ver [[Plano em Etapas do Duble de Precificacao ML]], seção "Implementado e Validado fim a fim — Etapas 5-9".

## Última atualização (09/08/2026 02:18)

Fechado o levantamento de cobertura completo: "fechamos todos os impostos de entrada? temos tudo que a precificação precisa?" — ver [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]. Decisão do usuário: dado do XML sobre custo/impostos de entrada passa a ser usado no sistema; o que não tivermos continua como está até decisão futura. 3 correções importantes ao mapeamento: armazenagem já não vem mais da planilha (sistema calcula por faixa dinâmica, correção própria, anterior a este projeto); custo com bonificação abandonado (custo 0 não faz sentido pra precificar); ICMS/PIS-COFINS de saída e Frete CIF/FOB continuam vindo da planilha — a API de saída da Sysemp está em desenvolvimento em paralelo, sem previsão de prazo.

## Última atualização (08/08/2026 17:15)

Código do dublê corrigido e validado: `duble_precificacao_ml.py` ganhou `_exibir_calculo_didatico_icms_st` (função separada da genérica, ICMS ST não deriva base do custo unitário, recebe o valor do ICMS normal já calculado como dependência explícita). Rodado contra EAN 7908050700174 — resultado exato com a validação manual (ICMS R$ 31,71/un, ICMS ST R$ 18,33/un). Ver [[Plano em Etapas do Duble de Precificacao ML]], seção "Implementado e validado (17:15)". Aguardando validação do tributário/superior, como todo achado de imposto deste domínio.

## Última atualização (08/08/2026 17:00)

**Nova regra criada:** [[Achados de Imposto Sempre Aguardam Validacao do Tributario]] — toda descoberta/correção sobre imposto neste domínio passa a levar o rótulo "aguardando validação do tributário/superior", porque o usuário não tem formação tributária formal, só o aprendizado prático deste projeto. Bater com os dados da API confirma consistência interna, não confirma correção fiscal/legal — são validações diferentes.

**Planilha real conferida pro produto 7908050718117 (`Pasta1.xlsx`, enviada pelo usuário):** os 3 campos que pareciam "só existir no XML" na comparação anterior (custo, IPI, PIS+COFINS) na verdade já estavam certos NA PLANILHA (572,90 / 5,20% / 9,25% — batendo exatamente com o Sysemp) e também o ICMS de saída (12%). O banco é quem estava desatualizado, não a planilha nem o Sysemp. Usuário confirmou: essa planilha é nova, nunca foi importada — banco desatualizado é esperado, não é bug. Revalidado byte a byte o mapeamento de coluna do import (`row[9]`=custo, `row[13]`=ipi, `row[14]`=pis_cofins, `row[15]/16]`=icms_saida) contra essa planilha real — 100% consistente com o que já estava documentado.

**Correção sobre MVA/ST Valor:** o cruzamento de campos que o superior do usuário fez mostrou que `ST Valor` (planilha) tem par direto no XML — é o mesmo dado que `Valor ICMS ST`. A comparação anterior tinha agrupado errado "MVA/ST Valor" como se nenhum tivesse par. `MVA` continua sem par de verdade (é insumo pra calcular a base do ICMS ST quando a empresa mesma calcula; o XML já vem com a base pronta, calculada pelo fornecedor).

**Fórmula de redução (Etapa 7 do dublê) validada com produto de ICMS ≠ 0% real** (EAN 7908050700174, alíquota 18%, redução 68,89% — os produtos testados antes tinham alíquota 0%, não testavam nada). Resultado, ver [[Plano em Etapas do Duble de Precificacao ML]] seção "Correção (17:00)":
- ICMS normal: fórmula bate exata (`base = custo_total × (1−redução)`, `valor = base × alíquota`).
- ICMS ST: fórmula NÃO serve — a base não vem do custo (já tem MVA embutido pelo fornecedor) e o valor não é `base × alíquota` isolado, é `(base × alíquota) − valor ICMS normal` (lógica de substituição tributária — o ST compensa o que já foi cobrado na operação própria). Dublê precisa de correção de arquitetura: ICMS ST como caso especial, dependente do ICMS normal já calculado.

**Tudo isso aguardando validação do tributário/superior.**

## Última atualização (08/08/2026 03:40) — pausa, contexto completo pra retomada

Usuário vai pausar aqui. Resumo de tudo em andamento, pra retomar sem perder o fio (nenhuma decisão de negócio nova nesta entrada, só consolidação):

**Onde as coisas estão fisicamente:**
- Vault: tudo sincronizado, este checkpoint e as notas ligadas a ele (ver `relacionado` acima) são a fonte de verdade do estado.
- Código: repositório `Projeto_Sistema_Interno_V2`, branch `dev`. Última baseline de commit confirmada foi `012b0a7` (ver entrada de 18:04 do dia anterior); depois disso houve mais commits (`77ed72d` e possivelmente novos) que ainda não foram formalmente revisados/commitados nesta sessão — os scripts abaixo existem no ambiente local do usuário, mas o commit deles não foi confirmado.
- Scripts relevantes, todos em `scripts_exploracao_ERP/`: `explorar_manifesto_nota_entrada.py` (busca bruta, paginação corrigida), `filtrar_dados_por_cfop.py` (filtra CFOP válido, achata a estrutura nova da API pra 1 linha = 1 item, salva `dados_filtrados.json`), `selecionar_nota_mais_recente_por_produto.py` (escolhe 1 nota por produto — Data Entrada da Nota + desempate por maior NF, sem separar fornecedor —, salva `nota_mais_recente_por_produto.json` como dict indexado por Código Barras, com TODOS os campos), `dados_xml_nf.py` (dataclasses de domínio: `IdentificacaoProduto`, `IdentificacaoNF`, `DadosNF`, `IdentificadorRegra`, `IcmsSt`, `Icms`, `IcmsRet`, `Ipi`, `Pis`, `Cofins` — com campo `reducao` calculado —, `Custos`, compostas em `DadosXmlNF`), `consultar_produto.py` (demonstração de uso do `DadosXmlNF`), `duble_precificacao_ml.py` (o dublê completo, 10 etapas, só leitura no banco).
- `calcular_custo_atual_por_produto.py` (antigo) está **substituído** por `selecionar_nota_mais_recente_por_produto.py` + `dados_xml_nf.py` — pode ser apagado.

**A sequência de descobertas do dia, em ordem:**
1. A API Sysemp foi remodelada pelo suporte (chamado aberto sobre o campo `Entrada`) — `retorno` agora agrupa por NOTA com itens dentro de `itens_nf`, não é mais 1 item = 1 registro solto. Isso explicou a queda de 578 → 163 registros no mesmo período (mesma quantidade de itens, só reagrupados).
2. O campo `Entrada` (que sempre repetia `Emissão`, um bug conhecido) foi substituído por `Data Entrada da Nota` (nível da nota, nulável) — **validado 2/2** contra a entrada física real que o usuário confirma ter registrado. Considerado confiável agora.
3. `filtrar_dados_por_cfop.py` e o script de seleção de nota mais recente foram reescritos pra nova estrutura.
4. Correção de entendimento: a preocupação anterior sobre "notas de fornecedores diferentes empatando" era suposição errada do Claude — 1 produto sempre vem de 1 fornecedor. Simplificado.
5. `DadosXmlNF` criado — dataclasses compostas por contexto, cada uma com fábrica própria (`a_partir_do_registro`) — registrado como exemplo em [[Modelagem de Objeto e Encapsulamento]].
6. Campo `reducao` adicionado a `Pis`/`Cofins` (a API não devolve isso direto, só pra ICMS/ICMS ST) — calculado 1x na fábrica, recebendo `custo_total` como parâmetro (dado de outra dataclass) — registrado como exemplo em [[Integridade e Fonte Unica de Dado]].
7. Investigação no código real do sistema (não só Sysemp): `Produto` já tem `pis_percentual`/`cofins_percentual` esperando esse dado desde 23/07, mas nenhuma fórmula usa ainda — existe uma "Frente fiscal" pausada no próprio código esperando essa definição. Hoje todo dado fiscal vem de 1 planilha manual (`Planilha_Importar_Pos_Macro.xlsm`).
8. Decisão: não mudar o banco ainda — construir um "dublê" isolado da `FormulaPrecificacao` real do ML, planejado em 10 etapas de baixo pra cima (ver [[Plano em Etapas do Duble de Precificacao ML]]).
9. Dublê implementado e validado fim a fim pro produto teste — preço final R$ 408,90, matemática conferida manualmente em cada etapa (FIXO, denominador, resultado final).

**Estado das dúvidas antigas, todas resolvidas ou superadas:**
- ~~API só retorna última nota~~ → era paginação (resolvido há 2 dias).
- ~~Campo Entrada ≠ entrada física~~ → resolvido pela remodelagem da API (`Data Entrada da Nota`).
- ~~Custo médio vs. custo atual~~ → custo atual, decidido pelo superior.
- ~~Fornecedores diferentes empatando~~ → não é risco real, era suposição errada.

**Em aberto de verdade, pra continuar quando o usuário voltar:**
- Validar a fórmula de redução (Etapa 7 do dublê) com produto real de ICMS/ICMS ST ≠ 0 — o produto teste (7908050719121) tinha alíquota 0% nesses 2, então não testa nada.
- Conferir se `icms_saida_percentual`/`pis_cofins_saida_percentual`/`frete_cif_fob_percentual` = 0 no banco real pra esse produto é dado de verdade ou campo vazio.
- Confirmar com o usuário a escolha feita na Etapa 8 (PIS e COFINS como créditos separados, não combinados no FIXO).
- Testar o dublê com mais produtos.
- Decidir quando/como isso vira escrita real no banco, e a ordem de precedência com a planilha manual atual.
- Replicar o dublê pras outras 5 fórmulas de marketplace, se fizer sentido.
- Sub-questão de alíquota (custo atual) e tratamento de bonificação como nota mais recente — ambas adiadas de propósito, ainda sem decisão.
- Confirmar/fazer o commit dos scripts no repositório de código (não verificado nesta sessão).

## Última atualização (08/08/2026 03:21)

Investigado como o dado fiscal chega hoje na precificação real (código do sistema, não só o pipeline Sysemp): `Produto` já tem `pis_percentual`/`cofins_percentual` prontos desde 23/07, esperando exatamente esse dado — mas nenhuma fórmula usa ainda, e todo campo fiscal hoje vem de 1 planilha Excel manual (`Planilha_Importar_Pos_Macro.xlsm`), sem nenhuma ponte com a Sysemp. Existe até uma "Frente fiscal" (separar PIS/COFINS na fórmula de verdade) documentada como pausada no próprio código, esperando essa definição.

Decisão do usuário: não mudar o banco ainda. Em vez disso, construir um **"dublê"** da `FormulaPrecificacao` real do ML — script isolado, só leitura no banco, que reproduz a fórmula de verdade mas com os dados fiscais vindos do `DadosXmlNF` em vez do `Produto`. Planejado em 10 etapas, de baixo pra cima (mesma lógica dos Níveis de teste): identificação do produto (banco) → coleta/armazenagem (banco/config) → identificação e custo da NF (XML) → impostos brutos (XML) → cálculo de cada imposto por unidade (novo — `base_calculo = custo_unitário × (1 − redução/100)`, derivado algebricamente da própria definição de `redução`) → FIXO → denominador → resto do fluxo real (frete/goal-seek, reaproveitado). Ver [[Plano em Etapas do Duble de Precificacao ML]] pro plano completo e os pontos em aberto.

**Próximo passo real:** implementar e validar etapa por etapa, com calma, começando pela Etapa 1 (identificação do produto).

## Última atualização (08/08/2026 01:55)

`filtrar_dados_por_cfop.py` reescrito pra nova estrutura da API (achata `retorno`/`itens_nf` de volta pra 1 linha = 1 item). `calcular_custo_atual_por_produto.py` foi substituído por `selecionar_nota_mais_recente_por_produto.py` — objetivo corrigido: em vez de resumir os dados da nota mais recente em poucas colunas (o script antigo jogava fora campos de imposto), agora guarda a nota inteira, sem cortar campo, indexada por `Código Barras` (dict, não lista) em `nota_mais_recente_por_produto.json`. Desempate por maior NF simplificado — a checagem de fornecedores distintos foi removida (correção de entendimento: 1 produto sempre vem de 1 fornecedor, não é risco real).

Criados `dados_xml_nf.py` (dataclasses de domínio: `IdentificacaoProduto`, `IdentificacaoNF`, `DadosNF`, `IdentificadorRegra`, `IcmsSt`, `Icms`, `IcmsRet`, `Ipi`, `Pis`, `Cofins`, `Custos`, compostas em `DadosXmlNF`, cada uma com `@classmethod a_partir_do_registro()`) e `consultar_produto.py` (lê o json por EAN e monta o objeto) — ver exemplo registrado em [[Modelagem de Objeto e Encapsulamento]]. Adicionado campo `reducao` em `Pis`/`Cofins`, calculado a partir de `Base de Cálculo` e `Custo Total` (a API não devolve isso direto, só pra ICMS/ICMS ST) — ver [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]] e o exemplo de design em [[Integridade e Fonte Unica de Dado]]. Validado com dado real: produto 7908050719121, redução 48,1%, PIS/COFINS batendo com os valores da API.

**Próximo passo real:** continuar validando `DadosXmlNF` com mais produtos, depois começar os testes de imposto de verdade (objetivo declarado pelo usuário: "ter os impostos corretos que preciso").

## Última atualização (07/08/2026 21:12)

Chamado que o usuário tinha aberto com o suporte Sysemp sobre o campo `Entrada` (ver 14:08) voltou — mas não como correção pontual: a Sysemp remodelou a estrutura inteira do endpoint `listarManifestoNotaEntrada`. `retorno` agora agrupa por NOTA (163 no período testado), com os itens dentro de `itens_nf` (578 no total — mesma contagem de antes, nenhum dado perdido, só reestruturado). Campo `Entrada` não existe mais; substituído por `Data Entrada da Nota`, no nível da nota e nulável.

`investigar_ocorrencias_de_produto.py` reescrito pra navegar a estrutura nova (nota → `itens_nf`) e revalidado: mesmas 21 ocorrências do produto teste, mesma distribuição de CFOP (15x 1.102, 5x 1.916, 1x 1.910) — reestruturação não perdeu nada.

**Campo `Entrada` resolvido de fato:** `Data Entrada da Nota` validado 2 de 2 contra os mesmos casos do achado original (NF 101445 e NF 101561) — bate exatamente com a entrada física real que o usuário confirma ter registrado (05/08 pras 2). Ver seção "Resolução" em [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]].

**Correção de entendimento (mea culpa):** a preocupação levantada em 14:08 sobre empate entre notas de fornecedores diferentes pro mesmo produto era baseada numa suposição errada minha (de que 1 produto poderia vir de fornecedores distintos). O usuário confirma: na prática, 1 produto sempre vem de 1 fornecedor/fabricante — esse cenário não é um risco real do negócio. A distinção "mesmo fornecedor vs. fornecedores diferentes" em `calcular_custo_atual_por_produto.py` pode ser simplificada/removida quando o script for reescrito.

**Pendente (próximo passo real):** reescrever `filtrar_dados_por_cfop.py` e `calcular_custo_atual_por_produto.py` pra nova estrutura da API — o segundo também passa a usar `Data Entrada da Nota` (agora confiável) em vez de `Entrada`, e remove a checagem de fornecedores distintos.

## Última atualização (07/08/2026 18:04)

Troca de PC do usuário a partir daqui — sem trabalho novo de código/decisão nesta entrada, só um reforço registrado na descoberta do campo `Entrada`: nos 2 casos confirmados, `Entrada` da API é sempre idêntico à `Emissão` da própria API (não só "diverge da tela do ERP") — ver [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]]. Linha de base de código confirmada: repositório em `012b0a7` (branch `dev`, GitHub) — nada pendente de commit no lado do código Sysemp; o vault está sincronizado com o GitHub em tempo real nesta sessão (confirmado via `git fetch`, sem necessidade de push manual, diferente do que era esperado antes).

## Última atualização (07/08/2026 14:08)

Construindo o pipeline de custo atual (`calcular_custo_atual_por_produto.py`, novo — filtra CFOP válido → agrupa produto+data → pega a data mais recente → exibe em tabela Rich), apareceu um "empate" (2 notas do mesmo produto/fornecedor, aparentemente na mesma data) que virou uma descoberta bem maior: comparando o registro cru da API com a tela real do ERP pra essas 2 notas, `Emissão` bate mas `Entrada` diverge — API diz 31/07/2026, tela do ERP diz 05/08/2026, pra exatamente a mesma nota fiscal. Hipótese: o campo `Entrada` do endpoint `listarManifestoNotaEntrada` reflete a data do manifesto/confirmação fiscal (perto da Emissão), não a entrada física real da mercadoria no estoque. Ver [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]] pro achado completo.

**Decisão do usuário:** não existe outro endpoint Sysemp disponível agora pra pegar a entrada física real — segue trabalhando com o campo `Entrada` da API como está, aceitando a limitação conhecida, pra não travar o avanço. Fica registrado como risco sistêmico (pode afetar qual nota é escolhida como "mais recente" em qualquer produto, não só neste caso) — revisar se/quando o suporte da Sysemp confirmar outro campo/endpoint.

Também corrigido nesta sessão: `filtrar_dados_por_cfop.py` estava com a lista de CFOP desatualizada (ainda tinha 1.916/2.916, faltava 1.403/2.403) — corrigido pra bater com a decisão de 11:26. Critério de desempate pra 2 notas do mesmo produto na mesma data definido: maior número de NF (fornecedores numeram sequencialmente) — só válido entre notas do MESMO fornecedor, com aviso crítico separado se o empate envolver fornecedores diferentes.

## Última atualização (07/08/2026 11:26)

Reunião com o superior aconteceu (item 7 da atualização anterior). 2 resultados: **custo atual** escolhido (não médio ponderado) — ver [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]], que resolve [[Custo Medio Ponderado ou Custo Atual para Precificacao]]; e a lista de CFOP válidos ampliada de 4 pra 6 códigos, com **1.403/2.403** entrando como compra/bonificação válida — ver atualização em [[Lista de CFOP Relevantes para Precificacao]]. Sub-questão de alíquota não tratada, continua em aberto. Novo ponto em aberto, adiado de propósito pelo usuário: como tratar bonificação (custo zero) quando ela é a nota mais recente de um produto sob a lógica de "custo atual" — decisão explícita de não resolver agora, só "conforme formos seguindo".

Fora do domínio fiscal: a pasta vazia `03_ERP_Analytics_HUB/` (criada antes deste mundo ganhar nome definitivo) foi removida — `03_Integracao_Sysemp/` confirmado como nome definitivo do mundo.

**Próximo passo real:** começar a implementar a lógica de custo atual em código (ainda não escrita — só as decisões de negócio estavam prontas até aqui).

## Última atualização (07/08/2026 01:32) — histórico

Resumo do dia, na ordem em que aconteceu — pensado pra servir de roteiro de apresentação.

**1. CFOP identificados.** Pesquisado o significado de CFOP 1949 (genérico/coringa), 1916 (retorno de conserto), 1101 (compra pra industrialização) e 1910 (bonificação/doação/brinde), pra completar o que o usuário já sabia (1556 uso/consumo, 2102/1102 revenda, 1653 combustível).

**2. Primeira versão da lista de CFOP pra revenda.** Definida em 3 categorias: revenda (1.102/2.102), bonificação (1.910/2.910), retorno de conserto (1.916/2.916). Script `filtrar_dados_por_cfop.py` criado e validado contra amostra real (49 de 100 registros mantidos).

**3. Investigação da "última nota por produto".** Usuário desconfiou que um produto (7908050719121) que ele sabia ter comprado várias vezes só aparecia 1 vez na API. Descoberta inicial (errada): pensava-se que a API deduplicava pra só a última nota — ver [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]].

**4. Causa real: paginação não tratada.** Toda chamada usava `offset='0'`. Confirmado com testes manuais (offset=0 e offset=100 trazendo NFs diferentes) que o endpoint pagina em blocos de ~100 registros, sem qualquer campo no envelope de resposta (`qtde`) que informe o total real do período.

**5. Correção implementada e validada.** `ImpostosEntradaXML.listar_periodo_completo()` — loop de paginação que para só em página vazia. Validado contra a API real: 100 → 578 registros no período maio–agosto; o produto teste foi de 4 para 21 ocorrências reais, recuperando as notas de 1000 e 8 unidades que o usuário sabia ter dado entrada. Ver [[Paginacao do Endpoint Manifesto Nota Entrada]].

**6. CFOP revalidado com histórico completo.** As 21 ocorrências do produto teste confirmaram a leitura teórica: 15x CFOP 1.102 (compras reais, 30–1344 unidades), 5x CFOP 1.916 (retorno de conserto, sempre poucas unidades: 1, 6, 4, 6, 2), 1x CFOP 1.910 (bonificação). Decisão fechada: custo de aquisição confiável só em 1.102/2.102 — ver [[Lista de CFOP Relevantes para Precificacao]]. A paginação corrigida também eliminou o "risco de perda de histórico" que motivou a descoberta do item 3: as compras reais continuam presentes independente de quantas notas de bonificação/conserto existirem no meio.

**7. Em aberto pra amanhã.** Custo médio ponderado vs. custo atual pra precificação, e se faz sentido tirar média de alíquota — ver [[Custo Medio Ponderado ou Custo Atual para Precificacao]]. Também em aberto: se vale pedir ao suporte Sysemp um endpoint de histórico por produto mais direto, e se o loop de paginação precisa de um limite de segurança contra loop infinito.

## Próximos passos

- ~~Escrever o serviço/cliente que chama a API do Sysemp e aciona `registrar_sincronizacao_bem_sucedida()`/`registrar_falha()` do model `SincronizacaoXmlManifestoNotaEntrada`.~~ — feito (10/08, 00:55): ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]].
- ~~Rodar a sincronização de verdade contra a API real pela 1ª vez.~~ — feito (10/08, 02:00): carga histórica completa desde 2020-05-01, 5m21s, ver detalhe acima e na decisão de orquestração.
- ~~Decidir como tratar campos de imposto vindos `null` da API~~ — feito (10/08, 12:05): vira `0`, explícito, ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]].
- **Desenhar como reprocessar especificamente o histórico antigo (320 erros)** — agora desbloqueado (decisão do `null` já tomada), mas ainda sem desenho — sincronizações futuras só olham a janela nova (7 dias), nunca voltam a reler as notas de 2020-2026 já fora da cobertura.
- **Investigar os 2055 produtos (54% dos selecionados) sem `Produto` correspondente no banco** — produto descontinuado de verdade, ou divergência de formato de EAN entre Sysemp e o cadastro?
- Implementar o comando `manage.py iniciar_servidor` (hoje o disparo é manual, via `sincronizar_impostos_entrada`).
- Definir cooldown entre tentativas de falha consecutivas (`data_ultima_chamada` já sustenta isso).
- ~~Oficializar `dados_xml_nf.py` fora de `scripts_exploracao_ERP/`~~ — feito (10/08, 12:05), ver [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]].
- Decidir onde o aviso visual de "dados desatualizados" aparece na tela, e o formato do botão manual de sincronizar.
- ~~Reunião com o superior (07/08/2026): decidir custo médio vs. custo atual.~~ — feito, custo atual escolhido.
- ~~Implementar a lógica de custo atual em código.~~ — feito, `calcular_custo_atual_por_produto.py` criado e funcionando (com a limitação de `Entrada` registrada como risco conhecido).
- ~~Confirmar com o suporte da Sysemp se existe campo/endpoint pra entrada física real da mercadoria.~~ — feito: a Sysemp remodelou a API; `Data Entrada da Nota` resolve isso, validado 2/2 — ver [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]].
- ~~Reescrever `filtrar_dados_por_cfop.py` e `calcular_custo_atual_por_produto.py` pra nova estrutura da API.~~ — feito (ver 01:55): o segundo foi substituído por `selecionar_nota_mais_recente_por_produto.py` + `dados_xml_nf.py`.
- Validar `DadosXmlNF` com mais produtos (só 7908050719121 testado até agora).
- Implementar e validar, etapa por etapa, o Dublê de Precificação ML — ver [[Plano em Etapas do Duble de Precificacao ML]].
- ~~Validar a fórmula de redução (etapa 7 do dublê) com produto real de ICMS/ICMS ST ≠ 0.~~ — feito (17:00): ICMS normal validado exato; ICMS ST precisa de correção de arquitetura (base vem de campo bruto, valor líquido do ICMS normal).
- ~~Corrigir o código do dublê pra tratar ICMS ST como caso especial.~~ — feito e validado (17:15), resultado exato.
- Rodar `listar_periodo_completo` contra o histórico completo (desde a fundação da empresa), não só maio–agosto.
- Revisitar a lista de CFOP com o histórico completo (pode aparecer CFOP não visto ainda) — agora com 6 códigos, não 4.
- Decidir se precisa de limite de segurança no loop de paginação.
- Em algum momento (adiado de propósito): decidir como "custo atual" trata bonificação sendo a nota mais recente.

## Relacionado

- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Lista de CFOP Relevantes para Precificacao]]
- [[Custo Medio Ponderado ou Custo Atual para Precificacao]]
- [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]]
- [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]
- [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]]
- [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]
- [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]]
- [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]]
- [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
- [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]
