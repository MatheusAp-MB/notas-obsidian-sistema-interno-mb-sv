---
tipo: decisao
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 23/08/2026 20:55
relacionado: [Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets, Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre, Pulverizador Costal SS-20B Brudden, Cadeira de Rodas Motorizada Dobrável D800 Dellamed, Etapa 5 - Navegacao pelos Grafos, Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial, Etapa 1-4 - Estudo do Produto, Pipeline Completo Roda Numa Unica Conversa Cowork, Visibilidade Durante Fase de Teste, Task Obrigatoria por Etapa do Pipeline, Tags de Proveniencia de Dado, Isolamento Entre Produtos e Categorias no Grafo, Principio de Granularidade do Grafo 1, Eixos Que Nunca Podem Ficar Ambiguos, Protocolo de Feedback e Correcao, Trava de Formato da Foto de Capa, Sugestões — Muleta, Responsabilidade Unica por Foto (Fotos 2-7), Proibicao de Comparacao com Concorrentes, Camada Grafica Informativa (Fotos 2-7), Pulverizador Manual de Compressão Prévia Guarany 1,2L]
---

# Grafo de Categorização em Duas Camadas e Base de Conhecimento do Produto

## O quê

Evolução direta de [[Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets]] — a peça central mudou de "como gerar 7 fotos" para "como construir 1 base de conhecimento por produto, que não sabe nem se importa com o que vai virar depois". Foto, vídeo, título, descrição e tag passam a ser consumidores dessa mesma base, não pipelines paralelos cada um refazendo sua própria análise do zero.

## Modelo Mental — 2 Fases (23/08/2026, 18h42)

Reformulação central desta sessão — a distinção mais importante do pipeline inteiro, é ela que decide onde qualquer etapa nova entra. Tudo abaixo se encaixa numa de 2 fases:

- **0 — Input do usuário**: dados brutos (fotos + texto do anúncio). Nada é lido/interpretado ainda.
- **1 — Estudo do produto** (Étapas 1-4): "isso é tudo que eu consegui aprender" — leitura, técnica, contextual, fusão comercial. Não sabe nem a categoria ainda.
- **2 — Grafos 1 e 2** (Étapa 5): "aqui é tudo que você deveria saber — preencha os campos e aponte o que falta." Classifica (Grafo 1) e aprofunda a densidade (Grafo 2) contra o que já foi aprendido no passo 1. O resultado é a **base densa** — o que antes era chamado de "Documento Consolidado da Étapa 6" deixa de ser uma etapa própria: é só o produto natural de juntar os passos 1 e 2.
- **3 — Consolidação Criativa**: os mesmos nós/templates do Grafo 1 e do Grafo 2 já registrados na base densa viram **gatilho** pro Grafo 3, que devolve **sugestões** (nunca regras/obrigações — ver seção do Grafo 3 mais abaixo, redesenhada nesta sessão). A união de tudo que foi acionado forma o **pool de sugestões**.
- **Base final = base densa + pool de sugestões.** Até aqui, nada foi gerado — é 100% pesquisa e densificação de informação. Nenhuma etapa anterior a esta produz conteúdo de venda.
- **4 — Criação**: só agora algo é de fato escrito, lendo a base final inteira.

**Correção de arquitetura desta sessão**: numa versão anterior deste desenho, o Grafo 3 saía direto do Grafo 1, correndo em paralelo com a Étapa 6/base densa, e só se encontrava com ela no prompt final. Isso estava errado — o Grafo 3 não pula a base densa, ele entra DEPOIS dela, dentro da fase de Criação, lendo os nós/templates que a própria base densa já registrou. Não existe caminho que bypassa a base densa.

### Foto de Capa vs. Fotos 2-7 (decisão de 23/08/2026, 18h42)

Só a Foto 1 (Capa) tem uma trava — pequena, de formato, não de conteúdo: ver [[Trava de Formato da Foto de Capa]]. Ela não escolhe o cenário por decreto — continua lendo a mesma base final que qualquer outra foto — só obriga o resultado escolhido a caber no formato "produto ambientalizado no contexto de uso, sem humanos".

As Fotos 2-7 ainda não têm trava de conteúdo (continuam sem um "4º grafo" determinístico por foto) — mas o risco abaixo, identificado nesta mesma sessão, foi resolvido com um método, não com mais regras rígidas.

**Risco identificado e resolvido (23/08/2026, 20h55)**: as 6 fotos livres precisavam formar um conjunto coerente que responda dúvidas reais de comprador de Mercado Livre, sem virar 6 escolhas soltas e redundantes. Testado de ponta a ponta com o Pulverizador Guarany 1,2L — resolvido com 3 peças novas, todas formalizadas em notas próprias:
- [[Responsabilidade Unica por Foto (Fotos 2-7)]] — o método: ler a base densa, perguntar "o que o cliente quer saber sobre esse produto?", 1 foto = 1 pergunta, sem repetir e sem lacuna.
- [[Proibicao de Comparacao com Concorrentes]] — nenhuma foto compara com "outro produto"/concorrente (motivo duplo: anti-invenção + posicionamento comercial da loja, que vende marcas concorrentes entre si).
- [[Camada Grafica Informativa (Fotos 2-7)]] — como compor cada foto (headline, ícones, diagramas, chamadas, selos, fundo dinâmico desfocado em vez de liso, fidelidade de cor por componente) — complementa, não substitui, o esqueleto de 6 blocos de [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]].

