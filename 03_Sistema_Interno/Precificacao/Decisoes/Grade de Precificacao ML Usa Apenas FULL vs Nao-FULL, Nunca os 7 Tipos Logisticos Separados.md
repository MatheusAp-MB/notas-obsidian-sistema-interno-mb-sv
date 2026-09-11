---
tipo: decisao
dominio: 
status: ativa
criado: 11/09/2026
atualizado_em: 11/09/2026 18:53
relacionado: [Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]
---

# Grade de Precificação ML Usa Apenas FULL vs. Não-FULL, Nunca os 7 Tipos Logísticos Separados

**Resumo**: a nova grade de precificação do Mercado Livre (Não Afiliado/Afiliado × Clássico/Premium × FULL/Coleta) trata "Coleta" como apelido pra "tudo que não é FULL" — os outros 6 valores de `TipoLogistico` (Coleta/`cross_docking`, Agência, Flex Puro, Legado, Correios, Por nossa conta) ficam num bloco único. A distinção que realmente importa pro cálculo de margem é binária (FULL x não-FULL, por causa de armazenagem), não os 7 tipos logísticos individualmente.

> [!info] DECISÃO ATIVA — regra vale a partir de agora, implementação ainda não iniciada
> Confirmado com Matheus em 11/09/2026: `tipo_logistico == FULL` vs. qualquer outro valor é toda a distinção necessária pra precificação. Nenhum código foi alterado ainda — esta nota registra a regra de negócio antes da implementação.

## Contexto

O model `TipoDeAnuncioMercadoLivre` (`mercado_livre/models/tipo_de_anuncio.py`) tem 7 valores possíveis em `TipoLogistico`: FULL (`fulfillment`), Coleta (`cross_docking`), Agência (`xd_drop_off`), Flex Puro (`self_service`), Legado (`not_specified`), Correios (`drop_off`) e Por nossa conta (`custom`). Em 27/07/2026, uma simplificação no `ConfiguracaoTipoAnuncioMercadoLivre` (comentário ainda presente no arquivo) concluiu que "logística (FULL/Coleta) e classificação (Simples/Base/Catálogo) NÃO afetam comissão nem margem — só o tipo de anúncio importa pra precificação", reduzindo a configuração de 8 linhas antigas pra 2 linhas (só por `tipo_anuncio`). Um teste real posterior mostrou que essa simplificação foi longe demais: armazenagem realmente muda entre FULL e não-FULL, então a distinção logística importa pra precificação — só que não nos 7 tipos, e sim numa divisão binária.

## O problema

Ao redesenhar a grade de precificação ML (agora também incluindo o eixo de Afiliado — ver [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]), era preciso decidir: os 7 valores de `TipoLogistico` precisam de tratamento individual na fórmula/configuração, ou só a distinção FULL vs. resto importa de verdade?

## O que levou à decisão

O ponto de partida era a grade proposta por Matheus: Não Afiliado × (Clássico/Premium) × (FULL/Coleta), e o mesmo em Com Afiliado — usando "Coleta" como um dos 2 valores do eixo logístico. Restava confirmar se "Coleta" ali era o valor literal `cross_docking` (categoria própria, deixando os outros 5 tipos sem tratamento definido) ou um apelido pra "não-FULL" (agrupando os outros 6 tipos). Matheus confirmou: é apelido — a única coisa que muda o cálculo é se o tipo logístico é FULL (armazenagem) ou não. Os outros 6 tipos (Agência, Flex Puro, Legado, Correios, Por nossa conta, além do próprio Coleta/`cross_docking`) recebem o mesmo tratamento entre si.

## Decisão

A precificação do ML usa uma checagem binária (`tipo_logistico == FULL` vs. qualquer outro valor) em vez de tratar os 7 valores de `TipoLogistico` individualmente. Isso reduz a grade a 4 combinações-base (Clássico/Premium × FULL/não-FULL), cada uma podendo ainda somar o custo de afiliado (ver dúvida relacionada) — nunca 7 (ou mais) tratamentos logísticos separados.

## Exemplo

Um anúncio com `tipo_logistico = 'xd_drop_off'` (Agência) e um anúncio com `tipo_logistico = 'drop_off'` (Correios) recebem exatamente o mesmo tratamento de armazenagem na fórmula — nenhum dos dois soma o custo de armazenagem que só o FULL (`fulfillment`) soma. Só um anúncio com `tipo_logistico = 'fulfillment'` ativa esse custo extra.

## Relacionado

- [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]
