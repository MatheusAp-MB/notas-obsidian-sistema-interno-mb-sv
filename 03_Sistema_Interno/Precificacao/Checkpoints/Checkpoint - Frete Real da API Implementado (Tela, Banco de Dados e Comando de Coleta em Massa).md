---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 21/09/2026
atualizado_em: 22/09/2026 11:26
relacionado: [Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio, Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design, Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML, Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT), Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]
---

# Checkpoint - Frete Real da API Implementado na Precificação ML (Tela, Banco de Dados e Comando de Coleta em Massa)

**Resumo**: Depois da investigação da simulação sem `item_id` (ver [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]], pausada por decisão explícita de Matheus), o trabalho virou pra outra frente: usar o endpoint real de frete (com `item_id`, em anúncio já publicado — já validado antes) pra alimentar a precificação de verdade. Nesta sessão foi desenhada e implementada a cadeia completa: redesenho da tela de auditoria (Passo 7) pra mostrar frete real da API lado a lado com o frete calculado (tabela), modelagem de 3 campos novos no banco, descoberta de uma feature antiga abandonada (`frete_real` dormente desde julho), e criação do comando de coleta em massa — que já rodou por completo contra dados reais da MAGAZINE (3.440/3.447 sucesso) e da SAMVALE (100% sucesso).

> [!warning] Frente B validada visualmente na MAGAZINE — SAMVALE sem a 2ª coleta, Frente A segue não iniciada
> Atualizado 22/09, 09:21: 2ª rodada de `buscar_frete_real_ml` concluída na MAGAZINE (3.439/3.447 sucesso), Passo 7 validado visualmente por Matheus contra a tela real — mas nessa validação apareceu um bug novo (peso_billable exibido em toneladas em vez de kg, por gramas-vs-kg não convertido), já corrigido e reconfirmado com print (seção 14). Matheus decidiu não rodar a 2ª coleta na SAMVALE por ora (falta de tempo, foco na MAGAZINE) — `frete_real_detalhamento` continua vazio lá. Seguem em aberto, por decisão explícita de não investigar agora: os 8 erros da MAGAZINE (2× HTTP 500, 6× HTTP 404) e o `discount_type: none` (seção 11/14). Frente A (ligar `frete_real`/`frete_calculado` na fórmula de precificação) continua não iniciada — ver risco da seção 13 antes de desenhá-la.

## 1. Decisão de pivô — pausar a investigação da simulação, focar no frete real por item publicado

Instrução de Matheus: "hoje o que eu preciso fazer é puxar todos os fretes reais para substituir o frete calculado pelo real, depois voltamos com o frete simulado da API". A investigação da faixa <R$79 (nota relacionada) fica pausada, não abandonada — mesmo endpoint `GET /users/{user_id}/shipping_options/free`, mas usando o modo já validado anteriormente (com `item_id`, contra anúncio publicado — resolve tudo sozinho, sem precisar montar dimensões manualmente).

## 2. Objetivo e desenho da solução

Definição de Matheus:
- Manter o cálculo atual (tabela peso×preço) — não é substituído, vira comparação
- Obter o frete real via API e usar **esse** valor na precificação
- Mostrar o frete calculado (tabela) como badge de comparação ao lado do frete da API
- Regra que vale pra tudo daqui pra frente: **deixar explícito, sempre, de onde cada dado veio e como foi calculado** — mesmo espírito que já rege o resto da tela de auditoria

## 3. Mockup — 2 tentativas

A primeira versão (genérica, HTML/CSS solto) foi rejeitada ("mockup não teve serventia"). Reconstruída depois de um clone atualizado do repositório real (autorizado explicitamente por Matheus só pra essa finalidade), usando as classes/tokens CSS de verdade (`.audit-painel`, `--audit-*`) e a estrutura real do Passo 7. Passou por mais 2 rodadas de ajuste até aprovação:
1. Remover a linha antiga "Frete calculado (Tabela FreteML) — não usado — R$ 48,20" que sobrou de uma versão anterior
2. Mostrar as dimensões usadas em cada cálculo de forma explícita (não só o valor final)
3. Reestruturar em 2 blocos claramente separados — dado REAL (valor de frete + dimensões que geraram esse valor) vs. dado CALCULADO (valor + dimensões + fórmula) — pra não confundir as 2 origens, no mesmo padrão de transparência do resto da auditoria
4. Bloco "Tabela — só comparação, não entra na conta" virou expansível, **sempre retraído por padrão** (não é o foco da tela)

