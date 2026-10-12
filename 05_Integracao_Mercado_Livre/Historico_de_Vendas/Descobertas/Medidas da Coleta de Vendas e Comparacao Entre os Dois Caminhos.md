---
tipo: descoberta
dominio: 
status: ativa
criado: 12/10/2026
atualizado_em: 12/10/2026 01:15
relacionado: [Guardar o Total de Chamadas de Cada Clique em Tabela Propria no Banco, O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes, O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses, Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Medidas reais (conta MB, 11-12/10/2026): 1 ano da conta toda = 84.510 pedidos, 1.870 chamadas, 15 min 44 s; 1 semana = 1.226 pedidos, 29 chamadas, 14 s; 1 SKU de teste (20% da conta) = 16.876 pedidos, 364 chamadas, 60 s; 0 erros 429. Os dois caminhos (por produto e conta toda) concordam; a conta toda vê 121 pedidos do SKU em 3 MLBs fora do produto."
---

# Medidas da Coleta de Vendas e Comparação Entre os Dois Caminhos

## Resumo

Em 11 e 12/10/2026 a coleta de vendas foi rodada de verdade na conta MB, em duas formas, e o custo em **chamadas à API do Mercado Livre** foi contado com exatidão pela tabela de execuções ([[Guardar o Total de Chamadas de Cada Clique em Tabela Propria no Banco]]). Os números abaixo servem para planejar a **massificação** (~1.000 SKUs): o custo segue o **número de pedidos** (cerca de 1 chamada a cada 45 pedidos), não o número de SKUs.

> [!info] Status: ativa
> Medidas de 1 conta (MB) e de 1 SKU de teste. A conta SV não foi medida. Os números mudam com a época do ano (janeiro a março são os meses mais pesados).

## Contexto

Existem **dois caminhos** para encher o banco de vendas (tabela `VendaItemMercadoLivre`):

| Caminho | Botão | Como lê | Observação |
|---|---|---|---|
| **Por produto** | "Atualizar produto" / "Atualizar" de 1 MLB | Filtro `item=MLB…`, em trechos de tamanho variável (o ano inteiro num MLB pequeno; de 7 a 20 dias num MLB grande), **pelo menos 1 chamada por MLB por janela**, 3 trechos em paralelo | Só vê os MLBs **ligados ao produto** no cadastro |
| **Conta toda** | "Coletar período da conta" / "Atualizar dia" | Filtro `seller`, **dia a dia**, em sequência (~2 chamadas por segundo) | Vê **todos** os pedidos da conta |

Cada chamada devolve no máximo 50 pedidos (`limit=50`). O limite do Mercado Livre é de **18.000 requisições por hora por aplicativo** (página oficial "Rate limit / Erro 429", na pasta `Fontes` do vault).

## O que foi medido

| Execução | Período | Pedidos lidos | Chamadas | Tempo | Pedidos por chamada |
|---|---|---|---|---|---|
| Conta toda, **1 ano** | 11/10/2025 a 11/10/2026 (366 dias) | 84.510 | **1.870** | 15 min 44 s (944 s) | ~45 |
| Conta toda, **1 semana** ("Reler tudo") | 04/10 a 11/10/2026 (8 dias) | 1.226 | **29** | 14 s | ~42 |
| **1 SKU** (`F7908050719121.001`, 20 MLBs), por produto | 11/10/2025 a 11/10/2026 (42 trechos) | 16.876 | **364** | 60 s | ~46 |

- **O SKU de teste é 20% da conta** (16.876 de 84.510 pedidos) e custou 364 de 1.870 chamadas.
- **Média do ano:** ~231 pedidos por dia; **mediana** 207. Dias maiores: 26/11/2025 (560), 07/01/2026 (538), 25/11/2025 (526). Dias menores: 02/11/2025 (71), 01/11/2025 (76), 01/10/2026 (88; dia a conferir com o ERP).
- **Última semana:** 153 pedidos por dia (cerca de 3,6 chamadas por dia).
- **Ritmo do ano:** 1.870 chamadas em 944 s é cerca de 2 chamadas por segundo (~7.100 por hora), abaixo das 18.000 por hora do limite. **Nenhum erro 429** em nenhuma execução.
- **Estimativas erradas, corrigidas:** o projetado para o ano era ~1.380 chamadas (real 1.870, os meses recentes são mais lentos); a estimativa do modal de "Coletar período da conta" deu 13 chamadas contra 29 reais (ela subestima enquanto os últimos 30 dias não foram coletados pela conta toda).

## Os dois caminhos concordam

Script `conferir_coleta_da_conta_toda_contra_coleta_por_produto.py` (só leitura, zero chamada à API), conta MB, SKU de teste:

| Conferência | Resultado |
|---|---|
| Pedidos do SKU no banco (MLBs do produto) | 16.869 pedidos = 16.869 linhas, 16.922 unidades (1 linha por pedido) |
| Coleta por produto leu | 16.876: a diferença de −7 é a **hora 0 lida em dobro** (42 de 42 trechos batem), ver [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]] |
| Conta toda, pedidos no banco na janela | 83.438 (1 só do 1º dia que nenhuma coleta releu, 83.235 gravados na coleta do ano e 202 do dia 08/07 refeito depois) |
| Pedidos vistos só pelo caminho por produto | **1** de 83.438: o pedido da borda de 12 meses ([[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]) |
| Cancelados perdidos | **Nenhum**: o único pedido que só 1 caminho viu estava `paid`. A dúvida de que a busca como vendedor "filtra cancelados" **não foi confirmada** por este teste (ver "Achados" do checkpoint) |

## A conta toda vê o que o produto não vê

O SKU de teste tem **121 pedidos (127 unidades)** em **3 MLBs que não estão ligados ao produto** no cadastro (nenhum deles está na tabela de anúncios): `MLB3925238352` (104 pedidos, 14/11/2025 a 15/06/2026), `MLB5397573678` (16, 15/10/2025 a 20/06/2026) e `MLB4479267725` (1, 10/03/2026). O caminho **por produto nunca vê esses pedidos**; só a conta toda vê. Para a tela de 1 produto, isso significa **vendas do SKU que não entram nos totais do produto** hoje: ver [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]].

## O que isso decide

- **Massificar pela conta toda** é mais barato do que parece (o custo segue os pedidos, ~1 chamada a cada 45) e é o único caminho que vê **todos** os MLBs; o caminho por produto continua útil para atualizar 1 produto e para o botão de cada MLB.
- **1 chamada por pedido continua fora de cogitação** (regra do Matheus: mínimo de chamadas, pensando em ~1.000 SKUs).
- A **estimativa do modal** da conta toda deveria usar o histórico das coletas da conta toda (melhoria opcional, não aplicada).

## Limites

- Só conta MB; só 1 SKU de teste; 1 ano de dados; 1 execução de cada tipo.
- A medida do ano foi feita **com a hora 0 lida em dobro**; com a correção (`to = fim − 1 hora`) o custo cai cerca de 1,3% (~20 chamadas).

## Relacionado

- [[Guardar o Total de Chamadas de Cada Clique em Tabela Propria no Banco]]
- [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]
- [[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]
- [[Tres MLBs com Vendas do SKU de Teste Nao Estao na Tabela de Anuncios]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
