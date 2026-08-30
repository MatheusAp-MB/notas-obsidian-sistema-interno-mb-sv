---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 18/08/2026
atualizado_em: 22/08/2026 14:35
relacionado: [Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao), Service Account Nao Tem Cota Propria no Drive - Upload Real Exige OAuth Como Usuario Real, Convencao de Nomenclatura de Arquivos no Drive, Disciplina de Testes Automatizados, Padrao de Robustez para Clientes de API Externa, Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo, Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura, Portal do Drive Vira Lista de Todos os Produtos - Lazy-Load por Produto e Leitura Pinada na Pasta de Teste, Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive, Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug, Filtros de 5 Dimensoes no Portal do Drive - Marca, Progresso, Fase, Urgente e Sincronizacao, Bug Real - Sincronizacao em Massa Confundia Nunca Sincronizado com Nao Encontrado no Drive, Cache de Detalhes de Arquivo no Snapshot e Cache de Sessao no Front-End Encerram o Piscar ao Reabrir Produto, Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling, Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local), Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Checagem de Ja Postou Hoje Usa Ultimo Dia Util e Pode Nao Reconhecer Postagem Feita em Fim de Semana, Destaque e Abertura Automatica da Etapa Atual no Portal do Drive]
---

> [!warning] Pausado em 22/08/2026, 14h35 — aguardando uso real e feedback antes de qualquer novo ajuste
> Com a suíte de teste fechada (13h42) e o destaque de etapa atual validado com dado real (14h20), o usuário decidiu parar por aqui e deixar o sistema em uso real por um tempo antes de mexer em mais alguma coisa nesta tela — sem item novo levantado, sem bug conhecido em aberto. Próximo passo real: esperar feedback de uso.

> [!success] Atualização (22/08/2026, 14h20) — bug do fim de semana corrigido e confirmado, destaque automático da etapa atual implementado (2 bugs achados e corrigidos no caminho)
> Direto na sequência do fechamento da suíte de teste (callout de 13h42 abaixo), 2 itens novos: **(1)** o bug do "já postou hoje" documentado às 02h24 foi corrigido — `listar_produtos_elegiveis()` ganhou uma 2ª variável de data (calendário real, separada da ajustada pro último dia útil) só pra essa checagem específica; como hoje (22/08) já era sábado, deu pra confirmar com dado real na hora, sem precisar simular nada — o teste que documentava o bug passou a passar (12 passed, 0 failed). Ver [[Checagem de Ja Postou Hoje Usa Ultimo Dia Util e Pode Nao Reconhecer Postagem Feita em Fim de Semana]], seção Resolução. **(2)** Feature nova: a seção da etapa atual de cada produto (dentre as 7 fases/ocorrências) agora abre sozinha e vem com borda de destaque, sem precisar caçar entre as 7 nem saber de antemão qual é a certa — e isso se atualiza sozinho (sem F5) sempre que uma ação na própria tela faz a etapa avançar. 2 bugs reais apareceram só testando com produto real e foram corrigidos no processo: comparação de `numero_ocorrencia` falhava pro Simples (banco guarda `1`, não `None`) e produto sem nenhum `CicloVideo` ainda não destacava nada (corrigido tratando ausência de ciclo como "Simples" pra fins de destaque) — mais um ajuste de UX (reabrir o mesmo produto reaproveitando o HTML em cache não atualizava o destaque, corrigido em JS). Confirmado funcionando pelo usuário em 2 produtos reais opostos (1 com Simples completo, 1 nunca sincronizado). Detalhe completo em [[Destaque e Abertura Automatica da Etapa Atual no Portal do Drive]]. Nenhum dos 2 itens commitado ainda.

