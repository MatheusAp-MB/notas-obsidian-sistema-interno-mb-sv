---
tipo: decisao
dominio: python
status: concluida
criado: 05/09/2026
atualizado_em: 06/09/2026 14:54
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador), core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]
---

# Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)

**Resumo**: depois de fechada a migração pra MySQL + arquitetura multi-empresa (ver [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]), o usuário decidiu pausar toda outra frente (persistência de devoluções, auditoria mobile-first, pontos de melhoria do superior ainda não detalhados) pra focar 100% em fechar uma base estrutural sólida: organização correta de HTML/CSS/JS, herança real de template (`{% extends %}`) e uma tela "home" de verdade com navbar + seletores de módulo — tudo espelhando o padrão já usado no Sistema Interno V2, em vez de continuar com a estrutura improvisada de rascunho.

> [!success] Concluída — 3 pontos fechados e validados tela por tela (06/09/2026, 14:54)
> `loading.html` organizado fora da árvore Django; template base (`{% extends %}`) implementado com sidebar + toolbar (ajuste em relação ao plano original, que previa navbar — o Sistema Interno V2 usa sidebar, não navbar); tela home criada com quadradinhos de módulo; as 3 telas reais migradas, eliminando a duplicação de `<head>`/nav e de CSS por página. Durante a execução apareceu uma 4ª frente não prevista — ver [[core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]].

## Contexto

Com a migração pra MySQL e a arquitetura multi-empresa fechadas e testadas de ponta a ponta (ver linha do tempo de 05/09/2026 em [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]), o usuário considerou seguir pra melhorias e novas telas — mas, ao revisar o estado real do projeto, identificou que a base estrutural do próprio Devolução ainda está no nível de rascunho rápido (ver [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]] e a linha do tempo de 01–02/09/2026), enquanto o Sistema Interno V2 — o projeto irmão, mesma empresa, mesmo dono — já resolveu isso há tempo. O usuário decidiu, na hora, que fechar essa base é pré-requisito antes de qualquer outra frente.

## O problema

Três divergências concretas entre o estado atual do Devolução e o padrão já validado no Sistema Interno V2:

1. **Arquivos soltos, sem organização clara** — `loading.html` está na raiz do projeto (ao lado de `manage.py`), fora de qualquer pasta de template ou estático.
2. **Nenhuma herança de template** — as 3 telas reais (`nova_devolucao.html`, `produtos.html`, `catalogo.html`) repetem, cada uma, o mesmo bloco de `<!DOCTYPE>`/`<head>`/`<nav>` — sem um template base comum usando `{% extends %}`.
3. **Nenhuma tela "home"** — o sistema abre direto na tela de Nova Devolução; não existe uma tela inicial própria, com navbar e os quadradinhos seletores de módulo que o Sistema Interno V2 já tem.

## O que levou à resposta

Diferente de outras decisões deste mundo (ex: [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]], que comparou 3 alternativas de entrega lado a lado), esta não nasceu de alternativas levantadas por Claude — foi uma constatação direta do próprio usuário, comparando o estado real das telas do Devolução contra o Sistema Interno V2, que ele mesmo desenvolve e mantém. A pergunta "entendeu o que eu disse até aqui?" foi respondida e confirmada antes desta nota ser escrita, seguindo a disciplina de nunca assumir entendimento sem confirmação explícita.

**Ainda pendente antes de qualquer passo técnico**: nenhuma implementação começou. Falta decidir como inspecionar a estrutura real do Sistema Interno V2 — clone read-only do repositório (mesmo tratamento já dado ao Devolução) ou descrição direta do usuário — pra espelhar o padrão de verdade, em vez de aplicar uma convenção genérica de Django que pareça certa mas não bata com o que os 2 sistemas já usam.

## Decisão

- **Prioridade 100% nesta reforma estrutural**, pausando explicitamente: pontos de melhoria do superior (ainda não detalhados), persistência de devoluções (schema do model `Devolucao`), e auditoria mobile-first de Produtos/Nova Devolução. Nenhum desses 3 itens é descartado — só adiado até esta base fechar.
- **3 frentes da reforma, todas concluídas em 06/09/2026**:
    1. Organizar corretamente todo HTML/CSS/JS do projeto — `loading.html` movido pra `launcher_recursos/`, com `launcher.py` e `gerar_exe.py` atualizados junto.
    2. Template base compartilhado via `{% extends %}`, eliminando a duplicação de `<head>`/nav entre as telas — e também a duplicação de CSS por página, que ficou redundante depois da migração.
    3. Tela "home" real — sidebar + toolbar + quadradinhos seletores de módulo (Nova Devolução, Produtos) — como base sólida de navegação; URL raiz movida pra home, Nova Devolução ganhou path próprio (`/nova-devolucao/`).

Durante a execução, surgiu uma 4ª frente não prevista: o app `core` dividia o nome com a pasta de settings do projeto (criado desde o início como `django-admin startproject core`), o que travava dar ao app `core` seu próprio `urls.py`. Corrigido renomeando a pasta de settings pra `projeto_sistema_devolucao_mb_sv` — ver [[core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]].

## Em aberto

- [x] Decidir como inspecionar a estrutura real do Sistema Interno V2 — feito via clone read-only, autorizado explicitamente pelo usuário
- [x] Organizar HTML/CSS/JS soltos ou mal posicionados — `loading.html` movido pra `launcher_recursos/`, referências em `launcher.py`/`gerar_exe.py` atualizadas
- [x] Desenhar e implementar o template base (`{% extends %}`), migrando as 3 telas existentes pra herdar dele
- [x] Desenhar e implementar a tela "home" (sidebar + toolbar + quadradinhos seletores de módulo — não navbar, ver nota no callout), incluindo mover a URL raiz e o path de Nova Devolução
- [x] Validar, tela por tela, que nada quebrou depois da migração pra template base (Produtos, Nova Devolução, Catálogo) — incluindo a troca de empresa entre MAGAZINE e SAMVALE

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]
- [[core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]]
