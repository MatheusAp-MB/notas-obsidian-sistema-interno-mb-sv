---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: implementado
criado: 20/09/2026
atualizado_em: 20/09/2026 10:31
relacionado: [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]], [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]], [[Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução]], [[Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API]]
resumo: Idealização completa (ainda sem código) do próximo passo do Painel de Mediações, com mockup interativo já aprovado — divisão visual Encontrados pelo Sistema (recolhível, começa fechado)/Em Acompanhamento (mantendo as 4 combinações), mecanismo de "acompanhar"/"deixar de acompanhar" decidido (auto-entra se já existe Devolucao; manual vira MediacaoAvulsa; deixar de acompanhar nunca apaga nada, nos 2 casos), 2 botões de atualização em segundo plano por empresa ativa (sem botão combinado MB+SV, mesmo padrão do resto do sistema), travados contra clique duplo (via UPDATE...WHERE atômico, não select_for_update) e inativos durante a execução. Refresh individual ao abrir 1 chat validado como síncrono (~0,63s). Arquitetura de armazenamento e rotas fechada: cache genérica (ClaimMercadoLivre) e status singleton (StatusVarreduraMediacoes, com 3 desfechos possíveis — sucesso limpo/sucesso com ressalva/falha) com schema definido, rotas mapeadas, mensagem de erro 100% amigável (sem texto técnico) pra Ana. Todos os itens de "Em aberto" resolvidos — falta só o aval pra começar a escrever código de verdade.
---

# Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano

Continuação de [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]. Depois de validar que a varredura completa (141 claims, 6 meses, MB+SV, incluindo mensagens) leva 192,05s reais (ver cronometragem em [[Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução]]), Matheus olhou pra tela real de Mediações (hoje só com registros de teste manuais) e propôs o próximo desenho, aproveitando a varredura como fonte de dado. Fase de idealização — nada implementado ainda.

## Divisão visual: 2 grupos × 4 combinações

- **Encontrados pelo Sistema** — resultado bruto/efêmero da varredura na API, não precisa existir no banco
- **Em Acompanhamento** — registros persistidos de verdade (`Devolucao`/`MediacaoAvulsa`)

Cada grupo dividido nas 4 combinações já validadas com dado real: Reclamação / Reclamação+Mediação / Reclamação+Devolução / Reclamação+Mediação+Devolução. **Decisão final de Matheus (20/09 07:45): mantém as 4** — mesmo a "Reclamação pura" (sem mediação nem devolução) sendo questionável numa tela de Mediações, não vai ser reduzida pra 3. Fechado, não é mais um item em aberto.

## "Estou acompanhando esse" — mecanismo decidido, reaproveita um campo que já existia esperando por isso

`Devolucao` e `MediacaoAvulsa` já tinham um campo `claim_id` (migration `0019`, adicionado antes desta conversa) com o help_text "preenchido automaticamente quando a busca de mensagens roda pela 1ª vez (ainda não implementada)" — ou seja, o campo já esperava exatamente esta feature.

**Caminho automático — sem clique nenhum**: pra cada pedido que a varredura encontra, o sistema checa se já existe uma `Devolucao` com esse `numero_pedido` (é a chave de casamento — não dá pra usar `claim_id` porque ainda está vazio nos registros existentes). Se existir, esse item entra em "Em Acompanhamento" automaticamente e o `claim_id` da `Devolucao` é preenchido. **Decisão de Matheus**: o gatilho não depende de qual combinação a varredura encontrou (mediação, devolução, nem nenhuma das duas) — só depende de existir a `Devolucao` cadastrada. O cadastro dela já é o sinal de que Ana está acompanhando aquele pedido, independente do estágio atual da reclamação no ML.

**Caminho manual**: Ana clica "Acompanhar" num item de "Encontrados pelo Sistema" que não tem `Devolucao` correspondente → cria uma `MediacaoAvulsa` nova, já com `numero_pedido` e `claim_id` preenchidos (a varredura já tem os dois). `nome_cliente`/`nome_produto` ficam em branco (o model já permite, são `blank=True`) — não precisa de formulário no momento do clique, ela completa depois se quiser.

Isso confirma a leitura de arquitetura: "Encontrados pelo Sistema" nunca precisa existir no banco — só "Em Acompanhamento" precisa, e o cache de mensagens em `JSONField` (já decidido antes desta conversa, ver "3 decisões técnicas confirmadas" em [[Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução]]) se aplica aos 2 caminhos.

## 2 botões de atualização, ambos em segundo plano