> [!success] Atualização (22/08/2026, 13h42) — suíte de teste do Portal do Drive fechada por completo (tarefas 20-23), 4 falhas reais achadas rodando o sistema inteiro junto pela 1ª vez, 1 bug de produção novo descoberto e documentado, commit feito e sincronizado
> Depois da barra de progresso (callout de 21/08 abaixo), a sessão seguinte fechou a suíte de teste de views do Portal do Drive por completo — as 4 últimas tarefas do plano (20, 21, 22, 23): **#20** `sincronizar_snapshots_drive()` direção Sistema→Drive (Nível 3); **#21** filtros de 5 dimensões em `view_portal_drive` (Nível 4); **#22** `view_portal_drive_sincronizar`/`_status` — thread + polling da barra de progresso (Nível 4); **#23** cache de detalhes de arquivo no snapshot (`_obter_detalhes_arquivo`/`_obter_detalhes_com_cache`/`_montar_contexto_card`, Nível 0+3). No meio do caminho, um levantamento (`grep` cruzando `def view_*` com as chamadas de `reverse()` já testadas) achou 5 views do Portal do Drive sem nenhum teste ainda — todas fechadas numa leva só: envio/exclusão de arquivo, vídeo/thumbnail, postagem automática, replicação automática, e a verificação legado (`view_verificar_produto_drive`/`_todos`). Ao todo, **~10 arquivos de teste novos nesta sessão**.
>
> **Achado importante, só visível rodando a suíte inteira junto pela 1ª vez** (`pytest -s`, sem restringir arquivo — sábado 22/08): 473 passed, 6 failed, 92% cover em `views.py`. Das 6, 2 eram Nível 5 (Drive real, fora de escopo de diagnóstico estático) e 4 foram diagnosticadas por leitura direta do código real (nunca por suposição): **3 eram bug de teste**, corrigidas na hora — `test_nivel_3__verificador.py` (2 mocks desatualizados de `listar_arquivos_usados()`, devolviam lista solta em vez da tupla `(lista, pasta_usados_id)` real) e `test_nivel_4__view_executar_acao_ciclica.py` (teste da ação "postar" usava `client.get(...)`, mas `_acao_postar()` exige `mlb_postado` via POST). **1 era bug real de produção**, não corrigido a pedido explícito do usuário (mexe na frente de Postagem Automática, já pausada) — a checagem de "já postou hoje" em `listar_produtos_elegiveis()` reusa a data ajustada pro último dia útil, que não bate com o timestamp real de fim de semana; documentado em [[Checagem de Ja Postou Hoje Usa Ultimo Dia Util e Pode Nao Reconhecer Postagem Feita em Fim de Semana]].
>
> **2 incidentes de processo nesta sessão**, ambos já registrados em [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]: Claude criou 1 arquivo de teste com a ferramenta de criar arquivo e apresentou como card, em vez de texto puro (5º incidente confirmado desta regra) — corrigido na hora, arquivo inteiro re-entregue como texto; e criou 5 tarefas no Cowork sem pedir permissão pra um pedido em lote (3º incidente desta regra) — desta vez autocorrigido, sem o usuário precisar apontar.
>
> Ao fechar a tarefa 23, um bug de contagem no próprio teste (não de produção) apareceu: a fixture que conta quantas vezes `SnapshotArquivosDrive.save()` roda já estava ativa antes do `.objects.create()` de setup do próprio teste, inflando a contagem em 1 — corrigido zerando o contador logo depois do setup, antes de exercitar `_montar_contexto_card()`.
>
> **Confirmado: commit feito e sincronizado** — `f26e957` ("test(agenda_videos): amplia cobertura Nível 0/3/4 do Portal do Drive e corrige mocks desatualizados"), 13 arquivos (2 modificados, 11 novos), confirmado via `git fetch`+`git pull --ff-only` no clone de leitura. **Isso fecha por completo o plano de 23 tarefas de teste automatizado do Portal do Drive.**

> [!success] Atualização (21/08/2026, 16h55) — barra de progresso real no botão "Sincronizar com o Drive", bug real de arquitetura encontrado e corrigido
> Depois da pausa da frente visual/funcional decidida em 20/08 (callout abaixo), o usuário trouxe 1 último incômodo real de UX — fora da política de "só aparência por bug real" justamente porque isso É um bug real: o botão "Sincronizar com o Drive" deixava a tela parada, sem nenhum feedback, até a página recarregar no final — nas palavras do usuário, *"meio que 'congela' a tela e não da feedback pro usuario."* Resolvido com a primeira implementação de verdade, dentro do Django, do padrão "rotina vira botão" (thread em background + endpoint de status por polling, decidido em [[Reducao de Comandos de Management e Rotina Vira Botao]]) — barra de progresso real com 3 fases (leitura do Drive, atualização de produtos, avanço de roadmap), detalhe completo em [[Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling]]. No caminho, foi encontrado e corrigido 1 bug real de arquitetura: a thread em background não herdava a empresa ativa (MAGAZINE/SAMVALE) setada pelo `EmpresaMiddleware`, porque `threading.local()` é isolado por thread — achado crítico pra qualquer botão futuro que siga o mesmo padrão (`popular_banco`, `sincronizar_impostos_entrada`), ver [[Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local)]]. **Testado manualmente pelo usuário e confirmado funcionando** — *"Otimo funcionou."* Motivo desta atualização: usuário vai migrar de computador. Nenhum dos 2 itens confirmado como commitado/pushado ainda.

