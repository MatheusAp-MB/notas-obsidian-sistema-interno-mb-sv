---
tipo: checkpoint
dominio:
status: em_andamento
criado: 15/09/2026
atualizado_em: 15/09/2026 21:32
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução, Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354), Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]
---

# Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta

**Resumo do estado atual**: idealizadas e mockadas (Claude Design, sem código ainda) 3 telas que usam a API do Mercado Livre pra tirar a responsável pela devolução de dentro do próprio Mercado Livre no dia a dia — cada uma resolvendo um momento diferente do trabalho dela. Nenhuma foi implementada; é fase "Idealizar/Mockup", validada com o usuário tela por tela antes de qualquer código.

> [!note] Em andamento — 3 mockups publicados, implementação ainda não começou
> Painel de Acompanhamento e Detalhe do Pedido desenhados primeiro (a dor de acompanhar N mediações abertas ao mesmo tempo); Hub de Consulta veio depois, como uma camada anterior/integrada — o momento em que o pacote chega fisicamente na mão dela. Fica em aberto como (e se) o Hub se conecta ao formulário de Nova Devolução já existente.

## Motivação de fundo

A responsável pela devolução é a única funcionária do setor, cuida das duas empresas (Magazine e Samvale) sozinha, e hoje depende de abas fixadas no Chrome pra acompanhar reclamações e mediações abertas no Mercado Livre — não existe lugar nenhum que junte isso. Pra saber se o ML respondeu alguma coisa, ela precisa abrir cada aba na mão. As 3 telas nasceram de 2 dores relacionadas, mas distintas:

1. **Acompanhar ao longo do tempo** várias mediações/reclamações abertas ao mesmo tempo (dias, às vezes semanas) — sem perder o fio de nenhuma.
2. **Consultar tudo sobre 1 pedido específico**, no instante em que o pacote físico chega na mão dela — sem precisar abrir e cruzar várias telas do próprio Mercado Livre (que já é fragmentado por natureza: pedido, reclamação e mediação vivem em lugares diferentes até lá dentro).

## As 3 telas

### 1. Painel de Acompanhamento

Lista de pedidos que ela está acompanhando ativamente — o substituto direto das abas fixadas no Chrome.

- Adicionar 1 pedido novo = digitar só o número; empresa ativa (Magazine/Samvale) já é resolvida pela sessão, não é campo novo.
- Cada linha mostra o status num relance: **Reclamação aberta** (cliente reclamou, ainda sem mediação formal) / **Mediação aberta** (com há quantos dias e aguardando resposta de quem — comprador, vendedor ou ML) / **Resolvida**.
- Nada se atualiza sozinho — decisão explícita do usuário, sem polling automático nesta 1ª versão. Botão "Atualizar" manual, tanto pro painel inteiro quanto por pedido individual na tela de detalhe.
- Pedido resolvido **fica na lista até ela remover manualmente** (decisão explícita — não some sozinho, pra ela não perder o rastro de que aquele fechou).

### 2. Detalhe do Pedido

Ao clicar em 1 item do painel: linha do tempo completa do pedido, no mesmo espírito da tabela já validada no caso real `2000017788033354` (ver [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]).

- Linha do tempo com datas reais: compra, entrega, reclamação aberta, mediação aberta, devolução física recebida, mediação fechada — passos ainda não acontecidos ficam marcados como "aguardando", não escondidos.
- Motivo da reclamação em texto literal do cliente (não o resumo do ML, que o caso real já mostrou ser inconsistente entre as 3 fontes).
- Os 2 valores financeiros sempre **separados, nunca somados**: cancelamento (estorno da venda) e reembolso da mediação (compensação em direção oposta) — distinção que o caso real confirmou ser 2 fluxos de dinheiro diferentes, não a mesma coisa contada 2 vezes.

### 3. Hub de Consulta de Pedido

A tela que resolve o momento "pacote na mão": 1 campo de busca, digita o número do pedido, e a tela inteira mostra de uma vez:

- Resumo do pedido (cliente, data da compra, status).
- **3 atalhos reais pro Mercado Livre** — abrir o pedido, a reclamação e a mediação, cada um levando direto pra URL certa (deep link montado a partir dos IDs que a própria API devolve) — pra quando ela precisar *agir* lá (responder algo), não só consultar.
- Produto comprado + quantidade — informação que hoje só existe do lado de cá (catálogo interno), cruzada com o pedido.
- Motivo da devolução (texto literal) e a mesma linha do tempo da tela de Detalhe, reaproveitada.

Fica em aberto, intencionalmente adiado ("vamos por partes"): essa tela parece o início natural do fluxo de Nova Devolução (que hoje exige digitar pedido, motivo e datas de mediação na mão — ver [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]) — se os dados já vêm da API pelo Hub, fazia sentido alimentar o formulário já preenchido. Ainda não decidido como (ou se) essa ponte é feita.

## Ideia cogitada e descartada: embutir o Mercado Livre de verdade dentro da tela

Durante a idealização do Hub, surgiu a ideia de, em vez de só resumir os dados via API, abrir o site real do Mercado Livre em janelas pequenas embutidas na própria tela (like iframes), pro pedido/reclamação/mediação específicos. Descartada por 3 motivos, 2 técnicos e 1 de UX:

1. Sites que lidam com login e pagamento normalmente bloqueiam ser embutidos em iframe de propósito (proteção contra clickjacking) — o Mercado Livre quase certamente tem essa proteção ativa.
2. Mesmo que não bloqueasse, navegadores modernos já bloqueiam cookie de terceiro por padrão — a sessão logada dela no ML não entraria junto dentro do iframe.
3. O site do Mercado Livre foi projetado pra tela cheia — espremido numa janela pequena, a experiência ficaria ruim mesmo sem o bloqueio técnico (observação do próprio usuário).

Decisão final: os 3 atalhos com deep link direto (item acima), que resolvem a mesma dor (não navegar/procurar na mão) sem precisar embutir nada.

## Mockups publicados (Claude Design, sem código ainda)

- Painel de Acompanhamento + Detalhe do Pedido: https://claude.ai/artifact/VYboDEKVk7U1u1TzwZY2N5
- Hub de Consulta de Pedido: https://claude.ai/artifact/JFhkDTXYbSczWXuP61Qjpc

Todos usam dados de exemplo (marcado nas próprias telas) e reaproveitam o design system real do app (`layout_global.css`, `layout_badges.css`, `layout_devolucoes_pendentes.css`).

## Em aberto

- [ ] Decidir como (ou se) o Hub de Consulta alimenta o formulário de Nova Devolução
- [ ] Definir a fonte real de cada campo na API do Mercado Livre pra cada tela (pedido, reclamação, mediação, produto) — hoje os mockups usam dado de exemplo
- [ ] Onde essas 3 telas entram na navegação real do sistema (o mockup assumiu um item novo "Consultar Pedido" no topo da barra lateral e "Mediações ML" pra Painel/Detalhe — só posição de menu, não validado)
- [ ] Implementação (models, views, integração com a API — nada disso existe ainda)

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]
- [[Caso Real de Devolução com Mediação Confirma o Relatório e Revela 4 Nuances da Central de Vendedores (Pedido 2000017788033354)]]
- [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]
