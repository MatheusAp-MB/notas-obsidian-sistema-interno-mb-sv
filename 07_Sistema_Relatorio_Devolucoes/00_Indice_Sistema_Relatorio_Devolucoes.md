---
tipo: regra
dominio:
status: ativa
criado: 01/09/2026
atualizado_em: 07/09/2026 01:00
relacionado: [Regra do Índice Obrigatório, Estrutura de Pastas de um Mundo]
---

# Índice — Sistema de Relatório de Devoluções

Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por contexto/área. Atualizado junto da autorização de escrita de cada nota (ver [[Regra do Índice Obrigatório]]).

Mundo criado em 01/09/2026 — projeto novo, completamente paralelo aos demais mundos ativos.

## Decisoes

Nível do mundo, não de contexto — decisão de arquitetura que atravessa mais de 1 contexto de negócio, mesma lógica de `Checkpoints`/`Conceitos`/`Tutoriais` (ver [[Estrutura de Pastas de um Mundo]]).

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]] | decisao | em_andamento | 05/09/2026 | 2 bancos MySQL, driver `mysqlclient` e troca de empresa/alias samvale — todos validados de ponta a ponta. Falta só operação: setup na máquina de produção (barracão). |
| [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]] | decisao | concluida | 06/09/2026 | Organização de arquivos, template base (`{% extends %}`, sidebar+toolbar) e tela home implementados e validados nas 3 telas reais, espelhando o Sistema Interno V2. |

## Checkpoints

Nível do mundo, não de contexto — checkpoint que cobre o mundo inteiro (várias frentes ao mesmo tempo), mesma lógica de `Decisoes`/`Conceitos`/`Tutoriais` (ver [[Estrutura de Pastas de um Mundo]]).

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]] | checkpoint | em_andamento | 06/09/2026 | MySQL, multiempresa, reforma estrutural, CRUD de Marca/Grupo Fornecedor e listagem de Produtos agrupada validados de ponta a ponta. Falta: setup no PC de produção e pontos de melhoria do superior. |

## Produtos_e_Pecas

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]] | decisao | concluida | 04/09/2026 | Tela "Produtos" nova, edição de produto embutida no catálogo, navegação simples. Confirmado (04/09): as 3 telas são mobile-first + PC; só Catálogo teve tratamento mobile até agora. |
| [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]] | decisao | concluida | 06/09/2026 | Marca (nome único, grupo opcional) e Produto (marca obrigatória protegida, EAN único, SKU/Cód. Fabricante únicos só se preenchidos) — marca sempre selecionada em dropdown, nunca digitada. CRUD validado 100%. |
| [[Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado]] | bug_conhecido | corrigido | 06/09/2026 | Campo de marca em texto livre salvava produto com `marca=None` quando o texto não batia com nenhuma opção real, sem erro nenhum. Corrigido pelo dropdown obrigatório. |
| [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]] | decisao | concluida | 06/09/2026 | Tela Produtos agrupada por Marca/Grupo, com busca ao vivo (sem acento, tokenizada por palavra) e carrossel horizontal na linha de produtos. Validada de ponta a ponta pelo usuário. |
| [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]] | bug_conhecido | corrigido | 06/09/2026 | Busca comparava a frase inteira digitada contra o texto combinado do produto — "brudden 9121" não batia por causa da ordem fixa dos campos. Corrigido tokenizando por palavra, com AND entre elas. |
| [[Checkpoint - Catálogo de Peças e Tela de Produtos]] | checkpoint | em_andamento | 06/09/2026 | Catálogo de peças, telas de Produtos/Catálogo, CRUD de Marca/Grupo Fornecedor e listagem de Produtos agrupada implementados e validados. Falta: auditoria mobile-first de Produtos, editar peça. |
| [[Checkpoint - Repensando o Catalogo de Pecas (Peca Independente de Produto)]] | checkpoint | em_andamento | 07/09/2026 | Idealização em andamento (nenhum código gerado) pra repensar o Catálogo de peças — peça vira entidade independente do produto, ligada por vínculo próprio com quantidade por par produto-peça. Nada confirmado como completo ainda. |

## Relatorio_de_Devolucao

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]] | conceito | ativa | 01/09/2026 | Todo produto devolvido segue 1 de 3 caminhos conforme a condição física: venda comum, venda como usado, ou troca (reservado, fora de venda). |
| [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]] | decisao | em_andamento | 04/09/2026 | Nova Devolução busca produto/peças reais e gera PDF via xhtml2pdf. Reaberto (04/09): devoluções vão ser persistidas — schema, fluxo GET→POST e o que fica salvo ainda não desenhados. |
| [[Checkpoint - Tela de Nova Devolução e Geração do PDF]] | checkpoint | em_andamento | 05/09/2026 | Tela Nova Devolução e PDF validados como rascunho. **Pausado em 05/09/2026** — foco na reforma estrutural. Falta: schema de persistência, GET→POST, auditoria mobile-first. |

## Arquitetura_de_Entrega

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]] | decisao | concluida | 01/09/2026 | App entregue como .exe (PyInstaller onedir+noconsole), tela HTML de carregamento instantânea e ícone de bandeja (pystray) — validado ponta a ponta. |
| [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]] | tutorial | ativa | 05/09/2026 | Passo a passo pra testar em dev (`runserver` vs `python launcher.py`) e gerando o `.exe` (`gerar_exe`); banco e mídia agora compartilhados entre dev e `.exe` (mesmo `.env`, sem distinção de ambiente). |
| [[Checkpoint - Empacotamento e Entrega do .exe]] | checkpoint | em_andamento | 05/09/2026 | Arquitetura de entrega fechada e validada de ponta a ponta, incluindo `mysqlclient` e caminho de dados fixo. Falta só o atalho do Windows. |
| [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]] | descoberta | ativa | 05/09/2026 | `reportlab.graphics.barcode` e `django.core.management.commands` usam import dinâmico por string — PyInstaller não detecta sozinho, precisou flag explícita; migração do Django não era chamada pelo `launcher.py`, banco novo ficava sem tabela. |
| [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]] | descoberta | ativa | 05/09/2026 | `--collect-submodules=core` não funcionava pra módulo só referenciado por string única (`MIDDLEWARE`/`DATABASE_ROUTERS`) — a flag certa nesse caso é `--hidden-import` no módulo exato; `--collect-submodules` serve pra pacote tipo plugin. |
| [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]] | descoberta | ativa | 05/09/2026 | `BASE_DIR` aponta pra pasta recriada a cada build dentro do `.exe` — 1ª correção (`%APPDATA%` condicional por `sys.frozen`) funcionou mas o usuário rejeitou o resultado; solução final: caminho fixo via variável `DADOS_DIR` no `.env`, igual em qualquer ambiente. |
| [[core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]] | descoberta | ativa | 06/09/2026 | `core` era pasta de settings do Django *e* app compartilhado ao mesmo tempo (`startproject core`) — travava separar o `urls.py` do app. Corrigido renomeando a pasta de settings pra `projeto_sistema_devolucao_mb_sv`. |

## Relacionado

- [[Regra do Índice Obrigatório]]
- [[Estrutura de Pastas de um Mundo]]
