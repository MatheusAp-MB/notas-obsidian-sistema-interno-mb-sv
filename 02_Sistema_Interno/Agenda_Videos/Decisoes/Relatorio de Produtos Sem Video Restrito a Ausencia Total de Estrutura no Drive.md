---
tipo: decisao
dominio: python
status: ativa
criado: 25/08/2026
atualizado_em: 26/08/2026 08:40
relacionado: [Convencao de Nomenclatura de Arquivos no Drive, Badge de Aviso Para Arquivos Inconsistentes no Drive, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Perguntas Sempre em Texto Corrido, Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]
---

# Relatório de Produtos Sem Vídeo Restrito à Ausência Total de Estrutura no Drive

> **ATUALIZAÇÃO IMPORTANTE (26/08/2026, 08:40) — o critério descrito nesta nota (Pergunta 1-4 + "Sem Vídeo" em 2 casos) foi ABANDONADO no dia seguinte e substituído por um modelo mais simples (Plan 1/2/3), já validado com dado real e já rodando pra Magazine E Samvale.** Título e seções abaixo ficam como HISTÓRICO de como se chegou até aqui (os 2 bugs reais do `tem_video_real` continuam verdadeiros e relevantes) — mas não descrevem mais o que o script faz hoje. Pra ir direto no critério ATUAL, pule pra "Atualização 26/08/2026 — Pivô pra Plan 1/2/3 + multi-empresa" no fim desta nota.

## Contexto (por que esta nota existe)

Sessão de continuação (a conversa original tinha sido compactada — o resumo que chegou pra esta sessão só trazia o trecho final, sem o histórico completo de como o problema foi apontado). O usuário colou o trecho exato do critério `tem_video_real` de uma função `_classificar_produto()` e perguntou se o furo que ele mesmo enxergou (contar `Simples_Roteiro.txt` como vídeo) era o mesmo problema que já tinha sido apontado antes da compactação, ou se existia um 2º furo (vídeo dentro de `Videos/usados/`). Como o histórico anterior à compactação não estava disponível, a resposta não veio de memória — veio de reconstruir a função inteira lendo o transcript bruto da sessão (arquivo `.jsonl` do Claude Code) e testando a lógica de verdade contra cenários fabricados. **Os 2 eram bugs reais, independentes.**

Depois disso, o usuário pediu uma coisa diferente e mais simples: não uma correção do critério de "existe vídeo", mas um relatório SEPARADO — "produtos do banco que não possuem vídeo" — com uma definição deliberadamente mais restrita.

## O quê — o script `gerar_inventario_drive_magazine.py`

Script novo (mundo `02_Sistema_Interno`, arquivo `scripts_dev/gerar_inventario_drive_magazine.py`), que faz **1 única varredura do Drive** + **1 única consulta ao banco** e gera **6 planilhas `.xlsx`**:

| Planilha | Responde |
|---|---|
| `inventario_drive_magazine.xlsx` | Lista detalhada, arquivo por arquivo, com validação de Marca/EAN/Pasta Videos/Nome. |
| `produtos_1_video_correto_magazine.xlsx` | Pergunta 1 — Existe vídeo real no Drive, e a estrutura está correta. |
| `produtos_2_video_incorreto_magazine.xlsx` | Pergunta 2 — Existe vídeo real no Drive, mas algo na estrutura está incorreto. |
| `produtos_3_sem_video_estrutura_ok_magazine.xlsx` | Pergunta 3 — Não existe vídeo real no Drive; estrutura pronta e válida, só falta gerar o arquivo. |
| `produtos_4_sem_video_estrutura_invalida_magazine.xlsx` | Pergunta 4 — Não existe vídeo real no Drive, e a estrutura também está inválida. |
| **`produtos_sem_video_magazine.xlsx`** | **Nova nesta sessão** — "Sem Vídeo", critério simples e separado das 4 perguntas acima (ver seção própria abaixo). |

> [!danger] Nada disso foi commitado, pushado, nem executado contra o Drive/banco reais
> O script foi escrito e testado nesta sessão só na parte que **não depende de Django nem de rede** (o sandbox onde a sessão rodou não tinha Django instalado — ver seção "Como foi validado" abaixo). A parte que consulta o banco (`Produto.objects.filter(...)`) e a API do Drive (`obter_servico_drive()`) nunca foi executada de verdade. **Pendente: o usuário aplicar o arquivo no projeto real e rodar** com o comando abaixo, reportando o resultado (quantos produtos em cada planilha) de volta.
>
> ```bash
> python scripts_dev/gerar_inventario_drive_magazine.py
> ```

## Por quê — 2 bugs reais encontrados em `tem_video_real` (Pergunta 1-4)

O critério antigo de "existe vídeo", dentro de `_classificar_produto()`, era este:

```python
tem_video_real = any(
    item.nome != MARCADOR_PASTA_VAZIA and _eh_segmento_pasta_videos(_primeiro_segmento_do_caminho(item.local))
    for item in itens_do_produto
)
```

Traduzindo: "existe vídeo" = existe pelo menos **1 arquivo real qualquer** (não o marcador de pasta vazia) cujo **primeiro segmento do caminho** seja uma pasta chamada "Videos" (comparação sem diferenciar maiúscula/minúscula). Isso tinha 2 furos independentes, nenhum relacionado ao outro — cada um contava um caso que NÃO é vídeo de verdade como se fosse:

1. **Não olhava o TIPO do arquivo.** `Videos/Simples_Roteiro.txt` batia no critério (é um arquivo real, primeiro segmento é "Videos"), mas Roteiro é **só existência, nunca conteúdo** — é um script de texto, nunca o vídeo em si (regra já registrada em [[Convencao de Nomenclatura de Arquivos no Drive]]). Um produto com SÓ um Roteiro, e nenhum vídeo de fato, era classificado como "tem vídeo" — o oposto exato da realidade.
2. **Não olhava a PROFUNDIDADE do caminho.** `_primeiro_segmento_do_caminho('Videos/usados/algum_arquivo.mp4')` também devolve `'Videos'` (é só o texto antes da 1ª barra) — então um vídeo já usado/postado e arquivado em `Videos/usados/` (ver `agenda_videos/funcoes_auxiliares/drive/arquivador.py`, função `mover_para_usados()`) contava exatamente igual a um vídeo novo, disponível, sentado direto em `Videos/`.

### Exemplo concreto — 6 cenários testados, mostrando os 2 furos e a correção

> [!example] Árvore de Drive fabricada, testada com a lógica pura (sem Django)
> 6 EANs fictícios, cada um cobrindo 1 situação real diferente:

| EAN | Situação real | `tem_video_real` (critério ANTIGO) | `tem_video_real` (critério NOVO, corrigido) |
|---|---|---|---|
| 111 | `Videos/` só tem `Simples_Roteiro.txt` | `True` ❌ (errado — não tem vídeo nenhum) | `False` ✅ |
| 222 | vídeo real só em `Videos/usados/Simples_Completo.mp4` | `True` ❌ (errado — já foi usado, não está disponível) | `False` ✅ |
| 333 | vídeo real fresco, direto em `Videos/Simples_Completo.mp4` | `True` ✅ | `True` ✅ (sem mudança — continua certo) |
| 444 | pasta do EAN existe no Drive, mas 100% vazia (nem `Videos/` foi criada) | `False` ✅ | `False` ✅ (sem mudança) |
| 555 | EAN não existe em lugar nenhum do Drive | `False` ✅ | `False` ✅ (sem mudança) |
| 666 | `Videos/` foi criada mas está vazia (o EAN em si não está vazio) | `False` ✅ | `False` ✅ (sem mudança) |

Os EANs 111 e 222 são exatamente os 2 furos — o critério antigo dava `True` (tem vídeo) quando a resposta certa era `False`. Os outros 4 já estavam certos antes e continuam certos depois — a correção só aperta o critério, nunca solta ele.

### Correção aplicada

```python
# Função Objetivo: True só quando `local` é DIRETO dentro de "Videos" (não
# numa subpasta dela, como "Videos/usados/") — usado por `tem_video_real`
# pra não contar vídeo já usado/arquivado como vídeo disponível.
def _esta_diretamente_na_pasta_videos(local: str) -> bool:
    segmento = _primeiro_segmento_do_caminho(local)
    return _eh_segmento_pasta_videos(segmento) and local == f'{segmento}/'


# Função Objetivo: Devolve o TIPO real do arquivo ('base'/'roteiro'/
# 'completo'), ou None se o nome não bate em nenhum padrão válido — usado
# por `tem_video_real` pra exigir tipo vídeo (nunca roteiro), não só
# "qualquer nome reconhecido".
def _tipo_do_nome_de_arquivo(nome_arquivo: str) -> Optional[str]:
    match_simples = PADRAO_SIMPLES.match(nome_arquivo)
    if match_simples:
        tipo, extensao = _normalizar_tipo(match_simples.group(1).lower()), match_simples.group(2)
        return tipo if _extensao_valida(tipo, extensao) else None

    match_numerado = PADRAO_NUMERADO.match(nome_arquivo)
    if match_numerado:
        _, _, tipo, extensao = match_numerado.groups()
        tipo = _normalizar_tipo(tipo.lower())
        return tipo if _extensao_valida(tipo, extensao) else None

    return None


tem_video_real = any(
    item.nome != MARCADOR_PASTA_VAZIA
    and _esta_diretamente_na_pasta_videos(item.local)
    and _tipo_do_nome_de_arquivo(item.nome) in ('base', 'completo')
    for item in itens_do_produto
)
```

`_esta_diretamente_na_pasta_videos` corta o furo 2 (exige que `local` seja igual a `'Videos/'` inteiro, não só que comece por "Videos" — então `'Videos/usados/'` não bate mais). `_tipo_do_nome_de_arquivo(...) in ('base', 'completo')` corta o furo 1 (Roteiro tem tipo `'roteiro'`, nunca entra nessa lista).

## A decisão nova — "Sem Vídeo" é um relatório SEPARADO, com critério mais simples

Pra quê: depois de entender os 2 furos acima, o usuário pediu algo diferente — não queria mais "vídeo real, e correto?" (as 4 perguntas), queria uma pergunta bem mais direta: **quais produtos do banco não têm vídeo NENHUM porque a estrutura no Drive nem chegou a existir de verdade?**

> [!important] Decisão explícita do usuário (25/08/2026) — só 2 casos entram em "Sem Vídeo"
> 1. O EAN do produto **não foi encontrado em lugar nenhum do Drive**.
> 2. A pasta do EAN **foi encontrada, mas está 100% vazia** (nem a subpasta "Videos" foi criada).
>
> Qualquer produto que tenha **qualquer coisa** dentro da pasta do EAN — um Roteiro sozinho, um vídeo já usado em `usados/`, ou até a própria pasta "Videos" vazia enquanto o EAN não está vazio (cenário 666 da tabela acima) — **não entra em "Sem Vídeo"**. Esse produto já aparece classificado nas planilhas de Pergunta 1-4 (que respondem "tem vídeo real, e está correto?") — nas palavras do usuário: **"se tem arquivos dentro vai cair naquela outra lista 'Existe no drive, e está na estrutura correta' ou 'Existe no drive mas tem inconsistência'"**.

