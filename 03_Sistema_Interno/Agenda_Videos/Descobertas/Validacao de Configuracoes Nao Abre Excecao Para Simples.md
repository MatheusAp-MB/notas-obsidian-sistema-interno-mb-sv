---
tipo: descoberta
dominio: 
status: ativa
criado: 04/08/2026
atualizado_em: 04/08/2026 09:00
relacionado: [Estrutura de Telas da Agenda de Videos, Checkpoint Testes Automatizados Agenda Videos, Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]
---

# Validação de Configurações Não Abre Exceção Para Simples

Achado durante a validação manual paralela do fluxo (04/08/2026), testando a tela "Configurações" logo depois de reescrever o template (ver [[Checkpoint Testes Automatizados Agenda Videos]], seção "Quarta rodada").

## O que aconteceu

Ao salvar a fase Simples na tela de Configurações (`periodo=1`, campo "Distância entre ocorrências" deixado em branco de propósito), o sistema devolveu "Simples: valor inválido — mantido o valor anterior" — mesmo Mensal e Trimestral salvando normalmente na mesma submissão.

## Causa

`view_configuracoes_agenda_videos` (`agenda_videos/views.py`) valida assim, pra QUALQUER fase:

```python
if distancia is None or (not periodo_continuo and periodo is None):
    ...  # warning, não salva
```

`distancia` vem de `_validar_inteiro_positivo(request.POST.get(f'{fase_valor}_distancia_dias_corridos'))` — campo vazio sempre vira `None`, e a condição já barra aí, antes de checar qualquer coisa sobre a fase.

O problema: `ConfiguracaoFase.distancia_dias_corridos` já é `null=True, blank=True` no modelo (`agenda_videos/models/configuracao_fase.py`), com comentário explícito confirmando que **Simples não usa esse campo** (só tem 1 ocorrência — não existe "distância entre ocorrências" quando só existe 1). A view abre uma exceção equivalente pra `periodo` quando `periodo_continuo=True` (Trimestral), mas nunca abriu a exceção simétrica pra Simples em `distancia`.

## Por que não é bug do template novo

O template reescrito em 04/08 só ficou correto agora — antes disso a tela nem funcionava (campos e fases completamente diferentes), então esse caminho de validação nunca tinha sido exercitado de verdade com dado real. O bug é pré-existente na view, só ficou visível agora.

## Fix identificado (ainda não aplicado)

Abrir a mesma exceção que já existe pra `periodo_continuo`/`periodo`, mas pra Simples/`distancia`:

```python
distancia_obrigatoria = fase_valor != Fase.SIMPLES
if (distancia_obrigatoria and distancia is None) or (not periodo_continuo and periodo is None):
    ...
```

Em aberto: decidir se o campo também ganha alguma indicação visual no template (placeholder "não se aplica" ou `disabled`) pra Simples, ou se basta a correção funcional (campo fica em branco, sem indicação especial).

## Resolução

Fix aplicado pelo usuário em `views.py` (04/08/2026, 09:00) — confirmado: salvar Simples com "Distância entre ocorrências" em branco agora dá "Configurações de fase salvas com sucesso", sem o warning de "valor inválido". Usuário decidiu não adicionar indicação visual no campo pra Simples ("ninguém vai ficar editando essa tela mesmo") — fica como está, campo em branco sem tratamento especial no template.

## Relacionado

- [[Estrutura de Telas da Agenda de Videos]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]]
