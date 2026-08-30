---
tipo: checkpoint
dominio: python
status: em_andamento
criado: 30/08/2026
atualizado_em: 30/08/2026 00:32
relacionado: [Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint), Exemplo — Decisao (Modelo de Demonstracao), Exemplo — Descoberta (Modelo de Demonstracao), Exemplo — Regra (Modelo de Demonstracao), Exemplo — Tutorial (Modelo de Demonstracao)]
resumo: Nota-modelo (demonstração) do tipo checkpoint — acompanha a implementação, em andamento, da decisão de cachear a grade de precificação, incluindo a sessão em que a descoberta sobre frete variável aconteceu.
---

# Checkpoint: Implementação do Cache de 24h na Grade de Precificação (Checkpoint)

**Resumo**: implementação, em andamento, da decisão registrada em [[Exemplo — Decisao (Modelo de Demonstracao)]] — cache básico já funciona pra produtos de frete fixo; produtos de frete variável ainda não têm solução definida (ver "Em aberto").

> [!warning] Isto é uma nota-modelo, não um checkpoint real do sistema
> Criada em 30/08/2026 só pra demonstrar o modelo de escrita [[Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint)]]. As datas de sessão abaixo (10/07, 14/07, 20/07/2026) são fictícias, parte da história de exemplo — não é o dia real em que este arquivo foi escrito (30/08/2026).

> [!warning] EM ANDAMENTO — falta decidir o comportamento pra produtos de frete variável
> Cache com invalidação por alteração de custo já implementado e testado pra produtos de frete fixo. Durante os testes, foi descoberto que produtos de frete variável não se beneficiam do cache do jeito que está — ver [[Exemplo — Descoberta (Modelo de Demonstracao)]] — e ainda não foi decidido o que fazer com esse grupo.

## Linha do tempo

**Sessão de 10/07/2026** — Implementado o cache básico conforme [[Exemplo — Decisao (Modelo de Demonstracao)]]: resultado da grade guardado em memória por produto, com timestamp de quando foi calculado, e expiração automática depois de 24 horas.

**Sessão de 14/07/2026** — Implementado o gatilho de invalidação: toda alteração de custo de produto agora dispara a limpeza do cache daquele produto especificamente, sem esperar as 24 horas. Testado com 5 produtos de frete fixo (não recalculado por transportadora) — alteração de custo derrubou o cache corretamente em todos os 5, confirmado com dado real de log.

**Sessão de 20/07/2026** — Ao testar com produtos de frete variável (recalculado por transportadora a cada consulta), percebido que o cache não estava ajudando nesses casos — o motivo virou a nota [[Exemplo — Descoberta (Modelo de Demonstracao)]]. Decisão de separar esse grupo pra tratamento futuro, sem bloquear o que já funciona pros demais produtos.

## Em aberto

- [x] Cache básico com expiração de 24h implementado e testado.
- [x] Invalidação automática ao alterar custo implementada e testada (produtos de frete fixo).
- [ ] Decidir o que fazer com produtos de frete variável — cachear só a parte do cálculo que não depende do frete, ou aceitar que esse grupo não se beneficia do cache por enquanto?
- [ ] Depois de decidido o ponto acima, atualizar [[Exemplo — Tutorial (Modelo de Demonstracao)]] com qualquer passo adicional necessário pra produtos de frete variável.

## Relacionado

- [[Modelo de Escrita — Estado ao Longo do Tempo (Checkpoint)]]
- [[Exemplo — Decisao (Modelo de Demonstracao)]]
- [[Exemplo — Descoberta (Modelo de Demonstracao)]]
- [[Exemplo — Regra (Modelo de Demonstracao)]]
- [[Exemplo — Tutorial (Modelo de Demonstracao)]]