Isso é uma escolha deliberada de ESCOPO, não um bug — "Sem Vídeo" responde só "a estrutura existe de verdade?", nunca "o conteúdo dentro da estrutura está certo?" (essa segunda pergunta já tem dono: as 4 planilhas de Pergunta 1-4).

### Como foi implementado

```python
MOTIVO_NAO_ENCONTRADO_NO_DRIVE = 'Não encontrado no Drive'
MOTIVO_PASTA_DO_EAN_VAZIA = 'Pasta do EAN vazia no Drive'


# Função Objetivo: True quando a pasta do EAN existe no Drive mas está 100%
# vazia (nem "Videos" foi criada) — 1 dos 2 critérios da planilha "Sem
# Vídeo", e também usado por `_classificar_produto` (Pergunta 1-4) pra
# "estrutura pronta" contar mesmo sem nenhum arquivo ainda.
def _eh_ean_completamente_vazio(itens_do_produto: list) -> bool:
    return (
        len(itens_do_produto) == 1
        and itens_do_produto[0].local == MARCADOR_RAIZ_DO_EAN
        and itens_do_produto[0].nome == MARCADOR_PASTA_VAZIA
    )


# Função Objetivo: Devolve o motivo (string) se o produto entra na planilha
# "Sem Vídeo", ou None se ele tem QUALQUER estrutura no Drive (mesmo que
# essa estrutura não tenha vídeo real — isso é problema das outras
# planilhas, não desta).
def _motivo_produto_sem_video(ean_db: str, itens_por_ean: dict) -> Optional[str]:
    itens_do_produto = itens_por_ean.get(ean_db.strip(), [])
    if not itens_do_produto:
        return MOTIVO_NAO_ENCONTRADO_NO_DRIVE
    if _eh_ean_completamente_vazio(itens_do_produto):
        return MOTIVO_PASTA_DO_EAN_VAZIA
    return None
```

Reaproveitando a mesma tabela de cenários de cima: o EAN 444 (pasta do EAN 100% vazia) devolve `MOTIVO_PASTA_DO_EAN_VAZIA`; o EAN 555 (nunca encontrado) devolve `MOTIVO_NAO_ENCONTRADO_NO_DRIVE`; **todos os outros 4 EANs (111, 222, 333, 666) devolvem `None`** — mesmo o 111 (só Roteiro) e o 222 (só vídeo usado), que não têm vídeo real nenhum — porque eles TÊM estrutura, e por decisão de escopo isso não é problema desta planilha.

## Como foi validado (sem Django disponível no sandbox desta sessão)

A sessão rodou num ambiente sem Django instalado — não foi possível importar o projeto real nem rodar o script de ponta a ponta. A validação foi feita carregando só os 2 módulos puros do projeto que não dependem de Django (`agenda_videos/funcoes_auxiliares/drive/constantes.py` e `parser.py`, ambos só usam `re`/`dataclasses`/`typing`), reimplementando as funções de árvore/classificação num script Python isolado, e rodando contra a árvore fabricada da tabela acima. **Resultado: os 6 cenários bateram exatamente com o esperado** (tabela acima) — isso cobre a lógica de classificação, mas NÃO cobre a consulta real ao banco (`Produto.objects.filter(ativo_no_erp=True)`) nem a chamada real à API do Drive (`obter_servico_drive()`), que só podem ser confirmadas rodando o script de verdade no ambiente do projeto.

## Código completo do script (íntegro, pra não depender desta conversa)

