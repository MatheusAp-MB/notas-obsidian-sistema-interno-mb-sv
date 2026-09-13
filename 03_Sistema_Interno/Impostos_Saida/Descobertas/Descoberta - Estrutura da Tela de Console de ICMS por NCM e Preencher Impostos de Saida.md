---
tipo: descoberta
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 17:07
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria, Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas, Duvida - Tabelas de Grupo Rejeitado do PIS-COFINS por NCM+CST Ainda Sem Validacao com Dado Real]
---

# Estrutura da Tela de Console — Importar ICMS por NCM e Preencher Impostos de Saída

**Resumo**: os 6 comandos de management (`importar_icms_por_ncm`, `importar_pis_cofins_por_ncm_cst` e `preencher_impostos_saida`, cada 1 rodado com `--empresa=MAGAZINE` e `--empresa=SAMVALE`) tiveram o print do terminal redesenhado com `rich` + `pandas` (13/09/2026 — ICMS e Impostos de Saída às 15:51, PIS/COFINS estendido às 17:07). Esta nota documenta, campo a campo, o que cada elemento do print significa e por que existe — pra qualquer 1 (humano ou LLM) que leia um print desses no futuro entender sem precisar reconstruir o raciocínio.

> [!success] Confirmada — 13/09/2026
> Redesenho validado com 2 rodadas completas reais (MAGAZINE + SAMVALE, pipeline inteiro do zero via `truncar_icms_ncm.py`), incluindo 3 bugs de renderização encontrados e corrigidos nesse processo (ver seção "Bugs de renderização" abaixo).

> [!warning] Estendida para PIS/COFINS — 13/09/2026, 17:07 — validação parcial
> O mesmo redesenho (Rich + pandas) foi aplicado a `importar_pis_cofins_por_ncm_cst` (ver seção própria abaixo). Confirmado com rodada real (MAGAZINE + SAMVALE, mesmo pipeline do zero, 16:52-16:53): caminho de grupos ACEITOS e aviso de múltiplos CST renderizam corretos, sem nenhum dos 3 bugs listados acima. O caminho mais importante — as 2 tabelas de grupo REJEITADO (visão geral + detalhe por campo) — ainda não foi exercitado por nenhuma rodada real (0 grupos PIS/COFINS rejeitados nas 2 empresas nesta rodada). Decisão explícita de Matheus: deixar em aberto, sem forçar dado de teste falso nem considerar validado sem prova real — ver [[Duvida - Tabelas de Grupo Rejeitado do PIS-COFINS por NCM+CST Ainda Sem Validacao com Dado Real]].

## Por que essa tela existe (contexto de audiência)

**Esta tela de console NÃO é a interface de usuário final.** É uma ferramenta de debug — existe só pra Matheus (e Claude, analisando o print colado na conversa) conferirem, depois de rodar um comando, se o código está se comportando certo ou se a rejeição/divergência mostrada é só reflexo de dado sujo na origem (planilha Busca Legal). A interface de usuário final de verdade é a Auditoria Fiscal em HTML (Camadas C e D — ver [[Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas]]): a tela de detalhes do produto (Camada C) e a tela de Auditoria Fiscal (Camada D) usam o mesmo dado gravado por esses comandos, mas com apresentação pensada pra quem não é dev.

Isso importa pra quem for ler o print: a escolha de cor/severidade abaixo otimiza pra responder rápido "isso é 1 bug no meu código de agrupamento, ou é só o produto X cadastrado errado na planilha (comportamento esperado, dado sujo)?" — não pra proteger uma audiência de negócio de informação técnica.

## Estrutura do print — `importar_icms_por_ncm`

Fluxo: lê a planilha Busca Legal → agrupa por NCM+CST+Origem → valida (100% de acordo entre os EANs do grupo, nas 27 UFs, senão rejeita o grupo inteiro) → grava os grupos aceitos em `IcmsNcmUf` e os rejeitados em `IcmsNcmRejeitado` (auditoria).

