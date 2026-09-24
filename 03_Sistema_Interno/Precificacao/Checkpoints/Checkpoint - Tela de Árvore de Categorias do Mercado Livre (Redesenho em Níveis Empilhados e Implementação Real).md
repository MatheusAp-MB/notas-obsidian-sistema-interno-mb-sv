---
tipo: checkpoint
status: concluido
criado: 24/09/2026
dominio: python
relacionado: [Checkpoint - Idealização de Cache de Comissão e Frete + Tabela de Categorias do Mercado Livre]
---

# Checkpoint - Tela de Árvore de Categorias do Mercado Livre (Redesenho em Níveis Empilhados e Implementação Real)

**Resumo**: A tela de navegação pela árvore de categorias do Mercado Livre (a tabela `CategoriaMercadoLivre` idealizada em [[Checkpoint - Idealização de Cache de Comissão e Frete + Tabela de Categorias do Mercado Livre]]) foi redesenhada do zero: uma rodada de análise de UX por personas (só texto, sem código), duas rodadas de mockup do GPT avaliadas contra essas personas, uma investigação empírica sobre usar imagens reais da API como ícone de categoria, a implementação real completa em Django/HTMX, e 3 ciclos de correção guiados por screenshot — até a aprovação final de Matheus.

## 1. Ponto de partida — formato antigo rejeitado

A primeira tentativa de redesenho (lista de coluna única) tinha sido rejeitada explicitamente por Matheus: *"o formato antigo de cards estava melhor... esse formato de lista eu tenho no meu ERP é HORRIVEL"*. Isso travou como restrição obrigatória pro resto do trabalho: manter o visual de cards, resolvendo só o bug estrutural de reflow (cards se movendo/quebrando linha quando um irmão expandia).

## 2. Análise de UX baseada em personas (texto, sem código)

Antes de qualquer mockup visual, foi feita uma análise só em texto — contra 3 personas nomeadas representando perfis reais de uso da tela — pra fundamentar a escolha de arquitetura antes de desenhar qualquer coisa.

## 3. Rodada 1 de mockups do GPT — 3 formatos avaliados

Matheus trouxe screenshots com 3 propostas do GPT: Miller Columns, Tree View e um fluxo de drill-down mobile. As 3 foram avaliadas contra as personas — nenhuma foi adotada como estava, mas serviram de base pra rodada seguinte.

## 4. Rodada 2 — "níveis empilhados", modelo aprovado

Novo mockup do GPT: cada nível da árvore como um bloco vertical independente, empilhado de cima pra baixo, conectado por uma linha tracejada — preservando o visual de card que Matheus queria manter. Depois de receber um mockup funcional (HTML) do GPT e revisar, Matheus aprovou testar na prática: *"vamos testar na pratica ... sincronize e gere os diff"*.

## 5. Investigação da API — o campo `picture` dá pra usar como ícone?

Pergunta de Matheus: *"a api traz pra gente umas imagens ne? a gente pode usar elas no lugar dos icones que o gpt mostrou"*. Enquanto ele fechava o layout com o GPT, essa investigação rodou em paralelo — o mesmo padrão de rigor de sempre: nada assumido sem rodar contra o dump real, com Matheus rodando o script localmente e colando o resultado.

Resultado (script `scripts_exploracao_ML/investigar_cobertura_picture_por_nivel.py`, novo, criado nesta investigação e já commitado no repo): o campo `picture` existe em 100% das 12.233 categorias do dump, mas só está de fato preenchido de forma útil no Nível 1 (32/32 = 100%). A partir daí despenca rápido: Nível 2 = 39,6% (177/447), Nível 3 = 4,3% (125/2.941), Nível 4 = 1,3% (66/5.209), Nível 5 = 0,3% (10/2.972), Nível 6 = 0,2% (1/627), Nível 7 = 0% (0/5).

**Conclusão**: ícone real da API só é viável no Nível 1. A estratégia pros níveis mais profundos ficou **propositalmente em aberto** — Matheus: *"pensamos com calma dps... ou usar a mesma imagem 1 para ilustrar tudo"*. A tela foi implementada sem nenhum ícone de categoria por enquanto (ver Pendências).

## 6. Implementação real — arquitetura de "recálculo total da trilha"

Toda a implementação foi entregue como texto/blocos de código no chat (Localize/Substitua ou arquivo completo), nunca como arquivo criado diretamente por Claude — seguindo a regra padrão do repositório de código.

