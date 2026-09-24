---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 24/09/2026
atualizado_em: 24/09/2026 15:10
relacionado: [Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre, Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa), Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação), Checkpoint - Tela de Árvore de Categorias do Mercado Livre (Redesenho em Níveis Empilhados e Implementação Real)]
---

# Checkpoint - Idealização de Cache de Comissão e Frete + Tabela de Categorias do Mercado Livre

**Resumo**: Com a comissão via API já validada como correta (ver [[Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre]]), Matheus abriu uma nova frente, ainda em fase de ideação pura — nenhum código escrito, nenhuma decisão de arquitetura fechada. O gatilho foram 3 perguntas: como auditar frete/comissão por produto de forma fácil, se dá pra ter uma tela mostrando comissão por categoria, e o ponto central — "dado de API é caro, precisamos salvar no banco". A conversa evoluiu pra um desenho conceitual reaproveitando o padrão já implementado pro frete, uma exigência nova de granularidade nos comandos, e uma sub-investigação (já confirmada contra doc oficial) sobre uma tabela de referência de categorias do ML.

## 1. Ponto de partida — as 3 perguntas de Matheus

- Como auditar frete e comissão por produto de forma fácil?
- Dá pra ter uma tela mostrando a comissão aplicada por categoria?
- "Dado de API é CARO, precisamos salvar no banco" — em vez de perguntar pro ML toda vez, perguntar uma vez, guardar a resposta, e reaproveitar.

## 2. O precedente já existe — só que pro frete, não pra comissão

Esse exato padrão ("perguntar pro ML, guardar no banco, ter um comando que atualiza em massa, mostrar na tela real x calculado") já foi desenhado e implementado antes, só que pra frete — ver [[Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa)]]. Resumo do que já existe lá: `VariacaoAnuncioMercadoLivre.frete_real` + `.frete_real_atualizado_em` guardam o valor real por MLB; `GradePrecificacaoML.frete_calculado` + `origem_frete` (choices `api_real`/`tabela_calculada`) guardam o valor calculado e qual dos dois foi usado; um comando (`buscar_frete_real_ml`, `--empresa magazine|samvale`) atualiza em massa; a tela de auditoria (Passo 7) mostra os 2 lado a lado.

**Achado técnico confirmado nesta sessão, direto do código** (`precificacao/funcoes_auxiliares/mercado_livre/formula_precificacao.py`): comissão hoje **não tem esse "bolso" nenhum**. `comissao_percentual` e `comissao_valor` são calculados na hora (`self._comissao_percentual = self.config_tipo.comissao`, `self._comissao_valor = self._preco_final * self._comissao_percentual / 100`) e devolvidos como parte do resultado do cálculo, mas **nunca persistidos** em nenhum campo do `GradePrecificacaoML` — diferente do frete, que já tinha `frete_calculado`/`origem_frete` prontos antes mesmo da API real entrar. Confirmado também que `VariacaoAnuncioMercadoLivre` não tem nenhum campo de comissão (nem dormente, nem ativo) — ao contrário do frete, que tinha uma feature antiga abandonada (`frete_real`) pra reaproveitar, comissão parte do zero.

## 3. Plano idealizado pra comissão (Bloco 1) — copiar o padrão do frete

Direção proposta e discutida: criar o equivalente comissão de `frete_real`/`frete_real_atualizado_em` — guardando por MLB o percentual da comissão, o valor em R$, **o preço do anúncio usado naquela consulta** (diferencial importante — comissão depende do preço vigente, frete não tanto assim) e a data/hora da busca. Mais um comando de coleta em massa, no mesmo padrão do `buscar_frete_real_ml`.

**Decisão ainda em aberto, não fechada por Matheus**: se esse dado real, uma vez guardado, já passa a ser usado no cálculo do preço, ou se fica só disponível pra comparação/exibição por enquanto (sem mudar a fórmula) — exatamente a mesma pergunta que trava a Frente A do frete até hoje (ver [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]], seção 18). Recomendação de Claude: seguir o mesmo caminho do frete — guardar e mostrar primeiro, decidir sobre uso na fórmula como etapa separada depois.

