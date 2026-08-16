---
tipo: descoberta
dominio: python
status: ativa
criado: 15/08/2026
atualizado_em: 15/08/2026 03:50
relacionado: [Redesenho do Popular Banco - Fontes de Dados e Escopo]
---

# Recriar Migration com Mesmo Nome Não Reseta o Histórico do Django

## O que aconteceu (achado real, 15/08/2026)

Durante a implementação do campo `ativo_no_erp` (ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]), uma migration foi gerada (`0007_produto_ativo_no_erp`), depois apagada do jeito errado — só o arquivo foi apagado, sem desfazer a migration no banco primeiro — e uma nova foi gerada com o MESMO nome. Resultado: `python manage.py migrate` respondia **"No migrations to apply"**, como se já tivesse rodado — mas o campo não existia de verdade no banco (confirmado com `SHOW COLUMNS`, que voltou vazio).

## Por que isso acontece — explicação simples

O Django não sabe se uma migration "já rodou" olhando o conteúdo do arquivo — ele olha só o NOME dela (`app` + nome do arquivo, ex: `produtos.0007_produto_ativo_no_erp`), guardado numa tabela interna chamada `django_migrations`. Se você apaga o arquivo de uma migration já aplicada sem antes desfazer ela (`python manage.py migrate <app> <migration_anterior>`), a LINHA correspondente continua na tabela `django_migrations` — órfã, sem arquivo correspondente. Se depois você cria um arquivo NOVO com o mesmo nome, o Django acha que ele já rodou (porque já existe uma linha com esse nome exato na tabela), mesmo que o conteúdo do arquivo novo seja diferente e nunca tenha sido executado de verdade contra o banco.

## Como foi resolvido, passo a passo

1. Confirmado com `SHOW COLUMNS FROM produtos_produto LIKE 'ativo_no_erp';` que o campo realmente não existia no banco — a fonte da verdade é sempre o banco, nunca o que o Django "acha" que já rodou.
2. Confirmado com `SELECT id, app, name FROM django_migrations WHERE app='produtos';` que sobravam 2 linhas órfãs (`0007_produto_ativo_no_erp` e `0008_remove_produto_ativo_no_erp` — esse último com o arquivo já apagado).
3. As 2 linhas apagadas direto na tabela (`DELETE FROM django_migrations WHERE id IN (...)`) — seguro fazer isso, porque é só a tabela de controle interna do Django, nunca dado do usuário.
4. `python manage.py migrate` rodado de novo — dessa vez aplicou de verdade, confirmado de novo com `SHOW COLUMNS`.

## Lição pra próxima vez (Cauã, Lucas, ou qualquer um)

Nunca apagar o arquivo de uma migration já aplicada sem antes rodar `python manage.py migrate <app> <migration_anterior_a_ela>` — isso desfaz a migration de verdade (reverte a mudança no banco E limpa a linha da tabela de controle no mesmo passo). Só depois disso é seguro apagar o arquivo.

Se isso já aconteceu (arquivo apagado sem desfazer primeiro, como neste caso), o jeito de confirmar e corrigir é sempre o mesmo: checar o banco de verdade (`SHOW COLUMNS`/`DESCRIBE`), checar a tabela `django_migrations`, nunca confiar só no que `showmigrations`/`migrate` reportam quando alguma coisa parecer estranha (tipo "no migrations to apply" logo depois de gerar uma migration nova).

## Relacionado

- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
