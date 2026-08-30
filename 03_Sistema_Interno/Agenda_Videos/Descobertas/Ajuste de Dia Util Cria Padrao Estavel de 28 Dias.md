---
tipo: descoberta
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Cadencia de 30 e 90 Dias Corridos Contados do Replicado]
---

# Ajuste de Dia Útil Cria Padrão Estável de ~28 Dias

Validado no script de teste de ciclo de vida completo (`scripts_dev/testar_ciclo_de_vida_novo.py`): Simples → Vídeo Mensal #1-4 → Vídeo Trimestral #1-2.

## Observação

Sextas-feiras + 30 dias corridos caem em domingo. Ajustado para o último dia útil (a sexta anterior), isso cria um padrão estável de aproximadamente **28 dias reais** entre ocorrências, em vez de exatos 30.

## Interpretação

Matemática correta, não bug — é o efeito esperado e consistente da combinação entre "30 dias corridos" (regra de cadência) e "ajuste pro último dia útil" (regra de dia útil), quando a data de partida cai numa sexta-feira.

## Relacionado

- [[Cadencia de 30 e 90 Dias Corridos Contados do Replicado]]
