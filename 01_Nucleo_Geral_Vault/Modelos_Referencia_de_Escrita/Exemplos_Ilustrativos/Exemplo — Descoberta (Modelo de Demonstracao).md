---
tipo: descoberta
dominio: python
status: confirmada
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Exemplo — Checkpoint (Modelo de Demonstracao), Exemplo — Decisao (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo descoberta — o cache da grade de precificação não reduz carga nenhuma pra produtos de frete variável, achado durante a implementação registrada no checkpoint.
---

# O Cache da Grade de Precificação Não Reduz Carga Nenhuma Pros Produtos de Frete Variável (Descoberta)

**Resumo**: durante os testes da sessão de 20/07/2026 do checkpoint [[Exemplo — Checkpoint (Modelo de Demonstracao)]], confirmado que produtos de frete variável (recalculado por transportadora a cada consulta) invalidam o próprio cache a cada consulta — o cache implementado em [[Exemplo — Decisao (Modelo de Demonstracao)]] não ajuda esse grupo.

> [!warning] Isto é uma nota-modelo, não uma descoberta real do sistema
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]].

## Contexto

O cache de grade de precificação implementado em [[Exemplo — Decisao (Modelo de Demonstracao)]] guarda o resultado do cálculo completo — custo, frete, taxas e margem — e só invalida quando o custo do produto muda. Durante os testes da sessão de 20/07/2026 (ver [[Exemplo — Checkpoint (Modelo de Demonstracao)]]), o cache foi testado também com produtos cujo frete não é um valor fixo, e sim recalculado a cada consulta por uma cotação em tempo real com a transportadora (frete variável).

## O que se observou

Nos 5 produtos de frete fixo testados anteriormente, o cache funcionou como esperado: a segunda consulta ao mesmo produto, dentro das 24 horas e sem alteração de custo, retornou o resultado guardado sem recalcular nada. Já nos 3 produtos de frete variável testados nesta sessão, toda consulta — mesmo minutos depois da anterior, sem nenhuma alteração de custo — disparou um recálculo completo, como se o cache não existisse.

## Como foi confirmado

Comparando o log de execução das 2 situações lado a lado:

| Situação | 1ª consulta | 2ª consulta (2 minutos depois) | Cache usado na 2ª? |
|---|---|---|---|
| Produto de frete fixo (K-430) | Recalcula (nenhum cache ainda) | Retorna do cache, sem recalcular | Sim |
| Produto de frete variável (SB-630) | Recalcula (nenhum cache ainda) | Recalcula de novo, mesmo com cache presente | Não |

Investigando o código do cálculo, a causa ficou clara: a função que calcula o frete variável já embute, internamente, uma cotação em tempo real com timestamp próprio — e esse timestamp entra no resultado final da grade. Como o resultado muda a cada chamada (mesmo sem nenhum dado de negócio ter mudado de verdade), o mecanismo de cache — que compara se o resultado guardado é idêntico ao que seria calculado agora — nunca encontra 2 resultados iguais pra esse grupo, e por isso sempre recalcula.

## Por que isso importa

O cache implementado em [[Exemplo — Decisao (Modelo de Demonstracao)]] não está quebrado — ele funciona exatamente como decidido, pros produtos onde a decisão foi pensada e testada (frete fixo). Mas ele silenciosamente não traz nenhum benefício pros produtos de frete variável, sem gerar erro nem aviso — o que só foi percebido porque o teste comparou os 2 grupos lado a lado, não porque o sistema avisou sozinho. Isso deixou em aberto, no checkpoint, a pergunta de como tratar esse segundo grupo — talvez cacheando só a parte do cálculo que não depende da cotação de frete, mas essa solução ainda não foi implementada nem decidida.

## Relacionado

- [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]]
- [[Exemplo — Checkpoint (Modelo de Demonstracao)]]
- [[Exemplo — Decisao (Modelo de Demonstracao)]]
