---
tipo: checkpoint
dominio:
status: em_andamento
criado: 17/09/2026
atualizado_em: 18/09/2026 02:14
relacionado: [Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta, Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução, Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe, Consultar Pedido Passa a Aceitar NF, Nome e Endereço Além do Número — Escopo Fechado e Validado Contra a Prioridade da Ana, Processo de Devolução de Produtos e os 3 Caminhos Possíveis, Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004), De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto, Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]
---

# Relato Completo do Fluxo Real de Devolução Depois que o Pacote Chega — 8 Fases e Cruzamento com o Vault

**Resumo**: antes de continuar implementando (depois de fechar a confirmação de endereço no Bloco 3), Matheus pediu pra "analisar novamente as dores reais da Ana" e descreveu, de ponta a ponta, tudo que ela faz desde o motorista entregar os pacotes de devolução até o relatório impresso — limitado 100% à plataforma Mercado Livre. Esta nota registra o relato dele de forma literal (fase "Idealizar", sem código) e a análise cruzando cada fase com o que já existe decidido/idealizado no vault, pra identificar o que é dor nova e o que já tem caminho. Atualizada às 23:06 com o feedback literal da própria Ana sobre a tela de Devoluções Pendentes e a amarração final ligando o relato + o feedback dela à decisão de 16/09/2026 sobre telas pouco integradas. Atualizada às 23:24 com as decisões de Matheus sobre as dores 1 (ponte Consultar Pedido → Nova Devolução), 2 (fotos pra mediação) e a confirmação de Correios — a dor 3 (etiqueta térmica) e o feedback da Ana sobre abas seguem em aberto, de propósito. Às 23:33, a dor 3 (etiqueta térmica) também foi fechada — conteúdo e impressora definidos. Às 23:43, a abordagem técnica dessa etiqueta foi corrigida — não é Ctrl+P/HTML, é ZPL validado no Labelary e impresso em PDF. Em 18/09/2026 às 00:00, o layout ZPL final foi desenhado, testado e aprovado por Matheus no Labelary (4 rodadas de ajuste). Às 00:48, a implementação em Django saiu do papel: o botão de Devoluções Pendentes agora abre uma tela de impressão direta (HTML/CSS + Ctrl+P, mesmo mecanismo do relatório A4), com os códigos de barra desenhados no navegador via JsBarcode — o ZPL/Labelary vira só o caminho backup. Um bug de espaçamento foi corrigido e o resultado foi confirmado visualmente na pré-visualização de impressão; falta o teste físico real (impressora Zebra + leitor de código de barras), previsto pro dia seguinte. Às 02:06, a Fase 6 também avançou pra Executar: fotos de conferência reorganizadas em pastas por pedido/peça (com um bug de sincronia disco×banco encontrado e corrigido no teste) e nova tela de visualização completa da devolução implementada e sincronizada — falta só decidir o que fazer com o Explorer não vindo sozinho pro primeiro plano ao abrir a pasta.

> [!note] Idealizar (maioria das fases) / Executar (Fases 6 e 8 implementadas, faltam pendências pontuais) — impressão direta no Django, fotos organizadas, tela de visualização nova
> Esta nota registra o relato, o diagnóstico e as decisões tomadas até 18/09/2026 00:00 (Correios, ponte Consultar Pedido → Nova Devolução, tela de visualização com fotos baixáveis, e a etiqueta térmica — conteúdo, abordagem técnica e layout ZPL final, já validado no Labelary). Às 00:48, a Fase 8 avançou pra Executar: impressão direta implementada no Django (HTML/CSS + Ctrl+P, ZPL/Labelary agora só como backup), com um bug de espaçamento já corrigido e confirmação visual na pré-visualização — falta a validação física (impressora + leitor de código de barras), prevista pro dia seguinte. Às 02:06, a Fase 6 também avançou pra Executar: fotos reorganizadas em pastas por pedido/peça e nova tela de visualização completa da devolução, ambas implementadas e sincronizadas — falta decidir o que fazer com o Explorer não vindo sozinho pro primeiro plano. Só o feedback da Ana sobre abas segue sem solução, de propósito (ver "Decisões desta rodada").

## Contexto

Depois de fechar a implementação da confirmação de endereço na tela Consultar Pedido (Blocos 1 e 3 — ver [[Mascaramento De Endereco No Shipment Do ML Nao Impede Confirmar Se A Devolucao Chegou De Fato Na MB Ou Na SV (Pedido 2000018113512820)]] e [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]]), Matheus quis dar um passo atrás e reanalisar as dores reais da Ana antes de decidir o que vem a seguir — mesmo espírito do [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]] já usado antes neste mundo.

