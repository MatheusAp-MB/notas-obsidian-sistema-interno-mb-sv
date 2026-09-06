---
tipo: checkpoint
dominio:
status: em_andamento
criado: 05/09/2026
atualizado_em: 05/09/2026 17:46
relacionado: [Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Checkpoint - Catálogo de Peças e Tela de Produtos

**Resumo do estado atual**: catálogo de peças (models `Produto`/`Peca`) e telas de Produtos/Catálogo implementadas e testadas, incluindo responsividade mobile do Catálogo. Reestruturação de telas fechada em 02/09/2026 — detalhe em [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]. **Pausado em 05/09/2026** — foco 100% na reforma estrutural do projeto.

> [!warning] Em andamento, pausado
> Falta: editar peça já cadastrada (fora de escopo por ora) e auditoria mobile-first da tela Produtos (Catálogo já revisado, Produtos não).

## Linha do tempo

**01/09/2026** — Ideia inicial: catálogo de peças por produto (foto + nome técnico), crescendo aos poucos. Regra firme do usuário: peça pertence a exatamente 1 produto, nunca compartilhada (`ForeignKey` simples, sem N-pra-N).

**02/09/2026** — Catálogo implementado: models `Produto`/`Peca` (SQLite); tela de Catálogo (buscar produto por código de barras, cadastrar produto novo, adicionar/remover peça com foto e quantidade esperada) testada de ponta a ponta, incluindo responsividade mobile (grade fixa, card em largura total <480px, área de toque maior, campos empilhados). Escopo mudou: usuária final (não só o dev) também usa essa tela.

Reestruturação de telas fechada — detalhe completo em [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]: tela "Produtos" própria (listagem), cadastro de produto movido pra lá, edição de dados do produto (nome/marca/EAN/foto) embutida no Catálogo, menu de navegação simples (Nova Devolução | Produtos).

**04/09/2026** — Revisão geral confirmou: Produtos ainda não passou pela auditoria mobile-first que o Catálogo já teve (vira pendência, ver "Em aberto").

## Em aberto

- [ ] Auditoria mobile-first da tela Produtos (mesmo critério já aplicado ao Catálogo: grade fixa, área de toque, campos empilhados) — **pausado em 05/09/2026**, foco na reforma estrutural
- [ ] Editar peça já cadastrada — fora de escopo por ora (só adicionar/remover), decisão firme do usuário

## Relacionado

- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
