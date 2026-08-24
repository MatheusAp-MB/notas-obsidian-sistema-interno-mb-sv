---
tipo: regra
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 24/08/2026 16:58
relacionado: [Estrutura e Convenções do Vault]
---

# Índice — Produção de Imagens e Vídeos

Mundo isolado — reestruturado em 23/08/2026 pra se tornar um vault autônomo no futuro, sem depender das convenções de organização do resto do vault (ver [[00_Leia_Primeiro]], nota "Reestruturado em 23/08/2026"). Cobre a PRODUÇÃO de fotos e vídeos dos produtos (fotos de anúncio, vídeos simples, vídeos complexos, fotos de referência). Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por pasta. Atualizado junto da autorização de escrita de cada nota.

## Raiz

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[00_Leia_Primeiro]] | checkpoint | em_andamento | 23/08/2026 | Ponto de partida único do mundo — histórico de sessões, arquitetura corrigida, numeração canônica de Étapas (0-8), status real de cada peça do pipeline, o que está em aberto. |

## 01_Pipeline

Étapas do pipeline já formalizadas como prompt autocontido — quem executa não precisa de nenhum contexto de conversa anterior, só do que está escrito na nota.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Etapa 1-4 - Estudo do Produto]] | prompt | ativa | 23/08/2026 | Étapas 1-4 — leitura fiel dos dados brutos, análise técnica (nunca responde pergunta), análise contextual livre, fusão validada (dor × recurso técnico real). |
| [[Etapa 5 - Navegacao pelos Grafos]] | prompt | ativa | 23/08/2026 | Étapa 5 — classifica o produto no Grafo 1, ativa/cria templates no Grafo 2 (com reaproveitamento cross-categoria) e monta o cruzamento final. Desde 23h11, lê o índice compacto do grafo em vez das pastas inteiras. Ainda não testado às cegas numa conversa nova. |
| [[Protocolo de Feedback e Correcao]] | prompt | ativa | 23/08/2026 | Capacidade paralela (não é etapa numerada) — tria feedback do usuário sobre uma geração específica em 5 causas possíveis e escreve a correção na nota certa, reaproveitando a disciplina de `bug_conhecido`. |
| [[Etapa 8 - Criacao (Fotos)]] | prompt | ativa | 23/08/2026 | Prompt autocontido da Étapa 8 — unifica Trava da Capa + Responsabilidade Única + Proibição de Comparação + Camada Gráfica + Regras de Prompt de Imagem num único fluxo: lê Étapa 6 + pool de sugestões (Étapa 7) e produz os 7 prompts de foto. Ganhou a Regra Universal #9 (proibir texto extra não especificado) em 24/08/2026, após defeito real na Foto 2 do DAS G2. |

## 02_Regras/Comportamento

Regras de processo — como conduzir o pipeline (não o que ele produz).

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Pipeline Completo Roda Numa Unica Conversa Cowork]] | regra | ativa | 23/08/2026 | Tudo desde a Étapa 1 até a geração final roda numa única conversa Cowork; o teste é "precisa de leitura/escrita de arquivo do vault ou não", nunca "esta conversa vs. outra". |
| [[Visibilidade Durante Fase de Teste]] | regra | ativa | 22/08/2026 | Mostrar cada etapa ao usuário antes de seguir pra próxima, enquanto a categoria não provou confiabilidade; decisão de virar autônomo é por categoria. |
| [[Task Obrigatoria por Etapa do Pipeline]] | regra | ativa | 22/08/2026 | 1 task do Cowork por etapa do pipeline de um produto novo — trava visível sem precisar de subagente com contexto isolado. |

## 02_Regras/Pensamento

Regras de domínio — como pensar a Base de Conhecimento e o Grafo.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Tags de Proveniencia de Dado]] | regra | ativa | 22/08/2026 | [TEXTO] / [IMG] / [TEXTO+IMG] / dado ausente / N/A / [USUÁRIO] — toda linha de fato/cruzamento precisa de 1 tag rastreável. |
| [[Isolamento Entre Produtos e Categorias no Grafo]] | regra | ativa | 22/08/2026 | Nenhuma nota do Grafo 1/2 cita produto específico; classificação nova nunca lê `04_Produtos/`. |
| [[Principio de Granularidade do Grafo 1]] | regra | ativa | 22/08/2026 | Nó só existe se muda quais templates do Grafo 2 são ativados — senão vira valor de campo, não nó novo. |
| [[Eixos Que Nunca Podem Ficar Ambiguos]] | regra | ativa | 22/08/2026 | Fonte de energia (Manual/Elétrico/Elétrico e Manual) e Unidade de venda (item único/kit) — sempre nós distintos, checar antes de classificar. |

