---
tipo: decisao
dominio: css
status: concluida
criado: 04/10/2026
atualizado_em: 04/10/2026 00:13
relacionado: [Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026), Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias, Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida, Validacao Mobile em Aparelho Real - Teste Real Liberado em 02-10-2026]
---

# Topo da Consultar Pedido Agrupado por Assunto — Foto Dupla e Layout Adaptável à Largura do Cartão

**Resumo**: o topo da tela Consultar Pedido foi reorganizado em 3 grupos por assunto (Dados do produto, Dados da venda, Devolução e reclamação), mostra a foto do anúncio e a do cadastro interno lado a lado, tem botões de copiar pequenos e muda de layout conforme a largura do próprio cartão — não da janela — para caber no monitor de 20" da Ana sem perder dados e sem quebrar com a barra lateral aberta ou no celular.

> [!success] CONCLUÍDA — aplicada e aprovada por Matheus
> Aplicada na pasta do projeto e aprovada por Matheus em 04/10/2026, 00:13 ("por enquanto está ótimo"). Pendências de refinamento (não pedidas por ele) estão em [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]].

## Contexto

Quem usa: a Ana, num monitor de 20" com tela de 1440×900 (cerca de 735 px de altura útil no navegador). Quem testa: Matheus, num monitor de 27" QHD, bem maior — por isso um layout que parece ótimo para ele pode estourar no monitor dela. O desafio: mostrar o **máximo de dados** de um pedido sem a Ana precisar rolar a tela. A medição real do monitor da Ana já tinha sido feita em outra frente (ver [[Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor]]).

Termos usados: **anúncio** é a página do produto à venda no Mercado Livre; **MLB** é o código dele (ex.: MLB123…); **SKU** é o código interno do produto na empresa; **cadastro interno** é o produto como a empresa o cadastrou no sistema.

## A questão a decidir

Como organizar os dados do topo para que (1) cada informação deixe claro **o que é e por que está ali**, (2) ocupe pouco espaço vertical e (3) funcione no monitor da Ana, na tela grande de Matheus e no celular?

## O que levou à decisão — alternativas consideradas

| Situação | Alternativa | Resultado | Por quê |
|---|---|---|---|
| Agrupamento | Produto / Cliente / Pedido (1ª versão aprovada por Matheus) | Substituída | Matheus achou o bloco "bagunçado": faltava agrupar e deixar claro o que é cada informação |
| Agrupamento | **Dados do produto / Dados da venda / Devolução e reclamação** | **Escolhida** | Agrupa por assunto; cada grupo responde a uma pergunta da Ana |
| Fotos | Foto do anúncio e do cadastro interno empilhadas | Descartada | Ocupava espaço vertical demais |
| Fotos | **Anúncio e cadastro interno lado a lado** | **Escolhida** | Economiza altura; ambas ficam visíveis |
| Economia de espaço | Entre as opções de faixas apresentadas, a **opção C**: Produto em cima, outras informações lado a lado embaixo, busca fina só depois de consultar | **Escolhida** (Matheus: "aplique") | Menor altura no monitor pequeno |
| Como adaptar à largura | Olhar a largura da janela | Descartada | Quando a barra lateral abre ou fecha, a janela continua igual mas o cartão encolhe ou cresce (um print de Matheus com a barra lateral aberta chegou a mostrar o Número da venda quebrando no meio do número) |
| Como adaptar à largura | **Olhar a largura do próprio cartão** (container queries do CSS) | **Escolhida** | O layout reage ao espaço que realmente existe |

## Decisão tomada

### Os 3 grupos

| Grupo | O que mostra |
|---|---|
| **Dados do produto** | Foto e dados do **anúncio** do Mercado Livre (com o MLB e o SKU) e, ao lado, o **cadastro interno** (foto, nome, marca e código de barras). Se o produto não tem cadastro interno, aparece uma caixa tracejada dizendo isso. Com vários itens no pedido, as fotos diminuem de 96 px para 72 px |
| **Dados da venda** | Número da venda, ID do cliente (a rotulagem diz "da etiqueta" para caber em 1 linha), nome do cliente e quanto foi vendido (quantidade × preço) |
| **Devolução e reclamação** | Situação do caso (selo), unidades voltando (e o tipo de devolução, quando há unidades voltando) e se o pedido já está "No nosso sistema" |

