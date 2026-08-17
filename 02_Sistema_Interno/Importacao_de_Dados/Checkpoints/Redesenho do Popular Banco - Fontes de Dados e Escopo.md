---
tipo: checkpoint
dominio: 
status: concluido
criado: 15/08/2026
atualizado_em: 17/08/2026 00:20
relacionado: [Produto Nasce Exclusivamente do ERP, Sistema Espelha Dado Bruto do ERP Mesmo Quando E Fisicamente Absurdo, Recriar Migration com Mesmo Nome Nao Reseta o Historico do Django, Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, Padrao de Qualidade e Clareza Estrutural do Repositorio, Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]
---

# Redesenho do Popular Banco — Fontes de Dados e Escopo

> **✅ Concluído (17/08/2026, 00:20).** Implementado, validado com dado real do ERP, commitado (`9284b6c` + ajuste pequeno de acabamento), e o último item pendente (caminho dos 4 arquivos de frete) foi corrigido e validado — ver "Único item pendente" no fim desta nota, agora fechado. Pra quem retoma: o resto desta nota (tabela de arquivos, as 7 decisões) continua sendo a explicação de COMO e POR QUÊ chegamos nesse desenho — a seção "Resultado real da implementação" logo abaixo é o que de fato aconteceu quando rodamos de verdade.

## Resultado real da implementação (validado em produção, 15/08/2026)

`python manage.py popular_banco` foi rodado de ponta a ponta contra os 2 arquivos reais do ERP (Ativos + Inativos da MB — ver nota abaixo sobre os arquivos da SV). Resultado, sem nenhum erro não tratado:

- **879 produtos criados** — 696 marcados `ativo_no_erp=True`, 183 marcados `ativo_no_erp=False` (bate exatamente com o total). Confirma que o campo novo está lendo a coluna "Inativo" do ERP corretamente, linha a linha.
- **2 linhas sem EAN**, descartadas (contadas, não silenciosamente ignoradas) — provavelmente linha de rodapé/observação da planilha, não produto de verdade.
- **118 SKUs com dimensão de embalagem fisicamente absurda no ERP** (ex: peso cúbico calculado em mais de 1 milhão de kg) — identificados e reportados no terminal e no log (`logs/popular_banco_*.log`), pra time de cadastro corrigir na origem. Isso é comportamento intencional, não bug — ver [[Sistema Espelha Dado Bruto do ERP Mesmo Quando E Fisicamente Absurdo]] pra entender por que o sistema guarda esse dado errado em vez de "corrigir" sozinho.
- **Etapas do ML rodando com "0 variações"** (`DIMENSÃO DE ENVIO`, `GRADE ML`, `RECOMENDAÇÃO PRECIFICAÇÃO`) — esperado, não é erro: sem `ANUNCIOS ML`/`DIMENSÕES DECLARADAS ML` ativas, não existe nenhuma `VariacaoAnuncioMercadoLivre` no banco ainda. Volta a ter dado real quando o comando dedicado da API do ML existir.

Achado à parte, durante a implementação (não sobre o resultado, sobre o PROCESSO): apagar e recriar uma migration com o mesmo nome bagunçou o histórico do Django de um jeito não óbvio — ver [[Recriar Migration com Mesmo Nome Nao Reseta o Historico do Django]] pra não perder tempo se isso acontecer de novo.

Achado à parte sobre os arquivos: apareceram 4 arquivos do ERP, não 2 (MB e SV) — decisão foi ignorar os da SV por enquanto, ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]].

## Único item pendente — RESOLVIDO (17/08/2026)

> [!danger] Isso ficou "não urgente" por 2 dias e quase passou despercebido pra sempre
> O parágrafo abaixo (versão original, de 15/08) tratava isso como um detalhe de acabamento, sem risco. Não era — o comando rodou "normalmente" por 2 dias inteiros lendo frete desatualizado, sem nenhum erro visível, e só foi descoberto por acaso, numa tarefa completamente diferente (gerar um relatório pra Samvale, 17/08). Causa raiz, o quanto isso ficou invisível, e a correção real estão documentados em [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]] — vale a leitura completa, não só este resumo.

~~As 4 tabelas de frete (`Tabela_Frete_ML.xlsx`, `Tabela_Frete_Magalu.xlsx`, `Tabela_Frete_TikTok.xlsx`, `Tabela_Frete_Amazon.xlsx`) continuam sendo lidas do caminho antigo (`Arquivos_de_Importação/`) — o código delas não foi atualizado ainda pra apontar pra pasta nova organizada (`Arquivos usados para Popular Banco/Tabelas de Frete/`), mesmo os arquivos já tendo sido colocados lá fisicamente pelo usuário. Não é urgente (o comando funciona normalmente do jeito que está), só não está 100% arrumado ainda — é a única parte da decisão 7 (mais abaixo) que falta.~~ (texto original de 15/08, mantido riscado pra registro — a frase "não é urgente" foi exatamente o que deixou isso 2 dias sem ninguém perceber.)

