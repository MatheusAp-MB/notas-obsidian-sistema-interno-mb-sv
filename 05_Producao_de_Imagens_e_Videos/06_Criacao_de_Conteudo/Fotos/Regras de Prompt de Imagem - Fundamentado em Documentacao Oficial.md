---
tipo: decisao
dominio: 
status: ativa
criado: 23/08/2026
atualizado_em: 24/08/2026 08:59
relacionado: [Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets, Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Cenário de Capa - Ambiente Residencial Externo, Cenário de Capa - Horta, Pomar ou Jardim Doméstico, Camada Grafica Informativa (Fotos 2-7), Responsabilidade Unica por Foto (Fotos 2-7)]
---

# Regras de Prompt de Imagem — Fundamentado em Documentação Oficial

## O quê

Um guia de como **pensar** a construção de um prompt de geração de imagem de alta qualidade, extraído de análise profunda da documentação oficial de 2 fornecedores (Google Nano Banana e OpenAI GPT-Image), não de tentativa e erro isolada.

**Isto não é um molde pronto pra copiar/colar em qualquer produto.** É a estrutura de raciocínio e os blocos que compõem qualquer prompt bom, segundo as próprias documentações — universal, vale pra qualquer categoria. O que muda de produto pra produto (cenário, materiais, ângulo) não mora aqui: o cenário/regra de conteúdo por categoria mora no [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto|Grafo 3 (Como Mostrar)]], e o dado concreto de cada produto mora na Étapa 6 (Documento Consolidado). Esta nota é só o "como escrever", não o "o que mostrar".

## 5 Regras Globais (valem para as 7 fotos, não só a capa)

Definidas antes da pesquisa de documentação, e confirmadas por ela — nenhuma das duas foi enfraquecida ou substituída pela outra:

1. Usar a imagem anexada como referência do produto.
2. Ser 100% fiel ao produto de referência.
3. Ser realista e de alta qualidade.
4. Formato 1:1, mínimo 1200×1200 px (padrão Mercado Livre).
5. Escrito em inglês (gera melhores resultados).

## Pré-requisito: Qualidade da Foto de Referência

Descoberto na prática (SS-20B, 23/08/2026): a Regra Global #2 (100% fiel ao produto de referência) é literal — se a foto de referência tem um defeito de enquadramento (ex.: parte do produto cortada pela borda do quadro), o modelo reproduz esse defeito também, porque não sabe distinguir "isto é o produto" de "isto é um acidente de como aquela foto específica foi tirada".

**Isso não se resolve mudando o prompt.** Tentar "prompt away" um defeito de referência via instrução extra de enquadramento vai contra a própria Regra Global #2 — estaríamos pedindo fidelidade e, ao mesmo tempo, pedindo pra ignorar parte do que a referência mostra. O ajuste certo é anterior ao prompt: garantir que a foto de referência usada já mostra o produto completo, sem corte, antes de escrever qualquer prompt em cima dela. Isso é um gate de qualidade de input, não um bloco do prompt.

## Fontes analisadas

