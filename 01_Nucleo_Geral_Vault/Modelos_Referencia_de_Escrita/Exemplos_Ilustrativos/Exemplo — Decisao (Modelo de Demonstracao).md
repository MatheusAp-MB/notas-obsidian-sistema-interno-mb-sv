---
tipo: decisao
dominio: python
status: concluida
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Exemplo — Duvida (Modelo de Demonstracao), Exemplo — Regra (Modelo de Demonstracao), Exemplo — Checkpoint (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo decisao — resolve a dúvida em [[Exemplo — Duvida (Modelo de Demonstracao)]] sobre cachear a grade de precificação: sim, por 24 horas, com invalidação automática sempre que o custo do produto for alterado, com as alternativas consideradas e descartadas antes da escolha final (seguindo [[Exemplo — Regra (Modelo de Demonstracao)]]).
---

# Decisão: Cachear a Grade de Precificação por 24h com Invalidação Explícita ao Alterar Custo (Decisão)

**Resumo**: resolve a dúvida em [[Exemplo — Duvida (Modelo de Demonstracao)]] sobre cachear a grade de precificação: sim, por 24 horas, com invalidação automática sempre que o custo do produto for alterado, com as alternativas consideradas e descartadas antes da escolha final (seguindo [[Exemplo — Regra (Modelo de Demonstracao)]]).

> [!warning] Isto é uma nota-modelo, não uma decisão real do sistema
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]].

> [!success] CONCLUÍDA — decisão tomada e implementação iniciada
> Cache de 24 horas, com invalidação automática ao alterar o custo do produto. A implementação está registrada em [[Exemplo — Checkpoint (Modelo de Demonstracao)]] (ainda em andamento no momento em que este exemplo foi escrito).

## Contexto

Esta nota resolve a pergunta registrada em [[Exemplo — Duvida (Modelo de Demonstracao)]]: vale a pena cachear o resultado do cálculo de grade de precificação por 24 horas? Antes de decidir, era preciso confirmar 2 coisas que a dúvida original só supunha: o quanto o cache reduziria a carga de cálculo na prática, e o quanto o risco de mostrar um preço desatualizado era real.

## A questão a decidir

Cachear a grade de precificação — e, se sim, por quanto tempo e com qual regra de invalidação, já que a alternativa de "cache sem invalidação nenhuma" está proibida por [[Exemplo — Regra (Modelo de Demonstracao)]].

## O que levou à decisão — alternativas consideradas e descartadas

| Alternativa | Descrição | Por que foi descartada |
|---|---|---|
| Sem cache (situação atual) | Recalcular a grade toda vez que a tela é aberta | Medido em ambiente de teste: com 20 usuários abrindo a mesma tela de produto no mesmo minuto, o cálculo repetido consumia processamento equivalente a recalcular o produto inteiro 20 vezes, quando 1 vez bastaria |
| Cache de 1 hora | Reduz recálculo, mas expira rápido | Ainda gerava recálculo repetido nos picos de uso (início da manhã, quando vários usuários abrem o sistema ao mesmo tempo) — o ganho medido foi pequeno demais pra justificar a complexidade extra |
| Cache infinito, sem prazo nem invalidação | Elimina recálculo quase por completo | Proibido diretamente por [[Exemplo — Regra (Modelo de Demonstracao)]] — cache sem estratégia de invalidação explícita nunca é aceito, mesmo que resolva o problema de performance, porque troca um problema visível (lentidão) por um invisível (preço errado sem ninguém perceber) |
| **Cache de 24h + invalidação automática ao alterar custo (escolhida)** | Reduz recálculo nos picos de uso, e nunca serve preço desatualizado quando o motivo mais comum de mudança (custo do produto) acontece | Nenhuma desvantagem restante identificada até o momento — ver "Em aberto" em [[Exemplo — Checkpoint (Modelo de Demonstracao)]] para o que ainda está sendo validado na prática |

## Decisão tomada

A grade de precificação passa a ser cacheada por até 24 horas por produto, e o cache é invalidado imediatamente (não espera o prazo de 24h) sempre que o custo daquele produto é alterado no sistema — nunca depende de alguém rodar um comando manual pra limpar o cache.

## Exemplo / consequência

Um produto com custo alterado às 14h tem seu cache de grade de precificação invalidado no mesmo instante — a próxima consulta já recalcula com o custo novo, mesmo que o cache anterior ainda estivesse dentro das 24 horas. Um produto sem nenhuma alteração de custo mantém o mesmo resultado cacheado por até 24 horas, reduzindo o recálculo repetido nos horários de pico de acesso.

## Relacionado

- [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]]
- [[Exemplo — Duvida (Modelo de Demonstracao)]]
- [[Exemplo — Regra (Modelo de Demonstracao)]]
- [[Exemplo — Checkpoint (Modelo de Demonstracao)]]
