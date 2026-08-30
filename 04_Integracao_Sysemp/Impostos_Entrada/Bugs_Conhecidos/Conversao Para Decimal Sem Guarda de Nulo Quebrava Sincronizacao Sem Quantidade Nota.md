---
tipo: bug_conhecido
dominio: fiscal
status: corrigido
criado: 16/08/2026
atualizado_em: 16/08/2026 21:19
relacionado: [Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08), Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Disciplina de Testes Automatizados]
---

# Conversão Para Decimal Sem Guarda de Nulo Quebrava Sincronização Sem Quantidade Nota

## O que aconteceu

Achado durante a escrita dos testes Nível 3 das fórmulas de precificação (cenário "crédito incompleto sem `quantidade_nota`", replicado nas 6 fórmulas de marketplace). `_converter_para_decimal`, em `impostos/funcoes_auxiliares/sincronizacao_impostos_entrada.py`, convertia qualquer valor recebido da API do Sysemp direto pra `Decimal(str(valor))`, sem checar se o valor era `None` antes. Quando uma nota real vem sem `quantidade_nota` preenchida, a conversão vira `Decimal(str(None))` → `Decimal('None')`, que estoura `decimal.InvalidOperation` — não um erro tratado, um crash de verdade na sincronização daquele produto.

## Por que só apareceu agora

Nenhum teste de nível 3 do domínio `precificacao` existia até esta rodada — o efeito só ficava visível rodando a sincronização contra um produto real sem `quantidade_nota` no banco (raro o suficiente pra nunca ter sido pego em produção até aqui). Escrever o cenário "crédito incompleto" pra cada uma das 6 fórmulas de marketplace forçou simular exatamente essa condição de entrada, expondo o crash.

## Correção

`_converter_para_decimal` passou a devolver `None` direto quando o valor de entrada já é `None`, em vez de tentar converter. `quantidade_nota` ausente passa a fluir como `None` até `montar_creditos_fiscais_para_precificacao` (`impostos/funcoes_auxiliares/creditos_fiscais_para_precificacao.py`), que já tinha a guarda correta (`if valor_da_nota is None or not quantidade_nota: return None`) pros 4 créditos — ou seja, a correção só remove o crash prematuro; o comportamento de "sem crédito calculável" já existia e continua o mesmo.

## Validação

Suíte completa revalidada: 605 passed, 6 falhas pré-existentes sem relação, 19 xfailed — nenhuma regressão introduzida pela correção.

## Relacionado

- [[Checklist de Execucao — Migracao da Precificacao para Impostos de Entrada (16-08)]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Disciplina de Testes Automatizados]]
