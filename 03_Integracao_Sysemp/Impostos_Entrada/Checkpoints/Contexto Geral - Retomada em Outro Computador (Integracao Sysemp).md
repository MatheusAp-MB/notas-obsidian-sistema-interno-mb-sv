---
tipo: checkpoint
dominio: 
status: ativo
criado: 10/08/2026
atualizado_em: 13/08/2026 15:20
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Orquestracao da Sincronizacao de Impostos de Entrada via XML, Disciplina de Testes Automatizados, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Estrutura e Convenções do Vault, Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP, Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp, Modal de Produto — Aba Impostos (Entrada e Saida), Modal Mostrava Impostos Por Nota Em Vez de Por Unidade, Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]
---

# Contexto Geral — Retomada em Outro Computador (Integração Sysemp)

> Nota auto-contida, criada em 10/08/2026 porque o trabalho vai continuar em outro computador e a conversa atual não migra junto. Serve como ponto de partida único — leia esta nota primeiro, depois siga os links pra detalhe quando precisar. Se algo aqui parecer desatualizado, o vault é a fonte da verdade — os links levam ao original.
>
> Domínio: **Integração Sysemp / Impostos de Entrada** — completamente separado do domínio Agenda de Vídeos (que tem sua própria nota equivalente, [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]], não relacionada a este trabalho).

## Notas que deve ler a seguir (nesta ordem)

1. **Pasta `02_Sistema_Interno/Regras_de_Comportamento/` inteira** — sempre primeiro, sem exceção. Define como agir neste projeto (git, testes, vault, comunicação). Em especial: [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]] (3 incidentes reais documentados nesta mesma frente — leia antes de criar qualquer arquivo ou executar qualquer coisa) e [[Disciplina de Testes Automatizados]].
2. **Esta nota** (você já está aqui) — snapshot geral + "Status real agora" abaixo.
3. [[Checkpoint — Exploracao de Dados Fiscais Sysemp]] — histórico completo, cronológico, de toda a exploração fiscal desde 06/08/2026.
4. [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]] — decisão mais recente e mais importante pra continuar: tem os 2 itens bloqueantes (decisão do `null` e reprocessamento do histórico antigo).
5. [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]] e [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]] — as 2 decisões que a orquestração liga.

## Onde isso vive

- Projeto: `Projeto_Sistema_Interno_V2` (Django). Repo GitHub `MatheusAp-MB/Projeto_Sistema_Interno_V2`, branch `dev`.
- Apps envolvidos: `api_sysemp` (cliente HTTP oficial, throttle/backoff/exceções, sem Django), `integracao_sysemp` (watermark `SincronizacaoXmlManifestoNotaEntrada` + `servicos/` com o orquestrador, `dados_xml_nf.py`, e desde 10/08 15:30 também o management command `reprocessar_impostos_entrada_de_json`), `impostos` (guarda-chuva `ImpostosECustosXMLEntradaProduto` + 6 tabelas-filhas + método de exibição `obter_detalhes_para_exibicao()`), e desde 10/08 15:30 também `produtos` (a tela de Produtos e o modal de detalhe do produto agora exibem os dados deste domínio — aba "Impostos", ver [[Modal de Produto — Aba Impostos (Entrada e Saida)]]). `scripts_exploracao_ERP/` guarda só os scripts de exploração manual (defasados desde a orquestração — não usar como referência de código, só histórico) e o dublê (`duble_precificacao_ml.py`) — nenhum código de produção mora mais lá, pode ser apagada a qualquer momento sem afetar o sistema real.
- Vault Obsidian: `notas-obsidian-sistema-interno-mb-sv`, mundo `03_Integracao_Sysemp/` — isolado do resto do Sistema Interno por decisão explícita (dado fiscal sensível, mundo grande o suficiente pra ter documentação própria).

## Regras de colaboração (resumo — ver notas linkadas pra nuance completa)