```python
# scripts_dev/gerar_inventario_drive_magazine.py

# Função Objetivo: Gera, numa única execução (1 única varredura do Drive, 1
# única consulta ao banco): a planilha detalhada (por arquivo) + 4 planilhas
# de classificação por produto, respondendo as 4 perguntas de negócio, + 1
# planilha separada de "produtos sem vídeo":
#   1 -> Existe vídeo no Drive, e está tudo correto.
#   2 -> Existe vídeo no Drive, mas algo está incorreto.
#   3 -> Não existe vídeo no Drive; estrutura pronta e válida, só falta gerar.
#   4 -> Não existe vídeo no Drive, e a estrutura está inválida.
#   S -> "Sem vídeo" (lista separada, critério mais simples e mais restrito
#        que as 4 perguntas acima — ver explicação mais abaixo).
# Universo = todo produto ATIVO do banco da Magazine (não só o que a
# varredura achou) — um produto sem NENHUMA pasta no Drive também aparece,
# na Pergunta 3 e na planilha "S". Nada é filtrado da planilha detalhada —
# as planilhas de classificação são uma CLASSIFICAÇÃO em cima do mesmo dado,
# nunca uma exclusão dele. Só leitura — nunca grava nada no Drive nem no
# banco.
#
# * [EXPLICAÇÃO] → Casamento produto-do-banco x Drive é feito só pelo EAN
#                  (chave única, confirmado pelo usuário) — não importa
#                  embaixo de qual pasta de marca o EAN foi encontrado.
# * [EXPLICAÇÃO] → ASSUNÇÃO SEM CONFIRMAÇÃO EXPLÍCITA: quando o EAN nunca é
#                  encontrado em lugar nenhum do Drive, este script classifica
#                  como Pergunta 3 ("nada de errado, só falta trabalhar"), e
#                  NÃO como Pergunta 4. Se estiver errado, troca o `pergunta=3`
#                  pra `pergunta=4` no bloco "if not itens_do_produto" de
#                  `_classificar_produto()`, é a única linha que precisa mudar.
# * [EXPLICAÇÃO] → "Existe vídeo" (usado nas Perguntas 1-4) exige um ARQUIVO
#                  REAL, do TIPO vídeo (base ou completo — nunca roteiro, que
#                  é só existência, nunca conteúdo), direto dentro da pasta
#                  "Videos" (não em "Videos/usados/", que é vídeo já usado/
#                  arquivado, não disponível pra postar). Corrigido em
#                  25/08/2026 — antes contava QUALQUER arquivo real cujo
#                  1º segmento do caminho fosse "Videos", o que incluía por
#                  engano um `Simples_Roteiro.txt` sozinho (sem vídeo real
#                  nenhum) e qualquer arquivo dentro de "usados/" (já
#                  consumido, não deveria contar como vídeo disponível).
# * [EXPLICAÇÃO] → "Estrutura correta" (independente de ter vídeo ou não)
#                  exige: nome da pasta de marca válido no banco, nenhum
#                  arquivo/pasta solto fora do lugar esperado, EAN nunca
#                  duplicado em mais de 1 marca, e todo arquivo real com nome
#                  seguindo o padrão — E a pasta "Videos" precisa ter sido
#                  criada (mesmo vazia) pra contar como "estrutura pronta".
# * [EXPLICAÇÃO] → "Sem vídeo" (planilha "S", separada das Perguntas 1-4) é
#                  um critério DELIBERADAMENTE mais simples e mais restrito
#                  (decisão do usuário, 25/08/2026): só entra aqui o produto
#                  que (1) não foi encontrado em lugar nenhum do Drive, ou
#                  (2) tem a pasta do EAN encontrada mas totalmente vazia
#                  (nem "Videos" foi criada). Um produto com QUALQUER coisa
#                  dentro da pasta do EAN — mesmo que seja só um Roteiro, só
#                  arquivo já usado, ou "Videos" vazia mas o EAN não — NÃO
#                  entra em "S"; ele já aparece classificado nas planilhas de
#                  Pergunta 1-4 (que respondem "tem vídeo REAL, correto?").
#
# Como rodar (no ambiente real do projeto, com Drive e banco configurados):
#   python scripts_dev/gerar_inventario_drive_magazine.py

import os
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


def _adicionar_raiz_do_projeto_ao_path():
    caminho_atual = os.path.dirname(os.path.abspath(__file__))
    while caminho_atual != os.path.dirname(caminho_atual):
        if os.path.exists(os.path.join(caminho_atual, 'manage.py')):
            sys.path.insert(0, caminho_atual)
            return
        caminho_atual = os.path.dirname(caminho_atual)
    raise RuntimeError('Não foi possível encontrar manage.py subindo a partir deste script.')


_adicionar_raiz_do_projeto_ao_path()

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projeto_sistema_interno_mb_sv.settings')
django.setup()

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

from django.conf import settings
from core.empresa import EMPRESA_MAGAZINE, definir_empresa_ativa
from produtos.models import Produto
from agenda_videos.funcoes_auxiliares.drive.cliente import obter_servico_drive
from agenda_videos.funcoes_auxiliares.drive.constantes import MIME_PASTA, NOME_PASTA_VIDEOS
from agenda_videos.funcoes_auxiliares.drive.escaneador import _listar_tudo_paginado
from agenda_videos.funcoes_auxiliares.drive.parser import (
    EXTENSOES_VALIDAS_POR_TIPO, PADRAO_NUMERADO, PADRAO_SIMPLES, _extensao_valida, _normalizar_tipo,
)

COR_CABECALHO = '1E3A5F'
COR_AVISO = 'DCE6F1'
COR_VALIDO = 'C6EFCE'
COR_INVALIDO = 'FFC7CE'
COR_NAO_APLICAVEL = 'F2F2F2'

CABECALHO_DETALHE = [
    'Marca', 'EAN', 'Local', 'Nome do Arquivo',
    'Marca Válida', 'EAN Válido', 'Pasta Videos Válida', 'Nome Válido',
]
LARGURAS_DETALHE = [22, 22, 30, 45, 16, 14, 20, 14]
COLUNAS_DE_VALIDACAO_DETALHE = [5, 6, 7, 8]

CABECALHO_PRODUTO = ['Marca', 'EAN', 'Marca Válida', 'EAN Válido', 'Pasta Videos Válida', 'Nome Válido']
LARGURAS_PRODUTO = [22, 22, 14, 12, 20, 14]
COLUNAS_DE_VALIDACAO_PRODUTO = [3, 4, 5, 6]

CABECALHO_SEM_VIDEO = ['Marca', 'EAN', 'Motivo']
LARGURAS_SEM_VIDEO = [22, 22, 34]

MARCADOR_PASTA_VAZIA = '(pasta vazia)'
MARCADOR_RAIZ_DO_EAN = '(raiz do EAN)'
MARCADOR_RAIZ_DA_MARCA = '(raiz da marca)'
MARCADOR_RAIZ_DO_DRIVE = '(raiz do Drive)'
MARCADOR_FORA_DE_EAN = '(fora de qualquer EAN)'
MARCADOR_FORA_DE_MARCA = '(fora de qualquer marca)'
MARCADORES_DE_RAIZ = (MARCADOR_RAIZ_DO_EAN, MARCADOR_RAIZ_DA_MARCA, MARCADOR_RAIZ_DO_DRIVE)

MOTIVO_NAO_ENCONTRADO_NO_DRIVE = 'Não encontrado no Drive'
MOTIVO_PASTA_DO_EAN_VAZIA = 'Pasta do EAN vazia no Drive'


@dataclass(frozen=True)
class ItemEncontradoNoDrive:
    marca: str
    ean: str
    local: str
    nome: str


# Função Objetivo: Representa o resultado da classificação de 1 produto do
# banco nas 4 perguntas de negócio (Pergunta 1-4 — "tem vídeo real, e está
# correto?"). Não é usado pela planilha "Sem Vídeo" (critério mais simples,
# ver ProdutoSemVideo).
@dataclass(frozen=True)
class ClassificacaoProduto:
    marca: str
    ean: str
    existe_video: bool
    estrutura_correta: bool
    marca_valida: str
    ean_valido: str
    pasta_videos_valida: str
    nome_valido: str
    pergunta: int


# Função Objetivo: Representa 1 produto do banco que caiu na planilha "Sem
# Vídeo" — critério deliberadamente mais simples que as 4 perguntas acima
# (ver explicação no cabeçalho do arquivo).
@dataclass(frozen=True)
class ProdutoSemVideo:
    marca: str
    ean: str
    motivo: str


# ============================================================
# Helpers de planilha.
# ============================================================

def _estilizar_cabecalho(ws: Worksheet, linha: int, quantidade_colunas: int) -> None:
    for coluna in range(1, quantidade_colunas + 1):
        celula = ws.cell(row=linha, column=coluna)
        celula.font = Font(name='Arial', size=10, bold=True, color='FFFFFF')
        celula.fill = PatternFill('solid', fgColor=COR_CABECALHO)
        celula.alignment = Alignment(horizontal='center', vertical='center')
    ws.freeze_panes = f'A{linha + 1}'
    ws.auto_filter.ref = f'A{linha}:{get_column_letter(quantidade_colunas)}{linha}'
    ws.row_dimensions[linha].height = 22


def _ajustar_largura_colunas(ws: Worksheet, larguras: list) -> None:
    for coluna, largura in enumerate(larguras, start=1):
        ws.column_dimensions[get_column_letter(coluna)].width = largura


def _escrever_aviso(ws: Worksheet, quantidade_colunas: int, texto: str) -> None:
    celula = ws.cell(row=1, column=1, value=texto)
    celula.font = Font(name='Arial', size=9, italic=True, color='31859B')
    celula.fill = PatternFill('solid', fgColor=COR_AVISO)
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=quantidade_colunas)


def _sanitizar_nome_de_aba(nome_marca: str) -> str:
    nome_limpo = nome_marca
    for caractere_proibido in [':', '\\', '/', '?', '*', '[', ']']:
        nome_limpo = nome_limpo.replace(caractere_proibido, '-')
    return nome_limpo[:31]


def _cor_para_valor_validacao(valor: str) -> str:
    if valor == 'Sim':
        return COR_VALIDO
    if valor == 'Não':
        return COR_INVALIDO
    return COR_NAO_APLICAVEL


# ============================================================
# Varredura do Drive — igual às etapas anteriores, sem mudança.
# ============================================================

def _construir_filhos_de(todos_os_itens: list) -> dict:
    filhos_de = defaultdict(list)
    for item in todos_os_itens:
        for pai_id in item.get('parents', []):
            filhos_de[pai_id].append(item)
    return filhos_de


def _varrer_recursivo(filhos_de: dict, pasta_id: str, caminho_relativo: str = '') -> list:
    filhos = filhos_de.get(pasta_id, [])
    if not filhos:
        return [(caminho_relativo, MARCADOR_PASTA_VAZIA)]

    entradas = []
    for filho in sorted(filhos, key=lambda f: f['name'].lower()):
        if filho['mimeType'] == MIME_PASTA:
            entradas.extend(_varrer_recursivo(filhos_de, filho['id'], f"{caminho_relativo}{filho['name']}/"))
        else:
            entradas.append((caminho_relativo, filho['name']))
    return entradas


def _montar_itens_do_drive(todos_os_itens: list, raiz_id: str) -> list:
    filhos_de = _construir_filhos_de(todos_os_itens)
    itens = []

    filhos_da_raiz = filhos_de.get(raiz_id, [])
    for item in filhos_da_raiz:
        if item['mimeType'] != MIME_PASTA:
            itens.append(ItemEncontradoNoDrive(MARCADOR_FORA_DE_MARCA, MARCADOR_FORA_DE_EAN, MARCADOR_RAIZ_DO_DRIVE, item['name']))

    for pasta_marca in filhos_da_raiz:
        if pasta_marca['mimeType'] != MIME_PASTA:
            continue
        marca = pasta_marca['name']
        filhos_da_marca = filhos_de.get(pasta_marca['id'], [])

        for item in filhos_da_marca:
            if item['mimeType'] != MIME_PASTA:
                itens.append(ItemEncontradoNoDrive(marca, MARCADOR_FORA_DE_EAN, MARCADOR_RAIZ_DA_MARCA, item['name']))

        for pasta_ean in filhos_da_marca:
            if pasta_ean['mimeType'] != MIME_PASTA:
                continue
            ean = pasta_ean['name']
            for caminho, nome in _varrer_recursivo(filhos_de, pasta_ean['id']):
                local = caminho if caminho else MARCADOR_RAIZ_DO_EAN
                itens.append(ItemEncontradoNoDrive(marca, ean, local, nome))

    return itens


# ============================================================
# Validações unitárias — reaproveitadas tanto pela planilha detalhada
# quanto pela classificação por produto.
# ============================================================

def _nome_de_arquivo_valido(nome_arquivo: str) -> bool:
    match_simples = PADRAO_SIMPLES.match(nome_arquivo)
    if match_simples:
        tipo, extensao = _normalizar_tipo(match_simples.group(1).lower()), match_simples.group(2)
        return _extensao_valida(tipo, extensao)

    match_numerado = PADRAO_NUMERADO.match(nome_arquivo)
    if match_numerado:
        _, _, tipo, extensao = match_numerado.groups()
        return _extensao_valida(_normalizar_tipo(tipo.lower()), extensao)

    return False


# Função Objetivo: Devolve o TIPO real do arquivo ('base'/'roteiro'/
# 'completo'), ou None se o nome não bate em nenhum padrão válido — usado
# por `tem_video_real` pra exigir tipo vídeo (nunca roteiro), não só
# "qualquer nome reconhecido" (isso já é papel de `_nome_de_arquivo_valido`).
def _tipo_do_nome_de_arquivo(nome_arquivo: str) -> Optional[str]:
    match_simples = PADRAO_SIMPLES.match(nome_arquivo)
    if match_simples:
        tipo, extensao = _normalizar_tipo(match_simples.group(1).lower()), match_simples.group(2)
        return tipo if _extensao_valida(tipo, extensao) else None

    match_numerado = PADRAO_NUMERADO.match(nome_arquivo)
    if match_numerado:
        _, _, tipo, extensao = match_numerado.groups()
        tipo = _normalizar_tipo(tipo.lower())
        return tipo if _extensao_valida(tipo, extensao) else None

    return None


def _validar_nome(nome: str) -> str:
    if nome == MARCADOR_PASTA_VAZIA:
        return '-'
    return 'Sim' if _nome_de_arquivo_valido(nome) else 'Não'


def _marca_valida(marca: str, marcas_validas: set) -> str:
    if marca == MARCADOR_FORA_DE_MARCA:
        return '-'
    return 'Sim' if marca.upper().strip() in marcas_validas else 'Não'


def _ean_valido(ean: str, eans_validos: set) -> str:
    if ean == MARCADOR_FORA_DE_EAN:
        return '-'
    return 'Sim' if ean.strip() in eans_validos else 'Não'


def _primeiro_segmento_do_caminho(local: str) -> Optional[str]:
    if local in MARCADORES_DE_RAIZ:
        return None
    return local.split('/')[0]


def _eh_segmento_pasta_videos(segmento: Optional[str]) -> bool:
    return bool(segmento) and segmento.upper().strip() == NOME_PASTA_VIDEOS.upper().strip()


# Função Objetivo: True só quando `local` é DIRETO dentro de "Videos" (não
# numa subpasta dela, como "Videos/usados/") — usado por `tem_video_real`
# pra não contar vídeo já usado/arquivado como vídeo disponível.
def _esta_diretamente_na_pasta_videos(local: str) -> bool:
    segmento = _primeiro_segmento_do_caminho(local)
    return _eh_segmento_pasta_videos(segmento) and local == f'{segmento}/'


def _pasta_videos_existe_no_grupo(itens_do_grupo: list) -> bool:
    return any(_eh_segmento_pasta_videos(_primeiro_segmento_do_caminho(item.local)) for item in itens_do_grupo)


def _validar_pasta_videos_por_produto(itens: list) -> dict:
    grupos = defaultdict(list)
    for item in itens:
        grupos[(item.marca, item.ean)].append(item)
    return {par: _pasta_videos_existe_no_grupo(itens_do_grupo) for par, itens_do_grupo in grupos.items()}


# Função Objetivo: True quando a pasta do EAN existe no Drive mas está 100%
# vazia (nem "Videos" foi criada) — 1 dos 2 critérios da planilha "Sem
# Vídeo", e também usado por `_classificar_produto` (Pergunta 1-4) pra
# "estrutura pronta" contar mesmo sem nenhum arquivo ainda.
def _eh_ean_completamente_vazio(itens_do_produto: list) -> bool:
    return (
        len(itens_do_produto) == 1
        and itens_do_produto[0].local == MARCADOR_RAIZ_DO_EAN
        and itens_do_produto[0].nome == MARCADOR_PASTA_VAZIA
    )


# ============================================================
# Classificação por produto — as 4 perguntas (Pergunta 1-4).
# ============================================================

# Função Objetivo: Decide as 4 perguntas de negócio pra 1 produto do banco,
# cruzando com o que foi achado no Drive pelo mesmo EAN.
def _classificar_produto(marca_db: str, ean_db: str, itens_por_ean: dict, marcas_validas: set) -> ClassificacaoProduto:
    itens_do_produto = itens_por_ean.get(ean_db.strip(), [])

    if not itens_do_produto:
        return ClassificacaoProduto(marca_db, ean_db, False, True, '-', 'Sim', 'Não', '-', 3)

    marcas_encontradas = {item.marca for item in itens_do_produto}
    duplicado_em_mais_de_1_marca = len(marcas_encontradas) > 1

    eh_ean_completamente_vazio = _eh_ean_completamente_vazio(itens_do_produto)
    tem_arquivo_solto_real = any(
        item.local in (MARCADOR_RAIZ_DO_EAN, MARCADOR_RAIZ_DA_MARCA) and item.nome != MARCADOR_PASTA_VAZIA
        for item in itens_do_produto
    )
    tem_pasta_videos = _pasta_videos_existe_no_grupo(itens_do_produto)
    tem_video_real = any(
        item.nome != MARCADOR_PASTA_VAZIA
        and _esta_diretamente_na_pasta_videos(item.local)
        and _tipo_do_nome_de_arquivo(item.nome) in ('base', 'completo')
        for item in itens_do_produto
    )

    marca_valida_ok = all(_marca_valida(item.marca, marcas_validas) == 'Sim' for item in itens_do_produto)
    arquivos_reais = [item for item in itens_do_produto if item.nome != MARCADOR_PASTA_VAZIA]
    nome_valido_ok = all(_nome_de_arquivo_valido(item.nome) for item in arquivos_reais)

    estrutura_correta = (
        marca_valida_ok and nome_valido_ok and not tem_arquivo_solto_real
        and not duplicado_em_mais_de_1_marca and (tem_pasta_videos or eh_ean_completamente_vazio)
    )

    if tem_video_real:
        pergunta = 1 if estrutura_correta else 2
    else:
        pergunta = 3 if estrutura_correta else 4

    nome_valido_resumo = '-' if not arquivos_reais else ('Sim' if nome_valido_ok else 'Não')

    return ClassificacaoProduto(
        marca_db, ean_db, tem_video_real, estrutura_correta,
        'Sim' if marca_valida_ok else 'Não', 'Sim',
        'Sim' if tem_pasta_videos else 'Não', nome_valido_resumo, pergunta,
    )


# ============================================================
# Classificação "Sem Vídeo" — critério simples e separado (ver explicação
# no cabeçalho do arquivo). NÃO usa `tem_video_real`/Pergunta 1-4 — um
# produto com qualquer arquivo (roteiro, usado, o que for) dentro da pasta
# do EAN não entra aqui, mesmo que não tenha vídeo real nenhum.
# ============================================================

# Função Objetivo: Devolve o motivo (string) se o produto entra na planilha
# "Sem Vídeo", ou None se ele tem QUALQUER estrutura no Drive (mesmo que
# essa estrutura não tenha vídeo real — isso é problema das outras
# planilhas, não desta).
def _motivo_produto_sem_video(ean_db: str, itens_por_ean: dict) -> Optional[str]:
    itens_do_produto = itens_por_ean.get(ean_db.strip(), [])
    if not itens_do_produto:
        return MOTIVO_NAO_ENCONTRADO_NO_DRIVE
    if _eh_ean_completamente_vazio(itens_do_produto):
        return MOTIVO_PASTA_DO_EAN_VAZIA
    return None


# ============================================================
# Banco — 1 única consulta.
# ============================================================

# Função Objetivo: Consulta o banco da Magazine 1 única vez — devolve a
# lista completa de (marca, ean) ativos + os 2 `set` normalizados usados
# pelas checagens "Marca Válida"/"EAN Válido" da planilha detalhada.
def _buscar_produtos_ativos_magazine() -> tuple:
    definir_empresa_ativa(EMPRESA_MAGAZINE)
    produtos_brutos = Produto.objects.filter(ativo_no_erp=True).values_list('marca', 'ean')
    produtos = [(marca or '(sem marca cadastrada)', ean) for marca, ean in produtos_brutos]

    marcas_validas = {marca.upper().strip() for marca, _ in produtos}
    eans_validos = {ean.strip() for _, ean in produtos}
    return produtos, marcas_validas, eans_validos


# ============================================================
# Planilha detalhada (por arquivo) — igual à etapa anterior.
# ============================================================

def _montar_linhas_com_espacamento(
    itens: list, validacao_pasta_videos: dict, marcas_validas: set, eans_validos: set,
    filtrar_por_marca: Optional[str] = None,
) -> list:
    itens_ordenados = sorted(itens, key=lambda i: (i.marca, i.ean, i.local, i.nome))

    linhas = []
    par_anterior = None
    for item in itens_ordenados:
        if filtrar_por_marca and item.marca != filtrar_por_marca:
            continue
        par_atual = (item.marca, item.ean)
        if par_anterior is not None and par_atual != par_anterior:
            linhas.append([])
        par_anterior = par_atual

        pasta_videos_valida = '-' if item.ean == MARCADOR_FORA_DE_EAN else ('Sim' if validacao_pasta_videos.get(par_atual, False) else 'Não')
        linhas.append([
            item.marca, item.ean, item.local, item.nome,
            _marca_valida(item.marca, marcas_validas),
            _ean_valido(item.ean, eans_validos),
            pasta_videos_valida,
            _validar_nome(item.nome),
        ])
    return linhas


def _escrever_aba_detalhe(wb, titulo_aba: str, linhas: list, aviso_texto: str) -> Worksheet:
    ws = wb.create_sheet(_sanitizar_nome_de_aba(titulo_aba))
    _escrever_aviso(ws, len(CABECALHO_DETALHE), aviso_texto)
    ws.append(CABECALHO_DETALHE)
    _estilizar_cabecalho(ws, linha=2, quantidade_colunas=len(CABECALHO_DETALHE))
    _ajustar_largura_colunas(ws, LARGURAS_DETALHE)

    for linha in linhas:
        ws.append(linha)
        if not linha:
            continue
        numero_da_linha = ws.max_row
        for indice_coluna in COLUNAS_DE_VALIDACAO_DETALHE:
            valor = linha[indice_coluna - 1]
            ws.cell(row=numero_da_linha, column=indice_coluna).fill = PatternFill('solid', fgColor=_cor_para_valor_validacao(valor))
    return ws


# ============================================================
# Planilhas por pergunta (por produto).
# ============================================================

def _escrever_aba_produtos(wb, titulo_aba: str, classificacoes: list, aviso_texto: str) -> Worksheet:
    ws = wb.create_sheet(_sanitizar_nome_de_aba(titulo_aba))
    _escrever_aviso(ws, len(CABECALHO_PRODUTO), aviso_texto)
    ws.append(CABECALHO_PRODUTO)
    _estilizar_cabecalho(ws, linha=2, quantidade_colunas=len(CABECALHO_PRODUTO))
    _ajustar_largura_colunas(ws, LARGURAS_PRODUTO)

    for classificacao in sorted(classificacoes, key=lambda c: (c.marca, c.ean)):
        linha = [
            classificacao.marca, classificacao.ean, classificacao.marca_valida,
            classificacao.ean_valido, classificacao.pasta_videos_valida, classificacao.nome_valido,
        ]
        ws.append(linha)
        numero_da_linha = ws.max_row
        for indice_coluna in COLUNAS_DE_VALIDACAO_PRODUTO:
            valor = linha[indice_coluna - 1]
            ws.cell(row=numero_da_linha, column=indice_coluna).fill = PatternFill('solid', fgColor=_cor_para_valor_validacao(valor))
    return ws


def _gerar_planilha_por_pergunta(classificacoes: list, marcas: list, caminho_saida: str, aviso_texto: str) -> None:
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    _escrever_aba_produtos(wb, 'Geral', classificacoes, aviso_texto)
    for marca in marcas:
        classificacoes_da_marca = [c for c in classificacoes if c.marca == marca]
        if classificacoes_da_marca:
            _escrever_aba_produtos(wb, marca, classificacoes_da_marca, aviso_texto)
    wb.save(caminho_saida)


# ============================================================
# Planilha "Sem Vídeo" (por produto) — critério simples e separado.
# ============================================================

def _escrever_aba_sem_video(wb, titulo_aba: str, produtos_sem_video: list, aviso_texto: str) -> Worksheet:
    ws = wb.create_sheet(_sanitizar_nome_de_aba(titulo_aba))
    _escrever_aviso(ws, len(CABECALHO_SEM_VIDEO), aviso_texto)
    ws.append(CABECALHO_SEM_VIDEO)
    _estilizar_cabecalho(ws, linha=2, quantidade_colunas=len(CABECALHO_SEM_VIDEO))
    _ajustar_largura_colunas(ws, LARGURAS_SEM_VIDEO)

    cor_por_motivo = {MOTIVO_NAO_ENCONTRADO_NO_DRIVE: COR_INVALIDO, MOTIVO_PASTA_DO_EAN_VAZIA: COR_AVISO}
    for produto in sorted(produtos_sem_video, key=lambda p: (p.marca, p.ean)):
        ws.append([produto.marca, produto.ean, produto.motivo])
        ws.cell(row=ws.max_row, column=3).fill = PatternFill('solid', fgColor=cor_por_motivo[produto.motivo])
    return ws


def _gerar_planilha_sem_video(produtos_sem_video: list, marcas: list, caminho_saida: str, aviso_texto: str) -> None:
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    _escrever_aba_sem_video(wb, 'Geral', produtos_sem_video, aviso_texto)
    for marca in marcas:
        produtos_da_marca = [p for p in produtos_sem_video if p.marca == marca]
        if produtos_da_marca:
            _escrever_aba_sem_video(wb, marca, produtos_da_marca, aviso_texto)
    wb.save(caminho_saida)


# ============================================================
# Orquestração — com feedback de progresso em cada etapa.
# ============================================================

def gerar_todas_as_planilhas() -> None:
    print('Iniciando (Drive completo + banco + 6 planilhas)...')

    print('Etapa 1/6 — buscando lista completa de itens do Drive (Magazine)... pode levar alguns segundos.')
    servico = obter_servico_drive()
    raiz_id = settings.GOOGLE_DRIVE_PASTA_RAIZ_MAGAZINE
    todos_os_itens = _listar_tudo_paginado(servico)
    print(f'  -> {len(todos_os_itens)} item(ns) bruto(s) recebido(s) do Drive.')

    print('Etapa 2/6 — organizando a árvore (marca -> EAN -> arquivos)...')
    itens = _montar_itens_do_drive(todos_os_itens, raiz_id)
    marcas_encontradas_drive = sorted({item.marca for item in itens if item.marca != MARCADOR_FORA_DE_MARCA})
    print(f'  -> {len(itens)} linha(s) de inventário montadas, {len(marcas_encontradas_drive)} marca(s) encontradas no Drive.')

    print('Etapa 3/6 — consultando o banco (produtos ativos da Magazine)...')
    produtos_ativos, marcas_validas, eans_validos = _buscar_produtos_ativos_magazine()
    print(f'  -> {len(produtos_ativos)} produto(s) ativo(s) encontrados no banco.')

    print('Etapa 4/6 — calculando validações (Pasta Videos, Nome, Marca, EAN)...')
    validacao_pasta_videos = _validar_pasta_videos_por_produto(itens)

    print('Etapa 5/6 — classificando cada produto do banco (Pergunta 1-4 + Sem Vídeo)...')
    itens_por_ean = defaultdict(list)
    for item in itens:
        if item.ean != MARCADOR_FORA_DE_EAN:
            itens_por_ean[item.ean.strip()].append(item)

    classificacoes = [_classificar_produto(marca, ean, itens_por_ean, marcas_validas) for marca, ean in produtos_ativos]
    contagem_por_pergunta = Counter(c.pergunta for c in classificacoes)
    print(
        f'  -> P1 (vídeo ok): {contagem_por_pergunta[1]} | P2 (vídeo com erro): {contagem_por_pergunta[2]} | '
        f'P3 (sem vídeo, ok): {contagem_por_pergunta[3]} | P4 (sem vídeo, com erro): {contagem_por_pergunta[4]}'
    )

    produtos_sem_video = []
    for marca, ean in produtos_ativos:
        motivo = _motivo_produto_sem_video(ean, itens_por_ean)
        if motivo is not None:
            produtos_sem_video.append(ProdutoSemVideo(marca, ean, motivo))
    contagem_por_motivo = Counter(p.motivo for p in produtos_sem_video)
    print(
        f'  -> Sem Vídeo: {len(produtos_sem_video)} produto(s) — '
        f'{contagem_por_motivo[MOTIVO_NAO_ENCONTRADO_NO_DRIVE]} não encontrado(s), '
        f'{contagem_por_motivo[MOTIVO_PASTA_DO_EAN_VAZIA]} com pasta de EAN vazia.'
    )

    print('Etapa 6/6 — gerando as planilhas...')
    marcas_db = sorted({marca for marca, _ in produtos_ativos})

    print('  -> Planilha detalhada (inventario_drive_magazine.xlsx)...')
    aviso_detalhado = (
        f'Inventário do Drive (Magazine) + validação completa (Marca, EAN, Pasta Videos, Nome de arquivo). '
        f'Gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}.'
    )
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    _escrever_aba_detalhe(wb, 'Geral', _montar_linhas_com_espacamento(itens, validacao_pasta_videos, marcas_validas, eans_validos), aviso_detalhado)
    for marca in marcas_encontradas_drive:
        linhas_da_marca = _montar_linhas_com_espacamento(itens, validacao_pasta_videos, marcas_validas, eans_validos, filtrar_por_marca=marca)
        _escrever_aba_detalhe(wb, marca, linhas_da_marca, aviso_detalhado)
    wb.save('inventario_drive_magazine.xlsx')

    planilhas_por_pergunta = [
        (1, 'produtos_1_video_correto_magazine.xlsx', 'Pergunta 1 — Existe vídeo no Drive, e está tudo correto.'),
        (2, 'produtos_2_video_incorreto_magazine.xlsx', 'Pergunta 2 — Existe vídeo no Drive, mas algo está incorreto.'),
        (3, 'produtos_3_sem_video_estrutura_ok_magazine.xlsx', 'Pergunta 3 — Não existe vídeo no Drive; estrutura pronta e válida, só falta gerar os arquivos.'),
        (4, 'produtos_4_sem_video_estrutura_invalida_magazine.xlsx', 'Pergunta 4 — Não existe vídeo no Drive, e a estrutura está inválida.'),
    ]
    for numero_pergunta, nome_arquivo, aviso_texto in planilhas_por_pergunta:
        print(f'  -> Planilha da Pergunta {numero_pergunta} ({nome_arquivo})...')
        classificacoes_desta_pergunta = [c for c in classificacoes if c.pergunta == numero_pergunta]
        _gerar_planilha_por_pergunta(classificacoes_desta_pergunta, marcas_db, nome_arquivo, aviso_texto)

    print('  -> Planilha de produtos sem vídeo (produtos_sem_video_magazine.xlsx)...')
    aviso_sem_video = (
        'Produtos ativos da Magazine sem vídeo no Drive — ou não encontrados em lugar nenhum, ou com a '
        'pasta do EAN encontrada mas totalmente vazia. NÃO inclui produto com qualquer arquivo dentro da '
        'pasta do EAN (roteiro sozinho, vídeo já usado, "Videos" vazia mas o EAN não, etc.) — esses casos '
        'aparecem nas planilhas de Pergunta 1-4 (estrutura correta / com inconsistência). '
        f'Gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}.'
    )
    _gerar_planilha_sem_video(produtos_sem_video, marcas_db, 'produtos_sem_video_magazine.xlsx', aviso_sem_video)

    print('Concluído — 6 planilha(s) geradas.')


if __name__ == '__main__':
    gerar_todas_as_planilhas()
```

