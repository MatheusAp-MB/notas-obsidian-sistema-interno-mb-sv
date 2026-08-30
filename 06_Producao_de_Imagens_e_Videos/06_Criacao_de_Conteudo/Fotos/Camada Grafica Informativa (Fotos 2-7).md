---
tipo: decisao
dominio: 
status: ativa
criado: 23/08/2026
atualizado_em: 23/08/2026 23:11
relacionado: [Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial, Responsabilidade Unica por Foto (Fotos 2-7), Trava de Formato da Foto de Capa, Etapa 8 - Criacao (Fotos), Desejo de Compra na Camada Grafica (Fotos 2-7)]
---

# Camada Gráfica Informativa (Fotos 2-7)

O esqueleto de 6 blocos de [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]] (referência/cenário/fidelidade/restrições/câmera/qualidade) foi pensado pra 1 cena realista — funciona bem pra Foto 1 (Capa), mas sozinho não entrega o que as Fotos 2-7 precisam: informação explícita que o cliente lê e usa pra decidir a compra (ver [[Responsabilidade Unica por Foto (Fotos 2-7)]]). As Fotos 2-7 precisam de uma camada visual adicional, por cima do produto fiel à referência.

## Elementos da camada gráfica
- **Produto em uso ativo** (adicionado 23/08/2026, 23h11) — mão seguindo o gesto real de uso, efeito visível acontecendo (jato, leque, líquido, o que for aplicável), superfície ou resultado recebendo esse efeito. Composição padrão sempre que a pergunta da foto for sobre o que o produto FAZ ou o resultado que produz — produto estático numa bancada, só com ícones ao redor, vira exceção reservada pra perguntas puramente de especificação (ex.: a própria Ficha Técnica). Ver [[Desejo de Compra na Camada Grafica (Fotos 2-7)]].
- **Headline curta**, com peso e cor variando pra criar hierarquia (ex.: 1 palavra em preto sólido + 1 palavra em verde/cor de destaque, mais pesada) — nunca texto uniforme neutro. **Atualização 23/08/2026, 23h11**: o headline precisa ser uma promessa/benefício ("Controle no Acabamento"), nunca um rótulo neutro de assunto ("Ficha Técnica" como único texto de destaque) — ver [[Desejo de Compra na Camada Grafica (Fotos 2-7)]].
- **Ícones + rótulo + valor**, um por linha, quando a foto responde uma pergunta de especificação/lista (ex.: ficha técnica). **Atualização 23/08/2026, 23h11**: fora da própria Ficha Técnica, prefira ícone + benefício + resultado (ligado a um Eixo de Venda Validado da Étapa 6) em vez de ícone + material/dado isolado — ver [[Desejo de Compra na Camada Grafica (Fotos 2-7)]].
- **Diagrama numerado** (passo 1, passo 2...), quando a foto explica um processo/mecanismo.
- **Linhas de chamada com rótulo**, quando a foto é uma "anatomia"/detalhe de componentes — o rótulo nomeia só o que já foi confirmado, nunca inventa a função de uma peça não confirmada. **Risco identificado em 23/08/2026 (Pistola SGT-3011B)**: linha fina conectando rótulo a um ponto exato do produto é uma tarefa de ancoragem espacial que o modelo erra com frequência (linha "solta", sem tocar o componente certo). Preferir blocos autônomos (ícone + texto) posicionados perto do componente, sem linha fina de conexão, ou um selo/badge sobreposto diretamente sobre a peça.
- **Selo/badge**, quando a foto comunica garantia/confiança. **Atualização 23/08/2026, 23h11**: funciona melhor como elemento pequeno sobreposto numa foto que já mostra o produto em uso ativo, do que como composição isolada dedicada só a isso (risco de sobrecarregar a foto com elementos demais — ver caso abaixo).
- **Colagem em quadrantes com legenda curta por quadrante**, quando a foto cobre múltiplas aplicações confirmadas numa imagem só, em vez de gastar 1 foto inteira por aplicação. **Risco identificado em 23/08/2026 (Pistola SGT-3011B)**: pedir pro modelo redesenhar o produto fielmente mais de 1 vez dentro da mesma imagem quebrou a geração (resultado "recorte e colagem"). Preferir mostrar só as superfícies/aplicações (sem repetir o produto em cada célula) organizadas em tira ou grade, com legenda por célula — o produto aparece 1 vez só, fora da colagem, ou nem aparece nela.
- Todo texto sobreposto segue a Regra Universal #5 já existente na nota principal (sempre entre aspas no prompt, com estilo de fonte descrito).

## Risco geral: excesso de elementos gráficos numa foto só
Caso real (Pistola SGT-3011B, 23/08/2026): a foto que empilhou selo + 2 listas de ícone + ícone de alerta numa composição só também quebrou. Hipótese aberta (testada com poucos casos ainda, não é regra fechada): quanto mais tipos de elemento gráfico diferentes numa única foto, maior o risco de falha visual. Preferir 1-2 tipos de elemento por foto até essa hipótese ser testada mais.

## Fundo e luz — nunca fundo liso, mesmo em foto informativa
Erro identificado nas primeiras tentativas: pedir "fundo branco/cinza liso" pras fotos informativas deixa o resultado sem vida (palavras do usuário: "parece trabalho de escola"). Correção: mesmo numa foto focada em dado/especificação, o fundo deve ser uma cena real desfocada (ex.: jardim, ambiente de uso confirmado), nunca uma cor lisa — e a luz deve ser de estúdio, com destaque/reflexo sutil no produto, não luz plana e uniforme. O fundo dinâmico dá profundidade sem competir com o texto porque fica fora de foco.

## Fidelidade de cor por componente, não genérica
Erro identificado: pedir "100% faithful to the reference" de forma genérica deixou o modelo inventar a cor de peças específicas (ex.: o topo do cabo de bombeamento saiu verde em vez de branco, em 2 modelos testados no mesmo teste). Correção: o prompt deve declarar a cor de cada componente confirmado explicitamente (ex.: "o corpo, a haste e o topo do cabo em T são brancos; a alavanca, a ponta do bico e o anel de trava são verdes"), usando os dados da Seção 1 do Documento Consolidado — nunca depender de "fidelidade" genérica pra detalhe que importa.

## Confirmado em
Testado com o Pulverizador Guarany 1,2L, 23/08/2026 — 6 fotos (ficha técnica, como funciona, aplicações, anatomia, garantia, limpeza automotiva) usando essa camada, sem dado inventado e sem comparação com concorrente. Ferramentas testadas com o mesmo prompt e mesmas referências: GPT-Image (modelo 5.6, esforço alto), Gemini (3.1 Pro, raciocínio estendido) e Google Flow (Nano Banana Pro) — as 3 entregaram as specs corretas; Flow teve a melhor integração produto+cenário e ícones semanticamente mais corretos nesse teste específico; GPT entregou um estilo alternativo válido (cartão flutuante tipo UI); Gemini teve os ícones mais confusos (ex.: ícone de átomo/molécula pra "material"). Achado registrado como sinal, não como regra fechada sobre qual ferramenta usar sempre.

## Relacionado
- [[Regras de Prompt de Imagem - Fundamentado em Documentacao Oficial]]
- [[Responsabilidade Unica por Foto (Fotos 2-7)]]
- [[Trava de Formato da Foto de Capa]]
- [[Etapa 8 - Criacao (Fotos)]] — prompt autocontido que incorpora esta camada diretamente (23/08/2026, 21h53).
