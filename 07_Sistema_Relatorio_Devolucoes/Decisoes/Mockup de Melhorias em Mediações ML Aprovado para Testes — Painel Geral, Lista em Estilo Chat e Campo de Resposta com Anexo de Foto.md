---
tipo: decisao
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_andamento
criado: 20/09/2026
atualizado_em: 20/09/2026 23:43
relacionado: [[Auditoria Profunda — Tela de Mediações ML]], [[Refinamento de UX do Painel de Mediações — 5 Correções de Usabilidade e Layout Fixo Estilo WhatsApp Web]], [[Correção de 3 Problemas Reais na Tela de Mediações ML — meu_papel Nullable, Denormalização da Última Mensagem e Barra Lateral Sincronizada na Mesma Requisição]]
resumo: Matheus aprovou, em 20/09/2026 22:03, o mockup interativo (artifact publicado, iterado em várias rodadas com Claude) que implementa as 6 melhorias priorizadas na Auditoria Profunda da tela de Mediações ML — segue pra fase de testes, ainda sem nenhuma linha do código real alterada. Além das 6 melhorias da auditoria original, o mockup ganhou 4 mudanças novas pedidas por Matheus durante as rodadas de ajuste: Painel Geral saiu de 3 indicadores (1 clicável) pra 6 indicadores todos clicáveis; a lista "Em acompanhamento" virou estilo chat, ordenada pela última mensagem (enviada ou recebida) sem opção de reordenar manualmente — o que substitui, só pra essa lista, o seletor "recentes/antigas/nome" decidido no Refinamento de UX anterior (que continua valendo em "Encontrados pelo sistema", não alterado); 2 filtros novos por quem mandou a última mensagem ("do ML ou Cliente" / "nossa"); e um campo de resposta no chat com anexo de foto (preview local real, funcional) mas envio ainda não implementado, nem no mockup nem no sistema real.
---

# Mockup de Melhorias em Mediações ML Aprovado para Testes — Painel Geral, Lista em Estilo Chat e Campo de Resposta com Anexo de Foto

## Contexto

Depois da [[Auditoria Profunda — Tela de Mediações ML]] (13 blocos, 6 melhorias priorizadas), Claude construiu um mockup interativo — HTML/CSS/JS clicável, publicado como artifact — reproduzindo a tela real (mesmas classes, cores e estrutura) com as 6 melhorias aplicadas, marcadas com numeração ① a ⑥ e uma legenda no rodapé explicando problema/mudança/motivo de cada uma. Matheus foi pedindo ajustes em rodadas sucessivas na mesma conversa, além do escopo original da auditoria. Em 20/09/2026 22:03, aprovou o resultado pra fase de testes.

**Link do mockup (artifact):** https://claude.ai/artifact/7mV2U5AxvzoCgxw1KtBrES

## As 6 melhorias originais da auditoria (sem mudança de conteúdo aqui)

1. Badge "Sem prazo definido" — diferencia de prazo tranquilo (prioridade alta)
2. Card de urgência do Painel Geral virou clicável, já filtra a lista (prioridade alta)
3. Vermelho reservado só pra urgência de prazo — badges de categoria/status migraram pra tons neutros (prioridade média)
4. Indicador de mensagem nova, prometido pelo texto da tela mas nunca implementado — agora existe (prioridade média)
5. Ícone de cadeado em vez de estrela vazia, em item sempre acompanhado por vínculo com devolução (prioridade baixa)
6. Botão "Tentar novamente" quando o `claim_id` nunca resolve (prioridade baixa)

Descartadas por decisão de Matheus (20/09, durante a auditoria): preservar estado da lista pós-varredura, e ação de descartar item em "Encontrados pelo sistema".

## Mudanças novas, pedidas durante as rodadas de ajuste do mockup (fora do escopo original da auditoria)

