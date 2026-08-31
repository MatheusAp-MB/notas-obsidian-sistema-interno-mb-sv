---
tipo: regra
dominio: 
status: ativa
criado: 30/08/2026
atualizado_em: 30/08/2026 17:47
relacionado: [Definição do Núcleo de Engenharia Repositório, Regra do Índice Obrigatório]
---

# Índice — Núcleo de Engenharia Repositório

Índice obrigatório deste mundo — 1 linha de resumo por nota. Atualizado junto da autorização de escrita de cada nota (ver [[Regra do Índice Obrigatório]]).

| Nota | Tipo | Status | Data | Resumo |
|---|---|---|---|---|
| [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]] | regra | ativa | 03/08/2026 | Sincronizar só quando pedido, editar/escrever só com permissão explícita, código sempre como texto na conversa (nunca arquivo criado por Claude) — reforçada por 6 incidentes reais, o ponto mais reincidente do núcleo. |
| [[Padrao de Qualidade e Clareza Estrutural do Repositorio]] | regra | ativa | 15/08/2026 | Régua de revisão contra clareza estrutural (nome autoexplicativo, preservar paradigmas em uso, responsabilidade única, consistência entre arquivos-irmãos) — aplicada de forma incremental, nunca em reescrita de massa. |
| [[Estrutura de Arquivo e Classe Python]] | regra | ativa | 01/08/2026 | Ordem fixa de arquivo (cabeçalho, Função Objetivo, imports em 3 blocos, enum, dataclasses, classes) e de membro de classe (choices, campos, Meta, dunders, fábrica, property, métodos). |
| [[Modelagem de Objeto e Encapsulamento]] | regra | ativa | 01/08/2026 | Composição sobre herança, subclasse só pra comportamento diferente (nunca dado), 2 tipos de objeto (persistência vs. processo), Protocol/ABC só com motivo real, `@property` como getter pythônico. |
| [[Integridade e Fonte Unica de Dado]] | regra | ativa | 01/08/2026 | Cada dado tem 1 dono único que decide seu valor; dado bruto nunca vaza adiante já processado; banco de dados é a única fonte confiável, cache nunca embasa decisão sozinho. |
| [[Padroes de Projeto GoF Quando Usar]] | regra | ativa | 01/08/2026 | Do catálogo de 23 padrões GoF, fixa qual já é usado (Memento, Facade), qual adotar só quando o motivo aparecer, e qual evitar por não caber no porte do projeto. |
| [[Padrao de Robustez para Clientes de API Externa]] | regra | ativa | 06/08/2026 | Todo cliente de API externa segue 3 camadas (transporte/contexto/facade), hierarquia de exceção própria, proteção dupla contra chamada excessiva, e nunca assume que 1 chamada trouxe tudo (paginação). |
| [[Disciplina de Testes Automatizados]] | regra | ativa | 02/08/2026 | Teste nasce junto do planejamento, nunca depois; SUT/DOC sempre real (nunca mock, exceto integração externa); 5 níveis de progressão; Claude nunca executa código, só gera pro usuário rodar. |
| [[Modelo Padrao de Arquivo de Teste]] | regra | ativa | 02/08/2026 | Implementação de referência das regras de Disciplina de Testes Automatizados — arquivo copiável com as 4 fases comentadas, `match/case` só com cenário real, e 1 caso `xfail` permanente. |
| [[Definição do Núcleo de Engenharia Repositório]] | regra | ativa | 30/08/2026 | Define o que entra neste núcleo (convenção de engenharia que serve mais de 1 mundo de código ao mesmo tempo) e documenta a criação do núcleo em 29/08, junto dos pontos ainda em aberto da auditoria de coerência. |

## Relacionado

- [[Regra do Índice Obrigatório]]
- [[Definição do Núcleo de Engenharia Repositório]]
