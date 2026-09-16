---
tipo: descoberta
dominio: python
status: ativa
criado: 16/09/2026
atualizado_em: 16/09/2026 03:27
relacionado: [[Checkpoint - Empacotamento e Entrega do .exe]], [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]
resumo: "`gerar_exe.py` listava --add-data só pros apps antigos — o app novo integracao_mercado_livre (CSS/JS do Hub de Consulta) ficava de fora e quebraria estilo/ícones no .exe, mesmo funcionando normal em dev."
---

# Pasta static do App Novo Ficava de Fora do --add-data, Quebrando CSS e Ícones no .exe

**Contexto**: o app `integracao_mercado_livre` trouxe estáticos próprios (CSS do Hub de Consulta, `layout_consultar_pedido.css`). Ao revisar `devolucoes/management/commands/gerar_exe.py` pra garantir que a tela nova funcionaria no `.exe` compilado, a pasta `integracao_mercado_livre/static` não estava na lista de `--add-data` — só as pastas static dos apps mais antigos estavam.

**Por que isso quebraria de verdade**: confirmado cruzando `settings.py` e `urls.py` — o projeto não usa `STATICFILES_DIRS`/`STATIC_ROOT`/whitenoise; os estáticos são servidos por uma view própria (`servir_estatico`, via `staticfiles_serve(..., insecure=True)`) mesmo com `DEBUG=False`. Sem whitenoise coletando tudo automaticamente, cada pasta `static/` de app precisa aparecer explicitamente no `--add-data` do PyInstaller, senão simplesmente não vai pro `.exe` — não é uma suposição, é como o projeto já funciona hoje.

**Correção**: adicionada a entrada `"--add-data", "integracao_mercado_livre/static;integracao_mercado_livre/static",` na lista de `--add-data` do `gerar_exe.py`, na mesma convenção já usada pras pastas static dos outros apps.

**Validado**: Matheus confirmou "funcionou" no `.exe` recompilado — CSS e ícones do Hub de Consulta aparecendo normalmente.

## Relacionado

- [[Checkpoint - Empacotamento e Entrega do .exe]]
- [[PyInstaller — --hidden-import Resolve Import Dinâmico por String, --collect-submodules Não]]
