---
tipo: decisao
dominio: python
status: ativa
criado: 12/09/2026
atualizado_em: 12/09/2026 13:02
relacionado: [Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao, Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins, Descoberta - Comparacao Sistema Interno x Planilha We Stack no Calculo de Margem (Calcular Margem)]
---

# Decisão: Base de Cálculo do PIS/COFINS de Saída Passa a Ser `Preço − (Preço × ICMS_MÉDIA Ponderada)`

**Resumo**: PIS/COFINS de saída deixa de ser calculado sobre o `Preço` cheio (como está hoje, idêntico nos 6 marketplaces e em `calculo_margem.py`) — passa a ser `(Preço − Preço×ICMS_MÉDIA) × percentual`, igual à fórmula da planilha We Stack corrigida. A `ICMS_MÉDIA` usada nessa conta é a versão **ponderada** (SP×50% + média das outras 26 UFs×50%, o redesenho que a própria We Stack já fez), não a média simples antiga.

> [!success] Ativa — 12/09/2026
> Matheus confirmou: nesse ponto específico, a planilha We Stack estava certa. Resolve a 1ª pergunta da [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]].

## Contexto

3 fontes calculavam a base do PIS/COFINS de saída de 3 formas diferentes: planilha do superior (`Preço − Custo`), planilha We Stack (`Preço − Preço×ICMS_MÉDIA`), e o sistema real, idêntico nos 6 marketplaces e em `calculo_margem.py` (`Preço` cheio, sem nenhum desconto). Ficou registrado como dúvida em aberto porque mudava o valor calculado sem ter uma explicação óbvia no código pra justificar a diferença — ver [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]].

## Decisão tomada

A base correta é a da planilha We Stack:

```
Base = Preço − (Preço × ICMS_MÉDIA)
PIS = Base × PIS%
COFINS = Base × COFINS%
```

A `ICMS_MÉDIA` usada é a **ponderada** (SP×50% + média das outras 26 UFs×50%) — a mesma que já entra no cálculo de ICMS (Saída-Entrada), não uma 3ª estatística separada.

## O que isso muda no código (correção pendente, ainda não aplicada)

Hoje, `pis_saida_valor = preco_final * pis_saida_percentual / 100` e o equivalente pra COFINS estão idênticos nos 6 marketplaces (`precificacao/funcoes_auxiliares/<marketplace>/formula_precificacao*.py`) e em `mercado_livre/funcoes_auxiliares/calculo_margem.py` — nenhum desconta ICMS da base. Essa fórmula está incorreta pela decisão acima e precisa de correção nos 7 pontos (6 marketplaces + cálculo de margem), pra usar `(preco_final − preco_final×icms_medio_ponderado) × percentual`. Nenhuma alteração de código foi feita — fica pendente até Matheus pedir o diff.

## Pendência de implementação (ainda em aberto)

O campo `Produto.icms_saida_media` hoje guarda a média simples das 26 UFs (sem SP). Pra essa fórmula funcionar com a ponderada, falta decidir: o próprio campo passa a guardar o valor ponderado (mudando o que `preencher_impostos_saida` grava, e mudando também o resultado de `calcular_margem()` que já lê esse campo pra ICMS de saída), ou é criado um campo novo separado pra não perder a média simples em nenhum outro uso? Essa decisão de implementação ainda não foi tomada.

## Relacionado

- [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]]
- [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]
- [[Descoberta - Comparacao Sistema Interno x Planilha We Stack no Calculo de Margem (Calcular Margem)]]
