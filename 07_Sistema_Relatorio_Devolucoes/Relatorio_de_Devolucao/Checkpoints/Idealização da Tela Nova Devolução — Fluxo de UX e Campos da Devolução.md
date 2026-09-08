---
tipo: checkpoint
dominio:
status: concluido
criado: 07/09/2026
atualizado_em: 08/09/2026 03:07
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Checkpoint - Tela de Nova Devolução e Geração do PDF, Processo de Devolução de Produtos e os 3 Caminhos Possíveis, Análise do UX Flow da Responsável pela Devolução, Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça, Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]
---

# Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução

**Resumo do estado atual**: fluxo de UX e campos idealizados em 07/09/2026 (fase "Idealizar", nenhum código gerado naquele momento) e **implementados por completo em 08/09/2026** — persistência real (models `Devolucao`, `ConferenciaPeca`, `FotoConferenciaPeca`), tela de conferência de peça mobile (`conferir_devolucao.html`) e relatório impresso, todos validados com dados reais. Ver [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]] pra linha do tempo completa de 08/09/2026.

> [!success] Concluído — 08/09/2026
> Os 3 itens que estavam em aberto nesta nota (schema de persistência, tela de conferência mobile, tela de consulta básica) foram todos implementados — ver seção "Em aberto" abaixo, atualizada.

## Restrição real de hoje (07/09/2026)

Usuário está sem celular físico disponível pra testar — vai validar a tela mobile confiando em emulação de dispositivo (devtools do Chrome / testes automatizados com viewport de celular). Suficiente pra tudo, exceto o disparo real de câmera nativa (isso só se confirma com hardware de verdade depois).

## O fluxo de UX definido (2 fases: PC e celular)

Diagrama visual gerado e aprovado pelo usuário numa sessão com Claude (Cowork) — descrito aqui em texto:

1. **Dados da devolução** (PC) — ver campos completos abaixo.
2. **Buscar o produto** (celular ou PC) — busca livre e tokenizada, mesmo padrão já usado em Produtos (ex: "pulv 9121 brudden"). Bipar código de barras funciona no mesmo campo de busca — não são caminhos excludentes, os dois passam pela mesma caixa.
3. **Selecionar o produto** encontrado — sistema lista as peças que compõem esse produto.
4. **Conferência física peça por peça** (celular, caixa física na mão) — ver modelo completo abaixo.
5. **Finalizar** — ver decisão "salvar vs gerar relatório" abaixo.

## Escopo de hoje vs futuro

- **Hoje**: 1 devolução = 1 produto.
- **Futuro, fora de escopo por decisão do usuário**: devolução com mais de 1 produto (ex: kit "Pulverizador + Chapéu Napoleão", kit "6x pulverizadores", "chinelo vermelho 38 + chinelo azul 40"). O schema de persistência já vai ser desenhado pensando nessa possibilidade (`Devolução` podendo ter mais de 1 produto no futuro), pra não exigir reforma de banco quando isso for liberado.

## Campos da Fase 0 — Dados da devolução (feito no PC)

Contexto: a responsável pela devolução tira essas informações da etiqueta física colada na embalagem (nota fiscal + envio do marketplace) e busca o pedido/NF no ERP. Pensado pra ser preenchido via copiar/colar do ERP e do marketplace, sem digitação manual.

### Sobre a plataforma
- Nome da plataforma (o marketplace)
- Se foi venda comum ou venda FULL
- Empresa (Magazine ou Samvale) — não é campo de formulário, vem automaticamente do seletor de empresa que já existe no sistema

### Sobre o pedido
- Número do pedido
- Número da nota fiscal
- Nome do cliente

### Sobre datas da devolução em si
- Data em que o produto foi recebido pelo cliente
- Data em que o cliente abriu a reclamação/solicitação de devolução
- Data em que o produto foi recebido por nós (chegada no barracão, depois do cliente devolver)

### Sobre a mediação
- Data em que a responsável pela devolução abriu uma mediação com a plataforma
- Data em que essa mediação foi finalizada
- Foi reembolsado pela plataforma? (sim/não)
- Campo de anotação livre

### Sobre a reclamação feita pelo cliente
- Motivo da reclamação do cliente
- Imagens que o cliente enviou pra validar a reclamação dele (diferente das fotos de conferência da Fase 3 — essas vêm do cliente, não da responsável pela devolução). **Nota (08/09/2026)**: o model `FotoReclamacaoCliente` foi criado no schema, mas continua **sem nenhuma tela ou view que o use** — não dá nem pra cadastrar uma foto do cliente ainda, é só estrutura de banco parada. Fora do escopo dos 13 campos que o usuário pediu explicitamente pro relatório em 08/09/2026.

