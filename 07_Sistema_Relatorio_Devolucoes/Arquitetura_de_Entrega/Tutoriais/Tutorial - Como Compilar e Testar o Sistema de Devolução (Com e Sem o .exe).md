---
tipo: tutorial
dominio: python
status: ativa
criado: 02/09/2026
atualizado_em: 05/09/2026 00:56
relacionado: [Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja, Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)

Guia rápido pra testar tudo que foi implementado até 02/09/2026 (Nova Devolução funcional + PDF real) de 2 formas: rodando direto o código (mais rápido, bom pra desenvolvimento) e rodando o `.exe` empacotado de verdade (o jeito que o usuário final vai usar).

## Sem o .exe (modo desenvolvimento — mais rápido)

1. Abrir um terminal na pasta do projeto.
2. Se for a primeira vez testando nesse computador depois de hoje, ou se alguma dependência mudou: `poetry install`.
3. Subir o servidor — 2 opções, dependendo do que você quer testar (esclarecido em 05/09/2026):
   - `poetry run python manage.py runserver` — a mais rápida pra codar: reinicia sozinho toda vez que você salva um arquivo `.py` (view, model, settings). Não roda `migrate` sozinho (rode `poetry run python manage.py migrate` manualmente se tiver migration nova) nem abre o navegador — acessa `http://127.0.0.1:8000/` manualmente.
   - `poetry run python launcher.py` — mesma experiência do `.exe` de verdade, mas sem compilar: abre o navegador sozinho, mostra a tela de carregamento, ícone na bandeja, e roda `migrate` automaticamente nos 2 bancos (magazine/samvale) antes de subir. Não reinicia sozinho se você mudar um `.py` — precisa parar (Ctrl+C ou "Encerrar" no ícone da bandeja) e rodar de novo.

   Mudança de HTML/CSS/JS aparece do mesmo jeito nos 2 (só dar refresh no navegador) — a diferença acima só importa pra mudança de código Python.
4. Testar os 3 fluxos:
   - **Produtos**: lista os produtos, cadastra um novo com foto.
   - **Catálogo** (clicando num produto ou buscando o EAN): edita nome/marca/EAN/foto do produto, adiciona/remove peça.
   - **Nova Devolução**: busca um EAN, marca as peças (checkbox ou "quantos vieram"), escreve alguma anotação, clica em "PDF completo" — o PDF deve abrir na mesma aba.

## Quando você realmente precisa gerar o .exe (esclarecido em 05/09/2026)

Editar HTML/template, view, model ou qualquer comportamento do site **não** exige gerar o `.exe` de novo — testa direto com uma das 2 opções acima. Só vale a pena gerar o `.exe` quando: (1) for entregar uma atualização de verdade pra usuária final usar, ou (2) mudar algo que afeta especificamente **como o empacotamento funciona** — nova dependência, um módulo novo referenciado só por string (mesmo caso de `core/middleware.py`, que precisou de `--hidden-import` explícito — ver linha do tempo de 05/09/2026 em [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]), ou uma pasta nova de template/estático fora de `devolucoes/templates`/`devolucoes/static`/`loading.html` (que já são copiadas inteiras a cada build).

## Com o .exe (build real — o jeito que o usuário final abre)

1. Se o servidor de desenvolvimento (`runserver`) estiver rodando, para ele antes (evita os dois brigarem pela mesma porta 8000).
2. Gerar o build — desde 04/09/2026, reunido num comando de management só (ver `devolucoes/management/commands/gerar_exe.py`, que já inclui todas as flags descobertas como necessárias):
   ```
   poetry run python manage.py gerar_exe
   ```
3. Ir até a pasta `dist/SistemaDevolucoes/` e dar duplo clique em `SistemaDevolucoes.exe` — exatamente como o usuário final abriria.
4. Confirmar o básico de sempre: tela "Iniciando o sistema..." aparece e troca sozinha pro site real, ícone aparece na bandeja do Windows.
5. **Atenção especial** (é o ponto mais novo, nunca testado empacotado antes): testar o "PDF completo" dentro do `.exe`. O `xhtml2pdf` só foi testado até agora rodando com `runserver` — é possível que falte alguma coisa no empacotamento (fonte, arquivo de dados de alguma dependência) que só aparece quando roda pelo `.exe` de verdade. Se o PDF não abrir ou der erro aqui, é isso que pode estar faltando — anote o erro exato que aparecer pra investigarmos.
6. Detalhe importante, mudou em 05/09/2026: o banco (desde 04/09/2026) e agora também a pasta de mídia (fotos de produto/peça) são **os mesmos** em desenvolvimento e no `.exe` — não existe mais nenhuma distinção por ambiente. A pasta de mídia vem da variável `DADOS_DIR` no `.env` (cada máquina define o próprio caminho fixo) — visível e escolhida por você, no lugar da pasta escondida `%APPDATA%\SistemaDevolucoes\` usada antes. Confirmado (05/09/2026): produto cadastrado com foto em `runserver` aparece certinho também dentro do `.exe`, sem precisar copiar nada.
7. Testar também o que já era validado antes: abrir o `.exe` uma 2ª vez não deve abrir um segundo processo (trava de instância única), e o menu do ícone de bandeja (Abrir no navegador / Encerrar) deve funcionar.

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Geração do PDF de Devolução — xhtml2pdf, Sem Persistência e Fluxo por GET]]
- [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]
