---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Disciplina de Testes Automatizados]
---

# Disciplina de Refatoração e Testes

## Regra dos Três

- Na 1ª vez que algo aparece, só resolve.
- Na 2ª vez que se repete, repete mesmo incomodado.
- Só na 3ª vez, abstrai/generaliza/refatora.

## Regras de refatoração

- Nunca misturar refatoração com feature nova no mesmo commit.
- Reescrita grande ("joga tudo e faz de novo") só é aceitável validando o resultado contra o comportamento anterior — hoje por comparação numérica manual, com meta de migrar pra teste automatizado.
- Código limpo é: óbvio pra outro programador, sem duplicação, com o mínimo de classes/partes móveis, passa em todos os testes, barato de manter.

## Testes automatizados

- Implementado a partir de 02/08/2026 (pytest + pytest-django), começando pela Agenda de Vídeos — "falta de teste" era a causa nº 1 de dívida técnica mais citada, deixou de ser "algum dia".
- Metodologia completa (progressão por camada, formato visual, estrutura de arquivo, etc.) em [[Disciplina de Testes Automatizados]] — esta seção aqui fica só com o motivo de existir.

## Motivo

Reescrita grande sem rede de segurança (teste) é o cenário de maior risco de regressão silenciosa — e este projeto reescreve grande com frequência, de propósito.
