---
tipo: descoberta
dominio: banco_de_dados
status: ativa
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo, Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo]
resumo: Frete ML: a Magazine bate com o arquivo (480 linhas); a Samvale tinha 224 a mais (704). Removidas em 16/10/2026 pelo espelho; origem não investigada; grade ML da Samvale ainda não recalculada.
---

# Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Não Tem

**Resumo**: no primeiro teste real do botão "Atualizar o sistema com o Drive" (15/10/2026), o frete do Mercado Livre da **Magazine** bateu exatamente com o arquivo (480 linhas iguais), mas o da **Samvale** tinha **224 linhas a mais** no sistema do que o arquivo traz. Em 16/10/2026, depois da decisão de espelhar o arquivo, essas 224 linhas foram removidas. A origem delas **não foi investigada**.

## O que foi observado

| Quando | Empresa | Resultado do frete ML |
|---|---|---|
| 15/10/2026 | Magazine | Já estava em dia: 480 linhas iguais. |
| 15/10/2026 | Samvale | **224 linhas** no sistema que não estão no arquivo (o 1º ciclo do botão não apagava, só mostrava). |
| 16/10/2026 | Magazine (botão só da empresa selecionada) | "Já estava em dia": 480 iguais, 0 removidas. |
| 16/10/2026 | Samvale | "Atualizado": 0 novas, 0 mudaram, 480 iguais, **224 removidas**. |

As outras 3 tabelas (Magalu 27, TikTok 5, Amazon 126 linhas) estavam iguais ao arquivo nas duas empresas.

## Como foi observado

O botão compara, para cada empresa, o que está no banco com o que o arquivo do Drive traz (uma fotografia antes e outra depois). O teste foi feito por Matheus no sistema real, nas duas empresas, nos dias 15 e 16/10/2026.

## O que isso significa

- O arquivo de frete do ML tem **480 linhas** e a Magazine tem exatamente essas. A Samvale tinha as 480 **mais 224**, ou seja, 704 linhas.
- Um sistema que **só cria e atualiza** deixa as sobras para sempre. Foi isso que levou Matheus a decidir que o frete deve **espelhar** o arquivo ([[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]).
- A **grade de precificação ML da Samvale** foi calculada com a tabela de frete **antes** da remoção. Depois de remover as 224 linhas, a grade **ainda não foi recalculada**: a janela do botão avisa isso. Até o recálculo (ciclos 3 e 4, ainda não feitos), a grade ML da Samvale pode mostrar preços calculados com linhas que já não existem na tabela.

## O que ainda não sabemos

- **De onde vieram as 224 linhas.** Não foi investigado. Já foram removidas do banco da Samvale em 16/10/2026.
- Quais produtos da Samvale tiveram preço calculado com essas linhas.

## Relacionado

- [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo]] (como o frete ML é modelado no sistema)
