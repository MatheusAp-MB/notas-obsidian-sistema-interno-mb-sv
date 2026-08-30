---
tipo: conceito
dominio: 
status: ativa
criado: 24/08/2026
atualizado_em: 24/08/2026 16:58
relacionado: [Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre, Regras de Prompt de Video - Fundamentado em Documentacao Oficial e Testes Reais, Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]
---

# Pesquisa — Documentação Oficial Veo 3.1, Gemini Omni e Google Flow

## O quê

Extração de 25 páginas oficiais do Google (support.google.com/flow, deepmind.google, blog.google, cloud.google.com, gemini.google) sobre o ecossistema de geração de vídeo do Google, com foco em melhores práticas de prompt pra geração de vídeo a partir de imagem de referência. Pesquisa pedida pelo usuário em 24/08/2026, depois de pausar o teste de fotos pra focar noutro assunto. Cada bloco abaixo está marcado com a fonte exata — nada aqui foi inventado; a única seção de síntese cruzada (não citação literal) está isolada e sinalizada no final.

## Resposta à pergunta original: o que é "Omni"

**Gemini Omni** (e a variante rápida/barata em preview público, **Gemini Omni Flash**) é o modelo do Google pra edição/geração conversacional de vídeo a partir de qualquer mídia de entrada (imagem, vídeo, texto, áudio) — tratado como o sucessor do Veo pra esse tipo de tarefa, e não uma marca genérica. [FONTE: deepmind.google/models/gemini-omni/, deepmind.google/models/gemini-omni/prompt-guide/]

## Mapa do ecossistema

| Componente | O que é | Fonte |
| --- | --- | --- |
| **Veo 3.1** | Modelo de geração de vídeo "cru" (texto→vídeo e imagem→vídeo), áudio nativo, controles de câmera, consistência de personagem via referência, first/last frame, outpainting. Foco em "physics, realism and prompt adherence". | deepmind.google/models/veo/ |
| **Gemini Omni / Omni Flash** | Edição/geração conversacional de vídeo a partir de qualquer input. Menos prescritivo que Veo — deixa o "world knowledge" do modelo preencher detalhes. Omni Flash é a versão em preview público (US$0,10/segundo). | deepmind.google/models/gemini-omni/, cloud.google.com/blog nano-banana-2-lite-and-gemini-omni-flash-available |
| **Nano Banana / Pro / 2 Lite** | Família de modelos de **imagem**, usada dentro do Flow para criar/editar imagens antes de virarem vídeo. | support.google.com/flow (Create & Edit Images) |
| **Google Flow** | App/estúdio que reúne todos os modelos acima (Plan → Create → Refine). É onde "Ingredients", "Frames to Video" e "Scenebuilder" vivem. | labs.google/fx/tools/flow, blog.google google-flow-veo-ai-filmmaking-tool |
| **Whisk** | Ferramenta anterior de imagem, **incorporada ao Flow** em fev/2026 — não é mais separada. | blog.google flow-whisk-ai-credits-update, blog.google flow-updates-february-2026 |

## Os 3 mecanismos de "imagem de referência → vídeo" no Flow

**a) Ingredients / References to Video** — 1+ imagens (ou vídeos) como "ingredientes" pra manter aparência de personagem/objeto/estilo consistente ao longo da cena gerada. [FONTE: support.google.com/flow/answer/16353334]

**b) Frames to Video** — *First* (a imagem enviada é o quadro inicial exato) ou *First + last* (2 imagens marcam início e fim, o modelo gera a transição — suportado por Veo 3.1 Lite/Fast/Quality). [FONTE: support.google.com/flow/answer/16935308]

**c) Personagem com referência visual persistente** — 1-2 imagens definem a aparência de um personagem 1 vez; depois disso "face, roupa e voz permanecem estritamente consistentes em múltiplas gerações sem precisar re-enviar as mesmas imagens". [FONTE: support.google.com/flow/answer/16729550]

## Regras práticas sobre a própria imagem de referência

- **"Provide subject or product references on a plain or segmented background"** — fundo limpo/segmentado, não um ambiente cheio de elementos.
- **"Your text prompt should complement, not contradict, your visual inputs"** — o texto não pode contradizer o que já está na imagem.
- **"A consistent look and feel across all your ingredient images helps the model blend them more effectively"** — múltiplas referências na mesma geração precisam de iluminação/estilo coerentes entre si.

[FONTE: support.google.com/flow/answer/16353334]

## Estrutura de prompt — Veo 3.1 (prompt guide oficial)

7 elementos: (1) enquadramento e movimento de câmera, (2) estilo visual (definir primeiro), (3) iluminação, (4) descrição de personagem (específica, não genérica), (5) localização (linguagem sensorial), (6) ação (play-by-play detalhado em cenas complexas), (7) diálogo/áudio (explícito).

Princípio citado literalmente: **"The more detail you add, the more control you'll have over the final output."**

**Achado importante**: o prompt guide do Veo, na extração feita, não contém orientação específica sobre uso de imagem de referência — isso vem de Omni e das páginas de suporte do Flow, não do prompt guide do próprio Veo. [FONTE: deepmind.google/models/veo/prompt-guide/]