Mockup final aprovado e publicado como artefato antes da geração do diff.

## 4. Implementação real na tela (Passo 7 — Faixa de frete)

Aplicada via script Python único (`aplicar_diff.py`), gerado a pedido explícito de Matheus pra rodar de uma vez só (exceção pontual ao formato padrão Localize/Substitua). Confirmado aplicado com sucesso (saída do script: 4/4 blocos `[OK]`).

Arquivos alterados:
- `precificacao/templates/precificacao/parciais/estrutura_parcial_grade_detalhe.html` — Passo 7 reescrito: badges de cabeçalho (`API real` / `Tabela R$X`), bloco `.frete-secao--real` (origem, dimensões ML, peso cobrado — usando campos novos ainda não populados na época, com fallback `—`), bloco `.frete-secao-colapsavel` (a tabela antiga, reaproveitada sem mudança de backend, retraído por padrão) + função JS `toggleFreteColapsavel`
- `precificacao/static/precificacao/css/layout_grade_precificacao_ml.css` — classes `.audit-tag--api`, `.audit-tag--referencia`, `.audit-frete-badges`, `.audit-frete-diferenca`, `.frete-secao*`

Escopo dessa etapa: só camada de apresentação, com fallback seguro pros campos que ainda não existiam no banco.

## 5. Modelagem de dados — os 3 fretes

Depois de discutir, o modelo final ficou:

| Frete | Onde mora | Depende de margem? | Quem diz a origem |
|---|---|---|---|
| Real (API) | `VariacaoAnuncioMercadoLivre.frete_real` + `.frete_real_atualizado_em` — **campos que já existiam, dormentes desde ~15/07/2026** (ver seção 6), agora reaproveitados | Não — 1 valor por MLB | única fonte, sem ambiguidade |
| Calculado (tabela, ML ou ERP) | `GradePrecificacaoML.frete_calculado` (**campo novo**) | Sim — mesmo peso, mas a faixa de preço muda por margem | `origem_dimensao` (campo que já existia: `variacao_ml` ou `produto_erp`) |
| Qual foi usado na fórmula | `GradePrecificacaoML.origem_frete` (**campo novo**, choices `api_real` / `tabela_calculada`) | — | o próprio campo |

`GradePrecificacaoML.frete_usado` (já existente, usado pela fórmula de precificação) **não muda de nome nem de posição** — decisão explícita pra não alterar mais nada na fórmula agora. Vai receber o valor real quando disponível, senão o calculado (fallback), sempre com `origem_frete` deixando explícito qual dos dois foi usado — **mas essa ligação com a fórmula ainda não foi feita** (ver Pendências).

## 6. Descoberta arquitetural — feature antiga de frete real, abandonada e nunca usada

Durante o desenho dos campos novos, encontrado que `VariacaoAnuncioMercadoLivre` (`mercado_livre/models/variacao.py`) **já tinha** `frete_real` (DecimalField) e `frete_real_atualizado_em` (DateTimeField), criados por volta de 15/07/2026, com comentário no código descrevendo essencialmente o mesmo conceito de fallback real-vs-tabela agora desenhado — mas **nunca populados** (nada escrevia neles) e depois explicitamente abandonados: `precificacao/funcoes_auxiliares/mercado_livre/calcular_grade_precificacao_ml.py` tem comentário dizendo que "esse conceito morreu" e que a função relacionada (`calcular_preco_com_frete_real`) ficou obsoleta quando `formula_precificacao.py` foi reescrita só com cálculo por tabela.

