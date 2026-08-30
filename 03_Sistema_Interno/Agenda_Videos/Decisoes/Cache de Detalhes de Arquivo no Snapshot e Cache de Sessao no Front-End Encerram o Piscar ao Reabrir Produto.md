---
tipo: decisao
dominio: 
status: resolvida
criado: 20/08/2026
atualizado_em: 20/08/2026 22:30
relacionado: [Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive, Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]
---

# Cache de Detalhes de Arquivo no Snapshot e Cache de Sessão no Front-End — Fim do "Piscar" ao Reabrir Produto

## O quê

2 camadas de cache novas, resolvendo em conjunto a reclamação do usuário de que reabrir um produto já visto na mesma sessão mostrava "carregando dados do Drive" de novo, do zero, toda vez.

## Por quê

A existência dos arquivos (barra de progresso, badges) já vinha 100% do snapshot desde a reescrita de arquitetura (ver [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]) — mas restava 1 chamada ao vivo por arquivo presente (`_obter_detalhes_arquivo`, tamanho + duração), repetida do zero toda vez que o card era aberto, mesmo sem nada ter mudado. Além disso, o JS do accordion apagava o conteúdo do card **toda vez** que ele fechava — mesmo fechando manualmente o mesmo produto — forçando uma nova requisição HTMX completa em toda reabertura.

## Pra quê

Deixar o uso diário da tela fluido: consultar o mesmo produto várias vezes numa sessão de trabalho (comum ao revisar pendências) não deveria custar tempo nem chamada de rede repetida.

## Camada 1 — cache de detalhes de arquivo dentro do próprio snapshot

Tamanho e duração de cada arquivo passaram a ser gravados dentro do próprio item JSON do snapshot (`link_visualizacao`/`tamanho_bytes`/`duracao_segundos`, ao lado de `id`/`name`), na 1ª vez que o card é aberto. Da 2ª vez em diante, `_obter_detalhes_com_cache()` lê direto do banco, sem chamada ao Drive. Falha de rede (timeout, etc.) **não é cacheada** — devolve os mesmos valores zerados de sempre, mas sem gravar nada, pra tentar de novo no próximo open em vez de ficar preso mostrando "0 KB" pra sempre por causa de 1 instabilidade passageira.

A invalidação é automática e não precisou de nenhuma lógica nova: qualquer sincronização (individual ou em massa) já sobrescreve `arquivos_videos`/`arquivos_usados` do zero, sem os campos de cache — o próximo open recalcula só quem realmente mudou.

Escolha deliberada de não criar uma camada de cache nova (Redis/memcache): o sistema já resolve exatamente esse padrão pro resto (o snapshot inteiro já É um cache persistido com refresh manual) — estender o mesmo padrão é mais consistente do que introduzir uma tecnologia nova só pra isso.

## Camada 2 — cache de sessão no front-end (não repetir a requisição pro mesmo produto)

O JS do accordion (`script_portal_drive.js`) só limpa o conteúdo de um produto ao fechar quando **outro** produto está sendo aberto no lugar dele (continua obrigatório nesse caso — 2 cópias de `#portal-drive-card` na DOM ao mesmo tempo é um bug real de ID duplicado). Fechar manualmente o mesmo produto, sem abrir outro, preserva o conteúdo já carregado. Em conjunto, o `hx-trigger` do `<details>` ganhou uma condição extra (`toggle[this.open && !this.dataset.carregado]`) — reabrir o mesmo produto nem chega a bater no servidor.

```js
document.body.addEventListener('htmx:afterSwap', function (evento) {
    var detalhe = evento.target.closest && evento.target.closest('.portal-drive-produto-linha');
    if (detalhe) detalhe.dataset.carregado = '1';
});
```

`dataset.carregado` só é limpo quando o produto é desalojado por outro abrindo no lugar — reabrir depois disso corretamente dispara uma requisição nova.

## Estado real

Entregue como LOCALIZE em `views.py` (`_obter_detalhes_arquivo`, `_obter_detalhes_com_cache`, `_indice_arquivos_por_nome`, `_montar_linha`, `_montar_contexto_card`), no template da linha (mudança de 1 atributo `hx-trigger`) e no JS do accordion. Confirmado pelo usuário: "ta bom ta otimoooo".

## Relacionado

- [[Snapshot de Drive Substitui Leitura ao Vivo e Pasta de Teste Dedicada Substitui Identidade Falsa no Portal do Drive]]
- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
