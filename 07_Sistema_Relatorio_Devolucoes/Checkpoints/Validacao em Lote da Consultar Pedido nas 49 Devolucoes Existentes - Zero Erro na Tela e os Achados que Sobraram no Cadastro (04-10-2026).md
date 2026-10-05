---
tipo: checkpoint
dominio:
status: em_andamento
criado: 04/10/2026
atualizado_em: 04/10/2026 04:33
relacionado: [Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML, Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026), Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias, Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida, Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]
---

# Validação em Lote da Consultar Pedido nas 49 Devoluções Existentes — Zero Erro na Tela e os Achados que Sobraram no Cadastro

## Última atualização

04/10/2026, 04:33 — nota criada, registrando a rodada do script de validação em lote (Matheus rodou entre 04:22 e 04:24) e a análise do relatório. Horários em Brasília.

**Resumo do estado atual**: a Consultar Pedido foi rodada sobre as **49 devoluções que já existiam no banco** (19 da MB e 30 da SV). Todas abriram o caso completo: **0 erro, 0 resultado instável, 0 resposta 429**. A consulta leva em média **0,94 s**, e o tempo todo é espera pelo Mercado Livre — banco de dados e montagem da página somam menos de 0,02 s. O que sobrou não é defeito da tela: são **diferenças entre o que o Mercado Livre diz e o que está no cadastro** (a maioria esperada; algumas mostram erro de digitação ou de tipo de venda no próprio cadastro) e **uma decisão de Matheus em aberto** sobre a data "Mediação encerrada".

> [!success] Conclusão da análise de Claude (04/10/2026, 04:33)
> Do ponto de vista técnico — não quebra, é estável, é rápida e não dispara o limite do Mercado Livre —, a tela pode ser considerada fechada para as devoluções existentes. É a conclusão da análise; Matheus ainda **não** declarou a tela como fechada: pediu o registro desta nota. Falta ver a tela com os olhos em 4 pedidos (ver "Em aberto").

## Contexto

Em 04/10/2026, depois de a busca em 3 ondas ficar cerca de 4 vezes mais rápida (ver [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]), Matheus perguntou: "Podemos considerar essa tela fechada para devoluções existentes?". A resposta foi que ainda não dava para provar: a versão nova só tinha rodado, no log real, em 1 pedido (o pedido-base 2000018229470186), e não existe cópia da versão anterior para comparar lado a lado. A saída combinada foi um script que roda a tela inteira sobre **todas** as devoluções do banco e lista os casos estranhos.

Termos usados nesta nota, para quem nunca viu o assunto:

- **Consulta**: uma busca de pedido na tela Consultar Pedido, do pedido até o desenho da página.
- **Divergência**: diferença entre o que a tela mostra (vindo do Mercado Livre) e o que a Ana cadastrou na devolução. Divergência **não** é erro da tela: pode ser digitação da Ana ou o ML divergindo dela — cada caso precisa de um olhar.
- **OK / ATENÇÃO / ERRO**: as 3 notas do script. ERRO é a tela quebrar ou faltar bloco. ATENÇÃO é qualquer coisa que merece um olhar, **inclusive** divergência de cadastro. OK é nada a olhar.
- **Conexão quente e fria**: conexão já aberta com o Mercado Livre responde rápido; conexão nova gasta ~0,35 s só na troca de segurança. A tela descarta as conexões depois de 20 s paradas (ver [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]).

## Como o teste foi feito

O script `validar_consultar_pedido_em_lote.py` (pasta `scripts_exploracao_ML`) chama a mesma função da tela (`view_consultar_pedido`) que o servidor chama, com o número do pedido de cada devolução do banco, **sem navegador**. Para cada devolução:

1. Faz **2 consultas** seguidas, para ver se o resultado muda de uma para a outra (instabilidade).
2. Compara datas, nome, preço, tipo de venda e `claim_id` da tela com o cadastro.
3. Mede o tempo total, o das chamadas ao ML, o do banco e o da montagem do HTML, e conta as chamadas e os 429.
4. Marca como "criada pela ponte" as devoluções criadas depois de 18/09/2026 (a ponte "Criar devolução" a partir da Consultar Pedido), porque nelas parte dos dados pode ter vindo da própria tela.

Há uma pausa de 1 s entre devoluções por causa da cota do ML, dividida com o Sistema Interno V2. Matheus rodou na máquina dele; o log do `api.log` mostra a rodada de 04:22:27 a 04:24:47 (2 min 20 s).

