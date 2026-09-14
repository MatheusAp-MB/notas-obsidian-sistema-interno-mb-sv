---
tipo: decisao
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 22:34
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica, Padrao de Qualidade e Clareza Estrutural do Repositorio, Estrutura de Arquivo e Classe Python]
---

# Decisão: App `impostos` Será Reorganizado em Entrada e Saída, Começando por `models.py` Sem Risco de Migration

**Resumo**: Matheus apontou um problema mais crítico que qualquer etapa isolada do roteiro de Impostos de Saída: "impostos de entrada e saída devem estar se misturando... falta deixar claro em pastas e subpastas organizadas... o que é o que... e qual arquivo tem qual responsabilidade". A hipótese de acoplamento real foi auditada arquivo por arquivo antes de qualquer decisão — o resultado foi zero classes ou funções genuinamente compartilhadas entre entrada e saída. O problema é 100% de organização física de arquivo, não de arquitetura lógica. Decidida uma reorganização em 4 passos, cada um confirmado antes de executar, começando pelo mais seguro (`models.py` → pacote `models/`).

> [!success] Reorganização concluída — 13/09/2026
> Os 4 passos confirmados de verdade no repositório real do Matheus, todos em 13/09: `models.py`, `funcoes_auxiliares/`, `views.py` (escopo revisado — `templates/`/`static/` saíram do plano) e `tests/`. App `impostos` inteiro agora reflete em pastas a mesma separação entrada/saída que já existia na lógica desde o início. Detalhe de cada passo abaixo.

> [!info] Nota sobre os horários acima
> Os passos de `views.py` e `tests/` estavam originalmente datados de 14/09/2026 — timestamp de sandbox (UTC), nunca confirmado com o Matheus na hora. Corrigido em 13/09/2026, 22:34 pra 13/09/2026 (offset de -3h, sandbox UTC vs. Matheus em horário de Brasília). Detalhe completo do achado em [[Checkpoint - Inicio da Estrutura de Impostos de Saida]].

## O achado que motivou a decisão

Antes de propor qualquer estrutura nova, o app `impostos` inteiro foi auditado à procura de acoplamento real entre entrada e saída (não só "os arquivos estão bagunçados", mas "existe alguma classe ou função que as duas pontas realmente compartilham?"):

| Arquivo/pasta | Composição real | Compartilhado? |
|---|---|---|
| `models.py` | 13 classes — 8 entrada, 5 saída | Não — nenhuma classe usada pelas duas pontas |
| `funcoes_auxiliares/` | 13 arquivos — ~6 entrada, ~7-8 saída | Não |
| `descritores_impostos.py` | 100% entrada | Não |
| `templates/impostos/` | 1 entrada, 6 saída | Não |
| `static/impostos/` | 2 entrada, 6 saída | Não |
| `views.py` | 8 funções — 2 entrada, 6 saída, hoje num arquivo só | Não |
| `management/commands/` | 4 comandos — 100% saída já | Não — não há comando de entrada hoje |
| `tests/` | 2 arquivos — 100% entrada | Não |

Conclusão: a separação entrada/saída já existe na cabeça do código (cada classe, função e view sabe exatamente a qual lado pertence) — só não existe nas pastas. Isso confirma a frase do Matheus ("ao aplicar ele 'Derrete'... pq os arquivos em si estão bagunçados") como descrição exata do problema: a lógica é coerente, o arquivo físico não expõe essa coerência.

## Precedente já usado em outro lugar do repositório

Levantamento de todos os 13 apps Django do projeto: 9 deles (`produtos`, `mercado_livre`, `precificacao`, `raia`, `shopee`, `tiktok`, `magalu`, `amazon`, `agenda_videos`) já usam pacote `models/` (1 arquivo por classe + `__init__.py` reexportando) em vez de `models.py` único. `precificacao/models/` vai além e usa subpastas por marketplace — precedente direto para separar `impostos/models/` em `entrada/`/`saida/`. Só `impostos`, `core`, `integracao_sysemp` e `marketplaces` ainda usam `models.py` plano.

Achado adicional que reforça a decisão: o próprio vault já trata entrada e saída como domínios separados fisicamente — `Impostos_Entrada` vive em `04_Integracao_Sysemp/` e `Impostos_Saida` vive em `03_Sistema_Interno/`, pastas diferentes, desde a abertura desta frente em 10/09/2026. O código nunca acompanhou essa mesma separação. A reorganização também está alinhada com as regras já registradas em [[Padrao de Qualidade e Clareza Estrutural do Repositorio]] e [[Estrutura de Arquivo e Classe Python]] (núcleo de engenharia do repositório) — não é um padrão novo, é o padrão já vigente sendo aplicado a um app que ainda não tinha sido migrado.

## Garantia técnica: por que isso não quebra nada

