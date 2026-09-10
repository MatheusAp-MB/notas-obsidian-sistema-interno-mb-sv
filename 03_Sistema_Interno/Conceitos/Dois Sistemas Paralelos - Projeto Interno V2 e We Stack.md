---
tipo: conceito
dominio: 
status: ativa
criado: 10/09/2026
atualizado_em: 10/09/2026 09:47
relacionado: [Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda, Checkpoint - Inicio da Estrutura de Impostos de Saida]
resumo: Existem 2 sistemas paralelos e distintos no dia a dia da empresa — o Projeto Interno V2 (sistema próprio, desenvolvido neste vault) e o We Stack (sistema de terceiros, pago, com código e dono separados). Uma nota ou planilha que fala em "o sistema" pode estar falando de qualquer um dos dois — nunca presumir qual sem checar.
---

# Dois Sistemas Paralelos: Projeto Interno V2 e We Stack (Conceito)

**Resumo**: existem 2 sistemas paralelos e distintos no dia a dia da empresa — o Projeto Interno V2 (sistema próprio, desenvolvido neste vault) e o We Stack (sistema de terceiros, pago, com código e dono separados). Uma nota ou planilha que fala em "o sistema" pode estar falando de qualquer um dos dois — nunca presumir qual sem checar.

## Contexto

Ao analisar a planilha "Cálculo final We Stack" (ver [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]), o termo "sistema" foi tratado de forma ambígua nas primeiras notas escritas sobre o assunto — como se qualquer menção a "o sistema" fosse sempre sobre o Projeto Interno V2. O usuário corrigiu isso em 10/09/2026: são 2 sistemas paralelos de verdade, não 1 só com apelidos diferentes.

## O que é

- **Projeto Interno V2** — sistema próprio da empresa (MB/SV), é o sistema que este vault documenta e que Claude ajuda a desenvolver.
- **We Stack** — sistema de terceiros, pago pela empresa, com código e desenvolvimento fora do controle interno. Claude não desenvolve nem tem acesso a ele — o que se sabe sobre ele vem só de planilhas de referência e documentos que a empresa recebe ou produz sobre ele.

Os dois operam em paralelo, cada um com seu próprio escopo, sem serem a mesma coisa com nomes diferentes.

## Por que essa separação importa

Documentos e planilhas de referência frequentemente dizem "o sistema" sem especificar qual dos dois — e presumir errado tem custo real: tratar uma referência do We Stack como se já fosse escopo do Projeto Interno V2 gera decisão de arquitetura fora de hora, cobrando do Projeto Interno V2 uma funcionalidade que hoje não é dele. Foi exatamente o que aconteceu na 1ª versão da decisão sobre UF de destino: um comentário da própria planilha ("Terá que ser criado um campo novo no sistema (WE STACK)...") já dizia "WE STACK" explicitamente, mas isso não impediu a ambiguidade de entrar na nota.

## Escopo atual do Projeto Interno V2 (o que muda com o tempo)

Hoje (10/09/2026), o foco do Projeto Interno V2 é 100% precificação: custo entra, preço de venda sai (ver contexto `Precificacao` em `03_Sistema_Interno/`). Funcionalidades mais amplas que hoje só existem no We Stack — cálculo de margem pós-venda, "Central de Promoções", ICMS a recolher pela UF real de destino — são aplicações **futuras** do Projeto Interno V2, conforme o que já está em andamento for sendo resolvido. Não fazem parte do escopo atual.

## Exemplo

A planilha "Cálculo final We Stack Doc 1.xlsx" (ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]] pro bloco de dados que ela usa) é referência do cálculo que roda hoje no We Stack — não é uma especificação do que o Projeto Interno V2 deve implementar agora. A decisão sobre buscar a UF de destino real de cada venda (ver [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]) só se aplica quando essa funcionalidade for, no futuro, absorvida pelo Projeto Interno V2 — hoje ela roda fora, no We Stack.

## Relacionado

- [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
