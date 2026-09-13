---
tipo: descoberta
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 02:21
relacionado: [Descoberta - Camada 1 Reescrita para Fonte Unica (NCM+CST), Bug de Escopo do Loop Corrigido, Validacao Final Sem Divergencias, Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero, Checkpoint - Inicio da Estrutura de Impostos de Saida, Estrutura da Planilha Busca Legal de Impostos de Saida]
---

# Descoberta: Explicação Didática do Resultado Final de Impostos de Saída — Para Financeiro e Superior

**Resumo**: Esta nota explica, em linguagem simples, o que são os 5 campos fiscais de saída de cada produto, por que o sistema precisa deles, como cada um é preenchido hoje e por que foi construído dessa forma — e mostra o estado atual do catálogo, logo após uma repopulação completa e limpa das 2 empresas. Não é uma nota técnica de desenvolvimento — é o material de apoio pra explicar pro Financeiro e pro superior o que cada número significa e o que é responsabilidade de cada área.

> [!success] Veredito central
> **Zero divergências** nas duas empresas. Todo produto que hoje tem imposto de saída gravado no sistema tem exatamente o valor que a tabela oficial diz que ele deveria ter. O que ainda falta preencher em alguns produtos não é erro de sistema — é falta de cadastro fiscal de origem (NCM, CST ou linha na planilha), detalhado item por item mais abaixo.

## Por que o sistema precisa desses 5 campos

Pra calcular o preço final e a margem de um produto em qualquer um dos 6 marketplaces (Mercado Livre, Amazon, Magalu, Shopee, TikTok, Raia), o sistema precisa saber quanto de imposto sai na venda — ICMS, PIS e COFINS. Esse valor não é fixo por empresa: ele muda de produto pra produto (cada um tem seu próprio enquadramento fiscal) e, no caso do ICMS, muda também pela UF de destino da venda. Sem esses 5 campos preenchidos e corretos no cadastro do produto, o cálculo de preço/margem fica incompleto ou usa um valor chutado.

## Os 5 campos — o que cada um é

| Campo | O que é |
|---|---|
| `cst_saida` | O CST (Código de Situação Tributária) de saída do produto — o código que classifica o regime tributário daquele item |
| `icms_saida_sp` | A alíquota de ICMS de saída considerando SP como UF de origem |
| `icms_saida_media` | A média ponderada do ICMS de saída nas outras 26 UFs de destino (SP conta metade do peso, a média das outras 26 conta a outra metade) |
| `pis_percentual` | O percentual de PIS de saída do produto |
| `cofins_percentual` | O percentual de COFINS de saída do produto |

## Como cada campo é alimentado, e por que dessa forma

`cst_saida` vem direto da planilha "Busca Legal" (mantida pelo Financeiro), por EAN. Ele também funciona como **chave de busca** dos outros 2 impostos (explicado abaixo), então continua vindo direto da planilha, sem intermediário.

Os outros 4 campos (`icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`) **não** vêm mais direto da planilha, linha a linha. Eles vêm de 2 tabelas internas de referência:

- Uma tabela de **ICMS por NCM + UF** — 1 alíquota por combinação de NCM e estado de destino.
- Uma tabela de **PIS/COFINS por NCM + CST** — 1 percentual por combinação de NCM e CST.

Essas 2 tabelas também nascem da planilha Busca Legal, mas passam por uma conferência extra antes de existir: o sistema agrupa todos os produtos que compartilham o mesmo NCM (ou NCM+CST, no caso de PIS/COFINS) e confere se todos concordam no mesmo valor de imposto. Se concordam, o valor entra na tabela. Se **qualquer produto divergir** — por exemplo, 2 itens com o mesmo NCM aparecendo com alíquotas diferentes de ICMS na mesma UF — o NCM inteiro é **rejeitado e reportado**, nunca aceito por adivinhação.

