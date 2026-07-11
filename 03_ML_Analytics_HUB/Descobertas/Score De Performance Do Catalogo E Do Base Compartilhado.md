---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: [MLBU Compartilhado Entre Base E Catalogo Pareado]
---

# Score de Performance do Catálogo é, na Prática, o Score do Base

Quando um Anúncio Base e seu Anúncio de Catálogo pareado compartilham o
mesmo MLBU, o score/qualidade exibido para o lado Catálogo é, na
realidade, o dado calculado para o MLB Base — não um dado exclusivo do
Catálogo.

## Contexto que levou à investigação

Surgiu uma pergunta da conversa do projeto Django: na tela de Qualidade,
um Base (`MLB1942167064`, score 94, 2 objetivos pendentes) e seu
Catálogo pareado direto (`MLB3346875129`) mostravam **exatamente os
mesmos** score e pendências — suspeita de que o sistema estivesse, sem
perceber, repassando o resultado do Base para o Catálogo por engano.

## Evidência real que confirma

Testado com o par `MLB1942167064` (Base) ↔ `MLB3346875129` (Catálogo):

1. **Retorno idêntico byte a byte** entre as duas consultas — confirmado
   via comparação direta dos dois JSONs.
2. Dentro de `buckets`, existe um bucket com `"type": "ITEM"`, cujo campo
   `"key"` identifica de qual MLB aquele bloco realmente é. Consultando
   pelo MLBU do Base **ou** pelo MLBU do Catálogo (que é o mesmo MLBU),
   o bucket ITEM sempre trouxe `key: "MLB1942167064"` — o MLB do **Base**,
   nunca o do Catálogo.

## Explicação

Isso não é um bug do nosso lado — é comportamento real da API. O endpoint
`/user-product/{MLBU}/performance` recebe **apenas o MLBU** como
parâmetro; ele não recebe nem diferencia qual MLB (Base ou Catálogo)
originou a consulta. Como o MLBU é compartilhado (ver nota relacionada),
a resposta é sempre a mesma, e o bucket ITEM aponta consistentemente para
um MLB específico (neste caso, o Base) — não para "ambos" ou para o que
foi consultado.

## Limite desta descoberta

Testado em apenas 1 par de 1 SKU. Não foi confirmado se o bucket ITEM
aponta *sempre* para o lado Base em todos os pares da conta, ou se pode
variar (por exemplo, apontar para o Catálogo em algum caso específico) —
isso exigiria testar mais pares antes de virar regra universal.

## Recomendação prática (não é decisão de produto, é observação técnica)

Não existe, atualmente, forma de obter performance/qualidade exclusiva e
distinta para um Anúncio de Catálogo quando ele compartilha MLBU com seu
Base. Se ambos precisarem aparecer na tela, considerar deixar explícito
que o dado é compartilhado, em vez de tratar como informação
independente.

## Relacionado

- [[MLBU Compartilhado Entre Base E Catalogo Pareado]]