Continua não sendo uma trava de conteúdo fixa por categoria — é um método a aplicar de novo pra cada produto, mantendo a mesma disciplina de "não resolver tudo de uma vez com controle determinístico" que guiou a decisão original.

## Por quê — o que mudou desde a decisão anterior

A decisão anterior já tinha o núcleo certo (análise dupla técnica+contextual, não inventar dado, perguntar se faltar), mas estava com o escopo errado: pensava a árvore de categorias e o "Padrão Esperado" como algo feito **para gerar fotos**. Na prática, o problema é maior — o usuário precisa da mesma profundidade de entendimento do produto pra qualquer material (foto, vídeo, título, descrição), e refazer essa análise por tipo de saída desperdiça trabalho e gera inconsistência entre os materiais de um mesmo produto. A solução: separar **construção do entendimento** (1 vez por produto, máxima profundidade, sem saber o destino) de **geração do material específico** (N vezes, cada gerador lendo a mesma base).

## O pipeline de construção da Base de Conhecimento

1. **Leitura de dados** — texto (título + descrição) e imagem de referência lidos juntos, sem interpretar nada ainda.
2. **Análise técnica completa e detalhada** — fatos objetivos do produto. Função única: dizer o que o produto possui, nunca responder pergunta nenhuma (sem prever, comparar ou calcular).
3. **Análise contextual completa e detalhada** — o que o cliente, comprando aquilo, gostaria de saber/sentir. Fala com voz confiante, sem precisar ancorar frase a frase — a checagem de honestidade não é dela.
4. **Análise comercial completa e detalhada (Fusão e Validação)** — eixos comerciais (1 dor real + 1 recurso técnico validado que a resolve), o mesmo conceito já usado no `Construtor de Anúncios v1.3` do usuário (prompt Claude Projects, não documentado neste vault por já existir fora dele). É aqui que a checagem de honestidade acontece: dor sem recurso técnico real (Fase 2) não vira eixo — vira "decisão de exclusão" documentada.
5. **Navegação pelos 2 grafos de categorização** (ver abaixo) — reforça a base respondendo as perguntas que a categoria do produto ativa, e sinaliza o que falta.
6. **Consolidação** — funde as Etapas 1-5 em 1 único documento final, no molde fixo descrito abaixo. É a ÚNICA coisa que qualquer gerador de conteúdo futuro (título, descrição, foto, vídeo) deve ler — nenhum gerador lê as Etapas 1-5 originais diretamente.

Resultado: a Base de Conhecimento daquele produto — nenhum material de venda ainda é gerado nessa fase.

### Molde da Etapa 6 (Consolidação) — travado em 23/08/2026 00h42

Documento único com 6 seções numeradas, cada uma com uma linha de "Escopo desta seção" logo abaixo do título, pra deixar explícito o que entra e o que não entra ali:

1. **Fatos e Especificações** — só características físicas/técnicas confirmadas (texto e/ou imagem). Nada de interpretação, nada de promessa de venda.
2. **Funcionamento** — como as partes da seção 1 se conectam e operam juntas. Ainda sem julgamento de qualidade, comparação ou previsão de desempenho.
3. **Contexto de Compra** — perfil, cenários, dores, antes/depois. Não precisa ancorar frase a frase na seção 1, mas não pode contradizê-la.
4. **Eixos de Venda Validados** — cada eixo cruza 1 dor da seção 3 com 1 recurso comprovado nas seções 1-2. Só isso pode virar promessa de venda.
5. **Decisões de Exclusão** — dores/ângulos comerciais avaliados e recusados por falta de recurso técnico real, com a justificativa. Existe pra impedir que alguém reintroduza isso depois achando que ninguém avaliou.
6. **Cruzamento com a Categoria (Grafo)** — tabela completa (`Template | Pergunta | Resposta | Confirmado por`) de todas as perguntas ativadas pelos nós do Grafo 1 tocados, respondidas ou marcadas "dado ausente". É a fonte oficial de lacunas — nenhuma lacuna deve ser citada fora dessa tabela.

**Decisão deliberada: CLAIM_FABRICANTE (linguagem subjetiva/comercial do fabricante, isolada na Etapa 1) não entra na Consolidação em nenhuma seção**, nem como referência de tom. Motivo: mesmo rotulado como "não verificado", já provou nesta conversa que contamina (foi assim que "braços escamoteáveis" quase virou recurso técnico validado na Etapa 4) — e o benefício é baixo, já que os Eixos de Venda Validados (seção 4) já capturam tudo que era legítimo aproveitar daquela linguagem, na forma validada.

