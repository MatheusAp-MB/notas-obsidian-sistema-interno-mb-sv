---
tipo: decisao
dominio: 
status: ativa
criado: 22/08/2026 16:31
atualizado_em: 22/08/2026 19:23
relacionado: [Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre, Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack, Evolucao do Controle de Contexto e Execucao - Do Prompt de Migracao ao Vault Como Segundo Cerebro, Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]
---

# Pipeline de Geração Dinâmica das 7 Fotos — Análise Dupla e Árvore de Categorias por Facets

## O quê

Arquitetura proposta (ainda em fase de idealização, não testada na prática) pra resolver a geração das 7 fotos de anúncio do Mercado Livre — a 1ª parte do problema maior de [[Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre|Produção de Imagens e Vídeos]]. Ideia central: em vez de 1 prompt genérico (ou 7 prompts fixos, 1 por posição de foto) tentando cobrir qualquer produto, um pipeline que analisa o produto especificamente, consulta regras já aprendidas por categoria, e monta as fotos de forma dinâmica e personalizada — aprendendo com o feedback do usuário ao longo do tempo, salvando esse aprendizado no vault (mesmo padrão de memória estruturada usado no resto deste vault, sem fine-tuning — ver [[Evolucao do Controle de Contexto e Execucao - Do Prompt de Migracao ao Vault Como Segundo Cerebro]]).

## Por quê — o problema que motivou esta arquitetura

Ver detalhe completo em [[Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack]]. Resumo do raciocínio que levou até aqui:

- Um prompt único conseguindo gerar as 7 fotos coerentes parece possível (o GPT encontrado na internet faz isso), mas difícil de replicar de forma editável e personalizável.
- Um prompt fixo POR POSIÇÃO de foto (ex: "Foto 4 = Dimensões") quebra ao trocar de categoria de produto — o que conta como "dimensão relevante" muda completamente entre uma cadeira de rodas e um pulverizador.
- Pedir pra LLM preencher esse prompt fixo sem dado real leva a 2 problemas do mesmo tipo: conteúdo genérico (a LLM inventa algo plausível, não necessariamente certo) e inconsistência (nada garante que o próximo produto da mesma categoria saia parecido) — raiz comum: falta de fonte de verdade estruturada sobre o produto específico.
- Resolver isso exige: (1) saber quais informações realmente importam pra CADA categoria de produto — só quem entende do produto sabe dizer isso — e (2) ter o dado real dessas informações, não inventado.

## Os elementos da arquitetura

### 1. Entrada

Título + descrição do fornecedor (normalmente já vem com ficha técnica, mas nem sempre completa) + 1 ou mais fotos do produto.

### 2. Duas análises paralelas e isoladas

- **Análise técnica**: fatos objetivos sobre o produto (dimensões, capacidade, material, se é motorizado, etc.).
- **Análise contextual**: o que o cliente, comprando aquilo, gostaria de saber/ver.

As 2 se unem numa "base de conhecimento" daquele produto específico.

### 3. Padrão Esperado (schema de dados por categoria/facet) + regra de nunca inventar

Cada categoria/facet tem, no vault, um "Padrão Esperado" com os campos que costumam importar pra ela — exemplo dado pra cadeira de rodas: altura, largura, comprimento, peso, é motorizada?, é dobrável? Se a entrada de dados (título/descrição/foto) não contém um desses campos, **a LLM pergunta ao usuário aquela informação especificamente**, em vez de inventar um valor plausível. Essa é a peça central que resolve o problema de conteúdo genérico/inconsistente descrito acima — a fonte de verdade vira dado real (fornecido por alguém) ou explicitamente marcado como "perguntar", nunca suposição livre.

### 4. Árvore de categorias como conjunto de facets combináveis (não hierarquia linear única)

Decisão importante: as categorias não são generalistas, e não formam 1 galho único por produto — são um conjunto de características (facets) que se somam. Exemplo dado: uma cadeira de rodas pode ser, ao mesmo tempo, Motorizada, Dobrável e Escamoteável — cada facet carrega sua própria regra (o que precisa aparecer, o que é "certo"), e o produto final herda a SOMA das regras de todos os facets que se aplicam a ele. Isso existe deliberadamente pra evitar que uma correção feita por causa de 1 produto atípico "vaze" e contamine regras de outros produtos que não compartilham aquela característica.

### 5. Bootstrap de categoria/facet nova (1ª vez)

Quando a árvore ainda não tem regra pra uma combinação de facets (situação inicial: 2 produtos novos chegando, cadeira de rodas e pulverizador, do zero), a própria 1ª passada da LLM já cria, no vault, um "Padrão Esperado" inicial pra aquela combinação — juntando análise técnica + contextual pra estimar o que o cliente esperaria ver. O usuário testa com esse resultado inicial e dá feedback; a LLM refina o padrão salvo. Não existe processo de bootstrap manual separado — a 1ª geração de cada categoria/facet nova já É o treino inicial.

### 6. Compilação dinâmica das 7 fotos (não é slot fixo de conteúdo)

