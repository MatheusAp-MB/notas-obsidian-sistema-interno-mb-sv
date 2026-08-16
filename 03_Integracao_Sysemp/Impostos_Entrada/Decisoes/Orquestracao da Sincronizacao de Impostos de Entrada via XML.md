---
tipo: decisao
dominio: 
criado: 10/08/2026
status: ativa
atualizado_em: 15/08/2026 19:50
relacionado: [Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Lista de CFOP Relevantes para Precificacao, Disciplina de Testes Automatizados, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Contexto Geral - Retomada em Outro Computador (Integracao Sysemp), Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP, Parcial Obsoleto de Tentativa Anterior Sobrevivia a Falha Antes da Primeira Pagina]
---

# Orquestração da Sincronização de Impostos de Entrada via XML

## Contexto

Com o watermark (`SincronizacaoXmlManifestoNotaEntrada`) e a persistência (`impostos.sincronizar_a_partir_de`) já prontos e testados separadamente, faltava a peça que liga os dois de verdade: o serviço que chama a API, filtra, seleciona a nota mais recente por produto e persiste — hoje essa lógica de filtro/seleção só existia como scripts de exploração (`filtrar_dados_por_cfop.py`, `selecionar_nota_mais_recente_por_produto.py`), operando em arquivo, não em código de produção.

## Decisão 1 — Dado intermediário em disco, não só em memória

Discussão inicial propôs processar tudo em memória (API → filtro → seleção → banco, sem passar por arquivo). Usuário discordou: pra algo tão importante quanto imposto, com volume grande e diverso de registros, precisa dar pra abrir e conferir o dado em cada etapa — mesma filosofia de "XML é fonte única de verdade" já usada no domínio. Reforça também um ponto que só apareceu durante a discussão: como o guarda-chuva de `impostos` foi decidido **sem histórico** (sempre sobrescreve), esses arquivos intermediários são a única coisa que poderia mostrar "o que era esse dado antes de mudar".

## Decisão 2 — 3 arquivos fixos, sempre sobrescritos (sem 1 arquivo por execução)

Ajuste sobre a decisão 1: não é 1 arquivo novo por execução (isso viraria uma pasta lotada com o tempo) — são 3 arquivos de nome fixo, cada 1 sempre sobrescrito na próxima sincronização. Mesma filosofia "sem histórico, sempre sobrescreve" já usada no guarda-chuva de `impostos` — consistência entre as 2 camadas. Motivo adicional do usuário: dado de API é caro (rate limit, throttle) — guardar o retorno bruto evita precisar rechamar a API só pra reconstruir o que já foi buscado.

Arquivos, em `integracao_sysemp/retorno_api/dados_impostos_xml_entrada/` (pasta ignorada no `.gitignore` — dado fiscal real não vai pro git):
- `XML_Manifesto_NF_Bruto.json` — resposta crua da API.
- `XML_Manifesto_NF_Filtrado.json` — pós-filtro de CFOP.
- `XML_Manifesto_NF_notas_mais_recentes_por_produto.json` — 1 registro por Código Barras, já selecionado.

## Decisão 3 — Erro individual não trava o lote; erro total impede o watermark de avançar

2 categorias de falha, tratadas de formas diferentes:
- **Código Barras sem `Produto` correspondente no banco** — não é erro, é esperado (produto ainda não cadastrado no sistema). Pula e segue.
- **Registro malformado (falha no parse do XML ou na persistência)** — vira 1 entrada em `XML_Manifesto_NF_Erros.json`, indexado por Código Barras — não é log de execução, é lista de **pendências abertas**: quando aquele mesmo produto sincronizar com sucesso numa rodada futura, a pendência é removida. Não trava o resto do lote, e não impede o watermark de avançar (erro individual ≠ falha total).
- **Falha total (erro de rede/API na busca)** — aí sim `registrar_falha()` é chamado e o watermark não avança — mesma regra já estabelecida em [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]].

## Decisão 4 — Onde mora o código

