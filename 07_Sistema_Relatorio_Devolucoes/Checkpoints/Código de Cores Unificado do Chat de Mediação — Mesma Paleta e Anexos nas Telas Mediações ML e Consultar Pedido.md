---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 20/09/2026
atualizado_em: 20/09/2026 19:05
relacionado: [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]], [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]], [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]], [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
resumo: Matheus pediu um código de cores consistente pro chat de mediação, já que as 2 telas que mostram a mesma conversa (painel de Mediações ML e Consultar Pedido/Hub de Consulta) tinham cores diferentes e sem padrão entre si — Mercado Livre ora rosa ora azul, Cliente ora sem cor nenhuma ora rosa, Você ora azul ora verde. Definida a paleta: Mercado Livre em amarelo/âmbar, Você em azul, Cliente em cinza — com pedido explícito de Matheus pra também colorir o avatar e o nome do remetente, "bem estilizado e bonito", não só a bolha da mensagem. A implementação centralizou os tokens de cor em layout_global.css (compartilhado pelas 2 telas) — --cor-papel-ml/-voce/-cliente-bg/-borda/-forte — reaproveitando cores que o sistema já tinha pros tons fortes de avatar/nome (--cor-alerta pro Mercado Livre, --cor-primaria-clara pro Você, --cor-texto-muted pro Cliente) em vez de inventar cor nova. Aplicados nas 2 folhas de estilo: layout_mediacoes_ml.css (que antes só coloria a bolha, ganhou cor no avatar e no rótulo também) e layout_consultar_pedido.css (trocou as 3 cores antigas incoerentes pelos tokens novos, no avatar, nome e bolha). Aproveitando que as 2 telas usam o mesmo endpoint de mensagens da claim, Matheus pediu pra estender também os ícones de anexo (feature implementada mais cedo hoje só no painel de Mediações ML) pra tela Consultar Pedido, que nunca teve isso. Portada a mesma lógica de _url_anexo_mensagem pra integracao_mercado_livre/views.py, com _construir_mensagens_mediacao passando a receber numero_pedido e extrair anexos de cada mensagem. Confirmado funcionando por Matheus com prints das 2 telas lado a lado, mesma paleta e ícones de anexo nas duas.
---

# Código de Cores Unificado do Chat de Mediação — Mesma Paleta e Anexos nas Telas Mediações ML e Consultar Pedido

## O problema — cores inconsistentes entre as 2 telas

O painel de Mediações ML e a tela Consultar Pedido (Hub de Consulta) mostram a mesma conversa (mesmos papéis: `ml`, `voce`, `cliente`, vindos do mesmo endpoint de mensagens), mas com cores completamente diferentes e sem nenhum padrão entre si:

| Papel | Mediações ML (antes) | Consultar Pedido (antes) |
|---|---|---|
| Mercado Livre | rosa `#fde8e8` | azul `#e9f2fa` |
| Você | azul `#e7f0fa` | verde `#e6f4ea` |
| Cliente | sem cor (branco padrão) | rosa `#f8e9f4` |

Matheus pediu uma paleta única: Mercado Livre em amarelo claro, Você em azul claro, Cliente em cinza claro — e, ao confirmar, pediu explicitamente pra colorir também o avatar e o nome do remetente, não só a bolha, "tudo bem estilizado e bem bonito".

## Paleta definida — tokens centralizados, reaproveitando cores já existentes

Em vez de hardcodar hex repetido nas 2 folhas de estilo, os tokens foram criados em `core/static/base_compartilhada/css/layout_global.css` (já compartilhado pelas 2 telas):

- `--cor-papel-ml-bg` / `--cor-papel-ml-borda` / `--cor-papel-ml-forte` — âmbar. O tom forte (avatar/nome) reaproveita `--cor-alerta`, que o sistema já tinha.
- `--cor-papel-voce-bg` / `--cor-papel-voce-borda` / `--cor-papel-voce-forte` — azul. O tom forte reaproveita `--cor-primaria-clara`, já usado no resto do sistema.
- `--cor-papel-cliente-bg` / `--cor-papel-cliente-borda` / `--cor-papel-cliente-forte` — cinza. O tom forte reaproveita `--cor-texto-muted`.

Só os 2 tons claros de cada bolha (`-bg`/`-borda`) são valores novos — os 3 tons "fortes" de avatar/nome são cores que o projeto já usava em outro lugar, mantendo a identidade visual coerente em vez de introduzir paleta nova do zero.

## Aplicação nas 2 telas

- **`layout_mediacoes_ml.css`** — antes só a bolha (`.med-msg-bolha`) tinha cor por papel; ganhou também `.med-msg--{papel} .med-msg-iniciais` (avatar) e `.med-msg--{papel} .med-msg-rotulo` (nome), usando os tokens novos.
- **`layout_consultar_pedido.css`** — `.consultar-pedido-chat-avatar--*`, `.consultar-pedido-chat-nome--*` e `.consultar-pedido-chat-bolha--*` trocaram os hex antigos (azul/rosa/verde, sem padrão nenhum) pelos tokens novos.

## Anexos estendidos pra Consultar Pedido

Como as 2 telas usam exatamente o mesmo endpoint de mensagens (`GET /post-purchase/v1/claims/{claim_id}/messages`), e o painel de Mediações ML já tinha ganhado ícones de anexo mais cedo hoje (ver [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]]), Matheus pediu pra estender o mesmo recurso pro Consultar Pedido, que nunca teve isso.

A função própria dessa tela (`_construir_mensagens_mediacao`, em `integracao_mercado_livre/views.py` — separada da `devolucoes/varredura_mediacoes.py`, mas com a mesma lógica de classificação de papel) ganhou uma cópia de `_url_anexo_mensagem` e passou a receber `numero_pedido` como parâmetro (já disponível no escopo da view que a chama), extraindo `anexos` de cada mensagem do mesmo jeito. Template `consultar_pedido.html` ganhou o mesmo bloco de ícones clicáveis (`fa-image`, abre em nova guia) já usado em `mediacoes_ml.html`.

## Resultado confirmado

Matheus testou e mandou prints das 2 telas lado a lado: mesma paleta (bolha amarela do Mercado Livre com avatar e nome âmbar, cliente em cinza) e os 5 ícones de anexo aparecendo tanto no painel de Mediações ML quanto na tela Consultar Pedido, pro mesmo pedido (`2000018002113866`).
