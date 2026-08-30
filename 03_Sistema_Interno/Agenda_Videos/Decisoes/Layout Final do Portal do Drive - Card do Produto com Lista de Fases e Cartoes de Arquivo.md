---
tipo: decisao
dominio: 
status: resolvida
criado: 19/08/2026
atualizado_em: 19/08/2026 22:06
relacionado: [Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos), Convencao de Nomenclatura de Arquivos no Drive]
---

# Layout Final do Portal do Drive — Card do Produto com Lista de Fases e Cartões de Arquivo

## O quê

O layout visual definitivo da tela do Portal do Drive: 1 card por produto, com uma linha de identificação no topo (foto, marca, título, EAN, SKU — mesmo padrão já usado no hub de anúncios) e, abaixo dela, 1 lista vertical com 1 linha por fase/ocorrência (Simples, Mensal 01-04, Trimestral 01...). Cada linha mostra só o essencial (título, "X de 3 arquivos", 3 pontinhos de status, seta) e, ao ser clicada, expande um painel com os 3 arquivos daquela ocorrência (Base, Roteiro, Completo) lado a lado, cada um com sua própria miniatura — o Roteiro (.txt) com ícone de documento em vez de ícone de vídeo.

Esta decisão substitui o rascunho anterior (quadradinhos pequenos, monocromáticos, sem hierarquia visual — nas palavras do usuário, "parecendo um trabalho mal feito de escola").

## Por quê

O rascunho original (`agenda_videos/templates/agenda_videos/rascunho_portal_drive.html`, ver [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]) funcionava — upload real, preview real de vídeo e texto — mas visualmente não comunicava nada: todo quadradinho tinha o mesmo peso visual, vazio ou preenchido, sem nenhuma "cara" de vídeo. O usuário pediu explicitamente algo no nível de um produto de vídeo de verdade — a referência dada foi o YouTube, tanto a grade de um canal (miniaturas grandes) quanto o Gerenciador de Vídeos do YouTube Studio (lista com miniatura pequena por linha).

## Pra quê

Pra a tela deixar de parecer um formulário cru e passar a comunicar, de forma imediata (sem precisar ler texto), quais ocorrências já têm vídeo, quais estão faltando, e dar 1 lugar óbvio pra ver/enviar cada arquivo — sem nunca precisar abrir o Google Drive.

## Como — o processo de decisão

3 mockups foram gerados e comparados, em conversa, antes de fechar nesta versão:

1. **Mockup em grade** (estilo canal do YouTube) — 1 card grande por ocorrência, miniatura ocupando a maior parte, título e pílulas de status embaixo. Ficou visualmente rico, mas ocupava muito espaço vertical pra caber Simples + Mensal 01-04 + Trimestral numa tela só.
2. **Mockup em lista** (estilo Gerenciador de Vídeos do YouTube Studio) — 1 linha por ocorrência, miniatura pequena à esquerda, clicável, expande pra baixo. Mais compacto, mas a linha expandida só mostrava texto (sem a força visual das miniaturas do mockup 1).
3. **Decisão do usuário**: mesclar os 2 — a estrutura externa (lista de fases, uma abaixo da outra) segue o mockup 2; o conteúdo do painel que abre ao clicar numa linha (os 3 arquivos lado a lado, na ordem Base → Roteiro → Completo, incluindo o TXT) segue o mockup 1.

Durante a mesclagem, apareceu um ícone pequeno (▶ ou +) no início de cada linha colapsada, herdado do mockup 1 — nele, a miniatura grande fazia 2 papéis (identidade visual da linha + alvo de "arraste o 1º arquivo aqui"). Depois da mescla, esse "arraste aqui" já vive dentro do painel expandido (em cada cartão de arquivo) — então esse ícone da linha colapsada ficou **sem função**, só duplicando a informação que os pontinhos de status e o texto "X de 3 arquivos" já mostravam. Confirmado com o usuário ("é completamente inútil") e removido na versão final.

