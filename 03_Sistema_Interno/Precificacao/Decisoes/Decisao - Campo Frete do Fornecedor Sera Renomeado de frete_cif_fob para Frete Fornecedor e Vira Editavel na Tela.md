---
tipo: decisao
dominio: 
status: ativa
criado: 12/09/2026
atualizado_em: 12/09/2026 02:05
relacionado: [Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins, Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]
---

# Decisão: Campo Frete do Fornecedor Será Renomeado de `frete_cif_fob` para "Frete Fornecedor" e Vira Editável na Tela

**Resumo**: o campo `Produto.frete_cif_fob` (frete pago ao fornecedor/transportadora na entrada, já usado em `calcular_custo_final()` nos 6 marketplaces) vai ser renomeado para "Frete Fornecedor" e passa a ser editável diretamente pelo usuário na tela — hoje não tem interface de edição. O nome antigo `frete_cif_fob` deixa de existir.

> [!success] Ativa — 12/09/2026
> Decisão tomada por Matheus a partir da análise da planilha We Stack "refeita" (ver [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]).

## Contexto

A planilha "Cálculo final We Stack Doc refeita.xlsx" tem uma anotação na coluna do frete pago ao fornecedor dizendo que seria preciso "criar um campo novo no sistema (WE STACK e SISTEMA INTERNO V2)" pro usuário informar esse custo manualmente. Ao analisar, ficou confirmado que o campo já existe no Sistema Interno V2 — é o `Produto.frete_cif_fob`, já usado exatamente dessa forma (`custo_com_boni × frete_cif_fob%`) dentro de `calcular_custo_final()`, nos 6 marketplaces.

## O que levou à decisão

O campo existe e já é usado corretamente no cálculo, mas não tem uma interface de edição — o usuário não consegue hoje setar ou alterar esse valor pela tela. A parte real da lacuna identificada pela anotação da planilha não é a existência do campo, é a falta de edição via HTML.

## Decisão tomada

O campo será renomeado de `frete_cif_fob` para "Frete Fornecedor" (o nome antigo não sobrevive) e vai ganhar uma interface de edição direta na tela, pro usuário poder informar/alterar esse custo manualmente sem precisar de importação ou acesso ao admin.

## Relacionado

- [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
