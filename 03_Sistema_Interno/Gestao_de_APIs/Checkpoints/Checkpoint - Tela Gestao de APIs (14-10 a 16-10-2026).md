---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API, Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao, Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026), Regra - O Maximo de Acoes Possiveis Sempre em Tela, Decisao - Telas Mostram e Alteram So a Empresa Selecionada, Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Pausa da Investigacao da API do TikTok Shop - Loja Magazine Sem Account Manager, Infraestrutura do Zero - Mudanca de Planos e Dominio, Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]
resumo: Estado da tela Gestão de APIs: 7 conexões com teste de 1 chamada, histórico no banco compartilhado, Google Drive renovável por botão (válido até 22/10/2026). Faltam testar Mercado Livre e Sysemp da Samvale e o Testar todas.
---

# Checkpoint - Tela Gestão de APIs (14/10 a 16/10/2026)

**Resumo**: a tela "Gestão de APIs" (menu Configurações → Gestão de APIs, endereço `/gestao-apis/`) mostra, em cartões, se cada conexão do sistema com um serviço de fora (Google Drive, API do Claude, Mercado Livre, Sysemp, Agente de automação) está funcionando, e deixa o próprio usuário testar e consertar parte delas sem terminal. Foi criada e testada de verdade em 14/10/2026; a renovação do Google Drive por botão foi validada em 14 e 15/10.

## Última atualização

**16/10/2026 18:38** — registro retroativo: tudo o que foi feito nesta tela entre 14 e 16/10 estava só na conversa e na memória de Claude, nada no vault. As últimas entregas de código desta frente são de 14/10; em 15/10 Matheus só usou o botão de renovar e relatou o resultado.

> [!warning] Status: em_andamento
> A tela existe e funciona nos cartões já testados. Faltam testar o Mercado Livre e o Sysemp da Samvale e o botão "Testar todas", e há ciclos planejados ainda não feitos (ver "Em aberto"). A autorização do Google Drive vence em **22/10/2026** enquanto o app do Google estiver em modo "Testando".

## O que é a tela, em linguagem simples

O sistema conversa com vários serviços de fora. Cada uma dessas conversas é uma **conexão**. Conexão pode quebrar sem aviso (a chave venceu, a senha mudou, o acesso foi revogado), e, antes desta tela, a única forma de descobrir isso era uma tela do sistema falhar e alguém investigar no terminal. A Gestão de APIs resolve isso com 3 coisas:

1. **Um cartão por conexão**, com um estado claro (ícone e texto, nunca só cor).
2. **Um botão "Testar"** em cada cartão, que faz **uma** chamada pequena ao serviço de fora e mostra o resultado.
3. **Ações e atalhos** no próprio cartão: o que dá para consertar pelo sistema vira botão; o que só dá para consertar no site do serviço vira um botão-atalho que abre a página certa.

| Termo | O que significa |
|---|---|
| **API** | O "balcão de atendimento" que um serviço de fora (Mercado Livre, Google, Sysemp, Anthropic) oferece para outros programas conversarem com ele. |
| **Token / chave** | A "senha" que o sistema apresenta nesse balcão. Se vence ou é revogada, o balcão recusa. |
| **OAuth** | O jeito de uma pessoa autorizar o sistema a agir em nome dela (a telinha "Entrar com o Google"). |
| **`invalid_grant`** | O erro do Google que quer dizer "essa autorização não vale mais". Foi o que apareceu em 14/10/2026 no Google Drive. |

## As 7 conexões que a tela conhece

Lista fixa do código (`gestao_apis/funcoes_auxiliares/catalogo_conexoes.py`). Uma conexão nova entra como uma linha nova ali.

| Conexão | De quem é | O que o botão Testar faz (1 chamada por clique) |
|---|---|---|
| Google Drive | Compartilhada (aparece nas duas empresas) | Roda **duas** verificações: leitura das pastas (conta de serviço) e envio/vídeos (login da conta dona do Drive). Um cartão só, ver [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]. |
| API do Claude | Compartilhada | Conta tokens (`messages.count_tokens`), chamada gratuita que só aceita uma chave válida. Não prova que ainda há saldo para gerar texto, e o cartão avisa isso. |
| Mercado Livre, Magazine (MB) | Magazine | Pega o token válido pelo mesmo caminho que o sistema todo usa e faz `GET /users/{USER_ID}/items/search?limit=1` (1 anúncio). |
| Mercado Livre, Samvale (SV) | Samvale | Igual, com a conta da Samvale. |
| Sysemp, Magazine (MB) | Magazine | Consulta as notas de entrada (`listarManifestoNotaEntrada`) de **1 dia** (de ontem até hoje), só a 1ª página. É o mesmo método dos impostos de entrada. |
| Sysemp, Samvale (SV) | Samvale | Igual. Cada empresa tem a sua instância numerada da API (MB = `/61`, SV = `/84`), ver [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]]. |
| Agente de automação | Compartilhada | O **navegador** de quem clicou chama o agente em `127.0.0.1:5678/ping`, e o agente chama o sistema com a chave dele. Prova as duas pontas. |

Os 5 estados possíveis de um cartão (arquivo `estados.py`): **Funcionando**, **Atenção**, **Com problema**, **Não verificada** e **Não configurada**.

> [!important] Regra dos estados
> "Funcionando" só aparece quando uma resposta **válida** do serviço de fora confirmou. Ler a configuração ou o relógio do token nunca vira "Funcionando", no máximo "Não verificada". Um teste que deu certo vale como "Funcionando" por 6 horas (a duração do token do Mercado Livre); depois volta a "Não verificada".

## Segurança do que aparece na tela

