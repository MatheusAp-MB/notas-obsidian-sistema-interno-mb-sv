---
tipo: regra
dominio: fiscal
status: ativa
criado: 09/08/2026
atualizado_em: 15/08/2026 14:05
relacionado: [Plano em Etapas do Duble de Precificacao ML, Divergencia de Credito PIS COFINS Entrada no Soprador SB-630, Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Achados de Imposto Sempre Aguardam Validacao do Tributario, Por Que o Filtro de CFOP Usa Cadastro e Nao XML]
---

# XML da Nota Fiscal É a Fonte Única de Verdade Quando o Dado Existir

## Regra

Decisão explícita do usuário (09/08/2026, 17:17): quando o mesmo dado existir tanto no XML da nota fiscal de entrada quanto no banco/planilha, e os valores divergirem, **o XML é o dado válido** — não o banco, não a planilha.

## Por que

Banco e planilha são preenchidos manualmente e ficam desatualizados com frequência — confirmado repetidas vezes neste projeto (ICMS/IPI/PIS/COFINS zerados, custo divergente, `frete_cif_fob` zerado). O XML vem direto do documento fiscal emitido, sem passar por reimportação manual — é a fonte mais próxima da operação real.

## O que essa regra resolve retroativamente

- **Divergência de custo** (EAN 7908050700174: banco R$ 619,70 vs XML R$ 566,27) — estava em aberto desde 09/08 03:27 como "não investigada" (ver [[Plano em Etapas do Duble de Precificacao ML]]). Por esta regra, R$ 566,27 (XML) é o valor válido; a divergência é só confirmação de que o banco estava desatualizado, mesmo padrão já visto no projeto inteiro.
- **Divergência de crédito PIS/COFINS do SB-630** (planilha 0% vs XML R$ 98,33/unidade) — por esta regra, R$ 98,33 é o valor válido; a planilha provavelmente nunca foi preenchida com esse dado pra esse produto. Ver [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]].

## O que essa regra NÃO resolve

Só vale quando o dado **existe** no XML. Frete CIF/FOB, Cadastro de Produto e dimensões físicas não têm confirmação de existir no XML de nota de entrada — continuam dependendo de planilha até se provar o contrário (ver [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]).

Também não substitui a validação formal do tributário/superior sobre se a **fórmula** aplicada em cima do dado do XML está fiscalmente correta (ver [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]) — esta regra resolve "qual fonte usar quando há conflito de dado", não "se o cálculo está certo".

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]]
- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
- [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]
