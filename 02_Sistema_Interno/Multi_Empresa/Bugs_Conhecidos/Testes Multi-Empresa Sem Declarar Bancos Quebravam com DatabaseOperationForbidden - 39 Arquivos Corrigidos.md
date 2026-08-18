---
tipo: bug_conhecido
dominio: 
status: corrigido
criado: 18/08/2026
atualizado_em: 18/08/2026 15:40
relacionado: [Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao), Disciplina de Testes Automatizados]
---

# Testes Multi-Empresa Sem Declarar Bancos Quebravam com DatabaseOperationForbidden — 39 Arquivos Corrigidos

## Contexto

**O QUÊ**: depois que a arquitetura de 2 bancos separados (Magazine e Samvale) entrou em vigor de verdade (ver [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]), qualquer teste automatizado que crie ou leia um dado "roteado por empresa" (por exemplo, um `Produto`) precisa dizer explicitamente, na própria marcação do teste, quais bancos ele tem permissão de tocar. Sem essa declaração, o teste quebra com o erro:

```
django.test.testcases.DatabaseOperationForbidden
```

Esta nota documenta o achado sistêmico (39 arquivos de teste afetados), a correção aplicada e — o ponto mais importante — **por que a correção foi feita arquivo por arquivo, nunca por uma solução automática única**.

## Por que isso acontece — o mecanismo técnico

**O QUÊ é o `EmpresaRouter`**: é a classe em `core/database_router.py` responsável por decidir, pra cada operação do ORM do Django, em qual banco de dados ela deve realmente acontecer — `'magazine'` ou `'samvale'` — baseado em qual empresa está ativa no momento (via `core.empresa.obter_empresa_ativa()`, que lê a sessão do navegador ou a flag `--empresa` de um comando de terminal). Alguns apps do Django (`sessions`, `admin`, `contenttypes`, `auth` — a constante `APPS_SEMPRE_COMPARTILHADOS`) não passam por esse roteamento, porque são estruturais e iguais nas 2 empresas.

**O QUÊ é a marcação `@pytest.mark.django_db`**: é a marcação do `pytest-django` que autoriza um teste a tocar o banco de dados durante a execução (sem ela, qualquer acesso ao ORM levanta erro, de propósito — testes não deveriam precisar de banco a menos que declarem isso). Por padrão, sozinha, essa marcação só concede acesso ao alias `'default'`.

**Onde mora o problema**: com o `EmpresaRouter` ativo, qualquer teste que crie um `Produto` (ou qualquer outro modelo roteado por empresa) precisa que o pytest-django autorize explicitamente os aliases `'magazine'` e `'samvale'` também — não só o `'default'`. Isso se faz assim:

```python
@pytest.mark.django_db(databases=['default', 'magazine', 'samvale'])
def test_alguma_coisa_com_produto():
    ...
```

Sem o argumento `databases=[...]`, um teste que tentasse criar um `Produto` batia direto no erro `DatabaseOperationForbidden` — o pytest-django recusa a operação porque ela tentaria escrever num banco (`'magazine'` ou `'samvale'`) que a marcação nunca autorizou.

## Por que a correção NÃO foi um hook automático em `conftest.py`

Esse era o caminho mais rápido tecnicamente — um hook de coleta de testes (`pytest_collection_modifyitems`, por exemplo) que injeta `databases=[...]` automaticamente em **todo** teste marcado com `django_db`, sem precisar tocar em nenhum dos 39 arquivos. Essa opção foi **conscientemente rejeitada**.

