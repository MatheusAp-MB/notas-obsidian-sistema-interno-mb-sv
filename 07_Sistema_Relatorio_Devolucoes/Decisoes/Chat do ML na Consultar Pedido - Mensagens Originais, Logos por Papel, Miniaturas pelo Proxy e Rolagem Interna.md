---
tipo: decisao
dominio:
status: implementada
criado: 04/10/2026
atualizado_em: 04/10/2026 03:47
relacionado: [Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026), Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML, Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias, Proxy de Anexo com Bearer Token e Miniatura em Lightbox Substituem o Ícone Clicável no Chat de Mediação, Código de Cores Unificado do Chat de Mediação — Mesma Paleta e Anexos nas Telas Mediações ML e Consultar Pedido]
---

# Chat do ML na Consultar Pedido — Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna

**Resumo**: a parte "Chat do ML" da Consultar Pedido (a conversa da mediação com o cliente e com o Mercado Livre) foi refeita em 04/10/2026: logos nos avatares, fotos anexadas como miniaturas que abrem no modal padrão do sistema, grade de no máximo 5 fotos por linha, rolagem dentro do próprio chat, abertura direta no chat começando pela primeira mensagem. O **texto das mensagens continua 100% original**. Junto, o acordeão da tela ficou com 3 camadas.

> [!note] IMPLEMENTADA e testada por Matheus no pedido-base
> Ele testou o modal de fotos ("100% funcional e correto") e aprovou a grade ("ficou bom"). Ainda não foi visto em outros pedidos com anexos nem pela Ana.

## Contexto

O chat da Consultar Pedido já existia (camada do acordeão, com bolhas coloridas por papel — cor do Mercado Livre, "você" e cliente — e a paleta unificada descrita em [[Código de Cores Unificado do Chat de Mediação — Mesma Paleta e Anexos nas Telas Mediações ML e Consultar Pedido]]). A tela **Mediações ML** já mostrava fotos anexadas como miniatura desde 21/09/2026 (ver [[Proxy de Anexo com Bearer Token e Miniatura em Lightbox Substituem o Ícone Clicável no Chat de Mediação]]); a Consultar Pedido ainda mostrava um ícone-link que pedia login no Mercado Livre. Matheus disse que faltava "corrigir a exibição das imagens aqui, como já foi corrigido na tela de mediações".

Termos: **proxy de anexo** é o endereço do nosso sistema que baixa a foto da API do Mercado Livre usando a credencial da empresa e entrega para o navegador — o navegador sozinho não conseguiria, porque a foto exige login.

## A questão a decidir

Como fazer o chat da Consultar Pedido mostrar quem fala e as fotos anexadas de forma clara e agradável **sem alterar uma vírgula do que o cliente e o Mercado Livre escreveram**?

## O que levou à decisão — alternativas consideradas

| Alternativa | Resultado | Por quê |
|---|---|---|
| Manter o ícone-link do anexo (abre a Central de Vendedores) | Descartada | Exige estar logado no Mercado Livre e não pode ser embutido como imagem |
| Reaproveitar o proxy da tela Mediações ML | Descartada | Aquele proxy só serve claim que já está no cache local da tela Mediações; a Consultar Pedido consulta **qualquer** pedido direto na API |
| Proxy próprio, `proxy_anexo_claim` | **Escolhida** | Não depende do cache; quem garante que a claim é da empresa certa é a própria credencial (a API recusa claim de outra conta) |
| Abrir o chat na última mensagem | Substituída | Matheus mudou: começar na **primeira** mensagem, para ver logo o motivo do cliente |
| Mostrar as fotos que o cliente envia no grupo "Devolução e reclamação" do topo | Descartada | Matheus: "não vai ser útil, só vai poluir" |
| Manter a grade de campos do chat (Ramo, Status da devolução, Resolução, Data de encerramento, Status do dinheiro) | Descartada | Matheus achou "inútil e confusa"; só o **desfecho** voltou |

## Decisão tomada

### Quem fala (avatares)

- Mensagens do Mercado Livre: logo do Mercado Livre. Mensagens da nossa empresa: logo da empresa ativa. Cliente: continua com a inicial. Se a imagem faltar, volta para a inicial.
- As cores por papel já estavam corretas e **não foram mexidas**.
- Avatar de 36 px (eram 30 px, que não deixavam a logo legível). O nome "Mercado Livre" ganhou um laranja mais escuro, por contraste.

