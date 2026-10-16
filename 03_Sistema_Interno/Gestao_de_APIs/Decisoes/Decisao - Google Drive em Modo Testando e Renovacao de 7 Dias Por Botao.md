---
tipo: decisao
dominio: 
status: ativa
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026), Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API, Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive, Regra - O Maximo de Acoes Possiveis Sempre em Tela, Infraestrutura do Zero - Mudanca de Planos e Dominio]
resumo: App do Google em modo Testando (autorização vence em 7 dias): não publicar agora; renovar por botão na Gestão de APIs, em janela pequena. Testado em 14 e 15/10; vale até 22/10/2026; só o localhost funciona.
---

# Decisão - Google Drive em Modo Testando e Renovação de 7 Dias Por Botão

**Resumo**: o app do Google que dá acesso ao Drive está em modo "Testando", e nesse modo o Google invalida a autorização 7 dias depois. Em 14/10/2026 Matheus decidiu **não publicar o app agora** e renovar a autorização por um **botão na tela Gestão de APIs** (login numa janela pequena), em vez de rodar um script no terminal. Funcionou nos testes de 14 e 15/10; a autorização atual vale até **22/10/2026**.

## Contexto

O sistema usa o Google Drive de duas formas: **ler** pastas (conta de serviço, só leitura) e **escrever** (login da conta dona do Drive, por OAuth). A escrita é o que sustenta o envio de vídeos pelo portal e o envio das planilhas da tela "Arquivos de referência" ([[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]).

Em 14/10/2026 o cartão do Google Drive na Gestão de APIs mostrou `invalid_grant` (o Google dizendo que a autorização não vale mais). O app OAuth (projeto Google Cloud `agenda-videos-mb-sv`) estava em modo **"Testando"**. Segundo o próprio código e a nota do cartão, nesse modo o Google invalida a autorização **7 dias** depois do consentimento.

## A decisão

Foram considerados 3 caminhos:

| Caminho | Resultado |
|---|---|
| **A. Publicar o app em produção** (botão "Publicar app" no Google Cloud) | **Adiado.** O Google exige páginas públicas de página inicial e de política de privacidade, num domínio de Matheus, e o sistema ainda não está hospedado (ver [[Infraestrutura do Zero - Mudanca de Planos e Dominio]]). |
| **B. Ficar em "Testando" e renovar a cada 7 dias rodando `autorizar_drive_oauth.py`** | **Recusado por Matheus**: ele não quer rodar isso na mão (ver [[Regra - O Maximo de Acoes Possiveis Sempre em Tela]]). O script continua existindo só como alternativa. |
| **C. Ficar em "Testando" e renovar por um botão "Renovar autorização" no cartão do Google Drive** | **Escolhido.** |

Decidido em 14/10/2026: o app fica em "Testando"; a renovação de 7 dias é feita pelo botão; só depois que o servidor no GCP estiver funcionando Matheus resolve a publicação em produção.

Matheus ainda pediu que o login do Google abrisse **numa janela pequena**, como a telinha de "escolher conta" do Google, em vez de levar a página inteira. Foi feito; se o navegador bloquear a janela, cai no caminho antigo (página inteira).

## Como o botão funciona (para quem nunca viu)

Funciona em 2 tempos, como todo "Entrar com o Google":

1. O botão "Renovar autorização" leva o navegador (janela pequena) à tela de consentimento do Google. A pessoa entra com a **conta dona do Drive** e clica em Continuar.
2. O Google devolve o navegador ao endereço `/gestao-apis/google/retorno/`, com um código de uso único. O sistema troca o código pelo login novo, **confere o login no Drive** (abrindo a pasta raiz) e **só então** grava o arquivo do login.

Cuidados que estão no código (`autorizacao_google_drive.py`):

- O login antigo só é substituído **depois** que o novo abriu a pasta raiz. Entrar com a conta errada, ou sem permissão na pasta, nunca derruba um login que ainda funcionava.
- Nenhum token, chave ou código passa pelo HTML, pelo histórico ou pelo terminal.
- O pedido leva um `state` e um `code_verifier` (PKCE), guardados na sessão de quem clicou, de uso único, que vencem em 10 minutos. Isso garante que o retorno é de um pedido feito por **esta** sessão.
- A tela guarda o momento de cada autorização feita por ali (histórico, ação `autorizacao`) e mostra quando ela vence. A variável `GOOGLE_DRIVE_OAUTH_VALIDADE_EM_DIAS` do `.env` vale 7 no modo "Testando" e 0 quando o app for publicado (aí o lembrete some).

## O que aconteceu nos testes reais

| Data | O que Matheus fez | Resultado |
|---|---|---|
| 14/10/2026 | Clicou em "Renovar autorização" | Funcionou ("TOP"). |
| 14/10/2026 | Testou a janela pequena com o Google de verdade (`127.0.0.1:8000`, Chrome) | Funcionou. O Google aceitou o endereço de retorno `/gestao-apis/google/retorno/` e o aviso verde apareceu, com validade até 21/10/2026. |
| 15/10/2026 | Renovou pelo `localhost` | Cartão "Funcionando", validade até **22/10/2026**. |
| 15/10/2026 | Tentou pelo IP da rede `10.0.0.193:8000` | **O Google recusa.** Só o `localhost` funciona. |
| 15/10/2026 | Relatou | A autorização liberada no dia anterior **tinha caído de novo**; ele vai acompanhar o comportamento. |

A recusa pelo IP é coerente com o que o código registra: o arquivo do cliente OAuth atual é do tipo **"computador"**, em que o Google só aceita devolver o navegador para um endereço local. O tipo certo para o sistema hospedado é **"web"**, que aceita qualquer endereço HTTPS cadastrado no Google Cloud (o endereço vai em `GOOGLE_DRIVE_OAUTH_REDIRECT_URI`). Essa troca ainda não foi feita.

## Por que é assim e não de outro jeito

- Publicar agora não é possível sem páginas públicas num domínio, e o domínio depende da hospedagem. Esperar o servidor é o caminho de menor risco.
- Rodar script no terminal a cada 7 dias contradiz a regra de que tudo que o sistema consegue fazer por ele vira botão ([[Regra - O Maximo de Acoes Possiveis Sempre em Tela]]), e é justamente o tipo de tarefa que um usuário comum não consegue fazer.
- Manter o login antigo até o novo ser conferido evita o pior caso: renovar errado e ficar sem nenhum login que funcione.

## Em aberto

- [ ] Renovar a autorização antes de **22/10/2026**.
- [ ] Acompanhar se a autorização cai antes dos 7 dias (relato de 15/10).
- [ ] Publicar o app em produção depois que o servidor estiver no ar (exige página inicial e política de privacidade; os botões "Público" e "Branding" do cartão levam às páginas certas do Google Cloud).
- [ ] Trocar o cliente OAuth para o tipo "web" e cadastrar o endereço do servidor; ajustar `GOOGLE_DRIVE_OAUTH_VALIDADE_EM_DIAS` para 0 quando publicado.

## Relacionado

- [[Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026)]]
- [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive]]
- [[Regra - O Maximo de Acoes Possiveis Sempre em Tela]]
- [[Infraestrutura do Zero - Mudanca de Planos e Dominio]]
