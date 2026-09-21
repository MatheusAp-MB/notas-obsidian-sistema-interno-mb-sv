---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 21/09/2026
atualizado_em: 21/09/2026 17:11
relacionado: [Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio, Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design, Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]
---

# Checkpoint - Frete Real da API Implementado na Precificação ML (Tela, Banco de Dados e Comando de Coleta em Massa)

**Resumo**: Depois da investigação da simulação sem `item_id` (ver [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]], pausada por decisão explícita de Matheus), o trabalho virou pra outra frente: usar o endpoint real de frete (com `item_id`, em anúncio já publicado — já validado antes) pra alimentar a precificação de verdade. Nesta sessão foi desenhada e implementada a cadeia completa: redesenho da tela de auditoria (Passo 7) pra mostrar frete real da API lado a lado com o frete calculado (tabela), modelagem de 3 campos novos no banco, descoberta de uma feature antiga abandonada (`frete_real` dormente desde julho), e criação do comando de coleta em massa — que já rodou contra dados reais da MAGAZINE com sucesso parcial confirmado.

> [!warning] EM ANDAMENTO — comando rodando, 2º diff do model pendente de confirmação
> Matheus pediu pausa no fim do expediente (21/09, 17:11) com o comando `buscar_frete_real_ml` ainda em execução (MAGAZINE em andamento, SAMVALE ainda não começou) e sem confirmar se já aplicou o 2º diff do model (remoção do campo residual). Retomar amanhã: (1) conferir resumo final do comando, (2) confirmar aplicação do 2º diff + migration.

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

## 11. Execução real — primeira rodada (em andamento)

Matheus rodou `python manage.py buscar_frete_real_ml` (sem `--empresa`, roda MAGAZINE depois SAMVALE). Confirmado até agora:
- MAGAZINE: 3.447 variações a processar, 173 grupos de 20
- Grupos 1 a 4 (80 variações): **100% de sucesso**, valores reais em R$ gravados, `discount_type` exibido entre parênteses — mix de `mandatory` e `none` observado nos dados reais
- **Achado novo, não documentado ainda**: apareceu `discount_type: none`, valor que não fazia parte da taxonomia documentada na investigação original (que só tinha visto `mandatory`/`fs_optional`). Ainda não investigado — provavelmente "sem desconto aplicável" pro anúncio/categoria, mas não confirmado.
- Execução pausada aqui (fim de expediente) — restam 93 grupos da MAGAZINE + toda a SAMVALE, e o resumo final (total sucesso/erro/duração) ainda não foi reportado

## Pendências (retomar amanhã)

- Conferir se o comando terminou (MAGAZINE completo + SAMVALE) e revisar o resumo final (sucesso/erro/duração total)
- Confirmar se Matheus aplicou o Diff 2 (seção 8) e rodou `makemigrations`/`migrate`
- Investigar o `discount_type: none` observado nos dados reais (seção 11)
- **Etapa futura, ainda não iniciada** (adiada várias vezes nesta sessão, por decisão explícita): ligar `frete_real` (com fallback pra `frete_calculado`) na fórmula de precificação real (`calcular_grade_precificacao_ml.py` / `FormulaPrecificacao`), pra `frete_usado`/`origem_frete` passarem a ser populados de fato na grade
- Retomar a investigação da faixa <R$79 (nota relacionada) quando Matheus decidir voltar a ela

## Relacionado

- [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]]
- [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]]
- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
