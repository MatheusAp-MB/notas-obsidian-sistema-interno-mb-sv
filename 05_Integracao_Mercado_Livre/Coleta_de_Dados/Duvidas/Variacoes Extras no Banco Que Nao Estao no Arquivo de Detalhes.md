---
tipo: duvida
dominio: python
status: em_aberto
criado: 07/10/2026
atualizado_em: 07/10/2026 18:00
relacionado: [Fossil De Migracao, Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco, Niveis de Granularidade do Full e Como os Dados se Ligam]
resumo: "O banco tem mais variações de anúncio que o arquivo detalhes_mlbs.json de cada empresa (Magazine +42, Samvale +256), provavelmente porque o importador nunca apaga linhas; causa não confirmada e sem efeito no inventory_id."
---

# Variações Extras no Banco Que Não Estão no Arquivo de Detalhes

## Resumo

Em 07/10/2026, ao validar o `inventory_id` no banco, notou-se que **o banco tem mais variações de anúncio do que o arquivo `detalhes_mlbs.json`** de cada empresa. A causa **não foi identificada**. A hipótese principal é que o importador (`importar_anuncios_ml`) só cria e atualiza linhas e **nunca apaga**, então linhas de importações antigas continuam no banco. Não afeta o `inventory_id` nem a tela de estoque do Full. Registrado para investigar depois, a pedido do usuário.

## Contexto

Ao passar a guardar o `inventory_id` (Código ML do Full) em `VariacaoAnuncioMercadoLivre`, o banco foi conferido contra o arquivo. Os números do Código ML bateram exatamente nas duas empresas; o **total de variações**, não.

## Evidência (07/10/2026)

| Empresa | Registros no arquivo | Variações no banco | Diferença | Com Código ML (arquivo = banco) | Códigos distintos (arquivo = banco) |
|---|---|---|---|---|---|
| Magazine | 5.774 | 5.816 | **+42** | 1.422 | 915 |
| Samvale | 3.700 | 3.956 | **+256** | 966 | 620 |

- Arquivos gerados em 06/10/2026, 08:12 (Magazine) e 08:13 (Samvale) — campo `gerado_em` do próprio arquivo.
- Controle de coleta dos arquivos: `erros_itens = 0`, `erros_lotes = 0`, `lotes_com_erro = 0` e MLBs na lista = MLBs processados (Magazine 5.542; Samvale 3.568). Ou seja, **não houve falha de coleta** no dia.
- Cada registro do arquivo vira 1 variação no banco (chave: anúncio + `variacao_id`; sem variação real, o `variacao_id` é o próprio MLB). Cada empresa é consultada no seu próprio banco.
- Contagem no banco: `COUNT(*)` na tabela `mercado_livre_variacaoanunciomercadolivre`.

## O que se sabe do código

- `importar_anuncios_ml` usa só `bulk_create` e `bulk_update`; não há nenhum `delete`.
- Ele só toca nas variações dos MLBs que estão no arquivo daquela execução. Uma linha que sumiu do arquivo **nunca mais é atualizada**: preço, estoque e demais campos ficam congelados no último valor.
- Os **fósseis de migração** (tag `variations_migration_source`, ver [[Fossil De Migracao]]) são outro assunto: eles estão no arquivo, ficam marcados em `eh_fossil_migracao` e já são filtrados nas telas.

## Hipóteses (nenhuma confirmada)

1. **O anúncio inteiro saiu da lista.** Segundo o usuário, só são coletados MLBs ativos e pausados; um anúncio encerrado ou excluído depois de uma importação anterior sai do arquivo e a linha antiga continua no banco.
2. **O anúncio continua no arquivo, mas mudou a estrutura de variações** (por exemplo, passou de "sem variação", com `variacao_id` igual ao MLB, para "com variações", ou perdeu uma variação). A linha antiga fica ao lado das novas.
3. ~~Falha de coleta no dia~~ — **descartada**: o arquivo não registrou nenhum erro (ver evidência).

## Impacto conhecido

- **Nenhum no `inventory_id`:** as 1.422 (Magazine) e 966 (Samvale) variações com Código ML existem no arquivo, então as linhas extras não têm Código ML. A tela de estoque do Full não é afetada.
- **Possível em outras leituras:** contagens e telas que leem anúncios do banco podem incluir essas linhas antigas, com preço e estoque desatualizados, como se fossem anúncios atuais.

## Como investigar quando for retomado

1. **Teste rápido que separa as hipóteses:** contar os anúncios (MLBs) no banco e comparar com os MLBs do arquivo.

```sql
SELECT COUNT(*) AS anuncios_no_banco FROM mercado_livre_anunciomercadolivre;
```

   - Comparar com **5.542** (Magazine) e **3.568** (Samvale). Se o banco tiver **mais** anúncios, vale a hipótese 1. Se tiver o **mesmo** número, a diferença está dentro dos anúncios (hipótese 2).
2. **Listar as linhas extras:** comparar as chaves (MLB + `variacao_id`) do arquivo com as do banco e listar as que só existem no banco, com MLB, título e status.
3. **Decidir o destino:** limpar, marcar como "fora do arquivo" ou deixar como histórico — decisão de negócio do usuário, depois de ver a lista.

## Relacionado

- [[Fossil De Migracao]]
- [[Migracao dos Scripts Consumidores (buscar_mlbs e buscar_detalhes) e Pipeline de Popular Banco]]
- [[Niveis de Granularidade do Full e Como os Dados se Ligam]]