- Em "Ver detalhes" aparece a **resposta real** do serviço (decisão de 14/10, ver [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]). Antes de ir para a tela ou para o histórico, ela passa por `protecao_de_segredos.py`: campos com nome de segredo (token, secret, senha...) viram `***`, qualquer segredo conhecido do `.env` que apareça no texto vira `***`, e a resposta é cortada em ~4000 caracteres.
- Os textos "O que aconteceu" e "Próximo passo" são escritos pelo sistema, nunca copiados do serviço de fora.
- Os links dos botões-atalho vêm de uma **lista fechada** montada no servidor. Nada digitado ou vindo da API vira link.

## Como o histórico é guardado

Tabela `EventoIntegracao` (app `gestao_apis`): cada teste e cada renovação de autorização grava uma linha (conexão, ação, estado, motivo, impacto, como resolver, resposta real, quem clicou, quando). O app é **compartilhado** entre as duas empresas, então a tabela mora sempre no banco `default` (decisão registrada no `models.py`). Existem duas migrations: `0001_initial` e `0002_eventointegracao_resposta` (a coluna da resposta real).

## Último estado conhecido de cada cartão

| Conexão | Estado conhecido | Quando e fonte |
|---|---|---|
| Mercado Livre MB | Funcionando | 14/10/2026, teste real de Matheus |
| Sysemp MB | Funcionando | 14/10/2026, teste real de Matheus |
| API do Claude | Funcionando | 14/10/2026. O 1º teste acusou a biblioteca `anthropic` não instalada no ambiente; ele instalou e passou |
| Agente de automação | Funcionando | 14/10/2026, teste real de Matheus |
| Google Drive | Funcionando, com autorização válida até 22/10/2026 | `invalid_grant` em 14/10; renovado pelo botão em 14/10 e de novo em 15/10 (ver [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]) |
| Mercado Livre SV | **Sem registro de teste** | Pendente desde 14/10 |
| Sysemp SV | **Sem registro de teste** | Pendente desde 14/10 |

## Linha do tempo

### 14/10/2026 — A tela nasce direto no sistema

- Matheus perguntou se dava para ter uma tela "Gestão de APIs" para controlar as conexões e reativar permissões sem script nem terminal, depois do erro `invalid_grant` do Google Drive (o app do Google estava em modo "Testando").
- Pediu botões-atalho que levem direto ao lugar certo (ex.: a página certa do Google Cloud), no mesmo estilo dos botões do Mercado Livre já existentes, em vez de procurar no console.
- Decidiu: **"chega de mockups soltos"**. A tela foi gerada direto no sistema (app `gestao_apis`, menu Configurações → Gestão de APIs), para testar de verdade e achar erros. Ele rodou `makemigrations gestao_apis` e `migrate --database=magazine` e testou.
- Decisões do dia sobre o desenho: ver [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]. Decisão sobre o Google Drive: ver [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]].
- Ele criou no Claude Console a chave de API "sistema-interno-mb-sv" (workspace Default, 30 dias de validade, vence em **13/11/2026**) e pediu o cartão da API do Claude.
- Teste real: Mercado Livre MB, Sysemp MB, API do Claude e Agente deram "Funcionando". O único problema que sobrou foi o Google Drive.

### 14/10/2026 — Renovar a autorização do Drive por botão

Matheus não quis rodar `autorizar_drive_oauth.py` na mão e pediu um botão. Foi entregue o botão "Renovar autorização" no cartão do Google Drive, que ele testou ("TOP"). Depois pediu que o login do Google abrisse numa janela pequena, como a telinha de "escolher conta" do Google. Entregue e testado com o Google de verdade, em `127.0.0.1:8000` no Chrome: o Google aceitou o endereço de retorno e o aviso verde apareceu com validade até 21/10/2026. Detalhes em [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]].

### 15/10/2026 — Renovação pelo localhost

Matheus renovou de novo pelo botão (pelo `localhost`; pelo IP `10.0.0.193:8000` o Google recusa). O cartão ficou "Funcionando", com validade até **22/10/2026**. Ele relatou que a autorização liberada no dia anterior tinha caído de novo e disse que vai acompanhar o comportamento.

## Em aberto

- [ ] Renovar a autorização do Drive antes de **22/10/2026**, ou publicar o app do Google em produção (só depois que o servidor no GCP estiver funcionando, ver [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]).
- [ ] Testar de verdade o **Mercado Livre da Samvale** (trocando a empresa selecionada para Samvale), o **Sysemp da Samvale** e o botão **"Testar todas"**.
- [ ] A chave "sistema-interno-mb-sv" do Claude vence em **13/11/2026**: criar outra antes.
- [ ] Próximos ciclos planejados em 14/10: registrar falhas **reais** nos pontos de entrada das integrações (hoje o histórico só guarda testes e renovações), reautorização do Mercado Livre pela tela (depois do domínio HTTPS), formulário de novo Client Secret.
- [ ] O redirecionamento do OAuth do Mercado Livre usa hoje o `webhook.site` (`REDIRECT_URI`); Matheus vai trocar pelo endereço do servidor quando o sistema estiver hospedado (ver [[Infraestrutura do Zero - Mudanca de Planos e Dominio]]).
- [ ] Permissões por usuário na tela (decidido em 14/10 deixar para uma frente própria, ver [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]).

## Relacionado

- [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]
- [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]
- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
- [[Regra - O Maximo de Acoes Possiveis Sempre em Tela]]
- [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Pausa da Investigacao da API do TikTok Shop - Loja Magazine Sem Account Manager]]
- [[Infraestrutura do Zero - Mudanca de Planos e Dominio]]
- [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]]
