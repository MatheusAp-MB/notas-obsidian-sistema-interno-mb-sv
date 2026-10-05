---
tipo: decisao
dominio:
status: implementada
criado: 04/10/2026
atualizado_em: 04/10/2026 04:33
relacionado: [Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026), Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026), Chat do ML na Consultar Pedido - Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna, Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe, Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]
---

# Consultar Pedido em 3 Ondas Paralelas — De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML

**Resumo**: a busca da Consultar Pedido fazia cerca de 11 chamadas à API do Mercado Livre **uma atrás da outra** e levava ~6,4 s só nelas. Agora faz as mesmas chamadas em **3 ondas**, com várias chamadas ao mesmo tempo dentro de cada onda e conexões reaproveitadas: ~1,5 s medidos no log real. A tela mostra os mesmos dados de antes. Matheus testou e disse que está "bem rápido" — por isso os ciclos de otimização seguintes foram dispensados (ver "O que foi proposto e dispensado").

> [!success] IMPLEMENTADA e validada em lote nas 49 devoluções existentes (04/10/2026, 04:33)
> Depois do pedido-base 2000018229470186, a busca em 3 ondas foi rodada sobre as 49 devoluções do banco: 0 erro, 0 resultado instável, 0 resposta 429 e ~0,94 s por consulta (ver [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]]). Passou por pedido com 2 claims, devolução sem devolução física, número de Pack e pedidos da MB. Ainda **não** foi conferida com os olhos nas bolhas "Você" do chat de um pedido da MB, nem na busca por ID do cliente. Ver "Em aberto".

## Contexto

Em 03/10/2026 Matheus tinha **descartado** a ideia de paralelizar as chamadas ("eu estava errado"), com a regra "primeiro faz funcionar, depois otimiza". Em 04/10/2026, com a tela já funcionando, ele retomou a ideia — mas pelo método do vault: **primeiro analisar como o Sistema Interno V2 já resolveu isso** (lá muitos erros de paralelismo já tinham sido resolvidos), **depois testar com um script de exploração** (`scripts_exploracao_ML/testar_paralelismo_consultar_pedido.py`) e só então aplicar em `views.py` e `cliente_api.py`.

Termos usados nesta nota, para quem nunca viu o assunto:

- **Chamada em sequência**: pedir uma coisa ao Mercado Livre, esperar a resposta e só depois pedir a próxima.
- **Onda**: um grupo de chamadas que não dependem umas das outras e por isso saem juntas. Uma onda só começa quando a anterior termina, porque usa dados que ela trouxe.
- **Conexão nova e "handshake"**: toda conexão nova com o Mercado Livre começa com uma troca de mensagens de segurança (TLS) antes da chamada de verdade. No PC do escritório isso custa ~0,35 s por conexão nova. Uma conexão já aberta ("quente") responde a mesma chamada em ~0,15 s.
- **Espaçador**: a trava do `cliente_api` que obriga um intervalo mínimo de 0,4 s entre chamadas da mesma conta (proteção contra rajada).
- **429**: resposta do Mercado Livre dizendo "você chamou demais, espere". O `cliente_api` já tem espera e nova tentativa para isso.

## A questão a decidir

Como cortar o tempo da busca, que é o que a Ana espera olhando a tela, **sem** mudar nenhum dado exibido e **sem** arriscar 429 numa cota que o Sistema Interno V2 também usa?

## O que levou à decisão — alternativas consideradas

| Alternativa | Resultado | Por quê |
|---|---|---|
| Deixar em sequência (como estava) | Descartada | ~6,4 s por consulta, ~0,5 s em cada uma das ~11 chamadas |
| Paralelizar mantendo o espaçador de 0,4 s | Descartada | O teste mostrou que o espaçador era **o gargalo**: ele espera dentro de uma trava global, então mesmo com várias threads as chamadas saíam uma a uma |
| Paralelizar tudo de uma vez | Impossível | Há dependência real: o pedido traz as claims, a claim traz a devolução, a devolução traz o envio de volta |
| Pool de conexões + ID da conta pelo `.env` + espaçador desligado só nesta tela + 3 ondas | **Escolhida** (Matheus: "pode aplicar as 4") | Resultado do script: potencial de 6,3 vezes mais rápido, sem 429 em ~400 chamadas |
| Guardar o resultado em cache | Não proposta | Dado de pedido muda (status, mensagens); cache criaria risco de mostrar dado velho |

## Decisão tomada

### As 4 mudanças, aplicadas direto na pasta do projeto

