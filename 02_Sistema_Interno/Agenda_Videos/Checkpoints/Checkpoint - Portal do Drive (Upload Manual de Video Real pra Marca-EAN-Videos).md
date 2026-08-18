---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 18/08/2026
atualizado_em: 18/08/2026 16:30
relacionado: [Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao), Service Account Nao Tem Cota Propria no Drive - Upload Real Exige OAuth Como Usuario Real, Convencao de Nomenclatura de Arquivos no Drive, Disciplina de Testes Automatizados, Padrao de Robustez para Clientes de API Externa]
---

# Checkpoint — Portal do Drive (Upload Manual de Vídeo Real pra Marca/EAN/Videos)

## Contexto

**O QUÊ**: o "Portal do Drive" é uma tela nova, ainda não construída na interface (só o motor por trás dela avançou até aqui), que vai deixar quem trabalha na Agenda de Vídeos subir um vídeo (Base, Roteiro ou Completo) direto pelo sistema — escolhendo marca, EAN, fase e tipo de arquivo — em vez de precisar abrir o Google Drive manualmente e navegar até a pasta certa (`{marca}/{ean}/Videos/`) pra arrastar o arquivo com a mão.

**POR QUÊ**: fazer isso manualmente no Drive tem 2 riscos reais, os mesmos que toda a [[Convencao de Nomenclatura de Arquivos no Drive]] existe pra evitar — salvar na pasta errada (EAN trocado, por exemplo) ou salvar com nome fora do padrão (é exatamente o que já aconteceu 1 vez de verdade — ver [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]], onde a equipe salvou `Simples_Roteiros.txt` no plural por engano). Se o próprio sistema monta o nome do arquivo e escolhe a pasta certa (usando as mesmas funções que o parser depois vai ler), esses 2 riscos somem — ninguém mais digita nome de arquivo ou navega pasta à mão.

**PRA QUÊ**: este checkpoint documenta o trabalho desta tarde (18/08/2026) na camada de baixo nível (`agenda_videos/funcoes_auxiliares/drive/`) — as funções que a tela do Portal do Drive vai chamar quando existir. A tela em si (view Django, template, modal de confirmação, botão no menu) ainda **não foi construída** — é o próximo passo, listado no final desta nota.

> [!info] Como este checkpoint se relaciona com [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]
> Aquele outro checkpoint (criado hoje de manhã, 18/08 10h11) trata de 4 etapas diferentes — Drive (leitura), Postagem Automática, Aprovação no Mercado Livre, Replicação Automática — todas sobre o fluxo **automático** que já existe. O trabalho desta nota é uma frente **paralela e nova**: dar ao humano um jeito de **escrever** no Drive pela tela do sistema, o que nunca existiu antes (até 28/07/2026, o arquivo `arquivador.py` inteiro tinha 0% de cobertura de teste e nenhum chamador em produção — só infraestrutura construída de propósito pra uso futuro). As 2 frentes usam o mesmo pacote `drive/`, mas resolvem problemas diferentes.

## O que foi feito nesta tarde (18/08/2026)

### 1. Nova função: achar se um arquivo já existe antes de subir

`agenda_videos/funcoes_auxiliares/drive/utilitarios_pasta.py` ganhou `buscar_arquivo()`, que pergunta ao Google Drive "existe algum arquivo com este nome exato dentro desta pasta?" e devolve o ID dele (ou `None` se não existir):

```python
def buscar_arquivo(servico, pasta_pai_id, nome_arquivo):
    nome_escapado = nome_arquivo.replace("'", "\\'")
    query = (
        f"'{pasta_pai_id}' in parents and name = '{nome_escapado}' "
        f"and trashed = false"
    )
    resultado = servico.files().list(
        q=query, fields='files(id)', supportsAllDrives=True, includeItemsFromAllDrives=True,
    ).execute()
    arquivos = resultado.get('files', [])
    return arquivos[0]['id'] if arquivos else None
```

