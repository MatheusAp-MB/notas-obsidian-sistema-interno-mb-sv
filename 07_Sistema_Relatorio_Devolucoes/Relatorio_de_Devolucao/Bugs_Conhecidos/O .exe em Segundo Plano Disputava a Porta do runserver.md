---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 09/09/2026
atualizado_em: 09/09/2026 12:00
relacionado: [Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe), Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]
---

# O .exe em Segundo Plano Disputava a Porta do runserver

**Resumo**: com o `.exe` empacotado (`launcher.py` + waitress) aberto em segundo plano, ele e o `python manage.py runserver` disputavam a mesma porta — o navegador continuava falando com o `.exe` antigo (JavaScript desatualizado), fazendo correções de código já confirmadas como certas no GitHub parecerem "sem efeito nenhum" depois de reiniciar o `runserver` e recarregar a página. Descoberto pelo próprio usuário, não por diagnóstico do Claude.

> [!success] Corrigido — 09/09/2026
> Não é bug de código — é um cuidado operacional: fechar o `.exe` antes de testar via `runserver`. Confirmado pelo usuário como a causa real de múltiplos ciclos de "corrigi, testei, continua errado" que consumiram tempo de debug considerável nesta sessão.

## Contexto

O projeto tem 2 formas de rodar: `python manage.py runserver` (desenvolvimento) e o `.exe` empacotado via PyInstaller, que sobe um servidor waitress (`launcher.py`) — ver [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]] e [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]. Os 2 podem, em tese, tentar abrir na mesma porta se rodados ao mesmo tempo.

## O problema

Durante o debug do bug de desalinhamento de colunas (ver [[Tab Apagado pelo trim() Desalinhava o Colar Linha do ERP]]) e, antes dele, do bug de detecção de plataforma, o usuário reportou repetidas vezes que uma correção de JavaScript já confirmada como logicamente certa (sincronizada e revisada linha a linha contra o GitHub) continuava não fazendo efeito nenhum no navegador, mesmo depois de reiniciar o `runserver` e recarregar a página.

## O que levou à resposta

Cada correção era revisada por sincronização com o GitHub antes de ser entregue, e a lógica batia — o que descartava erro de código como explicação. O padrão (correção certa, comportamento ao vivo continua "antigo") persistiu por mais de uma rodada, inclusive num bug diferente (Plataforma não preenchendo). O próprio usuário identificou a causa real: o arquivo `.exe` estava aberto em segundo plano sem ele perceber, competindo pela porta com o `runserver` — o navegador seguia servido pelo `.exe`, que carrega o JavaScript empacotado no build antigo, não o arquivo `.js` sendo editado ao vivo.

## Correção

Não há correção de código — é um cuidado de processo: antes de testar uma mudança via `python manage.py runserver`, fechar qualquer instância do `.exe` (`launcher.py`/waitress) que esteja rodando em segundo plano, garantindo que o navegador fale só com o servidor de desenvolvimento.

## Exemplo

Sintoma característico desse caso: reiniciar o `runserver`, recarregar a página (inclusive hard refresh), e o comportamento ao vivo continuar idêntico ao de ANTES da correção — mesmo com o código no GitHub e no arquivo local batendo. Se isso acontecer de novo, checar primeiro se o `.exe` está aberto em segundo plano antes de suspeitar do código.

## Relacionado

- [[Tab Apagado pelo trim() Desalinhava o Colar Linha do ERP]]
- [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]
- [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]
