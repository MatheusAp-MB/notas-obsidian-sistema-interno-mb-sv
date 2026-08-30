---
tipo: regra
dominio:
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:15
relacionado:
  - Os 9 Tipos de Nota
  - Modelo de Escrita — Arco de Resolucao (Decisao
  - Descoberta
  - Bug Conhecido
  - Duvida)
  - Exemplo — Duvida (Modelo de Demonstracao)
  - Exemplo — Decisao (Modelo de Demonstracao)
resumo: "Dúvida resolvida nunca vira decisão na mesma nota — gera nota nova `tipo: decisao`, e a dúvida original só muda `status` pra `resolvida`, preservando o histórico; bug corrigido, ao contrário, fica na mesma nota, ganhando uma seção `## Correção` quando o `status` muda pra `corrigido`."
---

# Ciclo de Vida de Dúvida e Bug Conhecido

**Resumo**: Dúvida resolvida nunca vira decisão na mesma nota — gera nota nova `tipo: decisao`, e a dúvida original só muda `status` pra `resolvida`, preservando o histórico; bug corrigido, ao contrário, fica na mesma nota, ganhando uma seção `## Correção` quando o `status` muda pra `corrigido`.

## Contexto

`duvida` e `bug_conhecido` são os 2 únicos tipos, entre os 9 (ver [[Os 9 Tipos de Nota]]), cujo `status` sai de um estado "aberto" pra um estado "resolvido" — e é justamente por isso que surge a pergunta prática: quando isso acontece, o que fazer com a nota? Reescrever ela por cima, apagando o estado anterior? Gerar uma nota nova? Esta regra fixa a resposta pros 2 casos — e a resposta é diferente pra cada um, por um motivo real.

## O que diz

**Dúvida resolvida**: nunca edita a nota de dúvida virando decisão. Gera uma nota **nova**, `tipo: decisao`, com a resposta e o motivo, linkada de volta via `relacionado`. A dúvida original muda `status` de `em_aberto` para `resolvida` e continua existindo — é o registro de "isso foi incerto até tal data, aqui está o que resolveu", útil se um caso parecido aparecer depois.

**Bug corrigido**: a mesma nota ganha uma seção `## Correção` (o que foi feito, quando) e `status` muda de `em_aberto` para `corrigido`. Não gera nota nova — causa e correção ficam juntas no mesmo lugar.

## Por que é assim e não de outro jeito

Os 2 casos parecem simétricos na superfície (ambos vão de "aberto" pra "resolvido"), mas o motivo de tratar diferente é real, não arbitrário. Uma dúvida é, por natureza, uma pergunta em aberto — o valor de registrar como ela se manifestou, o que já se sabia antes de resolver, existe independente da resposta final; gerar uma nota nova pra decisão preserva os 2 momentos (a pergunta como ela era, e a resposta como ela ficou) sem misturar um no outro. Já um bug é, desde o início, um problema com uma causa raiz que existe objetivamente, mesmo antes de ser encontrada — causa e correção são 2 metades da mesma história técnica, e forçar elas em 2 notas separadas fragmentaria uma investigação que só faz sentido lida de ponta a ponta.

A alternativa de reescrever a dúvida por cima (apagando o estado "em aberto" e substituindo pela resposta) foi descartada porque perde justamente o que se sabia ANTES de resolver — informação que pode ser valiosa se uma dúvida parecida aparecer no futuro e alguém quiser comparar como o raciocínio evoluiu daquela vez.

## Exemplo

O par [[Exemplo — Duvida (Modelo de Demonstracao)]] + [[Exemplo — Decisao (Modelo de Demonstracao)]] mostra o ciclo de dúvida completo: a mesma pergunta fictícia ("vale a pena cachear a grade de precificação por 24h?") primeiro registrada como dúvida (`status: em_aberto`), depois resolvida — a dúvida ganha um callout `[!success]` no topo linkando pra decisão nova, mas todo o conteúdo original (contexto, pergunta, o que já se sabia) continua intacto embaixo.

[[Exemplo — Bug Conhecido (Modelo de Demonstracao)]] mostra o ciclo de bug completo dentro de 1 nota só: o problema, o raciocínio de investigação, e a correção final (com código ANTES/DEPOIS) todos na mesma nota, com `status: corrigido` desde que a correção foi aplicada.

## Relacionado

- [[Os 9 Tipos de Nota]]
- [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]]
- [[Exemplo — Duvida (Modelo de Demonstracao)]]
- [[Exemplo — Decisao (Modelo de Demonstracao)]]