**Por que precisa disso**: sem essa checagem, subir um vídeo pro mesmo produto/fase 2 vezes criaria **2 arquivos com o mesmo nome** dentro da mesma pasta do Drive (o Google Drive permite isso — nomes duplicados não dão erro nenhum) — e aí o parser (`parser.py`) não teria como saber qual dos 2 é o de verdade.

### 2. Nova função: montar o nome do arquivo automaticamente

Ainda em `utilitarios_pasta.py`... na verdade em `arquivador.py`, a função `montar_nome_arquivo()` monta o nome seguindo exatamente a mesma [[Convencao de Nomenclatura de Arquivos no Drive]] que o parser já espera ao ler:

```python
def montar_nome_arquivo(fase, numero_ocorrencia, tipo):
    prefixo = PREFIXO_ARQUIVO_POR_FASE[fase]
    extensao = EXTENSOES_VALIDAS_POR_TIPO[tipo]
    tipo_capitalizado = tipo.capitalize()
    if fase == 'simples':
        return f'{prefixo}_{tipo_capitalizado}.{extensao}'
    return f'{prefixo}_{numero_ocorrencia:02d}_{tipo_capitalizado}.{extensao}'
```

**Exemplo concreto**: pra uma ocorrência de Vídeo Mensal (fase `'mensal'`), número de ocorrência `1`, tipo `'roteiro'`, esta função devolve `Mensal_01_Roteiro.txt` — o mesmo formato de 2 dígitos que a convenção já documenta pra Mensal/Trimestral. Pra fase `'simples'`, não existe número de ocorrência (só acontece 1 vez), então o nome sai sem ele: `Simples_Base.mp4`.

### 3. A função principal: `enviar_arquivo()`

Esta é a função que a tela do Portal do Drive vai chamar quando o usuário confirmar o upload. Ela faz 4 coisas em sequência: garante a cadeia de pastas `marca/ean/Videos/` (reaproveitando `buscar_ou_criar_subpasta`, já existente), monta o nome certo do arquivo, checa se já existe um arquivo com esse nome, e só então decide entre **criar** ou **substituir**:

```python
def enviar_arquivo(self, pasta_raiz_id, marca, ean, fase, numero_ocorrencia, tipo, caminho_local, permitir_substituir=False):
    pasta_marca_id = buscar_ou_criar_subpasta(self.servico, pasta_raiz_id, marca)
    pasta_ean_id = buscar_ou_criar_subpasta(self.servico, pasta_marca_id, ean)
    pasta_videos_id = buscar_ou_criar_subpasta(self.servico, pasta_ean_id, NOME_PASTA_VIDEOS)
    nome_arquivo = montar_nome_arquivo(fase, numero_ocorrencia, tipo)
    arquivo_existente_id = buscar_arquivo(self.servico, pasta_videos_id, nome_arquivo)
    media = MediaFileUpload(caminho_local, resumable=True)
    if arquivo_existente_id is None:
        arquivo_novo = self.servico.files().create(
            body={'name': nome_arquivo, 'parents': [pasta_videos_id]},
            media_body=media, fields='id', supportsAllDrives=True,
        ).execute()
        return arquivo_novo['id']
    if not permitir_substituir:
        raise FileExistsError(
            f"Já existe um arquivo '{nome_arquivo}' em Videos/ — passe permitir_substituir=True pra confirmar a substituição."
        )
    self.servico.files().update(
        fileId=arquivo_existente_id, media_body=media, fields='id', supportsAllDrives=True,
    ).execute()
    return arquivo_existente_id
```

Repare que `pasta_raiz_id` é um parâmetro explícito da função, em vez de a própria função resolver isso sozinha chamando `obter_pasta_raiz_id_ativa()` — **decisão deliberada**, feita pra deixar a função fácil de testar isoladamente (o teste passa o ID da pasta-sandbox real do Drive de teste, sem precisar mexer em qual empresa está ativa na sessão).

### 3 decisões de design tomadas com o usuário nesta tarde

