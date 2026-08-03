---
tipo: regra
dominio: 
status: ativa
criado: 11/07/2026
relacionado: [Classificacao De Promocoes Com Rebate Vs Sem Rebate]
---

# Aumento de Preço Remove Item de Campanhas MARKETPLACE_CAMPAIGN e VOLUME

Se o preço de um item **aumentar** enquanto ele participa de uma campanha
do tipo `MARKETPLACE_CAMPAIGN` (cofinanciada) ou `VOLUME` (desconto por
quantidade), ele **sai automaticamente** da promoção — e não pode ser
adicionado de volta a essa mesma instância.

## Texto exato da documentação (idêntico nas duas campanhas)

> "Os itens que participam das ofertas de co-participação (campanha
> marketplace) não têm preço fixo, portanto, se um item estiver
> participando e seu preço aumentar, ele sairá automaticamente da oferta
> e você não poderá adicioná-lo novamente."

## Pontos importantes

- É especificamente sobre **aumento** de preço — reduzir não tem essa
  consequência, pelo texto disponível.
- É de mão única e aparentemente permanente: "não poderá adicioná-lo
  novamente" para aquela instância da campanha.
- Não há aviso prévio via API — a saída da promoção acontece
  silenciosamente como efeito colateral de qualquer alteração de preço
  (manual ou automática, incluindo sincronização de preço vinda do ERP).

## ⚠️ Escopo limitado — não generalizar sem confirmação

Este aviso apareceu **apenas** nas seções de documentação de
`MARKETPLACE_CAMPAIGN` e `VOLUME`. **Não apareceu na seção de `SMART` ou
`PRICE_MATCHING`** — que são os tipos de campanha realmente usados na
prática hoje (rebate confirmado com dado real). Não há confirmação,
nem documental nem por teste real, de que essa mesma regra se aplique a
`SMART`/`PRICE_MATCHING`. Não assumir por analogia até haver evidência.

## Relevância para automação futura

Se algum dia for implementada automação de escrita (entrar/sair de
promoções via API, decisão descrita em conversa mas nunca testada na
prática), qualquer rotina de sincronização de preço precisaria checar
antes se o item está participando de uma campanha `MARKETPLACE_CAMPAIGN`
ou `VOLUME`, para não derrubar a participação sem perceber ao subir o
preço.

## Relacionado

- [[Classificacao De Promocoes Com Rebate Vs Sem Rebate]]