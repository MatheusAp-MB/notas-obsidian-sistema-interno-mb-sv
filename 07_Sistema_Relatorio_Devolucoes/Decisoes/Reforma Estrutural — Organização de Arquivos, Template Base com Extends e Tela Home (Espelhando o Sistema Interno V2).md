---
tipo: decisao
dominio: python
status: em_andamento
criado: 05/09/2026
atualizado_em: 05/09/2026 16:44
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo, Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]
---

# Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)

**Resumo**: depois de fechada a migração pra MySQL + arquitetura multi-empresa (ver [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]), o usuário decidiu pausar toda outra frente (persistência de devoluções, auditoria mobile-first, pontos de melhoria do superior ainda não detalhados) pra focar 100% em fechar uma base estrutural sólida: organização correta de HTML/CSS/JS, herança real de template (`{% extends %}`) e uma tela "home" de verdade com navbar + seletores de módulo — tudo espelhando o padrão já usado no Sistema Interno V2, em vez de continuar com a estrutura improvisada de rascunho.

> [!warning] Em andamento — escopo definido, implementação ainda não iniciada (05/09/2026, 16:44)
> 3 pontos decididos pelo usuário como prioridade única, antes de qualquer outra melhoria: (1) organizar arquivos HTML/CSS/JS soltos incorretamente (ex: `loading.html` na raiz do projeto); (2) template base compartilhado com `{% extends %}`, eliminando a repetição de `<head>`/nav em cada tela; (3) tela "home" real, com navbar e quadradinhos seletores de módulo. Falta inspecionar a estrutura real do Sistema Interno V2 antes de detalhar os passos técnicos de cada ponto.

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
- **3 frentes da reforma**, nenhuma iniciada ainda:
    1. Organizar corretamente todo HTML/CSS/JS do projeto (a começar por `loading.html`, hoje solto na raiz).
    2. Introduzir template base compartilhado via `{% extends %}`, eliminando a duplicação de `<head>`/nav entre as telas.
    3. Criar uma tela "home" real — navbar + quadradinhos seletores de módulo — como base sólida de navegação do sistema, no lugar de abrir direto em Nova Devolução.

## Em aberto

- [ ] Decidir como inspecionar a estrutura real do Sistema Interno V2 (clone read-only, ou descrição do usuário) — passo prévio a qualquer plano técnico detalhado
- [ ] Organizar HTML/CSS/JS soltos ou mal posicionados (`loading.html` na raiz é o caso já identificado; conferir se há mais, uma vez vista a estrutura de referência)
- [ ] Desenhar e implementar o template base (`{% extends %}`), migrando as 3 telas existentes pra herdar dele
- [ ] Desenhar e implementar a tela "home" (navbar + quadradinhos seletores de módulo), incluindo decidir a nova URL raiz e pra onde Nova Devolução se move
- [ ] Validar, tela por tela, que nada quebrou depois da migração pra template base (Produtos, Nova Devolução, Catálogo)

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Reestruturação de Telas — Produtos como Tela Direta, Edição de Dados do Produto Embutida no Catálogo]]
- [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]
