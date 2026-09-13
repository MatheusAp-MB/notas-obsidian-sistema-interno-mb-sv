---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 17:37
relacionado: [Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Checkpoint - Inicio da Estrutura de Impostos de Saida, Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]
---

# Descoberta: Primeira Importação Real do ICMS por NCM (MAGAZINE e SAMVALE) — Padrões de Divergência Diferentes por Empresa

**Resumo**: 1ª rodada real do `importar_icms_por_ncm` contra os arquivos oficiais da Busca Legal, nas 2 empresas. MAGAZINE: 120 NCMs distintos, 114 aceitos (2.861 combinações NCM+UF criadas + 109 atualizadas — as mesmas 109 da importação de teste com a planilha reduzida, confirmando que a reduzida é um recorte fiel do arquivo oficial), 6 rejeitados por divergência entre EANs do mesmo NCM, 5 deles na mesma UF (AC). SAMVALE: 45 NCMs distintos, 43 aceitos (1.161 combinações NCM+UF criadas, 0 atualizadas — banco da SAMVALE ainda não tinha nenhum registro de `IcmsNcmUf` antes desta rodada), 2 rejeitados — mas em UFs diferentes (MG e DF), nenhuma delas AC. O padrão "AC" observado na MAGAZINE não se repete na SAMVALE, o que enfraquece a hipótese de causa sistêmica ligada especificamente à coluna AC.

> [!success] Confirmada — 12/09/2026
> Pipeline (model + import tratado + persistência) rodou ponta a ponta contra dado real nas 2 empresas, aplicando a regra de divergência exatamente como desenhada — incluindo o caso "preenchido vs em branco" (NCM 84249010, UF PI, na MAGAZINE). Matheus decidiu deixar os NCMs divergentes de fora em ambas as empresas por enquanto: só o Financeiro/Contabilidade tem o conhecimento fiscal pra saber qual valor está certo em cada divergência — não é uma decisão que um desenvolvedor deveria tomar sozinho.

> [!warning] Atualização (13/09/2026, 06:11) — 4 desses 8 NCMs não são erro de cadastro
> Ver [[Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria]]: uma consulta externa (Gemini), cruzada com o achado de CST desta própria nota (seção "Atualização 12/09/2026 17:37" abaixo), confirmou que `84137080`, `84243010`, `84248229` e `90211010` (MAGAZINE) divergem porque têm CST diferente entre os EANs — uma diferença fiscal legítima (benefício/isenção), não erro de cadastro. `84244100` e `84249010` (MAGAZINE) e, até segunda verificação, `95066200`/`90192020` (SAMVALE) continuam sendo tratados como divergência real de cadastro.

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
