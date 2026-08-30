---
tipo: checkpoint
dominio: 
status: concluido
criado: 27/08/2026
atualizado_em: 28/08/2026 00:57
relacionado: [Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre, Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]
---

# Checkpoint — Tela de Visualização de Fotos dos Anúncios ("Hub de Fotos")

## O quê é esta nota, e como ela vai ser usada

**O quê**: nota viva (checkpoint — atualiza no lugar, não gera nota nova a cada sessão) que registra todo o contexto, achado técnico e decisão em aberto da nova tela de visualização de fotos de anúncio. Criada a pedido explícito do usuário (27/08/2026, 20:23), pra servir de referência única enquanto a ideia ainda está em discussão — antes de qualquer linha de código ser gerada.

**Escopo de hoje, dito explicitamente pelo usuário**: "Criar uma tela no sistema onde eu possa visualizar todas as imagens de um anúncio do ML." Vídeo está no radar da equipe (ver Contexto abaixo), mas fora do escopo de hoje.

## Contexto — por que essa tela importa agora

A equipe (usuário + Lucas + Cauã) está tentando melhorar a qualidade geral dos anúncios (título, descrição, fotos, vídeos, entre outros). O foco atual está especificamente em **multimídia — fotos e vídeos** — por 2 motivos declarados: maior complexidade que os outros itens, e maior retorno percebido. Observação do usuário: quanto melhor a parte visual, mais retorno — o algoritmo do Mercado Livre vem priorizando esse quesito.

## Problema atual

Existem várias tentativas em paralelo de otimizar foto/vídeo dos anúncios, mas **não existe hoje uma forma agregada de visualizar o estado das imagens** — é preciso abrir anúncio por anúncio, manualmente, pra saber como cada 1 está. Isso torna difícil ter visão de conjunto sobre o que precisa de atenção.

## Objetivo da tela nova

Uma tela semelhante ao **Hub de Anúncios** (tela real, já existente — ver seção "Achados técnicos" abaixo): mesma árvore hierárquica (EAN/SKU → Base/Catálogo → Simples), mas mostrando informação diferente por nó — em vez de preço/qualidade/competição, mostra **todas as fotos daquele anúncio, na ordem real** (url 01, 02, 03...).

**Resultado esperado**, nas palavras do usuário: uma tela de fácil visualização, onde baste percorrer com os olhos pra já perceber o estado visual real de cada produto, em todos os seus anúncios, de forma eficiente.

## Achados técnicos já levantados (grounded no código real)

### O Hub de Anúncios existe, e a árvore já está pronta pra reaproveitar

- View: `mercado_livre/views.py`, função `view_hub_anuncios` — URL `anuncios/` (`name='mercado_livre_anuncios'`).
- Template: `mercado_livre/templates/mercado_livre/estrutura_hub_anuncios.html` (ainda não lido em detalhe — ver pendência abaixo).
- Árvore montada em `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py`, pelas funções `carregar_variacoes_por_sku()` → `montar_estrutura_de_sku()` → `classificar_lote_de_skus()`.

**Vocabulário padronizado da árvore** (direto do comentário de cabeçalho do arquivo):

| Termo | O que é |
|---|---|
| SKU | Identifica o Produto (ERP). |
| MLB | Identifica o `AnuncioMercadoLivre` — agrupador; status/tipo/catálogo/logística vêm daqui. |
| Variação | Identifica o `VariacaoAnuncioMercadoLivre` — a unidade individual real. **Sempre existe pelo menos 1 por MLB**, mesmo sem variação de cor/tamanho. |
| Folha | O nó final da árvore = 1 Variação = 1 card na tela. Um MLB com 20 variações gera 20 folhas/cards. |

A árvore, hoje, é: Página de Catálogo (agrupada por `catalog_product_id`) → Base(s) → Catálogo(s) filho(s) (via `item_relations`) → Órfãos (catálogo sem base pareada) — e, à parte, Anúncios Simples. Tudo isso já filtra por status/tipo/logística/estoque/desconto/conexão ERP/score/competição — sistema de filtro maduro, reaproveitável.

### O que já é capturado sobre imagem hoje — só a foto de capa

Campo por campo, rastreado até a origem:

| Onde mora | Campo | Conteúdo |
|---|---|---|
| `VariacaoAnuncioMercadoLivre` (model, `mercado_livre/models/variacao.py`) | `thumbnail_url` | Thumbnail cru da API (`body.thumbnail`). |
| `VariacaoAnuncioMercadoLivre` | `imagem_principal_url` | Foto de capa, derivada da 1ª foto do array `pictures` (função `extrair_imagem_principal()` em `buscar_detalhes.py`, troca sufixo de tamanho pra versão grande). |
| `VariacaoAnuncioMercadoLivre` | `num_fotos` | **Só a contagem** (`len(picture_ids)` da variação) — não guarda a lista em si. |

Preenchidos por `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py`, lendo `detalhes_mlbs.json` (saída de `buscar_detalhes.py`).