> [!danger] O motivo da rejeição: essa marcação hoje funciona como uma rede de segurança contra "dado sujo" entre empresas
> Se um hook global injetasse `databases=['default', 'magazine', 'samvale']` automaticamente em todo teste, **qualquer teste futuro que ainda não devesse tocar dado de empresa nenhuma passaria a ter acesso liberado aos 3 bancos, silenciosamente, pra sempre**. A marcação explícita, hoje, serve como um alerta automático: se alguém escrever um teste novo que cria um `Produto` sem lembrar de declarar `databases=[...]`, o teste quebra imediatamente com um erro claro — em vez de, por exemplo, o teste rodar "com sucesso" só que gravando sem querer no banco errado, ou vazando estado de uma empresa pra dentro da suíte de outra sem nenhum aviso. Um hook global removeria essa rede de segurança de forma permanente e invisível, pra todos os testes que ainda vão ser escritos no futuro — o risco de "dados sujos" (contaminação de teste entre Magazine e Samvale, sem detecção) pesou mais do que a economia de tempo de não editar 39 arquivos na mão.

Por isso a correção escolhida foi: **editar cada arquivo de teste, explicitamente, adicionando `databases=[...]` só onde de fato é necessário** — preservando a marcação como uma checagem real, não uma formalidade automática.

## Como foi corrigido, na prática

1. **Identificação**: 39 arquivos de teste no total precisavam da correção. Desses, **3 já tinham sido corrigidos antes**, individualmente, ao longo do próprio trabalho desta sessão (`test_nivel_3__verificador.py`, `test_nivel_5__verificador_drive.py`, `test_nivel_5__drive_leitura.py`) — encontrados e corrigidos um a um, antes de perceber que o padrão se repetia sistematicamente pelos outros 36.
2. **Correção dos 36 restantes**: em vez de editar cada 1 manualmente outra vez, foi gerado um script de correção único (`aplicar_fix_multi_empresa_testes.py`) — uma substituição de texto exata (não uma regra genérica ou regex ampla), aplicada arquivo por arquivo, sobre os 36 casos identificados.
3. **Execução e confirmação**: o usuário rodou o script localmente (nunca o Claude — ver [[Disciplina de Testes Automatizados]], regra "Claude nunca executa"), e o terminal confirmou `[OK]` pros 36 arquivos corrigidos e `[AVISO]` (pulado com segurança, sem duplicar a correção) pros 3 que já estavam certos.
4. **Script descartado depois de usado**: `aplicar_fix_multi_empresa_testes.py` foi tratado como uma ferramenta de uso único — diferente de `autorizar_drive_oauth.py` (ferramenta permanente da descoberta sobre OAuth), este script resolveu um problema mecânico de um momento específico e não precisa continuar existindo no repositório depois de aplicado.

## Exemplo concreto — antes e depois

> [!failure] ANTES (o padrão problemático, repetido em 39 arquivos)
> ```python
> @pytest.mark.django_db
> def test_produto_e_criado_corretamente():
>     produto = Produto.objects.create(ean='7899947306688', titulo='Ortho Pauher')
>     assert produto.id is not None
> ```
> Este teste quebra com `DatabaseOperationForbidden` assim que tenta criar o `Produto`, porque `Produto` é um modelo roteado por empresa e a marcação só autorizou o alias `'default'`.

> [!success] DEPOIS (correção aplicada)
> ```python
> @pytest.mark.django_db(databases=['default', 'magazine', 'samvale'])
> def test_produto_e_criado_corretamente():
>     produto = Produto.objects.create(ean='7899947306688', titulo='Ortho Pauher')
>     assert produto.id is not None
> ```

## Commit e status

Correção commitada e enviada pro repositório remoto (branch `dev`):

```
ad2279b — fix(testes): declara databases=[...] em todo django_db multi-empresa que faltava
```

## Checklist desta nota

- [x] Explica `EmpresaRouter`, `@pytest.mark.django_db` e `databases=[...]` na primeira aparição, sem assumir conhecimento prévio.
- [x] Explica o porquê da rejeição da alternativa mais rápida (hook global), não só o quê foi feito.
- [x] Exemplo concreto de antes/depois, com nome de modelo e dado real (EAN `7899947306688`).
- [x] Cita arquivo real (`core/database_router.py`, `aplicar_fix_multi_empresa_testes.py`) e commit real (`ad2279b`).
- [x] Fecha com o estado confirmado (36 `[OK]` + 3 `[AVISO]`, commit enviado).

## Relacionado

- [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]
- [[Disciplina de Testes Automatizados]]
