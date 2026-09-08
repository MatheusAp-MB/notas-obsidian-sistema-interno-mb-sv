---
tipo: decisao
dominio:
status: concluida
criado: 07/09/2026
atualizado_em: 08/09/2026 03:07
relacionado: [Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução, Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Processo de Devolução de Produtos e os 3 Caminhos Possíveis]
---

# Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça

**Resumo**: layout visual do relatório impresso (a folha que vai colada na embalagem física) fechado e aprovado pelo usuário em 07/09/2026, depois de 4 rodadas de mockup, e implementado por completo em 08/09/2026 — ver [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]] pro contexto de propósito e restrições.

> [!success] Layout implementado e validado com dados reais — 08/09/2026
> A implementação real **não** usou `xhtml2pdf` como esta nota assumia originalmente — a geração de PDF mudou pra uma view de impressão do navegador (HTML + CSS moderno), decisão completa em [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]. Depois de rodar com dados reais, o layout passou por mais 2 rodadas (campos que faltavam + melhorias de impressão) — ver seção "Depois da aprovação" abaixo.

## Restrição que guiou o design

1 única folha A4, sempre — não importa quantas peças o produto tenha ou quantas deram problema (critério de sucesso do usuário: "alguém olhando essa folha na prateleira consegue entender o problema desse produto na hora").

## Como chegamos no layout final (histórico das rodadas)

1. **1ª versão**: tudo empilhado verticalmente (identificação em grid 2 colunas, faixa de datas, tabela, observação geral) — usuário apontou muito espaço em branco e coisas empilhadas que caberiam lado a lado.
2. **2ª versão**: 2 colunas fixas (lateral estreita com identificação + área principal só com a tabela, esticando a altura inteira da folha) — usuário gostou da ideia mas temeu que a lateral ficasse vazia em devoluções com poucos dados.
3. **3ª versão**: identificação virou uma faixa horizontal compacta no topo (produto, pedido/cliente, plataforma, datas lado a lado), com a observação geral numa barra fina logo abaixo — liberando o resto da folha pra tabela de peças. Usuário pediu 2 ajustes: remover a coluna "Qtd" (redundante com "Situação", que já informa "FALTAM 2" etc.) e adicionar foto de cada peça (a foto real cadastrada no vínculo Produto↔Peça, não a foto de conferência da Fase 3).
4. **Rodada final (mockup)**: usuário lembrou de 2 campos esquecidos — "Destino do produto" (Troca ou Venda como Usado, ver [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]) e "Foi reembolsado pela plataforma?". Destino do produto virou um selo grande no canto superior direito do cabeçalho (mesmo destaque do título) — a informação mais crítica pra quem organiza o estoque físico. Reembolsado virou uma linha compacta dentro do bloco de Plataforma.

## Depois da aprovação — 2 rodadas adicionais com o sistema já funcionando (08/09/2026)

**5ª rodada — campos que faltavam**: depois do relatório já gerando de verdade com dados reais, o usuário conferiu campo por campo contra o formulário de Nova Devolução e pediu a inclusão de: Recebido pelo cliente, Reclamação aberta, Recebido por nós, Data da venda, Reembolsado (Sim/Não), Data de abertura da mediação, Data de finalização da mediação, Anotações sobre a mediação, Motivo da reclamação, Destino do produto, Observação geral do produto, Situação de cada peça, Anotação de cada peça. Boa parte já existia da rodada anterior — o que realmente faltava era Data da venda, Motivo da reclamação (virou box próprio, com selo "CLIENTE") e o bloco Mediação inteiro (Reembolsado saiu do bloco Plataforma e virou box próprio, junto das 2 datas de mediação e a anotação).

**6ª rodada — melhorias de impressão**, levantadas e aprovadas via mockup interativo antes de implementar:
- Paginação: linha de peça nunca corta ao meio entre 2 páginas impressas (`page-break-inside: avoid`), e o cabeçalho da tabela repete em toda página nova, não só na primeira.
- Diferenciação visual entre observação que veio do **cliente** (Motivo da reclamação) e observação **interna** (Observação geral do produto) — selo "CLIENTE" / "INTERNO" em cada box, cor de borda diferente.
- Datas com ano de 4 dígitos (`d/m/Y`, ex: `08/09/2026`) — antes saíam com 2 dígitos (`d/m/y`, ex: `08/09/26`).
- Centralização vertical do bloco "Plataforma" dentro da faixa horizontal (antes ficava alinhado ao topo, destoando dos outros blocos).

## Estrutura final da folha

- **Cabeçalho**: empresa + título "Relatório de Devolução" à esquerda; selo grande de **Destino do produto** (Troca / Venda como Usado) à direita.
- **Faixa horizontal** (4 blocos lado a lado): Produto (foto + nome + marca) · Pedido & Cliente (pedido, NF, cliente) · Plataforma (nome, venda comum/FULL, centralizado verticalmente) · Datas (venda, recebido pelo cliente, reclamação aberta, recebido por nós).
- **Box "Motivo da reclamação"** (selo CLIENTE) e **box "Mediação"** (reembolsado, datas de abertura/finalização, anotação — só aparece se algum desses dados existir).
- **Barra de observação geral do produto** (selo INTERNO) — largura total, fina.
- **Tabela de peças**, ocupando o resto da folha: foto + nome | situação (badge: OK / FALTAM N / NÃO VEIO / COM DEFEITO, já com a quantidade embutida quando relevante) | anotação por peça — com as regras de paginação da 6ª rodada.

## Decisão

Fechado e implementado por completo. Arquitetura de geração em [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]; schema de persistência (models `Devolucao`, `ConferenciaPeca`, `FotoConferenciaPeca`) em [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]].

## Relacionado

- [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]
- [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