> [!success] Achado principal, corrigido (27/08/2026, 21:33) — precisa rodar `buscar_detalhes.py` de novo, mas sem endpoint novo nem custo extra de API
> `buscar_detalhes.py` já recebe, em toda chamada, o array `pictures` **completo** do item (cada foto com `id`, `url`, `secure_url`, `size`, `max_size`, `quality` — confirmado com dado real, ver seção "Achado real via script de exploração" abaixo) — só usa a primeira posição pra montar `imagem_principal`, e descarta o resto dentro de `extrair_campos_pai()`/`processar_item()`, **antes** do registro ser serializado em `detalhes_mlbs.json`.
>
> **Correção importante em relação à 1ª versão deste achado**: não é um dado "já salvo, só descartado" — é um dado descartado **em memória, durante o processamento**, nunca chega a ser escrito no arquivo final. Ou seja, o `detalhes_mlbs.json` que já existe hoje em disco **não contém** o array de fotos — reprocessar esse arquivo não resolve nada. A única forma de capturar o array completo é rodar `buscar_detalhes.py` de novo, com o código de extração ajustado pra manter `pictures` (e não descartar). Isso **não é uma chamada nova/extra à API** — é a mesma chamada que o script já faz normalmente (`GET /items?ids=`, mesmo lote de 20), só parando de jogar fora 2 campos que a resposta já trazia.

### Achado arquitetural — fotos vivem no MLB, variação só referencia um subconjunto

As fotos não pertencem à variação — pertencem ao **anúncio (MLB)**, como um pool único (`pictures`, cada 1 identificada por `id`). Cada **variação** referencia só um subconjunto desse pool, pela lista `picture_ids` (ex: variação "Azul" pode apontar só pras 3 fotos azuis, de um total de 12 do anúncio inteiro).

> [!success] Decisão fechada (27/08/2026, 20:34; simplificada em 27/08/2026, 21:33) — pool completo por MLB, sem exceção nenhuma
> Princípio central, nas palavras do usuário: mostrar fielmente o que seria mostrado para um cliente, o **real**, nunca um recorte "bonito" e potencialmente enganoso.
>
> **Regra única, sem distinção por tipo de folha**: toda folha da árvore — seja o MLB inteiro, seja uma variação — mostra **todas** as fotos do pool daquele MLB (`pictures`, nível do anúncio), sem dedup entre anúncios. Mesmo que o mesmo produto tenha 20 MLBs e todos pareçam ter as mesmas fotos, cada MLB exibe o seu próprio conjunto, porque MLBs do mesmo produto **não são cópias garantidamente idênticas** — cada anúncio tem fotos próprias, potencialmente diferentes dos demais, e isso não pode ser escondido nem simplificado.
>
> **Simplificação de 21:33 — a exceção da variação foi removida**: a decisão original (20:34) prevalecia uma exceção pra folha=variação (mostrar só o subconjunto via `picture_ids`, com tag indicando isso). O usuário removeu essa exceção: anúncios com variação são **menos de 1% da base**, não vale a complexidade extra de tratar esse caso à parte. Consequência prática: não é preciso capturar/tratar `picture_ids` por variação pra esta tela — toda folha, sem exceção, usa sempre o pool completo do MLB.

### Achados adicionais pro checklist de qualidade visual (a pedido do usuário)

> [!info] Tags de imagem do próprio item — já catalogadas na Referência da API
> `good_quality_picture` / `poor_quality_picture` / `unknown_quality_picture` — o Mercado Livre já sinaliza nativamente a qualidade da imagem, dentro do array `tags` do item. Detalhe completo na tabela de tags em [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]. Ainda não capturado/usado por nenhum código do projeto — candidato real a enriquecer a tela nova (ex: destacar visualmente um card cuja foto o próprio ML já classifica como baixa qualidade).

> [!info] Achado novo — sistema de Qualidade do Anúncio já existente tem um grupo específico pra Imagens (esclarecido em 27/08/2026, 20:34)
> `CriterioQualidade` (`mercado_livre/models/criterio_qualidade.py`) tem um `Grupo` chamado `UP_PICTURES` ("Imagens"), dentro de um sistema de critério/qualidade que já existe no projeto (`QualidadeAnuncio`/`CriterioQualidade`, com cores próprias em `qualidade_anuncio.py`). Esse sistema aparenta vir de outro endpoint da API (recomendação/health de qualidade), **ainda não estudado** na camada de Referência da API.
>
> **Esclarecimento do usuário**: `UP_PICTURES` não "muda o jogo" — ele não julga se uma foto é boa ou ruim, só verifica se o anúncio tem uma **quantidade mínima** de fotos ("esse anúncio tem X fotos"). É dado útil e vale adicionar à tela como informação complementar, mas é categoricamente diferente das tags nativas de qualidade de imagem (`good_quality_picture`/`poor_quality_picture`/`unknown_quality_picture`) — aquelas sim avaliam a foto em si; `UP_PICTURES` só conta.

