---
tipo: descoberta
dominio: python
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 01:02
relacionado: [Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco), Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo), Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem, Estrutura da Planilha Busca Legal de Impostos de Saida, Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda, Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]
---

# Descoberta: Comparação Planilha do Superior x Sistema em Impostos (Não Cobertos, Divergentes e Equivalentes)

**Resumo**: comparação entre os impostos calculados na planilha de precificação do superior (ver [[Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco)]]) e o código real do Sistema Interno V2 (6 marketplaces + apps `impostos`/`produtos`). MVA, ICMS ENTRADA fixo (18%) e o termo "+ ST Valor" do Custo Final não existem mais como a planilha descrevia — foram substituídos por crédito fiscal real, lido direto da nota fiscal de entrada (XML). `ICMS SAÍDA SP` existe no cadastro mas nenhuma fórmula de precificação o usa; `ICMS SAÍDA MÉDIA`/`PIS %`/`COFINS %` têm um comando de preenchimento real, mas manual e fora do pipeline automático — cobertura no banco não é garantida só pelo código. Nenhum bug clássico de fórmula (sinal trocado, percentual sem dividir por 100, imposto duplicado) foi encontrado. Duas divergências de arquitetura que mudam valor calculado ficam registradas como dúvida em aberto em [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]].

> [!success] Confirmada — 12/09/2026, leitura direta do código + verificação cruzada
> Um subagent leu o repositório inteiro e produziu um relatório com citação de arquivo/trecho por achado; cada afirmação crítica foi conferida de novo, direto, com `grep`/leitura de arquivo antes de virar nota — nenhum achado abaixo depende só do relato do subagent sem checagem própria.

## Contexto

Depois de mapear como a planilha do superior calcula cada imposto (ver [[Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco)]]), Matheus pediu a comparação direta com o sistema real: quais impostos não são cobertos, quais cálculos divergem, e se existe algum cálculo errado. O pedido é para servir de base de comparação contra outra planilha no futuro.

## Metodologia

Repositório `Projeto_Sistema_Interno_V2` já clonado localmente, somente leitura — nenhuma alteração feita, nenhum `git pull`/`fetch`/`clone`. Um subagent (`general-purpose`) leu models, migrations, `impostos/funcoes_auxiliares/`, os 6 `precificacao/funcoes_auxiliares/*/formula_precificacao*.py` e testes, citando arquivo/trecho por achado. Em seguida, cada afirmação crítica foi conferida de novo, direto, com `grep` e leitura de arquivo (não só aceito o relato do subagent) — incluindo rodar o teste automatizado citado e checar as migrations reais de remoção de campo.

## Resposta

### Impostos da planilha que não existem mais (ou têm cobertura fraca) no sistema

| Campo da planilha | Situação real no código |
|---|---|
| MVA | Removido do banco de fato — existiu em `produtos/migrations/0001_initial.py`, foi apagado em `produtos/migrations/0008_remove_produto_icms_entrada_remove_produto_ipi_and_more.py`. Confirmado: não sobra nenhuma referência viva a `mva` em model/cálculo/template |
| Tributação (REDUÇÃO/TRIBUTADO/ST) | Não existe como rótulo fixo de cadastro — hoje é derivado dinamicamente lendo a nota fiscal real (`impostos/funcoes_auxiliares/creditos_fiscais_para_precificacao.py`, checando `icms_st.valor > 0`) |
| ST Valor somado ao Custo Final | Não existe mais nesse formato — confirmado lendo `calcular_custo_final()` nos 6 marketplaces: o efeito equivalente é absorvido dentro do crédito líquido de ICMS de entrada, descontado do FIXO, nunca somado ao custo |
| ICMS ENTRADA fixo (18%) | Não existe mais como percentual de cadastro — vem real, por nota fiscal, via `montar_creditos_fiscais_para_precificacao` |
| ICMS SAÍDA SP | Existe no `Produto` (`produtos/models/produto.py`), é preenchível, mas confirmado por busca no repo inteiro (`grep -rn icms_saida_sp`) que nenhuma das 6 fórmulas de precificação o lê — só aparece em `produtos/funcoes_auxiliares/filtros_produtos.py`, `contexto_tela_produtos.py`, template e admin (exibição/filtro, nunca cálculo) |
| ICMS SAÍDA MÉDIA / PIS % / COFINS % | Existe um comando real que preenche os três (`impostos/management/commands/preencher_impostos_saida.py`, puxando da planilha "Busca Legal" — ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]), mas ele roda manual, fora do pipeline automático (`core/management/commands/popular_banco.py` não o inclui). O próprio script de auditoria interno (`scripts_exploracao_ERP/duble_precificacao.py`) reconhece que nem todo produto foi alcançado por essa camada — não dá pra confirmar pelo código se hoje a maioria dos produtos está preenchida ou zerada |

