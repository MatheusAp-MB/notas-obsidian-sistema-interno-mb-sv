---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 11/09/2026
atualizado_em: 11/09/2026 10:02
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90, Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve, Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia, Duvida - Margens Absurdas Aparecem Filtradas no Log de Recomendacao de Precificacao da Magazine]
---

# Bug Conhecido: Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensão Zero, Gerando Sempre o Frete Mais Barato do ML

**Resumo**: `resolver_dimensoes_efetivas()` — a função que decide qual dimensão/peso usar pra calcular frete, coleta e armazenagem de 1 MLB no Mercado Livre — devolvia, no fallback do Produto ERP (quando a variação ML não tem dimensão própria declarada), um objeto de dimensões com altura/largura/comprimento/peso TODOS ZERO sempre que o produto não tem embalagem cadastrada no ERP, em vez de sinalizar "sem dado". Como a tabela de frete do ML sempre tem uma faixa a partir de peso zero, isso "resolvia" silenciosamente usando a faixa mais barata — sem aparecer em SEM CÁLCULO nem em nenhum erro. Corrigido: a função agora devolve `None` nesse caso, e quem chama grava `resolvida=False` com motivo claro.

> [!success] CORRIGIDO em 11/09/2026 — confirmado com dado real antes/depois, commitado e sincronizado
> **O quê**: `resolver_dimensoes_efetivas()` fabricava peso/dimensão zero pra produto sem embalagem cadastrada no ERP, fazendo `calcular_grade_precificacao_ml` "resolver" o preço com o frete mais barato da tabela do ML (R$5,65–R$20,95), mesmo sem saber o peso/dimensão real.
> **Onde foi corrigido**: `mercado_livre/funcoes_auxiliares/dimensoes_efetivas.py` (função `resolver_dimensoes_efetivas`) + `precificacao/funcoes_auxiliares/mercado_livre/calcular_grade_precificacao_ml.py` (tratamento do `None`). Commits `23df085`, `bcdbc52`, `269a7a0`, branch `dev`, sincronizados com `origin/dev`.
> Validado com dado real, antes/depois: as 3084 linhas MAGAZINE / 4804 linhas SAMVALE que vinham desse fallback quebrado zeraram nos 2 bancos — ver "Validação com Dado Real" abaixo.

## Contexto

`resolver_dimensoes_efetivas(produto, variacao=None)` é o ponto único de decisão de qual dimensão/peso usar no cálculo de frete/coleta/armazenagem de cada combinação (produto × variação ML × tipo de anúncio) — [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design|documentado como Camada 2]] da tela de auditoria. Regra de negócio: sempre prefere o dado declarado pelo vendedor no próprio anúncio do Mercado Livre (`variacao.altura_ordenada_cm`/etc. + `peso_declarado_kg`, as 4 completas); só cai no fallback do Produto ERP (`produto.altura_ordenada_cm`/etc.) quando a variação não tem essas 4 informações. Peso efetivo, nos 2 branches, é sempre o maior entre físico e cúbico — regra oficial do Mercado Livre.

Esse bug foi achado durante a mesma frente de [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao|Validação Exaustiva de Precificação]] que já tinha corrigido o [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90|FIXO Negativo]] e o [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve|SEM CÁLCULO nunca grava]] — achado por leitura direta do código de `dimensoes_efetivas.py` na sessão seguinte (11/09), não por sintoma visível: o bug era completamente silencioso, não aparecia em nenhum log de erro.

## O problema

No branch de fallback do Produto ERP, a função original fazia:

```python
altura = produto.altura_ordenada_cm or Decimal('0')
largura = produto.largura_ordenada_cm or Decimal('0')
comprimento = produto.comprimento_ordenada_cm or Decimal('0')
peso_fisico = produto.peso_produto_apos_embalado or Decimal('0')
peso_cubico = produto.peso_cubado or Decimal('0')

return DimensoesEfetivas(
    altura=altura, largura=largura, comprimento=comprimento,
    peso=max(peso_fisico, peso_cubico), origem=OrigemDimensao.PRODUTO_ERP, ...
)
```

Quando o produto não tem embalagem cadastrada no ERP (`altura_ordenada_cm`/`largura_ordenada_cm`/`comprimento_ordenada_cm` = `None`), o `or Decimal('0')` transformava a ausência de dado num objeto `DimensoesEfetivas` **válido**, com tudo zerado — não "sem dado", um resultado de verdade, pronto pra ir pro cálculo de frete.

`filtrar_faixas_frete()` (`formula_precificacao.py`) filtra a faixa de frete aplicável só por peso mínimo (`peso_min <= peso`) — e a tabela `FreteML` sempre tem uma faixa a partir de `peso_min=0.000` (a mais leve/barata). Com peso zero chegando na função, essa faixa mais barata sempre "resolvia" com sucesso. O resultado: preço calculado e gravado normalmente (`resolvida=True`), usando um frete de até 300g sem nenhuma ideia do peso/dimensão real do produto — silencioso, porque não é "SEM CÁLCULO" (o cálculo "funcionou") nem erro de assert (nada quebrou).

Confirmado em produção antes da correção: **3084 linhas no MAGAZINE / 4804 linhas no SAMVALE** (369 / 533 produtos distintos) vinham exatamente desse fallback quebrado — sempre com `frete_usado` entre R$5,65 e R$20,95 (a faixa mais barata da tabela).

Não existe fallback legítimo alternativo pra usar em vez disso: `Produto.altura_produto_sem_embalar` (dimensão do produto sem caixa) não serve pra frete, que depende da embalagem real enviada.

