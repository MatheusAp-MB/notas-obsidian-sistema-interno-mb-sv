---
tipo: decisao
dominio: python
status: ativa
criado: 12/08/2026
atualizado_em: 26/08/2026 09:17
relacionado: [Padrao de Robustez para Clientes de API Externa, Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]
---

# Migração da API do Mercado Livre com Suporte a Múltiplas Contas (MB e SV)

## Contexto

Primeira nota real deste mundo — a integração com a API do Mercado Livre já vinha sendo explorada e usada de fato, mas numa pasta separada do computador, sem relação com o repositório `Projeto_Sistema_Interno_V2`. O usuário decidiu parar de trabalhar com conversas/ambientes fragmentados e migrar esse trabalho pro mesmo repo e pro mesmo fluxo de colaboração já usado no domínio Sysemp — por etapas, começando pela base (autenticação + cliente HTTP), antes de trazer qualquer script que consome a API de negócio.

## O que foi migrado

3 arquivos base, copiados de uma pasta bruta de staging (`API_MERCADO_LIVRE_BRUTA/`) pro endereço final, seguindo o mesmo padrão de pacote já validado no Sysemp (`api_<nome>/core`, ver [[Padrao de Robustez para Clientes de API Externa]]):

```
api_mercado_livre/
  core/
    auth/
      autorizacao_inicial.py   → Momento 1: OAuth2+PKCE, roda manualmente/raramente
      gerenciador_token.py     → Momento 2: ponto único obter_token_valido(), renova sozinho
    estrutura_api/
      cliente_api.py           → transporte HTTP único (chamar_api()), retry/backoff, log mascarado
```

Ajustes exigidos só pela mudança de endereço (comportamento idêntico ao original): `ENV_PATH` ganhou 1 `.parent` extra (arquivo passou a morar 1 nível mais profundo que na pasta antiga); import em `cliente_api.py` passou de `from core.auth...` pra `from api_mercado_livre.core.auth...`; criados os `__init__.py` das 4 pastas novas.

## Achado real no meio da migração: `.env` já estava dividido por conta, o código não

O `.env` já tinha sido reorganizado pelo usuário — todas as credenciais e tokens do ML vêm prefixadas por conta, sem nenhuma variável compartilhada:

```
MB_CLIENT_ID / MB_CLIENT_SECRET / MB_REDIRECT_URI / MB_ACCESS_TOKEN / MB_REFRESH_TOKEN / MB_USER_ID / MB_TOKEN_CRIADO_EM
SV_CLIENT_ID / SV_CLIENT_SECRET / SV_REDIRECT_URI / SV_ACCESS_TOKEN / SV_REFRESH_TOKEN / SV_USER_ID / SV_TOKEN_CRIADO_EM
```

Mas `gerenciador_token.py`, como veio da pasta antiga, só sabia ler nomes sem prefixo (`ACCESS_TOKEN`, `CLIENT_ID`, etc.) — quebrado desde a origem para este `.env`. Corrigido: `obter_token_valido(conta)` agora exige `conta` ("MB" ou "SV") **sem valor padrão, de propósito** — decisão consciente pra nunca deixar ambíguo de qual conta um token pertence, evitando o tipo de bug silencioso que ambiguidade de conta causaria aqui. Toda leitura de `.env` resolve a chave certa a partir de `conta`.

**Detalhe de concorrência, achado ao desenhar a correção (não só renomear a variável):** o lock de renovação (`.token.lock`) era 1 arquivo único — se ficasse assim, renovar o token da MB bloquearia por engano a renovação da SV (e vice-versa), mesmo sendo contas totalmente independentes. Corrigido pra 1 lock por conta (`.token_MB.lock` / `.token_SV.lock`), assim como o arquivo temporário de escrita atômica do `.env` (evita as 2 contas disputarem o mesmo arquivo temporário se renovarem ao mesmo tempo, em processos diferentes).

Consequência direta, não opcional: `cliente_api.py` (`chamar_api()`) também passou a exigir `conta`, repassando pro `obter_token_valido(conta)` internamente.

## Validado com chamada real — as 2 contas

