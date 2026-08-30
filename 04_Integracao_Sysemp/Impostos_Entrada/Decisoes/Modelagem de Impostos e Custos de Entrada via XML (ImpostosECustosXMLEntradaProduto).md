---
tipo: decisao
dominio: 
status: ativa
criado: 09/08/2026
atualizado_em: 15/08/2026 23:25
relacionado: [Plano em Etapas do Duble de Precificacao ML, Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada, Integridade e Fonte Unica de Dado, Modelagem de Objeto e Encapsulamento, Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir, Orquestracao da Sincronizacao de Impostos de Entrada via XML, Modal de Produto — Aba Impostos (Entrada e Saida), Modal Mostrava Impostos Por Nota Em Vez de Por Unidade, Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp, Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro, Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada, Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos, CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]
---

# Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)

## Contexto

Com o `api_sysemp` oficializado e o model `SincronizacaoXmlManifestoNotaEntrada` já sincronizando o manifesto de nota de entrada, o próximo passo é preparar o banco pra receber esse dado de imposto/custo de forma completa e correta — não mais os campos genéricos e soltos que o `Produto` tem hoje (`pis_percentual`, `cofins_percentual`, etc.), herdados da era da planilha manual, sem a granularidade que a API real entrega (base de cálculo, alíquota, redução e valor, separados por tipo de imposto).

A lógica de limpar esse dado bruto já existe e já está validada contra 3 produtos reais — são as dataclasses de `dados_xml_nf.py` (`Icms`, `IcmsSt`, `IcmsRet`, `Ipi`, `Pis`, `Cofins`, `Custos`, compostas em `DadosXmlNF`). O que faltava era o lado de persistência: hoje esse dado é recalculado do zero a cada execução de script, nunca salvo.

## Decisão 1 — Sem histórico, só o retrato mais atual

Cada sincronização bem-sucedida SOBRESCREVE o registro do produto — não se guarda 1 linha por nota (diferente do padrão `CicloVideo`/`HistoricoStatusManualAgenda`). Motivo explícito do usuário: "vamos fazer funcionar primeiro, sem histórico" — histórico fica pra quando/se a necessidade real aparecer (Regra dos Três).

## Decisão 2 — Estrutura "guarda-chuva"

Em vez de 6 tabelas soltas cada uma ligada direto ao `Produto`, existe 1 tabela guarda-chuva por produto, e as 6 tabelas de imposto se ligam a ela (não ao Produto diretamente):

**`ImpostosECustosXMLEntradaProduto`** — 1 linha por Produto, sempre sobrescrita:
- `produto` (FK/1:1)
- `nr_nf`, `data_entrada_nota`, `fornecedor` — identificação de qual nota gerou esse retrato, pra rastreabilidade (mesmo sem guardar histórico completo)
- `custo_total` — dado bruto da nota, existe aqui porque o PIS/COFINS dependem dele pra calcular a redução (ver decisão 4)

`custo_unitario` **não** mora aqui — continua direto no `Produto`.

## Decisão 3 — Cada tabela de imposto só tem os campos que ela realmente tem

Nenhum campo fantasma só por uniformidade artificial. Confirmado campo a campo contra as dataclasses reais de `dados_xml_nf.py` antes de fechar o desenho:

- **ICMS**: `cst`, `base_calculo`, `aliquota`, `reducao`, `valor`
- **ICMS ST**: `base_calculo`, `aliquota`, `reducao`, `valor` (sem `cst`)
- **ICMS Ret**: `base`, `valor` (sem alíquota, sem redução — nunca foi usado até hoje, mas como vem do XML, decisão do usuário foi incluir mesmo assim: "já que vem do XML, guarda ele também")
- **IPI**: `cst`, `base_calculo`, `aliquota`, `valor` (sem redução — IPI nunca tem esse campo no domínio real)
- **PIS**: `cst`, `base_calculo`, `aliquota`, `reducao`, `valor`
- **COFINS**: mesmo formato do PIS

Todas as 6 tabelas são sempre criadas na sincronização, mesmo com valor zero — nunca fica ausente, pra não confundir "produto nunca sincronizado" com "imposto zero de verdade" (decisão explícita do usuário).

Como `base_calculo`/`aliquota`/`valor` se repetem em 4 das 5 tabelas com alíquota (ICMS, ICMS ST, IPI, PIS, COFINS), fica de pé a ideia de uma classe-base abstrata do Django só com esses 3 campos comuns — decisão de implementação, não muda o desenho.

