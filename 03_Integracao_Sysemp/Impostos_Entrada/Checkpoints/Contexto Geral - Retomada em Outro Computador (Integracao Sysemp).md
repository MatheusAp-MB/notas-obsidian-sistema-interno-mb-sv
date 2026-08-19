---
tipo: checkpoint
dominio: 
status: ativo
criado: 10/08/2026
atualizado_em: 19/08/2026 18:27
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Orquestracao da Sincronizacao de Impostos de Entrada via XML, Disciplina de Testes Automatizados, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Estrutura e Convenções do Vault, Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP, Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp, Modal de Produto — Aba Impostos (Entrada e Saida), Modal Mostrava Impostos Por Nota Em Vez de Por Unidade, Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada, Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp, Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro, Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada, Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos, CST Perdia o Zero a Esquerda e Nao Suportava CSOSN, Cor de Identificacao Fixa por Imposto — Padrao do Sistema, Tela e Planilha de Resumo de Impostos de Entrada, Bugs de Especificidade CSS no Cabecalho Congelado da Tela de Resumo de Impostos, Validacao Cruzada com Modelo_Exemplo.xlsx Confirma Formulas e Persistencia no Banco, Plano em Etapas do Duble de Precificacao ML, Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada, Migracao da Precificacao Real para Usar Impostos de Entrada Validados, Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido, Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica, Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario, Guia de Setup - Do Zero ao Primeiro Preco Calculado, Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, API Sysemp So Retorna a Ultima Nota Fiscal por Produto, Lista de CFOP Relevantes para Precificacao, Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real, Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]
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

## Status real agora (19/08/2026, 18:27) — momento da pausa

> [!danger] Leia isto primeiro — investigação fiscal real, ainda ABERTA, envolvendo dado já reportado externamente
> O relatório de impostos de entrada (gerado nesta mesma frente) já tinha sido enviado ao superior do usuário e, por ele, ao escritório de contabilidade externo. A contabilidade encontrou uma inconsistência real numa marca específica — **HIDROLIGHT**. As 2 hipóteses de causa raiz levantadas até agora **ainda não foram confirmadas** — não decidir nem aplicar nenhuma correção de CFOP ou de seleção de nota sem antes olhar o dado bruto real e confirmar com o usuário.

### O quê aconteceu (contexto de negócio, na ordem real)

Historicamente, era permitido — pela prática contábil da empresa — separar o imposto de entrada de 1 compra em **2 notas fiscais distintas**, cada uma carregando metade da informação fiscal. Na prática, o time só dava entrada (lançava no Sysemp) em **1** dessas 2 notas — a outra nunca era lançada. Em 19/08/2026, o usuário deu entrada nas notas que faltavam (as "outras metades") pra pelo menos 16 ocorrências da marca HIDROLIGHT, e quis reconsultar a API do Sysemp pra ver se elas apareceriam — sem mudar nada no código ainda, só observando.

### Achado 1 — a guarda do watermark bloqueava a reconsulta manual (RESOLVIDO)

1ª tentativa (`manage.py sincronizar_impostos_entrada --empresa=MAGAZINE`, sem flag) devolveu "Dados já atualizados — nada a fazer", mesmo o usuário sabendo que tinha dado novo. Diagnosticado com precisão: `esta_desatualizada()` (`integracao_sysemp/models.py`) só libera a busca se a cobertura atual (`data_final_cobertura`, então `18/08/2026`) já estiver há mais de `MARGEM_DE_SEGURANCA_DIAS` (7) dias no passado — como hoje era só `19/08`, a guarda ficou fechada e o comando nem chegou a chamar a API.

**Corrigido e validado** com uma flag nova `--forcar` (bypassa a guarda, mantém a mesma fórmula de janela) — decisão do usuário: manter dias corridos (não úteis) por enquanto. Detalhe completo, com o diff exato entregue e a validação real (janela `11/08/2026 → 19/08/2026` computada corretamente), em [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]], seção "Implementado e validado (19/08/2026 18:27)". **Pendente confirmar se isso já foi commitado/enviado ao GitHub** antes de continuar em outro computador.

