---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Como Escrever Notas no Vault — Padrao Hiper-Didatico, Estrutura e Convenções do Vault, Fluxo Decomposicao de Problemas em Micro Etapas, Modelo de Escrita — Definicao e Norma (Conceito, Regra), Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint), Modelo de Escrita — Instrucao Procedural (Tutorial), Modelo de Escrita — Artefato de Uso Direto (Prompt), Exemplo — Decisao (Modelo de Demonstracao), Exemplo — Descoberta (Modelo de Demonstracao), Exemplo — Duvida (Modelo de Demonstracao), Exemplo — Bug Conhecido (Modelo de Demonstracao)]
resumo: Esqueleto de referência, explicado seção por seção com exemplo de cada tipo, para notas que respondem uma pergunta ou resolvem um problema (decisao, descoberta, bug_conhecido, e duvida) — incluindo o ciclo de 2 notas de dúvida→decisão.
---

# Modelo de Escrita — Arco de Resolução (Decisão, Descoberta, Bug Conhecido, Dúvida)

**Resumo**: os tipos `decisao`, `descoberta`, `bug_conhecido` e `duvida` têm em comum uma pergunta ou problema central que precisa de resposta. A peça que mais falta em notas assim, escritas sem pensar nisso, é o raciocínio entre "aqui está o problema" e "aqui está a resposta" — este modelo existe pra garantir que essa ponte nunca fique faltando, e explica, seção por seção, o que cada uma precisa conter — não só o nome dela.

> [!info] Isto é um modelo de referência, não uma fôrma rígida
> As seções abaixo são um jeito de pensar a nota, não uma casca obrigatória pra preencher campo por campo. Se a nota real não tiver uma alternativa descartada de verdade, por exemplo, essa parte encolhe pra 1 frase ou some — o que nunca pode faltar é o leitor entender o caminho até a resposta, não o nome exato da seção. Adapte ao que a nota precisa dizer.

## Contexto — por que este modelo existe

Numa rodada de revisão em 29/08/2026, o usuário apontou que uma primeira versão de nota-exemplo de `bug_conhecido` pulava direto do problema pra correção, sem mostrar o raciocínio no meio — o que levou a investigar, quais hipóteses foram descartadas, como se chegou na causa raiz. A régua hiper-didática já exige "explicar o por quê junto do o quê" ([[Como Escrever Notas no Vault — Padrao Hiper-Didatico]], regra 2), mas isso cobre por que uma afirmação é verdadeira — não necessariamente o caminho de investigação que levou até ela. Este modelo formaliza esse caminho como seção própria, aplicando à escrita de nota a mesma lógica de [[Fluxo Decomposicao de Problemas em Micro Etapas]]: 1 pergunta por seção, na ordem que a cabeça do leitor precisa, em vez de tentar responder tudo de uma vez num parágrafo só.

## Quais tipos usam este modelo, e qual é a pergunta central de cada um

| Tipo | Pergunta central | Quando a resposta aparece |
|---|---|---|
| `decisao` | Qual caminho escolher entre 2 ou mais possíveis? | Sempre — é o propósito da nota |
| `descoberta` | O que os dados/testes mostraram de verdade? | Sempre — é o próprio achado |
| `bug_conhecido` | O que está errado e por quê? | Quando `status` vira `corrigido` |
| `duvida` | Pergunta ainda sem resposta certa | **Nunca dentro da própria nota** — ver seção especial abaixo |

`duvida` é o caso mais diferente dos 4, e por isso ganha seção própria mais abaixo em vez de só uma linha de tabela.

## As seções, explicadas 1 a 1

### Resumo (topo da nota, antes de qualquer callout)

Duas ou três linhas, em prosa corrida, dizendo do que se trata a nota inteira — não é o mesmo texto do campo `resumo:` do frontmatter por acaso: é literalmente a mesma frase, repetida no corpo, porque frontmatter nem sempre aparece pra quem abre a nota (depende de configuração do Obsidian), e o corpo sempre aparece. Serve pra 2 públicos ao mesmo tempo: um humano que abriu a nota errada por engano decide em 3 segundos que não é aquilo que procurava; o Claude, depois de uma conversa compactada, consegue se orientar sem precisar ler a nota inteira de novo.

### Callout de status

Vem logo depois do Resumo, antes do Contexto. É um bloco `> [!tipo]` (ver os tipos de callout já catalogados em [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]) que espelha o campo `status` do frontmatter em prosa curta — 2 a 4 linhas dizendo o estado atual e, quando resolvido, um link direto pra onde está o detalhe. A regra que evita esse callout ficar desatualizado é simples e não tem exceção: **toda vez que `status` muda no frontmatter, o callout muda junto, na mesma edição** — nunca um sem o outro.

### Contexto

Explica de onde a pergunta ou o problema surgiu — o cenário, o sistema ou a situação que fez essa questão existir. Sem isso, o Problema/Pergunta (próxima seção) parece ter caído do nada. Vale a mesma regra 1 da hiper-didática: todo termo técnico citado aqui (nome de sistema, campo, processo) precisa estar explicado na primeira aparição.

