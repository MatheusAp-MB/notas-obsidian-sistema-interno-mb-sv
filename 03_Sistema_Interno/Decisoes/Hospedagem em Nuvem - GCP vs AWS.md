---
tipo: decisão
status: em investigação
criado: 08/10/2026
dominio: infraestrutura
relacionado:
  - "[[00_Indice_Sistema_Interno]]"
---

# Hospedagem em Nuvem — GCP vs AWS

Registrado em 08/10/2026 às 10:21. Pesquisa de custos e requisitos para hospedar o Sistema Interno V2 em nuvem. Até esta data a análise é só de custos e requisitos: nenhuma conta foi aberta e nenhum servidor foi criado nesta conversa.

## 1. Objetivo e requisitos informados por Matheus

- Subir o Sistema Interno V2 em nuvem para ser acessado de qualquer lugar (hoje roda só no PC do escritório) e receber o webhook do Mercado Livre.
- Rodar 24h por dia, 7 dias por semana, com prioridade para a coleta do webhook.
- IP único e sempre o mesmo. Não precisa de endereço "www", mas o IP não pode mudar.
- Guardar todos os dados SQL e, se possível, ter backup.
- NÃO precisa de máquina reserva para o caso de uma cair.
- Algo simples para começar e avaliar os custos.
- Dados do ERP chegam por planilha ou por API (conclusão minha: sem necessidade de VPN).
- Tem o crédito de US$ 40 por mês do Google AI Ultra (confirmado por ele em 08/10/2026).

## 2. Decisão provisória: Google Cloud (GCP)

Com o crédito de US$ 40 valendo, o GCP fica mais barato por mês que a AWS. Plano escolhido para começar:

| Peça | O que é | Função no sistema |
|---|---|---|
| Máquina virtual e2-medium (São Paulo) | Computador alugado, 2 processadores e 4 GB de memória | Roda o Django e o MySQL, sempre ligado |
| IP fixo | Endereço da máquina na internet que nunca muda | É o endereço dado ao Mercado Livre e usado para acessar |
| Disco de 50 GB | O "HD" da máquina | Guarda o sistema e o banco |
| MySQL na própria máquina | Programa que guarda os dados em tabelas | Evita pagar um banco gerenciado separado |
| Backup 1: cópia diária do banco | Arquivo com todos os dados, guardado fora da máquina | Protege contra erro ou dado apagado |
| Backup 2: foto do disco (snapshot) | Retrato da máquina inteira | Permite recriar a máquina se ela quebrar |
| Tráfego de saída | Dados que saem do servidor para a internet (o que entra é grátis) | Respostas às telas, ao ML e ao ERP |

Restaurar um backup é manual. Sem redundância (aceito por Matheus).

## 3. Custo do GCP (São Paulo, sob demanda, dólar a R$ 5,20)

| Item (US$/mês) | e2-medium (4 GB) | e2-small (2 GB) |
|---|---|---|
| Máquina | 38,83 | 19,41 |
| IP fixo em uso (US$ 0,005/h × 730 h) | 3,65 | 3,65 |
| Disco de 50 GB (tipo balanceado, US$ 0,15/GB) | 7,50 | 7,50 |
| Backups (estimativa minha) | 3,00 | 3,00 |
| Tráfego de saída (estimativa minha) | 5,00 | 5,00 |
| Total sem crédito | 57,98 (≈ R$ 301) | 38,56 (≈ R$ 201) |
| Com crédito de US$ 40 | 17,98 (≈ R$ 93) | ≈ 0 (sobram 1,44) |

