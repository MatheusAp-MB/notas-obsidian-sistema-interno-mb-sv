---
tipo: descoberta
dominio: 
status: ativa
criado: 07/08/2026
atualizado_em: 07/08/2026 01:32
relacionado: [Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada, Padrao de Robustez para Clientes de API Externa, Paginacao do Endpoint Manifesto Nota Entrada]
---

# API Sysemp Só Retorna a Última Nota Fiscal por Produto

O endpoint `listarManifestoNotaEntrada` devolve, por produto, apenas a nota fiscal mais recente — nunca o histórico completo de notas daquele produto. Isso apareceu analisando a distribuição de CFOP de uma amostra real (100 registros, 1 semana): cada produto aparece no máximo 1 vez no retorno, com o CFOP da última operação de entrada registrada pra ele.

## Por que isso é um risco

O objetivo é ler os impostos de cada nota de entrada e associá-los ao produto certo, pra precificar corretamente. Mas se, depois de uma compra normal (ex: CFOP 2.102, compra pra revenda), o mesmo produto passar por qualquer outra movimentação de entrada — por exemplo, ser mandado pra conserto em garantia e voltar com CFOP 1.916 — a API passa a devolver **só** a nota de retorno de conserto pra esse produto. A nota de compra original, com o dado fiscal de aquisição de verdade, deixa de aparecer no endpoint — não porque foi filtrada por engano, mas porque foi *substituída* na visão que a própria API oferece.

Ou seja: filtrar por CFOP na leitura não resolve isso. Se o dado da compra original já não está mais acessível por esse endpoint no momento da consulta, nenhum filtro recupera esse dado depois — o problema é anterior ao filtro.

## Em aberto

Não está claro se dá pra pedir outro tipo de consulta na API (histórico completo por produto, não só a última nota) ou se essa limitação é definitiva do sistema Sysemp. Usuário vai conversar com o superior sobre isso (07/08/2026) antes de decidir como contornar — pode envolver pedir um endpoint diferente ao suporte do ERP, ou mudar a estratégia de importação pra rodar com mais frequência (reduzindo a janela em que uma nota "não-compra" pode sobrescrever uma nota de compra entre duas leituras).

## Correção (07/08/2026 01:32)

A causa raiz não era comportamento da API — era paginação do nosso lado nunca tratada. O endpoint pagina os resultados (~100 registros por chamada), e todas as chamadas até aqui usaram `offset='0'`, ou seja, sempre só a primeira página. Prova direta: o produto 7908050719121, que aparecia com 1 única ocorrência nessa amostra, tem na verdade 21 ocorrências reais no mesmo tipo de período — incluindo notas de 1000 e 8 unidades que o usuário sabia ter dado entrada e que nunca apareciam. Depois de implementar um loop de paginação (ver [[Paginacao do Endpoint Manifesto Nota Entrada]]), o total de registros do período foi de 100 para 578.

Consequência prática: a API devolve, sim, o histórico completo de entradas de um produto dentro do período pedido — o "risco de sobrescrita" descrito acima nunca foi real, era um artefato de não paginar. Título e corpo original mantidos como registro de como o entendimento evoluiu (nunca apagar histórico).

## Relacionado

- [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Paginacao do Endpoint Manifesto Nota Entrada]]