| Decisão | O que foi escolhido | Por quê |
|---|---|---|
| **O que fazer quando o arquivo já existe e ninguém confirmou substituição?** | Levantar a exceção padrão do Python `FileExistsError`, com mensagem explicando a situação. | Reaproveitar uma exceção que já existe na linguagem, em vez de criar uma classe de exceção nova só pra isso — mais simples, e quem chama já reconhece `FileExistsError` de cara. |
| **Quem decide se substitui ou não — o backend, com uma regra fixa, ou o usuário?** | O **usuário decide**, através de um modal de confirmação na tela ("Você tem certeza que quer substituir o vídeo atual por esse?") — o backend nunca substitui sozinho, nem nunca recusa de forma definitiva; ele só devolve a informação "já existe" pra tela decidir o que perguntar. | O usuário explicitamente rejeitou uma regra rígida fixa no backend ("2 pensei melhor... é melhor que abra modal de aviso... deixar o usuário confirmar se quer ou não") — o comportamento certo depende do julgamento de quem está subindo o arquivo naquele momento, não de uma regra estática. |
| **Ao substituir, o arquivo novo fica com um ID novo no Drive, ou o mesmo ID de antes?** | **Mesmo ID** — usando `files().update(fileId=..., media_body=...)`, que troca só o CONTEÚDO do arquivo, mantendo o mesmo `fileId`. Nunca apaga o arquivo antigo e cria um novo. | Qualquer link/referência externa que já aponte pra aquele arquivo (por `fileId`) continua funcionando depois da substituição — trocar o ID quebraria silenciosamente qualquer coisa que dependesse dele. |

### O teste de Nível 5 (rede real): projetado pra se auto-provisionar

Seguindo a [[Disciplina de Testes Automatizados]] (Nível 5 = integração externa real, sem mock nenhum), `agenda_videos/tests/test_nivel_5__drive_escrita.py` ganhou 3 testes novos pra `enviar_arquivo()` (criar, recusar substituição sem confirmação, substituir com confirmação mantendo o ID) — junto com o teste de idempotência de `buscar_ou_criar_subpasta()` que já existia, total de **4 testes**.

> [!important] A pasta-sandbox do teste (`_teste_automatizado`) não precisa mais ser criada manualmente
> Na primeira versão deste arquivo de teste, a pasta `_teste_automatizado` (onde TODA escrita de teste acontece, pra nunca sujar a estrutura real de produção) precisava ser criada manualmente 1 vez no Drive antes de rodar o teste. O usuário pediu explicitamente pra isso mudar: **"Eu não vou criar manualmente quero que o próprio teste crie ela."**
>
> A função `_garantir_pasta_teste_fixa()` resolve isso — acha a pasta ou cria na primeira vez, sozinha. O detalhe fino: essa função usa uma chamada **crua** à API do Drive (`servico.files().create(...)` direto), **nunca** chama `buscar_ou_criar_subpasta()` (que é o próprio SUT — Sistema Under Test) pra criar essa pasta-raiz do sandbox. Motivo: se `buscar_ou_criar_subpasta()` tivesse um bug de idempotência (por exemplo, sempre criar mesmo quando já existe), usar ela pra criar a própria pasta-raiz do sandbox **mascararia esse bug** — cada rodada de teste criaria uma pasta-raiz duplicada no Drive real, e nada no teste apaga essa pasta-raiz (só a subpasta criada DENTRO dela, no TearDown). Por isso a pasta-raiz só pode nascer de um caminho independente do que está sendo testado.

### Estado atual — validado com dado real, 18/08/2026

```
Results (33.76s): 4 passed
```

| Arquivo | Cobertura |
|---|---|
| `utilitarios_pasta.py` | 100% (19 stmts, 0 miss) |
| `arquivador.py` | 75% (51 stmts, 12 miss) |
| Total do pacote `drive/` | 82% |

