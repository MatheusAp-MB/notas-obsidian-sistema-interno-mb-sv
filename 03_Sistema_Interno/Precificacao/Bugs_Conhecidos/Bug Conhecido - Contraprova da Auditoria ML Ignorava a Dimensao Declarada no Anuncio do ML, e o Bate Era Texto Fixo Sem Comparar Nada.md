---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 14/09/2026
atualizado_em: 14/09/2026 09:31
relacionado: [Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML, Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes, Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design, Exportação em PDF da Auditoria ML — Reaproveitamento da View de Impressão do Navegador]
---

# Bug Conhecido: Contraprova da Auditoria ML Ignorava a Dimensão Declarada no Anúncio do ML, e o "✓ Bate" Era Texto Fixo Sem Comparar Nada

**Resumo**: A contraprova da Visão 1 (auditoria de precificação ML — chama `calcular_margem()`, implementação independente também usada no Hub de Promoções) sempre lia a dimensão/peso do Produto ERP direto, mesmo quando o preço oficial daquele MLB foi calculado com a dimensão DECLARADA no anúncio do Mercado Livre (`resolver_dimensoes_efetivas`, o mesmo ponto único de decisão do [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML|bug de 11/09]]). Gerava margens divergentes da Visão 1 pra qualquer produto com dimensão do ML diferente da do ERP — em 1 caso real, R$ 18,43 / 3,79 p.p. de diferença. Piorando: o texto "✓ Bate com a margem obtida na Visão 1" era fixo no template, sem nenhuma comparação real — aparecia sempre, mesmo com essa diferença grande.

> [!success] CORRIGIDO em 14/09/2026 — validado com dado real (5 PDFs, 3 produtos × Clássico/Premium)
> `calcular_margem()` (`mercado_livre/funcoes_auxiliares/calculo_margem.py`) passou a aceitar `variacao` (opcional) e, quando passado, resolve a dimensão via `resolver_dimensoes_efetivas()` — a mesma fonte que a fórmula real de precificação usa — em vez de ler sempre o Produto ERP. A contraprova da tela de auditoria (`_montar_contraprova_visao_1`, `grade_mercado_livre.py`) passou a passar essa `variacao`. Comportamento antigo preservado pra quem chama sem esse parâmetro (Hub de Promoções não foi alterado). Template passou a comparar de verdade (tolerância R$ 0,05) em vez do "✓ Bate" fixo. Validado: os 3 produtos que antes divergiam (R$ 1,50 / R$ 1,80 / R$ 18,43) e mais 2 variações novas (Premium) bateram exatamente, ao centavo.

## Como foi achado

Descoberto ao validar a exportação em PDF (ver [[Exportação em PDF da Auditoria ML — Reaproveitamento da View de Impressão do Navegador]]) com 3 produtos reais de tributações diferentes (ST, Tributado, Redução) — o produto com tributação Redução (Bomba Costa Agrícola) mostrava a contraprova divergindo R$ 18,43 / 3,79 p.p. da Visão 1, mesmo assim exibindo "✓ Bate". Descartada a hipótese de grade desatualizada (Matheus tinha acabado de recalcular). Achado por leitura direta do código: `formula_precificacao.py` (fórmula real) usa `DimensoesEfetivas` (variação ML com fallback ERP); `calculo_margem.py` (contraprova, e também usado no Hub de Promoções) nunca conhecia esse conceito, lia sempre `produto.altura_ordenada_cm`/etc. direto.

## O problema

`calculo_margem.py` — `calcular_metro_cubico`, `selecionar_faixa_armazenagem` e `buscar_frete` — sempre leram a dimensão/peso do Produto ERP direto, nunca considerando que a variação do MLB pode ter dimensão declarada diferente (que é o que a fórmula real usa, via `resolver_dimensoes_efetivas`, o mesmo ponto único de decisão do bug de 11/09 acima). Sempre que `origem_dimensao = variacao_ml` pra um MLB, a contraprova calculava Coleta/Armazenagem (no fallback por dimensão) /Frete com o número errado.

Separadamente, o template (`estrutura_parcial_grade_detalhe.html`) mostrava "✓ Bate com a margem obtida na Visão 1" como texto fixo, sempre, sem nenhuma comparação — mesmo com R$ 18,43 de diferença real.

## Correção

- `mercado_livre/funcoes_auxiliares/calculo_margem.py`: `calcular_metro_cubico`, `selecionar_faixa_armazenagem`, `calcular_fixo_detalhado`, `calcular_fixo`, `buscar_frete` e `calcular_margem` passaram a aceitar `dimensoes_efetivas`/`variacao` (opcionais) — quando passado, `calcular_margem()` resolve via `resolver_dimensoes_efetivas(produto, variacao)` e usa isso em vez do Produto ERP direto. Sem esses parâmetros (todo chamador existente, incluindo o Hub de Promoções), nada muda.
- `precificacao/views/modal_comum.py`: `ContraprovaVisao1` ganhou os campos `bate` (bool) e `diferenca_valor`.
- `precificacao/views/grade_mercado_livre.py`: `_montar_contraprova_visao_1` passou a receber `variacao` e `margem_valor_oficial`, e calcula `bate`/`diferenca_valor` comparando os 2 (tolerância R$ 0,05, só pra absorver ruído de arredondamento entre as 2 cadeias de conta independentes).
- `estrutura_parcial_grade_detalhe.html` + `layout_grade_precificacao_ml.css`: "✓ Bate" e "✗ NÃO bate" agora refletem a comparação real, com estilo vermelho quando diverge.

Entregue como Localize/Substitua (5 arquivos), aplicado por Matheus.

## Validação com dado real

5 PDFs reais (3 produtos, tributações ST/Tributado/Redução, Clássico e Premium onde existia):

| Produto | Tributação · Tipo | Contraprova antes | Contraprova depois |
|---|---|---|---|
| Roçadeira K-520 | ST · Clássico | R$ 216,15 · 14,90% | R$ 217,65 · 15,00% (bate com a Visão 1) |
| Motosserra Mb620 | Tributado · Clássico | R$ 188,61 · 14,88% | R$ 190,41 · 15,02% (bate) |
| Motosserra Mb620 | Tributado · Premium | não testado antes | R$ 211,53 · 15,02% (bate) |
| Bomba Costa Agrícola | Redução · Clássico | R$ 54,89 · 11,27% | R$ 73,32 · 15,06% (bate) |
| Bomba Costa Agrícola | Redução · Premium | não testado antes | R$ 80,05 · 15,02% (bate) |

Todos os 5 bateram exatamente (ao centavo) com a Visão 1 depois da correção — confirma a causa com precisão total, não só reduziu o gap.

## Fora do escopo desta correção

`montar_linhas_precificacao.py` (Hub de Promoções) chama `calcular_margem()` em 5 lugares, já com `variacao` em escopo em todos eles, mas nenhum passa esse parâmetro novo — decisão deliberada de não mexer lá agora, já que mudaria margens reais usadas em decisão, e é escolha de negócio separada. Se o mesmo bug afeta o Hub de Promoções (bem provável, mesma função), fica em aberto pra decisão futura de Matheus.

## Relacionado

- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
- [[Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes]]
- [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]]
- [[Exportação em PDF da Auditoria ML — Reaproveitamento da View de Impressão do Navegador]]
