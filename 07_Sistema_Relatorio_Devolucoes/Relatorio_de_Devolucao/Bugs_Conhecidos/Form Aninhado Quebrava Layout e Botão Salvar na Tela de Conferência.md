---
tipo: bug_conhecido
dominio:
status: corrigido
criado: 08/09/2026
atualizado_em: 08/09/2026 03:07
relacionado: [Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução, Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]
---

# Form Aninhado Quebrava Layout e Botão Salvar na Tela de Conferência

**Resumo**: na tela "Editar Conferência" (conferência de peças, Fase 3), o botão de excluir foto de cada peça usava um `<form>` próprio, aninhado DENTRO do `<form>` principal que envolve a tela inteira — HTML5 não permite `<form>` dentro de `<form>`. O navegador fechava o form principal cedo demais, jogando tudo que vinha depois (peças seguintes, "Destino do produto", "Observação geral", botão "Salvar") pra fora dele. Corrigido removendo o form aninhado e usando `formaction`/`formmethod` direto no botão.

> [!success] Corrigido — 08/09/2026
> Reproduzido isolado (Django + Playwright, sem banco de dados) e confirmado via inspeção real do DOM. Corrigido sem JavaScript novo — só os atributos `formaction`/`formmethod` no botão existente. Commit local: `fc676ad`.

## Contexto

A tela de conferência de peças (`conferir_devolucao.html`) tem 1 único `<form>` envolvendo a tela inteira, do recap do produto até o botão "Salvar alterações". Dentro dela, cada peça que já tem foto salva mostra essa foto com um botão de excluir — esse botão precisa disparar uma ação de exclusão própria (`excluir_foto_conferencia`), diferente da ação de salvar a conferência inteira.

## O problema

O usuário reportou que, na tela "Editar Conferência", o layout aparecia esticado (perdendo a largura estreita e centralizada normal da tela) e o botão "Salvar alterações" não fazia nada ao ser clicado. Os 2 sintomas só apareciam em devoluções que já tinham pelo menos 1 peça com foto salva — ou seja, só ao **editar** uma conferência já feita, nunca numa conferência nova.

## O que levou à resposta

**1ª hipótese descartada — tags desbalanceadas**: um verificador automático de balanceamento de tags (pilha de nomes de tag, já usado noutras verificações deste projeto) reportou **zero erros** no template, mesmo o bug sendo real. Isso só foi entendido depois: o verificador confere só o NOME da tag numa pilha — uma tag `</form>` a mais, fechando o form errado (o principal, em vez do aninhado, que o navegador nem chega a abrir de verdade), ainda "bate" numericamente contra outro `<form>` de mesmo nome na pilha. Esse tipo de verificador é cego pra esse bug específico — ele não sabe distinguir QUAL form está sendo fechado, só que o nome bate.

**2ª hipótese descartada — JavaScript**: o script da tela (`script_conferir_devolucao.js`) foi lido por completo — só adiciona os cliques dos botões +/- do contador de quantidade e o acúmulo de fotos antes de salvar; não reestrutura o HTML da página de nenhuma forma que explicasse o sintoma.

**Causa raiz confirmada por inspeção de DOM**: reproduzido um caso isolado (Django configurado sem banco de dados, com Playwright) usando dados fictícios de 6 peças, sendo a 1ª com foto anexada — o mesmo padrão do caso real relatado. Usando `page.evaluate()` pra consultar a estrutura real da página (não só a aparência visual), ficou confirmado: as peças **depois** da 1ª peça com foto apareciam como filhas diretas de `<main class="conteudo-principal">`, com largura 992px — em vez de filhas do `<form class="cf-pagina">`, com a largura esperada de 460px. A causa: o botão de excluir foto tinha o próprio `<form>`, aninhado dentro do form principal. HTML5 não permite isso — a especificação diz que um `<form>` de abertura encontrado enquanto outro form já está aberto é simplesmente ignorado (nunca chega a existir de verdade); mas quando o parser encontra o `</form>` de fechamento correspondente (destinado a fechar o form ilegal que nunca existiu), ele fecha, em vez disso, o form que **está realmente aberto** — o form principal. Tudo que vem depois na página passa a renderizar como irmão do form, fora dele — daí o layout esticando (perde o `max-width: 460px` que só existe dentro do form) e o botão Salvar parando de funcionar (deixa de estar dentro de qualquer form pra poder ser enviado).

## Correção

O CSRF do Django só exige 1 `csrfmiddlewaretoken` presente em qualquer lugar do POST enviado — como o form principal já tem o seu próprio `{% csrf_token %}`, o botão de excluir foto pode usar os atributos HTML5 `formaction`/`formmethod` pra apontar pra outra URL na hora de enviar, sem precisar de um `<form>` próprio.

Localize (`devolucoes/templates/devolucoes/conferir_devolucao.html`):

```html
<div class="cf-foto-item">
    <img src="{{ foto.imagem.url }}" alt="Foto da peça {{ item.peca.nome_generico }}">
    <form method="post" action="{% url 'excluir_foto_conferencia' foto.id %}" class="cf-form-excluir-foto">
        {% csrf_token %}
        <button type="submit" class="cf-foto-excluir" title="Excluir foto">
            <i class="fas fa-xmark"></i>
        </button>
    </form>
</div>
```

Substitua:

```html
<div class="cf-foto-item">
    <img src="{{ foto.imagem.url }}" alt="Foto da peça {{ item.peca.nome_generico }}">
    <button type="submit" class="cf-foto-excluir" title="Excluir foto"
            formmethod="post" formaction="{% url 'excluir_foto_conferencia' foto.id %}">
        <i class="fas fa-xmark"></i>
    </button>
</div>
```

A regra CSS `.cf-form-excluir-foto { display: contents; }` (`layout_conferir_devolucao.css`), que só existia pra estilizar o form aninhado removido, também foi apagada.

## Exemplo

Verificação pós-correção, no mesmo cenário isolado: as 6 peças mockadas (incluindo a que tem foto) voltaram a aparecer todas como filhas de `FORM.cf-pagina`, com largura 460px; confirmado `document.querySelectorAll('form').length === 1` (só existe 1 form na página inteira); confirmado que tanto o botão "Salvar" quanto o botão de excluir foto pertencem a esse único form (`form.contains(botao) === true`).

**Lição de método pra próxima vez**: um verificador de balanceamento de tags baseado só em nome/pilha não é suficiente pra pegar esse tipo de bug (fechamento da tag errada, mas do mesmo nome). Quando o sintoma é estrutural (elementos aparecendo fora do lugar esperado), a forma confiável de confirmar é inspecionar o DOM de verdade (`element.contains()`, `parentElement`, `getBoundingClientRect()`), não só reler o HTML.

## Relacionado

- [[Idealização da Tela Nova Devolução — Fluxo de UX e Campos da Devolução]]
- [[Sistema de Relatório de Devoluções — Contexto e Objetivo Inicial]]
