---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 16/08/2026
atualizado_em: 29/08/2026 23:26
relacionado: [Estrutura e Convenções do Vault, Como Escrever Notas no Vault — Padrao Hiper-Didatico, Guia de Setup - Do Zero ao Primeiro Preco Calculado, Definição do Núcleo de Comportamento Claude, Definição do Núcleo Geral do Vault, Perguntas Sempre em Texto Corrido]
---

# Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)

## Última atualização (29/08/2026, 19:51)

Continuação direta de 29/08 17:25. (10) **Bookmarks de busca criados de verdade**: estrutura simétrica por mundo × tipo (8 mundos × 8 tipos + subgrupo "Pendências Abertas" com 3 buscas por status, mesma pergunta repetida em todo mundo mesmo quando dá 0 resultado hoje) escrita direto em `bookmarks.json`, 88 marcadores no total — encerra o item em aberto da seção 6.9; (11) **LEGADO reclamado e removido**: as 43 notas com conteúdo real do LEGADO foram lidas, reclassificadas nos mundos corretos e marcadas `tags: [Vindo_do_Legado]` (ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]); com a pasta vazia, o usuário apagou `LEGADO/` de vez. Isso deixou órfãs as referências à pasta em 3 lugares de configuração — todas limpas agora: o grupo de bookmarks "LEGADO" (11 marcadores, removidos), a cor de pasta em `customFolderColors` (Colorful Folders) e o `colorGroup` correspondente no Graph View nativo (`graph.json`). Ver tabela da seção 6.5, linha `LEGADO` marcada como retirada.

## Contexto

Decisão do usuário (16/08/2026, 22h40): a partir de hoje, explorar ao máximo o potencial visual e organizacional do Obsidian, não só a escrita das notas (isso já foi endereçado em [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]). Esta nota é um **checkpoint** — um estudo vivo, que deve crescer e ser atualizado conforme o vault for testando e adotando cada recurso, não uma decisão fechada de uma vez só.

Pesquisa feita direto na documentação oficial do Obsidian (`help.obsidian.md`) e no repositório da comunidade (`community.obsidian.md`, GitHub), em 16/08/2026 — os recursos abaixo foram conferidos nas fontes reais, não vieram de memória.

## Por que isso importa pra ESTE vault especificamente

> [!info] O maior trunfo que já temos, sem usar ainda
> Toda nota deste vault já segue um frontmatter **rigidamente estruturado** — `tipo`, `dominio`, `status`, `criado`, `atualizado_em`, `relacionado` (ver [[Estrutura e Convenções do Vault]]). Isso não é comum na maioria dos vaults Obsidian por aí. E é exatamente o tipo de dado que os recursos de "banco de dados" do Obsidian (a seção **Bases**, abaixo) foram feitos pra consultar. Ou seja: o vault já tem a matéria-prima pronta há semanas — só falta a ferramenta certa pra explorar ela.

## Categoria 1 — Recursos NATIVOS (já vêm no Obsidian, zero instalação)

Estes recursos já funcionam agora, sem precisar habilitar nenhum plugin de comunidade nem instalar nada.

### 1.1 — Bases (o achado mais importante desta pesquisa)

