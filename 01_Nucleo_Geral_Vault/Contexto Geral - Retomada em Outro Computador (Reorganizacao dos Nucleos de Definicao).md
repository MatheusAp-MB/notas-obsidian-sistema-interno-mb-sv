---
tipo: checkpoint
dominio: 
status: concluido
criado: 30/08/2026
atualizado_em: 30/08/2026 20:25
relacionado: [Definição do Núcleo de Comportamento Claude, Definição do Núcleo Geral do Vault, Definição do Núcleo de Engenharia Repositório, Registro dos Mundos Ativos, Regra do Índice Obrigatório, Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]
---

# Contexto Geral — Retomada em Outro Computador (Reorganização dos Núcleos de Definição)

> Nota auto-contida, gerada em 30/08/2026 porque o trabalho vai continuar em outro computador (escritório) e a conversa atual não migra junto. Serve como ponto de partida único pra esta frente — lê esta nota primeiro (depois de `README.md`, na raiz do vault, que é o ponto de partida de qualquer frente, não só desta). Se algo aqui parecer desatualizado, o vault é a fonte da verdade — os links levam ao original.

## Por que esta reorganização aconteceu

O vault tem 3 núcleos que definem COMO pensar e agir — `00_Nucleo_Comportamento_Claude/` (comportamento universal, sobrevive a qualquer projeto/tarefa), `01_Nucleo_Geral_Vault/` (como o vault funciona, sobrevive ao vault mesmo se todo o conteúdo mudasse), `02_Nucleo_Engenharia_Repositorio/` (convenção de código que atravessa mais de 1 mundo ao mesmo tempo). Todo o resto (`03_Sistema_Interno`, `04_Integracao_Sysemp`, `05_Integracao_Mercado_Livre`, `06_Producao_de_Imagens_e_Videos`) são mundos de negócio — **resultado** de aplicar essas definições em cima de um problema real, nunca definição em si.

O objetivo desta sessão inteira foi garantir que os 3 núcleos de definição fossem, cada um: (a) coerentes internamente — nenhuma nota tentando resolver mais de 1 responsabilidade ao mesmo tempo; (b) livres de ambiguidade entre si — nenhuma sobreposição de responsabilidade entre 2 notas; (c) livres de duplicação de conteúdo — nenhum fato reafirmado em 2 lugares diferentes. Ver [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]], seção 4, pro diagnóstico original que motivou olhar pra estrutura do vault como prioridade — esta nota cobre só a frente de reorganização de conteúdo/coerência dos núcleos; a frente visual/de plugin é assunto daquela outra nota (seção 7 dela, mesma janela de trabalho, sem sobreposição de conteúdo entre as 2 notas).

## Como foi feito (método usado em toda a sessão)

1. Auditoria sempre primeiro: ler todas as notas do escopo, mapear a responsabilidade de cada uma, cruzar pra achar sobreposição/ambiguidade/duplicação — nunca corrigir antes de mostrar o achado.
2. Achados apresentados em texto corrido, nunca em ferramenta de múltipla escolha — esperar confirmação explícita antes de qualquer mudança.
3. Data e hora perguntada antes de cada bloco de escrita/edição — nunca assumida.
4. Correção 1 achado por vez, nunca tudo de uma vez, mesmo com vários achados já mapeados.
5. Verificação final depois de qualquer mudança estrutural (checagem de link quebrado no vault inteiro, via script).

## O que mudou, em ordem

