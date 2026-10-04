---
tipo: checkpoint
dominio:
status: em_andamento
criado: 02/10/2026
atualizado_em: 02/10/2026 19:35
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução, Checkpoint - Catálogo de Peças e Tela de Produtos]
---

# Validação Mobile em Aparelho Real — Teste Real Liberado em 02/10/2026

## Última atualização

02/10/2026, 19:35 — nota criada.

**Resumo do estado atual**: até o último commit do repositório `Projeto-Sistema-Devolucao` visível no GitHub em 02/10/2026 (de 28/09/2026), Matheus não tinha celular, então tudo que é mobile no Sistema de Relatório de Devoluções foi feito e validado de forma "simulada", sem aparelho físico. Em 02/10/2026 ele passou a ter um celular e agora pode testar o sistema de verdade. Nenhum teste real foi registrado ainda.

> [!info] Mudança de situação (02/10/2026, 19:35)
> A validação mobile deixa de ser só simulada e passa a poder ser feita em aparelho real. Nada foi testado no celular até agora — esta nota é o ponto de partida do registro.

## Contexto

**O que significa "simulado"**: sem um celular físico, nenhuma tela pensada para uso no celular podia ser aberta num aparelho de verdade. Elas foram construídas e validadas sem o aparelho — por exemplo, a tela de conferência de peça mobile (`conferir_devolucao.html`, implementada em 08/09/2026, ver [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]).

**Por que isso importa**: o comportamento num aparelho real (toque, tamanho real da tela, teclado, câmera, barra do navegador) pode ser diferente do que uma simulação mostra. Só o aparelho de verdade confirma se uma tela funciona no celular.

**Pra que serve esta nota**: marcar a data em que a validação real passa a ser possível e servir de lugar único (checkpoint vivo, atualizado no lugar) para registrar, daqui em diante, o que for testado no celular e qual foi o resultado.

## Linha do tempo

**Até 28/09/2026** — Sem celular. Toda tela com uso mobile (conferência de peça e as demais que precisam funcionar no celular) foi desenvolvida e validada de forma simulada.

**02/10/2026, 19:35** — Matheus passa a ter um celular e informa que agora pode testar de verdade. Nenhum teste real feito ainda.

## Em aberto

- [ ] Definir por quais telas começar o teste real no celular — decisão de Matheus, ainda não tomada
- [ ] Registrar nesta nota o resultado de cada teste real feito (nenhum até agora)
- [ ] Itens que já estavam em aberto no vault e envolvem mobile: auditoria mobile-first da tela Nova Devolução (ver [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]) e de Produtos (ver [[Checkpoint - Catálogo de Peças e Tela de Produtos]])

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]
- [[Checkpoint - Catálogo de Peças e Tela de Produtos]]
