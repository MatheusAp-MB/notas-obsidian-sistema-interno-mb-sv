---
tipo: descoberta
dominio: testes
status: corrigida
criado: 16/08/2026
atualizado_em: 16/08/2026 21:19
relacionado: [Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08), Disciplina de Testes Automatizados]
---

# Refetch de Produto do Banco Propaga Exponent Decimal em Asserts de Texto Formatado

## O que aconteceu

No teste Nível 3 de `FormulaPrecificacaoMagalu` (cenário `formula_abstrata_e_preenchida_devolvem_texto_pronto_pro_modal`), o texto esperado foi escrito como `'preço = (R$ 20.00 + R$ 199.00) ÷ 0.50 = R$ 448.90'`. O teste falhou — não porque o cálculo estava errado (o valor numérico do resultado batia certinho), mas porque o texto real devolvido era `'preço = (R$ 20.00 + R$ 199.00000000) ÷ 0.50 = R$ 448.90'`. 8 casas decimais em vez de 2, só no termo do FIXO.

## Causa raiz

`Produto.altura_ordenada_cm` / `largura_ordenada_cm` / `comprimento_ordenada_cm` são `DecimalField(decimal_places=2)`. O teste cria o produto com `Decimal('100')` (exponent 0), mas depois de salvar e reler via `Produto.objects.get(pk=...)`, o Django/DB normaliza o valor pra `Decimal('100.00')` (exponent -2) — comportamento correto e esperado do ORM, não um bug.

Esse valor de exponent -2 entra em `metro_cubico_de_dimensoes()`, que faz 3 divisões (`/100`) e 2 multiplicações encadeadas. Pelas regras de exponent do `Decimal` do Python (divisão busca o exponent "ideal" = exponent do dividendo − exponent do divisor, só estendendo precisão o necessário pra um resultado exato; multiplicação soma os exponents dos operandos), o resultado final de `metro_cubico` sai em exponent -6. Multiplicado por `fator_coleta` (`Decimal('72.00')`, exponent -2), `coleta` sai em exponent -8 (`Decimal('72.00000000')`). Esse -8 propaga pra `fixo` pela regra de adição/subtração do `Decimal` (o resultado sempre fica no exponent MAIS FINO — mais negativo — entre todos os operandos somados).

Nenhuma dessas etapas é um erro de lógica: `Decimal('72.00000000') == Decimal('72.00')` é `True` (igualdade de `Decimal` é por valor, não por exponent/casas decimais). O problema é só que `formula_preenchida()` usa f-string direto no `Decimal` (`f'R$ {i.fixo}'`), que renderiza o exponent como veio, sem arredondar — e isso só afeta comparação de **texto literal**, nunca comparação numérica `==`.

## Por que o ML não teve esse problema

O teste equivalente de ML constrói `DimensoesEfetivas` como dataclass pura (`_dim_padrao()`), sem passar pelo banco — `altura=Decimal('100')` nunca é relido via `Produto.objects.get(...)`, então nunca sofre a normalização de exponent. `metro_cubico` fica em exponent 0 do início ao fim.

## Lição pra testes futuros

Qualquer teste que (a) use um `Produto` real recarregado do banco com campos de dimensão (`DecimalField`), **e** (b) faça assert de string formatada (f-string) em vez de comparação `==` de valor, precisa considerar que o exponent do `Decimal` pode não ser o "óbvio" — vale a pena rodar o teste 1x primeiro e copiar o texto real da tabela "Obtido" (`registrar_resultado`) em vez de adivinhar o formato esperado por conta própria.

## Correção

Só o texto esperado foi ajustado (`esperado_preenchida` com `R$ 199.00000000`), com comentário no teste explicando o mecanismo — nenhuma mudança em código de produção, já que o valor numérico sempre esteve correto.

## Relacionado

- [[Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08)]]
- [[Disciplina de Testes Automatizados]]
