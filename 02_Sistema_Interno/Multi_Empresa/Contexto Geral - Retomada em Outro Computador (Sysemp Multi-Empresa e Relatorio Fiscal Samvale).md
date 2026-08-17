---
tipo: checkpoint
dominio: 
status: ativo
criado: 17/08/2026
atualizado_em: 17/08/2026 17:10
relacionado: [Suporte a Multiplas Empresas MB e SV Rodando em Paralelo, Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado, Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario, Regras de Colaboracao no Repositorio de Codigo (Branch Dev), Perguntar Data e Hora Antes de Escrever no Vault]
---

# Contexto Geral — Retomada em Outro Computador (Sysemp Multi-Empresa e Relatório Fiscal da Samvale)

## Por que esta nota existe

Nota auto-contida com tudo que aconteceu hoje (17/08/2026) nesta frente de trabalho, escrita pra continuar em outro computador sem precisar da conversa original. Se você está lendo isso do zero, este é o resumo mínimo pra entender onde as coisas estão e o que falta.

## Estado do repositório de código (GitHub) — CONFIRMADO

- Repo: `MatheusAp-MB/Projeto_Sistema_Interno_V2`, branch `dev`.
- Já sincronizado no GitHub pelo usuário no momento desta nota (17/08, 17:10) — nada pendente de commit/push do lado do código.
- Últimos 2 commits reais em `dev`, do mais antigo pro mais novo:
  1. `553b010` — `fix(api_sysemp): URL base da API Sysemp passa a ser configurável por empresa (MB=/61, SV=/84)` — commit grande, juntou várias mudanças do dia (lista completa na seção 3 abaixo).
  2. `e092804` — `update` — correção final do bug crítico do `AttributeError` (seção 1 abaixo). **Este é o commit mais recente, confirmado com `git log`/`git pull` no fim desta sessão.**

## O que foi resolvido hoje, do mais crítico pro mais simples

### 1. Bug raiz do dia: Sysemp usa 1 endereço de API diferente por empresa — RESOLVIDO E CONFIRMADO

Nota completa: [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]] (status agora `corrigido`).

Resumo: a sincronização de impostos de entrada da SV falhava sempre com "Metodo não Localizado" — não era permissão de conta nem intermitência (2 teorias erradas testadas e descartadas ao longo do dia), era a URL base da API Sysemp fixa na instância da MB (`/61`) em vez da SV (`/84`). Descoberto via conversa direta com o time de suporte da Sysemp, não pelos diagnósticos automatizados.

Correção definitiva aplicada e CONFIRMADA no código real (commit `e092804`, lido direto do repositório sincronizado):

```python
# api_sysemp/core/cliente.py
class ClienteApiSysemp:
    URL_BASE_PADRAO = 'https://api.sysemp.com.br/61'   # MB, valor padrão

    def __init__(self, token, url_base=None, maximo_tentativas=MAXIMO_TENTATIVAS_PADRAO):
        ...
        self.URL_BASE = url_base or self.URL_BASE_PADRAO
```

Sem nenhum toggle manual de comentário (`#* MAGAZINE` / `## SAMVALE`) sobrando — essa era exatamente a versão quebrada de mais cedo hoje, que causou `AttributeError: type object 'ClienteApiSysemp' has no attribute 'URL_BASE_PADRAO'` (o usuário tinha aplicado só metade do fix original, faltava esta parte). Confirmado corrigido de verdade lendo o arquivo, não por suposição.

Rodar pra SV agora é só isto, num comando só, sem editar nenhum arquivo à mão:

```
MB_SYSEMP_API_TOKEN="<token da SV>" MB_SYSEMP_API_URL_BASE="https://api.sysemp.com.br/84" poetry run python manage.py sincronizar_impostos_entrada
```

Sem essas 2 variáveis, o sistema usa os valores padrão da MB automaticamente — retrocompatível, nada quebra pra quem não mexe em nada.

### 2. Tutorial completo e estabilizado do relatório fiscal da Samvale

Nota completa: [[Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario]] (versão mais recente, atualizada 17/08 às 16:45 — é a 2ª reescrita do dia, a 1ª foi às 16:15).

Passo a passo Passo 0 a Passo 9, escrito depois de uma reanálise completa do repositório real (não por suposição) — 2 coisas foram achadas nessa reanálise que mudaram o tutorial:

- O bug do `AttributeError` da seção 1 acima.
- `ImportadorProdutos.rodar_importacao_completa()` tem o processamento do arquivo de Inativos desativado de propósito (decisão do usuário, 17/08/2026, comentário no próprio código) — só o arquivo de Ativos é processado agora. O tutorial reflete isso: Passo 4 só cobre o arquivo de Ativos, Inativos não precisa nem existir em disco enquanto essa decisão estiver de pé.

Estrutura resumida (ler a nota completa antes de seguir — ela tem os comandos exatos e a seção de Resolução de Problemas):