## 4. Exigência de granularidade nos comandos de API

Instrução explícita de Matheus, para valer em **todos** os comandos que envolvem API (não só comissão): precisam suportar 3 níveis de escopo —

1. **Universal** — todos os produtos/anúncios da empresa (equivalente ao `--empresa` que o comando de frete já tem hoje).
2. **Por produto** — atualiza todos os MLBs (Clássico e Premium) de 1 produto específico.
3. **Por MLB** — atualiza só 1 anúncio específico.

Motivo dado por Matheus: chamada de API é cara e demorada — quanto mais granular, melhor, porque vão existir situações em que ele só quer atualizar 1 produto específico, sem rodar a coleta inteira. Conexão registrada com o botão de atualização que Matheus tinha trazido antes (ver seção 8 do checkpoint da comissão): o nível "por MLB" é exatamente o que um botão de atualização por produto, na tela, acionaria por trás.

Uma 4ª camada ("por categoria") foi mencionada como natural de se ter no futuro, mas só depois que a categoria de cada produto estiver guardada no banco (ver seção 5) — sem esse dado, não tem como filtrar por categoria antes de já ter buscado.

## 5. Sub-investigação — tabela de referência de categorias do ML

Motivação: ao guardar `category_id` de cada anúncio (necessário pra tela por categoria e pra própria chamada de comissão), o valor vem como código puro (`MLB1245`), sem nome legível. Ideia de Matheus: ter uma tabela local com **todas** as categorias do Mercado Livre (id + nome + hierarquia), pra nunca precisar perguntar pro ML de novo — só cruzar (JOIN) com o que já foi salvo. Vantagem adicional identificada: normaliza o dado — se o ML renomear uma categoria, corrige em 1 lugar só (a tabela de referência), não em cada produto que a usa.

**Pesquisa preliminar via GPT** (mesmo padrão de rigor já usado desde o início desta investigação — tratado como hipótese, não fato, até checar doc oficial): GPT recomendou não navegar categoria por categoria, e sim usar um endpoint de "dump" que baixa a árvore inteira de uma vez, comparando um checksum antes de baixar de novo.

## 6. Doc oficial confirmada — bateu com a recomendação do GPT

3 páginas oficiais obtidas e lidas (`developers.mercadolivre.com.br`): "Dump de categorias" (prioritária, última atualização 12/07/2023), "Domínios e Categorias" e "Categorias e Atributos" (esta última específica de veículos, menos central pro objetivo).

**Confirmado literalmente**:

- `GET /sites/{SITE_ID}/categories` — devolve só as categorias de primeiro nível (raiz), formato simples `{id, name}`. **Não é a árvore inteira.**
- `GET /categories/{category_id}` — devolve `id`, `name`, `picture`, `permalink`, `total_items_in_this_category`, `path_from_root` (array com o caminho da raiz até a categoria atual) e `children_categories` (array de filhos diretos, cada um já com `total_items_in_this_category`). Uma categoria com `children_categories: []` é categoria folha.
- `GET /categories/{category_id}/attributes` — endpoint **separado**, só pra ficha técnica/atributos da categoria (não necessário pro objetivo atual de nome/hierarquia).
- **O dump completo — `GET /sites/MLB/categories/all`** — confirmado com a frase literal da doc: "A API retorna a árvore de categorias no formato JSON dentro de uma resposta codificada com gzip." Existe a variação `?withAttributes=true` pra baixar já com atributos.
- **2 headers de controle de versão, confirmados letra por letra** com o que o GPT tinha descrito: `X-Content-Created` (data da última geração do dump) e `X-Content-MD5` (checksum MD5 da última geração) — permitem checar se o dump mudou sem precisar baixar ele inteiro de novo.

**Gap ainda não confirmado**: a doc do dump explica o mecanismo de download (URL + headers) mas **não mostra um exemplo do conteúdo de dentro do arquivo** — não dá pra confirmar pela doc se cada entrada já vem com a hierarquia (tipo um `parent_id`) ou se vem achatada, só `{id, name}` igual a lista simples de `/sites/{SITE_ID}/categories`. Só confirmável baixando o dump de verdade e inspecionando o formato real.

