---
tipo: regra
dominio: 
status: ativa
criado: 23/08/2026
atualizado_em: 23/08/2026 23:11
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, Etapa 5 - Navegacao pelos Grafos]
---

# Molde — Documento Consolidado (Étapa 6)

Molde vazio, sem dado de nenhum produto real. Quem for escrever a Étapa 6 de um produto novo deve ler ESTE arquivo pra saber o formato — nunca abrir um arquivo de produto já preenchido em `04_Produtos/` como referência de "como escrever". Ler um produto real como modelo contamina: risco de vazar dado, número ou frase de um produto pro outro, e não escala conforme o catálogo cresce.

Estrutura travada em [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]], seção "Molde da Étapa 6 (Consolidação)".

---

## Como usar este molde

1. Copie a estrutura abaixo (frontmatter + as 6 seções) pra um arquivo novo em `04_Produtos/`, nomeado com o nome comercial do produto.
2. Preencha o frontmatter: `criado`/`atualizado_em` com data e hora reais, `relacionado` com os nós do Grafo 1 tocados + esta nota de decisão.
3. Preencha cada seção só com dado do produto que está sendo processado agora — nunca copie frase, número ou exemplo de outro produto.
4. Nenhuma seção pode ficar com o texto de placeholder abaixo — se uma seção genuinamente não tiver conteúdo (ex.: nenhuma decisão de exclusão foi necessária), escreva isso explicitamente, não deixe o placeholder.
5. A seção 6 (Cruzamento com a Categoria) só é preenchida depois da Étapa 5 (Navegação pelos Grafos) — é o mesmo cruzamento gerado ali, colado aqui como parte final do documento.

---

## Estrutura (copiar a partir daqui)

```
---
tipo: conceito
dominio: 
status: ativa
criado: [data]
atualizado_em: [data hora]
relacionado: [nós do Grafo 1 tocados, Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]
---

# [Nome comercial do produto] — Documento Consolidado (Étapa 6)

Base de Conhecimento completa deste produto, no molde final travado em [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]. Nenhum gerador de conteúdo (título, descrição, foto, vídeo) deve ler as Etapas 1-5 originais — só este documento.

---

## 1. Fatos e Especificações
**Escopo desta seção:** só características físicas/técnicas confirmadas nos dados brutos ou na imagem. Nada de interpretação, nada de promessa de venda.

[Fatos objetivos do produto, um por linha ou tabela quando fizer sentido — marca, modelo, dimensões, peso, materiais, itens inclusos, restrições, garantia, o que foi confirmado só por imagem.]

---

## 2. Funcionamento
**Escopo desta seção:** como as partes listadas na seção 1 se conectam e operam juntas. Ainda sem julgamento de qualidade, comparação ou previsão de desempenho.

[Como as peças/partes da seção 1 interagem entre si — o fluxo de funcionamento, sem prever desempenho nem comparar com outro produto.]

---

## 3. Contexto de Compra
**Escopo desta seção:** leitura de propósito humano — perfil, cenários, dores, antes/depois. Nenhuma afirmação aqui precisa estar ancorada frase a frase na seção 1, mas nenhuma pode contradizer um fato dela.

**Perfil:** [quem compra isso]

**Cenários e locais:** [onde/quando é usado]

**Dores diretas resolvidas:** [dores que o produto resolve diretamente]

**Dores indiretas resolvidas:** [dores secundárias/emocionais]

**Antes:** [como era a vida do cliente sem o produto]

**Depois:** [como fica com o produto]

---

## 4. Eixos de Venda Validados
**Escopo desta seção:** cada eixo cruza 1 dor da seção 3 com 1 recurso comprovado nas seções 1-2. Só o que está aqui pode virar promessa de venda.

**Eixo 1 — [nome do eixo]**
Dor: [dor da seção 3]. Recurso: [recurso técnico confirmado nas seções 1-2]. Microvitória: [o que o cliente ganha na prática].

[Repetir 1 bloco por eixo validado — só cria eixo quem tem dor real E recurso técnico confirmado por trás.]

---

## 5. Decisões de Exclusão
**Escopo desta seção:** dores ou ângulos comerciais que pareciam bons mas não têm recurso técnico comprovado que os sustente. Existe pra impedir que alguém reintroduza isso mais tarde achando que ninguém avaliou.

[Cada dor/ângulo cogitado e recusado, com a justificativa exata do porquê não virou eixo. Se nenhuma dor foi recusada, escrever isso explicitamente — não deixar a seção vazia sem explicação.]

---

## 6. Cruzamento com a Categoria (Grafo)
**Escopo desta seção:** toda pergunta que a categoria deste produto ativa no Grafo 2, respondida ou marcada como ausente. É a fonte oficial de lacunas — nenhuma lacuna deve ser citada fora desta tabela.

Nós do Grafo 1 tocados: [lista de nós, ex.: [[Pulverizador]], [[Pulverizador Costal]]...].

| Template | Pergunta | Resposta | Confirmado por |
| --- | --- | --- | --- |
| [[Template]] | [Pergunta]? | [Resposta ou —] | [TEXTO] / [IMG] / [TEXTO+IMG] / dado ausente / N/A — [motivo] / [USUÁRIO] |

**Não usar as linhas "dado ausente" como promessa de venda.**

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
```

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[Etapa 5 - Navegacao pelos Grafos]]
