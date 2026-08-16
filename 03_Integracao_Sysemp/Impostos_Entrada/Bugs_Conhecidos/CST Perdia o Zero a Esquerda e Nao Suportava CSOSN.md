---
tipo: bug_conhecido
dominio: fiscal
status: corrigido
criado: 15/08/2026
atualizado_em: 15/08/2026 23:25
relacionado: [Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto), Modal de Produto — Aba Impostos (Entrada e Saida), Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]
---

# CST Perdia o Zero à Esquerda e Não Suportava CSOSN (3 Dígitos)

## Contexto

Durante o redesenho da aba Impostos do modal de produto, o usuário percebeu no dado real exibido em tela que o CST do ICMS aparecia como "0" em vez de "00" — formato errado pra um código fiscal que sempre tem 2 dígitos fixos (ou 3, no caso de CSOSN — ver achado abaixo).

## Causa raiz

Não estava em `impostos/models.py`, e sim uma camada acima, em `integracao_sysemp/servicos/dados_xml_nf.py`: os campos `cst_xml`/`cst_cadastro` das dataclasses `Icms`, `Ipi`, `Pis`, `Cofins` eram tipados `int` e parseados pelo helper `_int_ou_zero()` (`int(valor)` na prática) — "00" (string, vindo da API) virava `0` (int), destruindo o zero à esquerda antes mesmo de chegar no banco.

## Correção

Novo helper dedicado, que preserva string e garante 2 dígitos:

```python
def _str_cst_ou_zero(valor) -> str:
    if valor in (None, ''):
        return '00'
    return str(valor).strip().zfill(2)
```

Usado nas 4 dataclasses no lugar de `_int_ou_zero`; `cst_xml`/`cst_cadastro` retipados `int`→`str` nelas e em `LinhaImpostoEntrada` (`impostos/models.py`).

## Achado real no meio da migração: CSOSN existe, não é dado corrompido

A 1ª tentativa migrou `IcmsEntradaProduto`/`IpiEntradaProduto`/`PisEntradaProduto`/`CofinsEntradaProduto.cst_xml`/`cst_cadastro` de `PositiveSmallIntegerField` pra `CharField(max_length=2)` — `migrate` falhou: `MySQLdb.DataError: Data too long for column 'cst_xml' at row 673`.

Diagnóstico via `dbshell` (`DESCRIBE`/`SELECT` direto nas tabelas, não pela ORM) revelou: `impostos_icmsentradaproduto`, `id=673`, `impostos_e_custos_id=673`, `cst_xml=102`. Não é dado corrompido — é um **CSOSN** real (Código de Situação da Operação — Simples Nacional), usado no lugar do CST comum quando o fornecedor está no regime do Simples Nacional. CSOSN sempre tem 3 dígitos (ex.: "102" = "Tributada pelo Simples Nacional sem permissão de crédito"), enquanto o CST do regime normal tem 2. O sistema precisa acomodar os dois formatos no mesmo campo.

Corrigido pra `CharField(max_length=3)` — cobre CST (2 dígitos) e CSOSN (3 dígitos) no mesmo campo, sem distinguir regime na modelagem (não é necessário pro caso de uso atual).

## Nota sobre MySQL e migração parcial

Como o MySQL não trata DDL como transação (diferente do Postgres), a migração `0010` que falhou no meio deixou algumas colunas já alteradas mesmo sem o Django ter registrado ela como aplicada em `django_migrations`. Resolvido apagando a migração quebrada (nunca chegou a ser registrada como aplicada) e gerando uma nova, correta, com `max_length=3`.

## Resultado validado (15/08/2026)

A fixture compartilhada de teste (`_dados_xml_nf_padrao()`, em `test_nivel_3__impostos_e_custos_xml_entrada_produto.py`) tinha os mesmos CST hardcoded como int `0`, contornando o parser real — corrigida pra string `'00'`. 5 asserções em `test_nivel_0__dados_xml_nf.py` também corrigidas (esperavam tupla com `0` int, agora `'00'` string). **542 passed** (mesmas 6 falhas pré-existentes de antes desta mudança, sem relação).

**Requer reprocessamento:** produtos já sincronizados antes desta correção têm CST salvo como int (sem zero à esquerda) — `reprocessar_impostos_entrada_de_json` corrige ao rodar de novo, sem chamar a API.

## Relacionado

- [[Modelagem de Impostos e Custos de Entrada via XML (ImpostosECustosXMLEntradaProduto)]]
- [[Modal de Produto — Aba Impostos (Entrada e Saida)]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
