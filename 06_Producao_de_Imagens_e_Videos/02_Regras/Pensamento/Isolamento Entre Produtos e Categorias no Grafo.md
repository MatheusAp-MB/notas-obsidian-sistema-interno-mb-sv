---
tipo: regra
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 24/08/2026 08:13
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Etapa 5 - Navegacao pelos Grafos]
---

# Isolamento Entre Produtos e Categorias no Grafo

Nenhuma nota do Grafo 1 ou do Grafo 2 pode conter, no corpo do texto, link ou menção a um produto específico — só a outros nós/templates e à nota de decisão. Ao classificar um produto novo, a leitura deve se limitar às pastas `03_Grafo/1_O_Que_E/` e `03_Grafo/2_O_Que_Pode_Ter/`; nunca ler notas de outros produtos em `04_Produtos/`, nem "pra aprender com exemplos anteriores".

## Por que

Uma ferramenta de leitura de arquivo só vê o texto literal do arquivo — diferente do painel de backlinks do Obsidian (calculado pela interface, não gravado no arquivo). Qualquer menção literal a um produto dentro de uma nota de categoria vazaria pra análise de outro produto que leia essa mesma categoria depois. É por isso que as notas do Grafo 1 não têm uma seção "produtos ligados a este nó" — a ligação existe só em 1 direção (do produto pra cima, nunca da categoria pra baixo).

## Onde essa regra já foi violada e corrigida

Achado real na nota da D800 Dellamed — corrigido nesta sessão, reforçando a regra.

2ª ocorrência (24/08/2026): ao iniciar a Étapa 5 do Pulverizador Brudden DAS G2, a nota de outro produto (`04_Produtos/Pulverizador Costal SS-20B Brudden.md`) foi aberta "pra checar precedente" antes de perceber que isso violava a regra — o conteúdo específico do SS-20B (dores, eixos de venda, redação exata) não foi usado na classificação do DAS G2, que seguiu só o índice do grafo e a Base de Conhecimento do próprio produto. Autoidentificado e corrigido antes de qualquer nó/template ser escrito. Reforça que "checar como um produto anterior foi classificado" é exatamente o impulso que esta regra existe pra bloquear — mesmo quando a intenção é só validar uma hipótese, não copiar texto.

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Etapa 5 - Navegacao pelos Grafos]]
