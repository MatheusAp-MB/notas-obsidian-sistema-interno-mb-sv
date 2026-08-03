---
tipo: descoberta
dominio: python
status: ativa
criado: 14/07/2026
relacionado: [Roster De Campanhas Smart Tem Duplicatas Reais Durante Paginacao, Roster De Campanha Usa Searchafter Dentro De Paging]
---

# Roster de Campanha Não É Confiável Para Uso Programático

O endpoint de roster de campanha (`GET /seller-promotions/promotions/{ID}/items`)
apresenta dois problemas opostos e simultâneos — traz item duplicado E
também deixa de trazer item que participa de verdade — o que o torna
inadequado como fonte de dado para qualquer uso automatizado que exija
consistência (auditoria, otimização de chamadas, contagem confiável).

## Descoberta 1 — o roster mostra o PRÓPRIO catálogo, não concorrentes

Verificado que os itens do roster de uma campanha `SMART` são 100% MLBs
da própria conta (794 de 794 testados) — nenhum concorrente de fora.
Campanhas automáticas parecem ser o Mercado Livre selecionando candidatos
dentro do catálogo do próprio vendedor, não uma lista de mercado aberto.

## Descoberta 2 — duplicatas (excesso)

Já documentado em [[Roster De Campanhas Smart Tem Duplicatas Reais Durante Paginacao]]:
paginar uma campanha `SMART` grande traz itens repetidos entre páginas,
porque a lista de candidatos é recalculada pelo ML durante o próprio
processo de paginação (que leva vários segundos).

## Descoberta 3 — itens faltando (falta)

Testado o inverso: um MLB confirmado como `status: started` na Fase 2
(participação real e ativa, `MLB4959724082` na campanha `P-MLB17625058`)
**não apareceu** no roster completo e deduplicado dessa mesma campanha.
Ou seja, o roster também **omite** participantes reais — não é só
excesso, é inconsistência nos dois sentidos.

## Por que isso acontece (hipótese fundamentada)

O endpoint provavelmente foi desenhado para consumo visual e momentâneo
(painel do vendedor no site do ML) — uma pequena variação entre cliques
é irrelevante nesse uso. Ele não foi projetado para suportar paginação
extensa seguida de comparação matemática exata contra outra fonte, que é
exatamente o uso que expôs essas falhas.

## Decisão tomada

Parar de usar a Fase 3 (roster de campanha) na coleta de produção, por
enquanto. Manter documentado como possível uso futuro — pode ser que
funcione melhor para tipos de campanha mais estáveis que `SMART` (nunca
testado especificamente com `DEAL`/`LIGHTNING` isolados), ou se o
Mercado Livre tornar o endpoint mais consistente no futuro.

## Escopo de coleta a partir de agora

Só Fase 1 (contexto da conta) + Fase 2 (promoções por item) — que já
está confirmada como completa e confiável para todo o catálogo.

## Relacionado

- [[Roster De Campanhas Smart Tem Duplicatas Reais Durante Paginacao]]
- [[Roster De Campanha Usa Searchafter Dentro De Paging]]