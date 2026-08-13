---
tipo: descoberta
dominio: python
status: corrigida
criado: 12/08/2026
atualizado_em: 12/08/2026 23:51
relacionado: [Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada, Disciplina de Testes Automatizados]
---

# Teste de ApiSysemp Monkeypatchava Variável de Ambiente com Nome Errado

`ApiSysemp._carregar_token_do_env()` lê `os.environ.get('MB_SYSEMP_API_TOKEN')` — nome correto, batendo com o `.env` real do usuário e com [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]. O bug estava em `api_sysemp/tests/test_nivel_0__api_sysemp.py`: a fixture `autouse` (`_sem_dotenv_real`) e o teste `test_init_sem_token_explicito_carrega_da_variavel_de_ambiente` usavam `monkeypatch.setenv`/`delenv` em `SYSEMP_API_TOKEN` — nome antigo, sem o prefixo `MB_`. Resíduo nunca fechado do commit `fe032ac`, que já tinha avisado sobre esse desalinhamento sem travar o commit ("a mensagem de erro ainda cita SYSEMP_API_TOKEN... texto antigo... se quiser, ajusto isso num próximo commit").

## Mecanismo do bug

`projeto_sistema_interno_mb_sv/settings.py` chama `load_dotenv()` sem argumento na inicialização do Django — carrega o `.env` real pro `os.environ` **uma vez, antes de qualquer teste rodar**, pra sessão inteira do pytest. Como a fixture autouse só limpava `SYSEMP_API_TOKEN` (nome errado) e nunca `MB_SYSEMP_API_TOKEN` (nome real), o token verdadeiro do `.env` sempre vazava pra dentro dos 2 testes que deveriam controlar o cenário via monkeypatch — os 2 passavam por acidente, sem cobrir de fato o que diziam cobrir (token forjado / ausência total de token).

O bug só ficou visível quando o usuário preencheu um valor real em `MB_SYSEMP_API_TOKEN` no `.env` — antes disso, a variável ficava vazia e mascarava o problema (o teste "esperado" e o "vazamento real" davam o mesmo resultado incorreto por coincidência: nenhum token válido).

## Diagnóstico (2 hipóteses erradas antes da causa real)

1ª hipótese: `.env` do usuário estaria errado. Descartada — usuário confirmou `MB_SYSEMP_API_TOKEN` preenchido corretamente, batendo com o código.
2ª hipótese: o código deveria voltar a ler `SYSEMP_API_TOKEN` (sem prefixo). Descartada — o próprio arquivo de teste prova a intenção real: comentário explícito no topo ("nunca lê o .env real... SYSEMP_API_TOKEN controlado só via monkeypatch") e a fixture autouse, ambos citando o nome sem prefixo — sinal claro de que o TESTE, não o código nem o `.env`, ficou desatualizado depois da divisão MB_/SV_ feita em `fe032ac`.

## Correção

3 pontos corrigidos em `api_sysemp/tests/test_nivel_0__api_sysemp.py`: comentário do topo do arquivo, `monkeypatch.delenv('SYSEMP_API_TOKEN', ...)` → `monkeypatch.delenv('MB_SYSEMP_API_TOKEN', ...)`, `monkeypatch.setenv('SYSEMP_API_TOKEN', ...)` → `monkeypatch.setenv('MB_SYSEMP_API_TOKEN', ...)`. Confirmado: suíte inteira **520 passed, 0 failed, 12 xfailed**.

## Relacionado

- [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]
- [[Disciplina de Testes Automatizados]]
