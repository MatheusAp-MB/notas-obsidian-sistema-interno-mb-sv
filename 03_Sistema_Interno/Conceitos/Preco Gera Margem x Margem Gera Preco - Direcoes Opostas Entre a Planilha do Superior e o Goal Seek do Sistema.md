---
tipo: conceito
dominio: 
status: ativa
criado: 11/09/2026
atualizado_em: 11/09/2026 19:15
relacionado: [Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]
---

# Preço Gera Margem x Margem Gera Preço: Direções Opostas Entre a Planilha do Superior e o Goal Seek do Sistema (Conceito)

**Resumo**: a planilha de referência do superior de Matheus calcula na direção "Preço → Margem" (o preço é a entrada, a margem resultante é o que se observa); o sistema (Goal Seek, `precificacao/funcoes_auxiliares/goal_seek.py`) calcula na direção oposta, "Margem → Preço" (a margem-alvo é a entrada, o preço é resolvido/derivado). Uma coluna com valor "fixo" na planilha do superior não é necessariamente um dado de entrada real — pode ser o resultado goal-seekado dele mesmo, só que apresentado como se fosse.

> [!info] CONCEITO ATIVO — vale toda vez que a planilha do superior for usada como referência
> Sempre que uma coluna de preço na planilha do superior parecer "errada" ou "sem fórmula visível", checar primeiro se não é só o resultado da direção oposta de cálculo antes de concluir que é erro de planilha.

## Contexto

Durante a análise da `Planilha_REFERENCIA_PRECIFICAÇÃO_Reduzida.xlsx` (11/09/2026), buscando entender como a comissão de afiliado do Mercado Livre é calculada (ver [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]), 2 colunas de preço (`BI`, rotulada só "Preço", e `BW`, rotulada "Preço (8,0%)") pareceram inicialmente inconsistentes: `BQ` (Afiliado Clássico) batia exatamente 8% de `BI`, enquanto `BZ` (Afiliado Premium) tinha uma fórmula viva `=BW*8%` — 2 bases diferentes, sem fórmula aparente ligando as duas. A leitura inicial foi "erro de arrasto de fórmula". Matheus corrigiu: não é erro — `BI` é o preço de venda do cenário Clássico, `BW` é o preço de venda do cenário Premium, cada um calculado (goal-seekado) separadamente pelo superior. A comissão de afiliado sempre incide sobre o preço do próprio cenário, nos 2 casos.

## O que é

- **Planilha do superior — "Preço gera Margem"**: o preço de venda é tratado como a variável que se decide (manualmente, ou via Goal Seek do próprio Excel/VBA), e a margem resultante é o que se calcula e observa a partir dele. Por isso colunas de preço na planilha do superior aparecem como valores "fixos"/colados, sem fórmula — não são necessariamente dado bruto de entrada, podem já ser o resultado de um Goal Seek anterior, só que congelado como valor.
- **Sistema (Projeto Interno V2) — "Margem gera Preço"**: a margem-alvo é a entrada (configurada em `ConfiguracaoTipoAnuncioMercadoLivre`, por exemplo), e o preço de venda é a incógnita que o `goal_seek.py` resolve. É a direção logicamente inversa da planilha do superior.

## Por que essa distinção importa

Uma coluna "sem fórmula" na planilha do superior pode enganar quem está lendo de fora: parece dado de entrada arbitrário, mas na verdade é o resultado de um cálculo que só não ficou visível porque foi colado como valor (fluxo comum de Goal Seek no Excel/VBA, que sempre grava o resultado como valor, nunca como fórmula). Isso quase levou a uma conclusão errada ("erro de arrasto") quando na real as 2 colunas de preço (`BI` e `BW`) eram 2 resultados corretos, um por cenário (Clássico e Premium), sem nenhuma relação direta de fórmula entre elas.

## Exemplo

Ao portar uma fórmula da planilha do superior pro `goal_seek.py` do sistema, qualquer coluna de "Preço" referenciada na planilha dele deve ser tratada como o preço daquele cenário específico, nunca como um dado de entrada fixo a ser copiado — no sistema, esse mesmo valor é a incógnita que o Goal Seek de cada tipo de anúncio (Clássico ou Premium) resolve separadamente. Foi assim que se confirmou que a comissão de afiliado do ML usa sempre o preço do próprio tipo de anúncio (`Preco_Classico × 8%` ou `Preco_Premium × 8%`), nunca uma mistura entre os 2.

## Relacionado

- [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]
