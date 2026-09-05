---
tipo: decisao
dominio: python
status: concluida
criado: 04/09/2026
atualizado_em: 04/09/2026 20:26
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja, Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]
---

# Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)

**Resumo**: depois do rascunho ser apresentado e 100% aprovado (ver linha do tempo 03/09/2026 e 04/09/2026 em [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]), o projeto muda de fase — deixa de ser prova de conceito e passa a ser desenvolvido como sistema real. Duas decisões de arquitetura fecham essa virada: o banco de dados troca de SQLite pra MySQL (mesmo padrão do Sistema Interno V2), e o modelo de entrega do app fica definido como a pasta com o `.exe` dentro (`--onedir`, já validada), com um atalho do Windows apontando pra dentro dela — descartando tanto o `.exe` único quanto um instalador completo.

> [!success] Decidido — 04/09/2026, 20:26
> MySQL + MySQL Workbench como banco (config manual na 1ª vez, migrations automáticas depois via `launcher.py`), entrega em pasta (`--onedir`) com atalho no lugar de instalador. Regra fixada: usuária final nunca precisa do dev pra iniciar/manter o dia a dia — só abrir o atalho.

## Contexto

Com o rascunho validado por quem realmente vai usar (colega de equipe, usuária final) e pelo superior do usuário, o projeto deixou de ser um experimento descartável — ver linha do tempo em [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]] (04/09/2026, 20:00). Isso reabriu 2 decisões que tinham sido fechadas ainda no começo do projeto, sob premissas que não valem mais: o banco de dados (SQLite foi escolhido em 01/09/2026 pra evitar a complexidade de instalar/gerenciar MySQL) e o modelo de entrega (só tinha sido validado o `.exe` em pasta, nunca comparado de propósito contra alternativas).

## O problema

Definir, com o projeto agora tratado como sistema real (não mais rascunho): (1) qual banco de dados usar, e como ele se conecta ao app entregue como `.exe`; e (2) qual o melhor formato de entrega do app pra usuária final, entre 3 opções levantadas pelo usuário — `.exe` único, pasta com `.exe` dentro, ou instalador com atalho gerado.

## O que levou à resposta

Banco de dados: o usuário deixou claro que não quer "sofrer" reinventando solução nova — quer usar o que já domina e já é usado no Sistema Interno V2 (MySQL + MySQL Workbench), já que o sistema vai crescer de verdade. A objeção original ao MySQL (complexidade de instalar/gerenciar) não se aplica de fato: quem instala e mantém o MySQL Server é sempre o próprio usuário (dev), numa única máquina — a usuária final nunca encosta nisso.

Modelo de entrega: analisadas as 3 opções lado a lado.
1. `.exe` único (`--onefile`): descartado — já testado e abandonado antes (ver linha do tempo 01/09/2026, 21:13), porque extrai tudo pra uma pasta temporária a cada abertura, gerando atraso perceptível toda vez, sem correção possível.
2. Pasta com `.exe` dentro (`--onedir`): é a arquitetura já validada ponta a ponta hoje — abre rápido, sem atraso de extração.
3. Instalador completo (ex: Inno Setup) com atalho: dá a experiência mais "profissional", mas acrescenta uma ferramenta nova ao processo e mais um passo em toda atualização (gerar `.exe` + gerar instalador + rodar instalador na máquina) — sem ganho real, já que existe 1 máquina só e quem instala/atualiza é sempre o próprio usuário, presencialmente.

Escolhida a opção 2, com um ajuste que resolve o único ponto fraco dela sem custo nenhum: um atalho normal do Windows na área de trabalho da usuária, apontando pro `.exe` dentro da pasta — mesma experiência de "um ícone, um clique" de um instalador, sem ferramenta nova nem passo extra de atualização.

Operação do MySQL, definida junto: o MySQL Server é instalado uma única vez, na mesma máquina que roda o `.exe`, no setup inicial (o usuário confirmou que não tem problema precisar ir lá pessoalmente essa vez). A criação do banco (schema) em si também fica manual, feita pelo usuário no MySQL Workbench nesse mesmo setup inicial — decisão explícita dele, não automatizada. Já as migrations do Django, a cada atualização, continuam 100% automáticas: o `launcher.py` chama `migrate` sozinho toda vez que o app abre (mesmo padrão já planejado desde o bug de empacotamento encontrado em 03/09/2026, agora valendo pro MySQL igual valeria pro SQLite). Regra do usuário, fixada como inegociável: depois desse setup inicial, a usuária final nunca mais pode precisar do dev pra iniciar o servidor ou qualquer coisa do tipo — só abrir o atalho e usar.

## Decisão

- **Banco de dados: MySQL + MySQL Workbench**, no mesmo padrão do Sistema Interno V2 — substitui o SQLite decidido em 01/09/2026. Motivo: o projeto vai crescer de verdade, e o usuário prefere reusar o que já domina a resolver problema novo.
- **MySQL Server instalado uma única vez**, na mesma máquina que roda o `.exe` (conexão via `localhost`) — feito pelo usuário, presencialmente, no setup inicial daquela máquina.
- **Criação do banco (schema) é manual**, feita pelo usuário via MySQL Workbench, também só no setup inicial — decisão explícita, não automatizada.
- **Migrations são automáticas em toda atualização**: `launcher.py` roda `migrate` sozinho a cada abertura do app, sem intervenção manual — vale pro MySQL igual valeria pro SQLite, ainda não implementado no código.
- **Modelo de entrega: pasta com `.exe` dentro (`--onedir`) + atalho do Windows** apontando pra dentro da pasta — descartado tanto o `.exe` único (`--onefile`, já provou ter atraso de extração sem correção) quanto um instalador completo (complexidade e atrito de atualização desnecessários pra 1 máquina só).
- **Regra fixada**: fora do setup inicial (que pode exigir presença do dev), a usuária final nunca precisa do dev pra uso do dia a dia — só abrir o atalho.
- **Ainda em aberto**: o padrão exato de conexão (host/usuário/senha/driver) a replicar do Sistema Interno V2 — usuário ainda vai passar esses detalhes.

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]
- [[Tutorial - Como Compilar e Testar o Sistema de Devolução (Com e Sem o .exe)]]
