---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive, Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo, Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B), Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026), Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Nao Tem, Decisao - Telas Mostram e Alteram So a Empresa Selecionada, Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026), Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao, Checkpoint - Hub de Configuracoes (16-10-2026), Regra - O Maximo de Acoes Possiveis Sempre em Tela, Dois Computadores de Trabalho - Casa e Escritorio, Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026), Redesenho do Popular Banco - Fontes de Dados e Escopo, Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo]
resumo: Tela Arquivos de referência: 6 arquivos no Drive, auditoria, envio, ver, baixar e atualizar o sistema só da empresa ativa. Frete validado nas duas empresas; Busca Legal (Expandir e Substituir) aguarda teste real; falta o recálculo das grades.
---

# Checkpoint - Tela Arquivos de Referência (14/10 a 16/10/2026)

**Resumo**: a tela "Arquivos de referência" (Configurações → Arquivos de Referência) guarda no Google Drive os 6 arquivos que quase nunca mudam (4 tabelas de frete e 2 planilhas Busca Legal), confere cada um com uma auditoria, e tem um botão "Atualizar o sistema com o Drive" que grava o conteúdo no banco **só da empresa selecionada**. Os passos de conferir, enviar, atualizar o frete, ver e baixar foram testados de verdade por Matheus. A Busca Legal dentro do botão (Expandir e Substituir) foi entregue, mas ainda não foi testada no sistema real.

## Última atualização

**16/10/2026 18:38** — registro retroativo: a tela foi construída entre 14 e 16/10 em vários ciclos, e nada disso estava no vault. A última entrega de código é o modo Substituir da Busca Legal, de 16/10 (ver [[Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026)]]).

> [!warning] Status: em_andamento
> Validado em uso real: auditoria dos 6 arquivos, envio ao Drive, atualização do frete (Magazine e Samvale), "Ver arquivo" e "Baixar". **Entregue e aguardando teste real de Matheus**: Busca Legal no botão (Expandir e Substituir). **Ainda não feito**: o recálculo automático das grades de preço depois que uma tabela muda.

## O que é a tela, para quem nunca viu

Até 14/10/2026 os arquivos de referência eram planilhas `.xlsx` colocadas à mão numa pasta fixa dentro do projeto, e só o comando `popular_banco`, no terminal, as lia (ver [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]] e [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]). Isso obrigava alguém com acesso ao servidor a colocar o arquivo lá e a rodar o comando. A tela tira o desenvolvedor do meio: a pessoa escolhe o arquivo, o sistema confere, envia ao Drive e, com outro clique, atualiza o banco.

### Os 6 arquivos

| Cartão | Grupo | De quem é | Nome fixo no Drive |
|---|---|---|---|
| Frete — Mercado Livre | Tabelas de frete | Compartilhado | `Tabela_Frete_Mercado_Livre.xlsx` |
| Frete — Magalu | Tabelas de frete | Compartilhado | `Tabela_Frete_Magalu.xlsx` |
| Frete — TikTok Shop | Tabelas de frete | Compartilhado | `Tabela_Frete_Tiktok_Shop.xlsx` |
| Frete — Amazon | Tabelas de frete | Compartilhado | `Tabela_Frete_Amazon.xlsx` |
| Busca Legal — Magazine (MB) | Impostos de saída | Só a Magazine | `TABELA SAIDA POR UF MAGAZINE.xlsx` |
| Busca Legal — Samvale (SV) | Impostos de saída | Só a Samvale | `TABELA SAIDA POR UF SAMVALE.xlsx` |

"Compartilhado" quer dizer: o arquivo é um só no Drive para as duas empresas, mas cada empresa atualiza o **seu** sistema com ele, separadamente (ver [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]). A Busca Legal é de cada empresa: a tela de uma empresa nem mostra o cartão da outra.

No Drive, tudo fica em **"Sistema Interno MB SV"** (a pasta raiz, definida no `.env` pela variável `GOOGLE_DRIVE_PASTA_RAIZ_SISTEMA`), na subpasta **"Tabelas de Frete"** ou **"Tabelas de Impostos de Saida"**. Sempre **1 cópia** de cada arquivo (ver [[Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive]]).

