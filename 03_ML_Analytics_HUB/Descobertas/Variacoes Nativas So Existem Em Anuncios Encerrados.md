---
tipo: descoberta
dominio: 
status: ativa
criado: 10/07/2026
relacionado: [Sku Repetido Em Variacoes Nao E Bug]
---

# Variações Nativas do ML Só Existem em Anúncios Encerrados

Nesta conta, o recurso de variações nativas do Mercado Livre (`variations[]`
dentro de um único MLB) existe quase exclusivamente em anúncios com
`status = closed` — é resíduo de um modelo de anúncio abandonado, não o
padrão atual da operação.

## Evidência real

Confirmado estatisticamente na base completa: dos ~490 registros com
`tem_variacoes = True`, **100% são `status = closed`** — nenhum ativo ou
pausado usa esse modelo.

## Explicação de negócio

A operação parou de usar variações nativas do ML depois que passou a ser
possível precificar por variação individual — cada combinação (cor,
tamanho, etc.) passou a ser cadastrada como um MLB próprio, com SKU
próprio, em vez de ser uma variação dentro de um MLB "pai" único.

## Confirmação adicional (padrão de SKU)

Todos os SKUs da operação seguem o padrão `F` + EAN (13 dígitos) + `.001`
— o sufixo `.001` é fixo em toda a base, não indica variação. Isso reforça
que o modelo atual é "1 produto físico = 1 MLB com SKU próprio", não
variações dentro de um MLB.

## Impacto prático

- Para fins de modelagem/classificação, cada MLB ativo pode ser tratado
  como uma entidade única e simples — sem precisar de lógica especial
  para "variações dentro do mesmo MLB".
- Os poucos MLBs com variação restantes (todos `closed`) são resíduo
  histórico, não representativos do fluxo de trabalho atual.

## Relacionado

- [[Sku Repetido Em Variacoes Nao E Bug]]