---
tipo: tutorial
dominio: 
status: ativa
criado: 17/08/2026
atualizado_em: 17/08/2026 01:30
relacionado: [Guia de Setup - Do Zero ao Primeiro Preco Calculado, Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, Redesenho do Popular Banco - Fontes de Dados e Escopo, Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido, Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica, Tela e Planilha de Resumo de Impostos de Entrada]
---

# Tutorial — Gerar o Relatório de Impostos de Entrada da Samvale (SV) em Banco Temporário

## Contexto — pra que serve e quando usar

Este tutorial gera o `.xlsx` de impostos de entrada pra **Samvale (SV)**, sem tocar no banco real da MB e sem precisar resolver a arquitetura permanente de múltiplas empresas (essa decisão maior continua adiada de propósito — ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]).

**A ideia central: é o mesmo processo já validado da MB, rodando contra um banco temporário e descartável, só apontado pros dados da SV.** Isso já foi testado de ponta a ponta uma vez (ver [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]]) — a única parte que faltou validar foi a sincronização fiscal, por falta do token na hora.

> [!info] Se está retomando de outro computador
> O banco temporário (`sistema_interno_sv_temp`) é local — não existe em outra máquina até você criar de novo. Se está num PC diferente de onde parou, comece do Passo 1. Leve com você os 2 arquivos ERP da SV **já com cabeçalho corrigido** (Passo 4) — evita ter que corrigir de novo.

## Pré-requisitos

| Item | Detalhe |
|---|---|
| Repositório | Clonado, na branch `dev`, dependências instaladas (`poetry install`) — ver [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]] se for máquina nova |
| MySQL Server | Rodando localmente |
| Os 2 arquivos ERP da SV | `Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_SV.xlsx` e `..._Inativos_...xlsx`, dentro de `Arquivos usados para Popular Banco/Produtos ERP/` |
| Token da SV | `SV_SYSEMP_API_TOKEN` — **confira o nome exato dentro do seu `.env` real antes de rodar**, não confie de memória |

> [!danger] Nunca cole o valor do token no chat
> Use o valor direto no seu terminal (Passo 7). Se for pedir ajuda sobre esse passo, descreva o problema, não copie o token pra conversa.

## Passo 1 — Criar o banco temporário

```sql
CREATE DATABASE sistema_interno_sv_temp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Passo 2 — Criar o schema (tabelas vazias)

```bash
DB_NAME=sistema_interno_sv_temp poetry run python manage.py migrate
```

## Passo 3 — Popular a semente fixa (marketplaces, faixas, configuração)

```bash
DB_NAME=sistema_interno_sv_temp poetry run python manage.py iniciar_banco
```

## Passo 4 — Garantir que os 2 arquivos da SV têm cabeçalho corrigido

O ERP da SV usa nomes de coluna diferentes da MB (ex: `Código Auxiliar` em vez de `Codigo Auxiliar`, `inativo` minúsculo em vez de `Inativo`, `Produto` em vez de `Detalhes do Produto`). **Se os 2 arquivos que você tem em mãos já passaram por essa correção, pule pro Passo 5.** Se não, salve o script abaixo como `teste.py` na raiz do repositório e rode `poetry run python teste.py`:

```python
# teste.py — script de uso único.
#
# Corrige os cabeçalhos das 2 planilhas de produto ERP da Samvale (SV) pra
# baterem exatamente com o que o importador real do projeto
# (importar_produtos_erp.py) espera — esse código lê cada coluna pelo nome
# EXATO (acento e maiúscula/minúscula importam), sem nenhuma tolerância.
#
# Rode 1 vez, antes do Passo 5 (popular_banco) deste tutorial.
# Depois de confirmar que deu certo, pode apagar este arquivo — ele não faz
# parte do projeto, é só uma ferramenta descartável.
#
# Uso: poetry run python teste.py   (rodar na raiz do repositório)

import shutil
from pathlib import Path

import openpyxl

# --- 1. Ajuste os 2 caminhos abaixo se o nome real do arquivo for diferente
ARQUIVOS = [
    Path('Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'),
    Path('Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'),
]

# --- 2. Mapa de renomeação: nome real na SV -> nome que o código exige -----
RENOMEAR = {
    'Código Auxiliar': 'Codigo Auxiliar',
    'Código de Barras': 'Codigo de Barras',
    'Código Fabricante': 'Codigo do Fabricante',
    'Custo Samvale': 'Custo',
    'altura': 'Altura',
    'largura': 'Largura',
    'comprimento': 'Comprimento',
    'peso_bruto': 'Peso Bruto',
    'inativo': 'Inativo',
    'Produto': 'Detalhes do Produto',  # já confirmado com amostra real em 17/08/2026
}

