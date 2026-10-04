---
tipo: checkpoint
dominio:
status: em_andamento
criado: 04/10/2026
atualizado_em: 04/10/2026 00:13
relacionado: [Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias, Os 4 Problemas de Dados da Consultar Pedido - 3 Sao Manuais da Ana e o Tipo de Venda Vem do Envio de Ida, Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao, Validacao Mobile em Aparelho Real - Teste Real Liberado em 02-10-2026, De “Tela que Funciona” para “Tela que Entrega Valor” — Feedback da Ana Redireciona as Prioridades do Projeto]
---

# Consultar Pedido como Ponto Único de Consulta da Ana — Topo Reorganizado Parte por Parte (02 a 04/10/2026)

## Última atualização

04/10/2026, 00:13 — nota criada, registrando tudo o que foi feito na tela Consultar Pedido de 02/10/2026 até agora, com os motivos de cada escolha. Horários em Brasília.

**Resumo do estado atual**: a tela Consultar Pedido deixou de ser só a "porta de entrada" do sistema e passou a ser o lugar onde a Ana vê, organizado e de uma vez, o máximo de dados de um pedido — em qualquer fase em que ele esteja. O topo foi reorganizado em 3 grupos por assunto, ganhou a foto do anúncio e a do cadastro interno, botões de copiar discretos e uma linha do tempo de 6 datas com o tempo entre elas. Está aplicado na pasta do projeto e Matheus, depois de testar, disse que "por enquanto está ótimo". Falta validar 3 cenários reais e ouvir a Ana (ver "Em aberto").

> [!warning] EM ANDAMENTO
> Aplicado e aprovado visualmente por Matheus. Ainda **não** validado em pedido com mediação real, em pedido encerrado sem mediação e em pedido ainda não cadastrado, e ainda não visto pela Ana no monitor dela.

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
- [ ] Verificar a hipótese da transportadora (pedidos sem "devolução física" no Mercado Livre)
- [ ] Os resultados dos scripts de exploração de 02 e 03/10 (levantamento de campos e comparação manual × API) **não** foram registrados aqui — só as decisões que Matheus comunicou

## Relacionado

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