1. **Pool de conexões** (`api_mercado_livre/core/estrutura_api/cliente_api.py`): uma sessão persistente reaproveita conexões em vez de abrir uma nova a cada chamada — mesmo padrão que o Sistema Interno V2 já usa (pool de 50, sem nova tentativa automática do `requests`; a única nova tentativa é a do próprio `chamar_api`). A sessão **recusa todo cookie**, para manter o comportamento de antes (nenhum cookie passava de uma chamada ou conta para outra). O pool é descartado depois de **20 s parado** como proteção contra conexão velha — esse valor foi um palpite, nunca medido. Também ganhou uma trava para 2 threads não criarem o arquivo de log ao mesmo tempo (duplicava cada linha). No teste, o tempo por chamada caiu de 389 ms para 195 ms.
2. **`/users/me` deixou de ser chamado**: o ID da conta (`MB_USER_ID` / `SV_USER_ID`) vem do `.env`; se faltar, cai na API como antes. Economiza 1 chamada (~0,5 s). *Ainda não confirmado com um pedido da MB.*
3. **Espaçador desligado só nas chamadas desta tela** (`espacador_ativo=False`, via `_chamar_api_consulta` em `integracao_mercado_livre/views.py`). Continua **ligado** em: varreduras, botão de teste de conexão, proxy de anexos, classificação leve (busca por ID do cliente), listagem de pedidos do cliente e resolução de Pack. A espera automática de 429 também continua valendo.
4. **3 ondas** em `view_consultar_pedido`:

| Onda | O que sai junto |
|---|---|
| 1 | O pedido **e** a busca de claims do pedido |
| 2 | `/returns` de cada claim candidata, os dados dos anúncios (fotos/status), o histórico e o envio de ida, e um **palpite**: o detalhe e as mensagens da primeira claim candidata |
| 3 | O histórico e o envio de volta (precisam do `/returns` da onda 2) e, só se o palpite da onda 2 estava errado, o detalhe e as mensagens da claim certa |

O palpite custa 2 chamadas a mais quando erra e economiza uma etapa inteira quando acerta, que é o caso normal.

### Regras de segurança do desenho

- Cada onda tem o **seu** grupo de threads (nunca um dentro do outro), no máximo 8 (`MAX_THREADS_CONSULTA`). Eram 6; subiu para 8 quando um teste com 2 claims candidatas gerou uma onda de 7 tarefas que precisava de 2 rodadas.
- As threads **só fazem HTTP** e devolvem os dados. Banco de dados (ORM) e montagem da tela ficam na thread principal, porque as conexões do Django são por thread.
- O **token** é renovado na thread principal antes de cada onda, para várias threads não tentarem renovar ao mesmo tempo (a renovação usa trava de arquivo).
- Se uma chamada falha, o erro é guardado e **relançado na thread principal, no mesmo ponto** onde o código em sequência teria falhado — então os casos esperados (por exemplo, 404 de `/returns` quando não há devolução física) se comportam como antes.
- `/shipments/{id}/history` leva o header `x-format-new: true`; `/shipments/{id}` **não** leva (se levar, o endereço some sem erro).
- Equivalência: 112 de 112 conferências offline, com uma API de mentira, deram o mesmo resultado de antes. Não existe cópia da versão anterior (a regra do projeto é não fazer backup; o git é só do Matheus), então a prova de igualdade veio de testes, **não** de comparação direta lado a lado.

### A cota é compartilhada

Matheus confirmou em 04/10/2026: o app do Mercado Livre das contas MB e SV é **o mesmo** no Sistema Interno V2 e no Sistema de Devoluções, então o limite (18.000 chamadas por hora por app, ~5 por segundo em média) é dividido entre os dois. Historicamente os 429 só apareceram em rajadas longas e em sequência no `/returns` (17/09 e 20/09). No log real de 04/10 há 1 único 429 (02:05, ainda na versão em sequência) e **nenhum** nas 3 consultas paralelas.

## Exemplo / consequência — o que o log real mostrou

Medido no `api.log` real (pasta `logs/mercado_livre` dos dados do sistema), só tempo gasto em chamadas ao ML:

| Versão | Tempo | Detalhe |
|---|---|---|
| Antes (em sequência) | ~6,4 s (pior caso 8,8 s, com um 429 em `/returns`) | ~11 chamadas de ~0,5 s cada |
| Agora (3 ondas) | 1,89 s, 1,53 s e 1,51 s | ondas de ~0,45 s, ~0,9 s e ~0,15 s |

**Por que ainda são ~1,5 s e não 0,95 s** (tempo do script de teste, com o pool "quente"):