1. **Tabela "ICMS por NCM — Agrupamento (NCM + CST + Origem)"**: contagem geral da rodada — quantos grupos distintos de NCM+CST+Origem foram encontrados na planilha, quantos foram aceitos (gravados), quantos foram rejeitados, e quantas linhas foram ignoradas por falta de NCM/CST. É o resumo de "alto nível" antes de entrar em qualquer detalhe.

2. **Aviso "N grupo(s) rejeitado(s)"** (só aparece se houver rejeição): lembra a regra de rejeição (100% de acordo entre os EANs do grupo, em todas as 27 UFs) e deixa explícito que nada foi gravado desses grupos em `IcmsNcmUf` — só na tabela de auditoria `IcmsNcmRejeitado`.

3. **Tabela "Visão geral — 1 linha por grupo rejeitado (maior grupo primeiro)"**: 1 linha por grupo rejeitado, ordenada pelo grupo com mais EANs primeiro (maior impacto real primeiro). Colunas: NCM, CST, Origem (identifica o grupo), **Diagnóstico** (resultado já resumido do algoritmo de diagnóstico por EAN — ver seção própria abaixo), EANs no Grupo, UFs Divergentes. Existe pra dar 1 visão panorâmica de todos os grupos rejeitados sem precisar entrar no detalhe de nenhum — se todos os diagnósticos vierem verdes ("N EAN provável"), é sinal de que a rejeição é sistematicamente por dado cadastrado errado (não bug), sem precisar olhar grupo por grupo.

4. **Por grupo rejeitado, nesta ordem**:
   - Título em negrito, texto simples (não é título de `Table`/`Panel` — ver "Bugs de renderização", item 2, pro motivo): `NCM {ncm} + CST {cst} + Origem {origem} — {N} UF(s) de {M} EAN(s) no grupo`. Identifica o grupo e dá o tamanho do problema (quantas UFs divergiram, de quantos EANs no total).
   - **Um dos 3 widgets de diagnóstico** (ver algoritmo abaixo pra lógica completa):
     - `Panel` verde "Provável causador": exatamente 1 EAN concentrou toda divergência — nomeia o EAN e em quantas UFs ele divergiu. Caso mais simples: 1 produto cadastrado errado, fácil de conferir.
     - `Table` amarela "EANs suspeitos": 2+ EANs concentraram a divergência — lista cada 1 com "Divergiu em N de M UF(s)". Precisa de mais investigação, mas ainda é sinal de causador(es) específico(s).
     - `Panel` vermelho "Sem causador claro": nenhum EAN se destaca — a divergência está distribuída igualmente entre os EANs em toda UF. Pode ser divergência real de tabela (não 1 produto errado) — vale conferir a lógica de agrupamento se isso for inesperado.
   - Se houve UF(s) com empate no topo (2 valores com o mesmo tamanho de grupo, sem 1 valor claramente majoritário): aviso amarelo "N UF(s) sem maioria clara" — essas UFs são excluídas do cálculo de diagnóstico (não dá pra dizer quem é minoria quando não há maioria).
   - **Tabela "Detalhe UF-a-UF"**: a evidência bruta por trás do diagnóstico — 1 linha por (UF, valor distinto encontrado), com quantos EANs tiveram aquele valor e exemplos de EAN (até 15, com "+N" se passar disso). É o dado "cru" que o diagnóstico resume — continua existindo pra quem quiser conferir manualmente os valores reais, não só confiar no resumo.

5. **Panel final "ICMS por NCM — Gravação concluída"**: quantas linhas foram criadas em `IcmsNcmUf` (grupos aceitos, novos), quantas foram atualizadas (já existiam), e quantos grupos rejeitados foram registrados pra auditoria.

## O algoritmo de diagnóstico por EAN (`NcmRejeitado.montar_diagnostico_eans` / `resumir_diagnostico`)

