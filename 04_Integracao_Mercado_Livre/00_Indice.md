---
tipo: regra
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 26/08/2026 16:35
relacionado: [Estrutura e Convenções do Vault, Padrao de Robustez para Clientes de API Externa]
---

# Índice — Integração Mercado Livre

Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por contexto/área. Atualizado junto da autorização de escrita de cada nota (ver [[Estrutura e Convenções do Vault]]).

Mundo criado em 06/08/2026, mesma lógica do `03_Integracao_Sysemp/`: API grande o suficiente pra justificar ser testada e documentada de forma isolada. Existe um projeto anterior e diferente (`03_ML_Analytics_HUB/`, congelado em `LEGADO/`) que serve de fonte de lições aprendidas sobre como blindar chamadas a essa mesma API, não de continuidade direta.

**Integração começou de fato em 12/08/2026** — código já existente e em uso numa pasta separada do computador, migrado pro repo `Projeto_Sistema_Interno_V2` por etapas, começando pela base de autenticação + cliente HTTP.

O padrão de segurança/estrutura de cliente de API (throttle, backoff, hierarquia de exceção, nome de pacote) é cross-cutting e mora em [[Padrao de Robustez para Clientes de API Externa]], dentro de `02_Sistema_Interno/Regras_de_Comportamento/` — não duplicado aqui.

## Cliente_HTTP

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]] | decisao | ativa | 12/08/2026 | Migração dos 3 arquivos base (auth OAuth2+PKCE, gerenciador de token, cliente HTTP) de pasta separada do computador pra `api_mercado_livre/core/`, padrão `api_<nome>/core`. Achado real: `.env` já dividido por conta (MB/SV) sem variável compartilhada — `gerenciador_token.py` corrigido pra exigir `conta` explícito, sem padrão, com lock de renovação por conta. Validado com chamada real (`GET /users/me`, HTTP 200) nas 2 contas, incluindo renovação automática de token. **Reconfirmado em 26/08, 09h17** — início do foco 100% em Integração ML: usuário revalidou ao vivo, HTTP 200 nas 2 contas de novo. Achado nesta revalidação: falta um Facade pro ML (nos moldes do `ApiSysemp(empresa=None)`, que já existe e já resolve `obter_empresa_ativa()` sozinho) — hoje a escolha MB/SV pro lado do ML ainda é manual, passada por quem chama. |

## Coleta_de_Dados

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]] | checkpoint | em_andamento | 13/08/2026 | **Atualizado 26/08/2026, 16:35 — ÚLTIMA ATUALIZAÇÃO ANTES DE TROCA DE COMPUTADOR**: ponto 05 (`buscar_dados_sku_completo.py`) fechado — **plano de 5 pontos 100% migrado e testado**. Só `encontrar_fecho_transitivo()` precisou ser migrada de verdade (pro mesmo local canônico do ponto 04, `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py`) — decisão embasada num bug real já documentado no código (`VariacaoAnuncioMercadoLivre.sku_ml`: variações aparecem com o SKU do pai), que tornaria o agrupamento via banco não confiável pra essa finalidade. `CAMINHO_QUALIDADE` (pendência desde 13/08) finalmente resolvida via `caminho_dados_completos_por_sku()`; `QUALIDADE`/`COMPETICAO` religadas em `popular_banco.py` — só `PROMOÇÕES ML` segue comentada (assunto pausado à parte). Testado com 1 SKU por empresa (Magazine: 19 MLBs, 7 base/6 simples/6 catálogo, todos os pares Base↔Catálogo conferidos batendo por `mlbu`; Samvale: 1 SKU, confirmado funcionando) e validado **visualmente na tela real do site** (gauge de qualidade + status de competição aparecendo), não só o dado chegando no arquivo. **Atenção crítica**: esse diff foi testado no computador do usuário mas AINDA NÃO FOI COMMITADO nem enviado pro GitHub (confirmado por `git fetch` — remoto segue no commit do ponto 04) — prioridade #1 ao retomar. Falta só: commitar, e rodar a base inteira (`buscar_dados_sku_completo` sem `--skus`, 1h30+, nas 2 empresas) + `popular_banco` de novo. *Atualizado 26/08/2026, 15:42*: ponto 04 (`classificar_por_sku.py`) fechado — mas virou eliminação de duplicação, não migração: a regra de classificação já existia, reimplementada à parte em `importar_anuncios_ml.py`; unificada agora em `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py` (`classificar_catalogo()`), local padronizado pela convenção `<app>/funcoes_auxiliares/` já usada em todo o repo. Testado de verdade no shell (não só `manage.py check`): identidade de função confirmada + 3 exemplos reais batendo com a regra. Decisão de sequência revisada pelo usuário: banco populado agora, sem esperar o ponto 05 (que sozinho leva 1h+) — religadas em `popular_banco.py` as 2 das 5 etapas de ML que só dependiam de `detalhes_mlbs.json` (`ANUNCIOS ML`, `DIMENSÕES DECLARADAS ML`); as outras 3 seguem comentadas (`QUALIDADE`/`COMPETICAO` dão `NameError` sem o ponto 05 — `CAMINHO_QUALIDADE` nunca foi declarado). Validado com execução real, 0 erros, nas 2 empresas: Magazine (5640 anúncios, 5906 variações, cadeia 02→03→04 consistente, 0 órfãos) e Samvale. Achados de qualidade de dado expostos (não são bugs da migração): anúncios sem produto no ERP, divergências de dimensão de envio, 4 asserts de margem em Grade — registrados como pendência separada. 3 dos 5 pontos prontos; falta só ponto 05 (`buscar_dados_sku_completo.py`). *Atualizado 26/08/2026, 11:50*: ponto 03 do plano de 5 pontos (`buscar_detalhes.py`) concluído e validado nas 2 empresas — CSV removido (só JSON), retomada de progresso mantida e melhorada (só apaga se terminar sem erro), mesmo padrão de console em blocos do ponto 02 reaproveitado (agrupado por posição sequencial, sem dimensão "status" aqui), e caminho de `detalhes_mlbs.json` corrigido também no lado consumidor (`importar_dimensoes_declaradas_ml.py`, constante virou função por empresa). Magazine: 5906 registros (5640 MLBs, 100%, 0 erros), 165,3s. Samvale: 3545 registros (3280 MLBs, 100%, 0 erros), 86,8s. Sem gargalo nos 2 lados. *Atualizado 26/08/2026, 11:11*: ponto 02 (`buscar_mlbs.py`) concluído e validado com chamada real nas 2 empresas (Magazine: 5640 MLBs, 132,9s; Samvale: confirmado funcionando). App novo `integracao_mercado_livre/` criado, espelhando `api_sysemp`/`integracao_sysemp`. 2 correções reais em `cliente_api.py` (log por script, `propagate=False`). *Atualizado 25/08/2026, 11:58*: achado grande — o app `mercado_livre/` já existe e está maduro (11 models, 22 migrations, 5 importadores em POO já prontos); só falta migrar a "metade A" (busca na API + geração dos 2 `.json`), não o consumo. Schemas dos 3 `.json` confirmados; achado novo: campo `mlbu` existiu no banco e foi removido em 05/07/2026, decisão de reintroduzir ainda pendente. |

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Padrao de Robustez para Clientes de API Externa]]
