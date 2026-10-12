---
tipo: decisao
dominio: python
status: em_andamento
criado: 12/10/2026
atualizado_em: 12/10/2026 04:51
relacionado: [Checkpoint - Historico de Vendas e Calendario de Vendas, Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos, Niveis de Granularidade do Full e Como os Dados se Ligam, Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios, MLB Compartilhado por Mais de um SKU e Vendido Sem seller_sku Pode Dar Numero Diferente na Lista e na Tela do Produto, Tutorial - Como Testar a Lista de Vendas e Conferir Contra a Tela do Produto, Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Nao Mexer no Coletor de Vendas por Enquanto]
resumo: "Em 12/10/2026 Matheus aprovou o mockup e mandou aplicar (os 4 ciclos de uma vez): a tela 'Vendas — Histórico de vendas' sem SKU deixa de ser busca + 'Mais vendidos' e vira uma lista por Produto (SKU), Anúncio (MLB) ou Código ML, com Full × fora do Full, média por dia e 'vs. anterior'; clicar numa linha abre o calendário do produto. Lê só do banco, em 4 consultas. Aplicado no código. Às 04:51, depois de ele ver a tela no navegador, foram feitos 3 ajustes: fotos que não apareciam, anúncio (MLB) no formato do cartão do Estoque no Full (Hub) e layout fixo (nada muda de lugar quando a barra lateral abre ou fecha). Falta ele testar no banco real."
---

# Substituir a Tela Sem SKU de Vendas por uma Lista por Produto, Anúncio e Código ML

## Resumo

Matheus pediu uma **lista granular de vendas** parecida com a que foi feita para o estoque no Full: uma linha por **Produto (SKU)**, por **Anúncio (MLB)** ou por **Código ML**. Ele deixou claro que essa tela **substitui** a tela antiga "Vendas — Histórico de vendas" que aparecia **sem nenhum SKU aberto** (busca + "Produtos encontrados" + "Mais vendidos"). O **calendário de vendas por SKU continua existindo**: é a tela do produto, que se abre ao clicar numa linha da lista.

Em **12/10/2026, 04:14** (data e hora que ele passou para este registro) o trabalho estava **aplicado no código**, depois de ele aprovar o mockup, dizer "pode aplicar ao código" e preferir que os **4 ciclos fossem feitos de uma vez só**.

Às **04:51** (data e hora que ele passou para este registro), depois de **ver a tela no navegador**, Matheus pediu três ajustes, todos aplicados no código: as **fotos** que não apareciam, os **anúncios (MLB) no formato do cartão do Estoque no Full (Hub)** e um **layout fixo**, que não muda de lugar quando a barra lateral abre ou fecha. Detalhes na seção "Ajustes depois de ele ver a tela no navegador (04:51)".

> [!info] Status: em andamento
> Código escrito e verificado num banco de teste (seção "O que foi verificado"). Matheus **já abriu a tela no navegador** e mandou capturas; os 3 pontos que ele apontou foram ajustados (seção "Ajustes depois de ele ver a tela no navegador"). **Falta ele conferir os ajustes e rodar o script de conferência no banco real.** Nada foi rodado por mim no MySQL dele nem no Mercado Livre. O passo a passo do teste está em [[Tutorial - Como Testar a Lista de Vendas e Conferir Contra a Tela do Produto]].

## Contexto: o que era a tela antiga e por que ela não servia mais

| Antes (sem SKU aberto) | Problema |
|---|---|
| Caixa de busca de produto, "Produtos encontrados" e "Mais vendidos" | Mostrava poucos produtos por vez; não dava para ver **todas as vendas da conta** num período nem comparar com o período anterior |
| Sem Full × fora do Full na visão geral | Só aparecia depois de abrir um SKU |
| Sem visão por anúncio (MLB) nem por Código ML | O Código ML é o **estoque no Full**; sem ele na lista não dá para pensar em reposição |

A necessidade de fundo é a de sempre nesta frente: saber o **ritmo de venda** de cada produto para depois prever ruptura e pedido de compra ([[Checkpoint - Historico de Vendas e Calendario de Vendas]]).

## O que foi decidido