Tudo dentro do app já existente `integracao_sysemp` (é literalmente o papel dele — orquestrar a sincronização), num pacote novo `integracao_sysemp/servicos/`, 1 responsabilidade por arquivo (mesmo padrão de camadas do `api_sysemp`):
- `arquivos_retorno_api.py` — único ponto de leitura/gravação dos 4 jsons fixos.
- `filtro_cfop.py` — `filtrar_por_cfop()`, função pura (recebe/devolve lista em memória, não sabe de disco).
- `selecao_nota_recente.py` — `selecionar_nota_mais_recente_por_produto()`, função pura.
- `erros_sincronizacao.py` — `registrar_erro()`/`remover_erro()` sobre as pendências.
- `orquestrador.py` — `sincronizar_impostos_entrada_xml()`, ponto de entrada único, o único que conhece a ordem completa.

Comando novo pra disparar manualmente: `manage.py sincronizar_impostos_entrada`. O agendamento automático (`iniciar_servidor`, ainda não implementado) fica pra depois — não misturado nesta decisão.

## Decisão 5 — Cálculo da janela de busca migrou para o próprio model do watermark

Método novo `SincronizacaoXmlManifestoNotaEntrada.calcular_janela_da_proxima_busca()` — a conta de "qual período pedir na próxima chamada" depende só dos campos que já moram no model (`data_final_cobertura`, `MARGEM_DE_SEGURANCA_DIAS`), então a lógica foi adicionada ali, não no orquestrador — mesmo raciocínio de `esta_desatualizada()`. Nova constante `DATA_INICIAL_PRIMEIRA_CARGA = date(2020, 5, 1)` (mesma data já validada manualmente, ver [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]]).

## Implementado e validado (10/08/2026 00:55)

- Método `calcular_janela_da_proxima_busca()` adicionado a `integracao_sysemp/models.py` — 3 cenários novos testados (primeira vez, com cobertura, sem `data_referencia`), mantendo os 100% de cobertura já existentes do model.
- Pacote `integracao_sysemp/servicos/` completo: `arquivos_retorno_api.py`, `filtro_cfop.py`, `selecao_nota_recente.py`, `erros_sincronizacao.py`, `orquestrador.py`, mais o comando `manage.py sincronizar_impostos_entrada`.
- Testes: Nível 0 para as 2 funções puras e para os módulos de arquivo/erro (usando `tmp_path`, nunca tocando a pasta real), Nível 3 para o orquestrador completo (`ApiSysemp` mockada como caixa-preta, banco real de teste) — 6 cenários reais + 1 xfail por arquivo, cobrindo: fluxo feliz de ponta a ponta, guarda de "não desatualizado" (não chama API), falha total na API (watermark não avança, nenhum json gravado), Código Barras sem produto (pulado sem erro), registro malformado (vira pendência, resto do lote segue, watermark avança), e pendência antiga sendo removida ao sincronizar bem.
- **Resultado final: 21 testes reais + 5 xfail propositais, 100% cover / 0 Miss / 0 BrPart** em todos os módulos de `integracao_sysemp/servicos/` e em `integracao_sysemp/models.py`.
- Grounding feito lendo o código real já commitado (`dados_xml_nf.py`, `api_sysemp/tests/`) antes de escrever o orquestrador — confirmou os nomes exatos de campo do registro cru (`Código Barras`, `NR NF`, etc.) e o nível certo de mock pra API (caixa-preta via `ApiSysemp`, não `requests.post` — isso já é exaustivamente testado em `api_sysemp/tests/`).

## Implementado e validado (10/08/2026 02:00) — instrumentação e 1ª rodada real

