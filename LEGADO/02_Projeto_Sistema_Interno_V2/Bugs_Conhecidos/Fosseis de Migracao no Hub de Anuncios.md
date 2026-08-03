---
tipo: Bug Conhecido
status: Resolvido
criado: 12/07/2026
dominio: Sistema Interno Django
relacionado: [Hub de Anúncios, Coleta ML Analytics HUB]
---

# Fósseis de Migração no Hub de Anúncios

## O sintoma

Buscando por um MLB específico (`MLB2751408939`, "Chinelo Slide Feminino
Ortopédico"), ele apareceu no Hub com **48 variações** — todas `status:
closed`, todas com as mesmas fotos, nenhuma com SKU. Achado durante um teste
manual de uma feature não relacionada (contagem de "quantidade de
anúncios"), quando a soma dos cards de cada bloco de SKU divergiu do total
do cabeçalho em 383 unidades.

## A causa raiz

Confirmado com dado bruto: esse MLB (e mais 106 outros, 107 no total) tem
uma tag oficial do próprio Mercado Livre no campo `tags` do item:
"variations_migration_source"

Essa tag marca um MLB como **origem histórica de uma migração antiga de
variações** do próprio ML — não é documentação oficial pública, foi inferida
por observação de dado real. O anúncio carrega o histórico completo de
todas as variações que já teve um dia (cor × tamanho, por exemplo), mesmo
não estando mais ativo — `status: closed`, `stop_time` no passado.

**Confirmado com 100% de precisão:** rodando a checagem contra todo o
`detalhes_mlbs.json`, **todos** os 490 registros que têm essa tag (107 MLBs
únicos) têm `status: closed`. Nenhum caso de `active`/`paused` com essa tag
foi encontrado — a regra "excluir quem tem essa tag" é segura.

## Por que não filtrar por `status: closed` direto

Cogitado e descartado. `status: closed` sozinho **não é sinônimo de "lixo a
descartar"** neste projeto — já existem casos de MLBs `closed` que carregam
informação de negócio genuinamente útil (ex: usados em investigações reais
sobre o comportamento do MLBU entre pares Base/Catálogo). Filtrar todo
`closed` na origem destruiria dado relevante junto com o ruído. O critério
certo é a tag específica, não o status.

## Por que não filtrar na coleta (lado da API)

Decisão tomada em conjunto com a sessão paralela do ML Analytics HUB: a
coleta (`buscar_mlbs.py`/`buscar_detalhes.py`) segue filosofia deliberada de
**completude sobre brevidade** — "melhor ter e não usar". O filtro foi
aplicado só na camada de consumo (lado Django), como regra de negócio fixa e
documentada, sem alterar os scripts de coleta nem os JSONs brutos.

## A correção aplicada

1. Novo campo `AnuncioMercadoLivre.eh_fossil_migracao` (booleano), calculado
   na importação (`importar_anuncios_ml.py`) a partir do campo `tags` bruto.
2. Excluído **sempre**, sem opção de exibir, nas 2 funções que alimentam o
   Hub: `carregar_variacoes_por_sku()` e `listar_skus_filtrados()` (em
   `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py`). Mesmo
   padrão já usado pra excluir Catálogo da tela de Resumo de Critérios —
   regra de negócio fixa, não filtro opcional.

## Efeito colateral bom, não planejado

A exclusão resolveu sozinha uma divergência de contagem que estava em
investigação havia um tempo (5.831 → 5.724 anúncios totais, exatamente
-107) — não foi necessário decidir entre contar "MLB distinto" vs "folha/
variação" como definição de "anúncio", como se cogitou antes de achar essa
causa raiz. O problema real nunca foi a definição de contagem, era esse dado
espúrio inflando tudo.

## Relacionado

- [[Regras Gerais]]
- [[Visao Geral do Projeto]]