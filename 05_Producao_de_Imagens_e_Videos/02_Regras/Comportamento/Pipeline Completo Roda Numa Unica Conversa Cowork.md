---
tipo: regra
dominio: 
status: ativa
criado: 23/08/2026
atualizado_em: 23/08/2026 06:30
relacionado: [Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto, 00_Leia_Primeiro, Evolucao do Controle de Contexto e Execucao - Do Prompt de Migracao ao Vault Como Segundo Cerebro]
---

# Pipeline Completo Roda Numa Única Conversa Cowork

Tudo, desde a Étapa 1 (leitura de dados brutos) até a geração final dos prompts de foto e vídeo de um produto, roda dentro de uma única conversa do modo Cowork — nunca fragmentado em conversas separadas, mesmo quando uma etapa parece "só processar texto".

## O teste que decide

A pergunta certa nunca é "essa etapa roda nesta conversa ou em outra?" — é **"essa etapa precisa de leitura/escrita de arquivo do vault ou não?"**

- Etapa que só processa texto, sem tocar o vault, pode em tese rodar em qualquer lugar.
- Etapa que precisa do grafo/vault (Étapa 5, 6, e a futura 7) **precisa rodar dentro de uma sessão Cowork** — porque só o Cowork tem controle de leitura/escrita de arquivo sobre o vault, e é esse controle que sustenta contexto complexo sem perda.

Isso não exige que seja "esta mesma conversa de sempre" — uma sessão Cowork nova, zerada, de outra pessoa, em outro PC, serve igual, DESDE QUE o vault seja 100% autocontido e guie aquela conversa do início ao fim sem depender de memória de chat compartilhada.

## Incidente real que originou esta regra (23/08/2026)

Durante boa parte deste projeto, as Étapas 1-4 (leitura, análise técnica, análise contextual, fusão) rodavam numa conversa separada, fora do Cowork, e só o resultado colado chegava até a Étapa 5. Isso nunca foi a arquitetura pretendida — foi um desvio nascido de se perder no meio dos testes. O motivo de o vault existir desde o início era justamente permitir tratar um assunto complexo (produção de imagem/vídeo) com o mesmo controle e contexto que já funcionava noutros mundos (impostos de entrada, agenda de vídeos) — ver [[Evolucao do Controle de Contexto e Execucao - Do Prompt de Migracao ao Vault Como Segundo Cerebro]]. Corrigido trazendo as Étapas 1-4 pra dentro do vault como prompt autocontido (ver [[Etapa 1-4 - Estudo do Produto]]), no mesmo molde já usado pela Étapa 5.

## Por que

Sem essa regra, o time perde exatamente o que o vault foi criado pra resolver: contexto se perde entre conversas, dado se corrompe na cópia manual, e ninguém consegue retomar o trabalho de outro PC sem reconstituir tudo de memória.

## Relacionado
- [[Grafo de Categorizacao em Duas Camadas e Base de Conhecimento do Produto]]
- [[00_Leia_Primeiro]]
- [[Evolucao do Controle de Contexto e Execucao - Do Prompt de Migracao ao Vault Como Segundo Cerebro]]