## Relato de Matheus (literal, 17/09/2026)

> Vamos considerar o cenario:
>
> (Vamos nos limitar 100% a plataforma mercado livre aqui ok)
>
> Ela esta em um dia comum de trabalho, chega o motorista com devoluções:
>
> Existem algumas possibilidades:
> 1- A devolução veio por transportadora do ML: ela recebe a quantidade X de pacotes, e confirma no celular lendo o QR Code do aplicativo do ML que recebeu aquela quantia X de pacotes. (99% dos casos)
>
> 2- A devolução veio por correios (nem lembro se tem isso pro mercado livre em especifico mas acho que sim)
>
> 3- A devolução veio por transportadora terceirizada (o caso das cadeiras maiores)
>
> Depois disso o lado Motorista -> Nos, acaba. Ele fez o papel dele de entregar, e nos recebemos os pacotes fisicamente.
>
> Então ela coloca os pacotes em um local, e começa o processo de conferencia de devolução.
>
> A primeira coisa que ela faz é pegar fisicamente um pacote e ver o que tem de dados disponiveis para descobrir qual é aquela venda no ML. Aqui ela tem 3 opções:
>
> 1- Busca direta no Mercado Livre, pelo numero da venda ou pack ID
> 2- Busca no ERP, por numero de venda, numero da nota fiscal, nome do cliente, endereço, enfim...
> 3- Busca no nosso sistema na tela "Consultar pedido"
>
> ok ela encontrou o pedido, vamos supor que seja o pedido do Edgar (2000017788033354) do produto "CADEIRA DE TRANSFERENCIA"
>
> apos isso ela precisa saber algumas informações:
>
> 1-> Por que o cliente devolveu?
> 2-> O cliente abriu a reclamação dentro ou fora do prazo de 7 dias apos a compra?
> 3-> Existe alguma mediação ja aberta sobre esse pedido?
>
> aqui ela não toma ação nenhuma ela apenas ganha contexto sobre o que aconteceu com aquele pedido. Por isso a tela de "Consultar pedido" é tão importante pq entrega contexto de forma organizada e clara para ela.
>
> ela entendeu a motivação do cliente, então ela passa a conferencia real do produto.
>
> Caso o produto esteja perfeito:
>
> ela diz no site do ml que o produto foi recebido sem problemas, faz o processo no erp, e o produto retorna pro estoque.
>
> mas focando no que interessa pra gente vamos supor que o produto tenha algum problema..
>
> Aqui tem uma coisa importante de ser dita... não da pra ela saber se vai precisar cadastrar essa devolução ou não no sistema sem antes ela conferir o produto...
>
> então se torna quase um paradoxo "Eu cadastro essa devolução (tela nova devolução) no sistema agora correndo o risco do produto ta perfeito, ou eu começo a conferir se o produto esta bom primeiro e depois crio a nova devolução caso precise?"
>
> precisamos pensar em como reduzir esse atrito.
>
> pois bem, no exemplo que estou trabalhando o produto tem um problema, ela ja consultou o pedido, ela ja esta naquela tela, ela precisa criar uma nova devolução a partir dali, sem o atrito de ir para outra tela e repreender o que ja foi consultado.
>
> Ela criou a devolução, e esta conferindo o produto, foi tirou fotos do que veio ruim, fez as anotações necessárias, e salvou a conferencia.
>
> Vamos supor que agora ela precise abrir uma mediação com o Mercado Livre, por exemplo neste caso do edgar:
>
> O motivo da reclamação e devolução dele foi "Motivo da devolução a cama nao é compatível com a cama da minha vó (ela tem uma cama Cama Articulada Motorizada abertura do apartamento nao cabe . Ops Abertura do aparelho nao cabe"
>
> porem o produto não retornou intacto pra gente então ela precisou abrir uma mediação dizendo:
> "Produto retornou com riscos e sujo" e enviou em anexo junto a essa mensagem as mesmas fotos que ela tirou no processo de conferencia
>
> aqui tem um ponto que precisamos corrigir, hoje em local nenhum do sistema tem um jeito facil dela obter essas fotos para abrir a mediação com o mercado livre.
>
> Ai a partir do momento que ela abriu essa mediação com o mercado livre entra outro problema, ela precisa acompanhar essa mediação que leva dias, e precisa responder o ML dentro do prazo estipulado a cada nova mensagem deles. Hoje ela fixa varias abas no navegador uma para cada mediação e acompanha manualmente. Precisamos corrigir isso no sistema, criando aquela nova tela de acompanhamento de mediações.
>
> Nesse momento surge outro problema, ela só quer imprimir o relatorio de devolução quando a mediação foi finalizada, mas ai o produto fisico fisico fica sem identificação nenhuma ... eu queria construir um mini relatorio compacto no tamanho de uma etiqueta 10x15cm pra impressora termica, pq ai imprimia-mos e colavamos ao produto para posteriormente colar o relatorio no tamanho A4.
>
> ainda existem outros pontos que não vem ao caso agora que é sobre o processo de garantia com o fornecedor, para esses produtos que ficam como troca.

