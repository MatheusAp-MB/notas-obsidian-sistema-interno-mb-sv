---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Estrutura de Arquivo e Classe Python, Fluxo Decomposicao de Problemas em Micro Etapas]
---

# Nomenclatura e Comentários

## Nomenclatura

- Clareza sempre antes de brevidade (`transformar_linha_em_produto`, nunca `processar`).
- Teste do nome de método: completa a frase "Função Objetivo: ___" com um verbo + substantivo claro, sem "e" no meio? Se sim, é método. Se só sai vago ("processa uma parte"), o método ainda não terminou de se separar — ou não devia ter saído do método-pai.
- Critério de função solta vs. aninhada: reaproveitada em mais de 1 lugar → solta, nível de módulo. Serve só a 1 processo específico → aninhada/método de classe (ver [[Fluxo Decomposicao de Problemas em Micro Etapas]]).
- Padrão de "funil": várias entradas possíveis convergem cedo pra 1 objeto único; daí em diante só esse objeto circula entre as funções/métodos.

## Comentários

- `Função Objetivo:` é obrigatório em todo arquivo, classe e função solta — frase curta, direta, sem textão na primeira linha.
- `# * [EXPLICAÇÃO] → ...` é usado **seletivamente**, só em métodos que carregam uma decisão não óbvia ou uma regra de negócio específica — nunca em todo método sem exceção.
- Comentário existe pra explicar o **porquê** (motivo, decisão, regra de negócio) — nunca o **o quê**. Se um trecho de código precisa de comentário explicando o que ele faz, o problema é o nome/estrutura do código, não a falta de comentário — refatorar (renomear, extrair método) em vez de comentar.

## Motivo

Nome ruim e comentário genérico custam tempo de leitura toda vez que o código é revisitado — e revisitar acontece sempre que uma diretriz de marketplace ou regra interna muda. Nome bom elimina a necessidade do comentário na maioria dos casos.

## Relacionado

- [[Estrutura de Arquivo e Classe Python]]
- [[Fluxo Decomposicao de Problemas em Micro Etapas]]
