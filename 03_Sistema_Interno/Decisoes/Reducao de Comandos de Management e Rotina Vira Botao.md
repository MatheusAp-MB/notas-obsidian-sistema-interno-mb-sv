---
tipo: decisao
dominio:
status: em_andamento
criado: 15/08/2026
atualizado_em: 27/09/2026 02:31
relacionado: [Padrao de Qualidade e Clareza Estrutural do Repositorio, Responsabilidade de Lideranca em TI Eleva o Padrao de Qualidade Exigido, Redesenho do Popular Banco - Fontes de Dados e Escopo, Orquestracao da Sincronizacao de Impostos de Entrada via XML, Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual, Guia de Setup - Do Zero ao Primeiro Preco Calculado, Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling, Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local), Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes CST Isolado em Comando Proprio Como Fonte Unica, Checkpoint - Frete Real da API Implementado (Tela Banco de Dados e Comando de Coleta em Massa), Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre]
---

# Redução de Comandos de Management e Rotina Vira Botão

## Motivo (15/08/2026)

Mesmo gatilho de [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]: existe uma equipe agora (Cauã e Lucas) que vai lidar com este código, e o sistema tem hoje 18 comandos de management "soltos" (sem contar scripts fora do `manage.py`), a maioria sem teste, sem padrão comum de nome, e sem distinção clara entre "rotina real", "contingência", "auditoria pontual" e "exploração/dev". Palavras do usuário: "tá difícil até pra mim usar, imagina pros outros". Motivo adicional e mais concreto: quando o sistema for pra produção (AWS), não vai existir alguém digitando comando de terminal rotineiramente — rotina precisa ser clique em botão na interface.

## Princípio central

O usuário deve digitar o MÍNIMO de comandos possível. Categorias:

1. **Setup único (fica CLI pra sempre)** — roda 1 vez na vida de um banco, nunca é rotina.
2. **Rotina real (vira botão no HTML)** — qualquer coisa que se repete no dia a dia do negócio não deveria exigir terminal.
3. **Contingência/manutenção pontual (fica CLI, mas precisa de nome claro)** — não é rotina, é "break glass" — ok continuar como comando, mas precisa ficar óbvio que não é pra rodar toda hora.
4. **Interno/dev (nunca deveria ter sido comando pro usuário digitar)** — o sistema já nasce pronto, o usuário nunca aciona isso diretamente.

## Decisões fechadas hoje

- **`iniciar_banco` e `popular_banco` seguem CLI.** Confirmado pelo usuário com 100% de certeza — são o pontapé inicial, usados 1 única vez por ambiente.
- **`sincronizar_impostos_entrada` está separado hoje só porque está em fase de teste.** Destino final: vira mais uma etapa dentro de `popular_banco` (mesmo padrão das outras 17 etapas já existentes — ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]). Quando isso acontecer, o botão do `popular_banco` nunca mais faz a carga histórica pesada (os ~8 minutos da 1ª carga completa, ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]) — o watermark já existe pra isso, então toda sincronização depois da 1ª é só a janela incremental (rápida).
- **`agente_local/` já está certo do jeito que está.** Confirmado pelo usuário: nada ali deveria ser algo que o usuário digita. Achado na auditoria: só `servidor_agente.py` é ponto de entrada real (serviço persistente, roda na bandeja do sistema, sem terminal) — todo o resto do pacote (`cliente_api.py`, `postagem_ml.py`, `replicacao_ml.py`, `controle_teclado.py`, `aviso_execucao.py`, `posicionar_mouse_com_seguranca.py`) é módulo só importado, nunca executado direto. Nenhuma mudança de código necessária aqui — é só reconhecer que o desenho já está certo.

## Achado que muda a prioridade da fusão dos 6 comandos de precificação

