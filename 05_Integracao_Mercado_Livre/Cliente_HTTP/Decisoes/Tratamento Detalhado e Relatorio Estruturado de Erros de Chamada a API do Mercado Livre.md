---
tipo: regra
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 23:00
relacionado: [Boas Praticas para Uso da Plataforma do Mercado Livre, Consideracoes de Design da API do Mercado Livre, Erro 403 (Forbidden) da API do Mercado Livre, Autenticacao e Autorizacao na API do Mercado Livre, Padrao de Robustez para Clientes de API Externa, Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]
---

# Tratamento Detalhado e Relatório Estruturado de Erros de Chamada à API do Mercado Livre

## O quê é esta regra, e de onde ela veio

**O quê**: toda vez que um script do projeto conversa com a API do Mercado Livre (leitura ou escrita), qualquer erro que aconteça deve ser tratado em 2 partes: (1) capturado com o máximo de detalhe possível, extraindo os 4 campos que o Mercado Livre sempre devolve em erro (`message`, `error`, `status`, `cause`) — nunca só o texto cru da resposta —, e (2) reportado ao final da execução em 2 tabelas, uma de ocorrência e uma de resumo agregado (ver seções abaixo).

**Por quê**: esta regra nasceu de uma discussão real em 26/08/2026, durante o estudo da camada superior da API do Mercado Livre. Dois achados motivaram: (a) o Mercado Livre sempre devolve um erro estruturado (ver [[Consideracoes de Design da API do Mercado Livre]]), mas o código hoje ignora isso e só embrulha o texto cru dentro da exceção `ErroAPI`; (b) não existia nenhuma visibilidade agregada de quantos erros (de qualquer tipo, não só 429) aconteceram numa execução — só linhas soltas de log, sem contagem.

**Pra quê**: dar visibilidade real sobre o que está acontecendo nas chamadas à API, sem depender de vasculhar arquivo de log manualmente, e permitir que o código reaja de forma diferente pra cada tipo real de erro (não só pelo número do HTTP status, que sozinho pode esconder situações bem diferentes — ver exemplo em [[Consideracoes de Design da API do Mercado Livre]]).

## Escopo: só Mercado Livre, por decisão explícita

> [!info] Por que esta regra não é cross-cutting (não vale pro Sysemp hoje)
> Durante a discussão que originou esta regra, foi levantada a pergunta se ela deveria valer pra qualquer API do projeto (o que a colocaria em [[Padrao de Robustez para Clientes de API Externa]], regra compartilhada com `03_Integracao_Sysemp/`). **Confirmado em 26/08/2026, 21:33: o escopo é só o Mercado Livre**, por enquanto. Se, mais adiante, essa regra se provar útil aqui e fizer sentido pro Sysemp também, ela pode ser promovida pra regra cross-cutting — mas essa promoção é uma decisão separada, ainda não tomada.

## Regra 1 — extrair todo campo de erro que existir (o formato varia, não é fixo)

Nunca tratar um erro da API do Mercado Livre só pelo HTTP status. A API sempre devolve informação estruturada no corpo do erro — mas **o conjunto de campos não é fixo**, varia de erro pra erro. Isso foi confirmado com exemplos reais em 26/08/2026, comparando o formato "genérico" (visto no estudo de [[Consideracoes de Design da API do Mercado Livre]]) com o formato real de um erro 403 (visto no estudo de [[Erro 403 (Forbidden) da API do Mercado Livre]]):

Formato genérico documentado:
```json
{
  "message": "human readable text",
  "error": "machine_readable_error_code",
  "status": 400,
  "cause": []
}
```

Formato real de 2 erros 403 diferentes:
```json
{"status": 403, "error": "Invalid scopes", "code": "FORBIDDEN"}
```
```json
{"status": 403, "error": "access_denied", "message": "access to the requested resource is forbidden", "code": "FORBIDDEN"}
```

Repare: nenhum dos 2 exemplos de 403 tem `cause`; o primeiro nem tem `message`; os 2 têm um campo `code` que não existia no formato genérico.

**Ajuste na regra, feito em 26/08/2026, 21:42, ampliado às 21:53, e de novo às 23:00**: a extração de erro não pode assumir que `message`/`error`/`status`/`cause` sempre vêm todos — precisa ler **o que vier**, campo por campo, sem quebrar se algum estiver ausente. Campos conhecidos até agora: `status` (sempre presente — é o próprio HTTP status repetido no corpo), `error`, `message`, `cause`, `code`, `error_description` (visto no erro `invalid_grant` do fluxo OAuth, ver [[Autenticacao e Autorizacao na API do Mercado Livre]]), e `blocked_by` (visto no erro de permissão funcional faltando, ver [[Erro 403 (Forbidden) da API do Mercado Livre]]) — todos exceto `status` devem ser tratados como opcionais. Pode aparecer campo novo, ainda não visto, em outro tipo de erro — a extração deve ser tolerante a isso, nunca travar por causa de um campo ausente ou desconhecido.

