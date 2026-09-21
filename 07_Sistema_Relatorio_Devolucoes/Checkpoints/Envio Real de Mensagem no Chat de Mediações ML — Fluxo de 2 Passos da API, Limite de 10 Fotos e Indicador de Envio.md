---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 21/09/2026
atualizado_em: 21/09/2026 02:41
relacionado: [[Mockup de Melhorias em Mediações ML Aprovado para Testes — Painel Geral, Lista em Estilo Chat e Campo de Resposta com Anexo de Foto]], [[Trava do Chat de Mediações ML — Model TravaChatMediacao com Senha Fixa Protegendo o Envio Ainda Não Implementado]], [[Validação da Documentação Oficial do Endpoint de Download de Anexos — post-purchase v1 Confirmado como Canônico e Contradição Interna Entre Versões EN e PT do Mercado Livre]], [[Proxy de Anexo com Bearer Token e Miniatura em Lightbox Substituem o Ícone Clicável no Chat de Mediação]]
resumo: "1ª vez que o sistema manda alguma coisa PRA DENTRO de uma mediação do Mercado Livre (até então só lia) — resolve o item que tinha ficado em aberto na nota do Mockup ('decidir se o campo de resposta entra nesta rodada'). Implementado em 2 commits (e4be2a2, 02:09:58, e o ajuste 2946c00, 02:20:37). Fluxo oficial de 2 passos: 1) sobe cada foto separada via POST .../attachments (multipart, 1 chamada por arquivo — API não tem upload em lote), guardando o filename que a API devolve; 2) manda POST .../actions/send-message citando esses filenames em attachments, junto do texto e do receiver_role. chamar_api (funil único de toda chamada à API do ML) ganhou 2 parâmetros novos, retrocompatíveis: arquivos (pro multipart) e codigos_sucesso (default {200}, mas send-message responde 201). receiver_role é decidido dinamicamente (determinar_receiver_role) buscando o stage FRESCO na API (nunca do cache) — dispute vira sempre 'mediator', claim normal inverte meu_papel (complainant↔respondent); se não der pra decidir com segurança, recusa o envio em vez de arriscar mandar pro destinatário errado. Escopo combinado com Matheus: só JPG/PNG (não PDF), até 10 fotos por mensagem (número que ele mesmo confirmou como bom limite), 5MB por arquivo (limite documentado da própria API) — validado nos 2 lados (JS antes de montar o FormData, view de novo no servidor). Exige TravaChatMediacao liberada (403), checado no servidor, não só no HTML. Erros sempre em mensagem segura pra mostrar direto pra Ana (ErroEnvioMensagem), com aviso explícito e distinto se as fotos já subiram mas a mensagem de texto falhou (evita risco de reenvio duplicado). Ajuste (2946c00, 20 min depois): erro de claim não encontrado no cache virou JSON explícito (era HttpResponse 404 'cru', caía no erro genérico do JS); adicionado indicador de texto visível 'Enviando mensagem, aguarde...' (antes só trocava o ícone do botão por spinner). Matheus rodou os 2 scripts de diff com sucesso (14/14 e 6/6 passos OK) e testou no .exe recompilado — miniaturas funcionando. Teste contra a API real do Mercado Livre, com Ana, fica pra o dia seguinte."
---

# Envio Real de Mensagem no Chat de Mediações ML — Fluxo de 2 Passos da API, Limite de 10 Fotos e Indicador de Envio

## Contexto — resolve o item em aberto do mockup

A nota [[Mockup de Melhorias em Mediações ML Aprovado para Testes — Painel Geral, Lista em Estilo Chat e Campo de Resposta com Anexo de Foto]] tinha deixado registrado, como item em aberto: "decidir se o campo de resposta (texto + foto) entra nesta rodada de implementação ou fica pra depois — hoje é só mockup visual". No mockup, o preview local de foto era funcional (JS puro, sem upload), mas o envio de verdade não existia em lugar nenhum — nem lá, nem no sistema real. Esta nota documenta essa decisão sendo tomada: sim, entrou nesta rodada, com envio de verdade pra API do Mercado Livre.

## Extensão do funil único da API — chamar_api ganha upload multipart

Toda chamada à API do ML passa por `chamar_api` (`api_mercado_livre/core/estrutura_api/cliente_api.py`). Ganhou 2 parâmetros novos, ambos com default que preserva 100% do comportamento anterior pra quem não especificar:

