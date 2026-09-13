---
tipo: decisao
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 21:12
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir, Sistema Interno V2 Sera a Fonte da Verdade - Papel, Motivo e Limitacao de Cada Fonte de Precificacao, Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST, Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF, Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado, Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]
---

# Decisão: Campos Fiscais de Saída no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Única), Não Mais Direto da Planilha

**Resumo**: Aplicando ao fluxo de saída o mesmo princípio já usado no fluxo de entrada (ver [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]) e na precificação como um todo (ver [[Sistema Interno V2 Sera a Fonte da Verdade - Papel, Motivo e Limitacao de Cada Fonte de Precificacao]]): agora que `IcmsNcmUf` e `PisCofinsNcmCst` existem e estão validadas (rejeitam e informam qualquer divergência na importação), elas viram a **fonte única de verdade** pros campos fiscais de saída do `Produto`. Esses campos deixam de ser alimentados direto da planilha Busca Legal sem checagem nenhuma, e passam a ser alimentados a partir das tabelas normalizadas. Os 4 campos que já existem continuam existindo exatamente como estão — a mudança é só de onde vem o valor gravado neles — e um campo novo, `cst_saida`, é criado.

> [!success] Confirmada — 12/09/2026, 21:12
> Decisão tomada por Matheus ao longo da sessão: mantém os campos no `Produto` (não remove nenhum), cria `cst_saida`, e define a origem nova de cada campo.

## Por que

`preencher_impostos_saida` (Camada 1) grava os 4 campos direto da planilha, por EAN, **sem nenhuma checagem de divergência** entre EANs do mesmo NCM (ou NCM+CST). `IcmsNcmUf` e `PisCofinsNcmCst` já fazem exatamente essa checagem na própria importação (rejeitam e informam o grupo inteiro quando diverge). Faz sentido os campos do `Produto` passarem a beber dessas tabelas, em vez de repetir sem validação o mesmo caminho que elas já substituíram.

## Novo campo: `cst_saida`

Vai existir no `Produto`, mesmo padrão dos campos de impostos de entrada (cada produto com seus campos fiscais detalhados) — os impostos de saída também passam a ter campos detalhados, com tudo o que já se tem, e CST é um deles. Alimentado **direto da planilha Busca Legal, por EAN** — a fonte dele não muda, porque não existe (nem faz sentido existir) uma tabela normalizada só de CST: ele é o dado que serve de chave de busca dentro de `PisCofinsNcmCst`, não produto de uma tabela.

Isso dá forma concreta à Camada 3 do plano original (ver [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]): "CST de saída é o único campo básico identificado até agora que falta criar."

## Origem de cada campo, depois da mudança

| Campo | Origem antiga | Origem nova |
|---|---|---|
| `cst_saida` (novo) | não existia | Planilha Busca Legal, direto por EAN |
| `pis_percentual` | Planilha, direto por EAN | `PisCofinsNcmCst`, busca por (`Produto.ncm`, `Produto.cst_saida`) |
| `cofins_percentual` | Planilha, direto por EAN | `PisCofinsNcmCst`, busca por (`Produto.ncm`, `Produto.cst_saida`) |
| `icms_saida_sp` | Planilha, direto por EAN | `IcmsNcmUf`, busca por (`Produto.ncm`, `uf='SP'`) |
| `icms_saida_media` | Planilha (coluna "ICMS MÉDIA", cópia crua) | `calcular_media_ponderada()` — já existe em `impostos/funcoes_auxiliares/exibicao_icms_por_ncm.py` — calculada em cima das 27 linhas de `IcmsNcmUf` daquele NCM. Reaproveita a função existente, não duplica a fórmula |

Dependência de ordem: `cst_saida` precisa estar gravado antes (ou no mesmo passo) da busca de `pis_percentual`/`cofins_percentual`, já que é a chave usada na consulta.

## Regra de fallback: quando não existe dado validado

Se a busca na tabela normalizada não encontrar nada pro `Produto` (NCM ausente em `IcmsNcmUf`, ou combinação NCM+CST rejeitada/ausente em `PisCofinsNcmCst`) — **o campo mantém o valor antigo que já estava gravado, nunca limpa.** Decisão explícita de Matheus: nunca regredir um dado que já existe só porque a rodada atual não achou substituto validado.

## Ressalva registrada: `icms_saida_media` vira um cache, não um valor sempre-vivo

`impostos/models.py` já documenta, como decisão anterior, que a Média Ponderada **nunca deveria ser gravada em lugar nenhum** — sempre calculada em tempo real, "pra nunca ficar desatualizada" (é assim que a tela de ICMS por NCM funciona hoje). Ao copiar esse valor pra dentro de `Produto.icms_saida_media`, esse campo passa a ser um cache: correto no momento em que a Camada 1 rodar, mas pode ficar desatualizado se `IcmsNcmUf` for reimportada depois sem rodar a Camada 1 de novo. Aceito conscientemente por Matheus — é a mesma classe de risco que já existe hoje nos outros campos (comando manual, fora do pipeline automático, ver [[Descoberta - Comparacao Sistema Interno x Planilha We Stack no Calculo de Margem (Calcular Margem)]]), não um risco novo.

## O que isso resolve

Fecha a pendência de implementação registrada em [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]] ("o próprio campo passa a guardar o valor ponderado, mudando o que `preencher_impostos_saida` grava, ou é criado um campo novo separado?") — resposta: o campo (`icms_saida_media`) continua o mesmo, só passa a ser alimentado pelo cálculo já existente (`calcular_media_ponderada`), em vez do valor cru da planilha.

## O que ainda falta (implementação, não decisão)

Nada de código foi escrito ainda. A Camada 1 (`preencher_impostos_saida`) precisa ser reescrita pra implementar essa nova lógica de origem, e o campo `cst_saida` precisa ser criado no model (migration por conta de Matheus, como sempre).

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
- [[Sistema Interno V2 Sera a Fonte da Verdade - Papel, Motivo e Limitacao de Cada Fonte de Precificacao]]
- [[Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST]]
- [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]]
- [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
