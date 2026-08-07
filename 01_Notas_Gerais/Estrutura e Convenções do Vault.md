---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
atualizado_em: 06/08/2026 22:00
relacionado: [Padrao de Robustez para Clientes de API Externa]
---

# Estrutura e Convenções do Vault

Esta nota é a especificação técnica fixa da organização deste vault, reescrita em 01/08/2026 depois de mover todo o conteúdo anterior para `LEGADO/`. Substitui por completo a versão antiga.

## Os mundos

Decisão de 06/08/2026: nem toda API/integração externa vira mundo próprio — só quando for grande e crítica o suficiente pra justificar ser testada e documentada de forma isolada. O critério é caso a caso, decidido junto com o usuário quando a situação aparecer.

- **`02_Sistema_Interno/`** — ativo. Segue a estrutura descrita abaixo. Inclui 2 contextos de API que são parte do próprio sistema, não integrações isoladas: `API_Google_Drive/` e `API_Agente_Local/` (a API que o próprio Sistema Interno expõe pro agente executável local). Criados sob demanda, na primeira nota de cada, como qualquer outro contexto.
- **`03_Integracao_Sysemp/`** — ativo, mundo próprio (não é contexto dentro de Sistema Interno). Motivo: a API do ERP Sysemp lida com dado fiscal sensível e é grande o suficiente pra ter ciclo de trabalho e índice isolados, mesmo o código morando no mesmo repositório do Sistema Interno (`scripts_exploracao_ERP/`).
- **`04_Integracao_Mercado_Livre/`** — ativo, mundo próprio, mesmo motivo do Sysemp. Integração ainda não começou de fato nesta versão do projeto (V2) — a pasta já existe pra receber decisões/descobertas assim que o trabalho começar.
- **`03_ML_Analytics_HUB/`** (dentro de `LEGADO/`) — projeto antigo e diferente, sem relação direta com `04_Integracao_Mercado_Livre/` além de servir de fonte de lições aprendidas. Congelado, não segue esta convenção.

Padrão de engenharia que atravessa mais de um mundo (ex: como construir com segurança um cliente de API externa) mora em `02_Sistema_Interno/Regras_de_Comportamento/`, mesmo quando o assunto também vale pra `03_Integracao_Sysemp/` ou `04_Integracao_Mercado_Livre/` — o código de todas essas integrações vive no mesmo repositório, então a regra é do projeto como um todo. Os outros mundos referenciam essa regra via `relacionado`, nunca duplicam o conteúdo. Ver [[Padrao de Robustez para Clientes de API Externa]].

## Convenção de nome (mantida)

- Nome de arquivo de nota = nome usado no `[[wikilink]]`, com espaço, sem underscore.
- Evitar acento e cedilha em nome de arquivo quando possível.
- Nome de pasta (mundo, contexto, tipo) usa underscore com prefixo numérico quando aplicável (`02_Sistema_Interno`, `Agenda_Videos`) — a convenção de espaço vale só para arquivos de nota, nunca para pastas.

## Estrutura de pastas dentro de um mundo

Padrão único, usado por qualquer mundo ativo (`02_Sistema_Interno/`, `03_Integracao_Sysemp/`, `04_Integracao_Mercado_Livre/`):

```
02_Sistema_Interno/
  00_Indice.md                → índice obrigatório do mundo (ver seção própria abaixo)
  Regras_de_Comportamento/    → regras de processo (como Claude deve agir neste projeto:
                                 gerar código, analisar código, pensar sobre algo).
                                 Arquivos soltos direto aqui, sempre tipo=regra.
                                 Nunca contém duvida ou bug_conhecido.
  <Contexto>/                  → criado sob demanda, na primeira nota daquele contexto
    Decisoes/
    Duvidas/
    Regras/
    Descobertas/
    Bugs_Conhecidos/
    Conceitos/
    Checkpoints/                → estado de trabalho em andamento (ver seção própria abaixo)
```

