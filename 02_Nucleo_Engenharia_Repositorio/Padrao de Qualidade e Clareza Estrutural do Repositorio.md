---
tipo: regra
dominio: 
status: ativa
criado: 15/08/2026
atualizado_em: 15/08/2026 01:39
relacionado: [Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Estrutura de Arquivo e Classe Python, Nomenclatura e Comentarios, Modelagem de Objeto e Encapsulamento, Fluxo Decomposicao de Problemas em Micro Etapas, Reducao de Comandos de Management e Rotina Vira Botao]
---

# Padrão de Qualidade e Clareza Estrutural do Repositório

## Contexto (15/08/2026, 01:39)

Motivado pelo mesmo contexto de liderança de TI descrito em [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]] (nota que absorveu, em 30/08/2026, o conteúdo que antes vivia em "Responsabilidade de Lideranca em TI Eleva o Padrao de Qualidade Exigido") — durante a revisão do setup de banco de dados (`core/management/commands/iniciar_banco.py` e sua cadeia de sub-funções), o usuário decidiu que não basta mais "código que funciona e está correto": quer uma revisão de ponta a ponta do repositório inteiro, contra um padrão explícito de clareza estrutural. Motivo declarado e prazo real: existe uma equipe agora (Cauã e Lucas) que vai lidar com este código na segunda-feira, e o usuário quer garantir — não supor — que o que chegar até eles nesse dia esteja visivelmente melhor, principalmente em legibilidade e compreensão.

## Regra

Toda revisão de código a partir de agora é avaliada contra esta régua, além das regras de estilo já existentes (que esta nota reforça, nunca substitui):

- **Estrutura de pasta e nome de arquivo autoexplicativos** — uma pessoa nova no projeto (Cauã, Lucas, ou qualquer futuro colega) precisa entender o propósito de uma pasta ou arquivo só pelo nome, sem precisar perguntar ou abrir o conteúdo pra descobrir.
- **Preservar e reforçar os paradigmas já em uso — nunca substituir por outro estilo.** POO onde há estado/comportamento real por instância, encapsulamento, classes bem definidas e robustas, dataclasses, uso de log, uso de cache. O objetivo é consistência e rigor dentro do que já existe, não uma reescrita num paradigma diferente. Ver [[Modelagem de Objeto e Encapsulamento]] pro critério de quando usar classe vs. função simples.
- **Comentário sempre didático e autoexplicativo** — reforça [[Nomenclatura e Comentarios]]: o comentário explica o porquê, nunca o óbvio.
- **Responsabilidade única / funções pequenas** — reforça [[Fluxo Decomposicao de Problemas em Micro Etapas]].
- **Consistência entre arquivos que resolvem o mesmo tipo de problema.** Achado real que motivou este ponto: `iniciar_banco.py` e `popular_banco.py` resolvem o mesmo tipo de problema (rodar N passos nomeados em sequência, com log de progresso) usando 2 padrões diferentes — o 2º usa uma lista de tuplas `(nome, função, argumentos)` em loop, com medição de duração por passo; o 1º usa chamadas sequenciais repetitivas. Nenhum dos 2 está "errado" isoladamente, mas a inconsistência entre comandos-irmãos é exatamente o tipo de coisa que esta régua existe pra pegar.
- **Refatoração estrutural está formalmente no escopo** — renomear pasta, mover arquivo, renomear arquivo, excluir arquivo morto. Não é só ajuste de código dentro do arquivo; se a estrutura pedir mudança, a mudança é feita.

## Metodologia de execução

- **Nada disto vira reescrita em massa de uma vez.** Cada achado real continua seguindo o [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]] — explicar o achado, esperar confirmação explícita do usuário, só depois aplicar, mesmo pra mudança pequena (renomear 1 arquivo incluso).
- **Auditoria incremental, não uma tentativa de cobrir o projeto inteiro de uma vez** — app por app, arquivo por arquivo, com calma, ao longo da janela de trabalho livre (14-16/08/2026). Dado o prazo real de segunda-feira, prioridade vai pro que for revisado com profundidade de verdade, mesmo que isso signifique não alcançar 100% das apps do projeto até lá.
- **Progresso da auditoria em si (o que já foi revisado, achados por app, o que falta) vive em nota própria, tipo checkpoint** — criada quando a auditoria começar a gerar achados concretos, não vazia por antecipação.
- **Primeira aplicação prática desta regra:** a revisão em andamento de `core/management/commands/` (pipeline de setup/seed do banco de dados).

## Relacionado

- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
- [[Estrutura de Arquivo e Classe Python]]
- [[Nomenclatura e Comentarios]]
- [[Modelagem de Objeto e Encapsulamento]]
- [[Fluxo Decomposicao de Problemas em Micro Etapas]]
