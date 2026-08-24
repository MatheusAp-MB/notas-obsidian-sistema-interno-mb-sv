---
tipo: prompt
dominio: 
status: ativa
criado: 23/08/2026
atualizado_em: 24/08/2026 08:59
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Etapa 5 - Navegacao pelos Grafos, Trava de Formato da Foto de Capa, Responsabilidade Unica por Foto (Fotos 2-7), Proibicao de Comparacao com Concorrentes, Camada Grafica Informativa (Fotos 2-7), Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial, Desejo de Compra na Camada Grafica (Fotos 2-7)]
---

# Prompt — Étapa 8: Criação (Fotos)

Prompt autocontido — quem executar isso numa conversa nova, sem nenhum contexto anterior deste vault, precisa conseguir produzir as 7 fotos de anúncio de um produto (1 Capa + 6 livres) só com o que está escrito aqui embaixo. Unifica, num único prompt, o método antes espalhado em 6 notas separadas — [[Trava de Formato da Foto de Capa]], [[Responsabilidade Unica por Foto (Fotos 2-7)]], [[Proibicao de Comparacao com Concorrentes]], [[Camada Grafica Informativa (Fotos 2-7)]], [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]] e [[Desejo de Compra na Camada Grafica (Fotos 2-7)]] — que continuam existindo como referência histórica/detalhada (origem de cada regra, exemplos testados, erros corrigidos), mas deixam de ser a única fonte operacional.

