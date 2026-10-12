---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/10/2026
atualizado_em: 12/10/2026 02:41
relacionado: [Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou, O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes, Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha, Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos, Guardar o Total de Chamadas de Cada Clique em Tabela Propria no Banco, Checkpoint - Historico de Vendas e Calendario de Vendas]
resumo: "Validação na API real (conta MB, 12/10/2026): Atualizar dia 08/07 (200 pedidos, 4 chamadas, sem aviso), último mês (4.674 pedidos, 110 chamadas, 55 s) e último ano (83.049 pedidos, 1.837 chamadas, 15 min 27 s) fecham com o banco (lidos = banco na janela). As chamadas batem com a conta de páginas por dia (pedidos do dia ÷ 50, para cima) mais as repetições por 429. A releitura automática nunca rodou: nenhuma janela deixou de fechar."
---

# A Coleta Corrigida, Validada na API Real, Fecha com o Banco e a Conta de Chamadas Bate

## Resumo

Na madrugada de 12/10/2026, Matheus rodou na API real do Mercado Livre (conta MB) as validações que faltavam para a correção `to = fim − 1 hora` ([[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]]). O resultado foi o mesmo nas **três** execuções: o que a coleta **leu** é igual ao que o banco **tem** na mesma janela, o número de chamadas pode ser **calculado de antemão** e **nenhuma janela deixou de fechar**. Isso quer dizer que a **releitura automática não chegou a rodar** em nenhuma delas.

> [!success] Status: confirmada (12/10/2026)
> Vale para a **conta MB** e para a correção **A** (`to = fim − 1 hora`, que acabou com a leitura em dobro da hora 0). A correção **B** (releitura da janela que não fechou) continua **sem prova na API real**: ver "Limites".

## Contexto

Antes da correção, a coleta do ano **não fechava**: lia 84.510 pedidos e o banco tinha 83.438 na janela (−1.072), por causa da hora 0 do dia seguinte lida em dobro ([[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]). A correção foi aplicada no código, mas só tinha sido testada num ML de mentira.

| Termo | O que é |
|---|---|
| **Fechar** | Pedidos **lidos** pela coleta = pedidos que o **banco** tem na mesma janela (diferença 0). Conferido com o script `investigar_diferencas_entre_coletas_so_no_banco.py`, só leitura. |
| **Páginas calculadas** | Para cada dia, `pedidos do dia ÷ 50`, arredondado para cima: o mínimo de chamadas para ler o dia com páginas de 50. A **soma dos dias** do período é o número de chamadas esperado. |
| **Reler** | Caixa do modal "Coletar período da conta": lê de novo dias que a coleta já tinha (o banco regrava por cima, sem duplicar). |

## A pergunta

Com a correção, a coleta da conta toda **fecha** com o banco? E o número de chamadas se explica por conta, sem sobra?

## O que levou à resposta

**1. As três execuções reais** (conta MB, todas com "Reler" quando em período):

| Execução | Período | Pedidos lidos | Chamadas | Páginas calculadas | Tempo | Estimativa do modal |
|---|---|---|---|---|---|---|
| "Atualizar dia" | 08/07/2026 | 200 (200 itens gravados) | **4** | 4 | — | — |
| Último mês | 12/09 a 12/10/2026 (31 dias) | **4.674** | **110** | 110 | 55 s | ~127 chamadas, 2 min |
| Último ano | 13/10/2025 a 12/10/2026 (365 dias) | **83.049** | **1.837** | 1.835 (+ 2 repetições por 429) | 15 min 27 s | ~1.466 chamadas, 15 min |

**2. O banco fecha com o que foi lido.** Mês: 4.674 lidos e 4.674 no banco. Ano: 83.049 lidos e 83.049 no banco **dentro da janela** (o banco tem 83.449 no total: as outras 400 linhas são dos dias 11 e 12/10/2025, que ficaram **antes** da janela por causa da folga de 1 dia; ver [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]). As diferenças antigas (−1.073 no ano, −19 na semana, −7 no SKU de teste) ficaram **totalmente explicadas**.

**3. A conta de chamadas bate.** Cada dia custa `ceil(pedidos ÷ 50)` chamadas. Somando os dias: 4 no dia 08/07, **110** no mês e **1.835** no ano. O ano real teve **1.837**: a diferença de 2 são as **duas respostas 429** do ML na coleta (cada uma repetida 1 vez, e toda tentativa conta como chamada). Isso aparece no log `integracao_mercado_livre/logs/Magazine/pedidos_ml.log`: 12/10/2026 02:20:06 e 02:20:08, esperas de 1,8 s e 2,0 s, "tentativa 1/5". Como nenhuma janela deixou de fechar, **não houve nenhuma chamada de releitura**.

**4. Ritmo.** 1.837 chamadas em 927 s dão cerca de 2 chamadas por segundo (~7.100 por hora), bem abaixo do limite de 18.000 por hora do aplicativo.

**5. A estimativa do modal erra nos dois sentidos.** Para o ano ela previu ~1.466 chamadas (real 1.837: 20% a menos) e para o mês ~127 (real 110: 15% a mais). O tempo do ano ficou certo (15 min), o do mês foi superestimado (2 min contra 55 s). A melhoria (usar o histórico das coletas da conta toda) continua **opcional e não aplicada**.

## Resposta

**Sim, para a conta MB.** Com `to = fim − 1 hora`, a coleta da conta toda **fecha com o banco** no dia, no mês e no ano, e o custo em chamadas é **previsível**: soma das páginas por dia, mais as repetições por 429. A leitura em dobro da hora 0 acabou e o aviso "anunciou 202, vieram 201" do dia 08/07 não voltou (o dia agora tem 200 pedidos, só os dele).

## Exemplo

Dia 08/07/2026:

```text
Antes (janela antiga): 202 pedidos na janela, ML anunciou 202, vieram 201 -> aviso
Agora  (janela nova):  200 pedidos, 4 chamadas (ceil(200/50) = 4), sem aviso
```

## Limites

- **Só a conta MB.** A conta SV nunca foi coletada com o código novo.
- **A releitura (correção B) não foi exercitada na API real:** 0 janelas não fecharam, 0 avisos, 0 chamadas de releitura. A prova de que ela funciona continua sendo só a simulação local feita antes. Não existem testes automatizados do coletor no projeto.
- "Fechar" compara a coleta com o **banco** e com o **ML**; não compara com uma fonte independente (a planilha do ERP, prevista para terça, 13/10/2026).
- Uma medição de cada execução; as estimativas do modal são de uma vez só.

## Relacionado

- [[Enviar o to do Orders Search Uma Hora Antes e Reler a Janela Que Nao Fechou]]
- [[O Filtro de Hora do Orders Search Le a Hora Inteira e Faz a Coleta Ler a Hora 0 Duas Vezes]]
- [[Recoleta do Ano com Foto do Banco Recuperou 1 Pedido Perdido por Empate e Nao Perdeu Nenhuma Linha]]
- [[Medidas da Coleta de Vendas e Comparacao Entre os Dois Caminhos]]
- [[Guardar o Total de Chamadas de Cada Clique em Tabela Propria no Banco]]
- [[Checkpoint - Historico de Vendas e Calendario de Vendas]]
