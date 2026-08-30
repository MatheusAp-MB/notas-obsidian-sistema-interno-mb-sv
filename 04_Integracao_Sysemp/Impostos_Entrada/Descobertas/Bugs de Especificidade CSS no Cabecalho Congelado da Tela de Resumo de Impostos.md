---
tipo: descoberta
dominio: frontend
status: corrigida
criado: 16/08/2026
atualizado_em: 16/08/2026 03:34
relacionado: [Tela e Planilha de Resumo de Impostos de Entrada, Padrao de Qualidade e Clareza Estrutural do Repositorio]
---

# Bugs de Especificidade CSS no Cabeçalho Congelado da Tela de Resumo de Impostos

## Contexto

Durante a construção da tela "Resumo de Impostos de Entrada" (ver [[Tela e Planilha de Resumo de Impostos de Entrada]]), o cabeçalho de 2 linhas com colunas congeladas (`position: sticky`, estilo "congelar painéis" do Excel) quebrou 2 vezes por motivos de CSS puro — não backend, não dado. Registrado aqui porque as 2 causas são genéricas o bastante pra se repetir em qualquer tabela sticky/agrupada futura do sistema.

## Bug 1 — `colspan` + `position: sticky` no cabeçalho de grupo

**Sintoma real** (print do usuário, "algo deu errado"): blocos de cor do cabeçalho de grupo apareciam fora de ordem/deslocados, e a coluna "Produto" renderizava a ~50px de largura com o texto quebrando letra por letra, mesmo com `width: 200px` explícito no `<col>`.

**Causa suspeita** (não 100% confirmável sem inspecionar o motor de renderização por dentro, mas o padrão bate com relato conhecido de outros projetos): combinar `colspan` com `position: sticky; left: Xpx` numa única célula de cabeçalho de grupo é uma combinação frágil entre navegadores — o cálculo de largura da célula colspanada pode não respeitar de forma confiável a largura agregada das colunas que ela deveria cobrir.

**Correção:** a linha 1 (grupo) parou de usar 1 célula `colspan="5"` pra "Dados do produto" — passou a usar as MESMAS 5 células individuais (sem colspan) que a linha 2 já usa, cada uma com seu próprio `left` explícito (`col-h-foto`, `col-h-produto` etc. reaproveitados). Resultado: a linha 1 acompanha exatamente as mesmas colunas da linha 2/corpo ao rolar, sem depender de colspan+sticky-left junto.

## Bug 2 — regra genérica de cor vencendo por especificidade, não por ordem

**Sintoma real** (2 rodadas de print do usuário): primeiro só a linha 1 aparecia com texto de cor errada; depois, mesmo corrigida a linha 1, o usuário reportou que a LINHA 2 inteira ("Foto Produto SKU EAN NCM Nota fiscal Fornecedor Empresa Data entrada Custo unit. Alíq. Red. ...") estava em branco, ilegível sobre fundo pastel claro.

**Causa raiz confirmada** (lendo o CSS real, calculando especificidade CSS, e conferindo o valor real da variável): a regra genérica

```css
.resumo-entrada-tabela th { color: var(--cor-texto-claro); }
```

tem especificidade **1 classe + 1 elemento** (`.resumo-entrada-tabela` + `th`), enquanto as regras "específicas" de cada grupo (`.col-h-produto`, `.sub-nota`, `.sub-icms` etc.) são só **1 classe** cada. Em CSS, comparação de especificidade é lexicográfica — empata no número de classes, e quem tem mais seletores de elemento/tipo GANHA, mesmo com só 1 classe a menos. Ou seja: a regra "genérica" tinha, contra a intuição, MAIS especificidade que as regras "específicas" — e vencia silenciosamente, sem erro nenhum no console. `--cor-texto-claro` é `#ffffff` (definida em `core/static/base_compartilhada/css/layout_global.css`), por isso o texto sumia sobre fundo claro.

**Correção:** removida a propriedade `color` da regra genérica `.resumo-entrada-tabela th` por completo — toda `<th>` da tabela já carrega uma classe própria (`col-h-*`, `sub-*` ou `grupo-*`) com sua cor certa; a regra genérica não precisava (e não devia) opinar sobre cor.

## Lição pra qualquer tabela sticky/agrupada futura

1. Evitar `colspan` numa célula que também é `position: sticky` com `left`/`right` explícito — se precisar de um rótulo de grupo congelado, replicar a mesma célula individual (sem colspan) usada na linha de baixo, cada uma com seu próprio offset.
2. Nunca deixar uma regra genérica (`.tabela th { color: ... }`) competir com classes específicas de coloração — um seletor com classe+elemento é MAIS específico que um seletor só de classe, mesmo parecendo "mais genérico" à primeira vista. Ou a regra genérica não define a propriedade em disputa, ou ela é escrita deliberadamente menos específica que qualquer override esperado.

## Relacionado

- [[Tela e Planilha de Resumo de Impostos de Entrada]]
- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