**Observação a favor da estabilidade do mecanismo**: a página do dump está com a atualização mais antiga já vista nesta investigação (12/07/2023) — coerente com a própria doc de categorias, que registra a afirmação "a árvore de categorias não muda com frequência".

## 7. Dump de categorias baixado de verdade — confirma e resolve o gap da doc oficial

Baixado com sucesso via `scripts_exploracao_ML/baixar_dump_categorias_ml.py` (`GET /sites/MLB/categories/all`): arquivo de 1.920.849 linhas de JSON, **12.233 categorias** no total.

Estrutura real confirmada por inspeção direta do arquivo baixado (a doc oficial não mostrava isso — era o gap registrado na seção 6): é um **dicionário indexado por `category_id`** (não uma lista simples). Cada entrada já vem com o detalhe completo, no mesmo formato de `GET /categories/{category_id}` (`id`, `name`, `picture`, `permalink`, `total_items_in_this_category`, `path_from_root`, `children_categories`), **mais** três blocos extras que só existem no dump: `attribute_types`, `settings` (dezenas de campos de regra de negócio) e `channels_settings` (regras por canal de venda). A hierarquia já vem embutida em cada entrada — não é necessária nenhuma chamada de API adicional pra montar a árvore completa.

## 8. Censo completo de campos do dump — feito, com 1 bug corrigido no caminho

Antes de decidir quais campos guardar na futura tabela de categorias, Matheus rejeitou explicitamente a ideia de descartar campos como `settings`, `channels_settings` e `attribute_types` sem antes ver o que existe dentro deles. Citação direta: *"não vamos sair descartando coisas assim... eu preciso entender exatamente tudo que temos de dado útil vindo da API... são 1 milhão de linhas.. deve ter coisa interessante nesse meio."*

Fluxo de trabalho adotado pra essa investigação (vale como padrão pra situações parecidas): Claude gera o script de análise, Matheus roda local e cola o resultado de volta no console — em vez de Claude tentar processar o arquivo de ~1 milhão de linhas diretamente.

Script `scripts_exploracao_ML/investigar_campos_dump_categorias.py`: percorre as 12.233 categorias e monta, por campo, uma tabela de presença (quantas categorias têm aquele campo) e a distribuição de valores encontrados — separado em 4 blocos (estrutura da árvore, campos de primeiro nível, campos dentro de `settings`, campos dentro de `channels_settings` por canal).

**Bug encontrado e corrigido**: a primeira versão contava presença somando, para campos de lista (ex: `item_conditions`, `buying_modes`), cada item da lista como +1 — inflando a % de presença acima de 100% em qualquer campo onde uma categoria pudesse ter mais de 1 valor simultâneo (`item_conditions` chegou a aparecer como 277,9%, `buying_modes` como 197,4%). Corrigido agrupando os valores por categoria antes de somar (cada categoria conta no máximo 1 vez por campo, não importa quantos itens tenha a lista). Confirmado corrigido por Matheus rodando de novo: `item_conditions` e `buying_modes` foram para 100,0% (12.233/12.233), e todos os demais campos de lista caíram para ≤100%; as contagens individuais por valor (ex: `new=12017`, `used=10979`) continuaram idênticas — só a % de presença estava errada, o resto já estava certo. Um detalhe que só ficou visível depois do conserto: `translations.zh-CN.*` tem presença real de 12.145/12.233 (99,3%) — ou seja, **88 categorias genuinamente não têm tradução para chinês** (antes disso ficava escondido atrás de números inflados e sem sentido).

## 9. Ficha completa de categorias individuais — script dedicado + 2 exemplos reais comparados

Complementando o censo (visão agregada de todas as categorias), foi criado um segundo script pra ver a ficha COMPLETA de 1 categoria por vez, campo a campo: `scripts_exploracao_ML/investigar_1_categoria_completa.py`. Mostra, organizado em tabelas: identidade rápida, hierarquia completa (`path_from_root`), filhos diretos, todos os campos de `settings` sem exceção, `attribute_types`, `channels_settings` por canal, `translations` por idioma, e por fim o JSON bruto completo da categoria — garantindo que nenhum campo fique de fora, mesmo que não tenha sido organizado numa tabela específica.