1. Só sincronizar (fetch) com o GitHub quando o usuário pedir explicitamente.
2. Claude nunca escreve/edita nada no repositório de código real do usuário — código é sempre entregue como texto na conversa (arquivo completo ou bloco "Localize:/Substitua por:"), nunca como arquivo criado por Claude, **mesmo pra verificação puramente interna** (3º incidente documentado — essa exceção não existe). O usuário aplica e roda localmente, e reporta o resultado real de volta.
3. Claude nunca executa código, testes ou comandos sozinho contra o projeto real — só no seu próprio clone-sandbox de leitura, e só depois que o usuário autorizar sincronizar.
4. Nunca criar tarefa/subagente sem necessidade real — planejar (Idealizar → Planejar) antes de executar.
5. Perguntas sempre em texto corrido na conversa, nunca caixinha de múltipla escolha.
6. Antes de escrever/editar qualquer nota do vault, perguntar data e hora ao usuário.
7. O vault é fonte de verdade; `LEGADO/` é arquivo morto, nunca base de decisão.
8. Mudança de código, mesmo 1 linha, sempre como diff exato ou arquivo completo — nunca descrita em prosa.
9. Ciclo de trabalho: Idealizar (discutir sem pressa) → Planejar (nomes, estrutura, sem código ainda) → Executar (código, só depois de autorizado) → Analisar/Corrigir/Otimizar/Validar. Testes sempre passam por "explicar cenário em linguagem natural, esperar confirmação" antes de qualquer teste ser escrito.
10. Nunca assumir/supor sobre dado real ou comportamento de código — sempre confirmar (ler o código real, pedir pro usuário rodar e colar o resultado, ou pedir o dado real) antes de diagnosticar ou decidir.

## O que é este domínio (modelo mental rápido)

Pipeline de ponta a ponta pra manter os impostos/custos de entrada (ICMS, ICMS ST, ICMS Ret, IPI, PIS, COFINS) atualizados no banco, vindos do XML da nota fiscal real via API do Sysemp — substituindo os campos genéricos e soltos que o `Produto` tinha antes (herdados de planilha manual).

- **`api_sysemp`** — cliente HTTP puro, camadas `ClienteApiSysemp` (transporte, throttle 1s + backoff) → `ImpostosEntradaXML` (contexto do endpoint, paginação) → `ApiSysemp` (Facade, autenticação via `.env`). 100% testado, oficializado (fora de `scripts_exploracao_ERP/`).
- **Watermark (`integracao_sysemp.models.SincronizacaoXmlManifestoNotaEntrada`)** — controla até onde a sincronização já cobriu (`data_inicial_cobertura`/`data_final_cobertura`), com margem de segurança de 7 dias. `esta_desatualizada()` decide se vale chamar a API; `calcular_janela_da_proxima_busca()` decide o período; `registrar_sincronizacao_bem_sucedida()`/`registrar_falha()` são os únicos pontos de escrita.
- **Guarda-chuva (`impostos.models.ImpostosECustosXMLEntradaProduto`)** — 1 linha por produto, sem histórico, sempre sobrescrita, com 6 tabelas-filhas ligadas (1 por tipo de imposto). Único ponto de escrita: `sincronizar_a_partir_de(produto, dados: DadosXmlNF)`.
- **Orquestrador (`integracao_sysemp.servicos.orquestrador.sincronizar_impostos_entrada_xml`)** — liga tudo: lê o watermark → busca a API → filtra por CFOP (`filtro_cfop.py`) → seleciona a nota mais recente por produto (`selecao_nota_recente.py`) → grava 3 jsons de apoio (bruto/filtrado/selecionado, sempre sobrescritos, pasta `integracao_sysemp/retorno_api/dados_impostos_xml_entrada/`, gitignored) → pra cada produto: acha o `Produto` pelo EAN, persiste ou registra pendência de erro (`XML_Manifesto_NF_Erros.json`, 4º arquivo — não é log, é lista de pendências abertas que somem quando o produto sincroniza bem de novo) → registra sucesso/falha no watermark. Devolve `RelatorioDeSincronizacao` (dataclass com tempo por fase + contagens). Disparado por `manage.py sincronizar_impostos_entrada`.

