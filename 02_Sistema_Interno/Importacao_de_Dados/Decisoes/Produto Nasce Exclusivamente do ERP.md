---
tipo: decisao
dominio: banco_de_dados
status: ativa
criado: 15/08/2026
atualizado_em: 15/08/2026 03:00
relacionado: [Padrao de Qualidade e Clareza Estrutural do Repositorio, Redesenho do Popular Banco - Fontes de Dados e Escopo]
---

# Produto Nasce Exclusivamente do ERP

## Contexto — como isso apareceu

Durante o redesenho do comando `popular_banco` (ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]), foi confirmado lendo o código real que `importar_produtos_erp.py` funcionava ao contrário do que devia: ele criava um `Produto` novo pra **todo SKU que existisse no arquivo da API do Mercado Livre** (`detalhes_mlbs.json`), e só DEPOIS ia buscar dado complementar no ERP (custo, dimensão, NCM). Ou seja, na prática, o Mercado Livre é que "decidia" quais produtos existiam no sistema — o ERP entrava só como enriquecimento.

O usuário identificou que isso está errado e definiu a regra abaixo.

## A regra

**O ERP é a única fonte da verdade sobre quais produtos existem.** Um `Produto` só passa a existir no sistema porque ele está cadastrado no ERP — nunca porque ele apareceu num anúncio de marketplace (Mercado Livre, Shopee, Amazon, ou qualquer outro).

Explicando de outro jeito, pra quem nunca viu esse fluxo: pensa no ERP como o "cadastro central" da empresa — é lá que um produto passa a existir oficialmente pela primeira vez (com EAN, custo, dimensão, etc.). Os marketplaces são só lugares onde produtos **que já existem no ERP** são anunciados. Um anúncio nunca é a origem de um produto — ele é sempre uma consequência de um produto que já existia antes.

## Por que isso importa — a inconsistência que a regra evita

Se um produto existe num marketplace mas não tem cadastro correspondente no ERP, isso é um problema real, não um caso normal a ser tratado automaticamente. Pode significar, por exemplo, que alguém criou um anúncio sem cadastrar o produto direito no ERP, ou que há uma falha de sincronização em algum lugar. Nos dois casos, é uma inconsistência que alguém precisa saber e corrigir — o sistema nunca deve "resolver" isso sozinho criando um Produto a partir de dado de marketplace, porque isso esconderia o problema real em vez de expor ele.

## Consequência prática 1 — redesenho do popular_banco (agora)

`importar_produtos_erp.py` deixa de usar `detalhes_mlbs.json` (arquivo vindo da API do ML) como ponto de partida. O `Produto` passa a nascer diretamente dos 2 arquivos de cadastro do ERP (Ativos + Inativos) — ver detalhe completo em [[Redesenho do Popular Banco - Fontes de Dados e Escopo]].

## Consequência prática 2 — futuro comando da API do Mercado Livre (ainda não existe)

Quando a integração com a API do ML voltar a ser trabalhada dentro do `popular_banco` (ou num comando próprio, dedicado — mesmo padrão já usado no Sysemp), esse comando **nunca pode criar um `Produto` novo**. Ele só pode ANEXAR dado de anúncio (MLB, variação, qualidade, promoção, etc.) a um `Produto` que já exista, casando pelo SKU ou EAN.

Se aparecer um anúncio do ML cujo SKU não tem nenhum `Produto` correspondente no ERP, isso deve ser logado/avisado claramente (ex: "MLB X não tem produto no ERP — verificar cadastro") — nunca criado silenciosamente a partir do dado do ML.

## Relacionado

- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
