---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 20/09/2026
atualizado_em: 20/09/2026 18:49
relacionado: [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]], [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]], [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]], [[Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução]]
resumo: Matheus reportou um problema grave — o botão "Fazer varredura completa" sempre retornava 409 "Já existe uma varredura em andamento" na conta Samvale, nunca na Magazine, dando a impressão de que a chamada estava hardcoded só pra Magazine. Investigação descartou qualquer coisa fixa na cadeia de resolução de conta (CONTA_POR_EMPRESA, chamar_api, obter_token_valido, EmpresaRouter, a view que dispara a thread) — tudo genérico e correto. O log real do terminal mostrou um 409 limpo, sem traceback nenhum, apontando pra dentro do próprio código (guard atômico contra clique duplo em iniciar_varredura_mediacoes), não uma exceção Python. Diagnóstico confirmado empiricamente via shell do Django com .using('samvale'): a linha singleton pk=1 de StatusVarreduraMediacoes simplesmente não existia na base samvale — a tabela existia (criada pela migration 0020), mas a linha nunca foi semeada ali. Causa raiz: a migration 0020 semeia essa linha via RunPython, mas o Django só executa esse passo 1 vez por base — como a samvale já tinha a migration marcada como aplicada (schema criado) sem a linha ter sido semeada, rodar migrate de novo não resolvia, mesmo o launcher.py já rodando migrate nas 2 bases (magazine/samvale) a cada abertura do .exe. Matheus rejeitou a primeira correção proposta (rodar um comando pontual no shell do Django pra criar a linha manualmente) porque isso não resolve o problema de verdade — ele estava prestes a se afastar do projeto por ~2 semanas e o .exe da Ana precisa ser autossuficiente, sem depender de nenhum comando manual dele. Correção definitiva: adicionado StatusVarreduraMediacoes.objects.get_or_create(pk=1) no início de iniciar_varredura_mediacoes e iniciar_atualizacao_acompanhados, antes do guard atômico — garante a linha sozinha, sem depender de nenhuma migration ter semeado certo em nenhuma base, presente ou futura. Confirmado funcionando por Matheus.
---

# Varredura Completa Travada na Samvale — Linha Singleton de StatusVarreduraMediacoes Nunca Semeada e Fix Autossuficiente

## O problema reportado

Matheus reportou como "gravíssimo": o botão "Fazer varredura completa (6 meses)" simplesmente dava erro na conta Samvale — sempre, todas as vezes — enquanto na Magazine funcionava normalmente. A suspeita inicial dele: "tá até parecendo que ficou hardcoded a chamada apenas pra Magazine".

## Investigação da cadeia de resolução de conta — descartada

Antes de pedir qualquer log, foi conferida toda a cadeia que decide qual conta/API usar, direto no código real (`origin/main`, sincronizado via `git fetch`):

- `CONTA_POR_EMPRESA` (`integracao_mercado_livre/views.py`) mapeia `EMPRESA_MAGAZINE → 'MB'` e `EMPRESA_SAMVALE → 'SV'` sem nada fixo.
- A view que dispara a varredura (`iniciar_varredura_mediacoes`) captura `empresa = obter_empresa_ativa()` **antes** de abrir a thread e passa como argumento — padrão certo pra não deixar a thread nova herdar estado errado de `threading.local()`.
- `executar_varredura_completa(empresa)` chama `definir_empresa_ativa(empresa)` como primeira linha, e resolve `conta` a partir do parâmetro recebido — nada fixo em "MB".
- `chamar_api` exige `conta` como parâmetro obrigatório, sem valor padrão.
- `obter_token_valido(conta)` lê tudo do `.env` via prefixo genérico (`f"{conta}_ACCESS_TOKEN"` etc.).
- `EmpresaRouter` (roteador de banco) também não tem nada fixo.

Nenhum desses pontos explicava o sintoma — tudo estava genérico e correto.

## O log real revelou a natureza do erro

Matheus colou a saída do `python manage.py runserver`: a linha relevante era `Conflict: /mediacoes/varredura/iniciar/`, com resposta HTTP 409 — **sem nenhum traceback**. Isso apontou pra dentro do próprio código, não pra uma exceção Python:

```python
linhas = StatusVarreduraMediacoes.objects.filter(pk=1, rodando=False).update(...)
if not linhas:
    return JsonResponse({'erro': 'Já existe uma varredura em andamento.'}, status=409)
```

## Diagnóstico confirmado empiricamente

`StatusVarreduraMediacoes` é um singleton (sempre `pk=1`) roteado pelo `EmpresaRouter` — MB e SV têm cada um sua própria linha, em bancos físicos separados (`sistema_devolucao_magazine` vs `sistema_devolucao_samvale`). Rodado no shell do Django, direto na base samvale:

```python
StatusVarreduraMediacoes.objects.using('samvale').filter(pk=1).first()
```

Resultado: `None`. A tabela existia (senão teria dado erro de "tabela não existe"), mas a linha `pk=1` nunca foi criada ali.

## Causa raiz

A migration `0020_claim_mercado_livre_status_varredura_mediacoes.py` cria a tabela **e** semeia a linha via `RunPython` (`semear_status_varredura` → `get_or_create(pk=1)`). O Django só executa esse passo de semeadura 1 vez por base de dados — se uma base já tem essa migration marcada como aplicada (schema criado), rodar `migrate` de novo nela não repete o `RunPython`, mesmo que a linha tenha ficado faltando por qualquer motivo. A base samvale estava exatamente nesse estado. Isso acontecia mesmo com o `launcher.py` (usado pelo `.exe`) já rodando `migrate` nas 2 bases a cada abertura (`for alias in ("magazine", "samvale")`) — porque o Django simplesmente pulava a migration 0020 na samvale por já constar como aplicada.

## Por que a primeira correção proposta foi rejeitada

A primeira solução oferecida foi um comando pontual no shell do Django (`get_or_create(pk=1)` manual) pra criar a linha faltante. Matheus rejeitou: "não adianta eu ficar rodando linhas e linhas de código, pq se não o .exe não se torna autossuficiente" — ele estava a 1 dia de se afastar do projeto por ~2 semanas, e a Ana não tem como (nem deveria precisar) rodar comando nenhum no `.exe` dela.

## Correção definitiva — autossuficiente

Em vez de depender de migration ter semeado certo em toda base (presente ou futura, inclusive numa reinstalação nova do `.exe` na máquina da Ana), as duas views que disparam varredura passaram a garantir a linha sozinhas, na hora, antes do guard atômico:

```python
StatusVarreduraMediacoes.objects.get_or_create(pk=1)
```

Adicionado como primeira linha de código (depois da checagem de método POST) em `iniciar_varredura_mediacoes` e `iniciar_atualizacao_acompanhados`, em `devolucoes/views.py`. Não muda em nada o comportamento normal (a linha quase sempre já existe), mas se por qualquer motivo ela não existir numa base — hoje, no futuro, em qualquer instalação — o próprio clique no botão já resolve sozinho, sem exigir nenhum comando manual. Confirmado funcionando por Matheus na Samvale logo em seguida.
