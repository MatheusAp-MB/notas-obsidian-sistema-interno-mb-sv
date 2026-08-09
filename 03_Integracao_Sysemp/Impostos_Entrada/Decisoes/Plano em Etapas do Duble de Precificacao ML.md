---
tipo: decisao
dominio: 
status: ativa
criado: 08/08/2026
atualizado_em: 09/08/2026 17:17
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total, Modelagem de Objeto e Encapsulamento, Achados de Imposto Sempre Aguardam Validacao do Tributario, Credito Fiscal Nao Cumulativo (ICMS PIS COFINS), Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria, Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal, Divergencia de Credito PIS COFINS Entrada no Soprador SB-630, Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]
---

# Plano em Etapas do Dublê de Precificação ML

## Contexto

Objetivo final: alimentar os campos fiscais do banco (`Produto`) pra que a precificação use dado real do Sysemp, em vez da planilha manual atual (`Planilha_Importar_Pos_Macro.xlsm`). Antes de tocar no banco, construir um "dublê" — script isolado que reproduz a lógica real da `FormulaPrecificacao` (Mercado Livre), mas com os dados fiscais vindos do `DadosXmlNF` (Sysemp) em vez do `Produto` do banco. Só depois de validar etapa por etapa é que se decide como (e se) isso vira escrita real no banco.

Construído de baixo pra cima, na mesma lógica da disciplina de testes (Nível 0 → N): cada etapa é um grupo de dado pequeno e nomeável, só avança pra próxima quando a anterior estiver validada.

## Etapas

1. **Identificação do Produto** — 100% do `Produto` real (banco), sem XML: `ean`, `cod_fabricante`, `sku` (código auxiliar), `titulo`, `marca`.
2. **Custo de Coleta** — banco/config, sem XML: dimensões efetivas reais × `fator_coleta` (config real) → metro cúbico, coleta.
3. **Custo de Armazenagem** — banco/config, sem XML: `armazenagem_planilha` do produto, ou faixa de armazenagem (config real) × período.
4. **Identificação da Nota Fiscal (XML)** — NR NF, Data Entrada da Nota, Emissão, Fornecedor, CFOP, Natureza da Operação, Chave (já são `IdentificacaoNF`/`DadosNF`).
5. **Custo vindo do XML** — Custo Total, Custo Unitário (já é `Custos`).
6. **Impostos vindos do XML, brutos** — `IdentificadorRegra`, `IcmsSt`, `Icms`, `IcmsRet`, `Ipi`, `Pis`, `Cofins` (já existem, sem mudança).
7. **Cálculo individual de cada imposto, por unidade** (novo):
   ```
   base_calculo (unitária) = custo_unitário × (1 − redução/100)   [redução = 0% onde o campo não existe]
   aliquota  = igual (já é %, não depende de quantidade)
   redução   = igual (já é %, não depende de quantidade)
   valor (unitário) = base_calculo (unitária) × aliquota / 100
   ```
   Fórmula derivada algebricamente de como `redução` já foi definida (`1 − base_calculo/custo_total`) — validado com dado real de PIS/COFINS (238,16 × (1 − 0,481) = 123,6 = 988,84/8). Ainda não validado com ICMS/ICMS ST ≠ 0 — a redução desses 2 vem direto da API (não é derivada por nós); validar com produto real antes de confiar.
8. **Cálculo do FIXO** — coleta (2) + armazenagem (3) + custo final (5, com IPI/frete/ST) − créditos (7). Em aberto: hoje a fórmula real usa 1 crédito de ICMS entrada + 1 crédito combinado de PIS/COFINS — com os dados separados agora, decidir se PIS e COFINS entram como 2 créditos distintos.
9. **Cálculo do Denominador** — taxa (comissão + ICMS saída + PIS/COFINS saída) + margem-alvo. ICMS/PIS/COFINS de saída não vêm do manifesto de entrada — continuam vindo do real/banco por enquanto.
10. **Resto do fluxo** — faixa de frete real (por peso) + goal-seek (`resolver_preco_por_margem`) → preço final, margem obtida. Reaproveitado da `FormulaPrecificacao` real, não reescrito.

## Decisão de arquitetura

Nenhuma escrita no banco em nenhuma etapa — só leitura (dimensão, config, frete, armazenagem, `Produto` pra identificação). O `Produto` real nunca é salvo; qualquer substituição de campo fiscal existe só em memória, no processo do script. Baseado no `FormulaPrecificacao` do Mercado Livre (`precificacao/funcoes_auxiliares/mercado_livre/formula_precificacao.py`) — as outras 5 fórmulas de marketplace (Amazon, Magalu, Shopee, TikTok, Raia) são quase idênticas, mas ainda não replicadas.

## Implementado e Validado (08/08/2026, 03:40)

Todas as 10 etapas implementadas em `scripts_exploracao_ERP/duble_precificacao_ml.py` (código vive só no chat/local do usuário — nunca escrito pelo Claude, por convenção do repositório) e rodadas fim a fim pro produto teste (EAN 7908050719121, Clássico, margem-alvo 15% = `margem_padrao`).