- **Fazer varredura completa (6 meses)** — repete o que `buscar_mediacoes_abertas_recentes.py` já faz (busca + devolução + classificação + mensagens), ~192s reais pra 141 claims.
- **Atualizar itens em acompanhamento** — só os marcados, não os 141.

**Tamanho real do "em acompanhamento"** (dado por Matheus): no dia a dia normal, ~6 itens somando MB+SV; em situação extrema, no máximo ~25.

**Estimativa de tempo pro botão de atualização**, usando a média real por item já medida na varredura (0,54s verificação de devolução + 0,80s busca de mensagens ≈ 1,34s/item; classificação ~0s):
- 6 itens (típico): ~8s
- 25 itens (extremo): ~34s

## Refresh individual ao abrir 1 chat — cronometrado e validado (20/09 07:25)

Cronometragem isolada real (script `cronometrar_refresh_individual.py`): 10 chamadas de busca de mensagens (5 MB + 5 SV), cada uma esperando 5s antes de disparar — bem acima do espaçador interno de 0,4s usado no lote, de propósito, pra descartar qualquer efeito de "conexão quente" que pudesse estar mascarado na média do lote de 141. Resultado: mínimo 0,53s, máximo 0,75s, média 0,63s (MB 0,62s / SV 0,65s) — sem relação aparente entre quantidade de mensagens (0 a 4 na amostra) e tempo de resposta.

**Decisão**: como o tempo fica consistentemente bem abaixo de 1s mesmo isolado (não só na média do lote), a tela pode atualizar as mensagens toda vez que Ana abre o chat de um item — nesse caso é 1 chamada só (buscar mensagens da reclamação), síncrona, dentro da própria requisição HTTP normal de abrir o chat. Não precisa do mecanismo de segundo plano/thread/registro de status usado pelas 2 varreduras (que são da ordem de dezenas de segundos a minutos) — esse mecanismo é só pros botões de varredura completa e de atualização em lote dos itens em acompanhamento, não pro refresh de 1 chat.

## Por que rodar em segundo plano (não dentro da mesma requisição)

O sistema roda como .exe standalone (PyInstaller + Waitress, servidor local — não é infra cloud com gunicorn/nginx atrás de proxy). Hardware é um i5 4570/8GB DDR3/SSD SATA 3, já registrado como limitado. Rodar os ~192s inteiros dentro da mesma requisição HTTP tem 2 problemas reais: (1) qualquer interrupção no meio (aba fechada, wifi caiu, notebook suspendeu) perde o processamento inteiro se só salvar tudo no final; (2) a thread do Waitress fica ocupada o tempo todo, podendo deixar o resto do sistema lento pra quem estiver usando.

**Solução acordada**: nada de Celery/Redis (seria overkill pra um .exe de máquina única) — uma thread em segundo plano dentro do próprio processo, salvando item por item incrementalmente no banco (não só no final), então uma interrupção no meio não perde o que já foi processado.

## Visibilidade do processamento — pedido explícito do Matheus

Não pode parecer que travou sem motivo. Desenho acordado:

- Um registro de status (fase atual, quantos processados de quantos no total, hora de início) que a thread atualiza a cada item.
- A tela consulta esse status periodicamente (poll a cada poucos segundos) e mostra um aviso visível (banner/barra) tipo "Varredura em andamento — verificando devolução (87 de 141)..." — some quando termina, e a lista atualiza sozinha.
- Se Ana sair e voltar pra tela (ou der F5) enquanto está rodando, o aviso tem que aparecer na hora, checando o status já no carregamento da página — não só depois de clicar no botão.
- Só 1 varredura (de qualquer um dos 2 botões) pode rodar por vez — **os 2 botões ficam inativos/desabilitados visualmente enquanto qualquer uma das duas estiver rodando** (pedido explícito do Matheus, 20/09/2026 06:44) — evita clique duplo, dobrar carga na API e confundir qual processo está em andamento.
- Como já se tem os tempos médios reais por fase, dá pra mostrar uma estimativa ("~3min") assim que a varredura começa, em vez de deixar sem noção nenhuma de quanto falta.

## Status da varredura e cache de dados — arquitetura de armazenamento (decidido 20/09 07:11)

**Status da varredura — 1 registro sobrescrito, não histórico.** Cada nova varredura sobrescreve o registro de status anterior (fase atual, X de Y processados, hora de início) — não vira uma tabela de histórico com 1 linha por execução. Motivo dado por Matheus: não vai ser possível ficar debugando remotamente no PC da Ana, então não faz sentido guardar histórico de execuções passadas pra analisar depois — só importa o estado da execução atual (ou da última, se já terminou).

