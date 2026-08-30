---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 13:33
relacionado: [Como Escrever Notas no Vault — Padrao Hiper-Didatico, Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint), Modelo de Escrita — Instrucao Procedural (Tutorial), Modelo de Escrita — Artefato de Uso Direto (Prompt), Exemplo — Conceito (Modelo de Demonstracao), Exemplo — Regra (Modelo de Demonstracao), Os 9 Tipos de Nota]
resumo: Esqueleto de referência, explicado seção por seção com exemplo de cada tipo, para notas que estabelecem uma verdade permanente em vez de resolver uma pergunta pontual — descrevendo o que algo É (`conceito`) ou prescrevendo o que deve ser feito sempre (`regra`).
---

# Modelo de Escrita — Definição e Norma (Conceito, Regra)

**Resumo**: esqueleto de referência, explicado seção por seção com exemplo de cada tipo, para notas que estabelecem uma verdade permanente em vez de resolver uma pergunta pontual — descrevendo o que algo É (`conceito`) ou prescrevendo o que deve ser feito sempre (`regra`).

> [!info] Isto é um modelo de referência, não uma fôrma rígida
> As seções abaixo são um jeito de pensar a nota, não uma casca obrigatória. Uma regra simples, sem alternativa real descartada, pode não precisar da seção "Por que é assim" separada — ela vira 1 frase dentro de "O que diz". O que importa é o leitor nunca ficar sem saber por que a norma/definição é essa e não outra.

## Contexto — a diferença entre conceito e regra

| Tipo | Natureza | Pergunta que responde | Status possível |
|---|---|---|---|
| `conceito` | Descritiva — define o que algo **é** | "O que é isso?" | `ativa` (único — se muda, a nota é reescrita no lugar) |
| `regra` | Prescritiva — diz o que **deve** ser feito sempre | "Como isso deve ser feito, sempre?" | `ativa` (único — mesma lógica) |

Os dois compartilham o mesmo esqueleto de seções porque os dois são "verdade fixa", sem prazo de validade nem estado intermediário — a diferença fica só no conteúdo de "O que é / o que diz": um descreve, o outro manda. Um jeito prático de saber qual dos dois escrever: se a nota está definindo um termo ou um conceito que várias outras notas vão usar (ex: "o que é watermark de sincronização"), é `conceito`; se está dizendo como algo deve ser feito daqui pra frente, sempre, sem exceção (ex: "todo cache precisa de estratégia de invalidação explícita"), é `regra`.

## As seções, explicadas 1 a 1

### Resumo (topo da nota)

Duas ou três linhas em prosa dizendo, sem rodeio, qual é a definição ou o princípio central — a mesma frase que vai pro campo `resumo:` do frontmatter, repetida no corpo por que frontmatter nem sempre é visível na leitura. Diferente do Resumo do [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)|arco de resolução]], aqui não existe "estado atual" pra resumir — é sempre a mesma verdade, então o resumo é só ela mesma, condensada.

### Contexto

De onde veio a necessidade dessa definição ou dessa norma — o problema real que apareceu antes de alguém decidir que essa verdade precisava ser fixada por escrito. Uma regra sem contexto parece arbitrária, mesmo quando não é: dizer "toda função pequena, nunca uma função grande" sem explicar que isso existe pra facilitar manutenção quando uma diretriz muda soa como capricho de estilo, não como decisão de engenharia.

### O que é / o que diz

O núcleo da nota — a definição ou o princípio central, sem rodeio, dito de forma que, se só esta seção for lida, ainda dá pra usar a informação. Em `conceito`, isso é a definição em si (ex: "watermark é o registro que guarda até onde a última sincronização já cobriu"). Em `regra`, isso é o mandamento em si (ex: "todo cache precisa de estratégia de invalidação explícita, nunca silenciosa").

### Por que é assim e não de outro jeito

O raciocínio por trás — alternativas que foram consideradas e descartadas, se houver, e o motivo real (não hipotético) de a definição/norma ser exatamente essa. Esta seção é o que separa uma regra bem fundamentada de uma imposição arbitrária: sem ela, o leitor pode até seguir a regra, mas nunca vai entender quando ela deixa de fazer sentido (o que importa, por exemplo, na hora de decidir se uma exceção é razoável).

### Exemplo

Caso concreto de aplicação. Em `regra`, o formato mais forte é sempre um par ANTES/DEPOIS (a régua [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]] já usa esse formato em cada uma das suas 8 regras práticas) — mostrar o jeito proibido lado a lado com o jeito exigido deixa a diferença impossível de interpretar errado. Em `conceito`, um exemplo real de uso do termo já basta, sem precisar do par ANTES/DEPOIS (não existe "jeito errado" de um conceito, só de uma aplicação dele).

### Relacionado

Outras notas conectadas — em especial, toda `regra` deveria linkar pro `conceito` que ela pressupõe, quando existir um (ex: a regra sobre invalidação de cache pressupõe o conceito de watermark, porque os dois são estratégias de "evitar refazer trabalho", e entender um ajuda a entender o outro).

## Exemplo real já existente no vault

[[Como Escrever Notas no Vault — Padrao Hiper-Didatico]] é, ela mesma, uma `regra` que segue essa lógica: abre com Contexto (por que a escrita didática precisava virar padrão obrigatório), define o princípio central ("Modo Professor"), e cada uma das 8 regras práticas vem com um par ANTES/DEPOIS — exatamente o "Exemplo" deste esqueleto, repetido regra por regra. Vale reler com esse olhar.

## Exemplos completos (fictícios, criados para este modelo)

- [[Exemplo — Conceito (Modelo de Demonstracao)]] — "o que é um watermark de sincronização", conceito genérico usado como base do [[Exemplo — Bug Conhecido (Modelo de Demonstracao)|bug de exemplo]].
- [[Exemplo — Regra (Modelo de Demonstracao)]] — "todo cache precisa de estratégia de invalidação explícita", regra que fundamenta a decisão tomada em [[Exemplo — Decisao (Modelo de Demonstracao)]].

## Relacionado

- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Os 9 Tipos de Nota]]
- [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)]]
