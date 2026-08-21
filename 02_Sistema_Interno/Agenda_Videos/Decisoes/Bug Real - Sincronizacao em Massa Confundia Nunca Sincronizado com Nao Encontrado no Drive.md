---
tipo: bug_conhecido
dominio: 
status: corrigido
criado: 20/08/2026
atualizado_em: 20/08/2026 22:30
relacionado: [Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive, Filtros de 5 Dimensoes no Portal do Drive - Marca, Progresso, Fase, Urgente e Sincronizacao, Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]
---

# Bug Real — Sincronização em Massa Confundia "Nunca Sincronizado" com "Não Encontrado no Drive"

## O quê

O botão "Sincronizar com o Drive" (varredura em massa, `sincronizar_snapshots_drive()`) nunca gravava snapshot nenhum pra um produto ativo cuja pasta marca/EAN não existisse no Drive de teste — mesmo depois de rodar a sincronização, esse produto continuava com `snapshot_drive = None` no banco, e a tela mostrava "nunca sincronizado" (like se nada tivesse sido tentado), quando na real ele **tinha sido verificado e não encontrado**. São 2 informações diferentes: "última vez que verificamos" (deveria sempre existir depois de rodar a sincronização) e "existe no Drive" (pode ser sim ou não).

## Por quê — achado pelo usuário testando de verdade

O usuário reparou que um produto urgente (Pulverizador Costal Elétrico Brudden SS20-B) continuava marcado "nunca sincronizado" mesmo depois de já ter clicado em "Sincronizar com o Drive", e trouxe a observação certeira: *"pq 'nunca sincronizado' parece que nunca foi feita a sincronização, e não que 'Nao existe no drive'... A ultima sincronização é 'O ultimo momento que esse produto foi pesquisado no drive' e não 'esse produto foi encontrado no drive'."*

## Causa raiz — direção errada do laço

`sincronizar_snapshots_drive()` varria o Drive inteiro, montava uma árvore só com os EANs que **existem fisicamente lá** (`arvore_por_ean`), e só gravava snapshot pra quem apareceu nessa árvore (`for ean, dados in arvore_por_ean.items(): ...`) — essa é a direção **Drive → Sistema**. Um produto sem pasta nenhuma no Drive nunca aparece nessa árvore, então o laço nunca "pergunta" nada sobre ele — não é que ele responde "não encontrado", é que ele nunca é perguntado. A verificação **individual** (`verificar_produto_no_drive`, rodada depois de 1 envio/exclusão) já fazia isso certo (grava `pasta_encontrada=False` mesmo sem achar nada) — só a varredura em massa tinha esse buraco.

## Correção — inverter a direção pra Sistema → Drive

O laço passou a partir do catálogo ativo (`listar_produtos_agenda_filtrados(tela=Tela.GERAL)` — a mesma fonte que já popula a lista da tela) e perguntar, pra CADA produto, "você está na árvore que acabei de montar do Drive?". Todo produto ativo recebe uma resposta (achado ou não), numa passada só — e isso eliminou de quebra as N queries individuais que existiam antes (1 `Produto.objects.filter(ean=ean).first()` por EAN encontrado no Drive), trocadas por 1 única query de produtos + busca em dicionário em memória.

```python
produtos_ativos = list(listar_produtos_agenda_filtrados(tela=Tela.GERAL))

for produto in produtos_ativos:
    dados = arvore_por_ean.get(produto.ean)
    if dados is None:
        SnapshotArquivosDrive.objects.update_or_create(
            produto=produto,
            defaults={'pasta_encontrada': False, 'motivo_nao_encontrado': f'Pasta "{produto.marca}/{produto.ean}/Videos" não encontrada no Drive.', ...},
        )
    else:
        SnapshotArquivosDrive.objects.update_or_create(produto=produto, defaults={'pasta_encontrada': True, ...})
```

## Consequência — 3 estados reais na tela, não mais 2

A tela (linha colapsada e card aberto) passou a distinguir: **nunca verificado** (snapshot `None` — cinza), **verificado e não encontrado** (`pasta_encontrada=False` — vermelho, com data da última verificação e o motivo), e **verificado e encontrado** (`pasta_encontrada=True` — barra de progresso normal). Antes só existia a distinção binária "tem snapshot ou não".

## Efeito colateral no teste automatizado

`atualizados` (retorno de `sincronizar_snapshots_drive()`) mudou de semântica — antes contava só os EANs achados no Drive, agora conta TODO produto ativo processado (achado ou não), porque todo produto ativo sempre ganha uma linha de snapshot. `test_nivel_5__drive_leitura.py::test_sincronizar_snapshots_drive_roda_de_verdade_sem_erro` tinha a string de `esperado` desatualizada com a semântica antiga ("criado só pros EANs que já têm Produto") — corrigida pra refletir o comportamento novo. A assinatura de retorno (3-tupla) não mudou, então `verificar_todos_no_drive()` (em `verificador.py`) e os testes que a mockam continuam funcionando sem nenhuma alteração.

## Estado real

Corrigido e entregue como LOCALIZE (`escaneador.py` + ajuste de docstring do teste + `views.py`/templates/CSS pros 3 estados). Confirmado pelo usuário via screenshot real do navegador: produtos sem pasta no Drive de teste (a maioria do catálogo de mais de 1200 produtos) agora aparecem corretamente como "não encontrado no Drive" (vermelho), distinto do produto QUIMIVIDA (com pasta e arquivos reais), que mostra a barra de progresso normal.

## Relacionado

- [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]
- [[Filtros de 5 Dimensoes no Portal do Drive - Marca, Progresso, Fase, Urgente e Sincronizacao]]
- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