## Análise — cruzamento com o vault (feita por Claude, 17/09/2026)

Reconstruindo o relato acima em 8 fases e conferindo cada uma contra o que já está registrado:

**Fase 1 — Motorista → Nós (recebimento físico)**: 3 vias — transportadora do ML com confirmação por QR Code no app (99% dos casos), Correios (existência pro ML não confirmada por Matheus) e transportadora terceirizada. Só a 3ª via tinha registro prévio, em [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]]. A confirmação por QR Code (via majoritária) e a via Correios são informação nova, ainda não registradas antes desta nota.

**Fase 2 — Identificar o pedido a partir do pacote físico**: 3 buscas possíveis (ML direto, ERP, tela Consultar Pedido). Já bem coberta: [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]] fechou busca por pedido/cliente/pack; [[Consultar Pedido Passa a Aceitar NF, Nome e Endereço Além do Número — Escopo Fechado e Validado Contra a Prioridade da Ana]] mapeou NF/nome/endereço como bloqueados até existir API do ERP.

**Fase 3 — Ganhar contexto, sem tomar ação (motivo, prazo de 7 dias, mediação aberta)**: é o propósito central da tela Consultar Pedido tal como já existe hoje (Blocos 1-4). Sem lacuna nova.

**Fase 4 — O paradoxo: cadastrar a devolução antes ou depois de conferir o produto?** Ponto mais importante desta análise. Uma pergunta parecida já tinha ficado em aberto desde 15/09/2026, em [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]: *"o Hub de Consulta parece o início natural do fluxo de Nova Devolução... ainda não decidido como (ou se) essa ponte é feita"*. Isso nunca foi fechado quando o Hub virou a tela Consultar Pedido de verdade (ver [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]]). O relato de hoje nomeia o mesmo problema de forma mais nítida: ela só sabe se vai precisar da Nova Devolução depois de conferir o produto fisicamente, então forçar essa decisão antes é atrito puro — e ela precisa poder criar a Nova Devolução a partir da própria tela Consultar Pedido, sem re-buscar o pedido em outro lugar. **Sem decisão até agora.**

**Fase 5 — Conferência com problema (fotos, anotações, salvar)**: coberta por [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]], já implementada e validada — bate com o relato.

**Fase 6 — Mediação com motivo diferente do motivo do cliente, fotos da conferência não reaproveitáveis**: sem registro anterior no vault. Dor nova: hoje não existe, em lugar nenhum do sistema, um jeito fácil de pegar as fotos já tiradas na conferência pra anexar na mensagem de mediação do Mercado Livre.

**Fase 7 — Acompanhar a mediação em andamento (prazo de resposta, hoje via abas fixadas no navegador)**: já é a motivação central do "Painel de Acompanhamento", dentro da mesma nota da Fase 4 — idealizado e mockado, não implementado.

**Fase 8 — Timing do relatório impresso vs. produto físico sem identificação**: sem registro anterior. Dor nova, com ideia concreta já proposta por Matheus: um mini-relatório compacto, tamanho de etiqueta térmica 10x15cm, pra colar no produto assim que a conferência termina (identificação provisória), reservando o relatório A4 completo pra quando a mediação for finalizada.

**Fora de escopo, por decisão explícita de Matheus nesta conversa**: processo de garantia com o fornecedor pros produtos que ficam como Troca.

## Dores identificadas — status em 18/09/2026 00:00

