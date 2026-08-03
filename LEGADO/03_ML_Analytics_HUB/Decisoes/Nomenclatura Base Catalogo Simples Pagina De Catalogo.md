---
tipo: decisao
dominio: 
status: ativa
criado: 10/07/2026
relacionado: []
---

# Nomenclatura: Base / Catálogo / Simples / Página de Catálogo

Fixada a nomenclatura de quatro termos para descrever a árvore de
classificação de anúncios, evitando a ambiguidade da palavra "Catálogo"
sozinha.

## Nomenclatura fixada

| Termo | Significado |
|---|---|
| **Página de Catálogo** | A entidade/produto do catálogo do ML onde múltiplos anúncios competem. Identificada por `catalog_product_id`. NÃO é um MLB. |
| **Anúncio Base** | MLB que serve de base/origem para um ou mais Anúncios de Catálogo |
| **Anúncio de Catálogo** | MLB que efetivamente compete dentro da Página de Catálogo |
| **Anúncio Simples** | MLB sem nenhuma relação com catálogo |

## Contexto que levou à decisão

A palavra "Catálogo" no Mercado Livre é usada tanto para a **entidade/página**
(onde produtos competem) quanto para o **tipo de anúncio** (que compete
dentro dela) — isso gerava confusão real na equipe antes desta decisão,
já que a mesma palavra apontava para dois conceitos diferentes dependendo
do contexto da frase.

## Alternativas descartadas

- **"Anúncio NO CATÁLOGO" / "Anúncio NÃO CATÁLOGO"** — descartado por
  ambiguidade visual/sonora entre "no" e "não", fácil de ler errado numa
  planilha ou relatório corrido.
- **"Avulso"** (para o que virou "Anúncio Simples")— descartado por
  carregar conotação negativa ("perdido", "deslocado", "no lugar
  errado"), quando na verdade é só um anúncio comum sem particularidade
  de catálogo.
- **"Anúncios Competidores"** (para "Anúncio de Catálogo") — considerado
  mais preciso tecnicamente, mas descartado porque a equipe inteira
  (incluindo o dono do negócio) já usa "anúncio catálogo" no dia a dia;
  a solução adotada foi qualificar o termo existente ("Anúncio **de**
  Catálogo") em vez de substituí-lo por um termo novo que ninguém usaria
  na prática.

## Princípio geral aplicado

"Catálogo" sozinho, sem complemento, nunca deveria aparecer em relatório
ou conversa técnica daqui pra frente — sempre "Página de Catálogo" (a
entidade) ou "Anúncio de Catálogo" (o competidor).

## Relacionado

- [[Regras Gerais]]