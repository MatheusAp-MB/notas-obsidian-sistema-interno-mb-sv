---
tipo: regra
dominio: 
status: ativa
criado: 10/07/2026
relacionado: [Regras Gerais, Visao Geral do Projeto]
---

# Quando e Como Registrar no Obsidian

## Quando registrar

Nem tudo que é discutido numa conversa vira nota. O critério é: **teria
custo real se fosse perdido ou esquecido?** Se sim, registrar segundo o
tipo correspondente:

- **`regra`** — surgiu uma obrigação nova e permanente (ex: "nunca fazer X
  neste projeto"). Se for repetida em mais de uma conversa como premissa,
  já deveria ter virado regra antes.
- **`decisao`** — foi escolhido um caminho entre alternativas, com motivo.
  Registrar mesmo que pareça óbvio no momento — o "óbvio de hoje" é a
  dúvida de daqui a 6 meses.
- **`descoberta`** — um fato sobre o sistema/API foi confirmado testando
  contra dado real (não suposição, não documentação — validado na prática).
- **`duvida`** — ficou uma pergunta em aberto sem resposta definida ainda,
  mas que precisa ser retomada depois.
- **`bug_conhecido`** — um problema foi identificado e não será corrigido
  na hora.
- **`conceito`** — um termo, sigla ou definição específica do domínio foi
  usado e precisa de explicação pra não ser reinterpretado errado depois.

**Não registrar:** brainstorm descartado sem decisão tomada, dúvida já
resolvida na mesma conversa sem impacto futuro, ou repetição de algo que já
existe como nota (verificar antes de duplicar).

## Como registrar

1. **Fazer isso dentro da própria conversa de trabalho**, logo após a
   decisão/descoberta acontecer — nunca recriar de memória em uma conversa
   nova (perde precisão). Exceção: se foi esquecido e a conversa original
   já fechou, usar busca em conversas passadas para resgatar o conteúdo
   real antes de registrar, nunca gerar só da memória resumida.
2. Antes de gerar, **listar os candidatos e perguntar** qual deve virar
   nota — nunca gerar automaticamente sem confirmação.
3. Seguir o formato definido em [[Regras Gerais]]: frontmatter sempre
   completo (tipo, dominio, status, criado no formato `DD/MM/YYYY`,
   relacionado), nunca citar o nome real (usar "DEV"), entregar em bloco de
   código markdown na conversa — nunca como artefato/arquivo.
4. Se a memória do Claude já registrou algo que deveria estar aqui, este
   vault prevalece — o conteúdo deve ser migrado para nota, e a memória
   passa a ser só o ponteiro de que o vault existe.

## Relacionado

- [[Regras Gerais]]
- [[Visao Geral do Projeto]]