# --- 3. Colunas que precisam de conferência visual (ambíguas ou sensíveis) -
COLUNAS_PARA_AMOSTRAR = ['Produto', 'Detalhe do produto', 'inativo']


def fazer_backup(caminho):
    backup = caminho.with_name(caminho.stem + '_BACKUP_ANTES_DO_RENAME' + caminho.suffix)
    if not backup.exists():
        shutil.copy2(caminho, backup)
        print(f'  Backup criado: {backup.name}')
    else:
        print(f'  Backup já existia, não sobrescrito: {backup.name}')


def processar_arquivo(caminho):
    print(f'\n{"=" * 70}')
    print(f'Arquivo: {caminho.name}')
    print(f'{"=" * 70}')

    if not caminho.exists():
        print('  [ERRO] Arquivo não encontrado nesse caminho. Pulando.')
        print(f'         Caminho tentado: {caminho.resolve()}')
        return

    fazer_backup(caminho)

    wb = openpyxl.load_workbook(caminho)
    aba = wb.active

    cabecalho = [celula.value for celula in aba[1]]
    print(f'  Colunas encontradas: {len(cabecalho)}')

    for nome_coluna in COLUNAS_PARA_AMOSTRAR:
        if nome_coluna in cabecalho:
            idx = cabecalho.index(nome_coluna) + 1
            amostras = [aba.cell(row=linha, column=idx).value for linha in range(2, 7)]
            print(f'  [AMOSTRA] Coluna "{nome_coluna}" (5 primeiras linhas de dado): {amostras}')

    renomeados = []
    for coluna_idx, valor in enumerate(cabecalho, start=1):
        if valor in RENOMEAR:
            novo_nome = RENOMEAR[valor]
            aba.cell(row=1, column=coluna_idx).value = novo_nome
            renomeados.append(f'{valor!r} -> {novo_nome!r}')

    if renomeados:
        print('  Renomeado:')
        for linha in renomeados:
            print(f'    - {linha}')
    else:
        print('  Nenhuma coluna do mapa foi encontrada (já renomeado antes?).')

    wb.save(caminho)
    print('  Salvo.')


if __name__ == '__main__':
    for arquivo in ARQUIVOS:
        processar_arquivo(arquivo)

    print(f'\n{"=" * 70}')
    print('CONFIRA ANTES DE RODAR O popular_banco:')
    print('  1) A coluna que virou "Detalhes do Produto" tem nome completo')
    print('     e descritivo do produto? (Já confirmado 1x, 17/08/2026.)')
    print('  2) A coluna "Inativo": "F" no arquivo de Ativos, "T" no de')
    print('     Inativos? (Já confirmado 1x, 17/08/2026.)')
    print(f'{"=" * 70}')
```

> [!success] Já validado 1x com dado real (17/08/2026)
> `Produto` → nome completo do item (ex: "AP PRESSAO MANUAL INFANTIL COM ESTETO") — mapeamento certo, não é a descrição de marketing longa (`Detalhe do produto`). `inativo`: `F` em 100% das linhas do arquivo de Ativos, `T` em 100% das linhas do arquivo de Inativos — mesma convenção da MB. Se o arquivo que você receber no futuro vier de um export diferente do ERP, vale reconferir a amostra impressa no terminal antes de seguir.

## Passo 5 — Ativar os caminhos da SV (comentar MB, descomentar SV)

Abra `core/management/commands/popular_banco_suporte/importar_produtos_erp.py`. Deixe as 2 constantes assim — bloco da MB comentado, bloco da SV ativo:

```python
#* MAGAZINE
# CAMINHO_ERP_ATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_MB.xlsx'
# CAMINHO_ERP_INATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_MB.xlsx'

