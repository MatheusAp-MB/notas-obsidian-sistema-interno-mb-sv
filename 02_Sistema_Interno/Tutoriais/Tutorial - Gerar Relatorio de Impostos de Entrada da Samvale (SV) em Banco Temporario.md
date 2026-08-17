---
tipo: tutorial
dominio: 
status: ativa
criado: 17/08/2026
atualizado_em: 17/08/2026 16:45
relacionado: [Guia de Setup - Do Zero ao Primeiro Preco Calculado, Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, Redesenho do Popular Banco - Fontes de Dados e Escopo, Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido, Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica, Tela e Planilha de Resumo de Impostos de Entrada, Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]
---

# Tutorial — Gerar o Relatório de Impostos de Entrada da Samvale (SV) em Banco Temporário

## Contexto — pra que serve e quando usar

Este tutorial gera o `.xlsx` de impostos de entrada pra **Samvale (SV)**, sem tocar no banco real da MB e sem precisar resolver a arquitetura permanente de múltiplas empresas (essa decisão maior continua adiada de propósito — ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]).

**A ideia central: é o mesmo processo já validado da MB, rodando contra um banco temporário e descartável, só apontado pros dados da SV.** Já foi testado de ponta a ponta com sucesso, incluindo a sincronização fiscal (ver [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]] e [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]]).

> [!success] Atualização importante (17/08/2026, 16:45) — versão estabilizada, sem gambiarra
> Esta versão substitui a anterior (16:15). A versão de 16:15 tinha 2 problemas reais: (1) pedia pra editar `api_sysemp/core/cliente.py` na mão a cada uso (Passo 7 antigo) — isso foi eliminado, a URL da Sysemp agora é 100% resolvida por variável de ambiente, igual o token; (2) um bug real ficou pra trás no código (`URL_BASE_PADRAO` não existia na classe, causava `AttributeError` em qualquer chamada sem a variável de ambiente definida) — corrigido nesta versão. O tutorial agora tem 9 passos (não mais 10), e só 1 arquivo pra reverter no final (não mais 2).

> [!info] Se está retomando de outro computador
> O banco temporário (`sistema_interno_sv_temp`) é local — não existe em outra máquina até você criar de novo. Se está num PC diferente de onde parou, comece do Passo 1. Leve com você o arquivo ERP de Ativos da SV **já com cabeçalho corrigido** (Passo 4) — evita ter que corrigir de novo.

## Pré-requisitos

| Item | Detalhe |
|---|---|
| Repositório | Clonado, na branch `dev`, dependências instaladas (`poetry install`), com a correção de `api_sysemp/core/cliente.py` descrita no Passo 0 já aplicada — ver [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]] se for máquina nova |
| MySQL Server | Rodando localmente |
| O arquivo ERP de Ativos da SV | `Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_SV.xlsx`, dentro de `Arquivos usados para Popular Banco/Produtos ERP/`. **O arquivo de Inativos não é necessário hoje** — a leitura dele está desativada de propósito em `importar_produtos_erp.py` (decisão registrada no próprio código, 17/08/2026) |
| Token da SV | Confira o nome exato da variável no seu `.env` real antes de rodar, não confie de memória |
| URL da API Sysemp da SV | `https://api.sysemp.com.br/84` (a da MB é `https://api.sysemp.com.br/61` — só o número muda) |

> [!danger] Nunca cole o valor do token no chat
> Use o valor direto no seu terminal (Passo 7). Se for pedir ajuda sobre esse passo, descreva o problema, não copie o token pra conversa.

## Passo 0 — Confirmar que o código está na versão estável (fazer 1x só, não repete a cada geração de relatório)

Abra `api_sysemp/core/cliente.py`. A classe `ClienteApiSysemp` precisa estar assim — **sem nenhum toggle de comentário `MAGAZINE`/`SAMVALE` na URL**, só isto:

```python
class ClienteApiSysemp:
    URL_BASE_PADRAO = 'https://api.sysemp.com.br/61'

    def __init__(self, token, url_base=None, maximo_tentativas=MAXIMO_TENTATIVAS_PADRAO):
        if not token:
            raise ValueError('Token da API Sysemp não informado.')
        self._token = token
        self.URL_BASE = url_base or self.URL_BASE_PADRAO
        self._maximo_tentativas = maximo_tentativas
        self._espacador = EspacadorDeChamadas(intervalo_minimo_segundos=1.0)
```

Se em vez disso você ainda ver um bloco com `#* MAGAZINE` / `## SAMVALE` alternando o valor de `URL_BASE` (sem `_PADRAO`), **isso é a versão antiga, com um bug real**: o `__init__` procura por `self.URL_BASE_PADRAO`, que não existe nessa versão — qualquer chamada à API sem a variável de ambiente `MB_SYSEMP_API_URL_BASE` definida quebra na hora com `AttributeError`. Troque pro bloco acima antes de continuar. Detalhe completo do achado: [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]].

