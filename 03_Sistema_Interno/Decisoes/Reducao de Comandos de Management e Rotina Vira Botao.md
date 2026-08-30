---
tipo: decisao
dominio:
status: em_andamento
criado: 15/08/2026
atualizado_em: 29/08/2026 20:28
relacionado: [Padrao de Qualidade e Clareza Estrutural do Repositorio, Responsabilidade de Lideranca em TI Eleva o Padrao de Qualidade Exigido, Redesenho do Popular Banco - Fontes de Dados e Escopo, Orquestracao da Sincronizacao de Impostos de Entrada via XML, Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual, Guia de Setup - Do Zero ao Primeiro Preco Calculado, Barra de Progresso Real no Sincronizar com o Drive do Portal via Thread e Polling, Thread em Background Nao Herda a Empresa Ativa do EmpresaMiddleware (Threading Local)]
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

**Decisão (15/08/2026):** resolver com thread em background + endpoint de status consultado por polling, reaproveitando o mesmo padrão que `servidor_agente.py` já usa (thread separada rodando a tarefa real). Sem introduzir fila de tarefa de verdade (Celery/Django-Q) por enquanto — o projeto nunca precisou disso até hoje, e a Regra dos Três (ver [[Disciplina de Refatoracao e Testes]]) pesa contra trazer essa complexidade nova sem 3 casos reais que justifiquem.

## Inventário completo — 18 comandos, categoria e destino

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

## Relacionado

- [[Padrao de Qualidade e Clareza Estrutural do Repositorio]]
- [[Responsabilidade de Lideranca em TI Eleva o Padrao de Qualidade Exigido]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Reestruturacao da Navegacao da Agenda de Videos em 6 Telas de Nivel Igual]]
