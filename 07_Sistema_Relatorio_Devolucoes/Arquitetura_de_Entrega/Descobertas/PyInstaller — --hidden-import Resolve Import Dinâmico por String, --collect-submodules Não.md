---
tipo: descoberta
dominio: python
status: ativa
criado: 05/09/2026
atualizado_em: 05/09/2026 17:46
relacionado: [Checkpoint - Empacotamento e Entrega do .exe, 2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]
---

# PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não

**Contexto**: validar `mysqlclient` dentro do `.exe` exigia que o PyInstaller empacotasse `core/middleware.py` e `core/database_router.py`, referenciados só como string em `MIDDLEWARE`/`DATABASE_ROUTERS` do Django (import dinâmico, nunca um `import` literal).

**Tentativa errada**: `--collect-submodules=core` não funcionou — o log do build não mostrava nenhuma tentativa de analisar `core`, nem sucesso nem erro. Investigado: era cache do PyInstaller sendo reaproveitado entre builds (log pulava direto pra PYZ/PKG/EXE em menos de 1 segundo) — corrigido com `--clean`, forçando análise do zero. Mesmo com análise real acontecendo depois, `core` continuava sem aparecer em lugar nenhum.

**Descoberta**: consultando a documentação oficial do PyInstaller, `--collect-submodules` serve pra pacote tipo plugin (vários arquivos carregados por nome, caso do `django.core.management.commands`) — pra módulo só referenciado dinamicamente por string única (caso do Django com `MIDDLEWARE`/`DATABASE_ROUTERS`), a flag certa é `--hidden-import` no módulo exato. Trocado pra `--hidden-import=core.middleware` e `--hidden-import=core.database_router` — funcionou, validado em 2 etapas (build de diagnóstico com `--debug=imports`, depois build final com `--noconsole`).

**Por que importa**: nem toda forma de "import não visível no código" pede a mesma flag do PyInstaller — depende de COMO o import dinâmico acontece (1 módulo nomeado direto vs. um pacote inteiro carregado por convenção).

## Relacionado

- [[Checkpoint - Empacotamento e Entrega do .exe]]
- [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]
