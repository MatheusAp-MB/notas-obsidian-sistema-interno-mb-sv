---
tipo: descoberta
dominio: 
status: confirmada
criado: 12/09/2026
atualizado_em: 12/09/2026 19:00
relacionado: [Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST, Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS, Descoberta - Rolagem da Tela de ICMS por NCM Validada com Volume Real, 2 Bugs Corrigidos, Checkpoint - Inicio da Estrutura de Impostos de Saida]
---

# Descoberta: Tabela e Tela de PIS/COFINS por NCM + CST Implementadas e Validadas com Volume Real

**Resumo**: Model `PisCofinsNcmCst`, import tratado e management command (`importar_pis_cofins_por_ncm_cst`) implementados e rodados de verdade nas 2 empresas — bateram 100% com o preview feito antes de codar (mesmo `teste.py` validado na Descoberta anterior). Tela de consulta construída do zero, espelhando a tela de ICMS por NCM (mesma técnica de contraste e mesmo uso de HTMX), passou por 3 versões de mockup até o desenho aprovado, e por 3 bugs pequenos encontrados e corrigidos já com volume real — mesmo ciclo de validação que a tela de ICMS por NCM passou.

> [!success] Confirmada — 12/09/2026
> Import rodado nas 2 empresas reais, tela construída, iterada e validada na mesma sessão.

## Import tratado — bateu exato com o preview

| Empresa | Grupos (NCM+CST) | Aceitos | Rejeitados |
|---|---|---|---|
| MAGAZINE | 124 | 124 | 0 |
| SAMVALE | 45 | 45 | 0 |

Os 124 da MAGAZINE batem exato com a conta esperada: 120 NCMs distintos (contagem já conhecida) + os 4 NCMs que têm 2 CSTs (`84137080`, `84243010`, `84248229`, `90211010` — os mesmos 4 já documentados na Descoberta anterior) = 124. SAMVALE: 45 NCMs = 45 grupos, 0 CST múltiplo — também bate. Nenhum grupo rejeitado nas 2 empresas — confirma que a chave NCM+CST é segura pra produção.

## Achado extra: 1 CST não é um código, é um placeholder

NCM `38249010` (MAGAZINE) tem CST gravado como o texto literal `--` na planilha, não um código de 2 dígitos — e PIS/COFINS em branco nessa mesma linha. O import aceita normalmente (vira sua própria linha, sem erro), mas esse `--` provavelmente é um placeholder de "não se aplica" na origem, não um CST de verdade. Não foi tratado como caso especial — fica registrado aqui pro Financeiro/Contabilidade avaliar se `38249010` precisa de correção na planilha de origem.

## Tela construída — mesma técnica da tela de ICMS por NCM

Implementada com a mesma arquitetura da tela de ICMS por NCM (HTMX pra troca de resultado, sem JS construindo HTML na mão): painel de consulta sólido na cor primária do sistema (mesmo `.calculadora-container` reaproveitado), resultado num card com borda colorida, tabela completa sempre visível e quieta abaixo — sem toggle de "ver tabela completa" nenhum.

2 pedidos de UX atendidos, diferentes da tela de ICMS por NCM:
- **NCM digitável** — não é mais um `<select>` fechado, é um campo de texto com dropdown customizado (lista embutida na página via `json_script`, filtra conforme digita, navegável por teclado, fecha sozinho ao clicar fora). Foi preciso trocar o `<datalist>` nativo original por esse componente customizado porque o navegador não permite estilizar o dropdown nativo (aparecia com o tema escuro do sistema operacional, fora do controle da tela).
- **Cruzamento explícito NCM + CST** — `<select>` de CST dependente do NCM digitado (via HTMX), só mostra os CSTs que existem de verdade pra aquele NCM — nunca deixa cruzar uma combinação inexistente. Espelha o padrão NCM + UF da tela de ICMS.

## 3 bugs de layout encontrados e corrigidos com volume real

1. **Tabela sem altura fixa** — crescia com a página inteira em vez de ter rolagem própria. Corrigido reaproveitando a mesma técnica `ajustar_altura_grade()` da tela de ICMS (calcula a altura disponível até o fim da tela e limita o container a isso).
2. **Nota explicativa depois da tabela quebrava o cálculo de altura** — um parágrafo de texto ficou posicionado depois do `.grade-container`, então o "fim da página" real deixava de ser a tabela, e sobrava scroll externo. Corrigido movendo a nota pra antes da tabela (funciona até melhor como introdução do que como rodapé).
3. **Recalculo de altura não acompanhava o HTMX** — o cálculo só rodava 1x, no carregamento da página. Depois de uma consulta (HTMX trocando o card de resultado, que muda de altura), a tabela ficava com o tamanho antigo e sobrava scroll externo de novo. Corrigido escutando o evento `htmx:afterSwap` e recalculando sempre que o HTMX troca algo na página.

## Relacionado

- [[Decisao - PIS e COFINS de Saida por NCM Serao Armazenados em Tabela Normalizada, Uma Linha por NCM e CST]]
- [[Descoberta - PIS e COFINS Sao Funcao de NCM + CST, e CST Diverge nos Mesmos EANs ja Rejeitados no ICMS]]
- [[Descoberta - Rolagem da Tela de ICMS por NCM Validada com Volume Real, 2 Bugs Corrigidos]]
- [[Checkpoint - Inicio da Estrutura de Impostos de Saida]]
