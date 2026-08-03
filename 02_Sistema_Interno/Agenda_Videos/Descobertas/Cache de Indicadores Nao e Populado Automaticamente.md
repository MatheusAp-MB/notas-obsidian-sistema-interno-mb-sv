---
tipo: descoberta
dominio: 
status: ativa
criado: 03/08/2026
atualizado_em: 03/08/2026 17:10
relacionado: [Regua de Fases Precisa Ser Semeada em Todo Ambiente Novo, Estrutura de Telas da Agenda de Videos, Mapa de Execucao das 5 Telas da Agenda de Videos, Checkpoint Testes Automatizados Agenda Videos]
---

# Cache de Indicadores Não É Populado Automaticamente

Achado durante a validação manual das 5 telas novas (03/08/2026) — mesma categoria da descoberta da régua de fases, mas pra outra tabela.

## O que aconteceu

Depois de aplicar o redesenho das 5 telas, o usuário só conseguia ver 1 produto, em qualquer tela que abrisse. Diagnóstico: toda tela nova filtra via `indicadores_agenda__X` (join com `IndicadoresAgendaProduto`, o cache). Produto sem essa linha de cache simplesmente não aparece em NENHUMA tela — o join gerado por `.filter()` é INNER, não LEFT.

Esse cache só é escrito por `sincronizar_indicadores_agenda_produto()`, chamada em pontos reativos específicos (clique no roadmap, alternar pausado, callbacks de postagem/replicação automática) — nunca em lote, nunca automaticamente na criação do produto. Produto importado do ERP e nunca clicado manualmente fica sem cache pra sempre, até alguém rodar a sincronização em lote.

## Por que não é bug do redesenho

O mecanismo de sincronização em lote já existia — `sincronizar_indicadores_agenda_em_lote()` (`core/management/commands/popular_banco_suporte/`), rodado como parte do comando `popular_banco` (importação de dado real da API/ERP). O sistema antigo tolerava a ausência desse cache: o filtro de fase só era aplicado se o usuário marcasse uma caixinha de estágio; sem marcar nada, mostrava tudo, cache ou não. O redesenho das 5 telas tornou esse cache uma dependência OBRIGATÓRIA de toda tela — o que expôs que ele nunca tinha sido garantido pra todo produto.

## Resolução

Usuário rodou `python manage.py popular_banco` — confirmado que resolveu (todos os produtos passaram a aparecer nas telas certas).

## Cuidado daqui pra frente

Depois de qualquer import novo de produtos (via `importar_produtos_erp`), rodar `popular_banco` inteiro (ou pelo menos o passo `sincronizar_indicadores_agenda_em_lote`) antes de considerar a Agenda de Vídeos confiável pro catálogo novo. Ainda não existe um comando leve que rode só esse passo sem o resto do pipeline de `popular_banco` (que depende de arquivos reais da API) — cogitado, não construído ainda.

## Relacionado

- [[Regua de Fases Precisa Ser Semeada em Todo Ambiente Novo]]
- [[Estrutura de Telas da Agenda de Videos]]
- [[Mapa de Execucao das 5 Telas da Agenda de Videos]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
