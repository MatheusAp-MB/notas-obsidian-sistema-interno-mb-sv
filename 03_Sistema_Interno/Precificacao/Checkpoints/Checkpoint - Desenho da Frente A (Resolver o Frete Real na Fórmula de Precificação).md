---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 22/09/2026
atualizado_em: 22/09/2026 15:15
relacionado: [Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa), Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio, Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT), Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]
---

# Checkpoint - Desenho da Frente A (Resolver o Frete Real na Fórmula de Precificação)

**Resumo**: Depois de fechar a Frente B (dado real populado no Passo 7 da auditoria — ver [[Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa)]]), a conversa virou pra Frente A: como ligar o frete real de verdade na fórmula de precificação (`resolver_preco_por_margem`, em `goal_seek.py`), resolvendo o risco já registrado na Seção 13 daquele checkpoint (frete_real depende do preço, mas é capturado só 1x por MLB, no preço publicado). Matheus pediu foco exclusivo nisso e foi construindo o raciocínio em etapas, validadas uma a uma nesta conversa. Nada disso foi implementado ainda — é desenho, ainda não virou diff nem código.

## 1. Princípio central — precificação é simulação, não relatório

Formulação de Matheus, key da discussão inteira: **"O preço do sistema não é o mesmo preço do Mercado Livre"**. O objetivo do sistema é único — criar o preço de venda a partir de custo + margem-alvo. Por isso, a pergunta que a Frente A precisa responder pra um MLB nunca é "qual é o frete real dele HOJE" (isso seria pergunta de relatório/auditoria — já é o que a Frente B faz no Passo 7) — é **"qual frete DEVERIA ter pra essas condições"** (peso/dimensão + preço que está sendo calculado agora). São perguntas diferentes, com fontes diferentes: relatório lê o anúncio publicado (`item_id`); simulação testa uma condição hipotética (`dimensions` + `item_price`, sem `item_id`).

## 2. Por que a referência de dimensão é o Produto do ERP, não o anúncio publicado

Em teoria, todos os anúncios de um mesmo produto deveriam ter a mesma dimensão (vêm do mesmo produto físico) — na prática, divergem por: erro de digitação no cadastro do anúncio, o ML remedindo o pacote no depósito e sobrescrevendo a dimensão declarada, ou instabilidade/erro do ML no cálculo. Por isso a referência do que "deveria ser correto" é sempre o **Produto cadastrado no ERP**, usando as dimensões de envio de lá — não a dimensão que cada anúncio individual declara.

**Escopo confirmado com Matheus (print da tela real)**: isso vale só pra **Grade Base (fallback do produto)** — a linha de `GradePrecificacaoML` com `variacao=None`, que já usa `origem_dimensao=produto_erp` hoje. Não muda nada nas linhas por variação (`origem_dimensao=variacao_ml`), que continuam preferindo a dimensão declarada no anúncio específico, como já é hoje. Não é uma mudança de comportamento — é o caminho que já existe, só que agora é ele que vai alimentar a simulação de frete real também.

## 3. Duas opções, em paralelo

- **Opção 1 — Tabela local (`FreteML`)**: já existe, já é o que `goal_seek.py`/`resolver_preco_por_margem()` usa hoje (ver mecanismo completo abaixo). Funciona pra qualquer faixa de preço, sem depender de API.
- **Opção 2 — API do ML em modo Simulação**: `GET /users/{user_id}/shipping_options/free` sem `item_id`, com `dimensions` (do ERP) + `item_price` (o preço sendo testado) + resto do contexto (`condition`/`category_id`/`listing_type_id`/`mode=me2`/`free_shipping="false"`). Receita validada em [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]] — **confirmada 44/44 (100%) em toda a faixa de preço** desde 22/09, 14:17 (o risco da seção 5, que só valia pra `item_price < R$79`, está resolvido — ver nota no fim da seção 5). **E agora confirmada também de ponta a ponta, encaixada no motor real de goal seek, com produto real: 4/4 margens idênticas à Opção 1** — ver seção 7 (22/09, 15:15).

