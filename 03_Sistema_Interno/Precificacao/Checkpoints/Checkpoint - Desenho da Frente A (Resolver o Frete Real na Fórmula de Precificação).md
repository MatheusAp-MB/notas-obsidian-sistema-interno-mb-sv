---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 22/09/2026
atualizado_em: 22/09/2026 11:26
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
- **Opção 2 — API do ML em modo Simulação**: `GET /users/{user_id}/shipping_options/free` sem `item_id`, com `dimensions` (do ERP) + `item_price` (o preço sendo testado) + resto do contexto (`condition`/`category_id`/`listing_type_id`/`mode=me2`/`free_shipping`). Receita já validada em [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]] — **mas só confirmada pra `item_price ≥ R$79`** (ver risco na seção 5).

Decisão de Matheus: rodar as 2 em paralelo (não substituir uma pela outra ainda).

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

## 6. Decisões fechadas nesta conversa

- **Fonte de dimensão pra Grade Base (fallback)**: sempre Produto do ERP — já é o comportamento atual (seção 2), sem mudança, não afeta linhas por variação.
- **Produto sem nenhum MLB publicado (em nenhum tipo)**: não usa a Opção 2 (API) de jeito nenhum — sem anúncio publicado não existe de onde puxar `category_id`. Usa só a Opção 1 (tabela local), do jeito que já funciona hoje.
- **Produto com ao menos 1 MLB publicado (qualquer tipo)**: `category_id` pode vir de **qualquer um** dos MLBs publicados daquele produto — categoria não muda entre Clássico/Premium do mesmo produto. `listing_type_id` **não precisa vir de nenhum MLB** — já é conhecido de antemão pela própria linha sendo calculada (`gold_special` quando a linha é Clássico, `gold_pro` quando é Premium — mapeamento confirmado em `mercado_livre/models/tipo_de_anuncio.py`). `condition` é sempre `"new"`, fixo.
- **`free_shipping`**: `true` ou `false`, tanto faz — já validado na receita original, sem efeito numérico dentro do mesmo regime de desconto.
- Confirmado (achado técnico, não decisão): `Produto` (ERP) só tem um campo `categoria` de texto livre — não existe `category_id` no formato do ML (`MLB1234`) cadastrado no ERP. Reforça por que o `category_id` só pode vir de um MLB real, nunca do cadastro do ERP direto.

## Pendências / próximos passos

- **Como a Opção 2 se encaixa no loop do goal seek, tecnicamente** — ainda não desenhado (só o princípio: chamar a API por faixa candidata, em vez de/além de ler a tabela).
- **Pergunta operacional em aberto**: a simulação via API roda ao vivo, dentro do cálculo de cada linha de precificação (potencialmente muitas chamadas por produto × tipo × margem, toda vez que a grade é recalculada), ou em lote separado, parecido com o `buscar_frete_real_ml` de hoje (que roda como job isolado, não durante o cálculo)? Não decidido ainda.
- **Limitação abaixo de R$79 da Opção 2 continua bloqueando** — enquanto não for investigada e resolvida (pendência antiga, ver [[Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa)]]), qualquer faixa de preço candidata abaixo de R$79 só pode confiar na Opção 1.
- Matheus ainda vai continuar o raciocínio — este checkpoint reflete só o que foi validado até 22/09, 11:26. Nenhum diff ou código gerado ainda.

## Relacionado

- [[Checkpoint - Frete Real da API Implementado (Tela, Banco de Dados e Comando de Coleta em Massa)]]
- [[Descoberta - Endpoint de Frete Real do ML Confirmado em Anuncio Publicado, Simulacao Sem Item Nao Reproduz o Desconto Obrigatorio]]
- [[Regras de Determinacao do Frete no Mercado Livre (Pesquisa Externa GPT)]]
- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
