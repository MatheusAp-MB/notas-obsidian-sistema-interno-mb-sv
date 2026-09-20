---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 19/09/2026
atualizado_em: 19/09/2026 22:11
relacionado: [Relato Completo do Fluxo Real de Devolução Depois que o Pacote Chega — 8 Fases e Cruzamento com o Vault, Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]
---

# Idealização da Tela Visualizar Devolução — Reorganização por Objetivo da Ana e Medição Real do Monitor

**Resumo do estado atual**: mockup aprovado por Matheus em 19/09/2026 22:11 — fase Idealizar concluída, falta só Executar (gerar e aplicar o diff real). Registra o diagnóstico original de que `visualizar_devolucao.html` tem todo o dado necessário mas organizada por origem do dado (ordem de implementação das features) em vez de por objetivo da Ana, a medição real (Playwright) do custo de rolagem no monitor de trabalho dela, a virada de direção depois que a 1ª proposta (reordenar em "zonas" preservando bloco por peça) não convenceu Matheus, e a estrutura final combinada e testada em mockup interativo.

> [!success] Mockup aprovado — falta implementar
> Estrutura final fechada e aprovada em 19/09/2026 22:11. Próximo passo é gerar o diff real (`views.py` + `visualizar_devolucao.html` + CSS) e aplicar — ver "Em aberto".

## Gatilho — sensação de Matheus

Matheus testou a tela de Visualizar e trouxe, nas próprias palavras:

> "sinto que ela tem muita coisa útil, mas que ela ainda entrega pouco valor.... é como se ela tivesse tudo que precisa para resolver uma das dores da ana, mas falta organizar isso de forma clara"

## Os 4 objetivos da Ana ao entrar na tela (definidos por Matheus)

1. Apenas visualizar sem alterar nada daquela devolução.
2. Visualizar de ponta a ponta tanto os dados sobre a devolução em si quanto os dados da conferência.
3. Ter material pra usar ao abrir a mediação com o Mercado Livre (o que vem da conferência do produto — fotos e anotações dos problemas).
4. Poder clicar em botões que levam a ações: editar conferência, editar devolução, imprimir etiqueta térmica, imprimir relatório.

## Diagnóstico — objetivo por objetivo

**Objetivo 1** — já resolvido estruturalmente: nenhum input editável na tela, toda mutação passa por link pra outra tela.

**Objetivo 2** — tecnicamente tudo está presente, mas dado administrativo (datas, financeiro, plataforma) e dado físico/conferência (peças, fotos, observação geral) ficam intercalados sem separação, numa ordem que reflete a ordem de implementação das features, não a ordem de uso. O card "Linha do tempo & status" sozinho mistura 3 assuntos com o mesmo peso visual: timeline pura (4 datas), resultado de mediação (2 datas + reembolsado + 3 campos financeiros) e metadado de venda (tipo de venda, "sobrando" no fim da grid). Além disso, `Devolucao.status_fluxo_display` (property que já existe no model — Aguardando Conferência / Conferido / Mediação Aberta / Mediação Encerrada / Impresso) não aparece em lugar nenhum da tela — o badge do cabeçalho só mostra "Conferida" ou "Pendente de conferência", então saber se já está em mediação aberta ou já foi impresso exige garimpar datas dentro do card de baixo.

**Objetivo 3** (o mais fraco) — as 3 fontes de evidência pra mediação (motivo do cliente + fotos, observação geral + foto, peças conferidas + fotos) ficam espalhadas e fora de ordem de importância: a mais rica (peças conferidas) é o ÚLTIMO card da página, depois até do card "Produto". Ver seção de medição abaixo pro custo real disso.

**Objetivo 4** — lacuna concreta encontrada no código: **"Editar devolução" não tem link nenhum em `visualizar_devolucao.html`** — `editar_devolucao` só é linkado em `devolucoes_pendentes.html` (5 ocorrências, grep confirmado). Ana citou esse botão como esperado e ele simplesmente não existe nessa tela hoje.

## Correção de rumo — o insight do WhatsApp (mudou o objetivo 3)

Antes do sistema existir, o fluxo era: Matheus tirava foto na conferência física e mandava por WhatsApp; Ana só arrastava a foto direto da conversa do WhatsApp Web pra aba do Mercado Livre — sem baixar, sem abrir pasta, sem seletor de arquivo. Matheus deixou claro que o "abrir pasta no Explorer" (proposta minha) não é o que ela faria — o que funciona pra ela é continuar tendo a foto renderizada dentro da própria aba do navegador, pronta pra arrastar, exatamente como no WhatsApp. A pasta do Explorer continua existindo como opção secundária, nunca como caminho principal.