## A correção

`mercado_livre/funcoes_auxiliares/dimensoes_efetivas.py`, `resolver_dimensoes_efetivas()`:

```python
altura = produto.altura_ordenada_cm
largura = produto.largura_ordenada_cm
comprimento = produto.comprimento_ordenada_cm
peso_fisico = produto.peso_produto_apos_embalado or Decimal('0')
peso_cubico = produto.peso_cubado or Decimal('0')
peso = max(peso_fisico, peso_cubico)

if altura is None or largura is None or comprimento is None or peso == 0:
    return None

return DimensoesEfetivas(
    altura=altura, largura=largura, comprimento=comprimento, peso=peso,
    origem=OrigemDimensao.PRODUTO_ERP, peso_fisico=peso_fisico, peso_cubico=peso_cubico,
)
```

Agora `None` sai sempre que faltar dimensão OU o peso resultante for zero (esse 2º caso já cobria, mesmo antes desta correção, o caso de dimensão presente mas os 2 pesos ausentes — um produto físico embalado nunca pesa 0kg de verdade).

`precificacao/funcoes_auxiliares/mercado_livre/calcular_grade_precificacao_ml.py` precisou tratar esse `None` explicitamente nos 2 pontos que chamam `resolver_dimensoes_efetivas` (fallback do produto e cada variação real) — antes, esses pontos assumiam sempre receber um `DimensoesEfetivas` válido:

```python
dim_fallback = resolver_dimensoes_efetivas(produto, variacao=None)
if dim_fallback is None:
    formulas_fallback, motivos_fallback = _formulas_sem_dimensao(config)
    sem_dimensao += len(formulas_fallback)
    _registrar_linhas(
        produto, None, tipo_grade, formulas_fallback, motivos_fallback,
        existentes, para_criar, para_atualizar,
    )
else:
    ...  # segue pro cálculo normal, como antes
```

`_formulas_sem_dimensao(config)` (nova) grava `resolvida=False` nas 4 margens, com o motivo fixo `'Produto sem dimensão/peso de embalagem cadastrados no ERP (e sem variação ML com dimensão declarada)'` — sem instanciar `FormulaPrecificacao` nenhuma, sem tentar calcular nada com peso fabricado. Ganhou também um contador novo (`sem_dimensao`), separado do `sem_calculo` já existente (meta inatingível), pra diferenciar as 2 causas no log de execução:

```
Sem cálculo possível (meta inatingível): {sem_calculo}
Sem cálculo possível (sem dimensão/peso de embalagem no ERP): {sem_dimensao}
```

## Validação com dado real

Isolando exatamente o fallback quebrado (`resolvida=True` vindo de dimensão zerada do Produto ERP), antes e depois da correção:

| | Antes | Depois |
|---|---|---|
| MAGAZINE — linhas com frete fabricado (peso=0) | 3084 | **0** |
| MAGAZINE — produtos afetados | 369 | **0** |
| SAMVALE — linhas com frete fabricado (peso=0) | 4804 | **0** |
| SAMVALE — produtos afetados | 533 | **0** |

Zerou nos 2 bancos — confirma que nenhuma linha `resolvida=True` com `origem_dimensao=produto_erp` sobrou entre os produtos de dimensão nula.

Numa visão mais ampla (sem filtrar por origem), o destino real dessas linhas depois da correção:

- **MAGAZINE**: 565 produtos com dimensão nula → 6076 linhas na grade → 1200 continuam `resolvida=True` (eram 4284 antes) / 4876 `resolvida=False` (eram 1792 antes).
- **SAMVALE**: 731 produtos com dimensão nula → 13588 linhas na grade → 6684 continuam `resolvida=True` (eram 11488 antes) / 6904 `resolvida=False` (eram 2100 antes).

As 1200/6684 linhas que continuam `resolvida=True` **não são bug** — são casos legítimos: produto sem embalagem cadastrada no ERP, mas com aquele MLB específico tendo dimensão própria declarada no anúncio (`origem_dimensao=variacao_ml`) — exatamente a prioridade que a regra de negócio pede (usar o dado real do MLB quando existe, só recusar calcular quando não existe dado nenhum dos 2 lados).

O contador novo confirmou a visibilidade que não existia antes: **4672 produtos no MAGAZINE / 6424 no SAMVALE** hoje sem cálculo possível especificamente por falta de dimensão/peso de embalagem no ERP (número bruto do log, sujeito ao mesmo sub-relato em reaproveitamento de cache já documentado em [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]] pro `sem_calculo`).

23 SKUs do MAGAZINE com erro de cadastro de verdade no ERP (não é bug de código) agora caem corretamente em `resolvida=False` com motivo claro, em vez de gerar preço calculado com frete fabricado.

## Achado à parte, não investigado

Durante a mesma validação, o log `[RECOMENDAÇÃO PRECIFICAÇÃO]` do MAGAZINE mostrou margens absurdas sendo descartadas (ex: MLB3974779415 em -1680008,20%) — já existe uma trava que filtra esses casos, então nenhum preço errado vaza, mas é sinal de outra coisa estranha em MLBs específicos. Registrado como pergunta em aberto, não investigado ainda: [[Duvida - Margens Absurdas Aparecem Filtradas no Log de Recomendacao de Precificacao da Magazine]].

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]
- [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]]
- [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]
- [[Duvida - Margens Absurdas Aparecem Filtradas no Log de Recomendacao de Precificacao da Magazine]]
