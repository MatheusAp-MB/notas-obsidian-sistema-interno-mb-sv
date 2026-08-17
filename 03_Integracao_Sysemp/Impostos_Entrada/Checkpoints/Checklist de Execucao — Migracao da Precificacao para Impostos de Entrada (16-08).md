---
tipo: checkpoint
dominio: python
status: concluido
criado: 16/08/2026
atualizado_em: 16/08/2026 21:59
relacionado: [Migracao da Precificacao Real para Usar Impostos de Entrada Validados, Plano em Etapas do Duble de Precificacao ML, Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada, Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta, Integridade e Fonte Unica de Dado, Padroes de Projeto GoF Quando Usar, Hipotese de Diferimento do Credito de ICMS Entrada em Produtos ST, Disciplina de Testes Automatizados, Guarda de Linhas Vazias em Frete Para Faixa Era Codigo Morto (Amazon), Refetch de Produto do Banco Propaga Exponent Decimal em Asserts de Texto Formatado, Conversao Para Decimal Sem Guarda de Nulo Quebrava Sincronizacao Sem Quantidade Nota, Validacao dos 3 Cenarios de Tributacao Normal Reducao e ST Pos-Migracao da Precificacao]
---

# Checklist de Execução — Migração da Precificação para Impostos de Entrada (16/08, 15:28 → 21:59) ✅ CONCLUÍDO

## Contexto da sessão

Domingo 16/08/2026, retomada às 14:48. Janela real de trabalho: até ~23:30 (≈9h). Instrução explícita do usuário: foco total em "terminar" a precificação com tudo que já temos disponível, **sem abrir rota paralela nenhuma** — nada do plano de domingo (API ML, Shopee, Samvale, documentação) entra hoje. Checklist existe pra não ficar patinando.

Objetivo desta frente, nas palavras do usuário: **"garantir que o sistema de precificação receba corretamente todos os impostos necessários, com todos os dados completos e corretos"** — não é sobre redesenhar como o preço é processado depois (isso fica pra outra frente, deliberadamente fora de hoje).

Princípio maior, também explícito: antes a planilha do superior era o teto de complexidade possível (dado manual, limitado); agora temos o dado fiscal completo e tratado via API — então o padrão do código tem que subir junto. **"Não é pra gente apenas 'fazer funcionar', é pra deixar o melhor possível com o que temos hoje."** Regra derivada, valendo daqui pra frente: **sempre que encontrarmos código morto, excluímos** (não comentamos, não deixamos pra depois).

## Correção importante sobre a sessão de ontem (16/08, 05:23)

Investigação de hoje (leitura real do código, não suposição) corrigiu um achado registrado ontem à noite: a dimensão "embalada" do Produto **não** ficou sem fonte quando a planilha de precificação foi desativada (21/07). `importar_produtos_erp.py` (ativo, roda todo `popular_banco`) já grava os 4 campos `_apos_embalado` + `peso_cubado` a partir das colunas reais "Embalagem Altura/Largura/Comprimento/Peso" do próprio Cadastro do ERP. O zero visto no produto de teste ontem é provável falta de preenchimento daquela linha específica no ERP — não um buraco de arquitetura. Ver [[Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada]] (já atualizada com essa correção).

## Mapa de inputs — Produtos/Precificação (levantado hoje)

| Input | Onde é lido | Alimenta | Hoje |
|---|---|---|---|
| `Relatorio_Todos_Produtos_Ativos/Inativos_ERP_MB.xlsx` (2 arquivos) | `importar_produtos_erp.py` | Cadastro completo do `Produto` (título, custo, estoque, dimensões sem embalar e embaladas, peso cubado) | Ativo. Candidato a virar API do ERP. |
| Manifesto de Notas de Entrada (API Sysemp) | `integracao_sysemp` | `impostos_entrada` (ICMS/ICMS ST/IPI/PIS/COFINS) | Já é API — modelo a generalizar. |
| `Planilha_Importar_Pos_Macro.xlsm` | `importar_planilha_precificacao.py` | Custo c/ boni, MVA, ST, IPI%, PIS/COFINS%, ICMS saída SP/média, frete CIF/FOB% | Morta desde 21/07. Vira código excluído na Etapa 3. |
| `Tabela_Frete_ML/Magalu/TikTok/Amazon.xlsx` (4 arquivos) | 4 scripts quase idênticos | Tabela de frete por faixa peso×preço | Ativo. Fora de escopo hoje, candidato a consolidação futura. |
| `detalhes_mlbs.json`, `dados_completos_por_sku.json`, `promocoes_completo.json` | scripts de anúncio/dimensão/qualidade/promoção ML | Variação ML, qualidade, promoções | Desativado desde 15/08 — Tarefa 1 de domingo, fora de escopo hoje. |