Isso muda o critério do objetivo 3: não é "consolidar tudo pra uma leitura de ponta a ponta" — é "manter a evidência como imagem de verdade (`<img>`), fácil de re-achar rápido, considerando que ela vai alternar entre a aba do ML e essa aba várias vezes numa mesma mediação". Confirmado no código: as fotos já são `<img src>` reais (não placeholder/background-image), então o arrastar-direto já é tecnicamente possível hoje — falta só validar empiricamente se o `<a target="_blank">` que embrulha cada `<img>` (usado pra abrir a foto em tamanho grande) atrapalha o arrasto de alguma forma. Isso ainda não foi testado.

**2º refinamento (decisivo pra estrutura final)**: a mediação do Mercado Livre funciona como um chat — escreve uma explicação e anexa várias fotos de uma vez, sem precisar vincular foto a peça específica. Isso derrubou a 1ª proposta de reorganização (reordenar mantendo 1 bloco por peça, só mudando a ordem/rótulo das zonas — ver "1ª tentativa rejeitada" abaixo) e levou à estrutura final: agrupar TODAS as fotos de peça-com-problema num grid só (sem separação por peça), já que é exatamente assim que ela vai selecionar e arrastar em lote pro ML.

## 1ª tentativa rejeitada — reorganização em "zonas" preservando bloco por peça

Antes de chegar na estrutura final, foi gerado um mockup comparativo (Hoje vs Proposta) que reorganizava a página em 2 "zonas" (EVIDÊNCIAS PARA A MEDIAÇÃO / DADOS DA DEVOLUÇÃO), mas mantendo 1 bloco por peça (nome + badge + anotação + fotos), só mudando a ordem. Medição real (Playwright) mostrou ganho real (679px → 272px de rolagem até a 1ª foto, testado com monitor 1440x900), mas Matheus não ficou convencido: "eu não sei se faz sentido... não parece ser o caminho correto...". Convidou a repensar junto ("vamos pensar juntos") em vez de simplesmente ajustar a proposta existente.

Reanálise identificou os problemas reais da 1ª tentativa: rótulos de zona quebrando a leitura natural que a Ana já tem da tela; tratamento visual diferente entre peça-com-problema (bloco cheio) e peça-sem-problema (linha condensada) parecendo inconsistência; cabeçalho mais carregado (badge extra + botão Editar) conflitando com o objetivo 1 (só visualizar); e o ponto mais de fundo — reordenar cards só encurta o 1º salto de rolagem, mas não muda o mecanismo real (ainda 1 bloco por peça, ainda repetição de vaivém entre fotos espalhadas).

## Estrutura final aprovada (mockup, 19/09/2026 22:11)

Depois do 2º refinamento (mediação do ML funciona como chat, fotos soltas — ver acima), a estrutura combinada com Matheus e testada em mockup interativo (aba Hoje vs Proposta, com badge de medição de rolagem ao vivo) foi:

1. **Cabeçalho + Linha do tempo** (1 card só) lado a lado com **Produto** (nome, EAN, SKU, preço — antes só aparecia mais abaixo na página). Cabeçalho ganha o link **"Editar devolução"** (lacuna real corrigida — não existia em lugar nenhum da tela antes). "Tipo de venda" saiu da grade de dados e virou parte do texto do cabeçalho junto da plataforma ("Mercado Livre — Venda comum"). Linha do tempo dividida em 3 subgrupos (não mais uma grade única misturando tudo): **Datas da venda** (Venda / Recebido pelo cliente / Reclamação aberta), **Recebimento da devolução e mediação** (Recebido por nós / Mediação aberta / Mediação finalizada) e **Reembolso** (Reembolsado / Valor reembolsado / Diferença). Novo: badge visual **"Dentro dos 7 dias" / "Fora dos 7 dias"** junto do campo Reclamação aberta, calculado de verdade (dias corridos entre Recebido pelo cliente e Reclamação aberta).
2. **Anotações da mediação** — card de contexto isolado (texto sobre o andamento do caso, não é evidência pra anexar).
3. **Motivo da reclamação do cliente** + foto que ele enviou — card de contexto isolado.
4. **Evidência para a mediação** (bloco novo, numa faixa de 2 colunas) — grid único com TODAS as fotos de peça-com-problema + a foto da Observação geral do produto (peça entra nesse grupo quando `situação != completa` OU tem `anotação` preenchida, mesma regra já usada nos badges do Relatório A4), seguido de lista consolidada "peça — anotação" (incluindo o texto da Observação geral). O aviso "Abrir pasta no Explorer" (opção secundária, nunca a principal — ver acima) fica dentro desse mesmo bloco, com visual mais discreto.
5. **Resumo geral da conferência** (na mesma faixa, ao lado) — reaproveita o formato `.peca-card` que já existe no Relatório A4 (grid de cards com foto da peça, nome e badge de status), mostrando TODAS as peças, não só as com problema. Repetição de texto de anotação entre esse card e a lista da Evidência é intencional — um é a leitura geral, o outro é o material pronto pra mediação.

