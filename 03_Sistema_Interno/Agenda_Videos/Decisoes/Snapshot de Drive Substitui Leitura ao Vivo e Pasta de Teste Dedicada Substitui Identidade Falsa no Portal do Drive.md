---
tipo: decisao
dominio: 
status: resolvida
criado: 20/08/2026
atualizado_em: 20/08/2026 16:31
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Portal do Drive Vira Lista de Todos os Produtos - Lazy-Load por Produto e Leitura Pinada na Pasta de Teste, Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura]
---

# Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive

## O quê

Depois de testar a versão "lista de todos os produtos" do Portal do Drive (ver [[Portal do Drive Vira Lista de Todos os Produtos - Lazy-Load por Produto e Leitura Pinada na Pasta de Teste]]), o usuário reportou 3 problemas reais e a tela passou por 2 mudanças de arquitetura no mesmo dia:

1. **Pasta de teste deixou de ser uma identidade falsa dentro da pasta real** (`MARCA_SANDBOX_TESTES`/`EAN_SANDBOX_TESTES` = `PRODUTO_RASCUNHO`/`0000000000099`) **e passou a ser uma raiz de teste totalmente separada e dedicada** (`GOOGLE_DRIVE_PASTA_TESTE_MAGAZINE`/`_SAMVALE`, já declaradas em `settings.py` mas nunca usadas até então) — cada produto passa a usar sua **própria marca/EAN real**, só que criada, se ainda não existir, dentro dessa raiz isolada.
2. **A leitura ao vivo do Drive por produto foi substituída pelo mesmo mecanismo de snapshot persistido (`SnapshotArquivosDrive`) já usado pela Agenda de Vídeos automática** — a mesma varredura completa e eficiente (`escaneador.sincronizar_snapshots_drive()`) que já existia pro "Verificar Todos no Drive" agora também alimenta o Portal do Drive, através de **1 único botão explícito** ("Sincronizar com o Drive") — nunca mais automático na abertura da tela ou de um produto.

## Por quê

O usuário testou a versão anterior e relatou 3 problemas concretos: (a) abrir 1 produto era **muito lento** — até ~30 chamadas sequenciais ao Drive por abertura, sempre refeitas, mesmo reabrindo o mesmo produto; (b) o botão "Ver no Drive" abria o **preview do arquivo**, não a pasta — o usuário queria o equivalente a "revelar no explorador de arquivos" do VS Code; (c) "Excluir do Drive" funcionava mas parecia **travado**, sem nenhum feedback dinâmico enquanto a exclusão real acontecia. Adicionalmente, o usuário decidiu remover de vez a identidade falsa fixa (`PRODUTO_RASCUNHO`) porque queria testar exclusivamente contra as 2 pastas de teste dedicadas por empresa, já existentes em `settings.py` e nunca usadas: *"Eu estou removendo todas as interações com a pasta real, e jogando 100% nas de testes."*

## Pra quê

Pra a tela ficar rápida e confiável o suficiente pra virar navegação do dia a dia (não só uma prova de conceito), sem nenhum risco de escrever na pasta real de produção, e sem criar 2 fontes de verdade divergentes entre a Agenda de Vídeos automática e o Portal do Drive manual — a decisão do usuário foi explícita: *"'Sincronizar com o drive' já deve trazer TODAS as informações que forem necessárias do drive para a agenda de vídeos, e para o portal — assim 1 única chamada já resolve ambos os lados, evita chamadas extras e desincronia."*

## Pasta de teste dedicada — troca de 1 função só

Toda a leitura/escrita do Drive passa por `obter_pasta_raiz_id_ativa()` (`agenda_videos/funcoes_auxiliares/drive/cliente.py`) — por isso a troca de raiz (real → teste dedicada) foi 1 mudança pontual, num lugar só, sem tocar em nenhuma outra função do pacote `drive/`. Cada produto continua usando `produto.marca`/`produto.ean` reais (não mais `MARCA_SANDBOX_TESTES`/`EAN_SANDBOX_TESTES`) — só que a pasta marca/EAN, se não existir ainda, nasce dentro da raiz de teste em vez da raiz real. Decisão marcada no código como reversível (comentário datado 20/08/2026) — trocar de volta pra produção real é a mesma troca, no mesmo lugar.

## Cache de snapshot — elimina a leitura ao vivo por slot

`_montar_linha()`/`_montar_contexto_card()` (`agenda_videos/views.py`) deixaram de perguntar ao Drive "esse arquivo existe?" pra cada um dos 3×7 slots possíveis a cada abertura — agora leem a existência direto de `snapshot.arquivos_videos`/`snapshot.arquivos_usados` (JSON já persistido em `SnapshotArquivosDrive`, indexado por nome de arquivo). Uma chamada ao vivo ao Drive (`_obter_detalhes_arquivo`) só ainda acontece pra pegar tamanho/duração de um arquivo que o snapshot **já confirmou existir** — nunca mais pra descobrir se existe.