## Os 16 campos que a planilha morta alimentava — o que acontece com cada um

| Campo | Escritor vivo hoje? | Resolve hoje? | Ação |
|---|---|---|---|
| `custo` | Sim (`importar_produtos_erp.py`) | Não precisa | Nenhuma |
| `custo_com_boni` | Não | Indireto | Mantém — fallback pra `custo` já funciona, não é código morto, é dado sem fonte ainda |
| `mva` | Não | — | **Excluir** (confirmado sem uso em nenhuma fórmula) |
| `st_valor` | Não | Sim | **Excluir** — vira crédito líquido de `impostos_entrada.icms_st` |
| `icms_entrada` | Não | Sim | **Excluir** — vira `impostos_entrada.icms.valor` |
| `ipi` | Não | Sim | **Excluir** — vira `impostos_entrada.ipi.valor` |
| `pis_cofins` | Não | Sim | **Excluir** — crédito vem de `impostos_entrada.pis/cofins.valor`; saída passa a usar os campos dormentes abaixo |
| `pis_percentual` / `cofins_percentual` | Não (dormentes desde 23/07, nenhuma fórmula usa) | Sim | **Ativar** — passam a ser os únicos campos de PIS/COFINS de saída no `Produto` |
| `icms_saida_sp` / `icms_saida_media` | Não | Não | Mantém — fora de escopo, depende do superior validar planilha nova (~1 semana) |
| `frete_cif_fob` | Não | Não | Mantém — fora de escopo, origem não decidida, depende de colega voltar de férias |
| 4 campos `_apos_embalado` + `peso_cubado` | Sim (`importar_produtos_erp.py`) | Não precisa | Nenhuma — achado corrigido acima |
| `armazenagem_planilha` | Não | Não precisa | Nenhuma — já resolvido antes (faixa dinâmica) |

## Achado extra: 7 consumidores, não 6

Além das 6 fórmulas de marketplace (`formula_precificacao*.py` — ML, TikTok, Raia, Amazon, Magalu, Shopee), `mercado_livre/funcoes_auxiliares/calculo_margem.py` (cálculo de margem "pra frente" do ML) também lê os campos antigos — confirma a conflação real do `pis_cofins`: usado 1x como crédito de entrada (`calcular_fixo_detalhado`) e 1x como alíquota de saída (`calcular_margem`), mesmo campo, 2 significados.

## Checklist de execução

**Etapa 0 — Domínio `impostos` (pré-requisito)** ✅ concluída (16/08, ~16:30)
- [x] `impostos/models.py` (487 linhas, fazia schema+sincronização+exibição+DTO de precificação tudo junto) dividido por responsabilidade, depois de feedback direto do usuário ("MUITOOOOO complexo... qual a responsabilidade dele?"): reduzido a schema puro (7 classes de model, ~180 linhas). Sincronização foi pra `impostos/funcoes_auxiliares/sincronizacao_impostos_entrada.py`, exibição pra `exibicao_impostos_entrada.py`, e um "molde" declarativo comum aos 2 caminhos (`impostos/descritores_impostos.py`, `DESCRITORES_IMPOSTOS`) substitui os 6 blocos imperativos repetidos (1 por imposto) por 1 loop só, pros 2 sentidos (gravar/exibir). `conversao_valores_impostos.py` isola o cálculo "valor por unidade" (valor da nota ÷ quantidade da nota).
- [x] Crédito líquido de ICMS ST **não** virou propriedade no model (como o plano original previa) — virou função pura em `impostos/funcoes_auxiliares/creditos_fiscais_para_precificacao.py` (`montar_creditos_fiscais_para_precificacao`), que devolve os 4 créditos já resolvidos (ICMS, IPI, PIS, COFINS) por unidade. Correção de design própria, pega antes de escrever teste: a 1ª versão tinha `icms` e `icms_st_liquido` como 2 campos somáveis — reproduziria o bug já corrigido no dublê (ver [[Bug ICMS ST Fantasma Quando Nao Ha Substituicao Tributaria]]) de creditar o mesmo imposto 2x num produto ST. Versão final: 1 campo `icms` só, resolvido internamente (`_produto_tem_icms_st` checa `icms_st.valor > 0 or base_calculo > 0`, igual ao dublê).
- [x] Testes: `impostos/tests/test_nivel_3__impostos_e_custos_xml_entrada_produto.py` atualizado pra nova API; `test_nivel_3__creditos_fiscais_para_precificacao.py` novo (crédito normal, crédito líquido ST, ausência de `quantidade_nota`, xfail). 545 passed, 6 failed pré-existentes (não relacionados), 13 xfailed, 100% cover nos módulos tocados.