Confirma com dado real (teste automatizado, ver abaixo) a mesma regra de exclusividade que o código faz, só que ao contrário do que a planilha assumia — ver próxima seção.

### Cálculos que o sistema faz diferente da planilha (arquitetura nova, não bug)

**ICMS ENTRADA convive com ICMS-ST, ao contrário da planilha.** A planilha assumia os dois mutuamente exclusivos (nunca os 2 populados na mesma linha). O sistema real trata como coexistentes na mesma nota e credita o líquido (`icms_st.valor − icms.valor`), pra não creditar o mesmo imposto 2 vezes. Confirmado rodando/lendo o teste `impostos/tests/test_nivel_3__creditos_fiscais_para_precificacao.py::test_produto_com_icms_st_usa_liquido_sem_dobrar_credito`: ICMS normal 18,1 + ICMS-ST 25,0 na mesma nota → crédito líquido 6,9. Não é erro — é o sistema modelando a realidade da nota fiscal melhor do que a planilha simplificava.

**Onde o crédito de entrada é aplicado.** A planilha subtrai `CUSTO × ICMS_ENTRADA` dentro da fórmula de ICMS de saída, recalculando por marketplace/bloco. O sistema desconta o crédito de entrada (ICMS + PIS + COFINS de entrada) uma única vez do FIXO, antes de entrar no goal seek. Mesmo espírito, estrutura diferente — não é erro, é outra forma de chegar no mesmo lugar.

**PIS/COFINS de saída usa base diferente.** A planilha calcula `Pis Confins = (Preço − Custo) × percentual`. O sistema, confirmado idêntico nos 6 marketplaces (`grep` direto em `mercado_livre/formula_precificacao.py:358-359`, `raia/formula_precificacao_raia.py:219-220`, `shopee/formula_precificacao_shopee.py:297-298`, e o mesmo padrão nos outros 3), calcula `preco_final × percentual` — mesma base do ICMS de saída, não a base "sobre a margem" que a planilha usa só para PIS/COFINS. Isso muda o valor do imposto calculado — ver [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]].

### Achado extra: inconsistência entre marketplaces (fora da planilha)

Dos 3 marketplaces que descartam faixa de frete/comissão abaixo do custo antes de testar (ML, Shopee, TikTok — os únicos que usam faixas candidatas por peso/preço com esse piso), o ML usa `custo_com_boni or custo` como piso (`mercado_livre/formula_precificacao.py:311`, parâmetro `custo_produto` de `resolver_preco_por_margem`) e Shopee/TikTok usam `produto.custo` puro (`shopee/formula_precificacao_shopee.py:205`, `tiktok/formula_precificacao_tiktok.py:222`, parâmetro `custo_produto` de `resolver_preco_por_faixa_comissao`) — 2 definições diferentes de "custo" pro mesmo propósito. Raia/Magalu/Amazon nem têm esse parâmetro (frete fixo ou loop próprio, sem faixas candidatas). Não muda o preço final resolvido dentro de uma faixa válida — só muda qual faixa é descartada de saída como "sempre abaixo do custo". Ver [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]].

### O que bate certinho com a planilha

IPI só entra no Custo Final, nunca reaparece no cálculo de saída — confirmado nos 6 marketplaces. ICMS de saída usa `icms_saida_media`, nunca `icms_saida_sp` — confirmado nos 6 marketplaces. `frete_cif_fob` é o mesmo campo (`produtos/models/produto.py:185`), mesmo papel dentro do Custo Final. Não foi encontrado nenhum sinal trocado, percentual usado sem dividir por 100, divisão por zero não tratada, ou imposto contado 2 vezes em nenhum ponto verificado.

### Existem cálculos errados?

Não foi encontrado nenhum bug clássico (sinal errado, percentual mal convertido, imposto duplicado). As 2 divergências que mudam valor calculado — base do PIS/COFINS de saída, e qual "custo" é o correto no piso de faixa — parecem decisões de arquitetura válidas do sistema atual, não erros de digitação, mas ficam como dúvida em aberto porque mudam o resultado numérico e merecem confirmação explícita (ver [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]]).

## Relacionado

- [[Descoberta - Formulas de Cada Imposto na Planilha de Precificacao do Superior (Insumos Fixos e ICMS-Pis Confins Recalculados por Bloco)]]
- [[Descoberta - Campos da Planilha de Referencia do Superior Sem Cobertura no Sistema (Levantamento Completo)]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Decisao - We Stack e Referencia, Sistema Calcula ICMS de Saida pela UF Real de Cada Venda]]
- [[Duvida - Base de Calculo do Pis Cofins de Saida e Definicao de Custo no Piso de Faixa de Frete-Comissao]]
