---
tipo: decisao
dominio: 
status: ativa
criado: 10/08/2026
atualizado_em: 16/08/2026 00:45
relacionado: [Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Modal Mostrava Impostos Por Nota Em Vez de Por Unidade, Orquestracao da Sincronizacao de Impostos de Entrada via XML, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada, CST Perdia o Zero a Esquerda e Nao Suportava CSOSN, Cor de Identificacao Fixa por Imposto — Padrao do Sistema, Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]
---

# Modal de Produto — Aba Impostos (Entrada e Saída)

## Contexto

Com o app `impostos` sincronizando de verdade, faltava exibir esse dado na tela de Produtos (`produtos/estrutura_produtos.html`) — o modal de detalhe do produto (`estrutura_parcial_painel_produto.html`) era 1 scroll único, read-only, sem separar dado novo (XML/Sysemp) de dado legado (`Produto`, cadastro manual).

## Decisão 1 — Modal ganha abas (Bootstrap Tabs nativo)

Restruturado em 2 abas: "Visão Geral" (conteúdo original, sem mudança) e "Impostos" (nova). Sem dependência nova — Bootstrap 5.3 (bundle completo, com Tab plugin) já carregado na base, funciona mesmo em conteúdo injetado via HTMX (event delegation).

## Decisão 2 — Card "Fiscal (cadastro manual)" era ruído, removido

O card antigo misturava campos que já não fazem sentido isolados (IPI/ICMS Entrada — agora cobertos pelo XML de entrada) com campos de saída ainda válidos. Removido por completo — os campos do `Produto` (`icms_saida_sp`, `icms_saida_media`, `pis_cofins`, `frete_cif_fob`, etc.) continuam intactos no banco, só saíram do modal.

## Decisão 3 — Estrutura final da aba Impostos (aprovada por mockup antes do código)

1. **Card largo, topo:** "Dados sobre a última nota (XML referência)" — 5 campos em linha (grid), Fornecedor com o dobro da largura dos outros (nome de fornecedor não cabia): Nota Fiscal, Data Entrada, Data Emissão, Fornecedor, Custo Unitário.
2. **2 cards lado a lado, abaixo** (entrada à esquerda, saída à direita):
   - **"Detalhamento de impostos de entrada — por unidade"** — tabela real (Imposto | CST | Base Cálculo | Alíquota | Redução | Valor), 1 linha por imposto (ICMS, ICMS ST, ICMS Retido, IPI, PIS, COFINS), alimentada por `impostos_entrada.linhas`.
   - **"Detalhamento de impostos de saída — por unidade"** — mesma estrutura de colunas, marcada com badge "placeholder": ainda não existe fonte de dado real pra impostos de saída (API de saída do Sysemp em desenvolvimento, sem prazo — ver [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]] e [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]). 7 linhas (as 6 de entrada + Frete CIF/FOB), todas com "—".

Processo: 3 rodadas de mockup HTML (widget de visualização) antes de qualquer código — inversão de lado (entrada/esquerda, saída/direita), renome de card (o nome antigo "Impostos de Entrada — por unidade (XML — Sysemp)" descrevia mal o conteúdo, era na verdade dado de identificação da nota, não imposto), remoção do card resumido de saída (redundante com o placeholder novo), e ajuste de largura do campo Fornecedor — só depois de aprovado é que o diff foi gerado.

## Decisão 4 — Achado de bug real no caminho: valores eram por nota, não por unidade

Comparando com o dublê de precificação, descoberto que `Base Cálculo`/`Valor` de cada imposto vêm da API em nível de NOTA (quantidade inteira comprada), não por unidade — corrigido persistindo 2 campos novos (`quantidade_nota`, `custo_unitario`) que já vinham parseados mas nunca gravados. Ver detalhe completo em [[Modal Mostrava Impostos Por Nota Em Vez de Por Unidade]].

## Decisão 5 — Campo `emissao` (Data de Emissão)

Adicionado durante a mesma rodada — mesma situação dos 2 campos acima (já vinha parseado em `dados.identificacao_nf.emissao`, nunca persistido). Modelado inicialmente como `CharField` (texto cru, por cautela — nunca tínhamos confirmado o formato real). Confirmado com dado real (`"2026-08-04"`, ISO) que segue o mesmo formato de `data_entrada_nota` — corrigido pra `DateField` de verdade.

## Implementado e validado (10/08/2026, 15:30)

