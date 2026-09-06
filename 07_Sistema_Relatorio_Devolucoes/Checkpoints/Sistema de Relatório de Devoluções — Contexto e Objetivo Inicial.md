---
tipo: checkpoint
dominio:
status: em_andamento
criado: 01/09/2026
atualizado_em: 05/09/2026 17:46
relacionado: [Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador), Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2), Processo de Devolução de Produtos e os 3 Caminhos Possíveis, Checkpoint - Catálogo de Peças e Tela de Produtos, Checkpoint - Tela de Nova Devolução e Geração do PDF, Checkpoint - Empacotamento e Entrega do .exe]
---

# Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial

**Resumo do estado atual**: mundo criado em 01/09/2026 pra resolver a dor dos caminhos 2 e 3 da devolução (ver [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]). Rascunho completo apresentado e 100% aprovado em 03/09/2026. Virada pra sistema real fechada em 04-05/09/2026: banco muda pra MySQL (2 bancos, 1 por empresa) e arquitetura multi-empresa replicada do Sistema Interno V2 — detalhe completo em [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]. Testado de ponta a ponta em 05/09/2026, incluindo a troca de empresa. O que resta dessa frente é só operação (setup em produção), não mais mecanismo. A partir de 05/09/2026 (16:44), o foco muda pra uma reforma estrutural do projeto — ver [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]].

> [!success] MySQL + multiempresa validados de ponta a ponta — migração pra sistema real fechada
> O que resta não é mais mecanismo, é operação: setup do MySQL na máquina de produção (barracão), atalho do Windows (ver [[Checkpoint - Empacotamento e Entrega do .exe]]) e reavaliar o pin do Django `6.0.6` quando o MySQL de lá for definido.

## Linha do tempo

**01/09/2026** — Mundo criado. Objetivo: resolver a dor dos caminhos 2 e 3 da devolução (ver [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]). Decisão: projeto 100% separado do Sistema Interno V2 (repositório próprio), mas seguindo o mesmo padrão de qualidade de engenharia (22:48, ver [[Definição do Núcleo de Engenharia Repositório]]).

**03/09/2026** — Rascunho (catálogo, Produtos, Nova Devolução, PDF) apresentado e **100% aprovado** — colega de equipe (usuária final) achou útil e prático; superior validou a ideia e passou pontos de melhoria (ainda não detalhados). A partir daqui o projeto deixa de ser prova de conceito.

**04/09/2026** — Retomado após feriado, com foco em qualidade. Fechadas 2 decisões de arquitetura: MySQL (2 bancos) + modelo de entrega em pasta com atalho — detalhe em [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]. Revisão geral do mundo encontrou 3 pendências reabertas pela virada de rascunho pra sistema real: persistência de devolução (agora vai existir, schema não decidido — ver [[Checkpoint - Tela de Nova Devolução e Geração do PDF]]), auditoria mobile-first de Produtos e Nova Devolução (Catálogo já tinha passado por isso), e o texto de "rascunho" na nota do PDF. Integração Django+MySQL testada em desenvolvimento; conflito de versão resolvido fixando Django em `6.0.6` (MySQL local 8.0.46 exige isso, mesma versão do Sistema Interno V2).

**05/09/2026** — `mysqlclient` validado dentro do `.exe` empacotado (detalhe técnico de PyInstaller em [[Checkpoint - Empacotamento e Entrega do .exe]]). Corrigido o caminho de banco/mídia pra pasta fixa via `.env` (ver [[Caminho de Dados (Banco e Mídia) Precisa Ser Fixo, Não Depender de sys.frozen]]). Testada a troca de empresa (alias `samvale`) de ponta a ponta via `python launcher.py`: implementado `core/context_processors.py` + view/URL `trocar_empresa` + seletor na navegação — SAMVALE e MAGAZINE mostrando cada um só o próprio catálogo, isolamento confirmado nas 2 direções. Fecha a arquitetura multi-empresa por completo. Às 16:44, decidido pausar toda outra frente pra focar 100% numa reforma estrutural — ver [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]].

## Em aberto

- [ ] Setup manual do MySQL Server + criação do banco (schema) na máquina de produção (barracão) — feito só em desenvolvimento até agora
- [ ] Reavaliar o pin do Django `6.0.6` quando o MySQL da máquina de produção for definido
- [ ] Pontos de melhoria passados pelo superior em 04/09/2026 — ainda não detalhados. **Pausado em 05/09/2026**, foco 100% na reforma estrutural
- [ ] Reforma estrutural — ver [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]] pro checklist próprio

## Relacionado

- [[Sistema Vira Real — MySQL como Banco e Entrega em Pasta com Atalho (Sem Instalador)]]
- [[Reforma Estrutural — Organização de Arquivos, Template Base com Extends e Tela Home (Espelhando o Sistema Interno V2)]]
- [[Processo de Devolução de Produtos e os 3 Caminhos Possíveis]]
- [[Checkpoint - Catálogo de Peças e Tela de Produtos]]
- [[Checkpoint - Tela de Nova Devolução e Geração do PDF]]
- [[Checkpoint - Empacotamento e Entrega do .exe]]
