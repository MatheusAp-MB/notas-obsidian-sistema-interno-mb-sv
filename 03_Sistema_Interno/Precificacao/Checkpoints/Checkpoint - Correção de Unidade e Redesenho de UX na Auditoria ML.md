---
tipo: checkpoint
dominio: python
status: concluido
criado: 14/09/2026
atualizado_em: 14/09/2026 09:02
relacionado: [Exportação em PDF da Auditoria ML — Reaproveitamento da View de Impressão do Navegador, Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes, Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]
---

# Checkpoint - Correção de Unidade e Redesenho de UX na Auditoria ML

**Resumo**: Dentro do mesmo ciclo de trabalho que fechou com a exportação em PDF (ver [[Exportação em PDF da Auditoria ML — Reaproveitamento da View de Impressão do Navegador]]), a tela de auditoria ML recebeu 2 ajustes anteriores, já confirmados funcionando por Matheus antes de pedir a nova funcionalidade de PDF: correção de um bug de unidade na tabela "Todos os itens usados no cálculo", e um redesenho de UX removendo o bloco "Dados do Produto" e tornando essa mesma tabela colapsável por padrão.

> [!success] Concluído — confirmado por Matheus ("Ótimo funcionando")
> Registrado retroativamente no vault junto com a exportação em PDF, a pedido de Matheus — ver nota de decisão vinculada pro que veio depois, no mesmo ciclo.

## Correção de unidade

Tabela "Todos os itens usados no cálculo" corrigida pra exibir a unidade correta de cada item. Campo `unidade` adicionado e propagado em todas as linhas montadas por `montar_tabela_itens_agrupada` (`precificacao/views/modal_comum.py`).

## Redesenho de UX

- Bloco "Dados do Produto" removido do modal
- Tabela "Todos os itens usados no cálculo" passou a vir colapsada por padrão (antes vinha sempre aberta)

## Nota sobre este registro

Este checkpoint foi escrito depois do fato, resgatando de memória o resumo de alto nível de um ciclo já fechado — o diagnóstico detalhado original (o que exatamente causava o bug de unidade, a motivação completa por trás de cada escolha de UX) não ficou registrado passo a passo como de costume. Se algum detalhe aqui estiver impreciso, ajustar depois.

## Relacionado

- [[Exportação em PDF da Auditoria ML — Reaproveitamento da View de Impressão do Navegador]]
- [[Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visoes]]
- [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]]
