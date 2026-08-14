---
tipo: decisao
dominio: 
status: ativa
criado: 14/08/2026
atualizado_em: 14/08/2026 09:55
relacionado: [Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro, Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Disciplina de Testes Automatizados, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]
---

# Reorganização de Nomenclatura de Campos XML e Cadastro na API Sysemp

## Contexto

A API do Sysemp mudou de schema (aviso registrado em 13/08/2026, sem mapeamento na época — ver [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]). Muitos campos agora chegam em par: 1 valor vindo do XML da nota fiscal (fonte única de verdade, ver [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]) e 1 valor vindo do Cadastro do produto no Sysemp — guardado especificamente pra comparar os dois e detectar cadastro desatualizado no ERP no futuro (não é redundância, é auditoria — motivo dado pelo usuário sobre o TES: "importante pra corrigir uma outra coisa no futuro").

## Decisão — sufixo explícito nos dois lados, sempre

Toda vez que um campo existir em par XML/Cadastro, os DOIS lados ganham sufixo explícito (`_xml`/`_cadastro`) — nunca um lado implícito/sem sufixo. Motivo verbatim do usuário: "eu quero explicito '_xml' e '_cadastro' para nao ter margem de erro." Vale mesmo quando um dos dois lados não tem par real (ex: `tes_saida_cadastro`, `natureza_operacao_cadastro` não têm equivalente XML — ainda assim levam o sufixo, pra nunca haver ambiguidade sobre de onde vieram).

## Decisão — nome completo, não abreviação (2 exceções deliberadas)

Nome de campo/atributo usa a palavra completa, nunca abreviação, pra ficar não ambíguo e legível (ex: `nr_nf` → `numero_nf`, `descricao_produto` → `nome_produto`). **2 exceções, mantidas de propósito por serem jargão consolidado do domínio fiscal:** `CST` e `TES` continuam abreviados — decisão explícita do usuário ("TES é autoexplicativo por ser jargão deve ser mantido", "mantenha CST").

## Decisão — consolidação de `DadosNF` + `IdentificadorRegra` em `ClassificacaoFiscalItem`

As 2 dataclasses antigas (`DadosNF`: fornecedor/chave/cfop/natureza_da_operacao; `IdentificadorRegra`: tes_saida/ncm/origem/origem_descricao) estavam separadas de forma artificial — nenhuma representava um conceito de domínio coeso por si só. `fornecedor`/`chave` foram absorvidos por `IdentificacaoNF` (são identificação da nota, não classificação fiscal do item). O resto foi consolidado numa dataclass nova e coesa: `ClassificacaoFiscalItem`.

## Estrutura final (`integracao_sysemp/servicos/dados_xml_nf.py`)

- **`IdentificacaoProduto`**: `id_produto_sysemp`, `nome_produto`, `codigo_barras`, `codigo_auxiliar`, `codigo_fabricante`, `quantidade_nota`.
- **`IdentificacaoNF`**: `numero_nf`, `chave_acesso_nf`, `fornecedor`, `data_emissao_nf`, `data_entrada_nf`.
- **`ClassificacaoFiscalItem`**: `natureza_operacao_cadastro`, `ncm_xml`, `ncm_cadastro`, `cfop_xml`, `cfop_cadastro`, `origem_mercadoria_xml`, `origem_mercadoria_cadastro`, `descricao_origem_mercadoria_xml`, `descricao_origem_mercadoria_cadastro`, `tes_saida_cadastro`.
- **`IcmsSt`**: `base_calculo`, `aliquota`, `reducao`, `valor` (sem `cst`).
- **`Icms`**: `cst_xml`, `cst_cadastro`, `base_calculo`, `aliquota`, `reducao`, `valor`.
- **`IcmsRet`**: `base_calculo` (renomeado de `base` — inconsistência antiga corrigida, era o único imposto que não usava esse nome), `valor`.
- **`Ipi`**: `cst_xml`, `cst_cadastro`, `base_calculo`, `aliquota`, `valor` (sem redução).
- **`Pis`/`Cofins`**: `cst_xml`, `cst_cadastro`, `base_calculo`, `aliquota`, `reducao` (calculada, nunca vem bruta da API — ver [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]), `valor`.
- **`Custos`**: `total`, `unitario` (sem mudança — evita repetir "custo" no próprio nome do campo).
- **`DadosXmlNF`**: compõe todas as anteriores.

