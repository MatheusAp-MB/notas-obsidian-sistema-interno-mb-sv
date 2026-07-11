---
tipo: regra
dominio: 
status: ativa
criado: 10/07/2026
relacionado: [Regras Gerais, Visao Geral do Projeto, Quando Registrar no Obsidian]
---

# Estrutura e Convenções do Vault

Esta nota é a especificação técnica fixa da organização deste vault. Não é
sobre comportamento ou comunicação (ver [[Regras Gerais]]) — é sobre como
pastas, arquivos, nomes e frontmatter devem ser montados, sempre da mesma
forma, em qualquer parte do vault.

## Convenção de nome de arquivo

- **Nome do arquivo = nome usado no link `[[wikilink]]`, com espaço, sem
  underscore.** Ex: arquivo `Visao Geral do Projeto.md`, link
  `[[Visao Geral do Projeto]]`. Nunca misturar underscore no arquivo com
  espaço no link (ou vice-versa) — isso quebra a resolução do Obsidian e
  cria nota duplicada/fantasma no grafo.
- Evitar acento e cedilha em nome de arquivo quando possível — não quebra o
  Obsidian, mas complica leitura via URL/script (precisa de URL-encoding).
  Preferir "Descobertas" a "Descõbertas", por exemplo.
- Nome de pasta usa underscore com prefixo numérico (`01_Notas_Gerais`,
  não "01 Notas Gerais") — a convenção de espaço vale só para arquivos de
  nota, não para pastas.

## Estrutura de pastas (fixa)

```
00_Mapa_de_Notas/          → Índice Geral e MOCs, ponto de entrada
01_Notas_Gerais/           → Glossário, regras gerais, regras estruturais
02_Sistema_Interno_Django/
03_ML_Analytics_HUB/
Modelos_Notas_Obsidian/    → Templates, nunca conteúdo
```

Dentro de cada pasta de "mundo" (`02_`, `03_`), a subestrutura é sempre
idêntica:

```
Regras/
Decisoes/
Descobertas/
Duvidas/
Bugs_Conhecidos/
Conceitos/
Scripts/
```

Mesmo nome de subpasta = mesmo significado em qualquer mundo. Não criar
pasta por domínio técnico (CSS/JS/Python/etc) — domínio é campo de
frontmatter, não pasta (ver abaixo).

## Frontmatter (schema fixo, campos obrigatórios)

```yaml
---
tipo: 
dominio: 
status: ativa
criado: DD/MM/YYYY
relacionado: []
---
```

- **`tipo`** (obrigatório, vocabulário fechado): `regra` | `decisao` |
  `descoberta` | `duvida` | `bug_conhecido` | `conceito`
- **`dominio`** (opcional, vocabulário aberto): `css` | `html` | `js` |
  `python` | `banco_de_dados` | `performance` | `design` | (vazio se não
  se aplicar)
- **`status`**: `ativa` | `resolvida` | `descartada` — só varia de fato
  para `decisao` e `duvida`; demais tipos ficam sempre `ativa`
- **`criado`**: data real no formato `DD/MM/YYYY`, nunca ISO
- **`relacionado`**: lista de nomes de notas (sem `[[ ]]` aqui, só o nome
  exato do arquivo)

## Nunca duplicar informação estrutural fora desta nota

Se uma convenção nova precisar ser definida (nova pasta, novo campo de
frontmatter, nova regra de nome), ela é adicionada aqui — não criada solta
em outra nota, para não haver duas fontes divergentes sobre estrutura.

## Relacionado

- [[Regras Gerais]]
- [[Visao Geral do Projeto]]
- [[Quando Registrar no Obsidian]]
