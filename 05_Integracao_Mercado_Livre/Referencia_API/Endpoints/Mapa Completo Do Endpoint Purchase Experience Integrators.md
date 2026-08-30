---
tipo: descoberta
dominio: python
status: ativa
criado: 11/07/2026
relacionado: [Migracao Parcial Da Experiencia De Compra Para User Product, Faixas De Corte Da Cor De Reputacao De Experiencia, MLBU Compartilhado Entre Base E Catalogo Pareado]
tags: [Vindo_do_Legado]
---

# Mapa Completo do Endpoint purchase_experience/integrators

Exploração completa, campo por campo, dos dois endpoints de Experiência
de Compra (`/reputation/items/{MLB}/...` e
`/reputation/user_products/{MLBU}/...`), contra 72 respostas reais
coletadas.

## Estrutura completa (variante User Product — a atual)

| Campo | O que é | Variação observada |
|---|---|---|
| `up_id` | Identificador do User Product consultado | Sempre presente nesta variante |
| `title.text` | Cabeçalho | Fixo: "Experiência de compra", ou "Ainda não é possível medir..." quando `reputation.value = -1` |
| `subtitles` | Explicação curta de metodologia | Só 3 textos fixos em toda a amostra |
| `actions` | Botão de ação disponível | Só 1 texto visto: "Alterar anúncio" |
| `reputation.color/value/text` | O score e sua cor | Só 4 valores vistos: -1 (cinza), 30 (vermelho), 65 (laranja), 100 (verde) — ver nota relacionada sobre faixas de corte |
| `status.id` | `active`/`paused` do anúncio | **Regra descoberta: só existe quando `reputation.value ≠ -1`** — confirmado nos dois conjuntos testados (item e up), a contagem de ausência bate exatamente com a contagem de cinza |
| `freeze` | Proteção comercial que impede penalização | Nunca visto preenchido em 144 casos testados (72 × 2 variantes) |
| `consequence.title` | Consequência de manter o desempenho atual | Só 3 variações de texto |
| `reasoning` | Ver seção própria abaixo — campo mais rico | — |
| `recommendations.subtitles` | Lista de sugestões de melhoria | 0 a 2 itens; 87% dos casos (63 de 72) não têm nenhuma |
| `principal_actionable` | Resumo de 1 frase da ação mais importante | 5 textos distintos, com duplicatas quase idênticas variando só pontuação final |
| `ai_generated` | Aviso fixo | Sempre "Gerado por inteligência artificial" quando presente |
| `is_kit` / `kit_components` | Suporte a produtos vendidos em kit | Nunca visto — 0 casos em 144 |

## O campo reasoning (atenção especial — candidato a extração futura)

`reasoning.subtitles` é texto livre gerado por IA explicando o "porquê" do
score. Nas 7 variações de texto encontradas, sempre recombina as mesmas
**4 dimensões fixas**:

1. Reclamações de produto (comparado à média da categoria)
2. Cancelamentos
3. Atrasos no envio
4. Opiniões (reviews)

**Necessidade futura identificada:** extrair essas 4 dimensões de forma
isolada/estruturada (não só como texto corrido). Hoje **não é possível**
diretamente pela API — a variante User Product não expõe essas dimensões
como campos separados, só como texto natural variável.

Duas rotas possíveis para resolver, ainda não testadas:
- Parsing do texto do `reasoning` (frágil — a IA varia a redação mesmo
  para situações parecidas, como já visto nos 7 exemplos catalogados)
- Investigar se a estrutura antiga (`metrics_details.problems[]`, que tem
  `key`, `cancellations`, `claims` como números estruturados) ainda é
  acessível em paralelo, mesmo para anúncios já migrados — não testado,
  exige acesso à API

## Migração parcial confirmada (ver nota relacionada para detalhe)

19 de 72 MLBs (todos `status = closed`) ainda respondem na estrutura
antiga (`item_id`, `metrics_details`) em vez da nova (`up_id`,
`reasoning`) — migração incompleta, correlacionada 100% com o status do
anúncio.

## MLBU compartilhado confirmado também neste endpoint

Testado em 10 pares Base↔Catálogo com MLBU em comum: **10 de 10 (100%)**
retornaram resultado de Experiência de Compra idêntico — mesmo padrão já
confirmado no endpoint de Performance (ver nota relacionada).

## Não testado / lacunas conhecidas

- Nenhum exemplo real de `metrics_details` preenchido com reclamação
  (`problems`, `level_two`, `level_three`, `remedy`) — os 19 casos de
  estrutura antiga testados tinham todos "sem vendas com problema".
- `freeze` e `is_kit` — 0 exemplos reais, podem não existir nesta conta.
- Faixas de corte exatas de `reputation.value` para cada cor — só
  hipótese, não confirmação (ver nota relacionada).

## Relacionado

- [[Migracao Parcial Da Experiencia De Compra Para User Product]]
- [[Faixas De Corte Da Cor De Reputacao De Experiencia]]
- [[MLBU Compartilhado Entre Base E Catalogo Pareado]]