Ponto corrigido durante a conversa (a 1ª formulação estava errada): **não existe um mapeamento fixo tipo "Foto 4 sempre mostra dimensão"**. O fluxo real é: a análise levanta TODAS as informações relevantes que o cliente quer saber sobre aquele produto especificamente; só depois uma etapa de compilação decide, de forma dinâmica e específica pra aquele produto, como distribuir/agrupar essas informações nas 7 fotos — podendo até juntar mais de 1 informação numa única foto quando fizer sentido. A personalização acontece na composição, não só no conteúdo de um slot fixo.

### 7. Restrições fixas de negócio (não são dinâmicas)

- **Sempre exatamente 7 fotos no total** — regra de negócio fixa, não muda mesmo que o produto tenha mais ou menos informação relevante.
- **Foto 1 é sempre a capa** — posição E papel fixos, fora do controle da compilação dinâmica.
- Nenhuma outra âncora fixa identificada até 22/08/2026 (o usuário confirmou "no momento que eu me lembre é só isso") — as fotos 2 a 7 são livres pra compilação decidir.

### 8. Ciclo de feedback e aprendizado por acúmulo

Usuário testa o resultado, dá feedback → a LLM analisa o feedback, pergunta ao usuário como poderia melhorar → salva a melhoria no vault, **na regra do facet específico envolvido**, não na categoria genérica inteira. Produtos futuros da mesma categoria/combinação de facets já nascem se beneficiando da regra refinada. Mecanismo idêntico ao já usado no resto deste vault — memória estruturada e recuperável, não treinamento de modelo.

## Riscos e perguntas em aberto (levantados na crítica, ainda sem resposta definitiva)

1. **Composição na compilação dinâmica**: quando 2+ facets aplicáveis ao mesmo produto sugerem informações que poderiam disputar espaço/prioridade na compilação das fotos, como isso se resolve? Ainda sem resposta — provavelmente só vai aparecer testando com produto real.
2. **Arbitragem de feedback**: mesmo com a regra escopada por facet (item 4 acima, que já reduz bastante o risco), ainda falta definir quem/o que decide se um feedback específico deve virar regra geral daquele facet ou é só uma exceção daquele produto isolado. Risco: se isso não for bem arbitrado, um caso atípico pode virar regra errada pra todos os produtos futuros daquele facet (mesmo risco conceitual de overfitting em ML de verdade, aplicado a uma regra escrita à mão).
3. **Fronteira exata entre análise técnica e análise contextual**: as 2 foram definidas conceitualmente, mas a linha exata entre elas (o que cada uma cobre) ainda não foi testada na prática.

## Estado (atualizado em 22/08/2026, 16h40)

Fase de idealização considerada suficiente pro núcleo do fluxo — decisão do usuário: parar de hipotetizar e testar com 1 produto real simulando o pipeline passo a passo na prática, já que "tem muita coisa que não vai ser possível ficar idealizando... vamos ter que fazer na tentativa e erro." Nenhum código ou prompt real foi escrito ainda — esta nota registra só a arquitetura conceitual acordada até aqui.

**Escopo do 1º teste, reduzido ao mínimo (16h40)**: em vez de testar as 7 fotos de um produto de uma vez, o usuário decidiu ir bem aos poucos — **1 produto só, e dentro dele só a Foto 1 (capa)**, nada mais por enquanto. Ressalva já registrada nesta mesma conversa: a capa é a foto MENOS dinâmica das 7 (posição e papel fixos, conteúdo provavelmente mais padronizado — produto bem exposto, fundo limpo) — ou seja, este 1º teste valida o início do fluxo (entrada → análise → geração de 1 prompt simples), mas ainda **não** exercita a árvore de categorias por facets nem a compilação dinâmica entre múltiplas fotos, que são as partes mais incertas da arquitetura. Isso é aceito conscientemente como ponto de partida, não como limitação esquecida. Produto específico pro teste **ainda não escolhido** (opções cogitadas na conversa: cadeira de rodas, pulverizador).

## Evolução (22/08/2026, 19h23)

O núcleo desta decisão (não inventar, análise técnica+contextual, aprender por acúmulo) continua valendo, mas o escopo estava errado: pensava a árvore de categorias e o "Padrão Esperado" como algo feito só pra gerar fotos. A sessão seguinte revelou que o problema real é maior — o mesmo entendimento profundo do produto serve pra foto, vídeo, título, descrição e tag, não só foto. Isso foi reformulado em [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]], que substitui os itens 3 e 4 desta nota (Padrão Esperado por categoria/facet e árvore de facets combináveis) por um modelo de 2 grafos ligados por gatilho (classificação + templates de característica), testado com 2 produtos reais.

O que continua valendo sem mudança: os itens 7 (sempre 7 fotos, Foto 1 sempre capa) e 8 (ciclo de feedback por acúmulo) desta nota. O item 5 (bootstrap de categoria nova) também continua válido, só que agora aplicado à criação de nó novo no Grafo 1, não a uma "combinação de facets".

## Relacionado

- [[Visao Geral do Problema de Producao de Imagens e Videos para o Mercado Livre]]
- [[Sistemas Atuais de Geracao de Fotos - GPTs Prontos e We Stack]]
- [[Evolucao do Controle de Contexto e Execucao - Do Prompt de Migracao ao Vault Como Segundo Cerebro]]
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
