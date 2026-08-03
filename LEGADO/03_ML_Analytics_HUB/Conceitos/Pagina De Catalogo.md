---
tipo: conceito
dominio: 
status: ativa
criado: 10/07/2026
relacionado: [Nomenclatura Base Catalogo Simples Pagina De Catalogo, Classificacao de Anuncio Usa Apenas 2 Campos]
---

# Página de Catálogo

Entidade/produto do catálogo do Mercado Livre onde múltiplos vendedores
competem pela venda com seus próprios anúncios (Anúncios de Catálogo).

## Definição

- Identificada pelo campo `catalog_product_id` da API.
- **NÃO é um MLB** — não tem anúncio próprio, é a página/produto
  compartilhado que agrupa os concorrentes.
- Uma Página de Catálogo pode ter **múltiplas** Bases vinculadas
  (produtos/vendedores diferentes competindo na mesma página), e cada
  Base pode ter múltiplos Anúncios de Catálogo apontando pra ela.

## Hierarquia (1→N em todas as camadas)

```
1 SKU                 → N Anúncios (de qualquer tipo)
1 Página de Catálogo  → N Anúncios Base
1 Anúncio Base        → N Anúncios de Catálogo
```

## Termos relacionados que não devem ser confundidos

- **Anúncio Base** — MLB que serve de origem para um Anúncio de Catálogo
- **Anúncio de Catálogo** — MLB que compete de fato dentro da Página
- **Anúncio Simples** — MLB sem nenhuma Página de Catálogo vinculada

Ver [[Nomenclatura Base Catalogo Simples Pagina De Catalogo]] para o
motivo dessa nomenclatura ter sido escolhida.

## Relacionado

- [[Nomenclatura Base Catalogo Simples Pagina De Catalogo]]
- [[Classificacao de Anuncio Usa Apenas 2 Campos]]