### Achado 2 — só 1 das 16 notas apareceu (AINDA NÃO CONFIRMADO — 2 hipóteses concorrentes)

Depois do `--forcar` funcionar (janela certa, API chamada de verdade), o resultado surpreendeu: só **1 nota selecionada** no total (CFOP `2.102`), e essa 1 nem sincronizou de verdade (`Sem produto no ERP: 1` — Código de Barras não bateu com nenhum `Produto` local). O usuário então revelou que tinha dado entrada em **16 notas** hoje, não 1 — ou seja, **15 sumiram sem nenhum rastro no relatório**.

Duas hipóteses foram levantadas, nenhuma confirmada ainda (falta olhar o dado bruto real):

1. **Filtro de CFOP descartando as 15 silenciosamente.** `filtrar_por_cfop()` (`integracao_sysemp/servicos/filtro_cfop.py`, constante `CFOPS_PARA_MANTER`) só aceita 4 códigos: `1.102`/`2.102`/`1.403`/`2.403` (lista fechada em 07/08 e revisada em 15/08 — bonificação `1.910`/`2.910` removida, ver [[Lista de CFOP Relevantes para Precificacao]] e [[Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]]). Diferente do contador "Sem produto no ERP" (que aparece no painel final), **uma nota descartada por CFOP fora da lista não deixa NENHUM rastro visível** — não tem contador, não tem aviso. Se a "nota complementar" (a que carrega a outra metade do imposto, historicamente nunca lançada) usa um CFOP que nunca entrou nessa lista, ela sempre foi invisível pro sistema, não só hoje.
2. **`selecionar_nota_mais_recente_por_produto()` mantém só 1 NF por produto, mesmo quando a API devolve várias.** (`integracao_sysemp/servicos/selecao_nota_recente.py`) — pra cada Código de Barras, guarda só a nota com `Entrada NF` mais recente (desempate por `NR NF`), descartando qualquer outra do mesmo produto no período. Isso é DELIBERADO, não uma limitação da API — [[API Sysemp So Retorna a Ultima Nota Fiscal por Produto]] já documentou (07/08) que a suspeita original de "a API só devolve a última nota" era, na verdade, um bug de paginação nosso: paginação corrigida, a API devolve o HISTÓRICO COMPLETO de um produto no período. Ou seja, se HIDROLIGHT tem produtos com a informação fiscal genuinamente dividida em 2 notas, essa função sempre ficou com só 1 das 2 — mesmo que as 2 tivessem o CFOP certo e o produto certo.

> [!question] Em aberto — qual das 2 (ou as 2 juntas) é a causa raiz
> Depende de olhar o campo `CFOP Cadastro` das 16 notas no bruto real (`XML_Manifesto_NF_Bruto.json`) — se as 15 que sumiram têm um CFOP fora da lista, é o Achado 1 sozinho; se têm o CFOP certo mas o mesmo Código de Barras de outra nota já mais recente, é o Achado 2; pode ser os 2 ao mesmo tempo pra produtos diferentes. **Nenhuma correção de CFOP ou de seleção deve ser aplicada sem essa confirmação** — mexer na lista de CFOP afeta todo o pipeline fiscal, não só a HIDROLIGHT.

### Ação tomada — reset de banco (detalhe incerto, confirmar ao retomar)

Usuário cogitou um `drop` completo do banco `sistema_interno_magazine` pra testar do zero. Foi alertado que isso apagaria TODO o banco (Produtos, Precificação, Agenda de Vídeos — não só impostos), e foi oferecida uma alternativa mais segura (resetar só a linha do watermark via `manage.py shell`, sem tocar em mais nada). **Não está confirmado qual caminho o usuário realmente seguiu** — a única evidência é que ele rodou `poetry run python manage.py popular_banco --empresa=MAGAZINE` logo depois, o que é consistente com um drop+migrate completo (só necessário nesse caso, já que a alternativa do watermark não exige `popular_banco`). Se for esse o caso, o banco MAGAZINE inteiro foi recriado do zero nesta sessão.

