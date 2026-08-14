---
tipo: bug_conhecido
dominio: testes
status: corrigido
criado: 14/08/2026
atualizado_em: 14/08/2026 11:15
relacionado: [Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Disciplina de Testes Automatizados]
---

# Fixture Compartilhada do Orquestrador Ficou Desatualizada ao Adicionar Campos Novos

## O que aconteceu

Ao adicionar 3 campos novos ao pipeline (`empresa_fantasia`, `aliquota_fcp`, `valor_fcp` — ver [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]]), a 1ª rodada de diffs cobriu os 2 arquivos de teste que constroem `IdentificacaoNF`/`IcmsSt` diretamente (`test_nivel_0__dados_xml_nf.py`, `test_nivel_3__impostos_e_custos_xml_entrada_produto.py`) — achados por grep direto pelos nomes das dataclasses. Ficou de fora `_item_padrao()`, em `integracao_sysemp/servicos/tests/test_nivel_3__orquestrador.py`, que monta o registro cru (dict) do zero, sem usar as dataclasses diretamente — só passa o dict pro pipeline real, que internamente chama `DadosXmlNF.a_partir_do_registro()`.

Resultado: 4 testes desse arquivo passaram a falhar com `assert False` (não com um `KeyError` visível) — o `KeyError` de fato acontecia dentro do parse, mas é capturado por `persistir_selecionados_no_banco()` (`except (KeyError, ValueError, TypeError)`) e tratado como erro individual de produto (vira pendência em `XML_Manifesto_NF_Erros.json`), não como falha de execução. Por isso os 4 testes falharam por assert de comportamento (produto não persistiu, pendência antiga não removida, contagem do relatório errada) em vez de um erro óbvio de parsing.

## Causa raiz

Grep por nome de dataclass (`IdentificacaoNF(`, `IcmsSt(`) não pega helper que monta dict cru na mão — esse padrão (registro cru construído com chaves string, sem passar pela dataclass) é usado especificamente em testes de integração que simulam a resposta bruta da API (nível orquestrador), diferente dos testes de nível mais baixo que já constroem a dataclass direto.

## Correção

Adicionadas as 3 chaves (`'Empresa Fantasia'`, `'% FCP ST'`, `'Valor FCP ST'`) em `_item_padrao()`, com valores padrão neutros. Revalidado: 528 passed, só as 5 falhas pré-existentes de fora do domínio.

## Lição pra qualquer campo novo futuro nesse domínio

Antes de considerar um diff de "campo novo em dataclass" completo, grep repo-wide por toda chave de assinatura conhecida de registro cru relacionada (aqui: `'CFOP XML'`, presente em qualquer fixture que monta registro completo) — não só pelo nome da dataclass/classe. Vale tanto pra fixtures de teste quanto pra qualquer consumidor real que construa o dict à mão.

## Relacionado

- [[Adicao de Empresa Fantasia e FCP ST ao Pipeline de Impostos de Entrada]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Disciplina de Testes Automatizados]]
