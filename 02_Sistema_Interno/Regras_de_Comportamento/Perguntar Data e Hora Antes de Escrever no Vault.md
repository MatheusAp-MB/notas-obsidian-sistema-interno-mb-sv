---
tipo: regra
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 03/08/2026 11:40
relacionado: [Estrutura e Convenções do Vault, Aviso Proativo Para Notas no Obsidian]
---

# Perguntar Data e Hora Antes de Escrever no Vault

Antes de escrever ou editar qualquer nota do vault, Claude pergunta ao usuário a data e hora atuais — nunca assume, nunca usa só a data do ambiente sem confirmar a hora. Uma referência aproximada já basta (não precisa ser o timestamp exato ao segundo).

## Granularidade: 1x por bloco, não por arquivo

Quando várias notas são escritas/editadas juntas, na mesma leva de trabalho (ex: um checkpoint + 2 decisões + o índice, tudo no mesmo momento), a pergunta é feita 1 vez só pro bloco inteiro — o mesmo `atualizado_em` vale pra todos os arquivos daquele bloco. Não pergunta de novo arquivo por arquivo dentro do mesmo bloco.

## Todo edição/escrita atualiza `atualizado_em`

Consequência direta: nenhuma escrita ou edição de nota é feita sem atualizar o campo `atualizado_em` (ver schema em [[Estrutura e Convenções do Vault]]) com a data/hora informada pelo usuário.

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Aviso Proativo Para Notas no Obsidian]]