**Problema que resolve**: antes desse algoritmo, um grupo rejeitado com muitas UFs divergentes (ex: 24 de 27) gerava 1 linha na tabela "Detalhe UF-a-UF" por UF — 24 linhas repetidas, quase sempre com o mesmo padrão (1 EAN sempre do lado oposto dos outros). Quem lesse precisava escanear as 24 linhas manualmente pra perceber isso.

**O que calcula**: pra cada UF divergente do grupo, agrupa os EANs pelo valor que eles têm naquela UF e identifica o maior grupo (a "maioria"). Todo EAN que NÃO está no maior grupo entra como "em minoria" naquela UF. Soma, por EAN, em quantas UFs ele ficou em minoria. UFs onde os 2 maiores grupos empatam em tamanho (ex: 50%/50%, sem maioria clara) não contam ninguém como minoria nelas — entram à parte como "UF sem maioria clara".

**3 resultados possíveis** (`resumir_diagnostico`, o texto+cor que aparece na tabela "Visão geral" e decide qual widget é mostrado por grupo):
- **Verde — "1 EAN provável (EAN)"**: exatamente 1 EAN ficou em minoria em pelo menos 1 UF, e nenhum outro. Interpretação: esse 1 produto está cadastrado errado (ou realmente é diferente dos outros) — caso simples de conferir no cadastro.
- **Amarelo — "N EAN(s) suspeitos"** (N ≥ 2): mais de 1 EAN ficou em minoria em alguma UF. Interpretação: precisa de mais investigação — pode ser mais de 1 produto errado, ou um padrão menos óbvio.
- **Vermelho — "sem padrão claro"**: nenhum EAN ficou em minoria em nenhuma UF (todas as UFs empataram, ou o grupo não tinha divergência real detectável por esse método). Interpretação: divergência distribuída igualmente — pode não ser 1 produto errado, e sim um problema real na lógica de agrupamento (vale conferir o código).

## Estrutura do print — `preencher_impostos_saida`

Fluxo: lê a mesma planilha Busca Legal → preenche 5 campos fiscais de saída no `Produto` (`cst_saida` direto da planilha; `icms_saida_sp`/`icms_saida_media`/`pis_percentual`/`cofins_percentual` vindos das tabelas normalizadas `IcmsNcmUf`/`PisCofinsNcmCst`, com conferência cruzada entre produtos) → roda sobre o catálogo inteiro, não só quem está na planilha desta rodada.

1. **Tabela "Impostos de Saída — Leitura da planilha"**: métricas da leitura bruta — linhas sem EAN (ignoradas), EAN duplicado na planilha (mantida a 1ª ocorrência), EAN da planilha sem `Produto` correspondente no banco (linha amarela se > 0 — não impede a rodada, mas indica produto cadastrado errado ou desatualizado).

2. **Tabela "cst_saida (sem conferência cruzada)"**: `cst_saida` vem direto da planilha, por EAN — sem cruzar com outro produto (é o único dos 5 campos que depende de o produto estar na planilha desta rodada específica). Mostra quantos EANs foram atualizados nesta rodada vs. quantos ficaram sem atualização (esperado pra EAN que não veio na planilha desta vez — mantém o CST antigo, não é anomalia, daí o caption explicando isso).

3. **Tabela "Campos vindos das tabelas normalizadas (conferência cruzada entre produtos)"**: os outros 4 campos (`icms_saida_sp`, `icms_saida_media`, `pis/cofins`), buscados por NCM/CST nas tabelas normalizadas — aqui SIM há conferência cruzada (o valor depende de outros produtos do mesmo NCM+CST concordarem, via `IcmsNcmUf`/`PisCofinsNcmCst`). 3 colunas por campo: **Validado** (valor confirmado e gravado), **Zerado nesta rodada** (era validado antes e virou vazio agora — a coluna mais importante da tabela inteira: em vermelho negrito quando > 0, porque é dado que regrediu, não dado que nunca existiu), **Já vazio, continua vazio** (nunca teve dado validado — neutro, não é regressão).

