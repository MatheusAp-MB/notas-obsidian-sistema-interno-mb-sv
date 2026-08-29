---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
atualizado_em: 29/08/2026 19:59
relacionado: [Padrao de Robustez para Clientes de API Externa, Como Escrever Notas no Vault — Padrao Hiper-Didatico, Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian), Guia de Setup - Do Zero ao Primeiro Preco Calculado, Definição do Núcleo de Comportamento Claude, Definição do Núcleo Geral do Vault]
---

# Estrutura e Convenções do Vault

Esta nota é a especificação técnica fixa da organização deste vault, reescrita em 01/08/2026 depois de mover todo o conteúdo anterior para `LEGADO/`. Substitui por completo a versão antiga.

## Princípios fundamentais do vault (16/08/2026)

Decisão do usuário, válida pra qualquer mundo, qualquer tipo de nota, a partir de agora. Estes 4 princípios pesam mais que qualquer recomendação de ferramenta feita em [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]] — nenhum recurso do Obsidian é adotado se contrariar algum destes:

1. **O usuário nunca escreve nenhuma nota à mão — só visualiza e lê.** Toda criação e toda edição de nota é 100% feita por Claude, sempre. Consequência prática: qualquer recurso do Obsidian pensado pra ajudar um humano a criar nota manualmente (o exemplo mais claro é o plugin núcleo Templates) deixa de ser prioridade aqui — ninguém neste vault vai usar o atalho "inserir modelo" com as próprias mãos.
2. **A prioridade não é "ficar bonito esteticamente" — é "didático, organizado, visualmente interessante e, se possível, bonito", nesta ordem.** Beleza estética é o último critério, nunca o primeiro. Quando existem 2 formas de mostrar a mesma informação, vence a mais clara — não a mais bonita.
3. **Toda nota precisa ser algo que Claude consiga criar sozinho, de forma 100% correta, sem depender de ação manual do usuário dentro da interface do Obsidian.** Isso descarta, na prática, qualquer recurso que só funcione através de clique/arrastar/desenhar (ex: atribuir ícone de pasta pela interface, desenho livre estilo Excalidraw) — mesmo que o recurso seja útil em teoria, se Claude não conseguir gerar o resultado inteiro escrevendo texto, YAML ou JSON de forma confiável (sem depender de clicar em nada), ele não é adotado.
4. **Toda nota precisa ser entendível tanto por humano quanto por Claude-como-LLM.** O vault serve 2 públicos ao mesmo tempo: gente buscando informação (ver seção "Escrita didática" abaixo) e Claude buscando contexto de sessões passadas. Consequência prática: nenhum recurso visual (Mermaid, SVG, Canvas) pode ser a ÚNICA fonte de uma informação — o texto corrido ao redor sempre precisa contar a mesma informação por escrito, porque quando Claude relê a nota depois, ele lê o texto/código-fonte do diagrama, nunca a imagem já desenhada.

## Os mundos

Decisão de 06/08/2026: nem toda API/integração externa vira mundo próprio — só quando for grande e crítica o suficiente pra justificar ser testada e documentada de forma isolada. O critério é caso a caso, decidido junto com o usuário quando a situação aparecer.

