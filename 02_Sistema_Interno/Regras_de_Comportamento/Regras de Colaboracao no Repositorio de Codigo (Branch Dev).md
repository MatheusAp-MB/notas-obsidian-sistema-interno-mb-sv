---
tipo: regra
dominio: git
status: ativa
criado: 03/08/2026
atualizado_em: 04/08/2026 11:40
relacionado: [Disciplina de Testes Automatizados, Status Manual Atual Ignora Historico Quando Participacao Nao Existe]
---

# Regras de Colaboração no Repositório de Código (branch dev)

Regras vigentes desde que o trabalho passou a usar o clone real do repositório `https://github.com/MatheusAp-MB/Projeto_Sistema_Interno_V2`, sempre na branch `dev`. Valem enquanto esse repositório for a fonte do código sendo testado/discutido.

## Sincronizar só quando pedido

"Sincronizar" = fazer fetch no GitHub. Claude nunca sincroniza sozinho — só quando o usuário pedir explicitamente.

## Editar/escrever/remover só com permissão

Claude só edita, escreve ou remove um arquivo do repositório de código quando o usuário der permissão explícita naquela conversa — nunca por conta própria, mesmo que a mudança pareça óbvia ou pequena. Isso é além do já registrado em [[Disciplina de Testes Automatizados]] (formato "Localize"/"Substitua" pra edição, arquivo novo entregue completo) — aqui a regra é sobre QUEM autoriza, não só o formato de entrega.

## Planejar antes de executar — nada de tarefa/subagente por conta própria

Claude nunca cria tarefas ou aciona subagentes sem permissão. Sempre planeja e discute com o usuário antes de executar qualquer coisa — a ação só acontece sob autorização explícita.

## O vault é a fonte de verdade

Sempre que surgir dúvida sobre regra de negócio, convenção ou decisão de projeto, as notas do vault são a fonte de verdade primária. Se as notas não responderem, Claude pergunta ao usuário — nunca assume ou inventa.

## LEGADO/ não é fonte de verdade

Arquivos dentro de `LEGADO/` são arquivo morto — consulta pontual apenas, nunca base para decisão ou premissa de trabalho atual.

## Mudança de código nunca em prosa — sempre diff exato ou arquivo completo

Reforço com incidente real (04/08/2026): toda mudança de código, mesmo 1 linha, precisa ser entregue como bloco "Localize:"/"Substitua por:" (texto exato do arquivo real) ou arquivo completo — nunca descrita em prosa (ex: "adicione a função X à lista de import").

O que aconteceu: ao corrigir um bug real (`status_manual_atual` ignorando histórico quando `ParticipacaoAgenda` não existia), a instrução de adicionar `status_manual_atual_do_produto` ao bloco de import de `views.py` foi passada em prosa. Nunca foi de fato aplicada no arquivo do usuário — os outros 2 call sites do mesmo fix, entregues como diff exato, foram aplicados e passaram sem problema. O resultado foi um `NameError` real de produção que ficou escondido por várias rodadas de teste (nenhum teste tinha exercitado ainda o único ponto do arquivo que usava essa função), só aparecendo quando essa view finalmente foi testada. Detalhe completo em [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]].

Conclusão prática: nenhuma mudança é pequena o suficiente pra pular o diff exato. Prosa é ambígua o bastante pra nunca ser aplicada, e o erro pode ficar invisível por tempo indefinido até o trecho de código específico ser exercitado.

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Status Manual Atual Ignora Historico Quando Participacao Nao Existe]]
