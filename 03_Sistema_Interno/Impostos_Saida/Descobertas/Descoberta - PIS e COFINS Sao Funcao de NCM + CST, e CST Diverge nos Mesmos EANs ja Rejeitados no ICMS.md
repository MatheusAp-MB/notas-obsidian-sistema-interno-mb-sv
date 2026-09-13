---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 17:37
relacionado: [Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC), Estrutura da Planilha Busca Legal de Impostos de Saida, Checkpoint - Inicio da Estrutura de Impostos de Saida]
---

# Descoberta: PIS e COFINS São Função de NCM + CST — e o CST Diverge Exatamente nos Mesmos EANs já Rejeitados no ICMS

**Resumo**: Testado com as 2 planilhas oficiais (não a reduzida) se PIS, COFINS e CST são realmente uma função do NCM — pergunta que surgiu discutindo uma proposta de normalização (opinião externa, GPT) pra guardar PIS/COFINS/CST numa tabela de referência por NCM, no mesmo espírito da `IcmsNcmUf`. Resultado: PIS e COFINS batem 100% quando agrupados por **NCM + CST** (0 divergências nas 2 empresas) — a proposta do GPT funciona, na versão com CST na chave. Mas o **CST em si não é função pura do NCM**: diverge em 4 de 70 NCMs (MAGAZINE, nenhum na SAMVALE). E o achado mais importante: os EANs que causam essa divergência de CST são, EAN por EAN, os MESMOS EANs que já causaram a divergência de ICMS nos 6 NCMs rejeitados na importação real da MAGAZINE (ver [[Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC)]]) — sugerindo uma causa raiz comum (CST cadastrado errado nesses produtos específicos), não 2 problemas separados.

> [!success] Confirmada — 12/09/2026
> Testado com `teste.py` contra as 2 planilhas oficiais (MAGAZINE: 651 linhas, 120 NCMs; SAMVALE: 398 linhas, 45 NCMs), reaproveitando a mesma lógica de agrupamento/divergência já validada pro ICMS.

## PIS/COFINS: função de NCM + CST (validado)

Por NCM puro, PIS e COFINS divergem em 1 NCM (`90211010`, MAGAZINE — o mesmo EAN `4094275776896` que já diverge no ICMS(AC) e agora também no CST). Agrupando por **NCM + CST**, a divergência de PIS e COFINS cai pra **0 em 71 grupos (MAGAZINE) e 0 em 27 (SAMVALE)** — confirma que PIS/COFINS são função de (NCM, CST), como a versão em texto da sugestão do GPT dizia (o exemplo de tabela dele, porém, não refletia isso — colocava CST como se fosse só mais uma coluna do NCM).

## CST não é função do NCM

CST diverge em **4 de 70 NCMs com mais de 1 EAN** na MAGAZINE (0 de 27 na SAMVALE):

| NCM | EAN(s) com CST diferente | CST majoritário | CST do(s) EAN(s) discrepante(s) |
|---|---|---|---|
| `84137080` | `7898632332315` | 20 (5 de 6) | 00 |
| `84243010` | `7896821500354`, `7899144897057`, `7896821501030` | 20 (22 de 25) | 00 |
| `84248229` | `7891117043546` | 20 (5 de 6) | 00 |
| `90211010` | `4094275776896` | 40 (16 de 17) | 00 |

Ou seja: CST não pode virar uma coluna de referência só-por-NCM (como no desenho literal do GPT) — precisaria continuar por produto, ou numa tabela NCM+CST tratada com a mesma regra de divergência que já existe pro ICMS.

## O achado real: mesmo EAN, mesma causa provável

Os EANs discrepantes de CST acima são, um a um, os MESMOS EANs que já tinham divergido no ICMS — em 4 dos 6 NCMs rejeitados na importação real da MAGAZINE (ver [[Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC)]]):

- `84137080`, `84243010`, `84248229`: o(s) mesmo(s) EAN(s) discrepante(s) no ICMS(AC) também têm CST diferente do resto do NCM.
- `90211010`: o EAN único `4094275776896` diverge ao mesmo tempo em ICMS(AC), PIS, COFINS e CST — as 4 frentes, o mesmo produto.
- `84244100` e `84249010` (os outros 2 dos 6 originais) NÃO aparecem aqui — continuam sendo divergência só de ICMS, sem sinal de CST errado.

Isso sugere que, pra 4 dos 6 NCMs rejeitados na MAGAZINE, a causa provável não são 2 erros de digitação independentes — é o CST cadastrado errado nesses produtos específicos (CST define o regime/tratamento tributário, que influencia a alíquota), que provavelmente arrasta o ICMS (e no caso do `90211010`, também PIS/COFINS) errado junto. É uma pista de causa raiz mais concreta pro Financeiro/Contabilidade do que só "esses valores divergem".

## Implicação prática: Camada 1 não tem proteção nenhuma contra isso

O comando `preencher_impostos_saida` (Camada 1) grava `pis_percentual`/`cofins_percentual`/`icms_saida_sp`/`icms_saida_media` direto no `Produto`, por EAN, sem nenhuma checagem de divergência — bem diferente da `IcmsNcmUf`, que rejeita o NCM inteiro se algum EAN discordar. Isso quer dizer que, hoje, o EAN `4094275776896` (e possivelmente outros dos 4 NCMs acima) provavelmente já tem `pis_percentual`/`cofins_percentual` gravados errado no `Produto` de produção, silenciosamente, alimentando a precificação real — sem nenhum aviso. Isso dá um ponto de partida concreto pra Camada 2 do plano ("Analisar com calma e garantir que os 4 campos já preenchidos estão válidos"), que hoje ainda está em aberto.

## Relacionado

- [[Descoberta - Primeira Importacao Real do ICMS por NCM na MAGAZINE (6 NCMs Rejeitados, Maioria na UF AC)]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
