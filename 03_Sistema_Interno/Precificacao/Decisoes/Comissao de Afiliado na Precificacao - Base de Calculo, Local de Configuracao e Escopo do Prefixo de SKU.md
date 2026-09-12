---
tipo: decisao
dominio: 
status: ativa
criado: 11/09/2026
atualizado_em: 11/09/2026 19:42
relacionado: [Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao, Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados, Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema, Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo)]
---

# Comissão de Afiliado na Precificação: Base de Cálculo, Local de Configuração e Escopo do Prefixo de SKU

**Resumo**: resolve a dúvida em [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]] — comissão de afiliado é um custo extra (percentual configurável por plataforma, ex: TikTok 8%) somado à comissão normal, incidindo sempre sobre o preço de venda do próprio tipo de anúncio/marketplace, sem mudar a lógica de margem; configurada num campo na configuração geral do Marketplace (UX específica adiada de propósito); detectada por um prefixo "1" no SKU, convenção universal do sistema interno em qualquer marketplace.

> [!info] DECISÃO ATIVA — regra vale a partir de agora, implementação ainda não iniciada
> Confirmado com Matheus em 11/09/2026. Nenhum código foi alterado ainda — esta nota registra a regra de negócio completa antes da implementação.

## Contexto

A grade de precificação do ML está sendo redesenhada pra incluir um eixo de Afiliado (Não Afiliado / Com Afiliado), além dos eixos de Tipo de Anúncio (Clássico/Premium) e Tipo Logístico (ver [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]). "Afiliado" é um programa de indicação que gera uma comissão extra, configurada por Matheus em cada plataforma — hoje só o valor do TikTok está fechado, 8%. Um anúncio afiliado é identificável pelo próprio SKU: o SKU comum segue o padrão `F(ean).001`, e o SKU de afiliado tem o prefixo "1" antes do EAN, `1F(ean).001`.

## O problema

Faltavam 3 confirmações antes de fechar a implementação (ver [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]): (1) sobre qual base de preço a comissão de afiliado incide, (2) onde esse campo deve morar na configuração, e (3) se o prefixo "1" do SKU é convenção universal ou varia por plataforma.

## O que levou à decisão

A base de cálculo (1) foi confirmada analisando a `Planilha_REFERENCIA_PRECIFICAÇÃO_Reduzida.xlsx` do superior de Matheus: TikTok e Shopee têm fórmula viva (`=Preço_Por×8%`), e o ML — depois de esclarecido que a planilha do superior calcula na direção oposta à do sistema (Preço gera Margem, não Margem gera Preço — ver [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]) — confirmou o mesmo padrão nos 2 tipos de anúncio: Clássico usa o preço do próprio Clássico, Premium usa o preço do próprio Premium, nunca cruzado. As 2 confirmações restantes (local de configuração e escopo do SKU) vieram direto de Matheus, sem necessidade de investigação adicional: o campo é configurável por plataforma (não por tipo de anúncio), então mora na configuração geral do Marketplace; e o prefixo de SKU é uma convenção própria do sistema interno, não algo que muda por marketplace.

## Decisão

1. **Base de cálculo**: `comissão_afiliado = percentual_da_plataforma × preço_de_venda_do_proprio_tipo_de_anuncio_ou_marketplace`. É um custo extra somado à comissão normal — nunca muda a lógica/fórmula de margem, e nunca usa uma base diferente (preço líquido, preço de outro tipo de anúncio, etc.).
2. **Local de configuração**: campo `comissao_afiliado` na configuração geral do Marketplace (junto com sigla 'ML', 'TikTok' etc.) — configurável por plataforma, não por tipo de anúncio. O desenho de UX específico desse campo (tela, formulário) fica pra depois, por decisão de Matheus — não é falta de resposta, é adiamento deliberado.
3. **Escopo do prefixo de SKU**: o prefixo "1" antes do EAN (`F(ean).001` comum → `1F(ean).001` afiliado) é convenção universal do sistema interno, válida em qualquer marketplace — não muda por plataforma.

## Exemplo

Um anúncio Clássico no Mercado Livre, SKU `1F7908050719121.001` (prefixo "1" → afiliado), com preço de venda resolvido pelo Goal Seek em R$ 100,00 e comissão de afiliado do ML ainda não definida (hipotético 5%, só ilustrativo): soma R$ 5,00 de comissão de afiliado ao FIXO da fórmula, além da comissão normal de 12% do Clássico — nunca troca a margem-alvo configurada, só adiciona esse custo extra ao cálculo.

## Status de implementacao (atualizado 11/09/2026)

Levantado no codigo real (ver [[Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo)]]): TikTok ja tem essa logica implementada (ConfiguracaoTiktok.margem_afiliado_percentual, consumido em precificacao/funcoes_auxiliares/tiktok/formula_precificacao_tiktok.py). ML e Shopee ainda nao tem nenhum codigo -- o teste precificacao/tests/test_nivel_3__formula_precificacao_shopee.py inclusive declara explicitamente que a Shopee hoje so tem 1 fluxo, sem distincao de afiliado. Esta decisao vale pros 3 marketplaces igualmente; falta implementar em 2 deles.

## Relacionado

- [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]
- [[Grade de Precificacao ML Usa Apenas FULL vs Nao-FULL, Nunca os 7 Tipos Logisticos Separados]]
- [[Preco Gera Margem x Margem Gera Preco - Direcoes Opostas Entre a Planilha do Superior e o Goal Seek do Sistema]]
- [[Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo)]]
