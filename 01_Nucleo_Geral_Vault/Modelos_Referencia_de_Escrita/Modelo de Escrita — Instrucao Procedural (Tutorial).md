---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Como Escrever Notas no Vault — Padrao Hiper-Didatico, Estrutura e Convenções do Vault, Guia de Setup - Do Zero ao Primeiro Preco Calculado, Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Modelo de Escrita — Definicao e Norma (Conceito, Regra), Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint), Modelo de Escrita — Artefato de Uso Direto (Prompt), Exemplo — Tutorial (Modelo de Demonstracao)]
resumo: Esqueleto de referência, explicado seção por seção, para tutorial — não explica uma pergunta nem fixa uma verdade, ensina uma sequência de ações até um resultado concreto.
---

# Modelo de Escrita — Instrução Procedural (Tutorial)

**Resumo**: `tutorial` não responde uma pergunta como no [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)|arco de resolução]], nem fixa uma verdade como em [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)|definição/norma]] — ele ensina uma sequência de ações pra um humano seguir, do início ao fim, até chegar num resultado concreto.

> [!info] Isto é um modelo de referência, não uma fôrma rígida
> Um tutorial de 2 passos não precisa forçar uma seção "Armadilhas comuns" vazia — ela só entra quando existe algo real que já deu errado antes. O que não pode faltar é o leitor conseguir seguir o passo a passo sem travar em nenhum ponto.

## Contexto — por que este modelo é diferente dos outros

Pela definição já registrada em [[Estrutura e Convenções do Vault]], `tutorial` é "explicação passo a passo de um processo pra um humano seguir" — `status` fica sempre `ativa`, e quando o procedimento muda, a mesma nota é editada no lugar (nunca vira uma versão "obsoleta" guardada como histórico; se o procedimento parou de ser correto, a nota é apagada, não marcada). Isso é bem diferente de `checkpoint` (que guarda histórico de propósito, sessão por sessão) — um tutorial só existe enquanto reflete exatamente o jeito certo de fazer agora, sem rastro do jeito antigo.

## As seções, explicadas 1 a 1

### Resumo do resultado final (topo da nota)

Diz, em 2-3 linhas, o que o leitor vai conseguir fazer depois de seguir o tutorial até o fim — não o processo em si, o resultado dele. Isso importa porque um tutorial costuma ter nome parecido com outro (ex: "configurar X" vs "reconfigurar X depois de uma mudança") — o resumo evita o leitor seguir 8 passos até descobrir, no fim, que não era esse o tutorial que precisava.

### Pré-requisitos

O que precisa já estar pronto, instalado ou rodado antes do passo 1 — inclui acesso, versão de ferramenta, ou até outro tutorial que precisa ter sido seguido antes. Sem esta seção, o leitor trava no meio do passo a passo por falta de algo que devia ter sido resolvido antes de começar, e frequentemente não entende o motivo do erro, porque o problema não está no passo em que ele travou, está num passo anterior que nunca foi feito.

### Passos numerados

O corpo principal do tutorial — cada passo, em ordem, com o comando exato quando houver. Segue a regra 4 da hiper-didática à risca: cada comando fica em bloco de código próprio, nunca escondido dentro de frase, mesmo que seja 1 linha só. Um passo que só envolve clicar em algo (não rodar comando) ainda merece ser numerado e isolado — não misturado com o passo anterior ou seguinte.

### Como verificar que deu certo

Depois do último passo, como o leitor confirma que funcionou de verdade — não só que rodou sem erro, mas que o resultado esperado realmente aconteceu. Sem esta seção, o tutorial termina com o leitor incerto se deu tudo certo ou se só não apareceu erro na tela (que são coisas bem diferentes).

### Armadilhas comuns

O que já deu errado antes, de verdade, ao seguir este tutorial — e como evitar ou resolver. Só entra quando existe um caso real (a régua hiper-didática nunca pede exemplo hipotético quando existe um real disponível) — um tutorial novo, ainda sem histórico de erro, simplesmente não tem esta seção ainda.

### Relacionado

Outras notas conectadas — em especial, o `conceito` ou a `regra` que o tutorial pressupõe (ex: um tutorial de "como rodar a grade de precificação com cache" pressupõe entender o conceito de cache/invalidação usado nele).

## Exemplo real já existente no vault

[[Guia de Setup - Do Zero ao Primeiro Preco Calculado]] é o `tutorial` que a própria nota [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]] usa como fonte do exemplo de diagrama Mermaid (mostrando a ordem dos passos finais de setup) — vale abrir como referência de tom real, embora tenha sido escrito antes deste modelo existir, então não necessariamente segue esta ordem exata de seção.

## Exemplo completo (fictício, criado para este modelo)

[[Exemplo — Tutorial (Modelo de Demonstracao)]] — como rodar a grade de precificação já com o cache implementado em [[Exemplo — Checkpoint (Modelo de Demonstracao)]].

## Relacionado

- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Estrutura e Convenções do Vault]]
- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
