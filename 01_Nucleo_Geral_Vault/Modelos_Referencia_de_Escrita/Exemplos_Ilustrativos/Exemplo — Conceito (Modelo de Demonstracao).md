---
tipo: conceito
dominio: python
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Definicao e Norma (Conceito, Regra), Exemplo — Regra (Modelo de Demonstracao), Exemplo — Bug Conhecido (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo conceito — define o que é um "watermark de sincronização" e por que essa estratégia foi escolhida em vez de alternativas mais simples.
---

# O que é um Watermark de Sincronização (Conceito)

**Resumo**: watermark de sincronização é o registro que guarda até onde a última busca de dados externos já cobriu, pra próxima busca continuar exatamente dali. É a base do bug fictício em [[Exemplo — Bug Conhecido (Modelo de Demonstracao)]] e da regra de cache em [[Exemplo — Regra (Modelo de Demonstracao)]].

> [!warning] Isto é uma nota-modelo, não a definição oficial do sistema real
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)]]. O conceito de watermark aqui é genérico e simplificado, pensado só pra sustentar os outros exemplos fictícios da mesma família de notas.

## Contexto

Sempre que um sistema precisa buscar dados de outro sistema (uma API externa, um banco de terceiro) repetidamente ao longo do tempo — em vez de só 1 vez — surge a mesma pergunta: da próxima vez que essa busca rodar, desde quando ela deve buscar? Buscar tudo de novo desde o início seria enorme desperdício de tempo e processamento; perguntar pro usuário toda vez seria trabalho manual repetitivo e sujeito a erro. É pra resolver exatamente essa pergunta que existe o conceito de watermark.

## O que é

Um **watermark de sincronização** é um valor guardado no banco (tipicamente uma data/hora) que registra até onde a última execução de uma busca já cobriu. A cada nova execução, o sistema lê esse valor, busca só o que veio depois dele, e — se tudo correu bem — atualiza o valor pro horário do dado mais recente que acabou de importar. Da próxima vez, o ciclo se repete a partir do novo valor. É o mesmo princípio de um marcador de página: você não relê o livro inteiro toda vez que volta a ler, só continua de onde parou.

## Por que essa estratégia e não outra

Duas alternativas mais simples foram consideradas (de forma genérica, pra qualquer sistema que enfrente este problema) e descartadas:

- **Buscar tudo de novo, sempre**: simples de implementar, mas o custo cresce sem limite conforme a quantidade de dados aumenta — depois de meses de uso, uma busca que levava segundos passa a levar minutos, buscando repetidamente o que já foi importado há muito tempo.
- **Pedir a data manualmente a cada execução**: evita o desperdício de reprocessar tudo, mas depende de alguém lembrar (e acertar) a data certa toda vez — um erro humano aqui (esquecer de atualizar, ou informar a data errada) tanto pode deixar dados de fora quanto duplicar dados já importados.

O watermark resolve os dois problemas ao mesmo tempo: nunca reprocessa o que já foi importado, e nunca depende de alguém lembrar de nada — o próprio sistema guarda e atualiza esse controle sozinho.

## Exemplo

No sistema fictício descrito em [[Exemplo — Bug Conhecido (Modelo de Demonstracao)]], o watermark é um campo de data/hora gravado depois de cada execução do comando de sincronização — e o bug documentado ali aconteceu justamente porque esse valor estava sendo gravado no fuso horário errado, o que é um jeito bem concreto de mostrar como um watermark mal implementado quebra a garantia que ele deveria dar (nunca perder nem duplicar dado).

## Relacionado

- [[Modelo de Escrita — Definicao e Norma (Conceito, Regra)]]
- [[Exemplo — Regra (Modelo de Demonstracao)]]
- [[Exemplo — Bug Conhecido (Modelo de Demonstracao)]]
