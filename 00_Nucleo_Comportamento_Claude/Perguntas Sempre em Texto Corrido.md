---
tipo: regra
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 29/08/2026 15:30
relacionado: [Aviso Proativo Para Notas no Obsidian]
---

# Perguntas Sempre em Texto Corrido

Claude nunca usa ferramenta de múltipla escolha (caixinha de opções) para perguntar algo ao usuário — sempre pergunta em texto corrido, dentro da própria conversa. O usuário sempre responde do mesmo jeito, em texto corrido.

## Motivo

Preferência explícita do usuário — a interação por caixinha de múltipla escolha quebra o fluxo natural de conversa que ele prefere.

## Incidente real — ferramenta de múltipla escolha usada 2 vezes na mesma sessão (25/08/2026)

Numa sessão do Cowork (ambiente com uma ferramenta própria de pergunta em caixinha, `AskUserQuestion`, disponível por padrão), Claude usou essa ferramenta 2 vezes na mesma sessão: 1ª pra decidir se um 3º cenário ("pasta 'Videos' existe mas sem vídeo real dentro — só roteiro, ou só arquivo já usado") deveria entrar no critério de "produtos sem vídeo" (ver [[Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive]]); 2ª pra decidir o que fazer com um volume grande de mudanças não commitadas encontradas no repositório de código, sem relação com o trabalho desta sessão.

**A ferramenta estar disponível no ambiente não é motivo pra usá-la** — esta regra vale independente de qual produto/interface está rodando a conversa. Nenhuma das 2 perguntas era urgente ou binária demais pra ser feita em texto corrido; as 2 poderiam (e deveriam) ter sido escritas como texto normal, esperando a resposta em texto normal, exatamente como esta regra já pedia desde 03/08/2026.

Identificado pelo próprio Claude, não pelo usuário — só na sessão seguinte, ao reler as regras deste vault a pedido do usuário (motivo: migração de computador). Na época, **1º incidente confirmado desta regra.**

## Incidente real — reincidência, mesmo já classificada em `00_Nucleo_Comportamento_Claude/` (29/08/2026)

Durante a reorganização do vault em `00_Nucleo_Comportamento_Claude/`/`01_Nucleo_Geral_Vault/` (mesma sessão em que esta regra foi lida na íntegra e reclassificada como comportamento universal), Claude usou a ferramenta `AskUserQuestion` 2 vezes: 1ª pra perguntar o que cortar de uma nota que o usuário achou longa demais; 2ª pra perguntar qual direção seguir pra resolver o peso das regras do `00_`. Mesmo padrão exato do incidente de 25/08 — 2 usos na mesma sessão, nenhuma das 2 perguntas urgente ou binária demais pra texto corrido.

**Diferença importante desta vez**: o incidente foi identificado pelo próprio Claude, no meio da leitura do conteúdo completo desta regra (durante o trabalho de reclassificação 00/01/02), não numa sessão seguinte nem apontado pelo usuário. Corrigido na hora, sem o usuário precisar interromper — mas a reincidência, mesmo com a regra já relida e já fisicamente movida pro núcleo "sempre reler", prova que reorganizar pasta não garante aplicação: entre o 1º incidente (25/08) e este (29/08), a regra nunca deixou de estar escrita e clara, e ainda assim foi violada de novo. **2º incidente confirmado desta regra.**

## Relacionado

- [[Aviso Proativo Para Notas no Obsidian]]
- [[Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive]]
- [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]
