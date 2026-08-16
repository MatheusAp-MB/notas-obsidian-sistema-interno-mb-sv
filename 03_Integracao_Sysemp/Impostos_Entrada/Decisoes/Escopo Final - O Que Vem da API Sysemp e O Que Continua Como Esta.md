---
tipo: decisao
dominio: 
status: ativa
criado: 09/08/2026
atualizado_em: 16/08/2026 05:06
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Plano em Etapas do Duble de Precificacao ML, Achados de Imposto Sempre Aguardam Validacao do Tributario, Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo, Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]
---

# Escopo Final — O Que Vem da API Sysemp e O Que Continua Como Está

## Contexto

Levantamento completo de todos os campos que a precificação real (`FormulaPrecificacao`, ML) usa, comparando com o que a API Sysemp (XML da nota de entrada) cobre — pra responder 3 perguntas do usuário: fechamos todos os impostos de entrada? Temos tudo que o sistema precisa pra precificar? Falta algo?

## Decisão

**O que for dado do XML sobre custo e impostos de entrada passa a ser usado e adicionado ao sistema** — ICMS entrada, ICMS ST, IPI, PIS, COFINS, todos já cobertos e validados (ver [[Plano em Etapas do Duble de Precificacao ML]]).

**O que não tivermos continua como já está hoje**, até o usuário decidir como melhorar:
- ICMS de saída, PIS/COFINS de saída — não existem nessa API, porque são de operação de venda, não de compra. Uma API separada pra dados de saída está em desenvolvimento em paralelo, sem previsão de prazo. Enquanto isso, o caminho manual sendo desenvolvido com o superior/financeiro é a planilha **"Busca Legal"** — não é API, é o paliativo atual pra essa parte. **Prazo real (16/08, 05:06):** depende de enviar a planilha nova de impostos de entrada (ver [[Tela e Planilha de Resumo de Impostos de Entrada]]) pro superior primeiro — estimativa de mais 1 semana até haver retorno sobre os impostos de saída.
- Frete CIF/FOB — continua vindo da planilha. Diferente dos outros itens desta lista, aqui falta **investigação**, não só espera de API: ainda não sabemos de onde vem esse dado na prática nem qual a lógica de negócio por trás de CIF vs. FOB — precisa entender isso antes de cogitar tirar da planilha. **Prazo real (16/08, 05:06):** depende do retorno de férias de outro funcionário — sem previsão antes da semana que vem.
- **Cadastro de Produtos e dimensões físicas (altura/largura/comprimento/peso, códigos, fotos, nome, ativo/inativo)** — vem inteiramente de planilha hoje; não existe API pra isso ainda. A Sysemp já confirmou que **pode ser desenvolvida** (é a tela "Cadastro de Produtos" do próprio Sysemp) — mas isso significa "possível de pedir", não "disponível agora". Sem prazo definido. Paliativo atual: baixar de novo a planilha de produtos ativos no Sysemp e reimportar. Ver [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]] — toda API nova (essa incluída) tem custo e tempo de desenvolvimento real, não é "só pedir e sair usando".

**Fora de escopo / resolvido por outro motivo, não faz parte dessa troca:**
- Armazenagem — não vem mais da planilha; o sistema já calcula por faixa dinâmica, correção própria e independente deste projeto. Removido do mapeamento de pendências.
- Custo com bonificação (`custo_com_boni`) — abandonado por decisão do usuário. Não faz sentido precificar produto com custo 0 (bonificação é entrega grátis do fornecedor, sem nota de compra correspondente).
- MVA — confirmado por grep que nenhuma fórmula de marketplace lê esse campo. Não é necessário.
- ICMS RET — disponível no XML, mas nenhuma fórmula usa hoje. Sem ação necessária por enquanto.

## Por que esse mapeamento não existia antes

A precificação real (`Produto`, `FormulaPrecificacao`, planilha manual) foi construída antes do vault existir — por isso nunca houve registro formal de qual campo vem de onde. Esse levantamento é a primeira vez que isso fica documentado.

## Tabela de cobertura (estado em 09/08/2026)

| Campo usado pela fórmula real | Fonte agora |
|---|---|
| Custo (entrada) | XML — `Custos.unitario` |
| ICMS entrada | XML — `Icms` |
| ICMS ST | XML — `IcmsSt` |
| IPI | XML — `Ipi` |
| PIS/COFINS (entrada) | XML — `Pis`/`Cofins` |
| ICMS de saída | Planilha — em paralelo, planilha "Busca Legal" (com superior/financeiro) enquanto API de saída não existe. Prazo: ~1 semana, depende do superior validar a planilha nova de entrada primeiro. |
| PIS/COFINS de saída | Planilha — mesma limitação, mesmo caminho "Busca Legal". Mesmo prazo acima. |
| Frete CIF/FOB | Planilha — falta investigação (de onde vem o dado, qual a lógica CIF vs. FOB), não só espera de API. Prazo: depende do retorno de férias de outro funcionário, não antes da semana que vem. |
| Cadastro de Produto (ativo/inativo, códigos, fotos, nome) e dimensões físicas | Planilha — API confirmada como possível pela Sysemp, ainda não desenvolvida, sem prazo (ver [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]]) |
| Armazenagem | Sistema — faixa dinâmica (não é mais planilha, correção própria) |
| Custo com bonificação | Abandonado |
| MVA | Não usado por nenhuma fórmula |
| ICMS RET | Disponível no XML, não usado por nenhuma fórmula hoje |

## Relacionado

- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]
- [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]]
- [[Achados de Qualidade de Dado no Banco Fora do Escopo Fiscal]]
