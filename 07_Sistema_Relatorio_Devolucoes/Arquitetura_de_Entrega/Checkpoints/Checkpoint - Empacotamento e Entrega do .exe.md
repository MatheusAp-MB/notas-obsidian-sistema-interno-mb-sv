---
tipo: checkpoint
dominio:
status: em_andamento
criado: 05/09/2026
atualizado_em: 09/09/2026 02:07
relacionado: [Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja, Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe), 2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada, PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não, Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen, 2 Bugs na Abertura pelo IP da Rede — CWD do .env e Query String em URL Local, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Checkpoint - Empacotamento e Entrega do .exe

**Resumo do estado atual**: arquitetura de entrega fechada e validada de ponta a ponta — `.exe` (`--onedir`, `--noconsole`) com tela de carregamento HTML e ícone de bandeja, detalhe completo em [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]. Todos os bugs reais de empacotamento encontrados (import dinâmico do `reportlab`, migração não chamada, `mysqlclient`, caminho de dados) foram corrigidos e testados dentro do `.exe`. Em 09/09/2026, fechada também a abertura automática pelo IP da rede local (`IPV4_LOCAL` no `.env`), depois de 2 bugs empilhados — ver [[2 Bugs na Abertura pelo IP da Rede — CWD do .env e Query String em URL Local]]. Falta: reverter a tela de carregamento do estado de diagnóstico pra versão simples de produção, e criar o atalho do Windows.

> [!success] Empacotamento fechado e testado de ponta a ponta, incluindo acesso pelo celular
> `.exe` abre sozinho no IP da rede configurado no `.env` (com fallback pra `127.0.0.1` se o IP não existir mais na máquina), acessível também pelo celular na mesma rede. Falta só reverter a tela de carregamento (hoje em modo diagnóstico) e criar o atalho do Windows apontando pra dentro da pasta `--onedir` — resto é decisão e teste já concluídos.

## Linha do tempo

**01/09/2026** — `launcher.py` (`waitress` + `webbrowser`) sobe o Django e abre o navegador sozinho — validado, empacotado `--onefile` (console visível). Iteração até a arquitetura final — detalhe completo em [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]: tentativa de splash com Tkinter abandonada (bug `Tcl_AsyncDelete`), pivô pra tela de carregamento HTML, troca de `--onefile` pra `--onedir` (elimina atraso de extração). Testado com `--noconsole` de ponta a ponta — usuário: "essa será a maneira que iremos seguir o projeto todo". Trava de instância única (`porta_ja_em_uso()`) implementada e testada no `.exe` real.

**02/09/2026** — Bug real encontrado e corrigido: banco/fotos usavam `BASE_DIR`, que dentro do `.exe` aponta pra pasta recriada a cada build — corrigido apontando pra `%APPDATA%` (substituído depois, ver 05/09/2026).

**03/09/2026** — 2 bugs reais de empacotamento encontrados testando a 1ª tela dentro do `.exe` — detalhe completo em [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]. Correção proposta, não testada ainda nesta data (HD lento inviabilizava recompilar).

**04/09/2026** — Computador de produção trocado (SSD novo) — HD lento deixa de ser bloqueio pra recompilar.

**05/09/2026** — `mysqlclient` validado dentro do `.exe`, depois de 2 tentativas erradas — detalhe completo em [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]. Isso também validou os 2 bugs de 03/09/2026 (nunca tinham sido recompilados/testados até então). Caminho de banco/mídia trocado pra pasta fixa via `.env` (`DADOS_DIR`), substituindo o fix de `BASE_DIR` de 02/09/2026 — detalhe completo em [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]].

**09/09/2026** — Fechada a abertura automática do `.exe` direto no IP da rede local (`IPV4_LOCAL` no `.env`), pra também funcionar pelo celular na mesma rede — `waitress` passou a escutar em 2 endereços ao mesmo tempo (`127.0.0.1` e o IP da rede). O sintoma ("sempre abre em 127.0.0.1, mesmo com o IP certo no `.env`") vinha de 2 bugs empilhados, produzindo o mesmo resultado na tela: o `.env` não era encontrado dentro do `.exe` (a biblioteca `python-dotenv` procurava a partir do CWD do processo, não da pasta real do `.exe`) e, depois de corrigido isso, uma query string anexada numa URL `file://` (usada pra avisar a tela de carregamento qual endereço abrir) era silenciosamente descartada pelo Windows — detalhe completo, incluindo as 2 correções, em [[2 Bugs na Abertura pelo IP da Rede — CWD do .env e Query String em URL Local]]. Confirmado funcionando de ponta a ponta pelo usuário. Fica em aberto reverter a tela de carregamento (hoje em modo diagnóstico, usado pra provar o 2º bug) pra versão simples de produção.

## Em aberto

- [ ] Criar atalho do Windows apontando pro `.exe` dentro da pasta `--onedir` (parte do modelo de entrega final) — **pausado em 05/09/2026**, foco na reforma estrutural
- [ ] Reverter `launcher_recursos/loading.html` do estado de diagnóstico (título "Diagnóstico", dados internos expostos, clique manual) pra tela simples de produção ("Iniciando o sistema...", sem dado exposto, redirecionamento automático) — usado propositalmente em modo diagnóstico pra confirmar o bug da query string em 09/09/2026, ainda não revertido

## Relacionado

- [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]
- [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]
- [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]
- [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]
- [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]]
- [[2 Bugs na Abertura pelo IP da Rede — CWD do .env e Query String em URL Local]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
