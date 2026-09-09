---
tipo: regra
dominio:
status: ativa
criado: 01/09/2026
atualizado_em: 09/09/2026 12:00
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
| [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]] | checkpoint | em_andamento | 08/09/2026 | Objetivo original do mundo fechado: persistência real, conferência de peça mobile e relatório impresso implementados. Falta: setup no PC de produção, auditoria mobile-first de Nova Devolução e pontos de melhoria do superior. |

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
| [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]] | decisao | descartada | 08/09/2026 | Rascunho original (02/09) com `xhtml2pdf` e persistência reaberta em 04/09 — biblioteca `xhtml2pdf` abandonada em 08/09/2026, substituída por view de impressão do navegador. |
| [[Checkpoint - Tela de Nova Devolução e Geração do PDF]] | checkpoint | concluido | 08/09/2026 | Registro histórico da fase de rascunho (01-05/09). Todos os itens em aberto (schema, GET→POST, versão final) resolvidos na retomada de 07-08/09. |
| [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]] | checkpoint | concluido | 08/09/2026 | Fluxo de UX (2 fases, PC + celular) e campos idealizados em 07/09, implementados por completo em 08/09: persistência real, conferência de peça mobile, relatório impresso. |
| [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]] | decisao | concluida | 08/09/2026 | Layout de 1 página fechado (07/09) e implementado (08/09), com 2 rodadas extras: 5 campos que faltavam (venda, motivo, mediação) e 4 melhorias de impressão (paginação, tags CLIENTE/INTERNO, datas, centralização). |
| [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]] | decisao | concluida | 08/09/2026 | `xhtml2pdf` abandonado (não suporta o CSS moderno do layout aprovado) — relatório vira view Django comum com CSS de impressão, PDF gerado pelo próprio navegador (Ctrl+P). |
| [[Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição]] | bug_conhecido | corrigido | 08/09/2026 | `TIME_ZONE` em UTC desde o início do projeto, sem conversão de exibição — afetava o "gerado em" do relatório e o "criada em" de devoluções pendentes. Corrigido pra `America/Sao_Paulo`. |
| [[Form Aninhado Quebrava Layout e Botão Salvar na Tela de Conferência]] | bug_conhecido | corrigido | 08/09/2026 | `<form>` do botão de excluir foto aninhado dentro do form principal (inválido em HTML5) — navegador fechava o form principal cedo demais, quebrando layout e botão Salvar. Corrigido com `formaction`/`formmethod`. |
| [[Colar Linha do ERP Adaptável a Nomes de Coluna Diferentes]] | decisao | concluida | 09/09/2026 | Preenchimento automático do "Colar linha do ERP" por nome de coluna (nunca posição), com aliases por campo — resolve MAGAZINE (48 colunas) vs SAMVALE (50, nomes diferentes) sem travar quando um campo não bate. |
| [[Tab Apagado pelo trim() Desalinhava o Colar Linha do ERP]] | bug_conhecido | corrigido | 09/09/2026 | `trim()` apagava o Tab na borda da linha colada (coluna vazia no início/fim), desalinhando todos os valores. Corrigido trocando Tab por separador `\|SEP\|` antes de qualquer trim. |
| [[O .exe em Segundo Plano Disputava a Porta do runserver]] | bug_conhecido | corrigido | 09/09/2026 | `.exe` aberto em segundo plano competia pela porta com o `runserver`, fazendo correções corretas no código parecerem sem efeito nenhum. Descoberto pelo próprio usuário. |

## Arquitetura_de_Entrega

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]] | decisao | concluida | 01/09/2026 | App entregue como .exe (PyInstaller onedir+noconsole), tela HTML de carregamento instantânea e ícone de bandeja (pystray) — validado ponta a ponta. |
| [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]] | tutorial | ativa | 05/09/2026 | Passo a passo pra testar em dev (`runserver` vs `python launcher.py`) e gerando o `.exe` (`gerar_exe`); banco e mídia agora compartilhados entre dev e `.exe` (mesmo `.env`, sem distinção de ambiente). |
| [[Checkpoint - Empacotamento e Entrega do .exe]] | checkpoint | em_andamento | 09/09/2026 | Empacotamento fechado, incluindo abertura automática pelo IP da rede (acesso pelo celular). Falta reverter a tela de carregamento (hoje em diagnóstico) e criar o atalho do Windows. |
| [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]] | descoberta | ativa | 05/09/2026 | `reportlab.graphics.barcode` e `django.core.management.commands` usam import dinâmico por string — PyInstaller não detecta sozinho, precisou flag explícita; migração do Django não era chamada pelo `launcher.py`, banco novo ficava sem tabela. |
| [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]] | descoberta | ativa | 05/09/2026 | `--collect-submodules=core` não funcionava pra módulo só referenciado por string única (`MIDDLEWARE`/`DATABASE_ROUTERS`) — a flag certa nesse caso é `--hidden-import` no módulo exato; `--collect-submodules` serve pra pacote tipo plugin. |
| [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]] | descoberta | ativa | 05/09/2026 | `BASE_DIR` aponta pra pasta recriada a cada build dentro do `.exe` — 1ª correção (`%APPDATA%` condicional por `sys.frozen`) funcionou mas o usuário rejeitou o resultado; solução final: caminho fixo via variável `DADOS_DIR` no `.env`, igual em qualquer ambiente. |
| [[core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]] | descoberta | ativa | 06/09/2026 | `core` era pasta de settings do Django *e* app compartilhado ao mesmo tempo (`startproject core`) — travava separar o `urls.py` do app. Corrigido renomeando a pasta de settings pra `projeto_sistema_devolucao_mb_sv`. |
| [[2 Bugs na Abertura pelo IP da Rede — CWD do .env e Query String em URL Local]] | descoberta | ativa | 09/09/2026 | `.exe` sempre abria em `127.0.0.1`, mesmo com `IPV4_LOCAL` certo no `.env` — 2 bugs empilhados: `.env` não encontrado por depender do CWD do processo, e query string descartada numa URL `file://`. Corrigido: caminho do `.env` via `sys.executable`, dado embutido direto no HTML (sem query string). Confirmado funcionando pelo celular. |

## Relacionado

- [[Regra do Índice Obrigatório]]
- [[Estrutura de Pastas de um Mundo]]
