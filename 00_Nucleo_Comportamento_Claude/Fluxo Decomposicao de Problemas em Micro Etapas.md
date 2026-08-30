---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
atualizado_em: 30/08/2026 01:55
relacionado: [Nomenclatura e Comentarios, Disciplina de Refatoracao - Quando Generalizar e Quando Deixar Simples, Integridade e Fonte Unica de Dado, Estrutura de Arquivo e Classe Python, Definição do Núcleo de Comportamento Claude]
resumo: Antes de agir em qualquer problema — seja escrever código, organizar uma pasta, ou planejar uma investigação — pensar primeiro em quais são os micro-passos que o compõem, preferindo várias partes pequenas e especializadas a 1 parte grande fazendo tudo, com critério fixo pra saber quando cada parte fica solta ou aninhada.
---

# Fluxo — Decomposição de Problemas em Micro-Etapas

**Resumo**: antes de agir em qualquer problema — seja escrever código, organizar uma pasta, ou planejar uma investigação — pensar primeiro em quais são os micro-passos que o compõem, preferindo várias partes pequenas e especializadas a 1 parte grande fazendo tudo, com critério fixo pra saber quando cada parte fica solta ou aninhada.

## Contexto

"Fluxo" é o nome dado, desde o início deste projeto, à prática de sempre pensar um problema em micro-problemas antes de agir. Esta regra nasceu olhando pra código (funções pequenas em vez de uma função grande), mas o princípio nunca foi sobre Python especificamente — é sobre como qualquer problema deve ser pensado. Isso só ficou totalmente claro depois de reler esta nota em 30/08/2026: o único exemplo que ela continha até então era um trecho de código Python, o que fazia a regra parecer uma convenção de estilo de código, quando na prática o mesmo raciocínio já vinha sendo aplicado, sem nome, fora de código — inclusive na própria estrutura deste vault (ver Exemplo abaixo).

## O que diz

Antes de agir em qualquer problema, pensar: quais são os micro-passos que compõem esse problema? Isso vem antes de qualquer ação — é a mesma lógica de nunca desenhar a solução final sem antes desenhar o fluxo que leva até ela.

- **Preferir várias partes pequenas e especializadas a 1 parte grande e trabalhosa** — cada parte pequena pode ser aperfeiçoada sozinha pro seu papel específico, sem afetar as outras.
- **Critério fixo pra saber quando uma parte fica solta (reaproveitável, com nome e lugar próprio) ou aninhada (presa dentro do processo que a usa)**: reaproveitada em mais de 1 lugar → fica solta; serve só a este processo específico → fica aninhada, dentro do que a usa.
- **Exceção ao critério acima**: mesmo servindo só a 1 caso, a parte fica solta (não aninhada) quando representa um passo com valor de verificação isolada — testar ou conferir aquele passo sozinho, sem precisar rodar o processo inteiro, pesa mais que a regra padrão nesse caso.
- *Isto não significa* que toda decomposição precisa ser feita antes de escrever a primeira linha de um plano — significa que, antes de qualquer execução real começar, os micro-passos já precisam estar identificados, nem que seja em poucas frases.
- *Isto não significa* decompor por decompor, criando partes tão pequenas que ninguém mais entende o fluxo geral só de olhar os nomes — decompor tem limite: uma parte só se separa quando isso deixa cada pedaço mais fácil de entender e mudar sozinho, nunca quando só adiciona camada sem ganho real de clareza.

## Por que é assim e não de outro jeito

Quando uma diretriz interna ou externa muda — o que acontece com frequência neste projeto — o ajuste fica isolado na micro-etapa específica que precisa mudar, sem precisar mexer no todo. Isso é o que sustenta manutenção fácil e cobrança direta, sempre que o trabalho tiver peso real. Também é mais simples de pensar: um problema grande é difícil de segurar na cabeça inteiro; vários problemas pequenos, não. A alternativa — atacar o problema inteiro de uma vez, sem decompor — foi descartada porque esconde justamente o ponto que vai precisar mudar depois: sem partes isoladas, qualquer ajuste futuro obriga a reler e entender o bloco inteiro de novo, mesmo quando só 1 pedaço pequeno dele mudou de verdade.

## Exemplo

**Aplicação em código** (a mesma que já existia nesta nota, mantida como 1 ilustração entre outras, não como a definição da regra): a função `entregar_dimensoes_do_produto_com_peso_cubado_calculado()` decompõe internamente em `ler_dimensoes()` → `organizar_dimensoes()` → `gerar_peso_cubado()` — cada uma aninhada, porque nenhuma delas é reaproveitada fora desse processo específico.

**Aplicação fora de código, já real neste vault**: o mesmo critério de "reaproveitado em mais de 1 lugar → vira algo próprio, com nome e pasta dedicada; serve só a 1 caso → fica dentro do que o usa" foi aplicado, sem citar esta regra pelo nome, quando o vault decidiu que uma nota servindo a mais de 1 mundo vira núcleo próprio (`02_Nucleo_Engenharia_Repositorio/`) em vez de continuar presa dentro do mundo onde foi escrita primeiro. É a mesma decomposição — só que a "parte" sendo avaliada era uma nota, não uma função.

## Relacionado

- [[Nomenclatura e Comentarios]]
- [[Disciplina de Refatoracao - Quando Generalizar e Quando Deixar Simples]]
- [[Integridade e Fonte Unica de Dado]]
- [[Estrutura de Arquivo e Classe Python]]
- [[Definição do Núcleo de Comportamento Claude]]
