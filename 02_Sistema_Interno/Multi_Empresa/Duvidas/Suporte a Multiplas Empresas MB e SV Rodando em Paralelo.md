---
tipo: duvida
dominio: 
status: ativa
criado: 12/08/2026
atualizado_em: 12/08/2026 07:57
relacionado: [Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
---

# Suporte a Múltiplas Empresas (MB e SV) Rodando em Paralelo

## Contexto — como isso surgiu

Ao renomear o token do Sysemp no `.env` de 1 variável única (`SYSEMP_API_TOKEN`) pra 2 (`MB_SYSEMP_API_TOKEN`/`SV_SYSEMP_API_TOKEN`), ficou claro que `ApiSysemp` (que hoje só sabe carregar 1 token fixo do `.env`) vai quebrar até decidir como escolher entre os 2. Isso expôs uma pergunta bem maior que o cliente Sysemp: **o projeto como um todo (Sistema Interno) vai precisar suportar 2 empresas — MB e SV — rodando em paralelo.**

## A questão real

Cenários que o sistema precisa suportar, segundo o usuário:

- 1 usuário trabalhando só na empresa MB.
- Outro usuário trabalhando só na empresa SV, ao mesmo tempo.
- O MESMO usuário com os 2 sistemas abertos simultaneamente (ex: 2 abas do navegador).

Isso não é só "qual token carregar" — toca autenticação de usuário, banco de dados, e provavelmente todo modelo de dado que hoje assume implicitamente 1 empresa só (`Produto`, impostos de entrada, integração com Mercado Livre, etc.).

## Decisão explícita do usuário: não resolver agora

O usuário decidiu, de propósito, não pensar nisso nesta sessão — "é bem complexo", precisa de um dia com tempo disponível pra pensar com calma (mesmo espírito do [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]: idealizar antes de planejar, nunca sob pressão de outra frente em andamento). Esta nota existe só pra não perder o fio até esse momento chegar.

## Em aberto — nada decidido ainda

- Se vai ser 1 deployment por empresa (cada ambiente/`.env` sempre sabendo de antemão qual empresa é, sem escolha em tempo de execução) ou 1 sistema só que precisa escolher entre os 2 em tempo real.
- Se a escolha, quando existir, é por sessão de usuário, por request, por comando de management, ou outra granularidade.
- Quais partes do sistema, além de `api_sysemp`, precisam saber "de qual empresa é isso" — banco de dados, `Produto`, autenticação/permissão de usuário, a integração nova do Mercado Livre que está sendo trazida pro mesmo ambiente de trabalho agora.
- Ponto concreto e imediato, gatilho desta dúvida: `api_sysemp/__init__.py`, método `ApiSysemp._carregar_token_do_env()` — hoje lê `SYSEMP_API_TOKEN` (nome antigo, não existe mais no `.env`), vai levantar `RuntimeError` na próxima chamada real até ser corrigido. A correção pontual desse método depende da resposta desta dúvida maior.

## Relacionado

- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
