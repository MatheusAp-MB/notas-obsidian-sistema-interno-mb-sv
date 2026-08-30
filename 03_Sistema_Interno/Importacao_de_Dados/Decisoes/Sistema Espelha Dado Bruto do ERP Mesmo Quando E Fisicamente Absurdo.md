---
tipo: decisao
dominio: banco_de_dados
status: ativa
criado: 15/08/2026
atualizado_em: 15/08/2026 03:50
relacionado: [Produto Nasce Exclusivamente do ERP, Redesenho do Popular Banco - Fontes de Dados e Escopo, Integridade e Fonte Unica de Dado]
---

# Sistema Espelha Dado Bruto do ERP Mesmo Quando É Fisicamente Absurdo

## Contexto — como isso apareceu

Durante a validação real do redesenho do `popular_banco` (ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]), a importação encontrou 118 produtos com dimensão de embalagem fisicamente impossível no ERP — exemplo real: um produto com peso cúbico calculado em mais de 1 milhão de kg, a partir de medidas como 6000×2900×4800 centímetros (quase certamente erro de digitação na origem, tipo unidade errada). Eu (Claude) propus zerar essas dimensões absurdas antes de salvar no banco, achando que era um bug a corrigir. O usuário corrigiu: não é bug, é o comportamento certo, e explicou o motivo abaixo.

## A regra

O sistema precisa ser um espelho fiel do ERP — **inclusive quando o dado do ERP está errado**. Isso é proposital: só guardando o dado exatamente como veio (mesmo quando é obviamente errado) é que dá pra depois gerar um relatório de inconsistência e mostrar pro time que aquele SKU específico precisa ser corrigido na origem (no ERP). Se o sistema "arrumasse" o dado sozinho — zerando, escondendo ou ignorando — ninguém saberia que existe um problema de cadastro pra corrigir. O objetivo aqui não é ter dado bonito, é ter visibilidade real do que está errado.

## A distinção importante: dado bruto do ERP vs. dado que o próprio sistema calcula

- **Dado bruto do ERP** (ex: `altura_produto_apos_embalado`, `largura_produto_apos_embalado`, `comprimento_produto_apos_embalado`) — sempre salvo exatamente como veio da planilha, mesmo quando o valor é absurdo. É informação do ERP, não nossa — não temos autoridade pra "corrigir" ela.
- **Dado que o PRÓPRIO sistema calcula** (ex: `peso_cubado`, calculado por nós a partir das 3 dimensões acima) — quando o cálculo dá um resultado fisicamente impossível, esse campo fica em branco (`None`) em vez de guardar um número que já sabemos que está errado. A diferença: isso não é "esconder dado do ERP", é uma conta NOSSA que decidimos não fazer, porque o resultado não serve pra nada de bom — alimentar um cálculo de frete/precificação com "peso de 1 milhão de kg" seria pior do que simplesmente não ter esse dado.

## Como isso conversa com [[Integridade e Fonte Unica de Dado]]

Essa regra já existente diz que "a primeira função que toca o dado bruto é responsável por limpar, processar e organizar, devolvendo dado polido". Isso continua valendo — só que "limpar/organizar" ali quer dizer conversão de TIPO e FORMATO (célula de Excel virar `Decimal` de verdade, metro virar centímetro, texto sujo virar campo do model) — nunca decidir sozinho que um valor plausível-porém-errado deve ser descartado. As 2 regras não se contradizem: uma cuida da FORMA do dado (sempre organizado, tipado, nunca dict solto), a outra cuida da FIDELIDADE do dado (espelha o ERP, não sanitiza o conteúdo).

## Consequência pendente, não resolvida agora

Essas dimensões brutas (mesmo absurdas) vão alimentar `organizar_e_verificar_divergencias_dimensoes_envio` assim que a integração do Mercado Livre voltar a rodar de verdade (hoje essa etapa roda com "0 variações", porque as etapas do ML estão comentadas — ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]) — e a partir daí essas dimensões entram em cálculo real de frete/precificação. Quando isso acontecer, vale decidir se o CÁLCULO de frete/grade precisa da própria trava contra dimensão impossível — isso é um problema separado desta decisão (que é sobre ARMAZENAR o dado, não sobre CALCULAR com ele).

## Relacionado

- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Produto Nasce Exclusivamente do ERP]]
- [[Integridade e Fonte Unica de Dado]]
