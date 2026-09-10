---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 10/09/2026
atualizado_em: 10/09/2026 15:42
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido), Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90, Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve, Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]
---

# Checkpoint - Início da Validação Exaustiva de Precificação

**Resumo**: depois de preencher os 4 campos fiscais de saída (Camada 1 de [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]) e ver o preço de venda mudar de verdade nas 6 grades recalculadas, ficou claro que "o preço mudou" não é validação suficiente — o sistema de precificação inteiro (6 marketplaces) precisa ser auditado ponta a ponta: quais valores estão em cada campo, se batem com a importação, se a fórmula está coerente, se o resultado está coerente. Essa frente nasce dessa necessidade, dentro do contexto já existente de `Precificacao`.

> [!warning] EM ANDAMENTO — Duble concluído e validado; causa raiz do FIXO negativo confirmada com dado real; tela de auditoria em desenho
> Esta frente foi aberta em 10/09/2026, puxada pela validação da Camada 2 de Impostos de Saída. As 7 etapas do plano original (Duble robusto novo) foram concluídas e o script foi rodado — o Excel real gerado permitiu confirmar a causa raiz do [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90|bug do FIXO negativo]] (não é ICMS ST, é custo zerado) e descartar a hipótese anterior. A validação do Excel real também puxou 2 achados novos — [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]] e [[Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]] — e abriu uma frente nova, ainda não registrada em Checkpoint próprio: o redesenho da tela de auditoria de precificação (mockup em 5 rounds já aprovado na estrutura, implementação no código real começando pelo ML, mapa de execução em 6 camadas).

## Linha do tempo

**Sessão de 10/09/2026, 10:52** (ver [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]) — Comando `preencher_impostos_saida` (Camada 1) rodado nas 2 empresas: 651 produtos atualizados na MAGAZINE, 389 na SAMVALE (9 sem correspondência).

**Sessão de 10/09/2026, ~11:10** — Usuário rodou `calcular_todas_as_grades_precificacao` nas 2 empresas, recalculando as 6 grades com os campos agora preenchidos. Preço do produto de referência (pulverizador, EAN 7908050719121) subiu de forma coerente (ex: R$ 408,90 → R$ 523,90 no Clássico Padrão do ML) — confirmando que os 4 campos estão sendo lidos e aplicados pela fórmula. Mas as grades RAIA e MAGALU vieram com 8 erros de assert, sempre nos mesmos 2 produtos (`CONJUNTO REP. MOTOR 1.0 CV 127V`, EAN 7909436926904, e `PARTE APARELHO MECANICO/KIT DA BARRA...`, EAN 7891988014072), nas 4 margens cada.

**Sessão de 10/09/2026, ~11:20** — Investigado o motivo dos 8 erros de assert — achado registrado em [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]. Ponto importante: essa investigação pontual não foi considerada suficiente — usuário pediu validação exaustiva de todo o sistema de precificação, não só desse caso.

**Sessão de 10/09/2026, ~11:25** — Usuário lembrou de um arquivo já existente que poderia ajudar nessa validação: o "Duble de Precificação". Localizado em `scripts_exploracao_ERP/duble_precificacao_ml.py` — script didático (passo a passo, só leitura, com valores reais de 1 produto) já construído em cima do mesmo EAN do pulverizador. Mas está quebrado: referencia `produto.pis_cofins`, campo removido do banco desde 16/08/2026. Achado completo em [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]].

**Sessão de 10/09/2026, 11:34** — Definido o plano: construir um Duble robusto, cobrindo os 6 marketplaces e todas as variações internas reais de cada um (mapeadas direto no código — ver "Em aberto"), reaproveitando as classes de fórmula de produção (nunca reimplementando a conta). 3 decisões confirmadas pelo usuário: (1) o novo Duble substitui o antigo; (2) as 5 fórmulas que ainda não têm `passos()`/auditoria didática pronta (Raia, Magalu, TikTok, Amazon, Shopee — hoje só o ML tem) serão padronizadas antes; (3) o teste roda com 3 produtos (o pulverizador + os 2 SKUs problemáticos do Raia/Magalu). Mapa de execução em 7 etapas definido e registrado abaixo — código será entregue por etapa, nunca tudo de uma vez, a pedido do usuário.

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

**Plano de execução, em 7 etapas — código sempre entregue em texto, por etapa, nunca tudo de uma vez:**

1. [x] Padronizar `passos()`/`formula_abstrata()`/`formula_preenchida()` na fórmula da Raia (`formula_precificacao_raia.py`), seguindo o padrão que já existe no ML.
2. [x] Padronizar o mesmo na fórmula do Magalu (`formula_precificacao_magalu.py`).
3. [x] Padronizar o mesmo na fórmula da Shopee (`formula_precificacao_shopee.py`).
4. [x] Padronizar o mesmo na fórmula do TikTok (`formula_precificacao_tiktok.py`).
5. [x] Padronizar o mesmo na fórmula da Amazon (`formula_precificacao_amazon.py`).
6. [x] Escrever o Duble robusto novo (proposto: `scripts_exploracao_ERP/duble_precificacao.py`, substituindo o antigo `duble_precificacao_ml.py`) — reaproveita as 6 classes já padronizadas, roda pros 3 produtos de teste (7908050719121, 7909436926904, 7891988014072) × 6 marketplaces × variações internas × 4 margens.
7. [x] Usuário roda o script, reporta o resultado — validação conjunta, com foco nos 2 SKUs problemáticos do Raia/Magalu.

**Sessão de 10/09/2026, ~13:30–13:55** — Duble robusto (`scripts_exploracao_ERP/duble_precificacao.py`) concluído e entregue em 2 partes (estrutura + exportação real em Excel de 8 abas). Usuário rodou e reportou o Excel real (`duble_precificacao_20260910_134952.xlsx`) — as 7 etapas do plano acima ficaram concluídas. Análise do Excel confirmou a causa raiz do FIXO negativo com dado real (ver atualização de 13:55 em [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]) e descartou de vez a hipótese de diferimento de ICMS ST. Confirmado também, por leitura de código, que `custo_com_boni` é campo 100% manual (nunca sincronizado pelo ERP).

**Sessão de 10/09/2026, ~14:00–15:30** — A partir da validação do Excel, usuário pediu o desenho de uma nova tela de auditoria pro modal "como chegamos nesse preço" (hoje só mostra informação — a meta é virar auditoria de verdade, com prova de cada valor e proveniência marcada campo a campo). Mockup construído em 5 rounds de revisão (colapsável por padrão, tags de proveniência por categoria — Produto/NF Entrada/Saída/Config/Calculado —, mini-fórmulas inline pra cada valor calculado, sem ação de "editar no Admin"). Estrutura aprovada; início da aplicação no código real, começando pelo ML. Mapa de execução em 6 camadas definido; Camada 1 (correção de dado já persistido, sem recálculo) entregue em texto.

**Sessão de 10/09/2026, 15:42** — Mapeando a Camada 1 da tela de auditoria, 2 achados novos confirmados por leitura de código: [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]] (linha de cálculo que não resolve — SEM CÁLCULO — nunca é gravada nem limpa, sem diferenciação de "nunca calculado") e [[Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]] (4 campos mortos no modal atual, mesma causa raiz do Duble antigo quebrado — já corrigidos na Camada 1).

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]]
- [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]
- [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]]
- [[Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]]