**Atualizado 14/08/2026:** esta lista de campos ficou parcialmente desatualizada com a reorganização de nomenclatura da API (campos em par XML/Cadastro) — ver seção "Implementado e validado (14/08/2026)" abaixo e [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]] pro esquema atual completo.

## Decisão 4 — Redução do PIS/COFINS continua calculada, não bruta

Igual já documentado em [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]: a API não devolve "Redução PIS"/"Redução COFINS" direto (só devolve pra ICMS/ICMS ST) — é derivada de `base_calculo` (do próprio PIS/COFINS) e `custo_total` (do guarda-chuva). Mesma regra de [[Integridade e Fonte Unica de Dado]] já aplicada nas dataclasses: calculada 1 vez no momento de gravar, guardada como campo comum — nunca recalculada por fora.

## Decisão 5 — Decimal, não float

As dataclasses de processo (`dados_xml_nf.py`) continuam com `float` — são objetos de memória, de vida curta. Nos models do banco, os campos monetários/percentuais (`base_calculo`, `aliquota`, `reducao`, `valor`, `base`, `custo_total`) usam `DecimalField` — float acumula erro de arredondamento, o que é inaceitável em dado fiscal persistido.

## Decisão 6 — Reforma, não remendo

Decisão explícita do usuário sobre os campos genéricos que já existem no `Produto` hoje (`pis_percentual`, `cofins_percentual`, `icms_saida_percentual`, etc.): "o que existe hoje não importa... o que importa é o que é correto de existir daqui pra frente, se algo quebrar a gente arruma depois. Não vamos ficar tentando manter o que existe e adicionar coisa nova pq vai ficar uma merda. Vamos entrar como uma obra de reforma mesmo, derruba o que precisar e reconstrói."

Ou seja: esta modelagem não está presa a manter compatibilidade com o que já existe no `Produto`. Se algo precisar ser removido/alterado pra essa estrutura ficar correta, remove — conserta o que quebrar depois, não antes.

**Reforço do usuário, vale para todo o código desta frente:** manter o mesmo alto nível de qualidade, robustez, estrutura e encapsulamento já aplicado no resto do projeto (POO, dataclass como objeto de processo, Model como objeto de persistência, responsabilidade única) — ver `02_Sistema_Interno/Regras_de_Comportamento/`.

## Mockup validado

Foi gerado um mockup visual (HTML, na conversa) mostrando `Produto` → `ImpostosECustosXMLEntradaProduto` (guarda-chuva) → as 6 tabelas-filhas, cada uma com seus campos reais. Usuário validou: "acho que isso ficou o melhor possível."

## Implementado e validado (09/08/2026 23:10)

Fase Planejar fechada e código escrito, migrado e testado:

- **App**: `impostos` — novo, dedicado, nome genérico de propósito (domínio "impostos" é maior que só entrada; quando a saída precisar de verdade, ganha models próprios com sufixo "Saida" no MESMO app — nada abstraído entre os dois antes disso).
- **6 tabelas-filhas nomeadas**: `IcmsEntradaProduto`, `IcmsStEntradaProduto`, `IcmsRetEntradaProduto`, `IpiEntradaProduto`, `PisEntradaProduto`, `CofinsEntradaProduto` — todas ligadas ao guarda-chuva por `OneToOneField`. Classe-base abstrata `ImpostoComAliquota` (`base_calculo`/`aliquota`/`valor`) reaproveitada por 5 das 6 (ICMS Ret não herda — não tem alíquota).
- **Pipeline**: `ImpostosECustosXMLEntradaProduto.sincronizar_a_partir_de(produto, dados: DadosXmlNF)` — único ponto de escrita, `transaction.atomic()`, sempre sobrescreve (`update_or_create`) o guarda-chuva + as 6 tabelas juntas.
- **Bug real encontrado e corrigido antes do teste**: `sincronizar_a_partir_de` passava os `float` das dataclasses direto pros campos `Decimal`, sem conversão seguro. Confirmado que `Decimal(18.1)` (direto) captura o valor binário exato (`18.10000000000000142...`), enquanto `Decimal(str(18.1))` dá o valor correto (`18.1`) — Django usa o caminho impreciso quando recebe float puro (`DecimalField.to_python` → `context.create_decimal_from_float`). Corrigido com helper dedicado `_converter_para_decimal(valor: float) -> Decimal`, usado em toda gravação.
- **Migração** (`impostos.0001_initial`) aplicada com sucesso, 7 tabelas criadas.
- **Teste pytest Nível 3** (`impostos/tests/test_nivel_3__impostos_e_custos_xml_entrada_produto.py`): 13 testes reais + 1 xfail proposital, **100% cover / 0 Miss / 0 BrPart** em `impostos/models.py`. Cobre: 1ª sincronização cria tudo, 2ª sobrescreve sem duplicar, `data_entrada_nota` string→date e None, redução de PIS/COFINS repassada intacta (nunca recalculada aqui), as 6 tabelas sempre criadas juntas (mesmo ICMS Ret zerado), falha no meio desfaz tudo via `transaction.atomic()` (provado com monkeypatch), e `__str__` das 6 tabelas-filhas (parametrizado, `ids=` explícito).
- **Ponto de atenção conhecido, aceito por ora**: o teste importa `DadosXmlNF` de verdade de `scripts_exploracao_ERP/dados_xml_nf.py` — pasta temporária de exploração. Resolve quando essa dataclass for oficializada (mesmo caminho do `api_sysemp`, ainda não feito).

