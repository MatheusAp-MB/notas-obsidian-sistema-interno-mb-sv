---
tipo: conceito
dominio: 
status: ativa
criado: 27/09/2026
atualizado_em: 27/09/2026 03:08
relacionado: [Reducao de Comandos de Management e Rotina Vira Botao, Sistema Interno V2 Sera a Fonte da Verdade - Papel, Motivo e Limitacao de Cada Fonte de Precificacao, Padrao de Qualidade e Clareza Estrutural do Repositorio, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
resumo: A partir de 27/09/2026, por instrução direta do superior de Matheus, o Sistema Interno V2 passa a ser tratado como produto real de uma empresa de tecnologia competindo por espaço de mercado, não mais só "projeto interno válido". 4 pilares passam a valer sempre — qualidade extrema, documentação completa, validação real com dado real, resolução de verdade do problema do cliente. Matheus pediu explicitamente que Claude cobre esses 4 pontos ativamente, mesmo sem ser provocado — vale nos dois sentidos.
---

# Sistema Interno V2 É um Produto Real — Padrão Máximo de Qualidade, Documentação, Validação e Resolução Real do Cliente

**Resumo**: A partir de 27/09/2026, o Sistema Interno V2 deixa de ser tratado como "projeto interno válido" e passa a ser tratado, por decisão explícita do superior de Matheus, como um produto real de uma empresa de tecnologia competindo por espaço de mercado. Isso muda o padrão de exigência de tudo que for construído daqui pra frente: qualidade extrema, documentação completa, validação real (nunca "parece que funciona") e resolução de verdade do problema do cliente — não só entrega funcional. Matheus pediu explicitamente que Claude cobre esse padrão ativamente, inclusive sem ser provocado.

## Contexto — a origem da mudança (27/09/2026)

O sistema já vinha crescendo em relevância (ver [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]] e [[Sistema Interno V2 Sera a Fonte da Verdade - Papel, Motivo e Limitacao de Cada Fonte de Precificacao]]), mas o ponto de virada foi uma instrução direta do superior de Matheus, relatada por ele nestes termos:

> "não pense que está fazendo para mim... pense que você é o dono de uma empresa de tecnologia dona desse sistema, e você precisa fazer as pessoas pagarem por ele, usarem ele, ficarem satisfeitas com ele, e escolherem o seu sistema ao invés de qualquer outro da concorrência... pense que você precisa me entregar algo útil e que resolva meu problema de forma que eu queira pagar para ter o sistema."

Matheus confirmou explicitamente: "a partir de hoje o sistema é de fato um produto e deve ser tratado como tal", com o pensamento de "somos donos de uma empresa de tecnologia competindo por espaço de mercado e precisando fazer o melhor produto possível para resolver as dores do cliente a ponto dele querer nos pagar pelo nosso sistema." Ele foi explícito: essa nota não é "mais uma nota" — precisa ter peso, e guiar o trabalho daqui pra frente.

## O que isso significa na prática — os 4 pilares

1. **Qualidade extrema.** Nenhuma solução é aceitável só porque "funciona hoje, com o dado de hoje". O padrão é o mesmo que um produto pago exigiria: tratamento de erro real, sem gambiarra, sem duplicação de lógica — os achados concretos em [[Reducao de Comandos de Management e Rotina Vira Botao]] (comandos duplicados, convenções de nome inconsistentes, decisões antigas nunca aplicadas) já eram sintoma exatamente disso, antes mesmo desta decisão existir formalmente.
2. **Documentação completa.** Toda decisão, todo comando, todo fluxo de dado precisa estar anotado em algum lugar rastreável (este vault) — não pode existir conhecimento que só existe na cabeça de Matheus ou de Claude. Conecta direto com o motivo original da própria [[Reducao de Comandos de Management e Rotina Vira Botao]] (comandos "soltos", sem anotação em lugar nenhum).
3. **Validação real.** "Parece que funciona" não é validação — validação é rodar com dado real, comparar contra a fonte de verdade, e confirmar de ponta a ponta antes de considerar algo resolvido (mesmo padrão já seguido em descobertas anteriores deste vault, ex: [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]]).
4. **Resolução real do problema do cliente.** O critério de "pronto" não é "o código rodou sem erro" — é "isso resolve de verdade a dor de quem vai usar o sistema". Antes de fechar qualquer entrega, a pergunta correta passa a ser: isso é bom o suficiente pra alguém escolher pagar por ele em vez de usar a concorrência?

