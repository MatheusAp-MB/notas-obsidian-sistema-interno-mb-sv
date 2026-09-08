---
tipo: decisao
dominio: python
status: descartada
criado: 02/09/2026
atualizado_em: 08/09/2026 03:07
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe), Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]
---

# Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET

> [!failure] Substituída em 08/09/2026 — biblioteca `xhtml2pdf` abandonada
> A geração do relatório passou a usar uma view de impressão do navegador (HTML + CSS moderno + Ctrl+P), sem nenhuma biblioteca de PDF — motivo completo e nova arquitetura em [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]. Esta nota continua existindo como registro histórico do rascunho original (02/09/2026) e da decisão de persistência (04/09/2026, seção "Reabertura" abaixo) — a persistência em si **não** foi invalidada, só o mecanismo de geração de PDF mudou.

**Resumo**: a tela "Nova Devolução" passou de formulário estático pra funcional de ponta a ponta: busca produto/peças reais do catálogo pelo código de barras, cobre os 4 cenários reais de conferência de peça (não recebida, parcial com déficit calculado, completa, completa com anotação), e gera um PDF de verdade com esses dados. Na época (02/09/2026), era gerado e servido na hora, execução única, sem salvar nada no banco — **isso já não vale mais** (04/09/2026: confirmado que devoluções vão ser persistidas, ver seção "Reabertura" abaixo). Ficou explícito então que era um rascunho, não a versão final — o visual já tinha sido ajustado uma vez (fonte/espaçamento/imagens maiores, data em dd/mm/aaaa, removida a linha "Gerado em"), mas ainda evoluiria mais, como está evoluindo agora.

> [!success] Decidido e implementado — 02/09/2026, 03:14
> Testado com produto e peças reais do catálogo, incluindo fotos de produto e de peça aparecendo corretamente dentro do PDF. Usuário validou o resultado como "perfeito para um rascunho".

## Contexto

A tela "Nova Devolução" existia só como maquete visual (dados fixos no template, nenhuma lógica real) — ver linha do tempo em [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]. A interação de conferência de peça (4 cenários) já tinha sido desenhada e validada em conversa (01/09/2026, 23:30), mas nunca virou código.

## O problema

Fazer a tela funcionar de verdade e gerar o relatório em PDF, com um objetivo explícito do usuário: ter algo pra mostrar rapidamente ("mesmo sabendo que não será a versão final e correta"), sem se prender a fechar toda a arquitetura de uma vez.

## O que levou à resposta

Antes de qualquer código, foram gerados e aprovados 3 mockups em sequência: (1) tela de Nova Devolução com marcação simplificada de peça alimentando um rascunho de PDF; (2) foco só no PDF, já com a lógica completa de quantidade/déficit (pedido do usuário: "pode fazer a lógica completa"); (3) ajuste fino de fonte/espaçamento/tamanho de imagem no PDF, depois do primeiro PDF real gerado. Implementação feita ponto a ponto, cada um testado pelo usuário antes do próximo:
1. Biblioteca `xhtml2pdf` adicionada (Python puro, sem dependência de sistema, seguro pro empacotamento com PyInstaller que já era um requisito fixado do projeto).
2. View `nova_devolucao` passou a buscar produto/peças reais pelo código de barras.
3. Foto do produto e de cada peça exibidas na tela (pedido extra do usuário ao ver o primeiro teste).
4. Controle real por peça: checkbox quando a quantidade esperada é 1, campo "quantos vieram" quando é maior que 1, com o déficit calculado automaticamente e o campo de anotação liberado só quando algo foi recebido — JS (`script_nova_devolucao.js`) replica visualmente o mesmo cálculo que o servidor refaz na hora de gerar o PDF.
5. Bug de UX encontrado no meio do caminho: como o formulário era `method="post"`, atualizar a página disparava o aviso do navegador "confirmar reenvio do formulário". Resolvido trocando pra `method="get"` (mesmo padrão já usado nas buscas de Catálogo/Produtos) — busca e geração de PDF viram ações idempotentes, sem esse aviso nunca mais.
6. View `gerar_pdf_devolucao` nova: recalcula a situação de cada peça a partir dos dados enviados, monta um template HTML dedicado (`relatorio_devolucao_pdf.html`, com tabelas em vez de flexbox/grid — `xhtml2pdf` não entende CSS moderno) e converte com `xhtml2pdf.pisa.CreatePDF`, devolvendo direto como `HttpResponse` (`Content-Type: application/pdf`) — nada é salvo no banco.
7. Fotos dentro do PDF exigiram um `link_callback` (padrão documentado do `xhtml2pdf` com Django) que traduz uma URL de `/media/` ou `/static/` pro caminho real no disco, já que o `xhtml2pdf` não tem servidor rodando pra buscar essas URLs sozinho.
8. Testado com dados e fotos reais do catálogo (produto "Pulverizador a Bateria e Manual SS-20B") — PDF saiu com produto, peças, fotos, situação calculada e anotações certas. Ajuste visual final: fonte/espaçamento/fotos maiores, data no formato `dd/mm/aaaa` (antes saía como o formato bruto do input HTML, `aaaa-mm-dd`), e removida a linha "Gerado em" (pedido do usuário).

