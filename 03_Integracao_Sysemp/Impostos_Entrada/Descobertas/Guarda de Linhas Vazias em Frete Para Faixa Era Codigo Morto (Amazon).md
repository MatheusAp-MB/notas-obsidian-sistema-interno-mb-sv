---
tipo: descoberta
dominio: python
status: corrigida
criado: 16/08/2026
atualizado_em: 16/08/2026 21:19
relacionado: [Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08), Checagem de Data Inicial no Futuro Era Codigo Morto, Disciplina de Testes Automatizados]
---

# Guarda de Linhas Vazias em `_frete_para_faixa` Era Código Morto (Amazon)

## Contexto

Escrevendo o teste Nível 3 de `FormulaPrecificacaoAmazon` (`precificacao/funcoes_auxiliares/amazon/formula_precificacao_amazon.py`), a cobertura ficou em 99% em vez dos 100% batidos pelas outras 5 fórmulas — 1 linha faltando dentro de `_frete_para_faixa`.

## O código morto

```python
if linha_peso:
    return linha_peso.valor, linha_peso.peso_min, linha_peso.peso_max

if not linhas_da_faixa:
    return None, None, None

linha_maxima = max(linhas_da_faixa, key=lambda f: f.peso_max)
```

A guarda `if not linhas_da_faixa: return None, None, None` é matematicamente inalcançável. `linhas_da_faixa` nunca chega vazia nesse ponto porque o par `(preco_min, preco_max)` usado pra filtrá-la sempre veio de `_faixas_preco_candidatas()` — e essa função só gera um par de preço se já existe pelo menos 1 linha de `fretes_amazon` com exatamente esse par. Ou seja, todo par de preço testado já tem, por construção, no mínimo 1 linha correspondente — a guarda defende contra uma entrada que o próprio fluxo nunca produz.

## Correção

Guarda removida, substituída por um comentário explicando por que é seguro (mesmo padrão já usado em [[Checagem de Data Inicial no Futuro Era Codigo Morto]]):

```python
# * [EXPLICAÇÃO] → linhas_da_faixa nunca vem vazia aqui — o par
#                  (preco_min, preco_max) sempre veio de
#                  _faixas_preco_candidatas(), que só existe porque
#                  pelo menos 1 linha de fretes_amazon tem esse
#                  par exato. Guarda morta removida (16/08/2026) —
#                  achada via cobertura de teste 100%.
linha_maxima = max(linhas_da_faixa, key=lambda f: f.peso_max)
```

Decisão tomada por escrever um teste artificial que forçasse essa linha (testaria um detalhe de implementação sem valor real), seguindo a regra padrão da sessão: código morto encontrado é sempre excluído, não comentado nem adiado.

## Validação

Amazon foi de 99% pra 100% cover / 0 Miss na rodada seguinte de teste, sem nenhuma regressão nos demais arquivos (605 passed no total).

## Relacionado

- [[Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08)]]
- [[Checagem de Data Inicial no Futuro Era Codigo Morto]]
- [[Disciplina de Testes Automatizados]]
