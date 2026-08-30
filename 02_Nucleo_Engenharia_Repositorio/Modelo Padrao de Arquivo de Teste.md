---
tipo: regra
dominio: testes
status: ativa
criado: 02/08/2026
relacionado: [Disciplina de Testes Automatizados, Disciplina de Refatoracao e Testes, Nomenclatura e Comentarios]
---

# Modelo Padrao de Arquivo de Teste

## Contexto

Implementação de referência das regras definidas em [[Disciplina de Testes Automatizados]] — não testa nada real, existe só pra documentar, num arquivo só, toda convenção acordada. Serve de ponto de partida: copia a estrutura, troca o SUT e os casos pelo que for testar de verdade.

Validado rodando de verdade (`pytest -s`) em 3 cenários: teste que passa, teste que falha sem avisar (bug real, introduzido de propósito pra checar — trocando `dobro` por `x * 3`), e teste que falha de propósito e documentado (`xfail`). Os 3 aparecem distintos na tabela e no resumo final do pytest, sem nunca se confundir.

## Estrutura fixa (4 fases sempre comentadas)

Todo teste, sem exceção, comenta e explica as 4 fases — mesmo quando uma fase não faz nada, o comentário explica por que não faz:

- **Setup** — monta contexto/entrada. Se vier pronto do `parametrize`, comenta que não há nada a montar.
- **Exercise** — chama o SUT de verdade.
- **Assert** — registra o resultado na tabela (`registrar_resultado`, sempre ANTES do `assert`, pra linha aparecer mesmo se falhar) e só depois compara (`assert resultado == esperado`, direto, sem variável `passou` intermediária).
- **TearDown** — desmonta recurso. Função pura não tem o que desmontar; a única desmontagem real acontece 1 vez, na fixture `tabela_resultados`, depois que todos os testes do arquivo já rodaram.

## match/case no SUT — só quando há cenário exclusivo real

Usa `match/case` apenas quando existem cenários mutuamente exclusivos e enumeráveis (`classificar_numero` abaixo). Função sem branch (`dobro`) não ganha `match/case` forçado — não existe "caso" pra enumerar, só uma conta.

## parametrize — sempre com `ids` explícito

Nunca depende do id auto-gerado do pytest — vira ilegível pra valores complexos (datas, objetos). `ids=[...]` sempre escrito à mão, mesmo em exemplo simples.

## Tabela com coluna Motivo — nunca mensagem de assert repetindo valor

A tabela (`Teste | Entrada | Esperado | Motivo | Obtido | Status`) já mostra entrada/esperado/obtido — uma mensagem de assert que repete esses valores é redundante. `Motivo` existe pra registrar o "por causa disso" (regra de negócio), sempre presente e padronizada, nunca como mensagem avulsa de `assert`.

## Falha documentada com `@pytest.mark.xfail` — nunca remover do modelo

Um modelo só com casos que passam prova só metade da estrutura. O arquivo mantém 1 teste permanentemente marcado `@pytest.mark.xfail(reason=...)`, com valor errado de propósito — prova que a tabela mostra `FALHOU` corretamente e que o pytest reporta falha esperada (`xfailed`) separada de falha real (`failed`) no resumo final.

## Arquivos

### `modelo_sut_exemplo.py`

```python
# modelo_sut_exemplo.py

# Função Objetivo: SUT de referência pro modelo padrão de teste do projeto —
# 2 funções pequenas: uma sem branch nenhum (não precisa de match/case) e
# outra com cenários mutuamente exclusivos (usa match/case, porque deixa os
# casos enumeráveis e força pensar em TODAS as combinações possíveis — foi
# exatamente a falta disso que escondeu o bug do "deletar_tarefa" que a
# gente analisou no material externo).

def dobro(numero: int) -> int:
    """Recebo um número inteiro, devolvo o dobro dele."""
    return numero * 2

def classificar_numero(numero: int) -> str:
    """
    Recebo um número inteiro, classifico segundo a regra:
    - Múltiplo de 3 E de 5 -> 'FizzBuzz'
    - Múltiplo de 3 (só)   -> 'Fizz'
    - Múltiplo de 5 (só)   -> 'Buzz'
    - Nenhum dos dois      -> o próprio número, como string
    """
    match numero % 3 == 0, numero % 5 == 0:
        case (True, True):
            return 'FizzBuzz'
        case (True, False):
            return 'Fizz'
        case (False, True):
            return 'Buzz'
        case _:
            return str(numero)
```