4. **Panel final "Impostos de Saída — Concluído"**: quantos produtos tiveram pelo menos 1 dos 5 campos atualizado nesta rodada (cobre o catálogo inteiro). Borda muda de verde pra amarela automaticamente se algum campo foi zerado nesta rodada (ver item 3) — aviso de "confirme se é esperado antes de seguir".

5. **Panel "N EAN(s) da planilha sem Produto correspondente no banco — conferir"** (só aparece se N > 0): lista compacta (em colunas) dos EANs da planilha que não bateram com nenhum `Produto` do banco — candidatos a produto novo não cadastrado ainda, ou EAN digitado errado na planilha.

## Estrutura do print — `importar_pis_cofins_por_ncm_cst`

Fluxo: lê a mesma planilha Busca Legal → agrupa por NCM+CST (sem Origem — PIS/COFINS não dependem dela) → valida (100% de acordo em PIS E COFINS entre os EANs do grupo, senão rejeita o grupo inteiro) → grava os grupos aceitos em `PisCofinsNcmCst` e os rejeitados em `PisCofinsNcmCstRejeitado` (auditoria) → emite um aviso informativo (não bloqueia) de NCMs com mais de 1 CST aceito.

Redesenhado em 13/09/2026 com o mesmo tratamento visual de `importar_icms_por_ncm` (`Console` com margem, tabelas a partir de `DataFrame`, título de cada widget curto, identidade do grupo em texto plano antes do detalhe) — antes disso, esse comando ainda imprimia só texto puro (`stdout.write`/`style.SUCCESS`/`style.WARNING`).

1. **Tabela "PIS/COFINS por NCM+CST — Agrupamento (NCM + CST)"**: mesmo papel da tabela de agrupamento do ICMS — grupos distintos encontrados, aceitos, rejeitados, linhas sem NCM/CST ignoradas.

2. **Aviso "N grupo(s) rejeitado(s)"** (só se houver rejeição): mesma função do ICMS, mas a regra citada é "PIS e COFINS precisam bater entre todos os EANs do grupo" (não menciona UF, porque aqui não existe UF).

3. **Tabela "Visão geral — 1 linha por grupo rejeitado (maior grupo primeiro)"**: 1 linha por grupo rejeitado, maior grupo primeiro. Colunas: NCM, CST, **Campos Divergentes** (lista "PIS", "COFINS" ou "PIS, COFINS" — nunca mais que isso, já que só existem esses 2 campos), EANs no Grupo. **Diferença importante do ICMS**: aqui não existe o algoritmo de diagnóstico por EAN (`montar_diagnostico_eans`/`resumir_diagnostico`, verde/amarelo/vermelho) — decisão deliberada, não pendência esquecida (ver "Por que o diagnóstico do ICMS não foi portado" abaixo).

4. **Por grupo rejeitado, nesta ordem**:
   - Título em negrito, texto simples (mesma razão do ICMS — evitar o bug de título fragmentado): `NCM {ncm} + CST {cst} — diverge em {N} campo(s) de {M} EAN(s) no grupo: {campos}`.
   - **Tabela "Detalhe por campo"**: equivalente direto do "Detalhe UF-a-UF" do ICMS, trocando "UF" por "Campo" — 1 linha por (campo, valor distinto encontrado), com quantos EANs tiveram aquele valor e exemplos (até 3, com "..." se passar disso — mesmo limite do ICMS). Como só existem 2 campos possíveis (PIS, COFINS), essa tabela nunca chega a ter mais de umas poucas linhas — bem menor que o "UF-a-UF" do ICMS, que pode chegar a 27 UFs × N valores.

5. **Aviso informativo "NCMs com mais de 1 CST aceito"** (não bloqueia o import): tabela própria (`NCM` / `CSTs (qtd. de EANs)`) — NCMs que passaram na validação mas têm mais de 1 CST diferente entre os EANs aceitos. No levantamento real de 12-13/09, isso bateu, EAN por EAN, com os mesmos itens que já divergiam no ICMS por NCM — sinal de cadastro de CST errado, não variação tributária legítima. Continua só avisando, nunca rejeitando.

