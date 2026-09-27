---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 27/09/2026
atualizado_em: 27/09/2026 18:39
relacionado: [Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando, Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido, Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo, Comando Nativo migrate Do Django Cai Silenciosamente no Banco Default Sem --database Obrigatorio]
resumo: "popular_banco quebrava com ValueError: All bulk_update() objects must have a primary key set na etapa FRETE ML, nos 2 bancos — causa raiz real (planilha real analisada): o layout de colunas mudou por completo (peso_min/peso_max saiu de J/K pra B/C) e uma coluna nova 'Regime' introduziu uma 2ª tabela de frete inteira (Frete Grátis Rápido) que o model FreteML não tinha campo pra guardar. CORRIGIDO ponta a ponta: novo campo FreteML.regime, migração, importador reescrito pros índices certos, e todos os consumidores (cálculo de margem, grade de precificação, tela HTML) atualizados. CONFIRMADO em produção real, 27/09 18:39: popular_banco rodado do zero nas 2 empresas com migrate --database explícito, FRETE ML batendo exato (480 criados / 0 atualizados / 0 regime não reconhecido / 0 erros) nas 2, zero regressão nas outras 17 etapas."
---

# Importação de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada

**Resumo**: o comando `popular_banco` quebrava, na etapa FRETE ML, com o erro `ValueError: All bulk_update() objects must have a primary key set` — acontecia nos 2 bancos (Magazine e Samvale). A hipótese inicial (chave duplicada por erro de digitação na planilha) estava incompleta. Analisando a planilha real de referência (`Tabela_Frete_Mercado_Livre.xlsx`), a causa de fundo era outra: o layout de colunas mudou por completo, e uma coluna nova "Regime" representa uma 2ª tabela de frete real (Frete Grátis Rápido) que o sistema não tinha onde guardar. Corrigido ponta a ponta: model, migração, importador e todos os consumidores — e confirmado rodando de verdade em produção nos 2 bancos.

> [!success] CORRIGIDO em 27/09/2026, 18:26 — CONFIRMADO em produção em 27/09/2026, 18:39
> **O quê**: `FreteML` ganhou o campo `regime` (Sem/Com Frete Grátis Rápido, `TextChoices`), o importador foi reescrito pros índices de coluna certos da planilha nova, e todo consumidor de `FreteML` — cálculo de margem, grade de precificação (Goal Seek), tela HTML da tabela de frete — passou a considerar o regime.
> **Onde foi corrigido**: `mercado_livre/models/frete_ml.py`, `core/management/commands/popular_banco_suporte/importar_tabela_frete_ml.py`, `mercado_livre/funcoes_auxiliares/calculo_margem.py`, `mercado_livre/funcoes_auxiliares/montar_linhas_precificacao.py`, `precificacao/funcoes_auxiliares/mercado_livre/formula_precificacao.py`, `mercado_livre/views.py` + template/CSS/JS da tela de frete, `mercado_livre/management/commands/gerar_relatorio_frete_erp_vs_ml.py`.
> **Confirmado rodando de verdade**: `migrate --database=magazine`/`--database=samvale` + `popular_banco --empresa=magazine`/`--empresa=samvale` completos, do zero, nas 2 empresas — ver ### Validação final em produção abaixo.

## Contexto — o que é a importação de Frete ML

O comando `popular_banco` roda uma sequência de ~18 etapas de importação de dado real (arquivo `core/management/commands/popular_banco.py`), uma delas chamada **FRETE ML** — lê a planilha `Arquivos usados para Popular Banco/Tabelas de Frete/Tabela_Frete_Mercado_Livre.xlsx` e grava o resultado no model `FreteML` (arquivo `mercado_livre/models/frete_ml.py`). Cada linha do banco representa **1 célula de uma matriz**: uma combinação de faixa de peso (`peso_min`/`peso_max`, em kg) × faixa de preço (`preco_min`/`preco_max`, em R$) → o valor do frete pra essa combinação.

Quem faz a importação é a classe `ImportadorFreteML` (mesmo arquivo, `core/management/commands/popular_banco_suporte/importar_tabela_frete_ml.py`). O fluxo dela: (1) `carregar_existentes()` lê tudo que já existe no banco pra um dicionário Python; (2) `processar_linhas()` percorre a planilha inteira, e pra cada célula chama `_registrar_linha()`; (3) `salvar()`, no final, grava tudo de uma vez — `bulk_create` pros registros novos e `bulk_update` pros que já existiam.

## O problema

Rodando `popular_banco --empresa=magazine` e `popular_banco --empresa=samvale` contra os 2 bancos **recém-migrados e recém-semeados** (banco vazio antes de rodar, populado pela 1ª vez), a etapa FRETE ML quebrava nos 2, com o mesmo traceback:

```text
File "...\importar_tabela_frete_ml.py", line 152, in salvar
    FreteML.objects.bulk_update(
        self.para_atualizar, ['peso_max', 'preco_max', 'valor'], batch_size=BATCH_SIZE_PADRAO
    )
ValueError: All bulk_update() objects must have a primary key set.
```

