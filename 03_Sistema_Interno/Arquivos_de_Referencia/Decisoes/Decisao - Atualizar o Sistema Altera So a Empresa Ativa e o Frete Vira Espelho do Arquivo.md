---
tipo: decisao
dominio: 
status: em_andamento
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Nao Tem, Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive, Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B), Decisao - Telas Mostram e Alteram So a Empresa Selecionada, Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo, Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]
resumo: Botão Atualizar: o frete espelha o arquivo (o que ele não tem sai), cartões com datas, só a empresa selecionada é alterada. Falta o recálculo automático das grades afetadas.
---

# Decisão - Atualizar o Sistema Altera Só a Empresa Ativa e o Frete Vira Espelho do Arquivo

**Resumo**: entre 15 e 16/10/2026 Matheus tomou 6 decisões sobre o botão "Atualizar o sistema com o Drive": (1) o frete passa a **espelhar** o arquivo (o que o arquivo não tem sai do sistema); (2) cada cartão mostra a data do envio do arquivo e a data da última atualização do sistema; (3) as grades TikTok, Magalu e Amazon não mantêm preço antigo; (4) as grades afetadas serão recalculadas automaticamente; (5) a tela mostra só a empresa selecionada; (6) o botão altera **somente** a empresa selecionada, nunca as duas.

## Contexto

O 1º ciclo do botão (15/10/2026) só criava e atualizava linhas, "nunca apagava", e gravava **nas duas empresas de uma vez**. No primeiro teste real, a Samvale mostrou 224 linhas de frete ML que estavam no sistema e não estavam no arquivo ([[Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Nao Tem]]). Isso mostrou que um sistema que nunca apaga **acumula sobras**, e que gravar nas duas empresas de uma vez contradiz a independência que Matheus queria.

## As decisões

| # | Data | Decisão | Situação |
|---|---|---|---|
| 1 | 15/10 | A importação das tabelas de frete deve **sempre excluir o que existe e aplicar o que está no arquivo**, para o sistema ficar 100% síncrono com ele (espelho). Revê o "nunca apaga" do 1º ciclo. | Feito |
| 2 | 15/10 | Mostrar, em cada arquivo, a **"Data do envio do arquivo"** e a **"Data da última atualização do sistema com esse arquivo"**, mais um selo de "sistema em dia". | Feito |
| 3 | 15/10 | As grades de precificação **TikTok, Magalu e Amazon** não devem manter o preço antigo. | Entregue junto com o espelho e as datas ("3 primeiros ciclos") |
| 4 | 15/10 | Como importar frete altera diretamente o preço, o sistema precisa **recalcular automaticamente as grades de precificação envolvidas** com o arquivo, para não deixar brecha de desincronização. | **Ainda não existe** (ciclos 3 e 4 do plano de 16/10) |
| 5 | 16/10 | A **independência entre os bancos** se mantém na tela, mesmo com arquivos compartilhados: com a Magazine selecionada, só dados da Magazine; igual para a Samvale (ver [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]). | Feito |
| 6 | 16/10 | O botão altera **somente a empresa atualmente selecionada**, nunca as duas. Revoga a decisão de 15/10 de gravar nas duas. | Feito |

## Como funciona (para quem nunca viu)

**Espelho.** As rotinas que importam o frete (as mesmas do `popular_banco`) só **criam** e **atualizam**. Quem **remove** o que sobrou é o módulo do botão (`atualizacao_do_sistema.py`), logo depois do importador e **dentro da mesma transação**. O `popular_banco` de terminal continua como sempre foi: não remove nada.

**Contagem.** Para dizer "novas / mudaram / iguais / removidas", o sistema tira uma **fotografia** da tabela antes e outra depois e compara. Não usa a conta "Atualizados" do importador, porque ele regrava toda linha que casa com o arquivo, tenha mudado ou não.

**Regras de segurança, nessa ordem:**

1. Arquivo que o Drive não tem, ou que não foi lido por inteiro (checksum), não segue.
2. A auditoria roda **de novo** sobre o que veio do Drive (o arquivo pode ter sido trocado à mão lá). Com erro, nada é gravado.
3. A tabela é gravada **tudo ou nada**: se o importador apontar qualquer erro de linha, ou se a conta final não fechar (o banco precisa ficar com exatamente as linhas do arquivo), a gravação inteira é desfeita.
4. Só o banco da empresa pedida é lido e gravado; o da outra empresa nem é aberto.

**Uma empresa de cada vez.** O importador escolhe o banco pela empresa ativa da requisição. Por isso a gravação define a empresa pedida como ativa e **sempre devolve a original** no fim, para a tela continuar na empresa que a pessoa escolheu. O histórico (`AtualizacaoDoSistema`) mora no banco de cada empresa.

## Por que é assim e não de outro jeito

- **Espelho em vez de "nunca apaga".** A tabela de frete decide preço. Uma linha de sobra no banco que o arquivo não tem é um preço calculado com um dado que ninguém mais mantém. Matheus decidiu isso depois de ver as 224 linhas.
- **Empresa de cada vez.** As duas empresas têm bancos isolados. Atualizar a Magazine nunca deve mexer na Samvale, e cada uma deve poder estar em dia ou não, independentemente.
- **Recalcular automaticamente.** Atualizar a tabela sem recalcular a grade deixa a tela mostrando preço calculado com a tabela anterior. Matheus não quer essa brecha.

## Exemplo

Real, de 16/10/2026. Na **Magazine**, o frete ML deu "Já estava em dia" (480 iguais, 0 removidas). Na **Samvale**, o mesmo arquivo deu "Atualizado": 0 novas, 0 mudaram, 480 iguais e **224 removidas**. Atualizar a Samvale não alterou nada na Magazine. A janela avisou que a grade ML da Samvale **ainda não foi recalculada** (ver [[Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Nao Tem]]).

## Em aberto

- [ ] Recálculo automático das grades afetadas, só na empresa afetada (ciclos 3 e 4).

## Relacionado

- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Descoberta - Samvale Tinha 224 Linhas de Frete ML Que o Arquivo Nao Tem]]
- [[Decisao - Fluxo em Duas Etapas e Uma Unica Copia no Drive]]
- [[Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B)]]
- [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]
- [[Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo]]
- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
