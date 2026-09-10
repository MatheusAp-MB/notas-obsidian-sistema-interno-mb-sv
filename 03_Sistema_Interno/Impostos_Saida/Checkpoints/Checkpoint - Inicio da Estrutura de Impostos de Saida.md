---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 10/09/2026
atualizado_em: 10/09/2026 11:34
relacionado: [Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Estrutura da Planilha Busca Legal de Impostos de Saida, Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda, Dois Sistemas Paralelos - Projeto Interno V2 e We Stack, Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]
---

# Checkpoint - Início da Estrutura de Impostos de Saída

**Resumo**: contexto `Impostos_Saida` aberto dentro de `03_Sistema_Interno/` — fonte de dado confirmada (planilha Busca Legal) e código já analisado: 4 campos fiscais de saída já existem no `Produto` mas estão vazios, CST de saída e a tabela por UF não existem (ver [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]). Escopo atual real do Projeto Interno V2 nesta frente é só precificação (custo→preço) — o cálculo de margem por UF real, hoje feito pelo We Stack (sistema de terceiros, ver [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]), é aplicação futura. Trabalho segue em 6 camadas, cada uma validada antes da próxima (ver "Em aberto").

> [!warning] EM ANDAMENTO — estrutura recém-aberta, sem código ainda
> Este checkpoint registra o início da frente de impostos de saída. Conforme decisão, descoberta, regra ou dúvida real for aparecendo, cada uma vira nota própria na subpasta de tipo correspondente dentro de `Impostos_Saida/` — criada só quando existir a 1ª nota daquele tipo, nunca antes (ver [[Estrutura de Pastas de um Mundo]]).

## Linha do tempo

**Sessão de 10/09/2026, 08:06** — Contexto `Impostos_Saida` criado dentro de `03_Sistema_Interno/`, ao lado de `Impostos_Entrada/` (que vive em `04_Integracao_Sysemp/`, não aqui — diferença de local intencional: impostos de saída hoje não vêm da API do Sysemp, são calculados fora do sistema). Nenhum código, decisão ou descoberta ainda — só o registro de abertura da frente.

**Sessão de 10/09/2026, 08:20** — Fonte de dado confirmada: planilha auxiliar do Busca Legal, já validada por quem precisava validar e liberada pro uso. Estrutura dos campos (Entrada = identificação por EAN; Saída = PIS/COFINS/CST fixos por produto + ICMS variando por UF de destino) verificada e registrada em [[Estrutura da Planilha Busca Legal de Impostos de Saida]].

**Sessão de 10/09/2026, 09:24** — Analisada a planilha "Cálculo final We Stack Doc 1.xlsx" (3 versões, comparadas fórmula a fórmula) — planilha de referência que junta entrada + saída + Mercado Livre pra mostrar o cálculo completo de margem. A fórmula do ICMS líquido de venda usava a média das 26 UFs de destino em vez da UF real de cada venda — isso levou à 1ª decisão real de arquitetura desta frente: a planilha é só referência, o sistema tem que usar a UF real de destino. Decisão completa em [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]].

**Sessão de 10/09/2026, 09:47** — Correção de escopo importante: existem 2 sistemas paralelos, o Projeto Interno V2 (este vault) e o We Stack (sistema de terceiros, pago) — ver [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]. A planilha "Cálculo final We Stack" é referência do cálculo que roda no We Stack, não uma especificação do Projeto Interno V2. Hoje o foco real do Projeto Interno V2 nesta frente é 100% precificação (custo entra, preço de venda sai) — o cálculo de margem/UF real de destino (decisão da sessão anterior) só se aplica quando essa funcionalidade for absorvida aqui no futuro. A decisão e o resumo deste checkpoint foram ajustados pra deixar isso explícito.

**Sessão de 10/09/2026, 10:03** — Repositório `Projeto_Sistema_Interno_V2` sincronizado (branch `dev`) e analisado ponta a ponta. Confirmado: 4 campos fiscais de saída já existem no `Produto` (`icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`) — todos vazios, mas já lidos de verdade pelas 6 fórmulas de precificação e pelo cálculo de margem do Hub de Promoções. CST de saída e a tabela de ICMS por UF de destino não existem em lugar nenhum. Achado completo em [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]. A partir daqui, o trabalho segue em 6 camadas — plano definido pelo usuário, cada camada só começa depois da anterior validada (ver "Em aberto").

