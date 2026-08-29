---
tipo: regra
dominio: 
status: ativa
criado: 29/08/2026
atualizado_em: 29/08/2026 19:59
relacionado: [Estrutura e Convenções do Vault, Definição do Núcleo de Comportamento Claude]
---

# Definição do Núcleo Geral do Vault

## O quê

`01_Nucleo_Geral_Vault/` é o mundo que reúne toda regra e convenção que existe **por causa deste vault especificamente** — como ele é organizado, que campo de frontmatter cada nota usa, como uma nota deve ser escrita pra ser didática, o que fazer antes de escrever nele. É o local único que explica "como este vault funciona", separado do local que explica "como Claude trabalha em qualquer situação" (ver [[Definição do Núcleo de Comportamento Claude]]).

Antes desta reorganização (29/08/2026), parte desse conteúdo já existia solto dentro de `01_Notas_Gerais/` (as notas de convenção do vault), e parte estava misturada dentro de `02_Sistema_Interno/Regras_de_Comportamento/` (2 regras que, apesar do nome da pasta antiga, só falavam sobre o vault, não sobre comportamento geral).

## Por quê

Toda regra que mora aqui **deixaria de fazer sentido se este vault não existisse**. Ela não descreve um princípio de engenharia de software nem um jeito geral de trabalhar — ela descreve uma decisão concreta tomada sobre ESTE vault: qual vocabulário `tipo` é aceito, quais pastas existem, quando perguntar data e hora antes de escrever, como formatar uma nota pra ser lida por humano e por Claude ao mesmo tempo.

## Pra quê

Ter essas regras isoladas em um único mundo serve pra 2 coisas práticas:

1. **Fonte única de verdade sobre a estrutura do vault.** Quando surge a dúvida "qual é o campo de frontmatter certo?" ou "essa regra de escrita já existe ou preciso criar?", a resposta está sempre no mesmo lugar — nunca espalhada entre `01_Notas_Gerais`, `02_Sistema_Interno` e outros pontos.
2. **Separação clara do que é universal (`00_Nucleo_Comportamento_Claude/`) do que é específico deste vault.** Isso evita, por exemplo, copiar uma regra de frontmatter pra um projeto novo sem vault nenhum — ela simplesmente não se aplicaria lá.

## Como — o mesmo teste de classificação, aplicado ao contrário

A pergunta usada é a mesma descrita em [[Definição do Núcleo de Comportamento Claude]]: **"essa regra sobreviveria se este vault não existisse?"** Quando a resposta é **não**, a regra é deste núcleo (`01`).

Forma resumida, nas palavras usadas pra confirmar esta regra: **"o 01 é sobre especificamente o vault."**

## Tabela do que pertence a este núcleo

| Nota | Situação atual | Justificativa |
|---|---|---|
| Estrutura e Convenções do Vault | ✅ Movida pra cá (29/08/2026, 15:09) | Define toda a estrutura de pastas, schema de frontmatter e convenção de nome deste vault — não existe fora dele. |
| Como Escrever Notas no Vault — Padrao Hiper-Didatico | ✅ Movida pra cá (29/08/2026, 15:09) | Define como uma nota deste vault deve ser escrita para ser didática — regra sobre o conteúdo das notas deste vault. |
| Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian) | ✅ Movida pra cá (29/08/2026, 15:09) | Checkpoint do processo de escolha de plugins do Obsidian para este vault especificamente. |
| Evolucao do Controle de Contexto e Execucao — Do Prompt de Migracao ao Vault Como Segundo Cerebro | ✅ Movida pra cá (29/08/2026, 15:09) | Registro histórico de como o vault chegou a existir e funcionar como é hoje — não sobrevive sem o vault. |
| Aviso Proativo Para Notas no Obsidian | ✅ Movida pra cá (29/08/2026, 14:00) | Fala sobre quando salvar algo como nota do Obsidian — só existe porque o vault existe (ver teste em [[Definição do Núcleo de Comportamento Claude]]). |
| Perguntar Data e Hora Antes de Escrever no Vault | ✅ Movida pra cá (29/08/2026, 14:00) | Fala especificamente sobre escrever no vault — não sobrevive sem o vault. |

> [!info] `Modelos_Notas_Obsidian/padrao.md` — resolvido, não é mais item em aberto
> Achado ao investigar (29/08/2026): esse arquivo já mora dentro de `LEGADO/` (`LEGADO/Modelos_Notas_Obsidian/padrao.md`), não solto na raiz do vault como uma nota anterior desta reorganização supôs. Por regra do próprio vault, `LEGADO/` é arquivo morto — não é fonte de verdade nem candidato a mover pra cá. Nada a fazer aqui. Achado à parte: a [[Estrutura e Convenções do Vault]] (seção "Pasta `Bases/`") ainda cita `Modelos_Notas_Obsidian/` como se fosse uma pasta funcional ativa da raiz — essa frase está desatualizada e precisa de correção futura.
>
> A nota órfã sobre conceitos de Pytest também foi resolvida: não é regra nem de comportamento nem de vault — é `tipo: conceito` de apoio a testes do Sistema Interno V2, movida para `02_Sistema_Interno/Conceitos/Conceitos de Pytest Live de Python 167` (novo padrão de "Conceitos de nível de mundo", documentado em [[Estrutura e Convenções do Vault]]).

## Estado desta reorganização (29/08/2026, 15:09)

- ✅ Pasta `01_Nucleo_Geral_Vault/` criada.
- ✅ Esta nota de definição criada.
- ✅ As 2 regras reclassificadas (`Aviso Proativo Para Notas no Obsidian`, `Perguntar Data e Hora Antes de Escrever no Vault`) movidas fisicamente pra cá.
- ✅ As 4 notas de convenção movidas fisicamente de `01_Notas_Gerais/` pra cá.
- ✅ `01_Notas_Gerais/` ficou vazia e foi removida — não existe mais.
- ✅ Nota órfã de Pytest resolvida (foi pra `02_Sistema_Interno/Conceitos/`, não pra cá).
- ✅ `Modelos_Notas_Obsidian/padrao.md` resolvido (já está em `LEGADO/`, nada a mover).
- ✅ Menção desatualizada a `Modelos_Notas_Obsidian/` em [[Estrutura e Convenções do Vault]] (seção "Pasta `Bases/`") **corrigida (29/08/2026, 19:59)** — o arquivo `padrao.md` foi apagado pelo usuário (nunca era usado), a comparação foi removida da frase.
- ⏳ **Pendente**: atualizar `relacionado` dentro de cada nota movida, se necessário.

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Definição do Núcleo de Comportamento Claude]]