Por fim, o usuário pediu pra embrulhar tudo isso dentro de 1 card representando o produto, com uma linha de identificação no topo — pedindo explicitamente o mesmo padrão visual já usado no **hub de anúncios** (foto, marca, título, EAN, SKU) — pra deixar claro, de cara, de qual produto aquele card é, antes mesmo de abrir qualquer fase.

## O mockup final (aprovado pelo usuário, 19/08/2026)

> [!success] Confirmação do usuário
> "PERFEITO. é exatamente isso que eu buscava."

Código completo (HTML + CSS + JS, self-contido, dados de exemplo fixos só pra visualização — a versão real lê o Drive de verdade e teria os dados vindos do backend):

```html
<style>
.card-produto{background:var(--surface-2);border:0.5px solid var(--border);border-radius:12px;padding:1rem 1.25rem}
.cab-produto{display:flex;align-items:center;gap:14px;padding-bottom:14px;border-bottom:0.5px solid var(--border);margin-bottom:6px}
.foto{width:56px;height:56px;flex-shrink:0;border-radius:var(--radius);background:var(--surface-1);border:0.5px solid var(--border);display:flex;align-items:center;justify-content:center}
.linha{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:0.5px solid var(--border);cursor:pointer}
.dot{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dot.ok{background:var(--bg-success);color:var(--text-success)}
.dot.off{background:var(--surface-1);color:var(--text-muted)}
.painel{display:none;padding:4px 4px 16px 4px}
.linha.aberta + .painel{display:flex;gap:10px;flex-wrap:wrap}
.filecard{background:var(--surface-2);border:0.5px solid var(--border);border-radius:12px;overflow:hidden;width:150px}
.thumb{aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}
.thumb.on{background:var(--bg-accent)}
.thumb.off{background:var(--surface-1);border:1px dashed var(--border-strong)}
.pill{font-size:11px;padding:2px 8px;border-radius:999px}
.pill.ok{background:var(--bg-success);color:var(--text-success)}
.pill.off{background:var(--surface-1);color:var(--text-muted)}
.chip{font-size:12px;color:var(--text-secondary)}
.chip b{color:var(--text-primary);font-weight:500;margin-left:4px}
</style>

<div class="card-produto">
  <div class="cab-produto">
    <div class="foto"><i class="ti ti-photo" style="font-size:22px;color:var(--text-muted);" aria-hidden="true"></i></div>
    <div style="flex:1;min-width:0;">
      <p style="font-size:11px;color:var(--text-secondary);margin:0 0 2px;text-transform:uppercase;letter-spacing:.02em;">Quimivida</p>
      <p style="font-size:14.5px;font-weight:500;margin:0 0 4px;">Suplemento Quimivida Blend Premium 60caps</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;">
        <span class="chip">EAN<b>0789888395162</b></span>
        <span class="chip">SKU<b>SKU-QUIMIVIDA-01</b></span>
      </div>
    </div>
    <p style="font-size:13px;color:var(--text-secondary);margin:0;flex-shrink:0;">3 de 21 arquivos</p>
  </div>

  <div id="lista"></div>
</div>

<script>
const linhas = [
  {t:'Simples', arquivos:[{n:'Base',ok:true,icone:'ti-player-play'},{n:'Roteiro',ok:true,icone:'ti-file-text'},{n:'Completo',ok:true,icone:'ti-player-play'}]},
  {t:'Mensal 01', arquivos:[{n:'Base',ok:false,icone:'ti-player-play'},{n:'Roteiro',ok:false,icone:'ti-file-text'},{n:'Completo',ok:false,icone:'ti-player-play'}]},
  {t:'Mensal 02', arquivos:[{n:'Base',ok:false,icone:'ti-player-play'},{n:'Roteiro',ok:false,icone:'ti-file-text'},{n:'Completo',ok:false,icone:'ti-player-play'}]},
  {t:'Mensal 03', arquivos:[{n:'Base',ok:false,icone:'ti-player-play'},{n:'Roteiro',ok:false,icone:'ti-file-text'},{n:'Completo',ok:false,icone:'ti-player-play'}]},
  {t:'Mensal 04', arquivos:[{n:'Base',ok:false,icone:'ti-player-play'},{n:'Roteiro',ok:false,icone:'ti-file-text'},{n:'Completo',ok:false,icone:'ti-player-play'}]},
  {t:'Trimestral 01', arquivos:[{n:'Base',ok:false,icone:'ti-player-play'},{n:'Roteiro',ok:false,icone:'ti-file-text'},{n:'Completo',ok:false,icone:'ti-player-play'}]},
];
const lista = document.getElementById('lista');
lista.innerHTML = linhas.map((l, idx) => {
  const qtd = l.arquivos.filter((a) => a.ok).length;
  return `<div class="linha" data-idx="${idx}" onclick="toggle(${idx})">
    <div style="flex:1;min-width:0;">
      <p style="font-size:14px;font-weight:500;margin:0 0 3px;">${l.t}</p>
      <p style="font-size:12px;color:var(--text-secondary);margin:0;">${qtd} de 3 arquivos</p>
    </div>
    <div style="display:flex;gap:5px;flex-shrink:0;">
      ${l.arquivos.map((a) => `<div class="dot ${a.ok ? 'ok' : 'off'}"><i class="ti ${a.ok ? 'ti-check' : 'ti-minus'}" style="font-size:11px;" aria-hidden="true"></i></div>`).join('')}
    </div>
    <i class="ti ti-chevron-down" style="font-size:16px;color:var(--text-muted);" aria-hidden="true"></i>
  </div>
  <div class="painel">
    ${l.arquivos.map((a) => `<div class="filecard">
      <div class="thumb ${a.ok ? 'on' : 'off'}">
        <i class="ti ${a.ok ? a.icone : 'ti-plus'}" style="font-size:22px;color:${a.ok ? 'var(--text-accent)' : 'var(--text-muted)'};" aria-hidden="true"></i>
      </div>
      <div style="padding:8px 10px;">
        <p style="font-size:13px;font-weight:500;margin:0 0 5px;">${a.n}</p>
        <span class="pill ${a.ok ? 'ok' : 'off'}">${a.ok ? 'presente' : 'arraste aqui'}</span>
      </div>
    </div>`).join('')}
  </div>`;
}).join('');

function toggle(idx){
  document.querySelector(`.linha[data-idx="${idx}"]`).classList.toggle('aberta');
}
</script>
```

