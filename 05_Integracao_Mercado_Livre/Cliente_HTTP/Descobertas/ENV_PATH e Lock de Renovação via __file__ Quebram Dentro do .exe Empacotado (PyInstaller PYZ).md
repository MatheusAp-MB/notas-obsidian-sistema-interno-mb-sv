---
tipo: descoberta
dominio: python
status: ativa
criado: 15/09/2026
atualizado_em: 15/09/2026 20:02
relacionado: [Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV), Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen, Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]
---

# ENV_PATH e Lock de Renovação via __file__ Quebram Dentro do .exe Empacotado (PyInstaller PYZ)

## O que aconteceu

Ao testar o botão de teste da API do ML dentro do `.exe` do Sistema de Devoluções (ver [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]), `gerenciador_token.py` (copiado do Sistema Interno V2, ver [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]) quebrou com:

```
FileNotFoundError: [Errno 2] No such file or directory: '...\_internal\api_mercado_livre\core\auth\.token_MB.lock'
```

`ENV_PATH` e `PASTA_LOCK` são calculados a partir de `Path(__file__).resolve().parent...`. Isso funciona em desenvolvimento (arquivo real em disco), mas dentro do `.exe` empacotado com PyInstaller `--onedir`, código Python puro como esse é compilado pro PYZ (zip interno) — `__file__` aponta pra um caminho que parece real (`_internal\api_mercado_livre\...`) mas não existe fisicamente como pasta, então criar o arquivo de lock ali falha.

Tem um 2º problema, que nem chegou a aparecer no erro porque o 1º já travava antes: mesmo que a pasta existisse, a profundidade de `.parent` calculada em cima de `__file__` aponta pra dentro de `_internal\`, não pra `dist\SistemaDevolucoes\` (onde o `.env` de verdade fica, ao lado do `.exe`) — o `.env` nunca seria encontrado, silenciosamente (leria variável nenhuma, sem erro).

## Correção aplicada

Mesmo padrão que o projeto Devolução já usa em `settings.py` pra esse exato problema — caminho fixo a partir de `sys.executable` quando `sys.frozen` é verdadeiro, em vez de derivar de `__file__`:

```python
if getattr(sys, "frozen", False):
    _PASTA_BASE = Path(sys.executable).resolve().parent
else:
    _PASTA_BASE = Path(__file__).resolve().parent.parent.parent.parent

ENV_PATH = _PASTA_BASE / ".env"
PASTA_LOCK = _PASTA_BASE
```

Aplicado só na cópia do `api_mercado_livre` dentro do `Projeto-Sistema-Devolucao` (não no Sistema Interno V2, que não roda empacotado hoje — mas a mesma fragilidade existe lá, latente, se algum dia precisar rodar como `.exe`).

## Por que registrar

Mesma família de bug já documentada em [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]] (banco/mídia), mas em código diferente (cliente de API, não Django) — reforça que qualquer caminho calculado por `__file__` pra leitura/escrita real em disco precisa de tratamento `sys.frozen` explícito neste projeto, não só os já conhecidos.

## Relacionado

- [[Migracao da API do Mercado Livre com Suporte a Multiplas Contas (MB e SV)]]
- [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]]
- [[Preparação — Botão de Teste da API do ML Dentro do .exe do Sistema de Devoluções]]
