---
tipo: duvida
dominio: 
status: ativa
criado: 10/07/2026
relacionado: []
---

# Divergência Entre "3 Fotos" (API) e "5 Fotos" (Crença da Equipe)

A equipe (incluindo o dono do negócio) acredita que o Mercado Livre exige
no mínimo **5 fotos** para pontuação máxima de qualidade do anúncio — mas
a API retorna literalmente "carregue pelo menos **3**" no texto oficial
do critério `UP_PICTURES_QUANTITY_MIN`.

## Evidência do texto oficial da API

```json
{
  "key": "UP_PICTURES_QUANTITY_MIN",
  "status": "COMPLETED",
  "wordings": {
    "title": "Adicione mais fotos para mostrar seu produto em diferentes ângulos, carregue pelo menos 3."
  }
}
```

## O que ainda não sabemos

Não está confirmado qual das duas hipóteses é verdadeira:

- O algoritmo realmente exige só 3 fotos, e a crença da equipe está
  desatualizada ou vem de outra fonte (leitura de mercado, prática
  antiga, confusão com outro critério).
- O algoritmo exige mais que 3 na prática (talvez para atingir o score
  máximo, não só para completar o critério), mas o texto exposto pela API
  não reflete isso — o critério pode estar "completo" com 3 fotos e ainda
  assim não conceder pontuação máxima por outro motivo não exposto.

## Por que isso importa

Essa é exatamente o tipo de caso que motivou a decisão de sempre exibir o
texto **bruto** da API lado a lado com qualquer tradução/interpretação
própria (ver Excel de performance, bloco "BRUTO DA API" vs "NOSSA
INTERPRETAÇÃO") — para permitir auditoria rápida quando esse tipo de
divergência aparecer.

## Como resolver quando for retomado

Não há como resolver só com dado da nossa conta — provavelmente exigiria
abrir consulta direta com o suporte do Mercado Livre, ou encontrar
documentação oficial mais detalhada sobre o cálculo de score do critério
`UP_PICTURES_QUANTITY_MIN` além do texto exposto no `wordings.title`.

## Relacionado

- [[Regras Gerais]]