> [!success] Atualização (20/08/2026, 22h30) — filtros de 5 dimensões, bug de sincronização em massa corrigido, cache elimina o "piscar" ao reabrir produto — frente visual pausada por decisão do usuário
> Depois do acabamento visual de 16h31 (callout abaixo), 3 coisas novas nesta mesma data: (1) o item pendente de filtros foi resolvido, com escopo bem mais completo do que Marca sozinha — Marca, Progresso de envio, Fase atual, Urgente e Sincronização com o Drive, desenhado depois de o usuário rejeitar uma 1ª versão simples demais, validado por mockup interativo antes do código real (ver [[Filtros de 5 Dimensoes no Portal do Drive - Marca, Progresso, Fase, Urgente e Sincronizacao]]); (2) usando a tela de verdade com os filtros, o usuário achou um bug real — "nunca sincronizado" e "não encontrado no Drive" estavam sendo tratados como a mesma coisa, porque a sincronização em massa nunca gravava snapshot pra produto sem pasta no Drive; corrigido invertendo a direção do laço (de "o que o Drive revelou" pra "todo produto ativo do catálogo") — ver [[Bug Real - Sincronizacao em Massa Confundia Nunca Sincronizado com Nao Encontrado no Drive]]; (3) o "piscar" de carregamento ao reabrir um produto já visto foi eliminado com cache em 2 camadas (detalhes de arquivo cacheados dentro do próprio snapshot; front-end para de apagar/recarregar o mesmo produto sem necessidade) — ver [[Cache de Detalhes de Arquivo no Snapshot e Cache de Sessao no Front-End Encerram o Piscar ao Reabrir Produto]]. **Decisão do usuário ao final desta sessão**: pausar a frente visual/funcional do Portal do Drive por ora — *"agora neste momento de parte visual não consigo pensar em mais nada.. agr é esperar o uso e o feedback."* Nenhum dos 3 itens acima foi confirmado como commitado/pushado ainda — só aplicado localmente e testado no navegador pelo usuário.

> [!success] Atualização (20/08/2026, 16h31) — arquitetura de cache/pasta de teste dedicada aplicada e commitada, acabamento visual final feito, melhoria estética por gosto encerrada
> Desde a pausa de 03h00 abaixo, a tela avançou bastante: (1) a leitura ao vivo do Drive por produto foi substituída pelo mesmo mecanismo de snapshot persistido já usado pela Agenda de Vídeos automática, com sincronização unificada por 1 botão explícito; (2) a identidade falsa fixa (`PRODUTO_RASCUNHO`) foi trocada por uma raiz de teste dedicada por empresa, onde cada produto usa sua marca/EAN real; (3) "Ver no Drive" passou a abrir a pasta, não o arquivo; (4) o botão de exclusão ganhou feedback de carregamento real. Tudo isso foi **commitado e pushado pelo usuário** (commit `09f30c2`, branch `dev`) e confirmado neste computador via `git pull`. Detalhe completo em [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]. Depois disso, uma passada final de acabamento visual corrigiu os 4 últimos problemas de qualidade (avisos de teste na tela, header duplicado, badge vazando da borda do card, visual cinza chapado) — detalhe e a técnica usada (geração de imagem via Gemini como direção visual, não como spec) em [[Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug]]. **Decisão do usuário nesta mesma atualização**: a partir de agora, mudança de aparência nesta tela só acontece por bug/erro real, nunca mais por melhoria estética por gosto — a frente de qualidade visual está considerada suficiente e encerrada. **Único item de navegação/funcionalidade ainda pendente**: filtros estilo Hub de Anúncios (marca, contador, chips ativos).

> [!warning] Pausado em 20/08/2026, 03h00 — retomar por outro PC começando pelo item abaixo
> Sessão parada aqui pelo usuário. **Nada do trabalho de hoje foi commitado** — o repositório em qualquer outro PC, puxado via `git pull`, vai vir sem nenhuma das mudanças descritas no callout logo abaixo. Antes de continuar de outra máquina: ou commitar/push a partir do PC onde o código está aplicado, ou levar os arquivos por outro meio. **Próximo passo real, exato**: confirmar se a correção de queryset (`listar_produtos_agenda_filtrados(tela=Tela.GERAL, ...)` no lugar de `listar_produtos_com_historico`) resolveu o "Nenhum produto encontrado" — essa correção foi passada mas ainda não testada rodando o servidor de novo. Depois disso, retomar o checklist de ponta a ponta (upload por tipo/fase, conflito em lote, exclusão, "usado", 2 empresas, vídeo real) já sobre a tela de lista nova.

