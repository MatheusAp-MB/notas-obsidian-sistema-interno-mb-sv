---
tipo: regra
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 23/08/2026 06:30
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Etapa 5 - Navegacao pelos Grafos]
---

# Princípio de Granularidade do Grafo 1

Um nó do Grafo 1 só merece existir se a distinção que ele representa muda quais templates do Grafo 2 são ativados. Se 2 variações de um produto ativam exatamente o mesmo conjunto de templates, elas não precisam de nós separados — a distinção vira só um valor de campo dentro de um template já existente, nunca um nó novo. Granularidade além disso é ruído.

## Exemplo real de aplicação correta

Ao classificar o Pulverizador Jacto XP20, "Bomba tipo Pistão", "Lança Fixa" e "Bico Único Instalado" pareciam candidatos a nó novo — mas tipo de bomba, tipo de lança e quantidade de bico não mudam qual template ativa, só preenchem valores diferentes dentro dos mesmos templates ([[Mecanismo de Bombeamento]], [[Lança]], [[Bico e Jato]]). Reclassificados como campos de template, não nós.

## Exemplo real de nó que passa no teste

"Cadeira de Rodas Dobrável" — muda quais templates ativam ([[Portabilidade e Transporte]] só é ativado por esse nó), então vira nó legítimo do Grafo 1.

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Etapa 5 - Navegacao pelos Grafos]]
