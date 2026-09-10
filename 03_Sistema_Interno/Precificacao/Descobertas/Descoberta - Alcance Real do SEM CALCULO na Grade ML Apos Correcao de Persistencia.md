---
tipo: descoberta
dominio: python
status: confirmada
criado: 10/09/2026
atualizado_em: 10/09/2026 16:44
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve, Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]
---

# Descoberta: Alcance Real do SEM CÁLCULO na Grade ML Após Correção de Persistência

**Resumo**: assim que [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve|a correção de persistência]] entrou em produção, deu pra medir pela primeira vez quantos produtos do Mercado Livre estão em SEM CÁLCULO — e o número é bem maior que os 2 SKUs que originaram a investigação do [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90|FIXO Negativo]]: **287 produtos no MAGAZINE e 158 no SAMVALE** têm pelo menos 1 combinação (variação × tipo de anúncio × margem) sem solução de preço. A maior parte já é explicada por custo ou dimensão zerados no cadastro — mas sobra um grupo (87 produtos, só no MAGAZINE) sem explicação óbvia.

> [!success] Confirmada — 10/09/2026, 16:44, medido direto no banco de produção
> Levantamento feito via `manage.py shell`, consulta só-leitura, rodada nos 2 bancos (MAGAZINE e SAMVALE) separadamente com `.using(alias)` explícito, depois que a correção de persistência entrou em produção — antes dela essa contagem era impossível (as linhas SEM CÁLCULO nem existiam no banco).

## Contexto

Depois de rodar `calcular_todas_as_grades_precificacao` nos 2 bancos com a correção de persistência aplicada, os logs de cada comando já mostravam um número de "Sem cálculo possível" bem mais alto que o esperado (3148 no MAGAZINE, 1544 no SAMVALE, só pro ML) — bem acima dos 2 SKUs isolados que motivaram a investigação original. Isso levantou a pergunta que os 2 bugs relacionados já tinham deixado em aberto: qual é o alcance real desse problema?

## Metodologia

Consulta feita direto no `GradePrecificacaoML` (agora que toda linha SEM CÁLCULO é gravada com `resolvida=False`), separada por banco:

```python
from django.db.models import Q
from precificacao.models import GradePrecificacaoML
from produtos.models import Produto

alias = 'magazine'  # (repetido depois com 'samvale')
sem_calculo = GradePrecificacaoML.objects.using(alias).filter(resolvida=False)
produtos_ids = sem_calculo.values_list('produto_id', flat=True).distinct()
produtos_sem_calculo = Produto.objects.using(alias).filter(id__in=produtos_ids)

custo_zerado = produtos_sem_calculo.filter(custo=0).filter(
    Q(custo_com_boni__isnull=True) | Q(custo_com_boni=0)
)
dimensao_zerada = produtos_sem_calculo.filter(
    Q(altura_ordenada_cm__isnull=True) | Q(altura_ordenada_cm=0)
    | Q(largura_ordenada_cm__isnull=True) | Q(largura_ordenada_cm=0)
    | Q(comprimento_ordenada_cm__isnull=True) | Q(comprimento_ordenada_cm=0)
)
```

`explicados` = união dos produtos em `custo_zerado` OU `dimensao_zerada` (produtos podem cair nos 2 grupos ao mesmo tempo). `não explicados` = produtos SEM CÁLCULO que não têm nem custo nem dimensão zerados.

**Nota sobre o número de linhas**: `sem_calculo.count()` (3628 no MAGAZINE, 1780 no SAMVALE) não bate com o "Sem cálculo possível" impresso no terminal pelo comando (3148 e 1544) — o do terminal sub-relata por um motivo já documentado, separado desta descoberta, em [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]] ("Achado colateral"). O número do banco é o confiável.

## Resposta

### SAMVALE — 100% explicado

| Métrica | Valor |
|---|---|
| Linhas SEM CÁLCULO (ML) | 1.780 |
| Produtos distintos por trás | 158 |
| ...com custo E custo_com_boni zerados | 10 |
| ...com alguma dimensão zerada | 158 |
| ...explicados por um dos dois | 158 |
| ...SEM explicação óbvia | **0** |

Todos os 158 produtos têm dimensão zerada (altura/largura/comprimento) — os 10 com custo também zerado são um subconjunto desse mesmo grupo. Nenhum produto sem explicação.

### MAGAZINE — maioria explicada, mas sobra um grupo

| Métrica | Valor |
|---|---|
| Linhas SEM CÁLCULO (ML) | 3.628 |
| Produtos distintos por trás | 287 |
| ...com custo E custo_com_boni zerados | 86 |
| ...com alguma dimensão zerada | 186 |
| ...explicados por um dos dois | 200 |
| ...SEM explicação óbvia | **87** |

72 produtos têm os 2 problemas ao mesmo tempo (86 + 186 − 200 = 72, pela sobreposição dos conjuntos). Os **87 produtos sem custo nem dimensão zerados** (30% do total do MAGAZINE) não têm explicação identificada ainda — hipóteses não verificadas: (a) meta de margem genuinamente inatingível pro custo real desses produtos (não seria bug, seria realidade comercial); (b) outro problema de dado ainda não mapeado, ex: faixa de frete (`FreteML`) não cobrindo o peso/preço desses itens específicos.

## O que falta

1. **Investigar os 87 produtos do MAGAZINE sem explicação óbvia** — não feito ainda. Levantar se é meta de margem inatingível de fato (checar `margem_alvo_percentual` vs. custo real) ou outro problema de faixa/config.
2. **Investigar por que 96 produtos ativos (86 MAGAZINE + 10 SAMVALE) têm custo zerado** — se é falha pontual de cadastro ou sintoma de uma falha maior de sincronização do `importar_produtos_erp.py` (ver item já aberto em [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]).
3. **Investigar por que 344 produtos (186 MAGAZINE + 158 SAMVALE) têm dimensão zerada** — mesma pergunta, aplicada à dimensão em vez do custo.
4. Não medido ainda: o mesmo levantamento pros outros 5 marketplaces (Raia/Magalu/Shopee/TikTok/Amazon também reportaram "sem cálculo" nos logs, em proporções maiores que o ML — ~26-30% do total, contra ~12-13% do ML) — cada um tem seu próprio model de Grade (`GradePrecificacaoRaia`, `GradePrecificacaoMagalu` etc.), não coberto por esta consulta.

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]]
- [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]
