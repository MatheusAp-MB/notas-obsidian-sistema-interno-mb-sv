---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 21/09/2026
atualizado_em: 21/09/2026 02:41
relacionado: [[Varredura Completa Travada na Samvale — Linha Singleton de StatusVarreduraMediacoes Nunca Semeada e Fix Autossuficiente]], [[Envio Real de Mensagem no Chat de Mediações ML — Fluxo de 2 Passos da API, Limite de 10 Fotos e Indicador de Envio]], [[Mockup de Melhorias em Mediações ML Aprovado para Testes — Painel Geral, Lista em Estilo Chat e Campo de Resposta com Anexo de Foto]]
resumo: "Antes mesmo do envio real de mensagem existir na tela de Mediações ML, Matheus pediu uma trava de segurança pro campo de resposta (commit 1bfa099, 01:49:54, 20 minutos antes do envio real ser implementado). Novo model TravaChatMediacao (migration 0024) — singleton por empresa (pk=1, roteado por EmpresaRouter, MB e SV com linha própria), campo liberado (BooleanField, default False = travado por padrão), mesmo padrão do StatusVarreduraMediacoes. Liberação exige senha fixa (SENHA_TRAVA_CHAT_MEDIACAO = '2530', hardcoded em views.py, sem .env nem tela de CRUD) via view liberar_chat_mediacao (POST, 403 se senha errada); travar_chat_mediacao não exige senha (travar é sempre a direção segura). Qualquer falha no caminho de liberação (senha errada, exceção) nunca libera. Na tela, um badge com cadeado (aberto/fechado) mais um botão Liberar/Travar; enquanto travado, o botão de anexar, o campo de texto e o botão de enviar do campo de resposta já vêm disabled no próprio HTML. 20 minutos depois (commit e4be2a2), quando o envio real de mensagem foi implementado, a view enviar_mensagem_chat_mediacao passou a checar TravaChatMediacao liberada de verdade no servidor (403 se não estiver) — confirma que a trava não ficou só decorativa, ela gateia o envio de verdade, não só o botão desabilitado no HTML."
---

# Trava do Chat de Mediações ML — Model TravaChatMediacao com Senha Fixa Protegendo o Envio Ainda Não Implementado

## Contexto — trava construída antes do próprio recurso que ela protege

Commit `1bfa099` (01:49:54, 21/09/2026) — 20 minutos antes do envio real de mensagem ser implementado (`e4be2a2`, 02:09:58). O próprio comentário do model deixa isso explícito: "proteção pro envio de mensagem pro Mercado Livre (ainda não implementado nesta tela) não disparar por acidente quando existir." Decisão de Matheus de construir a rede de segurança primeiro, antes do recurso que ela protege.

## Model — TravaChatMediacao

```python
class TravaChatMediacao(models.Model):
    liberado = models.BooleanField('Chat de resposta liberado?', default=False)

    def __str__(self):
        return f'Trava do chat de Mediações ML (liberado={self.liberado})'
```

Migration `0024_travachatmediacao`. Singleton (sempre `pk=1`, nunca histórico) — mesmo padrão já usado por `StatusVarreduraMediacoes` (ver [[Varredura Completa Travada na Samvale — Linha Singleton de StatusVarreduraMediacoes Nunca Semeada e Fix Autossuficiente]]), roteado pelas 2 bases (MB/SV) via `EmpresaRouter` — cada empresa tem sua própria linha, independente da outra. Começa sempre `liberado=False` — travado é o padrão seguro.

## Views — liberar/travar

```python
SENHA_TRAVA_CHAT_MEDIACAO = '2530'

def liberar_chat_mediacao(request):
    if request.method != 'POST':
        return JsonResponse({'erro': 'Método não permitido.'}, status=405)
    if request.POST.get('senha') != SENHA_TRAVA_CHAT_MEDIACAO:
        return JsonResponse({'erro': 'Senha incorreta.'}, status=403)
    TravaChatMediacao.objects.update_or_create(pk=1, defaults={'liberado': True})
    return JsonResponse({'ok': True})


def travar_chat_mediacao(request):
    if request.method != 'POST':
        return JsonResponse({'erro': 'Método não permitido.'}, status=405)
    TravaChatMediacao.objects.update_or_create(pk=1, defaults={'liberado': False})
    return JsonResponse({'ok': True})
```

Senha fixa (`'2530'`), hardcoded direto em `views.py` — decisão explícita de Matheus de não usar `.env` nem criar tela de CRUD só pra isso; trocar a senha significa editar essa constante no código. Qualquer falha no caminho de liberação (senha errada, ou qualquer exceção) nunca libera — só existe 1 caminho de sucesso, a senha bater certinho. Travar não exige senha nenhuma, por decisão de design: travar é sempre a direção segura, não precisa de proteção.

## Na tela

Badge de status com ícone de cadeado (`fa-lock-open`/`fa-lock`, texto "Chat liberado"/"Chat travado") mais 1 botão que alterna entre "Liberar"/"Travar", acima da caixa de resposta. Enquanto travado, os 3 controles da caixa de resposta (botão de anexar foto, textarea, botão de enviar) já vêm `disabled` direto no HTML (`{% if not trava_chat_liberada %}disabled{% endif %}`), não só via JS.

## Confirma que não ficou só decorativa

20 minutos depois deste commit, quando o [[Envio Real de Mensagem no Chat de Mediações ML — Fluxo de 2 Passos da API, Limite de 10 Fotos e Indicador de Envio]] foi implementado, a view `enviar_mensagem_chat_mediacao` passou a checar `TravaChatMediacao` liberada de verdade no backend (403 se não estiver) — não é só um `disabled` cosmético no HTML que um clique de DevTools contornaria; o servidor também recusa o envio se a trava não estiver liberada.

## Relacionado

- [[Varredura Completa Travada na Samvale — Linha Singleton de StatusVarreduraMediacoes Nunca Semeada e Fix Autossuficiente]]
- [[Envio Real de Mensagem no Chat de Mediações ML — Fluxo de 2 Passos da API, Limite de 10 Fotos e Indicador de Envio]]
- [[Mockup de Melhorias em Mediações ML Aprovado para Testes — Painel Geral, Lista em Estilo Chat e Campo de Resposta com Anexo de Foto]]