**Cache de dados da varredura — tabela SQL nova, não Redis/Memcached/cache do Django.** Toda vez que uma varredura (completa ou de itens em acompanhamento) busca um claim, os dados brutos e as mensagens precisam ser salvos — chamada de API é "cara", então um dado já buscado não pode ser jogado fora, mesmo de um item que não virou "Em Acompanhamento". Decisão: 1 tabela nova, genérica, com 1 registro por claim que qualquer varredura já encontrou alguma vez, guardando:

- dados brutos do claim (JSONField, mesmo padrão já decidido antes desta conversa)
- mensagens (JSONField)
- data/hora da última busca
- uma flag "está acompanhando?" persistida — liga automaticamente (quando bate com uma `Devolucao` pelo `numero_pedido`) ou manualmente (clique em "Acompanhar"), mas só desliga por ação explícita ("Deixar de acompanhar") — nunca reativa sozinha numa varredura futura, mesmo que o item continue aparecendo nos resultados

Confirmado com Matheus: é **literalmente uma tabela do banco SQL** — um model Django novo + migration de verdade, não Redis, Memcached, nem o framework de cache do Django. Como todo o resto do projeto, precisa ser roteada pelas 2 bases (MB/SV) via `EmpresaRouter`, e migrada com `--database` explícito nas duas (igual o comando `migrate` já customizado do projeto exige).

**"Deixar de acompanhar" é só visual.** Clicar nisso só desliga a flag "está acompanhando?" — não apaga nada, nem o registro da cache nem `Devolucao`/`MediacaoAvulsa`. O item simplesmente para de aparecer em "Em Acompanhamento" (mas continua existindo na cache, então se ele aparecer de novo numa varredura futura os dados já estão lá, sem precisar buscar tudo de novo).

**Nome do cliente/produto — só quando vira "Em Acompanhamento".** Nem a varredura completa nem a de itens em acompanhamento buscam nome de cliente ou produto — só o número do pedido importa nesse momento. Só quando um item transita pra "Em Acompanhamento" (automático ou manual) é que vale a chamada extra de API pra preencher esses campos.

**Atualização (20/09 10:31) — decisão superada**: Matheus revisitou isso depois e decidiu buscar nome do cliente/produto pra TODO item já na varredura completa, não só quando vira "Em Acompanhamento" — ver [[Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API]].

## Rotas/endpoints e schema exato — arquitetura de implementação (decidido 20/09 07:38)

**2 decisões confirmadas antes de fechar as rotas:**

- **Varredura é por empresa ativa, sem botão combinado.** Verificado no código real (`core/middleware.py` + `core/database_router.py`): a empresa ativa fica em `request.session['empresa_ativa']`, e o `EmpresaRouter` resolve TODO acesso ao banco (leitura e escrita) pra essa 1 empresa — é assim que o resto do sistema já funciona, inclusive a tela `mediacoes_ml` de hoje. Cada botão de varredura opera só na empresa ativa da sessão que clicou — pra ver/varrer a outra empresa, Ana troca de empresa (como já faz hoje) e roda de novo lá. Consequência: os números combinados usados nesta conversa (79 MB + 62 SV = 141; ~6 típico/~25 extremo em acompanhamento) são o total das 2 empresas somadas — o volume processado por 1 clique é sempre menor (só a parte de 1 empresa), então as estimativas de tempo já calculadas seguem válidas como teto.
- **"Deixar de acompanhar" numa MediacaoAvulsa também não apaga nada** — mesmo mecanismo não-destrutivo do caminho automático (só desliga a flag da cache). O "Excluir" que já existe hoje (`excluir_mediacao_avulsa`, apaga de vez) continua disponível como ação separada, mais forte, pra quando ela quiser mesmo remover os dados.

**Rotas novas**, mesmo padrão de `devolucoes/urls.py` (prefixo `mediacoes/`, nome da rota = nome da view):

```
mediacoes/varredura/iniciar/                        POST  iniciar_varredura_mediacoes
mediacoes/varredura/atualizar-acompanhados/          POST  iniciar_atualizacao_acompanhados
mediacoes/varredura/status/                          GET   status_varredura_mediacoes
mediacoes/claim/<str:claim_id>/acompanhar/           POST  acompanhar_claim
mediacoes/claim/<str:claim_id>/deixar-de-acompanhar/ POST  deixar_de_acompanhar_claim
```

