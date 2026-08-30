---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Como Escrever Notas no Vault — Padrao Hiper-Didatico, Estrutura e Convenções do Vault, Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian), Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Modelo de Escrita — Definicao e Norma (Conceito, Regra), Modelo de Escrita — Instrucao Procedural (Tutorial), Modelo de Escrita — Artefato de Uso Direto (Prompt), Exemplo — Checkpoint (Modelo de Demonstracao)]
resumo: Esqueleto de referência, explicado seção por seção, para checkpoint — não é um arco de pergunta/resposta única, é um log vivo que é sobrescrito a cada sessão até o trabalho terminar.
---

# Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint)

**Resumo**: `checkpoint` é o único tipo cujo conteúdo muda de natureza a cada edição — não é uma pergunta que ganha resposta 1 vez só ([[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)|arco de resolução]]) nem uma verdade fixa ([[Modelo de Escrita — Definicao e Norma (Conceito, Regra)|definição/norma]]) — é o estado atual de um trabalho de várias sessões, reescrito por cima a cada rodada relevante, até `status` virar `concluido`.

> [!info] Isto é um modelo de referência, não uma fôrma rígida
> Um checkpoint pequeno, de 1 sessão só, pode não precisar de uma "linha do tempo" com várias datas — nesse caso ela vira só a seção "o que foi feito", sem histórico multi-data. O que não pode faltar é o leitor conseguir responder rápido: "onde isso está agora, e o que falta?"

## Contexto — por que este modelo é diferente dos outros

Pela regra já registrada em [[Estrutura e Convenções do Vault]], um checkpoint "é sobrescrita na mesma nota a cada atualização relevante" — ele não gera nota nova a cada sessão, a mesma nota cresce. Isso muda a forma de escrever: não faz sentido um "Contexto → Problema → Resposta" fixo, porque não existe 1 resposta final até o trabalho acabar (`status: concluido`). O que existe é um retrato do momento atual, mais um rastro de como se chegou até aqui — cada sessão nova soma ao histórico, nunca apaga o que já foi escrito antes.

## As seções, explicadas 1 a 1

### Resumo do estado atual (topo da nota)

Duas ou três linhas dizendo onde este trabalho está agora — não onde ele começou, onde está **hoje**. É a seção que mais muda a cada edição: enquanto em `conceito`/`regra` o resumo é fixo (a verdade não muda), aqui ele é reescrito toda vez que o estado avança, porque quem abre um checkpoint depois de dias sem olhar precisa saber o estado atual antes de mais nada — sem isso, teria que ler a linha do tempo inteira só pra descobrir onde as coisas pararam.

### Callout de status

`[!warning]` ou similar pra `em_andamento`, `[!success]` pra `concluido` — resume em poucas linhas o estágio atual e, se fizer sentido, o que falta pra fechar. Segue a mesma regra do [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)|arco de resolução]]: muda junto do campo `status` do frontmatter, sempre, nunca um sem o outro.

### Linha do tempo

O que foi feito, sessão por sessão, sempre com data — não é um resumo do trabalho, é um registro cronológico de decisões e testes reais, incluindo os que não deram certo. É essa seção que preserva o "por quê fizemos assim" pra quando alguém (ou o próprio Claude, depois de uma compactação) precisar entender uma escolha que parece estranha isolada, mas fazia sentido no momento em que foi tomada. Cada entrada nova é **acrescentada**, nunca substitui uma entrada anterior — mesmo que uma decisão de uma sessão tenha sido revertida depois, o registro da tentativa continua ali, só com uma nota indicando que foi revertida e por quê.

### Em aberto

Checklist (`- [ ]` / `- [x]`) do que ainda falta, sem precisar reler a linha do tempo inteira pra descobrir. É a seção mais consultada de um checkpoint em andamento — geralmente é a primeira coisa que alguém olha depois do Resumo, antes de decidir se vale a pena ler a linha do tempo completa.

### Relacionado

Outras notas conectadas — em especial, todo checkpoint que nasceu de uma `decisao` deveria linkar pra ela, e toda `descoberta` feita durante o trabalho merece nota própria linkada aqui, em vez de virar só um parágrafo perdido dentro da linha do tempo (ver [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]]).

Quando o trabalho termina de vez, `status` muda pra `concluido` — a nota não é apagada nem arquivada, continua existindo como registro final (mesma regra de [[Estrutura e Convenções do Vault]]).

## Exemplo real já existente no vault

[[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]] é o checkpoint que registrou toda a exploração de recursos visuais do Obsidian ao longo de várias sessões — cresceu seção por seção (numeradas por rodada, ex: "6.5", "6.10"), sempre com data/hora de cada atualização, e mantém uma seção "Em aberto" no fim com checklist do que ainda falta decidir. É o próprio exemplo deste modelo em uso real, não fictício.

## Exemplo completo (fictício, criado para este modelo)

[[Exemplo — Checkpoint (Modelo de Demonstracao)]] — acompanha a implementação da decisão tomada em [[Exemplo — Decisao (Modelo de Demonstracao)]], incluindo a sessão em que a [[Exemplo — Descoberta (Modelo de Demonstracao)|descoberta de exemplo]] aconteceu no meio do trabalho.

## Relacionado

- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Estrutura e Convenções do Vault]]
- [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]