## O que ainda está em aberto (histórico — ver "Em aberto" dentro da atualização de 26/08 pro estado atual)

- ~~Rodar o script de verdade no ambiente do projeto...~~ — **feito em 26/08/2026**, ver atualização abaixo.
- ~~Aplicar/commitar/pushar o arquivo `scripts_dev/gerar_inventario_drive_magazine.py`~~ — **ainda pendente**, ver "Em aberto" na atualização de 26/08 abaixo (não mudou, só migrou de seção).
- ~~Decidir se o mesmo script deve existir também pra Samvale~~ — **resolvido em 26/08/2026**: script agora roda pras 2 empresas, ver atualização abaixo.

## Atualização 26/08/2026 — Pivô pra Plan 1/2/3 + multi-empresa (Magazine/Samvale)

### Por que o critério de 25/08 foi abandonado

Na sessão seguinte, o usuário rodou o script de 25/08 pela 1ª vez contra dado real (1295 produtos ativos, 1880 itens brutos no Drive da Magazine) e concluiu, nas próprias palavras: *"os dados estão vindo incoerentes, e não me geram dados úteis."* O problema concreto: a "Pergunta 3" (1199 de 1295 produtos) misturava, sob o mesmo rótulo de "estrutura ok, só falta o vídeo", 2 situações muito diferentes — 1197 produtos que nunca tiveram NADA criado no Drive, e 2 com a pasta do EAN vazia. Rotular "nunca foi criado" como "estrutura pronta" é o tipo de incoerência que motivou o pivô inteiro.

