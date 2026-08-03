---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# Imagem em Alta Resolução via Sufixo -F na URL

O array `pictures` da API do Mercado Livre retorna a imagem em resolução
baixa (500x500) por padrão, mesmo quando o campo `max_size` da mesma
resposta indica que existe uma versão maior (1200x1200). Não há campo
separado com a URL em alta resolução — a única forma de obtê-la é trocar
manualmente o sufixo no nome do arquivo da imagem.

## Contexto

`thumbnail` (campo raiz do item) é a foto principal em baixa qualidade —
usada só como ícone de listagem. `pictures[0].secure_url` já é uma
imagem melhor, mas ainda limitada a 500x500 mesmo quando `max_size` da
mesma entrada diz "1200x1200".

## Evidência real (testado por download e verificação da imagem)

URL original (500x500 confirmado por download real):
```
https://http2.mlstatic.com/D_996143-MLB112006185311_052026-O.jpg
```

Trocando o sufixo antes da extensão de `-O` para `-F`:
```
https://http2.mlstatic.com/D_996143-MLB112006185311_052026-F.jpg
```
→ imagem confirmada em 1200x1200 por download e inspeção real.

## Função de extração usada

```python
def extrair_imagem_principal(body: dict) -> str | None:
    pictures = body.get("pictures", [])
    if not pictures:
        return None
    url = pictures[0].get("secure_url") or pictures[0].get("url")
    if not url:
        return None
    try:
        base, ext = url.rsplit(".", 1)
        base_sem_sufixo = base.rsplit("-", 1)[0]
        return f"{base_sem_sufixo}-F.{ext}"
    except Exception:
        return url  # fallback: devolve a URL original se o formato for inesperado
```

## Aviso importante

Essa convenção de sufixo **não é documentada oficialmente** pela API do
Mercado Livre — foi descoberta por teste exploratório (tentativa de
várias letras até encontrar a que funciona: `-O`, `-F`, `-I`, `-V`, `-W`,
`-AD` foram testadas). Deve ser tratada como comportamento observado, não
como contrato garantido — pode mudar sem aviso se o Mercado Livre alterar
a convenção no futuro.

## Relacionado

- [[Regras Gerais]]