1. **`01_Nucleo_Geral_Vault/` auditado e corrigido**: 4 notas reescritas pro esqueleto padrão de escrita (Resumo/Contexto/O que diz/Por que é assim/Exemplo/Relacionado); "Registro dos Mundos Ativos" dividida (o critério de quando algo vira mundo novo saiu pra nota própria, [[Critério para Criação de um Mundo Novo]]); "Aviso Proativo Para Notas no Obsidian" perdeu uma seção de conteúdo duplicado.
2. **Auditoria de coerência de `00_`+`01_` junta**: só 2 achados reais em ~38 notas checadas — link cruzado faltando entre "Nomenclatura e Comentarios" (00_) e "Convenção de Nomenclatura de Arquivos e Pastas" (01_), corrigido com link (não fusão — são núcleos diferentes por natureza, ver teste de classificação abaixo); e uma restatement redundante entre "Schema de Frontmatter" e "Perguntar Data e Hora Antes de Escrever no Vault" sobre o campo `atualizado_em`, corrigida trocando a restatement por um link de volta pra fonte única.
3. **`02_Nucleo_Engenharia_Repositorio/` completado**: não tinha `00_Indice_Engenharia_Repositorio.md` nem nota de "Definição do Núcleo" — as 10 regras de engenharia (estrutura de arquivo Python, testes, GoF, robustez de API, etc.) já moravam lá desde 29/08, mas sem os 2 arquivos que todo núcleo/mundo precisa. Ambos criados, incluindo o teste de classificação formal (3ª pergunta da cadeia, ver seção própria abaixo).
4. **Auditoria de coerência de `02_`**: achou 4 problemas — nota do LEGADO ("Estrutura Modular de Scripts Python") nunca verificada contra o projeto atual, convivendo sem link com "Estrutura de Arquivo e Classe Python" (mesmo assunto, versões concorrentes); duplicação de conteúdo entre "Disciplina de Testes Automatizados" e "Modelo Padrao de Arquivo de Teste"; divergência entre o `relacionado` do frontmatter e a seção "Relacionado" do corpo em "Padrao de Qualidade e Clareza Estrutural do Repositorio".
5. **Nota do LEGADO resolvida por decisão do próprio usuário**: apagada por ser considerada inútil (nunca verificada, checagem julgada desnecessária) — 3 referências reais limpas em consequência (índice de `02_`, nota de Definição do núcleo, e 1 linha órfã que sobrava até em `03_Sistema_Interno/00_Indice_Sistema_Interno.md`, resquício de uma migração anterior).
6. **Duplicação de teste reduzida**: as 4 regras que "Modelo Padrao de Arquivo de Teste" reafirmava em prosa (já ditas em "Disciplina de Testes Automatizados") viraram links de volta pra fonte única, mantendo só a aplicação concreta de cada uma no arquivo-modelo. Frontmatter do Modelo também ganhou o campo `atualizado_em`, que faltava.
7. **Divergência de `relacionado` corrigida**: "Padrao de Qualidade e Clareza Estrutural do Repositorio" ganhou, no corpo, o link que já existia no frontmatter (`Reducao de Comandos de Management e Rotina Vira Botao`).
8. **`README.md` criado e os 7 `00_Indice.md` renomeados por mundo** — detalhe completo em [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]], seção 7 (fora do escopo de conteúdo/coerência, é a frente visual/organizacional da mesma janela de trabalho).

## Teste de classificação dos 3 núcleos (formalizado nesta sessão)

Toda regra nova passa por até 3 perguntas, nesta ordem — cada núcleo é o primeiro filtro que a regra passa:

1. **"Isso sobrevive se o vault não existisse?"** (teste de [[Definição do Núcleo Geral do Vault|01_Nucleo_Geral_Vault]]) — se não sobrevive (fala de frontmatter, pasta, wikilink), fica lá.
2. **"Isso sobrevive se o projeto/tarefa específica mudasse completamente amanhã?"** (teste de [[Definição do Núcleo de Comportamento Claude|00_Nucleo_Comportamento_Claude]]) — se sobrevive mesmo fora de qualquer código, fica lá.
3. **"Essa convenção de código serve só a 1 mundo, ou a mais de 1 mundo de código ao mesmo tempo?"** (teste de [[Definição do Núcleo de Engenharia Repositório|02_Nucleo_Engenharia_Repositorio]]) — se serve a mais de 1 mundo, fica lá; se serve só a 1, fica dentro daquele mundo específico.

## Estado atual (30/08/2026, 20:25)

Todos os achados das 2 auditorias de coerência (00_/01_ e 02_) estão resolvidos — nenhum item pendente na seção "Estado desta reorganização" de [[Definição do Núcleo de Engenharia Repositório]]. Os 3 núcleos de definição estão, hoje: com índice e definição próprios, sem responsabilidade sobreposta ou duplicada entre notas, e com um ponto de entrada único (`README.md`, raiz do vault) que aponta pra eles na ordem certa pra qualquer sessão nova.

## Notas que deve ler a seguir (nesta ordem)

1. `README.md` (raiz do vault) — se ainda não leu, é o ponto de partida de qualquer sessão neste vault, não só desta frente.
2. [[Definição do Núcleo de Comportamento Claude]], [[Definição do Núcleo Geral do Vault]], [[Definição do Núcleo de Engenharia Repositório]] — o que cada núcleo cobre e o teste de classificação completo (repetido nas 3, formalizado igual).
3. [[Registro dos Mundos Ativos]] — lista viva de todos os mundos/núcleos ativos do vault hoje.
4. [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]], seção 7 — a frente paralela (visual/organizacional) desta mesma janela de trabalho, sem sobreposição de conteúdo com esta nota.

## Relacionado

- [[Definição do Núcleo de Comportamento Claude]]
- [[Definição do Núcleo Geral do Vault]]
- [[Definição do Núcleo de Engenharia Repositório]]
- [[Registro dos Mundos Ativos]]
- [[Regra do Índice Obrigatório]]
- [[Estudo de Melhorias Visuais e Organizacionais do Vault (Potencial do Obsidian)]]
