---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 21/09/2026
atualizado_em: 21/09/2026 00:48
relacionado: [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]], [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]]
resumo: Retomando a limitação registrada na checkpoint anterior (endpoint de anexo exige cookie de sessão web, não Bearer token), Matheus trouxe uma opinião do ChatGPT sobre o mesmo problema recorrente, propondo um endpoint REST alternativo (post-purchase/v1) autenticado por Bearer. Em vez de confiar direto na opinião do GPT, foi construído um script Python standalone (testar_download_anexo_mediacao.py), sem integração ao sistema, pra testar empiricamente 4 candidatos de endpoint. Resultado: 2 funcionaram (post-purchase/v1/claims/.../attachments/.../download e marketplace/v2/claims/.../attachments/.../download, ambos com header Authorization Bearer, retornando o mesmo arquivo byte-idêntico) e 2 falharam com HTTP 400. Foi montada e enviada ao GPT uma mensagem única contextualizando o teste e pedindo mais informações antes de gerar qualquer código. O GPT respondeu defendendo post-purchase/v1 como o endpoint canônico da "API Reference atual de Claims" e anexou 5 HTMLs de documentação oficial que alegou ter consultado. Em vez de aceitar a síntese do GPT, os 5 HTMLs foram lidos diretamente (Mercado Pago Developers e Mercado Livre Developers). Achado principal: a própria doc do Mercado Livre se contradiz entre idiomas — a versão em inglês ("Claims Messages") usa majoritariamente marketplace/v2 e tem uma inconsistência interna no endpoint de download (o template da "Call" diz v2, mas o "Example" logo abaixo usa post-purchase/v1); já a versão em português ("Gerenciar mensagem de uma reclamação") usa post-purchase/v1 em todos os 6 endpoints documentados, sem nenhuma menção a v2. Somando a documentação do Mercado Pago (também 100% post-purchase/v1), 3 de 4 fontes apontam limpo pro mesmo endpoint, e a única que diverge se contradiz consigo mesma — o que é uma evidência mais forte do que a alegação genérica do GPT. Outras afirmações do GPT foram conferidas contra o texto oficial: os códigos de erro 401/403/404 batem palavra por palavra com a tabela de erros da doc; confirmado que o ML mascara 404 como 403 de propósito (segurança do PolicyAgent), mas isso não substitui uma checagem própria de posse do claim no proxy Django; o limite de 5MB/JPG-PNG-PDF está documentado só pra upload, nunca pra download; existe um endpoint de metadados separado que devolve o campo type, viável pra validar Content-Type; rate limit é aplicado por Client ID (aplicação), não por usuário, sem número de RPM divulgado — só orientação genérica de backoff com jitter. Conclusão: post-purchase/v1 é o endpoint certo pra usar caso um proxy de download seja implementado no futuro, mas nenhuma implementação foi feita ou autorizada nessa investigação — segue em aberto pra quando Matheus decidir avançar.
---

# Validação da Documentação Oficial do Endpoint de Download de Anexos — post-purchase/v1 Confirmado como Canônico e Contradição Interna Entre Versões EN/PT do Mercado Livre

## Retomando de onde a investigação anterior parou

A checkpoint [[Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável]] tinha ficado numa limitação concreta: o único padrão de URL de download de anexo mapeado até então (`vendedores.mercadolivre.com.br/api/messages/packs/.../attachments/{filename}`) exige cookie de sessão do navegador, não o Bearer token OAuth que o sistema já usa pra falar com a API do ML. A solução que ficou implementada foi um ícone clicável que abre o anexo numa nova guia, dependendo da Ana estar logada no navegador dela — funcional, mas sem o backend do sistema conseguir buscar ou cachear a imagem.

## A opinião do ChatGPT reabriu a questão

Matheus estava no ChatGPT conversando sobre outro assunto e o problema das fotos/anexos voltou à tona — "ele novamente me falou sobre as fotos". A opinião trazida propunha um caminho diferente: em vez do app web de vendedores (autenticado por cookie), usar um endpoint REST da própria API (`api.mercadolibre.com`), autenticado por Bearer token igual todo o resto do sistema — especificamente `post-purchase/v1/claims/{claim_id}/attachments/{fileName}/download`. Isso abriria a possibilidade de o backend baixar e servir a imagem diretamente, sem depender da sessão do navegador de quem está olhando a tela.