- [Ultimate Nano Banana prompting guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana) (Google Cloud Blog)
- [Gemini API — Geração de imagens](https://ai.google.dev/gemini-api/docs/image-generation) (doc técnica completa, incluindo exemplos de edição/composição)
- [Build with Nano Banana 2](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-nano-banana-2/) (Google)
- [OpenAI API — Image generation guide](https://developers.openai.com/api/docs/guides/image-generation)
- [GPT-5.6 (anúncio)](https://openai.com/pt-BR/index/gpt-5-6/) — confirma que "reescrita automática de prompt" existe no caminho ChatGPT
- [Chegou o novo ChatGPT Imagens (GPT-Image-1.5)](https://openai.com/pt-BR/index/new-chatgpt-images-is-here/)
- [GPT-Image-1.5 Prompting Guide](https://cookbook.openai.com/examples/multimodal/image-gen-1.5-prompting_guide) (cookbook oficial, lido quase por completo)
- [OpenAI Academy — Criando imagens com o ChatGPT](https://openai.com/pt-BR/academy/image-generation/)
- Vídeo OpenAI Academy Índia (mnemônico dos 7 elementos — menor peso, é material de treinamento, não doc técnica)
- `aistudio.google.com/docs/image-generation` — não pôde ser lido (página renderizada em JS, retornou vazia)

## Regras universais (convergem nas 2 documentações — tratar como lei)

1. **Ordem estrutural**: cenário/contexto → assunto → detalhes-chave → restrições. Quando há imagem de referência, a ordem vira: referência/relação de fidelidade → cenário novo → detalhes → restrições.
2. **Especificidade concreta vence adjetivo genérico**: termos reais de câmera/lente/luz/material em vez de "8K ultra-detalhado".
3. **"Mude só X, mantenha o resto exatamente igual" é o padrão mais repetido nas 2 documentações inteiras.** Todo exemplo de edição/composição com referência real, nas 2 fontes, termina com uma variação dessa frase. É a regra mais importante pra qualquer caso com imagem de referência real (ou seja, quase todo o nosso caso de uso).
4. **Restrição positiva e negativa coexistem, não competem.** Descrever o que deve aparecer (positivo) E declarar exclusões diretamente (negativo: "no watermark", "no logos", "no people") — as 2 formas juntas, confirmado em 3 fontes independentes.
5. **Texto dentro da imagem**: sempre entre aspas, com estilo de fonte descrito, nomes de marca difíceis soletrados letra a letra.
6. **Iterar em passos pequenos**, nunca um prompt monolítico tentando acertar tudo de uma vez.
7. **Múltiplas imagens de referência precisam ser identificadas pelo que mostram, nunca só por número de posição.** Escrever "Image 2" sozinho obriga quem for gerar a imagem a saber exatamente qual arquivo é "a imagem 2" e subir na ordem certa — frágil, e o erro só aparece na hora de gerar. Correto é descrever o conteúdo junto ("a imagem de referência que mostra o closeup do mecanismo, com os 3 detalhes circulares de pressão/regulador/haste") — identificação por conteúdo não depende de ordem de upload. Erro cometido e corrigido em 23/08/2026 (Pulverizador Guarany 1,2L).
8. **Cada frase do prompt precisa ganhar seu lugar.** A OpenAI Academy é explícita: "1 a 3 frases claras" costumam bastar. Isso não significa "sempre curto" — significa que toda frase deve estar fazendo 1 de 3 trabalhos (fidelidade, restrição, ou especificidade que muda o resultado); frase decorativa deve ser cortada.
9. **Restrição negativa explícita contra texto extra não especificado.** Todo prompt com texto sobreposto precisa declarar que nenhum texto além do que foi explicitamente escrito (headline entre aspas + texto de cada bloco gráfico) pode aparecer na imagem — nunca confiar que o modelo vai se limitar sozinho ao que foi pedido. Descoberto em 24/08/2026 (Pulverizador Brudden DAS G2, Foto 2): sem essa restrição, o modelo acrescentou uma linha de legenda extra, não pedida, que saiu com texto ilegível/gramaticalmente quebrado ("Acontes anéétics de gosca, poulinri a repressurizada"). Reduz o risco, não elimina — texto gerado por modelo de imagem continua sendo o elemento menos confiável da composição.

## Como Pensar o Prompt — Blocos Estruturados (segundo a documentação)

As 2 documentações, lidas lado a lado, convergem no mesmo esqueleto de blocos pra qualquer prompt que edita/recria uma cena a partir de uma imagem de referência real. Não é uma lista de frases prontas — é uma sequência de decisões, cada uma com uma função específica. Pensar o prompt é passar por essas 6 perguntas, nesta ordem:

**Bloco 1 — Referência e ação central**
Função: declarar, antes de qualquer outra coisa, que existe uma imagem de referência e qual é a única ação central sobre ela (ex.: "colocar este produto numa cena nova"). Por quê nessa ordem: se a ação central vier depois de outros detalhes, o modelo pode tratar a referência como só mais um elemento da cena, em vez do ponto de partida fixo. Isso não muda entre fotos — é sempre a primeira frase.

**Bloco 2 — Cenário novo**
Função: descrever o que é livre pra mudar — o ambiente, o contexto, a cena ao redor do produto. Por quê: separar explicitamente "o que muda" de "o que não muda" evita que o modelo generalize a mudança pro produto também. **Isto é o que varia por produto** — vem da Seção 3 (Contexto de Compra) do documento consolidado daquele produto: o cenário certo é o cenário real de uso descrito ali, não um cenário genérico copiado de outra categoria.

**Bloco 3 — Cláusula de fidelidade (o que não muda)**
Função: listar, em detalhe concreto, tudo que deve ser preservado exatamente como está na referência (cor, material, formato, mecanismos visíveis) — e proibir explicitamente inventar texto/logo/marca que não esteja legível na referência real. Por quê: é aqui que mora a regra universal #3 ("mude só X, mantenha o resto igual") e a disciplina antifabricação (a mesma que já aplicamos a dado técnico, agora aplicada a dado visual). **Isto também varia por produto** — os detalhes de material/cor vêm só da Seção 1 (Fatos e Especificações) do documento consolidado, nunca de suposição.

**Bloco 4 — Restrições negativas explícitas**
Função: declarar diretamente o que NÃO pode aparecer (pessoas, mãos, marca d'água, texto extra). Por quê: a documentação da OpenAI é explícita que restrição positiva (bloco 3) e restrição negativa (bloco 4) se complementam, não se substituem — a positiva descreve o que deve existir, a negativa blinda contra intrusões. Parte disso é fixo pra todas as fotos (sem marca d'água, sem texto inventado); parte muda conforme o tipo de foto (ex.: "sem pessoas" vale pra capa, mas uma foto de uso pode exigir o oposto).

**Bloco 5 — Especificação de câmera e luz**
Função: usar vocabulário fotográfico concreto (ângulo, lente, tipo de luz, profundidade de campo) em vez de adjetivo genérico de qualidade — regra universal #2. Por quê: termos técnicos reais são mais previsíveis pro modelo do que "alta qualidade" ou "muito detalhado", que não descrevem nada de fato. **Decisão prévia necessária aqui:** qual dos 2 gêneros fotográficos (comercial/estúdio vs. natural/candid) essa foto pertence — isso determina o vocabulário certo pra esse bloco (ver seção abaixo).

**Bloco 6 — Qualidade de saída e formato técnico**
Função: fechar o prompt com as exigências de plataforma — fotorrealismo (sem CGI/ilustração), proporção 1:1, resolução mínima. Por quê: são as 5 Regras Globais traduzidas em instrução técnica; ficam sempre por último porque são exigência de output, não de conteúdo da cena. Isto é fixo pra todas as fotos de todos os produtos.

**Resumo do que é fixo vs. o que varia:**

| Bloco | Fixo (todas as fotos/produtos) | Varia (por produto ou por tipo de foto) |
| --- | --- | --- |
| 1. Referência e ação | Estrutura da frase | A ação central, se o tipo de foto não for capa |
| 2. Cenário | — | Sempre — vem da Seção 3 do produto |
| 3. Fidelidade | A proibição de inventar texto/marca | Os detalhes de material/cor — vêm da Seção 1 do produto |
| 4. Restrições negativas | Sem marca d'água, sem texto inventado | "Sem pessoas" muda conforme o tipo de foto |
| 5. Câmera e luz | — | Depende do gênero fotográfico escolhido |
| 6. Qualidade e formato | Sim, sempre (5 Regras Globais) | — |

## Nuances por fornecedor

- **Google**: aspect ratio/resolução são parâmetros de API separados (`response_format.aspect_ratio`, `image_size`, tiers 0.5K/1K/2K/4K); suporta até 14 imagens de referência com papéis diferenciados (objeto/personagem/estilo).
- **OpenAI**: tem parâmetro `input_fidelity="high"` dedicado a fidelidade de preservação em edições — prova que fidelidade é eixo de controle reconhecido, mesmo sem termos acesso a esse parâmetro (não usamos API).
- **Caminho ChatGPT (não API) tem uma camada invisível**: o modelo "mainline" (ex.: GPT-5.6) reescreve automaticamente o prompt antes de mandar pro gerador de imagem de fato — existe até um campo `revised_prompt` que comprova isso. O texto que escrevemos pode não ser o que o gerador de imagem realmente recebe nesse caminho. O caminho Nano Banana parece mais direto (sem essa camada documentada).
- **Google Flow (Nano Banana Pro) testado pela 1ª vez em 23/08/2026**, comparado lado a lado com GPT-Image (5.6, esforço alto) e Gemini (3.1 Pro, raciocínio estendido) usando o mesmo prompt e as mesmas imagens de referência: Flow teve a melhor integração produto+cenário (sombra e luz coerentes com o fundo, sem parecer colado) e ícones semanticamente mais corretos nesse teste específico; GPT entregou um estilo alternativo válido (cartão flutuante tipo UI); Gemini teve os ícones mais confusos (ex.: ícone de átomo/molécula pra "material"). Achado registrado como sinal de 1 teste, não como regra fechada sobre qual ferramenta usar sempre — ver [[Camada Grafica Informativa (Fotos 2-7)]] para o teste completo.
- **GPT-Image-1.5 é explicitamente promovido pra e-commerce**: "equipes que geram catálogos completos de imagens de produto (variações, cenários, ângulos) a partir de 1 imagem de origem" — é o nosso caso de uso exato, reconhecido oficialmente, não uma aplicação forçada.

## Os 2 gêneros fotográficos (não confundir)

- **Fotorrealismo natural/candid**: evitar "8K ultra-detalhado", evitar grading cinematográfico, pedir textura real (poros, rugas, imperfeição, desgaste de material).
- **Fotografia comercial de produto em estúdio**: aceita e até pede "ultra-realistic", setup de luz definido, ângulo de câmera específico — gênero mais polido.

Nossas fotos de produto usam o 2º gênero, mas emprestando do 1º a disciplina de especificidade real (material exato, não "brilhante" genérico).

## Erros corrigidos durante esta pesquisa

1. **Assumir que uma marca era "visível na referência" sem checar** — escrevi "visible Dellamed D800 branding precisely as shown in the reference" sem verificar a imagem real; o Nano Banana só executou o que foi pedido e renderizou texto que não existe na referência real (só há um emblema abstrato ali). Não foi erro da ferramenta, foi erro de prompt — o mesmo tipo de erro de dado inventado que já corrigimos nas Étapas 1-4, agora em imagem.
2. **Enquadramento só positivo não é suficiente pra exclusão** — "sole subject of the frame" sozinho é mais fraco que combinar com a restrição negativa direta ("no people, no human figures").
3. **Culpar a ferramenta por diferença de resultado antes de checar o próprio prompt** — a diferença de fidelidade entre Nano Banana e ChatGPT no mesmo teste inicialmente pareceu "comportamento de ferramenta", mas a causa real era o próprio texto do prompt.
4. **Confiar que o modelo só renderiza o texto pedido, sem dizer isso explicitamente** — no teste do Pulverizador Brudden DAS G2 (Foto 2, 24/08/2026), o prompt especificava a headline e 1 bloco de ícone+benefício, mas não proibia texto adicional; o modelo acrescentou uma 3ª linha de legenda não pedida, com texto ilegível. Corrigido com a Regra Universal #9 acima — mesmo tipo de erro dos itens 1-3 desta lista (assumir que o modelo se limita ao que foi descrito, sem uma restrição negativa explícita o forçando).

## Onde ficam os exemplos por categoria

Os exemplos concretos de prompt (o cenário exato, os materiais exatos, testados num produto real) não moram mais nesta nota — moram no [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto|Grafo 3 (Como Mostrar)]], indexados por nó do Grafo 1, não por produto. Isso permite reaproveitamento real entre produtos da mesma subcategoria (ex.: um 2º produto "Cadeira de Rodas Motorizada" reaproveita a mesma regra de cenário sem precisar re-derivar).

Os 2 primeiros exemplos, migrados de uma versão anterior desta nota:
- [[Cenário de Capa - Ambiente Residencial Externo]] — ativado por [[Cadeira de Rodas]], confirmado com a D800 Dellamed.
- [[Cenário de Capa - Horta, Pomar ou Jardim Doméstico]] — ativado por [[Uso em Jardim e Propriedade Rural]], confirmado com a SS-20B Brudden.

Esta nota continua sendo a fonte única do "como escrever" (regras universais + blocos estruturados acima); o "o que mostrar" por categoria vive no Grafo 3; o dado concreto de cada produto vive na Étapa 6.

## Estado (23/08/2026, 20h55)

Nota reorganizada em 05h33: exemplos por categoria migraram pro Grafo 3 (Como Mostrar). Esta nota fica com o conteúdo universal (5 regras globais, pré-requisito de qualidade de referência, 8 regras universais, 6 blocos estruturados, nuances por fornecedor, 2 gêneros fotográficos, erros corrigidos) — mas o esqueleto de 6 blocos só cobria bem a Foto 1 (Capa). Em 20h55, testado com o Pulverizador Guarany 1,2L que as Fotos 2-7 precisam de uma camada adicional (headline, ícones, diagramas, chamadas, selos) por cima do esqueleto de 6 blocos — ver [[Camada Grafica Informativa (Fotos 2-7)]] (o "como compor") e [[Responsabilidade Unica por Foto (Fotos 2-7)]] (o "o que cada foto responde"). Regra Universal #7 corrigida (identificar imagem de referência pelo conteúdo, não por posição) e nuance de fornecedor adicionada (Google Flow / Nano Banana Pro).

**Atualização 23/08/2026, 21h53**: Étapa 8 (Criação) formalizada como prompt autocontido — ver [[Etapa 8 - Criacao (Fotos)]], que incorpora as regras universais desta nota diretamente. Esta nota continua sendo a referência detalhada (fontes, erros corrigidos, nuances por fornecedor); o prompt autocontido é a fonte operacional.

Falta: (a) testar o esqueleto de blocos + camada gráfica com uma categoria bem diferente (ex.: uso interno/industrial); (b) decidir onde/como a foto de referência real do produto é buscada e como garantir que ela passe no pré-requisito de qualidade (fotos não ficam no vault — provavelmente aponta pro sistema de Drive/ERP já existente, mecanismo exato ainda não desenhado); (c) [[Proibicao de Comparacao com Concorrentes]] e a camada gráfica ainda não foram testadas em categoria fora de pulverizador.

## Relacionado

- [[Pipeline de Geracao Dinamica das 7 Fotos via Analise Dupla e Arvore de Categorias por Facets]]
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
