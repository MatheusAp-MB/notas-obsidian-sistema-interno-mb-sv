---
tipo: decisao
dominio: 
status: ativa
criado: 10/07/2026
relacionado: []
---

# Não Rastrear Histórico de Catálogo Encerrado via family_id

Decisão de não implementar uma feature que mostraria, para um Anúncio
Simples, se ele já teve no passado um Anúncio de Catálogo vinculado que
foi encerrado.

## Contexto que levou à decisão

Foi confirmado com um caso real (`MLB2616936722` Simples ↔
`MLB3925238352` Catálogo encerrado) que os dois compartilhavam o mesmo
`family_id`, e que a ordem de criação batia com a hipótese: o anúncio
nasceu Simples, foi promovido a um par com Catálogo depois, e quando esse
Catálogo foi encerrado, o vínculo (`catalog_product_id`) desapareceu do
lado que sobrou vivo — revertendo-o para Simples na classificação atual,
mesmo o MLBU de fundo permanecendo o mesmo.

Isso levantou a possibilidade de usar `family_id` para mostrar, na tela,
algo como "este anúncio já teve um catálogo, que foi encerrado em [data]".

## Teste que levou à decisão de não implementar

Rodado contra a base real: de 66 Anúncios de Catálogo órfãos e encerrados,
apenas 30 (45%) tinham algum Anúncio Simples com o mesmo `family_id` na
base. Os outros 36 (55%) não tinham nenhuma correspondência — motivo não
investigado a fundo (hipóteses: base também encerrada, `family_id`
ausente em um dos lados, ou o catálogo nunca teve par desde o início).

## Decisão tomada

Não implementar o rastreamento de histórico. O sistema mostra apenas o
estado **atual** do anúncio (Simples/Base/Catálogo, conforme os campos
brutos de agora) — sem tentar reconstruir relações do passado via
`family_id`.

## Motivo da decisão

A cobertura de 45% é baixa demais para justificar a complexidade de
implementar e manter essa funcionalidade. Prioridade do sistema é "o que
existe e está ativo agora", não histórico de anúncios encerrados.

## Relacionado

- [[Regras Gerais]]