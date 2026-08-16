---
tipo: descoberta
dominio: python
status: aberta
criado: 16/08/2026
atualizado_em: 16/08/2026 05:23
relacionado: [Plano em Etapas do Duble de Precificacao ML, Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada, Migracao da Precificacao Real para Usar Impostos de Entrada Validados, Redesenho do Popular Banco - Fontes de Dados e Escopo]
---

# Precificação Real Pode Cair em Fallback de Dimensão Zero Sem Variação ML Sincronizada

## Contexto

Durante a revalidação do dublê de precificação (ver [[Plano em Etapas do Duble de Precificacao ML]]), o produto de teste (EAN 7908050719121) mostrou Coleta e Armazenagem zeradas na Etapa 6/7. Em vez de assumir que era só limitação do script de teste, o usuário pediu prova real — investigado lendo o código de produção, não supondo.

## Mecanismo real (lido em `mercado_livre/funcoes_auxiliares/dimensoes_efetivas.py`)

`resolver_dimensoes_efetivas(produto, variacao)` tem 2 caminhos:

1. **Variação do Mercado Livre** com as 4 dimensões declaradas pelo vendedor (SELLER_PACKAGE) completas → usa essas.
2. **Fallback pro Produto (ERP)** — `altura_ordenada_cm` / `largura_ordenada_cm` / `comprimento_ordenada_cm`, um 3º grupo de campo, diferente de "sem embalar" e "embaladas" (esses aparecem preenchidos na tela do modal) — calculado por um comando de management separado, `organizar_e_verificar_divergencias_dimensoes_envio`. Se esse comando nunca rodou pro produto (ou não achou dado suficiente), os campos ficam `None` e o fallback zera tudo, sem erro nenhum.

## Achado real, confirmado (não suposto)

Rodado um script de verificação direto no banco pro produto de teste: **0 variações do Mercado Livre sincronizadas**, e os campos `_ordenada_cm` do Produto também vieram `None`. `precificacao/funcoes_auxiliares/mercado_livre/calcular_grade_precificacao_ml.py` — a fórmula REAL de produção, não o dublê — usa essa mesma função (`resolver_dimensoes_efetivas`), com a mesma ordem de tentativa (variação primeiro, fallback depois). Ou seja: **a produção cairia no mesmo zero pra esse produto, hoje** — não é uma limitação exclusiva do script de teste.

## Por que isso é provavelmente amplo, não pontual

A sincronização de anúncios/variações do Mercado Livre está desligada agora mesmo (`popular_banco` teve essa etapa desativada temporariamente na redesenho recente — commit `9284b6c`), e a migração dos scripts que buscam esse dado da API pro repositório ainda não foi feita — ver [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]] (Tarefa 1 do plano de domingo, 16/08/2026). Enquanto essa migração não acontecer, é provável que boa parte dos produtos precifique Coleta e Armazenagem com dimensão zerada, silenciosamente — sem erro, sem aviso na tela.

## Não confundir com a validação de impostos de entrada

Esse achado é totalmente separado da validação de ICMS/ICMS ST/IPI/PIS/COFINS feita na mesma sessão (essa seguiu 100% confirmada correta, campo a campo, contra o banco). Este aqui é sobre dimensão física/frete, não imposto — mecanismo, causa e correção são diferentes.

## Achado mais profundo (16/08/2026, 05:23) — a causa é maior do que "falta variação ML"

Investigando por que os campos `_ordenada_cm` do Produto (fallback) também vieram `None` pra este produto, achada a causa raiz de verdade: `Produto.obter_dimensoes_envio()` lê os 4 campos de dimensão **"embalada"** (`altura/largura/comprimento/peso_produto_apos_embalado`) — e a **única** fonte desses 4 campos no sistema inteiro era `importar_planilha_precificacao.py`, uma etapa do `popular_banco` **desativada desde 21/07/2026** (3 semanas antes desta descoberta — ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]). Como ninguém substituiu essa fonte, esses 4 campos estão `None` pra **todo produto do sistema**, não só os sem variação ML.

Isso significa que o mecanismo original descrito acima (variação ML ausente → fallback pro Produto) é real, mas o fallback em si TAMBÉM está quebrado pra praticamente qualquer produto — não é uma combinação rara de 2 problemas, é essencialmente garantido que Coleta/Armazenagem estejam calculando com dimensão zerada hoje, salvo produto com variação ML sincronizada e dimensão declarada completa (situação hoje raríssima, já que a sincronização do ML está pausada). Ver detalhe completo e plano de correção em [[Migracao da Precificacao Real para Usar Impostos de Entrada Validados]].

## Em aberto

- ~~Medir quantos produtos de fato têm variação ML sincronizada vs. zero hoje~~ — parcialmente respondido: mesmo quem tem variação zero, o fallback também está quebrado (achado acima). Prioridade agora é decidir a fonte da dimensão embalada, não medir quantos produtos são afetados (é a maioria/quase todos).
- **Decidir de onde vem a dimensão "embalada" agora** — Cadastro de Produtos do ERP já tem colunas de embalagem; falta confirmar se isso já alimenta `_apos_embalado` ou só `_sem_embalar`. Ver [[Migracao da Precificacao Real para Usar Impostos de Entrada Validados]].
- Decidir prioridade de correção — ligado à Tarefa 1 do plano de domingo (migrar scripts consumidores do ML), mas agora também precisa de uma correção independente pro lado Produto/ERP, não só pro lado ML.

## Relacionado

- [[Plano em Etapas do Duble de Precificacao ML]]
- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Melhoria Continua — Backlog Aberto do Modal de Produto e Pipeline de Impostos de Entrada]]
