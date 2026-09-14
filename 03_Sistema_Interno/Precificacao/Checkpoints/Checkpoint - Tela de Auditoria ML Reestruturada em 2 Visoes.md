---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 14/09/2026
atualizado_em: 14/09/2026 03:27
relacionado: [Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design, Decisao - Custo com Bonificacao Fica Sempre None por Enquanto, Sem Refatorar Codigo, Checkpoint - Inicio da Validacao Exaustiva de Precificacao]
---

# Checkpoint - Tela de Auditoria ML Reestruturada em 2 Visões

**Resumo**: A tela de auditoria do modal "como chegamos nesse preço" (ML) foi reestruturada de ponta a ponta: a antiga seção única "Passo a passo" + caixa "Fórmula completa" (ver [[Descoberta - Tela de Auditoria ML - Arquitetura e Principios de Design]]) virou 2 abas complementares — **Visão 1 (Como o preço foi montado)**, o passo a passo já existente revisado, e **Visão 2 (De onde vem o lucro)**, nova: desmontagem do preço final item a item, de trás pra frente, até sobrar só o lucro. Cada visão ganhou sua própria contraprova independente. Aprovado em mockup (v7→v9, 3 rodadas de correção) e aplicado no código real via script único, testado exaustivamente antes da entrega e já sincronizado/confirmado no GitHub.

> [!warning] EM ANDAMENTO — aplicado e sincronizado, validação visual/funcional real ainda pendente
> Matheus aplicou o script em 14/09/2026, commitou (`antes de duas visoes` → `apos duas visoes`) e pediu sincronização + registro no vault antes de pausar pro dia. Confirmei a aplicação por leitura estática do repositório sincronizado (sem rodar o projeto): cada símbolo novo aparece exatamente 1x nos 4 arquivos reais, sem duplicação; sintaxe Python válida nos 2 arquivos `.py`. Falta: Matheus abrir o modal de verdade (Visão 1, Visão 2, as 2 contraprovas) e confirmar visualmente contra o mockup v9 aprovado — vai continuar amanhã do PC do escritório.

## As 2 Visões

**Visão 1 — Como o preço foi montado**: o passo a passo de sempre (camadas 1 a 8: Custo final → Coleta → Armazenagem → FIXO → Taxa → Denominador → Faixa de frete → Preço exato), com 2 passos novos adicionados como etapas próprias — Passo 9 (Preço final — RoundUp90) e Passo 10 (Margem obtida, conferência) — que antes só apareciam resumidos dentro da caixa "Fórmula completa".

**Visão 2 — De onde vem o lucro** (nova): parte do preço final de venda e vai subtraindo cada custo, 1 de cada vez, até sobrar só o lucro — nada resumido em bloco, inclusive os itens que valem R$ 0,00 (ex: crédito de PIS/COFINS zerado ainda vira linha própria, visível). Ordem: preço final → comissão/ICMS saída/PIS saída/COFINS saída → frete → custo do produto/IPI/frete CIF-FOB → coleta → armazenagem → +créditos ICMS/PIS/COFINS (somados de volta) → checkpoint de conferência (deve bater com o FIXO da Visão 1) → +rebate → lucro.

## As 2 contraprovas

- **Contraprova da Visão 1**: chama `calcular_margem()` (`mercado_livre/funcoes_auxiliares/calculo_margem.py`, já usada no Hub de Promoções — implementação independente) de verdade, com o preço final já persistido. Única exceção ao "esta tela nunca recalcula ao vivo" — só pra exibir a prova visual, nunca grava nem substitui o valor oficial da grade. `disponivel=False` com motivo explícito quando o produto não tem dados fiscais sincronizados ou não há faixa de frete pro preço.
- **Contraprova da Visão 2**: a conta mais simples que existe — lucro ÷ preço de venda, sem recalcular nada (todos os valores já vêm persistidos).

## Correções feitas durante o mockup (v7 → v9)

