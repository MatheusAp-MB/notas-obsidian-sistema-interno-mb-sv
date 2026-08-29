---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Integridade e Fonte Unica de Dado, Estrutura de Arquivo e Classe Python]
---

# Fluxo — Decomposição de Problemas em Micro-Etapas

"Fluxo" é o nome que demos à prática de sempre pensar um problema em micro-problemas antes de gerar qualquer código — não é só uma convenção de estrutura de arquivo, é a forma como qualquer problema deve ser pensado neste projeto.

## Regra

- Sempre preferir muitas funções pequenas e especializadas a uma função grande e trabalhosa — cada pequena função pode ser aperfeiçoada sozinha pro seu papel específico, sem afetar as outras.
- Função grande/complexa é decomposta em funções aninhadas menores, sempre que esses passos não servirem a outro caso (mesmo critério de sempre: reaproveitada em mais de 1 lugar → solta; serve só a esse processo → aninhada).
- Exceção ao critério acima: mesmo com uso único, a função fica solta (não aninhada) quando representa um passo com valor de teste isolado (ex: prever rodadas futuras, montar as etapas de uma rodada) — testabilidade pesa mais que a regra padrão nesse caso.
- Exemplo: `entregar_dimensoes_do_produto_com_peso_cubado_calculado()` decompõe internamente em `ler_dimensoes()` → `organizar_dimensoes()` → `gerar_peso_cubado()`.
- Antes de gerar qualquer código, pensar no fluxo: quais são os micro-problemas desse problema? Isso vem antes de escrever qualquer linha — é a mesma lógica da regra de diagrama de fluxo obrigatório antes do código.

## Motivo

Quando uma diretriz de marketplace ou regra interna muda — o que acontece com frequência — o ajuste fica isolado na micro-etapa específica que precisa mudar, sem precisar mexer no todo. Isso é o que sustenta manutenção fácil, cobrança direta do superior de Matheus. Também é mais simples de pensar: um problema grande é difícil de segurar na cabeça inteiro; vários problemas pequenos, não.

## Relacionado

- [[Integridade e Fonte Unica de Dado]]
- [[Estrutura de Arquivo e Classe Python]]
- [[Disciplina de Refatoracao e Testes]]
