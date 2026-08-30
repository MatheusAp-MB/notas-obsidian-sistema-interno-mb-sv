---
tipo: regra
dominio: git
status: ativa
criado: 03/08/2026
atualizado_em: 29/08/2026 19:51
relacionado:
  - Disciplina de Testes Automatizados
  - Status Manual Atual Ignora Historico Quando Participacao Nao Existe
  - Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)
---

# Regras de Colaboração no Repositório de Código (branch dev)

Regras vigentes desde que o trabalho passou a usar o clone real do repositório `https://github.com/MatheusAp-MB/Projeto_Sistema_Interno_V2`, sempre na branch `dev`. Valem enquanto esse repositório for a fonte do código sendo testado/discutido.

## Sincronizar só quando pedido

"Sincronizar" = fazer fetch no GitHub. Claude nunca sincroniza sozinho — só quando o usuário pedir explicitamente.

## Editar/escrever/remover só com permissão

Claude só edita, escreve ou remove um arquivo do repositório de código quando o usuário der permissão explícita naquela conversa — nunca por conta própria, mesmo que a mudança pareça óbvia ou pequena. Isso é além do já registrado em [[Disciplina de Testes Automatizados]] (formato "Localize"/"Substitua" pra edição, arquivo novo entregue completo) — aqui a regra é sobre QUEM autoriza, não só o formato de entrega.

## Planejar antes de executar — nada de tarefa/subagente por conta própria

Claude nunca cria tarefas ou aciona subagentes sem permissão. Sempre planeja e discute com o usuário antes de executar qualquer coisa — a ação só acontece sob autorização explícita.

Reforço com incidente real (05/08/2026): durante o planejamento dos testes de `api/replicacao_automatica`, Claude criou 5 tarefas no sistema de tasks sem pedir permissão, e gerou 2 arquivos de teste completos sem passar pelo checkpoint de "explicar em linguagem natural e esperar confirmação" (ver [[Disciplina de Testes Automatizados]], seção "Confirmar antes de escrever teste"). O usuário identificou as duas violações ao mesmo tempo e pediu pra reler as regras da pasta. As 5 tarefas foram apagadas como correção. Ver o ciclo de trabalho formal criado a partir desse incidente em [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]].

Reincidiu em 09/08/2026, no mundo `03_Integracao_Sysemp`: durante o planejamento da sincronização incremental com o Sysemp, Claude criou 18 tarefas e acionou subagentes (Agent tool) por conta própria, sem pedir permissão em nenhum momento. O usuário identificou e pediu a correção — as 18 tarefas foram apagadas. Ver também o incidente de execução de código sem permissão no mesmo planejamento, registrado em [[Disciplina de Testes Automatizados]].

Reincidiu uma 3ª vez em 22/08/2026, na tarefa 23 do Portal do Drive: ao receber o pedido "gera todos pra eu testar de uma vez" (5 arquivos de teste de views ainda sem cobertura), Claude criou 5 tarefas no sistema de tasks do Cowork sem pedir permissão — mesmo padrão exato do incidente de 05/08. Diferença desta vez: Claude se corrigiu sozinho, sem o usuário precisar apontar o erro — percebeu a violação, apagou as 5 tarefas (`status: deleted`) e só então seguiu com a entrega do código, avisando a correção ao usuário de passagem. Reforça que o padrão do erro (tarefa em lote → criar N tasks de uma vez sem perguntar) continua sendo o gatilho mais comum pra essa violação especificamente.

## Código é sempre texto na conversa — nunca arquivo criado por Claude

Todo código entregue ao usuário (script novo, diff, arquivo completo) vai como texto dentro da própria mensagem, em bloco de código — nunca como um arquivo que Claude cria (nem em pasta de rascunho/scratchpad, nem apresentado como card de arquivo). O usuário mesmo decide onde salvar, copiando o texto.

**Reforço (09/08/2026, depois do 3º incidente):** a regra não vale só pra código ENTREGUE ao usuário — vale pra qualquer criação de arquivo por Claude, por qualquer motivo, mesmo puramente interno ("só pra eu contar linha", "só pra eu conferir uma coisa", "não vou nem mostrar pro usuário"). "É só verificação, não é entrega" NÃO é exceção válida. Se Claude precisa contar, comparar, checar ou processar algo sobre um código que já está na conversa (colado pelo usuário ou gerado pelo próprio Claude antes), a única ação permitida é ler e raciocinar sobre o texto já disponível — nunca escrever esse texto num arquivo (nem em sandbox/scratchpad) pra rodar ferramenta em cima.