```python
def chamar_api(metodo, endpoint, pasta_logs, conta, params=None, json_body=None,
                max_tentativas=5, nome_log="api", headers_extra=None,
                espacador_ativo=True, arquivos: dict = None, codigos_sucesso: set = None):
    ...
    codigos_sucesso = codigos_sucesso or {200}
    ...
    resposta = requests.request(
        metodo, url, headers=headers, params=params, json=json_body, files=arquivos,
        timeout=(TIMEOUT_CONEXAO_SEGUNDOS, TIMEOUT_LEITURA_SEGUNDOS),
    )
    ...
    if resposta.status_code in codigos_sucesso:
        ...
```

`arquivos` vai direto pro `files=` do `requests` (upload multipart). `codigos_sucesso` existe porque `actions/send-message` responde `201 Created`, não `200` — o resto da API do projeto continua checando só `{200}` por padrão. As 2 tentativas de chamada (principal e o retry depois de um 206) ganharam `files=arquivos` igual.

## Fluxo de 2 passos, confirmado contra a doc oficial (e contra uma opinião do ChatGPT)

Documentado oficialmente (e confirmado por Matheus cruzando com uma opinião trazida do ChatGPT sobre o mesmo fluxo, sem nenhuma mudança de código necessária depois da comparação):

1. **Upload do anexo** — `POST /post-purchase/v1/claims/{claim_id}/attachments`, multipart, **1 chamada por arquivo** (a API não tem endpoint de upload em lote). Resposta: `{"user_id": ..., "filename": "..."}`.
2. **Envio da mensagem** — `POST /post-purchase/v1/claims/{claim_id}/actions/send-message`, corpo JSON `{"receiver_role": ..., "message": ..., "attachments": [...]}`, citando os `filename` devolvidos no passo 1. Sucesso = `201`.

```python
def enviar_mensagem_mediacao(conta, cache, mensagem, arquivos_anexo):
    receiver_role = determinar_receiver_role(conta, cache)
    if receiver_role is None:
        raise ErroEnvioMensagem(
            'Não deu pra descobrir com segurança quem deve receber essa mensagem '
            '(papel do usuário na mediação não identificado). Atualize a mediação '
            'e tente de novo.'
        )

    nomes_anexos_enviados = []
    for indice, (nome_original, conteudo, content_type) in enumerate(arquivos_anexo, start=1):
        nome_seguro = _sanitizar_nome_anexo(nome_original, indice)
        try:
            resposta = chamar_api(
                "POST", f"/post-purchase/v1/claims/{cache.claim_id}/attachments",
                pasta_logs=PASTA_LOGS_ML, conta=conta,
                arquivos={'file': (nome_seguro, conteudo, content_type)},
                codigos_sucesso={200, 201},
            )
        except (ErroAPI, ErroAutenticacaoAPI, FalhaAutenticacao) as erro:
            raise ErroEnvioMensagem(
                f'Falha ao enviar a foto "{nome_original}" pro Mercado Livre. '
                f'Nada foi enviado ainda -- tente de novo. ({erro})'
            )
        nomes_anexos_enviados.append(resposta.json().get('filename'))

    try:
        chamar_api(
            "POST", f"/post-purchase/v1/claims/{cache.claim_id}/actions/send-message",
            pasta_logs=PASTA_LOGS_ML, conta=conta,
            json_body={'receiver_role': receiver_role, 'message': mensagem, 'attachments': nomes_anexos_enviados},
            codigos_sucesso={200, 201},
        )
    except (ErroAPI, ErroAutenticacaoAPI, FalhaAutenticacao) as erro:
        if nomes_anexos_enviados:
            raise ErroEnvioMensagem(
                'As fotos foram enviadas pro Mercado Livre, mas a mensagem de texto '
                f'falhou ao enviar. Confira direto no Mercado Livre antes de tentar de '
                f'novo, pra não duplicar foto. ({erro})'
            )
        raise ErroEnvioMensagem(f'Falha ao enviar a mensagem pro Mercado Livre. ({erro})')
```

**[ATENÇÃO] → gap de design conhecido, registrado mas não implementado**: se as fotos sobem com sucesso e só a mensagem de texto falha, `nomes_anexos_enviados` (os filenames já confirmados pela API) não é persistido em lugar nenhum — se Ana tentar de novo, sobe as mesmas fotos outra vez, duplicando anexos na mediação. A função já avisa isso explicitamente na mensagem de erro (pra ela conferir direto no ML antes de reenviar), mas não existe retry-sem-reupload automático. Não foi pedido nem implementado nesta rodada — só fica registrado aqui como gap real e consciente.

## receiver_role — decidido com stage sempre fresco, nunca do cache