### O problema / a pergunta

Depois do Contexto já ter dado o cenário, esta seção isola, numa frase ou num parágrafo curto, exatamente qual é a questão a resolver — separado do Contexto de propósito, pra ficar fácil de achar de novo mais tarde sem reler a história toda. Um jeito de testar se está bem escrito: alguém consegue responder "qual é o problema aqui?" lendo só esta seção, sem precisar do Contexto.

### O que levou à resposta

Esta é a seção que mais costuma faltar, e o motivo de este modelo existir. Aqui entra o raciocínio de verdade: quais hipóteses foram levantadas, quais foram descartadas e por quê, o que foi testado, comparado ou investigado até a conclusão aparecer. Não é o mesmo que a seção seguinte (Resposta) — ali está o resultado; aqui está o caminho até ele. Uma nota sem esta seção mostra "a receita pronta"; com ela, mostra também "como a receita foi descoberta" — é a diferença entre confiar cegamente na conclusão e conseguir entender (e questionar, se for o caso) como ela foi alcançada.

### Resposta / Decisão / Correção

O resultado final, de forma concreta e acionável — o que muda, o que foi decidido, o que foi corrigido. Sempre que envolver código ou comando, segue a regra 4 da hiper-didática: nunca escondido dentro de frase, sempre em bloco próprio.

### Exemplo

Dado real, comando real, ou execução de ponta a ponta (regras 5 e 8 da hiper-didática) — nunca a explicação fica só na abstração. Se a nota descreve um processo com 3 ou mais passos em sequência, este é o lugar mais natural pra um diagrama Mermaid, em vez de descrever em prosa.

### Relacionado

Lista de outras notas conectadas — o vault é uma rede, não uma lista, e é assim que o Claude (e qualquer pessoa) navega entre uma decisão e a dúvida que a originou, ou entre um conceito e a regra que dele deriva.

## Caso especial: dúvida — por que ela precisa de 2 notas, nunca 1 só

`duvida` é o único tipo desta família que **nunca** ganha a seção "O que levou à resposta" nem "Resposta" dentro da própria nota, mesmo depois de resolvida. Isso já está registrado como regra em [[Estrutura e Convenções do Vault]]: "Dúvida resolvida: nunca edita a nota de dúvida virando decisão. Gera uma nota nova, `tipo: decisao`... A dúvida original muda `status` de `em_aberto` para `resolvida` e continua existindo."

Na prática, isso dá 2 estados bem diferentes pra mesma nota de dúvida, ao longo do tempo:

**Enquanto `status: em_aberto`** — a nota tem só um esqueleto reduzido: Resumo → Callout (`[!question]`, marcando que segue em aberto) → Contexto → Pergunta →, se já existir, o que já se sabe ou já se tentou até agora. Não force uma seção "O que levou à resposta" vazia só pra parecer completa — ela simplesmente não existe ainda, porque a resposta não existe ainda.

**Quando `status` vira `resolvida`** — a nota **não é reescrita**. Ela ganha, no topo, um novo callout (`[!success]`) substituindo o `[!question]` antigo, com 2-3 linhas resumindo a resposta e um link direto pra nota nova de `decisao` que contém o raciocínio completo. Todo o conteúdo antigo (Contexto, Pergunta, o que já se sabia) continua embaixo, intacto, como registro histórico de como o problema se manifestou antes de ser resolvido — é valioso saber que a mesma dúvida apareceu de formas diferentes ao longo do tempo antes de alguém finalmente decidir resolver. O raciocínio completo — as alternativas consideradas, o motivo da escolha — mora só na nota nova de `decisao`, nunca duplicado na dúvida.

[[Exemplo — Duvida (Modelo de Demonstracao)]] e [[Exemplo — Decisao (Modelo de Demonstracao)]] são exatamente este par: a mesma pergunta fictícia ("vale a pena cachear a grade de precificação por 24h?"), primeiro registrada como dúvida, depois resolvida e virando uma decisão em nota separada — leia as duas juntas pra ver o ciclo completo.

## Exemplos completos

- [[Exemplo — Bug Conhecido (Modelo de Demonstracao)]] — o arco completo dentro de 1 nota só (bug_conhecido não gera nota nova ao ser corrigido, diferente de dúvida).
- [[Exemplo — Decisao (Modelo de Demonstracao)]] — decisão que resolve a dúvida citada acima.
- [[Exemplo — Descoberta (Modelo de Demonstracao)]] — achado real durante a implementação dessa mesma decisão.
- [[Exemplo — Duvida (Modelo de Demonstracao)]] — a pergunta original, já resolvida, preservando o rastro de quando estava em aberto.

## Relacionado

- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Estrutura e Convenções do Vault]]
- [[Fluxo Decomposicao de Problemas em Micro Etapas]]
- [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)]]
