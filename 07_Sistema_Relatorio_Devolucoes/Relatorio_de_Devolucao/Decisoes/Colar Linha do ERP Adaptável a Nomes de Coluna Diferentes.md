---
tipo: decisao
dominio: js
status: concluida
criado: 09/09/2026
atualizado_em: 09/09/2026 12:00
relacionado: [Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução, Tab Apagado pelo trim() Desalinhava o Colar Linha do ERP, O .exe em Segundo Plano Disputava a Porta do runserver]
---

# Colar Linha do ERP Adaptável a Nomes de Coluna Diferentes

**Resumo**: o recurso "Colar linha do ERP" (Nova Devolução) precisa funcionar com 2 ERPs diferentes (MAGAZINE, 48 colunas, e SAMVALE, 50 colunas), com ordem de coluna diferente e, em pelo menos 1 caso, nome de coluna diferente pra mesma informação ("Canal de Vendas" vs "Canal de Venda"). Decisão: casar valor por NOME de coluna normalizado (nunca por posição), com lista de nomes alternativos (aliases) por campo, em vez de qualquer validação que trave/avise quando o formato de um ERP específico não bater com o esperado.

> [!success] Concluída — 09/09/2026
> Validado de ponta a ponta pelo usuário com linhas reais dos 2 ERPs ("KKKKK ESTA FUNCIONANDO", depois "ok funcionando corretamente"). Inclui detecção automática de Plataforma, Tipo de venda e Data da venda a partir do texto colado.

## Contexto

O usuário cola 2 linhas (cabeçalho + dados) copiadas direto da grade do ERP no navegador (Ctrl+C, que inclui Tab real entre colunas) numa textarea da tela "Nova Devolução". O JavaScript (`processarColagem`, em `script_nova_devolucao.js`) precisa extrair os campos certos dali e preencher o formulário automaticamente. O mesmo sistema atende 2 empresas com ERPs diferentes — ver [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]] pro contexto dos 2 bancos/empresas.

## A decisão

**1. Casar por nome de coluna, nunca por posição.** `valorPorColuna` é um objeto indexado pelo nome normalizado de cada coluna do cabeçalho colado; cada campo do formulário busca seu valor pelo nome, não pelo índice. Isso já resolve a diferença de ORDEM entre os 48 campos da MAGAZINE e os 50 da SAMVALE, sem precisar de nenhum mapa fixo de posição por ERP.

**2. Normalizar nome de coluna antes de comparar.** `normalizarNomeColuna(nome)` aplica `trim()`, colapsa espaços internos repetidos e converte pra maiúscula — evita falha de match por diferença cosmética de espaçamento/capitalização entre ERPs.

**3. Alias por campo, pra nome de coluna que difere de verdade entre ERPs.** `MAPEAMENTOS` guarda uma LISTA de nomes possíveis por campo (`colunas: [...]`), e `buscarValorPorAliases` tenta cada um até achar. Caso real que motivou isso: a SAMVALE usa "Canal de Venda" (singular), a MAGAZINE usa "Canal de Vendas" (plural) — mesma informação, nome de coluna diferente.

**4. Detecção de Plataforma por palavra-chave, não por valor exato.** O texto da coluna "Canal de Vendas/Venda" nunca é só o nome do marketplace — vem prefixado com o nome do ERP (ex: `"SAMVALE MERCADO LIVRE"`, `"MAGAZINE MELI FULL"`, `"MAIS CORREIOS SAMVALE"`). `detectarPlataforma` varre uma lista `DETECCAO_PLATAFORMA` de `{rotulo, chave}` procurando a `chave` como substring do texto em maiúsculo, na ordem da lista. Precisou de 2 entradas pra Mercado Livre — `'MERCADO LIVRE'` (SAMVALE escreve por extenso) e `'MELI'` (MAGAZINE abrevia) — ambas apontando pro mesmo `rotulo`.

**5. Detecção de Tipo de venda por palavra-chave.** `detectarTipoVenda` procura `'FULL'` no mesmo texto do canal — se achar, `'full'`; senão, `'comum'` (os únicos 2 valores de `TIPO_VENDA_CHOICES` no model).

**6. Rejeição explícita de bloquear/avisar quando o formato não bate.** Quando uma coluna esperada não é encontrada na colagem, ou o texto não é reconhecido, o campo simplesmente fica vazio pro usuário preencher manualmente — nunca impede o resto do preenchimento automático. A mensagem final de status foi dividida em `preenchidos` (o que deu certo) e `avisos` (o que não achou, com o nome da coluna procurada), pra diagnosticar sem travar nada.

## Por que essa decisão

A alternativa mais simples — 1 mapa fixo de índice de coluna por ERP — foi descartada de saída, porque quebraria toda vez que o layout de uma das grades do ERP mudasse (reordenar colunas é comum em relatório de ERP) e exigiria manutenção manual dobrada (1 mapa por ERP) pra cada campo novo.

Uma versão inicial da correção do bug de desalinhamento (ver [[Tab Apagado pelo trim() Desalinhava o Colar Linha do ERP]]) cogitou validar contagem de colunas e travar/avisar quando o número não batesse com o esperado — rejeitada explicitamente pelo usuário ("não é para travar e avisar, é para ser adaptavel"), que forneceu as listas reais de cabeçalho dos 2 ERPs pra fundamentar a correção em dado real, em vez de validação defensiva.

## Exemplo

Cabeçalho real MAGAZINE (48 colunas, resumido): `..., Canal de Vendas, Pedido Marketplace, Emissão, ..., Parceiro de Negócio, ..., Produto, Separado Por:`

Cabeçalho real SAMVALE (50 colunas, resumido): `BL, ..., Emissão, Nota Fiscal, ..., Pedido Marketplace, Canal de Venda, ..., Produto, ...`

Classificação Plataforma / Tipo de venda pelos canais reais das 2 empresas:

| Canal (texto do ERP) | Plataforma detectada | Tipo de venda |
|---|---|---|
| MAGAZINE AMAZON DBA | Amazon | comum |
| MAGAZINE MAGALU | Magalu | comum |
| MAGAZINE MELI | Mercado Livre | comum |
| MAGAZINE MELI FULL | Mercado Livre | full |
| MAGAZINE RAIA | Raia | comum |
| MAGAZINE SHOPEE | Shopee | comum |
| MAGAZINE TIKTOK SHOP | Tiktok Shop | comum |
| MAIS CORREIOS | Mais correios | comum |
| MAIS CORREIOS SAMVALE | Mais correios | comum |
| SAMVALE AMAZON | Amazon | comum |
| SAMVALE AMAZON FBA CLASSIC FULL | Amazon | full |
| SAMVALE MAGALU | Magalu | comum |
| SAMVALE MERCADO LIVRE | Mercado Livre | comum |
| SAMVALE MERCADO LIVRE FLEX | Mercado Livre | comum |
| SAMVALE MERCADO LIVRE FULL | Mercado Livre | full |
| SAMVALE SHOPEE | Shopee | comum |
| TIKTOK SHOP SAMVALE | Tiktok Shop | comum |

> [!warning] Ponto em aberto, não confirmado
> "SAMVALE MERCADO LIVRE FLEX" cai hoje como Tipo de venda `comum` (não tem "FULL" no texto). Não confirmado com o usuário se Flex deveria ter tratamento próprio, diferente de uma venda comum — sinalizado a ele, sem resposta ainda.

## Relacionado

- [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]
- [[Tab Apagado pelo trim() Desalinhava o Colar Linha do ERP]]
- [[O .exe em Segundo Plano Disputava a Porta do runserver]]