### Painel Geral otimizado — 6 indicadores, todos clicáveis
Antes: 3 cards (Mediações em aberto, Encerradas, Com prazo urgente), só o último clicável. Depois: 6 cards, todos clicáveis — Mediações em aberto (mostra lista completa), Encerradas (agora a aba Encerradas funciona de verdade, com exemplos), Com prazo urgente (já existia), Sem prazo definido (novo, card âmbar), Mensagens novas não vistas (abre direto o detalhe), Encontrados pelo sistema (expande o grupo).

### Lista "Em acompanhamento" virou estilo chat
Pedido de Matheus: a lista precisa ser mais parecida com um chat de verdade, ordenada pela data da última mensagem (enviada ou recebida) — sem oferecer opção pra ela trocar a ordenação, porque não existe cenário real onde isso seria útil. Cada item ganhou um preview da última mensagem (remetente + trecho) e o horário, estilo WhatsApp. Item sem conversa nenhuma (claim nunca resolvido) vai pro final da lista com aviso "Sem conversa ainda".

**Atenção — supersede parcialmente [[Refinamento de UX do Painel de Mediações — 5 Correções de Usabilidade e Layout Fixo Estilo WhatsApp Web]]:** aquela nota registrou a adição do seletor "Ordenar por: recentes/antigas/nome" nas 2 listas (Encontrados e Em acompanhamento). Essa decisão nova remove esse seletor **só** de "Em acompanhamento" (agora tem ordem fixa, só pela última mensagem). Em "Encontrados pelo sistema" o seletor recentes/antigas/nome continua valendo — não foi mexido.

Efeito colateral observado (vale acompanhar no teste real): com ordenação por última mensagem, um caso urgente (prazo vencido) pode não ficar no topo da lista se ninguém mexeu na conversa há dias — o badge vermelho de prazo continua visível no item, mas ele perde a posição de destaque só por estar atrasado.

### 2 filtros novos, por quem mandou a última mensagem
"Última mensagem do ML ou Cliente" (mediações esperando resposta da Ana) e "Última mensagem nossa" (mediações já respondidas, esperando o outro lado). Item sem conversa não entra em nenhum dos dois.

### Campo de resposta no chat, com anexo de foto
Campo de texto + botão de enviar abaixo da conversa, nos itens que têm chat. Envio ainda não implementado (nem aqui, nem no sistema real — é funcionalidade nova, não existe ainda em nenhum lugar). O anexo de foto, porém, é funcional de verdade no mockup: botão de clipe abre o seletor de arquivo do sistema operacional, a foto escolhida aparece como miniatura removível — tudo local, via JS puro, sem upload nenhum.

## Status

Decisão de **design aprovada pra testes** — nenhuma linha do código real (`Projeto-Sistema-Devolucao`) foi alterada ainda. Implementação de verdade (incluindo a conversa real com a API do ML, que a própria view `mediacoes_ml` já registra como pendente) entra numa próxima etapa.

## Em aberto

- [x] ~~Implementar de fato no código real as 6 melhorias da auditoria + as 4 mudanças desta nota~~ — implementado e rodado com sucesso por Matheus (`aplicar_melhorias_mediacoes.py`, 5/5 passos OK, confirmado colando o output do terminal em 20/09/2026). Depois disso, Claude e Matheus acharam e corrigiram mais 3 problemas reais nessa mesma tela — ver [[Correção de 3 Problemas Reais na Tela de Mediações ML — meu_papel Nullable, Denormalização da Última Mensagem e Barra Lateral Sincronizada na Mesma Requisição]].
- [ ] Decidir se o campo de resposta (texto + foto) entra nesta rodada de implementação ou fica pra depois — hoje é só mockup visual
- [ ] Confirmar com teste real (Ana?) se a ordenação por última mensagem esconde algum caso urgente-mas-parado com frequência incômoda na prática

## Relacionado

- [[Auditoria Profunda — Tela de Mediações ML]]
- [[Refinamento de UX do Painel de Mediações — 5 Correções de Usabilidade e Layout Fixo Estilo WhatsApp Web]]
- [[Correção de 3 Problemas Reais na Tela de Mediações ML — meu_papel Nullable, Denormalização da Última Mensagem e Barra Lateral Sincronizada na Mesma Requisição]]
