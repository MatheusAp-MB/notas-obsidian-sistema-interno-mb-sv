---
tipo: regra
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 26/08/2026 11:11
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
| [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]] | checkpoint | em_andamento | 13/08/2026 | **Atualizado 26/08/2026, 11:11**: ponto 02 do plano de 5 pontos (`buscar_mlbs.py`) concluído e validado com chamada real nas 2 empresas (Magazine: 5640 MLBs, 132,9s; Samvale: confirmado funcionando). App novo `integracao_mercado_livre/` criado, espelhando `api_sysemp`/`integracao_sysemp`. 2 correções reais em `cliente_api.py` (log por script, `propagate=False`) e redesenho da exibição em console (blocos por grupo de status) documentados como lição reaproveitável pro ponto 03. Pendências novas: caminho de saída aninhado por empresa diverge da convenção antiga (não isolada) ainda usada por `detalhes_mlbs.json`/`dados_completos_por_sku.json`; testes automatizados adiados de propósito. *Atualizado 25/08/2026, 11:58*: achado grande — o app `mercado_livre/` já existe e está maduro (11 models, 22 migrations, 5 importadores em POO já prontos); só falta migrar a "metade A" (busca na API + geração dos 2 `.json`), não o consumo. Os 4 arquivos antigos foram identificados e comparados (`chamadas_safe_api.py`, `buscar_mlbs.py`, `buscar_dados_sku_completo.py` — confirmado como origem de `dados_completos_por_sku.json` — e `classificar_por_sku.py`, que não precisa de alteração). Schemas dos 3 `.json` confirmados; achado novo: campo `mlbu` existiu no banco e foi removido em 05/07/2026, decisão de reintroduzir ainda pendente. |

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Padrao de Robustez para Clientes de API Externa]]