- Nas 3 consultas as conexões estavam **frias**: o pool é descartado depois de 20 s parado e a Ana leva mais que isso entre uma consulta e outra. A prova está na onda 3, que reaproveita conexões e leva 0,15 s para as mesmas chamadas que levam 0,5 s com conexão nova — a diferença, ~0,35 s, é o handshake.
- O detalhe da claim e as mensagens, as 2 chamadas mais lentas do Mercado Livre (~0,9 s), seguram a onda 2 mesmo em paralelo.
- Estimativa de piso: ~0,8 s, porque são 3 etapas que dependem uma da outra.

## Validação nas 49 devoluções existentes (04/10/2026, 04:33)

Matheus rodou o script de validação em lote (2 consultas por devolução, pausa de 1 s). Resultado, em resumo — o detalhe está em [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]]:

| Medida | Valor |
|---|---|
| Consultas | 98 (49 devoluções × 2), 966 chamadas ao ML (~5,4% da cota de 1 hora) |
| ERRO / instável / 429 | 0 / 0 / 0 |
| Tempo da consulta inteira | média 0,94 s, mediana 0,88 s, 90% em 1,13 s, máximo 2,62 s (o pack) |
| Banco de dados | no máximo 0,02 s |
| Montagem do HTML | ~4 ms em média, no máximo 0,07 s |
| Rajada | 420 chamadas em 1 minuto, sem 429 |

- Esses tempos são com conexões **quentes** (pausa de 1 s entre devoluções): batem com o piso estimado de ~0,8 s e com o ganho estimado do ciclo B (~0,9 s). A Ana, com conexões frias, continua perto de ~1,5 s no log real; a primeira consulta fria da rodada levou 2,42 s.
- Todo o tempo é espera pelo Mercado Livre: banco e HTML somam menos de 0,02 s.

## O que foi proposto e dispensado

Depois de ver o log, Claude propôs 4 ciclos pequenos; Matheus testou melhor e respondeu que "está bem rápido", então **nenhum foi aplicado**. Ficam registrados caso a lentidão volte a incomodar:

- **A — anexos sem fila**: o `proxy_anexo_claim` (miniaturas do chat) ainda usa o espaçador. No log, 6 fotos ficaram prontas em 3,1 s por causa da fila de 0,4 s, e enquanto esperam ocupam as threads do servidor (o waitress usa 4 por padrão), podendo atrasar a próxima busca. Desligar o espaçador só nesse proxy é 1 linha.
- **B — manter conexões aquecidas**: medir por quanto tempo o Mercado Livre mantém uma conexão aberta no PC do escritório e ajustar os 20 s do pool. Ganho estimado de 0,5 a 0,7 s (de 1,5 s para ~0,9 s).
- **C — medir o resto**: registrar quanto leva o banco e a montagem da página, hoje desconhecidos (o banco é local, então deve ser pouco). **Respondido em 04/10/2026, 04:33, sem aplicar nada**: a validação em lote mediu — banco no máximo 0,02 s e HTML ~4 ms em média; o resto é espera pelo Mercado Livre.
- **D — carregar o detalhe da claim e as mensagens só ao abrir o chat**: tira ~0,35 s do caminho principal, mas cria espera na hora de abrir o chat. Só vale se a Ana nem sempre usa o chat.

**Onde está no código**: `api_mercado_livre/core/estrutura_api/cliente_api.py` (pool, ocioso de 20 s, trava do logger), `integracao_mercado_livre/views.py` (`_chamar_api_consulta`, `_obter_meu_user_id`, `_rodar_onda`, `_buscar_pedido_e_claims`, `_buscar_claim`, `_buscar_mensagens_da_claim` e as 3 ondas dentro de `view_consultar_pedido`). O relatório do script de teste fica em `scripts_exploracao_ML/logs/testar_paralelismo_consultar_pedido_relatorio.txt`.

**Em aberto**:

- [x] Validar em pedido com mediação (2 claims), devolução sem devolução física, número de Pack e pedidos da MB — feito em lote em 04/10/2026 (ver [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]])
- [ ] Ainda sem validar: a busca por ID do cliente (não faz parte da rodada em lote) e, olhando a tela, a confirmação de `MB_USER_ID` e das bolhas "Você" do chat num pedido de mediação da MB
- [ ] Olhar o console do sistema à procura de "429 em" (no `api.log` da rodada em lote: nenhum 429)
- [ ] Gerar um novo .exe antes de a Ana receber a mudança
- [x] Script de exploração que roda a Consultar Pedido sobre todas as devoluções do banco — feito e rodado por Matheus em 04/10/2026 (ver [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]])
- [ ] Ainda em sequência e com espaçador, por escolha: busca por ID do cliente e caminho de Pack

## Relacionado

- [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]]
- [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]]
- [[Chat do ML na Consultar Pedido - Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna]]
- [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]
- [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]]
- [[Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final]]
