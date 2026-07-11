---
tipo: duvida
dominio: python
status: ativa
criado: 11/07/2026
relacionado: [Roster De Campanha Sem Paginacao Implementada]
---

# Endpoints de Promoções Ainda Não Explorados

Lista de pendências de leitura (GET) do bloco de Promoções que ainda não
foram investigados nesta série de explorações.

## Leitura — não explorados, poderiam trazer dado útil

| Endpoint | O que traria | Motivo de não ter sido testado |
|---|---|---|
| `GET /seller-promotions/promotions/{ID}?promotion_type=X` | Detalhe completo de 1 campanha isolada (prazo, benefícios completos) | Só vimos o resumo dela dentro da listagem da Fase 1 |
| `GET /seller-promotions/promotions/{ID}/items?promotion_type=X` | Lista completa de itens de 1 campanha | Testado, mas incompleto — ver [[Roster De Campanha Sem Paginacao Implementada]] |
| `GET /seller-promotions/exclusion-list/seller` | Se a conta está bloqueada de participar de campanhas automáticas | Nunca testado após leitura inicial da documentação |
| `GET /seller-promotions/exclusion-list/seller/{item_id}` | Se um MLB específico está na lista de exclusão | Nunca testado |
| `GET /seller-promotions/candidates/{CANDIDATE_ID}` | Detalhe de 1 convite específico pra campanha | Só vem de notificação/webhook — não há como descobrir um ID varrendo MLBs |
| `GET /seller-promotions/offers/{OFFERS_ID}` | Detalhe de 1 oferta específica já ativa | Mesma limitação — só vem de notificação |

## Fora de escopo desta investigação (ação/escrita)

Todos os `POST`/`PUT`/`DELETE` de Promoções (indicar item pra campanha,
aceitar desconto, modificar preço, excluir campanha) — são endpoints de
ação que mudam algo na conta, não servem para investigação de leitura.

## Prioridade sugerida quando houver acesso à API

A lista de exclusão (`exclusion-list`) é a mais valiosa entre as
pendentes — se a conta estiver, sem saber, excluída de campanhas
automáticas, isso afetaria diretamente o volume de oportunidades de
promoção que aparece para os anúncios. Vale ser o primeiro item retomado.

## Relacionado

- [[Roster De Campanha Sem Paginacao Implementada]]