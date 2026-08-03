---
tipo: duvida
dominio: python
status: ativa
criado: 11/07/2026
relacionado: []
---

# Falta Endpoint de Vendas por Data para Conversão em Janela Casada

Necessidade futura: encontrar e investigar um endpoint de Pedidos/Vendas
(Orders) da API do Mercado Livre que traga vendas **com data**, para
calcular taxa de conversão em janelas de tempo casadas (visitas dos
últimos N dias ÷ vendas dos últimos N dias).

## Contexto que gerou a necessidade

Testado o cálculo `sold_quantity / visitas_total` (endpoint de visitas,
teto de 2 anos) contra dado real de 72 MLBs. Resultado: valores de
conversão **acima de 100%** em vários casos (até 306%), sempre em
anúncios com mais de ~1.200 dias de idade — confirmando que
`sold_quantity` é cumulativo **desde a criação do anúncio** (pode ser
2020, 2021...), enquanto o endpoint de visitas só enxerga os últimos 2
anos. Para anúncios antigos, a métrica fica matematicamente distorcida.

## Correção proposta (conceito correto, mas ainda não implementável)

Em vez de comparar histórico total de vendas com janela limitada de
visitas, comparar **janelas casadas** de tempo curto: últimos 3, 5, 7,
15, 30 ou 90 dias de visitas contra vendas do **mesmo período**. Isso
elimina o viés do histórico desproporcional.

## O que já está resolvido, e o que falta

- **Lado das visitas: resolvido.** O endpoint
  `/items/{MLB}/visits/time_window?last=N&unit=day` já aceita qualquer
  janela `N` (testamos só `last=30`, mas o parâmetro é genérico).
- **Lado das vendas: bloqueado.** `sold_quantity` (já disponível no
  `detalhes_mlbs.json`) é um número único cumulativo, sem granularidade
  de data — não existe "vendas dos últimos 7 dias" nesse campo.

## Próximo passo (quando houver acesso à API)

Investigar se existe um endpoint de Pedidos/Orders do Mercado Livre que
retorne vendas com data de cada venda (não só o total acumulado), para
permitir agregação por qualquer janela de tempo desejada. Este endpoint
nunca foi explorado nesta investigação — todo o trabalho até agora
cobriu Performance, Price to Win, Experiência de Compra, Visitas e
Promoções, mas não Vendas/Pedidos.

## Relacionado

- [[Regras Gerais]]