---
tipo: checkpoint
dominio:
status: em_andamento
criado: 05/09/2026
atualizado_em: 05/09/2026 17:46
relacionado: [Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET, Processo de Devolução de Produtos e os 3 Caminhos Possíveis, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Checkpoint - Tela de Nova Devolução e Geração do PDF

**Resumo do estado atual**: tela "Nova Devolução" e geração de PDF implementadas e validadas como rascunho — detalhe completo em [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]. Persistência de devolução foi confirmada como necessária (04/09/2026), mas o schema ainda não foi desenhado. **Pausado em 05/09/2026** — foco 100% na reforma estrutural do projeto.

> [!warning] Em andamento, pausado
> Falta: desenhar schema de persistência (e decidir GET→POST), auditoria mobile-first da tela Nova Devolução.

## Linha do tempo

**01/09/2026** — Modelo de interação de conferência de peça fechado, cobrindo os 4 cenários reais (não veio, quantidade menor, quantidade certa mas danificada, tudo certo): usuário só marca o que RECEBEU, sistema deduz o resto por contraponto. Peça qtd 1 = marcador simples; qtd >1 = seletor "quantos vieram". Anotação de condição (texto livre) pra peça recebida.

**02/09/2026** — Mockups da tela Nova Devolução + layout do PDF aprovados. Decisão: PDF gerado e servido na hora, sem persistência (fluxo por GET).

Fechado o rascunho funcional completo — detalhe em [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]: busca de produto/peças por código de barras, fotos na tela, lógica de quantidade/déficit, PDF via `xhtml2pdf` com fotos. Usuário: "está perfeito para um rascunho".

**03/09/2026** — 1ª tela validada dentro do `.exe` empacotado (visual idêntico ao mockup) — bugs de empacotamento encontrados nessa validação ficam registrados em [[Checkpoint - Empacotamento e Entrega do .exe]].

**04/09/2026** — Revisão geral reabriu 2 pontos: persistência de devolução **vai existir** (schema ainda não decidido — o que cada peça conferida guarda, se salva o PDF ou só os dados); fluxo por GET provavelmente muda pra POST, já que vai gravar estado. Confirmado também: Nova Devolução ainda não passou pela auditoria mobile-first que o Catálogo já teve.

## Em aberto

- [ ] Desenhar schema do model `Devolucao` (situação por peça, quantidade recebida, anotação, foto — replicado por empresa/banco)
- [ ] Decidir se o PDF fica salvo (arquivo) ou é sempre remontado a partir dos dados salvos
- [ ] Reavaliar fluxo GET→POST da tela Nova Devolução, já que vai passar a gravar estado
- [ ] Auditoria mobile-first da tela Nova Devolução (mesmo critério já aplicado ao Catálogo)
- [ ] Botão "Folha resumida" — fora de escopo por decisão do usuário

*(os 4 primeiros itens acima estão **pausados em 05/09/2026**, foco 100% na reforma estrutural)*

## Relacionado

- [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
