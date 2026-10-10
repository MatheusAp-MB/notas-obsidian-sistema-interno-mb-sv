---
tipo: investigação
status: em investigação
criado: 08/10/2026
dominio: integração sysemp
relacionado: ["[[00_Indice_Integracao_Sysemp]]", "[[00_Indice_Sistema_Interno]]"]
---

# listarAnaliseEstoqueFull — estoque do ERP por local (Sysemp)

> Registrado em 08/10/2026 às 10:58. Nota pensada para ser lida sozinha, por quem for iniciar um dos projetos paralelos a partir dela, sem precisar do chat em que tudo foi descoberto.

## 1. Resumo em 5 linhas

- A Sysemp liberou um método novo, `listarAnaliseEstoqueFull`, que devolve o **estoque do ERP por produto e por local de estoque**.
- Ele **só existe na Samvale (instância /84)**. Na Magazine (/61) a resposta é "Metodo não Localizado".
- Cada linha da resposta é **um produto em um local** (`id_empresa` = o ID do local de estoque no ERP).
- Os locais relevantes são 4 (Full no ERP), 2 e 10 (Flex, em dois barracões) e 1 (VSComercio, que não deveria ter estoque).
- O teste foi só do **primeiro bloco de 100 linhas**; as demais páginas ainda não foram lidas.

## 2. De onde veio

- Doc nova da Sysemp: `documentacao_api_VSComercio.pdf` ("Gerado em 08/10/2026", 4 páginas), com 2 métodos:
  - `listarAnaliseEstoqueFull` — **novo**. A doc mostra só o pedido; **não documenta a resposta**.
  - `listarManifestoNotaEntrada` — já usado pelo sistema (`ImpostosEntradaXML.listar_por_periodo`).
- A doc é da instância da VS Comércio (/84). Os exemplos em PHP usam timeout 0 (sem limite de tempo).

## 3. Como chamar

| Item | Valor |
|---|---|
| Método HTTP | POST |
| Endereço | `https://api.sysemp.com.br/84/listarAnaliseEstoqueFull` (Samvale; a Magazine seria `/61/...`) |
| Header | `Token` (o mesmo token que o sistema já usa nos outros métodos: `MB_SYSEMP_API_TOKEN` / `SV_SYSEMP_API_TOKEN` no `.env`) |
| Corpo | `{"offset": "0"}` |

- A doc mostra `"offset": ""` (vazio), mas **offset vazio já quebrou a API antes** (achado da exploração do manifesto). Usar `"0"` no primeiro bloco.
- O token da Samvale foi aceito neste método.

## 4. Resultado do teste (08/10/2026, rodado por Matheus)

| Empresa | Resposta | Detalhe |
|---|---|---|
| Magazine (/61) | HTTP 200, `{"status": false, "message": "Metodo não Localizado"}` | 55 bytes, 0,3 s. O método **não existe/não está liberado** nessa instância. |
| Samvale (/84) | HTTP 200, com dados | 14.857 bytes, 1,0 s, `qtde` = 100, `retorno` com 100 itens. |

- O "erro" da Magazine vem com **HTTP 200** e `status: false` (erro "suave"), então é preciso olhar o `status`, não só o código HTTP.
- `qtde` é a **quantidade de linhas do bloco** (100), não o total geral.

## 5. Formato da resposta (Samvale)

```
{ "status": true, "qtde": 100, "retorno": [ { "id_empresa": "2", "id_produto": "1835", "sku": "F7898301054494.001", "descricao": "APARELHO DE PRESSÃO MANUAL ...", "estoque": "22.0000" }, ... ] }
```

- Todos os campos vêm como **texto** (inclusive `estoque`, no formato `"22.0000"`).
- Ordem: **crescente por `id_produto`** (no 1º bloco, de 1835 a 33493).
- **Só vêm linhas com estoque maior que zero.** Local zerado não aparece (confirmado no produto 1835).
- **Não há campo de Full, de "a caminho" nem de "reservado".** O que liga a resposta ao Full é o significado do local (seção 6).
- Paginação: provavelmente `offset` 100, 200, ... mas **ainda não testado** — ao testar, conferir que não repete nem pula linhas e que uma página vazia marca o fim.

## 6. O que significa cada `id_empresa` (explicado por Matheus)

O `id_empresa` da API é o **ID do local de estoque** na tela de estoque do produto no ERP (coluna "ID"). Um mesmo SKU pode ter estoque em vários locais.

