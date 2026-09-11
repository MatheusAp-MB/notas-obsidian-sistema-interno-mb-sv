---
tipo: descoberta
dominio: python
status: confirmada
criado: 10/09/2026
atualizado_em: 11/09/2026 15:10
relacionado: [Checkpoint - Inicio da Validacao Exaustiva de Precificacao, Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado), Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]
---

# Descoberta: Tela de Auditoria ML — Arquitetura e Princípios de Design

**Resumo**: o modal "como chegamos nesse preço" do ML foi redesenhado de "mostra informação" pra "audita de verdade" — todo valor calculado prova sua própria conta, toda origem de dado é marcada, e nada existente foi perdido na troca. Levou 5 rounds de mockup até convergir, e a implementação real (4 camadas) já está em produção. Esta nota registra os princípios de design que guiaram as decisões (importantes pra replicar o mesmo padrão nos outros 5 marketplaces) e a arquitetura técnica de como foi implementado. Em 11/09/2026 o usuário pediu uma reformulação adicional — garantir que a tela seja auditável de verdade contra a planilha de referência do superior —, cujo primeiro passo (tabela agrupada de itens + %/R$ sempre juntos + fórmula completa) já foi desenhado e aplicado, mas ainda sem validação confirmada (ver "O que falta", item 3).

> [!success] Confirmada — 10/09/2026, implementado e em produção só no ML
> Estrutura aprovada pelo usuário depois de 5 rounds de mockup; código aplicado no repositório real (4 camadas), sincronizado com o GitHub, testado rodando o servidor. Ainda não replicado pros outros 5 marketplaces (Magalu, Raia, Shopee, TikTok, Amazon) — decisão deliberada de sequenciamento ("ML primeiro").
>
> **Atualização 11/09/2026**: usuário pediu explicitamente uma reformulação adicional pra garantir que a tela seja auditável de verdade, comparável à planilha de referência do superior. Primeiro passo (tabela única agrupada de itens + %/R$ sempre lado a lado + fórmula completa) já aplicado no código real, mas a validação contra a planilha do superior **ainda não foi confirmada** pelo usuário — ver item 3 em "O que falta".

## Por que essa tela existe (motivação original do usuário)

O modal antigo só mostrava informação — números calculados, sem prova de como chegaram lá. O pedido foi pra virar uma tela de **auditoria** de verdade: um lugar onde dá pra ver e confirmar se o dado está certo e se foi calculado certo, sem precisar abrir o Django Admin. Público: quem faz a conferência de preços (contabilidade/precificação), não só desenvolvedor.

## Princípios de design (por que ficaram assim — 5 rounds de mockup até aqui)

1. **Prova abre perto do botão que a chamou, nunca num painel distante.** Primeira versão do mockup abria a nota fiscal longe do botão de "ver NF" — feedback do usuário foi direto: o botão tem que ficar em cima dos passos, e a prova tem que abrir logo abaixo, inline.
2. **Nunca é cópia direta de uma tabela.** A ideia de mostrar valores em linhas/colunas era boa, mas virar uma tabela crua "perde o sentido" — a prova precisa ser pequena, escopada ao passo específico (2-3 linhas), não um dump completo.
3. **"Bate o olho, entende."** Numa primeira varredura visual, o usuário tem que sair sabendo se está tudo OK ou não — sem precisar ler linha por linha. Isso definiu: passos colapsados por padrão, só os com alerta abrem automaticamente. Densidade de informação é o inimigo — "poluir a tela" foi citado explicitamente como o que evitar.
4. **Nenhum dado que já existe hoje pode ser perdido.** A estrutura pode (e deve) melhorar, mas os blocos que já existiam (dados do produto, impostos de entrada, impostos de saída) continuam todos lá — só reorganizados e com proveniência marcada em cima.
5. **Toda origem marcada explicitamente — 5 categorias.** Todo valor exibido carrega uma tag de onde veio: `produto` (cadastro), `nf` (nota fiscal de entrada / crédito fiscal), `saida` (imposto de venda), `config` (parâmetro operacional), `calculado` (resultado de fórmula, default). Implementado como campo `origem` em `LinhaPercentualValor`/`LinhaValorUnico` (`modal_comum.py`).
6. **Sem ação de "editar no Admin".** Decisão explícita do usuário, com justificativa de negócio: se o dado está errado, não é pra corrigir ali — a fonte está errada e precisa ser investigada a fundo. Confirmado tecnicamente depois: `custo` é campo sincronizado pelo ERP — um "conserto" manual no Admin seria sobrescrito no próximo import mesmo. Virou uma caixa de diagnóstico (`.audit-investigar-box`), sem CTA nenhum.
7. **Todo valor calculado mostra sua fórmula — "centavo a centavo".** Regra explícita: o usuário que lê a tela não pode sair com nenhuma dúvida sobre como um número foi calculado ou por que é X e não Y. Levou a um autoaudit que achou 6 lacunas concretas (ex: crédito de PIS+COFINS não estava separado em 3 linhas, taxa diária de armazenagem não tinha a conta visível) — todas fechadas na v5, incluindo mini-fórmulas inline pra cada valor.