Importante: essa feature antiga **não era o mesmo mecanismo** validado nesta investigação — ela usava dimensões **declaradas pelo vendedor no ML**, mas ainda fazia **busca em tabela** (via `FreteML` + `_buscar_frete_por_peso_e_preco()`), não o custo real retornado pela API. Confirmado em `mercado_livre/management/commands/gerar_relatorio_frete_erp_vs_ml.py` (relatório Excel comparando 2 buscas em tabela, nunca o valor real da API) e em `core/management/commands/popular_banco_suporte/importar_dimensoes_declaradas_ml.py` (importa as dimensões declaradas, mas o comentário do próprio código diz explicitamente que calcular o frete real "agora é responsabilidade de FormulaPrecificacao (ainda não implementada)").

Conclusão: os campos `frete_real`/`frete_real_atualizado_em` da Variação são exatamente os certos pra guardar o valor real da API agora — só precisavam ser finalmente alimentados. Isso evitou recriar um campo duplicado (ver seção 8).

## 7. Confirmação do modelo mental — são 3 fretes, não 2

Matheus formulou e eu confirmei contra o código (`mercado_livre/funcoes_auxiliares/dimensoes_efetivas.py`, função `resolver_dimensoes_efetivas(produto, variacao)` — resolve UMA única `DimensoesEfetivas` usada em toda a cadeia de cálculo: Coleta, Armazenagem e a própria busca de frete na tabela):

1. **Real da API** — 1 valor por MLB, não depende de margem
2. **Calculado com as dimensões do ML** — quando a variação tem dimensão completa (`origem_dimensao = variacao_ml`)
3. **Calculado com as dimensões do ERP** — fallback especificamente quando NÃO é uma variação publicada (produto sem MLB ainda), usa dimensão da embalagem do ERP (`origem_dimensao = produto_erp`)

Os cenários 2 e 3 são o **mesmo campo** (`GradePrecificacaoML.frete_calculado`), só discriminados pelo `origem_dimensao` que já existia — não precisou de campo novo pra essa distinção.

## 8. Diffs no model `GradePrecificacaoML`

**Diff 1 — aplicado e confirmado por Matheus ("feito"), migration já rodada**: adicionados `frete_calculado` (DecimalField), `origem_frete` (CharField, choices `api_real`/`tabela_calculada`) e `frete_real_atualizado_em` (DateTimeField), depois de `frete_usado`.

**Diff 2 — gerado, autorizado por Matheus, mas AINDA NÃO CONFIRMADO como aplicado**: remove `frete_real_atualizado_em` do `GradePrecificacaoML` (campo virou redundante depois da descoberta da seção 6 — o timestamp já existe em `VariacaoAnuncioMercadoLivre.frete_real_atualizado_em`), mantém `frete_calculado` + `origem_frete`, com comentário atualizado explicando onde mora o timestamp agora. **Precisa confirmar com Matheus se ele já rodou esse diff + `makemigrations`/`migrate`.**

## 9. Pesquisa de padrão de chamadas em massa (antes de desenhar o comando novo)

A pedido de Matheus, pesquisado como o projeto já lida com volume de chamadas à API, usando como referência `buscar_mlbs` e `buscar_detalhes` (`integracao_mercado_livre/servicos/`):
- Nenhum dos dois faz throttling manual — `chamar_api()` já trata erro 429 internamente (respeita `Retry-After`, senão backoff exponencial com jitter, até 5 tentativas)
- `buscar_mlbs`: 1 chamada por vez, sequencial, sem lote (a paginação é via `scroll_id` do próprio endpoint)
- `buscar_detalhes`: lotes de 20 (limite da própria API pro endpoint multiget), com checkpoint de retomada (`detalhes_progresso.json`), isolamento de erro por item e por lote
- Convenção estrutural: `servicos/<nome>.py` com a lógica pura + `management/commands/<nome>.py` fino, aceitando `--empresa magazine|samvale` (padrão: roda as 2 sequencialmente), chamando `definir_empresa_ativa(empresa)` antes da função de serviço
- Console sempre com `rich.Progress`, agrupado em blocos visuais fixos

