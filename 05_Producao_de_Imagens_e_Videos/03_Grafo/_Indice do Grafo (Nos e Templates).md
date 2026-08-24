---
tipo: regra
dominio: 
status: ativa
criado: 23/08/2026
atualizado_em: 23/08/2026 23:41
relacionado: [Etapa 5 - Navegacao pelos Grafos, Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]
---

# Índice do Grafo (Nós e Templates)

Consulta obrigatória da Étapa 5 — leia ESTE arquivo primeiro, nunca a pasta inteira de `1_O_Que_E/` ou `2_O_Que_Pode_Ter/`. Só abra o arquivo completo de um nó/template específico quando ele for candidato plausível a reaproveitamento, pai/irmão direto de um nó novo, ou precisar ser editado (novo "Ativado por"/"Aciona"). Nunca abra nó/template de categoria claramente não relacionada (ex.: não há motivo pra ler "Muleta Axilar" classificando uma pistola de pintura).

**Regra de manutenção, sem exceção**: toda vez que uma nota nova for criada em `1_O_Que_E/` ou `2_O_Que_Pode_Ter/`, ou uma existente ganhar novo "Ativado por"/"Aciona", esta tabela precisa ser atualizada na mesma escrita — um índice desatualizado é pior que não ter índice, porque engana quem confia nele.

## Grafo 1 — Nós ("O que é")

| Título | Tipo | Pai | Definição resumida | Aciona (Grafo 2) |
| --- | --- | --- | --- | --- |
| [[Pulverizador]] | item | — (raiz) | aplicar líquido sob pressão sobre uma superfície/alvo | Dimensões e Peso, Reservatório e Tanque, Mecanismo de Bombeamento, Lança, Bico e Jato |
| [[Pulverizador Costal]] | item | Pulverizador | transportado nas costas do operador | Ergonomia de Uso Costal |
| [[Pulverizador Elétrico e Manual]] | item | Pulverizador | fonte de energia dupla (elétrico + manual) | Bateria e Energia |
| [[Pulverizador Manual]] | item | Pulverizador | acionamento exclusivamente manual | (nenhum exclusivo) |
| [[Pulverizador de Mão]] | item | Pulverizador | operado só com a(s) mão(s), sem correias/almofada nas costas | Empunhadura e Mecanismo de Acionamento |
| [[Uso Restrito a Substâncias Líquidas]] | uso | Pulverizador | só líquidos; exclui pó/corrosivo/inflamável/solvente | Restrição Química de Uso |
| [[Uso em Jardim e Propriedade Rural]] | uso | Pulverizador | jardinagem/limpeza/chácara, não agrícola profissional regulado | Contexto de Aplicação |
| [[Unidade de Venda - Item Único]] | quantidade | — (eixo transversal) | vendido como 1 unidade principal | Unidade de Venda - Campos |
| [[Unidade de Venda - Kit ou Conjunto]] | quantidade | — (eixo transversal, irmão do anterior) | vendido em par/kit/conjunto | Unidade de Venda - Campos |
| [[Cadeira de Rodas]] | item | — (raiz) | deslocamento sobre rodas p/ mobilidade reduzida, sentado | Dimensões e Peso, Capacidade de Carga do Usuário, Estrutura e Chassi, Rodas, Ergonomia de Assento e Encosto |
| [[Cadeira de Rodas Motorizada]] | item | Cadeira de Rodas | acionamento elétrico via motor(es) | Bateria e Energia, Sistema de Motorização |
| [[Cadeira de Rodas Dobrável]] | item | Cadeira de Rodas | estrutura dobrável/compactável pra transporte | Portabilidade e Transporte |
| [[Muleta]] | item | — (raiz) | apoio físico complementar p/ deslocamento a pé | Dimensões e Peso, Capacidade de Carga do Usuário, Estrutura e Chassi, Manopla, Sistema de Ajuste de Altura |
| [[Muleta Axilar]] | item | Muleta | apoio na região da axila | Apoio de Axila |
| [[Pistola de Pintura]] | item | — (raiz) | aplicar tinta por pulverização, alimentada por ar comprimido externo | Dimensões e Peso, Reservatório e Tanque, Contexto de Aplicação, Alimentação Pneumática (Ar Comprimido), Bico e Padrão de Leque, Restrição de Regime de Uso e Viscosidade |
| [[Pistola de Pintura por Gravidade]] | item | Pistola de Pintura | reservatório acima do bico, tinta desce por gravidade | (nenhum exclusivo) |
| [[Pulverizador Gerador de Espuma (Snow Foam)]] | item | Pulverizador | possui sistema integrado que mistura líquido e ar sob pressão, gerando espuma na saída | Sistema de Geração de Espuma (Snow Foam) |
| [[Uso em Estética Automotiva e Limpeza Doméstica]] | uso | Pulverizador | indicado pro fabricante pra detalhamento automotivo e/ou limpeza doméstica de superfícies | Contexto de Aplicação |