1. **Ponte Consultar Pedido → Nova Devolução** (Fase 4) — **resolvida** (ver "Decisões desta rodada" abaixo): a tela Consultar Pedido cria devolução nova ou leva pra existente. Falta só desenho de tela/implementação.
2. **Fotos da conferência inacessíveis na hora de abrir mediação** (Fase 6) — **implementada** (ver "Fase 6 implementada — fotos organizadas e tela de visualização" abaixo): fotos reorganizadas em pastas por pedido/peça no disco + tela nova de visualização completa da devolução, com as fotos de evidência reais agrupadas por peça.
3. **Mini-relatório compacto (etiqueta térmica 10x15cm)** (Fase 8) — **implementada no Django, falta validação física** (ver "Impressão direta implementada no Django" abaixo): conteúdo = resumo compacto (Pedido/NF/Cliente, Plataforma, Datas) + Produto/EAN/SKU; impressão direta via HTML/CSS + Ctrl+P (mesmo mecanismo do relatório A4), com os códigos de barra desenhados no navegador (JsBarcode) — o layout ZPL validado no Labelary virou só o caminho backup. Confirmado visualmente na pré-visualização de impressão; falta o teste físico real (impressora Zebra + leitor de código de barras), previsto pro dia seguinte.
4. **Reorganizar a lista de devoluções em abas** (pedido novo da Ana) — **decisão adiada de propósito**: Matheus quer resolver isso numa análise conjunta futura, olhando o sistema junto comigo.
5. **Botão "Visualizar" do relatório** (pedido novo da Ana) — **mecanismo confirmado, implementação em espera**: é só abrir a mesma página do relatório numa aba nova; Matheus pediu pra aguardar antes de implementar.

## Decisões desta rodada (17/09/2026 23:24)

Matheus respondeu direto às perguntas que ficaram em aberto nesta nota; abaixo o que ficou decidido e o que segue pendente:

1. **Correios — confirmado.** Matheus confirmou: "realmente algumas devoluções voltam pelos correios." Fecha a dúvida da Fase 1 — bate com a confirmação já vista via API em [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]] (`logistic_type: drop_off`, caso Dionifer, 17/09/2026).
2. **Fase 4 — ponte Consultar Pedido → Nova Devolução.** A tela Consultar Pedido passa a ter uma ação que cria uma devolução nova (quando ainda não existe uma pra aquele pedido) ou leva direto pra devolução já existente (quando já tem uma criada) — resolve o paradoxo "cadastrar antes ou depois de conferir": ela sempre parte da mesma tela, o sistema decide se cria ou reaproveita. Ainda sem desenho de tela nem implementação, só a decisão de comportamento.
3. **Fase 6 — fotos da conferência pra mediação.** Não é um botão dedicado de "enviar pra mediação". A solução é uma tela de visualização completa da devolução, mostrando todas as informações daquela devolução, incluindo as fotos da conferência organizadas e baixáveis — ela usa essa tela pra pegar o que precisar na hora de montar a mensagem de mediação no Mercado Livre.
4. **Fase 8 — mini-relatório em etiqueta térmica: ainda em aberto.** Matheus confirmou que já tem um modelo pensado pro conteúdo da etiqueta, mas a explicação ficou incompleta ("já tenho um modelo pensado no que poderia ter ...") — retomar quando ele completar essa ideia.
5. **Pergunta em aberto do lado do Claude, ainda sem resposta**: a tela nova da Fase 6 (visualização completa + fotos baixáveis) parece diferente do "Visualizar" que a Ana pediu (confirmado como só a mesma página do relatório aberta em aba nova) — ainda não está claro se são a mesma tela cumprindo dois papéis, ou duas telas separadas.
6. **Feedback da Ana (abas, colisão "Pendente", caso sem mediação, campo `relatorio_impresso_em`) — decisão adiada de propósito.** Matheus optou por resolver isso numa análise conjunta futura, olhando o sistema junto comigo pra decidir quais filtros fazem sentido e como agrupar visualmente — "vamos pensar em uma coisa por vez", ainda sem data marcada.
7. **Mecanismo do "Visualizar" — confirmado, implementação em espera.** Confirmado que é só abrir a mesma página do relatório numa aba nova, sem virar mais que isso — mas Matheus pediu pra aguardar antes de implementar.

## Decisões desta rodada (17/09/2026 23:33)

1. **Fase 8 — mini-relatório em etiqueta térmica: fechada (conteúdo).** Conteúdo final: os 3 blocos que já existem no "resumo compacto" da tela Consultar Pedido (Pedido & Cliente — Pedido/NF/Cliente; Plataforma; Datas) + um bloco novo com **Produto** (nome), **EAN** e **SKU**. ~~Abordagem técnica: a impressora é uma Zebra que aparece como impressora comum no Windows — mesmo padrão já usado no relatório A4 (view Django com CSS de impressão `@page` no tamanho 10x15cm + Ctrl+P), sem ESC/POS e sem biblioteca nova.~~ **Corrigido às 23:43 — ver seção abaixo.**

## Correção da abordagem técnica da etiqueta térmica (17/09/2026 23:43)

