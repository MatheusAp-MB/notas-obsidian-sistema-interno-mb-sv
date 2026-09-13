---
tipo: duvida
dominio: 
status: aberta
criado: 13/09/2026
atualizado_em: 13/09/2026 17:07
relacionado: [Descoberta - Estrutura da Tela de Console de ICMS por NCM e Preencher Impostos de Saida, Checkpoint - Inicio da Estrutura de Impostos de Saida]
---

# Tabelas de Grupo Rejeitado do PIS/COFINS por NCM+CST — Ainda Sem Validação com Dado Real

**Resumo**: o redesenho visual (Rich + pandas) de `importar_pis_cofins_por_ncm_cst` (ver [[Descoberta - Estrutura da Tela de Console de ICMS por NCM e Preencher Impostos de Saida]]) inclui 2 tabelas novas pro caminho de grupos rejeitados — "Visão geral" e "Detalhe por campo". Numa rodada real completa (13/09/2026, 16:52-16:53, MAGAZINE e SAMVALE, pipeline do zero via `truncar_icms_ncm.py`), **0 grupos PIS/COFINS foram rejeitados nas 2 empresas** — então essas 2 tabelas nunca chegaram a renderizar de verdade nesse teste. Só o caminho de grupos aceitos e o aviso informativo de múltiplos CST foram exercitados por dado real.

## O que está em aberto

Não há motivo concreto pra suspeitar de bug nessas 2 tabelas — o código é estruturalmente idêntico ao equivalente já validado no ICMS (mesma função `_dataframe_para_tabela_rich`, mesmo padrão de `DataFrame`→`Table`), só trocando "UF" por "Campo" e adaptando as colunas. Mesmo assim, nenhum dos 3 bugs de renderização já corrigidos (ver seção "Bugs de renderização" na Descoberta ligada acima) foi encontrado em teste isolado — todos só apareceram em print colado de rodada real. Por isso esta dúvida fica aberta em vez de fechada por analogia.

## Decisão explícita de Matheus (13/09/2026, 17:07)

Deixar em aberto — sem forçar uma falsa verdade (marcar como validado sem prova real) e sem forçar um dado de teste falso só pra exercitar o caminho artificialmente. Só fecha quando uma rodada real, no fluxo normal de trabalho, tiver ao menos 1 grupo PIS/COFINS realmente rejeitado.

## Como resolver

Na próxima vez que `importar_pis_cofins_por_ncm_cst` rodar numa rodada real (MAGAZINE ou SAMVALE) e produzir ao menos 1 grupo rejeitado, conferir o print colado contra a estrutura documentada em [[Descoberta - Estrutura da Tela de Console de ICMS por NCM e Preencher Impostos de Saida]] — se bater sem bug de renderização, esta dúvida fecha (`status: resolvida`, com data e referência ao print que confirmou).

## Relacionado

- [[Descoberta - Estrutura da Tela de Console de ICMS por NCM e Preencher Impostos de Saida]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