## Por que esse redesenho existe

O comando `core/management/commands/popular_banco.py` é crítico (é ele que traz dado real — produtos, anúncios, frete, precificação — pro banco) e, nas palavras do usuário, "passou por muitas versões de muitas mudanças" e está malfeito. Diferente do `iniciar_banco` (seed fixo, já auditado e corrigido — ver commit `7ac6c53`), o `popular_banco` importa dado que muda com o tempo, vindo de arquivo (Excel/JSON).

## O que o popular_banco faz hoje (17 etapas)

Roda em sequência, cada etapa populando um tipo de dado diferente: produtos do ERP → anúncios do ML → indicadores da Agenda de Vídeos → dimensões declaradas do ML → qualidade de anúncio → competição de catálogo → 4 tabelas de frete (ML/Magalu/Tiktok/Amazon) → organizar dimensão de envio → 6 grades de precificação (uma por marketplace) → promoções do ML → recomendação final de precificação.

## Tabela de arquivos externos usados hoje (antes do redesenho)

| Arquivo | Usado em | Formato | Objetivo |
|---|---|---|---|
| `Arquivos_API/detalhes_mlbs.json` | PRODUTOS ERP, ANUNCIOS ML, DIMENSÕES DECLARADAS ML | JSON (API ML) | Lista bruta de anúncios/MLBs do Mercado Livre. |
| `Arquivos_de_Importação/Produtos_do_ML_Sysemp.xlsx` | PRODUTOS ERP (fase "Rascunho") | Excel (ERP) | Cruza SKU do ML com o ERP pra achar o EAN. |
| `Arquivos_de_Importação/Relatorio_Completo_ERP.xlsx` | PRODUTOS ERP (fase "Enriquecimento") | Excel (ERP, só ativos) | Custo, dimensão, NCM — só produtos ativos no ERP. |
| `Arquivos_API/dados_completos_por_sku.json` | QUALIDADE, COMPETICAO | JSON (API ML) | Qualidade de anúncio e competição de catálogo, por SKU. |
| `Arquivos_de_Importação/Tabela_Frete_ML.xlsx` | FRETE ML | Excel (manual) | Custo de frete do ML por faixa. |
| `Arquivos_de_Importação/Tabela_Frete_Magalu.xlsx` | FRETE MAGALU | Excel (manual) | Idem, Magalu. |
| `Arquivos_de_Importação/Tabela_Frete_TikTok.xlsx` | FRETE TIKTOK | Excel (manual) | Idem, Tiktok Shop. |
| `Arquivos_de_Importação/Tabela_Frete_Amazon.xlsx` | FRETE AMAZON | Excel (manual) | Idem, Amazon. |
| `Arquivos_API/promocoes_completo.json` | PROMOÇÕES ML | JSON (API ML) | Promoções ativas por anúncio no ML. |
| ~~`Arquivos_de_Importação/Planilha_Importar_Pos_Macro.xlsm`~~ | ~~PRECIFICAÇÃO — PLANILHA VALIDADA~~ | Excel (.xlsm) | Desativado desde 21/07 — etapa já comentada no código. |

As outras 6 etapas (`INDICADORES AGENDA`, `DIMENSÃO DE ENVIO`, as 6 `GRADE DE PRECIFICAÇÃO`, `RECOMENDAÇÃO PRECIFICAÇÃO`) não leem arquivo nenhum — trabalham 100% em cima do banco.

## As 7 decisões fechadas nesta rodada

1. **Os 2 arquivos de ERP mudam de nome e de fonte.** `Produtos_do_ML_Sysemp.xlsx` e `Relatorio_Completo_ERP.xlsx` deixam de existir. Passam a existir só 2 arquivos: `Relatorio_Todos_Produtos_Ativos_Tela_Cadastro_Produtos_ERP_MB.xlsx` e `Relatorio_Todos_Produtos_Inativos_Tela_Cadastro_Produtos_ERP_MB.xlsx` — mesma estrutura de 116 colunas nos dois (confirmado abrindo uma amostra real).

2. **Campo novo no model `Produto`: `ativo_no_erp`.** A planilha do ERP já traz uma coluna chamada `Inativo`, com valor `'T'`/`'F'` linha a linha — é essa coluna que vai preencher o campo novo (`ativo_no_erp = (linha['Inativo'] != 'T')`), não o nome do arquivo. Assim o dado fica auditável mesmo se uma linha "vazar" pro arquivo errado.

