---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 10/09/2026
atualizado_em: 11/09/2026 10:02
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido), Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90, Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve, Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado), Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia, Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design, Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML, Duvida - Margens Absurdas Aparecem Filtradas no Log de Recomendacao de Precificacao da Magazine]
---

# Checkpoint - Início da Validação Exaustiva de Precificação

**Resumo**: depois de preencher os 4 campos fiscais de saída (Camada 1 de [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]) e ver o preço de venda mudar de verdade nas 6 grades recalculadas, ficou claro que "o preço mudou" não é validação suficiente — o sistema de precificação inteiro (6 marketplaces) precisa ser auditado ponta a ponta: quais valores estão em cada campo, se batem com a importação, se a fórmula está coerente, se o resultado está coerente. Essa frente nasce dessa necessidade, dentro do contexto já existente de `Precificacao`.

> [!warning] EM ANDAMENTO — tela de auditoria do ML em produção; 3 bugs conhecidos corrigidos e testados; alcance do SEM CÁLCULO medido; teste automatizado da correção mais recente pendente de autorização
> Esta frente foi aberta em 10/09/2026, puxada pela validação da Camada 2 de Impostos de Saída. Trajeto até aqui: Duble robusto concluído e validado com dado real → causa raiz do FIXO negativo confirmada (custo zerado, não ICMS ST) → tela de auditoria desenhada (5 rounds de mockup) e implementada no código real do ML (mapa de execução em 4 camadas, aplicado e sincronizado com o GitHub) → 2 bugs de aplicação encontrados e corrigidos na sincronização (import quebrado por remoção de `BlocoPisCofins` compartilhado com os outros 5 marketplaces; função `view_grade_detalhe` truncada por um corte no meio do paste) → os 2 bugs conhecidos que motivaram toda a frente ([[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90|FIXO Negativo]] e [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve|SEM CÁLCULO nunca grava]]) corrigidos de verdade, testados em produção nos 2 bancos (0 erros de assert) → alcance real do SEM CÁLCULO medido pela primeira vez ([[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]). Segue em andamento: 87 produtos do MAGAZINE sem explicação identificada, replicar a tela de auditoria pros outros 5 marketplaces (Magalu primeiro, adiado de propósito). **11/09/2026**: achado e corrigido um 3º bug real nesta frente, sem relação com os 2 anteriores — [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML|fallback de dimensão efetiva fabricava peso/dimensão zero]] quando o Produto ERP não tinha embalagem cadastrada, usando sempre o frete mais barato do ML silenciosamente (3084 MAGAZINE + 4804 SAMVALE linhas afetadas, confirmadas e zeradas depois da correção). Teste automatizado da correção fica pendente — checkpoint de confirmação de cenários (regra do projeto) já feito em conversa, aguardando autorização do usuário pra gerar o arquivo.

## Linha do tempo

**Sessão de 10/09/2026, 10:52** (ver [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]) — Comando `preencher_impostos_saida` (Camada 1) rodado nas 2 empresas: 651 produtos atualizados na MAGAZINE, 389 na SAMVALE (9 sem correspondência).

**Sessão de 10/09/2026, ~11:10** — Usuário rodou `calcular_todas_as_grades_precificacao` nas 2 empresas, recalculando as 6 grades com os campos agora preenchidos. Preço do produto de referência (pulverizador, EAN 7908050719121) subiu de forma coerente (ex: R$ 408,90 → R$ 523,90 no Clássico Padrão do ML) — confirmando que os 4 campos estão sendo lidos e aplicados pela fórmula. Mas as grades RAIA e MAGALU vieram com 8 erros de assert, sempre nos mesmos 2 produtos (`CONJUNTO REP. MOTOR 1.0 CV 127V`, EAN 7909436926904, e `PARTE APARELHO MECANICO/KIT DA BARRA...`, EAN 7891988014072), nas 4 margens cada.

**Sessão de 10/09/2026, ~11:20** — Investigado o motivo dos 8 erros de assert — achado registrado em [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]. Ponto importante: essa investigação pontual não foi considerada suficiente — usuário pediu validação exaustiva de todo o sistema de precificação, não só desse caso.