- **Relatório estruturado, não dict.** `sincronizar_impostos_entrada_xml()` devolve `RelatorioDeSincronizacao` (dataclass) — tempo de cada fase (`busca_api`, `salvar_bruto`, `filtro_cfop`, `salvar_filtrado`, `selecao_nota_recente`, `salvar_selecionados`, `persistencia_no_banco`, `total`, todos em segundos, `None` quando a fase não rodou) + contagens (`produtos_selecionados`/`sincronizados`/`sem_correspondencia`/`com_erro`). Motivo: decidir sobre otimizar a gravação em lote medindo primeiro, não adivinhando — e usar objeto estruturado, não dict cru (mesma filosofia do resto do projeto).
- **Callback opcional `informar_fase(mensagem: str)`** — o orquestrador nunca imprime nada sozinho; o comando (`manage.py sincronizar_impostos_entrada`) injeta um callback que atualiza um spinner (`rich.progress`) com a fase atual, e repassa o `ao_avancar_pagina` já existente no `api_sysemp` pra progresso página a página durante a busca.
- **Bug real corrigido**: `calcular_janela_da_proxima_busca()` devolve `date`, mas `listar_periodo_completo()` exige string ISO — o orquestrador não convertia. Corrigido com `.isoformat()` na chamada. Mock de teste reforçado com `assert isinstance(..., str)` (o mock antigo aceitava qualquer tipo, por isso não pegou o bug).
- **1ª rodada real, completa, contra a API (carga histórica desde 2020-05-01):**
  - Tempo: `busca_api` 299,5s (93%), `persistencia_no_banco` 20,6s (6,4%), total 5m21s.
  - **Resposta medida pra pergunta original ("vale otimizar a gravação em lote?"): não** — o gargalo é o throttle da API (1s/página), não o banco. Bulk write economizaria no máximo os 6,4% da persistência.
  - Contagens: 3791 produtos selecionados, 1416 sincronizados (37%), 2055 sem `Produto` correspondente (54%), 320 com erro (8,4%).
  - Confirmado: rodar o comando de novo agora é no-op puro (`esta_desatualizada()` bloqueia, watermark já em dia) — e sincronizações futuras nunca voltam a reler o histórico antigo (só a janela nova). Os erros/decisões sobre notas antigas não se resolvem com o tempo, só com reprocessamento deliberado.

## Achado real — campos de imposto vindo `null` da API (320 casos, não resolvido)

Os 320 produtos que foram pra `XML_Manifesto_NF_Erros.json` falham todos com a mesma mensagem genérica (`float() argument must be a string or a real number, not 'NoneType'`). Investigado com dado real (não suposição) — o EAN `7909436946186` (NF 188419, CFOP 1.403, fornecedor "MAQUINAS AGRICOLAS JACTO S.A.") tem `Custo Total`/`Custo Unitário` reais (32052,24/1780,68), mas **todos** os campos de ICMS, ICMS ST, ICMS Ret, IPI, PIS e COFINS vêm `null` — e até o `NCM` (campo teoricamente obrigatório em qualquer NF-e) também vem `null`. Não parece "imposto zero de verdade" — parece dado incompleto do lado da Sysemp pra essa nota específica.

**3 caminhos possíveis, decisão de negócio ainda não tomada:**
1. Tratar `null` como `0` — sincroniza normal, mas grava "imposto zero" pra um produto que pode não ter imposto zero de verdade (risco: mascarar dado fiscal incompleto).
2. Manter como está hoje (pula, vira pendência) — nunca inventa dado, mas o produto fica sem NENHUM registro de imposto, mesmo já tendo o custo.
3. Persistir o que existe (custo), deixar os campos de imposto realmente `null` no banco (não zero) — mais correto, mas exige alterar as 6 tabelas de `impostos` (`null=True`), app já fechado/testado.

**Além da decisão do `null`, falta resolver:** como reprocessar especificamente esse histórico antigo depois que o código for corrigido — sincronizações futuras não vão voltar a essas notas de 2020-2021 por conta própria.

## Decisão do usuário (10/08/2026, 12:05) — opção 1 escolhida: `null` vira `0`

Caminho 1 escolhido, explícito: "null deve virar 0... é o que faz mais sentido... se não vai ter vários erros e ifs que vamos ter que tratar de número multiplicado por null. Melhor tratar como 0. E deixar isso explícito." Motivo direto do usuário: não é só sobre o dado ficar "certo" — é evitar que a ausência de tratamento espalhe checagem de `null` por todo cálculo/soma adiante no pipeline (impostos entram em fórmulas de precificação, no dublê e no futuro real).

