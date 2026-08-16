---
tipo: bug_conhecido
dominio: fiscal
status: corrigido
criado: 15/08/2026
atualizado_em: 15/08/2026 14:05
relacionado: [Lista de CFOP Relevantes para Precificacao, XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir, Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp, Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]
---

# Por Que o Filtro de CFOP Usa Cadastro, Não XML

Esta nota existe pra qualquer pessoa do time que olhar `filtro_cfop.py` e estranhar: "a regra do projeto não é que o XML manda? por que esse filtro usa Cadastro?". É uma pergunta legítima — o próprio usuário/líder do projeto teve a mesma dúvida em 15/08/2026 e essa nota registra a explicação completa, pra ninguém precisar reabrir essa discussão do zero.

## Contexto rápido — os 2 campos

Toda linha de imposto de entrada que vem da API do Sysemp traz o CFOP (código fiscal de operação) em 2 campos separados:

```json
"CFOP Cadastro": "1.102",
"CFOP XML": "5102"
```

- **CFOP XML**: o código que está escrito na nota fiscal eletrônica de verdade, do jeito que o FORNECEDOR (quem vendeu) classificou a operação.
- **CFOP Cadastro**: o código que o Sysemp (nosso ERP, do lado de quem COMPROU) atribuiu à mesma operação, na hora que alguém deu entrada na nota.

## O bug original (14/08/2026) — por que XML não funciona aqui

Até 14/08/2026 de manhã (commit `faa3dd4`, 10:25), o filtro de CFOP (`CFOPS_PARA_MANTER`, com códigos tipo `1.102`, `2.102`, `1.403`...) comparava contra **CFOP XML**. No mesmo dia à tarde (commit `149de4d`, 15:33) foi descoberto e corrigido um problema sério: **nenhuma nota estava passando no filtro desde a remodelagem da API do Sysemp** (07–08/08/2026).

O motivo: quem EMITE uma nota fiscal está sempre "vendendo" (saindo mercadoria do estoque dele), então o CFOP que aparece no XML é sempre um código da família "saída" (`5.xxx` pra dentro do estado, `6.xxx` pra fora) — por exemplo `5102`. Isso é verdade mesmo quando, pro nosso lado, aquilo é uma ENTRADA de compra normal. Só que `CFOPS_PARA_MANTER` só tem códigos de entrada (`1.xxx`/`2.xxx`) — `5102` nunca vai estar nessa lista, nem numa nota perfeitamente correta. Resultado prático: a sincronização ficou trazendo sempre a última nota de ANTES da remodelagem como "mais recente", porque toda nota nova era rejeitada silenciosamente.

**A correção** trocou a comparação pra usar `CFOP Cadastro` (com `CFOP XML` só como fallback) — porque é o Cadastro que usa a mesma numeração de entrada que `CFOPS_PARA_MANTER` espera.

Importante: essa correção não é de uma versão antiga da API, de antes dos campos existirem separados. Ela foi feita DEPOIS do commit que já refletia a API atualizada (mesmo dia, 5h depois), rodando contra os mesmos campos `CFOP Cadastro`/`CFOP XML` que existem hoje.

## "Mas o XML não é a fonte única de verdade?" (revisitado 15/08/2026)

Essa é a dúvida que gerou esta nota. A regra [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]] diz que quando o MESMO dado existe nos dois lados e diverge, o XML vence. CFOP parece se encaixar nisso — só que não se encaixa, e o motivo é sutil.

**O exemplo que destrava o raciocínio**: pega uma nota de compra 100% correta, sem nenhum erro de ninguém. Mesmo assim:
- CFOP XML = `5.102` (o fornecedor vendeu mercadoria de terceiro)
- CFOP Cadastro = `1.102` (nós compramos pra revenda)

Esses 2 números NUNCA são iguais — nem quando está tudo certo. Não é "um dado desatualizado, o outro atual" (como é o caso de custo, PIS/COFINS etc., onde os 2 lados TENTAM representar o mesmo número e um fica velho). É 2 números diferentes por definição, porque descrevem o mesmo evento fiscal de 2 lados opostos da operação (quem vende sempre registra "saída", quem compra sempre registra "entrada"). Comparar CFOP XML contra uma lista de códigos de entrada não é "usar a fonte errada" — é comparar coisas de universos numéricos diferentes, que nunca vão bater, nem no caso perfeito.

**Por que XML não pode simplesmente substituir Cadastro aqui**: o CFOP Cadastro carrega uma informação que o fornecedor não tem como saber — pra que NÓS vamos usar aquela mercadoria (revender, usar como insumo de industrialização, ou consumo interno). O CFOP XML só descreve o que o fornecedor fez (vendeu produção própria ou revendeu de terceiro) — não descreve a nossa intenção de uso. Prova real disso, já documentada em [[Lista de CFOP Relevantes para Precificacao]]: o mesmo tipo de operação do fornecedor pode gerar, do nosso lado, tanto `1.102` (compra pra revenda — entra no filtro) quanto `1.101`/`2.101` (compra pra industrialização — fica de fora, por decisão já confirmada do usuário). Se o filtro usasse só o XML, não teria como diferenciar esses 2 casos — misturaria compra de insumo com compra de revenda no cálculo de custo de precificação.

## O risco residual — ainda em aberto, não é bug, é limitação conhecida

O Sysemp **não valida** o CFOP Cadastro contra o CFOP XML na hora de dar entrada na nota — é perfeitamente possível alguém cadastrar `1.102` numa nota cujo XML diz `5.403` (que indicaria ICMS-ST), e o sistema aceita, sem travar nada. Isso fica fiscalmente errado, mas silenciosamente — o filtro atual não pega esse tipo de erro, porque ele confia no Cadastro.

Vale separar 2 garantias diferentes, que se confundem fácil:
- **Sempre preenchido**: sim, com boa confiança — o código lê `registro['CFOP Cadastro']` direto, sem valor padrão; se a API alguma vez devolvesse um registro sem esse campo, o código quebraria na hora (`KeyError`). Isso não aconteceu até hoje.
- **Sempre correto**: não é garantido — "preenchido" não é "certo". Um erro de digitação na hora de dar entrada gera um registro completo (os 2 campos existem) só que com o Cadastro errado.

**Não decidido, não construído**: uma possível melhoria futura seria uma checagem de inconsistência — comparar CFOP XML com CFOP Cadastro através de uma tabela de correspondência, e gerar um alerta quando não bater (mesmo princípio de "espelhar o dado bruto, mas reportar inconsistência" já usado noutros pontos do projeto). Isso precisaria de validação do tributário (ver [[Achados de Imposto Sempre Aguardam Validacao do Tributario]]) antes de virar confiável — não foi desenhado nem priorizado ainda.

## Decisão (15/08/2026, 14:05)

Manter o filtro como está — `filtro_cfop.py` continua comparando por `CFOP Cadastro`. Nenhuma mudança de código motivada por esta discussão.

## Relacionado

- [[Lista de CFOP Relevantes para Precificacao]]
- [[XML da Nota Fiscal E a Fonte Unica de Verdade Quando o Dado Existir]]
- [[Reorganizacao de Nomenclatura de Campos XML e Cadastro na API Sysemp]]
- [[Bonificacao Removida do Filtro de CFOP de Impostos de Entrada]]