- Escolha inicial: e2-medium, por causa da memória (Django + MySQL + importação de planilhas na mesma máquina). A e2-small cabe no crédito, mas a memória é curta. Trocar o tamanho depois não muda o IP.
- Cada 50 GB de disco a mais custa ≈ US$ 7,50 (o tamanho de 50 GB é suposição, falta medir o banco real).
- Desconto por compromisso de 1 ano na e2-medium: US$ 24,46 em vez de 38,83 (−37%). Não recomendado para começar.
- Cenários maiores calculados na primeira análise (sem crédito): banco gerenciado do Google (Cloud SQL) ≈ US$ 97 a 133 por mês (cenário B); o cenário C, bem maior, ≈ US$ 345 a 405.
- Impostos não entram na conta: IOF de 3,5% em cartão internacional e possível imposto local do Google (a página indica 14%, a confirmar ao abrir a conta). Não se sabe se o imposto incide antes ou depois do crédito: no e2-medium o valor líquido fica entre ≈ R$ 97 e ≈ R$ 136.
- Dólar: as fontes divergem (de R$ 5,00 a R$ 5,23); usado R$ 5,20.
- Fontes de preço: espelho de terceiros da tabela do Google (gcloud-compute.com) para máquina e disco; bytebase.com para o Cloud SQL. O preço oficial do Cloud SQL em São Paulo não apareceu em texto legível.

## 4. Crédito do Google AI Ultra

- A página da Google One mostra: AI Pro US$ 10, AI Ultra "5x" US$ 40 e AI Ultra "20x" US$ 100 por mês, via Google Developer Program.
- A FAQ do programa diz que o crédito vale para qualquer produto do Google Cloud ou do Google Maps Platform. A lista exata de exclusões não foi encontrada.
- Validade: a FAQ diz que expira 1 ano após a concessão (o texto fala dos planos Premium antigos; conferir no painel).
- Como ativar: ter uma conta de faturamento no Google Cloud e escolhê-la em "My Benefits" no portal de desenvolvedores do Google. A assinatura, o perfil de desenvolvedor e a conta de faturamento precisam ser do mesmo e-mail. Quem não é administrador do faturamento pode precisar da permissão `billing.accounts.redeemPromotion`.
- Não confirmado: a página fala de contas pessoais (@gmail.com) e diz que assinaturas do Workspace não mudaram (pergunta feita a Matheus e ainda sem resposta: a assinatura está em conta pessoal ou na do e-mail da empresa?). Também não confirmado como o crédito em dólar funciona se a conta de faturamento for em reais, e se o teste grátis de US$ 300 pode ser somado.

## 5. AWS: o que foi pesquisado

Lightsail (versão "pacote fechado" da AWS), com disco, IP fixo e tráfego incluídos:

| Pacote | Memória | Disco | Preço/mês |
|---|---|---|---|
| Lightsail 2 GB | 2 GB | 60 GB | US$ 12 |
| Lightsail 4 GB | 4 GB | 80 GB | US$ 24 |

- IP fixo incluído em todos os planos. Em São Paulo o pacote inclui metade da franquia de tráfego (2 TB no de 4 GB).
- Snapshots (manuais e automáticos): US$ 0,05 por GB por mês.
- CPU "burstável": base de 20% por processador nos dois pacotes. O e2-medium do GCP tem base de 50% por processador (esse número vem de site de terceiros).
- Custo estimado com backup: Lightsail 4 GB ≈ US$ 28 (≈ R$ 146); Lightsail 2 GB ≈ US$ 15 (≈ R$ 78). Backup estimado como um disco cheio em snapshot.
- EC2 comum (t3.medium, 4 GB): US$ 0,0672/h ≈ US$ 49,06, mais IP, disco (gp3 US$ 0,152/GB) e backup ≈ US$ 63 (≈ R$ 329). Preços de site de terceiros, sistema operacional não confirmado; o IPv4 de US$ 0,005/h é valor conhecido antes e não reconferido.
- Crédito de conta nova: até US$ 200 (US$ 100 no cadastro e US$ 100 por usar 5 serviços, US$ 20 cada: EC2, RDS, Lambda, Bedrock e Budgets). O plano grátis dura 6 meses ou até o crédito acabar; o crédito não usado vale até 12 meses. Contas criadas antes de 15/07/2025 ficam no programa antigo. Não confirmado se o Lightsail entra nesse crédito.
- Cobrança em reais pela AWS Serviços Brasil Ltda., com NFS-e. A AWS lista PIS/COFINS de 9,25% e ISS de 2,9% (12,15% no total; não confirmado se somados ao preço). Sem IOF, segundo reportagem de 2020 que não foi reconfirmada em 2026.

