---
tipo: descoberta
dominio: python
status: ativa
criado: 09/09/2026
atualizado_em: 09/09/2026 02:07
relacionado: [Checkpoint - Empacotamento e Entrega do .exe, Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja, Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen, 2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]
---

# 2 Bugs na Abertura pelo IP da Rede — CWD do .env e Query String em URL Local

**Contexto**: o objetivo era o `.exe` abrir sozinho, ao ser executado, direto no endereço IPv4 da rede local (ex.: `http://192.168.3.45:8000/`) em vez de só `http://127.0.0.1:8000/` — assim o sistema também fica acessível pelo celular, na mesma rede Wi-Fi, sem precisar digitar nada manualmente. Esse IP precisa vir de uma variável no `.env` (`IPV4_LOCAL`), nunca escrito direto no código (hardcoded), porque na hora em que o `.exe` for entregue pra colega de equipe (usuária final, no barracão), ainda não se sabe qual é o IPv4 real da máquina dela — e ela não vai ter acesso nenhum ao código-fonte lá, só ao `.exe` já compilado, sua pasta `_internal` e o `.env` do lado. Ou seja: o `.env` precisa poder ser editado depois de compilado, sem recompilar nada.

**O problema**: mesmo com `IPV4_LOCAL` preenchido corretamente no `.env`, e mesmo com o Windows Firewall confirmando (com aquele popup de permissão) que o `waitress` (servidor WSGI usado pelo `launcher.py` pra rodar o Django dentro do `.exe`) estava de fato escutando no IP da rede, o `.exe` continuava abrindo sozinho em `http://127.0.0.1:8000/` — nunca no IP configurado. Digitar o IP manualmente no navegador (celular ou PC) sempre funcionava; só a abertura automática é que insistia em cair no endereço errado.

**O que foi investigado e descartado**: a 1ª suspeita foi o IP em si — de fato, num primeiro teste, o valor veio de um adaptador de rede virtual (`vEthernet (Default Switch)`, criado automaticamente pelo Windows pra WSL/Hyper-V, sem relação nenhuma com a rede física da casa/escritório) — trocado pelo IP do adaptador físico de verdade (`Adaptador Ethernet Ethernet:`). Isso corrigiu o valor usado, mas não resolveu o sintoma. Também foi cogitado (e descartado, por decisão consciente) escutar em `0.0.0.0` (todas as interfaces de rede ao mesmo tempo) — funcionaria, mas o IP da máquina de produção é fixo (PC de mesa, sempre a mesma rede), então escutar num endereço específico é mais simples de entender e já é o mesmo padrão usado no dia a dia com `python manage.py runserver ipv4:8000`.

**A causa raiz — bug 1: `.env` não encontrado dentro do `.exe`**: a biblioteca `python-dotenv` (usada em `projeto_sistema_devolucao_mb_sv/settings.py` pra carregar o `.env`), quando detecta que está rodando dentro de um `.exe` empacotado pelo PyInstaller (checagem por `sys.frozen`), procura o arquivo `.env` a partir do CWD (*current working directory* — a pasta de trabalho do processo, não necessariamente a pasta onde o `.exe` está fisicamente salvo). O CWD de um processo no Windows é herdado de quem o criou (o Explorer, um atalho, outro programa) e **não é garantido** ser a pasta do próprio `.exe`, mesmo com duplo clique direto nele. Resultado prático: o `.env` existia do lado certo do `.exe`, mas nunca era encontrado, e `IPV4_LOCAL` chegava sempre como `None` dentro do programa.

**A causa raiz — bug 2 (o que realmente mascarava tudo): query string perdida numa URL `file://`**: mesmo depois de corrigir o bug 1, o sintoma continuava idêntico. A tela de carregamento (`launcher_recursos/loading.html`, aberta localmente pelo `webbrowser.open()`, sem passar pelo Django/`waitress`) recebia o endereço a abrir através de um parâmetro anexado na própria URL (`arquivo.html?url=http://192.168.3.45:8000/`) — um padrão comum em qualquer site (`?busca=...`), mas que se mostrou **não confiável** quando a URL é do tipo `file://` (arquivo local) e aberta via `webbrowser.open()` no Windows: o `?...` era silenciosamente descartado, e `window.location.search`, dentro do HTML, chegava sempre vazio. Isso só ficou provado removendo o redirecionamento automático e mostrando na tela, cru, tudo que a página recebia — a caixa de depuração apareceu **completamente vazia**. Ou seja: todo teste anterior que "abria em 127.0.0.1" não era o `.env` sendo lido errado — era simplesmente nenhum dado chegando na tela, e o JavaScript caindo no valor padrão (`|| "http://127.0.0.1:8000/"`) por falta de informação nenhuma. Os 2 bugs produziam exatamente o mesmo sintoma na tela, por isso corrigir só o bug 1 pareceu não ter feito diferença nenhuma.

**A correção**:

Bug 1, em `projeto_sistema_devolucao_mb_sv/settings.py` — parar de depender do CWD e apontar a pasta do `.env` na mão, usando `sys.executable` (que sempre aponta pro `.exe` de verdade, mesmo empacotado):

```python
if getattr(sys, "frozen", False):
    PASTA_ENV = Path(sys.executable).resolve().parent
else:
    PASTA_ENV = Path(__file__).resolve().parent.parent

load_dotenv(PASTA_ENV / ".env", override=True)
```

Bug 2, em `launcher.py` — abandonar por completo a query string. Em vez de anexar dado na URL, os dados são embutidos DENTRO do conteúdo do HTML (substituindo um marcador de texto, `__DADOS_JSON__`), esse HTML já pronto é salvo num arquivo temporário, e só então aberto — sem nenhum `?` na URL:

```python
html = html.replace("__DADOS_JSON__", json.dumps(diagnostico))
caminho_temp = os.path.join(tempfile.gettempdir(), "sistema_devolucoes_tela.html")
with open(caminho_temp, "w", encoding="utf-8") as f:
    f.write(html)
webbrowser.open(Path(caminho_temp).as_uri())
```

**Por que essa correção é robusta, não só "parou de dar erro dessa vez"**: como o dado agora é parte física do conteúdo do arquivo HTML (escrito nele antes de abrir), em vez de depender de uma URL que pode ser truncada, mal-escapada ou simplesmente ignorada pelo sistema operacional, deixa de existir o canal que estava falhando — é o mesmo padrão usado por qualquer app desktop que gera uma tela HTML local com dado dinâmico.

**Confirmado**: recompilado e testado de ponta a ponta em 09/09/2026 — o `.exe` abriu direto no IP da rede configurado no `.env`, sem nenhuma intervenção manual.

> [!warning] Ponto em aberto — tela de carregamento ainda no estado de diagnóstico
> Pra provar o bug 2, o `loading.html` foi transformado numa tela de diagnóstico bruto (título "Diagnóstico", mostra `sys.executable`, o caminho calculado do `.env`, se ele existe, e exige clique manual em "continuar"). Isso ainda não foi revertido pra a tela simples e automática ("Iniciando o sistema...") que deve ir pra colega de equipe — ver item em aberto no [[Checkpoint - Empacotamento e Entrega do .exe]].

## Relacionado

- [[Checkpoint - Empacotamento e Entrega do .exe]]
- [[Arquitetura de Entrega do App de Devolução — PyInstaller Onedir, Loading HTML e Ícone de Bandeja]]
- [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]]
- [[2 Bugs Reais no .exe Empacotado — Import Dinâmico do reportlab e Migração Não Chamada]]