## Arquitetura técnica (o que foi implementado, 4 camadas)

**Camada 1 — correção de dado já persistido, sem recálculo.** `modal_comum.py` tinha 4 leituras de campo mortas (sobra de uma versão anterior da fórmula) — corrigidas usando só o que já existe em `DadosEntrada`/`DadosIntermediarios`. Detalhe completo em [[Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]].

**Camada 2 — extensão da fórmula pra persistir prova fiscal crua.** `formula_precificacao.py` (ML) ganhou `ProvaImposto` (valor/base_cálculo/alíquota, ainda não dividido por unidade) e `ProvaFiscalEntrada` (a "foto" completa da nota fiscal de entrada — IPI/ICMS/ICMS-ST/PIS/COFINS + `quantidade_nota`, o divisor). `DimensoesEfetivas` ganhou `peso_fisico`/`peso_cubico` (antes calculados e descartados depois do `max()` — agora guardados, pra provar QUAL dos dois venceu). `armazenagem_valor_diario` capturado pra provar a conta de trás pra frente. Nenhum dado novo no banco — só campos que a fórmula já calculava e jogava fora, agora fotografados.

**Camada 3 — template + JS completos, redesenhados do zero.** `estrutura_parcial_grade_detalhe.html` reescrito com a estrutura `.audit-*`: veredito no topo (OK/alerta), caixa de investigar condicional, bloco de produto colapsável, 8 passos (cada um com estado/flag), caixas de prova expansíveis por passo, tabela de resultado. `montar_alertas()` novo em `modal_comum.py` gera os alertas reais (sem custo/dimensão, FIXO negativo, margem abaixo da meta) com link pro passo certo. `grade_mercado_livre.py`: `DetalheFormulaExibida` ganhou `sku`/`ean`/`custo`/`custo_com_boni`/`margem_alvo_percentual`/`margem_obtida_percentual`/`alertas`. **Melhoria sobre o próprio mockup**: o JS usa `closest()`+`querySelector()` em vez de `getElementById` — necessário porque a tela real permite Clássico e Premium abertos ao mesmo tempo (múltiplas instâncias do modal simultâneas via HTMX), o que quebraria com ids fixos.

**Camada 4 — CSS com a paleta da própria casa.** Em vez da paleta do mockup, reaproveitada a paleta que a aplicação já usa (`layout_grade_precificacao_ml.css`): navy `#1e3a5f`, azul Clássico `#1d4ed8`/`#dbeafe`, roxo Premium `#8b4fc7`, verde `#1a8a5f`, badge âmbar `#fffbeb`/`#b45309`. Escopado como custom properties CSS dentro de `.audit-painel`, sem vazar pro resto da aplicação.

## Adaptações do mockup pra produção