**Sessão de 10/09/2026, ~11:25** — Usuário lembrou de um arquivo já existente que poderia ajudar nessa validação: o "Duble de Precificação". Localizado em `scripts_exploracao_ERP/duble_precificacao_ml.py` — script didático (passo a passo, só leitura, com valores reais de 1 produto) já construído em cima do mesmo EAN do pulverizador. Mas está quebrado: referencia `produto.pis_cofins`, campo removido do banco desde 16/08/2026. Achado completo em [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]].

**Sessão de 10/09/2026, 11:34** — Definido o plano: construir um Duble robusto, cobrindo os 6 marketplaces e todas as variações internas reais de cada um (mapeadas direto no código — ver "Em aberto"), reaproveitando as classes de fórmula de produção (nunca reimplementando a conta). 3 decisões confirmadas pelo usuário: (1) o novo Duble substitui o antigo; (2) as 5 fórmulas que ainda não têm `passos()`/auditoria didática pronta (Raia, Magalu, TikTok, Amazon, Shopee — hoje só o ML tem) serão padronizadas antes; (3) o teste roda com 3 produtos (o pulverizador + os 2 SKUs problemáticos do Raia/Magalu). Mapa de execução em 7 etapas definido e registrado abaixo — código será entregue por etapa, nunca tudo de uma vez, a pedido do usuário.

**Sessão de 10/09/2026, ~13:30–13:55** — Duble robusto (`scripts_exploracao_ERP/duble_precificacao.py`) concluído e entregue em 2 partes (estrutura + exportação real em Excel de 8 abas). Usuário rodou e reportou o Excel real (`duble_precificacao_20260910_134952.xlsx`) — as 7 etapas do plano acima ficaram concluídas. Análise do Excel confirmou a causa raiz do FIXO negativo com dado real (ver atualização de 13:55 em [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]) e descartou de vez a hipótese de diferimento de ICMS ST. Confirmado também, por leitura de código, que `custo_com_boni` é campo 100% manual (nunca sincronizado pelo ERP).

**Sessão de 10/09/2026, ~14:00–15:30** — A partir da validação do Excel, usuário pediu o desenho de uma nova tela de auditoria pro modal "como chegamos nesse preço" (hoje só mostra informação — a meta é virar auditoria de verdade, com prova de cada valor e proveniência marcada campo a campo). Mockup construído em 5 rounds de revisão (colapsável por padrão, tags de proveniência por categoria — Produto/NF Entrada/Saída/Config/Calculado —, mini-fórmulas inline pra cada valor calculado, sem ação de "editar no Admin"). Estrutura aprovada; início da aplicação no código real, começando pelo ML. Mapa de execução em 6 camadas definido; Camada 1 (correção de dado já persistido, sem recálculo) entregue em texto.

**Sessão de 10/09/2026, 15:42** — Mapeando a Camada 1 da tela de auditoria, 2 achados novos confirmados por leitura de código: [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]] (linha de cálculo que não resolve — SEM CÁLCULO — nunca é gravada nem limpa, sem diferenciação de "nunca calculado") e [[Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]] (4 campos mortos no modal atual, mesma causa raiz do Duble antigo quebrado — já corrigidos na Camada 1).

**Sessão de 10/09/2026, ~15:45–16:00** — Camadas 2, 3 e 4 do redesign da tela de auditoria (recálculo da fórmula com prova fiscal crua, template + JS completos, CSS com a paleta da casa) entregues em texto e aplicadas pelo usuário no repositório real, commitadas no GitHub.

**Sessão de 10/09/2026, ~16:00–16:20** — Usuário pediu sincronização com o GitHub e análise ponta a ponta do que foi aplicado (verificação estática, sem rodar o projeto). 2 problemas de aplicação encontrados e corrigidos: (1) `precificacao/views/grade_mercado_livre.py` — função `view_grade_detalhe` truncada no meio de um paste manual, deixando um parêntese aberto (`SyntaxError`, app inteira travada no import); (2) `precificacao/views/modal_comum.py` — remoção de `BlocoPisCofins`/`montar_pis_cofins()` durante a Camada 3 quebrou o import dos outros 5 marketplaces (Raia/Magalu/Shopee/TikTok/Amazon), que ainda dependem dessas funções (não migrados pro padrão novo, fora de escopo — "ML primeiro"). Os 2 corrigidos e confirmados via traceback real do usuário rodando `runserver`.

