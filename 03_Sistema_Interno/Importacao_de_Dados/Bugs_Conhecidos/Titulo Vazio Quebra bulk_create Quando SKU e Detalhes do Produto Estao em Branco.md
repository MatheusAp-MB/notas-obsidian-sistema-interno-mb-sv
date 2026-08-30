---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 17/08/2026
atualizado_em: 17/08/2026 10:33
relacionado: [Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica, Redesenho do Popular Banco - Fontes de Dados e Escopo, Integridade e Fonte Unica de Dado]
---

# Título Vazio Quebra bulk_create Quando SKU e Detalhes do Produto Estão em Branco

## Contexto

Achado em 17/08/2026, recriando o banco `sistema_interno_sv_temp` do zero com um relatório de Ativos da Samvale mais atual/completo do que o usado na 1ª importação bem-sucedida (ver [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]], 506 produtos, sem esse problema). `python manage.py popular_banco` quebrou na 1ª etapa (`PRODUTOS ERP`), antes de qualquer outra etapa do pipeline rodar:

```
MySQLdb.IntegrityError: (1048, "Column 'titulo' cannot be null")
```

## Causa

Em `LinhaProdutoERP.extrair_campos_basicos()` (`core/management/commands/popular_banco_suporte/importar_produtos_erp.py`), o título tinha só 1 fallback: coluna "Detalhes do Produto" → SKU (`Codigo Auxiliar`). `Produto.titulo` é `CharField` sem `null=True` — NOT NULL no banco. Numa linha do relatório da Samvale, as duas colunas ("Detalhes do Produto" E "Codigo Auxiliar") estavam em branco ao mesmo tempo — o fallback esgotou, `titulo` virou `None`, e o `bulk_create` estourou pra aquele lote inteiro (até 100 produtos, `BATCH_SIZE_PADRAO`).

`esta_valida()` só exige EAN — SKU ausente é tolerado de propósito (documentado no próprio código: "SKU ausente não desqualifica a linha"). Título nunca teve essa mesma tolerância formalizada — o bug é o fallback ficar incompleto, não a validação em si.

Não tinha aparecido com a Magazine porque nenhuma linha de lá tinha os 2 campos vazios ao mesmo tempo — coincidência de dado, não garantia de código.

## Correção

Cadeia de fallback estendida pra incluir o EAN — que a essa altura já é garantido não-vazio, porque `esta_valida()` descarta qualquer linha sem EAN antes de chegar no banco:

```python
self.titulo = self.conversor.para_texto(
    self.linha_bruta.get('Detalhes do Produto'), self.sku or self.ean
)
```

Título agora nunca fica `None` pra nenhuma linha que passe a validação — não desprograma nada, só completa a mesma cadeia que o SKU já usava.

## Nota operacional

Como não tem `transaction.atomic()` envolvendo a etapa (`popular_banco.py::_executar`), e nenhuma outra etapa do pipeline chegou a rodar (o crash foi na 1ª etapa das ~15), os lotes de 100 que vieram ANTES do que quebrou provavelmente já tinham sido commitados no banco temp. Decisão: como é banco `_temp` mesmo, recriar do zero (drop + migrate + `popular_banco`) em vez de confiar em estado parcial de uma rodada que quebrou no meio.

## Relacionado

- [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Integridade e Fonte Unica de Dado]]
