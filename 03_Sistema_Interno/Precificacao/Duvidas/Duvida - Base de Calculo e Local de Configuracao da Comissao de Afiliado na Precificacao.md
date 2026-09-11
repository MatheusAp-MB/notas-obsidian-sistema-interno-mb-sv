---
tipo: duvida
dominio: 
status: em_aberto
criado: 11/09/2026
atualizado_em: 11/09/2026 18:53
relacionado: [Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]
---

# Dúvida: Base de Cálculo e Local de Configuração da Comissão de Afiliado na Precificação

**Resumo**: comissão de afiliado (ex: 8% já definido pro TikTok) é um custo extra, configurável por plataforma, somado à comissão normal sem mudar a lógica de margem — detectado pelo prefixo "1" no SKU (`1F(ean).001` vs. `F(ean).001` comum). Falta confirmar a base de cálculo dos 8%, onde esse campo deve morar na configuração, e se o prefixo do SKU é convenção universal ou varia por plataforma.

> [!question] EM ABERTO — pontos-chave já confirmados, 3 perguntas específicas restantes
> A mecânica geral (custo extra, configurável por plataforma, sem mudar margem) já está validada com Matheus em 11/09/2026. Faltam 3 confirmações específicas antes de fechar a implementação — ver "A pergunta" abaixo.

## Contexto

A grade de precificação do ML está sendo redesenhada pra incluir um eixo de Afiliado (Não Afiliado / Com Afiliado), além dos eixos já existentes de Tipo de Anúncio (Clássico/Premium) e Tipo Logístico (ver [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]). "Afiliado" é um programa de indicação que gera uma comissão extra, configurada por Matheus em cada plataforma — hoje só o valor do TikTok está fechado, 8%. Um anúncio afiliado é identificável pelo próprio SKU: o SKU comum segue o padrão `F(ean).001`, e o SKU de afiliado tem o prefixo "1" antes do EAN, `1F(ean).001`.

## A pergunta

Três pontos específicos ainda sem resposta:

1. **Base de cálculo**: os 8% do TikTok (e o que vier de outras plataformas) incidem sobre o preço de venda — a mesma base da comissão normal do marketplace — ou sobre outra base (ex: valor líquido após a comissão do marketplace)? Isso muda o resultado final do preço, não é só uma questão de exibição.
2. **Local de configuração**: faz sentido um campo `comissao_afiliado` direto na configuração geral do Marketplace (junto com sigla 'ML', 'TikTok' etc.), já que é configurável por plataforma e não por tipo de anúncio — ou Matheus imagina esse campo em outro lugar?
3. **Escopo do prefixo de SKU**: o prefixo "1" (`F(ean).001` → `1F(ean).001`) é uma convenção própria do sistema interno, válida em qualquer marketplace, ou é uma marcação que muda dependendo da plataforma (ex: TikTok usa esse prefixo, mas outro marketplace usa outra marcação)?

## O que já se sabe até agora

- Comissão de afiliado é separada da comissão normal do marketplace, configurável por plataforma — não por tipo de anúncio.
- TikTok: 8% já definido. ML e as demais plataformas ainda não têm valor confirmado.
- Não muda a fórmula/lógica de margem — é só um custo extra somado ao cálculo, sempre que aplicável (confirmado por Matheus: "sempre tem esse x% a mais pra ser pago de comissão pro afiliado").
- Cada percentual de comissão (marketplace, afiliado) fica registrado separado, sem somar os percentuais antes do cálculo — mesmo padrão já usado no sistema pra créditos fiscais de entrada (`CreditosFiscaisEntradaParaPrecificacao` mantém ICMS/IPI/PIS/COFINS como campos distintos, nunca fundidos num total genérico).
- Matematicamente, se a base de cálculo for a mesma (preço de venda) pros dois percentuais, manter os valores separados ou somar antes do cálculo dá o mesmo preço final — a separação existe pra rastreabilidade/exibição, não pra mudar o resultado. Isso só deixa de ser verdade se a resposta da pergunta 1 for "bases diferentes".

## Relacionado

- [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]