> [!success] Atualização (20/08/2026, 03h00) — tela virou lista de todos os produtos, com lazy-load e pasta de teste fixa
> A tela deixou de rodar fixa contra 1 produto e passou a listar TODOS os produtos reais ativos da Agenda de Vídeos, com busca e paginação (mesmo padrão do Histórico) — cada produto expande sob demanda (accordion, só 1 aberto/carregado por vez) pra evitar repetir o custo de ~20-30 chamadas ao Drive por produto em toda a lista de uma vez. Decisão de segurança: leitura/escrita do Drive continua 100% pinada na pasta de teste pra qualquer produto aberto, até essa tela nova ser validada sem risco de mexer em pasta real — um aviso fixo na tela deixa isso explícito. Junto, 3 desvios visuais do padrão real do sistema foram corrigidos (badge fora do uppercase padrão, botão de ação sem contorno, cartão clicável sem reforço de hover). Detalhe completo, incluindo os 2 bugs reais encontrados ao testar (função de view perdida na hora de substituir o bloco antigo; população errada de produtos na 1ª tentativa da lista) em [[Portal do Drive Vira Lista de Todos os Produtos - Lazy-Load por Produto e Leitura Pinada na Pasta de Teste]]. **Estado real**: código aplicado localmente pelo usuário, não commitado; correção do bug de lista vazia passada mas ainda não confirmada como testada.

> [!success] Atualização (20/08/2026, 00h34) — tela implementada de verdade e testada localmente
> A partir do layout já validado (callout de 19/08 abaixo), a tela foi implementada de ponta a ponta em Django — CSS/JS próprios (`layout_portal_drive.css`/`script_portal_drive.js`), templates, views e rotas novas. Ao testar ao vivo, o desenho evoluiu bem além do mockup original: cartão de arquivo com miniatura lateral em 9:16 (formato real dos vídeos, não 16:9), envio em lote de vários arquivos com barra de progresso real, preview local (vídeo tocável e texto legível) antes de qualquer envio ao Drive, player de vídeo próprio (play/pause, volume, tela cheia, linha do tempo, atalhos de teclado F/M/Espaço), exclusão de arquivo com confirmação em 2 etapas (manda pra lixeira do Drive, nunca apaga em definitivo), e detecção de arquivo já **usado** (pasta `Videos/usados/`) virando somente leitura. Detalhe completo em [[Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura]]. **Estado real**: testado manualmente via `runserver` pelo usuário, com vários bugs reais encontrados e corrigidos no processo — ainda **não commitado nem sincronizado** no repositório. Das 3 perguntas de design abaixo, a de "onde a tela vive no menu" foi resolvida (link próprio no dropdown); a de "modal de substituição" foi superada pelo desenho novo (lote independente por arquivo, sem reenvio de confirmação); a de pré-preencher Fase/Ocorrência **continua em aberto**. Segue também em aberto a escolha de produto pela tela (hoje fixa em 1 produto de teste).

> [!success] Atualização (19/08/2026, 22h06) — layout visual da tela definido
> Em outro PC (casa), depois de um rascunho funcional (upload real + preview real de vídeo/texto) que visualmente não convenceu, o layout final da tela foi decidido em conjunto com o usuário — card por produto, linha de identificação (foto/marca/título/EAN/SKU, padrão do hub de anúncios) e lista de fases que expande em cartões de arquivo com miniatura. Mockup completo (HTML/CSS/JS) salvo em [[Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo]]. As 3 perguntas de design abaixo (pré-preencher Fase/Ocorrência, modal de substituição, onde a tela vive no menu) continuam sem resposta — este mockup resolve só a aparência, não o comportamento.

# Checkpoint — Portal do Drive (Upload Manual de Vídeo Real pra Marca/EAN/Videos)

## Contexto

**O QUÊ**: o "Portal do Drive" é uma tela nova, ainda não construída na interface (só o motor por trás dela avançou até aqui), que vai deixar quem trabalha na Agenda de Vídeos subir um vídeo (Base, Roteiro ou Completo) direto pelo sistema — escolhendo marca, EAN, fase e tipo de arquivo — em vez de precisar abrir o Google Drive manualmente e navegar até a pasta certa (`{marca}/{ean}/Videos/`) pra arrastar o arquivo com a mão.

**POR QUÊ**: fazer isso manualmente no Drive tem 2 riscos reais, os mesmos que toda a [[Convencao de Nomenclatura de Arquivos no Drive]] existe pra evitar — salvar na pasta errada (EAN trocado, por exemplo) ou salvar com nome fora do padrão (é exatamente o que já aconteceu 1 vez de verdade — ver [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]], onde a equipe salvou `Simples_Roteiros.txt` no plural por engano). Se o próprio sistema monta o nome do arquivo e escolhe a pasta certa (usando as mesmas funções que o parser depois vai ler), esses 2 riscos somem — ninguém mais digita nome de arquivo ou navega pasta à mão.

