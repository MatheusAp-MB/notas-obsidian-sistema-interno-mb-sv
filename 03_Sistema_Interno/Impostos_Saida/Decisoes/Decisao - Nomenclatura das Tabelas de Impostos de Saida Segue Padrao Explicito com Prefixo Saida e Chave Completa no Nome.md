---
tipo: decisao
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 19:09
relacionado: [Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica, Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria, Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado, Checkpoint - Inicio da Estrutura de Impostos de Saida]
---

# Decisão: Nomenclatura das Tabelas de Impostos de Saída Segue Padrão Explícito (Prefixo "Saída" + Chave Completa no Nome)

**Resumo**: Fecha o nome da tabela nova de média (deixado como "ainda não decidido" em [[Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria]]) e, junto, renomeia as 4 tabelas já existentes de impostos de saída — motivado por Matheus apontar que os nomes atuais estavam ambíguos. Junto disso, fecha também o roteiro de execução completo em 9 etapas.

> [!success] Confirmada — 13/09/2026, 19:09
> "eu quero a opção B para todas as 5 tabelas" — nomenclatura fechada pras 4 tabelas existentes e pra 1 nova, com o rename dos models mantido em etapa própria (Etapa 9), separada do rename dos comandos (Etapa 8) mesmo os 2 sendo só rename.

## Como chegamos nisso

Ao ser perguntado se `IcmsNcmMedia` (nome provisório usado em prosa) fechava como nome da tabela nova, Matheus respondeu que "os nomes das tabelas atuais estão muito ambíguos... os nomes tem que ser claros e auto explicativos" — ampliando o escopo pras 4 tabelas já em produção, não só a nova.

Confirmado no código antes de propor qualquer nome: no mesmo arquivo `impostos/models.py` já existe `ImpostosECustosXMLEntradaProduto` (linha 35, `related_name='impostos_entrada'`) — ou seja, "Entrada" já é um conceito nomeado nesse módulo. Ao lado dele, `IcmsNcmUf`, `PisCofinsNcmCst`, `IcmsNcmRejeitado` e `PisCofinsNcmCstRejeitado` não carregam "Saída" no nome da classe, só no `verbose_name` (que não aparece lendo o código Python). Além disso, `IcmsNcmUf` sugere chave `Ncm+Uf`, mas a chave real (`unique_together`) é `ncm+cst+origem_mercadoria_cadastro+uf` — 4 campos, só 2 aparecem no nome.

Apresentadas 2 opções de padrão: A (mínima, só acrescenta "Saída") e B (expõe também a chave completa no nome). Matheus escolheu a Opção B pras 5 tabelas.

## Nomes confirmados

| Nome atual | Nome novo | Chave (`unique_together`) |
|---|---|---|
| `IcmsNcmUf` | `IcmsSaidaPorNcmCstOrigemUf` | ncm, cst, origem_mercadoria_cadastro, uf |
| `PisCofinsNcmCst` | `PisCofinsSaidaPorNcmCst` | ncm, cst |
| `IcmsNcmRejeitado` | `IcmsSaidaPorNcmCstOrigemRejeitado` | ncm, cst, origem_mercadoria_cadastro |
| `PisCofinsNcmCstRejeitado` | `PisCofinsSaidaPorNcmCstRejeitado` | ncm, cst |
| *(nova)* `IcmsNcmMedia` (nome provisório) | `IcmsSaidaMediaPorNcmCstOrigem` | ncm, cst, origem_mercadoria_cadastro |

## O que muda tecnicamente — e quando

- A tabela nova (`IcmsSaidaMediaPorNcmCstOrigem`) já nasce com esse nome — sem pendência, entra direto na migration da Etapa 1 do roteiro abaixo.
- As 4 tabelas existentes estão em produção — renomear é refatoração pura de model (sem mudança de comportamento). Pela Regra dos Três/Disciplina de Refatoração, isso não pode vir misturado nas Etapas 1-7 (que mudam comportamento). Fica isolado na Etapa 9.
- Confirmado por Matheus: o banco é ambiente dev — não precisa preservar dado, pode derrubar as 4 tabelas e recriar já com o nome novo, sem precisar de `migrations.RenameModel` cirúrgico.
- Confirmado por Matheus: o rename dos 4 models (Etapa 9) fica separado do rename dos 3 comandos (Etapa 8, já cogitado em [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]]) — mesmo os 2 sendo "só nome, zero comportamento", ficam em etapas distintas.

## Roteiro de execução confirmado — 9 etapas

Cada etapa segue Idealizar+Planejar+confirmação explícita antes de Executar. Nenhum código foi escrito ainda pra nenhuma das 9.

1. Migration da tabela nova `IcmsSaidaMediaPorNcmCstOrigem`.
2. Comando novo `preencher_CST_produtos` — lê EAN+CST da planilha Busca Legal, grava só `Produto.cst_saida`.
3. `importar_icms_por_ncm`: (3a) CST passa a vir de `Produto.cst_saida` em vez de parsear a planilha; (3b) passa a persistir a média ponderada em `IcmsSaidaMediaPorNcmCstOrigem`, dentro do laço já existente em `PersistidorIcmsNcm.processar`.
4. `importar_pis_cofins_por_ncm_cst`: CST passa a vir de `Produto.cst_saida`, mesmo padrão da 3a.
5. `preencher_impostos_saida`: passa a ler a média direto de `IcmsSaidaMediaPorNcmCstOrigem`, sem recalcular — depende da etapa 3b já ter rodado de verdade (não só codada), pra não regredir dado.
6. Implementação real das telas (ICMS por NCM com Origem+CST, calculadora funcional) — mockups já aprovados em [[Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado]].
7. Comando alias novo `Sincronizar_Impostos_de_Saida`, orquestrando os 4 comandos na ordem 1→2→3→4 acima.
8. Renomear os 3 comandos (`importar_icms_por_ncm`, `importar_pis_cofins_por_ncm_cst`, `preencher_impostos_saida`) — nomes candidatos ainda cogitados, não fechados. Só depois das etapas 1-7 validadas.
9. Renomear as 4 tabelas existentes conforme a tabela acima — banco dev, pode recriar do zero em vez de `RenameModel` cirúrgico. Separada da Etapa 8. Só depois das etapas 1-7 validadas.

## Relacionado

- [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]]
- [[Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria]]
- [[Descoberta - Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
