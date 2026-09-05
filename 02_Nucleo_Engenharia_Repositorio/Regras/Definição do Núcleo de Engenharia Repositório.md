---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 05/09/2026
relacionado: [Estrutura de Pastas de um Mundo, Definição do Núcleo Geral do Vault, Definição do Núcleo de Comportamento Claude, Registro dos Mundos Ativos, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Sistema de Devoluções e Sistema Interno V2 — Mesma Empresa, Times Diferentes (Escritório e Barracão), Separação Hoje é Só de Rede]
---

# Definição do Núcleo de Engenharia Repositório

## O quê

`02_Nucleo_Engenharia_Repositorio/` é o mundo que reúne o que embasa a engenharia de código que serve **mais de 1 mundo ao mesmo tempo** — tanto o **como** (convenção de engenharia: estrutura de arquivo/classe, modelagem de objeto, testes, colaboração em git, padrão de robustez de API) quanto o **porquê** (conceito e decisão que explicam o contexto de negócio por trás de como o código é pensado — desde 04/09/2026, ver seção "Expansão de escopo" abaixo). Diferente de uma regra/conceito/decisão presa a 1 mundo só (que fica dentro daquele mundo, ver [[Estrutura de Pastas de um Mundo]]), o que mora aqui vale igual em qualquer mundo que tenha código Python — dentro do repositório `Projeto_Sistema_Interno_V2` (hoje `03_Sistema_Interno/`, `04_Integracao_Sysemp/`, `05_Integracao_Mercado_Livre/`) e, a partir de 01/09/2026, também em repositórios completamente separados (ver seção "Expansão de escopo" abaixo) — o mesmo raciocínio de engenharia vale, independente de qual repositório o código mora.

## Por quê

Até 29/08/2026, estas 10 notas moravam soltas dentro de `03_Sistema_Interno/Regras_de_Comportamento/` (antes disso, `02_Sistema_Interno/`) — como se fossem regra exclusiva do Sistema Interno V2. Ficou claro que isso estava errado: o código de todas as integrações (Sysemp, Mercado Livre) mora no mesmo repositório, e convenção como "como estruturar um arquivo Python" ou "como testar" não muda de mundo pra mundo — é a mesma regra, só que sendo consultada de lugares diferentes.

## Pra quê

Isolar essas regras num núcleo próprio evita 2 problemas: (1) duplicar a mesma convenção em 3 mundos diferentes, ou pior, cada mundo desenvolvendo sua própria variação por não saber que a regra já existia em outro lugar; (2) esconder, atrás do nome "Sistema Interno", uma regra que na verdade Sysemp e Mercado Livre também precisam seguir.

## Como — o teste de classificação (3º e último filtro da cadeia)

A classificação de uma regra passa por até 3 perguntas, nesta ordem — cada núcleo é o primeiro filtro que a regra passa:

1. **"Isso sobrevive se o vault não existisse?"** (teste de [[Definição do Núcleo Geral do Vault|01_Nucleo_Geral_Vault]]) — se não sobrevive (fala de frontmatter, pasta, wikilink), fica lá.
2. **"Isso sobrevive se o projeto/tarefa específica mudasse completamente amanhã?"** (teste de [[Definição do Núcleo de Comportamento Claude|00_Nucleo_Comportamento_Claude]]) — se sobrevive mesmo fora de qualquer código (regra de comportamento genuinamente universal), fica lá.
3. **Restando código/engenharia: essa convenção serve só a 1 mundo, ou a mais de 1 mundo de código ao mesmo tempo?** Se serve só a 1 mundo, fica dentro daquele mundo (`Regras/`, nível de mundo — ver [[Estrutura de Pastas de um Mundo]]). Se serve a mais de 1 mundo — hoje ou previsivelmente no futuro, dado que todo o código mora no mesmo repositório — entra aqui.

Só entra em `02_Nucleo_Engenharia_Repositorio/` quem passa pelas 2 primeiras perguntas sem ficar em 01_/00_, e responde "mais de 1 mundo" na 3ª.