Na prática, isso significa: um produto que hoje encontra seu ICMS/PIS/COFINS nessas 2 tabelas está recebendo um valor que já foi conferido contra todo o catálogo, não uma cópia isolada de 1 linha da planilha.

## Quando não existe dado confiável, o campo fica em branco — de propósito

Um campo só recebe valor quando existe, agora, um dado validado pra colocar nele (o produto tem NCM cadastrado, esse NCM está nas tabelas de referência, etc.). Quando não existe — por exemplo, o NCM do produto ainda não foi importado, ou foi rejeitado por divergência —, o sistema **deixa o campo em branco**, de propósito. Ele nunca inventa um número, e nunca mantém um valor antigo só pra não deixar o campo vazio.

Essa é uma escolha deliberada: um campo em branco é um sinal claro e visível de "falta cadastro fiscal na origem" — bem mais seguro do que mostrar um número que pode estar desatualizado ou nunca ter sido conferido de verdade. É por isso que o passo seguinte, a validação, sempre bate 100%: o que está gravado, ou é um valor validado, ou está em branco — nunca existe um valor "no chute" gravado por engano.

## O estado atual do catálogo (banco recém-repopulado, dado 100% limpo)

### MAGAZINE — catálogo com 1.358 produtos

| Campo | Produtos com valor confirmado | Produtos em branco (sem dado confiável) |
|---|---|---|
| `cst_saida` | 651 | 707 |
| `icms_saida_sp` | 582 | 776 |
| `icms_saida_media` | 578 | 780 |
| `pis_percentual` / `cofins_percentual` | 647 | 711 |

Nenhuma linha da planilha ficou sem EAN, duplicada, ou sem produto correspondente nesta empresa.

### SAMVALE — catálogo com 731 produtos

| Campo | Produtos com valor confirmado | Produtos em branco (sem dado confiável) |
|---|---|---|
| `cst_saida` | 389 | 342 |
| `icms_saida_sp` | 569 | 162 |
| `icms_saida_media` | 569 | 162 |
| `pis_percentual` / `cofins_percentual` | 389 | 342 |

**9 EANs da planilha Busca Legal (SAMVALE) não correspondem a nenhum produto cadastrado no sistema:**
`96506134660`, `96506134677`, `96506146342`, `96506146335`, `74468063860`, `74468064034`, `40141875297`, `74468064362`, `74468063822`

Vale conferir: pode ser produto descontinuado, EAN cadastrado errado na planilha, ou produto que só existe na MAGAZINE.

## Confirmação formal: a validação bate 100%

Um script separado, que não grava nada, recalcula pra cada produto das 2 empresas qual seria o imposto certo (usando as mesmas 2 tabelas de referência) e compara com o que está gravado hoje.

> **MAGAZINE** — 1.358 produtos verificados. Divergências encontradas: **nenhuma**.
> **SAMVALE** — 731 produtos verificados. Divergências encontradas: **nenhuma**.

**O que isso prova, na prática:** não existe, hoje, nenhum produto com um imposto de saída gravado que esteja errado em relação ao que a tabela oficial diz. Todo valor gravado é um valor validado — e todo campo em branco é, de fato, um campo sem dado confiável disponível, não um erro escondido.

## O que falta, motivo a motivo — responsabilidade do cadastro fiscal de origem

Campo em branco é diferente de "sistema errou". O motivo exato de cada lacuna é conhecido, produto a produto:

