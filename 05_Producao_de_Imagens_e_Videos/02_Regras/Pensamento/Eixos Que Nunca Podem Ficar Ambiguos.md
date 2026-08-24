---
tipo: regra
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 23/08/2026 22:15
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Etapa 5 - Navegacao pelos Grafos, Pistola de Pintura]
---

# Eixos Que Nunca Podem Ficar Ambíguos

Alguns eixos de classificação, se confundidos ou fundidos num nó só, quebram o material final gerado depois (fala no singular algo vendido em par, ou mostra só 1 fonte de energia quando o produto tem 2). Levantados a partir de erros quase cometidos ao classificar exemplos reais — a lista cresce conforme aparecem casos novos, nunca foi fechada.

## Os eixos conhecidos até agora

- **Fonte de energia**: `Manual` / `Elétrico` / `Elétrico e Manual` — sempre 3 nós distintos, nunca fundidos nem usados um pelo outro. Testado com Pulverizador (XP20 manual × SS-20B elétrico-e-manual) e Cadeira de Rodas (D800 motorizada).
- **Unidade de venda**: `item único` / `kit ou conjunto` — sempre 2 nós separados. Confundir os dois faz o material final falar no singular de algo vendido em kit, ou mostrar 1 peça só quando são várias. Confirmado na prática pela 1ª vez com a Muleta Axilar (vendida em par).
- **Sistema de alimentação de tinta** (categoria Pistola de Pintura): `Gravidade` / `Sucção` / `Pressurizado` — sempre nós distintos. Identificado em 23/08/2026 ao classificar a Pistola SGT-3011B (gravidade) — só 1 valor confirmado até agora, mas o eixo já existe como categoria de distinção reconhecida no mercado, registrado aqui pra não ambiguar quando a 2ª pistola (sucção ou pressurizada) aparecer.

## Como aplicar

Ao classificar um produto novo, verificar esses eixos ANTES de qualquer outra decisão de classificação — nunca assumir que a categoria "padrão" se aplica sem checar explicitamente.

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Etapa 5 - Navegacao pelos Grafos]]