### Achado real via script de exploração (27/08/2026, 21:33) — estrutura de `pictures` confirmada com dado real

Criado `scripts_exploracao_ML/investigar_retorno_bruto_item.py` — script solto (não é comando de management; padrão já usado no repo em `scripts_exploracao_ML/`/`scripts_dev/`), só leitura, busca o retorno **bruto** de `GET /items?ids=` (mesmo endpoint de `buscar_detalhes.py`) pra 1 MLB, sem nenhum filtro.

Testado com `MLB5838465508` (Bomba Costa Agrícola, Magazine, sem variação, 12 fotos, `listing_type_id: gold_special`). Confirmado 100% real, não mais suposição: `pictures[]` = `{id, url, secure_url, size, max_size, quality}`.

**Decisão de quais campos capturar por foto** (definida pelo usuário, 27/08/2026, 21:33):

| Campo | Uso decidido |
|---|---|
| `id` | Chave da foto — necessário mesmo sem uso direto na tela (referência). |
| `url` | A foto em si — dado principal a exibir. |
| `secure_url` | Fallback de `url` — mesmo caminho, só troca `http` por `https` (confirmado no teste: os 2 campos têm o path idêntico). |
| `size` / `max_size` | Capturar em **toda foto**, não só na capa — objetivo declarado: detectar imagem de baixa resolução. Vêm como string `"LxA"` (ex: `"500x500"`), não como número separado — precisa parsear se for comparar/ordenar. |
| `quality` | Ainda é mistério — veio `""` (vazio, não `null`) nas 12 fotos testadas. Decisão: capturar mesmo assim, pra observar em mais exemplos reais e entender a utilidade depois. |

**Achados adicionais do teste, não decisões, só observação registrada**:

- Extensão de arquivo varia dentro do mesmo array `pictures` (esse MLB tem `.jpg` e `.webp` misturados) — `extrair_imagem_principal()` já lida bem com isso hoje (`rsplit(".", 1)`, format-agnostic).
- `tags` de nível de item **já são capturadas hoje**, cru (`extrair_campos_pai()`, sem decodificar) — não é gap de captura, é gap de decodificação/uso. Nesse MLB específico, a única tag relacionada a imagem presente foi `good_quality_thumbnail` — nenhuma variante `_picture` (`good_quality_picture`/`poor_quality_picture`/`unknown_quality_picture`) apareceu. Em aberto: não confirmado ainda se essas tags são condicionais/raras ou se só não se aplicaram a este MLB específico — precisa de mais amostras, idealmente 1 MLB que a equipe já saiba ter foto de baixa qualidade.
- **Achado não esperado**: o item tem um campo de nível raiz chamado `health` (veio `null` neste teste). Candidato forte a ser a origem do sistema `UP_PICTURES`/Qualidade do Anúncio já existente no código (`CriterioQualidade`) — até agora só se sabia que esse sistema "aparenta vir de outro endpoint, não estudado". Pode precisar de parâmetro extra na chamada (ex: algo como `include_attributes=all`, no mesmo espírito do `include_internal_attributes` já visto na doc de Atributos) ou de endpoint próprio. Ainda não investigado — pendência nova.

### Onde guardar as fotos — decisão do ponto 2 (27/08/2026, 21:48)

> [!success] Decidido: `fotos = models.JSONField(blank=True, null=True)` em `AnuncioMercadoLivre` — não em `VariacaoAnuncioMercadoLivre`, não tabela própria
> Achado que fundamenta a decisão: `AnuncioMercadoLivre` (o modelo "agrupador", 1 linha por MLB) **já tem exatamente esse padrão** — `item_relations = models.JSONField(blank=True, null=True)`, populado em `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py` a partir de `primeira.get('item_relations')` (`primeira` = a 1ª linha do grupo de registros daquele MLB, porque dado de nível de anúncio é idêntico entre todas as variações — comentário do próprio código confirma isso). `fotos` é o mesmo tipo de dado (array de objetos vindo direto da API, nível de anúncio, nunca de variação) — mesma solução.
>
> **3 pontos de mudança, ainda não implementados** (ficam pro momento de execução, não agora):
> 1. `buscar_detalhes.py`, `extrair_campos_pai()`: passa a manter `"pictures": body.get("pictures", [])` no registro (hoje descartado).
> 2. `AnuncioMercadoLivre` (model): novo campo `fotos = models.JSONField(blank=True, null=True)`.
> 3. `importar_anuncios_ml.py`: `dados_anuncio` ganha `fotos=primeira.get('pictures')`; `campos_anuncio` (lista usada no `bulk_update`) passa a incluir `'fotos'`.
>
> **Alternativa descartada**: tabela própria (1 linha por foto, FK pro anúncio). Motivo: hoje o pool de fotos é sempre lido por inteiro, em ordem, nunca 1 foto isolada por SQL — não há benefício real pra justificar a migração/join extra, e o `JSONField` já é convenção validada no mesmo modelo (`item_relations`).