O comando novo seguiu exatamente esse padrão: 1 chamada por vez (sem lote — o endpoint de frete real é por item, não tem multiget), agrupado em blocos de 20 pra exibição (`TAMANHO_GRUPO_EXIBICAO = 20`), sem checkpoint de retomada (execução mais rápida que `buscar_detalhes`, decisão implícita de manter simples).

## 10. Comando novo: `buscar_frete_real_ml`

**`integracao_mercado_livre/servicos/buscar_frete_real_ml.py`** (gerado, entregue como texto pra Matheus aplicar — não escrito diretamente no repositório):
- `_extrair_frete_real(resposta_json)` — lê `coverage.all_country.list_cost` e `coverage.all_country.discount.type` da resposta
- `buscar_frete_real_variacao(variacao, conta, user_id, pasta_logs)` — 1 chamada à API por variação, grava `variacao.frete_real` / `.frete_real_atualizado_em` via `.save(update_fields=[...])` **só quando dá certo** — nunca apaga um valor bom anterior em caso de erro
- `buscar_frete_real_ml(empresa)` — ponto de entrada: busca `variacao_id` distintos em `GradePrecificacaoML.objects.filter(variacao__isnull=False)`, carrega as `VariacaoAnuncioMercadoLivre` correspondentes (`select_related('anuncio')`), processa em blocos de 20 com `rich.Progress`, devolve resumo

**`integracao_mercado_livre/management/commands/buscar_frete_real_ml.py`** — wrapper fino, `--empresa magazine|samvale` (padrão: roda as 2), mesma estrutura de `buscar_detalhes.py`.

Checagem de roteamento multi-empresa feita antes de entregar: a query NÃO filtra por empresa (não existe campo assim no model) — o roteamento é 100% automático via `definir_empresa_ativa()` + `EmpresaRouter`, confirmado lendo `core/empresa.py`/`core/database_router.py` antes de fechar o código.

## 11. Execução real — primeira rodada concluída (MAGAZINE + SAMVALE)

Matheus rodou `python manage.py buscar_frete_real_ml` (sem `--empresa`, roda MAGAZINE depois SAMVALE). Execução completa, resumo final de cada empresa:

- **MAGAZINE**: 3.447 variações processadas — **3.440 com sucesso, 7 com erro**, 1.549,1s (~25,8 min) de tempo total. Todos os 7 erros observados foram HTTP 404 (`Item with id MLBxxxx not found`) — isolados pelo `try/except` do serviço, sem interromper a execução nem apagar dado bom já gravado (comportamento por design, ver seção 10). MLBs com erro vistos até agora: `MLB6311264476`, `MLB5517075890`, `MLB3807429869` (lista pode não estar completa — vale conferir o log final).
- **SAMVALE**: concluída, **0 erros**, tempo total semelhante ao da MAGAZINE (contagem exata de variações e duração não capturada — print perdido por Matheus).
- Durante a rodada, confirmado o valor `discount_type: none` nos dados reais (junto com `mandatory`) — valor que não fazia parte da taxonomia documentada na investigação original (que só tinha visto `mandatory`/`fs_optional`). Ainda não investigado — provavelmente "sem desconto aplicável" pro anúncio/categoria, mas não confirmado.
- Hipótese pros 404: os MLBs referenciados em `GradePrecificacaoML` não são sincronizados ao vivo com o status atual do anúncio no ML — prováveis anúncios encerrados/removidos/pausados por infração depois que a linha da grade foi calculada. Não confirmado caso a caso ainda.

## 12. Ligação do dado real com a tela de auditoria (Passo 7) — Frente B fechada