## Status real agora (13/08/2026, 15:20)

Usuário retomou esta frente depois de uma pausa longa (última atualização real era 11/08, 15:05 — nada mudou neste domínio entre 11/08 e 13/08). Aviso novo, ainda sem nenhuma ação: **a API do Sysemp passou por uma atualização — todos os nomes de campo mudaram, a pedido do próprio usuário, por melhoria de qualidade do lado do Sysemp.** O projeto (`api_sysemp` + `dados_xml_nf.py`, principalmente) precisa ser atualizado pra acompanhar.

**Nada foi feito ainda:** não recebido o mapeamento novo de campos (nem JSON de exemplo, nem changelog), e o repositório não foi sincronizado nesta sessão pra ler o código real que faz esse parsing hoje. Sessão foi interrompida logo depois desse aviso — usuário vai trocar de computador e pediu pra salvar o contexto antes de perder acesso à conversa. **Próximo passo, ao retomar:** pedir o formato novo da API (exemplo real de resposta ou changelog) e sincronizar o repo pra comparar com `api_sysemp` (cliente HTTP) e `integracao_sysemp/servicos/dados_xml_nf.py` (mapeamento atual dos campos), antes de propor qualquer diff.

## Status anterior (10/08/2026, 02:00 — histórico, ver "Status real agora" acima pro estado atual)

- Tudo commitado e no GitHub até o commit `8343dba` ("Oficializa api_sysemp e cria apps impostos e integracao_sysemp"). Mudanças feitas depois desse commit (relatório de progresso, fix `date`→`.isoformat()`, testes reforçados) estavam marcadas como "commit/push ainda não confirmados" — **essa dúvida foi resolvida em 10/08, 12:05, ver abaixo: já estava tudo commitado.**
- 1ª rodada real contra a API do Sysemp executada com sucesso (10/08, ~01:35-01:40) — carga histórica completa desde 2020-05-01. Banco de produção com dado fiscal real de 1416 produtos. Detalhe completo em [[Checkpoint — Exploracao de Dados Fiscais Sysemp]] e [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]].
- 2 itens bloqueavam o próximo avanço real: decisão de negócio sobre os 320 casos com campo de imposto `null`, e reprocessamento do histórico antigo.

## Status anterior (11/08/2026, 15:05 — histórico, ver "Status real agora" acima pro estado atual)

Usuário precisou trocar de frente de trabalho — pausa combinada, sem previsão de retomada. Antes de pausar, dentro da mesma sessão: mockup da aba "Visão Geral" reduzida foi aprovado (remove card Financeiro, Controle com só 3 campos — Entrada no DB/Cadastro no ERP/Última Compra —, Dimensões embaladas dividida em 2 cards) e o campo `ncm` foi migrado da Visão Geral pro card de resumo da nota (aba Impostos) — precisou de campo novo persistido no guarda-chuva (mesma situação de `emissao`/`quantidade_nota`/`custo_unitario`: já vinha parseado, nunca gravado). **Código de tudo isso já foi entregue ao usuário (diffs de `impostos/models.py`, template e CSS) — mas ainda não foi aplicado nem testado.** Continua em aberto até confirmação real.

Todo o backlog restante (esta etapa + as 2 etapas seguintes do modal + os itens de backend/pipeline) foi consolidado em [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]] — nota dedicada, pra não se perder entre os vários "Status anterior" desta nota.

## Status anterior (10/08/2026, 15:30 — histórico, ver "Status real agora" acima pro estado atual)