## Script de exploração empírica

Em vez de confiar direto na opinião do GPT, foi construído `testar_download_anexo_mediacao.py` — um script Python standalone, sem nenhuma integração ao sistema Django, rodável com `python -u`. Usa só as peças de infraestrutura já existentes e comprovadas (`obter_token_valido`/`mascarar` de `gerenciador_token.py`, `chamar_api`/`ErroAPI`/`ErroAutenticacaoAPI` de `cliente_api.py`), recebe `--empresa` (MB/SV) e `--pedido` ou `--claim-id` por linha de comando, acha o primeiro anexo disponível na conversa e testa 4 candidatos de URL em sequência, mascarando o token nos logs e salvando localmente qualquer download bem-sucedido pra conferência visual.

Rodado por Matheus contra o pedido `2000018262061202` (claim_id `5573730744`, anexo `602936747_9f189c32-8994-4a73-9b5d-c0d9aa464e20.jpg`, `image/jpeg`, 2.310.219 bytes), o resultado foi:

- **Candidato 1** (`/messages/attachments/{filename}`, header Bearer + `tag`/`site_id` na query) — HTTP 400, `"Error evaluating conversation for AI routing"`.
- **Candidato 2** (mesmo padrão, com `access_token` como query param) — HTTP 400, `"The queryparam 'site_id' is required"`.
- **Candidato 3** (`post-purchase/v1/claims/{claim_id}/attachments/{filename}/download`) — **HTTP 200**, `image/jpeg`, 2.310.219 bytes.
- **Candidato 4** (`marketplace/v2/claims/{claim_id}/attachments/{filename}/download`) — **HTTP 200**, `image/jpeg`, 2.310.219 bytes, **byte-idêntico** ao candidato 3.

Ou seja: dois namespaces diferentes da API respondem com sucesso pro mesmo arquivo, e a pergunta que sobrou foi qual dos dois é o "certo" pra depender em produção.

## Mensagem estruturada de volta pro GPT

Antes de pedir qualquer implementação, foi montada e enviada ao GPT uma mensagem única contextualizando o teste (os 4 candidatos, os 2 que funcionaram, o resultado byte-idêntico) e levantando 6 perguntas específicas em aberto — endpoint canônico, estratégia de cache, tratamento diferenciado de erros, limites de tamanho/formato em download, confiabilidade do Content-Type e considerações de controle de acesso — pedindo explicitamente mais informação antes de gerar qualquer código.

O GPT respondeu de forma detalhada, defendendo `post-purchase/v1` como o endpoint canônico "da API Reference atual de Claims", com `marketplace/v2` aparecendo (segundo ele) só em docs de Global Selling e não recomendado pra código novo. Junto da resposta, anexou 5 arquivos HTML de páginas de documentação oficial que alegou ter consultado.

## Verificação direta dos 5 documentos — não a síntese do GPT

Os 5 HTMLs foram lidos diretamente (texto extraído do HTML bruto, ignorando a alegação do GPT sobre o que eles diriam), vindos de duas fontes:

- **Mercado Pago Developers** (`api.mercadopago.com`) — páginas "Overview - Claims" e "Download attached files". As duas listam todos os endpoints de Claims exclusivamente sob `post-purchase/v1`, sem nenhuma menção a `marketplace/v2` em lugar nenhum.
- **Mercado Livre Developers** (`api.mercadolibre.com`) — a mesma página de gestão de mensagens de reclamação, em duas versões de idioma: "Claims Messages" (inglês) e "Gerenciar mensagem de uma reclamação" (português).
- Um FAQ genérico do Mercado Livre Developers sobre "Rate limit / Erro 429" (não específico de Claims).

## O achado principal: a própria doc do ML se contradiz entre idiomas

A comparação entre as duas versões de idioma da mesma página do Mercado Livre foi o achado mais forte da investigação:

A versão em **inglês** ("Claims Messages") usa `marketplace/v2` pra buscar mensagens, subir anexo e enviar mensagem — e tem uma contradição literal dentro da própria seção "Download the file": o template da "Call" mostra `.../marketplace/v2/claims/.../attachments/.../download`, mas o "Example" logo abaixo, com um claim_id real, usa `.../post-purchase/v1/claims/.../attachments/.../download`. A seção "Get file information" (metadados, sem `/download`), por sua vez, usa `post-purchase/v1` de forma consistente tanto na Call quanto no Example.

