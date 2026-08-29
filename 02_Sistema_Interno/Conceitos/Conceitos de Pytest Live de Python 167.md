---
tipo: conceito
dominio: python
status: ativa
criado: 02/08/2026
relacionado: [Disciplina de Testes Automatizados]
---

# Conceitos de Pytest — Live de Python #167

Fonte: deck "Live de Python #167" (Dunossauro), 54 páginas, enviado pelo usuário. Conhecimento geral de pytest, não específico de nenhum projeto — por isso mora em Notas Gerais, não dentro de Sistema Interno.

## As 4 fases de todo teste

Todo teste, mesmo os de 1 linha, é formado por 4 fases (em outras literaturas, 3 — a variação AAA: Arrange/Act/Assert):

- **Setup**: onde montamos as coisas.
- **Exercise**: onde chamamos as coisas.
- **Assert**: onde verificamos as coisas.
- **TearDown**: onde desmontamos as coisas.

## SUT, Fixture e Contexto

- **SUT** (System Under Test) = a peça sendo testada.
- Todo teste simples exercita 2 partes: Input/Output entrando e saindo do SUT via Exercise/Assert.
- **Fixture** é uma forma de "entrar" num Contexto, ou de prover uma ferramenta que precisa rodar ANTES do teste. A fixture entrega o Contexto que envolve o SUT — o Input entra através da fixture, o Output sai através do Assert.
- Fixtures prontas do próprio pytest: `capsys` (espiona `stdout`), `tmpdir` (cria diretório temporário), `caplog` (espiona logs), `monkeypatch` (adiciona atributos/métodos a objetos em runtime).

## Marks (tags)

Marks categorizam/filtram testes:

- `@pytest.mark.skip` — nunca roda.
- `@pytest.mark.skipif(condição)` — roda só se a condição for falsa.
- `@pytest.mark.xfail(reason=...)` — espera que falhe; se falhar, conta como `xfailed` (esperado), NUNCA como `failed` (quebra de suíte) — útil pra documentar um caso de falha conhecida sem que pareça um problema real.
- `@pytest.mark.parametrize('args', [casos])` — "quase um dicionário": reduz várias funções de teste quase-duplicadas pra 1 função + 1 lista de casos. Regra adotada no projeto: sempre com `ids=` explícito (nunca auto-gerado, que fica ilegível pra valores complexos como datas).

## Correção de atribuição (importante)

O termo **DOC** (Depended-on Component) usado no projeto NÃO vem deste deck — vem do livro *xUnit Test Patterns* (Gerard Meszaros). Conferido diretamente no texto extraído do PDF: só aparecem SUT, Fixture, Contexto e as 4 fases, nunca "DOC". Ver [[Disciplina de Testes Automatizados]] pra como SUT+DOC são usados no projeto.

## Relacionado

- [[Disciplina de Testes Automatizados]]