## 03_Grafo (raiz)

Arquivo de índice compacto — consulta obrigatória da Étapa 5, evita ter que ler `1_O_Que_E/` ou `2_O_Que_Pode_Ter/` inteiras.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[_Indice do Grafo (Nos e Templates)]] | regra | ativa | 23/08/2026 | Tabela "Grafo 1 — Nós" + tabela "Grafo 2 — Templates", com resumo de definição/perguntas e o que cada um aciona. Precisa ser atualizado na mesma escrita de toda nota nova ou "Ativado por"/"Aciona" adicionado. |

## 03_Grafo/1_O_Que_E

Classificação/identidade do produto — "o que ele é".

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Pulverizador]] | conceito | ativa | 22/08/2026 | Nó raiz da categoria pulverizador. |
| [[Pulverizador Costal]] | conceito | ativa | 22/08/2026 | Filho de Pulverizador — transporte nas costas do operador. |
| [[Pulverizador Elétrico e Manual]] | conceito | ativa | 22/08/2026 | Fonte de energia dupla — eixo que nunca pode ficar ambíguo. |
| [[Pulverizador Manual]] | conceito | ativa | 23/08/2026 | Fonte de energia — irmão de Pulverizador Elétrico e Manual; confirmado com o Guarany 1,2L. |
| [[Pulverizador de Mão]] | conceito | ativa | 23/08/2026 | Modo de operação/transporte — irmão de Pulverizador Costal; confirmado com o Guarany 1,2L. |
| [[Uso Restrito a Substâncias Líquidas]] | conceito | ativa | 22/08/2026 | Restrição de uso — só líquidos, sem pó/corrosivo/inflamável/solvente. |
| [[Uso em Jardim e Propriedade Rural]] | conceito | ativa | 22/08/2026 | Contexto de aplicação geral (não agrícola profissional regulado). |
| [[Unidade de Venda - Item Único]] | conceito | ativa | 22/08/2026 | Eixo transversal — vendido como 1 unidade, não kit. |
| [[Unidade de Venda - Kit ou Conjunto]] | conceito | ativa | 23/08/2026 | Eixo transversal, irmão de Unidade de Venda - Item Único — confirmado na prática (par de muletas). |
| [[Cadeira de Rodas]] | conceito | ativa | 23/08/2026 | Nó raiz da categoria cadeira de rodas. |
| [[Cadeira de Rodas Motorizada]] | conceito | ativa | 23/08/2026 | Fonte de energia — filho de Cadeira de Rodas; ativa Bateria e Energia (reaproveitado do Pulverizador). |
| [[Cadeira de Rodas Dobrável]] | conceito | ativa | 23/08/2026 | Estrutura dobrável — filho de Cadeira de Rodas. |
| [[Muleta]] | conceito | ativa | 23/08/2026 | Nó raiz da categoria muleta — apoio físico complementar, diferente de cadeira de rodas (não substitui a locomoção). |
| [[Muleta Axilar]] | conceito | ativa | 23/08/2026 | Tipo de apoio superior — filho de Muleta; eixo nunca ambíguo (axilar vs. antebraço). |
| [[Pulverizador Gerador de Espuma (Snow Foam)]] | conceito | ativa | 23/08/2026 | Filho de Pulverizador — eixo de mecanismo (sistema integrado de geração de espuma), independente de energia/transporte. Confirmado com o Snow Chantilly Veneto. |
| [[Uso em Estética Automotiva e Limpeza Doméstica]] | conceito | ativa | 23/08/2026 | Filho de Pulverizador, irmão de Uso em Jardim e Propriedade Rural — contexto de detalhamento automotivo/limpeza doméstica. Confirmado com o Snow Chantilly Veneto. |

## 03_Grafo/2_O_Que_Pode_Ter