Os 6 comandos `calcular_grade_precificacao_{amazon,magalu,ml,raia,shopee,tiktok}` **já são chamados de dentro de `popular_banco.py`** (mesmas funções, importadas de `precificacao/funcoes_auxiliares/<marketplace>/calcular_grade_precificacao_<marketplace>.py` — não é coincidência de nome, é o mesmo código). Ou seja: no fluxo de rotina (o botão do `popular_banco`), essa etapa já roda sozinha, sem precisar de nenhum dos 6 comandos separados. Os 6 comandos hoje só servem como "escape hatch" — rodar 1 marketplace isolado, sem repetir o pipeline inteiro (mesma utilidade que `organizar_e_verificar_divergencias_dimensoes_envio`/`sincronizar_indicadores_agenda` já documentam ter). Consequência prática: a fusão dos 6 num só (`calcular_grade_precificacao amazon`) continua válida (menos arquivo, mesma utilidade de reexecução isolada), mas deixa de ser prioridade — não é rotina do usuário, é ferramenta de manutenção pontual pro dev.

## Como "virar botão" — decisão técnica

Existe precedente no próprio projeto: `agenda_videos/views.py` já tem o padrão (botão → URL → view fina → chama a função de negócio → recarrega fragmento da página). Mas esse padrão é síncrono — serve pra ações rápidas (1 produto, resposta na hora). `sincronizar_impostos_entrada`/`popular_banco` rodam minutos (a 1ª carga chegou a 8 min) — não cabem num request HTTP síncrono (trava o navegador, estoura timeout de gateway na AWS).

**Decisão (15/08/2026):** resolver com thread em background + endpoint de status consultado por polling, reaproveitando o mesmo padrão que `servidor_agente.py` já usa (thread separada rodando a tarefa real). Sem introduzir fila de tarefa de verdade (Celery/Django-Q) por enquanto — o projeto nunca precisou disso até hoje, e a Regra dos Três (ver [[Disciplina de Refatoracao - Quando Generalizar e Quando Deixar Simples]]) pesa contra trazer essa complexidade nova sem 3 casos reais que justifiquem.

## Inventário completo — 18 comandos, categoria e destino (estado em 15/08/2026 — ver reconciliação de 27/09 abaixo)

| Comando | Categoria | Destino |
|---|---|---|
| `iniciar_banco` | Setup único | Fica CLI |
| `popular_banco` | Rotina real | Vira botão (já é o candidato natural a "o botão único" — vai absorver `sincronizar_impostos_entrada` quando sair de teste) |
| `sincronizar_impostos_entrada` | Rotina real (temporário como comando separado) | Absorvido por `popular_banco` quando sair de teste; até lá, fica CLI |
| `calcular_grade_precificacao_{amazon,magalu,ml,raia,shopee,tiktok}` (6) | Manutenção pontual (já redundante com `popular_banco`) | Fundir em 1 (`calcular_grade_precificacao <marketplace>`), sem prioridade |
| `reprocessar_impostos_entrada_de_json` / `reprocessar_impostos_entrada_do_bruto` | Contingência | Em aberto — fundir em 1 com flag `--fonte`? Pendente confirmação |
| `organizar_e_verificar_divergencias_dimensoes_envio` | Manutenção pontual | Em aberto — vira botão também, ou continua CLI? Pendente |
| `sincronizar_indicadores_agenda` | Manutenção pontual | Em aberto — mesma pergunta acima |
| `validar_classificacao` | Indefinido — parece abandonado (sem cabeçalho padrão, commit de 06/07, comentário solto `#validar`) | Pendente: usuário ainda usa? Mantém ou remove |
| `gerar_relatorio_divergencia_dimensao_envio` / `gerar_relatorio_frete_erp_vs_ml` | Auditoria pontual, só leitura | Sem prioridade agora (confirmado pelo usuário) |
| `resetar_agenda_videos` | Dev (próprio comentário: "nunca rodar com dado real") | Renomear `DEV_resetar_agenda_videos` |
| `investigar_campos_api` | Dev (próprio comentário: "INVESTIGAÇÃO, SÓ LEITURA") | Renomear `DEV_investigar_campos_api` |

