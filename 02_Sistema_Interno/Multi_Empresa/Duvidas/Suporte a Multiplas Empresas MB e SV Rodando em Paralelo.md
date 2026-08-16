---
tipo: duvida
dominio: 
status: ativa
criado: 12/08/2026
atualizado_em: 15/08/2026 03:50
relacionado: [Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar), Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Redesenho do Popular Banco - Fontes de Dados e Escopo]
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
- Ponto concreto e imediato, gatilho desta dúvida: `api_sysemp/__init__.py`, método `ApiSysemp._carregar_token_do_env()` — hoje lê `SYSEMP_API_TOKEN` (nome antigo, não existe mais no `.env`), vai levantar `RuntimeError` na próxima chamada real até ser corrigido. A correção pontual desse método depende da resposta desta dúvida maior. **Atualização (12/08, 09:36): recebeu um hardcode temporário pra MB, sem parâmetro `conta` — ver abaixo.**

## Pista real, do lado do Mercado Livre (12/08/2026, 09:36)

Durante a migração da API do ML pro mesmo repo, o mesmo problema apareceu de novo — `.env` já tinha `MB_`/`SV_` para todas as credenciais do ML, sem nenhuma variável compartilhada. Diferente do Sysemp (que só recebeu um hardcode pra MB), o `gerenciador_token.py` do ML foi corrigido de verdade: `obter_token_valido(conta)` exige `conta` explícito ("MB"/"SV"), sem valor padrão, com lock de renovação separado por conta. Validado com chamada real nas 2 contas. Ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]] pro detalhe completo.

Isso não resolve a dúvida maior desta nota (arquitetura do projeto como um todo), mas é um padrão concreto e já testado — parâmetro explícito `conta`, propagado por toda a cadeia de chamada, sem valor padrão — que pode servir de referência quando a decisão maior for retomada, e que deixa mais visível a inconsistência atual: o Sysemp resolveu o mesmo problema de um jeito mais frágil (hardcode) que o ML.

## 3ª ocorrência do mesmo padrão — cadastro de produtos do ERP (15/08/2026)

Durante o redesenho do `popular_banco` (ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]), apareceram 4 arquivos de cadastro de produto do ERP, não 2 — cada relatório (Ativos/Inativos) tem uma versão `MB` e uma versão `SV`. É a terceira vez que essa mesma pergunta (MB e SV rodando em paralelo) aparece num lugar diferente do sistema, depois do Sysemp e do Mercado Livre.

Decisão do usuário pra esse caso específico — não pra questão maior desta nota: **ignorar os arquivos `SV` por enquanto**, só a importação de produtos da MB roda hoje. Os arquivos `SV` foram colocados na mesma pasta de propósito, só pra não se perder, sem intenção de serem lidos agora. A decisão maior de arquitetura (como o sistema vai de fato suportar as 2 empresas rodando em paralelo) continua adiada, exatamente como já registrado acima — este é só mais um lugar concreto onde ela vai precisar ser respondida quando for retomada.

## Relacionado

- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
