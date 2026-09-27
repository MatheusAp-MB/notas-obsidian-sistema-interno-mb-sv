---
tipo: decisao
dominio: mercado_livre
status: concluida
criado: 27/09/2026
atualizado_em: 27/09/2026 18:26
relacionado: [Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada]
resumo: "A planilha nova de Frete ML trouxe uma coluna 'Regime' que representa uma 2ª tabela de frete real (Frete Grátis Rápido), não um metadado. Decidido modelar as 2 tabelas juntas no mesmo model FreteML (novo campo regime + chave única (peso_min, preco_min, regime)) em vez de ignorar a tabela nova — corrigindo o problema de verdade, ponta a ponta, em vez de um patch mínimo."
---

# Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo

**Resumo**: a planilha de referência do Frete ML (`Tabela_Frete_Mercado_Livre.xlsx`) passou a trazer uma coluna "Regime" (Sem/Com Frete Grátis Rápido) que representa uma **2ª tabela de frete real e completa**, não um detalhe cosmético. Decidido modelar as 2 tabelas juntas no mesmo model `FreteML`, com um novo campo `regime` e chave única `(peso_min, preco_min, regime)`, e propagar esse campo por todos os consumidores — em vez de importar só a tabela "Sem Frete Grátis Rápido" e descartar a coluna nova.

> [!success] CONCLUÍDA em 27/09/2026
> Implementada e validada com a planilha real: 480 linhas importadas (30 faixas de peso × 2 regimes × 8 faixas de preço), 0 erros. Aplicada ponta a ponta por Matheus em 18 arquivos (model, migração, importador, cálculo de margem, grade de precificação, tela HTML da tabela de frete e relatório ERP x ML).

## Contexto

O bug registrado em [[Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada]] veio à tona porque a planilha de referência do Frete ML mudou de layout sem o comando de importação acompanhar. Analisando a planilha real enviada por Matheus, ficou claro que a mudança não era só de posição de coluna — apareceu uma coluna nova, "Regime", com 2 valores possíveis: "Sem Frete Grátis Rápido" e "Com Frete Grátis Rápido". Cada faixa de peso × faixa de preço agora tem **2 valores de frete**, um pra cada regime — ou seja, a planilha nova contém 2 tabelas de frete completas, não 1.

## A questão a decidir

Como tratar essa coluna nova "Regime" no sistema: ela é dado real que precisa ser modelado e usado nos cálculos de margem/precificação, ou é uma variação que pode ser ignorada por enquanto (importando só 1 dos 2 regimes)?

## O que levou à decisão — alternativas consideradas e descartadas

| Opção | Descrição | Prós | Contras |
|---|---|---|---|
| A — Fix mínimo, ignorar Regime | Importar só as linhas "Sem Frete Grátis Rápido" (mesmo comportamento de antes da planilha mudar), descartar a coluna nova | Menor risco, menos arquivos tocados, resolve o `ValueError` imediatamente | Descarta dado real que a planilha já traz; sistema fica desatualizado assim que o negócio precisar do regime "Com Frete Grátis Rápido" pra precificar de verdade |
| **B — Modelar as 2 tabelas via campo `regime` (escolhida)** | `FreteML` ganha campo `regime`, chave única vira `(peso_min, preco_min, regime)`, todo consumidor (cálculo de margem, grade de precificação, tela HTML) passa a considerar o regime, com default `SEM_FRETE_GRATIS_RAPIDO` preservando 100% do comportamento atual | Corrige o problema de verdade — nenhum dado real da planilha é descartado; sistema já fica pronto pro dia em que precisar diferenciar os 2 regimes na precificação real; tela HTML já nasce mostrando as 2 linhas por faixa de peso, formato que Matheus pediu explicitamente | Mais arquivos tocados (model, migração, importador, 3 módulos de cálculo, views + template + CSS + JS da tela, comando de relatório) |

Matheus rejeitou explicitamente a Opção A quando ela foi levantada como padrão recomendado: "eu quero corrigir o que precisar ser corrigido ponta a ponta... vamos corrigir de verdade."

## Decisão tomada

Opção B. `FreteML` ganha o campo `regime` (`TextChoices`: `SEM_FRETE_GRATIS_RAPIDO` / `COM_FRETE_GRATIS_RAPIDO`), com `UniqueConstraint` em `(peso_min, preco_min, regime)`. Todo consumidor (`calculo_margem.py`, `montar_linhas_precificacao.py`, `formula_precificacao.py`) ganha parâmetro `regime=None`, resolvendo internamente pro default `SEM_FRETE_GRATIS_RAPIDO` — decisão de design deliberada, já que nenhuma parte do sistema hoje persiste se um anúncio específico do Mercado Livre tem ou não Frete Grátis Rápido (confirmado via grep: a informação só aparece em scripts de exploração, nunca gravada em nenhum model). Isso preserva 100% dos números de produção existentes enquanto deixa o sistema pronto pra diferenciar os 2 regimes assim que essa informação passar a ser persistida por anúncio.

## Exemplo / consequência

A tela de tabela de frete (`estrutura_tabela_frete_ml.html`) passou a mostrar exatamente o formato pedido por Matheus: 1 tabela única, 2 linhas por faixa de peso (rowspan na coluna de peso, 1 linha "Sem Frete Grátis Rápido" e 1 linha "Com Frete Grátis Rápido" logo abaixo), com a calculadora ganhando um seletor de regime. O cálculo de margem e a grade de precificação continuam usando exatamente os mesmos números de antes (regime default), sem qualquer mudança de comportamento em produção — a diferenciação por regime fica disponível pra quando for necessária.

## Relacionado

- [[Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada]]
