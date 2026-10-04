---
tipo: decisao
dominio:
status: em_andamento
criado: 04/10/2026
atualizado_em: 04/10/2026 00:13
relacionado: [Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026), Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida, Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao, Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição]
---

# Linha do Tempo do Caso na Consultar Pedido — 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias

**Resumo**: a tela Consultar Pedido passou a mostrar, sempre, uma linha do tempo com 6 datas do caso (Venda, Recebido pelo cliente, Reclamação aberta, Recebido por nós, Mediação aberta, Mediação encerrada), com o tempo em dias entre uma data e a próxima e um aviso verde ou vermelho sobre o prazo de 7 dias para o cliente reclamar. Cada data tem uma origem definida (Mercado Livre ou cadastro manual da Ana) e cada data que ainda não existe mostra o motivo, em vez de sumir.

> [!warning] EM ANDAMENTO — implementada e aprovada visualmente por Matheus
> Em 04/10/2026, 00:13, Matheus viu a tela funcionando num print com os 6 pontos preenchidos e disse "por enquanto está ótimo". Falta validar em 3 situações reais: pedido com mediação de verdade, pedido encerrado sem mediação e pedido ainda não cadastrado pela Ana. O acompanhamento mora em [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]].

## Contexto

A tela **Consultar Pedido** é onde a Ana busca um pedido do Mercado Livre e vê os dados dele cruzados com o que ela cadastrou no sistema (ver [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]). Matheus quer que essa tela seja **o ponto de entrada da Ana sempre que ela quiser ver os detalhes completos de um pedido, não importa em que fase ele esteja** — recém-chegado, em reclamação, em mediação ou já encerrado.

Termos usados nesta nota, para quem nunca viu o assunto:

- **Reclamação**: o caso que o cliente abre no Mercado Livre dizendo que há problema com a compra.
- **Mediação**: quando o Mercado Livre entra como árbitro entre vendedor e cliente. Neste projeto, "abertura da mediação" tem um significado exato, decidido por Matheus em 03/10/2026: é o momento em que a Ana recebeu a devolução, percebeu um defeito no produto e abriu mediação com o Mercado Livre para contestar o cliente (ver [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]]).
- **Recebido (cliente)**: quando o cliente recebeu o produto que comprou. **Recebido (nós)**: quando a devolução chegou de volta na empresa.

## A questão a decidir

Como mostrar, numa linha só, a história do caso inteira — da venda ao fim da mediação — de um jeito que a Ana veja de relance **quanto tempo passou entre cada etapa** e se a reclamação veio dentro do prazo de 7 dias, sem esconder as etapas que ainda não aconteceram?

## O que levou à decisão — alternativas consideradas

| Alternativa | Resultado | Por quê |
|---|---|---|
| Faixa simples só com 4 datas (Venda, Recebido pelo cliente, Reclamação aberta, Recebido por nós) | Aplicada primeiro, depois ampliada | Boa para começar, mas não mostrava o tempo entre as datas nem a mediação |
| Ideia de Matheus: mostrar o tempo entre cada par de datas na linha que liga uma data à outra, com aviso dos 7 dias e um 5º ponto "MD" (mediação) | Aprovada como conceito | O tempo entre as etapas é o que a Ana realmente quer comparar de relance |
| Parar no 5º ponto (mediação aberta) | Descartada | Matheus esclareceu: "MD" era só abreviação por falta de espaço no desenho dele e a ideia era ir **até o fim da mediação** |
| Linha do tempo com 6 pontos, indo até a mediação encerrada | **Escolhida** (mockup v2 aprovado: "esta correto implemente assim") | Cobre o caso do começo ao fim |
| Usar como "abertura da mediação" a data da primeira mensagem de disputa vinda da API do Mercado Livre | Descartada | É outra coisa: a data da mensagem não é o ato da Ana de abrir a mediação (decisão de 03/10/2026) |
| Esconder os pontos que ainda não têm data | Descartada | O objetivo é ver a linha completa em qualquer fase; um ponto vazio precisa dizer **por que** está vazio |

## Decisão tomada

### Os 6 pontos e de onde vem cada data

| # | Ponto | De onde vem a data | Quem registra |
|---|---|---|---|
| 1 | Venda | Data de criação do pedido no Mercado Livre | Mercado Livre |
| 2 | Recebido (cliente) | Data em que o cliente recebeu o produto (a tela já obtinha esse dado) | Mercado Livre |
| 3 | Reclamação aberta | Data de criação da reclamação (`date_created` do claim) | Mercado Livre |
| 4 | Recebido (nós) | Data em que a devolução chegou até nós (a tela já obtinha esse dado) | Mercado Livre |
| 5 | Mediação aberta | Campo `data_abertura_mediacao` da devolução cadastrada ("Mediação aberta em") | **Ana, manualmente** |
| 6 | Mediação encerrada | Do Mercado Livre: `date_closed` da devolução, ou `resolution.date_created` da reclamação quando o caso terminou sem devolução física. Se o Mercado Livre não informar, usa o campo `data_finalizacao_mediacao` ("Mediação finalizada em") preenchido pela Ana | Mercado Livre, com reserva manual |

