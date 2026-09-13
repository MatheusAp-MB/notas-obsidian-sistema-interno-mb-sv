---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 13/09/2026 16:03
relacionado: [Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Checkpoint - Inicio da Estrutura de Impostos de Saida, Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]
---

# Descoberta: Primeira Importação Real do ICMS por NCM (MAGAZINE e SAMVALE) — Padrões de Divergência Diferentes por Empresa

**Resumo**: 1ª rodada real do `importar_icms_por_ncm` contra os arquivos oficiais da Busca Legal, nas 2 empresas. MAGAZINE: 120 NCMs distintos, 114 aceitos (2.861 combinações NCM+UF criadas + 109 atualizadas — as mesmas 109 da importação de teste com a planilha reduzida, confirmando que a reduzida é um recorte fiel do arquivo oficial), 6 rejeitados por divergência entre EANs do mesmo NCM, 5 deles na mesma UF (AC). SAMVALE: 45 NCMs distintos, 43 aceitos (1.161 combinações NCM+UF criadas, 0 atualizadas — banco da SAMVALE ainda não tinha nenhum registro de `IcmsNcmUf` antes desta rodada), 2 rejeitados — mas em UFs diferentes (MG e DF), nenhuma delas AC. O padrão "AC" observado na MAGAZINE não se repete na SAMVALE, o que enfraquece a hipótese de causa sistêmica ligada especificamente à coluna AC.

> [!success] Confirmada — 12/09/2026
> Pipeline (model + import tratado + persistência) rodou ponta a ponta contra dado real nas 2 empresas, aplicando a regra de divergência exatamente como desenhada — incluindo o caso "preenchido vs em branco" (NCM 84249010, UF PI, na MAGAZINE). Matheus decidiu deixar os NCMs divergentes de fora em ambas as empresas por enquanto: só o Financeiro/Contabilidade tem o conhecimento fiscal pra saber qual valor está certo em cada divergência — não é uma decisão que um desenvolvedor deveria tomar sozinho.

> [!warning] Atualização (13/09/2026, 06:11) — 4 desses 8 NCMs não são erro de cadastro
> Ver [[Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria]]: uma consulta externa (Gemini), cruzada com o achado de CST desta própria nota (seção "Atualização 12/09/2026 17:37" abaixo), confirmou que `84137080`, `84243010`, `84248229` e `90211010` (MAGAZINE) divergem porque têm CST diferente entre os EANs — uma diferença fiscal legítima (benefício/isenção), não erro de cadastro. `84244100` e `84249010` (MAGAZINE) e, até segunda verificação, `95066200`/`90192020` (SAMVALE) continuam sendo tratados como divergência real de cadastro.

> [!success] Confirmado empiricamente (13/09/2026, 15:58) — os 4 NCMs por CST realmente se resolveram
> Comparação real entre 2 rodadas de `importar_icms_por_ncm --empresa=MAGAZINE`, mesmo arquivo da Busca Legal (confirmado por Matheus — nada mudou na planilha entre as 2 rodadas). Rodada de 13/09/2026 04:53 (antes da chave de consolidação incluir CST+Origem): ainda os 6 NCMs rejeitados desta nota, agrupados só por NCM. Rodada de 13/09/2026 15:43 (já com CST+Origem na chave — ver [[Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria]]), com o **mesmo arquivo de entrada**: só 3 grupos rejeitados — `84249010 + CST 00 + Origem 2` (25 EANs), `84244100 + CST 20 + Origem 0` (6 EANs) e `84244100 + CST 20 + Origem 5` (4 EANs). Os 4 NCMs apontados acima como "não é erro de cadastro" (`84137080`, `84243010`, `84248229`, `90211010`) saíram da lista de rejeitados — resolvidos ao comparar dentro do CST+Origem correto, exatamente como previsto. `84244100` e `84249010` continuam rejeitados, confirmando que ali a divergência é real (não CST/Origem) — o `84249010` pelo mesmo caso "preenchido vs em branco" (UF PI, EAN `7895513413088`) desde a 1ª importação. Como o arquivo de entrada é idêntico nas 2 rodadas, o único fator que mudou foi o código — isola a causa com segurança, sem depender mais só de consulta externa.

## MAGAZINE — 6 NCMs rejeitados (120 distintos, 114 aceitos)

| NCM | UF divergente | Valor majoritário | EAN(s) discrepante(s) |
|---|---|---|---|
| `84137080` | AC | 8.80 (5 de 6 EANs) | `7898632332315` = 19.00 |
| `84243010` | AC | 8.80 (22 de 25 EANs) | `7896821500354`, `7899144897057`, `7896821501030` = 19.00 |
| `84244100` | AC | 5.60 (42 de 44 EANs) | `7891988006671`, `7896821500279` = 8.80 |
| `84248229` | AC | 5.60 (5 de 6 EANs) | `7891117043546` = 19.00 |
| `84249010` | PI | 22.50 (58 de 59 EANs) | `7895513413088` = em branco (não 22.50) — caso "preenchido vs em branco" |
| `90211010` | AC | 0.00 (16 de 17 EANs) | `4094275776896` = 25.00 |

2.861 combinações NCM+UF criadas + 109 atualizadas (as mesmas 109 da amostra reduzida, confirmando que o recorte de teste é fiel ao arquivo oficial).

## Comparativo completo — antes vs. depois da chave CST+Origem (13/09/2026, 16:03)

Matheus salvou as 2 páginas HTML da tela de Auditoria Fiscal (Camada D) antes de recarregar — a rodada de 04:53 (chave só por NCM, mesma desta nota) e a de 15:43 (chave já com CST+Origem), **mesmo arquivo de entrada nas 2** (confirmado por Matheus). Tabela completa, grupo por grupo:

