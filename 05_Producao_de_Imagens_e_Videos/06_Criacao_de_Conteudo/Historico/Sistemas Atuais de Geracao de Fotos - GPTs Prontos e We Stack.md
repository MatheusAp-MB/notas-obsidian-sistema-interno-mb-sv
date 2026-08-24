---
tipo: conceito
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 22/08/2026 15:08
relacionado: [Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]
---

# Sistemas Atuais de Geração de Fotos — GPTs Prontos e We Stack

## O quê

2 caminhos em uso hoje pra gerar as fotos de anúncio do Mercado Livre — nenhum dos 2 considerado satisfatório pelo usuário.

## Entrada compartilhada pelos 2 sistemas

Ambos partem exatamente da mesma informação de entrada: **descrição do produto** + **1 foto do produto**.

## Sistema 1 — GPTs prontos (ChatGPT)

- **O que são**: GPTs (assistentes customizados do ChatGPT) encontrados prontos na internet — não construídos pela equipe.
- **Como funciona**: manual — o usuário precisa enviar os dados (descrição + foto) diretamente no input do GPT.
- **Ponto forte**: os resultados funcionam bem, com boa qualidade.
- **Problema real**: o GPT é cheio de etapas que a equipe não usa, e **não é editável** — não dá pra personalizar/simplificar o fluxo interno dele. Resultado: gasta muito tempo por produto, mesmo entregando bom resultado.

## Sistema 2 — We Stack (empresa contratada)

- **O que é**: empresa contratada pra automatizar o Mercado Livre, que oferece 7 prompts próprios de geração de imagem.
- **Como funciona**: análise e geração **autônoma**, via API — a We Stack tem API do Mercado Livre e das LLMs de geração de imagem, então não depende de alguém digitar nada manualmente.
- **Ponto forte**: rápido, automático, sem esforço manual de operação.
- **Problema real**: depois de analisar, o usuário achou os prompts **muito genéricos** — resultado sai raso, sem o cuidado específico que cada produto exigiria. Avaliação do usuário: "acho que dá pra ser muito melhor que aquilo."

## A tensão central

| | Qualidade | Velocidade/esforço | Personalização |
|---|---|---|---|
| GPTs prontos | Boa | Ruim (lento, manual, cheio de etapa) | Nenhuma (não editável) |
| We Stack | Genérica/fraca | Boa (automático via API) | Nenhuma (7 prompts fixos) |

Nenhum dos 2 sistemas entrega os 3 ao mesmo tempo — é exatamente essa lacuna que motivou o usuário a considerar construir uma solução própria, mais personalizável, para a geração de fotos.

## Estado da conversa (22/08/2026)

Este é o ponto de partida do problema de **fotos** especificamente — a 1ª parte do problema maior de produção de imagens/vídeos (ver [[Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]]). Ainda sem solução proposta registrada — conversa em andamento.

## Relacionado

- [[Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]]
