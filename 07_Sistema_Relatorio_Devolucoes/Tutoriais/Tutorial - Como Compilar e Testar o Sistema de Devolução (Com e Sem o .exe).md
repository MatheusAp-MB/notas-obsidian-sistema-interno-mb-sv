---
tipo: tutorial
dominio: python
status: ativa
criado: 02/09/2026
atualizado_em: 02/09/2026 03:14
relacionado: [Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja, Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)

Guia rápido pra testar tudo que foi implementado até 02/09/2026 (Nova Devolução funcional + PDF real) de 2 formas: rodando direto o código (mais rápido, bom pra desenvolvimento) e rodando o `.exe` empacotado de verdade (o jeito que o usuário final vai usar).

## Sem o .exe (modo desenvolvimento — mais rápido)

1. Abrir um terminal na pasta do projeto.
2. Se for a primeira vez testando nesse computador depois de hoje, ou se alguma dependência mudou: `poetry install` (isso já instala o `xhtml2pdf` novo, que está no `pyproject.toml`).
3. Garantir que o banco tem a coluna nova do produto: `poetry run python manage.py migrate`.
4. Subir o servidor: `poetry run python manage.py runserver`.
5. Abrir `http://127.0.0.1:8000/` no navegador.
6. Testar os 3 fluxos:
   - **Produtos**: lista os produtos, cadastra um novo com foto.
   - **Catálogo** (clicando num produto ou buscando o EAN): edita nome/marca/EAN/foto do produto, adiciona/remove peça.
   - **Nova Devolução**: busca um EAN, marca as peças (checkbox ou "quantos vieram"), escreve alguma anotação, clica em "PDF completo" — o PDF deve abrir na mesma aba.

## Com o .exe (build real — o jeito que o usuário final abre)

1. Se o servidor de desenvolvimento (`runserver`) estiver rodando, para ele antes (evita os dois brigarem pela mesma porta 8000).
2. Gerar o build (comando completo, com todos os `--add-data` que já foram descobertos como necessários — ver [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]):
   ```
   poetry run pyinstaller --onedir --noconsole --name SistemaDevolucoes --add-data "loading.html;." --add-data "devolucoes/templates;devolucoes/templates" --add-data "devolucoes/static;devolucoes/static" --hidden-import=pystray._win32 launcher.py
   ```
3. Ir até a pasta `dist/SistemaDevolucoes/` e dar duplo clique em `SistemaDevolucoes.exe` — exatamente como o usuário final abriria.
4. Confirmar o básico de sempre: tela "Iniciando o sistema..." aparece e troca sozinha pro site real, ícone aparece na bandeja do Windows.
5. **Atenção especial** (é o ponto mais novo, nunca testado empacotado antes): testar o "PDF completo" dentro do `.exe`. O `xhtml2pdf` só foi testado até agora rodando com `runserver` — é possível que falte alguma coisa no empacotamento (fonte, arquivo de dados de alguma dependência) que só aparece quando roda pelo `.exe` de verdade. Se o PDF não abrir ou der erro aqui, é isso que pode estar faltando — anote o erro exato que aparecer pra investigarmos.
6. Detalhe importante: o `.exe` usa um banco e uma pasta de mídia separados, em `%APPDATA%\SistemaDevolucoes\` — diferente do banco que você usa em desenvolvimento. Então o `.exe` provavelmente vai abrir com "nenhum produto cadastrado" na primeira vez. Pra testar com dados de verdade (foto de produto e de peça aparecendo no PDF), cadastre um produto de novo por ali, ou copie manualmente `db.sqlite3` e a pasta `media/` da pasta do projeto pra dentro de `%APPDATA%\SistemaDevolucoes\` antes de abrir o `.exe`.
7. Testar também o que já era validado antes: abrir o `.exe` uma 2ª vez não deve abrir um segundo processo (trava de instância única), e o menu do ícone de bandeja (Abrir no navegador / Encerrar) deve funcionar.

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]
- [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]
