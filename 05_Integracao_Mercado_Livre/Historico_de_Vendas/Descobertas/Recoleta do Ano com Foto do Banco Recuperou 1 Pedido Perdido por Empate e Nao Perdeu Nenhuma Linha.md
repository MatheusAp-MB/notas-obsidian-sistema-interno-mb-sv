---
tipo: descoberta
dominio: 
status: ativa
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [Nao Apagar o Banco Antes de Recoletar o Ano e Tirar uma Foto Dele Antes, Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate, Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search, O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses, O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Foto do banco (02:07:45) comparada com o banco depois da recoleta do ano da MB (13/10/2025 a 12/10/2026, 1.837 chamadas): +2 itens = 1 pedido de 19/11/2025 que a coleta antiga perdeu (fechado no mesmo segundo que outro pedido) + 1 venda nova de 12/10. 0 linhas sumidas, 0 mudaram de situação, dia ou quantidade, 0 não tocadas; 400 linhas ficam fora da janela por causa da folga de 1 dia. Provável 2º aviso da coleta antiga."
---

# A Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Não Perdeu Nenhuma Linha

## Resumo

Antes de recoletar o ano da conta MB, Matheus tirou uma **foto** do banco (12/10/2026, 02:07:45). Recoletou o ano com "Reler" (início 02:10:31, de 13/10/2025 a 12/10/2026, 365 dias, **1.837 chamadas**, 83.049 pedidos lidos) e comparou. O banco passou de **83.447 para 83.449** itens (e de 88.269 para 88.271 unidades): **+2, e só isso**.

Os 2 itens a mais são: **1 pedido de 19/11/2025 que a coleta antiga tinha perdido** e **1 venda nova** de 12/10/2026. **Nenhuma linha sumiu**, nenhuma mudou de situação, de dia ou de quantidade, e **nenhuma linha da janela ficou sem ser tocada** pela recoleta.

> [!info] Status: ativa
> Uma recoleta, uma conta (MB). O pedido recuperado **combina** com o empate de `date_closed` (fechou no mesmo segundo que outro pedido), mas o empate **não foi reproduzido na API** para este dia, como foi o de 08/07/2026.

## Contexto

A decisão de **não apagar o banco** antes de recoletar e de tirar uma foto antes está em [[Nao Apagar o Banco Antes de Recoletar o Ano e Tirar uma Foto Dele Antes]]. O script `foto_do_banco_de_vendas_ml.py` (só leitura, sem chamada à API e sem dado de comprador) tem dois modos:

| Modo | O que faz | Arquivo gerado |
|---|---|---|
| `FOTO` | Conta pedidos, itens e unidades **por dia** e guarda as linhas | `foto_do_banco_de_vendas_ml_MB_20261012_020745.json` (83.447 itens, 88.269 unidades, 367 dias, 3,6 MB) |
| `COMPARAR` | Acha a recoleta feita depois da foto (tabela de execuções) e compara dia a dia e linha a linha | `comparacao_com_a_foto_do_banco_de_vendas_ml_MB.json` |

## A pergunta

Depois de recoletar o ano inteiro com a coleta corrigida: o que mudou no banco? A coleta antiga tinha perdido pedidos? A nova deixa linhas para trás?

## O que levou à resposta

**Foto × depois da recoleta:**

| | Foto (02:07:45) | Depois da recoleta | Diferença |
|---|---|---|---|
| Itens | 83.447 | 83.449 | +2 |
| Pedidos | 83.447 | 83.449 | +2 |
| Unidades | 88.269 | 88.271 | +2 |

**O que a comparação mediu:**

| Conferência | Resultado |
|---|---|
| Pedidos de dias **anteriores** ao da foto que já existiam no ML e **não estavam** no banco | **1**: pedido `2000013898613648`, de **19/11/2025** (criado 11:29:56, fechado 11:30:44, `paid`, MLB `MLB5112997286`, SKU `F7899612796271.001`), gravado em 12/10/2026 02:24:28 |
| Vendas **novas** do dia da foto em diante | 1 (dia 12/10/2026: de 6 para 7 pedidos) |
| Outras novas | 0 |
| Linhas que **sumiram** do banco | 0 |
| Linhas que mudaram de **situação**, de **dia** ou de **quantidade** | 0, 0 e 0 |
| Linhas da janela **não tocadas** pela recoleta (o ML não devolveu desta vez) | **0** |
| Linhas **fora** da janela (11/10/2025: 197; 12/10/2025: 203) | **400**, preservadas |
| Dias com diferença | 19/11/2025 (339 → 340) e 12/10/2026 (6 → 7) |
| Dia **13/10/2025** (1º da janela, com a folga de 1 dia) | 332 antes e 332 depois: **veio inteiro** |

**Empate de `date_closed`** (pedidos fechados no mesmo segundo que outro):

| Grupo | Pedidos com `date_closed` | Empatados |
|---|---|---|
| Todos os pedidos do banco | 83.449 | 586 (**0,7%**) |
| O pedido recuperado | 1 | 1 (**100%**) |

Um caso só não prova nada sozinho, mas o resultado **vai na direção** do mecanismo do empate ([[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]).

**A conta antiga agora fecha.** Em [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]] a diferença do ano ficou em −1.072 contra −1.073 previstos ("sobra +1"). Com dois pedidos que o ML não entregou nas janelas antigas, a conta fecha exatamente:

```text
Previsto sem perda:   banco − lidos = −1.073
Perdas na coleta antiga:
  08/07  -> 1 a menos em "lidos" (o banco foi refeito depois, com Atualizar dia)
  19/11  -> 1 a menos em "lidos" e 1 a menos no banco (nunca foi gravado até esta recoleta)
Observado: lidos −2 e banco −1  ->  −1.073 + 2 − 1 = −1.072   (bate)
```

(Conta feita à mão em 12/10/2026 02:41, com os números já medidos.) Isso também diz **qual foi o 2º aviso** da coleta antiga do ano: o texto não foi guardado, mas **19/11/2025 é o mais provável**; o aviso de 08/07 já era conhecido.

## Resposta

1. A coleta antiga **perdeu 1 pedido** que o banco não tinha: 19/11/2025. A coleta nova o **recuperou**.
2. A coleta nova **não deixou nada para trás**: 0 linhas não tocadas, 0 sumidas.
3. A recoleta **não mexeu** em situação, dia nem quantidade de nenhuma linha (intervalo de cerca de 3 horas).
4. Na coleta antiga do ano, **2 dias de 365** (08/07 e 19/11) perderam 1 pedido cada; na nova, **0 de 365** janelas ficaram sem fechar.

## Limites

- **Uma** recoleta, **uma** conta. A SV não foi medida.
- O empate de 19/11/2025 **não foi reproduzido na API**; a ligação com o empate é indício (100% de empate no perdido, contra 0,7% no geral), não prova.
- A simulação **só do banco** ([[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]) **não podia** apontar 19/11: o pedido perdido não estava no banco, e ela só enxerga empates entre pedidos que o banco tem. Os outros dias candidatos dela (22/01, 11/04 e 12/05/2026) **não** ganharam nenhum pedido na recoleta.
- O texto do script de comparação "esperado hoje: 1, o de 11/10/2025 03:45:38" ficou **desatualizado**: com a janela começando em 13/10/2025, esse pedido está entre as 400 linhas fora da janela. O script não será mexido por enquanto ([[Nao Mexer no Coletor de Vendas por Enquanto]]).
- "Nenhuma mudança de situação" vale para um intervalo de cerca de 3 horas; **não** diz quanto os pedidos mudam em semanas.

## Relacionado

- [[Nao Apagar o Banco Antes de Recoletar o Ano e Tirar uma Foto Dele Antes]]
- [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]
- [[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]
- [[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]
- [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