## 6. Comparação GCP x AWS

| Cenário | GCP sem crédito | GCP com crédito | AWS (Lightsail) |
|---|---|---|---|
| 4 GB | US$ 57,98 | US$ 17,98 | US$ 28 |
| 2 GB | US$ 38,56 | ≈ US$ 0 | US$ 15 |

- Sem o crédito, o Lightsail custa cerca de metade do GCP para a mesma memória.
- Com o crédito de US$ 40, o GCP custa por mês ≈ US$ 10 a menos no pacote de 4 GB e ≈ US$ 15 a menos no de 2 GB.
- Em 12 meses (4 GB): GCP ≈ US$ 216 (≈ R$ 1.122) com crédito; AWS ≈ US$ 336 (≈ R$ 1.747) sem crédito ou ≈ US$ 136 (≈ R$ 707) se os US$ 200 de conta nova valerem no Lightsail. No primeiro ano a AWS pode empatar ou ganhar, mas só com conta nova e crédito válido; do segundo ano em diante o GCP com o crédito é mais barato.
- Os dois têm a mesma fragilidade: servidor único, sem reserva.
- Conclusão: ficar no GCP se o crédito funcionar na conta. Se não funcionar, o Lightsail passa a ser a opção mais barata.

## 7. Domínio, HTTPS e as 3 URLs

- A página "Crie uma aplicação no Mercado Livre" (atualizada em 29/12/2025) diz que o URI de redirecionamento precisa usar HTTPS. Portanto o domínio próprio é obrigatório na prática, pois o certificado gratuito exige um nome de domínio.
- Domínio .com.br no Registro.br: ≈ R$ 40 por ano, para CPF ou CNPJ (valor de artigo de 2026 sem fonte oficial). Domínio .com na Cloudflare: US$ 10,46 por ano, a preço de custo (site de terceiro, dado de set/2025). O domínio se compra à parte, não é custo do Google.
- O Registro.br tem a tela "Configurar endereçamento" para apontar o nome ao IP. Não ficou confirmado se editar a zona tem custo.
- Certificado HTTPS: Let's Encrypt, gratuito, válido por 90 dias com renovação automática, instalado na própria máquina. Não foi pesquisado o balanceador de carga do Google.
- Custo mensal total estimado com domínio: ≈ R$ 97 (US$ 17,98 × 5,20 + R$ 40 ÷ 12), antes de impostos.
- As 3 URLs ficam no mesmo domínio, em caminhos diferentes. Exemplo (nome ilustrativo): acesso `https://dominio/`, notificações `https://dominio/ml/notificacoes/`, redirecionamento `https://dominio/ml/callback/`. O ML não tem campo para a URL de acesso.
- O caminho das notificações precisa ficar aberto, sem login, porque o ML não tem a senha do sistema.

## 8. Regras do Mercado Livre relevantes

Vindas das páginas oficiais que Matheus enviou em 08/10/2026 (Crie uma aplicação; Autenticação e Autorização; Gerenciar IPs de um aplicativo; Erro 403):

