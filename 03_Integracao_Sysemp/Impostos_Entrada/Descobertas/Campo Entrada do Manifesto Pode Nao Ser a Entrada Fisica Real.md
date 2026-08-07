---
tipo: descoberta
dominio: 
status: ativa
criado: 07/08/2026
atualizado_em: 07/08/2026 14:08
relacionado: [Custo Atual Escolhido para Precificacao dos Produtos Sysemp, Lista de CFOP Relevantes para Precificacao, Paginacao do Endpoint Manifesto Nota Entrada, Checkpoint — Exploracao de Dados Fiscais Sysemp]
---

# Campo "Entrada" do Manifesto Pode Não Ser a Entrada Física Real

Achado construindo o pipeline de custo atual (agrupar por produto → agrupar por data → pegar a mais recente). Um "empate" (2 notas do mesmo produto supostamente na mesma data) levou à investigação que revelou isto.

## O que aconteceu

Produto 7908050719121 (PULVERIZADOR COSTAL... BRUDDEN), 2 notas do mesmo fornecedor (BRUDDEN EQUIPAMENTOS LTDA): NF 101445 e NF 101561. Comparando o registro CRU da API com a tela real do ERP (grid nativo do Sysemp) pra essas mesmas 2 notas:

| Campo | NF 101445 — API | NF 101445 — tela do ERP |
|---|---|---|
| Emissão | 2026-07-31 | 31/07/2026 |
| Entrada | **2026-07-31** | **05/08/2026** |

`Emissão` bate exatamente entre API e tela. `Entrada` diverge — a API diz 31/07, a tela do ERP (fonte que o usuário confia, usada no dia a dia) diz 05/08, pra exatamente a mesma nota (mesmo NR NF, mesma Chave, mesmo fornecedor).

## Hipótese

O endpoint usado é `listarManifestoNotaEntrada` — "manifesto" é o processo de confirmação do destinatário via SEFAZ de que a nota existe e é destinada à empresa, evento que tende a acontecer perto da própria Emissão. A hipótese é que o campo `Entrada` desse endpoint reflete a data desse manifesto (confirmação fiscal), não a entrada física real da mercadoria no estoque — que é o que a tela do ERP mostra na coluna "Entrada" de verdade, provavelmente registrada manualmente/separadamente quando a mercadoria é de fato recebida no depósito.

Não confirmado formalmente (não é documentação oficial, é dedução a partir de 1 caso real) — mas o padrão (Emissão bate, Entrada não bate) é consistente com essa hipótese.

## Impacto

Todo o pipeline de "custo atual" usa `Entrada` como critério de "qual é a nota mais recente". Se a hipótese estiver certa, esse critério pode estar escolhendo a nota errada como "mais recente" em qualquer produto — não é um problema isolado desse 1 produto, é um risco sistêmico da abordagem atual.

## Status — decisão do usuário (07/08/2026, 14:08)

Não existe, por enquanto, nenhum outro endpoint da Sysemp que devolva a entrada física real (a mesma que a tela usa). Decisão explícita: **seguir trabalhando com o campo `Entrada` da API como está, aceitando essa limitação conhecida**, pra não travar o avanço — "ainda consigo adiantar muita coisa". Não é uma correção adiada por esquecimento, é uma decisão consciente de continuar com o dado disponível.

## Em aberto

- Confirmar com o suporte da Sysemp se existe outro endpoint/campo que reflita a entrada física real de mercadoria.
- Se/quando isso for resolvido, revisar todo o pipeline de custo atual — pode mudar qual nota é selecionada como "mais recente" em produtos que hoje parecem corretos só por não terem tido esse tipo de divergência visível.

## Relacionado

- [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]
- [[Lista de CFOP Relevantes para Precificacao]]
- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