> [!info] Nota de design pro futuro (fora de escopo hoje, não implementar agora) — botão de "marcar foto pra refazer" exige tabela própria, separada
> Pergunta feita pelo usuário: um JSONField sozinho suportaria um botão por foto tipo "isso está ruim, preciso refazer"? Resposta: não com segurança — `fotos` é 100% dado de consumo, sobrescrito por inteiro a cada reprocessamento (mesmo padrão de `item_relations` hoje: `setattr` direto, sem merge). Um flag de negócio embutido dentro desse JSON seria apagado na próxima reimportação, a menos que se construísse lógica de merge por `id` de foto — complexidade e risco evitáveis.
>
> Solução, se/quando esse botão vier a existir: **tabela própria e independente** (ex: `FotoMarcadaParaRefazer`, chave `anuncio` + `foto_id`), nunca embutida no `fotos` (JSONField). Mesmo padrão que o projeto já usa hoje pra dado de negócio — `CriterioQualidade`/`QualidadeAnuncio` também é tabela separada, nunca embutido em campo espelho da API. **Decisão explícita do usuário (27/08/2026, 21:48): por enquanto, sem botão nenhum — só a parte de visualização.**

### Direção visual do miolo — decisão dos pontos 3 e 4 (27/08/2026, 22:03)

> [!success] Ponto 3 — reaproveitar a árvore direto, sem variante própria (decidido sem necessidade de discussão adicional)
> Decisão do usuário: `montar_estrutura_de_sku()`/`carregar_variacoes_por_sku()` (e toda a árvore que elas montam — Página de Catálogo → Base/Catálogo/Órfão, mais Anúncios Simples) são reaproveitadas **direto**, sem variante própria. Motivo, nas palavras do usuário: "é literalmente a exata mesma estrutura que eu quero nessa tela... eu passei muito tempo estudando como montar uma estrutura organizada... aquela foi a melhor que encontrei." Ponto fechado, sem reabrir.

> [!success] Ponto 4 — estrutura do template real conferida, e miolo do card definido com mockup
> Conferido de verdade (`estrutura_hub_anuncios.html` + `estrutura_parcial_card_anuncio.html` + `layout_hub_anuncios.css`): a árvore (busca/filtros → SKU → página de catálogo → `hub-grupo-base` → folha) chama 1 parcial de card por folha. O card atual é uma linha horizontal: imagem única fixa (70×90px) + cabeçalho de identificação (badges de tipo/logística/flex + título + MLB/SKU com botão copiar) + miolo de preço/situação/reputação (termômetro de score ou badge de competição) + link "Ver no ML".
>
> **Decisão**: o cabeçalho de identificação (badges + título + MLB/SKU) é **mantido igual** ao card atual — ajuda a reconhecer qual anúncio é qual. Só o miolo muda: em vez de preço/situação/reputação, vira a área de fotos.
>
> **Mockups gerados (2 iterações) e decisão final da grade**:
> 1. 1ª tentativa — faixa horizontal rolável, 1 fileira só. Rejeitada pelo usuário: com 10-12 fotos (o normal na base hoje) fica ruim de usar, força rolagem lateral card por card.
> 2. 2ª tentativa — grade fixa (mesmo nº de colunas em todo card, linhas variam conforme a quantidade de fotos): comparadas 4 colunas × 3 linhas (miniatura maior) contra 6 colunas × 2 linhas (miniatura menor, card mais compacto). **Decidido: 6 colunas.** Motivo: cabem mais anúncios visíveis na tela por vez, e as miniaturas continuam grandes o bastante pra perceber problema visual. Considerado no teste: monitores de escritório são 18-22" Full HD — a grade de 6 colunas (~550px de largura total) cabe com folga nesse tamanho de tela.
> 3. **Regra de geração da grade, confirmada pelo usuário**: só existe 1 quadradinho por foto que existe de verdade — quando o anúncio tem menos fotos que a capacidade de uma linha completa (6), a grade simplesmente termina ali, sem nenhum placeholder vazio reservado.
>
> **Contexto de volume real, dito pelo usuário**: hoje a média de fotos por anúncio fica entre 10 e 12; a equipe está tentando reduzir e padronizar esse número pra 7 no futuro. A grade de 6 colunas comporta bem os 2 cenários (hoje: ~2 linhas cheias; meta futura de 7: 1 linha cheia + 1 quase vazia).

### Implementação dos pontos 1-4 — feita e funcional, mas visual precisa de refino (27/08/2026, 22:30)

