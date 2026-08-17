---
tipo: decisao
dominio: python
status: ativa
criado: 17/08/2026
atualizado_em: 17/08/2026 10:33
relacionado: [Marca com Barra Quebra Link de Download de Promocao]
---

# Shopee Ganha Modo Arquivo de Promoção Igual ao TikTok

## Contexto

Pedido do usuário (17/08/2026): a Shopee só tinha o modo "Grade do sistema" pra gerar promoção (preço "De"/"Por" vindo de `GradePrecificacaoShopee`). O TikTok já tinha um 2º modo — "Preço do arquivo" — que usa o preço já correto na plataforma (o usuário confirma 100% de confiança nele, precificado por fora do sistema) + um desconto manual, sem checar Grade, sem checar estoque, sem travar por divergência. Pedido: replicar esse mesmo modo pra Shopee.

## Decisão

Espelhar a arquitetura do TikTok ponto a ponto, adaptada pra Shopee ter só 1 SKU por produto (o TikTok tem o par Com Afiliado/Sem Afiliado, que não existe na Shopee):

- `ResultadoProduto` (Shopee) ganhou campo `preco_final` — sempre preenchido em `categoria='pronto'`, venha de onde vier (`grade.preco` no modo Grade, ou calculado no modo Arquivo). O gerador de Excel passou a ler só esse campo, nunca `grade.preco` direto — não precisa saber qual modo gerou o resultado.
- `calcular_preco_com_desconto()` duplicada da versão do TikTok — de propósito, mesmo padrão de "app independente" já usado no resto do projeto (Raia/Magalu/TikTok nunca importam um do outro).
- Método novo `processar_modo_arquivo(desconto_percentual)`, reaproveitando o índice por SKU (com fallback pra SKU de referência) que `processar()` já tinha.
- `gerar_excel_promocao()` (Shopee): "De" passa a vir do sistema (`grade.preco_de_exibicao`) no modo Grade, ou do preço já na plataforma (`linha_arquivo.preco_atual`) no modo Arquivo — mesma lógica de referência do TikTok.
- `view_processar_promocao`: `fonte_preco` (`grade`/`arquivo`) + validação de `desconto_percentual` (0–100), mesmo padrão do TikTok.
- Template + JS: seção "Fonte do preço 'De'" com toggle Grade/Arquivo, escondendo a margem de referência no modo Arquivo. Nenhum CSS novo — `layout_gerar_promocao.css` da Shopee já tinha as mesmas classes do TikTok (só muda a cor da marca, `#ee4d2d`).
- Correção lateral no JS: o listener de troca da margem usava `querySelectorAll('.promocao-margem-card')` global — funcionava com 1 grupo de rádio só na tela; com "Fonte do preço" como 2º grupo, ia apagar visualmente o card ativo do outro grupo. Escopado igual o TikTok já fazia (`input[name="margem"]` só).

## Validação

Usuário confirmou em 17/08/2026: upload de arquivo real da Shopee reconhecido, promoções geradas com sucesso nos 2 modos.

Durante o teste real, apareceu 1 bug adjacente (marca com "/" quebrando o link de download) — corrigido em nota própria, ver relacionado.

## Relacionado

- [[Marca com Barra Quebra Link de Download de Promocao]]