**Sessão de 10/09/2026, ~16:30–16:44** — Corrigidos os 2 bugs conhecidos que motivaram toda esta frente. [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90|FIXO Negativo]]: guarda matemática adicionada nas 3 funções de `goal_seek.py` — RoundUp90 agora devolve "sem solução" em vez de estourar `AssertionError` quando a garantia matemática não vale (mesma causa: crédito fiscal de entrada maior que o custo). [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve|SEM CÁLCULO nunca grava]]: campos `resolvida`/`motivo_nao_resolvida` adicionados ao `GradePrecificacaoML` (migration aplicada nos 2 bancos), `_registrar_linhas` reescrito pra sempre gravar. Testado em produção: `calcular_todas_as_grades_precificacao` rodado completo em MAGAZINE e SAMVALE, 6 marketplaces cada — **0 erros de assert** nas 12 execuções (contra os 8 originais). Efeito colateral: alcance real do SEM CÁLCULO medido pela primeira vez — 287 produtos no MAGAZINE e 158 no SAMVALE, maioria explicada por custo/dimensão zerados, 87 do MAGAZINE ainda sem explicação — detalhe completo em [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]].

**Sessão de 11/09/2026, ~09:19–10:02** — Lendo o código de `resolver_dimensoes_efetivas()` (a função que decide qual dimensão/peso usar no cálculo de frete/coleta/armazenagem, documentada como Camada 2 da tela de auditoria), achado um 3º bug real nesta frente, sem relação de causa com os 2 anteriores: no fallback do Produto ERP (quando a variação ML não declara as 4 dimensões), a função fazia `produto.altura_ordenada_cm or Decimal('0')` pros 3 eixos — quando o produto não tem embalagem cadastrada no ERP (dimensão = `None`), isso fabricava um objeto de dimensão TODO ZERO, válido pro cálculo. Como a tabela de frete do ML sempre tem faixa a partir de peso zero, o cálculo "resolvia" silenciosamente usando sempre a faixa mais barata (R$5,65–R$20,95) — sem aparecer em SEM CÁLCULO nem em erro de assert. Confirmado em produção antes da correção: 3084 linhas MAGAZINE / 4804 linhas SAMVALE (369/533 produtos) vindo desse fallback quebrado. Corrigido (commits `23df085`, `bcdbc52`, `269a7a0`, branch `dev`, já sincronizados com `origin/dev`): `resolver_dimensoes_efetivas()` agora devolve `None` quando faltam os 2 lados (variação E produto); `calcular_grade_precificacao_ml.py` trata esse `None` explicitamente, gravando `resolvida=False` com motivo claro, com um contador novo (`sem_dimensao`) separando essa causa de "meta inatingível" no log. Validado com dado real, antes/depois: as 3084/4804 linhas zeraram nos 2 bancos; o contador novo revelou 4672 MAGAZINE / 6424 SAMVALE produtos hoje sem cálculo possível por falta de dimensão/peso — visibilidade que não existia antes. Detalhe completo em [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]. Achado incidental, sem relação de causa, registrado como pergunta em aberto: margens absurdas aparecendo (já filtradas por trava existente) no log `[RECOMENDAÇÃO PRECIFICAÇÃO]` do MAGAZINE — ver [[Duvida - Margens Absurdas Aparecem Filtradas no Log de Recomendacao de Precificacao da Magazine]]. **Usuário decidiu não escrever o teste automatizado desta correção agora** — checkpoint de confirmação de cenários (regra do projeto) já feito em conversa (Nível 2, 8 cenários cobrindo `resolver_dimensoes_efetivas`, incluindo o caso do bug), aguardando autorização pra gerar o arquivo `mercado_livre/tests/test_nivel_2__dimensoes_efetivas.py`.