Implementado em `integracao_sysemp/servicos/dados_xml_nf.py` (ver [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]] pra essa mudança de local) — 2 funções puras, únicas responsáveis por essa conversão:
- `_float_ou_zero(valor)` — `float(valor) if valor is not None else 0.0`.
- `_int_ou_zero(valor)` — `int(valor) if valor is not None else 0`.

Aplicado nos 6 impostos (base_calculo, aliquota, reducao, valor, cst — onde existir), nunca em `Custo Total`/`Custo Unitário`/`Qtde` — esses continuam com `float()` direto de propósito, porque `null` ali é um problema mais grave (não é o "imposto pode não existir de verdade" do achado original) e não deve ser mascarado.

Efeito colateral esperado e aceito: quando `Base Calculo PIS`/`Base Calculo COFINS` vem `null` (vira 0.0), a fórmula de redução (`_calcular_percentual_de_reducao`) calcula `reducao = 100.0` — matematicamente consistente (base zero = 100% de redução sobre o custo total), sem tratamento especial.

**Testado** (`integracao_sysemp/servicos/tests/test_nivel_0__dados_xml_nf.py`, Nível 0): 8 cenários reais + 1 xfail — registro sem null (comportamento original intacto), cada 1 dos 6 impostos com todos os campos null isolado, reprodução do caso real do vault (EAN 7909436946186, todos os 6 impostos null ao mesmo tempo, custo intacto) — **100% cover / 0 Miss / 0 BrPart**.

**Resolve daqui pra frente, não retroativamente** — os 320 produtos que já erraram na 1ª rodada real (10/08, 02:00) continuam sem registro de imposto no banco. Ver seção "Em aberto" abaixo.

## Validação real em produção (10/08/2026, 12:30) — carga fresca no banco do escritório

Depois de aplicado e commitado o fix, o usuário rodou `manage.py sincronizar_impostos_entrada` de verdade no PC do escritório. `busca_api` levou 499,9s (~8min) — mesma ordem de grandeza da carga histórica completa, não de uma janela incremental de 7 dias. **Correção de uma suposição anterior deste registro: não existe 1 banco de produção compartilhado entre os 2 PCs — cada PC (casa/escritório) tem seu próprio banco local MySQL, independente**, confirmado direto com o usuário. Por isso o watermark desse banco nunca tinha sido setado, e a sincronização fez carga completa do zero (2020-05-01 até hoje).

Números da rodada: 3791 produtos selecionados (igual à rodada de casa — mesma API, mesmo catálogo de `Produto`), 1736 sincronizados, 2055 sem `Produto` correspondente, **0 com erro** (eram 320 antes do fix). `1736 = 1416` (que já sincronizavam) `+ 320` (que antes travavam por campo de imposto `null`) — confirma em escala real, não só nos testes de Nível 0, que o `null→0` funciona certo.

**Importante: isso NÃO é reprocessamento do histórico antigo de verdade.** O banco do escritório nunca tinha rodado essa sincronização antes — fez carga do zero já com o código corrigido, nunca teve os 320 erros pra começo. O banco de casa (se ainda tiver o watermark cobrindo o período e os 320 registrados em `XML_Manifesto_NF_Erros.json` de lá) continua com essa pendência real — sincronizações futuras lá só olham a janela nova (7 dias), nunca voltam a essas notas de 2020-2021 por conta própria.

## Em aberto (próximos passos reais)

