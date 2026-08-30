---
tipo: conceito
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:26
relacionado: [Schema de Frontmatter, Ciclo de Vida de Dúvida e Bug Conhecido, Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Modelo de Escrita — Definicao e Norma (Conceito, Regra), Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint), Modelo de Escrita — Instrucao Procedural (Tutorial), Modelo de Escrita — Artefato de Uso Direto (Prompt)]
resumo: Definição, critério de distinção e status possível de cada um dos 9 tipos aceitos no campo `tipo` do frontmatter (`regra`, `decisao`, `descoberta`, `duvida`, `bug_conhecido`, `conceito`, `checkpoint`, `tutorial`, `prompt`) — o vocabulário fechado que classifica toda nota deste vault.
---

# Os 9 Tipos de Nota

**Resumo**: definição, critério de distinção e status possível de cada um dos 9 tipos aceitos no campo `tipo` do frontmatter (`regra`, `decisao`, `descoberta`, `duvida`, `bug_conhecido`, `conceito`, `checkpoint`, `tutorial`, `prompt`) — o vocabulário fechado que classifica toda nota deste vault.

## Contexto

Formalizado em 29/08/2026, depois de uma rodada de validação ponto a ponto com o usuário. Antes disso, o vocabulário de `tipo` foi crescendo organicamente conforme casos reais apareciam (`tutorial` e `prompt`, por exemplo, só nasceram depois de casos concretos que não se encaixavam bem em nenhum tipo existente) — esta nota fixa a versão final, validada, dos 9 tipos e do critério de escolher entre eles. O critério de fundo, em qualquer caso de dúvida sobre qual tipo usar: **que tipo de conhecimento é esse, e ele poderia ter sido diferente?**

## O que diz

| Tipo | Definição | Status |
|---|---|---|
| **regra** | Princípio ou convenção que vale sempre — não depende de opinião, é assim e ponto final. Pode (e deve) explicar o motivo de existir, mas o motivo não é debate, é contexto. | `ativa` (único) |
| **decisao** | Escolha feita entre 2 ou mais caminhos possíveis, com o motivo registrado — depende de opinião e de fato, poderia genuinamente ter sido diferente. | `ativa` \| `em_andamento` \| `concluida` \| `descartada` |
| **descoberta** | Fato observado através de dado ou teste real — conhecimento empírico, não veio de nenhuma referência (nem doc, nem definição prévia). | `ativa` \| `confirmada` |
| **duvida** | Pergunta sobre um dado ou situação, ainda sem resposta certa. | `em_aberto` \| `resolvida` |
| **bug_conhecido** | Defeito, inconsistência ou comportamento estranho encontrado no sistema atual. | `em_aberto` \| `corrigido` |
| **conceito** | Definição do que algo É — explica uma ideia ou termo. Pode vir de fora (documentação, pesquisa) ou ter sido definida entre nós (nomenclatura, convenção interna). | `ativa` (único) |
| **checkpoint** | Estado atual de um trabalho em andamento de várias sessões — o que foi feito, o que está sendo feito, o que falta. | `em_andamento` \| `concluido` |
| **tutorial** | Explicação passo a passo de um processo que deve ser realizado, feita pra um humano seguir. | `ativa` (único) |
| **prompt** | Texto de prompt pronto pra ser usado — por Claude (nesta ou noutra conversa) ou por qualquer outra LLM. Não é explicação de processo pra humano seguir (isso é `tutorial`), é o próprio texto a ser executado. | `em_desenvolvimento` \| `validado` |

**Cada tipo, explicado com o mesmo nível de detalhe**:

