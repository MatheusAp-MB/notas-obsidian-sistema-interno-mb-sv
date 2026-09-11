---
tipo: duvida
dominio: python
status: em_aberto
criado: 11/09/2026
atualizado_em: 11/09/2026 10:02
relacionado: [Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML, Checkpoint - Inicio da Validacao Exaustiva de Precificacao]
---

# Dúvida: Margens Absurdas Aparecem Filtradas no Log de Recomendação de Precificação da Magazine

**Resumo**: durante a validação do [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML|bug do fallback de dimensão zero]] (11/09/2026), o log `[RECOMENDAÇÃO PRECIFICAÇÃO]` do MAGAZINE mostrou candidatos de margem absurdamente negativos sendo descartados — ex: MLB3974779415 com margem calculada de -1680008,20%. Já existe uma trava que filtra esses valores antes de qualquer preço errado vazar pro usuário, mas o motivo desses MLBs específicos gerarem um candidato tão fora da realidade ainda não foi investigado.

> [!question] EM ABERTO — achado incidental, não investigado ainda
> Encontrado olhando o log de saída do comando de recomendação de precificação, sem relação de causa direta com o bug de dimensão zero que estava sendo validado no momento — só apareceu na mesma sessão, no mesmo log. A trava existente já impede qualquer vazamento de preço errado — isso não é um bug ativo, é um sinal de que algo no dado ou na fórmula desses MLBs específicos está fora do esperado.

## Contexto

O comando de recomendação de precificação calcula, pra cada MLB do catálogo, um candidato de preço/margem e imprime o resultado no log `[RECOMENDAÇÃO PRECIFICAÇÃO]` durante a execução. Existe uma trava (mecanismo ainda não lido/detalhado nesta nota) que descarta candidatos com margem fora de qualquer faixa plausível, antes de esse valor chegar a ser usado ou exibido pro usuário final.

## A pergunta

Por que alguns MLBs do MAGAZINE (ex: MLB3974779415) geram um candidato de margem tão extremo (-1680008,20% no exemplo observado) a ponto de precisar ser descartado pela trava — é um problema de dado (custo, preço-base ou config de comissão desses MLBs específicos), um caso limite genuíno da fórmula (ex: divisão por um valor muito próximo de zero), ou outra causa ainda não mapeada?

## O que já se sabe até agora

- Só 1 exemplo concreto anotado até agora: MLB3974779415, margem calculada de -1680008,20% (MAGAZINE).
- A trava que filtra esses casos já existe e está funcionando — nenhum preço errado chega a vazar pro usuário.
- Não foi lido o código da trava nem da fórmula de recomendação ainda, nem levantado se são vários MLBs com o mesmo padrão ou um caso isolado — a origem exata (qual campo ou conta gera o valor extremo) não foi investigada.

## Relacionado

- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
