---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
atualizado_em: 08/08/2026 01:55
relacionado: [Modelagem de Objeto e Encapsulamento, Fluxo Decomposicao de Problemas em Micro Etapas, Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]
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

## Exemplo real validado — `Pis.reducao`/`Cofins.reducao` (08/08/2026)

Caso concreto de "dono único do dado" quando o cálculo depende de dado que mora em OUTRA dataclass: a API da Sysemp não devolve "Redução PIS"/"Redução COFINS" direto (só devolve pra ICMS/ICMS ST) — só a base de cálculo já reduzida e o custo total da nota, que vive na dataclass `Custos`, não em `Pis`/`Cofins`. Ver [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]] pra decisão completa.

Como o dado que falta (`custo_total`) não pertence a `Pis`/`Cofins`, o cálculo não podia virar `@property` (só aceita `self`, sem parâmetro externo) nem um campo preenchido à parte por fora (abriria a porta pra 2 lugares calcularem o mesmo dado de formas diferentes, exatamente o erro que essa regra existe pra evitar). Solução: a fábrica (`a_partir_do_registro`) passou a receber `custo_total` como parâmetro extra, calcula a redução 1 única vez ali dentro, e guarda o resultado como campo comum do dataclass — a fábrica continua sendo o único ponto de decisão desse dado, só que agora com 1 dependência explícita de fora, declarada na própria assinatura do método.

## Relacionado

- [[Modelagem de Objeto e Encapsulamento]]
- [[Fluxo Decomposicao de Problemas em Micro Etapas]]
- [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]
