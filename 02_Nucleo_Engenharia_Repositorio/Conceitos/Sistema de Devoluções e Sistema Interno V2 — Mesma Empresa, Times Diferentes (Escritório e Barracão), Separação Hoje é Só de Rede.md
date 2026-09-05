---
tipo: conceito
dominio: 
status: ativa
criado: 04/09/2026
atualizado_em: 04/09/2026 21:04
relacionado: [Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial, Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador), Definição do Núcleo de Engenharia Repositório]
---

# Sistema de Devoluções e Sistema Interno V2 — Mesma Empresa, Times Diferentes (Escritório e Barracão), Separação Hoje é Só de Rede

**Resumo**: o Sistema de Relatório de Devoluções e o Sistema Interno V2 pertencem à mesma empresa/dono e às mesmas 2 empresas (Magazine e Samvale) — mas não são o mesmo time: um foi pensado pro escritório, o outro é o primeiro pensado de verdade pro barracão. A separação entre os 2 sistemas hoje existe por um motivo puramente técnico (rede), não organizacional, e é temporária por natureza.

## O que diz

Boa parte do que já foi aprendido, decidido ou construído no Sistema Interno V2 — o padrão de 2 empresas/2 bancos (Magazine/Samvale), convenções de código, o próprio banco de dados (MySQL) — é informação válida pro Sistema de Devoluções, já que as duas empresas pertencem ao mesmo dono (o superior de Matheus), e por isso os funcionários trabalham com produtos das duas. Isso vale pra infraestrutura e regras de negócio — não pra experiência de uso, que é diferente (ver nuance abaixo).

O único motivo do Sistema de Devoluções ser um projeto separado (repositório próprio, banco próprio, sem ligação direta com o Django do Sistema Interno V2): hoje o Sistema Interno V2 não roda em nuvem, só localmente no PC do escritório de Matheus. O PC do escritório e o PC do barracão (onde a usuária final processa devoluções) estão em redes/internets diferentes, sem LAN em comum — então ela não consegue acessar o Sistema Interno V2 de lá. Por isso foi preciso isolar só a parte útil pra ela num sistema paralelo, autossuficiente, que roda sozinho na máquina do barracão sem depender de rede nenhuma.

Existe um plano futuro de pagar hospedagem em nuvem (AWS, Google Cloud ou similar) pro Sistema Interno V2, transformando-o num site acessível de qualquer lugar. Quando isso acontecer, essa barreira de rede desaparece, e os 2 sistemas serão unificados de volta num só.

## A nuance real: escritório vs. barracão

Ser da mesma empresa não significa que as necessidades são idênticas. A empresa se divide em 2 grupos com setores próprios: no escritório, Gestão Full, Gestão de Anúncios/Marketplaces, Financeiro/Fiscal e Gestão Geral (o superior de Matheus); no barracão, Operacional Full, Separação/Expedição, Recebimento e Devolução (não é rígido — cada um ajuda onde precisa). O Sistema Interno V2 foi construído 100% pensado na visão e necessidade de quem trabalha no escritório. O Sistema de Devoluções é o primeiro sistema pensado de verdade pra alguém do barracão — que trabalha com o produto físico na mão, precisa de praticidade operacional, e não tem o dev por perto o tempo todo.

A usuária final é a única funcionária do setor de Devolução, responsável por ele, cuidando das devoluções das 2 empresas sozinha — o que já embasa a decisão de 1 seletor de empresa dentro do mesmo sistema, em vez de 2 sistemas ou 2 telas separadas. Ela usa PC e celular, e a tela precisa ser pensada pros 2 contextos — não é "mobile first": em cada momento, uma dor diferente é melhor resolvida num ou no outro. Matheus vai indicar, conforme cada tela/fluxo for construído, qual contexto (PC ou celular) se aplica — não deve ser assumido de antemão.

## Por que isso importa pra como o Sistema de Devoluções é construído

Como a separação hoje é só técnica (rede) — a empresa e o dono são os mesmos, não é uma divisão organizacional real —, faz sentido que a infraestrutura do Sistema de Devoluções (banco MySQL, padrão de empresa dupla — `EmpresaMiddleware`/`EmpresaRouter`/banco por empresa —, convenções de código e engenharia) já nasça igual à do Sistema Interno V2, em vez de divergir e precisar ser "traduzida" depois. Isso é diferente da experiência de uso: como o perfil de quem usa é outro (barracão, não escritório — ver nuance acima), a interface e os fluxos são pensados sob medida pra essa usuária, não copiados do Sistema Interno V2. Isso deixa o caminho pronto pra uma unificação futura tranquila, no dia em que a hospedagem em nuvem existir.

## Relacionado

- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
- [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]
- [[Definição do Núcleo de Engenharia Repositório]]
