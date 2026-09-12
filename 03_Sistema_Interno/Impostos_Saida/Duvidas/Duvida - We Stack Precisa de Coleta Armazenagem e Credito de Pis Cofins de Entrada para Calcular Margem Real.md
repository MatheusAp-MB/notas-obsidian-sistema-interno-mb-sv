---
tipo: duvida
dominio: 
status: em_aberto
criado: 12/09/2026
atualizado_em: 12/09/2026 13:02
relacionado: [Descoberta - Comparacao Sistema Interno x Planilha We Stack no Calculo de Margem (Calcular Margem), Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]
---

# Dúvida: We Stack Precisa Saber de Coleta, Armazenagem e Crédito de PIS/COFINS de Entrada pra Calcular a Margem Real?

**Resumo**: Matheus confirmou que a We Stack vai pegar o Preço de Venda pronto, direto do ML — nunca vai calcular preço, só precisa dos custos pra chegar na margem de lucro final. Com esse recorte, a comparação (ver [[Descoberta - Comparacao Sistema Interno x Planilha We Stack no Calculo de Margem (Calcular Margem)]]) achou 2 custos reais que o sistema desconta no cálculo de margem (`calcular_fixo()`) mas que não existem em nenhuma coluna da planilha ensinada à We Stack: Coleta e Armazenagem. Achou também que o crédito de PIS/COFINS de entrada é calculado na planilha mas nunca chega a ser descontado na Margem Valor. Falta decidir se isso precisa ser passado pra We Stack (planilha nova, ou outra forma), ou se é uma simplificação aceita de propósito.

> [!question] Em aberto
> Sem os 2, a margem que a We Stack calcular vai sair sistematicamente maior do que a margem real do produto.

## Contexto

Ao comparar `calcular_margem()` (a função real do Hub de Promoções) com a planilha "Cálculo final We Stack (Doc refeita)", ficou claro que a planilha ensina bem os impostos de saída e o frete, mas nunca menciona 2 custos que o sistema desconta antes de chegar na margem: Coleta e Armazenagem. Ficou claro também que o crédito de PIS/COFINS de entrada é computado nas colunas da planilha (Alíquota-Redução), mas essas colunas nunca são referenciadas em nenhuma fórmula posterior (nem Custo Final, nem Margem Valor) — o crédito é calculado e descartado.

## A pergunta

1. A We Stack precisa saber de Coleta e Armazenagem pra calcular a margem de lucro real de cada venda? Se sim, como isso chega até ela — planilha atualizada, campo novo, outro formato?
2. O crédito de PIS/COFINS de entrada (que a planilha já calcula, mas não usa) deveria entrar na Margem Valor que a We Stack calcula? Ou é uma simplificação aceita — a diferença é pequena o bastante pra não importar pro uso que a We Stack vai dar a esse número?

## O que já se sabe

- `calcular_fixo()` real (`mercado_livre/funcoes_auxiliares/calculo_margem.py`): `fixo = coleta + armazenagem + custo_final − (credito_icms + credito_pis + credito_cofins)`.
- A planilha We Stack não tem nenhuma coluna equivalente a Coleta nem Armazenagem — a Margem Valor (`AF`) pula direto de Custo Final pros impostos de saída.
- As colunas P/Q/R (PIS de entrada) e S/T/U (COFINS de entrada) da planilha têm fórmula certa de Alíquota-Redução, confirmada batendo com o comentário real do código — mas nenhuma fórmula posterior da planilha as usa.
- Sem os 2 ajustes, a margem calculada pela We Stack sai maior do que a margem real — na direção de "parecer melhor do que é", nunca o contrário.

## Relacionado

- [[Descoberta - Comparacao Sistema Interno x Planilha We Stack no Calculo de Margem (Calcular Margem)]]
- [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]
