---
tipo: descoberta
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 23:00
relacionado: [Gerencie seu Aplicativo na API do Mercado Livre, Boas Praticas para Uso da Plataforma do Mercado Livre, Erro 403 (Forbidden) da API do Mercado Livre, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Autenticacao e Autorizacao na API do Mercado Livre]
---

# Achados Reais na Configuração dos Aplicativos Mercado Livre (Magazine e Samvale)

## O quê é esta nota, e de onde veio o dado

**O quê**: resultado real de chamar `GET /applications/$APP_ID` e `GET /applications/v1/$APP_ID/consumed-applications` pras 2 contas (Magazine/MB e Samvale/SV), em 26/08/2026, durante o estudo do tópico "Gerencie seu Aplicativo" da camada superior (ver [[Gerencie seu Aplicativo na API do Mercado Livre]]). O código exato usado pra gerar esse dado está documentado lá, na seção "Como testar esses 2 endpoints no nosso projeto" — não repetido aqui, pra não duplicar.

**Por quê as 2 contas**: a Magazine foi testada primeiro; a Samvale, inicialmente adiada por decisão de não misturar dado na mesma leitura, acabou sendo testada também na mesma sessão. Esta nota já reflete as 2 contas juntas, com uma seção de comparação.

**Nota sobre privacidade**: o campo `id` (identificador numérico de cada aplicativo) foi omitido por decisão do usuário ao compartilhar os resultados — não está registrado aqui, nem pra Magazine nem pra Samvale.

## Confirmado: são 2 aplicativos isolados, por decisão de arquitetura do próprio Mercado Livre

Magazine e Samvale são 2 contas de vendedor completamente separadas dentro do Mercado Livre, cada uma com seu próprio aplicativo cadastrado no DevCenter — **não existe 1 app único compartilhado entre as 2** (confirmado com o usuário, 26/08/2026: "é assim que o ML funciona... são 2 contas isoladas, cada uma com seus apps de API próprios").

| | Magazine (MB) | Samvale (SV) |
|---|---|---|
| Nome do app | `ML Analytics HUB` | `ML Analytics HUB SAMVALE` |
| Criado em | 24/06/2026 | 05/08/2026 |
| Origem | Reaproveitado do projeto legado (ver achado abaixo) | Criado dedicado, poucos dias antes do mundo `04_Integracao_Mercado_Livre` ser aberto no vault (06/08/2026) |
| `sandbox_mode` | `False` | `True` |

## Achado comum às 2 contas — `max_requests_per_hour: 18000`

Idêntico nas 2: 18.000 chamadas por hora (300/min, 5/s). Usado em [[Gerencie seu Aplicativo na API do Mercado Livre]] pra dar régua real à decisão sobre espaçador proativo de chamadas.

## Achado comum às 2 contas — callback de webhook aponta pra serviço de teste, não pra endpoint real (o mais importante)

Os 2 apps têm `callback_url`/`callback_urls` apontando pra:

```
https://webhook.site/a99082ad-168d-40b4-a0d9-4fd72eb6566a
```

— **a mesma URL de teste nos 2 apps**, sugerindo que foi configurado de uma vez só, no mesmo momento, pras 2 contas. Já o campo `notifications_callback_url` (o que de fato recebe a notificação push) é diferente em cada app: Magazine usa a mesma URL acima; Samvale usa `https://webhook.site/d8fa5280-bc34-4ddf-8be3-02e8b39882e0` (sessão de teste diferente).

Os 2 apps estão inscritos numa lista extensa de tópicos reais de notificação (pedidos, mensagens, itens, preços, reclamações, envios, e mais — lista completa idêntica em espírito nas 2 contas, com pequenas variações). Como os 2 apps estão `active: True`, `blocked: False`, `disabled: False`, **o Mercado Livre já está mandando notificação de verdade pras 2 contas, agora, pra URLs de teste que ninguém lê**.

> [!warning] Ação necessária antes de qualquer plano de webhook avançar
> Vale pras 2 contas: `callback_url`/`callback_urls`/`notifications_callback_url` precisam apontar pra um endpoint real do nosso sistema (provavelmente dentro de `02_Sistema_Interno/`) antes de qualquer plano de usar webhook pra reduzir chamada bruta à API (ver decisão em [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]) fazer sentido. Ainda sem decisão de quando resolver.

## Achado comum às 2 contas — confirmado: nenhum escopo `urn:mp:...` (Mercado Pago)

Nenhuma das 2 listas de escopo (ver diferença de escopo abaixo) tem qualquer prefixo `urn:mp:`. Confirma, com prova real nas 2 contas, que o prazo de separação Mercado Livre/Mercado Pago (30/08/2026) não afeta o projeto.

## Diferença 1 — `sandbox_mode` diferente entre as contas, sem explicação conhecida

Magazine: `sandbox_mode: False`. Samvale: `sandbox_mode: True`. Perguntado ao usuário em 26/08/2026, 22:24 — resposta: **não há explicação conhecida pra essa diferença** ("eu também não faço ideia"). Como a Samvale já devolveu dado real de produção em testes anteriores (3280 MLBs, 3545 registros de detalhe, ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]), esse flag **não parece bloquear funcionalidade na prática** — mas fica registrado como fato sem explicação, não como problema resolvido.

## Diferença 2 — escopo concedido não é idêntico entre as 2 contas

A Samvale tem 4 escopos que a Magazine não tem: `urn:ml:mktp:metrics:/read-only`, `urn:global:admin:users:/read-write` (Magazine só tem a versão `read-only` deste), `urn:ml:vis:comunication:/read-write`, `urn:ml:vis:publish-sync:/read-write`.

