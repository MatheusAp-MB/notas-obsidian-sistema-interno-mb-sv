---
tipo: decisao
dominio: 
status: ativa
criado: 08/08/2026
atualizado_em: 08/08/2026 01:55
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Integridade e Fonte Unica de Dado, Modelagem de Objeto e Encapsulamento]
---

# Cálculo de Redução de PIS e COFINS via Base de Cálculo e Custo Total

## Contexto

Diferente de ICMS e ICMS ST — que a API da Sysemp devolve com um campo `Redução ICMS`/`Redução ICMS ST` já pronto — PIS e COFINS não têm campo de redução direto na API. Ela só entrega `Base Calculo PIS`/`Base Calculo COFINS` (já reduzida) e o `Custo Total` da nota (valor cheio, antes de qualquer redução).

## Fórmula

Pra saber o % de redução aplicado, precisa reconstruir de trás pra frente:

```
quanto_a_base_representa_do_total = base_calculo / custo_total
reducao_percentual = (1 - quanto_a_base_representa_do_total) * 100
```

Exemplo real validado (produto 7908050719121, nota mais recente): `Base Calculo PIS`/`Base Calculo COFINS` = R$ 988,84, `Custo Total` = R$ 1.905,28 → 988,84 / 1.905,28 = 51,9% → redução = 48,1%. Confere com PIS (988,84 × 2% = R$ 19,78) e COFINS (988,84 × 9,6% = R$ 94,93) batendo com os valores que a própria API devolve.

## Decisão

Implementado como campo `reducao` (float, 2 casas decimais) nas dataclasses `Pis` e `Cofins` (`dados_xml_nf.py`), calculado 1 única vez dentro do `@classmethod a_partir_do_registro()` — que passou a receber `custo_total` como parâmetro extra, porque esse dado mora na dataclass `Custos`, não em `Pis`/`Cofins`. A função `_calcular_percentual_de_reducao()` (nível de módulo, reaproveitada pelas 2 classes) concentra a fórmula num único lugar, em vez de duplicar a conta.

Ver exemplo de design em [[Integridade e Fonte Unica de Dado]] e a estrutura geral do `DadosXmlNF` em [[Modelagem de Objeto e Encapsulamento]].

## Relacionado

- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Integridade e Fonte Unica de Dado]]
- [[Modelagem de Objeto e Encapsulamento]]
