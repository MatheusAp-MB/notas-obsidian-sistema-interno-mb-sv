---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 07/09/2026
atualizado_em: 07/09/2026 03:43
relacionado: [Checkpoint - Repensando o Catalogo de Pecas (Peca Independente de Produto), Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
---

# Análise do UX Flow da Responsável pela Devolução

**Resumo do estado atual**: idealização em andamento (fase "Idealizar" do [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]] — nenhum código sendo gerado, por pedido explícito do usuário) pra repensar como as telas de Produto, Peça e o vínculo entre os dois deveriam se comportar do ponto de vista de quem usa o sistema no dia a dia (a pessoa responsável pela devolução, nunca chamada aqui de "usuário" no sentido técnico — é uma pessoa real, sem conhecimento técnico, que só quer resolver o trabalho dela). Ainda **não é decisão final** — falta desenhar como isso vira tela de verdade.

> [!warning] Idealização em andamento — nada aqui virou tela ainda
> Esta nota registra um **princípio** e um **diagnóstico**, confirmados pelo usuário na conversa que gerou esta nota. O desenho concreto das telas (navegação, onde cada botão fica, como se chama cada coisa) ainda não foi feito — ver seção "Em aberto".

## Contexto — o que disparou essa análise

Depois de implementar a funcionalidade de Peça poder existir sem produto vinculado ("peça avulsa" — ver [[Checkpoint - Repensando o Catalogo de Pecas (Peca Independente de Produto)]]), o usuário testou as telas reais e trouxe, nas próprias palavras:

> "Cadastro de peça avulsa OK (Mas só o cadastro, não ta dando pra excluir, nem alterar) / Vincular peça avulsa a um produto funciona, mas ta MUITO CONFUSO, muito ruim mesmo. / Vincular peça pela tela de produtos esta funcionando, mas ainda ta estranho pensando no UX flow."

Ou seja: cada pedaço, testado isoladamente, funciona — mas a experiência de usar o sistema de ponta a ponta não funciona. O usuário pediu explicitamente pra **parar de gerar código** e pensar com calma no problema de fundo antes de continuar.

## O princípio central: objetos autossuficientes

**O QUÊ**: os 4 conceitos que existem hoje no Catálogo — Marca, Grupo Fornecedor, Produto e Peça — são, nas palavras do usuário, "objetos completos", cada um "isolado". Eles **se complementam** (uma Peça pode estar ligada a um Produto, um Produto tem uma Marca), mas não são **interdependentes** no sentido de precisar um do outro pra existir ou pra ser gerenciado. "Autossuficiente em CRUD" quer dizer: qualquer um desses 4 objetos precisa poder ser **criado, visto, editado e apagado sozinho**, sem depender de estar dentro do contexto de outro objeto pra isso acontecer.

**POR QUÊ**: porque hoje isso é quebrado especificamente na Peça. Uma Peça vinculada a um Produto tem link de "Editar peça" no card dela. Uma Peça avulsa (sem produto) **não tem** — só tem "Vincular a um produto". Ou seja, o CRUD da Peça muda dependendo de um atributo (estar ou não vinculada) que não deveria mudar o que a Peça É. Isso é o oposto do princípio: o vínculo é **dado sobre** a peça, não **condição de acesso** a ela.

**PRA QUÊ**: esse princípio serve de régua pra avaliar qualquer tela nova ou existente do Catálogo — antes de desenhar uma tela, a pergunta vira "essa peça/produto/marca consegue ser criada, editada e apagada sem eu precisar passar por outro objeto no meio do caminho?". Se a resposta for não, a tela está errada, mesmo que "funcione".

**COMO** (auditoria do estado atual, objeto por objeto):

| Objeto | CRUD completo hoje? | Onde mora | Observação |
|---|---|---|---|
| Marca | ✅ Sim | Tela própria "Marcas e Grupos Fornecedores" | Cadastrar/editar/excluir direto na lista, sem depender de Produto ou Peça. Atalho de "cadastrar marca nova" dentro do formulário de Produto/Peça é só conveniência — não é a única porta de entrada. **Este é o padrão certo.** |
| Grupo Fornecedor | ✅ Sim | Mesma tela de Marca | Mesmo padrão certo da Marca. |
| Produto | ✅ Sim | Tela "Produtos" | Listar/cadastrar/editar/excluir funcionam sozinhos. Marca ser obrigatória aqui não fere o princípio — é dado intrínseco do Produto (ele *tem* uma marca), diferente de precisar navegar por outro objeto pra *agir* sobre este. |
| Peça | ❌ Não | Painéis dentro da tela "Catálogo de Peças" — não tem tela própria | CRUD muda conforme o estado de vínculo (ver "Por quê" acima). Além disso, Peça não tem uma tela própria de verdade — o que existe hoje é um pedaço da tela de Catálogo, misturado com a visão de "peças de um produto específico". |
| Vínculo Peça↔Produto (o registro que guarda a quantidade esperada de cada peça em cada produto) | ⚠️ Parcial, e inconsistente | Espalhado: um fluxo dentro do painel de Peça avulsa (pede código de barras do produto), outro fluxo dentro da tela de Produto (busca peça por nome) | Este é o achado mais importante desta análise — ver próxima seção. |

## O vínculo Peça↔Produto merece ser tratado como uma ação própria

Hoje, "ligar uma peça a um produto" não é uma coisa só — são **duas experiências diferentes**, dependendo de por onde a pessoa começa:

1. **Partindo da Peça avulsa**: ela clica em "Vincular a um produto" no card da peça (que fica na seção "Peças sem produto vinculado", mais embaixo na tela de Catálogo), é levada pro topo da mesma página com um aviso, e precisa **bipar ou digitar o código de barras** do produto pra achar ele.
2. **Partindo do Produto**: dentro da tela do produto (depois de buscar o código de barras dele), existe uma caixa de busca que acha a peça **pelo nome**, com sugestões aparecendo enquanto digita.

Pra quem usa o sistema, isso é a mesma vontade ("ligar essa peça a esse produto") resolvida de dois jeitos diferentes, sem nenhum motivo pra ela adivinhar qual caminho usar dependendo de onde ela estava olhando. O vínculo deveria ser uma ação simples e **igual dos dois lados**: buscar o outro lado pelo nome, escolher, confirmar a quantidade esperada — sem depender de código de barras em mãos, sem trocar de região da tela.

> [!example] Por que o código de barras é um problema real aqui
> Bipar/digitar código de barras faz sentido quando a pessoa está **conferindo uma devolução física** (ela tem a caixa do produto na mão, com o código impresso). Mas ligar peça a produto no Catálogo normalmente acontece **organizando o cadastro**, sem o produto físico na frente — nesse momento, ela lembra o *nome* do produto, não o código de barras dele. Pedir código de barras nesse momento é importar uma exigência de um contexto diferente (a tela de Nova Devolução) pra dentro de um contexto onde ela não faz sentido.

## A causa estrutural: a tela "Catálogo de Peças" tenta ser o lar de 3 coisas ao mesmo tempo

Juntando os dois pontos acima, a causa raiz identificada é: a tela hoje chamada "Catálogo de Peças" empilha três responsabilidades que pertencem a três objetos diferentes, todas na mesma página:

1. Gerenciar as peças de **um** produto específico (depois de buscar o código de barras dele).
2. Ver/gerenciar **todas** as peças soltas do sistema (a seção "Peças sem produto vinculado").
3. Criar peça nova — com o formulário de cadastro aparecendo duplicado em dois lugares da mesma tela (um dentro do fluxo do produto, outro no painel de peça avulsa).

Isso é o que o usuário sentiu como "muito interconectado de uma forma ruim, que gera atrito e não completude" — a tela tenta responder 3 perguntas diferentes ao mesmo tempo, e cada resposta puxa um pedaço de UI diferente, sem se conectar com as outras.

## O fluxo ideal, pensado do ponto de vista da responsável pela devolução

Esta seção descreve a experiência-alvo, sem ainda dizer como cada tela vai se chamar ou onde cada botão vai ficar (isso é o próximo passo, ver "Em aberto").

### As duas "gavetas" que ela precisa ter sempre à mão, do mesmo jeito

- **Gaveta de Produtos** (já existe hoje, já está correta): lista, cadastra, edita, apaga produto — sem nunca ser obrigada a pensar em peça enquanto está aqui.
- **Gaveta de Peças** (não existe como tela própria hoje — precisa passar a existir): lista **todas** as peças, vinculadas ou não — o vínculo vira só um detalhe visual (por exemplo, uma etiqueta mostrando a quais produtos a peça pertence, ou "ainda avulsa"), nunca uma condição pra aparecer ou não o botão de editar/apagar. Cadastrar, editar e apagar peça funcionam sempre do mesmo jeito, não importa se ela tem produto ou não.

### A ação de ligar, como uma ação simples e igual dos dois lados

Não importa se a pessoa está olhando uma peça e pensando "essa é do produto tal", ou olhando um produto e pensando "essa peça devia estar aqui" — as duas situações deveriam abrir a **mesma** experiência: buscar o outro lado pelo nome, escolher, confirmar a quantidade esperada, pronto.

### O primeiro dia dela, contado como ela viveria (sistema recém-instalado, nada cadastrado ainda)

Não existe uma ordem obrigatória — ela faz o que tem na mão primeiro, e nenhum dos dois caminhos trava o outro:

- Se ela tem uma lista de produtos novos → vai na gaveta de Produtos, cadastra um por um. Termina, e nenhum tem peça ainda — isso não é um problema, porque peça não é parte obrigatória do cadastro de produto.
- Se ela tem peças soltas (por exemplo, sobras de devoluções antigas, sem saber ainda de qual produto) → vai na gaveta de Peças, cadastra cada uma. Termina, e nenhuma está ligada a nada ainda — também não é problema.
- Quando ela sabe a relação entre uma peça e um produto → ela liga, de qualquer um dos dois lados, sempre pelo mesmo caminho.
- No dia a dia depois, ela volta em qualquer uma das duas gavetas pra corrigir erro de digitação, trocar foto ou apagar algo cadastrado errado — sempre pelo mesmo lugar, sem se perguntar "onde eu edito isso mesmo".

## Em aberto

- [ ] Desenho concreto da tela "Gaveta de Peças" — nome final da tela, onde ela aparece na navegação (sidebar), como a listagem é organizada (ex: busca, agrupamento, etiqueta de vínculo)
- [ ] Desenho concreto da ação de "ligar peça a produto" como componente único, reaproveitado dos dois lados — como ela abre, o que pede, como confirma
- [ ] O que acontece com a tela atual "Catálogo de Peças" — é substituída inteira, ou vira só a visão "peças de um produto específico" (perdendo as seções de peça avulsa e cadastro, que migram pra gaveta própria de Peças)?
- [ ] Revisão da navegação (sidebar/home) pra incluir a gaveta de Peças como opção própria, no mesmo nível de Produtos
- [ ] Nenhuma tela foi desenhada ainda — o próximo passo, quando o usuário confirmar, é desenhar isso

## Relacionado

- [[Checkpoint - Repensando o Catalogo de Pecas (Peca Independente de Produto)]]
- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
