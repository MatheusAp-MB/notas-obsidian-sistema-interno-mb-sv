---
tipo: conceito
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 21:00
relacionado: [Boas Praticas para Uso da Plataforma do Mercado Livre, Padrao de Robustez para Clientes de API Externa, Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Considerações de Design da API do Mercado Livre

## O quê é esta nota, e onde ela entra no estudo em 2 camadas

**O quê**: 2ª nota da **camada superior** do estudo da API do Mercado Livre (a 1ª foi [[Boas Praticas para Uso da Plataforma do Mercado Livre]]). Enquanto aquela cobria regras de **conduta** (o que pode/não pode fazer), esta cobre convenções **técnicas de formato** que se repetem em qualquer endpoint da API — como o erro é formatado, como a paginação funciona, como pedir uma resposta mais enxuta.

**Por quê estudar isso na camada superior, e não em cada endpoint**: essas convenções (formato de erro, paginação, `attributes=`) não são exclusivas de 1 endpoint — são um contrato comum que se repete em vários recursos diferentes da API. Documentar 1 vez aqui evita repetir a mesma explicação em cada nota de endpoint específico.

**Fonte**: documentação oficial do Mercado Livre para desenvolvedores, página "Considerações sobre design" — última atualização em 30/12/2025 (informado pela própria página).

## Formato JSON — padrão, sem novidade

Toda resposta da API vem em JSON (texto legível, leve, padrão aberto). Dá pra inspecionar direto no navegador, no Postman, ou em qualquer client HTTP — inclusive o nosso, via `requests` em `api_mercado_livre/core/estrutura_api/cliente_api.py`. Não muda nada no que já fazemos.

## JSONP — existe, mas não usamos (e tem uma armadilha se um dia usarmos)

**O quê**: se a chamada incluir um parâmetro `callback=nome_da_funcao`, a API embrulha a resposta como uma chamada de função JavaScript, pensada pra ser executada direto num `<script>` de página web (contorna a restrição de CORS de navegador antigo).

**Por quê não usamos**: JSONP é uma técnica pra código que roda **dentro de um navegador**. Nosso código é 100% backend Python (comandos Django via `manage.py`) — nunca faz sentido pedir `callback=` numa chamada nossa.

> [!warning] Armadilha documentada, caso algum dia apareça JSONP no projeto
> A doc é explícita: **toda resposta JSONP sempre vem com HTTP 200**, mesmo quando o resultado real seria um erro (30x, 40x, 50x). O código real (status HTTP verdadeiro) fica **dentro do corpo da resposta**, no primeiro dos 3 valores retornados (`[status, headers, corpo]`) — não no cabeçalho HTTP de verdade. Se algum dia o projeto ganhar uma parte front-end que fale direto com a API do Mercado Livre via JSONP, checar erro pelo HTTP status vai estar sempre errado — precisa ler o status de dentro do JSON.

## Formato padrão de erro — achado real: nosso código não aproveita esse contrato

**O quê**: todo erro da API do Mercado Livre segue um formato fixo:

```json
{
  "message": "human readable text",
  "error": "machine_readable_error_code",
  "status": 400,
  "cause": []
}
```

- `message` — texto pensado pra humano ler.
- `error` — um código estável, pensado pra **código** decidir o que fazer (ex: distinguir "parâmetro inválido" de "recurso não encontrado", mesmo que os 2 deem o mesmo HTTP status).
- `status` — o HTTP status, repetido dentro do corpo.
- `cause` — detalhe extra, quando existe mais de 1 motivo pro erro.

> [!warning] Achado real, confirmado lendo o código-fonte em 26/08/2026 — virou regra formal
> `api_mercado_livre/core/estrutura_api/cliente_api.py` (dentro de `chamar_api()`) **não lê nenhum desses 4 campos** quando um erro não tratado (nem 401, nem 429) acontece — ele só embrulha o texto cru da resposta: `raise ErroAPI(f"Erro {resposta.status_code} em {...}: {resposta.text}")`. Ou seja, hoje qualquer decisão sobre "que tipo de erro foi esse" só pode ser tomada pelo **HTTP status** (400, 404, 500...) — o `error` (código de máquina) e o `cause` (detalhe) ficam perdidos dentro de uma string de texto, nunca estruturados. Confirmei também que nenhum lugar do projeto (`api_mercado_livre/`, `integracao_mercado_livre/`, `mercado_livre/`) faz `resposta.json()["error"]` ou equivalente — o dado existe na resposta da API, mas hoje ninguém usa.
>
> **Decisão em 26/08/2026, 21:33**: isso não ficou como "oportunidade opcional" — virou regra formal do projeto (escopo Mercado Livre): todo erro de chamada à API deve extrair esses 4 campos e ser reportado de forma estruturada. Detalhe completo em [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]. Ainda não implementado — é pendência técnica registrada, não trabalho concluído.

## Redução de resposta com `attributes=` — existe, ainda não usamos

**O quê**: em respostas de **conjunto** (lista de itens, não 1 item só), dá pra passar `?attributes=campo1,campo2` pra API devolver só os campos pedidos, descartando o resto.

**Por quê seria útil pra nós**: o comando 2 (`buscar_detalhes`) busca o detalhe **completo** de cada MLB via multiget (`GET /items?ids=...`, 20 por lote) — hoje ele traz o objeto inteiro de cada item, mesmo que só um subconjunto dos campos seja realmente usado depois (ver `detalhes_mlbs.json`). Confirmei lendo `integracao_mercado_livre/servicos/buscar_detalhes.py` em 26/08/2026: nenhuma chamada usa `attributes=` — sempre pede o item inteiro.

**Otimização possível, ainda não decidida**: se um dia o volume de dado por chamada virar gargalo real (payload grande, tempo de rede), dá pra reduzir cada resposta do multiget só aos campos que `detalhes_mlbs.json` de fato usa. Registro isso como possibilidade, não como decisão — hoje o comando 2 já roda rápido o suficiente (Magazine: 5906 registros em 165,3s), então não há urgência.

> [!info] Sinalizado pelo usuário como estudo futuro importante (26/08/2026)
> Confirmado que este assunto (`attributes=` e redução de payload) fica pendente de estudo mais aprofundado — sem decisão nem implementação agora, mas marcado como relevante o suficiente pra voltar a ele quando estudarmos o endpoint `/items?ids=` em detalhe.

## `OPTIONS` — a própria API se autodocumenta (não usamos, mas existe)

**O quê**: fazer uma chamada HTTP `OPTIONS` (em vez de `GET`) em qualquer recurso devolve um JSON descrevendo aquele recurso — nome, descrição, todos os atributos com explicação, e todos os métodos disponíveis (`GET`, `POST` etc.) com exemplo de uso.

**Pra quê poderia servir**: é uma forma de **descobrir** o formato de um endpoint direto pela própria API, sem depender só da doc escrita (que pode ficar desatualizada). Ainda não usamos isso em nenhum lugar do projeto — fica registrado como ferramenta disponível pra quando formos estudar um endpoint novo e a doc escrita for pouco clara.

## Paginação — `limit` e `offset`, o modo "normal" (diferente do `scan`)

**O quê**: a maioria dos recursos de lista da API pagina com 2 parâmetros — `limit` (tamanho da página) e `offset` (quantos registros pular a partir do início). Todo recurso paginado devolve um bloco `paging` na resposta:

```json
"paging": {
  "total": 285,
  "offset": 0,
  "limit": 50
}
```

**Valores padrão**: sem informar nada, `offset=0` e `limit=50`. Dá pra reduzir (`limit=3`, por exemplo) ou pular pro próximo bloco (`offset=50` pega os registros 51 em diante).

**Como isso se relaciona com o que já estudamos**: esse é o modo **normal** de paginação — diferente do `search_type=scan` que documentamos na nota sobre o endpoint `GET /users/{user_id}/items/search` (usado pelo nosso `buscar_mlbs.py`). O `scan` existe justamente **porque** o modo normal (`limit`/`offset`) trava num teto de 1000 resultados — quando esse teto não é um problema (poucos resultados esperados), o modo normal com `limit`/`offset` é o padrão usado pela imensa maioria dos outros recursos da API.

> [!info] Por que isso importa pra qualquer endpoint novo que vier depois
> A regra que o próprio projeto já define em [[Padrao de Robustez para Clientes de API Externa]] — "nunca assumir que 1 chamada devolve todos os resultados de um período, sempre paginar até vir página vazia" — se aplica exatamente a esse modo `limit`/`offset`. Qualquer endpoint novo que a gente vier a integrar (fora do `buscar_mlbs`, que já usa `scan`) provavelmente vai seguir esse padrão `limit`/`offset` com `paging.total`, e vai precisar do mesmo cuidado de looping até `offset >= total`.

## Relacionado

- [[Boas Praticas para Uso da Plataforma do Mercado Livre]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