A abordagem técnica registrada às 23:33 estava errada. Matheus corrigiu como o fluxo real funciona: hoje **tudo** que imprime etiqueta térmica no dia a dia (ERP, Mercado Livre) já chega pronto em **PDF** — é isso que vai pra impressora Zebra. O ZPL só entra como caminho alternativo, usado ocasionalmente quando algo trava: nesse caso, pegam o código ZPL, colam no [Labelary](https://labelary.com/viewer.html) (que renderiza a etiqueta nas proporções reais — ferramenta de confiança deles há anos), baixam o PDF gerado pelo próprio Labelary, e imprimem esse PDF normalmente. Existe até um app instalado no PC que imprime direto de texto ZPL, mas quase nunca é usado.

Pra este mini-relatório, o caminho correto é: o layout é desenhado/expresso em **ZPL**, validado no Labelary (conferindo se as proporções fecham certinho no 10x15cm real), e o **PDF** que sai de lá é o que efetivamente vai pra impressora — o mesmo mecanismo de impressão que já usam pra tudo hoje. O Labelary entra só como etapa de prova visual antes de confiar no layout, não como formato final de impressão.

## Layout final da etiqueta térmica (ZPL) — validado em 18/09/2026 00:00

Depois de 4 rodadas testando no Labelary (8 dpmm / 203 dpi, 10x15cm — confirmado como a densidade certa já na v1), Matheus aprovou o layout final. Ajustes feitos ao longo das rodadas, cada um por feedback direto dele:

- **v1 → v2**: adicionado um segundo código de barras (EAN, além do código do pedido que ele já tinha pedido de cara).
- **v2 → v3**: os 2 avisos do linter do Labelary corrigidos (campo `^FB` centralizado/justificado precisa terminar com `\&`, e o `^BE` de EAN-13 espera 12 dígitos, não 13 — o 13º é calculado sozinho) — e reposicionamento: código de barras do pedido foi pro lado do número (em vez de ficar junto do EAN lá embaixo), código de barras do EAN foi pra dentro do bloco Produto.
- **v3 → v4**: espaçamento geral aumentado (v3 ficou "funcional mas feio", muito apertado) — sobrava bastante espaço em branco no fim do label (1200 dots de altura, uso real ficava bem menor), então deu pra distribuir tudo com mais respiro.

Conteúdo final: cabeçalho: PEDIDO + código de barras do pedido ao lado (Code 128, sem texto legível — o número já aparece por extenso ao lado); NF; CLIENTE; PLATAFORMA; DATAS (Venda, Recebido pelo cliente, Reclamação aberta, Recebido por nós); PRODUTO (nome) com o código de barras do EAN dentro do mesmo bloco (EAN-13, com texto legível — formato padrão de código de produto, com o dígito solto à esquerda e os dois grupos de 6, que é o jeito normal desse tipo de barcode); SKU ao lado do EAN; rodapé com data/hora de geração.

Dados de exemplo usados nos testes: pedido `2000017788033354` (o mesmo caso do Edgar usado como referência ao longo desta nota) — precisam ser substituídos pelos dados reais de cada devolução na hora da integração.

```zpl
^XA
^CI28

^FX ===== Cabecalho =====
^CF0,32
^FO40,40^FB720,2,0,C,0^FDDEVOLUCAO - IDENTIFICACAO PROVISORIA\&^FS
^FO40,105^GB720,3,3^FS

^FX ===== Bloco: Pedido & Cliente =====
^CF0,20
^FO40,135^FDPEDIDO^FS
^CF0,36
^FO40,160^FD2000017788033354^FS

^FX --- codigo de barras do pedido, ao lado do numero (sem texto, ja mostrado ao lado) ---
^FO430,130^BY2
^BCN,70,N,N,N,A
^FD2000017788033354^FS

^CF0,20
^FO40,225^FDNF^FS
^CF0,36
^FO40,250^FD17.344^FS

^CF0,20
^FO40,310^FDCLIENTE^FS
^CF0,30
^FO40,335^FB720,2,0,L,0^FDEDGAR AUGUSTO BATISTA\&^FS

^FO40,395^GB720,3,3^FS

^FX ===== Bloco: Plataforma =====
^CF0,20
^FO40,420^FDPLATAFORMA^FS
^CF0,32
^FO40,445^FDMercado Livre - Venda comum^FS

^FO40,500^GB720,3,3^FS

^FX ===== Bloco: Datas =====
^CF0,20
^FO40,525^FDDATAS^FS
^CF0,26
^FO40,552^FDVenda: 06/08/2026^FS
^FO40,594^FDRecebido pelo cliente: 08/08/2026^FS
^FO40,636^FDReclamacao aberta: 23/08/2026^FS
^FO40,678^FDRecebido por nos: 08/09/2026^FS

^FO40,735^GB720,3,3^FS

^FX ===== Bloco: Produto (com codigo de barras do EAN dentro do bloco) =====
^CF0,20
^FO40,760^FDPRODUTO^FS
^CF0,30
^FO40,785^FB720,2,0,L,0^FDCADEIRA DE TRANSFERENCIA ELEVACAO HIDRAULICA\&^FS

^CF0,20
^FO40,875^FDEAN^FS
^FO40,900^BY3
^BEN,70,Y,N
^FD789123456789^FS

^CF0,20
^FO430,875^FDSKU^FS
^CF0,32
^FO430,900^FDCAD-TRANSF-001^FS

^FO40,1020^GB720,3,3^FS

^FX ===== Rodape =====
^CF0,18
^FO40,1045^FDGerado em DD/MM/AAAA HH:MM^FS

^XZ
```

## Impressão direta implementada no Django (18/09/2026 00:48)

Depois do layout ZPL aprovado, Matheus pediu pra implementar de verdade — mas esclareceu que o ZPL/Labelary é só o caminho **backup** (igual ERP/Mercado Livre já fazem hoje): o caminho prático do dia a dia devia ser igual ao relatório A4, imprimindo direto pela impressora (que aparece como impressora comum no Windows), sem passar pelo Labelary toda vez.

Implementação: nova tela (`imprimir_etiqueta_termica_devolucao`) — página HTML com `@page 10x15cm` e botão "Imprimir" (Ctrl+P), mesmo mecanismo do relatório A4. Os códigos de barra (pedido e EAN/SKU do produto) são desenhados no próprio navegador via JsBarcode (biblioteca JS, carregada por CDN, zero dependências) — sem gerar imagem no servidor nem precisar de lib Python nova (não mexe no empacotamento do sistema em .exe). A tela do ZPL (já existente, ver "Layout final da etiqueta térmica" acima) virou o backup, só acessível a partir de um link dentro da tela principal — deixou de ser o botão direto em Devoluções Pendentes.

Bug encontrado e corrigido no meio do caminho: a primeira versão da tela de impressão direta saiu com um vão de espaço em branco grande no fim da etiqueta. A causa raiz era a margem padrão que o navegador aplica em tags `<p>` (1em em cima e embaixo) — várias linhas do conteúdo (pedido, NF, cliente, plataforma, produto, SKU, rodapé) usavam `<p>` sem zerar essa margem, e aumentar a fonte pra tentar preencher o vão só piorou (1em cresce junto com a fonte). Corrigido com `p { margin: 0; }` no CSS. Confirmado por Matheus na pré-visualização de impressão do navegador: 1 página, sem cortar nada, os dois códigos de barra nítidos.

**Ainda pendente**: o teste físico real — imprimir de verdade na Zebra e ler os dois códigos de barra com o leitor do dia a dia — previsto pro dia seguinte (Matheus: "aparentemente tudo perfeito, só vou saber de verdade amanhã"). Só depois dessa confirmação a Fase 8 fecha o ciclo completo (Idealizar → Executar → Validar).

## Fase 6 implementada — fotos organizadas e tela de visualização (18/09/2026 02:06)

A dor da Fase 6 (fotos da conferência inacessíveis na hora da mediação) saiu do papel, em 2 partes combinadas com Matheus.

**Reformulação do problema**: Matheus notou que as fotos já ficam salvas num disco local de verdade (`MEDIA_ROOT`) — então não era uma dor de "criar botão de download", e sim de organização de arquivos: hoje as fotos ficam soltas numa pasta única. Decisão: estrutura `Devoluções/Pedido_<numero>/Fotos do cliente|Fotos da conferencia/`, com nome de arquivo numerado por peça (`<peça>_1.jpg`, `<peça>_2.jpg`...).

**Parte A — organização das pastas**: os models `FotoConferenciaPeca`/`FotoReclamacaoCliente` passaram a calcular o caminho de upload dinamicamente (fotos novas já caem organizadas). Pra reorganizar as fotos que já existiam, foi criado um comando de reorganização com simulação por padrão e sem nunca sobrescrever arquivo — que depois virou também uma tela de manutenção dentro do próprio sistema (`/manutencao/reorganizar-fotos/`, sem link em nenhum menu, roda em cima da empresa ativa), porque o PC da Ana não tem Python/terminal instalado. Um bug real foi encontrado e corrigido durante o teste: o atalho que dizia "já estava certa" confiava cegamente no banco sem checar se o arquivo existia de verdade no disco — mascarou uma inconsistência que o próprio Matheus criou ao restaurar um backup antigo por cima depois de já ter testado a reorganização. Corrigido, testado de novo e validado com sucesso no banco `magazine`.

**Parte B — tela de visualização** (`visualizar_devolucao`): tela nova, só leitura, desenhada primeiro como mockup e aprovada por Matheus antes de virar código — mostra todos os dados da devolução (incluindo os que só apareciam no relatório A4) e as peças conferidas com as fotos de evidência reais agrupadas por peça (antes o sistema não mostrava foto nenhuma da conferência fora da tela de edição). Confirmado que essa tela é diferente do "Visualizar" simples que a Ana pediu (que continua sendo só abrir o relatório A4 numa aba nova — ainda não implementado, ver "Em aberto"). Um bug pequeno (rota duplicada em `urls.py`) foi encontrado e corrigido na sincronização.

**Extra — abrir pasta no Explorer**: botão que dispara o Explorer do Windows direto na pasta das fotos, sem a Ana precisar navegar manualmente (só funciona porque o servidor roda no mesmo PC de quem clica). Pendência conhecida: o Explorer abre mas não vem sozinho pro primeiro plano — comportamento intencional do Windows (trava de "foreground lock"), não bug do sistema; a correção "oficial" (API `AllowSetForegroundWindow`) foi pesquisada e não se aplica de forma confiável a esse cenário (processo em segundo plano reagindo a uma requisição HTTP, sem o direito de foreground; e o Explorer nem cria um processo novo de verdade pra mirar). **Decisão de Matheus (18/09/2026 02:14): manter como está** — a pasta abrir e só piscar na barra de tarefas é aceitável, não vale o custo de uma correção mais pesada e frágil (hack via `ctypes`/thread input) pra esse ganho pequeno.

## Feedback literal da Ana sobre a tela de Devoluções Pendentes (17/09/2026)

> Algumas dores que a Ana me pasou:
>
> SAMVALE e MAGAZINE BRASILEIRO
> CATEGORIA: Devoluções
>
> 1º) abrir 2 abas - (se possível) caso tiver ideias - me avisar antes
> * Pendentes (esperando o reembolso em mediação)
> * Concluidas¹ (impressas)
> * Concluidas² (não impressas)
>
> 2º) Adicionar o campo de "Visualizar" o relatório da devolução