```python
def _stage_atual_do_claim(conta, claim_id):
    try:
        resposta = chamar_api("GET", f"/post-purchase/v1/claims/{claim_id}", pasta_logs=PASTA_LOGS_ML, conta=conta)
    except (ErroAPI, ErroAutenticacaoAPI, FalhaAutenticacao):
        return None
    return resposta.json().get('stage')


def determinar_receiver_role(conta, cache):
    stage = _stage_atual_do_claim(conta, cache.claim_id)
    if stage is None:
        stage = (cache.dados_brutos or {}).get('stage')

    if stage == 'dispute':
        return 'mediator'
    if cache.meu_papel == 'complainant':
        return 'respondent'
    if cache.meu_papel == 'respondent':
        return 'complainant'
    return None
```

Motivo de buscar o `stage` fresco em vez de usar o cache: um `claim` pode virar `dispute` depois da última varredura — usar um `stage` desatualizado mandaria a mensagem pro destinatário errado. Só cai pro `dados_brutos` em cache se a busca falhar. Se não der pra decidir com segurança (nenhum dos 2 papéis bate), recusa o envio em vez de arriscar.

## Validações — cliente e servidor, escopo combinado com Matheus

```python
EXTENSOES_ANEXO_PERMITIDAS = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png'}
TAMANHO_MAXIMO_ANEXO_BYTES = 5 * 1024 * 1024  # 5MB -- limite documentado da própria API do ML
LIMITE_ANEXOS_POR_MENSAGEM = 10  # combinado com Matheus, 21/09/2026 -- API não documenta um máximo
```

Só JPG/PNG — Matheus pediu especificamente "anexo de imagens", PDF fica de fora por decisão de escopo, não por limitação técnica. 10 fotos por mensagem foi o número que Matheus confirmou como "bom limite" depois de ser perguntado sobre mandar 8 fotos numa mensagem só — a API do ML não documenta um máximo. 5MB é o limite documentado da própria API pra upload (não pra download, que não tem limite documentado — ver [[Validação da Documentação Oficial do Endpoint de Download de Anexos — post-purchase v1 Confirmado como Canônico e Contradição Interna Entre Versões EN e PT do Mercado Livre]]).

Nome de arquivo sanitizado antes de subir — a doc oficial só aceita `[a-zA-Z0-9_-]` até 125 caracteres mais extensão, e nome de foto de celular tem espaço/acento/parênteses:

```python
def _sanitizar_nome_anexo(nome_original, indice):
    base, extensao = os.path.splitext(nome_original)
    extensao = extensao.lower()
    base = re.sub(r'[^a-zA-Z0-9_-]', '_', base)[:80] or 'anexo'
    return f"{base}_{indice}{extensao}"[:125]
```

A view `enviar_mensagem_chat_mediacao` (`devolucoes/views.py`) revalida tudo de novo no servidor, mesmo já validado no JS — extensão, tamanho e quantidade, com mensagem nomeando o arquivo específico que falhou:

```python
def enviar_mensagem_chat_mediacao(request, claim_id):
    if request.method != 'POST':
        return JsonResponse({'erro': 'Método não permitido.'}, status=405)

    if not TravaChatMediacao.objects.filter(pk=1, liberado=True).exists():
        return JsonResponse({'erro': 'Chat travado -- libere com a senha antes de enviar.'}, status=403)

    cache = ClaimMercadoLivre.objects.filter(claim_id=claim_id).first()
    if not cache:
        return JsonResponse({'erro': 'Reclamação não encontrada no cache local -- atualize a página e tente de novo.'}, status=404)

    mensagem = (request.POST.get('mensagem') or '').strip()
    arquivos_recebidos = request.FILES.getlist('anexos')

    if not mensagem and not arquivos_recebidos:
        return JsonResponse({'erro': 'Escreva uma mensagem ou anexe pelo menos uma foto.'}, status=400)
    if len(arquivos_recebidos) > LIMITE_ANEXOS_POR_MENSAGEM:
        return JsonResponse({'erro': f'Máximo de {LIMITE_ANEXOS_POR_MENSAGEM} fotos por mensagem (você anexou {len(arquivos_recebidos)}).'}, status=400)

    arquivos_validados = []
    for arquivo in arquivos_recebidos:
        extensao = Path(arquivo.name).suffix.lower()
        content_type = EXTENSOES_ANEXO_PERMITIDAS.get(extensao)
        if not content_type:
            return JsonResponse({'erro': f'"{arquivo.name}" não é uma foto JPG ou PNG -- só essas 2 são aceitas.'}, status=400)
        if arquivo.size > TAMANHO_MAXIMO_ANEXO_BYTES:
            return JsonResponse({'erro': f'"{arquivo.name}" passa de 5MB -- reduza o tamanho e tente de novo.'}, status=400)
        arquivos_validados.append((arquivo.name, arquivo.read(), content_type))

    conta = CONTA_POR_EMPRESA.get(obter_empresa_ativa())
    if not conta:
        return JsonResponse({'erro': 'Empresa ativa sem conta de Mercado Livre configurada.'}, status=400)

    try:
        enviar_mensagem_mediacao(conta, cache, mensagem, arquivos_validados)
    except ErroEnvioMensagem as erro:
        return JsonResponse({'erro': str(erro)}, status=502)

    return JsonResponse({'ok': True})
```

