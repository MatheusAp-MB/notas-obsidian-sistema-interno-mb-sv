---
tipo: bug_conhecido
dominio: banco_de_dados
status: corrigido
criado: 14/08/2026
atualizado_em: 14/08/2026 09:55
relacionado: [Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir, Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]
---

# Quase-Erro na Migração Django ao Renomear `ncm` para `ncm_cadastro`

## O que aconteceu

Ao rodar `python manage.py makemigrations impostos` pra aplicar a reorganização de campos (ver [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]), o Django detectou que o campo único antigo `ncm` tinha sido substituído por 2 campos novos (`ncm_xml`, `ncm_cadastro`) e perguntou interativamente qual dos 2 era o rename: `Was impostosecustosxmlentradaproduto.ncm renamed to impostosecustosxmlentradaproduto.ncm_cadastro? [y/N]`. A resposta dada foi **`y`** — errada: o dado que já existia em `ncm` sempre veio do XML, nunca do Cadastro.

## Por que isso seria grave

Se a migração tivesse rodado assim, o Django faria `RENAME COLUMN ncm TO ncm_cadastro` — todo o dado real já sincronizado (XML) ficaria rotulado como se fosse Cadastro, e `ncm_xml` nasceria vazio (`NULL`) pra cada produto já sincronizado. O erro não dá exceção nem crash — é silencioso, só apareceria depois, como dado fiscal errado exibido/usado como se fosse Cadastro.

## Causa raiz

O prompt interativo do `makemigrations` pergunta sobre rename só por similaridade de nome de campo (`ncm` → candidatos `ncm_xml`/`ncm_cadastro`) — ele não sabe, e não pode saber, qual dos 2 novos nomes corresponde semanticamente ao dado antigo. Essa é uma decisão de negócio (qual fonte o campo sempre representou), não algo que a ferramenta consegue inferir.

## Correção

Identificado antes de rodar `migrate`. A migração gerada foi apagada e `makemigrations` rodado de novo, respondendo **`N`** pra "renomeado pra `ncm_cadastro`" (o que faz o Django perguntar a alternativa, "renomeado pra `ncm_xml`?"), respondendo **`y`** pra essa. As outras 5 respostas da mesma rodada (`cst` → `cst_xml` ×4, `base` → `base_calculo`) estavam corretas, sem mudança. Migração corrigida confirmada e aplicada com sucesso (`migrate` rodado, sem erro).

## Lição pra qualquer migração futura com rename ambíguo

Sempre que `makemigrations` perguntar sobre rename de campo que está sendo desdobrado em par (1 campo antigo → 2+ campos novos), a resposta certa depende de qual fonte de dado o campo antigo sempre representou — nunca assumir pela ordem em que o Django pergunta, nem pela semelhança de nome. Conferir contra a regra de negócio real (aqui: [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]) antes de confirmar qualquer prompt de rename.

## Relacionado

- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
