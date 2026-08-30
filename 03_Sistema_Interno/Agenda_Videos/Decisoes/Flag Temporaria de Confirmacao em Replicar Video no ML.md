---
tipo: decisao
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 06/08/2026 16:10
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Percentual de Replicacao por Produto e Geral, Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]
---

# Flag Temporária de Confirmação em replicar_video_no_ml()

## ⚠️ Estado: DECIDIDO E ENTREGUE EM TEXTO, MAS AINDA NÃO APLICADO

Esta nota existe pra guardar o código de verdade, não só a decisão — se a conversa que gerou isso se perder, o trabalho de desenhar o diff não se perde junto. Usuário ainda não confirmou ter aplicado nenhum dos 3 blocos abaixo nem criado o script novo. **Não marcar como concluído até o usuário confirmar com resultado real (rodou o script, viu o mouse parar no botão).**

## Objetivo

`replicar_video_no_ml()` (`agente_local/replicacao_ml.py`) clicava de verdade em "Escolher anúncios" (decisão de 30/07 — diferente da Postagem, que sempre parava antes do clique final). Isso passou a conflitar com a instrução nova do usuário (05/08): "não podemos clicar no botão verdadeiro de postar/replicar, apenas fazer o caminho e parar o mouse em cima do botão." Resolução escolhida pelo usuário: **"Adiciono uma flag temporária"** — mesmo padrão que `postagem_ml.py` já usa (parâmetro que, por padrão, para antes do clique final e só posiciona o mouse).

## As 3 mudanças de código (nenhuma aplicada ainda)

### 1. `agente_local/replicacao_ml.py` — topo do arquivo (comentário + import)

**Localize:**
```python
# agente_local/replicacao_ml.py

# Função Objetivo: Automação real de Replicação no Mercado Livre — abre a
# tela de "Meus Clips" filtrada pelo MLB já postado, acha o clip mais
# recente, clica "Mostrar em outros anúncios", busca e marca cada MLB irmão
# (por MLB exato, nunca por texto/SKU — garante 100% de acerto e
# rastreabilidade, decisão já validada em sessão anterior), e clica de
# verdade em "Escolher anúncios" pra confirmar a replicação (30/07, decisão
# explícita do usuário — diferente da Postagem, que continua parando antes
# de publicar; aqui a Replicação vai até o fim sozinha).

import time
import win32gui
from pywinauto import Application
from pywinauto.keyboard import send_keys
```

**Substitua por:**
```python
# agente_local/replicacao_ml.py

# Função Objetivo: Automação real de Replicação no Mercado Livre — abre a
# tela de "Meus Clips" filtrada pelo MLB já postado, acha o clip mais
# recente, clica "Mostrar em outros anúncios", e busca e marca cada MLB irmão
# (por MLB exato, nunca por texto/SKU — garante 100% de acerto e
# rastreabilidade, decisão já validada em sessão anterior).
# * [FLAG TEMPORÁRIA, 06/08] → a decisão de 30/07 era clicar de verdade em
#   "Escolher anúncios" (diferente da Postagem, que sempre parava antes).
#   Suspensa enquanto a Replicação Automática ainda está em fase de teste —
#   agora tem o MESMO comportamento seguro da Postagem por padrão
#   (confirmar_de_verdade=False, nunca clica), via a mesma função
#   compartilhada posicionar_mouse_com_seguranca(). O fluxo automático real
#   (servidor_agente.py) passa confirmar_de_verdade=True explícito, pra não
#   mudar o comportamento em produção — a flag existe só pra permitir os
#   testes manuais de dry-run sem tocar no fluxo real.

import time
import win32gui
from pywinauto import Application
from pywinauto.keyboard import send_keys
from agente_local.posicionar_mouse_com_seguranca import posicionar_mouse_com_seguranca
```

### 2. `agente_local/replicacao_ml.py` — assinatura da função

**Localize:**
```python
def replicar_video_no_ml(mlb, outros_mlbs, janela_handle):
```

