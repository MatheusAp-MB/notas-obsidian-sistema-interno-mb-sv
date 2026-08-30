---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Como Escrever Notas no Vault — Padrao Hiper-Didatico, Estrutura e Convenções do Vault, Etapa 1-4 - Estudo do Produto, Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida), Modelo de Escrita — Definicao e Norma (Conceito, Regra), Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint), Modelo de Escrita — Instrucao Procedural (Tutorial), Exemplo — Prompt (Modelo de Demonstracao)]
resumo: Esqueleto de referência, explicado seção por seção, para prompt — o corpo da nota é a própria ferramenta a ser copiada e usada (não uma explicação sobre algo), com maturidade refletida no status (em_desenvolvimento/validado) e exemplo de execução real como prova.
---

# Modelo de Escrita — Artefato de Uso Direto (Prompt)

**Resumo**: esqueleto de referência, explicado seção por seção, para prompt — o corpo da nota é a própria ferramenta a ser copiada e usada (não uma explicação sobre algo), com maturidade refletida no status (em_desenvolvimento/validado) e exemplo de execução real como prova.

> [!info] Isto é um modelo de referência, não uma fôrma rígida
> Um prompt curto e de uso único pode não precisar de uma seção "Como usar" separada — a instrução de uso cabe numa frase antes do bloco. O que não pode faltar é ficar óbvio onde o prompt começa e termina, sem mistura com comentário do autor.

## Contexto — por que este modelo é diferente dos outros

Pela definição já registrada em [[Estrutura e Convenções do Vault]], `prompt` é "texto de prompt pronto pra ser usado", com `status` refletindo maturidade — `em_desenvolvimento` (ainda sendo pensado/testado) até `validado` (testado e confirmado funcionando, nunca por suposição). Isso muda o que "exemplo" significa aqui, comparado aos outros modelos: não é um exemplo hipotético de uso, é a prova de que o prompt já rodou de verdade e funcionou — sem essa prova, o prompt não deveria estar marcado como `validado`.

## As seções, explicadas 1 a 1

### Resumo de quando usar (topo da nota)

Diz, em 2-3 linhas, pra que serve este prompt e em que situação ele deve ser chamado — não o conteúdo do prompt em si, o **gatilho** de quando usá-lo. Isso importa porque um vault com vários prompts precisa que o leitor (ou o Claude, escolhendo qual prompt rodar) saiba rápido qual serve pra qual situação, sem abrir cada um pra descobrir.

### Callout de status

`[!warning]` pra `em_desenvolvimento` (ainda sendo testado, usar com cautela), `[!success]` pra `validado`. Quando fizer sentido, inclui um histórico curto de testes (quantas vezes já rodou, com que resultado) — diferente do callout de status do [[Modelo de Escrita — Arco de Resolucao (Decisao, Descoberta, Bug Conhecido, Duvida)|arco de resolução]], que fala de um estado fixo, aqui ele fala de maturidade, que pode subir com o tempo conforme mais testes confirmam que o prompt funciona.

### O prompt em si

O texto completo, sempre em bloco de código próprio (regra 4 da hiper-didática) — nunca misturado com comentário do autor no meio do bloco. Se o prompt tiver partes variáveis (um nome de produto, uma data), marque isso de forma clara dentro do próprio bloco (ex: `{{nome_do_produto}}`), e explique o que preencher na seção seguinte, não dentro do prompt.

### Como usar

O que precisa ser preenchido ou adaptado antes de rodar — quais variáveis, qual contexto precisa estar disponível antes (ex: "rodar isso só depois de ter o resultado da Etapa anterior aberto na conversa"). Sem esta seção, quem for usar o prompt não sabe o que trocar antes de colar, e corre o risco de rodar com um placeholder esquecido dentro.

### Exemplo de execução real

O resultado de quando este prompt já rodou de verdade, com produto/caso real — nunca inventado. É o mesmo espírito da regra 8 da hiper-didática (fechar com exemplo de ponta a ponta), mas aqui carrega um peso a mais: é a prova de que o `status: validado` não é suposição.

### Relacionado

Outras notas conectadas — em especial, toda `regra` que o prompt deveria fazer cumprir (ex: um prompt de auditoria de cache deveria linkar pra regra de invalidação explícita que ele está checando).

## Exemplo real já existente no vault

Os prompts da pipeline de produção de imagens (ex: [[Etapa 1-4 - Estudo do Produto]]) já seguem essa lógica de "o corpo é a ferramenta" — cada um é usado ponta a ponta em produtos reais (testado com múltiplos produtos ao longo de várias sessões) antes de virar parte fixa do fluxo. Vale abrir como referência de tom real, embora tenham sido escritos antes deste modelo existir, então não necessariamente seguem esta ordem exata de seção.

## Exemplo completo (fictício, criado para este modelo)

[[Exemplo — Prompt (Modelo de Demonstracao)]] — um prompt de auditoria que verifica se a implementação de [[Exemplo — Checkpoint (Modelo de Demonstracao)]] respeita a regra de invalidação explícita registrada em [[Exemplo — Regra (Modelo de Demonstracao)]].

## Relacionado

- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Estrutura e Convenções do Vault]]
- [[Etapa 1-4 - Estudo do Produto]]
