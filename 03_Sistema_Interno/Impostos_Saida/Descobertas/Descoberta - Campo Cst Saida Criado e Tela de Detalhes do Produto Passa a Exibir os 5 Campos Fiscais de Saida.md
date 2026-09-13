---
tipo: descoberta
dominio: python
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 21:44
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha, Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]
---

# Descoberta: Campo `cst_saida` Criado e Tela de Detalhes do Produto Passa a Exibir os 5 Campos Fiscais de Saída

**Resumo**: Fecha a Camada 3 do plano de 6 camadas — campo `cst_saida` criado no `Produto` (alimentado direto da planilha Busca Legal, por EAN, mesmo padrão dos campos de impostos de entrada). A aba "Impostos" do modal de detalhes do Produto, que antes mostrava só um placeholder ("API de saída do Sysemp ainda em desenvolvimento, sem prazo") na seção de saída, passa a exibir os 5 campos fiscais de saída de verdade (`cst_saida`, `icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`), na mesma técnica visual (cards coloridos por imposto) já usada pra exibir os impostos de entrada.

> [!success] Confirmada — 12/09/2026, 21:44
> Implementado, testado por Matheus e validado com screenshot real (produto Pulverizador Costal Brudden SS20-B). 1 bug de design encontrado e corrigido antes do fechamento.

## Por que a estrutura não é uma cópia 1:1 da entrada

A seção de entrada (`ImpostosECustosXMLEntradaProduto`) é rica porque vem de 1 nota fiscal real via XML: cada imposto tem CST XML *vs* CST Cadastro (2 valores pra comparar), Base Cálculo, Alíquota, Redução (com popover explicando o cálculo), Valor em R$, e FCP em alguns. Isso existe porque tem uma nota por trás, com quantidade e custo real.

A saída, do jeito que existe hoje (e pela [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]]), é percentual fixo por produto — sem nota, sem XML, sem Base Cálculo/Valor em R$ (dependeria do preço de venda de cada operação, que não é dado de cadastro). Por isso a seção nova mostra só **CST** (1 vez, compartilhado — não repetido por imposto, diferente da entrada onde cada imposto tem seu próprio CST) e **Alíquota** por card, sem Base Cálculo/Redução/Valor/FCP.

## Reaproveitamento em vez de código novo

`Produto.obter_dados_fiscais()` já existia (mesmo padrão dos outros agrupamentos de consulta do model — `obter_dados_identificacao()`, `obter_dados_financeiros()` etc.) e já expunha os 4 campos antigos. Só precisou incluir `cst_saida` nele — nenhuma função de contexto nova, nenhuma mudança na view (`view_painel_produto`): o template já tinha `produto` no contexto e passou a chamar `produto.obter_dados_fiscais` direto.

## O que foi implementado

- **Model** (`produtos/models/produto.py`): campo novo `cst_saida = models.CharField(max_length=10, blank=True, null=True)`, incluído na dataclass `DadosFiscaisProduto` e em `obter_dados_fiscais()`. Migration `0010_produto_cst_saida.py` criada por Matheus.
- **Template** (`produtos/templates/produtos/parciais/estrutura_parcial_painel_produto.html`): a seção "Impostos de saída — ainda sem fonte de dado" foi substituída por "Impostos de saída — por produto", com 1 linha de CST (reaproveitando o componente `modal-tabela modal-tabela-par` já usado em "Resumo da nota") + 4 cards (ICMS Saída SP, ICMS Saída Média, PIS, COFINS) na grade `modal-grade-cards-imposto` já existente.
- **CSS** (`produtos/static/produtos/css/layout_produtos.css`): 2 classes de cor novas, `.modal-card-cabecalho-icms-saida-sp` e `-icms-saida-media`, reaproveitando de propósito a mesma cor do ICMS de entrada (mesma família de imposto, dois critérios de UF diferentes). PIS e COFINS de saída reaproveitam as classes de cor que a entrada já tinha (`modal-card-cabecalho-pis`/`-cofins`) — mesmo imposto, direção diferente, sem CSS novo pra eles.

## Processo — mockup antes do código real

Antes do diff, foi construído e aprovado um mockup HTML autocontido (entregue como arquivo, fora do vault) reaproveitando as cores e classes reais do CSS do sistema. Confirmado por Matheus ("ok excelente") antes de qualquer diff real.

## 1 bug de design encontrado e corrigido

Os 4 headers novos ficaram desalinhados (texto à esquerda) e sem contraste (sem branco) na 1ª aplicação. Causa: no diff original, os `<div class="card-header ...">` novos usavam só a classe de cor (`modal-card-cabecalho-icms-saida-sp` etc.), esquecendo a classe base `modal-card-cabecalho` — é ela quem centraliza o texto e aplica `color: var(--cor-texto-claro)` (branco), a mesma usada nos headers da entrada. Corrigido acrescentando a classe base nos 4 `<div>` — nenhuma mudança de CSS foi necessária, a regra já existia.

## O que isso fecha

Fecha a Camada 3 do plano de 6 camadas (ver [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]) — "adicionar os campos básicos que faltam, CST de saída é o único identificado".

## O que ainda falta

Os 5 campos continuam sendo alimentados do jeito antigo — direto da planilha Busca Legal, por EAN, sem checagem de divergência (Camada 1, ainda não reescrita). A reescrita pra fonte única (tabelas normalizadas `IcmsNcmUf`/`PisCofinsNcmCst`), já decidida em [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]], continua pendente.

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
