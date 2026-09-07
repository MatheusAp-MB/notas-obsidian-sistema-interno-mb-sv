---
tipo: decisao
dominio: python
status: concluida
criado: 06/09/2026
atualizado_em: 06/09/2026 23:02
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado, Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
---

# Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown

**Resumo**: Marca ganha regra de negócio própria (nome obrigatório e único, grupo fornecedor opcional) e Produto é revisado: nome deixa de ser único (existem produtos parecidos), marca vira obrigatória e protegida contra exclusão em cascata (nunca `SET_NULL`), EAN continua obrigatório único, SKU e Código do Fabricante são opcionais mas únicos só quando preenchidos. O ponto central: o usuário nunca digita uma marca — sempre seleciona de um dropdown com busca, cadastrando uma nova só se a opção não existir. CRUD completo de Marca e Grupo Fornecedor (cadastro/edição/exclusão/consulta) validado 100% pelo usuário.

## Contexto

Ao investigar um bug real de perda silenciosa de dado (ver [[Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado]]), ficou claro que o modelo de Marca/Produto nunca tinha sido formalizado como regra de negócio — o campo marca era texto livre, sem validação nem contra o banco. O usuário pediu explicitamente pra parar de pular direto pra código e voltar a idealizar/planejar a regra de negócio primeiro (ver [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]).

## Regras de negócio (ditadas pelo usuário)

**Marca**
- Nome: obrigatório, único no banco.
- Grupo Fornecedor: opcional.

**Produto**
- Nome: obrigatório, **não** único — "existem produtos parecidos" (correção do usuário depois de uma 1ª tentativa errada de registrar como único).
- Marca: obrigatória, única, e **sempre selecionada dentre as opções existentes — nunca digitada**. Se a marca não existe ainda, o usuário cadastra ali mesmo.
- EAN (código de barras): obrigatório, único.
- Foto: opcional.
- SKU: opcional, único **só quando preenchido** — vazio nunca conta pra unicidade.
- Código do Fabricante: opcional, único só quando preenchido, mesma regra do SKU.

**Exclusão de Marca**: não é operação frequente — a regra escolhida foi simplesmente impedir a exclusão e avisar o usuário quando existirem produtos vinculados àquela marca, em vez de construir um fluxo de reatribuição em massa.

## Decisão de implementação

- `Produto.marca`: `ForeignKey` com `on_delete=models.PROTECT` (era `SET_NULL, null=True, blank=True`) — exclusão de marca agora falha explicitamente se houver produto vinculado.
- `Produto.sku` e `Produto.codigo_fabricante`: `unique=True, null=True, blank=True` — `null=True` de propósito, porque múltiplos valores `NULL` não colidem contra o `unique`, enquanto múltiplos `''` colidiriam.
- Views de cadastro/edição de produto: `sku or None` / `codigo_fabricante or None` antes de salvar, garantindo que string vazia nunca vira valor colidível.
- Campo de marca no formulário deixou de ser texto livre — virou um dropdown de verdade com caixa de busca (`#marca_busca`, `#marca_lista`), inspirado no seletor de filtros do Sistema Interno V2 (`.filtro-busca-interna`/`.filtro-opcoes-lista`/`.filtro-opcao`), adaptado de multi-seleção pra seleção única. Um input escondido (`#id_marca_id`) é o único valor de fato submetido; o submit é bloqueado no cliente se nada foi selecionado.
- Opção fixa "+ Cadastrar marca nova" sempre visível no fim da lista (nunca filtrada pela busca), abrindo um mini-formulário inline (nome + grupo, com sub-opção de cadastrar grupo novo também) que usa os endpoints AJAX já existentes (`cadastrar_marca`/`cadastrar_grupo_fornecedor`).

> [!success] CRUD de Marca e Grupo Fornecedor concluído e validado
> Cadastro, alteração, exclusão e consulta de Marca e de Grupo Fornecedor testados e confirmados funcionando pelo usuário ("ok parece que tudo ta funcionando 100%"). Polimento puramente estético foi identificado e deliberadamente adiado — não bloqueia esta decisão.

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado]]
- [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]]
