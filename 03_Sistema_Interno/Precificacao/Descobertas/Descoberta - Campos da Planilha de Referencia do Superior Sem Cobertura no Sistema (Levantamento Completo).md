---
tipo: descoberta
dominio: python
status: confirmada
criado: 11/09/2026
atualizado_em: 11/09/2026 19:47
relacionado: [Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU, Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao, Preco Sugerido, Concorrente e STATUS-Validade-Estoque Genericos Nao Serao Implementados]
---

# Descoberta: Campos da Planilha de Referência do Superior Sem Cobertura no Sistema (Levantamento Completo)

**Resumo**: comparação campo a campo entre a `Planilha_REFERENCIA_PRECIFICAÇÃO_Reduzida.xlsx` do superior de Matheus (138 colunas) e o código real do Sistema Interno V2. A maior parte dos campos de custo/imposto/dimensão/armazenagem já está coberta (em alguns casos de forma mais robusta que a planilha). Ficam 3 lacunas reais sem cobertura (Preço Sugerido, Concorrente, STATUS/Validade Promoção/Estoque-Data genérico fora do ML), e 2 lacunas específicas de Afiliado (Shopee e ML) já endereçadas pela decisão em [[Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU]] mas ainda sem código.

> [!success] Confirmada — 11/09/2026, leitura direta do código-fonte
> Levantamento feito lendo os models e funções de cálculo dos apps `produtos`, `impostos`, `marketplaces`, `mercado_livre`, `amazon`, `magalu`, `raia`, `shopee`, `tiktok` e `precificacao` — comparado coluna a coluna contra os 138 campos da planilha do superior. Achados confirmados por Matheus em 11/09/2026.

## Contexto

Depois de fechar a dúvida sobre comissão de afiliado (ver [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]), Matheus pediu uma comparação direta: quais campos existem hoje na planilha do superior que não têm cobertura no sistema. A planilha é a referência histórica usada pra validar a precificação — mesma `Planilha_REFERENCIA_PRECIFICAÇÃO_Reduzida.xlsx` já analisada pra entender a fórmula de afiliado.

## Metodologia

Leitura direta dos models (`models/*.py` ou `models.py`) e das funções de cálculo (`funcoes_auxiliares/`) de cada app relevante — sem rodar nenhum comando, sem consultar banco de dados, só leitura de código-fonte (repositório já clonado localmente, nenhuma alteração feita). Os 138 cabeçalhos da planilha (linha 1, colunas `A` a `EH`) foram agrupados por categoria (dados cadastrais, custos/impostos de entrada, impostos de saída, dimensões/peso, armazenagem, preço final, campos operacionais, e blocos por marketplace) e cada um comparado contra o código.

## Resposta

### Coberto (maioria dos campos)

Custo, impostos de entrada (ICMS/IPI/PIS/COFINS, com crédito fiscal já resolvido em `impostos/funcoes_auxiliares/creditos_fiscais_para_precificacao.py`), impostos de saída, dimensões/peso, armazenagem (`FaixaArmazenagem`, mais flexível que a planilha — faixas configuráveis, não travadas em 4), e as fórmulas completas de ML/TikTok/Shopee/Amazon/Magalu/Raia (comissão, margem, frete) — em alguns pontos mais robusto que a planilha (auditoria passo-a-passo, que a planilha não tem).

### Não são gaps reais (confirmado com Matheus)

- **MVA** e **ST Valor como campo de `Produto`** — existiram, foram removidos de propósito (ST Valor migrou pra dentro do controle fiscal por nota fiscal, `IcmsStEntradaProduto`).
- **Tributação como campo único** — de propósito não existe assim: cada imposto (ICMS/IPI/PIS/COFINS) tem seu próprio CST/tributação, mais granular e mais correto que a coluna única da planilha.
- **cm3 persistido** — não necessário, sistema calcula em m³ on-the-fly.
- **"Amazon SRC"** (coluna `AU`) — não é gap, é resíduo: existiam 3 empresas (Magazine/MB, Samvale/SV e SRC), SRC não existe mais. A coluna ficou órfã na planilha do superior por inércia.

### Gaps reais, sem prioridade definida ainda

- **Preço Sugerido** — não existe um preço único agregado, independente de marketplace/margem; o sistema só calcula preço por combinação (marketplace × tipo × margem).
- **Concorrente** — nenhum campo genérico de preço de concorrente (só existe `CompeticaoCatalogo`, automatizado e específico da disputa de Catálogo do ML, não serve como equivalente geral).
- **STATUS / Validade Promoção / Estoque-Data genérico** — só existem versões automatizadas e exclusivas do ML (via API); os outros 5 marketplaces não têm nada equivalente manual/genérico.

### Gaps de Afiliado — já endereçados pela decisão, faltando código

- **Afiliado no ML** — sem código ainda (esperado, decisão acabou de ser tomada em [[Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU]]).
- **Afiliado na Shopee** — achado direto no código: o teste `precificacao/tests/test_nivel_3__formula_precificacao_shopee.py` declara explicitamente "sem tipo (DBA/FBA, com/sem afiliado) — só 1 fluxo". A base de cálculo já decidida (percentual configurável × preço do próprio marketplace) vale igual pra Shopee, falta criar lá uma config análoga à `ConfiguracaoTiktok.margem_afiliado_percentual` que já existe pro TikTok.

## O que falta

1. Implementar afiliado no ML (models + fórmula), conforme a decisão já registrada.
2. Implementar afiliado na Shopee (config nova + ajuste na fórmula `precificacao/funcoes_auxiliares/shopee/formula_precificacao_shopee.py`), mesma base de cálculo do ML/TikTok.
3. ~~Decidir se os 3 gaps reais entram no roadmap~~ — resolvido em 11/09/2026: nenhum dos 3 será implementado, decisão definitiva. Ver [[Preco Sugerido, Concorrente e STATUS-Validade-Estoque Genericos Nao Serao Implementados]].

## Relacionado

- [[Comissao de Afiliado na Precificacao - Base de Calculo, Local de Configuracao e Escopo do Prefixo de SKU]]
- [[Duvida - Base de Calculo e Local de Configuracao da Comissao de Afiliado na Precificacao]]
- [[Preco Sugerido, Concorrente e STATUS-Validade-Estoque Genericos Nao Serao Implementados]]
