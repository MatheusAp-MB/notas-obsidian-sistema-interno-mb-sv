---
tipo: decisao
dominio: 07_Sistema_Relatorio_Devolucoes
status: implementada
criado: 17/09/2026
atualizado_em: 17/09/2026 18:28
relacionado: [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]], [[Consultar Pedido Passa a Aceitar NF, Nome e Endereço Além do Número — Escopo Fechado e Validado Contra a Prioridade da Ana]], [[Boas Praticas para Uso da Plataforma do Mercado Livre]]
resumo: Tela Consultar Pedido vira o centro do sistema — busca por ID do Cliente ou Número da Venda (2 campos), fallback Pedido→Pack por tentativa direta, lista de desambiguação com agrupamento visual por Pack ID quando há mais de 1 pedido, avisos explícitos sempre que resolve sozinho pra 1 pedido (cliente único ou pack único). Implementado e validado contra 6 cenários reais (17/09/2026, noite) — incluindo a descoberta de um rate limit real (429) na API do ML durante os testes, corrigido com espaçador proativo + backoff reativo (novo `protecao.py`), revertendo uma decisão de 26/08/2026 que não fazia mais sentido pro uso interativo desta tela. Melhorias de UX descobertas no caminho: botão desabilitado no clique, overlay de carregamento, e bloqueio de busca quando os 2 campos são preenchidos juntos (Cenário 6 redefinido de "prioriza cliente" pra "bloqueia e avisa"). Ciclo completo (Idealizar → Planejar → Executar → Analisar → Corrigir → Validar) fechado.
---

# Consultar Pedido Vira o Centro do Sistema — Busca por Pedido, Cliente ou Pack, com Lista de Desambiguação Antes do Detalhe

## Contexto

Depois de confirmar, na investigação registrada em [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]], que o código ao lado do nome do cliente na etiqueta é o `buyer.id` (e que um número que parece "Pedido" às vezes é na verdade um Pack ID), Matheus propôs deliberadamente sair do olhar técnico/API e pensar no problema real da Ana antes de qualquer Planejar de tela.

## A dor real (ponto de partida)

"Precisamos resolver a dor dela: preciso encontrar essa devolução desse pacote que está na minha mão da forma mais prática possível." Esse enunciado, já registrado antes, foi retomado explicitamente aqui como critério de decisão pra tudo que segue.

## Visão consolidada — o funil de 3 desfechos

A tela "Consultar Pedido" deixa de ser só uma busca por número de pedido e passa a ser o centro inicial de todo o sistema — o ponto único de entrada quando um pacote chega nas mãos da Ana. Uma busca só, aceitando 2 formatos de entrada (número do pedido OU ID do cliente), resolvendo em 3 desfechos possíveis:

1. **Número do pedido direto** → comportamento de hoje, sem nenhuma mudança: cai reto no detalhe completo que já existe.
2. **ID do cliente, com só 1 pedido relevante** → mesmo detalhe completo de sempre, só que chegando por um caminho novo — sem pedir escolha, porque não há ambiguidade.
3. **ID do cliente (ou Pack ID), com mais de 1 pedido** → aparece uma camada nova: uma lista resumida de todos os pedidos relevantes, pra ela escolher com base no que reconhece do produto físico na mão. Ao escolher um item da lista, abre o mesmo detalhe completo de sempre.

A lógica por trás do item 3, nas palavras de Matheus: o sistema é honesto sobre o que não sabe — "eu não sei o que está na sua mão, por isso te dou o máximo de informação que eu tenho, organizada, resumida e coerente, pra você escolher a correta; depois disso eu te mostro tudo que você pode obter sobre essa devolução em específico."

## O que entra no resumo de cada pedido na lista de desambiguação

Usando só o que já foi confirmado via API (nenhum campo novo, nenhuma suposição):

- Data do pedido (ordenação cronológica, já feita no script de validação)
- Nome do item/produto — o dado mais forte pra bater visualmente com o que está na mão dela
- Classificação (sem problema / com reclamação / com devolução)
- Número do pedido, pra quem quiser conferir contra o que estiver legível na etiqueta
- Indicação de Pack (quando o pedido fez parte de uma compra em conjunto com outro(s))

