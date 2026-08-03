---
tipo: regra
dominio: python
status: ativa
criado: 01/08/2026
relacionado: [Integridade e Fonte Unica de Dado, Padroes de Projeto GoF Quando Usar]
---

# Modelagem de Objeto e Encapsulamento

## Composição, herança e tipo de objeto

- Preferir composição ("classe TEM outro objeto dentro") sobre herança ("classe É UM tipo de outra").
- Subclasse é pra **comportamento** diferente; instância nova é pra **dado** diferente. Ex: `FormulaPrecificacao` é 1 classe instanciada várias vezes com percentual-alvo diferente — nunca vira subclasse por variante.
- 2 tipos de objeto no projeto: objeto de **persistência** (Django `Model` — já salvo no banco) e objeto de **processo/domínio** (`dataclass`, nunca salvo no banco, representa um cálculo ou transformação em andamento).
- Quebrar problema grande em passos menores e nomeáveis, mesmo que resulte em mais de 1 classe pra 1 único processo (ex: uma classe cuida de 1 linha, outra cuida do processo inteiro — compostas uma dentro da outra).
- Grafo de dependência entre classes sempre em 1 sentido, nunca circular.

## Dataclasses, Enums, Type Hints, Decorators

- `@dataclass` pra estado agrupado que sempre anda junto (objeto de processo/domínio).
- `@dataclass(frozen=True)` quando o objeto representa um valor que não deveria mudar depois de criado (ex: uma janela de data já calculada).
- `Enum`/`TextChoices` pra valor fixo repetido — nunca string solta espalhada pelo código.
- Type hints em toda assinatura de método (parâmetro e retorno).
- `@decorator` pra boilerplate repetido entre arquivos — é o próprio padrão "Decorator" do catálogo GoF, já embutido na linguagem Python.

## Interfaces — `Protocol`/`ABC`, só quando o motivo é real

- Python não tem (nem precisa) da palavra-chave `interface` de Java — resolve isso via duck typing.
- Usar `typing.Protocol` (preferência) ou `abc.ABC` (só quando também for necessário forçar implementação compartilhada) **apenas quando existir mais de 1 classe cumprindo o mesmo contrato de forma intercambiável** (ex: futura integração com múltiplos marketplaces).
- Nunca criar interface/Protocol de forma preventiva, sem necessidade concreta já existente — isso seria "Speculative Generality" (ver [[Padroes de Projeto GoF Quando Usar]]).

## Encapsulamento — nada de getters/setters ao estilo Java

- Python não usa `get_x()`/`set_x()` — anti-idiomático na linguagem.
- `@property` é o "getter" pythônico, e cumpre um papel específico aqui: a classe dona de um dado é a **única** responsável por entregá-lo padronizado — quem consome nunca reinterpreta ou recalcula por fora (ver [[Integridade e Fonte Unica de Dado]]).
- `@x.setter` só quando escrever nesse valor precisar de validação/efeito colateral real — nunca criado por padrão sem necessidade.

## Relacionado

- [[Integridade e Fonte Unica de Dado]]
- [[Padroes de Projeto GoF Quando Usar]]
