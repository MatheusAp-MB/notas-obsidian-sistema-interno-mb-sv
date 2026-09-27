---
tipo: duvida
dominio: python
status: em_aberto
criado: 27/09/2026
atualizado_em: 27/09/2026 18:26
relacionado: [Comando Nativo migrate Do Django Cai Silenciosamente no Banco Default Sem --database Obrigatorio, Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]
resumo: "O fix do migrate nativo (ExigirDatabaseExplicito) resolve só esse 1 comando. Outros 10 comandos nativos do Django aceitam --database e têm o mesmo risco de cair silenciosamente no banco default — o mais crítico é flush, que apaga todo o dado. Ainda não decidido se/quais estender o mixin."
---

# Duvida - Estender ExigirDatabaseExplicito aos Outros 10 Comandos Nativos do Django com Risco de --database Silencioso

**Resumo**: o mixin `ExigirDatabaseExplicito` corrigiu o `migrate` nativo (ver [[Comando Nativo migrate Do Django Cai Silenciosamente no Banco Default Sem --database Obrigatorio]]), mas existem outros 10 comandos nativos do Django que aceitam `--database` e têm exatamente o mesmo risco de cair silenciosamente no alias `'default'` (== banco da Magazine, neste projeto). Ainda não decidido se — e quais — vale estender o mesmo mixin.

> [!question] Em aberto (27/09/2026, 18:26)
> Falta decisão de Matheus sobre quais dos 10 comandos abaixo devem ganhar o mesmo tratamento de `migrate`.

## Contexto

O `ExigirDatabaseExplicito` foi criado especificamente pro `migrate`, motivado pelo incidente registrado em [[Comando Nativo migrate Do Django Cai Silenciosamente no Banco Default Sem --database Obrigatorio]]. O mixin é genérico (funciona em qualquer comando nativo que tenha uma `action` de `--database` no parser) — a questão é decidir o escopo de onde aplicá-lo.

## A pergunta em aberto

Estender o mesmo override pros outros comandos nativos do Django que também aceitam `--database` e por padrão caem no alias `'default'` quando a flag não é passada:

- `flush` — **maior risco**: apaga todo o dado do banco. Sem `--database` obrigatório, um `flush` sem a flag apaga o banco `default` (== Magazine) inteiro, silenciosamente.
- `dbshell`
- `loaddata`
- `dumpdata`
- `showmigrations`
- `sqlmigrate`
- `createcachetable`
- `sqlflush`
- `sqlsequencereset`
- `inspectdb`

## Relacionado

- [[Comando Nativo migrate Do Django Cai Silenciosamente no Banco Default Sem --database Obrigatorio]]
- [[Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]]
