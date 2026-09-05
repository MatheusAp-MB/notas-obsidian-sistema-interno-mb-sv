---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Modelagem de Objeto e Encapsulamento]
---

# Padrões de Projeto (GoF) — Quando Usar

Do catálogo clássico de 23 padrões (criacionais, estruturais, comportamentais), a maioria não se aplica ao porte deste projeto. Esta nota fixa qual usar, qual evitar, e o critério de decisão — pra não virar aplicação cega de "boa prática" sem motivo real.

## Já usados, validados

- **Memento** (histórico nunca sobrescrito, sempre novo registro — ex: `CicloVideo`, `HistoricoStatusManualAgenda`).
- **Facade** (esconder complexidade atrás de método simples — ex: `orquestrador.py`, `criar_proximo()`, `marcar_replicado()`).
- **Evitar Strategy indevido**: o teste certo é "o **algoritmo** muda" (vira classe/Protocol separado) vs. "só o **dado** muda" (mesma classe, instância diferente — nunca criar subclasse só por dado diferente).

## Adotar quando o motivo aparecer (não hoje)

- **Adapter**: quando a camada de domínio de cada marketplace crescer, pra traduzir cada formato pro formato comum.
- **Abstract Factory** / **Template Method**: quando existir de fato múltiplas implementações intercambiáveis (ex: abstração multi-marketplace).
- **State** (classe por estado): só se o comportamento mudar por etapa, não só o rótulo — hoje um if/elif simples resolve.
- **Command** / **Chain of Responsibility**: só se surgir fila/retry de automação ou validação em cascata.

## Evitar — não relevante pro porte do projeto

- **Observer / Django signals** pra sincronização derivada: preferir chamada explícita no final do método que escreve o dado — rastreável, sem "mágica" escondida em outro arquivo.
- **Singleton**: Django settings já resolve o caso de uso; estado global é risco, não benefício, aqui.
- **Flyweight**: otimização de RAM em escala que este projeto não tem.
- **Iterator**: já nativo do Python (`for`, generators) — nada a adicionar.
- **Visitor, Bridge, Composite, Prototype**: resolvem problema que o domínio deste projeto não tem hoje.

## Motivo

Aplicar um padrão sem o problema real que ele resolve é regredir pro molde de linguagens como Java, que o projeto está deliberadamente evitando.

## Relacionado

- [[Modelagem de Objeto e Encapsulamento]]
