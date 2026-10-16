---
tipo: regra
dominio: design
status: ativa
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026), Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao, Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026), Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Regra - Layout Fixo na Vertical e Fluido na Horizontal, Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]
resumo: Tudo o que o sistema consegue fazer por Matheus vira botão em tela: sem terminal, script ou caçar console externo; o que só o site de outro serviço faz vira botão-atalho. Regra de 14/10/2026.
---

# Regra - O Máximo de Ações Possíveis Sempre em Tela

**Resumo**: tudo o que o sistema consegue fazer por Matheus deve virar **botão** na tela do Sistema Interno V2, sem depender de rodar script ou comando no terminal e sem depender de procurar a página certa em consoles externos. Ao desenhar qualquer rotina, renovação ou correção, **o primeiro pensamento é o botão**. É a regra de 14/10/2026 que sustenta toda a frente "Rotina Vira Botão".

## Contexto

O sistema nasceu com muitas rotinas que só rodam por comando de terminal (ver [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]). Isso torna o sistema **refém de um desenvolvedor por perto**, e Matheus precisa pensar no usuário leigo e no sistema hospedado em nuvem, em produção: "não dá pra ficar refém de comandos". O gatilho da regra, em 14/10/2026, foi a renovação da autorização do Google Drive: em vez de rodar `autorizar_drive_oauth.py` na mão a cada 7 dias, Matheus pediu um **botão** na Gestão de APIs.

## O que diz

- Se o sistema **consegue** fazer algo pela tela, isso vira botão. Terminal, script e console externo não são o caminho do usuário.
- O que o sistema **não** consegue fazer sozinho (porque só dá para fazer no site de outro serviço) vira **botão-atalho** que leva direto à página certa, em vez de o usuário caçar no console. Na Gestão de APIs, por exemplo, os botões "Público", "Branding" e "Permissões" levam às páginas certas do Google Cloud e da conta Google.
- Os comandos de terminal **não são apagados**: viram contingência ou ferramenta de desenvolvimento. O `autorizar_drive_oauth.py`, por exemplo, continua existindo como alternativa ao botão.

## Por que é assim e não de outro jeito

- O sistema vai ser usado por pessoas que **não são desenvolvedoras**, num servidor na nuvem. Qualquer tarefa que exija terminal trava o usuário ou obriga a chamar o desenvolvedor.
- Ações recorrentes (como a renovação de 7 dias do Drive) são justamente as que **não podem** depender de lembrar um comando.
- Manter o terminal como contingência, e não apagá-lo, preserva uma saída quando a tela falha.

## Exemplo

> [!failure] ANTES
> Renovar a autorização do Google Drive: abrir o terminal e rodar `python autorizar_drive_oauth.py`. Atualizar o frete do sistema: colocar o `.xlsx` na pasta do projeto no servidor e rodar o `popular_banco`.

> [!success] DEPOIS
> Renovar a autorização: botão **"Renovar autorização"** no cartão do Google Drive, na Gestão de APIs ([[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]). Atualizar o frete: tela **Arquivos de referência**, com os botões de enviar ao Drive, ver, baixar e atualizar o sistema ([[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]).

## Relacionado

- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
- [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]
- [[Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026)]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Regra - Layout Fixo na Vertical e Fluido na Horizontal]]
- [[Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]]
