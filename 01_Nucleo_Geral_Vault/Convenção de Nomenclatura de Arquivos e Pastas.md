---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:15
relacionado: [Nomenclatura e Comentarios, Estrutura de Pastas de um Mundo]
resumo: Nome de arquivo de nota é sempre igual ao usado no wikilink (com espaço, sem underscore, evitando acento quando possível); nome de pasta (mundo, contexto, tipo) usa underscore com prefixo numérico quando aplicável — a convenção de espaço vale só pra arquivo de nota, nunca pra pasta.
---

# Convenção de Nomenclatura de Arquivos e Pastas

**Resumo**: nome de arquivo de nota é sempre igual ao usado no wikilink (com espaço, sem underscore, evitando acento quando possível); nome de pasta (mundo, contexto, tipo) usa underscore com prefixo numérico quando aplicável — a convenção de espaço vale só pra arquivo de nota, nunca pra pasta.

## Contexto

Um vault com dezenas de notas e pastas só continua navegável se o nome de cada arquivo bater exatamente com o nome usado pra linkar ele — do contrário, todo `[[wikilink]]` corre risco de não resolver, ou de resolver errado. Ao mesmo tempo, pasta e arquivo cumprem papéis diferentes (pasta organiza estrutura de sistema de arquivo, arquivo é o conteúdo que alguém lê e linka), então faz sentido que sigam convenções de nome diferentes uma da outra.

## O que diz

- **Nome de arquivo de nota = nome usado no `[[wikilink]]`, com espaço, sem underscore.** Se o arquivo se chama `Estrutura de Pastas de um Mundo.md`, o link em qualquer outra nota é `[[Estrutura de Pastas de um Mundo]]`, nunca `[[Estrutura_de_Pastas_de_um_Mundo]]` ou qualquer variação abreviada.
- **Evitar acento e cedilha em nome de arquivo quando possível** — reduz risco de problema de encoding entre sistemas operacionais diferentes ou ferramentas de sincronização.
- **Nome de pasta (mundo, contexto, tipo) usa underscore, com prefixo numérico quando aplicável** (ex: `03_Sistema_Interno`, `Agenda_Videos`) — a convenção de espaço vale só pra arquivos de nota, nunca pra pastas.

## Por que é assim e não de outro jeito

A alternativa mais simples — usar a mesma convenção (espaço ou underscore) tanto pra arquivo quanto pra pasta — foi descartada porque os 2 tipos de nome são lidos por sistemas diferentes com necessidades diferentes: o nome do arquivo é lido por humano e pelo Obsidian via wikilink, onde espaço é natural e legível; o nome da pasta é digitado com mais frequência em caminho de sistema de arquivo (terminal, script), onde espaço exige aspas ou escape constante — underscore evita esse atrito. Manter os 2 estilos separados, mas fixos e sem exceção dentro de cada categoria, evita a pior alternativa possível: nome de pasta ora com espaço, ora com underscore, dependendo de quem criou.

## Exemplo

**Arquivo de nota** (espaço, sem underscore): `Estrutura de Pastas de um Mundo.md` → linkado como `[[Estrutura de Pastas de um Mundo]]`.

**Pasta de mundo** (underscore, prefixo numérico): `03_Sistema_Interno/` — nunca `03 Sistema Interno/` nem `Sistema_Interno/` sem o prefixo.

**Pasta de contexto** (underscore, sem prefixo numérico, porque contexto não segue ordem de leitura fixa como núcleo/mundo): `Agenda_Videos/` dentro de `03_Sistema_Interno/`.

## Relacionado

- [[Nomenclatura e Comentarios]]
- [[Estrutura de Pastas de um Mundo]]