| Ponto | Decisão |
|---|---|
| Três visões | **Produto (SKU)**, **Anúncio (MLB)** e **Código ML**, escolhidas por botões no topo (parâmetro `gran`) |
| Abrir uma linha | A seta abre os anúncios (MLB) de dentro do SKU ou do Código ML; o botão do calendário leva à tela do produto |
| Colunas | Nome, unidades, pedidos, faturamento, unidades Full, unidades fora do Full, média por dia, "vs. anterior" e última venda |
| Períodos | Os mesmos da tela do produto e do coletor: última semana, último mês, **últimos 3 meses (padrão)**, últimos 6 meses, último ano |
| Filtros | Busca, marca, situação (todos, com venda, sem venda, alerta), tendência, origem (Full, fora, ambos) |
| Ordem e página | Todas as colunas ordenam; **25 por página** por padrão (10, 25, 50 ou 100) |
| Fonte dos dados | **Só o banco**. Nada na lista chama o Mercado Livre; a única coisa que chama é o clique em "Coletar período da conta" (e os botões "Atualizar" do produto) |
| Regras de negócio | **As mesmas** da tela do produto, reaproveitadas de `vendas_ml.py` (nada foi reinventado) |

### Regras de cálculo (todas reaproveitadas)

- **Venda cancelada não conta** (a lista já a exclui na consulta).
- **Full × fora do Full** por **uma função só**, `classificar_origem` (as 4 regras de [[Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos]]).
- **Código ML** de uma venda: o da variação do pedido; se não houver, o único Código do MLB (`codigo_do_item`).
- **Ausente não é zero:** dia que a conta toda ainda não coletou **não entra** na média por dia nem no "vs. anterior" (as unidades dele entram só na soma de unidades).
- **Média por dia** = unidades dos dias **completos** ÷ quantidade de dias completos.
- **"vs. anterior"** compara a média por dia com a do período imediatamente anterior, do mesmo tamanho, e **só existe se o período anterior inteiro foi coletado por completo**. Mudança de **10% ou mais** (`LIMITE_DA_TENDENCIA_PCT`) vira Subindo ou Caindo; abaixo disso, Estável. Sem base para comparar: "Sem comparação"; produto sem venda no período anterior: "Novo".

## Interpretações que eu tomei (Matheus não detalhou; ele pode mudar)

> [!warning] Estas decisões são minhas, tomadas para não parar a obra
> 1. **Cobertura da CONTA TODA.** A tela do produto olha a cobertura **daquele produto** (conta toda **ou** todos os MLBs dele coletados um a um). Na lista seriam ~1.000 coberturas diferentes, então a lista usa só a coleta da **conta toda**. Efeito: se Matheus atualizou **um produto sozinho** além do que a conta toda coletou, as unidades dele entram na lista, mas a **média por dia e o "vs. anterior" só consideram os dias que a conta toda coletou**. A faixa no topo da lista mostra essa cobertura.
> 2. **A que SKU uma venda pertence:** ao `seller_sku` do pedido (nos 160 itens medidos antes, 160 traziam). Pedido **sem** `seller_sku` só vai para um SKU quando o MLB (e a variação, se o pedido trouxe) aponta para **um único SKU** no cadastro de anúncios; senão cai na linha **"Sem cadastro"**. Ver a dúvida [[MLB Compartilhado por Mais de um SKU e Vendido Sem seller_sku Pode Dar Numero Diferente na Lista e na Tela do Produto]].
> 3. **MLB fora da tabela de anúncios com `seller_sku` de um SKU** aparece **dentro desse SKU**, com o selo "Fora do cadastro do SKU" (e "Sem cadastro" na visão por MLB). É o caso dos 3 MLBs de [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]: a lista os **mostra**, mas ainda não se sabe o que eles são.
> 4. **"Sem Código ML"** (visão por Código ML): a linha existe, mas os anúncios de dentro dela ficam **limitados aos que tiveram venda, no máximo 60** (`MAX_FILHOS_SEM_CODIGO`), com um aviso na tela. Sem esse limite a linha abriria milhares de anúncios.
> 5. **Padrão de 25 linhas por página** (era preciso escolher algum número; 10, 50 e 100 também existem).
> 6. O chip **"Sem comparação"** aparece quando não há período anterior completo; não é erro.

## Como a lista fica rápida com ~1.000 SKUs

A lista faz **4 consultas ao banco** e o resto é conta em memória; **não há consulta por SKU nem por MLB**.