## Modelo de conferência de peça (Fase 3, celular)

Todas as peças do produto começam no estado **"NÃO RECEBIDO"**. A responsável marca peça por peça o que foi recebido — quando a peça espera mais de 1 unidade, ela informa a quantidade recebida, e o sistema deduz sozinho o estado (completo / incompleto / não recebido), sem ela precisar classificar manualmente. Mesma lógica de conferência já validada no vínculo Produto↔Peça (esperado vs. recebido, déficit automático).

Exemplos dados pelo usuário pra fechar o modelo:

| Peça | Esperado | Recebido | Estado deduzido pelo sistema |
|---|---|---|---|
| A | 1 | 1 | Completo |
| B | 5 | 3 | Incompleto (déficit de 2) |
| C | N | 0 | Não recebida |
| D | 2 | 2 | Completo |
| E | N | recebida | Completo, com anotação "peça riscada e torta" |

**2 modos de anotação, em lugares diferentes da tela** (não é um campo genérico só):
- Anotação **por peça** — específica daquela peça, dentro do loop de conferência.
- Anotação **geral do produto** — fora do loop, pra algo que não é sobre nenhuma peça específica (exemplos do usuário: "retornou outro produto no lugar", "o produto não funciona").

**Fotos por peça**: cada peça pode ter foto real anexada (evidência do estado físico, diferente da foto de catálogo) — botão que abre escolha entre tirar foto na hora (câmera) ou escolher da galeria.

## Destino do produto (Troca ou Venda como Usado)

Campo adicionado depois (usuário tinha esquecido de mencionar): ao final da conferência física, a responsável pela devolução também precisa registrar pra qual dos 2 caminhos esse produto vai — **Troca** (reservado, fora de venda) ou **Venda como Usado** — ver [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]. É a informação mais crítica pra quem organiza o estoque físico depois, por isso ganhou destaque visual (selo grande) no relatório impresso — ver [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]].

## Salvar vs Gerar relatório — 2 ações separadas, por confiabilidade

Decisão explícita do usuário: **confiabilidade acima de praticidade** aqui. Salvar a devolução é sempre a primeira ação, sozinha; só depois de salva no banco é que a opção "Gerar relatório" aparece, como ação separada. Motivo, nas palavras do usuário: "é melhor 1 clique a mais para gerar o relatório do que uma inconsistência na hora de gerar o pdf fazer ela perder o trabalho". Isso substitui a ideia inicial (salvar + gerar PDF no mesmo clique) discutida antes nesta mesma sessão. **Implementado assim em 08/09/2026**: a devolução é salva via POST antes de qualquer relatório existir; o relatório (`imprimir_relatorio_devolucao`) é uma view separada, acionada depois, a partir de uma devolução já salva.

Devolução salva fica disponível para consulta e edição futura — inclusive a própria conferência de peça pode ser reaberta e editada depois de já salva uma vez (tela "Editar Conferência").

## Tela de consulta de devoluções salvas

Implementada como `devolucoes_pendentes.html` — versão básica, listagem simples com botão de gerar relatório por linha, como planejado.

## O relatório (folha impressa) — layout fechado e implementado

- **Restrição inegociável**: 1 única folha A4, não importa quantas peças o produto tenha ou quantas deram problema.
- **Propósito**: colada fisicamente na embalagem do produto, para organização do estoque físico — não é um documento administrativo.
- **Critério de sucesso**, nas palavras do usuário: "alguém olhando essa folha na prateleira consegue entender o problema desse produto na hora".
- **Layout fechado e implementado por completo** — detalhe completo, incluindo todas as rodadas de mockup e as 2 rodadas de ajuste depois de já funcionando com dados reais, em [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]]. A geração em si não usa mais `xhtml2pdf` — ver [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]].

## Em aberto

- [x] Desenho concreto do schema de persistência (`Devolução`, peças conferidas, fotos) — feito: models `Devolucao`, `ConferenciaPeca`, `FotoConferenciaPeca` (`FotoReclamacaoCliente` existe no schema mas sem tela — ver nota na seção "Campos da Fase 0" acima)
- [x] Tela de conferência de peça de verdade (mobile) — implementada como `conferir_devolucao.html`, cobrindo toggle Veio/Não veio, stepper de quantidade, anotação por peça, fotos por peça, Destino do produto e Observação geral
- [x] Tela de consulta de devoluções salvas (PC, versão básica) — implementada como `devolucoes_pendentes.html`

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Checkpoint - Tela de Nova Devolução e Geração do PDF]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
- [[Análise do UX Flow da Responsável pela Devolução]]
- [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]]
- [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]