### Conteúdo e layout das mensagens

- **O texto fica integralmente original**: nada de cortar, editar ou apagar linhas em branco; só o layout muda.
- Largura máxima da mensagem de 900 px (em monitor grande a linha passava de 140 caracteres), com a bolha acompanhando o tamanho do texto. Fontes um pouco maiores.

### Fotos anexadas

- Miniaturas de 120×120 px que abrem no mesmo modal de fotos do resto do sistema, com cursor de lupa e sombra ao passar o mouse.
- Se a foto falhar, aparece um quadro de 120×120 com "Abrir anexo".
- **Grade de no máximo 5 fotos por linha, com linhas balanceadas**, para nunca sobrar 1 foto sozinha na última linha: 1 a 5 fotos numa linha; 6 → 3+3; 7 → 4+3; 8 → 4+4; 9 → 5+4; 10 → 5+5.
- O `proxy_anexo_claim` baixa o arquivo com a credencial da conta ativa, não salva nada em disco e deixa o navegador guardar por 1 hora (a foto não muda depois de enviada). Só repassa como imagem o que o Mercado Livre diz que é imagem (SVG fica de fora, porque pode carregar script). Se o download falhar, cai para o link da Central de Vendedores, como antes.
- Ponto de atenção medido no log: o proxy ainda usa o espaçador de 0,4 s, então 6 fotos levaram 3,1 s (ver ciclo A em [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]).

### Rolagem e posição

- O chat tem rolagem **própria**, com altura de 70% da janela (teto de 720 px); antes ele fazia parte da rolagem da tela inteira, o que atrapalhava.
- A tela abre direto na camada do Chat do ML (quando existe conversa) e o chat começa na **primeira mensagem**.

### O que saiu e o que ficou na estrutura da tela

- A grade de 5 campos do chat foi removida. Voltou **só o desfecho** (quem a mediação favoreceu e se teve cobertura), numa linha pequena abaixo do selo "Encerrado — …" do topo, por exemplo "A favor do cliente · cobertura aplicada".
- O bloco 2 inteiro (camada "Reclamação") foi removido — o campo "Motivo" era só um lembrete sem dado — e a data "virou devolução" foi para a linha do tempo, que passou a ter 7 pontos (ver [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]).
- O acordeão ficou com **3 camadas**: Compra e envio de ida, Devolução física e **Chat do ML** (antes chamada de "Recebimento e mediação/resolução").
- No lado "No nosso cadastro interno" do topo entrou o link **"Ver cadastro"**, que abre a tela do produto em outra aba.

## Exemplo / consequência

Mensagem com 7 fotos: o chat mostra 2 linhas, 4 fotos em cima e 3 embaixo; ao clicar numa miniatura abre o modal de fotos padrão do sistema. O texto da mensagem aparece exatamente como o cliente escreveu.

**Onde está no código**: `integracao_mercado_livre/views.py` (`_construir_mensagens_mediacao`, `_url_anexo_mensagem`, `_url_anexo_mensagem_fallback`, `_colunas_grade_anexos`, `proxy_anexo_claim`) e a rota `mercado-livre/claim/<id>/anexo/<arquivo>/` em `integracao_mercado_livre/urls.py`; HTML em `consultar_pedido.html` (camada "Chat do ML"); estilo em `layout_consultar_pedido.css`. A logo do Mercado Livre fica em `core/static/base_compartilhada/img/Logo_ML.png`.

**Em aberto**:

- [ ] Ver o chat com anexos reais em outros pedidos, incluindo mediação com 2 claims
- [ ] Conferir as bolhas "Você" num pedido da MB (depende do `MB_USER_ID` do `.env`)
- [ ] Mostrar a tela para a Ana, no monitor dela

## Relacionado

- [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]]
- [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]
- [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]
- [[Proxy de Anexo com Bearer Token e Miniatura em Lightbox Substituem o Ícone Clicável no Chat de Mediação]]
- [[Código de Cores Unificado do Chat de Mediação — Mesma Paleta e Anexos nas Telas Mediações ML e Consultar Pedido]]
- [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]]