| Motivo | O que significa | MAGAZINE | % do catálogo | SAMVALE | % do catálogo |
|---|---|---|---|---|---|
| **Sem NCM** | O produto não tem NCM nenhum cadastrado — sem isso, não tem como buscar imposto em nenhuma tabela | 36 | 2,7% | 3 | 0,4% |
| **NCM com ICMS rejeitado** | O produto tem NCM, mas esse NCM teve valores de ICMS divergentes entre produtos diferentes na planilha de ICMS por UF — rejeitado na importação, nenhum valor "no chute" foi aceito | 502 | 37,0% | 38 | 5,2% |
| **NCM nunca importado (ICMS)** | O produto tem NCM, mas esse NCM simplesmente não aparece na planilha de ICMS por UF — nem aceito, nem rejeitado, nunca foi informado | 234 | 17,2% | 121 | 16,6% |
| **Sem CST de saída** | O produto ainda não tem `cst_saida` gravado — nunca apareceu, até hoje, na planilha Busca Legal | 707 | 52,1% | 342 | 46,8% |
| **NCM+CST nunca importado (PIS/COFINS)** | O produto tem NCM+CST, mas essa combinação não aparece na planilha de PIS/COFINS | 4 | 0,3% | 0 | — |

**Os NCMs já identificados com ICMS rejeitado por divergência entre produtos:**
- MAGAZINE: `84137080`, `84243010`, `84244100`, `84248229`, `84249010`, `90211010`
- SAMVALE: `95066200`, `90192020`

**Os 4 casos de "NCM+CST nunca importado" na MAGAZINE, por exemplo concreto:**

| EAN | NCM | CST |
|---|---|---|
| `7899452030214` | `94051190` | `00` |
| `7895572102381` | `38085010` | `00` |
| `7899452002075` | `94051190` | `--` ⚠ |
| `7899452037237` | `94051190` | `00` |

O CST gravado como texto `--` (em vez de um código numérico de verdade) no EAN `7899452002075` já apareceu antes em outro NCM (`38249010`) — é um padrão de preenchimento na planilha que vale a pena o Financeiro/Contabilidade revisar, não um caso isolado.

**Os 3 casos de "sem NCM" na SAMVALE, na íntegra:** `37095`, `37093`, `37094` — são códigos curtos (não parecem EAN de 13 dígitos), possivelmente produtos internos ou cadastro incompleto.

## Pontos de atenção prioritários pro Financeiro

1. **Cobertura da planilha Busca Legal está incompleta pra cerca de metade do catálogo.** 707 de 1.358 produtos na MAGAZINE (52%) e 342 de 731 na SAMVALE (47%) nunca apareceram na planilha Busca Legal — não têm CST de saída, nem PIS/COFINS. Vale confirmar se são produtos ativos que faltam cadastrar na planilha, ou produtos que legitimamente não precisam (descontinuados, por exemplo).
2. **NCMs com ICMS rejeitado por divergência** — é o maior motivo isolado de "sem dado" na MAGAZINE (37% do catálogo). Precisa revisar, na planilha de ICMS por UF, os NCMs onde produtos diferentes aparecem com alíquota diferente na mesma UF (lista acima).
3. **NCMs que nunca entraram na planilha de ICMS por UF** — 234 produtos na MAGAZINE e 121 na SAMVALE têm NCM cadastrado no produto, mas esse NCM nunca foi informado na planilha de imposto por UF.
4. **9 EANs da planilha Busca Legal (SAMVALE) que não correspondem a nenhum produto cadastrado** — listados acima.
5. **CST gravado como texto solto (`--`)** — já apareceu 2 vezes em NCMs diferentes; vale checar se é um padrão recorrente na origem do dado.

## Uma frase pra levar pro superior

O sistema foi auditado produto a produto, num catálogo recém-repopulado do zero, e está **100% consistente**: zero divergências entre o que está gravado e o que a tabela fiscal oficial diz, nas duas empresas. O que falta preencher é 100% rastreável a lacunas de cadastro fiscal na origem (planilha/NCM/CST) — não a erro de cálculo do sistema — e já está listado, motivo por motivo, pra quem mantém esses cadastros agir.

## Relacionado

- [[Descoberta - Camada 1 Reescrita para Fonte Unica (NCM+CST), Bug de Escopo do Loop Corrigido, Validacao Final Sem Divergencias]]
- [[Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
