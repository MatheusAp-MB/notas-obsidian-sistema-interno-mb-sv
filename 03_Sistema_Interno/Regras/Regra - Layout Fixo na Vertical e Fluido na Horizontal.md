---
tipo: regra
dominio: design
status: ativa
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Telas e Monitores dos Usuarios - Resolucoes de Referencia Para Desenhar o Sistema Interno V2, Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API, Regra - O Maximo de Acoes Possiveis Sempre em Tela, Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]
resumo: Toda tela do V2 tem layout fixo (nada muda de lugar quando a barra lateral abre ou fecha) e usa a largura toda: fluida na horizontal, rígida na vertical. Vale para qualquer tela nova (regra de 12/10/2026).
---

# Regra - Layout Fixo na Vertical e Fluido na Horizontal

**Resumo**: toda tela do Sistema Interno V2 deve ter o layout **fixo**: nada muda de posição ou de arranjo "aleatoriamente" (filtros e cartões quebrando de linha, colunas mudando) só porque a barra lateral abriu ou fechou. E a tela também **não pode desperdiçar espaço**: com a barra fechada, não sobra uma faixa vazia ao lado. A fórmula que Matheus aprovou é **"fluida na horizontal, rígida na vertical"**.

## Contexto

Em 12/10/2026 Matheus apontou que, em algumas telas, o arranjo dos elementos mudava sozinho quando a barra lateral (a navegação do sistema) era aberta ou fechada: filtros e cartões quebravam de linha e colunas mudavam. Ele deixou como regra que o layout precisa ficar **fixo** e que isso vale para qualquer tela nova.

No mesmo dia ele completou a regra: a tela também **não pode deixar espaço mal aproveitado** (uma faixa vazia ao lado quando a barra está fechada). Ele quer posições fixas **e** uso da largura toda. Pediu uma análise de UX/UI e aprovou aplicar a proposta **"fluida na horizontal, rígida na vertical"**.

## O que diz

- O arranjo dos blocos **não muda** quando a barra lateral abre ou fecha, nem conforme o estado dos dados.
- A tela usa a **largura toda** disponível, com a barra aberta ou fechada.
- Fórmula aprovada: **fluida na horizontal, rígida na vertical**. Na prática, e esta leitura é de Claude: a largura dos blocos acompanha o espaço que a janela dá, e a ordem e a posição dos blocos, de cima para baixo, não se rearranjam.
- Ao montar **qualquer tela nova**, pensar nisso **desde o começo**, não como ajuste depois.
- Desde 16/10/2026, a conferência é feita em 3 tamanhos de janela (1280x1024, 1440x900 e 1707x960), por causa dos monitores do escritório (ver [[Telas e Monitores dos Usuarios - Resolucoes de Referencia Para Desenhar o Sistema Interno V2]]).

## Por que é assim e não de outro jeito

Uma tela que muda de arranjo sozinha obriga quem a usa a reaprender onde as coisas estão a cada abertura ou fechamento da barra. Uma tela rígida demais, por outro lado, deixa faixas vazias que desperdiçam o monitor. A fórmula aprovada resolve os dois problemas ao mesmo tempo, em vez de escolher um dos dois.

## Exemplo

> [!failure] ANTES (o problema que Matheus apontou)
> Ao fechar a barra lateral, os filtros e os cartões quebram de linha e as colunas mudam de arranjo; ou, com a barra fechada, aparece uma faixa vazia ao lado.

> [!success] DEPOIS (o que a regra exige)
> Com a barra aberta ou fechada, os mesmos blocos ficam nas mesmas posições e a tela aproveita a largura toda.

Aplicação registrada no código em 14/10/2026: na Gestão de APIs, a ordem e a quantidade de cartões **não mudam** conforme o estado de cada conexão (o código diz "layout fixo"; ver [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]).

## Relacionado

- [[Telas e Monitores dos Usuarios - Resolucoes de Referencia Para Desenhar o Sistema Interno V2]]
- [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]
- [[Regra - O Maximo de Acoes Possiveis Sempre em Tela]]
- [[Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]]