Rodado em 2 categorias reais, com achados novos nas duas:

- **MLB459667 "Instalações de Móveis"** — categoria de SERVIÇO, 0 itens publicados, 2 níveis de profundidade. Não representativa do negócio de MB/SV, que são revendedores puros de produto físico (não prestam serviço).
- **MLB33390 "Conjuntos de Box e Colchão"** — categoria de produto real, 71.794 itens, 3 níveis de profundidade. Escolhida depois de ajustar a seleção automática do script pra priorizar categorias com itens reais publicados (>1000), evitando cair de novo numa categoria vazia/de serviço como na primeira tentativa.

**Achados da comparação entre as duas**:

- `attribute_types` **não é um valor fixo** — era `"attributes"` na categoria de serviço e `"variations"` na de produto real. Hipótese ainda não confirmada: pode indicar como funciona a ficha técnica/atributos daquela categoria (atributo simples vs. baseado em variação). Só confirmável com mais exemplos ou com a doc oficial do endpoint de atributos.
- `settings.max_parcels` e `settings.multiparcel_enabled` — campos que **só apareceram na categoria de produto real**, ausentes na de serviço. Prováveis campos ligados a parcelamento (não confirmado). Registrado como pista secundária, mesmo tratamento dado ao `catalog_domain` (seção 5) — possível relação com a variação de comissão já documentada em [[Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre]] (seção 7 de lá), já que a comissão real parece depender do preço/forma de pagamento vigente.
- `channels_settings` também não tem uma lista fixa de canais entre categorias — a categoria de serviço tinha 6 canais (`mshops`, `proximity`, `mp-merchants`, `mp-link`, `marketplace`, `private`); a de produto real tinha só 4 (sem `marketplace` nem `private`).
- Gap encontrado no próprio script (não no dado): a primeira versão não organizava em tabela alguns campos de primeiro nível (`meta_categ_id`, `attributable`, `date_created`) — só apareciam no JSON bruto final. Corrigido com uma tabela automática de "outros campos de primeiro nível", que pega qualquer campo não tratado explicitamente nas outras seções — funciona como rede de segurança mesmo se o ML adicionar campos novos no futuro.

## 10. Classificação de campos — fechada

Rodado o one-liner pendente com o dump inteiro (12.233 categorias):

- `attribute_types` — só 3 valores possíveis: `attributes` (6.532 categorias, 53,4%), `variations` (5.673, 46,4%), `none` (28, 0,2%). Conferido na doc oficial ("Domínios e Categorias"): o campo aparece em exemplos de resposta de `GET /categories/{category_id}`, mas o ML não documenta em texto o que ele significa. Dois exemplos reais da própria doc sustentam a hipótese de que `none` aparece em categorias-pai (não-folha, sem `buying_allowed`), enquanto `attributes`/`variations` se aplica às categorias-folha publicáveis — ainda hipótese, não confirmada por texto oficial.
- `settings.max_parcels` / `settings.multiparcel_enabled` — raríssimos: só 4 categorias em 12.233 (0,03%) têm esses campos. As 4 são **Conjuntos de Box e Colchão, Guarda Roupas (2x) e Ares Condicionados** — todos produtos grandes/volumosos, o que sustenta a hipótese de que o campo é sobre fracionamento de ENVIO (múltiplos volumes), não parcelamento de pagamento como cheguei a supor antes. **Confirmado por Matheus que nenhuma dessas 3 linhas de produto faz parte do catálogo de MB/SV.**

**Classificação final:**

