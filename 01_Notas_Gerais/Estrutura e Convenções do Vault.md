---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
relacionado: []
---

# Estrutura e Convenções do Vault

Esta nota é a especificação técnica fixa da organização deste vault, reescrita em 01/08/2026 depois de mover todo o conteúdo anterior para `LEGADO/`. Substitui por completo a versão antiga.

## Os 3 mundos

- **`02_Sistema_Interno/`** — ativo, reconstruído do zero a partir desta data. Segue a estrutura descrita abaixo.
- **`03_ML_Analytics_HUB/`** — congelado dentro de `LEGADO/` por enquanto. Não segue necessariamente esta convenção nova até uma decisão futura de também reconstruí-lo.
- **Integração Sysemp** — ainda não existe. Só cria pasta quando o projeto realmente começar, seguindo o mesmo padrão de `02_Sistema_Interno/` abaixo.

## Convenção de nome (mantida)

- Nome de arquivo de nota = nome usado no `[[wikilink]]`, com espaço, sem underscore.
- Evitar acento e cedilha em nome de arquivo quando possível.
- Nome de pasta (mundo, contexto, tipo) usa underscore com prefixo numérico quando aplicável (`02_Sistema_Interno`, `Agenda_Videos`) — a convenção de espaço vale só para arquivos de nota, nunca para pastas.

## Estrutura de pastas dentro de `02_Sistema_Interno/`

```
02_Sistema_Interno/
  00_Indice.md                → índice obrigatório do mundo (ver seção própria abaixo)
  Regras_de_Comportamento/    → regras de processo (como Claude deve agir neste projeto:
                                 gerar código, analisar código, pensar sobre algo).
                                 Arquivos soltos direto aqui, sempre tipo=regra.
                                 Nunca contém duvida ou bug_conhecido.
  <Contexto>/                  → criado sob demanda, na primeira nota daquele contexto
    Decisoes/
    Duvidas/
    Regras/
    Descobertas/
    Bugs_Conhecidos/
    Conceitos/
    Checkpoints/                → estado de trabalho em andamento (ver seção própria abaixo)
```

- **Contexto** agrupa um tema de negócio (ex: `Agenda_Videos`, `Precificacao`) — não precisa corresponder 1:1 a um app Django; pode interligar vários pontos do projeto.
- Nota que toca mais de 1 contexto mora no contexto principal e referencia o outro via `relacionado` — nunca duplicada em duas pastas.
- Subpasta de tipo (`Decisoes/`, `Duvidas/`, etc.) só existe dentro de um contexto quando já tiver pelo menos 1 nota daquele tipo — nunca pré-criada vazia.
- `Regras_de_Comportamento/` é diferente de um contexto: é nível do mundo, não de negócio, e não tem subpastas de tipo — só regras, soltas.

## Frontmatter (schema fixo)

```yaml
---
tipo: 
dominio: 
status: 
criado: DD/MM/YYYY
relacionado: []
---
```

- **`tipo`** (vocabulário fechado): `regra` | `decisao` | `descoberta` | `duvida` | `bug_conhecido` | `conceito` | `checkpoint`
- **`dominio`** (vocabulário aberto, opcional): `python` | `css` | `js` | `banco_de_dados` | `performance` | `design` | (vazio) — nunca nome de projeto ou contexto (isso já é a pasta onde a nota está).
- **`status`** depende do `tipo`:
  - `duvida`: `ativa` | `resolvida`
  - `decisao`: `ativa` | `descartada`
  - `bug_conhecido`: `ativo` | `corrigido`
  - `checkpoint`: `em_andamento` | `concluido`
  - `regra` | `descoberta` | `conceito`: sempre `ativa`
- **`criado`**: `DD/MM/YYYY`, nunca ISO.
- **`relacionado`**: lista de nomes exatos de nota, sem `[[ ]]`.

## Ciclo de vida de dúvida e bug (nunca apagar histórico)

- **Dúvida resolvida**: nunca edita a nota de dúvida virando decisão. Gera uma nota **nova**, `tipo: decisao`, com a resposta e o motivo, linkada de volta via `relacionado`. A dúvida original muda `status` para `resolvida` e continua existindo — é o registro de "isso foi incerto até tal data, aqui está o que resolveu", útil se um caso parecido aparecer depois.
- **Bug corrigido**: a mesma nota ganha uma seção `## Correção` (o que foi feito, quando) e `status` muda de `ativo` para `corrigido`. Não gera nota nova — causa e correção ficam juntas no mesmo lugar.

## Checkpoint — nota que se atualiza no lugar (nunca gera nota nova)

Diferente de dúvida/decisão/bug (que preservam histórico gerando nota nova ou seção extra), `checkpoint` registra o ESTADO ATUAL de um trabalho em andamento de várias sessões — e é sobrescrito na mesma nota a cada atualização relevante, com uma seção `## Última atualização` no topo do corpo (data). Existe porque a memória de conversa é volátil (sujeita a compactação) — o checkpoint é a memória persistente desse progresso. Quando o trabalho termina de vez, `status` muda para `concluido` (a nota continua existindo, como registro final).

## Índice (`00_Indice.md`)

- Obrigatório, um arquivo por mundo, dentro da raiz de `02_Sistema_Interno/`.
- Agrupado por contexto (`##`), com uma tabela: `Nota | Tipo | Status | Data | Resumo`.
- `Resumo` é a conclusão real da nota em até ~25 palavras — nunca uma descrição genérica da categoria.
- Sem coluna de `relacionado` — isso fica só dentro da nota em si.
- Atualizado na mesma autorização de escrita da nota que o gerou — não é uma autorização separada.

## Nunca duplicar informação estrutural fora desta nota

Se uma convenção nova precisar ser definida (nova pasta, novo campo de frontmatter, nova regra de nome), ela é adicionada aqui — nunca criada solta em outra nota.

## Relacionado

- [[padrao]]
