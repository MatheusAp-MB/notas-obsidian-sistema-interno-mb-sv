---
tipo: Decisão
status: Ativo
criado: 12/07/2026
dominio: Sistema Interno Django
relacionado: [Hierarquia e Comportamentos de Recomendação de Precificação, Tela de Recomendação de Precificação, FreteML]
---

# Fórmula de Margem e Rebate de Promoção

## Contexto

Existe uma fórmula de precificação já validada (documentada em PDF externo,
"Goal Seek Analítico") e já implementada de verdade num projeto anterior
(`Projeto-Precificacao-MB`, abandonado depois — o Sistema Interno V2 é uma
reconstrução do zero). A fórmula em si nunca precisou ser reinventada — só
precisou ser reimplementada na direção contrária, e alimentada com a fonte de
dado certa.

## A fórmula (direção "preço → margem")

O PDF documenta o Goal Seek na direção "dada uma meta de margem, qual preço
cobrar" (usado pra decidir preço de tabela). A tela de Recomendação de
Precificação precisa da direção **contrária**: dado um preço (o publicado,
ou o de uma promoção), qual margem ele resulta. É bem mais simples de
calcular, porque não tem a circularidade preço↔faixa-de-frete do Goal Seek
original — o preço já é conhecido, então o frete é uma consulta direta.
taxa  = comissão% + icms_saída% + pis%
FIXO  = coleta + armazenagem + custo_final − custo×(icms_entrada% + pis%)
custo_final = custo_com_boni + custo_com_boni×ipi% + custo_com_boni×frete_cif_fob% + st_valor
coleta = metro_cúbico × R$72   (metro_cúbico = altura×largura×profundidade / 100³)
armazenagem = Produto.armazenagem_planilha (valor MENSAL já pronto — ver seção abaixo)
margem_valor = preço × (1 − taxa) − FIXO − frete + rebate_valor
margem%      = margem_valor ÷ preço × 100

Implementada em `mercado_livre/funcoes_auxiliares/calculo_margem.py`
(`calcular_margem()`), sem nenhuma dependência do projeto antigo — reescrita
do zero em cima da fórmula documentada.

## Comissão por tipo de anúncio

Clássico: 12%. Premium: 17%. **Fixas em código** (`COMISSAO_POR_TIPO`), não
são campo de `TipoDeAnuncioMercadoLivre` ainda — formalizar isso é pendência
futura se o número mudar ou passar a variar por categoria.

## `armazenagem_planilha` — por que é valor real importado, não calculado

A planilha atribui faixas de armazenagem por dimensão do produto de forma
**inconsistente** (documentado no projeto antigo: calcanheiras pequenas caem
na faixa "grande", palmilhas longas caem na faixa "pequena" — parece
depender de dimensão de embalagem ou atribuição manual, nunca totalmente
esclarecido, ficou como pendência de reunião com o criador da planilha que
nunca aconteceu). Por isso, `Produto.armazenagem_planilha` importa o valor
**mensal já pronto** da planilha (coluna BH), em vez de calcular por regra de
dimensão — é a única forma de bater com o número oficial.

Fonte: `Planilha_Importar_Pos_Macro.xlsm`, importada por
`importar_planilha_precificacao.py`, que roda por **último** no
`popular_banco` de propósito — precisa "vencer" a disputa dos mesmos campos
(custo, fiscais, dimensões) que `importar_produtos_erp_completo.py` também
preenche, vindos de uma fonte diferente (Relatório Completo ERP, geral, não
validada especificamente pra precificação).

## Rebate de promoção — como se encaixa

Quando existe rebate do ML numa promoção (`meli_percentage`, vem da API de
Promoções), ele abate direto da comissão que seria paga:
rebate_valor = preco_original × (meli_percentage ÷ 100)

Esse valor entra somado na `margem_valor` (é dinheiro que deixa de sair do
seu bolso em comissão). Confirmado com dado real que **nem toda promoção tem
rebate** — dos 4 tipos observados na API (`SMART`, `LIGHTNING`,
`PRICE_DISCOUNT`, `DEAL`), só `SMART` trouxe `meli_percentage` preenchido nos
casos testados; os outros 3 têm `price: 0` (ainda não efetivado) e usam
`suggested_discounted_price` como preço a avaliar.

**Importante:** "está em promoção" (critério `UP_HAS_PROMOTIONS`) e "tem
desconto de preço" (`preco_original` preenchido) são conceitos **diferentes**
— confirmado com MLB real que tinha o critério aprovado sem ter
`preco_original`. Promoção pode ser frete grátis, parcelamento, etc., sem
mexer no preço exibido.

## Validação — 3 casos reais confirmados contra a planilha oficial

- **Calcanheira** (`MLB6609722794`): confirmou a fórmula em si (Clássico
  22,11%, Premium 17,11% — bateu exato depois de corrigir qual comissão usar
  no teste manual).
- **Liner de Prótese** (`MLB6537703216`): confirmou o rebate de 1 campanha
  simultânea (SMART com rebate pequeno, 0,5%/2,5%).
- **Bolsa Térmica** (`MLB4145293634`): terceira confirmação, sem
  particularidade nova.

**Achado relevante durante a validação:** um teste manual na planilha (preço
R$108,67) deu margem diferente da tela (-5,99% vs -4,06%) — a causa não foi
bug de fórmula nem de dado, foi uma célula da própria planilha (`BI218`)
presa no preço antigo (R$146,77) durante a simulação manual, fazendo ela
buscar a faixa de frete errada. O sistema **evita esse tipo de erro
naturalmente**, porque busca o frete de cada linha de forma independente e
automática — nenhuma célula "esquecida" possível.

## Descoberta lateral: MLBs podem ter múltiplas campanhas SMART simultâneas

Confirmado com dado real (`MLB6609722794`): 2 promoções SMART diferentes
(`P-MLB17625058` e `P-MLB17647056`, IDs/nomes distintos) com status
`started` ao mesmo tempo, cada uma com sua própria divisão de rebate. Não é
bug — é comportamento real da API (o ML permite inscrição simultânea em mais
de 1 campanha). Fica registrado porque parecia "estranho" à primeira vista.

## Relacionado

- [[Regras Gerais]]
- [[Visao Geral do Projeto]]
- [[Hierarquia e Comportamentos de Recomendação de Precificação]]