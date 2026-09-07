---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 07/09/2026
atualizado_em: 07/09/2026 14:36
relacionado: [Checkpoint - Desenho da Gaveta de Peças e Modais de Ação, Análise do UX Flow da Responsável pela Devolução, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
---

# Checklist de Implementação — Gaveta de Peças e Modais de Ação

Esta nota marca a virada de fase no [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]: tudo que estava em [[Checkpoint - Desenho da Gaveta de Peças e Modais de Ação]] era Idealizar/Planejar — daqui pra frente é Executar. Matheus resetou os dois bancos de dados (magazine e samvale) de propósito pra essa fase, pra trabalhar sem se preocupar com dado nenhum.

> [!info] Toda decisão de design usada aqui já está registrada em [[Checkpoint - Desenho da Gaveta de Peças e Modais de Ação]] (critério modal/inline, atlas de estados, os 8 cenários). Esta nota só traduz aquelas decisões em tarefas de engenharia.

> [!warning] Regra de execução
> A partir daqui, seguimos **unicamente este checklist**. Um Objetivo de cada vez, na ordem numerada, sem pular. Dentro de cada Objetivo: backend antes de template, template antes de JS. Nenhuma melhoria nova entra no meio da implementação — fica pra depois, pra não confundir o que já está em andamento.

## Decisão técnica de base (Objetivo 0)

Os modais de Peça e Vínculo não recarregam a página — só funcionam assim se conversarem com o backend por AJAX (JS envia os dados, recebe JSON, atualiza a tela sem recarregar). É o mesmo padrão que `script_marca_widget.js` já usa pro cadastro rápido de marca/grupo.

Produto **não muda de mecanismo** — continua com página própria, formulário clássico com redirect.

- [x] Confirmado: Peça e Vínculo passam a ser AJAX (JS envia, recebe JSON, atualiza a tela)
- [x] Confirmado: Produto mantém o mecanismo atual, sem mudança

## Objetivo 1 — Backend: endpoints da Gaveta de Peças

- [x] View de listagem (grade) com filtro por nome, marca e status (Todas/Vinculadas/Avulsas)
- [x] Endpoint AJAX: cadastrar peça
- [x] Endpoint AJAX: editar peça
- [x] Reaproveitar `excluir_peca` (já existe, só garantir que fica alcançável daqui)
- [x] Nova URL (ex: `/pecas/`)

## Objetivo 2 — Backend: endpoint de Vínculo compartilhado

- [x] Endpoint AJAX: criar vínculo (peça + produto + quantidade)
- [x] Lógica de duplicidade: vínculo já existe → retorna a quantidade atual em vez de criar duplicado
- [x] Endpoint AJAX: confirmar atualização de quantidade (resolução da duplicidade)
- [x] Reaproveitar/ajustar desvincular pra funcionar também partindo da Gaveta, não só da tela de produto
- [x] Endpoint de busca de produto (simétrico ao `buscar_pecas` que já existe), pra usar dentro do modal quando a peça é o lado travado

## Objetivo 3 — Templates: Gaveta de Peças

- [x] `gaveta_pecas.html` — grade + estado vazio + busca/filtro
- [x] Partial do card de peça (estados: avulsa / vinculada / expandido)
- [x] Partial do Modal de Peça (criar/editar, mesmo componente)
- [x] Partial do Modal de Vínculo (compartilhado entre os dois pontos de entrada)

## Objetivo 4 — Templates: ajustar a página de Produto

- [x] Lista de peças já vinculadas ao produto
- [x] Botão "Vincular peça existente" → abre o Modal de Vínculo com produto travado (template pronto; a ligação em JS é o Objetivo 7)
- [x] Remover qualquer resquício de cadastro de peça avulsa dessa tela

## Objetivo 5 — Aposentar `catalogo.html`

- [x] Decidir o destino final do arquivo: vira a seção de peças vinculadas dentro da página de Produto, ou some por completo
- [x] Remover rotas/links antigos que apontavam pra ele isolado

> [!note] Correção na sincronização de 07/09
> A aplicação manual dos diffs originais tinha ficado incompleta em 3 pontos, achados e corrigidos nesta data: `views.py` ainda tinha `reverse('catalogo')`/`redirect('catalogo')` sobrando em `cadastrar_produto`, `editar_produto`, `vincular_peca`, `cadastrar_peca` e `cadastrar_peca_avulsa` (15 ocorrências, com o import de `reverse` já removido — isso quebraria em runtime); `produtos.html` tinha 2 tags `{% url 'editar_produto' produto.id %}` com a chave de fechamento faltando (bug silencioso, sem erro no Django); `produto_form.html` tinha o link "← Voltar" do topo ainda com a lógica condicional antiga apontando pro catálogo. Reconfirmado via harness que não sobra nenhuma referência a `'catalogo'` no projeto.

## Objetivo 6 — JS: Gaveta de Peças

- [x] `script_gaveta_pecas.js` — abrir/fechar Modal de Peça, abrir/fechar Modal de Vínculo, busca ao vivo, expandir/recolher card, chamadas AJAX
- [x] Reaproveitar `script_marca_widget.js` dentro do Modal de Peça, sem duplicar lógica

> [!note] Componente novo — `script_modal_vinculo.js`
> A lógica do Modal de Vínculo foi extraída pra um arquivo próprio e compartilhado (API pública `ModalVinculo.abrirComPeca(...)` / `ModalVinculo.abrirComProduto(...)`), no mesmo espírito do `script_marca_widget.js` — pra não duplicar essa lógica quando o Objetivo 7 (tela de Produto) também precisar dela. Ficaram 2 situações que ainda recarregam a página em vez de atualizar via AJAX: cadastrar a 1ª peça do sistema (estado vazio tem HTML bem diferente da grade) e excluir a última peça restante (mesmo raciocínio). O "abrir foto grande" do card (classe `catalogo-peca-foto--clicavel`) ficou propositalmente sem JS, adiado pro Objetivo 8 junto com o CSS da Gaveta.
>
> Validado em 07/09 com 56 checks automatizados (Django renderizando os templates reais + jsdom simulando clique/digitação/submit nos arquivos JS reais) contra o commit `7e1b30c` — todos passando. Falta só a conferência visual no navegador (sem CSS ainda).

## Objetivo 7 — JS: ajustar a página de Produto (próximo passo)

- [ ] `script_produto_form.js` ganha a abertura do Modal de Vínculo (produto pré-travado)
- [ ] Remover a lógica antiga de busca/cadastro de peça que hoje vive em `script_catalogo.js`

## Objetivo 8 — CSS

- [ ] Estilos da grade, dos 3 estados do card, dos dois modais, dos chips, dos badges, do aviso de confirmação
- [ ] Reaproveitar classes já existentes onde fizer sentido, sem duplicar

## Objetivo 9 — Navegação

- [x] "Peças" entra no menu principal, irmã de "Produtos"

> [!note] Confirmado em 07/09 — já estava pronto como efeito colateral do Objetivo 5 (reestruturação da sidebar). Link ativo em `estrutura_base_global.html`, com destaque de item ativo quando `pagina_ativa == 'gaveta_pecas'`.

## Objetivo 10 — Limpeza

- [ ] Remover arquivos/trechos que deixam de ser usados depois da migração
- [ ] Revisar se isso afeta o comentário já existente sobre Nova Devolução (peça independente de produto)

## Objetivo 11 — Validação manual

- [ ] Testar os 8 cenários já mapeados em [[Checkpoint - Desenho da Gaveta de Peças e Modais de Ação]], um por um, com os bancos vazios

## Ordem de execução

Backend antes de template, template antes de JS, dentro de cada Objetivo. Seguir a numeração em sequência (0 → 11), sem pular.

## Relacionado

- [[Checkpoint - Desenho da Gaveta de Peças e Modais de Ação]]
- [[Análise do UX Flow da Responsável pela Devolução]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
