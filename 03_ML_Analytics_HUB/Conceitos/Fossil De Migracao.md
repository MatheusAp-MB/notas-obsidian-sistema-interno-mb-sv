---
tipo: conceito
dominio: 
status: ativa
criado: 10/07/2026
relacionado: [Filtrar Fosseis De Migracao Na Camada De Consumo]
---

# Fóssil de Migração

MLB resíduo de uma migração antiga do Mercado Livre — carrega no seu
histórico um número grande de variações que ele já teve um dia, mesmo sem
estar mais ativo/vendável. Marcado por uma tag oficial do próprio ML.

## Como identificar

Tag `variations_migration_source` presente no campo `tags` do item.
Sempre acompanhada de `status: closed` nos casos observados.

## Exemplo real

`MLB2751408939` ("Chinelo Slide Feminino") — encontrado com 48 variações
vinculadas, todas `status: closed`, todas com essa tag.

```python
{
    'status': 'closed',
    'tags': ["good_quality_thumbnail", "variations_migration_source",
             "immediate_payment", "cart_eligible"],
    'stop_time': '2026-04-08T18:38:36.686Z',
    ...
}
```

## Por que importa

Sem tratamento, um fóssil desses infla artificialmente qualquer contagem
agregada de "anúncios" — 1 MLB fechado contando como 48 "anúncios"
distintos numa árvore/relatório, distorcendo números que deveriam
refletir o catálogo ativo real.

## Onde é filtrado

Ver [[Filtrar Fosseis De Migracao Na Camada De Consumo]] — o filtro
acontece na camada de consumo (Django), nunca na coleta bruta. Confirmado
em produção: 107 MLBs identificados e excluídos, resolvendo sozinho uma
divergência de contagem que já vinha sendo rastreada.

## Relacionado

- [[Filtrar Fosseis De Migracao Na Camada De Consumo]]