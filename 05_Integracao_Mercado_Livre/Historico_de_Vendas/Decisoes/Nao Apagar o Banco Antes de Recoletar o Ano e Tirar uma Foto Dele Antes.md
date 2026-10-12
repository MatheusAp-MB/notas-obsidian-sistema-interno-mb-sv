---
tipo: decisao
dominio: 
status: concluida
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate, O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses, Guardar o Total de Chamadas de Cada Clique em Tabela Propria no Banco, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Antes de recoletar o ano da MB, Matheus perguntou se não era melhor apagar as tabelas de vendas e puxar do zero. Decisão (12/10/2026): não apagar. Reler já regrava tudo por upsert, o banco guarda o que o ML não entrega mais e apagar destrói a prova da comparação. Foi criado o script foto_do_banco_de_vendas_ml.py (só leitura) para fotografar o banco antes e comparar depois."
---

# Não Apagar o Banco Antes de Recoletar o Ano e Tirar uma Foto Dele Antes

## Resumo

Antes de rodar o "Último ano" da conta MB com "Reler", Matheus perguntou: **"não deveria apagar tudo que tenho no banco (sobre essas tabelas da tela) e puxar do zero?"** A resposta, aceita por ele em 12/10/2026, foi **não apagar**, e **tirar uma foto do banco antes** para comparar depois. Ele pediu o script da foto; a recoleta e a comparação foram feitas na mesma madrugada.

> [!success] Status: concluída (12/10/2026)
> Foto tirada às 02:07:45, recoleta às 02:10:31 e comparação feita. O resultado está em [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]].

## Contexto

A coleta grava por **upsert**: a chave única do pedido é `order_id` + `posicao`; todo pedido que o ML devolve tem os campos sobrescritos (incluindo `status` e `atualizado_em`). "Reler" lê os 365 dias de novo, mesmo que já estivessem coletados.

## A pergunta

Para validar a coleta corrigida, é melhor **apagar** as tabelas de vendas e coletar o ano do zero, ou **recoletar por cima** do que já existe?

## O que levou à decisão

| Razão | Por que pesa |
|---|---|
| **Reler já faz o papel de começar do zero** | Regrava todo pedido devolvido, sem duplicar (a chave única impede); o custo é o mesmo (~1.870 chamadas) com ou sem apagar. |
| **O banco guarda o que o ML não entrega mais** | O pedido de 11/10/2025 03:45:38 só existe no banco ([[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]). Todo dia que sai da janela de 12 meses passa a existir **só** no banco, e o ritmo de vendas e a previsão de ruptura dependem desse histórico. |
| **Se a carga falhar no meio, apagar custa caro** | A coleta vai do mais novo para o mais antigo; se cair (token, ML fora do ar, computador), os dias antigos ficam com os dados antigos. Com o banco apagado, a tela ficaria com buraco. |
| **Apagar destrói a prova** | Linhas da janela com `atualizado_em` antes do início da recoleta são pedidos que o ML **não devolveu** desta vez; dias que ganham pedidos mostram o que a coleta antiga **perdeu**. Sem o banco antigo não há comparação. A tabela de execuções (`ExecucaoColetaVendasMercadoLivre`) também **não** deve ser apagada: é o registro de chamadas e a base dos scripts de comparação. |

## Decisão

1. **Não apagar** nada para a recoleta.
2. **Tirar uma foto** do banco antes (só leitura, sem chamada à API e sem dado de comprador) e **comparar depois** com o script `scripts_exploracao_ML/foto_do_banco_de_vendas_ml.py`:
   - `MODO = "FOTO"` antes da recoleta; `MODO = "COMPARAR"` depois (a foto usada é a mais recente, ou a do `ARQUIVO_DA_FOTO` quando preenchido);
   - `CONTA = "MB"` (ou `"SV"`); `LINHAS_NA_LISTA` limita as listas impressas;
   - gera `foto_do_banco_de_vendas_ml_<CONTA>_<data>_<hora>.json` e `comparacao_com_a_foto_do_banco_de_vendas_ml_<CONTA>.json`.
3. **Quando apagar faria sentido:** só se houvesse dado errado que o upsert não corrige (dia errado, duplicidade com outra chave, tabela que mudou de significado, lixo de outra conta). Nada disso apareceu. Se sobrarem linhas não tocadas que se decida serem lixo, apagam-se **só essas**.

## Limites

- A foto serve para **comparar**; não substitui backup do banco.
- Valeu para esta recoleta (conta MB). Para a SV, repetir o par foto e comparação.
- Apagar tudo **não deve virar hábito do produto**: o histórico além dos 12 meses do ML só existe no banco.

## Relacionado

- [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]
- [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]
- [[O Orders Search Corta o Comeco do Dia Mais Antigo na Borda de 12 Meses]]
- [[Guardar o Total de Chamadas de Cada Clique em Tabela Propria no Banco]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