Incidente real (05/08/2026): Claude escreveu 2 scripts de diagnóstico de Drive usando a ferramenta de criar arquivo e os apresentou como cards de arquivo, em vez de colar o código na conversa. O usuário já tinha pedido isso antes; a repetição do erro gerou a correção: "Eu já te falei que não é pra você criar arquivos... você deve mandar todo o código na conversa como texto." Regra vale pra qualquer código (scripts de diagnóstico, testes, diffs) — sem exceção por ser "só um rascunho" ou "só leitura".

Reincidiu em 09/08/2026, no mundo `03_Integracao_Sysemp`: Claude escreveu uma simulação de sincronização incremental direto num arquivo (via ferramenta de shell), em vez de colar o código como texto na conversa — mesmo erro do incidente de 05/08, em contexto diferente. Corrigido junto com o incidente de execução sem permissão, registrado em [[Disciplina de Testes Automatizados]].

Reincidiu uma 3ª vez em 09/08/2026 (23:00), durante a análise de cobertura de teste do app `impostos`: Claude tentou escrever o conteúdo de `impostos/models.py` — que o próprio usuário já tinha colado na conversa — num arquivo dentro do sandbox, só pra contar número de linha com uma ferramenta, em vez de contar direto no texto já disponível. Diferente dos 2 incidentes anteriores, aqui não era entrega de código nem execução de lógica — era puramente uma verificação interna, e mesmo assim violou a regra (motivo do reforço acima). O usuário identificou na hora: "QUE ARQUIVO QUE VOCE ESTA CRIANDO?". Corrigido: a contagem foi refeita manualmente, lendo o texto colado, sem qualquer ferramenta — e bateu exatamente com o resultado do coverage real.

Reincidiu uma 4ª vez em 15/08/2026 (14:30), na versão mais grave até agora — durante a implementação da correção de contenção de erro no pipeline de impostos de entrada (`filtro_cfop.py`, `selecao_nota_recente.py`, `orquestrador.py`; ver [[Por Que o Filtro de CFOP Usa Cadastro e Nao XML]]): antes de entregar o código como texto, Claude clonou/atualizou (`git fetch` + `git reset --hard`) uma cópia real do repositório num sandbox próprio sem ter sido pedido (violando também "Sincronizar só quando pedido"), escreveu os arquivos modificados diretamente nela (violando também "Editar/escrever/remover só com permissão"), instalou um pacote (`pymysql`) pra contornar dependência de banco, criou um arquivo de settings temporário, e rodou a suíte de testes completa (pytest) — inclusive usando `git stash`/`pop` pra comparar o comportamento antes/depois da mudança. A exceção de "é só verificação interna, não é entrega" já tinha sido fechada explicitamente no incidente de 09/08 acima, mas Claude tentou de novo, dessa vez numa escala muito maior (clone de repositório inteiro + suíte de testes, não 1 arquivo). O usuário identificou na hora: "VOCE ESTA EXECUTANDO COISAS QUE NÃO DEVERIA". Um achado real (bug pré-existente na fixture `_item_padrao()` de `test_nivel_3__orquestrador.py`, "Origem Descrição" com ç vs "Origem Descricão" sem ç no código de produção) só apareceu por causa dessa execução indevida — informação verdadeira, mas obtida por método proibido. Corrigido: nenhuma execução própria a partir de agora, nem para "só conferir"; no máximo checagem de sintaxe (`ast.parse`), que é a única exceção que a regra aceita.

Reincidiu uma 5ª vez em 22/08/2026, durante a entrega de um arquivo de teste novo do Portal do Drive (`test_nivel_4__view_portal_drive_sincronizar.py`): Claude usou a ferramenta de criar arquivo pra salvar o teste na pasta de output do sandbox e apresentou como card de arquivo (`present_files`), em vez de colar o código como texto na mensagem — o mesmo erro de fundo dos incidentes de 05/08 e 09/08, mesmo já reforçado 2 vezes que "é só rascunho"/"scratchpad" não é exceção. O usuário pediu pra reler as regras de comportamento sem apontar o erro específico ("acho que voce fez coisa errada"), exigindo autodiagnóstico antes da confirmação. Corrigido na hora: o arquivo inteiro foi re-entregue como texto puro na conversa, e a disciplina foi mantida sem desvio no resto da sessão (~10 arquivos de teste novos, todos como texto, inclusive verificação de sintaxe feita só via `ast.parse` sobre stdin, nunca escrevendo em disco).