## Análise do feedback da Ana — cruzando com o código atual (feita por Claude, 17/09/2026)

Conferido contra `devolucoes/models/devolucao.py`, `devolucoes/views.py` (`devolucoes_pendentes`) e `devolucoes/templates/devolucoes/devolucoes_pendentes.html`, que hoje mostram uma lista única (sem abas), ordenada por `-criado_em`, com badge "Pendente" (quando `destino_produto` está vazio, ou seja, ainda não conferida) ou "Conferida — {destino}" (quando já conferida), e botões "Continuar conferência"/"Editar conferência" + "Imprimir relatório", sempre com "Editar" e "Excluir".

1. **Colisão de nome em "Pendente"**: a tela hoje já usa a palavra "Pendente" pra dizer "ainda não conferida" (derivado de `destino_produto` vazio). Ana está pedindo uma "Pendente" diferente — "esperando o reembolso em mediação" — que é outro estado (mediação em andamento), sem nenhum campo hoje que rastreie isso diretamente (o mais próximo é `data_abertura_mediacao` preenchida e `data_finalizacao_mediacao` vazia). As duas "Pendente" não podem virar a mesma aba sem antes decidir o que Ana quer dizer com o termo.
2. **Ambiguidade 2 vs. 3 categorias**: Ana escreveu "abrir 2 abas" mas listou 3 itens (Pendentes / Concluídas¹ impressas / Concluídas² não impressas) — pode ser 2 abas com uma delas subdividida, ou 3 abas de verdade. Ela mesma pediu pra ser consultada antes de qualquer implementação, então essa ambiguidade é motivo suficiente pra voltar com ideias antes de decidir sozinho.
3. **Falta um campo que rastreie "impresso"**: nenhum campo do model `Devolucao` guarda se o relatório já foi impresso — pra existir a distinção Concluída¹ (impressa) vs. Concluída² (não impressa) proposta por Ana, esse campo precisa ser criado (ex.: `relatorio_impresso_em`, nullable, preenchido no acesso à view `imprimir_relatorio_devolucao`).
4. **Pergunta em aberto — devolução conferida sem mediação**: uma devolução já conferida (tem `destino_produto`) mas sem mediação aberta (`data_abertura_mediacao` vazia) não está "esperando reembolso em mediação" nem entra claramente em "Concluída" no sentido que Ana quis dizer (ela parece ligar "Concluída" a "relatório impresso ou não", não a "mediação encerrada"). Precisa alinhar com Ana o que esse caso deveria mostrar.
5. **Ideia de unificar "Visualizar" com "Imprimir"**: a view `imprimir_relatorio_devolucao` já renderiza o relatório como HTML comum (o PDF é gerado pelo Ctrl+P do navegador, decisão de 08/09/2026) — então "Visualizar" pode ser o mesmo relatório, só que exposto como link/botão separado do fluxo de impressão, sem inventar uma segunda renderização.

