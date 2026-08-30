---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:15
relacionado: [Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian), Como Escrever Notas no Vault — Padrao Hiper-Didatico, Definição do Núcleo Geral do Vault]
resumo: Os 4 princípios que qualquer recurso ou convenção nova do vault precisa respeitar, nesta ordem de peso — só Claude escreve nota (nunca o usuário à mão), didático vem antes de bonito, Claude precisa conseguir gerar tudo sozinho sem clique manual, e toda informação visual precisa ter o mesmo conteúdo também em texto corrido.
---

# Princípios Fundamentais do Vault

**Resumo**: os 4 princípios que qualquer recurso ou convenção nova do vault precisa respeitar, nesta ordem de peso — só Claude escreve nota (nunca o usuário à mão), didático vem antes de bonito, Claude precisa conseguir gerar tudo sozinho sem clique manual, e toda informação visual precisa ter o mesmo conteúdo também em texto corrido.

## Contexto

Decisão do usuário em 16/08/2026, motivada por uma situação concreta: o vault estava em plena exploração de recursos visuais do Obsidian (ver [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]), e cada plugin ou recurso novo (Templates, Excalidraw, Iconize, e outros) tinha algum apelo isolado — mas sem um critério fixo de prioridade, cada decisão de adotar ou não um recurso corria o risco de ser resolvida caso a caso, na conversa, sem consistência entre uma escolha e outra. Fixar estes 4 princípios de uma vez resolveu isso: qualquer recurso novo passa pelo mesmo filtro, sempre, antes de ser adotado.

## O que diz

Estes 4 princípios valem pra qualquer mundo, qualquer tipo de nota, e pesam mais que qualquer recomendação de ferramenta feita em outro lugar do vault — nenhum recurso do Obsidian é adotado se contrariar algum deles:

1. **O usuário nunca escreve nenhuma nota à mão — só visualiza e lê.** Toda criação e toda edição de nota é 100% feita por Claude, sempre.
2. **A prioridade não é "ficar bonito esteticamente" — é "didático, organizado, visualmente interessante e, se possível, bonito", nesta ordem.** Beleza estética é o último critério, nunca o primeiro. Quando existem 2 formas de mostrar a mesma informação, vence a mais clara — não a mais bonita.
3. **Toda nota precisa ser algo que Claude consiga criar sozinho, de forma 100% correta, sem depender de ação manual do usuário dentro da interface do Obsidian.**
4. **Toda nota precisa ser entendível tanto por humano quanto por Claude-como-LLM.** Nenhum recurso visual (Mermaid, SVG, Canvas) pode ser a única fonte de uma informação — o texto corrido ao redor sempre precisa contar a mesma informação por escrito.

## Por que é assim e não de outro jeito

A ordem dos 4 importa tanto quanto o conteúdo de cada um. Uma alternativa considerada e descartada foi avaliar cada recurso novo só pelo critério estético ("isso fica bonito no Obsidian?") — rejeitada porque um vault bonito mas confuso não cumpre a função que ele existe pra cumprir (ser memória confiável, pra humano e pra Claude).

Os princípios 1 e 3 existem porque este vault tem uma restrição que a maioria dos vaults Obsidian por aí não tem: **nenhuma pessoa nunca vai clicar em nada dentro da interface pra criar ou editar uma nota** — só Claude escreve, sempre via texto/YAML/JSON gerado de ponta a ponta. Isso descarta, na prática, qualquer recurso pensado pra ajudar um humano a criar nota manualmente (o exemplo mais claro é o plugin núcleo Templates — o atalho "inserir modelo" nunca vai ser usado com as próprias mãos aqui) ou que só funcione através de clique/arrastar/desenhar (ex: atribuir ícone de pasta pela interface, desenho livre estilo Excalidraw) — mesmo que o recurso seja útil em teoria, se Claude não conseguir gerar o resultado inteiro escrevendo texto/YAML/JSON de forma confiável, ele não é adotado.

O princípio 4 existe porque o vault serve 2 públicos ao mesmo tempo — gente buscando informação e Claude buscando contexto de sessões passadas — e quando Claude relê uma nota depois de uma compactação de conversa, ele lê o texto/código-fonte do diagrama, nunca a imagem já desenhada. Um Mermaid ou SVG sem o texto equivalente ao lado vira informação invisível pra ele, mesmo que continue perfeitamente visível pra um humano abrindo a mesma nota no Obsidian.

## Exemplo

O plugin núcleo **Templates** (nativo do Obsidian, já vem instalado) foi avaliado durante o [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)|estudo de melhorias visuais]] e deixou de ser prioridade justamente por causa do Princípio 1 — ele existe pra ajudar um humano a inserir um modelo de nota com um atalho de teclado, mas ninguém neste vault vai fazer isso manualmente, então o ganho dele é zero aqui.

Outro caso real, aplicação direta do Princípio 4: a regra 7 de [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]] exige que todo diagrama Mermaid venha acompanhado do mesmo conteúdo em texto corrido ao redor, nunca sozinho como única explicação de um fluxo — essa regra prática foi decidida antes mesmo deste princípio ser formalizado nesta nota, e depois reconhecida como 1 caso particular dele.

## Relacionado

- [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Definição do Núcleo Geral do Vault]]
