---
tipo: regra
dominio: testes
status: ativa
criado: 02/08/2026
relacionado: [Disciplina de Refatoracao e Testes, Nomenclatura e Comentarios, Estrutura de Arquivo e Classe Python, Modelo Padrao de Arquivo de Teste, Conceitos de Pytest Live de Python 167]
---

# Disciplina de Testes Automatizados

## Por que existe

O sistema precisa ser o MÁXIMO possível testável via pytest — não é um "quando sobrar tempo", é prioridade real (ver [[Disciplina de Refatoracao e Testes]], seção Regra dos Três: falta de teste é a causa nº 1 de dívida técnica).

## Pensar no teste antes da linha de código

Durante a idealização/planejamento de qualquer função ou método, já se sabe o resultado esperado — então o teste nasce JUNTO com o planejamento, não depois. Não precisa ser código de verdade nessa hora: pseudocódigo já serve, na forma "recebo isso, espero que aconteça isso, por causa disso".

## Confirmar antes de escrever teste

Antes de gerar qualquer arquivo de teste novo, explicar em linguagem natural: qual função/método vai ser testado, qual regra de negócio está por trás, e quais cenários serão cobertos — e esperar confirmação do usuário. Nunca decidir sozinho o que "precisa" ser testado sem esse checkpoint.

## Teste que passa ≠ teste correto

Teste aprovado só prova que o `assert` bate com o que o código FAZ — não prova que o código faz a coisa CERTA. Os dois podem estar errados ao mesmo tempo e concordando entre si. Por isso todo teste precisa ser revisado (entrada/esperado/motivo) antes de virar confiável — não confia só porque ficou verde.

## Documentação: "recebo isso, espero isso, por causa disso"

Todo teste explica por que existe, seguindo essa lógica — no nome da função (`test_proximo_dia_util_sexta_pula_pra_segunda`), e quando fizer sentido, num comentário curto acima explicando a regra de negócio por trás (não só a mecânica).

## SUT e DOC — de quem é a responsabilidade em cada teste

- **SUT** (System Under Test): a peça sendo testada de verdade.
- **DOC** (Depended-on Component): termo do livro *xUnit Test Patterns* (Gerard Meszaros) — qualquer colaborador que o SUT chama pra funcionar (ex: no material de referência analisado, `ListaDeTarefas` é SUT e `Tarefa` é DOC dela). Não é termo do deck "Live de Python #167" — ver [[Conceitos de Pytest Live de Python 167]] pra não confundir a origem.
- **Regra do projeto: DOC real, quase sempre — nunca dublê/mock aqui.** Um dublê só se justificaria se o DOC fosse lento, externo, ou não-determinístico. Nenhum DOC deste projeto é isso hoje (são funções puras ou o banco de teste do Django). Se um dia entrar uma integração externa de verdade (ex: API do Mercado Livre), esse seria o 1º candidato a dublê.
- **DOC já testado numa camada de baixo não precisa ser re-exaurido em cima** — a camada de cima só confirma que a chamada ao DOC está correta (1-2 casos representativos), e concentra o "cobrir o máximo" no que é NOVO daquela camada. Isso evita a suíte crescer exponencialmente conforme sobe de nível.

## Progressão por Nível (substitui "Camada") — nunca pular pro difícil

Renomeado de "Camada" pra "Nível" depois de testar o código real do `agenda_videos` e descobrir que a divisão original não batia com a dependência de verdade do sistema (ex: "risco"/"atraso" pareciam funções puras isoláveis, mas na prática dependem de `CicloVideo` — não existe um "Nível 1" separado; foi fundido no Nível 2).

- **Nível 0**: função pura, zero dependência de banco/Django (ex: `ultimo_dia_util_ou_hoje`).
- **Nível 2**: precisa de 1 instância de model em memória, mas SEM salvar — sem `@pytest.mark.django_db` (ex: `CicloVideo.etapa_atual()`, construído via `CicloVideo(campo=valor, ...)`, nunca `.save()`).
- **Nível 3**: toca banco de verdade — sempre `pytestmark = pytest.mark.django_db` (ex: `CicloVideo.criar_proximo()`).
- **Nível 4**: view/integração — ingestão em massa, dashboard.

Nomeia o arquivo com o número do nível: `test_nivel_N__assunto.py` (nível + underscore + número + DUPLO underscore + assunto). A ordem de execução é garantida por hook explícito em `conftest.py` (`pytest_collection_modifyitems`, ordena por `nodeid`) — nunca confiar só na ordem "padrão" de coleta do pytest, que já variou de forma inesperada mesmo com arquivo numerado certo.

## match/case no SUT — só quando há cenário exclusivo real

Usa `match/case` apenas quando existem cenários mutuamente exclusivos e enumeráveis de verdade. Função sem branch não ganha `match/case` forçado.

