---
tipo: decisao
dominio: python
status: ativa
criado: 13/09/2026
atualizado_em: 13/09/2026 06:11
relacionado: [Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS, Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC), Estrutura da Planilha Busca Legal de Impostos de Saida, Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST, Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas]
---

# Decisão: Chave de Consolidação do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria — Não Mais Só NCM

**Resumo**: a regra atual de consolidação do ICMS por NCM (ver [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]) agrupa os EANs de um mesmo NCM e exige que todos tenham a mesma alíquota em cada UF — só isso. Uma consulta externa (Gemini, conversa completa exportada e analisada) confirmou, com dado real do nosso próprio banco, que essa regra está incompleta: dois produtos podem ter o mesmo NCM e legitimamente ter alíquotas diferentes, porque o **CST** (o regime de tributação do produto) e a **Origem da Mercadoria** (se é nacional ou importada) também decidem a alíquota, e a regra atual ignora os dois. Isso não é uma falha na planilha do Busca Legal — a planilha está correta, valor por valor, e continua sendo tratada como fonte da verdade (validada pelo escritório de contabilidade). O problema está inteiramente na nossa lógica de agrupamento. **Decisão**: a chave de consolidação passa de `NCM` para `NCM + CST + Origem da Mercadoria (do Cadastro do Produto)`. Isso ainda não foi implementado no código — é uma decisão de arquitetura, registrada aqui antes da execução, aguardando confirmação explícita de Matheus pra virar diff real (Ciclo de Trabalho Calmo).

> [!success] Ativa — 13/09/2026, 06:11
> Validada por consulta externa (Gemini) usando um caso real do nosso próprio banco (NCM `84248229`) como prova — não é teoria abstrata, é o mesmo padrão que já tinha aparecido numa descoberta do vault um dia antes (12/09/2026, ver [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]]), só que aquela descoberta na época não tinha sido conectada à conclusão certa. Implementação ainda pendente.

## Contexto

Depois de fechar a Camada A-D da Auditoria Fiscal (ver [[Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas]]) e Matheus terminar os testes manuais das telas, surgiu uma dúvida de fundo: será que a premissa usada até agora — "todos os EANs dentro de um mesmo UF com o mesmo NCM devem ter a mesma alíquota" — está certa do ponto de vista fiscal? Matheus não é da área contábil e pediu uma validação externa antes de continuar confiando nessa regra. A resposta, depois de uma conversa extensa com o Gemini (com um exemplo real do nosso banco, o NCM `84248229`), é que **não, a premissa está incompleta**.

## O que é CST e Origem da Mercadoria (pra quem não é da área fiscal)

**CST** (Código de Situação Tributária) é um código que diz **qual regime de tributação de ICMS aquele produto específico tem** — não é uma característica do NCM, é uma característica de cada produto dentro daquele NCM. Os valores mais comuns que já vimos no nosso próprio dado: `00` (tributação integral — paga o ICMS cheio da tabela do estado), `20` (tributação com redução de base de cálculo — um benefício fiscal reduz artificialmente o valor sobre o qual o imposto incide, baixando a carga efetiva), `40` (isenção — 0% de ICMS, geralmente por lei específica), `60` (ICMS já recolhido antes, por Substituição Tributária — o produto sai da nota sem destaque de ICMS porque o imposto de toda a cadeia já foi pago lá atrás, na indústria ou no distribuidor).

**Origem da Mercadoria** é outro código, independente do CST, que diz se o produto é `0` (nacional) ou `1`/`2` (importado, direto ou via mercado interno). Isso importa porque a Resolução do Senado nº 13/2012 fixa que **qualquer produto importado**, saindo de SP pra outro estado, tem alíquota interestadual de **4%** — enquanto o mesmo tipo de produto, se for nacional, sai a 12% (Sul/Sudeste) ou 7% (Norte/Nordeste/Centro-Oeste). É uma regra sobre o produto, não sobre o NCM.

**O ponto central**: dois produtos podem estar debaixo do mesmo código de NCM (porque o NCM classifica a *família* do produto — "aparelho de tal tipo", "bomba de tal vazão") e mesmo assim terem CST diferente (um tem benefício fiscal, outro não) ou Origem diferente (um é nacional, outro importado) — e nesses casos, é **esperado e correto** que a alíquota de ICMS seja diferente. Não é erro de cadastro.

## A descoberta, com o exemplo real que provou o problema

O caso usado pra validar isso foi o NCM `84248229` (aparelhos de agricultura/horticultura — no nosso catálogo, produtos Tramontina de irrigação e jardim), que hoje está **rejeitado** na tabela de ICMS por NCM, com 25 das 27 UFs marcadas como divergentes. Os dados reais da planilha Busca Legal (MAGAZINE):

| EAN | Descrição | CST | SP | AL | RJ |
|---|---|---|---|---|---|
| `7891117102687` | Conjunto Irrigação | `20` | 5,60% | 6,34% | 22,00% |
| `7891117006992` | Esguicho Engate Rápido | `20` | 5,60% | 6,34% | 22,00% |
| `7891117064961` | Hidropistola Engate | `20` | 5,60% | 6,34% | 22,00% |
| `7891117043560` | Hidropistola 10 Tipos | `20` | 5,60% | 6,34% | 22,00% |
| `7891117101307` | Hidropistola 6 Tipos | `20` | 5,60% | 6,34% | 22,00% |
| `7891117043546` | Esguicho Rosqueado | `00` | 18,00% | 21,50% | 22,00% |

