---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
relacionado: [Modelo Novo de Fases Substitui Ciclo Antigo, Sequencia Travada de 5 Passos por Ocorrencia, Ajuste de Dia Util Cria Padrao Estavel de 28 Dias]
---

# Cadência de 30/90 Dias Corridos Contados do Replicado

## Dias corridos, não úteis

30 dias (Vídeo Mensal) e 90 dias (Vídeo Trimestral) são sempre dias corridos — confirmado explicitamente, nunca dias úteis.

## Ajuste pro último dia útil

Se a data calculada cai em fim de semana, ajusta pro último dia útil anterior (reaproveita a função já existente `ultimo_dia_util_ou_hoje`, que já era usada pela fase Diária do modelo antigo).

## Piso é a própria meta

Não existe uma "meta" separada de um "piso" — o dia calculado (30 ou 90 dias corridos após o Replicado anterior, ajustado pro dia útil) é o próprio prazo. Passou desse dia, já é atraso.

## O relógio conta a partir do Replicado, não do Postar

Só o Replicado garante que o vídeo foi postado E aprovado. Uma Postagem Recusada nunca chega no Replicar — então nunca conta como "última postagem" até ser corrigida e refeita. Contar a partir do Postar permitiria uma postagem recusada "travar" o relógio incorretamente.

## Relacionado

- [[Modelo Novo de Fases Substitui Ciclo Antigo]]
- [[Sequencia Travada de 5 Passos por Ocorrencia]]
- [[Ajuste de Dia Util Cria Padrao Estavel de 28 Dias]]
