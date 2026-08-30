---
tipo: duvida
dominio: python
status: resolvida
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Exemplo — Decisao (Modelo de Demonstracao), Exemplo — Regra (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo duvida — pergunta fictícia sobre se compensa cachear a grade de precificação por 24 horas — já resolvida em [[Exemplo — Decisao (Modelo de Demonstracao)]]; mostra o ciclo completo de 2 notas (dúvida + decisão nova), preservando o rastro de quando a pergunta ainda estava em aberto.
---

# Vale a Pena Cachear o Resultado da Grade de Precificação por 24 Horas? (Dúvida)

**Resumo**: pergunta fictícia sobre se compensa cachear a grade de precificação por 24 horas — já resolvida em [[Exemplo — Decisao (Modelo de Demonstracao)]]; mostra o ciclo completo de 2 notas (dúvida + decisão nova), preservando o rastro de quando a pergunta ainda estava em aberto.

> [!warning] Isto é uma nota-modelo, não uma dúvida real do sistema
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]] — em especial o caso especial de dúvida, que nunca vira decisão na mesma nota.

> [!success] RESOLVIDA — a resposta está em nota separada, não aqui
> Esta dúvida foi resolvida pela decisão registrada em [[Exemplo — Decisao (Modelo de Demonstracao)]]: sim, vale cachear por 24 horas, desde que exista invalidação explícita quando o custo do produto mudar (ver [[Exemplo — Regra (Modelo de Demonstracao)]]). O raciocínio completo — alternativas consideradas, motivo da escolha — mora na nota de decisão, não aqui. Esta nota continua existindo como registro de como a dúvida surgiu e do que já se sabia antes de ser resolvida.
>
> **Isto é o ponto central deste exemplo**: repare que esta nota não foi reescrita como se fosse a decisão — ela só ganhou este callout no topo e teve `status` trocado de `em_aberto` para `resolvida`. Tudo que vem abaixo é exatamente o que esta nota dizia **antes** de ser resolvida, preservado sem edição.

## Contexto

O cálculo da grade de precificação (a função fictícia `calcular_grade_precificacao_ml`, usada como exemplo em [[Exemplo — Regra (Modelo de Demonstracao)]]) é uma operação custosa — soma custo do produto, frete, taxas de cada marketplace e margem desejada, e roda em milissegundos, mas é chamada repetidamente sempre que a mesma tela de precificação é aberta por qualquer usuário. Isso levantou uma pergunta prática: será que compensa guardar o resultado por um tempo, em vez de recalcular do zero a cada chamada?

## A pergunta

Cachear a grade de precificação por 24 horas reduz carga o suficiente pra valer a complexidade extra de gerenciar um cache — ou o ganho é pequeno demais perto do risco de mostrar um preço desatualizado?

## O que já se sabia até este ponto

Antes de qualquer decisão, 2 coisas já eram conhecidas:

- O cálculo em si é rápido (poucos milissegundos por produto), então o ganho de performance não viria de "cada cálculo individual ficar mais rápido", e sim de "reduzir quantas vezes ele roda no total", quando muitos usuários abrem a mesma tela de precificação no mesmo produto.
- O custo de um produto muda com pouca frequência (normalmente 1 vez a cada poucos dias, quando o fornecedor reajusta), o que sugeria que um cache de algumas horas não deveria mostrar preço errado na maior parte do tempo — mas isso ainda precisava ser confirmado, não bastava supor.

## Relacionado

- [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]]
- [[Exemplo — Decisao (Modelo de Demonstracao)]]
- [[Exemplo — Regra (Modelo de Demonstracao)]]
