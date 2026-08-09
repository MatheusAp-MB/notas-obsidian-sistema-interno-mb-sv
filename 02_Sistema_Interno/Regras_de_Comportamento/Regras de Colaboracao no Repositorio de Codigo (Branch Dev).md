---
tipo: regra
dominio: git
status: ativa
criado: 03/08/2026
atualizado_em: 09/08/2026 19:10
relacionado: [Disciplina de Testes Automatizados, Status Manual Atual Ignora Historico Quando Participacao Nao Existe, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
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

## Código é sempre texto na conversa — nunca arquivo criado por Claude

Todo código entregue ao usuário (script novo, diff, arquivo completo) vai como texto dentro da própria mensagem, em bloco de código — nunca como um arquivo que Claude cria (nem em pasta de rascunho/scratchpad, nem apresentado como card de arquivo). O usuário mesmo decide onde salvar, copiando o texto.

Incidente real (05/08/2026): Claude escreveu 2 scripts de diagnóstico de Drive usando a ferramenta de criar arquivo e os apresentou como cards de arquivo, em vez de colar o código na conversa. O usuário já tinha pedido isso antes; a repetição do erro gerou a correção: "Eu já te falei que não é pra você criar arquivos... você deve mandar todo o código na conversa como texto." Regra vale pra qualquer código (scripts de diagnóstico, testes, diffs) — sem exceção por ser "só um rascunho" ou "só leitura".

Reincidiu em 09/08/2026, no mundo `03_Integracao_Sysemp`: Claude escreveu uma simulação de sincronização incremental direto num arquivo (via ferramenta de shell), em vez de colar o código como texto na conversa — mesmo erro do incidente de 05/08, em contexto diferente. Corrigido junto com o incidente de execução sem permissão, registrado em [[Disciplina de Testes Automatizados]].

## O vault é a fonte de verdade

Sempre que surgir dúvida sobre regra de negócio, convenção ou decisão de projeto, as notas do vault são a fonte de verdade primária. Se as notas não responderem, Claude pergunta ao usuário — nunca assume ou inventa.

## LEGADO/ não é fonte de verdade

Arquivos dentro de `LEGADO/` são arquivo morto — consulta pontual apenas, nunca base para decisão ou premissa de trabalho atual.

Incidente real (09/08/2026): questionado sobre ter executado código sozinho, Claude buscou a regra correspondente e achou (e citou) uma versão dela dentro de `LEGADO/01_Notas_Gerais/Regras/`, em vez de checar primeiro aqui em `02_Sistema_Interno/Regras_de_Comportamento/`. O conteúdo até coincidia, mas a fonte errada foi usada como base — o usuário corrigiu explicitamente ("VOCÊ NUNCA LÊ NADA DE LEGADO"). Daqui pra frente, qualquer dúvida sobre regra de comportamento é resolvida primeiro nesta pasta.

## Mudança de código nunca em prosa — sempre diff exato ou arquivo completo

Reforço com incidente real (04/08/2026): toda mudança de código, mesmo 1 linha, precisa ser entregue como bloco "Localize:"/"Substitua por:" (texto exato do arquivo real) ou arquivo completo — nunca descrita em prosa (ex: "adicione a função X à lista de import").

O que aconteceu: ao corrigir um bug real (`status_manual_atual` ignorando histórico quando `ParticipacaoAgenda` não existia), a instrução de adicionar `status_manual_atual_do_produto` ao bloco de import de `views.py` foi passada em prosa. Nunca foi de fato aplicada no arquivo do usuário — os outros 2 call sites do mesmo fix, entregues como diff exato, foram aplicados e passaram sem problema. O resultado foi um `NameError` real de produção que ficou escondido por várias rodadas de teste (nenhum teste tinha exercitado ainda o único ponto do arquivo que usava essa função), só aparecendo quando essa view finalmente foi testada. Detalhe completo em [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]].

Conclusão prática: nenhuma mudança é pequena o suficiente pra pular o diff exato. Prosa é ambígua o bastante pra nunca ser aplicada, e o erro pode ficar invisível por tempo indefinido até o trecho de código específico ser exercitado.

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
