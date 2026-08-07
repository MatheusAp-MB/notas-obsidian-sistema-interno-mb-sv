---
tipo: duvida
dominio: 
status: ativa
criado: 07/08/2026
atualizado_em: 07/08/2026 01:32
relacionado: [Lista de CFOP Relevantes para Precificacao]
---

# Custo Médio Ponderado ou Custo Atual para Precificação

## A dúvida

Depois de filtrar as notas de compra real (CFOP 1.102/2.102, ver [[Lista de CFOP Relevantes para Precificacao]]), falta decidir qual custo usar pra precificar cada produto:

- **Custo médio ponderado** — pondera pela quantidade de cada nota, não média simples. Método padrão e aceito pela Receita Federal pra valoração de estoque no Brasil (junto com PEPS; UEPS não é permitido). Suaviza picos de uma compra isolada.
- **Custo atual** — usa só a nota mais recente. Mais simples, reflete preço de mercado mais atual, mas mais sensível a distorção: uma compra pequena (ex: 8 unidades, sem desconto de volume) pode sair com custo unitário mais alto e distorcer a precificação se usada sozinha.

## Sub-questão: faz sentido tirar média de alíquota também?

Depende do campo:

- Valores em R$ (Valor ICMS, Valor IPI, etc.) escalam com quantidade/custo — já entram naturalmente dentro do custo médio ponderado, não precisam de tratamento à parte.
- Alíquotas em % (Aliquota ICMS, Aliquota IPI, etc.) são regra fiscal fixa, não preço de mercado. Se forem sempre iguais entre notas do mesmo produto, tirar média é neutro. Se variarem de verdade, é sinal de mudança real (troca de fornecedor, mudança de estado, benefício fiscal que caiu) — nesse caso faz mais sentido usar a alíquota atual/vigente, não uma média histórica, pra não ficar fiscalmente incorreto pra frente. Ainda não verificado empiricamente se essas alíquotas variam ou não pro mesmo produto ao longo do tempo.

## Status

Aguardando decisão do superior do usuário (conversa prevista pra 07/08/2026). Nenhuma das duas opções foi escolhida ainda.

## Relacionado

- [[Lista de CFOP Relevantes para Precificacao]]
