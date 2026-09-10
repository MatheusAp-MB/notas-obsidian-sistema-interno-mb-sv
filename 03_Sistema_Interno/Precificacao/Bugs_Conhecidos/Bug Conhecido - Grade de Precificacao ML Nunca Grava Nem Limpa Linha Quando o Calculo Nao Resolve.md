---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 10/09/2026
atualizado_em: 10/09/2026 16:44
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90, Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]
---

# Bug Conhecido: Grade de Precificação ML Nunca Grava Nem Limpa Linha Quando o Cálculo Não Resolve

**Resumo**: quando `FormulaPrecificacao.calcular()` não consegue resolver um preço pra uma margem (`resolvida = False` — o mesmo estado "SEM CÁLCULO" mapeado durante o planejamento da nova tela de auditoria), a linha correspondente em `GradePrecificacaoML` **não era criada nem atualizada — era simplesmente pulada**. Isso significava que não existia, no banco, nenhum jeito de diferenciar "esse produto/margem nunca foi calculado" de "foi calculado e não teve solução" — e, mais grave, se um produto que HOJE calcula preço normalmente passasse a falhar amanhã, a linha antiga (de um cálculo válido, porém desatualizado) ficava no banco pra sempre, sem nenhum aviso de que estava obsoleta.

> [!success] CORRIGIDO — 10/09/2026, 16:44 — migration aplicada, pipeline reescrito, testado em produção nos 2 bancos
> Correção aplicada: campo de status explícito no model + `_registrar_linhas` reescrito pra sempre gravar (nunca mais pular). Migration `0014_gradeprecificacaoml_motivo_nao_resolvida_and_more` rodada em MAGAZINE e SAMVALE. Rodado `calcular_todas_as_grades_precificacao` completo nos 2 bancos — ver "Correção Aplicada" abaixo. Efeito colateral direto: agora dá pra medir o alcance real do SEM CÁLCULO pela primeira vez — números completos em [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]].

## Contexto

Durante o mapeamento da [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao|nova tela de auditoria de precificação]] (planejada pra mostrar, campo a campo, de onde vem cada número — inclusive o estado "SEM CÁLCULO" que o ML usa quando `resolver_preco_por_margem` não acha solução), foi preciso confirmar como esse estado era persistido no banco, pra saber se dava pra exibir de forma honesta. A resposta original: não era persistido nenhum estado — a linha simplesmente não existia.

## O problema (antes da correção)

`precificacao/funcoes_auxiliares/mercado_livre/calcular_grade_precificacao_ml.py`, função `_registrar_linhas` (linha 71-73):

```python
for margem_chave, formula in formulas.items():
    if formula is None:
        continue
```

`formula` chegava `None` em 2 situações (`_calcular_ou_reaproveitar`): quando `formula.resolvida` era `False` (SEM CÁLCULO — `resolver_preco_por_margem` não achava faixa/margem viável) ou quando o cálculo levantava `AssertionError` (o mesmo erro de assert documentado em [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]], que nesses 2 casos aparecia em Raia/Magalu, não no ML). Em qualquer um dos 2 casos, o `continue` pulava a linha inteira — nada era gravado, nada era atualizado, nada era apagado.

### Consequência 1 — não dava pra diferenciar "nunca calculado" de "calculado e sem solução"

Um produto novo (nunca rodou `calcular_grade_precificacao_ml`) e um produto que rodou e não resolveu ficavam exatamente iguais no banco: nenhuma linha em `GradePrecificacaoML` pra aquele (produto, variação, tipo, margem).

### Consequência 2 — linha de um cálculo válido podia ficar obsoleta pra sempre, sem aviso

Se um produto calculava preço normalmente e algo no cadastro mudasse de um jeito que fizesse esse mesmo cálculo deixar de resolver depois, rodar `calcular_grade_precificacao_ml` de novo não limpava nem marcava a linha antiga — ela continuava exatamente como estava, com um preço que não refletia mais o dado atual do produto.

## Correção Aplicada (10/09/2026, 16:44)

**Model** (`precificacao/models/mercado_livre/grade_precificacao_ml.py`): 2 campos novos —
- `resolvida = models.BooleanField(default=True)`
- `motivo_nao_resolvida = models.CharField(max_length=255, null=True, blank=True)`

Migration `precificacao/migrations/0014_gradeprecificacaoml_motivo_nao_resolvida_and_more.py` gerada e aplicada nos 2 bancos (`--database=magazine` e `--database=samvale`), sem intercorrência.

**Pipeline** (`calcular_grade_precificacao_ml.py`): `_calcular_ou_reaproveitar` agora também monta um dict `motivos` (texto de por que cada margem não resolveu — meta inatingível vs. a mensagem exata do `AssertionError`, quando existe). `_registrar_linhas` não pula mais nada — toda combinação processada grava uma linha, sempre: `resolvida=True` com os campos de preço preenchidos, ou `resolvida=False` com `motivo_nao_resolvida` preenchido e os campos de preço (`preco`, `margem_percentual_obtida`, `frete_usado`, `origem_dimensao`, `detalhamento`) explicitamente nulos — nunca mistura preço de uma resolução anterior com um motivo de falha atual.

**Testado em produção**: rodado `calcular_todas_as_grades_precificacao --empresa=MAGAZINE` e `--empresa=SAMVALE` (6 marketplaces cada, completo) — **0 erros de assert** nos 2 bancos (confirma também a correção de [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]). Linhas criadas + atualizadas em todos os 12 comandos, sem nenhuma pulada.

### Achado colateral: contador de "Sem cálculo possível" do próprio comando sub-relata

Ao medir o alcance real via banco (ver [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]), o número direto do banco (`GradePrecificacaoML.objects.filter(resolvida=False).count()`) não bateu com o "Sem cálculo possível" impresso no terminal pelo próprio `calcular_grade_precificacao_ml` (3628 no banco vs. 3148 no log, MAGAZINE; 1780 vs. 1544, SAMVALE). Causa: o contador `sem_calculo` só é incrementado dentro de `_calcular_ou_reaproveitar` na hora que o cálculo é feito pela primeira vez — quando uma variação **reaproveita** um cálculo já em cache (mesma assinatura de dimensão), a função devolve `sem_calculo: 0` incondicionalmente, mesmo que o resultado reaproveitado tenha margens sem solução. Esse comportamento já existia **antes** desta correção — não foi introduzido agora, só ficou visível ao comparar com o banco (que agora é a fonte confiável, já que toda linha é gravada). Não corrigido ainda — é cosmético (não afeta nenhum dado gravado, só o número impresso no log) — considerar ajustar `_calcular_ou_reaproveitar` pra recontabilizar `sem_calculo` também no caminho de cache, se o log precisar ser confiável no futuro.

## O que falta

1. ~~Decidir a correção~~ — feito (campo de status + gravação sempre).
2. ~~Medir o alcance real~~ — feito, ver [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]].
3. Ajustar o contador `sem_calculo` do log do terminal pra também contar reaproveitamentos de cache (achado colateral acima — baixa prioridade, cosmético).
4. Fora do escopo desta correção: usar `resolvida`/`motivo_nao_resolvida` na exibição do modal de auditoria (hoje o modal só faz `if not linha or not linha.detalhamento` — trata linha SEM CÁLCULO igual a linha inexistente). Melhorar isso é trabalho de exibição, não de persistência — tratar como frente própria se for útil pro usuário final.

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]
- [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]