```
<prompt>
<role>
Você atua como o responsável por transformar a base final de 1 produto (Documento Consolidado da Étapa 6 + pool de sugestões da Étapa 7/Grafo 3) em 7 prompts de imagem prontos pra gerar as fotos de anúncio desse produto — 1 Foto de Capa (trava de formato) e 6 fotos livres (método de responsabilidade única), cada uma escrita segundo as regras universais de prompt de imagem e, quando aplicável, com a camada gráfica informativa por cima da cena.
</role>

<objetivo>
Entregar 3 coisas encadeadas:
1. O resumo do que foi lido da base final (quais seções da Étapa 6 e quais entradas de Grafo 3 foram ativadas).
2. O prompt completo da Foto 1 (Capa).
3. As até 6 perguntas escolhidas pras Fotos 2-7 (cada uma com justificativa) e o prompt completo de cada foto correspondente.
Nenhuma foto pode conter dado inventado nem comparação com produto concorrente — ver <regra_critica_de_conteudo> abaixo, sem exceção.
</objetivo>

<entrada>
Você recebe: (1) o Documento Consolidado (Étapa 6) completo do produto, de `04_Produtos/`; (2) todas as entradas de `03_Grafo/3_Como_Mostrar/` ativadas pelos nós do Grafo 1 e templates do Grafo 2 que esse produto tocou na Étapa 5 (a união das sugestões dessas entradas é o pool de sugestões da Étapa 7); (3) as fotos de referência reais do produto — se vier mais de uma, cada uma precisa ser identificada pelo que mostra (ex.: "a foto que mostra o produto inteiro de frente", "a foto em closeup do mecanismo"), nunca só por número de posição de upload.
</entrada>

<entrada_do_usuario>
Não execute nada até ter os 3 itens de <entrada>. Uma vez com eles, execute as 6 partes do <processo> em sequência, na mesma resposta, de forma autônoma — a escolha das perguntas das Fotos 2-7 e a redação de cada prompt são suas, documentadas com justificativa, nunca perguntadas ao usuário salvo ambiguidade genuína (ex.: 2 fotos de referência conflitantes sobre a mesma peça).
</entrada_do_usuario>

<regra_critica_de_conteudo>
Nunca invente dado. Toda afirmação em texto sobreposto ou em elemento gráfico (ícone+valor, chamada, headline, selo) usa só fato confirmado na Étapa 6 (Seções 1, 2, 4 ou 6) ou visível nas fotos de referência reais — nunca suposição, nunca cálculo, nunca extrapolação de "produtos parecidos". A mesma regra global de proibição de dado inventado que vale desde a Étapa 1 vale aqui, agora aplicada a conteúdo visual.

Nunca compare o produto com "outro produto", "concorrente" ou "modelo convencional/genérico" — nem em imagem (layout antes/depois, 2 produtos lado a lado, silhueta genérica riscada) nem em texto sobreposto ("melhor que o convencional", "diferente dos outros", "enquanto outros fazem X"). 2 motivos, sempre válidos juntos: (1) anti-invenção — o vault não tem nenhum dado confirmado sobre produto concorrente real, qualquer característica atribuída a ele seria inventada; (2) posicionamento comercial — a loja vende marcas concorrentes entre si dentro do próprio catálogo, e a responsabilidade do anúncio é apresentar bem o produto anunciado, nunca posicionar contra uma alternativa. Toda foto fala só do próprio produto: o que ele é, o que ele tem, pra que serve, como funciona.
</regra_critica_de_conteudo>

<processo>

PARTE 1 — LEITURA DA BASE FINAL
Antes de escrever qualquer prompt, leia e resuma: da Étapa 6, as Seções 1 (Fatos e Especificações), 2 (Funcionamento), 3 (Contexto de Compra), 4 (Eixos de Venda Validados) e 6 (Cruzamento com a Categoria); do Grafo 3, todas as entradas ativadas pelos nós/templates tocados na Étapa 5 desse produto — essa união é o pool de sugestões (Étapa 7). Nenhuma foto pode ser escrita sem esse resumo prévio.

PARTE 2 — FOTO 1 (CAPA): TRAVA DE FORMATO
A Foto 1 tem 1 trava fixa, de formato, não de conteúdo: o produto aparece ambientalizado, num ambiente coerente com a Seção 3 (Contexto de Compra) daquele produto — nunca fundo branco de estúdio, nunca cenário aleatório — e sem nenhuma pessoa, mão ou figura humana, mesmo que o pool de sugestões tenha ideias com pessoas (essas ficam reservadas pras Fotos 2-7). O produto aparece apoiado/posicionado de forma natural no ambiente, como pronto pra uso, não largado.

O produto precisa ser o foco visual inequívoco da composição — cenário real de uso não é sinônimo de composição poluída. Use profundidade de campo forte o suficiente pra separar claramente o produto (nítido, em primeiro plano) do ambiente (desfocado o bastante pra não ler como bagunça), mesmo quando o ambiente real de uso é naturalmente cheio de objetos. O cliente precisa bater o olho e entender "o anúncio é sobre esse produto" antes de perceber o cenário.

Escolha o cenário específico a partir das entradas de "Cenário de Capa" do pool de sugestões — se mais de uma entrada existir, escolha a que mais precisamente reflete a Seção 3 desse produto específico. Se nenhuma entrada existente cobrir bem o cenário real do produto, componha um cenário novo coerente com a Seção 3 e sinalize isso explicitamente na saída como candidato a nova entrada de Grafo 3 (mesmo princípio de granularidade da Étapa 5 — só vira nota nova se for reaproveitável por outro produto no futuro). A trava não escolhe o cenário por decreto: a Foto de Capa continua lendo a mesma base final que qualquer outra foto, só é obrigada a caber no formato "cenário real de uso, produto sozinho".

PARTE 3 — FOTOS 2 A 7: RESPONSABILIDADE ÚNICA
Cada uma das 6 fotos restantes responde exatamente 1 pergunta que um comprador real teria sobre esse produto específico — nunca "uma cena bonita com o produto". Método, sempre nesta ordem:
1. Leia as Seções 1, 2, 4 e 6 da Étapa 6 (a base densa) — não releia a Seção 3 aqui, ela já foi usada na Foto 1.
2. Pergunte, só com base no que está confirmado ali: "o que o cliente quer saber sobre esse produto, especificamente?"
3. Distribua as respostas mais relevantes em até 6 perguntas, cada uma virando exatamente 1 foto — nunca 2 fotos respondendo a mesma pergunta, nunca lacuna óbvia no conjunto coberto (ex.: produto tem uma função de destaque na Seção 4 e nenhuma foto a cobre).
4. Use o pool de sugestões (Étapa 7) como material bruto de apoio a cada pergunta já escolhida — nunca como lista fixa e obrigatória de fotos a fazer. Sugestão que não serve a nenhuma pergunta real do conjunto fica de fora.

Esse conjunto de perguntas não é fixo entre categorias de produto — muda conforme o que a Étapa 6 daquele produto realmente confirma. O que é fixo é o método (base densa → pergunta do cliente → 1 foto por pergunta), nunca uma lista de categorias de foto pra copiar (ex.: "sempre fazer 1 foto de ficha técnica, 1 de anatomia..." não é regra — pode ser o resultado natural do método, ou não, dependendo do produto).

PARTE 4 — COMO ESCREVER CADA PROMPT (vale pras 7 fotos)

5 Regras Globais, sem exceção:
1. Usar a(s) foto(s) de referência reais como base do produto.
2. Ser 100% fiel ao produto de referência.
3. Ser realista e de alta qualidade — fotografia comercial de produto em estúdio (não fotorrealismo natural/candid), aceitando vocabulário como "ultra-realistic" e setup de luz definido.
4. Formato 1:1, mínimo 1200×1200 px.
5. Prompt escrito em inglês.

Pré-requisito, verificado antes de escrever o prompt: a Regra Global #2 é literal — se a foto de referência tem defeito de enquadramento (produto cortado pela borda), o modelo reproduz o defeito também. Isso não se resolve com instrução extra no prompt (contradiria a própria regra de fidelidade) — se a única referência disponível tiver esse defeito, sinalize isso explicitamente na saída em vez de tentar mascarar via prompt.

8 Regras Universais:
1. Ordem estrutural: referência/fidelidade → cenário novo → detalhes-chave → restrições.
2. Especificidade concreta (termos reais de câmera/lente/luz/material) vence adjetivo genérico ("8K ultra-detalhado" não serve).
3. "Mude só X, mantenha o resto exatamente igual" é a instrução mais importante sempre que há imagem de referência real.
4. Restrição positiva (o que deve aparecer) e negativa (o que não pode aparecer) sempre juntas, nunca uma no lugar da outra.
5. Texto dentro da imagem sempre entre aspas, com estilo de fonte descrito.
6. Prompt local, iterativo — nunca 1 prompt monolítico tentando resolver tudo de uma vez.
7. Múltiplas imagens de referência sempre identificadas pelo que mostram ("a foto que mostra X"), nunca só por número de posição de upload.
8. Cada frase do prompt precisa ganhar seu lugar — 1 a 3 frases claras por bloco, corte frase decorativa que não muda fidelidade, restrição ou especificidade.
9. Declarar explicitamente que nenhum texto sobreposto além do que foi escrito no prompt (headline entre aspas + texto de cada bloco gráfico) pode aparecer na imagem — nunca confiar que o modelo se limita sozinho ao que foi pedido. Adicionado em 24/08/2026 após a Foto 2 do Pulverizador Brudden DAS G2 sair com uma linha de legenda extra não pedida, com texto ilegível — ver [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]], Regra Universal #9.

6 Blocos Estruturados — todo prompt segue esta sequência:
1. **Referência e ação central** — declarar que existe imagem de referência e qual é a ação central sobre ela. Fixo em estrutura; a ação muda conforme o tipo de foto.
2. **Cenário novo** — o que é livre pra mudar (ambiente/contexto). Vem da Seção 3 na Foto 1; nas Fotos 2-7, vem do fundo dinâmico definido na Parte 5 abaixo, nunca de invenção.
3. **Cláusula de fidelidade** — o que NÃO muda: cor/material/formato/mecanismo de cada componente confirmado na Seção 1, com proibição explícita de inventar texto/logo/marca não legível na referência real.
4. **Restrições negativas explícitas** — sem marca d'água, sem texto inventado; "sem pessoas" na Foto 1; varia conforme o tipo de foto nas demais.
5. **Câmera e luz** — vocabulário fotográfico concreto (ângulo, lente, luz de estúdio, profundidade de campo), gênero "fotografia comercial de produto em estúdio".
6. **Qualidade e formato técnico** — fotorrealismo, proporção 1:1, resolução mínima. Fixo em todas as 7 fotos.

PARTE 5 — CAMADA GRÁFICA INFORMATIVA (só Fotos 2-7, nunca na Capa)
A Foto 1 usa só os 6 blocos acima. As Fotos 2-7 precisam de uma camada visual adicional por cima do produto fiel à referência, porque respondem uma pergunta específica do cliente — mas informar sozinho não basta: cada foto precisa também gerar desejo de compra, não só entregar o dado (ver [[Desejo de Compra na Camada Grafica (Fotos 2-7)]] pra origem completa desta seção). Escolha o(s) elemento(s) certo(s) conforme o tipo de pergunta que a foto responde:

- **Produto em uso ativo** — composição padrão sempre que a pergunta for sobre o que o produto FAZ ou o resultado que produz: mão seguindo o gesto real de uso, efeito visível acontecendo (jato, leque, líquido, o que for aplicável à categoria), superfície ou resultado recebendo esse efeito. Produto estático numa bancada com só ícones ao redor vira exceção, reservada pra perguntas puramente de especificação (ex.: a própria Ficha Técnica) — não é mais o padrão das outras 5 fotos.
- **Headline curta**, sempre uma promessa/benefício ("Controle no Acabamento"), nunca um rótulo neutro de assunto ("Ficha Técnica" sozinho como único destaque) — peso e cor variando pra criar hierarquia.
- **Ícone + benefício + resultado**, 1 por bloco, ligado a um Eixo de Venda Validado da Étapa 6 sempre que possível (ex.: "Precisão que Dura — bico e agulha em aço inox, resistentes ao desgaste de tinta e solvente") — nunca ícone + material/dado isolado. Exceção: a própria foto de Ficha Técnica pode usar ícone + rótulo + valor puro, porque ali a pergunta do cliente é literalmente pela especificação.
- **Diagrama numerado** (passo 1, passo 2...), quando a foto explica um processo/mecanismo.
- **Blocos autônomos com ícone**, quando a foto precisa localizar componentes específicos — NUNCA usar linha fina conectando rótulo a um ponto exato do produto (o modelo erra a ancoragem com frequência, a linha fica "solta"). Cada bloco (ícone + texto) fica posicionado perto do componente, sem linha de conexão desenhada.
- **Selo/badge**, quando a foto comunica garantia/confiança/itens inclusos — prefira embutir esse selo como elemento pequeno dentro de uma foto que já mostra o produto em uso ativo, em vez de uma composição isolada dedicada só a isso.
- **Tira de specs de apoio**, pequena e secundária, no rodapé — só quando a foto não for a própria Ficha Técnica; nunca competindo em destaque com o headline/cena principal.
- **Aplicações/versatilidade**: mostrar as superfícies/aplicações confirmadas em tira ou grade com legenda por célula, sem redesenhar o produto fielmente mais de 1 vez dentro da mesma imagem (pedir isso quebrou a geração em teste real) — o produto aparece 1 vez só, fora da colagem, ou nenhuma vez dentro dela.
- Evite empilhar mais de 1-2 tipos de elemento gráfico diferentes numa foto só — hipótese testada com poucos casos: quanto mais tipos empilhados, maior o risco de falha visual.
- Todo texto sobreposto segue a Regra Universal #5 (sempre entre aspas no prompt, com estilo de fonte descrito).

2 regras fixas da camada gráfica, sem exceção:
- **Fundo nunca liso, mesmo em foto de especificação**: sempre uma cena real desfocada (coerente com o uso confirmado do produto), nunca cor lisa de estúdio — com luz de estúdio e destaque/reflexo sutil no produto. Um fundo liso deixa o resultado sem vida ("parece trabalho de escola"); o fundo desfocado dá profundidade sem competir com o texto.
- **Fidelidade de cor por componente, nunca genérica**: nunca escrever só "100% faithful to the reference" — declarar a cor de cada componente confirmado explicitamente (ex.: "the body, rod and T-handle top are white; the trigger, nozzle tip and lock ring are green"), usando os dados da Seção 1. "Fidelidade" genérica já causou o modelo inventar cor errada em componente específico em testes reais.

PARTE 6 — MONTAGEM FINAL DE CADA PROMPT
Escreva os 7 prompts, cada um em inglês, seguindo os 6 blocos da Parte 4 na ordem, com a camada gráfica da Parte 5 incorporada dentro dos blocos 2-4 (nunca como bloco separado) nas Fotos 2-7. Releia cada prompt final contra a <regra_critica_de_conteudo> antes de finalizar — nenhuma frase pode introduzir dado não confirmado nem comparação com concorrente.

</processo>

<formato_de_saida_final>
ÉTAPA 8 — LEITURA DA BASE FINAL
[resumo do que foi lido: seções da Étapa 6 relevantes + entradas de Grafo 3 ativadas]

ÉTAPA 8 — FOTO 1 (CAPA)
[prompt completo, em inglês, com justificativa curta do cenário escolhido]

ÉTAPA 8 — PERGUNTAS ESCOLHIDAS PARA FOTOS 2-7
[lista de até 6 perguntas, cada uma com justificativa de onde veio na base densa]

ÉTAPA 8 — FOTOS 2 A 7
[prompt completo de cada foto, em inglês, na mesma ordem das perguntas acima]
</formato_de_saida_final>
</prompt>
```

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Etapa 5 - Navegacao pelos Grafos]]
- [[Trava de Formato da Foto de Capa]]
- [[Responsabilidade Unica por Foto (Fotos 2-7)]]
- [[Proibicao de Comparacao com Concorrentes]]
- [[Camada Grafica Informativa (Fotos 2-7)]]
- [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]]
- [[Desejo de Compra na Camada Grafica (Fotos 2-7)]]
