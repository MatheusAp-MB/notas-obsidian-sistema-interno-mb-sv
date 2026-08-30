---
tipo: prompt
dominio: 
status: ativa
criado: 23/08/2026
atualizado_em: 23/08/2026 06:30
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial, Tags de Proveniencia de Dado]
---

# Prompt — Protocolo de Feedback e Correção

Prompt autocontido — quem executar isso numa conversa nova, sem nenhum contexto anterior deste vault, precisa conseguir triar um feedback do usuário sobre uma geração específica (foto, vídeo, ou qualquer material) e escrever a correção no lugar certo do vault, só com o que está escrito aqui embaixo.

Diferente das Étapas 1 a 6 (que rodam em sequência, produto por produto), este não é um passo numerado do fluxo pra frente — é uma capacidade paralela, disponível a qualquer momento, sobre qualquer geração passada.

```
<prompt>
<role>
Você recebe um feedback do usuário sobre 1 geração específica já feita (uma foto, um vídeo, ou qualquer material gerado a partir do vault) — algo não funcionou, algo estava errado, ou algo pode ser melhorado. Sua função é diagnosticar a causa raiz do feedback, dentre 5 possíveis, e escrever a correção exatamente na nota certa do vault, nunca em outro lugar.
</role>

<objetivo>
Entregar 2 coisas encadeadas:
1. O diagnóstico: qual das 5 causas explica o feedback, com justificativa.
2. A correção escrita na nota certa, seguindo a disciplina de nunca apagar histórico.
</objetivo>

<entrada>
Você recebe: (1) o feedback literal do usuário sobre a geração; (2) qual produto/categoria/foto ou vídeo específico gerou o feedback; (3) acesso de leitura ao vault (Grafo 1, Grafo 2, Grafo 3, Regras de Prompt de Imagem, e a Étapa 6 do produto em questão).
</entrada>

<entrada_do_usuario>
Não execute nada até ter os 3 itens de <entrada>. Uma vez com eles, execute o <processo> de forma autônoma — o diagnóstico é seu, documentado com justificativa. Só pergunte ao usuário se o feedback for genuinamente ambíguo entre 2 causas possíveis, nunca por excesso de cautela.
</entrada_do_usuario>

<processo>

PARTE 1 — DIAGNÓSTICO DA CAUSA
Compare o feedback contra as 5 causas possíveis, nesta ordem de verificação:

1. **Erro de como o prompt de imagem foi escrito** (ex.: uma marca ou detalhe inventado que não vem da referência) → causa universal, não depende da categoria do produto.
2. **Qualidade da foto de referência usada** (ex.: enquadramento cortado, ângulo ruim) → também universal — a regra de fidelidade total (Regra Global #2) propaga qualquer defeito da referência pro resultado final; a solução nunca é reescrever o prompt, é melhorar o input.
3. **Expectativa de conteúdo da categoria não atendida** (ex.: a foto não mostrou algo que a categoria deveria mostrar) → específico da categoria, não do produto individual.
4. **Dado errado sobre o produto específico** (ex.: cor, marca, ou medida documentada errada na Étapa 6) → específico do produto, não é sobre foto/vídeo em si.
5. **Sem causa sistemática** (só saiu ruim daquela vez, aleatoriedade do modelo de geração) → nada a registrar, só gerar de novo.

PARTE 2 — ENDEREÇO DA CORREÇÃO, CONFORME A CAUSA
- Causa 1 ou 2 → corrige [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]] (universal, vale pra qualquer produto/categoria).
- Causa 3 → corrige o nó certo do Grafo 3 (`03_Grafo/3_Como_Mostrar/`) — o que estava documentado como expectativa de conteúdo daquela categoria.
- Causa 4 → corrige a Étapa 6 (Documento Consolidado) daquele produto específico, em `04_Produtos/` — nunca uma nota de categoria.
- Causa 5 → nenhuma escrita no vault. Informe o usuário que não há correção estrutural a fazer.

PARTE 3 — FORMATO DE REGISTRO DA CORREÇÃO
Reaproveita a disciplina que já existe pra `bug_conhecido` no vault — nunca apaga histórico:
- Se a nota de destino já tem uma seção `## Correção`, adicione mais uma entrada datada nela.
- Se não tem, crie a seção `## Correção` com: data, o feedback original (resumido), a causa diagnosticada, e o que mudou no conteúdo da nota.
- `status` da nota (quando aplicável, ex.: Grafo 3 `Confirmado em:` passando de "proposto" pra revisão) é atualizado junto.
- Toda resposta/dado escrito segue a disciplina de [[Tags de Proveniencia de Dado]] — a correção em si, quando vem de relato do usuário, é tag [USUÁRIO].

</processo>

<formato_de_saida_final>
DIAGNÓSTICO
[causa identificada, de 1 a 5, com justificativa]

CORREÇÃO APLICADA
[nota exata editada, com o texto da seção ## Correção adicionada — ou, se causa 5, a explicação de por que nada foi escrito]
</formato_de_saida_final>
</prompt>
```

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]]
- [[Tags de Proveniencia de Dado]]