### O que cada botão do cartão faz

| Botão | O que faz | Grava alguma coisa? |
|---|---|---|
| Escolher arquivo / auditoria | Confere o arquivo escolhido no computador (formato, colunas, valores) e mostra o relatório de erros e avisos. | Não. O arquivo só existe na memória durante a conferência. |
| Enviar ao Drive | Reconfere no servidor e **troca** o arquivo do Drive. Se já havia um com o mesmo nome, troca o conteúdo; se houver cópias extras, vão para a lixeira do Drive; depois confere tamanho e checksum que o próprio Drive calculou. | Só no Drive. |
| Ver arquivo | Mostra o `.xlsx` numa janela, como o Excel mostraria, com uma visão "Valor bruto" para ver fórmulas. Serve para o arquivo do Drive e para o arquivo recém-escolhido. | Não. |
| Baixar | Baixa no computador uma cópia do que está no Drive agora, com a data e hora do envio no nome, por exemplo `TABELA SAIDA POR UF MAGAZINE (Drive 16-10-2026 10h24).xlsx`. Serve de backup antes de uma mudança. | Não. |
| Atualizar o sistema com o Drive | Lê o arquivo do Drive **só na memória**, reconfere, e grava nas tabelas **da empresa selecionada**, tudo ou nada. | Sim, no banco da empresa. |
| Prévia (só Busca Legal, modo Substituir) | Mostra tudo o que seria apagado, sem gravar nada. | Não. Ver [[Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026)]]. |

### Como o cartão mostra a situação

- **No Drive**: selo verde com nome, tamanho e data do último envio, ou "Sem arquivo no Drive" quando vazio.
- **No sistema** (por empresa): "Em dia" (o sistema foi atualizado com exatamente o arquivo que está no Drive agora, comparando a impressão digital MD5), "Drive tem arquivo mais novo", "Ainda não atualizado", "Histórico indisponível" (falta rodar o `migrate`) ou "Sem comparação com o Drive". Sempre ícone e texto, nunca só cor.
- O histórico mora na tabela `AtualizacaoDoSistema`, uma linha por arquivo, **no banco de cada empresa** (o app não é compartilhado). A linha é gravada dentro da mesma transação da importação: se a importação for desfeita, o histórico não muda.

## Linha do tempo

### 14/10/2026 — As decisões de base

Matheus definiu o fluxo em duas etapas separadas e a regra de uma única cópia no Drive, criou as pastas no Drive e pediu para começar só pela tela de envio e a auditoria. Ver [[Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive]].

### 15/10/2026 — Os 3 primeiros ciclos e o botão de atualizar

- **1º ciclo (tela + auditoria do frete)**: testado no sistema real. Frete ML, Magalu e TikTok válidos; Amazon válida com 1 aviso.
- **2º ciclo (auditoria da Busca Legal)**: confirmado com os arquivos "VERSÃO FINAL (2)" das duas empresas (cartões "Com avisos" e "Pode ser enviado ao Drive").
- **3º ciclo (envio ao Drive)**: testado com o frete do Mercado Livre: o arquivo chegou na pasta "Tabelas de Frete" (21 KB). Ao recarregar a página o cartão ainda dizia "Sem arquivo", então Matheus pediu uma indicação muito mais explícita; foi entregue o selo verde "No Drive". Ele enviou os 6 arquivos (ML às 10:22; os outros às 10:36) e os 6 cartões ficaram verdes. Reenvio do ML às 10:39: a pasta continuou com 1 cópia de cada arquivo. **Envio validado nos 6 arquivos.**
- **Botão "Atualizar o sistema com o Drive" (1º ciclo, só frete)**: ao ver o texto "baixa do Drive", Matheus lembrou que os arquivos de referência **não** são baixados para o servidor (o GCP cuida só do código e do banco). Foi esclarecido que o arquivo é lido do Drive só na memória. Teste real: as 4 tabelas deram "Já estava em dia" nas duas empresas (ML 480, Magalu 27, TikTok 5, Amazon 126 linhas iguais; Amazon com 1 aviso). A Samvale mostrou 224 linhas de frete ML que estavam no sistema e não no arquivo (ver [[Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Nao Tem]]).
- Decisões do dia: o frete passa a **espelhar** o arquivo, as datas aparecem nos cartões, as grades TikTok, Magalu e Amazon não mantêm preço antigo, e as grades afetadas devem ser recalculadas automaticamente (ver [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]). Foram entregues "os 3 primeiros ciclos" (espelho, datas e grades; 16 arquivos, com a tabela nova do histórico por empresa). O recálculo automático ainda não existe.

