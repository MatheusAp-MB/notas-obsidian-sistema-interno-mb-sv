---
tipo: regra
dominio:
status: ativa
criado: 15/08/2026
atualizado_em: 15/08/2026 20:05
relacionado: [Reducao de Comandos de Management e Rotina Vira Botao, Padrao de Qualidade e Clareza Estrutural do Repositorio, Redesenho do Popular Banco - Fontes de Dados e Escopo, Orquestracao da Sincronizacao de Impostos de Entrada via XML, Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]
---

# Guia de Setup — Do Zero ao Primeiro Imposto Sincronizado

## Contexto

Motivado pelo onboarding real de Cauã (e Lucas) na segunda-feira — mesmo gatilho de [[Padrao de Qualidade e Clareza Estrutural do Repositorio]] e [[Reducao de Comandos de Management e Rotina Vira Botao]]. Passo a passo do zero absoluto (máquina nova, banco vazio) até o estado "produtos do ERP importados + impostos de entrada do Sysemp sincronizados" — o mesmo caminho que Matheus percorreu e validou em 15/08/2026.

## Pré-requisitos (instalar antes de qualquer passo)

| Software | Versão | Por quê |
|---|---|---|
| Python | 3.12 a 3.15 | Exigido em `pyproject.toml` (`requires-python`) |
| Poetry | qualquer versão recente | Gerenciador de dependência do projeto — não usa `pip install -r requirements.txt` |
| MySQL Server | rodando localmente, acessível | Banco real do projeto (`settings.py` usa `django.db.backends.mysql`) |
| Git | qualquer versão | Clonar o repositório |

## Passo 1 — Clonar o repositório

```
git clone https://github.com/MatheusAp-MB/Projeto_Sistema_Interno_V2
cd Projeto_Sistema_Interno_V2
git checkout dev
```

A branch de trabalho é sempre `dev` — nunca desenvolver direto em `main`/`master`.

## Passo 2 — Instalar as dependências

```
poetry install
```

Lê `pyproject.toml`/`poetry.lock` e monta um ambiente virtual próprio com todas as bibliotecas do projeto (Django, pandas, openpyxl, mysqlclient, rich, etc.). Não precisa criar/ativar `venv` manualmente — o Poetry cuida disso. Todo comando depois deste passo roda prefixado com `poetry run` (ou dentro de `poetry shell`).

## Passo 3 — Colocar o arquivo `.env`

O `.env` **nunca vem do git** — está no `.gitignore` de propósito, porque carrega segredo real (senha de banco, token de API). Matheus envia esse arquivo por chat; salva na raiz do projeto, no mesmo nível do `manage.py`.

Variáveis que o arquivo contém (nomes, não os valores — os valores reais só existem no `.env` que Matheus te mandar):

| Variável | Pra que serve |
|---|---|
| `SECRET_KEY` | Chave interna do Django (segurança de sessão/CSRF) |
| `DEBUG` | `True` só em desenvolvimento, nunca em produção |
| `ALLOWED_HOSTS` | Hosts que o Django aceita servir (padrão: `127.0.0.1,localhost`) |
| `AGENTE_TOKEN` | Autentica o agente local (`agente_local/`) contra a API do Django |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` | Credenciais do MySQL |
| `GOOGLE_DRIVE_CREDENCIAIS_JSON` / `GOOGLE_DRIVE_PASTA_RAIZ_ID` | Acesso ao Google Drive (Agenda de Vídeos) |
| Token(s) de API do Sysemp / Mercado Livre | Nome exato conforme o `.env` que você recebeu |

## Passo 4 — Criar o banco de dados MySQL

```sql
CREATE DATABASE <valor de DB_NAME no seu .env> CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

O projeto usa `utf8mb4` de propósito (suporte completo a acento e caractere especial do português, ver comentário em `settings.py`) — nunca criar com `utf8` puro.

## Passo 5 — Rodar as migrações

```
poetry run python manage.py migrate
```

Cria todas as tabelas do banco a partir do histórico de migrations de cada app. Precisa rodar antes de qualquer comando que grave dado (todos os passos seguintes dependem disso).

## Passo 6 (opcional, recomendado) — Criar um usuário admin

```
poetry run python manage.py createsuperuser
```

Permite logar em `/admin/` e inspecionar/editar dado direto pela interface do Django — útil pra conferir visualmente se cada passo abaixo gravou o que devia, sem precisar abrir o MySQL na mão.

## Passo 7 — Seed inicial (dado fixo do sistema)

```
poetry run python manage.py iniciar_banco
```

Não depende de nenhum arquivo externo — só popula dado fixo: marketplaces, critérios de qualidade, configuração operacional, configuração do Mercado Livre, tabela de comissão Shopee/TikTok, taxa de kg adicional Amazon, régua de fases da Agenda de Vídeos. Roda 1 única vez por banco (setup, não rotina).

## Passo 8 — Conseguir os 6 arquivos externos

Nenhum desses arquivos vem do `git clone` — as 2 pastas onde eles moram são propositalmente ignoradas pelo git (dado real de negócio nunca é versionado). Receba os 6 arquivos de Matheus (chat, Drive, etc.) e salve exatamente nos caminhos abaixo, com o nome exatamente como está escrito — o código busca por nome de arquivo fixo, não por "qualquer .xlsx que estiver na pasta".

### Grupo A — Cadastro de Produtos do ERP (2 arquivos, dado que muda com frequência)

Pasta: `Arquivos usados para Popular Banco/Produtos ERP/`

- `Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_MB.xlsx`
- `Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_MB.xlsx`

Vêm da tela "Cadastro de Produtos" do Sysemp, exportados 1x pra cada status (Ativo/Inativo). O sistema lê a coluna `Inativo` de cada linha (`T`=inativo, `F`=ativo) pra decidir o status real do produto — o nome do arquivo em si é só organização, quem manda é a coluna.

