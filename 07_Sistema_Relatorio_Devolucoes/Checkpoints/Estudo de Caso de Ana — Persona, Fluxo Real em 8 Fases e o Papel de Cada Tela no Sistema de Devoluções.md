---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 20/09/2026
atualizado_em: 20/09/2026 20:24
relacionado: [[Relato Completo do Fluxo Real de Devolução Depois que o Pacote Chega — 8 Fases e Cruzamento com o Vault]], [[De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]], [[Análise do UX Flow da Responsável pela Devolução]], [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]], [[Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor]], [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]], [[Prazo de Resposta Manual na Mediação ML — Campo Editável, Badges de Urgência e Filtro, Já que o due_date da API Nunca Vem Preenchido]]
resumo: Depois de fechar a feature de Prazo de Resposta e a correção do aviso-global, Matheus pediu explicitamente pra parar de pensar em código por um tempo e fazer um estudo de caso real sobre Ana — entender o dia a dia dela, o motivo de cada tela existir individualmente, como as telas se comportam como sistema, e onde/quando/como/por que ela usaria cada uma. Esta nota é a síntese dessa pesquisa, construída 100% em cima de material já registrado no vault (nunca inventado) — o relato literal das 8 fases que Matheus descreveu do fluxo dela depois que o pacote chega, o feedback literal dela sobre a tela de Devoluções Pendentes, a decisão de 16/09 sobre "telas funcionais mas pouco integradas", e as notas de idealização de cada tela (Consultar Pedido, Visualizar Devolução, as 3 telas de mediação, a análise de UX do Catálogo). Reconstrói quem é Ana (sozinha nas 2 empresas, sem conhecimento técnico, PC modesto no barracão + celular), narra o dia dela em 8 fases com o status real de cada dor, cataloga o motivo de existir de cada tela do sistema, mapeia as pontes já fechadas entre elas contra o que ainda está isolado (o Catálogo de Produtos/Peças, só idealizado, sem diff aplicado), e fecha com o mapa de uso real dela por fase (celular só na chegada do pacote, PC pra quase tudo o resto).
---

# Estudo de Caso de Ana — Persona, Fluxo Real em 8 Fases e o Papel de Cada Tela no Sistema de Devoluções

## Gatilho — pedido explícito de Matheus

Depois de fechar a feature de Prazo de Resposta e a correção do aviso-global no mesmo dia, Matheus pediu explicitamente pra dar um passo atrás:

> "eu quero dar um passo atras agora e parar de pensar em codigo por um tempo. Precismos fazer um estudo de caso, pensar na vida real e no dia a dia dela, de uma pessoa que não é dev, que é apenas o usuario final, e que tem dores e objetivos a serem resolvidos. precisamos parar e entender o que ela precisa considerando toda a idealização desse projeto de sistema interno de devoluções, e de cada uma das telas que ele possui. precisamos entender o motivo de cada uma existir de forma individual, e de como cada uma se comporta no coletivo... precisamos entender onde, quando, como e por que ela usaria cada uma das telas de forma geral."

Esta nota é a resposta a esse pedido — nenhum código foi gerado, é síntese pura em cima do que já estava documentado.

## Quem é Ana