### As 4 planilhas finais pedidas pelo usuário (nas próprias palavras)

> "Qual a estrutura atual e completa do drive? -> 'Inventario_Drive'; Quais produtos estão 100% com a estrutura correta no drive? -> 'Produtos com estrutura valida'; Quais produtos existem no drive mas estão com algum problema de estrutura/nome? -> 'Produtos com problemas de estrutura'; Quais produtos existem no meu DB mas não estão sendo trabalhados? -> 'Produtos fora do Drive'."

Depois de uma rodada de confirmação ponto a ponto (documentada abaixo), o usuário simplificou ainda mais, condensando as 4 categorias antigas (Pergunta 1-4) em só 3 planos de negócio:

> "Plan 1 -> P1 -> Responde: Produto está sendo trabalhado no drive e esta com sua estrutura correta. Plan 2 -> P2 + P3 -> Responde: Produto esta sendo trabalhado no drive, mas esta com problemas em sua estrutura (erros de subpastas, erros de nomes, ou pastas vazias). Plan 3 -> P4 -> Responde: Quais produtos Não estão sendo trabalhados no Drive, a pasta do EAN nunca foi criada."

### As 3 confirmações que fecharam a regra (nas próprias palavras do usuário)

1. **Pasta do EAN vazia** — "Ean existe no drive e estrutura valida -> plan 01. Ean existe no drive mas com alguma inconscistencia ou pasta vazia -> plan 02." → pasta vazia (mesmo que a pasta do EAN tenha sido criada) sai do antigo "sem vídeo" e vira Plan 2, não Plan 3. Plan 3 fica reservado só pra "a pasta do EAN nunca foi criada".
2. **Tipo do arquivo não importa mais** — "NÃO ESTAMOS VALIDANDO O QUE É O ARQUIVO apenas se as nomenclaturas estão corretas. se existe um roteiro sozinho ou um video nao importa, vai para a plan 01 -> Estrutura valida. Se não existe nenhum arquivo vai para plan 02." → **isso substitui diretamente o fix do bug #1 de 25/08** (que fazia Roteiro sozinho NÃO contar como "vídeo real"). O bug em si continua sendo um bug real do código antigo (`_classificar_produto`), mas o critério que o motivava a importar não existe mais neste script: agora Roteiro sozinho, com nome correto, é Plan 1.
3. **Arquivo em "usados/"** — "Se os arquivos dentro de usados estiverem estrutura e nomenclatura certa plan 01.... se tiverem alguma inconscitencia plan 02." → **isso também substitui o fix do bug #2 de 25/08** (que excluía "usados/" de contar como vídeo disponível). Agora "usados/" conta igual a "Videos/" direto, contanto que a nomenclatura esteja certa.

### A regra final (resumo objetivo, é o que o código faz)

- **Plan 1** — o produto tem pelo menos 1 arquivo real (Roteiro, vídeo simples, ou vídeo já usado — não importa qual), com nome seguindo o padrão esperado, direto em `Videos/` OU em `Videos/usados/` (nenhum outro local vale). Também exige marca da pasta válida no banco e o EAN não estar duplicado em mais de 1 pasta de marca (isso não foi recontestado nesta rodada, mantido do critério anterior).
- **Plan 2** — o produto tem alguma pasta no Drive, mas com algum problema: pasta do EAN 100% vazia (fantasma), ou pasta(s) criada(s) sem nenhum arquivo real dentro, ou EAN duplicado em mais de 1 marca, ou marca da pasta inválida, ou arquivo fora de `Videos/`/`Videos/usados/`, ou nome de arquivo fora do padrão. Quando mais de 1 problema se aplica ao mesmo produto, só o 1º dessa lista (nessa ordem) aparece na coluna "Motivo".
- **Plan 3** — o EAN nunca teve pasta criada em lugar nenhum do Drive. Não está sendo trabalhado, ponto.

### Validação da lógica + reconciliação com a rodada antiga

Antes de entregar, a lógica nova foi testada isoladamente (11 cenários fabricados, incluindo Roteiro sozinho, vídeo em `usados/` com nome certo e errado, pasta vazia, `Videos/` criada mas vazia, EAN nunca encontrado, arquivo solto na raiz do EAN, arquivo em subpasta errada, marca inválida, EAN duplicado em 2 marcas) contra o `parser.py`/`constantes.py` REAIS do repositório do usuário (sem precisar do Django) — todos os 11 bateram.

Depois, o usuário rodou o script novo contra o Drive/banco reais da Magazine e os números reconciliaram perfeitamente com a rodada antiga (mesma base de 1295 produtos ativos):

```
Rodada antiga (Pergunta 1-4 + Sem Vídeo):
  P1 (vídeo ok): 51 | P2 (vídeo com erro): 11 | P3 (sem vídeo, ok): 1199 | P4 (sem vídeo, com erro): 34
  Sem Vídeo: 1199 = 1197 não encontrados + 2 com pasta de EAN vazia

Rodada nova (Plan 1/2/3):
  Plan 1: 51 | Plan 2: 47 | Plan 3: 1197        (soma = 1295, bate com o total ativo)

Reconciliação:
  Plan 1 (51)   = P1 antigo (51)                         — nenhum caso real de "só Roteiro correto" existia na base
  Plan 2 (47)   = P2 (11) + P4 (34) + pasta vazia (2)     = 47
  Plan 3 (1197) = exatamente os 1197 "não encontrados" antigos, sem mais misturar pasta vazia
```

Matemática batendo 100% nos 2 lados foi o sinal de que a migração de critério não perdeu nem inventou produto nenhum — só reclassificou, exatamente como decidido.

### 2ª mudança pedida pelo usuário: pasta de saída + suporte multi-empresa

Depois da validação acima, o usuário pediu 2 ajustes finais:

1. As 4 planilhas de cada empresa devem ser salvas dentro de `Relatorios DRIVE/Magazine/` e `Relatorios DRIVE/Samvale/` (pasta criada automaticamente se não existir), em vez de soltas na raiz. Como a pasta já diz a empresa, os nomes de arquivo perderam o sufixo `_magazine` (ex: `inventario_drive.xlsx` em vez de `inventario_drive_magazine.xlsx`).
2. O script precisa rodar tanto pra Magazine quanto pra Samvale — antes era fixo em Magazine (`_buscar_produtos_ativos_magazine()`, `GOOGLE_DRIVE_PASTA_RAIZ_MAGAZINE` hardcoded).

