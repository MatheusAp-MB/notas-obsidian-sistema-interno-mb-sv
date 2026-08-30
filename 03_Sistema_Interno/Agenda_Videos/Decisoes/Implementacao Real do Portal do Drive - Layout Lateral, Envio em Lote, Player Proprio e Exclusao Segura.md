---
tipo: decisao
dominio: 
status: resolvida
criado: 20/08/2026
atualizado_em: 20/08/2026 00:34
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo, Convencao de Nomenclatura de Arquivos no Drive]
---

# Implementação Real do Portal do Drive — Layout Lateral, Envio em Lote, Player Próprio e Exclusão Segura

## O quê

Depois do mockup visual já validado (ver [[Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo]]), esta rodada implementou a tela de verdade em Django — substituindo por completo o "rascunho" anterior (que misturava HTML/CSS/JS no mesmo arquivo, usava paleta inventada e reinventava padrões que já existiam no projeto) por uma versão que segue as convenções reais do resto do sistema. Ao longo da implementação, o próprio usuário testando ao vivo levou o desenho bem além do mockup original: cartão de arquivo com miniatura lateral em 9:16 (formato real dos vídeos), envio em lote de vários arquivos de uma vez, player de vídeo local totalmente próprio (antes de qualquer envio ao Drive), e exclusão segura de arquivo já enviado.

## Por quê

3 problemas reais motivaram a reescrita: (1) o rascunho anterior quebrava a regra de nunca misturar HTML/CSS/JS no mesmo arquivo; (2) o usuário queria a mesma qualidade e consistência do resto do sistema, não "um rascunho que se manteve porque funcionou"; (3) durante os testes, apareceram necessidades reais que o mockup original não previa — confirmar o vídeo certo antes de subir, aproveitar melhor o espaço da tela, e lidar com arquivo que já foi usado pela postagem automática.

## Pra quê

Pra a tela virar uma função permanente e confiável do sistema — sem "código ambíguo e poluído" (nome de classe próprio da Agenda de Vídeos, nunca emprestado de outro app), sem arriscar excluir ou substituir arquivo real por engano, e sem deixar o usuário "às cegas" durante nenhuma ação (upload, exclusão, ou simplesmente assistindo um vídeo antes de mandar pro Drive).

## Auditoria de arquitetura — o que estava errado no rascunho, e como foi corrigido

Usando as convenções REAIS do projeto (não as do rascunho) como referência, mapeados 7 desvios e corrigidos:

| Desvio no rascunho | Convenção real usada como correção |
|---|---|
| `<style>`/`<script>` inline no template | CSS e JS extraídos pra `layout_portal_drive.css` e `script_portal_drive.js`, próprios do app `agenda_videos` |
| Paleta de cores inventada | Tokens reais (`--cor-primaria`, `--cor-positivo`, `--cor-negativo`, etc., de `layout_global.css`) |
| Expand/collapse em JS customizado | `<details>`/`<summary>` nativo, mesmo padrão do hub de anúncios (`hub-sku-*`) |
| Cabeçalho do produto copiando `hub-sku-*` literalmente | Classes próprias `portal-drive-*` — mesmo espírito visual, sem acoplar 1 app no outro |
| Upload via `fetch()` + FormData manual | HTMX real (`hx-post`, `hx-encoding="multipart/form-data"`), único padrão de upload usado em todo o projeto (Shopee/TikTok) |
| Toast customizado (emoji) | Nada disso mais é necessário — resultado do envio aparece inline no próprio fragmento trocado pelo HTMX (mesmo padrão de `.agenda-erro-drive`, já usado por `view_verificar_produto_drive`) |
| Badges de presença/ausência reinventadas | Reaproveitado `.video-gerado`/`.video-nao-gerado`, que já existiam em `layout_badges.css` |

## Envio em lote — não é mais 1 arquivo por vez

Decisão do usuário: em vez de cada cartão disparar 1 upload imediato, o fluxo virou **selecionar vários arquivos primeiro, enviar todos juntos**:

- Cada slot vazio (fase/ocorrência/tipo) vira um campo de arquivo próprio no mesmo `<form>`, com nome `arquivo__{fase}__{numero ou 0}__{tipo}` — `numero=0` só existe pra fase `simples` (nunca tem ocorrência de verdade), então sempre volta a virar `None` no backend, sem ambiguidade com Mensal/Trimestral (que começam em 1).
- 1 único botão "Enviar arquivos selecionados (N)" dispara **1 requisição HTMX só**, carregando todos os arquivos escolhidos.
- O backend processa cada arquivo do lote **de forma independente** — se 1 já existir no Drive (conflito), só ELE fica marcado como "já existe, não enviado"; os outros sobem normalmente, sem travar o lote inteiro por causa de 1 arquivo problemático.
- Barra de progresso real durante o envio, usando o evento nativo `htmx:xhr:progress` (o HTMX já usa XHR por baixo pra multipart/form-data — só foi preciso escutar, sem reinventar o mecanismo de upload).

