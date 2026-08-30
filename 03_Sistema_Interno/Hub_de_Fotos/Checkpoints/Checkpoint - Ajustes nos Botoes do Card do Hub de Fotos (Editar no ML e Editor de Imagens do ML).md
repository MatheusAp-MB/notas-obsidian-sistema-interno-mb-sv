---
tipo: checkpoint
dominio: 
status: concluido
criado: 28/08/2026
atualizado_em: 28/08/2026 09:37
relacionado: []
---

# Checkpoint — Ajustes nos Botões do Card do Hub de Fotos (Editar no ML e Editor de Imagens do ML)

## Contexto

O Hub de Fotos (`mercado_livre/templates/mercado_livre/estrutura_hub_fotos.html`, card em `parciais/estrutura_parcial_card_fotos_anuncio.html`) chegou nesta sessão via sincronização com o `origin/dev` (commit `2aa6fb0`, "Hub de Fotos", vindo de outra sessão/PC) — é uma tela nova, ainda sem nenhuma nota própria no vault até agora. O usuário pediu 2 ajustes pequenos no rodapé do card, "ponto a ponto":

1. Corrigir o botão "Editar no ML" (estava `href="#"`, placeholder com TODO no código) pra abrir o link real de edição do anúncio.
2. Adicionar um botão novo "Abrir no Editor de Imagens do ML" (link ainda não fornecido pelo usuário).

## Ponto 1 — "Editar no ML" — CONCLUÍDO e validado (28/08, 09:15)

### O achado real: o link usa MLBU, não MLB

O link de edição real, fornecido pelo usuário, segue o padrão:

```
https://www.mercadolivre.com.br/publicaciones/{MLBU}/modificar/omni/variation/dominio/picture-uploader-default
```

Onde `{MLBU}` (ex: `MLBU3974309526`) **não é o MLB** do anúncio — é o `user_product_id` que a API do Mercado Livre já retorna, mas que nunca tinha sido persistido no banco.

Rastreando de onde esse dado vem e por que não estava disponível:

- `integracao_mercado_livre/servicos/buscar_detalhes.py` já lê `user_product_id` da API (linhas 151 e 211) e grava no JSON bruto (`detalhes_mlbs.json`).
- `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py` (quem importa esse JSON pro banco) descartava esse campo — não estava mapeado nem em `AnuncioMercadoLivre` nem em `VariacaoAnuncioMercadoLivre`.
- O modelo `AnuncioMercadoLivre` chegou a ter um campo `mlbu` uma vez (migração `0002`), removido depois (migração `0003`) — e olhando `buscar_detalhes.py` hoje, fazia sentido ter sido removido de lá: o valor é sobrescrito **por variação** (`reg["user_product_id"] = var.get("user_product_id")`, linha 211), igual `sku_ml`/estoque/preço — varia entre variações do mesmo MLB, não é dado de agrupador (que só guarda o que é idêntico entre variações: título, permalink, etc.).

**Decisão:** o MLBU pertence a `VariacaoAnuncioMercadoLivre`, não a `AnuncioMercadoLivre`.

### Validação antes de tocar em modelo/migração

Antes de qualquer mudança de schema, foi criado um script dev (`scripts_dev/testar_link_editor_fotos_ml.py`) que lê `detalhes_mlbs.json` direto — sem Django, sem banco — e monta o link pra 5 MLBs distintos com MLBU preenchido, só pra confirmar visualmente (clicando em cada um) que o padrão de URL funciona de verdade antes de qualquer mudança de schema.

**Usuário confirmou que os 5 links funcionaram de verdade.**

### Implementação (4 arquivos + 1 migração + reimportação)

| Arquivo | Mudança |
|---|---|
| `mercado_livre/models/variacao.py` | Campo novo `mlbu = models.CharField(max_length=20, blank=True, null=True)` em `VariacaoAnuncioMercadoLivre`. |
| `core/management/commands/popular_banco_suporte/importar_anuncios_ml.py` | `user_product_id` do JSON passa a ser mapeado pra `mlbu` (no dict de criação/atualização e na lista de campos do `bulk_update`). |
| `mercado_livre/funcoes_auxiliares/classificacao_catalogo.py` | `info_variacao()` passa a expor `'mlbu': variacao.mlbu` no dicionário de cada "folha" (card) do Hub. |
| `mercado_livre/templates/mercado_livre/parciais/estrutura_parcial_card_fotos_anuncio.html` | Placeholder `href="#"` substituído por `{% if anuncio.mlbu %}` com o link real montado a partir de `anuncio.mlbu` — **o botão some quando a variação não tem MLBU** (anúncios "Simples", fora de catálogo, não têm esse dado — decisão tomada por ser o comportamento mais seguro, evita recriar um link morto). |