**Sessão de 10/09/2026, 10:52** — Comando `preencher_impostos_saida` (Camada 1) executado nas 2 empresas, direto pelo usuário, a partir do código entregue em texto na conversa:
- **MAGAZINE**: 651 produtos atualizados. Zero linha sem EAN, zero EAN duplicado, zero EAN sem produto correspondente — rodou limpo.
- **SAMVALE**: 389 produtos atualizados. 9 EANs da planilha Busca Legal sem produto correspondente no banco da SAMVALE (comportamento esperado do comando, que só atualiza produto existente e nunca cria): `96506134660`, `96506134677`, `96506146342`, `96506146335`, `74468063860`, `74468064034`, `40141875297`, `74468064362`, `74468063822`.

Antes de rodar, foi conferido o header real das 2 planilhas (copiado direto do Excel): as 5 colunas que o comando lê (`Cód Barras`, `PIS`, `COFINS`, `CST`, `ICMS`, `ICMS MÉDIA`) batem certinho nos 2 arquivos. A SAMVALE tem estrutura diferente da MAGAZINE — 1 coluna a mais no início (`Código interno SYSEMP`) e 3 colunas a mais no fim, de um bloco "REFORMA TRIBUTÁRIA 2026" (`IBS UF %`, `IBS Mun %`, `CBS %`) que a MAGAZINE não tem. Isso não afeta o comando, que casa colunas pelo nome, não pela posição — e o escopo atual da frente continua sendo só os impostos "comuns", não a Reforma Tributária.

A Camada 1 está **implementada**, mas não fechada — falta validar com calma, ponto a ponto, se o dado preenchido nos 4 campos está correto, e ainda falta esclarecer os 9 EANs da SAMVALE sem correspondência.

**Sessão de 10/09/2026, 11:34** — A tentativa de validar a Camada 2 ("o preço mudou, então tá certo?") mostrou que não bastava — abriu uma frente própria, mais ampla, pra auditar o sistema de precificação inteiro (os 6 marketplaces), puxada pelo que apareceu no caminho: 8 erros de assert em Raia/Magalu e a descoberta de que o "Duble de Precificação" já existente estava quebrado. Essa frente passa a viver em [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]] (contexto `Precificacao`) — a Camada 2 de Impostos de Saída continua em aberto aqui, mas agora é uma consequência natural dessa validação mais ampla, não um item isolado.

## Em aberto

- [x] Escopo do que muda no sistema — resolvido: a fonte é a planilha Busca Legal (ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]), não a API do Sysemp.
- [x] Primeira decisão real de arquitetura desta frente — resolvida: planilha We Stack é referência de cálculo, o sistema usa a UF de destino real de cada venda, não a média (ver [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]).
- [x] Levantamento de quais campos já existem (vazios) e quais faltam criar — resolvido, ver [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]].

**Plano de execução, em 6 camadas — cada uma só começa depois da anterior validada com calma:**

1. [~] Preencher os 4 campos que já existem (`icms_saida_sp`, `icms_saida_media`, `pis_percentual`, `cofins_percentual`) com o dado da planilha Busca Legal — **implementado, não finalizado**: comando já rodou nas 2 empresas (651 MAGAZINE + 389 SAMVALE atualizados), falta validar com calma ponto a ponto e esclarecer os 9 EANs da SAMVALE sem produto correspondente.
2. [ ] Analisar com calma e garantir que o que já existe (os 4 campos, já preenchidos) está válido.
3. [ ] Adicionar os campos "básicos" que faltam — CST de saída é o único identificado até agora.
4. [ ] Validar com calma essa adição antes de seguir.
5. [ ] Adicionar a tabela de ICMS por UF de destino (27 colunas) de forma eficiente e estruturada — hipótese a confirmar com calma: agrupada por NCM, não por EAN/produto.
6. [ ] Testar essa adição da tabela por UF e validar.

## Relacionado

- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]
- [[Dois Sistemas Paralelos - Projeto Interno V2 e We Stack]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
