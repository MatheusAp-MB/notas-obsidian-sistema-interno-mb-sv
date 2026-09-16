---
tipo: checkpoint
dominio:
status: concluido
criado: 15/09/2026
atualizado_em: 15/09/2026 20:02
relacionado: [Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final, Padrao de Robustez para Clientes de API Externa, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Cache Local em cliente_api.py Migrado Sem Nenhum Uso Real (Código Morto), ENV_PATH e Lock de Renovação via __file__ Quebram Dentro do .exe Empacotado (PyInstaller PYZ), Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]
---

# Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções

**Resumo do estado atual: concluído e validado de ponta a ponta, 15/09/2026.** Objetivo cumprido: 1 botão simples, `GET /users/me`, dentro do app Django novo `integracao_mercado_livre` do Sistema de Relatório de Devoluções — provando que a API do Mercado Livre funciona tanto em desenvolvimento (`manage.py runserver`) quanto dentro do `.exe` empacotado (PyInstaller `--onedir`), nas 2 contas (MB/Magazine, SV/Samvale). 1ª tarefa concreta da fase sem pressa aberta em [[Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final]].

## Levantamento do repositório `Projeto-Sistema-Devolucao` (sincronizado via GitHub, só leitura, mais de uma vez)

- `requests` não estava nas dependências — adicionado via `poetry add requests`.
- `rich` também não estava (achado só na hora de montar o código, não previsto no levantamento inicial) — adicionado junto, `poetry add rich`.
- Segredos seguem padrão pronto: `.env` (gitignored), `python-dotenv`, com tratamento de `sys.frozen` já resolvido no `settings.py` do projeto (aponta pra pasta do executável, não pro CWD).
- A home tinha 1 card "Em breve" reservado — virou o card do botão novo.
- `core/empresa.py` já tinha `obter_empresa_ativa()` (MAGAZINE/SAMVALE via `EmpresaMiddleware`) — usado pra resolver a conta sozinho.
- Comando de build já existia pronto: `python manage.py gerar_exe` (`devolucoes/management/commands/gerar_exe.py`), reunindo todas as flags de PyInstaller já descobertas em rodadas anteriores de empacotamento.

## Decisões confirmadas por Matheus

- Credenciais: reaproveitadas do Sistema Interno V2 (mesmo App do ML, mesmas contas MB/SV), copiadas manualmente por ele pro `.env` deste projeto.
- Nome do app Django: `integracao_mercado_livre` — mesmo padrão do Sistema Interno V2 (`api_<nome>` pacote puro sem Django, `integracao_<nome>` app Django que o consome, espelhando `api_sysemp`/`integracao_sysemp`).
- Nome do pacote: `api_mercado_livre`, mesmo nome/padrão.
- Estrutura do cliente: **espelha o padrão atual do Sistema Interno V2**, não a estrutura completa (sem Facade, sem separação `excecoes.py`/`protecao.py`/`cliente.py` do [[Padrao de Robustez para Clientes de API Externa]]) — mesma lógica da migração original, não misturar trazer código com refatorá-lo. Fica pendência conhecida, igual já é hoje no Sistema Interno V2.
- Resolução MB/SV: a view chama `obter_empresa_ativa()` sozinha (mapeando MAGAZINE→MB/SAMVALE→SV) e repassa `conta` explícito pro `chamar_api()`/`obter_token_valido()` — o botão não escolhe manualmente.

## Execução — 4 passos, cada um confirmado antes do próximo

1. Dependências: `poetry add requests rich`.
2. `api_mercado_livre/core/` — `gerenciador_token.py` + `cliente_api.py` copiados do Sistema Interno V2. Confirmado por sincronização que a profundidade de `ENV_PATH` (4 `.parent` até a raiz) já nasce correta nesse projeto, sem precisar do ajuste que a migração original teve.
3. `integracao_mercado_livre/` — app novo com a view (`view_teste_conexao_ml`), URL, e template (`teste_conexao.html`, extends `estrutura_base_global.html`).
4. Home — card "Em breve" trocado pelo link do botão novo.

Todo código entregue como texto puro (LOCALIZE:/Substitua) — Claude nunca editou nada dentro do clone real do repositório, regra do vault pra qualquer repo de código.

## 2 bugs reais encontrados e corrigidos durante a validação

- **Código morto migrado sem uso**: `salvar_cache()`/`carregar_cache()` em `cliente_api.py`, sem nenhum chamador — não é bug funcional, mas achado real, documentado em [[Cache Local em cliente_api.py Migrado Sem Nenhum Uso Real (Código Morto)]].
- **`ENV_PATH`/lock de renovação quebravam dentro do `.exe`**: `Path(__file__)` não é confiável dentro do PYZ do PyInstaller (`--onedir`) — `FileNotFoundError` real ao tentar criar `.token_MB.lock`, e `ENV_PATH` calcularia caminho errado mesmo sem esse erro aparecer primeiro. Corrigido com o mesmo padrão `sys.frozen` que o projeto já usa em `settings.py`. Detalhe completo em [[ENV_PATH e Lock de Renovação via __file__ Quebram Dentro do .exe Empacotado (PyInstaller PYZ)]], relacionada com [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]] (mesma família de bug, código diferente).
- Faltou também 1 `--add-data` no `gerar_exe.py` (`integracao_mercado_livre/templates`), sem o qual o template do botão não era empacotado — corrigido junto.

## Validado com chamada real — as 2 contas, dev e `.exe`

- `manage.py runserver`: MB (Magazine) e SV (Samvale) responderam 200 em `/users/me`, cada 1 na troca de empresa certa.
- `.exe` empacotado (`dist/SistemaDevolucoes/SistemaDevolucoes.exe`), depois da correção do `sys.frozen`: mesmo teste, nas 2 contas, confirmado por Matheus — "funcionou perfeitamente".

## Relacionado

- [[Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
- [[Cache Local em cliente_api.py Migrado Sem Nenhum Uso Real (Código Morto)]]
- [[ENV_PATH e Lock de Renovação via __file__ Quebram Dentro do .exe Empacotado (PyInstaller PYZ)]]
- [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]]