| # | Consulta | Para quê |
|---|---|---|
| 1 | Variações de anúncio (cadastro) | Ligar MLB e variação ao SKU e ao Código ML |
| 2 | Produtos com `sku__in` | Nome, marca e foto |
| 3 | Linhas de venda do período atual (`values_list`, só as colunas necessárias, **sem cancelados**) | Somar por SKU, MLB e Código ML |
| 4 | Período anterior **já somado** no banco por (`seller_sku`, `mlb`, `variation_id`) | "vs. anterior" |

As linhas de dentro de cada SKU ou Código ML são guardadas em memória na própria conta, para abrir a seta **sem reler o banco**.

## Ajustes depois de ele ver a tela no navegador (04:51)

Matheus abriu a lista no navegador dele e mandou capturas de tela. Saíram três pedidos, todos aplicados direto na pasta do projeto (sem git e sem cópias):

| # | O que ele viu ou pediu | O que foi feito |
|---|---|---|
| 1 | As fotos dos produtos não apareciam ("cadê as fotos?") | Endereço da foto corrigido e ícone de reserva (detalhe abaixo) |
| 2 | "Quero os anúncios neste formato", com a imagem do cartão do Estoque no Full (Hub) | O anúncio (MLB) passou a usar o **mesmo cartão** do Estoque no Full |
| 3 | "As coisas precisam ser fixas na tela... não podem ficar mudando de posição aleatoriamente porque a nav bar abriu" | Layout que não muda quando a barra lateral abre ou fecha |

### 1) Fotos que não apareciam

- **Causa provável (não confirmada, porque não foi possível ver o banco real):** a função `_url_segura` trocava `http://` por `https://` no endereço da foto. As fotos do produto vêm do ERP (campo `imagem_url`) e podem estar num servidor que só responde em `http`; com o endereço trocado a imagem quebra. É a explicação mais provável, **não um fato comprovado**.
- **Correção:** o endereço da foto do produto passa a ser usado **como está** (`http` ou `https`), pela função nova `_url_da_foto`. A `_url_segura` continua só nas fotos de anúncio do Mercado Livre.
- **Reserva:** se uma foto falhar mesmo assim, o `script_vendas_lista.js` troca a imagem quebrada por um **ícone** (imagem para anúncio, caixa para produto) em vez de deixar o quadrado quebrado do navegador. Se ainda faltar foto, o que ajuda a achar a causa é o **endereço de uma foto** que não abre.

### 2) Anúncio (MLB) no formato do Estoque no Full (Hub)

- O cartão usa o **estilo compartilhado** `.cartao-anuncio-*` (`core/static/base_compartilhada/css/layout_cartao_anuncio.css`), o mesmo da tela "Estoque no Full". Os selos vêm do **registro único** de selos (`mercado_livre/funcoes_auxiliares/badges.py`, pela função `_selos_do_anuncio`). **Nada de visual foi copiado** para a tela de vendas: continua havendo uma fonte só.
- **O que o cartão mostra:** foto, selos (status, tipo do anúncio, logística, Flex e papel no catálogo), título (link para o calendário do anúncio, com botão de copiar), MLB (copiar e abrir no Mercado Livre), SKU (copiar), Código ML ("Código ML X", "N Códigos ML" ou "sem Código ML") e o preço médio do período (ou "sem vendas no período").
- **Avisos de cadastro** (selo à parte): "Sem cadastro" (o MLB vendeu mas não está na tabela de Anúncios) e "Fora do cadastro do SKU" (vendeu com o `seller_sku` de um SKU, mas não está entre os anúncios dele). Sem título no cadastro, aparece "Anúncio fora da tabela de Anúncios (sem título)".
- **A foto** do cartão é a do anúncio (imagem principal da variação ou, se faltar, a miniatura); se o anúncio não tiver foto, usa a do produto. Anúncio que não está no cadastro fica sem foto (mostra o ícone).
- **Onde aparece:** na linha principal da visão **Anúncio (MLB)** e nas linhas de **dentro** de um SKU ou de um Código ML. A linha principal da visão Produto (SKU) continua com a foto e o nome do produto.
- **Sem custo novo:** foto, link e selos saem da **mesma consulta de cadastro** que a lista já fazia. Continuam **4 consultas ao banco**, nenhuma por SKU ou MLB.

### 3) Layout fixo: nada muda de lugar quando a barra lateral abre ou fecha

