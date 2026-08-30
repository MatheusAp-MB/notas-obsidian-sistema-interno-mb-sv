---
tipo: decisao
dominio: 
status: resolvida
criado: 20/08/2026
atualizado_em: 20/08/2026 19:05
relacionado: [Contexto Geral - Retomada em Outro Computador (Integracao Sysemp), CST Perdia o Zero a Esquerda e Nao Suportava CSOSN, Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos]
---

# Correção de CST PIS e COFINS por NCM Fecha a Frente da Hidrolight e Outras Marcas

## O quê

Depois de resolver o sintoma da HIDROLIGHT (entrada manual das notas que faltavam — ver "Status anterior" em [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]), apareceram **outras marcas** com CST PIS e CST COFINS incorretos na planilha de impostos de entrada baixada do sistema. O time obteve, via consultas com a contabilidade, uma tabela de referência validada (NCM Cadastro → CST PIS/CST COFINS corretos) e usou um script Python de uso único pra corrigir a planilha diretamente, célula por célula, preservando toda a formatação existente.

## Por quê

O sistema tinha classificado CST PIS/COFINS errado pra produtos de marcas além da HIDROLIGHT — achado depois de revisar o relatório já enviado. Corrigir manualmente, linha a linha, numa planilha com centenas de linhas, seria lento e propenso a erro humano; a correção precisava ser automática, mas sem os riscos de um script comum: não podia gerar um arquivo novo (perderia a formatação da planilha original) e não podia alterar nada fora do que a tabela de referência efetivamente cobria.

## Pra quê

Fechar a frente de correção fiscal de CST PIS/COFINS para todas as marcas afetadas de uma vez, com a planilha final pronta para envio à contabilidade, mantendo a mesma formatação (cores, largura de coluna, formato numérico) que a equipe já usa.

## Como — metodologia do script de uso único

Entregue como texto na conversa (nunca como arquivo criado por Claude — regra deste domínio, ver [[Regras de Colaboracao no Repositorio de Codigo (Branch Dev)]]), com 2 arquivos de entrada:

- **Tabela correta para seguir**: `Arquivos_RELATORIO_IMPOSTOS/Tabela_NCM_CORRETO.xlsx` — 3 colunas (`NCM (Cadastro)`, `CST PIS`, `CST COFINS`), obtida via consultas reais com a contabilidade.
- **Tabela a ser corrigida**: `Arquivos_RELATORIO_IMPOSTOS/Baixado_Relatorio_Impostos_Entrada.xlsx` — planilha baixada do sistema, com as mesmas 3 colunas por linha de produto/nota.

Fluxo do script:

1. Lê a tabela de referência via `pandas.read_excel`, monta um dicionário `{ncm_normalizado: (cst_pis, cst_cofins)}`, avisando se houver NCM duplicado com valores conflitantes.
2. Normaliza NCM pra string numérica de 8 dígitos (remove tudo que não é número, `zfill(8)`).
3. Normaliza CST preservando zero à esquerda — 2 dígitos pro CST normal, 3 dígitos pra CSOSN (Simples Nacional) — reaproveitando a mesma lição já documentada em [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]] (lá era bug de tipo `int` no model; aqui é o mesmo cuidado aplicado à leitura/comparação de planilha).
4. Abre a planilha a corrigir via `openpyxl.load_workbook()` (não `pandas.read_excel`+`to_excel`), localiza as colunas certas pelo cabeçalho, e para cada linha de dado: normaliza o NCM daquela linha, procura no dicionário de referência, compara o CST PIS/COFINS atual (normalizado) com o correto, e só sobrescreve `célula.value` quando o valor realmente muda.
5. Salva de volta no MESMO caminho (`workbook.save(caminho)`) — como o objeto `workbook` nunca é reconstruído do zero, toda a formatação original (cor, largura, formato numérico) é preservada.
6. Linhas cujo NCM não tem correspondência na tabela de referência ficam **intocadas** — nunca zeradas ou limpas — e são só contabilizadas para o resumo final impresso no console (nenhuma coluna nova é escrita na planilha).

> [!warning] Correção de rota no meio do caminho — versão rejeitada pelo usuário
> A primeira versão do script usava `pandas.to_excel()` pra salvar o resultado num arquivo NOVO (`..._CORRIGIDO.xlsx`), com uma coluna extra de status. O usuário rejeitou: *"não é pra editar direto no arquivo, não é pra gerar um novo arquivo se não eu perco a formatação. eu so preciso alterar valores."* Reescrito com `openpyxl` fazendo edição em-lugar, sem coluna extra — só os valores de CST PIS/COFINS que precisavam mudar foram tocados.

## Resultado real (execução do usuário, saída colada na conversa)

- 47 NCMs únicos carregados como referência.
- Aba usada na planilha a corrigir: `'Impostos de Entrada'`.
- **76 linhas corrigidas.**
- **527 linhas já estavam corretas** (nenhuma mudança necessária).
- **78 NCMs sem correspondência** na tabela de referência (lista completa fornecida pelo usuário) — inclui um valor anômalo, `'00000000'`, que sugere um NCM ausente/em branco em algum produto, não uma classificação fiscal real.

## Em aberto

> [!question] O que fazer com os 78 NCMs sem correspondência
> Perguntado ao usuário se vale compilar essa lista pra enviar de volta à contabilidade (pra confirmar se são NCMs válidos que só não estavam na tabela recebida, ou se ficar de fora é esperado). **Ainda não respondido** — o usuário seguiu direto pro pedido de atualização geral do vault. Não assumir que esse ponto está coberto pelo status geral "aguardando retorno da contabilidade" até confirmação explícita.

Também não decidido: se este script deve ser oficializado como parte permanente do pipeline `integracao_sysemp`/`impostos`, ou se continua sendo um utilitário pontual de uso único (uso mais provável, dado que a causa raiz do CST errado na origem não foi investigada nesta rodada — só corrigido o dado já baixado).

## Estado real

Planilhas geradas e corrigidas pelo usuário. Status atual, nas palavras do usuário (20/08/2026, 19:05): *"Sobre os impostos eu consegui corrigir o que precisava, e gerei todas as planilhas que precisava. o status atual é: AGUARDANDO RETORNO DO ESCRITÓRIO DE CONTABILIDADE."* — mesma categoria de bloqueio (retorno de terceiro externo) já registrada em [[Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos]].

## Relacionado

- [[Contexto Geral - Retomada em Outro Computador (Integracao Sysemp)]]
- [[CST Perdia o Zero a Esquerda e Nao Suportava CSOSN]]
- [[Pausa do Trabalho de Impostos de Entrada e Multi-Empresa - Foco Exclusivo em Agenda de Videos]]
