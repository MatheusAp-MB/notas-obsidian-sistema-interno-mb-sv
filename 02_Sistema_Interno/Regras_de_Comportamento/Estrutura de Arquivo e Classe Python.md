---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Nomenclatura e Comentarios, Integridade e Fonte Unica de Dado]
---

# Estrutura de Arquivo e Classe Python

Ordem fixa pra qualquer arquivo Python que define 1 ou mais classes de persistência (Django `Model`) ou classes de domínio — sempre a mesma sequência, sem exceção.

## Estrutura de arquivo

1. Comentário com o caminho do próprio arquivo, na linha 1 (ex: `# agenda_videos/models/ciclo_video.py`).
2. `Função Objetivo:` — comentário de cabeçalho descrevendo o propósito do arquivo/classe principal, incluindo contexto e decisões relevantes (motivo de existir, decisões de negócio embutidas).
3. Imports, agrupados em 3 blocos separados por linha em branco: stdlib → terceiros/Django → local.
4. Enum/`TextChoices`: aninhado dentro da classe que o usa, se exclusivo dela (padrão oficial do Django). Só vira module-level (ou um `enums.py` do app) quando compartilhado por mais de 1 classe do projeto.
5. Dataclasses de apoio (objetos de domínio/processo), se o arquivo precisar de algum.
6. A(s) classe(s), sempre em ordem de dependência — quem não depende de mais nada vem primeiro.

## Estrutura de classe (ordem fixa de membros)

1. Choices aninhadas (se exclusivas desta classe).
2. Campos, agrupados logicamente por bloco relacionado (linha em branco entre grupos), comentados só onde o significado não é óbvio.
3. `class Meta`.
4. `__str__` (e outros dunders, ex: `__repr__`).
5. `save()`, só se houver override.
6. `get_absolute_url()`, só se houver.
7. `@classmethod` de fábrica (construtor alternativo — ex: `iniciar_agenda`). Fica logo no topo dos métodos, porque é a primeira coisa que quem lê quer saber: "como eu crio um desses".
8. `@property` (valores derivados — ver [[Integridade e Fonte Unica de Dado]]).
9. Métodos de leitura (não alteram estado).
10. Métodos que alteram estado (ações) — sempre dentro de `transaction.atomic()` quando escrevem mais de 1 coisa.

## Motivo

Ordem fixa elimina decisão repetida ("onde eu coloco isso?") e torna qualquer classe do projeto navegável do mesmo jeito, não importa quem escreveu. Baseado na convenção real de projeto Django mais citada pela comunidade (livro de referência "Two Scoops of Django"), adaptada ao padrão do projeto.

## Relacionado

- [[Nomenclatura e Comentarios]]
- [[Integridade e Fonte Unica de Dado]]