As 2 rotas de iniciar varredura conferem o registro de status antes de disparar a thread — se já tiver algo `rodando=True`, recusam. `status_varredura_mediacoes` alimenta tanto o polling quanto a checagem no carregamento da página. `acompanhar_claim`/`deixar_de_acompanhar_claim` são identificados por `claim_id` (não por tipo Devolucao/MediacaoAvulsa) — a flag mora na tabela de cache, então funciona igual pros 2 caminhos, sem `if` de tipo espalhado pela view.

**Schema da tabela de cache** (`ClaimMercadoLivre`, arquivo próprio `devolucoes/models/claim_mercado_livre.py` — 1 model por arquivo, mesmo padrão do resto):

```
claim_id               CharField, primary_key=True    -- 1 linha por claim
numero_pedido          CharField, db_index=True        -- chave de casamento com Devolucao (não único aqui)
meu_papel               CharField                       -- respondent/complainant
dados_brutos            JSONField                       -- claim cru da API (stage, type, date_created...)
tem_devolucao_fisica    BooleanField null=True          -- True/False/None, mesmo significado de tem_devolucao_fisica()
mensagens               JSONField null=True
esta_acompanhando       BooleanField default=False       -- flag persistida
ultima_busca_em         DateTimeField
criado_em               DateTimeField auto_now_add=True
```

A combinação (Reclamação/+Mediação/+Devolução/+Mediação+Devolução) não fica salva — recalculada na view a partir de `dados_brutos['stage']` + `tem_devolucao_fisica`, reaproveitando `classificar()` já validada, pra nunca ter um valor guardado dessincronizado do dado que o originou.

**Schema do registro de status** (`StatusVarreduraMediacoes`, singleton — sempre a mesma linha via `update_or_create(pk=1, ...)`; schema final, com o campo adicionado em 20/09 07:45):

```
rodando               BooleanField default=False
tipo_execucao         CharField null=True   -- "completa" | "acompanhados"
fase_atual            CharField null=True
processados           IntegerField default=0
total                 IntegerField default=0
itens_nao_confirmados IntegerField default=0  -- soma de erros pontuais (devolução/mensagens) que não pararam o loop
iniciado_em           DateTimeField null=True
finalizado_em         DateTimeField null=True
erro                  TextField blank=True    -- mensagem técnica crua, só pra debug do Matheus (banco/log) -- NUNCA exibida pra Ana
```

Ambos os models migrados nas 2 bases (`--database magazine`/`--database samvale`), igual todo o resto do projeto.

## Trava atômica e UX de erro — fechamento da arquitetura (decidido 20/09 07:45)

**Trava atômica contra clique duplo**: em vez de checar e escrever em 2 passos (`if not status.rodando: ligar()`, com janela de corrida entre ler e escrever), 1 `UPDATE ... WHERE` só, que o MySQL já executa como operação atômica — não precisa de `select_for_update()` nem `transaction.atomic()`:

```python
linhas = StatusVarreduraMediacoes.objects.filter(pk=1, rodando=False).update(
    rodando=True, tipo_execucao='completa', fase_atual='iniciando',
    processados=0, total=0, itens_nao_confirmados=0,
    iniciado_em=timezone.now(), finalizado_em=None, erro='',
)
if linhas == 0:
    # perdeu a corrida (ou já tinha uma rodando) -- recusa, não inicia thread
    return JsonResponse({'erro': 'Já existe uma varredura em andamento.'}, status=409)
```

Se 2 cliques chegarem quase juntos, o banco só deixa 1 dos 2 `UPDATE`s realmente mudar `rodando` de `False` pra `True` — o outro recebe `linhas == 0` na hora, sem depender de timing do Python. A linha singleton (`pk=1`) precisa existir desde sempre — criada como parte da migration que cria o model (passo de dados, não só schema), senão a 1ª checagem (tabela vazia) fica indistinguível de "já tá rodando".

**Correção de um ponto que tinha ficado impreciso (20/09 07:38)**: "a thread não troca de empresa no meio" é verdade, mas não é o mesmo que "não precisa fazer nada" — `threading.local()` é por thread do SO, uma thread nova começa com o armazenamento vazio, não herda a empresa ativa da requisição que a disparou. A thread de segundo plano ainda precisa chamar `definir_empresa_ativa(empresa)` **1 vez, logo no início dela**, com o valor capturado da requisição antes de disparar a thread — senão o router não sabe em qual dos 2 bancos gravar.

