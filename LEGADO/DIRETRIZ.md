---
tipo: diretriz
status: ativo
criado: 16/07/2026
dominio: Sistema Interno Django
relacionado: [Sistema Interno MB/SV V2, Precificação, Qualidade de Código, Reforma POO]
---

# Diretrizes de Processo — Evitar Erro Bobo e Retrabalho (v2)

## Atualização importante — Diagrama de fluxo obrigatório

**REGRA NOVA, SEM EXCEÇÃO:** todo arquivo novo, toda correção, toda
reescrita — precisa vir acompanhada de um diagrama de fluxo ANTES do
código, exatamente como já era feito para mockup de tela. Motivo real:
a primeira classe reescrita em POO (`LinhaERP`/`ImportadorERP`) foi
direto pro código sem diagrama, e quebrou (`TypeError: unsupported
operand type(s) for /: 'float' and 'decimal.Decimal'`) — o erro só
apareceu rodando de verdade, quando um diagrama desenhado antes teria
ajudado a pensar no tipo de dado de cada passo antes de escrever.

Este ponto substitui a versão anterior da diretriz (item 6, "vale pra
dado, não só pra tela") — deixa de ser recomendação e vira regra sem
exceção.

## Contexto original

Nota criada após sessão longa de correção de bugs em cascata (unidade
de medida ERP, separação produto embalado/sem embalar, proteção contra
valores absurdos em cálculo de margem). Expandida após decisão de
reformar o projeto inteiro em POO ("o máximo possível de POO, sem
forçar 100%").

## 1) Estrutura de arquivo — ordem fixa

1. Imports
2. Constantes
3. Classes/funções aninhadas (quando fizer sentido — ver critério)
4. Processamento
5. Output

## 2) Critério de nomeação de método — regra de ouro

**"Se algo é sólido o bastante pra sabermos nomear, ele pode ser um
método independente. Se é abstrato demais a ponto de não sabermos
nomear, é sinal de que não é método — é parte de algo."**

Teste prático: termina a frase "Função Objetivo: ___" com um verbo +
substantivo claro, sem "e" no meio? Se sim, é método. Se só sai vago
("processa uma parte", "faz um pedaço do meio"), o método ainda não
terminou de se separar — ou não devia ter saído do método-pai.

Nomes devem ser o mais didáticos possível — preferir clareza a
brevidade (ex: `transformar_linha_em_produto`, não `processar`).

## 3) Função solta vs função/método aninhado — critério de decisão

- Reaproveitada em mais de 1 lugar → solta, no nível do módulo.
- Serve só a 1 processo específico → aninhada/método de uma classe.

Padrão de "funil": várias entradas possíveis convergem cedo pra 1
objeto único; daí em diante só esse objeto circula entre as funções/
métodos.

## 4) REFORMA EM POO — decisão estrutural (16/07/2026)

Decisão: migrar o projeto o MÁXIMO possível para POO, sem forçar
100% (não faz sentido virar classe algo que é só conta pura, sem
estado — essas continuam função solta, ex: `arredondar_para_90`
antes de ser incorporada como método).

**Regra de migração: "joga tudo e faz de novo"** — arquivo por
arquivo, sem medo de quebrar, sem se prender a "garantir que nada
quebre" ou "alterar só esse trecho". Pode excluir arquivo, reordenar
pasta, sem hesitar. Validação de que a reescrita está correta = rodar
e comparar o resultado numérico com o comportamento anterior (não
comparar código).

**Quando é objeto — critério confirmado pelo usuário:**
"Se os dados brutos estão agrupados numa tabela/estrutura com função
clara, é sinal de que aquilo é um objeto." Ex: toda linha de
importação de planilha (que hoje já é conceitualmente uma linha
"com função clara") deveria ser 1 classe.

**2 tipos de objeto no projeto, nomeados:**
1. Objeto de persistência (já existia, Django `models.Model`) —
   `Produto`, `VariacaoAnuncioMercadoLivre`.
2. Objeto de processo/domínio (novo, nunca salvo no banco, representa
   um cálculo ou transformação em andamento) — ex: `LinhaERP`,
   `ImportadorERP`, e as futuras `DimensoesEfetivas`,
   `FormulaPrecificacao`.

**Regra de composição vs herança:** preferir composição ("classe TEM
outro objeto dentro") sobre herança ("classe É UM tipo de outra").
Subclasse é pra comportamento diferente; instância nova é pra dado
diferente. Ex confirmado: NÃO criar `MargemMinima`/`MargemPadrao`/
etc. como subclasses — são a MESMA classe (`FormulaPrecificacao`),
instanciada 4 vezes com dado diferente (percentual-alvo), já que o
comportamento (a fórmula) é idêntico entre elas.

**Padrão de "quebrar em etapas menores":** sempre que um problema
grande puder ser quebrado em passos menores e nomeáveis, quebrar —
mesmo que resulte em mais de uma classe pra um único processo (ex:
`LinhaERP` cuida de 1 linha; `ImportadorERP` cuida do processo
inteiro — as 2 juntas, uma composta na outra).

## 5) Padrão de comentário obrigatório em classes e métodos

```python
# Função Objetivo: <frase curta, direta, sem textão>
class NomeDaClasse:

    # Função Objetivo: <frase curta>
    # Explicação em detalhe: <só quando precisar, aqui pode ser mais longo>
    def nome_do_metodo(self):
        ...
```

Nunca textão na primeira linha — a frase curta é pra escanear rápido;
o detalhe (quando existir) vem depois, separado.

## 6) Recursos de Python a adotar

- Dataclasses (estado agrupado que sempre anda junto)
- Enums (valor fixo repetido como string solta)
- Decorators (boilerplate repetido em vários arquivos)
- Aplicar de forma pontual, dentro de refactors já em andamento —
  nunca reescrever código estável só por estilo.

## 7) Testes automatizados (pytest)

Ainda não implementado. Começar pequeno, só nas partes puramente
matemáticas e já estáveis (`calculo_margem.py`, `goal_seek.py`, e as
novas classes de domínio conforme forem estabilizando).

## Como usar esta nota

Quando a sessão sentir que está "gerando código sem pensar" ou
"corrigindo por tentativa e erro", referenciar esta nota diretamente
— ex: "olha a regra do diagrama" ou "lembra o critério de nomeação de
método" — pra retomar o processo correto sem precisar reexplicar do
zero.