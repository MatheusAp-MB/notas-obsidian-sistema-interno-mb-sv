---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 19:58
relacionado: [Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian), Schema de Frontmatter]
resumo: Todo arquivo `.base` (visão de banco de dados nativa do Obsidian, que lê o frontmatter das notas e monta tabela filtrada ao vivo) mora dentro de `Bases/` na raiz do vault, nunca solto — é pasta funcional, não é mundo, e não segue a numeração `0X_`.
---

# Convenção da Pasta Bases

**Resumo**: todo arquivo `.base` (visão de banco de dados nativa do Obsidian, que lê o frontmatter das notas e monta tabela filtrada ao vivo) mora dentro de `Bases/` na raiz do vault, nunca solto — é pasta funcional, não é mundo, e não segue a numeração `0X_`.

## Contexto

Convenção aprovada pelo usuário em 16/08/2026, depois de uma prova de conceito real durante o [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)|estudo de melhorias visuais]]: o Obsidian tem um plugin núcleo chamado **Bases** que transforma qualquer conjunto de notas numa visão tipo planilha, filtrando e ordenando pelas `properties` (o frontmatter) de cada nota — e como esse recurso lê nota de **qualquer mundo ao mesmo tempo**, ele não se encaixa na lógica de pasta por mundo (ver [[Estrutura de Pastas de um Mundo]]) nem na lógica de núcleo — precisava de um lugar próprio.

## O que diz

Todo arquivo `.base` — formato YAML que define 1 ou mais `views` (tabela, lista, cartões ou mapa) sobre um filtro de `properties` — mora dentro de `Bases/`, direto na raiz do vault, nunca solto em outro lugar. `Bases/` é uma **pasta funcional**, não um mundo: não segue a numeração `0X_` usada por núcleo/mundo, porque não representa um assunto ou domínio de conteúdo, representa uma ferramenta de consulta.

Uma Base não substitui o índice de um mundo (`00_Indice_<Nome do Mundo>.md`) — o índice tem o "resumo em texto" de cada nota, que uma Base não escreve sozinha. O que a Base resolve é outro problema: "me mostra tudo que está com determinado status, de qualquer mundo, agora", sem precisar abrir e comparar vários índices manualmente.

O nome do arquivo `.base` descreve a pergunta que ele responde, nunca um nome genérico tipo "visão 1" — ex: `Vault - Pendencias Abertas.base` responde "o que está aberto, em qualquer mundo, agora?".

## Por que é assim e não de outro jeito

Colocar cada arquivo `.base` dentro do mundo que ele mais usa foi a alternativa considerada e descartada — descartada porque uma Base frequentemente junta notas de vários mundos numa visão só (ex: todo `bug_conhecido` com `status: ativo`, de qualquer mundo), então prender ela dentro de 1 mundo específico esconderia esse propósito atrás de uma localização que sugere o contrário.

## Exemplo

`Bases/Vault - Pendencias Abertas.base` foi o primeiro exemplo real criado, com 3 views: bugs em aberto, checkpoints em andamento, e dúvidas em aberto — todas cruzando qualquer mundo do vault, sem precisar caçar manualmente pasta por pasta:

```yaml
views:
  - type: table
    name: "Bugs em aberto"
    filters:
      and:
        - 'tipo == "bug_conhecido"'
        - 'status == "ativo"'
    order:
      - file.name
      - dominio
      - atualizado_em
```

## Relacionado

- [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]
- [[Schema de Frontmatter]]
