---
tipo: descoberta
dominio: python
status: ativa
criado: 06/09/2026
atualizado_em: 06/09/2026 14:54
relacionado: [Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2), Checkpoint - Empacotamento e Entrega do .exe]
---

# core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo

**Contexto**: na Reforma Estrutural (ver [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]]), o plano era dar ao app `core` (compartilhado, com templates/static/views globais) seu próprio `urls.py` de app — mesmo padrão do Sistema Interno V2, que separa a pasta de settings (`projeto_sistema_interno_mb_sv`) do app `core`.

**Descoberta**: o Devolução foi criado com `django-admin startproject core` — ou seja, a pasta de settings do projeto inteiro (`settings.py`, `urls.py` raiz, `wsgi.py`, `asgi.py`) já se chamava `core` desde o início. Quando esse mesmo `core` também virou um app Django (registrado em `INSTALLED_APPS` pra ganhar templates/static/views compartilhados), os dois papéis colidiram: não dá pra ter um `core/urls.py` de app E um `core/urls.py` raiz do projeto ao mesmo tempo — são o mesmo arquivo.

**Solução**: em vez de manter um workaround (rota de home registrada direto no urlconf raiz, num path temporário), a pasta de settings foi renomeada pra `projeto_sistema_devolucao_mb_sv` (`git mv` nos 4 arquivos — `settings.py`, `urls.py`, `wsgi.py`, `asgi.py` — mais `manage.py` e `launcher.py` atualizados pra apontar pro novo nome). `core` ficou livre pra ser só o app compartilhado, com seu próprio `urls.py` de app — igual ao Sistema Interno V2.

**Por que importa**: qualquer projeto Django criado com `django-admin startproject <nome-do-app-compartilhado>` carrega esse mesmo risco — o nome escolhido na hora de criar o projeto raramente é pensado como "vai virar um app compartilhado depois". Vale nomear a pasta de settings com um nome de projeto (nunca de app) desde o início em projetos futuros.

## Relacionado

- [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]]
- [[Checkpoint - Empacotamento e Entrega do .exe]]