Resolvido generalizando a função de busca no banco (`_buscar_produtos_ativos(empresa)`, usa `definir_empresa_ativa(empresa)` do roteador multi-empresa já existente em `core/empresa.py`) e a orquestração (`gerar_todas_as_planilhas(empresa)`), escolhendo a raiz do Drive certa (`settings.GOOGLE_DRIVE_PASTA_RAIZ_MAGAZINE`/`_SAMVALE`, os 2 já existem em `settings.py`) e a subpasta de saída (`NOME_PASTA_SAIDA_POR_EMPRESA`). Formas de rodar:

```
python scripts_dev/gerar_inventario_drive_magazine.py            # roda as 2 empresas (Magazine e Samvale)
python scripts_dev/gerar_inventario_drive_magazine.py magazine   # roda só a Magazine
python scripts_dev/gerar_inventario_drive_magazine.py samvale    # roda só a Samvale
```

**Confirmado pelo usuário, rodando sem argumento contra o ambiente real: funcionou, gerou as 2 pastas (`Relatorios DRIVE/Magazine/` e `Relatorios DRIVE/Samvale/`), sem erros numa checagem rápida.**

### Script completo (versão final, 26/08/2026 — Plan 1/2/3 + multi-empresa)

Substitui integralmente a versão de 25/08/2026 embutida mais acima nesta nota (aquela fica só como histórico do bug fix original).

