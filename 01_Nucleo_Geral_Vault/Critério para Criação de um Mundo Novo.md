---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 16:18
relacionado: [Registro dos Mundos Ativos, Definição do Núcleo Geral do Vault, Estrutura de Pastas de um Mundo]
resumo: O critério de quando uma integração externa nova (API, sistema) merece virar mundo próprio, em vez de virar só mais um contexto dentro de um mundo existente — decidido caso a caso, sem régua numérica fixa, baseado em tamanho e criticidade reais.
---

# Critério para Criação de um Mundo Novo

**Resumo**: o critério de quando uma integração externa nova (API, sistema) merece virar mundo próprio, em vez de virar só mais um contexto dentro de um mundo existente — decidido caso a caso, sem régua numérica fixa, baseado em tamanho e criticidade reais.

## Contexto

Toda vez que uma integração ou sistema novo aparece (ex: uma API nova pra integrar), surge a mesma pergunta: isso vira um mundo próprio (`0X_Nome/`) ou só mais um Contexto dentro de um mundo que já existe (ver [[Estrutura de Pastas de um Mundo]])? Sem um critério fixo, essa decisão corria o risco de ser resolvida caso a caso, na conversa, sem consistência entre uma escolha e outra.

## O que diz

Decisão de 06/08/2026: nem toda API ou integração externa vira mundo — só quando for grande e crítica o suficiente pra justificar ser testada e documentada de forma isolada. O critério é caso a caso, decidido junto com o usuário quando a situação aparecer — não existe uma régua numérica fixa (ex: "acima de X notas vira mundo").

Quando um mundo novo é criado por esse critério, ele vira 1 linha a mais na tabela de [[Registro dos Mundos Ativos]] — nunca um registro solto em outro canto do vault.

## Por que é assim e não de outro jeito

Uma régua fixa (ex: "toda API vira mundo" ou "só vira mundo com 10+ notas") foi descartada porque integrações têm tamanho e criticidade muito diferentes entre si — a API do Mercado Livre e a API do Sysemp lidam com volume de dado e risco (dado fiscal, no caso do Sysemp) grandes o bastante pra justificar isolamento total; uma integração pequena e de baixo risco não precisaria do mesmo tratamento, e forçar todas pelo mesmo molde geraria mundos vazios ou mundos artificialmente inchados só pra caber na regra. Decidir caso a caso, com o usuário, mantém o critério fiel ao motivo real de isolar algo: tamanho e criticidade de verdade, não uma contagem arbitrária.

## Exemplo

`05_Integracao_Mercado_Livre/` já existe como mundo próprio mesmo antes do trabalho de integração ter começado de fato nesta versão do projeto (V2) — a pasta foi criada adiantada, pronta pra receber decisões/descobertas assim que o trabalho começar, porque o critério ("grande e crítico o suficiente") já estava satisfeito pela natureza da integração, independente de quantas notas já existiam ali no momento.

Outro exemplo real do critério em ação: `02_Nucleo_Engenharia_Repositorio/` nasceu quando ficou claro que um conjunto de 10 notas de convenção de engenharia, criadas originalmente dentro de `03_Sistema_Interno/`, na verdade já valiam também pra `04_Integracao_Sysemp/` e `05_Integracao_Mercado_Livre/` — nota que serve mais de 1 mundo é núcleo, não fica presa a um mundo só porque foi criada lá primeiro.

## Relacionado

- [[Registro dos Mundos Ativos]]
- [[Definição do Núcleo Geral do Vault]]
- [[Estrutura de Pastas de um Mundo]]