> [!success] Código aplicado pelo usuário, comandos rodados, tela funcionando de ponta a ponta
> Todos os pontos 1-4 (fonte do dado, onde guardar, reaproveitar a árvore, miolo em grade de fotos) foram implementados de verdade: `buscar_detalhes.py` passou a manter `pictures`; campo `fotos` (`JSONField`) criado em `AnuncioMercadoLivre` e migrado; `importar_anuncios_ml.py` grava `fotos`; `info_variacao()` expõe `fotos` pro template; nova view `view_hub_fotos` + rota `fotos/` + link no menu; novo template + parcial de card + CSS (`layout_hub_fotos.css`, grade fixa de 6 colunas). Usuário rodou `buscar_detalhes` de novo + `popular_banco`/`importar_anuncios_ml` pra popular a base existente.
>
> **Feedback do usuário, literal**: "Toda a parte funcional até aqui funciona. Mas está horrível visualmente." Ou seja: a base estrutural (árvore, dado, grade) está correta e funcionando — o problema é puramente de acabamento visual, não de arquitetura ou de dado. Refino visual será feito **por partes**, a partir daqui, item por item (não uma reescrita geral de uma vez).

### Refino visual — rodada 1 (27/08/2026, 23:02) — em andamento, não fechado

> [!info] Feedback real sobre a tela implementada (print da tela rodando) — 4 problemas
> 1. Muito espaço inútil sobrando no card. 2. Numeração ("01", "02"...) atrapalhando a visualização da própria foto. 3. Falta de dado sobre cada imagem (tamanho, por exemplo). 4. Imagens muito pequenas.
>
> **Causa raiz identificada**: a grade usava `grid-template-columns: repeat(6, 84px)` — 6 colunas de largura fixa e pequena, deixando o resto do card (bem mais largo que isso na tela real) vazio, e a numeração era um overlay por cima da própria foto.

> [!warning] 1ª tentativa (`repeat(6, 1fr)`) corrigiu o espaço, mas criou um problema novo
> Trocar pra `1fr` fez a grade esticar até preencher a largura do card — resolve o espaço vazio, mas o usuário rejeitou: "as fotos não podem ficar 'mudando de tamanho' de acordo com a quantidade... elas deveriam ter tamanho fixo travado, padronizado." Ou seja: tamanho de foto não pode depender de quantas fotos existem nem da largura do card.

> [!success] Solução final, testada e aprovada nesta rodada: `flex-wrap` com largura fixa em pixel, não grid com colunas
> Trocada a abordagem de "grid com N colunas" pra "flexbox com item de largura fixa (`width` em `px`) e `flex-wrap: wrap`" — cada foto sempre mede o mesmo tanto, e a linha simplesmente quebra sozinha pra caber quantas couberem (mais fotos por linha em tela larga, menos em tela estreita, mas o tamanho individual nunca muda). A numeração saiu de cima da imagem e virou uma legenda embaixo, junto com a resolução (`max_size`, ex: "1200x1200") — resolve os problemas 2 e 3 ao mesmo tempo.
>
> **CSS final testado pelo usuário** (`layout_hub_fotos.css`):
> ```css
> .card-fotos-grid {
>     display: flex;
>     flex-wrap: wrap;
>     gap: 10px;
>     margin-bottom: 8px;
> }
> .card-fotos-item {
>     width: 180px;
>     flex: 0 0 auto;
>     border-radius: 6px;
>     border: 1px solid #021e5094;
>     background: #f4f6f9;
>     overflow: hidden;
> }
> .card-fotos-item img {
>     width: 100%;
>     aspect-ratio: 1 / 1;
>     object-fit: cover;
>     display: block;
> }
> ```
> Validado por print em 2 larguras de viewport (1366×768 e 1600×900): tamanho de foto idêntico nos 2 casos (180px), só a quantidade por linha mudou (6 numa tela, 7 na outra) — comportamento correto, confirmado visualmente. A legenda de resolução já mostrou utilidade real no teste: a foto 04 de 1 dos anúncios apareceu como "834x1200", destoando visivelmente das demais "1200x1200" — exatamente o tipo de sinal que esta tela deveria expor.
>
> **Pendência explícita**: usuário está testando num monitor QHD 27" (não é o hardware real da equipe) — validação final no monitor de escritório real (18-22" Full HD) fica pra amanhã. `180px` pode precisar de ajuste depois desse teste. **Refino não está fechado** — usuário confirmou explicitamente "ainda não acabamos".

### Visualizador de fotos (modal/lightbox) — construído e refinado nesta rodada (27/08/2026, 23:38)

> [!success] Pedido do usuário: fotos clicáveis, com navegação completa
> Clicar numa foto abre ela centralizada, em tamanho maior, com legenda própria embaixo (dado da foto); acima da imagem, um cabeçalho identificando o anúncio (título/MLB/SKU) e um contador "Foto X de N"; ícones de fechar, anterior e próxima; nada disso pode ficar sobreposto à imagem — tudo ao redor.
>
> **Implementado**: cada foto do card carrega o array completo de fotos daquele anúncio via `{{ anuncio.fotos|json_script:anuncio.mlb }}` (bloco JSON invisível, 1 por anúncio); clique abre um modal único (reaproveitado pra página inteira) que lê esse JSON e navega dentro dele. Novo arquivo `mercado_livre/static/mercado_livre/js/script_hub_fotos.js` (JS puro, mesmo padrão de `script_hub_anuncios.js`). Navegação dá a volta (última foto → primeira e vice-versa); atalhos de teclado (`Esc` fecha, `←`/`→` navegam) e clique fora da imagem também fecham — adicionados por conveniência, além do que foi pedido.

