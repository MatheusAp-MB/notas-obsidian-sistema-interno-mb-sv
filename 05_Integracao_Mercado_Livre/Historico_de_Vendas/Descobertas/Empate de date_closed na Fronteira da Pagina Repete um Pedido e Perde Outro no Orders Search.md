---
tipo: descoberta
dominio: 
status: ativa
criado: 12/10/2026
atualizado_em: 12/10/2026 01:15
relacionado: [O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao, O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes, Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou, Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Reproduzido na API real: quando 2 pedidos têm o mesmo date_closed (precisão de 1 segundo) e caem na fronteira entre 2 páginas, o ML troca a ordem do par entre uma chamada e a outra; um pedido vem nas duas páginas e o outro não vem em nenhuma. Em 08/07/2026 (pedidos 99|100, fechados 16:13:21) isso aconteceu em 2 de 4 repetições; é o mecanismo do aviso 'anunciou 202, vieram 201'. Raro: 4 de 365 dias."
---

# Empate de `date_closed` na Fronteira da Página Repete um Pedido e Perde Outro no Orders Search

## Resumo

O aviso da coleta do ano ("De 08/07 00:00 a 09/07 00:00 o ML anunciou **202** pedidos e vieram **201**") ficou sem explicação por horas. Em 12/10/2026 o mecanismo foi **reproduzido na API real**: como o `/orders/search` ordena por `date_closed`, que tem precisão de **1 segundo** ([[O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao]]), dois pedidos fechados no mesmo segundo ficam **empatados**. Se esse par cai exatamente entre duas páginas (o último da página A e o primeiro da página B), o ML às vezes **troca a ordem do par entre uma chamada e a outra**: aí **um dos dois pedidos vem nas duas páginas** (o coletor descarta a repetição) e **o outro não vem em nenhuma**. A janela fecha com 1 pedido a menos que o ML anunciou.

> [!info] Status: ativa
> Mecanismo reproduzido em 2 de 4 repetições, **no mesmo par** que estava na fronteira em 08/07/2026. Não prova que foi esta a causa do aviso daquele dia (nunca saberemos o que o ML devolveu na hora), mas é **a explicação mais forte** e combina com os dados. O 2º aviso da coleta do ano perdeu o texto e **não foi identificado**.

## Contexto

A coleta lê cada janela em páginas de 50 pedidos: a página A traz as posições 0 a 49 (`offset=0`), a página B as posições 50 a 99 (`offset=50`), e assim por diante, sempre na ordem de `sort=date_desc`. O coletor junta os pedidos pelo **id**, então um pedido que aparece em duas páginas conta uma vez só. Depois de paginar, ele compara o que veio com o `paging.total` que o ML anunciou; se vieram menos, grava um **aviso** na coleta.

| Termo | O que é |
|---|---|
| **Fronteira de página** | O ponto entre a última posição de uma página e a primeira da próxima (por exemplo, posições 99 e 100 com `limit=50` partindo de 50). |
| **Empate** | Dois pedidos com o mesmo `date_closed` (mesmo segundo). A API não diz qual vem primeiro. |
| **Janela antiga** | A janela que o coletor usava antes da correção: o dia **mais** a hora 0 do dia seguinte ([[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]). |
| **Janela nova** | Só o dia, com `to = fim − 1 hora`. |

## O problema

Por que o ML anunciou 202 pedidos para 08/07/2026 e entregou só 201, sem erro nenhum na chamada? E isso pode acontecer em outros dias sem o coletor perceber?

## O que levou à resposta

**1. Hipótese.** Empate de `date_closed` exatamente na fronteira entre duas páginas + o ML trocando a ordem do par entre as chamadas.

**2. Quanto empate existe? (banco, zero chamada à API)** Script `investigar_empates_de_fechamento_nas_paginas_so_no_banco.py`: para cada dia de 12/10/2025 a 11/10/2026, simula as posições da janela (antiga e nova) e procura 2 pedidos de fechamento igual colados numa fronteira de página de 50.

| Janela | Dias com empate numa fronteira | Média de grupos empatados por dia |
|---|---|---|
| Antiga (dia + hora 0 seguinte) | **4 de 365 (1,1%)** | 0,8 |
| Nova (só o dia) | **4 de 365 (1,1%)** | 0,79 |

Os 4 dias candidatos da **janela antiga**:

| Dia | Pedidos na janela | Fronteira (posição) | Fechados em (Brasília) |
|---|---|---|---|
| 22/01/2026 | 361 | 250 | 22/01 12:05:36 |
| 11/04/2026 | 238 | 50 | 11/04 19:44:02 |
| 12/05/2026 | 279 | 250 | 12/05 08:14:56 |
| **08/07/2026** | **202** | **100 (posições 99\|100)** | **08/07 16:13:21** |

No dia do aviso, a janela antiga tem **202 pedidos no banco** (os mesmos 202 que o ML anunciou) e **tem** o empate na fronteira 99\|100. Na janela nova esse dia tem 200 pedidos e **não** tem empate na fronteira (a fronteira mudou de lugar).

**3. Reprodução na API real.** Script `conferir_reproducao_do_empate_na_api.py`: 4 repetições; em cada uma, 2 chamadas de 50 pedidos (páginas em volta da fronteira 100) com a **mesma janela** do aviso, 8 chamadas no total. O par empatado: pedidos `2000017319548724` e `2000017319344256`, ambos fechados em 08/07/2026 16:13:21.

| Repetição | Último da página A | Primeiro da página B | Distintos / esperado | Resultado |
|---|---|---|---|---|
| 1 | `…548724` | `…548724` | 99 / 100 | **reproduziu** (repetido `…548724`, faltou 1) |
| 2 | `…344256` | `…548724` | 100 / 100 | normal |
| 3 | `…344256` | `…548724` | 100 / 100 | normal |
| 4 | `…344256` | `…344256` | 99 / 100 | **reproduziu** (repetido `…344256`, faltou 1) |

O ML anunciou 202 em todas. O par trocou de ordem **entre chamadas** do mesmo teste.

## Resposta

Empate de `date_closed` na fronteira de página **faz o `/orders/search` repetir um pedido e perder outro** quando o ML troca a ordem do par entre as chamadas. É raro (4 de 365 dias candidatos, e só vira perda se o ML trocar a ordem), **mas acontece de verdade**, sem erro e só com `paging.total` para denunciar.

**Proteção aplicada:** o coletor lê de novo a janela que não fechou, com **páginas de outro tamanho (45 e 40)**, para a fronteira cair em outro ponto e os pedidos que faltavam entrarem. Funciona qualquer que seja a causa do pedido perdido. Ver [[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]].

## Exemplo

Dia 08/07/2026, janela antiga, 202 pedidos, páginas de 50:

```text
Página que termina na posição 99:  ... pedido A (fechado 16:13:21)
Página que começa na posição 100:  pedido B (fechado 16:13:21) ...
Se o ML troca A e B entre as duas chamadas:
   a 1ª chamada termina em A, a 2ª começa em A   (A repetido)
   B não aparece em nenhuma das duas             (B perdido)
Resultado: 201 pedidos distintos; o ML anunciou 202.
```

O "Atualizar dia" de 08/07/2026 (5 chamadas) leu o dia de novo e trouxe os 202 pedidos (o ML não trocou o par naquela vez), o que corrigiu o banco.

## Limites

- O **2º aviso** da coleta do ano **não foi identificado** (o texto não foi guardado; agora todos os avisos ficam gravados na coleta). Entre os 4 dias candidatos da janela antiga, os outros 3 são **hipóteses** para ele: 22/01, 11/04 e 12/05/2026; não foi verificado.
- A reprodução foi num dia só e em 4 repetições; não diz com que frequência o ML troca o par.
- Pedido sem `date_closed` (ainda não pago) pode mudar de posição por outro motivo: **não medido**.
- A **sobra +1** do ano ([[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]) é compatível com este pedido perdido em 08/07; plausível, não provado.

## Relacionado

- [[O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao]]
- [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]
- [[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]]
- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
