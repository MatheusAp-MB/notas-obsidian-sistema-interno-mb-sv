---
tipo: conceito
dominio: fiscal
status: ativa
criado: 09/08/2026
atualizado_em: 09/08/2026 03:27
relacionado: [Plano em Etapas do Duble de Precificacao ML, Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Achados de Imposto Sempre Aguardam Validacao do Tributario]
---

# Crédito Fiscal Não Cumulativo (ICMS/PIS/COFINS)

## O que é

ICMS, PIS e COFINS não são cobrados só na venda final — são cobrados em cada etapa da cadeia (o fornecedor já paga/embute no preço quando vende pra Magazine Brasileiro). Pra evitar cobrar o mesmo imposto 2 vezes na mesma cadeia, a lei permite abater (creditar) o que já foi pago na entrada contra o que será devido na saída. A empresa só recolhe a diferença (débito de saída − crédito de entrada), nunca o valor cheio de novo.

## Como isso entra na precificação

Quando a empresa compra um produto, a nota fiscal de entrada mostra quanto de ICMS/PIS/COFINS o fornecedor já embutiu no preço pago. Isso é crédito — dinheiro que a empresa não vai precisar desembolsar de novo quando vender esse produto (abate contra o imposto devido na venda). Como é dinheiro que "volta", a fórmula de preço trata esse crédito como desconto no FIXO: reduz o custo real da operação, então a empresa não precisa cobrar do cliente como se esse valor fosse custo puro.

## Exemplo real validado (EAN 7908050700174, 09/08/2026)

Rodando o dublê (Etapas 1-9, `duble_precificacao_ml.py`) e comparando com a tela real do sistema pro mesmo produto/margem (Clássico, margem padrão 15%):

| | Sistema real (hoje) | Dublê (XML) |
|---|---|---|
| Crédito ICMS entrada | R$ 0,00 | R$ 31,71 |
| Crédito PIS | R$ 0,00 | R$ 8,82 |
| Crédito COFINS | R$ 0,00 | R$ 40,63 |
| Preço final | R$ 1.031,90 | R$ 913,90 |

O sistema real credita R$ 0,00 porque `icms_entrada`/`pis_cofins` estão zerados no banco pra esse produto (planilha nunca preenchida) — não porque o produto não tenha crédito de verdade. O XML mostra R$ 81,16/unidade de crédito real (ICMS + PIS + COFINS) que a empresa tem direito e não está usando. Sem esse crédito, o sistema embute um "custo tributário fantasma" no preço — cobra mais do que precisaria pra bater a mesma margem de 15%. Parte da diferença de R$ 118,00 entre os 2 preços vem desse crédito ignorado; o restante (~R$ 37) vem de uma divergência de custo ainda não explicada (banco R$ 619,70 vs XML R$ 566,27) — ver [[Plano em Etapas do Duble de Precificacao ML]].

## Observação do usuário

O usuário já tinha ouvido uma explicação parecida do próprio superior antes — essa nota é um reforço/registro formal do conceito, não uma descoberta nova de tributário.

**Aguardando validação do tributário/superior** — ver [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]: essa é a lógica geral do sistema não-cumulativo brasileiro, mas o quanto ela se aplica exatamente assim pra cada produto/regime (monofasia, regras específicas de ICMS ST, etc.) precisa de confirmação formal antes de virar preço real.

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
- [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]