- **`impostos/models.py`**: 3 campos novos em `ImpostosECustosXMLEntradaProduto` (`quantidade_nota`, `custo_unitario`, `emissao`), todos `null=True/blank=True` (produtos já sincronizados antes ficam `None` até reprocessar). Novas dataclasses de exibição `LinhaImpostoEntrada` e `DetalhesImpostosEntradaProduto`, e método `obter_detalhes_para_exibicao()` no guarda-chuva — converte pra "por unidade" em 1 ponto só (nunca recalculado no template), retorna `None` nos campos que dependem de quantidade quando ela ainda não existe (produto pendente de reprocessamento).
- **`produtos/views.py`**: `view_painel_produto` busca `produto.impostos_entrada` (`OneToOneField` reverso) e chama `.obter_detalhes_para_exibicao()`; trata ausência (`ObjectDoesNotExist`) como caso normal (produto ainda sem correspondência/sincronização), não como erro.
- **`produtos/templates/produtos/parciais/estrutura_parcial_painel_produto.html`**: reestruturado nas 2 abas + os 3 cards da aba Impostos descritos acima.
- **`produtos/static/produtos/css/layout_produtos.css`**: classes novas pras abas, pro grid do card de resumo da nota, pro badge "placeholder" e pra tabela de impostos.
- **Novo management command `integracao_sysemp/management/commands/reprocessar_impostos_entrada_de_json.py`**: relê `XML_Manifesto_NF_notas_mais_recentes_por_produto.json` (já salvo em disco por uma sincronização anterior) e repersiste no banco via a mesma `sincronizar_a_partir_de` — sem chamar a API, sem tocar o watermark. Criado especificamente pra backfillar os 3 campos novos nos produtos já sincronizados, sem gastar uma chamada nova (cara/lenta) na API. Reaproveitável pra qualquer campo novo futuro que precise do mesmo tipo de backfill. Extraído do orquestrador pra função própria `persistir_selecionados_no_banco()` (refactor puro, sem mudar comportamento do pipeline real).

## Decisão 6 — Visão Geral reduzida + NCM migrado pra Impostos (11/08/2026)

Continuação da etapa 2 do plano maior (ver "Em aberto" abaixo). Decisões fechadas por diálogo + 2 mockups aprovados:

- **Card "Financeiro" removido** (Custo, Custo c/ Boni) — dado já disponível na aba Impostos (Custo Unitário), redundante aqui.
- **Card "Controle" reduzido a 3 campos** — Entrada no DB, Cadastro no ERP, Última Compra (saíram Atualização no DB e Armazenagem (planilha)).
- **Card "Dimensões — após embalado" dividido em 2** — "Dimensões embaladas" (Peso, Altura, Largura, Comprimento, Peso Cubado) e "Dimensões embaladas — ordenadas" (Altura/Largura/Comprimento ordenadas).
- **NCM sai da Identificação e migra pro card "Dados sobre a última nota" (aba Impostos)** — o NCM que importa aqui é o da NOTA (`dados.identificador_regra.ncm`, mesmo dado do relatório Excel), não o do cadastro do Produto — podem divergir. Mesma situação de `emissao`/`quantidade_nota`/`custo_unitario`: já vinha parseado, nunca persistido — precisou de campo novo (`ncm`) no guarda-chuva, com migration.

## Código entregue (11/08/2026) — aguardando aplicação e teste

Diffs entregues como texto na conversa (nunca escritos direto no repo, por regra): `impostos/models.py` (campo `ncm`, atualização de `sincronizar_a_partir_de`, da dataclass `DetalhesImpostosEntradaProduto` e de `obter_detalhes_para_exibicao()`), `produtos/templates/.../estrutura_parcial_painel_produto.html` (reestruturação da Visão Geral + campo NCM no card de resumo da nota) e `layout_produtos.css` (grid do card de resumo com 1 coluna nova). **O usuário ainda precisa aplicar, rodar `makemigrations`/`migrate` do app `impostos`, rodar `reprocessar_impostos_entrada_de_json` de novo (backfill do `ncm`) e testar visualmente — nada disso foi confirmado ainda.**

Trabalho pausado nesta etapa por decisão do usuário (troca de frente) — registrado como backlog de melhoria contínua em [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]].

