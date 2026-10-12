---
tipo: descoberta
dominio: 
status: ativa
criado: 10/10/2026
atualizado_em: 10/10/2026 20:04
relacionado: [Abandonar o Endpoint de Operacoes do Full para o Historico de Vendas, Checkpoint - Historico de Vendas e Calendario de Vendas, Padrao de Robustez para Clientes de API Externa, Niveis de Granularidade do Full e Como os Dados se Ligam]
resumo: "O endpoint de operações do Full (GET /stock/fulfillment/operations/search) respondeu 429 em 8 de 25 chamadas da sondagem e em 34 de 51 tentativas das 3 rodadas reais do coletor, já com 1 SKU; sem cabeçalho de espera, sem relação com o peso da chamada ou com o espaçamento, e o scroll devolve 404 quando repetido depois de um 429."
---

# Endpoint de Operações do Full Falha com 429 e 404 de Scroll, Mesmo com 1 SKU

## Resumo

O endpoint `GET /stock/fulfillment/operations/search` (histórico de operações de estoque do Full) devolveu erro **429** (cota estourada) em boa parte das chamadas, mesmo testando só **1 SKU** (3 Códigos ML), e o **scroll** (continuação da lista) devolve **404** quando é repetido depois de um 429. A taxa de 429 não mudou com o peso da chamada nem com o espaçamento entre chamadas. Essa nota guarda os números reais, o que a página oficial diz, o que NÃO sabemos e onde está o código — para nada disso se perder.

> [!success] Status: ativa (fato observado em 10/10/2026)
> Os números abaixo foram medidos em 10/10/2026 (sondagem às 18:33 e 3 rodadas reais do coletor às 19:43). Com base neles, a decisão foi **abandonar este endpoint** para o histórico de vendas: [[Abandonar o Endpoint de Operacoes do Full para o Historico de Vendas]]. O contexto geral do trabalho está em [[Checkpoint - Historico de Vendas e Calendario de Vendas]].

## Contexto

### O que é esse endpoint

Toda vez que o estoque de um **Código ML** (o `inventory_id`, a "etiqueta" do estoque guardado no Full — ver [[Niveis de Granularidade do Full e Como os Dados se Ligam]]) muda — por venda, cancelamento, devolução, recebimento de envio etc. — o Mercado Livre registra uma **operação**. Esse endpoint lista essas operações. Doc oficial: "Envios Fulfillment" (salva em `Fontes/Envios Fulfillment.txt`).

| Parâmetro | O que faz |
|---|---|
| `seller_id` | Id da conta vendedora |
| `inventory_id` | Um ou vários Códigos ML separados por vírgula |
| `date_from` / `date_to` | Intervalo em dias (UTC); `date_to` é **exclusivo** |
| `type` | Tipo da operação (opcional): `SALE_CONFIRMATION`, `SALE_CANCELATION`, `SALE_DELIVERY_CANCELATION`, `SALE_RETURN` etc. |
| `limit` | Operações por página, no máximo 1000 |
| `scroll` | "Senha" da próxima página; expira em 5 minutos; vazio/nulo = acabou a lista |

Limites da doc: intervalo máximo de **60 dias** por chamada, e só os **últimos 12 meses**. Venda aparece como quantidade **negativa** em `detail.available_quantity`. A operação **não traz o MLB nem dados do comprador**, e vendas fora do Full (Coleta, Agência, Flex) **não geram operação**.

### Por que escolhemos esse endpoint (e o que ele nunca entregou)

Foi escolhido (cabeçalho de `investigar_vendas_full_por_codigo.py`) por 3 motivos: poucas chamadas (até 1000 operações por chamada, vários Códigos juntos); separa Full de fora do Full sem chamar `/shipments` para cada pedido (o pedido só traz o `shipping_id`, a logística mora no envio); e permite parear cancelamento com a venda por `shipment_id` + Código (61 de 62 pareados). Ele **nunca** daria vendas por MLB nem vendas fora do Full — isso exige `/orders/search`.

### Termos usados nesta nota

| Termo | Significado |
|---|---|
| **429** | Erro HTTP "excesso de requisições / cota estourada" |
| **404** | Erro HTTP "não encontrado" |
| **Chamada lógica** | Um pedido de página; o nosso cliente tenta até 5 vezes antes de desistir, então 1 chamada lógica pode ter várias **tentativas** |
| **Sem scroll / com scroll** | Primeira página de uma busca (sem scroll) × páginas seguintes (com o `scroll` da página anterior) |
| **Janela** | Intervalo de datas pedido (aqui, até 46 dias) |

## O problema