## O que a rodada mostrou — a tela

### Números gerais

| O que | Resultado |
|---|---|
| Devoluções validadas | 49 (19 da MB e 30 da SV), 2 consultas cada = 98 consultas |
| Abriram o caso completo | 49 de 49 — inclusive as 43 que não têm `claim_id` guardado no cadastro |
| ERRO | 0 |
| Resultado diferente entre as 2 consultas | 0 |
| Resposta 429 | 0 |
| Chamadas ao Mercado Livre | 966 (~5,4% da cota de 1 hora) |
| Nota do script | 4 OK e 45 ATENÇÃO |

**Por que 45 ATENÇÃO não assusta**: nenhum dos 45 é erro da tela. Contam alertas esperados (7 "sem devolução física", o pack, 1 envio de volta vazio) e as divergências de cadastro das seções seguintes. Os 4 OK são os pedidos SV 2000017863490392, 2000017979456990, 2000017955950502 e 2000018229470186 (o pedido-base).

### Tempo — e a resposta do ciclo C

| Parte (segundos por consulta) | Média | Mediana | 90% | Máximo |
|---|---|---|---|---|
| Consulta inteira (tela + HTML) | 0,94 | 0,88 | 1,13 | 2,62 |
| Chamadas ao Mercado Livre | 0,91 | 0,86 | 1,11 | 2,60 |
| Banco de dados | 0,00 | 0,00 | 0,00 | 0,02 |
| Montagem do HTML | 0,00 | 0,00 | 0,00 | 0,07 |

- O banco faz 2 consultas por pedido e leva no máximo 0,02 s; a montagem do HTML leva ~4 ms em média. **Todo o tempo é espera pelo Mercado Livre.** Isso responde o ciclo C, que Matheus tinha dispensado ([[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]): não há nada no servidor para otimizar.
- Chamadas mais lentas do ML: mensagens da claim (0,49 s em média), detalhe da claim (0,41 s) e `/returns` (0,35 s). As demais ficam entre 0,15 s e 0,18 s.
- A mediana de 0,88 s bate com o piso estimado de ~0,8 s das 3 ondas e com o ganho estimado do ciclo B (~0,9 s com conexões quentes).
- Os tempos da rodada são com conexões **quentes** (pausa de 1 s entre devoluções). A Ana, com conexões frias, continua perto de ~1,5 s no log real. A primeira consulta da rodada, ainda fria, levou 2,42 s.
- O pack (MB 2000014649100973) leva ~2,6 s e 16 chamadas: o número do pedido é um pack, então a tela tenta `/orders` (404 esperado), resolve o pack e refaz a busca — esse caminho ainda é em sequência, por escolha.

### Caminhos difíceis que a rodada exercitou

- **7 devoluções SV "sem devolução física"** (pedido cancelado, `/returns` 404): SV 2000017753255440, 2000017419665406, 2000017756290502, 2000017589434980, 2000017996760264, 2000017855878272 e 2000017846786276. Antes de 03/10 caíam numa tela de erro; agora mostram o caso e o aviso. Os 7 já eram conhecidos (comentário no código).
- **2 pedidos MB em que a 1ª claim candidata não tem devolução** e a certa é a 2ª ou a 3ª (MB 2000017641781322 e 2000017930464724): o palpite da onda 2 erra e a onda 3 refaz o detalhe e as mensagens (11 e 12 chamadas em vez de 10).
- **1 devolução SV com `shipments` nulo** (SV 2000018090218022, o achado de 03/10): a tela abre normalmente, com o aviso de envio de volta vazio.
- **1 pack** (MB 2000014649100973), como acima.
- **Pedidos da MB**: 19 devoluções, sem erro. O script **não** confere as bolhas "Você" do chat, então `MB_USER_ID` continua sem conferência visual.

### Conferência com o log real

O `api.log` da hora da rodada tem 1.932 linhas = 966 "Chamando" + 966 respostas, igual ao JSON. As 22 linhas `[ERROR]` são 20 respostas 404 de `/returns` (os 404 esperados de "sem devolução") e 2 respostas 404 de `/orders` (o pack). Nenhum 429, 5xx ou erro de token. Houve 420 chamadas dentro de um único minuto (04:23), sem 429 — as 3 ondas não disparam o limite nem em rajada, numa rodada só.

## O que a rodada mostrou — o cadastro

### Achados que parecem erro ou pedem olhar no cadastro

| Achado | Pedidos | O que parece ser |
|---|---|---|
| Tipo de venda: a tela diz FULL e o cadastro diz comum | MB 2000017987724282, 2000018157602904, 2000017930464724, 2000018233922590 (devoluções de id 16 a 19) | Dado antigo errado: antes de 03/10 a tela não achava o tipo logístico e sugeria sempre "comum" (ver [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]]). Os ids 20 e 21, criados depois, batem com a tela. 2 dos 4 são do mesmo SKU da devolução de id 1, que está como FULL. Data de criação não conferida |
| Reclamação aberta com 1 mês a mais | MB 2000017939871998 (24/09 no cadastro, 24/08 na tela), SV 2000017960227630 (26/09 no cadastro, 26/08 na tela) | Provável erro de digitação do mês: nos 2, a reclamação do cadastro cai depois do "Recebido por nós" do próprio cadastro |
| Preço redondo | SV 2000017589434980 | Cadastro 1000,00, Mercado Livre 1399,00. Só 24 das 49 têm preço cadastrado |
| Nome de outra pessoa | MB 2000018050154756, MB 2000018290873852, SV 2000018090218022 | Pode ser de propósito (nome de quem postou o pacote); a Ana confirma. Os outros 14 nomes diferentes são o mesmo nome abreviado pelo ML |
| Venda com 10 a 36 dias de diferença | MB 2000018050154756 (10 dias), SV 2000017753255440 (14), SV 2000017996760264 (16), SV 2000017419665406 (36) | O cadastro tem sempre a data mais tarde. 3 dos 4 são pedidos cancelados sem devolução física. Outras 5 diferenças são de 1 ou 2 dias, também com o cadastro depois |
| Mediação aberta antes do recebimento | MB 2000017962993016 | Cadastro com mediação aberta em 25/08 e "Recebido por nós" em 14/09 (09/09 na tela) — contradiz a regra de 03/10 de que a abertura acontece depois de receber |
| Chat vazio em mediação | MB 2000018157602904 | Único caso. Também tem "fora de ordem" (mediação aberta em 30/09, encerrada pelo ML em 31/08). Conferir direto no ML |

