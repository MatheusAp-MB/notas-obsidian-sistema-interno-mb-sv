---
tipo: regra
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 23/08/2026 06:30
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Etapa 5 - Navegacao pelos Grafos]
---

# Isolamento Entre Produtos e Categorias no Grafo

Nenhuma nota do Grafo 1 ou do Grafo 2 pode conter, no corpo do texto, link ou menção a um produto específico — só a outros nós/templates e à nota de decisão. Ao classificar um produto novo, a leitura deve se limitar às pastas `03_Grafo/1_O_Que_E/` e `03_Grafo/2_O_Que_Pode_Ter/`; nunca ler notas de outros produtos em `04_Produtos/`, nem "pra aprender com exemplos anteriores".

## Por que

Uma ferramenta de leitura de arquivo só vê o texto literal do arquivo — diferente do painel de backlinks do Obsidian (calculado pela interface, não gravado no arquivo). Qualquer menção literal a um produto dentro de uma nota de categoria vazaria pra análise de outro produto que leia essa mesma categoria depois. É por isso que as notas do Grafo 1 não têm uma seção "produtos ligados a este nó" — a ligação existe só em 1 direção (do produto pra cima, nunca da categoria pra baixo).

## Onde essa regra já foi violada e corrigida

Achado real na nota da D800 Dellamed — corrigido nesta sessão, reforçando a regra.

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Etapa 5 - Navegacao pelos Grafos]]
