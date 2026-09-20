---
tipo: descoberta
dominio: python
status: confirmada
criado: 20/09/2026
atualizado_em: 20/09/2026 05:31
relacionado: [[Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]], [[Mensagens Da Reclamacao Confirmam sender_role Mediator E Revelam Gap De 17 Dias Na Resposta Do Vendedor]], [[Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução]]
---

# Stage recontact É Documentado E Mediador Também Atua Em dispute Ou recontact

**Resumo**: o campo `stage` de uma reclamação tem 5 valores documentados — `claim`, `dispute`, `recontact`, `none`, `stale` — não 4. `recontact` é a fase em que uma das partes reabre contato depois que o claim/disputa já foi encerrado, mas a ação que dispara isso está marcada como "não disponível ainda" na própria doc. O mediador atua tanto em `dispute` quanto em `recontact`.

> [!success] Confirmada — direto da doc `.com.br`
> Confirmado em 2 etapas: primeiro por texto idêntico em 2 espelhos oficiais (Chile e Argentina), depois pelo HTML da própria página `.com.br` (`Gerenciar reclamações`, salvo e enviado por Matheus em 20/09/2026, já que o fetch direto bloqueava com 403) — "Última atualização em 20/08/2026".

## Contexto

Matheus repassou uma análise gerada com ajuda de outra LLM (GPT) sobre a lógica de classificação de reclamações do projeto, que citava `recontact` como um possível valor de `stage` não usado no projeto. Como é regra do projeto nunca aceitar afirmação sobre a API do ML sem verificar contra fonte oficial — vale pra afirmação de qualquer LLM, não só pra código já existente — fui atrás da doc antes de aceitar ou descartar. O fetch direto do `.com.br` bloqueava (403), então usei primeiro espelhos oficiais (Chile/Argentina) e depois o próprio Matheus salvou e enviou o HTML da página `.com.br`, que confirmou tudo com texto idêntico.

## O que foi confirmado (texto oficial, `.com.br`)

> stage: Etapa da reclamação. Pode assumir um dos seguintes valores:
> - **claim**: etapa da reclamação onde intervêm o comprador e o vendedor.
> - **dispute**: Etapa de mediação onde intervém um representante do Mercado Livre.
> - **recontact**: etapa em que uma das partes entra em contato após o fechamento da reclamação/disputa.
> - **none**: não se aplica.
> - **stale**: Etapa da reclamação onde intervêm o comprador e Mercado Livre para reclamações do tipo `ml_case`.

> [!info] Ação recontact ainda não está disponível
> Dentro de `available_actions`, a própria doc lista `recontact` como ação possível do vendedor, mas com a ressalva: **"recontact (não disponível ainda): reabrir uma reclamação já encerrada, por meio de uma interação, como uma mensagem."** — isso explica por que nunca apareceu um `recontact` real nos 141 claims reais escaneados: o valor de `stage` existe na doc, mas o mecanismo pra chegar nele ainda não foi liberado na prática.

> Confirmado também, texto idêntico: **"O player mediator intervém no claim apenas quando se encontra nas etapas de disputa ou recontact."** — ou seja, quando `recontact` for liberado de verdade, um claim nessa etapa também pode ter mediador envolvido, não só em `dispute`.

## Por que isso importa pro projeto

O critério de "está em mediação agora" usado hoje (script `buscar_mediacoes_abertas_recentes.py` e o Hub de Consulta) é só `stage == "dispute"`. Como a ação `recontact` ainda não está disponível na prática, esse critério continua correto por enquanto — mas fica registrado que vai precisar de revisão quando (se) a Mercado Livre liberar `recontact` de verdade.

## Em aberto

- [ ] `recontact` segue sem nenhum caso real nos 141 claims escaneados (MB+SV, últimos 6 meses) — consistente com a ação estar marcada "não disponível ainda".
- [ ] Decisão de negócio pendente com Matheus: quando `recontact` for liberado de verdade, ele deve contar como "mediação" no relatório de classificação, ou fica de fora por ser pós-encerramento?
- [ ] Nenhuma ação necessária por enquanto — só monitorar se `recontact` começa a aparecer em claims reais.

## Relacionado

- [[Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]]
- [[Mensagens Da Reclamacao Confirmam sender_role Mediator E Revelam Gap De 17 Dias Na Resposta Do Vendedor]]
- [[Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução]]
