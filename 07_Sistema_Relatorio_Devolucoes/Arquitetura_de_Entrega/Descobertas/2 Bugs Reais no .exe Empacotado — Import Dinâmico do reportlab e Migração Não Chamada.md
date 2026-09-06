---
tipo: descoberta
dominio: python
status: ativa
criado: 05/09/2026
atualizado_em: 05/09/2026 17:46
relacionado: [Checkpoint - Empacotamento e Entrega do .exe, PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]
---

# 2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada

**Contexto**: testando a tela "Nova Devolução" dentro do `.exe` empacotado (nunca acontece via `runserver`), o servidor caiu 2 vezes seguidas, com causas diferentes.

**Descoberta 1 — import dinâmico do `reportlab` não detectado pelo PyInstaller**: `ModuleNotFoundError: No module named 'reportlab.graphics.barcode.code128'`. O `xhtml2pdf` carrega esse módulo do `reportlab` importando por string em tempo de execução, não por `import` literal no código — o PyInstaller só empacota o que consegue enxergar analisando o texto do código, então esse tipo de import passa despercebido.

**Descoberta 2 — banco do `.exe` sem migração aplicada**: depois de corrigir a 1ª, apareceu `django.db.utils.OperationalError: no such table: devolucoes_produto`. Causa: o caminho do banco já estava correto, mas `launcher.py` nunca chamava a migração do Django contra ele — um banco novo (1ª execução, ou depois de recompilar) fica sem nenhuma tabela.

**Correção e teste real**: ambos corrigidos e testados de ponta a ponta em 05/09/2026 (`call_command("migrate")` no `launcher.py` antes de subir o servidor; solução do import dinâmico documentada em [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]) — ver linha do tempo em [[Checkpoint - Empacotamento e Entrega do .exe]].

## Relacionado

- [[Checkpoint - Empacotamento e Entrega do .exe]]
- [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]
