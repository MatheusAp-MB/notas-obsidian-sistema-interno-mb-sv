---
tipo: descoberta
dominio: 
status: confirmada
criado: 10/09/2026
atualizado_em: 10/09/2026 08:20
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]
---

# Estrutura da Planilha Busca Legal de Impostos de Saída

**Resumo**: planilha auxiliar do Busca Legal, já completamente validada e liberada pro uso — 1 linha por produto (casada pelo EAN, o mesmo "Cód Barras" já cadastrado no sistema), com PIS/COFINS/CST fixos por produto e ICMS variando por UF de destino (27 colunas, 1 por estado) — a coluna "ICMS" isolada é a alíquota do estado de origem (SP) e "ICMS MÉDIA" é a média das outras 26 UFs, excluindo a própria origem. Quando um campo vem vazio, é porque o produto realmente não tem aquele imposto aplicável (ex: gasolina, regime monofásico) — nunca dado faltando.

> [!success] Confirmada — 10/09/2026
> Estrutura verificada com 2 planilhas de exemplo reais (1 produto isolado, depois 11 produtos) e validada matematicamente: `ICMS MÉDIA` bate exatamente com a média das 26 UFs excluindo SP nos 2 casos (ex: 1 produto com todas as 26 UFs em 1 dos valores testados soma 5,05 ÷ 26 = 0,19423076923076926 — o valor exato da planilha). Confirmado pelo usuário que a planilha já passou por validação completa e que campo vazio é dado real, não lacuna.

## Contexto

Impostos de saída (frente aberta em [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]) hoje não têm fonte de API — o Sysemp não fornece esse dado (ver [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]). A fonte passou a ser uma planilha auxiliar gerada pelo Busca Legal, já validada por quem precisava validar e liberada pro uso do projeto.

## O que a planilha tem

Aba única (`Plan1`), cabeçalho em 2 linhas (grupo na linha 1, coluna na linha 2), 1 linha por produto:

- **Bloco ENTRADA** (3 colunas): `Descrição do produto`, `Cód Barras`, `NCM`. `Cód Barras` é o mesmo EAN já cadastrado no sistema — é a chave de casamento entre a linha da planilha e o `Produto` do banco. Só identificação, nenhum dado fiscal de entrada aqui (impostos de entrada continuam vindo do fluxo já existente, ver [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]).
- **Bloco SAÍDA** (5 colunas): `PIS`, `COFINS`, `CST`, `ICMS`, `ICMS MÉDIA`.
  - `PIS`, `COFINS` e `CST` são fixos por produto — não variam por estado, porque são tributo federal/regime tributário, não estadual.
  - `ICMS` é a alíquota do estado de origem da empresa (SP) — confirmado nas 2 planilhas de exemplo: o valor de `ICMS` sempre bate exatamente com o valor da coluna `SP` do bloco seguinte.
  - `ICMS MÉDIA` é a média aritmética das outras 26 UFs (todo o bloco de destino, exceto SP) — confirmado batendo a conta exata nos 2 casos reais testados.
- **Bloco ICMS SAÍDA POR UF DE DESTINO** (27 colunas, 1 por UF: AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO): alíquota final de ICMS pra vender pra cada estado de destino, vinda do "param_icms" da Systax — é essa a coluna que decide o ICMS real de uma venda, dependendo de pra onde ela vai.

**Campo vazio é dado real, não lacuna.** Confirmado pelo usuário. Exemplo real: "GASOLINA COMUM" veio com `PIS`/`COFINS` vazios e só a coluna `SP` preenchida entre as 27 UFs (as outras 26 em branco) — reflete o regime tributário real desse produto (provável monofásico de combustível), não erro ou dado faltando na planilha.

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