Django rastreia cada model por `app_label.NomeDaClasse` (registrado no `AppConfig`), nunca pelo caminho do arquivo `.py`. Uma migration referencia `impostos.IcmsNcmUf`, não `impostos/models.py`. Então mover uma classe de arquivo é seguro por definição, contanto que `from impostos.models import X` continue funcionando idêntico em qualquer lugar do repo que já importa assim — o que só depende do `__init__.py` do pacote novo reexportar cada classe.

## Plano em 4 passos — cada um só começa depois do anterior confirmado

1. **`models.py` → `models/entrada/` + `models/saida/`** — o mais seguro dos 4: nenhum import externo muda (`from impostos.models import X` é igual antes e depois), risco é só de dentro do próprio arquivo (referências cruzadas entre classes). **Concluído — ver seção abaixo.**
2. **`funcoes_auxiliares/` → `funcoes_auxiliares/entrada/` + `funcoes_auxiliares/saida/`** — mais arriscado que o Passo 1: o resto do repo importa por caminho de submódulo (`from impostos.funcoes_auxiliares.importacao_icms_ncm import X`), não só pelo pacote — mover o arquivo exige reescrever cada import que aponta pro caminho antigo em todo o repositório, não só recriar um `__init__.py`. **Concluído — ver seção abaixo.**
3. **`views.py` → pacote `views/` plano (`entrada.py` + `saida.py`)** — escopo revisado em 13/09/2026 depois de auditar a convenção do resto do repo (ver seção abaixo): `templates/impostos/` e `static/impostos/` **ficam de fora**, já estão no padrão do repo e não precisam mudar. Isso baixou o risco do passo de "o maior dos 4" pra o mesmo nível do Passo 1 (só reexport, nenhum import externo muda). **Concluído — ver seção abaixo.**
4. **`tests/` → `tests/entrada/`** — trivial, hoje os 2 arquivos existentes já são 100% entrada. **Concluído — ver seção abaixo.**

`management/commands/` fica de fora do plano: Django não permite organizar comandos em subpastas (é limitação do framework, não escolha) — os 4 comandos hoje já são 100% saída, então não há mistura ali pra resolver.

## Passo 1 — `models.py` → `models/entrada/` + `models/saida/` (concluído)

Como o repositório real do Matheus não é alcançável a partir desta sessão (só a pasta do vault Obsidian está conectada), a divisão foi entregue como script Python (`dividir_models_impostos.py`) pra ele rodar localmente — pedido explícito do Matheus, dado o tamanho da mudança: "é grande demais pra eu fazer na mão... preciso movimentar e criar as pastas por comando."

**Testado antes de entregar**, numa cópia isolada (não no repositório real): rodado dry-run → aplicado → 3 bugs reais encontrados e corrigidos via `manage.py check` (import de classe-base faltando; import de classe referenciada só como campo, não como herança; falso-positivo de import circular causado por menção a nome de classe dentro de comentário, não código real). Prova final, mais rigorosa que só "importa sem erro": dump completo do `_meta` de cada model Django (nome de tabela, `app_label`, `unique_together`, cada campo com tipo/`max_length`/`null`) comparado entre a versão original e a dividida — **resultado idêntico, byte a byte, zero diferença de schema**.

**Confirmado no repositório real do Matheus em 13/09/2026**: dry-run bateu exatamente com o previsto (13 classes, mesma divisão de arquivo por arquivo); `--apply` executado; `python manage.py check` → `System check identified no issues (0 silenced)`; `python manage.py makemigrations --check --dry-run` → `No changes detected`. Passo 1 fechado, sem nenhuma migration gerada.

## Passo 2 — `funcoes_auxiliares/` → `entrada/` + `saida/` (concluído)

Entregue como script (`dividir_funcoes_auxiliares_impostos.py`), mesmo padrão do Passo 1. Levantamento prévio (via scanner de repositório inteiro, não grep manual) achou 48 linhas de import de `impostos.funcoes_auxiliares.X` em 34 arquivos — incluindo 2 imports internos feitos DENTRO de função (`exibicao_icms_por_ncm.py` ↔ `importacao_icms_ncm.py`/`preenchimento_impostos_saida.py`, deliberados pra evitar import circular) que um grep ancorado no início da linha não pega. Todas as 48 linhas são entrada→entrada ou saída→saída — reforça de novo que a mistura é só de pasta.

**Testado antes de entregar**: sintaxe de todo o repo ok; as 48 linhas reescritas testadas com `exec()` real (mais direto que `manage.py check`, que nesta cópia de teste esbarrava numa dependência Windows-only pré-existente e alheia — `agenda_videos`/`agente_local`/`pywinauto` — antes de chegar em `impostos`); `manage.py check`/`makemigrations --check` rodados à parte com essas rotas alheias comentadas só pro teste — zero erro do `impostos`, migrations pendentes remanescentes (`raia`/`shopee`/`tiktok`) confirmadas como pré-existentes, independentes deste script.

**Confirmado no repositório real do Matheus em 13/09/2026, 23:58**: `git status` bateu exato com o plano (14 deletados, 26 modificados, 2 pastas novas); `python manage.py check` → `System check identified no issues (0 silenced)`; `python manage.py makemigrations --check --dry-run` → `No changes detected`. Passo 2 fechado.

