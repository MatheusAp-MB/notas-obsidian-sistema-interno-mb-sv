---
tipo: bug_conhecido
dominio: fiscal
status: corrigido
criado: 15/08/2026
atualizado_em: 15/08/2026 15:05
relacionado: [Orquestracao da Sincronizacao de Impostos de Entrada via XML, Bonificacao Removida do Filtro de CFOP de Impostos de Entrada, Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]
---

# Contenção de Erro por Registro no Filtro e na Seleção de Impostos de Entrada

## Contexto

A etapa final do pipeline de impostos de entrada (`persistir_selecionados_no_banco`, em `orquestrador.py`) sempre isolou erro por produto: 1 registro malformado vira 1 pendência (`registrar_erro`), e o resto do lote continua sincronizando normalmente. As 2 etapas anteriores do pipeline — `filtrar_por_cfop` (Dados Filtrados) e `selecionar_nota_mais_recente_por_produto` (Dados Recentes) — não tinham essa mesma proteção: 1 registro malformado derrubava a fase inteira, travando a sincronização de TODOS os produtos daquele lote, não só do produto com problema.

## 2 bugs reais encontrados em `selecao_nota_recente.py`

A validação de data/NF só rodava na hora de COMPARAR duas notas do mesmo produto (`atual is None or _chave_de_ordenacao(linha) > _chave_de_ordenacao(atual)`). Por causa do curto-circuito do `or` do Python, a 1ª nota de cada produto nunca era validada — se um produto só tivesse 1 nota no lote, um dado ruim (data malformada, NF não numérica) entrava direto no resultado, sem erro nenhum, sem ninguém perceber. A partir da 2ª nota do MESMO produto, o mesmo dado ruim derrubava a seleção inteira com uma exceção não tratada (`ValueError`/`KeyError`/`TypeError`), travando também os outros produtos do lote que nada tinham a ver com o problema.

## A correção

`filtrar_por_cfop()` e `selecionar_nota_mais_recente_por_produto()` agora devolvem `(resultado, erros)` em vez de só o resultado. Cada erro é um dicionário `{'identificador': ..., 'mensagem': ...}` — identificado pelo NR NF da nota (na etapa de filtro, onde ainda não existe Código Barras por item) ou pelo Código Barras (na etapa de seleção, onde já existe).

As 2 funções continuam sem saber de disco — regra já existente no projeto, documentada no cabeçalho de `arquivos_retorno_api.py`: "nenhuma função de negócio (filtro, seleção, orquestrador) sabe de disco por conta própria". Quem chama `registrar_erro()` de verdade é `orquestrador.py`, a mesma responsabilidade que ele já tinha na etapa de persistência — mantém consistência arquitetural, todas as pendências de sincronização são registradas no mesmo lugar, pelo mesmo módulo.

`RelatorioDeSincronizacao` ganhou 2 campos novos — `notas_com_erro_no_filtro` e `linhas_com_erro_na_selecao` — pra essas pendências aparecerem direto no relatório da sincronização, sem precisar abrir o arquivo json de erros pra saber que algo foi pulado.

## Achado lateral — fixture de teste com typo escondia falha real

Ao rodar a suíte completa pra validar esta correção, apareceu um bug pré-existente e sem relação nenhuma com o CFOP: 2 arquivos de teste (`test_nivel_0__dados_xml_nf.py` e `test_nivel_3__orquestrador.py`) montavam o registro de teste com a chave `'Origem Descrição XML'`/`'Origem Descrição Cadastro'` (com "ç"), mas `dados_xml_nf.py` lê `'Origem Descricão XML'`/`'Origem Descricão Cadastro'` (sem "ç" — troca de "ç" por "c" antes do "ão"). Isso fazia 9 testes falharem de um jeito enganoso: o `KeyError` era capturado pelo tratamento de erro por registro (o mesmo que este documento descreve) e virava uma pendência, nunca uma falha clara de teste — só apareceu ao ler a mensagem de erro dentro da pendência registrada. Corrigido nos 2 arquivos.

## Resultado validado (15/08/2026, 15:05)

`filtro_cfop.py`, `orquestrador.py` e `selecao_nota_recente.py` em 100% cover, 0 Miss, 0 BrPart. Testes novos cobrem: nota que não é dicionário, nota em formato "plano" sem `itens_nf` (compatibilidade com registro histórico anterior à remodelagem da API), NF não numérica na única nota de um produto (regressão do bug do curto-circuito), data malformada no meio do lote, linha sem Código Barras, e 2 cenários de integração (Nível 3) com erro no filtro e erro na seleção convivendo com um produto válido no mesmo lote — provando que o erro de 1 não afeta o outro.

## Relacionado

- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