Decisão de Matheus: rodar as 2 em paralelo (não substituir uma pela outra ainda) — **decisão que precisa ser revisitada agora que a limitação abaixo de R$79 não existe mais, e agora que a Opção 2 está provada de ponta a ponta** (ver Pendências).

## 4. Como o goal seek resolve isso hoje (mecanismo existente, reaproveitado)

`resolver_preco_por_margem()` (`precificacao/funcoes_auxiliares/goal_seek.py`) resolve a circularidade preço↔frete por **busca finita exata**, não por aproximação numérica:

1. Filtra as faixas de frete candidatas pelo peso do produto (`filtrar_faixas_frete()`) — geralmente poucas faixas sobrevivem.
2. Testa cada faixa candidata, pulando as com teto de preço menor que o custo do produto.
3. Pra cada faixa: assume o frete daquela faixa, calcula `preço_exato = (frete + fixo − rebate) ÷ denominador`, arredonda pra cima até ",90" (RoundUp90 — garante margem final ≥ meta).
4. Checa se o preço arredondado caiu dentro da própria faixa de preço que originou aquele frete (autoconsistência). Se sim, resolveu. Se não, descarta e tenta a próxima.
5. Resolve em 2 a 4 tentativas na prática (máximo 8 faixas no ML).

**O ponto que a Frente A precisa resolver**: esse mecanismo assume uma **lista de faixas candidatas com frete já conhecido de antemão** (a tabela local tem isso pronto). O frete real da API não tem isso — 1 chamada devolve 1 valor pra 1 preço específico. A Opção 2 dessa discussão é justamente sobre encaixar chamadas de API dentro desse mesmo loop de busca (chamar a API pra cada faixa candidata testada, em vez de só ler `faixa.valor` da tabela).

## 5. Exemplo trabalhado — e o risco crítico que ele expôs

Produto real usado como exemplo: **F7899947307029.001** (Chinelo Nuvem Sandália Ortopédica Fly Feet, branco), Tipo Clássico, custo R$73,43, 5 MLBs publicados.

- Dimensões de envio do ERP: 13×28×39cm, peso declarado 0,601kg
- Peso cubado: (13×28×39)÷6.000 = 2,366kg → maior que o físico, então peso faturável = **2,366kg**
- Faixa de peso 2,000–3,000kg tem 8 faixas de preço/frete candidatas na tabela local (de R$6,35 até R$27,05)
- Custo do produto (R$73,43) cai na faixa **R$49,00–78,99** — ponto de partida do goal seek, igual sempre foi

**Risco identificado nesta conversa**: testar a Opção 2 (API simulação) com `item_price` nessa faixa (R$49–78,99, abaixo de R$79) cai **exatamente** na zona que [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]] já mostrou não funcionar: nas 5 combinações testadas abaixo de R$79, `discount.type` veio `"fs_optional"` em vez de `"mandatory"`, o `list_cost` não bateu com a tabela real, e 3 preços diferentes abaixo de R$79 devolveram o mesmo `list_cost`/`promoted_amount` exatos — um "piso" ainda não diagnosticado. Ou seja: **pra esse exemplo específico (e pra qualquer produto cujas faixas candidatas caiam abaixo de R$79), a Opção 2 hoje não é confiável** — só a Opção 1 (tabela local) pode ser usada com confiança nessa faixa, até a investigação pausada (abaixo de R$79) ser retomada e resolvida.

**Resolvido em 22/09, 14:17**: a causa era o parâmetro `free_shipping="true"` — trocando pra `"false"`, a receita bateu 44/44 em toda a tabela, incluindo exemplos como o Chinelo acima. Esse risco não existe mais — ver [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]], seção "Confirmação Final (22/09, 14:17)".

