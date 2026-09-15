---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 15/09/2026
atualizado_em: 15/09/2026 18:43
relacionado: [Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final, Padrao de Robustez para Clientes de API Externa, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]
---

# Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções

**Resumo do estado atual**: nota temporária de preparação, registrando o levantamento e as decisões já fechadas antes de começar a Executar. Objetivo: 1 botão simples, chamando `/users/me`, dentro de um app Django novo do Sistema de Relatório de Devoluções, pra provar que a API do Mercado Livre funciona de dentro do `.exe` empacotado (PyInstaller) — 1ª tarefa concreta da fase sem pressa aberta em [[Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final]].

## Levantamento do repositório `Projeto-Sistema-Devolucao` (via GitHub, só leitura)

- Nenhum código de integração com API externa existe ainda nesse projeto.
- `requests` não está nas dependências (`pyproject.toml` só tem django, waitress, pystray, pillow, mysqlclient, python-dotenv) — vai precisar ser adicionado.
- Segredos já seguem um padrão pronto: `.env` (gitignored), carregado via `python-dotenv`, com tratamento já resolvido pro caso do `.exe` congelado (`sys.frozen` aponta a pasta do executável em vez do CWD, que não é confiável).
- A home (`core/templates/pagina_home/estrutura_home.html`) tem um card grid de módulos com 1 card vazio "Em breve" já reservado — candidato natural pro botão novo.
- `core/empresa.py` já tem `obter_empresa_ativa()` (retorna `MAGAZINE`/`SAMVALE`, resolvido por sessão via `EmpresaMiddleware`) — mesma peça que falta no cliente ML do Sistema Interno V2 (ver achado abaixo).

## Decisões já confirmadas por Matheus

- Credenciais: reaproveitar as mesmas do Sistema Interno V2 (mesmo App do Mercado Livre, mesmas contas MB/SV) — valores reais copiados manualmente por ele pro `.env` deste projeto na hora de testar; Claude não tem acesso a eles.
- Vira um app Django próprio (nome ainda não decidido).

## Achado relevante que muda o plano — a fonte que estamos espelhando está incompleta

Conferido em [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]: o `.env` do Sistema Interno V2 já é dividido por conta (`MB_CLIENT_ID`, `MB_CLIENT_SECRET`, `MB_REDIRECT_URI`, `MB_ACCESS_TOKEN`, `MB_REFRESH_TOKEN`, `MB_USER_ID`, `MB_TOKEN_CRIADO_EM`, e o mesmo com prefixo `SV_`), com `obter_token_valido(conta)` exigindo `"MB"`/`"SV"` explícito, sem valor padrão, de propósito. Mas esse mesmo cliente **ainda não tem** a separação `excecoes.py`/`protecao.py`/`cliente.py` do [[Padrao de Robustez para Clientes de API Externa]], nem uma Facade que resolve a conta sozinha — hoje quem chama sempre passa `"MB"` ou `"SV"` na mão, decisão consciente de adiar isso pra não misturar migração com refatoração.

Proposta em aberto (ainda sem confirmação final de Matheus): construir o `api_mercado_livre` deste projeto já com a estrutura completa — incluindo a Facade que falta no Sistema Interno V2 — usando o `obter_empresa_ativa()` que este projeto já tem pra resolver `MAGAZINE→MB` / `SAMVALE→SV` sozinha, com erro claro se não houver empresa ativa. Isso deixaria este cliente novo mais completo do que a fonte que ele reaproveita.

## Em aberto pro próximo passo

- Confirmar se a construção segue com a estrutura completa (acima), mesmo indo além do que existe hoje no Sistema Interno V2.
- Nome do app Django novo.
- Nome definitivo do pacote (`api_mercado_livre`, a confirmar).

## Relacionado

- [[Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
