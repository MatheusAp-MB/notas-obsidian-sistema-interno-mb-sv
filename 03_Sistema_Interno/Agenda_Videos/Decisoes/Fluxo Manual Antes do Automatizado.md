---
tipo: decisao
dominio: 
status: ativa
criado: 03/08/2026
relacionado: [Disciplina de Testes Automatizados, Checkpoint Testes Automatizados Agenda Videos]
---

# Fluxo Manual Antes do Automatizado

Toda a Agenda de Vídeos tem 2 fluxos: manual (dashboard, views, templates, CSS) e automatizado (postagem_automatica, replicacao_automatica, integração com Drive). Decisão: validar 100% o fluxo manual primeiro — só depois de aprovado (testado + validado visualmente no navegador) é que o fluxo automatizado começa a ser testado.

## Motivo

Não faz sentido forçar a versão autônoma sem a versão manual funcionando — o automatizado depende do mesmo motor de dados que o manual expõe.

## Duas camadas de validação, nessa ordem

1. Testes "brutos" via pytest (Nível 0/2/3/4), seguindo [[Disciplina de Testes Automatizados]].
2. Só depois, validação manual "real" clicando no navegador — fora do pytest.

## Efeito prático — mapa de execução (fluxo manual)

`badges_agenda.py` → `roadmap_produto.py` → `historico_roadmap.py` → `listar_produtos_com_historico()` (rodada própria, 7 filtros) → `contexto_tela_agenda_videos.py` → `views.py` (bloco manual, ~24 funções). Views que tocam Drive (`view_verificar_produto_drive`/`view_verificar_todos_drive`) ainda sem decisão — mockar agora junto do manual, ou deixar pra fase automatizada (pergunta em aberto).

## Atualização 05/08/2026 09:30 — decisão sobre as views de Drive

A pergunta em aberto ("mockar agora ou deixar pra fase automatizada?") foi resolvida pelo usuário: `view_verificar_produto_drive`/`view_verificar_todos_drive` vão ser testadas usando o **Drive real, sempre que possível** — não mock. Isso marca o fim do fluxo manual "puro" (as 10 views sem Drive, Blocos A-D, estão 100% testadas — ver [[Checkpoint Testes Automatizados Agenda Videos]]) e o início de uma rodada nova, que já mistura fluxo manual (as 2 views de Drive) com uma abordagem de teste diferente de tudo que veio antes (contra serviço externo real, não só banco local). Plano de teste ainda sendo desenhado.

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
