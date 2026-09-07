---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 07/09/2026
atualizado_em: 07/09/2026 01:00
relacionado: [Checkpoint - Catálogo de Peças e Tela de Produtos, Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Checkpoint - Repensando o Catálogo de Peças (Peça Independente de Produto)

**Resumo do estado atual**: idealização em andamento (fase "Idealizar" do ciclo de trabalho — nenhum código gerado ainda, por pedido explícito do usuário) pra repensar por completo o Catálogo de peças e o CRUD de peças. Muda uma regra que era firme até aqui: peça deixa de pertencer a exatamente 1 produto (`ForeignKey`) e vira uma entidade independente, conectada a produtos por um vínculo próprio — ver detalhe completo abaixo. Ainda falta: desenho final das telas, e o usuário não confirmou se a idealização já está completa.

> [!warning] Idealização em andamento — nada foi confirmado como completo
> Ao ser perguntado se faltava algo, o usuário pediu pra registrar o que já foi discutido antes de continuar ("pq isso já se perdeu uma vez"), sem responder se a idealização está fechada. Nada aqui é decisão final até o usuário confirmar explicitamente que pode passar pra fase de Planejar.

## Contexto

Gatilho: usuário reportou que a tela de Catálogo de peças (screenshot mostrando busca por código de barras → card do produto → seção "Peças compatíveis" vazia → campo de adicionar peça por nome) "era muito rascunho, não tá robusto como o resto do sistema" — e que as telas Produtos/Peças estão com o papel de cada uma muito misturado. Pediu pra idealizar tudo de novo, sem gerar nada ainda.

## O que muda em relação ao que já existia

A decisão original (ver [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]], 02/09/2026) tinha fixado: "peça pertence a exatamente 1 produto, nunca compartilhada (`ForeignKey` simples, sem N-pra-N)" — regra firme do usuário na época. Essa idealização revisa isso de propósito: peça e produto passam a ser objetos independentes, "apenas interconectados" (palavras do usuário).

## Modelo de Peça (identidade)

| Campo | Obrigatório? | Único? |
|---|---|---|
| Nome genérico (nome que o usuário conhece) | Obrigatório | Não — pode repetir |
| Nome técnico (nome oficial do fabricante) | Opcional | Não — pode repetir |
| Código do Fabricante | Opcional | Único **só quando preenchido** (vazio não conta — mesmo padrão já usado no Código do Fabricante/SKU do Produto) |
| Foto | **Obrigatória** (diferente do Produto, onde foto é opcional) | — |

Nenhum campo de ID visível ao usuário — o próprio usuário descartou essa ideia: "eu nem sei se isso é útil de verdade... seria só pra controle interno do banco, nada pro usuário". A chave primária automática do Django já resolve isso sozinha, sem precisar de campo novo.

## Relação Peça ↔ Produto

Deixa de ser `ForeignKey` (peça → 1 produto) e vira uma ligação própria (na prática, `ManyToManyField` com modelo "through") — motivo real, dito pelo usuário: **"cada produto pode esperar uma quantidade diferente da mesma peça física"**. Ou seja, quantidade esperada não é mais um dado da peça nem um dado solto de um vínculo simples — é um atributo do PAR (produto, peça), porque a mesma peça física pode ter expectativa de quantidade diferente dependendo de qual produto a usa.

Consequência direta: peça pode existir **sem nenhum produto vinculado** — seja porque nasceu avulsa (ver próxima seção), seja porque o produto dela foi excluído e ela foi mantida (ver seção de exclusão).

## Como a peça nasce — 2 fluxos, os 2 vão existir

1. **Fluxo normal**: usuário abre um produto e cadastra a peça a partir dele — ela já nasce vinculada a esse produto (fluxo já existente hoje, continua).
2. **Fluxo avulso**: cadastro de peça numa tela própria, sem precisar de nenhum produto — ela nasce sem vínculo nenhum, e pode ser vinculada a 1 ou mais produtos depois.

## Exclusão de produto — o que acontece com as peças dele

Ao excluir um produto, o usuário escolhe entre 2 opções (nas palavras dele):

- **"Apagar produto + peças"** — mas só as peças que **não são compartilhadas por outro produto**. Uma peça compartilhada nunca é apagada só porque 1 dos produtos dela foi excluído.
- **"Apagar apenas o produto"** — mantém todas as peças dele, que passam a existir sem produto vinculado (órfãs).

## Peça compartilhada — como aparece pro usuário

Ideia inicial do usuário era um grupo próprio "peças compartilhadas entre produtos" na tela — descartada pelo próprio usuário ao repensar: "esse grupo compartilhado não precisa existir, ele é um grupo inútil que só gera confusão". Decisão atual: um **badge** na peça ("peça compartilhada"), que ao passar o mouse mostra quais outros produtos também usam ela.

> [!info] Ponto em aberto, deixado de propósito sem detalhe por enquanto
> O usuário deixou claro que **"é importante de fato o usuário ver peças compartilhadas, pq vai ajudar na vida real"**, mas pediu pra não entrar em detalhe agora. O badge com tooltip resolve "essa peça específica é compartilhada, com quem" — mas não dá uma visão de conjunto de "todas as peças compartilhadas do sistema, de uma vez". Se isso vier a ser necessário, é uma tela/filtro à parte, ainda não desenhado.

## Papel de cada tela (separação de responsabilidade)

Nas palavras do usuário: **"Produtos cuida de produtos, peça cuida de peças."** Hoje o "Editar produto" mora dentro do Catálogo de peças (decisão antiga, pra não precisar de tela separada) — isso muda: cada tela cuida só do seu próprio objeto. Desenho final de como o Catálogo de peças fica organizado (grupos, navegação, como se chega da tela de Produtos até as peças de 1 produto específico) ainda **não foi fechado** — a ideia inicial do usuário, ainda sob revisão, era:

- Peças sem produto vinculado (avulsas/órfãs) — seção própria.
- Peças agrupadas por produto — produto como cabeçalho/agrupador, peças dele numa grade logo abaixo, no mesmo espírito visual do padrão "hub" já usado no Sistema Interno V2 (árvore SKU → Base/Catálogo → Simples, cada nível é um cabeçalho com os itens dele abaixo — mesma lógica já aplicada aqui na tela de Produtos agrupada por Marca/Grupo).

## Em aberto

- [ ] Confirmar com o usuário se a idealização está completa, ou se ainda falta discutir algo antes de ir pra fase de Planejar
- [ ] Desenho final da tela de Catálogo de peças (grupos, navegação, como abrir peças de 1 produto específico)
- [ ] Visão de conjunto de "todas as peças compartilhadas do sistema" — o usuário sinalizou que é importante, mas pediu pra não detalhar agora
- [ ] Quantidade esperada no vínculo produto-peça: obrigatória? tem alguma regra de validação (ex: não pode ser 0 ou negativa)? — ainda não perguntado
- [ ] O que acontece ao excluir uma peça diretamente (não via exclusão de produto) — ela só remove os vínculos, ou avisa quantos produtos ficam sem ela, parecido com a regra de exclusão de Marca vinculada a produtos? — ainda não perguntado

## Relacionado

- [[Checkpoint - Catálogo de Peças e Tela de Produtos]]
- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
