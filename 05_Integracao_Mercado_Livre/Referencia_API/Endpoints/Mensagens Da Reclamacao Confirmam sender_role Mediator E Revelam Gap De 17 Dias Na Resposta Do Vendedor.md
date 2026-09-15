---
tipo: descoberta
dominio: python
status: ativa
criado: 15/09/2026
atualizado_em: 15/09/2026 13:28
relacionado: [Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354), Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]
---

# Mensagens da Reclamação Confirmam sender_role Mediator e Revelam Gap de 17 Dias na Resposta do Vendedor

**Resumo**: rodando um rascunho de script (`varredura_respostas_mediacao.py`) contra o claim `5564889989` (pedido `2000017788033354`, conta SV — mesmo caso já documentado no mundo 7), confirmamos que `sender_role: "mediator"` aparece de verdade em `GET /post-purchase/v1/claims/{id}/messages` — a doc oficial omite esse valor na lista de campos possíveis, por engano. No mesmo caso apareceu um gap de 17 dias entre a 1ª mensagem do mediador e a 1ª resposta do vendedor.

> [!warning] Em investigação — 15/09/2026, 13:28
> Só 1 caso real testado até agora. O gap de 17 dias e a discrepância de horário (ver "O que levou à resposta") ainda não são padrão confirmado — mais dados a caminho antes de fechar.

## Contexto

Depois de confirmar a data de fechamento de uma mediação via `claims/{id}/messages` (ver [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]]), surgiu a ideia de um sistema de notificação pro usuário — sem webhook, por decisão do usuário, um botão de varredura sob demanda. Antes de desenhar esse sistema, era preciso confirmar se dá pra saber com certeza quando o ML/mediador respondeu, sem depender só da data de resolução final. Foi escrito um rascunho de script (`varredura_respostas_mediacao.py`, fora do fluxo principal dos scripts do repositório, só pra teste rápido — ainda não versionado) que puxa `claims/{id}/messages`, descobre o papel do usuário (`complainant`/`respondent`) cruzando `players` com `/users/me`, e classifica cada mensagem em "O ML RESPONDEU" / "VOCÊ RESPONDEU" / "A CONTRAPARTE RESPONDEU" — sem ler o conteúdo da mensagem.

## O problema

Dá pra saber, com confiança, quando o ML/mediador respondeu numa reclamação — não só a data de fechamento?

## O que levou à resposta

Rodando o script contra o claim `5564889989`, `sender_role: "mediator"` apareceu em 4 das 9 mensagens do thread — confirmando que a doc oficial ("Gerenciar mensagem de uma reclamação") omitiu esse valor por engano: o próprio exemplo de resposta da doc já mostrava `"receiver_role": "mediator"`, e a tabela de ações de envio já listava `mediator` como remetente possível.

Sequência completa das 9 mensagens:

| Quem | Quando | Gap até a próxima |
|---|---|---|
| Contraparte (comprador) | 23/08 13:04 | — |
| Contraparte (comprador) | 23/08 13:05 | 1 min |
| **ML** | 24/08 15:02 | — |
| **Você** | 10/09 10:49 | **17 dias** |
| ML | 10/09 14:32 | 3h40 |
| Você | 11/09 15:01 | ~1 dia |
| ML | 11/09 15:08 | 7 min |
| Você | 14/09 10:34 | ~3 dias |
| ML | 14/09 12:48 | 2h14 — fecha o caso |

O gap de 17 dias entre a 1ª mensagem do mediador (24/08) e a 1ª resposta do vendedor (10/09) bate com a anotação interna "Recebido - Ana 10/09" — sugere que o time só respondeu à mediação quando o produto físico chegou e foi inspecionado, não quando o ML chamou pela primeira vez.

**Ponto ainda não resolvido**: outro script (`consultar_linha_tempo_devolucao.py`) tinha reportado a "1ª mensagem com `stage=dispute`" às 24/08 **16:02** — 1h depois da 1ª mensagem do mediador encontrada aqui (24/08 **15:02**). Pode não ser erro nenhum — são filtros diferentes (1ª mensagem *do mediador* vs. 1ª mensagem já marcada `stage: dispute`, que pode ser de qualquer papel) — mas não foi confirmado ainda qual `stage` a mensagem das 15:02 carregava.

## Resposta

`sender_role: "mediator"` em `claims/{id}/messages` é um sinal real e funcional pra saber quando o ML respondeu — confirmado num caso real, sem depender de doc incompleta. Ainda em aberto: se o gap de 17 dias é comum ou foi só esse caso, e a explicação exata da diferença de 1h entre os dois scripts. Sem isso, a lógica final do botão de varredura (o que contar como "resposta pendente", com que prazo alertar) ainda não está fechada.

## Exemplo

Script rodado: `python varredura_respostas_mediacao.py --claim_id=5564889989 --token=***`. Saída completa reproduzida na tabela acima.

## Relacionado

- [[Caso Real De Devolucao Com Mediacao Confirma O Relatorio E Revela 4 Nuances Da Central De Vendedores (Pedido 2000017788033354)]]
- [[Mediador Nao Aparece Na Lista De Players De Uma Reclamacao]]
