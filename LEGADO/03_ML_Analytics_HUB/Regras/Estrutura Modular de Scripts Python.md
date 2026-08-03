---
tipo: regra
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# Estrutura Modular de Scripts Python

Todo script Python do ML Analytics HUB segue uma ordem fixa de seções,
sempre nesta sequência:

```
1. IMPORTAÇÕES
2. CONSTANTES
3. IMPORTAÇÃO DE DADOS
4. TRABALHANDO COM DADOS BRUTOS
5. INSERINDO NO EXCEL / MONTANDO SAÍDA
6. APARÊNCIA (quando houver formatação visual, ex: Excel)
7. SALVANDO / ENTRY POINT
```

## Motivo

Um script anterior (`gerar_excel_performance_v2.py`) misturava carregamento
de dados, extração, montagem de DataFrame e formatação visual tudo em
sequência solta, sem funções nomeadas — difícil de localizar "onde mexo se
quero mudar a cor do Status" ou separar lógica de dados de lógica visual.

A reescrita seguinte (`v3`) adotou este padrão modular e ficou
comprovadamente mais fácil de ler, testar e ajustar em partes isoladas —
por isso virou regra fixa para qualquer script novo do projeto, não só
geradores de Excel.

## Aplicação prática

- Cada seção é demarcada com um comentário separador claro (ex:
  `# ════ 1. IMPORTAÇÕES ════`).
- Funções têm responsabilidade única — uma função de extração de dado não
  deve conter lógica de formatação visual, e vice-versa.
- Quando o script gera múltiplas abas/saídas (ex: aba de dados + aba de
  dicionário), cada uma tem suas próprias funções de montagem e de
  aparência, chamadas separadamente a partir de uma função orquestradora
  única (ex: `melhorar_aparencia()` chamando `aparencia_aba_x()` e
  `aparencia_aba_y()`).
- Reaproveitar funções já existentes de outros scripts do projeto via
  import direto (ex: `classificar_por_sku.py` fornece
  `encontrar_fecho_transitivo`, `classificar_tipo`) em vez de duplicar a
  lógica — evita duas fontes divergentes da mesma regra de negócio.

## Relacionado

- [[Regras Gerais]]