### Estado dos dados extraídos — ONDE PARAMOS

Depois do reset, o usuário rodou a sincronização de novo (watermark vazio → carga histórica completa automática, `2020-05-01 → hoje`) e disse: **"consegui os dados brutos (APENAS) do que eu precisava"** — ou seja, extraiu do `XML_Manifesto_NF_Bruto.json` (pasta `integracao_sysemp/retorno_api/dados_impostos_xml_entrada/magazine/`) só o recorte que precisava (provavelmente as 16 notas da HIDROLIGHT), mas **os valores reais (CFOP de cada uma, se batem ou não com a lista) não foram compartilhados nesta conversa** — a confirmação do Achado 2 acima segue pendente.

### Próximo passo real, pra quem retomar (neste ou noutro computador)

1. Confirmar se o commit do `--forcar` foi enviado ao GitHub (ver aviso na nota do watermark).
2. Olhar o `CFOP Cadastro` de cada uma das 16 notas HIDROLIGHT nos dados brutos já extraídos — confirmar/descartar o Achado 1.
3. Se o Achado 1 se confirmar, decidir COM O USUÁRIO se o CFOP que falta deve entrar em `CFOPS_PARA_MANTER` (`integracao_sysemp/servicos/filtro_cfop.py`) — precisa de confirmação de que é realmente uma operação de compra/entrada fiscal válida, não outra categoria (ex: devolução, transferência).
4. Independente do Achado 1, decidir COM O USUÁRIO se `selecionar_nota_mais_recente_por_produto()` precisa mudar pra somar (não escolher 1) quando o mesmo produto tiver 2 notas legítimas no período — mudança bem mais ampla, pode afetar outras marcas além da HIDROLIGHT.
5. Considerar adicionar um contador/log pra notas descartadas por CFOP fora da lista (hoje é um ponto cego total no relatório) — vale independente da causa raiz confirmada aqui, pra próxima investigação não repetir este mesmo caminho às cegas.
6. Depois de corrigido, precisa reprocessar/ressincronizar a HIDROLIGHT (e possivelmente outras marcas com o mesmo padrão histórico) e AVISAR o superior/contabilidade do resultado corrigido — o relatório já saiu errado pra fora da empresa.

## Status anterior (17/08/2026, 01:20) — histórico, ver "Status real agora" acima pro estado atual

> [!info] Amanhã em outro computador (o da empresa) — leia isto primeiro
> O banco temporário `sistema_interno_sv_temp` é local a ESTA máquina (casa) — não existe no PC da empresa até ser criado de novo lá. O tutorial abaixo já foi escrito pra ser autossuficiente, começando do zero. Leve fisicamente os 2 arquivos ERP da SV **já com cabeçalho corrigido** (existem só nesta máquina, com backup ao lado).

**O pedido do dia:** gerar o relatório de impostos de entrada da Samvale (SV) pro superior, com urgência. No meio do caminho, 2 coisas reais aconteceram, fora do domínio Sysemp propriamente dito:

1. **Bug real achado e corrigido** (domínio `Importacao_de_Dados`, não Sysemp): os 4 importadores de tabela de frete apontavam pra uma pasta antiga há 2 dias, sem nenhum erro visível — descoberto por acaso ao rodar `popular_banco` de novo pra esta tarefa. Corrigido e validado com dado real. Ver [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]].
2. **2 tutoriais antigos do vault, sobrepostos e com informação desatualizada, foram fundidos em 1 só** — [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]] é agora a única fonte de verdade sobre setup do zero.

**Sobre o relatório da SV em si — bloqueado, sem token:** todo o lado de PRODUTO já rodou de ponta a ponta com sucesso, num banco temporário isolado (`sistema_interno_sv_temp`), sem tocar no banco real da MB — 506 produtos importados, frete OK, zero mudança de lógica de código, só nome de coluna do ERP precisou de ajuste (script de rename com backup, já validado com amostra real). Ver [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]]. **A sincronização fiscal (`sincronizar_impostos_entrada`) e a exportação do `.xlsx` NÃO rodaram** — usuário percebeu, no meio do processo, que não tinha o `SV_SYSEMP_API_TOKEN` em mãos (não pegou com o superior ainda). Fica pra quando o token chegar.

