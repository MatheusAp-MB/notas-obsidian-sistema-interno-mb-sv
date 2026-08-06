---
tipo: descoberta
dominio: testes
status: ativa
criado: 05/08/2026
atualizado_em: 05/08/2026 22:12
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]
---

# LOGIN_REQUIRED no .env Causa Falso Positivo de 71 Falhas em Testes de View

Achado em outro computador (05/08/2026), imediatamente depois de aplicar os 3 arquivos reescritos de Drive (`constantes.py`, `parser.py`, `verificador.py`). Susto grande, causa banal — registrado pra nunca mais gerar pânico igual.

## O que aconteceu

Suíte inteira rodada nesse PC devolveu **192 passed, 71 failed** — todas as 71 falhas em testes de Nível 4 (HTTP, `client.get`/`client.post`), espalhadas por 10 arquivos de view completamente diferentes (`view_agenda_videos`, `view_agendar_produto`, `view_alternar_pausado_agenda`, `view_alternar_urgente`, `view_configuracoes_agenda_videos`, `view_confirmar_ponto_roadmap`, `view_executar_acao_ciclica`, `view_historico_agenda_videos`, `view_historico_produto`, `view_marcar_ponto_roadmap`), nenhuma delas relacionada a Drive.

## Investigação (seguindo o ciclo Idealizar→Planejar→Executar→Analisar)

1. **Hipótese descartada — regressão dos 3 arquivos de Drive:** nenhum teste que falhou toca código de Drive; cobertura de `verificador.py` (17%) e `parser.py` (48%) provava que os arquivos novos quase não estavam sendo exercitados nessa suíte.
2. **Hipótese descartada — "dado sujo" no banco (levantada pelo usuário):** pytest-django cria banco de teste isolado a cada rodada; não haveria como um banco "desatualizado" fora do teste afetar o resultado de forma sistemática assim.
3. **Sinal real:** todo `obtido=` das falhas mostrava `status=302` (redirect) onde o teste esperava 200/400/404 — inclusive nos testes de produto inexistente, que deveriam bater em `get_object_or_404` antes de qualquer lógica. `resposta.context` vinha `None` em 100% dos casos — a view nunca chegava a renderizar nada.
4. **Confirmação:** teste de diagnóstico dentro do próprio pytest (`client.get(reverse('agenda_videos_principal'))`) devolveu `STATUS: 302` e `LOCATION: /login/` — toda requisição estava sendo redirecionada pro login antes de tocar a view.
   - Detalhe à parte: a 1ª tentativa de checar isso foi feita no `manage.py shell`, e devolveu um erro diferente (`DisallowedHost: testserver`) — isso não significa nada sobre o bug real, é só porque o `shell` não ativa o ambiente de teste do Django (que libera `testserver` em `ALLOWED_HOSTS`). Precisa rodar dentro do pytest pra valer.

## Causa raiz

`core/middleware.py` tem uma `AutenticacaoMiddleware` global que força login em toda rota que não comece com `/api/`, controlada por uma flag lida do `.env`:

```python
self.login_required = os.getenv('LOGIN_REQUIRED', 'False') == 'True'
...
if not rota_publica and not request.user.is_authenticated:
    return redirect(LOGIN_URL)  # '/login/'
```

Nesse PC específico, o `.env` local (arquivo fora do git, por natureza diferente em cada máquina) tinha `LOGIN_REQUIRED=True`. Como nenhum teste da suíte faz `client.force_login(...)`, toda requisição de Nível 4 caía na trava e voltava 302 — 100% das views comuns afetadas por igual, `/api/` imune por estar na lista de rotas públicas (por isso os testes de API nunca deram sintoma disso).

## Resolução

Usuário confirmou `.env` estava com `LOGIN_REQUIRED=True` nesse PC. Trocado pra `False` e suíte rodada de novo: **264 passed, 0 failed**. Confirma que os 3 arquivos de Drive não têm nenhuma regressão — as 71 falhas eram 100% configuração de máquina, zero relação com código.

## Lição

`.env` é por máquina (fora do git) — ao trocar de computador ou rodar a suíte pela 1ª vez num ambiente novo, checar `LOGIN_REQUIRED` antes de assumir qualquer bug de código quando TODOS os testes de Nível 4 (views HTTP) falharem de forma uniforme com redirect. Sintoma característico pra reconhecer de novo no futuro: `status=302` generalizado, `resposta.context is None`, e até os testes de "produto inexistente → 404" falhando (a view nunca roda).

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Ciclo de Trabalho Calmo (Idealizar Planejar Executar Analisar Corrigir Otimizar Validar)]]
