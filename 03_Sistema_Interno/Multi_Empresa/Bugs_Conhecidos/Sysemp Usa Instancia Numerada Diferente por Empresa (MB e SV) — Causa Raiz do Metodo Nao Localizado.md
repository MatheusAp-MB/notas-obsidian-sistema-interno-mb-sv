---
tipo: bug_conhecido
dominio: 
status: corrigido
criado: 17/08/2026
atualizado_em: 17/08/2026 17:10
relacionado: [Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario, Padrao de Robustez para Clientes de API Externa]
---

# Sysemp Usa Instância Numerada Diferente por Empresa (MB e SV) — Causa Raiz do "Metodo Não Localizado"

## Resumo (pra quem só quer saber o essencial)

Toda vez que a sincronização de impostos de entrada rodava com o token da **Samvale (SV)**, a API do Sysemp respondia com falha pro método `listarManifestoNotaEntrada` — sempre, em qualquer período de data testado, sem exceção. Ao longo de um dia inteiro de investigação (17/08/2026), essa falha pareceu, nessa ordem, 3 coisas diferentes — e nenhuma das 3 era a causa real:

1. Erro comum de ERP (payload errado, data errada).
2. Conta da SV sem o método habilitado no contrato com a Sysemp.
3. Intermitência/instabilidade da própria Sysemp.

**A causa raiz real é mais simples e mais estrutural do que as 3 hipóteses acima: a Sysemp não é uma API única, compartilhada entre todas as empresas clientes. Cada empresa tem a sua própria instância numerada, com endereço (URL) diferente.** A Magazine Brasileiro (MB) usa uma instância. A Samvale (SV) usa outra. O código deste projeto só conhecia o endereço da MB, fixo, e usava ele pra qualquer token — inclusive o da SV. O token da SV era aceito normalmente (não é erro de autenticação, não é permissão de conta), só que a chamada inteira ia parar no endereço errado — daí a mensagem "método não localizado", que na verdade queria dizer "endereço errado", não "conta sem permissão".

## Os 2 endereços reais

| Empresa | Endereço (URL base) da API Sysemp |
|---|---|
| Magazine Brasileiro (MB) | `https://api.sysemp.com.br/61` |
| Samvale (SV) | `https://api.sysemp.com.br/84` |

## Como isso foi descoberto — a trilha completa, com as 2 teorias erradas incluídas

Vale registrar a trilha inteira, não só a conclusão final — as 2 teorias erradas no meio do caminho são um exemplo real de raciocínio que parecia sólido, tinha evidência a favor, e mesmo assim estava errado. Fica como referência de como investigar isso da próxima vez, com mais cuidado desde o início.

### 1ª teoria (errada): "a conta da SV não tem o método habilitado"

Um primeiro teste rápido, isolado, numa janela recente de 7 dias, retornou sucesso — parecia confirmar que o método existia e funcionava normalmente pra SV, então a suspeita virou "deve ser algo específico do período grande usado na sincronização real". Só depois, olhando com mais cuidado, ficou claro o problema: aquele teste inicial não tinha nenhuma verificação de qual token realmente estava sendo usado — e o jeito como o token é carregado (variável de ambiente, com fallback silencioso pro `.env` se a variável não estiver definida naquele processo específico) permite, sem nenhum aviso, que um teste "pra SV" rode de fato com o token padrão da MB. Muito provavelmente foi exatamente isso que aconteceu nesse 1º teste — o que invalida a conclusão tirada dele.

### 2ª teoria (errada): "é intermitência da própria Sysemp"

Depois de criar uma verificação explícita de origem do token (mostrando se a variável veio do ambiente do processo ou caiu no fallback do `.env`, sem nunca imprimir o valor real — só um "fingerprint" mascarado, tipo `oQpe...q2lT`, pra conferência visual), um teste controlado e sistemático foi feito: a mesma consulta (`listarManifestoNotaEntrada`, período de 01/05/2020 até hoje), varrida ano a ano, com o token da SV **confirmado** de verdade.

Resultado: **100% de falha**, em todas as 7 janelas de ano testadas (2020, 2021, 2022, 2023, 2024, 2025, 2026), sempre a mesma mensagem. Com o token da MB confirmado, nas mesmas condições, mesma consulta: sucesso. Isso já eliminava de vez a ideia de "intermitência" (não é aleatório — é sempre a mesma falha, sempre, com o token da SV) — mas ainda não explicava **por quê**.

### Causa raiz real — confirmada com o time da Sysemp (17/08/2026)

A resposta veio de fora do código: conversando com o time de suporte da Sysemp, ficou claro que cada empresa cliente tem sua própria instância numerada da API. Batendo essa informação com o código do projeto, a causa ficou óbvia: `api_sysemp/core/cliente.py` tinha a URL da MB **fixa**, sem nenhuma forma de trocar por empresa. Qualquer chamada — com qualquer token — sempre ia pra `/61` (a instância da MB). Com o token da SV, a autenticação até passava (o token em si é válido), mas o método pedido não existe/não se aplica naquele contexto específico — resultando na mensagem enganosa "Metodo não Localizado".

