---
tipo: decisao
dominio: python
status: em_andamento
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes, Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search, O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao, O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses, Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate, Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Nao Mexer no Coletor de Vendas por Enquanto, O Que Falta para Considerar Fechada a Validacao da Coleta de Vendas, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Matheus mandou corrigir (12/10/2026): o coletor passou a enviar to = fim − 1 hora (janela em horas cheias, com trava) e a reler automaticamente, até 2 vezes com páginas de 45 e 40, a janela em que vieram menos pedidos do que o ML anunciou. A correção A foi validada na API real em 12/10/2026 (dia 08/07, mês e ano fecham com o banco); a releitura B nunca rodou na API real (0 janelas sem fechar). Em 12/10/2026 02:41 Matheus decidiu não mexer mais no coletor por enquanto."
---

# Enviar o `to` do Orders Search Uma Hora Antes e Reler a Janela Que Não Fechou

## Resumo

Em 12/10/2026, depois de confirmados o problema da hora 0 ([[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]) e o do empate entre páginas ([[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]), Matheus mandou: **"corrija o que tiver que corrigir"**. Foram aplicadas **duas correções** no coletor de vendas (`integracao_mercado_livre/servicos/coletar_vendas_ml.py`, o **único** lugar do sistema que chama `buscar_pedidos` em produção):

| Correção | O que faz |
|---|---|
| **A. `to = fim − 1 hora`** | A janela do coletor é `[início, fim)` em **horas cheias**; o `to` enviado ao ML é `fim − 1 hora`, porque o filtro lê a hora inteira. O `from` não muda. |
| **B. Reler a janela que não fechou** | Se, depois de paginar, vieram **menos** pedidos do que o ML anunciou, a janela é lida de novo (**até 2 vezes**) com páginas de **outro tamanho (45 e depois 40)**, e os pedidos são juntados pelo id. |

> [!warning] Status: em andamento (A validada na API real; B ainda não exercitada)
> A correção **A** foi validada na API real em 12/10/2026 (dia, mês e ano fecham com o banco). A correção **B** (releitura) foi testada **só com um ML de mentira**: na API real nenhuma janela deixou de fechar, então ela **nunca rodou**. Não foi feito git (só Matheus faz commit e push). Em 12/10/2026 02:41 Matheus decidiu não mexer mais no coletor por enquanto: [[Nao Mexer no Coletor de Vendas por Enquanto]].

## Contexto

Dois fatos medidos em 12/10/2026 levaram à mudança:

1. O `to` do filtro lê a **hora inteira**, então o dia D + a hora 0 do dia D+1 eram lidos duas vezes (1,3% de leituras repetidas).
2. A ordem do `sort=date_desc` é por `date_closed` ([[O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao]]), com precisão de 1 segundo; empate na fronteira de página pode repetir um pedido e perder outro (4 de 365 dias candidatos).

## A pergunta

Como corrigir o coletor para (1) não ler a hora 0 em dobro e (2) não perder pedido em silêncio quando a ordem do ML se embaralha, **sem aumentar muito o número de chamadas**?

## O que levou à decisão

| Caminho | Por que foi descartado ou escolhido |
|---|---|
| **Só documentar o problema** | **Descartado**: continuaria gastando ~1,3% a mais e contando errado `pedidos_lidos`. |
| **Corrigir o `to` dentro de `pedidos_ml.py`** (a função que chama a API) | **Descartado**: essa função é genérica e deve ficar **literal** (manda o que recebe). Quem sabe a regra de "janela em horas cheias" é o coletor. `pedidos_ml.py` só ganhou o comentário que explica a regra. |
| **Reler a janela com o mesmo tamanho de página** | **Descartado**: a fronteira cai no mesmo ponto e o mesmo empate pode se repetir. |
| **Reler com páginas de tamanho diferente (45, 40)** | **Escolhido**: a fronteira muda de lugar; o par empatado deixa de ficar entre duas páginas. Funciona **qualquer que seja a causa** do pedido que faltou (empate, pedido sem `date_closed` que muda de posição). |

## Decisão

No arquivo `coletar_vendas_ml.py`:

| Item | O que é |
|---|---|
| `_exigir_janela_em_horas_cheias(inicio, fim)` | **Trava**: se `inicio` ou `fim` tem minuto, segundo ou microssegundo, ou se a janela tem menos de 1 hora, lança `ErroColetaVendas` com a frase "Nada foi lido". Evita mandar ao ML uma janela que o filtro leria de forma diferente da esperada. |
| `_buscar_pagina(...)` | Chama a trava e envia `fim_do_filtro = fim − 1 hora` ao `buscar_pedidos`. |
| `_paginar(...)` | Paginação reaproveitada para a 1ª leitura (páginas de 50) e para as releituras; respeita `offset + limite ≤ 10.000`. |
| `LIMITES_DAS_RELEITURAS = (45, 40)` | Tamanhos de página das releituras (no máximo 2). |
| Avisos | Se ainda faltar pedido: "o ML anunciou N pedidos e vieram M, mesmo depois de K releitura(s)". Se vier **mais** que o anunciado: aviso de "mais que o anunciado". |

**Custo:** uma janela que não fechou custa **cerca de 5 chamadas a mais** (um dia de ~230 pedidos tem ~5 páginas por releitura). Como só 4 de 365 dias têm empate numa fronteira, o custo extra esperado no ano é pequeno (dezenas de chamadas, contra economia de ~20 chamadas da hora 0).

**Efeitos:** o **banco não muda** (upsert por `order_id` + `posicao`); `pedidos_lidos` fica exato e ~1,3% menor; a estimativa do modal da conta toda pode se deslocar um pouco.

**Comentários e outros arquivos:**
- `coletar_vendas_ml.py`: cabeçalho com 2 novos itens `[EXPLICAÇÃO]` (filtro de hora; sort por `date_closed` + empate + releitura).
- `api_mercado_livre/pedidos_ml.py`: só comentário (o `to` inclui a hora inteira; 477 contra 465; sort por `date_closed` com ordem indefinida nos empates).
- `scripts_exploracao_ML/investigar_diferencas_entre_coletas_so_no_banco.py`: nova configuração `CORRECAO_DA_HORA_0_APLICADA_EM = None`. **Quando a correção for para o ar, preencher** com `(ano, mês, dia, hora, minuto)` no horário de Brasília; o script deixa de prever repetição da hora 0 nas coletas iniciadas depois. **Preenchida em 12/10/2026 com `(2026, 10, 12, 1, 40)`.**

## Como validar (feito em 12/10/2026)

| Teste | Esperado | Resultado (conta MB, API real) |
|---|---|---|
| "Atualizar dia" 08/07/2026 (~5 chamadas) | 200 pedidos (janela nova, só o dia) e sem aviso | **200 pedidos, 4 chamadas, sem aviso** |
| "Último mês" com "Reler" (12/09 a 12/10/2026) | lidos = banco | **4.674 pedidos, 110 chamadas, 55 s; fecha** |
| "Reler tudo" do ano (13/10/2025 a 12/10/2026; ~1.850 chamadas, ~15 min) | `pedidos_lidos` igual ao banco e avisos gravados por inteiro | **83.049 pedidos, 1.837 chamadas, 15 min 27 s; fecha; 0 avisos** |

A correção **A** (`to = fim − 1 hora`) está **validada na API real**: [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]. A correção **B** (releitura) **não foi exercitada**: nenhuma janela deixou de fechar, então a releitura nunca rodou. A recoleta com foto do banco mostrou que a coleta nova não deixou nada para trás e recuperou 1 pedido perdido pela antiga ([[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]).

## Limites

- **A releitura (B) nunca rodou na API real:** a coleta nova (dia, mês e ano) teve 0 janelas sem fechar. Só a simulação a cobre, e não existem testes automatizados do coletor: [[O Que Falta para Considerar Fechada a Validacao da Coleta de Vendas]].
- A releitura **não tem como corrigir** um pedido que o ML nunca entrega em nenhuma das 3 leituras: ele continua aparecendo no aviso.
- Janela de exatamente 1 hora não foi medida na API real (só importa com mais de 10.000 pedidos numa hora).
- A borda de 12 meses é **outro** problema, com outra correção (folga de 1 dia, **já aplicada** em 12/10/2026 01:35): [[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]].

## Relacionado

- [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]
- [[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]
- [[O sort date_desc do Orders Search Ordena por date_closed e Nao por Data de Criacao]]
- [[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]
- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]
- [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]
- [[Nao Mexer no Coletor de Vendas por Enquanto]]
- [[O Que Falta para Considerar Fechada a Validacao da Coleta de Vendas]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