3. **As 2 fases antigas de `importar_produtos_erp.py` (Rascunho + Enriquecimento) colapsam em 1 fase só.** Antes, "Rascunho" vinha do JSON do ML (achava o EAN cruzando com um ERP simples) e "Enriquecimento" vinha de um ERP completo separado (só produtos ativos). Como a planilha nova já traz todas as colunas das 2 fases antigas de uma vez, não faz mais sentido ter 2 fases — e ver decisão 6 (Produto nasce do ERP, não do ML) reforça isso. Ver [[Produto Nasce Exclusivamente do ERP]].

4. **Achado técnico real: 3 colunas duplicadas no cabeçalho do Excel.** `Marca`, `Grupo` e `Subgrupo` aparecem 2 vezes cada — a 1ª ocorrência é o nome legível (ex: `'BRUDDEN'`), a 2ª é um ID numérico interno do ERP (ex: `1127`). Só `Marca` é realmente usada hoje (mapeia pro campo `Produto.marca`); `Grupo`/`Subgrupo` duplicados não são consumidos por nenhum campo no momento. **Solução decidida:** distinguir as 2 ocorrências pelo TIPO do valor (texto = nome real, número puro = ID interno descartável) — nunca pela posição da coluna, porque a ordem pode mudar numa exportação futura do ERP. Se a distinção ficar ambígua (as duas numéricas, ou as duas vazias), o código deve falhar com erro claro, nunca escolher errado silenciosamente.

5. **Os 3 arquivos JSON da API do ML saem do escopo do `popular_banco`.** `detalhes_mlbs.json`, `dados_completos_por_sku.json` e `promocoes_completo.json` não são mais responsabilidade deste comando. Consequência direta: as 5 etapas que só existem por causa desses arquivos (`ANUNCIOS ML`, `DIMENSÕES DECLARADAS ML`, `QUALIDADE`, `COMPETICAO`, `PROMOÇÕES ML`) ficam **comentadas** em `popular_banco.py` — mesmo tratamento já dado à etapa da Planilha Validada (desativada em 21/07) — até existir um comando próprio e dedicado pra API do ML (mesmo padrão já usado no Sysemp, ex: `sincronizar_impostos_entrada`). O usuário confirmou: os arquivos da API não deixam de existir, só deixam de ser lidos "soltos" — o comando novo vai lidar com eles de forma organizada quando a integração do ML for retomada.

6. **`Arquivos_API/` (a pasta) continua existindo como está.** Não é exclusiva do `popular_banco` — também é lida por `mercado_livre/management/commands/gerar_relatorio_frete_erp_vs_ml.py`, `investigar_campos_api.py`, e `mercado_livre/funcoes_auxiliares/promocoes_json.py` (que inclusive lê um nome de arquivo diferente, `amostra_promocoes.json` — inconsistência à parte, não mexida agora). Só sai da lista de dependências do `popular_banco`, não sai do projeto.

7. **Pasta nova organizada pros arquivos que sobram.** `Arquivos usados para Popular Banco/`, com 2 subpastas: `Produtos ERP/` (os 2 arquivos do ERP) e `Tabelas de Frete/` (os 4 arquivos de frete). Cobre exatamente o que sobra depois do JSON do ML sair do escopo.

## Próximo passo, quando retomar (histórico — 4 dos 5 itens já concluídos)

1. ~~Migration: campo `ativo_no_erp` (BooleanField) em `Produto`.~~ **Concluído.**
2. ~~Reescrever `importar_produtos_erp.py`: 1 fase só, lendo os 2 arquivos do ERP (Ativos + Inativos), com a validação por tipo de valor pras 3 colunas duplicadas.~~ **Concluído.**
3. ~~`popular_banco.py`: comentar as 5 etapas do ML (`ANUNCIOS ML`, `DIMENSÕES DECLARADAS ML`, `QUALIDADE`, `COMPETICAO`, `PROMOÇÕES ML`).~~ **Concluído.**
4. Criar a pasta `Arquivos usados para Popular Banco/` (com `Produtos ERP/` e `Tabelas de Frete/`) e mover os 6 arquivos que sobram pra lá — ajustando os caminhos no código. **Parcial** — a pasta existe e os arquivos de Produtos ERP já são lidos de lá; os 4 arquivos de frete já foram colocados na subpasta nova, mas o código dos 4 importadores de frete ainda aponta pro caminho antigo (ver "Único item pendente" acima).
5. ~~Rodar `manage.py popular_banco` de ponta a ponta pra validar, com os arquivos reais do ERP.~~ **Concluído** — ver "Resultado real da implementação" acima.

## Relacionado

- [[Produto Nasce Exclusivamente do ERP]]
- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