## Conectando tudo — mesmo tema da decisão de 16/09/2026 (feita por Claude, 17/09/2026)

Matheus perguntou diretamente se essa amarração fazia sentido, e faz: cruzando o relato das 8 fases com o feedback novo da Ana contra [[De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]], quase tudo aqui é o mesmo tema de "temos várias telas funcionais, mas com pouca integração entre si", só que aprofundado:

- **Fase 6** (fotos da conferência inacessíveis na hora de abrir mediação) é a mesma dor do ponto 1 daquela decisão: *"Depois de terminar de conferir uma devolução, ela não tem acesso fácil às fotos tiradas"* — 16/09 já tinha nomeado isso; o relato de hoje só mostra o cenário real (mediação do Edgar) onde essa falta dói na prática.
- **Fase 7** (acompanhar mediação por abas fixadas no navegador) + **as abas que Ana pediu agora** (Pendentes/Concluídas¹/Concluídas²) são a mesma dor do ponto 2 daquela decisão: *"Precisa filtrar mediações"* — o pedido de hoje é a mesma necessidade, só que aplicada à lista de devoluções em vez de à lista de mediações.
- **Fase 4** (o paradoxo cadastrar-antes-ou-depois-de-conferir, ponte Consultar Pedido → Nova Devolução) é o item que já estava em aberto desde 16/09: *"Mapear a integração/navegação entre as telas do sistema (Devolução, Produtos/Peças, Consultar Pedido/Mediação, Home)"* — e também já tinha aparecido em 15/09, na nota das 3 Telas ([[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]). Nunca foi fechado.
- O pedido do **"Visualizar"** é o mesmo tema de novo: hoje só existe "Imprimir", que já dispara o fluxo de impressão do navegador — Ana quer poder olhar o relatório sem esse compromisso, ou seja, quer mais um jeito de navegar entre o que já existe, não uma tela nova.
- A única coisa genuinamente nova nesse cruzamento inteiro é a **Fase 8** (mini-relatório em etiqueta térmica 10x15cm) — não é sobre integração entre telas existentes, é uma necessidade física nova (identificação provisória do produto) que a decisão de 16/09 não cobria.

Ou seja: o projeto não está descobrindo dores novas a cada conversa — está vendo o mesmo gargalo (telas funcionais, integração fraca) de ângulos cada vez mais específicos. A exceção real é a etiqueta térmica.

## Em aberto

- [ ] Validar fisicamente a etiqueta térmica (imprimir na Zebra de verdade + ler os 2 códigos de barra com o leitor do dia a dia) — implementação já feita e confirmada na pré-visualização (18/09/2026 00:48), ver "Impressão direta implementada no Django" acima.
- [ ] Desenhar a tela/fluxo da ponte Consultar Pedido → Nova Devolução (comportamento já decidido: cria nova ou leva pra existente).
- [ ] Sessão conjunta sobre a tela de Devoluções Pendentes: abas (2 vs. 3 categorias), colisão de nome em "Pendente", caso "conferida sem mediação aberta" e campo novo `relatorio_impresso_em` — decisão adiada de propósito por Matheus, sem data marcada.
- [ ] Implementar o botão "Visualizar" (mecanismo já confirmado: abrir o relatório em aba nova) — aguardando o momento certo, por pedido de Matheus.
- [ ] Processo de garantia com fornecedor pra produtos "Troca" — fora de escopo por ora, revisitar depois.

## Relacionado

- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
- [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]
- [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]
- [[Consultar Pedido Passa a Aceitar NF, Nome e Endereço Além do Número — Escopo Fechado e Validado Contra a Prioridade da Ana]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
- [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]]
- [[De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]]
- [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]]