**Etapa 1 — Limpar o modelo `Produto`** ✅ concluída (16/08, ~17:20) — migração aplicada e confirmada pelo usuário (`makemigrations`/`migrate` OK, 5 erros `admin.E108` esperados e corrigidos no caminho).
- [x] Migration `0008_remove_produto_icms_entrada_remove_produto_ipi_and_more` removendo: `icms_entrada`, `ipi`, `st_valor`, `mva`, `pis_cofins`.
- [x] `pis_percentual`/`cofins_percentual` (já existentes) viraram os únicos campos de PIS/COFINS de saída no `Produto`.
- [x] `admin.py`, `filtros_produtos.py`, `contexto_tela_produtos.py` atualizados — 5 campos excluídos removidos de `list_display`/fieldset/`CAMPOS_ORDENACAO`/`CAMPOS_FAIXA`/`LABELS_COLUNAS`/`SECOES_FILTRO_FAIXA`.
- [x] `custo_com_boni`, `frete_cif_fob`, `icms_saida_sp`, `icms_saida_media` ficaram como estavam.
- **Deliberadamente adiado**: `produtos/templates/produtos/estrutura_produtos.html` (botões de coluna + cabeçalho + célula ainda referenciam os 5 campos removidos, vão mostrar em branco) — usuário pediu explicitamente pra deixar por último, porque quer mudar mais coisas nessa tela além de só corrigir a referência.

**Etapa 2 — Migrar os 7 consumidores pra `impostos_entrada`** ✅ concluída (16/08, ~18:10)
- [x] `mercado_livre/funcoes_auxiliares/calculo_margem.py`
- [x] `precificacao/funcoes_auxiliares/mercado_livre/formula_precificacao.py`
- [x] `precificacao/funcoes_auxiliares/tiktok/formula_precificacao_tiktok.py`
- [x] `precificacao/funcoes_auxiliares/raia/formula_precificacao_raia.py`
- [x] `precificacao/funcoes_auxiliares/amazon/formula_precificacao_amazon.py`
- [x] `precificacao/funcoes_auxiliares/magalu/formula_precificacao_magalu.py`
- [x] `precificacao/funcoes_auxiliares/shopee/formula_precificacao_shopee.py`
- [x] Em todos: sem `impostos_entrada` sincronizado (ou sem `quantidade_nota`) = `resolvida=False`, nenhum preço calculado — sem fallback pro dado antigo.
- [x] Efeito colateral corrigido de graça nos 6 marketplaces (não só no ML, que já tratava isso pela metade): ICMS de substituição tributária deixa de ser somado como custo dentro de "custo final" — vira só mais um crédito, já líquido, dentro do FIXO. Antes disso, todo marketplace fora do dublê tinha o bug real de creditar ICMS normal mesmo em produto ST.
- **Achado pendente de ação, não fechado ainda**: `git status` do usuário (18:26) não lista `formula_precificacao_tiktok.py` como modificado, embora o arquivo tenha sido entregue e as outras 5 fórmulas apareçam modificadas — **conferir se esse arquivo foi de fato salvo local antes de comitar**, senão o TikTok fica quebrado (`AttributeError` nos campos removidos do `Produto`). `scripts_exploracao_ERP/duble_precificacao_ml.py` também aparece modificado no mesmo `git status`, sem que esta sessão tenha tocado nele — origem não identificada, precisa ser conferida antes do commit.

