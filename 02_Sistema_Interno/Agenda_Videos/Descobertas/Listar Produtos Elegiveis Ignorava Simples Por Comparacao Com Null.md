---
tipo: descoberta
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 06/08/2026 10:15
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Fluxo Manual Antes do Automatizado]
---

# listar_produtos_elegiveis() Ignorava Simples Por Comparação Com NULL

Achado testando `listar_produtos_elegiveis()` (Rodada 6, item 2 — funções puras do orquestrador da Postagem Automática, ver [[Checkpoint Testes Automatizados Agenda Videos]]). Bug real de produção, não de teste.

## O que aconteceu

O próprio comentário da função promete: "a fila de postagem cobre qualquer fase com 'postar' pronto, Simples incluso". Um teste escrito especificamente para confirmar essa promessa (`test_produto_fase_simples_pronto_pra_postar_aparece`) falhou — produto Simples pronto pra postar nunca aparecia na fila.

## Causa

```python
.filter(
    indicadores_agenda__etapa_atual='postar', data_devida_ciclo_atual__lte=hoje, postou_hoje=False,
)
```

`Simples` nunca tem `data_devida` — fica sempre `None`, por decisão de modelagem (não tem vencimento, só 1 ocorrência). Em SQL, `NULL <= qualquer_valor` nunca é verdadeiro (é `UNKNOWN`, tratado como falso pelo `WHERE`) — então essa condição excluía Simples incondicionalmente, mesmo com a etapa certa e sem nenhum outro impedimento.

## Impacto

Produto na fase Simples, mesmo com o vídeo pronto e aguardando postagem, NUNCA seria pego pelo bot de Postagem Automática — ficaria parado ali indefinidamente, exigindo postagem manual sempre, sem ninguém perceber que era um bug (o comportamento "silencioso" de exclusão por NULL não gera erro, só um resultado vazio).

## Resolução

```python
Q(data_devida_ciclo_atual__lte=hoje) | Q(data_devida_ciclo_atual__isnull=True),
```

Trata "sem vencimento" (só existe pra Simples) como "sempre elegível quando pronto" — Mensal/Trimestral continuam exigindo `data_devida <= hoje` normalmente, sem nenhuma mudança de comportamento pra eles. Confirmado pelo usuário: 332 passed, 0 failed, teste do Simples passando.

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Fluxo Manual Antes do Automatizado]]
