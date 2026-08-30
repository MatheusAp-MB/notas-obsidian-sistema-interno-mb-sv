---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:26
relacionado: [Estrutura de Pastas de um Mundo, Schema de Frontmatter]
resumo: Todo mundo precisa de um `00_Indice.md` na raiz, agrupado por contexto, com tabela `Nota | Tipo | Status | Data | Resumo` — `Resumo` é a conclusão real da nota em até ~25 palavras, atualizado na mesma autorização de escrita que gerou ou editou a nota.
---

# Regra do Índice Obrigatório

**Resumo**: todo mundo precisa de um `00_Indice.md` na raiz, agrupado por contexto, com tabela `Nota | Tipo | Status | Data | Resumo` — `Resumo` é a conclusão real da nota em até ~25 palavras, atualizado na mesma autorização de escrita que gerou ou editou a nota.

## Contexto

Sem um índice, encontrar uma nota específica dentro de um mundo com dezenas de arquivos depende de já saber o nome exato dela ou vasculhar pasta por pasta — tanto pra um humano quanto pra Claude reconstruindo contexto depois de uma compactação de conversa. O índice existe pra resolver exatamente isso: 1 lugar só, por mundo, que lista tudo que existe com um resumo real do conteúdo.

## O que diz

- Obrigatório, um arquivo por mundo (`00_Indice.md` na raiz de cada mundo) — vale pra todo mundo, sem exceção, não só pro mundo onde a regra nasceu originalmente (`03_Sistema_Interno/`).
- Agrupado por contexto (`##`), com uma tabela: `Nota | Tipo | Status | Data | Resumo`.
- `Resumo` é a conclusão real da nota em até ~25 palavras — nunca uma descrição genérica da categoria (ex: nunca "registra uma decisão sobre X", sempre a decisão em si, resumida).
- Sem coluna de `relacionado` — isso fica só dentro da nota em si, o índice não duplica esse campo.
- Atualizado na mesma autorização de escrita da nota que o gerou — não é uma autorização separada. Ou seja: quando uma nota nova é escrita ou uma existente é editada de forma relevante, a linha correspondente no índice do mundo dela é atualizada no mesmo momento, sem pedir confirmação de novo só pra essa parte.

## Por que é assim e não de outro jeito

Um resumo genérico por categoria (ex: toda linha de `bug_conhecido` dizendo só "registra um bug encontrado no sistema") foi descartado porque não ajuda em nada na prática — quem está escaneando o índice já sabe que aquela linha é um bug pela coluna `Tipo`; o que falta saber é QUAL bug, resumido o bastante pra decidir se vale abrir a nota inteira ou não. Atualizar o índice na mesma autorização (em vez de pedir confirmação separada) evita o risco real de a nota existir mas o índice ficar desatualizado — motivo prático: se fosse uma autorização à parte, ficaria fácil esquecer desse passo depois de escrever a nota em si.

## Exemplo

Trecho real de índice, mostrando o agrupamento por contexto e o resumo condensado (não genérico):

```markdown
## Modelos_Referencia_de_Escrita

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| Modelo de Escrita — Arco de Resolucao... | regra | ativa | 30/08/2026 | Esqueleto de referência para notas que respondem uma pergunta ou resolvem um problema... |
```

Repare que o `Resumo` não diz "define um modelo de escrita" (genérico) — diz o que o modelo especificamente cobre, o suficiente pra decidir se é a nota certa antes de abrir ela.

## Relacionado

- [[Estrutura de Pastas de um Mundo]]
- [[Schema de Frontmatter]]
