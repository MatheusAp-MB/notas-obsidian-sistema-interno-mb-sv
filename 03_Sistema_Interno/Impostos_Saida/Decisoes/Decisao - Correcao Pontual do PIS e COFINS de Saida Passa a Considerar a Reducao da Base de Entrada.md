---
tipo: decisao
dominio: python
status: concluida
criado: 21/09/2026
atualizado_em: 21/09/2026 09:58
relacionado: [Checkpoint - Badges Fiscais Explicitas de PIS COFINS Saida e ICMS Entrada na Tela de Produto e Grade ML, Estrutura da Planilha Busca Legal de Impostos de Saida, Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco)]
---

# Decisão - Correção Pontual do PIS e COFINS de Saída Passa a Considerar a Redução da Base de Entrada

**Resumo**: Encontrada uma inconsistência na planilha Busca Legal — ela traz todas as alíquotas de PIS/COFINS de saída sempre integrais, sem considerar a redução de base de cálculo que o produto sofreu na entrada. Fix pontual e temporário aplicado direto em `preenchimento_impostos_saida.py`: aplica o percentual de redução já calculado na entrada sobre a alíquota integral da planilha, no momento em que o EAN é ligado ao PIS/COFINS de saída.

> [!success] Decidido e aplicado — 21/09/2026
> Entregue como Localize/Substitua (5 blocos), aplicado por Matheus. Consequência mapeada e comunicada: exige reexecutar `preencher_impostos_saida` e recalcular as 6 grades de precificação, por empresa.

## Contexto

O superior de Matheus pediu uma mudança pontual: quando o produto sofre redução de base de cálculo na entrada (ICMS/PIS/COFINS), essa redução precisa ser considerada também no PIS/COFINS de saída — hoje a planilha Busca Legal ignora isso e traz sempre a alíquota cheia. A planilha será refeita, mas enquanto isso o sistema precisa compensar.

Legítimo, porém temporário — confirmado explicitamente por Matheus.

## A pergunta que precisou ser respondida antes

Qual é a base de cálculo usada hoje pro PIS/COFINS de saída? Resposta: não existe uma variável de "base de cálculo de saída" separada em lugar nenhum do código de precificação — todo marketplace aplica `preco_final × percentual ÷ 100` direto. A chave fiscal real de PIS/COFINS de saída é NCM+CST (não o EAN — o EAN só localiza o `Produto`).

## Decisão

- Aplicar a redução **na alíquota**, não criar um conceito novo de "base de saída" — provado matematicamente equivalente a reduzir a base (propriedade distributiva): `preco × aliq × (1 − reducao) = preco × (aliq × (1 − reducao))`
- Reduções de PIS/COFINS de entrada (`impostos_entrada.pis.reducao` / `.cofins.reducao`) aplicadas em `_calcular_campos_por_tabela`, no momento em que `pis_percentual`/`cofins_percentual` são escritos no `Produto`
- Fallback mantido: produto sem `impostos_entrada` sincronizado (`ObjectDoesNotExist`) → mantém o percentual **integral** da planilha, sem tentar reduzir nada
- Só PIS e COFINS — ICMS de saída não entra nessa correção pontual (não foi pedido)

## Implementação

Arquivo alterado: `impostos/funcoes_auxiliares/saida/preenchimento_impostos_saida.py`

- Constante nova `DUAS_CASAS_DECIMAIS = Decimal('0.01')`
- Função nova `_aplicar_reducao_pis_cofins(percentual, reducao)` — devolve o percentual sem alteração se `reducao is None`, senão aplica `percentual × (1 − reducao/100)` arredondado em 2 casas
- `carregar_produtos_existentes`: `select_related`/`.only()` estendido com `impostos_entrada__pis__reducao` e `impostos_entrada__cofins__reducao`
- `_calcular_campos_por_tabela`: assinatura ganhou `reducao_pis`/`reducao_cofins`, aplicados sobre `pis_percentual`/`cofins_percentual` antes de gravar
- `processar_todos_os_produtos`: lê `impostos_entrada.pis.reducao`/`.cofins.reducao` dentro do mesmo try/except que já resolvia `origem_mercadoria_cadastro`, sem consulta extra

Nenhuma migration — não criou campo de banco novo.

## Consequência — grades de precificação

Como todos os 6 marketplaces leem `produto.pis_percentual`/`cofins_percentual` direto na fórmula, e a grade é persistida (não recalculada ao vivo), a correção só passa a valer de verdade depois de:
1. Reexecutar `preencher_impostos_saida` (por empresa — MAGAZINE e SAMVALE são bancos separados)
2. Recalcular as 6 grades de precificação por marketplace (ou `calcular_todas_as_grades_precificacao`, por empresa)

## Relacionado

- [[Checkpoint - Badges Fiscais Explicitas de PIS COFINS Saida e ICMS Entrada na Tela de Produto e Grade ML]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco)]]