| id | Nome no ERP | O que é | Equivale no Mercado Livre |
|---|---|---|---|
| 4 | MELI FULL SAMVALE STEXPID | Controle do ERP do estoque que está no Full. Em teoria é **sempre igual ao estoque do Full no ML**. | **Full** |
| 2 | SAMVALE | Onde os produtos ficam **fisicamente quando não são Full**. É o que o ML chama de Flex. | **Flex** |
| 10 | DEPOSITO INDUSTRIAL SAMVALE | **Igual ao id 2**, mas em **outro barracão físico** (divisão por falta de espaço; são 2 barracões). **Independente** do id 2. | **Flex** (2º barracão) |
| 1 | VSCOMERCIO | Empresa que **não terá mais movimentação**. **Não deveria ter estoque nenhum.** | nada |

- Os demais locais do ERP (3, 7, 13, 14, 15, 16 e Farmácia Depósito 2) **não são relevantes**. Pelos nomes: quatro "MELI FULL ..." (PINK E-SHOP, STO-EXPED, FARMA.SHOP.NOVA, NOVO-E-SHOP), dois da Amazon (FBA CLASSIC FULL e CLASSIC) e a Farmácia Depósito 2. Eles **não vieram** no 1º bloco.
- A tela do ERP também separa **"Nome do Estoque"**: `PRINCIPAL` e `PERDAS`. No produto 1835, o estoque de PERDAS (1 unidade) **não entrou** nos 22 da API. Ou seja, o `estoque` da API parece ser só o PRINCIPAL.
- A tela do ERP tem as colunas Estoque, Em Trânsito, Reservado, Disponível e Similar. A API traz **um número só** (`estoque`). **Ainda não se sabe se ele é a coluna "Estoque" ou "Disponível"** (no 1835 os dois são 22; falta um produto com Reservado ou Em Trânsito diferente de zero para separar).

### Validação

- Print da tela de estoque do ERP do **produto 1835** (SKU F7898301054494.001): SAMVALE (id 2) com Estoque 22 e Disponível 22, todos os outros locais zerados e PERDAS com 1. A API trouxe **uma linha só** para esse produto: `id_empresa` 2, `estoque` 22. **Bateu.**

## 7. O que apareceu no 1º bloco (100 linhas = 99 produtos)

| id | Local | Linhas | Soma do estoque | Maior estoque |
|---|---|---|---|---|
| 4 | Full (ERP) | 45 | 135 | 13 |
| 2 | Flex (barracão) | 51 | 457 | 120 |
| 10 | Flex (2º barracão) | 1 | 560 | 560 |
| 1 | VSComercio | 3 | 7 | 5 |
| | **Total** | **100** | **1.159** | |

- **Flex total** (ids 2 + 10): 1.017 unidades.
- **Nenhum produto tem estoque no Full e no Flex ao mesmo tempo** neste bloco. O único produto em dois locais é o 30915 (almofada ortopédica assento de gel, SKU F972980602430.001): 8 no id 2 e 560 no id 10.
- **VSComercio com estoque (conferir no ERP):** produto 30827 (Monitor Doppler DF-7001 D, 1 un), produto 30829 (Monitor Doppler DF-7001 D, 1 un) e produto 32003 (Bastão de Massagem com Espinhos, 5 un).

### Dados sujos vistos (guardar crus no banco; tratar só na exibição)

- 4 linhas **sem SKU**, todas no id 4: produtos 1855, 1857, 5393 e 18339.
- O produto 18339 tem "(INATIVO)" na descrição e 9 unidades no id 4.
- 1 SKU fora do padrão: o produto 32003 tem SKU "32003" (sem o `F...001`).
- 5 descrições com espaço sobrando no final.
- O mesmo `sku` pode se repetir em linhas de locais diferentes (produto 30915).

## 8. Como isso ajuda o sistema (hipóteses, ainda não validadas)

- **Full:** comparar o ERP **id 4** com o estoque do Full no Mercado Livre (a tela "Estoque no Full" já mostra o do ML).
- **Flex:** comparar o ERP **ids 2 + 10** com o Flex do ML (`GET /user-products/{id}/stock`, local `selling_address`).
- **Selos "NÃO CONFERIDO"** do "No Flex" e do "Em transferência" na tela "Estoque no Full" ficaram esperando o estoque do ERP; este método pode ser a fonte, **mas só para a Samvale**.
- **"A caminho" não tem local próprio** na API (a tela do ERP tem "Em Trânsito", a API não manda).
- **Magazine:** sem este método, o estoque do ERP da Magazine continua sem fonte. O caso de teste do Full usado até agora (SKU F7908050719121.001) é da conta MB, então **este método não resolve esse caso**.

