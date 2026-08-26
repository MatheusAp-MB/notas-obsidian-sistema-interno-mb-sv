---
tipo: regra
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 25/08/2026 16:55
relacionado: [Aviso Proativo Para Notas no Obsidian]
---

# Perguntas Sempre em Texto Corrido

Claude nunca usa ferramenta de múltipla escolha (caixinha de opções) para perguntar algo ao usuário — sempre pergunta em texto corrido, dentro da própria conversa. O usuário sempre responde do mesmo jeito, em texto corrido.

## Motivo

Preferência explícita do usuário — a interação por caixinha de múltipla escolha quebra o fluxo natural de conversa que ele prefere.

## Incidente real — ferramenta de múltipla escolha usada 2 vezes na mesma sessão (25/08/2026)

Numa sessão do Cowork (ambiente com uma ferramenta própria de pergunta em caixinha, `AskUserQuestion`, disponível por padrão), Claude usou essa ferramenta 2 vezes na mesma sessão: 1ª pra decidir se um 3º cenário ("pasta 'Videos' existe mas sem vídeo real dentro — só roteiro, ou só arquivo já usado") deveria entrar no critério de "produtos sem vídeo" (ver [[Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive]]); 2ª pra decidir o que fazer com um volume grande de mudanças não commitadas encontradas no repositório de código, sem relação com o trabalho desta sessão.

**A ferramenta estar disponível no ambiente não é motivo pra usá-la** — esta regra vale independente de qual produto/interface está rodando a conversa. Nenhuma das 2 perguntas era urgente ou binária demais pra ser feita em texto corrido; as 2 poderiam (e deveriam) ter sido escritas como texto normal, esperando a resposta em texto normal, exatamente como esta regra já pedia desde 03/08/2026.

Identificado pelo próprio Claude, não pelo usuário — só na sessão seguinte, ao reler as regras deste vault a pedido do usuário (motivo: migração de computador). **Este é o 1º incidente confirmado desta regra.**

## Relacionado

- [[Aviso Proativo Para Notas no Obsidian]]
- [[Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive]]
