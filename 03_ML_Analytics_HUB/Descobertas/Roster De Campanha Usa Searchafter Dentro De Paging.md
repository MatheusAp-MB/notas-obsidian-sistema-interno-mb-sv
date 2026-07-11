---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# Roster de Campanha Usa searchAfter Dentro de paging, Não na Raiz

O endpoint `GET /seller-promotions/promotions/{ID}/items` pagina via um
campo chamado `searchAfter` (não `search_after`), que fica **dentro** do
objeto `paging` da resposta — não solto na raiz do JSON.

## Contexto que levou ao teste

Um primeiro teste comparou o total de itens já coletado (sem paginar)
contra uma nova busca "paginando" — mas o script procurava o cursor
`search_after`/`searchAfter` na **raiz** da resposta, e nenhuma resposta
tinha esses campos ali. Isso levou a uma falsa conclusão inicial de que
os rosters "bateram" e estavam completos.

## Evidência real (conteúdo completo do objeto `paging`)

```json
{"total": 463, "limit": 50, "searchAfter": "2d7f39f6681faac3bc..."}
```

Exemplos reais coletados:

| Campanha | Itens retornados numa chamada | `paging.total` declarado |
|---|---|---|
| LGH-MLB1000 | 50 | 105 |
| P-MLB17647056 | 72 | 463 |
| P-MLB17755022 | 100 | 112 |
| P-MLB17801002 | 95 | 53 (!) |
| P-MLB17771036 | 101 | 134 |

## Achados adicionais, ainda não totalmente explicados

1. **`limit` é sempre 50, mas a quantidade de itens retornados numa única
   chamada nem sempre é 50** — às vezes vem bem mais (72, 100, 101) numa
   resposta só, sem paginar. Mecanismo exato não entendido.
2. **`paging.total` às vezes é MENOR que a quantidade de itens já
   retornados** (`P-MLB17801002`: total=53, mas vieram 95 itens) —
   inconsistência da própria API, não investigada a fundo.
3. **Estabilidade confirmada:** a mesma campanha, consultada 2x em
   sequência imediata (sem intervalo), retornou exatamente o mesmo número
   de itens nas duas vezes — descartando a hipótese de volatilidade
   instantânea. Uma diferença observada anteriormente entre duas coletas
   distantes no tempo (87 → 95, mesma campanha) é explicada por mudança
   real na lista de candidatos ao longo do tempo, não por
   inconsistência de paginação.

## Conclusão

Rosters de campanha **estão truncados** na coleta atual — nenhum roster
grande testado trouxe o total real declarado pela própria API. Para obter
a lista completa de itens de uma campanha, a paginação via `searchAfter`
(lido de dentro de `paging`) é obrigatória, não opcional.

## Relacionado

- [[Regras Gerais]]