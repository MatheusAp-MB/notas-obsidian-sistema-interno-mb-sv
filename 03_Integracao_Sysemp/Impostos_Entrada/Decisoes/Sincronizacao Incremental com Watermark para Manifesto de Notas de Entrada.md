---
tipo: decisao
dominio: 
status: ativa
criado: 09/08/2026
atualizado_em: 19/08/2026 18:27
relacionado: [Plano em Etapas do Duble de Precificacao ML, Paginacao do Endpoint Manifesto Nota Entrada, Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker), Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo, Estrutura de Arquivo e Classe Python, Modelagem de Objeto e Encapsulamento, Integridade e Fonte Unica de Dado, Orquestracao da Sincronizacao de Impostos de Entrada via XML, Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]
---

# Sincronização Incremental com Watermark para Manifesto de Notas de Entrada

## Contexto

Depois da primeira carga histórica completa (necessária pra "ter tudo"), fica a pergunta: como manter esses dados atualizados sem reler um período gigantesco de datas a cada vez? A API só filtra por data — não existe filtro por produto — então não importa rastrear "última nota por produto" pra decidir O QUE buscar; isso só importa depois, pra decidir o que fazer com o que foi buscado (merge).

## Desenho

**Watermark global**: 1 campo, `cobertura_ate` — a última data até onde a sincronização já rodou com sucesso.

**Janela da próxima busca**: `data_inicial = cobertura_ate − margem_de_seguranca` (margem = 7 dias, calibrada pra rodadas diárias — dá uns 6 dias de sobra além do intervalo mínimo entre rodadas); `data_final = hoje`.

**Motivo da margem**: `Data Entrada da Nota` pode ter atraso entre a entrada física da mercadoria e o lançamento real no Sysemp (mesmo padrão já visto no domínio, ver [[Campo Entrada do Manifesto Pode Nao Ser a Entrada Fisica Real]]). Sem essa margem, uma nota atrasada nunca seria capturada.

**Autocorreção**: se o sistema ficar dias sem sincronizar (nenhuma rodada acontece — ver seção do comando `iniciar` abaixo), a fórmula já se ajusta sozinha, porque é sempre `cobertura_ate − margem`, não um número fixo de dias pra trás. Não precisa de tratamento especial pra "ausência prolongada".

**Watermark só avança após sucesso confirmado.** Se a busca ou o merge falharem no meio, `cobertura_ate` NÃO é atualizado — a próxima tentativa reprocessa a mesma janela (agora maior, por causa da margem), nada se perde.

**Só chama a API se realmente desatualizado.** Antes de qualquer chamada de rede, compara `cobertura_ate + margem` contra hoje — se ainda estiver dentro da margem, não busca nada. Regra explícita do usuário, motivada por um detalhe prático: o servidor local é reiniciado várias vezes por dia durante desenvolvimento (`runserver` não é estável ainda) — sem essa guarda, cada restart dispararia uma chamada de rede sem necessidade, batendo de frente com o throttle já existente no cliente Sysemp (ver [[Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]]).

**Falha de sincronização nunca impede o servidor de subir.** Se o Sysemp estiver fora do ar ou der erro de rede, loga o aviso e sobe mesmo assim com o dado que já existe — desatualizado é melhor que sistema fora do ar por causa de uma API de terceiro.

**Merge por produto**: reaproveita a lógica já existente (Data Entrada da Nota desc, NR NF desc como desempate, mesmo critério de `selecionar_nota_mais_recente_por_produto.py`) — só que aplicada apenas aos produtos que aparecem no lote novo, nunca recalculado do zero. Produto fora do lote fica intocado; produto novo é adicionado; nota mais antiga que a já registrada é ignorada (nunca regride).

## Como isso é acionado (sem servidor sempre ativo)

O sistema roda local (`runserver`), não em nuvem — não existe processo sempre ativo tipo cron/Celery beat pra disparar isso sozinho num horário fixo. Decisão: em vez de agendamento real, o comando de subir o servidor é substituído por um customizado, `manage.py iniciar` — ele faz a checagem/sincronização (só chama a API se desatualizado, conforme regra acima) e só depois sobe o `runserver` de fato. Complementado por um botão manual de sincronizar (posição na tela ainda não decidida), pra cobrir o caso do servidor ficar de pé por muito tempo sem reiniciar.

## Primeira sincronização (sem watermark nenhum ainda)

Quando não existe `cobertura_ate` registrado (primeiro uso), o próprio `iniciar` dispara a carga histórica completa automaticamente, sem passo manual separado — decisão do usuário. Data inicial: `DATA_INICIAL = '2020-05-01'`, validada manualmente pelo usuário como o ponto mínimo real de dados úteis do sistema (nada antes disso importa). Ponto de atenção levantado (não bloqueante, usuário confirmou a data como validada): uma tentativa anterior de buscar 2020-01-01 até hoje bateu no bug de encoding conhecido do lado do Sysemp (ver histórico em [[Paginacao do Endpoint Manifesto Nota Entrada]] e no Checkpoint) — só funcionou estreitando pra 2023-2026. Fica registrado como risco conhecido pra essa carga inicial automática, caso o problema reapareça.