`scripts_exploracao_ERP/` (11 arquivos) — já tinha precedente no vault como pasta descartável a qualquer momento (lógica real foi oficializada em `integracao_sysemp/servicos/`). **Resolvido (15/08/2026, 20:20):** 8 de 11 arquivos apagados — `comparar_impostos_planilha_vs_xml.py`, `consultar_produto.py`, `contar_registros_por_cfop.py`, `encontrar_produto_icms_nao_zero.py`, `explorar_manifesto_nota_entrada.py`, `filtrar_dados_por_cfop.py`, `investigar_ocorrencias_de_produto.py`, `selecionar_nota_mais_recente_por_produto.py` — todos ancestrais de código já oficializado ou exploração de decisão já fechada. Mantidos por terem uso real ainda: `duble_precificacao_ml.py` (ferramenta ativa de validação da fórmula de precificação ML), `mapear_campos_json.py` (utilidade reaproveitável se a API do Sysemp mudar de estrutura de novo), `relatorio_impostos_entrada_xlsx.py` (decisão de manter/remover ainda pendente).

## Primeira implementação real do padrão (21/08/2026)

O padrão decidido acima ("Como 'virar botão' — decisão técnica") saiu do papel pela primeira vez dentro do Django deste projeto: o botão "Sincronizar com o Drive" do Portal do Drive (frente paralela da Agenda de Vídeos) passou a usar thread em background + endpoint de status por polling, no lugar de um `<form>` síncrono que travava a tela sem nenhum feedback durante os vários segundos (às vezes mais de 1 minuto) da sincronização. Detalhe completo em [[Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling]].

**Achado crítico pra qualquer botão futuro que siga o mesmo padrão** (`popular_banco`, `sincronizar_impostos_entrada`, os 2 candidatos já citados neste documento): uma `threading.Thread` criada manualmente dentro de uma view **não herda a empresa ativa** (MAGAZINE/SAMVALE) escolhida na sessão. O roteamento por empresa usa `threading.local()` (`core/empresa.py`), preenchido pelo `EmpresaMiddleware` só na thread que atende a requisição HTTP — uma thread nova, criada manualmente, nasce com esse armazenamento vazio. Qualquer código chamado de dentro dela que dependa de `obter_empresa_ativa()` recebe `None` e falha (no caso real, um `RuntimeError` ao tentar escolher a pasta certa do Drive). Ver detalhe completo, com a correção exata, em [[Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local)]].

**Consequência prática pra quando `popular_banco`/`sincronizar_impostos_entrada` virarem botão**: a view que dispara a thread precisa capturar `obter_empresa_ativa()` ENQUANTO ainda está na thread da requisição (onde o middleware já rodou de verdade), passar esse valor como argumento pra função que a thread nova executa, e essa função precisa chamar `definir_empresa_ativa(empresa)` como sua primeira linha — antes de qualquer chamada a código que leia dado roteado por empresa (praticamente tudo em `popular_banco`, e toda a sincronização de impostos de entrada). Pular esse passo reproduz exatamente o mesmo bug, possivelmente mascarado atrás de um `except Exception` genérico sem log — daí a importância de manter `traceback.print_exc()` (ou equivalente) em qualquer thread de background nova, mesmo depois de considerada "pronta".

## Em aberto (achado ainda sem correção aplicada)

Etapa 4 do pipeline de impostos de entrada (`persistir_selecionados_no_banco`, `orquestrador.py`) tem gap real: erro de banco (`IntegrityError`/`DataError`/`OperationalError`) não está no `except (KeyError, ValueError, TypeError)` — proposta em discussão: conter `IntegrityError`/`DataError` por registro (mesma filosofia da contenção já aplicada hoje), tratar `OperationalError` como falha total (como já acontece com erro de API). Ainda sem "vai" do usuário pra aplicar.

## Retomada e Mapeamento Completo de Ponta a Ponta (27/09/2026, 02:31)

