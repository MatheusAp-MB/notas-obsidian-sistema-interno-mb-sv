---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: concluido
criado: 16/09/2026
atualizado_em: 16/09/2026 03:27
relacionado: [[Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca-Foto e Motivo Literal Adiados]], [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
resumo: Mockup do Hub de Consulta (resumo compacto + chat real de mensagens de mediação no Bloco 4) aprovado e implementado em Django — HTML/CSS reestruturados, mensagens sanitizadas com bleach — e ligado à home com os cards "Consultar Pedido" e "Devoluções".
---

# Hub de Consulta Implementado — Resumo Compacto, Chat de Mediação com bleach e Cards Novos na Home

Continuação de [[Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca-Foto e Motivo Literal Adiados]]: o mockup do Hub de Consulta foi refinado no Design Canvas (card de resumo do pedido compacto em vez de 2 cards separados, e um chat de verdade — bolhas por remetente, no mesmo espírito do padrão ML/VOCÊ/CONTRAPARTE do script `varredura_respostas_mediacao.py` — dentro do Bloco 4 do acordeão), aprovado por Matheus ("Ficou MUITO BOM") e implementado em Django no mesmo dia.

## Mockup aprovado

- Resumo do pedido: 2 cards separados viraram 1 card compacto.
- Bloco 4 do acordeão ("Mediação"): ganhou um loop de chat real com as mensagens da mediação, no mesmo estilo visual do restante do sistema (tokens de cor, Bootstrap, FontAwesome).

## Implementação real (Django)

- `consultar_pedido.html`: template reestruturado pro card de resumo compacto e pro loop de chat dentro do Bloco 4.
- `layout_consultar_pedido.css`: novas classes (`.consultar-pedido-atalho`, `.consultar-pedido-campo-rotulo`, `.consultar-pedido-chat-*`) pro novo layout.
- `views.py`: mensagens de mediação passaram a ser sanitizadas com `bleach` antes de renderizar como HTML (`TAGS_PERMITIDAS_MENSAGEM`/`ATRIBUTOS_PERMITIDOS_MENSAGEM`, `_preparar_mensagem_html()`, `_construir_mensagens_mediacao()`) — escolha feita em vez de só remover tags como o script de terminal fazia, já que aqui o conteúdo é renderizado na tela com `|safe`.
- `pyproject.toml`: dependência `bleach (>=6.2.0,<7.0.0)` adicionada; `poetry.lock` atualizado.
- Entregue como diffs Localize/Substitua (nunca editado direto no repositório) e aplicado, commitado e enviado ao GitHub por Matheus.

## Home page ganhou os atalhos

`estrutura_home.html`: removido o card "Teste API Mercado Livre" (servia só pra validar a conexão, já não faz mais sentido como card fixo); adicionados "Consultar Pedido" (ícone `fa-magnifying-glass`, aponta pra `consultar_pedido_ml`) e "Devoluções" (ícone `fa-clipboard-list`, aponta pra `devolucoes_pendentes`), reordenados pra bater com a ordem da sidebar.

## Validado

Matheus confirmou "funcionou" tanto pro Hub de Consulta atualizado quanto pros cards novos na home, em desenvolvimento e dentro do `.exe` compilado.

## Em aberto

Seguem de pé, sem mudança, os 2 pontos já registrados em [[Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca-Foto e Motivo Literal Adiados]]:
- [ ] Investigar o campo de conteúdo das mensagens em `claims/messages` pra extrair o texto literal do motivo da devolução
- [ ] Se algum dia for necessário: investigar `GET /items/{item_id}` pra marca e foto do produto

## Relacionado

- [[Tela Hub de Consulta Validada Contra Dado Real — Atalhos do ML Resolvidos, Marca-Foto e Motivo Literal Adiados]]
- [[Ideia das 3 Telas de Mediações e Reclamações ML — Painel de Acompanhamento, Detalhe do Pedido e Hub de Consulta]]