**Etapa 3 — Excluir código morto** ✅ concluída (16/08, ~18:20)
- [x] `importar_planilha_precificacao.py` apagado (confirmado sem nenhum outro consumidor real, nem da constante `CAMINHO_PLANILHA_PRECIFICACAO`) e a referência comentada em `popular_banco.py` removida (import + linha da etapa).

**Etapa 4 — Validar** ✅ concluída (16/08, 21:59)
- [x] `pytest -s --cov=impostos --cov-report=term-missing --cov-report=html --cov-report=json` — 605 passed, 6 failed pré-existentes (agenda_videos ×4, api ×2, sem relação com hoje), 19 xfailed. Idêntico ao baseline anterior — **nenhuma regressão**. `impostos/models.py`, `sincronizacao_impostos_entrada.py`, `creditos_fiscais_para_precificacao.py`, `conversao_valores_impostos.py`, `exibicao_impostos_entrada.py`, `descritores_impostos.py` em 100% cover. (`exportacao_resumo_entrada.py`/`resumo_entrada.py`/`views.py` com cobertura baixa, mas são da tela de Resumo de Impostos — não tocados hoje, gap pré-existente.)
- [x] Os 6 comandos reais (`calcular_grade_precificacao_ml/tiktok/raia/amazon/magalu/shopee`) rodados contra os 879 produtos reais do banco — **0 erros de assert em todos os 6**, nenhum traceback. Taxa de "sem cálculo possível" consistente entre marketplaces (~6% em ML/TikTok/Amazon, ~5,9-6,3% em Raia/Magalu/Shopee) — nenhum se destaca dos outros, o que descarta bug isolado numa fórmula específica.
- [x] Conferência manual com dado real — ver [[Validacao dos 3 Cenarios de Tributacao Normal Reducao e ST Pos-Migracao da Precificacao]] pro detalhe completo. Resumo: os 3 cenários fiscais possíveis (Tributado, Redução, Substituição Tributária) validados com 3 produtos reais, batendo exato entre o crédito esperado (calculado a mão a partir de `impostos_entrada`) e o `credito_icms_entrada`/`credito_pis`/`credito_cofins` gravado em `GradePrecificacaoML.detalhamento`.
- **Achado durante o planejamento desta etapa**: `precificacao/` e `mercado_livre/` não têm NENHUM teste automatizado hoje (só o `tests.py` padrão vazio do Django) — a suíte completa não vai validar a migração em si, só confirma que nada mais quebrou. Decisão: escrever testes Nível 3 de verdade pra esse domínio, começando pela `FormulaPrecificacaoRaia` (mais simples — frete e comissão fixos, motor compartilhado com as outras 5) como piloto. 4 cenários combinados com o usuário, aguardando "ok" pra escrever o arquivo (`precificacao/tests/test_nivel_3__formula_precificacao_raia.py` — precisa apagar o `precificacao/tests.py` padrão antes, senão conflita com a pasta `tests/` nova).
- [x] **Testes Nível 3 das 6 fórmulas de marketplace — concluído (16/08, ~21:00).** Depois da Raia (piloto), o mesmo padrão de cenários foi replicado pra ML, TikTok, Amazon, Magalu e Shopee: crédito normal, ICMS ST com diferimento (líquido, sem dobrar), sem `impostos_entrada` sincronizado, crédito incompleto sem `quantidade_nota`, armazenagem por faixa (lista pronta e busca no banco), denominador inválido, `para_dict_auditoria()` e 1 xfail proposital por arquivo — além do mecanismo exclusivo de cada plataforma (seleção de faixa de frete pelo preço calculado + rebate no ML; kg adicional acima do teto da matriz na Amazon; tipo com/sem afiliado no TikTok; faixa de peso × reputação na Magalu; comissão + adicional fixo variando juntos por faixa de preço no TikTok/Shopee). `precificacao/tests.py` (stub padrão do Django) apagado, substituído pelo pacote `precificacao/tests/`.
  - **Resultado final**: 605 passed, 19 xfailed, 6 falhas pré-existentes sem relação (fora do domínio) — **100% cover / 0 Miss / 0 BrPart nas 6 fórmulas**, barra de "pronto" batida em todas.
  - **2 bugs reais de produção achados e corrigidos durante a escrita dos testes** (nenhum dos dois era conhecido antes): guarda morta em `formula_precificacao_amazon.py::_frete_para_faixa`, achada só porque a cobertura ficou em 99% em vez de 100% — ver [[Guarda de Linhas Vazias em Frete Para Faixa Era Codigo Morto (Amazon)]]; e `_converter_para_decimal` em `sincronizacao_impostos_entrada.py` não era null-safe pra `quantidade_nota` ausente na nota — ver [[Conversao Para Decimal Sem Guarda de Nulo Quebrava Sincronizacao Sem Quantidade Nota]].
  - **1 gotcha técnico documentado pra qualquer teste futuro** de fórmula de precificação com `Produto` real do banco: refetch via `Produto.objects.get(...)` normaliza o exponent dos campos `DecimalField` de dimensão, e isso cascateia até o texto formatado de `formula_preenchida()` (não afeta comparação numérica `==`, só assert de string literal) — ver [[Refetch de Produto do Banco Propaga Exponent Decimal em Asserts de Texto Formatado]]. Pego na prática no teste da Magalu (`esperado_preenchida` corrigido de `R$ 199.00` pra `R$ 199.00000000`).

