---
tipo: duvida
dominio: 
status: em_aberto
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate, Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Nao Mexer no Coletor de Vendas por Enquanto, Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou, Onde Fica o Corte do Orders Search na Borda de 12 Meses e se Ele Muda Durante o Dia, Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Pergunta de Matheus (12/10/2026): a coleta de vendas já está 100% válida e fechada? Resposta: ainda não. Pedidos da conta MB (quais existem, em que dia, contagem): validado, confiança alta. Faltam 7 itens (releitura nunca exercitada, conta SV, fonte independente/ERP, conteúdo dos campos, estabilidade no tempo, pedidos com mais de 1 item, retry real do token). Fecha depois de releitura, SV e ERP."
---

# O Que Falta para Considerar Fechada a Validação da Coleta de Vendas?

## Resumo

Depois das três execuções reais e da recoleta com foto, Matheus perguntou: **"podemos considerar 100% válida e fechada as coletas sobre informações de vendas?"** A resposta foi: **ainda não 100%**. Para a conta MB, no que diz respeito a **quais pedidos existem**, a evidência é forte; mas há itens que **nunca foram exercitados**.

> [!question] Status: em aberto
> Declaração de hoje: **"Coleta de pedidos da MB: validada, confiança alta."** A coleta de vendas **como um todo** ficaria **fechada** depois dos itens 1, 2 e 3 da lista "Ainda não validado". Como o coletor está congelado ([[Nao Mexer no Coletor de Vendas por Enquanto]]), nada disso exige mudar código.

## Contexto

Em 12/10/2026 a coleta foi medida, corrigida e validada na API real ([[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]) e uma recoleta com foto do banco mostrou que nada ficou para trás ([[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]).

## A pergunta

O que ainda precisa ser provado para dizer que a coleta de vendas está **fechada**?

## O que já está validado (conta MB)

| Item | Evidência |
|---|---|
| **Contagem** | Dia 08/07, mês e ano fecham em 0 (lidos = banco) |
| **Hora 0** | A causa explica por inteiro as diferenças antigas (−1.073 no ano, −19 na semana, −7 no SKU) |
| **Duplicidade** | A chave única impede; a recoleta regravou 83.049 pedidos sem duplicar e sem sumir nenhuma linha |
| **Custo previsível** | As chamadas batem com as páginas calculadas (4, 110 e 1.835), mais as repetições por 429 (1.837) |
| **Borda de 12 meses** | O pedido de 11/10/2025 foi preservado; a janela começa na folga de 1 dia (13/10/2025) |
| **Pedido perdido** | A coleta antiga perdeu 2 (08/07 e 19/11); a nova recuperou o de 19/11 e teve 0 janelas sem fechar |

## Ainda não validado

| # | Item | Situação |
|---|---|---|
| 1 | **Releitura automática** (proteção contra o empate) | A coleta nova teve **0 janelas que não fecharam**, então a releitura **nunca rodou** na API real (a antiga teve 2). Não existem testes automatizados do coletor no projeto (só o `agenda_videos` tem testes) |
| 2 | **Conta SV** | Nunca foi coletada com o código novo |
| 3 | **Fonte independente** | Só se comparou com o próprio ML e com o banco: isso mostra "completo em relação ao ML", **não** "em relação às vendas reais". A planilha do ERP de terça (13/10/2026) cobre isso para 1 SKU |
| 4 | **Conteúdo dos campos** | Foram conferidos quais pedidos existem, em que dia e a contagem. Preço, taxa, quantidade, situação e frete **não** foram comparados com outra fonte (a Magiic e os 60 envios cobrem só parte) |
| 5 | **Estabilidade no tempo** | A regra "últimos 30 dias sempre relidos" é **premissa, não medida** (só se mediu um intervalo de cerca de 3 horas, com 0 mudanças). E o **corte de 12 meses**: não se sabe a hora nem se anda ([[Onde Fica o Corte do Orders Search na Borda de 12 Meses e se Ele Muda Durante o Dia]]); a folga de 1 dia é proteção, não prova |
| 6 | **Pedidos com mais de 1 item** | Na MB todo pedido tem 1 item (83.449 itens para 83.449 pedidos). O caminho de vários itens (`posicao` maior que 0) **nunca foi exercitado** com dado real |
| 7 | **Retry da renovação do token** | Só o caminho normal foi visto na API real ([[Repetir a Renovacao do Token Quando o Mercado Livre Esta Instavel]]) |

**Relacionado, mas fora da coleta:** os 3 MLBs fora da tabela de anúncios (121 pedidos do SKU de teste). A coleta **guarda** esses pedidos; a ligação ao produto pelo MLB é que os perde, o que afetaria o ritmo de vendas ([[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]).

## Como resolver

1. **Teste simulado da releitura** (item 1): um script com uma API falsa que reproduz o empate, **sem nenhuma chamada ao ML**; valida a releitura, o aviso e o limite de 2 releituras. É o primeiro, porque não gasta chamada e protege justamente o ponto que a coleta nova não pôde provar. **Só se Matheus pedir** (script separado, não muda o coletor).
2. **Último mês na SV** (item 2): cerca de 100 chamadas.
3. **ERP na terça** (item 3, e parte do 4): comparar quantidade e preço de 1 SKU com a planilha.
4. **Monitoramento depois de fechar** (item 5): repetir o "Reler tudo" em algumas semanas e comparar com a foto de 12/10/2026, que fica guardada; mede a cauda real de mudanças de situação.

## Relacionado

- [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]
- [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]
- [[Nao Mexer no Coletor de Vendas por Enquanto]]
- [[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]]
- [[Onde Fica o Corte do Orders Search na Borda de 12 Meses e se Ele Muda Durante o Dia]]
- [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
