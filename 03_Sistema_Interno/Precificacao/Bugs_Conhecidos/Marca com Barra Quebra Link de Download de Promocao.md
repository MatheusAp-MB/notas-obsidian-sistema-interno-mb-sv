---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 17/08/2026
atualizado_em: 17/08/2026 10:33
relacionado: [Shopee Ganha Modo Arquivo de Promocao Igual ao TikTok]
---

# Marca com Barra Quebra Link de Download de Promoção

## Contexto

Achado em 17/08/2026, gerando promoção da Shopee pra marca real "DELLAMED/SUPERMEDY" (nome de marca com barra no meio). A tela de resultado quebrou ao montar o link de download:

```
NoReverseMatch at /shopee/promocao/resultado/<token>/
Reverse for 'shopee_baixar_promocao' with arguments '(<token>, 'DELLAMED/SUPERMEDY', 'promocao')' not found.
```

## Causa

A URL de download usa `marca` como segmento de rota: `shopee/promocao/baixar/<str:token>/<str:marca>/<str:tipo>/`. O conversor `str` do Django recusa qualquer valor com "/" — não tem como o Django reverter (nem resolver) essa URL com uma marca que já contém barra. O TikTok usa exatamente o mesmo padrão de rota — não tinha quebrado ainda só porque nenhuma marca do TikTok tinha barra no nome, mas era a mesma falha latente nos 2 apps.

Problema adjacente, mesma raiz: o nome do arquivo baixado (`Promoção_{marca}_Shopee_...xlsx`) também usa `marca` direto — "/" no nome quebra no Windows, e dentro do zip de "baixar todas" o `zipfile` interpretaria a barra como separador de pasta, criando uma subpasta silenciosamente.

## Correção

1. Trocado o conversor de rota de `str` pra `path` (aceita "/") em `shopee/urls.py` E `tiktok/urls.py`, na rota `..._baixar_promocao`. Testado antes de aplicar: a regex equivalente do Django (`.+` do conversor `path`) recua corretamente e separa "DELLAMED/SUPERMEDY" (marca) de "promocao" (tipo), mesmo os dois estando separados só por barra.
2. Nome do arquivo (individual e dentro do zip, nos 2 apps): `marca.replace('/', '-')` só pra montar `nome_arquivo` — mantém acento/espaço, neutraliza só a barra.

Não toca em `chave_cache_segura` (já lida bem com barra pra chave de cache — troca tudo que não é alfanumérico por `_`).

## Relacionado

- [[Shopee Ganha Modo Arquivo de Promocao Igual ao TikTok]]
