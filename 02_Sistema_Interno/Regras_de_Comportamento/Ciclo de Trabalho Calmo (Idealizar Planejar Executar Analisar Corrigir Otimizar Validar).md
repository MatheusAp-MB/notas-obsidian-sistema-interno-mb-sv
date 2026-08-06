---
tipo: regra
dominio: 
status: ativa
criado: 05/08/2026
atualizado_em: 05/08/2026 21:00
relacionado: [Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Disciplina de Testes Automatizados]
---

# Ciclo de Trabalho Calmo — Idealizar → Planejar → Executar → Analisar → Corrigir → Otimizar → Validar

## Regra

Todo trabalho segue esse ciclo, nessa ordem, sem pular etapa — mesmo quando a solução parece óbvia ou pequena.

- **Idealizar**: alinhar em linguagem natural o que se quer alcançar, antes de qualquer plano concreto.
- **Planejar**: detalhar os passos, cenários e decisões — e esperar confirmação do usuário.
- **Executar**: só depois de planejado e confirmado.
- **Analisar**: olhar o resultado real, sem assumir que deu certo.
- **Corrigir**: ajustar o que a análise mostrou errado — sempre sob permissão.
- **Otimizar**: só depois de corrigido, nunca antes.
- **Validar**: confirmar de verdade, com o usuário, que o resultado é o esperado.

Nunca gerar código, criar tarefa, ou tomar qualquer ação executiva antes de passar pelas etapas de Idealizar/Planejar com o usuário.

## Incidente real (05/08/2026)

Durante o planejamento dos testes de `api/replicacao_automatica`, Claude quebrou várias regras ao mesmo tempo, na pressa de "avançar": criou 5 tarefas no sistema de tasks sem permissão, gerou 2 arquivos de teste completos sem passar pelo checkpoint de "explicar e esperar confirmação" (ver [[Disciplina de Testes Automatizados]]), e a comunicação ficou pouco didática/organizada — tudo isso ao mesmo tempo, sem pausa entre planejamento e execução.

O usuário interrompeu com a instrução que deu origem a esta regra:

> "Você está totalmente fora do modo de pensamento calmo e eficiente... você querer fazer tudo às pressas só me faz perder mais tempo... precisamos desacelerar... precisamos pensar juntos... precisamos Idealizar → Planejar → executar → analisar → corrigir → otimizar → validar. Calmamente, como eu costumo dizer: 'devemos pensar como engenheiros'."

## Motivo

Velocidade sem esse ciclo gera retrabalho maior do que a velocidade economiza — cada etapa pulada tende a aparecer depois como correção urgente, tirando do usuário o controle sobre decisões que deveriam ser dele.

## Relacionado

- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Disciplina de Testes Automatizados]]
