---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: [Classificacao de Anuncio Usa Apenas 2 Campos]
---

# Catálogo Sem Estoque ou Pausado Mantém Classificação Intacta

Um Anúncio de Catálogo que fica sem estoque, ou é pausado, **continua**
classificado como Catálogo (`catalog_listing = True` intacto) — a
classificação só muda quando o anúncio é genuinamente **encerrado**.

## Contexto que levou ao teste

Surgiu a dúvida (durante a investigação de catálogos "órfãos" sem par
declarado) se ficar sem estoque faria um Anúncio de Catálogo "virar"
Simples silenciosamente — o que tornaria a classificação instável ao
longo do tempo, sem nenhuma ação do vendedor.

## Evidência real

Testado contra a base completa:

```
Anúncios de Catálogo com estoque = 0:  1.052
Anúncios de Catálogo com estoque > 0:    555
```

Os 1.052 com estoque zerado continuam com `catalog_listing = True`
intacto — nenhum "virou" Simples por ficar sem estoque. Confirmado também
com exemplos reais de `status = paused` mantendo `catalog_listing = True`.

## Conclusão

| Situação | `catalog_listing`/`catalog_product_id` mudam? |
|---|---|
| Catálogo fica sem estoque | ❌ Não muda — continua Catálogo, só não compete |
| Catálogo é pausado | ❌ Não muda |
| Catálogo é encerrado | ✅ Pode mudar — o par pode perder o vínculo e "sobrar" como Simples |

Ficar sem estoque/pausado apenas afeta a **competição** (o anúncio deixa
de competir de fato, refletido no `price_to_win` retornando
`not_listed`), não a **classificação estrutural** do anúncio.

## Relacionado

- [[Classificacao de Anuncio Usa Apenas 2 Campos]]