## Onde o Pack ID se encaixa

Quando o código disponível é direto um Pack ID (em vez do ID do cliente), a mesma lista de desambiguação nasce naturalmente mais precisa — já vem filtrada só pros pedidos daquele carrinho/pacote específico, em vez do histórico inteiro do cliente. Mesma tela, mesma lógica, entrada mais cirúrgica.

## Confirmado — a tela de detalhe é 100% reaproveitada

Confirmado explicitamente por Matheus: o "detalhe completo" que abre ao escolher um item da lista é exatamente a mesma tela e estrutura que já existe hoje pra quando alguém busca direto pelo número do pedido. Nenhuma tela de detalhe nova — só 2 portas de entrada novas (cliente e pack) que convergem pro que já existe, com uma tela intermediária de desambiguação só quando ela é genuinamente necessária.

## Planejar — Ponto 1 Resolvido: 2 Campos de Busca, Fallback Pedido→Pack com Aviso Explícito (17/09/2026, noite)

- **Decisão**: em vez de detectar automaticamente se o número digitado é Pedido, Cliente ou Pack por formato (heurística com risco real, já que Pedido e Pack têm exatamente o mesmo formato — 16 dígitos, prefixo "2000..."), a busca vai ter 2 campos distintos: **"ID do Cliente"** e **"Número da Venda"**. Ela escolhe qual preencher, sem ambiguidade nenhuma entre cliente e os outros 2.
- **Dentro do campo "Número da Venda"**: a única ambiguidade que resta é Pedido vs Pack (mesmo formato) — resolvida por tentativa direta: tenta primeiro como Pedido (`GET /orders/{id}`); se der erro (404, `order_not_found`), tenta automaticamente como Pack (`GET /packs/{id}`) — o mesmo fallback manual já validado na prática com o caso da Claudia, agora embutido no fluxo da tela.
- **Quando o fallback pro Pack acontece, a tela avisa isso de forma explícita** pra ela — nunca de forma silenciosa/disfarçada. Ex.: "esse número é de um pacote com N pedidos, veja abaixo." Mantém a mesma lógica de transparência já definida antes (o sistema é honesto sobre o que sabe/não sabe).
- Fecha o Ponto 1 do Planejar dessa decisão. Os pontos 2 (desenho da tela de lista) e 3 (mudanças reais em views/urls/template) continuam abertos.

## Executar — Implementação Real (17/09/2026, noite)

Aprovado o rascunho inicial do mockup ("gostei do rascunho inicial, vamos começar aplicando ele... depois polimos"), a implementação foi direto pro código real, sem uma rodada de polimento visual antes.

**Backend** (`integracao_mercado_livre/views.py`): `_classificar_pedido_leve()` reaproveita a mesma lógica de reclamação→devolução que a tela de detalhe já usava, numa versão leve pra classificar vários pedidos de uma vez (sem buscar todos os detalhes que a tela de detalhe busca pra 1 pedido só). `_listar_pedidos_do_cliente()` busca via `/orders/search?seller=&buyer=`. `_resolver_pack()` busca via `/packs/{id}` — que só devolve `id`/`static_tags` por item, exigindo 1 chamada extra a `/orders/{id}` por pedido do pack pra pegar título/data. `view_consultar_pedido()` foi reescrita pra aceitar `numero_pedido` OU `id_cliente`, com o fallback Pedido→Pack por tentativa direta: tenta `GET /orders/{id}` primeiro, e só cai pro Pack quando a mensagem de erro começa com "Erro 404 " (formato determinístico de `ErroAPI`, confirmado lendo o código-fonte de `cliente_api.py`).

**Template** (`consultar_pedido.html`): os 2 campos de busca (ID do Cliente / Número da Venda), o banner de aviso de pack (`aviso_pack`) e a lista de desambiguação (`lista_pedidos`) — reaproveitando 100% a tela de detalhe existente pra quando resolve em 1 pedido só, como já confirmado no Idealizar.

## Analisar + Corrigir — 2 Achados Reais no Cenário 1 (17/09/2026, noite)

Testando o Cenário 1 (ID Cliente `443851581`, Rafael, 2 pedidos reais) contra a implementação inicial, apareceram 2 problemas reais:

1. **Bug de ordenação por data** — a lista ordenava pela data já formatada em texto (`dd/mm/aaaa`), que quebra ao comparar datas que cruzam mês/ano (comparação de string, não de data real) — funcionou por coincidência no teste porque os 2 pedidos do Rafael eram do mesmo mês.
2. **Agrupamento visual por Pack ID** — Matheus lembrou que o site do próprio Mercado Livre mostra pedidos do mesmo Pack agrupados visualmente, e pediu o mesmo aqui, em vez de só uma tag textual "mesmo pack" ao lado de cada item.

Os 2 problemas foram resolvidos juntos numa função nova, `_agrupar_e_ordenar_pedidos()`: guarda a data ISO original (`data_ordenacao`) em cada pedido (em vez de só a formatada) e ordena por ela; agrupa pedidos que compartilham `pack_id` (só quando 2+ do grupo aparecem na mesma lista) em blocos visuais (`.grupo-pack` no template/CSS, com cabeçalho "Compra em conjunto — Pack X (N pedidos)").

**Achado colateral, documentado com transparência**: no caso real do Rafael, só 1 dos 2 pedidos tinha `pack_id` preenchido — ou seja, pela API, esses 2 pedidos específicos não compartilham pack, então não agruparam visualmente mesmo depois do fix (comportamento correto, não um bug). A lembrança de Matheus sobre o site do ML pode refletir um mecanismo de agrupamento diferente, não necessariamente `pack_id` — fica como um fio solto dele pra conferir por conta própria, sem bloquear esta decisão.

## Achado de Robustez — Rate Limit Real (429) e Reversão de Decisão Anterior (17/09/2026, noite)

Testando repetidamente o Cenário 1 (inclusive de propósito, clicando várias vezes seguidas em "Buscar" pra tentar forçar erro), apareceram avisos reais de `429` vindos de `/post-purchase/v2/claims/{id}/returns` — a busca por cliente, ao classificar N pedidos em sequência, virou uma rajada de chamadas sem nenhum espaçamento entre elas, batendo no limite de requisição do Mercado Livre.

Investigado contra 2 notas já existentes no vault: [[Boas Praticas para Uso da Plataforma do Mercado Livre]] (que registra, desde 26/08/2026, a decisão consciente de NÃO adicionar um espaçador proativo no cliente do ML) e [[Padrao de Robustez para Clientes de API Externa]] (que define o espaçador proativo como padrão-base de qualquer cliente de API externa do projeto, só dispensável depois de confirmação empírica de que a API sempre informa o tempo de espera certo no erro — confirmação que nunca existiu pro Mercado Livre; os tempos de espera observados no log batiam com o fallback exponencial do código, não com um `Retry-After` confiável vindo da API).

**Decisão**: reverter a decisão de 26/08/2026 especificamente pro cliente do Mercado Livre deste projeto (Sistema de Relatório de Devoluções). 2 dos 3 motivos originais deixaram de valer: o uso não é mais só em lote (virou uso interativo e frequente, com a tela virando centro do sistema); e o webhook que reduziria volume não existe e não tem previsão de existir (confirmado por Matheus). O 3º motivo (custo escala mal em execuções grandes) não se aplica aqui porque os scripts de coleta em massa (`buscar_mlbs`, `buscar_detalhes`) são de um projeto totalmente isolado (Sistema Interno V2) — não compartilham código com este.

**Implementação**: novo arquivo `api_mercado_livre/core/estrutura_api/protecao.py`, com 2 peças separadas e testáveis isoladamente (nunca fundidas), exatamente como a regra do projeto pede: `EspacadorChamadas` (proativo, intervalo mínimo de 0,4s por conta — MB e SV têm limites independentes) e `calcular_espera_backoff()` (reativa, movida de `cliente_api.py` sem mudar a lógica). `chamar_api()` ganhou o parâmetro `espacador_ativo` (padrão `True`), então nenhum chamador existente (nem os scripts de exploração) precisou mudar.

**Resultado testado**: o mesmo Cenário 1, repetido 7+ vezes seguidas de propósito, não gerou nenhum warning de 429 depois da mudança.

