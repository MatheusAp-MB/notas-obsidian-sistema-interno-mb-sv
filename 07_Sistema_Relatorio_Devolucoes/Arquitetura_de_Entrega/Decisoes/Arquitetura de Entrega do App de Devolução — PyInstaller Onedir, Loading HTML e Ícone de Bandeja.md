---
tipo: decisao
dominio: python
status: concluida
criado: 01/09/2026
atualizado_em: 02/09/2026 03:14
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Processo de Devolução de Produtos e os 3 Caminhos Possíveis, Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]
---

# Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja

**Resumo**: a entrega do app de devolução pro usuário final ficou definida como Django (via `waitress`) rodando local, empacotado com PyInstaller em modo `--onedir --noconsole`, abrindo uma tela HTML de carregamento instantânea que troca sozinha pro site real quando o servidor sobe, com um ícone na bandeja do Windows (`pystray`) pra reabrir ou encerrar. Essa é a arquitetura validada pro projeto inteiro, não só um teste isolado.

> [!success] Decidido e validado — 01/09/2026, 21:13
> Mecanismo testado ponta a ponta: `.exe` abre, mostra "Iniciando o sistema...", troca sozinho pro site real, ícone de bandeja funcional, sem console visível.

## Contexto

O requisito mais crítico do projeto (ver [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]) era garantir que o usuário final, não-técnico, conseguisse abrir o sistema como um app comum — clicou, usou — sem depender de Python, terminal ou do dev por perto no dia a dia.

## O problema

Como entregar um app Django, com a mesma qualidade visual de um site de verdade, rodando localmente, mas parecendo um programa comum: com feedback visual claro de "iniciando" (o usuário não pode ficar sem saber se travou), e um jeito claro de encerrar o processo — sem console visível, não dá pra simplesmente fechar uma janela de terminal.

## O que levou à resposta

1. Primeira validação: `waitress` + `webbrowser` num script simples confirmou que o servidor sobe e o navegador abre sozinho, sem comando manual.
2. Empacotamento inicial com PyInstaller `--onefile` funcionou, mas sem feedback visual de carregamento nenhum.
3. Tentativa de splash nativo com Tkinter esbarrou num bug real e reproduzível (`Tcl_AsyncDelete: async handler deleted by the wrong thread`), confirmado independente do terminal (Git Bash e PowerShell deram o mesmo erro) e independente da ordem de criação da thread — Tkinter puro (sem thread) funcionava normal, a combinação com thread de fundo quebrava. A causa raiz exata não foi isolada por completo (não chegou a se confirmar se é Tkinter + qualquer thread, ou algo mais específico da combinação com o `waitress`) — a decisão foi abandonar Tkinter em vez de continuar depurando, já que existia caminho mais simples disponível.
4. Investigação do `agente_local` (Agenda de Vídeos, mesmo sistema/empresa) mostrou que ele nunca usou Tkinter — usa `pystray` + `Flask`, e o aviso visual "AGUARDANDO..." que o usuário lembrava é um banner dentro da própria página web (Django), não uma janela nativa de sistema operacional.
5. Baseado nisso, o desenho mudou: a tela de carregamento virou uma página HTML estática (`loading.html`), aberta via `file://` direto no navegador, com JavaScript testando a conexão com o Django em loop (`fetch`) até conseguir, redirecionando sozinha pro site real quando pronto. Isso eliminou o Tkinter e o bug de vez.
6. Testado de novo com `--onefile`: funcionou, mas o carregamento HTML só aparecia depois de vários segundos de nada na tela — causa encontrada: o modo `--onefile` do PyInstaller sempre extrai tudo (Python + bibliotecas) pra uma pasta temporária a cada execução, **antes** de qualquer código Python (inclusive a tela de carregamento) rodar. Não existe correção possível dentro do próprio código pra esse atraso.
7. Trocado pra `--onedir` — sem extração em tempo de execução, carregamento quase instantâneo. Testado também com `--noconsole`, sem o bug conhecido de `sys.stdout`/`sys.stderr` virarem `None` (ver [[Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]]), porque o script não tem nenhuma escrita direta nesses streams.

## Decisão

Arquitetura de entrega fixada, valendo pro projeto inteiro: Django + `waitress` (servidor local) → PyInstaller `--onedir --noconsole` (pasta, não arquivo único — usuário recebe um `.rar` com a pasta dentro, ainda simples de distribuir) → `loading.html` estático como tela de carregamento inicial, com redirecionamento automático via JS → `pystray` como ícone de bandeja (menu "Abrir no navegador" / "Encerrar").

## Exemplo

Comando de build validado (atualizado em 02/09/2026 — os 2 `--add-data` de `devolucoes/templates` e `devolucoes/static` foram acrescentados depois, ao corrigir os bugs de empacotamento descritos no checkpoint de 01/09/2026 23:11 — ver também [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]):
```
poetry run pyinstaller --onedir --noconsole --name SistemaDevolucoes --add-data "loading.html;." --add-data "devolucoes/templates;devolucoes/templates" --add-data "devolucoes/static;devolucoes/static" --hidden-import=pystray._win32 launcher.py
```

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
- [[Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitacao no Pausar-Cancelar]]