- **Contexto** agrupa um tema de negócio (ex: `Agenda_Videos`, `Precificacao`) — não precisa corresponder 1:1 a um app Django; pode interligar vários pontos do projeto.
- Nota que toca mais de 1 contexto mora no contexto principal e referencia o outro via `relacionado` — nunca duplicada em duas pastas.
- Subpasta de tipo (`Decisoes/`, `Duvidas/`, etc.) só existe dentro de um contexto quando já tiver pelo menos 1 nota daquele tipo — nunca pré-criada vazia.
- `Regras_de_Comportamento/` é diferente de um contexto: é nível do mundo, não de negócio, e não tem subpastas de tipo — só regras, soltas.

## Frontmatter (schema fixo)

```yaml
---
tipo: 
dominio: 
status: 
criado: DD/MM/YYYY
atualizado_em: DD/MM/YYYY HH:mm
relacionado: []
---
```

- **`tipo`** (vocabulário fechado): `regra` | `decisao` | `descoberta` | `duvida` | `bug_conhecido` | `conceito` | `checkpoint`
- **`dominio`** (vocabulário aberto, opcional): `python` | `css` | `js` | `banco_de_dados` | `performance` | `design` | (vazio) — nunca nome de projeto ou contexto (isso já é a pasta onde a nota está).
- **`status`** depende do `tipo`:
  - `duvida`: `ativa` | `resolvida`
  - `decisao`: `ativa` | `descartada`
  - `bug_conhecido`: `ativo` | `corrigido`
  - `checkpoint`: `em_andamento` | `concluido`
  - `regra` | `descoberta` | `conceito`: sempre `ativa`
- **`criado`**: `DD/MM/YYYY`, nunca ISO. Nunca muda depois de escrito.
- **`atualizado_em`**: `DD/MM/YYYY HH:mm` (adicionado 03/08/2026 — `criado` sozinho não refletia a última edição de conteúdo). Toda nota nova já nasce com `atualizado_em` igual a `criado` (só sem hora). Toda edição de conteúdo depois disso atualiza só este campo — `criado` nunca muda. Campo adicionado de forma NÃO retroativa: notas antigas sem esse campo continuam válidas, só ganham `atualizado_em` na próxima vez que forem editadas de verdade.
- **`relacionado`**: lista de nomes exatos de nota, sem `[[ ]]`.

## Ciclo de vida de dúvida e bug (nunca apagar histórico)

- **Dúvida resolvida**: nunca edita a nota de dúvida virando decisão. Gera uma nota **nova**, `tipo: decisao`, com a resposta e o motivo, linkada de volta via `relacionado`. A dúvida original muda `status` para `resolvida` e continua existindo — é o registro de "isso foi incerto até tal data, aqui está o que resolveu", útil se um caso parecido aparecer depois.
- **Bug corrigido**: a mesma nota ganha uma seção `## Correção` (o que foi feito, quando) e `status` muda de `ativo` para `corrigido`. Não gera nota nova — causa e correção ficam juntas no mesmo lugar.

## Checkpoint — nota que se atualiza no lugar (nunca gera nota nova)

Diferente de dúvida/decisão/bug (que preservam histórico gerando nota nova ou seção extra), `checkpoint` registra o ESTADO ATUAL de um trabalho em andamento de várias sessões — e é sobrescrito na mesma nota a cada atualização relevante, com uma seção `## Última atualização` no topo do corpo (data). Existe porque a memória de conversa é volátil (sujeita a compactação) — o checkpoint é a memória persistente desse progresso. Quando o trabalho termina de vez, `status` muda para `concluido` (a nota continua existindo, como registro final).

## Índice (`00_Indice.md`)

- Obrigatório, um arquivo por mundo, dentro da raiz de `02_Sistema_Interno/`.
- Agrupado por contexto (`##`), com uma tabela: `Nota | Tipo | Status | Data | Resumo`.
- `Resumo` é a conclusão real da nota em até ~25 palavras — nunca uma descrição genérica da categoria.
- Sem coluna de `relacionado` — isso fica só dentro da nota em si.
- Atualizado na mesma autorização de escrita da nota que o gerou — não é uma autorização separada.

## Nunca duplicar informação estrutural fora desta nota

Se uma convenção nova precisar ser definida (nova pasta, novo campo de frontmatter, nova regra de nome), ela é adicionada aqui — nunca criada solta em outra nota.

## Relacionado

- [[padrao]]