**Passo a passo completo já escrito e pronto pra amanhã:** [[Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario]] — autossuficiente, cobre do banco temporário até exportar pela tela (`runserver` + botão "Exportar", mesma tela já validada da MB — decisão de não usar script pra isso, ver nota). Inclui o script de correção de cabeçalho por inteiro, caso precise repetir em outra máquina.

**Estado do código nesta máquina (casa), ainda não verificado se persiste pra amanhã:**

- `core/management/commands/popular_banco_suporte/importar_produtos_erp.py` está com os 2 blocos (MB comentado, SV ativo) — modificado, **não commitado**. É local a esta máquina; não vai existir no PC da empresa até ser refeito lá (o tutorial já assume isso).
- Os 4 arquivos de frete corrigidos (bug acima) estão prontos pra commit, com título/descrição já gerados nesta sessão — **confirmar se o commit e o push foram feitos antes de trocar de máquina.** Sem o push, o PC da empresa vai puxar o `dev` ainda com o bug do frete amanhã, e o mesmo "não encontrado" pode se repetir por engano.
- `teste.py` (script de rename de cabeçalho) está solto na raiz do repo, não rastreado — descartável, não precisa ir pro commit (conteúdo já preservado por inteiro dentro do tutorial, ver acima).

**Próximo passo real de amanhã:** seguir [[Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario]] do Passo 1 (máquina nova = banco novo), assim que o token da SV estiver em mãos. O plano original de domingo (Tarefas 2 e 4 — Shopee promoções, documentação) segue intocado, não iniciado.

## Status anterior (16/08/2026, 05:23) — histórico, ver "Status real agora" acima pro estado atual

Usuário pediu pra preparar o sistema REAL de precificação (não só o dublê) pra usar os impostos de entrada validados, e depois deu pausa pra noite ("volto amanhã"). Trabalho desta rodada foi só investigação/decisão — nenhum diff de código escrito ainda, por decisão própria (Ciclo de Trabalho Calmo: idealizar/planejar antes de executar).

Princípio-guia confirmado pelo usuário: **"o precificador apenas usa o que já foi validado, ele não tem papel ou responsabilidade de calcular imposto de entrada"** — nenhuma fórmula fiscal deve ser duplicada dentro da precificação.

Resultado da investigação (`formula_precificacao.py` + `calcular_grade_precificacao_ml.py` lidos por completo):

1. **Mapeamento campo a campo fechado** — custo, IPI, ICMS entrada e PIS/COFINS são troca de fonte direta (de campo solto do `Produto` pra `impostos_entrada.<imposto>.valor`, já dividido por unidade). ICMS ST é o único que precisa de trabalho novo: o valor bruto da API não é o crédito líquido usável, precisa de uma propriedade nova dentro do domínio `impostos` (líquido = bruto − ICMS normal) antes do precificador poder ler — o precificador não pode fazer essa conta.
2. **3 decisões fechadas com o usuário**: (a) produto sem `impostos_entrada` sincronizado simplesmente não calcula preço, sem fallback pro dado antigo; (b) nenhuma planilha entra mais na precificação, só XML/Sysemp; (c) PIS e COFINS seguem como 2 créditos separados (já confirmado com o superior antes).
3. **Achado confirmado**: `importar_planilha_precificacao.py` já está desativado desde 21/07/2026 (comentado em `popular_banco.py`) — excluí-lo formalmente não muda comportamento nenhum hoje.
4. **Achado novo e mais sério, no meio da investigação da planilha**: essa mesma planilha morta era a ÚNICA fonte dos 4 campos de dimensão "embalada" do `Produto` (`peso/altura/largura/comprimento_produto_apos_embalado`) — que alimentam `obter_dimensoes_envio()` → `organizar_e_verificar_divergencias_dimensoes_envio` → os campos `_ordenada_cm` que o fallback de dimensão usa. Como está desativada há 3 semanas, esses campos estão `None` pra praticamente todo produto do sistema, não só quem falta variação ML — amplia bastante o achado registrado ontem à noite (04:50). Ver [[Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada]] e detalhe completo em [[Migracao da Precificacao Real para Usar Impostos de Entrada Validados]].

