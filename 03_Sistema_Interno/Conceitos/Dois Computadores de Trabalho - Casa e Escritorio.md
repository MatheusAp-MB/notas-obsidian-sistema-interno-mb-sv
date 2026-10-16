---
tipo: conceito
dominio: 
status: ativa
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Telas e Monitores dos Usuarios - Resolucoes de Referencia Para Desenhar o Sistema Interno V2, Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Checkpoint - Hub de Configuracoes (16-10-2026), Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026), Infraestrutura do Zero - Mudanca de Planos e Dominio]
resumo: Desde 16/10/2026 o trabalho com Claude é no PC de casa; o do escritório (AnyDesk) só serve para consultar ML e ERP. O código viaja por git; a pasta do V2 de casa ainda não tem o app arquivos_referencia.
---

# Dois Computadores de Trabalho - Casa e Escritório (Conceito)

**Resumo**: Matheus trabalha em dois computadores. A partir de 16/10/2026, o trabalho com Claude acontece no **PC de casa** (o mais potente); o **PC do escritório** fica para consultas, acessado de casa por AnyDesk, porque só de lá se alcança o Mercado Livre e o ERP (Sysemp). O código viaja entre os dois pelo **git**. Esta nota é o retrato desse arranjo em 16/10/2026 e dos seus limites.

## Contexto

Em 16/10/2026, às 18:14, Matheus avisou que estava em casa e que tinha conseguido se conectar por AnyDesk ao PC do escritório, de onde alcança o Mercado Livre e o ERP. Em seguida corrigiu uma suposição: **Claude roda no PC de casa**, e a conexão com o escritório é só para **momentos de consulta** (pegar um dado do ERP, uma informação do Mercado Livre), porque o PC de casa é "muito superior" ao do escritório. Para evitar confusão entre os dois, esta nota fixa quem é quem.

## O que é

| | PC de casa | PC do escritório |
|---|---|---|
| Papel | **Onde se trabalha**: Claude roda e edita arquivos aqui. | **Onde se consulta**: acessado de casa por AnyDesk. |
| Identificação | Nome do computador `desktop-gea5ufo`; pastas em `C:\Users\Mateus\Desktop\PROJETO MB\...` | Pasta do V2 em `C:\Users\WIN10\Desktop\Codigos\GITHUB\Projeto_Sistema_Interno_V2` (caminho de entregas anteriores; **a confirmar com Matheus** que esse é o do escritório) |
| Acesso a Mercado Livre e ERP | **Não** (a sessão de Claude não alcança a API do ML nem o banco dele) | **Sim**, e é daí que se tira o dado quando é preciso |
| Monitor | 2560x1440, escala 150%, 27 pol | 1280x1024 e 1440x900, escala 100% (ver [[Telas e Monitores dos Usuarios - Resolucoes de Referencia Para Desenhar o Sistema Interno V2]]) |
| Branch do V2 | `dev` | não verificada |

### O que Claude consegue e não consegue fazer a partir do PC de casa

Verificado em 16/10/2026:

- Claude lê e escreve nas pastas conectadas: o V2, o Sistema de Devoluções, o vault do Obsidian e as pastas de logs.
- Claude executa comandos num ambiente Linux isolado (Ubuntu 22.04, Python 3.10, Django 5.2, git, node, com as bibliotecas `openpyxl` e `requests`). O V2 usa Django 6, então esse ambiente **não roda o sistema de verdade**.
- Esse ambiente **não alcança** `api.mercadolibre.com` (resposta HTTP 000) **nem** o MySQL e o Python do Windows de Matheus.
- Consequência: **dado do ML ou do ERP** vem de uma consulta de Matheus pelo escritório, e **investigação em banco ou API** continua sendo feita por ele, com scripts de exploração que Claude entrega (ver `scripts_exploracao_ML`). Os testes extensos ele faz no PC dele.

## Como o código viaja entre os dois

Pelo **git**: commit e push de um lado, pull do outro. Só Matheus faz commit e push; Claude nunca roda comandos de escrita do git.

> [!warning] Estado observado em 16/10/2026
> A pasta do V2 do PC de casa está no commit de **15/10/2026 às 03:01** (branch `dev`). Ela tem o app `gestao_apis`, mas **não tem** o app `arquivos_referencia`. Todas as entregas de código das telas de Arquivos de referência, Busca Legal e Configurações foram feitas antes numa pasta do usuário `WIN10`, que **não é** este computador. Para continuar essas telas aqui, é preciso fazer **commit e push no outro computador e pull neste**.

O **vault** segue a mesma lógica: as notas registradas em 16/10/2026 foram escritas na pasta do vault **deste** computador. Para chegarem ao outro, Matheus faz commit e push aqui e pull lá.

## Por que importa

Sem esta nota, é fácil supor que "o computador" é um só: entregar código numa pasta que o outro PC não tem, ou pedir que Claude consulte um dado que só o PC do escritório alcança. Saber quem é quem evita as duas coisas.

## Exemplo

Para saber quais notas de entrada o ERP devolve num dia, Matheus consulta pelo PC do escritório (via AnyDesk) e traz o resultado. Para mudar o código da tela Arquivos de referência, o trabalho acontece no PC de casa **depois** de a pasta do V2 daqui receber o app (pull).

## Relacionado

- [[Telas e Monitores dos Usuarios - Resolucoes de Referencia Para Desenhar o Sistema Interno V2]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Checkpoint - Hub de Configuracoes (16-10-2026)]]
- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
- [[Infraestrutura do Zero - Mudanca de Planos e Dominio]]
