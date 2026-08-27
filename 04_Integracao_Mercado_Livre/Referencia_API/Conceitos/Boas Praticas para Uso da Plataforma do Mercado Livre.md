---
tipo: conceito
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 21:00
relacionado: [Padrao de Robustez para Clientes de API Externa, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Como Escrever Notas no Vault — Padrao Hiper-Didatico, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]
---

# Boas Práticas para Uso da Plataforma do Mercado Livre

## O quê é esta nota, e por que existe uma "camada superior" separada de endpoint

**O quê**: esta nota faz parte de um estudo estruturado em 2 camadas sobre a API do Mercado Livre, começado em 26/08/2026. A **camada superior** (esta nota é a primeira dela) cobre regras que valem pra **qualquer chamada, não importa qual endpoint** — coisas do "ambiente" da API como um todo. A **camada de endpoint** (ainda não escrita nesta data) cobre o contrato técnico de 1 recurso específico por vez (parâmetros, retorno, regra própria daquele endpoint) e vai morar em notas próprias, irmãs desta, dentro da mesma pasta `Referencia_API/Conceitos/`.

**Por quê estudar nessa ordem**: entender o ambiente antes do endpoint específico evita descobrir uma regra de plataforma (por exemplo, "não pode mandar mensagem automática" ou "existe recomendação de restringir IP") só na hora em que já se está construindo ou testando algo específico — nessa hora, corrigir sai mais caro do que ter sabido antes.

**Pra quê serve esta nota, na prática**: serve pra 2 coisas ao mesmo tempo — (1) auditar se o que já existe no repositório (os comandos `buscar_mlbs`, `buscar_detalhes`, `buscar_dados_sku_completo`) já segue essas regras, e (2) evitar que uma funcionalidade nova, construída no futuro, esbarre numa penalização de conta por desconhecimento da regra.

**Fonte**: documentação oficial do Mercado Livre para desenvolvedores, página "Boas práticas para uso da plataforma" — a própria página informa **última atualização em 30/12/2025**. Se o Mercado Livre atualizar essa página depois dessa data, o conteúdo abaixo pode ficar desatualizado — vale reconferir a doc oficial antes de tratar isso como verdade absoluta e permanente.

## Regras que NÃO afetam o que já construímos hoje (mas podem afetar o que vier depois)

Hoje o projeto só **lê e coleta** dado do Mercado Livre (os 3 comandos de `integracao_mercado_livre/`) — nunca cria, edita ou publica nada na conta do vendedor. Por isso, boa parte da doc de boas práticas — que é toda voltada pra quem **gerencia anúncio** — não nos afeta ainda:

| Regra da plataforma | O que ela exige | Por que não nos afeta hoje |
|---|---|---|
| Mensagens automáticas | Proíbe qualquer mensagem automática/repetitiva/template para comprador; só é permitido usar os "motivos para se comunicar" oficiais, nos cenários específicos previstos pelo Mercado Livre. | Não enviamos nenhuma mensagem via API — os 3 comandos só leem dado (MLBs, detalhes, qualidade, competição). |
| Modificação de template de etiqueta | Proíbe qualquer alteração no template de etiqueta de envio gerado pelo Mercado Livre. | Não geramos nem manipulamos etiqueta de envio. |
| Clonagem de publicação | Não recomenda clonar anúncio nem clonar imagem de anúncio — isso é moderado pelas políticas de publicação do Mercado Livre. | Não criamos nem clonamos nenhum anúncio. |
| Regra por tipo de produto (catálogo, autopeças, moda) | Item elegível a catálogo deve ser publicado em catálogo; autopeças precisam ter compatibilidade associada; moda precisa de tabela de medidas associada. | Não publicamos nada — hoje só **classificamos** um anúncio já existente como Base/Catálogo/Simples (ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]), nunca decidimos nem criamos essa classificação na origem. |

> [!info] Por que registrar regra que "não afeta" mesmo assim
> Se um dia a integração crescer para também publicar ou atualizar anúncio (não é o caso hoje), essas 4 regras passam a valer de verdade — e o vault já vai ter isso mapeado, em vez de alguém descobrir na marra depois de uma conta ser penalizada.

## Regras que JÁ afetam o que construímos hoje — seção "Web Crawler" da doc

Esta seção da doc oficial é a única voltada para quem **consome dado via API** (não quem publica anúncio) — por isso é a parte realmente relevante para os nossos 3 comandos de coleta.

### 1. Proibição de Web Scraping — já cumprida

