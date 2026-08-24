---
tipo: regra
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 23/08/2026 06:30
relacionado: [Etapa 5 - Navegacao pelos Grafos, Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Protocolo de Feedback e Correcao]
---

# Tags de Proveniência de Dado

Toda linha da tabela "Cruzamento com a Categoria" (Étapa 6) e todo fato registrado nas seções de Fatos e Especificações precisa ter uma tag de proveniência — nunca uma afirmação sem fonte rastreável. Isso sustenta a regra anti-invenção que atravessa todo o pipeline (ver [[Etapa 1-4 - Estudo do Produto]]).

## As tags

- **[TEXTO]** — dado extraído só do texto bruto (título + descrição do fornecedor).
- **[IMG]** — dado extraído só da imagem de referência do produto.
- **[TEXTO+IMG]** — dado confirmado nas 2 fontes ao mesmo tempo, sem divergência.
- **dado ausente** — a pergunta é válida pra esta categoria, mas nenhuma fonte (texto ou imagem) informou o valor. Nunca pode virar promessa de venda.
- **N/A — [motivo]** — a pergunta do Grafo 2 genuinamente não se aplica a esta categoria/produto (diferente de faltar dado — não confundir os dois).
- **[USUÁRIO]** — fato confirmado pelo usuário diretamente em conversa, fora dos dados brutos originais recebidos. Tag adicionada em 23/08/2026, primeiro uso real: a marca "Hidrolight" da Muleta Axilar, que os dados brutos não identificavam explicitamente como marca — o usuário confirmou isso fora do material recebido, e a correção precisou ficar rastreável como vindo dele, não do texto/imagem original.

## Por que existe

Sem uma tag por dado, um erro descoberto depois não tem como ser diagnosticado — a tag mostra se o problema veio de uma leitura errada do texto do fornecedor, de uma interpretação errada da imagem, ou de uma correção humana que pode precisar de reforço em outro lugar (ver [[Protocolo de Feedback e Correcao]], causa 4 — dado errado do produto específico).

## Relacionado
- [[Etapa 5 - Navegacao pelos Grafos]]
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Protocolo de Feedback e Correcao]]
