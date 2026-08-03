---
tipo: descoberta
dominio: banco_de_dados
status: ativa
criado: 03/08/2026
atualizado_em: 03/08/2026 11:30
relacionado: [Checkpoint Testes Automatizados Agenda Videos]
---

# Régua de Fases Precisa Ser Semeada em Todo Ambiente Novo

`ConfiguracaoFase` (a régua Simples → Vídeo Mensal → Vídeo Trimestral) é dado editável no admin, nunca dict fixo no código (decisão de 30/07) — mas isso significa que todo banco novo (dev, produção, ambiente de outro PC) precisa dessas 3 linhas cadastradas manualmente antes da tela principal da Agenda de Vídeos funcionar.

## Sintoma

`DoesNotExist: ConfiguracaoFase matching query does not exist` ao abrir `/agenda-videos/` num banco que nunca teve a régua cadastrada. Não é bug de código — é dado de setup faltando.

## Correção

Criado `popular_regua_fases_agenda_videos(stdout, style)` em `core/management/commands/iniciar_banco_suporte/`, usando `get_or_create` (seguro rodar mais de uma vez), com a mesma régua já usada na fixture de teste `regua_de_fases`. Encadeado no comando de seed geral (`python manage.py iniciar_banco`).

## Efeito prático

Qualquer ambiente novo só precisa rodar `python manage.py iniciar_banco` — não precisa mais cadastrar a régua manualmente pelo admin.

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