Matheus mostrou print real da tela (22/09): os campos "Dimensões usadas pelo ML" e "Peso cobrado pela API" continuavam em `—`, e o badge "API real" aparecia sempre destacado mesmo sem dado nenhum por trás. Causa raiz confirmada: o diff da seção 4 foi só camada de apresentação — o template já sabia desenhar os campos (`det.passo_7.frete_real`/`dimensoes_ml`/`peso_billable`), mas **nenhuma view nunca populava esses atributos** (não existiam em `PassoFaixaFrete`, o dataclass compartilhado com os outros 5 marketplaces). O texto "Resposta da API (list_cost) = ainda não implementado" também já era só o fallback de um `{% if %}` que nunca tinha dado real pra mostrar — não precisou de nenhuma mudança no template.

Plano fechado em 2 frentes:
- **Frente A** (não iniciada): ligar `frete_real`/fallback `frete_calculado` na fórmula de precificação (`calcular_grade_precificacao_ml.py`) — continua pendente, ver lista abaixo
- **Frente B** (fechada nesta rodada): popular o Passo 7 da tela de auditoria com o dado real já coletado

Dentro da Frente B, decisão tomada — **"caminho 2"**: em vez de recalcular `billable_weight` localmente (MAX entre peso declarado e peso cúbico, aproximado), guardar o valor real que a própria API devolve, junto com o bloco `discount` inteiro (`type`/`rate`/`promoted_amount`), em campo novo na Variação — mais fiel ao que a API realmente retornou, mesmo espírito do `detalhamento` já usado em `GradePrecificacaoML`. Custo: precisa rodar `buscar_frete_real_ml` de novo pra popular esse campo nos MLBs já coletados (idempotente, mesmo tempo de execução de antes).

4 diffs gerados e já aplicados/migrados por Matheus:
- **`precificacao/views/modal_comum.py`** — `PassoFaixaFrete` (compartilhado com os 6 marketplaces) ganhou 3 campos opcionais (`default=None`): `frete_real`, `dimensoes_ml`, `peso_billable`. Mesmo padrão já usado em `PassoPrecoExato.rebate` (campo que só 1 marketplace preenche, resto fica `None`) — não quebra os outros 5.
- **`mercado_livre/models/variacao.py`** — novo campo `frete_real_detalhamento` (JSONField), guardando `billable_weight`/`discount_type`/`discount_rate`/`discount_promoted_amount`. Migration `0025_variacaoanunciomercadolivre_frete_real_detalhamento` já rodada.
- **`integracao_mercado_livre/servicos/buscar_frete_real_ml.py`** — `_extrair_frete_real()` passou a extrair o bloco inteiro (antes só pegava `list_cost`/`discount.type`); `buscar_frete_real_variacao()` grava `frete_real_detalhamento` junto no mesmo `.save(update_fields=[...])`.
- **`precificacao/views/grade_mercado_livre.py`** — construção do `passo_7` passou a ler `linha.variacao.frete_real`, montar `dimensoes_ml` a partir das dimensões declaradas no ML (`altura_declarada_cm`/etc — mesmas que alimentam o cálculo do frete real, não a embalagem ERP) e `peso_billable` a partir de `frete_real_detalhamento`.

**Verificação antes de rodar em massa**: os campos `list_cost`/`billable_weight`/`discount.type` já estavam confirmados (2 já validados na investigação original, o 3º já tinha rodado certo em produção), mas `discount.rate`/`discount.promoted_amount` eram suposição não verificada em nenhum código real — só citados em prosa na nota da investigação. Gerado um script isolado (`scripts_exploracao_ML/verificar_chaves_discount_billable_weight.py`, 1 chamada só, não grava no banco) pra conferir antes de gastar ~26min×2 rodando errado. Resultado contra MLB6723265420 real: `list_cost: 29.25`, `billable_weight: 3650`, `discount: {rate: 0.5, type: "mandatory", promoted_amount: 58.5}` — todas as 5 chaves bateram exatamente com o que o código já esperava. Nenhum ajuste necessário.

Coleta `buscar_frete_real_ml` disparada de novo (22/09, ~07:5x) pra popular `frete_real_detalhamento` nos MLBs já coletados — **em andamento, ainda não concluída**.