Colunas que o código espera encontrar (nomes exatos, confirmados em `importar_produtos_erp.py`):

`Codigo Auxiliar`, `Codigo de Barras`, `Detalhes do Produto`, `Codigo do Fabricante`, `Categoria`, `Marca` (aparece 2x na planilha — nome legível e ID numérico interno; o sistema já distingue sozinho pelo tipo do valor), `ncm`, `Estoque`, `Custo`, `Inativo`, `Altura`, `Largura`, `Comprimento`, `Peso Bruto`, `Embalagem Altura`, `Embalagem Largura`, `Embalagem Comprimento`, `Emablagem Peso` (sim, com esse erro de digitação — é assim que vem do ERP de verdade, não corrigir manualmente), `URL 1`, `Ultima Compra`, `dt_cadastro`.

**Se um desses 2 arquivos faltar:** `popular_banco` quebra com erro de arquivo não encontrado — esta etapa não tem proteção hoje (diferente do Grupo B abaixo). Linha sem `Codigo de Barras` é descartada (contada no relatório final, nunca ignorada silenciosamente).

### Grupo B — Tabelas de Frete (4 arquivos, referência manual, muda raramente)

Pasta: `Arquivos_de_Importação/`

| Arquivo | Estrutura |
|---|---|
| `Tabela_Frete_ML.xlsx` | Matriz peso × faixa de preço (29 linhas × 8 colunas de preço; peso mín/máx nas colunas 10/11) |
| `Tabela_Frete_Magalu.xlsx` | Peso × faixa de reputação. A=label (ignorada), B=`<92%`, C=`92-97%`, D=`>97%`, E=peso mínimo (sempre preenchido, inclusive na última faixa), F=peso máximo (vazio de verdade na última faixa, sem teto) |
| `Tabela_Frete_TikTok.xlsx` | Peso × valor único, sem faixa de reputação. A=label, B=valor médio, C=peso mínimo, D=peso máximo |
| `Tabela_Frete_Amazon.xlsx` | 2 abas nomeadas exatamente `Frete Amazon_DBA` e `Frete Amazon_FBA` (o tipo vem do NOME DA ABA, não de coluna). Colunas: A=peso mínimo, B=peso máximo, C=preço mínimo, D=preço máximo, E=valor |

Essas 4 são planilhas mantidas manualmente (não são exportação de tela do Sysemp) — normalmente já existem de uma vez anterior, só precisam ser repassadas.

**Se um desses 4 faltar:** `popular_banco` **não quebra** — o código já verifica se o arquivo existe antes de tentar ler; se não existir, só imprime `[FRETE <X>] Arquivo ... não encontrado — pulando essa etapa` e segue pras próximas. Diferença real e importante em relação ao Grupo A.

## Passo 9 — Popular o banco com dado real

```
poetry run python manage.py popular_banco
```

Roda em sequência: Produtos ERP → Indicadores da Agenda de Vídeos → 4 tabelas de frete → organizar/comparar dimensão de envio → 6 grades de precificação (ML, Magalu, Raia, Shopee, TikTok, Amazon) → recomendação final de precificação. Demora alguns minutos, dependendo do tamanho das planilhas. Gera log completo em `logs/popular_banco_<timestamp>.log`, além do que aparece no terminal.

Ao final, o terminal mostra quantos produtos foram criados/atualizados, quantas linhas sem EAN foram descartadas, e quantas dimensões de embalagem vieram fisicamente absurdas do ERP — isso é esperado (o sistema reporta pra corrigir na origem, nunca inventa ou corrige sozinho, ver [[Sistema Espelha Dado Bruto do ERP Mesmo Quando E Fisicamente Absurdo]]).

## Passo 10 — Sincronizar os impostos de entrada do Sysemp

```
poetry run python manage.py sincronizar_impostos_entrada
```

**Ordem importa — só rodar DEPOIS do Passo 9.** Impostos de entrada vinculam a um `Produto` já existente pelo EAN; se o banco de produtos ainda estiver vazio, quase tudo cai em "sem correspondência" à toa, gastando os minutos de busca na API sem necessidade real.

A 1ª execução sempre demora mais — busca o histórico completo desde 2020-05-01 (validado em produção: entre 4 e 8 minutos, dependendo da API do Sysemp). Não travou, é esperado. Sincronizações seguintes são incrementais (só a janela nova) e muito mais rápidas.

Ao final, o terminal mostra: produtos selecionados, sincronizados, sem correspondência, e com erro. Uma proporção relevante de "sem correspondência" é esperada hoje — ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]] pra entender por quê (hipótese em validação: item de uso/consumo do Sysemp, ex: combustível, que nunca vira Produto de catálogo).

## Estado final esperado

Banco criado e migrado, seed inicial populado, produtos do ERP importados, frete/dimensão/grade de precificação calculados, e impostos de entrada do Sysemp sincronizados. Sistema pronto pro uso normal (visualizar produto, conferir precificação, etc.).

## O que fica de fora deste guia (por decisão, não por esquecimento)

- **Anúncios do Mercado Livre** (JSON da API) — etapas desativadas em 15/08/2026 dentro do `popular_banco`, aguardando um comando próprio e dedicado pra API do ML (mesmo padrão já usado no Sysemp).
- **Automação de Postagem/Replicação** (Agenda de Vídeos, `agente_local/`) — escopo totalmente separado, com guia próprio quando for necessário.
- **Promoções / Qualidade / Competição de catálogo do ML** — mesma situação dos anúncios, aguardando o comando dedicado.

## Relacionado

- [[Reducao de Comandos de Management e Rotina Vira Botao]]
- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
