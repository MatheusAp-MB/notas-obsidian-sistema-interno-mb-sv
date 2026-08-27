---
tipo: conceito
dominio: 
status: ativa
criado: 26/08/2026
atualizado_em: 26/08/2026 23:00
relacionado: [Boas Praticas para Uso da Plataforma do Mercado Livre, Consideracoes de Design da API do Mercado Livre, Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre, Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale), Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Erro 403 (Forbidden) da API do Mercado Livre

## O quê é esta nota, e por que ela é diferente das 2 anteriores

**O quê**: 3ª nota da camada superior do estudo da API do Mercado Livre. Diferente das 2 primeiras ([[Boas Praticas para Uso da Plataforma do Mercado Livre]] e [[Consideracoes de Design da API do Mercado Livre]]), que eram sobre convenção geral, esta é sobre **1 erro HTTP específico** — mas um erro que pode acontecer de verdade nas nossas chamadas de **leitura** de hoje, não só em cenário futuro de publicação (diferente do "Validador de Publicações", que foi descartado do estudo por ser 100% sobre criar anúncio).

**Por quê entender 403 especificamente**: 403 significa "seu pedido chegou certo, formatado certo, mas você não tem permissão pra isso" — bem diferente de 401 (token inválido/expirado) ou 400 (pedido malformado). Confundir os 3 leva a tentar "consertar" a coisa errada — por exemplo, tentar renovar o token (resolveria um 401) quando o problema real é falta de permissão (só 403 resolve mudando permissão, não token).

**Fonte**: documentação oficial do Mercado Livre para desenvolvedores, página "Erro 403" — última atualização em 02/04/2025 (informado pela própria página).

## O formato do erro não é fixo — achado que já ajustou uma regra nossa

A doc mostra 2 exemplos reais de erro 403:

```json
{"status": 403, "error": "Invalid scopes", "code": "FORBIDDEN"}
```

```json
{"status": 403, "error": "access_denied", "message": "access to the requested resource is forbidden", "code": "FORBIDDEN"}
```

Comparando com o formato genérico documentado antes (`message`/`error`/`status`/`cause`, visto em [[Consideracoes de Design da API do Mercado Livre]]): nenhum dos 2 exemplos acima tem `cause`, o primeiro nem tem `message`, e os 2 têm um campo `code` que não aparecia no formato genérico. Ou seja, o formato de erro do Mercado Livre **varia por tipo de erro** — não é um contrato 100% fixo.

> [!info] Isso já ajustou a Regra 1 de tratamento de erro
> Esse achado motivou uma correção na regra recém-criada sobre tratamento de erro — ver [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]], seção "Regra 1". Resumo do ajuste: extrair **o que vier** (`status`, `error`, `message`, `cause`, `code`), nunca assumir que todos os campos estarão presentes.

## As 7 causas reais de um 403, e se cada uma nos afeta hoje

| Causa | O que significa | Nos afeta hoje? |
|---|---|---|
| Aplicativo bloqueado/desabilitado | O aplicativo cadastrado no DevCenter do Mercado Livre foi suspenso por descumprir os Termos e Condições do Programa de Desenvolvedores. | **Descartada pras 2 contas**, confirmado em 26/08/2026 consultando `GET /applications/$APP_ID` de verdade (`blocked: False`, `disabled: False`, `active: True`, nas 2) — ver [[Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale)]]. |
| Permissões insuficientes | O usuário ou o aplicativo não tem a permissão necessária pro recurso pedido. | Depende de scope — ver linha "Scopes mal configurados" abaixo. |
| Usuário inativo ou suspenso | A conta do vendedor (Magazine ou Samvale) foi desativada ou suspensa pelo próprio Mercado Livre. | Verificável via endpoint de consulta de usuário — não verificado, mas relevante já que dependemos de 2 contas ativas. |
| IP bloqueado | A chamada veio de um endereço IP fora da lista de IPs permitidos do aplicativo. | **Não nos afeta hoje** — na discussão da [[Boas Praticas para Uso da Plataforma do Mercado Livre]], foi decidido (26/08/2026) não configurar restrição de IP por enquanto. Sem restrição configurada, esse motivo específico de 403 não deveria aparecer pro nosso uso — mas fica registrado como o sintoma esperado, caso a decisão mude no futuro. |
| Scopes mal configurados | "Scope" é o nome que o Mercado Livre dá pra cada permissão específica que um aplicativo pede durante a autenticação (por exemplo, "ler item" e "criar anúncio" são scopes diferentes) — se o scope certo não estiver habilitado no DevCenter, toda chamada que dependa dele recebe 403. | Ver formato específico logo abaixo — o Mercado Livre dá um erro estruturado próprio pra esse caso, diferente dos outros 403. |

> [!info] Sub-caso específico: falta de "permissão funcional" — formato de erro próprio
> A doc "Permissões funcionais" (última atualização 21/11/2025) detalha essa causa: no DevCenter, cada aplicativo tem categorias nomeadas de permissão (ex: "Publicação e sincronização", "Comunicação pré e pós-venda", "Publicidade", "Métricas do negócio", "Vendas e envios", "Promoções/cupons/descontos", "Faturamento" — mais "Usuários", que vem ativa por padrão em todo app). Quando falta a categoria certa, o erro devolvido tem um formato próprio, diferente dos 2 exemplos genéricos já vistos acima:
> ```json
> {
>   "code": "PA_UNAUTHORIZED_RESULT_FROM_POLICIES",
>   "blocked_by": "PolicyAgent",
>   "message": "At least one policy returned UNAUTHORIZED.",
>   "status": 403
> }
> ```
> Diferente dos outros 2 exemplos de 403 já vistos nesta nota: não tem `error` nem `cause`, e traz um campo novo, `blocked_by`, que identifica o sistema interno do Mercado Livre que negou o pedido (aqui, o `PolicyAgent` — o sistema de permissão). Esse achado já foi incorporado na Regra 1 de tratamento de erro, ver [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]. O mapeamento das categorias nomeadas pra scopes reais dos nossos 2 apps está em [[Achados Reais na Configuracao dos Aplicativos Mercado Livre (Magazine e Samvale)]].
| Access token de conta errada | Usar o token de 1 conta pra tentar acessar dado de outra (ex: usar o token da Magazine numa chamada que deveria ser da Samvale). | Risco real e concreto pra nós: mantemos 2 contas separadas (Magazine e Samvale), com tokens diferentes — ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]. O `gerenciador_token.py` já exige o parâmetro `conta` de forma explícita (sem valor padrão), o que reduz bastante o risco — mas ainda depende de quem chama passar a conta certa; não existe uma trava automática contra o erro humano de passar a conta errada. |
| Dados do usuário não validados | A conta vendedora não completou um processo de validação de dado pessoal exigido pelo Mercado Livre. | Não verificado se as contas Magazine/Samvale já passaram por essa validação. |

## Conexões com o que já sabemos

Este erro amarra 3 coisas que já registramos separadamente: a decisão de não restringir IP (Boas Práticas), o formato variável de erro (Considerações de Design, e agora confirmado aqui), e a arquitetura de 2 contas separadas com token por conta (Cliente_HTTP). Nenhuma delas, sozinha, contava a história toda — só juntando aparece o quadro completo de "o que pode causar um 403 pra gente, e o que já está coberto ou não".

## Relacionado

- [[Boas Praticas para Uso da Plataforma do Mercado Livre]]
- [[Consideracoes de Design da API do Mercado Livre]]
- [[Tratamento Detalhado e Relatorio Estruturado de Erros de Chamada a API do Mercado Livre]]
- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