## Implementado e validado (10/08/2026 00:55)

O serviço que chama a API, filtra, seleciona e aciona `sincronizar_a_partir_de` com dado real foi escrito e testado (Nível 0 + Nível 3, `ApiSysemp` mockada, 100% cover/0 Miss/0 BrPart) — ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]] pro desenho completo.

## Implementado e validado (10/08/2026, 15:30) — exibição no modal + 3 campos novos

Ao construir a aba Impostos do modal de produto (ver [[Modal de Produto — Aba Impostos (Entrada e Saida)]]), achado que faltava persistir 3 campos que já vinham parseados de `dados_xml_nf.py` mas nunca gravados no guarda-chuva:

- `quantidade_nota` e `custo_unitario` — sem eles não tinha como converter `base_calculo`/`valor` de cada imposto de "por nota" pra "por unidade" (achado motivado pela comparação com o dublê — ver [[Modal Mostrava Impostos Por Nota Em Vez de Por Unidade]]).
- `emissao` (Data de Emissão) — mesma situação, campo já existia em `dados.identificacao_nf.emissao`.

Os 3 são `null=True/blank=True` — produtos já sincronizados antes dessa mudança ficam `None` até serem reprocessados (novo management command `reprocessar_impostos_entrada_de_json`, que relê o json já em disco sem chamar a API de novo).

Novo método `obter_detalhes_para_exibicao()` no guarda-chuva — só ponto que converte pra "por unidade" e monta as dataclasses de exibição (`LinhaImpostoEntrada`, `DetalhesImpostosEntradaProduto`), nunca recalculado no template.

## Implementado e validado (14/08/2026) — reorganização de campos XML/Cadastro

A API do Sysemp mudou de schema (aviso registrado em 13/08) — vários campos passaram a chegar em par XML/Cadastro. Reorganização completa de nomenclatura fechada e implementada — decisão de convenção, mapeamento de campo e detalhe de migração em nota própria: [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]].

Mudanças que afetam diretamente esta modelagem:
- `ImpostosECustosXMLEntradaProduto.ncm` (campo único) → `ncm_xml`/`ncm_cadastro` (os 2, `null=True, blank=True`).
- `IcmsEntradaProduto`/`IpiEntradaProduto`/`PisEntradaProduto`/`CofinsEntradaProduto.cst` → `cst_xml` (renomeado, continua obrigatório) + `cst_cadastro` (novo, `null=True, blank=True`).
- `IcmsRetEntradaProduto.base` → `base_calculo` (inconsistência antiga corrigida — era o único imposto que não seguia esse nome).
- `DadosNF`/`IdentificadorRegra` (dataclasses de processo) consolidadas em `ClassificacaoFiscalItem`.

Migração real aplicada com sucesso, com 1 quase-erro pego antes de rodar `migrate` — ver [[Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro]]. Cobertura de `impostos/models.py` fechada em 100% (estava 89% — faltavam `obter_detalhes_para_exibicao()` inteiro e o `__str__` dos 6 models de imposto).

## Implementado e validado (14/08/2026, 11:15) — Empresa Fantasia e FCP ST