**Em aberto pra amanhã**: decidir a fonte da dimensão "embalada" agora (candidato: colunas de embalagem do Cadastro de Produtos do ERP, já lidas por `importar_produtos_erp.py`, mas não confirmado se já alimentam `_apos_embalado`); implementar o crédito líquido de ICMS ST no domínio `impostos`; só depois disso escrever os diffs reais da precificação; excluir formalmente a planilha morta. O plano original de domingo (4 tarefas: API do ML, Shopee promoções, relatório Samvale, documentação) segue intocado, não iniciado.

## Status anterior (16/08/2026, 05:06 — histórico, ver "Status real agora" acima pro estado atual)

Fechamento de decisões pendentes sobre a precificação, depois da revalidação do dublê. Usuário confirmou: (1) já está ciente do achado de dimensão zerada (fica pra tratar junto da Tarefa 1 de domingo); (2) **PIS/COFINS como créditos separados no FIXO — confirmado com o superior**, deixa de ser decisão em aberto (ver [[Plano em Etapas do Duble de Precificacao ML]]); (3) a divergência de custo de ~R$ 37 fica pra conferir depois; (4) prazos reais dos 2 itens que ainda dependem de planilha — Frete CIF/FOB depende de outro funcionário voltar de férias (~semana que vem), e ICMS/PIS/COFINS de saída dependem do superior validar a planilha nova de impostos de entrada primeiro (~mais 1 semana) — ver [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]; (5) validação final de tudo isso continua sendo feita com o superior, no ritmo que der ("vamos fazer o melhor que pudermos e depois eu valido").

## Status anterior (16/08/2026, 04:50 — histórico, ver "Status real agora" acima pro estado atual)

Usuário lembrou de uma pendência importante: o dublê de precificação (e o sistema real) ainda não usam os impostos de entrada corretamente. Ao retomar o dublê pra validar antes de tocar no sistema real, achado que o script estava desatualizado desde 09/08 (2 bugs reais de caminho/formato de arquivo, não de fórmula) — corrigidos, e revalidado 100% contra o banco pro EAN 7908050719121 (ver [[Plano em Etapas do Duble de Precificacao ML]], seção "Reativação e Revalidação").

No meio da validação, acompanhando insistência do usuário em "validar de verdade, não confiar", apareceu um achado sério e separado: Coleta/Armazenagem zeraram pra esse produto, e foi confirmado (lendo o código de produção, não supondo) que **isso também acontece na fórmula real**, não só no dublê — produto sem variação do Mercado Livre sincronizada cai no mesmo fallback de dimensão zero. Ver [[Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada]]. Ligado direto à Tarefa 1 do plano de domingo (migrar scripts consumidores do ML — ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]).

Também corrigido nesta sessão: o formato exato de diff (LOCALIZE/SUBSTITUA) precisa do cabeçalho "Arquivo: <caminho>" e dois-pontos — reforçado em [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]].

## Status anterior (16/08/2026, 04:05 — histórico, ver "Status real agora" acima pro estado atual)

Fechamento final do domínio. Antes de considerar tudo encerrado, identificado 1 gap real: a validação campo-a-campo (ver "Status anterior 04:00" abaixo) só confirmou os 6 impostos em 3 produtos — não confirmou se o backfill do CST corrigido e dos 8 campos novos (CFOP, Origem, Natureza, TES, ID Produto Sysemp, Código Auxiliar, adicionados em 14-15/08) tinha rodado nos produtos sincronizados ANTES dessas mudanças. Usuário rodou `manage.py reprocessar_impostos_entrada_de_json`: **3691 selecionados, 827 sincronizados, 0 erro** (2864 sem `Produto` correspondente — item separado, já documentado, não é regressão). Detalhe completo em [[Validacao Cruzada com Modelo_Exemplo.xlsx Confirma Formulas e Persistencia no Banco]] (seção "Fechamento") e no backlog ([[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]]).