## Espelhado em `impostos/models.py`

- `ImpostosECustosXMLEntradaProduto.ncm` (campo único) virou `ncm_xml`/`ncm_cadastro` (os 2, `null=True, blank=True`).
- `IcmsEntradaProduto`/`IpiEntradaProduto`/`PisEntradaProduto`/`CofinsEntradaProduto` ganharam `cst_xml` (renomeado de `cst`, continua obrigatório) e `cst_cadastro` (novo, `null=True, blank=True` — produtos já sincronizados antes desta mudança ficam `None` até reprocessar).
- `IcmsRetEntradaProduto.base` renomeado pra `base_calculo`.
- Migração real aplicada com sucesso, com 1 quase-erro pego antes de rodar `migrate` — ver [[Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro]].

## Assimetria deliberada — `_int_ou_zero`/`_float_ou_zero`

Os helpers de null-safety (decisão de 10/08/2026) continuam valendo só pros 6 campos de imposto originais — decisão não expandida por esta reorganização. `tes_saida_cadastro` usa `int()` puro (estoura em `null`) — está fora do escopo daquela decisão de propósito, não incluído por engano.

## Implementado e validado (14/08/2026)

- `dados_xml_nf.py` e `impostos/models.py` reescritos por completo, migração aplicada.
- Todos os consumidores diretos de campo cru (não só das dataclasses) corrigidos: `filtro_cfop.py` (`'CFOP'` → `'CFOP XML'`), `selecao_nota_recente.py` (`'Data Entrada da Nota'` → `'Entrada NF'`), fixture própria de `test_nivel_3__orquestrador.py`.
- Testes atualizados nos 3 arquivos diretamente afetados (`test_nivel_0__dados_xml_nf.py`, `test_nivel_3__impostos_e_custos_xml_entrada_produto.py`, `test_nivel_3__orquestrador.py`) + 2 arquivos de teste próprios dos consumidores de chave crua (`test_nivel_0__filtro_cfop.py`, `test_nivel_0__selecao_nota_recente.py`).
- 3 testes de regressão novos, criados especificamente contra risco de troca XML↔Cadastro (motivados pelo quase-erro da migração): `test_classificacao_fiscal_item_nao_confunde_xml_com_cadastro`, `test_icms_cst_xml_e_cst_cadastro_nao_se_confundem`, `test_ncm_xml_e_ncm_cadastro_persistem_distintos`.
- **Achado — teste "falso verde":** `test_nivel_0__selecao_nota_recente.py` continuava passando depois do rename de `selecao_nota_recente.py`, mas só por coincidência (a fixture usava a chave antiga, a comparação por data ficava sempre `None`, e a ordenação caía inteira no desempate por NR NF — que por acaso concordava com a data esperada em todos os cenários). Corrigido pra usar a chave nova — os mesmos 5 testes continuam passando, agora pelo motivo certo.
- Cobertura de `impostos/models.py` fechada em 100% (estava 89%, faltavam `obter_detalhes_para_exibicao()` inteiro e o `__str__` dos 6 models de imposto).
- **Deixado de propósito pra depois:** `scripts_exploracao_ERP/relatorio_impostos_entrada_xlsx.py` ainda usa `IdentificadorRegra` (removida) — não corrigido porque o usuário vai reformular esse relatório por completo em breve, corrigir agora seria retrabalho.
- **Scripts legados sinalizados, não tocados** (mesma categoria já registrada em [[Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]] — exploração pontual, sem consumidor real, sem teste): `scripts_exploracao_ERP/filtrar_dados_por_cfop.py`, `selecionar_nota_mais_recente_por_produto.py`, `investigar_ocorrencias_de_produto.py`, `contar_registros_por_cfop.py` — todos ainda com chave crua antiga (`'CFOP'`, `'Data Entrada da Nota'`, `'NCM'`, `'ID Produto'`).

## Em aberto

- Reprocessar produtos já sincronizados antes desta mudança pra backfillar `cst_cadastro`/`ncm_cadastro` (ficam `None` até rodar `reprocessar_impostos_entrada_de_json` de novo).

## Relacionado

- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro]]
- [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
- [[Disciplina de Testes Automatizados]]
