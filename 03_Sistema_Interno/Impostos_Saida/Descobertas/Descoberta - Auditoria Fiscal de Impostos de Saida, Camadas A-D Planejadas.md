---
tipo: descoberta
dominio: 
status: em_andamento
criado: 13/09/2026
atualizado_em: 13/09/2026 03:42
relacionado: [Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero, Descoberta - Explicacao Didatica do Resultado Final de Impostos de Saida para Financeiro e Superior, Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST]
---

# Descoberta - Auditoria Fiscal de Impostos de Saida, Camadas A-D Planejadas

**Resumo**: Matheus foi conferir manualmente um produto (`F7908050719121.001`) e achou o ICMS de saída em branco, sem nenhuma forma de descobrir o motivo — nem tela, nem log. Investigação confirmou (com dado real, sem chute) que o motivo é uma rejeição por divergência já conhecida, mas revelou um problema maior: o sistema **calcula** o motivo de toda rejeição e depois **descarta**, sem gravar em lugar nenhum. Decidido construir uma camada de auditoria permanente, em 4 partes (Camadas A-D), com garantias explícitas contra dado sujo/desatualizado. Mockups de 2 das 4 telas já passaram por revisão e aprovação. Esta nota registra o desenho completo antes da execução começar.

## O que disparou isso

Matheus abriu o produto `F7908050719121.001` (EAN `7908050719121`, MAGAZINE) pra conferir os impostos de saída e viu `icms_saida_sp`/`icms_saida_media` em branco, com o NCM `84244100` aparentemente "não populado" — e nenhuma tela ou log explicando por quê.

## O motivo real, confirmado com dado do banco (não é chute)

Um script de diagnóstico read-only (reaproveitando `agrupar_icms_por_ncm`, sem gravar nada) confirmou:

- `cst_saida` = 20, `pis_percentual` = 1,65%, `cofins_percentual` = 7,60% — todos preenchidos, só o ICMS está bloqueado.
- NCM `84244100` diverge na UF **AC** entre 44 EANs que compartilham esse NCM: **42 EANs concordam em 5,60%**, mas **2 destoam em 8,80%** (`7891988006671`, `7896821500279`).
- `IcmsNcmUf` tem **0 linhas** pra esse NCM — confirma que o NCM inteiro foi rejeitado, nada gravado.

Também ficou registrado, olhando o código (`AgrupadorIcmsPorNcm._validar_ncm`), que a validação **para na primeira UF divergente que encontra** — não avalia as outras 26. Ou seja: mesmo corrigindo a UF AC, não dá pra garantir hoje que esse NCM não tem outra divergência escondida numa UF diferente.

## O problema sistêmico revelado

A informação "por que esse NCM foi rejeitado" já existe no código (`NcmRejeitado`/`GrupoRejeitado` montam o relatório certinho, com EANs e valores conflitantes) — mas só vive no `stdout`, no instante em que `importar_icms_por_ncm`/`importar_pis_cofins_por_ncm_cst` rodam. Nunca é gravada em tabela nenhuma. `validar_impostos_saida.py`, a única outra fonte que classifica motivo por produto, também não persiste nada e trunca em 15 exemplos por motivo (`MAXIMO_EXEMPLOS = 15`) — se um produto não estiver entre os 15 primeiros de seu motivo, nem ali ele aparece. Confirmado por leitura direta dos 2 arquivos de import: nenhuma transação (`transaction.atomic()`) envolve a gravação hoje, então uma falha no meio de um `bulk_create`/`bulk_update` já deixa o banco num estado parcial, mesmo sem nenhuma mudança nova.

## Decisão: construir uma camada de auditoria permanente, em 4 partes

- **Camada A** — Persistir os motivos de rejeição (hoje descartados) em 2 tabelas novas: `IcmsNcmRejeitado` (por NCM) e `PisCofinsNcmCstRejeitado` (por NCM+CST).
- **Camada B** — Extrair a lógica de classificação de motivo (hoje só dentro de `validar_impostos_saida.py`) pra 1 função reutilizável — nunca duplicada em 2 lugares.
- **Camada C** — Mostrar o motivo direto na tela de detalhes do Produto (aba Impostos), ao lado de qualquer campo fiscal em branco.
- **Camada D** — Tela própria de Auditoria Fiscal, listando todas as rejeições atuais sem truncar, pra revisão proativa — ninguém deveria precisar ir produto a produto pra descobrir o que está errado.

## As garantias exigidas por Matheus (eficiência e segurança contra dado sujo/desatualizado)

