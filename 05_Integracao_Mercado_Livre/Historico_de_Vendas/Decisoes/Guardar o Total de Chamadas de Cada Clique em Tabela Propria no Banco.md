---
tipo: decisao
dominio: banco_de_dados
status: concluida
criado: 12/10/2026
atualizado_em: 12/10/2026 01:15
relacionado: [Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Decisão de Matheus em 12/10/2026: o total exato de chamadas ao Mercado Livre de CADA clique de coleta fica guardado numa tabela própria (ExecucaoColetaVendasMercadoLivre, 1 linha por clique), sem tela de admin, consultada pelo shell ou MySQL. Para custo de API somar só ela. Os avisos da coleta passaram a ser guardados por inteiro."
---

# Guardar o Total de Chamadas de Cada Clique em Tabela Própria no Banco

## Resumo

Em 12/10/2026, Matheus decidiu que o **número exato de chamadas** que cada clique nos botões de coleta gasta **"é importante"** e precisa ficar guardado: **1 linha por clique**, numa tabela própria do banco, para consultas futuras. **Não haverá tela de administração** ("não vamos usar o admin para nada"): a consulta é pelo shell do Django ou direto no MySQL. A tabela é `ExecucaoColetaVendasMercadoLivre` (`mercado_livre/models/execucao_coleta_vendas.py`).

> [!success] Status: concluída (12/10/2026)
> Implementada e **validada com cliques reais** nos botões "Coletar período da conta" (2 cliques) e "Atualizar produto" (1 clique). Os registros de "Atualizar dia" e de "Atualizar um MLB" **ainda não foram conferidos no banco real**. Os números medidos com ela estão em [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]].

## Contexto

A coleta de vendas gasta chamadas da API do Mercado Livre (limite de 18.000 por hora por aplicativo), e a pergunta "quanto custa coletar?" precisa de resposta **exata**, para planejar a massificação de ~1.000 SKUs. Já existia a tabela `ColetaVendasMercadoLivre`, mas ela guarda **1 linha por trecho lido** (e é ela que diz a cobertura: "tenho dados de X a Y").

## A pergunta

Onde guardar, com exatidão, o custo em chamadas de cada clique, de forma que dê para somar por dia, por tipo de botão, por SKU e por pessoa?

## O que levou à decisão

| Caminho | O que seria | Por que foi descartado ou escolhido |
|---|---|---|
| **A. Arquivo de log** | Ler as chamadas do log da API | **Descartado**: depende de arquivo, difícil de somar por clique. |
| **B. Somar a tabela de coleta que já existe** (`ColetaVendasMercadoLivre`) | 1 linha por trecho | **Descartado**: um "Atualizar produto" gera dezenas de linhas, as chamadas que não viraram trecho (1ª página de uma janela que voltou partida, trechos que falharam) **não aparecem em nenhuma**, e somar as duas tabelas **conta em dobro**. |
| **C. Tabela nova, 1 linha por clique** | Uma linha com o total do clique | **Escolhido por Matheus.** |

## Decisão

Tabela `ExecucaoColetaVendasMercadoLivre`, 1 linha por clique:

| Campo | O que guarda |
|---|---|
| `tipo` | `produto` (Atualizar produto, com ou sem "Reler tudo"), `mlb` (Atualizar um MLB), `dia` (Atualizar um dia da conta toda) ou `periodo` (Coletar um período da conta toda) |
| `sku`, `mlb`, `reler_tudo` | Quem pediu e se foi "Reler tudo" |
| `data_de`, `data_ate` | O período pedido (datas inclusivas, dia de Brasília) |
| `status` | `concluida`, `parcial` (parou, foi interrompida ou algum trecho falhou) ou `falha` (nenhum trecho lido) |
| `mlbs`, `dias_total`, `dias_a_coletar`, `trechos`, `trechos_com_falha` | O tamanho do trabalho |
| **`chamadas`** | **As requisições reais ao ML deste clique** (cada tentativa conta). Se `trechos_sem_contagem` > 0, é um **mínimo**, não o total exato |
| `erros_429`, `pedidos_lidos`, `segundos` | Erros de cota, pedidos e tempo |
| `mensagem`, `usuario`, `iniciado_em`, `concluido_em` | Texto final do clique (com todos os avisos), quem clicou e quando |

**Como é preenchida:** "Atualizar dia" e "Coletar período da conta" são gravados **pelo servidor** (`coletar_vendas_ml.py`, que conta cada requisição). "Atualizar" de um MLB e "Atualizar produto" a tela monta em vários trechos; quando o último termina, a tela soma e envia o total (`view_vendas_execucao_registrar`, rota `execucao/registrar/` em `gestao_vendas/urls.py`; `script_vendas.js`). **Se a pessoa fechar a aba no meio, esse clique não é registrado.**

> [!warning] Para custo de API, somar SÓ esta tabela
> Os mesmos pedidos aparecem em `ColetaVendasMercadoLivre` e nesta. Somar as duas conta em dobro.

**Decisão complementar (12/10/2026, "faça ambos"): guardar TODOS os avisos da coleta**, não só o primeiro. Antes a tela mostrava só o 1º aviso e a contagem, e o **texto do 2º aviso do ano foi perdido**. Agora a lista completa fica no campo `mensagem` (título "Avisos desta coleta", teto de 8.000 caracteres, `MAX_MENSAGEM_REGISTRADA`) tanto nesta tabela quanto na da coleta.

## Exemplo

Registros reais conferidos no banco em 11/10/2026 (`chamadas` / `pedidos_lidos` / `segundos`):

| Clique | Chamadas | Pedidos lidos | Segundos |
|---|---|---|---|
| Coletar período da conta, 1 ano | 1.870 | 84.510 | 944 |
| Coletar período da conta, 1 semana | 29 | 1.226 | 14 |
| Atualizar produto (SKU de teste, 1 ano) | 364 | 16.876 | 60 |

Consulta pelo shell (a empresa ativa precisa ser definida, como em `scripts_exploracao_ML`; em uma linha só com `shell -c`, porque colar várias linhas no shell junta as linhas e dá erro):

```bash
python manage.py shell -c "from core.empresa import EMPRESA_MAGAZINE, definir_empresa_ativa; definir_empresa_ativa(EMPRESA_MAGAZINE); from mercado_livre.models import ExecucaoColetaVendasMercadoLivre as E; from django.db.models import Sum; print(list(E.objects.values('tipo').annotate(chamadas=Sum('chamadas'), pedidos=Sum('pedidos_lidos'))))"
```

## Relacionado

- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Empate de date_closed na Fronteira da Pagina Repete um Pedido e Perde Outro no Orders Search]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