**Quem for escrever a Étapa 6 de um produto novo deve ler o molde vazio, nunca um produto real como referência de formato**: [[_Molde - Documento Consolidado (Etapa 6)]] — ler um arquivo já preenchido em `04_Produtos/` como "modelo" arrisca vazar dado de um produto pro outro e não escala conforme o catálogo cresce (correção de 23/08/2026, 23h11). [[Pulverizador Costal SS-20B Brudden]] continua existindo como 1º produto real que aplicou este molde, mas é referência de leitura opcional depois de já ter escrito o documento — nunca o guia usado durante a escrita.

### Task obrigatória por produto novo

Ver [[Task Obrigatoria por Etapa do Pipeline]] — regra completa, com o motivo de não usar subagente com contexto isolado no lugar.

### Visibilidade durante a fase de teste

Ver [[Visibilidade Durante Fase de Teste]] — regra completa, com exemplo real de aplicação (teste de ponta a ponta da Muleta).

## Os 2 grafos de categorização

### Grafo 1 — "O que é" (classificação/identidade)

Não é árvore com caminho único nem conjunto de facets soltos "somando" — é um grafo de notas, exatamente como qualquer nota do vault se liga a outras. O produto se liga a quantos nós forem relevantes (`Pulverizador Costal`, `Pulverizador Elétrico e Manual`, `Uso Restrito a Líquidos`...); os próprios nós de categoria também se ligam entre si, do mais específico ao mais genérico (`Pulverizador Elétrico e Manual` → `Pulverizador`). Navegar do específico pro genérico é só seguir link, não uma regra de herança separada.

### Grafo 2 — "O que pode ter" (templates de característica)

Biblioteca de templates de campo, organizados por domínio do produto (Dimensões, Dados do Tanque, Dados da Lança, Dados do Mecanismo, Dados da Bateria...) — não sabe nada sobre categoria nenhuma, só sabe que existe, por exemplo, um template "Dados da Bateria" com os campos Capacidade/Autonomia/Tipo/Tempo de Recarga. Reaproveitável entre categorias completamente diferentes (o mesmo template de bateria serve pra um pulverizador elétrico e pra uma cadeira de rodas motorizada).

### Grafo 3 — "Como mostrar" (sugestões, não regras — redesenhado 23/08/2026, 18h42)

Terceira camada, nascida da necessidade de gerar fotos/vídeos com densidade real por categoria, em vez de genéricos. Mecanismo revisado nesta sessão: cada gatilho é 1 nó do Grafo 1 OU 1 template do Grafo 2 (antes só aceitava Grafo 1) — arquivo próprio, "Ativado por: [[nó ou template]]". Não é "que pergunta responder" nem "regra obrigatória" — é uma lista solta de **sugestões** (foto, vídeo, texto, misturados), que a fase de Criação pode usar, adaptar ou ignorar conforme o bom senso, olhando o dado real do produto.

**Por que "sugestão" e não "regra"**: sugestões de gatilhos diferentes podem se sobrepor ou até puxar em direções levemente diferentes (ex.: "mostrar o produto como um todo" vs. "zoom num detalhe específico"). Como regra, isso seria uma contradição a resolver; como sugestão, é só material bruto — quem decide o que cabe é a fase de Criação, lendo a base final (fatos + pool de sugestões) daquele produto.

**Quando o Grafo 3 é consultado**: só depois que a base densa (passos 1-2 do Modelo Mental acima) já está pronta — nunca em paralelo com ela. Os gatilhos vêm de dentro da própria base densa (a lista de nós do Grafo 1 e templates do Grafo 2 que ela já registrou), não são buscados direto no Grafo 1 isoladamente.

A foto nunca é sobre a categoria ampla — é sobre a união de tudo que os gatilhos tocados por aquele produto ativam (mesma lógica de "Cruzamento com a Categoria" da Étapa 6, aplicada a foto/vídeo). Exemplo real: um pulverizador só-manual nunca ativa o gatilho de "dupla fonte de energia"; um pulverizador elétrico-e-manual ativa. A divergência nasce da diferença real de nós/templates tocados, sem decisão manual caso a caso.

**2 camadas de especialização, sempre nesta ordem**: (1) o gatilho (Grafo 3) dá o pool de sugestões genéricas e reaproveitáveis; (2) a base densa (passos 1-2) preenche com o dado real daquele produto específico. Sugestão genérica × fato específico = conteúdo denso, não genérico — motivo pelo qual o trabalho investido nos passos 1-2 se paga aqui.

Regras completas de como escrever o prompt em si (universal, não por categoria) vivem em [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]]. A única trava por slot de foto vive em [[Trava de Formato da Foto de Capa]] (só a Foto 1). Exemplos: [[Cenário de Capa - Ambiente Residencial Externo]] (gatilho de Grafo 1), [[Sugestões — Sistema de Ajuste de Altura]] (1º gatilho de Grafo 2).

