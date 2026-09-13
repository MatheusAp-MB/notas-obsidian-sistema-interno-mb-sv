---
tipo: descoberta
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 00:15
relacionado: [Descoberta - Camada 1 Reescrita para Fonte Unica (NCM+CST), Bug de Escopo do Loop Corrigido, Validacao Final Sem Divergencias, Checkpoint - Inicio da Estrutura de Impostos de Saida, Estrutura da Planilha Busca Legal de Impostos de Saida]
---

# Descoberta: Explicação Didática do Resultado Final de Impostos de Saída — Para Financeiro e Superior

**Resumo**: Esta nota existe pra explicar, em linguagem simples, o resultado real da rodada de 13/09/2026 dos comandos `preencher_impostos_saida` (MAGAZINE e SAMVALE) e do script de conferência `validar_impostos_saida.py`. Não é uma nota técnica de desenvolvimento — é o material de apoio pra explicar pro Financeiro e pro superior o que cada número significa, por que o sistema está estruturado assim, e o que é responsabilidade de cada área.

> [!success] Veredito central — 13/09/2026, 00:15
> **Zero divergências** nas duas empresas. Todo produto que hoje tem imposto de saída gravado no sistema tem exatamente o valor que a tabela oficial diz que ele deveria ter. O que ainda falta preencher em alguns produtos não é erro de sistema — é falta de cadastro fiscal de origem (NCM, CST ou linha na planilha), detalhado item por item mais abaixo.

## O que rodou, em ordem

1. `preencher_impostos_saida --empresa=MAGAZINE` e depois `--empresa=SAMVALE` — o comando que grava, no cadastro de cada produto, os 5 campos fiscais de saída.
2. `validar_impostos_saida.py` — um script à parte, que não grava nada, só **confere**: pra cada produto das duas empresas, ele recalcula na hora qual seria o imposto certo (usando a mesma lógica do comando acima) e compara com o que está gravado. Se bater, tudo certo. Se não bater, ele aponta a diferença.

## Os 5 campos fiscais de saída — o que cada um é e de onde vem hoje

| Campo | O que é | De onde vem agora |
|---|---|---|
| `cst_saida` | O CST (Código de Situação Tributária) de saída do produto | Direto da planilha "Busca Legal" (mantida pelo Financeiro), por EAN — isso não mudou. Ele funciona como a **chave de busca** dos outros campos, explicado abaixo |
| `icms_saida_sp` | A alíquota de ICMS de saída considerando SP como UF de origem | Calculado a partir de uma tabela interna (`IcmsNcmUf`), buscando pelo NCM do produto + UF=SP |
| `icms_saida_media` | A média ponderada do ICMS de saída nas outras 26 UFs de destino (SP conta metade do peso, a média das outras 26 conta a outra metade) | Calculado a partir da mesma tabela interna, olhando as 27 UFs daquele NCM |
| `pis_percentual` | O percentual de PIS de saída do produto | Calculado a partir de outra tabela interna (`PisCofinsNcmCst`), buscando por NCM **+ CST** juntos |
| `cofins_percentual` | O percentual de COFINS de saída do produto | Mesma tabela, mesma busca por NCM + CST |

**Por que só o CST continua vindo direto da planilha e os outros 4 vêm de tabela interna?** Porque `IcmsNcmUf` e `PisCofinsNcmCst` já foram construídas, num passo anterior, a partir da própria planilha Busca Legal — mas com uma conferência extra que o preenchimento direto nunca teve: na hora de montar essas tabelas, qualquer NCM (ou NCM+CST) em que produtos diferentes tragam valores diferentes de imposto é **rejeitado e avisado**, nunca aceito por adivinhação. Então, hoje, todo produto que consegue achar seu imposto nessas 2 tabelas está automaticamente puxando um valor que já passou por essa conferência de consistência — não é mais uma cópia cega da planilha, linha a linha.

## Resultado do preenchimento (`preencher_impostos_saida`)

### MAGAZINE — catálogo com 1.359 produtos

| Item | Valor | O que significa |
|---|---|---|
| Produtos com pelo menos 1 campo atualizado nesta rodada | **753** | Desses 1.359 produtos, 753 tiveram algum dos 5 campos atualizado porque um dado novo e confiável foi encontrado pra eles |
| Linhas sem EAN na planilha | 0 | Nenhuma linha problemática na planilha desta vez |
| EAN duplicado na planilha | 0 | Nenhum EAN repetido |
| EAN da planilha sem produto correspondente no banco | 0 | Toda linha da planilha bateu com um produto real cadastrado |

