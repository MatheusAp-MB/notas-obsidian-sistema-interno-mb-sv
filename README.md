# Vault de Conhecimento — Sistema Interno MB/SV

Este é o vault de conhecimento operacional do sistema interno da Magazine Brasileiro / Samvale. Guarda regras, decisões, descobertas e histórico de projeto — tanto pra uso humano quanto pra qualquer LLM (Claude ou outra) que for trabalhar aqui.

## Se você é uma LLM (ou humano) chegando aqui pela primeira vez

Você ainda não sabe nada sobre este vault. Este arquivo existe pra te dizer exatamente o que ler, e em que ordem, antes de fazer qualquer coisa — não pule direto pra tarefa.

### Passo 1 — Como agir (sempre obrigatório)

Leia `00_Nucleo_Comportamento_Claude/` por completo, começando pela nota "Definição do Núcleo de Comportamento Claude". São as regras de comportamento universais — valem pra qualquer tarefa, em qualquer mundo, independente do que for pedido.

### Passo 2 — Como o vault funciona (sempre obrigatório)

Leia `01_Nucleo_Geral_Vault/`, no mínimo estas notas antes de escrever qualquer coisa:

- Definição do Núcleo Geral do Vault
- Schema de Frontmatter
- Os 9 Tipos de Nota
- Convenção de Nomenclatura de Arquivos e Pastas
- Regra do Índice Obrigatório
- Perguntar Data e Hora Antes de Escrever no Vault

### Passo 3 — Convenções de engenharia (só se a tarefa envolver código)

Leia `02_Nucleo_Engenharia_Repositorio/`, começando pela nota "Definição do Núcleo de Engenharia Repositório". Só é obrigatório se a tarefa envolver mexer em código do repositório.

### Passo 4 — Descubra qual mundo de negócio é relevante

Leia "Registro dos Mundos Ativos" (dentro de `01_Nucleo_Geral_Vault/`) pra ver a lista de mundos ativos. Identifique qual serve a tarefa atual, entre nele, e leia o índice daquele mundo (arquivo `00_Indice_<Nome do Mundo>.md`, na raiz da pasta) antes de mexer em qualquer nota de lá.

## Regra de ouro

Nunca escreva ou edite nada neste vault antes de completar os Passos 1 e 2. Eles são universais e sempre necessários, independente da tarefa. Os Passos 3 e 4 dependem do que for pedido.

## Estrutura do vault

- `00_Nucleo_Comportamento_Claude/` — como agir (definição)
- `01_Nucleo_Geral_Vault/` — como o vault funciona (definição)
- `02_Nucleo_Engenharia_Repositorio/` — convenções de código que atravessam mais de 1 mundo (definição)
- `03_Sistema_Interno/`, `04_Integracao_Sysemp/`, `05_Integracao_Mercado_Livre/`, `06_Producao_de_Imagens_e_Videos/` — mundos de negócio (resultado de aplicar as definições acima em cima de um problema real)
- `Bases/` — pasta funcional com visões tipo planilha (`.base`) que cruzam notas de qualquer mundo por frontmatter, nunca substitui o índice de um mundo

---

Manutenção: se um novo núcleo de definição for criado, ou a ordem de leitura mudar, este arquivo precisa ser atualizado também.

*Última atualização: 30/08/2026, 20:01.*