## 6. Decisões fechadas nesta conversa

- **Fonte de dimensão pra Grade Base (fallback)**: sempre Produto do ERP — já é o comportamento atual (seção 2), sem mudança, não afeta linhas por variação.
- **Produto sem nenhum MLB publicado (em nenhum tipo)**: não usa a Opção 2 (API) de jeito nenhum — sem anúncio publicado não existe de onde puxar `category_id`. Usa só a Opção 1 (tabela local), do jeito que já funciona hoje.
- **Produto com ao menos 1 MLB publicado (qualquer tipo)**: `category_id` pode vir de **qualquer um** dos MLBs publicados daquele produto — categoria não muda entre Clássico/Premium do mesmo produto. `listing_type_id` **não precisa vir de nenhum MLB** — já é conhecido de antemão pela própria linha sendo calculada (`gold_special` quando a linha é Clássico, `gold_pro` quando é Premium — mapeamento confirmado em `mercado_livre/models/tipo_de_anuncio.py`). `condition` é sempre `"new"`, fixo.
- **`free_shipping`**: `true` ou `false`, tanto faz — já validado na receita original, sem efeito numérico dentro do mesmo regime de desconto.
- Confirmado (achado técnico, não decisão): `Produto` (ERP) só tem um campo `categoria` de texto livre — não existe `category_id` no formato do ML (`MLB1234`) cadastrado no ERP. Reforça por que o `category_id` só pode vir de um MLB real, nunca do cadastro do ERP direto.

## 7. Confirmação Final (22/09, 15:15) — Teste de Ponta a Ponta com Produto Real: 4/4 Validado

Depois da seção 5 confirmar a receita da API em toda a faixa de preço, Matheus pediu um teste isolado (fora do sistema) pra ver se a Opção 2 realmente se encaixa no motor de goal seek real, não só na chamada de API isolada. Script criado: `scripts_exploracao_ML/testar_goal_seek_via_api.py` — não reimplementa nenhuma conta, instancia a mesma classe de produção (`FormulaPrecificacao`, a mesma que `calcular_grade_precificacao_ml` usa) e o mesmo motor genérico (`resolver_preco_por_margem`, `goal_seek.py`), trocando só a origem do `frete_todas` (banco local vs. chamadas reais à API) — produto, dimensão, fixo, taxa e margem idênticos nas 2 opções, isolando só essa variável.

**Desenho da Opção 2 dentro do loop**: por faixa de preço candidata, 1ª chamada de API com o PISO da faixa (estimativa) → resolve com `resolver_preco_por_margem` (o motor real) → 2ª chamada (confirmação) com o `preco_90` calculado → se bater com a estimativa, fechado; se não bater, corrige só aquela faixa com o valor confirmado e refaz a busca.

**Produto testado**: Chinelo Nuvem Sandália Ortopédica Fly Feet (F7899947307029.001), custo R$73,43, peso faturável 2,366kg (cubado), Clássico, conta MB. 4 margens (Mínima 10%, Padrão 15%, Máxima 20%, Competição 5%).

**Resultado final: 4/4 IGUAL** — preço, frete e margem % obtida idênticos entre Opção 1 e Opção 2 nas 4 margens (Mínima R$123,90/frete R$21,65; Padrão R$132,90/frete R$21,65; Máxima R$142,90/frete R$21,65; Competição R$113,90/frete R$19,15), todas resolvidas em 1 rodada — a API confirmou exatamente o valor estimado no piso da faixa, sem precisar de correção.

**Dois achados colaterais no caminho, ambos corrigidos**:

