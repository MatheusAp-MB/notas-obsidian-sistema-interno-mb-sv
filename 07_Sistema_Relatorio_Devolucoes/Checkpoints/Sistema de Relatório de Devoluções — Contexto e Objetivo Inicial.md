---
tipo: checkpoint
dominio:
status: em_andamento
criado: 01/09/2026
atualizado_em: 08/09/2026 03:07
relacionado: [Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador), Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2), Processo de Devolução de Produtos e os 3 Caminhos Possíveis, Checkpoint - Catálogo de Peças e Tela de Produtos, Checkpoint - Tela de Nova Devolução e Geração do PDF, Checkpoint - Empacotamento e Entrega do .exe, core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo, Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown, Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal, Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra, Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução, Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça, Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador, Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição, Form Aninhado Quebrava Layout e Botão Salvar na Tela de Conferência]
---

# Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial

**Resumo do estado atual**: mundo criado em 01/09/2026 pra resolver a dor dos caminhos 2 e 3 da devolução (ver [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]). Rascunho completo apresentado e 100% aprovado em 03/09/2026. Virada pra sistema real fechada em 04-05/09/2026 (MySQL + multiempresa) e reforma estrutural fechada em 06/09/2026 — ver seções anteriores da linha do tempo. Em 07-08/09/2026, fechado o objetivo original do mundo por completo: fluxo de UX e campos da tela Nova Devolução idealizados, persistência real implementada (models `Devolucao`, `ConferenciaPeca`, `FotoConferenciaPeca`), tela de conferência de peça mobile implementada, e o relatório impresso implementado e refinado em 2 rodadas — trocando `xhtml2pdf` por uma view de impressão do navegador. 2 bugs reais corrigidos no processo (fuso horário, form aninhado). O que resta é operação (setup em produção) e os pontos de melhoria do superior, ainda não detalhados.

> [!success] Objetivo original do mundo fechado — persistência, conferência mobile e relatório impresso implementados (08/09/2026)
> MySQL, multiempresa, reforma estrutural, CRUD de Marca/Grupo Fornecedor, listagem de Produtos e agora a tela Nova Devolução completa (com persistência real e relatório impresso funcionando) estão todos validados de ponta a ponta. O que resta não é mais mecanismo: setup do MySQL na máquina de produção (barracão), atalho do Windows (ver [[Checkpoint - Empacotamento e Entrega do .exe]]), reavaliar o pin do Django `6.0.6`, auditoria mobile-first da tela Nova Devolução, e os pontos de melhoria do superior (ainda não detalhados).

## Linha do tempo

**01/09/2026** — Mundo criado. Objetivo: resolver a dor dos caminhos 2 e 3 da devolução (ver [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]). Decisão: projeto 100% separado do Sistema Interno V2 (repositório próprio), mas seguindo o mesmo padrão de qualidade de engenharia (22:48, ver [[Definição do Núcleo de Engenharia Repositório]]).

**03/09/2026** — Rascunho (catálogo, Produtos, Nova Devolução, PDF) apresentado e **100% aprovado** — colega de equipe (usuária final) achou útil e prático; superior validou a ideia e passou pontos de melhoria (ainda não detalhados). A partir daqui o projeto deixa de ser prova de conceito.

**04/09/2026** — Retomado após feriado, com foco em qualidade. Fechadas 2 decisões de arquitetura: MySQL (2 bancos) + modelo de entrega em pasta com atalho — detalhe em [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]. Revisão geral do mundo encontrou 3 pendências reabertas pela virada de rascunho pra sistema real: persistência de devolução (agora vai existir, schema não decidido — ver [[Checkpoint - Tela de Nova Devolução e Geração do PDF]]), auditoria mobile-first de Produtos e Nova Devolução (Catálogo já tinha passado por isso), e o texto de "rascunho" na nota do PDF. Integração Django+MySQL testada em desenvolvimento; conflito de versão resolvido fixando Django em `6.0.6` (MySQL local 8.0.46 exige isso, mesma versão do Sistema Interno V2).

**05/09/2026** — `mysqlclient` validado dentro do `.exe` empacotado (detalhe técnico de PyInstaller em [[Checkpoint - Empacotamento e Entrega do .exe]]). Corrigido o caminho de banco/mídia pra pasta fixa via `.env` (ver [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]]). Testada a troca de empresa (alias `samvale`) de ponta a ponta via `python launcher.py`: implementado `core/context_processors.py` + view/URL `trocar_empresa` + seletor na navegação — SAMVALE e MAGAZINE mostrando cada um só o próprio catálogo, isolamento confirmado nas 2 direções. Fecha a arquitetura multi-empresa por completo. Às 16:44, decidido pausar toda outra frente pra focar 100% numa reforma estrutural — ver [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]].

**06/09/2026** — Reforma estrutural fechada: `loading.html` organizado fora da árvore Django; template base implementado com sidebar + toolbar (ajuste em relação ao plano original, que previa navbar — o Sistema Interno V2 usa sidebar, não navbar); tela home criada com quadradinhos de módulo (Nova Devolução, Produtos); as 3 telas reais migradas pra herdar do template base, eliminando duplicação de `<head>`/nav e de CSS por página; URLs reorganizadas (`/` agora é a home, Nova Devolução move pra `/nova-devolucao/`). No meio do caminho apareceu uma descoberta não prevista: o app `core` dividia nome com a pasta de settings do projeto (criado como `django-admin startproject core`), travando a separação de `urls.py` — corrigido renomeando a pasta de settings pra `projeto_sistema_devolucao_mb_sv` (ver [[core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]]). Tudo validado tela por tela, incluindo a troca de empresa entre MAGAZINE e SAMVALE.