```python
# scripts_dev/gerar_inventario_drive_magazine.py

# Função Objetivo: Gera, numa única execução por empresa (1 única varredura
# do Drive, 1 única consulta ao banco): a planilha detalhada (por arquivo)
# + 3 planilhas de classificação por produto, respondendo 3 perguntas de
# negócio (Plan 1/2/3). Total = 4 planilhas por empresa, salvas dentro de
# "Relatorios DRIVE/<Empresa>/" (pasta criada automaticamente se não
# existir).
#   Plan 1 -> Produto está sendo trabalhado no Drive, com estrutura e
#             nomenclatura corretas.
#   Plan 2 -> Produto está sendo trabalhado no Drive, mas com algum
#             problema de estrutura (pasta vazia/fantasma, nome errado,
#             arquivo fora do lugar, marca inválida, ou EAN duplicado em
#             mais de 1 marca).
#   Plan 3 -> Produto NÃO está sendo trabalhado no Drive — a pasta do EAN
#             nunca foi criada.
# Universo = todo produto ATIVO do banco DA EMPRESA RODADA (não só o que a
# varredura achou) — um produto sem NENHUMA pasta no Drive também aparece,
# no Plan 3. Nada é filtrado da planilha detalhada — as planilhas de
# classificação são uma CLASSIFICAÇÃO em cima do mesmo dado, nunca uma
# exclusão dele. Só leitura — nunca grava nada no Drive nem no banco.
#
# * [EXPLICAÇÃO] → NOVO em 26/08/2026: roda pra Magazine E/OU Samvale (ver
#                  "Como rodar" mais abaixo) — antes era só Magazine. Cada
#                  empresa gera seu próprio conjunto de 4 planilhas, numa
#                  subpasta própria ("Relatorios DRIVE/Magazine/" ou
#                  "Relatorios DRIVE/Samvale/"), pra não misturar nem
#                  sobrescrever os arquivos de uma empresa com os da outra.
# * [EXPLICAÇÃO] → Casamento produto-do-banco x Drive é feito só pelo EAN
#                  (chave única, confirmado pelo usuário) — não importa
#                  embaixo de qual pasta de marca o EAN foi encontrado.
# * [EXPLICAÇÃO] → REVISADO em 26/08/2026 (decisão explícita do usuário,
#                  substitui o critério anterior de 25/08/2026): este
#                  script NÃO valida mais o TIPO/CONTEÚDO do arquivo (se é
#                  vídeo real, roteiro, ou vídeo já usado em "usados/") —
#                  só valida se está SENDO TRABALHADO (existe pelo menos 1
#                  arquivo real, em local válido) e se a NOMENCLATURA desse
#                  arquivo está correta. Um Roteiro sozinho, um vídeo
#                  simples, ou um vídeo dentro de "Videos/usados/" contam
#                  igualmente para Plan 1, desde que o nome siga o padrão
#                  esperado e o arquivo esteja direto em "Videos/" ou em
#                  "Videos/usados/" (nenhuma outra subpasta é válida).
# * [EXPLICAÇÃO] → Pasta do EAN encontrada mas sem NENHUM arquivo real
#                  dentro (seja ela 100% vazia, seja só a pasta "Videos"
#                  criada e vazia) → Plan 2, não Plan 3. Decisão explícita
#                  do usuário (26/08/2026) — isso muda em relação à versão
#                  de 25/08/2026, onde esse caso caía na planilha "Sem
#                  Vídeo" (equivalente ao Plan 3 de hoje). Plan 3 agora é
#                  reservado só para "a pasta do EAN nunca foi criada".
# * [EXPLICAÇÃO] → "Estrutura correta" (Plan 1) também continua exigindo:
#                  nome da pasta de marca válido no banco, e EAN nunca
#                  duplicado em mais de 1 pasta de marca — isso não foi
#                  reconfirmado nesta rodada de decisões (26/08/2026), foi
#                  mantido do critério anterior por não ter sido
#                  contestado. Se não fizer sentido, avisar pra remover.
# * [EXPLICAÇÃO] → Quando mais de 1 problema se aplica ao mesmo produto, o
#                  "Motivo" mostrado no Plan 2 segue esta ordem de
#                  prioridade (só o 1º que bater aparece): pasta vazia >
#                  EAN duplicado em marcas > marca inválida > arquivo fora
#                  do lugar > nome de arquivo inválido.
#
# Como rodar (no ambiente real do projeto, com Drive e banco configurados):
#   python scripts_dev/gerar_inventario_drive_magazine.py            # roda as 2 empresas (Magazine e Samvale)
#   python scripts_dev/gerar_inventario_drive_magazine.py magazine   # roda só a Magazine
#   python scripts_dev/gerar_inventario_drive_magazine.py samvale    # roda só a Samvale

import os
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


def _adicionar_raiz_do_projeto_ao_path():
    caminho_atual = os.path.dirname(os.path.abspath(__file__))
    while caminho_atual != os.path.dirname(caminho_atual):
        if os.path.exists(os.path.join(caminho_atual, 'manage.py')):
            sys.path.insert(0, caminho_atual)
            return
        caminho_atual = os.path.dirname(caminho_atual)
    raise RuntimeError('Não foi possível encontrar manage.py subindo a partir deste script.')


_adicionar_raiz_do_projeto_ao_path()

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projeto_sistema_interno_mb_sv.settings')
django.setup()

import openpyxl
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

from django.conf import settings
from core.empresa import EMPRESA_MAGAZINE, EMPRESA_SAMVALE, definir_empresa_ativa
from produtos.models import Produto
from agenda_videos.funcoes_auxiliares.drive.cliente import obter_servico_drive
from agenda_videos.funcoes_auxiliares.drive.constantes import MIME_PASTA, NOME_PASTA_USADOS, NOME_PASTA_VIDEOS
from agenda_videos.funcoes_auxiliares.drive.escaneador import _listar_tudo_paginado
from agenda_videos.funcoes_auxiliares.drive.parser import (
    EXTENSOES_VALIDAS_POR_TIPO, PADRAO_NUMERADO, PADRAO_SIMPLES, _extensao_valida, _normalizar_tipo,
)

COR_CABECALHO = '1E3A5F'
COR_AVISO = 'DCE6F1'
COR_VALIDO = 'C6EFCE'
COR_INVALIDO = 'FFC7CE'
COR_NAO_APLICAVEL = 'F2F2F2'

CABECALHO_DETALHE = [
    'Marca', 'EAN', 'Local', 'Nome do Arquivo',
    'Marca Válida', 'EAN Válido', 'Pasta Videos Válida', 'Nome Válido',
]
LARGURAS_DETALHE = [22, 22, 30, 45, 16, 14, 20, 14]
COLUNAS_DE_VALIDACAO_DETALHE = [5, 6, 7, 8]

CABECALHO_CLASSIFICACAO = ['Marca', 'EAN', 'Motivo']
LARGURAS_CLASSIFICACAO = [22, 22, 55]

MARCADOR_PASTA_VAZIA = '(pasta vazia)'
MARCADOR_RAIZ_DO_EAN = '(raiz do EAN)'
MARCADOR_RAIZ_DA_MARCA = '(raiz da marca)'
MARCADOR_RAIZ_DO_DRIVE = '(raiz do Drive)'
MARCADOR_FORA_DE_EAN = '(fora de qualquer EAN)'
MARCADOR_FORA_DE_MARCA = '(fora de qualquer marca)'
MARCADORES_DE_RAIZ = (MARCADOR_RAIZ_DO_EAN, MARCADOR_RAIZ_DA_MARCA, MARCADOR_RAIZ_DO_DRIVE)

MOTIVO_ESTRUTURA_VALIDA = 'Estrutura válida'
MOTIVO_EAN_NAO_ENCONTRADO = 'EAN não encontrado no Drive'
MOTIVO_PASTA_EAN_VAZIA = 'Pasta do EAN existe mas está totalmente vazia (pasta fantasma)'
MOTIVO_SEM_ARQUIVO_REAL = 'Pasta(s) foram criadas, mas nenhum arquivo real dentro'
MOTIVO_EAN_DUPLICADO_EM_MARCAS = 'EAN encontrado em mais de 1 pasta de marca'
MOTIVO_MARCA_INVALIDA = 'Pasta de marca não corresponde a uma marca válida no banco'
MOTIVO_LOCAL_INVALIDO = 'Arquivo fora do lugar esperado (fora de "Videos/" ou "Videos/usados/")'
MOTIVO_NOME_INVALIDO = 'Nome de arquivo não segue o padrão esperado'

# Onde as planilhas de cada empresa são salvas: "Relatorios DRIVE/<nome>/".
PASTA_RELATORIOS_BASE = 'Relatorios DRIVE'
NOME_PASTA_SAIDA_POR_EMPRESA = {
    EMPRESA_MAGAZINE: 'Magazine',
    EMPRESA_SAMVALE: 'Samvale',
}


@dataclass(frozen=True)
class ItemEncontradoNoDrive:
    marca: str
    ean: str
    local: str
    nome: str


# Função Objetivo: Representa o resultado da classificação de 1 produto do
# banco no Plan 1/2/3 (ver explicação no cabeçalho do arquivo).
@dataclass(frozen=True)
class ClassificacaoProduto:
    marca: str
    ean: str
    plano: int
    motivo: str


# ============================================================
# Helpers de planilha.
# ============================================================

def _estilizar_cabecalho(ws: Worksheet, linha: int, quantidade_colunas: int) -> None:
    for coluna in range(1, quantidade_colunas + 1):
        celula = ws.cell(row=linha, column=coluna)
        celula.font = Font(name='Arial', size=10, bold=True, color='FFFFFF')
        celula.fill = PatternFill('solid', fgColor=COR_CABECALHO)
        celula.alignment = Alignment(horizontal='center', vertical='center')
    ws.freeze_panes = f'A{linha + 1}'
    ws.auto_filter.ref = f'A{linha}:{get_column_letter(quantidade_colunas)}{linha}'
    ws.row_dimensions[linha].height = 22


def _ajustar_largura_colunas(ws: Worksheet, larguras: list) -> None:
    for coluna, largura in enumerate(larguras, start=1):
        ws.column_dimensions[get_column_letter(coluna)].width = largura


def _escrever_aviso(ws: Worksheet, quantidade_colunas: int, texto: str) -> None:
    celula = ws.cell(row=1, column=1, value=texto)
    celula.font = Font(name='Arial', size=9, italic=True, color='31859B')
    celula.fill = PatternFill('solid', fgColor=COR_AVISO)
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=quantidade_colunas)


def _sanitizar_nome_de_aba(nome_marca: str) -> str:
    nome_limpo = nome_marca
    for caractere_proibido in [':', '\\', '/', '?', '*', '[', ']']:
        nome_limpo = nome_limpo.replace(caractere_proibido, '-')
    return nome_limpo[:31]


def _cor_para_valor_validacao(valor: str) -> str:
    if valor == 'Sim':
        return COR_VALIDO
    if valor == 'Não':
        return COR_INVALIDO
    return COR_NAO_APLICAVEL


# ============================================================
# Varredura do Drive — sem mudança.
# ============================================================

def _construir_filhos_de(todos_os_itens: list) -> dict:
    filhos_de = defaultdict(list)
    for item in todos_os_itens:
        for pai_id in item.get('parents', []):
            filhos_de[pai_id].append(item)
    return filhos_de


def _varrer_recursivo(filhos_de: dict, pasta_id: str, caminho_relativo: str = '') -> list:
    filhos = filhos_de.get(pasta_id, [])
    if not filhos:
        return [(caminho_relativo, MARCADOR_PASTA_VAZIA)]

    entradas = []
    for filho in sorted(filhos, key=lambda f: f['name'].lower()):
        if filho['mimeType'] == MIME_PASTA:
            entradas.extend(_varrer_recursivo(filhos_de, filho['id'], f"{caminho_relativo}{filho['name']}/"))
        else:
            entradas.append((caminho_relativo, filho['name']))
    return entradas


def _montar_itens_do_drive(todos_os_itens: list, raiz_id: str) -> list:
    filhos_de = _construir_filhos_de(todos_os_itens)
    itens = []

    filhos_da_raiz = filhos_de.get(raiz_id, [])
    for item in filhos_da_raiz:
        if item['mimeType'] != MIME_PASTA:
            itens.append(ItemEncontradoNoDrive(MARCADOR_FORA_DE_MARCA, MARCADOR_FORA_DE_EAN, MARCADOR_RAIZ_DO_DRIVE, item['name']))

    for pasta_marca in filhos_da_raiz:
        if pasta_marca['mimeType'] != MIME_PASTA:
            continue
        marca = pasta_marca['name']
        filhos_da_marca = filhos_de.get(pasta_marca['id'], [])

        for item in filhos_da_marca:
            if item['mimeType'] != MIME_PASTA:
                itens.append(ItemEncontradoNoDrive(marca, MARCADOR_FORA_DE_EAN, MARCADOR_RAIZ_DA_MARCA, item['name']))

        for pasta_ean in filhos_da_marca:
            if pasta_ean['mimeType'] != MIME_PASTA:
                continue
            ean = pasta_ean['name']
            for caminho, nome in _varrer_recursivo(filhos_de, pasta_ean['id']):
                local = caminho if caminho else MARCADOR_RAIZ_DO_EAN
                itens.append(ItemEncontradoNoDrive(marca, ean, local, nome))

    return itens


# ============================================================
# Validações unitárias — reaproveitadas tanto pela planilha detalhada
# quanto pela classificação por produto.
# ============================================================

def _nome_de_arquivo_valido(nome_arquivo: str) -> bool:
    match_simples = PADRAO_SIMPLES.match(nome_arquivo)
    if match_simples:
        tipo, extensao = _normalizar_tipo(match_simples.group(1).lower()), match_simples.group(2)
        return _extensao_valida(tipo, extensao)

    match_numerado = PADRAO_NUMERADO.match(nome_arquivo)
    if match_numerado:
        _, _, tipo, extensao = match_numerado.groups()
        return _extensao_valida(_normalizar_tipo(tipo.lower()), extensao)

    return False


def _validar_nome(nome: str) -> str:
    if nome == MARCADOR_PASTA_VAZIA:
        return '-'
    return 'Sim' if _nome_de_arquivo_valido(nome) else 'Não'


def _marca_valida(marca: str, marcas_validas: set) -> str:
    if marca == MARCADOR_FORA_DE_MARCA:
        return '-'
    return 'Sim' if marca.upper().strip() in marcas_validas else 'Não'


def _ean_valido(ean: str, eans_validos: set) -> str:
    if ean == MARCADOR_FORA_DE_EAN:
        return '-'
    return 'Sim' if ean.strip() in eans_validos else 'Não'


def _primeiro_segmento_do_caminho(local: str) -> Optional[str]:
    if local in MARCADORES_DE_RAIZ:
        return None
    return local.split('/')[0]


def _eh_segmento_pasta_videos(segmento: Optional[str]) -> bool:
    return bool(segmento) and segmento.upper().strip() == NOME_PASTA_VIDEOS.upper().strip()


# Função Objetivo: True quando `local` é "Videos/" (direto) OU
# "Videos/usados/" (arquivado) — os 2 únicos lugares onde um arquivo conta
# como parte válida da estrutura pra Plan 1/2. Qualquer outro local (raiz
# do EAN, raiz da marca, ou qualquer outra subpasta dentro de "Videos"
# diferente de "usados") é "arquivo fora do lugar esperado" (Plan 2).
# REVISADO em 26/08/2026 — antes ("_esta_diretamente_na_pasta_videos")
# "usados/" NÃO contava; agora conta, desde que o nome do arquivo esteja
# correto (decisão do usuário: não validamos mais o TIPO do arquivo).
def _eh_local_valido_para_arquivo(local: str) -> bool:
    segmento = _primeiro_segmento_do_caminho(local)
    if not _eh_segmento_pasta_videos(segmento):
        return False
    return local == f'{segmento}/' or local == f'{segmento}/{NOME_PASTA_USADOS}/'


def _pasta_videos_existe_no_grupo(itens_do_grupo: list) -> bool:
    return any(_eh_segmento_pasta_videos(_primeiro_segmento_do_caminho(item.local)) for item in itens_do_grupo)


def _validar_pasta_videos_por_produto(itens: list) -> dict:
    grupos = defaultdict(list)
    for item in itens:
        grupos[(item.marca, item.ean)].append(item)
    return {par: _pasta_videos_existe_no_grupo(itens_do_grupo) for par, itens_do_grupo in grupos.items()}


# Função Objetivo: True quando a pasta do EAN existe no Drive mas está 100%
# vazia (nem "Videos" foi criada) — usado só pra escolher o texto do
# "Motivo" dentro do Plan 2 (distinguir de "pasta(s) criadas mas sem
# arquivo real", ex: "Videos" criada mas vazia).
def _eh_ean_completamente_vazio(itens_do_produto: list) -> bool:
    return (
        len(itens_do_produto) == 1
        and itens_do_produto[0].local == MARCADOR_RAIZ_DO_EAN
        and itens_do_produto[0].nome == MARCADOR_PASTA_VAZIA
    )


# ============================================================
# Classificação por produto — Plan 1/2/3 (ver explicação no cabeçalho).
# ============================================================

# Função Objetivo: Decide o Plan (1/2/3) de 1 produto do banco, cruzando
# com o que foi achado no Drive pelo mesmo EAN. NÃO valida o TIPO do
# arquivo (vídeo real x roteiro x já usado) — só se está sendo trabalhado
# (tem pelo menos 1 arquivo real, em local válido) e se a nomenclatura
# desse arquivo está correta.
def _classificar_estrutura_produto(marca_db: str, ean_db: str, itens_por_ean: dict, marcas_validas: set) -> ClassificacaoProduto:
    itens_do_produto = itens_por_ean.get(ean_db.strip(), [])

    # Plan 3 — a pasta do EAN nunca foi criada no Drive.
    if not itens_do_produto:
        return ClassificacaoProduto(marca_db, ean_db, 3, MOTIVO_EAN_NAO_ENCONTRADO)

    arquivos_reais = [item for item in itens_do_produto if item.nome != MARCADOR_PASTA_VAZIA]

    # Plan 2 — a(s) pasta(s) do EAN existem, mas nenhum arquivo real dentro.
    if not arquivos_reais:
        if _eh_ean_completamente_vazio(itens_do_produto):
            return ClassificacaoProduto(marca_db, ean_db, 2, MOTIVO_PASTA_EAN_VAZIA)
        return ClassificacaoProduto(marca_db, ean_db, 2, MOTIVO_SEM_ARQUIVO_REAL)

    # A partir daqui, tem pelo menos 1 arquivo real — checa cada tipo de
    # inconsistência, na ordem de prioridade descrita no cabeçalho.
    marcas_encontradas = {item.marca for item in itens_do_produto}
    if len(marcas_encontradas) > 1:
        return ClassificacaoProduto(marca_db, ean_db, 2, MOTIVO_EAN_DUPLICADO_EM_MARCAS)

    if not all(_marca_valida(item.marca, marcas_validas) == 'Sim' for item in itens_do_produto):
        return ClassificacaoProduto(marca_db, ean_db, 2, MOTIVO_MARCA_INVALIDA)

    if any(not _eh_local_valido_para_arquivo(item.local) for item in arquivos_reais):
        return ClassificacaoProduto(marca_db, ean_db, 2, MOTIVO_LOCAL_INVALIDO)

    if any(not _nome_de_arquivo_valido(item.nome) for item in arquivos_reais):
        return ClassificacaoProduto(marca_db, ean_db, 2, MOTIVO_NOME_INVALIDO)

    # Plan 1 — tem arquivo real, todos no lugar certo e com nome válido.
    return ClassificacaoProduto(marca_db, ean_db, 1, MOTIVO_ESTRUTURA_VALIDA)


# ============================================================
# Banco — 1 única consulta.
# ============================================================

# Função Objetivo: Consulta o banco DA EMPRESA PASSADA 1 única vez —
# devolve a lista completa de (marca, ean) ativos + os 2 `set` normalizados
# usados pelas checagens "Marca Válida"/"EAN Válido" da planilha detalhada.
# REVISADO em 26/08/2026 — antes era fixo em EMPRESA_MAGAZINE; agora
# recebe a empresa (EMPRESA_MAGAZINE ou EMPRESA_SAMVALE) como parâmetro,
# pra poder rodar pras 2.
def _buscar_produtos_ativos(empresa: str) -> tuple:
    definir_empresa_ativa(empresa)
    produtos_brutos = Produto.objects.filter(ativo_no_erp=True).values_list('marca', 'ean')
    produtos = [(marca or '(sem marca cadastrada)', ean) for marca, ean in produtos_brutos]

    marcas_validas = {marca.upper().strip() for marca, _ in produtos}
    eans_validos = {ean.strip() for _, ean in produtos}
    return produtos, marcas_validas, eans_validos


# ============================================================
# Planilha detalhada (por arquivo) — sem mudança.
# ============================================================

def _montar_linhas_com_espacamento(
    itens: list, validacao_pasta_videos: dict, marcas_validas: set, eans_validos: set,
    filtrar_por_marca: Optional[str] = None,
) -> list:
    itens_ordenados = sorted(itens, key=lambda i: (i.marca, i.ean, i.local, i.nome))

    linhas = []
    par_anterior = None
    for item in itens_ordenados:
        if filtrar_por_marca and item.marca != filtrar_por_marca:
            continue
        par_atual = (item.marca, item.ean)
        if par_anterior is not None and par_atual != par_anterior:
            linhas.append([])
        par_anterior = par_atual

        pasta_videos_valida = '-' if item.ean == MARCADOR_FORA_DE_EAN else ('Sim' if validacao_pasta_videos.get(par_atual, False) else 'Não')
        linhas.append([
            item.marca, item.ean, item.local, item.nome,
            _marca_valida(item.marca, marcas_validas),
            _ean_valido(item.ean, eans_validos),
            pasta_videos_valida,
            _validar_nome(item.nome),
        ])
    return linhas


def _escrever_aba_detalhe(wb, titulo_aba: str, linhas: list, aviso_texto: str) -> Worksheet:
    ws = wb.create_sheet(_sanitizar_nome_de_aba(titulo_aba))
    _escrever_aviso(ws, len(CABECALHO_DETALHE), aviso_texto)
    ws.append(CABECALHO_DETALHE)
    _estilizar_cabecalho(ws, linha=2, quantidade_colunas=len(CABECALHO_DETALHE))
    _ajustar_largura_colunas(ws, LARGURAS_DETALHE)

    for linha in linhas:
        ws.append(linha)
        if not linha:
            continue
        numero_da_linha = ws.max_row
        for indice_coluna in COLUNAS_DE_VALIDACAO_DETALHE:
            valor = linha[indice_coluna - 1]
            ws.cell(row=numero_da_linha, column=indice_coluna).fill = PatternFill('solid', fgColor=_cor_para_valor_validacao(valor))
    return ws


# ============================================================
# Planilhas por Plan (1/2/3) — 1 único formato pros 3, só muda a cor e o
# conjunto de classificações.
# ============================================================

def _escrever_aba_classificacao(wb, titulo_aba: str, classificacoes: list, cor_da_planilha: str, aviso_texto: str) -> Worksheet:
    ws = wb.create_sheet(_sanitizar_nome_de_aba(titulo_aba))
    _escrever_aviso(ws, len(CABECALHO_CLASSIFICACAO), aviso_texto)
    ws.append(CABECALHO_CLASSIFICACAO)
    _estilizar_cabecalho(ws, linha=2, quantidade_colunas=len(CABECALHO_CLASSIFICACAO))
    _ajustar_largura_colunas(ws, LARGURAS_CLASSIFICACAO)

    for classificacao in sorted(classificacoes, key=lambda c: (c.marca, c.ean)):
        ws.append([classificacao.marca, classificacao.ean, classificacao.motivo])
        ws.cell(row=ws.max_row, column=3).fill = PatternFill('solid', fgColor=cor_da_planilha)
    return ws


def _gerar_planilha_por_plano(classificacoes: list, marcas: list, cor_da_planilha: str, caminho_saida: str, aviso_texto: str) -> None:
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    _escrever_aba_classificacao(wb, 'Geral', classificacoes, cor_da_planilha, aviso_texto)
    for marca in marcas:
        classificacoes_da_marca = [c for c in classificacoes if c.marca == marca]
        if classificacoes_da_marca:
            _escrever_aba_classificacao(wb, marca, classificacoes_da_marca, cor_da_planilha, aviso_texto)
    wb.save(caminho_saida)


# ============================================================
# Orquestração — com feedback de progresso em cada etapa.
# ============================================================

def gerar_todas_as_planilhas(empresa: str) -> None:
    nome_saida = NOME_PASTA_SAIDA_POR_EMPRESA[empresa]
    raiz_id = settings.GOOGLE_DRIVE_PASTA_RAIZ_MAGAZINE if empresa == EMPRESA_MAGAZINE else settings.GOOGLE_DRIVE_PASTA_RAIZ_SAMVALE

    pasta_saida = os.path.join(PASTA_RELATORIOS_BASE, nome_saida)
    os.makedirs(pasta_saida, exist_ok=True)

    print(f'Iniciando {nome_saida.upper()} (Drive completo + banco + 4 planilhas)...')

    print(f'Etapa 1/6 — buscando lista completa de itens do Drive ({nome_saida})... pode levar alguns segundos.')
    servico = obter_servico_drive()
    todos_os_itens = _listar_tudo_paginado(servico)
    print(f'  -> {len(todos_os_itens)} item(ns) bruto(s) recebido(s) do Drive.')

    print('Etapa 2/6 — organizando a árvore (marca -> EAN -> arquivos)...')
    itens = _montar_itens_do_drive(todos_os_itens, raiz_id)
    marcas_encontradas_drive = sorted({item.marca for item in itens if item.marca != MARCADOR_FORA_DE_MARCA})
    print(f'  -> {len(itens)} linha(s) de inventário montadas, {len(marcas_encontradas_drive)} marca(s) encontradas no Drive.')

    print(f'Etapa 3/6 — consultando o banco (produtos ativos da {nome_saida})...')
    produtos_ativos, marcas_validas, eans_validos = _buscar_produtos_ativos(empresa)
    print(f'  -> {len(produtos_ativos)} produto(s) ativo(s) encontrados no banco.')

    print('Etapa 4/6 — calculando validações (Pasta Videos, Nome, Marca, EAN) pra planilha detalhada...')
    validacao_pasta_videos = _validar_pasta_videos_por_produto(itens)

    print('Etapa 5/6 — classificando cada produto do banco (Plan 1/2/3)...')
    itens_por_ean = defaultdict(list)
    for item in itens:
        if item.ean != MARCADOR_FORA_DE_EAN:
            itens_por_ean[item.ean.strip()].append(item)

    classificacoes = [_classificar_estrutura_produto(marca, ean, itens_por_ean, marcas_validas) for marca, ean in produtos_ativos]
    contagem_por_plano = Counter(c.plano for c in classificacoes)
    print(
        f'  -> Plan 1 (estrutura válida): {contagem_por_plano[1]} | '
        f'Plan 2 (com problemas de estrutura): {contagem_por_plano[2]} | '
        f'Plan 3 (fora do Drive): {contagem_por_plano[3]}'
    )

    print(f'Etapa 6/6 — gerando as planilhas em "{pasta_saida}"...')
    marcas_db = sorted({marca for marca, _ in produtos_ativos})

    print('  -> Planilha detalhada (inventario_drive.xlsx)...')
    aviso_detalhado = (
        f'Inventário do Drive ({nome_saida}) + validação completa (Marca, EAN, Pasta Videos, Nome de arquivo). '
        f'Gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}.'
    )
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    _escrever_aba_detalhe(wb, 'Geral', _montar_linhas_com_espacamento(itens, validacao_pasta_videos, marcas_validas, eans_validos), aviso_detalhado)
    for marca in marcas_encontradas_drive:
        linhas_da_marca = _montar_linhas_com_espacamento(itens, validacao_pasta_videos, marcas_validas, eans_validos, filtrar_por_marca=marca)
        _escrever_aba_detalhe(wb, marca, linhas_da_marca, aviso_detalhado)
    wb.save(os.path.join(pasta_saida, 'inventario_drive.xlsx'))

    planilhas_por_plano = [
        (1, 'produtos_1_estrutura_valida.xlsx', COR_VALIDO,
         'Plan 1 — Produto está sendo trabalhado no Drive, com estrutura e nomenclatura corretas.'),
        (2, 'produtos_2_problemas_de_estrutura.xlsx', COR_INVALIDO,
         'Plan 2 — Produto está sendo trabalhado no Drive, mas com algum problema de estrutura '
         '(pasta vazia/fantasma, nome errado, arquivo fora do lugar, marca inválida, ou EAN duplicado em mais de 1 marca).'),
        (3, 'produtos_3_fora_do_drive.xlsx', COR_INVALIDO,
         'Plan 3 — Produto NÃO está sendo trabalhado no Drive; a pasta do EAN nunca foi criada.'),
    ]
    for numero_plano, nome_arquivo, cor_da_planilha, aviso_texto in planilhas_por_plano:
        print(f'  -> Planilha do Plan {numero_plano} ({nome_arquivo})...')
        classificacoes_deste_plano = [c for c in classificacoes if c.plano == numero_plano]
        aviso_completo = f'{aviso_texto} Gerado em {datetime.now().strftime("%d/%m/%Y %H:%M")}.'
        _gerar_planilha_por_plano(classificacoes_deste_plano, marcas_db, cor_da_planilha, os.path.join(pasta_saida, nome_arquivo), aviso_completo)

    print(f'Concluído {nome_saida.upper()} — 4 planilha(s) geradas em "{pasta_saida}".')


EMPRESAS_EXECUTAVEIS_POR_ARGUMENTO = {
    'magazine': EMPRESA_MAGAZINE,
    'samvale': EMPRESA_SAMVALE,
}

if __name__ == '__main__':
    argumento = sys.argv[1].strip().lower() if len(sys.argv) > 1 else None

    if argumento is None:
        empresas_a_rodar = [EMPRESA_MAGAZINE, EMPRESA_SAMVALE]
    elif argumento in EMPRESAS_EXECUTAVEIS_POR_ARGUMENTO:
        empresas_a_rodar = [EMPRESAS_EXECUTAVEIS_POR_ARGUMENTO[argumento]]
    else:
        raise SystemExit(f'Empresa inválida: "{sys.argv[1]}". Use "magazine", "samvale", ou nenhum argumento pra rodar as 2.')

    for empresa in empresas_a_rodar:
        gerar_todas_as_planilhas(empresa)
```

