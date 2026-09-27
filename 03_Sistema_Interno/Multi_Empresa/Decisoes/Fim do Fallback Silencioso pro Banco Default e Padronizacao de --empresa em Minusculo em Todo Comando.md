---
tipo: decisao
dominio: banco_de_dados
status: concluida
criado: 27/09/2026
atualizado_em: 27/09/2026 17:50
relacionado: [Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao), Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada, Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
resumo: Um fallback perigoso (nenhuma empresa ativa → sistema cai em silêncio pro banco da Magazine) foi eliminado, e o argumento --empresa foi padronizado como minúsculo, obrigatório e sem a conveniência de "rodar as 2 empresas de uma vez", em todo comando do sistema — incluindo os 3 comandos do Mercado Livre, que eram os únicos ainda fora do padrão ComandoComEmpresa já usado pelos outros 11 comandos.
---

# Fim do Fallback Silencioso pro Banco Default e Padronização de --empresa em Minúsculo em Todo Comando

**Resumo**: um fallback perigoso (nenhuma empresa ativa definida → o sistema caía em silêncio pro banco da Magazine, sem erro nenhum) foi eliminado, e o argumento `--empresa` foi padronizado como minúsculo, obrigatório e sem a conveniência de "rodar as 2 empresas de uma vez", em todo comando do sistema — incluindo os 3 comandos do Mercado Livre, que eram os únicos ainda fora do padrão `ComandoComEmpresa` já usado pelos outros 11 comandos do sistema.

> [!success] Concluída e validada com dado real (27/09/2026)
> As 2 peças (segurança contra fallback silencioso + padronização de minúsculo) foram implementadas, aplicadas por Matheus, e validadas com execução real: suíte de teste automatizado (7/7), teste negativo do argumento de linha de comando (maiúsculo rejeitado, argumento obrigatório confirmado), e os 2 bancos de dados remontados do zero (`migrate` + `iniciar_banco` + `popular_banco` parcial) pras 2 empresas, usando os comandos já no formato novo.

## Contexto — de onde isso veio

Em 17/08/2026, o sistema ganhou sua arquitetura permanente de 2 empresas (Magazine Brasileiro e Samvale), documentada em [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]: 2 bancos de dados MySQL completamente separados (`sistema_interno_magazine` e `sistema_interno_samvale`), escolhidos por sessão de navegador (numa tela web) ou por um argumento `--empresa` em comando de terminal. O mecanismo por trás disso é o **Database Router** (`core/database_router.py`, classe `EmpresaRouter`) — um recurso nativo do Django que decide, a cada leitura ou escrita no banco, pra qual banco físico aquela operação deve ir. Ele decide isso perguntando pra uma função central, `obter_alias_banco_ativo()` (arquivo `core/empresa.py`), qual é a "empresa ativa" no momento — um valor guardado numa variável especial chamada **thread-local** (`threading.local()`), que existe separadamente pra cada linha de execução do programa, e é preenchida por `definir_empresa_ativa()` logo no início de cada requisição web ou comando de terminal.

Naquele mesmo checkpoint de 17/08, foi criada uma classe base reaproveitável, `ComandoComEmpresa` (arquivo `core/management/commands/_base_empresa.py`), que qualquer comando de terminal que mexe em dado de 1 empresa só deveria estender — ela exige o argumento `--empresa`, sem valor padrão, e chama `definir_empresa_ativa()` automaticamente antes do comando rodar de verdade. Isso deveria ter virado o único padrão do sistema inteiro a partir dali.

## O problema — 2 falhas reais, achadas na mesma investigação

Investigando o sistema por outro motivo (uma reforma estrutural do app `integracao_mercado_livre`), Matheus notou 2 problemas concretos, sérios o bastante pra pausar a reforma e resolver primeiro:

**Problema 1 — fallback silencioso pro banco default.** A função `obter_alias_banco_ativo()`, quando nenhuma empresa ativa tinha sido definida (`definir_empresa_ativa()` nunca chamado), devolvia `None` em vez de erro. Isso não quebrava nada na hora — mas deixava o Django cair de volta no seu comportamento nativo, que é usar o alias `default` sempre que nenhum banco é dito explicitamente. E o alias `default`, no `settings.py` deste projeto, aponta pro mesmo banco físico da Magazine (`sistema_interno_magazine`). Ou seja: qualquer comando, script ou shell que esquecesse de definir a empresa ativa **não travava com erro — silenciosamente lia e gravava dado da Magazine**, mesmo que a intenção fosse mexer na Samvale.

