---
tipo: decisao
dominio: 
status: resolvida
criado: 21/08/2026
atualizado_em: 21/08/2026 16:55
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Reducao de Comandos de Management e Rotina Vira Botao, Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local)]
---

# Barra de Progresso Real no "Sincronizar com o Drive" do Portal via Thread e Polling

## O quê

O botão "Sincronizar com o Drive" do Portal do Drive passou a mostrar uma barra de progresso real, com etapa e percentual, em vez de deixar a tela parada e sem nenhum feedback até a página inteira recarregar no final.

## Por quê

Depois de considerar a frente visual/funcional do Portal do Drive encerrada (ver "Atualização 20/08/2026, 22h30" em [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]), o usuário trouxe 1 último incômodo, nas próprias palavras: *"o botão de 'Sincronizar com o drive' meio que 'congela' a tela e não da feedback pro usuario, eu gostaria que tivesse uma barra de progresso."* Diferente das mudanças estéticas encerradas em 20/08, este é um defeito real de UX (ausência de feedback numa operação longa) — dentro da política já fechada de só tocar aparência por bug/erro real, não por gosto.

## Pra quê

A operação varre o Drive inteiro e depois atualiza no banco o snapshot de cada 1 dos +1200 produtos ativos do catálogo — facilmente vários segundos, às vezes mais de 1 minuto, num `<form>` comum (POST síncrono, sem HTMX/AJAX). O navegador ficava parado o tempo todo, sem nenhum spinner, sem nenhuma indicação de progresso, dando a impressão de tela travada/quebrada.

## Como

### Arquitetura: reaproveita o padrão já decidido, primeira aplicação real dele

A solução segue o padrão já fechado em [[Reducao de Comandos de Management e Rotina Vira Botao]] (15/08/2026) pra "rotina real virar botão": thread em background + endpoint de status consultado por polling, sem Celery/fila de tarefa. Esta é a **primeira implementação de verdade** desse padrão dentro do Django do projeto (o precedente mencionado naquela decisão era o `agente_local/servidor_agente.py`, que é Flask, não Django) — o achado de arquitetura registrado em [[Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local)]] é direto resultado dessa primeira aplicação real, e vale pra qualquer botão futuro que use o mesmo padrão (`popular_banco`, `sincronizar_impostos_entrada`, já citados como candidatos naquela nota).

O estado do progresso fica guardado com `django.core.cache` (chave fixa `portal_drive_sincronizacao_status`) — mesmo mecanismo já usado em `precificacao/views/exportacao_precos.py`, sem introduzir nenhuma peça nova de infraestrutura. Só funciona porque o Django roda num processo único (`runserver`) — se um dia for multi-worker em produção, precisaria de um cache compartilhado de verdade (Redis), não é o caso agora.

### callback_progresso — 3 fases reais, 2 delas com percentual de verdade

`sincronizar_snapshots_drive()`/`verificar_todos_no_drive()` (`agenda_videos/funcoes_auxiliares/drive/`) ganharam um parâmetro opcional `callback_progresso(etapa, processados, total)`, chamado em 3 momentos diferentes, sem mudar nada pra quem chama sem esse parâmetro (comando de management, teste):

1. `lendo_drive` — varredura da árvore inteira do Drive (algumas chamadas grandes, paginadas). Sem total conhecido de antemão → barra indeterminada.
2. `atualizando_produtos` — 1 chamada por produto ativo do catálogo, total conhecido desde o início (`len(produtos_ativos)`) → percentual real, ex: "Atualizando produtos: 340 de 1284".
3. `avancando_roadmap` — avanço de etapa (Base/Roteiro/Completo) só pros produtos que a varredura encontrou — total conhecido, normalmente pequeno/rápido.

### Fluxo completo

Clique no botão (depois do `confirm()`, que continua existindo por decisão do usuário) → JS intercepta o submit, desabilita o botão (troca visual padrão/carregando, mesmo espírito de `.agenda-verificar-drive-toggle`/`.portal-drive-btn-confirmar-exclusao` já usados na tela) e dispara um `fetch()` pro mesmo endpoint do form → a view (`view_portal_drive_sincronizar`) só grava o estado inicial no cache, dispara a thread e responde na hora (nunca mais espera a sincronização terminar) → o navegador consulta `view_portal_drive_sincronizar_status` (endpoint novo, GET, só leitura) a cada 1s e atualiza a barra (reaproveitando visualmente `.portal-drive-progresso`/`.portal-drive-progresso-barra`, já usados no envio de arquivo em lote) → quando o status vira `concluido` ou `erro`, o JS recarrega a página, e é só nesse próximo GET que a mensagem final de verdade aparece (`messages.success/info/warning`, texto idêntico ao que já existia antes da mudança) — porque dentro da thread, sem request/response, não tem como chamar `messages.*` direto.

### Robustez

`_rodar_sincronizacao_portal_drive_em_thread()` envolve a chamada real inteira num `try/except Exception` com `traceback.print_exc()` — mantido de propósito, não é só diagnóstico pontual: uma thread em background que falha em silêncio (sem nenhum rastro no terminal) é praticamente impossível de investigar depois. Foi exatamente esse `except` que mascarou o bug real de arquitetura achado no caminho (ver nota linkada) atrás de uma mensagem genérica de "não foi possível conectar ao Google Drive" — sem o `traceback.print_exc()`, a causa real nunca teria sido vista.

## Pendências

Nenhum teste automatizado novo foi escrito ainda pra `view_portal_drive_sincronizar`/`view_portal_drive_sincronizar_status` nem pro `callback_progresso` em si (só os 2 testes existentes que quebrariam com a mudança de assinatura foram corrigidos — fakes de `sincronizar_snapshots_drive` em `test_nivel_3__verificador.py` ajustados pra aceitar o parâmetro novo). Decidir com o usuário se vale escrever cobertura pra essa parte agora ou deixar pra depois.

## Estado real

Testado manualmente pelo usuário no navegador depois da correção do bug de arquitetura (ver nota linkada) — confirmado funcionando: *"Otimo funcionou."* Ainda não confirmado como commitado/pushado pelo usuário.

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Reducao de Comandos de Management e Rotina Vira Botao]]
- [[Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local)]]
