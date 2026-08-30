---
tipo: decisao
dominio: 
status: resolvida
criado: 20/08/2026
atualizado_em: 20/08/2026 16:31
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura, Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo, Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]
---

> [!warning] Superada em 20/08/2026, 16h31 — leitura ao vivo e pasta-sandbox falsa substituídas
> As seções abaixo sobre "leitura/escrita do Drive continua pinada na pasta de teste" e a leitura ao vivo por slot descrita em "Lazy-load por produto" **não valem mais**: a identidade falsa fixa (`MARCA_SANDBOX_TESTES`/`EAN_SANDBOX_TESTES`) foi substituída por uma raiz de teste dedicada por empresa com marca/EAN real de cada produto, e a leitura ao vivo foi substituída por cache de snapshot persistido. Nota mantida como histórico do raciocínio que levou até aqui — ver [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]] pro estado atual.

# Portal do Drive Vira Lista de Todos os Produtos — Lazy-Load por Produto e Leitura Pinada na Pasta de Teste

## O quê

A tela do Portal do Drive, que até aqui rodava fixa contra 1 único produto de teste, virou uma lista real — todos os produtos ativos da Agenda de Vídeos, com busca e paginação (mesmo padrão da tela de Histórico) — onde cada produto expande sob demanda pra mostrar o painel de fases/arquivos (o painel em si não mudou de comportamento, só passou a carregar por produto, não mais de cara). Junto, o CSS foi revisado pra alinhar com o padrão visual já maduro do resto do sistema.

## Por quê

3 motivos levaram a essa mudança, nesta ordem:

1. **Escopo pedido pelo usuário**: a tela precisava passar a valer para todos os produtos, não ficar amarrada a 1 EAN fixo.
2. **Custo real de chamada ao Drive**: cada produto aberto gera até ~20-30 chamadas sequenciais ao Drive (3 tipos de arquivo × 9 linhas de fase/ocorrência, com até 2 buscas cada — `Videos/` e `Videos/usados/` — mais 1 chamada de detalhes por arquivo já presente). Fazer isso pra todos os produtos de uma lista de uma vez inviabilizaria a tela — por isso o carregamento do painel de 1 produto só acontece quando a linha dele é aberta, nunca antes.
3. **Consistência visual com o resto do sistema**: comparando com telas já maduras do mesmo app (Histórico, Agenda principal), o Portal do Drive tinha 3 desvios do padrão real: um badge de estado com `text-transform: none` sobrescrevendo o uppercase padrão de `.badge-tabela` (usado em todo badge de status do sistema), botões de ação sem contorno nenhum (só link discreto, sem o tratamento de caixa usado em `.agenda-verificar-drive-toggle`), e nenhum "anel de foco" no hover dos cartões clicáveis (padrão já usado em `layout_roadmap_produto.css`). Os 3 foram corrigidos alinhando com o que já existe, em vez de inventar tratamento novo.

## Pra quê

Pra a tela poder ser usada de verdade contra o catálogo real, sem exigir escolher manualmente 1 EAN por código, sem custar uma sobrecarga de chamadas ao Drive proporcional ao tamanho do catálogo inteiro, e sem destoar visualmente de telas mais complexas do mesmo sistema.

## Arquitetura da lista

`view_portal_drive` deixou de montar o card de 1 produto fixo e passou a paginar/buscar — mesmo padrão (`Paginator`, `por_pagina`, `querystring_sem_pagina`) já usado por `view_historico_agenda_videos`. A 1ª tentativa de popular a lista usou `listar_produtos_com_historico()` — **errado**: essa função só devolve produtos que já têm pelo menos 1 `CicloVideo` criado, o que deixou a lista vazia pra qualquer ambiente sem histórico ainda rodado. Corrigido pra `listar_produtos_agenda_filtrados(tela=Tela.GERAL, busca=busca or None)` — mesma função que a tela principal da Agenda de Vídeos usa por padrão, que devolve todo produto ativo (exclui só Pausado/Descontinuado), sem exigir ciclo nenhum já criado.

Cada linha colapsada da lista só mostra dado de banco (foto/marca/título/EAN/SKU, via o parcial já existente `estrutura_parcial_identidade_produto.html`) — nenhuma chamada ao Drive acontece na carga da lista.

## Lazy-load por produto — accordion, 1 aberto por vez

Abrir a linha de 1 produto (`<details>`) dispara HTMX no evento nativo `toggle`, carregando o painel completo daquele produto numa nova view (`view_portal_drive_detalhe`). Só 1 produto fica aberto/carregado por vez — abrir outro fecha e limpa o anterior (JS escuta `toggle` no `document`, já que esse evento não borbulha sozinho). 2 motivos pra isso ser accordion e não múltiplo:

- Evita repetir o custo de Drive descrito acima pra mais de 1 produto ao mesmo tempo.
- Evita ID duplicado na página — o card do produto usa IDs fixos (`#portal-drive-card`, `#portal-drive-btn-enviar`, `#portal-drive-lista-fases`) que várias partes do JS já existente (contador de arquivos selecionados, barra de progresso, seleção por clique/arraste) leem via `document.getElementById`/`querySelectorAll` sem se importar com qual produto está aberto — só funciona corretamente se nunca houver 2 instâncias ao mesmo tempo na DOM.

## Decisão de segurança: leitura/escrita do Drive continua pinada na pasta de teste

Perguntado explicitamente ao usuário se, com a tela mostrando produtos reais, cada um deveria passar a ler/escrever na pasta real do próprio produto no Drive (marca/EAN de verdade) ou continuar restrito à pasta de teste por enquanto. Resposta escolhida: **continuar restrito à pasta de teste** (`MARCA_SANDBOX_TESTES`/`EAN_SANDBOX_TESTES`) até a tela nova (lista/busca/paginação/lazy-load) ser validada sem risco de mexer em pasta real de produção antes de testar tudo.

Na prática: a lista mostra produtos reais, mas **todo** produto expandido lê/escreve na mesma pasta de teste, independente de qual foi aberto. Um aviso fixo (`modo_teste_sandbox`) aparece tanto no topo da lista quanto dentro de cada card aberto, deixando isso explícito — nunca esconder do usuário que o conteúdo mostrado é da pasta de teste, mesmo quando o cabeçalho do card mostra a identidade do produto real escolhido. Rotear o Drive por `produto.marca`/`produto.ean` de verdade (a "engine" `ArquivadorDrive.enviar_arquivo` já aceita esses 2 parâmetros — não precisa mudar) fica pra depois de validar a tela nova.

## Alinhamento visual — 3 ajustes

| Desvio encontrado | Correção aplicada |
|---|---|
| `.portal-drive-pill-estado` sobrescrevia `text-transform`/`letter-spacing`, fugindo do uppercase padrão de `.badge-tabela` (usado em todo badge de status do sistema) | Override removido — a pill volta a seguir o padrão uppercase, igual a qualquer outro badge do sistema |
| Botões de ação ("Ver no Drive"/"Excluir do Drive") sem contorno, só link discreto | Redesenhados como botão em caixa (borda + fundo branco + hover trocando cor), mesmo espírito de `.agenda-verificar-drive-toggle` (`layout_agenda_videos.css`) |
| Cartão de arquivo vazio (clicável, pra selecionar/arrastar) sem nenhum reforço visual de "isso é clicável" no hover | Adicionado o mesmo "anel de foco" (`box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2)`) já usado nos círculos clicáveis de `layout_roadmap_produto.css` |

Além disso, a lista de produtos reaproveita classes reais já existentes em vez de inventar novas: `.historico-grupo-produto`/`-cabecalho`/`-identidade`/`-conteudo` (do Histórico), `.agenda-barra-busca`/`.agenda-input-busca` e `.historico-paginacao` — o mesmo padrão visual de busca+paginação já usado em `view_historico_agenda_videos`.

## Estado real / pendências

- Toda a implementação (urls.py, views.py, templates, CSS, JS) foi entregue como texto no chat e aplicada localmente pelo usuário — **nada foi commitado ainda** (o último commit real segue sendo o já registrado na nota de implementação anterior). Se a continuação for de outro PC via `git pull`, o repositório vem **sem nenhuma mudança de hoje** — só commitar/push resolve isso, ou levar os arquivos por outro meio.
- No 1º `runserver` depois de aplicar a mudança, faltavam `view_portal_drive_video`/`view_portal_drive_thumbnail` no `views.py` do usuário (saíram junto na hora de substituir o bloco antigo pelo novo) — reenviadas e coladas de volta, sem mudança nenhuma nelas.
- Depois disso, a tela carregou mas mostrou "Nenhum produto encontrado" — causa raiz identificada (`listar_produtos_com_historico` era estreito demais) e a correção (trocar para `listar_produtos_agenda_filtrados(tela=Tela.GERAL, ...)`) foi passada, **mas ainda não confirmada como testada** — esse é o próximo passo real ao retomar.
- Depois de confirmar a lista carregando produtos de verdade, falta validar o fluxo completo (abrir 1 produto, enviar arquivo, excluir, ver "usado") já com a arquitetura de lista — o checklist de ponta a ponta original (upload por tipo/fase, conflito em lote, exclusão, detecção de "usado", nas 2 empresas, com vídeo real) continua pendente, agora rodando sobre a tela nova.

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura]]
- [[Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo]]
