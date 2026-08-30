---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 16:18
relacionado: [Definição do Núcleo Geral do Vault, Definição do Núcleo de Comportamento Claude, Estrutura de Pastas de um Mundo, Critério para Criação de um Mundo Novo]
resumo: Lista viva dos mundos e núcleos ativos deste vault, com o que cada um reúne — inclui histórico de mundo removido (LEGADO) e da renumeração de pastas de 29/08/2026.
---

# Registro dos Mundos Ativos

**Resumo**: lista viva dos mundos e núcleos ativos deste vault, com o que cada um reúne — inclui histórico de mundo removido (LEGADO) e da renumeração de pastas de 29/08/2026.

## Contexto

Com o vault crescendo (hoje 3 núcleos e 4 mundos ativos, além de 1 mundo já removido), surgiu a necessidade de um lugar único que responda rápido: "quais mundos/núcleos existem hoje, e o que cada um cobre?". Sem essa lista central, a resposta ficaria espalhada — só descobrível lendo `00_Indice.md` de cada mundo um por um. (O critério de quando algo novo merece virar mundo próprio mora em nota separada: [[Critério para Criação de um Mundo Novo]].)

## O que diz

**Mundos e núcleos ativos hoje**:

| Mundo/Núcleo | O que reúne |
|---|---|
| `00_Nucleo_Comportamento_Claude/` | Regra de comportamento genuinamente universal — vale pra qualquer tarefa, qualquer projeto, não só código. |
| `01_Nucleo_Geral_Vault/` | Regra e convenção que só existe por causa deste vault especificamente. |
| `02_Nucleo_Engenharia_Repositorio/` | Convenção de engenharia de código que serve mais de 1 mundo ao mesmo tempo (estrutura de arquivo/classe, modelagem de objeto, testes, colaboração em git). |
| `03_Sistema_Interno/` | Sistema interno da empresa — precificação, portal do Drive, agenda de vídeos, e outras frentes. Inclui 2 contextos de API que são parte do próprio sistema, não integrações isoladas: `API_Google_Drive/` e `API_Agente_Local/` (a API que o próprio Sistema Interno expõe pro agente executável local). |
| `04_Integracao_Sysemp/` | Integração com a API do ERP Sysemp (dado fiscal) — código mora no mesmo repositório do Sistema Interno, na pasta `scripts_exploracao_ERP/`. |
| `05_Integracao_Mercado_Livre/` | Integração com a API do Mercado Livre. |
| `06_Producao_de_Imagens_e_Videos/` | Produção de fotos/vídeos de produto via IA — criado em 22/08/2026, sem relação de código com `03_Sistema_Interno/` (que só cuida do que acontece depois que o material já existe, ver `Agenda_Videos/`); ainda sem código associado, só diagnóstico do problema. |

**Nunca duplicar convenção estrutural fora do lugar certo**: quando uma convenção nova do vault precisa ser definida (uma pasta nova, um campo de frontmatter novo, uma regra de nome nova), ela é adicionada na nota já responsável por aquele assunto dentre as notas deste núcleo — ex: um campo de frontmatter novo vai em [[Schema de Frontmatter]], uma subpasta de mundo nova vai em [[Estrutura de Pastas de um Mundo]] — nunca criada solta numa nota nova ou fora do lugar. Esta própria lista de mundos ativos segue a mesma lógica: um mundo novo vira 1 linha a mais na tabela acima, nunca um registro solto em outro canto do vault.

**Removido**: `LEGADO/` existiu até 29/08/2026 — continha um projeto antigo (`03_ML_Analytics_HUB/`) sem relação direta com `05_Integracao_Mercado_Livre/` além de ter servido de fonte de lições aprendidas sobre a API do ML. As 43 notas com conteúdo real de lá foram migradas pros mundos corretos (marcadas `tags: [Vindo_do_Legado]`) antes da pasta ser apagada de vez — detalhe completo da migração em [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]], seção "Conteúdo vindo do LEGADO".

**Renumeração de 29/08/2026, 22:02**: `02_Sistema_Interno`→`03_Sistema_Interno`, `03_Integracao_Sysemp`→`04_Integracao_Sysemp`, `04_Integracao_Mercado_Livre`→`05_Integracao_Mercado_Livre`, `05_Producao_de_Imagens_e_Videos`→`06_Producao_de_Imagens_e_Videos`, pra abrir espaço pro núcleo novo (`02_Nucleo_Engenharia_Repositorio`) sem quebrar a ordem "núcleo primeiro, mundo depois". Wikilinks `[[Nota]]` não foram afetados (Obsidian resolve por nome, não por caminho) — só `.obsidian/bookmarks.json`, `graph.json` e `colorful-folders/data.json` precisaram de correção manual.

## Por que é assim e não de outro jeito

Manter texto solto por mundo (só dentro de cada `00_Indice.md`) faria a pergunta "quais mundos existem hoje, e o que cada um cobre?" exigir abrir um índice por vez — uma tabela central, numa nota só, responde isso numa leitura direta. Separar o critério de criação de mundo (regra, [[Critério para Criação de um Mundo Novo]]) da lista em si (registro, aqui) evita que esta nota precise ser lida inteira só pra confirmar 1 dado factual ("existe mundo pra X?") — quem só quer a lista não precisa passar pela justificativa do critério, e quem só quer entender o critério não precisa ler a tabela inteira.

## Exemplo

`02_Nucleo_Engenharia_Repositorio/` é o núcleo mais recente desta lista (29/08/2026) — apareceu como linha nova na tabela acima assim que foi criado (ver o critério que levou a essa criação em [[Critério para Criação de um Mundo Novo]]), sem gerar nenhuma nota de registro separada só pra ele.

## Relacionado

- [[Definição do Núcleo Geral do Vault]]
- [[Definição do Núcleo de Comportamento Claude]]
- [[Estrutura de Pastas de um Mundo]]
- [[Critério para Criação de um Mundo Novo]]