Medição final (Playwright, caso mais denso — 7 peças, 9 fotos espalhadas hoje): **818px de rolagem até a 1ª foto útil hoje → 344-417px na Proposta**, dependendo da largura/altura da janela testada (~1024 a 1440px) — redução de ~49% a 58%, consistente em todos os tamanhos testados.

## Contexto real de uso — monitor e comportamento de troca de aba

Confirmado por Matheus:
- Ana troca de aba clicando com o mouse entre elas (funcionalmente igual a Ctrl+Tab) — não trabalha com 2 janelas lado a lado.
- Monitor de trabalho dela: BRX 20" (MBRX201BK), 16:10, resolução máxima 1440x900 — um monitor genérico, "sem qualidade nenhuma" nas palavras dele.

## Medição real (Playwright, não estimativa)

Réplica estática da tela real (mesmo CSS de produção — `layout_global.css` + `layout_visualizar_devolucao.css`) com um caso típico (2 peças, 1 com 2 fotos e 1 com 1 foto, foto do cliente e foto geral preenchidas), renderizada a 1440px de largura e medida com Playwright/Chromium real:

| Seção | Começa em (px) | Altura do card (px) |
|---|---:|---:|
| Cabeçalho (Pedido) | 84 | 86 |
| Linha do tempo & status | 188 | 196 |
| Motivo da reclamação do cliente (+ foto) | 402 | 233 |
| Anotações da mediação | 653 | 92 |
| Observação geral do produto (+ foto) | 763 | 233 |
| Produto | 1014 | 145 |
| **Peças conferidas & fotos da conferência** | **1177** | **667** |

Página inteira: 1868px.

Numa altura de navegador realista pro monitor dela (~700-760px de conteúdo visível, já descontando barra de tarefas do Windows + interface do Chrome, sem contar zoom):

- Só "Cabeçalho + Linha do tempo" (100% administrativo, zero evidência) já ocupa 384px — mais de meia tela cheia dela.
- Nenhuma foto de peça aparece sem rolar em NENHUM cenário testado (nem no caso hipotético de 900px cheios, sem desconto nenhum de navegador).
- Pra chegar no início do card "Peças conferidas" (a evidência mais rica) ela precisa rolar até 1177px — quase 2 telas cheias de rolagem nos cenários realistas (417 a 527px de rolagem necessária, dependendo da altura útil do navegador).
- O próprio card de peças, sozinho, já tem 667px com só 2 peças — um kit maior facilmente ultrapassa 1 tela cheia sozinho, o que importa pro custo de rolar peça a peça DURANTE os arrastos (não só uma vez pra chegar lá).

## Em aberto

- [ ] Gerar o diff real (`views.py` + `visualizar_devolucao.html` + CSS) a partir da estrutura aprovada e aplicar — mockup aprovado, falta só Executar.
- [ ] Testar empiricamente (Playwright, ou na prática por Ana) se o `<a target="_blank">` ao redor de cada `<img>` de foto atrapalha o arrasto direto pra outra aba, ou se já funciona limpo como no WhatsApp Web.
- [ ] Decidir se/como expor `status_fluxo_display` na tela — não entrou na estrutura final aprovada (o badge do cabeçalho continua só Conferida/Pendente).

**Resolvido nesta conversa**: pergunta sobre quantidade típica de peças/fotos por mediação ficou sem resposta mas virou irrelevante — a estrutura final agrupa TODAS as fotos de problema num grid só, então funciona igual com 1 ou com 10 peças problemáticas. Nova estrutura decidida, mockup gerado, testado e aprovado (19/09/2026 22:11). Link "Editar devolução" decidido (falta só aplicar no código, junto do resto do diff).