**Antes (04:53) — 6 rejeitados, chave só por NCM:**

| NCM | EANs no grupo | UFs divergentes | Maioria | Minoria (EAN) |
|---|---|---|---|---|
| `84249010` | 59 | 1 (PI) | 22.50% (58 EANs) | `7895513413088` = em branco |
| `84244100` | 44 | 24 | 5.60%/AC etc. (42 EANs) | `7891988006671`, `7896821500279` = 8.80%/AC etc. |
| `84243010` | 25 | 24 | 8.80%/AC etc. (22 EANs) | `7896821500354`, `7899144897057`, `7896821501030` = 19.00%/AC etc. |
| `90211010` | 17 | 26 | 0.00%/AC etc. (16 EANs) | `4094275776896` = 25.00%/AC etc. |
| `84137080` | 6 | 24 | 8.80%/AC etc. (5 EANs) | `7898632332315` = 19.00%/AC |
| `84248229` | 6 | 25 | 5.60%/AC etc. (5 EANs) | `7891117043546` = 19.00%/AC |

**Depois (15:43) — 3 rejeitados, chave NCM+CST+Origem:**

| NCM+CST+Origem | EANs no grupo | UFs divergentes | Minoria (EAN) |
|---|---|---|---|
| `84249010 + CST 00 + Origem 2` | 25 (era 59) | 1 (PI) | `7895513413088` — mesmo causador |
| `84244100 + CST 20 + Origem 0` | 6 (fatiado dos 44) | 24 | `7891988006671` — mesmo causador |
| `84244100 + CST 20 + Origem 5` | 4 (fatiado dos 44) | 24 | `7896821500279` — o outro causador |
| `84243010`, `90211010`, `84137080`, `84248229` | — | — | resolvidos, saíram da lista |

**3 conclusões que esse comparativo confirma com dado real (não só hipótese):**

1. Os 4 NCMs já suspeitados (seção "Atualização 13/09/2026, 06:11" acima) resolveram 100% ao entrar CST+Origem na chave — saem inteiramente da lista de rejeitados.
2. `84244100` não só continua rejeitado como ficou mais preciso: dos 44 EANs originais, só 10 restam divergentes (6 em Origem 0 + 4 em Origem 5) — os outros 34 pertenciam a Origem(ns) que batem 100% entre si e nem aparecem mais na lista. Os 2 EANs causadores são os mesmos de antes, agora isolados no grupo certo.
3. `84249010` também ficou mais preciso mesmo continuando rejeitado: 59→25 EANs no grupo, mesmo único causador (`7895513413088`, "em branco" na UF PI) — os outros 34 EANs pertenciam a outro CST/Origem, sem relação com essa divergência.

Como o arquivo de entrada é idêntico nas 2 rodadas, o único fator que mudou foi o código — isola a causa com segurança.

## SAMVALE — 2 NCMs rejeitados (45 distintos, 43 aceitos)

| NCM | UF divergente | Valor majoritário | EAN(s) discrepante(s) |
|---|---|---|---|
| `95066200` | MG | 18.00 (20 de 21 EANs) | `7898944749252` = 12.00 |
| `90192020` | DF | 20.00 (15 de 17 EANs) | `7898157300936`, `7898157300943` = 12.00 |

1.161 combinações NCM+UF criadas (= 43 × 27, batendo exato), 0 atualizadas — banco da SAMVALE ainda não tinha nenhum registro de `IcmsNcmUf` gravado antes desta rodada.

## Padrões diferentes por empresa — hipótese "AC sistêmico" enfraquecida

Na MAGAZINE, 5 das 6 divergências caíam na coluna **AC** (Acre) — só a do NCM `84249010` divergia em PI. Na SAMVALE, as 2 divergências caem em **MG** e **DF** — nenhuma em AC. Se houvesse um erro sistemático de digitação específico da coluna AC na Busca Legal, seria esperado ver o mesmo padrão nas duas empresas — o que não aconteceu. Isso enfraquece a hipótese de causa sistêmica ligada à coluna AC, sem descartá-la totalmente (pode ainda ser coincidência de qual UF cada empresa erra). Continua registrado como observação, não como conclusão — a causa raiz de cada divergência é investigação do Financeiro/Contabilidade, não do desenvolvimento.

## Atualização 12/09/2026 17:37 — pista de causa raiz: CST

Investigando se PIS/COFINS/CST poderiam virar uma tabela de referência por NCM (discussão à parte), apareceu um achado direto sobre estes 6 NCMs: em 4 deles (`84137080`, `84243010`, `84248229`, `90211010`), os MESMOS EANs discrepantes acima também têm o CST diferente do resto do NCM — e no caso do `90211010`, o mesmo EAN único diverge em ICMS, PIS, COFINS e CST ao mesmo tempo. Sugere que a causa provável não é um erro isolado por UF, e sim o CST cadastrado errado nesses produtos específicos. Detalhe completo em [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]]. Os outros 2 NCMs (`84244100`, `84249010`) não têm esse sinal — continuam sendo divergência só de ICMS.

## Decisão

Matheus decidiu deixar os NCMs divergentes de fora da tabela em ambas as empresas por enquanto (não gravados, ficam fora da tela de ICMS por NCM até a divergência ser resolvida na origem). A correção precisa vir do Financeiro/Contabilidade, não do desenvolvimento — são eles quem sabem qual valor é o correto fiscalmente pra cada UF divergente, em cada empresa. Depois de corrigida a origem (Busca Legal), rodar o import de novo resolve automaticamente (a regra de "sempre confia no que chega" já cuida disso — ver [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]).

## Relacionado

- [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]]