**O quê**: a doc proíbe coletar dado do Mercado Livre via scraping/crawler (robô lendo a página HTML do site) — todo acesso a dado tem que passar pela API oficial, com autenticação.

**Por quê essa regra existe**: scraping não respeita limite de chamada, pode sobrecarregar o site, e não dá pro Mercado Livre rastrear quem está acessando o quê — é tratado como uso indevido da plataforma.

**Como cumprimos hoje**: todo acesso a dado do Mercado Livre no repositório passa por uma única função central, `chamar_api()`, definida em `api_mercado_livre/core/estrutura_api/cliente_api.py` — nunca existe requisição direta a uma página HTML do site `mercadolivre.com.br`. Confirmado lendo o código-fonte real em 26/08/2026.

### 2. Restrição de IP do token do aplicativo — pendente de verificação

**O quê**: a doc **recomenda** (não obriga) restringir, no painel de developers do Mercado Livre, quais endereços IP têm permissão de usar o access token do aplicativo.

**Por quê**: reduz o estrago se o token vazar — um token vazado só funciona a partir de um IP já autorizado, então um terceiro que descubra o token não consegue usá-lo de outro lugar.

**Pra quê**: proteção adicional, independente de qualquer coisa que o nosso código já faça — essa configuração fica inteiramente do lado do painel do Mercado Livre, não é algo que se resolve escrevendo código.

> [!warning] Status: não verificado
> Ainda não confirmamos se essa restrição de IP está configurada no(s) aplicativo(s) do Mercado Livre usados pelo projeto (contas Magazine e Samvale). Isso não é um bug de código — é uma configuração externa, no painel de developers do Mercado Livre, que precisa ser checada por quem tem acesso a esse painel.

### 3. Erro 429 e distribuição de chamadas ao longo do tempo — cumprida parcialmente (achado real)

**O quê**: a doc pede que a integração identifique o erro HTTP 429 (limite de requisição excedido) e "diminua e/ou melhore a distribuição de requisições realizadas ao longo do tempo" — ou seja, não é permitido simplesmente insistir sem controle quando a API recusa por excesso de chamada.

**Como cumprimos hoje**: `api_mercado_livre/core/estrutura_api/cliente_api.py`, função `_calcular_espera_backoff()` — toda vez que a API responde 429, o código espera antes de tentar de novo: usa o tempo do cabeçalho `Retry-After` quando o Mercado Livre informa esse valor, e se não informar, calcula sozinho um backoff exponencial com variação aleatória (`jitter`), sempre limitado a um teto de 30 segundos. Confirmado lendo o código-fonte real em 26/08/2026 — a chamada dessa função acontece dentro de `chamar_api()`, no bloco que trata `resposta.status_code == 429`.

> [!warning] Achado real — divergência entre o padrão do projeto e o cliente do Mercado Livre
> O padrão de engenharia que o próprio projeto define para qualquer cliente de API externa (ver [[Padrao de Robustez para Clientes de API Externa]]) exige **2 peças sempre juntas**: um **espaçador proativo** (pausa fixa entre toda chamada, não só depois de um erro) e um **backoff reativo** (só entra em ação depois que a API já respondeu com erro). Lendo o código real do cliente do Mercado Livre em 26/08/2026, só a peça reativa existe — não há nenhuma pausa fixa entre uma chamada bem-sucedida e a próxima. Isso não descumpre a doc oficial do Mercado Livre (que só exige reagir ao 429, o que já acontece).
>
> **Decisão tomada em 26/08/2026, 21:33**: não adicionar o espaçador proativo por enquanto — 3 motivos (custo fixo escala mal em execuções grandes, nosso padrão de uso não é contínuo, webhook deve reduzir volume no futuro próximo). No lugar disso, a resposta escolhida pra manter visibilidade sobre o uso da API foi um relatório estruturado de erro (endpoint + tipo de erro + quantidade, a cada execução) — ver [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]].

## Checklist de conformidade (pra reconferir mais tarde)

- [x] Não fazer scraping — confirmado no código, só usamos a API oficial.
- [ ] Restrição de IP do aplicativo no painel do Mercado Livre — não verificado.
- [x] Reagir ao erro 429 com espera — implementado e confirmado no código (`_calcular_espera_backoff()`).
- [ ] Espaçador proativo entre chamadas (pausa fixa, não só reativa) — não implementado no cliente do Mercado Livre hoje, diferente do padrão que o projeto define para si mesmo.

## Relacionado

- [[Padrao de Robustez para Clientes de API Externa]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