Na sequência, bloco de trabalho sobre Marca/Produto: regra de negócio formalizada (Marca com nome único e grupo opcional; Produto com marca obrigatória protegida contra exclusão em cascata, EAN único, nome não-único, SKU/Código do Fabricante únicos só quando preenchidos) — detalhe completo em [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]. Campo de marca do formulário deixou de ser texto livre (bug real de perda silenciosa corrigido, ver [[Perda Silenciosa da Marca ao Digitar Texto Livre Nao Cadastrado]]) e virou dropdown obrigatório com busca, no padrão visual do Sistema Interno V2. CRUD completo de Marca e Grupo Fornecedor (cadastro/edição/exclusão/consulta) validado 100% pelo usuário. Em seguida, a tela Produtos foi reorganizada em seções por Marca/Grupo com busca ao vivo e carrossel horizontal — validada de ponta a ponta pelo usuário, depois de corrigido um bug real na busca que comparava a frase inteira em vez de tokenizar por palavra (ver [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]] e [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]).

**07/09/2026** — Sessão de idealização da tela Nova Devolução de verdade, sem código (fase "Idealizar", por pedido explícito do usuário): fluxo de UX completo em 2 fases (PC + celular) e todos os campos das Fases 0 e 3 levantados e confirmados, incluindo Destino do produto (Troca/Usado) e a decisão de manter "Salvar" e "Gerar relatório" como 2 ações separadas, por confiabilidade — ver [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]. Layout visual do relatório impresso (1 folha A4 sempre) fechado depois de 4 rodadas de mockup — ver [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]].

**08/09/2026** — Implementação completa do que foi idealizado no dia anterior: persistência real (models `Devolucao`, `ConferenciaPeca`, `FotoConferenciaPeca`), tela de conferência de peça mobile (`conferir_devolucao.html`, Fase 3 — toggle Veio/Não veio, stepper de quantidade, anotação por peça, fotos por peça, Destino do produto, Observação geral) e o relatório impresso. Na implementação do relatório, decidido abandonar `xhtml2pdf` (não suporta o CSS moderno que o layout aprovado usa) em favor de uma view Django comum, renderizando HTML com CSS de impressão — o PDF final sai do próprio navegador (Ctrl+P) — ver [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]. Depois de rodar com dados reais, o relatório passou por 2 rodadas adicionais: 5 campos que faltavam (Data da venda, Motivo da reclamação, bloco Mediação completo) e 4 melhorias de impressão (paginação sem cortar linha de peça, tags CLIENTE/INTERNO, datas com 4 dígitos, centralização do bloco Plataforma) — detalhe em [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]]. 2 bugs reais corrigidos: fuso horário errado (`TIME_ZONE` em UTC sem conversão — afetava o relatório e também a tela de devoluções pendentes) — ver [[Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição]] — e um `<form>` aninhado quebrando o layout e o botão Salvar da tela "Editar Conferência" — ver [[Form Aninhado Quebrava Layout e Botão Salvar na Tela de Conferência]].

## Em aberto

- [ ] Setup manual do MySQL Server + criação do banco (schema) na máquina de produção (barracão) — feito só em desenvolvimento até agora
- [ ] Reavaliar o pin do Django `6.0.6` quando o MySQL da máquina de produção for definido
- [ ] Pontos de melhoria passados pelo superior em 04/09/2026 — ainda não detalhados
- [ ] Auditoria mobile-first da tela Nova Devolução — ainda não confirmada
- [x] Reforma estrutural — ver [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]] (concluída em 06/09/2026)
- [x] CRUD de Marca/Grupo Fornecedor — ver [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]] (concluído em 06/09/2026)
- [x] Listagem de Produtos agrupada, com busca e carrossel — ver [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]] (validada em 06/09/2026)
- [x] Tela Nova Devolução completa — fluxo de UX, persistência, conferência de peça mobile e relatório impresso — ver [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]] (concluída em 08/09/2026)

## Relacionado

- [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]
- [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
- [[Checkpoint - Catálogo de Peças e Tela de Produtos]]
- [[Checkpoint - Tela de Nova Devolução e Geração do PDF]]
- [[Checkpoint - Empacotamento e Entrega do .exe]]
- [[core com Duplo Papel — Pasta de Settings do Django e App Compartilhado ao Mesmo Tempo]]
- [[Marca e Grupo Fornecedor — Regras de Negócio e Seletor Obrigatório em Dropdown]]
- [[Listagem de Produtos Agrupada por Marca e Grupo com Busca ao Vivo e Carrossel Horizontal]]
- [[Busca de Produtos Comparava Frase Inteira em Vez de Tokenizar por Palavra]]
- [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]
- [[Layout do Relatório de Devolução — Folha A4 Única, Faixa Horizontal e Fotos de Peça]]
- [[Geração do Relatório de Devolução — Migração de xhtml2pdf para View de Impressão do Navegador]]
- [[Fuso Horário Errado no Relatório e nas Telas — TIME_ZONE em UTC Sem Conversão de Exibição]]
- [[Form Aninhado Quebrava Layout e Botão Salvar na Tela de Conferência]]
