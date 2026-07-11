---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# Endpoint de Promoções Rejeita Anúncio Encerrado com HTTP 400 Explícito

O endpoint `GET /seller-promotions/items/{MLB}` rejeita, de forma limpa e
documentada via mensagem de erro, qualquer MLB com `status = closed` —
não retorna lista vazia, retorna erro HTTP 400 explícito.

## Evidência real

```
GET /seller-promotions/items/{MLB_CLOSED}
→ HTTP 400
{"message": "Item status is not allowed (closed)", "error": "bad_request", "status": 400, "cause": []}
```

Testado em **40 MLBs `closed`** distintos (distribuídos entre as
classificações Simples, Base e Catálogo), amostrados numa varredura
estratificada por status — **100% dos 40 retornaram esse mesmo erro,
sem exceção**.

## Conclusão

Não é comportamento imprevisível ou eventual — é uma regra fixa e
100% reprodutível da API: o endpoint de promoções simplesmente não
processa itens encerrados. Consistente com o requisito documentado pela
própria API do Mercado Livre para participação em promoções ("o item
deve ter status igual a ativo").

## Impacto prático

Qualquer script que colete promoções em lote deve tratar HTTP 400 com
essa mensagem específica como "não se aplica" (item encerrado), não como
erro genérico a investigar — e pode pular MLBs `closed` de antemão, sem
nem precisar chamar o endpoint para eles.

## Relacionado

- [[Regras Gerais]]