---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 27/09/2026
atualizado_em: 27/09/2026 18:26
relacionado: [Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando, Duvida - Estender ExigirDatabaseExplicito aos Outros 10 Comandos Nativos do Django com Risco de --database Silencioso]
resumo: "manage.py migrate (comando NATIVO do Django, fora do padrão ComandoComEmpresa) rodava sem exigir --database e caía silenciosamente no alias 'default' — que é uma cópia literal do banco 'magazine' na configuração deste projeto. CORRIGIDO: override do comando migrate via mixin que torna --database obrigatório, sem tocar no comportamento normal do comando (validado que não quebra o bootstrap de banco de teste do pytest-django, que sempre passa database= explicitamente)."
---

# Comando Nativo migrate Do Django Cai Silenciosamente no Banco Default Sem --database Obrigatorio

**Resumo**: mesmo depois da padronização de `--empresa` obrigatório em todo comando customizado (ver [[Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]]), o comando **nativo** `manage.py migrate` do Django continuava aceitando rodar sem nenhum `--database`, caindo silenciosamente no alias `'default'` — que neste projeto é uma cópia idêntica da configuração do banco `'magazine'`. Corrigido criando um override do `migrate` nativo que torna `--database` obrigatório.

> [!success] CORRIGIDO em 27/09/2026, 18:26
> **O quê**: `--database` passou a ser obrigatório em `manage.py migrate` — rodar sem a flag agora dá erro (`the following arguments are required: --database`) em vez de aplicar a migração silenciosamente no banco `default`.
> **Onde foi corrigido**: `core/management/commands/migrate.py` (novo) e `core/management/commands/_exigir_database_explicito.py` (novo, mixin reaproveitável).

## Contexto

O trabalho anterior (ver [[Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]]) tornou `--empresa` obrigatório em todos os comandos **customizados** que herdam de `ComandoComEmpresa`. Esse trabalho não cobria os comandos **nativos** do Django (`migrate`, `flush`, `dbshell`, etc.), que usam `--database` (não `--empresa`) e são definidos pelo próprio framework, fora do padrão do projeto.

Neste projeto, `DATABASES['default']` no `settings.py` é uma cópia byte-a-byte da configuração de `DATABASES['magazine']` (mesmo `NAME: 'sistema_interno_magazine'`) — herança do tempo antes do suporte a multi-empresa. Isso significa que qualquer comando nativo do Django rodado sem `--database` explícito aplica a ação **direto no banco de produção da Magazine**, sem nenhum aviso.

## O problema

Matheus rodou `poetry run python manage.py migrate` sem passar `--database` nem `--empresa`, esperando que desse erro (mesmo padrão dos comandos customizados) — e o comando rodou normalmente, aplicando a migração `mercado_livre.0029_...` no banco `default` (== Magazine) sem nenhum aviso:

```text
$ poetry run python manage.py migrate
Operations to perform:
  Apply all migrations: admin, agenda_videos, amazon, auth, contenttypes, ...
Running migrations:
  Applying mercado_livre.0029_alter_freteml_options_freteml_regime_and_more... OK
```

## O que levou à correção — o raciocínio até a causa raiz

1. Conferido que `migrate` é um comando **nativo** do Django (`django.core.management.commands.migrate`), não uma subclasse de `ComandoComEmpresa` — por isso ficou fora do trabalho de padronização anterior, que só tocou comandos customizados.
2. Confirmado em `django/core/management/__init__.py::get_commands()` que a resolução de comandos com mesmo nome favorece a ordem: built-ins do `django.core` primeiro, depois cada app em `reversed(apps.get_app_configs())` — ou seja, o app listado **primeiro** em `INSTALLED_APPS` vence por último no loop invertido. Verificado que `core` (app deste projeto) está listado logo depois dos apps de contrib do Django, confirmando que um arquivo `core/management/commands/migrate.py` sobrescreve o `migrate` nativo sem precisar de nenhuma configuração extra.
3. Lido `settings.py::DATABASES` e confirmado que `'default'` e `'magazine'` são configurações idênticas — o fallback silencioso do `migrate` nativo cai exatamente na mesma armadilha que motivou a decisão anterior sobre `--empresa`.
4. Testado (num projeto Django descartável, criado só pra validar a técnica) que um mixin que sobrescreve `add_arguments()` e localiza a `action` de `--database` dentro de `parser._actions` — trocando `action.default = None` e `action.required = True` — funciona exatamente como esperado: `argparse` passa a exigir a flag, com uma mensagem de erro limpa (`exit code 2`), sem precisar reimplementar nenhuma lógica do comando original.
5. Verificado, lendo o código-fonte do Django (`django/db/backends/base/creation.py::create_test_db()`), que o bootstrap do banco de teste do **pytest-django** sempre chama `call_command("migrate", ..., database=self.connection.alias, run_syncdb=True)` — ou seja, **sempre** passa `database=` explicitamente. Tornar a flag obrigatória no `migrate` nativo não quebra a suíte de testes. Confirmado também com um teste direto de `call_command()`: passar `database=` funciona normal, omitir levanta um `CommandError` limpo (não um crash).

## A correção

**Antes** — `manage.py migrate` era o comando nativo do Django, sem override nenhum, `--database` opcional com default `'default'`.

**Depois** — `core/management/commands/_exigir_database_explicito.py` (mixin reaproveitável):

```python
class ExigirDatabaseExplicito:
    def add_arguments(self, parser):
        super().add_arguments(parser)
        for action in parser._actions:
            if action.dest == 'database':
                action.default = None
                action.required = True
                break
```

`core/management/commands/migrate.py` (override do `migrate` nativo):

```python
from django.core.management.commands.migrate import Command as ComandoMigrateOriginal
from core.management.commands._exigir_database_explicito import ExigirDatabaseExplicito


class Command(ExigirDatabaseExplicito, ComandoMigrateOriginal):
    pass
```

## Exemplo de ponta a ponta

```text
$ poetry run python manage.py migrate
usage: manage.py migrate [-h] [--noinput] --database {default,magazine,samvale} [--fake] ...
manage.py migrate: error: the following arguments are required: --database
```

Com `--database=magazine` (ou `--database=samvale`) explícito, o comando roda normalmente, exatamente como antes.

## Relacionado

- [[Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]]
- [[Duvida - Estender ExigirDatabaseExplicito aos Outros 10 Comandos Nativos do Django com Risco de --database Silencioso]]
