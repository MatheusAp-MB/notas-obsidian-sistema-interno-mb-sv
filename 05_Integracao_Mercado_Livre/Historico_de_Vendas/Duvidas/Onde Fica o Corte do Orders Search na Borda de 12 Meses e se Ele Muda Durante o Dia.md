---
tipo: duvida
dominio: 
status: em_aberto
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses, Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Em que horário o /orders/search corta o dia mais antigo (medido: entre 03:45:38 e 06:05:04 de 11/10/2025, às 01:14 de 12/10/2026) e se esse corte anda durante o dia? Hipótese não provada: corte fixo perto das 06:00 BRT. Resolver com 3 a 6 chamadas de 1 hora cada no dia mais antigo; não bloqueia a correção FOLGA_DO_LIMITE_ML_DIAS = 1."
---

# Onde Fica o Corte do Orders Search na Borda de 12 Meses e se Ele Muda Durante o Dia?

## Resumo

Sabemos que o `/orders/search` **corta o começo do dia mais antigo** do histórico de 12 meses ([[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]). **Não sabemos em que horário** o corte fica (só que, na medição, ficou entre **03:45:38** e **06:05:04** de 11/10/2025) **nem se ele se move** ao longo do dia ou de um dia para o outro.

> [!question] Status: em aberto
> Não impediu a correção principal: a coleta já começa **um dia à frente** (`FOLGA_DO_LIMITE_ML_DIAS = 1`, aplicada em 12/10/2026 01:35). Serve para saber **quanto** do primeiro dia o ML entrega e se esse número muda conforme a hora em que a coleta roda.

## Contexto

O Mercado Livre guarda pedidos por até 12 meses (`Fontes/Orders.txt`). Pelo que foi medido:

| Quando | O que se viu |
|---|---|
| 10/10/2026 22:12 | Uma coleta por produto **ainda viu** o pedido criado em 11/10/2025 às 03:45:38 (`2000013371968158`) |
| 11/10/2026 23:17 a 23:33 | A coleta do ano **não viu** esse pedido; o primeiro pedido que ela leu em 11/10/2025 foi o das 06:05:04 |
| 12/10/2026 01:14 | O teste de borda confirmou: 11/10/2025 vem com 196 de 197 pedidos; o pedido de 03:45:38 não vem; o das 06:05:04 vem |

O corte ficou **mais atrás** que "12 meses exatos" (12 meses antes de 12/10/2026 01:14 seria 12/10/2025 01:14, e o ML ainda entregou parte do dia 11/10/2025).

## A pergunta

Em que hora do dia mais antigo o ML começa a entregar pedidos, e esse horário muda com o horário da chamada?

## O que já se sabe

| Fato | Fonte |
|---|---|
| Corte entre 03:45:38 e 06:05:04 de 11/10/2025 | [[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]] |
| Em 10/10/2026 22:12 o pedido das 03:45:38 ainda vinha | data de gravação do pedido no banco |
| Em 11/10/2026 23:17 e em 12/10/2026 01:14 o primeiro pedido do dia era o das 06:05:04 | coleta do ano e script de borda |
| Os dias 12/10 e 13/10/2025 vieram inteiros em 12/10/2026 01:14 | script de borda |
| Em 12/10/2026, de 02:10 a 02:26, a recoleta do ano leu o dia 13/10/2025 inteiro: 332 pedidos, os mesmos da foto das 02:07 (nenhuma linha da janela ficou sem ser tocada) | [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]] |

## O que NÃO sabemos

> [!warning] Lacunas
> - A **hora exata** do corte (qualquer ponto entre 03:45:38 e 06:05:04).
> - Se o corte é **fixo** (por exemplo, perto das 06:00 de Brasília, uma limpeza diária do ML) ou **anda** com a hora em que se pergunta. Há hipótese de corte por volta das 06:00 BRT, **sem prova**.
> - Se o corte é pela data de **criação**, de **fechamento** ou outra coisa.
> - Se na conta SV o comportamento é o mesmo.

## Como resolver

1. Ler o dia mais antigo **hora a hora**: o filtro de data trabalha em horas inteiras, então 1 chamada de 1 pedido por hora (de 00:00 a 06:00 do dia mais antigo = 6 chamadas) compara o `paging.total` de cada hora com o banco e mostra a hora em que o ML passa a entregar tudo.
2. Repetir o teste de borda (`conferir_borda_de_12_meses_do_orders_search.py`, 3 chamadas) em **outro horário** (de manhã e à tarde) e comparar `ultimo_cortado` e `primeiro_que_vem`: se mudarem, o corte anda.
3. Se o corte for estável, registrar o horário e deixar a tela dizer "limite do ML (dia parcial)"; se andar, manter o primeiro dia sempre como parcial.

## Relacionado

- [[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]
- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
