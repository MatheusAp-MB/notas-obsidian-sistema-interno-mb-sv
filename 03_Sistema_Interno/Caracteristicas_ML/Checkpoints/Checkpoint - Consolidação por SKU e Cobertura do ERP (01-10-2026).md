---
tipo: checkpoint
status: em andamento (fase Analisar)
criado: 01/10/2026
atualizado_em: 01/10/2026 16:20
dominio: Sistema Interno V2 - Características/Atributos ML (novo)
relacionado: ["[[Checkpoint - Investigação da API de Atributos do Mercado Livre]]"]
---

# Checkpoint - Consolidação por SKU e Cobertura do ERP (01-10-2026)

## Objetivo desta rodada

Continuação direta do [[Checkpoint - Investigação da API de Atributos do Mercado Livre]]. Três frentes:

- Parar de escolher SKU à mão: o script de contexto passa a selecionar os candidatos sozinho e rodar em lote de 10 SKUs distintos.
- Fechar o desenho da consolidação por SKU (ficha do SKU, não da categoria).
- Entender a cobertura do ERP e a distribuição de status dos MLBs antes de escalar para os 4.000+ anúncios.

A Fase 1 continua sendo só leitura via API. Nenhuma escrita foi implementada.

## Decisões de desenho (Matheus)

- **A ficha é do SKU, não da categoria.** O SKU precisa da união dos campos pedidos pelas categorias de todos os seus MLBs, com 1 valor por campo. Cada MLB recebe só o subconjunto que a categoria dele pede. Motivo: todos os MLBs de um mesmo SKU são o mesmo produto, e os dados vêm do mesmo lugar.
- **Multi-categoria por SKU é o estado normal atual**, não erro nem SKU mal vinculado. Padronizar as categorias é objetivo futuro (ainda não feito), então o desenho trata multi-categoria como caso comum.
- **Cada tamanho (P, M, G) tem SKU próprio.** Tamanho é um SKU distinto, não variação dentro do mesmo SKU.
- **Sem integração de API de LLM.** O script só prepara o material; o JSON de cada SKU é colado à mão numa conversa com a LLM.

## Script `montar_contexto_llm_por_sku.py` (`scripts_exploracao_ML/`)

Gera 1 arquivo `contexto_llm_{SKU}.json` por SKU. Só leitura: só GET na API, nada gravado no banco, nenhuma LLM chamada.

**Rodada 2 — seleção automática.** `selecionar_skus_candidatos()` escolhe os SKUs direto do banco (nenhuma chamada à API nessa etapa). Critério: round-robin por categoria, para máxima diversidade; dentro da mesma categoria, prioriza o SKU com mais MLBs não-catálogo. Configuração: `QUANTIDADE_LOTE = 10` e `SKUS_FIXOS` opcional (SKUs que sempre entram no lote).

**Rodada 3 — cinco mudanças aditivas:**

1. **Fusão de metadados entre as categorias do SKU.** Obrigatório se qualquer categoria exigir (com `obrigatorio_apenas_em` quando é só em algumas). Lista fechada = interseção por id entre as categorias que têm lista. Texto livre = menor tamanho máximo. Toda divergência entre categorias vira linha em `avisos`; nada é resolvido em silêncio.
2. **Valores atuais agregados por SKU.** Cada valor com `quantidade` e lista de `mlbs`, mais `mlbs_que_pedem_o_campo`.
3. **`produto_erp.marca`**, como referência para BRAND (Marca é a marca real).
4. **Filtro de status.** `STATUS_ACEITOS = {"active", "paused"}`. Os demais MLBs vão para `mlbs_ignorados_inativos` (`{mlb, status}`), com o mesmo tratamento do catálogo. A seleção automática também respeita esse filtro.
5. **Dados de identidade vindos do mesmo `GET /items`** (nenhuma chamada extra): status no ML, SKU gravado no ML (SELLER_SKU ou `seller_custom_field`), `family_id`/`family_name` e variações (id, SKU, atributos). São comparados com o banco em `alertas` por MLB e impressos no console.

**Primeira execução da Rodada 3 (conta MB):** 10 SKUs processados, 0 pulados; 36 MLBs; 13 categorias distintas; zero alertas. Pelo console, F7898415014148.001 tem 2 categorias (MLB264314, MLB108791) e F7899296599427.001 tem 3 (MLB455575, MLB189923, MLB120294). Esses dois exercitam a fusão entre categorias.

## Pai com variações — caso MLB6296165596 (parcial)

- **Hipótese:** o MLB era um "pai" com variações, não 1 MLB de 1 SKU, e contaminava o grupo do SKU F7898415014148.001. Isso é coerente com o bug conhecido documentado em `variacao.py` (todas as variações aparecem com o SKU do pai).
- **O que a execução mostrou:** nenhum dos 36 MLBs processados tem mais de uma variação no ML; quando o ML devolve SKU gravado, ele bate com o do grupo; o status do banco bate com o do ML. No SKU F7898415014148.001, 1 dos 10 MLBs foi barrado pelo filtro de status e 9 foram processados sem alerta, o que aponta para o MLB6296165596 como o barrado.
- **Pendente:** confirmar no campo `mlbs_ignorados_inativos` do JSON qual MLB foi ignorado e com que status. Na tela do ML ele só foi descrito como "Inativo". Análise dos JSONs de F7898415014148.001, F7899296599427.001 e F7899612796271.001 ainda não feita.
- **Cuidado:** 36 MLBs são uma amostra pequena. A frequência real de pai com variações na base só sai do diagnóstico da base inteira.

