---
tipo: decisao
dominio: 
status: proposta
criado: 05/08/2026
atualizado_em: 05/08/2026 21:00
relacionado: [Convencao de Nomenclatura de Arquivos no Drive, Checkpoint Testes Automatizados Agenda Videos]
---

# Badge de Aviso Para Arquivos Inconsistentes no Drive

Ideia do usuário (05/08/2026), surgida durante a validação manual do Drive: adicionar ao fluxo da Agenda de Vídeos uma verificação automática de inconsistência entre o NOME do arquivo e o conteúdo real (`mimeType`) — o mesmo tipo de checagem feita manualmente nesta sessão (achado do par `Trimestral_01_Completo`/`Trimestral_01_Roteiro` com nomes invertidos em relação ao conteúdo real, ver [[Checkpoint Testes Automatizados Agenda Videos]]) — e mostrar uma badge de aviso ("AVISO: Arquivos Inconsistentes") em algum ponto do fluxo final, quando isso for detectado.

## Status

Ainda não planejado — só a ideia registrada. Falta decidir, quando chegar a vez desse trabalho:

- Onde exatamente a badge aparece (tela do produto? Agenda geral? Card do card do dashboard?).
- Quando a checagem roda (a cada sincronização de indicadores? sob demanda, ao abrir a tela?).
- O que conta como "inconsistente" — pelo menos 2 casos já confirmados na prática: nome promete vídeo (Base/Completo) mas o `mimeType` não começa com `video/`; nome promete Roteiro mas o `mimeType` É vídeo.

## Relacionado

- [[Convencao de Nomenclatura de Arquivos no Drive]]
- [[Checkpoint Testes Automatizados Agenda Videos]]
