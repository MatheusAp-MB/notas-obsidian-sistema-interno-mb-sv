---
tipo: regra
dominio: 
status: ativa
criado: 29/08/2026
atualizado_em: 29/08/2026 14:00
relacionado: [Estrutura e Convenções do Vault, Definição do Núcleo Geral do Vault]
---

# Definição do Núcleo de Comportamento Claude

## O quê

`00_Nucleo_Comportamento_Claude/` é o mundo que reúne toda regra de comportamento **genuinamente universal** — que vale pra qualquer tarefa que o usuário peça a Claude, não importa o assunto, o projeto ou se envolve código ou não. É o local único que Claude lê pra saber como pensar → agir → se comportar → executar → validar, em qualquer situação.

## Por quê — correção de um erro real de classificação (29/08/2026)

A primeira versão desta nota (mesma data, mais cedo) tinha classificado **16 das 18 regras** de `02_Sistema_Interno/Regras_de_Comportamento/` como pertencentes a este núcleo, usando só o teste "sobrevive sem o vault existir?". Isso estava errado — o teste tem um furo: uma regra pode muito bem sobreviver sem o VAULT (o vault é só onde a regra está anotada) e mesmo assim ser específica de um **projeto de código** (o Sistema Interno V2), não de "qualquer coisa que o usuário pedir".

Achado real, ao ler o conteúdo completo das 16 notas (não só o nome do arquivo): a maioria citava, no corpo da própria regra, coisa como o nome do repositório GitHub (`Projeto_Sistema_Interno_V2`), nomes de arquivo Python reais (`agenda_videos`, `orquestrador.py`), ou dizia literalmente "vale pra qualquer API construída **neste projeto**" — nenhuma dessas sobrevive ao teste real, que é "isso ainda faz sentido se o usuário me pedir pra escrever um e-mail, organizar uma pasta de fotos, ou trabalhar num projeto totalmente diferente?".

Além disso, a própria [[Estrutura e Convenções do Vault]] **já previa isso antes desta reorganização existir** (linha ainda vigente): "Padrão de engenharia que atravessa mais de um mundo... mora em `02_Sistema_Interno/Regras_de_Comportamento/`". A primeira versão desta nota ignorou essa regra já estabelecida.

## Pra quê

Corrigir isso resolve 2 problemas ao mesmo tempo:

1. **Peso de leitura e risco de compactação.** As 16 regras somavam ~13.830 palavras — caro de recarregar, e o tipo de conteúdo grande que uma compactação de conversa pode "achatar" justamente na parte mais crítica. Reduzido pra 6 regras (~2.100 palavras), o núcleo fica barato de reler por completo sempre que preciso.
2. **Consistência.** Regra de engenharia do Sistema Interno V2 continua exatamente onde a convenção do vault sempre disse que ela deveria estar — não precisa de uma exceção nova.

## Como — o teste de classificação (corrigido)

Duas perguntas, nesta ordem, não uma só:

1. **"Isso sobrevive se o vault não existisse?"** (teste original — filtra o que é específico de Obsidian/frontmatter/estrutura de nota, que vai pra [[Definição do Núcleo Geral do Vault|01_Nucleo_Geral_Vault]]).
2. **"Isso sobrevive também se o projeto/tarefa específica mudasse — se o usuário me pedisse outra coisa completamente diferente amanhã?"** Se a resposta for não (a regra cita código, arquivo ou decisão de UM projeto específico), ela fica no mundo desse projeto (hoje, `02_Sistema_Interno/Regras_de_Comportamento/`), não aqui.

Só entra em `00_Nucleo_Comportamento_Claude/` quem passa nas duas perguntas.

### Exemplo prático

`Perguntas Sempre em Texto Corrido` (não usar ferramenta de múltipla escolha) sobrevive às duas: não depende do vault existir, e vale exatamente igual se o usuário estiver pedindo ajuda com um projeto Python, um contrato, ou uma viagem. Já `Modelo Padrao de Arquivo de Teste` sobrevive à primeira (não fala do vault) mas falha na segunda — é um template de código pytest, não faz sentido nenhum fora de uma tarefa de teste automatizado em Python.