Depois desta correção, **nunca mais é preciso editar este arquivo pra trocar entre MB e SV** — a URL vira só mais uma variável de ambiente, junto do token (Passo 7).

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

## Passo 4 — Garantir que o arquivo de Ativos da SV tem cabeçalho corrigido

O ERP da SV usa nomes de coluna diferentes da MB (ex: `Código Auxiliar` em vez de `Codigo Auxiliar`, `inativo` minúsculo em vez de `Inativo`, `Produto` em vez de `Detalhes do Produto`). **Só o arquivo de Ativos precisa disso hoje** — o de Inativos está desativado (ver Pré-requisitos acima). **Se o arquivo que você tem em mãos já passou por essa correção, pule pro Passo 5.**

Se não, salve o script abaixo como `teste.py` na raiz do repositório e rode `poetry run python teste.py`:

```python
# teste.py — script de uso único.
#
# Corrige o cabeçalho da planilha de produtos Ativos da Samvale (SV) pra
# bater exatamente com o que o importador real do projeto
# (importar_produtos_erp.py) espera — esse código lê cada coluna pelo nome
# EXATO (acento e maiúscula/minúscula importam), sem nenhuma tolerância.
#
# O arquivo de Inativos NÃO entra aqui de propósito — a leitura dele está
# desativada em importar_produtos_erp.py (decisão registrada no código,
# 17/08/2026). Se um dia essa leitura for reativada, adicione o caminho do
# arquivo de Inativos de volta na lista ARQUIVOS abaixo.
#
# Rode 1 vez, antes do Passo 6 (popular_banco) deste tutorial.
# Depois de confirmar que deu certo, pode apagar este arquivo — ele não faz
# parte do projeto, é só uma ferramenta descartável.
#
# Uso: poetry run python teste.py   (rodar na raiz do repositório)

import shutil
from pathlib import Path

import openpyxl

# --- 1. Ajuste o caminho abaixo se o nome real do arquivo for diferente ----
ARQUIVOS = [
    Path('Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'),
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
    print('  2) A coluna "Inativo": "F" em praticamente todas as linhas do')
    print('     arquivo de Ativos? (Já confirmado 1x, 17/08/2026.)')
    print(f'{"=" * 70}')
```

> [!success] Já validado 1x com dado real (17/08/2026)
> `Produto` → nome completo do item (ex: "AP PRESSAO MANUAL INFANTIL COM ESTETO") — mapeamento certo, não é a descrição de marketing longa (`Detalhe do produto`). `inativo`: `F` em 100% das linhas do arquivo de Ativos. Se o arquivo que você receber no futuro vier de um export diferente do ERP, vale reconferir a amostra impressa no terminal antes de seguir.

## Passo 5 — Confirmar que os caminhos da SV estão ativos no importador

Abra `core/management/commands/popular_banco_suporte/importar_produtos_erp.py`. As 2 constantes precisam estar assim — bloco da MB comentado, bloco da SV ativo:

```python
#* MAGAZINE
# CAMINHO_ERP_ATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_MB.xlsx'
# CAMINHO_ERP_INATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_MB.xlsx'

## SAMVALE
CAMINHO_ERP_ATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'
CAMINHO_ERP_INATIVOS = 'Arquivos usados para Popular Banco/Produtos ERP/Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_SV.xlsx'
```

Se já estiver assim, pule pro Passo 6. Se não, ajuste e salve. **Os 2 blocos (MB e SV) ficam sempre os dois no arquivo, um comentado e um ativo** — trocar de empresa vira só comentar/descomentar. Volta pro estado MB no Passo 9, ao final.

> [!info] O caminho de Inativos continua na constante, mas não é lido
> `CAMINHO_ERP_INATIVOS` continua existindo como constante (não precisa apagar), mas `ImportadorProdutos.rodar_importacao_completa()` tem a chamada que lê esse arquivo comentada de propósito (`# self.processar_arquivo(self.caminho_erp_inativos)`) — decisão registrada no próprio código em 17/08/2026: o arquivo de Inativos não é útil agora. Não precisa existir em disco enquanto essa linha estiver comentada.

## Passo 6 — Importar produto + frete

```bash
DB_NAME=sistema_interno_sv_temp poetry run python manage.py popular_banco
```

Confira: `[PRODUTOS ERP] Criados: X` com X > 0 (só o arquivo de Ativos entra na contagem hoje) e 0 (ou poucos) erro de dimensão. As 4 etapas de frete devem concluir sem "não encontrado". As 6 grades de precificação vão mostrar "sem cálculo possível" pra quase tudo — **esperado, e irrelevante pro relatório de impostos de entrada.**

## Passo 7 — Sincronizar o imposto de entrada, com o token E a URL da SV