**Domínio "Impostos de Entrada + Tela/Planilha de Resumo" considerado fechado, aguardando validação do superior.** Segue em aberto, sem relação com este fechamento: os 2864 (novo total, era 2055) produtos sem correspondência por EAN, e os demais itens de backlog (abas "plataformas"/"precificação" do modal, `iniciar_servidor`, cooldown) — ver [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]].

## Status anterior (16/08/2026, 04:00 — histórico, ver "Status real agora" acima pro estado atual)

Verificação de fundo, à parte da tela/planilha: usuário trouxe `Modelo_Exemplo.xlsx` (NF real 237995, 3 produtos, fórmula de cada coluna explicada) pedindo pra confirmar coerência de dado fiscal e persistência correta no banco. Fórmulas conferidas com número real e comparadas com o código (`dados_xml_nf.py`) — nenhuma divergência. Comparação direta com o banco via script standalone (não `manage.py shell`, que quebra com stdin redirecionado no Windows do usuário — mesmo padrão de setup Django dos scripts antigos): **100% de coincidência campo a campo** nos 3 EANs reais (Base de Cálculo, Alíquota, Redução, Valor de ICMS/ICMS ST/ICMS Retido/IPI/PIS/COFINS). Detalhe completo em [[Validacao Cruzada com Modelo_Exemplo.xlsx Confirma Formulas e Persistencia no Banco]]. Usuário confirmou: "ok isso está resolvido."

## Status anterior (16/08/2026, 03:34 — histórico, ver "Status real agora" acima pro estado atual)

Frente nova, fora do modal: tela "Resumo de Impostos de Entrada" (`/impostos/`), pedida pelo usuário como versão-tela da planilha já apresentada ao superior, com base arquitetural na tela "Resumo de Critérios" do ML (busca, paginação, exportar). Escopo fechado: tela otimizada (Foto/SKU/EAN/NCM/Nota/Fornecedor/Empresa/Data Entrada/Custo Unitário + Alíquota/Redução por imposto), planilha exportada mantendo a estrutura de 52 colunas/10 grupos já aprovada, script antigo intocado por decisão explícita. Detalhe completo, incluindo o sistema de cor reescrito (1 cor-base por grupo, inspirado na própria planilha) e a revisão de largura/altura/formato numérico do xlsx, em [[Tela e Planilha de Resumo de Impostos de Entrada]].

Pelo caminho, 2 bugs reais de CSS (não backend) travaram várias rodadas — `colspan` combinado com `position: sticky` no cabeçalho de grupo, e uma regra genérica de cor vencendo por especificidade (não por ordem) as classes específicas de cada grupo. Ambos com causa raiz confirmada por leitura direta do CSS real (não suposição) — ver [[Bugs de Especificidade CSS no Cabecalho Congelado da Tela de Resumo de Impostos]]. Resultado final validado pelo usuário: "visualmente tá incrível".

Commit gerado nesta sessão: `5d05aed` ("Adiciona tela de Resumo de Impostos de Entrada (exportável em xlsx) e popovers de explicação de cálculo no modal de produto"), já em `origin/dev` — mudanças de polish visual desta rodada (cor/largura/planilha) ainda não commitadas no momento desta atualização.

## Status anterior (16/08/2026, 00:45 — histórico, ver "Status real agora" acima pro estado atual)

Fechamento do polish visual sobre o v7 da aba Impostos, testado e aprovado pelo usuário: cor pastel no corpo de cada card de imposto (continuação da cor forte do cabeçalho — ver [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]), popover (Bootstrap) com a fórmula real e valores reais nos campos calculados (Base/Valor/Valor FCP em todo imposto; Redução só em PIS/COFINS), e remoção do campo "Código Auxiliar" da Visão Geral por ser o mesmo dado do `SKU` (confirmado em `importar_produtos_erp.py`). Sem migration. Detalhe completo em [[Modal de Produto — Aba Impostos (Entrada e Saida)]].

