---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
atualizado_em: 30/08/2026 17:30
relacionado: [Fluxo Decomposicao de Problemas em Micro Etapas, Estrutura de Arquivo e Classe Python, Como Escrever Notas no Vault — Padrao Hiper-Didatico, Definição do Núcleo de Comportamento Claude, Convenção de Nomenclatura de Arquivos e Pastas]
resumo: Clareza de nome sempre acima de brevidade, em qualquer coisa que se nomeia — variável, arquivo, pasta ou nota — porque nome vago custa tempo de releitura toda vez que a coisa é revisitada. Comentário/anotação existe só pra explicar o porquê, nunca o quê.
---

# Nomenclatura e Comentários

**Resumo**: clareza de nome sempre acima de brevidade, em qualquer coisa que se nomeia — variável, arquivo, pasta ou nota — porque nome vago custa tempo de releitura toda vez que a coisa é revisitada. Comentário/anotação existe só pra explicar o porquê, nunca o quê.

## Contexto

Nome ruim e explicação genérica custam tempo de leitura toda vez que algo é revisitado — e revisitar acontece com frequência neste projeto, seja uma função, um arquivo, uma pasta do vault ou uma decisão registrada. Nome bom elimina a necessidade de explicação extra na maioria dos casos; por isso as 2 regras (nomear bem, comentar só o porquê) andam sempre juntas nesta nota.

## O que diz

**Nomenclatura**:

- Clareza sempre antes de brevidade — o nome precisa dizer o que a coisa é ou faz, mesmo que fique mais longo. Vale pra função, variável, arquivo, pasta ou nota do vault igualmente.
- Isto cobre a **clareza** do nome (o que ele diz) — o **formato mecânico** específico de nome de arquivo/pasta do vault (espaço vs. underscore, prefixo numérico, evitar acento) é regra à parte, em [[Convenção de Nomenclatura de Arquivos e Pastas]]. As duas se aplicam juntas, sem conflito, ao nomear uma nota ou pasta do vault: esta regra decide se o nome é claro, aquela decide o formato exato dele.
- Teste prático pra nome de função ou método: completa a frase "Função Objetivo: ___" com um verbo + substantivo claro, sem "e" no meio? Se sim, o nome está pronto. Se só sai algo vago (ex: "processa uma parte"), o nome ainda não terminou de se separar do resto — ou a própria unidade nomeada ainda não devia existir separada.
- Padrão de "funil": quando várias entradas possíveis convergem pra um mesmo processo, elas devem convergir cedo pra 1 formato único — daí em diante, só esse formato circula entre as partes seguintes, sem cada uma precisando saber de onde a entrada original veio.
- *Isto não significa* nome longo por si só — um nome pode ser claro e curto ao mesmo tempo; o teste é se alguém que nunca viu aquilo entende o papel só pelo nome, não o tamanho da palavra.
- Critério de quando algo fica separado (com nome e lugar próprio) ou aninhado (dentro do que o usa) não é definido aqui — é definido em [[Fluxo Decomposicao de Problemas em Micro Etapas]], porque decompor e nomear são 2 perguntas diferentes: primeiro decide-se o que vira parte própria (Fluxo), só depois se decide como essa parte é chamada (aqui).

**Comentários e anotações**:

- Uma anotação (comentário de código, ou explicação numa nota do vault) existe pra explicar o **porquê** — motivo, decisão, regra de negócio por trás — nunca o **quê**. Se um trecho precisa de explicação dizendo o que ele faz, o problema é o nome ou a estrutura, não a falta de anotação — a correção é renomear ou reestruturar, nunca só comentar o óbvio.
- Em código, todo arquivo, classe e função solta tem uma linha curta de "Função Objetivo:", direta, sem parágrafo longo. Uma anotação mais longa (`# * [EXPLICAÇÃO] → ...`) é usada só em pontos que carregam uma decisão não óbvia ou uma regra de negócio específica — nunca em todo trecho, sem critério.
- *Isto não significa* nunca explicar nada — significa que a explicação, quando existe, mira o motivo, não a mecânica (a mecânica já devia estar clara pelo nome).

## Por que é assim e não de outro jeito

A alternativa mais comum — nome curto e genérico, compensado por um comentário explicando o que ele faz — foi descartada porque resolve o sintoma (a leitura fica confusa) sem resolver a causa (o nome não carrega significado). Isso custa duplamente: quem lê precisa processar o nome vago e depois o comentário, em vez de só o nome; e o comentário, sendo texto solto, pode ficar desatualizado sem que ninguém perceba quando a lógica muda — o nome, por estar preso à própria estrutura, não corre esse risco do mesmo jeito.

## Exemplo — ANTES × DEPOIS

**ANTES (nome vago, comentário compensando)**:

```python
def processa(dados):  # pega os dados e organiza pra calcular o peso
    ...
```

**DEPOIS (nome claro, sem comentário necessário)**:

```python
def organizar_dimensoes_para_peso_cubado(dimensoes_brutas):
    ...
```

O segundo nome já responde "Função Objetivo: organizar dimensões pra calcular peso cubado" sem precisar de comentário nenhum — o comentário do primeiro exemplo vira redundante assim que o nome fica específico.

Fora de código, o mesmo princípio já foi aplicado neste vault: a pasta que hoje se chama `Regras/` (nível de mundo) se chamava `Regras_de_Comportamento/` até 29/08/2026 — nome que sugeria "comportamento de Claude", quando na prática guardava padrão de engenharia do projeto, não comportamento nenhum. O nome antigo exigia uma explicação à parte pra ninguém se confundir; o nome novo não precisa.

## Relacionado

- [[Fluxo Decomposicao de Problemas em Micro Etapas]]
- [[Estrutura de Arquivo e Classe Python]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
- [[Definição do Núcleo de Comportamento Claude]]
- [[Convenção de Nomenclatura de Arquivos e Pastas]]
