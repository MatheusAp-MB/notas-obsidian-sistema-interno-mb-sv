---
tipo: conceito
dominio: 
status: ativa
criado: 12/09/2026
atualizado_em: 12/09/2026 02:37
relacionado: [Dois Sistemas Paralelos - Projeto Interno V2 e We Stack, Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema, Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes), Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]
resumo: Cada uma das 3 fontes de precificação (planilha do superior, Sistema Interno V2, planilha da We Stack) tem um papel, motivo e limitação diferente — não são 3 fontes concorrentes de mesmo peso. Dado extremamente importante: uma vez validado pelo superior e pelo financeiro/tributário, o Sistema Interno V2 vira a fonte da verdade — é ele quem passa a ditar se a We Stack está correta (não o contrário), e assume 100% o papel de precificação, abandonando a planilha do superior.
---

# Sistema Interno V2 Será a Fonte da Verdade — Papel, Motivo e Limitação de Cada Fonte de Precificação

**Resumo**: cada uma das 3 fontes de precificação (planilha do superior, Sistema Interno V2, planilha da We Stack) tem um papel, motivo e limitação diferente — não são 3 fontes concorrentes de mesmo peso, e comparar divergências entre elas sem entender isso leva a conclusões erradas sobre "quem está certo". Dado extremamente importante: uma vez validado pelo superior e pelo financeiro/tributário, o **Sistema Interno V2 vira a fonte da verdade** — é ele quem passa a ditar se a We Stack está correta (não o contrário), e assume 100% o papel de precificação de produtos, abandonando a planilha do superior.

## Contexto

Ao comparar diretamente a planilha da We Stack ("Doc refeita") com a planilha do superior em busca de "inconsistências graves" entre elas, Matheus interrompeu a análise para corrigir o enquadramento: as 3 fontes não são pontos de vista equivalentes sobre a mesma pergunta, cada uma existe por um motivo diferente e tem uma limitação própria. Essa nota registra essa explicação, dada por Matheus em 12/09/2026, para orientar toda comparação futura entre essas 3 fontes.

## O que é (papel de cada fonte)

### Planilha do superior

Foi a primeira versão pensada para precificar produtos — o caminho é "preço → margem": dado um preço, ela diz se esse preço é válido de acordo com a margem mínima aceitável. É funcional e serve de referência, mas é limitada pela própria capacidade do Excel: várias coisas nela são simplificadas e reduzidas porque não havia como puxar dados automaticamente, não dava para deixar densa sem ficar pesada, e não havia controle fino sobre a forma de exibição. É simples e limitada justamente por ser Excel — não por escolha de design.

Essa planilha **será abandonada** quando o Sistema Interno V2 for validado (ver seção "Dado extremamente importante" abaixo).

### Sistema Interno V2

Pretende substituir 100% a planilha do superior — automatizando completamente o processo e aumentando a robustez e a densidade das informações usadas no cálculo de precificação.

O motivo de existir é resolver uma dor concreta que a planilha do superior não resolvia bem: "dada a margem X, me dê o preço Y" — o caminho inverso, "margem → preço". Isso só era possível no Excel via VBA, mas sem resultados constantes nem de forma prática. O Sistema Interno V2 resolve isso via Goal Seek (ver [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]).

### Planilha da We Stack

**Não é o produto final** nem uma referência de cálculo paralela — é um documento de ensino. A We Stack é uma empresa terceira com um sistema próprio, que pretende automatizar funções no Mercado Livre (entre elas a Central de Promoções e uma central de lucratividade). Essa planilha foi feita apenas para mostrar a eles a lógica interna e a forma de pensar da empresa — não é a We Stack quem gera o preço final.

O que de fato importa para a We Stack aprender com essa planilha:
- Quais são os impostos de entrada e como são calculados.
- Quais são os impostos de saída e como são calculados.
- Quais outros valores influenciam a margem de lucro e como são calculados.

Com isso, a We Stack cadastra essa lógica no sistema deles, calcula a margem de lucro, automatiza a Central de Promoções e gera o relatório de lucratividade.

## Dado extremamente importante: Sistema Interno V2 vira a fonte da verdade

Ao fim do processo, depois que o Sistema Interno V2 for validado pelo superior e pelo financeiro/tributário:

- **O Sistema Interno V2 vira a fonte da verdade.**
- É ele quem passa a **ditar se a We Stack está correta ou não** — não o contrário. Uma divergência entre a planilha da We Stack e o Sistema Interno V2 não é um empate a ser arbitrado por uma 3ª fonte: o Sistema Interno V2 é quem decide.
- Ele assume **100% o papel de fonte de verdade para precificação de produtos** — a planilha do superior será abandonada.

Por isso é extremamente importante que o Sistema Interno V2 seja 100% correto e coerente: qualquer dúvida em aberto sobre a lógica dele (ex: base de cálculo de PIS/COFINS de saída, ou definição de custo usada no piso de faixa de frete/comissão — ver [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]]) carrega um peso maior do que uma divergência equivalente nas outras 2 fontes, porque o que for decidido ali vira o padrão que as outras devem seguir — inclusive ensinando a We Stack, um 3º terceiro, a lógica certa ou errada.

## Por que essa direção de autoridade importa (consequência prática)

Isso muda como qualquer divergência encontrada entre as 3 fontes deve ser lida:

- Uma divergência que envolve a **planilha do superior** pesa menos, já que ela será abandonada — serve só de contexto histórico.
- Uma divergência que envolve a **planilha da We Stack** importa não porque ela erre ou acerte por si, mas porque, sendo um documento de ensino, um erro nela risca ensinar uma lógica errada a um 3º terceiro que vai automatizar decisões de negócio (promoções, lucratividade) em cima disso.
- Uma divergência ou dúvida que envolve **apenas o Sistema Interno V2** (a própria escolha de fórmula dele) é a que mais importa resolver corretamente, porque essa escolha — uma vez validada — se torna o padrão que dita se as outras 2 fontes (a começar pela We Stack) estão certas.

Exemplo concreto: as 3 fontes calculam a base de PIS/COFINS de saída de formas diferentes (planilha do superior: `(Preço−Custo)×%`; We Stack corrigida: `(Preço−Preço×ICMS_MÉDIA)×%`; Sistema Interno V2: `Preço×%`). Antes desse enquadramento, isso seria lido como "3 fontes discordam, qual está certa?". Com o enquadramento correto: a fórmula da planilha do superior não importa mais (será abandonada); a fórmula do Sistema Interno V2 é a que precisa ser validada com o financeiro/tributário como correta; e, uma vez validada, é ela que vai dizer se a fórmula que a We Stack está aprendendo (e vai automatizar) está certa ou precisa ser corrigida — não o inverso.

## Relacionado

- [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]
- [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]
- [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]]
- [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]