Ana não é "a usuária" — é a única funcionária do setor de devolução, sozinha, cuidando de duas empresas ao mesmo tempo (Magazine e Samvale). Qualquer coisa que exista em dobro no negócio (pedido, mediação, relatório, peça) existe em dobro pra ela também, sem ninguém pra dividir. Ela trabalha no barracão — fisicamente longe do escritório de Matheus — num PC modesto (i5 4570, 8GB RAM DDR3, SSD recém-trocado, monitor BRX 20" 1440x900, descrito pelo próprio Matheus como "sem qualidade nenhuma") e tem também um celular, que entra em cena em momentos específicos do fluxo físico, não como alternativa geral ao PC. Cerca de 99% do uso real é desktop.

Ela não tem conhecimento técnico — não abre terminal, não roda comando Python, não sabe o que é migration. É por isso que uma regra aparece o tempo todo nas decisões técnicas deste projeto: o `.exe` que ela usa precisa ser autossuficiente, sem depender de nenhum comando manual de Matheus à distância (caso real: a linha de varredura que não existia no banco da Samvale precisou se autocorrigir sozinha no clique dela).

Ela também escreve pelo Mercado Livre — as notas manuais nos pedidos, feitas pela conta admin compartilhada (Alessandro Domingos), são quase sempre digitadas por ela mesma, sempre assinando o próprio nome no texto. Ela não é só quem confere produto fisicamente: é quem efetivamente conversa com o Mercado Livre em nome da empresa.

## O dia dela, contado por Matheus, em 8 fases

Relato literal dele, fase por fase, quando parou pra repensar o sistema do zero (17/09/2026):

**Fase 1 — o motorista chega.** 3 vias físicas: transportadora do próprio Mercado Livre (99% dos casos, confirmada por QR Code lido no app do celular), Correios (confirmado por Matheus que acontece, mesmo incomum) e transportadora terceirizada contratada à parte (produtos grandes, tipo cadeira). A partir daqui o papel do motorista acaba.

**Fase 2 — descobrir qual venda é aquela.** 3 caminhos possíveis: buscar direto no Mercado Livre pelo número da venda ou Pack ID, buscar no ERP (venda, nota fiscal, nome, endereço) ou buscar na tela Consultar Pedido do sistema. Os 3 convivem — o sistema não substitui os outros dois, compete por atenção com eles.

**Fase 3 — ganhar contexto, sem agir ainda.** Antes de tocar no produto, ela precisa saber: por que o cliente devolveu, se a reclamação foi aberta dentro ou fora do prazo de 7 dias, e se já existe mediação aberta. Nas palavras de Matheus, aqui "ela não toma ação nenhuma, ela apenas ganha contexto" — é esse papel que justifica a tela Consultar Pedido: entregar contexto organizado, sem pedir decisão dela ainda.

**Fase 4 — o paradoxo.** Só depois de conferir o produto fisicamente ela sabe se vai precisar cadastrar aquilo como devolução. Cadastrar antes é arriscar abrir devolução à toa; conferir antes e cadastrar depois significa repetir a busca do pedido em outra tela. **Resolvida** — ponte Consultar Pedido → Nova Devolução: ela parte sempre do mesmo lugar, e o sistema decide sozinho se cria devolução nova ou reabre a existente.

**Fase 5 — a conferência real.** Produto com problema: fotos, anotações, salva. Produto perfeito: resolve direto no site do ML e no ERP, sem gerar devolução nenhuma aqui. **Já implementada** desde antes desta análise (tela Nova Devolução).

**Fase 6 — abrir a mediação, com um motivo que pode ser outro.** O motivo que o cliente deu na reclamação nem sempre é o motivo real do problema achado na conferência (caso Edgar: reclamação de incompatibilidade, mediação aberta por "produto retornou com riscos e sujo", anexando as fotos da conferência). Dor nomeada por Matheus: não existia jeito fácil de pegar essas fotos de volta. **Resolvida** — pastas de fotos reorganizadas por pedido/peça + tela Visualizar Devolução.

**Fase 7 — acompanhar a mediação em andamento.** Mediação leva dias, cada mensagem nova do ML tem prazo pra resposta. Antes: abas fixadas no navegador, uma por mediação, conferidas na mão. **Resolvida** — Mediações ML (Painel de Acompanhamento), incluindo a feature de Prazo de Resposta manual, editável, com badges de urgência.

**Fase 8 — o descompasso entre imprimir e identificar.** Ela só quer imprimir o relatório definitivo quando a mediação fecha — mas o produto físico fica sem identificação nenhuma enquanto isso, correndo o risco real de se misturar entre os dois barracões (MB e SV) antes da mediação encerrar. **Resolvida** — etiqueta térmica 10x15cm de identificação provisória, validada fisicamente na Zebra.

**Fora de escopo, por decisão explícita de Matheus**: o processo de garantia com fornecedor para produtos que ficam como Troca — existe no mundo real dela, mas não faz parte deste desenho.

## Tela por tela — por que cada uma existe

**Consultar Pedido.** Resolve as Fases 2 e 3 inteiras. Ponto único de entrada quando o pacote está na mão dela: aceita número do pedido, ID do cliente ou Pack ID, e — quando há mais de um pedido possível — mostra uma lista de desambiguação honesta ("eu não sei o que está na sua mão, por isso te dou o máximo de informação organizada pra você escolher a certa") antes de abrir o detalhe. O detalhe entrega o que a Fase 3 pede: motivo literal do cliente, status do prazo de 7 dias, mediação aberta ou não, atalhos diretos pro pedido/reclamação/mediação reais dentro do ML (decidido depois de descartar embutir o ML de verdade num iframe — bloqueado por cookie de terceiro e proteção contra clickjacking). Ali também nasce o botão "Criar devolução", resolvendo a Fase 4.

**Nova Devolução (com a Conferência dentro).** Resolve a Fase 5. É onde o problema físico vira registro: peça por peça, com foto e anotação, mais os dados financeiros (preço do produto, puxado da API quando vem pela ponte; valor reembolsado, sempre manual, porque não existe campo confiável pra isso na API do ML). Existe porque a conferência é o único momento em que alguém olha o produto de verdade — tudo que vem depois (mediação, relatório, etiqueta) depende do que foi registrado aqui.

**Devoluções Pendentes (as 5 abas).** Existe pra responder "num universo de N devoluções, quais eu preciso tocar agora?". As abas — Aguardando Conferência → Conferidos → Mediações Abertas → Mediações Encerradas → Impressos — seguem o caminho real do produto, sem volta, porque "uma vez impresso é porque o processo foi realmente finalizado". É a tela que ela abre pra saber o que fazer em seguida, não pra ver detalhe de uma devolução específica.

**Visualizar Devolução.** Existe especificamente pra Fase 6 — reunir, numa tela só de leitura (nada editável, sem risco de mexer sem querer), tudo que ela precisa pra montar a mensagem de mediação: fotos de peça-com-problema agrupadas num grid único (porque a mediação do ML funciona como chat, ela anexa várias fotos de uma vez, sem vincular foto a peça específica), motivo do cliente, anotações da mediação, e o link "Editar devolução" — que a idealização descobriu que simplesmente não existia antes em lugar nenhum dessa tela.

**Mediações ML (Painel de Acompanhamento).** Resolve a Fase 7 — substituto direto das abas fixadas no navegador. Nasceu de uma ideia de 3 telas (Painel + Detalhe + Hub de Consulta): o Hub virou o Consultar Pedido, Painel+Detalhe viraram esta tela. Separa mediações "encontradas pelo sistema" (varredura automática) de mediações "em acompanhamento" (ela escolhe rastrear), com chat colorido por papel (mesma paleta do Consultar Pedido), ícones de anexo clicáveis, e prazo de resposta editável com badges de urgência.

**Etiqueta térmica (identificação provisória).** Resolve a Fase 8 sozinha — não é integração entre telas, é uma necessidade física nova. 10x15cm, impressa direto da tela (HTML/CSS + Ctrl+P, códigos de barra desenhados no navegador), ZPL/Labelary só como backup. Mostra "EM MEDIAÇÃO" quando aplicável — o motivo dela existir é impedir que o produto se misture entre os dois barracões antes da mediação fechar.

**Relatório A4.** Fechamento formal, só impresso quando a mediação encerra de fato. Existe em dois formatos (tabela e cards, nunca um substituindo o outro — a escolha é dela) e foi otimizado pra ocupar 1 folha sempre que os dados permitirem, sem cortar conteúdo à força.

**Catálogo (Produtos/Peças).** Única frente ainda presa na fase de idealização, sem diff aplicado. Diagnóstico real: Marca, Grupo Fornecedor e Produto já são "objetos autossuficientes" (CRUD completo, sozinhos); Peça não é — o CRUD dela muda conforme está ou não vinculada a um produto, e vincular peça a produto hoje são duas experiências diferentes (bipar código de barras vindo da peça avulsa, buscar por nome vindo do produto) resolvendo a mesma vontade de dois jeitos. Existe pra ela organizar o cadastro fora do calor da devolução, mas hoje ainda entrega atrito, não valor — exatamente a dor nomeada em 16/09 ("Precisa cadastrar produtos com menos fricção", "Precisa ver peças com mais facilidade"), ainda aberta.

## Como as telas se comportam juntas — o sistema como um todo

O tema que atravessa quase tudo isso, nas palavras da decisão de 16/09/2026, é: **telas funcionais, mas com pouca integração entre si**. Isolada, cada tela sempre "funcionava" — o problema nunca foi bug, foi o intervalo entre elas.

As pontes já fechadas contam essa história: Consultar Pedido → Nova Devolução elimina o atrito da Fase 4; a reorganização de pastas de fotos + a tela Visualizar Devolução elimina o atrito da Fase 6; as 5 abas de Devoluções Pendentes viraram a espinha dorsal que amarra o ciclo de vida inteiro (do "ainda não conferi" até "já imprimi"), junto com o filtro de reembolsados e a busca global cruzando as 5 abas de uma vez; o prazo de resposta na tela de Mediações ML conecta direto com a aba "Mediações Abertas" das Pendentes, os dois falando a mesma urgência.

O que ainda não está costurado: o Catálogo continua isolado do resto — não conversa com a Fase 5 (a conferência já teria motivo de sugerir peça a partir do que foi cadastrado ali) do jeito fluido que a Consultar Pedido conversa com a Nova Devolução. E a garantia com fornecedor pra produtos "Troca" é uma dor real que existe no mundo dela, mas foi conscientemente deixada de fora — não é integração fraca, é escopo que ainda não entrou.

## Onde, quando, como e por que ela usaria cada tela

No momento em que o motorista chega (Fase 1), é celular — ela lê o QR Code do app do Mercado Livre pra confirmar quantos pacotes recebeu; nenhuma tela do sistema entra aqui ainda. A partir do pacote na mão (Fases 2 a 6), é PC — Consultar Pedido pra identificar e ganhar contexto, Nova Devolução/Conferência pra registrar o que ela vê e fotografa, Visualizar Devolução no momento de escrever a mensagem de mediação (ela alterna entre essa aba e a aba do Mercado Livre, arrastando foto direto, do mesmo jeito que fazia antes com o WhatsApp Web). A etiqueta térmica é impressa uma vez, no fim da conferência, antes do produto ir pra qualquer lugar — gatilho físico (produto na bancada), não uma sessão de trabalho. Mediações ML é uso disperso ao longo dos dias seguintes, cada vez que ela quer saber "alguém me respondeu?" — a tela que ela volta a abrir sem estar no meio de nenhuma outra tarefa, puro monitoramento. Devoluções Pendentes é a tela de abertura do dia — o "o que eu preciso tocar agora, entre tudo que está em andamento" — e o Relatório A4 só entra no fim de tudo, quando a mediação fecha e o produto já pode seguir pro segundo barracão. O Catálogo é a única tela sem gatilho ligado ao fluxo físico da devolução — ela entra ali fora do calor do dia a dia, o que é justamente por que a fricção de hoje dói mais: não tem urgência física empurrando ela a tolerar o atrito.

## Em aberto

- [ ] Desenho concreto da reestruturação do Catálogo (gaveta de Peças própria, ação única de vínculo Peça↔Produto) — ainda só princípio e diagnóstico, nenhuma tela desenhada.
- [ ] Ponte entre Catálogo e a Fase 5 (conferência sugerindo peça a partir do que já está cadastrado) — nunca chegou a ser cogitada formalmente, é uma lacuna identificada só nesta síntese.
- [ ] Processo de garantia com fornecedor pra produtos "Troca" — fora de escopo por decisão explícita, revisitar depois.
