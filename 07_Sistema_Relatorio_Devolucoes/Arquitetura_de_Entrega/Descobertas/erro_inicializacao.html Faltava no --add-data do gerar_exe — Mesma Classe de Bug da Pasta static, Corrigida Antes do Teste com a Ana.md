---
tipo: descoberta
dominio: python
status: ativa
criado: 21/09/2026
atualizado_em: 21/09/2026 02:41
relacionado: [[Pasta static do App Novo Ficava de Fora do --add-data, Quebrando CSS e Ícones no .exe]], [[Checkpoint - Empacotamento e Entrega do .exe]]
resumo: "Matheus pediu uma análise profunda do código que gera o .exe pra garantir que estaria funcional pra Ana usar no dia seguinte. launcher.py tinha ganhado, no mesmo dia, uma tela de erro de inicialização (abrir_tela_de_erro, usando launcher_recursos/erro_inicializacao.html) pra não morrer em silêncio se o migrate falhar no boot (ex: MySQL fora do ar) -- build é --noconsole, sem essa tela o processo simplesmente encerra sem mostrar nada. Só que gerar_exe.py nunca ganhou o --add-data correspondente pra esse HTML -- mesma classe de bug já documentada nesta pasta pra integracao_mercado_livre/static (16/09/2026): dentro do .exe empacotado, se esse cenário realmente acontecesse, abrir_tela_de_erro tentaria abrir um arquivo que não existe no build (FileNotFoundError, sem try/except em volta), voltando exatamente pro problema que a tela foi criada pra evitar -- e sem nenhum aviso, porque o build não tem console. Corrigido com 1 linha adicionada em gerar_exe.py (commit 106c46b). [ATENÇÃO] -> esse fix só vale pro PRÓXIMO build -- o .exe que já estava pronto não mudou sozinho. Matheus rodou gerar_exe de novo depois da correção e testou o novo .exe com sucesso, incluindo as fotos em miniatura."
---

# erro_inicializacao.html Faltava no --add-data do gerar_exe — Mesma Classe de Bug da Pasta static, Corrigida Antes do Teste com a Ana

## Pedido que originou a investigação

Matheus pediu, antes de encerrar por aquele dia: "clone novamente o repo garanta que está no último commit, e analise profundamente o código que gera o .exe / para eu ter certeza que o .exe estará funcional para ela usar amanhã." Repo clonado fresco (`origin/main`), analisados em detalhe `gerar_exe.py`, `launcher.py`, `settings.py` e `urls.py`.

## O que mudou em launcher.py no mesmo dia

`launcher.py` ganhou, em 21/09/2026, uma proteção nova: antes, uma falha no `call_command("migrate", ...)` durante o boot (ex.: MySQL fora do ar na hora de abrir o `.exe`) derrubava o processo inteiro sem nenhum aviso — o build é `--onedir --noconsole`, não existe janela nenhuma pra mostrar um erro. A correção envolveu um `try/except` em volta do `migrate` no `if __name__ == "__main__":`, chamando `abrir_tela_de_erro(erro)` — que abre `launcher_recursos/erro_inicializacao.html` via `webbrowser.open`, no mesmo mecanismo já usado por `abrir_tela_de_carregamento` (arquivo temp + navegador).

## O bug encontrado — mesma classe já documentada nesta pasta

Revisando `devolucoes/management/commands/gerar_exe.py` linha por linha contra os recursos que `launcher.py` realmente usa: `erro_inicializacao.html` **nunca foi adicionado** à lista de `--add-data` do PyInstaller — só `loading.html` e `icone_app.ico` estavam lá. Mesma classe de bug já registrada em [[Pasta static do App Novo Ficava de Fora do --add-data, Quebrando CSS e Ícones no .exe]] (16/09/2026, pra `integracao_mercado_livre/static`): o PyInstaller só empacota o que é listado explicitamente em `--add-data` — sem whitenoise, nada entra sozinho.

**Por que isso seria grave se acontecesse de verdade**: dentro do `.exe` empacotado, se o cenário que a tela de erro foi criada pra cobrir realmente acontecesse (`migrate` falhando no boot), `abrir_tela_de_erro` tentaria abrir um arquivo que não existe dentro do build — `FileNotFoundError`, sem nenhum `try/except` em volta dessa chamada específica. Como o build é `--noconsole`, o processo morreria em silêncio de novo — exatamente o problema que a tela de erro tinha acabado de ser criada pra evitar, só que agora escondido atrás de uma proteção que parecia existir mas não empacotava.

## Correção

Uma linha adicionada em `gerar_exe.py`, logo depois da entrada de `icone_app.ico`:

```python
"--add-data", "launcher_recursos/erro_inicializacao.html;launcher_recursos",
```

Commit `106c46b` (21/09/2026, 02:27:00 -0300) — confirmado via `git show origin/main:devolucoes/management/commands/gerar_exe.py` batendo exatamente com o proposto.

## [ATENÇÃO] — só vale pro próximo build

Esse fix protege builds futuros. O `.exe` que já estava pronto pra Ana usar no dia seguinte não muda sozinho — precisa rodar `gerar_exe` de novo e levar a nova pasta `dist/SistemaDevolucoes/` pra máquina de produção. Esse risco foi sinalizado explicitamente no relatório da análise.

## Validado

Matheus rodou `gerar_exe` de novo depois de aplicar a correção, e testou o `.exe` recompilado com sucesso — confirmou inclusive que as fotos em miniatura (funcionalidade do mesmo dia, ver [[Proxy de Anexo com Bearer Token e Miniatura em Lightbox Substituem o Ícone Clicável no Chat de Mediação]]) funcionaram dentro do build empacotado.

## Relacionado

- [[Pasta static do App Novo Ficava de Fora do --add-data, Quebrando CSS e Ícones no .exe]]
- [[Checkpoint - Empacotamento e Entrega do .exe]]
