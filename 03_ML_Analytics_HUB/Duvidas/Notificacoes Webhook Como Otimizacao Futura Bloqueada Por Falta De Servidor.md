---
tipo: duvida
dominio: 
status: ativa
criado: 14/07/2026
relacionado: [Regras Gerais]
---

# Notificações (Webhooks) Como Otimização Futura — Bloqueada por Falta de Servidor

A única forma real de otimizar a Fase 2 de Promoções (que consome
~5.615 chamadas, 1 por MLB, sem multiget nem paralelismo possíveis) é
parar de perguntar "mudou alguma coisa?" para o catálogo inteiro
periodicamente, e passar a ser avisado pelo próprio Mercado Livre quando
algo mudar — via Notificações (Webhooks).

## Pista concreta encontrada na documentação já lida

A documentação de Promoções menciona dois tópicos de notificação
específicos, ainda não explorados:

> "O id do candidato é obtido através da notificação do tópico **public
> candidate**."
> "O id da oferta é obtido por meio de uma notificação do tópico **public
> offers**."

Ou seja, o Mercado Livre já expõe eventos de mudança de elegibilidade
(`candidate`) e de mudança de oferta/participação (`offers`) via
notificação — que resolveriam exatamente o problema de custo alto da
Fase 2.

## Por que não foi implementado ainda

Notificações/Webhooks exigem uma **URL pública com servidor real**,
capaz de receber chamadas do Mercado Livre — não funciona rodando só
localmente. Essa infraestrutura ainda não existe no projeto.

## O que falta investigar, quando o servidor existir

- Endpoint de configuração/inscrição do webhook (provavelmente `POST`
  numa URL de callback)
- Formato exato do payload de cada notificação
- Se existem outros tópicos relevantes além de `candidate`/`offers`
- Se os tópicos cobrem `SMART` (a campanha mais usada na prática) ou só
  tipos específicos de campanha

## Relacionado

- [[Regras Gerais]]