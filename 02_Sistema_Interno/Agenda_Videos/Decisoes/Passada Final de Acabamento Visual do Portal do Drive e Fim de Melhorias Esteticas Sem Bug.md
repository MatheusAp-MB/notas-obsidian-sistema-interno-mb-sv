---
tipo: decisao
dominio: 
status: resolvida
criado: 20/08/2026
atualizado_em: 20/08/2026 16:31
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]
---

# Passada Final de Acabamento Visual do Portal do Drive e Fim de Melhorias Esteticas Sem Bug

## O quê

Depois de aplicar e testar a reescrita de arquitetura (ver [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]), o usuário reportou 4 problemas de qualidade visual na tela do Portal do Drive — os 4 foram corrigidos na mesma passada, e o usuário decidiu encerrar a frente de melhoria estética por gosto.

## Por quê

O usuário testou a tela real no navegador e trouxe 4 pontos, nas próprias palavras: *"Não precisa de todos esses avisos de 'teste'... o código já é a versão final para uso, a única questão é que hoje é uma pasta isolada da real, mas isso não é motivo de avisar nada."* Também: *"O Header está duplicado sem necessidade, tem badges 'vazando' pra fora dos cards... Ainda acho que as cores estão muito cinza chapadas... visualmente muito feio."*

## Pra quê

Deixar a tela do Portal do Drive num nível de acabamento equivalente às telas mais maduras do sistema (Hub de Anúncios, Histórico) antes de seguir pra qualquer funcionalidade nova — e, a partir daqui, parar de gastar rodada de trabalho em ajuste visual motivado só por gosto.

## As 4 correções

### 1. Avisos de "pasta de teste" removidos por completo

Removidos os 2 banners (o da lista inteira, em `estrutura_portal_drive.html`, e o do card do produto, em `estrutura_parcial_portal_drive_card.html`) e o contexto `modo_teste_sandbox` (`views.py`) que os alimentava. Os comentários de código que explicavam a necessidade desse aviso foram atualizados pra não ficarem desalinhados com a UI real — a raiz de teste continua existindo como decisão de configuração (ver decisão de arquitetura relacionada), só deixou de ser assunto da interface. O aviso de "nunca sincronizado com o Drive" foi mantido (é informação útil, não é sobre "ser teste") — só ficou com estilo próprio (`.portal-drive-aviso-nunca-sincronizado`), não reaproveitando mais a classe do banner de teste removido.

### 2. Header duplicado

Causa raiz: a identidade do produto (foto/título/EAN/SKU/marca/estoque) já vem do `<summary>` da linha colapsada (`estrutura_parcial_identidade_produto.html`, reaproveitado do Histórico) — que continua visível mesmo com o produto expandido. O card carregado via HTMX repetia esse mesmo bloco do zero (`.portal-drive-cabecalho`). Removido o bloco duplicado; o contador de arquivos e o status de sincronização foram promovidos pra uma única linha leve no topo do card (`.portal-drive-resumo-topo`), sem repetir foto/título/códigos.

### 3. Badges "vazando" pra fora do card

Causa raiz: `.portal-drive-linha-cabecalho` (a linha de cada fase — Simples/Mensal 01/etc.) não tinha padding horizontal próprio, só herdava do card pai — o grupo de bolinhas de status e a seta ficavam praticamente colados na borda. Corrigido com `padding: 12px 6px` na própria linha.

### 4. Visual "cinza chapado"

Os cards de arquivo vazio (Base/Roteiro/Completo sem arquivo ainda) só ganhavam cor no hover — o resto do tempo eram cinza neutro sem nenhum indício visual de "isso é clicável". Passaram a ter borda e fundo levemente azulados por padrão (`#b9d6ec`/`#f7fbfe`) e o ícone "+"/texto "Selecionar ou arrastar" trocou do cinza mudo pro azul de destaque já usado no resto do sistema (`--cor-primaria-clara`) — nenhuma cor nova foi inventada, só reaproveitada a paleta que já existe.

## Técnica usada: geração de imagem (Gemini) como direção visual, não como spec

Antes de tocar no CSS real, o usuário testou usar o Gemini pra gerar uma referência visual do "objetivo" da tela (pedido explícito: testar 1 vez, comparar com a alternativa de eu montar um rascunho estático em HTML/CSS real). 3 tentativas, nesta ordem:

1. **Prompt solto**, descrevendo objetivo + referência "feed do YouTube/YouTube Shorts" + a divisão Produto→Fases→Player lado a lado. Resultado: estrutura genérica de dashboard SaaS (Products/Orders/Customers/Analytics), fases inventadas (Product Photography, Copywriting, SEO Optimization) — nada a ver com o sistema real.
2. **2ª tentativa**, já em cima da 1ª: acertou a estrutura real (Simples/Mensal/Trimestral, 3 cards Base/Roteiro/Completo) mas escreveu literalmente o **nome da cor como texto do badge** (ex.: `"VIBRANT LIGHT BLUE"`, `"GREEN"`, `"AMBER"`) em vez de só usar a cor como fundo — limite conhecido de modelo de imagem com texto pequeno/preciso dentro de UI, não resolvido só com mais densidade de prompt.
3. **3ª tentativa**, com um "brief" denso e estruturado (o que é o projeto, a dor que motivou, quem usa, hierarquia exata com os nomes reais de fase/rótulo/status, paleta de cores real do sistema em hexadecimal, padrões de botão/badge já usados, e uma seção explícita listando os erros das tentativas anteriores pra não repetir) + 1 imagem de referência real anexada, com instrução explícita de tratá-la como estilo, não como conteúdo. Resultado: estrutura, vocabulário de status (`presente`/`selecione ou arraste`/`usado`, incluindo o estado "usado" com cadeado, nunca testado nas tentativas anteriores) e paleta de cores corretos — só pequenos resíduos cosméticos (um rótulo em inglês, botão de sincronizar duplicado, ícone de play num slot vazio).

**Lição prática pra próxima vez que isso for tentado**: modelo de imagem serve bem pra decidir direção de cor/vida visual e composição — não é confiável pra texto exato dentro da UI (nome de cor vira texto visível) nem pra estrutura exata sem um brief bem fechado com exemplos reais fixos e uma lista explícita do que já deu errado antes.

## Decisão de política — fim de melhoria visual por estética

> [!important] Decisão do usuário, 20/08/2026, 16h31
> *"Está ótimo o frontend... já está muito bom, tipo bom o suficiente. Agora só vamos mexer em aparência quando for erro ou bugs, não mais melhoria 'visual' por estética."*
>
> A partir de agora, qualquer mudança de aparência no Portal do Drive só acontece quando motivada por um **defeito real** (bug visual, erro de renderização, inconsistência com o padrão do resto do sistema) — não mais por preferência estética. A frente de qualidade visual desta tela está considerada **suficiente e encerrada**.

## Estado real

As 4 correções foram aplicadas e confirmadas pelo usuário através de prints reais do navegador — os 4 pontos validados como corrigidos (nenhum aviso de teste restante, header aparecendo 1 vez só, bolinhas de status com respiro da borda, cards vazios com cor de vida).

## Pendências

Filtros estilo Hub de Anúncios (marca, contador, chips ativos, seletor de itens por página) continuam pendentes — é funcionalidade de navegação/filtro, não estética, então não é afetada pela política acima quando for retomada.

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]