Isso interrompia o `popular_banco` inteiro — nenhuma das etapas seguintes chegava a rodar, nos 2 bancos.

## O que já se sabia até 27/09, 17:50 (hipótese inicial de investigação — refinada abaixo em ## Correção)

**Mecanismo exato, achado lendo o código** (`_registrar_linha`, linhas 130-145 de `importar_tabela_frete_ml.py`):

```python
def _registrar_linha(self, linha):
    chave = (linha.peso_min, linha.preco_min)
    existente = self.existentes.get(chave)
    if existente:
        existente.peso_max = linha.peso_max
        existente.preco_max = linha.preco_max
        existente.valor = linha.valor
        self.para_atualizar.append(existente)
    else:
        novo = FreteML(
            peso_min=linha.peso_min, peso_max=linha.peso_max,
            preco_min=linha.preco_min, preco_max=linha.preco_max,
            valor=linha.valor,
        )
        self.para_criar.append(novo)
        self.existentes[chave] = novo  # <- aqui está o problema
```

Quando uma célula nova é criada (`else`), o código guarda esse objeto `novo` — que só existe em memória, ainda **sem `pk`**, porque o `bulk_create` só roda no final, dentro de `salvar()` — dentro do mesmo dicionário `self.existentes` que também guarda os registros que **já vieram do banco de verdade**. Se a mesma chave `(peso_min, preco_min)` aparecesse de novo, `_registrar_linha` achava esse objeto no dicionário e assumia, por engano, que ele já existia no banco — empurrava ele pra `self.para_atualizar`. Na hora de salvar, o `bulk_update` tentava atualizar um registro que nunca foi salvo, e quebrava.

**Por que isso nunca tinha aparecido antes**: com o banco já populado de execuções anteriores, a maioria das células já vinha do banco de verdade (com `pk` real) — a brecha só aparecia quando o banco começava **vazio**.

**Explicação de Matheus na hora, antes da análise da planilha real**: ele tinha alterado o arquivo `Tabela_Frete_Mercado_Livre.xlsx` sem atualizar `importar_tabela_frete_ml.py` de acordo — a hipótese na hora era uma chave repetida (erro de digitação) na planilha nova. Essa hipótese, embora apontasse na direção certa (a planilha mudou e o comando não acompanhou), estava incompleta — ver ## Correção abaixo com o diagnóstico real, feito depois de analisar a planilha de verdade.

## Correção

### A causa raiz real (planilha `Tabela_Frete_Mercado_Livre.xlsx` analisada de verdade)

Não era chave duplicada por erro de digitação — o layout de colunas da planilha mudou por completo:

- `peso_min`/`peso_max`: estavam nas colunas J/K (índices 9/10), passaram pra B/C (índices 1/2).
- Nova coluna **"Regime"** na D (índice 3): texto `"Sem Frete Grátis Rápido"` ou `"Com Frete Grátis Rápido"`.
- Nova coluna "free_shipping" na E (índice 4).
- As 8 faixas de preço reais: eram B-I (índices 1-8), passaram pra F-M (índices 5-12).
- Sentinela de "sem limite superior de peso": era um número gigante (`>=999999999`), virou o texto literal `"sem limite"`.

O ponto mais importante: a coluna "Regime" não é metadado cosmético — ela representa uma **2ª tabela de frete real e completa** (30 faixas de peso × 2 regimes × 8 faixas de preço = 480 células no total), que o model `FreteML` não tinha nenhum campo pra guardar. O `ValueError` de `bulk_update` era sintoma de 2ª ordem: como o importador antigo lia os índices de coluna errados, os valores de `peso_min`/`peso_max` saíam como lixo, e coincidências desse lixo geravam falsas colisões de chave — daí a aparência de "chave duplicada".

### A correção aplicada (ponta a ponta — decisão de Matheus foi corrigir tudo, não um patch mínimo)

