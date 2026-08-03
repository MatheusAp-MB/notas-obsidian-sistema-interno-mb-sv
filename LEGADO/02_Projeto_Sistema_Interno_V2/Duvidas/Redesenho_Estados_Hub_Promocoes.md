---
tipo: decisao
status: pendente-validacao
criado: 12/07/2026
dominio: sistema-interno-django
relacionado: [[Hierarquia e Comportamentos de Precificação]], [[Hub de Promoções]], [[Fórmula de Margem e Rebate]]
---

# Redesenho: Estado Atual vs Ação Recomendada no Hub de Promoções

## Problema identificado

Ao revisar a tela de Recomendação de Precificação e o Hub de Promoções, o DEV percebeu uma confusão estrutural: cards como "Preço Atual" ou "Manter preço atual" eram exibidos com a mesma aparência visual de uma recomendação de ação real (ex: "Preço Direto"), mesmo quando na prática significavam "não faça nada". Isso gerava dúvida mesmo para quem projetou o sistema ("o que significa isso, tenho que remover da promoção?").

A causa raiz: o sistema sempre calcula e exibe um "cenário vencedor", mas nunca compara esse vencedor contra o estado atual do MLB antes de decidir *como* apresentá-lo. Um vencedor igual ao estado atual não é uma ação — é uma confirmação de que nada precisa mudar.

## Distinção conceitual estabelecida

Duas coisas que precisam ser sempre visualmente e logicamente separadas:

- **Estado Atual**: fato, realidade objetiva. O MLB está ou não em promoção agora, e se está, em qual.
- **Ação Recomendada**: só deve existir e ser exibida quando o cenário vencedor calculado for **diferente** do estado atual. Se for igual, a tela deve mostrar apenas uma confirmação neutra (ex: "Nada a fazer" / "Já está no melhor cenário"), nunca repetir o estado atual como se fosse uma ação a ser tomada.

## Os 4 estados reais por MLB

Cruzando dois eixos — **tem promoção ativa?** × **existe candidato melhor que o estado atual?**:

1. **Sem promoção ativa + sem candidato melhor** → "Sem oportunidade" (nada a fazer, nunca teve motivo pra ação)
2. **Sem promoção ativa + com candidato melhor** → "Candidato a participar" (ação real: iniciar promoção)
3. **Com promoção ativa + existe candidato melhor** → "Oportunidade de troca" (ação real: sair da promoção ativa, entrar na nova)
4. **Com promoção ativa + nenhum candidato melhor** → "Otimizado" (nada a fazer, já é a melhor solução possível hoje)

Apenas os estados 2 e 3 devem exibir um botão de ação real (ex: "Participar" / "Trocar"). Os estados 1 e 4 devem exibir apenas a confirmação, sem nenhum call-to-action de mudança.

## Premissa assumida (PENDENTE DE CONFIRMAÇÃO)

Ficou assumido, para efeito de modelagem inicial, que **existe no máximo 1 promoção ativa por MLB por vez** — ou seja, o modelo de negócio é sempre de "troca" (sair da ativa, entrar na nova), nunca de acúmulo de múltiplas promoções ativas simultâneas para o mesmo MLB.

Essa premissa **ainda não foi validada** — o DEV vai confirmar com seu superior se essa regra de negócio está correta ou se, na prática, um MLB pode ter mais de uma promoção ativa ao mesmo tempo.

**Impacto se a premissa mudar:** se for possível ter múltiplas promoções ativas simultâneas, a comparação "estado atual vs candidato melhor" deixa de ser 1-para-1 (ativa única vs vencedor calculado) e passa a ser N-para-N (conjunto de ativas vs conjunto de candidatos) — o que exige revisar a lógica de comparação e possivelmente a estrutura de dados usada para representar "estado atual".

## Próximo passo técnico (ainda não iniciado)

Definir onde a comparação "vencedor calculado == estado atual?" deve morar tecnicamente: campo novo persistido, property calculada em tempo de leitura, ou ajuste na estrutura de `RecomendacaoPrecificacao`. Também é preciso definir como isso se propaga para os filtros do Hub de Promoções (que hoje já possuem `_passa_promocao_ativa` e `_passa_promocao_candidata`, mas ainda não distinguem os 4 estados acima como categorias de filtro).

## Relacionado:
[[Hierarquia e Comportamentos de Precificação]]
[[Hub de Promoções]]
[[Fórmula de Margem e Rebate]]