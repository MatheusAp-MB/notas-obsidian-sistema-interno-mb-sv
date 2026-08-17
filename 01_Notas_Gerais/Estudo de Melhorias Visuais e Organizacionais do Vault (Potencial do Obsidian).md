---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 16/08/2026
atualizado_em: 16/08/2026 23:25
relacionado: [Estrutura e Convenções do Vault, Como Escrever Notas no Vault — Padrao Hiper-Didatico, Guia de Setup - Do Zero ao Primeiro Preco Calculado]
---

# Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)

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

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
