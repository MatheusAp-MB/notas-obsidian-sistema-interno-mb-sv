---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:15
relacionado: [Os 9 Tipos de Nota, Regra do Índice Obrigatório, Perguntar Data e Hora Antes de Escrever no Vault]
resumo: O schema fixo de frontmatter que toda nota do vault usa — `tipo`, `dominio`, `status`, `criado`, `atualizado_em`, `relacionado` — com o formato e a regra de preenchimento de cada campo.
---

# Schema de Frontmatter

**Resumo**: o schema fixo de frontmatter que toda nota do vault usa — `tipo`, `dominio`, `status`, `criado`, `atualizado_em`, `relacionado` — com o formato e a regra de preenchimento de cada campo.

## Contexto

Antes deste schema ser fixado, cada nota podia acumular campos diferentes, em ordens diferentes, dificultando qualquer leitura automatizada (por Claude ou por uma Base do Obsidian) que dependesse de um campo estar sempre no mesmo lugar, com o mesmo nome. Fixar um schema único resolve isso de vez — qualquer nota nova segue exatamente esta estrutura, sem variação.

## O que diz

```yaml
---
tipo: 
dominio: 
status: 
criado: DD/MM/YYYY
atualizado_em: DD/MM/YYYY HH:mm
relacionado: []
---
```

- **`tipo`** (vocabulário fechado, 9 valores: `regra` | `decisao` | `descoberta` | `duvida` | `bug_conhecido` | `conceito` | `checkpoint` | `tutorial` | `prompt`) — definição, critério de distinção e `status` possível de cada um mora em nota própria: [[Os 9 Tipos de Nota]].
- **`dominio`** (vocabulário aberto, opcional): `python` | `css` | `js` | `banco_de_dados` | `performance` | `design` | (vazio) — nunca nome de projeto ou contexto (isso já é a pasta onde a nota está).
- **`status`**: depende do `tipo` — cada tipo tem seu próprio conjunto de valores possíveis, listado em [[Os 9 Tipos de Nota]].
- **`criado`**: `DD/MM/YYYY`, nunca ISO. Nunca muda depois de escrito.
- **`atualizado_em`**: `DD/MM/YYYY HH:mm` (campo adicionado em 03/08/2026 — `criado` sozinho não refletia a última edição de conteúdo). Toda nota nova já nasce com `atualizado_em` igual a `criado` (só sem hora). Toda edição de conteúdo depois disso atualiza só este campo — `criado` nunca muda. Campo adicionado de forma NÃO retroativa: notas antigas sem esse campo continuam válidas, só ganham `atualizado_em` na próxima vez que forem editadas de verdade.
- **`relacionado`**: lista de nomes exatos de nota, sem `[[ ]]`.

## Por que é assim e não de outro jeito

Manter `criado` em formato `DD/MM/YYYY` (em vez de ISO `YYYY-MM-DD`) foi uma decisão consciente do usuário, mesmo sabendo do trade-off: ISO permitiria comparação/aritmética de data mais fácil dentro de uma Base do Obsidian (ex: "notas atualizadas nos últimos 7 dias"), mas `DD/MM/YYYY` é muito melhor pra visualização humana direta — e o vault prioriza legibilidade humana sobre conveniência de automação nesse ponto específico (ver [[Princípios Fundamentais do Vault]], princípio 2). Separar `criado` de `atualizado_em` em 2 campos, em vez de só 1 campo de data, existe porque `criado` sozinho escondia havia quanto tempo o conteúdo de uma nota antiga tinha sido revisado de verdade pela última vez — informação que passou a importar conforme o vault cresceu.

## Exemplo

Frontmatter real desta própria nota:

```yaml
---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:15
relacionado: [Os 9 Tipos de Nota, Regra do Índice Obrigatório, Perguntar Data e Hora Antes de Escrever no Vault]
---
```

Um caso de `dominio` preenchido, pra contraste: uma nota sobre um bug de cálculo em Python usa `dominio: python`; uma nota sobre ajuste de cor de callout no Obsidian usa `dominio: css`; uma regra de comportamento (como as de `00_Nucleo_Comportamento_Claude/`) deixa `dominio` vazio, porque não é sobre nenhuma tecnologia específica.

## Relacionado

- [[Os 9 Tipos de Nota]]
- [[Regra do Índice Obrigatório]]
- [[Perguntar Data e Hora Antes de Escrever no Vault]]