## Dado de teste sempre fixo e auto-contido

- Nunca `date.today()`/`timezone.now()` cru dentro de um teste — data fixa, comentada, com uma referência de calendário no topo do arquivo (ex: "2026-08-01 = sábado"). Teste tem que dar o mesmo resultado hoje, amanhã e daqui a 1 ano.
- Se o SUT em si usa `timezone.localdate()`/`date.today()` cru internamente (não o teste), prefira adicionar um parâmetro opcional `data_referencia: date | None = None` ao SUT (padrão já usado em `calcular_indicadores_ciclo`/`listar_a_fazer_hoje`) em vez de instalar lib de congelar tempo — mais simples, zero dependência nova, e mantém consistência entre funções que precisam da mesma referência de "hoje".
- Nunca depender de dado que já existe no banco (seed, produção) — cada teste cria exatamente o que precisa, do zero.

## Esperado é sempre o valor exato, quando ele pode ser conhecido

Nunca aceitar uma verificação de propriedade genérica (ex: "cai em dia útil", "não é nulo") no lugar do valor exato, quando esse valor pode ser calculado e conferido de antemão — isso é sempre uma versão mais fraca do teste. Só se justificaria uma verificação genérica quando o valor exato realmente não pode ser conhecido com certeza (nenhum caso disso apareceu no projeto ainda). Insegurança de quem escreve o teste sobre a própria conta NÃO é motivo válido — nesse caso, confere a conta (ou roda o teste pra descobrir o valor certo) em vez de enfraquecer o assert.

## Ordenação por timestamp sempre precisa de desempate

`Meta.ordering = ['-campo_de_data']` sozinho não é confiável — 2 registros criados muito próximos no tempo podem empatar (resolução do relógio do sistema, mais comum em Windows), e sem critério de desempate a ordem fica indefinida (o banco pode devolver o mais antigo, não o mais recente). Sempre adicionar `'-id'` como segundo campo de ordenação quando "o mais recente vale" for uma regra de negócio real — desempate por `id` é seguro porque cresce sempre na ordem de criação, nunca empata. Achado real: `HistoricoStatusManualAgenda`, 02/08/2026 — 2 registros no mesmo teste empataram no timestamp no Windows, `status_manual_atual()` devolveu o registro errado.

Achado real (03/08/2026), mesmo padrão repetido 2x em `agenda_videos/funcoes_auxiliares/`: `calcular_roadmap_produto()` (`order_by('criado_em')` sem desempate, corrigido pra `order_by('criado_em', 'id')`) e `montar_historico_produto()` (`order_by('-criado_em')` sem desempate, corrigido pra `order_by('-criado_em', '-id')`). Variação do mesmo problema em `montar_linha_do_tempo_produto()`: o `eventos.sort(...)` final não tinha desempate entre eventos de ciclos diferentes com timestamp idêntico — corrigido não no sort em si, mas tornando a ORIGEM determinística (`ciclos_video.order_by('criado_em', 'id')`), apoiado no sort estável do Python (documentado na linguagem).

## Erro de setup ≠ erro de lógica

Quando um teste falha, primeiro pergunta: isso é porque o TESTE foi montado errado, ou porque o CÓDIGO se comporta diferente do esperado? Só a segunda é informação real sobre o sistema.

## Teste nunca contorna bug real — conserta o código, mesmo que seja retroativo

Teste sempre usa o código real, com comportamento real — nunca "contorna" uma limitação ou bug pra fazer passar (ex: forçar timestamps bem distantes só pra evitar expor um empate que o código não trata direito). Se aparecer um bug de verdade durante a escrita do teste, o código de produção é corrigido (sob permissão do usuário) — nunca o teste é enfraquecido pra esconder o problema. Vale retroativamente: se um teste já escrito tiver contornado um problema real em vez de expô-lo, esse teste é considerado inválido e precisa ser reescrito sob a condição exata que antes era evitada, provando a correção.

## Estrutura de arquivo

- Teste mora dentro do app que testa: `nome_do_app/tests/test_nivel_N__assunto.py`.
- Infraestrutura de teste COMPARTILHADA (fixture de relatório, helpers) fica na raiz do projeto (`conftest.py`, `testes_apoio/`) — nunca dentro de 1 app específico.

## Rodar a suíte inteira, não só o teste novo

O valor real de teste automatizado é pegar quebra em lugar que você nem lembrava que existia. Sempre `pytest -s` (sem caminho nenhum) depois de mexer em qualquer coisa coberta por teste.

## Visual: tabela padronizada, sempre estruturada em 4 fases