### `testes_apoio/apoio_visual.py`

```python
# testes_apoio/apoio_visual.py

# Função Objetivo: formata e registra 1 linha de resultado na tabela de
# testes — único lugar que decide como cada coluna aparece, pra nunca ficar
# inconsistente entre arquivo de teste diferente.

def registrar_resultado(tabela, teste, entrada, esperado, motivo, obtido, passou):
    status = '[green]✓ PASSOU[/green]' if passou else '[red]✗ FALHOU[/red]'
    tabela.add_row(teste, entrada, esperado, motivo, obtido, status)
```

### `conftest.py` (raiz do projeto)

```python
# conftest.py (raiz)

import pytest
from rich.console import Console
from rich.table import Table

_console = Console()

@pytest.fixture(scope='module')
def tabela_resultados(request):
    titulo = getattr(request.module, 'TITULO_CAMADA', request.module.__name__)
    tabela = Table(title=titulo)
    tabela.add_column('Teste')
    tabela.add_column('Entrada')
    tabela.add_column('Esperado')
    tabela.add_column('Motivo')
    tabela.add_column('Obtido')
    tabela.add_column('Status')
    yield tabela
    _console.rule('[bold cyan]NOSSOS TESTES — RESULTADO REAL[/bold cyan]')
    _console.print(tabela)
    _console.rule()
```

### `test_modelo_padrao.py`