```javascript
document.body.addEventListener('htmx:xhr:progress', function (evento) {
    if (!evento.detail.total) return;
    var percentual = Math.round((evento.detail.loaded / evento.detail.total) * 100);
    // ...atualiza a barra e o texto "Enviando arquivos... X%"
});
```

## Evolução do cartão de arquivo — de "empilhado" pra "lateral"

O mockup original empilhava miniatura em cima e texto embaixo. Testando ao vivo, o usuário identificou 2 problemas reais: espaço mal aproveitado (cartão pequeno, muito vazio ao redor) e miniatura na proporção errada — **os vídeos reais são sempre 9:16 (vertical)**, nunca 16:9, e a miniatura estava fixada em 16:9, distorcendo/cortando o preview.

Correção: miniatura em 9:16, ao lado (não embaixo) de uma coluna de dados — "Dados do upload" (nome, duração, tamanho, lidos 100% no navegador) e "Como será salvo no Drive" (nome final, pasta, etapa). A miniatura é sempre o elemento principal — a coluna de dados encolhe antes dela.

## Preview local antes de enviar — vídeo tocável e texto legível

Pedido do usuário: poder conferir o arquivo certo ANTES de mandar pro Drive, no momento da seleção — não depois. Resolvido 100% no navegador, sem gastar rede:

- Vídeo (Base/Completo): `URL.createObjectURL(arquivo)` alimenta um `<video>` tocável de verdade.
- Roteiro (.txt): `FileReader.readAsText(arquivo)` mostra o conteúdo real do texto, mesmo raciocínio aplicado a um tipo de arquivo diferente.
- Duração e tamanho lidos do próprio arquivo/blob (`arquivo.size`, `video.duration` via evento `loadedmetadata`) — nenhuma chamada ao servidor.

## Player de vídeo próprio — não depende dos controles nativos do navegador

Motivo: controles nativos variam de navegador pra navegador e escondiam até o botão de tela cheia atrás de um menu de 3 pontos. Construído um player fixo do sistema (inspirado no padrão de players verticais tipo Shorts, sem ser cópia), com só os 4 controles pedidos — play/pausar, mudo/áudio, tela cheia, linha do tempo arrastável — e nada além disso.

Detalhes técnicos que valem registrar:

- **Corte na tela cheia, causa raiz**: o vídeo usava `object-fit: cover` — funciona bem no quadro pequeno (9:16), mas ao entrar em tela cheia o quadro vira o formato da tela (16:9), e `cover` continua cortando pra preencher esse novo formato. Corrigido com `object-fit: contain` e colocando o **contêiner inteiro** (vídeo + meus controles) em tela cheia via `requestFullscreen()` — nunca só o `<video>` sozinho, garantindo que os controles próprios continuem funcionando dentro da tela cheia.
- **Controles somem no hover (modo pequeno) / por tempo parado (tela cheia)**: no modo pequeno, `:hover` puro já basta. Em tela cheia isso não funciona (o mouse está sempre "em cima" do player, que ocupa a tela toda) — resolvido com um relógio JS que esconde os controles depois de ~0,5s parado e reaparece a qualquer `mousemove`, nunca escondendo enquanto o mouse está literalmente sobre a barra de controles.
- **Clique simples pausa/despausa, duplo-clique alterna tela cheia** — mesmo padrão do YouTube. Como todo duplo-clique dispara 2 eventos `click` + 1 `dblclick` (o navegador não cancela os simples sozinho), o clique simples espera ~250ms antes de executar de verdade; se um 2º clique chegar antes disso, cancela o pausar/despausar e deixa só o duplo-clique acontecer — sem "piscar" a pausa.
- **Atalhos de teclado** (F = tela cheia, M = mudo, Espaço = play/pause) — como pode haver vários cartões selecionados ao mesmo tempo na tela, uma função `obterPlayerAtivo()` decide qual vídeo a tecla controla (o que estiver em tela cheia, senão o que o mouse estiver sobrevoando), e ignora teclas enquanto o foco está num campo de texto, pra nunca atrapalhar digitação em outro lugar da tela.

