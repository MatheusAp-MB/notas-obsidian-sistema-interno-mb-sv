---
tipo: decisao
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 19:09
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha, Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria, Descoberta - Estrutura da Tela de Console de ICMS por NCM e Preencher Impostos de Saida, Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero, Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria, Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado, Decisao - Nomenclatura das Tabelas de Impostos de Saida Segue Padrao Explicito com Prefixo Saida e Chave Completa no Nome]
---

# Decisão: Fluxo de Impostos de Saída Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Próprio Como Fonte Única

**Resumo**: Motivado pela análise de responsabilidade única sobre `preencher_impostos_saida` (fazia validação + preparação + preenchimento ao mesmo tempo) e pela percepção de Matheus de que os 3 comandos atuais "brigam entre si" e não são auto-suficientes. O fluxo passa a ter 4 comandos independentes, cada um com responsabilidade única, orquestrados por um alias novo (`Sincronizar_Impostos_de_Saida`).

> [!success] Confirmada — 13/09/2026, 18:20
> "registre essa primeira decisão antes de seguirmos" — decisão tomada ao longo da sessão, cobrindo os 4 passos, a ordem entre eles, e o CST como fonte única em todo o pipeline (não só no `Produto` final).

## Os 4 passos

| # | Comando | Responsabilidade única |
|---|---|---|
| 1 | `preencher_CST_produtos` (novo) | Lê EAN + CST da planilha Busca Legal, grava só `Produto.cst_saida`. Nada de ICMS, nada de PIS/COFINS. |
| 2 | `importar_icms_por_ncm` | Agrupa e valida ICMS por NCM+CST+Origem, persiste `IcmsNcmUf` (e a média — ver ressalva abaixo, ainda não decidida). |
| 3 | `importar_pis_cofins_por_ncm_cst` | Agrupa e valida PIS/COFINS por NCM+CST, persiste `PisCofinsNcmCst`. |
| 4 | `preencher_impostos_saida` | Não lê a planilha nem valida nada — só lê `Produto` + as 2 tabelas de referência e espalha os valores nos 5 campos fiscais de saída. |

`Sincronizar_Impostos_de_Saida --empresa=` roda os 4 nessa ordem.

## Por que essa ordem

A única dependência real entre os 4 é: o passo 4 precisa que `Produto.cst_saida` já esteja gravado, porque é o que ele usa pra achar o grupo de referência certo (tanto ICMS quanto PIS/COFINS). Os passos 1, 2 e 3 não dependem uns dos outros — mantido 1→2→3 só por seguir a mesma sequência com que Matheus já vinha se referindo aos 3 comandos originais.

## Decisão central: CST como fonte única em TODO o pipeline, não só no Produto final

A decisão de 12/09 ([[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]]) já tinha estabelecido `IcmsNcmUf`/`PisCofinsNcmCst` como fonte única pros 4 campos finais do `Produto`, e o `cst_saida` como alimentado direto da planilha, por EAN. Essa decisão nova estende o mesmo princípio pra dentro das próprias camadas de importação: hoje, `importar_icms_por_ncm` e `importar_pis_cofins_por_ncm_cst` cada uma lê e normaliza o CST direto da própria linha da planilha, de forma independente e duplicada (`LinhaIcmsNcm.cst` e `LinhaPisCofinsNcmCst.cst`, mesma coluna `CST`, 2 parses separados — conferido no código).

A partir de agora, o CST usado no agrupamento das Camadas 2 e 3 (ICMS e PIS/COFINS) passa a vir de `Produto.cst_saida` — já gravado pelo passo 1 — em vez de ser reparseado da planilha por cada uma. Mesmo padrão que `origem_mercadoria_cadastro` já usa hoje na Camada 2 (busca em lote por EAN, direto do `Produto`, confirmado no código).

**Consequência prática**: a coluna `CST` da planilha Busca Legal passa a ser lida por um único lugar no sistema — o passo 1. Nenhum outro comando volta a tocar nela. Isso não contradiz a decisão de 12/09 (a origem última do `cst_saida` continua sendo a planilha) — só isola quem lê essa coluna e formaliza que os demais comandos consomem o valor já persistido, não fazem leitura própria.

## O que muda em cada comando, tecnicamente

- **`preencher_CST_produtos` (novo)**: recebe a responsabilidade que hoje está dentro de `preenchimento_impostos_saida.py` (método `carregar_cst_da_planilha`). Herda a regra de fallback já em vigor pro `cst_saida` (2 vias — validado/mantido, ver [[Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero]]): EAN fora da planilha desta rodada não tem o campo tocado.
- **`importar_icms_por_ncm`**: `LinhaIcmsNcm` deixa de parsear `cst` da própria linha da planilha — passa a receber via busca em lote por EAN em `Produto.cst_saida`, igual já acontece com `origem_mercadoria_cadastro`.
- **`importar_pis_cofins_por_ncm_cst`**: mesma mudança — `LinhaPisCofinsNcmCst.cst` passa a vir de `Produto.cst_saida`.
- **`preencher_impostos_saida`**: perde toda leitura de planilha (nem CST, nem nada) — passa a ler só `Produto` + `IcmsNcmUf` + `PisCofinsNcmCst`.

## O que NÃO muda

- A origem última do `cst_saida` continua sendo a planilha Busca Legal — só muda quem lê essa coluna (agora só o passo 1) e quem consome o valor já persistido (agora também as Camadas 2 e 3, além da 4).
- A regra de fallback do `cst_saida` (2 vias) não muda.

## O que ainda fica em aberto (fora desta decisão)

- ~~Onde a média ponderada do ICMS fica persistida~~ — **resolvido em 13/09, 18:48**: tabela própria, 1 linha por grupo NCM+CST+Origem. Ver [[Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria]].
- ~~Renomear os comandos (candidatos cogitados: `Preencher_tabela_referencia_ICMS_por_NCM`, `Preencher_tabela_referencia_PIS_COFINS_por_NCM_CST`)~~ — **enquadrado em 13/09, 19:09**: vira Etapa 8 do roteiro de execução em 9 etapas, separada da Etapa 9 (rename dos 4 models/tabelas) — os nomes candidatos continuam cogitados, não fechados. Ver [[Decisao - Nomenclatura das Tabelas de Impostos de Saida Segue Padrao Explicito com Prefixo Saida e Chave Completa no Nome]].
- Nenhum código foi escrito ainda — isso é só a decisão de arquitetura, ainda em Planejar.

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Campos Fiscais de Saida no Produto Passam a Ser Alimentados pelas Tabelas Normalizadas (Fonte Unica), Nao Mais Direto da Planilha]]
- [[Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria]]
- [[Descoberta - Estrutura da Tela de Console de ICMS por NCM e Preencher Impostos de Saida]]
- [[Descoberta - Fallback Passa a Zerar Dado Obsoleto, Confirmado com Banco do Zero]]
- [[Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria]]
- [[Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado]]
- [[Decisao - Nomenclatura das Tabelas de Impostos de Saida Segue Padrao Explicito com Prefixo Saida e Chave Completa no Nome]]