- Passo 0 — confirmar que `cliente.py` está na versão estável (a mesma da seção 1 acima).
- Passo 1 a 3 — criar banco temporário (`CREATE DATABASE ... sistema_interno_sv_temp`), migrate, `iniciar_banco`.
- Passo 4 — corrigir cabeçalho do arquivo de Ativos da SV (só esse — Inativos não entra mais).
- Passo 5 — ativar o bloco SAMVALE em `importar_produtos_erp.py` (comentar/descomentar, reverter depois no Passo 9).
- Passo 6 — `popular_banco`.
- Passo 7 — sincronizar impostos de entrada com token da SV + URL da SV no mesmo comando (ver seção 1 — não existe mais passo separado de trocar URL à mão).
- Passo 8 — subir `runserver`, exportar o relatório pela tela.
- Passo 9 — reverter só `importar_produtos_erp.py` de volta pra MAGAZINE (é o único arquivo que ainda precisa de reversão manual).
- Seção "Resolução de Problemas" cobre os 3 sintomas reais já vistos: `AttributeError` da URL (→ conferir Passo 0), `KeyError: 'retorno'`/"Metodo não Localizado" (→ checklist), sintomas na MB depois do trabalho (→ conferir se o Passo 9 foi esquecido).

**Em aberto, não confirmado nesta nota**: se o relatório `.xlsx` final da Samvale foi de fato gerado com sucesso antes da migração de computador — a urgência de hoje tinha um prazo (17:15) e não há confirmação registrada do resultado final.

### 3. Outras correções reais do dia (já commitadas, sem pendência)

- `conversor_celula_excel.py` — `ConversorCelulaExcel.para_texto()` agora considera vazio depois do `.strip()`, não só `is None` (célula em branco mas não `None` gerava `sku=''`, colidindo na constraint unique do banco em `bulk_create`).
- Bug de título vazio no `bulk_create` — corrigido estendendo o fallback pro EAN. Ver [[Titulo Vazio Quebra bulk_create Quando SKU e Detalhes do Produto Estao em Branco]].
- Shopee ganhou modo Arquivo de promoção, espelhando o TikTok. Ver [[Shopee Ganha Modo Arquivo de Promocao Igual ao TikTok]].
- Bug de marca com barra (ex: "DELLAMED/SUPERMEDY") quebrando o link de download de promoção, no Shopee e no TikTok — corrigido. Ver [[Marca com Barra Quebra Link de Download de Promocao]].
- `.gitignore` corrigido — `integracao_sysemp/retorno_api/` inteira ignorada agora (antes só uma subpasta específica), cobrindo os 5 arquivos JSON de cache/retorno bruto da API que nunca deveriam ir pro git.

## O que continua em aberto (decisão maior de arquitetura, não é bug)

A questão "como o sistema vai suportar MB e SV rodando de verdade em paralelo (2 usuários, ou o mesmo usuário com os 2 abertos ao mesmo tempo)" continua deliberadamente adiada — ver [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]], que já registra 5 ocorrências do mesmo padrão (token do Sysemp, contas do Mercado Livre, cadastro de produto do ERP, caminho de arquivo, e agora a própria URL do Sysemp). Cada solução de hoje (variável de ambiente por comando, comentar/descomentar bloco) é pontual e funciona pra 1 processo por vez — não escala pra 2 usuários simultâneos. Isso é conhecido e aceito, não é uma pendência esquecida.

Itens menores, sem urgência:

- `diagnostico_sysemp.py` e `teste.py` continuam na raiz do repo — chegou a ser sugerido mover pra uma pasta `scripts_dev/`, o usuário optou por manter como está.

## Regras de trabalho a lembrar ao retomar (já registradas em outras notas, só o lembrete aqui)

- Nunca escrever/editar nota do vault sem autorização explícita + data/hora explícita, dadas separadamente — ver [[Perguntar Data e Hora Antes de Escrever no Vault]].
- Sincronizar código só quando pedido; nunca commitar/dar push sozinho — ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]].
- Diffs de código sempre em texto na conversa (formato LOCALIZE/SUBSTITUA), nunca Claude criando ou executando arquivo de código diretamente.
- Token da API Sysemp nunca aparece por extenso em nenhuma nota nem na conversa — só fingerprint mascarado (4 primeiros + 4 últimos caracteres, mais o tamanho) quando precisar de conferência visual.

## Relacionado

- [[Suporte a Multiplas Empresas MB e SV Rodando em Paralelo]]
- [[Sysemp Usa Instancia Numerada Diferente por Empresa (MB e SV) — Causa Raiz do Metodo Nao Localizado]]
- [[Tutorial - Gerar Relatorio de Impostos de Entrada da Samvale (SV) em Banco Temporario]]
- [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]
- [[Perguntar Data e Hora Antes de Escrever no Vault]]