6. **Panel final "PIS/COFINS por NCM+CST — Gravação concluída"**: mesmo papel do painel final do ICMS — criados (NCM+CST novos), atualizados (já existiam), rejeitados registrados pra auditoria.

### Por que o diagnóstico do ICMS não foi portado

O algoritmo "causador provável" do ICMS (`montar_diagnostico_eans`/`resumir_diagnostico`, seção própria acima) já existia ANTES do redesenho visual daquele comando — o redesenho só vestiu de Rich uma lógica que já estava lá. Em `importar_pis_cofins_por_ncm_cst`, essa lógica nunca existiu — `GrupoRejeitado` só guarda `divergencias_por_campo` e um agrupamento por valor (`_grupos_por_valor`), sem nenhum cálculo de "quem está em minoria". Portar o diagnóstico seria uma capacidade nova, não uma troca de exibição — por isso ficou de fora deste redesenho especificamente. É perfeitamente adaptável (trocando "UF" por "Campo", já que aqui só existem 2 campos possíveis em vez de 27 UFs) se algum dia for pedido.

## Bugs de renderização encontrados e corrigidos (13/09/2026)

Todos encontrados a partir de prints reais colados por Matheus (nunca reproduzidos nos meus testes isolados antes disso) e corrigidos no mesmo dia.

1. **Ordenação inconsistente**: a tabela "Visão geral" ordenava por qtd. de EANs (maior primeiro), mas o loop que imprime o detalhe de cada grupo rejeitado usava a lista original, sem ordenar — as 2 ordens apareciam diferentes no mesmo print. Corrigido ordenando 1 vez só (`sorted(agrupador.rejeitados, key=lambda r: -r.total_eans_no_grupo)`) e reaproveitando o resultado nos 2 lugares.

2. **Título de `Table` fragmentando em 2+ linhas centralizadas separadamente**: `rich.table.Table` dimensiona a caixa pro CONTEÚDO das colunas, não pra largura do console — um título comprido numa tabela estreita (poucas colunas/colunas curtas) quebra em várias linhas, cada 1 centralizada por conta própria (visualmente fragmentado). Aconteceu 2x: nas tabelas de diagnóstico por EAN (título completo do grupo, ex: "NCM 84249010 + CST 00 + Origem 2 — ...") e na tabela `cst_saida` (título original "cst_saida — direto da planilha, por EAN (sem conferência cruzada)"). Correção aplicada nos 2 casos: imprimir o texto longo 1 vez como texto simples (`console.print`) ANTES do widget, e dar ao widget um título curto e fixo (`Provável causador`, `EANs suspeitos`, `Sem causador claro`, `Detalhe UF-a-UF`, `cst_saida (sem conferência cruzada)`). `Panel`, ao contrário de `Table`, sempre estica pra largura total do console — por isso não sofre desse bug.
3. **Borda do `Panel` colada no conteúdo (sem quebra de linha visível)**: reproduzido em 3+ prints reais do terminal MINGW64/Git Bash de Matheus, sempre em `Panel`, nunca em `Table`. Causa: `Panel` sempre estica pra largura TOTAL detectada do console (via `shutil.get_terminal_size`) — quando essa largura bate exatamente com a largura real do terminal do usuário, o próprio terminal (não o Rich) quebra a linha sem emitir `\n`, colando a borda no texto seguinte. Corrigido criando o `Console` com 1 coluna de margem abaixo da largura detectada (`_console_com_margem()`, função duplicada em cada módulo — ver [[Estrutura de Pastas de um Mundo]] pra convenção de não importar utilitário pequeno entre módulos de preenchimento).

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]
- [[Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria]]
- [[Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas]]
- [[Duvida - Tabelas de Grupo Rejeitado do PIS-COFINS por NCM+CST Ainda Sem Validacao com Dado Real]]