- **Grupo 1 (útil, entra na tabela de categorias)**: `id`, `name`, `path_from_root`, `children_categories` (hierarquia) · `listing_allowed` · `status` · `attribute_types` · `settings.item_conditions` · `settings.minimum_price`/`maximum_price` · `settings.vertical` · `settings.max_title_length`/`max_sub_title_length`/`max_description_length`/`max_pictures_per_item`/`max_pictures_per_item_var`/`max_variations_allowed`.
- **Grupo 2 (pista separada, registrada, não trava)**: `catalog_domain` — ainda candidato a explicar a variação de comissão real por categoria (ver [[Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre]]).
- **Grupo 3 (não útil agora, com motivo)**: `shipping_options`, `fragile`, `buying_modes`, `buyer_protection_programs`, `channels_settings.*`, `picture`, `permalink`, `translations.*`, e `max_parcels`/`multiparcel_enabled` (fora do catálogo de MB/SV — se um dia entrar produto volumoso/fracionado, retomar como pista de frete, não de comissão).

**Nota adicionada em 24/09 (ver seção 12-A abaixo)**: mesmo classificado como "não útil agora" pra tabela em si, o campo `picture` acabou sendo investigado de novo, com mais profundidade (cobertura por nível da árvore, não só presença geral) — motivado pela tela de navegação. Ver seção 12-A.

## 11. Modelo de dados desenhado — árvore navegável, ainda em revisão

Preferência explícita de Matheus: a hierarquia precisa ser uma **árvore de verdade navegável** no banco (FK pai↔filho), não só um caminho achatado em texto.

Desenhados 2 modelos (`mercado_livre/models/categoria.py`, local escolhido por ser onde já vive `tipo_de_anuncio.py`, o modelo de referência mais parecido que já existe):

- **`CategoriaMercadoLivre`** — `category_id` como chave primária (não surrogate key), `categoria_pai` como FK própria (`self`, `on_delete=SET_NULL`, `related_name='filhos'`), mais todos os campos do Grupo 1 (`categoria_raiz_id`, `nivel`, `caminho_completo` e `e_folha` cacheados pra evitar subir a árvore toda hora) e o `catalog_domain` do Grupo 2.
- **`EstadoDumpCategoriasMercadoLivre`** — tabela pequena (praticamente singleton) que guarda o último `X-Content-Created`/`X-Content-MD5` do dump processado, pra permitir pular o reprocessamento quando o dump não mudou.

**Problema técnico resolvido**: como popular `categoria_pai` sem erro de ordem, já que o dump vem como dicionário solto (sem garantia de que a categoria-pai apareça antes da filha)? Solução: carga em **2 passadas** — 1ª grava/atualiza todas as categorias sem tocar em `categoria_pai`; 2ª, com todas as linhas já existindo, seta `categoria_pai` de todo mundo em lote (`bulk_update`). Elimina qualquer dependência de ordem no dump.

## 12. Achado de arquitetura — cada empresa tem banco físico separado

Ao desenhar o comando de carga de verdade (antes de escrever, fui checar `core/database_router.py` e `core/empresa.py`, em vez de assumir), confirmei algo que muda uma afirmação minha anterior: este sistema usa **1 banco de dados físico por empresa** (`EmpresaRouter`) — só os apps de infraestrutura do Django (sessions/admin/contenttypes/auth) são compartilhados entre Magazine e Samvale. Não existe hoje nenhum mecanismo de tabela verdadeiramente compartilhada entre as 2 empresas.

Isso significa que `CategoriaMercadoLivre`, mesmo sendo a mesma árvore de categorias do ML pras 2 empresas, precisa ser carregada **por empresa** (mesmo padrão do `buscar_frete_real_ml`) — fica duplicada nos 2 bancos. Eu tinha dito antes, incorretamente, que esse comando não precisaria de granularidade por empresa por ser dado "global"; essa checagem no código corrigiu isso.

Desenhado (ainda como rascunho, não aplicado): `integracao_mercado_livre/servicos/sincronizar_categorias_ml.py` (usa `chamar_api`, a carga em 2 passadas, checagem de MD5 via `EstadoDumpCategoriasMercadoLivre`) + `integracao_mercado_livre/management/commands/sincronizar_categorias_ml.py` (`--empresa magazine|samvale`, `--forcar`, mesmo padrão de argumentos do `buscar_frete_real_ml.py`).

