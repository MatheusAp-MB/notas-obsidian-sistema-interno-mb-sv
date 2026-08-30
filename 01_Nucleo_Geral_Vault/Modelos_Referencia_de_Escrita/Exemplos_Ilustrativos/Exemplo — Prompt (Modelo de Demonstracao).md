---
tipo: prompt
dominio: python
status: validado
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Artefato de Uso Direto (Prompt), Exemplo — Regra (Modelo de Demonstracao), Exemplo — Checkpoint (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo prompt — pede pro Claude auditar se a implementação do cache respeita a regra de invalidação explícita, com exemplo de execução real.
---

# Prompt: Auditoria de Invalidação de Cache da Grade de Precificação (Prompt)

**Resumo**: use este prompt sempre que uma nova função de cache for adicionada ao sistema de precificação, pra confirmar que ela respeita a regra registrada em [[Exemplo — Regra (Modelo de Demonstracao)]] (todo cache precisa de invalidação explícita, nunca silenciosa).

> [!warning] Isto é uma nota-modelo, não um prompt real do sistema
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Artefato de Uso Direto (Prompt)]].

> [!success] VALIDADO — testado contra a implementação de exemplo
> Rodado 1 vez contra o código fictício de [[Exemplo — Checkpoint (Modelo de Demonstracao)]] (ver "Exemplo de execução real" abaixo), com resultado correto: identificou a falha real de cobertura em produtos de frete variável.

## O prompt

```
Você vai auditar uma implementação de cache no repositório, procurando por violações da regra
"todo cache precisa de estratégia de invalidação explícita, nunca silenciosa".

Para cada função que guarda resultado em cache (ex: dicionário, variável de módulo, ou
decorator de cache) que encontrar em {{caminho_do_arquivo}}:

1. Identifique se existe prazo de expiração documentado (ex: TTL, timeout) OU gatilho de
   invalidação direto (uma função ou sinal que limpa o cache quando o dado de origem muda).
2. Se nenhum dos dois existir, reporte como violação, citando o nome da função e a linha exata.
3. Se existir só o prazo de expiração, verifique se há algum caminho de código onde o dado de
   origem muda sem passar pelo gatilho de invalidação — reporte como risco, mesmo não sendo
   violação direta da regra.
4. Para cada violação ou risco encontrado, sugira a forma mínima de correção, sem reescrever
   a função inteira.

Não assuma nada sobre partes do código que não conseguir ler — se precisar de mais contexto
pra confirmar um caso, diga exatamente o que falta em vez de supor.
```

## Como usar

Preencha `{{caminho_do_arquivo}}` com o caminho real do arquivo ou pasta a auditar antes de rodar. Funciona melhor rodado depois de qualquer mudança relevante numa função de cache — não precisa de nenhum outro contexto de conversa aberto antes.

## Exemplo de execução real

Rodado (de forma fictícia, pra este exemplo) contra o código de [[Exemplo — Checkpoint (Modelo de Demonstracao)]], o prompt identificou corretamente que a função de cache tem invalidação explícita (prazo de 24h + gatilho de alteração de custo, conforme [[Exemplo — Regra (Modelo de Demonstracao)]]), mas reportou como risco o caso dos produtos de frete variável — mesmo sem violar a regra ao pé da letra (o cache "existe" com prazo documentado), o resultado nunca bate por causa do timestamp interno do cálculo de frete, e por isso o cache nunca é reaproveitado nesse grupo. Esse resultado bate exatamente com o que foi descoberto manualmente em [[Exemplo — Descoberta (Modelo de Demonstracao)]] — confirmando que o prompt identifica o mesmo tipo de problema que a investigação manual encontrou.

## Relacionado

- [[Modelo de Escrita — Artefato de Uso Direto (Prompt)]]
- [[Exemplo — Regra (Modelo de Demonstracao)]]
- [[Exemplo — Checkpoint (Modelo de Demonstracao)]]
