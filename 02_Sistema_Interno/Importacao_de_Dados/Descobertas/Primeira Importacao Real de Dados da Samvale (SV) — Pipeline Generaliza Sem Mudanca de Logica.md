---
tipo: descoberta
dominio: python
status: confirmada
criado: 17/08/2026
atualizado_em: 17/08/2026 00:55
relacionado: [Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, Redesenho do Popular Banco - Fontes de Dados e Escopo, Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido, Guia de Setup - Do Zero ao Primeiro Preco Calculado]
---

# Primeira Importação Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudança de Lógica

## Contexto — por que essa rodada aconteceu

Pedido do superior: gerar o relatório de impostos de entrada também pra Samvale (SV), não só MB. Plano já decidido (ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]] e a dúvida [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]): usar um banco temporário e isolado (`sistema_interno_sv_temp`, via `DB_NAME=`), sem tocar no banco real da MB, e sem resolver agora a arquitetura permanente de múltiplas empresas.

Isso criou, sem ser o objetivo original, a primeira chance real de rodar o pipeline inteiro (`popular_banco`) contra um conjunto de dados que não é da MB — nunca tinha acontecido antes.

## O que aconteceu — dado real, banco vazio, zero mudança de lógica

Rodado `popular_banco` contra o banco novo, com os 2 arquivos de produto ERP da SV (depois de corrigido o único ponto real de atrito — ver abaixo) e as mesmas 4 tabelas de frete já usadas pela MB (essas não são separadas por empresa):

- **Produtos ERP**: 506 criados, 0 atualizados (banco vazio), 2 linhas sem EAN (ignoradas corretamente), 0 erro de dimensão de embalagem.
- **Frete (ML/Magalu/TikTok/Amazon)**: 232/27/5/126 atualizados, 0 erro nos 4 — reaproveitando a correção de caminho feita mais cedo no mesmo dia (ver [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]]).
- **6 grades de precificação**: rodaram sem erro de assert; "sem cálculo possível" em todas (esperado — SV ainda não tem frete/configuração específica pra virar preço real, e isso é irrelevante pro relatório de impostos de entrada).

Nenhuma linha de código foi alterada pra isso funcionar.

## Único ponto de atrito real — e era de dado, não de lógica

Os 2 arquivos de produto ERP da SV têm nomes de coluna diferentes dos da MB (ex: `Código Auxiliar` com acento em vez de `Codigo Auxiliar`, `inativo` minúsculo em vez de `Inativo`, `Produto` em vez de `Detalhes do Produto`). Corrigido com um script de uso único (renomeação de cabeçalho, com backup automático de cada arquivo e amostra de dado real impressa no terminal pra confirmar visualmente os 2 casos ambíguos — coluna do título e convenção do "Inativo" — antes de seguir). Nenhuma linha do importador (`importar_produtos_erp.py`) precisou mudar, só os 2 caminhos de arquivo (edição temporária, revertida depois de gerar o relatório).

## Por que isso conta como evidência real de estabilidade

Rodar o mesmo código repetidamente contra o dado da MB não testa isso — dado familiar nunca expõe premissa escondida. Dado de uma empresa diferente, com formatação/nomenclatura de ERP diferente, é um teste de generalização de verdade — e não foi planejado como teste, surgiu de uma necessidade de negócio real.

O pipeline (`ImportadorProdutos`, os 4 importadores de frete, as 6 classes de cálculo de grade) passou nesse teste informal sem nenhum ajuste de lógica — só de nome de coluna, que é exatamente o tipo de variação que já era esperado precisar de tratamento (dado de fonte externa, não código).

## O que isso NÃO prova — ainda em aberto

- A sincronização de imposto de entrada (`sincronizar_impostos_entrada`) contra a API real da Sysemp da SV **ainda não rodou** — travada esperando o token (`SV_SYSEMP_API_TOKEN`), que o usuário não tinha em mãos no momento desta nota. É a parte do pipeline que ainda não tem prova real com dado da SV.
- A geração do `.xlsx` final também ainda não aconteceu, pelo mesmo motivo.
- Esta nota cobre só a metade "de produto" do pipeline — a metade "fiscal" continua pendente, com plano já definido pra quando o token estiver disponível (ver [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]] pro fluxo completo).

## Relacionado

- [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]]
- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