Depois de aplicar o código: `makemigrations`/`migrate` (gerados pelo próprio usuário, número real da migração não registrado aqui) + reimportação (`popular_banco --empresa magazine`) pra popular `mlbu` nos registros que já existiam no banco.

**Confirmado funcionando pelo usuário em 28/08, 09:15** — *"ok funcionou."*

## Ponto 2 — "Abrir no Editor de Imagens do ML" — CONCLUÍDO e validado (28/08, 09:37)

### O link real é bem mais complexo do que o do Ponto 1 — mas a maior parte dele é descartável

Link real fornecido pelo usuário (capturado abrindo o editor manualmente, pra 1 foto específica):

```
https://vendedores.mercadolivre.com.br/photo-studio-phoenix?variationId=&itemId=MLB1683028746&callbackUrl=https://vendedores.mercadolivre.com.br/anuncios/MLBU1092265387/modificar/bomni/variation/1460418022-update_omni-3494c8da2514/user_product_item_detail_form?callback_url=https://vendedores.mercadolivre.com.br/anuncios%23from=seller-menu&photo_studio_return=1&pictureId=996143-MLB112006185311_052026
```

Decompondo os parâmetros antes de propor qualquer coisa:

- `itemId` = MLB puro (já temos).
- `callbackUrl` = URL de retorno pra quando o usuário sai do editor — dentro dela vem o MLBU (já temos, campo `mlbu` do Ponto 1) **e** um trecho tipo `1460418022-update_omni-3494c8da2514`, que tem cara de token de sessão/edição gerado na hora pelo ML, não um dado que exista no nosso banco.
- `photo_studio_return=1` é fixo.
- `pictureId` = ID de UMA foto específica — não faz sentido pro nosso botão, que é por anúncio (card inteiro), não por foto individual.

**Hipótese testada antes de implementar** (mesma disciplina do Ponto 1 — nada de schema/migração sem validar primeiro): já que o botão é por anúncio, não por foto, a suspeita era que dava pra simplificar bastante — usar só o MLB no `itemId` e um `callbackUrl` genérico e fixo (`https://vendedores.mercadolivre.com.br/anuncios`), descartando o MLBU, o token de sessão e o `pictureId` por completo. Testado colando manualmente no navegador com um MLB real — **usuário confirmou "Link 100% funcional"**.

### Implementação (1 arquivo só — sem model, sem migração, sem reimportação)

Diferente do Ponto 1, esse link não precisa de nenhum dado novo — só do MLB puro, que já estava disponível no contexto do card desde antes (`anuncio.mlb`, exposto por `info_variacao()`).

| Arquivo | Mudança |
|---|---|
| `mercado_livre/templates/mercado_livre/parciais/estrutura_parcial_card_fotos_anuncio.html` | Botão novo "Abrir no Editor de Imagens do ML" adicionado no rodapé do card, ao lado de "Ver no ML"/"Editar no ML" — `href="https://vendedores.mercadolivre.com.br/photo-studio-phoenix?variationId=&itemId={{ anuncio.mlb }}&callbackUrl=https%3A%2F%2Fvendedores.mercadolivre.com.br%2Fanuncios&photo_studio_return=1"`. Sempre visível (não depende de `mlbu`, só de `mlb`, que todo anúncio sempre tem). |

**Confirmado 100% funcional pelo usuário em 28/08, 09:37.**

## Status final

Os 2 pontos pedidos nesta frente estão concluídos e validados com clique real no botão (não só teste de URL colada). Nenhuma pendência conhecida em aberto no Hub de Fotos no momento.

## Relacionado

Nenhuma nota anterior deste domínio — esta é a primeira nota de `Hub_de_Fotos` no vault.