Templates de característica — "o que ele pode ter", agnósticos de categoria.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Dimensões e Peso]] | conceito | ativa | 22/08/2026 | Template ativado por Pulverizador. |
| [[Reservatório e Tanque]] | conceito | ativa | 22/08/2026 | Template ativado por Pulverizador. |
| [[Mecanismo de Bombeamento]] | conceito | ativa | 22/08/2026 | Template ativado por Pulverizador; inclui tipo de bomba como valor de dado. |
| [[Lança]] | conceito | ativa | 22/08/2026 | Template ativado por Pulverizador; inclui tipo de lança como valor de dado. |
| [[Bico e Jato]] | conceito | ativa | 22/08/2026 | Template ativado por Pulverizador; inclui quantidade de bico como valor de dado. |
| [[Ergonomia de Uso Costal]] | conceito | ativa | 22/08/2026 | Template ativado por Pulverizador Costal. |
| [[Bateria e Energia]] | conceito | ativa | 22/08/2026 | Template ativado por Pulverizador Elétrico e Manual; reaproveitável entre categorias. |
| [[Restrição Química de Uso]] | conceito | ativa | 22/08/2026 | Template ativado por Uso Restrito a Substâncias Líquidas. |
| [[Contexto de Aplicação]] | conceito | ativa | 22/08/2026 | Template ativado por Uso em Jardim e Propriedade Rural. |
| [[Unidade de Venda - Campos]] | conceito | ativa | 22/08/2026 | Template ativado por Unidade de Venda - Item Único. |
| [[Capacidade de Carga do Usuário]] | conceito | ativa | 23/08/2026 | Template ativado por Cadeira de Rodas. |
| [[Estrutura e Chassi]] | conceito | ativa | 23/08/2026 | Template ativado por Cadeira de Rodas. |
| [[Rodas]] | conceito | ativa | 23/08/2026 | Template ativado por Cadeira de Rodas. |
| [[Ergonomia de Assento e Encosto]] | conceito | ativa | 23/08/2026 | Template ativado por Cadeira de Rodas. |
| [[Sistema de Motorização]] | conceito | ativa | 23/08/2026 | Template ativado por Cadeira de Rodas Motorizada; reaproveitável entre categorias. |
| [[Portabilidade e Transporte]] | conceito | ativa | 23/08/2026 | Template ativado por Cadeira de Rodas Dobrável. |
| [[Manopla]] | conceito | ativa | 23/08/2026 | Template ativado por Muleta. |
| [[Sistema de Ajuste de Altura]] | conceito | ativa | 23/08/2026 | Template ativado por Muleta; reaproveitável entre categorias ajustáveis. |
| [[Apoio de Axila]] | conceito | ativa | 23/08/2026 | Template ativado por Muleta Axilar. |
| [[Empunhadura e Mecanismo de Acionamento]] | conceito | ativa | 23/08/2026 | Template ativado por Pulverizador de Mão; alça integrada, alavanca/gatilho, trava/regulador. |
| [[Sistema de Geração de Espuma (Snow Foam)]] | conceito | ativa | 23/08/2026 | Template ativado por Pulverizador Gerador de Espuma (Snow Foam); presença/princípio do mecanismo, diluição/pH do produto químico recomendado. |

## 03_Grafo/3_Como_Mostrar

