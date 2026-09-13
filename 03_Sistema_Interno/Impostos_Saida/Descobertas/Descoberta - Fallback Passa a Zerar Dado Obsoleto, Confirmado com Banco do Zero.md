---
tipo: descoberta
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 02:43
relacionado: [Descoberta - Camada 1 Reescrita para Fonte Unica (NCM+CST), Bug de Escopo do Loop Corrigido, Validacao Final Sem Divergencias, Descoberta - Explicacao Didatica do Resultado Final de Impostos de Saida para Financeiro e Superior, Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]
---

# Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero

## O problema: "manter o valor antigo" escondia lixo da 1ª versão

Depois de fechar a Camada 1 reescrita (ver [[Descoberta - Camada 1 Reescrita para Fonte Unica (NCM+CST), Bug de Escopo do Loop Corrigido, Validacao Final Sem Divergencias]]), Matheus revisitou a regra de fallback original — "sem dado validado, mantém o valor antigo" — e apontou um problema real: os 4 campos recalculados (`icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`) tinham dado da 1ª versão do sistema, gravado direto da planilha sem nenhuma checagem cruzada por NCM. Um valor desses podia estar errado e ser indistinguível de um valor recém-validado, só de olhar o campo.

## As 2 alternativas descartadas

**"Dropar a tabela e recriar do zero"** — pedido inicial de Matheus. Não existe uma tabela separada pra isso: os 4 campos vivem como colunas dentro do `Produto` (tabela compartilhada com todo o resto do produto — nome, preço, dimensões etc.), então não tem uma tabela "de impostos de saída" isolada pra dropar sem apagar produto junto.

**Zerar direto os 4 campos quando não validados nesta rodada** — 1ª proposta de correção. Matheus rejeitou com 2 cenários concretos e bem fundamentados:
1. Se 1000 EANs já estão validados e uma importação futura da planilha trouxer só 300, os outros 700 perderiam o dado validado que já tinham.
2. Se 1000 EANs já validados e uma rodada futura mexer em 200 deles, sendo 100 inconsistentes, o sistema manteria só 1800 corretos em vez dos 1900 que já eram válidos.

## A prova que resolveu a objeção: as tabelas normalizadas nunca regridem

Fomos direto no código de persistência pra confirmar ou refutar os 2 cenários, em vez de assumir:

- `PersistidorIcmsNcm.processar(aceitos)` (em `importacao_icms_ncm.py`) só toca as chaves NCM+UF presentes no dicionário `aceitos` **desta rodada**. Tudo que foi rejeitado ou que não veio na planilha desta vez fica intocado — nunca é apagado, nunca é sobrescrito com dado ruim ou ausente.
- `PersistidorPisCofinsNcmCst.processar(aceitos)` segue o mesmo padrão, por chave NCM+CST.

Isso prova que um produto que já encontrou dado validado numa rodada **sempre vai continuar encontrando** nas rodadas seguintes, não importa o que aconteça com outros produtos em rodadas futuras — refutando os 2 cenários de Matheus. A partir dessa prova, ele confirmou: "vamos tentar da forma 01" (corrigir só a regra de fallback, sem comando de reset separado).

## A decisão: regra assimétrica

- **`cst_saida`**: continua 2 vias (`validado_nesta_rodada` / `mantido`) — nunca teve o problema de "legado pré-validação", porque sempre veio direto da planilha por EAN, sem cálculo cruzado.
- **Os outros 4 campos** (`icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`): passam a ter 3 vias:
  - `validado` — achou dado validado nesta rodada, grava o valor novo.
  - `limpo_por_obsoleto` — tinha algum valor (não era `None`), não achou mais dado validado nesta rodada → **grava `None`** (limpa de propósito, em vez de manter o valor antigo possivelmente errado).
  - `sem_dado_desde_sempre` — já não tinha valor (`None`), continua sem — nada a fazer.

Implementado em `preenchimento_impostos_saida.py` (`processar_todos_os_produtos` reescrito com os 3 contadores por campo, `relatorio()` também reescrito pra reportar as 3 vias).

## Bug real encontrado no caminho: `IntegrityError` ao gravar `None`

Primeira tentativa de rodar o código novo quebrou nas 2 empresas:

```
django.db.utils.IntegrityError: (1048, "Column 'pis_percentual'/'icms_saida_sp' cannot be null")
```

Causa raiz: os 4 campos eram `models.DecimalField(max_digits=6, decimal_places=2, default=0)` — **NOT NULL** no banco desde sempre (só `cst_saida` já era `null=True`). A suposição de que "vazio" significava nulo estava errada — significava "0 por padrão", nunca `NULL` de verdade.

