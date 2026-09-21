---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 21/09/2026
atualizado_em: 21/09/2026 02:41
relacionado: [[Validação da Documentação Oficial do Endpoint de Download de Anexos — post-purchase v1 Confirmado como Canônico e Contradição Interna Entre Versões EN e PT do Mercado Livre]], [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]], [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]], [[Envio Real de Mensagem no Chat de Mediações ML — Fluxo de 2 Passos da API, Limite de 10 Fotos e Indicador de Envio]]
resumo: "Implementado devolucoes.views.proxy_anexo_mediacao (commit 970a8db, 01:21:44), fechando o 'em aberto' deixado pela checkpoint de validação da doc oficial: o ícone de anexo do chat de Mediações ML passou a tentar baixar a imagem no backend via Bearer token (post-purchase/v1/claims/{claim_id}/attachments/{filename}/download, endpoint validado empírica e documentalmente), servindo os bytes direto sem salvar nada em disco. Se a chamada falhar por qualquer motivo (ErroAPI, ErroAutenticacaoAPI, FalhaAutenticacao), a view redireciona pro link antigo cookie-auth da Central de Vendedores (url_anexo_mensagem_fallback, renomeada de _url_anexo_mensagem) — o comportamento anterior (ícone abre em nova guia, pede login do ML) segue existindo só como rede de segurança. Só serve claim_id que já está na cache local (ClaimMercadoLivre), com a checagem implicitamente restrita à empresa ativa pelo EmpresaRouter. 14 minutos depois (commit c2bdee5, 01:35:05), a miniatura em si foi trocada: o ícone genérico (fa-image, 26×26px) virou uma miniatura real da imagem (120×120px, object-fit contain), que ativa o modal de fotos global (card-fotos-item, mesmo componente já usado em Peças/Conferência de Devolução) só depois de confirmar que a miniatura carregou de verdade — se não carregar (proxy caiu no fallback e o link exige login), o clique continua sendo um link normal, sem quebrar nada. Aproveitado o mesmo commit da miniatura pra remover aplicar_mediacoes_varredura.py (1480 linhas), script antigo de diff sem utilidade."
---

# Proxy de Anexo com Bearer Token e Miniatura em Lightbox Substituem o Ícone Clicável no Chat de Mediação

## Contexto — fechando o "em aberto"

A checkpoint [[Validação da Documentação Oficial do Endpoint de Download de Anexos — post-purchase v1 Confirmado como Canônico e Contradição Interna Entre Versões EN e PT do Mercado Livre]] tinha validado `post-purchase/v1/claims/{claim_id}/attachments/{filename}/download` como o endpoint certo pra baixar anexo via Bearer token — empírica e documentalmente — mas registrou explicitamente que nenhuma implementação tinha sido feita ou autorizada, decisão de avançar em aberto. Esta nota fecha esse "em aberto": commits `970a8db` (01:21:44) e `c2bdee5` (01:35:05), ambos 21/09/2026.

## Implementação — devolucoes.views.proxy_anexo_mediacao

Nova view, servida em `mediacoes/claim/<str:claim_id>/anexo/<str:filename>/` (`proxy_anexo_mediacao`, `devolucoes/urls.py`):

```python
def proxy_anexo_mediacao(request, claim_id, filename):
    cache = ClaimMercadoLivre.objects.filter(claim_id=claim_id).first()
    if not cache:
        return HttpResponse(status=404)

    conta = CONTA_POR_EMPRESA.get(obter_empresa_ativa())
    url_fallback = url_anexo_mensagem_fallback(cache, conta, {'filename': filename})

    try:
        resposta = chamar_api(
            "GET", f"/post-purchase/v1/claims/{claim_id}/attachments/{filename}/download",
            pasta_logs=PASTA_LOGS_ML, conta=conta,
        )
    except (ErroAPI, ErroAutenticacaoAPI, FalhaAutenticacao):
        if url_fallback:
            return redirect(url_fallback)
        return HttpResponse(status=404)

    return HttpResponse(
        resposta.content,
        content_type=resposta.headers.get('Content-Type', 'application/octet-stream'),
    )
```

Só repassa os bytes da resposta com o `Content-Type` que a própria API do ML devolveu — nada é salvo em disco, sem cache. Só serve o anexo de um `claim_id` que já está na cache local (`ClaimMercadoLivre`) — como essa consulta já é implicitamente restrita à empresa ativa pelo `EmpresaRouter`, isso também evita servir `claim_id` de uma empresa pra sessão da outra.

## Fallback preservado — nada quebra se o Bearer token falhar

Se a chamada à API falhar por qualquer motivo (`ErroAPI`, `ErroAutenticacaoAPI`, `FalhaAutenticacao` — claim/anexo não existe mais, erro de autenticação, qualquer outro erro), a view redireciona (302) pro mesmo link cookie-auth da Central de Vendedores que já existia antes dessa troca. A função que monta esse link foi renomeada de `_url_anexo_mensagem` pra `url_anexo_mensagem_fallback` (deixou de ser privada, agora é chamada de fora do módulo, por `views.py`) — mas a lógica interna (URL montada a partir de `filename` + `{conta}_USER_ID`, exige login no navegador) não mudou. Ou seja: o comportamento documentado na checkpoint [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]] (ícone abre em nova guia, cai no login do ML) continua existindo — só deixou de ser o caminho principal e virou rede de segurança.