**Substitua por:**
```python
def replicar_video_no_ml(mlb, outros_mlbs, janela_handle, confirmar_de_verdade=False):
```

### 3. `agente_local/replicacao_ml.py` — bloco do clique final

**Localize:**
```python
    # * [EXPLICAÇÃO] → Clique REAL (30/07, decisão explícita do usuário) —
    #                  diferente da Postagem (que continua parando antes de
    #                  publicar, confirmação humana), a Replicação agora vai
    #                  até o fim sozinha. click_input() é clique real
    #                  (isTrusted=True), mesmo padrão já usado em todo o
    #                  resto deste arquivo — nada de sintético.
    _log('Clicando em "Escolher anúncios"...')
    botao_escolher.click_input()
    time.sleep(1)
    _log(f'Replicação confirmada de verdade no Mercado Livre — {len(marcados)} MLB(s): {marcados}')

    mensagem = None
    if nao_encontrados:
        mensagem = f'{len(marcados)} de {len(outros_mlbs)} marcado(s) — não encontrados: {nao_encontrados}'
    return True, mensagem, marcados, nao_encontrados
```

**Substitua por:**
```python
    # * [EXPLICAÇÃO] → PARA AQUI DE PROPÓSITO por padrão — mesma decisão da
    #                  Postagem: os MLBs já foram marcados (estado real na
    #                  tela), mas a confirmação final fica pra um humano,
    #                  enquanto confirmar_de_verdade não for True explícito.
    if not confirmar_de_verdade:
        if not posicionar_mouse_com_seguranca(botao_escolher, _log):
            return True, 'Anúncios marcados, mas não consegui confirmar a posição do botão na tela.', marcados, nao_encontrados
        _log(f'Parando ANTES do clique final, de propósito (dry-run) — mouse sobre "Escolher anúncios". Marcados: {marcados}')
        return True, None, marcados, nao_encontrados

    # * [EXPLICAÇÃO] → Clique REAL (30/07, decisão explícita do usuário,
    #                  reativada aqui via confirmar_de_verdade=True) —
    #                  click_input() é clique real (isTrusted=True), mesmo
    #                  padrão já usado em todo o resto deste arquivo.
    _log('Clicando em "Escolher anúncios"...')
    botao_escolher.click_input()
    time.sleep(1)
    _log(f'Replicação confirmada de verdade no Mercado Livre — {len(marcados)} MLB(s): {marcados}')

    mensagem = None
    if nao_encontrados:
        mensagem = f'{len(marcados)} de {len(outros_mlbs)} marcado(s) — não encontrados: {nao_encontrados}'
    return True, mensagem, marcados, nao_encontrados
```

### 4. `agente_local/servidor_agente.py` — chamada real (fluxo automático de verdade)

**Localize:**
```python
            sucesso, mensagem_erro, marcados, nao_encontrados = replicar_video_no_ml(
                item['mlb'], item['outros_mlbs'], controle.janela_referencia,
            )
```

**Substitua por:**
```python
            sucesso, mensagem_erro, marcados, nao_encontrados = replicar_video_no_ml(
                item['mlb'], item['outros_mlbs'], controle.janela_referencia,
                confirmar_de_verdade=True,  # * fluxo automático real (30/07) — comportamento sem mudança
            )
```

## Arquivo novo completo (ainda não criado): `scripts_dev/testar_fluxo_real_replicacao_sem_clicar.py`

Gêmeo de `scripts_dev/testar_fluxo_real_ml_sem_clicar.py` (versão de Postagem, esse sim já existe e está commitado — ver [[Checkpoint Testes Automatizados Agenda Videos]]). Roda manualmente (nunca pytest), fora deste vault — precisa do navegador real focado no Mercado Livre.

