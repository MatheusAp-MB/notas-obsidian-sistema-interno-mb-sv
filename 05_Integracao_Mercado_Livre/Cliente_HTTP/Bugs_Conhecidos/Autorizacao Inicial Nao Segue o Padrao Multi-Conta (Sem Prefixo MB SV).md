---
tipo: bug_conhecido
dominio: python
status: ativo
criado: 26/08/2026
atualizado_em: 26/08/2026 21:53
relacionado: [Autenticacao e Autorizacao na API do Mercado Livre, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]
---

# Autorização Inicial Não Segue o Padrão Multi-Conta (Sem Prefixo MB/SV)

## O quê é este bug, e como foi encontrado

**O quê**: `api_mercado_livre/core/auth/autorizacao_inicial.py` — o script que faz a autorização OAuth pela primeira vez pra uma conta (abrir navegador, vendedor autorizar, trocar `code` por token) — **não aceita nenhum parâmetro de conta** (`MB` ou `SV`). Ele lê `CLIENT_ID`, `CLIENT_SECRET` e `REDIRECT_URI` **sem prefixo** do `.env`, e salva o resultado (`ACCESS_TOKEN`, `REFRESH_TOKEN`, `USER_ID`, `TOKEN_CRIADO_EM`) **também sem prefixo**.

Isso diverge do resto da arquitetura: `api_mercado_livre/core/auth/gerenciador_token.py` (quem renova o token no dia a dia) exige que **tudo** esteja prefixado por conta — `MB_CLIENT_ID`, `SV_CLIENT_ID`, `MB_ACCESS_TOKEN`, `SV_ACCESS_TOKEN`, etc. — e é explícito sobre isso: "Nunca existe valor 'genérico' sem prefixo — decisão consciente, pra nunca haver ambiguidade de qual conta um token pertence" (comentário no topo do próprio arquivo).

**Como foi encontrado**: em 26/08/2026, durante o estudo da doc oficial "Autenticação e Autorização" (ver [[Autenticacao e Autorizacao na API do Mercado Livre]]), ao ler o código real dos 2 arquivos de autenticação lado a lado pra confirmar o fluxo descrito na doc.

## Por que isso é um problema real, não só uma inconsistência de estilo

`gerenciador_token.py` até **recomenda** rodar `autorizacao_inicial.py` como solução quando a renovação falha de verdade (`refresh_token` revogado ou expirado):

```python
raise FalhaAutenticacao(
    f"[FALHA AUTENTICAÇÃO] Renovação da conta {conta} rejeitada pelo ML "
    f"(status {resposta.status_code}). Provável refresh_token "
    f"revogado/expirado. É necessário rodar autorizacao_inicial.py "
    f"novamente para a conta {conta}. Resposta: {resposta.text}"
)
```

Mas, do jeito que `autorizacao_inicial.py` está hoje, rodá-lo **não resolveria o problema pra nenhuma das 2 contas**: ele escreveria `ACCESS_TOKEN`/`REFRESH_TOKEN` sem prefixo no `.env`, enquanto `gerenciador_token.py` só lê `MB_ACCESS_TOKEN` ou `SV_ACCESS_TOKEN` — o valor gravado nunca seria encontrado pelo sistema de renovação.

## Hipótese de origem

O padrão de prefixo por conta foi introduzido durante a migração de 12/08/2026 (ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]), que corrigiu `gerenciador_token.py` explicitamente pra exigir `conta`. Minha hipótese é que `autorizacao_inicial.py` — usado raramente, só na configuração inicial ou se o `refresh_token` expirar de vez — ficou pra trás nessa correção, e o problema nunca apareceu na prática porque nenhuma das 2 contas precisou de reautorização completa desde então.

## Impacto

Só afeta o cenário de **reautorização completa do zero** — algo raro, que só acontece se: o `refresh_token` expirar (6 meses sem uso, cenário improvável dado o uso diário), for revogado manualmente pelo vendedor ou pelo integrador, ou a senha do vendedor mudar. **Não afeta o funcionamento normal do dia a dia** — a renovação automática via `gerenciador_token.py` continua funcionando normalmente pras 2 contas.

## Decisão

> [!warning] Não corrigir agora — decisão explícita do usuário (26/08/2026, 21:53)
> Confirmado que este bug **não será corrigido no momento** — fica registrado como conhecimento, pra não se perder, mas sem prazo definido de correção. Se algum dia for necessário reautorizar a Magazine ou a Samvale do zero antes desta correção ser feita, será preciso ajustar `autorizacao_inicial.py` manualmente naquele momento (adicionar parâmetro `conta` e usar as chaves prefixadas), ou editar o `.env` manualmente depois de rodá-lo, copiando os valores genéricos pras chaves prefixadas certas.

## Relacionado

- [[Autenticacao e Autorizacao na API do Mercado Livre]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