**O que é**: um plugin **núcleo** (nativo, já vem instalado, só precisa ser ativado em Configurações → Plugins Núcleo → Bases) que transforma qualquer conjunto de notas numa visão tipo planilha/banco de dados — tabela, lista, cartões ou mapa — filtrando e ordenando pelas `properties` (o frontmatter) de cada nota. Fonte: [Introduction to Bases — help.obsidian.md/bases](https://help.obsidian.md/bases).

**Por que isso é enorme pra este vault**: hoje, toda vez que criamos ou fechamos uma nota, atualizamos manualmente uma linha na tabela do `00_Indice.md` correspondente. Uma Base faz isso **sozinha, ao vivo** — ela lê o `tipo`/`status`/`atualizado_em` de cada nota automaticamente, sem precisar que ninguém edite uma tabela à mão. Ela não substitui o índice (o índice tem o "resumo em texto" de cada nota, que uma Base não escreve sozinha), mas resolve outro problema que o índice não resolve hoje: **"me mostra tudo que está com status aberto, de qualquer mundo, agora"**.

**Como funciona, com exemplo real** — uma Base é um arquivo `.base` (formato YAML) que pode ficar solto no vault ou embutido dentro de uma nota. Exemplo prático, usando o frontmatter que este vault já tem:

```yaml
views:
  - type: table
    name: "Bugs em aberto"
    filters:
      and:
        - 'tipo == "bug_conhecido"'
        - 'status == "ativo"'
    order:
      - file.name
      - dominio
      - atualizado_em
```

Esse bloco, sozinho, gera uma tabela ao vivo com **todo** `bug_conhecido` de **todo** o vault (qualquer mundo, qualquer pasta) que ainda está com `status: ativo` — sem precisar caçar manualmente em `03_Integracao_Sysemp/`, `02_Sistema_Interno/`, etc.

> [!example] Prova de conceito já criada
> Fiz um arquivo `.base` de verdade com essa e mais 1 view, pra mostrar funcionando de verdade, não só em teoria — ver seção "Exemplo prático" no fim desta nota.

> [!success] Resolvido (16/08/2026, 23h) — decisão do usuário
> Mantém `DD/MM/YYYY` como texto, sem migrar pra ISO — decisão final. Motivo do usuário: "é muito melhor pro usuário visualizar", e isso pesa mais que o ganho de filtro por aritmética de data dentro de uma Base. Trade-off aceito conscientemente: Bases continuam filtrando `criado`/`atualizado_em` por igualdade e comparação de texto (funciona pra tudo que já usamos hoje, ex: `status == "ativo"`), só não fazem contas do tipo "notas atualizadas nos últimos 7 dias" sem uma conversão manual. Não é um limite que incomoda na prática hoje — se algum dia incomodar, revisitar aqui.

### 1.2 — Templates (reavaliado: não é necessário pra este vault)

**O que é**: plugin núcleo que insere um texto pré-definido (com variáveis como `{{date}}`, `{{time}}`, `{{title}}`) na nota ativa, através do comando "Inserir modelo" — que alguém aciona à mão, dentro do Obsidian. Fonte: [Templates — help.obsidian.md/plugins/templates](https://help.obsidian.md/plugins/templates).

> [!failure] Reavaliado (16/08/2026, 23h) — não se aplica a este vault
> A recomendação original assumia que alguém ia usar o comando "Inserir modelo" com as próprias mãos. O usuário deixou claro que isso nunca vai acontecer (princípio fundamental #1 em [[Estrutura e Convenções do Vault]]: "eu nunca vou escrever nenhuma nota a mão, vou apenas visualizar e ler elas"). Ou seja, o problema real nunca foi "como o usuário insere um modelo rápido" — é "como garantir que Claude sempre saiba exatamente o que criar e como criar, sozinho, sem errar". Esse problema **já está resolvido**, e não é o Templates que resolve: é [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]] (o padrão de escrita) somado a esta própria nota de convenções (o schema de frontmatter, pastas, tipos) — as 2 notas que Claude lê e segue toda vez antes de criar qualquer nota nova. O "modelo" deste vault não é um arquivo que se insere por comando; é a regra escrita que Claude aplica sozinho, toda vez.
>
> `Modelos_Notas_Obsidian/padrao.md` continua existindo como referência rápida do schema de frontmatter, mas configurar o plugin núcleo Templates não entra mais na lista de prioridades — não resolve nenhum problema que já não esteja resolvido de outra forma.

### 1.3 — Canvas (mapa visual, não é só texto)

**O que é**: quadro branco infinito, nativo e gratuito, pra organizar notas, imagens, PDFs e páginas da web visualmente — cada nota vira um "cartão" que pode ser conectado a outros por setas. Fonte: [obsidian.md/canvas](https://obsidian.md/canvas).

**Por que isso ajuda**: hoje, a única forma de "ver" como as notas de um mundo se relacionam é ler o `relacionado` de cada uma, 1 por 1, ou usar a visão de Grafo (que mostra TODO o vault de uma vez, difícil de focar num assunto só). Um Canvas por mundo (ex: 1 canvas pra "Impostos_Entrada") deixaria visível, de forma espacial, o fluxo real: qual descoberta gerou qual decisão, qual decisão gerou qual checkpoint — sem precisar abrir nota por nota.

**Exemplo de uso concreto pra hoje**: um Canvas com os cards `Migracao da Precificacao Real...` → `Checklist de Execucao...` → `Validacao dos 3 Cenarios...` conectados por seta, mostrando visualmente a linha do tempo da migração de precificação inteira, de uma olhada só.

### 1.4 — Callouts: a lista oficial completa (pra parar de usar só 3-4 tipos)

Já adotamos callouts hoje (`warning`, `tip`, `danger`, `question`, `example`, `success`, `failure`), mas a lista oficial tem mais opções — conferida direto na fonte (fonte: [Callouts — help.obsidian.md/callouts](https://help.obsidian.md/callouts)):

| Tipo | Quando usar | Apelidos que também funcionam |
|---|---|---|
| `note` | Neutro, é o padrão de qualquer tipo não reconhecido | — |
| `abstract` | Resumo no topo de uma nota longa | `summary`, `tldr` |
| `info` | Contexto ou explicação adicional | — |
| `todo` | Item pendente, ainda por fazer | — |
| `tip` | Sugestão, atalho, dica útil | `hint`, `important` |
| `success` | Comportamento correto confirmado | `check`, `done` |
| `question` | Dúvida em aberto, ainda sem resposta | `help`, `faq` |
| `warning` | Armadilha real, algo que já deu problema | `caution`, `attention` |
| `failure` | Jeito errado/proibido de fazer algo | `fail`, `missing` |
| `danger` | Risco sério — pode quebrar produção/perder dado | `error` |
| `bug` | Bug conhecido, documentando o problema em si | — |
| `example` | Exemplo concreto, número real | — |
| `quote` | Citação literal de outra fonte | `cite` |

**Achado extra útil**: dá pra criar um callout **customizado** (cor e ícone próprios) via CSS snippet — por exemplo, um callout `[!fiscal]` com a mesma cor usada pros cards de imposto na tela de produto (ver [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]), deixando a nota e a tela do sistema visualmente consistentes. Não implementado ainda, só um caminho possível.

**Também novo, que não estávamos usando**: callout **dobrável** — adicionar `-` (recolhido) ou `+` (expandido) logo depois do tipo faz o conteúdo virar uma seção que expande/recolhe ao clicar, útil pra callout grande que não precisa ficar sempre visível:

```markdown
> [!warning]- Título de um aviso grande, recolhido por padrão
> O conteúdo só aparece quando alguém clica pra expandir.
```

## Categoria 2 — Plugins de comunidade (precisam ser instalados no Obsidian)

Estes recursos **eu não posso instalar por vocês** — instalação de plugin é uma ação que só acontece dentro do próprio Obsidian (Configurações → Plugins de Comunidade → Procurar), pelo usuário, 1 única vez. Depois de instalado, o uso do recurso em si (escrever a consulta, por exemplo) continua sendo 100% Claude — não conflita com o princípio fundamental #3 de [[Estrutura e Convenções do Vault]].

| Plugin | O que faz | Veredito |
|---|---|---|
| **Dataview** | Linguagem de consulta sobre o frontmatter, mais poderosa que Bases — explicação completa na seção 2.1, logo abaixo | Vale a pena, não urgente |
| **Templater** | Versão avançada do Templates núcleo — permite lógica (`if`, loop) dentro de um modelo inserido à mão | Mesmo motivo do item 1.2: ninguém aqui insere modelo à mão, não é prioridade |

Excalidraw, Iconize, Obsidian Projects e um plugin de TODO foram pesquisados a pedido do usuário em 16/08/2026 — ver "Categoria 3", mais abaixo, com o veredito de cada um.

### 2.1 — Dataview, explicado de verdade: pra que serve e onde ajudaria ESTE vault

O usuário perguntou diretamente: "eu ainda não entendi pra que ele serve ou onde ajudaria". Resposta concreta, sem rodeio:

**O que é, em 1 frase**: uma linguagem de consulta (parecida com SQL) que lê o frontmatter das notas — igual Bases faz — mas com uma diferença estrutural importante: a consulta pode ficar **embutida dentro do corpo de qualquer nota comum**, não só dentro de um arquivo `.base` separado. Fonte: [github.com/blacksmithgu/obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview) — 9,2 mil estrelas no GitHub, projeto ativo, última versão em abril/2025.

**Onde ajudaria, com um problema real deste vault**: hoje, toda vez que uma nota nova é criada ou fechada dentro de `03_Integracao_Sysemp/`, é preciso abrir `00_Indice.md` **à parte** e editar à mão a linha certa da tabela `Nota | Tipo | Status | Data | Resumo` (ver [[Estrutura e Convenções do Vault]]). É um passo manual, repetido toda vez, e que já ficou 1-2 notas atrasado em alguma sessão anterior por esquecimento.

Se o Dataview estivesse instalado, essa tabela poderia nascer de uma consulta embutida direto dentro do próprio `00_Indice.md`, por exemplo:

```dataview
TABLE tipo, status, atualizado_em
FROM "03_Integracao_Sysemp"
WHERE tipo != null
SORT atualizado_em DESC
```

Esse bloco sozinho, dentro da nota, gera uma tabela que se atualiza **sozinha** toda vez que o índice é aberto — sem ninguém (nem Claude) precisar editar mais nenhuma linha à mão. O ganho real não é "mais uma forma de ver dado" (isso Bases já resolve) — é "o índice para de precisar de manutenção manual".

**Por que isso não dá pra fazer com Bases hoje**: uma view de Bases só existe dentro do próprio arquivo `.base`, separado de qualquer nota — ela não pode ser colada dentro do corpo de `00_Indice.md` junto com o resto do texto. Essa é a diferença estrutural real entre os 2: **Bases** = "arquivo de visão à parte, fora das notas"; **Dataview** = "consulta que mora dentro de qualquer nota, misturada com a prosa normal ao redor dela".

**Custo de adoção**: instalação manual, 1 vez, pelo usuário (Configurações → Plugins de Comunidade → Procurar "Dataview" → Instalar → Ativar). Depois disso, toda consulta em si é texto simples que Claude escreve sozinho — respeita o princípio fundamental #3.

**Veredito**: vale a pena adotar, mas não é urgente. O ganho é real (o índice deixa de precisar de edição manual, elimina um risco de atraso/esquecimento), mas o índice manual de hoje também funciona — só dá mais trabalho. Fica registrado como o próximo passo natural, quando o usuário quiser instalar o plugin.

## Categoria 3 — Recursos pesquisados a pedido do usuário (16/08/2026)

O usuário pediu pra investigar 5 links específicos. Pesquisa feita direto nas fontes (site oficial do plugin, página do plugin em `community.obsidian.md`, ou repositório no GitHub) — não veio de memória. Veredito de cada um, sempre confrontado com os 4 princípios fundamentais de [[Estrutura e Convenções do Vault]].

### 3.1 — Iconize (ícones em arquivos, pastas e texto)

**O que é**: plugin de comunidade que adiciona ícones a arquivos, pastas e texto dentro de notas. Fonte: [florianwoelki.github.io/obsidian-iconize](https://florianwoelki.github.io/obsidian-iconize/).

> [!failure] Veredito: não adotar agora — baixa prioridade
> Dois motivos, ligados aos princípios fundamentais. Primeiro (princípio #2): o problema deste vault nunca foi "difícil de identificar visualmente" — os callouts (já nativos, sem plugin nenhum) já carregam ícone e cor por tipo (`warning`, `tip`, `danger`...), então o ganho de ícone extra é puramente estético, e estética é o último critério, não o primeiro. Segundo (princípio #3): atribuir ícone a um arquivo/pasta específico normalmente é feito clicando na interface do Iconize — não é algo que Claude escreveria de forma confiável só editando texto. O único uso do plugin que Claude conseguiria fazer sozinho, com texto puro, seria um ícone solto **dentro** do corpo de uma nota — e isso já não resolve nenhum problema real que temos hoje.

> [!warning] Atualizado (28/08/2026) — usuário instalou mesmo assim, e o cenário mudou
> O usuário instalou o Iconize por conta própria nesta retomada (ver seção "Categoria 4" abaixo) e testou criando 1 ícone manualmente. 3 achados novos, confirmados direto na página oficial do plugin (não por memória):
> 1. O plugin **suporta, sim, atribuição automática via frontmatter** ("Frontmatter integration", documentado oficialmente) — o motivo original de descarte ("só dá pra atribuir por clique na interface") estava incompleto; existe um caminho que Claude conseguiria escrever por texto puro, sem violar o princípio fundamental #3.
> 2. O projeto está marcado oficialmente como **"Project Deprecation and End of Maintenance"** — última atualização há 2 anos, sem manutenção futura confirmada. Risco real de quebra numa atualização futura do Obsidian, sem correção.
> 3. Achado um possível substituto ativo, sugerido na própria página do Iconize: **Iconic** — escopo igual ou maior (ícones em arquivo/pasta/aba/bookmark/tag/propriedade/comando). Ainda não investigado a fundo.
>
> **Decisão pendente, registrada aqui**: usuário quer o guia de configuração automática do Iconize (via frontmatter/regra, não manual) **caso ele seja mesmo o escolhido** — condicionado a não encontrarmos opção melhor (Iconic é a candidata natural a comparar antes de decidir). Nada implementado ainda.

### 3.2 — Lucide (o conjunto de ícones, não um plugin)

**O que é**: não é um plugin — é a biblioteca de ícones que o próprio Obsidian já usa internamente na sua interface nativa, incluindo o `--callout-icon`, que já customiza o ícone de um callout via CSS. Fonte: [lucide.dev/icons](https://lucide.dev/icons/).

> [!info] Já é usável hoje, sem instalar nada — só um catálogo de referência
> Se algum dia quisermos customizar a cor/ícone de um callout via CSS snippet (ex: um `[!fiscal]` com a cor usada nos cards de imposto, ideia já registrada na seção 1.4), o nome do ícone Lucide a usar viria deste catálogo. Não é uma ação a tomar agora — é só o lugar certo pra consultar quando/se a ideia da seção 1.4 avançar. Baixa prioridade, mesmo motivo do item 3.1 (estética por último).

### 3.3 — Excalidraw (desenho livre)

**O que é**: plugin de comunidade maduro e muito baixado (7,2 milhões de downloads) que integra desenho livre estilo quadro branco dentro do Obsidian. Fonte: [community.obsidian.md/plugins/obsidian-excalidraw-plugin](https://community.obsidian.md/plugins/obsidian-excalidraw-plugin).

> [!failure] Veredito: não adotar — conflita com o princípio fundamental #3
> Um desenho do Excalidraw é salvo como um arquivo JSON com a posição exata (coordenadas x/y), cor e formato de cada traço/forma — pensado pra alguém desenhar com mouse ou caneta, não pra ser gerado por texto. Diferente do Mermaid (que é texto declarativo simples: "essa caixa aponta pra aquela") ou do Canvas nativo (JSON simples de cartões conectados, que Claude já consegue escrever direto), o formato do Excalidraw não é algo que Claude conseguiria montar de forma confiável e correta escrevendo JSON à mão — o risco de erro é alto e o resultado não seria um "rabisco" de verdade, só um JSON de forma geométrica bruta. Mermaid (diagramas) + Canvas (mapas de cartões conectados), os 2 já nativos, cobrem a necessidade real deste vault sem esse risco. Vale registrar: o próprio autor do plugin recomenda usar poucos plugins de comunidade (é um projeto de 1 pessoa só, hobby), o que reforça não adicionar mais um sem ganho real.

### 3.4 — Obsidian Projects (visões de projeto tipo Notion)

**O que é**: plugin de comunidade que cria visões tipo Tabela/Quadro/Calendário/Galeria sobre notas, parecido com um board de projeto. Fonte: [github.com/obsmd-projects/obsidian-projects](https://github.com/obsmd-projects/obsidian-projects) (originalmente de `marcusolsson`).

> [!failure] Veredito: não adotar — projeto descontinuado e redundante com Bases
> O próprio autor anunciou, em maio de 2025, que descontinuou o plugin ("não uso mais o Obsidian, nem acompanho mais o ecossistema de plugins") — o repositório está **arquivado** (somente leitura) desde julho de 2025, e o plugin foi removido da lista oficial de plugins de comunidade (só instalável hoje por um instalador de terceiros, o BRAT). Além de estar sem manutenção, ele resolveria exatamente o mesmo problema que Bases (nativo, sem instalar nada, já validado funcionando) resolve hoje: visão tipo tabela sobre o frontmatter das notas. Não faz sentido trocar um recurso nativo e já funcionando por um plugin de terceiro, abandonado, que faz a mesma coisa.

### 3.5 — Plugin de TODO (larslockefeer/obsidian-plugin-todo)

**O que é**: plugin de comunidade que junta todos os `- [ ]` (caixinhas de tarefa) espalhados pelo vault numa lista única, dividida em "Hoje/Agendado/Inbox/Algum dia" (estilo GTD). Fonte: [github.com/larslockefeer/obsidian-plugin-todo](https://github.com/larslockefeer/obsidian-plugin-todo).

> [!failure] Veredito: não adotar — não é como este vault rastreia pendência
> Este plugin assume que "pendência" é uma linha de checkbox solta dentro do corpo de uma nota (`- [ ] fazer algo #2026-08-20`). Este vault não funciona assim — aqui, uma pendência é a **nota inteira**, com `status` no frontmatter (`duvida` com `status: ativa`, `bug_conhecido` com `status: ativo`, `checkpoint` com `status: em_andamento`). É exatamente esse padrão — nota inteira como unidade de status — que a Base já criada (`Bases/Vault - Pendencias Abertas.base`) já resolve, de forma nativa e sem instalar nada. Adicionar este plugin significaria também manter um segundo sistema de pendência (checkbox solto) em paralelo ao que já existe e já funciona — mais complexidade, sem ganho real. Vale registrar como contexto adicional: é um projeto pequeno (300 estrelas, mantido por 1 pessoa), com itens do próprio roadmap ainda em aberto há tempo.

## Categoria 4 — Retomada em 28/08/2026: de estudo de ferramentas pra reestruturação de propósito do vault

### 4.1 — Por que parar agora, com o sistema ainda saudável

O usuário decidiu pausar trabalho de código/dado pra tratar disso como prioridade única e essencial — não é mais só "explorar recurso do Obsidian", é uma reestruturação de fundo.

> [!danger] Diagnóstico do usuário, literal (28/08/2026)
> "O vault esta crescendo rapido, e exponencialmente rapido... até aqui você tem lidado bem com isso, mas está se tornando cada vez mais difícil guiar você. Você tem perdido as regras de comportamento com frequência, tem desrespeitado algumas convenções, tem demorado para ler e escrever arquivos... é como se você não tivesse um caminho claro para navegar." Decisão de agir agora ("enquanto as coisas ainda funcionam") em vez de esperar o ponto de ruptura ficar caro de consertar.

> [!example] Evidência real, encontrada na mesma sessão (28/08/2026), sem precisar procurar
> Ao sincronizar com o `origin/dev` e revisar o vault, apareceram **2 checkpoints desconectados sobre o mesmo assunto** (Hub de Fotos): um em `04_Integracao_Mercado_Livre/Qualidade_Visual_de_Anuncios/`, detalhado, construído ao longo de várias sessões; outro em `02_Sistema_Interno/Hub_de_Fotos/Checkpoints/`, criado numa sessão em outro computador, que não sabia que o primeiro existia (a nota nova chega a afirmar "esta é a primeira nota deste domínio" — o que não é verdade). Prova concreta de que a ancoragem fraca já está gerando erro real, não é um risco teórico.

### 4.2 — 2 vias de melhoria, com públicos e critérios diferentes

1. **Pensando em humano**: o vault precisa ser organizado, visualmente navegável, didaticamente legível e extremamente compreensível. O usuário (ou qualquer outra pessoa) precisa conseguir visualizar, navegar, encontrar dado, ler de forma didática e compreender o que foi escrito.
2. **Pensando em LLM**: o vault precisa ser navegável por pontos de ancoragem claros, com o MÍNIMO de leitura possível pra localizar qualquer informação ou arquivo — sem percorrer o vault todo, sem se perder, sem gastar contexto à toa. Nomenclatura, tags e qualquer outro recurso que gere resultado real entram nessa discussão.

São exigências diferentes (percepção visual/clareza de leitura vs. indexação/previsibilidade estrutural), mas nascem do mesmo sintoma: o vault cresceu mais rápido que a estrutura que o sustenta.

### 4.3 — Princípio fundamental novo: o vault tem 2 FUNÇÕES, nenhuma pode regredir

> [!danger] Regra não-negociável (28/08/2026) — critério de sucesso/veto pra qualquer proposta futura desta reestruturação
> O vault serve 2 funções ao mesmo tempo, e a reestruturação não pode sacrificar uma pela outra:
> 1. **Acumular conhecimento real** (a motivação nova desta rodada) — o vault vira o lugar onde pesquisa e trabalho se transformam em entendimento genuíno, não só registro de execução. Nas palavras do usuário: "não é mais sobre guardar informações, é sobre estudar e aprender... como um aluno que estuda sobre temas pra uma prova, e anota o conhecimento aprendido de forma organizada... como alguém que está pesquisando profundamente um tema e cria notas de conhecimento que se acumulam e o guiam durante sua pesquisa."
> 2. **Guiar Claude-como-LLM através da execução** — regras de comportamento, checkpoints, contexto de frente de trabalho, limite claro do que fazer/não fazer. Isso já existe e já funciona hoje (ver [[Estrutura e Convenções do Vault]] e `02_Sistema_Interno/Regras_de_Comportamento/`) e precisa continuar funcionando **pelo menos tão bem quanto hoje — o usuário espera que fique ainda mais robusto e eficiente depois desta reestruturação, não o contrário.**
>
> Qualquer proposta desta reestruturação que deixe a leitura/escrita mais bonita ou didática, mas arrisque regra de comportamento perdida, checkpoint mal atualizado, ou navegação mais lenta em execução, **não é aceitável** — funciona como critério de veto, não como detalhe de acabamento.

### 4.4 — Achado próprio: as 2 funções já têm esqueleto parcial na estrutura atual (hipótese, não validada com o usuário ainda)

> [!tip] Observação registrada como hipótese, a validar antes de agir
> O schema de `tipo` já existente (`regra`, `decisao`, `descoberta`, `duvida`, `bug_conhecido`, `conceito`, `checkpoint`, `tutorial`) parece já separar as 2 funções, sem ter sido desenhado explicitamente assim: `Regras_de_Comportamento/` e `checkpoint` puxam mais pra função 2 (guiar execução); `decisao`, `descoberta`, `conceito` puxam mais pra função 1 (conhecimento acumulado) — só que hoje muitas notas desses tipos ainda são escritas com "sotaque de log de execução" ("fizemos X, decidimos Y") em vez de "sotaque de entendimento" (por que X funciona, o que isso ensina sobre o domínio). Se essa leitura estiver certa, parte da reestruturação pode ser menos "inventar separação nova" e mais "aprofundar/reforçar uma que já existe em esqueleto".

### 4.5 — Ferramentas exploradas nesta rodada (28/08/2026)

- **Tema "Minimal Dracula"** — instalado pelo usuário. Tema de aparência (paleta cinza/azul, inspirada em Dracula), sem relação com organização/navegação — resolve só contraste visual. Maduro (2 anos de existência, atualizado há 2 meses, 11k downloads, GPL-3.0).
- **Omnisearch** — instalado pelo usuário, com atalhos configurados: `Ctrl+F` pra busca local no arquivo, `Ctrl+L` pra busca no vault inteiro. Motor de busca com ranqueamento BM25 (pondera nome de arquivo, cabeçalhos e conteúdo — reforça a importância de nomenclatura/cabeçalho bem feitos), tolerante a erro de digitação, indexa PDF/imagem via OCR (plugin irmão Text Extractor). Muito maduro (4 anos, 1,8M downloads, prêmio "Gems of the Year 2023" da própria Obsidian).
  - Achado à parte: existe um projeto de terceiros (`obsidian-mcp-server`) que expõe o Omnisearch como ferramenta de busca BM25 pra agentes de IA via MCP — poderia, em tese, virar uma forma de o Claude buscar no vault sem varrer pasta por pasta.
  - **Descartado por ora**: usuário avaliou que MCP aumenta complexidade demais agora ("não sei usar MCP, não sei configurar, não sei como ficaria pedir pra você ler/escrever no vault") — fica registrado como ideia de futuro, não descartada pra sempre.
- **Iconize** — ver atualização na seção 3.1 acima (achado da integração automática via frontmatter + descoberta de que está descontinuado + candidato "Iconic" a comparar). Decisão de configuração automática **pendente**, condicionada a não haver opção melhor.

### 4.6 — Evidência visual (prints do vault atual, trazidos pelo usuário em 28/08/2026)

5 prints como referência do estado visual atual: nota de conceito com propriedades bem preenchidas e `relacionado` colorido por mundo; o tutorial de setup (`Guia de Setup - Do Zero ao Primeiro Preco Calculado`) com tabela/bloco de código/callout de aviso funcionando como desenhado; o índice do Sysemp (`03_Integracao_Sysemp/00_Indice.md`) com a tabela padrão populada; e a **Visualização em Grafo nativa do Obsidian**, mostrando centenas de notas em blobs densos de cor por mundo — ilustração visual direta do "crescimento exponencial" citado como motivação, difícil de ler/navegar só olhando o grafo.

## Categoria 5 — Seleção e teste real dos plugins (29/08/2026, madrugada)

### 5.1 — Regra final de adoção: "100% autônomo e auto-contido"

> [!danger] Regra dura, aplicável a qualquer ferramenta futura (28/08/2026, confirmada e refinada nesta madrugada)
> Citação literal do usuário: "A regra é se você não consegue fazer 100% autônomo e auto-contido, não usamos." Refinamento do próprio usuário, logo em seguida: uma configuração manual **1 vez** (definir um padrão/regra dentro do painel de um plugin) é válida e útil — o que precisa ser automático é o uso do dia a dia **depois** dessa configuração inicial. Equivale ao precedente já aceito de instalar um plugin ou ativar o Bases (ações manuais únicas). Motivo do usuário: "é justamente isso que estamos buscando, parar de inventar dinamicamente coisas e padronizar de forma robusta."

### 5.2 — Mapeamento função → plugin (feito antes de instalar, pra achar sobreposição)

Cada plugin foi analisado pela função/objetivo que cumpre, não pelo nome — objetivo: nenhuma responsabilidade duplicada entre 2 plugins.

| Função/objetivo | Plugin confirmado | Observação |
|---|---|---|
| Nomenclatura de pastas/arquivos/tags | — (convenção, não plugin) | Já coberto por [[Estrutura e Convenções do Vault]] |
| Agrupamento com responsabilidade clara | — (estrutura de pastas, não plugin) | Idem |
| Cor de pasta (hierarquia estrutural) | Colorful Folders | Restrito só a essa função — ver 5.3 |
| Cor por classificação semântica (`tipo`/`status`) | Tags Color Files | Depende de tag, não de property — ver 5.4 |
| Ícone de arquivo/pasta no explorer | Iconic | Substitui o Iconize (descontinuado) |
| Ícone dentro do corpo da nota | Iconoir Icons | Não conflita com Iconic — camadas diferentes (explorer vs. conteúdo) |
| Tema visual de base | Minimal Dracula | Já instalado, decisão de 16/08 |
| Busca | Omnisearch | Já instalado, decisão de 16/08 |
| Realce de sintaxe em bloco de código | Shiki Highlighter | Sem concorrente |
| Anotação manual de texto | ❌ Reader Highlighter Tags | Descartado — fere princípio #1 (usuário nunca anota manualmente) |
| Cor manual por item | ❌ Explorer Colors | Descartado — falha a regra 100% autônomo (manual item a item) |

### 5.3 — Interferências resolvidas antes de instalar

- **Iconize → Iconic**: mesma função (ícone de arquivo/pasta). A própria documentação oficial do Iconic avisa que usar os 2 juntos gera "briga" pelo controle do ícone da aba. Iconize também está marcado como "Project Deprecation and End of Maintenance". Iconic está ativo (atualizações recentes, 226k downloads) e cobre a mesma necessidade via regra de **Properties** — lê `tipo`/`status` do frontmatter direto, sem precisar de tag nova.
- **Colorful Folders restrito**: além de cor de pasta, o plugin também tem "Tag Color Sync" (cor por tag) e "Auto-Icon Engine" (ícone automático por nome do item) — que competiriam com Tags Color Files e com Iconic, respectivamente. Decisão: configurar só cor de pasta + Graph View Sync, sem habilitar as outras 2 funções dele.

### 5.4 — A questão da duplicação de informação (`tipo`/`status` vs. tag)

O usuário levantou um ponto importante: criar uma tag nova só pra alimentar os plugins de cor, espelhando o valor que já existe em `tipo`/`status`, duplicaria a mesma informação em 2 lugares — o mesmo tipo de problema que já causou erro real neste vault (ver seção 4.1, os 2 checkpoints desconectados do Hub de Fotos). 3 caminhos foram considerados:

- **Caminho A — tag espelhando `tipo`/`status` (aditivo)**: mantém a property como fonte de verdade, adiciona tag redundante só pros plugins de cor lerem. **Descartado** — gera duplicação real.
- **Caminho B — substituir 100% por tag, sem cuidado extra**: rápido, mas arrisca perder a separação clara entre `tipo` e `status` numa tag simples e achatada.
- **Caminho C — substituir `tipo`/`status` por tag hierárquica (`tags: [tipo/checkpoint, status/em_andamento]`), única fonte de verdade**: elimina a duplicação, mantém `tipo` e `status` como categorias distintas (usando `/` do Obsidian pra tag aninhada), alimenta os plugins de cor nativamente. **Escolhido como direção final** — como migração em etapas, não um "big bang" (motivo na seção 5.5).

> [!info] Correção registrada (29/08/2026) — vocabulário fechado não é exclusividade de property
> Eu (Claude) tinha afirmado que a property `tipo:` tem "vocabulário fechado" e uma tag não teria essa garantia. Estava errado: o Obsidian não valida vocabulário em nenhum dos 2 casos — o "fechamento" de `tipo` sempre existiu só por convenção documentada + disciplina de quem escreve a nota (neste vault, eu mesmo). Uma tag teria exatamente a mesma disciplina. Não era motivo real pra preferir property sobre tag.

### 5.5 — Achado técnico: o vocabulário já está inconsistente na prática, antes mesmo de qualquer migração

Levantamento real rodado no vault inteiro (29/08/2026, madrugada), via grep — não suposição:

- 308 notas têm `tipo:`, 308 têm `status:` — cobertura completa, nenhuma nota órfã.
- Única dependência real de leitura encontrada fora da própria doc de convenção: `Bases/Vault - Pendencias Abertas.base` (3 filtros: `tipo == "bug_conhecido"`, `tipo == "checkpoint"` + `status == "em_andamento"`, `tipo == "duvida"` + `status == "ativa"`) e o molde `Modelos_Notas_Obsidian/padrao.md` (só campos vazios). Nenhum outro script ou Dataview depende do formato atual.
- **O vocabulário documentado já vazou na prática**: existem notas com `tipo: Bug Conhecido` e `tipo: Decisão` (capitalizado/acentuado, fora do padrão `snake_case` minúsculo), e com `tipo: diretriz` e `tipo: prompt` — **valores que não existem** na lista fechada documentada em [[Estrutura e Convenções do Vault]] (`regra|decisao|descoberta|duvida|bug_conhecido|conceito|checkpoint|tutorial`). O mesmo vale pra `status:` (`Ativo`, `Resolvido` capitalizados, fora do padrão).

> [!warning] Pendência real, independente da decisão de plugin
> Antes de migrar `tipo`/`status` pra tag (Caminho C), essas notas fora do padrão precisam ser resolvidas (decidir se `diretriz`/`prompt` são tipos novos legítimos, nunca documentados, ou erro de digitação a corrigir). Decisão explícita do usuário (29/08): **migração em etapas, sem pressa** — não é pra sofrer reescrevendo o vault inteiro de uma vez. Fica registrado como trabalho futuro, não bloqueia o teste dos plugins.

### 5.6 — Testes reais executados (29/08/2026, madrugada)

Os 5 plugins finais foram instalados e ativados pelo usuário (Iconize já sai da lista de plugins instalados, confirmando a troca pelo Iconic): **Iconic, Iconoir Icons, Colorful Folders, Tags Color Files, Shiki Highlighter** — mais os 2 já existentes, Omnisearch e Minimal Dracula.

> [!success] Confirmado na prática — Tags Color Files funciona com tag aninhada
> Teste: nota `_teste_tag.md` criada com `tags: [tipo/checkpoint]` no frontmatter. Regra criada em Tags Color Files (`contains` + `tipo/checkpoint` → cor). Resultado: nota apareceu colorida no explorer **e** também dentro de uma visão de Bases (toggle "Color file names in Bases" testado à parte, confirmado funcionando pelo usuário). Isso valida tecnicamente o Caminho C (seção 5.4) — tag aninhada `tipo/x` funciona de verdade; a documentação oficial do plugin não confirmava isso, só foi possível saber testando na prática.

> [!success] Confirmado na prática — Iconic
> Regra criada (Properties: `tipo` is `checkpoint`, condição "All") → **18 arquivos batendo**, ícone aplicado automaticamente em todos, sem editar nenhuma nota. Confirma que regra por Properties é retroativa: aplicou em toda nota que já tinha `tipo: checkpoint` escrito há semanas, não só em notas novas.

> [!success] Confirmado na prática — Iconoir Icons
> Sintaxe precisa estar dentro de crase (code span) — `` `~![iconoir-check-circle|green|1.5em|1.5em]` `` — não como texto solto (isso gerou 1 falso-negativo no primeiro teste, corrigido). Com a crase, renderizou corretamente em Reading view.

> [!success] Confirmado na prática — Shiki Highlighter
> Bloco `python` com `def`/`return`/string renderizou com cores de sintaxe distintas. Achado extra: por ser plugin de renderização (não altera o arquivo), ele já colore **retroativamente** qualquer bloco de código já existente em notas técnicas antigas do vault, sem precisar editar nada — mesmo comportamento retroativo confirmado no Iconic, acima.

> [!warning] Bug real confirmado no Console — depois corrigido (ver 5.8)
> Nunca registrou aba de configuração própria, mesmo depois de desinstalar/reinstalar/reiniciar o app inteiro (3 tentativas). Console de desenvolvedor do Obsidian mostrou a causa real:
> ```
> plugin:colorful-folders:1036 Colorful Folders: Exception in plugin onload TypeError: Cannot read properties of null (reading 'customIcons')
>     at Ii.loadSettings (plugin:colorful-folders:1036:17630)
>     at async Ii.onload (plugin:colorful-folders:1036:7423)
> plugin:colorful-folders:1036 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'lastVersion')
> ```
> Causa real, confirmada depois via inspeção direta da pasta do plugin: não existia **nenhum `data.json`** (nem corrompido, nem válido — simplesmente ausente). O plugin não trata o caso "primeira execução, sem config nenhuma ainda" — espera um objeto já existente e quebra com `null`/`undefined`. Bug de inicialização real do plugin (v5.0.5), não erro de uso. Curiosidade: a página oficial mostrava "Health: Excellent" / "Review: Passed" — os selos do `community.obsidian.md` não pegaram esse bug. Lição pra próxima avaliação de plugin: selo de saúde não garante funcionamento real, só teste na prática confirma.
>
> **Fix aplicado (usuário, com apoio de pesquisa externa no Gemini)**: criado manualmente um arquivo `data.json` com `{}` dentro de `.obsidian/plugins/colorful-folders/`, forçando o plugin a partir de um estado válido em vez de `null`. Funcionou de primeira — plugin passou a carregar normal e a aba de configuração apareceu.

### 5.8 — "Cor demais": diagnóstico e ajuste fino da configuração padrão

Depois de restaurado, o Colorful Folders foi configurado (paleta + Graph View Sync), mas o resultado visual ficou carregado demais — cor de pasta, subpasta e até arquivo individual todos competindo ao mesmo tempo, "engolindo" o que o Tags Color Files e o Iconic já mostravam. Auditoria completa das 4 abas de configuração (General, Features, Icons, AI) encontrou 6 causas reais, todas com origem no **padrão de fábrica agressivo do plugin**, não em nada que tivéssemos configurado errado antes:

| Causa | Valor de fábrica | Efeito |
|---|---|---|
| `colorMode` | `cycle` | Cada subpasta ganha cor nova em sequência, sem herdar da pasta-mãe |
| `fileColorMode` + `colorText` | `mixed` / `all` | Arquivo individual também ganha cor de texto por hash do nome — brigando direto com o Tags Color Files |
| `rainbowRootText` | `true` | Gradiente arco-íris no nome das pastas de topo |
| `outlineOnly` | `false` | Preenchimento de fundo sólido em vez de só contorno |
| `autoIcons` (aba Icons) | `true` | Auto-Icon Engine ligado — o mesmo que já tínhamos decidido manter desligado, por competir com o Iconic |
| `tagSyncMatchFolders` | `true` | Sub-regra de sincronia de cor por tag ativa, mesmo com o "Tag Color Sync" principal desligado |

> [!info] Achado à parte, não usado — AI Auto-Icon Classifier
> A aba "AI" tem um classificador de ícone experimental via LLM local (Ollama, modelo `qwen2.5:1.5b`), que classificaria e atribuiria ícone a todo o vault via IA. Não foi acionado (fica desligado por padrão, precisa clique explícito em "Auto-assign icons with AI") — registrado aqui só pra não ser ativado sem querer no futuro, já que competiria direto com o Iconic.

**Correção aplicada**: usuário sugeriu editar o `data.json` direto (mais rápido que navegar pelas 4 abas). Com o Obsidian fechado, 6 chaves foram alteradas diretamente no arquivo: `colorMode` → `monochromatic`, `outlineOnly` → `true`, `autoIcons` → `false`, `rainbowRootText` → `false`, `colorText` → `folders`, `tagSyncMatchFolders` → `false`. `fileColorMode` foi deixado como estava — irrelevante depois que `colorText` passou a excluir arquivos.

> [!success] Confirmado na prática — resultado final limpo
> Depois de reabrir o Obsidian: 1 cor de texto por mundo (pasta de topo), sem preenchimento pesado, sem ícone automático, sem gradiente. `colorMode: monochromatic` e `colorText: folders` foram valores "chutados" (o JSON aceita texto livre, sem dropdown pra confirmar) — funcionaram de primeira, sem precisar de fallback pelo menu visual.

### 5.9 — Pilha final confirmada (29/08/2026, 01:25)

**5 plugins, todos testados e funcionando, zero interferência entre eles**: Iconic (ícone de arquivo/pasta por `tipo`/`status`), Iconoir Icons (ícone inline no corpo da nota), Tags Color Files (cor por tag, incluindo tag aninhada), Shiki Highlighter (realce de código), Colorful Folders restrito (cor de pasta por mundo + Graph View Sync). Mais os 2 já existentes de antes desta rodada: Omnisearch (busca) e Minimal Dracula (tema).

Único ponto que segue em aberto pra tornar essa pilha totalmente proveitosa no vault real (não só na nota de teste): a migração do Caminho C (seção 5.4/5.5) — sem ela, a cor por classificação semântica do Tags Color Files só alcança notas novas, não as 308 já existentes.

> [!question] Usuário sinalizou dúvidas ainda em aberto (29/08, 01:25)
> Ainda não detalhadas nesta mensagem — a esclarecer na conversa antes de considerar esta frente de trabalho encerrada.

## Categoria 6 — Fonte única de cor, padronização por camadas e correção estrutural (29/08/2026)

### 6.1 — Graph View: grupos manuais substituídos pela sincronia do plugin

Grupos de cor manuais no Graph View nativo (path-based, criados antes de qualquer plugin) coexistiam com o que o Colorful Folders geraria via "Graph View Color Sync" → "Sync now" — 2 fontes de cor pro mesmo grafo, risco de duplicidade. Resolvido: grupos manuais apagados, "Sync now" acionado — gerou 8 grupos novos, 1 por mundo, direto das cores já configuradas no plugin. Fonte única confirmada: cor do grafo passa a vir sempre do plugin, nunca de grupo manual solto.

### 6.2 — Cor por tag e "quem define a cor" — pausados, não configurados ainda

2 perguntas do usuário ficaram sem resposta aplicada: (1) quem/onde define qual cor cada coisa recebe hoje — resposta dada: hoje vem do algoritmo automático do plugin (`colorMode`), não de escolha deliberada; usuário pediu pra **não editar ainda**, só pensar; (2) interesse em configurar "Tag Color Sync" (cor por tag do Colorful Folders) — usuário confirmou querer, mas a conversa foi interrompida pela discussão maior de padronização (seção 6.3) antes de qualquer configuração acontecer. Os dois seguem em aberto.

### 6.3 — Framework de padronização por camadas (mundo → tipo)

Decisão de sequenciar "da pasta maior pra menor": primeiro decidir cor/ícone dos **mundos** (Camada 3 — pasta raiz, ex: `02_Sistema_Interno`), só depois decidir cor/ícone por **tipo** (Camada 1 — `regra`, `decisao`, etc.), que pode aparecer em qualquer mundo. Motivo da ordem: mundo já é 100% determinado pelo caminho do arquivo (não precisa de tag/property nova, só regra de path no próprio plugin); tipo depende de regra do Iconic por Properties, porque uma nota `tipo: decisao` pode morar em qualquer mundo. Framework de tipo simplificado pra 3 colunas (Nomenclatura | Ícone | Cor — a coluna "Tag Específica" cogitada antes foi descartada, mundo não precisa dela). Tabela de cor por tipo continua **não confirmada** — fica pra próxima rodada, depois da Camada 3.

### 6.4 — Limite real do Iconic: sem upload de ícone customizado

Confirmado direto na documentação oficial do plugin: Iconic só aceita os ~1.700 ícones do catálogo Lucide + ~1.900 emoji de dispositivo — nenhum upload de SVG próprio. O Colorful Folders, em contraste, tem gerenciamento de ícone customizado (aceita SVG/pacote próprio) — mas ele foi deliberadamente restrito só a cor de pasta + Graph Sync (Categoria 5), então essa capacidade dele fica sem uso por decisão de escopo, não por limite técnico.

### 6.5 — Camada 3 (mundo): tabela final decidida e aplicada de verdade

Cor e ícone por mundo, decididos junto com o usuário e escritos de verdade no `data.json` do Colorful Folders (`customFolderColors`, 29/08/2026, 15:30, com o Obsidian fechado durante a edição). **Atualizado em 29/08/2026, 22:20** — renumeração de mundo (ver [[Estrutura e Convenções do Vault]], seção "Os mundos") e novo núcleo criado:

| Mundo | Cor (hex) | Ícone |
|---|---|---|
| `00_Nucleo_Comportamento_Claude` | `#f6893b` | `bot` (Lucide) |
| `01_Nucleo_Geral_Vault` | `#14B8A6` | `book-open` (Lucide) |
| `02_Nucleo_Engenharia_Repositorio` | `#60788a` | `tabler-settings-code` (Tabler) |
| `03_Sistema_Interno` | `#3B82F6` | `server` (Lucide) |
| `04_Integracao_Sysemp` | `#6366F1` | `receipt` (Lucide) |
| `05_Integracao_Mercado_Livre` | `#FBBF24` | `shopping-cart` (Lucide) |
| `06_Producao_de_Imagens_e_Videos` | `#703bf6` | `camera` (Lucide) |
| `Bases` | `#6B7280` | `database` (Lucide) |
| ~~`LEGADO`~~ | ~~`#4d0003`~~ | ~~`archive`~~ |

> Linha mantida como registro histórico — `LEGADO/` foi removida do vault em 29/08/2026 (19:51); entrada retirada de `customFolderColors` (Colorful Folders) e do `colorGroup` correspondente em `graph.json`.

> [!info] `02_Nucleo_Engenharia_Repositorio` (novo, 29/08/2026, 22:02-22:20)
> Terceiro núcleo, irmão de `00_`/`01_` — reúne as 10 notas de engenharia de código (Python/Django/testes/GoF/API client/git) que antes moravam em `02_Sistema_Interno/Regras_de_Comportamento/`. Motivo: elas nunca foram exclusivas de `02_` — já valiam também pra `03_Sysemp`/`04_ML`, então por definição já eram "universais" (regra: nota que serve mais de 1 mundo é núcleo, não fica dentro de um mundo específico). Cor escolhida pra não repetir nenhum tom já usado (evitar verde, "chamativo demais" — usuário preferiu tom acinzentado/slate). Ícone sugerido por Claude (`code`, Lucide) foi trocado pelo usuário direto na interface do Obsidian, depois de ver como ficava — `tabler-settings-code` é a escolha final.

Schema real confirmado lendo direto o código-fonte instalado do plugin (`main.js`, não a documentação — que não detalha isso) — chave é o `path` exato da pasta (pra pasta-raiz, é o próprio nome dela), valor é um objeto `{hex, iconId, applyToSubfolders: true, applyToFiles: false}`. `applyToFiles: false` mantém a decisão já tomada na seção 5.8 (cor só em pasta, nunca em arquivo individual — evita competir com Tags Color Files/Iconic).

### 6.6 — Em paralelo: correção estrutural 00/01/02 (detalhe nas notas dedicadas, não duplicado aqui)

Durante esta mesma janela de trabalho, uma reorganização de pastas maior aconteceu — não é o foco desta nota (que é sobre plugin/visual), então o detalhe completo mora em [[Definição do Núcleo de Comportamento Claude]] e [[Definição do Núcleo Geral do Vault]]. Resumo: as 18 regras que moravam soltas em `02_Sistema_Interno/Regras_de_Comportamento/` foram separadas em 3 grupos — 6 genuinamente universais (`00_Nucleo_Comportamento_Claude/`), 2 específicas do vault (`01_Nucleo_Geral_Vault/`), 10 específicas do projeto Sistema Interno V2 (continuam em `02_Sistema_Interno/Regras_de_Comportamento/`). `01_Notas_Gerais/` foi esvaziada e removida — conteúdo redistribuído entre `01_Nucleo_Geral_Vault/` e a pasta nova `02_Sistema_Interno/Conceitos/` (mesmo padrão de exceção de nível de mundo que `Regras_de_Comportamento/`/`Tutoriais/` já tinham).

> [!warning] Autoavaliação honesta (pedida pelo usuário, 29/08/2026) — nem tudo isso é melhoria estrutural real
> A reclassificação corrigiu um erro real (a maioria das 16 regras originalmente postas em `00_` era, na verdade, convenção de engenharia do projeto Sistema Interno V2, não comportamento universal) e reduziu de ~13.830 pra ~2.100 palavras o que precisa ser relido pra travar comportamento — ganho real, mensurável, não cosmético. Mas o problema já documentado no vault (6 incidentes reais da mesma violação de regra, ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]) é de **releitura/aplicação confiável**, não de classificação de pasta — reorganizar pasta não resolve isso sozinho. Prova ao vivo, na própria sessão desta reorganização: a regra [[Perguntas Sempre em Texto Corrido]] foi violada 2 vezes, mesmo já escrita e já reclassificada (ver incidente registrado na própria nota da regra). A "camada resumida" (versão compacta das 6 regras do `00_`, pra reler barato sem depender de lembrar) é o passo que atacaria a causa raiz de verdade — ainda não construída, pausada a pedido do usuário pra primeiro corrigir a classificação e, agora, pra tocar a Camada 3 visual.

### 6.7 — Achado importante: busca nativa por property já organiza o grafo, hoje, sem depender de tag

Avaliando 4 plugins de grafo pedidos pelo usuário (Persistent Graph, Folder and Graphs Plus, Graph Search Sync, GraphFrontier — vereditos completos na conversa, não repetidos aqui em detalhe), **Graph Search Sync** foi instalado. Diferente do que eu tinha avaliado antes (achei que precisaria de instalação manual, por não estar na busca oficial ainda) — **correção**: ele já estava disponível na busca normal de plugins de comunidade, igual qualquer outro; a informação anterior estava desatualizada/errada.

O plugin sincroniza a busca global do Obsidian com o filtro do Graph View em tempo real. Isso, testado na prática, revelou algo mais importante que o plugin em si:

> [!success] Confirmado na prática (29/08/2026) — busca por property já funciona, sem migração nenhuma
> A sintaxe nativa do Obsidian `["tipo": "decisao"]` (busca por property, documentada em [ajuda oficial de busca](https://obsidian.md/help/plugins/search)) retornou **63 resultados** corretos, e `["tipo": "checkpoint"]` retornou **18** — ambos filtrando o Graph View, via Graph Search Sync, pra um grafo bem menor e organizado, em vez do vault inteiro amontoado. Isso funciona **hoje**, porque as 308 notas já têm `tipo`/`status` no frontmatter — não depende de tag, não depende do Caminho C (seção 5.4), não depende do GraphFrontier.

**Por que isso é importante de lembrar**: cria uma distinção clara entre 2 necessidades que antes pareciam a mesma coisa —
- **Busca/filtro por categoria** (achar rápido "todo `checkpoint`", "toda `decisao`", ver isso organizado no grafo) → **já resolvido hoje**, via busca nativa por property + Graph Search Sync. Não é mais um bloqueio.
- **Cor visual por categoria** (Tags Color Files pintando o explorer/Bases por `tipo`) e **busca por `tag:`** → continuam dependendo da migração Caminho C (tag hierárquica `tipo/x`), porque esses 2 recursos especificamente leem tag, não property.

Ou seja: a migração Caminho C deixou de ser urgente pra "conseguir navegar organizado" (isso já está resolvido) — ela segue valendo a pena só pelo ganho de cor visual e busca por tag, não mais como única saída pra bagunça do grafo.

> [!info] Extensão do achado (29/08/2026, 16:18) — vale pra qualquer property, não só `tipo`/`status`
> Confirmado que `["atualizado_em": "29/08/2026 16:18"]` também funciona (1 resultado, a própria nota editada nesse minuto) — a busca por property não é exclusiva de `tipo`/`status`, vale pra qualquer campo do frontmatter (`criado`, `dominio`, `atualizado_em`, etc.), porque pra essa sintaxe são todos só texto.
>
> **Confirmado na prática, testado pelo usuário**: busca parcial sem hora, `["atualizado_em": "29/08/2026"]`, retornou **5 resultados** — exatamente as 5 notas tocadas nesta sessão de hoje (esta própria nota, `Perguntas Sempre em Texto Corrido`, `Estrutura e Convenções do Vault`, `Definição do Núcleo Geral do Vault`, `Definição do Núcleo de Comportamento Claude`). Confirma que a busca por property é "contém o texto", não "igual exatamente" — útil como pergunta padrão de fechamento de sessão: **"o que eu mexi hoje?"** vira 1 busca só, sem precisar lembrar ou caçar nada manualmente.

### 6.8 — GraphFrontier avaliado e descartado; física do grafo nativo ajustada de verdade

**GraphFrontier**: instalado, testado, e **descartado pelo usuário** (29/08/2026) — não por defeito do plugin (o resultado visual, com layout próprio, ficou genuinamente melhor que o nativo), mas por arquitetura: é um grafo **totalmente separado e independente** do Graph View nativo do Obsidian (confirmado na própria descrição oficial do plugin: "NOT a plugin for Obsidian Graph View"), sem nenhuma sincronia com o que já configuramos — cor por mundo (Colorful Folders → `colorGroups`) e busca ao vivo (Graph Search Sync) só afetam o grafo nativo, teriam que ser recriados do zero e mantidos em paralelo pro GraphFrontier. Nas palavras do usuário: "seria tipo construir o projeto de uma casa em um terreno, e usar a casa em outro." Desinstalado.

**Grafo nativo, física ajustada por tentativa direta do usuário** (29/08/2026, 16:44) — valores finais, direto no `.obsidian/graph.json`:

| Parâmetro | Valor original | Valor final |
|---|---|---|
| Força centrípeta (`centerStrength`) | 0.156 | 0.505 |
| Força de repulsão (`repelStrength`) | 7.36 | 15.10 |
| Força dos links (`linkStrength`) | 0.243 | **1** (mudança que mais ajudou — não estava na minha proposta original, achado do próprio usuário) |
| Distância dos links (`linkDistance`) | 172 | 179 |
| Tamanho dos nódulos (`nodeSizeMultiplier`) | 1.80 | 1.50 |
| Grossura dos links (`lineSizeMultiplier`) | 2.09 | 2.00 |
| Limite de visibilidade textual (`textFadeMultiplier`) | -2.4 | -1.1 |
| Órfãos (`showOrphans`) | true | **true, mantido de propósito** — decisão consciente do usuário, não pendência esquecida |

Resultado avaliado pelo usuário como "excelente, dentro do possível" — 4 blocos bem definidos por mundo/cor, nível de organização equivalente ao que o GraphFrontier tinha mostrado, sem precisar de plugin novo. Ressalva: o print de confirmação tinha uma busca residual no campo (`["tipo":"decisao"]`, resíduo de teste anterior) — não confirmado se o resultado "excelente" era do grafo cheio ou já filtrado por essa busca; registrado como ressalva, não como fato resolvido.

### 6.9 — Marcadores (Bookmarks): busca vs. grafo, e por que só um dos dois serve pra este vault

Dúvida trazida pelo usuário: os "marcadores" do Obsidian permitem salvar buscas prontas, criando atalhos reutilizáveis pra cada filtro do grafo? Confirmado direto na documentação oficial (`help.obsidian.md/plugins/bookmarks`) — sim, é real, e cobre mais coisa do que só busca:

> [!success] Confirmado — Bookmarks (plugin núcleo) salva buscas, grafos, arquivos, pastas, headings, blocos e links
> Dá pra organizar marcadores em **grupos de marcadores**, e reabrir qualquer um deles com 1 clique. Nenhuma instalação nova precisa — é plugin núcleo, já vem ativo, sem custo de adoção.

**A confusão inicial, resolvida**: existem 2 formas diferentes de "marcar algo relacionado ao grafo", e elas não são a mesma coisa:

- **Bookmark de busca**: feito pelos "..." ao lado do número de resultados, dentro do painel de Pesquisa. Salva só o texto da query (ex: `["tipo":"regra"]`). Reabrir o bookmark reexecuta essa busca contra o vault atual — notas novas que passem a bater com o filtro aparecem normalmente, não é uma lista congelada no tempo.
- **Bookmark de grafo**: feito clicando com o botão direito na própria aba do Graph View → "Marcador...". Salva a configuração daquela aba inteira (o filtro que estava na caixinha própria do grafo, cor dos grupos, força, distância). Também recalcula contra o vault atual ao reabrir — a diferença real não é "foto vs. vivo" (os dois são vivos, sempre recalculam), é **o que cada um controla**: lista de arquivos vs. visualização completa do grafo.

> [!warning] Achado crítico — só bookmark de busca sustenta o hover-highlight do Graph Search Sync
> O recurso de destacar um nó no grafo ao passar o mouse sobre um resultado (hover highlight) só existe dentro da lista de resultados da própria aba de Pesquisa — documentado assim na página oficial do Graph Search Sync ("hovering a search result highlights the corresponding node in the graph"). Bookmark de grafo nunca abre essa lista de resultados, então mata esse recurso de cara. **Decisão fechada do usuário (29/08, 17:25): bookmark de busca é o único caminho oficial pra este vault** — nunca bookmark de grafo. Testado ao vivo pelo usuário: um marcador criado pela aba do grafo, mesmo nomeado "Pesquisa: Tipo REGRA", continua sendo bookmark de grafo de verdade — **o tipo é definido pelo caminho usado pra criar o marcador, não pelo título escolhido**.

> [!info] Detalhe técnico confirmado na prática pelo usuário — pequeno "cutucão" necessário depois de reabrir
> Reabrir um bookmark de busca reescreve o texto na caixa de busca global (funciona como uma macro), mas o Graph Search Sync não reage sozinho a essa reescrita — é preciso digitar ou apagar algo na caixa (mesmo 1 espaço) pra ele de fato sincronizar o grafo. Bate com o que a própria documentação do plugin explica: ele reage a eventos "dispatched through the same event path as real typing"; a restauração do bookmark provavelmente preenche o campo sem disparar esse mesmo evento. Não trava o fluxo, só um passo manual extra e pequeno.

**Implicação prática pra este vault**: dá pra criar uma coleção de bookmarks de busca reutilizáveis (`["tipo":"regra"]`, `["tipo":"checkpoint"]`, `["tipo":"decisao"]`, etc.), organizados num grupo de marcadores, virando atalhos de 1 clique pra qualquer filtro do grafo que já usamos hoje digitando à mão toda vez. Ainda não criados de fato — fica registrado como próximo passo natural, não urgente.

### 6.10 — Camada 1 (tipo) decidida e aplicada; `applyToFiles` descoberto; teto real do Graph View encontrado — fecha a reestruturação visual externa (29/08/2026, 22:44-23:10)

**Camada 1 aplicada de verdade**: cor + ícone por tipo de subpasta padrão, escritos em `customFolderColors` pra toda ocorrência já existente no vault (35 pastas, contadas via `find` — não chute):

| Tipo | Cor (hex) | Ícone (Lucide) | Ocorrências |
|---|---|---|---|
| `Regras` | `#9F1239` | `scale` | 3 |
| `Conceitos` | `#0EA5E9` | `lightbulb` | 3 |
| `Decisoes` | `#9333EA` | `git-branch` | 8 |
| `Duvidas` | `#EAB308` | `circle-help` | 3 |
| `Descobertas` | `#16A34A` | `telescope` | 5 |
| `Bugs_Conhecidos` | `#DC2626` | `bug` | 5 |
| `Checkpoints` | `#475569` | `flag` | 6 |
| `Tutoriais` | `#78350F` | `list-checks` | 2 |

> [!warning] Limite técnico real, confirmado lendo o código-fonte do plugin — cor por tipo não é automática por nome
> `customFolderColors` só casa por **caminho exato** (confirmado lendo `main.js`: a função `je()` só normaliza separador de pasta, nunca extrai nome-base) — não existe "toda pasta chamada `Bugs_Conhecidos`, onde quer que esteja" via cor. Cada uma das 35 ocorrências precisou da própria entrada. Existe uma feature separada (`customIconRules`, casamento por nome via regex) que cobre só ÍCONE automático por nome, nunca cor — e não foi usada aqui, pra não depender de 2 mecanismos diferentes. **Consequência prática, virou regra de processo**: toda vez que uma dessas 8 subpastas padrão for criada num contexto novo, a entrada correspondente em `customFolderColors` precisa ser adicionada no mesmo momento — não é automático, é disciplina.

> [!success] Descoberta — `applyToFiles: true` estende o estilo do tipo pros arquivos dentro da pasta
> Usuário testou pela interface do Obsidian (aba "Inheritance" do painel de estilo) em `04_Integracao_Sysemp/Impostos_Entrada/Bugs_Conhecidos/`, ativando "Apply to files". Resultado real, lido depois no `data.json`: `applyToFiles: false → true`, mais 3 campos novos auto-adicionados pelo painel — `textColor` (tom mais claro do `hex`, ~46% em direção ao branco, pra legibilidade), `iconColor` (igual ao `hex`) e `textGradientEnd` (`#00ffff`, constante fixa, função ainda não confirmada). Resultado visual aprovado pelo usuário — cada nota dentro da pasta passa a mostrar ícone + cor do próprio tipo, não só a pasta-mãe. Replicado nas outras 34 entradas calculando o mesmo `textColor` (mesma fórmula de mistura com branco) pra cada uma das 8 cores de tipo — sem precisar repetir o clique manual 34 vezes.

> [!failure] Teto real encontrado — Graph View nativo não suporta ícone por nó, só cor
> Usuário pediu ícone colorido no grafo, igual nas pastas. Confirmado por leitura direta do código: o motor de renderização do Graph View nativo do Obsidian desenha nó como círculo colorido, sem suporte a ícone customizado — e a função de sincronia do Colorful Folders (`syncGraphColors`) só mexe em cor, nunca em ícone. Nenhum dos plugins instalados (`iconic`, `iconoir-icons`, etc.) adiciona ícone a nó de grafo — todos atuam só em file explorer/aba/bookmark. **Teto real, não configuração incompleta**: grafo com cor sincronizada (já funciona) é o máximo possível; ícone dentro do nó não é alcançável com o que existe hoje.

**Fecha a reestruturação visual "de fora da nota"** (29/08/2026, 23:10) — usuário confirmou explicitamente. Escopo do que foi coberto nesta rodada inteira (Categorias 4-6): renumeração de mundo + núcleo novo (`02_Nucleo_Engenharia_Repositorio`, ver [[Estrutura e Convenções do Vault]]), cor/ícone por mundo (Camada 3, 6.5) e por tipo (Camada 1, acima), física do grafo (6.8), bookmarks de busca (6.9), `applyToFiles` (acima). **Fica explicitamente fora deste escopo, ainda não iniciado**: melhoria visual **interna ao conteúdo de cada nota** (uso de callout, tabela, Mermaid dentro do corpo — ver seção 1.4 e [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]) — próxima frente de trabalho, distinta desta.

## Prioridade recomendada (o que eu sugiro fazer primeiro)

| Ordem | Recurso | Esforço | Ganho | Status |
|---|---|---|---|---|
| 1 | Bases — pelo menos 1 view "tudo que está aberto" | Baixo | Alto — resolve "onde estão as pendências" sem caçar pasta por pasta | ✅ Feito e validado (16/08) |
| 2 | Canvas — 1 mapa visual por mundo grande (ex: Impostos_Entrada) | Médio (precisa montar manualmente 1 vez) | Médio-alto — ótimo pra retomar contexto rápido, mas dá trabalho manter atualizado | Em aberto |
| 3 | Callouts customizados por cor (CSS) | Baixo, mas precisa de decisão de design | Estético, não estrutural — última prioridade pelo princípio fundamental #2 | Em aberto |
| 4 | Dataview — substituir a tabela manual do índice por consulta ao vivo (ver seção 2.1) | Precisa instalar plugin (ação do usuário, 1 vez) | Alto — índice deixa de precisar de manutenção manual | Recomendado, não urgente |

Templates saiu desta lista — reavaliado como não necessário (ver seção 1.2).

## Exemplo prático — a Base de verdade que já foi criada

Pra não ficar só em teoria (regra 8 de [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]), já criei um arquivo `.base` real, guardado em `Bases/Vault - Pendencias Abertas.base` (pasta oficializada em 16/08/2026 — ver [[Estrutura e Convenções do Vault]]). Ele tem 3 views prontas — "Bugs em aberto" (`tipo: bug_conhecido` + `status: ativo`), "Trabalho em andamento" (`tipo: checkpoint` + `status: em_andamento`) e "Dúvidas ainda em aberto" (`tipo: duvida` + `status: ativa`). Basta abrir esse arquivo dentro do Obsidian (depois de ativar o plugin núcleo **Bases** em Configurações) pra ver as 3 tabelas populadas ao vivo, com dado real do vault de hoje.

> [!success] Confirmado na prática (16/08, 22:52) — a Base funcionou de primeira
> Ativado o plugin núcleo e aberto o arquivo: a view "Bugs em aberto" mostrou **0 resultado** (correto — não é erro, é porque todo `bug_conhecido` registrado neste vault já está com `status: corrigido`, nenhum aberto de verdade hoje) e a view "Trabalho em andamento" mostrou **7 resultados** reais (os 7 checkpoints com `status: em_andamento` do vault inteiro, de vários mundos diferentes, juntos numa tabela só). Confirma a promessa: nenhum "caçar pasta por pasta" foi necessário.
>
> A dúvida sobre ordenação também foi resolvida usando a própria interface do Obsidian (clicar em "Ordenar", no canto superior direito da view) — isso gera sozinho, no arquivo `.base`, uma seção nova:
> ```yaml
> sort:
>   - property: dominio
>     direction: ASC
> ```
> Ou seja: não precisa escrever essa parte à mão — é só clicar em "Ordenar" na interface e o Obsidian escreve a sintaxe certa sozinho. (A interface também salva o tamanho de cada coluna arrastada, numa seção `columnSize` — cosmético, não afeta o filtro.)

## Em aberto — decisões que ainda dependem de você

- [x] Ativar o plugin núcleo **Bases** e abrir o arquivo de exemplo — **feito e validado (16/08, 22:52)**, funcionou de primeira.
- [x] Formato de data — **decidido (16/08, 23h): mantém `DD/MM/YYYY`**, sem migrar pra ISO. Ver callout resolvido na seção 1.1.
- [x] Pasta `Bases/` na raiz do vault — **criada (16/08, 23h)**, arquivo de exemplo já movido pra dentro. Ver convenção oficial em [[Estrutura e Convenções do Vault]].
- [ ] Instalar o Dataview (plugin de comunidade, requer ação manual sua — ver seção 2.1) — recomendado, não urgente.
- [x] Investigar os 5 links pedidos (Iconize, Lucide, Excalidraw, Obsidian Projects, plugin de TODO) — **feito (16/08, 23h)**, nenhum recomendado pra adoção agora, ver "Categoria 3" e o veredito de cada um.
- [x] MCP como ferramenta de busca (via Omnisearch) — **avaliado e descartado por ora (28/08)**, complexidade de configuração/uso maior que o ganho no momento. Ver seção 4.5.
- [x] Investigar o plugin **Iconic** como possível substituto do Iconize — **feito (29/08)**, confirmado ativo e superior (Iconize estava descontinuado). Ver seção 5.3.
- [x] Decisão Iconize vs Iconic — **Iconic escolhido (29/08)**, Iconize removido da lista de plugins instalados. O guia de configuração automática vira guia do Iconic, não mais do Iconize.
- [x] Mapear cada plugin candidato por função/objetivo, pra achar sobreposição de responsabilidade antes de instalar — **feito (29/08)**, ver seção 5.2.
- [x] Resolver a questão de duplicação de informação (tag espelhando `tipo`/`status`) — **decidido (29/08)**: Caminho C (tag hierárquica, única fonte de verdade), migração em etapas. Ver seção 5.4.
- [x] Instalar os 5 plugins finais (Iconic, Iconoir Icons, Colorful Folders, Tags Color Files, Shiki Highlighter) — **feito (29/08, madrugada)**.
- [x] Testar tag aninhada (`tipo/checkpoint`) no Tags Color Files — **confirmado funcionando (29/08)**, no explorer e nas Bases. Ver seção 5.6.
- [x] Testar Iconic (regra Properties → ícone) — **confirmado (29/08)**, 18 arquivos, retroativo. Ver 5.6.
- [x] Testar Iconoir Icons (sintaxe inline) — **confirmado (29/08)**, precisa de crase (code span) ao redor da sintaxe. Ver 5.6.
- [x] Testar Shiki Highlighter — **confirmado (29/08)**, também retroativo em código já existente. Ver 5.6.
- [x] Configurar e testar Colorful Folders restrito — **reviravolta completa (29/08)**: bug real de onload (config ausente) → corrigido manualmente (`data.json` com `{}`) → "cor demais" no padrão de fábrica → 6 chaves ajustadas direto no `data.json` → confirmado funcionando, restrito e limpo. Ver 5.8.
- [x] Fechar a pilha final de plugins — **5 plugins confirmados (29/08, 01:25)**: Iconic, Iconoir Icons, Tags Color Files, Shiki Highlighter, Colorful Folders. Ver 5.9.
- [x] Dúvidas do usuário sinalizadas em 29/08 01:25 — **esclarecidas (29/08, ao longo do dia)**: grupos de Graph View consolidados (6.1), origem da cor explicada + edição de `customFolderColors` pausada por escolha do usuário (6.2), Tag Color Sync confirmado como interesse mas ainda não configurado (6.2).
- [ ] Resolver o drift de vocabulário já existente (`tipo: diretriz`/`prompt` fora do padrão documentado, capitalizações erradas) antes de migrar pra tag — sem pressa, ver seção 5.5.
- [ ] Executar a migração do Caminho C (`tipo`/`status` → tag hierárquica) quando decidido — inclui reescrever os filtros de `Bases/Vault - Pendencias Abertas.base`. Migração em etapas, não de uma vez.
- [ ] Consolidar o diagnóstico das 2 funções do vault (conhecimento vs. execução, seção 4.3) numa proposta concreta de estrutura — ainda em fase de entendimento, nada gerado.
- [ ] Resolver a duplicidade real encontrada — 2 checkpoints desconectados do Hub de Fotos (`04_Integracao_Mercado_Livre` vs `02_Sistema_Interno/Hub_de_Fotos`) — acompanhar quando a reestruturação avançar.
- [x] Consolidar grupos manuais do Graph View na sincronia do plugin (fonte única) — **feito (29/08)**, ver 6.1.
- [ ] Configurar Tag Color Sync (Colorful Folders) — usuário confirmou interesse, ainda não configurado. Ver 6.2.
- [ ] Decidir se/quando editar `customFolderColors` além do nível de mundo (o usuário pediu pra pausar essa edição em 29/08, antes da Camada 3) — reavaliar.
- [x] Definir framework de padronização por camadas (mundo → tipo, "maior pra menor") — **feito (29/08)**, ver 6.3.
- [x] Confirmar limite de ícone customizado do Iconic — **feito (29/08)**: sem upload de SVG, só Lucide + emoji. Ver 6.4.
- [x] Decidir e aplicar cor + ícone dos 8 mundos (Camada 3) — **feito e escrito no `data.json` (29/08, 15:30)**, ver 6.5.
- [x] Definir e aplicar cor + ícone por tipo (Camada 1 — `regras`, `conceitos`, `decisoes`, `duvidas`, `descobertas`, `bugs_conhecidos`, `checkpoints`, `tutoriais`) — **feito (29/08, 22:44)**, 35 pastas reais escritas em `customFolderColors`. Ver 6.10.
- [x] Testar `applyToFiles` (estender estilo do tipo pros arquivos dentro da pasta, não só a pasta) — **feito e aprovado (29/08, 23:10)**, replicado nas 35. Ver 6.10.
- [x] Investigar ícone colorido no Graph View (igual pastas) — **teto técnico real confirmado (29/08)**: motor nativo do Obsidian não suporta ícone por nó, só cor. Não é config pendente, é limite do produto. Ver 6.10.
- [ ] Construir a "camada resumida" das 6 regras de `00_Nucleo_Comportamento_Claude/` — passo que ataca a causa raiz dos incidentes reais de violação de regra (ver autoavaliação em 6.6), ainda pausado. **Condição explícita do usuário (29/08, 23:26)**: continuar testando/usando o vault primeiro; só constrói essa camada se os erros de comportamento continuarem aparecendo na prática. Não é esquecido — é decisão consciente de esperar dado real antes de investir nisso.
- [ ] Migrar as ~30+ notas antigas cujo `tipo`/`status` não bate com o vocabulário dos 9 tipos formalizado em 29/08 (21:12) — ex: `decisao` com `resolvida`/`proposta`/`pendente-validacao` em vez de `ativa`/`em_andamento`/`concluida`/`descartada`; `descoberta` com `corrigida`/`aberta` em vez de `ativa`/`confirmada`; drift de capitalização vindo do LEGADO (`Decisão`, `Bug Conhecido`). **Decisão do usuário (29/08, 23:26)**: sem varredura proativa — corrige nota por nota, só quando cada uma aparecer no caminho por outro motivo.
- [x] Instalar e testar Graph Search Sync — **feito (29/08)**, funcionando. Ver 6.7.
- [x] **Achado importante, registrado pra não esquecer**: busca nativa por property (`[tipo]: valor`) já organiza o Graph View hoje, sem depender da migração Caminho C — a migração de tag deixou de ser bloqueio pra navegação organizada, segue valendo só pelo ganho de cor visual e busca por `tag:`. Ver 6.7.
- [x] Testar e instalar GraphFrontier — **feito e descartado (29/08)**: funcionava bem, mas é um grafo separado sem sincronia com cor/busca já configuradas no nativo. Desinstalado. Ver 6.8.
- [x] Ajustar física do grafo nativo (repulsão, distância, tamanho, órfãos) — **feito (29/08, 16:44)**, resultado avaliado como excelente pelo usuário. Valores finais e ressalva sobre busca residual em 6.8.
- [x] Investigar marcadores (Bookmarks) do Obsidian — busca vs. grafo — **feito e decidido (29/08, 17:25)**: bookmark de busca é o único caminho oficial (sustenta o hover-highlight do Graph Search Sync); bookmark de grafo descartado. Ver 6.9.
- [x] Criar de fato os bookmarks de busca reutilizáveis — **feito (29/08, 19:51)**: 88 marcadores, estrutura simétrica mundo × tipo + subgrupo "Pendências Abertas" por status, igual em todo mundo mesmo quando dá 0 resultado. Ver 6.9.
- [x] Limpar referências órfãs de `LEGADO/` após a pasta ser removida — **feito (29/08, 19:51)**: grupo de bookmarks, `customFolderColors` e `colorGroup` do Graph View, todos com o Obsidian fechado. Regra de comportamento e "Os mundos" também atualizadas (ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]] e [[Estrutura e Convenções do Vault]]).

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
