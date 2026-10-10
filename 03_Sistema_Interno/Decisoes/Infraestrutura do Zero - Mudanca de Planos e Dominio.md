---
tipo: decisão
status: em andamento
criado: 09/10/2026
dominio: infraestrutura
relacionado:
  - "[[Hospedagem em Nuvem - GCP vs AWS]]"
  - "[[00_Indice_Sistema_Interno]]"
---

# Infraestrutura do Zero — Mudança de Planos e Domínio

Registrado em 09/10/2026 às 11:10. Mudança de rumo na infraestrutura do Sistema Interno V2: o superior de Matheus liberou construir tudo do zero, e o domínio oficial já foi comprado. Até esta data nenhum servidor foi criado e nenhuma conta de faturamento do Google Cloud foi aberta.

## 1. Mudança de planos

- Em 09/10/2026 o superior de Matheus liberou fazer TUDO do zero absoluto, mesmo que seja pago (a depender do valor).
- Não é preciso usar Locaweb nem Uni5. Dá para planejar tudo ponta a ponta (hospedagem, domínio, DNS, banco), onde e como for melhor.
- Isso supera a decisão de 08/10/2026 de usar um subdomínio de `magazinebrasileiro.com.br` "sem novos custos".
- Método combinado: ciclos curtos, um passo de cada vez, com ok explícito de Matheus antes de executar. Os custos são mostrados antes de qualquer compra.

## 2. Escopo — o que NÃO se mexe

- O e-mail da empresa (`@magazinebrasileiro.com.br`, hospedado na Uni5) não é responsabilidade nossa. Matheus foi explícito em 09/10/2026: NÃO VAMOS MEXER NELES.
- O site de `magazinebrasileiro.com.br` e as fotos do ERP (`magazinebrasileiro.tecnologia.ws`, Hospedagem GO na Locaweb) continuam como estão.
- "Do zero" vale só para a base nova do Sistema Interno. Migrar e-mail seria outro projeto, e só se Matheus pedir.

## 3. Domínio oficial: sellercontrole.com.br

- Comprado por Matheus no Registro.br (confirmado por ele em 09/10/2026).
- O DNS fica no próprio Registro.br. Servidores de nome: `a.auto.dns.br` e `b.auto.dns.br` (consulta pública em 09/10/2026).
- Ainda não existe nenhum endereço criado: sem registro A, sem `www`, sem `sistema.`.
- O Registro.br deixou a proteção padrão de domínio sem e-mail: MX nulo (`0 .`) e SPF `v=spf1 -all`. Não mexer, a menos que um dia se queira e-mail nesse domínio.
- Pendência: conferir no Registro.br se o titular é a empresa (CNPJ) e não uma pessoa. O titular não é trocado com facilidade, e o sistema é patrimônio da empresa.
- Os endereços (por exemplo `sistema.sellercontrole.com.br`) só serão criados quando existir um servidor com IP fixo. A entrada será do tipo A, apontando para o IP da máquina.
- Preço de referência de um `.com.br` no Registro.br: na faixa de R$ 40 por ano (confirmar na tela deles).

## 4. Por que o plano anterior (Locaweb/Uni5) caiu

Um domínio tem 3 serviços separados: registro (de quem é o nome), DNS (para onde cada nome aponta) e hospedagem (onde o site mora).

- `magazinebrasileiro.com.br`: o DNS fica na Uni5. O WHOIS mostra `dns1` a `dns4.uni5.net`, e o próprio DNS responde como `dns1` a `dns4.agencialightinternet.com.br` com contato `abuse.uni5.net`. O e-mail também é da Uni5 (MX `mx-vip-01/02.uni5.net`, SPF `_spf.uni5.net`). O site aponta para IPs da AWS.
- O que a empresa paga na Locaweb é hospedagem (e SSL). A zona de DNS criada lá estava "sem autoridade": as entradas adicionadas nela não funcionam, porque a internet consulta a Uni5.
- Nunca trocar os servidores de nome para `ns1/ns2/ns3.locaweb.com.br`. Isso derrubaria o e-mail e o site.
- Mudar o DNS inteiro para a Locaweb só seria possível copiando TODAS as linhas existentes. Está fora do escopo.

## 5. Situação do GCP (09/10/2026)

- O teste grátis (US$ 300 por 90 dias) parou na verificação do cartão: "não foi possível verificar seu cartão" (código `OR_MIVEM_04`). A empresa está resolvendo com o banco.
- Hipótese mais provável: o banco bloqueia a cobrança de verificação em dólar (compra internacional pela internet). O Google não documenta esse código. A orientação oficial é conferir com o banco, usar outro cartão de crédito ou procurar o suporte de faturamento.
- Não ficar clicando em "tentar de novo" em sequência, para não acionar o antifraude. Tentar uma vez depois que o banco liberar.
- Crédito do Google AI Ultra (Developer Program): a tela de Benefícios mostra **US$ 40 por mês** (o blog do Google citava US$ 100; vale o que a conta mostra). Ele só pode ser aplicado depois que existir uma conta de faturamento do Google Cloud e expira 1 ano após ser concedido. Não marcar "Sempre usar esta conta" até o superior aprovar a conta.
- A conta Google usada é a do financeiro da empresa, a mesma do GCP.

## 6. Mapa em blocos

| Bloco | Tema | Situação |
|---|---|---|
| 1 | Onde hospedar (comparar com custos reais) | próximo passo |
| 2 | Nome na internet (domínio e DNS) | concluído: `sellercontrole.com.br` |
| 3 | Servidor (qual máquina e em qual cidade) | pendente |
| 4 | Banco MySQL e backup | pendente |
| 5 | Segurança e cadeado (HTTPS) | pendente |
| 6 | Webhook do Mercado Livre e depois microsserviços | pendente |
| — | Conta de faturamento do GCP | em andamento (banco) |

## 7. Brainstorm do nome do produto

- Contexto: o superior passou a ver o sistema como produto. Matheus quer um nome que passe a ideia de "tudo em um lugar só", de núcleo, algo que mude a vida do usuário. Ele pensou em "Nexus" ou "Core".
- Critérios: curto, fácil de falar e escrever, neutro. Sem `MB`, `SV`, `ML` ou `Mercado` (marca registrada do Mercado Livre, e o sistema não é só ML).
- "Nexus" quer dizer ligação e não centro, e é muito usado. "Core" é genérico demais. Os domínios dessas palavras já têm dono.
- Ideias por tema: comandar o negócio (Leme, Bússola), números (Ábaco, Margem), movimento (Giro, Órbita), núcleo e tudo-em-um (Cerne, Omnia, Fulcro, Plexo), inventados (Vendara, Nucleva, Omnexa, Unicerne).
- Pista de DNS em 09/10/2026: quase todas as palavras reais já têm domínio registrado. Só os inventados apareciam sem DNS. Isso é apenas uma pista, e quem confirma é o Registro.br.
- Antes de adotar um nome como marca, pesquisar no INPI.
- Em aberto: o nome do produto. O domínio já comprado é `sellercontrole.com.br`.

## 8. Próximos passos

- Bloco 1: levantar custos reais com a liberação do superior (GCP em São Paulo ou nos EUA, MySQL gerenciado ou instalado na própria máquina, e a AWS como alternativa). Aguardando ok de Matheus para começar.
- Depende de terceiros: o banco liberar o cartão para o GCP.
- Conferir o titular do domínio no Registro.br.
- Dados sensíveis (cartão, senhas) não são registrados nesta nota.
