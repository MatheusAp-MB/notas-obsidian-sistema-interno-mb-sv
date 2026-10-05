---
tipo: checkpoint
dominio:
status: em_andamento
criado: 04/10/2026
atualizado_em: 04/10/2026 04:33
relacionado: [Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026), Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML, Chat do ML na Consultar Pedido - Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna, Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias, Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida, Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao, Validacao Mobile em Aparelho Real - Teste Real Liberado em 02-10-2026, De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]
---

# Consultar Pedido como Ponto Único de Consulta da Ana — Topo Reorganizado Parte por Parte (02 a 04/10/2026)

## Última atualização

04/10/2026, 04:33 — acrescentado o passo 21: a validação em lote nas 49 devoluções existentes (ver [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]]).

04/10/2026, 03:47 — acrescentados os passos de depois das 00:13: melhorias do chat, acordeão em 3 camadas, linha do tempo de 7 datas e a busca em 3 ondas paralelas (de ~6,4 s para ~1,5 s). Às 00:13 a nota tinha sido criada, registrando tudo o que foi feito na tela de 02/10/2026 até aquele momento, com os motivos de cada escolha. Horários em Brasília.

**Resumo do estado atual**: a tela Consultar Pedido deixou de ser só a "porta de entrada" do sistema e passou a ser o lugar onde a Ana vê, organizado e de uma vez, o máximo de dados de um pedido — em qualquer fase em que ele esteja. O topo foi reorganizado em 3 grupos por assunto, ganhou a foto do anúncio e a do cadastro interno, botões de copiar discretos e uma linha do tempo de 6 datas com o tempo entre elas. Está aplicado na pasta do projeto e Matheus, depois de testar, disse que "por enquanto está ótimo". Falta validar 3 cenários reais e ouvir a Ana (ver "Em aberto").

**Atualização das 03:47**: depois do topo, a tela ganhou um chat refeito (ver [[Chat do ML na Consultar Pedido - Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna]]), perdeu o bloco "Reclamação" (acordeão de 3 camadas), passou a ter a linha do tempo com 7 datas e ficou ~4 vezes mais rápida (ver [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]). Matheus testou a velocidade e disse que está "bem rápida"; o que falta é provar que a versão nova mostra o mesmo que a antiga em outros tipos de pedido.

**Atualização das 04:33**: a tela foi rodada sobre as 49 devoluções existentes sem nenhum erro, resultado instável ou 429, com ~0,94 s por consulta (ver [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]]). As diferenças que sobraram são de cadastro (4 tipos de venda errados na MB, 2 datas de reclamação com 1 mês a mais, 1 preço) e há uma decisão em aberto sobre a data "Mediação encerrada". A análise concluiu que, tecnicamente, a tela pode ser considerada fechada para as devoluções existentes; Matheus ainda não declarou isso.

> [!warning] EM ANDAMENTO
> Aplicado e aprovado visualmente por Matheus. Ainda **não** validado em pedido com mediação real, em pedido encerrado sem mediação e em pedido ainda não cadastrado, e ainda não visto pela Ana no monitor dela.
> A rodada em lote de 04/10 (49 devoluções cadastradas, sem erro) olhou só os dados, não a imagem: a conferência visual continua pendente.

## Contexto

**O que é a tela Consultar Pedido**: a tela onde a Ana busca um pedido do Mercado Livre (pelo ID do cliente ou pelo número da venda) e vê os dados dele vindos da API do Mercado Livre, cruzados com o que ela cadastrou no sistema (ver [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]).

**Quem usa e onde**: a Ana é a única funcionária do setor de devolução e cuida das duas empresas (MB e SV). O monitor dela tem 20" e 1440×900 (cerca de 735 px de altura útil no navegador). Matheus testa em um monitor de 27" QHD, bem maior.

**Pedido-base do estudo**: 2000018229470186 (conta SV). Foi escolhido por Matheus por ser um pedido **real**, que está no banco, foi cadastrado pela Ana, tem devolução finalizada e relatório impresso — a ideia é estudar um pedido real a fundo, usar de base e só depois partir para outro ("primeiro faz funcionar, depois otimiza").

