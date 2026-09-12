---
tipo: duvida
dominio: 
status: resolvida
criado: 11/09/2026
atualizado_em: 11/09/2026 19:24
relacionado: [Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados, Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema, Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU]
---

# Dúvida: Base de Cálculo e Local de Configuração da Comissão de Afiliado na Precificação

**Resumo**: comissão de afiliado (ex: 8% já definido pro TikTok) é um custo extra, configurável por plataforma, somado à comissão normal sem mudar a lógica de margem — detectado pelo prefixo "1" no SKU (`1F(ean).001` vs. `F(ean).001` comum). Resolvida em 11/09/2026 — ver [[Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU]].

> [!success] RESOLVIDA — a resposta completa está em nota separada, não aqui
> As 3 perguntas (base de cálculo, local de configuração, escopo do prefixo de SKU) foram todas respondidas e consolidadas em [[Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU]]. O raciocínio completo mora na nota de decisão, não aqui. Esta nota continua existindo como registro de como a dúvida surgiu e evoluiu antes de ser resolvida.

## Contexto

A grade de precificação do ML está sendo redesenhada pra incluir um eixo de Afiliado (Não Afiliado / Com Afiliado), além dos eixos já existentes de Tipo de Anúncio (Clássico/Premium) e Tipo Logístico (ver [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]). "Afiliado" é um programa de indicação que gera uma comissão extra, configurada por Matheus em cada plataforma — hoje só o valor do TikTok está fechado, 8%. Um anúncio afiliado é identificável pelo próprio SKU: o SKU comum segue o padrão `F(ean).001`, e o SKU de afiliado tem o prefixo "1" antes do EAN, `1F(ean).001`.

## A pergunta

Dois pontos específicos ainda sem resposta (a 3ª pergunta original, sobre base de cálculo, já foi respondida — ver "O que já se sabe"):

1. **Local de configuração**: faz sentido um campo `comissao_afiliado` direto na configuração geral do Marketplace (junto com sigla 'ML', 'TikTok' etc.), já que é configurável por plataforma e não por tipo de anúncio — ou Matheus imagina esse campo em outro lugar?
2. **Escopo do prefixo de SKU**: o prefixo "1" (`F(ean).001` → `1F(ean).001`) é uma convenção própria do sistema interno, válida em qualquer marketplace, ou é uma marcação que muda dependendo da plataforma (ex: TikTok usa esse prefixo, mas outro marketplace usa outra marcação)?

## O que já se sabe até agora

- Comissão de afiliado é separada da comissão normal do marketplace, configurável por plataforma — não por tipo de anúncio.
- TikTok: 8% já definido. ML e as demais plataformas ainda não têm valor confirmado.
- Não muda a fórmula/lógica de margem — é só um custo extra somado ao cálculo, sempre que aplicável (confirmado por Matheus: "sempre tem esse x% a mais pra ser pago de comissão pro afiliado").
- Cada percentual de comissão (marketplace, afiliado) fica registrado separado, sem somar os percentuais antes do cálculo — mesmo padrão já usado no sistema pra créditos fiscais de entrada (`CreditosFiscaisEntradaParaPrecificacao` mantém ICMS/IPI/PIS/COFINS como campos distintos, nunca fundidos num total genérico).
- **Base de cálculo confirmada (11/09/2026)**: analisando a `Planilha_REFERENCIA_PRECIFICAÇÃO_Reduzida.xlsx` do superior de Matheus, os 4 casos encontrados (ML Clássico, ML Premium, TikTok, Shopee) usam sempre `Preço_de_venda_do_proprio_tipo_anuncio_ou_marketplace × 8%` — nunca uma base cruzada ou líquida. A confusão inicial (2 colunas de preço do ML pareciam usar bases diferentes) era só a direção oposta de cálculo da planilha do superior, não um erro real — ver [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]. Na prática, isso significa que a fórmula do sistema deve usar o mesmo preço que o Goal Seek daquele tipo de anúncio já está resolvendo — nunca um preço de outro tipo de anúncio.

## Relacionado

- [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]
- [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]
- [[Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU]]
