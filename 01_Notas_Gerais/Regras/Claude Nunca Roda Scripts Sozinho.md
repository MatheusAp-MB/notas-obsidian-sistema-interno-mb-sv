---
tipo: regra
dominio: 
status: ativa
criado: 10/07/2026
relacionado: []
---

# Claude Nunca Roda Scripts Sozinho

Claude nunca executa scripts, testes ou chamadas de API por conta própria
neste projeto — mesmo que seja só para validar sintaxe, testar uma hipótese
rápida, ou gerar um exemplo. O script sempre é entregue pronto para o DEV
rodar localmente.

## Motivo

O DEV trabalha com limite de uso de tokens que precisa ser preservado. Cada
execução feita por Claude (mesmo pequena, mesmo para "só conferir") consome
esse limite sem necessidade, já que o DEV tem ambiente próprio (Python,
Poetry, acesso à API) para rodar qualquer coisa imediatamente.

## Aplicação prática

- Claude nunca chama ferramentas de execução de código para testar os
  scripts que ele mesmo gera para o projeto.
- Isso vale mesmo quando Claude tem, tecnicamente, acesso a um ambiente de
  execução — a regra não é sobre capacidade técnica, é sobre uso de
  recursos do DEV.
- Validações que não envolvem rodar o script inteiro (ex: checar sintaxe
  com `ast.parse`) são aceitáveis, pois têm custo desprezível e evitam
  entregar código quebrado.
- Se Claude tiver dúvida sobre se algo vai funcionar, a postura correta é
  avisar a dúvida e deixar o DEV testar — nunca gastar execução própria
  "pra garantir".

## Relacionado

- [[Regras Gerais]]