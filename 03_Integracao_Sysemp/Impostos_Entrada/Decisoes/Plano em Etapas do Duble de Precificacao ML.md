---
tipo: decisao
dominio: 
status: ativa
criado: 08/08/2026
atualizado_em: 08/08/2026 03:40
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total, Modelagem de Objeto e Encapsulamento]
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

## Em aberto (após a implementação)

- **Não validado**: a fórmula de redução da Etapa 7 pra ICMS/ICMS ST com produto real de alíquota ≠ 0 — o produto teste tinha ICMS com alíquota 0% e redução 100% (matematicamente não testa nada, já que qualquer redução × alíquota 0 dá 0).
- **Conferir se é dado real ou incompleto**: no teste, `icms_saida_percentual`, `pis_cofins_saida_percentual` e `frete_cif_fob_percentual` (os 3 vêm do `Produto` real, não do Sysemp) saíram 0 — pode ser produto isento de verdade, ou só campo vazio no banco pra esse EAN especificamente.
- Confirmar com o usuário se PIS/COFINS separados no FIXO (escolha da Etapa 8) é o critério certo, ou se deveria ser combinado.
- Testar o dublê com mais produtos (só 1 testado até agora).
- Quando (e se) isso vira escrita real no banco, e em que ordem em relação ao import da planilha atual (`importar_planilha_precificacao.py`, que hoje roda por último e "vence").
- Replicar o dublê pras outras 5 fórmulas de marketplace (Amazon, Magalu, Shopee, TikTok, Raia) — só ML foi feito.

## Relacionado

- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]
- [[Modelagem de Objeto e Encapsulamento]]