**Onde mora cada parte do código**:

| Arquivo | O que tem lá |
|---|---|
| `integracao_mercado_livre/views.py` | A função `view_consultar_pedido` (monta todos os dados da tela) e os 3 ajudantes novos da linha do tempo: `_dia_local`, `_tempo_entre`, `_montar_datas_do_caso` |
| `integracao_mercado_livre/templates/integracao_mercado_livre/consultar_pedido.html` | O HTML do topo: 3 grupos, linha do tempo e rodapé de ações |
| `integracao_mercado_livre/static/integracao_mercado_livre/css/layout_consultar_pedido.css` | O estilo do topo, incluindo as regras que mudam o layout conforme a largura |

**Como o trabalho foi aplicado (exceção autorizada)**: Matheus conectou a pasta `Projeto-Sistema-Devolucao` e autorizou Claude a aplicar as mudanças **direto nos arquivos dessa pasta**, em vez de mandar diffs para ele aplicar à mão. Isso é uma exceção à regra geral de que Claude nunca aplica código direto num repositório. As condições dele: Claude **não executa nenhum comando git** nessa pasta (só ele faz commit e push) e **não cria cópias ou backups** dos arquivos antes de editar (o git já versiona; se algo der errado, ele descarta as mudanças).

## Linha do tempo

### 02/10/2026 — ponto de partida

- **Diagnóstico de Matheus**: muita coisa construída no sistema não é robusta nem validada o bastante, e há dados que não são reais. A Consultar Pedido — a tela que ele mais queria que funcionasse — a Ana não usa porque ela não traz dados consistentes.
- **Causa que ele aponta**: faltavam objetos de teste e tempo de testar no escritório (rotina de alta demanda). Agora ele tem o banco real de uso da Ana no PC de casa, o que viabiliza uma validação melhor.
- **Foco**: exclusivamente a Consultar Pedido, resolvendo 1 pequeno problema por ciclo, escolhido por ele — sem virar auditoria ampla do sistema.
- **Plano proposto por ele**: (1) listar, de forma organizada, todos os campos que a tela traz para todas as devoluções do banco; (2) rebuscar todos os pedidos pela API e comparar "o que existe manual" com "o que a API trouxe".
- **Forma de trabalhar**: scripts Python de exploração rodados por ele no VS Code (pasta `scripts_exploracao_ML`), lendo o banco direto pelo Django; sem SQL e sem Workbench.

### 03/10/2026 (sábado, em casa) — estudar antes de criar

- Matheus quis parar com a tentativa e erro: primeiro estudar o endpoint, registrar no vault e analisar o que já existe e está validado (por exemplo, no Sistema Interno V2) antes de criar algo novo; entender onde está, o que faz, por que faz e por que se escolheu uma opção e não outra; seguir o Ciclo de Trabalho Calmo.
- Escolheu o **pedido-base** 2000018229470186 (ver "Contexto").
- **Hipótese dele, ainda não verificada**: diversas vendas (por exemplo, cadeira de transferência) são entregues por transportadora, o que explicaria por que alguns pedidos registrados como devolução não têm "devolução física" no Mercado Livre.
- **4 decisões sobre dados da tela** — valor reembolsado, tipo de venda FULL/comum, motivo da reclamação e abertura da mediação — registradas em [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]].

### Da noite de 03/10 até 00:13 de 04/10/2026 — o topo da tela, parte por parte

Esta é uma sequência de verdade: cada passo nasceu da resposta de Matheus ao anterior.