## Passo 3 — `views.py` → `views/entrada.py` + `views/saida.py` (concluído, escopo revisado)

Antes de desenhar o script, Matheus pediu explicitamente pra conferir se a divisão em subpastas (o padrão usado nos Passos 1 e 2) era coerente com o resto do repositório, em vez de assumir. Auditoria feita nos 13 apps do projeto:

- **`views.py` vira pacote**: só `precificacao` faz isso hoje (todo o resto, inclusive `agenda_videos` com 1389 linhas, mantém `views.py` único) — e mesmo o `precificacao/views/` é **plano** (1 arquivo por concern, `__init__.py` reexportando, nenhuma subpasta).
- **`templates/` e `static/`**: em nenhum app do projeto (nem no `precificacao`, que cobre 6+ marketplaces) existe subpasta por domínio dentro de `templates/<app>/` ou `static/<app>/` — só `parciais/` (universal, não por domínio) e `css/`/`js/` (por tipo de arquivo). E no próprio `impostos`, cada template e cada arquivo estático já carrega o domínio no nome (`estrutura_resumo_entrada.html` vs `estrutura_auditoria_fiscal.html`, `layout_resumo_entrada.css` vs `layout_tabela_icms_por_ncm.css` etc.) — a mistura que motivou a decisão original era só visual (tudo numa lista só), não estrutural: zero `{% include %}` cruzado, `{% extends %}` só aponta pra fora do app.

**Conclusão**: nenhuma subpasta pra `templates/`/`static/` seria, na verdade, *menos* coerente com o repo (criaria um padrão que não existe em lugar nenhum). Escopo revisado: só `views.py` vira pacote plano, `templates/impostos/` e `static/impostos/` ficam exatamente como estão. Matheus confirmou ("concordo") antes do script ser escrito.

Entregue como script (`dividir_views_impostos.py`), mesmo padrão dos 2 anteriores: dry-run por padrão, valida a classificação das 8 funções e que nenhum arquivo do repo já importa `impostos.views.<algo>` por caminho de submódulo antes de escrever. `impostos/urls.py` só faz `from . import views` + `views.view_X` (confirmado por grep) — mesmo padrão seguro do Passo 1, nenhum import externo muda.

**Diferença deste passo**: a pedido explícito do Matheus ("prefiro que eu teste por aqui... mesmo que seja um comando de teste... eu executo na minha máquina"), o script **não foi rodado nem testado por aqui** desta vez, nem numa cópia de teste — só revisado linha por linha à mão antes de entregar. A primeira execução real foi a do Matheus.

**Confirmado no repositório real do Matheus em 13/09/2026, 21:23**: dry-run e `--apply` bateram exatamente com o previsto (8 funções, 2 entrada + 6 saída); `python manage.py check` → `System check identified no issues (0 silenced)`; `python manage.py makemigrations --check --dry-run` → `No changes detected`; `python -m pytest impostos/tests/ -q` → 20 passed, 2 xfailed (os 2 xfailed são testes propositais de prova visual, pré-existentes, sem relação com este passo). Passo 3 fechado.

## Passo 4 — `tests/` → `tests/entrada/` (concluído)

Entregue como script (`dividir_tests_impostos.py`), o mais simples dos 4: os 2 arquivos existentes já são 100% entrada, ninguém no repo importa `impostos.tests.<algo>` como módulo, e a forma de rodar os testes não muda (`pyproject.toml` não restringe `testpaths`, pytest descobre recursivamente). Não foi criada `tests/saida/` — nasce só quando o primeiro teste de saída for escrito.

**Testado antes de entregar**: só revisão manual do script, sem execução (mesmo pedido do Matheus já aplicado nos Passos 3 e 4).

**Confirmado no repositório real do Matheus em 13/09/2026, 21:36**: dry-run e `--apply` bateram com o previsto; `python manage.py check` → `System check identified no issues (0 silenced)`; `python manage.py makemigrations --check --dry-run` → `No changes detected`; `python -m pytest impostos/tests/ -q` → 20 passed, 2 xfailed (números idênticos aos de antes do passo). `impostos/tests/` (2 arquivos soltos) virou `impostos/tests/entrada/`. Passo 4 fechado.

## Em aberto

- [x] Passo 1 (`models.py`) — confirmado no ambiente real do Matheus.
- [x] Passo 2 (`funcoes_auxiliares/`) — confirmado no ambiente real do Matheus.
- [x] Passo 3 (`views.py`) — confirmado no ambiente real do Matheus. `templates/`/`static/` saíram do escopo (já conformes ao padrão do repo).
- [x] Passo 4 (`tests/`) — confirmado no ambiente real do Matheus.

**Reorganização entrada/saída do app `impostos` concluída por completo em 13/09/2026.**

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]]
- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
- [[Estrutura de Arquivo e Classe Python]]
