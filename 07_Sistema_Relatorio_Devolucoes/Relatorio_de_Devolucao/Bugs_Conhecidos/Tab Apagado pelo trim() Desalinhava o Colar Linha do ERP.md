---
tipo: bug_conhecido
dominio: js
status: corrigido
criado: 09/09/2026
atualizado_em: 09/09/2026 12:00
relacionado: [Colar Linha do ERP Adaptável a Nomes de Coluna Diferentes]
---

# Tab Apagado pelo trim() Desalinhava o Colar Linha do ERP

**Resumo**: no recurso "Colar linha do ERP" (Nova Devolução), `linha.trim()` aplicado na linha inteira colada apagava também o caractere Tab quando ele estava na borda da linha (1ª ou última coluna vazia) — Tab conta como espaço em branco pro JavaScript. Isso desalinhava todos os valores em relação ao cabeçalho sempre que a 1ª ou a última coluna real da grade do ERP vinha vazia (comum: "BL" vazio no início da SAMVALE, "Separado Por:" vazio no fim da MAGAZINE). Corrigido substituindo cada Tab por um separador visível (`|SEP|`) antes de qualquer `.trim()` rodar.

> [!success] Corrigido — 09/09/2026
> Reproduzido em simulação isolada (Node.js, fora do projeto Django rodando) usando as linhas reais da SAMVALE e MAGAZINE fornecidas pelo usuário, batendo byte a byte com um screenshot real de valores errados. Solução final sugerida pelo próprio usuário: trocar Tab por um separador que nunca é espaço em branco.

## Contexto

O recurso "Colar linha do ERP" deixa o usuário selecionar a linha de cabeçalho + a linha de dados na grade do ERP (Ctrl+C, que preserva os Tabs reais entre colunas) e colar numa textarea; o JavaScript (`processarColagem`, em `script_nova_devolucao.js`) separa em 2 linhas, separa cada linha por coluna, monta um objeto `valorPorColuna` indexado pelo NOME de cada coluna (não pela posição), e preenche os campos do formulário buscando pelo nome. Ver [[Colar Linha do ERP Adaptável a Nomes de Coluna Diferentes]] pra arquitetura completa desse recurso.

## O problema

Usuário reportou (via screenshot) que, ao colar uma linha real da SAMVALE, os campos preenchidos vinham com valores de coluna errada — "Número do pedido" aparecia com o valor que devia estar em "Nota fiscal", por exemplo. O deslocamento não era aleatório: sempre 1 coluna pra trás, e só acontecia em algumas linhas, não em todas.

## O que levou à resposta

A 1ª hipótese (contagem de colunas cabeçalho vs. dados divergente) foi descartada — as duas linhas tinham o mesmo número de colunas nos casos com erro. O usuário rejeitou explicitamente qualquer correção que travasse ou avisasse nesse cenário ("não é para travar e avisar, é para ser adaptavel") — a correção precisava lidar com o dado real, não bloqueá-lo.

Reproduzindo em isolado (Node.js puro, sem tocar o projeto real) com a linha real da SAMVALE do pedido 653.736 — que tem a coluna "BL" vazia bem no início da linha — ficou confirmado: `linha.trim()`, chamado em cada linha inteira colada antes de separar por Tab, apaga o Tab que fica na borda da linha junto com qualquer espaço real. Tab (`\t`) é espaço em branco pra especificação do JavaScript, então `"\tA\tB\tC".trim()` vira `"A\tB\tC"` — 1 coluna a menos, e todo o resto desliza 1 posição pra trás. O mesmo padrão explica o caso MAGAZINE, só que no fim da linha (coluna "Separado Por:" vazia).

## Correção

1ª correção (funcional, mas não a versão final): uma função `apararSemPerderTabs` que aparava só espaço/quebra de linha nas bordas, preservando Tab. O usuário então propôs uma solução melhor, estruturalmente imune ao mesmo bug reaparecer no futuro: trocar cada Tab por um separador que nunca é espaço em branco, ANTES de qualquer `.trim()` rodar.

Localize (`devolucoes/static/devolucoes/js/script_nova_devolucao.js`, dentro de `processarColagem`):

```javascript
var linhas = texto
    .split(/\r\n|\r|\n/)
    .map(function (linha) { return linha.trim(); })
    .filter(function (linha) { return linha.length > 0; });

var cabecalho = linhas[0].split('\t');
var valores = linhas[1].split('\t');
```

Substitua:

```javascript
var textoComSeparadorVisivel = texto.split('\t').join(SEPARADOR_COLUNA);

var linhas = textoComSeparadorVisivel
    .split(/\r\n|\r|\n/)
    .map(function (linha) { return linha.trim(); })
    .filter(function (linha) { return linha.length > 0; });

var cabecalho = linhas[0].split(SEPARADOR_COLUNA);
var valores = linhas[1].split(SEPARADOR_COLUNA);
```

Com `SEPARADOR_COLUNA = '|SEP|'` definido 1 vez no topo do arquivo. Como `|SEP|` nunca é espaço em branco, nenhum `.trim()` atual ou futuro consegue apagar um separador de coluna por engano — a classe inteira do bug deixa de poder existir, não só o caso encontrado.

## Exemplo

| Caso | Coluna vazia na borda | Sintoma antes da correção |
|---|---|---|
| SAMVALE pedido 653.736 | "BL" (1ª coluna) | Tab inicial apagado pelo `trim()` — cabeçalho e valores saem com 1 coluna a menos, tudo desliza pra trás |
| MAGAZINE pedido 1.845.869 | "Separado Por:" (última coluna) | Tab final apagado pelo `trim()` — mesmo efeito, na outra ponta da linha |

Nos dois casos, depois da correção com `|SEP|`, a simulação isolada confirmou o número certo de colunas (50 na SAMVALE, 48 na MAGAZINE) e cada valor batendo com o nome de coluna certo.

## Relacionado

- [[Colar Linha do ERP Adaptável a Nomes de Coluna Diferentes]]
