---
tipo: decisao
dominio: python
status: concluida
criado: 14/09/2026
atualizado_em: 14/09/2026 09:02
relacionado: [Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador, Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET, Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design, Checkpoint - Correção de Unidade e Redesenho de UX na Auditoria ML, Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes]
---

# Exportação em PDF da Auditoria ML — Reaproveitamento da View de Impressão do Navegador

**Resumo**: O modal de auditoria de precificação (Mercado Livre) ganhou um botão "Exportar PDF" por modal individual, usando exatamente o mesmo padrão já validado no Sistema de Relatório de Devoluções: nenhuma biblioteca de geração de PDF, uma view Django dedicada que renderiza uma página HTML standalone com CSS de impressão, convertida em PDF pelo próprio navegador (Ctrl+P / "Salvar como PDF"). Todos os cards/seções saem forçados a estado expandido no HTML, sem depender de JS.

> [!success] Decidido e implementado — 14/09/2026
> Entregue como Localize/Substitua (view + urls + template novo), aplicado por Matheus, sincronizado e validado com PDF real gerado pelo sistema.

## Contexto

O chefe de Matheus, viajando e sem acesso ao sistema, precisa revisar a auditoria de precificação de vários produtos remotamente. A tela de auditoria (modal HTMX "como chegamos nesse preço") só existia como painel interativo — passos colapsáveis, provas escondidas atrás de clique, abas Visão 1/Visão 2 (ver [[Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes]]) — nada disso é exportável ou navegável fora do sistema.

## O problema

Gerar um PDF fiel ao conteúdo completo do modal (todos os passos, as 2 visões, as contraprovas), com tudo já expandido — sem esconder nada atrás de interação — pra um PDF por produto, gerado sob demanda a partir de dentro do próprio modal.

## O que levou à resposta

Antes de qualquer código: Matheus apontou que o Sistema de Relatório de Devoluções já resolveu exatamente esse problema, com a mesma decisão já tomada e documentada lá (ver [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]] e [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]): nenhuma biblioteca de PDF (xhtml2pdf sem suporte a CSS moderno; WeasyPrint/Playwright com dependência nativa, risco de empacotamento) — o próprio navegador faz a conversão.

Fluxo seguido nesta rodada:
1. Escopo confirmado antes de gerar qualquer coisa: só Mercado Livre (não os outros 5 marketplaces), 1 botão dentro de cada modal individual (não é exportação em lote)
2. Mockup gerado primeiro (a pedido explícito) e testado por Matheus na prática (imprimiu de verdade, subiu o PDF resultante)
3. 1 bug real achado no teste: título de seção "① Visão 1" ficava órfão no fim de uma página, com o conteúdo começando só na página seguinte
4. Corrigido direto no código real, sem 2º mockup (a pedido explícito de Matheus) — `break-after: avoid; page-break-after: avoid;` nos títulos de seção

## Decisão

- **Sem biblioteca de PDF** — mesma razão já documentada no Sistema de Devolução, reaproveitada aqui sem reabrir a discussão
- **View dedicada** `view_imprimir_grade_detalhe(request, produto_id, tipo, margem)` (`precificacao/views/grade_mercado_livre.py`) — reaproveita `DetalheFormulaExibida.montar()`, a mesma função que já monta os dados pro modal interativo (zero lógica de negócio duplicada)
- **Template standalone** `grade_detalhe_impressao.html` — HTML próprio (não herda o template base), linka o CSS já existente (`layout_grade_precificacao_ml.css`) via `{% static %}` em vez de duplicar estilos
- **Tudo expandido via markup, não via JS**: `data-estado="expandido"` e `audit-prova--aberta` forçados diretamente no HTML, reaproveitando as regras CSS de estado que já existiam pro modal interativo — nenhuma linha de CSS nova precisou ser escrita pra isso
- **URL própria**: `grade-mercado-livre/detalhe/<produto_id>/<tipo>/<margem>/imprimir/`, aberta via `<a target="_blank">` a partir do modal (mesmo padrão de abertura já usado no Sistema de Devolução)
- **Escopo travado em Mercado Livre** — os outros 5 marketplaces (Magalu, Raia, Shopee, TikTok, Amazon) ficam de fora até serem pedidos

## Bugs encontrados depois da sincronização

Sem poder rodar o projeto, a verificação foi por leitura estática do repositório real após `sincronize e analise`:
- **Botão "Exportar PDF" duplicado** no template `estrutura_parcial_grade_detalhe.html` (Localize/Substitua aplicado 2x) — corrigido removendo a cópia repetida
- **`AttributeError: module 'precificacao.views' has no attribute 'view_imprimir_grade_detalhe'`** — erro real reportado por Matheus no `runserver`. Causa: `precificacao/views/__init__.py` reexporta manualmente cada função por submódulo (não é `import *`), e a view nova não tinha sido adicionada nessa tupla — falha minha ao montar o patch original, sem ter olhado esse arquivo antes. Corrigido adicionando `view_imprimir_grade_detalhe` ao `from .grade_mercado_livre import (...)` do `__init__.py`

## Validação final

PDF real gerado pelo sistema, produto 1127 (Pulverizador Costal Elétrico e Manual Brudden SS20-B 20L, Clássico, Margem Padrão) — analisado e confirmado: paginação correta (sem heading órfão), cabeçalho de tabela repetido entre páginas, todos os cards/passos/contraprovas já expandidos, dados consistentes com as outras telas que usam a mesma fonte (`DetalheFormulaExibida`).

## Relacionado

- [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]
- [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]
- [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]]
- [[Checkpoint - Correção de Unidade e Redesenho de UX na Auditoria ML]]
- [[Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes]]