## Tabela do que pertence a este núcleo

| Nota | Situação | Justificativa |
|---|---|---|
| [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]] | ✅ Confirmada | Regra de como Claude interage com o repositório de código real — vale pra qualquer mundo que tenha código nele. |
| [[Padrao de Qualidade e Clareza Estrutural do Repositorio]] | ✅ Confirmada | Régua de revisão que se aplica ao repositório inteiro, não a 1 mundo específico. |
| [[Estrutura de Arquivo e Classe Python]] | ✅ Confirmada | Convenção de ordem de arquivo/classe Python, igual em qualquer mundo do repositório — única convenção deste tipo no núcleo (ver histórico abaixo). |
| [[Modelagem de Objeto e Encapsulamento]] | ✅ Confirmada | Convenção de POO/encapsulamento que vale pra qualquer classe do repositório. |
| [[Integridade e Fonte Unica de Dado]] | ✅ Confirmada | Princípio de dono único do dado, independente de qual mundo o dado pertence. |
| [[Padroes de Projeto GoF Quando Usar]] | ✅ Confirmada | Critério de quando usar cada padrão de projeto, vale pro repositório inteiro. |
| [[Padrao de Robustez para Clientes de API Externa]] | ✅ Confirmada | Escrita para valer "pra qualquer cliente de API externa construído neste projeto" — já nasceu pensando em mais de 1 mundo (Sysemp hoje, Mercado Livre depois). |
| [[Disciplina de Testes Automatizados]] | ✅ Confirmada | Metodologia de teste (pytest, níveis, SUT/DOC) igual em qualquer app/mundo do repositório. |
| [[Modelo Padrao de Arquivo de Teste]] | ✅ Confirmada | Implementação de referência da disciplina acima — mesmo escopo, repositório inteiro. |
| [[Sistema de Devoluções e Sistema Interno V2 — Mesma Empresa, Times Diferentes (Escritório e Barracão), Separação Hoje é Só de Rede]] | ✅ Confirmada (04/09/2026) | 1º `tipo: conceito` do núcleo — contexto de negócio (mesma empresa/dono, times diferentes escritório/barracão) que embasa decisões de engenharia do Sistema de Devoluções, cruzando mundos (Sistema Interno V2 + Sistema de Devoluções). |

## Expansão de escopo — outros repositórios (01/09/2026, 22:48)

Até aqui, este núcleo só cobria mundos de código dentro do mesmo repositório (`Projeto_Sistema_Interno_V2`). Isso mudou quando o projeto `07_Sistema_Relatorio_Devolucoes` (repositório próprio, `Projeto-Sistema-Devolucao`, GitHub) começou a ganhar código de verdade — o usuário decidiu que o mesmo padrão de qualidade vale lá também, nas próprias palavras: *"Eu quero adotar o mesmo nível e padrão de qualidade neste repositório, quero usar tudo que já aprendemos nesse repositório. O único motivo de eu estar fazendo separado é não sujar aquele repo... aqui é livre e tranquilo, por isso é um projeto paralelo."*

Ou seja: o repositório separado existe por motivo operacional (não misturar experimentação com o sistema em produção), nunca como justificativa pra um padrão de qualidade menor. A partir de agora, este núcleo vale como referência de engenharia pra qualquer repositório de código que o usuário trabalhe, não só o `Projeto_Sistema_Interno_V2`. Primeiro caso confirmado: [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]].

## Expansão de escopo — inclui conceito, regra e decisão de contexto (04/09/2026, 21:25)

Até aqui, este núcleo só guardava `tipo: regra` — convenção de "como fazer" (estrutura de arquivo, testes, padrão de projeto). Isso mudou quando ficou claro, discutindo o contexto real por trás do [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial|Sistema de Relatório de Devoluções]], que engenharia não é só "como fazer" — é também "por que fazer, pra quem, e em que contexto", nas palavras do usuário: *"um engenheiro civil não sabe só 'como construir uma ponte', ele precisa entender por que construir, quem vai usar, onde vai construir."*

