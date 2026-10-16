---
tipo: conceito
dominio: design
status: ativa
criado: 16/10/2026
atualizado_em: 16/10/2026 18:38
relacionado: [Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente, Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026), Regra - Layout Fixo na Vertical e Fluido na Horizontal, Dois Computadores de Trabalho - Casa e Escritorio]
resumo: Monitores de referência para desenhar telas: casa 2560x1440 a 150% (27 pol, área útil de cerca de 1707x960) e escritório 1280x1024 e 1440x900, ambos a 100%. Quem manda no layout é o menor monitor do escritório (1280 de largura, 900 de altura).
---

# Telas e Monitores dos Usuários: Resoluções de Referência Para Desenhar o Sistema Interno V2 (Conceito)

**Resumo**: Monitores de referência para desenhar telas: casa 2560x1440 a 150% (27 pol, área útil de cerca de 1707x960) e escritório 1280x1024 e 1440x900, ambos a 100%. Quem manda no layout é o menor monitor do escritório (1280 de largura, 900 de altura).

## Contexto

Em 16/10/2026, Matheus passou a trabalhar com Claude no PC de casa (monitor grande e novo) e deixou o PC do escritório só para momentos de consulta (pegar um dado do ERP ou uma informação do Mercado Livre, acessando o PC do escritório de casa por AnyDesk). O problema é que o PC onde o sistema é **construído** não é o PC onde ele é **usado**: quem usa o Sistema Interno V2 no dia a dia é a equipe, nos monitores do escritório. Para desenhar telas que funcionem de verdade para essas pessoas, e não só para o monitor de casa, Matheus informou as resoluções reais dos monitores. Esta nota guarda esses dados e explica como lê-los.

## O que é

Os três monitores de referência informados por Matheus:

| Onde | Resolução | Escala do Windows | Tamanho físico | Área útil para a página (pixels CSS) |
|---|---|---|---|---|
| Casa (PC de Matheus, onde o sistema é construído) | 2560 x 1440 | 150% | 27 polegadas | cerca de 1707 x 960 |
| Escritório, monitor A | 1280 x 1024 | 100% | não informado | 1280 x 1024 |
| Escritório, monitor B | 1440 x 900 | 100% | não informado | 1440 x 900 |

Matheus disse também que os **demais monitores do escritório seguem esse porte**, porque são todos genéricos. Essa frase é uma afirmação dele, não uma medição de cada monitor.

### Como ler a tabela (para quem nunca viu esse assunto)

- **Resolução** é a quantidade de pontos (pixels) da tela física: 2560 pontos de largura por 1440 de altura, por exemplo.
- **Escala** é um aumento que o Windows aplica para as coisas não ficarem minúsculas em telas com muitos pontos. A 150%, cada "ponto" que o navegador desenha ocupa 1,5 ponto da tela física.
- **Área útil (pixel CSS)** é o espaço que o navegador realmente oferece para a página, depois de aplicada a escala. É nela que o layout das telas é desenhado. A conta é **resolução ÷ escala**.

Conta do monitor de casa:

```
2560 ÷ 1,5 = 1706,67  ->  cerca de 1707 de largura
1440 ÷ 1,5 =  960     ->  960 de altura
```

Nos dois monitores do escritório a escala é 100%, então a área útil é igual à resolução.

> [!warning] A altura real é menor que a da tabela
> A tabela mostra o máximo possível. Na prática, a barra de abas e a barra de endereço do navegador e a barra de tarefas do Windows ocupam uma parte da altura. Por isso a altura que sobra para a página é menor que 960, 1024 ou 900. Quanto menor, depende do navegador e do sistema, então esta nota não crava um número.

## Por que importa

- **O monitor de casa é o mais folgado de todos.** Uma tela que parece perfeita ali pode ficar apertada no escritório, e é no escritório que o sistema é usado.
- **A menor largura é 1280** (monitor A) e **a menor altura é 900** (monitor B). Uma tela que cabe nesses dois limites cabe nos três monitores.
- O Sistema Interno V2 é tratado como produto real (ver [[Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]]). Validar só no monitor de quem constrói não é validar com a realidade do usuário.

## O que muda no trabalho

Combinado de 16/10/2026, proposto por Claude e aceito por Matheus ao autorizar o registro desta nota:

- Toda tela nova, antes de ser entregue, é conferida num navegador automatizado (Playwright) em **três tamanhos de janela**: 1280 x 1024, 1440 x 900 e 1707 x 960.
- O **menor monitor do escritório manda**: o projeto da tela parte de 1280 de largura, e não dos 1707 de casa.
- Isso vale **junto** com a regra de layout que Matheus definiu em 12/10/2026 ([[Regra - Layout Fixo na Vertical e Fluido na Horizontal]]): posições fixas (nada muda de lugar quando a barra lateral abre ou fecha) e uso da largura toda, ou seja, fluida na horizontal e rígida na vertical.

## O que ainda não sabemos

- O tamanho físico, em polegadas, dos monitores A e B do escritório. Matheus informou só resolução e escala.
- Se algum usuário usa zoom no navegador ou uma escala diferente de 100%, o que mudaria a área útil dele.
- Se o sistema é aberto em celular ou tablet. Isso não foi informado.

## Exemplo

A janela "Prévia do Substituir" da tela "Arquivos de referência" (lista longa do que será apagado mais um botão vermelho de confirmação) é o tipo de tela que mais sofre com altura pequena: num monitor de 900 de altura, menos o espaço das barras, sobra pouca área para a lista e para o botão. É a primeira candidata a ser conferida nos três tamanhos. A conferência ainda **não foi feita**; este exemplo mostra onde o cuidado se aplica, e não um defeito encontrado.

## Fonte

Informado por Matheus na conversa de 16/10/2026 (iniciada às 18:14). Claude não mediu nenhum monitor.

## Relacionado

- [[Sistema Interno V2 e Produto Real - Padrao Maximo de Qualidade, Documentacao, Validacao e Resolucao Real do Cliente]]
- [[Checkpoint - Rotina Vira Botao - Auditoria Ponta a Ponta e Mapa de Execucao (14-10-2026)]]
- [[Regra - Layout Fixo na Vertical e Fluido na Horizontal]]
- [[Dois Computadores de Trabalho - Casa e Escritorio]]