**PRA QUÊ**: este checkpoint documenta o trabalho desta tarde (18/08/2026) na camada de baixo nível (`agenda_videos/funcoes_auxiliares/drive/`) — as funções que a tela do Portal do Drive vai chamar quando existir. A tela em si (view Django, template, modal de confirmação, botão no menu) ainda **não foi construída** — é o próximo passo, listado no final desta nota.

> [!info] Como este checkpoint se relaciona com [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]
> Aquele outro checkpoint (criado hoje de manhã, 18/08 10h11) trata de 4 etapas diferentes — Drive (leitura), Postagem Automática, Aprovação no Mercado Livre, Replicação Automática — todas sobre o fluxo **automático** que já existe. O trabalho desta nota é uma frente **paralela e nova**: dar ao humano um jeito de **escrever** no Drive pela tela do sistema, o que nunca existiu antes (até 28/07/2026, o arquivo `arquivador.py` inteiro tinha 0% de cobertura de teste e nenhum chamador em produção — só infraestrutura construída de propósito pra uso futuro). As 2 frentes usam o mesmo pacote `drive/`, mas resolvem problemas diferentes.

## O que foi feito nesta tarde (18/08/2026)

### 1. Nova função: achar se um arquivo já existe antes de subir

`agenda_videos/funcoes_auxiliares/drive/utilitarios_pasta.py` ganhou `buscar_arquivo()`, que pergunta ao Google Drive "existe algum arquivo com este nome exato dentro desta pasta?" e devolve o ID dele (ou `None` se não existir):

```python
def buscar_arquivo(servico, pasta_pai_id, nome_arquivo):
    nome_escapado = nome_arquivo.replace("'", "\\'")
    query = (
        f"'{pasta_pai_id}' in parents and name = '{nome_escapado}' "
        f"and trashed = false"
    )
    resultado = servico.files().list(
        q=query, fields='files(id)', supportsAllDrives=True, includeItemsFromAllDrives=True,
    ).execute()
    arquivos = resultado.get('files', [])
    return arquivos[0]['id'] if arquivos else None
```

**Por que precisa disso**: sem essa checagem, subir um vídeo pro mesmo produto/fase 2 vezes criaria **2 arquivos com o mesmo nome** dentro da mesma pasta do Drive (o Google Drive permite isso — nomes duplicados não dão erro nenhum) — e aí o parser (`parser.py`) não teria como saber qual dos 2 é o de verdade.

### 2. Nova função: montar o nome do arquivo automaticamente

Ainda em `utilitarios_pasta.py`... na verdade em `arquivador.py`, a função `montar_nome_arquivo()` monta o nome seguindo exatamente a mesma [[Convencao de Nomenclatura de Arquivos no Drive]] que o parser já espera ao ler:

```python
def montar_nome_arquivo(fase, numero_ocorrencia, tipo):
    prefixo = PREFIXO_ARQUIVO_POR_FASE[fase]
    extensao = EXTENSOES_VALIDAS_POR_TIPO[tipo]
    tipo_capitalizado = tipo.capitalize()
    if fase == 'simples':
        return f'{prefixo}_{tipo_capitalizado}.{extensao}'
    return f'{prefixo}_{numero_ocorrencia:02d}_{tipo_capitalizado}.{extensao}'
```

**Exemplo concreto**: pra uma ocorrência de Vídeo Mensal (fase `'mensal'`), número de ocorrência `1`, tipo `'roteiro'`, esta função devolve `Mensal_01_Roteiro.txt` — o mesmo formato de 2 dígitos que a convenção já documenta pra Mensal/Trimestral. Pra fase `'simples'`, não existe número de ocorrência (só acontece 1 vez), então o nome sai sem ele: `Simples_Base.mp4`.

### 3. A função principal: `enviar_arquivo()`

Esta é a função que a tela do Portal do Drive vai chamar quando o usuário confirmar o upload. Ela faz 4 coisas em sequência: garante a cadeia de pastas `marca/ean/Videos/` (reaproveitando `buscar_ou_criar_subpasta`, já existente), monta o nome certo do arquivo, checa se já existe um arquivo com esse nome, e só então decide entre **criar** ou **substituir**:

