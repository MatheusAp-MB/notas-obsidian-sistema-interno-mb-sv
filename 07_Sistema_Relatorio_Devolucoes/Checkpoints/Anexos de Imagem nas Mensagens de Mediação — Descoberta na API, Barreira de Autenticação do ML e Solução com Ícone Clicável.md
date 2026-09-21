---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 20/09/2026
atualizado_em: 20/09/2026 18:30
relacionado: [[Auto-completar Mediação Avulsa na Criação — Bug do Status e dos Dados em Branco Resolvido com Busca Automática na API do ML]], [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]], [[Refinamento de UX do Painel de Mediações — 5 Correções de Usabilidade e Layout Fixo Estilo WhatsApp Web]], [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]], [[Mensagens Da Reclamacao Confirmam sender_role Mediator E Revelam Gap De 17 Dias Na Resposta Do Vendedor]]
resumo: Matheus quis investigar se o endpoint de mensagens da reclamação (usado pra montar o chat do painel de Mediações) também retorna os anexos de imagem que o cliente manda. Confirmado empiricamente (teste real com varredura_respostas_mediacao.py --bruto no pedido 2000017788033354) que cada mensagem tem um campo attachments com filename, original_filename, size, date_created e type — mas sem nenhuma URL pronta. Testado no navegador o padrão de URL de download já mapeado anteriormente (vendedores.mercadolivre.com.br/api/messages/packs/.../attachments/{filename}): sem estar logado, redireciona pra tela de login do ML — confirmando que esse endpoint exige sessão web (cookie), diferente do Bearer token que a API usa. Como Matheus ia se afastar do projeto por ~2 semanas a partir do dia seguinte pra cuidar de outras demandas do superior, e precisava deixar tudo estável pra Ana sem pontas soltas de dev, a ideia de embutir a imagem direto no chat (<img src>) foi descartada por ser arriscada e de resultado incerto (embed é subresource, cookie de sessão geralmente não vai junto entre domínios a menos que seja SameSite=None). Matheus propôs a solução final: em vez de renderizar a imagem, mostrar um ícone por anexo que abre a URL em nova guia — como é navegação de nível superior, o cookie de sessão do ML funciona normalmente mesmo com o SameSite padrão (Lax), e se não funcionar nada quebra, só não mostra a imagem. Implementado em 3 arquivos, usando exclusivamente dado e infraestrutura já existentes (MB_USER_ID/SV_USER_ID, cache.mensagens, live-fetch já existente) — zero chamada nova de API, zero mudança de schema. Confirmado que não precisa rodar varredura de novo: o caminho ao vivo (detalhe da mediação) já busca fresco a cada abertura de tela, e o cache (mensagens) já guardava o JSON bruto completo mesmo de varreduras antigas. Testado por Matheus (prints): ícone apareceu certo na mensagem do cliente com anexo, clique abriu nova guia e caiu no login do ML com redirect de volta pro anexo — resultado esperado sem login nesse PC, confirma URL e endpoint corretos. Validação final (se a imagem realmente abre) fica pra Ana testar logada.
---

# Anexos de Imagem nas Mensagens de Mediação — Descoberta na API, Barreira de Autenticação do ML e Solução com Ícone Clicável

## Pergunta inicial

Matheus quis investigar se `GET /post-purchase/v1/claims/{claim_id}/messages` — o endpoint que o sistema já usa pra montar o chat "Conversa com o Mercado Livre" no painel de Mediações — também retorna os anexos de imagem que o cliente manda nas mensagens (ex.: foto do produto com defeito).

## Confirmação empírica do campo attachments

Em vez de supor a partir da documentação, o teste foi feito com dado real: Matheus rodou o próprio script de diagnóstico dele, `varredura_respostas_mediacao.py`, com uma flag `--bruto` (que já existia pra imprimir o JSON completo de cada mensagem) no pedido `2000017788033354`. O resultado, colado no chat, confirmou que cada mensagem tem um campo `attachments` (lista), e cada item dessa lista tem:

- `filename`
- `original_filename`
- `size`
- `date_created`
- `type` (MIME — ex. `image/heic`, `image/jpeg`)

Sem nenhum campo de URL pronta pra acessar o arquivo.

## Descoberta da barreira de autenticação

O padrão de URL de download de anexo já tinha sido mapeado manualmente numa investigação anterior (ver [[Mapeamento Manual do Fluxo no Mercado Livre — Telas, URLs e Dados Reais (Pedido 2000017788033354)]]):

```
https://vendedores.mercadolivre.com.br/api/messages/packs/{pack_id}/sellers/{seller_id}/messages/attachments/{filename}?siteId=MLB&tag=claim&claimId={claim_id}&dispute=false
```

Matheus testou essa URL no navegador do PC de trabalho (onde não tem a conta do ML logada) — usando o Claude in Chrome. O resultado foi um redirect pra tela de login do Mercado Livre. Isso confirmou algo importante: essa URL faz parte do app web de vendedores (`vendedores.mercadolivre.com.br`), autenticado por **cookie de sessão do navegador** — não é a mesma API REST (`api.mercadolibre.com`) com Bearer token que o `chamar_api` do projeto usa. Ou seja, não dá pra buscar essa imagem do backend com o token OAuth que o sistema já tem.