Abra seu `.env` real, confirme o nome exato da variável do token da SV, copie o valor (não cole aqui no vault nem em nenhum chat). Rode tudo numa linha só — token e URL juntos:

```bash
DB_NAME=sistema_interno_sv_temp MB_SYSEMP_API_TOKEN="<cole aqui o valor do token da SV>" MB_SYSEMP_API_URL_BASE="https://api.sysemp.com.br/84" poetry run python manage.py sincronizar_impostos_entrada
```

> [!info] Por que as variáveis se chamam `MB_SYSEMP_API_TOKEN`/`MB_SYSEMP_API_URL_BASE` mesmo sendo da SV
> O código (`api_sysemp/__init__.py`) só sabe ler essas 2 variáveis com esse nome — não tem suporte a escolher entre MB/SV por conta própria (ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]], decisão explícita de não resolver isso agora). O truque é sobrescrever as 2 só pra este 1 comando, com os valores da SV — o nome não muda, só o valor, e só nesse processo. Sem definir `MB_SYSEMP_API_URL_BASE`, cai automaticamente no valor padrão da MB (`URL_BASE_PADRAO`).

> [!warning] Se aparecer `KeyError: 'retorno'` ou `AttributeError` aqui
> Veja a seção "Resolução de Problemas" no final deste tutorial — o mais provável é o Passo 0 não ter sido aplicado, ou uma das 2 variáveis acima estar faltando/errada.

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

## Passo 9 — Voltar o importador pra MB (comentar SV, descomentar MB)

Com a versão estável (Passo 0), **só existe 1 arquivo pra reverter agora**, não mais 2 — a URL da Sysemp não precisa de reversão nenhuma, porque nunca fica fixa no código, é sempre resolvida na hora pela variável de ambiente do Passo 7.

Abra `core/management/commands/popular_banco_suporte/importar_produtos_erp.py` e deixe de volta assim, pronto pro uso normal do dia a dia (MB ativo):

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
- Confira o Passo 9 — o importador precisa estar de volta no estado MB.

## Resolução de Problemas — Sintomas Conhecidos

**Sintoma: `AttributeError` mencionando `URL_BASE_PADRAO` (em qualquer passo que chama a API Sysemp).**

O Passo 0 não foi aplicado — `api_sysemp/core/cliente.py` ainda está na versão antiga (com toggle manual `MAGAZINE`/`SAMVALE` na URL, sem `URL_BASE_PADRAO` na classe). Aplique o Passo 0 e rode de novo.

**Sintoma: `KeyError: 'retorno'` no Passo 7, com `{'status': False, 'message': 'Metodo não Localizado'}` aparecendo em algum lugar do erro ou do log.**

Não é permissão de conta na Sysemp, não é intermitência, não é bug de data/período. É praticamente sempre a URL base errada ou ausente. Confira, nesta ordem:
1. O Passo 0 foi aplicado? (sem ele, mesmo passando a variável de ambiente certa, pode haver comportamento inesperado se o arquivo ainda tiver o toggle manual conflitando.)
2. A variável `MB_SYSEMP_API_URL_BASE` foi mesmo incluída no comando do Passo 7, com o valor `https://api.sysemp.com.br/84`?
3. O token usado é realmente o da SV? Confira se `MB_SYSEMP_API_TOKEN` foi definido com o valor certo no MESMO comando/terminal — sem isso, cai no valor padrão do `.env` (o da MB), silenciosamente, sem nenhum aviso.

Relato completo desta investigação: [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]].

**Sintoma: depois de terminar este tutorial, o sistema normal da MB (fora deste tutorial) parece usar dado da SV, ou dá erro parecido.**

Confira o Passo 9 — o bloco `## MAGAZINE` precisa estar ativo em `importar_produtos_erp.py`. Se o Passo 0 foi aplicado corretamente, a URL da Sysemp não pode ser a causa (ela nunca fica fixa no código nessa versão) — o problema só pode estar nesse 1 arquivo.

## O que fica de fora deste tutorial (de propósito)

- **Peso cúbico**: a SV não tem coluna de dimensão de embalagem no ERP — todo produto SV fica sem peso cúbico. Não afeta este relatório (ele não usa esse campo).
- **Arquivo de Inativos da SV**: leitura desativada de propósito (decisão registrada em `importar_produtos_erp.py`, 17/08/2026). Se for reativada no futuro, este tutorial precisa ser atualizado (Passo 4 volta a incluir os 2 arquivos).
- **Arquitetura permanente de múltiplas empresas**: este tutorial usa banco temporário e 1 arquivo de edição manual (Passo 5/9) de propósito, exatamente pra não precisar dessa decisão maior agora — ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]].
- **Apagar o banco temporário depois**: não é urgente, pode ficar — é só rodar de novo quando precisar de um relatório novo da SV.

## Relacionado

- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
- [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]]
- [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]]
- [[Tela e Planilha de Resumo de Impostos de Entrada]]
- [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]]
