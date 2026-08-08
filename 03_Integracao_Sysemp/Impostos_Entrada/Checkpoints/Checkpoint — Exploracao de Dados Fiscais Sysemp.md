---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 07/08/2026
atualizado_em: 08/08/2026 03:40
relacionado: [Paginacao do Endpoint Manifesto Nota Entrada, Lista de CFOP Relevantes para Precificacao, Custo Medio Ponderado ou Custo Atual para Precificacao, API Sysemp So Retorna a Ultima Nota Fiscal por Produto, Custo Atual Escolhido para Precificacao dos Produtos Sysemp, Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real, Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total, Plano em Etapas do Duble de Precificacao ML]
---

# Checkpoint — Exploração de Dados Fiscais Sysemp

## Última atualização (08/08/2026 03:40) — pausa, contexto completo pra retomada

Usuário vai pausar aqui. Resumo de tudo em andamento, pra retomar sem perder o fio (nenhuma decisão de negócio nova nesta entrada, só consolidação):

**Onde as coisas estão fisicamente:**
- Vault: tudo sincronizado, este checkpoint e as notas ligadas a ele (ver `relacionado` acima) são a fonte de verdade do estado.
- Código: repositório `Projeto_Sistema_Interno_V2`, branch `dev`. Última baseline de commit confirmada foi `012b0a7` (ver entrada de 18:04 do dia anterior); depois disso houve mais commits (`77ed72d` e possivelmente novos) que ainda não foram formalmente revisados/commitados nesta sessão — os scripts abaixo existem no ambiente local do usuário, mas o commit deles não foi confirmado.
- Scripts relevantes, todos em `scripts_exploracao_ERP/`: `explorar_manifesto_nota_entrada.py` (busca bruta, paginação corrigida), `filtrar_dados_por_cfop.py` (filtra CFOP válido, achata a estrutura nova da API pra 1 linha = 1 item, salva `dados_filtrados.json`), `selecionar_nota_mais_recente_por_produto.py` (escolhe 1 nota por produto — Data Entrada da Nota + desempate por maior NF, sem separar fornecedor —, salva `nota_mais_recente_por_produto.json` como dict indexado por Código Barras, com TODOS os campos), `dados_xml_nf.py` (dataclasses de domínio: `IdentificacaoProduto`, `IdentificacaoNF`, `DadosNF`, `IdentificadorRegra`, `IcmsSt`, `Icms`, `IcmsRet`, `Ipi`, `Pis`, `Cofins` — com campo `reducao` calculado —, `Custos`, compostas em `DadosXmlNF`), `consultar_produto.py` (demonstração de uso do `DadosXmlNF`), `duble_precificacao_ml.py` (o dublê completo, 10 etapas, só leitura no banco).
- `calcular_custo_atual_por_produto.py` (antigo) está **substituído** por `selecionar_nota_mais_recente_por_produto.py` + `dados_xml_nf.py` — pode ser apagado.

**A sequência de descobertas do dia, em ordem:**
1. A API Sysemp foi remodelada pelo suporte (chamado aberto sobre o campo `Entrada`) — `retorno` agora agrupa por NOTA com itens dentro de `itens_nf`, não é mais 1 item = 1 registro solto. Isso explicou a queda de 578 → 163 registros no mesmo período (mesma quantidade de itens, só reagrupados).
2. O campo `Entrada` (que sempre repetia `Emissão`, um bug conhecido) foi substituído por `Data Entrada da Nota` (nível da nota, nulável) — **validado 2/2** contra a entrada física real que o usuário confirma ter registrado. Considerado confiável agora.
3. `filtrar_dados_por_cfop.py` e o script de seleção de nota mais recente foram reescritos pra nova estrutura.
4. Correção de entendimento: a preocupação anterior sobre "notas de fornecedores diferentes empatando" era suposição errada do Claude — 1 produto sempre vem de 1 fornecedor. Simplificado.
5. `DadosXmlNF` criado — dataclasses compostas por contexto, cada uma com fábrica própria (`a_partir_do_registro`) — registrado como exemplo em [[Modelagem de Objeto e Encapsulamento]].
6. Campo `reducao` adicionado a `Pis`/`Cofins` (a API não devolve isso direto, só pra ICMS/ICMS ST) — calculado 1x na fábrica, recebendo `custo_total` como parâmetro (dado de outra dataclass) — registrado como exemplo em [[Integridade e Fonte Unica de Dado]].
7. Investigação no código real do sistema (não só Sysemp): `Produto` já tem `pis_percentual`/`cofins_percentual` esperando esse dado desde 23/07, mas nenhuma fórmula usa ainda — existe uma "Frente fiscal" pausada no próprio código esperando essa definição. Hoje todo dado fiscal vem de 1 planilha manual (`Planilha_Importar_Pos_Macro.xlsm`).
8. Decisão: não mudar o banco ainda — construir um "dublê" isolado da `FormulaPrecificacao` real do ML, planejado em 10 etapas de baixo pra cima (ver [[Plano em Etapas do Duble de Precificacao ML]]).
9. Dublê implementado e validado fim a fim pro produto teste — preço final R$ 408,90, matemática conferida manualmente em cada etapa (FIXO, denominador, resultado final).