```python
def enviar_arquivo(self, pasta_raiz_id, marca, ean, fase, numero_ocorrencia, tipo, caminho_local, permitir_substituir=False):
    pasta_marca_id = buscar_ou_criar_subpasta(self.servico, pasta_raiz_id, marca)
    pasta_ean_id = buscar_ou_criar_subpasta(self.servico, pasta_marca_id, ean)
    pasta_videos_id = buscar_ou_criar_subpasta(self.servico, pasta_ean_id, NOME_PASTA_VIDEOS)
    nome_arquivo = montar_nome_arquivo(fase, numero_ocorrencia, tipo)
    arquivo_existente_id = buscar_arquivo(self.servico, pasta_videos_id, nome_arquivo)
    media = MediaFileUpload(caminho_local, resumable=True)
    if arquivo_existente_id is None:
        arquivo_novo = self.servico.files().create(
            body={'name': nome_arquivo, 'parents': [pasta_videos_id]},
            media_body=media, fields='id', supportsAllDrives=True,
        ).execute()
        return arquivo_novo['id']
    if not permitir_substituir:
        raise FileExistsError(
            f"Já existe um arquivo '{nome_arquivo}' em Videos/ — passe permitir_substituir=True pra confirmar a substituição."
        )
    self.servico.files().update(
        fileId=arquivo_existente_id, media_body=media, fields='id', supportsAllDrives=True,
    ).execute()
    return arquivo_existente_id
```

Repare que `pasta_raiz_id` é um parâmetro explícito da função, em vez de a própria função resolver isso sozinha chamando `obter_pasta_raiz_id_ativa()` — **decisão deliberada**, feita pra deixar a função fácil de testar isoladamente (o teste passa o ID da pasta-sandbox real do Drive de teste, sem precisar mexer em qual empresa está ativa na sessão).

### 3 decisões de design tomadas com o usuário nesta tarde

| Decisão | O que foi escolhido | Por quê |
|---|---|---|
| **O que fazer quando o arquivo já existe e ninguém confirmou substituição?** | Levantar a exceção padrão do Python `FileExistsError`, com mensagem explicando a situação. | Reaproveitar uma exceção que já existe na linguagem, em vez de criar uma classe de exceção nova só pra isso — mais simples, e quem chama já reconhece `FileExistsError` de cara. |
| **Quem decide se substitui ou não — o backend, com uma regra fixa, ou o usuário?** | O **usuário decide**, através de um modal de confirmação na tela ("Você tem certeza que quer substituir o vídeo atual por esse?") — o backend nunca substitui sozinho, nem nunca recusa de forma definitiva; ele só devolve a informação "já existe" pra tela decidir o que perguntar. | O usuário explicitamente rejeitou uma regra rígida fixa no backend ("2 pensei melhor... é melhor que abra modal de aviso... deixar o usuário confirmar se quer ou não") — o comportamento certo depende do julgamento de quem está subindo o arquivo naquele momento, não de uma regra estática. |
| **Ao substituir, o arquivo novo fica com um ID novo no Drive, ou o mesmo ID de antes?** | **Mesmo ID** — usando `files().update(fileId=..., media_body=...)`, que troca só o CONTEÚDO do arquivo, mantendo o mesmo `fileId`. Nunca apaga o arquivo antigo e cria um novo. | Qualquer link/referência externa que já aponte pra aquele arquivo (por `fileId`) continua funcionando depois da substituição — trocar o ID quebraria silenciosamente qualquer coisa que dependesse dele. |

### O teste de Nível 5 (rede real): projetado pra se auto-provisionar

Seguindo a [[Disciplina de Testes Automatizados]] (Nível 5 = integração externa real, sem mock nenhum), `agenda_videos/tests/test_nivel_5__drive_escrita.py` ganhou 3 testes novos pra `enviar_arquivo()` (criar, recusar substituição sem confirmação, substituir com confirmação mantendo o ID) — junto com o teste de idempotência de `buscar_ou_criar_subpasta()` que já existia, total de **4 testes**.

> [!important] A pasta-sandbox do teste (`_teste_automatizado`) não precisa mais ser criada manualmente
> Na primeira versão deste arquivo de teste, a pasta `_teste_automatizado` (onde TODA escrita de teste acontece, pra nunca sujar a estrutura real de produção) precisava ser criada manualmente 1 vez no Drive antes de rodar o teste. O usuário pediu explicitamente pra isso mudar: **"Eu não vou criar manualmente quero que o próprio teste crie ela."**
>
> A função `_garantir_pasta_teste_fixa()` resolve isso — acha a pasta ou cria na primeira vez, sozinha. O detalhe fino: essa função usa uma chamada **crua** à API do Drive (`servico.files().create(...)` direto), **nunca** chama `buscar_ou_criar_subpasta()` (que é o próprio SUT — Sistema Under Test) pra criar essa pasta-raiz do sandbox. Motivo: se `buscar_ou_criar_subpasta()` tivesse um bug de idempotência (por exemplo, sempre criar mesmo quando já existe), usar ela pra criar a própria pasta-raiz do sandbox **mascararia esse bug** — cada rodada de teste criaria uma pasta-raiz duplicada no Drive real, e nada no teste apaga essa pasta-raiz (só a subpasta criada DENTRO dela, no TearDown). Por isso a pasta-raiz só pode nascer de um caminho independente do que está sendo testado.

