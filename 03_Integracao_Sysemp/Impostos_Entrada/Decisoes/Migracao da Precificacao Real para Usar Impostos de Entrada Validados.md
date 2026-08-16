---
tipo: decisao
dominio: python
status: em_andamento
criado: 16/08/2026
atualizado_em: 16/08/2026 05:23
relacionado: [Plano em Etapas do Duble de Precificacao ML, Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Integridade e Fonte Unica de Dado, Redesenho do Popular Banco - Fontes de Dados e Escopo]
---

# Migração da Precificação Real para Usar Impostos de Entrada Validados

## Contexto

Depois de revalidar o dublê (ver [[Plano em Etapas do Duble de Precificacao ML]]), usuário pediu pra ir além: preparar o sistema REAL de precificação (`FormulaPrecificacao`, `calcular_grade_precificacao_ml.py`) pra usar os mesmos valores já validados do dublê. Princípio explícito do usuário, que guia toda a migração: **"o precificador apenas usa o que já foi validado, ele não tem papel ou responsabilidade de calcular imposto de entrada"** — nenhuma fórmula de base/redução/alíquota deve ser duplicada dentro da precificação; ela só consome o `valor` já pronto que o domínio `impostos` já calculou e validou.

## Mapeamento campo a campo (lido direto em `formula_precificacao.py` e `calcular_grade_precificacao_ml.py`)

| Campo hoje (fórmula real) | Fonte hoje | Vira | Observação |
|---|---|---|---|
| `produto.custo` / `custo_com_boni` | ERP cadastro + planilha (desativada) | `impostos_entrada.custo_unitario` | Troca de fonte só |
| `produto.ipi` (%) → recalcula valor | `produto.ipi` | `impostos_entrada.ipi.valor ÷ quantidade_nota` | Já vem pronto, só divide por unidade |
| `produto.icms_entrada` (%) → recalcula valor **sem redução (bug real, confirmado)** | `produto.icms_entrada` | `impostos_entrada.icms.valor ÷ quantidade_nota` | Valor da API já sai com a redução aplicada — hoje o sistema real ignora isso e recalcula errado |
| `produto.pis_cofins` (%) — 1 campo usado com 2 significados diferentes (crédito de entrada E alíquota de saída) | `produto.pis_cofins` | `impostos_entrada.pis.valor ÷ quantidade_nota` **e** `impostos_entrada.cofins.valor ÷ quantidade_nota` (2 créditos separados, decisão fechada com o superior) | Precisa desacoplar do campo de saída, que é conceito diferente |
| `produto.st_valor` (somado dentro do custo final) | Planilha (valor fixo, desativada) | Crédito no FIXO (como o dublê), a partir de `impostos_entrada.icms_st` | **Único campo que exige trabalho novo no domínio `impostos` antes** — ver abaixo |

## ICMS ST — único ponto que precisa de cálculo novo, e não é no precificador

O valor bruto que a API devolve pra ICMS ST (`icms_st.valor`) não é o crédito líquido usável — precisa ser líquido do ICMS normal (`líquido = bruto − Valor ICMS normal`, já validado no dublê). Como o precificador não pode calcular imposto, essa conta precisa ganhar 1 dono dentro do domínio `impostos` (ex: propriedade/método novo em `IcmsStEntradaProduto` ou no guarda-chuva) — só depois disso o precificador lê um valor já pronto, igual aos outros 4 impostos. Ainda não implementado.

## Decisões fechadas (16/08/2026, 05:06–05:23)

1. **Sem fallback.** Produto sem `impostos_entrada` sincronizado (ainda existem muitos) simplesmente **não calcula preço** — nunca usa o dado antigo do `Produto` como substituto silencioso.
2. **Nenhuma planilha entra mais na precificação.** Custo e fiscais vêm só do XML/Sysemp, ponto final.
3. **PIS e COFINS separados no FIXO** — confirmado com o superior (não é mais decisão em aberto).

## Achado real: a planilha de precificação já estava desativada

Investigado onde `importar_planilha_precificacao.py` (`Planilha_Importar_Pos_Macro.xlsm`) é usado, pra decidir se dá pra excluir. Achado: **a etapa já está comentada em `popular_banco.py` desde 21/07/2026** — redesenho anterior, documentado em [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]. Ou seja, excluir esse arquivo formalmente não muda nenhum comportamento hoje — já é código morto.

Essa planilha escrevia 16 campos no `Produto`. Conferido campo a campo:
- 5 campos (custo, ICMS entrada, IPI, PIS/COFINS, ICMS ST) — cobertos pela migração acima.
- `armazenagem_planilha` — sem problema, o sistema já assume `None` e usa faixa dinâmica (comportamento já esperado).
- `mva` — confirmado sem uso por nenhuma fórmula.
- `frete_cif_fob`, `icms_saida_sp`, `icms_saida_media` — sem mudança, seguem o prazo já combinado (ver [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]).
- `custo_com_boni` — já abandonado por decisão anterior.
- **`peso_produto_apos_embalado` + `altura/largura/comprimento_produto_apos_embalado` + `peso_cubado`** — **achado novo e sério**, não coberto por nada disso. Ver seção abaixo.

## Achado novo, mais sério que o de ontem: dimensão "embalada" sem fonte desde 21/07

A planilha desativada era a **ÚNICA** fonte dos 4 campos de dimensão "embalada" (`_apos_embalado`) do `Produto`. `Produto.obter_dimensoes_envio()` lê exatamente esses 4 campos — e alimenta `organizar_e_verificar_divergencias_dimensoes_envio`, que por sua vez gera os campos `_ordenada_cm` que `resolver_dimensoes_efetivas` usa como fallback. Como a planilha está desligada há 3 semanas, esses 4 campos estão `None` pra **todo produto**, não só os sem variação do ML.

Isso amplia bastante o achado de [[Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada]] (registrado ontem à noite, 04:50) — não é só "produto sem sincronização do ML", é "a fonte de dimensão embalada não existe mais desde 21/07, ponto". Provavelmente afeta Coleta e Armazenagem de praticamente todos os produtos hoje, silenciosamente.

**Em aberto, sem decisão ainda**: de onde vem a dimensão "embalada" agora? O Cadastro de Produtos do ERP já tem colunas de embalagem (`Embalagem Altura/Largura/Comprimento/Peso`, lidas por `importar_produtos_erp.py`) — falta confirmar se esse dado já vai pros campos `_apos_embalado` ou só pros campos `_sem_embalar`, e decidir se isso deveria alimentar os dois.

## Em aberto (retomar amanhã)

- Decidir a fonte da dimensão "embalada" (achado acima).
- Implementar o campo/propriedade de crédito líquido de ICMS ST no domínio `impostos` (pré-requisito antes de mexer no precificador).
- Só depois disso, escrever os diffs reais de `formula_precificacao.py`/`calcular_grade_precificacao_ml.py`.
- Excluir formalmente `importar_planilha_precificacao.py` e limpar as referências comentadas em `popular_banco.py` (import + etapa comentada).

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
- [[Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Integridade e Fonte Unica de Dado]]
- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
