---
tipo: decisao
dominio: 
status: concluida
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API, Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo, Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao), Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]
resumo: Gestão de APIs (14/10) e Arquivos de referência (16/10): a tela mostra só a empresa selecionada, e o botão de atualizar altera só ela. Itens compartilhados aparecem nas duas, mas cada empresa age no seu banco.
---

# Decisão - Telas Mostram e Alteram Só a Empresa Selecionada

**Resumo**: nas telas Gestão de APIs (14/10/2026) e Arquivos de referência (16/10/2026), Matheus decidiu que a **independência entre a Magazine e a Samvale deve ser mantida na tela**: com uma empresa selecionada, a tela mostra **só** os dados dela, e qualquer botão que grava no sistema altera **só** ela, nunca as duas de uma vez. O que é compartilhado entre as duas aparece nas duas, mas cada empresa age sobre o seu próprio banco.

## Contexto

O sistema tem **dois bancos completamente isolados**, um por empresa, e o banco usado em cada requisição é escolhido pela empresa selecionada na sessão (ver [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]). Algumas coisas, porém, são **compartilhadas** entre as duas empresas: o Google Drive, a API do Claude, o Agente de automação, e os arquivos de referência de frete (um só no Drive). Ficou a pergunta de como a **tela** deve tratar o que é compartilhado e o que é de cada uma.

## A decisão

| Data | Tela | O que ficou decidido |
|---|---|---|
| 14/10/2026 | Gestão de APIs | Com a Magazine selecionada, só os cartões da Magazine; com a Samvale, só os da Samvale. As conexões compartilhadas (Drive, Claude, Agente) aparecem nas duas. Vale para os cartões, a faixa de urgência, a lista de problemas e a tabela de eventos. Ver [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]. |
| 16/10/2026 | Arquivos de referência | Mesmo com os arquivos compartilhados, a independência se mantém: a tela mostra só os dados da empresa selecionada, e o botão "Atualizar o sistema com o Drive" altera **somente** ela. Revoga o 1º ciclo do botão, que gravava nas duas. Ver [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]. |

## Como está feito no código

- Cada item de catálogo tem um campo `empresa`: **vazio ou `None` = compartilhado** (aparece nas duas), ou o nome da empresa dona (aparece só nela). É assim na Gestão de APIs (`catalogo_conexoes.py`) e nos Arquivos de referência (`catalogo_arquivos.py`: as 4 tabelas de frete são compartilhadas; cada planilha Busca Legal é de uma empresa).
- Para gravar, o módulo define a empresa pedida como ativa, usa o banco dela (`.using(alias)`) e **devolve a empresa original** no fim. O banco da outra empresa nem é aberto.
- O histórico de "quando o sistema foi atualizado com cada arquivo" (`AtualizacaoDoSistema`) mora **no banco de cada empresa**: uma pode estar em dia e a outra não.
- A **exceção deliberada**: o histórico de testes da Gestão de APIs (`EventoIntegracao`) mora sempre no banco `default`, porque as integrações são uma coisa só do sistema. Mesmo assim, a tela filtra e mostra só os eventos das conexões da empresa selecionada.

## Por que é assim e não de outro jeito

- Mostrar as duas empresas juntas **mistura** a Magazine com a Samvale numa tela que a pessoa lê como se fosse de uma só. A alternativa foi descartada.
- Um botão que grava nas duas ao mesmo tempo tira a escolha de **quando** atualizar cada uma, e um erro numa empresa contaminaria a outra. O 1º ciclo do botão fazia isso, e Matheus revogou.
- Arquivo compartilhado **não** quer dizer banco compartilhado: o arquivo no Drive é um só, mas cada empresa o lê para dentro do seu próprio banco, quando quiser.

## Exemplo

Com a **Magazine** selecionada na tela Arquivos de referência: os 4 cartões de frete aparecem, o cartão "Busca Legal — Samvale" **não** aparece, e "Atualizar o sistema com o Drive" grava só no banco da Magazine. Ao trocar para a **Samvale**, aparecem os 4 cartões de frete e o da Busca Legal da Samvale (o da Magazine some), e o botão passa a gravar só no banco da Samvale.

## O que ainda não sabemos

- Se a mesma regra vale para **todas** as outras telas. Matheus decidiu nestas duas; esta nota **não** a estende às demais.

## Relacionado

- [[Decisao - Gestao de APIs Mostra So a Empresa Ativa e Uma Conexao Por API]]
- [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]
- [[Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]]
