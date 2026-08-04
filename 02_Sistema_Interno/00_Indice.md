---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
relacionado: [Estrutura e Convenções do Vault]
---

# Índice — Sistema Interno

Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por contexto/área. Atualizado junto da autorização de escrita de cada nota (ver [[Estrutura e Convenções do Vault]]).

## Regras_de_Comportamento

| Nota                                                | Tipo  | Status | Data       | Resumo                                                                                                                                                                                                                                             |
| --------------------------------------------------- | ----- | ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [[Estrutura de Arquivo e Classe Python]]            | regra | ativa  | 01/08/2026 | Ordem fixa de arquivo (imports→enum→classe) e de membros de classe (campos→Meta→dunders→fábrica→property→métodos), baseada na convenção Django real (Two Scoops).                                                                                  |
| [[Nomenclatura e Comentarios]]                      | regra | ativa  | 01/08/2026 | Nome claro > breve; teste "Função Objetivo: ___"; comentário só explica o porquê, nunca o quê.                                                                                                                                                     |
| [[Modelagem de Objeto e Encapsulamento]]            | regra | ativa  | 01/08/2026 | Composição > herança; dado diferente = instância, comportamento diferente = subclasse; dataclass/Enum/type hints/Protocol; @property em vez de getter/setter.                                                                                      |
| [[Integridade e Fonte Unica de Dado]]               | regra | ativa  | 01/08/2026 | Dono único por dado; nunca 2 formas de escrever o mesmo campo; pipeline limpa dado bruto na fronteira; banco é a única fonte confiável, cache nunca decide sozinho.                                                                                |
| [[Fluxo Decomposicao de Problemas em Micro Etapas]] | regra | ativa  | 01/08/2026 | Preferir várias funções pequenas aninhadas a uma função grande; pensar nos micro-problemas antes de gerar código.                                                                                                                                  |
| [[Padroes de Projeto GoF Quando Usar]]              | regra | ativa  | 01/08/2026 | Do catálogo de 23 padrões GoF, quais já usam (Memento, Facade), quais adotar sob demanda (Adapter, Abstract Factory), quais evitar (Singleton, signals, Flyweight, Visitor...).                                                                    |
| [[Disciplina de Refatoracao e Testes]]              | regra | ativa  | 01/08/2026 | Regra dos Três; nunca misturar refactor com feature; reescrita grande exige validação de comportamento; testes automatizados viram prioridade real.                                                                                                |
| [[Disciplina de Testes Automatizados]]              | regra | ativa  | 02/08/2026 | Pytest+pytest-django+pytest-cov; SUT/DOC (DOC real, nunca mock); progressão por Nível (0/2/3/4); tabela com Motivo + dado_bruto; log em arquivo; esperado sempre exato; ordenação por timestamp sempre com desempate; acesso ao repo real via git. |
| [[Modelo Padrao de Arquivo de Teste]]               | regra | ativa  | 02/08/2026 | Arquivo de referência com SUT, fixture e 3 tipos de resultado (passa, falha real, falha documentada via xfail) — implementa a Disciplina de Testes na prática.                                                                                     |
| [[Aviso Proativo Para Notas no Obsidian]]           | regra | ativa  | 02/08/2026 | Claude avisa sozinho quando algo for relevante pra salvar no vault, sem esperar pedido — memória de conversa é RAM, Obsidian é o HD.                                                                                                               |
| [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]] | regra | ativa | 03/08/2026 | Sincronizar só quando pedido; editar/escrever/remover só com permissão; nunca criar tarefa/subagente sem autorização; vault é fonte de verdade; LEGADO/ é arquivo morto. |
| [[Perguntas Sempre em Texto Corrido]] | regra | ativa | 03/08/2026 | Claude nunca usa caixinha de múltipla escolha — pergunta e resposta sempre em texto corrido na conversa. |
| [[Perguntar Data e Hora Antes de Escrever no Vault]] | regra | ativa | 03/08/2026 | Antes de escrever/editar nota, pergunta data/hora ao usuário (1x por bloco, não por arquivo) — todo write atualiza `atualizado_em`. |

