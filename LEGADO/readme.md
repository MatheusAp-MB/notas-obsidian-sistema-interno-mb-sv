# notas-obsidian-sistema-interno-mb-sv

Este repositório é a base de conhecimento (Obsidian vault) do Dev sobre o
Sistema Interno MB/SV (Django) e o ML Analytics HUB (extração de dados via API
do Mercado Livre). É a **fonte de verdade completa** que guia o Claude — não só
decisões técnicas e descobertas de API, mas também regras de negócio, regras
de código, forma de programar e forma de se comunicar com o Dev. Mais
confiável que a memória do Claude, porque é determinístico, versionado e não
sofre compactação.

## Como o Claude deve ler este repo

- **Leitura sob demanda, nunca automática.** Só consultar este repositório
  quando o Dev pedir explicitamente na mensagem.
- **Preferir `raw.githubusercontent.com` a `api.github.com`** para ler o
  conteúdo de arquivos — evita consumir rate limit de API. Usar a API do
  GitHub apenas quando for necessário listar a árvore de arquivos
  (`git/trees?recursive=1`), e mesmo assim uma única vez por sessão, não
  repetidamente.
- **Nunca escrever neste repositório automaticamente.** Qualquer sugestão de
  novo conteúdo é proposta ao Dev, que cria/edita a nota manualmente no
  Obsidian.
- **Ordem de leitura recomendada** ao montar contexto do zero:
  1. Este README
  2. `00_Mapa_de_Notas/` (Índice Geral + MOCs)
  3. `01_Notas_Gerais/` (glossário, regras gerais)
  4. Pasta do "mundo" específico relevante para a pergunta

## Estrutura de pastas

```
00_Mapa_de_Notas/       → Índice Geral e MOCs (Maps of Content), ponto de entrada
01_Notas_Gerais/        → Glossário e regras que atravessam todos os projetos
02_Sistema_Interno_Django/
03_ML_Analytics_HUB/
Modelos_Notas_Obsidian/ → Templates de nota (não é conteúdo, é modelo)
```

Dentro de cada pasta de "mundo" (`02_`, `03_`), a subestrutura é sempre
idêntica — mesmo nome de subpasta = mesmo significado em qualquer mundo:

```
Regras/
Decisoes/
Descobertas/
Duvidas/
Bugs_Conhecidos/
Conceitos/
Scripts/
```

## Vocabulário controlado (campo `tipo` no frontmatter)

Toda nota de conteúdo tem um frontmatter com um `tipo` fixo, um destes seis:

| tipo | significa |
|---|---|
| `regra` | Obrigação permanente, sem justificativa contextual — só se aplica |
| `decisao` | Escolha feita diante de um problema, com alternativas descartadas; pode ser revista |
| `descoberta` | Fato empírico sobre o sistema/API, observado e validado contra dado real |
| `duvida` | Questão em aberto; quando resolvida, gera uma nova nota `decisao` linkada, e o status desta muda para `resolvida` |
| `bug_conhecido` | Problema identificado e ainda não corrigido |
| `conceito` | Definição de termo/sigla usado no contexto (ex: MLB, SKU, folha) |

O campo `dominio` (css, html, js, python, banco_de_dados, performance, design)
é metadado, não vira pasta — várias notas do mesmo `tipo` podem ter domínios
diferentes na mesma pasta.

## Template de nota

Ver `Modelos_Notas_Obsidian/BASICO.md` para o frontmatter e estrutura padrão
de toda nota nova.

## Contexto de negócio (resumo rápido)

- MB e SV são duas empresas que vendem no Mercado Livre; o Dev é o
  desenvolvedor solo e também o especialista de domínio de ambas.
- O Sistema Interno (Django) nunca chama a API do ML diretamente — todos os
  dados chegam via arquivos JSON/Excel gerados pelo ML Analytics HUB.
- Classificação de anúncios: três estados — Simples / Base / Catálogo.
- Ver `01_Notas_Gerais/Glossario.md` para termos completos (MLB, SKU, folha,
  fossil, etc).

## Este repositório é a fonte de verdade para tudo — não só conhecimento técnico

Este repo não guarda apenas descobertas de API e decisões de arquitetura.
Ele guarda **tudo que guia o Claude**: regras de negócio, regras de código,
forma de programar, forma de agir como parceiro de engenharia, e forma de se
comunicar com o Dev. A memória do Claude (resumo automático entre
conversas) não deve ser tratada como o lugar onde esse conteúdo mora — ela é
limitada, compactada com o tempo e não determinística. A memória serve só
como **ponteiro**: "existe este repositório, e ele deve ser consultado sob
demanda seguindo as regras de acesso descritas acima". O conteúdo de verdade
— o que fica, o que é regra, o que é preferência de comunicação — vive aqui,
em notas versionadas.

Isso inclui, por exemplo:

- Regras de código do projeto Django (Sistema Interno MB/SV) — ver
  `02_Sistema_Interno_Django/Regras/`
- Regras de negócio (classificação de anúncios, cascata Base↔Catálogo, etc)
- Forma como o Claude deve se comunicar com o Dev (tom, formato de
  proposta de código, quando perguntar antes de agir) — ver
  `01_Notas_Gerais/Regras_Gerais.md`
- Ciclo de engenharia a seguir (Idealizar → Planejar → Discutir → Projetar →
  Executar → Testar → Corrigir → Validar) e postura de parceiro, não gerador
  de código sob demanda

Se houver conflito entre o que está na memória do Claude e o que está escrito
aqui, **este repositório prevalece** — ele é a versão atualizada e completa;
a memória pode estar desatualizada ou resumida demais.