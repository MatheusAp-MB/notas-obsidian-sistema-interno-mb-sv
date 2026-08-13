---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 13/08/2026
atualizado_em: 13/08/2026 15:20
relacionado: [Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]
---

# Migração dos Scripts Consumidores (`buscar_mlbs`/`buscar_detalhes`) e Pipeline de Popular Banco

> Nota criada pra fechar uma pausa (13/08/2026, 15:20) — usuário vai trocar de PC e não vai ter acesso à conversa que gerou isso. Captura o estado real de onde a migração da API do Mercado Livre parou, depois da base de autenticação já estar migrada e validada (ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]).

## Onde a migração está agora

A base (`api_mercado_livre/core/` — auth OAuth2+PKCE, gerenciador de token multi-conta, cliente HTTP) já está migrada, commitada e validada com chamada real nas 2 contas (MB/SV). O próximo passo — migrar os scripts que **consomem** essa base pra buscar dados de verdade — foi identificado, mas **nada foi migrado ainda**: o usuário colou `buscar_mlbs.py` e `buscar_detalhes.py` (ainda na pasta separada antiga do computador) como os 2 próximos a mover, e a sessão mudou de foco antes de qualquer diff ser gerado ou aplicado.

## Problemas conhecidos, não resolvidos, nesses 2 scripts

- **Profundidade de `sys.path`** — hoje fazem `sys.path.insert(0, str(Path(__file__).resolve().parent.parent))` (só 2 níveis acima). Na nova localização dentro do repo (mais aninhada que a pasta antiga), esse caminho vai precisar de ajuste — quantos níveis exatamente ainda não foi decidido, depende de onde esses 2 arquivos forem colocados dentro do repo.
- **Nome do módulo de import ambíguo** — os scripts fazem `from core.estrutura_api.chamadas_safe_api import chamar_api`, mas o cliente HTTP já migrado ficou em `api_mercado_livre.core.estrutura_api.cliente_api` (nome de arquivo diferente: `chamadas_safe_api` vs `cliente_api`). **Nunca foi esclarecido se são a mesma função com nome trocado, ou se existem 2 implementações diferentes** — precisa confirmar antes de decidir o import certo.
- **`conta` faltando nas chamadas** — desde que `gerenciador_token.py` passou a exigir `conta` explícito (sem padrão), toda chamada a `chamar_api(...)` dentro desses 2 scripts também precisa passar esse argumento — hoje não passa, vai quebrar direto.
- **Descompasso de pasta de saída, confirmado lendo o código real:** `buscar_detalhes.py` salva em `APP_performance/dados_brutos/detalhes_mlbs.json`, mas `core/management/commands/popular_banco.py` espera o arquivo em `Arquivos_API/detalhes_mlbs.json` (constante `CAMINHO_DETALHES_MLBS`). Enquanto esses 2 scripts não forem migrados/ajustados, o pipeline de popular banco não tem como ler o resultado deles direto.

## Achados sobre o pipeline de popular banco (investigação só de leitura, via sync)

Perguntado "quais arquivos preciso pra popular o banco?" — respondido lendo `core/management/commands/iniciar_banco.py` e `popular_banco.py` direto (sem modificar nada):

- **`manage.py iniciar_banco`** — roda 8 funções `popular_*` de `iniciar_banco_suporte/`, todas autocontidas (sem depender de nenhum arquivo externo).
- **`manage.py popular_banco`** — roda ~19 passos (`importar_*`/`calcular_*` de `popular_banco_suporte/` + `precificacao/funcoes_auxiliares/*/calcular_grade_precificacao_*`), e esses SIM dependem de 2 arquivos externos: `Arquivos_API/detalhes_mlbs.json` (constante `CAMINHO_DETALHES_MLBS`) e `Arquivos_API/dados_completos_por_sku.json` (constante `CAMINHO_QUALIDADE`).
- **Em aberto:** não foi encontrado, até agora, nenhum script (migrado ou não) que produza `dados_completos_por_sku.json` — só `detalhes_mlbs.json` tem uma origem conhecida (`buscar_detalhes.py`, ainda não migrado). A origem do 2º arquivo ainda precisa ser localizada.

## Próximo passo, quando retomar

1. Esclarecer se `chamadas_safe_api.chamar_api` e `api_mercado_livre.core.estrutura_api.cliente_api.chamar_api` são a mesma coisa.
2. Migrar `buscar_mlbs.py`/`buscar_detalhes.py` pra dentro do repo, corrigindo os 4 problemas acima.
3. Localizar (ou escrever) o script que gera `dados_completos_por_sku.json`.
4. Só depois disso faz sentido rodar `popular_banco` de ponta a ponta usando dado vindo da API migrada.

## Nota à parte, não relacionada à migração

Nesta mesma sessão, o usuário perguntou (pergunta geral, informativa, sem ação de código) como gerar um dump completo do banco de dados SQL pra transferir de uma máquina pra outra (`mysqldump`/`manage.py dumpdata`) — relevante agora que uma troca de PC está acontecendo de verdade, vale lembrar de usar isso pra não perder o banco local.

## Relacionado

- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