Palavras de Matheus: "As coisas precisam ser fixas na tela.. não podem ficar mudando de posição aleatoriamente pq a nav bar abriu".

- **O problema:** os filtros em chips (Situação, Tendência, Origem), os cartões de resumo e o rodapé **quebravam de linha conforme a largura que sobrava** ao lado da barra lateral. Abrir ou fechar a barra (260 px) mudava quem ficava em qual linha.
- **A regra nova** (vale para esta tela e para telas novas): a **disposição** (quem fica em qual linha e em qual coluna) depende **só da largura da janela** (`@media`), nunca do espaço que sobra ao lado da barra. Acima da tabela não há mais quebra automática (`flex-wrap`, `repeat(auto-fit, ...)`). A regra e o aviso estão no comentário da seção "LAYOUT ESTÁVEL" no fim do `layout_vendas.css`.

| Peça | Como ficou |
|---|---|
| Filtros em chips | Cada grupo (Situação, Tendência, Origem) na **sua linha**, com o nome numa coluna fixa de 96 px |
| "Ver por" e "Período" | Lado a lado em janela de **1500 px ou mais**; um embaixo do outro abaixo disso |
| Ajuda e status da coleta | Lado a lado (1500 px ou mais), **colados à esquerda**; um embaixo do outro abaixo disso |
| "Limpar busca e filtros" | Logo depois dos filtros (antes ia para a ponta direita e andava junto com a largura) |
| Cartões de resumo | **5 colunas** (1500 px ou mais) ou **3** abaixo disso; a altura reserva 2 linhas de texto, assim o cartão não cresce nem encolhe quando o texto quebra |
| Legenda | Sempre 3 colunas |
| Tabela | Largura mínima de **1500 px**; as linhas do cartão do anúncio (selos; MLB, SKU, Código ML e preço médio) **não quebram**; só a coluna do nome estica ou encolhe |
| Janela menor que 1100 px | Volta ao jeito antigo (acomoda pela largura) |

- **Efeito colateral aceito:** se o espaço ao lado da barra for menor que 1500 px, a **tabela rola para o lado** em vez de reorganizar as linhas. Com a barra aberta isso acontece em janelas menores que uns 1800 px (ou com zoom do navegador acima de 100%). Se incomodar, dá para reduzir a largura mínima, mas aí a linha de MLB e SKU volta a poder quebrar (e a altura da linha a mudar com a barra).
- **Como foi medido:** numa página de teste no Chromium, com a marcação da lista e o CSS real do projeto, comparei **barra aberta × fechada** em 6 larguras de janela (2560, 1920, 1700, 1500, 1366 e 1280 px). As posições verticais e as alturas das caixas, dos grupos de chips, dos cartões e das linhas ficaram **iguais** nas duas situações. **Antes** da mudança, em 1600 e em 1366 px havia diferença (cartões e linhas mudavam de altura, chips mudavam de linha). Limite do teste: dados inventados e a fonte do ambiente de teste, **não a dele**; a largura mínima de 1500 px foi calculada com folga para a fonte real.
- Só o `layout_vendas.css` mudou nesta etapa do layout (nenhum CSS compartilhado).

## Endereços (parâmetros da URL)

| Parâmetro | Valores | Observação |
|---|---|---|
| `gran` | `sku`, `mlb`, `codigo` | visão da lista (padrão `sku`) |
| `periodo` | `semana`, `mes`, `3meses`, `6meses`, `ano` | padrão `3meses` |
| `q` | texto | busca |
| `marca` | marca | filtro |
| `sit` | `todos`, `com`, `sem`, `alerta` | situação |
| `tend` | `todas`, `up`, `flat`, `down`, `sem` | tendência |
| `ori` | `todas`, `full`, `fora`, `ambos` | origem |
| `ord` e `dir` | `nome`, `un`, `ped`, `fat`, `fu`, `fo`, `media`, `delta`, `ult` e a direção | ordenação |
| `por` e `pag` | 10, 25, 50, 100 e o número da página | paginação |

O botão do calendário leva a `?sku=...&nivel=...&item=...&periodo=...` (valores padrão ficam de fora do endereço).

## Arquivos (todos em `gestao_vendas/`, todos com fim de linha CRLF como o resto do projeto)