1. **Análise exaustiva, não para na 1ª divergência.** `_validar_ncm` (ICMS) e `_validar_grupo` (PIS/COFINS) precisam varrer todas as 27 UFs / os 2 campos (PIS e COFINS), coletando **todas** as divergências — não só a primeira. Isso não muda se o NCM é aceito ou rejeitado (qualquer divergência já rejeita o NCM inteiro); muda só a completude do que fica registrado sobre a rejeição.
2. **Substituição total a cada rodada nas tabelas de rejeição — nunca upsert incremental.** Diferente de `IcmsNcmUf`/`PisCofinsNcmCst` (que nunca apagam dado aceito), uma rejeição precisa **sumir** da tabela no instante em que deixa de existir de verdade — senão vira um "fantasma" contradizendo um NCM que já foi corrigido.
3. **Tudo numa única transação atômica** (apagar rejeitados antigos + gravar rejeitados novos + gravar aceitos) — impede que uma falha no meio do processo deixe aceito e rejeitado descombinando entre si.
4. **1 função de motivo só, nunca 2 versões da mesma lógica** (Camada B) — usada por `validar_impostos_saida.py`, pela tela de produto e por qualquer tela futura.
5. **A tela nunca lê a planilha Excel ao vivo** — só consulta as tabelas já persistidas. Garante eficiência (consulta indexada, não reprocessar a planilha a cada produto aberto) e consistência (o que a tela mostra sempre bate com o banco, nunca 2 verdades diferentes na mesma tela).
6. **`timezone.now()` real, capturado 1 vez por execução do comando** (não por NCM) — todo o "constatado em" de uma mesma rodada bate exato entre si. Projeto já roda com `TIME_ZONE = 'America/Sao_Paulo'` e `USE_TZ = True`, então a exibição sai correta sem conversão manual.

## Mockups — revisão e aprovação

**Camada C (tela de produto)** — mockup v1 reproduziu fielmente as classes/cores reais do sistema (`modal-card-cabecalho-icms-saida-sp`, etc.) usando o caso real do `F7908050719121.001`: badges por severidade (verde "validado" / cinza "cadastro incompleto" / laranja "cobertura pendente" / vermelho "rejeitado — divergência"), com detalhe completo (sem truncar em 3 exemplos) num `<details>` expansível. **Aprovado por Matheus sem ressalvas** — "útil e não polui a tela".

**Camada D (tela de Auditoria Fiscal) — v1 rejeitada.** Primeira versão tinha problemas reais de UX apontados por Matheus: cores demais competindo (reaproveitei laranja de "≥ 1 UF divergente" sem perceber que colidia com o significado já usado por `badge-atrasado`/`badge-coleta` no sistema real), 2 blocos sólidos de navy empilhados sem hierarquia, anotações de "ILUSTRATIVO" misturadas com o conteúdo real da tela, timestamp repetido em cada linha (redundante), badge "rejeitado" redundante quando o título da seção já dizia isso, tabela aninhada dentro de tabela dentro de linha. Lição gravada: a tela de auditoria é uma tela de **triagem** (responde "o que resolvo primeiro", diferente da tela de produto que responde "por que este produto"), então precisa ordenar por impacto (quantidade de produtos afetados) e não expor detalhe completo de tudo de cara — só do item mais relevante.

**Camada D — v2 aprovada (com ressalva).** Reconstruída com: 2 abas (ICMS por NCM / PIS-COFINS por NCM+CST, decisão explícita de Matheus, substituindo a versão empilhada), 1 timestamp único no topo (não repetido por linha), lista ordenada por impacto real (NCM `84244100`, 44 produtos afetados, aparece primeiro e já expandido com o dado real da UF AC), os NCMs sem detalhe extraído agrupados abaixo com nota honesta em vez de dado inventado, aba de PIS/COFINS em estado vazio (nenhum caso real conhecido ainda) em vez de exemplo fictício. Aprovada por Matheus: "ainda não sei se essa é a melhor opção, mas ficou utilizável... vamos aplicar ela" — aprovação para seguir, não veredito final de design.

## Mapa de execução — 7 etapas

1. **Corrigir a análise pra ser exaustiva** (`_validar_ncm`/`_validar_grupo`, ponto 1 das garantias) — pré-requisito de tudo, inclusive do dado que as telas vão mostrar.
2. **Modelos novos + migration** — `IcmsNcmRejeitado` e `PisCofinsNcmCstRejeitado`, com campo de impacto calculado (`qtd_produtos_afetados`) pra ordenar sem abrir o JSON.
3. **Persistência atômica, substituição total** — novo persistidor + `transaction.atomic()` envolvendo aceitos e rejeitados juntos.
4. **Função de motivo reutilizável** (Camada B) — extraída de `validar_impostos_saida.py`, reaproveitada por ele.
5. **Tela de produto** (Camada C) — estende `estrutura_parcial_painel_produto.html`, testado contra o `F7908050719121.001`.
6. **Tela de Auditoria Fiscal** (Camada D) — view + template + rota nova, testado contra o mockup v2.
7. **Validação ponta a ponta** — pipeline completa nas 2 empresas, as 2 telas conferidas juntas.

## Decisões em aberto antes de começar a Etapa 1

- A aba de PIS/COFINS entra implementada de verdade nesta rodada (mesmo sem nenhum caso real conhecido) ou só a estrutura de dados fica pronta, com a tela em estado vazio até aparecer o 1º caso real?
- Onde a tela de Auditoria Fiscal entra no menu lateral — item novo, ou dentro de algum grupo já existente (ex: junto com "ICMS por NCM")?
- Confirmação de que o JSON com a lista completa de EANs em conflito (sem truncar) não é problema de tamanho pro MySQL, mesmo em NCMs com centenas de EANs.

## Relacionado

- [[Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero]]
- [[Descoberta - Explicacao Didatica do Resultado Final de Impostos de Saida para Financeiro e Superior]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]
- [[Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST]]