- **Trabalho novo, fora do backend/pipeline pela 1ª vez neste domínio:** a tela de Produtos (app `produtos`) e o modal de detalhe do produto agora exibem os dados de impostos de entrada — modal ganhou abas ("Visão Geral"/"Impostos"), card antigo "Fiscal (cadastro manual)" (ruído) removido, aba nova com card de resumo da última nota + 2 tabelas de detalhamento (entrada real, saída placeholder). Detalhe completo em [[Modal de Produto — Aba Impostos (Entrada e Saida)]].
- **Achado e corrigido, no meio do caminho:** os valores exibidos estavam em nível de NOTA, não por unidade (a API entrega assim) — comparação com o dublê expôs isso. Corrigido com 2 campos novos (`quantidade_nota`, `custo_unitario`) + 1 campo novo de identificação (`emissao`, Data de Emissão) no guarda-chuva `impostos.models.ImpostosECustosXMLEntradaProduto`. Ver [[Modal Mostrava Impostos Por Nota Em Vez de Por Unidade]].
- **Novo management command `manage.py reprocessar_impostos_entrada_de_json`** — relê o json já em disco (de uma sincronização anterior) e repersiste no banco sem chamar a API, criado pra backfillar os campos novos acima nos produtos já sincronizados antes dessa mudança.
- **Plano maior da tela de Produtos tinha 5 etapas; só a de Impostos foi feita.** Seguem em aberto, sem código: reduzir a aba "Visão Geral" (só Identificação + Dimensões), nova aba "Dados do produto nas plataformas" (tabela por marketplace), nova aba "Resumo de Precificação" (a mais complexa — precisa investigar o app `precificacao` antes).
- **Sem mudança nos itens de pipeline/backend** — ver "Status anterior (12:30)" abaixo pro estado deles (validação real do `null→0`, reprocessamento do histórico antigo em aberto, 2055 produtos sem correspondência não investigados).

## Status anterior (10/08/2026, 12:30 — histórico, ver "Status real agora" acima pro estado atual)

- **⚠️ Correção de arquitetura importante:** não existe 1 banco de produção compartilhado entre os PCs — **cada PC (casa/escritório) tem seu próprio banco MySQL local, independente**, confirmado direto com o usuário. Toda suposição anterior neste vault sobre "banco de produção compartilhado" precisa ser lida com esse ajuste.
- **`null→0` validado com carga real** (não só teste): rodando `sincronizar_impostos_entrada` no banco do escritório (nunca sincronizado antes, carga do zero desde 2020-05-01), os números foram 3791 selecionados, **1736 sincronizados, 0 com erro** (1416 que já sincronizavam + exatamente os 320 que antes travavam por `null`). Ver detalhe em [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]], seção "Validação real em produção".
- **Isso NÃO resolve o reprocessamento do histórico antigo de verdade** — o banco do escritório nunca teve a pendência dos 320 erros pra começo (watermark nunca setado ali). O banco de CASA, se ainda tiver essa pendência registrada, continua precisando de um desenho de reprocessamento — sincronizações futuras só olham a janela nova.

## Status anterior (10/08/2026, 12:05 — histórico, ver "Status real agora" acima pro estado atual)