Os 12 statements não cobertos em `arquivador.py` pertencem a `montar_caminho_local_organizado()`, partes de `baixar_arquivo()` e de `_obter_ou_criar_pasta_usados()`/`mover_para_usados()` — funções que **ainda não têm nenhum chamador** hoje, construídas de propósito pra uma feature futura diferente (postagem automática, que baixa o vídeo do Drive pra máquina do agente local). Não é dívida desta feature (Portal do Drive), é escopo de uma frente futura separada.

## Próximos passos (ainda não começados)

Esta lista é o que falta pra o Portal do Drive virar uma tela de verdade que alguém do time consegue usar — nada disso foi codado ainda:

1. **Endpoint POST no Django** — recebe o arquivo enviado pelo formulário, valida a extensão de novo no servidor (nunca confiar só na validação do navegador — arquivo pode vir de qualquer lugar, inclusive de alguém digitando a requisição na mão), chama `ArquivadorDrive.enviar_arquivo(...)`, e captura o `FileExistsError` pra devolver "já existe" de um jeito que o front-end saiba mostrar o modal de confirmação.
2. **Modal de confirmação** ("Você tem certeza que quer substituir o vídeo atual por esse?") — dispara quando o passo 1 devolver "já existe"; se o usuário confirmar, o front-end reenvia a mesma requisição com um sinal de "pode substituir" (`permitir_substituir=True`).
3. **View GET + template real** — a tela onde o usuário escolhe marca, EAN, fase, tipo de arquivo e o arquivo do computador dele, e vê o resultado do upload.
4. **Rota nova (`urls.py`)** — endereço da tela nova.
5. **Link no menu de navegação** — inserção dentro do dropdown "Agenda de Vídeos" em `core/templates/base_compartilhada/estrutura_base_global.html` (mesmo arquivo onde os outros links da Agenda de Vídeos já vivem).
6. **Validação manual de ponta a ponta**, pras 2 empresas (Magazine e Samvale) — subir um vídeo de verdade pela tela, confirmar que ele aparece na pasta certa do Drive de cada empresa, antes de considerar esta feature pronta.

## PAUSADO em 18/08/2026, 16h30 — troca de foco urgente do usuário

> [!warning] Estado exato no momento da pausa — nenhuma linha de código da tela foi escrita ainda
> Esta frente estava na etapa de **planejamento da interface** (item 1-5 da lista "Próximos passos" acima) quando o usuário pediu pra trocar de foco com urgência. O motor de baixo nível (`enviar_arquivo()`, `buscar_arquivo()`, `montar_nome_arquivo()`) já está pronto, commitado e validado (ver seções acima) — o que falta é 100% a camada de tela (view, template, URL, endpoint POST, modal, link no menu). Nada disso foi escrito ainda, nem em rascunho.

### As 3 perguntas de design feitas ao usuário — AINDA SEM RESPOSTA, responder antes de escrever qualquer código da tela

1. **Fase e número da ocorrência**: a tela deve **pré-preencher sozinha** Fase/Ocorrência olhando pro ciclo atual do produto escolhido (campo `CicloVideo.fase`/`CicloVideo.numero_ocorrencia`, ver achado técnico abaixo), deixando a pessoa só confirmar ou trocar — ou a pessoa deve **sempre escolher manualmente** os 2 campos do zero, sem nenhum valor sugerido?
2. **Comportamento do modal de confirmação de substituição** (quando `enviar_arquivo()` levanta `FileExistsError`): como o vídeo já foi enviado do navegador pro servidor Django na 1ª tentativa, existem 2 caminhos — (a) o servidor **guarda esse arquivo temporariamente** e o clique em "Confirmar substituição" dispara só uma 2ª chamada pequena, **sem reenviar o vídeo inteiro de novo** (mais rápido pra arquivo grande, mas exige guardar o arquivo por alguns minutos no servidor); ou (b) o modal **reenvia o arquivo inteiro de novo** do navegador pro servidor quando a pessoa confirma (mais simples de implementar, mas manda o vídeo 2 vezes pela rede). Qual dos 2?
3. **Onde a tela vive**: um **link novo próprio** no menu (dropdown "Agenda de Vídeos", ao lado de "Agenda"/"Histórico"/"Configurações" que já existem), ou um **botão dentro da tela/card de um produto específico** que já existe hoje?

