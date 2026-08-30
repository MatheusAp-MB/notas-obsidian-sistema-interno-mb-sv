---
tipo: conceito
dominio:
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 22:24
relacionado:
  - Boas Praticas para Uso da Plataforma do Mercado Livre
  - Consideracoes de Design da API do Mercado Livre
  - Erro 403 (Forbidden) da API do Mercado Livre
  - Autenticacao e Autorizacao na API do Mercado Livre
  - Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre
  - Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale)
  - Como Escrever Notas no Vault — Padrao Hiper-Didatico
---

# Gerencie seu Aplicativo na API do Mercado Livre

## O quê é esta nota, e como ela fecha o estudo da camada superior

**O quê**: 5ª e última nota da camada superior do estudo da API do Mercado Livre. Cobre os endpoints de **gestão do próprio aplicativo** cadastrado no DevCenter — não é sobre um recurso de negócio (item, pedido), é sobre o aplicativo em si: seus dados, quem autorizou ele, e quanto ele está sendo usado.

**Por quê esta é diferente**: as 4 notas anteriores eram só leitura de documentação. Esta gerou um teste real — consultamos ao vivo os dados do nosso próprio aplicativo (conta Magazine) e encontramos coisas que não estavam em nenhuma doc, só existiam no nosso ambiente real. Esses achados ficam numa nota separada, [[Achados Reais na Configuracao do Aplicativo Mercado Livre — Conta Magazine (MB)]], pra não misturar "o que a doc ensina" com "o que descobrimos sendo nosso".

**Fonte**: documentação oficial do Mercado Livre para desenvolvedores, página "Gerencie seu Aplicativo" — última atualização em 06/08/2026 (a mais recente das 5 docs estudadas nesta camada).

## Aviso de prazo Mercado Pago — checado e confirmado que não nos afeta

A doc avisa que, a partir de 30/08/2026, aplicativos precisam estar separados entre Mercado Livre e Mercado Pago (1 aplicativo por unidade) — quem não se adequar perde acesso à API do Mercado Livre. A forma de verificar é conferir, na resposta de `GET /applications/$APP_ID`, se existe algum escopo do tipo `urn:mp:...`.

> [!success] Verificado com dado real em 26/08/2026, nas 2 contas
> Testamos de verdade Magazine e Samvale — nenhuma das 2 tem escopo `urn:mp:...` na lista (ver [[Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale)]]). O prazo não nos afeta, confirmado com prova nas 2 contas, não só suposição.

## Os 5 endpoints de gestão do aplicativo

| Endpoint | O que faz |
|---|---|
| `GET /applications/$APP_ID` | Detalhes completos do aplicativo — nome, escopos concedidos, `max_requests_per_hour`, se está ativo/bloqueado, configuração de webhook, e mais. |
| `GET /users/$USER_ID/applications` | Lista de aplicativos que um usuário específico autorizou. |
| `GET /applications/$APP_ID/grants` | Lista de usuários que autorizaram **este** aplicativo, com paginação (`limit`/`offset`, o modo "normal" já visto em [[Consideracoes de Design da API do Mercado Livre]]). Cada grant tem 3 estados possíveis: **Novo** (concedido há menos de 24h), **Ativo** (usuário usou a API nos últimos 90 dias), **Inativo** (sem uso nos últimos 90 dias). |
| `DELETE /users/$USER_ID/applications/$APP_ID` | Revoga a autorização de um usuário. Operação destrutiva — não usamos, e não faria sentido usar contra nossas próprias contas. |
| `GET /applications/v1/$APP_ID/consumed-applications` | Métrica agregada de consumo do aplicativo: total de chamadas, quebrado por código HTTP de status, e por endpoint mais usado/com mais erro. |

## `max_requests_per_hour` — o número que faltava na discussão do espaçador proativo

