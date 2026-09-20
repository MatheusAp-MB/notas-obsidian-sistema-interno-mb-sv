---
tipo: decisao
dominio: 
status: concluida
criado: 19/09/2026
atualizado_em: 20/09/2026 01:45
relacionado: [Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor, Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]
resumo: Todo \`<img>\` de foto de peça/produto do sistema (Catálogo, Produtos, Gaveta de Peças, Conferência, Nova Devolução, Devoluções Pendentes e o Relatório A4 impresso) trocou \`object-fit: cover\` por \`object-fit: contain\` — a imagem inteira aparece sempre, mesmo em foto que não é quadrada, em vez de ter as bordas cortadas pra preencher o quadro.
---

# Fotos de Peça e Produto Passam a Usar object-fit Contain em Vez de Cover — Nunca Cortar a Imagem

**Resumo**: todo \`<img>\` de foto de peça/produto do sistema (Catálogo, Produtos, Gaveta de Peças, Conferência, Nova Devolução, Devoluções Pendentes e o Relatório A4 impresso) trocou \`object-fit: cover\` por \`object-fit: contain\` — a imagem inteira aparece sempre, mesmo em foto que não é quadrada, em vez de ter as bordas cortadas pra preencher o quadro.

> [!success] CONCLUÍDA — aplicada em 19/09/2026 23:11 (commit \`86abba0\`)
> Troca sistemática em 10 arquivos CSS + o template do Relatório A4, via script de aplicação (\`aplicar_contain_fotos.py\`, removido depois por já ter cumprido seu papel — ver [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]]).

## Contexto

Toda foto de peça ou produto no sistema é exibida dentro de um quadro de tamanho fixo (miniatura do Catálogo, card da Gaveta de Peças, linha do Relatório A4 etc.). Até 19/09/2026, esse quadro usava \`object-fit: cover\` — a regra CSS que preenche 100% do quadro cortando o excesso da imagem quando a proporção dela não bate exatamente com a proporção do quadro.

## O problema

Fotos tiradas na conferência física raramente têm a proporção exata do quadro onde aparecem. Com \`cover\`, isso corta partes da imagem sem avisar — uma peça que tem um risco ou uma quebra bem na borda podia ter exatamente a evidência do problema cortada fora da miniatura, sem nenhum indício visual de que a imagem foi recortada.

## O que levou à decisão

Não houve alternativas concorrentes discutidas — a troca é direta: entre cortar a imagem (\`cover\`) ou encolher a imagem inteira pra caber dentro do quadro, sem cortar nada (\`contain\`), a 2ª sempre preserva 100% do conteúdo visual, o que importa mais aqui do que o quadro ficar perfeitamente preenchido — principalmente pras fotos que viram evidência de mediação com o Mercado Livre (ver [[Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor]]), onde qualquer corte acidental de detalhe é um risco real, não só estético.

## Decisão

Toda regra CSS \`object-fit: cover\` aplicada a foto de peça ou produto vira \`object-fit: contain\`, em qualquer tela do sistema — sem exceção por tela ou por tamanho de quadro.

## Exemplo

No Relatório A4 impresso (\`relatorio_devolucao_impressao.html\`), as 3 miniaturas de foto (foto do produto no cabeçalho, foto da peça na tabela e foto da peça no card) tiveram a mesma troca:

\`\`\`css
/* antes */
.peca-card-foto, .peca-card-foto-vazia { width: 56px; height: 56px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }

/* depois */
.peca-card-foto, .peca-card-foto-vazia { width: 56px; height: 56px; border-radius: 6px; object-fit: contain; flex-shrink: 0; }
\`\`\`

O mesmo padrão se repete nos outros 9 arquivos CSS tocados pelo commit \`86abba0\`: \`layout_catalogo.css\` (4 ocorrências — miniatura de peça, preview de upload, resultado de busca, card da gaveta), \`layout_conferir_devolucao.css\`, \`layout_devolucoes_pendentes.css\`, \`layout_gaveta_pecas.css\`, \`layout_nova_devolucao.css\`, \`layout_produto_form.css\`, \`layout_produto_vincular_pecas.css\`, \`layout_produto_visualizar.css\` e \`layout_produtos.css\`.

## Relacionado

- [[Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor]]
- [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]]
