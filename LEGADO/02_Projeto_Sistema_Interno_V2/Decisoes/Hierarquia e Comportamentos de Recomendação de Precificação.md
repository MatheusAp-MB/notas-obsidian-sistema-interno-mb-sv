---
tipo: Decisão
status: Ativo
criado: 12/07/2026
dominio: Sistema Interno Django
relacionado: [Tela de Recomendação de Precificação, CompeticaoCatalogo, Promoções ML]
---

# Hierarquia e Comportamentos de Recomendação de Precificação (Catálogo)

## Contexto

A tela de Recomendação de Precificação (`mercado-livre/precificar/recomendacao/`,
detalhe por MLB, igual Qualidade/Competição) existe pra responder uma pergunta de
negócio: **dado um anúncio de Catálogo, qual preço/promoção usar pra ganhar o
catálogo com segurança de margem?**

O objetivo nunca é só "vencer o catálogo" nem só "maximizar margem" isoladamente
— é balancear os dois, com controle explícito sobre quanto risco é aceitável.

## Os 4 buckets (o eixo central da decisão)

Toda linha candidata (uma promoção real da API, ou o "Preço Direto para Ganhar" —
que é o `price_to_win` de `CompeticaoCatalogo`, tratado como mais uma candidata,
não como referência solta) é classificada cruzando 2 perguntas:

1. Ela **ganha o catálogo**? (preço da linha ≤ price_to_win)
2. Ela fica **dentro da margem mínima** (hoje 15%, fixo em código —
   `MARGEM_MINIMA_PADRAO` em `calculo_margem.py`)?

Isso dá 4 combinações, sempre nessa ordem de prioridade:

| # | Ganha catálogo | Margem | Nome |
|---|---|---|---|
| 1 | Sim | ≥ mínima | Ganha catálogo, dentro da margem, com promoção |
| 2 | Sim | ≥ mínima | Ganha catálogo, dentro da margem, sem promoção (Preço Direto) |
| 3 | Sim | < mínima | Ganha catálogo, abaixo da margem, com promoção |
| 4 | Sim | < mínima | Ganha catálogo, abaixo da margem, sem promoção (Preço Direto) |

Linhas que **perdem** catálogo (dentro ou abaixo da margem) não entram nessa
hierarquia — aparecem na tela como categorias informativas separadas (② e as
"Outros cenários"), mas nunca são recomendadas automaticamente, porque não
resolvem o problema que a tela existe pra resolver.

**Detalhe importante:** só existe **1** linha possível "sem promoção" (o Preço
Direto) — por isso os buckets 2 e 4 nunca têm "mais de uma opção pra escolher",
e não existe fallback cruzado entre eles (bucket 2 não "cai" pro 4, por exemplo
— cada linha só pode estar em 1 lugar por vez).

## Os 3 comportamentos

Todos os 3 respeitam a mesma pergunta de fundo ("ganhar catálogo com
segurança") — a diferença é **qual prioridade eles dão à margem vs à
promoção**.

### Padrão (equilíbrio)
Percorre os buckets 1→2→3→4 nessa ordem, e usa o **primeiro que tiver
alguma linha**, escolhendo a de maior margem dentro dele. Bucket vazio → tenta
o próximo.

### Busca-Lucro (maior margem)
Só considera os buckets 1 e 2 juntos (nunca aceita ficar abaixo da margem
mínima, mesmo que isso signifique não recomendar nada). Compara as duas
listas juntas e escolhe a de **maior margem entre todas**, não importa se tem
promoção ou não.

### Disputa (ganha catálogo a qualquer custo seguro)
Mesma ordem 1→2→3→4 do Padrão — hoje calcula **exatamente igual** ao Padrão.
A diferença só vai existir quando houver automação de verdade: o Padrão nunca
executaria sozinho uma escolha do bucket 3/4 (sempre pediria aprovação
manual); o Disputa teria essa permissão liberada de antemão. Mantido como
comportamento distinto de propósito, mesmo sem diferença de cálculo hoje, pra
já existir esse contrato pronto quando a automação chegar.

## Comportamento descartado: "Promocional"

Chegou a ser cogitado (priorizar sempre promoção, com fallback pro Preço
Direto se não tiver promoção segura disponível) — mas foi **cancelado** por
ser matematicamente idêntico ao Padrão (que já tenta bucket 1 antes do 2, na
mesma ordem). Não recriar esse comportamento sem uma razão nova que o
diferencie de verdade do Padrão.

## O que ainda não existe (pendências conhecidas)

- **Comissão fixa em código** (12% Clássico / 17% Premium) — não é campo de
  `TipoDeAnuncioMercadoLivre` ainda.
- **Margem mínima fixa em código** (15%) — sem UI de ajuste, sem variação por
  produto/categoria.
- **Nenhuma automação real existe ainda** — os 3 comportamentos hoje só
  mudam o que é *mostrado* na tela; nenhum sistema executa preço/promoção
  sozinho. A distinção Padrão vs Disputa é preparação pra esse futuro, não
  funcionalidade ativa.
- **Tag de comportamento por MLB** (pra quando a automação existir, decidir
  qual comportamento cada anúncio deve seguir sozinho) — não modelada no
  banco ainda, é só o parâmetro de URL (`comportamento`) hoje.
- Tela ainda não é acessível a partir de nenhum card do Hub (só busca
  direta por MLB) — sem preservar filtro/página ao voltar.

## Relacionado

- [[Regras Gerais]]
- [[Visao Geral do Projeto]]
- [[Fórmula de Margem e Rebate de Promoção]]