O ponto 6 só mostra data se o caso **teve mediação** — ou seja, o Mercado Livre classificou o caso como mediação, ou a Ana registrou a abertura no cadastro. Caso encerrado sem mediação mostra "—".

**Por que o ponto 5 é manual**: na rotina da Ana, a devolução normalmente é cadastrada no sistema **antes** de ela abrir a mediação (primeiro o pacote chega, depois ela confere e só então percebe o defeito). Por isso não existe como o sistema descobrir sozinho esse momento.

Todas as datas são convertidas para o fuso de exibição do sistema (`FUSO_HORARIO_EXIBICAO`) **antes** de contar os dias — sem isso, uma data guardada em UTC perto da meia-noite podia cair no dia errado (mesma classe de problema de [[Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição]]).

### O tempo entre as datas e o aviso dos 7 dias

- Sobre a linha que liga dois pontos aparece o tempo em dias corridos ("9 dias", "13 dias"). No mesmo dia, aparece "mesmo dia".
- Entre **Recebido (cliente)** e **Reclamação aberta** o tempo vira um aviso do prazo de 7 dias para o cliente reclamar depois de receber: **verde "dentro dos 7"** quando passaram 7 dias corridos ou menos, **vermelho "fora dos 7"** quando passaram mais. É a mesma contagem que o sistema já usava em `Devolucao.reclamacao_dentro_do_prazo`, para as duas telas nunca discordarem.
- Se as datas vierem em ordem impossível (por exemplo, a reclamação aparece antes da entrega), o chip diz "antes da entrega" nesse trecho dos 7 dias e "fora de ordem" nos demais, em vez de mostrar um número negativo.

### O que cada ponto vazio mostra

| Ponto | Situação | Texto mostrado |
|---|---|---|
| Recebido (nós) | Caso sem devolução física | "sem devolução física" |
| Recebido (nós) | Caso encerrado, sem registro de entrega | "sem registro de entrega" |
| Recebido (nós) | Devolução a caminho | "ainda não chegou" |
| Mediação aberta | Caso sem mediação | "sem mediação" |
| Mediação aberta | É mediação e já está cadastrada, mas sem data | "sem data registrada" |
| Mediação aberta | Pedido ainda não cadastrado pela Ana | "ainda não cadastrada" |
| Mediação encerrada | Caso sem mediação | "—" |
| Mediação encerrada | Caso encerrado, sem data do ML | "sem data informada" |
| Mediação encerrada | Mediação em andamento | "em andamento" |

Quando falta uma das duas pontas, a linha entre os pontos fica **tracejada** e não mostra tempo (não há como calcular).

### Como a linha se adapta à largura

As regras olham a largura do cartão da tela, não a da janela (ver [[Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao]] para o motivo):

| Largura do cartão | O que muda |
|---|---|
| até 1020 px | O chip fica curto: "2 dias ✓" ou "✕" |
| até 900 px | Os rótulos dos pontos quebram em 2 linhas |
| até 700 px | 2 pontos por linha, sem a linha de ligação; o tempo aparece embaixo da data ("N dias depois") |

## Exemplo / consequência

Caso mostrado no print que Matheus enviou na sessão de 03 para 04/10/2026:

| De | Para | Dias | Chip mostrado |
|---|---|---|---|
| Venda — 01/09/2026 | Recebido (cliente) — 10/09/2026 | 9 | "9 dias" |
| Recebido (cliente) — 10/09/2026 | Reclamação aberta — 12/09/2026 | 2 | "2 dias · dentro dos 7" (verde) |
| Reclamação aberta — 12/09/2026 | Recebido (nós) — 25/09/2026 | 13 | "13 dias" |
| Recebido (nós) — 25/09/2026 | Mediação aberta — 29/09/2026 | 4 | "4 dias" |
| Mediação aberta — 29/09/2026 | Mediação encerrada — 01/10/2026 | 2 | "2 dias" |

Exemplo hipotético para o lado vermelho: se o cliente tivesse recebido em 10/09 e reclamado em 20/09, o chip mostraria "10 dias · fora dos 7" em vermelho.

**Onde está no código**: funções `_dia_local`, `_tempo_entre` e `_montar_datas_do_caso` em `integracao_mercado_livre/views.py`, chamadas dentro de `view_consultar_pedido`; HTML em `integracao_mercado_livre/templates/integracao_mercado_livre/consultar_pedido.html` (bloco "Datas do caso"); estilo em `integracao_mercado_livre/static/integracao_mercado_livre/css/layout_consultar_pedido.css`.

**O que ainda não foi validado**:

- [ ] Pedido com mediação real (aberta pela Ana, encerrada pelo Mercado Livre)
- [ ] Pedido encerrado sem mediação (deve mostrar "sem mediação" e "—")
- [ ] Pedido ainda não cadastrado (deve mostrar "ainda não cadastrada")

## Relacionado

- [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]]
- [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]]
- [[Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao]]
- [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]
- [[Relato Completo do Fluxo Real de Devolução Depois que o Pacote Chega — 8 Fases e Cruzamento com o Vault]]
- [[Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição]]
