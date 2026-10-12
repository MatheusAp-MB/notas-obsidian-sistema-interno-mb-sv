---
tipo: decisao
dominio: 
status: ativa
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou, Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate, O Que Falta para Considerar Fechada a Validacao da Coleta de Vendas, Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Matheus decidiu em 12/10/2026 02:41: o script do coletor de vendas não muda mais por enquanto, está bom como está. Interpretação registrada: coletar_vendas_ml.py (correções A e B) fica como está, e os scripts de verificação e de foto também. A validação segue sem mexer em código; só um erro real ou uma decisão dele reabre."
---

# Não Mexer no Coletor de Vendas por Enquanto

## Resumo

Depois das validações na API real e da pergunta "podemos considerar 100% válida e fechada a coleta de vendas?", Matheus decidiu, em **12/10/2026, 02:41**: **"não vamos mais ficar mudando esse script por enquanto, está bom da forma que está"**. O coletor de vendas fica **congelado** no estado atual até que a validação mostre um erro real ou ele decida o contrário.

> [!info] Status: ativa (decisão de Matheus, 12/10/2026 02:41)
> O alcance exato de "esse script" **não foi detalhado por ele**. A interpretação registrada (e dita a ele na conversa) é a da seção "Decisão". Se ele quiser outro alcance, esta nota muda.

## Contexto

Estado do coletor `integracao_mercado_livre/servicos/coletar_vendas_ml.py` em 12/10/2026, depois de várias mudanças na mesma madrugada:

| Parte | Situação |
|---|---|
| Correção **A** (`to = fim − 1 hora`, janela em horas cheias com trava) | **Validada na API real** (dia, mês e ano fecham com o banco): [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]] |
| Correção **B** (releitura com páginas de 45 e 40) | Só simulação; **nunca rodou na API real** (nenhuma janela deixou de fechar) |
| Folga de 1 dia na borda de 12 meses | Aplicada (01:35) e conferida na recoleta (13/10/2025 veio inteiro) |
| Registro de avisos e de chamadas | Todos os avisos guardados; total de chamadas por clique em tabela própria |

## A pergunta

Depois de validar o que dava, ainda vale continuar ajustando o coletor, ou é melhor **parar de mexer** e validar em cima do que existe?

## O que levou à decisão

- A coleta nova **fechou** nas três execuções reais, e a recoleta do ano **não deixou nada para trás** e recuperou 1 pedido que a antiga tinha perdido ([[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]).
- O que falta para fechar a validação ([[O Que Falta para Considerar Fechada a Validacao da Coleta de Vendas]]) **não exige mudar o coletor**: é dado novo (conta SV, ERP) e tempo.
- Mudar o código no meio da validação **invalida o que já foi medido** e obriga a medir de novo.

## Decisão

| Fica como está (congelado) | Segue permitido |
|---|---|
| `coletar_vendas_ml.py` (correções A e B), `cobertura_vendas_ml.py` (folga de 1 dia), `pedidos_ml.py` | Validar **sem mudar código**: planilha do ERP (terça, 13/10/2026), último mês da conta SV (~100 chamadas), repetir "Reler tudo" em algumas semanas e comparar com a foto de hoje |
| Scripts de verificação e de foto em `scripts_exploracao_ML/` (inclusive o texto antigo "esperado hoje: 1" do script de comparação) | Rodar esses scripts, como estão, quantas vezes for preciso |
| (Interpretação) o gerenciador de token **não** é "esse script"; a correção dele foi feita **antes** desta decisão e não tem mudança pendente | Um teste simulado da releitura, **só se Matheus pedir**, em **script separado** (não muda o coletor) |

**O que reabre a decisão:** um erro real na validação (a conta deixa de fechar; um aviso que a releitura não resolve; diferença contra o ERP; a SV se comportar diferente) ou uma nova decisão de Matheus.

## Limites

- A interpretação do alcance é minha; ele não a detalhou.
- Congelar **não é** declarar a coleta fechada: ver [[O Que Falta para Considerar Fechada a Validacao da Coleta de Vendas]].
- Não foi feito git (só Matheus faz commit e push).

## Relacionado

- [[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]]
- [[Coleta Corrigida Validada na API Real Fecha com o Banco e a Conta de Chamadas Bate]]
- [[O Que Falta para Considerar Fechada a Validacao da Coleta de Vendas]]
- [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
