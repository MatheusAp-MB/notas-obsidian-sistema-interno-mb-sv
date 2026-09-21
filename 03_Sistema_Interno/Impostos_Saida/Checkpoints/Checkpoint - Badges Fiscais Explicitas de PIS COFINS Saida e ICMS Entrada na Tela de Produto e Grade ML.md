---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 21/09/2026
atualizado_em: 21/09/2026 10:24
relacionado: [Decisao - Correcao Pontual do PIS e COFINS de Saida Passa a Considerar a Reducao da Base de Entrada, Descoberta - Campo Cst Saida Criado e Tela de Detalhes do Produto Passa a Exibir os 5 Campos Fiscais de Saida, Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes]
---

# Checkpoint - Badges Fiscais Explícitas de PIS/COFINS Saída e ICMS Entrada na Tela de Produto e Grade ML

**Resumo**: Na sequência da correção pontual de PIS/COFINS de saída (ver [[Decisao - Correcao Pontual do PIS e COFINS de Saida Passa a Considerar a Reducao da Base de Entrada]]), Matheus pediu badges explícitas mostrando quais produtos tiveram redução aplicada vs. cálculo integral — planejado em conversa (sem gerar código até o plano fechar), depois autorizado e entregue como diff completo.

> [!warning] EM ANDAMENTO — testado por Matheus (correto), validação formal do superior ainda pendente
> Entregue em 21/09/2026 como Localize/Substitua (1 arquivo novo + 5 alterados), aplicado e testado por Matheus — confirmou correto nos próprios testes (21/09/2026 10:24). Falta só a validação formal do superior, que será feita assim que possível.

## As 3 badges

- `PIS SAÍDA REDUZIDO` / `PIS SAÍDA INTEGRAL`
- `COFINS SAÍDA REDUZIDO` / `COFINS SAÍDA INTEGRAL`
- `ICMS ENTRADA INTEGRAL` / `ICMS ENTRADA REDUZIDO` / `ICMS ENTRADA ST`

## Regras de classificação (confirmadas por Matheus antes de gerar código)

- PIS/COFINS: `reducao > 0` na entrada (`impostos_entrada.pis.reducao`/`.cofins.reducao`) → REDUZIDO, senão INTEGRAL
- ICMS é sobre a **entrada**, não a saída (não existe conceito de redução de base de ICMS de saída no sistema) — prioridade fixa: ST sempre vence (mesma checagem de `_produto_tem_icms_st`, reimplementada localmente por convenção do projeto — helper privado nunca é importado entre módulos), depois Redução, por último Integral
- Fallback (produto sem `impostos_entrada` sincronizado): as 3 badges caem em INTEGRAL — mesma regra já usada no cálculo de saída em si

## Escopo

- Tela de Produto → aba Impostos: badges sempre visíveis no topo da aba, mesmo sem `impostos_entrada`
- Grade de Precificação ML: badges no card de nível PRODUTO (não no mini-card de MLB), junto dos chips de marca/categoria/curva já existentes — local apontado por Matheus via print de tela
- Só Mercado Livre por enquanto — os outros 5 marketplaces ficam de fora até serem pedidos

## Implementação

- **Novo**: `impostos/funcoes_auxiliares/entrada/badges_fiscais_produto.py` — `montar_badges_fiscais_produto(impostos_entrada)`, opera sobre o objeto RAW (não o já formatado pra exibição)
- `produtos/views.py` (`view_painel_produto`) — reaproveita o `impostos_entrada` já resolvido, sem consulta nova
- `produtos/templates/produtos/parciais/estrutura_parcial_painel_produto.html` — badges inseridas antes do `{% if impostos_entrada %}`
- `precificacao/views/grade_mercado_livre.py` — campo novo `badges_fiscais` em `ItemGradeProduto`, calculado em `.montar()`; `select_related` isolado (`impostos_entrada` + `pis`/`cofins`/`icms`/`icms_st`) aplicado só dentro de `view_grade_precificacao_ml`, em cima do `pagina.object_list` já paginado — sem tocar `_filtrar_paginar_produtos_grade` (compartilhada com os outros 5 marketplaces)
- `precificacao/templates/precificacao/estrutura_grade_precificacao_ml.html` — badges dentro do `grade-card-badges` já existente
- `core/static/base_compartilhada/css/layout_badges.css` — 3 cores novas (`badge-fiscal-integral` índigo, `badge-fiscal-reduzido` teal, `badge-fiscal-st` bronze/dourado), conferidas contra as ~36 cores já em uso no arquivo pra não colidir
- `produtos/static/produtos/css/layout_produtos.css` — container `.modal-badges-fiscais` (só espaçamento; a pílula em si é a classe global `badge-tabela`)

Nenhuma migration — nada persistido, tudo calculado ao vivo a partir do que já está sincronizado.

## Pendências

- Validação formal do superior de Matheus — ainda não feita, será assim que possível

## Relacionado

- [[Decisao - Correcao Pontual do PIS e COFINS de Saida Passa a Considerar a Reducao da Base de Entrada]]
- [[Descoberta - Campo Cst Saida Criado e Tela de Detalhes do Produto Passa a Exibir os 5 Campos Fiscais de Saida]]
- [[Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes]]
