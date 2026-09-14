---
tipo: decisao
dominio: python
status: superada
criado: 12/09/2026
atualizado_em: 14/09/2026 02:00
relacionado: [Decisao - Campo Frete do Fornecedor Sera Renomeado de frete_cif_fob para Frete Fornecedor e Vira Editavel na Tela, Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao, Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]
---

# Decisão: `custo_com_boni` Fica Sempre `None` por Enquanto — Sem Refatorar Código

**Resumo**: `Produto.custo_com_boni` não será removido nem refatorado do código — continua existindo pro caso de precisar ser usado de novo no futuro. A decisão é operacional, não estrutural: a partir de agora, esse campo deve ficar sempre `None`/vazio. Como toda fórmula de precificação e a margem do Hub de Promoções já fazem `custo_com_boni or custo` (fallback já existente, confirmado nos 6 marketplaces), deixar o campo sempre vazio já faz ele perder função na prática — sem precisar tocar em 1 linha de código.

> [!success] Ativa — 12/09/2026
> Matheus considerou primeiro remover `custo_com_boni` de vez, mas preferiu esta versão: mantém o campo (uso futuro possível) e só garante que ele fique sempre `None` hoje.

> [!warning] SUPERADA em 14/09/2026, 02:00 — pendência resolvida, decisão evoluiu pra refatorar de vez
> A pendência operacional (ver abaixo) foi resolvida: Matheus confirmou direto que nenhum produto tem `custo_com_boni` preenchido manualmente na base real. Com isso resolvido, em vez de só manter o campo sempre `None`, decidiu ir além — as 6 fórmulas + `calculo_margem.py` pararam de ler `custo_com_boni`. Ver "Atualização" no fim da nota.

## Contexto

Ao analisar a planilha We Stack "refeita" (ver [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]), ficou claro que a planilha só modela 1 conceito de custo ("Custo Unitário"), sem equivalente a `custo_com_boni`. Matheus concluiu que `custo_com_boni` é campo morto — não deveria mais existir, só usar `custo`. Ao mapear o alcance real dessa mudança (16 arquivos Python fora de migrations/testes, 9 templates), Matheus optou por não desligar o campo de vez, porque acha que ainda pode precisar dele no futuro — e para não ter que refatorar o código todo.

## O que levou à decisão

Levantamento confirmou que o padrão `custo_com_boni or custo` já existe, idêntico, nos 6 arquivos de fórmula de precificação (`mercado_livre`, `magalu`, `raia`, `shopee`, `tiktok`, `amazon`, em `precificacao/funcoes_auxiliares/`) e em `mercado_livre/funcoes_auxiliares/calculo_margem.py` (Hub de Promoções). Ou seja: o próprio código já sabe se virar sozinho quando o campo vem vazio — não existe hoje nenhum ponto que dependa de `custo_com_boni` estar preenchido pra funcionar.

Checagem dos usos fora do cálculo de preço (feita antes da decisão, pra confirmar que nada quebra):
- **Admin, filtros e templates de tela** (`produtos/admin.py`, `filtros_produtos.py`, `contexto_tela_produtos.py`, 9 HTMLs): campo continua existindo e aparecendo, só sempre em branco — sem risco.
- **Filtro por faixa (mín/máx) na tela de Produtos** (`CAMPOS_FAIXA` em `filtros_produtos.py`): com o campo sempre `None`, filtrar por essa faixa especificamente sempre retorna vazio (comparação com `NULL` nunca satisfaz `>=`/`<=`) — não quebra, só o filtro nunca acha nada.
- **Modal "como chegamos nesse preço" e Grade do Mercado Livre** (`precificacao/views/modal_comum.py`, `grade_mercado_livre.py`): essas 2 telas leem o valor JÁ RESOLVIDO por `calcular_fixo_detalhado()` (que já aplica o fallback) — vão passar a mostrar "Custo do produto" e "Custo com bonificação" com o mesmo número, lado a lado. Redundante visualmente, mas não quebra.
- **Nenhum ponto de escrita automática encontrado**: não existe formulário nem sincronização (Sysemp ou outra) que grave em `custo_com_boni` hoje — a única forma dele ter valor é edição manual direta pelo Django Admin.