## 13. Risco identificado — `frete_real` depende do preço/margem (análise do deep research externo)

Enquanto a coleta da seção 12 rodava, Matheus pediu ao GPT um deep research sobre regras de frete do ML (fontes oficiais apenas) e pediu pra eu analisar o retorno. Arquivo original salvo por ele na raiz do vault, lido inteiro e agora arquivado em [[Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT)]] (mesma pasta de referência conceitual da API, `05_Integracao_Mercado_Livre/Referencia_API/Conceitos/` — nota tem ressalva de autoria externa e limpeza de 120 marcadores de citação quebrados do export original).

**Cruzamento com o que já tínhamos**: tudo consistente com o que já validamos empiricamente — fórmula de peso volumétrico (A×L×P÷6.000), `billable_weight` = MAX(peso físico, peso volumétrico), estrutura do JSON (`coverage.all_country.{list_cost, billable_weight, discount:{type,rate,promoted_amount}}`), distinção `senders[].cost` (vendedor) vs `receiver.cost` (comprador). Nenhum ajuste de código motivado por isso.

**Informação nova, ainda não usada em lugar nenhum do sistema**:
- Remedição física: o ML pode medir/pesar o pacote de novo após o despacho e ajustar o custo da venda (e passar a valer pras vendas seguintes) se a medida real divergir da declarada
- Desde 2026 um mesmo MLB pode ter mais de uma logística ativa simultaneamente (Full/Flex/Coleta) — nossa chamada de `buscar_frete_real_ml` usa só `item_id` + `verbose=true`, sem especificar `logistic_type`, então não necessariamente reflete a logística que será atribuída numa venda futura específica
- Ideia (não implementada, não pedida ainda): reconciliação pós-venda comparando o `frete_real` previsto contra `senders[].cost` real de `/shipments/{id}/costs`, pra detectar cadastro de embalagem errado ou mudança de política

**O risco em si — o que motivou registrar isso agora**: `frete_real` é capturado 1x por MLB, via `item_id`, sem override de preço — a API cota em cima do **preço atualmente publicado** no anúncio (mandar `item_price` só faz sentido no modo sem `item_id`, que é justamente o modo que [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]] já tinha mostrado não reproduzir o desconto obrigatório). Só que `GradePrecificacaoML` calcula 4 cenários de margem por linha (Mínima/Padrão/Máxima/Competição — seção 5), cada um com preço final potencialmente diferente entre si e diferente do preço publicado. Os limiares comerciais do ML (R$19 e R$79 — abaixo/entre/acima mudam o regime de desconto do frete, ver a pesquisa) são em cima do preço de venda. Se o preço calculado de uma margem cruzar um desses limiares em relação ao preço ao vivo do anúncio, o `frete_real` capturado reflete o regime de desconto do preço **publicado**, não necessariamente o regime que valeria pro preço **daquela margem específica**.

**Onde isso pega**: ainda não pega em nada hoje, porque a Frente A (ligar `frete_real` na fórmula) não foi feita. Mas é um ponto de atenção direto pro desenho da Frente A — se ela simplesmente usar o mesmo `frete_real` pras 4 margens sem checar o cruzamento de limiar, pode aplicar o regime de desconto errado pras margens cujo preço calculado fica de um lado do limiar enquanto o preço publicado está do outro. Não resolvido, não desenhado ainda — só registrado pra não ser esquecido quando a Frente A for desenhada de verdade.

## 14. Segunda rodada de coleta (só MAGAZINE) + bug de unidade no peso_billable — Frente B validada visualmente

**Resultado da 2ª rodada `buscar_frete_real_ml`, MAGAZINE**: 3.447 variações processadas — 3.439 com sucesso, **8 com erro**, 1.527,6s de tempo total. Detalhamento dos erros (mudou em relação à seção 11 — antes eram 7, todos 404; agora são 8, de 2 tipos):
- **2× HTTP 500** (`internal_server_error`, causa não investigada, tipo de erro novo que não tinha aparecido na 1ª rodada): `MLB3956093274`, `MLB6351442058`
- **6× HTTP 404** (`Item with id ... not found`): `MLB6311264476`, `MLB5517075890`, `MLB3807429869`, `MLB5936160538`, `MLB6610544062`, `MLB3429870359`

