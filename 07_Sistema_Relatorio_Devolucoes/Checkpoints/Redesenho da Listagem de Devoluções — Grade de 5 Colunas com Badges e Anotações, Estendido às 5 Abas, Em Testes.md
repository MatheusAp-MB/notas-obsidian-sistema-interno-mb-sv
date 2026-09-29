---
tipo: checkpoint
dominio: 07_Sistema_Relatorio_Devolucoes
status: em_teste
criado: 28/09/2026
atualizado_em: 28/09/2026 07:51
relacionado: [[Estudo de Caso de Ana — Persona, Fluxo Real em 8 Fases e o Papel de Cada Tela no Sistema de Devoluções]]
resumo: Redesenho completo da tela de listagem de Devoluções (devolucoes_pendentes.html), inicialmente pedido só pra aba Mediações Abertas e depois estendido pro mesmo padrão nas outras 4 abas (Aguardando Conferência, Conferidos, Mediações Encerradas, Impressos). Sai do layout de lista simples (dp-item/dp-lista) pra uma grade de colunas fixas (foto/Produto-Loja-Pedido/Cliente-Data/Anotações/Ações), com destino do produto, reclamação dentro/fora dos 7 dias e reembolso virando badges coloridas em vez de texto solto, e um ícone com popover (sob demanda, sem pré-carregar fotos da listagem inteira) mostrando anotação da mediação e evidência da conferência. Status: EM TESTES, aguardando feedback de Matheus e da Ana. Problema já identificado nesta 1ª rodada: o formato não ficou bom em tela pequena (celular) — precisa ser melhorado antes de considerar essa tela pronta.
---

# Redesenho da Listagem de Devoluções — Grade de 5 Colunas com Badges e Anotações, Estendido às 5 Abas, Em Testes

## Contexto

Ponto de partida: a aba **Mediações Abertas** da listagem de Devoluções (tela com as 5 abas do fluxo — Aguardando Conferência, Conferidos, Mediações Abertas, Mediações Encerradas, Impressos) estava com layout de lista simples (cards em `.dp-item`/`.dp-lista`), visualmente "feio" e com espaço mal aproveitado comparado a um mockup de referência que Matheus trouxe. A partir daí o redesenho foi crescendo em ciclos, dentro da própria aba Mediações Abertas, até virar um padrão maduro o bastante pra Matheus pedir a extensão pras outras 4 abas.

## O que mudou — o padrão novo

- **Grade de colunas fixas** (`dp-tabela-grade`, 5 colunas: foto / Produto-Loja-Pedido / Cliente-Data / Anotações / Ações), com cabeçalho de coluna, no lugar da lista de cards flexível — mesma estrutura em TODAS as 5 abas agora.
- **Badges em vez de texto solto**: destino do produto (Troca/Venda como usado) virou badge colorida com ícone; reclamação dentro/fora dos 7 dias virou badge verde/vermelha (reaproveitando o mesmo `vd-badge` que a tela Visualizar Devolução já usava); reembolsado/não reembolsado/reembolso ainda não definido virou badge (3 estados só em Mediações Abertas, onde reembolso pendente é um estado real; 2 estados fixos em Mediações Encerradas/Impressos, respeitando a decisão antiga de que essas 2 abas não têm 3º grupo "não se aplica").
- **Célula de Anotações com ícone + popover flutuante**: um ícone mostra a anotação da mediação (texto já pronto na própria linha, sem custo de rede) e outro mostra a evidência da conferência — fotos e status de peça, com o MESMO formato que o card "Evidência para a mediação" da tela Visualizar Devolução — carregada sob demanda (só quando o mouse passa em cima do ícone), pra não pesar carregando fotos de todas as ~50+ devoluções da listagem de uma vez.
- **Extensão pras outras 4 abas** (pedido explícito de Matheus: "esse será o padrão em todas as telas"): mesma grade, badges e ícones aplicados em Aguardando Conferência, Conferidos, Mediações Encerradas e Impressos — sem perder nenhum dado/ação que já existia em cada uma, só reorganizando (e em alguns pontos, ampliando com informação que já existia no banco mas não aparecia ali, como a badge de reclamação dentro/fora dos 7 dias, que passou a aparecer nas 5 abas por ser um dado sempre disponível desde a criação da devolução).
- Backend ampliado (`views.py`): o cálculo de "tem evidência de conferência pra mostrar" deixou de ser exclusivo de Mediações Abertas e passou a rodar pra listagem inteira — já que a conferência normalmente acontece bem antes de qualquer mediação existir.

## Status atual: EM TESTES

Matheus está aplicando os diffs manualmente e testando no `.exe` local antes de decidir se o formato fica como está. **Aguardando feedback** — dele mesmo e da Ana (usuária final) — antes de considerar esse redesenho fechado.

## Problema já identificado nesta 1ª rodada

**O formato não ficou bom em tela pequena (celular).** A grade de colunas fixas tem uma largura mínima considerável (precisou de scroll horizontal a partir de ~900px de largura de tela) — funciona bem em desktop, mas ainda não é uma boa experiência no celular. Isso precisa ser melhorado antes de dar esse redesenho como pronto, especialmente porque parte do uso do sistema pela Ana é em celular (ver [[Estudo de Caso de Ana — Persona, Fluxo Real em 8 Fases e o Papel de Cada Tela no Sistema de Devoluções]] e a regra geral de responsividade do sistema, de que as telas fora das que são propositalmente só-celular precisam funcionar também no celular).

## Em aberto

- Melhorar o comportamento da grade em tela pequena (hoje só tem scroll horizontal como saída).
- Aguardar feedback de Matheus e da Ana sobre o formato geral antes de considerar o redesenho fechado.
