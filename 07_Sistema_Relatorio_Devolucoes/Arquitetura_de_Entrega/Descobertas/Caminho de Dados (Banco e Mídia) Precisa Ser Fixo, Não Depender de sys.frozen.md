---
tipo: descoberta
dominio: python
status: ativa
criado: 05/09/2026
atualizado_em: 05/09/2026 17:46
relacionado: [Checkpoint - Empacotamento e Entrega do .exe, Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]
---

# Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen

**Contexto**: dentro do `.exe` empacotado com PyInstaller, `BASE_DIR` (usado pra localizar o banco SQLite e a pasta de mídia) aponta pra dentro de `_internal`, uma pasta recriada do zero a cada recompilação — qualquer dado salvo ali some no próximo build.

**Descoberta**: em 02/09/2026, corrigido apontando `BASE_DIR` condicionalmente por `sys.frozen` — pasta do projeto em desenvolvimento, `%APPDATA%\SistemaDevolucoes\` dentro do `.exe`. Essa solução funcionou, mas o usuário rejeitou o resultado prático em 05/09/2026: mídia ficava numa pasta escondida do sistema (`%APPDATA%`), diferente da pasta usada em desenvolvimento — "não gostei disso... eu quero deixar num lugar fixo". Corrigido de vez: removida a distinção por `sys.frozen`; `core/settings.py` passou a ler `DADOS_DIR` direto de uma variável no `.env`, mesma pasta fixa em qualquer ambiente (dev ou `.exe`), mesmo padrão já usado pro MySQL. Testado com `runserver`: produto cadastrado com foto aparece na pasta configurada, e o problema de mídia não-compartilhada entre dev e `.exe` também some de quebra.

**Por que importa**: qualquer caminho de arquivo dentro de um app empacotado com PyInstaller precisa ser pensado com cuidado — o que parece um caminho relativo estável (`BASE_DIR`) muda de significado real dentro do `.exe`. A solução mais robusta não é calcular o caminho condicionalmente por ambiente, é fixar 1 caminho configurável (`.env`) que vale igual em qualquer lugar.

## Relacionado

- [[Checkpoint - Empacotamento e Entrega do .exe]]
- [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]