## Raciocínio técnico que definiu a solução

A dúvida seguinte de Matheus foi: se ele deixar tudo pronto pra renderizar a imagem com essa URL, amanhã — com a Ana testando num navegador logado de verdade — a imagem vai aparecer pra ela?

A resposta depende de como a URL é usada:

- **Embutir como `<img src="...">` no chat** — isso é uma *subresource request*. Navegadores modernos bloqueiam cookie de sessão nesse tipo de requisição quando ela é cross-site, a menos que o cookie seja marcado `SameSite=None; Secure` (não confirmado se é o caso do ML). Arriscado e de resultado incerto sem poder testar logado.
- **Link clicado, abrindo em nova guia** — isso é uma *navegação de nível superior* (top-level navigation). Cookie de sessão funciona normalmente aqui mesmo cross-site, mesmo com o padrão mais comum de `SameSite=Lax`. Muito mais confiável.

## Contexto da decisão

Matheus ia se afastar do projeto por cerca de 2 semanas a partir do dia seguinte, pra cuidar de outras demandas do superior dele, e precisava deixar a tela estável pro uso da Ana sem nenhuma ponta solta de desenvolvimento. Isso pesou diretamente contra qualquer abordagem de resultado incerto (embed de imagem, proxy no backend) — a prioridade virou entregar algo de baixo risco, aditivo, e que falhasse de forma segura se não funcionasse.

## Solução final — ideia do próprio Matheus

Matheus propôs a solução ("gambiarra funcional"): em vez de tentar renderizar a imagem dentro do chat, mostrar um ícone por anexo em cada mensagem. A Ana, já logada no navegador dela, clica no ícone — a imagem abre numa nova guia, autenticada pela sessão dela. Se funcionar, ótimo; se não funcionar, nada quebra — ela pelo menos sabe que existe um anexo ali.

## Implementação

Diff aditivo em 3 arquivos, sem nenhuma chamada nova de API e sem mudança de schema:

- **`varredura_mediacoes.py`** — nova função `_url_anexo_mensagem(cache, conta, anexo)`, que monta a URL a partir do `filename` do anexo e do `{conta}_USER_ID` (reaproveitando o padrão de env var já existente — `MB_USER_ID`/`SV_USER_ID` — usado também pra `{conta}_ADDRESS_ID`). `_formatar_mensagens` passou a montar uma lista `anexos` (só `{'url': ...}`) por mensagem e incluir no dict retornado.
- **`mediacoes_ml.html`** — nos dois blocos de renderização do chat (detalhe "Em acompanhamento" e preview "Encontrados pelo Sistema"), adicionado um ícone (`fa-image`) por anexo, como link `target="_blank" rel="noopener"` pra `anexo.url`, só quando `msg.anexos` existir.
- **`layout_mediacoes_ml.css`** — novas classes `.med-msg-anexos` (container flex) e `.med-msg-anexo` (ícone quadrado 26×26, com hover usando as cores já existentes do tema).

## Por que não precisa rodar varredura de novo

Matheus perguntou se precisava re-varrer pros ícones aparecerem em mediações já existentes. Resposta, com base nos dois caminhos de renderização já mapeados em [[Redesenho do Painel de Mediações — Encontrados pelo Sistema, Em Acompanhamento e Varredura em Segundo Plano]]:

- **Detalhe (`atualizar_e_formatar_mensagens`)** — sempre faz uma chamada ao vivo na API a cada abertura de tela. Não depende de quando a mediação foi criada ou varrida.
- **Preview em cache (`formatar_mensagens_em_cache`)** — lê `cache.mensagens`, um `JSONField` que desde sempre guarda o JSON bruto e completo da API (`'mensagens': mensagens`, direto do `.json()`, dentro de `executar_varredura_completa`), sem filtrar campos. `attachments` já estava lá mesmo em mediações varridas há semanas — só faltava o código Python começar a ler esse campo, o que o diff agora faz.

## Teste real (prints do Matheus)

Depois de aplicar o diff, Matheus testou no painel (mediação do pedido `2000018262061202`, cliente Alexandre Balbino dos Santos): o ícone de imagem apareceu corretamente na mensagem do cliente ("Comprei 1 a mais sem querer"), que tinha anexo — e não apareceu na mensagem "Você" (sem anexo), como esperado.

Ao clicar no ícone, abriu numa nova guia e caiu na tela de login do Mercado Livre, com um `redirect_url` apontando de volta pro próprio anexo. Como Matheus não está logado no ML nesse PC, esse é exatamente o resultado esperado — e é uma boa confirmação: veio um fluxo de login normal do ML (não um erro, não 404), e foi de fato uma navegação de nível superior recebendo esse redirect, validando o raciocínio do SameSite. A confirmação final — se a imagem realmente abre depois do login — fica pra Ana testar logada amanhã; mesmo que o resultado seja diferente do esperado (ex. um download em vez de abrir a imagem), a tela continua funcionando normalmente do mesmo jeito.
