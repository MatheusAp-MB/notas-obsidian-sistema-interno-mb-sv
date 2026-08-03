---
tipo: conceito
dominio: 
status: ativa
criado: 07/10/2026
relacionado: [MOC Django, MOC HUB, Glossario, Estrutura e Convenções do Vault, Quando Registrar no Obsidian]
---

# Visão Geral do Projeto

## Contexto de negócio

DEV atua como desenvolvedor solo e operador de negócio, construindo sistemas
internos para duas empresas — **MB** e **SV** — que vendem produtos no
Mercado Livre. DEV é simultaneamente o especialista de domínio (quem entende
as regras de negócio do marketplace) e o desenvolvedor principal (quem
constroi o sistema), o que dá conhecimento profundo o suficiente para
corrigir premissas técnicas quando testadas contra dado real da API.

## Objetivo geral

Ter um sistema interno que centralize e organize informações dos anúncios
das duas empresas no Mercado Livre — qualidade de anúncio, competição de
catálogo, critérios, produtos — permitindo decisões melhores e mais rápidas
sobre como cada anúncio deve ser tratado (preço, catálogo, prioridade).

Isso se divide em dois projetos que trabalham em conjunto, mas de forma
desacoplada:

## Os dois "mundos"

### 1. Sistema Interno (Django) — `02_Sistema_Interno_Django/`

Sistema web (Python 3.12, Django, MySQL, Poetry) com as telas que DEV e a
equipe usam no dia a dia: Hub de Anúncios, Qualidade do Anúncio, Competição
de Catálogo, Resumo de Critérios, Produtos.

**Regra fundamental:** este sistema **nunca chama a API do Mercado Livre
diretamente**. Todo dado chega via arquivos JSON/Excel gerados externamente
pelo ML Analytics HUB e colocados manualmente nas pastas do projeto.

### 2. ML Analytics HUB — `03_ML_Analytics_HUB/`

Sistema Python standalone que extrai dados do Mercado Livre via API oficial
(OAuth2/PKCE) e gera os arquivos JSON/Excel que o Sistema Interno consome.
Cobre desde a busca de MLBs até a classificação de anúncios em três estados
(Simples / Base / Catálogo) e geração de relatórios Excel.

## Por que dois projetos separados, e não um só

O Sistema Interno é a camada de decisão e visualização; o HUB é a camada de
extração e classificação de dado bruto da API. Separar os dois evita que o
Django dependa de rate limit, autenticação ou instabilidade da API do
Mercado Livre em tempo real — o HUB roda por fora, gera arquivo, e o Django
só lê arquivo.

## Como este vault se relaciona com o código

Este repositório (`notas-obsidian-sistema-interno-mb-sv`) não contém código.
Ele é a base de conhecimento que guia como o código é pensado, decidido e
mantido — regras, decisões, descobertas e dúvidas de ambos os projetos.
O código-fonte em si vive em repositórios separados.

## Por onde continuar

- [[MOC Django]] — mapa de notas do Sistema Interno
- [[MOC HUB]] — mapa de notas do ML Analytics HUB
- [[Glossario]] — termos e siglas usados nos dois projetos (MLB, SKU, folha,
  fossil, etc)
- [[Estrutura e Convenções do Vault]] — como pastas, arquivos e frontmatter
  devem ser organizados neste vault
- [[Quando Registrar no Obsidian]] — critério de quando e como uma nota deve
  ser criada