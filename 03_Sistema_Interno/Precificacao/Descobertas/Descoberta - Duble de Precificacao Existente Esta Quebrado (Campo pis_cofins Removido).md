---
tipo: descoberta
dominio: python
status: confirmada
criado: 10/09/2026
atualizado_em: 10/09/2026 11:34
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]
---

# Descoberta: Duble de Precificação Existente Está Quebrado (Campo `pis_cofins` Removido)

**Resumo**: o script `scripts_exploracao_ERP/duble_precificacao_ml.py` — já existente no repositório, um passo a passo didático que mostra, com dado real de 1 produto, cada etapa da precificação do Mercado Livre — está quebrado desde 16/08/2026: a Etapa 9 lê `produto.pis_cofins`, um campo que foi removido do banco naquela data e substituído pelos campos separados `pis_percentual`/`cofins_percentual`. Rodar o script hoje quebra com `AttributeError`.

> [!success] Confirmada — 10/09/2026
> Achado por leitura direta do código e das migrations do repositório (`produtos/migrations/0001_initial.py`, `0006_produto_cofins_percentual_produto_pis_percentual_and_more.py`, `0008_remove_produto_icms_entrada_remove_produto_ipi_and_more.py`) — nenhuma execução, só leitura.

## Contexto

Durante a investigação da Camada 2 de [[Checkpoint - Inicio da Estrutura de Impostos de Saida|Impostos de Saída]] (validar se os 4 campos fiscais recém-preenchidos estão corretos), o usuário lembrou de um arquivo já existente que poderia servir de base pra essa validação — um "Duble de Precificação".

## O problema

O arquivo existe mesmo (`scripts_exploracao_ERP/duble_precificacao_ml.py`) e é exatamente o que parecia: script só-leitura, que pega 1 produto real (EAN fixo `7908050719121` — o mesmo pulverizador usado como referência nesta investigação, não é coincidência) e mostra, etapa por etapa, com fórmula abstrata + fórmula com valores reais + resultado: Produto → Dimensões → Custo Unitário (XML) → cada imposto de entrada individualmente → Custo Final → Coleta → Armazenagem → FIXO → Taxa/Denominador → Preço Final. Mas ele quebra antes de terminar — precisava confirmar onde e por quê antes de confiar nele como referência.

## O que levou à resposta

1. Na Etapa 9 (linha 557), o script lê `produto.pis_cofins` — nome de campo que não bate com o que já tinha sido confirmado no `Produto` real (`pis_percentual`/`cofins_percentual`, separados, achado registrado em [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]).
2. Rastreado nas migrations do model `Produto`: o campo `pis_cofins` (unificado) nasceu em `0001_initial.py` (05/07/2026). Em `0006_produto_cofins_percentual_produto_pis_percentual_and_more.py` (24/07/2026), os campos separados `pis_percentual`/`cofins_percentual` foram adicionados — os 2 formatos coexistiram por um tempo. Em `0008_remove_produto_icms_entrada_remove_produto_ipi_and_more.py` (16/08/2026), o campo unificado `pis_cofins` foi removido de vez do banco.
3. Conferido: não existe nenhuma `@property` ou alias no model que faça `produto.pis_cofins` continuar funcionando depois da remoção — o acesso levanta `AttributeError` direto.
4. Curiosidade: o próprio comentário no topo do arquivo já registra a decisão certa — *"PIS e COFINS seguem separados até o fim (decisão definitiva, não mais 'em aberto')"* — só a linha 557 não foi atualizada junto quando a migration rodou. Ou seja, o bug não é de entendimento, é só uma linha esquecida.

## Resposta

O Duble está quebrado desde 16/08/2026 (quase 1 mês) — aparentemente sem ninguém perceber porque não vinha sendo rodado. Além do bug, ele tem 2 limitações de cobertura: só mostra o Mercado Livre (não os outros 5 marketplaces) e, dentro do ML, só o tipo de anúncio Clássico e só a margem Padrão (não Premium, nem Mínima/Máxima/Competição).

Por isso, em vez de só consertar a linha 557, a decisão tomada (ver [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]) foi substituir esse script por um Duble novo, robusto, cobrindo os 6 marketplaces e todas as variações internas reais de cada um.

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Campos Fiscais de Saida no Codigo - 4 Existem Vazios, CST e Tabela por UF Nao Existem]]
- [[Bug Conhecido - FIXO Negativo em Raia e Magalu Pode Quebrar a Garantia de Margem do RoundUp90]]
