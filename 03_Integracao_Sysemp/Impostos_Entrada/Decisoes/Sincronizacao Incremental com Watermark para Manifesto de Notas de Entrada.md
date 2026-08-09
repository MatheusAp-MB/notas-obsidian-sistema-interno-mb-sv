---
tipo: decisao
dominio: 
status: ativa
criado: 09/08/2026
atualizado_em: 09/08/2026 19:10
relacionado: [Plano em Etapas do Duble de Precificacao ML, Paginacao do Endpoint Manifesto Nota Entrada, Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker), Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]
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

## Em aberto

- Campos exatos da tabela: só `cobertura_ate`, ou também `ultima_execucao_em` e status/erro da última tentativa (útil pro aviso visual mostrar o motivo, não só "desatualizado"). Não decidido ainda.
- Onde o aviso visual ("dados desatualizados, clique para sincronizar") vai aparecer na tela — usuário decide depois.
- Formato final do botão manual de sincronizar.
- Nome exato dos campos/tabela em código (isso é decisão de implementação, não de design).

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Padrao de Protecao do Cliente Sysemp (Throttle Backoff Sem Circuit Breaker)]]
- [[Sysemp So Permite Acesso de Leitura e Cada API Nova Tem Custo e Prazo]]