```javascript
var temporizadorCliqueVideo = null;

document.addEventListener('click', function (evento) {
    if (!evento.target.classList.contains('portal-drive-preview-video')) return;
    var video = evento.target;
    if (temporizadorCliqueVideo) {
        clearTimeout(temporizadorCliqueVideo);
        temporizadorCliqueVideo = null;
        return; // era um 2º clique — virou duplo-clique, cancela o pausar/despausar
    }
    temporizadorCliqueVideo = setTimeout(function () {
        temporizadorCliqueVideo = null;
        alternarReproducao(video);
    }, 250);
});
```

## Exclusão de arquivo — lixeira do Drive, nunca apagar em definitivo

Novo botão "Excluir do Drive" (só em arquivo ativo, nunca em arquivo já usado — ver seção abaixo), com confirmação em 2 etapas — reaproveitando o padrão real de modal já existente na Agenda de Vídeos (`modal-roadmap-*`, usado em "Marcar como concluído?"), com nome próprio (`portal-drive-modal-*`) pra não depender do CSS de outra tela:

1. 1º clique abre um modal ("Deseja realmente excluir do Drive? Essa ação não tem retorno").
2. Só o 2º clique, **dentro do modal**, executa a exclusão de verdade.

Decisão técnica de segurança, tomada com o usuário: por trás do aviso "não tem retorno", a exclusão de verdade **move o arquivo pra lixeira do Drive** (`files().update(body={'trashed': True})`), nunca apaga em definitivo (`files().delete()`). O usuário vê como se fosse irreversível, mas existe uma rede de segurança real contra clique errado — recuperável direto no Drive por um tempo.

```python
def excluir_arquivo(self, drive_file_id):
    self.servico.files().update(
        fileId=drive_file_id,
        body={'trashed': True},
        fields='id',
        supportsAllDrives=True,
    ).execute()
```

## Arquivo já usado vira somente leitura — achado real corrigido

Ponto levantado pelo usuário: um vídeo usado pela postagem automática é movido pra `Videos/usados/` (`ArquivadorDrive.mover_para_usados`, já existia, mas sem nenhuma tela usando ainda). Sem tratamento, a tela original só olhava `Videos/` — um arquivo já usado simplesmente **sumiria da tela**, parecendo "nunca enviado".

Corrigido: a busca de cada arquivo agora checa `Videos/` primeiro e, se não achar lá, checa `Videos/usados/`. Se achado em `usados/`, o cartão vira badge cinza "usado — somente leitura", mostra só "Ver no Drive" (via `webViewLink`, buscado só pra arquivo confirmado presente), e **nunca mostra o botão de excluir** — a tela não permite excluir nem substituir um arquivo que já foi de fato usado no ciclo de postagem.

## Estado real no momento desta nota

Toda a implementação (CSS, JS, templates, views, urls, e 1 método novo em `ArquivadorDrive`) foi entregue como texto no chat, aplicada localmente pelo usuário no próprio ambiente, e testada rodando `python manage.py runserver` — com vários ciclos reais de "testei, achei um problema, corrigido" ao vivo (bug de import obsoleto em `urls.py`, bug de `alternarTelaCheia` não definida, ajuste de `min-width:0` no range de progresso). **Ainda não commitado nem sincronizado no repositório** — nenhum `git commit`/push aconteceu nesta rodada.

## O que este trabalho NÃO resolve (ainda em aberto)

Das 3 perguntas de design originais do checkpoint:

1. **Pré-preencher Fase/Ocorrência automaticamente** — continua sem resposta; a tela hoje sempre mostra as 7 ocorrências fixas, sem filtrar pelo `CicloVideo` atual do produto.
2. **Guardar arquivo temporário no servidor vs reenviar do zero pra confirmar substituição** — superada pelo desenho novo: não existe mais "reenviar pra confirmar substituição" — o backend processa o lote inteiro de uma vez e só recusa (sem travar o resto) o que já existir.
3. **Onde a tela vive no menu** — resolvida nesta rodada: item próprio no dropdown "Agenda de Vídeos" (`Portal do Drive`, ícone `fa-cloud-arrow-up`), sem mais "(rascunho)" no nome.

Ainda em aberto, herdado de antes: **escolha de produto pela tela** — a tela continua rodando contra 1 único produto fixo (identidade real do Quimivida só pra exibição; leitura/escrita real do Drive 100% pinada na pasta de teste `PRODUTO_RASCUNHO`/`0000000000099`).

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Layout Final do Portal do Drive - Card do Produto com Lista de Fases e Cartoes de Arquivo]]
- [[Convencao de Nomenclatura de Arquivos no Drive]]