## Método de trabalho: polir por frente, nunca reescrita única (27/09/2026)

Confirmado por Matheus no mesmo dia: ter um monólito hoje está certo — o problema nunca foi "monólito", foi "monólito malcuidado". A base já existe (cada parte do sistema já vive isolada em módulo/app próprio, prática que Matheus já vinha seguindo antes mesmo desta decisão) — o que falta não é arquitetura nova, é higiene: remover ambiguidade, duplicata e código morto do que já existe.

Isso é feito com calma, aos poucos, por frente — nunca como um projeto único de "arrumação geral" ou reescrita de uma vez. Toda vez que uma frente específica (Frete, Comissão, Impostos, Agenda de Vídeos etc.) for tocada por outro motivo, o polimento daquela frente entra junto, como parte do mesmo trabalho.

Alvos concretos já identificados, prontos pra serem resolvidos na próxima vez que a frente correspondente for tocada (ver [[Reducao de Comandos de Management e Rotina Vira Botao]] pro levantamento completo):

- `importar_promocoes_ml` morto e comentado dentro de `popular_banco.py` desde 15/08/2026, nunca removido de verdade.
- Scripts de origem do Frete Real e da Comissão Real (`investigar_frete_real_anuncio.py`, `comparar_comissao_real_vs_flat_via_api.py`) ainda soltos em `scripts_exploracao_ML/`, ao lado dos comandos oficiais que nasceram deles.
- `validar_classificacao` abandonado, sem decisão se fica ou sai.
- Renomeios `DEV_` (`resetar_agenda_videos`, `investigar_campos_api`) decididos em 15/08/2026 mas nunca aplicados no código.
- Convenção de nome inconsistente entre os 2 orquestradores (`Sincronizar_Impostos_de_Saida` em PascalCase vs. `calcular_todas_as_grades_precificacao` em snake_case).

A reformulação em microsserviços (ver seção abaixo) continua sendo trabalho de outra escala de complexidade, pedido a Matheus (não iniciativa dele) e deliberadamente adiado — não é a prioridade agora, e não deve ser confundida com este polimento incremental.

## O pedido explícito de Matheus a Claude — cobrança mútua

Matheus pediu, de forma explícita, que Claude o **cobre** ativamente nesses 4 pontos — não só meça a própria qualidade das respostas, mas também aponte quando ele (Matheus) estiver prestes a aceitar um atalho que fura esse padrão. Na prática, isso significa que Claude deve, sem esperar ser perguntado:

- Apontar quando uma solução proposta (por Claude ou por Matheus) está "funcional" mas não está no nível de um produto real — mesmo que ninguém tenha pedido essa avaliação.
- Recusar, ou pelo menos sinalizar claramente, fechar algo como "pronto" sem a documentação correspondente no vault.
- Insistir em validação com dado real antes de considerar qualquer coisa resolvida, mesmo sob pressão de tempo.
- Perguntar, quando fizer sentido, se a solução realmente resolve o problema de quem usa o sistema — não só se ela "compila"/"roda".
- Isso vale igualmente para Claude: as próprias entregas de Claude (diffs, catálogos, notas de vault) precisam seguir o mesmo padrão de rigor — este documento cobra dos dois lados, não é só uma régua pra medir Matheus.

## Relação com o momento atual do projeto (nuvem + webhook ML + microsserviços)

Essa decisão chega junto com 3 mudanças estruturais grandes já em curso: hospedagem em nuvem (previsão de até 2 semanas a partir de 27/09/2026), integração via webhook do Mercado Livre, e a reformulação completa do projeto pra arquitetura de microsserviços. As 3 tornam esse padrão de exigência ainda mais concreto — um sistema em produção na nuvem, recebendo webhook de um parceiro externo (ML), decomposto em múltiplos serviços independentes, tem tolerância zero pros tipos de duplicidade e desorganização já documentados em [[Reducao de Comandos de Management e Rotina Vira Botao]]. Este documento passa a orientar toda decisão de arquitetura, nomenclatura e prioridade daqui pra frente — inclusive durante a reformulação em microsserviços.

## Relacionado

- [[Reducao de Comandos de Management e Rotina Vira Botao]]
- [[Sistema Interno V2 Sera a Fonte da Verdade - Papel, Motivo e Limitacao de Cada Fonte de Precificacao]]
- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
