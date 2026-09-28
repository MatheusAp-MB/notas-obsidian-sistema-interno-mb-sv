---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 27/09/2026
atualizado_em: 27/09/2026 21:25
relacionado: [Guia de Setup - Do Zero ao Primeiro Preco Calculado, Camadas do Cliente Mercado Livre Transporte Contexto e Ponto de Entrada, Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada, Sistema Espelha Dado Bruto do ERP Mesmo Quando E Fisicamente Absurdo, Produto Nasce Exclusivamente do ERP, Redesenho do Popular Banco - Fontes de Dados e Escopo]
---

# Reconstrução Completa do Banco do Zero — Validação de Ponta a Ponta Pós-Reforma OOP do Mercado Livre (27/09/2026)

## Contexto

Segunda reconstrução do banco no mesmo dia — a 1ª (18:39, ver [[Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada]]) validou o fix do bug de `bulk_update`/`FreteML.regime`. Depois dela, ainda no mesmo dia, aconteceu a Peça 3+4 da reforma OOP do `api_mercado_livre` (Transporte/Contexto/Facade — ver [[Camadas do Cliente Mercado Livre Transporte Contexto e Ponto de Entrada]]), validada até agora só isoladamente via `manage.py shell`. Matheus decidiu, por iniciativa própria (não motivado por bug), dropar e recriar os 2 bancos de novo (`DROP DATABASE` + `CREATE DATABASE` manual, MySQL) e repetir toda a sequência de setup — desta vez pra provar que o sistema inteiro sobe do zero absoluto **incluindo** a reforma OOP e o fix do frete, não só em isolamento. Processo pedido explicitamente em partes, 1 comando por vez, validando cada um antes do próximo.

## Sequência executada e validada (em ordem)

1. **`migrate --database=magazine` / `--database=samvale`** — schema recriado nos 2 bancos, sem erro. (`migrate` deste projeto exige `--database` explícito, mixin `ExigirDatabaseExplicito`.)
2. **`iniciar_banco --empresa=magazine` / `--empresa=samvale`** — seed fixo, sem erro: marketplaces (8), critérios de qualidade (16), configuração operacional (1 geral + 4 faixas de armazenagem), tipos de anúncio ML (2), comissão Shopee (5 faixas) e TikTok (2 faixas), taxa kg adicional Amazon (10 faixas DBA/FBA), régua de fases da agenda de vídeos (3).
3. **`sincronizar_categorias_ml --empresa=magazine` / `--empresa=samvale`** — 12233 categorias cada, sem erro. De brinde, confirmou a renovação automática de token funcionando na conta SV (`[AUTH] Token da conta SV expirando. Renovando...`).
4. **`popular_banco --empresa=magazine` / `--empresa=samvale`** — rodado 2 vezes (ver achado abaixo). Na 2ª rodada, fechou limpo nas 2 empresas: produtos ERP (1358 MB / 731 SV), anúncios ML (5552 MB / 3530 SV, variações 5793 / 3784), indicadores de agenda, dimensões declaradas, frete (4 tabelas, todas com match), dimensão de envio, as 6 grades de precificação, recomendação de precificação. Durações: 46,9s (MB) / 28,4s (SV) — bem abaixo do que o pipeline de coleta via API levaria, já que aqui é só leitura de arquivo local + gravação em banco.

## Achado real do processo — ordem de dependência entre categorias e anúncios

Na 1ª rodada de `popular_banco` (antes do passo 3 ter efeito completo), **100% dos anúncios** vieram com `"Sem categoria correspondente"` (5552 MB / 3530 SV). Causa: `importar_anuncios_ml.py` casa a categoria de cada anúncio carregando `CategoriaMercadoLivre.objects.all()` num dict por `category_id` — com a tabela vazia (banco novo, `sincronizar_categorias_ml` ainda não tinha efeito nenhum registro), nenhum match é possível.

Rodar `sincronizar_categorias_ml` depois não corrige sozinho os registros já gravados — `importar_anuncios_ml` só liga a categoria no momento em que processa o JSON, não existe recálculo automático. Foi preciso rodar `popular_banco` uma 2ª vez. Confirmado: "Sem categoria correspondente" caiu de 100% pra 0 nas 2 empresas na 2ª rodada, com todos os outros números idênticos (agora como "atualizado" em vez de "criado" — upsert funcionando).

