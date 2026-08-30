---
tipo: checkpoint
dominio: 
status: em_andamento
criado: 11/08/2026
atualizado_em: 16/08/2026 05:23
relacionado: [Checkpoint — Exploracao de Dados Fiscais Sysemp, Contexto Geral - Retomada em Outro Computador (Integracao Sysemp), Modal de Produto — Aba Impostos (Entrada e Saida), Orquestracao da Sincronizacao de Impostos de Entrada via XML, Validacao Cruzada com Modelo_Exemplo.xlsx Confirma Formulas e Persistencia no Banco, Plano em Etapas do Duble de Precificacao ML, Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada, Migracao da Precificacao Real para Usar Impostos de Entrada Validados]
---

# Melhoria Contínua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada

## Contexto

Registrado em 11/08/2026, 15:05 — o usuário precisou trocar de frente de trabalho e não vai conseguir seguir com estes pontos por enquanto. Não é um item abandonado nem um bloqueio real: é um backlog de melhoria contínua, sem prazo, pra retomar quando houver disponibilidade. Consolida os pontos que já estavam em aberto no [[Checkpoint — Exploracao de Dados Fiscais Sysemp]] e no [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]] no momento da pausa.

## Frente 1 — Modal de produto (tela de Produtos)

Do plano original de 5 etapas (ver [[Modal de Produto — Aba Impostos (Entrada e Saida)]]), etapas 1 (aba Impostos) e 2 (Visão Geral reduzida + NCM migrado pra Impostos) estão feitas, aplicadas e confirmadas — a confirmação da etapa 2 (que estava pendente desde 11/08) foi verificada por leitura direta do template em produção em 15/08/2026.

**Atualizado 15/08/2026, 23:25:** a etapa 1 ganhou uma continuação bem além do previsto nesta pausa — 2 rodadas de dado novo (campos já existentes expostos + 8 campos novos persistidos, 3 migrations) e um redesenho visual completo (7 mockups até aprovação, reaproveitando a estrutura rígida de card/tabela da própria Visão Geral), além da correção de um bug real de CST/CSOSN. Detalhe completo em [[Modal de Produto — Aba Impostos (Entrada e Saida)]], [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]] e [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]].

**Atualizado 16/08/2026, 04:05:** ~~falta rodar `reprocessar_impostos_entrada_de_json`~~ — feito. Rodado pelo usuário: 3691 selecionados, 827 sincronizados, 0 erro (2864 sem `Produto` correspondente, item separado já documentado). Backfill do CST corrigido e dos 8 campos novos aplicado em toda a base com correspondência — ver [[Validacao Cruzada com Modelo_Exemplo.xlsx Confirma Formulas e Persistencia no Banco]]. Frente 1 (aba Impostos) considerada fechada, aguardando validação do superior.

Faltam, sem código ainda:

- **Nova aba "Dados do produto nas plataformas"** — tabela por marketplace (Códigos Associados, Publicado? — já existe via `ProdutoAnuncioMarketplace.anunciado` —, e "Permitido Publicar?" — não existe em lugar nenhum ainda, precisa decisão de modelagem antes de idealizar a tela).
- **Nova aba "Resumo de Precificação"** — mostrar a precificação do produto por marketplace. A mais complexa das etapas restantes; precisa investigar o app `precificacao` (já tem 6 grades por marketplace + `resumo_marketplaces.py`) antes de qualquer mockup.
- **Migrar as 6 fórmulas de precificação do marketplace pra ler das tabelas de `impostos`** em vez dos campos genéricos e soltos do `Produto` — deixou de ser "decisão futura sem prazo": usuário confirmou (16/08, 04:50) que hoje o dublê e o sistema real de precificação **ainda não usam os impostos de entrada corretamente**, mesmo já populados no banco. Base pra migrar já está validada — ver [[Plano em Etapas do Duble de Precificacao ML]] (revalidação 16/08). Mapeamento campo a campo e decisões (sem fallback, sem planilha) já fechados em 16/08, 05:23 — ver [[Migracao da Precificacao Real para Usar Impostos de Entrada Validados]]. Nenhum diff de código escrito ainda.
- **Decidir a fonte da dimensão "embalada" do produto** (novo, 16/08, 05:23) — achado que `importar_planilha_precificacao.py`, desativado desde 21/07/2026, era a ÚNICA fonte dos 4 campos `_apos_embalado` que alimentam o fallback de dimensão física. Sem essa fonte, Coleta/Armazenagem calculam com dimensão zerada pra praticamente todo produto hoje — não é mais um caso raro (variação ML ausente), é o padrão. Candidato: colunas de embalagem do Cadastro de Produtos do ERP (já lidas por `importar_produtos_erp.py`), a confirmar se já alimentam `_apos_embalado`. Ver [[Precificacao Real Pode Cair em Fallback de Dimensao Zero Sem Variacao ML Sincronizada]] e [[Migracao da Precificacao Real para Usar Impostos de Entrada Validados]].

## Frente 2 — Backend / pipeline de sincronização

Mais antiga, independente do modal:

- **Desenhar o reprocessamento do histórico antigo** (320 produtos que erraram por campo de imposto `null` na 1ª rodada real, banco de casa) — decisão do `null→0` já tomada e validada em carga real; falta só o desenho de como reprocessar sem rechamar a API inteira de novo.
- **Investigar os 2055 produtos** (54% dos selecionados no manifesto) sem `Produto` correspondente no banco pelo EAN — descontinuado de verdade, ou divergência de formato de EAN entre Sysemp e o cadastro?
- **Implementar `manage.py iniciar_servidor`** — hoje o disparo da sincronização é manual (`sincronizar_impostos_entrada`); o comando que substituiria o boot direto do `runserver` nunca foi escrito.
- **Definir cooldown entre tentativas de falha consecutivas** — o campo `data_ultima_chamada` do watermark já sustenta isso, falta a regra de negócio.
- **Decidir onde/como aparece o aviso visual de "dados desatualizados"** na tela, e o formato do botão manual de sincronizar.

## Relacionado

- [[Checkpoint — Exploracao de Dados Fiscais Sysemp]]
- [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]
- [[Modal de Produto — Aba Impostos (Entrada e Saida)]]
- [[Orquestracao da Sincronizacao de Impostos de Entrada via XML]]
- [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]]
- [[Cor de Identificacao Fixa por Imposto — Padrao do Sistema]]
