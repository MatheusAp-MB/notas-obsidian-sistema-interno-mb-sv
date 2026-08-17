---
tipo: bug_conhecido
dominio: python
status: corrigido
criado: 17/08/2026
atualizado_em: 17/08/2026 00:20
relacionado: [Redesenho do Popular Banco - Fontes de Dados e Escopo, Guia de Setup - Do Zero ao Primeiro Preco Calculado, Como Escrever Notas no Vault — Padrao Hiper-Didatico]
---

# Frete Ficou 2 Dias Desatualizado Sem Nenhum Erro Visível — Caminho Antigo Nunca Corrigido

## O quê — o que aconteceu, em 1 frase

Entre 15/08/2026 e 17/08/2026, os 4 comandos que importam tabela de frete (`FRETE ML`, `FRETE MAGALU`, `FRETE TIKTOK`, `FRETE AMAZON`, todos dentro de `popular_banco`) estavam lendo de uma pasta que não existia mais — e ninguém percebeu, porque o sistema inteiro continuou rodando sem nenhum erro.

## Por quê isso é perigoso — a lição, não só o bug

Este ponto é mais importante que a correção em si, e é o motivo desta nota existir como `bug_conhecido` (documentando causa raiz), não só como uma linha de texto arrumada silenciosamente dentro do checkpoint.

> [!danger] Confiança de 100% num comando que, na prática, estava rodando errado há 2 dias
> O `popular_banco` já tinha sido "validado com dado real" e dado como funcional em 15/08/2026 (ver [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]). A partir daquele dia, a expectativa real era "esse comando está 100% correto". Só que um item ficou marcado como "não urgente, resolver depois" — e "depois" nunca chegou sozinho. O comando continuou rodando normalmente, todo santo dia, sem travar, sem exceção, sem nada em vermelho — só um aviso amarelo (`[FRETE ML] Arquivo ... não encontrado — pulando essa etapa.`) fácil de rolar pra baixo e nem ler no meio de uma saída de terminal gigante. **Se a tarefa de hoje (17/08) não tivesse exigido rodar `popular_banco` de novo por um motivo completamente diferente (gerar um relatório pra Samvale), esse erro poderia ter ficado invisível por semanas ou meses.**

**Por que ele não travava nada, mesmo estando errado:** os importadores de frete usam `get_or_create` — ou seja, toda vez que o arquivo "não era encontrado", o comando só deixava de ATUALIZAR a tabela de frete, mas nunca apagava o dado que já existia de antes (de uma importação anterior, bem-sucedida, de antes de 15/08). O banco continuava com números de frete plausíveis, só que **congelados no tempo** — nenhuma mudança real de frete feita depois de 15/08 estaria refletida no cálculo de preço, e nada no sistema avisava disso.

## Pra quê serve saber disso — o padrão de risco, não só este caso

> [!question] Pergunta pra levar adiante, não resolvida aqui
> Quantos outros itens estão hoje marcados como "não urgente" em algum checkpoint do vault, exatamente como este estava? Cada um desses é um candidato a ficar invisível do mesmo jeito, até o dia em que alguém precisar rodar aquele trecho de código de novo por acaso. Vale, em algum momento, revisar todos os itens "não urgente" abertos do vault com essa lente — não fica decidido nesta nota, só registrado como ideia real.

## Como — causa técnica exata

Os 4 arquivos de frete foram fisicamente movidos, em 15/08/2026, pra uma pasta nova e organizada (`Arquivos usados para Popular Banco/Tabelas de Frete/`) — mas o caminho hardcoded dentro de cada um dos 4 comandos de importação nunca foi atualizado pra acompanhar essa mudança. Cada um dos 4 arquivos abaixo tinha uma constante `Path(...)` apontando pra pasta antiga (`Arquivos_de_Importação/`), que não existe mais neste projeto:

| Arquivo de código | Constante | Caminho antigo (errado) |
|---|---|---|
| `core/management/commands/popular_banco_suporte/importar_tabela_frete_ml.py` | `CAMINHO_TABELA_FRETE` | `Arquivos_de_Importação/Tabela_Frete_ML.xlsx` |
| `core/management/commands/popular_banco_suporte/importar_tabela_frete_magalu.py` | `CAMINHO_TABELA_FRETE_MAGALU` | `Arquivos_de_Importação/Tabela_Frete_Magalu.xlsx` |
| `core/management/commands/popular_banco_suporte/importar_tabela_frete_tiktok.py` | `CAMINHO_TABELA_FRETE_TIKTOK` | `Arquivos_de_Importação/Tabela_Frete_TikTok.xlsx` |
| `core/management/commands/popular_banco_suporte/importar_tabela_frete_amazon.py` | `CAMINHO_TABELA_FRETE_AMAZON` | `Arquivos_de_Importação/Tabela_Frete_Amazon.xlsx` |

**Achado extra, que nem a nota original de 15/08 previa:** não foi só a pasta que mudou — 2 dos 4 arquivos também foram salvos com um **nome diferente** do que o código esperava:

- `Tabela_Frete_ML.xlsx` (esperado) → o arquivo real chama `Tabela_Frete_Mercado_Livre.xlsx`.
- `Tabela_Frete_TikTok.xlsx` (esperado) → o arquivo real chama `Tabela_Frete_Tiktok_Shop.xlsx`.

Ou seja, mesmo se alguém tivesse corrigido só a pasta (sem checar o nome de cada arquivo dentro dela), esses 2 continuariam falhando do mesmo jeito, silenciosamente.

## Correção

As 4 constantes foram atualizadas pra apontar pro caminho e pro nome reais (validado em produção, 17/08/2026, 00:20):

```python
# importar_tabela_frete_ml.py
CAMINHO_TABELA_FRETE = Path('Arquivos usados para Popular Banco/Tabelas de Frete/Tabela_Frete_Mercado_Livre.xlsx')
```

```python
# importar_tabela_frete_magalu.py
CAMINHO_TABELA_FRETE_MAGALU = Path('Arquivos usados para Popular Banco/Tabelas de Frete/Tabela_Frete_Magalu.xlsx')
```

```python
# importar_tabela_frete_tiktok.py
CAMINHO_TABELA_FRETE_TIKTOK = Path('Arquivos usados para Popular Banco/Tabelas de Frete/Tabela_Frete_Tiktok_Shop.xlsx')
```

```python
# importar_tabela_frete_amazon.py
CAMINHO_TABELA_FRETE_AMAZON = Path('Arquivos usados para Popular Banco/Tabelas de Frete/Tabela_Frete_Amazon.xlsx')
```

> [!success] Validado com dado real (17/08/2026, 00:14)
> `python manage.py popular_banco` rodado de novo, do zero, depois da correção: **FRETE ML — 232 atualizados, 0 erros**; **FRETE MAGALU — 27 atualizados, 0 erros**; **FRETE TIKTOK — 5 atualizados, 0 erros**; **FRETE AMAZON — 126 atualizados (63 DBA + 63 FBA), 0 erros**. As 6 grades de precificação recalculadas em seguida deram exatamente os mesmos números de "sem cálculo possível" de antes da correção (432/208/208/220/423/424) — confirma que nenhum dado de frete tinha sido perdido enquanto o bug existia, só não estava mais sendo atualizado.

## Relacionado

- [[Redesenho do Popular Banco - Fontes de Dados e Escopo]]
- [[Guia de Setup - Do Zero ao Primeiro Preco Calculado]]
- [[Como Escrever Notas no Vault — Padrao Hiper-Didatico]]
