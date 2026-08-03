---
tipo: regra
dominio: 
status: ativa
criado: 01/08/2026
relacionado: [Estrutura e Convenções do Vault]
---

# Índice — Sistema Interno

Índice obrigatório deste mundo — 1 linha de resumo por nota, agrupado por contexto/área. Atualizado junto da autorização de escrita de cada nota (ver [[Estrutura e Convenções do Vault]]).

## Regras_de_Comportamento

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Estrutura de Arquivo e Classe Python]] | regra | ativa | 01/08/2026 | Ordem fixa de arquivo (imports→enum→classe) e de membros de classe (campos→Meta→dunders→fábrica→property→métodos), baseada na convenção Django real (Two Scoops). |
| [[Nomenclatura e Comentarios]] | regra | ativa | 01/08/2026 | Nome claro > breve; teste "Função Objetivo: ___"; comentário só explica o porquê, nunca o quê. |
| [[Modelagem de Objeto e Encapsulamento]] | regra | ativa | 01/08/2026 | Composição > herança; dado diferente = instância, comportamento diferente = subclasse; dataclass/Enum/type hints/Protocol; @property em vez de getter/setter. |
| [[Integridade e Fonte Unica de Dado]] | regra | ativa | 01/08/2026 | Dono único por dado; nunca 2 formas de escrever o mesmo campo; pipeline limpa dado bruto na fronteira; banco é a única fonte confiável, cache nunca decide sozinho. |
| [[Fluxo Decomposicao de Problemas em Micro Etapas]] | regra | ativa | 01/08/2026 | Preferir várias funções pequenas aninhadas a uma função grande; pensar nos micro-problemas antes de gerar código. |
| [[Padroes de Projeto GoF Quando Usar]] | regra | ativa | 01/08/2026 | Do catálogo de 23 padrões GoF, quais já usam (Memento, Facade), quais adotar sob demanda (Adapter, Abstract Factory), quais evitar (Singleton, signals, Flyweight, Visitor...). |
| [[Disciplina de Refatoracao e Testes]] | regra | ativa | 01/08/2026 | Regra dos Três; nunca misturar refactor com feature; reescrita grande exige validação de comportamento; testes automatizados viram prioridade real. |
| [[Disciplina de Testes Automatizados]] | regra | ativa | 02/08/2026 | Pytest+pytest-django+pytest-cov; SUT/DOC (DOC real, nunca mock); progressão por Nível (0/2/3/4); tabela com Motivo + dado_bruto; log em arquivo; esperado sempre exato; ordenação por timestamp sempre com desempate; acesso ao repo real via git. |
| [[Modelo Padrao de Arquivo de Teste]] | regra | ativa | 02/08/2026 | Arquivo de referência com SUT, fixture e 3 tipos de resultado (passa, falha real, falha documentada via xfail) — implementa a Disciplina de Testes na prática. |
| [[Aviso Proativo Para Notas no Obsidian]] | regra | ativa | 02/08/2026 | Claude avisa sozinho quando algo for relevante pra salvar no vault, sem esperar pedido — memória de conversa é RAM, Obsidian é o HD. |

## Agenda_Videos

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Modelo Novo de Fases Substitui Ciclo Antigo]] | decisao | ativa | 01/08/2026 | Diária/Semanal/Mensal descartadas; novo modelo Simples(1x)→Vídeo Mensal(4x,30d)→Vídeo Trimestral(∞,90d), sem migração do modelo antigo. |
| [[Sequencia Travada de 5 Passos por Ocorrencia]] | regra | ativa | 01/08/2026 | Base→Roteiro→Completo→Postar→Replicar, sem pular etapa; só Postar tem trava de data; Replicar continua clique manual. |
| [[Cadencia de 30 e 90 Dias Corridos Contados do Replicado]] | regra | ativa | 01/08/2026 | Dias corridos, não úteis; ajuste pro último dia útil; relógio conta do Replicado, não do Postar; piso é a própria meta. |
| [[Video Trimestral Nunca Conclui]] | decisao | ativa | 01/08/2026 | Fim do conceito "Otimizado" — Vídeo Trimestral roda pra sempre, produto nunca conclui o ciclo. |
| [[Risco Redefinido Apos Reestruturacao]] | decisao | ativa | 01/08/2026 | Antes = janela de prazo acabando; agora = produção não terminou + prazo a ≤1 dia útil de distância. |
| [[Ajuste de Dia Util Cria Padrao Estavel de 28 Dias]] | descoberta | ativa | 01/08/2026 | Sexta + 30 dias corridos cai em domingo, ajusta pra sexta anterior — cria padrão real de ~28 dias, matemática correta, não bug. |
| [[Checkpoint Testes Automatizados Agenda Videos]] | checkpoint | concluido | 02/08/2026 | Nível 0-4 completos — 82 testes passando, ciclo_video.py e a_fazer_hoje.py 100% cover/0 Miss/0 BrPart. 3 bugs reais de produção achados e corrigidos no processo. |

## Relacionado

- [[Estrutura e Convenções do Vault]]