### O mecanismo de gatilho entre os grafos

Cada nó do Grafo 1, em qualquer nível (bem genérico ou bem específico), dispara seu próprio gatilho, ativando 1 ou mais templates do Grafo 2. Exemplo: `Pulverizador` ativa os templates gerais (dimensões, tanque, mecanismo); `Costal` ativa os de uso nas costas; `Elétrico` ativa o de bateria. O molde final de perguntas de um produto = união de todos os templates ativados por todos os nós que ele toca — nenhum campo aparece sem que algum nó do produto o tenha ativado.

Desde 23/08/2026 (18h42), o Grafo 3 também é acionado por esse mesmo mecanismo — só que agora por 2 fontes possíveis: um nó do Grafo 1 OU um template do Grafo 2, cada um podendo ativar 1 ou mais entradas de sugestão. Primeiro exemplo real de gatilho vindo do Grafo 2 (não do Grafo 1): [[Sistema de Ajuste de Altura]] aciona [[Sugestões — Sistema de Ajuste de Altura]] — qualquer produto que confirme esse template, de qualquer categoria, ganha a mesma sugestão, sem precisar tocar nenhum nó específico do Grafo 1 pra isso.

Regra prática validada com exemplo real: não faz sentido perguntar peso suportado de um pulverizador (nenhum nó de pulverizador ativa esse template) nem capacidade de bateria de um pulverizador 100% manual (só nós de energia elétrica ativam esse template).

### Princípio de granularidade do Grafo 1

Ver [[Principio de Granularidade do Grafo 1]] — regra completa, com exemplos reais de aplicação correta (XP20) e de nó legítimo (Cadeira de Rodas Dobrável).

### Eixos que nunca podem ficar ambíguos

Ver [[Eixos Que Nunca Podem Ficar Ambiguos]] — lista completa e atualizada, incluindo a confirmação real de "Unidade de Venda - Kit ou Conjunto" com a Muleta.

## Exemplo real 1 — Pulverizador Costal SS-20B Brudden (20L, elétrico e manual)

Nós tocados no Grafo 1: `Pulverizador` · `Pulverizador Costal` · `Pulverizador Elétrico e Manual` · `Uso Restrito a Substâncias Líquidas` (não aceita pó/inflamável/corrosivo/combustível/solvente) · `Uso em Jardim e Propriedade Rural`.

## Exemplo real 2 — Pulverizador Manual Costal Agrícola Jacto XP20 (20L, 100% manual)

Usado pra testar se o grafo do exemplo 1 seria lido corretamente, sem confundir os 2 produtos:

- **Reaproveitado direto**: `Pulverizador`, `Pulverizador Costal` (os 2 são costais).
- **Quase confundido, corrigido a tempo**: fonte de energia é só manual — não liga em `Pulverizador Elétrico e Manual`; precisa do nó novo `Pulverizador Manual`, irmão daquele, não substituto nem filho.
- **Nós novos genuínos**: `Bomba tipo Pistão` (SS-20B é diafragma — mecanismo diferente), `Lança Fixa` (600mm fixo, SS-20B é telescópica 42-90cm), `Bico Único Instalado` (vem com 1 bico, SS-20B vem com kit de 5), `Uso com Defensivos Agrícolas Homologados` (indicação regulatória específica, diferente da restrição genérica do SS-20B), `Uso Agrícola Profissional` (lista extensa de cultivos: hortaliças, café, cana, pomares — mais específico que "jardim e propriedade rural").
- **Achado retroativo**: os 2 produtos têm "gatilho com trava", mas isso nunca virou nó pro SS-20B — passou batido na primeira classificação. Um nó criado agora (`Gatilho com Trava`) deveria linkar nos 2 produtos, não só no mais recente. Prova de que o grafo cresce de forma imperfeita e vai sendo corrigido, não precisa nascer completo.

## Exemplo real 3 — Cadeira de Rodas Motorizada Dobrável D800 Dellamed (bootstrap com 2ª categoria)

Primeiro teste real de reaproveitamento de nó/template entre categorias completamente diferentes (pulverizador × cadeira de rodas). Resultado:

- **Reaproveitado direto, sem alteração**: [[Unidade de Venda - Item Único]] / [[Unidade de Venda - Campos]] (eixo transversal, já esperado). Mais importante: [[Bateria e Energia]] — ativado agora por [[Cadeira de Rodas Motorizada]] além de [[Pulverizador Elétrico e Manual]], sem precisar mudar nenhuma pergunta do template. Confirma que a arquitetura de gatilho (nó de categoria → template agnóstico de categoria) funciona como desenhado.
- **Nós novos genuínos**: [[Cadeira de Rodas]] (raiz, categoria não existia), [[Cadeira de Rodas Motorizada]] (eixo de fonte de energia, mesmo princípio do Pulverizador — aqui só "Motorizada", pois não há confirmação de propulsão manual alternativa), [[Cadeira de Rodas Dobrável]] (muda quais templates ativam — passa no teste de granularidade).
- **Templates novos genuínos**: [[Capacidade de Carga do Usuário]], [[Estrutura e Chassi]], [[Rodas]], [[Ergonomia de Assento e Encosto]] (ativados pela raiz — se aplicam a qualquer cadeira de rodas, motorizada ou não), [[Sistema de Motorização]] e [[Portabilidade e Transporte]] (ativados pelos nós filhos específicos). Todos escritos de forma genérica, sem "cadeira de rodas" no título, para ficarem reaproveitáveis por uma 3ª categoria futura — mesmo cuidado já aplicado a [[Bateria e Energia]].
- **Não virou nó**: "braços escamoteáveis", "apoio de pés retrátil" etc. — viraram valores de campo dentro de [[Ergonomia de Assento e Encosto]], mesma correção já aplicada à Bomba/Lança/Bico do Exemplo real 2.

Conclusão: o mecanismo de reaproveitamento funciona na prática, não só na teoria — uma categoria nova ainda assim reaproveitou o que fazia sentido reaproveitar (eixo transversal + template de energia) e só criou nó/template onde a distinção realmente mudava o que precisa ser perguntado.

## Erros corrigidos durante esta conversa

1. **Subagente com contexto isolado pra cada etapa** — proposto por mim como solução pro "contexto poluído" (etapas misturando raciocínio umas das outras numa conversa longa). Usuário rejeitou: não quer forçar subagente, só quer que a releitura da nota certa do vault, a cada etapa, seja suficiente disciplina.
2. **Árvore de herança (estilo POO) com "interfaces" pra casos combinados** — modelo que cheguei a propor pra reconciliar caminho único de classificação com casos tipo cadeira de rodas (Motorizada + Dobrável + Escamoteável ao mesmo tempo). Corrigido: não é árvore, é grafo — o mesmo mecanismo de link resolve os 2 casos (SS-20B com 1 "caminho" aparente e a cadeira com múltiplas características) sem precisar de uma regra especial pra combinação.
3. **Nome de nó "bonito"/vitrine** (`Alimentação híbrida`, `Uso doméstico leve`) — corrigido pra nome funcional e sem ambiguidade, extraído literalmente do dado (`Fonte de Energia: Elétrico e Manual`, valores exatos em vez de buckets subjetivos como "grande porte").
4. **Classificação como o ponto de maior risco do pipeline** — reavaliado depois do usuário apontar que não precisa acertar de primeira: o que precisa ser confiável é a leitura mecânica do grafo (checar nós existentes antes de criar duplicado, seguir os links certos). Erro de julgamento se corrige com feedback do usuário depois; o único momento que realmente exige atenção visível é a criação de um nó **novo**, porque isso não se autocorrige sozinho como um erro de julgamento correrige.

## Onde a Base de Conhecimento fica salva

Resolvido em 22/08/2026 23h56 — Grafo 1, Grafo 2 e os produtos classificados passaram a viver dentro de `05_Producao_de_Imagens_e_Videos/Vault_Simulado/`, em subpastas próprias (localização corrigida às 23h56 — a primeira tentativa, às 23h25, tinha criado essas pastas direto dentro de `Base_de_Conhecimento_Produto/`, no lugar errado). `Grafo_3_Como_Mostrar/` adicionado em 23/08/2026 05h33, mesma pasta-mãe. **Reestruturado em 23/08/2026, 21h01** — o vault virou standalone e a "pasta-mãe" `Vault_Simulado/` deixou de existir: Grafo 1/2/3 agora vivem em `03_Grafo/{1_O_Que_E, 2_O_Que_Pode_Ter, 3_Como_Mostrar}/`, e os produtos classificados foram puxados pra fora do Grafo, em `04_Produtos/` — separação física que reforça a regra de isolamento (nenhuma nota do Grafo cita produto específico).

## Regra crítica de isolamento entre produtos

Ver [[Isolamento Entre Produtos e Categorias no Grafo]] — regra completa, com o motivo técnico (ferramenta de leitura de arquivo só vê texto literal, não o painel de backlinks do Obsidian) e o achado real que a originou (D800).

## Molde final das notas (travado em 22/08/2026 23h56)

**Nó do Grafo 1**: `# Tipo:` (Define um item / Define um uso / Define quantidade) → `# Título:` → `# Definição da categoria:` (regra de pertencimento, não descrição de 1 produto) → `# Aciona:` (só os templates próprios deste nó, sem repetir os herdados do pai) → `# Se relaciona com:` (nó pai e/ou nota de decisão — sem produtos).

