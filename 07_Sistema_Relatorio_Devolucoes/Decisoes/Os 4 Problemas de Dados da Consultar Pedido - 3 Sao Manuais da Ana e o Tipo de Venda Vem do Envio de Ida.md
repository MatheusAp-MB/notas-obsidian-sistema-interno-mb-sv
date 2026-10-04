---
tipo: decisao
dominio:
status: ativa
criado: 04/10/2026
atualizado_em: 04/10/2026 00:13
relacionado: [Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026), Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias, Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao]
---

# Os 4 Problemas de Dados da Consultar Pedido — 3 São Manuais da Ana e o Tipo de Venda Vem do Envio de Ida

**Resumo**: para a tela Consultar Pedido ter dados confiáveis, Matheus decidiu (03/10/2026) que três informações **não** vêm da API do Mercado Livre e continuam sendo preenchidas à mão pela Ana — valor reembolsado, abertura da mediação e motivo da reclamação — e que a quarta, o tipo de venda (FULL ou comum), a tela descobre sozinha olhando o envio de ida do pedido, com a mesma regra do Sistema Interno V2. Na sessão de 03 para 04/10/2026 ele mandou resolver os 4 de uma vez, num único ciclo.

> [!info] ATIVA — decisão valendo; o tipo de venda já está implementado
> O tipo de venda FULL/comum já é calculado e mostrado na tela (conferido no código em 04/10/2026, 00:13). Os 3 campos manuais já existem no modelo `Devolucao`; nenhum trabalho de API é necessário para eles, porque a decisão foi justamente **não** buscá-los na API.

## Contexto

A Ana é a única funcionária do setor de devolução e cuida das duas empresas (MB e SV). Em 02/10/2026 Matheus fez este diagnóstico: a tela Consultar Pedido — a que ele mais queria que a Ana usasse — não era usada porque **não trazia dados consistentes**. A tela mistura duas fontes: o que a API do Mercado Livre devolve e o que a Ana cadastrou no sistema. Para cada dado problemático, era preciso decidir de qual das duas fontes ele deve vir (ver [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]]).

## A questão a decidir

Para cada um dos 4 dados que estavam dando problema, de onde ele vem: da API do Mercado Livre, ou do preenchimento da Ana?

## O que levou à decisão

| Dado | Campo no sistema | Fonte decidida | Por quê | O que foi descartado |
|---|---|---|---|---|
| **Valor reembolsado** | `Devolucao.valor_reembolsado` | Manual (Ana) | É o valor que o Mercado Livre reembolsa **à empresa** (MB ou SV) como compensação pelo produto defeituoso que voltou. Não vem pela API: para receber, é preciso abrir um chamado com o Mercado Livre, informar o valor e esperar a confirmação | Tentar obter esse valor "à força" pela API |
| **Abertura da mediação** | `Devolucao.data_abertura_mediacao` ("Mediação aberta em") | Manual (Ana) | "Abertura da mediação" é o momento em que a Ana recebeu a devolução, percebeu o defeito e abriu mediação com o Mercado Livre para contestar o cliente. Como normalmente a devolução é cadastrada **antes** de a mediação ser aberta, não há como automatizar | Usar a data da primeira mensagem de disputa vinda da API (é outra coisa, ver [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]) |
| **Motivo da reclamação** | `Devolucao.motivo_reclamacao` ("Motivo da reclamação do cliente", obrigatório no cadastro) | Manual (Ana) | O motivo que importa **não** é o código padronizado do Mercado Livre: é o que o cliente disse, do jeito que ele disse | Mostrar só o código padronizado do motivo |
| **Tipo de venda (FULL ou comum)** | `Devolucao.tipo_venda`, sugerido pela tela como `tipo_venda_sugerido` | **Automático**, pela API | A tela olha o envio de ida do pedido e lê o campo `logistic_type`: se for `fulfillment`, a venda é **FULL**; qualquer outro valor é venda **comum**; sem informação, a tela mostra "Não identificado" | Criar uma regra nova do zero |

### Sobre o tipo de venda

- **FULL** é a venda em que o produto fica armazenado e é despachado pelo próprio Mercado Livre (o valor `fulfillment` do campo `logistic_type`). **Comum** é toda a venda que não é FULL.
- A divisão "FULL ou não-FULL" **já existe e já está validada** no Sistema Interno V2 (a árvore que monta a tela do hub precisa dessas informações — ver [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]). Matheus pediu para pesquisar lá em vez de inventar de novo, seguindo a diretriz de se aproximar do que já foi validado.
- **Por que a tela precisa buscar o envio de ida**: o pedido que a API devolve no endpoint de pedidos (`/orders`) não traz o `logistic_type`. Só o envio completo (shipment) de ida traz.
- A tela mostra o resultado como "Venda FULL", "Venda comum" ou "Não identificado" (texto cinza quando a API não deu a informação).

### Sobre o valor reembolsado e a Ana

Como o preenchimento é sempre manual, a tela **nunca** deve mostrar esse campo como se fosse um dado confirmado pela API. Quem preenche é a Ana, depois que o Mercado Livre confirma o valor.

## Decisão tomada

- **Valor reembolsado, abertura da mediação e motivo da reclamação são campos manuais da Ana.** Nenhum deles será buscado na API.
- **Tipo de venda vem da API** (`logistic_type` do envio de ida, com `fulfillment` = FULL), usando a mesma divisão FULL × não-FULL do Sistema Interno V2.
- Na sessão de 03 para 04/10/2026 Matheus decidiu resolver os **4 de uma vez**, num único ciclo, e deu acesso à pasta do código para o ajuste ser aplicado direto nela.

## Exemplo / consequência

Exemplo ilustrativo (valores inventados): um produto vendido por R$ 400,00 volta com defeito. A Ana registra o motivo exatamente como o cliente escreveu ("chegou sem a trava de segurança"), abre a mediação no Mercado Livre e anota a data em "Mediação aberta em". Semanas depois o Mercado Livre confirma que vai reembolsar à empresa R$ 300,00; a Ana digita esse valor em "Valor reembolsado". O tipo de venda ela não digita: a tela já mostra "Venda comum" porque o envio de ida não era `fulfillment`.

**Hipótese de Matheus, ainda não verificada**: vendas entregues por transportadora (por exemplo, cadeira de transferência) explicariam por que alguns pedidos registrados como devolução não têm "devolução física" no Mercado Livre. O caso real mais parecido já estudado está em [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]].

## Relacionado

- [[Consultar Pedido Como Ponto Unico de Consulta da Ana - Topo Reorganizado Parte por Parte (04-10-2026)]]
- [[Linha do Tempo do Caso na Consultar Pedido - 6 Datas e Tempo Entre Elas com Aviso dos 7 Dias]]
- [[Topo da Consultar Pedido Agrupado por Assunto - Foto Dupla e Layout Adaptavel a Largura do Cartao]]
- [[Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe]]
- [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]
- [[Devolucao De Item Grande Feita Por Transportadora Contratada Em Vez Do Mercado Envios Fica Sem Confirmacao De Chegada No Sistema (Pedido 2000017697078004)]]
- [[Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca-Foto e Motivo Literal Adiados]]
