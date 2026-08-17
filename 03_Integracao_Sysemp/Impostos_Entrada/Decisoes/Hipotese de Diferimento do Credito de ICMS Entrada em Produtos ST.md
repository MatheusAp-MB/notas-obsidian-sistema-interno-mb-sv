---
tipo: decisao
dominio: fiscal
status: ativa
criado: 09/08/2026
atualizado_em: 16/08/2026 18:26
relacionado: [Plano em Etapas do Duble de Precificacao ML, Credito Fiscal Nao Cumulativo (ICMS PIS COFINS), Achados de Imposto Sempre Aguardam Validacao do Tributario, Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria, Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08)]
---

# Hipótese de Diferimento do Crédito de ICMS Entrada em Produtos ST

## Contexto

Comparando a planilha real do superior do usuário contra o dublê pro EAN 7908050700174: a planilha mostra `ICMS ENTRADA = 0,00%` pra esse produto — não por falta de dado, mas por uma nota explícita do próprio superior na planilha, perto de outros produtos do mesmo tipo: *"PRODUTOS ST ICMS COLOQUEI 9% (MÉDIA) E O VALOR DE CRÉDITO É ZERO DIFERIMENTO"*.

Ao mesmo tempo, o `ST Valor` da planilha pra esse produto (R$ 18,32) bate quase exato com o Valor ICMS ST líquido que o dublê já calculava (R$ 18,33) — fórmula `(Base ST × Alíquota ST) − Valor ICMS normal` (substituição tributária, ver [[Plano em Etapas do Duble de Precificacao ML]]). Isso só bate porque o ICMS normal (18%) já está sendo descontado *por dentro* do cálculo do ICMS ST.

## Hipótese

Pra produtos sob substituição tributária (ICMS ST aplicado na nota), o crédito de ICMS entrada não deve ser dado de novo, separadamente, no FIXO — ele já foi absorvido dentro do cálculo líquido do ICMS ST (diferimento: a cobrança do ICMS normal é "empurrada" pra dentro da conta do ST, não cobrada/creditada 2x). Dar o crédito separado E o ICMS ST líquido ao mesmo tempo credita o mesmo imposto 2 vezes.

O usuário lembra vagamente de já ter ouvido o superior explicar algo nessa linha (evitar pagar 2x o imposto porque "a fábrica já pagou"), mas não com certeza — não é conhecimento tributário formal, é lembrança solta.

## De onde vem o dado "esse produto é regime ST?"

Não vem da coluna `Tributação` da planilha (manual, mesmo risco de desatualização já visto em outros campos) — vem do próprio XML: se `Base Calculo ICMS ST`/`Valor ICMS ST` da nota mais recente for `> 0`, o produto é tratado como regime ST. Já é dado que a dataclass `IcmsSt` (`dados_xml_nf.py`) já extrai — não precisa de campo novo.

## Decisão

Implementar essa hipótese no dublê agora (Etapa 8 — FIXO): quando `IcmsSt.valor > 0` ou `IcmsSt.base_calculo > 0`, o crédito de ICMS entrada usado no FIXO é zerado; nos demais casos, segue como está (crédito normal, valor calculado na Etapa 4). PIS e COFINS não são afetados — a nota do superior fala só de ICMS, não menciona diferimento de PIS/COFINS.

Fluxo de trabalho combinado com o usuário: implementar conforme entendemos correto, manter o vault atualizado com todo raciocínio e decisão, e só depois montar a explicação completa pra o usuário validar com o superior numa conversa formal.

## Em aberto

- Confirmação formal do superior sobre a lógica de diferimento — ainda não feita.

## Resolvido — "Redução" não precisa do mesmo tratamento (09/08/2026, 16:40)

Testado com produto real de tributação "Redução" (Guarany S4 20L, EAN 7891988035770): `Base de Cálculo ICMS ST` e `Valor ICMS ST` desse produto são **0** — ou seja, Redução de base de ICMS é um mecanismo totalmente diferente de substituição tributária, não passa pelo ICMS ST em nenhum momento. Não existe o "diferimento por dentro" que justifica zerar o crédito em produtos ST, porque não existe cálculo de ST pra zerar contra.

Confirmado: o crédito de ICMS entrada desse produto (R$ 76,88, calculado normal na Etapa 4) se aplica direto no FIXO, sem nenhum ajuste especial — e bate exato com o Custo Final da planilha do superior pra esse produto (ver [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]] pra validação completa). A dúvida sobre "Redução" fica fechada — só "ST" precisa da lógica de diferimento; "Redução" e "Tributado" seguem o crédito normal, sem ajuste.

**Aguardando validação do tributário/superior** — ver [[Achados de Imposto Sempre Aguardam Validacao do Tributario]].

## Saiu do dublê e chegou na produção real (16/08/2026, 18:26)

Até aqui essa hipótese só rodava no script de dublê (`duble_precificacao_ml.py`), isolado, nunca no caminho real de precificação. Na migração de hoje (ver [[Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08)]]), a mesma lógica (`_produto_tem_icms_st`/`_credito_icms_da_nota`, em `impostos/funcoes_auxiliares/creditos_fiscais_para_precificacao.py`) passou a valer nas 6 fórmulas reais de marketplace (ML, TikTok, Raia, Amazon, Magalu, Shopee) e em `calculo_margem.py`. Antes disso, só o ML tratava esse caso (e só parcialmente); os outros 5 marketplaces creditavam ICMS normal mesmo em produto ST, sem nenhum tratamento — bug real que só foi descoberto agora, ao migrar todos pro mesmo motor. Continua **aguardando validação formal do tributário/superior** — validar contra dado real de produção (Etapa 4 do checklist) é o próximo passo, não substitui a validação humana.

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Credito Fiscal Nao Cumulativo (ICMS PIS COFINS)]]
- [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]
- [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]
