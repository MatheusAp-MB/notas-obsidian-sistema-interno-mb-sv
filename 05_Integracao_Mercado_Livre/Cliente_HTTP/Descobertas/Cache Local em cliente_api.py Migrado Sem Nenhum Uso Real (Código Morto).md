---
tipo: descoberta
dominio: python
status: ativa
criado: 15/09/2026
atualizado_em: 15/09/2026 19:18
relacionado: [Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Padrao de Robustez para Clientes de API Externa, Cache Nao Distingue Erro De Rede De Erro Real Da Api]
---

# Cache Local em cliente_api.py Migrado Sem Nenhum Uso Real (Código Morto)

## O que foi encontrado

Ao auditar `cliente_api.py` (`api_mercado_livre/core/estrutura_api/`) como parte do levantamento pra preparar o botão de teste da API do ML dentro do `.exe` do Sistema de Devoluções (fila separada aberta na decisão recente de retomar o estudo da API do ML com calma, endpoint por endpoint), a seção final do arquivo ("CACHE LOCAL") tem 2 funções — `salvar_cache(chave, dados, pasta_cache)` e `carregar_cache(chave, pasta_cache, max_idade_horas=6)` — que gravam/leem um JSON com timestamp em disco, com expiração por idade configurável.

Busca em todo o `Projeto_Sistema_Interno_V2` não encontrou nenhum chamador de nenhuma das duas funções — nem dentro do próprio `api_mercado_livre` (`chamar_api()` não as usa), nem em nenhum script consumidor. Vieram junto na migração de 12/08/2026 (ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]), que documentou 3 arquivos base — mas essa seção de cache não é 1 dos 3 arquivos documentados lá, é conteúdo extra dentro de `cliente_api.py` que não foi mencionado na nota de migração original.

## Por que registrar

Código morto que sobrevive numa camada de transporte confunde leitura futura — parece funcionalidade ativa (cache automático de resposta da API), mas nunca é chamado. Fica como pendência em aberto, sem decisão tomada ainda:

- Remover, se não há uso planejado.
- Ou documentar intenção futura, se surgir um propósito real (ex: cache de leitura pesada, tipo `/items` em lote).

## Risco se for reaproveitado sem revisão

Se essas funções forem ligadas de verdade algum dia, aplica a mesma lição já registrada em [[Cache Nao Distingue Erro De Rede De Erro Real Da Api]]: do jeito que estão hoje, `salvar_cache()`/`carregar_cache()` não têm nenhuma noção de "isso foi um erro passageiro" vs "isso é o dado real" — gravariam no cache qualquer `dados` passado, sem distinguir origem. Não é um bug agora (porque nada chama), mas é o motivo de não simplesmente ligar sem revisar antes.

## Relacionado

- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
- [[Padrao de Robustez para Clientes de API Externa]]
- [[Cache Nao Distingue Erro De Rede De Erro Real Da Api]]