- ~~Decisão do `null`~~ — **decidido em 10/08/2026, 12:05: vira 0** (ver seção acima). Implementado, testado (Nível 0) e **validado em produção com carga real** (12:30): 1736 sincronizados, 0 erro.
- **Reprocessamento do histórico antigo dos 320 casos que já erraram no banco de CASA** — segue em aberto, sem desenho. A carga fresca no banco do escritório NÃO conta como reprocessamento (nunca teve a pendência pra começo, ver seção acima) — só prova que o código está correto. Ainda falta decidir como reprocessar pra qualquer banco que já tenha essa pendência registrada.
- **Investigar os produtos sem `Produto` correspondente (2055/54% em 10/08, 2864/77,6% em 15/08)** — descontinuado de verdade, divergência de EAN, ou (hipótese mais forte, ver seção "Nova rodada real" abaixo) filtro da tela do ERP excluindo item de uso/consumo por padrão. Usuário vai conferir com calma na segunda-feira (17/08).
- Implementação do comando `manage.py iniciar_servidor` (checa/sincroniza antes de subir o servidor) — ainda não escrito; hoje o disparo é manual via `sincronizar_impostos_entrada`.
- Cooldown entre tentativas de falha consecutivas — `data_ultima_chamada` sustenta isso, mas nenhuma regra foi definida.
- ~~Oficializar `dados_xml_nf.py` fora de `scripts_exploracao_ERP/`~~ — **feito em 10/08/2026, 12:05**, ver [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]].

## Achado real — parcial obsoleto de tentativa anterior sobrevivia a falha antes da 1ª página (15/08/2026, 16:00)

Ver detalhe completo em [[Parcial Obsoleto de Tentativa Anterior Sobrevivia a Falha Antes da Primeira Pagina]]. Resumo: `XML_Manifesto_NF_Bruto_Parcial.json` só era limpo após sucesso total — se uma tentativa falhasse antes de qualquer página, o parcial de uma falha ANTERIOR e sem relação ficava no disco parecendo pertencer à falha atual. Corrigido: limpeza movida pro início de cada tentativa. 100% cover mantido.

## Nova rodada real (15/08/2026, ~19:00) — banco diferente do escritório, hipótese nova sobre "sem correspondência"

Usuário rodou `manage.py sincronizar_impostos_entrada` num PC/banco diferente do documentado em 10/08 (cada banco é local e independente, ver seção acima). Resultado: `busca_api` 251,6s, **3691 produtos selecionados, 827 sincronizados, 2864 sem `Produto` correspondente (77,6%), 0 com erro**. O 0 erro confirma, numa carga real do zero, que todas as correções de hoje seguram (bonificação removida do filtro, contenção de erro por registro, `null→0`, decimal) — ver [[Contencao de Erro por Registro no Filtro e Selecao de Impostos de Entrada]] e [[Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]].

A queda de sincronizados (1736 em 10/08 → 827 agora) não se explica só pela remoção da bonificação — essa mudança tira só ~100 registros do total selecionado (3791→3691), não o suficiente pra justificar a diferença toda.

**Hipótese do usuário (mais forte que as 2 opções antigas "descontinuado" vs "divergência de EAN"):** a tela de cadastro de produtos do ERP usada pra gerar os 2 arquivos (Ativos/Inativos) pode vir filtrada, por padrão, só pra item de catálogo real — excluindo item de uso e consumo (ex: gasolina, que aparece no XML de entrada como compra real, mas nunca seria cadastrado como "produto" de revenda). Isso bateria com a arquitetura do filtro de CFOP (só compra pra revenda) — os itens de consumo ficarem de fora do banco de `Produto` seria o comportamento CORRETO, não um bug. Suspeita adicional: o relatório usado no banco do escritório (10/08) pode ter vindo de uma tela diferente do Sysemp que trazia "tudo" (incluindo ruído) — o que infla artificialmente a correspondência de lá, tornando a proporção de agora (77,6%) potencialmente mais correta que a de antes (54%), não pior.

Sinal a favor: os 879 produtos no banco batem exatamente com o total mostrado na própria tela do ERP usada ("Página 1 de 36 — 879 produtos encontrados") — confirma que a importação reflete fielmente a tela usada; a dúvida real é só se essa tela é a certa/completa.

**Usuário vai conferir com calma na segunda-feira (17/08)** — sem ação adicional até lá.

## Relacionado

- [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Lista de CFOP Relevantes para Precificacao]]
- [[Disciplina de Testes Automatizados]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]
- [[Parcial Obsoleto de Tentativa Anterior Sobrevivia a Falha Antes da Primeira Pagina]]