1. **Decisão de atacar os 4 problemas de dados de uma vez** e acesso à pasta do código (ver "Como o trabalho foi aplicado").
2. **Virada de método** (palavras dele): o erro era pensar "temos muitos dados, vamos usar para algo, criar coisas, comparar". O certo é entender o que a Ana precisa e usar os dados reais dela mais a API para resolver os problemas **dela**. A tela deixa de ser só porta de entrada e vira **o único lugar** onde a Ana vê o máximo de dados de um pedido, com os botões de ação para seguir — a "tela do Mercado Livre" organizada. Primeiro organizar a Consultar Pedido, parte por parte, validando, pensando 100% em UX flow; só depois resolver problemas soltos. Regra do ciclo: aplicar primeiro o que ele aprovou; melhorias só depois de ele pedir.
3. **Topo, parte 1** — mockup aprovado (grupos Produto, Cliente e Pedido, foto do anúncio, MLB, ID do cliente e faixa de ações) e implementado para ele testar.
4. **Foto do cadastro interno** — Matheus pediu para mostrar também a foto do produto cadastrado, porque a 1ª imagem de alguns anúncios é uma arte estilizada, não o produto.
5. **Feedback depois de testar**: foto do Mercado Livre em tamanho grande (sufixo -F); fotos expansíveis com o modal padrão do sistema; anúncio e cadastro interno **lado a lado** (empilhados gastavam altura demais); botão de copiar em SKU, MLB e nome do cliente; galeria com todas as fotos do anúncio (capa sempre visível, demais só ao expandir, sem pré-carregar).
6. **3 dados novos escolhidos** — unidades voltando, marca e código de barras do cadastro interno, tipo de envio — e vários descartados de propósito (peso, medidas, variação, garantia, cidade do cliente, ID do envio de volta, cancelamento do pedido). Detalhes em [[Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao]].
7. **Economia de espaço** — testando no monitor de 27", Matheus já achou que o topo ocupava espaço demais (e o do escritório é bem menor). Pediu só otimizar a organização visual, sem mudar dados; aprovou a opção C (faixas).
8. **Agrupamento por assunto** — Matheus achou o bloco "bagunçado" (faltava agrupamento e deixar claro o que é cada informação e por que está ali) e aprovou: Dados do produto / Dados da venda / Devolução e reclamação. No mesmo pedido, aprovou uma faixa **"Datas do caso"** com 4 datas (Venda, Recebido pelo cliente, Reclamação aberta, Recebido por nós).
9. **Ícones de copiar menores** — "estavam roubando muito espaço e ficando feio, devem existir, mas menores": viraram só um ícone de 20 px.
10. **Linha do tempo completa** — Matheus desenhou numa captura a ideia de mostrar o **tempo entre as datas** nas linhas que as ligam, com aviso dos 7 dias; esclareceu que "MD" era mediação (abreviou por falta de espaço) e que a razão de tudo é a Consultar Pedido ser o ponto de entrada da Ana em **qualquer fase** do pedido; pediu que fosse **até o fim da mediação**. Mockup v2 aprovado ("esta correto implemente assim") e implementado com 6 pontos. Decisão completa em [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]].
11. **Resultado**: Matheus enviou um print da tela com os 6 pontos preenchidos e disse "por enquanto está ótimo" (04/10/2026, 00:13).

### De 00:13 até 03:47 de 04/10/2026 — chat, acordeão e velocidade

