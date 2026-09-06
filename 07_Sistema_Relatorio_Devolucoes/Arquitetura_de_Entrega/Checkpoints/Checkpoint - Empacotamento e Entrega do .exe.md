---
tipo: checkpoint
dominio:
status: em_andamento
criado: 05/09/2026
atualizado_em: 05/09/2026 17:46
relacionado: [Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja, Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe), 2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada, PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não, Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Checkpoint - Empacotamento e Entrega do .exe

**Resumo do estado atual**: arquitetura de entrega fechada e validada de ponta a ponta — `.exe` (`--onedir`, `--noconsole`) com tela de carregamento HTML e ícone de bandeja, detalhe completo em [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]. Todos os bugs reais de empacotamento encontrados (import dinâmico do `reportlab`, migração não chamada, `mysqlclient`, caminho de dados) foram corrigidos e testados dentro do `.exe`. Falta só criar o atalho do Windows.

> [!success] Empacotamento fechado e testado de ponta a ponta
> Falta apenas o atalho do Windows apontando pra dentro da pasta `--onedir` — resto é decisão e teste já concluídos.

## Linha do tempo

**01/09/2026** — `launcher.py` (`waitress` + `webbrowser`) sobe o Django e abre o navegador sozinho — validado, empacotado `--onefile` (console visível). Iteração até a arquitetura final — detalhe completo em [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]: tentativa de splash com Tkinter abandonada (bug `Tcl_AsyncDelete`), pivô pra tela de carregamento HTML, troca de `--onefile` pra `--onedir` (elimina atraso de extração). Testado com `--noconsole` de ponta a ponta — usuário: "essa será a maneira que iremos seguir o projeto todo". Trava de instância única (`porta_ja_em_uso()`) implementada e testada no `.exe` real.

**02/09/2026** — Bug real encontrado e corrigido: banco/fotos usavam `BASE_DIR`, que dentro do `.exe` aponta pra pasta recriada a cada build — corrigido apontando pra `%APPDATA%` (substituído depois, ver 05/09/2026).

**03/09/2026** — 2 bugs reais de empacotamento encontrados testando a 1ª tela dentro do `.exe` — detalhe completo em [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]. Correção proposta, não testada ainda nesta data (HD lento inviabilizava recompilar).

**04/09/2026** — Computador de produção trocado (SSD novo) — HD lento deixa de ser bloqueio pra recompilar.

**05/09/2026** — `mysqlclient` validado dentro do `.exe`, depois de 2 tentativas erradas — detalhe completo em [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]. Isso também validou os 2 bugs de 03/09/2026 (nunca tinham sido recompilados/testados até então). Caminho de banco/mídia trocado pra pasta fixa via `.env` (`DADOS_DIR`), substituindo o fix de `BASE_DIR` de 02/09/2026 — detalhe completo em [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]].

## Em aberto

- [ ] Criar atalho do Windows apontando pro `.exe` dentro da pasta `--onedir` (parte do modelo de entrega final) — **pausado em 05/09/2026**, foco na reforma estrutural

## Relacionado

- [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]
- [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]
- [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]
- [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]
- [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
