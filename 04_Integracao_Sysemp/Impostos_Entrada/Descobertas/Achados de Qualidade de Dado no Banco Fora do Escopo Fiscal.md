---
tipo: descoberta
dominio: dados
status: aberta
criado: 09/08/2026
atualizado_em: 09/08/2026 16:40
relacionado: [Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria, Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Plano em Etapas do Duble de Precificacao ML]
---

# Achados de Qualidade de Dado no Banco (Fora do Escopo Fiscal)

## Contexto

Testando o dublê com 3 produtos reais contra a planilha do superior (ver [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]), apareceram 2 problemas de dado no banco — nenhum dos 2 é sobre imposto ou fórmula, são campos do cadastro do `Produto` desatualizados/vazios. Registrado aqui separado do domínio fiscal pra não confundir com achado de imposto.

## 1. `produto.frete_cif_fob` zerado nos 3 produtos testados

Nos 3 produtos (SB-630, Guarany S4, K-430), o campo `frete_cif_fob` no banco está em 0,00% — mas a planilha do superior tem valores reais pra esse mesmo campo (1%, 4% e 1%, respectivamente). É exatamente essa diferença que sobra no Custo Final do dublê depois da correção do bug de ICMS ST (ver tabela em [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]).

Mesmo padrão do problema já visto antes com ICMS/PIS/COFINS entrada (campo existe no banco, mas nunca foi preenchido/importado pra esse produto) — mas por decisão já tomada em [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]], Frete CIF/FOB continua vindo da planilha, não é parte do escopo desta troca. Ainda assim, vale reportar pra quem cuida da importação da planilha — se o campo está zerado pra pelo menos 3 produtos testados, pode estar zerado pra muitos outros, distorcendo o Custo Final de qualquer um deles.

## 2. Dimensões físicas zeradas no produto EAN 7908050734971 (SOPRADOR BRUDDEN SB-630)

`altura`, `largura`, `comprimento` e `peso` estão todos em `0.0` no cadastro desse produto no banco. Isso quebra 3 cálculos que dependem de dimensão/peso, independente de qualquer imposto:

- **Coleta** (Etapa 6): metro cúbico = 0 → coleta = R$ 0,00 (deveria ser maior que zero pra um soprador costal real).
- **Armazenagem** (Etapa 7): cai na faixa mais barata do sistema (Faixa 1, "até 12×15×25cm") só por causa da dimensão zerada — quase certamente errado pra um produto desse porte.
- **Frete** (Etapa 9): a busca de faixa de frete usa peso = 0kg, escolhendo a faixa mais barata possível (R$ 20,95) — deveria usar o peso real do produto.

Enquanto esse cadastro não for corrigido, o preço final calculado pra esse produto específico não é confiável — o problema não é de fórmula nem de imposto, é o cadastro físico do produto vazio no banco. Recomendação: verificar/corrigir o cadastro desse EAN antes de usar esse produto como referência de preço.

## Relacionado

- [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]
- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
- [[Plano em Etapas do Duble de Precificacao ML]]