> [!warning] Achado real — fotos apareciam borradas no modal, causa identificada (não 100% documentada, mas coerente com código existente)
> As URLs cruas do array `pictures` (`url`/`secure_url`) servem a versão **pequena** da foto (`size`, ex. `500x500`), marcada pelo sufixo `-O` na URL. `extrair_imagem_principal()` (já existente, só usado pra foto de capa) já trocava esse sufixo por `-F` pra pegar a versão grande — o modal novo não fazia essa troca pra nenhuma foto, por isso a imagem ampliada parecia borrada (upscaling de uma fonte pequena). Corrigido em JS (`urlGrande()`), aplicando a mesma troca de sufixo em toda foto aberta no modal. **Não é certeza documentada** — é inferência a partir do código existente, sem confirmação na doc oficial do que `-F` significa exatamente.

> [!success] Iteração de tamanho do quadro — várias rodadas até fechar
> Motivo técnico esclarecido nesta rodada, útil registrar: reduzir uma imagem grande pra um quadro menor nunca borra (só descarta pixel); esticar uma imagem pequena pra um quadro maior sempre borra (o navegador inventa pixel). A miniatura da grade (fora do modal) já resolvia isso com `flex-wrap` + largura fixa (180px, ver rodada anterior). O quadro do modal passou por 3 tentativas: (1) `vw`/`vh` com tetos separados — não-quadrado, desperdiçava espaço porque a dimensão menor sempre limitava; (2) `vmin` (o menor entre `vw`/`vh`, aplicado igual nos 2 eixos — sempre um quadrado que aproveita ao máximo a tela) trocando de `90vmin/1100px` (grande demais) pra `75vmin/850px` (pequeno demais) até fechar em **`80vmin`, teto `1100px`**. Nessa refatoração final, o tamanho virou 1 variável CSS só (`--modal-fotos-tamanho`, definida em `.modal-fotos-overlay`), referenciada em cabeçalho/quadro/legenda — só precisa mudar em 1 lugar daqui pra frente, não mais 3.

> [!success] Última rodada de ajuste — contraste e sobreposição corrigidos
> 3 problemas reais, resolvidos juntos: cabeçalho e legenda quase sumiam (dependiam só da transparência do fundo escuro geral, sem cor própria) — corrigido dando fundo sólido próprio (`var(--navy-deep)`, mesma cor navy já usada no resto do sistema) a cabeçalho e legenda. Setas de navegação estavam posicionadas **dentro** do quadro branco da foto (absolutas, sobrepondo a imagem) — corrigido movendo elas pra fora do quadro, numa nova área flexível (`.modal-fotos-area`: seta | quadro da foto | seta), nunca mais tocando a imagem.
>
> **Confirmação do usuário**: "ok agora ficou top." **Mas o refino como um todo não está fechado** — usuário confirmou explicitamente "ainda não finalizamos tudo" (27/08/2026, 23:38). Não há, neste momento, item específico pendente registrado pra continuar — só o status geral de "em aberto".

### Otimização de carregamento das fotos — `-O` na grade + preload em segundo plano pro `-F` (28/08/2026, 00:08)

> [!warning] Problema relatado pelo usuário
> Toda vez que abria uma foto no modal, ou trocava entre uma e outra, a imagem grande recarregava do zero — como clicar num link novo, mesmo já tendo visto aquela foto antes na sessão.

> [!success] Causa real e solução — preload em vez de cache manual
> A miniatura da grade usa a URL `-O` (pequena) e o modal usa `-F` (grande, ver achado do borrão acima) — são URLs diferentes, então carregar uma nunca beneficia a outra; a `-F` só era pedida no exato instante do clique, daí a demora sentida como "abrindo do zero". Solução: não criar cache manual (o navegador já cacheia por URL nativamente) — disparar o carregamento da `-F` **antes** de precisar dela, em segundo plano, com `new Image()`. 2 camadas implementadas em `script_hub_fotos.js`: (1) ao abrir o modal, pré-carrega em background todas as fotos daquele MLB (resolve alternar entre fotos); (2) ao passar o mouse sobre o quadradinho da grade, pré-carrega especificamente aquela foto grande antes do clique (resolve a abertura da primeira foto). **Resultado confirmado pelo usuário**: "ficou ótimo, zerou o tempo de delay".

