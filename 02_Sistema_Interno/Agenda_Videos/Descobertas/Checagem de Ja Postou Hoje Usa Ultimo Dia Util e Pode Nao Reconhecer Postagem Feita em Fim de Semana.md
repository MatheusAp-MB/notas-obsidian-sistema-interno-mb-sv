---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 22/08/2026 02:24
atualizado_em: 22/08/2026 14:20
relacionado: [Listar Produtos Elegiveis Ignorava Simples Por Comparacao Com Null, Ajuste de Dia Util Cria Padrao Estavel de 28 Dias, Fluxo Manual Antes do Automatizado]
---

# Checagem de "Já Postou Hoje" Usa Último Dia Útil — Pode Não Reconhecer Postagem Feita em Fim de Semana

Achado por acidente rodando a suíte de teste inteira do sistema pela 1ª vez (`pytest -s`, sem restringir arquivo), num sábado (22/08/2026). Um teste pré-existente (`test_produto_que_ja_postou_hoje_nao_aparece_de_novo`, em `test_nivel_3__orquestrador_postagem_automatica.py`) falhou — não é bug do teste, é bug real de produção em `listar_produtos_elegiveis()`.

## O que aconteceu

`listar_produtos_elegiveis()` (`agenda_videos/funcoes_auxiliares/postagem_automatica/orquestrador.py`) calcula:

```python
hoje = ultimo_dia_util_ou_hoje(date.today())
...
postou_hoje=construir_condicao_postou_hoje(data_referencia=hoje),
```

`ultimo_dia_util_ou_hoje()` ajusta fim de semana/feriado pro último dia útil anterior — regra correta pra decidir "prazo vencido" (ver [[Ajuste de Dia Util Cria Padrao Estavel de 28 Dias]]). O problema é que essa MESMA variável `hoje` é reusada como referência pra `construir_condicao_postou_hoje()`, que checa se `aguardando_aprovacao_em` (timestamp real, sempre `timezone.now()`) cai dentro da janela desse dia.

Num sábado, `hoje` vira sexta (dia útil anterior) — mas uma postagem de verdade feita no sábado grava `aguardando_aprovacao_em` no sábado real. A janela verificada (sexta 00h-23h59) nunca bate com o timestamp real (sábado), então `postou_hoje` fica `False` mesmo o produto já tendo postado agora há pouco.

## Impacto (se o agente rodar em fim de semana)

Um produto que já postou hoje (sábado/domingo) não seria reconhecido como "já postado" pela trava de "1x por dia" — o próximo ciclo de varredura do bot poderia tentar postar o mesmo produto de novo no mesmo dia. Prazo (data_devida) e "já postou hoje" são 2 perguntas diferentes que não deveriam compartilhar o mesmo ajuste de dia útil — prazo pode/deve esperar o próximo dia útil, mas "já aconteceu hoje" precisa do calendário real, não do dia útil ajustado.

## Por que não foi corrigido agora

Descoberto durante uma sessão de testes do Portal do Drive (fim de semana, ritmo calmo, sem pressa) — mexe diretamente na Postagem Automática/agente local, frente que já estava decidida como pausada por enquanto (ver [[Fluxo Manual Antes do Automatizado]]). Registrado aqui pra não se perder, correção fica pra quando essa frente for retomada.

## Pista de correção (não aplicada)

`construir_condicao_postou_hoje()` provavelmente deveria receber `date.today()` puro (calendário real), não o `hoje` já ajustado pro último dia útil — só o filtro de `data_devida_ciclo_atual__lte=hoje` (prazo) deveria usar o ajuste de dia útil.

## Resolução (22/08/2026, 14h20)

Aplicada exatamente a pista de correção acima: `listar_produtos_elegiveis()` (`agenda_videos/funcoes_auxiliares/postagem_automatica/orquestrador.py`) ganhou uma 2ª variável, `data_calendario_real = date.today()`, usada só em `construir_condicao_postou_hoje(data_referencia=data_calendario_real)`. A variável `hoje` (ajustada pro último dia útil) continua exatamente como estava, usada só no filtro de prazo (`data_devida_ciclo_atual__lte=hoje`) — nenhuma outra regra mudou.

Confirmado com dado real, sem precisar simular nada: o dia da correção (22/08/2026) já era um sábado, então o teste que documentava o bug (`test_produto_que_ja_postou_hoje_nao_aparece_de_novo`, em `test_nivel_3__orquestrador_postagem_automatica.py`) passou a **passar de verdade** (antes falhava só em fim de semana/feriado). Resultado: **12 passed, 0 failed** na suíte do orquestrador.

## Relacionado

- [[Listar Produtos Elegiveis Ignorava Simples Por Comparacao Com Null]]
- [[Ajuste de Dia Util Cria Padrao Estavel de 28 Dias]]
- [[Fluxo Manual Antes do Automatizado]]