**Confirmado (verificado por leitura direta do template em produção em 15/08/2026):** a etapa 2 foi de fato aplicada em algum momento entre 11/08 e 14/08 (não documentado em detalhe na época). Estado real hoje da aba Visão Geral: card "Financeiro" não existe mais, "Controle" tem só 3 campos (Entrada no DB, Cadastro no ERP, Última Compra), "Dimensões — após embalado" está dividido em 2 cards ("Dimensões embaladas" e "Dimensões embaladas — ordenadas"), e NCM não está mais na Visão Geral (mora só na aba Impostos, como XML/Cadastro — ver Rodada 1 abaixo).

## Em aberto — próximas etapas do plano maior da tela de Produtos

O pedido original tinha 5 etapas. Impostos (1) e Visão Geral (2) estão feitas, aplicadas e confirmadas — a etapa 1, inclusive, ganhou uma continuação bem além do previsto (ver "Continuação — Rodadas 1 e 2 e Redesenho Completo" abaixo). Faltam, sem código ainda:

- **Nova aba "Dados do produto nas plataformas"** — 1 tabela por marketplace com Códigos Associados, Publicado? (já existe, `ProdutoAnuncioMarketplace.anunciado`) e Permitido Publicar? (não existe em nenhum lugar ainda — precisa decisão de modelagem).
- **Nova aba "Resumo de Precificação"** — mostrar a precificação do produto em cada marketplace. A mais complexa; o app `precificacao` já tem 6 grades por marketplace e um `resumo_marketplaces.py` que pode já fazer algo parecido — precisa investigação própria antes de idealizar.

Ver estado atualizado do backlog em [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]].

## Continuação (15/08/2026, 23:25) — Rodadas 1 e 2 e Redesenho Completo da Aba Impostos

Retomada da frente 1 depois da pausa registrada em 11/08. 2 rodadas de dado + 1 redesenho visual completo, todos confirmados via pytest (542 passed) e aprovação explícita do usuário.

### Rodada 1 — expor campos que já existiam no banco mas nunca apareciam na tela

Sem migration nenhuma — só template/CSS. Campos expostos: CST XML/Cadastro (dos 4 impostos que têm CST), NCM Cadastro (NCM XML já aparecia desde a Decisão 6), Empresa (Fantasia), Custo Total da Nota, e % FCP/Valor FCP do ICMS ST.

2 bugs achados e corrigidos no caminho:
- **CSS:** grid com `auto-fit` + `grid-column: span 2` deixava uma caixa colorida vazia quando o número de campos não enchia a última linha — trocado por grid fixo (`repeat(3, 1fr)`), depois totalmente superado pelo redesenho da Rodada 3.
- **Origem não aparecia:** deliberadamente adiado pra Rodada 2 (campo só existia no json de apoio, nunca persistido).

### Rodada 2 — persistir 8 campos que só existiam no json de apoio, nunca no banco

Mesmo padrão já usado em `emissao`/`ncm`/`empresa_fantasia` (Decisões 5/6 e [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]]): campo já vinha parseado por `dados_xml_nf.py`, nunca gravado. 8 campos novos no guarda-chuva `ImpostosECustosXMLEntradaProduto`: `id_produto_sysemp`, `codigo_auxiliar`, `cfop_xml`/`cfop_cadastro`, `origem_mercadoria_xml`/`origem_mercadoria_cadastro` (+ as 2 descrições), `natureza_operacao_cadastro`, `tes_saida_cadastro`. 3 migrations novas (`0008`, `0009`, `0010`) — detalhe completo do lado do model em [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]. Sem management command novo — `reprocessar_impostos_entrada_de_json` já reaproveita `sincronizar_a_partir_de` e backfilla os campos novos em qualquer produto já sincronizado, sem gastar chamada de API.

### Redesenho visual completo — rejeição total do layout da Rodada 2 e 7 mockups

Layout aplicado da Rodada 2 (campos soltos, tentando caber tudo compactado) foi rejeitado pelo usuário assim que viu rodando de verdade: *"eu realmente não to gostando... pense em algo diferente... to achando que tem muita informação tentando ser compactada em um unico lugar."* Processo de mockup (`mcp__visualize`) repetido em 7 rodadas, cada uma com feedback explícito do usuário, até aprovação genuína (*"Acho que agora ficou perfeito. não consigo pensar em nada melhor de verdade"*) — inclusive depois disso, uma nova rodada de feedback puramente estético levou a uma 8ª iteração (a definitiva, "v7").

