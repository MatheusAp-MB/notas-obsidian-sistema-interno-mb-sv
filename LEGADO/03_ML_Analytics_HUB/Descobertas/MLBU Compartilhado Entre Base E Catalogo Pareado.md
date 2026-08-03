---
tipo: descoberta
dominio: python
status: ativa
criado: 10/07/2026
relacionado: []
---

# MLBU Compartilhado Entre Base e Catálogo Pareado

Um Anúncio Base e o Anúncio de Catálogo pareado diretamente a ele
**compartilham o mesmo MLBU** — não são identificadores distintos como se
supunha inicialmente.

## Retificação de informação anterior

Uma correção anterior, passada para a conversa do projeto Django, havia
afirmado o oposto: "cada lado do par tem seu próprio MLBU, diferente
entre si". Essa afirmação **não foi verificada contra dado real** no
momento em que foi escrita — foi um erro que precisou ser retratado
formalmente depois.

## Evidência real que confirma

Rodando `/user-product/{MLBU}/performance` para todos os 21 MLBs do SKU
`F7908050719121.001`, os 7 pares Base↔Catálogo confirmados desse SKU
mostraram o **mesmo MLBU nos dois lados de cada par**, sem exceção:

| Anúncio Base | Anúncio de Catálogo (par) | MLBU (idêntico) |
|---|---|---|
| MLB1683028746 | MLB5593532940 | MLBU1092265387 |
| MLB1942167064 | MLB3346875129 | MLBU1099556282 |
| MLB4232612385 | MLB6434019392 | MLBU3463386800 |
| MLB4479436313 | MLB4479267725 | MLBU3796189253 |
| MLB4479431831 | MLB4479289263 | MLBU3796087975 |
| MLB4479357333 | MLB4479474011 | MLBU3796159491 |
| MLB4242628323 | MLB6804270586 | MLBU3474002727 |

**7 de 7 pares — 100% de consistência.**

## O que NÃO é compartilhado (limites da descoberta)

- **Pares diferentes da mesma Página de Catálogo** não compartilham MLBU
  entre si — confirmado no caso da Página `MLB47339623`, que tem 2 pares
  independentes (Base+Catálogo cada), cada par com seu próprio MLBU.
- **Variações físicas diferentes** (cor/tamanho) do mesmo produto têm
  MLBU próprio, distinto — confirmado com o MLB `MLB3321138767` (Pantufa),
  20 variações, 20 MLBUs diferentes.

## Interpretação

MLBU parece representar uma identidade de nível "produto/User Product" —
a mesma unidade vendável pode ter mais de um MLB apontando para ela (um
Base e um Catálogo), por isso compartilham o MLBU. Já uma variação física
diferente é, do ponto de vista do ML, um produto diferente — por isso tem
MLBU próprio.

## Relacionado

- [[Regras Gerais]]