O primeiro endpoint (`GET /applications/$APP_ID`) devolve o teto real de chamada por hora do aplicativo — informação que não existia em nenhuma doc anterior, só no dado real do próprio app. Testado em 26/08/2026, nas 2 contas: **Magazine e Samvale têm, as 2, `max_requests_per_hour: 18000`** — isso equivale a 300 chamadas por minuto, ou 5 por segundo. Esse número finalmente dá uma régua real pra decisão (já tomada) de não adicionar um espaçador proativo de chamadas — ver [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]].

## Como testar esses 2 endpoints no nosso projeto

Script de uso único (não faz parte do repositório — é só um teste pontual, roda da raiz do repositório com `poetry run python teste.py`, e não grava nem altera nada, só faz `GET`). Reaproveita `obter_token_valido()` e `chamar_api()` já existentes, então usa o mesmo throttle/backoff e o mesmo log de qualquer chamada do projeto:

```python
"""
teste.py — testa 2 endpoints de "Gerencie seu Aplicativo" (Mercado Livre):
detalhes do app (traz max_requests_per_hour) e métrica de consumo.
Rodar da raiz do repositório: poetry run python teste.py
Só faz GET — não grava nem altera nada.
"""

import os

from api_mercado_livre.core.auth.gerenciador_token import obter_token_valido
from api_mercado_livre.core.estrutura_api.cliente_api import chamar_api
from rich import print

CONTA = "MB"  # troque para "SV" pra testar a conta Samvale

token = obter_token_valido(CONTA)
app_id = os.getenv(f"{CONTA}_CLIENT_ID")

print(f"\n=== Detalhes do aplicativo ({CONTA}, app_id={app_id}) ===")
resposta_app = chamar_api(
    "GET", f"/applications/{app_id}",
    pasta_logs="logs_teste", conta=CONTA, nome_log="teste_app",
)
print(resposta_app.json())

print(f"\n=== Consumo do aplicativo ({CONTA}) — últimos 25 dias ===")
resposta_consumo = chamar_api(
    "GET", f"/applications/v1/{app_id}/consumed-applications",
    pasta_logs="logs_teste", conta=CONTA, nome_log="teste_consumo",
    params={"date_start": "2026-08-01", "date_end": "2026-08-25"},
)
print(resposta_consumo.json())
```

Rodado de verdade em 26/08/2026 pras 2 contas (trocando `CONTA` entre `"MB"` e `"SV"`). Resultado real e achados completos em [[Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale)]] — não repetidos aqui, pra não duplicar.

## Métrica de consumo — testada, e confirmado que não substitui a Regra 2

Testamos `GET /applications/v1/$APP_ID/consumed-applications` de verdade, pedindo o intervalo de 01/08 a 25/08/2026. Resultado real: só **4 chamadas no total** apareceram no relatório inteiro.

> [!warning] Achado real: a métrica tem 1 dia de atraso (D-1), e isso a torna inútil pra debug imediato
> A doc já avisava "a informação é atualizada como D-1" — mas só ficou concreto testando de verdade: como pedimos o intervalo até 25/08, **todo o trabalho pesado feito hoje (26/08) — milhares de chamadas reais dos 3 comandos de coleta — não aparece nesse relatório, e só vai aparecer amanhã**. As 4 chamadas que apareceram (Magazine) são de um teste bem antigo, do início da migração (12/08); testamos a Samvale também e o padrão se repetiu (6 chamadas, também antigas). Isso confirma a decisão já tomada de manter a Regra 2 (relatório próprio, por execução, em tempo real) como abordagem principal — essa métrica nativa serve pra tendência de longo prazo, não pra saber o que aconteceu na execução que acabou de rodar.

## Relacionado

- [[Boas Praticas para Uso da Plataforma do Mercado Livre]]
- [[Consideracoes de Design da API do Mercado Livre]]
- [[Erro 403 (Forbidden) da API do Mercado Livre]]
- [[Autenticacao e Autorizacao na API do Mercado Livre]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
- [[Achados Reais na Configuracao do Aplicativo Mercado Livre — Conta Magazine (MB)]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