Marcos do processo, em ordem:
1. 1ª rejeição total → mockup com progressive disclosure (`<details>`) e reagrupamento contextual.
2. Aprovado com ressalva: tabela de impostos com colunas fixas (Base/Alíquota/Redução/Valor/%FCP/Valor FCP) pra todos os impostos gerava muito traço vazio (nem todo imposto tem todos os campos) — pedido de "mais dados por imposto".
3. Confirmado contra o JSON real da API que já estavam todos os dados disponíveis sendo mostrados — problema era só de estrutura, não de dado faltando.
4. Refinamento de "Resumo da nota" (pares contextuais: Nota Fiscal/Fornecedor, Empresa/Quantidade, Emissão/Entrada, Custo Total/Unitário) + tabelas XML×Cadastro pra Classificação Fiscal.
5. Aprovação genuína do v6 (cards por imposto, 1 card por imposto elimina os traços vazios — "sem traço" aplicado: só mostra o campo que existe de verdade pra aquele imposto).
6. Nova rodada de feedback **só de estética** (não de estrutura): usuário lembrou de uma reclamação antiga sobre falta de contraste/divisão clara num relatório Excel — "os dados estão aqui, mas 'soltos'... falta de algo que mostre 'isso pertence a isso'."
7. Comparação direta com a aba Visão Geral real (screenshot) → pedido explícito de reaproveitar a MESMA estrutura rígida de card/tabela da Visão Geral (`.modal-card-cabecalho`/`.modal-tabela`, definidas em `core/static/base_compartilhada/css/layout_modal.css` — navy no cabeçalho, linhas alternadas `rgb(220,233,248)`/`rgb(233,243,255)`), tirar o CST do "canto isolado" (tratado igual "Base de Cálculo", dentro do fluxo normal do card) e cores por imposto que "façam sentido", não soltas.
8. v7 aprovado como base ("ja é um bom começo vamos aplicar isso primeiro") + lista final de ajustes pontuais (ver estrutura final abaixo).

### Estrutura final aplicada (v7 + ajustes pontuais)

Reaproveita 100% os tokens visuais já existentes da Visão Geral — nenhuma cor/classe decorativa nova, exceto as 6 cores fixas por imposto (ver [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]):

- **`Resumo da nota`** — `<details open>` colapsável, `modal-tabela-par` (2 pares de coluna dado/valor por linha): Nota Fiscal/Fornecedor, Empresa/Quantidade (na NF), Data Emissão/Data Entrada, Custo Total da Nota/Custo Unitário.
- **`Classificação fiscal`** — 3 tabelas: (1) `modal-tabela-comparacao` (NCM, CFOP, código de Origem — colunas XML/Cadastro lado a lado), (2) tabela larga só com as 2 descrições completas de Origem lado a lado, (3) tabela simples com Natureza da Operação e TES de Saída (ID Produto Sysemp/Código Auxiliar saíram daqui — ver decisão abaixo).
- **`Impostos de entrada`** — 1 card por imposto (ICMS, ICMS ST, ICMS Retido, IPI, PIS, COFINS), cabeçalho com cor fixa própria, `modal-tabela-par`: linha "CST XML | valor | CST Cadastro | valor" (só quando o imposto tem CST — nunca mais isolado num canto), depois Base de Cálculo (sempre), Alíquota/Redução/%FCP/Valor FCP (só quando existem pra aquele imposto — "sem traço"), Valor (sempre).
- **`Impostos de saída`** — `<details>` com nota de "ainda sem fonte de dado", sem tabela tracejada (simplificado — não é mais uma tabela cheia de "—").

### ID Produto (Sysemp) e Código Auxiliar migrados definitivamente pra Visão Geral

Decisão explícita do usuário: esses 2 campos não fazem parte do contexto fiscal da nota — foram removidos da aba Impostos e adicionados ao final do card "Identificação" (Visão Geral), como 2 linhas novas.

### Bug real corrigido no caminho: CST perdia o zero à esquerda / não suportava CSOSN

Achado pelo usuário direto no dado real em tela ("CST (XML) - ICMS mudar de 0 para 00"). Causa raiz numa camada acima do model (`dados_xml_nf.py`), não só nele — ver detalhe completo, incluindo o achado real de CSOSN em produção (`impostos_e_custos_id=673`, valor `102`), em [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]].

### Resultado validado

542 passed (mesmas 6 falhas pré-existentes, sem relação). Commit `5ccda18` na branch `dev` ("Reestrutura aba Impostos do modal de produto e corrige CST salvo como inteiro").

## Continuação (16/08/2026, 00:45) — Polish visual: cor pastel, popover de fórmula, fusão SKU/Código Auxiliar

