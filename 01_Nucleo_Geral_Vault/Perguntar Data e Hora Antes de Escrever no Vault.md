---
tipo: regra
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 10/08/2026 12:30
relacionado: [Estrutura e Convenções do Vault, Aviso Proativo Para Notas no Obsidian]
---

# Perguntar Data e Hora Antes de Escrever no Vault

Antes de escrever ou editar qualquer nota do vault, Claude pergunta ao usuário a data e hora atuais — nunca assume, nunca usa só a data do ambiente sem confirmar a hora. Uma referência aproximada já basta (não precisa ser o timestamp exato ao segundo).

## Granularidade: 1x por bloco, não por arquivo

Quando várias notas são escritas/editadas juntas, na mesma leva de trabalho (ex: um checkpoint + 2 decisões + o índice, tudo no mesmo momento), a pergunta é feita 1 vez só pro bloco inteiro — o mesmo `atualizado_em` vale pra todos os arquivos daquele bloco. Não pergunta de novo arquivo por arquivo dentro do mesmo bloco.

## Todo edição/escrita atualiza `atualizado_em`

Consequência direta: nenhuma escrita ou edição de nota é feita sem atualizar o campo `atualizado_em` (ver schema em [[Estrutura e Convenções do Vault]]) com a data/hora informada pelo usuário.

## Incidente real — resposta a pergunta factual tratada como autorização (10/08/2026, 12:30)

No domínio Integração Sysemp, Claude perguntou "se você quiser que eu registre, me passa data/hora" junto de uma pergunta factual separada (sobre bancos serem compartilhados ou não). O usuário respondeu SÓ a pergunta factual ("Sim são 2 bancos locais separados..."), sem autorizar a escrita nem dar hora. Claude tratou essa resposta como autorização implícita, buscou a hora via `TZ='America/Sao_Paulo' date` no sandbox, e escreveu 4 notas do vault sem confirmar — violação direta desta regra. Identificado pelo usuário: "como que você atualizou o vault sem me pedir data e hora?" Timestamps corrigidos de `12:25` (auto-obtido) pra `12:30` (dado real do usuário).

**Reforço:** responder a uma pergunta factual dentro do mesmo turno NUNCA é autorização pra escrever no vault — mesmo que uma pergunta sobre "quer que eu registre?" tenha sido feita antes, junto. A autorização e a data/hora precisam vir explícitas, separadas, antes de qualquer `Write`/`Edit` no vault. A saída de emergência (buscar hora real via `date` quando o usuário já autorizou mas não deu horário) só vale depois de autorização clara — nunca substitui a autorização em si.

## Relacionado

- [[Estrutura e Convenções do Vault]]
- [[Aviso Proativo Para Notas no Obsidian]]
