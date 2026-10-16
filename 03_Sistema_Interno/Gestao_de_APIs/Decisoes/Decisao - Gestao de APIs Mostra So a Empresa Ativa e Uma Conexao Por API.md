---
tipo: decisao
dominio: design
status: concluida
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026), Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao, Decisao - Telas Mostram e Alteram So a Empresa Selecionada, Regra - Layout Fixo na Vertical e Fluido na Horizontal, Regra - O Maximo de Acoes Possiveis Sempre em Tela, Pausa da Investigacao da API do TikTok Shop - Loja Magazine Sem Account Manager]
resumo: Gestão de APIs: um cartão por API (Drive unificado), só a empresa ativa mais as compartilhadas, TikTok removido, resposta real da API em Ver detalhes (sem segredos) e sem travar por usuário por ora.
---

# Decisão - Gestão de APIs Mostra Só a Empresa Ativa e Uma Conexão Por API

**Resumo**: em 14/10/2026 Matheus decidiu 5 pontos do desenho da tela Gestão de APIs: (1) a verificação é sobre a **API inteira**, então o Google Drive é um cartão só; (2) a tela mostra **só a empresa ativa**, mais as conexões compartilhadas; (3) o cartão do TikTok foi removido; (4) a tela mostra a **resposta real** da API em "Ver detalhes"; (5) **sem travar por usuário** por enquanto.

## Contexto

A tela nasceu em 14/10/2026 (ver [[Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026)]]). Na primeira versão havia **dois cartões do Google Drive** (um para a leitura das pastas, outro para o envio de arquivos e vídeos), um cartão do TikTok e todas as conexões das duas empresas ao mesmo tempo. Ao usar a tela, Matheus foi ajustando o desenho. Esta nota junta as escolhas que ele fez, e o motivo de cada uma.

## A decisão, ponto a ponto

| # | O que ficou decidido | Como está no código |
|---|---|---|
| 1 | **A verificação é sobre a API como um todo, não sobre um ponto dela.** Os 2 cartões do Google Drive viram **um** cartão "Google Drive", com um único "Testar" que roda as 2 verificações. O estado do cartão é o das partes juntas; o resultado de cada parte aparece em "Ver detalhes" e no histórico. | `catalogo_conexoes.py`: a conexão `google_drive` tem `partes` (`google_drive_leitura` e `google_drive_envio`). |
| 2 | **A tela mostra só a empresa ativa.** Com a Magazine selecionada, aparecem só os cartões da Magazine; com a Samvale, só os da Samvale. As conexões **compartilhadas** (Google Drive, API do Claude, Agente) aparecem nas duas. | Cada conexão tem o campo `empresa` (vazio = compartilhada). A regra vale para os cartões, a faixa de urgência, a lista de problemas e a tabela de eventos. |
| 3 | **O cartão do TikTok foi removido.** Hoje não há API do TikTok disponível para eles (ver [[Pausa da Investigacao da API do TikTok Shop - Loja Magazine Sem Account Manager]]). | Sem linha do TikTok no catálogo. |
| 4 | **Mostrar a resposta real da API** em "Ver detalhes" (o que o Mercado Livre, o Claude, o Sysemp e o Google de fato devolveram). Por isso o teste do Mercado Livre deixou de usar `GET /users/me`, que devolve dados pessoais da conta, e passou a usar a busca de anúncios (`/users/{USER_ID}/items/search?limit=1`), que é o endpoint que o sistema já usa de verdade. | Migration `0002_eventointegracao_resposta`; `protecao_de_segredos.py` tira tokens e corta o texto. |
| 5 | **Não travar a tela por usuário ou permissão** por ora: nada de regra de administrador. Usuários e permissões ficam para outro dia, numa frente própria. | Sem checagem de perfil na tela. |

Dois detalhes que acompanham a decisão 4:

- O teste do **Sysemp** é a consulta de notas de entrada de **1 dia** (só para testar). Foi ideia de Matheus usar essa consulta.
- O teste do **Agente** é um "ping" em duas pontas: o navegador de quem clicou chama o agente, e o agente chama o sistema com a chave dele. Também foi ideia de Matheus: abrir o agente e ver se ele responde.

E um complemento de layout, registrado no próprio código em 14/10: a ordem e a quantidade de cartões **não mudam** conforme o estado (ver [[Regra - Layout Fixo na Vertical e Fluido na Horizontal]]).

## Por que é assim e não de outro jeito

- **Um cartão por API, não por caminho interno.** Quem usa a tela pensa "o Google Drive", não "conta de serviço" e "login OAuth". Dois cartões para a mesma API faziam parecer que eram duas coisas independentes. A alternativa de manter um cartão por caminho foi descartada.
- **Só a empresa ativa.** Matheus quer a independência entre as duas empresas mantida também na tela (ver [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]). Mostrar tudo junto misturava a Magazine com a Samvale.
- **Resposta real e não só um texto nosso.** Matheus quis ver o que o serviço de fora realmente respondeu. A contrapartida é a proteção de segredos: tokens e chaves viram `***` antes de aparecer.
- **Sem permissão por enquanto.** Controle de usuários é um assunto grande (ver o item "Controle de Usuários" em [[Checkpoint - Hub de Configuracoes (16-10-2026)]]), e travar a tela agora seria resolver uma coisa pela metade.

## Exemplo

Com a **Magazine** selecionada, a tela mostra 5 cartões: Google Drive, API do Claude, Agente de automação (compartilhados) e Mercado Livre MB e Sysemp MB. Ao trocar para a **Samvale**, também são 5: os mesmos 3 compartilhados mais Mercado Livre SV e Sysemp SV. O Mercado Livre MB não aparece na Samvale, e vice-versa.

## Relacionado

- [[Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026)]]
- [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]
- [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]
- [[Regra - Layout Fixo na Vertical e Fluido na Horizontal]]
- [[Regra - O Maximo de Acoes Possiveis Sempre em Tela]]
- [[Pausa da Investigacao da API do TikTok Shop - Loja Magazine Sem Account Manager]]
