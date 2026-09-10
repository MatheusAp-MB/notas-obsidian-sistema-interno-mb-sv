---
tipo: bug_conhecido
dominio: python
status: em_aberto
criado: 10/09/2026
atualizado_em: 10/09/2026 15:42
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]
---

# Bug Conhecido: Grade de Precificação ML Nunca Grava Nem Limpa Linha Quando o Cálculo Não Resolve

**Resumo**: quando `FormulaPrecificacao.calcular()` não consegue resolver um preço pra uma margem (`resolvida = False` — o mesmo estado "SEM CÁLCULO" mapeado durante o planejamento da nova tela de auditoria), a linha correspondente em `GradePrecificacaoML` **não é criada nem atualizada — é simplesmente pulada**. Isso significa que hoje não existe, no banco, nenhum jeito de diferenciar "esse produto/margem nunca foi calculado" de "foi calculado e não teve solução" — e, mais grave, se um produto que HOJE calcula preço normalmente passar a falhar amanhã, a linha antiga (de um cálculo válido, porém desatualizado) fica no banco pra sempre, sem nenhum aviso de que está obsoleta.

> [!warning] Em aberto — achado por leitura de código, não medido em produção ainda
> Achado em 10/09/2026 investigando o pipeline de cálculo (`calcular_grade_precificacao_ml.py`) pra mapear a nova tela de auditoria — nenhuma execução, só leitura. Não foi medido ainda quantas linhas no banco estão hoje nesse estado "obsoleto e silencioso" — ver "O que falta" abaixo.

## Contexto

Durante o mapeamento da [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao|nova tela de auditoria de precificação]] (planejada pra mostrar, campo a campo, de onde vem cada número — inclusive o estado "SEM CÁLCULO" que o ML usa quando `resolver_preco_por_margem` não acha solução), foi preciso confirmar como esse estado é hoje persistido no banco, pra saber se dava pra exibir de forma honesta. A resposta: não é persistido nenhum estado — a linha simplesmente não existe.

## O problema

`precificacao/funcoes_auxiliares/mercado_livre/calcular_grade_precificacao_ml.py`, função `_registrar_linhas` (linha 71-73):

```python
for margem_chave, formula in formulas.items():
    if formula is None:
        continue
```

`formula` chega `None` em 2 situações (`_calcular_ou_reaproveitar`, linhas 53-61): quando `formula.resolvida` é `False` (SEM CÁLCULO — `resolver_preco_por_margem` não achou faixa/margem viável) ou quando o cálculo levanta `AssertionError` (o mesmo erro de assert documentado em [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]], que nesses 2 casos aparece em Raia/Magalu, não no ML). Em qualquer um dos 2 casos, o `continue` pula a linha inteira — nada é gravado, nada é atualizado, nada é apagado.

## Consequência 1 — não dá pra diferenciar "nunca calculado" de "calculado e sem solução"

Um produto novo (nunca rodou `calcular_grade_precificacao_ml`) e um produto que rodou e não resolveu ficam exatamente iguais no banco: nenhuma linha em `GradePrecificacaoML` pra aquele (produto, variação, tipo, margem). A tela da Grade não tem como mostrar "SEM CÁLCULO — verifique X" pra um caso e "ainda não processado" pro outro, porque o dado que diferenciaria os 2 nunca chega a ser salvo.

## Consequência 2 — linha de um cálculo válido pode ficar obsoleta pra sempre, sem aviso

Se um produto calcula preço normalmente hoje (linha existe, com `preco`, `margem_percentual_obtida`, `detalhamento` completo) e algo no cadastro muda de um jeito que faz esse mesmo cálculo deixar de resolver amanhã (ex: um ajuste que empurra o FIXO pra negativo, como no caso do Raia/Magalu), rodar `calcular_grade_precificacao_ml` de novo **não limpa nem marca a linha antiga** — ela continua exatamente como estava, com um preço que não reflete mais o dado atual do produto. Quem olha a Grade não tem nenhum sinal de que aquele preço está desatualizado.

## O que falta

1. **Decidir a correção**: `GradePrecificacaoML` precisa de um jeito de representar "não resolvida" — provavelmente um campo de status (`resolvida = models.BooleanField(...)` ou equivalente) + um motivo, gravado (e sobrescrito) toda vez que `_registrar_linhas` roda, em vez de `continue`. Isso implica migration.
2. **Medir o alcance real**: ainda não foi levantado quantas linhas ativas no banco estão hoje "obsoletas e silenciosas" (calculadas no passado, que não resolveriam mais se recalculadas agora) — precisa de uma consulta separada pra isso.
3. Fora do escopo do redesign da tela de auditoria — essa correção mexe no pipeline de cálculo/persistência, não só na exibição. Tratar como frente própria.

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]