1. Fonte da armazenagem reduzida à configuração do sistema (faixas por dimensão) como única fonte válida — o branch `origem == 'planilha'` foi mantido no código real (ainda é lido de verdade em `calcular_armazenagem()`, não é código morto) mas reescrito honestamente como fonte legada, específica de produtos antigos, em vez de aparecer como opção normal ao lado da config
2. Ordem de exibição do FIXO corrigida pra bater com a ordem real de cálculo: Custo Final (camada 1) → Coleta (camada 2) → Armazenagem (camada 3) — antes exibia Coleta→Armazenagem→Custo Final
3. Regra nova pra toda a tela: nunca mostrar a fórmula abstrata e a versão com números substituídos na mesma linha — sempre 2 linhas separadas, e nunca pré-computar nenhuma parte (ex: mostrar `(1 − 0,19)` literal, nunca `0,81`)
4. Todo valor representado em % ganhou o R$ equivalente ao lado (e vice-versa) — inclusive Margem-alvo e Margem obtida no cabeçalho, e a Taxa (Passo 5), calculada como referência sobre o preço já final já que Taxa é usada como % antes do preço existir na ordem de cálculo

## Implementação

Escopo: **substitui** "Passo a passo" + "Fórmula completa". **Não mexe** no veredito de alertas, no bloco "Dados do Produto" nem na tabela "Todos os itens usados no cálculo" — ficaram como estavam, fora do escopo combinado com Matheus antes de gerar o script.

Arquivos alterados no repositório real:
- `precificacao/views/modal_comum.py` — dataclasses `LinhaTeardown`/`ContraprovaVisao1` + função `montar_visao_2_teardown`
- `precificacao/views/grade_mercado_livre.py` — função `_montar_contraprova_visao_1` + campos `visao_2`/`contraprova_1` em `DetalheFormulaExibida`
- `precificacao/templates/precificacao/parciais/estrutura_parcial_grade_detalhe.html` — abas + os 2 painéis + JS `trocarVisaoAuditoria` (escopado por modal, suporta Clássico e Premium abertos ao mesmo tempo)
- `precificacao/static/precificacao/css/layout_grade_precificacao_ml.css` — estilos das abas, contraprova e teardown, reaproveitando os tokens já existentes (`--audit-*`)

Entregue como 1 script único (`implementar_duas_visoes.py`, ~1020 linhas), a pedido explícito de Matheus, pra ele rodar de uma vez. Idempotente (rodar 2x não duplica nada) — bug real de idempotência encontrado e corrigido antes da entrega (checagem original não reconhecia "já feito" em trocas do tipo "acrescenta depois do texto existente").

## Verificação (antes da entrega, em cópia isolada — nunca no repositório real)

- Rodado 2x seguidas: confirmado idempotente, 0 duplicação na 2ª vez
- `py_compile` nos 2 arquivos `.py` — sem erro de sintaxe
- Balanceamento de tags do template (`{% if %}`/`{% endif %}`, `{% for %}`/`{% endfor %}`, `<div>`, `<script>`) e de chaves do CSS
- Renderização real via motor de template do Django, com objeto `det` fake construído a partir das próprias dataclasses (modificadas) e os números exatos do mockup aprovado (pulverizador SS20-B) — testados os 2 cenários da contraprova (disponível e indisponível)

## Verificação (depois da entrega, no repositório real sincronizado)

Matheus aplicou o script, commitou, e pediu sincronização. Conferido por leitura estática do repositório já sincronizado (sem rodar o projeto): cada símbolo novo aparece 1x nos 4 arquivos reais (zero duplicação), sintaxe Python válida. Validação visual/funcional real (abrir o modal, ver as 2 abas e as 2 contraprovas de verdade) ainda não foi feita.

## Pendências

- Matheus validar visualmente o modal real contra o mockup v9 aprovado (as 2 abas + as 2 contraprovas)
- Confirmar `manage.py check` limpo
- Replicar a estrutura de 2 Visões pros outros 5 marketplaces é decisão em aberto — não discutida ainda, escopo desta rodada foi só ML
