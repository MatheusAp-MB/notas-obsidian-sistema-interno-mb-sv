---
tipo: decisao
dominio: 
status: resolvida
criado: 20/08/2026
atualizado_em: 20/08/2026 22:30
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug, Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]
---

# Filtros de 5 Dimensões no Portal do Drive — Marca, Progresso, Fase, Urgente e Sincronização

## O quê

O último item de navegação/funcionalidade que ficava pendente da tela do Portal do Drive (a lista de todos os produtos) ganhou um painel de filtros com 5 dimensões reais: **Marca** (busca interna, mesmo padrão de Histórico/Agenda), **Progresso de envio** (Todos / Com pendência / Completo), **Fase atual** (Simples/Mensal/Trimestral, múltipla escolha), **Urgente** (só produtos marcados) e **Sincronização com o Drive** (Todos / Sincronizados / Não sincronizados). Chips de filtro ativo e contador de resultado no topo da lista, no mesmo espírito visual do Hub de Anúncios.

## Por quê

A 1ª versão entregue só tinha o filtro de Marca (cópia direta do Hub de Anúncios). O usuário rejeitou explicitamente, nas próprias palavras: *"Só isso de filtro? parece tão mal feito... tão simples.... pense com calma nos filtros uteis para a tela e para experiencia do usuario."* Isso motivou reabrir a investigação da arquitetura real (pós-reescrita de snapshot, ver [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]) em vez de simplesmente copiar um padrão de outra tela sem pensar no que faz sentido aqui.

## Pra quê

O Portal do Drive lista hoje **todos** os produtos ativos da Agenda de Vídeos (mais de 1200) — sem filtro nenhum além de busca por texto, encontrar "quem ainda precisa de vídeo" ou "quem está com problema de Drive" exigia rolar a lista inteira. As 5 dimensões escolhidas respondem, cada uma, a uma pergunta real de quem usa a tela no dia a dia: por marca (organização por fornecedor), por progresso de envio (o que falta terminar), por fase (o que está em Simples/Mensal/Trimestral), por urgência (prioridade real da Agenda), e por status de sincronização (quem já foi checado contra o Drive de verdade).

## As 5 dimensões

| Filtro | Tipo | Opções | Onde mora o dado |
|---|---|---|---|
| Marca | Checkbox múltiplo, com busca interna | Toda marca distinta do catálogo | `Produto.marca` |
| Progresso de envio | Opção única (radio) | Todos / Com pendência / Completo | Calculado do `snapshot_drive` (ver detalhe técnico) |
| Fase atual | Checkbox múltiplo | Simples / Mensal / Trimestral | `IndicadoresAgendaProduto.fase_atual` |
| Urgente | Checkbox único | Marcado / não marcado | `ParticipacaoAgenda.urgente` |
| Sincronização com o Drive | Opção única (radio) | Todos / Sincronizados / Não sincronizados | Existência de `snapshot_drive` (`isnull`) |

## Detalhe técnico importante — Progresso não dá pra filtrar só com SQL

Diferente dos outros 4 filtros (todos campos de banco, filtráveis direto no `QuerySet`), "Progresso de envio" depende de quantos arquivos esperados (18, por produto) já existem — e essa contagem vem de dentro do JSON `arquivos_videos`/`arquivos_usados` do snapshot, não de uma coluna própria. Por isso, `_contar_arquivos_presentes(produto)` foi extraída como função reutilizável (100% em cima do snapshot já salvo, zero chamada ao Drive) e o filtro de Progresso só avalia a lista inteira em Python (depois de já aplicada busca/marca/fase/urgente/sincronização) quando esse filtro específico é usado — aceitável pro tamanho atual do catálogo, não escalaria bem se um dia virasse dezenas de milhares de produtos.

A mesma extração corrigiu de quebra uma possível inconsistência: o total "X de 18 arquivos" da linha colapsada (novo) usa exatamente a mesma constante (`TOTAL_ARQUIVOS_ESPERADOS`, 6 linhas principais × 3 tipos — exclui a 2ª ocorrência do Trimestral) que o cabeçalho do card aberto já usava — os 2 números nunca podem divergir pro mesmo produto.

## Mockup antes do código real

Depois da correção de escopo, o desenho das 5 dimensões foi aprovado em texto pelo usuário ("ok gostei..") e, a pedido dele, um mockup interativo (HTML/CSS/JS) foi gerado antes de qualquer código real ("vamos ver como ficaria gere um mockup") — só depois de aprovado ("gostei...") a implementação real (`views.py`, template, CSS) foi entregue.

## Estado real

Entregue como LOCALIZE/blocos completos pro usuário aplicar (`view_portal_drive` reescrita, `estrutura_portal_drive.html` com o painel de 4 cards de filtro + chips, CSS de indicador/chip/contador). Testado e confirmado funcionando pelo usuário no navegador — inclusive revelou, na prática, o bug real documentado em [[Bug Real - Sincronizacao em Massa Confundia Nunca Sincronizado com Nao Encontrado no Drive]].

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug]]
- [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]
- [[Bug Real - Sincronizacao em Massa Confundia Nunca Sincronizado com Nao Encontrado no Drive]]