**Contexto da retomada:** Matheus voltou a apontar exatamente este mesmo problema ("existem muitos comandos soltos, não estão anotados em lugar nenhum, temos vários fazendo quase a mesma coisa, falta clareza, falta organização, falta controle de fluxo") sem lembrar que ele já tinha sido mapeado aqui em 15/08. Isso por si só já é o sintoma mais importante: os itens "em aberto" da tabela acima nunca foram resolvidos, e o sistema cresceu por cima deles sem que este documento fosse atualizado. A varredura abaixo cobre o sistema INTEIRO de ponta a ponta (management commands + `servicos/` + todo script solto fora do `manage.py`), não só a fatia de Frete/Comissão/Precificação.

### O que foi decidido em agosto e nunca foi aplicado

- **`sincronizar_impostos_entrada` continua fora do `popular_banco`.** As 18 etapas atuais do `popular_banco.py` são: Produtos ERP, Anúncios ML, Indicadores Agenda, Dimensões Declaradas ML, Qualidade, Competição, Frete ML, Frete Magalu, Frete TikTok, Frete Amazon, Dimensão de Envio, Grade ML, Grade Magalu, Grade Raia, Grade Shopee, Grade TikTok, Grade Amazon, Recomendação Precificação. Nenhuma etapa de impostos (entrada OU saída) está nessa lista — a absorção decidida aqui em 15/08 nunca aconteceu.
- **A fusão dos 6 `calcular_grade_precificacao_*` não foi feita como decidido.** Em vez de virar 1 comando com argumento de marketplace, foi criado um 7º comando por cima deles (`calcular_todas_as_grades_precificacao`, que só chama os 6 em sequência via `call_command`) — os 6 originais continuam existindo, intactos, sem fusão nenhuma.
- **`resetar_agenda_videos` e `investigar_campos_api` nunca foram renomeados** com o prefixo `DEV_` decidido em 15/08 — seguem com o nome original, continuam indistinguíveis dos comandos de rotina real a não ser que alguém abra o arquivo e leia o comentário interno.
- **`organizar_e_verificar_divergencias_dimensoes_envio`, `sincronizar_indicadores_agenda` e `validar_classificacao` seguem exatamente como estavam em agosto** — mesmo "em aberto", nenhuma decisão tomada.

### O que foi de fato executado

- **`scripts_exploracao_ERP/` está exatamente como a decisão de 15/08 mandou**: hoje restam só os 3 arquivos que a decisão determinou manter — `duble_precificacao.py`, `mapear_campos_json.py`, `relatorio_impostos_entrada_xlsx.py` (o primeiro está com o nome levemente diferente do registrado aqui, `duble_precificacao_ml.py` → `duble_precificacao.py`, mesma função).

### 12 comandos novos desde agosto — nunca passaram pelas 4 categorias deste documento

- **Impostos de Saída (5)** — app novo, não existia em 15/08: `preencher_CST_produtos`, `importar_icms_saida_por_ncm_cst_origem`, `importar_pis_cofins_saida_por_ncm_cst`, `preencher_impostos_saida` (rotina real, 4 comandos auto-suficientes em sequência fixa — ver [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes CST Isolado em Comando Proprio Como Fonte Unica]]) + `Sincronizar_Impostos_de_Saida` (orquestrador de conveniência que roda os 4 em sequência, mesmo padrão do `calcular_todas_as_grades_precificacao`, mas com nome em PascalCase — ver inconsistência abaixo).
- **Integração Mercado Livre (6)** — `buscar_mlbs`, `buscar_detalhes`, `buscar_dados_sku_completo`, `sincronizar_categorias_ml`, `buscar_frete_real_ml`, `buscar_comissao_real_ml`. Todos seguem o padrão bom (`servicos/` + comando fino, espelho 1 para 1) — mesmo padrão já elogiado neste documento pro `agente_local/`.
- **Precificação (1)** — `calcular_todas_as_grades_precificacao` (o 7º comando citado acima).

### Inventário completo hoje — 30 comandos reais, por app

