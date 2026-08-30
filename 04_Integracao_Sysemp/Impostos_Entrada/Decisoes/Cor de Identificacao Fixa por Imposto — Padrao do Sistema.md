---
tipo: decisao
dominio: fiscal
status: ativa
criado: 15/08/2026
atualizado_em: 16/08/2026 00:45
relacionado: [Modal de Produto — Aba Impostos (Entrada e Saida), Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]
---

# Cor de Identificação Fixa por Imposto — Padrão do Sistema

## Contexto

Durante o redesenho da aba Impostos do modal de produto, o usuário pediu que cada imposto (ICMS, ICMS ST, ICMS Retido, IPI, PIS, COFINS) tivesse uma cor de identificação fixa — e que essa cor não fosse "solta"/arbitrária, e sim um padrão a se repetir em qualquer lugar do sistema que precise identificar visualmente um desses impostos: *"isso será padrão para todos os lugares do sistema."*

## Decisão

Reaproveitadas as cores já usadas em `scripts_exploracao_ERP/relatorio_impostos_entrada_xlsx.py` (`GRUPOS_DE_COLUNAS`) — já eram, na prática, um padrão de cor implícito no relatório em Excel apresentado ao superior. Em vez de inventar cores novas pro modal, promovido a padrão explícito, documentado e reaproveitável:

| Imposto | Cor (hex) |
|---|---|
| ICMS | `#7D5B0A` |
| ICMS ST | `#A24E0A` |
| ICMS Retido | `#8B2E12` |
| IPI | `#205E7A` |
| PIS | `#7B241C` |
| COFINS | `#8E2452` |

## Implementação no modal (15/08/2026)

Cada card de imposto, na aba Impostos, usa `class="card-header modal-card-cabecalho modal-card-cabecalho-{{ linha.nome|slugify }}"` — o filtro `slugify` do Django converte o nome do imposto (ex. "ICMS ST") na mesma slug usada na classe CSS (`icms-st`), evitando um if/elif manual por imposto. As 6 classes (`.modal-card-cabecalho-icms`, `-icms-st`, `-icms-retido`, `-ipi`, `-pis`, `-cofins`) ficam em `produtos/static/produtos/css/layout_produtos.css`, com os hex acima.

## Extensão (16/08/2026) — versão pastel pro corpo do card

O padrão original só cobria o cabeçalho (cor forte). Nesta rodada, o corpo de cada card (linhas `modal-td-dado`/`modal-td-valor`) ganhou uma versão pastel do mesmo tom, mais o texto numa variante escura da mesma cor — pedido do usuário pra dar "continuação" visual entre cabeçalho e corpo, em vez do azul genérico compartilhado por todos os cards. Valores fixados (uso em `produtos/static/produtos/css/layout_produtos.css`):

| Imposto | Corpo (dado) | Corpo (valor) | Borda | Texto | Ícone "calculado" |
|---|---|---|---|---|---|
| ICMS | `rgb(237,232,221)` | `rgb(246,244,238)` | `rgb(210,198,169)` | `#3C3120` | `#6B5A2E` |
| ICMS ST | `rgb(242,230,221)` | `rgb(248,243,238)` | `rgb(222,193,169)` | `#4A2E14` | `#7A4D2E` |
| ICMS Retido | `rgb(239,226,222)` | `rgb(247,240,238)` | `rgb(214,182,172)` | `#4A2016` | `#7A4438` |
| IPI | `rgb(224,232,236)` | `rgb(239,244,246)` | `rgb(177,199,208)` | `#1B3A47` | `#4D6E7A` |
| PIS | `rgb(237,224,223)` | `rgb(246,240,239)` | `rgb(209,178,176)` | `#4A1D18` | `#7A4D48` |
| COFINS | `rgb(239,224,231)` | `rgb(247,240,243)` | `rgb(215,178,194)` | `#4A1830` | `#7A4560` |

Aplicado via `.card:has(> .card-header.modal-card-cabecalho-icms) .modal-td-dado {...}` — o combinador `>` (filho direto) é obrigatório: sem ele, o card externo "Impostos de entrada" (que contém os 6 cards por dentro) também bate com `:has()` e todas as cores vazam pra um só. Detalhe completo do redesenho em [[Modal de Produto — Aba Impostos (Entrada e Saida)]].

## Regra pra qualquer uso futuro

Qualquer tela, relatório ou componente novo que precise identificar visualmente um destes 6 impostos deve reaproveitar exatamente estes hex — nunca inventar cor nova pro mesmo imposto em outro lugar do sistema.

## Relacionado

- [[Modal de Produto — Aba Impostos (Entrada e Saida)]]
- [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]]
