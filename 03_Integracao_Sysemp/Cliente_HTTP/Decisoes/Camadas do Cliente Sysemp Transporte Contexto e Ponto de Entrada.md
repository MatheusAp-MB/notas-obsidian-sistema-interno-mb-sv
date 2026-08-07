---
tipo: decisao
dominio: python
status: ativa
criado: 06/08/2026
atualizado_em: 06/08/2026 23:11
relacionado: [Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker), Padrao de Robustez para Clientes de API Externa, Modelagem de Objeto e Encapsulamento, Padroes de Projeto GoF Quando Usar]
---

# Camadas do Cliente Sysemp — Transporte, Contexto e Ponto de Entrada

## Erro real cometido (registrado de propósito, não só a versão final)

Na primeira tentativa, a validação de período/offset (regra de negócio do endpoint `listarManifestoNotaEntrada`) foi colocada dentro de `ClienteApiSysemp` — violando o próprio comentário que já dizia "nenhuma lógica de negócio aqui, só transporte". O usuário identificou o erro na hora: "não faz sentido nenhum aquela validação em cliente.py... o cliente.py lida apenas com a conexão da API... cada endpoint se torna o centro de uma classe própria." Motivo de guardar isso: é o tipo de erro fácil de repetir na próxima API (Mercado Livre) se não ficar registrado.

## Decisão final — 3 camadas, cada uma com 1 responsabilidade

- **Transporte** (`core/cliente.py`, `ClienteApiSysemp`) — só sabe fazer uma chamada HTTP blindada (throttle, backoff, exceção por categoria). Método público único: `chamar(metodo, corpo)`. Não sabe o nome de nenhum endpoint real, não sabe o que é um parâmetro válido pra nenhum contexto de negócio.
- **Contexto** (`impostos_entrada_xml.py`, `ImpostosEntradaXML`) — 1 classe por endpoint/tema de negócio (aqui: "Obter impostos de entrada vindos do XML"). Compõe um `ClienteApiSysemp` (nunca herda dele). Sabe o nome real do endpoint (`listarManifestoNotaEntrada`), os nomes de campo que a API espera (`datainicial`/`datafinal`/`offset`), e dona da validação de parâmetro específica desse contexto (período coerente, offset válido). Cada endpoint novo no futuro ganha sua própria classe assim.
- **Ponto de entrada** (`api_sysemp/__init__.py`, `ApiSysemp`) — Facade. Ao instanciar, já resolve a autenticação (token do `.env` da raiz, ou injetado explícito pra teste) e constrói o `ClienteApiSysemp` por dentro. Expõe cada contexto por propriedade (`api.impostos_entrada`), criada 1 vez só e reaproveitada (cache simples no `__init__`). É o único jeito correto de começar a usar a API — nada mais no projeto deveria construir `ClienteApiSysemp` ou carregar o token diretamente.

Resultado prático: o script de exploração (`explorar_manifesto_nota_entrada.py`) virou só `api = ApiSysemp()` + 1 chamada de método + salvar/imprimir o resultado — sem função solta, sem `try/except`, sem `match/case`.

## Por que isso é Facade + Composição, não invenção nova

- **Facade** ("esconder complexidade atrás de método simples") já é padrão validado no projeto (`orquestrador.py`, `criar_proximo()`). `ApiSysemp` é a mesma ideia aplicada à API externa.
- **Composição** ("classe TEM outro objeto dentro") é a regra padrão do projeto pra isso — `ImpostosEntradaXML` e `ApiSysemp` guardam um `ClienteApiSysemp` por dentro, nunca herdam dele.
- Nenhum `Protocol`/`ABC` foi criado — só existe 1 contexto (`ImpostosEntradaXML`) e 1 API (Sysemp) até agora. Interface formal só quando existir mais de 1 classe cumprindo o mesmo contrato de forma intercambiável (Regra dos Três).

## Consequência pra próxima API (Mercado Livre)

Quando a integração de Mercado Livre começar (`04_Integracao_Mercado_Livre/`), esse mesmo modelo de 3 camadas vale de novo: 1 cliente de transporte puro, 1 classe de contexto por endpoint/tema de negócio, 1 Facade de ponto único de entrada por API.

## Relacionado

- [[Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Modelagem de Objeto e Encapsulamento]]
- [[Padroes de Projeto GoF Quando Usar]]