## Tabela dedicada "Sincronização com o ERP"

Nova tabela no banco (o banco está sendo remodelado agora, junto de várias funções de precificação) — guarda o `cobertura_ate` e o que mais for decidido (ver "Em aberto"). Decisão explícita do usuário: essa tabela é **só** pra essa função específica (sincronizar dados de entrada do XML) — não generalizada pra outras futuras integrações Sysemp (Cadastro de Produtos, dados de saída), seguindo a Regra dos Três já estabelecida em [[Disciplina de Refatoracao e Testes]]: só generaliza quando a 2ª necessidade real aparecer, não antes.

## Implementado e validado (09/08/2026 20:50)

Nomes finais, diferentes dos provisórios usados no desenho acima — registrados aqui pra não ficar divergente do código real:

- **Watermark virou 2 campos, não 1.** O desenho original falava em 1 campo (`cobertura_ate`). Na prática, virou `data_inicial_cobertura` + `data_final_cobertura` — separação que nasceu de uma distinção discutida depois deste documento: "data de cobertura" (o que já está garantido, nunca regride) é diferente de "data de parâmetro" (a janela pedida numa chamada específica). `data_inicial_cobertura` escreve só 1 vez (na primeira sincronização bem-sucedida, enquanto estiver vazia) e nunca é sobrescrita depois; `data_final_cobertura` avança a cada sincronização bem-sucedida. As 2 datas moram como campos comuns (`models.DateField`), nunca como propriedade calculada, porque são o próprio dado bruto persistido — o que é calculado é `esta_desatualizada()`.
- **Model:** `SincronizacaoXmlManifestoNotaEntrada`, no app novo dedicado `integracao_sysemp` (app próprio, não dentro de `core`/`produtos` — decisão explícita, já que o código de sincronização vai crescer com serviço/cliente API depois). Campos: `data_inicial_cobertura`, `data_final_cobertura`, `data_ultima_chamada` (`DateTimeField`, guarda hora — sustenta cooldown entre tentativas), `status` (`TextChoices`: `Sincronizado`/`Falha`), `motivo_da_falha`.
- **Status simplificado pra 2 valores, não 3.** A proposta original tinha "Sincronizado"/"Desatualizado"/"Falha ao sincronizar". "Desatualizado" nunca chegou a virar campo persistido — vira o método `esta_desatualizada(data_referencia=None)`, calculado a partir de `data_final_cobertura + margem` vs. hoje. Motivo: [[Integridade e Fonte Unica de Dado]] proíbe guardar campo 100% dedutível de outro dado já guardado.
- **`obter()`**: `get_or_create(pk=1)` — mesmo esquema de linha única já usado em `ConfiguracaoOperacional` (não é o Singleton do GoF, sem restrição de linguagem — ver [[Padroes de Projeto GoF Quando Usar]]).
- **Comando renomeado**: `manage.py iniciar` (proposto no desenho original) virou `manage.py iniciar_servidor`, pra não colidir com o `manage.py iniciar_banco` que já existe no projeto (achado real, checando o código, não suposição).
- Migração (`0001_initial`) aplicada com sucesso no banco real do usuário.
- **Teste pytest Nível 3** (`integracao_sysemp/tests/test_nivel_3__sincronizacao_xml_manifesto.py`) escrito, rodado pelo usuário e validado: 10 testes reais + 1 xfail proposital, 100% cover / 0 Miss / 0 BrPart em `integracao_sysemp/models.py`. Cobre: criação de linha vazia, `esta_desatualizada` nunca sincronizado / dentro da margem / fora da margem / usando `date.today()` quando não informado, primeira sincronização preenchendo as 2 datas, segunda sincronização nunca regredindo `data_inicial_cobertura`, `registrar_falha` nunca tocando a cobertura, e os 2 métodos de escrita usando `timezone.now()` real (provado por intervalo antes/depois da chamada) quando `agora` não é informado.

## Implementado e validado (10/08/2026 00:55)

Método novo `calcular_janela_da_proxima_busca(data_referencia=None) -> tuple[date, date]` — decide `data_inicial`/`data_final` da próxima chamada à API. Adicionado aqui (não no orquestrador) porque depende só de campos e constante que já moram neste model (`data_final_cobertura`, `MARGEM_DE_SEGURANCA_DIAS`) — mesmo raciocínio de `esta_desatualizada()`. Nova constante `DATA_INICIAL_PRIMEIRA_CARGA = date(2020, 5, 1)` (mesma data já validada manualmente, usada só na 1ª sincronização, quando `data_final_cobertura` ainda é `None`). 3 cenários novos testados (primeira vez, com cobertura aplicando a margem, sem `data_referencia`), mantendo os 100% de cobertura do model.