- **Achado de dado (produção)**: a reimportação da planilha de frete (`Tabela_Frete_Mercado_Livre.xlsx`) tinha duplicado faixas de peso na tabela `FreteML` — em vez de atualizar os valores existentes, criou linhas novas com o mesmo peso e valores divergentes (ex: faixa `2,000–3,000` E `2,001–3,000` convivendo, com frete diferente pra mesma faixa de preço). Isso já tinha corrompido resultados da Opção 1 antes da correção (ex: Mínima calculava R$119,90/frete R$18,35 — valor fantasma de uma duplicata — em vez do correto R$123,90/frete R$21,65). Corrigido apagando a tabela (`FreteML.objects.all().delete()`, 464 registros removidos) e reimportando via `popular_banco` pras 2 empresas — 240 registros limpos (30 faixas de peso × 8 faixas de preço, sem duplicata), conferido visualmente na tela "Tabela de Frete — Mercado Livre" do sistema.
- **Achado de bug no script de teste (não é bug de produção)**: `taxa_percentual` precisa ser convertida de porcentagem pra fração (÷100) antes de entrar em `resolver_preco_por_margem` — o motor espera fração (documentado no próprio `goal_seek.py`), mas o campo público `DadosIntermediarios.taxa_percentual` (usado pra reaproveitar os mesmos números da Opção 1) guarda a forma de exibição (ex: `12.00`), não a fração (`0.12`) — essa conversão já existe internamente em `FormulaPrecificacao.montar_taxa_e_denominador()`, só não tinha sido replicada no script de teste. Sem isso, o denominador da fórmula ficava negativo e `resolver_preco_por_margem` retornava `None` de cara, antes de sequer olhar qualquer faixa de frete — por isso as 4 margens falhavam igual, com o mesmo motivo genérico, não relacionado a API nem a dado.

**Conclusão**: a abordagem "goal seek via API" (Opção 2) está tecnicamente provada de ponta a ponta, com produto real, encaixada no motor de produção de verdade — não é só a chamada de API isolada que funciona, é o fluxo completo (estimativa → goal seek → confirmação) que reproduz exatamente o resultado da Opção 1. A decisão de arquitetura (rodar as 2 em paralelo vs. só Opção 2) segue em aberto — ver Pendências.

## Pendências / próximos passos

- **Como a Opção 2 se encaixa no loop do goal seek, tecnicamente — RESOLVIDA em 22/09, 15:15**: desenhada, implementada num script de teste isolado e validada 4/4 com produto real. Ver seção 7.
- **Pergunta operacional em aberto**: a simulação via API roda ao vivo, dentro do cálculo de cada linha de precificação (potencialmente muitas chamadas por produto × tipo × margem, toda vez que a grade é recalculada), ou em lote separado, parecido com o `buscar_frete_real_ml` de hoje (que roda como job isolado, não durante o cálculo)? Não decidido ainda.
- **Limitação abaixo de R$79 da Opção 2 — RESOLVIDA em 22/09, 14:17**: causa raiz era `free_shipping="true"` — corrigido pra `"false"`, revalidação completa (44/44, as 3 partes originais) confirmou 100%, sem exceção. Detalhe completo: [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]], seção "Confirmação Final (22/09, 14:17)". **Decisão aberta**: isso muda "Opção 1 + Opção 2 em paralelo" pra "só Opção 2 cobrindo a faixa inteira"? ou as 2 continuam em paralelo por outro motivo (ex: robustez, fallback se a API cair)?
- **Novo gap encontrado**: a revalidação completa também descobriu que produtos com `item_price < R$19` têm um teto de frete (máximo metade do preço do produto) que a tabela local `FreteML`/`goal_seek.py`/`calculo_margem.py` não implementa hoje. Decisão pendente: isso é risco real pro catálogo de MB/SV (produto pesado + preço muito baixo)? Se sim, a Opção 1 precisa desse ajuste pra não superestimar o frete nesses casos.
- Matheus ainda vai continuar o raciocínio — este checkpoint reflete só o que foi validado até 22/09, 14:17. Nenhum diff ou código gerado ainda.

## Relacionado

- [[Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa)]]
- [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]]
- [[Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT)]]
- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