**Template do Grafo 2**: `# Tipo:` (domínio da característica — ex.: Dimensões, Alimentação, Mobilidade, Mecanismo, Restrição, Comercial — taxonomia aberta, cresce conforme necessário) → `# Título:` → `# Perguntas que devem ser respondidas:` (cada pergunta de valor numérico/categórico vem separada de uma pergunta própria de unidade de medida — nunca embutir a unidade entre parênteses na mesma pergunta, pra não presumir que todo produto futuro vai usar a mesma unidade) → `# Ativado por:` (nós do Grafo 1) → `# Se relaciona com:`.

**Gatilho do Grafo 3** (redesenhado 23/08/2026, 18h42): `# Tipo:` (Gatilho de Identidade [Grafo 1] | Gatilho de Característica [Grafo 2]) → `# Título:` → `# Sugestões:` (lista solta de ideias — foto, vídeo, texto, misturados; nunca 1 regra única obrigatória) → `# Por que:` (que tipo de dor/eixo genérico da categoria isso demonstra) → `# Ativado por:` (nó do Grafo 1 OU template do Grafo 2) → `# Confirmado em:` (produtos que já usaram alguma sugestão daqui com sucesso, com data e resultado — ou "proposto, não confirmado" quando ainda não testado) → `# Se relaciona com:`.

Exemplos completos: [[Pulverizador Costal]] (Grafo 1), [[Bateria e Energia]] (Grafo 2), [[Cenário de Capa - Ambiente Residencial Externo]] (Grafo 3, gatilho de Grafo 1), [[Sugestões — Sistema de Ajuste de Altura]] (Grafo 3, gatilho de Grafo 2).

**Nota de produto classificado**: superada pelo molde de 6 seções da Etapa 6 (Consolidação), descrito acima. A regra de "Resposta isolada e pura" (só o valor, nunca misturado com palavra de status) continua valendo dentro da tabela da seção 6 desse molde.

## Riscos e perguntas em aberto

- Fronteira exata da Etapa 1 (só ler/organizar, sem interpretar) — testada na prática, ver Étapas 1-4 validadas em conversa (prompt ainda não salvo no vault).
- Formato de saída de cada etapa (texto corrido vs. campos rotulados) — campos rotulados ("o produto possui X") confirmados como o formato certo pra Etapa 2, ver Evolução abaixo.
- ~~Onde/como o Grafo 1 e o Grafo 2 fisicamente vivem no vault~~ — resolvido, ver seção "Onde a Base de Conhecimento fica salva" e "Evolução" abaixo.
- Fonte real de "perguntas do cliente" por template do Grafo 2 — cogitado usar Perguntas e Respostas reais do Mercado Livre ou histórico de suporte, em vez de a LLM inventar do zero; ainda sem teste prático.
- Bootstrap validado só com 1 produto (SS-20B) até agora — falta testar se um 2º produto de categoria diferente reaproveita nós/templates existentes corretamente ou cria duplicata.

## Evolução (22/08/2026, 23h25)

Sessão seguinte reformulou o pipeline de construção da Base de Conhecimento (Étapas 1-4) usando uma analogia de treinamento de vendedor (professor de engenharia = Etapa 2 técnica, professor de idealização = Etapa 3 contextual, professor de marketing = Etapa 4 fusão/validação). As 4 etapas foram escritas como prompt único, testadas com múltiplos produtos reais (SS-20B, cadeira de rodas Dellamed D100, meia para coto SG700) e travaram 2 regras críticas de honestidade:

1. **Proibição absoluta de dado inventado ou calculado**: nenhuma fase pode produzir valor novo que dependa de assumir dado ausente (nem "estimativa", nem "aproximação") — descoberto via um cálculo de peso operacional inventado na Etapa 2 que se propagou como fato pela Etapa 3.
2. **Etapa 2 (técnica) não responde perguntas**: só descreve o que o produto possui, nunca prevê, compara ou avalia — qualquer frase precisa ser reescrevível como "o produto possui X".
3. **Etapa 4 (fusão) só valida dor contra característica física confirmada na Etapa 2, nunca contra um claim isolado na Etapa 1** — descoberto com o caso dos "braços escamoteáveis" (cadeira de rodas), onde um claim do fabricante quase virou "recurso técnico validado".
4. **Quando não existe recurso técnico real por trás de uma dor, a Etapa 4 declara isso explicitamente e não cria o eixo** — descoberto com o caso da meia de coto (dado bruto quase sem especificação física nenhuma). Esse "sem eixo validável hoje" não é falha do pipeline, é o sinal exato de que a Etapa 5 (este grafo) precisa entrar em ação para revelar que lacunas específicas da categoria faltam preencher.