> [!success] Descartada a ideia de usar `-F` também na grade — medido com dado real, não achismo
> Ideia natural que surgiu: já que precisa de `-F` de qualquer forma, por que não usar `-F` em tudo (grade + modal), garantindo cache 100% e descartando o preload? Testado com números reais de uma foto (medidos pelo usuário via DevTools): `-O` = 500×500, 89,1 kB; `-F` = 1200×1200, 344 kB — fator ~3,9x mais pesado, e decodificado por inteiro mesmo exibido num quadrado de 179px. Com a paginação real do Hub (`por_pagina = 25`, confirmado em `views.py`) e ~10-12 fotos por folha, uma página carrega ~250-300 fotos: hoje ~25-27 MB (`-O`); trocando tudo pra `-F` iria a ~90-100+ MB por carga de página, repetido a cada troca de página/filtro — descartado. Preload seletivo (só a foto que vai ser vista) resolve o mesmo problema sem esse custo.

> [!info] Achado extra — lazy loading confirma a decisão
> Usuário testou scroll muito rápido pela tela: mesmo com `-O` (89 kB), ainda é perceptível ~1s de carregamento das fotos entrando na tela (`loading="lazy"` buscando just-in-time). Conclusão do próprio usuário, correta: com `-F` esse mesmo efeito seria bem mais lento. Ajuste fino (margem maior de pré-carregamento via `IntersectionObserver`) foi levantado como opção, mas **descartado por ora** — usuário decidiu manter como está.

> **Encerramento explícito do usuário**: "otimização encerrada por aqui" (28/08/2026, 00:08).

### Fechamento — tela concluída e validada (28/08/2026, 00:44)

> [!success] Reestruturação do cabeçalho do card e rodapé de ações
> Última rodada de refino visual: o cabeçalho do card (badges + título + MLB/SKU) estava sem contraste e sem separação do corpo (grade de fotos) — tudo empilhado com o mesmo peso visual, e o botão "Ver no ML" parecia jogado ao final, sem âncora. Reestruturado o card em 3 blocos visuais: **cabeçalho** (fundo levemente tingido, borda inferior, agrupando badges/título/MLB-SKU), **corpo** (contagem + grade de fotos, sem nenhuma mudança na grade em si — já validada antes) e **rodapé** (barra com borda superior, botões alinhados à direita). Reaproveita padrões já existentes no CSS do sistema (par cabeçalho/corpo de `.hub-sku-header`/`.hub-sku-conteudo`; barra de rodapé com borda superior de `.hub-filtros-acoes`) — nenhum estilo novo, só reaplicação do vocabulário visual já existente. Usuário fez ajustes manuais finos por cima da proposta e aprovou o resultado.

> [!success] Botão adicional "Editar no ML" (URL placeholder)
> Pedido final do usuário: um botão "Editar no ML" ao lado de "Ver no ML", com ícone de lápis (o "Ver no ML" ganhou ícone de olho). URL do editor de fotos do ML ainda não disponível — botão criado com `href="#"` e comentário `TODO` no template, marcado explicitamente pra preencher com a URL real depois. Rodapé agora tem os 2 botões lado a lado, mesmo estilo visual, espaçados por `gap`.

> **Confirmação final do usuário**: "Ficou muito boa essa tela... ficou realmente excelente." Tela declarada **completamente pronta e validada** — encerra esta frente de trabalho (Hub de Fotos: dado, árvore, grade, modal/lightbox, otimização de carregamento e refino de cabeçalho/rodapé). Única pendência remanescente é não-visual: preencher a URL real do botão "Editar no ML" quando disponível (ver checklist).

### Reforço do `.gitignore` e commit/push finais (28/08/2026, 00:57)

> [!success] `.gitignore` reforçado — dumps do script de exploração não entram mais no repo
> `scripts_exploracao_ML/investigar_retorno_bruto_item.py` gera, ao rodar, um dump bruto (`investigacao_bruta_{MLB}.json`) que aparecia como untracked no `git status`. Adicionada a regra `scripts_exploracao_ML/*.json` ao `.gitignore`, seguindo o mesmo padrão já usado no repo pra outras pastas de exploração (`scripts_exploracao_ERP/saidas/`, `integracao_sysemp/retorno_api/`) — dado de investigação pontual, não é pra entrar no histórico. Só o script `.py` continua rastreado normalmente.

> **Commit e push feitos pelo usuário** (28/08/2026, 00:57): todo o código desta frente (dado/model/migração/view/URL/menu/template/parcial/CSS/JS + script de exploração + `.gitignore`) foi commitado e enviado pra `origin/dev`. Trabalho seguro pra migração de computador — código no repositório remoto, decisões e histórico completos nesta nota.

## Checklist vivo — itens a decidir ou investigar (atualizar aqui conforme a conversa avança)