## As 6 regras deste núcleo

| Regra | Por que passa nas 2 perguntas |
|---|---|
| Ciclo de Trabalho Calmo (Idealizar → Planejar → Executar → Analisar → Corrigir → Otimizar → Validar) | Método de trabalho sem nenhuma menção a código ou projeto específico — vale pra qualquer tarefa. |
| Perguntas Sempre em Texto Corrido | Estilo de interação com o usuário, independente de produto, projeto ou assunto. |
| Fluxo — Decomposição de Problemas em Micro-Etapas | Princípio de decompor problema grande em partes pequenas — vale pra pensar em qualquer problema, não só código. |
| Disciplina de Refatoração e Testes (Regra dos Três, código limpo) | Princípio geral de engenharia de software — não amarrado a nenhum projeto específico. |
| Nomenclatura e Comentários | Clareza de nome e "comentário explica o porquê" — vale pra qualquer coisa que Claude nomeie ou documente. |
| Responsabilidade de Liderança em TI Eleva o Padrão de Qualidade Exigido | Reforça o Ciclo de Trabalho Calmo com mais seriedade sempre que o trabalho tem peso real — princípio que se aplica além de 1 projeto só. |

> [!info] Nota sobre as 4 últimas
> Essas 4 ainda têm, no corpo do texto, exemplo específico do projeto Sistema Interno V2 (citado durante a explicação do motivo). O usuário confirmou que a classificação correta é `00` mesmo assim — o **princípio** é universal, ainda que o exemplo usado pra ilustrar seja de um projeto específico. Reescrever essas notas de forma mais genérica (sem o exemplo do projeto) é uma melhoria possível, ainda não feita.

## As 10 regras que ficam em `02_Sistema_Interno/Regras_de_Comportamento/` (sem mudança)

`Regras de Colaboracao no Repositorio de Codigo (Branch Dev)`, `Padrao de Qualidade e Clareza Estrutural do Repositorio`, `Padrao de Robustez para Clientes de API Externa`, `Padroes de Projeto GoF Quando Usar`, `Reducao de Comandos de Management e Rotina Vira Botao` (esta última, achado à parte: é `tipo: decisao`, não `regra` — não deveria nem estar fisicamente nesta pasta pelo próprio critério do vault; ainda não corrigido), `Disciplina de Testes Automatizados`, `Estrutura de Arquivo e Classe Python`, `Integridade e Fonte Unica de Dado`, `Modelagem de Objeto e Encapsulamento`, `Modelo Padrao de Arquivo de Teste` — todas citam o repositório, o código ou uma decisão real do Sistema Interno V2 no próprio corpo da regra.

## Estado desta reorganização (29/08/2026, 14:00)

- ✅ Pasta `00_Nucleo_Comportamento_Claude/` criada.
- ✅ 6 regras movidas fisicamente pra dentro dela.
- ✅ 10 regras confirmadas e mantidas em `02_Sistema_Interno/Regras_de_Comportamento/`.
- ✅ 2 regras movidas para `01_Nucleo_Geral_Vault/` (ver [[Definição do Núcleo Geral do Vault]]).
- ⏳ **Pendente**: decidir se cria uma camada resumida (versão compacta, 1-3 linhas por regra) além destas 6 notas completas — discussão pausada a pedido do usuário até a movimentação física terminar.
- ⏳ **Pendente**: avaliar reescrever as 4 regras marcadas acima de forma mais genérica, sem o exemplo específico do projeto.
- ⏳ **Pendente**: corrigir o `tipo` de `Reducao de Comandos de Management e Rotina Vira Botao` (é decisão, não regra) e mover pra pasta correta dentro de `02_Sistema_Interno`.

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Definição do Núcleo Geral do Vault]]