**Estado das dúvidas antigas, todas resolvidas ou superadas:**
- ~~API só retorna última nota~~ → era paginação (resolvido há 2 dias).
- ~~Campo Entrada ≠ entrada física~~ → resolvido pela remodelagem da API (`Data Entrada da Nota`).
- ~~Custo médio vs. custo atual~~ → custo atual, decidido pelo superior.
- ~~Fornecedores diferentes empatando~~ → não é risco real, era suposição errada.

**Em aberto de verdade, pra continuar quando o usuário voltar:**
- Validar a fórmula de redução (Etapa 7 do dublê) com produto real de ICMS/ICMS ST ≠ 0 — o produto teste (7908050719121) tinha alíquota 0% nesses 2, então não testa nada.
- Conferir se `icms_saida_percentual`/`pis_cofins_saida_percentual`/`frete_cif_fob_percentual` = 0 no banco real pra esse produto é dado de verdade ou campo vazio.
- Confirmar com o usuário a escolha feita na Etapa 8 (PIS e COFINS como créditos separados, não combinados no FIXO).
- Testar o dublê com mais produtos.
- Decidir quando/como isso vira escrita real no banco, e a ordem de precedência com a planilha manual atual.
- Replicar o dublê pras outras 5 fórmulas de marketplace, se fizer sentido.
- Sub-questão de alíquota (custo atual) e tratamento de bonificação como nota mais recente — ambas adiadas de propósito, ainda sem decisão.
- Confirmar/fazer o commit dos scripts no repositório de código (não verificado nesta sessão).

## Última atualização (08/08/2026 03:21)

Investigado como o dado fiscal chega hoje na precificação real (código do sistema, não só o pipeline Sysemp): `Produto` já tem `pis_percentual`/`cofins_percentual` prontos desde 23/07, esperando exatamente esse dado — mas nenhuma fórmula usa ainda, e todo campo fiscal hoje vem de 1 planilha Excel manual (`Planilha_Importar_Pos_Macro.xlsm`), sem nenhuma ponte com a Sysemp. Existe até uma "Frente fiscal" (separar PIS/COFINS na fórmula de verdade) documentada como pausada no próprio código, esperando essa definição.

Decisão do usuário: não mudar o banco ainda. Em vez disso, construir um **"dublê"** da `FormulaPrecificacao` real do ML — script isolado, só leitura no banco, que reproduz a fórmula de verdade mas com os dados fiscais vindos do `DadosXmlNF` em vez do `Produto`. Planejado em 10 etapas, de baixo pra cima (mesma lógica dos Níveis de teste): identificação do produto (banco) → coleta/armazenagem (banco/config) → identificação e custo da NF (XML) → impostos brutos (XML) → cálculo de cada imposto por unidade (novo — `base_calculo = custo_unitário × (1 − redução/100)`, derivado algebricamente da própria definição de `redução`) → FIXO → denominador → resto do fluxo real (frete/goal-seek, reaproveitado). Ver [[Plano em Etapas do Duble de Precificacao ML]] pro plano completo e os pontos em aberto.

