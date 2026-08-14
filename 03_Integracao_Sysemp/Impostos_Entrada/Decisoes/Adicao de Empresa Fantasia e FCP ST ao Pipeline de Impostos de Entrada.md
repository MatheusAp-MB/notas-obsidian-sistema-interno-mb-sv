---
tipo: decisao
dominio: 
status: ativa
criado: 14/08/2026
atualizado_em: 14/08/2026 11:15
relacionado: [Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp, Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos]
---

# Adição de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada

## Contexto

Motivado pelo próximo objetivo declarado pelo usuário: montar um relatório de impostos de entrada pra apresentar ao superior, seguindo como modelo um export real do Sysemp (`manifesto_da_nota_fiscal_de_entrada_27_...xlsx`, enviado pelo usuário). Comparando esse modelo com o que já era capturado pelo pipeline oficial, 2 campos existiam na API mas nunca tinham sido usados: `Empresa Fantasia` (nome fantasia da empresa emitente da nota) e `% FCP ST`/`Valor FCP ST` (Fundo de Combate à Pobreza, adicional que acompanha o ICMS ST). Ambos já estavam sinalizados como "sem uso confirmado" no próprio código, num comentário em `dados_xml_nf.py`.

## Decisão

Usuário confirmou: "Adicionar ao pipeline oficial" — não é campo pontual só pro script de relatório, é campo real do domínio fiscal, com todo o rigor já aplicado ao resto do pipeline (dataclass, model, migração, teste).

## Onde entrou

- `IdentificacaoNF` (`dados_xml_nf.py`) ganhou `empresa_fantasia: str`, lido de `registro['Empresa Fantasia']`.
- `IcmsSt` (`dados_xml_nf.py`) ganhou `aliquota_fcp: float`/`valor_fcp: float`, lidos de `registro['% FCP ST']`/`registro['Valor FCP ST']`, com o mesmo tratamento `null→0` (`_float_ou_zero`) já usado nos outros campos de imposto.
- `ImpostosECustosXMLEntradaProduto.empresa_fantasia` (guarda-chuva) e `IcmsStEntradaProduto.aliquota_fcp`/`valor_fcp` — os 3, `null=True, blank=True`, mesma razão dos campos aditivos anteriores (produtos já sincronizados antes da mudança não têm esse dado ainda).
- `sincronizar_a_partir_de()` atualizado pra persistir os 3.

## Por que sem valor default nas dataclasses

Nenhuma dataclass deste domínio usa valor default em campo nenhum (convenção já estabelecida, todos os campos são sempre passados explicitamente por quem constrói) — `empresa_fantasia` e os 2 campos de FCP seguiram o mesmo padrão. Consequência aceita: toda fixture de teste que constrói `IdentificacaoNF`/`IcmsSt` direto (sem passar por `a_partir_do_registro`) precisou ser atualizada — inclusive 1 fixture que não foi pega na 1ª varredura de diffs, por construir o registro cru na mão em vez de usar a dataclass direto. Ver [[Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos]].

## Migração

Pura adição de campo (3 campos novos, nenhum rename) — `makemigrations` não repetiu o prompt interativo ambíguo do caso do `ncm` (ver [[Quase-Erro na Migracao Django ao Renomear ncm para ncm_cadastro]]), porque não havia nenhum campo antigo sendo substituído por 2 novos.

## Validado

Pytest real, em 2 rodadas:
- **1ª rodada:** 524 passed, `impostos/models.py` 100% cover — mas 4 failures novos em `test_nivel_3__orquestrador.py`, causados pela fixture desatualizada (ver nota de bug linkada acima).
- **2ª rodada**, depois da correção: **528 passed, 0 failures no domínio deste trabalho, 12 xfailed**, só as 5 falhas pré-existentes de fora do domínio (`agenda_videos`/`api`).

## Em aberto

- Reprocessar produtos já sincronizados pra backfillar esses 3 campos (mesmo comando `reprocessar_impostos_entrada_de_json` já usado pra `cst_cadastro`/`ncm_cadastro`) — ainda não rodado pra esse fim.
- `obter_detalhes_para_exibicao()` (modal de produto) não foi alterado — os 3 campos novos não aparecem lá ainda, fora de escopo desta rodada (o objetivo era o relatório novo, não o modal).

## Relacionado

- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
- [[Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos]]
