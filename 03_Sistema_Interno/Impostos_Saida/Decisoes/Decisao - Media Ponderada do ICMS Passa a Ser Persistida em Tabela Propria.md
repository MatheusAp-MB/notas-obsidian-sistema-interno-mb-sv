---
tipo: decisao
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 19:09
relacionado: [Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica, Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado, Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Nomenclatura das Tabelas de Impostos de Saida Segue Padrao Explicito com Prefixo Saida e Chave Completa no Nome]
---

# Decisão: Média Ponderada do ICMS Passa a Ser Persistida em Tabela Própria (1 Linha por NCM+CST+Origem)

**Resumo**: Fecha o ponto que tinha ficado em aberto em [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]] — onde persistir a média ponderada do ICMS. Resolvido a partir do mockup funcional da tela ([[Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado]]): a média vira uma tabela própria, 1 linha por grupo `(ncm, cst, origem)` — não um campo redundante nas 27 linhas de `IcmsNcmUf`.

> [!success] Confirmada — 13/09/2026, 18:48
> "confirmo" — decisão tomada a partir da constatação de que o próprio mockup aprovado já trata a média como 1 valor por grupo, nunca repetido por UF.

## Como chegamos nisso

Matheus propôs pensar o agrupamento visualmente antes de decidir o código ("se definirmos como deve ser agrupado visualmente, nós descobrimos como deve ser salvo em código"). Nos 2 mockups da tela (estático e funcional), cada grupo `(ncm, origem, cst)` carrega **1 único** campo de média — a coluna "Média Ponderada" aparece 1 vez por linha de grupo, nunca uma vez por UF. Essa é a evidência que fechou a dúvida: a média é uma propriedade do grupo inteiro, não de cada UF individualmente, e por isso pertence a uma tabela com a mesma granularidade do grupo (não a `IcmsNcmUf`, que é 1 linha por UF).

## O que muda tecnicamente

- Nova tabela (nome ainda não decidido, ex: `IcmsNcmMedia`), com `unique_together = ['ncm', 'cst', 'origem_mercadoria_cadastro']` — mesma chave do grupo, sem `uf`.
- Ponto de gravação natural: dentro do laço que já existe em `PersistidorIcmsNcm.processar(aceitos)` — o mesmo `valores_por_uf` que já está em memória ali (`aceitos[(ncm,cst,origem)]`) é exatamente o formato que `calcular_media_ponderada(valores_por_uf)` espera. Chamar a função 1 vez por grupo, antes de espalhar nas até 27 linhas de `IcmsNcmUf`, e persistir o resultado na tabela nova.
- `preencher_impostos_saida` (Camada 4, depois da reestruturação em 4 passos) deixa de recalcular `calcular_media_ponderada()` reconstruindo o dicionário a partir das 27 linhas — passa a ler direto da tabela nova.
- A tela de ICMS por NCM (`exibicao_icms_por_ncm.py`) também passa a ler a média da tabela nova em vez de recalcular em tempo real toda vez que a matriz é montada.

## O que isso substitui

O model `IcmsNcmUf` documenta hoje, como decisão anterior, que a Média Ponderada "nunca deveria ser gravada em lugar nenhum — sempre calculada em tempo real, pra nunca ficar desatualizada" (mesma decisão citada em [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]], que já tinha aceitado conscientemente o `Produto.icms_saida_media` como um cache). Essa decisão nova estende o mesmo raciocínio: a média vira persistida (não mais recalculada a cada leitura), mas sempre reescrita do zero a cada rodada de `importar_icms_por_ncm` — nunca comparada com o valor antigo, mesmo padrão de sobrescrita sem comparação que `IcmsNcmUf` já usa.

## O que ainda falta (implementação, não decisão)

- ~~Nome definitivo da tabela nova~~ — **resolvido em 13/09, 19:09**: `IcmsSaidaMediaPorNcmCstOrigem`. Ver [[Decisao - Nomenclatura das Tabelas de Impostos de Saida Segue Padrao Explicito com Prefixo Saida e Chave Completa no Nome]].
- Migration (por conta de Matheus, como sempre) — vira Etapa 1 do roteiro de execução em 9 etapas (mesma nota acima).
- Nenhum código foi escrito ainda — isso é decisão de arquitetura, ainda em Planejar.

## Relacionado

- [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]]
- [[Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado]]
- [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Nomenclatura das Tabelas de Impostos de Saida Segue Padrao Explicito com Prefixo Saida e Chave Completa no Nome]]
