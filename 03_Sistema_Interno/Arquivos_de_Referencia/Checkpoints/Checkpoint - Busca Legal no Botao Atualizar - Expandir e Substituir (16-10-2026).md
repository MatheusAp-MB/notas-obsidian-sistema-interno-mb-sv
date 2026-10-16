---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B), Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026), Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo, Estrutura da Planilha Busca Legal de Impostos de Saida, Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica, Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM, Decisao - Telas Mostram e Alteram So a Empresa Selecionada, Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]
resumo: Busca Legal no botão Atualizar: Expandir (padrão, nunca apaga) e Substituir (sistema igual à planilha, com prévia, caixa de confirmação e trava de MD5). Entregues em 16/10/2026; aguardam teste real.
---

# Checkpoint - Busca Legal no Botão Atualizar: Expandir e Substituir (16/10/2026)

**Resumo**: a planilha Busca Legal (impostos de saída de uma empresa) passou a entrar no botão "Atualizar o sistema com o Drive", com dois modos. **Expandir** (o padrão) só cria e atualiza, nunca apaga. **Substituir** deixa o sistema literalmente igual à planilha, apagando o que ela não tem, e por isso exige uma **prévia** e uma confirmação explícita. Os dois foram entregues em 16/10/2026 e **ainda não foram testados no sistema real**.

## Última atualização

**16/10/2026 18:38** — registro retroativo das duas entregas do dia (Expandir, depois Substituir). Nenhum teste real de Matheus sobre elas até este momento.

> [!warning] Status: em_andamento
> Código entregue e verificado em ambiente de teste de Claude (não é o sistema real). Falta Matheus testar: Magazine primeiro, depois Samvale. Falta também o recálculo automático das grades de preço, que este botão **não** faz.

## Contexto: o que é a Busca Legal e por que entra no botão

A Busca Legal é a planilha de **impostos de saída** de cada empresa: uma linha por produto, com o código de barras (EAN), NCM, CST, PIS, COFINS e a alíquota de ICMS das 27 UFs (ver [[Estrutura da Planilha Busca Legal de Impostos de Saida]]). Dela vêm o CST e os impostos de saída dos produtos. Hoje a planilha cobre 100% dos itens, mas vai **crescer** conforme chegarem produtos novos.

A teoria de Matheus, de 16/10/2026, para atualizar o sistema com ela:

| Situação | O que deve acontecer |
|---|---|
| Banco zerado | Subir a planilha atual cobre 100% e fica certo. |
| Banco já existe, opção **Substituir** | A planilha substitui TUDO: espelho 100% dos valores. |
| Banco já existe, opção **Expandir** | Linha que já existe é atualizada, linha que não existe é criada, e **não apaga nada** por não estar no arquivo. |

A decisão sobre qual modo vale para quê está em [[Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B)]].

## Os 4 passos (os mesmos do terminal)

O botão roda, **em ordem**, os mesmos 4 passos do comando de terminal `Sincronizar_Impostos_de_Saida`, usando as **mesmas classes do projeto** (nenhuma cópia da lógica de ler a planilha ou de gravar). A diferença: no terminal cada passo grava por conta própria; no botão os 4 rodam **numa transação só**. Se qualquer um falhar, nada é gravado. A planilha vem do Drive em memória, nada vai para o disco. Ver também [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]].

| Passo | Nome no código | O que faz |
|---|---|---|
| 1 | `preencher_CST_produtos` | Grava o CST de saída de cada produto, casando pelo EAN da planilha. |
| 2 | `importar_icms_saida_por_ncm_cst_origem` | Agrupa os produtos por **NCM + CST + Origem**. O grupo só entra se **todos** os EANs dele concordam nas 27 UFs; senão é **rejeitado** inteiro (ver [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]). |
| 3 | `importar_pis_cofins_saida_por_ncm_cst` | Igual, agrupando por **NCM + CST**. |
| 4 | `preencher_impostos_saida` | Preenche os 5 campos fiscais de saída de **todos** os produtos do catálogo, a partir das tabelas dos passos 2 e 3, e zera o campo que ficou sem dado validado. |

Como cada tabela de imposto é por **grupo**, e não por produto, um EAN novo entrando num grupo que já existe pode trocar o valor do grupo inteiro e, com isso, o imposto de produtos que nem estão na planilha. Por isso a janela lista os grupos que mudaram de valor. Para a Busca Legal, as colunas "Novas / Mudaram / Iguais / Removidas" do histórico contam **grupos fiscais**, não linhas.

## Modo Expandir (o padrão)

Faz exatamente o que as classes do projeto já faziam: cria o que falta e atualiza o que existe. **Nada é removido** das tabelas de imposto. O motivo: uma planilha menor, por engano, nunca pode apagar o que o sistema já sabe. Não tem prévia nem trava de confirmação, porque não apaga.

## Modo Substituir

Depois da confirmação, o sistema da empresa fica **literalmente igual à planilha**: "se não está na planilha, não está no sistema". Além do que o Expandir faz, o Substituir **apaga**:

