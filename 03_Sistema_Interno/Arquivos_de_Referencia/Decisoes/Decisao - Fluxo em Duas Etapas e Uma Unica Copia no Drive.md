---
tipo: decisao
dominio: 
status: concluida
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo, Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao, Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026), Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026), Redesenho do Popular Banco - Fontes de Dados e Escopo, Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Infraestrutura do Zero - Mudanca de Planos e Dominio, Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]
resumo: Os 6 arquivos de referência ficam no Google Drive, sempre 1 cópia; 2 etapas separadas (conferir e enviar, depois atualizar o sistema); auditoria completa antes do envio; nada é baixado para o servidor.
---

# Decisão - Fluxo em Duas Etapas e Uma Única Cópia no Drive

**Resumo**: em 14/10/2026 Matheus decidiu como os 6 arquivos de referência (4 tabelas de frete e 2 planilhas Busca Legal) entram no sistema: guardados no **Google Drive**, com **uma única cópia** (cada envio substitui o anterior), em **2 etapas separadas** (primeiro conferir e enviar ao Drive; depois, com outro clique, atualizar o sistema), com uma **auditoria completa** antes do envio. Em 15/10/2026 ele reforçou que esses arquivos **não são baixados para o servidor**.

## Contexto

Na auditoria "Rotina Vira Botão" ([[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]], grupo A), os arquivos que alimentam o `popular_banco` eram planilhas colocadas à mão numa pasta do projeto. Seis deles quase nunca mudam: as tabelas de frete do Mercado Livre, Magalu, TikTok Shop e Amazon, e as planilhas Busca Legal da Magazine e da Samvale. Matheus teve a ideia de **guardá-los no Google Drive e lê-los pela API quando necessário**, sem obrigação de baixar. Ficaram em aberto duas dúvidas dele: com o sistema hospedado, o servidor deve baixar e manter o arquivo, baixar-usar-apagar, ou só usar os dados sem baixar? E onde guardar o arquivo, já que a tela para enviá-lo ainda seria criada?

## O que ficou decidido

| Data | Decisão |
|---|---|
| 14/10/2026 | O mesmo pensamento do portal de vídeos ([[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]): uma tela no sistema para o usuário enviar o arquivo ao Drive, **garantindo só 1 cópia** (cada envio substitui o arquivo anterior). Ele reconhece que alguém pode entrar direto no Drive, mas acha que ninguém mexerá por lá e que isso não dá para evitar. |
| 14/10/2026 | O fluxo tem **2 etapas separadas**. (1) O usuário abre a tela, vê os locais de envio, coloca o arquivo, vê uma pré-visualização e clica em ENVIAR, que substitui o arquivo no Drive. (2) A tela mostra que o arquivo está atualizado no Drive mas o sistema ainda não, com um botão para **atualizar o sistema**: importar para o sistema é um clique à parte. |
| 14/10/2026 | A pré-visualização **não é só "ver o arquivo"**: é uma **auditoria completa**, que deve garantir que o arquivo está 100% válido para a leitura e apontar todos os erros. |
| 14/10/2026 | Na auditoria da Busca Legal, **EAN que não existe no sistema é só aviso** e **NCM rejeitado é só aviso**: nenhum dos dois bloqueia o envio. |
| 14/10/2026 | Estrutura no Drive: pasta "Sistema Interno MB SV" (no "Meu Drive" dele) com as subpastas **"Tabelas de Impostos de Saida"** e **"Tabelas de Frete"**. Em 15/10 ele definiu no `.env` a variável `GOOGLE_DRIVE_PASTA_RAIZ_SISTEMA` com o ID da pasta raiz. |
| 14/10/2026 | O primeiro ciclo é só a tela de envio e a de auditoria, sem Drive e sem alterar nada de verdade no sistema. |
| 15/10/2026 | Os arquivos de referência **não são baixados para o servidor**: o GCP cuida só do código e do banco, e os arquivos ficam no Drive. O botão "Atualizar o sistema com o Drive" lê o arquivo **só na memória**, nada em disco. Matheus levantou isso ao ver o botão descrito como "baixa do Drive". |

## Por que é assim e não de outro jeito

- **Uma só cópia** evita a dúvida "qual é a versão certa?". Cada envio substitui o anterior; se alguém subiu cópias à mão, o sistema mantém a mais recente e manda as outras para a **lixeira** do Drive (recuperável).
- **Duas etapas** separam o ato de guardar do ato de mudar o sistema. Enviar o arquivo ao Drive não altera o banco; só o segundo clique faz isso. Isso permite conferir e, se preciso, trocar o arquivo antes de mexer em preço.
- **Auditoria completa antes de enviar** existe para o erro nunca estourar no meio de uma importação, como acontecia no terminal.
- **Não baixar para o servidor**: a hospedagem decidida é uma VM com banco local, e Matheus quer que o servidor guarde só código e banco (ver [[Infraestrutura do Zero - Mudanca de Planos e Dominio]]). Uma cópia em disco no servidor seria uma segunda fonte de verdade.

## Exemplo

Real, de 15/10/2026: Matheus enviou a tabela de frete do Mercado Livre pela tela às 10:22 e o cartão mostrou "Enviado ao Drive" (21 KB, pasta "Tabelas de Frete"). Depois clicou em "Atualizar o sistema com o Drive": o sistema leu o arquivo do Drive na memória, conferiu de novo e informou "Já estava em dia" (480 linhas iguais). Reenviou o mesmo arquivo às 10:39 e a pasta continuou com **uma** cópia.

## Relacionado

- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]
- [[Decisao - Google Drive em Modo Testando e Renovacao de 7 Dias Por Botao]]
- [[Checkpoint - Tela Gestao de APIs (14-10 a 16-10-2026)]]
- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]
- [[Infraestrutura do Zero - Mudanca de Planos e Dominio]]