## SAMVALE
CAMINHO_ERP_ATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'
CAMINHO_ERP_INATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'
```

Salve o arquivo. **Os 2 blocos (MB e SV) ficam sempre os dois no arquivo, um comentado e um ativo** — trocar de empresa vira só comentar/descomentar, sem nunca precisar digitar caminho de novo. Volta pro estado MB no Passo 9, ao final.

## Passo 6 — Importar produto + frete

```bash
DB_NAME=sistema_interno_sv_temp poetry run python manage.py popular_banco
```

Confira: `[PRODUTOS ERP]` deve mostrar "Criados: X" com X > 0 e 0 (ou poucos) erro de dimensão. As 4 etapas de frete devem concluir sem "não encontrado". As 6 grades de precificação vão mostrar "sem cálculo possível" pra quase tudo — **esperado, e irrelevante pro relatório de impostos de entrada.**

## Passo 7 — Sincronizar o imposto de entrada, com o token da SV

Abra seu `.env` real, confirme o nome exato da variável do token da SV, copie o valor (não cole aqui no vault nem em nenhum chat):

```bash
DB_NAME=sistema_interno_sv_temp MB_SYSEMP_API_TOKEN="<cole aqui o valor do token da SV>" poetry run python manage.py sincronizar_impostos_entrada
```

> [!info] Por que a variável se chama `MB_SYSEMP_API_TOKEN` mesmo sendo o token da SV
> O código (`api_sysemp/__init__.py`) só sabe ler a variável `MB_SYSEMP_API_TOKEN` — não tem suporte a escolher entre MB/SV (ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]], decisão explícita de não resolver isso agora). O truque é sobrescrever essa variável só pra este 1 comando, com o valor do token da SV — o nome da variável não muda, só o valor, e só nesse processo.

Como é a 1ª sincronização desse banco, ele busca desde 01/05/2020 — pode levar alguns minutos. No final, confira "Produtos sincronizados" — precisa ser um número bem maior que 0.

## Passo 8 — Ver e exportar pela tela (runserver)

Esse banco é novo — ainda não tem nenhum usuário cadastrado. Se ainda não existir usuário aqui, crie 1:

```bash
DB_NAME=sistema_interno_sv_temp poetry run python manage.py createsuperuser
```

Suba o servidor apontado pro banco da SV:

```bash
DB_NAME=sistema_interno_sv_temp poetry run python manage.py runserver
```

> [!tip] Se quiser manter a MB aberta ao mesmo tempo
> Roda numa porta diferente: `DB_NAME=sistema_interno_sv_temp poetry run python manage.py runserver 8001` — assim os 2 servidores rodam em paralelo sem conflito.

Abra o navegador em `localhost:8000` (ou `:8001`, se usou porta diferente), faça login, vá na tela "Resumo de Impostos de Entrada" (ver [[Tela e Planilha de Resumo de Impostos de Entrada]]) e clique em **Exportar**. É a mesma tela/botão já validado pra MB — mesmo resultado, só que lendo do banco da SV.

## Passo 9 — Voltar os caminhos pra MB (comentar SV, descomentar MB)

Depois de exportar, deixe o arquivo de volta assim, pronto pro uso normal do dia a dia (MB ativo):

```python
## MAGAZINE
CAMINHO_ERP_ATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_MB.xlsx'
CAMINHO_ERP_INATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_MB.xlsx'

#* SAMVALE
# CAMINHO_ERP_ATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'
# CAMINHO_ERP_INATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'
```

Salve o arquivo. Não precisa de `git checkout` — os 2 blocos continuam ali, só o comentário troca de lado.

## Conferência final antes de entregar

- Na tela, antes de exportar, confira que o total de produtos listados é compatível com o tanto que a SV realmente tem (não 0, não um número muito menor que o esperado).
- Abra o `.xlsx` exportado e confira 1 ou 2 produtos conhecidos manualmente — nome, custo e alíquota batem com o que você espera.
- O arquivo tem os mesmos 10 grupos/52 colunas coloridos do relatório da MB (mesma função gera os 2 — ver [[Tela e Planilha de Resumo de Impostos de Entrada]]).

## O que fica de fora deste tutorial (de propósito)

- **Peso cúbico**: a SV não tem coluna de dimensão de embalagem no ERP — todo produto SV fica sem peso cúbico. Não afeta este relatório (ele não usa esse campo).
- **Arquitetura permanente de múltiplas empresas**: este tutorial usa banco temporário de propósito, exatamente pra não precisar dessa decisão maior agora — ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]].
- **Apagar o banco temporário depois**: não é urgente, pode ficar — é só rodar de novo quando precisar de um relatório novo da SV.

## Relacionado

- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
- [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]]
- [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]]
- [[Tela e Planilha de Resumo de Impostos de Entrada]]
