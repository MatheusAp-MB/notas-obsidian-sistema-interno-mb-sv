---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:26
relacionado: [Registro dos Mundos Ativos, Convenção de Nomenclatura de Arquivos e Pastas, Regra do Índice Obrigatório]
resumo: O padrão único de pastas usado por qualquer mundo ativo — um índice obrigatório na raiz, subpastas opcionais de nível de mundo (`Regras/`, `Tutoriais/`, `Conceitos/`, `Decisoes/`, sem contexto de negócio específico) e um ou mais Contextos, cada um com suas próprias subpastas por tipo — nenhuma subpasta de tipo é pré-criada vazia.
---

# Estrutura de Pastas de um Mundo

**Resumo**: o padrão único de pastas usado por qualquer mundo ativo — um índice obrigatório na raiz, subpastas opcionais de nível de mundo (`Regras/`, `Tutoriais/`, `Conceitos/`, `Decisoes/`, sem contexto de negócio específico) e um ou mais Contextos, cada um com suas próprias subpastas por tipo — nenhuma subpasta de tipo é pré-criada vazia.

## Contexto

Com 4 mundos ativos (`03_Sistema_Interno/`, `04_Integracao_Sysemp/`, `05_Integracao_Mercado_Livre/`, `06_Producao_de_Imagens_e_Videos/`), cada um cobrindo assuntos completamente diferentes, era preciso um padrão único de pastas que funcionasse igual em qualquer um deles — sem isso, cada mundo desenvolveria sua própria organização orgânica, e encontrar "onde fica a dúvida sobre X" dependeria de já conhecer aquele mundo específico por dentro.

## O que diz

Todo mundo ativo segue exatamente esta estrutura:

```
03_Sistema_Interno/
  00_Indice.md                → índice obrigatório do mundo (ver [[Regra do Índice Obrigatório]])
  Regras/                      → (opcional, criado sob demanda) regra que vale pro mundo
                                 inteiro mas não cruza pra outro mundo — se cruzar, vira
                                 nota do núcleo 02_Nucleo_Engenharia_Repositorio/, não
                                 fica aqui. Arquivos soltos direto aqui, sempre tipo=regra.
                                 Nunca contém duvida ou bug_conhecido.
  Tutoriais/                   → (opcional, criado sob demanda) manual/guia que cobre o
                                 mundo inteiro, sem pertencer a um contexto específico.
  Conceitos/                   → (opcional, criado sob demanda) conceito técnico geral que
                                 não pertence a um contexto de negócio específico — dá apoio
                                 a mais de 1 contexto ou às próprias regras do mundo.
  Decisoes/                    → (opcional, criado sob demanda) decisão de arquitetura que
                                 cruza vários contextos do mundo, sem pertencer a 1 só.
  <Contexto>/                  → criado sob demanda, na primeira nota daquele contexto
    Decisoes/
    Duvidas/
    Regras/
    Descobertas/
    Bugs_Conhecidos/
    Conceitos/
    Checkpoints/                → estado de trabalho em andamento
    Tutoriais/                  → manual/guia passo a passo
```

**Contexto** agrupa um tema de negócio (ex: `Agenda_Videos`, `Precificacao`) — não precisa corresponder 1:1 a um app de código; pode interligar vários pontos do projeto. Nota que toca mais de 1 contexto mora no contexto principal e referencia o outro via `relacionado` — nunca duplicada em duas pastas.

**Regra do "nunca pré-criada vazia"**: subpasta de tipo (`Decisoes/`, `Duvidas/`, etc.) só existe dentro de um contexto quando já tiver pelo menos 1 nota daquele tipo — nunca criada de antemão, vazia, só pra "deixar pronto".

**As 4 exceções de nível de mundo** (`Regras/`, `Tutoriais/`, `Conceitos/`, `Decisoes/`) seguem a mesma lógica entre si: existem quando o conteúdo é do nível do mundo inteiro, não de 1 contexto específico — sem subpastas de tipo dentro delas, só arquivos soltos do tipo correspondente.

**Diferença entre `Decisoes/` de nível de mundo e o núcleo `02_Nucleo_Engenharia_Repositorio/`**: a de nível de mundo cruza vários **contextos de negócio**, mas continua sendo assunto de 1 mundo só; o núcleo é pra quando o conteúdo cruza **mundos inteiros** (2 ou mais), não só contextos dentro do mesmo mundo.

**Checkpoint de nível de mundo** (achado real, 23/08/2026): normalmente `Checkpoints/` mora dentro de um `<Contexto>` específico. Quando o checkpoint cobre o mundo inteiro — várias frentes ao mesmo tempo, não uma frente de negócio isolada — ele mora direto na raiz do mundo, mesma lógica de exceção já usada por `Regras/`/`Tutoriais/`/`Conceitos/`/`Decisoes/` de mundo.

## Por que é assim e não de outro jeito

A alternativa de deixar cada mundo organizar suas próprias pastas livremente foi descartada porque o ganho de navegação de um padrão único (saber de cor onde procurar uma dúvida ou uma regra, em qualquer mundo, sem precisar reaprender a estrutura) supera qualquer flexibilidade que a liberdade traria. A regra do "nunca pré-criada vazia" existe porque uma pasta vazia não carrega informação nenhuma — ela só existiria "pra deixar pronto", o que engana quem está navegando (parece que já existe conteúdo daquele tipo, quando não existe).

## Exemplo

`03_Sistema_Interno/Conceitos/Conceitos de Pytest Live de Python 167` é o primeiro exemplo real de `Conceitos/` de nível de mundo — um conceito técnico (terminologia de teste) que não pertence a 1 contexto de negócio específico, mas dá apoio às regras de teste do mundo inteiro, então vive solto na raiz do mundo, não dentro de um `<Contexto>`.

`03_Sistema_Interno/Decisoes/Reducao de Comandos de Management e Rotina Vira Botao` é o primeiro exemplo real de `Decisoes/` de nível de mundo — toca Precificação, Agenda de Vídeos e Portal do Drive ao mesmo tempo, então vive solta em `Decisoes/` na raiz do mundo, não dentro de um `<Contexto>` só.

`03_Sistema_Interno/Tutoriais/Guia de Setup - Do Zero ao Primeiro Preco Calculado` é o primeiro exemplo real de `Tutoriais/` de nível de mundo — cobre o processo do zero (clonar repositório, configurar banco, popular dados) sem pertencer a 1 contexto de negócio específico, então vive solto na raiz do mundo, não dentro de um `<Contexto>`.

## Relacionado

- [[Registro dos Mundos Ativos]]
- [[Convenção de Nomenclatura de Arquivos e Pastas]]
- [[Regra do Índice Obrigatório]]
