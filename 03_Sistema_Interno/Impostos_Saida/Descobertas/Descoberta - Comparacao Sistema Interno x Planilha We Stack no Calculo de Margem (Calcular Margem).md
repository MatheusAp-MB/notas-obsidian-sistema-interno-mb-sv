---
tipo: descoberta
dominio: python
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 13:02
relacionado: [Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins, Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado, Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo, Duvida - We Stack Precisa de Coleta Armazenagem e Credito de Pis Cofins de Entrada para Calcular Margem Real, Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]
---

# Descoberta: Comparação Sistema Interno x Planilha We Stack no Cálculo de Margem (`calcular_margem()`)

**Resumo**: a planilha "Cálculo final We Stack (Doc refeita)" é rotulada "MERCADO LIVRE" e existe pra calcular margem a partir de um Preço de Venda já pronto (vindo direto do ML, nunca calculado pela We Stack) — o contraponto certo no código não é a fórmula de precificação (Goal Seek), é `mercado_livre/funcoes_auxiliares/calculo_margem.py::calcular_margem()`, a função real que já existe hoje pro Hub de Promoções. Comparando os dois: a maior parte bate certo (frete por tabela, comissão configurável, rebate só em promoção, fonte de PIS/COFINS/ICMS de saída). 2 lacunas reais de informação foram encontradas — Coleta e Armazenagem, e o crédito de PIS/COFINS de entrada — que fazem a margem que a We Stack aprender ficar maior do que a real. Outras diferenças (ICMS MÉDIA, custo final, `calcular_margem` só existir pro ML) são de modelagem, não de bug.

> [!success] Confirmada — 12/09/2026, leitura direta do código + planilha
> Planilha lida com `openpyxl` em 2 passagens (fórmula + valor em cache), célula a célula. Código lido e conferido direto (`calcular_margem`, `calcular_fixo_detalhado`, `calcular_custo_final`, models de impostos de entrada) — nenhum achado depende só de leitura superficial.

## Contexto

Depois de mapear a comparação entre a planilha do superior e o sistema (ver [[Descoberta - Comparacao Planilha do Superior x Sistema em Impostos (Nao Cobertos, Divergentes e Equivalentes)]]) e de corrigir 3 bugs confirmados na planilha We Stack (ver [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]), Matheus pediu uma comparação direta entre o Sistema Interno e a planilha We Stack. Matheus depois esclareceu um ponto crítico: a We Stack vai pegar o Preço de Venda pronto, direto do ML — nunca vai calcular preço, só precisa saber os custos pra chegar na margem de lucro final. Isso definiu qual função do código é o contraponto certo da planilha.

## Metodologia

A aba única da planilha (`Planilha1`, A1:BL18) foi lida por inteiro com `openpyxl` (fórmula crua + valor em cache), incluindo o bloco ENTRADA, o bloco SAÍDA/Margem (rotulado "MERCADO LIVRE" na própria planilha) e a tabela de 27 UFs. Como o bloco de margem trata Preço de Venda como dado pronto (não como incógnita), o contraponto certo no código é `calcular_margem()` — não as fórmulas de precificação/Goal Seek usadas nas outras comparações. `calcular_margem()`, `calcular_fixo_detalhado()` e os models de impostos de entrada foram lidos direto do repositório.

## Resposta

### O que já bate certinho

FRETE calculado por tabela de peso/dimensão (`buscar_frete`), Comissão configurável (`ConfiguracaoTipoAnuncioMercadoLivre`), Rebate somado à margem só no fluxo de promoção (mesmo sinal e mesmo papel dos 2 lados), e a fonte de PIS/COFINS/CST/ICMS de saída sendo a mesma "Busca Legal" já documentada. A anotação de "Redução" (PIS/COFINS de entrada) bate palavra por palavra com o comentário real do código (`descritores_impostos.py`): "PIS e COFINS são os únicos 2 cuja redução não vem pronta no XML — é calculada aqui no sistema (Base de Cálculo ÷ Custo Total)".

### 2 lacunas reais de informação pra We Stack (mudam a margem calculada)

- **Coleta e Armazenagem não existem em nenhuma coluna da planilha.** `calcular_fixo()` real soma `coleta + armazenagem + custo_final − créditos` — a planilha pula direto de Custo Final pros impostos de saída, sem esses 2 custos. Consequência: a margem que a We Stack calcular vai sair sistematicamente maior do que a real, porque 2 custos de verdade nunca são descontados.
- **Crédito de PIS/COFINS de entrada é calculado na planilha, mas nunca usado.** As colunas de Alíquota-Redução (bloco ENTRADA, PIS e COFINS) têm fórmula certa, mas nenhuma fórmula posterior da planilha (nem Custo Final, nem Margem Valor) as referencia. No sistema, `creditos.pis` e `creditos.cofins` são descontados de verdade dentro do FIXO. Mesma consequência: margem superestimada.

Ambas ficam como pergunta em aberto — ver [[Duvida - We Stack Precisa de Coleta Armazenagem e Credito de Pis Cofins de Entrada para Calcular Margem Real]].

### Diferenças de modelagem (não são bug, nem lacuna de informação)

- **ICMS MÉDIA (ponderada) da planilha ≠ campo do sistema.** A fórmula corrigida da planilha (`SP×50% + média das outras 26 UFs×50%`) e o campo `icms_saida_media` (média simples, sem SP) eram 2 números diferentes — resolvido pela decisão de que a ponderada é a que vale (ver [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]).
- **Crédito de ICMS de entrada**: a planilha aplica um percentual (alíquota-redução) sobre o Custo Final; o sistema usa o valor real (R$) lido direto da nota fiscal, já líquido de ICMS-ST quando aplicável. Aproximação razoável da planilha, não um erro.
- **Custo Final**: a planilha calcula multiplicativo, `(Custo+Frete)×(1+IPI%)`; o sistema calcula aditivo, `custo + IPI_valor_real_da_nota + custo×Frete%`. A ausência de um conceito equivalente a `custo_com_boni` na planilha deixou de ser diferença — ver [[Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo]].
- **`calcular_margem()` só existe pro Mercado Livre.** Bate com o próprio recorte da planilha (bloco rotulado "MERCADO LIVRE") — não é lacuna, a menos que a Central de Promoções da We Stack precise da mesma lógica pros outros 5 marketplaces no futuro.

### Risco prático (não é lacuna de informação, é execução)

Os 3 campos que `calcular_margem()` lê do banco (`icms_saida_media`, `pis_percentual`, `cofins_percentual`) só são preenchidos por um comando manual (`preencher_impostos_saida`), fora do pipeline automático — não dá pra confirmar pelo código que estão populados pra todo produto hoje.

## Relacionado

- [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]
- [[Decisao - Base de Calculo do Pis Cofins de Saida Passa a Usar Preco Menos ICMS Medio Ponderado]]
- [[Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo]]
- [[Duvida - We Stack Precisa de Coleta Armazenagem e Credito de Pis Cofins de Entrada para Calcular Margem Real]]
- [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]
