---
tipo: regra
dominio: 
status: ativa
criado: 01/09/2026
atualizado_em: 04/09/2026 21:25
relacionado: [Regra do Índice Obrigatório]
---

# Índice — Sistema de Relatório de Devoluções

Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por contexto/área. Atualizado junto da autorização de escrita de cada nota (ver [[Regra do Índice Obrigatório]]).

Mundo criado em 01/09/2026 — projeto novo, completamente paralelo aos demais mundos ativos. Escopo ainda em discussão e refinamento.

## Conceitos

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]] | conceito | ativa | 01/09/2026 | Todo produto devolvido segue 1 de 3 caminhos conforme a condição física: venda comum, venda como usado, ou troca (reservado, fora de venda). |

## Checkpoints

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]] | checkpoint | em_andamento | 04/09/2026 | Rascunho apresentado e 100% aprovado via runserver em LAN, validado por usuária final e superior — projeto vira desenvolvimento real. .exe com 2 bugs diagnosticados (correção ainda não testada); bloqueio de hardware (HD lento) resolvido com PC novo. |

## Decisoes

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]] | decisao | concluida | 01/09/2026 | App entregue como .exe (PyInstaller onedir+noconsole), tela HTML de carregamento instantânea e ícone de bandeja (pystray) — validado ponta a ponta. |
| [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]] | decisao | concluida | 02/09/2026 | Tela "Produtos" nova (listagem+cadastro com foto), edição de dados do produto embutida no catálogo, e navegação simples entre as 2 telas diretas. |
| [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]] | decisao | concluida | 02/09/2026 | Nova Devolução busca produto/peças reais, cobre os 4 cenários de conferência, e gera PDF de verdade via xhtml2pdf — sem salvar no banco, fluxo por GET. Rascunho validado. |
| [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]] | decisao | concluida | 04/09/2026 | Banco muda de SQLite pra MySQL (padrão do Sistema Interno V2); modelo de entrega final fica pasta (--onedir) + atalho, sem instalador. Setup do MySQL manual só na 1ª vez, migrations automáticas depois. |

## Tutoriais

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]] | tutorial | ativa | 02/09/2026 | Passo a passo pra testar em modo desenvolvimento (runserver) e compilando o .exe de verdade (PyInstaller), com atenção ao teste do PDF empacotado. |
