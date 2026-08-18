---
tipo: descoberta
dominio: agenda_videos
status: resolvida
criado: 18/08/2026
atualizado_em: 18/08/2026 11:00
relacionado: [Convencao de Nomenclatura de Arquivos no Drive, Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao), Disciplina de Testes Automatizados]
---

# Roteiro Salvo no Plural pela Equipe — Parser Aceita Singular e Plural

## O quê aconteceu

Ao validar a Etapa 1 (integração com o Google Drive) contra o produto de referência da Samvale — Ortho Pauher, EAN `7899947306688` — o teste real contra o Drive travou na etapa "roteiro", mesmo o arquivo existindo visualmente na pasta. Investigando, o nome real do arquivo era `Simples_Roteiros.txt` (plural), não `Simples_Roteiro.txt` (singular) como a convenção pedia (ver [[Convencao de Nomenclatura de Arquivos no Drive]]).

## Por quê isso quebrava

`agenda_videos/funcoes_auxiliares/drive/parser.py` reconhece nome de arquivo por expressão regular (`re`), rígida de propósito no formato — prefixo certo, número de 2 dígitos quando aplicável, extensão certa por tipo. Essa rigidez é uma decisão consciente do projeto: evita aceitar por engano um arquivo com nome parecido mas errado. O efeito colateral é que qualquer desvio do nome exato — mesmo 1 letra "s" a mais — faz o arquivo cair no balde `arquivos_nao_reconhecidos`, e o sistema passa a tratar aquele arquivo como se não existisse. Resultado prático: o produto ficava travado pra sempre na etapa "roteiro", com diagnóstico "Aguardando Roteiro", mesmo o vídeo/roteiro estando 100% pronto do lado humano.

## Pra quê a correção (em vez de só renomear o arquivo)

Renomear manualmente esse 1 arquivo resolveria só o caso do Ortho Pauher — mas a causa real é um hábito da equipe (confirmado pelo usuário: "o pessoal da equipe estão salvando como 'Simples_Roteiros.txt'"), não um erro isolado. Se o parser continuasse rígido só no singular, o mesmo bloqueio ia se repetir em outros produtos, silenciosamente, cada vez que alguém do time salvasse no plural sem saber da regra escrita no vault. A correção certa é o sistema se adaptar ao padrão real da equipe, não o contrário — mas só nesse 1 ponto específico (o "s" do Roteiro), sem abrir a rigidez do resto do formato.

Isso é seguro de fazer porque Roteiro é só EXISTÊNCIA, nunca conteúdo (regra já registrada em [[Convencao de Nomenclatura de Arquivos no Drive]] desde 05/08) — a automação nunca abre nem lê esse arquivo, só confirma que ele existe com o nome certo. Uma letra "s" a mais no nome não muda em nada o que o arquivo representa pro fluxo.

## Como foi corrigido

Em `parser.py`, os 2 padrões que reconhecem nome de arquivo (`PADRAO_SIMPLES`, pro Simples; `PADRAO_NUMERADO`, pro Mensal/Trimestral) trocaram o trecho fixo `roteiro` por `roteiros?` — o `?` em regex significa "o caractere anterior é opcional", ou seja, casa tanto com `roteiro` quanto com `roteiros`. Como o resto do código (as chaves de dicionário, a validação de extensão) só conhece a forma singular `'roteiro'`, foi adicionada uma função pequena, `_normalizar_tipo()`, que transforma `'roteiros'` em `'roteiro'` logo depois do reconhecimento — assim ninguém mais no sistema precisa saber que a variação existe.

```python
PADRAO_SIMPLES = re.compile(r'^simples_(base|roteiros?|completo)\.([a-z0-9]+)$', re.IGNORECASE)
PADRAO_NUMERADO = re.compile(r'^(mensal|trimestral)_(\d{2})_(base|roteiros?|completo)\.([a-z0-9]+)$', re.IGNORECASE)

def _normalizar_tipo(tipo):
    return 'roteiro' if tipo == 'roteiros' else tipo
```

## Exemplo real de ponta a ponta

Antes da correção: `Simples_Roteiros.txt` (Ortho Pauher, pasta "Samvale Estruturada") caía em `arquivos_nao_reconhecidos`, e `verificar_produto_no_drive()` devolvia `etapas_marcadas=['base']` — travado, mesmo com o roteiro real pronto na pasta.

Depois da correção: o mesmo arquivo, mesmo nome, é reconhecido como o Roteiro da ocorrência 1 da fase Simples — `verificar_produto_no_drive()` passa a devolver `etapas_marcadas=['base', 'roteiro', 'completo']`, igual ao comportamento já validado pro QUIMIVIDA (Magazine) desde 05/08. Teste de regressão (Nível 0, puro, sem rede) cobrindo os 2 ramos (Simples e Numerado) em `agenda_videos/tests/test_nivel_0__parser.py` — `parser.py` em 100% cover depois da correção.

## Relacionado

- [[Convencao de Nomenclatura de Arquivos no Drive]]
- [[Checkpoint - Correcao de Ponta a Ponta da Agenda de Videos (Drive Postagem Aprovacao ML Replicacao)]]
- [[Disciplina de Testes Automatizados]]