## Decisão

Arquitetura do relatório de devolução fixada, como rascunho validado:
- **Sem persistência (válido só pro rascunho, revertido em 04/09/2026 — ver seção "Reabertura" abaixo)**: nenhuma tabela nova de "Devolução" foi criada — o PDF era gerado a partir do que estava no formulário no momento do clique, execução única, não ficava salvo nem reaberto depois.
- **Fluxo por GET**: tanto a busca do produto quanto a geração do PDF são ações `GET` (query string), não `POST` — evita o aviso de reconfirmação do navegador e mantém consistência com o padrão já usado em Catálogo/Produtos.
- **`xhtml2pdf` como biblioteca de PDF**: Python puro, sem dependência de sistema — ainda não testado dentro do `.exe` empacotado (só em `runserver` até agora), ver [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]].
- **Lógica de quantidade/déficit implementada por completo** (não a versão simplificada cogitada inicialmente): peça de quantidade 1 é um checkbox; peça de quantidade maior que 1 vira "quantos vieram", com o déficit calculado dos dois lados (JS pra feedback visual, servidor pra montar o PDF de verdade).
- **Em aberto, deliberadamente fora desta rodada**: botão "Folha resumida" (segue sem funcionar), e revisão de UX mais a fundo — o próprio usuário confirmou que essa é uma versão de rascunho, não a final. Persistência/histórico deixou de estar nesta lista — ver "Reabertura" abaixo.

## Reabertura — persistência confirmada (04/09/2026)

Na revisão do mundo inteiro pra achar ruído entre rascunho e sistema robusto, ficou confirmado pelo usuário: devoluções **vão sim ser persistidas** — "certeza que irão ser persistidas". O "sem persistência" acima valia só enquanto rascunho descartável; não vale mais.

Ainda **não decidido** (fica pra quando for desenhado com calma): o schema de como fica esse histórico — 1 model `Devolucao` novo, o que exatamente ele guarda por peça conferida (situação, quantidade recebida, anotação, foto no momento?), se guarda o PDF gerado ou só os dados que o geraram, e como isso convive com o fluxo atual por GET/sem salvar nada (que provavelmente muda pra POST, já que passa a gravar estado). Fica marcado aqui como ponto em aberto do checkpoint do mundo, não implementado ainda.

*(Nota: o schema de persistência citado acima foi desenhado e implementado em 07-08/09/2026 — models `Devolucao`, `ConferenciaPeca` e `FotoConferenciaPeca`, fluxo por POST — ver [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]] e [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]] pro detalhe completo. `xhtml2pdf` em si foi abandonado nesse mesmo momento — ver callout no topo desta nota.)*

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]
- [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]