## Status anterior (15/08/2026, 23:25 — histórico, ver "Status real agora" acima pro estado atual)

Retomada da frente 1 (modal de produto) depois da pausa de 11/08. A etapa 2 (Visão Geral reduzida + NCM migrado pra Impostos), que estava com código entregue mas não confirmado desde 11/08, **foi confirmada aplicada** (verificado por leitura direta do template em produção nesta sessão).

Além disso, a etapa 1 (aba Impostos) ganhou uma continuação grande: 2 rodadas de dado (Rodada 1 — campos que já existiam no banco expostos na tela: CST XML/Cadastro, NCM Cadastro, Empresa, Custo Total, %FCP/Valor FCP; Rodada 2 — 8 campos novos persistidos que só existiam no json de apoio: CFOP, Origem+descrição, Natureza da Operação, TES de Saída, ID Produto Sysemp, Código Auxiliar, 3 migrations novas) e um redesenho visual completo da aba (7 mockups até aprovação, reaproveitando a mesma estrutura rígida de card/tabela da Visão Geral, cards por imposto com cor fixa de identificação — ver [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]). ID Produto Sysemp/Código Auxiliar migraram definitivamente pra Visão Geral (fora do contexto fiscal).

Bug real corrigido no caminho: CST (`cst_xml`/`cst_cadastro`) perdia o zero à esquerda e não suportava CSOSN (achado real em produção — ver [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]]). Detalhe completo de tudo isso em [[Modal de Produto — Aba Impostos (Entrada e Saida)]] e [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]].

Validado: **542 passed** (6 falhas pré-existentes sem relação). Commit `5ccda18` na branch `dev`.

**Próximo passo real:** rodar `reprocessar_impostos_entrada_de_json` pra backfillar os 8 campos novos e o CST corrigido nos produtos já sincronizados antes desta mudança. Segue em aberto: novas abas "Dados do produto nas plataformas" e "Resumo de Precificação", e os itens de backend (reprocessar 320 erros antigos do banco de casa, investigar 2055 produtos sem correspondência, `iniciar_servidor`, cooldown) — ver [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]].

## Status anterior (14/08/2026, 11:15 — histórico, ver "Status real agora" acima pro estado atual)

2 campos novos (`Empresa Fantasia`, `% FCP ST`/`Valor FCP ST`) promovidos a campo oficial do pipeline — motivado pelo próximo objetivo real desta frente: montar um relatório de impostos de entrada pro superior, seguindo como modelo um export real do Sysemp. Ver [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]] pro desenho completo e [[Checkpoint — Exploracao de Dados Fiscais Sysemp]] pro relato da sessão.

Implementado de ponta a ponta (dataclasses, models, migração aditiva sem prompt de rename, testes) — validado em 2 rodadas de pytest: a 1ª pegou 4 testes de integração quebrados por uma fixture (`test_nivel_3__orquestrador.py`) que não tinha sido atualizada na 1ª entrega de diffs (ver [[Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos]]); corrigida, resultado final: **528 passed, 0 failures no escopo deste trabalho, 12 xfailed**.

**Em andamento agora:** usuário rodando `manage.py sincronizar_impostos_entrada` pra popular os 3 campos novos no banco.

**Próximo passo real:** escrever o script novo do relatório (`scripts_exploracao_ERP/relatorio_impostos_entrada_xlsx.py`, reescrita completa), lendo do banco (não dos jsons intermediários, que só refletem a última janela incremental) — mockup do Excel já aprovado pelo usuário nesta mesma sessão (lógica "só por unidade" pra todo campo monetário de imposto, 1 linha por produto = nota mais recente).

## Status anterior (14/08/2026, 09:55 — histórico, ver "Status real agora" acima pro estado atual)

