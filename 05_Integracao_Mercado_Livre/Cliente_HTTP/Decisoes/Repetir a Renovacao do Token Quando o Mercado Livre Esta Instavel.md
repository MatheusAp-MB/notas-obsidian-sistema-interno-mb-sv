---
tipo: decisao
dominio: python
status: concluida
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [Autenticacao e Autorizacao na API do Mercado Livre, Padrao de Robustez para Clientes de API Externa, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Um 503 do ML na renovação do token da MB derrubou o Atualizar dia com a mensagem de refresh_token revogado (12/10/2026). Matheus mandou aplicar, começando com 10 s de espera: a renovação agora tenta até 3 vezes (esperas de 10 s e 20 s) em 5xx, 408, 429 e erro de rede, mantém o lock vivo na espera e só manda reautorizar em 400/401. Testado em simulação; na API real só o caminho normal foi visto."
---

# Repetir a Renovação do Token Quando o Mercado Livre Está Instável

## Resumo

Em 12/10/2026, ao clicar em "Atualizar dia" (08/07/2026), a renovação do token da conta MB recebeu **HTTP 503** do Mercado Livre ("upstream connect error ... connection termination": a conexão caiu do lado do ML). O código tratava **qualquer resposta diferente de 200** como "refresh_token revogado" e mandava rodar `autorizacao_inicial.py`; a tela devolveu erro 500. **Nenhuma chamada de pedidos foi feita** e o `.env` **não mudou**.

Matheus mandou aplicar a correção, **"mas comece com um delay de 10s"**. Em `api_mercado_livre/core/auth/gerenciador_token.py`, a renovação agora **repete** quando o problema é do ML ou da rede, e só pede nova autorização quando o ML **recusa** o token.

> [!success] Status: concluída (12/10/2026)
> Código aplicado, testado em simulação local e confirmado na API real **só no caminho normal** (`teste_conexao.py`: "Renovando..." e depois HTTP 200 na conta MB). O caminho de **falha real** (um 5xx de verdade depois da correção) ainda **não foi visto**.

## Contexto

O token de acesso dura 6 horas e é renovado 30 minutos antes de vencer. O `refresh_token` do ML é de **uso único**: cada renovação devolve um par novo, e o código só grava o par novo no `.env` depois de um **200** ([[Autenticacao e Autorizacao na API do Mercado Livre]]). Cada conta (MB e SV) tem um arquivo de trava (`.token_<conta>.lock`) para dois processos não renovarem ao mesmo tempo; a trava com mais de **15 s** é considerada órfã e descartada, e quem só está esperando outro processo renovar aguarda no máximo **60 s**.

## A pergunta

Como fazer uma queda curta do ML (alguns segundos ou 1 minuto) **não** virar "refaça a autorização", sem esconder um token realmente revogado e sem deixar a trava expirar durante a espera?

## O que levou à decisão

| Caminho | Por que foi descartado ou escolhido |
|---|---|
| Deixar como estava | **Descartado**: um 503 passageiro derrubou a tela e a mensagem mandava reautorizar sem necessidade. |
| Repetir **qualquer** erro | **Descartado**: um 400 `invalid_grant` ou um 401 é recusa de verdade; repetir só atrasaria e gastaria o `refresh_token`. |
| Repetir **só o que é passageiro**, com limite | **Escolhido**: 5xx, 408, 429 e erro de rede/timeout repetem; o resto sobe na hora. |
| Esperas longas (minutos) | **Descartado**: a espera total precisa caber nos 60 s que o processo que só aguarda tolera. |

## Decisão

| Item | O que é |
|---|---|
| `ESPERAS_ENTRE_TENTATIVAS_RENOVACAO_SEGUNDOS = (10, 20)` | **3 tentativas**; espera de 10 s antes da 2ª e de 20 s antes da 3ª (30 s no pior caso, dentro dos 60 s). O 10 s inicial foi pedido por Matheus. |
| Falha passageira | Qualquer **5xx**, **408**, **429**, `Timeout`, `ConnectionError` ou `ChunkedEncodingError`. Mensagem na tela: "[AUTH] Renovação da conta X falhou (...). Nova tentativa em Ns (tentativa k de 3)...". |
| Falha de verdade | **400 `invalid_grant`, 401** e as demais respostas: `FalhaAutenticacao` **na hora**, sem repetir (a mensagem que manda rodar `autorizacao_inicial.py` fica só para este caso). |
| `FalhaAutenticacaoTemporaria` | Se as 3 tentativas falharem: nova exceção, **subclasse** de `FalhaAutenticacao` (quem já captura o erro antigo continua funcionando, como o `teste_conexao.py`). A mensagem diz que **não** indica refresh_token inválido, que é para tentar de novo em alguns minutos e **para não rodar `autorizacao_inicial.py`**. |
| Mesmo `refresh_token` em cada tentativa | O par novo só é gravado no `.env` depois de um 200: uma falha **nunca altera** o `.env`. |
| Aviso de resposta perdida | Se, depois de uma falha passageira, o ML responder 400/401, a mensagem acrescenta que o ML pode ter processado a tentativa anterior e a resposta ter se perdido (o `refresh_token` só vale uma vez). |
| Batimento da trava | A hora do lock é renovada a cada tentativa e **de 5 em 5 s** durante a espera (`PASSO_DO_CARIMBO_DO_LOCK_SEGUNDOS = 5`), gravando um arquivo novo e trocando por `os.replace` (troca atômica), para outro processo nunca ver a trava sumida nem pela metade e não descartá-la como órfã (limite de 15 s). Se a trava tiver sumido, **não** é recriada. |

## Como foi testado

- **Simulação local** (resposta falsa do ML, esperas contadas sem esperar de verdade, sem rede e sem tocar no `.env`), **11 cenários, todos passaram**: 200 de primeira; 503, 503 e 200; 3 × 503 (vira `FalhaAutenticacaoTemporaria`, sem a palavra "revogado"); 400 e 401 sem repetir; 404 sem repetir; 503 e depois 400 (com o aviso de resposta perdida); timeout e depois 200; 3 × erro de conexão; 429 e depois 200; 500 e depois 200. Mais duas checagens: a exceção nova é subclasse da antiga e o carimbo da trava **nunca recria** uma trava que sumiu.
- **API real:** `scripts_exploracao_ML/teste_conexao.py` (Matheus rodou em 12/10/2026): "[AUTH] Token da conta MB expirando. Renovando..." e "renovado", conta MB, **HTTP 200**. Só o caminho normal.

## Limites

- Um **5xx real** depois da correção ainda não foi visto; a prova da repetição é só a simulação.
- 3 tentativas e 30 s: uma queda do ML **maior que isso** ainda derruba o clique, mas agora com a mensagem certa (tentar de novo, não reautorizar).
- A conta **SV** não foi exercitada com o código novo (a lógica é a mesma, por conta).
- Não foi feito git (só Matheus faz commit e push).

## Relacionado

- [[Autenticacao e Autorizacao na API do Mercado Livre]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