| Arquivo | O que mudou |
|---|---|
| `funcoes_auxiliares/lista_vendas_ml.py` | **Novo.** Todo o cálculo da lista (`montar_lista`). Às 04:51: o cartão do anúncio (`_cartao_do_anuncio`) e a foto do produto sem trocar `http` por `https` (`_url_da_foto`) |
| `funcoes_auxiliares/vendas_ml.py` | `montar_pagina`: sem `sku` devolve a lista; com `sku` devolve a tela do produto. Removidas `buscar_produtos` e `skus_com_vendas` (a busca e o "Mais vendidos" antigos) |
| `templates/gestao_vendas/estrutura_vendas.html` | O ramo "sem SKU" agora inclui a lista; a busca passou a manter os filtros em campos ocultos |
| `templates/gestao_vendas/parciais/estrutura_parcial_lista.html` e `estrutura_parcial_lista_numeros.html` | **Novos.** A tabela da lista e os números de cada linha |
| `templates/gestao_vendas/parciais/estrutura_parcial_lista_anuncio.html` | **Novo (04:51).** O cartão do anúncio (MLB), no formato do Estoque no Full; usado na visão por MLB e nas linhas de dentro de SKU e Código ML |
| `static/gestao_vendas/js/script_vendas_lista.js` | **Novo.** Selects que trocam de página, seta de cada linha e "Abrir todos / Fechar todos". Não chama servidor nem Mercado Livre. Às 04:51: ícone no lugar da foto quebrada e botões de copiar |
| `static/gestao_vendas/css/layout_vendas.css` | Seção nova `vnd-l-*`; removido o CSS morto da tela antiga. Às 04:51: o encaixe do cartão do anúncio e a seção "LAYOUT ESTÁVEL" (no fim do arquivo) |
| `scripts_exploracao_ML/conferir_lista_de_vendas_contra_a_tela_do_produto.py` | **Novo.** Só leitura: confere a lista contra a tela do produto, SKU a SKU |

Nada mudou no coletor: [[Nao Mexer no Coletor de Vendas por Enquanto]] continua valendo.

## Exemplo ilustrativo (números inventados, só para ensinar a conta)

Período "Últimos 3 meses". A conta toda tem coleta completa em 80 dos 85 dias. O SKU **XYZ** vendeu 160 unidades nesses 80 dias e mais 6 num dia ainda não coletado por completo.

- **Unidades na linha:** 166 (a soma inclui o dia incompleto).
- **Média por dia:** 160 ÷ 80 = **2,0** (o dia incompleto fica fora: ausente não é zero).
- Se o período anterior inteiro foi coletado e a média dele era 1,6: (2,0 − 1,6) ÷ 1,6 = **+25%** → **Subindo** (acima de 10%).
- Clicar na linha abre o calendário de XYZ na tela do produto.

## O que foi verificado e o que NÃO foi

| Verificado (num banco de teste fora do projeto, no ambiente da conversa) | Não verificado |
|---|---|
| As 3 visões somam o mesmo total que a soma direta no banco | **Banco real de Matheus** (MySQL) e dados reais |
| A linha da lista bate com a tela do produto em 4 SKUs de teste | **Os ajustes das 04:51 com os dados e a fonte reais dele** (a tela em si ele já viu no navegador) |
| `pyflakes` limpo; `node --check` do JavaScript ok | A página completa com o menu (o modelo-base precisa de bibliotecas que o ambiente de teste não tem; a página foi renderizada sem a moldura) |
| Nenhuma referência sobrou das funções e do HTML antigos | O script de conferência **ainda não foi rodado** no banco dele |
| Todos os arquivos tocados em CRLF | `makemigrations`: **não há migração** nesta mudança (não mexe em modelo); quem confirma é o `check` dele |

## Limites

- Não foi feito git (só Matheus faz commit e push). Também não foram criadas cópias ou backups na pasta do projeto.
- Os testes e a conferência no banco real são **dele**, como combinado.

## Relacionado

- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
- [[Classificar Venda do Full e Fora do Full Pelo node_id do Pedido em 4 Passos]]
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]]
- [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]
- [[MLB Compartilhado por Mais de um SKU e Vendido Sem seller_sku Pode Dar Numero Diferente na Lista e na Tela do Produto]]
- [[Tutorial - Como Testar a Lista de Vendas e Conferir Contra a Tela do Produto]]
- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Nao Mexer no Coletor de Vendas por Enquanto]]