## Achado confirmado (não mais hipótese): duplicação real nas 6 fórmulas de marketplace

A nota original já previa isso em "Fora de escopo hoje". Medido de verdade após a Etapa 2: `obter_creditos_fiscais`, `calcular_coleta` e `calcular_armazenagem` saíram **100% idênticos** em 5 dos 6 arquivos (só o ML difere, por usar `DimensoesEfetivas` em vez de ler o `Produto` direto); `calcular_custo_final` saiu idêntico nos 6, sem exceção; `calcular_fixo` idêntico em 4. Ou seja, boa parte de cada arquivo (~150-200 das ~300-440 linhas) é a mesma função copiada 6 vezes — o que genuinamente varia entre plataformas é só a origem da dimensão (ML), o algoritmo de resolver frete/comissão, e o formato das 3 dataclasses de auditoria.

Isso é exatamente o gatilho que [[Padroes de Projeto GoF Quando Usar]] já previa pra promover Template Method ("adotar quando existir de fato múltiplas implementações intercambiáveis") — mas resolveria melhor por composição (extrair 1 função/dataclass única com o motor fiscal/custo, cada classe chama em 1 linha), mantendo o padrão do projeto de "composição > herança". **Decisão do usuário (16/08, 18:15): deixar como está por agora** — não vira tarefa prioritária, fica registrado aqui como achado caso o assunto volte.

## Fora de escopo hoje (de propósito)

- Unificar a lógica duplicada das 6 fórmulas de marketplace numa base comum — ver achado acima; decisão explícita foi não fazer isso agora.
- Frete CIF/FOB e ICMS de saída (SP/média) — sem fonte nova ainda, prazo de terceiros.
- Consolidar os 4 scripts de tabela de frete por marketplace.
- Plano de domingo (API ML, Shopee, Samvale, documentação).

## Relacionado

- [[Migracao da Precificacao Real para Usar Impostos de Entrada Validados]]
- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada]]
- [[Escopo Final - O Que Vem da API Sysemp e O Que Continua Como Esta]]
- [[Integridade e Fonte Unica de Dado]]
- [[Disciplina de Testes Automatizados]]
- [[Guarda de Linhas Vazias em Frete Para Faixa Era Codigo Morto (Amazon)]]
- [[Refetch de Produto do Banco Propaga Exponent Decimal em Asserts de Texto Formatado]]
- [[Conversao Para Decimal Sem Guarda de Nulo Quebrava Sincronizacao Sem Quantidade Nota]]
- [[Validacao dos 3 Cenarios de Tributacao Normal Reducao e ST Pos-Migracao da Precificacao]]
