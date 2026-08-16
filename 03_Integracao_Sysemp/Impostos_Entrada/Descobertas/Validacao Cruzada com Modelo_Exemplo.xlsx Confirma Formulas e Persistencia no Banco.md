---
tipo: descoberta
dominio: fiscal
status: confirmada
criado: 16/08/2026
atualizado_em: 16/08/2026 04:05
relacionado: [Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Tela e Planilha de Resumo de Impostos de Entrada]
---

# Validação Cruzada com `Modelo_Exemplo.xlsx` Confirma Fórmulas e Persistência no Banco

## Contexto

Usuário pediu, à parte da tela/planilha (ver [[Tela e Planilha de Resumo de Impostos de Entrada]]), uma verificação de fundo: "preciso garantir que todos os dados sejam coerentes... e que estejam preenchidos no banco da forma correta." Trouxe `Modelo_Exemplo.xlsx` — 1 nota fiscal real (NF 237995, fornecedor SEMAR IMPORT ATACADISTA), 3 produtos (EAN 7898632332155, 7898632332162, 7898632330458), com a fórmula de cada coluna calculada explicada em texto na própria planilha.

## Etapa 1 — fórmulas extraídas e conferidas com os números reais do arquivo

Refeitas as contas com os 3 produtos antes de confiar no texto da célula (que às vezes descreve a fórmula de forma imprecisa):

- **Base Cálculo ICMS = Custo Total × (1 − Redução ICMS% ÷ 100)** — não é subtração direta, é multiplicativo (a célula diz "Custo Total − Redução", mas a conta só bate como multiplicação). Confirmado nos 3 produtos.
- **Valor ICMS = Base Cálculo ICMS × Alíquota ICMS**.
- **Base Cálculo PIS = Base Cálculo COFINS = Custo Total − Valor ICMS**.
- **Valor PIS = Base × Alíquota PIS**; **Valor COFINS = Base × Alíquota COFINS**.
- **Base Cálculo IPI ≈ Custo Total** (sem redução); **Valor IPI = Base × Alíquota IPI**.
- Colunas "A calcular unitário" da planilha = `Valor ÷ Qtde` — mesma lógica de "por unidade" já usada em `obter_detalhes_para_exibicao()`.

## Etapa 2 — comparação com o código real

Lendo `integracao_sysemp/servicos/dados_xml_nf.py`: Base/Valor de ICMS, ICMS ST e IPI vêm prontos da API (só parse, sem recálculo). O único campo derivado pelo código é a **Redução de PIS/COFINS** (a API não entrega isso direto) — fórmula usada: `1 − (Base ÷ Custo Total)`, que é matematicamente idêntica a `Valor ICMS ÷ Custo Total` — ou seja, bate exatamente com a relação confirmada na etapa 1 (Base PIS/COFINS = Custo Total − Valor ICMS). Nenhuma divergência de fórmula encontrada — já documentada em [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]].

## Etapa 3 — comparação direta com o banco real (os 3 produtos do arquivo)

Sem acesso próprio ao banco, foi entregue ao usuário um script standalone (mesmo padrão de `_adicionar_raiz_do_projeto_ao_path()` + `django.setup()` já usado em `scripts_exploracao_ERP/`, rodado com `python verificar_impostos.py` — **não** via `manage.py shell`, que no ambiente do usuário processa entrada redirecionada linha a linha e quebra em blocos `for`/multi-linha). O usuário rodou e colou o resultado real.

**Resultado: os 3 produtos batem 100%, campo a campo, com os valores do `Modelo_Exemplo.xlsx`** — Custo Total, Quantidade, e para cada imposto (ICMS, ICMS ST, ICMS Retido, IPI, PIS, COFINS): Base de Cálculo, Alíquota, Redução e Valor, todos idênticos entre banco e planilha de referência, nos 3 EANs (7898632332155, 7898632332162, 7898632330458).

## Conclusão

Fórmula correta e banco preenchido corretamente, confirmado com dado real (não suposição) — fecha, por ora, a dúvida de coerência de dado fiscal de entrada. Usuário confirmou: "ok isso está resolvido."

## Fechamento (16/08/2026, 04:05) — reprocessamento rodado

Antes de fechar de vez, identificado 1 gap real: os 3 produtos testados acima só confirmam os 6 impostos (Base/Alíquota/Redução/Valor) — não confirmam se CST/NCM/CFOP/Origem/Natureza/TES/ID Produto Sysemp/Código Auxiliar (corrigidos/adicionados em 14-15/08) já tinham sido preenchidos em produtos sincronizados ANTES dessas mudanças. Usuário rodou `manage.py reprocessar_impostos_entrada_de_json`: **3691 selecionados, 827 sincronizados, 0 erro** (2864 sem `Produto` correspondente — item separado, já documentado, não é regressão). Com isso, o backfill do CST corrigido e dos 8 campos novos está aplicado em toda a base que tem correspondência. **Domínio "Impostos de Entrada + Tela/Planilha de Resumo" considerado fechado, aguardando validação do superior.**

## Relacionado

- [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Tela e Planilha de Resumo de Impostos de Entrada]]