Os 5 primeiros EANs têm **CST 20** (redução de base de cálculo pelo Convênio ICMS 52/91, Anexo II — máquinas e implementos agrícolas/hortícolas), resultando numa carga efetiva de 5,60% em quase todo o país. O 6º EAN (o esguicho de engate rosqueado) tem **CST 00** (tributação integral) porque é tratado fiscalmente como item doméstico comum, sem direito ao benefício agrícola — por isso paga a alíquota cheia do estado (18% em SP, 21,50% em AL). A regra atual (`NCM` sozinho) compara 5,60% contra 18% e rejeita o NCM inteiro. Agrupando por `NCM + CST`, os 5 EANs de CST `20` batem 100% entre si em todas as 27 UFs, e o EAN de CST `00` fica sozinho no seu próprio grupo (sem ninguém pra divergir) — **0 divergências reais**.

## Isso já estava no vault, um dia antes — só não tinha sido conectado à conclusão certa

Em 12/09/2026, investigando se PIS/COFINS/CST eram função pura do NCM (motivado por uma proposta externa diferente, do GPT), [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]] já tinha encontrado que, na MAGAZINE, o CST diverge em 4 de 70 NCMs com mais de 1 EAN — e são **exatamente os mesmos EANs** que já causavam a rejeição no ICMS. O NCM `84248229` já estava nessa lista. Na época, isso foi registrado como "pista de causa raiz" (provável CST cadastrado errado), mas a decisão final, em [[Descoberta - Camada 1 Reescrita para Fonte Unica (NCM+CST), Bug de Escopo do Loop Corrigido, Validacao Final Sem Divergencias]] e em [[Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC)]], foi classificar todos os NCMs rejeitados como "responsabilidade do Financeiro/Contabilidade — erro de cadastro a corrigir na origem". Pra pelo menos 4 desses NCMs, essa classificação estava errada: não é erro de cadastro nenhum, é a nossa própria regra de agrupamento que está incompleta.

Os 4 NCMs da MAGAZINE com esse sinal (CST diferente no mesmo EAN que diverge no ICMS), agora com o fundamento fiscal específico de cada um (confirmado pelo Gemini):

| NCM | Produto (nosso catálogo) | CST divergente | Fundamento legal da diferença |
|---|---|---|---|
| `84137080` | Bombas centrífugas de vazão ≤ 300 l/min | 1 EAN em CST `00` contra 5 em CST `20` | Convênio ICMS 52/91 (Anexo II) — bomba de uso agrícola/irrigação com redução de base vs. bomba de uso residencial/predial comum, tributada integralmente |
| `84243010` | Máquinas de limpeza por jato de água (lavadoras de alta pressão) | 3 EANs em CST `00` contra 22 em CST `20` | Mesmo Convênio 52/91 — lavadora industrial/agropecuária com redução de base vs. modelo residencial/hobby |
| `84248229` | Aparelhos de irrigação/horticultura (Tramontina) | 1 EAN em CST `00` contra 5 em CST `20` | Mesmo Convênio 52/91 — já confirmado com dado real (tabela acima) |
| `90211010` | Artigos e aparelhos ortopédicos | 1 EAN em CST `00` contra 16 em CST `40` | Convênio ICMS 126/2010 — muleta/órtese/prótese com isenção total (0%) vs. item esportivo (ex.: joelheira de compressão) sob o mesmo NCM, tributado integralmente |

> [!warning] Ressalva ainda não verificada
> O Gemini alertou que `84137080` e `84243010` (bombas e lavadoras de alta pressão) aparecem na tabela nacional de Substituição Tributária em vários estados (CEST citado como exemplo: `21.099.00`) — ou seja, pode existir algum EAN nesses 2 grupos com **CST `60`** (ICMS-ST) que ainda não apareceu na amostra que analisamos. Antes de considerar esses 2 NCMs 100% fechados, vale conferir a planilha real em busca de alguma linha com CST `60` neles.

> [!warning] Os 2 NCMs da SAMVALE ainda não foram testados pra esse sinal
> A investigação de CST-diverge-com-ICMS de 12/09/2026 só rodou contra a MAGAZINE. Os 2 NCMs rejeitados na SAMVALE (`95066200`, UF MG; `90192020`, UF DF — ver [[Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC)]]) ainda não foram conferidos pra saber se também têm CST divergente entre os EANs discrepantes. Precisa rodar a mesma checagem lá antes de assumir que são o mesmo padrão.

## O que continua sendo erro real de cadastro (não muda com essa decisão)