2 campos que já existiam na API mas nunca tinham sido usados foram promovidos a campo oficial, motivados pelo relatório novo que o usuário vai apresentar ao superior:
- `empresa_fantasia` — novo em `IdentificacaoNF`/no guarda-chuva, `null=True/blank=True`.
- `aliquota_fcp`/`valor_fcp` — novos em `IcmsSt`/`IcmsStEntradaProduto` (Fundo de Combate à Pobreza, adicional que acompanha o ICMS ST), mesmo tratamento `null→0` dos demais campos de imposto, `null=True/blank=True` no model.

Migração pura adição, sem prompt de rename ambíguo (diferente do caso do `ncm`). Validado com pytest real em 2 rodadas — a 1ª expôs 4 testes de integração quebrados por uma fixture desatualizada (`test_nivel_3__orquestrador.py`, não pega no grep inicial por nome de dataclass); corrigida, resultado final **528 passed, 0 failures no domínio, 12 xfailed**. Ver [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]] pro desenho completo e [[Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos]] pra causa raiz do efeito cascata.

## Implementado e validado (15/08/2026, 23:25) — 8 campos novos + correção do CST/CSOSN

Motivado pela continuação do redesenho da aba Impostos do modal de produto (ver [[Modal de Produto — Aba Impostos (Entrada e Saida)]]):

- **8 campos novos no guarda-chuva `ImpostosECustosXMLEntradaProduto`**, todos `null=True/blank=True`, migrados por 3 migrations (`0008`, `0009`, `0010`): `id_produto_sysemp` (PositiveIntegerField), `codigo_auxiliar` (CharField 50), `cfop_xml`/`cfop_cadastro` (CharField 10), `origem_mercadoria_xml`/`origem_mercadoria_cadastro` (CharField 5), `descricao_origem_mercadoria_xml`/`descricao_origem_mercadoria_cadastro` (CharField 255), `natureza_operacao_cadastro` (CharField 255), `tes_saida_cadastro` (PositiveIntegerField). Mesmo padrão de sempre: já vinham parseados em `dados_xml_nf.py`, nunca persistidos.
- **Bug real corrigido: `cst_xml`/`cst_cadastro` perdiam o zero à esquerda** ("00" virava `0`) e não suportavam CSOSN (código de 3 dígitos do regime Simples Nacional — achado real em produção, `impostos_e_custos_id=673`, CSOSN "102"). Campo migrado de `PositiveSmallIntegerField` pra `CharField(max_length=3)` em `IcmsEntradaProduto`/`IpiEntradaProduto`/`PisEntradaProduto`/`CofinsEntradaProduto`, com a causa raiz corrigida uma camada acima, em `dados_xml_nf.py`. Detalhe completo, incluindo o diagnóstico da migração que falhou no meio (MySQL não é transacional em DDL), em [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]].
- Validado: 542 passed (6 falhas pré-existentes sem relação). Commit `5ccda18` na branch `dev`.

## Em aberto (próximos passos reais)

- **Reprocessar produtos já sincronizados** pra backfillar `cst_cadastro`/`ncm_cadastro`, `empresa_fantasia`/`aliquota_fcp`/`valor_fcp` (14/08/2026) **e agora também os 8 campos novos de 15/08/2026 (CFOP, Origem, Natureza, TES, ID Produto Sysemp, Código Auxiliar) e o CST/CSOSN corrigido** — mesmo comando `reprocessar_impostos_entrada_de_json` já existente, ainda não rodado pra esse fim.
- Migrar as 6 fórmulas de precificação pra ler destas tabelas novas em vez dos campos genéricos do `Produto` (`icms_entrada`, `ipi`, `pis_cofins`) — decisão futura separada, sem prazo.
- ~~Oficializar `dados_xml_nf.py` fora de `scripts_exploracao_ERP/`.~~ — feito (10/08, 12:05).
- ~~Rodar a sincronização de verdade contra a API real pela 1ª vez.~~ — feito (10/08, 02:00).

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Sincronizacao Incremental com Watermark para Manifesto de Notas de Entrada]]
- [[Integridade e Fonte Unica de Dado]]
- [[Modelagem de Objeto e Encapsulamento]]
- [[Calculo de Reducao PIS e COFINS via Base de Calculo e Custo Total]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
- [[Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro]]
- [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]]
- [[Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos]]
- [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]]
