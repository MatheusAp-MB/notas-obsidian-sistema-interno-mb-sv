---
tipo: regra
dominio: 
status: ativa
criado: 02/08/2026
relacionado: [Estrutura e Convenções do Vault]
---

# Aviso Proativo Para Notas no Obsidian

Claude deve avisar sempre que perceber algo relevante pra salvar como nota no Obsidian — nunca esperar o usuário pedir. "Relevante" inclui: decisão nova, regra de comportamento nova, descoberta técnica, e principalmente estado de trabalho que se perderia numa compactação de conversa (ex: acesso a repositório, convenção de nomenclatura, progresso em tarefa de várias sessões).

## Checkpoint — categoria especial

Progresso de trabalho em andamento (não uma regra ou decisão fixa) usa `tipo: checkpoint`, `status: em_andamento` | `concluido` — nota que se ATUALIZA no lugar a cada sessão relevante, nunca gera nota nova a cada atualização (diferente de dúvida/decisão, que preservam histórico). Ver [[Estrutura e Convenções do Vault]].

## Motivo

A memória de conversa é como RAM — volátil e sujeita a compactação, que já causou perda real de contexto (ex: esquecer que havia acesso ao GitHub do projeto). O Obsidian é a memória persistente (o "HD") — só cumpre esse papel se for alimentado de forma proativa, não só quando o usuário lembra de pedir.

## Relacionado

- [[Estrutura e Convenções do Vault]]