### Status atual (26/08/2026, 08:40) — PAUSADO, aguardando feedback

Usuário confirmou: *"Ok executei e funcionou, olhando rapidamente não encontrei erros, a equipe esta trabalhando com esses arquivos, e validando."* Depois: *"Vamos considerar um assunto pausado e aguardando feedback."* A equipe está usando as 4 planilhas de cada empresa na prática — o assunto fica pausado até a validação deles trazer algum ajuste necessário, ou até o usuário retomar por conta própria.

### Em aberto

- **Commit/push do script pro repositório** — hoje ele só existe nesta nota e na conversa; não está no GitHub. Não foi commitado porque não houve pedido explícito nesta conversa (ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]).
- **Aguardar o feedback real da equipe** usando as planilhas — pode gerar ajuste na regra do Plan 2 (ex: a ordem de prioridade dos motivos, ou os 2 critérios mantidos sem recontestação: marca válida e EAN não duplicado em marcas).
- Confirmar se `GOOGLE_DRIVE_PASTA_RAIZ_SAMVALE` está mesmo preenchido no `.env` de produção — assumido que sim, já que a execução da Samvale não deu erro, mas não foi checado o conteúdo/número de produtos da Samvale especificamente nesta sessão.

## Relacionado

- [[Convencao de Nomenclatura de Arquivos no Drive]]
- [[Badge de Aviso Para Arquivos Inconsistentes no Drive]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Perguntas Sempre em Texto Corrido]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