## Estrutura de prompt — Gemini Omni (prompt guide oficial)

5 elementos (mais curtos que os do Veo): (1) enquadramento e movimento de câmera, (2) estilo, (3) iluminação, (4) localização, (5) ação.

**Diferença central de filosofia, citada literalmente**: *"you don't have to be as prescriptive with your prompt. Instead, tell Omni what you want to create — and watch the model's reasoning and world knowledge bring the details to life."* — ou seja, o Omni é desenhado para usar conhecimento prévio ("world knowledge") pra preencher o que não está explícito. **Isto é uma faca de 2 gumes**: funciona bem quando o produto é um exemplar típico de categoria conhecida; pode levar a invenção de peças quando o prompt não ancora concretamente o que está na referência (ver "Erros" na nota de Regras de Prompt de Vídeo).

Uso de referência no Omni: *"Reference any kind of media... including images, videos, text, and audio"*; consistência: *"Add a reference... and Gemini Omni will use it across your scene"*; transferência de estilo preservando movimento; storyboard (enviar o arco narrativo visual).

Vocabulário de câmera documentado: continuidade — "one continuous shot" / "oner"; ângulo fixo — "static", "locked off", "fixed"; movimento — "push in", "punch in", "dolly zoom"; estilo de dispositivo — "natural smartphone zoom", "film camera", "webcam style".

[FONTE: deepmind.google/models/gemini-omni/prompt-guide/]

## Dicas práticas — blog oficial "Flow video tips"

Sujeito e ação claros; composição/câmera com termos como "wide shot"/"tracking shot"; localização e luz descritas de forma sensorial (preferir *"a dusty attic filled with forgotten treasures, a single beam of afternoon light cutting through a grimy window"* a simplesmente "a room"); estilos alternativos (stop motion, claymation); áudio/diálogo explícito com Veo 3; as 2 features de referência nomeadas assim: "Ingredients to Video" e "Frames to Video"; usar o Gemini como parceiro de brainstorm pra refinar o próprio prompt. [FONTE: blog.google/innovation-and-ai/products/flow-video-tips/]

## Refino pós-geração

Nano Banana Pro edita a imagem-fonte sem regenerar a cena inteira (inclusive *"blend elements from multiple reference images"*); anotação visual (desenhar sobre a imagem); reshoot de câmera (funciona melhor em clipes sem movimento de câmera prévio); Extend (alonga um vídeo já gerado, sem inserir/remover no meio). [FONTE: blog.google flow-refine-videos, support.google.com/flow/answer/16935718]

## Padrão transferível do Nano Banana (imagem)

Fórmula documentada: `[Imagens de referência] + [Instrução de relação entre elas] + [Cenário novo]`. Regra de ouro citada: *"Be explicit about what to keep exactly the same."* Limite técnico: até 14 imagens de referência num único prompt (Nano Banana 2/Pro). [FONTE: cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana]

## Síntese cruzada (minha, não é citação literal — sinalizado)

Esqueleto de prompt pra vídeo a partir de imagem de referência, cruzando as seções acima: (1) identificar a(s) referência(s) e o que cada uma representa; (2) instrução de relação (manter consistente / 1º frame / último frame / aplicar estilo); (3) cenário novo com linguagem sensorial; (4) câmera com vocabulário técnico; (5) áudio explícito se aplicável; (6) restrição explícita do que não pode mudar. Esta síntese foi a base da nota operacional [[Regras de Prompt de Video - Fundamentado em Documentacao Oficial e Testes Reais]], já revisada depois dos testes reais.

## Lacunas não fechadas

As páginas "Video generation prompt guide" e "Veo best practices", citadas dentro da documentação de API do Omni Flash (docs.cloud.google.com), não puderam ser abertas — não estavam entre os links fornecidos nem apareceram como link direto em nenhuma página aberta, e o WebSearch ficou indisponível (proxy rejeitado, HTTP 403) durante toda a pesquisa. Nenhuma fonte tratou de formatos verticais/anúncio de e-commerce especificamente — tudo é genérico pra "filmmaking".

## Fontes

- https://support.google.com/flow/answer/16353333 · /17093911 · /16353334 · /16935718 · /16729550 · /17104535 · /16935308 · /16352836 · /16526234
- https://labs.google/fx/tools/flow
- https://deepmind.google/models/veo/ · /veo/prompt-guide/ · /gemini-omni/ · /gemini-omni/prompt-guide/
- https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana
- https://gemini.google/overview/video-generation/
- https://blog.google/innovation-and-ai/products/google-flow-veo-ai-filmmaking-tool/ · /flow-video-tips/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/ · /flow-sessions-artists-lessons/ · /flow-refine-videos/ · /flow-updates/ · /flow-whisk-ai-credits-update/
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/omni-flash-preview (parcial — não carregou conteúdo técnico completo)

## Relacionado

- [[Regras de Prompt de Video - Fundamentado em Documentacao Oficial e Testes Reais]]
- [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]]
- [[Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]]