## Grafo 2 — Templates ("O que pode ter")

| Título | Domínio | Perguntas (resumo) | Ativado por |
| --- | --- | --- | --- |
| [[Dimensões e Peso]] | Dimensões | altura, largura, comprimento, peso vazio, peso cheio | Pulverizador, Muleta, Pistola de Pintura |
| [[Reservatório e Tanque]] | Armazenamento | capacidade nominal, capacidade útil, material, tipo de tampa | Pulverizador, Pistola de Pintura |
| [[Mecanismo de Bombeamento]] | Mecanismo | tipo de bomba, pressão máxima, regulagem de pressão | Pulverizador |
| [[Lança]] | Estrutura | tipo (fixa/telescópica), comprimento, material | Pulverizador |
| [[Bico e Jato]] | Mecanismo | qtd. de bicos, tipos/aplicação de cada um, vazão | Pulverizador |
| [[Ergonomia de Uso Costal]] | Mobilidade | correias, almofada, peso suportável do operador | Pulverizador Costal |
| [[Bateria e Energia]] | Alimentação | capacidade, autonomia, tempo de recarga, tipo químico | Pulverizador Elétrico e Manual, Cadeira de Rodas Motorizada |
| [[Restrição Química de Uso]] | Restrição | substâncias permitidas/proibidas, compatibilidade com defensivo agrícola | Uso Restrito a Substâncias Líquidas |
| [[Contexto de Aplicação]] | Aplicação | ambientes de uso recomendados, cultivo/aplicação agrícola específica | Uso em Jardim e Propriedade Rural, Pistola de Pintura, Uso em Estética Automotiva e Limpeza Doméstica |
| [[Unidade de Venda - Campos]] | Comercial | quantas unidades principais são vendidas | Unidade de Venda - Item Único, Unidade de Venda - Kit ou Conjunto |
| [[Empunhadura e Mecanismo de Acionamento]] | Ergonomia | alça integrada, tipo de mecanismo de acionamento, trava/regulador | Pulverizador de Mão |
| [[Estrutura e Chassi]] | Estrutura | tipo de estrutura, material, proteção lateral | Cadeira de Rodas, Muleta |
| [[Manopla]] | Ergonomia | comprimento da manopla, acolchoamento | Muleta |
| [[Capacidade de Carga do Usuário]] | Estrutura | peso máximo suportado pelo usuário | Cadeira de Rodas, Muleta |
| [[Rodas]] | Estrutura | material das rodas traseiras, material das rodas dianteiras | Cadeira de Rodas |
| [[Ergonomia de Assento e Encosto]] | Mobilidade | altura de assento/encosto, dimensões do assento, largura entre apoios de braço, apoios removíveis, apoio de pés retrátil, encosto rebatível, cinto de segurança, almofada inclusa, anti-tombo | Cadeira de Rodas |
| [[Sistema de Motorização]] | Mecanismo | qtd. de motores, potência, tipo de motor, tipo de controlador | Cadeira de Rodas Motorizada |
| [[Portabilidade e Transporte]] | Transporte | dimensões dobrado, peso dobrado, transporte em meio específico (ex.: avião) | Cadeira de Rodas Dobrável |
| [[Sistema de Ajuste de Altura]] | Mecanismo | altura mínima/máxima ajustável, tipo de travamento | Muleta |
| [[Apoio de Axila]] | Ergonomia | acolchoamento, dimensão do apoio | Muleta Axilar |
| [[Alimentação Pneumática (Ar Comprimido)]] | Alimentação | pressão de trabalho, consumo de ar, tipo de conexão de ar, diâmetro de mangueira | Pistola de Pintura |
| [[Bico e Padrão de Leque]] | Mecanismo | diâmetro do bico, faixa de abertura do leque, material do bico/agulha, ajuste independente de ar/leque | Pistola de Pintura |
| [[Restrição de Regime de Uso e Viscosidade]] | Restrição | restrição de viscosidade do fluido, restrição de regime de uso contínuo/industrial | Pistola de Pintura |
| [[Sistema de Geração de Espuma (Snow Foam)]] | Mecanismo | possui sistema de espuma, princípio de funcionamento, diluição/pH recomendado do produto químico | Pulverizador Gerador de Espuma (Snow Foam) |

## Relacionado
- [[Etapa 5 - Navegacao pelos Grafos]]
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
