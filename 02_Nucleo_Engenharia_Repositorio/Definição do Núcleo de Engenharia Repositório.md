---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 18:25
relacionado: [Definição do Núcleo Geral do Vault, Definição do Núcleo de Comportamento Claude, Registro dos Mundos Ativos]
---

# Definição do Núcleo de Engenharia Repositório

## O quê

`02_Nucleo_Engenharia_Repositorio/` é o mundo que reúne toda **convenção de engenharia de código** que serve **mais de 1 mundo de código ao mesmo tempo** — estrutura de arquivo/classe, modelagem de objeto, testes, colaboração em git, padrão de robustez de API. Diferente de uma regra presa a 1 mundo só (que fica dentro daquele mundo, ver [[Estrutura de Pastas de um Mundo]]), o que mora aqui vale igual em qualquer mundo que tenha código Python neste repositório — hoje `03_Sistema_Interno/`, `04_Integracao_Sysemp/`, `05_Integracao_Mercado_Livre/`.

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

## Estado desta reorganização

- ✅ Núcleo criado em 29/08/2026 (22:02-22:20), movendo as 10 notas de `03_Sistema_Interno/Regras_de_Comportamento/` pra cá (ver [[Registro dos Mundos Ativos]]).
- ✅ `00_Indice.md` criado (30/08/2026, 17:40) — não existia até então, violação já corrigida da [[Regra do Índice Obrigatório]].
- ✅ Esta nota de definição criada (30/08/2026, 17:40) — não existia até então, quebrando o padrão dos outros 2 núcleos.
- ✅ **Resolvida**: a sobreposição entre "Estrutura Modular de Scripts Python" (LEGADO, nunca verificada) e [[Estrutura de Arquivo e Classe Python]] (atual), achado da auditoria de coerência de 30/08/2026, foi resolvida pelo usuário apagando a nota do LEGADO (30/08/2026, 17:47) por considerá-la inútil. [[Estrutura de Arquivo e Classe Python]] segue como a única convenção deste tipo no núcleo.
- ✅ **Resolvida**: a duplicação de conteúdo entre [[Disciplina de Testes Automatizados]] e [[Modelo Padrao de Arquivo de Teste]] — as 5 regras da seção "Visual" que eram reafirmadas em prosa no Modelo (match/case, `ids` do parametrize, tabela/Motivo, `xfail`, 4 fases) agora linkam de volta pra Disciplina como fonte única, mantendo só a aplicação concreta de cada uma. Frontmatter do Modelo também ganhou o campo `atualizado_em`, que faltava (30/08/2026, 18:25).
- ✅ **Resolvida**: a divergência entre o `relacionado` do frontmatter e a seção "Relacionado" do corpo em [[Padrao de Qualidade e Clareza Estrutural do Repositorio]] — faltava `Reducao de Comandos de Management e Rotina Vira Botao` no corpo, adicionado (30/08/2026, 18:12).

## Relacionado

- [[Definição do Núcleo Geral do Vault]]
- [[Definição do Núcleo de Comportamento Claude]]
- [[Registro dos Mundos Ativos]]
