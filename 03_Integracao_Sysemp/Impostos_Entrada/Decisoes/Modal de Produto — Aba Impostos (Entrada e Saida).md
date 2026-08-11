---
tipo: decisao
dominio: 
status: ativa
criado: 10/08/2026
atualizado_em: 11/08/2026 15:05
relacionado: [Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Modal Mostrava Impostos Por Nota Em Vez de Por Unidade, Orquestracao da Sincronizacao de Impostos de Entrada via XML, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]
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

## Em aberto — próximas etapas do plano maior da tela de Produtos

O pedido original tinha 5 etapas; a de Impostos (1) está feita e validada, a de Visão Geral (2) está decidida com código entregue mas **não confirmado** (ver "Código entregue" acima). Faltam, sem código ainda:

- **Nova aba "Dados do produto nas plataformas"** — 1 tabela por marketplace com Códigos Associados, Publicado? (já existe, `ProdutoAnuncioMarketplace.anunciado`) e Permitido Publicar? (não existe em nenhum lugar ainda — precisa decisão de modelagem).
- **Nova aba "Resumo de Precificação"** — mostrar a precificação do produto em cada marketplace. A mais complexa; o app `precificacao` já tem 6 grades por marketplace e um `resumo_marketplaces.py` que pode já fazer algo parecido — precisa investigação própria antes de idealizar.

Pausado por decisão do usuário em 11/08/2026, 15:05 — ver [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]].

## Relacionado

- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Modal Mostrava Impostos Por Nota Em Vez de Por Unidade]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]]
