---
tipo: tutorial
dominio: python
status: ativa
criado: 12/10/2026
atualizado_em: 12/10/2026 04:51
relacionado: [Substituir a Tela Sem SKU de Vendas por uma Lista por Produto Anuncio e Codigo ML, MLB Compartilhado por Mais de um SKU e Vendido Sem seller_sku Pode Dar Numero Diferente na Lista e na Tela do Produto, Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios, Checkpoint - Historico de Vendas e Calendario de Vendas, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Tutorial — Como Testar a Lista de Vendas e Conferir Contra a Tela do Produto

## Contexto (por que este tutorial existe)

A lista nova de vendas ([[Substituir a Tela Sem SKU de Vendas por uma Lista por Produto Anuncio e Codigo ML]]) foi escrita e verificada num **banco de teste**. Os **números** dela ainda não foram conferidos com os dados reais de Matheus. A **tela** ele já abriu no navegador e, às 04:51, foram ajustados as fotos, o cartão do anúncio e o layout fixo (itens 11 a 14 da tabela abaixo). Este tutorial diz **o que rodar, o que olhar e como ler o resultado**, em duas partes: (1) um teste **visual** na tela e (2) um script de **conferência de números** que compara a lista com a tela do produto.

> [!info] Tudo aqui é só leitura
> Nada abaixo chama o Mercado Livre nem grava no banco. O script faz só `SELECT`; a tela da lista só lê o banco. A única coisa que chama o ML nesta tela continua sendo o clique em "Coletar período da conta" (e os botões "Atualizar" do produto): **não clique neles para este teste**.

## Parte 1 — Teste visual da tela

### Preparação (na pasta do projeto, no seu computador)

```powershell
python manage.py check
python manage.py runserver
```

`check` deve terminar sem erro. Depois abra no navegador a tela **"Vendas — Histórico de vendas"** (pelo menu, como sempre), **sem escolher nenhum SKU**. No navegador, atualize com **Ctrl + F5** para o CSS e o JavaScript novos não virem do cache.

### O que olhar (um item de cada vez)

| # | Faça | Resultado esperado |
|---|---|---|
| 1 | Abra a tela sem SKU | Aparece a **lista** (não mais "Produtos encontrados" nem "Mais vendidos") e, no topo, a faixa de **cobertura** do período |
| 2 | Clique nos três botões: **Produto (SKU)**, **Anúncio (MLB)**, **Código ML** | A tabela muda; o endereço passa a ter `gran=mlb` ou `gran=codigo` (a visão Produto é a padrão e pode não aparecer no endereço) |
| 3 | Troque o período (semana até ano) | Os números mudam; o padrão é "Últimos 3 meses" |
| 4 | Clique na **seta** de uma linha de SKU | Abrem os anúncios (MLB) de dentro; a seta indica aberto (e fecha ao clicar de novo) |
| 5 | Clique em **Abrir todos** e depois **Fechar todos** | Só as linhas da página atual abrem e fecham |
| 6 | Clique no título de uma coluna (unidades, faturamento, média…) | A ordem muda e a seta de sentido aparece; clicar de novo inverte |
| 7 | Use a busca, a marca e os filtros de situação, tendência e origem | A lista encolhe e aparece o botão para **limpar** os filtros |
| 8 | Troque o **Por página** (10, 25, 50, 100) e vá para a página 2 | A paginação funciona e mantém os filtros |
| 9 | Clique no botão do **calendário** de um SKU | Abre a tela do produto (calendário) do mesmo SKU e do mesmo período |
| 10 | Volte | A lista reaparece com os mesmos filtros |
| 11 | Olhe as **fotos** de produtos e de anúncios | As imagens aparecem; quando alguma não abre, surge um **ícone** (e não o quadrado quebrado do navegador). Se faltarem muitas, anote o endereço de uma foto que não abre |
| 12 | Na visão **Anúncio (MLB)**, olhe um cartão | Foto, selos (status, tipo, logística, Flex e catálogo), título com botão de copiar, MLB (copiar e abrir no Mercado Livre), SKU, Código ML e preço médio, no mesmo formato da tela "Estoque no Full". Clicar no título abre o calendário do anúncio |
| 13 | Abra e feche a **barra lateral** (menu da esquerda) com a lista na tela | Os filtros, os cartões de resumo e as linhas **ficam nas mesmas linhas**; só a largura da coluna do nome muda. Nada pula de linha |
| 14 | Estreite a janela do navegador (ou use zoom acima de 100%) | A tabela passa a **rolar para o lado**, e as linhas do cartão do anúncio não quebram |

**O que observar além do funcionamento:** o chip **"vs. anterior"** (Subindo, Estável, Caindo, "Sem comparação", "Novo"), a linha **"Sem cadastro"** e o aviso de unidades sem SKU, e se a **foto** e o **título** de cada produto fazem sentido.

### Se alguma coisa estiver errada

Anote o que fez (visão, período, filtros e o endereço da barra do navegador) e, se aparecer erro, copie o **texto do erro** do terminal onde o `runserver` está rodando. Mande isso na conversa: com o endereço eu reproduzo o caso.

## Parte 2 — Script de conferência de números

### O que ele confere

O script `scripts_exploracao_ML/conferir_lista_de_vendas_contra_a_tela_do_produto.py`:

1. Calcula a **lista inteira uma vez** para o período escolhido.
2. Confere que a **soma das unidades** das três visões (SKU, MLB e Código ML) é **igual** à **soma direta no banco** (sem cancelados).
3. Escolhe uma **amostra de SKUs** (os mais vendidos, alguns sorteados, alguns sem venda e os que você listar) e, para cada um, abre a **tela do produto** e compara: unidades, pedidos, faturamento, Full e fora do Full e as unidades de cada MLB.
4. Mostra a quantidade de unidades da linha **"Sem cadastro"** e grava um JSON com tudo.

Ele **não** compara "média por dia" e "vs. anterior" **de propósito**: a lista usa a cobertura da **conta toda** e a tela do produto usa a cobertura **daquele produto**, então esses dois números podem diferir sem ser erro. Só as **unidades somadas** têm que bater sempre.

### Como configurar e rodar

No começo do arquivo, o bloco **CONFIGURA AQUI ANTES DE RODAR**:

| Variável | Padrão | Para quê |
|---|---|---|
| `CONTA` | `"MB"` | `"MB"` (Magazine) ou `"SV"` (Samvale): escolhe o banco |
| `PERIODO` | `"3meses"` | `semana`, `mes`, `3meses`, `6meses` ou `ano` |
| `QUANTOS_DOS_MAIS_VENDIDOS` | 15 | SKUs que mais venderam |
| `QUANTOS_ALEATORIOS_COM_VENDA` | 15 | sorteados entre os demais com venda |
| `QUANTOS_SEM_VENDA` | 3 | SKUs sem venda (a tela do produto também tem que dizer 0) |
| `SKUS_EXTRAS` | `[]` | SKUs que você quer conferir de qualquer jeito, ex.: `["F7908050719121.001"]` |
| `SEMENTE_DO_SORTEIO` | 12 | mesma semente, mesma amostra |

```powershell
python -u "scripts_exploracao_ML/conferir_lista_de_vendas_contra_a_tela_do_produto.py"
```

Sugestão: rode primeiro com o padrão, depois com `PERIODO = "ano"`, e coloque o **SKU de teste** em `SKUS_EXTRAS` (ele é o que tem os 3 MLBs fora do cadastro).

### Como ler o resultado

| Aparece | Significa | O que fazer |
|---|---|---|
| Tabela "Soma das unidades do período" com **OK** nas três linhas | As 3 visões contam as **mesmas vendas** e batem com o banco | Nada |
| **DIFERE** em alguma visão | A lista perdeu ou duplicou venda | **Mande a tabela** na conversa: é erro da lista |
| "SKUs conferidos: N · iguais: N · com diferença: 0" | A lista e a tela do produto **concordam** nesses SKUs | Nada |
| Tabela "SKUs com diferença" | Em cada SKU aparece **o número que difere** (ex.: `unidades: lista 12 × tela 14`, ou `MLB123…: lista 3 × tela 5`) | Ver [[MLB Compartilhado por Mais de um SKU e Vendido Sem seller_sku Pode Dar Numero Diferente na Lista e na Tela do Produto]] e mandar a tabela |
| "Linha 'Sem cadastro' da lista: N un" | Unidades que **não dá para ligar a nenhum SKU** | Se for 0, ótimo. Se não, veja a lista: pode ser anúncio fora do cadastro (como os 3 MLBs de [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]) |
| "JSON salvo em `exploracao_conferencia_da_lista_de_vendas_MB.json`" | Tudo guardado, incluindo **todas** as diferenças (a tela mostra no máximo 25) | Mandar o arquivo se pedirem |

### Exemplo de leitura (ilustrativo, números inventados)

```text
Soma das unidades do período
  Soma direta no banco (sem cancelados)   8.412   referência
  Lista por SKU                           8.412   OK
  Lista por MLB                           8.412   OK
  Lista por Código ML                     8.412   OK
SKUs conferidos: 33 · iguais: 33 · com diferença: 0
Linha 'Sem cadastro' da lista: 0 un
```

Esse é o resultado **ideal**: tudo fecha e nada sobra sem SKU. Se aparecer um "com diferença", **não é automaticamente erro de código**: pode ser o caso descrito na dúvida acima, que é uma decisão de regra, não um defeito.

## Armadilhas conhecidas

- O JSON é **sobrescrito** a cada execução (um por conta). Para guardar um resultado, renomeie o arquivo antes de rodar de novo.
- Para a conta **SV**, troque `CONTA = "SV"`. Sem isso o script lê a empresa errada (o padrão é a Magazine).
- A tela da lista usa o **período de hoje** (a data muda a janela). Comparações feitas em dias diferentes podem diferir por causa do dia novo.
- A tela do produto e a lista arredondam o faturamento de modos diferentes; o script compara em **centavos**, a partir dos valores calculados e não dos textos.
- Com a barra lateral aberta e a janela menor que uns 1800 px (ou com zoom acima de 100%), a tabela **rola para o lado**: é de propósito (largura mínima de 1500 px), para as linhas não mudarem de altura quando a barra abre ou fecha.
- Depois de mexer no CSS, atualize com **Ctrl + F5**; senão o navegador pode mostrar o estilo antigo.

## Relacionado

- [[Substituir a Tela Sem SKU de Vendas por uma Lista por Produto Anuncio e Codigo ML]]
- [[MLB Compartilhado por Mais de um SKU e Vendido Sem seller_sku Pode Dar Numero Diferente na Lista e na Tela do Produto]]
- [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
