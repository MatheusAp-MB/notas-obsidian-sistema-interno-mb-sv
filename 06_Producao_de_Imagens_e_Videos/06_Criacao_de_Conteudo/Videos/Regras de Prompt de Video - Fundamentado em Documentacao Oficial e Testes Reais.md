---
tipo: decisao
dominio: 
status: ativa
criado: 24/08/2026
atualizado_em: 24/08/2026 16:58
relacionado: [_Pesquisa - Documentacao Oficial Veo 3.1, Gemini Omni e Google Flow, Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial, Protocolo de Feedback e Correcao, Tags de Proveniencia de Dado, Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]
---

# Regras de Prompt de Vídeo — Fundamentado em Documentação Oficial e Testes Reais

## O quê

Guia de como pensar um prompt de vídeo (showroom/turntable 360° a partir de imagem de referência, ferramenta Google Flow — modelos Omni Flash e Veo 3.1), extraído de documentação oficial do Google e já corrigido por 2 testes reais em produtos diferentes. **Ainda não é uma Étapa numerada do pipeline** — vídeo continua fora da Étapa 8 (que hoje só cobre fotos, ver [[Etapa 8 - Criacao (Fotos)]]). Esta nota é o equivalente, pra vídeo, de [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]], no mesmo estágio inicial em que aquela nota estava antes de ser testada em múltiplos produtos.

## Fontes analisadas

Extração completa em [[_Pesquisa - Documentacao Oficial Veo 3.1, Gemini Omni e Google Flow]] (25 páginas oficiais do Google). As 2 fontes que mais pesam nas regras abaixo: o prompt guide oficial do Gemini Omni (deepmind.google/models/gemini-omni/prompt-guide/) e o prompt guide oficial do Veo (deepmind.google/models/veo/prompt-guide/). O resto desta nota também incorpora achados de **2 testes reais** feitos pelo usuário em 24/08/2026 (produto 1: andador dobrável 3 em 1; produto 2: não identificado nesta conversa) — marcados como tal, tag [USUÁRIO] no sentido de [[Tags de Proveniencia de Dado]].

## Regras universais

1. **O esqueleto de blocos é genérico e reaproveitável entre categorias — o CONTEÚDO de cada bloco não é.** Descoberto por erro real (24/08/2026, andador): trocar vocabulário concreto de fidelidade ("tube, hinge, clip") por vocabulário abstrato ("part, component, surface") pra tentar generalizar o prompt pra qualquer produto piorou drasticamente o resultado — o modelo passou a inventar peças que não existem. O esqueleto (ordem dos blocos) é o que deve ser genérico; a cláusula de fidelidade de cada geração precisa descrever concretamente o que está visível NA REFERÊNCIA daquele produto específico (formato, material, cor, acessórios reais) — nunca com termo abstrato solto.
2. **Vocabulário de continuidade documentado precisa ser usado explicitamente**: "one continuous shot" / "oner" (plano único, sem cortes), "static" / "locked-off" / "fixed" (câmera parada), sem inventar sinônimo — são os termos que o prompt guide oficial do Omni usa.
3. **Padrão de duração**: tentar 10s primeiro; se o resultado sair com corte seco/estagnação perceptível, reduzir pra 6s no mesmo produto. Decidido pelo usuário em 24/08/2026 depois de 2 testes reais (10s falhou com corte técnico identificável por análise de frame a frame num produto, 6s saiu perfeito no mesmo produto; outro produto saiu bom em 10s de primeira). Ver "Erros corrigidos" abaixo pro diagnóstico técnico do corte.
4. **Hipótese de "familiaridade do modelo com a categoria do produto" (heurística do usuário, ainda sem critério objetivo)**: quanto mais o produto for um exemplar típico/comum da categoria dele (ex.: andador dobrável padrão), mais o "world knowledge" do modelo preenche corretamente os ângulos não vistos na referência — tolerando prompt mais enxuto e duração maior. Quanto mais específico/incomum o produto, menos confiável é esse preenchimento — exige prompt com ancoragem mais concreta e, possivelmente, duração menor. Bate com a frase oficial do guia do Omni citada na pesquisa ("...watch the model's reasoning and world knowledge bring the details to life"). **Sem critério objetivo ainda de "quão típico" um produto é** — decisão por julgamento caso a caso, não fórmula.
5. **Quantidade e ângulo de fotos de referência não é regra fixa.** Usar 3 fotos (frente/verso/lateral) funcionou bem no teste do pulverizador. Alerta do próprio usuário: produtos com vistas visualmente parecidas entre si (ex.: um andador, onde frente e verso podem se confundir) correm risco de o modelo misturar/perder qual referência é qual ao usar múltiplas fotos semelhantes — decidir a quantidade/ângulos caso a caso, olhando se as vistas do produto são visualmente distintas ou não. **Ainda não testado esse risco especificamente.**
6. **Áudio gerado nativamente pelo modelo não é prioridade de correção via prompt.** O Omni Flash gera áudio por padrão mesmo com instrução negativa explícita ("no audio, no music, no sound effects") — confirmado tecnicamente num teste real (faixa de áudio real presente, -16dB médio, mesmo com a restrição no prompt). Decisão do usuário: não vale gastar "orçamento de atenção" do prompt lutando contra isso — o áudio é removido na edição posterior.
7. **Observação de 1 teste, não regra fechada**: com o mesmo prompt, Omni Flash manteve fidelidade geométrica (nenhuma peça inventada identificada), enquanto Veo 3.1 inventou peças que não existem no produto. Registrado como sinal a acompanhar, não como "Omni é sempre melhor que Veo" — só 1 comparação lado a lado até agora.