Ver [[Boas Praticas para Uso da Plataforma do Mercado Livre]] pra a atualização do checklist de conformidade com essa reversão.

## Melhorias de UX Descobertas Durante o Teste (17/09/2026, noite)

- **Botão "Buscar" desabilitado no clique** — evita disparar buscas duplicadas (e chamadas reais à API desperdiçadas) quando alguém clica mais de uma vez impacientemente; descoberto quando o teste de estresse do Cenário 1 gerou "Broken pipe" no servidor por clique repetido antes da página anterior terminar de carregar.
- **Overlay de "buscando"** — cobre a tela inteira com spinner e mensagem contextual ("Buscando informações sobre X, aguarde...") enquanto a busca (recarregamento de página completo) está em andamento.
- **Avisos explícitos de resolução única** — tanto pro fallback de Pack (`aviso_pack`, quando resolve pra 1 pedido só dentro do pacote) quanto pra busca por Cliente (`aviso_cliente_unico`, novo) — nunca redireciona silenciosamente sem dizer o porquê, mesma lógica de transparência já definida no Idealizar.
- **Validação de campos mutuamente exclusivos** — descoberta no Cenário 6 (ver "Validar" abaixo): preencher ID do Cliente E Número da Venda ao mesmo tempo não deve escolher 1 dos 2 silenciosamente. Bloqueia a busca (no navegador, antes mesmo de enviar; e no servidor, como proteção extra) e avisa pra preencher só 1 campo.

## Validar — 6 Cenários Testados Contra Dados Reais (17/09/2026, noite)

| # | Entrada | Esperado | Resultado |
|---|---|---|---|
| 1 | ID Cliente `443851581` (Rafael) | Lista com 2 pedidos | OK — validado inclusive sob teste de estresse (7+ buscas seguidas, sem 429) |
| 2 | ID Cliente `608187118` (Tancredo) | Direto pro detalhe (1 pedido só) | OK — com aviso explícito (`aviso_cliente_unico`) |
| 3 | Número da Venda `2000017788033354` (Edgar) | Direto pro detalhe, comportamento original | OK — sem mudança nenhuma |
| 4 | Número da Venda `2000014649100973` (Claudia) | Fallback pra Pack, resolve em 1 pedido | OK — com os 2 avisos combinados (é pack + resolveu direto) |
| 5 | Número da Venda `1234567890123456` (inválido) | Erro claro, nem pedido nem pack | OK |
| 6 | Os 2 campos preenchidos ao mesmo tempo | *(redefinido durante o teste)* Bloquear e avisar | OK — expectativa original era "prioriza ID do Cliente"; corrigido pra bloquear, porque prioridade silenciosa esconderia da Ana qual critério foi usado de fato |

Todos os 6 cenários passaram. Ciclo completo (Idealizar → Planejar → Executar → Analisar → Corrigir → Validar) fechado pra essa decisão.

## Em aberto

- [x] Planejar como a busca distingue Pedido, ID de cliente e Pack ID — **resolvido em 17/09/2026**: 2 campos de busca separados (ID do Cliente / Número da Venda) eliminam a ambiguidade entre cliente e os outros 2; dentro de "Número da Venda", a ambiguidade Pedido-vs-Pack é resolvida por tentativa direta na API (Pedido primeiro, Pack como fallback em erro), com aviso explícito pra ela quando o fallback acontece. Ver "Planejar — Ponto 1 Resolvido".
- [x] Planejar o desenho real da tela de lista de desambiguação — **resolvido em 17/09/2026**: mockup gerado, aprovado como rascunho inicial e implementado direto em código real (ver "Executar" acima).
- [x] Planejar as mudanças em `views.py`/`urls.py`/template da tela Consultar Pedido pra suportar os 3 desfechos — **resolvido em 17/09/2026**: implementado e validado contra os 6 cenários reais (ver "Validar" acima).

## Relacionado

- [[Ideia — Etiqueta de Envio do ML Pode Esconder um Código Curto Bipável pra Achar a Devolução Rápido]]
- [[Consultar Pedido Passa a Aceitar NF, Nome e Endereço Além do Número — Escopo Fechado e Validado Contra a Prioridade da Ana]]
