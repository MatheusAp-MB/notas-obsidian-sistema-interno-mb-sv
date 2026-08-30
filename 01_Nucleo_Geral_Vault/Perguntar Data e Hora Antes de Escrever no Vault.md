---
tipo: regra
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 30/08/2026 17:34
relacionado: [Aviso Proativo Para Notas no Obsidian, Schema de Frontmatter]
resumo: Antes de escrever ou editar qualquer nota do vault, Claude pergunta a data e hora atuais ao usuário — 1 vez por bloco de trabalho, nunca por arquivo — e usa essa resposta pra preencher `atualizado_em` em toda nota tocada naquele bloco.
---

# Perguntar Data e Hora Antes de Escrever no Vault

**Resumo**: antes de escrever ou editar qualquer nota do vault, Claude pergunta a data e hora atuais ao usuário — 1 vez por bloco de trabalho, nunca por arquivo — e usa essa resposta pra preencher `atualizado_em` em toda nota tocada naquele bloco.

## Contexto

O campo `atualizado_em` (ver [[Schema de Frontmatter]]) só cumpre sua função — dizer quando o conteúdo de uma nota foi revisado de verdade pela última vez — se o valor gravado for confiável. A data do ambiente onde Claude roda (o sandbox) nem sempre bate com o momento que o usuário considera "agora" pra registrar (ex: fuso horário diferente, ou o usuário revisando um trabalho feito antes) — por isso a hora nunca é assumida, sempre confirmada.

## O que diz

Antes de escrever ou editar qualquer nota do vault, Claude pergunta ao usuário a data e hora atuais — nunca assume, nunca usa só a data do ambiente sem confirmar a hora. Uma referência aproximada já basta (não precisa ser o timestamp exato ao segundo).

**Granularidade — 1x por bloco, não por arquivo**: quando várias notas são escritas/editadas juntas, na mesma leva de trabalho (ex: um checkpoint + 2 decisões + o índice, tudo no mesmo momento), a pergunta é feita 1 vez só pro bloco inteiro — o mesmo `atualizado_em` vale pra todos os arquivos daquele bloco. Não pergunta de novo arquivo por arquivo dentro do mesmo bloco.

**Consequência direta**: nenhuma escrita ou edição de nota é feita sem essa confirmação — é a data/hora confirmada aqui que preenche `atualizado_em` em cada nota tocada (o comportamento desse campo, incluindo o fato de que toda edição o atualiza, é definido em [[Schema de Frontmatter]], não repetido aqui).

## Por que é assim e não de outro jeito

A alternativa de buscar a hora sozinho (via comando `date` no sandbox) quando o usuário já autorizou a escrita, mas não deu horário, é só uma saída de emergência — nunca substitui a autorização em si, e nunca vale antes dela. Responder a uma pergunta factual dentro do mesmo turno também NUNCA é autorização pra escrever no vault, mesmo que uma pergunta "quer que eu registre?" tenha sido feita antes, junto — autorização e data/hora precisam vir explícitas, separadas, antes de qualquer `Write`/`Edit`. Essa regra existe justamente porque a alternativa mais frouxa (tratar uma resposta ambígua como sinal verde) já falhou na prática — ver o incidente real abaixo.

## Exemplo

Incidente real (10/08/2026, 12:30), no domínio Integração Sysemp: Claude perguntou "se você quiser que eu registre, me passa data/hora" junto de uma pergunta factual separada (sobre bancos serem compartilhados ou não). O usuário respondeu SÓ a pergunta factual ("Sim são 2 bancos locais separados..."), sem autorizar a escrita nem dar hora. Claude tratou essa resposta como autorização implícita, buscou a hora via `TZ='America/Sao_Paulo' date` no sandbox, e escreveu 4 notas do vault sem confirmar — violação direta desta regra. Identificado pelo usuário: "como que você atualizou o vault sem me pedir data e hora?" Timestamps corrigidos de `12:25` (auto-obtido) pra `12:30` (dado real do usuário).

## Relacionado

- [[Schema de Frontmatter]]
- [[Aviso Proativo Para Notas no Obsidian]]