## Decisão tomada

`custo_com_boni` permanece no model, no banco e em todo o código que já lê ele — nada é refatorado. A partir de agora, o campo deve ficar sempre `None`/vazio (nenhuma edição manual, nenhum preenchimento). Isso é suficiente pra ele ficar sem função no cálculo de preço e margem, porque o fallback pro `custo` puro já existe em todo lugar que importa.

**Pendência operacional (fora do código)**: como não há nenhum ponto de escrita automática no código, a única forma de `custo_com_boni` estar preenchido hoje é alguém ter editado manualmente pelo Django Admin em algum produto específico. Não há como confirmar isso pela leitura do código — precisa checar direto no banco se algum produto já tem valor lá. Se sim, precisa de uma limpeza pontual de dado (zerar o campo nesses produtos); se não, nada mais precisa ser feito.

## Consequência sobre a dúvida aberta de custo no piso de faixa

Resolve, por eliminação, a 2ª pergunta da [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]] — a diferença entre ML (`custo_com_boni or custo`) e Shopee/TikTok (`custo` puro) no piso que descarta faixa de frete/comissão abaixo do custo. Com `custo_com_boni` sempre `None`, os 3 marketplaces resolvem pro mesmo valor (`custo`) na prática, mesmo sem o código ter sido alterado. A 1ª pergunta da mesma dúvida (base de cálculo do PIS/COFINS de saída) não é afetada, continua em aberto.

## Atualização (14/09/2026, 02:00) — pendência resolvida, código refatorado

Retomada a auditoria da fórmula de precificação (Camada 1, custo). Matheus confirmou que não existe nenhum produto na base real com `custo_com_boni` preenchido com valor diferente de `custo` — resolvendo de vez a pendência operacional registrada acima. Com essa garantia, a decisão de 12/09 evoluiu: em vez de só manter o campo sempre `None` (contando com o fallback já existente), decidiu tirar a leitura de `custo_com_boni` de dentro da fórmula.

Aplicado via script de uso único (`trocar_custo_com_boni_por_custo.py`, 9 trocas de texto em 7 arquivos: as 6 fórmulas de marketplace + `calculo_margem.py`) — `calcular_custo_final()` (e, só no ML, o piso de custo dentro de `resolver_preco()`) passam a usar `produto.custo` direto, sem nenhum fallback. `custo_com_boni` continua existindo no model/admin/tela de Produtos (não removido do banco) — só não é mais lido por nenhuma fórmula.

Validado com dado real: `manage.py check` limpo, e as 6 grades de precificação recalculadas nas 2 empresas (1358 produtos MAGAZINE / 731 SAMVALE, batendo com o catálogo já validado) — **0 erros de assert** nas 42 execuções (6 marketplaces × 2 empresas). Como nenhum produto tinha valor manual em `custo_com_boni`, o resultado matemático é idêntico ao de antes por construção — não é amostra estatística, é garantia lógica.

Decisão explícita de Matheus: a linha duplicada "Custo com bonificação" no modal de auditoria do ML (efeito colateral já previsto na seção "O que levou à decisão" acima) fica como está, sem limpeza — mostra o mesmo valor de "Custo do produto", sem problema.

Consequência adicional: a [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao|2ª pergunta da dúvida sobre custo no piso de faixa]] deixa de ser "resolvida por eliminação" (código antigo) e passa a ser resolvida por código de verdade — ML/Shopee/TikTok agora leem literalmente a mesma linha (`produto.custo`), não só coincidem em valor por acaso do dado.

## Relacionado

- [[Decisao - Campo Frete do Fornecedor Sera Renomeado de frete_cif_fob para Frete Fornecedor e Vira Editavel na Tela]]
- [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]]
- [[Descoberta - Planilha We Stack Refeita Confirma Pontos do Sistema Interno e Revela Bug no Calculo de Cofins]]
- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