Exemplo mais recente, confirmando de novo que o conjunto de campos não é fixo (visto em 26/08/2026, doc "Permissões funcionais"):
```json
{
  "code": "PA_UNAUTHORIZED_RESULT_FROM_POLICIES",
  "blocked_by": "PolicyAgent",
  "message": "At least one policy returned UNAUTHORIZED.",
  "status": 403
}
```
Repare: este exemplo não tem `error` nem `cause`, mas traz `blocked_by` — campo novo, que identifica **qual sistema interno do Mercado Livre bloqueou o pedido** (aqui, o `PolicyAgent`, o sistema de permissão). Já são 3 formatos de erro 403 diferentes vistos até agora — reforça que a extração precisa continuar tratando todo campo (exceto `status`) como opcional.

Esses campos precisam ser extraídos e carregados por qualquer exceção que o código levantar. Hoje, `api_mercado_livre/core/estrutura_api/cliente_api.py` só faz:

```python
raise ErroAPI(f"Erro {resposta.status_code} em {_mascarar_endpoint(endpoint)}: {resposta.text}")
```

— jogando fora todo campo estruturado (`error`, `cause`, `code`, e qualquer outro), mesmo estando disponíveis na resposta.

> [!warning] Pendência técnica — ainda não implementado
> Esta regra foi definida em 26/08/2026, mas a implementação real dentro de `cliente_api.py` (e de qualquer lugar que hoje capture `ErroAPI`/`ErroAutenticacaoAPI`) ainda não foi feita. Fica registrada aqui como pendência, pra não se perder — decisão de quando implementar ainda não foi tomada.

## Regra 2 — gerar 2 tabelas de erro ao final de toda execução

Todo script que conecta com a API do Mercado Livre (leitura ou escrita) deve, ao final da execução, gerar:

**Tabela de ocorrência** — 1 linha por erro que aconteceu, mesmo que o erro tenha sido recuperado por retry (isso é o que hoje falta: um 429 recuperado com sucesso não aparece em nenhum lugar do resumo final):

| Endpoint | Erro | Parâmetro |
|---|---|---|
| onde aconteceu | o que aconteceu (usando os 4 campos da Regra 1, não só o HTTP status) | com que dado aconteceu |

**Tabela resumo** — agregada, 1 linha por combinação endpoint + tipo de erro:

| Endpoint | Erro | Quantidade |
|---|---|---|
| onde aconteceu | o que aconteceu | quantas vezes se repetiu nesta execução |

### Exemplo ilustrativo (dado fictício, só pra fixar o formato — não é uma execução real)

Tabela de ocorrência:

| Endpoint | Erro | Parâmetro |
|---|---|---|
| `/users/{user_id}/items/search` | 429 Too Many Requests | `status=active, logistic_type=fulfillment` |
| `/items?ids=` | 400 invalid_parameter | `ids=MLB123,MLB456` |

Tabela resumo:

| Endpoint | Erro | Quantidade |
|---|---|---|
| `/users/{user_id}/items/search` | 429 Too Many Requests | 7 |
| `/items?ids=` | 400 invalid_parameter | 1 |

> [!warning] Pendência técnica — ainda não implementado
> Nenhum dos 3 comandos (`buscar_mlbs`, `buscar_detalhes`, `buscar_dados_sku_completo`) gera essas 2 tabelas hoje. O resumo final que já existe (ex: "5 varridas mais lentas", em `buscar_mlbs.py`) mostra tempo e contagem de sucesso/erro por varrida — não mostra tipo de erro nem conta 429 recuperado por retry. Construir isso é trabalho futuro, ainda sem data definida.

## Decisão relacionada: por que não construímos um espaçador proativo de chamadas agora

Esta regra nasceu, em parte, de uma pergunta diferente: faltava uma pausa fixa entre toda chamada à API (espaçador proativo), além do backoff reativo que já existe em `_calcular_espera_backoff()`? O padrão de engenharia do projeto (ver [[Padrao de Robustez para Clientes de API Externa]]) exige as duas peças sempre juntas — o cliente do Mercado Livre hoje só tem a reativa.

**Decisão tomada em 26/08/2026, 21:33: não adicionar o espaçador proativo por enquanto**, por 3 motivos:

1. **Custo fixo escala mal com volume**: uma pausa de 0,2s por chamada parece pequena, mas em 1000 chamadas já são 200 segundos adicionados — e algumas execuções já levam até 1h30 (`buscar_dados_sku_completo` em modo produção, sem `--skus`). Um custo fixo que soma sempre, mesmo quando não é necessário, pesa demais em execuções grandes.
2. **Nosso padrão de uso não é contínuo**: os 3 comandos buscam dado, salvam em JSON, gravam no banco, e param — não ficam fazendo requisição o tempo todo sem motivo. O risco de abuso continuado (o que o espaçador proativo existe pra prevenir) é baixo por natureza do nosso uso.
3. **Webhook no horizonte**: a expectativa é que, no futuro próximo, parte da coleta de dado passe a vir por webhook em vez de chamada bruta à API — reduzindo ainda mais o volume de chamada, o que tornaria o investimento em espaçador proativo menos valioso.

No lugar do espaçador proativo, a resposta escolhida pra manter visibilidade sobre o uso da API foram as Regras 1 e 2 acima — que dão visibilidade real, incluindo quantos 429 aconteceram, sem pagar o custo fixo de uma pausa que talvez nunca seja necessária.

## Relacionado

- [[Boas Praticas para Uso da Plataforma do Mercado Livre]]
- [[Consideracoes de Design da API do Mercado Livre]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