A partir de agora, este núcleo também guarda `tipo: conceito` e `tipo: decisao` que expliquem o contexto de negócio por trás de como o código é pensado, desde que esse contexto cruze mais de 1 mundo — um conceito de contexto (ex: "existem 2 empresas"), uma regra de execução (ex: "sempre usar 2 bancos") e uma decisão de arquitetura (ex: "a troca de empresa precisa ser prática pro usuário acima de tudo") sobre o mesmo assunto convivem aqui, se complementando. Seguindo a mesma convenção já usada em nível de mundo (ver [[Estrutura de Pastas de um Mundo]]), subpastas por tipo (`Conceitos/`, `Decisoes/`) são criadas dentro deste núcleo sob demanda, só quando já existir a 1ª nota daquele tipo — nunca pré-criadas vazias. Primeiro caso: `Conceitos/`, criada agora com [[Sistema de Devoluções e Sistema Interno V2 — Mesma Empresa, Times Diferentes (Escritório e Barracão), Separação Hoje é Só de Rede]].

## Estado desta reorganização

- ✅ Núcleo criado em 29/08/2026 (22:02-22:20), movendo as 10 notas de `03_Sistema_Interno/Regras_de_Comportamento/` pra cá (ver [[Registro dos Mundos Ativos]]).
- ✅ `00_Indice.md` criado (30/08/2026, 17:40) — não existia até então, violação já corrigida da [[Regra do Índice Obrigatório]].
- ✅ Esta nota de definição criada (30/08/2026, 17:40) — não existia até então, quebrando o padrão dos outros 2 núcleos.
- ✅ **Resolvida**: a sobreposição entre "Estrutura Modular de Scripts Python" (LEGADO, nunca verificada) e [[Estrutura de Arquivo e Classe Python]] (atual), achado da auditoria de coerência de 30/08/2026, foi resolvida pelo usuário apagando a nota do LEGADO (30/08/2026, 17:47) por considerá-la inútil. [[Estrutura de Arquivo e Classe Python]] segue como a única convenção deste tipo no núcleo.
- ✅ **Resolvida**: a duplicação de conteúdo entre [[Disciplina de Testes Automatizados]] e [[Modelo Padrao de Arquivo de Teste]] — as 5 regras da seção "Visual" que eram reafirmadas em prosa no Modelo (match/case, `ids` do parametrize, tabela/Motivo, `xfail`, 4 fases) agora linkam de volta pra Disciplina como fonte única, mantendo só a aplicação concreta de cada uma. Frontmatter do Modelo também ganhou o campo `atualizado_em`, que faltava (30/08/2026, 18:25).
- ✅ **Resolvida**: a divergência entre o `relacionado` do frontmatter e a seção "Relacionado" do corpo em [[Padrao de Qualidade e Clareza Estrutural do Repositorio]] — faltava `Reducao de Comandos de Management e Rotina Vira Botao` no corpo, adicionado (30/08/2026, 18:12).
- ✅ **Reorganizado em pastas por tipo** (05/09/2026) — as 9 notas de regra e esta própria definição (também `tipo: regra`) movidas pra `Regras/`; `Conceitos/` já existia desde 04/09/2026. Segue a mesma lógica dos mundos reais (`03_Sistema_Interno/`, `07_Sistema_Relatorio_Devolucoes/`), onde só o índice fica solto na raiz — nenhuma exceção pro fato desta nota ser a definição do núcleo. Índice reescrito em tabelas agrupadas por `##` (Regras/Conceitos), corrigindo violação da própria [[Regra do Índice Obrigatório]] (era 1 tabela única, sem agrupamento).

## Relacionado

- [[Estrutura de Pastas de um Mundo]]
- [[Definição do Núcleo Geral do Vault]]
- [[Definição do Núcleo de Comportamento Claude]]
- [[Registro dos Mundos Ativos]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