| App | Comando | Categoria (mesmas 4 de agosto) |
|---|---|---|
| core | `iniciar_banco` | Setup único |
| core | `popular_banco` | Rotina real (o botão-alvo) |
| core | `organizar_e_verificar_divergencias_dimensoes_envio` | Manutenção pontual — em aberto desde 15/08 |
| core | `sincronizar_indicadores_agenda` | Manutenção pontual — em aberto desde 15/08 |
| impostos | `preencher_CST_produtos` | Rotina real (passo 1/4) |
| impostos | `importar_icms_saida_por_ncm_cst_origem` | Rotina real (passo 2/4) |
| impostos | `importar_pis_cofins_saida_por_ncm_cst` | Rotina real (passo 3/4) |
| impostos | `preencher_impostos_saida` | Rotina real (passo 4/4) |
| impostos | `Sincronizar_Impostos_de_Saida` | Rotina real (orquestrador dos 4 acima) |
| integracao_sysemp | `sincronizar_impostos_entrada` | Rotina real — destino final é virar etapa do `popular_banco` (decidido 15/08, não aplicado) |
| integracao_sysemp | `reprocessar_impostos_entrada_de_json` | Contingência |
| integracao_sysemp | `reprocessar_impostos_entrada_do_bruto` | Contingência |
| integracao_mercado_livre | `buscar_mlbs` | Rotina real |
| integracao_mercado_livre | `buscar_detalhes` | Rotina real |
| integracao_mercado_livre | `buscar_dados_sku_completo` | Rotina real |
| integracao_mercado_livre | `sincronizar_categorias_ml` | Rotina real |
| integracao_mercado_livre | `buscar_frete_real_ml` | Rotina real |
| integracao_mercado_livre | `buscar_comissao_real_ml` | Rotina real |
| mercado_livre | `validar_classificacao` | Indefinido/abandonado — em aberto desde 15/08 |
| mercado_livre | `gerar_relatorio_divergencia_dimensao_envio` | Auditoria pontual, só leitura |
| mercado_livre | `gerar_relatorio_frete_erp_vs_ml` | Auditoria pontual, só leitura |
| mercado_livre | `investigar_campos_api` | Dev — renomear `DEV_` decidido e não aplicado |
| precificacao | `calcular_grade_precificacao_{amazon,magalu,ml,raia,shopee,tiktok}` (6) | Manutenção pontual, redundante com `popular_banco` |
| precificacao | `calcular_todas_as_grades_precificacao` | Manutenção pontual (novo, não previsto em agosto) |
| agenda_videos | `resetar_agenda_videos` | Dev — renomear `DEV_` decidido e não aplicado |

### Camada abaixo do management: `servicos/`

Só 2 dos 21 apps usam essa camada (lógica pura separada do comando fino que só chama ela):
- **`integracao_mercado_livre/servicos/`** — espelho exato 1 para 1 com seus 6 comandos (`buscar_mlbs.py`, `buscar_detalhes.py`, `buscar_dados_sku_completo.py`, `sincronizar_categorias_ml.py`, `buscar_frete_real_ml.py`, `buscar_comissao_real_ml.py`).
- **`integracao_sysemp/servicos/`** — não é espelho 1 para 1, é um orquestrador interno (`orquestrador.py`) + módulos de apoio (`arquivos_retorno_api.py`, `dados_xml_nf.py`, `erros_sincronizacao.py`, `filtro_cfop.py`, `selecao_nota_recente.py`), chamado pelos 3 comandos de impostos de entrada.

### Camada de scripts soltos fora do `manage.py` — o que Matheus quis dizer com "não anotados em lugar nenhum"

