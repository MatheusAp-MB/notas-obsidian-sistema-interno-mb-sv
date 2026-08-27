---
tipo: regra
dominio: 
status: ativa
criado: 27/08/2026
atualizado_em: 27/08/2026 00:15
relacionado: [Sistema de Atributos de Item na API do Mercado Livre, Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre, Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Metodologia de Análise da Documentação da API do Mercado Livre

## O quê é esta regra, e por que ela precisa vir antes de qualquer outra nota de `Referencia_API/`

Esta é a regra que define **o propósito real** de todo o estudo registrado em `Referencia_API/` — não é uma nota de conteúdo sobre a API em si, é a regra de **como pensar** enquanto se lê qualquer documentação do Mercado Livre e se decide o que vai pro vault. Ela vale pras 2 camadas do estudo (superior e endpoint), sem exceção.

## Linha do tempo de como esta regra nasceu — pra nunca se perder o motivo dela existir

1. **26/08/2026, durante o estudo da doc "Atributos"**: eu (Claude) propus descartar a maior parte do conteúdo da doc por ser "só sobre criar/publicar, não sobre ler" — já que o projeto hoje só lê dado do Mercado Livre. O usuário corrigiu na hora, de forma direta: *"Não podemos 'sair descartando' apenas por não ser leitura... nenhum conhecimento é perdido, se bem referenciado, bem escrito, bem categorizado."*
2. **27/08/2026, 00:08**: o usuário generalizou essa correção. Deixou claro que o problema não era uma regra pontual sobre "o que vale no POST tende a valer no GET" — era a **motivação inteira do estudo** estar errada na minha cabeça. Definiu, então, os 3 eixos que aparecem mais abaixo nesta nota, palavra por palavra.
3. **27/08/2026, ~00:12**: ao revisar a 1ª versão desta própria nota, o usuário apontou que ela estava "simplória", "muito cópia" do que ele tinha dito — sem densidade real, sem exemplo, sem desenvolvimento próprio. Pediu reescrita robusta. **Esta é essa reescrita.**

## O que este estudo NÃO é — 2 estudos de caso reais do erro que já aconteceu

Em vez de só afirmar "isso não é uma auditoria", seguem os 2 casos reais, já registrados nesta mesma conversa, onde o erro de fato aconteceu — pra deixar o problema concreto, não abstrato.

### Caso 1 — doc "Publicar produtos": descartei metade da doc usando o critério errado

Ao processar essa doc (26/08/2026), apliquei o filtro "só registro o que é sobre leitura, já que o projeto só lê hoje". Isso gerou a seção "Fora de escopo" dentro da nota [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]], descartando de propósito:

- Regras de construção de título (estrutura recomendada, palavras proibidas, menção a marca de terceiros).
- Regras de categoria, preço, moeda, forma de pagamento, frete no momento da publicação.
- Garantia (`sale_terms`, `WARRANTY_TYPE`/`WARRANTY_TIME`), atributo `GENDER` e sua validação, publicação em Loja Oficial, Mercado Pago obrigatório.
- Aviso sobre "User Products" (novo modelo de publicação que substitui o atual).
- Formato de erro de validação de criação (`department`/`cause_id`/`type`/`code`/`references`).

Sob a metodologia certa (Eixo 3 — "o que CADA endpoint é capaz de fazer"), `POST /items` e `PUT /items` são endpoints tão legítimos de estudo quanto `GET /items?ids=` — o fato do projeto não os chamar hoje é irrelevante pra decidir se valem ser documentados. Cada ponto descartado acima responde a alguma pergunta do Eixo 3 (parâmetro, regra, retorno de erro) pra esses 2 endpoints específicos de escrita. **Essa parte ainda precisa ser reprocessada** — ver a seção de pendência no fim desta nota.

### Caso 2 — doc "Validador de Publicações": descartei a doc inteira

Numa sessão anterior a este trecho da conversa, a doc "Validador de Publicações" foi descartada por inteiro, com o raciocínio "é só sobre criar anúncio, o projeto não publica". Sob a metodologia certa, essa doc muito provavelmente descreve regras de **validação de dado antes de publicar** — conhecimento direto do Eixo 1 (uso validado e seguro da API) e do Eixo 3 (capacidade de 1 endpoint de validação específico), mesmo sem nenhuma relação com os 3 scripts de leitura de hoje. **Essa doc precisaria ser reenviada pelo usuário** — o texto original não está mais disponível nesta conversa pra reprocessamento direto.

> [!warning] O padrão do erro, idêntico nos 2 casos
> Nos 2 casos, o critério de decisão usado foi **"isso é usado pelo projeto hoje?"**, em vez de **"isso ensina algo real sobre a API?"**. Esse é exatamente o padrão de pensamento que esta regra existe pra impedir de se repetir — em qualquer doc futura, de qualquer assunto.

