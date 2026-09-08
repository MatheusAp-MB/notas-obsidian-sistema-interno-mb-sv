---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 08/09/2026
atualizado_em: 08/09/2026 03:07
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Checkpoint - Catálogo de Peças e Tela de Produtos, Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]
---

# Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição

**Resumo**: o timestamp "Relatório gerado em..." saía com a hora errada (e, sem ninguém ter notado ainda, o mesmo problema já afetava o "criada em" de outra tela existente) porque `TIME_ZONE` do Django estava em `UTC` desde o início do projeto, sem nenhuma conversão pro horário de Brasília na hora de exibir. Corrigido trocando `TIME_ZONE` pra `America/Sao_Paulo`.

> [!success] Corrigido — 08/09/2026
> Troca de 1 linha em `settings.py`. Validado isoladamente: um horário gravado como `05:48` UTC passou a exibir corretamente como `02:48` (horário de Brasília, UTC-3) depois da troca.

## Contexto

O projeto usa `USE_TZ = True` (padrão do Django) — isso significa que **todo horário é sempre gravado no banco em UTC**, não importa o valor de `TIME_ZONE`. O campo `TIME_ZONE` não controla o que é gravado, só controla a conversão feita na hora de **exibir** um horário pra tela (via `{% now %}`, filtro `|date` num campo de data/hora, ou `timezone.localtime()`). Como o projeto foi criado com `django-admin startproject` e ninguém tinha ajustado esse campo ainda, ele continuava no valor padrão (`UTC`) — ou seja, todo horário exibido em qualquer tela do sistema aparecia 3 horas à frente do horário real de Brasília, sem nenhum aviso ou erro.

## O problema

O usuário reportou o rodapé do relatório impresso mostrando "Relatório gerado em 08/09/2026 05:46", quando o horário real, no momento em que ele gerou o relatório, era outro — exatamente 3 horas antes, o offset de Brasília (UTC-3).

## O que levou à resposta

Confirmado que o problema era só de **exibição**, não de gravação (os dados no banco continuam corretos, em UTC): testado isoladamente com `django.utils.timezone.localtime(django.utils.timezone.now())`, comparando o resultado antes e depois de mudar `TIME_ZONE` — o mesmo instante gravado (`05:48` UTC) passou a ser exibido como `02:48` depois da troca pra `America/Sao_Paulo`, a conversão certa pro horário de Brasília.

Como o `TIME_ZONE` é uma configuração global do projeto (não algo específico do template do relatório), ficou claro que o mesmo problema já afetava, silenciosamente, qualquer outro lugar do sistema que exibisse data/hora — inclusive uma tela que já existia antes do relatório: o "criada em" da lista de devoluções pendentes ([[Checkpoint - Catálogo de Peças e Tela de Produtos]]). A correção resolve os 2 lugares de uma vez só, por ser uma configuração central.

## Correção

Localize (`projeto_sistema_devolucao_mb_sv/settings.py`):

```python
TIME_ZONE = 'UTC'
```

Substitua:

```python
TIME_ZONE = 'America/Sao_Paulo'
```

## Exemplo

O próprio usuário, ao aplicar a correção, também aproveitou pra trocar `LANGUAGE_CODE` de `'en-us'` pra `'pt-br'` na mesma edição (ajuste próprio dele, fora do escopo da correção do bug em si, mas registrado aqui porque ficou na mesma linha do arquivo).

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Checkpoint - Catálogo de Peças e Tela de Produtos]]
- [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]