- [x] **Pool por MLB vs. subset por variação** — decidido e simplificado (27/08/2026, 21:33): toda folha, sem exceção (mesmo se for variação), mostra o pool completo de fotos do MLB. Variação não recebe tratamento especial — são menos de 1% da base. Ver achado arquitetural acima.
- [x] **Reaproveitar a árvore** — decidido (27/08/2026, 22:03): `montar_estrutura_de_sku()`/`carregar_variacoes_por_sku()` direto, sem variante própria, sem mais discussão. Ver "Direção visual do miolo" acima.
- [x] **Onde guardar as fotos** — decidido (27/08/2026, 21:48) e **implementado** (22:30): campo `fotos` (`JSONField`) em `AnuncioMercadoLivre`, mesmo padrão de `item_relations`. Migração aplicada, código no ar.
- [ ] (Fora de escopo hoje — nota de design pro futuro) Se/quando existir um botão de "marcar foto pra refazer", usar tabela própria e separada (ex: `FotoMarcadaParaRefazer`), nunca embutir no `fotos` (JSONField) — motivo detalhado na nota acima.
- [x] **Fonte do dado** — decidido (27/08/2026, 21:33): precisa rodar `buscar_detalhes.py` de novo (com código de extração ajustado pra manter `pictures`), não dá pra reaproveitar o `detalhes_mlbs.json` já salvo (o array de fotos é descartado em memória, antes de chegar no arquivo). Não é chamada nova à API, é a mesma chamada de sempre, só sem descartar o campo. Ver "Achado principal, corrigido" acima.
- [x] **Campos a capturar por foto** — decidido (27/08/2026, 21:33) e **implementado** (22:30): `id`, `url` (principal), `secure_url` (fallback), `size` + `max_size` (toda foto, não só capa), `quality` (mistério, capturado pra observar). Ver tabela em "Achado real via script de exploração" acima.
- [x] **Refino visual da tela implementada** — concluído e validado (28/08/2026, 00:44): rodada 1 (23:02) resolveu espaço vazio, numeração sobre a foto, falta de dado de tamanho e foto pequena (`flex-wrap` + largura fixa de 180px + legenda com resolução); modal/lightbox (23:38) aprovado; cabeçalho/rodapé do card reestruturado em 3 blocos visuais (28/08, 00:44) + botão "Editar no ML" adicionado. Usuário confirmou: "ficou muito boa essa tela... ficou realmente excelente" — tela declarada completamente pronta e validada. Ver seção "Fechamento — tela concluída e validada" acima.
- [ ] Preencher a URL real do botão "Editar no ML" (hoje `href="#"` com comentário `TODO` no template) assim que o link do editor de fotos do ML estiver disponível — única pendência não-visual remanescente.
- [x] **Visualizador de fotos (modal/lightbox)** — construído e aprovado nesta rodada (27/08/2026, 23:38): fotos clicáveis, abrem centralizadas com cabeçalho (título/MLB/SKU), contador "foto X de Y", legenda própria, navegação anterior/próxima (com wrap-around) e fechar — mais atalhos de teclado como conveniência extra. Corrigido no caminho: borrão (troca de sufixo `-O`→`-F`, mesma lógica já usada na foto de capa), tamanho do quadro (`vmin` + variável CSS única `--modal-fotos-tamanho`, fechado em `80vmin`/teto `1100px`), contraste de cabeçalho/legenda (fundo sólido `--navy-deep`) e setas sobrepondo a imagem (movidas pra fora do quadro branco). Confirmação do usuário: "ok agora ficou top". Ver seção acima para detalhe completo.
- [ ] Entender a utilidade real do campo `quality` (veio vazio no único teste feito até agora) — precisa de mais amostras.
- [ ] Decodificar/decidir uso das tags de imagem já capturadas cru (`good_quality_picture`/`poor_quality_picture`/`unknown_quality_picture`/variantes `_thumbnail`) — no teste feito, só `good_quality_thumbnail` apareceu; ainda não confirmado se as variantes `_picture` são condicionais/raras.
- [ ] Investigar o campo `health` (achado novo, nível raiz do item, veio `null` no teste) — candidato a ser a origem real do sistema `UP_PICTURES`.
- [x] `UP_PICTURES` (sistema de Qualidade do Anúncio já existente) — esclarecido (27/08/2026, 20:34): não é critério de qualidade de foto, só conta se o anúncio atinge uma quantidade mínima de fotos. Vale adicionar como dado complementar nesta tela; endpoint de origem segue não estudado (ver achado do campo `health` acima, possível pista).
- [ ] Vídeo — fora do escopo de hoje, mas parte do foco maior da equipe; registrar como extensão futura possível, não decidir agora.
- [x] **Olhar `estrutura_hub_anuncios.html`/CSS e definir o miolo** — feito e decidido (27/08/2026, 22:03): cabeçalho do card (badges + título + MLB/SKU) mantido igual; miolo vira grade fixa de 6 colunas, 1 quadradinho por foto real, sem placeholder vazio. Ver "Direção visual do miolo" acima.
- [x] **Otimização de carregamento das fotos** — decidido, implementado e encerrado (28/08/2026, 00:08): manter `-O` na grade (não trocar por `-F`, custo medido ~3,9x maior descartaria a economia) e usar preload em segundo plano (hover + abertura do modal) pro `-F`. Resultado confirmado pelo usuário: delay zerado. Ver seção "Otimização de carregamento das fotos" acima.

## Relacionado

- [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]
- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]]
