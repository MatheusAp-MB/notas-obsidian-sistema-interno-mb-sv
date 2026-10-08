---
tipo: duvida
dominio: python
status: em_aberto
criado: 07/10/2026
atualizado_em: 07/10/2026 22:26
relacionado: [Variacoes Extras no Banco Que Nao Estao no Arquivo de Detalhes, Niveis de Granularidade do Full e Como os Dados se Ligam]
resumo: "Na varredura completa de 07/10/2026, 71 dos 915 Códigos ML do Full deram erro na consulta de reposição (69 × 404 e 2 × 500), com o estoque normal; 67 deles têm todos os anúncios encerrados no arquivo de detalhes. Causa não confirmada, falta a documentação oficial do endpoint."
---

# Erros de Reposição 404 e 500 nos Códigos ML do Full

## Resumo

Na varredura completa da tela **Estoque no Full** em 07/10/2026, **71 Códigos ML do Full** (`inventory_id`) voltaram com **erro na consulta de reposição** (o número de "Aptas" e "a caminho"), embora o **estoque** deles tenha vindo normal. Quase todos (67 de 71) pertencem a anúncios que estão **todos encerrados** no arquivo de detalhes. A causa **não foi confirmada**: falta a documentação oficial do Mercado Livre para esse endpoint. Registrado para retomar depois, a pedido do usuário.

## Contexto

- A varredura consultou **915 Códigos** em **11 min 06 s** e terminou avisando "71 com resposta de erro do Mercado Livre".
- Cada consulta grava, por Código, duas respostas: `estoque` (por `inventory_id`) e `reposicao` (por produto do vendedor, `user_product_id`). O erro está **só na reposição**; a resposta de estoque desses 71 Códigos veio normal.
- Um Código com `reposicao` vazia (sem produto do vendedor) **não é erro**; só conta como erro quando o ML respondeu e a resposta veio com falha.

## Os erros

Endpoint que falha: `/marketplace/fbm/user-products/{MLBU}/replenishment`.

| Tipo | Códigos | Texto devolvido pelo ML |
|---|---|---|
| 404 | 69 | `not_found` |
| 500 | 2 | `Internal Server Error` |

- Na tela são **20 produtos** e **72 cartões**, porque 1 Código é compartilhado entre 2 produtos (71 Códigos únicos).
- Os 2 Códigos com 500 aparecem em 3 cartões, pelo mesmo motivo (um deles é o compartilhado).
- O 404 é do **recurso de reposição**, não de "anúncios": o ML não está dizendo que não achou o anúncio, e sim que não achou a reposição daquele produto do vendedor.

## O padrão encontrado

Cruzando os 71 Códigos com `detalhes_mlbs.json` (gerado em **06/10/2026 08:12**, Magazine):

- **67 de 71** têm **todos os anúncios encerrados** (`closed`), com datas de encerramento entre 08/04/2026 e 05/10/2026.
- **0 de 844** Códigos sem erro têm todos os anúncios encerrados.

A relação é forte, mas é **correlação**: ainda não se sabe se o ML devolve 404 para reposição de anúncio encerrado por regra ou por outro motivo. Para fechar, é preciso a página oficial do ML sobre esse recurso.

## As 4 exceções (erro sem todos os anúncios encerrados)

| Código | Erro | Situação dos anúncios |
|---|---|---|
| RBIP27215 | 500 | 1 ativo e 1 encerrado |
| QZJR03888 | 500 | 2 pausados |
| AHGM30977 | 404 | 1 ativo |
| JJHC83568 | 404 | 1 ativo e 1 encerrado |

Os dois 404 com anúncio ativo (AHGM30977 e JJHC83568) são do produto **Pistola Pintura Elétrica Tinta Hv500**. Esses quatro casos merecem olhar à parte, porque não se explicam pelo "anúncio encerrado".

## Estoque parado nos Códigos encerrados

- Dos 67 Códigos com todos os anúncios encerrados, **65 têm estoque 0**.
- Os outros 2 têm estoque real no Full, no produto **Pulverizador Guarany** (SKU `F7891988006671.001`): **JPKD83105 com 170** e **CUIW29959 com 43**, somando **213 unidades** (212 disponíveis).
- O único anúncio ativo desse produto (Código PFQC65730) tem **0** no Full.
- Ou seja, existe mercadoria no Full de um produto cujos anúncios foram encerrados. Isso é decisão de negócio (retirar, reativar ou manter), não de código.

## O que já foi feito na tela

- Novo filtro **"Reposição com erro"** (grupo "Consulta"), separado do "Consulta com erro" (que cobre só erro de estoque).
- No cartão do Código aparece o texto do erro, e na linha do produto aparece a etiqueta **"com erro"** no lugar de "parcial".
- O resumo da varredura passou a separar "erro no estoque" de "erro na reposição" e indica qual filtro usar.
- **Decisão do usuário:** o texto do aviso fica **igual para 404 e 500** ("está ótimo como está"); não vale diferenciar.

## Como retomar

1. **Confirmar a causa:** pedir ao usuário o HTML da documentação oficial do ML para `/marketplace/fbm/user-products/{MLBU}/replenishment` e ver se o 404 é esperado para anúncio encerrado.
2. **Olhar as exceções:** os 2 × 404 com anúncio ativo (AHGM30977, JJHC83568) e os 2 × 500 (RBIP27215, QZJR03888), inclusive tentando de novo pelo botão "Atualizar" do Código para ver se o 500 se repete.
3. **Decidir sobre as 213 unidades** do Pulverizador Guarany nos Códigos encerrados (JPKD83105 e CUIW29959).
4. **Refazer o cruzamento** com um `detalhes_mlbs.json` mais novo, porque o usado aqui é de 06/10/2026 08:12 e pode estar desatualizado.

## Relacionado

- [[Variacoes Extras no Banco Que Nao Estao no Arquivo de Detalhes]]
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]]