## Agenda_Videos

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Modelo Novo de Fases Substitui Ciclo Antigo]] | decisao | ativa | 01/08/2026 | Diária/Semanal/Mensal descartadas; novo modelo Simples(1x)→Vídeo Mensal(4x,30d)→Vídeo Trimestral(∞,90d), sem migração do modelo antigo. |
| [[Sequencia Travada de 5 Passos por Ocorrencia]] | regra | ativa | 01/08/2026 | Base→Roteiro→Completo→Postar→Replicar, sem pular etapa; só Postar tem trava de data; Replicar continua clique manual. |
| [[Cadencia de 30 e 90 Dias Corridos Contados do Replicado]] | regra | ativa | 01/08/2026 | Dias corridos, não úteis; ajuste pro último dia útil; relógio conta do Replicado, não do Postar; piso é a própria meta. |
| [[Video Trimestral Nunca Conclui]] | decisao | ativa | 01/08/2026 | Fim do conceito "Otimizado" — Vídeo Trimestral roda pra sempre, produto nunca conclui o ciclo. |
| [[Risco Redefinido Apos Reestruturacao]] | decisao | ativa | 01/08/2026 | Antes = janela de prazo acabando; agora = produção não terminou + prazo a ≤1 dia útil de distância. |
| [[Ajuste de Dia Util Cria Padrao Estavel de 28 Dias]] | descoberta | ativa | 01/08/2026 | Sexta + 30 dias corridos cai em domingo, ajusta pra sexta anterior — cria padrão real de ~28 dias, matemática correta, não bug. |
| [[Fluxo Manual Antes do Automatizado]] | decisao | ativa | 03/08/2026 | Validar 100% o fluxo manual (dashboard/views/templates) antes do automatizado (postagem/replicação/Drive); testes brutos pytest antes da validação visual no navegador. |
| [[Modelo de Status e Entrada na Agenda]] | decisao | ativa | 03/08/2026 | Entrada na agenda é automática; agendado_em = transição Simples→Mensal; status do produto (Ativo/Inativo, ERP) ≠ status da agenda (Ativo/Pausado); sem exclusão manual, ajuste é no filtro de entrada. |
| [[Pausa Para Replanejar UX de Filtros e Telas]] | decisao | ativa | 03/08/2026 | Testes de listar_produtos_com_historico() pausados — filtros das telas não refletem o modelo novo. Mapeamento concluído em [[Estrutura de Telas da Agenda de Videos]]. |
| [[Estrutura de Telas da Agenda de Videos]] | decisao | ativa | 03/08/2026 | 6 telas: Todos (sem filtro), Não Agendado (Simples pronto pra agendar), Simples/Mensal/Trimestral (listagem por fase, chip-contador por etapa), A Fazer Hoje (urgência real + ação pendente). Implementado e aprovado (usuário + Vinicius); tela Todos adicionada em 04/08 reabrindo a questão de "ver tudo". |
| [[Mapa de Execucao das 5 Telas da Agenda de Videos]] | decisao | ativa | 03/08/2026 | 7 fases em ordem de dependência (vocabulário → listagem/contagem → contexto → view → template → testes → validação manual); 1 view com parâmetro tela; listar_produtos_com_historico() roda em paralelo. Todas as 7 concluídas. |
| [[Regua de Fases Precisa Ser Semeada em Todo Ambiente Novo]] | descoberta | ativa | 03/08/2026 | ConfiguracaoFase é dado de admin, não dict fixo — precisa ser semeado em todo banco novo. Seed criado (popular_regua_fases_agenda_videos), encadeado em `manage.py iniciar_banco`. |
| [[Cache de Indicadores Nao e Populado Automaticamente]] | descoberta | ativa | 03/08/2026 | IndicadoresAgendaProduto (cache das telas) só é populado por ação manual ou pelo comando `popular_banco` — produto nunca tocado fica invisível em todas as telas (exceto Todos). Resolvido rodando `popular_banco`. |
| [[Validacao de Configuracoes Nao Abre Excecao Para Simples]] | descoberta | ativa | 04/08/2026 | view_configuracoes_agenda_videos exigia distancia_dias_corridos preenchido pra qualquer fase, mas Simples não usa esse campo (só 1 ocorrência). RESOLVIDO — exceção de validação aplicada e confirmada. |
| [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]] | descoberta | ativa | 04/08/2026 | status_manual_atual ignorava o histórico de Pausado quando ParticipacaoAgenda não existia — o botão "Pausar" ficava travado. Achado testando view_alternar_pausado_agenda (Nível 4). RESOLVIDO — função única status_manual_atual_do_produto(), 190 passed. |
| [[Checkpoint Testes Automatizados Agenda Videos]] | checkpoint | em_andamento | 03/08/2026 | Rodadas 1-4 completas (190 testes). Rodada 5 (04/08): testes de views (Nível 4) — Blocos A, B e C completos (9 views, 248 testes), achou e corrigiu 1 bug real grave de status manual + 1 NameError próprio (erro de entrega em prosa, não de código). Trabalho pausado pelo usuário — próximo: Bloco D (Configurações). |
| [[Contexto Geral - Retomada em Outro Computador (Agenda de Videos)]] | checkpoint | ativo | 03/08/2026 | Nota auto-contida com todo o contexto do redesenho das telas — regras de colaboração, arquitetura, arquivos tocados, achados e pendências — pra retomar em outro computador sem a conversa original. Atualizada em 04/08, 11:40 (pausa do usuário). |

## Relacionado

- [[Estrutura e Convenções do Vault]]
