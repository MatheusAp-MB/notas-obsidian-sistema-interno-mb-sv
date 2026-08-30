---
tipo: decisao
dominio: fiscal
status: ativa
criado: 16/08/2026
atualizado_em: 16/08/2026 03:34
relacionado: [Modal de Produto — Aba Impostos (Entrada e Saida), Cor de Identificacao Fixa por Imposto — Padrao do Sistema, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Bugs de Especificidade CSS no Cabecalho Congelado da Tela de Resumo de Impostos]
---

# Tela e Planilha de Resumo de Impostos de Entrada

## Contexto

Pedido do usuário (16/08/2026): a planilha de impostos de entrada já apresentada ao superior (`scripts_exploracao_ERP/relatorio_impostos_entrada_xlsx.py`) mostra dado que já existe individualmente no produto — pediu uma TELA nova com essa tabela (1 linha por produto), exportável em xlsx, usando como base arquitetural a tela "Resumo de Critérios" do Mercado Livre (busca, paginação, botão de exportar).

## Decisão de escopo

- **A tela pode ser otimizada** (menos colunas que a planilha) — só Foto, SKU, EAN, NCM, Nota Fiscal/Fornecedor/Empresa/Data Entrada, Custo Unitário, e por imposto **Alíquota + Redução** (não Valor).
- **A planilha exportada tem que continuar idêntica** à estrutura já aprovada/apresentada: 10 grupos, 52 colunas, 1 cor por grupo do cabeçalho até o corpo.
- **O script antigo (`relatorio_impostos_entrada_xlsx.py`) fica intocado**, por decisão explícita — mantido só pra rodar local sem depender do servidor. Isso significa lógica duplicada entre ele e o novo módulo — aceito conscientemente, não é descuido.

## Arquitetura implementada

Novo app reaproveitado: `impostos/` ganhou `views.py`, `urls.py`, `funcoes_auxiliares/resumo_entrada.py` (busca/filtro) e `funcoes_auxiliares/exportacao_resumo_entrada.py` (gerador do xlsx) — arquitetura copiada de `mercado_livre` (`view_resumo_criterios`/`view_exportar_resumo_criterios`): `Paginator`, busca via GET (`Q(titulo__icontains=...) | Q(ean__icontains=...) | Q(impostos_entrada__fornecedor__icontains=...)`), botão de exportar com overlay de carregamento (JS/CSS copiados pro namespace próprio do app `impostos`, não importados entre apps — convenção já usada no projeto).

Link novo na barra lateral (`estrutura_base_global.html`), logo abaixo de "Produtos".

**Fonte única do cálculo por unidade:** tanto a tela quanto a planilha usam `ImpostosECustosXMLEntradaProduto.obter_detalhes_para_exibicao()` — nunca reimplementam a divisão por `quantidade_nota` (essa função já é a fonte única desde a correção documentada em [[Modal Mostrava Impostos Por Nota Em Vez de Por Unidade]]).

Os 8 campos que antes só existiam no json de apoio (ID Produto Sysemp, Código Auxiliar, CFOP, Origem, Natureza da Operação, TES) já são colunas persistidas desde a Rodada 2 (15/08/2026) — o novo módulo de exportação lê tudo do banco, sem merge de arquivo externo, ao contrário do script antigo.

## Tela — cabeçalho de 2 linhas + congelamento nos 2 eixos

Cabeçalho igual ao padrão de planilha: linha 1 = grupo (Dados do produto / Dados da nota / Custos / 6 impostos), linha 2 = coluna (Foto, Produto, SKU... Alíq., Red.). Colunas de identificação do produto (Foto/Produto/SKU/EAN/NCM) congeladas à esquerda; cabeçalho congelado no topo — comportamento "congelar painéis" do Excel, via CSS `position: sticky`.

**2 bugs reais de especificidade CSS travaram essa parte por várias rodadas** — causa raiz, sintoma e correção documentados em nota própria: [[Bugs de Especificidade CSS no Cabecalho Congelado da Tela de Resumo de Impostos]].

## Sistema de cor — reescrito com a planilha como referência

Primeira versão do CSS tinha ~15 hex escolhidos à mão, sem ligação entre si — raiz real dos bugs de especificidade e de um visual inconsistente ("cor branca ruim de ler", "arquivo malfeito", segundo o próprio usuário). Reescrito seguindo o MESMO princípio já usado em `exportacao_resumo_entrada.py`: **1 cor-base por grupo, 2 variações da mesma cor** — linha 1 (grupo) = cor cheia + texto claro; linha 2 (coluna) + corpo = tom claro da mesma cor-base (`_clarear(cor_base, 0.75)`, mesmo fator da planilha) + texto escuro.

- Os 6 impostos (ICMS/ICMS ST/ICMS Retido/IPI/PIS/COFINS) têm cor forte E cor de corpo/texto **travadas** pelo padrão já documentado em [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]] — reaproveitadas sem alteração.
- Os 3 grupos livres (Dados do produto/Dados da nota/Custos) usam as cores-base da própria planilha (`0E6655`/`1F4E78`), exceto Custos: a planilha usa `1B5E20` (verde quase igual ao `0E6655` de "Dados do produto") — trocado por `5B2C6F`, a 4ª cor da mesma paleta (grupo "Classificação Fiscal", não exibido nesta tela), pra não ter 2 grupos verdes lado a lado.
- Texto da linha 1: decisão de manter **claro em todos os 9 grupos** (não só nos 6 impostos) — confirmado por cálculo de contraste WCAG real (todas as 9 cores-base dão contraste MELHOR com texto claro do que com texto escuro) e por ser exatamente o padrão já usado na planilha (branco fixo, sem exceção). Reverte uma decisão intermediária (texto preto só nos 3 grupos livres), corrigida depois que o usuário pediu "pense em legibilidade/UX, use a planilha como referência".

## Planilha — revisão geral de largura/altura/formato (16/08/2026)

Nem o script antigo nem a 1ª versão do módulo novo jamais trataram isso: largura sempre uniforme (15) pra todas as 52 colunas, e só data tinha `number_format` — alíquota/redução apareciam como número cru, sem `%`, custo sem `R$`. Corrigido em `exportacao_resumo_entrada.py`:

- **Largura por nome de coluna** (`LARGURA_POR_COLUNA`), não mais uniforme — texto longo (Produto, Fornecedor, Natureza da Operação) bem mais largo que código/CST.
- **Altura de linha maior** nos dados (`ALTURA_LINHA_DADO = 36`), com quebra de linha (`wrap_text`) em Produto/Fornecedor/Natureza da Operação.
- **Formato numérico por categoria**: moeda (`"R$" #,##0.00`) em Custo/Base de Cálculo/Valor; percentual (`0.00"%"`) em Alíquota/Redução/% FCP — formato customizado, não o `%` nativo do Excel, porque o valor já vem em UNIDADE DE PORCENTAGEM do banco (18.0000 = 18%, não 0.18) e o formato nativo multiplicaria de novo; quantidade (`#,##0.000`) em Quantidade Recebida na Nota; texto forçado (`@`) em código/CST/NCM/CFOP pra nunca perder zero à esquerda.
- **Todo texto centralizado** (horizontal e vertical) e **borda fina cinza** em toda célula (cabeçalho e dado) — acabamento de grade pedido na revisão geral.

Resultado validado pelo usuário: "visualmente tá incrível".

## Relacionado

- [[Modal de Produto — Aba Impostos (Entrada e Saida)]]
- [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Bugs de Especificidade CSS no Cabecalho Congelado da Tela de Resumo de Impostos]]