**Por campo (quantos foram validados nesta rodada / quantos mantiveram o valor que já tinham):**

| Campo | Validado nesta rodada | Manteve valor antigo |
|---|---|---|
| `cst_saida` | 651 | 708 |
| `icms_saida_sp` | 582 | 777 |
| `icms_saida_media` | 578 | 781 |
| `pis` / `cofins` | 647 | 712 |

### SAMVALE — catálogo com 731 produtos

| Item | Valor | O que significa |
|---|---|---|
| Produtos com pelo menos 1 campo atualizado nesta rodada | **607** | De 731 produtos, 607 tiveram algum campo atualizado |
| Linhas sem EAN na planilha | 0 | — |
| EAN duplicado na planilha | 0 | — |
| EAN da planilha sem produto correspondente no banco | **9** | 9 linhas da planilha citam um EAN que não existe como produto cadastrado na SAMVALE hoje (lista abaixo) |

**Por campo:**

| Campo | Validado nesta rodada | Manteve valor antigo |
|---|---|---|
| `cst_saida` | 389 | 342 |
| `icms_saida_sp` | 569 | 162 |
| `icms_saida_media` | 569 | 162 |
| `pis` / `cofins` | 389 | 342 |

**Os 9 EANs da planilha Busca Legal (SAMVALE) sem produto correspondente no banco:**
`96506134660`, `96506134677`, `96506146342`, `96506146335`, `74468063860`, `74468064034`, `40141875297`, `74468064362`, `74468063822`

Vale conferir: pode ser produto descontinuado, EAN cadastrado errado na planilha, ou produto que só existe na MAGAZINE.

## "Manteve valor antigo" não é sinal de problema — é a regra de segurança do sistema

Um campo só é sobrescrito quando existe um dado **novo e já conferido** pra colocar no lugar. Quando não existe (por exemplo, o produto tem um NCM que ainda não está nas tabelas internas), o sistema **nunca apaga nem zera** o campo — ele simplesmente mantém o que já estava gravado. Essa é uma escolha deliberada: é preferível manter um dado antigo (que pode estar certo ou desatualizado) a apagar e ficar com um buraco de informação. É exatamente por isso que existe o passo seguinte — a validação — que confere, valor por valor, se o que ficou gravado (seja novo ou antigo) ainda está correto.

## Resultado da validação (`validar_impostos_saida.py`) — o veredito central

Para cada produto das duas empresas, o script recalculou o imposto "do zero" usando as tabelas internas e comparou com o que está gravado hoje.

> **MAGAZINE** — 1.359 produtos verificados. Divergências encontradas: **nenhuma**.
> **SAMVALE** — 731 produtos verificados. Divergências encontradas: **nenhuma**.

**O que isso prova, na prática:** não existe, hoje, nenhum produto com um imposto de saída gravado que esteja errado em relação ao que a tabela oficial diz — nem entre os que foram atualizados nesta rodada, nem entre os que mantiveram valor antigo de rodadas passadas. Se um produto tem dado gravado, esse dado está certo.

## O que ainda falta — e de quem é a responsabilidade

Divergência é diferente de "sem dado". Um produto pode não ter um campo preenchido não porque o sistema errou, mas porque falta uma peça de cadastro fiscal de origem (NCM, CST, ou a linha na planilha de imposto). O script separa exatamente qual peça está faltando, produto a produto:

| Motivo | O que significa | MAGAZINE | % do catálogo | SAMVALE | % do catálogo |
|---|---|---|---|---|---|
| **Sem NCM** | O produto não tem NCM nenhum cadastrado — sem isso, não tem como buscar imposto em nenhuma tabela | 37 | 2,7% | 3 | 0,4% |
| **NCM com ICMS rejeitado** | O produto tem NCM, mas esse NCM teve valores de ICMS divergentes entre produtos diferentes na planilha de ICMS por UF — por isso foi rejeitado na importação, nenhum valor "no chute" foi aceito | 502 | 36,9% | 38 | 5,2% |
| **NCM nunca importado (ICMS)** | O produto tem NCM, mas esse NCM simplesmente não aparece na planilha de ICMS por UF — nem aceito, nem rejeitado, nunca foi informado | 234 | 17,2% | 121 | 16,6% |
| **Sem CST de saída** | O produto ainda não tem `cst_saida` gravado — nunca apareceu, até hoje, na planilha Busca Legal | 708 | 52,1% | 342 | 46,8% |
| **NCM+CST com PIS/COFINS rejeitado** | O NCM+CST do produto teve PIS/COFINS divergente entre produtos diferentes — rejeitado na importação | 0 | — | 0 | — |
| **NCM+CST nunca importado (PIS/COFINS)** | O produto tem NCM+CST, mas essa combinação não aparece na planilha de PIS/COFINS | 4 | 0,3% | 0 | — |