Corrigido com uma migration adicionando `null=True, blank=True` aos 4 campos (mantendo `default=0` intocado — decisão separada, sobre o valor de produto novo vindo do ERP). Conferido por grep, antes de aplicar, que todo consumidor downstream (as 6 fórmulas de precificação, `calculo_margem.py`, `produtos/admin.py`, telas de contexto/filtro) já tolera `None` com segurança (padrão `produto.icms_saida_media or Decimal('0')` já usado em todo lugar).

## A anomalia que apareceu depois do fix — e por que não era bug

Depois da migration aplicada e do pipeline rodado de novo, a MAGAZINE e a SAMVALE mostraram um padrão de contadores completamente invertido:

| Campo | MAGAZINE (rodada intermediária) | SAMVALE (rodada intermediária) |
|---|---|---|
| icms_saida_sp | 582 validado / **0** limpo / **777** sem-dado | 569 validado / **162** limpo / **0** sem-dado |
| icms_saida_media | 578 / **0** / **781** | 569 / **162** / **0** |
| pis/cofins | 647 / **0** / **712** | 389 / **342** / **0** |

Como os 4 campos nunca puderam ter `None` de verdade antes dessa migration (sempre `NOT NULL`, `default=0`), o esperado numa 1ª rodada de verdade era o **mesmo padrão** nas 2 empresas — maioria em `limpo_por_obsoleto`, zero em `sem_dado_desde_sempre` — porque não existia produto com dado genuinamente ausente antes disso.

Investigação (multi-banco confirmado via `core/database_router.py` — MAGAZINE e SAMVALE são bancos MySQL fisicamente separados, mesmo servidor, roteados por `EmpresaRouter`) descartou timing de migration como causa (os 2 bancos já estavam com o schema corrigido antes da rodada em questão). A explicação real: a MAGAZINE já tinha passado pela lógica de limpeza numa rodada anterior (migration da MAGAZINE foi aplicada primeiro, testada separadamente), então na rodada "final" que gerou a tabela acima ela já estava com os 777/781/712 produtos genuinamente em `None` — por isso apareciam como `sem_dado_desde_sempre` (já sem dado) em vez de `limpo_por_obsoleto` (acabou de ser limpo). A SAMVALE, migrada por último, mostrava a mesma rodada pela 1ª vez — daí o padrão oposto. Confirmado por consulta direta ao banco (`icms_saida_sp__isnull=True` batendo exato com os 777 da MAGAZINE, e `icms_saida_sp=0` em **zero** produtos — ninguém ficou com o valor antigo de fábrica).

## Confirmação definitiva: banco recriado do zero absoluto

Pra eliminar de vez qualquer dúvida de histórico de execução acumulado, Matheus recriou os 2 bancos inteiros (`DROP DATABASE` + `CREATE DATABASE` nas 2 empresas) e repopulou tudo do zero, na ordem completa: `migrate` → `iniciar_banco` → `buscar_mlbs` → `buscar_detalhes` → `popular_banco` → `sincronizar_impostos_entrada` → `importar_icms_por_ncm` → `importar_pis_cofins_por_ncm_cst` → `preencher_impostos_saida` → `calcular_todas_as_grades_precificacao`, pras 2 empresas, em sequência (13/09/2026, madrugada).

Resultado — agora as 2 empresas batem no mesmo padrão esperado, `sem_dado_desde_sempre` zerado nas 2:

| Campo | MAGAZINE (do zero absoluto) | SAMVALE (do zero absoluto) |
|---|---|---|
| icms_saida_sp | 582 validado / **776** limpo / **0** sem-dado | 569 / **162** / **0** |
| icms_saida_media | 578 / **780** / **0** | 569 / **162** / **0** |
| pis/cofins | 647 / **711** / **0** | 389 / **342** / **0** |

Totais reconciliam exatos nas 2 empresas (582+776=1358, 569+162=731, etc.) — confirma que **todo** produto do catálogo está ou com valor recém-validado, ou com `None` explícito (nunca mais um valor antigo/0 de fábrica escondido). `cst_saida`: MAGAZINE 651/707, SAMVALE 389/342 (catálogo da MAGAZINE veio com 1358 produtos nessa sincronização, 1 a menos que a rodada anterior — variação normal de resync ao vivo do ERP, não relacionada a esta lógica).

## Fechamento formal: `validar_impostos_saida.py` confirma 0 divergências no estado do zero absoluto

Rodado logo em seguida, sobre esse mesmo estado 100% virgem:

- **MAGAZINE**: 1358 produtos verificados — **0 divergências**. Motivos de "sem dado validado": `sem_ncm` 36, `ncm_rejeitado_icms` 502, `ncm_nunca_importado_icms` 234, `sem_cst` 707, `ncm_cst_nunca_importado_pis_cofins` 4.
- **SAMVALE**: 731 produtos verificados — **0 divergências**. Motivos: `sem_ncm` 3, `ncm_rejeitado_icms` 38, `ncm_nunca_importado_icms` 121, `sem_cst` 342.