## Em aberto

Mapa das variações internas reais por marketplace, confirmado direto no código (`calcular_grade_precificacao_*.py` de cada um):

| Marketplace | Variação interna | Margens |
|---|---|---|
| Mercado Livre | `tipo_anuncio`: Clássico / Premium | mínima, padrão, máxima, competição |
| Magalu | nenhuma | mínima, padrão, máxima, competição |
| Raia | nenhuma | mínima, padrão, máxima, competição |
| TikTok | `tipo`: sem_afiliado / com_afiliado | mínima, padrão, máxima, competição |
| Amazon | `tipo`: dba / fba | mínima, padrão, máxima, competição |
| Shopee | nenhuma | mínima, padrão, máxima, competição |

**Plano de execução original do Duble, em 7 etapas — todas concluídas (ver linha do tempo):**

1. [x] Padronizar `passos()`/`formula_abstrata()`/`formula_preenchida()` na fórmula da Raia (`formula_precificacao_raia.py`), seguindo o padrão que já existe no ML.
2. [x] Padronizar o mesmo na fórmula do Magalu (`formula_precificacao_magalu.py`).
3. [x] Padronizar o mesmo na fórmula da Shopee (`formula_precificacao_shopee.py`).
4. [x] Padronizar o mesmo na fórmula do TikTok (`formula_precificacao_tiktok.py`).
5. [x] Padronizar o mesmo na fórmula da Amazon (`formula_precificacao_amazon.py`).
6. [x] Escrever o Duble robusto novo (`scripts_exploracao_ERP/duble_precificacao.py`, substituindo o antigo `duble_precificacao_ml.py`) — reaproveita as 6 classes já padronizadas, roda pros 3 produtos de teste (7908050719121, 7909436926904, 7891988014072) × 6 marketplaces × variações internas × 4 margens.
7. [x] Usuário roda o script, reporta o resultado — validação conjunta, com foco nos 2 SKUs problemáticos do Raia/Magalu.

**Pendências ainda reais desta frente:**

- Investigar os 87 produtos do MAGAZINE em SEM CÁLCULO sem explicação óbvia (nem custo nem dimensão zerados) — ver [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]].
- Investigar a causa raiz de por que 96 produtos (86 MAGAZINE + 10 SAMVALE) ficaram com custo zerado, e 344 (186 + 158) com dimensão zerada — falha pontual de cadastro vs. sintoma maior de sincronização do ERP.
- Ajustar o contador `sem_calculo` do log do `calcular_grade_precificacao_ml` (sub-relata quando há reaproveitamento de cache) — cosmético, baixa prioridade.
- Replicar a tela de auditoria (redesign completo) pros outros 5 marketplaces — hoje só o ML tem o novo formato; Magalu, Raia, Shopee, TikTok e Amazon continuam na tela antiga. Adiado de propósito ("ML primeiro"). Princípios de design e arquitetura de referência em [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]].
- Medir o alcance do SEM CÁLCULO nos outros 5 marketplaces (cada um com seu próprio model de Grade) — não coberto pelo levantamento feito até aqui, que cobriu só `GradePrecificacaoML`.
- Escrever o teste automatizado de `resolver_dimensoes_efetivas()` — 8 cenários já confirmados em conversa em 11/09/2026 (Nível 2, sem banco), pendente só de autorização pra gerar o arquivo.
- Investigar a causa das margens absurdas filtradas no log de recomendação de precificação do MAGAZINE (ex: MLB3974779415 em -1680008,20%) — ver [[Duvida - Margens Absurdas Aparecem Filtradas no Log de Recomendacao de Precificacao da Magazine]].

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]]
- [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]
- [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]]
- [[Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]]
- [[Descoberta - Alcance Real do SEM CALCULO na Grade ML Apos Correcao de Persistencia]]
- [[Bug Conhecido - Fallback do Produto ERP Sem Embalagem Fabricava Peso e Dimensao Zero, Gerando Sempre o Frete Mais Barato do ML]]
- [[Duvida - Margens Absurdas Aparecem Filtradas no Log de Recomendacao de Precificacao da Magazine]]