**`scripts_dev/` (19 arquivos)** — depuração pontual do Portal do Drive / Agenda de Vídeos / Postagem Automática, nenhum com cabeçalho padrão consistente:
`baixar_arquivos_produto_referencia.py` (baixa arquivos reais de 1 produto de referência do Drive, só leitura, pra ter arquivo real de teste), `cancelar_todas_execucoes_presas.py` (cancela em lote toda execução do agente travada), `criar_execucao_teste_agente.py` (cria execução de teste e imprime a URL de progresso), `diagnosticar_arquivos_nao_baixaveis.py` (descobre o mimeType real de arquivos que falharam ao baixar), `diagnosticar_drive.py` (checklist de configuração do ambiente do Drive), `diagnosticar_estado_completo_drive.py` (varredura completa do Drive exportada em .xlsx), `diagnosticar_tela_aprovacao.py` (testa manualmente se a coluna "Estado" bate com o esperado, por MLB), `diagnosticar_tela_replicacao.py` (automação de teste, pywinauto, pra tela de replicação), `gerar_inventario_drive_magazine.py` (gera 4 planilhas numa única varredura do Drive), `inspecionar_execucao_travada.py` (imprime status/heartbeat de 1 execução específica), `investigar_hidrolight_entrada_ontem.py` (investigação pontual de um problema real de dados da marca HIDROLIGHT), `listar_estrutura_pasta_drive.py` (imprime a árvore de 1 pasta do Drive, só leitura), `testar_api_postagem_automatica.py` (testa os endpoints reais da API de Postagem Automática), `testar_ciclo_de_vida_novo.py` (testa o ciclo de vida completo do modelo novo de Agenda sem tela), `testar_download_video_google_vids.py` (testa o endpoint oficial de download do Google Vids como MP4), `testar_export_google_vids_para_mp4.py` (verifica exportação de vídeo do Google Vids nativo), `testar_fluxo_real_ml_sem_clicar.py` (valida o fluxo real de postagem sem clicar no botão final), `testar_leitura_estado_video_ml.py` (testa a leitura do Estado de um vídeo na tela filtrada do ML), `testar_link_editor_fotos_ml.py` (confirma se o link "Editar no ML" com MLBU funciona).

**`scripts_exploracao_ML/` (25 arquivos)** — é a origem histórica de tudo que hoje é Frete Real e Comissão Real oficiais, mais investigação de devolução/reclamação via API; nenhum marcado como "já virou comando, pode arquivar":
`baixar_dump_categorias_ml.py`, `buscar_candidatos_agrupados_por_tipo.py`, `buscar_e_testar_candidatos_diversos_frete_via_api.py`, `buscar_reclamacoes_candidatas.py`, `comparar_comissao_real_vs_flat_via_api.py` (origem do `buscar_comissao_real_ml` oficial — mede a divergência real vs. flat), `consultar_fluxo_devolucao.py`, `consultar_linha_tempo_devolucao.py`, `investigar_1_categoria_completa.py`, `investigar_campos_dump_categorias.py`, `investigar_claims_recentes.py`, `investigar_cobertura_picture_por_nivel.py`, `investigar_dados_da_venda.py`, `investigar_detalhe_devolucao.py`, `investigar_frete_matriz_simulacao.py`, `investigar_frete_real_anuncio.py` (origem do `buscar_frete_real_ml` oficial), `investigar_frete_reproducao_e_pos_venda.py`, `investigar_frete_validacao_tabela_completa.py`, `investigar_reputacao_seller_status_abaixo_79.py`, `investigar_retorno_bruto_item.py`, `investigar_shipment.py`, `investigar_shipment_history.py`, `testar_goal_seek_via_api.py` (prova de conceito da Opção 2 da Frente A do Frete — ainda solto, nunca virou comando), `testar_matriz_frete_gratis_via_api.py`, `teste_conexao.py`, `verificar_chaves_discount_billable_weight.py`.

**`scripts_exploracao_ERP/` (3 arquivos)** — já resolvido pela decisão de 15/08 acima (8 de 11 apagados): `duble_precificacao.py`, `mapear_campos_json.py`, `relatorio_impostos_entrada_xlsx.py`.

**`agente_local/` (8 módulos)** — já confirmado correto pela decisão de 15/08 acima: `servidor_agente.py` (único ponto de entrada real), `cliente_api.py`, `postagem_ml.py`, `replicacao_ml.py`, `controle_teclado.py`, `aviso_execucao.py`, `posicionar_mouse_com_seguranca.py`, `verificacao_ml.py`.