Números batem quase exatamente com a rodada anterior (variação de 1 unidade em `sem_ncm`/`sem_cst` da MAGAZINE, coerente com a diferença de 1 produto no resync do ERP já registrada acima) — todos os gaps restantes seguem sendo responsabilidade do cadastro fiscal de origem (Financeiro/Contabilidade), não do sistema.

## Conclusão

O código estava correto desde a implementação da regra assimétrica — a "anomalia" nunca foi bug, era histórico de execução diferente entre as 2 empresas (MAGAZINE rodada 2x antes de a SAMVALE ser migrada, gerando contadores que pareciam conflitantes mas eram consistentes com o próprio histórico de cada banco). O teste do zero absoluto remove essa ambiguidade de vez, e a validação formal (`validar_impostos_saida.py`, 0 divergências nas 2 empresas) fecha a Camada 1 reescrita + a regra de fallback nova com prova completa: mesmo padrão, mesma lógica, nas 2 empresas, dado nenhum da 1ª versão pré-validação sobrevive escondido.

## Revisão de nomenclatura (13/09, 02:43): nome não pode afirmar o que o código não prova

Depois do fechamento formal acima, Matheus notou um problema nos nomes dos contadores e do relatório de `preenchimento_impostos_saida.py`: **`sem_dado_desde_sempre` afirmava uma coisa que o código não tem como saber**. O campo só sabe que está `None` *agora* — não tem como provar se aquele produto já teve um valor validado numa rodada anterior e foi legitimamente limpo depois. A própria seção "A anomalia que apareceu depois do fix", acima, é a prova disso: boa parte dos produtos que uma rodada reportava como `sem_dado_desde_sempre` eram, na rodada anterior, exatamente os mesmos que tinham acabado de passar por `limpo_por_obsoleto`. O nome "desde sempre" contava um histórico que os dados não sustentam.

Segundo problema, apontado na mesma revisão: `cst_saida` e os outros 4 campos usavam a mesma palavra — "validado" — pra descrever garantias diferentes. `cst_saida` vem direto da planilha por EAN, sem nenhuma conferência cruzada entre produtos. Os outros 4 vêm das tabelas normalizadas, onde todo produto com o mesmo NCM (ou NCM+CST) precisa concordar no mesmo valor antes de o dado ser aceito. Usar "validado" pros dois sugeria o mesmo nível de confiança — não é o caso.

**Instrução de Matheus**: não corrigir só o nome sinalizado — repensar o esquema inteiro, campo por campo, pelo que cada contador realmente representa.

### Nomes antigos → novos

| Campo | Antes | Depois | Por que mudou |
|---|---|---|---|
| `cst_saida` | `cst_de_planilha` | `cst_atualizado_pela_planilha` | Descreve a ação desta rodada (a planilha trouxe uma atualização), não uma alegação de qualidade do dado |
| `cst_saida` | `cst_mantido` | `cst_sem_atualizacao_na_planilha` | Descreve o fato observável (não veio linha nova pra esse EAN nesta rodada) — sem a palavra "mantido", que sugeria uma garantia que esse campo nunca teve |
| `icms_saida_sp` / `icms_saida_media` / `pis_percentual` / `cofins_percentual` | `*_validado` | `*_validado` (sem mudança) | Continua correto — esses 3 campos passam mesmo por conferência cruzada entre produtos do mesmo NCM/NCM+CST |
| `icms_saida_sp` / `icms_saida_media` / `pis_percentual` / `cofins_percentual` | `*_limpo_por_obsoleto` | `*_zerado_nesta_rodada` | Descreve só o que aconteceu nesta execução (o campo foi zerado agora) — sem a palavra "obsoleto", que era uma inferência não provada sobre o valor anterior |
| `icms_saida_sp` / `icms_saida_media` / `pis_percentual` / `cofins_percentual` | `*_sem_dado_desde_sempre` | `*_continua_vazio` | Descreve só o estado observável (já estava vazio, continua vazio) — sem afirmar "desde sempre", que o código não tem como provar |

Diff aplicado em `impostos/funcoes_auxiliares/preenchimento_impostos_saida.py` (contadores no `__init__`, incrementos em `processar_todos_os_produtos()`, textos em `relatorio()`). Reexecutado nas 2 empresas (`preencher_impostos_saida --empresa=MAGAZINE`/`--empresa=SAMVALE`) e revalidado com `validar_impostos_saida.py`: todos os números idênticos à rodada anterior (753/607 atualizados, `cst_saida` 651/707 e 389/342, os 3 campos recalculados 582/0/776, 578/0/780, 647/0/711 na MAGAZINE e 569/0/162, 569/0/162, 389/0/342 na SAMVALE, 1358/731 verificados, **0 divergências** nas 2 empresas) — confirmando que a renomeação foi puramente cosmética, sem nenhuma mudança de comportamento.