**Problema 2 — convenção de argumento inconsistente entre comandos.** Comandos que estendiam `ComandoComEmpresa` (11 no total: os de impostos, integração com o Sysemp, e os 6 de grade de precificação) exigiam `--empresa=MAGAZINE` ou `--empresa=SAMVALE`, sempre **maiúsculo** — os mesmos valores usados internamente no código (`EMPRESA_MAGAZINE`, `EMPRESA_SAMVALE`). Já os 3 comandos do Mercado Livre (`buscar_frete_real_ml`, `buscar_comissao_real_ml`, `sincronizar_categorias_ml`) nunca tinham sido migrados pra essa base — cada um definia seu próprio argumento `--empresa`, solto, com valores **minúsculos** (`magazine`/`samvale`) e, pior, com valor padrão `None` que rodava **as 2 empresas em sequência** se o argumento fosse esquecido. Resultado prático: `python manage.py sincronizar_impostos_entrada --empresa=SAMVALE` (maiúsculo) e `python manage.py buscar_frete_real_ml --empresa=samvale` (minúsculo) — nenhum jeito único de escrever o mesmo tipo de comando, e um dos 2 grupos escondia qual empresa realmente rodou, se ninguém passasse o argumento.

## O que levou à resposta

**Auditoria de quem já seguia o padrão certo.** Buscando por `ComandoComEmpresa` no repositório inteiro, ficou confirmado que os 3 comandos do Mercado Livre eram os **únicos** fora do padrão — os outros 11 comandos (`impostos/`, `integracao_sysemp/`, `precificacao/`) já estendiam `ComandoComEmpresa` corretamente. Isso mudou o escopo da correção: não era "criar um padrão novo", era "trazer os 3 comandos que ficaram pra trás pro padrão que o resto do sistema já usa".

**Decisão explícita de eliminar a conveniência, não só padronizar o nome.** A 1ª ideia levantada foi só trocar `MAGAZINE`/`SAMVALE` por `magazine`/`samvale` em todo lugar, mantendo o comportamento de "roda as 2 empresas se o argumento for omitido" nos 3 comandos do ML. Matheus rejeitou essa ideia pela raiz: **"pode eliminar a conveniência (...) esse sistema está crescendo e virou produto comercial (...) eu prefiro que todo comando seja extremamente explícito (...) eu prefiro ter que 'sofrer' rodando 2 ou 3 comandos claros do que rodar um sem saber o que ele tá fazendo direito"**. Ou seja: a decisão não foi só técnica (qual convenção de texto usar), foi de postura — em um sistema que está caminhando pra virar produto real, hospedado em nuvem, e reformulado como microsserviços no futuro, nenhum comando deveria decidir sozinho "vou rodar pras 2 empresas" sem quem operou o comando ter pedido isso de propósito.

**Bug de digitação encontrado e corrigido no caminho.** Durante a orientação de como remontar os 2 bancos do zero, foi sugerido rodar `iniciar_banco --empresa magazine` (minúsculo) — mas, naquele momento, `_base_empresa.py` só aceitava maiúsculo (`MAGAZINE`/`SAMVALE`), porque a padronização ainda não tinha sido feita. Esse erro foi identificado e corrigido dentro da própria padronização: agora minúsculo é a forma correta em qualquer comando do sistema, sem exceção.

## A decisão / correção aplicada

**Peça 1 — `core/empresa.py` deixa de devolver banco default em silêncio:**

```python
class EmpresaNaoDefinidaError(RuntimeError):
    """
    Nenhuma empresa ativa nesta thread (definir_empresa_ativa() nunca foi
    chamado). Decisão explícita (Matheus, 27/09/2026): nunca cair em
    silêncio pro banco default (Magazine) — todo comando/script/shell que
    toca dado de empresa precisa setar a empresa ativa primeiro, ou falha
    na hora, alto e claro.
    """
    pass


def obter_alias_banco_ativo():
    empresa = obter_empresa_ativa()
    if empresa is None:
        raise EmpresaNaoDefinidaError(
            'Nenhuma empresa ativa — chame definir_empresa_ativa(EMPRESA_MAGAZINE '
            'ou EMPRESA_SAMVALE) antes de ler/escrever qualquer dado de empresa.'
        )
    return ALIAS_BANCO_POR_EMPRESA[empresa]
```

**Peça 2 — `EMPRESA_POR_ALIAS_BANCO` vira a fonte única de verdade** pro valor minúsculo que o usuário digita e a tradução de volta pra constante interna (`EMPRESA_MAGAZINE`/`EMPRESA_SAMVALE`) — direção inversa do dict que já existia (`ALIAS_BANCO_POR_EMPRESA`):

```python
EMPRESA_POR_ALIAS_BANCO = {
    alias: empresa for empresa, alias in ALIAS_BANCO_POR_EMPRESA.items()
}
```

**Peça 3 — `ComandoComEmpresa` (arquivo `core/management/commands/_base_empresa.py`) passa a usar essa fonte única**, com valores minúsculos, e guarda a constante interna traduzida em `self.empresa_ativa` (pra qualquer comando que precise repassar esse valor pra uma função de serviço que espera o formato antigo):