**Lição pra qualquer rebuild futuro do zero**: a ordem certa é `migrate` → `iniciar_banco` → `sincronizar_categorias_ml` → `popular_banco` (`sincronizar_categorias_ml` sempre antes da 1ª vez que `popular_banco` roda, nunca depois).

## Achados de dado — esperados, não são bug desta reconstrução

- **"Sem produto correspondente"** (2274 MB / 1545 SV) — mesma categoria de achado documentada desde 15/08 em [[Produto Nasce Exclusivamente do ERP]]: anúncio existe no ML sem cadastro correspondente ativo no ERP. Não é regressão de hoje.
- **Dimensão de embalagem fisicamente absurda** (23 SKUs na MB, ex: peso cúbico calculado em milhões de kg) — comportamento intencional já documentado em [[Sistema Espelha Dado Bruto do ERP Mesmo Quando E Fisicamente Absurdo]]: o sistema espelha o dado bruto errado do ERP de propósito, pra gerar relatório de correção, nunca "conserta" sozinho.
- **Samvale segue sem `dados_completos_por_sku.json`** — etapas QUALIDADE e COMPETIÇÃO pularam graciosamente (mensagem "arquivo não encontrado — pulando essa etapa", sem crash). Pendência separada, não bloqueia o resto do rebuild: falta rodar `buscar_dados_sku_completo --empresa=SAMVALE` (chamada real à API, mais demorada — sem prioridade definida ainda).

## Frete Real (`buscar_frete_real_ml`) — validado nas 2 empresas (21:25)

1ª vez que a Peça 3 da reforma OOP (`FreteRealML` + Facade) roda de ponta a ponta pelo Orquestrador completo (console em blocos, gravação real em `VariacaoAnuncioMercadoLivre.frete_real`) contra um banco novo — não só isolada via shell.

- **Magazine**: 3386/3388 com sucesso (99,94%), 2 com erro, 1512,3s (~25min).
  - Os 2 erros (`MLB3807429869`, `MLB5302943576`) foram HTTP 404 "Item with id ... not found" — o próprio Mercado Livre não reconhece mais esses IDs (anúncio removido de vez, não só pausado). Dado real da API, não falha do código: o Orquestrador tratou exatamente como sempre tratou (`ErroAPI` capturado, logado, segue pro próximo).
- **Samvale**: 2155/2155 com sucesso (100%), 0 erros, 963,3s (~16min).

Tempo bate com o esperado — este endpoint não tem multiget (`GET /users/{user_id}/shipping_options/free`), é 1 chamada por MLB, sequencial, mesmo perfil de performance documentado antes da reforma.

## Em andamento agora (21:25)

`buscar_comissao_real_ml --empresa=magazine` / `--empresa=samvale` — próxima peça a validar (2 chamadas por MLB: `/items/{mlb}` + `/sites/MLB/listing_prices`, com cache de `/items` por execução). Última peça da reforma OOP ainda sem validação via Orquestrador completo neste rebuild.

## Observação — Guia de Setup pode estar desatualizado

[[Guia de Setup - Do Zero ao Primeiro Preco Calculado]] (16-17/08/2026) descreve a sequência `migrate` → `iniciar_banco` → `popular_banco` → `sincronizar_impostos_entrada`, mas não menciona `sincronizar_categorias_ml`, `buscar_frete_real_ml` nem `buscar_comissao_real_ml` — comandos que só passaram a existir com a reforma OOP de setembro. Achado, não corrigido nesta nota (fora do que foi pedido agora) — o guia pode precisar de uma revisão pra incluir esses 3 passos na ordem certa (categorias antes do 1º `popular_banco`, frete/comissão depois da Grade de Precificação existir).

## Relacionado

- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
- [[Camadas do Cliente Mercado Livre Transporte Contexto e Ponto de Entrada]]
- [[Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada]]
- [[Sistema Espelha Dado Bruto do ERP Mesmo Quando E Fisicamente Absurdo]]
- [[Produto Nasce Exclusivamente do ERP]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