### Achados de reconhecimento de código — já confirmados, prontos pra usar quando retomar (evita reinvestigar do zero)

| Achado | Onde está, no código real | Por que importa pro Portal do Drive |
|---|---|---|
| Padrão de upload via HTMX já existe no projeto | `shopee/views.py`, função `view_processar_promocao` (e o equivalente em `tiktok/views.py`) — usa `request.FILES.get(...)`; erro re-renderiza só um template de modal parcial (`estrutura_parcial_modal_erro_promocao.html`), sem recarregar a página nem perder o arquivo escolhido; sucesso manda o navegador de verdade pra outra tela via header `HX-Redirect` | Dá pra seguir exatamente esse mesmo padrão pro endpoint do Portal do Drive, em vez de inventar um novo — inclusive pro modal de "já existe, confirmar substituição?" |
| `Produto` já tem `marca` e `ean` como campos próprios | `produtos/models/produto.py`, dataclass `DadosIdentificacaoProduto` (campos `ean`, `marca`, junto de `sku`, `titulo`, etc.) | A tela pode deixar a pessoa **escolher o Produto** (por nome/EAN, com busca) em vez de digitar marca e EAN à mão — evita o mesmo tipo de erro de digitação que a [[Convencao de Nomenclatura de Arquivos no Drive]] já existe pra prevenir |
| `CicloVideo` guarda a fase e a ocorrência atuais de cada produto | `agenda_videos/models/ciclo_video.py` — campos `fase` (choices de `Fase`) e `numero_ocorrencia` (`PositiveIntegerField`), com `UniqueConstraint(fields=['produto', 'fase', 'numero_ocorrencia'])` | É a fonte de dado pra responder a Pergunta 1 acima — se a resposta for "pré-preencher sozinho", é daqui que vem o valor sugerido |
| Já existe 1 view no mesmo espírito (aciona o Drive a partir de 1 produto) | `agenda_videos/views.py`, `view_verificar_produto_drive` (linha ~299) e `view_verificar_todos_drive` (linha ~315) | Bom modelo de referência de como uma view da Agenda de Vídeos já trata erro de conexão com o Drive (`except Exception` → mensagem amigável, nunca stacktrace cru pro usuário) |
| Local exato pro link no menu, se a resposta da Pergunta 3 for "link novo" | `core/templates/base_compartilhada/estrutura_base_global.html`, dentro do bloco `<!-- Agenda de Vídeos -->` (por volta da linha 267-283), ao lado dos links já existentes pra `agenda_videos_principal`, `agenda_videos_historico` e `agenda_videos_configuracoes` | É o arquivo e o bloco exato onde a nova rota entraria — nenhuma investigação nova precisa ser refeita |

### Próximo passo real ao retomar esta frente

Repetir (ou já ter em mãos) a resposta do usuário pras 3 perguntas acima, e só depois escrever, nesta ordem: o endpoint POST (reaproveitando o padrão HTMX da tabela acima) → o modal de confirmação → a view GET + template + rota nova em `urls.py` → o link no menu (se aplicável) → validação manual de ponta a ponta nas 2 empresas.

## Checklist desta nota

- [x] Explica o quê, por quê, pra quê e como pra cada decisão e função nova.
- [x] Cita arquivo e função reais em cada afirmação sobre código.
- [x] Tem exemplo concreto (`Mensal_01_Roteiro.txt`, resultado real de teste 4 passed).
- [x] Usa tabela pras 3 decisões de design comparáveis.
- [x] Fecha com o estado real validado (não só a explicação em abstrato) e com os próximos passos concretos.

## Relacionado

- [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]
- [[Service Account Nao Tem Cota Propria no Drive - Upload Real Exige OAuth Como Usuario Real]]
- [[Convencao de Nomenclatura de Arquivos no Drive]]
- [[Disciplina de Testes Automatizados]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]]