Isso também corrigiu um erro deste próprio grafo: o Exemplo real 2 (Jacto XP20) abaixo listava "Bomba tipo Pistão", "Lança Fixa" e "Bico Único Instalado" como nós novos do Grafo 1. Reaplicando o princípio de granularidade já definido nesta nota (um nó só existe se muda quais templates do Grafo 2 ativam), isso está errado — tipo de bomba, tipo de lança e quantidade de bico não mudam qual template ativa, só preenchem valores diferentes dentro dos mesmos templates. Esses 3 itens foram reclassificados como campos de template do Grafo 2 (ver [[Mecanismo de Bombeamento]], [[Lança]], [[Bico e Jato]]), não como nós do Grafo 1. "Uso com Defensivos Homologados" e "Uso Agrícola Profissional" continuam candidatos válidos a nó, por poderem ativar um template regulatório extra.

Primeira execução real da Etapa 5 (bootstrap, grafo criado do zero) feita com o SS-20B — ver [[Pulverizador Costal SS-20B Brudden]] para os nós tocados, o cruzamento completo com o Grafo 2 e as 8 lacunas reais de categoria reveladas (nenhuma delas visível pelas Étapas 1-4 sozinhas).

## Estado (23/08/2026, 18h42)

**Reformulação de arquitetura desta sessão (18h42)** — ver "Modelo Mental — 2 Fases" no topo desta nota: o pipeline passou a ser pensado em 2 fases (Entendimento: passos 0-3, nada é gerado; Criação: passo 4, onde algo é de fato escrito). O Grafo 3 foi redesenhado de "regra de foto por categoria" pra "banco de sugestões por gatilho" — cada gatilho agora pode vir do Grafo 1 OU do Grafo 2 (antes só Grafo 1), e o campo antes chamado "Regra de Foto/Vídeo" virou "Sugestões" (lista solta, nunca obrigação). As 6 notas de Grafo 3 já existentes foram reformatadas pro novo schema sem perder o histórico de confirmação. 4 gatilhos novos criados como bootstrap do novo mecanismo: [[Sugestões — Par (Unidade de Venda)]], [[Sugestões — Muleta]], [[Sugestões — Muleta Axilar]] (gatilhos de Grafo 1) e [[Sugestões — Sistema de Ajuste de Altura]] (1º gatilho de Grafo 2 da história do vault). Nova regra pequena criada: [[Trava de Formato da Foto de Capa]] — só a Foto 1 tem trava (formato, não conteúdo: produto ambientalizado no contexto de uso, sem humanos); as Fotos 2-7 seguem livres, decisão deliberada de não adicionar controle determinístico antes de testar necessidade real.



Pipeline de construção da Base de Conhecimento (Étapas 1-4) validado com 4 produtos reais de categorias diferentes (incluindo a cadeira de rodas D800, rodada do zero com o prompt fundido salvo — ver [[Cadeira de Rodas Motorizada Dobrável D800 Dellamed]]). Grafo 1 e Grafo 2 existem fisicamente no vault, dentro de `03_Grafo/`, com o molde de nota travado, agora com 3 produtos classificados de categorias diferentes (SS-20B, D800 e Muleta Axilar Hidrolight) — reaproveitamento de nó/template confirmado na prática (ver Exemplo real 3 acima). Étapa 6 (Consolidação) desenhada, travada e aplicada aos 3 produtos.

**Correção de arquitetura importante (23/08/2026)**: o entendimento de que as Étapas 1-4 rodam numa conversa separada, fora do Cowork, estava errado — foi um desvio, não a arquitetura pretendida. Tudo, desde a Étapa 1 até a geração final de fotos/vídeos, deve rodar numa única conversa Cowork (só ela tem leitura/escrita do vault); o requisito real é o vault ser 100% autocontido, não a etapa rodar "aqui" ou "lá". Detalhe completo em [[00_Leia_Primeiro]].

**Grafo 3 (Como Mostrar) criado nesta sessão** — ver seção própria acima — com 6 entradas: 3 confirmadas na prática ([[Cenário de Capa - Ambiente Residencial Externo]], [[Cenário de Capa - Horta, Pomar ou Jardim Doméstico]], [[Cenário de Capa - Ambiente Doméstico Interno]]) e 3 propostas ainda não testadas ([[Controle Motorizado em Destaque]], [[Redução de Tamanho para Transporte]], [[Demonstração de Dupla Fonte de Energia]]).

**Protocolo de Feedback e Correção formalizado como prompt autocontido (23/08/2026, 06h30)** — ver [[Protocolo de Feedback e Correcao]]: triagem de feedback do usuário sobre uma geração específica em 5 causas possíveis (regra universal de prompt, qualidade de input, expectativa de categoria no Grafo 3, dado errado do produto na Étapa 6, ou aleatoriedade sem causa), escrevendo a correção reaproveitando a disciplina de `bug_conhecido` já existente no vault. Já usado 1x na prática nesta sessão (correção da marca Hidrolight, causa 4), antes mesmo de existir como prompt formal.

**Étapas 1-4 agora também têm prompt autocontido no vault** — ver [[Etapa 1-4 - Estudo do Produto]], conferido contra as regras desta nota, sem divergência. Substitui a prática de rodar numa conversa separada fora do vault.