> [!info] Reconhecido como inconsistência, sem correção agora
> Confirmado com o usuário (26/08/2026, 22:24): "deveriam estar [iguais], mas ok" — ou seja, o esperado seria os 2 apps terem exatamente o mesmo conjunto de escopo, já que servem ao mesmo propósito (coleta de dado pra 2 empresas do mesmo grupo). A divergência é reconhecida como real, mas registrada só pra conhecimento — sem decisão de corrigir agora.

## Decodificando os escopos — o que cada `urn:ml:mktp:...` realmente permite

A doc "Permissões funcionais" (última atualização 21/11/2025) nomeia as categorias de permissão configuráveis no DevCenter, com a lista de recursos que cada uma libera. Cruzando os nomes de recurso da doc (`items`/`pictures`/`prices`, `questions`/`messages`/`claims`/`returns`, `Advertising`, `trends`/`highlights`/`visits`, `orders`/`shipments`, `offers`/`deals`, `invoices`/`billing`) com os escopos reais vistos nos nossos 2 apps, dá pra montar o mapa completo:

| Permissão funcional (nome no DevCenter) | Escopo correspondente | Magazine | Samvale |
|---|---|---|---|
| Usuários (default, ativa em todo app) | `read`, `write`, `offline_access` | Sim | Sim |
| Publicação e sincronização | `urn:ml:mktp:publish-sync:/read-write` | Sim | Sim |
| Comunicação pré e pós-venda | `urn:ml:mktp:comunication:/read-write` | Sim | Sim |
| Publicidade | `urn:ml:mktp:ads:/read-write` | Sim | Sim |
| Métricas do negócio | `urn:ml:mktp:metrics:/read-only` | **Não** | **Sim** |
| Vendas e envios | `urn:ml:mktp:orders-shipments:/read-write` | Sim | Sim |
| Promoções, cupons e descontos | `urn:ml:mktp:offers:/read-write` | Sim | Sim |
| Faturamento | `urn:ml:mktp:invoices:/read-write` | Sim | Sim |

> [!info] O que isso muda no entendimento da Diferença 2
> Agora o escopo extra da Samvale (`urn:ml:mktp:metrics:/read-only`) tem nome e função conhecidos: é a permissão "Métricas do negócio" — dá acesso a tendência de venda, destaque e visita do anúncio. A Magazine não tem essa permissão habilitada; se um dia for preciso puxar esse tipo de métrica pras 2 empresas, o app da Magazine precisaria dela adicionada antes.
>
> Também fica mais preciso o achado de "escopo mais amplo que o necessário": hoje os 3 comandos só usam "Publicação e sincronização" (leitura de item) e "Usuários" (default, leitura de dado de conta). As outras 5 categorias — Comunicação, Publicidade, Vendas e Envios, Promoções e Faturamento — estão concedidas com **leitura E escrita completas**, nas 2 contas, sem nenhum uso hoje.

## Achado por conta — saúde confirmada nas 2

Magazine: `active: True`, `blocked: False`, `disabled: False`. Samvale: `active: True`, `blocked: False`, `disabled: False`.

> [!info] Descarta 1 das 7 causas de 403 já mapeadas, pras 2 contas
> Em [[Erro 403 (Forbidden) da API do Mercado Livre]], a causa "aplicativo bloqueado ou desabilitado" agora está confirmada como **não é essa a causa**, pra Magazine e pra Samvale.

## Consumo (métrica D-1) — mesmo padrão de atraso nas 2 contas

Magazine: 4 chamadas no total (2× status 200, 2× status 401), janela 01/08 a 25/08. Samvale: 6 chamadas no total (6× status 200, 0 erro), mesma janela. As 2 refletem só atividade bem antiga (início da migração) — **nenhuma reflete o trabalho pesado de hoje** (26/08), pelo mesmo motivo já registrado em [[Gerencie seu Aplicativo na API do Mercado Livre]]: a métrica tem 1 dia de atraso (D-1), e o `date_end` usado foi 25/08. Reforça de novo, com as 2 contas, a prioridade da Regra 2 (relatório próprio, em tempo real) sobre essa métrica nativa (agregada, atrasada).

## Achado exclusivo da Magazine — aplicativo reaproveitado do projeto legado "ML Analytics HUB"

O app da Magazine foi criado em `2026-06-24T11:12:07`, quase 3 semanas antes da migração desta integração começar (12/08/2026). A descrição registrada bate com o escopo do projeto antigo `03_ML_Analytics_HUB` (hoje congelado em `LEGADO/`), não com um aplicativo criado do zero pra esta integração nova — ou seja, a Magazine reaproveita um app antigo; a Samvale ganhou um app novo e dedicado (ver tabela no início desta nota).

## Outras confirmações técnicas (menor relevância, comuns às 2 contas)

- `use_pkce: True` nas 2 — confirma que o fluxo PKCE está habilitado nos 2 aplicativos, batendo com a implementação vista em `autorizacao_inicial.py` (ver [[Autenticacao e Autorizacao na API do Mercado Livre]]).
- `allow_flow: [authorization_code, client_credentials, refresh_token]` nas 2 — os 2 primeiros e o `refresh_token` são os que usamos; `client_credentials` está disponível mas não é usado hoje.
- `certification_status: not_certified` nas 2 — esperado, não são apps pra certificação pública.
- `roles`: listas de códigos internos do Mercado Livre, parecidas mas não idênticas entre as 2 contas, sem explicação pública na documentação — registradas só como referência bruta.

## Relacionado

- [[Gerencie seu Aplicativo na API do Mercado Livre]]
- [[Boas Praticas para Uso da Plataforma do Mercado Livre]]
- [[Erro 403 (Forbidden) da API do Mercado Livre]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