- **`00_Nucleo_Comportamento_Claude/`** — criado em 29/08/2026, ativo. Reúne só a regra de comportamento genuinamente universal (vale pra qualquer tarefa, qualquer projeto, não só código) — 6 regras, teste de classificação de 2 perguntas e lista completa em [[Definição do Núcleo de Comportamento Claude]]. Corrigido no mesmo dia: uma 1ª tentativa tinha colocado 16 regras aqui, mas a maioria era convenção de engenharia específica do projeto Sistema Interno V2 — essas 10 permanecem em `02_Sistema_Interno/Regras_de_Comportamento/` (ver parágrafo abaixo, que já prezia isso desde antes desta reorganização).
- **`01_Nucleo_Geral_Vault/`** — criado em 29/08/2026, ativo. Reúne toda regra e convenção que só existe por causa deste vault (frontmatter, estrutura de pasta, jeito de escrever nota) — definição completa em [[Definição do Núcleo Geral do Vault]]. Migração concluída (29/08/2026, 15:09): as 2 regras reclassificadas (`Aviso Proativo Para Notas no Obsidian`, `Perguntar Data e Hora Antes de Escrever no Vault`) e as 4 notas de convenção que estavam em `01_Notas_Gerais/` (esta mesma nota, `Como Escrever Notas no Vault — Padrao Hiper-Didatico`, `Estudo de Melhorias Visuais e Organizacionais do Vault`, `Evolucao do Controle de Contexto e Execucao...`) foram todas movidas pra cá. `01_Notas_Gerais/` ficou vazia e foi removida — não existe mais como pasta do vault.
- **`02_Sistema_Interno/`** — ativo. Segue a estrutura descrita abaixo. Inclui 2 contextos de API que são parte do próprio sistema, não integrações isoladas: `API_Google_Drive/` e `API_Agente_Local/` (a API que o próprio Sistema Interno expõe pro agente executável local). Criados sob demanda, na primeira nota de cada, como qualquer outro contexto.
- **`03_Integracao_Sysemp/`** — ativo, mundo próprio (não é contexto dentro de Sistema Interno). Motivo: a API do ERP Sysemp lida com dado fiscal sensível e é grande o suficiente pra ter ciclo de trabalho e índice isolados, mesmo o código morando no mesmo repositório do Sistema Interno (`scripts_exploracao_ERP/`).
- **`04_Integracao_Mercado_Livre/`** — ativo, mundo próprio, mesmo motivo do Sysemp. Integração ainda não começou de fato nesta versão do projeto (V2) — a pasta já existe pra receber decisões/descobertas assim que o trabalho começar.
- **`05_Producao_de_Imagens_e_Videos/`** — ativo, mundo próprio, criado em 22/08/2026. Motivo: cobre a PRODUÇÃO de fotos/vídeos dos produtos (geração via IA) — um problema grande e sem relação de código com `02_Sistema_Interno/` (que só cuida do que acontece depois que o material já existe, ver `Agenda_Videos/`). Ainda não tem código associado, só diagnóstico do problema (ver `00_Indice.md` do próprio mundo).
- **`LEGADO/`** — não existe mais (removida em 29/08/2026). Continha `03_ML_Analytics_HUB/`, projeto antigo e diferente, sem relação direta com `04_Integracao_Mercado_Livre/` além de ter servido de fonte de lições aprendidas sobre a API do ML. As 43 notas com conteúdo real foram migradas pros mundos corretos (marcadas `tags: [Vindo_do_Legado]`) antes da pasta ser apagada — ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]], seção "Conteúdo vindo do LEGADO".

Padrão de engenharia que atravessa mais de um mundo (ex: como construir com segurança um cliente de API externa) mora em `02_Sistema_Interno/Regras_de_Comportamento/`, mesmo quando o assunto também vale pra `03_Integracao_Sysemp/` ou `04_Integracao_Mercado_Livre/` — o código de todas essas integrações vive no mesmo repositório, então a regra é do projeto como um todo. Os outros mundos referenciam essa regra via `relacionado`, nunca duplicam o conteúdo. Ver [[Padrao de Robustez para Clientes de API Externa]].

## Convenção de nome (mantida)

- Nome de arquivo de nota = nome usado no `[[wikilink]]`, com espaço, sem underscore.
- Evitar acento e cedilha em nome de arquivo quando possível.
- Nome de pasta (mundo, contexto, tipo) usa underscore com prefixo numérico quando aplicável (`02_Sistema_Interno`, `Agenda_Videos`) — a convenção de espaço vale só para arquivos de nota, nunca para pastas.

## Estrutura de pastas dentro de um mundo

Padrão único, usado por qualquer mundo ativo (`02_Sistema_Interno/`, `03_Integracao_Sysemp/`, `04_Integracao_Mercado_Livre/`):

```
02_Sistema_Interno/
  00_Indice.md                → índice obrigatório do mundo (ver seção própria abaixo)
  Regras_de_Comportamento/    → regras de processo (como Claude deve agir neste projeto:
                                 gerar código, analisar código, pensar sobre algo).
                                 Arquivos soltos direto aqui, sempre tipo=regra.
                                 Nunca contém duvida ou bug_conhecido.
  Tutoriais/                   → (opcional, criado sob demanda) manual/guia que cobre o
                                 mundo inteiro, sem pertencer a um contexto específico
                                 (ver seção "Tutorial" abaixo). Irmã de Regras_de_Comportamento/.
  Conceitos/                   → (opcional, criado sob demanda) conceito técnico geral que
                                 não pertence a um contexto de negócio específico — dá apoio
                                 a mais de 1 contexto ou às próprias regras do mundo. Irmã de
                                 Regras_de_Comportamento/ e Tutoriais/, mesma lógica de exceção.
  <Contexto>/                  → criado sob demanda, na primeira nota daquele contexto
    Decisoes/
    Duvidas/
    Regras/
    Descobertas/
    Bugs_Conhecidos/
    Conceitos/
    Checkpoints/                → estado de trabalho em andamento (ver seção própria abaixo)
    Tutoriais/                  → manual/guia passo a passo (ver seção própria abaixo)
```