Nota que a checagem de [[Trava do Chat de Mediações ML — Model TravaChatMediacao com Senha Fixa Protegendo o Envio Ainda Não Implementado]] vem logo no início, antes até do `ClaimMercadoLivre` — nada roda sem o chat estar liberado no servidor.

## Frontend — arquivos reais retidos, FormData, controles desabilitados durante o envio

`script_mediacoes_ml.js`: o array `arquivosSelecionados` passou a reter os objetos `File` de verdade (antes eram descartados, `input.value = ''` logo depois do preview) — limite de 10 checado no cliente antes mesmo de montar a requisição. No clique de enviar: monta `FormData`, desabilita os controles (anexar/textarea/enviar), troca o ícone do botão por spinner, `fetch()` `POST` com headers `X-CSRFToken`/`X-Requested-With`, recarrega a página em caso de sucesso (repuxa o chat pela mesma rota de live-fetch que já roda quando a tela abre — não precisa de lógica nova de refresh), `window.alert` com a mensagem de erro vinda do servidor + reabilita os controles em caso de falha.

## Ajuste (2946c00, 02:20:37) — 2 correções pedidas por Matheus depois de revisar

Matheus revisou o resultado e fez 2 perguntas diretas: se teria aviso explícito do que falhou, e se teria um indicador textual de "enviando" (não só o ícone virando spinner). Confirmou os 2 ajustes ("SIM" pro primeiro, "quero o texto explícito" pro segundo):

1. **404 sem JSON virava erro genérico no JS** — `if not cache: return HttpResponse(status=404)` (sem corpo JSON) fazia o `fetch()` cair no `catch` genérico ("confira a internet"), escondendo a causa real. Corrigido pra `JsonResponse({'erro': 'Reclamação não encontrada no cache local -- atualize a página e tente de novo.'}, status=404)`.
2. **Indicador de texto "Enviando..."** — novo `<p class="med-resposta-status" data-resposta-status hidden><i class="fas fa-spinner fa-spin"></i> Enviando mensagem, aguarde...</p>` entre a caixa de resposta e a nota de rodapé; JS mostra (`hidden = false`) antes do `fetch()` e esconde de novo nos 2 caminhos de erro (servidor e rede). CSS novo: `.med-resposta-status[hidden] { display: none; }` — necessário porque a regra base já usa `display: flex`, que por si só sobrescreveria o atributo `hidden` nativo (mesmo padrão já usado em `.med-resposta-anexos[hidden]`).

## Testado e confirmado

Matheus rodou os 2 scripts de diff com sucesso: `aplicar_envio_mensagem_mediacao.py` (14/14 passos OK) e `aplicar_ajustes_envio_mensagem.py` (6/6 passos OK). Testado depois no `.exe` recompilado — miniaturas em thumbnail funcionando. **Teste contra a API real do Mercado Livre (enviar mensagem de verdade pra uma mediação), com a Ana, fica agendado pro dia seguinte — nada disso rodou contra a API real ainda**, aviso que o próprio comentário no código já deixa registrado.

## Relacionado

- [[Mockup de Melhorias em Mediações ML Aprovado para Testes — Painel Geral, Lista em Estilo Chat e Campo de Resposta com Anexo de Foto]]
- [[Trava do Chat de Mediações ML — Model TravaChatMediacao com Senha Fixa Protegendo o Envio Ainda Não Implementado]]
- [[Validação da Documentação Oficial do Endpoint de Download de Anexos — post-purchase v1 Confirmado como Canônico e Contradição Interna Entre Versões EN e PT do Mercado Livre]]
- [[Proxy de Anexo com Bearer Token e Miniatura em Lightbox Substituem o Ícone Clicável no Chat de Mediação]]
