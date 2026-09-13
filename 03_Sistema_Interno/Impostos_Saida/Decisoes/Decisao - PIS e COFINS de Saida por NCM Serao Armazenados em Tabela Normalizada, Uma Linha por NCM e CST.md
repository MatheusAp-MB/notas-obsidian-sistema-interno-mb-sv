---
tipo: decisao
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 19:00
relacionado: [Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS, Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF, Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Checkpoint - Inicio da Estrutura de Impostos de Saida]
---

# Decisão: PIS e COFINS de Saída por NCM Serão Armazenados em Tabela Normalizada, 1 Linha por NCM + CST

**Resumo**: A partir da validação de que PIS e COFINS só batem 100% (0 divergência) quando agrupados por **NCM + CST** juntos (ver [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]]), decidido criar `PisCofinsNcmCst(ncm, cst, pis, cofins)` — mesmo padrão normalizado da `IcmsNcmUf` (ver [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]]), trocando a chave NCM por NCM+CST, já que aqui o CST faz parte do que determina o valor, não é só mais uma coluna do NCM.

> [!success] Confirmada e implementada — 12/09/2026
> Model, import tratado e management command implementados e testados nas 2 empresas reais (ver [[Descoberta - Tabela e Tela de PIS-COFINS por NCM+CST Implementadas e Validadas com Volume Real]]).

## Estrutura

`unique_together = ['ncm', 'cst']` — 1 linha por combinação. Diferente da `IcmsNcmUf` (onde `aliquota` nunca é `null`, porque uma UF sem valor simplesmente não gera linha), aqui `pis` e `cofins` **podem ser `null`**: um NCM+CST monofásico (ex: gasolina) tem PIS/COFINS genuinamente em branco na planilha, e não existe "outra UF" pra essa linha representar em vez disso — a chave já é só 1 linha por NCM+CST, então em branco precisa continuar sendo uma linha válida, não uma ausência.

## Regra do import tratado (mesmo espírito do ICMS)

Agrupa por NCM+CST e exige que todos os EANs do grupo concordem em PIS **e** em COFINS (checados separadamente — se só 1 dos 2 divergir, rejeita o grupo inteiro mesmo assim). Qualquer divergência (inclusive preenchido vs em branco) rejeita o grupo inteiro e informa, nunca grava um valor "no chute". Persistência nunca compara com o que já está gravado — o dado que passou na validação sempre sobrescreve — e nunca apaga NCM+CST que não veio na rodada (ver [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]], mesma regra, chave diferente).

## Diferença nova: relatório informativo, não-bloqueante

Além da validação (que rejeita e informa divergência de PIS/COFINS), o import também emite um relatório **separado e não-bloqueante**: NCMs que aparecem com mais de 1 CST. Isso nunca rejeita nada (PIS/COFINS já bateram por NCM+CST) — só avisa, porque o levantamento real mostrou que isso costuma ser sinal de CST cadastrado errado no produto, não variação tributária legítima (mesma correlação da Descoberta ligada acima). Dá uma pista concreta pra Camada 2 do plano de impostos de saída: agora dá pra comparar `Produto.pis_percentual`/`cofins_percentual` direto contra essa tabela nova pra achar onde a Camada 1 (`preencher_impostos_saida`, sem nenhuma checagem de divergência) já gravou errado.

## Relacionado

- [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]]
- [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]]
- [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