## 12-A. Atualização (24/09, tarde) — modelo e sincronização aplicados; tela de navegação construída e aprovada

O que nesta nota ainda estava descrito como "rascunho, nada aplicado no repo" (seções 11 e 12) **já está aplicado**: o modelo `CategoriaMercadoLivre` (com todos os campos do Grupo 1, mais `e_folha`, `aceita_novo_anuncio`, `status_categoria`, `condicoes_aceitas`, preços mínimo/máximo, limites de conteúdo etc.) e o pipeline de sincronização via dump (`integracao_mercado_livre/servicos/sincronizar_categorias_ml.py`, carga em 2 passadas, checagem via `EstadoDumpCategoriasMercadoLivre`) estão rodando de verdade no repo, por empresa, confirmados por leitura direta do código.

Com a tabela populada, Matheus pediu o redesenho da tela de navegação pela árvore de categorias (a exploração/visualização da própria `CategoriaMercadoLivre` — diferente das 2 telas de auditoria/comissão por categoria ainda pendentes abaixo). Esse trabalho — mockups avaliados por persona, a investigação de cobertura do campo `picture` por nível da árvore (só o Nível 1 tem imagem útil; ver Grupo 3 da seção 10, que já sinalizava `picture` como "não útil agora" — achado agora mais preciso, por nível), a implementação real completa e os ajustes por screenshot até a aprovação — está detalhado em nota própria: [[Checkpoint - Tela de Árvore de Categorias do Mercado Livre (Redesenho em Níveis Empilhados e Implementação Real)]].

## Pendências / próximos passos

- ~~Baixar o dump de categorias de verdade~~ — feito (seção 7).
- ~~Rodar o one-liner de attribute_types/max_parcels~~ — feito, classificação fechada (seção 10).
- ~~Gerar a migration de verdade~~ — feito: `CategoriaMercadoLivre` e a sincronização via dump (carga em 2 passadas, por empresa) já estão aplicadas no repo, fora do estágio de rascunho descrito nas seções 11-12 (ver seção 12-A).
- ~~Tela de navegação pela árvore de categorias~~ — feito e aprovado por Matheus, em formato "níveis empilhados" — ver [[Checkpoint - Tela de Árvore de Categorias do Mercado Livre (Redesenho em Níveis Empilhados e Implementação Real)]]. Não é nenhuma das 2 telas abaixo (auditoria por produto / visão agregada por categoria) — é a navegação/exploração da própria tabela de categorias.
- **Definir os campos exatos da comissão real** (percentual, valor, preço usado, timestamp — proposta na seção 3, ainda não fechada em detalhe técnico/nomes de campo).
- **Decisão de negócio ainda em aberto**: comissão real (uma vez coletada) entra na fórmula de cálculo do preço, ou fica só como comparação/exibição por enquanto? Mesma natureza da decisão pendente na Frente A do frete.
- **Aplicar a granularidade (universal/produto/MLB) em código** — ainda é só requisito, não desenhada tecnicamente em nenhum comando de comissão.
- **Botão de atualização na tela** — mencionado e conectado ao nível "por MLB" (seção 4), mas ainda não desenhado tecnicamente (nem pra frete, nem pra comissão).
- **Telas** — auditoria por produto (análoga ao Passo 7 do frete) e visão agregada por categoria (comissão por categoria) seguem como 2 telas distintas a desenhar, nenhuma delas iniciada.
- **Estratégia de ícone por categoria na tela de navegação** — deliberadamente adiada por Matheus (imagem genérica única vs. imagem real só no Nível 1 vs. outra ideia). Detalhe na nota da tela.

## Relacionado

- [[Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre]] (validação que originou esta frente de ideação)
- [[Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa)]] (padrão de arquitetura sendo reaproveitado)
- [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]] (mesma decisão de negócio pendente — usar dado real na fórmula ou só exibir)
- [[Checkpoint - Tela de Árvore de Categorias do Mercado Livre (Redesenho em Níveis Empilhados e Implementação Real)]] (tela de navegação construída sobre a tabela idealizada aqui)
