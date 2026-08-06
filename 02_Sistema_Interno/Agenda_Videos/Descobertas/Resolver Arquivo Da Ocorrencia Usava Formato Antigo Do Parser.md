---
tipo: descoberta
dominio: 
status: ativa
criado: 06/08/2026
atualizado_em: 06/08/2026 10:15
relacionado: [Checkpoint Testes Automatizados Agenda Videos, Fluxo Manual Antes do Automatizado, Botao de Verificar Drive Individual Tinha 3 Bugs Reais]
---

# resolver_arquivo_da_ocorrencia() Usava Formato Antigo do Parser

Achado por leitura de código (Rodada 6, item 3 — antes de escrever qualquer teste pras rotas de `api/postagem_automatica` que tocam Drive), não por um teste que falhou. Bug real de produção, nunca antes exercitado.

## O que aconteceu

`resolver_arquivo_da_ocorrencia()` (`agenda_videos/funcoes_auxiliares/postagem_automatica/orquestrador.py`) é usada por 2 lugares: `view_baixar_video` (API de postagem) e o loop `_processar_1_produto` do orquestrador automático. Ela ainda usava o formato ANTIGO da estrutura devolvida pelo parser do Drive:

```python
completos_da_fase = estrutura.fases[fase].completos
todos_os_numerados = completos_da_fase.arquivos_validos + completos_da_fase.arquivos_fora_de_sequencia
arquivo_alvo = next((a for a in todos_os_numerados if a.numero == numero_esperado), None)
```

## Causa

A reescrita do Drive pro modelo Base/Roteiro/Completo por OCORRÊNCIA (05/08, ver [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]]) trocou por completo a forma de `ArquivosProdutoDrive`: o atributo `.fases` (dict) não existe mais — foi substituído por 3 atributos nomeados (`.simples`, `.video_mensal`, `.video_trimestral`) com o método `.obter_fase(chave)`; e `.completos.arquivos_validos/arquivos_fora_de_sequencia` (contagem de sequência) não existe mais — cada ocorrência agora é endereçada direto por número via `.obter_ocorrencia(numero)`, sem precisar validar sequência contígua.

`verificador.py` (a peça reescrita junto, e já testada — 42 passed) foi corrigida pra usar o formato novo corretamente. `orquestrador.py` — que importa a MESMA função `parsear_arquivos_produto`, mas é um consumidor separado — nunca foi atualizado.

## Por que ficou escondido

`view_baixar_video`/`view_marcar_concluido` (os 2 únicos chamadores) nunca tinham nenhum teste até a Rodada 6. O comentário `[PENDENTE]` que existia acima da função ("ainda não confirmado se isso muda no modelo novo... revisitar quando a estrutura do Drive for discutida à parte") documentava exatamente esse risco, mas ninguém tinha voltado pra resolver.

## Impacto se não corrigido

`AttributeError: 'ArquivosProdutoDrive' object has no attribute 'fases'` na primeira vez que qualquer um dos 2 chamadores fosse exercitado com dado real — ou seja, a Postagem Automática real (e o botão manual de baixar vídeo) quebrariam assim que alguém tentasse usá-los, depois da reescrita do Drive.

## Resolução

```python
estrutura = parsear_arquivos_produto(produto.marca, produto.ean, arquivos_brutos)
fase_estrutura = estrutura.obter_fase(ciclo.fase)
ocorrencia = fase_estrutura.obter_ocorrencia(ciclo.numero_ocorrencia)
arquivo_alvo = ocorrencia.completo if ocorrencia else None
```

Mesmo padrão já usado (e testado) em `verificador.py`. Confirmado pelo usuário: 346 passed, 0 failed, depois de escritos os testes das 4 rotas sem Drive + esse fix.

## Relacionado

- [[Checkpoint Testes Automatizados Agenda Videos]]
- [[Fluxo Manual Antes do Automatizado]]
- [[Botao de Verificar Drive Individual Tinha 3 Bugs Reais]]
