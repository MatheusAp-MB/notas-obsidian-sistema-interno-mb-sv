---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao, Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou, Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate, Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "O filtro order.date_created.to do /orders/search lê a hora inteira: com to = 00:00 do dia seguinte, a busca de um dia traz também os pedidos de 00:00 a 00:59 do dia seguinte, lidos 2 vezes pela coleta (ano: 1.072 a mais; semana: 19; SKU de teste: 7). Confirmado no banco e na API real (24/11/2025: 477 = 465 + 12; com to = 23:00, 465 exatos). O banco nunca ficou errado."
---

# O Filtro de Hora do Orders Search Lê a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes

## Resumo

Em 12/10/2026 foi confirmado, por **duas vias independentes** (as contas do banco e 2 chamadas reais à API), que o filtro `order.date_created.to` do `/orders/search` **ignora minutos e segundos e lê a hora inteira**. O coletor de vendas mandava `to = 00:00 do dia seguinte`; por isso a busca de cada dia trazia também os pedidos criados de **00:00 a 00:59 do dia seguinte**. Esses pedidos eram lidos **2 vezes**: uma na janela do dia e outra na janela do dia seguinte.

O efeito é só na **contagem de "pedidos lidos"** e em cerca de **1,3% de leituras repetidas** (uns 20 de 1.870 chamadas no ano). **O banco nunca ficou errado**: cada pedido ocupa 1 linha (chave única `order_id` + `posicao`), então a segunda leitura só regravou a mesma linha.

> [!success] Status: confirmada (12/10/2026)
> Hipótese testada no banco (as diferenças previstas bateram) e na API real (o total mudou exatamente como previsto). A correção (`to = fim − 1 hora`) está aplicada no código e foi **validada na API real** em 12/10/2026 (dia, mês e ano fecham com o banco: [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]); a decisão e o estado dela estão em [[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]].

## Contexto

O coletor de vendas (`integracao_mercado_livre/servicos/coletar_vendas_ml.py`) lê o `/orders/search` em **janelas**. Na coleta da conta toda, cada janela é **1 dia**, de `00:00` do dia D até `00:00` do dia D+1 (o fim é *exclusivo* na lógica do coletor: o pedido de 00:00:00 do dia D+1 pertence ao dia D+1). Cada janela é paginada de 50 em 50 pedidos (`limit=50`, `offset`).

Termos usados aqui:

| Termo | O que é |
|---|---|
| **Janela** | O intervalo de datas de uma busca (`order.date_created.from` até `order.date_created.to`). |
| **Hora 0 do dia seguinte** | Os pedidos criados entre 00:00:00 e 00:59:59 do dia D+1. |
| **Pedidos lidos** | O contador `pedidos_lidos` do relatório da coleta: soma os pedidos que cada janela devolveu, **sem** tirar os que já apareceram em outra janela. |
| **Chave única do pedido** | `VendaItemMercadoLivre` tem `order_id` + `posicao` únicos; gravar de novo o mesmo pedido substitui a linha (`upsert`). |

A doc de Orders (`Fontes/Orders.txt`) e o cabeçalho de `api_mercado_livre/pedidos_ml.py` já diziam que o filtro de data "usa até a hora" (medido em 10/10/2026), mas a **consequência para o `to`** ainda não tinha sido percebida.

## O problema

Depois da coleta do ano (11/10/2025 a 11/10/2026), a conta **não fechava**: a coleta dizia ter lido **84.510 pedidos**, mas o banco tinha **83.438** na janela. Por que o banco tinha 1.072 a menos do que a coleta leu? Faltava pedido, ou sobrava leitura?

## O que levou à resposta

**1. As contas, no banco** (script `investigar_diferencas_entre_coletas_so_no_banco.py`, só leitura, **zero chamada à API**):

| Coleta | Pedidos lidos | Pedidos no banco | Diferença |
|---|---|---|---|
| Ano da conta (11/10/2025 a 11/10/2026) | 84.510 | 83.438 | −1.072 |
| Semana da conta (04/10 a 11/10/2026) | 1.226 | 1.207 | −19 |
| SKU de teste, 42 trechos | 16.876 | 16.869 | −7 |

