---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
atualizado_em: 30/08/2026 02:04
relacionado: [Disciplina de Testes Automatizados, Fluxo Decomposicao de Problemas em Micro Etapas, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Definição do Núcleo de Comportamento Claude]
resumo: Regra dos Três — nada se generaliza, abstrai ou vira padrão oficial na 1ª nem na 2ª vez que aparece, só na 3ª. Nunca misturar uma mudança de comportamento com uma reorganização; reescrita grande sempre precisa de validação contra o resultado anterior.
---

# Disciplina de Refatoração — Quando Generalizar e Quando Deixar Simples

**Resumo**: Regra dos Três — nada se generaliza, abstrai ou vira padrão oficial na 1ª nem na 2ª vez que aparece, só na 3ª. Nunca misturar uma mudança de comportamento com uma reorganização; reescrita grande sempre precisa de validação contra o resultado anterior.

## Contexto

A tentação mais comum é generalizar cedo demais: na primeira vez que um padrão aparece, já criar a estrutura genérica "pronta pra reaproveitar depois". Isso quase sempre erra a forma certa de generalizar, porque ainda não existe repetição suficiente pra saber o que realmente varia entre os casos e o que é sempre igual — a estrutura genérica criada cedo demais acaba sendo refeita de qualquer jeito assim que o segundo ou terceiro caso real aparece e não encaixa nela.

## O que diz

**Regra dos Três**:

- Na 1ª vez que algo aparece, só resolve aquele caso específico, sem generalizar.
- Na 2ª vez que o mesmo padrão se repete, repete a solução de novo, mesmo que pareça redundante ou incômodo — ainda não é hora de abstrair.
- Só na 3ª vez que o padrão se repete é que vale abstrair, generalizar ou formalizar como regra/estrutura própria.
- *Isto não significa* esperar 3 ocorrências quando o custo de esperar é maior que o custo de errar a generalização — significa que, na dúvida, o padrão default é esperar a repetição real acontecer antes de formalizar, não assumir que vai se repetir.

**Nunca misturar refatoração com mudança de comportamento**:

- Uma reorganização (mudar nome, mover, reestruturar, generalizar) nunca acontece na mesma ação que uma mudança de comportamento (corrigir um resultado, adicionar uma capacidade nova). São 2 tipos de mudança diferentes, e misturá-los esconde qual das duas causou um efeito colateral, caso apareça um.
- Reescrita grande ("descarta tudo e faz de novo") só é aceitável quando o resultado novo é validado contra o comportamento anterior de forma explícita — nunca por suposição de que "deve ter ficado certo".

## Por que é assim e não de outro jeito

A alternativa — generalizar já na primeira ocorrência, "pra não ter que repetir depois" — foi descartada porque o custo de generalizar errado (descobrir depois que a estrutura genérica não serve pro segundo ou terceiro caso, e precisar desfazer) é maior que o custo de repetir uma solução simples 2 vezes. Repetir código, texto ou estrutura 2 vezes é barato de corrigir depois; desfazer uma abstração malfeita, que já se espalhou por vários lugares que dependem dela, não é. Misturar refatoração com mudança de comportamento é descartado pelo mesmo motivo que gera o maior risco de regressão silenciosa: se algo quebra depois de uma mudança que fazia as 2 coisas ao mesmo tempo, não dá pra saber se foi a reorganização ou a mudança de comportamento que causou o problema, sem desfazer e testar cada parte separadamente.

## Exemplo — ANTES × DEPOIS

**ANTES (generalizando cedo demais, fora de código)**: ao criar a primeira pasta de um mundo novo do vault, já se cria de imediato uma estrutura genérica completa de subpastas (`Regras/`, `Conceitos/`, `Decisoes/`, `Duvidas/`, etc.) — mesmo sem ainda saber se aquele mundo específico vai gerar conteúdo pra todas elas. Se só 2 das 8 subpastas nunca forem usadas, a estrutura genérica criada cedo demais vira ruído, sem nenhum ganho.

**DEPOIS (esperando a repetição real, do jeito que este vault realmente formalizou o padrão)**: a estrutura de 8 subpastas por mundo (`Regras/Conceitos/Decisoes/...`) só virou convenção documentada em [[Estrutura e Convenções do Vault]] depois de já ter sido observada, de forma repetida, em mais de 1 mundo real (Sistema Interno, depois Integração Sysemp, depois Mercado Livre) — a Regra dos Três aplicada à própria organização do vault, não a código.

**Aplicação em código**: a metodologia completa de testes automatizados (pytest, progressão por camada, formato de arquivo) só existe hoje, formalizada, em [[Disciplina de Testes Automatizados]] — porque "falta de teste automatizado" apareceu repetidamente como causa de dívida técnica antes de virar prioridade formal, não desde o primeiro dia do projeto.

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Fluxo Decomposicao de Problemas em Micro Etapas]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
- [[Definição do Núcleo de Comportamento Claude]]
