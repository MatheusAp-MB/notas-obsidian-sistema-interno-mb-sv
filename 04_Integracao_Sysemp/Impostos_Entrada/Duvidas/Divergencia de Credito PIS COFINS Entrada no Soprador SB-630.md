---
tipo: duvida
dominio: fiscal
status: resolvida
criado: 09/08/2026
atualizado_em: 09/08/2026 17:17
relacionado: [Plano em Etapas do Duble de Precificacao ML, Credito Fiscal Nao Cumulativo (ICMS PIS COFINS), Achados de Imposto Sempre Aguardam Validacao do Tributario, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]
---

# Divergência de Crédito PIS/COFINS Entrada no Soprador SB-630

## O que foi encontrado

Testando o dublê com 3 produtos reais contra a planilha do superior (EAN 7908050734971, SOPRADOR BRUDDEN SB-630, tributação "Tributado"): a planilha mostra `PIS COFINS` (entrada) = 0,00% pra esse produto — mas o XML da nota mais recente dele, processado pelo dublê, calcula um crédito real de R$ 17,54 (PIS) + R$ 80,79 (COFINS) = **R$ 98,33 por unidade**.

Todos os outros campos desse mesmo produto bateram exatos entre planilha e dublê (Custo, ICMS entrada 18%, IPI 0%) — só o PIS/COFINS entrada diverge.

## Por que isso importa

Se o crédito de R$ 98,33/unidade for real e a planilha só não preencheu esse campo (mesmo padrão de campo vazio já visto antes com outros produtos), o sistema real está cobrando mais do que precisaria desse produto pra bater a mesma margem — mesmo problema descrito em [[Credito Fiscal Nao Cumulativo (ICMS PIS COFINS)]]. Mas também pode ser que exista uma razão fiscal legítima pra esse produto específico não ter esse crédito (regime especial, monofasia, isenção pontual do NCM) — sem formação tributária, não dá pra saber qual dos 2 casos é o real.

## Resolução (09/08/2026, 17:17)

Decisão do usuário: [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]] — quando o dado existe no XML e diverge do banco/planilha, o XML vale. Esse crédito existe no XML (calculado a partir de `Base de Cálculo`/`Custo Total` da nota, mesma fórmula já validada nos outros produtos) — **R$ 98,33/unidade é o valor válido**, não os 0% da planilha. A divergência não é mais tratada como incerteza de fonte — é confirmação de que a planilha nunca foi preenchida com esse dado pra esse produto, mesmo padrão visto no projeto inteiro.

Fica de pé, à parte, a validação formal do tributário/superior sobre se a fórmula (alíquota × base reduzida) está fiscalmente correta pra esse produto/NCM especificamente — essa resolução trata de qual fonte usar, não se o cálculo em si está certo.

**Aguardando validação do tributário/superior** (sobre a fórmula, não sobre a fonte) — ver [[Achados de Imposto Sempre Aguardam Validacao do Tributario]].

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Credito Fiscal Nao Cumulativo (ICMS PIS COFINS)]]
- [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