Se o produto nunca foi sincronizado ainda (nenhum `SnapshotArquivosDrive` criado), a tela mostra tudo como "não enviado" em vez de quebrar — só criando o snapshot real depois do 1º clique em "Sincronizar com o Drive" (ou de um envio/exclusão individual, ver abaixo).

### Campos novos no model (migração)

`SnapshotArquivosDrive` ganhou `pasta_videos_id` e `pasta_usados_id` (`CharField`, `blank=True, default=''`) — precisos pra montar o link de "abrir pasta no Drive" (abaixo) sem precisar de uma nova chamada ao Drive só pra descobrir o ID da pasta. Populados nos 2 caminhos que já escrevem o snapshot: `escaneador.montar_arvore_por_ean()`/`sincronizar_snapshots_drive()` (varredura completa) e `verificador.verificar_produto_no_drive()` (verificação individual) — `localizador.listar_arquivos_usados()` passou a devolver `(arquivos, pasta_usados_id)` em vez de só a lista, pra alimentar o 2º caminho. Migração gerada pelo próprio usuário (`makemigrations`/`migrate`), não escrita à mão.

## Botão único "Sincronizar com o Drive" — resolve os 2 lados numa chamada

`view_portal_drive_sincronizar()` (nova) chama a **mesma** `verificar_todos_no_drive()` já usada pelo "Verificar Todos no Drive" da Agenda de Vídeos principal — 1 clique atualiza o snapshot que os 2 lados leem, sem duplicar leitura do Drive nem arriscar desincronia entre eles. Só disparado por clique explícito (`confirm()` antes de submeter) — nunca automaticamente na abertura da lista ou de 1 produto.

Depois de um envio ou exclusão real e bem-sucedido, `verificar_produto_no_drive(produto.id)` é chamado pra refrescar **só aquele 1 produto** (dentro de `try/except`, nunca vira erro 500 se a rede falhar nesse meio-tempo — o envio/exclusão já aconteceu de verdade, só o snapshot fica temporariamente desatualizado até o próximo "Sincronizar com o Drive").

## "Ver no Drive" → "Abrir pasta no Drive"

Trocado de abrir o preview do arquivo isolado (`webViewLink` do arquivo) pra abrir a pasta que o contém (`https://drive.google.com/drive/folders/{pasta_id}`) — pedido do usuário, mesmo espírito de "revelar no explorador de arquivos". **Limitação real, comunicada ao usuário**: o Google Drive não tem um jeito oficial de abrir uma pasta já com 1 arquivo específico destacado/selecionado — o melhor alcançável é abrir a pasta, o arquivo fica visível ali dentro (geralmente poucos itens por pasta, fácil de achar).

## Feedback de carregamento no botão de exclusão

"Confirmar exclusão" (modal) ganhou o mesmo padrão já usado em `.agenda-verificar-drive-toggle` — `hx-disabled-elt="this"` trava clique duplo, e 2 `<span>` (texto padrão / spinner + "Excluindo do Drive...") alternam via a classe `.htmx-request` que o HTMX adiciona sozinho enquanto o POST está em voo. Resolve a sensação de tela travada relatada pelo usuário.

## Estado real

Todo o pacote (model + migração, `cliente.py`, `localizador.py`, `verificador.py`, `escaneador.py`, `views.py`, `urls.py`, 3 templates, CSS) foi commitado e enviado pelo usuário — commit `09f30c2` ("wip: portal do drive etapas 1-3"), branch `dev`, puxado e confirmado neste computador via `git pull` às 20/08/2026, tarde. Testado manualmente pelo usuário contra as pastas de teste: estrutura de pasta criada corretamente (`Teste/Marca/EAN/Videos/Nome`), inclusive com 2 produtos diferentes da mesma marca.

> [!warning] Bug real encontrado depois do commit — CSS do spinner de exclusão duplicado
> Ao ler o CSS de volta pra fazer a passada de acabamento visual (ver [[Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug]]), foi encontrado que o bloco de CSS do spinner de "Confirmar exclusão" existia **2 vezes** no arquivo — uma cópia correta (com `inline-flex`, alinhamento certo) e outra pior, colada de novo no fim do arquivo (com `display: inline`, sem `gap`), sobrescrevendo a boa sem necessidade. A cauda duplicada foi removida na mesma passada.

## Pendências

Nenhuma nesta frente — arquitetura validada com dado real. A frente que segue pendente (filtros estilo Hub de Anúncios) é funcionalidade nova, não faz parte desta decisão.

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Portal do Drive Vira Lista de Todos os Produtos - Lazy-Load por Produto e Leitura Pinada na Pasta de Teste]]
- [[Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura]]
- [[Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug]]
