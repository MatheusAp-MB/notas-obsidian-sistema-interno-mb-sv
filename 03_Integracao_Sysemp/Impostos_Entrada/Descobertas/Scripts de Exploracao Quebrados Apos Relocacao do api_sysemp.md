---
tipo: descoberta
dominio: 
status: corrigida
criado: 10/08/2026
atualizado_em: 10/08/2026 12:05
relacionado: [Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada, Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP, Checkpoint — Exploracao de Dados Fiscais Sysemp]
---

# Scripts de Exploração Quebrados Após Relocação do `api_sysemp`

## Contexto

Retomando no PC do escritório, o usuário tentou rodar de novo o dublê de precificação (`duble_precificacao_ml.py`) — já tinha funcionado antes, mas o `api_sysemp` foi relocado/oficializado (commit `8343dba`) desde então, e nem todos os scripts de `scripts_exploracao_ERP/` foram atualizados pra refletir isso.

## Achado 1 — `explorar_manifesto_nota_entrada.py` nunca colocava a raiz do projeto no `sys.path`

Ao rodar `python scripts_exploracao_ERP/explorar_manifesto_nota_entrada.py` direto, deu `ModuleNotFoundError: No module named 'api_sysemp'`. Causa: esse script nunca teve a função `_adicionar_raiz_do_projeto_ao_path()` (já usada em `duble_precificacao_ml.py` e outros). Ao rodar um arquivo `.py` direto, o Python só coloca a PASTA DO SCRIPT no `sys.path` — não a raiz do projeto, onde `api_sysemp` mora desde a oficialização. Provavelmente nunca foi testado depois da relocação. Mesmo bug encontrado em `consultar_produto.py`. Corrigido nos 2 com o mesmo padrão de path-setup já usado no resto do projeto.

## Achado 2 — resíduo local de `api_sysemp` antigo mascarava o erro real

Antes de chegar no `ModuleNotFoundError` correto, apareceu um erro mais confuso: `ImportError: cannot import name 'ApiSysemp' from 'api_sysemp' (unknown location)`. Causa: uma pasta `scripts_exploracao_ERP/api_sysemp/` sobrevivia nesse PC — resíduo de ANTES da relocação (só `__pycache__`, nenhum `.py` real, confirmado com `find -type f`). O Python trata pasta sem `__init__.py` como "pacote de namespace" mesmo vazia, e como `scripts_exploracao_ERP/` é a 1ª entrada do `sys.path` ao rodar o script direto, essa pasta velha tinha prioridade sobre o pacote real. Resolvido apagando a pasta (`rm -rf scripts_exploracao_ERP/api_sysemp`) — não era rastreada pelo Git, só lixo local desse checkout específico.

## Risco pra outros PCs/checkouts

Qualquer checkout feito ANTES do commit `8343dba` (relocação do `api_sysemp`) pode ter o mesmo resíduo local — o Git não apaga pasta que já ficou vazia de arquivo rastreado mas ainda tem `__pycache__`/lixo. Se aparecer o mesmo `ImportError` "(unknown location)" em outro computador, o diagnóstico é o mesmo: confirmar com `find scripts_exploracao_ERP/api_sysemp -type f` e apagar se só tiver `__pycache__`.

## Relacionado

- [[Camadas do Cliente Sysemp Transporte Contexto e Ponto de Entrada]]
- [[Oficializacao do dados_xml_nf Fora de Scripts Exploracao ERP]]
- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
