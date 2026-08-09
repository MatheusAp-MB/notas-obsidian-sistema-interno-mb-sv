---
tipo: regra
dominio: 
status: ativa
criado: 08/08/2026
atualizado_em: 08/08/2026 17:00
relacionado: [Plano em Etapas do Duble de Precificacao ML, Checkpoint — Exploracao de Dados Fiscais Sysemp]
---

# Achados de Imposto Sempre Aguardam Validação do Tributário/Superior

## Regra

Toda descoberta, correção ou fórmula envolvendo cálculo/interpretação de imposto (ICMS, ICMS ST, IPI, PIS, COFINS, etc.) feita nesta exploração Sysemp/precificação é registrada com o rótulo explícito **"Aguardando validação do tributário/superior"** — mesmo quando a matemática bate exatamente com os dados da API.

## Motivo

O usuário não tem formação/conhecimento tributário formal — o que sabe vem só da prática direta deste projeto, não é autossuficiente pra validar sozinho. Bater com os números da API confirma consistência interna do dado (a conta fecha), não confirma que a interpretação está certa do ponto de vista fiscal/legal. Essas são 2 validações diferentes; só a primeira é feita por Claude.

## Como aplicar

- Toda nota nova sobre imposto (achado, correção, decisão de fórmula) leva esse rótulo em destaque, perto da conclusão.
- Não implica que o achado esteja errado — só marca que falta a validação de alguém com conhecimento tributário real (o superior do usuário, ou a área fiscal).
- Quando o tributário/superior confirmar ou corrigir um achado, a nota correspondente ganha uma seção `## Validado pelo tributário` ou `## Corrigido pelo tributário`, e o rótulo de "aguardando" é atualizado só nessa nota específica.

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