O serviço que de fato chama a API e aciona `registrar_sincronizacao_bem_sucedida()`/`registrar_falha()` foi escrito — ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]] pro desenho e implementação completos.

## Implementado e validado (19/08/2026 18:27) — flag `--forcar`

**Contexto do achado**: durante uma investigação urgente de inconsistência fiscal na marca HIDROLIGHT (relatório já enviado ao superior e à contabilidade — detalhe completo em [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]], seção "Status real agora (19/08/2026)"), ficou claro que **não existia nenhum jeito manual de ignorar a guarda de `esta_desatualizada()`** — o comando `manage.py sincronizar_impostos_entrada` só reconsultava a API depois que a margem de 7 dias expirasse de verdade, mesmo quando o usuário sabia, na hora, que um dado novo podia ter entrado no Sysemp fora do ritmo normal.

**O que existia e continua existindo, sem mudança**: os 2 cálculos deste model continuam INDEPENDENTES um do outro, e essa independência é o que possibilitou a correção — `esta_desatualizada()` é só o "vale a pena tentar?" (a guarda), `calcular_janela_da_proxima_busca()` é só o "qual período pedir, se eu for tentar?" (a janela, que sempre já reconsulta os últimos `MARGEM_DE_SEGURANCA_DIAS` antes da cobertura anterior, nunca só "a partir de agora"). O bug de percepção do usuário não estava na janela (ela já fazia a coisa certa) — estava na guarda impedir a janela de rodar quando alguém pedia manualmente.

**Mudança real**: `sincronizar_impostos_entrada_xml()` (`integracao_sysemp/servicos/orquestrador.py`) ganhou o parâmetro `forcar=False` — quando `True`, pula o `if not registro_watermark.esta_desatualizada(): ...` e vai direto pra `calcular_janela_da_proxima_busca()` + busca na API, mesmo com a cobertura fresca. `manage.py sincronizar_impostos_entrada` ganhou a flag correspondente `--forcar` (`action='store_true'`), repassada pro orquestrador.

**Validado com dado real**: cobertura em `18/08/2026`, rodando `--forcar` no dia seguinte (`19/08/2026`, ainda dentro da margem de 7 dias) — a janela calculada e efetivamente buscada na API foi `11/08/2026 → 19/08/2026` (cobertura − 7 dias até hoje), exatamente a fórmula de `calcular_janela_da_proxima_busca()`. Confirma que a guarda estava mesmo impedindo a busca, e que ignorá-la não muda o cálculo da janela em si.

**Decisão consciente, ainda em dias corridos**: o usuário considerou, na hora de decidir esta correção, se a margem/janela deveria contar em dias ÚTEIS em vez de corridos — decidiu explicitamente manter dias corridos por enquanto ("pode ser em dias corridos, tá bom o suficiente no momento"), decisão revisitável se aparecer um caso real onde isso importe.

**Teste novo**: `test_forcar_ignora_guarda_e_busca_mesmo_com_watermark_fresco`, em `integracao_sysemp/servicos/tests/test_nivel_3__orquestrador.py` — watermark sincronizado dentro da margem, API mockada (ao contrário do teste irmão `test_nao_desatualizado_nao_chama_api_nem_grava_nada`, que proíbe a API), chama com `forcar=True`, confirma que o bruto foi gravado (prova que a API foi chamada de verdade).

> [!warning] Pendente — confirmar se este código já foi commitado/enviado
> O diff foi entregue como texto (Localize/Substitua) nesta sessão, e o usuário confirmou que já está aplicado e funcionando localmente (rodou `--forcar` e o resultado bateu com o esperado). **Não há confirmação, até agora, de que isso foi commitado e enviado pro GitHub** — antes de continuar em outro computador, confirmar `git status`/`git log` no `integracao_sysemp/`, porque sem o push o outro computador não vai ter essa flag disponível.

Isso resolve só o "o comando não busca de novo tão cedo" — não resolve, sozinho, o problema real da HIDROLIGHT (que parece estar em outro lugar: filtro de CFOP e/ou seleção de nota mais recente por produto — ver a nota principal linkada acima pro estado completo dessa investigação, ainda em aberto).

## Em aberto

- Onde o aviso visual ("dados desatualizados, clique para sincronizar") vai aparecer na tela — usuário decide depois.
- Formato final do botão manual de sincronizar.
- Implementação do comando `manage.py iniciar_servidor` em si — ainda não escrita (hoje o disparo é manual, via `manage.py sincronizar_impostos_entrada`).
- Cooldown entre tentativas de falha consecutivas — `data_ultima_chamada` foi desenhado pra sustentar isso, mas nenhuma regra/método de cooldown foi definido ainda.

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]]
- [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]]
- [[Estrutura de Arquivo e Classe Python]]
- [[Modelagem de Objeto e Encapsulamento]]
- [[Integridade e Fonte Unica de Dado]]
- [[Padroes de Projeto GoF Quando Usar]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
