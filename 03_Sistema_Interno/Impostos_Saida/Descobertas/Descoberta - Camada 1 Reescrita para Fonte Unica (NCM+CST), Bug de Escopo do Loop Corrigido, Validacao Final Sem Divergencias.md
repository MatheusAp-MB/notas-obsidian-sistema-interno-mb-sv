---
tipo: descoberta
dominio: python
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 23:53
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha, Descoberta - Campo Cst Saida Criado e Tela de Detalhes do Produto Passa a Exibir os 5 Campos Fiscais de Saida, Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF, Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST, Descoberta - Tabela e Tela de PIS-COFINS por NCM+CST Implementadas e Validadas com Volume Real]
---

# Descoberta: Camada 1 Reescrita para Fonte Única (NCM+CST), Bug de Escopo do Loop Corrigido, Validação Final Sem Divergências

**Resumo**: Fecha a Camada 1 do plano de 6 camadas — os 4 campos fiscais de saída do `Produto` (`icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`) deixam de vir direto da planilha Busca Legal e passam a ser alimentados pelas tabelas normalizadas `IcmsNcmUf`/`PisCofinsNcmCst` (fonte única, por NCM+CST) — decisão já registrada em [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]]. No meio do caminho, a ferramenta de validação criada pra conferir o resultado (`validar_impostos_saida.py`) revelou um bug real de arquitetura (escopo do loop), que foi diagnosticado, corrigido e revalidado até zero divergências nas 2 empresas. Isso também resolve, por consequência, a Camada 2 do plano ("garantir que os 4 campos existentes estão válidos").

> [!success] Confirmada — 12/09/2026, 23:53
> Reescrita implementada, bug de escopo descoberto e corrigido, e validação final rodada nas 2 empresas: `validar_impostos_saida.py` reporta zero divergências tanto na MAGAZINE quanto na SAMVALE.

## A reescrita (Camada 1)

Antes: os 4 campos vinham direto da planilha Busca Legal, linha a linha, sem checagem nenhuma contra as tabelas normalizadas (que já existiam e já estavam validadas com volume real — ver [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]] e [[Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST]]).

Depois: `cst_saida` continua vindo direto da planilha, por EAN — mas passa a servir só de **agrupador** (chave de busca), não mais de valor final. Os outros 4 campos são calculados na hora, por NCM (+CST pro PIS/COFINS):

- `icms_saida_sp` — busca em `IcmsNcmUf` por NCM + UF=SP.
- `icms_saida_media` — reaproveita `calcular_media_ponderada()` (já existia em `exibicao_icms_por_ncm.py`), sem duplicar a fórmula.
- `pis_percentual`/`cofins_percentual` — buscam em `PisCofinsNcmCst` por NCM+CST. Quando o grupo bate mas os valores estão genuinamente em branco (produto monofásico, convenção já documentada no model), grava `0` — é dado validado, não ausência de dado.
- Regra de sempre: sem dado validado, o campo mantém o valor antigo (o `setattr` só roda quando existe substituto validado).

## 2 problemas técnicos resolvidos antes do primeiro teste real

**Import circular.** `_calcular_campos_por_tabela()` precisa de `calcular_media_ponderada()`, que mora em `exibicao_icms_por_ncm.py` — mas esse módulo importa de `importacao_icms_ncm.py`, que por sua vez importa de volta de `preenchimento_impostos_saida.py`. Um import no topo do arquivo fecharia o ciclo. Resolvido com import local, dentro da própria função. Testado de verdade (não só revisão de código): `django.setup()` + a cadeia de imports real, sem erro.

**Formato do NCM divergente entre as 2 fontes.** `Produto.ncm` vem do ERP via `ConversorCelulaExcel.para_texto()`, que faz só `str(valor).strip()` — não limpa um `.0` residual quando o Excel converteu o código pra número. Já o NCM gravado em `IcmsNcmUf`/`PisCofinsNcmCst` vem de um normalizador mais estrito, que sempre limpa. Isso criava risco de falha silenciosa (NCM `8471.0` no Produto nunca bater com `8471` na tabela). Por instrução explícita do Matheus — "normalize ambos os lados na hora de gravar, não deixe margem para falhas silenciosas" — resolvido normalizando os 2 lados no momento da busca (`_normalizar_chave_para_busca`, aplicada tanto ao carregar as tabelas quanto ao ler `produto.ncm`/`produto.cst_saida`). Testado com dado sintético reproduzindo o caso exato (`'8471.0'` batendo contra `'8471'`).

## A ferramenta de validação: `validar_impostos_saida.py`

Depois de rodar o comando de verdade nas 2 empresas, surgiu a pergunta natural: dá pra confiar que o dado gravado está certo, ou precisa de uma conferência à parte? Resposta: sim, precisa — e não dava pra confiar só no fato do comando ter rodado sem erro.

Script standalone, no mesmo padrão do `teste04.py` (não commitado, só leitura, `django.setup()` manual). Em vez de duplicar a lógica de cálculo, reaproveita direto `ImportadorImpostosSaida._calcular_campos_por_tabela()` — a mesma função que o comando de produção usa — e compara o que ela diria hoje contra o que está de fato gravado em cada `Produto`. Separa 2 relatórios:

- **Mismatches**: campo gravado ≠ campo que a tabela diria agora.
- **Motivos de "sem dado"**: categorizados (`sem_ncm`, `ncm_rejeitado_icms`, `ncm_nunca_importado_icms`, `sem_cst`, `ncm_cst_rejeitado_pis_cofins`, `ncm_cst_nunca_importado_pis_cofins`) — pra separar o que é gap de cadastro (Financeiro/Contabilidade) do que seria bug de código.

## A 1ª rodada revelou um buraco real

Primeiro resultado: MAGAZINE 84 mismatches (de 81 "sem_cst"), SAMVALE 17 mismatches (de 119 "sem_cst") — sempre com o valor gravado em `0.00`. Aritmética batendo exato: `sem_cst` era sempre igual a `total_produtos − atualizados`.

## Descartando dado desatualizado (teste do próprio Matheus)

Antes de suspeitar de arquitetura, Matheus testou a hipótese mais simples: dado desatualizado. Rodou a pipeline inteira, ponta a ponta, nas 2 empresas (`iniciar_banco` → `buscar_mlbs` → `buscar_detalhes` → `popular_banco` → `sincronizar_impostos_entrada` → `calcular_todas_as_grades_precificacao`), depois refez os impostos de saída e rodou `validar_impostos_saida.py` de novo.

Resultado: os números **pioraram**, não melhoraram (MAGAZINE 84→102 mismatches / 81→99 sem_cst; SAMVALE 17→22 / 119→218). Prova matemática de que era arquitetura, não desatualização — dado mais fresco só aumentou o catálogo em escopo, mantendo a mesma proporção de "sem dado".

## Causa raiz: a "lista de presença"

`processar_planilha()` (nome antigo) só olhava produtos que tinham linha na planilha Busca Legal — fazia sentido enquanto os 4 campos eram cópia literal das colunas da planilha (sem linha, sem dado, ponto final). Deixou de fazer sentido quando os campos passaram a vir de NCM+CST: um produto pode ter `ncm`/`cst_saida` já gravados de uma rodada anterior e nunca mais aparecer na planilha atual — mas mesmo assim tem tudo que precisa pra buscar o dado correto nas tabelas normalizadas.

Explicado a Matheus com a analogia da lista de presença — se o NCM+CST vira o agrupador dos dados, um item que já possui os 2 já pode obter os valores corretos, esteja ou não na planilha desta rodada — confirmado por ele: "eu entendi e concordo... é isso né?"

## O fix: separar leitura de planilha e processamento

`processar_planilha()` foi dividido em 2 métodos:

- `carregar_cst_da_planilha()` — só lê a planilha e monta um dict `{ean: cst_saida}`. Não decide mais quem é processado.
- `processar_todos_os_produtos()` — percorre **todos** os `Produto` já carregados do banco (não só os que bateram com a planilha), usando o CST da planilha quando existe, ou o `cst_saida` já gravado no produto como fallback pra buscar PIS/COFINS.

## Resultado final — zero divergências

Depois do fix, `preencher_impostos_saida` rodou de novo nas 2 empresas: **MAGAZINE 753 atualizados, SAMVALE 607 atualizados** (bem mais que os 651/389 da 1ª rodada, exatamente porque agora cobre o catálogo inteiro, não só quem tinha linha na planilha). `validar_impostos_saida.py` reportou **"Nenhuma"** divergência nas 2 empresas — e os `motivos_sem_dado` remanescentes bateram numericamente idênticos aos de antes do fix, confirmando que são gaps reais de qualidade de dado (cadastro), não bug de código.

## O que isso fecha

- **Camada 1** do plano de 6 camadas: reescrita completa pra fonte única, sem falha silenciosa, validada nas 2 empresas.
- **Camada 2** (auditar se os 4 campos existentes estavam válidos): resolvida por consequência — a mesma validação exaustiva que confirma a Camada 1 é exatamente essa auditoria.

## O que ainda falta (fora do escopo de desenvolvimento)

Seguem como responsabilidade do Financeiro/Contabilidade, não do dev: os NCMs já rejeitados por divergência nos imports tratados (MAGAZINE: `84137080`, `84243010`, `84244100`, `84248229`, `84249010`, `90211010`; SAMVALE: `95066200`, `90192020`), os 9 EANs da SAMVALE sem produto correspondente, e a anomalia do CST gravado como texto `--` — que já tinha aparecido no NCM `38249010` (ver [[Descoberta - Tabela e Tela de PIS-COFINS por NCM+CST Implementadas e Validadas com Volume Real]]) e reaparece agora num NCM diferente, `94051190` (EAN `7899452002075`) — reforçando que é padrão de cadastro, não caso isolado.

## Nota sobre sincronização

O clone de referência do repositório (uso read-only, só sincroniza no comando explícito "sincronize") está parado no commit `726048c`, que cobre a reescrita da Camada 1 (fonte única) mas é **anterior** ao fix de reestruturação do loop. Esse último fix foi aplicado por Matheus localmente e confirmado só pela saída do relatório batendo (753/607 atualizados, "Nenhuma" divergência) — não por um novo `git pull`/diff byte a byte. Vale conferir isso numa próxima sincronização.

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]]
- [[Descoberta - Campo Cst Saida Criado e Tela de Detalhes do Produto Passa a Exibir os 5 Campos Fiscais de Saida]]
- [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]]
- [[Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST]]
- [[Descoberta - Tabela e Tela de PIS-COFINS por NCM+CST Implementadas e Validadas com Volume Real]]