```python
# scripts_dev/testar_fluxo_real_replicacao_sem_clicar.py

# Função Objetivo: Valida o fluxo real de Replicação — automação real no
# navegador, marcando os MLBs irmãos de verdade — SEM confirmar de verdade
# no fim (replicar_video_no_ml chamada com confirmar_de_verdade=False, a
# flag temporária que suspende a decisão de 30/07 de clicar sozinho).
# Rodar manualmente (nunca dentro do pytest): precisa do navegador aberto e
# focado no Mercado Livre na hora certa. Sucesso é confirmado visualmente
# (mouse posicionado sobre "Escolher anúncios"), não por assert. Gêmeo de
# testar_fluxo_real_ml_sem_clicar.py (versão de Postagem).

import os
import sys


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

import time

import win32gui

from produtos.models import Produto
from mercado_livre.models import VariacaoAnuncioMercadoLivre
from agenda_videos.funcoes_auxiliares.postagem_automatica.orquestrador import obter_mlb_do_produto
from agente_local.replicacao_ml import replicar_video_no_ml

# ==== CONFIGURA AQUI ANTES DE RODAR ====
EAN_PRODUTO_TESTE = '0789888395162'  # QUIMIVIDA — troque se precisar
# ========================================

produto = Produto.objects.filter(ean=EAN_PRODUTO_TESTE).first()
if produto is None:
    raise RuntimeError(f'Produto {EAN_PRODUTO_TESTE} não encontrado no banco.')

mlb = obter_mlb_do_produto(produto)
if mlb is None:
    raise RuntimeError(f'Produto {EAN_PRODUTO_TESTE} não tem MLB vinculado (VariacaoAnuncioMercadoLivre).')

# * [EXPLICAÇÃO] → Mesma query de api/replicacao_automatica/views.py
#                  (_obter_outros_mlbs) — ainda não é função compartilhada
#                  (ver Percentual de Replicação, item pausado), por isso
#                  repetida aqui em vez de importada.
outros_mlbs = sorted(set(
    VariacaoAnuncioMercadoLivre.objects.filter(produto=produto)
    .exclude(anuncio__mlb=mlb)
    .values_list('anuncio__mlb', flat=True)
    .distinct()
))

print(f'Produto: {produto.titulo} (EAN {produto.ean})')
print(f'MLB já postado: {mlb}')
print(f'Outros MLBs (irmãos) a replicar: {outros_mlbs}\n')

if not outros_mlbs:
    raise RuntimeError(f'Produto {EAN_PRODUTO_TESTE} não tem nenhum outro MLB pra replicar — nada a testar.')

print('=== Automação no navegador (SEM confirmar de verdade) ===')
input('Deixe o Chrome/Edge focado no Mercado Livre, na tela do clip já postado, e pressione ENTER pra continuar...')
print('Você tem 5 segundos pra confirmar o foco na janela certa...')
time.sleep(5)
janela_handle = win32gui.GetForegroundWindow()
print(f'Janela capturada: "{win32gui.GetWindowText(janela_handle)}" (handle={janela_handle})\n')

sucesso, mensagem_erro, marcados, nao_encontrados = replicar_video_no_ml(
    mlb, outros_mlbs, janela_handle, confirmar_de_verdade=False,
)

print('\n=== Resultado ===')
print(f'sucesso={sucesso}')
print(f'mensagem={mensagem_erro}')
print(f'marcados={marcados}')
print(f'nao_encontrados={nao_encontrados}')
if sucesso:
    print('\nO mouse deve estar posicionado sobre o botão "Escolher anúncios".')
    print('CONFIRME NA TELA — e NÃO clique, a menos que queira confirmar a replicação de verdade.')
```

## Sequência planejada depois de aplicar (ainda não feita)

1. Usuário aplica os 4 blocos de diff acima em `replicacao_ml.py`/`servidor_agente.py` e cria o script novo.
2. Roda `scripts_dev/testar_fluxo_real_ml_sem_clicar.py` (Postagem, já existe) primeiro.
3. Roda `scripts_dev/testar_fluxo_real_replicacao_sem_clicar.py` (Replicação, novo) depois.
4. Com as 2 telas reais vistas de novo (o usuário não lembra o estado atual delas, faz tempo que não usa), volta pra decidir onde exibir o percentual de replicação — ver [[Percentual de Replicacao por Produto e Geral]].

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Percentual de Replicacao por Produto e Geral]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