## Cobertura do ERP

**Fato confirmado por Matheus:** a tabela `Produto` do banco só contém produtos ATIVOS no ERP. MLBs de produtos inativos no ERP não são encontrados/vinculados.

**Números (conta MB; MLBs elegíveis = ativos ou pausados, fora de catálogo e fora de anúncio "fóssil"):**

- 3.993 MLBs elegíveis; **1.586 sem Produto (cerca de 40%)**.
- Desses 1.586: 16 MLBs sem SKU nenhum no ML (agrupados pelo próprio MLB) e 701 SKUs distintos com SKU gravado mas sem Produto.
- **Vínculo desatualizado: 0.** Nenhum dos 701 SKUs existe hoje em `Produto`, então reimportar os anúncios não resolve. Os 5 SKUs sem Produto do lote também não existem no ERP da Samvale.
- **Padrão dos 701 SKUs:** 673 seguem o formato do ERP (F + EAN13 + .NNN), 2 são CHF + EAN13 + .NNN, 2 são id de anúncio (MLB...) no lugar do SKU, e 24 são "outro" (erros de digitação ou de padrão: ponto final sem sufixo, `CH` no lugar de `CHF`, dígito a mais, EAN puro etc.). Esses ~4% podem ter par no ERP depois de normalizados, mas a normalização só pode existir na camada de consulta, nunca alterando o dado cru do banco. Os SKUs de afiliado (`1F...`) podem estar entre os "outro" que não apareceram na amostra.

**Consequência para o projeto:**

- O pipeline funciona normalmente para esses SKUs (agrupa por `sku_ml`), mas `produto_erp` vem nulo: não há título nem Marca de referência.
- Para cerca de 700 SKUs a Marca não tem como ser conferida contra o ERP. A regra da Fase 2 para esses SKUs está em aberto.

## Distribuição de status

| MLBs elegíveis | pausado | ativo | total |
|---|---|---|---|
| COM Produto | 1.535 | 872 | 2.407 |
| SEM Produto | 1.565 | 21 | 1.586 |
| Total | 3.100 | 893 | 3.993 |

- **98,7% dos MLBs sem Produto estão pausados.** Coerente com a explicação de Matheus: produto inativado no ERP, anúncio pausado no ML. A estranheza inicial (só puxamos ativos/pausados, então não deveria haver MLB de produto inativo) se resolve porque "pausado" entra no filtro.
- **Resíduo:** 21 MLBs ativos sem Produto (pode incluir parte dos 16 sem SKU). Candidatos a revisão pelo time, fora do projeto de atributos.
- **A base é 78% pausada:** só 893 MLBs ativos. Mesmo entre os produtos ativos no ERP, 64% dos MLBs estão pausados (1.535 de 2.407); o motivo ainda não é conhecido (estoque zerado? duplicados pausados de propósito?).
- **Impacto no escopo:** o universo da correção de características vai de 893 MLBs (só ativos) a 3.993 (ativos + pausados).

## Em aberto

- **Escopo da correção:** só ativos ou ativos + pausados. Decisão de Matheus.
- **Regra de Marca para SKUs sem referência do ERP** (~700 SKUs). Decisão de Matheus.
- **Diagnóstico da base inteira:** script de leitura que conta, por SKU e por campo, os tipos de divergência já identificados (grafia, estilo, vazio com evidência, vazio sem evidência, fora da lista, conteúdo misturado, diferença estrutural entre categorias), com todas as contagens separadas por status. O plano ainda será apresentado antes de qualquer código.
- **Decisões de estilo ainda não fechadas:** palavras-chave só em Modelo ou também em Linha; normalizar valores fora da lista ou só sinalizar; valor único por SKU para campos compartilhados; Matheus revisa cada SKU antes de qualquer escrita.
- **Análise dos 3 JSONs** (F7898415014148.001, F7899296599427.001, F7899612796271.001) para validar a fusão entre categorias e fechar o caso do pai com variações.
- **Validação em tela pendente:** confirmar se MAIN_COLOR ("Cor principal") aparece no card "Características principais" da categoria MLB108791 (por exemplo no MLB6296165592). É a 2ª categoria para validar a regra `allow_variations`, pendência herdada do checkpoint anterior.
- **Antes de qualquer escrita (Fase 2):** pedir o HTML da doc oficial sobre validação de atributos e erros (valores fora da lista, N/A, dimensões de pacote, vocabulário de `tags`). O comportamento da API com valores fora da lista ainda não está confirmado.
- Pendências de leitura listadas no checkpoint anterior continuam valendo.