- Só o cenário "resolvida" (OK) é totalmente construível hoje — o cenário rico de "SEM CÁLCULO com detalhe completo de passos" depende da correção de persistência que só veio depois ([[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]], corrigida na mesma sessão, mas depois da tela já estar no ar).
- Chips decorativos e a maioria dos "razao-badge" do mockup foram descartados — só ficaram os badges apoiados em condição real (custo zerado, dimensão zerada, margem abaixo da meta).

## O que falta

1. **Replicar o mesmo padrão pros outros 5 marketplaces** (Magalu, Raia, Shopee, TikTok, Amazon) — hoje eles continuam no formato antigo (confirmado: `grade_magalu.py`/`grade_raia.py`/etc. ainda chamam `montar_pis_cofins()`, os templates deles não têm proveniência nem alertas nem prova). Decisão deliberada de adiar — "ML primeiro". Quando for fazer, os 7 princípios de design acima e a arquitetura das 4 camadas servem de referência direta — a única diferença por marketplace tende a ser os passos 7/8 (frete/preço exato), que já são tratados como "por conta de quem chama" no `modal_comum.py`.
2. **Usar `resolvida`/`motivo_nao_resolvida`** (agora que existem, ver [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]]) pra mostrar o cenário SEM CÁLCULO de verdade na tela, em vez do fallback genérico atual (`sem_detalhamento`).
3. **Garantir auditabilidade de verdade contra a planilha de referência do superior** — pedido explícito do usuário em 11/09/2026: a tela precisa ser comparável, item a item, com a planilha Excel que o superior usa pra conferir preços, não só "mostrar mais dado". Primeiro passo dado nesta mesma sessão: uma tabela única (não mais múltiplas tabelas soltas), colunas `Item | Como foi obtido | Valor em R$ | Valor em %`, agrupada por categoria em ordem lógica (10 grupos: dados do produto, impostos de entrada em 3 subgrupos, frete/armazenagem, taxa/comissão, margem, resultado), cobrindo TODOS os itens usados na conta — tanto os brutos (entrada) quanto os subtotais calculados — posicionada antes do passo a passo existente; regra nova sem exceção de sempre mostrar R$ e % lado a lado pra qualquer valor percentual; bloco de "fórmula completa" adicionado ao final do modal. Mockup aprovado (`mockup_tela_auditoria_v6.html`, em cima do cenário real do pulverizador Brudden SS20-B), diffs gerados e aplicados pelo usuário no código real (`modal_comum.py` — novas dataclasses `LinhaItemAuditoria`/`GrupoItensAuditoria` e função `montar_tabela_itens_agrupada()`; `grade_mercado_livre.py` — `DetalheFormulaExibida` ganhou `preco_final`/`margem_valor`/`tabela_itens`; `estrutura_parcial_grade_detalhe.html` — bloco novo de tabela + fórmula completa; `layout_grade_precificacao_ml.css` — classes novas reaproveitando os tokens existentes), commitado e sincronizado com `origin/dev`. Durante a aplicação real, um bug foi encontrado e corrigido: `montar_tabela_itens_agrupada()` formatava direto os valores de `ProvaImposto`/`ProvaFiscalEntrada` (que vêm de um `JSONField`, chegam como string) sem passar por `dec()` primeiro — `ValueError: Unknown format code 'f' for object of type 'str'`, reproduzido em produção no produto 1127 (MLB gold_special/padrão). Corrigido e reverificado com 2 cenários simulados (crédito de ICMS com alíquota real/não-ST, igual ao crash real; e uma linha com `prova_fiscal` totalmente `None`, pra cobrir cadastro antigo pré-Camada 2). **Status em 11/09/2026: usuário reportou não ter conseguido validar o resultado ainda** ("não conseguimos validar, mas ok"), sem detalhe de novo erro nem confirmação de sucesso — o objetivo de fundo (bater item a item com a planilha do superior) segue **não confirmado**, é a pendência mais importante desta frente agora.

## Relacionado

- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
- [[Descoberta - Modal de Auditoria ML Lia Campos Que Nao Existem Mais (Mesma Causa do Duble Quebrado)]]
- [[Bug Conhecido - Grade de Precificacao ML Nunca Grava Nem Limpa Linha Quando o Calculo Nao Resolve]]
