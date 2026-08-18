---
tipo: decisao
dominio: 
status: ativa
criado: 05/08/2026
atualizado_em: 18/08/2026 11:00
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Modelo Novo de Fases Substitui Ciclo Antigo, Disciplina de Testes Automatizados, Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]
---

# Convenção de Nomenclatura de Arquivos no Drive

Convenção definida pelo usuário (05/08/2026) pro nome dos arquivos dentro de `{marca}/{ean}/Videos/`, no modelo novo de fases (Simples/Vídeo Mensal/Vídeo Trimestral). Substitui por completo a convenção antiga (`Diario_NN.mp4`, `Base.mp4` único por produto, `Roteiros_{fase}.txt`), que `constantes.py`/`parser.py` ainda implementam hoje — ver achado em [[Checkpoint Testes Automatizados Agenda Videos]].

## Regra

Cada ocorrência, em qualquer fase, tem seu próprio trio Base/Roteiro/Completo — nunca um arquivo único compartilhado (mesmo o Simples, que só tem 1 ocorrência).

- **Simples** (sem número, só 1 ocorrência): `Simples_Base.mp4`, `Simples_Roteiro.txt`, `Simples_Completo.mp4`.
- **Vídeo Mensal** (NN de `01` a `04`, sempre 2 dígitos): `Mensal_NN_Base.mp4`, `Mensal_NN_Roteiro.txt`, `Mensal_NN_Completo.mp4`.
- **Vídeo Trimestral** (NN de `01` em diante, sem limite — nunca conclui): `Trimestral_NN_Base.mp4`, `Trimestral_NN_Roteiro.txt`, `Trimestral_NN_Completo.mp4`.
- `Roteiro` é sempre singular (nunca "Roteiros" — variação já apareceu por digitação, corrigida na pasta de referência).
- Extensão sempre fixa: `.mp4` pra Base/Completo, `.txt` pra Roteiro — mesmo quando o Roteiro real é um Google Doc por dentro (ver seção abaixo).

## Roteiro é só existência, nunca conteúdo

A automação nunca baixa nem lê o conteúdo do Roteiro — só precisa que o arquivo exista com o nome certo, pra marcar aquela etapa como feita. Por isso não importa que o Roteiro seja, na prática, um Google Doc nativo (`mimeType: application/vnd.google-apps.document`) em vez de um `.txt` puro — `ArquivadorDrive.baixar_arquivo()` usa `files().get_media()`, que não funciona em Google Docs nativos (precisaria de `files().export_media()`), mas isso nunca é chamado pro Roteiro. Só importa de verdade pra Base/Completo, que são baixados pra postar no ML.

## Objeto de referência validado

EAN `0789888395162` (QUIMIVIDA) — pasta real no Drive, confirmada 100% coerente com essa convenção em 05/08/2026 (18 arquivos: Simples + Mensal 01-04 + Trimestral 01, cada um com o trio completo). Simples e Mensal_01 são conteúdo real; Mensal_02-04 e Trimestral_01 são cópias só pra preencher a pasta de teste — servem pra testar reconhecimento de NOME pelo parser, não validação de conteúdo real de vídeo.

Achado no caminho: a subpasta correta chama `Videos` (V maiúsculo) — só 1 das 5 pastas de EAN dentro de QUIMIVIDA tinha isso; as outras 4 tinham `videos` minúsculo, e `montar_arvore_por_ean()` (`escaneador.py`) comparava o nome de forma case-sensitive, descartando essas pastas silenciosamente. Provavelmente escondia EANs de outras marcas também (indício: a varredura geral achou 989 itens no Drive mas só reconheceu 23 EANs).

## Resolução (05/08/2026, 23:20)

Bug confirmado e corrigido durante a escrita do Nível 5 (`test_nivel_5__verificador_drive.py`, ver [[Checkpoint Testes Automatizados Agenda Videos]]) — o próprio EAN de referência (`0789888395162`) tinha a subpasta como `videos` minúsculo, e isso bloqueou `verificar_todos_no_drive()` de encontrá-lo de verdade.

**Achado curioso no processo:** o teste que usa `LocalizadorArquivosProduto.localizar_arquivos()` (Drive real, buscando 1 produto específico) passou mesmo com a pasta em minúsculo — porque o operador `name =` da query da API do Google Drive é case-insensitive no servidor. Já `montar_arvore_por_ean()` faz a comparação localmente em Python (`f['name'] == 'Videos'`), que É case-sensitive — por isso só esse caminho falhava. Duas funções, mesmo dado real, comportamentos diferentes por essa diferença sutil entre "case-insensitive no Drive" e "case-sensitive em Python".

**Fix:** `escaneador.py`, comparação de `pasta_videos` e `pasta_usados` trocada de `f['name'] == NOME_PASTA_VIDEOS` para `f['name'].lower() == NOME_PASTA_VIDEOS.lower()` (mesmo padrão pra `NOME_PASTA_USADOS`). Confirmado: `test_nivel_5__verificador_drive.py` — 2 passed contra o Drive real.

## Atualização (18/08/2026, 11h00) — "Roteiro sempre singular" (regra acima) deixou de valer sozinha

A regra original, na seção "Regra" acima, dizia que a variação pro plural era erro de digitação, corrigida na pasta de referência. Na prática, validando o produto de referência da Samvale (Ortho Pauher, EAN `7899947306688`), ficou claro que **a equipe salva o arquivo de Roteiro no plural por hábito real** (`Simples_Roteiros.txt`), não por engano isolado — não é mais seguro tratar isso como excepção pontual.

Decisão: em vez de pedir pra equipe renomear todo arquivo existente (trabalho manual, sem garantia de não voltar a acontecer), o `parser.py` foi corrigido pra aceitar as 2 formas — singular (`Simples_Roteiro.txt`) e plural (`Simples_Roteiros.txt`) — como equivalentes. Isso não abre uma exceção geral no formato: continua rígido em tudo o resto (prefixo, número de 2 dígitos, extensão certa por tipo); só o "s" final do Roteiro passou a ser opcional, porque Roteiro é só existência, nunca conteúdo (ver seção acima) — a variação de nome não muda nada sobre o que o arquivo representa. Detalhe completo, incluindo o teste de regressão, em [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]].

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Modelo Novo de Fases Substitui Ciclo Antigo]]
- [[Roteiro Salvo no Plural pela Equipe - Parser Aceita Singular e Plural]]