**UX de erro — 3 desfechos possíveis, não só sucesso/erro:**
1. **Sucesso limpo** — tudo processado sem problema.
2. **Sucesso com ressalva** — terminou, mas `itens_nao_confirmados > 0` (erros pontuais de item, mesmo padrão já tratado no script de exploração — não param o loop). Mensagem amigável: *"Varredura concluída — 3 itens não puderam ser conferidos, serão tentados na próxima varredura."*
3. **Falha que interrompe tudo** — algo sistêmico (`FalhaAutenticacao`, token parando de renovar — se isso quebrou, toda chamada seguinte ia falhar igual, então aborta o loop inteiro em vez de repetir o mesmo erro 100+ vezes) ou bug inesperado. O `try/except` que embrulha a função inteira da thread pega isso (e `Exception` genérico, por segurança — nunca deixar `rodando` travado em `True` pra sempre) e grava em `erro`, `finalizado_em`, `rodando=False`.

**Decisão final de Matheus: mensagem 100% amigável, sem nada técnico** — ela é usuária comum, o texto técnico não ajuda em nada. Texto único (não varia por causa real, já que a ação dela é sempre a mesma — tentar de novo):

> **"Não foi possível concluir [a varredura completa / a atualização dos itens em acompanhamento]. Os itens já processados foram salvos normalmente — clique no botão pra tentar de novo."**

(a parte entre colchetes troca conforme `tipo_execucao`). O banner desse erro fica na tela até ela agir ou até a próxima varredura começar (não some sozinho) — mesmo espírito do banner "rodando" já decidido, não pode parecer que travou sem motivo. A mensagem técnica crua fica só no campo `erro` do banco/logs, nunca renderizada — o template só checa "tem erro? mostra o texto fixo", nunca interpola o conteúdo real do campo.

## Abertas/Encerradas — como cruza com a nova divisão

Confirmado por Matheus: os 4 grupos (Encontrados/Em Acompanhamento) só existem dentro de "Abertas" — "Encerradas" é um bucket único, sem separar por combinação. Consequência técnica natural: como a varredura hoje só busca `status: "opened"`, "Encontrados pelo Sistema" nunca vai ter conteúdo em "Encerradas" — só "Em Acompanhamento" pode aparecer lá (um item que fechou depois de já estar sendo seguido). Não precisa nem desenhar uma aba vazia pra isso.

## Mockup interativo — aprovado por Matheus

Publicado como Artifact — não deu pra usar a ferramenta "Claude Design" (canvas multi-artboard) nesta sessão, porque ela só roda via `/design` disparado pelo próprio Matheus, então virou uma página HTML interativa comum, publicada com o Artifact tool. Reaproveitou as cores/fontes/classes reais do projeto, extraídas direto do repo (`--cor-primaria`, `--cor-alerta`, `.dp-btn`, `.dp-badge`, `.dp-chip-filtro` — esse último já existia pra outro filtro na mesma tela e serviu perfeito pros 4 grupos novos). URL: https://claude.ai/artifact/DhkLeh4DBWqfSbJShvQ5aS

Mostra: os 2 grupos com os 4 chips de filtro cada (números reais em "Encontrados" — 37/13/39/52/141); os 2 botões disparando uma simulação de progresso (banner amarelo, fase mudando, contador X/Y, botões desabilitados); a estrela movendo um card entre os 2 grupos ao vivo (simula o caminho manual de "acompanhar"); abas Abertas/Encerradas funcionando. Ajuste pedido depois da 1ª versão: "Encontrados pelo Sistema" precisa recolher/expandir e começar sempre recolhido, por não ser o foco da tela — implementado (cabeçalho vira botão com seta, contador "141" continua visível mesmo fechado).

## Em aberto

Nenhum item de arquitetura/produto pendente da idealização em si — todos resolvidos ao longo desta conversa (4 categorias mantidas, mecanismo de acompanhar/deixar de acompanhar, cache + status singleton com schema final, rotas, trava atômica, UX de erro amigável). **Atualização (20/09 10:31): parte disso já foi implementada** — ver [[Implementação do Painel de Mediações — Nome do Cliente na Varredura Completa e Encontrados Clicáveis com Pré-visualização Sem Custo de API]] pro que já está em produção (nome do cliente/produto na varredura completa, "Encontrados" clicável com pré-visualização) e pro único item ainda pendente.

## Relacionado

- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
- [[Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home]]
- [[Exclusão de Mediação Avulsa, Varredura de Claims Abertos e Modelo de Classificação Reclamação-Mediação-Devolução]]