12. **Chat do ML** — prioridade seguinte, escolhida por Matheus: logo do Mercado Livre nas mensagens do ML, logo da empresa ativa nas nossas, cliente com a inicial (as cores por papel já estavam certas), e fotos anexadas iguais às da tela Mediações ML (miniatura e modal). Regra dele: o conteúdo das mensagens fica **100% original**, só o layout muda. Detalhes em [[Chat do ML na Consultar Pedido - Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna]].
13. **6 melhorias visuais do chat**, depois de ele testar: avatar de 36 px, anexo que falha vira quadro de 120×120 com "Abrir anexo", "Mercado Livre" em laranja mais escuro, teto de 900 px na largura das mensagens, fontes maiores, lupa e sombra nas miniaturas. Ele testou o modal de fotos: "100% funcional e correto".
14. **Grade de fotos**: no máximo 5 por linha, com linhas balanceadas (6 → 3+3, 7 → 4+3...). "Ficou bom."
15. **Rolagem interna do chat** (70% da janela, teto de 720 px) e **abertura direta no chat, começando pela primeira mensagem** — substituiu a ideia de abrir na última.
16. **Limpeza do acordeão**: Matheus achou a grade de campos do chat "inútil e confusa" e mandou excluir; depois aprovou trazer de volta só o desfecho (quem a mediação favoreceu e se teve cobertura) numa linha pequena no topo. Achou também o bloco 2 (Reclamação) inútil — o campo "Motivo" era só um lembrete — e mandou remover; o acordeão ficou com 3 camadas (Compra e envio de ida, Devolução física, Chat do ML).
17. **Linha do tempo de 7 datas**: a data "virou devolução", que só aparecia no bloco removido, entrou entre "Reclamação aberta" e "Recebido (nós)". Ver [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]].
18. **Link "Ver cadastro"** no lado "No nosso cadastro interno" do topo (abre o produto em outra aba), no mesmo estilo do "Ver anúncio".
19. **Fotos do cliente no topo descartadas**: Matheus pensou e concluiu que mostrá-las no grupo "Devolução e reclamação" "não vai ser útil, só vai poluir".
20. **Velocidade**: retomou a ideia de paralelizar as chamadas ao Mercado Livre. Fluxo: analisar como o Sistema Interno V2 resolveu, testar com script de exploração, aplicar os 4 ciclos (pool de conexões, ID da conta pelo `.env`, espaçador desligado só nesta tela, 3 ondas). Resultado no log real: ~6,4 s → ~1,5 s, sem 429. Matheus: "pareceu mais rápido... mas nada instantâneo, mas tá bem melhor" e, depois de testar melhor, "tá bem rápido". Os ciclos de otimização que sobraram foram dispensados. Ver [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]].

### De 03:47 até 04:33 de 04/10/2026 — validação em lote

21. **Validação em lote nas 49 devoluções existentes**: Matheus perguntou se a tela podia ser considerada fechada para as devoluções existentes; Claude criou o script `validar_consultar_pedido_em_lote.py`, Matheus rodou (04:22 a 04:24) e pediu para ler o log. Resultado: 49 de 49 abriram sem erro, 0 instável, 0 429, ~0,94 s por consulta (tudo espera do ML). Sobraram 4 tipos de venda errados no cadastro MB, 2 datas de reclamação com 1 mês a mais, 1 preço redondo, 3 nomes de outra pessoa, 4 vendas com 10 dias ou mais de diferença e uma decisão sobre "Mediação encerrada" (15 devoluções com "fora de ordem"). Matheus dispensou os 3 passos oferecidos ("não precisa") e pediu o registro no vault. Ver [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]].

## Problemas vistos nos testes de Matheus e como foram corrigidos

| O que ele viu | Causa | Correção |
|---|---|---|
| Rótulo "ID DO CLIENTE (o número da etiqueta)" quebrava em 2 linhas e desalinhava os campos | Texto longo demais para a coluna | O complemento virou "(da etiqueta)" |
| Com 2 produtos, o preço quebrava ("R$" numa linha e "1.479,00" na outra) e a coluna "Vendido" também | Coluna estreita demais | "Vendido" virou a coluna mais larga e o preço ficou sempre em 1 linha |
| No celular (cartão de ~342 px) a tela estourava para os lados | O grupo Venda tinha largura mínima fixa de 380 px, maior que o cartão | Largura mínima passou a nunca exceder o cartão: `min(380px, 100%)` na venda e `min(300px, 100%)` na devolução |
| Com a barra lateral aberta, o Número da venda quebrava no meio do número (`200001822947018` e `6` em linhas diferentes) | 4 campos cabiam numa linha e espremiam o número | O número ganhou largura mínima própria e passou a nunca quebrar |
| Na linha do tempo, rótulos de pontos se sobrepunham em tela estreita (celular e tablet) | 6 pontos não cabiam lado a lado | Regras por largura: até 900 px os rótulos quebram em 2 linhas; até 700 px são 2 pontos por linha (ver [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]) |

## Como foi conferido

As conferências visuais foram feitas numa **réplica da tela** (o HTML e o CSS reais renderizados no Chromium com dados de teste), em larguras de 272 a 1642 px — **não** no sistema rodando com a Ana. Os ajudantes novos de `views.py` foram testados isoladamente (o Django não está instalado nesse ambiente de teste). Por isso a validação com dados reais continua em aberto.