Precisamos do histórico de vendas de **mais de mil SKUs** para o calendário e a previsão de ruptura. Já com **1 SKU** (3 Códigos) o endpoint falha muito e de forma imprevisível. A pergunta: isso é um problema nosso (ritmo, peso da chamada) ou do endpoint?

## O que levou à resposta

### 1. Sondagem de 10/10/2026 (18:33 às 18:38) — 25 chamadas

Script `scripts_exploracao_ML/sondar_limite_operacoes_full.py` (só leitura). Resultado: **15 OK, 8 × 429, 2 × 404**.

| Hipótese testada | Resultado | Leitura |
|---|---|---|
| "Chamada pesada é mais bloqueada" (1 Código + `limit=1` × 3 Códigos + `limit=1000`) | 3 de 8 × 2 de 8 com 429 (p = 1,0) | Nenhuma diferença: o peso da chamada não importa |
| "Janela antiga é mais bloqueada que a recente" | 1 de 8 × 4 de 8 (p = 0,282) | Inconclusivo, amostra pequena |
| "Esperar 15 s entre chamadas evita o 429" | 5 de 16 primeiras páginas ainda deram 429 | Não evita: o espaçamento não resolve |
| "Repetir o mesmo scroll resolve" | 1ª tentativa: 3 de 6 deram 429; repetindo o mesmo scroll 5 s depois: 1 de 3 passou, 2 deram 404; somando com os logs do Passo 2: 1 de 6 | Scroll repetido depois de 429 quase nunca funciona |

Outros fatos da sondagem: **nenhuma** resposta trouxe cabeçalho de limite/espera (sem `Retry-After`); os totais se repetiram idênticos (1463 operações na janela recente de 46 dias, 1471 na antiga; página 1 com 1000 linhas + o resto); **toda** condição sem scroll acabou passando (o pior caso: 2 min 19 s seguidos de 429). Linha do tempo das 25 chamadas (`.` OK, `X` 429, `N` 404): `...XNXXX.X..XN.X..X......` — os 429 vêm em **rajadas**, independentes do nosso ritmo.

### 2. Página oficial sobre 429

`Fontes/Rate limit _ Erro 429.html` (atualizada em 05/05/2026) diz: 429 = excesso de requisições em pouco tempo; usar espera exponencial com variação aleatória (*backoff com jitter*); evitar reenvios em massa; reduzir concorrência; consolidar chamadas; o limite é **por Client ID "na maioria dos casos"** e **por endpoint**; o tamanho da resposta **não** conta; 429 em scroll é atribuído a scroll expirado, repetido ou aberto por muito tempo; para aumentar a cota, contatar a "equipe de integrações comerciais" com evidência de uso. **Não** traz números e **não** menciona `Retry-After`.

### 3. As 3 rodadas reais do coletor (10/10/2026, 19:43 às 19:46)

Comando: `coletar_operacoes_full --empresa magazine --produto F7908050719121.001 --dias N`, lido do log `integracao_mercado_livre/logs/Magazine/full_ml.log`.

| Rodada | Pedido | Tentativas | 200 | 429 | 404 | Resultado |
|---|---|---|---|---|---|---|
| 1 | `--dias 90` | 37 | 12 | 23 | 2 | **Concluída**: 3061 operações, 1 min 40 s, cobertura de 12/07 a 11/10/2026 nos 3 Códigos, sem falha |
| 2 | `--dias 120` | 10 | 2 | 8 | 0 | Interrompida por Ctrl+C na espera de 60 s do coletor, antes da parte antiga |
| 3 | `--dias 150` | 4 | 1 | 3 | 0 | Interrompida por Ctrl+C poucos segundos depois |
| **Total** | | **51** | **15** | **34 (67%)** | **2** | |

Por janela e tipo de chamada:

| Janela | Sem scroll | Com scroll |
|---|---|---|
| 12/07 a 27/08 | 4 × 200, 8 × 429 | 1 × 200 |
| 27/08 a 11/10 | 6 × 200, 8 × 429 | 1 × 200, 7 × 429, 2 × 404 |
| 04/10 a 11/10 (margem de 7 dias, rodadas 2 e 3) | 3 × 200, 11 × 429 | — |

Em **chamadas lógicas** (19 no total): das 15 sem scroll, **13 terminaram em 200** (5 na 1ª tentativa, 3 na 2ª, 1 na 3ª, 2 na 4ª, 2 na 5ª), **1 esgotou as 5 tentativas com 429** (rodada 2, margem de 7 dias, tipo `SALE_DELIVERY_CANCELATION`) e **1 foi interrompida** (rodada 3). Das 4 com scroll, 2 passaram de primeira e **2 terminaram em 404 depois de várias tentativas 429** — o coletor recomeçou a janela e descartou 2000 linhas repetidas.