## Miniatura com lightbox, reaproveitando o modal global de fotos

14 minutos depois (`c2bdee5`, 01:35:05), o ícone genérico de anexo (`fa-image`, quadrado 26×26px) foi trocado por uma miniatura de verdade da imagem:

```html
<a href="{{ anexo.url }}" target="_blank" rel="noopener" class="med-msg-anexo"
   title="Ver imagem anexada" data-fotos-id="med-msg-{{ forloop.parentloop.counter }}"
   data-titulo="Anexo de {{ msg.rotulo }}" data-subtitulo="{{ msg.data }}">
    <img src="{{ anexo.url }}" alt="Anexo de {{ msg.rotulo }}" class="med-msg-anexo-img" loading="lazy">
</a>
```

O quadro cresceu de 26×26 pra 120×120px (`object-fit: contain`). O `data-fotos-id` é a mesma convenção do modal de fotos único documentado em [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]] (`card-fotos-item`, `estrutura_base_global.html`) — mas a classe `card-fotos-item` que ativa o modal **não** vem no HTML: um pequeno script (`script_mediacoes_ml.js`) só adiciona essa classe depois que a `<img>` prova que carregou de verdade:

```javascript
function ativarLightbox(img) {
    img.closest('a').classList.add('card-fotos-item');
}

document.querySelectorAll('.med-msg-anexo-img').forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
        ativarLightbox(img);
    } else {
        img.addEventListener('load', function () { ativarLightbox(img); });
    }
});
```

Motivo (comentário do próprio commit): carregar como `<img src>` pode em tese ser bloqueado por SameSite, mesmo risco já considerado antes pro embed direto — mas aqui o risco é mitigado, porque se a imagem não carregar (proxy caiu no fallback, que exige login) o link **não** vira modal, continua sendo um `<a target="_blank">` normal, e o clique cai no mesmo fallback de sempre (abrir o anexo no Mercado Livre, pedindo login se necessário). Não tem cenário de quebra: ou a miniatura carrega e abre bonito no modal global, ou não carrega e o comportamento antigo (link pro ML) continua funcionando.

## Limpeza no mesmo commit

`aplicar_mediacoes_varredura.py` (1480 linhas) foi apagado nesse commit — script de diff antigo, sem utilidade depois de já aplicado.

## Arquivos alterados

- **`devolucoes/views.py`** — nova view `proxy_anexo_mediacao`; novo import `chamar_api, ErroAPI, ErroAutenticacaoAPI` e `PASTA_LOGS_ML`.
- **`devolucoes/varredura_mediacoes.py`** — `_url_anexo_mensagem` renomeada pra `url_anexo_mensagem_fallback` (não é mais privada); nova função `_url_proxy_anexo(cache, anexo)` que monta a URL do proxy via `reverse('proxy_anexo_mediacao', ...)`; `_formatar_mensagens` passou a chamar `_url_proxy_anexo` em vez de `_url_anexo_mensagem` direto.
- **`devolucoes/urls.py`** — nova rota `mediacoes/claim/<str:claim_id>/anexo/<str:filename>/`.
- **`devolucoes/templates/devolucoes/mediacoes_ml.html`** — `<a>` do anexo ganhou `data-fotos-id`/`data-titulo`/`data-subtitulo`, `<i class="fas fa-image">` virou `<img>`, nos 2 blocos de renderização do chat (detalhe e preview).
- **`devolucoes/static/devolucoes/css/layout_mediacoes_ml.css`** — `.med-msg-anexo` de 26×26 pra 120×120px; nova classe `.med-msg-anexo-img`.
- **`devolucoes/static/devolucoes/js/script_mediacoes_ml.js`** — novo bloco de ativação condicional do lightbox.
- **`api_mercado_livre/.../testar_download_anexo_mediacao.py`** — o script de exploração empírica da checkpoint anterior entrou no repositório nesse commit (271 linhas).

## Situação

Implementado e commitado (`970a8db`, `c2bdee5`). Diferente do [[Envio Real de Mensagem no Chat de Mediações ML — Fluxo de 2 Passos da API, Limite de 10 Fotos e Indicador de Envio]] (testado e confirmado no mesmo dia), esta investigação não tem registro de um teste ao vivo relatado por Matheus especificamente pra esse proxy+lightbox — validação de uso real fica pendente, natural de acontecer junto do teste da Ana amanhã, já que é a mesma tela.

## Relacionado

- [[Validação da Documentação Oficial do Endpoint de Download de Anexos — post-purchase v1 Confirmado como Canônico e Contradição Interna Entre Versões EN e PT do Mercado Livre]]
- [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]]
- [[Modal de Fotos Único e Reutilizável — Do Mockup de 3 Padrões à Limpeza do Código Morto do Catálogo]]
- [[Envio Real de Mensagem no Chat de Mediações ML — Fluxo de 2 Passos da API, Limite de 10 Fotos e Indicador de Envio]]