1. **Model** (`mercado_livre/models/frete_ml.py`): novo campo `regime` (`FreteML.Regime` — `TextChoices` com `SEM_FRETE_GRATIS_RAPIDO`/`COM_FRETE_GRATIS_RAPIDO`, default `SEM_FRETE_GRATIS_RAPIDO`), nova `UniqueConstraint` em `(peso_min, preco_min, regime)`, `ordering` atualizado pra incluir `-regime`.
2. **Migração**: `0029_alter_freteml_options_freteml_regime_and_more.py` (gerada por Matheus com `makemigrations`, aplicada nos 2 bancos com `--database` explícito).
3. **Importador** (`importar_tabela_frete_ml.py`): reescrito com os índices de coluna certos (`COLUNA_PESO_MIN=1`, `COLUNA_PESO_MAX=2`, `COLUNA_REGIME=3`, `COLUNA_INICIO_PRECOS=5`), reconhecendo o texto `"sem limite"` como sentinela junto do sentinela numérico antigo, mapeando o texto de cada regime pro valor do `TextChoices` (`REGIME_POR_TEXTO_PLANILHA`), com a chave de "já existe" agora sendo a tripla `(peso_min, preco_min, regime)`. O bug de código original também foi corrigido: `_registrar_linha()` agora checa `existente.pk is not None` antes de empurrar pra `para_atualizar` — um objeto criado nesta mesma rodada, ainda sem `pk`, nunca mais é tratado como já existente no banco.
4. **Consumidores** — todos ganharam parâmetro `regime=None`, default `FreteML.Regime.SEM_FRETE_GRATIS_RAPIDO` (preserva 100% do comportamento/números de produção já que nenhuma parte do sistema ainda persiste se um anúncio específico do ML tem Frete Grátis Rápido): `calculo_margem.py` (`buscar_frete`/`calcular_margem`), `montar_linhas_precificacao.py` (`montar_linhas_candidatas`), `formula_precificacao.py` (`FormulaPrecificacao`, motor do Goal Seek/Grade de Precificação). `goal_seek.py::resolver_preco_por_margem` não precisou de mudança — só mexe em `.preco_min`/`.preco_max`/`.valor` de candidatos já pré-filtrados.
5. **Tela HTML da tabela de frete** (`mercado_livre/views.py` + `estrutura_tabela_frete_ml.html` + `layout_tabela_frete_ml.css` + `script_tabela_frete_ml.js`): passou a mostrar **1 tabela única com 2 linhas por faixa de peso** (rowspan no peso, 1 linha por regime, na ordem fixa Sem → Com), calculadora com seletor de regime, destaque de célula (JS) casando também por `data-regime`.
6. **Relatório frete ERP vs ML** (`gerar_relatorio_frete_erp_vs_ml.py`): filtrado explicitamente pro regime `SEM_FRETE_GRATIS_RAPIDO`, preservando o comportamento de antes de existir a coluna Regime.

### Validação (simulação isolada, 27/09, 18:26)

Simulação isolada com a lógica antiga contra a planilha real reproduziu o erro exato (88 falsas colisões, valores de peso como lixo). Rodando o importador novo contra a mesma planilha real: **480 linhas criadas, 0 colisões, 0 regimes não reconhecidos, 0 erros** (30 faixas de peso × 2 regimes × 8 faixas de preço — bate exato com o total esperado). Matheus aplicou a mudança de ponta a ponta (18 arquivos no total, incluindo model/migração/importador/consumidores/tela), confirmado via `git diff --stat` + revisão arquivo a arquivo — tudo bateu exato com o que foi proposto.

### Validação final em produção (27/09, 18:39)

Matheus rodou a sequência completa, do zero, nas 2 empresas: `migrate --database=magazine`/`--database=samvale` (sem alterações a aplicar — migração já tinha sido aplicada antes) seguido de `popular_banco --empresa=magazine`/`--empresa=samvale` inteiro. Resultado real da etapa FRETE ML, nos 2 bancos:

```text
MAGAZINE: Criados: 480 | Atualizados: 0 | Regime não reconhecido: 0 | Erros: 0
SAMVALE:  Criados: 480 | Atualizados: 0 | Regime não reconhecido: 0 | Erros: 0
```

Números idênticos à simulação, nas 2 empresas — confirmando o fix em produção real, não só em ambiente de teste. As outras ~17 etapas do `popular_banco` (produtos ERP, anúncios ML, frete Magalu/TikTok/Amazon, dimensão de envio, 6 grades de precificação, recomendação de precificação) rodaram sem nenhum erro de assert nas 2 empresas — zero regressão introduzida pela mudança. Os achados sinalizados durante a importação (embalagens com dimensão fisicamente absurda no ERP da Magazine, EANs sem produto correspondente, etc.) são qualidade de dado do ERP já esperada e documentada em outras notas, sem relação com este bug.

**Bug fechado — corrigido e confirmado em produção real nas 2 empresas.**

## Exemplo de ponta a ponta

Linha da planilha: peso `0` a `0,3` kg, coluna Regime = "Sem Frete Grátis Rápido" → `_registrar_linha` cria `FreteML(peso_min=0, peso_max=0.3, regime=SEM_FRETE_GRATIS_RAPIDO, ...)`. A mesma faixa de peso `0` a `0,3` kg aparece de novo mais adiante na planilha, agora com Regime = "Com Frete Grátis Rápido" — antes, a chave `(peso_min=0, preco_min=X)` batia com a 1ª linha e o importador tentava "atualizar" um objeto sem `pk` (erro); agora, a chave `(peso_min=0, preco_min=X, regime=COM_FRETE_GRATIS_RAPIDO)` é reconhecida como uma célula distinta, e as 2 linhas convivem no banco como registros separados — exatamente o formato de "1 tabela única com 2 linhas" que Matheus pediu.

## Relacionado

- [[Fim do Fallback Silencioso pro Banco Default e Padronizacao de --empresa em Minusculo em Todo Comando]]
- [[Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visivel — Caminho Antigo Nunca Corrigido]]
- [[Frete ML Passa a Modelar as 2 Tabelas Reais de Frete (Regime Sem e Com Frete Gratis Rapido) via Campo Regime Novo]]
- [[Comando Nativo migrate Do Django Cai Silenciosamente no Banco Default Sem --database Obrigatorio]]
