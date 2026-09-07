---
tipo: decisao
dominio: python
status: concluida
criado: 06/09/2026
atualizado_em: 06/09/2026 23:53
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown, Checkpoint - Catálogo de Peças e Tela de Produtos, Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]
---

# Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal

**Resumo**: a tela "Produtos" deixa de ser uma grade única e passa a agrupar por Marca (quando a marca não tem grupo) ou por Grupo→Marca (quando tem), com uma caixa de busca ao vivo (client-side, sem acento, tokenizada por palavra) que esconde seções/produtos que não batem, e rolagem horizontal tipo carrossel na linha de produtos quando ela cresce demais. Validado de ponta a ponta pelo usuário, incluindo a correção de um bug real na busca (ver [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]) e um refinamento visual do card do produto (foto quadrada maior, nome truncado, legenda com EAN/SKU/Cód. Fabricante e contraste corrigido).

## Contexto

A tela de Produtos era uma única grade plana, sem agrupamento nem busca — difícil de navegar conforme o catálogo cresce. O usuário pediu agrupamento por Marca/Grupo, no mesmo padrão visual de busca já usado no Sistema Interno V2.

## O que foi pedido

- Marca sem grupo vira seção própria; marca com grupo fica aninhada dentro da seção do grupo.
- Só aparecem seções de marca/grupo que realmente têm produto — nada de seção vazia.
- Ordenação alfabética em todo nível (grupo, marca dentro do grupo, marca avulsa).
- Busca (client-side) nos campos Nome, SKU, EAN, Código do Fabricante e Marca — mesmo padrão de campo de busca do Sistema Interno V2. Seção/subseção some por completo quando nenhum produto dela bate com o termo.
- Quando uma linha de produtos cresce demais, ganha rolagem horizontal interna (carrossel), em vez de quebrar em várias linhas.

## Implementação

- View `produtos` reescrita: agrupa via `select_related('marca__grupo_fornecedor')`, monta um dicionário por grupo→marca e outro de marcas sem grupo, e ordena tudo (nome do grupo, nome da marca) antes de passar pro template.
- Template usa atributos `data-secao`/`data-subsecao`/`data-item`/`data-busca` pra permitir filtragem 100% client-side.
- `script_produtos.js` (recriado — tinha sido removido antes como código morto): busca normaliza acento (`normalize('NFD')` + strip de diacríticos) pra bater "eletrico" com "Elétrico"; esconde subseção sem item visível, e seção sem subseção/item visível.
- CSS: `.produtos-grade` virou `display:flex; overflow-x:auto` (era grid com quebra de linha), com scrollbar fina customizada — a linha de produtos vira carrossel quando não cabe na largura.

## Correção pós-aplicação — busca por palavra, não por frase

Na 1ª validação, o usuário reportou que a busca não encontrava produtos ao combinar marca + parte de um código (ex: "brudden 9121") — causa raiz e correção completas em [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]. Resumo da correção: a busca passou a tokenizar o termo digitado por espaço e exigir que todas as palavras batam em algum lugar do texto combinado do produto, em vez de comparar a frase inteira como 1 bloco só. Reconfirmado funcionando pelo usuário depois da correção.

> [!success] Validado de ponta a ponta pelo usuário
> Agrupamento, busca (já corrigida) e carrossel confirmados funcionando.

## Refinamento visual dos cards — foto maior, nome truncado e legenda com EAN/SKU/Cód. Fabricante

Depois de validada a listagem em si, o usuário pediu uma análise visual do card do produto (mockup simples gerado e aprovado antes de aplicar, mesmo ciclo das outras mudanças desta tela). Mudanças aplicadas e confirmadas ("ficou excelente"):

- Foto do produto: 160×120 (retangular) → 200×200 (quadrada) — formato mais próximo do padrão de catálogo de produto (Mercado Livre, Amazon, etc.), e resolve também o card "sem foto", que ganhou um ícone (`fas fa-image`) no lugar do texto sozinho.
- Nome do produto: travado em 2 linhas com reticências (`-webkit-line-clamp: 2`) e altura mínima reservada — evita que um nome longo (ex: "PULVERIZADOR ELÉTRICO MANUAL E MISTURADOR DE CALDA COSTAL SS-20B MIXER 20L") deixe o card mais alto que os vizinhos na fileira. Nome completo continua acessível via `title` no link do card (tooltip ao passar o mouse).
- Legenda do card: além do EAN (sempre presente), passou a mostrar SKU e Código do Fabricante quando preenchidos — bloco com altura mínima reservada pra até 3 linhas, então um produto só com EAN fica com a mesma altura de card que um produto com os 3 campos preenchidos.
- Contraste: a cor de texto usada na legenda e no "sem foto" (`#adb5bd`, muito clara) foi trocada por `#6c757d` — o mesmo tom já usado no restante da tela pra texto secundário (ex: "Nenhum produto cadastrado ainda"), corrigindo um problema real de legibilidade e alinhando com o padrão de cor já existente na tela.

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]
- [[Checkpoint - Catálogo de Peças e Tela de Produtos]]
- [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]