| O que é apagado | Exemplo |
|---|---|
| a) O CST de saída (e, por consequência, ICMS, PIS e COFINS de saída) dos produtos cujo EAN **não está** na planilha, ou está nela **sem CST** | Produto com EAN novo, ainda não incluído na planilha. |
| b) Os grupos de ICMS (alíquotas por UF e média) e de PIS/COFINS que a planilha **não tem** | Um grupo NCM+CST que ninguém mais usa. |
| c) Os grupos que a planilha tem, mas que o sistema **rejeitou** (EANs do grupo não concordam) | A planilha não dá um valor válido para eles, então o valor antigo também sai (no Expandir ele ficava). |
| d) As alíquotas de UF que ficaram **vazias** na planilha, dentro de um grupo que continua existindo | Grupo com 26 UFs preenchidas e 1 em branco. |

**O que nunca é apagado**: o **produto em si**. Só os 5 campos fiscais de saída dele. Também fica de fora do "igual à planilha" a **regra do tributo já pago** (PIS/COFINS 0% por CST 02, 04 ou 06 da nota de entrada, decisão de 01/10/2026): ela não vem da planilha, e a janela informa quantos produtos a têm.

### As travas que protegem o Substituir

| Trava | Como funciona |
|---|---|
| **Prévia** | O mesmo código roda numa transação que é **desfeita** no fim: mostra exatamente o que a gravação de verdade fará, sem uma segunda conta que pudesse divergir. Nada é gravado, nem o histórico. |
| **Lista explícita por motivo** | Cada bloco traz o **total exato** e a lista (até 200 linhas por bloco; o "e mais N" é exato). Lista curta (até 10 itens) já vem aberta. |
| **Caixa obrigatória** | O botão vermelho "Substituir e apagar" só libera depois de marcar "Li a lista…". |
| **Trava de arquivo (MD5)** | O servidor só roda o Substituir de verdade se vier junto o MD5 do arquivo cuja prévia a pessoa leu **e** esse MD5 ainda for o do arquivo no Drive agora. Se alguém trocou o arquivo no meio do caminho, nada é gravado e a pessoa lê a prévia do arquivo novo. |
| **Destaque de "apaga muito"** | Se o Substituir tirar o CST de **20% ou mais** dos produtos que tinham CST, a prévia destaca em vermelho (e escreve) "confira se esta é mesmo a planilha completa". O percentual arredonda meio para cima (62,5% vira 63%). |
| **Planilha da empresa errada** | Se nenhum EAN da planilha existe no sistema da empresa, a atualização é recusada ("Nenhum EAN desta planilha existe no sistema desta empresa"). |
| **Backup à mão** | A própria prévia tem o botão "Baixar a planilha do Drive (backup)". |
| **Só a empresa selecionada** | Ver [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]. |
| **"Nada a apagar"** | Quando o sistema já só tinha o que a planilha tem, a janela diz isso em verde, sem alarme. |

## O que o botão ainda NÃO faz

Não recalcula as grades de preço. Quando algum imposto de produto muda, o resultado **avisa**. O recálculo automático só das grades afetadas, só na empresa afetada, é o próximo ciclo (ver [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]).

## Linha do tempo

### 16/10/2026 — Ciclo 1: Expandir

Matheus respondeu "pode" ao plano em micro-ciclos da tabela de impostos: (1) Busca Legal entra no botão só no modo Expandir; (2) modo Substituir depois; (3) e (4) recálculo automático só das grades afetadas. Entregue o ciclo 1 (11 arquivos, sem migração nova: o histórico foi reaproveitado, com os contadores em grupos fiscais).

### 16/10/2026 — Ciclo 2: Substituir

Antes de seguir com o Substituir, Matheus pediu o botão "Baixar" (backup), entregue e validado. Depois escolheu a **opção B** ([[Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B)]]). Entregue o Substituir (12 arquivos, 2 novos: a janela parcial da prévia e o bloco "o que foi apagado"; sem migração): janela de confirmação com a escolha **Expandir** (padrão) ou **Substituir**; o Substituir abre a prévia.

### Verificação feita por Claude (ambiente de teste, não o sistema real)

Com bancos de teste e um Drive falso: 84 de 84 checagens do núcleo do Substituir, 50 de 50 das rotas e telas, 45 de 45 no navegador, e 24 de 24 do "Baixar", em cenários como planilha completa, planilha menor, planilha da empresa errada e Samvale. Isto **não substitui** o teste de Matheus com a planilha real.

## Em aberto

- [ ] Matheus testar o **Expandir** de verdade (Magazine, depois Samvale).
- [ ] Matheus testar o **Substituir**: sugestão de começar abrindo a prévia, ler e **cancelar**; com a planilha completa a prévia pode mostrar "Nada a apagar" ou poucos itens.
- [ ] Recálculo automático das grades afetadas (ciclos 3 e 4).

## Relacionado

- [[Decisao - Busca Legal ao Atualizar - Expandir ou Substituir (Opcao B)]]
- [[Checkpoint - Tela Arquivos de Referencia (14-10 a 16-10-2026)]]
- [[Decisao - Atualizar o Sistema Altera So a Empresa Ativa e o Frete Vira Espelho do Arquivo]]
- [[Estrutura da Planilha Busca Legal de Impostos de Saida]]
- [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]]
- [[Decisao - Import Tratado do Busca Legal para ICMS por NCM Rejeita Qualquer Divergencia entre EANs do Mesmo NCM]]
- [[Decisao - Telas Mostram e Alteram So a Empresa Selecionada]]
- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
