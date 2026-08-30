---
tipo: bug_conhecido
dominio: 
status: corrigido
criado: 21/08/2026
atualizado_em: 21/08/2026 16:55
relacionado: [Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling, Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao), Reducao de Comandos de Management e Rotina Vira Botao]
---

# Thread em Background Não Herda a Empresa Ativa do EmpresaMiddleware (Threading Local)

## O quê

A primeira sincronização real com o Drive pela nova barra de progresso (ver [[Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling]]) sempre falhava com uma mensagem genérica na tela ("Não foi possível conectar ao Google Drive agora — tente novamente em instantes"). A causa real só apareceu depois de adicionar log de erro de verdade (`traceback.print_exc()`) dentro do `except` que envolve a thread — sem isso, o erro real nunca teria sido visto. O traceback revelou um `RuntimeError`:

```
RuntimeError: obter_pasta_raiz_id_ativa() precisa saber a empresa (MAGAZINE/SAMVALE) — nenhuma empresa ativa encontrada. Rode dentro de uma sessão web com empresa escolhida, ou de um comando com --empresa=.
```

## Por quê

O sistema decide qual das 2 empresas (MAGAZINE/SAMVALE) está ativa usando `threading.local()` (`core/empresa.py`, funções `definir_empresa_ativa()`/`obter_empresa_ativa()`) — um armazenamento que existe **por thread**, nunca compartilhado entre threads diferentes, nem entre uma thread e as threads que ela mesma cria. Quem preenche esse armazenamento é o `EmpresaMiddleware` (`core/middleware.py`), lendo `request.session.get('empresa_ativa', EMPRESA_PADRAO)` — mas isso só acontece na thread que o Django usa pra atender aquela requisição HTTP específica.

Quando `view_portal_drive_sincronizar` passou a criar uma `threading.Thread` nova pra rodar a sincronização em segundo plano (ver nota linkada), essa thread nova **nasceu sem nenhuma empresa ativa** — o middleware nunca roda nela, porque ela não é uma requisição, é uma thread criada manualmente no meio do caminho. Qualquer código chamado de dentro dela que dependa de `obter_empresa_ativa()` encontra `None` — no caso, foi `obter_pasta_raiz_id_ativa()` (`agenda_videos/funcoes_auxiliares/drive/cliente.py`), responsável por escolher entre `GOOGLE_DRIVE_PASTA_TESTE_MAGAZINE`/`_SAMVALE`, que levantou o erro.

## Pra quê

Este achado importa muito além deste 1 bug específico: esta foi a **primeira vez** que o padrão "rotina vira botão" (thread em background + polling, decidido em [[Reducao de Comandos de Management e Rotina Vira Botao]]) foi implementado de verdade dentro do Django deste projeto — o único precedente até então era `agente_local/servidor_agente.py`, que é Flask, não Django, e nunca lida com roteamento de banco por empresa. Qualquer botão futuro que siga o mesmo padrão — os 2 já citados como candidatos naquela decisão, `popular_banco` e `sincronizar_impostos_entrada` — vai puxar dado roteado por empresa (`Produto`, impostos de entrada, etc.) de dentro de uma thread em background, e vai cair exatamente na mesma armadilha se não repetir esta correção. Documentar isso aqui evita reinvestigar do zero, e evita o mesmo bug se repetir silenciosamente (mascarado, como aconteceu aqui, por um `except Exception` genérico sem log).

## Como

A correção é capturar a empresa ativa ENQUANTO ainda se está na thread da requisição (onde o middleware já rodou de verdade) e passar esse valor como argumento explícito pra dentro da thread nova — a função que a thread executa chama `definir_empresa_ativa(empresa)` de novo como sua primeira linha, agora dentro do contexto da thread nova, antes de qualquer código que dependa disso.

```python
# Ainda na thread da requisição — obter_empresa_ativa() aqui é confiável,
# porque o EmpresaMiddleware já rodou pra esta requisição.
threading.Thread(
    target=_rodar_sincronizacao_portal_drive_em_thread,
    args=(obter_empresa_ativa(),),
    daemon=True,
).start()
```

```python
def _rodar_sincronizacao_portal_drive_em_thread(empresa):
    # Primeira linha, obrigatória: sem isso, qualquer chamada abaixo que
    # dependa da empresa ativa (leitura do Drive, consulta ao banco roteado)
    # encontra threading.local() vazio nesta thread nova.
    definir_empresa_ativa(empresa)
    ...
```

**Por que não simplesmente chamar `obter_empresa_ativa()` de dentro da própria thread nova?** Porque a essa altura já é tarde demais — a thread nova já está rodando com o próprio `threading.local()` vazio, isolado do da thread da requisição. A leitura precisa acontecer ANTES, do lado de fora, no único lugar onde o dado de verdade (setado pelo middleware) ainda está disponível.

## Estado real

Corrigido e confirmado pelo usuário testando manualmente no navegador — depois de reproduzir o erro, colar o traceback real, e testar de novo já com a correção aplicada: *"Otimo funcionou."* Ainda não confirmado como commitado/pushado.

## Relacionado

- [[Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling]]
- [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]
- [[Reducao de Comandos de Management e Rotina Vira Botao]]
