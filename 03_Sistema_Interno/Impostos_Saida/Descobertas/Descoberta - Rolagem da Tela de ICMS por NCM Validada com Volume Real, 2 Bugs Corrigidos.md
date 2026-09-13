---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 15:41
relacionado: [Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF, Checkpoint - Inicio da Estrutura de Impostos de Saida]
---

# Descoberta: Rolagem da Tela de ICMS por NCM Validada com Volume Real — 2 Bugs Corrigidos

**Resumo**: Com os dados reais já importados (MAGAZINE + SAMVALE), a rolagem vertical da tela de ICMS por NCM foi testada com volume real de dados e funciona corretamente — fecha a pendência que tinha ficado em aberto no Checkpoint ("vou precisar importar mais dados pra testar a rolagem vertical"). No mesmo teste apareceram 2 bugs na rolagem horizontal, ambos corrigidos: (1) o cálculo da "área visível" usava a borda crua do container (`getBoundingClientRect()`), que inclui o espaço reservado pela barra de rolagem — isso fazia o valor da última coluna visível ficar cortado, escondido atrás da barra; (2) um `j` solto (typo, entrou sem querer numa edição manual anterior) quebrava a função `destacar_celula` inteira com um `ReferenceError`, parando a rolagem por completo até ser encontrado e removido.

> [!success] Confirmada — 12/09/2026
> Rolagem horizontal e vertical validadas com dado real de volume, tela funcionando ponta a ponta ("ficou TOP").

## Bug 1 — corte na borda direita (barra de rolagem não descontada)

Em `rolar_para_celula` (`impostos/static/impostos/js/script_tabela_icms_por_ncm.js`), a área visível da direita/baixo era calculada como `containerRect.right`/`containerRect.bottom` — a borda inteira do container, que inclui o espaço da barra de rolagem. A barra ocupa espaço dentro do container sem que `getBoundingClientRect()` desconte isso; quem desconta é `clientWidth`/`clientHeight`. Resultado: o script achava que a área visível ia mais longe do que realmente ia, então às vezes parava o scroll cedo demais e a última coluna visível ficava com o valor cortado atrás da barra (reproduzido: consultando uma UF no meio da tabela o valor aparecia cortado, "20,0" em vez de "20,00%"; consultando a UF que é a última coluna mesmo, o valor aparecia inteiro — não sobrava nada pra cortar).

**Correção**: `areaVisivelRight`/`areaVisivelBottom` passaram a usar `containerRect.left/top + clientLeft/clientTop + clientWidth/clientHeight`, que já descontam a barra de rolagem e a borda, em vez de `containerRect.right/bottom` direto.

## Bug 2 — typo `j` quebrando `destacar_celula`

Entrou uma linha só com `j` logo depois de `limpar_destaque();`, dentro de `destacar_celula` — provavelmente uma tecla digitada sem querer ao aplicar manualmente a correção do Bug 1. Como `j` não é uma variável declarada, o JS lançava `ReferenceError` assim que a função rodava, antes até de chegar em `rolar_para_celula` — por isso a rolagem parou de funcionar por completo (não só o corte: destaque e scroll inteiros). Corrigido removendo a linha.

## Relacionado

- [[Decisao - ICMS por NCM Sera Armazenado em Tabela Normalizada, Uma Linha por NCM e UF]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