### Estado atual — validado com dado real, 18/08/2026

```
Results (33.76s): 4 passed
```

| Arquivo | Cobertura |
|---|---|
| `utilitarios_pasta.py` | 100% (19 stmts, 0 miss) |
| `arquivador.py` | 75% (51 stmts, 12 miss) |
| Total do pacote `drive/` | 82% |

Os 12 statements não cobertos em `arquivador.py` pertencem a `montar_caminho_local_organizado()`, partes de `baixar_arquivo()` e de `_obter_ou_criar_pasta_usados()`/`mover_para_usados()` — funções que **ainda não têm nenhum chamador** hoje, construídas de propósito pra uma feature futura diferente (postagem automática, que baixa o vídeo do Drive pra máquina do agente local). Não é dívida desta feature (Portal do Drive), é escopo de uma frente futura separada.

## Próximos passos (ainda não começados)

Esta lista é o que falta pra o Portal do Drive virar uma tela de verdade que alguém do time consegue usar — nada disso foi codado ainda:

1. **Endpoint POST no Django** — recebe o arquivo enviado pelo formulário, valida a extensão de novo no servidor (nunca confiar só na validação do navegador — arquivo pode vir de qualquer lugar, inclusive de alguém digitando a requisição na mão), chama `ArquivadorDrive.enviar_arquivo(...)`, e captura o `FileExistsError` pra devolver "já existe" de um jeito que o front-end saiba mostrar o modal de confirmação.
2. **Modal de confirmação** ("Você tem certeza que quer substituir o vídeo atual por esse?") — dispara quando o passo 1 devolver "já existe"; se o usuário confirmar, o front-end reenvia a mesma requisição com um sinal de "pode substituir" (`permitir_substituir=True`).
3. **View GET + template real** — a tela onde o usuário escolhe marca, EAN, fase, tipo de arquivo e o arquivo do computador dele, e vê o resultado do upload.
4. **Rota nova (`urls.py`)** — endereço da tela nova.
5. **Link no menu de navegação** — inserção dentro do dropdown "Agenda de Vídeos" em `core/templates/base_compartilhada/estrutura_base_global.html` (mesmo arquivo onde os outros links da Agenda de Vídeos já vivem).
6. **Validação manual de ponta a ponta**, pras 2 empresas (Magazine e Samvale) — subir um vídeo de verdade pela tela, confirmar que ele aparece na pasta certa do Drive de cada empresa, antes de considerar esta feature pronta.

## PAUSADO em 18/08/2026, 16h30 — troca de foco urgente do usuário

> [!warning] Estado exato no momento da pausa — nenhuma linha de código da tela foi escrita ainda
> Esta frente estava na etapa de **planejamento da interface** (item 1-5 da lista "Próximos passos" acima) quando o usuário pediu pra trocar de foco com urgência. O motor de baixo nível (`enviar_arquivo()`, `buscar_arquivo()`, `montar_nome_arquivo()`) já está pronto, commitado e validado (ver seções acima) — o que falta é 100% a camada de tela (view, template, URL, endpoint POST, modal, link no menu). Nada disso foi escrito ainda, nem em rascunho.

### As 3 perguntas de design feitas ao usuário — status atualizado em 20/08/2026, 00h34

1. **Fase e número da ocorrência**: a tela deve **pré-preencher sozinha** Fase/Ocorrência olhando pro ciclo atual do produto escolhido (campo `CicloVideo.fase`/`CicloVideo.numero_ocorrencia`, ver achado técnico abaixo), deixando a pessoa só confirmar ou trocar — ou a pessoa deve **sempre escolher manualmente** os 2 campos do zero, sem nenhum valor sugerido? **Continua sem resposta** — a tela implementada mostra sempre as 7 ocorrências fixas, sem filtrar pelo ciclo atual.
2. ~~Comportamento do modal de confirmação de substituição~~ — **superada pelo desenho novo**: o fluxo deixou de ser "1 arquivo por vez com confirmação de substituição" e virou envio em lote, onde cada arquivo é processado de forma independente; se já existir, só aquele fica marcado como "já existe, não enviado", sem travar os outros nem pedir confirmação de reenvio. Ver [[Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura]].
3. ~~Onde a tela vive~~ — **resolvida em 20/08/2026**: link próprio no dropdown "Agenda de Vídeos" (`Portal do Drive`, ícone `fa-cloud-arrow-up`), ao lado de "Agenda"/"Histórico"/"Configurações".

