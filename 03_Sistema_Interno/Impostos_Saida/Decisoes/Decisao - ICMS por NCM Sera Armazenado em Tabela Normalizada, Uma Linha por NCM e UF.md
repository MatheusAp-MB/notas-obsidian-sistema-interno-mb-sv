---
tipo: decisao
dominio: python
status: ativa
criado: 12/09/2026
atualizado_em: 12/09/2026 13:43
relacionado: [Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado, Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda, Estrutura da Planilha Busca Legal de Impostos de Saida]
---

# Decisão: ICMS por NCM Será Armazenado em Tabela Normalizada — 1 Linha por NCM + UF

**Resumo**: a nova tela de ICMS por NCM (27 UFs + Média Ponderada, ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]] pra a origem do formato de 27 colunas) vai guardar o dado no banco de forma normalizada — 1 linha por combinação de NCM + UF — em vez de 1 linha por NCM com 28 colunas literais. O modelo espelha o padrão já usado em `FreteML`. A Média Ponderada nunca é uma linha salva: é sempre calculada em tempo real a partir das 27 alíquotas.

> [!success] Ativa — 12/09/2026
> Matheus escolheu a Opção A (normalizada) entre as 2 apresentadas, seguindo o mesmo padrão do `FreteML` já existente no sistema.

## Contexto

Depois de decidir remover os cálculos externos vindos de planilhas (planilhas passam a entregar só dado bruto puro — quem calcula e distribui o resultado é o sistema), Matheus definiu que era preciso um lugar dedicado pra mostrar o ICMS dos 27 estados, e que esse dado se agrupa por NCM: o NCM X sempre tem os mesmos 27 valores de ICMS, independente do produto — um produto com o NCM X herda os 27 valores vinculados àquele NCM.

A tela desenhada pra isso segue o mesmo modelo de consulta cruzada já usado na tela de Tabela de Frete do ML: cada linha é um NCM, cada uma das 28 colunas é uma UF (27) + a Média Ponderada, e o usuário cruza por NCM e UF do mesmo jeito que cruza por Preço e Peso no frete. Foi construído um mockup HTML v1 validando esse layout (calculadora de cruzamento + matriz + destaque de célula), com dados de exemplo.

Ficou em aberto como esse dado seria armazenado: normalizado (1 linha por NCM+UF, espelhando `FreteML`) ou largo (1 linha por NCM, 28 colunas literais).

## Decisão tomada

Opção A — normalizada, 1 linha por NCM + UF:

```python
class IcmsNcmUf(models.Model):
    ncm = models.CharField(max_length=10)
    uf = models.CharField(max_length=2)
    aliquota = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        unique_together = ('ncm', 'uf')
        ordering = ['ncm', 'uf']
```

A tela pivota essas linhas pra exibir a matriz (27 UFs + Média Ponderada em coluna), do mesmo jeito que `view_tabela_frete_ml` pivota `FreteML` hoje. A Média Ponderada (SP × 50% + média das outras 26 UFs × 50%, mesma fórmula de [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]) não é gravada como linha — é sempre calculada a partir das 27 alíquotas no momento da consulta, pra nunca ficar um valor desatualizado se uma alíquota for corrigida depois.

## Por que essa opção

- Espelha exatamente o padrão já comprovado do `FreteML` (model + view que pivota + calculadora + import command via `bulk_create`/`bulk_update`).
- Update parcial de 1 UF é trivial (`bulk_update` numa fatia de linhas), sem tocar as outras 26.
- Consulta direta por `(ncm, uf)` via ORM, sem precisar de 27 campos fixos no model.
- Uma linha "incompleta" é só a ausência de algumas combinações NCM+UF — nunca um registro com colunas vazias que pareça dado faltando por erro.

## O que ainda falta decidir

- De onde vem o dado bruto de origem (fonte/arquivo a importar com os 27 valores por NCM) — ainda não planejado.
- Como o NCM se vincula ao Produto na prática (o sistema já tem `ncm_xml`/`ncm_cadastro` em `ImpostosECustosXMLEntradaProduto`) — mencionado, não finalizado.
- A tela em si (mockup v1 construído, feedback do Matheus pendente) — esta decisão cobre só o modelo de armazenamento, não o template/view final.

## Relacionado

- [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]
- [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