### Diferenças esperadas (não são erro)

- **Nome abreviado**: 14 dos 17 nomes diferentes. O ML entrega nome e sobrenome parciais ou com inicial; o cadastro tem o nome completo da nota.
- **"Mediação encerrada"**: em 28 devoluções a tela tem a data e o cadastro está vazio — a tela traz informação que o cadastro nunca teve. Em outras 9 as duas datas existem e são diferentes, com o cadastro sempre mais tarde (1 a 29 dias). O cadastro tem "Mediação aberta" em 30 das 49 e "Mediação finalizada" em 21.
- **"Recebido por nós"**: 16 datas diferentes, 14 delas com o cadastro 5 a 34 dias depois do ML e 2 com o cadastro mais cedo (5 e 1 dia). As datas do cadastro se repetem (11/09 em 9 das 49, 14/09 em 5, 29/09 em 5, 23/09 em 4), o que sugere o dia da conferência da Ana, não o da entrega — **hipótese de Claude, não confirmada**.
- **Sem data de chegada na tela**: 14 devoluções, todas da SV — 7 "sem devolução física" e 7 "sem registro de entrega". Das 23 SV que têm devolução física, 7 (30%) não têm data de entrega; na MB nenhuma. Um desses 7 (SV 2000017697078004) é o caso **confirmado** de transportadora contratada fora do Mercado Envios ([[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]]); nos outros 13 a mesma causa é provável, **não verificada**. O aviso "Sem devolução física" fala do registro do ML, não do pacote, então continua correto mesmo quando a Ana recebeu a encomenda.
- **"Recebido (cliente)"**: 0 divergências nas 49. Os 6 `claim_id` guardados no cadastro batem com os que a tela achou. É um indício indireto de que a versão nova mostra o mesmo que a antiga nesses dados.

### Uma decisão em aberto: a data "Mediação encerrada"

Em **15 das 49** devoluções a linha do tempo mostra "fora de ordem" (a data seguinte é anterior à anterior; a dica diz "vale conferir no Mercado Livre", ver [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]). Em 14 o aviso nasce em "Mediação aberta" (13 SV e 1 MB) e em 1 (MB) em "Recebido (nós)".