**Próximo passo real:** implementar e validar etapa por etapa, com calma, começando pela Etapa 1 (identificação do produto).

## Última atualização (08/08/2026 01:55)

`filtrar_dados_por_cfop.py` reescrito pra nova estrutura da API (achata `retorno`/`itens_nf` de volta pra 1 linha = 1 item). `calcular_custo_atual_por_produto.py` foi substituído por `selecionar_nota_mais_recente_por_produto.py` — objetivo corrigido: em vez de resumir os dados da nota mais recente em poucas colunas (o script antigo jogava fora campos de imposto), agora guarda a nota inteira, sem cortar campo, indexada por `Código Barras` (dict, não lista) em `nota_mais_recente_por_produto.json`. Desempate por maior NF simplificado — a checagem de fornecedores distintos foi removida (correção de entendimento: 1 produto sempre vem de 1 fornecedor, não é risco real).

Criados `dados_xml_nf.py` (dataclasses de domínio: `IdentificacaoProduto`, `IdentificacaoNF`, `DadosNF`, `IdentificadorRegra`, `IcmsSt`, `Icms`, `IcmsRet`, `Ipi`, `Pis`, `Cofins`, `Custos`, compostas em `DadosXmlNF`, cada uma com `@classmethod a_partir_do_registro()`) e `consultar_produto.py` (lê o json por EAN e monta o objeto) — ver exemplo registrado em [[Modelagem de Objeto e Encapsulamento]]. Adicionado campo `reducao` em `Pis`/`Cofins`, calculado a partir de `Base de Cálculo` e `Custo Total` (a API não devolve isso direto, só pra ICMS/ICMS ST) — ver [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]] e o exemplo de design em [[Integridade e Fonte Unica de Dado]]. Validado com dado real: produto 7908050719121, redução 48,1%, PIS/COFINS batendo com os valores da API.

**Próximo passo real:** continuar validando `DadosXmlNF` com mais produtos, depois começar os testes de imposto de verdade (objetivo declarado pelo usuário: "ter os impostos corretos que preciso").

## Última atualização (07/08/2026 21:12)

Chamado que o usuário tinha aberto com o suporte Sysemp sobre o campo `Entrada` (ver 14:08) voltou — mas não como correção pontual: a Sysemp remodelou a estrutura inteira do endpoint `listarManifestoNotaEntrada`. `retorno` agora agrupa por NOTA (163 no período testado), com os itens dentro de `itens_nf` (578 no total — mesma contagem de antes, nenhum dado perdido, só reestruturado). Campo `Entrada` não existe mais; substituído por `Data Entrada da Nota`, no nível da nota e nulável.

`investigar_ocorrencias_de_produto.py` reescrito pra navegar a estrutura nova (nota → `itens_nf`) e revalidado: mesmas 21 ocorrências do produto teste, mesma distribuição de CFOP (15x 1.102, 5x 1.916, 1x 1.910) — reestruturação não perdeu nada.

**Campo `Entrada` resolvido de fato:** `Data Entrada da Nota` validado 2 de 2 contra os mesmos casos do achado original (NF 101445 e NF 101561) — bate exatamente com a entrada física real que o usuário confirma ter registrado (05/08 pras 2). Ver seção "Resolução" em [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]].

**Correção de entendimento (mea culpa):** a preocupação levantada em 14:08 sobre empate entre notas de fornecedores diferentes pro mesmo produto era baseada numa suposição errada minha (de que 1 produto poderia vir de fornecedores distintos). O usuário confirma: na prática, 1 produto sempre vem de 1 fornecedor/fabricante — esse cenário não é um risco real do negócio. A distinção "mesmo fornecedor vs. fornecedores diferentes" em `calcular_custo_atual_por_produto.py` pode ser simplificada/removida quando o script for reescrito.

**Pendente (próximo passo real):** reescrever `filtrar_dados_por_cfop.py` e `calcular_custo_atual_por_produto.py` pra nova estrutura da API — o segundo também passa a usar `Data Entrada da Nota` (agora confiável) em vez de `Entrada`, e remove a checagem de fornecedores distintos.

## Última atualização (07/08/2026 18:04)