Nem todo NCM rejeitado tem esse sinal. Dois NCMs da MAGAZINE — `84244100` e `84249010` — **não mostraram CST divergente** na investigação de 12/09/2026, o que indica que continuam sendo divergência genuína de cadastro, sem explicação fiscal legítima conhecida até agora. Isso inclui, especificamente, o NCM `84244100` — que é exatamente o caso do produto `F7908050719121.001` que disparou toda a construção da Auditoria Fiscal (Camadas A-D, ver [[Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas]]). Ou seja: mesmo depois dessa correção de chave, esse caso específico continua precisando de revisão do Financeiro/Contabilidade — a nova chave não resolve tudo, só remove os falsos positivos.

## A chave de validação definitiva

```
NCM + CST (2 dígitos, como vem na planilha Busca Legal) + Origem da Mercadoria (do Cadastro do Produto)
```

**Por que "do Cadastro" e não "do XML de entrada"**: nosso sistema já grava a Origem da Mercadoria em 2 lugares diferentes, no model `ImpostosECustosXMLEntradaProduto` (`impostos/models.py`): `origem_mercadoria_xml` (o que veio na nota fiscal de compra) e `origem_mercadoria_cadastro` (o que está cadastrado no produto). Pra validar a alíquota de **saída** (venda), o campo correto é o do cadastro — é ele que o motor fiscal usa de fato pra emitir a nota de venda, não o dado histórico de quando o produto foi comprado.

**Por que Origem precisa entrar como campo separado, e não só o CST resolve**: o CST da nossa planilha tem só 2 dígitos (`00`, `20`, `40`...) — é só a Tabela B (tributação), sem o dígito de Origem da Tabela A embutido. Como a empresa trabalha com produtos nacionais e importados, dois produtos podem ter o mesmo NCM e o mesmo CST de 2 dígitos e ainda assim ter Origem diferente — e nesse caso, numa venda interestadual, um sairia a 12% (nacional) e outro a 4% (importado), o que a chave `NCM + CST` sozinha não detectaria como "grupos diferentes".

## Uma regra nova e independente: auditoria preventiva de Origem XML vs. Origem Cadastro

Além da chave de validação da alíquota de saída, o Gemini recomendou uma checagem separada, de natureza puramente cadastral: comparar `origem_mercadoria_xml` (o que veio na nota de compra) contra `origem_mercadoria_cadastro` (o que está cadastrado) pro mesmo produto. Se as duas caírem em famílias diferentes — nacional (`0`, `3`, `4`, `5`) de um lado, importado (`1`, `2`, `6`, `7`, `8`) do outro — isso já é, por si só, um alerta de erro de cadastro, **antes mesmo** de olhar pra alíquota de ICMS. Essa é uma auditoria à parte, não faz parte da Camada A do ICMS — ainda não tem desenho de onde ela mora no sistema.

## O que muda no código (nada disso foi implementado ainda)

- `AgrupadorIcmsPorNcm` / `_validar_ncm` (`impostos/funcoes_auxiliares/importacao_icms_ncm.py`) — a chave de agrupamento precisa expandir de `NCM` sozinho para `(NCM, CST, Origem)`.
- Os models `IcmsNcmUf` e `IcmsNcmRejeitado` (`impostos/models.py`) — hoje gravam 1 linha por NCM+UF; precisam incorporar CST e Origem como parte da identidade do registro.
- A nova auditoria de Origem XML vs. Cadastro ainda não tem desenho — precisa decidir se vira uma Camada nova ou se entra em alguma tela já existente.
- Essa decisão **substitui parcialmente** [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]] — especificamente a parte da chave de agrupamento (só `NCM`). O resto daquela decisão continua valendo sem mudança: nunca comparar com o que já está gravado, sempre sobrescrever o que passou na validação da rodada atual, nunca apagar o que não veio na rodada.

## Reafirmando: a planilha do Busca Legal nunca foi questionada

Em nenhum momento dessa investigação — nem na conversa com o Gemini, nem nessa decisão — o valor de qualquer linha da planilha Busca Legal foi tratado como suspeito. A planilha já foi validada pelo escritório de contabilidade e continua sendo a fonte da verdade, linha por linha. O problema, do início ao fim, sempre esteve em como o nosso sistema agrupa e compara essas linhas entre si pra decidir "isso é uma divergência" — não nos valores em si.

## O que ainda falta

- Confirmação explícita de Matheus antes de qualquer diff real no código (Ciclo de Trabalho Calmo — isso aqui é só a etapa de Idealizar/Planejar).
- Conferir na planilha real se `84137080`/`84243010` têm alguma linha com CST `60` (ICMS-ST) que ainda não apareceu na amostra analisada.
- Rodar a mesma checagem de "CST diverge no mesmo EAN que diverge no ICMS" contra os 2 NCMs rejeitados da SAMVALE (`95066200`, `90192020`), que ainda não foram testados.
- Decidir onde a nova auditoria de Origem XML vs. Cadastro vai morar no sistema (Camada nova, ou parte de alguma tela já existente).
- Depois de implementado: `84244100`, `84249010` (MAGAZINE) e, até prova em contrário, `95066200`/`90192020` (SAMVALE) continuam como responsabilidade do Financeiro/Contabilidade — não são resolvidos por essa mudança de chave.

## Relacionado

- [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]
- [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]]
- [[Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC)]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST]]
- [[Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas]]