~~Pergunta nova de 20/08 (00h34): escolha de produto pela tela~~ — **resolvida em 20/08/2026, 03h00**: a tela virou lista de todos os produtos reais, com busca e paginação (ver [[Portal do Drive Vira Lista de Todos os Produtos - Lazy-Load por Produto e Leitura Pinada na Pasta de Teste]]). A leitura/escrita do Drive, porém, continua pinada na pasta de teste pra qualquer produto aberto — decisão deliberada, até essa tela nova ser validada sem risco de mexer em pasta real. Rotear por `produto.marca`/`produto.ean` de verdade fica pra depois.

### Achados de reconhecimento de código — já confirmados, prontos pra usar quando retomar (evita reinvestigar do zero)

| Achado | Onde está, no código real | Por que importa pro Portal do Drive |
|---|---|---|
| Padrão de upload via HTMX já existe no projeto | `shopee/views.py`, função `view_processar_promocao` (e o equivalente em `tiktok/views.py`) — usa `request.FILES.get(...)`; erro re-renderiza só um template de modal parcial (`estrutura_parcial_modal_erro_promocao.html`), sem recarregar a página nem perder o arquivo escolhido; sucesso manda o navegador de verdade pra outra tela via header `HX-Redirect` | Dá pra seguir exatamente esse mesmo padrão pro endpoint do Portal do Drive, em vez de inventar um novo — inclusive pro modal de "já existe, confirmar substituição?" |
| `Produto` já tem `marca` e `ean` como campos próprios | `produtos/models/produto.py`, dataclass `DadosIdentificacaoProduto` (campos `ean`, `marca`, junto de `sku`, `titulo`, etc.) | A tela pode deixar a pessoa **escolher o Produto** (por nome/EAN, com busca) em vez de digitar marca e EAN à mão — evita o mesmo tipo de erro de digitação que a [[Convencao de Nomenclatura de Arquivos no Drive]] já existe pra prevenir |
| `CicloVideo` guarda a fase e a ocorrência atuais de cada produto | `agenda_videos/models/ciclo_video.py` — campos `fase` (choices de `Fase`) e `numero_ocorrencia` (`PositiveIntegerField`), com `UniqueConstraint(fields=['produto', 'fase', 'numero_ocorrencia'])` | É a fonte de dado pra responder a Pergunta 1 acima — se a resposta for "pré-preencher sozinho", é daqui que vem o valor sugerido |
| Já existe 1 view no mesmo espírito (aciona o Drive a partir de 1 produto) | `agenda_videos/views.py`, `view_verificar_produto_drive` (linha ~299) e `view_verificar_todos_drive` (linha ~315) | Bom modelo de referência de como uma view da Agenda de Vídeos já trata erro de conexão com o Drive (`except Exception` → mensagem amigável, nunca stacktrace cru pro usuário) |
| Local exato pro link no menu, se a resposta da Pergunta 3 for "link novo" | `core/templates/base_compartilhada/estrutura_base_global.html`, dentro do bloco `<!-- Agenda de Vídeos -->` (por volta da linha 267-283), ao lado dos links já existentes pra `agenda_videos_principal`, `agenda_videos_historico` e `agenda_videos_configuracoes` | É o arquivo e o bloco exato onde a nova rota entraria — nenhuma investigação nova precisa ser refeita |

### Próximo passo real ao retomar esta frente

Repetir (ou já ter em mãos) a resposta do usuário pras 3 perguntas acima, e só depois escrever, nesta ordem: o endpoint POST (reaproveitando o padrão HTMX da tabela acima) → o modal de confirmação → a view GET + template + rota nova em `urls.py` → o link no menu (se aplicável) → validação manual de ponta a ponta nas 2 empresas.

## Checklist desta nota

- [x] Explica o quê, por quê, pra quê e como pra cada decisão e função nova.
- [x] Cita arquivo e função reais em cada afirmação sobre código.
- [x] Tem exemplo concreto (`Mensal_01_Roteiro.txt`, resultado real de teste 4 passed).
- [x] Usa tabela pras 3 decisões de design comparáveis.
- [x] Fecha com o estado real validado (não só a explicação em abstrato) e com os próximos passos concretos.

## Relacionado

- [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]
- [[Service Account Nao Tem Cota Propria no Drive - Upload Real Exige OAuth Como Usuario Real]]
- [[Convencao de Nomenclatura de Arquivos no Drive]]
- [[Disciplina de Testes Automatizados]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]]
- [[Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo]]
- [[Implementacao Real do Portal do Drive - Layout Lateral, Envio em Lote, Player Proprio e Exclusao Segura]]
- [[Portal do Drive Vira Lista de Todos os Produtos - Lazy-Load por Produto e Leitura Pinada na Pasta de Teste]]
