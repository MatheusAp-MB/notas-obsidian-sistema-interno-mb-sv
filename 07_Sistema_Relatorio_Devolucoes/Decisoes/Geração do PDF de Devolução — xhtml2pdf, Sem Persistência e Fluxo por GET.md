---
tipo: decisao
dominio: python
status: concluida
criado: 02/09/2026
atualizado_em: 02/09/2026 03:14
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]
---

# Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET

**Resumo**: a tela "Nova Devolução" passou de formulário estático pra funcional de ponta a ponta: busca produto/peças reais do catálogo pelo código de barras, cobre os 4 cenários reais de conferência de peça (não recebida, parcial com déficit calculado, completa, completa com anotação), e gera um PDF de verdade com esses dados — sem salvar nada no banco, é gerado e servido na hora, execução única. Deixado explícito pelo usuário: este é um **rascunho aprovado**, não a versão final — o visual já foi ajustado uma vez (fonte/espaçamento/imagens maiores, data em dd/mm/aaaa, removida a linha "Gerado em"), mas pode evoluir mais.

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
- **Sem persistência**: nenhuma tabela nova de "Devolução" foi criada — o PDF é gerado a partir do que está no formulário no momento do clique, é uma execução única, não fica salvo nem reaberto depois.
- **Fluxo por GET**: tanto a busca do produto quanto a geração do PDF são ações `GET` (query string), não `POST` — evita o aviso de reconfirmação do navegador e mantém consistência com o padrão já usado em Catálogo/Produtos.
- **`xhtml2pdf` como biblioteca de PDF**: Python puro, sem dependência de sistema — ainda não testado dentro do `.exe` empacotado (só em `runserver` até agora), ver [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]].
- **Lógica de quantidade/déficit implementada por completo** (não a versão simplificada cogitada inicialmente): peça de quantidade 1 é um checkbox; peça de quantidade maior que 1 vira "quantos vieram", com o déficit calculado dos dois lados (JS pra feedback visual, servidor pra montar o PDF de verdade).
- **Em aberto, deliberadamente fora desta rodada**: botão "Folha resumida" (segue sem funcionar), qualquer forma de salvar/histórico de devoluções, e revisão de UX mais a fundo — o próprio usuário confirmou que essa é uma versão de rascunho, não a final.

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]