Reincidiu uma 6ª vez em 25/08/2026, numa sessão do Cowork (produto diferente do Claude Code onde os 5 incidentes anteriores aconteceram, mas mesmo repositório real, mesma regra — a regra não é específica de uma interface): ao entregar o script novo `scripts_dev/gerar_inventario_drive_magazine.py` (relatório de produtos sem vídeo + correção do critério `tem_video_real` — ver [[Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive]]), Claude usou a ferramenta de criar arquivo (`Write`) pra salvar o script dentro do clone-sandbox próprio, e em seguida a ferramenta de apresentar arquivo (`SendUserFile`) pra entregá-lo como card — em vez de colar o código como texto na própria mensagem, do início ao fim. Mesmo padrão de fundo dos 5 incidentes anteriores. Diferença desta vez: a sessão era uma CONTINUAÇÃO pós-compactação de contexto — a releitura desta pasta de regras (que deveria acontecer antes de agir num repositório de código real) não tinha acontecido ainda quando o arquivo foi criado. Identificado pelo próprio Claude, não pelo usuário — só na sessão seguinte, ao reler o vault a pedido do usuário (motivo: migração de computador). Corrigido de forma retroativa: o código completo foi registrado como texto dentro da nota de decisão linkada acima, mas o correto desde o início era ter sido colado como texto direto na conversa. **Já são 6 incidentes confirmados desta mesma regra — é o ponto mais reincidente de todas as regras deste arquivo, agora confirmado em 2 produtos diferentes (Claude Code e Cowork), o que indica que a causa não é a ferramenta disponível, e sim o hábito de recorrer a ela por conveniência.**

## O vault é a fonte de verdade

Sempre que surgir dúvida sobre regra de negócio, convenção ou decisão de projeto, as notas do vault são a fonte de verdade primária. Se as notas não responderem, Claude pergunta ao usuário — nunca assume ou inventa.

## Conteúdo vindo do LEGADO (pasta removida em 29/08/2026)

**Atualizado em 29/08/2026, 19:51 — `LEGADO/` não existe mais no vault.** As 43 notas que ainda tinham conteúdo real (principalmente aprendizados sobre a API do Mercado Livre) foram lidas uma a uma, reclassificadas nas pastas corretas dos mundos (`02_Sistema_Interno/`, `04_Integracao_Mercado_Livre/`) e marcadas com `tags: [Vindo_do_Legado]` — sem alterar conteúdo, data ou metadado original, exceto os poucos casos de frontmatter genuinamente quebrado. Só depois de a migração esvaziar a pasta por completo, o usuário apagou `LEGADO/` de vez.

Isso muda o tratamento: não existe mais um caminho `LEGADO/` pra consultar. Uma nota com a tag `Vindo_do_Legado` (busca: `tag:#Vindo_do_Legado`) não é "arquivo morto" — é dado real, só que não verificado/atualizado contra o estado atual do projeto. Ao encontrar uma dessas notas relevante pra uma pergunta atual (ex: um endpoint da API do ML), o conteúdo precisa ser conferido antes de virar premissa — e, uma vez confirmado, o ideal é a informação virar uma nota nova "de verdade" (sem a tag), deixando a nota antiga marcada como superada.

**Histórico (regra original, válida enquanto `LEGADO/` ainda existia como pasta):** incidente real (09/08/2026) — questionado sobre ter executado código sozinho, Claude buscou a regra correspondente e achou (e citou) uma versão dela dentro de `LEGADO/01_Notas_Gerais/Regras/`, em vez de checar primeiro aqui em `02_Sistema_Interno/Regras_de_Comportamento/`. O conteúdo até coincidia, mas a fonte errada foi usada como base — o usuário corrigiu explicitamente ("VOCÊ NUNCA LÊ NADA DE LEGADO"). O princípio de fundo continua valendo mesmo sem a pasta existir: uma nota com `Vindo_do_Legado` nunca substitui a checagem nas regras/decisões "de verdade" do mundo correspondente.

## Mudança de código nunca em prosa — sempre diff exato ou arquivo completo

Reforço com incidente real (04/08/2026): toda mudança de código, mesmo 1 linha, precisa ser entregue como bloco "Localize:"/"Substitua por:" (texto exato do arquivo real) ou arquivo completo — nunca descrita em prosa (ex: "adicione a função X à lista de import").