Por design do serviço (seção 10), nenhum erro apaga dado bom gravado antes — `frete_real`/`frete_real_detalhamento` desses 8 MLBs ficaram com o que já existia (se existia).

**SAMVALE não rodou nessa rodada** — decisão explícita de Matheus (22/09, 09:21): falta de tempo, foco só na MAGAZINE por ora. `frete_real_detalhamento` continua vazio pra todos os MLBs da SAMVALE (o campo `frete_real`/`frete_real_atualizado_em`, esses sim, já tinham sido populados na 1ª rodada — seção 11 — só o detalhamento novo é que falta).

**Bug encontrado durante a validação visual e já corrigido**: Matheus validou o Passo 7 contra a tela real e, à primeira vista, pareceu tudo certo — mas comparando os 2 blocos do mesmo print, o peso "API real" aparecia como **8802,000 kg** contra **8,801 kg** no bloco calculado, pra dimensões praticamente idênticas (mesma embalagem). Não é fisicamente possível — a causa era `billable_weight` vindo da API em **gramas** (confirmado na doc oficial: "peso em gramas inteiros") sendo exibido direto como kg, sem dividir por 1.000. Corrigido em `precificacao/views/grade_mercado_livre.py` — `peso_billable` agora recebe `billable_weight / 1000` antes de ir pro `PassoFaixaFrete` (o valor cru continua salvo sem conversão em `frete_real_detalhamento`, só a exibição no Passo 7 mudou). Matheus aplicou e confirmou com novo print: **8,802 kg** (API) contra **8,801 kg** (calculado) — bate, a diferença de 1g é só arredondamento entre os 2 métodos (embalagem pronta pra despacho vs. cadastro do ERP).

Com o bug corrigido e o segundo print confirmando os valores certos, a **Frente B está validada visualmente de ponta a ponta** na MAGAZINE: origem, dimensões declaradas, peso cobrado pela API e o valor real (`list_cost`) todos aparecendo corretos no Passo 7, badge "API real" condizente com dado de verdade por trás.

## Pendências

- **SAMVALE sem a 2ª rodada de coleta** — `frete_real_detalhamento` continua vazio lá (decisão de Matheus, 22/09: retomar quando houver tempo)
- Investigar os 8 erros da MAGAZINE (seção 14) — 6 HTTP 404 (confirmar se são anúncios encerrados/removidos/pausados) e 2 HTTP 500 (causa ainda desconhecida) — **decisão explícita de Matheus (22/09): não investigar agora**, fica em aberto
- Investigar o `discount_type: none` observado nos dados reais (seção 11) — **decisão explícita de Matheus (22/09): não investigar agora**, fica em aberto
- **Frente A, em desenho** (adiada várias vezes nesta sessão, agora com foco exclusivo de Matheus a partir de 22/09): ligar `frete_real` (com fallback pra `frete_calculado`) na fórmula de precificação real (`calcular_grade_precificacao_ml.py` / `FormulaPrecificacao`), pra `frete_usado`/`origem_frete` passarem a ser populados de fato na grade — só depois disso o badge "API real" no cabeçalho do Passo 7 passa a refletir a origem de verdade (hoje é só estilo fixo). Desenho em andamento (ainda sem código/diff) em [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]] — já parte do risco desta seção 13 como ponto de partida da discussão
- Retomar a investigação da faixa <R$79 (nota relacionada) quando Matheus decidir voltar a ela
- Avaliar (só ideia por enquanto, não pedida) reconciliação pós-venda via `/shipments/{id}/costs` (`senders[].cost`) — vinda da pesquisa externa, seção 13

## Relacionado

- [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]]
- [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]]
- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
- [[Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT)]]
- [[Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)]]
