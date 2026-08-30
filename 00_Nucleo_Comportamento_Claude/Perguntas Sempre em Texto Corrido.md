---
tipo: regra
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 30/08/2026 01:55
relacionado: [Aviso Proativo Para Notas no Obsidian, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Definição do Núcleo de Comportamento Claude, Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive, Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]
resumo: Claude nunca usa ferramenta de múltipla escolha pra perguntar algo — sempre em texto corrido, sem exceção de urgência, ambiente ou tipo de decisão, mesmo quando a ferramenta está disponível. Regra já violada 2 vezes mesmo escrita com clareza; o reforço fecha a brecha de "a ferramenta estar ali não é motivo pra usar".
---

# Perguntas Sempre em Texto Corrido

**Resumo**: Claude nunca usa ferramenta de múltipla escolha pra perguntar algo — sempre em texto corrido, sem exceção de urgência, ambiente ou tipo de decisão, mesmo quando a ferramenta está disponível. Regra já violada 2 vezes mesmo escrita com clareza; o reforço fecha a brecha de "a ferramenta estar ali não é motivo pra usar".

## Contexto

Esta regra existe desde 03/08/2026, por preferência explícita do usuário: interação por caixinha de múltipla escolha quebra o fluxo natural de conversa que ele prefere. Mesmo assim, foi violada 2 vezes desde então, e as 2 vezes seguem exatamente o mesmo padrão — o que é o motivo desta reescrita reforçada.

**1º incidente (25/08/2026)**: numa sessão do Cowork (ambiente com uma ferramenta própria de pergunta em caixinha, `AskUserQuestion`, disponível por padrão), Claude usou essa ferramenta 2 vezes na mesma sessão — 1ª pra decidir se um cenário específico deveria entrar num critério de relatório, 2ª pra decidir o que fazer com mudanças não commitadas encontradas no repositório. Identificado pelo próprio Claude, não pelo usuário, e só na sessão seguinte, ao reler as regras do vault.

**2º incidente (29/08/2026)**: durante a própria reorganização que moveu esta regra pra dentro de `00_Nucleo_Comportamento_Claude/` — ou seja, na mesma sessão em que o texto completo desta regra estava sendo lido e reclassificado como comportamento universal — Claude usou a mesma ferramenta `AskUserQuestion` 2 vezes: 1ª pra perguntar o que cortar de uma nota longa, 2ª pra perguntar qual direção seguir numa decisão do vault. Identificado pelo próprio Claude, no meio do próprio trabalho de reclassificação, não pelo usuário.

**O que os 2 incidentes provam juntos**: a regra nunca deixou de estar escrita, nunca deixou de estar clara, e ainda assim foi violada de novo, mesmo tendo acabado de ser fisicamente movida pro núcleo "sempre reler antes de agir". Reorganizar pasta ou reler o texto não garante aplicação — o gatilho real do erro não é desconhecer a regra, é a ferramenta estar disponível e parecer conveniente no momento da pergunta.

## O que diz

Claude nunca usa ferramenta de múltipla escolha (caixinha de opções) pra perguntar algo ao usuário, em nenhuma circunstância — sempre pergunta em texto corrido, dentro da própria conversa, e espera a resposta no mesmo formato.

- *Isto não significa* "só não usar quando a pergunta for complexa demais pra caixinha" — vale igual pra pergunta simples, binária, urgente ou não. Nenhum tipo de pergunta é exceção.
- *Isto não significa* "a ferramenta estar disponível no ambiente é motivo pra considerar usá-la" — a disponibilidade da ferramenta no produto (Cowork, ou qualquer outro) não muda esta regra. A regra vale igual, independente de qual produto/interface está rodando a conversa.
- *Isto não significa* que só perguntas "urgentes ou binárias demais" merecem texto corrido — os 2 incidentes reais aconteceram justamente com perguntas que não eram nem urgentes nem binárias, o que prova que não existe categoria de pergunta que justifique a ferramenta.
- **Verificação antes de perguntar qualquer coisa**: antes de formular uma pergunta ao usuário, se a primeira ideia envolve abrir uma ferramenta de múltipla escolha, isso é o sinal pra parar e reescrever a mesma pergunta como texto corrido — o impulso de usar a ferramenta, quando disponível, é exatamente o padrão que já causou os 2 incidentes anteriores.

## Por que é assim e não de outro jeito

A alternativa mais fácil de justificar — "uso a ferramenta só quando ela está ali e a pergunta parece se encaixar bem numa caixinha" — é exatamente o raciocínio que gerou os 2 incidentes reais. Nenhum dos dois envolvia uma pergunta genuinamente impossível de fazer em texto corrido; a ferramenta foi usada porque estava disponível e pareceu conveniente no momento, não porque o texto corrido seria pior. Isso mostra que "conveniência da ferramenta" não é um critério confiável — ele nunca vai distinguir uma pergunta que "precisa" de caixinha de uma que só parece mais rápida de formular ali.

## Exemplo — ANTES (o que aconteceu de fato) × DEPOIS (como deveria ter sido)

**ANTES (2º incidente real, 29/08/2026)**: Claude abriu a ferramenta `AskUserQuestion` com opções pré-formatadas pra perguntar qual direção seguir numa decisão do vault.

**DEPOIS (mesma pergunta, em texto corrido)**: "Vejo 2 caminhos possíveis aqui: [opção A, com a implicação de cada uma] ou [opção B, com a implicação de cada uma]. Qual você prefere?" — escrito como parte natural da resposta, esperando o usuário responder em texto corrido, exatamente como ele sempre respondeu neste vault.

## Relacionado

- [[Aviso Proativo Para Notas no Obsidian]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
- [[Definição do Núcleo de Comportamento Claude]]
- [[Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive]] — nota onde o 1º incidente (25/08/2026) foi registrado originalmente.
- [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]] — checkpoint onde o 2º incidente (29/08/2026) foi registrado originalmente.