## 9. O script de exploração

Arquivo: `scripts_exploracao_ERP/investigar_analise_estoque_full.py` (Projeto_Sistema_Interno_V2). Rodar da raiz do projeto:

```
poetry run python scripts_exploracao_ERP/investigar_analise_estoque_full.py
```

- **Só leitura**: 1 POST por empresa, sem retentativa, sem tocar no banco e sem Django.
- Testa **as duas empresas na mesma execução** (a lista `EMPRESAS` no topo). O erro de uma não impede a outra.
- Lê o token e a URL do `.env` da raiz (caminho absoluto), com as mesmas variáveis do `ApiSysemp`.
- **Nunca mostra o token**: só o tamanho dele e se o das duas empresas é igual.
- **Não usa o `ClienteApiSysemp`** de propósito: aquele cliente tem timeout fixo de 30 s e retenta até 4 vezes, o que repetiria uma consulta pesada num método ainda desconhecido. O script usa timeout configurável (`TIMEOUT_SEGUNDOS`, hoje 120 s).
- Configurações no topo: `EMPRESAS`, `OFFSET` (hoje `"0"`), `TIMEOUT_SEGUNDOS` e `MOSTRAR_TODAS_AS_LINHAS`.
- Salva a resposta crua em `scripts_exploracao_ERP/saidas/` (pasta já no `.gitignore`): `.json` quando vêm dados e `.txt` nos outros casos. O `mapear_campos_json.py` lê o `.json` **mais recente** da pasta.
- Mostra: o veredito de cada empresa, os campos da resposta, um **resumo por local** (com o significado de cada id), uma **tabela por produto** com uma coluna por local (Full, Flex, Flex 2º barracão, Flex total, VSComercio) e o **alerta do VSComercio**.
- O significado dos ids está no dicionário `LOCAIS_DE_ESTOQUE` e **só vale para a Samvale**. Um id fora do mapa aparece na coluna "Outros". Se o método passar a existir na Magazine, os ids dela não têm significado mapeado.
- Hoje o script lê **só o primeiro bloco** (offset "0").

Arquivos gerados no teste de 08/10/2026: `analise_estoque_full_SV_20261008_103559.json`, `analise_estoque_full_MB_20261008_103557.txt` e o mapa de campos `..._mapa_campos.txt`.

## 10. Pendências e próximos passos

1. **Ler todas as páginas da Samvale** (`offset` 100, 200, ... até vir vazia): total real de linhas, total por local, produtos com estoque no Full e no Flex ao mesmo tempo, SKUs vazios ou repetidos, e se o offset avança sem repetir linhas.
2. **Comparar com o banco** (script rodado por Matheus): ERP id 4 contra o Full do ML, e ERP ids 2 + 10 contra o Flex do ML, só para a Samvale.
3. **Perguntar à Sysemp:** (a) se liberam o `listarAnaliseEstoqueFull` na Magazine (/61); (b) se o `estoque` é a coluna "Estoque" ou "Disponível"; (c) se dá para trazer "Em Trânsito" e "Reservado"; (d) o que é o "Similar".
4. **Conferir no ERP** o estoque indevido do VSComercio (3 produtos, 7 unidades no 1º bloco) e o produto 18339 "(INATIVO)" com estoque no Full.
5. Decidir se vira método do `api_sysemp` (`ApiSysemp`) e, se sim, com qual proteção de timeout, já que o cliente atual tem 30 s.

## 11. Regras que valem para esta frente

- **Só leitura** na Sysemp. Nada é gravado de volta no ERP.
- O **token fica só no `.env`**; nunca é colado em chat, nota ou saída de script.
- **Quem roda contra a API real é o Matheus**; a Claude nunca roda nem testa contra a API real ou o banco real. Ele cola de volta o resumo impresso (que não tem o token).
- Dado cru da API vai para o banco **exatamente como veio** (espaços, SKU vazio etc.); qualquer tratamento fica na camada de exibição ou consulta.

## 12. Fontes

- Doc: `documentacao_api_VSComercio.pdf` (Sysemp, 08/10/2026).
- Teste: saída do script rodado por Matheus em 08/10/2026 (por volta de 10:35).
- Validação: print da tela de estoque do produto 1835 no ERP (explicação dos locais dada por Matheus em 08/10/2026).