## O que este estudo É — os 3 eixos, aprofundados (não só listados)

Este não é um estudo de manutenção ("nosso código está certo?"). É um estudo de **capacitação**: construir base de conhecimento real o suficiente pra pensar, planejar, executar e trabalhar com a API do Mercado Livre — tanto pro que já existe quanto pro que ainda não foi criado.

### Eixo 1 — Como usar a API bem

**Pergunta central**: se eu fosse escrever código novo contra a API do Mercado Livre agora, o que eu precisaria saber pra não errar?

| Dimensão | O que significa na prática | Exemplo já registrado no vault |
|---|---|---|
| Seguro | Práticas que evitam bloqueio de conta, banimento de aplicativo, exposição de credencial. | Parâmetro de token sempre no corpo (body), nunca na URL — já confirmado certo em `gerenciador_token.py`/`autorizacao_inicial.py`. |
| Otimizado | Recursos nativos da API que reduzem chamada ou payload desnecessário. | `attributes=` (seleção de campo), `search_type=scan` (paginação sem offset), multiget de até 20 IDs por chamada. |
| Eficiente | A forma mais barata/rápida de obter 1 resultado, dado o que a API oferece. | 1 chamada multiget de 20 itens em vez de 20 chamadas individuais — já usado por `buscar_detalhes.py`. |
| Validado | O que é exigido, condicionalmente exigido, ou proibido antes de uma operação ser aceita. | Atributo `conditional_required` (ex: GTIN obrigatório só pra cerveja não-artesanal); dimensão de pacote obrigatória só em ME2 `cross_docking`/`xd_drop_off`. |
| Baseado em doc real | Nunca assumir comportamento por lógica própria — sempre citar a doc oficial ou teste real feito. | Regra mais antiga do processo, em vigor desde o início do estudo — continua sendo a base de tudo. |

### Eixo 2 — Como a API é estruturada, no geral

**Pergunta central**: se alguém completamente novo perguntasse "como essa API é organizada?", eu conseguiria desenhar o mapa completo, sem recorrer a nenhum código nosso?

- **Montagem geral**: existe 1 API só, com recursos que se relacionam entre si — um item pertence a uma categoria, que tem seu próprio schema de atributo; um usuário tem aplicativos, que têm grants, que têm usuários que autorizaram.
- **Funcionamento**: OAuth2 + PKCE por trás de tudo; formato de erro que **varia por caso** (já catalogados 4 formatos diferentes até agora: genérico `message/error/status/cause`, 403 com `code`, OAuth com `error_description`, permissão funcional com `department/cause_id/type/code/references` e com `blocked_by`); 2 tipos de paginação (offset/limit normal × scroll/scan pra grande volume).
- **Endpoints**: o inventário de tudo que já foi mapeado até agora (ver as tabelas de `Referencia_API/Endpoints/` no índice do mundo) — e a consciência explícita de que o inventário está incompleto, não é o mapa final da API inteira.
- **Filtros**: cada endpoint de busca tem seu próprio conjunto de filtro — `status`, `logistic_type`, `listing_type_id`, `tags=`, `sku=`, `seller_sku=`, `reputation_health_gauge=`, `missing_product_identifiers=` — o conjunto não é universal nem intuitivo, precisa ser levantado endpoint por endpoint, na doc de cada um.
- **Regras**: comportamentos gerais que atravessam vários endpoints — 206 parcial com `X-Content-Missing`, retrocompatibilidade de campo antigo (`condition` → `item_condition`), obrigatoriedade condicional.
- **Parâmetros**: formato exato de cada parâmetro — se vai em query string, path ou corpo; que tipo de dado é esperado; que valores são aceitos.

### Eixo 3 — O que CADA endpoint é capaz (ou não) de fazer, individualmente

**Pergunta central**: se eu escolhesse qualquer endpoint já estudado, eu conseguiria responder todas as perguntas abaixo só com o que já está escrito no vault, sem precisar consultar a doc de novo?

| Pergunta | Por que importa |
|---|---|
| Quais endpoints existem? | Inventário — impossível planejar funcionalidade nova sem saber o que a API já resolve nativamente. |
| O que cada um faz? | Propósito — evita reinventar, com lógica própria, algo que a API já entrega pronto. |
| Como chamar o endpoint? | Método HTTP, caminho exato, forma de autenticação exigida. |
| Quais seus parâmetros? | Obrigatório vs opcional, tipo de dado, onde ele vai na requisição. |
| Como é sua estrutura? | Formato da resposta: objeto único, lista simples, lista "verbose" (`{code, body}`), paginado ou não. |
| Quais seus filtros? | O que dá pra restringir já na própria chamada, sem precisar filtrar depois no nosso código. |
| Quais são seus retornos? | Sucesso **e** erro — sempre os 2 lados, nunca só o caminho feliz. |
| Quais otimizações podem ser realizadas? | Tudo que evita chamada ou payload desnecessário — seleção de campo, multiget, scan em vez de offset, filtro nativo em vez de filtro no nosso código. |