## Evidência real (tabela-resumo do teste controlado, 17/08/2026)

| Token usado (confirmado por fingerprint mascarado) | Período testado | Resultado |
|---|---|---|
| SV | 2020-05-01 → 2026-08-17 (todas as 7 janelas de ano) | Falha 100% das vezes — `{'status': False, 'message': 'Metodo não Localizado'}` |
| MB | Mesmo período, mesma consulta | Sucesso — dados reais retornados |

Depois de identificar e trocar a URL base pra `/84` (a instância certa da SV), o mesmo teste com o token da SV passou a retornar dado real, sem nenhuma outra mudança.

## Onde isso mora no código

```python
# api_sysemp/core/cliente.py
class ClienteApiSysemp:
    URL_BASE = 'https://api.sysemp.com.br/61'   # <- fixo, só serve pra MB
```

Esse valor é usado dentro de `chamar()` pra montar a URL completa de qualquer chamada à API:

```python
url = f'{self.URL_BASE}/{metodo}'
```

Como `URL_BASE` é uma constante de classe (não depende de qual token foi passado), TODA instância de `ClienteApiSysemp` — não importa o token — sempre bate na instância da MB.

## Histórico — workaround manual usado antes da correção definitiva

No início do dia (17/08/2026), enquanto a correção definitiva (próxima seção) ainda não existia, o jeito de rodar a sincronização pra SV era trocar a URL manualmente antes de rodar, e devolver pra MB depois — o mesmo padrão de "sempre os 2 blocos no arquivo, 1 comentado, comentário troca de lado" que o projeto já usa pros caminhos dos arquivos do ERP. Validado com dado real nesse formato antes de a correção definitiva existir. **Esse workaround manual não é mais necessário — foi substituído pela correção definitiva abaixo.**

## Correção definitiva — APLICADA E CONFIRMADA (17/08/2026, commit `e092804`)

A URL base deixou de ser fixa por classe e virou parâmetro configurável, com override por variável de ambiente — o mesmo padrão que o token já usa (`MB_SYSEMP_API_TOKEN`). Confirmado lendo o código real do repositório sincronizado (não por suposição):

```python
# api_sysemp/core/cliente.py
class ClienteApiSysemp:
    URL_BASE_PADRAO = 'https://api.sysemp.com.br/61'   # MB, valor padrão

    def __init__(self, token, url_base=None, maximo_tentativas=MAXIMO_TENTATIVAS_PADRAO):
        if not token:
            raise ValueError('Token da API Sysemp não informado.')
        self._token = token
        self.URL_BASE = url_base or self.URL_BASE_PADRAO
        ...
```

```python
# api_sysemp/__init__.py
class ApiSysemp:
    def __init__(self, token=None, url_base=None):
        if token is None:
            token = self._carregar_token_do_env()
        if url_base is None:
            url_base = self._carregar_url_base_do_env()
        self._cliente = ClienteApiSysemp(token, url_base=url_base)
        ...

    @staticmethod
    def _carregar_url_base_do_env():
        load_dotenv('.env')
        return os.environ.get('MB_SYSEMP_API_URL_BASE') or ClienteApiSysemp.URL_BASE_PADRAO
```

Sem nenhum toggle manual de comentário sobrando na classe (`#* MAGAZINE` / `## SAMVALE`) — essa era exatamente a versão intermediária, quebrada, que apareceu mais cedo hoje: o `__init__` já tinha sido corrigido pra usar `self.URL_BASE_PADRAO`, mas a classe ainda não tinha esse atributo definido, só o antigo `URL_BASE` fixo — resultando em `AttributeError: type object 'ClienteApiSysemp' has no attribute 'URL_BASE_PADRAO'`. Corrigido de vez no commit `e092804`.

Rodar pra SV agora é só isto, num comando só, sem editar nenhum arquivo à mão:

```
MB_SYSEMP_API_TOKEN="<token da SV>" MB_SYSEMP_API_URL_BASE="https://api.sysemp.com.br/84" poetry run python manage.py sincronizar_impostos_entrada
```

Sem essas 2 variáveis, o sistema usa os valores padrão da MB automaticamente — retrocompatível, nada quebra pra quem não mexe em nada.

## Lição pra próxima vez

"Método não encontrado"/"não localizado" numa resposta de API **não significa necessariamente "esse método está desabilitado pra essa conta"** — pode ser, como foi aqui, "essa chamada foi pro endereço errado". Quando um sistema integra com uma API externa que atende mais de 1 empresa/cliente, e cada empresa pode ter endereço ou instância própria (não só credencial própria), todo cliente de API precisa tratar isso como configuração explícita por empresa desde o desenho inicial — token sozinho não é garantia suficiente de estar "falando com a conta certa".

## Relacionado

- [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]
- [[Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario]]
- [[Padrao de Robustez para Clientes de API Externa]]
