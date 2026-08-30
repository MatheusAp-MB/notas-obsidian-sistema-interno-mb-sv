---
tipo: decisao
dominio: 
status: ativa
criado: 10/08/2026
atualizado_em: 10/08/2026 12:05
relacionado: [Orquestracao da Sincronizacao de Impostos de Entrada via XML, Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp, Checkpoint — Exploracao de Dados Fiscais Sysemp, Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]
---

# Oficialização do `dados_xml_nf` Fora de `scripts_exploracao_ERP/`

## Contexto

Usuário reabriu o dublê de precificação (`duble_precificacao_ml.py`) no PC do escritório pra mostrar ao superior — travou com `FileNotFoundError` (json local ausente, resolvido gerando de novo pela pipeline manual) e depois com `ImportError` em `api_sysemp` (ver [[Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]]). Resolvendo os dois, o usuário levantou o problema de fundo: **`scripts_exploracao_ERP/` precisa poder ser apagada a qualquer momento sem afetar o sistema real** — e `dados_xml_nf.py` violava isso.

## Achado — dependência real escondida

Checado direto no `dev` (`git fetch`, commit `575f865`): `dados_xml_nf.py` não era só usado por scripts de exploração. 2 dependências reais de produção:
- `integracao_sysemp/servicos/orquestrador.py` importa `DadosXmlNF` pra persistir no banco de verdade — é o parser central do pipeline oficial de sincronização.
- `impostos/tests/test_nivel_3__impostos_e_custos_xml_entrada_produto.py` (teste oficial, Nível 3, banco real) importa direto de `scripts_exploracao_ERP.dados_xml_nf` — se essa pasta fosse apagada, um teste do app `impostos` quebraria.

Já estava marcado como pendente desde 10/08 (00:55): "Oficializar `dados_xml_nf.py` fora de `scripts_exploracao_ERP/`" — ficou pendente até esse incidente forçar a resolução.

## Decisão

`dados_xml_nf.py` move pra `integracao_sysemp/servicos/dados_xml_nf.py` — mesmo pacote do orquestrador, que já é seu principal consumidor, mesmo padrão de 1 responsabilidade por arquivo já usado ali (`arquivos_retorno_api.py`, `filtro_cfop.py`, `selecao_nota_recente.py`, `erros_sincronizacao.py`). Conteúdo idêntico, só o cabeçalho do arquivo atualizado — mudança de localização pura, sem mudar comportamento (Disciplina de Refatoração: nunca misturar refactor com feature).

## Consumidores corrigidos (6)

1. `integracao_sysemp/servicos/orquestrador.py` — import absoluto trocado por relativo (`from .dados_xml_nf import DadosXmlNF`), reordenado alfabeticamente entre os outros imports de `.servicos`.
2. `impostos/models.py` — import `TYPE_CHECKING` corrigido pro novo caminho; comentário que justificava o guard ("scripts_exploracao_ERP não pode ser dependência de runtime") ficou obsoleto e foi ajustado.
3. `impostos/tests/test_nivel_3__impostos_e_custos_xml_entrada_produto.py` — import corrigido.
4. `scripts_exploracao_ERP/duble_precificacao_ml.py` — import corrigido.
5. `scripts_exploracao_ERP/comparar_impostos_planilha_vs_xml.py` — import corrigido.
6. `scripts_exploracao_ERP/consultar_produto.py` — import corrigido, e ganhou o `_adicionar_raiz_do_projeto_ao_path()` que nunca teve (mesmo bug do achado em [[Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]]).

## Validado (10/08/2026, 12:05)

- `pytest impostos integracao_sysemp api_sysemp --cov=impostos --cov=integracao_sysemp --cov=api_sysemp` — **87 passed, 11 xfailed** (todos os xfail são "falha de propósito" já esperados), zero regressão. `integracao_sysemp/servicos/dados_xml_nf.py` na nova casa: **100% cover / 0 Miss / 0 BrPart** (126 stmts).
- `impostos/models.py` apareceu em 93% nesse recorte (6 linhas) — não investigado a fundo, provavelmente só por ter rodado um subconjunto de apps em vez da suíte inteira; não relacionado a esta mudança (só o import de tipagem foi tocado ali).

## Relacionado

- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Scripts de Exploracao Quebrados Apos Relocacao do api_sysemp]]
- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]