- **Confirmado: commit/push pós-`8343dba` já estavam OK** — verificado direto no GitHub (`git fetch`, `dev`) nesta sessão: 4 dos 5 itens pendentes estão no commit `575f865` ("Adiciona relatório de tempo/progresso ao orquestrador e corrige bug de tipo na chamada da API"), atual HEAD de `origin/dev`; o 5º (`calcular_janela_da_proxima_busca()`/`DATA_INICIAL_PRIMEIRA_CARGA`) já fazia parte do próprio `8343dba`. Não era mais uma pendência real, só um aviso desatualizado nesta nota.
- **Decisão do `null` tomada e implementada:** vira `0`, explícito — ver seção própria em [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]. Implementado em `integracao_sysemp/servicos/dados_xml_nf.py`, testado (Nível 0, 100% cover).
- **`dados_xml_nf.py` oficializado** — saiu de `scripts_exploracao_ERP/` (que precisa poder ser apagada a qualquer momento) e foi pra `integracao_sysemp/servicos/`, resolvendo uma dependência real de produção que estava escondida ali (o orquestrador E um teste oficial do app `impostos` dependiam dele). 6 consumidores corrigidos, 0 regressão (87 passed + 11 xfailed). Ver [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]].
- **Dublê validado (parcialmente) pelo superior** — usuário mostrou `duble_precificacao_ml.py` numa reunião real; resultado: "boa parte está correta e válida". Antes disso, achados 2 bugs ambientais reais no PC do escritório (path e resíduo de `api_sysemp` antigo) — ver [[Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]].
- **Ainda bloqueado, agora só por falta de desenho (não mais por decisão de negócio):** reprocessamento dos 320 casos que já erraram na 1ª rodada real. Usuário considerou rodar a sincronização de novo pra tentar resolver, mas decidiu não fazer isso agora.
- **Sem mudança:** 2055 dos 3791 produtos do manifesto (54%) ainda sem `Produto` correspondente no banco pelo EAN — não investigado.

## O que ainda está em aberto (consolidado)

- **Novo (13/08): API do Sysemp mudou todos os nomes de campo** — precisa do mapeamento novo (exemplo real ou changelog) + sincronizar o repo pra atualizar `api_sysemp`/`dados_xml_nf.py`. Nada feito ainda.
- ~~Decidir o tratamento do `null` nos campos de imposto~~ — feito (10/08, 12:05), **validado com carga real em 12:30** (0 erro, ver "Status real agora").
- **Desenhar o reprocessamento do histórico antigo (320 casos) no banco de CASA** — segue sem desenho. A carga fresca no banco do escritório não conta como reprocessamento (nunca teve a pendência).
- Investigar os 2055 produtos sem correspondência.
- ~~Confirmar commit/push das mudanças pós-`8343dba`~~ — confirmado (10/08, 12:05): já estava tudo commitado.
- Implementar `manage.py iniciar_servidor` (agendamento — hoje o disparo é manual).
- Definir cooldown entre tentativas de falha consecutivas.
- ~~Oficializar `dados_xml_nf.py` fora de `scripts_exploracao_ERP/`~~ — feito (10/08, 12:05).
- Migrar as 6 fórmulas de precificação do marketplace pra ler das tabelas de `impostos` em vez dos campos genéricos do `Produto` — decisão futura, sem prazo.
- ~~Montar a exibição dos impostos de entrada no modal de produto.~~ — feito (10/08, 15:30), ver [[Modal de Produto — Aba Impostos (Entrada e Saida)]].
- **Aba "Visão Geral" reduzida + campo `ncm` migrado pra Impostos** — decisão e mockup aprovados (11/08), código entregue, **ainda não aplicado nem testado pelo usuário**.
- **Nova aba "Dados do produto nas plataformas"** no modal — tabela por marketplace; campo "Permitido Publicar?" sem modelagem ainda.
- **Nova aba "Resumo de Precificação"** no modal — precisa investigar o app `precificacao` antes de idealizar.

Todos os itens desta lista (menos o `null`/commit/`dados_xml_nf`, já resolvidos) estão consolidados, com mais detalhe, em [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]] — pausados por decisão do usuário em 11/08/2026, 15:05, sem prazo pra retomada.

## Convenção de entrega de código (lembrar de imediato)

Claude nunca escreve direto no repo do usuário nem roda pytest/comandos. Todo código é entregue como bloco "Localize:/Substitua por:" (diff nomeado, texto exato do arquivo real) ou arquivo completo, sempre depois de explicar em linguagem natural o que vai mudar e por quê — e, no caso de testes, só depois de propor os cenários e esperar confirmação. O usuário aplica e roda localmente, reportando o resultado real de volta (nunca assumir que passou).

## Relacionado

- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Disciplina de Testes Automatizados]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Estrutura e Convenções do Vault]]