```python
# test_modelo_padrao.py

# Função Objetivo: MODELO DE REFERÊNCIA da estrutura de teste do projeto —
# não testa nada real, existe só pra documentar, num arquivo só, toda
# convenção definida: 4 fases sempre comentadas e explicadas (Setup /
# Exercise / Assert / TearDown, mesmo quando uma fase não faz nada — nesse
# caso, comenta explicando POR QUE não faz nada), match/case no SUT só
# quando há cenário exclusivo real, parametrize com ids explícitos, tabela
# de resultado visual com coluna de Motivo (o "por causa disso"), e 1 caso
# de falha documentada (xfail) pra provar que a estrutura também mostra
# falha corretamente, não só sucesso.
# Ver nota "Modelo Padrao de Arquivo de Teste" no Obsidian.
#
# Como usar: copia este arquivo, troca o import do SUT e os casos de teste
# pelo que for testar de verdade — a estrutura em volta se mantém igual.
# Se o SUT tocar banco (Camada 3+), adiciona:
#     pytestmark = pytest.mark.django_db

import pytest

from modelo_sut_exemplo import dobro, classificar_numero
from testes_apoio.apoio_visual import registrar_resultado

TITULO_CAMADA = 'Modelo de Referência — Estrutura Padrão de Teste'

# ===================================================================
# dobro — sem branch nenhum, não precisa de match/case: não existe "caso"
# pra enumerar no SUT, só uma conta.
# ===================================================================

@pytest.mark.parametrize(
    'entrada, esperado',
    [
        (1, 2),
        (2, 4),
        (0, 0),
        (-3, -6),
    ],
    ids=[
        'numero_positivo_pequeno',
        'numero_positivo_maior',
        'zero_permanece_zero',
        'numero_negativo',
    ],
)
def test_dobro(entrada, esperado, tabela_resultados):
    # Setup: nada pra montar aqui — 'entrada' e 'esperado' já chegam
    # prontos, resolvidos pelo parametrize antes do teste começar a rodar.

    # Exercise: chama o SUT de verdade — é aqui que a função roda de fato.
    resultado = dobro(entrada)

    # Assert: registra o cenário na tabela ANTES de decidir passou/falhou
    # (assim a linha aparece sempre, mesmo se falhar), e só depois faz a
    # comparação de verdade.
    registrar_resultado(
        tabela_resultados, f'dobro_{entrada}',
        f'{entrada}', f'{esperado}',
        'dobro(x) sempre devolve x multiplicado por 2, sem exceção',
        f'{resultado}', resultado == esperado,
    )
    assert resultado == esperado

    # TearDown: nada a desmontar — função pura, sem estado, sem recurso
    # aberto. A única "desmontagem" de verdade acontece 1 vez só, na
    # fixture tabela_resultados, depois que TODOS os testes deste arquivo
    # já tiverem rodado.

# ===================================================================
# classificar_numero — 4 cenários mutuamente exclusivos (por isso o SUT usa
# match/case) — 1 teste por cenário, nunca menos.
# ===================================================================

@pytest.mark.parametrize(
    'entrada, esperado, motivo',
    [
        (15, 'FizzBuzz', '15 é múltiplo de 3 E de 5 ao mesmo tempo'),
        (3, 'Fizz', '3 é múltiplo só de 3, não de 5'),
        (5, 'Buzz', '5 é múltiplo só de 5, não de 3'),
        (7, '7', '7 não é múltiplo nem de 3 nem de 5'),
    ],
    ids=[
        'multiplo_de_3_e_5_retorna_fizzbuzz',
        'multiplo_so_de_3_retorna_fizz',
        'multiplo_so_de_5_retorna_buzz',
        'nao_multiplo_retorna_o_proprio_numero',
    ],
)
def test_classificar_numero(entrada, esperado, motivo, tabela_resultados):
    # Setup: nada pra montar — 'entrada', 'esperado' e 'motivo' já vêm
    # prontos do parametrize.

    # Exercise: chama o SUT de verdade.
    resultado = classificar_numero(entrada)

    # Assert: registra antes de comparar, depois compara de verdade.
    registrar_resultado(
        tabela_resultados, f'classificar_numero_{entrada}',
        f'{entrada}', f'{esperado}', motivo,
        f'{resultado}', resultado == esperado,
    )
    assert resultado == esperado

    # TearDown: nada a desmontar — mesmo motivo do teste anterior.

# ===================================================================
# Caso de falha proposital — existe só pra provar que o modelo mostra
# FALHOU corretamente na tabela, e que @mark.xfail documenta uma falha
# esperada sem contar como "suíte quebrada". NUNCA remove este teste do
# modelo — ele é a prova viva de que a estrutura funciona pros 2 lados
# (passa E falha), não só pro lado feliz. Validado rodando de verdade com
# um bug real introduzido de propósito (dobro trocado por x * 3): as 2
# categorias de falha (real vs. documentada) apareceram distintas no
# resumo do pytest ('3 failed' vs '1 xfailed'), sem nunca se confundir.
# ===================================================================

@pytest.mark.xfail(reason='Falha de propósito — prova visual de como fica a linha FALHOU na tabela')
def test_dobro_caso_de_falha_proposital(tabela_resultados):
    # Setup: valores fixos, errados DE PROPÓSITO.
    entrada = 2
    esperado_errado = 5  # dobro(2) é 4, nunca 5 — isso é o ponto do teste.

    # Exercise
    resultado = dobro(entrada)

    # Assert: registra mesmo sabendo que vai falhar — a linha PRECISA
    # aparecer na tabela como FALHOU, senão o modelo não prova nada.
    registrar_resultado(
        tabela_resultados, 'dobro_caso_de_falha_proposital',
        f'{entrada}', f'{esperado_errado}',
        'Propositalmente errado — dobro(2) é 4, nunca 5. Existe só pra provar que a tabela mostra FALHOU corretamente.',
        f'{resultado}', resultado == esperado_errado,
    )
    assert resultado == esperado_errado

    # TearDown: nada a desmontar.
```

## Checklist de convenção (usar ao copiar o modelo)

- [ ] `TITULO_CAMADA` declarado no topo do arquivo
- [ ] 4 fases sempre comentadas, mesmo quando uma é no-op
- [ ] `registrar_resultado(...)` sempre chamado antes do `assert`
- [ ] `assert resultado == esperado` direto, nunca `passou = ...` como variável intermediária
- [ ] `Motivo` preenchido em toda linha, nunca vazio
- [ ] `ids=` explícito em todo `parametrize`
- [ ] `match/case` no SUT só quando há cenário exclusivo real (nunca forçado numa função sem branch)
- [ ] Se o SUT tocar banco (Camada 3+): `pytestmark = pytest.mark.django_db`
- [ ] Rodar sempre com `pytest -s` (nunca só `-v` — a tabela precisa do `-s` pra aparecer)

## Relacionado

- [[Disciplina de Testes Automatizados]]
- [[Disciplina de Refatoracao e Testes]]
- [[Nomenclatura e Comentarios]]
