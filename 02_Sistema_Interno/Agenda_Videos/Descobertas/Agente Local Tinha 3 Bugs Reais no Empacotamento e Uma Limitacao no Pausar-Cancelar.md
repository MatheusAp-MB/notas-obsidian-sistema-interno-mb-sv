---
tipo: descoberta
dominio: 
status: ativa
criado: 13/08/2026
atualizado_em: 13/08/2026 12:00
relacionado: [Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra, Flag Temporaria de Confirmacao em Replicar Video no ML]
---

# Agente Local Tinha 3 Bugs Reais no Empacotamento e Uma Limitação no Pausar/Cancelar

Achado testando o `agente_local` empacotado como `.exe` (PyInstaller) pela primeira vez de verdade (13/08/2026) — não existia script de build nem `.spec` no repositório antes disso; o comando de build teve que ser derivado lendo o código real (imports de `pystray`/`PIL`/`flask`/`pywinauto`/`win32*`). 3 bugs reais apareceram em cadeia, cada um só visível depois do anterior corrigido, além de 1 limitação de arquitetura (não é bug, é comportamento existente nunca antes exercitado).

## Comando de build que funciona

```
pyinstaller --onefile --noconsole --name AgenteLocalAgendaVideos --paths . --hidden-import=win32timezone --hidden-import=pystray._win32 agente_local/servidor_agente.py
```

Saída: `dist/AgenteLocalAgendaVideos.exe`. Precisa rodar de novo depois de qualquer mudança em `agente_local/*.py`.

## Bug 1 — `_DuplicadorSaida` quebrava em build `--noconsole`

Erro: `AttributeError: 'NoneType' object has no attribute 'write'`, na primeira tentativa de rodar o `.exe`. Causa: em build `--noconsole`/`--windowed` (sem terminal anexado), o Windows deixa `sys.stdout`/`sys.stderr` como `None` — `_DuplicadorSaida.write()`/`.flush()` não tinham guarda pra esse caso, e tentavam chamar `.write()`/`.flush()` em `None`.

**Resolução:** adicionado `if self.saida_original is not None:` antes de cada chamada, nos 2 métodos. Rodando com console de verdade (dev), continua duplicando pros 2 lugares como antes.

## Bug 2 — CORS/config sem esquema `http://`

Sintoma: `"Não consegui avisar o programa local (agente)..."` no navegador, mesmo com o agente aberto, com token e servidor configurados. Causa: `agente_config.env` tinha `SERVIDOR=10.0.0.169:8000` (sem `http://`) — isso quebra o `flask_cors` (que faz match exato de origem, exige o esquema) **e** todas as chamadas de `cliente_api.py` que montam URL como `f'{servidor}/api/...'` (teria dado `MissingSchema` do `requests` também, não só CORS).

**Resolução:** correção só de configuração — `SERVIDOR=http://10.0.0.169:8000` (sem barra no fim), sem precisar recompilar o `.exe`.

## Bug 3 — `postagem_ml.py` buscava o botão de enviar antes dele existir

Sintoma: `Erro inesperado na automação: 'NoneType' object has no attribute 'is_enabled'`, em 3/3 produtos testados. Causa: `botao_enviar` era buscado 1 única vez, logo depois do Checkpoint 1 — **antes do upload** — quando o botão ainda nem existe na tela; sempre voltava `None`, e era usado depois (Checkpoint 3) sem nenhuma guarda de `None`.

**Resolução:** a busca do botão foi movida pra **dentro** do loop de espera do Checkpoint 3 (mesmo padrão já usado no Checkpoint 1 — rebusca a cada tentativa), com guarda explícita `is not None`. Depois de corrigido, apareceu 1 falha nova (30/30 tentativas sem achar o botão, ~48s, sem travar) — diagnóstico (lista de todos os botões reais da tela em caso de falha, mesmo padrão do Checkpoint 1) revelou o nome real: **"Enviar vídeo"** — nem "Enviar clip" nem "Anunciar" (os 2 nomes que já estavam na lista, provavelmente válidos em outra variação de idioma/tela). Adicionado à lista `NOMES_BOTAO_ENVIAR`, mantendo os 2 antigos.

## Achado (não é bug) — F8/F9 só interrompem ENTRE itens, nunca durante

Durante um teste, o usuário tentou pausar/cancelar (F8/F9) enquanto o Checkpoint 3 ainda estava rodando (30 tentativas, ~48s) — os toques ficaram registrados no log (`[TECLADO] ... rodando → pausado`, etc.), mas não tiveram efeito nenhum visível, dando a impressão de "travou". Confirmado lendo `controle_teclado.py` + `servidor_agente.py`: `controle.verificar_e_aguardar(aviso)` só é chamado **antes** de `postar_video_no_ml()`/`replicar_video_no_ml()`, nunca durante — uma vez que a automação de 1 produto começou, não tem como interromper até ela terminar (sucesso ou falha). F8/F9 só valem pro **próximo** item da fila. Isso não foi corrigido nesta sessão — é uma limitação de arquitetura conhecida agora, não resolvida.

## Relacionado

- [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]]
- [[Flag Temporaria de Confirmacao em Replicar Video no ML]]