Troca de PC do usuário a partir daqui — sem trabalho novo de código/decisão nesta entrada, só um reforço registrado na descoberta do campo `Entrada`: nos 2 casos confirmados, `Entrada` da API é sempre idêntico à `Emissão` da própria API (não só "diverge da tela do ERP") — ver [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]]. Linha de base de código confirmada: repositório em `012b0a7` (branch `dev`, GitHub) — nada pendente de commit no lado do código Sysemp; o vault está sincronizado com o GitHub em tempo real nesta sessão (confirmado via `git fetch`, sem necessidade de push manual, diferente do que era esperado antes).

## Última atualização (07/08/2026 14:08)

Construindo o pipeline de custo atual (`calcular_custo_atual_por_produto.py`, novo — filtra CFOP válido → agrupa produto+data → pega a data mais recente → exibe em tabela Rich), apareceu um "empate" (2 notas do mesmo produto/fornecedor, aparentemente na mesma data) que virou uma descoberta bem maior: comparando o registro cru da API com a tela real do ERP pra essas 2 notas, `Emissão` bate mas `Entrada` diverge — API diz 31/07/2026, tela do ERP diz 05/08/2026, pra exatamente a mesma nota fiscal. Hipótese: o campo `Entrada` do endpoint `listarManifestoNotaEntrada` reflete a data do manifesto/confirmação fiscal (perto da Emissão), não a entrada física real da mercadoria no estoque. Ver [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]] pro achado completo.

**Decisão do usuário:** não existe outro endpoint Sysemp disponível agora pra pegar a entrada física real — segue trabalhando com o campo `Entrada` da API como está, aceitando a limitação conhecida, pra não travar o avanço. Fica registrado como risco sistêmico (pode afetar qual nota é escolhida como "mais recente" em qualquer produto, não só neste caso) — revisar se/quando o suporte da Sysemp confirmar outro campo/endpoint.

Também corrigido nesta sessão: `filtrar_dados_por_cfop.py` estava com a lista de CFOP desatualizada (ainda tinha 1.916/2.916, faltava 1.403/2.403) — corrigido pra bater com a decisão de 11:26. Critério de desempate pra 2 notas do mesmo produto na mesma data definido: maior número de NF (fornecedores numeram sequencialmente) — só válido entre notas do MESMO fornecedor, com aviso crítico separado se o empate envolver fornecedores diferentes.

## Última atualização (07/08/2026 11:26)

Reunião com o superior aconteceu (item 7 da atualização anterior). 2 resultados: **custo atual** escolhido (não médio ponderado) — ver [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]], que resolve [[Custo Medio Ponderado ou Custo Atual para Precificacao]]; e a lista de CFOP válidos ampliada de 4 pra 6 códigos, com **1.403/2.403** entrando como compra/bonificação válida — ver atualização em [[Lista de CFOP Relevantes para Precificacao]]. Sub-questão de alíquota não tratada, continua em aberto. Novo ponto em aberto, adiado de propósito pelo usuário: como tratar bonificação (custo zero) quando ela é a nota mais recente de um produto sob a lógica de "custo atual" — decisão explícita de não resolver agora, só "conforme formos seguindo".

Fora do domínio fiscal: a pasta vazia `03_ERP_Analytics_HUB/` (criada antes deste mundo ganhar nome definitivo) foi removida — `03_Integracao_Sysemp/` confirmado como nome definitivo do mundo.

**Próximo passo real:** começar a implementar a lógica de custo atual em código (ainda não escrita — só as decisões de negócio estavam prontas até aqui).

## Última atualização (07/08/2026 01:32) — histórico

Resumo do dia, na ordem em que aconteceu — pensado pra servir de roteiro de apresentação.

**1. CFOP identificados.** Pesquisado o significado de CFOP 1949 (genérico/coringa), 1916 (retorno de conserto), 1101 (compra pra industrialização) e 1910 (bonificação/doação/brinde), pra completar o que o usuário já sabia (1556 uso/consumo, 2102/1102 revenda, 1653 combustível).

**2. Primeira versão da lista de CFOP pra revenda.** Definida em 3 categorias: revenda (1.102/2.102), bonificação (1.910/2.910), retorno de conserto (1.916/2.916). Script `filtrar_dados_por_cfop.py` criado e validado contra amostra real (49 de 100 registros mantidos).