**Teste de ponta a ponta concluído (23/08/2026, 06h18)** — produto novo cru (Muleta Axilar 3 em 1 Hidrolight) → Étapas 1-4 → Étapa 5 (bootstrap de 3ª categoria, com 1ª ativação real do nó [[Unidade de Venda - Kit ou Conjunto]]) → Étapa 6 → Grafo 3 (nova entrada [[Cenário de Capa - Ambiente Doméstico Interno]]) → prompt de Foto 1 Capa, tudo dentro da mesma conversa Cowork, guiado só pelos prompts já salvos no vault. 2 gerações de imagem testadas (GPT-Image e Gemini/Nano Banana) com o mesmo prompt, ambas aprovadas sem ressalva pelo usuário — resultado consistente entre ferramentas diferentes.

**Atualização 23/08/2026, 20h55** — 4º produto testado (Pulverizador Manual de Compressão Prévia Guarany 1,2L, ver [[Pulverizador Manual de Compressão Prévia Guarany 1,2L]]), 1º dentro de uma categoria já existente (Pulverizador), confirmando 2 nós novos de fonte de energia/modo de operação ([[Pulverizador Manual]], [[Pulverizador de Mão]]) e 1 template novo ([[Empunhadura e Mecanismo de Acionamento]]). A Fase de Criação avançou de "Fotos 2-7 livres sem método" pra "Fotos 2-7 com método de responsabilidade única, camada gráfica e proibição de comparação" — ver seção "Foto de Capa vs. Fotos 2-7" acima, agora resolvida.

**Atualização 23/08/2026, 21h53** — Étapa 8 (Criação) formalizada como prompt autocontido, unindo Grafo 3 + Étapa 6 + [[Responsabilidade Unica por Foto (Fotos 2-7)]] + [[Camada Grafica Informativa (Fotos 2-7)]] + [[Proibicao de Comparacao com Concorrentes]] + [[Trava de Formato da Foto de Capa]] num único fluxo, ver [[Etapa 8 - Criacao (Fotos)]]. Falta: (a) desenhar o prompt autocontido da Étapa 6 (Consolidação) — hoje ainda feita manualmente; (b) formalizar a Étapa 7 (Consolidação Criativa — Grafo 3) como passo isolado com prompt próprio — hoje é consultada inline pela Étapa 5 e pela Étapa 8; (c) rodar os prompts da Étapa 5, das Étapas 1-4 e da Étapa 8 numa conversa realmente sem contexto anterior, pra confirmar que são suficientes sozinhos — até agora só foram testados nesta mesma conversa em que foram escritos; (d) testar a Étapa 8 numa categoria fora de pulverizador; (e) desenhar a camada de vídeo, ainda sem nenhuma regra real.

## Regras Extraídas para Notas Próprias (23/08/2026, 06h30)

Pra manter esta nota focada em decisão/arquitetura, as regras operacionais que estavam inline aqui viraram notas próprias — mais fáceis de achar, de referenciar de outros lugares do vault, e de reaproveitar por uma conversa Cowork nova que não tenha lido esta nota inteira:

- [[Pipeline Completo Roda Numa Unica Conversa Cowork]] — arquitetura de execução (tudo numa única conversa Cowork).
- [[Visibilidade Durante Fase de Teste]] — mostrar cada etapa antes de seguir, enquanto a categoria não provou confiabilidade.
- [[Task Obrigatoria por Etapa do Pipeline]] — 1 task por etapa, sem subagente isolado.
- [[Tags de Proveniencia de Dado]] — [TEXTO] / [IMG] / [TEXTO+IMG] / dado ausente / N/A / [USUÁRIO].
- [[Isolamento Entre Produtos e Categorias no Grafo]] — nenhuma nota de categoria cita produto específico.
- [[Principio de Granularidade do Grafo 1]] — nó só existe se muda template ativado.
- [[Eixos Que Nunca Podem Ficar Ambiguos]] — fonte de energia, unidade de venda.
- [[Protocolo de Feedback e Correcao]] — triagem de feedback em 5 causas, capacidade paralela disponível a qualquer momento.
- [[Trava de Formato da Foto de Capa]] — a única trava por slot de foto (formato, não conteúdo), adicionada em 18h42.
- [[Responsabilidade Unica por Foto (Fotos 2-7)]] — método pra decidir o que cada uma das 6 fotos livres responde, adicionada em 20h55.
- [[Proibicao de Comparacao com Concorrentes]] — nenhuma foto compara com outro produto, adicionada em 20h55.
- [[Camada Grafica Informativa (Fotos 2-7)]] — como compor cada foto informativa (headline, ícones, diagramas, fundo dinâmico, fidelidade de cor por componente), adicionada em 20h55.

## Relacionado

- [[Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets]]
- [[Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]]
- [[Pulverizador Costal SS-20B Brudden]]
- [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]]
- [[00_Leia_Primeiro]]