A versão em **português** ("Gerenciar mensagem de uma reclamação", atualizada em 14/07/2024, que é a doc que um vendedor brasileiro consulta na prática) usa `post-purchase/v1` em **todos os 6 endpoints documentados** — mensagens, upload de anexo, enviar mensagem, baixar arquivo, obter info do arquivo — sem nenhuma menção a `marketplace/v2` em lugar nenhum do texto.

Juntando as 3 fontes que batem entre si (Mercado Pago + versão PT do Mercado Livre) contra a única que diverge (versão EN, que se contradiz consigo mesma no próprio endpoint de download), a leitura mais sólida é que `marketplace/v2` é um resquício de uma migração pra `post-purchase/v1` ainda não finalizada na doc em inglês — não duas APIs paralelas oficialmente mantidas. Isso é uma evidência mais forte do que a alegação do GPT de ter "consultado a API Reference atual", porque é uma contradição verificável dentro do próprio site do ML, não uma afirmação de que confiar cegamente.

## Validação item a item das outras alegações do GPT

- **Erros 401/403/404** — batem palavra por palavra com a tabela oficial de erros da doc "Claims Messages" (401 = token ausente/inválido/expirado; 403 = PolicyAgent negou ou usuário sem autorização; 404 = claim ou anexo não existe).
- **403 mascarando 404 de propósito** — confirmado explicitamente no texto: ao tentar acessar um claim inexistente ou não autorizado, a API pode devolver 403 em vez de 404 como medida de segurança do PolicyAgent, pra não revelar se o recurso existe. Ressalva registrada: essa proteção é do lado do Mercado Livre contra quem chama a API deles sem token válido daquela conta — não substitui uma checagem própria de posse do claim dentro do proxy Django do sistema, caso um dia exista uma rota tipo `/anexo/<claim_id>/<filename>` (evitar que alguém de uma empresa acesse claim_id de outra, MB vs SV).
- **Limite de 5MB e formatos JPG/PNG/PDF** — confirmado que esse trecho aparece só na seção de anexar arquivo à mensagem (upload); a doc nunca menciona limite de tamanho pra download.
- **Validação de Content-Type pelo endpoint de metadados** — confirmado que existe mesmo um endpoint separado (`GET .../attachments/{filename}`, sem `/download`) que devolve `filename`, `size`, `date_created` e `type`, sem baixar o binário — viável validar o Content-Type contra esse campo antes de confiar cegamente no header da resposta de download.
- **Rate limit / 429** — não existe seção de rate limit específica pra Claims/anexos; o único documento é o FAQ genérico, que confirma backoff exponencial com jitter como recomendação oficial e um detalhe de design relevante: o controle é aplicado majoritariamente por Client ID (aplicação), não por usuário final nem por IP, e o tamanho do payload não entra no cálculo. Nenhum número de RPM divulgado.
- **Cache/persistência de anexos pra claims fechados** — nenhum dos 5 documentos fala sobre por quanto tempo o ML mantém um anexo disponível após o claim fechar. Essa recomendação do GPT é conselho de engenharia dele, não fato documentado — registrado como suposição, não como confirmado.

## Detalhe menor de qualidade da doc

A doc do Mercado Pago nomeia o parâmetro de path como `attach_id` na tabela de parâmetros, mas o template da URL usa `{fileName}` — inconsistência de nomenclatura interna da própria doc deles, sem impacto prático (é o mesmo valor).

## Conclusão e o que fica em aberto

`post-purchase/v1` é o endpoint validado — tanto empiricamente (funcionou, byte-idêntico ao v2) quanto documentalmente (3 de 4 fontes oficiais consistentes, incluindo a única 100% livre de contradição interna) — pra usar caso um proxy de download de anexos seja implementado no backend do sistema no futuro. Nenhuma implementação foi feita ou autorizada nessa investigação: a instrução de Matheus ao GPT foi explicitamente "não gere código ainda", e essa checkpoint documenta só a etapa de levantamento de informação (Idealizar). Decisão de avançar pra Planejar/Executar fica em aberto pra quando Matheus quiser retomar.