**2. Hipóteses descartadas.** Nenhuma linha gravada pela coleta do ano tinha `dia_venda` fora da janela (então fuso e borda do dia não explicam). Um primeiro teste olhou só os pedidos **exatamente à meia-noite** e achou 0; isso levou a uma conclusão errada ("não explica") até o teste ser corrigido para olhar a **hora 0 inteira** (00:00 a 00:59).

**3. A hipótese e a conta prevista.** Se a hora 0 do dia seguinte é lida 2 vezes, então `diferença prevista = −(pedidos da hora 0 lidos 2×) + (pedidos que a coleta não releu)`:

| Coleta | Observado | Previsto | Leitura |
|---|---|---|---|
| Ano | −1.072 | −1.073 (1.074 da hora 0, menos 1 não relido) | **sobra +1** (ver adiante) |
| Semana | −19 | −19 | bate |
| SKU de teste | −7 | −7 | **42 de 42 trechos** batem, um a um |

**4. A confirmação na API real** (script `conferir_filtro_de_hora_do_orders_search.py`, **2 chamadas de 1 pedido**, nada é gravado). Dia escolhido no banco: 24/11/2025, que tem 465 pedidos, 12 pedidos na hora 0 de 25/11 e 9 na hora 23 de 24/11.

| Chamada | `to` enviado | Total que o ML anunciou | Conta |
|---|---|---|---|
| 1 (como o coletor fazia) | 25/11/2025 00:00 | **477** | 465 (dia 24) + 12 (hora 0 do dia 25) |
| 2 (correção candidata) | 24/11/2025 23:00 | **465** | o dia exato, incluindo a hora 23 inteira |

O `from` **não precisa de ajuste**: `from = 00:00` já começa no primeiro instante do dia.

## Resposta

O filtro de data **trabalha em horas inteiras**: o `to` com qualquer minuto de uma hora lê **aquela hora inteira**. Para ler o dia D sem repetir nada, a janela deve ser `[00:00 de D, 00:00 de D+1)` em horas cheias, e o `to` enviado à API deve ser **`fim − 1 hora`** (`23:00` de D). A correção está em 1 só lugar do código: `_buscar_pagina` em `coletar_vendas_ml.py` (e a trava `_exigir_janela_em_horas_cheias`, que recusa janela fora de hora cheia).

## Exemplo

Dia 24/11/2025 (conta MB):

```text
to = 25/11/2025 00:00  ->  ML anuncia 477 pedidos  (465 do dia 24 + 12 da hora 0 do dia 25)
to = 24/11/2025 23:00  ->  ML anuncia 465 pedidos  (exatamente o dia 24)
```

Quando o dia 25/11 for lido, os mesmos 12 pedidos voltam na janela dele. Na coleta antiga, eram 12 leituras repetidas só neste par de dias; no ano inteiro, **1.074 pedidos da hora 0** foram lidos em dobro.

## Efeito e limites

- **Banco:** não muda. **Pedidos lidos:** passa a ser exato (cerca de 1,3% menor). **Custo:** economiza cerca de 20 das 1.870 chamadas do ano.
- **Validado em 12/10/2026 (02:41):** com a correção, a coleta fecha com o banco no dia 08/07 (200 pedidos), no mês (4.674) e no ano (83.049): [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]].
- **Sobra +1 no ano:** a previsão esperava 1 leitura a mais do que houve. **Explicada em 12/10/2026 (02:41):** a coleta antiga não recebeu **2 pedidos** que o ML deixou de entregar numa janela (08/07, refeito depois no banco, e 19/11/2025, recuperado pela recoleta): lidos −2 e banco −1 dão −1.073 + 2 − 1 = −1.072, exatamente o observado. Conta em [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]] e mecanismo em [[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]; o texto do 2º aviso não foi guardado, então 19/11 é provável, não provado.
- **Não medido:** janela de exatamente 1 hora (`from` = `to`) contra a API real; só importa se uma hora tiver mais de 10.000 pedidos (o coletor divide janelas grandes nas horas cheias).
- Na chamada 2, o script comparou o "pedido mais novo" e estranhou; era erro do script, não do ML: a ordem da lista **não é** por data de criação ([[O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao]]). O veredito passou a usar só o total.

## Relacionado

- [[O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao]]
- [[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]
- [[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]]
- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