### 16/10/2026 — Independência, Ver arquivo, Baixar e Busca Legal

- **Independência entre as empresas** (ver [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]): a tela mostra só a empresa selecionada, e o botão atualiza **só** ela. Matheus pediu também o botão **"Ver arquivo"**. Ciclos A e B entregues (19 arquivos, sem migração nova).
- **Testes reais**: "Ver arquivo" do frete ML e "Atualizar" só na Magazine (ML "Já estava em dia", 480 iguais, 0 removidas; ML e Magalu passaram a "Em dia", 16/10 às 10:24). Depois, só na Samvale: ML "Atualizado" (0 novas, 0 mudaram, 480 iguais, **224 removidas**), Magalu 27, TikTok 5 e Amazon 126 iguais. A janela avisou que a grade de precificação ML da Samvale **ainda não foi recalculada**. **Ciclos A e B validados nas duas empresas.**
- **Busca Legal no botão**: plano em micro-ciclos (Expandir; depois Substituir; depois recálculo das grades). Ciclo 1 (Expandir) entregue (11 arquivos, sem migração).
- **"Baixar"**: pedido antes de seguir com o Substituir, como backup. Entregue (6 arquivos, sem migração) e testado na Magazine: 5 arquivos baixados (4 fretes e a Busca Legal da Magazine), com data e hora do Drive no nome. **"Funcionando."**
- **Substituir** (opção B de Matheus): entregue (12 arquivos, 2 novos, sem migração). Ver [[Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B)]] e [[Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026)]].
- No mesmo dia foi entregue o hub de Configurações ([[Checkpoint - Hub de Configuracoes (16-10-2026)]]), de onde esta tela se abre.

## Em aberto

- [ ] Testar de verdade o **Expandir** da Busca Legal (Magazine primeiro, depois Samvale).
- [ ] Testar de verdade o **Substituir**: abrir a prévia e ler antes de confirmar; com a planilha completa a prévia pode mostrar "Nada a apagar" ou poucos itens. Magazine primeiro, depois Samvale.
- [ ] **Recálculo automático das grades** (ciclos 3 e 4 do plano): recalcular só as grades afetadas e só na empresa afetada. Hoje o botão avisa quando uma grade ficou com preço da tabela anterior (caso conhecido: grade ML da Samvale depois das 224 remoções). Decidido em 15/10, ainda não feito.
- [ ] Conferir o hub de Configurações no sistema ([[Checkpoint - Hub de Configuracoes (16-10-2026)]]).
- [ ] O arquivo de produtos do ERP (export de ativos e inativos por empresa) **não** faz parte destes 6 e continua entrando pela pasta, pelo `popular_banco`.
- [ ] Trazer o código desta tela para o PC de casa: ele existe só na pasta do outro computador (ver [[Dois Computadores de Trabalho - Casa e Escritorio]]).
- [ ] Ideias opcionais de Claude, **não pedidas por Matheus**: "Baixar todos" num `.zip`, um CSV com as listas completas do que o Substituir apaga, e uma prévia também para o espelho do frete.

## Relacionado

- [[Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive]]
- [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]
- [[Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B)]]
- [[Checkpoint - Busca Legal no Botao Atualizar - Expandir e Substituir (16-10-2026)]]
- [[Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Nao Tem]]
- [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]
- [[Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026)]]
- [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]
- [[Checkpoint - Hub de Configuracoes (16-10-2026)]]
- [[Regra - O Maximo de Acoes Possiveis Sempre em Tela]]
- [[Dois Computadores de Trabalho - Casa e Escritorio]]
- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo]]
