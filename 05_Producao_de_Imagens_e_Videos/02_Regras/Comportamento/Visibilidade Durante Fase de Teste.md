---
tipo: regra
dominio: 
status: ativa
criado: 22/08/2026
atualizado_em: 23/08/2026 06:30
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]
---

# Visibilidade Durante Fase de Teste

Enquanto o pipeline de produção de fotos/vídeos ainda está sendo validado, cada etapa (Fases 1-4, Étapa 5, Étapa 6, Grafo 3, prompt final) é exibida ao usuário antes de seguir pra próxima — ele é o dev testando o sistema, não um usuário final recebendo só o resultado pronto.

## Como aplicar

Depois de cada etapa, aguardar uma confirmação explícita (ex.: "siga", "ok") antes de avançar pra próxima. Nunca encadear várias etapas de uma vez só "pra ganhar tempo" enquanto a categoria ainda não provou ser confiável.

## Quando isso pode mudar

Virar autônomo (mostrar só o resultado final) é uma decisão a ser revisitada **categoria por categoria**, não um interruptor global — uma categoria já testada várias vezes (ex.: Pulverizador) pode precisar de menos visibilidade do que uma categoria genuinamente nova (ex.: Muleta, testada pela 1ª vez em 23/08/2026).

## Exemplo real de aplicação

Teste de ponta a ponta da Muleta Axilar Hidrolight (23/08/2026): Fases 1-4 mostradas → usuário disse "siga" → Étapa 5 mostrada → usuário disse "ok" → Étapa 6 escrita → Grafo 3 e prompt de capa mostrados → aprovação explícita das 2 imagens geradas antes de fechar o teste.

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
