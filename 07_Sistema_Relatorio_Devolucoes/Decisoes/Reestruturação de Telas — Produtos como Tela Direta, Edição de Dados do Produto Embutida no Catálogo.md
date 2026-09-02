---
tipo: decisao
dominio: python
status: concluida
criado: 02/09/2026
atualizado_em: 02/09/2026 02:31
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo

**Resumo**: o fluxo de uso diário passa a ter 2 telas diretas — "Nova Devolução" e "Produtos" (nova) — em vez de depender só da busca por código de barras pra chegar num produto. A tela de Produtos lista os produtos cadastrados (foto, nome, marca, EAN) e concentra o cadastro de produto novo (com foto própria do produto, campo novo no model). A busca por código de barras na tela de catálogo/peças continua existindo, mas perde a criação inline "cadastre aqui se não existir" — cadastro passa a acontecer só pela tela de Produtos. Dentro da tela de catálogo/peças (aberta a partir de um produto), foi adicionada uma seção "Dados do produto" pra editar nome/marca/EAN/foto do produto sem precisar de tela separada. Um menu simples no topo (Nova Devolução | Produtos) navega entre as 2 telas diretas.

> [!success] Decidido e implementado — 02/09/2026, 02:31
> As 6 etapas (campo de foto no model, rotas/views, tela de Produtos, cadastro de produto com foto, seção "Dados do produto" no catálogo, menu de navegação) foram implementadas uma a uma e testadas manualmente pelo usuário a cada etapa.

## Contexto

A tela de Catálogo de peças (ver linha do tempo em [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]], 02/09/2026 01:06) ficou funcional, mas expôs um problema de fluxo: o usuário nunca entra diretamente pra editar peças de um produto — a peça é parte de um produto, então primeiro precisa abrir o produto. Isso hoje só acontecia via código de barras, mas não existia lugar nenhum pra ver os produtos já cadastrados.

## O problema

Faltava uma tela de "visão geral" dos produtos cadastrados, e a responsabilidade de "criar produto novo" estava misturada dentro do fluxo de busca por código de barras (aparecia só quando a busca não encontrava nada) — o que dificultava um cadastro deliberado (o usuário só cadastrava "sem querer", ao tentar buscar algo que não existia ainda).

## O que levou à resposta

Discutido com o usuário (texto corrido, sem gerar código antes de confirmar entendimento): a ideia inicial era 2 telas "diretas" de uso no dia a dia — a tela de gerar relatório de devolução (= "Nova Devolução", já existente) e uma tela de "cadastro/listagem de produtos" nova. Confirmado ponto a ponto:
- Peça de um produto continua sendo acessada só via código de barras (EAN garantido único por produto, sem necessidade de 2ª forma de entrada).
- Editar título/marca/EAN do produto entra como seção a mais dentro da mesma tela de peças, não como tela separada.
- A "tela de gerar relatório de devolução" citada é a "Nova Devolução" já existente.
- Adicional levantado depois: o Produto em si também precisa de foto própria (distinta das fotos de cada peça).

Antes de implementar, foi gerado e aprovado um mockup interativo (HTML) mostrando as 2 telas (Produtos e a versão nova do catálogo com a seção de edição de produto) com a mesma paleta visual do app real. Só depois da aprovação do mockup a implementação começou, sempre pedida explicitamente pelo usuário em etapas pequenas e sequenciais (1 arquivo/mudança por vez, nunca tudo de uma vez), pra facilitar teste e validação a cada passo.

## Decisão

Fluxo de telas do app fixado assim:
1. **Model**: `Produto` ganhou campo `foto` (`ImageField`, pasta `catalogo_produtos/`, separada da pasta `catalogo_pecas/` das peças).
2. **Tela "Produtos"** (`/produtos/`, view `produtos`): lista todos os produtos (foto, nome, marca, EAN), cada card leva pro catálogo daquele produto via EAN. Botão "Cadastrar produto" abre formulário inline (nome, marca, EAN, foto) — view `cadastrar_produto` ajustada pra aceitar foto e redirecionar de volta pra "Produtos" (antes redirecionava pro catálogo).
3. **Tela de Catálogo/peças**: ganhou seção "Dados do produto" (nome/marca/EAN/foto editáveis, view nova `editar_produto`) e um link "← Voltar para Produtos". A busca por EAN continua igual, mas o card de "produto não encontrado" perdeu o formulário de cadastro embutido — só mostra a mensagem e o link de volta pra Produtos.
4. **Navegação**: menu simples no topo (Nova Devolução | Produtos) presente nas 3 telas, com destaque visual da aba ativa (a tela de catálogo conta como "Produtos" ativo, por ser sub-tela desse fluxo).

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