Rodada de refinamento puramente estético/qualidade de dado sobre o v7 já aplicado, também validada por mockup antes do código e confirmada pelo usuário rodando de verdade ("ja testei ficou otimooo").

**Cor pastel no corpo de cada card de imposto** — pedido do usuário: *"cada grupo de impostos tivesse a continuação da cor no card... o resto do card no mesmo tom só que mais fraco e mais pastel."* Cada um dos 6 impostos ganhou, além da cor forte já fixada no cabeçalho (ver [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]), uma versão pastel do mesmo tom no corpo do card (`modal-td-dado`/`modal-td-valor`) e na cor do texto — valores exatos na nota de cor. Implementado via CSS `:has()`: `.card:has(> .card-header.modal-card-cabecalho-icms) .modal-td-dado {...}` — o `>` (filho direto) é essencial aqui, porque sem ele o card externo "Impostos de entrada" (que contém os 6 cards dentro dele) também bateria com o seletor e as 6 cores se misturariam num só (achado no momento de escrever o CSS, antes de aplicar).

**Popover com a fórmula real, não só um aviso genérico** — a 1ª versão do "isso é calculado" era só um ícone com tooltip de texto (`title=""`). Usuário pediu pra "mostrar a fórmula e os valores" de verdade. Evoluído pra um popover do Bootstrap (`data-bs-toggle="popover"`, `data-bs-html="true"`, clique abre/fecha ao perder foco) mostrando a conta com números reais, ex.: "R$ 988,88 (nota) ÷ 8 un. = R$ 123,61". 2 tipos de cálculo, confirmados lendo `dados_xml_nf.py` direto (não assumido):
- **Base de Cálculo, Valor e Valor FCP — calculados em TODO imposto**, não é caso isolado: a API entrega esses valores por nota inteira, o sistema divide pela quantidade pra mostrar por unidade (mesma conversão da Decisão 4).
- **Redução — só é calculada no PIS e COFINS.** No ICMS e ICMS ST ela vem pronta da API. Achado real confirmado no código: `_calcular_percentual_de_reducao()` só existe pra PIS/COFINS, porque a API não devolve redução desses dois direto (deriva de Base de Cálculo ÷ Custo Total).

Implementação: `LinhaImpostoEntrada` ganhou 4 campos novos, só de exibição, sem migration (`base_calculo_nota`, `valor_nota`, `valor_fcp_nota` — os valores "por nota" antes da conversão, e `reducao_e_calculada: bool`, explícito por imposto). 2 partials novos e reutilizáveis (`_popover_calculo_por_unidade.html`, `_popover_calculo_reducao.html`) evitam repetir a mesma fórmula 3x por card.

**Inicialização do popover foi realocada pro arquivo JS existente** — 1ª versão do diff colocava um `<script>` solto no fim do template; o usuário pediu pra seguir a convenção real do repo (`produtos/static/produtos/js/script_produtos.js`, já carregado via `{% static %}` na tela de Produtos). Nova função `inicializarPopoversDeCalculo()`, chamada de dentro de `abrirModal()` (que já tinha o `setTimeout` certo pra esperar o HTMX terminar de trocar o conteúdo) — Popover, diferente de Tab, não se auto-inicializa por atributo, precisa de `new bootstrap.Popover(...)` por elemento a cada troca de produto no modal.

**SKU e Código Auxiliar eram o mesmo dado, confirmado no código** — usuário notou que os 2 campos do card "Identificação" (Visão Geral) pareciam duplicados. Confirmado em `core/management/commands/popular_banco_suporte/importar_produtos_erp.py`: `self.sku = ...get('Codigo Auxiliar')` — o `Produto.sku` já é importado dessa mesma coluna do ERP desde a carga inicial, só que por um caminho diferente (planilha/`popular_banco`) do que o `impostos_entrada.codigo_auxiliar` (API Sysemp, Rodada 2). Linha "Código Auxiliar" removida do template — só o campo (model) que continua populado, sem migration de remoção, decisão deliberadamente conservadora (mantém o dado bruto persistido, só para de duplicar a exibição). "ID Produto (Sysemp)" continua, é um dado diferente (ID interno do produto dentro do Sysemp, não tem equivalente no `Produto`).

### Resultado validado (16/08/2026)

Aplicado e testado visualmente pelo usuário — sem migration em nenhuma das 3 mudanças desta rodada.

## Relacionado

- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Modal Mostrava Impostos Por Nota Em Vez de Por Unidade]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]]
- [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]]
- [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
