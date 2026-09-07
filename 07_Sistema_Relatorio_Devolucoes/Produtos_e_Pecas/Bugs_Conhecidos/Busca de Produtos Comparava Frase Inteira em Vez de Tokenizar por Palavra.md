---
tipo: bug_conhecido
dominio: js
status: corrigido
criado: 06/09/2026
atualizado_em: 06/09/2026 23:31
relacionado: [Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal, Ciclo de Vida de Dúvida e Bug Conhecido]
---

# Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra

**Resumo**: a busca da tela Produtos comparava o termo digitado como 1 frase única contra o texto combinado do produto (nome+SKU+EAN+código do fabricante+marca, nessa ordem fixa) — buscar "brudden 9121" não encontrava o produto BRUDDEN com EAN `7908050719121`, porque essa sequência exata nunca existe no texto combinado (a marca vem depois do EAN, não antes). Corrigido tokenizando o termo por espaço e exigindo que TODAS as palavras batam em algum lugar do texto, em qualquer ordem/campo — mesmo padrão de busca já usado nas telas do Sistema Interno V2 (Histórico, Agenda, Portal do Drive).

## Como foi encontrado

Reportado pelo usuário ao testar a listagem de Produtos recém-aplicada: buscar "brudden 9121" não retornava o produto correto, mesmo ele existindo com marca BRUDDEN e EAN contendo "9121".

## Causa raiz

`script_produtos.js` normalizava o termo digitado inteiro (`normalizar(campoBusca.value)`) e comparava como 1 substring única contra `data-busca` de cada item (`textoItem.indexOf(termo) !== -1`). Como os campos são concatenados numa ordem fixa (nome, SKU, EAN, código do fabricante, marca), qualquer busca com mais de 1 palavra só funcionava se as palavras aparecessem, no texto combinado, exatamente na mesma ordem digitada — o que raramente é o caso quando o usuário combina marca + parte de um código.

## Correção

`filtrarItens` passou a receber uma lista de palavras (`termos`, resultado de `normalizar(campoBusca.value).split(/\s+/).filter(Boolean)`) e exige que TODAS estejam presentes no texto combinado do item (`termos.every(...)`), cada uma podendo estar em qualquer campo e em qualquer ordem — nunca mais compara a frase inteira como 1 bloco só. Corrigido e confirmado funcionando pelo usuário ("agora sim").

## Relacionado

- [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]]