- **Mecanismo**: "Mediação aberta" vem do **cadastro da Ana** (decisão de 03/10) e "Mediação encerrada" vem do **Mercado Livre** (a data de fechamento da devolução, ou da claim quando não há devolução). A do ML cai antes da abertura que a Ana registrou.
- **Padrão**: as 13 SV são 13 dos 14 casos em que a tela não achou data de chegada. E, nos 9 casos com as duas datas de encerramento, a da Ana é sempre a mais tarde. Isso sugere que o fechamento informado pelo ML não é o fim da mediação como a Ana a registra — **interpretação de Claude, sem teste**.
- **Hoje**: a tela usa o ML primeiro e o cadastro só se o ML não trouxer (decisão de 03/10, a mesma data que o botão "Criar devolução" leva para o formulário).
- **Alternativa**: usar o cadastro primeiro. Contado só com o relatório, 7 dos 15 avisos sumiriam (os que têm data de encerramento no cadastro) e 8 continuariam (6 SV sem data de encerramento no cadastro, a MB 2000018157602904 e a MB 2000017962993016, cujo aviso nasce em "Recebido (nós)"). Também igualaria a tela ao cadastro nas 9 devoluções com as duas datas diferentes.
- **Sem decisão**: Matheus não escolheu.

## Limites da rodada

- O script chama a função da tela, **não** o navegador: não mede Bootstrap e ícones vindos da CDN, as miniaturas pelo proxy nem o desenho. O HTML é montado sem sessão e sem mensagens do Django; um erro de render em todas as devoluções seria limite do script (não aconteceu em nenhuma).
- Não há cópia da versão anterior, então a rodada compara **tela × cadastro**, não tela nova × tela antiga.
- As 49 já estão cadastradas e quase todas encerradas: o estado "ainda não cadastrado" não pode ser coberto por esta rodada, e "em andamento" fica para o uso real.
- O script marca como ATENÇÃO também a diferença de cadastro, e marca o pack (404 esperado de `/orders`) como alerta inesperado. Por isso "45 ATENÇÃO" parece pior do que é.
- Rodada única, em pausas de 1 s: não prova o comportamento de uma hora inteira de uso.

## Oferecido e dispensado

Depois da análise foram oferecidos 3 passos: uma lista só com os pedidos acima para a Ana revisar, a correção dos 4 tipos de venda por script e um ajuste no script (separar "diferença de cadastro" de "alerta" e não alarmar no pack). Matheus respondeu "não precisa" e pediu o registro no vault. Os achados continuam valendo, sem ação decidida.

## Onde está

- Script: `scripts_exploracao_ML/validar_consultar_pedido_em_lote.py` (opções `--conta`, `--pedido`, `--limite`, `--repeticoes`, `--pausa`, `--sem-render`, `--listar`).
- Relatório: `scripts_exploracao_ML/logs/validar_consultar_pedido_em_lote_relatorio.txt` (tabela por devolução, resumo, tempos, chamadas por endpoint e um bloco por devolução que não ficou OK).
- Dados completos: `scripts_exploracao_ML/validacao_consultar_pedido_em_lote.json` (gerado em 04/10/2026, 04:24).
- As chamadas da rodada também estão no `api.log` real.

## Em aberto

- [ ] Ana (ou Matheus) revisar os pedidos da tabela de achados: reclamações com 1 mês a mais, preço, nomes, vendas com 10 dias ou mais, mediação aberta antes do recebimento e chat vazio
- [ ] Corrigir o tipo de venda dos 4 pedidos MB (devoluções de id 16 a 19) — sem decisão de como
- [ ] Decidir a prioridade da data "Mediação encerrada": ML primeiro (hoje) ou cadastro primeiro
- [ ] Ver a tela com os olhos em 4 pedidos: o pack MB 2000014649100973, um sem devolução física (por exemplo SV 2000017419665406), um FULL da MB e uma mediação MB com chat (confirma as bolhas "Você" e o `MB_USER_ID`)
- [ ] Verificar a hipótese da transportadora nos 14 casos SV sem data de chegada (confirmada só em SV 2000017697078004)
- [ ] Gerar o novo .exe antes de a Ana receber o chat novo e a busca rápida
- [ ] Mostrar a tela para a Ana, no monitor dela, e ouvir o feedback

## Relacionado

- [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]
- [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]]
- [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]
- [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]]
- [[Chat do ML na Consultar Pedido - Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna]]
- [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]]