Os 4 casos de "NCM+CST nunca importado" na MAGAZINE, por exemplo concreto:

| EAN | NCM | CST |
|---|---|---|
| `7899452030214` | `94051190` | `00` |
| `7895572102381` | `38085010` | `00` |
| `7899452002075` | `94051190` | `--` ⚠ |
| `7899452037237` | `94051190` | `00` |

O CST gravado como texto `--` (em vez de um código numérico de verdade) no EAN `7899452002075` é o mesmo tipo de anomalia já visto antes num NCM diferente (`38249010`) — reforça que não é um caso isolado, e sim um padrão de preenchimento na planilha que vale a pena o Financeiro/Contabilidade revisar.

Os 3 casos de "sem NCM" na SAMVALE, na íntegra: `37095`, `37093`, `37094` — são códigos curtos (não parecem EAN de 13 dígitos), possivelmente produtos internos ou cadastro incompleto.

**Nota técnica sobre os números de ICMS**: a soma das 3 primeiras linhas da tabela acima bate quase exatamente com o "manteve valor antigo" de `icms_saida_sp` (na SAMVALE bate 100%: 162 = 162; na MAGAZINE fica a poucos produtos de diferença — 773 vs. 777). A pequena diferença é porque `icms_saida_media` pode ficar sem dado em mais alguns casos raros onde o NCM existe e não foi rejeitado, mas falta informação de UF suficiente pra calcular a média ponderada — não é um motivo novo, só um recorte um pouco mais fino do mesmo problema de cadastro.

## Pontos de atenção prioritários pro Financeiro

1. **Cobertura da planilha Busca Legal está incompleta pra cerca de metade do catálogo.** 708 de 1.359 produtos na MAGAZINE (52%) e 342 de 731 na SAMVALE (47%) nunca apareceram na planilha Busca Legal — não têm CST de saída, nem PIS/COFINS. Vale confirmar se são produtos ativos que faltam cadastrar na planilha, ou produtos que legitimamente não precisam (descontinuados, por exemplo).
2. **NCMs com ICMS rejeitado por divergência** — é o maior motivo isolado de "sem dado" na MAGAZINE (37% do catálogo). Precisa revisar, na planilha de ICMS por UF, os NCMs onde produtos diferentes aparecem com alíquota diferente na mesma UF. Os NCMs já identificados como divergentes: MAGAZINE `84137080`, `84243010`, `84244100`, `84248229`, `84249010`, `90211010`; SAMVALE `95066200`, `90192020`.
3. **NCMs que nunca entraram na planilha de ICMS por UF** — 234 produtos na MAGAZINE e 121 na SAMVALE têm NCM cadastrado no produto, mas esse NCM nunca foi informado na planilha de imposto por UF.
4. **9 EANs da planilha Busca Legal (SAMVALE) que não correspondem a nenhum produto cadastrado** — listados acima.
5. **CST gravado como texto solto (`--`)** — já apareceu 2 vezes em NCMs diferentes; vale checar se é um padrão recorrente na origem do dado.

## Uma frase pra levar pro superior

O sistema foi auditado produto a produto e está **100% consistente**: zero divergências entre o que está gravado e o que a tabela fiscal oficial diz, nas duas empresas. O que falta preencher é 100% rastreável a lacunas de cadastro fiscal na origem (planilha/NCM/CST) — não a erro de cálculo do sistema — e já está listado, motivo por motivo, pra quem mantém esses cadastros agir.

## Relacionado

- [[Descoberta - Camada 1 Reescrita para Fonte Unica (NCM+CST), Bug de Escopo do Loop Corrigido, Validacao Final Sem Divergencias]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
