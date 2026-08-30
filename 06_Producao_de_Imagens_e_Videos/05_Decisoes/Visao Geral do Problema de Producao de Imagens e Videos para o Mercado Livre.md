---
tipo: conceito
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 22/08/2026 19:23
relacionado: [Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack, Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao), Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]
---

# Visão Geral do Problema de Produção de Imagens e Vídeos para o Mercado Livre

## O quê

Um mundo novo de trabalho, separado do `02_Sistema_Interno/` — enquanto a Agenda de Vídeos cuida do que acontece **depois** que o vídeo/foto já existe (cadastro do ciclo, upload no Drive, postagem no Mercado Livre, aprovação, replicação — ver [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]), esta frente ataca a **produção** em si: como gerar a foto/vídeo com qualidade, de forma consistente, antes de tudo isso começar.

## Os 4 tipos de material que um produto precisa

1. **Fotos para o anúncio** — as que ficam publicadas e o cliente vê.
2. **Vídeo Simples para o anúncio** — fundo branco, produto girando.
3. **Vídeo Complexo para o anúncio** — uso real, cenários, itens inclusos etc.
4. **Fotos de referência** — imagens usadas como entrada pra alimentar a geração dos vídeos (não são publicadas, são insumo).

## Por quê isso é um problema sério hoje

O gargalo não é falta de ferramenta — é que **quem opera precisa conhecer o produto a fundo** (pra saber se o resultado gerado está certo ou errado), **precisa saber escrever um bom prompt**, e ainda **fica corrigindo o resultado na mão**. Isso funciona (mal) quando quem opera já é especialista no produto — mas não escala pra ninguém além disso.

**Contexto real da equipe**: existem hoje 2 pessoas novas que podem ajudar nessa produção, mas nenhuma das duas tem experiência com os produtos nem com uso de IA — exatamente o perfil que o processo atual não suporta.

## Restrição explícita para esta frente (decisão do usuário, 22/08/2026)

**Nada de automação por enquanto.** O objetivo imediato é ter um processo 100% manual que funcione bem, com qualidade e sem sofrimento — automatizar fica pra depois, só depois de o processo manual já estar sólido.

## Vídeo é mais difícil que foto — e por um motivo estrutural, não só "mais trabalho"

Foto parte de uma entrada relativamente simples e genérica: jogar a(s) foto(s) do produto + a descrição em algum lugar e pegar o resultado (ver [[Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack]] pro detalhe de como isso é feito hoje). Vídeo depende de um **prompt intermediário** que alimenta o flow de geração — e esse prompt precisa carregar informação **específica da categoria/característica daquele produto**. Não existe (nem parece existir) um prompt de vídeo genérico que sirva igual pra uma meia coto, um pulverizador e uma cadeira de rodas — cada um exige que o prompt descreva certinho o que faz aquele produto ser o que é.

### Evidência real do problema (caso concreto, 21/08/2026)

Ao gerar o vídeo de uma "meia coto" (meia de cano curto), o flow não entendeu a característica "coto" e gerou uma **meia comum** — mesmo sendo operado por gente que **conhece o produto de verdade**. Ou seja: mesmo com conhecimento de produto, o prompt usado não tinha informação suficiente pra guiar o flow certo. Se isso já falha com quem entende do produto, o problema fica ainda maior tentando repassar pra alguém sem esse conhecimento.

## Estado atual, por tipo de material (22/08/2026)

- **Fotos de anúncio**: 2 caminhos em uso hoje, nenhum satisfatório — ver nota própria [[Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack]].
- **Vídeo Simples**: existe algo considerado "sólido", mas já está falhando em casos fora do padrão mais comum (ver o caso da meia coto acima).
- **Vídeo Complexo**: nada pronto ainda — zero solução construída até agora.
- **Fotos de referência**: mencionadas como insumo necessário pro fluxo de vídeo, ainda sem detalhe de processo registrado.

## Objetivo final desta frente (declarado pelo usuário)

Criar algo **sólido, robusto e intuitivo**, com **passo a passo claro**, produzindo **resultado de alta qualidade de forma consistente**, que **qualquer pessoa consiga usar** — mesmo sem conhecer o produto a fundo e sem nenhuma experiência com IA.

## Estado da conversa (atualizado em 22/08/2026, 19h23)

Problema quebrado em partes — a 1ª a ser atacada é a produção de **fotos** (ver [[Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack]]). O escopo mudou de "gerar fotos" pra "construir 1 base de conhecimento por produto, reaproveitável por foto, vídeo, título, descrição e tag" — ver [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]], que supera a arquitetura anterior registrada em [[Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets]]. Modelo de 2 grafos (classificação + templates de característica) já testado com 2 produtos reais (Pulverizador SS-20B Brudden e Pulverizador Jacto XP20); nenhum prompt real de etapa foi escrito ainda — próximo passo é formalizar a Etapa 1 (Leitura de Dados) como prompt autocontido e testável.

## Relacionado

- [[Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack]]
- [[Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets]]
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]