**Raiz do projeto (11 scripts avulsos, sem pasta própria)**: `preparar_tabela_import_produtos_erp_sv.py` (corrige cabeçalhos das planilhas ERP da Samvale — comentário interno ainda o chama de "teste.py", nome desatualizado), `gerar_referencia_cest_samvale.py` (gera planilha EAN/NCM/CEST da Samvale a partir do JSON do Sysemp), `validar_impostos_saida.py` (valida sem gravar se os 4 campos fiscais batem com as tabelas normalizadas), `autorizar_drive_oauth.py` (roda 1x manualmente pra autorizar OAuth do Drive), `implementar_duas_visoes.py` (script de uso único, estrutura "2 Visões" do modal de auditoria ML), `diagnostico_sysemp.py` (testa a causa raiz do "Método não Localizado" na 1ª carga da Samvale), `teste_verificar_cst_pendente.py` (diagnóstico só leitura de 2 pontos da decisão de chave de consolidação do ICMS), `conftest.py` (configuração raiz do pytest), `diagnosticar_produto.py` (diagnóstico só leitura de produto sem imposto de saída validado), `varredura_respostas_mediacao.py` (rascunho não testado, classifica respostas numa mediação), `preencher_cest_planilha_samvale.py` (preenche a coluna CEST da planilha real da Samvale).

### Duplicidades e inconsistências concretas encontradas (27/09/2026)

1. **Frete Real e Comissão Real**: os comandos oficiais (`buscar_frete_real_ml`, `buscar_comissao_real_ml`) nasceram de scripts de investigação que continuam soltos em `scripts_exploracao_ML/` (`investigar_frete_real_anuncio.py`, `comparar_comissao_real_vs_flat_via_api.py`) sem nenhuma marcação de "isso virou comando oficial, pode ignorar".
2. `testar_goal_seek_via_api.py` — prova de conceito da Opção 2 da Frente A (Frete), ainda solto, nunca virou comando.
3. Nomes quase idênticos, funções diferentes: `organizar_e_verificar_divergencias_dimensoes_envio` (organiza e grava) vs. `gerar_relatorio_divergencia_dimensao_envio` (só relatório, leitura).
4. `importar_promocoes_ml` existe dentro do próprio `popular_banco.py` mas está comentado/desativado desde 15/08 — código morto invisível pra quem não abre o arquivo fonte.
5. Inconsistência de convenção de nome: o orquestrador de impostos de saída se chama `Sincronizar_Impostos_de_Saida.py` (PascalCase) enquanto todo o resto do sistema, incluindo o orquestrador irmão de precificação (`calcular_todas_as_grades_precificacao`), usa snake_case minúsculo.
6. Os scripts de teste do agente local (`scripts_dev/testar_*.py` relacionados a ML/postagem) validam pedaços de lógica que hoje já vivem nos módulos reais de `agente_local/`, sem indicação de quais já foram absorvidos e quais ainda são a única validação existente.
7. `preparar_tabela_import_produtos_erp_sv.py` (raiz) traz um comentário interno chamando a si mesmo de "teste.py" — sinal de arquivo renomeado sem atualizar o comentário.
8. Os 2 orquestradores de agosto (`calcular_todas_as_grades_precificacao`) e de setembro (`Sincronizar_Impostos_de_Saida`) resolveram o mesmo tipo de problema ("rodar N comandos relacionados em sequência sem digitar 1 por 1") de forma independente, sem que um documentasse ter olhado pro outro como padrão — mesma estrutura (`call_command` em loop, 1 empresa por vez), nomes com convenções diferentes.

## Relacionado

- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]] — absorveu, em 30/08/2026, o conteúdo que antes vivia em "Responsabilidade de Lideranca em TI Eleva o Padrao de Qualidade Exigido".
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]]
- [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes CST Isolado em Comando Proprio Como Fonte Unica]]
- [[Checkpoint - Frete Real da API Implementado (Tela Banco de Dados e Comando de Coleta em Massa)]]
- [[Checkpoint - Investigação da Comissão Real de Venda via API do Mercado Livre]]