```python
def add_arguments(self, parser):
    parser.add_argument(
        '--empresa',
        required=True,
        choices=list(EMPRESA_POR_ALIAS_BANCO.keys()),
        help='Empresa cujo banco este comando vai usar (obrigatório): magazine ou samvale.',
    )
    self.adicionar_argumentos(parser)

def execute(self, *args, **options):
    self.empresa_ativa = EMPRESA_POR_ALIAS_BANCO[options['empresa']]
    definir_empresa_ativa(self.empresa_ativa)
    return super().execute(*args, **options)
```

**Peça 4 — os 3 comandos do Mercado Livre migrados pra `ComandoComEmpresa`**, eliminando o dict duplicado (`EMPRESAS_EXECUTAVEIS_POR_ARGUMENTO`) e a conveniência de "roda as 2 empresas":

```python
# Antes (buscar_frete_real_ml.py) — dict duplicado, default=None, roda as 2 se omitido
class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--empresa', choices=['magazine', 'samvale'], default=None, ...)
    def handle(self, *args, **options):
        if options.get('empresa') is None:
            empresas_a_rodar = [EMPRESA_MAGAZINE, EMPRESA_SAMVALE]
        ...

# Depois — herda de ComandoComEmpresa, sem dict próprio, sem "rodar as 2"
class Command(ComandoComEmpresa):
    def handle(self, *args, **options):
        self.stdout.write(f'\nBuscando frete real — {self.empresa_ativa}...')
        buscar_frete_real_ml(self.empresa_ativa)
```

O mesmo padrão foi aplicado em `buscar_comissao_real_ml` (que também ganha `--produto`/`--mlb` via um hook próprio, `adicionar_argumentos`, sem repetir o argumento `--empresa`) e em `sincronizar_categorias_ml` (que ganha `--forcar` do mesmo jeito).

## Exemplo — validação de ponta a ponta, com execução real

**1. Suíte de teste automatizado** (`core/tests/test_nivel_0__empresa.py`, funções puras, sem banco):

```bash
poetry run pytest core/tests/test_nivel_0__empresa.py -s -v
```

Resultado: **7/7 passou**, incluindo o teste reescrito (`obter_alias_banco_ativo()` sem empresa ativa agora espera `EmpresaNaoDefinidaError`, não mais `None`) e um teste novo cobrindo `EMPRESA_POR_ALIAS_BANCO` contra erro de digitação silencioso.

**2. Teste negativo do argumento de linha de comando**, sem tocar em banco nenhum (o `argparse` barra antes de qualquer leitura):

```bash
$ poetry run python manage.py buscar_frete_real_ml
manage.py buscar_frete_real_ml: error: the following arguments are required: --empresa

$ poetry run python manage.py buscar_frete_real_ml --empresa MAGAZINE
manage.py buscar_frete_real_ml: error: argument --empresa: invalid choice: 'MAGAZINE' (choose from 'magazine', 'samvale')
```

**3. Remontagem real dos 2 bancos do zero**, já com o formato novo (minúsculo, obrigatório):

```bash
poetry run python manage.py migrate --database=magazine
poetry run python manage.py migrate --database=samvale
poetry run python manage.py iniciar_banco --empresa=magazine
poetry run python manage.py iniciar_banco --empresa=samvale
poetry run python manage.py popular_banco --empresa=magazine
poetry run python manage.py popular_banco --empresa=samvale
```

Os 2 `migrate` e os 2 `iniciar_banco` rodaram limpos. O `popular_banco` avançou 6 das ~18 etapas pras 2 empresas (produtos do ERP, anúncios do ML, indicadores de agenda, dimensões declaradas, qualidade, competição) antes de parar num erro — mas esse erro é de um bug **não relacionado** a esta decisão (planilha de referência de frete mudada sem atualizar o comando de importação), registrado à parte em [[Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada]]. As 6 etapas que rodaram antes do erro já provam que o roteamento por empresa, com o argumento novo, está funcionando corretamente com dado real, nos 2 bancos, de forma isolada.

## O que ficou de fora, de propósito

Os scripts soltos em `scripts_exploracao_ML/` e `scripts_dev/` (ex: `testar_goal_seek_via_api.py`) têm seu próprio argumento `--empresa MB`/`SV` (sigla de 2 letras, `argparse` isolado, não estendem `ComandoComEmpresa`) — uma 3ª convenção, ainda inconsistente com a que foi fixada aqui. Não foram tocados nesta rodada porque são scripts de exploração, não comandos oficiais do `manage.py` — fica registrado como possível trabalho futuro, não uma pendência esquecida.

## Relacionado

- [[Checkpoint - Implementacao de Suporte Permanente a 2 Empresas (Roteamento por Sessao)]]
- [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]
- [[Importacao de Frete ML Quebra com bulk_update Sem Primary Key Quando a Planilha Tem Chave Duplicada]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
