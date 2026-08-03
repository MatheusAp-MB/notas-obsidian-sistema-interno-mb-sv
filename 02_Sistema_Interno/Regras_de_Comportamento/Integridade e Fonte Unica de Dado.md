---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Modelagem de Objeto e Encapsulamento, Fluxo Decomposicao de Problemas em Micro Etapas]
---

# Integridade e Fonte Única de Dado

## Dono único do dado

- Cada dado tem 1 único lugar que decide seu significado/valor — 1 método dono do cálculo/interpretação (ex: `etapa_atual()`). Todo o resto do sistema consome esse resultado, nunca reimplementa a lógica por fora.
- Nunca pode existir 2 formas de escrever o mesmo dado — toda escrita passa por 1 único método responsável; nunca alterar campo direto de fora do objeto que é dono dele.
- Nunca guardar campo cujo valor é 100% dedutível de outro dado já guardado — vira `@property` (vale pra qualquer dado calculável, não só booleano).

## Pipeline de dado bruto

- Dado bruto (importado/vindo de API) pode continuar bruto na fonte — nunca é sobrescrito lá.
- A **primeira** função que toca o dado bruto é responsável por limpar, processar e organizar, devolvendo dado polido.
- Toda função **depois** dela já espera receber dado organizado e polido — processa, e devolve também organizado e polido. Dado bruto nunca "vaza" adiante na cadeia.
- Antes de ler, dado precisa estar organizado num objeto bem definido (dataclass/model) — nunca circulando como dict/tupla solta.

## Padronização de entrada e saída

- Toda função tem entrada padronizada e saída padronizada — tipo bem definido (com type hint), nunca varia formato dependendo do caminho de código.

## Banco de dados é a lei

- Banco de dados é a única fonte confiável. Qualquer cache/cópia calculada (ex: `IndicadoresAgendaProduto`) nunca embasa decisão/ação sozinho — serve só pra filtro/listagem rápida.
- Antes de agir (clique, decisão, mudança de estado), sempre reconferir contra a fonte real, nunca confiar só na cópia.

## Validação de qualquer entrega

Toda entrega é validada em 4 eixos: funcionalidade, fluxo de UX, eficiência de processamento, segurança de persistência de dado.

## Motivo

Dado interpretado de forma diferente em 2 lugares do sistema é a raiz da maioria dos bugs de desincronia — e é o tipo de erro mais caro de rastrear, porque cada lugar "parece certo" isoladamente.

## Relacionado

- [[Modelagem de Objeto e Encapsulamento]]
- [[Fluxo Decomposicao de Problemas em Micro Etapas]]
