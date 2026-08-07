---
tipo: descoberta
dominio: python
status: ativa
criado: 06/08/2026
atualizado_em: 06/08/2026 23:11
relacionado: [Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada, Disciplina de Testes Automatizados]
---

# Checagem de Data Inicial no Futuro Era Código Morto

`ImpostosEntradaXML._validar_periodo()` tinha 2 checagens de limite futuro: uma pra `data_final` e outra pra `data_inicial`. A segunda nunca podia ser alcançada — a checagem anterior já garante `data_inicial < data_final`; se `data_final <= limite_maximo` passou (não levantou), então `data_inicial < data_final <= limite_maximo` é verdade automaticamente, e `data_inicial` nunca poderia sozinha estourar o limite.

Achado pela cobertura de teste (`pytest-cov` apontou a linha como Miss, mesmo depois de cobrir todos os cenários de negócio óbvios) — tentar escrever um caso de teste que exercitasse essa linha teria exigido um cenário matematicamente impossível (`data_inicial > limite` COM `data_inicial < data_final`), o que por si só já era o sinal de que o código, não o teste, estava errado.

## Correção

Checagem de `data_inicial` além do limite removida — a de `data_final` sozinha já cobre os 2 casos. `status` não muda (não chegou a virar bug em produção, achado antes de qualquer uso real).

## Relacionado

- [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]
- [[Disciplina de Testes Automatizados]]
