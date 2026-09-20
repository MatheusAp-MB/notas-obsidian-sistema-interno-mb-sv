---
tipo: decisao
dominio: 
status: concluida
criado: 20/09/2026
atualizado_em: 20/09/2026 01:45
relacionado: [Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor, Fotos de Peça e Produto Passam a Usar object-fit Contain em Vez de Cover — Nunca Cortar a Imagem, Checklist de Implementação — Gaveta de Peças e Modais de Ação, Checkpoint - Catálogo de Peças e Tela de Produtos]
resumo: 1 modal de fotos único, global (vive em \`estrutura_base_global.html\`, fora de qualquer tela específica) e reutilizável por qualquer elemento marcado com \`card-fotos-item\`/\`data-fotos-id\` — sem depender de dado nenhum vindo do backend, ao contrário do Hub de Fotos do Sistema Interno V2 que o inspirou. Aprovado em mockup cobrindo os 3 padrões reais de uso (galeria por peça, galeria única de mediação, foto avulsa), implementado em 10 arquivos (commit \`0b210e8\`), com 1 bug real encontrado e corrigido (\`ed4fe62\`) e o código morto resultante limpo depois (\`35b8079\`, \`4769fa5\`), incluindo 806 linhas de CSS do antigo Catálogo que zero template carregava.
---

# Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo

**Resumo**: 1 modal de fotos único, global (vive em \`estrutura_base_global.html\`, fora de qualquer tela específica) e reutilizável por qualquer elemento marcado com \`card-fotos-item\`/\`data-fotos-id\` — sem depender de dado nenhum vindo do backend, ao contrário do Hub de Fotos do Sistema Interno V2 que o inspirou. Aprovado em mockup cobrindo os 3 padrões reais de uso (galeria por peça, galeria única de mediação, foto avulsa), implementado em 10 arquivos (commit \`0b210e8\`), com 1 bug real encontrado e corrigido (\`ed4fe62\`) e o código morto resultante limpo depois (\`35b8079\`, \`4769fa5\`), incluindo 806 linhas de CSS do antigo Catálogo que zero template carregava.

> [!success] CONCLUÍDA — implementada, com 1 bug corrigido e código morto limpo (20/09/2026, 00:31–00:45)
> Modal único rodando em produção nas telas de Catálogo, Gaveta de Peças, Conferência, Nova Devolução, Devoluções Pendentes, Produto (vincular/visualizar) e Visualizar Devolução. O bug do "Resumo geral da conferência" foi corrigido no mesmo bloco de trabalho, e os 3 scripts de aplicação pontual + o CSS morto do Catálogo antigo (806 linhas) já foram removidos.

## Contexto

Várias telas do sistema mostram foto de peça ou de produto (Catálogo, Gaveta de Peças, Conferência, Relatório A4, Visualizar Devolução), cada uma cuidando da ampliação da foto do seu próprio jeito — algumas sem nenhuma ampliação (só a miniatura pequena, sem forma de ver a foto maior), e o Catálogo carregando desde antes um começo de lightbox nunca terminado (o "Objetivo 8", que deixava a classe \`catalogo-peca-foto--clicavel\` e os atributos \`data-imagem-url\`/\`data-imagem-titulo\` no HTML sem nenhum CSS/JS real ligado a eles).

## O problema

Construir ampliação de foto tela por tela, do zero, duplicaria HTML e JavaScript de modal em cada lugar novo que precisasse — e ainda deixaria o Catálogo com 2 sistemas de foto coexistindo (o modal novo e a sobra do Objetivo 8 antigo). O sistema tem, na prática, 3 padrões de uso bem diferentes pra esse modal: uma galeria de fotos agrupada por peça (Catálogo, Gaveta de Peças), uma galeria única e "achatada" juntando fotos de peças diferentes num só grupo (Evidência para a mediação, dentro de Visualizar Devolução) e o caso de 1 peça com 1 foto só (Resumo geral da conferência).

## O que levou à decisão

Testado em mockup interativo com os 3 padrões lado a lado — Exemplo A (Catálogo/Gaveta de Peças, galeria agrupada por peça), Exemplo B (Evidência para a mediação, galeria única/flat) e Exemplo C (Resumo geral, peça com 1 foto só) — pra confirmar que 1 modal e 1 script só davam conta dos 3 casos reais antes de implementar em qualquer tela de verdade.

A arquitetura final é baseada no Hub de Fotos já existente no Sistema Interno V2, mas com 2 diferenças de propósito, deixadas registradas no próprio comentário de cabeçalho de \`script_modal_fotos.js\`: não depende de \`json_script\`/dado nenhum montado no backend — tudo vem de atributos \`data-*\` que o próprio HTML já tem —, e título/subtítulo/legenda mudam por FOTO (não por galeria inteira), útil justamente pro Exemplo B, onde uma mesma galeria junta fotos de peças diferentes, cada uma com sua própria legenda. Essa simplificação foi deliberada: zero mudança de view/backend foi necessária pra ligar o modal em qualquer tela nova, só marcar o HTML existente com as classes/atributos certos.

## Decisão

Um único par de arquivos (\`layout_modal_fotos.css\` + \`script_modal_fotos.js\`) vive em \`core/static/base_compartilhada/\` — pasta compartilhada entre todas as telas — e o HTML do modal (overlay, cabeçalho com título/subtítulo/contador, área de navegação anterior/próxima, legenda) é inserido 1 vez só dentro de \`estrutura_base_global.html\`, o template base que toda tela do sistema já estende. Qualquer elemento HTML marcado com a classe \`card-fotos-item\` e os atributos \`data-fotos-id\` (obrigatório, agrupa as fotos que navegam juntas) e \`data-titulo\` (obrigatório) fica clicável automaticamente, sem precisar de nenhum JavaScript específico da tela — o script usa delegação de evento no \`document\`, então funciona até em elementos adicionados depois via JavaScript (ex: linha nova na Gaveta de Peças).

## Execução — rollout (commit `0b210e8`, 20/09/2026 00:31)

10 arquivos reais tocados: o par novo (`layout_modal_fotos.css`/`script_modal_fotos.js`), `estrutura_base_global.html` (registro do CSS/HTML/JS globais) e 7 templates/scripts existentes marcados com as classes/atributos do modal (`_card_peca.html`, `conferir_devolucao.html`, `devolucoes_pendentes.html`, `nova_devolucao.html`, `produto_vincular_pecas.html`, `produto_visualizar.html`, `visualizar_devolucao.html`, mais os scripts `script_conferir_devolucao.js`/`script_gaveta_pecas.js` que geram HTML de peça dinamicamente). O mesmo commit também gravou por engano 2 cópias soltas de `layout_modal_fotos.css`/`script_modal_fotos.js` na raiz do repositório — removidas depois, ver "Limpeza" abaixo.

## Bug encontrado e corrigido (commit `ed4fe62`, 20/09/2026 00:38)

No Resumo geral da conferência, o elemento marcado com `card-fotos-item` é a própria tag `<img>` — diferente de todas as outras telas, onde `card-fotos-item` fica numa `<div>`/`<a>` que só contém o `<img>` lá dentro. A função `dadosDoElemento()` sempre procurava a imagem DENTRO do elemento clicado (`elemento.querySelector('img')`), então nesse caso específico não achava nenhuma, caía no fallback `data-url` (nunca preenchido ali) e o modal abria com a foto quebrada. Corrigido checando primeiro se o próprio elemento clicado já é a `<img>`:

```js
// antes
var img = elemento.querySelector('img');

// depois
var img = elemento.tagName === 'IMG' ? elemento : elemento.querySelector('img');
```

## Limpeza de código morto (commits `35b8079` e `4769fa5`, 20/09/2026 00:43–00:45)

Depois do modal validado, 2 rodadas de limpeza:

- **`35b8079`** — removidos os 3 scripts de aplicação pontual que já tinham cumprido seu papel (`aplicar_contain_fotos.py`, `aplicar_modal_fotos.py`, `corrigir_modal_fotos_bug_img.py`), as 2 cópias duplicadas na raiz do repositório (`layout_modal_fotos.css`, `script_modal_fotos.js`) e o arquivo `layout_catalogo.css` inteiro (806 linhas) — confirmado por busca no repositório que nenhum template carregava mais esse CSS.
- **`4769fa5`** — sobra final do "Objetivo 8" (o lightbox antigo nunca terminado): removida a classe `catalogo-peca-foto--clicavel` e os atributos `data-imagem-url`/`data-imagem-titulo` de `_card_peca.html` e `script_gaveta_pecas.js`, já que quem faz esse trabalho agora é o `card-fotos-item`/`data-fotos-id` do modal novo.

## Exemplo

Uma peça com problema, dentro do bloco "Evidência para a mediação" (Exemplo B), fica marcada assim no HTML — clicar em qualquer uma das fotos do grupo abre o modal já navegável entre todas as fotos daquele mesmo `data-fotos-id`, mesmo vindo de peças diferentes:

```html
<img src="/media/pecas/foto1.jpg" class="card-fotos-item"
     data-fotos-id="evidencia-devolucao-42" data-titulo="Bico Cônico Duplo"
     data-legenda="Riscada">
```

## Relacionado

- [[Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor]]
- [[Fotos de Peça e Produto Passam a Usar object-fit Contain em Vez de Cover — Nunca Cortar a Imagem]]
- [[Checklist de Implementação — Gaveta de Peças e Modais de Ação]]
- [[Checkpoint - Catálogo de Peças e Tela de Produtos]]