- **Contexto** agrupa um tema de negócio (ex: `Agenda_Videos`, `Precificacao`) — não precisa corresponder 1:1 a um app Django; pode interligar vários pontos do projeto.
- Nota que toca mais de 1 contexto mora no contexto principal e referencia o outro via `relacionado` — nunca duplicada em duas pastas.
- Subpasta de tipo (`Decisoes/`, `Duvidas/`, etc.) só existe dentro de um contexto quando já tiver pelo menos 1 nota daquele tipo — nunca pré-criada vazia.
- `Regras_de_Comportamento/` é diferente de um contexto: é nível do mundo, não de negócio, e não tem subpastas de tipo — só regras, soltas.
- **`Conceitos/` de nível de mundo** (achado real, 29/08/2026): mesma lógica de `Regras_de_Comportamento/`/`Tutoriais/` de mundo — quando um conceito técnico (ex: terminologia de teste) não pertence a 1 contexto de negócio específico, mas dá apoio a regras/contextos do mundo inteiro, vive solto na raiz do mundo, não dentro de um `<Contexto>`. Primeiro exemplo real: `02_Sistema_Interno/Conceitos/Conceitos de Pytest Live de Python 167` (dá apoio a [[Disciplina de Testes Automatizados]]).

## Escrita didática — o vault agora é lido pelo time, não só por Claude

Decisão do usuário (15/08/2026, 01:39, reforçada e detalhada em 16/08/2026, 22:25): o vault deixou de ser só o "HD" de memória do Claude (ver [[Aviso Proativo Para Notas no Obsidian]]) — o time (Cauã confirmado lendo notas no mesmo dia) também busca informação direto aqui, e a exigência é que qualquer leitor entenda com 100% de certeza, sem margem de dúvida. O padrão completo — modo professor, as 4 perguntas obrigatórias (O quê/Por quê/Pra quê/Como), 7 regras práticas com exemplo ANTES×DEPOIS, uso pleno dos recursos do Obsidian (tabela, callout, Mermaid, SVG) e checklist de verificação — mora em [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]], pra não duplicar conteúdo aqui. Toda nota nova (ou edição de nota existente) segue aquele padrão.

## Frontmatter (schema fixo)

```yaml
---
tipo: 
dominio: 
status: 
criado: DD/MM/YYYY
atualizado_em: DD/MM/YYYY HH:mm
relacionado: []
---
```

- **`tipo`** (vocabulário fechado): `regra` | `decisao` | `descoberta` | `duvida` | `bug_conhecido` | `conceito` | `checkpoint` | `tutorial`
- **`dominio`** (vocabulário aberto, opcional): `python` | `css` | `js` | `banco_de_dados` | `performance` | `design` | (vazio) — nunca nome de projeto ou contexto (isso já é a pasta onde a nota está).
- **`status`** depende do `tipo`:
  - `duvida`: `ativa` | `resolvida`
  - `decisao`: `ativa` | `descartada`
  - `bug_conhecido`: `ativo` | `corrigido`
  - `checkpoint`: `em_andamento` | `concluido`
  - `regra` | `descoberta` | `conceito` | `tutorial`: sempre `ativa`
- **`criado`**: `DD/MM/YYYY`, nunca ISO. Nunca muda depois de escrito.
- **`atualizado_em`**: `DD/MM/YYYY HH:mm` (adicionado 03/08/2026 — `criado` sozinho não refletia a última edição de conteúdo). Toda nota nova já nasce com `atualizado_em` igual a `criado` (só sem hora). Toda edição de conteúdo depois disso atualiza só este campo — `criado` nunca muda. Campo adicionado de forma NÃO retroativa: notas antigas sem esse campo continuam válidas, só ganham `atualizado_em` na próxima vez que forem editadas de verdade.
- **`relacionado`**: lista de nomes exatos de nota, sem `[[ ]]`.

## Ciclo de vida de dúvida e bug (nunca apagar histórico)

- **Dúvida resolvida**: nunca edita a nota de dúvida virando decisão. Gera uma nota **nova**, `tipo: decisao`, com a resposta e o motivo, linkada de volta via `relacionado`. A dúvida original muda `status` para `resolvida` e continua existindo — é o registro de "isso foi incerto até tal data, aqui está o que resolveu", útil se um caso parecido aparecer depois.
- **Bug corrigido**: a mesma nota ganha uma seção `## Correção` (o que foi feito, quando) e `status` muda de `ativo` para `corrigido`. Não gera nota nova — causa e correção ficam juntas no mesmo lugar.

## Checkpoint — nota que se atualiza no lugar (nunca gera nota nova)

Diferente de dúvida/decisão/bug (que preservam histórico gerando nota nova ou seção extra), `checkpoint` registra o ESTADO ATUAL de um trabalho em andamento de várias sessões — e é sobrescrito na mesma nota a cada atualização relevante, com uma seção `## Última atualização` no topo do corpo (data). Existe porque a memória de conversa é volátil (sujeita a compactação) — o checkpoint é a memória persistente desse progresso. Quando o trabalho termina de vez, `status` muda para `concluido` (a nota continua existindo, como registro final).