## Esqueleto de blocos (genérico — funciona pra qualquer categoria de produto)

| Bloco | Função | Fixo (todos os produtos) | Varia (por produto) |
| --- | --- | --- | --- |
| 1. Trava de fidelidade | Travar shape/cor/material/detalhes da referência, proibindo invenção mesmo em ângulos não vistos | A proibição em si, a instrução de "inferir só continuação rotacional, nunca geometria nova" | A descrição concreta do que está de fato visível na referência (nunca abstrata — ver Regra Universal #1) |
| 2. Plano e continuidade | "Oner", câmera estática, sem cortes/congelamentos/pausas/reversão | Sim, sempre | — |
| 3. Estilo | Fotografia comercial de produto, showroom | Sim, sempre (pro nosso caso de uso) | — |
| 4. Iluminação | Luz de estúdio suave e constante, sem variação | Sim, sempre | — |
| 5. Cenário | Fundo branco/estúdio + turntable centralizado | Sim, sempre (pro nosso caso de uso) | — |
| 6. Ação | Só a turntable gira, velocidade angular constante, 1 volta de 360° distribuída pela duração total | A lógica (só a base gira, produto não inclina) | A duração real (6 ou 10s, conforme Regra Universal #3) |
| 7. Checagem final | 1º frame idêntico ao último em forma/cor/proporção; transição contínua sem costura visível | Sim, sempre | — |

## Erros corrigidos durante os testes reais (24/08/2026)

1. **Vocabulário de fidelidade abstrato piorou a fidelidade geométrica.** Prompt inicial usava termos concretos da construção do andador ("tube, hinge, clip") — funcionou. Tentativa de generalizar trocando por termos abstratos ("part, component, surface, edge") pra servir qualquer categoria de produto causou invenção de várias peças novas. Diagnóstico (por raciocínio, não confirmado em documentação oficial): a abstração removeu a ancoragem concreta que suprimia o "world knowledge" do modelo (ver Regra Universal #1 e #4) — sem uma descrição concreta do que a referência realmente mostra, o modelo tem mais liberdade de recorrer ao genérico da categoria. Corrigido na Regra Universal #1 acima.
2. **Corte seco identificado tecnicamente a 10s, resolvido reduzindo para 6s.** Extração de frames do vídeo gerado (fps=2 e depois refinado frame a frame) revelou um padrão recorrente: rotação suave por ~2-2,5s, um breve congelamento, e um salto abrupto de ângulo num único frame — repetindo ao longo do clipe de 10s. Consistente com o modelo montar a geração internamente a partir de segmentos curtos colados, sem emenda perfeitamente suave (o Gemini Omni Flash lista "scene extension" como "coming soon" na própria documentação — ainda em preview público). Reduzir a duração para 6s no mesmo produto resolveu o corte por completo ("ficou perfeito"). **Não confirmado oficialmente que a causa é segmentação interna** — é a hipótese mais consistente com a evidência visual, não uma afirmação da documentação.
3. **Instrução "no audio" não suprimiu o áudio gerado.** Mesmo com restrição negativa explícita, o vídeo gerado (Omni Flash) tinha faixa de áudio real e audível (volume médio -16dB, pico -3,5dB). Não tratado como defeito a corrigir no prompt — decisão do usuário (Regra Universal #6): o áudio é descartado na edição, então não vale insistir nisso no prompt.

## Estado (24/08/2026, 16h58)

Nota nova, criada depois de pausar o teste de fotos do Pulverizador Brudden DAS G2 pra abrir esta frente de pesquisa. Baseada em pesquisa oficial ampla (25 fontes) mas só 2 testes reais (2 produtos, ambos no modelo Omni Flash, ambos no formato showroom/turntable 360°). **Ainda em estágio inicial** — faltando: (a) confirmar a nuance de fotos de referência semelhantes (Regra Universal #5) num produto onde isso realmente aconteça; (b) testar o esqueleto de blocos em outro tipo de vídeo além de showroom/turntable (ex.: produto em uso, câmera com movimento); (c) decidir se e quando isso se torna uma Étapa numerada do pipeline (hoje só a Étapa 8 de fotos existe); (d) confirmar ou descartar a hipótese de segmentação interna do Omni Flash com mais testes ou documentação oficial mais completa (ver lacunas em [[_Pesquisa - Documentacao Oficial Veo 3.1, Gemini Omni e Google Flow]]).

## Relacionado

- [[_Pesquisa - Documentacao Oficial Veo 3.1, Gemini Omni e Google Flow]]
- [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]]
- [[Protocolo de Feedback e Correcao]]
- [[Tags de Proveniencia de Dado]]
