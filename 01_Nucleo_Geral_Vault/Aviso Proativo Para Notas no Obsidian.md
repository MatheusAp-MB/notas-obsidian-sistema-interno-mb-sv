---
tipo: regra
dominio: 
status: ativa
criado: 02/08/2026
atualizado_em: 30/08/2026 17:06
relacionado: [Os 9 Tipos de Nota]
resumo: Claude avisa sozinho, sem esperar pedido, sempre que perceber algo relevante pra virar nota — decisão nova, regra de comportamento nova, descoberta técnica, ou estado de trabalho que se perderia numa compactação de conversa.
---

# Aviso Proativo Para Notas no Obsidian

**Resumo**: Claude avisa sozinho, sem esperar pedido, sempre que perceber algo relevante pra virar nota — decisão nova, regra de comportamento nova, descoberta técnica, ou estado de trabalho que se perderia numa compactação de conversa.

## Contexto

A memória de conversa é como RAM — volátil e sujeita a compactação, que já causou perda real de contexto no passado (ex: esquecer que havia acesso ao GitHub do projeto, informação que só voltou porque foi lembrada manualmente depois). O Obsidian é a memória persistente (o "HD") deste vault — só cumpre esse papel se for alimentado de forma proativa, não só quando o usuário lembra de pedir.

## O que diz

Claude deve avisar sempre que perceber algo relevante pra salvar como nota no Obsidian — nunca esperar o usuário pedir. "Relevante" inclui: decisão nova, regra de comportamento nova, descoberta técnica, e principalmente estado de trabalho que se perderia numa compactação de conversa (ex: acesso a repositório, convenção de nomenclatura, progresso em tarefa de várias sessões).

Isso vale pra qualquer um dos 9 tipos de nota (ver [[Os 9 Tipos de Nota]]) — inclusive `checkpoint`, cuja regra própria de atualização (nota que se atualiza no lugar, nunca gera nota nova a cada sessão) mora inteira naquela nota, não aqui.

## Por que é assim e não de outro jeito

Esperar o usuário lembrar de pedir foi a alternativa descartada — e é justamente o que já falhou antes: numa compactação de conversa, o que não foi salvo antes simplesmente deixa de existir pra Claude, sem aviso nenhum de que algo sumiu. Só um aviso proativo, feito no momento em que a informação ainda está fresca na conversa, garante que ela chegue ao "HD" antes de virar perda irreversível.

## Exemplo

Caso real que motivou esta regra: em uma sessão anterior, o acesso ao repositório GitHub do projeto foi mencionado e usado, mas nunca registrado como nota — depois de uma compactação, esse acesso "sumiu" do contexto de Claude, e precisou ser redescoberto manualmente. Hoje, um caso equivalente (ex: Claude descobre ou recebe um acesso/credencial novo, ou fecha uma frente de trabalho de várias sessões) dispara aviso imediato pra salvar como nota, sem esperar o usuário lembrar de pedir.

## Relacionado

- [[Os 9 Tipos de Nota]]