**Checkpoint de nível de mundo** (achado real, 23/08/2026, mundo `05_Producao_de_Imagens_e_Videos/`): normalmente `Checkpoints/` mora dentro de um `<Contexto>` específico (padrão original, ex: `Agenda_Videos/Checkpoints/`). Quando o checkpoint cobre o mundo inteiro — várias frentes/contextos ao mesmo tempo, não uma frente de negócio isolada — ele mora direto na raiz do mundo (`05_Producao_de_Imagens_e_Videos/Checkpoints/`), mesma lógica de exceção já usada por `Regras_de_Comportamento/` e `Tutoriais/` de mundo.

## Tutorial — manual ou guia passo a passo (16/08/2026)

Tipo novo, criado depois de um caso real: uma nota com a sequência exata de comandos pra reconstruir o banco do zero tinha sido classificada como `regra`, mas não é uma regra — não descreve um comportamento esperado do sistema ou de quem trabalha nele, é um **manual concreto**, com passos numerados e comandos literais pra executar uma tarefa específica (ex: "depois de um `drop database`, rode nesta ordem: 1, 2, 3..."). A distinção prática: `regra` explica um princípio ou convenção que vale sempre, em qualquer situação parecida (ex: "XML da nota fiscal é a fonte única de verdade"); `tutorial` é uma receita passo a passo pra uma tarefa concreta e repetível (ex: "como reconstruir o banco", "como rodar a suíte de testes com cobertura"). `status` é sempre `ativa` — quando o procedimento muda (novo comando, passo a mais), a mesma nota é editada no lugar (`atualizado_em`), igual uma regra — não gera nota nova.

- **Tutorial de contexto** (a maioria): vive em `Tutoriais/`, dentro do contexto de negócio ao qual pertence (ex: `Impostos_Entrada/Tutoriais/`).
- **Tutorial de mundo** (16/08/2026, achado real): quando o procedimento não pertence a nenhum contexto de negócio específico — cobre o mundo inteiro, do ambiente até o sistema rodando (ex: "clonar o repositório, instalar dependência, configurar banco, popular tudo") — vive em `Tutoriais/` na raiz do mundo, **irmã** de `Regras_de_Comportamento/`, não dentro de um contexto. Mesma lógica que já vale pra `Regras_de_Comportamento/`: nível do mundo, não de contexto. Primeiro exemplo real: `02_Sistema_Interno/Tutoriais/Guia de Setup - Do Zero ao Primeiro Preco Calculado`.

## Pasta `Bases/` (arquivos `.base` do Obsidian)

Convenção nova (16/08/2026), aprovada pelo usuário depois da prova de conceito descrita em [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]. Todo arquivo `.base` — uma "visão de banco de dados" nativa do Obsidian, que lê o frontmatter das notas (`tipo`, `status`, `dominio`, etc.) e monta tabelas filtradas ao vivo — mora dentro de `Bases/`, na raiz do vault, nunca solto. É uma pasta funcional, não é um "mundo" e não segue a numeração `0X_`.

- Um `.base` pode juntar notas de qualquer mundo numa visão só (ex: todo `bug_conhecido` com `status: ativo`, não importa a pasta) — por isso não faz sentido ele morar dentro de um mundo específico.
- Nome do arquivo descreve a pergunta que ele responde (ex: `Vault - Pendencias Abertas.base` responde "o que está aberto, em qualquer mundo, agora?").
- Primeiro exemplo real: `Bases/Vault - Pendencias Abertas.base`, com 3 views (bugs abertos, checkpoints em andamento, dúvidas em aberto).

## Índice (`00_Indice.md`)

- Obrigatório, um arquivo por mundo (`00_Indice.md` na raiz de cada mundo) — vale pra todo mundo, sem exceção, não só `02_Sistema_Interno/`.
- Agrupado por contexto (`##`), com uma tabela: `Nota | Tipo | Status | Data | Resumo`.
- `Resumo` é a conclusão real da nota em até ~25 palavras — nunca uma descrição genérica da categoria.
- Sem coluna de `relacionado` — isso fica só dentro da nota em si.
- Atualizado na mesma autorização de escrita da nota que o gerou — não é uma autorização separada.

## Nunca duplicar informação estrutural fora desta nota

Se uma convenção nova precisar ser definida (nova pasta, novo campo de frontmatter, nova regra de nome), ela é adicionada aqui — nunca criada solta em outra nota.

## Relacionado

- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Definição do Núcleo de Comportamento Claude]]
- [[Definição do Núcleo Geral do Vault]]