Abaixo dos grupos vêm a linha do tempo (ver [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]) e o rodapé com as ações: botão **"Abrir devolução"** (se já está cadastrada) ou **"Criar devolução"** (se não está) e os links **"Ver no Mercado Livre"** (Pedido, Reclamação e Mediação).

### Os 3 dados novos que Matheus escolheu — e os que descartou

| Escolhidos | Descartados |
|---|---|
| Unidades voltando | Peso e medidas |
| Marca e código de barras do cadastro interno (com botão de copiar) | Variação |
| Tipo de envio | Garantia |
| | Cidade do cliente |
| | ID do envio de volta |
| | Cancelamento do pedido |

### Fotos

- A foto do anúncio vem em tamanho grande (sufixo **-F** na URL da imagem do Mercado Livre).
- Clicar na foto abre o **modal de fotos** do sistema, o mesmo padrão do resto das telas (`card-fotos-item` e `data-fotos-id`, ver [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]]).
- A galeria tem todas as fotos do anúncio: a capa sempre aparece; as demais **só carregam quando a Ana expande ou navega** (nada é pré-carregado, para não pesar).
- **Por que mostrar também a foto do cadastro interno**: a 1ª imagem de alguns anúncios é uma arte estilizada, não o produto em si — a foto do cadastro interno mostra o produto real.

### Botões de copiar

Existem em SKU, MLB, nome do cliente e código de barras, para a Ana colar o dado em outra tela sem digitar. Matheus pediu para ficarem **menores** ("estavam roubando muito espaço e ficando feio, devem existir, mas menores"): hoje são só um ícone de 20 px, com a área de clique ampliada por um respiro invisível de 4 px ao redor.

### Layout conforme a largura do cartão

- A partir de **1500 px** de largura de cartão: os 3 grupos ficam lado a lado, em 3 colunas.
- Abaixo disso: **Dados do produto** ocupa uma faixa inteira em cima; **Dados da venda** e **Devolução e reclamação** ficam lado a lado embaixo (a venda um pouco mais larga) e, se não couberem, empilham em 1 coluna.
- O Número da venda e o ID do cliente **nunca quebram no meio do número** (ficam em uma linha só, com uma largura mínima própria).
- Em celular (cartão com cerca de 342 px) nada passa da borda do cartão.

## Exemplo / consequência

Medido numa **réplica da tela** (HTML e CSS reais rodados no Chromium com dados de teste, em larguras de 272 a 1642 px; não é o sistema rodando com a Ana):

| Situação | Resultado |
|---|---|
| Largura que simula o monitor da Ana (1115 px e 1375 px de cartão) | O bloco de dados ocupa cerca de 532 px e termina perto de 696 px de altura — cabe nos ~735 px úteis; a linha do tempo soma cerca de 110 px |
| Monitor de 27" (cerca de 1642 px) | Cerca de 415 px de altura, em 3 colunas |
| Pedido com **2 produtos** na largura da Ana | Termina perto de 800 px — passa um pouco dos ~735 px, pedindo uma rolagem curta |

**Onde está no código**: `integracao_mercado_livre/templates/integracao_mercado_livre/consultar_pedido.html` (topo) e `integracao_mercado_livre/static/integracao_mercado_livre/css/layout_consultar_pedido.css` (o cartão é declarado como contêiner chamado `topo`, com `container-type: inline-size`, e as regras `@container topo (...)` fazem as mudanças).

## Relacionado

- [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]]
- [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]
- [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]]
- [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]]
- [[Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor]]
- [[Validacao Mobile em Aparelho Real - Teste Real Liberado em 02-10-2026]]
- [[Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca-Foto e Motivo Literal Adiados]]