**Arquitetura central**: cada nível da árvore é um bloco independente e sempre empilhado (`.nivel-bloco`). Selecionar qualquer categoria (por card, resultado de busca ou breadcrumb) sempre aciona 1 único endpoint (`view_categorias_selecionar`) que recalcula a trilha INTEIRA do zero (sobe até a raiz via `categoria_pai`, desce de novo montando 1 bloco por nível da trilha) e troca o HTML inteiro da pilha de níveis — nunca uma inserção parcial no meio de algo que já estava lá. Isso elimina estruturalmente o bug antigo de reflow: irmãos nunca mais se movem inesperadamente.

**HTMX out-of-band**: 1 resposta do servidor atualiza 3 áreas de uma vez — o alvo normal (`#categorias-trilha-niveis`) e 2 blocos out-of-band (`hx-swap-oob="true"`) pro breadcrumb e pro painel de detalhes lateral.

## 7. Arquivos entregues

`mercado_livre/urls.py`, `mercado_livre/views.py` (funções `_montar_trilha_categoria`, `_montar_niveis_categorias`, `view_categorias_ml`, `view_categorias_selecionar`, `view_categorias_buscar`), `mercado_livre/templates/mercado_livre/estrutura_categorias_ml.html` e 5 parciais novos (`estrutura_parcial_niveis.html`, `estrutura_parcial_breadcrumb.html`, `estrutura_parcial_resposta_selecao.html`, `estrutura_parcial_detalhe_categoria.html`, `estrutura_parcial_resultados_busca.html`), `layout_categorias_ml.css` e `script_categorias_ml.js` (drasticamente simplificado — sem mais estado de aberto/fechado no JS, já que o servidor sempre manda o HTML final pronto). Todos confirmados aplicados via sincronização (fetch/ff-only-merge no clone de leitura de Claude) e leitura direta do repo.

## 8. Bug 1 corrigido — contraste (token de cor mal usado)

Matheus reportou só *"Precisa de mais contraste"*, com screenshot. Causa raiz encontrada lendo o `layout_global.css` real (não por suposição): `--cor-texto-claro` é branco (`#ffffff`), feito pra texto EM CIMA de fundo escuro/colorido — não é o token de texto normal do sistema (que é `#515151`, fixo no `body`, sem variável dedicada). O token tinha sido usado errado em 7 lugares do CSS da tela. Corrigido substituindo todos por `#515151` (ou `var(--cor-primaria)` no caso de um hover).

## 9. Bug 2 corrigido — ficha de detalhes vazando pra categoria não-folha

Matheus perguntou diretamente: *"pq quando eu clico no nivel 01 aparecem um monte de coisa em 'Detalhes da Categoria'? sendo que o nivel 01 não é folha"*. Era uma decisão de design não avisada (renderizar a ficha completa pra qualquer categoria, folha ou não) que se mostrou enganosa na prática — uma categoria não-folha/guarda-chuva não pode receber anúncio direto, então a ficha completa (faixa de preço, limites de conteúdo, comissão) não fazia sentido pra ela. Corrigido com branch condicional em `e_folha`: categoria não-folha mostra só Status + "Aceita novo anúncio" + um aviso orientando a ir mais fundo na árvore.

## 10. Bug 3 corrigido — bloco de CSS que faltou aplicar

No pedido seguinte de Matheus (*"sincronize e veja as diff necessarias"*), a sincronização revelou que o CSS do Bug 2 (`.aviso-nao-folha`) não tinha sido de fato aplicado no arquivo real — só o nome da classe sobreviveu dentro de um comentário, provavelmente um gap de copiar/colar ao juntar os fixes num commit só. Encontrado sistematicamente, comparando cada arquivo entregue contra o repo recém-sincronizado (nunca assumindo que "mandei o diff" = "aplicou certo"). Reentregue como Localize/Substitua preciso.

## 11. Aprovação final

Matheus: *"Otimo tela aprovada"*.

## Pendências

- **Estratégia de ícone por categoria** — deliberadamente adiada por Matheus (imagem genérica única vs. imagem real só no Nível 1 vs. outra ideia) — "pensamos com calma dps".
- **4 templates parciais mortos** (da versão anterior, substituída por esta): `estrutura_parcial_conteudo_raizes.html`, `estrutura_parcial_grade_categorias.html`, `estrutura_parcial_no_categoria.html`, `estrutura_parcial_resultado_categoria.html` — seguros pra apagar, sinalizado 2x a Matheus, ainda não removidos por ele.
- Nenhuma migration nova foi necessária neste trabalho — o modelo `CategoriaMercadoLivre` já existia aplicado no repo, criado na frente documentada em [[Checkpoint - Idealização de Cache de Comissão e Frete + Tabela de Categorias do Mercado Livre]].

## Relacionado

- [[Checkpoint - Idealização de Cache de Comissão e Frete + Tabela de Categorias do Mercado Livre]] (nota-mãe — idealização do modelo `CategoriaMercadoLivre` e da sincronização via dump que esta tela consome)
