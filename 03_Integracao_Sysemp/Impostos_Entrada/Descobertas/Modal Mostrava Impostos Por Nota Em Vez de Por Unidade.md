---
tipo: descoberta
dominio: 
status: corrigida
criado: 10/08/2026
atualizado_em: 10/08/2026 15:30
relacionado: [Modal de Produto — Aba Impostos (Entrada e Saida), Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Plano em Etapas do Duble de Precificacao ML]
---

# Modal Mostrava Impostos Por Nota Em Vez de Por Unidade

## O achado

Comparando o modal de produto (aba Impostos, recém-criada) com o dublê de precificação (`duble_precificacao_ml.py`) pro mesmo produto real (EAN 7908050719121), os valores de PIS/COFINS não bateram: modal mostrava Valor PIS R$ 19,78 e Valor COFINS R$ 94,93; o dublê mostrava R$ 2,47 e R$ 11,87 (por unidade). Alíquota, Redução e CST eram idênticos nos dois — só o valor final divergia.

## Causa raiz — confirmada, não suposta

Verificação matemática: R$ 19,78 ÷ 8 = R$ 2,4725 ≈ R$ 2,47. R$ 94,93 ÷ 8 = R$ 11,86625 ≈ R$ 11,87. O "8" é `quantidade_nota` (`Qtde` do XML) — a nota real tinha 8 unidades. Confirmado: `Base Cálculo`/`Valor` que a API Sysemp devolve pra cada imposto são POR NOTA (pra quantidade inteira comprada), não por unidade — o modal exibia esse dado bruto direto, sem converter.

O dado pra fazer essa conversão (`Qtde` da nota, `Custo Unitário`) **já vinha parseado** em `dados_xml_nf.py` (`dados.identificacao_produto.qtde`, `dados.custos.unitario`) desde a modelagem original — só nunca tinha sido persistido em `ImpostosECustosXMLEntradaProduto`, que só guardava `custo_total` (nota).

## Correção

2 campos novos no guarda-chuva: `quantidade_nota` (`DecimalField`, 3 casas) e `custo_unitario` (`DecimalField`, 2 casas), preenchidos em `sincronizar_a_partir_de` a partir do que já vinha parseado. `obter_detalhes_para_exibicao()` agora divide `base_calculo`/`valor` de cada imposto por `quantidade_nota` antes de devolver — decisão do usuário: exibir só por unidade (não nota + unidade lado a lado), pra bater 1:1 com o dublê.

Produtos já sincronizados antes desta correção ficam com os 2 campos novos `None` até serem reprocessados — resolvido criando o management command `manage.py reprocessar_impostos_entrada_de_json`, que relê o json já salvo em disco (`XML_Manifesto_NF_notas_mais_recentes_por_produto.json`) e persiste de novo, sem chamar a API. Ver detalhe completo em [[Modal de Produto — Aba Impostos (Entrada e Saida)]].

## Relacionado

- [[Modal de Produto — Aba Impostos (Entrada e Saida)]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Plano em Etapas do Duble de Precificacao ML]]