## Observações ainda sem decisão

Estas são observações de Claude, **não** pedidos de Matheus:

- Em tela grande (a partir de 1500 px, 3 colunas), a coluna do produto fica alta: "Marca" e "Código de barras" empilham e o título do cadastro quebra em 3 linhas. Possível refinamento.
- Pedido com **2 produtos** no monitor da Ana: o bloco termina perto de 800 px, um pouco além dos ~735 px úteis (precisa de uma rolagem curta).
- O código do topo assume que todo produto cadastrado tem marca preenchida (`produto_do_item.marca.nome`); isso já era assim antes desta mudança e não foi alterado.
- As fotos extras da galeria (sufixo -F) não têm o plano B de imagem quebrada que a foto de capa tem.

## Em aberto

- [ ] Testar pedido com **mediação real** (aberta pela Ana, encerrada pelo Mercado Livre)
- [ ] Testar pedido **encerrado sem mediação** (esperado: "sem mediação" e "—")
- [ ] Testar pedido **ainda não cadastrado** pela Ana (esperado: "ainda não cadastrada")
- [ ] Mostrar a tela para a Ana, no monitor dela, e ouvir o feedback
- [ ] Ideias possíveis, **nenhuma decidida nem pedida**: um resumo na parte Devolução e reclamação que responda as perguntas da Ana (motivo nas palavras do cliente com foto, janela de 7 dias, mediação sim ou não); refinar as 3 colunas em tela grande; incluir "Relatório impresso" na linha do tempo; texto de ajuda no campo `valor_reembolsado`
- [ ] Verificar a hipótese da transportadora (pedidos sem "devolução física" no Mercado Livre) — a validação em lote deu números: 14 devoluções SV sem data de chegada na tela (7 sem devolução física e 7 sem registro de entrega); confirmada só no pedido 2000017697078004 (ver [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]])
- [x] Validar a versão **em 3 ondas** em pedido com mediação e 2 claims, devolução sem devolução física, número de Pack e pedidos da MB — feito em lote em 04/10/2026 (ver [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]])
- [ ] Ainda sem validar a versão em 3 ondas: busca por ID do cliente e, olhando a tela, `MB_USER_ID` e as bolhas "Você" num pedido de mediação da MB
- [x] Script de exploração que roda a Consultar Pedido sobre **todas** as devoluções do banco — feito e rodado por Matheus em 04/10/2026
- [ ] Achados da validação em lote, todos **sem decisão**: revisar os pedidos com diferença de cadastro, corrigir os 4 tipos de venda da MB e decidir a prioridade da data "Mediação encerrada" (ML primeiro ou cadastro primeiro). Lista completa em [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]]
- [ ] Gerar o novo .exe antes de a Ana receber o chat novo e a busca rápida
- [ ] Os resultados dos scripts de exploração de 02 e 03/10 (levantamento de campos e comparação manual × API) **não** foram registrados aqui — só as decisões que Matheus comunicou

## Relacionado

- [[Validacao em Lote da Consultar Pedido nas 49 Devolucoes Existentes - Zero Erro na Tela e os Achados que Sobraram no Cadastro (04-10-2026)]]
- [[Consultar Pedido em 3 Ondas Paralelas - De 6 Segundos Para 1 Segundo e Meio Sem Estourar a Cota Compartilhada do ML]]
- [[Chat do ML na Consultar Pedido - Mensagens Originais, Logos por Papel, Miniaturas pelo Proxy e Rolagem Interna]]
- [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]
- [[Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida]]
- [[Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao]]
- [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]
- [[Estudo de Caso de Ana — Persona, Fluxo Real em 8 Fases e o Papel de Cada Tela no Sistema de Devoluções]]
- [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]]
- [[Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca-Foto e Motivo Literal Adiados]]
- [[Validacao Mobile em Aparelho Real - Teste Real Liberado em 02-10-2026]]
- [[De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]]
- [[Fim do Ritmo Apressado — Estudo Calmo Endpoint por Endpoint da API do ML, Aprovado pela Usuária Final]]
- [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]]