> [!success] Exemplo de aplicação correta já feita — [[Sistema de Atributos de Item na API do Mercado Livre]]
> Essa nota é o modelo do que "fazer certo" parece na prática: documentou o schema completo de atributo, os 5 `value_type`, as 17 tags de comportamento (com matriz de exclusão/implicação), a obrigatoriedade condicional, o mecanismo de N/A, e até o endpoint de "valores mais usados" (`top_values`) — **nenhum** desses pontos é usado pelo código do projeto hoje, e mesmo assim todos foram registrados, porque cada um responde a uma pergunta real do Eixo 3 sobre um recurso real da API. É o oposto exato do que aconteceu no Caso 1 acima.

## Protocolo prático — como processar qualquer doc nova, a partir de agora

1. **Ler a doc inteira antes de decidir qualquer coisa** — nunca julgar relevância por título de seção ou por 1 trecho isolado.
2. **Mapear cada parte da doc contra os 3 eixos** — pra cada informação nova, perguntar: isso é Eixo 1 (uso), Eixo 2 (estrutura geral), ou Eixo 3 (capacidade de 1 endpoint específico)? Praticamente todo conteúdo técnico cai em pelo menos 1 dos 3 — o que não cai em nenhum (ex: texto jurídico dos Termos e Condições do Programa de Desenvolvedores, já descartado corretamente antes por não ensinar nada sobre a API em si) pode continuar fora.
3. **Cruzar com o código real do projeto sempre que fizer sentido** — como exemplo e grounding, nunca como filtro de inclusão. Ver a distinção exata na seção de sinais de alerta, abaixo.
4. **Nunca descartar por "não é leitura" ou "não usamos isso hoje"** — esses 2 critérios estão proibidos como justificativa de descarte a partir de agora.
5. **Apresentar achados, cruzamentos e ambiguidades pro usuário antes de escrever** — regra de processo já em vigor desde 26/08/2026, continua valendo integralmente junto com esta metodologia.
6. **Perguntar data e hora antes de escrever** — regra já em vigor, inalterada.
7. **Escrever com densidade alta** — sempre com exemplo concreto, tabela quando fizer sentido, e cruzamento com código quando existir; nunca só parafrasear a doc ou parafrasear o que o usuário disse numa conversa.

## Sinais de alerta — frases que indicam que eu caí de volta na mentalidade de auditoria

Se, ao processar uma doc nova, eu me pegar pensando ou escrevendo qualquer uma destas frases, é sinal de que preciso parar e reavaliar antes de descartar qualquer coisa:

- "Isso não afeta a gente hoje."
- "Fora de escopo, porque é sobre criação/publicação, não leitura."
- "Não usamos isso, então não preciso registrar."
- "O projeto só lê, então vou pular a parte de escrita."

Nenhuma dessas frases, sozinha, é motivo suficiente pra descartar conteúdo. A pergunta certa substitui todas elas: **"isso me ajuda a entender e trabalhar bem com essa API, hoje ou no futuro?"**

## Como esta regra se conecta com as outras regras já em vigor no vault

- **Discutir antes de escrever** (regra de processo, em vigor desde 26/08/2026): continua exigindo que eu apresente achados e ambiguidades antes de qualquer escrita — esta metodologia só muda **o que** entra na lista de achados a discutir, não o processo de confirmação em si.
- **Perguntar data e hora antes de escrever**: inalterada, continua valendo pra toda escrita no vault, incluindo as motivadas por esta metodologia.
- **Padrão Hiper-Didático** ([[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]): a densidade alta exigida por esta metodologia (exemplo real, tabela, cruzamento com código) é a mesma densidade já exigida pelo padrão hiper-didático — as 2 regras se reforçam, não competem nem se sobrepõem de forma conflitante.

## Pendência aberta — revisão retroativa necessária

- **Doc "Publicar produtos"**: o conteúdo descartado no Caso 1 acima ainda precisa ser reprocessado sob esta metodologia. O texto completo da doc ainda está disponível nesta própria conversa — não precisa ser reenviado pelo usuário, só reprocessado quando houver confirmação pra isso.
- **Doc "Validador de Publicações"**: descartada por inteiro numa sessão anterior a este trecho da conversa. O texto não está mais disponível — precisa ser reenviada pelo usuário, se ele quiser essa doc reprocessada sob a metodologia atual.

## Relacionado

- [[Sistema de Atributos de Item na API do Mercado Livre]] — exemplo de aplicação correta, e a nota que motivou esta regra ser escrita.
- [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]] — contém o Caso 1 (conteúdo pendente de reprocessamento).
- [[Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