## Resposta: o que ficou comprovado

| Fato | Evidência |
|---|---|
| O 429 aparece mesmo com 1 SKU | 34 de 51 tentativas nas rodadas reais; 8 de 25 na sondagem |
| O peso da chamada não muda a taxa | 3/8 × 2/8 (p = 1,0) |
| Espaçar 15 s não evita | 5 de 16 primeiras páginas com 429 |
| Nenhuma pista de quando tentar de novo | Zero cabeçalhos de limite/espera em todas as respostas |
| A taxa varia no tempo | 32% (8/25) às 18:33; 67% (34/51) às 19:43 — causa desconhecida |
| Profundidade do histórico não é a causa | Janela antiga: 8/12 com 429; janela do meio: 8/14; margem de 7 dias recentes: 11/14 |
| Scroll repetido depois de 429 costuma virar 404 | 2 de 2 nas rodadas reais; 1 de 3 passou na sondagem |
| A mensagem do 429 não é a da doc | Veja o exemplo abaixo |

## O que NÃO sabemos

> [!warning] Hipóteses e lacunas (nada disso foi confirmado)
> - **Escopo da cota**: o 429 cita uma entidade interna (`operation_kvs_ds_v2__fbm_seller_stock_operations`). A hipótese é um repositório chave-valor (*KVS*) interno de operações do Full, talvez compartilhado entre vendedores — mas **não há prova**. Não sabemos se a cota é por app, por vendedor ou global.
> - **Horário**: não sabemos se a taxa de 32% × 67% vem do horário ou do nosso padrão de tentativas.
> - **Menos chamadas**: nunca medimos o máximo de Códigos por chamada nem o efeito de omitir `type` (ficaria 1 chamada em vez de 4 por janela).
> - **Evitar scroll**: dividir a janela por data até caber em 1000 operações nunca foi testado.
> - **Profundidade acima de 90 dias**: 120 e 150 dias **não foram testados** (Ctrl+C antes da parte antiga).
> - Não há como falar com o Mercado Livre por ora; se algum dia houver, os dados desta nota servem de evidência de uso.

## Exemplo

Corpo real do 429 desse endpoint (note que **não** é o texto "excedeu requests por minuto" da doc):

```json
{"message": "Entity operation_kvs_ds_v2__fbm_seller_stock_operations is over quota", "error": "over_quota", "status": "429"}
```

Corpo real do 404 do scroll repetido:

```json
{"message": "Operation not found", "error": "not_found", "status": "404"}
```

Sequência real da rodada 1 na janela de 27/08 a 11/10, tipo `SALE_CONFIRMATION`, páginas com scroll (19:44:03 a 19:44:20): 4 tentativas com 429 (esperas do cliente de 1,3 / 2,1 / 4,7 / 8,0 s) e a 5ª tentativa devolveu **404** — o coletor recomeçou a janela do zero.

## Onde está o código desse endpoint (preservado, não apagado)

| Arquivo | Papel |
|---|---|
| `api_mercado_livre/full_ml.py` | `FullML` e o pacote de página — única função que chama o endpoint |
| `integracao_mercado_livre/servicos/coletar_operacoes_full_ml.py` | Coletor API → banco (janelas de 46 dias, 4 tipos, esperas, cobertura) |
| `integracao_mercado_livre/management/commands/coletar_operacoes_full.py` | Comando manual `--empresa --produto [--dias]` |
| `mercado_livre/models/operacao_full.py` | Modelos `OperacaoFullMercadoLivre` e `CoberturaOperacaoFullMercadoLivre` (migração `0035`) |
| `scripts_exploracao_ML/investigar_vendas_full_por_codigo.py` | Investigação do Passo 2 |
| `scripts_exploracao_ML/sondar_limite_operacoes_full.py` + `sondagem_limite_operacoes_full_MB.json` | Sondagem de 10/10/2026 (25 chamadas) |

Cada um desses arquivos recebeu, em 10/10/2026 às 20:04, um bloco de comentário explícito com o resumo dos problemas desta nota.

## Relacionado

- [[Abandonar o Endpoint de Operacoes do Full para o Historico de Vendas]] — a decisão que nasceu destes fatos.
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]] — estado geral do trabalho.
- [[Padrao de Robustez para Clientes de API Externa]] — regra de espera/retentativa que o cliente já segue.
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]] — os níveis do Full (Produto, Anúncio, Código ML, Envio).
