---
tipo: descoberta
dominio: 
status: confirmada
criado: 13/09/2026
atualizado_em: 13/09/2026 18:48
relacionado: [Checkpoint - Inicio da Estrutura de Impostos de Saida, Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria, Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica, Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria]
---

# Descoberta: Tela de ICMS por NCM Redesenhada para Mostrar Origem e CST, Mockup Funcional Validado

**Resumo**: Matheus usou a tela real de "ICMS de Saída por NCM" (screenshot) pra pensar visualmente no agrupamento NCM+Origem+CST, com a lógica "se definirmos como deve ser agrupado visualmente, descobrimos como deve ser salvo em código". 2 achados reais no código confirmaram que a tela hoje já está desatualizada em relação à chave correta, e 2 mockups (estático e funcional) foram construídos, testados e aprovados.

> [!success] Aprovado — 13/09/2026, 18:48
> "FICOU EXCELENTE. é exatamente assim que eu quero." Formato fechado — vira a referência pro redesenho real da tela.

## Achado 1: o template já recebe `cst` e `origem_mercadoria_cadastro`, mas nunca usa

`exibicao_icms_por_ncm.py::montar_matriz_icms_por_ncm()` já agrupa por `(ncm, cst, origem)` (mudança de 13/09) e inclui os 2 campos em cada linha — o próprio comentário no código já avisava: "AVISO: o template desta tela ainda espera 1 linha por NCM". Conferido: `estrutura_tabela_icms_por_ncm.html` só usa `linha.ncm`, nunca `linha.cst`/`linha.origem_mercadoria_cadastro`. Resultado prático: um NCM com mais de 1 grupo aparece repetido na tela sem nenhuma forma de saber se são 2 grupos fiscais diferentes ou uma duplicação — exatamente o que aparecia na screenshot original (NCM `28369920` 2x, `38085910` 3x).

## Achado 2: a calculadora tem o mesmo bug de "sobrescrita silenciosa" já corrigido na importação, mas ainda ativo aqui

`exibicao_icms_por_ncm.py::consultar_icms_por_ncm(ncm, uf)` filtra só por `ncm` (`IcmsNcmUf.objects.filter(ncm=ncm)`), sem CST nem Origem. Quando um NCM tem mais de 1 grupo, o dict `{uf: aliquota}` é montado sobrescrevendo por UF conforme a ordem de leitura do banco — a mesma classe de bug que já motivou a correção de `AgrupadorIcmsPorNcm`/`IcmsNcmUf`, mas que continua sem correção na consulta. Hoje, consultar um NCM com mais de 1 grupo pode devolver o valor errado.

## Mockup 1 — estático (aprovado)

Preserva 100% os elementos da tela real (toolbar, calculadora, resultado, matriz pivotada por UF, coluna verde de Média Ponderada — cores extraídas de `layout_global.css`) e acrescenta 2 colunas com célula mesclada (rowspan): NCM → Origem → CST → 27 UF + média, espelhando exatamente a notação que Matheus definiu (`NCM 27101259 -> Origem 01 -> CST 20 -> 27 UF + média`). Origem em branco (`origem_mercadoria_cadastro=None`) tratada como grupo próprio e visível (itálico, cor mais fraca), nunca escondida nem confundida com Origem "0".

## Mockup 2 — funcional (aprovado)

Calculadora com 4 campos dependentes: NCM → Origem (só as que aquele NCM tem) → CST (só os que aquela combinação tem, mesmo padrão de dropdown dependente já usado na tela de PIS/COFINS por NCM+CST) → UF. `destacar_celula()`/`rolar_para_celula()` portados de `script_tabela_icms_por_ncm.js`, com 1 adaptação necessária: o índice de coluna não pode vir da posição do `<td>` entre os filhos da linha (uma linha "dona" do rowspan tem 3 células de rótulo, uma linha "coberta" só tem 1 — a mesma coluna visual cairia em posições diferentes) — resolvido com um atributo `data-col` fixo por coluna, e uma busca que anda pra trás entre as linhas do mesmo grupo até achar a célula que realmente renderiza o rótulo mesclado.

Testado com Playwright (Chromium headless) antes de entregar, não só visualmente:
- Grupo com Origem em branco + CST + UF com valor → destaque correto (NCM, Origem, CST, célula, cabeçalho), mensagem menciona "sem origem sincronizada".
- Combinação existente mas UF sem alíquota → mensagem "dado real, não é erro", sem quebrar.
- Média Ponderada de um grupo específico → destaca a coluna certa.
- Rolagem horizontal forçada (viewport estreito, UF mais à direita): `scrollLeft` 0 → 694px confirmado via `getBoundingClientRect()`, célula ficou de fato visível dentro do container.
- Bug próprio corrigido antes de entregar: o select de Origem usava `""` tanto pro placeholder "Selecione..." quanto pra "Origem em branco" — os 2 ficariam indistinguíveis. Corrigido com um sentinela (`__NULL__`) só pra Origem em branco.

## O que isso confirma pra Decisão da Média Ponderada

Nos 2 mockups, cada grupo (`ncm, origem, cst`) carrega **1 único** valor de média — aparece 1 vez por linha de grupo, nunca repetida nas colunas de UF daquele grupo. Essa é a evidência visual que fechou [[Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria]]: tabela própria, 1 linha por grupo, não campo redundante nas 27 linhas de `IcmsNcmUf`.

## O que ainda falta (fora desta descoberta)

Nenhum código real (Django) foi escrito — os 2 mockups são HTML standalone, fora do repositório, com dado de exemplo embutido no JS. O diff real (template + `exibicao_icms_por_ncm.py` + a nova tabela de média) ainda não foi feito.

## Relacionado

- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
- [[Decisao - Chave de Consolidacao do ICMS por NCM Passa a Incluir CST e Origem da Mercadoria]]
- [[Decisao - Fluxo de Impostos de Saida Passa a 4 Comandos Auto-Suficientes, CST Isolado em Comando Proprio Como Fonte Unica]]
- [[Decisao - Media Ponderada do ICMS Passa a Ser Persistida em Tabela Propria]]
