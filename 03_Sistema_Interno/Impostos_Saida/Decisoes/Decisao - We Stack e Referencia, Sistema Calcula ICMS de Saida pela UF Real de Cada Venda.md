---
tipo: decisao
dominio: 
status: concluida
criado: 10/09/2026
atualizado_em: 10/09/2026 09:47
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Estrutura da Planilha Busca Legal de Impostos de Saida, Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]
---

# Decisão: A Planilha We Stack é Referência de Cálculo — o Sistema Usa a UF Real de Destino de Cada Venda (Decisão)

**Resumo**: a planilha "Cálculo final We Stack" é referência do cálculo que roda no We Stack, sistema de terceiros — não é o resultado oficial nem uma especificação do Projeto Interno V2 (ver [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]). Quando essa funcionalidade for, no futuro, implementada no Projeto Interno V2, o cálculo do ICMS de Saída deve buscar a alíquota da UF de destino real de cada venda, em vez da média das 26 UFs que a planilha usa pra ilustrar a lógica.

> [!success] CONCLUÍDA — 10/09/2026
> A planilha "Cálculo final We Stack" continua servindo de referência pra entender como entrada, saída e Mercado Livre se combinam no cálculo de margem — mas o resultado oficial de qualquer venda sempre vai sair de um sistema de verdade (hoje, o We Stack), nunca da planilha, e esse cálculo precisa usar a alíquota da UF de destino real de cada venda, não uma média.

> [!info] Aplicação: escopo futuro do Projeto Interno V2, não o trabalho de agora
> Hoje (10/09/2026) o Projeto Interno V2 foca 100% em precificação — custo entra, preço de venda sai. O cálculo de margem/ICMS a recolher mostrado na planilha We Stack roda hoje no sistema de terceiros do mesmo nome, não no Projeto Interno V2. Esta decisão vale pra quando essa funcionalidade for absorvida aqui, no futuro — ver [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]].

## Contexto

Ao analisar a planilha "Cálculo final We Stack Doc 1.xlsx" — planilha de referência que junta dado de entrada (Sysemp) + saída (Busca Legal, ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]) + Mercado Livre pra mostrar o cálculo completo de margem de um produto — a fórmula da célula `AG5` ("ICMS Saída-Entrada", o ICMS líquido de uma venda) usava `AA5`, a média das 26 UFs de destino (excluindo a origem/SP), em vez da alíquota de 1 UF específica.

## A questão a decidir

Isso era intencional — a planilha calcula propositalmente uma margem média/estimada, válida pra qualquer venda — ou é uma limitação que precisa ser resolvida quando esse cálculo virar código real no sistema?

## O que levou à decisão

A dúvida surgiu porque a própria planilha, na célula `AL1`, tem um comentário dizendo que a tabela de alíquotas por UF "é usada para calcular lucratividade **após venda concluída**" — e uma venda concluída tem 1 estado de destino real e conhecido, não 26. Uma média entre UFs não reflete o ICMS exato daquela venda específica.

Perguntei diretamente, e a resposta esclarece o ponto: a planilha "Cálculo final We Stack" nunca teve o papel de gerar o resultado oficial de venda nenhuma — ela é referência, feita pra mostrar o raciocínio do cálculo (como entrada + saída + Mercado Livre se conectam) pra quem for implementar entender a lógica antes de codar. Por isso ela usa uma média: a planilha, sozinha, não tem como saber pra qual estado vai cada venda — ela é generalista por natureza. Quem vai saber o destino real de cada venda — e por isso quem tem que aplicar o cálculo específico, não a média — é o sistema.

## Decisão tomada

A planilha "Cálculo final We Stack" continua sendo usada como referência de cálculo daqui pra frente — a lógica de como PIS, COFINS e ICMS de saída se combinam com o custo de entrada e os dados do Mercado Livre pra chegar na margem, mostrada por ela, é válida e serve de base pra implementação. Mas ela não é, e não vai ser, a fonte do resultado oficial de nenhuma venda.

Quando o Projeto Interno V2 implementar esse cálculo de verdade — no futuro, já que hoje o foco aqui é só precificação (custo→preço), ver [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]] — ele precisa buscar a alíquota de ICMS da UF de destino real de cada venda — 1 das 27 colunas do bloco "ICMS SAÍDA POR UF DE DESTINO" (ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]) — em vez de usar a média das 26 UFs. A média fica restrita à planilha, como recurso pra ilustrar o cálculo sem depender de saber o destino de uma venda específica.

## Exemplo / consequência

Uma venda do mesmo produto (ex: o "ANDADOR PARA IDOSO ADULTO..." usado como exemplo na planilha) pra 2 estados diferentes — digamos SP e AM — vai ter 2 valores de ICMS de saída diferentes no sistema real, cada um usando a alíquota exata daquele estado de destino. Na planilha de referência, as duas vendas apareceriam com o mesmo `ICMS (Saída-Entrada)`, porque ali o cálculo usa a média — isso é esperado e aceitável dentro da planilha, mas nunca deve se repetir no cálculo real do sistema.

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]
