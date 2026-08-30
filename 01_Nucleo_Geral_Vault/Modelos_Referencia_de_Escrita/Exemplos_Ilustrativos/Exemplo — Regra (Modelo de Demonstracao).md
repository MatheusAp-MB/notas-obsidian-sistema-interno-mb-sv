---
tipo: regra
dominio: python
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Definicao e Norma (Conceito, Regra), Exemplo — Conceito (Modelo de Demonstracao), Exemplo — Decisao (Modelo de Demonstracao), Exemplo — Prompt (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo regra — todo cache precisa de estratégia de invalidação explícita e documentada, nunca silenciosa, com exemplo ANTES/DEPOIS.
---

# Todo Cache Precisa de Estratégia de Invalidação Explícita, Nunca Silenciosa (Regra)

**Resumo**: sempre que um sistema guarda um resultado computado pra evitar recalcular (um cache), precisa existir uma regra clara e documentada de quando esse valor guardado deixa de valer — nunca um cache que "some sozinho" sem ninguém saber exatamente quando ou por quê.

> [!warning] Isto é uma nota-modelo, não uma regra formalmente adotada no sistema real
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)]] — usada como base fictícia pra decisão em [[Exemplo — Decisao (Modelo de Demonstracao)]] e pro prompt de auditoria em [[Exemplo — Prompt (Modelo de Demonstracao)]].

## Contexto

Um **cache** guarda o resultado de um cálculo caro (que demora ou consome recurso) pra não precisar refazer esse cálculo toda vez que alguém pede o mesmo resultado de novo. Isso funciona bem enquanto o dado de origem não muda — mas, no momento em que algo que influencia o cálculo muda (por exemplo, um custo usado numa fórmula de preço), o valor guardado no cache fica desatualizado, e continuar servindo ele é servir informação errada. Sem uma regra clara de quando isso deve ser corrigido, cada desenvolvedor decide informalmente ("acho que dá pra deixar assim", "vou limpar na mão se perceber que está errado") — e o sistema acumula pontos onde ninguém tem certeza se o dado mostrado é o cache antigo ou o valor recalculado.

## O que diz

Toda vez que o sistema guarda um resultado em cache, a decisão de **quando esse cache deixa de valer** (a invalidação) precisa ser explícita e documentada na mesma nota ou comentário que descreve o cache — nunca implícita, nunca dependente de alguém lembrar de rodar um comando manual "de vez em quando". Duas formas de invalidação explícita são aceitas: um prazo fixo e documentado (ex: "expira sozinho depois de 24 horas"), ou um gatilho direto e testável (ex: "invalida automaticamente sempre que o campo X é alterado"). O que nunca é aceito é a ausência das duas — um cache que só é limpo se alguém perceber manualmente que o dado está errado e decidir agir.

## Por que é assim e não de outro jeito

A alternativa mais comum — e mais perigosa — é não pensar na invalidação até o problema aparecer na prática: implementar o cache, ver que funciona no dia 1, e só voltar a pensar em invalidação quando um usuário reclamar que um valor está desatualizado. Essa alternativa foi descartada porque, quando isso acontece, já se passou tempo suficiente pra ninguém lembrar com clareza de todos os lugares onde aquele cache é lido — o que era um problema pequeno e previsível na hora de implementar vira uma investigação cara meses depois. Definir a estratégia de invalidação junto da implementação do cache custa pouco a mais na hora, e evita esse custo muito maior depois.

## Exemplo

**ANTES (proibido a partir de agora)**:

```python
def obter_grade_precificacao(produto_id):
    if produto_id in _cache_grade:
        return _cache_grade[produto_id]
    resultado = calcular_grade_precificacao(produto_id)
    _cache_grade[produto_id] = resultado
    return resultado
```

Este código guarda o resultado em `_cache_grade`, mas não existe nenhum código, em lugar nenhum do sistema, que decida quando remover uma entrada desse dicionário — o cache só seria limpo se alguém reiniciasse o processo inteiro, o que não é uma estratégia, é um acidente.

**DEPOIS (exigido)**:

```python
def obter_grade_precificacao(produto_id):
    entrada = _cache_grade.get(produto_id)
    agora = datetime.now(timezone.utc)
    if entrada and (agora - entrada.calculado_em) < timedelta(hours=24):
        return entrada.resultado
    resultado = calcular_grade_precificacao(produto_id)
    _cache_grade[produto_id] = EntradaCache(resultado=resultado, calculado_em=agora)
    return resultado

def invalidar_cache_grade(produto_id):
    """Chamado sempre que o custo do produto é alterado — ver Exemplo — Decisao (Modelo de Demonstracao)."""
    _cache_grade.pop(produto_id, None)
```

Aqui a invalidação é dupla e explícita: um prazo documentado (24 horas, no próprio código) e um gatilho direto (`invalidar_cache_grade`, chamado sempre que o custo do produto muda) — as 2 formas aceitas por esta regra, juntas.

## Relacionado

- [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)]]
- [[Exemplo — Conceito (Modelo de Demonstracao)]]
- [[Exemplo — Decisao (Modelo de Demonstracao)]]
- [[Exemplo — Prompt (Modelo de Demonstracao)]]