Reorganização de nomenclatura fechada e implementada por completo — ver [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]] pro desenho e mapeamento de campo, e [[Checkpoint — Exploracao de Dados Fiscais Sysemp]] pro relato completo da sessão. Resumo rápido: convenção de sufixo explícito `_xml`/`_cadastro` fechada, `dados_xml_nf.py`/`impostos/models.py` reescritos, migração aplicada (1 quase-erro pego antes, ver [[Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro]]), todos os consumidores downstream corrigidos (`filtro_cfop.py`, `selecao_nota_recente.py`, 3 arquivos de teste + 2 próprios), 100% cover em `impostos/models.py`. Domínio validado, 526 passed / 0 failures no escopo deste trabalho.

## Status anterior (13/08/2026, 15:20 — histórico, ver "Status real agora" acima pro estado atual)

Usuário retomou esta frente depois de uma pausa longa (última atualização real era 11/08, 15:05 — nada mudou neste domínio entre 11/08 e 13/08). Aviso novo, ainda sem nenhuma ação: **a API do Sysemp passou por uma atualização — todos os nomes de campo mudaram, a pedido do próprio usuário, por melhoria de qualidade do lado do Sysemp.** O projeto (`api_sysemp` + `dados_xml_nf.py`, principalmente) precisa ser atualizado pra acompanhar.

**Nada foi feito ainda:** não recebido o mapeamento novo de campos (nem JSON de exemplo, nem changelog), e o repositório não foi sincronizado nesta sessão pra ler o código real que faz esse parsing hoje. Sessão foi interrompida logo depois desse aviso — usuário vai trocar de computador e pediu pra salvar o contexto antes de perder acesso à conversa.

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

- ~~API do Sysemp mudou todos os nomes de campo~~ — feito (14/08/2026): reorganização completa implementada e validada, ver [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]].
- ~~Adicionar Empresa Fantasia e FCP ST ao pipeline~~ — feito (14/08/2026, 11:15), ver [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]].
- **Escrever o script novo do relatório de impostos de entrada** (`scripts_exploracao_ERP/relatorio_impostos_entrada_xlsx.py`) — próximo passo real, mockup já aprovado.
- **Reprocessar produtos já sincronizados** pra backfillar `cst_cadastro`/`ncm_cadastro`, `empresa_fantasia`/`aliquota_fcp`/`valor_fcp` (14/08) **e agora também (15/08) os 8 campos novos (CFOP, Origem, Natureza, TES, ID Produto Sysemp, Código Auxiliar) e o CST corrigido (era `int`, perdia zero à esquerda/não suportava CSOSN)** — mesmo comando `reprocessar_impostos_entrada_de_json` já existente.
- ~~Decidir o tratamento do `null` nos campos de imposto~~ — feito (10/08, 12:05), **validado com carga real em 12:30** (0 erro, ver "Status real agora").
- **Desenhar o reprocessamento do histórico antigo (320 casos) no banco de CASA** — segue sem desenho. A carga fresca no banco do escritório não conta como reprocessamento (nunca teve a pendência).
- Investigar os 2055 produtos sem correspondência.
- ~~Confirmar commit/push das mudanças pós-`8343dba`~~ — confirmado (10/08, 12:05): já estava tudo commitado.
- Implementar `manage.py iniciar_servidor` (agendamento — hoje o disparo é manual).
- Definir cooldown entre tentativas de falha consecutivas.
- ~~Oficializar `dados_xml_nf.py` fora de `scripts_exploracao_ERP/`~~ — feito (10/08, 12:05).
- Migrar as 6 fórmulas de precificação do marketplace pra ler das tabelas de `impostos` em vez dos campos genéricos do `Produto` — decisão futura, sem prazo.
- ~~Montar a exibição dos impostos de entrada no modal de produto.~~ — feito (10/08, 15:30), ver [[Modal de Produto — Aba Impostos (Entrada e Saida)]].
- ~~Aba "Visão Geral" reduzida + campo `ncm` migrado pra Impostos~~ — **confirmada aplicada** (verificado 15/08).
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
- [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]]
- [[Primeira Importacao Real de Dados da Samvale (SV) — Pipeline Generaliza Sem Mudanca de Logica]]
- [[Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario]]