Matemática conferida manualmente, bate exatamente com o impresso:
- FIXO: 4,33 (coleta) + 1,50 (armazenagem) + 238,16 (custo final) − (0 + 2,47 + 11,87 créditos ICMS/PIS/COFINS) = 229,66.
- Denominador: 1 − 0,12 (comissão) − 0,15 (margem-alvo) = 0,73.
- Resultado: preço final R$ 408,90, frete usado R$ 68,65, margem obtida ≈15,05% (acima do alvo por causa do arredondamento ,90 pra cima — comportamento esperado da fórmula real).

Ao implementar, 2 decisões "em aberto" tiveram que ganhar uma escolha explícita pra o código rodar (marcadas em comentário `[EXPLICAÇÃO]` no script, não fechadas com o usuário ainda):
- Etapa 7: fórmula de redução (`base_calculo = custo_unitário × (1 − redução/100)`) usada igual pra todo imposto, incluindo ICMS/ICMS ST (redução vinda direto da API, não derivada).
- Etapa 8: PIS e COFINS entram como **2 créditos separados** no FIXO (não 1 combinado).

## Correção (08/08/2026, 17:00) — Aguardando validação do tributário/superior

Validado com produto real de ICMS ≠ 0% (EAN 7908050700174, alíquota 18%, redução 68,89% — os 2 produtos testados antes tinham alíquota 0%, não testavam nada).

**ICMS normal: fórmula da Etapa 7 confirmada, exata.**
```
Base Cálculo = Custo Total × (1 − Redução) → 2.831,35 × (1 − 68,89%) = 880,83 ✓
Valor = Base × Alíquota → 880,83 × 18% = 158,55 ✓
```

**ICMS ST: a mesma fórmula NÃO serve — correção de arquitetura necessária.**
- A base do ICMS ST não é derivável do custo unitário — já vem com margem agregada (MVA) embutida pelo fornecedor antes da redução (`custo_total × (1−redução)` dá 880,83, mas a base real da nota é 1.389,95). Correção: usar o campo bruto da nota (`Base Calculo ICMS ST`) dividido pela quantidade, nunca re-derivar via custo unitário.
- O valor do ICMS ST também não é `base × alíquota` isolado (1.389,95 × 18% = 250,19 ≠ 91,64 real). Fórmula real, validada exata:
  ```
  Valor ICMS ST = (Base Cálculo ICMS ST × Alíquota ICMS ST) − Valor ICMS (normal)
  250,19 − 158,55 = 91,64 ✓
  ```
  Consistente com a lógica de substituição tributária: o ICMS ST compensa o que já foi cobrado na operação própria — não é um imposto somado isoladamente, tem dependência direta do ICMS normal.

Implicação pro dublê: ICMS ST precisa virar caso especial na Etapa 7/8 — calculado *depois* do ICMS normal (dependência de dado), não em paralelo com os outros impostos. Código ainda não corrigido, só a fórmula validada.

**Aguardando validação do tributário/superior** — ver [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]: bate com os dados da API e com a lógica conhecida de substituição tributária, mas o usuário não tem formação tributária formal pra confirmar sozinho.

## Implementado e validado (08/08/2026, 17:15)

Código corrigido em `duble_precificacao_ml.py` (Etapa 4, versão didática simplificada): nova função `_exibir_calculo_didatico_icms_st(icms_st, quantidade_nota, valor_icms_normal_unitario)`, separada da genérica `_exibir_calculo_didatico_do_imposto` — recebe o valor do ICMS normal já calculado como parâmetro (dependência explícita), usa `Base Calculo ICMS ST` (nota) ÷ quantidade como base (nunca deriva do custo unitário), e calcula `valor = (base × alíquota) − valor_icms_normal`. Chamada do ICMS movida para capturar o retorno (`valor_icms = ...`) e passá-lo pra função nova.

Rodado contra o mesmo produto de teste (EAN 7908050700174) — resultado bate exato com a validação manual da seção "Correção" acima:
- ICMS: R$ 31,71 por unidade (= 158,55 / 5, nível da nota).
- ICMS ST: base 277,99 → bruto 50,04 → líquido **R$ 18,33** por unidade (= 91,64 / 5, nível da nota).

**Aguardando validação do tributário/superior** — ver [[Achados de Imposto Sempre Aguardam Validacao do Tributario]].

## Implementado e Validado fim a fim — Etapas 5-9 (09/08/2026, 03:27)

Plano de 9 etapas concluído: PIS e COFINS definitivamente separados (nunca mais somados num campo só), Etapa 4 é o único ponto que calcula imposto, tudo depois (Etapas 5-9) só consome. Etapa 5 (Custo Final), 6 (Coleta), 7 (Armazenagem — faixa dinâmica, não mais planilha), 8 (FIXO) e 9 (Taxa/Denominador/Preço Final) reaproveitam código real (`ConfiguracaoOperacional`, `FaixaArmazenagem`, `FreteML`, `resolver_preco_por_margem`), só substituindo o dado fiscal de entrada pelo `DadosXmlNF`.

