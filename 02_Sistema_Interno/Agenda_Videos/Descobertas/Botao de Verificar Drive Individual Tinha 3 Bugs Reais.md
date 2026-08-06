---
tipo: descoberta
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 06/08/2026 00:35
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Disciplina de Testes Automatizados, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Integridade e Fonte Unica de Dado]
---

# Botão de Verificar Drive Individual Tinha 3 Bugs Reais

Achado testando manualmente no navegador (06/08/2026), depois de terminar a suíte automatizada de `parser.py`/`verificador.py` (Nível 0/2/3/5, ver [[Checkpoint Testes Automatizados Agenda Videos]]). Usuário reparou, olhando o card do produto real, que não existia botão pra verificar o Drive de 1 produto isolado — só o "Verificar Todos" geral. Investigar essa falta expôs 3 bugs reais em cadeia, cada um só visível depois do anterior corrigido.

## Bug 1 — botão escondido por engano atrás de `ciclo_atual`

`estrutura_parcial_card_produto.html` já tinha o botão implementado (`agenda-verificar-drive-toggle`, ícone nuvem, ao lado do ⚠️/↺) desde o commit `f227e5b` — só que dentro do mesmo `{% if ciclo_atual %}` que libera o bloco de meta/datas. Produto ainda sem nenhum `CicloVideo` salvo (fase Simples pré-criação) tem `ciclo_atual_de` (leitura direta do banco) retornando `None` — escondia o botão junto com a meta, mesmo a view (`view_verificar_produto_drive`) não dependendo de ciclo nenhum pra funcionar (só usa `produto_id`).

**Resolução:** botão movido pra fora do `{% if ciclo_atual %}` — fica incondicional, só o bloco de meta continua atrás da condição.

## Bug 2 — verificação não criava o 1º `CicloVideo`

Com o botão visível, clicar nele em produto sem ciclo nenhum não fazia nada — sem erro, sem avanço. Causa: `_avancar_etapas_com_estrutura()` (`verificador.py`) fazia `ciclo = produto.ciclos_video.first()` e saía do loop na hora se viesse `None`, mesmo que o arquivo "Base" já estivesse pronto no Drive. A única forma de criar o 1º `CicloVideo` era o clique manual de "Base" no roadmap (`CicloVideo.iniciar_agenda`) — a sincronização do Drive nunca fazia esse papel.

**Resolução:** quando `ciclo` vem `None`, monta um `CicloVideo` hipotético (não salvo) só pra checar via `avaliar_etapa_no_drive()` (mesma função já usada no resto do loop — fonte única, sem duplicar a regra de nome de arquivo esperado) se o Base já está satisfeito. Só então chama `CicloVideo.iniciar_agenda(produto)` de verdade e segue o loop normal (que aí também avança Roteiro/Completo na mesma checagem, se prontos). Nunca cria um ciclo travado em Base sem arquivo.

## Bug 3 — verificação individual nunca gravava o snapshot

Depois do Bug 2 corrigido e confirmado avançando o roadmap, usuário notou que o badge "☁ última verificação" (`produto.snapshot_drive.atualizado_em`, em `estrutura_parcial_identidade_produto.html`) só aparecia depois de clicar "Verificar Todos", nunca depois do botão individual. Causa: `verificar_produto_no_drive()` busca o Drive ao vivo via `LocalizadorArquivosProduto`, mas nunca persiste o resultado em `SnapshotArquivosDrive` — só `escaneador.sincronizar_snapshots_drive()` (usado pelo "Verificar Todos") grava. Isso contraria o próprio comentário do model (`snapshot_arquivos_drive.py`, topo do arquivo), que documenta "atualizado por 2 caminhos: a varredura completa e a verificação individual" — a 2ª parte nunca foi implementada na reescrita do Drive.

**Resolução:** `verificar_produto_no_drive()` agora grava `SnapshotArquivosDrive` nos 2 desfechos (pasta encontrada e não encontrada), reaproveitando `localizador.listar_arquivos_usados()` (já existia, nunca era chamado por esse caminho) e o mesmo formato de `update_or_create` já usado em `escaneador.py`. Custo aceito: 1 chamada extra à API do Drive por clique individual (buscar `usados/`), necessária pra manter o snapshot completo.

## Validação

Os 3 fixes confirmados em ambiente real (navegador, EAN QUIMIVIDA `0789888395162`, depois de zerar o `CicloVideo` de teste via `manage.py shell`):
- Botão aparece mesmo sem ciclo.
- Clique individual cria o ciclo e avança Base/Roteiro/Completo sozinho, parando em Postar (correto — não depende de arquivo).
- "Verificar Todos" testado em paralelo, mesmo comportamento.
- Badge de última verificação atualiza também pelo caminho individual.

## Por que não foi pego antes

Nenhum teste automatizado exercitava o card renderizado pra produto sem `ciclo_atual`, nem o loop de avanço a partir de `ciclo is None`, nem a escrita do snapshot no caminho individual — os 3 caminhos eram só lidos/assumidos como equivalentes ao "Verificar Todos", nunca comparados lado a lado. Só apareceu testando manualmente os 2 botões no mesmo produto, na mesma sessão, um depois do outro.

## Teste de regressão — concluído (06/08/2026, 00:35)

4 cenários confirmados com o usuário e escritos: 2 substituem/completam `test_nivel_3__avancar_etapas_produto_sem_ciclo_nao_faz_nada` (que testava o comportamento ANTIGO/errado) por 2 testes novos (sem Base no Drive → não cria nada; com Base pronta → cria o 1º ciclo e avança); 2 novos cobrindo o snapshot gravado nos 2 desfechos (`test_nivel_3__verificador.py`); 1 novo em `test_nivel_4__view_agenda_videos.py` confirmando o botão aparece mesmo sem `ciclo_atual`. No processo, mais 1 correção necessária num teste já existente: `..._avanca_ponta_a_ponta` precisou de mock extra pra `listar_arquivos_usados` (senão bateria no Drive real, já que o fix do Bug 3 passou a chamar esse método).

**Confirmado: 42 passed, 100% cover, 0 Miss, 0 BrPart em `parser.py` (69 stmts/12 branch) e `verificador.py` (88 stmts/22 branch).**

Pendente: commitar tudo (template + `verificador.py` + os testes).

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Disciplina de Testes Automatizados]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
- [[Integridade e Fonte Unica de Dado]]