Banco de sugestões (não regras) por gatilho — cada gatilho é um nó do Grafo 1 ou um template do Grafo 2. Somadas por produto (todo gatilho que o produto toca) e especializadas com o dado real da base densa na Étapa 7 (Consolidação Criativa).

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Cenário de Capa - Ambiente Residencial Externo]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Cadeira de Rodas. Confirmado com a D800 Dellamed. |
| [[Cenário de Capa - Horta, Pomar ou Jardim Doméstico]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Uso em Jardim e Propriedade Rural. Confirmado com a SS-20B Brudden. |
| [[Cenário de Capa - Ambiente Doméstico Interno]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Muleta. Confirmado com a Muleta Axilar Hidrolight — 2 gerações (GPT e Gemini), ambas aprovadas. |
| [[Controle Motorizado em Destaque]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Cadeira de Rodas Motorizada. Proposto, ainda não testado. |
| [[Redução de Tamanho para Transporte]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Cadeira de Rodas Dobrável. Proposto, ainda não testado. |
| [[Demonstração de Dupla Fonte de Energia]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Pulverizador Elétrico e Manual. Proposto, ainda não testado. |
| [[Sugestões — Par (Unidade de Venda)]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Unidade de Venda - Kit ou Conjunto. Proposto. |
| [[Sugestões — Muleta]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Muleta. Sugestões de uso, produto como um todo, contexto de paciente. Proposto. |
| [[Sugestões — Muleta Axilar]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Muleta Axilar. Sugestões sobre apoio de axila. Proposto. |
| [[Sugestões — Sistema de Ajuste de Altura]] | conceito | ativa | 23/08/2026 | 1º gatilho de Grafo 2 do vault (não de Grafo 1). Sugestões sobre faixa de altura e mecanismo de ajuste. Proposto. |
| [[Sugestões — Pulverizador Manual]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Pulverizador Manual. Sugestões sobre independência elétrica (sem bateria/tomada). Proposto. |
| [[Sugestões — Empunhadura e Mecanismo de Acionamento]] | conceito | ativa | 23/08/2026 | 2º gatilho de Grafo 2 do vault. Sugestões sobre alça, gesto de bombear e acionar a alavanca. Proposto. |
| [[Cenário de Capa - Área de Estética Automotiva ou Limpeza Externa]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Uso em Estética Automotiva e Limpeza Doméstica. Cenário de garagem/lava-rápido ou limpeza doméstica externa. Proposto. |
| [[Sugestões — Pulverizador Gerador de Espuma (Snow Foam)]] | conceito | ativa | 23/08/2026 | Gatilho de Grafo 1: Pulverizador Gerador de Espuma (Snow Foam). Sugestões sobre mostrar a espuma em ação, não só o equipamento parado. Proposto. |

## 04_Produtos

Documento Consolidado (Étapa 6) de cada produto já classificado — a única nota que qualquer gerador de conteúdo (foto, vídeo, título, descrição) deve ler.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[_Molde - Documento Consolidado (Etapa 6)]] | regra | ativa | 23/08/2026 | Molde vazio da Étapa 6 — quem escreve um produto novo lê este arquivo, nunca um produto real já preenchido, pra evitar contaminação de dado entre produtos. |
| [[Pulverizador Costal SS-20B Brudden]] | conceito | ativa | 23/08/2026 | 1º produto classificado — fatos, funcionamento, contexto de compra, 3 eixos de venda validados, decisões de exclusão e cruzamento completo com o Grafo 2. |
| [[Cadeira de Rodas Motorizada Dobrável D800 Dellamed]] | conceito | ativa | 23/08/2026 | 2º produto, categoria diferente do 1º. Validou reaproveitamento de nó/template (Bateria e Energia) e criação correta de nós/templates genuinamente novos. |
| [[Muleta Axilar 3 em 1 Alumínio até 130kg Ajustável Hidrolight]] | conceito | ativa | 23/08/2026 | 3º produto, 3ª categoria. 1º teste de ponta a ponta completo dentro da própria conversa Cowork, com 2 gerações de imagem aprovadas. Confirmou 1ª ativação real de "Unidade de Venda - Kit ou Conjunto". |
| [[Pulverizador Manual de Compressão Prévia Guarany 1,2L]] | conceito | ativa | 23/08/2026 | 4º produto, mesma categoria-base do 1º (Pulverizador) mas subtipo genuinamente novo. Confirmou 2 nós novos de uma vez e 1 template novo. 1º teste completo do método de Fotos 2-7 (responsabilidade única + camada gráfica + proibição de comparação). |
| [[Pistola de Pintura SGT-3011B 1,3mm Gravidade 600ml]] | conceito | ativa | 23/08/2026 | 5º produto, categoria genuinamente nova (Pistola de Pintura). Testou a Étapa 8 unificada fora de pulverizador; gerou o ciclo de feedback que produziu as correções de 23h11 (desejo de compra, índice compacto, molde vazio). |
| [[Pulverizador Snow Foam Chantilly Veneto SGT 2L]] | conceito | ativa | 23/08/2026 | 6º produto, mesma categoria-base do 1º/4º (Pulverizador) com 2 eixos novos: mecanismo (gerador de espuma integrado) e contexto (estética automotiva/limpeza doméstica). 1º teste real do índice compacto (Étapa 5) e do molde vazio (Étapa 6) — funcionaram bem. Étapa 8 rodou mas revelou 5 gaps ainda não corrigidos (ver [[00_Leia_Primeiro]], entrada 24/08 00h23). |
| [[Pulverizador Manual Costal Brudden DAS G2 5L]] | conceito | ativa | 24/08/2026 | 7º produto, mesma categoria-base do 1º/4º/6º (Pulverizador). 100% reaproveitamento de grafo — nenhum nó/template novo. Teste de ponta a ponta pausado em 24/08/2026 14:00 antes de fechar a Étapa 8 (Foto 1 sem aprovação registrada, Foto 2 corrigida mas não regerada, Fotos 3-7 nunca geradas) — ver [[00_Leia_Primeiro]], entrada 24/08 14:00. |

## 05_Decisoes

Decisões de arquitetura do mundo inteiro — nível mais alto, raramente mudam.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]] | decisao | ativa | 23/08/2026 | A decisão central do mundo — pipeline de Étapas 0-8, Grafo 1 (o que é) + Grafo 2 (o que pode ter) + Grafo 3 (como mostrar), reaproveitamento antes de criação. Bootstrap validado com 4 produtos. |
| [[Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]] | conceito | ativa | 22/08/2026 | O problema original — 4 tipos de material necessários (fotos anúncio, vídeo simples, vídeo complexo, fotos de referência), sem automação; vídeo é mais difícil que foto (calibração por categoria). |

## 06_Criacao_de_Conteudo/Fotos

Regras e método por trás da Étapa 8 (Criação) — cada nota aqui documenta a origem, os exemplos testados e os erros corrigidos de 1 peça do método. O prompt executável único que unifica todas elas vive em [[Etapa 8 - Criacao (Fotos)]], dentro de `01_Pipeline/`.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]] | decisao | ativa | 23/08/2026 | Guia universal de como escrever um prompt de imagem (Nano Banana + GPT-Image): 5 regras globais, 9 regras universais (a 9ª adicionada em 24/08/2026 — proibir texto extra não especificado), pré-requisito de qualidade da foto de referência, esqueleto de 6 blocos estruturados. Exemplos por categoria vivem no Grafo 3. |
| [[Trava de Formato da Foto de Capa]] | regra | ativa | 23/08/2026 | Única trava por slot de foto — produto ambientalizado no contexto de uso, sem humanos, só na Foto 1. Trava de formato, não de conteúdo; Fotos 2-7 seguem livres. |
| [[Responsabilidade Unica por Foto (Fotos 2-7)]] | regra | ativa | 23/08/2026 | Método pras 6 fotos livres: ler a base densa, perguntar "o que o cliente quer saber?", 1 foto = 1 pergunta, sem repetir e sem lacuna. |
| [[Proibicao de Comparacao com Concorrentes]] | regra | ativa | 23/08/2026 | Nenhuma foto compara com "outro produto"/concorrente — anti-invenção + a loja vende marcas concorrentes entre si. |
| [[Camada Grafica Informativa (Fotos 2-7)]] | decisao | ativa | 23/08/2026 | Como compor cada foto informativa — headline, ícones, diagramas, chamadas, selos, fundo dinâmico desfocado (nunca liso), fidelidade de cor por componente (nunca genérica). Ganhou ressalvas sobre linhas de chamada e colagem em quadrantes (técnicas frágeis) em 23h11. |
| [[Desejo de Compra na Camada Grafica (Fotos 2-7)]] | decisao | ativa | 23/08/2026 | As fotos informavam mas não vendiam — 5 técnicas (headline de promessa, produto em ação como padrão, ícone+benefício+resultado, specs em tira de apoio, selo embutido em foto de ação) derivadas de anúncio real concorrente. Incerteza registrada: ainda não confirmado se generaliza sem imagem de referência nova a cada vez. |

## 06_Criacao_de_Conteudo/Videos

Pesquisa e regras iniciais de vídeo (showroom/turntable 360° via Google Flow — Omni Flash e Veo 3.1). Ainda não é uma Étapa numerada do pipeline — só a Étapa 8 (fotos) existe hoje. Aberta em 24/08/2026, depois de pausar o teste de fotos do 7º produto pra focar nesta pesquisa.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[_Pesquisa - Documentacao Oficial Veo 3.1, Gemini Omni e Google Flow]] | conceito | ativa | 24/08/2026 | Extração de 25 páginas oficiais do Google (Veo 3.1, Gemini Omni/Omni Flash, Google Flow, Nano Banana). Mapa do ecossistema, os 3 mecanismos de imagem→vídeo do Flow, estruturas de prompt oficiais (Veo e Omni), vocabulário de câmera documentado. |
| [[Regras de Prompt de Video - Fundamentado em Documentacao Oficial e Testes Reais]] | decisao | ativa | 24/08/2026 | Guia de prompt de vídeo (showroom/turntable), equivalente ao das fotos. Esqueleto de 7 blocos genérico e reaproveitável, mas conteúdo de cada bloco precisa ser concreto (erro real: vocabulário abstrato piorou fidelidade). Padrão de duração 6-10s, hipótese de "familiaridade do modelo com a categoria", ressalva sobre fotos de referência semelhantes. |

## 06_Criacao_de_Conteudo/Historico

Notas de contexto histórico — superadas pela decisão atual, mantidas por rastreabilidade.

| Nota | Tipo | Status | Data | Resumo |
| --- | --- | --- | --- | --- |
| [[Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack]] | conceito | ativa | 22/08/2026 | 2 sistemas em uso antes deste vault: GPTs prontos (bom resultado, engessado/lento) e We Stack via API (rápido, genérico). Nenhum resolvia qualidade + agilidade + personalização junto. |
| [[Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets]] | decisao | ativa | 22/08/2026 | Desenho original (análise técnica+contextual → compilação dinâmica das 7 fotos) — superado pelo [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]. |
