---
tipo: decisao
dominio: python
status: concluida
criado: 08/09/2026
atualizado_em: 08/09/2026 03:07
relacionado: [Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET, Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, 2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]
---

# Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador

**Resumo**: a geração do relatório de devolução deixou de usar a biblioteca `xhtml2pdf` e passou a ser uma view Django comum (`imprimir_relatorio_devolucao`), que renderiza uma página HTML normal com CSS de impressão (`@media print`) — o PDF final é gerado pelo próprio navegador do usuário (Ctrl+P → "Salvar como PDF"), sem nenhuma biblioteca de conversão envolvida.

> [!success] Decidido e implementado — 08/09/2026
> Substitui por completo a view antiga `gerar_relatorio_devolucao` (baseada em `xhtml2pdf`, ver [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]). Testado de ponta a ponta, incluindo geração de um PDF real de várias páginas e inspeção página por página, confirmando que a paginação de impressão funciona corretamente.

## Contexto

O layout do relatório impresso foi fechado e aprovado em 07/09/2026, depois de 4 rodadas de mockup — ver [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]]. Esse layout usa uma faixa horizontal com 4 blocos lado a lado (Produto, Pedido & Cliente, Plataforma, Datas), variáveis CSS (`:root`), e outros recursos de CSS moderno (`flexbox`) pra montar a estrutura visual aprovada pelo usuário. A nota do layout, na época, ainda registrava a suposição de que a implementação real precisaria virar um template compatível com `xhtml2pdf` — a mesma biblioteca já usada no rascunho original (ver [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]).

## O problema

`xhtml2pdf` não entende CSS moderno — sem suporte real a `flexbox` ou `grid`, só a modelo de caixa antigo baseado em tabelas. Implementar o layout aprovado (faixa horizontal de 4 blocos, badges de status, variáveis de cor) dentro dessa limitação exigiria reescrever a estrutura inteira em tabelas HTML, com um risco real de perder fidelidade visual em relação ao mockup que o usuário já tinha aprovado.

## O que levou à resposta

Em vez de adaptar o layout aprovado pra caber nas limitações do `xhtml2pdf`, a alternativa escolhida foi trocar o mecanismo de geração de PDF: servir a página como HTML normal, com uma folha de estilos própria pra impressão, e deixar o próprio navegador (que já sabe renderizar CSS moderno perfeitamente) converter pra PDF na hora de imprimir. Vantagens confirmadas na prática:

- **Zero perda de fidelidade** — o mesmo CSS aprovado no mockup (flexbox, variáveis, badges) funciona sem adaptação nenhuma.
- **Zero dependência de biblioteca de PDF** — nem `xhtml2pdf` nem sua dependência transitiva `reportlab` (que já tinha causado 1 dos 2 bugs reais de empacotamento registrados em [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]) precisam mais entrar no `.exe` gerado pelo PyInstaller — menos risco de bug de empacotamento, não mais nenhum.
- **Visualização real antes de gerar o PDF** — o usuário vê a página exatamente como vai sair, no próprio navegador, antes de decidir imprimir.

## Decisão

- Nova view `imprimir_relatorio_devolucao` (substitui `gerar_relatorio_devolucao` por completo) usa `render()` padrão do Django — sem `link_callback`, sem `pisa.CreatePDF`, sem nenhum tratamento especial de caminho de arquivo pra imagem.
- Template `relatorio_devolucao_impressao.html` com CSS completo, incluindo regras específicas de paginação de impressão: `page-break-inside: avoid` em cada linha da tabela de peças (nenhuma linha corta ao meio entre 2 páginas) e `thead { display: table-header-group }` (o cabeçalho da tabela repete em toda página nova, não só na primeira).
- O usuário gera o PDF final pelo Ctrl+P do próprio navegador, escolhendo "Salvar como PDF" — nenhum botão ou fluxo especial no sistema faz essa conversão.
- Consequência no empacotamento: `gerar_exe.py` teve a flag `--collect-submodules=reportlab.graphics.barcode` removida (só existia por causa do `xhtml2pdf`).

## Exemplo

Verificação feita com Playwright, fora do banco de dados (dados mockados): captura da página normal, captura em modo de impressão (`page.emulate_media(media="print")`), e geração de um PDF real de 2 páginas via `page.pdf()` — convertido em imagens com `pdftoppm` pra inspeção visual página por página. Confirmado nas 2 páginas: o cabeçalho da tabela de peças aparece repetido no topo da 2ª página, e nenhuma linha de peça aparece cortada na quebra entre as 2 páginas.

## Relacionado

- [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]
- [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]
