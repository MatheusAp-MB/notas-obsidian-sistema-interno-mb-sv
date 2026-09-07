---
tipo: checkpoint
dominio:
status: em_andamento
criado: 05/09/2026
atualizado_em: 07/09/2026 01:00
relacionado: [Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown, Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado, Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal, Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra, Checkpoint - Repensando o Catalogo de Pecas (Peca Independente de Produto)]
---

# Checkpoint - Catálogo de Peças e Tela de Produtos

**Resumo do estado atual**: catálogo de peças (models `Produto`/`Peca`) e telas de Produtos/Catálogo implementadas e testadas, incluindo responsividade mobile do Catálogo. Reestruturação de telas fechada em 02/09/2026 — detalhe em [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]. Retomado em 06/09/2026 depois da pausa pela reforma estrutural: regra de negócio de Marca/Produto formalizada e CRUD de Marca/Grupo Fornecedor concluído (ver [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]), e a listagem de Produtos ganhou agrupamento por Marca/Grupo, busca ao vivo e carrossel horizontal — validada de ponta a ponta pelo usuário, incluindo a correção de um bug real na busca (ver [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]] e [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]).

> [!info] Retomado — não está mais pausado
> Falta: editar peça já cadastrada (fora de escopo por ora) e auditoria mobile-first da tela Produtos. A listagem de Produtos agrupada já foi validada de ponta a ponta.

> [!warning] Catálogo de peças sendo repensado do zero (07/09/2026)
> O modelo de Peça e a tela de Catálogo de peças descritos abaixo estão sendo revisados por completo — inclusive a regra "peça pertence a exatamente 1 produto" (ver mais abaixo) deixa de valer. Idealização em andamento em [[Checkpoint - Repensando o Catalogo de Pecas (Peca Independente de Produto)]] — nada nesta nota deve ser tratado como estado final enquanto aquele checkpoint não fechar.

## Linha do tempo

**01/09/2026** — Ideia inicial: catálogo de peças por produto (foto + nome técnico), crescendo aos poucos. Regra firme do usuário: peça pertence a exatamente 1 produto, nunca compartilhada (`ForeignKey` simples, sem N-pra-N).

**02/09/2026** — Catálogo implementado: models `Produto`/`Peca` (SQLite); tela de Catálogo (buscar produto por código de barras, cadastrar produto novo, adicionar/remover peça com foto e quantidade esperada) testada de ponta a ponta, incluindo responsividade mobile (grade fixa, card em largura total <480px, área de toque maior, campos empilhados). Escopo mudou: usuária final (não só o dev) também usa essa tela.

Reestruturação de telas fechada — detalhe completo em [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]: tela "Produtos" própria (listagem), cadastro de produto movido pra lá, edição de dados do produto (nome/marca/EAN/foto) embutida no Catálogo, menu de navegação simples (Nova Devolução | Produtos).

**04/09/2026** — Revisão geral confirmou: Produtos ainda não passou pela auditoria mobile-first que o Catálogo já teve (vira pendência, ver "Em aberto").

**06/09/2026** — Retomado após a pausa de 05/09 (foco tinha ido pra reforma estrutural do mundo). Regra de negócio de Marca/Produto formalizada e implementada (ver [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]), incluindo a correção do bug de perda silenciosa da marca em texto livre (ver [[Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado]]). CRUD de Marca/Grupo Fornecedor (cadastro/edição/exclusão/consulta) validado 100% pelo usuário. Na sequência, a tela Produtos foi reorganizada em seções por Marca (avulsa) ou Grupo→Marca, com busca ao vivo sem acento e rolagem horizontal tipo carrossel na linha de produtos quando cresce demais — validada de ponta a ponta pelo usuário (ver [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]]), incluindo a correção de um bug real na busca que não tokenizava por palavra (ver [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]).

## Em aberto

- [ ] Auditoria mobile-first da tela Produtos (mesmo critério já aplicado ao Catálogo: grade fixa, área de toque, campos empilhados)
- [ ] Editar peça já cadastrada — fora de escopo por ora (só adicionar/remover), decisão firme do usuário

## Relacionado

- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]
- [[Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado]]
- [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]]
- [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]
