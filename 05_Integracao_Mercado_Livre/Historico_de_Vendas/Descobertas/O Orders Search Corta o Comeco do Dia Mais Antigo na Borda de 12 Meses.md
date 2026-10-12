---
tipo: descoberta
dominio: 
status: ativa
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [Onde Fica o Corte do Orders Search na Borda de 12 Meses e se Ele Muda Durante o Dia, O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes, Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Medido em 12/10/2026 01:14: o /orders/search devolve só PARTE do dia mais antigo (11/10/2025: ML 196 × banco 197; o pedido de 03:45:38 foi cortado; o 1º que vem é de 06:05:04); os dias 12/10 e 13/10/2025 vêm inteiros. O pedido que 'faltava' na coleta não foi perdido pela coleta: o ML cortou o começo do dia. Correção aplicada em 12/10/2026 01:35: FOLGA_DO_LIMITE_ML_DIAS = 1."
---

# O Orders Search Corta o Começo do Dia Mais Antigo na Borda de 12 Meses

## Resumo

O Mercado Livre guarda pedidos por **até 12 meses** (`Fontes/Orders.txt`). Em 12/10/2026, às 01:14, 3 chamadas à API mostraram que **o dia mais antigo que ainda vem na busca (11/10/2025) vem PARCIAL**: o ML devolveu **196** pedidos e o banco tem **197**. O pedido que não vem é o mais cedo do dia (criado às **03:45:38**); o primeiro que o ML entrega nesse dia é o das **06:05:04**. Os dias seguintes (12/10 e 13/10/2025) vêm **inteiros**.

Isso resolve o caso do "pedido da borda": o pedido `2000013371968158` estava no banco só porque uma coleta **anterior** o viu quando o corte ainda estava mais atrás; a coleta do ano **não o perdeu**, o ML **parou de entregá-lo**.

> [!info] Status: ativa
> Medido 1 vez (12/10/2026 01:14), 1 dia parcial, 1 pedido. A explicação "o ML corta o começo do dia mais antigo" (chamada de **(A)** nas conversas) está **confirmada para este dia**. **Onde exatamente fica o corte** e **se ele se move durante o dia** ainda não se sabe: [[Onde Fica o Corte do Orders Search na Borda de 12 Meses e se Ele Muda Durante o Dia]].

## Contexto

A tela de vendas permite o período "Último ano" (de 11/10/2025 a 11/10/2026, medido em 11/10/2026). A coleta da conta toda começa o primeiro dia às 00:00. No banco, esse primeiro dia (11/10/2025) tinha **1 pedido que nenhuma coleta recente releu** (`2000013371968158`, criado 11/10/2025 03:45:38, SKU `F7908050719121.001`, MLB `MLB3346875129`, status `paid`), gravado pela última vez em 10/10/2026 22:12 (uma coleta por produto anterior). A dúvida era: **a coleta do ano perdeu esse pedido** ou **o ML não o entrega mais**?

Em 11/10/2026 já se tinha visto que o ML "devolveu o dia exato de 12 meses atrás" (comentário em `integracao_mercado_livre/servicos/cobertura_vendas_ml.py`); isso era verdade, mas **não** dizia que o dia vinha inteiro.

## A pergunta

O dia mais antigo da janela de 12 meses vem **inteiro** ou **cortado** na API?

## O que levou à resposta

**Hipóteses.** (A) o ML corta o começo do dia mais antigo (então o pedido de 03:45:38 não vem mais); (B) o ML entrega o dia inteiro e a coleta perdeu o pedido (por exemplo, no 2º aviso do ano, cujo texto não foi guardado).

**O teste** (script `conferir_borda_de_12_meses_do_orders_search.py`, **3 chamadas** de 1 pedido, nada gravado): conta, para 3 dias seguidos, o `paging.total` que o ML anuncia e compara com o banco. O 1º dia é o dia anterior ao "dia de 12 meses atrás" (11/10/2025, pois hoje é 12/10/2026), o 2º é o dia exato (12/10/2025) e o 3º (13/10/2025) é o **controle** (um dia que tem de vir inteiro, para provar que o teste funciona).

| Dia | Banco | ML | Estado |
|---|---|---|---|
| 11/10/2025 | 197 | 196 | **PARCIAL** (falta 1; último cortado 03:45:38; o 1º que vem é 06:05:04) |
| 12/10/2025 | 203 | 203 | INTEIRO |
| 13/10/2025 (controle) | 332 | 332 | INTEIRO |

Como o controle veio inteiro, o teste vale: a hipótese **(A)** está confirmada; **(B) fica descartada** para este pedido.

## Resposta

O `/orders/search` **corta o começo do dia mais antigo** do histórico de 12 meses. Na medição de 12/10/2026 01:14, o corte ficou **entre 03:45:38 e 06:05:04** do dia 11/10/2025. Consequências:

- O **primeiro dia** coletado pode ter **menos pedidos** do que ele realmente teve. Nas contas de **ritmo de venda** ele não pode ser tratado como dia inteiro.
- A coleta que o **leu em outro momento** (quando o corte estava mais atrás) deixa no banco pedidos que as releituras novas não confirmam: não é falha da coleta.

**Correção aplicada em 12/10/2026, 01:35:** `FOLGA_DO_LIMITE_ML_DIAS = 1` em `integracao_mercado_livre/servicos/cobertura_vendas_ml.py`. O primeiro dia coletado passa a ser o dia **seguinte** ao exato: **13/10/2025** em 12/10/2026 (o 12/10/2025, que veio inteiro no teste, fica de fora por segurança); a tela mostra sozinha o aviso **"limite do ML"** no período "Último ano" (como Matheus pediu em 11/10/2026); o coletor não pede mais o dia da borda; o comentário "MEDIDO em 11/10/2026" foi corrigido. O limite anda sozinho com a data (em 13/10/2026 o primeiro dia será 14/10/2025). **Não foi preciso recoletar nada para a correção:** o banco já tinha os dias de 11/10/2025 em diante; os dias 11 e 12/10/2025 (400 linhas, entre elas o pedido parcial de 11/10) continuam guardados, só não aparecem mais na tela. Tratar o 1º dia como parcial nas contas de ritmo **não foi implementado**: só é necessário se o primeiro dia voltar a vir parcial (aí a folga sobe).

> [!info] Correção e confirmação de 12/10/2026, 02:41
> A versão de 01:35 desta nota dizia que o primeiro dia coletado em 12/10/2026 era 12/10/2025 e que em 13/10/2026 seria 13/10/2025. **Estava errado por 1 dia**: o certo é **13/10/2025** hoje e **14/10/2025** em 13/10/2026 (`primeiro_dia_do_ml` = 12 meses atrás + 1 dia). A recoleta do ano (02:10) começou em 13/10/2025: o dia veio **inteiro** (332 pedidos, os mesmos da foto das 02:07) e os 400 pedidos de 11 e 12/10/2025 ficaram fora da janela, preservados ([[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]).

## Exemplo

Em 12/10/2026 01:14:

```text
11/10/2025  banco 197  ML 196  -> PARCIAL (falta o pedido das 03:45:38)
12/10/2025  banco 203  ML 203  -> INTEIRO
13/10/2025  banco 332  ML 332  -> INTEIRO (controle)
```

## Limites

- Medido **1 vez**, com 1 pedido de diferença. A hora do corte pode mudar com o horário em que a coleta roda (hipótese de um corte por volta das 06:00 BRT; **não provada**).
- Só a conta MB.

## Relacionado

- [[Onde Fica o Corte do Orders Search na Borda de 12 Meses e se Ele Muda Durante o Dia]]
- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