## Detalhes de comportamento que este mockup fixa

- **Linha colapsada** mostra só: título da fase/ocorrência, contagem "X de 3 arquivos", 3 pontinhos de status (verde com check = presente, cinza com traço = ausente) e uma seta — nada além disso. Nenhum ícone de mídia na linha colapsada (ver decisão de remoção acima).
- **Painel expandido** mostra os 3 arquivos daquela ocorrência lado a lado, sempre na ordem Base → Roteiro → Completo. Cada cartão tem sua própria miniatura: preenchida (cor de destaque, ícone de play pra vídeo ou de documento pro Roteiro) quando o arquivo existe; tracejada, com "+", quando não existe.
- **Cabeçalho do card do produto**: foto (placeholder — a versão real usaria a foto de catálogo do produto, se existir), marca, título, EAN e SKU como chips, e a contagem geral de arquivos do produto inteiro à direita.

## O que este mockup NÃO resolve (ainda em aberto)

Este mockup fixa só a APARÊNCIA da tela. As perguntas de comportamento/backend já registradas em [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]] continuam sem resposta — em especial como a pessoa chega a este card (escolhe o produto por busca? a tela lista vários desses cards?) e as 3 perguntas de design originais (pré-preencher Fase/Ocorrência, modal de substituição, onde a tela vive no menu).

A implementação real (Django view + template) que aplica este visual em cima dos dados reais do Drive — substituindo o rascunho atual — também ainda não foi escrita.

## Relacionado

- [[Checkpoint - Portal do Drive (Upload Manual de Video Real pra Marca-EAN-Videos)]]
- [[Convencao de Nomenclatura de Arquivos no Drive]]
