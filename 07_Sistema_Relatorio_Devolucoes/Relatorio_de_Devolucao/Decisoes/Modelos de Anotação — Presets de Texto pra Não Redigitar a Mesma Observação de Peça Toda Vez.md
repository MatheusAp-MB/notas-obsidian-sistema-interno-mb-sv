---
tipo: decisao
dominio: python
status: concluida
criado: 20/09/2026
atualizado_em: 20/09/2026 01:45
relacionado: [Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Checklist de Implementação — Gaveta de Peças e Modais de Ação]
resumo: Nova tela de CRUD (\`Modelos de Anotação\`) com uma lista global de textos-preset, ligada por autocomplete ao campo de anotação de cada peça na Conferência — resolve a Ana ter que redigitar a mesma observação (ex.: "riscada") toda vez, sem nunca travar a digitação de texto livre pra casos fora da lista. Escopo fechado só pra anotação de peça (nunca a Observação geral do produto). Implementado (commit \`bebefa6\`) e confirmado funcionando em produção por Matheus.
---

# Modelos de Anotação — Presets de Texto pra Não Redigitar a Mesma Observação de Peça Toda Vez

**Resumo**: nova tela de CRUD (\`Modelos de Anotação\`) com uma lista global de textos-preset, ligada por autocomplete ao campo de anotação de cada peça na Conferência — resolve a Ana ter que redigitar a mesma observação (ex.: "riscada") toda vez, sem nunca travar a digitação de texto livre pra casos fora da lista. Escopo fechado só pra anotação de peça (nunca a Observação geral do produto). Implementado (commit \`bebefa6\`) e confirmado funcionando em produção por Matheus.

> [!success] CONCLUÍDA — implementada e confirmada em produção (20/09/2026)
> Mockup aprovado por Matheus ("perfeito, vamos implementar"), implementado no mesmo bloco de trabalho (commit \`bebefa6\`, 20/09/2026 01:24) e confirmado funcionando em produção ("tudo funcionou corretamente").

## Contexto

Durante a conferência física de uma devolução, a Ana descreve o problema de cada peça num campo de texto livre (ex.: "riscada", "veio quebrado", "faltou acessório"). Boa parte dessas observações se repete de devolução pra devolução — as mesmas poucas frases aparecem de novo e de novo, sempre redigitadas do zero.

## O problema

Dar um jeito de reaproveitar texto comum de anotação sem tirar a liberdade de escrever qualquer coisa fora do padrão quando o problema real da peça não se encaixa em nenhum preset — travar o campo numa lista fixa esconderia problema real que não foi previsto.

## O que levou à decisão

Escopo fechado antes de desenhar a tela, em pontos explícitos:

- Os presets valem só pra anotação de peça, nunca pro campo de Observação geral do produto (assunto diferente, não misturado).
- Lista **global**, compartilhada entre todas as peças e produtos — não por marca, nem por produto específico.
- Texto livre continua sempre aceito, mesmo digitando algo que não bate com nenhum preset da lista.
- Lista começa **vazia** — sem preset nenhum pré-cadastrado, cresce só com o que for cadastrado depois.
- Tela nova acessada por um link a partir da tela **Peças** (Gaveta de Peças), não escondida dentro de outra tela.
- CRUD completo (criar, editar, excluir) — sem trava de "em uso", já que o preset é só um atalho de texto, não um vínculo (\`ForeignKey\`) com a peça.

Antes de implementar, o fluxo foi validado em mockup — incluindo o comportamento de selecionar uma sugestão **substituir** o conteúdo inteiro do campo (não inserir/concatenar) — aprovado por Matheus ("perfeito. vamos implementar").

## Decisão

- **Model novo** \`ModeloAnotacao\` — só um campo, \`texto\` (\`CharField\`, único), ordenado alfabeticamente.
- **Tela de CRUD** (\`modelos_anotacao.html\`) espelhando o mesmo padrão visual já usado por \`Marca\`/Grupo Fornecedor (ver [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]) — sem grid, entidade única.
- **Autocomplete no campo de anotação da Conferência** — a lista inteira de presets é embutida 1 vez por carregamento de página via \`{{ modelos_anotacao|json_script:"dados-modelos-anotacao" }}\`, e um único script (\`script_autocomplete_anotacao.js\`) cobre todos os campos de anotação da página ao mesmo tempo por delegação de evento (\`focusin\`/\`input\`/\`keydown\`/\`click\` no \`document\`) — sem precisar de nenhuma ligação JS específica por peça, o mesmo princípio de reuso já usado no modal de fotos (ver [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]]).
- **Acesso**: novo link no toolbar de \`gaveta_pecas.html\`, levando pra \`Modelos de Anotação\`.

## Implementação (commit `bebefa6`, 20/09/2026 01:24)

13 arquivos tocados: o model novo (`modelo_anotacao.py`) e sua migration, `models/__init__.py`, 4 views novas (listar/cadastrar/editar/excluir) em `views.py` — mais o contexto de `conferir_devolucao` passando a incluir a lista de presets —, `urls.py` (4 rotas novas), o template/CSS/JS da tela de CRUD, o script de autocomplete, e os ajustes em `conferir_devolucao.html` (campo marcado pro autocomplete) e `gaveta_pecas.html` (link novo no toolbar).

## Exemplo

Ana clica no campo de anotação de uma peça vazio: aparecem as 3 opções já cadastradas. Digita "ris": a lista filtra pra só "Riscada". Clica na sugestão: o campo é preenchido com "Riscada", substituindo qualquer texto que estivesse ali antes. Se em vez disso ela digitar "Riscada e com um parafuso faltando na base traseira" — texto que não bate com nenhum preset — o campo aceita normalmente, sem nenhum bloqueio.

## Relacionado

- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Checklist de Implementação — Gaveta de Peças e Modais de Ação]]
- [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]]