- **`regra`** — o mais permanente dos 9. Não existe "regra revogada" guardada como histórico: se uma regra deixa de valer, a nota é reescrita no lugar, `atualizado_em` muda, e o conteúdo antigo simplesmente deixa de existir. Isso é diferente de `decisao`/`duvida`/`bug_conhecido`, que preservam histórico de propósito.
- **`decisao`** — o único tipo com 4 valores de `status` possíveis, porque uma decisão passa por estágios reais entre "escolhida" e "funcionando de verdade": pode ficar `ativa` (decidida, valendo, mas sem trabalho de implementação relevante), `em_andamento` (decidida, ainda sendo implementada — nesse caso normalmente existe também um `checkpoint` acompanhando o progresso), `concluida` (decidida e implementada por completo), ou `descartada` (decidida contra, ou abandonada depois de tentada).
- **`descoberta`** — a marca registrada deste tipo é não ter fonte prévia: o conhecimento nasceu de rodar um teste, medir um tempo, comparar 2 casos reais — nunca de ler uma documentação ou definir um termo. `status: confirmada` existe especificamente pra quando a mesma descoberta foi validada de novo, de forma independente, reforçando que não foi coincidência da primeira vez.
- **`duvida`** — o único tipo cujo ciclo de vida completo (o que acontece quando ela é resolvida) mora em nota própria, porque a mecânica é grande o bastante pra merecer isso: ver [[Ciclo de Vida de Dúvida e Bug Conhecido]].
- **`bug_conhecido`** — parecido com `duvida` na superfície (os 2 têm status "aberto"/"resolvido"), mas o ciclo de vida é bem diferente — também detalhado em [[Ciclo de Vida de Dúvida e Bug Conhecido]].
- **`conceito`** — o par "descritivo" de `regra`: onde `regra` prescreve um comportamento, `conceito` só define um termo ou ideia. `status` é sempre `ativa`, único, mesma lógica de nunca guardar versão obsoleta.
- **`checkpoint`** — o único tipo pensado pra crescer dentro da mesma nota ao longo de várias sessões, em vez de gerar nota nova ou ficar fixo. Existe porque a memória de conversa é volátil (sujeita a compactação) — o checkpoint é a memória persistente de um progresso que ainda não terminou. Por convenção, todo checkpoint mantém uma seção `## Última atualização` no topo do corpo, com a data — quem abre a nota depois de dias sem olhar sabe imediatamente se está vendo o estado mais recente, sem precisar ler o resto. Quando termina de vez, `status` muda pra `concluido` e a nota continua existindo como registro final, nunca é apagada.
- **`tutorial`** — nasceu de um caso real: uma nota com a sequência exata de comandos pra reconstruir um banco do zero tinha sido classificada como `regra`, mas não é uma regra — não descreve um comportamento esperado do sistema, é um manual concreto com passos numerados. Diferente de `duvida`/`bug_conhecido`/`decisao`, aqui não existe "histórico preservado": se o procedimento parar de ser correto, a nota é apagada, não marcada obsoleta — um tutorial ou está certo e existe, ou não existe.
- **`prompt`** — o texto da nota É a instrução a ser executada diretamente, não uma explicação sobre como fazer algo (isso seria `tutorial`). O uso não é exclusivo de pipeline interno: mesmo quando um prompt nasce dentro de um fluxo formalizado deste vault (ex: as Étapas do mundo `06_Producao_de_Imagens_e_Videos/01_Pipeline/`), o tipo também cobre prompt reutilizável fora desse contexto — pra usar em outra conversa, ou em outra ferramenta de IA. `status` reflete maturidade do prompt em si (`em_desenvolvimento` até `validado`), nunca o estado de uma execução específica — e só vira `validado` depois de teste real, nunca por suposição.

**Critérios de distinção entre vizinhos** (onde mais surge dúvida na prática):

- **Regra vs. Decisão**: regra não tem alternativa real — "é assim e ponto", mesmo que o motivo seja explicado. Decisão tem alternativa real — poderia ter sido outro caminho, escolhemos este.
- **Decisão vs. Conceito**: se o resultado da nota é uma AÇÃO ou caminho a seguir, é `decisao`. Se o resultado é só uma definição ("isso significa X"), é `conceito` — mesmo que chegar nessa definição tenha exigido escolher entre opções.
- **Descoberta vs. Conceito**: descoberta não tem fonte — foi encontrada por teste ou observação nossa. Conceito tem fonte (doc externa, pesquisa, ou definição combinada entre nós).
- **Descoberta vs. Bug Conhecido**: se o achado É um defeito, vira `bug_conhecido` desde o início — nunca fica como `descoberta` com um status alternativo tipo "corrigida".
- **Descoberta vs. Dúvida**: se o achado levanta uma pergunta nova ainda sem resposta, essa pergunta vira uma nota `duvida` própria, linkada — a descoberta em si registra só o fato observado, sempre com status `ativa`/`confirmada`.

## Por que é assim e não de outro jeito

Um vocabulário aberto (deixar qualquer palavra virar `tipo`) foi descartado desde o início — sem um conjunto fechado, cada nota corre o risco de inventar uma variação nova (`decisão` vs `decisao`, `duvida` vs `pergunta`), quebrando qualquer busca ou filtro que dependa do campo bater exatamente. Fixar exatamente 9 valores, cada um com seu próprio conjunto de `status` possíveis, é o que permite que uma Base do Obsidian (ver [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]) ou uma busca simples filtre com confiança — ex: "todo `bug_conhecido` com `status: em_aberto`, em qualquer mundo" só funciona de forma confiável porque os 2 campos têm vocabulário fechado.

## Exemplo

Os 9 tipos, cada um com 1 nota de exemplo completa, vivem na subpasta `Modelos_Referencia_de_Escrita/Exemplos_Ilustrativos/` — 1 exemplo fictício por tipo, cobrindo uma mesma história (um cache de grade de precificação), pra mostrar como cada tipo se comporta na prática: `regra` ([[Exemplo — Regra (Modelo de Demonstracao)]]), `decisao` ([[Exemplo — Decisao (Modelo de Demonstracao)]]), `descoberta` ([[Exemplo — Descoberta (Modelo de Demonstracao)]]), `duvida` ([[Exemplo — Duvida (Modelo de Demonstracao)]]), `bug_conhecido` ([[Exemplo — Bug Conhecido (Modelo de Demonstracao)]]), `conceito` ([[Exemplo — Conceito (Modelo de Demonstracao)]]), `checkpoint` ([[Exemplo — Checkpoint (Modelo de Demonstracao)]]), `tutorial` ([[Exemplo — Tutorial (Modelo de Demonstracao)]]) e `prompt` ([[Exemplo — Prompt (Modelo de Demonstracao)]]).

## Relacionado

- [[Schema de Frontmatter]]
- [[Ciclo de Vida de Dúvida e Bug Conhecido]]
- [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]]
- [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)]]
- [[Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint)]]
- [[Modelo de Escrita — Instrucao Procedural (Tutorial)]]
- [[Modelo de Escrita — Artefato de Uso Direto (Prompt)]]