Rodado pro EAN 7908050700174 (Clássico, margem padrão 15%) — preço final R$ 913,90, margem obtida 15,08%. Comparado com a tela real do sistema pro mesmo produto/margem hoje: **R$ 1.031,90**, margem exata 15,00%. Diferença de R$ 118,00 explicada:

- **R$ 81,16 vêm de crédito fiscal de entrada que o sistema real ignora hoje** (ICMS R$ 31,71 + PIS R$ 8,82 + COFINS R$ 40,63) — `icms_entrada`/`pis_cofins` estão zerados no banco pra esse produto (planilha nunca preenchida), não porque o produto não tenha crédito de verdade. Ver [[Credito Fiscal Nao Cumulativo (ICMS PIS COFINS)]] pro conceito completo.
- **O restante (~R$ 37) vem de uma divergência de custo ainda não explicada**: banco tem custo R$ 619,70, XML (nota mais recente) mostra R$ 566,27 — mesma dúvida já vista antes (planilha desatualizada, ou definição diferente de "custo atual"). Em aberto, não investigado ainda.

**Aguardando validação do tributário/superior** nos valores de crédito — a lógica bate com o dado da nota e com o mecanismo não-cumulativo conhecido, mas confirmação formal ainda não foi feita.

## Validação em lote contra a planilha real — 3 produtos, 1 por tributação (09/08/2026, 16:40)

Escolhidos 3 produtos, 1 de cada categoria de `Tributação` da planilha do superior (Tributado, Redução, ST), pra fechar de vez a dúvida se "Redução" precisa do mesmo tratamento especial que "ST": SB-630 (Tributado, EAN 7908050734971), Guarany S4 20L (Redução, EAN 7891988035770), K-430 (ST, EAN 7908050700174). Rodado o dublê pros 3 (`console.save_text()` salvando log completo em txt) e comparado célula a célula com a aba correspondente da planilha (`3_exemplos.xlsx`).

**Achados desta rodada:**

1. **Bug real encontrado e corrigido** — `_exibir_calculo_didatico_icms_st` gerava um valor de ICMS ST negativo fantasma pra produtos sem substituição tributária, reduzindo o Custo Final indevidamente (afetava SB-630 e Guarany, não afetava K-430 que já tem ST de verdade). Corrigido e revalidado — Custo Final do dublê bate quase exato com a planilha nos 3 produtos. Ver [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]] pra detalhe completo e a tabela de validação.
2. **Pergunta da "Redução" respondida** — confirmado com o Guarany que Redução de base não usa substituição tributária (Base ICMS ST = 0), então não precisa de nenhum ajuste especial de diferimento. Ver seção "Resolvido" em [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]].
3. **2 achados de qualidade de dado, fora do escopo fiscal** — `frete_cif_fob` zerado no banco nos 3 produtos (planilha tem valor real) e dimensões físicas zeradas no cadastro do SB-630 (quebra Coleta/Armazenagem/Frete pra esse produto específico). Ver [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]].
4. **1 divergência fiscal em aberto** — SB-630 tem PIS/COFINS entrada = 0% na planilha, mas o XML dá crédito real de R$ 98,33/unidade. Ver [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]].

ICMS entrada e IPI validados exatos nos 3 produtos, sem exceção — a lógica da Etapa 4 está confirmada.

## Em aberto (após a implementação)

- ~~Investigar a divergência de custo (banco R$ 619,70 vs XML R$ 566,27) pro EAN 7908050700174.~~ — **Resolvida (17:17)**: por [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]], R$ 566,27 (XML) é o valor válido; banco estava desatualizado.
- ~~Validar com o tributário/superior a divergência de PIS/COFINS entrada do SB-630.~~ — **Resolvida quanto à fonte (17:17)**: R$ 98,33/unidade (XML) é o valor válido, mesma regra. Ver [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]] — segue "aguardando validação do tributário" só quanto à fórmula, não à fonte.
- Corrigir/investigar o cadastro de dimensões do SB-630 e o campo `frete_cif_fob` nos 3 produtos testados (ver [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]]).
- Confirmar com o usuário se PIS/COFINS separados no FIXO (escolha da Etapa 8) é o critério certo, ou se deveria ser combinado.
- Quando (e se) isso vira escrita real no banco, e em que ordem em relação ao import da planilha atual (`importar_planilha_precificacao.py`, que hoje roda por último e "vence").
- Replicar o dublê pras outras 5 fórmulas de marketplace (Amazon, Magalu, Shopee, TikTok, Raia) — só ML foi feito.

## Relacionado

- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]
- [[Modelagem de Objeto e Encapsulamento]]
- [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]
- [[Credito Fiscal Nao Cumulativo (ICMS PIS COFINS)]]
- [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]
- [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]]
- [[Divergencia de Credito PIS COFINS Entrada no Soprador SB-630]]
- [[Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