Script de teste (`scripts_exploracao_ML/teste_conexao.py`, `GET /users/me`) reescrito pra usar o `gerenciador_token.py` oficial em vez de ler o token cru do `.env` (versão anterior, recomendada por outra conversa, evitava o gerenciador de propósito porque ele "ainda não suportava múltiplas contas" — motivo que deixou de existir com esta correção). Rodado de verdade pelo usuário, nas 2 contas:

- **MB**: `[AUTH] Token da conta MB expirando. Renovando...` → `[AUTH] Token da conta MB renovado` → `HTTP: 200`.
- **SV**: `[AUTH] Token da conta SV expirando. Renovando...` → `[AUTH] Token da conta SV renovado` → `HTTP: 200`.

Renovação automática de token confirmada funcionando nas 2 contas, não só a leitura de token já válido.

## Reconfirmado em 26/08/2026, 09:17 — início real do foco em Integração Mercado Livre

Usuário retomou esta frente 2 semanas depois (26/08/2026), decidido a focar 100% na Integração Mercado Livre a partir daqui. Antes de qualquer código novo, pediu pra validar ponto a ponto se a base já estava pronta — 1º ponto: conexão inicial + validação de token pras 2 empresas. Rodado `scripts_exploracao_ML/teste_conexao.py` de novo, ao vivo, pelo usuário:

- **SV**: `[AUTH] Token da conta SV expirando. Renovando...` → `[AUTH] Token da conta SV renovado` → `HTTP: 200` → `{'id': ...}`.
- **MB**: `[AUTH] Token da conta MB expirando. Renovando...` → `[AUTH] Token da conta MB renovado` → `HTTP: 200` → `{'id': ...}`.

Confirma que a base migrada/validada em 12/08 (seção acima) continua sólida — renovação automática de token funcionando nas 2 contas 2 semanas depois, sem intervenção manual no `.env`. Nas próprias palavras do usuário: *"OK ponto 01 testado e validado, temos conexão correta com ambas as empresas via API."*

**Nuance encontrada nesta mesma validação (26/08), relevante pra próximos pontos:** a peça que falta pra chamar isso de "escolha automática de empresa" pronta de ponta a ponta é o Facade — hoje quem decide "MB" ou "SV" é sempre quem chama `obter_token_valido(conta)`/`chamar_api(..., conta)` na mão (o próprio `teste_conexao.py` faz isso com 2 atribuições seguidas à mesma variável `CONTA`, uma comentada como alternativa da outra). Não existe ainda, pro lado do ML, uma classe equivalente à `ApiSysemp(empresa=None)` que puxa `obter_empresa_ativa()` sozinha — ver correção da pendência abaixo.

## Pendências conhecidas, não resolvidas nesta migração

- ~~`api_sysemp/__init__.py` foi desbloqueado só com um hardcode temporário pra conta MB (não usa este mesmo padrão de parâmetro `conta` explícito) — inconsistência entre os 2 clientes de API do projeto~~ — **desatualizado: confirmado em 26/08/2026 que `api_sysemp/__init__.py` já usa `obter_empresa_ativa()` + `PREFIXO_ENV_POR_EMPRESA` (Facade `ApiSysemp(empresa=None)`, resolve a conta sozinha, levanta `RuntimeError` claro se não houver empresa ativa) — o hardcode em MB não existe mais no código atual. O que falta agora é o inverso do que esta pendência dizia: **é o `api_mercado_livre` que ainda não tem esse Facade** — continua exigindo `conta` explícito de quem chama, sem ligação automática com `obter_empresa_ativa()`. Ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]] pro histórico da decisão maior de arquitetura multiempresa.
- `autorizacao_inicial.py` ainda lê/grava nomes de variável sem prefixo (`CLIENT_ID`, `ACCESS_TOKEN`, etc.) — não afeta o uso atual (nenhuma conta precisa reautorizar agora), mas vai quebrar do mesmo jeito que o `gerenciador_token.py` quebrava, se precisar rodar de novo (refresh_token revogado, nova conta).
- Estrutura interna de `core/` não segue ainda a separação `excecoes.py`/`protecao.py`/`cliente.py` do padrão Sysemp (throttle proativo, hierarquia de exceção própria) — avaliado antes da migração, adiado de propósito pra não misturar migração com refatoração.

## Relacionado

- [[Padrao de Robustez para Clientes de API Externa]]
- [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]