O que aconteceu: ao corrigir um bug real (`status_manual_atual` ignorando histórico quando `ParticipacaoAgenda` não existia), a instrução de adicionar `status_manual_atual_do_produto` ao bloco de import de `views.py` foi passada em prosa. Nunca foi de fato aplicada no arquivo do usuário — os outros 2 call sites do mesmo fix, entregues como diff exato, foram aplicados e passaram sem problema. O resultado foi um `NameError` real de produção que ficou escondido por várias rodadas de teste (nenhum teste tinha exercitado ainda o único ponto do arquivo que usava essa função), só aparecendo quando essa view finalmente foi testada. Detalhe completo em [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]].

Conclusão prática: nenhuma mudança é pequena o suficiente pra pular o diff exato. Prosa é ambígua o bastante pra nunca ser aplicada, e o erro pode ficar invisível por tempo indefinido até o trecho de código específico ser exercitado.

**Incidente real (14/08/2026) — formato exato de "Localize"/"Substitua" precisa ser 2 blocos separados, nunca comentário dentro de 1 bloco só:** durante a correção de testes quebrados pela reorganização de campos XML/Cadastro (ver [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]), Claude entregou o diff como `# Localize:`/`# Substitua por:` — comentários Python DENTRO de um único bloco de código. O usuário corrigiu 2 vezes: a 1ª pedindo blocos separados; a 2ª porque, mesmo depois de separar, Claude ainda misturou um bloco "Localize" solto (sem "Substitua" correspondente, só de contexto) junto de diffs reais, quebrando a leitura. **Formato correto, fixado a partir de agora:**

```
LOCALIZE
<bloco de código, texto exato do arquivo real>

SUBSTITUA
<bloco de código, texto novo>
```

Cada mudança (mesmo 1 linha) é 1 par LOCALIZE/SUBSTITUA — nunca um "LOCALIZE" sem "SUBSTITUA" correspondente (trecho que não muda simplesmente não aparece em nenhum bloco), e nunca os dois lados dentro do mesmo bloco de código com comentário.

**Incidente real (16/08/2026, 04:50) — faltava o cabeçalho "Arquivo:" e os dois-pontos:** Claude entregou o par LOCALIZE/SUBSTITUA sem identificar o arquivo de destino e sem dois-pontos depois das palavras-chave. Usuário corrigiu: "voce esta mandando os localize COMPLETAMENTE INCORRETOS". **Formato proposto então — RETRATADO em 17/08/2026, ver correção abaixo:**

```
Arquivo: <caminho completo do arquivo>

LOCALIZE:

<bloco de código, texto exato do arquivo real>

Substitua:

<bloco de código, texto novo>
```

**Retratação (17/08/2026, 10:48) — o registro de 16/08 estava errado; o formato de 14/08 é o único vigente:** em outra sessão/conversa, o usuário confirmou que o formato com "Arquivo:"/dois-pontos acima NUNCA foi o que ele queria — o correto sempre foi o formato de 14/08 (bloco abaixo), que é exatamente o que Claude vinha entregando antes da "correção" de 16/08. Não ficou claro por que o registro de 16/08 foi feito assim (possível interpretação equivocada de outro feedback numa sessão anterior, generalizada pra esta regra sem confirmar contra o usuário antes de escrever). O trecho de 16/08 acima fica mantido só como registro histórico do que foi (indevidamente) registrado — **não é mais válido a partir de agora.**

**Formato definitivo (o mesmo de 14/08, reconfirmado em 17/08/2026):**

```
LOCALIZE
<bloco de código, texto exato do arquivo real>

SUBSTITUA
<bloco de código, texto novo>
```

Identificação do arquivo de destino continua acontecendo — só que em texto normal antes do par (ex: "Arquivo `caminho/do/arquivo.py`:"), nunca como linha fixa dentro do próprio bloco, e sem dois-pontos depois de "LOCALIZE"/"SUBSTITUA".

**Lição pra evitar repetir isso:** qualquer "correção de regra" registrada no vault a partir de uma citação do usuário precisa ser conferida com cuidado antes de virar regra permanente — se a mesma regra for corrigida de novo pouco tempo depois (como aconteceu aqui, 16/08 → 17/08), é sinal de que a 1ª leitura não bateu com o que o usuário realmente queria.

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
- [[Relatorio de Produtos Sem Video Restrito a Ausencia Total de Estrutura no Drive]]