- O redirect_uri deve ser exatamente igual ao cadastrado e não pode ter informação variável. Para levar informação junto, usar o parâmetro `state`. Erro típico: "your client callback has to match with the redirect_uri param" ou `invalid_grant`.
- Ambiguidade da doc: uma página manda preencher com "a raiz do domínio", outra exige igualdade exata. Plano: cadastrar a URL completa que o sistema usa e testar o login.
- Fluxo: depois de autorizar, o navegador volta ao redirect_uri com um `code` temporário; o servidor troca o `code` pelo token com um POST ao ML. O access token dura 6 horas; o refresh token é de uso único.
- Notificações: o campo "URL de retorno de notificações" pede uma URL "adequada, válida e configurada". A doc de notificações não exige HTTPS (exemplo em HTTP). Pede resposta HTTP 200 imediata. Há divergência entre versões da doc: reenvio por 1 hora numa e por 12 horas noutra, e um limite de 20 segundos citado numa versão e não citado na outra. Os IPs de origem do ML citados na doc (relevantes se houver filtro): 54.88.218.97, 18.215.140.160, 18.213.114.129 e 18.206.34.84.
- No Brasil (e em Argentina, México e Chile) só é permitida 1 aplicação por titular. Se já houver uma, editar a existente em vez de criar outra.
- "Gerenciar IPs de um aplicativo": função exclusiva de integradores em lista especial. É uma lista de IPs aceitos para consumir a API. Formato CIDR (IPv4 ou IPv6; um IP único costuma levar `/32`, padrão que a página não exemplifica), cadastro individual ou por CSV sem cabeçalho, separado por vírgula; faixas sobrepostas dão erro; há limite de quantidade. Se a opção "Gerenciar intervalos de IP" não aparecer no aplicativo, ele não tem a função.
- Erro 403: pode vir de IP fora da lista, token de outro usuário, usuário inativo, escopo sem permissão, aplicativo bloqueado ou dados do vendedor pendentes.
- As duas direções não se misturam: os IPs do ML chamam o servidor (webhook); o IP fixo do servidor chama o ML (API). Se a lista de IPs estiver ativa, o IP fixo do servidor novo precisa ser cadastrado antes de ele chamar a API, e o IP do PC do escritório deve permanecer enquanto ainda for usado.

## 9. Pendências

- Conferir se a opção "Gerenciar intervalos de IP" aparece no aplicativo do ML.
- Saber se a assinatura do Google AI Ultra está em conta pessoal ou na do e-mail da empresa.
- Confirmar os impostos reais e a moeda da conta de faturamento ao abrir a conta no Google Cloud.
- Medir o tamanho real do banco para dimensionar o disco.
- Testar o cadastro da URL de redirecionamento no ML (completa ou só a raiz).
- Montar o passo a passo de implantação em etapas curtas (conta no Google Cloud, máquina, domínio, HTTPS e cadastro no ML), com confirmação a cada etapa.
- Decidir a estratégia para as notificações perdidas se o servidor ficar fora do ar (consulta periódica pela API como rede de segurança).

## 10. Fontes

- Google Developer Program, FAQ de benefícios: https://developers.google.com/profile/help/benefits
- Google One, planos de IA com crédito: https://one.google.com/about/google-ai-plans/
- Amazon Lightsail, preços: https://aws.amazon.com/lightsail/pricing
- Lightsail, desempenho de CPU base: https://docs.aws.amazon.com/lightsail/latest/userguide/baseline-cpu-performance.html
- AWS Free Tier, anúncio oficial: https://aws.amazon.com/about-aws/whats-new/2025/07/aws-free-tier-credits-month-free-plan/
- AWS, impostos no Brasil: https://aws.amazon.com/tax-help/Brazil/
- Tecnoblog, AWS cobra em reais: https://tecnoblog.net/364279/amazon-web-services-aws-vai-cobrar-em-reais-no-brasil/
- Preços AWS em sa-east-1 (terceiro): https://aws-pricing.com/sa-east-1.html
- t3.medium em sa-east-1 (DoiT): https://www.doit.com/compute/spot/sa-east-1/t3.medium
- e2-medium (VPSBenchmarks): https://www.vpsbenchmarks.com/hosters/google_compute_engine/plans/e2-medium
- Registro de domínio .br, preços (Homehost): https://www.homehost.com.br/blog/?p=15114
- Cloudflare .com (WHTop): https://www.whtop.com/plans/cloudflare.com/135912
- Registro.br, zona de DNS (Locaweb): https://www.locaweb.com.br/ajuda/wiki/como-acessar-a-zona-de-dns-na-registro-br-registro-de-dominio
- Let's Encrypt (Nexcess): https://docs.nexcess.com/hosting/security/ssl/lets-encrypt/
- ML, notificações: https://developers.mercadolibre.com.ar/en_us/products-receive-notifications
- ML, registrar a aplicação: https://developers.mercadolivre.com.br/en_us/register-your-application
- ML (páginas enviadas por Matheus em HTML): Crie uma aplicação; Autenticação e Autorização; Gerenciar IPs de um aplicativo; Erro 403.
