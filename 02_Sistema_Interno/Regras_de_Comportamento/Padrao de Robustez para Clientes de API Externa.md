---
tipo: regra
dominio: python
status: ativa
criado: 06/08/2026
atualizado_em: 07/08/2026 01:32
relacionado: [Modelagem de Objeto e Encapsulamento, Padroes de Projeto GoF Quando Usar, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada, Paginacao do Endpoint Manifesto Nota Entrada]
---

# Padrão de Robustez para Clientes de API Externa

Padrão de engenharia que vale pra qualquer cliente de API externa construído neste projeto — hoje `03_Integracao_Sysemp/`, no futuro `04_Integracao_Mercado_Livre/` e qualquer outra que apareça. Fica aqui (em `02_Sistema_Interno/`, não em cada mundo) porque o código de todas essas integrações vive no mesmo repositório — é uma regra de projeto, não de uma API específica.

## Estrutura de pacote

Um pacote por API, isolado do resto do sistema (sem Django, sem conexão com banco, enquanto a integração estiver na fase de exploração isolada). Nome: `api_<nome_da_api>/core`. Dentro dele, 3 responsabilidades separadas em arquivos diferentes — nunca uma classe só fazendo tudo:

- `excecoes.py` — a hierarquia de exceção da API (ver seção abaixo).
- `protecao.py` — a camada de segurança contra chamada excessiva (throttle + backoff), como 2 peças pequenas e testáveis isoladamente, nunca fundidas numa classe só (composição, não herança).
- `cliente.py` — o cliente HTTP fino de fato, que usa as duas peças acima. Nenhuma lógica de negócio aqui, só transporte.

## Transporte nunca sabe de negócio — validação mora no contexto, acesso mora numa Facade

`cliente.py` só sabe fazer 1 chamada HTTP blindada — método público genérico (`chamar(metodo, corpo)`), sem saber o nome de nenhum endpoint real nem o que é parâmetro válido pra ninguém. Erro real cometido na integração Sysemp: colocar validação de parâmetro (período, offset) dentro do cliente de transporte — corrigido depois que o usuário identificou a violação (ver [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]).

3 camadas, sempre assim:

- **Transporte** (`core/cliente.py`) — 1 classe só, reaproveitada por qualquer contexto/endpoint da mesma API.
- **Contexto** (1 arquivo/classe por endpoint ou tema de negócio, fora de `core/`) — compõe o cliente de transporte (nunca herda), dona da validação de parâmetro específica daquele endpoint e dos nomes de campo que a API espera.
- **Ponto de entrada** (Facade, arquivo raiz do pacote, ex: `__init__.py`) — resolve autenticação sozinho ao instanciar, expõe cada contexto por propriedade cacheada (1 instância só, reaproveitada). É o único jeito correto de começar a usar a API.

## Hierarquia de exceção própria, nunca erro genérico

Toda API própria tem sua própria hierarquia, com uma base (`ErroAPI<Nome>`) e subclasses por categoria — porque cada categoria pede uma ação diferente de quem chama:

- Erro de rede (timeout, conexão recusada) — nunca deixar a exceção crua do `requests` escapar sem reembrulhar. É passageiro: permite retry.
- Erro de limite de requisições (429) — passageiro, permite retry com espera.
- Erro de servidor (5xx) — passageiro, permite retry com espera.
- Erro de autenticação (401/403) — não é passageiro. Repetir a mesma chamada com o mesmo token não resolve — falha na hora, sem retry automático.
- Erro de negócio (400 com payload de erro) — não é passageiro. Parâmetro errado não se corrige tentando de novo — falha na hora, sem retry automático.

Motivo de existir essa regra: numa integração de API parecida (Mercado Livre, projeto diferente), erro de rede sem exceção própria foi confundido por um cache com "esse dado não existe" — um timeout passageiro virou um resultado permanente errado. Pra dado fiscal, esse tipo de confusão é ainda mais grave.

## Proteção contra chamada excessiva

Duas peças, sempre as duas, nunca fundidas:

- **Espaçador de chamadas** (proativo) — intervalo mínimo fixo entre uma chamada e a próxima, com espera bloqueante (`sleep`). É o padrão conservador de partida quando ainda não se sabe como a API se comporta sob carga.
- **Cálculo de espera de backoff** (reativo, só entra em ação quando a API responde com erro passageiro) — se a API informar o tempo de espera certo (ex: header tipo `Retry-After`), usa esse valor; se não informar nada, cai pra exponencial com jitter e teto de 30s (nunca deixar a espera crescer sem limite).

Se, com o tempo, se confirmar que uma API específica sempre informa o tempo de espera certo no erro, o espaçador proativo fixo pode ser removido pra essa API — mas só depois dessa confirmação empírica, nunca por suposição.

## Nunca assumir que 1 chamada devolve todos os resultados de um período

Endpoint de listagem pode paginar mesmo sem documentar isso com clareza — um limite silencioso de registros por chamada (ex: ~100), sem avisar que sobrou mais coisa pra buscar. Sempre checar isso antes de confiar que uma janela de datas ampla realmente trouxe tudo: se o endpoint aceita `offset` (ou equivalente), sempre montar um loop que busca página após página até vir uma página vazia — nunca assumir um tamanho de página fixo, incrementar o offset pelo tamanho real da última página recebida. Motivo de existir essa regra: na integração Sysemp, todas as chamadas usaram `offset` fixo (sempre a primeira página), e isso ficou invisível por um tempo — o retorno parecia coerente (nunca dava erro, nunca vinha vazio de verdade), só que incompleto. Ver [[Paginacao do Endpoint Manifesto Nota Entrada]].

## Circuit breaker: não por padrão

Decisão explícita: nenhuma API nova já nasce com circuit breaker (parar de tentar depois de N falhas em sequência). Só se adiciona quando houver dado real de uso que justifique o número de falhas e a política de reset — construir isso sem calibração real é pior do que não ter. Retomar a decisão, por API, dentro do próprio mundo dela, quando/se o uso real pedir.

## Log nunca leva dado sensível

Toda tentativa de chamada gera 1 linha de log (método, nº da tentativa, status retornado) — nunca o token/header de autenticação, nunca o corpo da resposta. Mascarar dado sensível é responsabilidade da função de log em si, nunca de quem chama ela.

## Origem

Decisões consolidadas em 06/08/2026, cruzando 3 relatos (de conversas paralelas, sobre uma integração de API — Mercado Livre — de outro projeto) sobre o que de fato funcionou e o que faltou lá. Os 3 relatos divergiam em detalhe (ex: se existia ou não um espaçamento fixo além do backoff) — tratados como pista, não fato absoluto. Os pontos em que os 3 concordaram entraram como lição confiável aqui: circuit breaker nunca existiu, teste automatizado da camada de proteção nunca existiu, hierarquia de exceção sempre ficou incompleta, gestão de token com ponto único de acesso funcionou bem, e vazamento de dado sensível em log já aconteceu de verdade em pelo menos 2 dos 3 relatos.

## Relacionado

- [[Modelagem de Objeto e Encapsulamento]]
- [[Padroes de Projeto GoF Quando Usar]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