**3. Investigação da "última nota por produto".** Usuário desconfiou que um produto (7908050719121) que ele sabia ter comprado várias vezes só aparecia 1 vez na API. Descoberta inicial (errada): pensava-se que a API deduplicava pra só a última nota — ver [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]].

**4. Causa real: paginação não tratada.** Toda chamada usava `offset='0'`. Confirmado com testes manuais (offset=0 e offset=100 trazendo NFs diferentes) que o endpoint pagina em blocos de ~100 registros, sem qualquer campo no envelope de resposta (`qtde`) que informe o total real do período.

**5. Correção implementada e validada.** `ImpostosEntradaXML.listar_periodo_completo()` — loop de paginação que para só em página vazia. Validado contra a API real: 100 → 578 registros no período maio–agosto; o produto teste foi de 4 para 21 ocorrências reais, recuperando as notas de 1000 e 8 unidades que o usuário sabia ter dado entrada. Ver [[Paginacao do Endpoint Manifesto Nota Entrada]].

**6. CFOP revalidado com histórico completo.** As 21 ocorrências do produto teste confirmaram a leitura teórica: 15x CFOP 1.102 (compras reais, 30–1344 unidades), 5x CFOP 1.916 (retorno de conserto, sempre poucas unidades: 1, 6, 4, 6, 2), 1x CFOP 1.910 (bonificação). Decisão fechada: custo de aquisição confiável só em 1.102/2.102 — ver [[Lista de CFOP Relevantes para Precificacao]]. A paginação corrigida também eliminou o "risco de perda de histórico" que motivou a descoberta do item 3: as compras reais continuam presentes independente de quantas notas de bonificação/conserto existirem no meio.

**7. Em aberto pra amanhã.** Custo médio ponderado vs. custo atual pra precificação, e se faz sentido tirar média de alíquota — ver [[Custo Medio Ponderado ou Custo Atual para Precificacao]]. Também em aberto: se vale pedir ao suporte Sysemp um endpoint de histórico por produto mais direto, e se o loop de paginação precisa de um limite de segurança contra loop infinito.

## Próximos passos

- ~~Reunião com o superior (07/08/2026): decidir custo médio vs. custo atual.~~ — feito, custo atual escolhido.
- ~~Implementar a lógica de custo atual em código.~~ — feito, `calcular_custo_atual_por_produto.py` criado e funcionando (com a limitação de `Entrada` registrada como risco conhecido).
- ~~Confirmar com o suporte da Sysemp se existe campo/endpoint pra entrada física real da mercadoria.~~ — feito: a Sysemp remodelou a API; `Data Entrada da Nota` resolve isso, validado 2/2 — ver [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]].
- ~~Reescrever `filtrar_dados_por_cfop.py` e `calcular_custo_atual_por_produto.py` pra nova estrutura da API.~~ — feito (ver 01:55): o segundo foi substituído por `selecionar_nota_mais_recente_por_produto.py` + `dados_xml_nf.py`.
- Validar `DadosXmlNF` com mais produtos (só 7908050719121 testado até agora).
- Implementar e validar, etapa por etapa, o Dublê de Precificação ML — ver [[Plano em Etapas do Duble de Precificacao ML]].
- Validar a fórmula de redução (etapa 7 do dublê) com produto real de ICMS/ICMS ST ≠ 0.
- Rodar `listar_periodo_completo` contra o histórico completo (desde a fundação da empresa), não só maio–agosto.
- Revisitar a lista de CFOP com o histórico completo (pode aparecer CFOP não visto ainda) — agora com 6 códigos, não 4.
- Decidir se precisa de limite de segurança no loop de paginação.
- Em algum momento (adiado de propósito): decidir como "custo atual" trata bonificação sendo a nota mais recente.

## Relacionado

- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Lista de CFOP Relevantes para Precificacao]]
- [[Custo Medio Ponderado ou Custo Atual para Precificacao]]
- [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]]
- [[Custo Atual Escolhido para Precificacao dos Produtos Sysemp]]
- [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]]
