---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
relacionado: [Modelo Novo de Fases Substitui Ciclo Antigo, Cadencia de 30 e 90 Dias Corridos Contados do Replicado]
---

# Sequência Travada de 5 Passos por Ocorrência

Toda ocorrência, em qualquer fase, sem exceção, percorre a mesma sequência travada, sempre na mesma ordem, sem pular etapa:

```
Base → Roteiro → Completo → Postar → Replicar
```

## Sem trava de data (Base/Roteiro/Completo)

Podem ser feitos com antecedência, a qualquer momento — essa é a visão de futuro: deixar o "pool" de vídeo completo pronto adiantado, pra só faltar clicar Postar/Replicar quando a data chegar.

## Com trava de data (Postar)

A única etapa com trava de data — um dia exato (não uma janela de vários dias), calculado como `data_do_replicado_anterior + distância`, ajustado pro último dia útil se cair em fim de semana. Antes do dia = ainda não chegou a vez. Depois do dia = atrasado. Não tem "meta" separada do "piso" — é o mesmo dia.

## Replicar continua clique manual

A automação não dispara sozinha — o usuário clica "Iniciar Replicação de Hoje". Só o vídeo já estar pronto de antemão muda em relação ao modelo antigo.

## A trava é rígida dentro do produto, não entre produtos

A ordem dos 5 passos é sempre exata para um mesmo produto — nunca pula etapa. O que é flexível é a execução real entre PRODUTOS diferentes, não dentro do mesmo produto.

## Relacionado

- [[Modelo Novo de Fases Substitui Ciclo Antigo]]
- [[Cadencia de 30 e 90 Dias Corridos Contados do Replicado]]
