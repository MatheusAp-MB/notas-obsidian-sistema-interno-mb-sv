---
tipo: descoberta
dominio: testes
status: ativa
criado: 05/08/2026
atualizado_em: 05/08/2026 22:52
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Convencao de Nomenclatura de Arquivos no Drive, Integridade e Fonte Unica de Dado]
---

# obter_fase() Levantava AttributeError Cru Para Chave Inválida

Achado durante o planejamento dos testes de `parser.py` (Nível 0, 05/08/2026) — antes de qualquer teste ser escrito, ao revisar `ArquivosProdutoDrive.obter_fase()` linha por linha.

## O que aconteceu

```python
def obter_fase(self, chave_fase):
    return getattr(self, chave_fase)
```

`getattr()` sem valor padrão levanta `AttributeError` cru se `chave_fase` não for um atributo real da dataclass — nenhuma validação, nenhuma mensagem de erro própria do domínio. Como o método é só um wrapper interno, isso passaria despercebido até alguém chamar com uma chave errada em produção e receber um traceback genérico do Python, sem contexto do que a função esperava.

## Resolução

Reaproveitado `PREFIXO_ARQUIVO_POR_FASE` (já existente em `constantes.py`, mesmas 3 chaves: `simples`, `video_mensal`, `video_trimestral`) como fonte única de verdade pra validar — em vez de criar uma lista nova pra manter sincronizada (ver [[Integridade e Fonte Unica de Dado]]):

```python
def obter_fase(self, chave_fase):
    if chave_fase not in PREFIXO_ARQUIVO_POR_FASE:
        raise ValueError(f'Chave de fase inválida: {chave_fase!r} — esperado uma de {sorted(PREFIXO_ARQUIVO_POR_FASE)}')
    return getattr(self, chave_fase)
```

`ValueError` porque é o padrão já usado no projeto pra uso indevido (mesmo caso de `CicloVideo.iniciar_agenda()`/`agendar_apos_simples()`). Testado em `test_nivel_0__parser.py` — confirma que a chave inválida levanta `ValueError` com mensagem clara, e que a chave válida continua devolvendo o atributo certo. Suíte confirmada: 15 passed, 100% cover, 0 Miss, 0 BrPart em `parser.py`.

## Por que não foi pego antes

O método nunca teve teste — foi escrito na reescrita de `parser.py` desta mesma sessão (05/08), ainda sem cobertura. Só apareceu porque o processo de "Confirmar antes de escrever teste" (ver [[Disciplina de Testes Automatizados]]) passa por ler a função real linha por linha antes de decidir os cenários — não por ter sido exercitado e falhado em produção.

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Convencao de Nomenclatura de Arquivos no Drive]]
- [[Integridade e Fonte Unica de Dado]]
