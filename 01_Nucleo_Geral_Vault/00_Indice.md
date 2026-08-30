---
tipo: regra
dominio: 
status: ativa
criado: 29/08/2026
atualizado_em: 30/08/2026 16:18
relacionado: [Definição do Núcleo Geral do Vault]
---

# Índice — Núcleo Geral do Vault

Índice obrigatório deste mundo — 1 linha de resumo por nota. Atualizado junto da autorização de escrita de cada nota (ver [[Regra do Índice Obrigatório]]).

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]] | regra | ativa | 16/08/2026 | Modo Professor — toda nota responde O QUÊ/POR QUÊ/PRA QUÊ/COMO; 8 regras práticas (nunca abreviar nome, comando sempre em bloco próprio, exemplo concreto, tabela pra 3+ itens) e checklist obrigatório antes de considerar a nota pronta. |
| [[Aviso Proativo Para Notas no Obsidian]] | regra | ativa | 02/08/2026 | Claude avisa sozinho quando algo for relevante pra salvar no vault, sem esperar pedido — memória de conversa é RAM, Obsidian é o HD. |
| [[Perguntar Data e Hora Antes de Escrever no Vault]] | regra | ativa | 03/08/2026 | Antes de escrever/editar nota, pergunta data/hora ao usuário (1x por bloco, não por arquivo) — todo write atualiza `atualizado_em`. |
| [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]] | checkpoint | em_andamento | 16/08/2026 | Checkpoint vivo da exploração de recursos visuais/organizacionais do Obsidian (Bases, plugins de cor/ícone, Graph View, Bookmarks) — cresce a cada rodada de teste, ainda em andamento. |
| [[Evolucao do Controle de Contexto e Execucao - Do Prompt de Migracao ao Vault Como Segundo Cerebro]] | conceito | ativa | 22/08/2026 | Registro histórico de como o vault nasceu e evoluiu — do prompt inicial de migração até virar o "segundo cérebro" que é hoje. |
| [[Definição do Núcleo Geral do Vault]] | regra | ativa | 29/08/2026 | Define o que entra neste mundo (regra que só existe por causa deste vault específico) e documenta a reorganização de 29/08 que esvaziou `01_Notas_Gerais/` e criou este mundo. |
| [[Princípios Fundamentais do Vault]] | regra | ativa | 30/08/2026 | Os 4 princípios que qualquer recurso novo do vault precisa respeitar, nesta ordem: só Claude escreve, didático antes de bonito, Claude gera tudo sozinho, texto sempre acompanha recurso visual. |
| [[Registro dos Mundos Ativos]] | regra | ativa | 30/08/2026 | Lista viva dos mundos/núcleos ativos e o que cada um reúne — inclui histórico de LEGADO removido e da renumeração de 29/08. |
| [[Critério para Criação de um Mundo Novo]] | regra | ativa | 30/08/2026 | Quando uma integração externa nova merece virar mundo próprio em vez de contexto — decidido caso a caso, sem régua numérica fixa. |
| [[Convenção de Nomenclatura de Arquivos e Pastas]] | regra | ativa | 30/08/2026 | Nome de arquivo de nota = nome do wikilink, com espaço; nome de pasta usa underscore com prefixo numérico quando aplicável. |
| [[Estrutura de Pastas de um Mundo]] | regra | ativa | 30/08/2026 | Padrão único de pastas de qualquer mundo: índice obrigatório, subpastas opcionais de nível de mundo, e Contextos com subpastas por tipo — nunca pré-criada vazia. |
| [[Schema de Frontmatter]] | regra | ativa | 30/08/2026 | Os 6 campos fixos de frontmatter de toda nota (tipo, dominio, status, criado, atualizado_em, relacionado) e a regra de preenchimento de cada um. |
| [[Os 9 Tipos de Nota]] | conceito | ativa | 30/08/2026 | Definição, critério de distinção e status possível de cada um dos 9 valores aceitos em `tipo` — o vocabulário fechado que classifica toda nota do vault. |
| [[Ciclo de Vida de Dúvida e Bug Conhecido]] | regra | ativa | 30/08/2026 | Dúvida resolvida gera nota nova de decisão (nunca reescreve a dúvida); bug corrigido fica na mesma nota, com seção Correção. |
| [[Convenção da Pasta Bases]] | regra | ativa | 30/08/2026 | Todo arquivo `.base` mora em `Bases/` na raiz do vault — pasta funcional, não é mundo, não segue numeração `0X_`. |
| [[Regra do Índice Obrigatório]] | regra | ativa | 30/08/2026 | Todo mundo tem `00_Indice.md` obrigatório, agrupado por contexto, com resumo real (não genérico) de até ~25 palavras por nota. |

