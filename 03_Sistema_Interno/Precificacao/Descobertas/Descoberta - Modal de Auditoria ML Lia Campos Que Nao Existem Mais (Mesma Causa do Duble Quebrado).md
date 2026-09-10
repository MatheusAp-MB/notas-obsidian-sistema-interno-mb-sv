---
tipo: descoberta
dominio: python
status: confirmada
criado: 10/09/2026
atualizado_em: 10/09/2026 15:42
relacionado: [Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido), Checkpoint - Inicio da Validacao Exaustiva de Precificacao]
---

# Descoberta: Modal de Auditoria ML Lia Campos Que Não Existem Mais (Mesma Causa do Duble Quebrado)

**Resumo**: o modal "como chegamos nesse preço" do ML (`precificacao/views/modal_comum.py` + `estrutura_parcial_grade_detalhe.html`) tentava ler 4 campos que não existem em `DadosEntrada`/`DadosIntermediarios` (`formula_precificacao.py`) — sobras de uma versão anterior da fórmula, do mesmo jeito que o Duble antigo lia `produto.pis_cofins` depois desse campo ter sido removido. O efeito nunca foi crash (Django renderiza atributo ausente como vazio) — só célula em branco ou fórmula incompleta. **O resultado final de cada passo sempre esteve certo**; só a decomposição intermediária é que estava incompleta.

> [!success] Confirmada — 10/09/2026, achada durante o mapeamento da nova tela de auditoria
> Achado por leitura direta de `modal_comum.py` contra `DadosEntrada`/`DadosIntermediarios` reais — nenhuma execução, só leitura. Já corrigido: faz parte da Camada 1 do redesign da tela de auditoria (mesma sessão).

## Contexto

Durante o mapeamento do plano de execução da nova [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao|tela de auditoria]] (pedida pra mostrar cada valor calculado com sua fórmula completa, "centavo a centavo"), foi preciso ler `modal_comum.py` linha a linha contra o que `formula_precificacao.py` (ML) realmente persiste — pra saber quais dados já existiam prontos vs. quais precisariam de recálculo. Nesse comparativo apareceram 4 leituras de campo que não batem com o dataclass real.

## O que levou à resposta

Os 4 campos que `modal_comum.py` tentava ler, e que não existem em `DadosEntrada`/`DadosIntermediarios`:

1. `e.get('icms_entrada_percentual')` — não existe (ICMS de entrada não tem % separado nesse modelo, só o crédito já calculado) → célula "ICMS entrada" sempre em branco na coluna %.
2. `e.get('ipi_percentual')` — não existe (IPI não tem conceito de % na fórmula, só R$/unidade vindo direto da nota) → célula "IPI" sempre em branco.
3. `e.get('pis_cofins_percentual')` / `i.get('pis_cofins_valor')` — não existem. Em algum momento a fórmula separou PIS e COFINS em campos próprios (`pis_saida_percentual`/`cofins_saida_percentual`/`pis_saida_valor`/`cofins_saida_valor`, cada um com seu %; `DadosIntermediarios` também já separa `credito_pis`/`credito_cofins` na entrada), mas `modal_comum.py` ficou lendo a chave antiga combinada. Efeito: a linha "PIS/COFINS (saída)" no Passo 5 da Taxa sempre veio zerada/em branco, e o bloco "PIS/COFINS (X%) — usado 2×" no topo mostrava só o crédito de PIS, com o crédito de COFINS (que existe e é usado certo no cálculo real do FIXO) nunca aparecendo.
4. `det.passo_1.st_valor` — não existe em lugar nenhum; a fórmula real de `custo_final` é só `custo_com_boni + ipi_valor + frete_cif_fob_valor`, sem termo de ST. O texto "+ ST" no Passo 1 era resíduo morto desde sempre.

Mesma classe de causa raiz já documentada em [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]]: a fórmula evolui (campo separado, campo removido), e um consumidor que lê o dicionário/dataclass por nome de chave (em vez de por atributo tipado, que quebraria em tempo de import) fica pra trás silenciosamente — sem erro, só com resultado incompleto.

## Resposta

Nenhum dos 4 problemas afetava o número final mostrado em cada passo (`resultado`), porque esses vêm direto do valor já persistido, nunca recalculado na exibição — só a "prova"/decomposição intermediária é que ficava incompleta ou em branco. Já corrigido na mesma sessão, como Camada 1 do redesign da tela de auditoria (`modal_comum.py` reescrito, 3 edições cirúrgicas no template do ML). Efeito imediato em toda margem já calculada, sem precisar rodar nada de novo.

**Pendência**: Magalu usa o mesmo `modal_comum.py` compartilhado, mas o template dele (`estrutura_parcial_grade_detalhe_magalu.html`) ainda não foi atualizado — os mesmos campos mortos continuam sem aparecer lá até o padrão ser replicado (Camada 3 do mapa de execução da tela de auditoria).

## Relacionado

- [[Descoberta - Duble de Precificacao Existente Esta Quebrado (Campo pis_cofins Removido)]]
- [[Checkpoint - Inicio da Validacao Exaustiva de Precificacao]]