- Todo teste comenta e explica as 4 fases (Setup / Exercise / Assert / TearDown) — mesmo quando uma fase é no-op, o comentário explica POR QUE não faz nada.
- Nunca variável `passou` solta — `assert resultado == esperado` direto, e o mesmo `resultado == esperado` inline como argumento de `registrar_resultado(...)`.
- `registrar_resultado(...)` sempre ANTES do `assert` — a linha aparece na tabela mesmo se o teste falhar.
- Tabela: `Teste | Entrada | Esperado | Motivo | Obtido | Status`. `Motivo` é obrigatório e sempre preenchido — nunca mensagem solta de `assert` repetindo valor que a tabela já mostra.
- `dado_bruto` (parâmetro opcional de `registrar_resultado`) — só quando a Entrada exibida já é uma simplificação de algo maior (dict, objeto complexo com datetime/tzinfo, etc.). Vai SÓ pro log em arquivo, nunca pra tabela do terminal (que tem coluna de largura fixa e corta/quebra texto longo).
- `parametrize` sempre com `ids=` explícito — nunca auto-gerado (fica ilegível pra valores complexos como datas).
- 1 caso de falha proposital, marcado `@pytest.mark.xfail(reason=...)`, sempre presente no arquivo-modelo — nunca remover. Prova que a tabela mostra FALHOU corretamente e que o pytest distingue falha esperada (`xfailed`) de falha real (`failed`) no resumo.
- `show_lines=True` na `Table` do Rich (`conftest.py`) — separa visualmente cada linha, evita confundir onde uma termina quando o conteúdo quebra em várias linhas.
- Célula do Rich Table só aceita texto (ou objeto renderável) — nunca `bool`/`int`/`None` crus (`rich.errors.NotRenderableError`). `RegistradorDeResultados.adicionar()` já converte com `str(...)` antes de `add_row` — quem chama `registrar_resultado(...)` pode passar o valor original (bool, etc.) sem se preocupar; o `.txt` guarda o valor original, sem conversão.

## Log estruturado em arquivo (`resultados_testes.txt`)

- Existe porque copiar/colar do terminal corta informação (tabela Rich tem largura fixa; texto longo quebra e trunca).
- Reseta 1x por SESSÃO inteira (fixture `autouse`, `scope='session'`) — cada rodada de `pytest -s` gera log novo, nunca acumula histórico de rodadas antigas.
- Cada módulo de teste acrescenta seu bloco no teardown da fixture `tabela_resultados` (Entrada/Esperado/Motivo/Obtido/Dado bruto quando existir).
- No fim da sessão, hook `pytest_terminal_summary` acrescenta o resumo (quantos passaram/falharam/xfailed) e o traceback completo de qualquer falha real. Cuidado: `terminalreporter.stats` guarda 1 registro POR FASE de cada teste (setup/call/teardown) — sempre filtrar `report.when == 'call'`, senão o total sai 3x maior que o real.

## Nível 3 sempre relê do banco antes de comparar

Depois de chamar um método que faz `.save()` (ex: `marcar_replicado()`), o teste busca o registro DE VOLTA do banco (`Model.objects.get(pk=...)`) antes de comparar — nunca confia só no atributo do objeto Python em memória. O objeto em memória já estava "certo" antes mesmo do `.save()` rodar; só reler do banco prova que a escrita persistiu de verdade.

## Coverage — valida o nível antes de considerar pronto

- `pytest-cov` instalado (`poetry add --group dev pytest-cov`); `[tool.coverage.run] branch = true` no `pyproject.toml` (sem isso, coverage não percebe quando só 1 lado de um `if`/`while` foi exercitado).
- Comando padrão: `pytest -s --cov=<módulo específico> --cov-report=term-missing --cov-report=html --cov-report=json` — sempre escopado no módulo que acabou de ser testado, nunca `--cov=.` fixo (o projeto tem dezenas de apps sem teste ainda; cobertura geral agora não diria nada sobre se O NÍVEL ATUAL está pronto).
- "Pronto" = 100% cover, 0 Miss, 0 BrPart no módulo escopado.

## Acesso ao repositório real

- Repositório: `https://github.com/MatheusAp-MB/Projeto_Sistema_Interno_V2` — Claude pode clonar via git no próprio sandbox pra LER o código real antes de escrever teste (nunca supor assinatura/nome de função sem confirmar contra o código de verdade).
- Claude NUNCA executa pytest nem qualquer código, nem contra o clone, nem contra o projeto real — só gera o script/diff pro usuário rodar local e colar o resultado de volta.
- Edição de código já existente é entregue no formato "Localize" / "Substitua" — arquivo novo é entregue completo.

## Motivo

Reescrita grande sem rede de segurança (teste) é o cenário de maior risco de regressão silenciosa — e este projeto reescreve grande com frequência, de propósito.

## Relacionado

- [[Disciplina de Refatoracao e Testes]]
- [[Nomenclatura e Comentarios]]
- [[Modelo Padrao de Arquivo de Teste]]
- [[Conceitos de Pytest Live de Python 167]]
