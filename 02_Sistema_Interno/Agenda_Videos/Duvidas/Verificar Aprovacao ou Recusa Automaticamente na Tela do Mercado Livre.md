---
tipo: duvida
dominio: 
status: em_aberto
criado: 13/08/2026
atualizado_em: 13/08/2026 12:00
relacionado: [MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma, Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]
---

# Verificar Aprovação ou Recusa Automaticamente na Tela do Mercado Livre

## Ideia (13/08, depois de fechar o rastreamento do MLB postado)

Agora que o sistema sabe com certeza qual MLB recebeu cada vídeo ([[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]), surgiu a ideia de checar automaticamente, na própria tela do Mercado Livre, se aquele vídeo foi aprovado ou recusado — hoje isso só é resolvido manualmente (clique humano em "Aprovado"/"Recusado" no modal do roadmap).

## O que já foi confirmado (print real do usuário)

Na tela "Meus Vídeos" (`https://vendedores.mercadolivre.com.br/video/creator/listing?page=1&item_id={MLB}`), a coluna "Estado" mostra 1 destes 4 valores reais: **EM REVISÃO**, **PUBLICADO**, **RECUSADO**, **PAUSADO**. Mapeamento proposto (não implementado):

- PUBLICADO → `ciclo.status = APROVADO`
- RECUSADO → `ciclo.status = RECUSADO`
- EM REVISÃO / PAUSADO → sem decisão ainda, não muda nada

Ponto de atenção, ainda não confirmado: a URL real usada no print é `vendedores.mercadolivre.com.br/video/creator/listing?page=1&item_id=...` — diferente da que `replicacao_ml.py` já usa hoje (`www.mercadolivre.com.br/video/creator/listing?item_id=...`, sem `page=1`). Pode ser só redirecionamento estando logado como vendedor, mas precisa confirmar antes de automatizar, não assumir.

## O que falta decidir (parou aqui, sessão mudou de foco)

1. **Modelo de interação** — igual ao botão "Verificar Drive" que já existe hoje (usuário clica, por produto ou "verificar todos", agente confere na hora), ou automático, com o agente checando isso sozinho de tempos em tempos (precisaria de uma peça nova no sistema — algum tipo de polling contínuo, que não existe ainda)? Nenhuma das 2 foi escolhida.
2. **Seletor real da automação** — não dá pra adivinhar pelo print; vai precisar do mesmo tipo de diagnóstico já usado em `postagem_ml.py`/`replicacao_ml.py` (listar os controles reais da tela) pra achar o jeito certo de ler o texto "Estado" via `pywinauto`.
3. Não ficou claro se existe uma API oficial do Mercado Livre pra isso, em vez de automação de tela — suspeita (não confirmada) é que não existe, pelo mesmo motivo de a Postagem/Replicação já usarem `pywinauto` em vez de API pra tudo relacionado a "Clips".

## Relacionado

- [[MLB Postado Real Substitui Chute e Postagem Vira 100% Autonoma]]
- [[Checklist Postagem e Replicacao Automatica - Fluxo Real Sem Gambiarra]]
