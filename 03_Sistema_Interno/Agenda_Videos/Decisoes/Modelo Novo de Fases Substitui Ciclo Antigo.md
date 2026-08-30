---
tipo: decisao
dominio: 
status: ativa
criado: 01/08/2026
relacionado: [Sequencia Travada de 5 Passos por Ocorrencia, Video Trimestral Nunca Conclui, Cadencia de 30 e 90 Dias Corridos Contados do Replicado]
---

# Modelo Novo de Fases Substitui Ciclo Antigo

Em reunião com a equipe e o superior de DEV, o modelo de produção/postagem de vídeo do agenda_videos foi descartado por completo e substituído do zero — sem herdar nada do antigo, nem para produtos que já estavam em andamento.

## Modelo antigo (descartado)

3 fases cíclicas — Diária, Semanal, Mensal — cada uma com um "pool" de vídeo reaproveitado em várias postagens dentro da mesma fase (ex: "Diária #1" a "Diária #10" eram o mesmo vídeo, postado em dias diferentes). Ao esgotar as 3 fases, o produto entrava em "Otimizado" — ciclo encerrado, fim do trabalho.

## Modelo novo (vigente)

| Fase | Ocorrências | Quando libera cada uma |
|---|---|---|
| Simples | 1 (única, sempre a primeira) | Assim que o produto entra na Agenda |
| Vídeo Mensal | 4 | #1 libera assim que o Simples é replicado (sem espera); #2/#3/#4 sempre 30 dias corridos após a postagem (replicação) da anterior |
| Vídeo Trimestral | Sem fim, pra sempre | Sempre 90 dias corridos após a postagem anterior — a 1ª ocorrência trimestral também espera 90 dias a partir do Vídeo Mensal #4 |

Motivo dos 90 dias: o algoritmo do Mercado Livre reclama quando demora mais de 90 dias pra postar algo num anúncio.

## Sem migração do modelo antigo

O modelo antigo é ignorado por completo — sem migração automática, sem coexistência. A Agenda já foi zerada via script antes da reunião. Transição de produtos que estavam em andamento é feita manualmente pelos humanos, fora do sistema.

## Relacionado

- [[Sequencia Travada de 5 Passos por Ocorrencia]]
- [[Video Trimestral Nunca Conclui]]
- [[Cadencia de 30 e 90 Dias Corridos Contados do Replicado]]
