---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 27/08/2026
atualizado_em: 27/08/2026 00:20
relacionado: [Metodologia de Analise da Documentacao da API do Mercado Livre, Sistema de Atributos de Item na API do Mercado Livre, Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre, Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Checkpoint — Estudo da API do Mercado Livre (Sessão 26–27/08/2026)

## O quê é esta nota, e como usá-la ao retomar

**O quê**: ponto de parada da sessão de estudo da API do Mercado Livre, escrito antes de uma pausa com troca de computador. Não substitui `00_Indice.md` (que continua sendo a fonte de verdade de toda nota existente, com resumo individual) — esta nota é o **estado da sessão**: o que ficou pendente, o que precisa de decisão, e por onde retomar.

**Como usar ao voltar**: leia esta nota inteira primeiro, depois [[Metodologia de Analise da Documentacao da API do Mercado Livre]] (pra reabsorver o enquadramento correto do estudo antes de continuar), e só depois volte pra `00_Indice.md` pra navegar pelas notas de conteúdo.

## Estado do código — nada pendente

Verificado agora (27/08/2026, 00:20): o clone de trabalho usado pra ler o código real (`/tmp/ml_read_check`, branch `dev`) está **limpo** (`git status` sem nenhuma alteração) — esta sessão inteira foi só leitura de código, nenhum arquivo do repositório `Projeto_Sistema_Interno_V2` foi criado, editado ou commitado. Diferente de sessões anteriores (ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]], que já teve diff não commitado como prioridade #1 ao retomar) — **desta vez não existe esse risco**. Só o vault foi alterado.

## O que foi feito nesta sessão — resumo por camada

**Camada superior** (regra geral, independe de endpoint) — **completa**: Boas Práticas, Considerações de Design, Erro 403, Autenticação e Autorização (+ Recomendações de Autenticação e Token, mesclada), Gerencie seu Aplicativo (+ Permissões Funcionais, mesclada em Erro 403 e na descoberta de achados MB/SV).

**Camada de endpoint** (contrato técnico de 1 recurso por vez) — **3 notas criadas**:
1. [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]] — `GET /items?ids=` (multiget), usado por `buscar_detalhes.py`.
2. [[Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]] — `GET /users/{user_id}/items/search` com `search_type=scan`, usado por `buscar_mlbs.py`.
3. [[Sistema de Atributos de Item na API do Mercado Livre]] — `GET /categories/{category_id}/attributes` e endpoints irmãos — tratada com peso extra por ser onde o usuário extrai o máximo de dado sobre um anúncio.

**Regra de metodologia nova, e a mais importante desta sessão**: [[Metodologia de Analise da Documentacao da API do Mercado Livre]] — corrige o enquadramento do estudo inteiro: não é auditoria de "nosso código está certo?", é construção de conhecimento completo da API (uso seguro/otimizado/eficiente/validado, estrutura geral, capacidade de cada endpoint), pra hoje e pro que ainda vai ser criado. **Essa regra deve ser relida antes de processar qualquer doc nova.**

## Pendências abertas — decisões e ações, não só conhecimento

| # | Pendência | Onde está documentada | Ação necessária |
|---|---|---|---|
| 1 | `TIPO_LIST` em `buscar_mlbs.py` cobre só 2 dos 7 `listing_type_id` documentados (`gold_pro`/`gold_special`; faltam `gold_premium`/`gold`/`silver`/`bronze`/`free`) — MLB nesses 5 tipos nunca é encontrado. | [[Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]] | **Decisão explicitamente adiada pelo usuário pro próximo dia útil**: expandir `TIPO_LIST` (168→588 varridas) ou não. |
| 2 | 2 valores de `STATUS_LIST` (`under_review`, `payment_required`) não aparecem no exemplo de filtro da doc. | Mesma nota acima | **Teste ao vivo a fazer**: descobrir se são valores reais já usados pela Magazine/Samvale, ou se nunca vão encontrar nada. |
| 3 | `attr_seller_package_height/width/length/weight` provavelmente vêm como texto com unidade embutida (ex: `"6 cm"`), não número puro. | [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]] | **Confirmar com dado real do banco** — ainda não verificado. |
| 4 | Campo `unified_units` (visto em `technical_specs/input` e `technical_specs/output`) sem explicação no texto da doc. | [[Sistema de Atributos de Item na API do Mercado Livre]] | Ponto em aberto, sem ação definida — só registrado como lacuna de entendimento. |
| 5 | Doc "Publicar produtos" teve conteúdo de escrita (título, categoria, garantia, gênero, loja oficial, Mercado Pago obrigatório, User Products, erro de validação GENDER) descartado sob o critério antigo — precisa reprocessamento sob a metodologia nova. | [[Metodologia de Analise da Documentacao da API do Mercado Livre]], seção "Caso 1" | **O texto completo da doc só está disponível se esta mesma conversa for continuada.** Numa sessão nova, precisa ser reenviada — ver aviso crítico abaixo. |
| 6 | Doc "Validador de Publicações" foi descartada por inteiro numa sessão anterior, sob o mesmo critério antigo. | [[Metodologia de Analise da Documentacao da API do Mercado Livre]], seção "Caso 2" | **Precisa ser reenviada pelo usuário** — texto não está mais disponível em nenhuma sessão. |

> [!warning] Aviso crítico de migração — texto de doc "Publicar produtos" é dependente desta conversa
> A pendência #5 só pode ser resolvida **sem reenvio** se a próxima sessão for uma continuação desta mesma conversa (mesmo histórico, mesmo contexto). Se o usuário abrir uma conversa nova — inclusive no outro computador — o texto integral da doc "Publicar produtos" **não estará mais disponível pra mim**, e a pendência #5 passa a ter a mesma condição da #6 (precisa reenvio).

## Próximo passo sugerido ao retomar

1. Reler [[Metodologia de Analise da Documentacao da API do Mercado Livre]] — realinhar o enquadramento antes de qualquer coisa.
2. Resolver a decisão pendente #1 (`TIPO_LIST`) — é a única pendência com prazo já combinado ("próximo dia útil").
3. Decidir se reprocessa a doc "Publicar produtos" agora (se ainda for a mesma conversa) ou se ela também vai precisar reenvio.
4. Continuar o mapeamento de endpoint pra recursos da API ainda não tocados (ex: `categories` além do schema de atributo, `questions`, `orders`, `shipments` — nenhum desses foi estudado ainda, mesmo sendo parte do Eixo 2/3 da metodologia).

## Relacionado

- [[Metodologia de Analise da Documentacao da API do Mercado Livre]]
- [[Sistema de Atributos de Item na API do Mercado Livre]]
- [[Recurso Items (GET) — Leitura de Detalhe de Anuncio na API do Mercado Livre]]
- [[Endpoint Users Items Search (Scan) — Busca Completa de MLBs por Vendedor na API do Mercado Livre]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
