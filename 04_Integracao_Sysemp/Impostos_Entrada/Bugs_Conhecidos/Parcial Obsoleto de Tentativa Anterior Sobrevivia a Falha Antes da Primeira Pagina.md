---
tipo: bug_conhecido
dominio: fiscal
status: corrigido
criado: 15/08/2026
atualizado_em: 15/08/2026 16:00
relacionado: [Orquestracao da Sincronizacao de Impostos de Entrada via XML, Paginacao do Endpoint Manifesto Nota Entrada, Contencao de Erro por Registro no Filtro e Selecao de Impostos de Entrada]
---

# Parcial Obsoleto de Tentativa Anterior Sobrevivia a Falha Antes da 1ª Página

## Contexto

`listar_periodo_completo()` (`api_sysemp/impostos_entrada_xml.py`) pagina o manifesto de notas de entrada e, se a busca falhar no meio do caminho, chama `ao_falhar_com_parcial(todos_os_registros)` — mas só quando pelo menos 1 página já tinha sido acumulada com sucesso. `orquestrador.py` usa esse callback pra gravar o parcial em `XML_Manifesto_NF_Bruto_Parcial.json`, permitindo inspecionar o que foi lido antes da falha (mesma filosofia de dado intermediário em disco, ver [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]).

## O bug

Encontrado durante a revisão da Etapa 1 (Dados Brutos) do pipeline, feita via sincronização autorizada com o GitHub (15/08/2026). Até então, o arquivo de parcial só era limpo (`{'retorno': []}`) DEPOIS de uma busca com sucesso total, no fim do bloco `salvar_bruto`. Se uma tentativa de sincronização falhasse ANTES da 1ª página (nenhum registro acumulado ainda), `ao_falhar_com_parcial` nunca chegava a ser chamado — e o parcial de uma tentativa ANTERIOR, sem relação nenhuma com essa falha, ficava parado no disco, parecendo (erradamente) pertencer à tentativa atual.

## A correção

`orquestrador.py`, dentro de `sincronizar_impostos_entrada_xml`: o parcial passa a ser limpo no INÍCIO de cada tentativa de busca (logo depois do `_informar('Buscando manifesto na API...')` e antes do bloco `houve_erro_na_api = False`), não mais só no fim de um sucesso total. O trecho que limpava no fim virou só um comentário explicativo (já está limpo desde o início da tentativa, e segue vazio se nada falhou no meio do caminho).

## Resultado validado (15/08/2026, 16:00)

Novo teste de regressão em `test_nivel_3__orquestrador.py` (`test_erro_antes_da_1a_pagina_limpa_parcial_de_tentativa_anterior`): monta um parcial antigo e sem relação no disco, força falha da API antes da 1ª página, confirma que o parcial fica limpo (`{'retorno': []}`), não o dado antigo. Suíte completa: 542 passed, 100% cover / 0 Miss / 0 BrPart mantido em `filtro_cfop.py`, `orquestrador.py` e `selecao_nota_recente.py` — nenhuma falha nova (as 6 falhas restantes são pré-existentes e sem relação, `agenda_videos`/`api replicação automática`).

## Relacionado

- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Paginacao do Endpoint Manifesto Nota Entrada]]
- [[Contencao de Erro por Registro no Filtro e Selecao de Impostos de Entrada]]