## Modelos_Referencia_de_Escrita

Subpasta criada em 30/08/2026 — esqueletos de seção sugeridos por família de tipo (não fôrma rígida, ver disclaimer em cada nota), complementando a régua obrigatória [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]].

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]] | regra | ativa | 30/08/2026 | Esqueleto para notas que respondem uma pergunta/resolvem um problema: Contexto → Problema/Pergunta → O que levou à resposta → Resposta → Exemplo. |
| [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)]] | regra | ativa | 30/08/2026 | Esqueleto para notas que fixam uma verdade permanente (descritiva ou prescritiva): Contexto → O que é/o que diz → Por que é assim → Exemplo. |
| [[Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint)]] | regra | ativa | 30/08/2026 | Esqueleto para checkpoint — log vivo sobrescrito a cada sessão: Resumo do estado atual → Callout de status → Linha do tempo → Em aberto. |
| [[Modelo de Escrita — Instrucao Procedural (Tutorial)]] | regra | ativa | 30/08/2026 | Esqueleto para tutorial: Resumo do resultado final → Pré-requisitos → Passos numerados → Verificação → Armadilhas comuns. |
| [[Modelo de Escrita — Artefato de Uso Direto (Prompt)]] | regra | ativa | 30/08/2026 | Esqueleto para prompt — o corpo é a ferramenta, não uma explicação: Resumo de quando usar → Status/histórico → O prompt em si → Como usar → Exemplo de execução real. |

### Modelos_Referencia_de_Escrita/Exemplos_Ilustrativos

Subpasta de notas fictícias, 1 por tipo (9 no total), encadeadas numa história só (watermark de sincronização → regra de cache → dúvida sobre cachear a grade de precificação → decisão de cachear → checkpoint da implementação → descoberta sobre frete variável → tutorial → prompt de auditoria), demonstrando cada esqueleto de seção na prática.

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Exemplo — Conceito (Modelo de Demonstracao)]] | conceito | ativa | 30/08/2026 | O que é um watermark de sincronização — base fictícia usada pelo bug de exemplo. |
| [[Exemplo — Regra (Modelo de Demonstracao)]] | regra | ativa | 30/08/2026 | Todo cache precisa de estratégia de invalidação explícita, nunca silenciosa — com exemplo ANTES/DEPOIS. |
| [[Exemplo — Duvida (Modelo de Demonstracao)]] | duvida | resolvida | 30/08/2026 | Vale cachear a grade de precificação por 24h? Resolvida em nota de decisão separada — preserva o rastro de quando estava em aberto. |
| [[Exemplo — Decisao (Modelo de Demonstracao)]] | decisao | concluida | 30/08/2026 | Cachear por 24h com invalidação automática ao alterar custo — alternativas consideradas e descartadas. |
| [[Exemplo — Descoberta (Modelo de Demonstracao)]] | descoberta | confirmada | 30/08/2026 | O cache não reduz carga nenhuma pra produtos de frete variável — achado durante a implementação. |
| [[Exemplo — Bug Conhecido (Modelo de Demonstracao)]] | bug_conhecido | corrigido | 29/08/2026 | Watermark gravado em horário local em vez de UTC, causando importação duplicada de notas fiscais. |
| [[Exemplo — Checkpoint (Modelo de Demonstracao)]] | checkpoint | em_andamento | 30/08/2026 | Implementação do cache, em andamento — falta decidir o comportamento pra frete variável. |
| [[Exemplo — Tutorial (Modelo de Demonstracao)]] | tutorial | ativa | 30/08/2026 | Como rodar a grade de precificação com cache ativado e confirmar que está funcionando. |
| [[Exemplo — Prompt (Modelo de Demonstracao)]] | prompt | validado | 30/08/2026 | Prompt de auditoria que verifica se a implementação do cache respeita a regra de invalidação explícita. |

## Relacionado

- [[Regra do Índice Obrigatório]]
- [[Definição do Núcleo de Comportamento Claude]]
